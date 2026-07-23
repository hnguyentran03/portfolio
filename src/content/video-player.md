A vanilla-JS, no-build MPEG-DASH video player built on dash.js for experimenting with Adaptive Bitrate (ABR) algorithms. It plays any DASH manifest and lets you swap at runtime between custom ABR rules, including a BBA-0 / throughput hybrid, and dash.js built-ins like BOLA, L2A, and LoLP, rebuilding the player with the selected rule.

Network conditions are emulated for real: a service worker meters media-segment download bytes to a capped rate, so dash.js's throughput estimate genuinely reflects the cap and the ABR rules react to it. A variable-bandwidth mode drives the cap with a random walk to mimic real network congestion, and a live canvas strip chart plots throughput, the emulated cap, the playing bitrate, and buffer level over a rolling 60-second window with quality-switch markers and a hover crosshair.

## Features

- Plays any DASH manifest URL with the Sintel test stream as a default
- Switchable ABR rules at runtime: custom rules (BBA-0/throughput hybrid, lowest, highest) and dash.js built-ins (Throughput, BOLA, L2A, LoLP, and more)
- Real network emulation via a service worker that throttles segment downloads to preset caps from 300 kbps to 5 Mbps
- Variable-bandwidth mode that drifts the cap with a configurable random walk to simulate network congestion
- Live metrics chart sampling throughput, cap, playing bitrate, and buffer level every 500 ms with quality-switch markers and a hover crosshair
