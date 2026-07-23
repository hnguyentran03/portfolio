Adapted from the CMU 15-112 Tetris homework and rebuilt with object-oriented design, then extended with a scoreboard, a next-piece preview, piece holding, and an outline showing where the current piece will drop.

The headline feature is an AI player that simulates every possible move and picks the best one using a heuristic. The heuristic ideas are based on the well-known near-perfect Tetris player, with the weights tuned by a custom genetic algorithm. Scores persist between sessions in an application data folder.

## Features

- Object-oriented rebuild of the 15-112 Tetris base
- Scoreboard with scores persisted between sessions
- Next-piece preview, piece holding, and drop outline
- AI that simulates all possible moves and picks the best via a heuristic
- Custom genetic algorithm to tune the AI's heuristic weights
