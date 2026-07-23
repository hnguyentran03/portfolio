Adapted from the CMU 15-112 Tetris homework and rebuilt around an object-oriented core (a `Board` class and a `Piece` hierarchy that own their own legality checks, movement, and rendering), then extended well past the assignment: a 7-bag randomizer, next-piece preview, piece holding, a ghost outline showing where the current piece will land, level-based gravity, switchable color themes, a persistent scoreboard, and an AI player that can take over mid-game.

## Features

- Object-oriented rebuild of the 15-112 Tetris base, with 7-bag piece randomization and level-based gravity
- Next-piece preview, piece holding, and a ghost outline of the drop position
- AI autopilot that scores all 80 hold/column/rotation placements with a four-factor heuristic
- Heuristic weights tuned by a custom genetic algorithm with parallel game evaluation, crossover, and mutation
- High scores persisted between sessions in a per-OS application data folder
- Remappable controls loaded from a config file, plus two switchable color themes

## Implementation details

Gravity speeds up every five lines, and the scoreboard is written to a per-OS application data folder (APPDATA on Windows, Application Support on macOS). The headline feature is the AI player, toggled mid-game with a single key. Rather than teleporting pieces into place, it plays through the same rules a human does: each timer tick it rotates, shifts one column, or soft-drops the falling piece toward its chosen target, so watching it play looks like a very fast, very decisive human.

### Choosing a move

For every new piece, the AI enumerates the full placement space: hold or don't hold, times every column, times all four rotations, for 80 candidate moves on the 10-wide board. Each candidate is simulated on a deep copy of the board with a hard drop, and the resulting position is scored with a linear heuristic over four board statistics: lines cleared (rewarded), holes — empty cells buried under filled ones (penalized), bumpiness — the summed height difference between adjacent columns (penalized), and aggregate column height (penalized). The move with the best score wins. The four statistics come from the well-known "near-perfect Tetris player" write-up, but the weights do not.

### Tuning the weights with a genetic algorithm

The weights are evolved by a custom genetic algorithm in a separate headless version of the game that shares the real rules (same bag, hold, and scoring). Each generation, a population of weight vectors plays full games in parallel via a multiprocessing pool; the fittest parents survive, single-point crossover swaps one weight between parent pairs, and mutation nudges one random weight by up to half its value. Games also get longer as generations pass: the turn budget grows so surviving agents keep being tested on harder, longer runs. The shipped weights are the output of this process, and they diverge noticeably from the article's published values, most visibly a much heavier penalty on total stack height.
