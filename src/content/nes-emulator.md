A Nintendo Entertainment System emulator written in Rust. It emulates the 6502 CPU, the picture processing unit (PPU), the audio processing unit (APU), and the standard controller, and shows the picture in an SDL2 window with sound through SDL2 audio. It plays iNES 1.0 cartridges that use mapper 0 (NROM), which covers early titles like Super Mario Bros. and the bundled homebrew Alter Ego, and the whole thing is about 8,000 lines of Rust with 248 unit tests. Alongside the full game loop there are two smaller modes: a snake demo that runs a 6502 program straight out of CPU RAM, and a static viewer for a ROM's CHR tiles. Prebuilt binaries for macOS, Windows, and Linux are published with each release.

## Features

- Complete official 6502 instruction set (151 opcodes) with base cycle counts, page-crossing penalties, and all three hardware interrupts (reset, NMI, IRQ)
- PPU with the full register set, cycle and scanline timing, nametable mirroring, palettes, 8x8 sprites with flips, and OAM DMA
- Mid-frame scroll splits, so a status bar stays fixed while the playfield scrolls underneath it
- Sprite-zero hit detection, which is the signal Super Mario Bros. waits on before it scrolls
- APU with all five channels (two pulse, triangle, noise, DMC), the frame counter, the NES's non-linear mixer, and both IRQ sources, sampled at 44.1 kHz
- The audio queue paces emulation, with a vsync fallback when no audio device can be opened
- Standard controller 1 with the strobe and shift-out protocol, mapped from the keyboard
- Nintendulator-style per-instruction trace log for diffing against known-good CPU logs
- 248 unit tests across every module

## Implementation details

### Data flow

A `.nes` file is parsed into a `Rom`, the ROM is wrapped in a `Bus`, the bus is handed to the CPU, and from then on the CPU drives everything. After every instruction the CPU ticks the bus by that instruction's cycle count, the bus ticks the APU once per CPU cycle and the PPU three times per CPU cycle, and the rest of the system hangs off callbacks that fire at three different granularities.

```
.nes file ──► Rom ──► Bus ──► CPU ──► run()
                       │
          ┌────────────┼────────────┐
          │            │            │
         PPU          APU        Joypad
     (3 per cycle) (1 per cycle)  ($4016)
```

| Callback | Fires | Used for |
|---|---|---|
| Gameloop (`FnMut(&PPU, &mut Joypad)`) | once per frame, on the rising edge of the vblank NMI | rendering the PPU into a frame buffer, uploading it to an SDL texture, polling keyboard events into the joypad |
| Audio (`FnMut(&[f32])`) | when the PPU finishes its last scanline | queueing that frame's samples into the SDL audio queue |
| Per-instruction | before every instruction | the snake demo's input and screen, and the trace log |

The bus and CPU both carry a lifetime so the closures can borrow SDL objects (the canvas, texture, and event pump) from the enclosing scope instead of moving them into global state.

### The bus is the memory map

A `Mem` trait with `mem_read` and `mem_write` is implemented by both the CPU, which delegates to its bus, and the bus itself, which is the real address decoder. Every memory access in the emulator goes through this trait, and the bus's match arms are the authoritative CPU memory map.

| Range | Device |
|---|---|
| `$0000-$1FFF` | 2 KiB RAM, mirrored every `$800` |
| `$2000-$2007` | PPU registers, mirrored every 8 bytes up to `$3FFF` |
| `$4000-$4013` | APU channel registers |
| `$4014` | OAM DMA: copies CPU page `$NN00-$NNFF` into sprite memory |
| `$4015` | APU status: enables channels and acknowledges the DMC and frame IRQs |
| `$4016` / `$4017` | controller 1 / APU frame counter |
| `$8000-$FFFF` | PRG ROM, with a 16 KiB bank mirrored into both halves |

One deliberate choice: accessing a register in the wrong direction panics instead of returning open bus. Reading a write-only PPU register, writing the status register, or writing to PRG ROM is treated as an emulator bug to be found loudly, not a no-op to be silently absorbed.

### The CPU loop and the opcode table

The opcode table is a flat list of 151 rows of `(name, code, bytes, cycles, addressing mode)`, folded into a `HashMap` once under `lazy_static!`. It is the single source of truth for instruction size and base cycle count, so the dispatch `match` in the CPU only names which handler runs for which byte. Operand decoding is centralised in one function keyed on the addressing mode, which returns the effective address and whether a page boundary was crossed, so each instruction handler is mode-agnostic and adds the page-crossing cycle itself.

The run loop is: service a pending NMI (which takes priority) or IRQ (only while the I flag is clear), run the callback, fetch and look up the opcode, dispatch, then tick the bus. After dispatch the program counter advances by `bytes - 1` only if the handler did not change it, which is how branches and jumps set the PC directly without a second code path. All three interrupts share one descriptor (vector, break-flag mask, cycles) and one `interrupt()` routine that pushes the PC and status, sets the I flag, ticks the bus, and loads the vector.

`BRK` is the one intentional deviation from hardware: it halts the run loop instead of vectoring through `$FFFE`. Around 60 CPU tests and the snake demo load a program, run it until `BRK`, and inspect the registers, so that halt convention is load-bearing and replacing it means adding trap detection.

### Frame-at-a-time rendering with scroll splits

The PPU tracks 341 cycles per scanline and 262 scanlines per frame, sets the vblank flag and raises the NMI at scanline 241, and reports end of frame. The renderer, though, draws a whole frame at once from register state rather than one dot at a time, which is simpler and fast but creates a problem: games change the scroll register mid-frame. Super Mario Bros. keeps the status bar at the top still by leaving scroll at zero for the first 32 scanlines, then writing the camera position once the PPU is past them.

The solution is to record the writes. Whenever `$2005`, `$2000`, or a completed `$2006` pair is written during a visible scanline, the PPU appends a `ScrollSplit` holding the scanline and the full scroll state at that moment; writes on the same scanline collapse into one, and a write made during horizontal blank counts from the next scanline. The renderer then draws the background in horizontal bands, one per split, each starting at its own scroll position.

```
scanline 0   ┌──────────────────────────┐  frame_scroll, captured at scanline 0
             │ MARIO 000000   WORLD 1-1 │  status bar: scroll (0, 0)
scanline 31  ├──────────────────────────┤  sprite-zero hit, game writes $2005/$2006
             │                          │  ScrollSplit { scanline, state }
             │   playfield, scrolled    │
             │   to the camera X        │
scanline 239 └──────────────────────────┘
```

Each band fills from the base nametable and then from the nametables to the right, below, and diagonally, each resolved through the cartridge's mirroring mode, so under horizontal mirroring a horizontal scroll wraps onto the same table and vice versa. The scroll register also doubles as the PPU's internal "t" register: `$2000` sets its nametable bits, and a completed `$2006` pair overwrites the coarse X/Y, fine Y, and nametable. That last detail matters because SMB resets the PPU address to `$0000` during vblank, which on hardware also resets the nametable, and the status bar is drawn from the wrong table without it.

### Sprite-zero hit

The scroll split only works if the game knows when to write it, and SMB learns that from the sprite-zero hit flag: it parks sprite 0 under the status bar and spins on `$2002` until the PPU reports that an opaque pixel of sprite 0 overlapped an opaque background pixel. The emulator computes this once at the end of each visible scanline instead of per dot. It checks whether any opaque pixel of sprite 0 on that row (8x8 sprites only, flips honoured, and drawn one scanline below its OAM Y as on hardware) lands on an opaque background pixel under the current scroll, with both show bits set in the mask. So the flag fires on the first row where sprite 0 actually has an opaque pixel, not at its OAM Y, and that detail decides whether the split lands: SMB's sprite 0 sits at OAM Y 24, but its hit has to land at scanline 31 for the playfield to start in the right place.

### The APU

The APU owns two pulse channels, a triangle, a noise channel, a DMC, and the frame counter, and steps one CPU cycle at a time. Each cycle the frame counter returns a `FrameClock { quarter, half }` that is fanned out to the channels (quarter frames clock envelopes and the triangle's linear counter, half frames clock length counters and sweeps), the triangle, noise, and DMC timers clock every cycle while the pulse timers clock every other one, and every cycle's mixer output is averaged into the next 44.1 kHz sample, about 40.58 CPU cycles per sample. The mixer is nesdev's lookup-table form of the non-linear mixing curve. Channels share one shape (`write_to_register`, `clock_timer`, `clock_quarter_frame`, `clock_half_frame`, `set_enabled`, `is_active`, `output`), and the shared envelope, sweep, and length counter units are composed into them rather than duplicated. The sweep for pulse 1 is built with ones' complement negation, a hardware quirk that makes the two pulse channels differ by one in their downward sweeps.

The DMC is the awkward one, because it reads its samples from CPU memory and the APU lives inside the bus. Rather than handing it a pointer to the bus, the DMC exposes a fetch request, and the bus answers it within the same bus tick by reading the byte through its own memory map and handing it back, the same shape as OAM DMA. One request per tick is enough because the DMC's shortest period of 54 cycles exceeds any instruction. Both APU IRQ sources are level-held: the handler must read `$4015` to acknowledge the frame IRQ or write `$4015` to acknowledge the DMC's, or it is re-entered immediately, which is exactly what hardware does.

One faithful quirk: an idle APU is not silent. The triangle rests at step 0 of its sequence, so the mixer output carries a constant DC offset even with every channel disabled, as it does on a real console.

### Audio as the clock

With sound in place, the audio device became the clock. The game loop opens a mono `f32` SDL audio queue at the APU's sample rate and, after queueing each frame's samples, sleeps in 1 ms steps until the queue drains below its target depth. Because the APU produces a frame's worth of samples per frame, this holds emulation at real speed without any frame timer, and the canvas is built without vsync so the display never fights the audio for control.

| Constant | Value | Why |
|---|---|---|
| Sample rate | 44,100 Hz, mono `f32` | matches the APU's sampling |
| Device buffer | 512 samples | the granularity at which the device pulls |
| Queue target | 50 ms, or three device buffers if larger | enough slack to never underrun |
| Wait limit | 100 ms | a device that stops draining must not freeze the window |

If the wait limit expires with the queue still full the queue is cleared, so a stalled device costs a glitch rather than a hang. If no audio device can be opened at all, a warning is printed, no audio callback is set, and the canvas is built with vsync so the display paces emulation instead.

### Testing

All 248 tests live in `#[cfg(test)]` modules inside the file they cover. The CPU has 66 of them, most loading a tiny program into a 32 KiB NROM image and running it to `BRK`; the PPU has 36, including pinned sprite-zero cases (hit on the sprite's first opaque row, moved by a vertical flip, requires an opaque background pixel, requires both show bits, respects the scrolled background); the bus has 28; and the renderer 22. The APU's frame counter has its step cycle numbers (7457, 14913, 22371, 29829, and 37281 in 5-step mode) pinned in tests, and the DMC, pulse, triangle, noise, envelope, sweep, and length counter each have their own. For whole-program correctness, the trace module formats a Nintendulator-style log line (PC, opcode bytes, disassembly, registers, flags) per instruction so a run can be diffed against known-good CPU logs.
