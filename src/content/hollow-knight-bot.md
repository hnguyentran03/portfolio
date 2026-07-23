A PPO agent that fights Hornet (Hall of Gods, Attuned) inside the actual game, with no emulator or pixel input. A custom C# mod runs inside Hollow Knight and exposes a TCP bridge: the trainer sends button presses, the mod holds them for one 67 ms tick, samples the game state (positions, velocities, HP, SOUL, Hornet's FSM state), and replies. The agent decides at 15 Hz among 21 discrete moves, and because buttons stay held across repeated steps, jump height, healing, and nail-art charging are all emergent behaviors.

The mod drives every episode reset itself: from a fresh boot it navigates the title menu, stands up from the Hall of Gods bench, runs to the statue, and starts the fight with no human input. On the Python side, a Gymnasium environment wraps the bridge, and a supervisor layer makes training fault-tolerant end to end. It launches and owns the game process, reconnects through resets, and relaunches the game if it wedges or crashes, so an overnight run survives anything short of a power cut.

Training scales to multiple game instances in parallel, each a slot of the same vectorized PPO with its own copy-on-write app clone for save isolation and a keepalive pinger to hold connections through lockstep gaps. A web dashboard tracks every run (learning curves, win rate, steps/hour, ETA) and can start, resume, and stop training itself. Checkpoints every 15k steps mean a crash never loses more than about 17 minutes of progress.

## Features

- C# game mod with a TCP bridge that runs the real game in 67 ms lockstep with the trainer
- Fully automated episode resets: the mod boots the game from title screen to boss fight with no human input
- Fault-tolerant training supervisor that relaunches crashed or wedged game processes and resumes mid-run
- Multi-instance training with per-instance save sandboxes (APFS copy-on-write app clones) for roughly N-times sample throughput
- Web dashboard that launches, monitors, and stops runs, with per-generation learning curves and live episode rewards
- Checkpointed "generations" with full resume (weights plus observation-normalization stats) and replay of any checkpoint
