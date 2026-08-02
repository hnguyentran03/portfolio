A PPO agent that fights Hornet (Hall of Gods, Attuned) inside the actual game, with no emulator or pixel input. A custom C# mod runs inside Hollow Knight and exposes a TCP bridge: the trainer sends button presses, the mod holds them for one 67 ms tick, samples the game state (positions, velocities, HP, SOUL, Hornet's FSM state), and replies. The agent decides at 15 Hz among 21 discrete moves, and because buttons stay held across repeated steps, jump height, healing, and nail-art charging are all emergent behaviors.

## Features

- C# game mod with a TCP bridge that runs the real game in 67 ms lockstep with the trainer
- Fully automated episode resets that boot the game from title screen to boss fight with no human input
- Reward design that pays boss damage more than the win bonus itself and prices timeouts as losses
- Fault-tolerant training supervisor that relaunches crashed or wedged game processes and resumes mid-run
- Multi-instance training with per-instance save sandboxes (APFS copy-on-write app clones) for roughly N-times sample throughput
- Async resets that hide multi-second reset freezes behind placeholder steps masked out of learning
- Web dashboard that launches, monitors, and stops runs, with per-generation learning curves and live episode rewards
- Checkpointed "generations" with full resume (weights plus observation-normalization stats) and replay of any checkpoint

## Implementation details

### The mod and the lockstep bridge

```
┌─────────────────────────────┐                       ┌─────────────────────────────┐
│  trainer (Python)           │   action: 9 buttons   │  Hollow Knight + mod (C#)   │
│  RecurrentPPO · Gym env     │ ────────────────────► │  holds buttons one 67 ms    │
│  supervisor · dashboard     │ ◄──────────────────── │  tick, samples state,       │
└─────────────────────────────┘   state: obs + done   │  drives episode resets      │
                                                      └─────────────────────────────┘
```

The C# mod, loaded through the Hollow Knight Modding API, runs a TCP bridge inside the game and injects input through InControl, the input library the game itself uses, rather than synthesizing OS-level key events. Each decision is a two-phase cycle. The mod blocks for the next action, applies the nine buttons, holds them for one 67 ms window timed in unscaled seconds (immune to the hit-pause time-scale drops on nail impacts), then samples Knight and Hornet state once and replies. Sampling only after the hold keeps the Gymnasium contract honest, since the state returned for an action is never a cycle stale. The observation is 46 floats, 18 normalized scalars (positions, velocities, HP, SOUL, status flags, and Hornet's thrown needle) plus a 28-way one-hot of Hornet's active PlayMaker FSM state. There is no frame stacking, because the policy is a recurrent LSTM that carries its own temporal state.

Detecting the win turned out to be its own problem. The fatal blow's death sequence tears the boss GameObject down inside a single 67 ms hold window, so a polled check for zero boss HP never fires, and early runs reported zero wins despite full-damage episodes. Wins are instead latched from three signals, strongest first. A hook on the boss's death handler records the kill the frame it happens, the HP poll stays as a backstop, and the boss disappearing while the Knight lives and the arena scene persists covers the rest.

### The reward function

The reward is five legible terms summed per 67 ms step:

| Term | Value | When |
|---|---|---|
| Boss damage | +0.03 × HP removed | boss HP dropped this step |
| Taking a hit | −1.0 × masks lost | Knight HP dropped this step |
| Win | +10, plus +1 × masks remaining | episode ends with the boss dead |
| Loss | −5 | death, or timeout at 2,700 steps (~3 min) |
| Time penalty | −0.001 | every step |

The proportions do the shaping. A full kill's damage reward (+27 over Attuned Hornet's 900 HP) exceeds the win bonus itself, so aggression pays even in episodes that end in death, which gives the agent a dense gradient toward the win long before it ever gets one. A lost mask costs 1.0 immediately and, in an episode that would have been won, another 1.0 of forgone health bonus, so caution is priced in without making passivity attractive.

Timeouts are deliberately a loss, so running out the clock can never undercut committing to the fight. One nuance survives, though. The final step still reports `truncated=True`, so PPO bootstraps it with the discounted value of the last state, and the effective timeout terminal becomes −5 + γV rather than a flat −5. Once the value function turns positive mid-fight, timing out again edges out dying by exactly that bootstrap term, so the penalty narrows the stalling loophole rather than sealing it outright. Sealing it with a hard termination would teach the value function that identical mid-fight states are worth different amounts depending on an invisible clock.

### Automated resets and fault tolerance

The mod drives every episode reset itself. From a fresh boot it navigates the title menu, stands up from the Hall of Gods bench, walks to the Hornet statue, and starts the fight with no human input. Because menu and scene progress persist across connection drops, a roughly 25-second cold boot deliberately spans multiple reset budgets and ratchets forward across the trainer's reconnect retries. The timing constants form a load-bearing chain, and each inequality closes a specific failure mode.

```
keepalive 3 s  <  mod read timeout 10 s  <  reset budget 22.5 s  <  trainer socket timeout 30 s
```

On the Python side, a Gymnasium environment wraps the bridge, and a supervisor layer makes training fault-tolerant end to end. It launches and owns the game process, reconnects through resets, and relaunches the game if it wedges or crashes, so an overnight run survives anything short of a power cut. Checkpoints every 15k steps mean a crash never loses more than about 17 minutes of progress.

### Multi-instance training and async resets

Training scales to multiple game instances in parallel, each a slot of the same vectorized PPO with its own copy-on-write app clone for save isolation (two instances autosaving into one shared save slot corrupted a real save in testing) and a keepalive pinger to hold connections through lockstep gaps. Because the vectorized environment steps in lockstep, one slot's multi-second reset would freeze every sibling mid-fight. Resets therefore run on a background thread while the resetting slot feeds the policy an all-zeros placeholder observation, provably out of distribution since every real observation has exactly one hot bit in Hornet's FSM encoding. Placeholders are then excluded at every layer of the learning stack.

| Layer | Guard |
|---|---|
| Episode monitor | throwaway placeholder episodes dropped from all stats |
| Obs/reward normalization | running statistics updated from real rows only |
| PPO minibatches | indexed over real rows, so placeholders never touch the gradient |
| Rollout size | inflated ~23% so each update still sees a full real batch |

With those guards in place, a two-instance async run beat the single-instance baseline's reward in less wall clock. A web dashboard tracks every run (learning curves, win rate, steps/hour, ETA) and can start, resume, and stop training itself.
