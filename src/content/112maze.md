A 15-112 term project: a maze game that uses raycasting to render 3D visuals. The objective is to collect a key and reach the end of the maze, with key and enemy placements randomized on every run. Difficulty increases as you progress, with longer mazes built with different maze-generation algorithms and enemies driven by different pathfinding algorithms. A toggleable minimap, a path-hint that reveals the way to the next objective, and full camera controls round out the game.

## Features

- 3D visuals rendered with per-column DDA raycasting
- Multiple maze-generation algorithms as levels progress: recursive DFS, randomized Prim's, and randomized Kruskal's
- Enemies driven by different pathfinding algorithms (recursive DFS and BFS)
- Path hints to the next objective and a toggleable minimap
- Randomized key and enemy placement every run

## Implementation details

### Rendering with DDA raycasting

The 3D view is drawn one vertical strip at a time. For every column of the screen, a ray is cast from the player through the camera plane, and a Digital Differential Analysis (DDA) walk finds the first wall it hits. Instead of inching the ray forward in small fixed steps (which is slow and can tunnel straight through wall corners), DDA exploits the fact that the maze is a uniform grid: from the ray's direction it precomputes how far the ray travels between consecutive x-gridlines and between consecutive y-gridlines, then repeatedly jumps to whichever gridline crossing is nearer. Each iteration advances exactly one cell, so the ray visits every cell it passes through and a hit can never be missed, no matter how thin the wall.

When the ray lands in a wall cell, the perpendicular distance to the wall, rather than the raw Euclidean distance, sets the height of the wall slice for that column, which avoids the fisheye distortion you'd otherwise get at the edges of the screen. Walls hit on an x-gridline are shaded differently from walls hit on a y-gridline, giving the corridors a cheap but convincing sense of depth. Since the cost is one DDA walk per screen column regardless of maze size, the renderer stays fast even as later levels grow.

### Maze generation

Each maze is a grid of cells that starts fully walled, and a generation algorithm decides which walls to knock down. All three produce a perfect maze (every cell reachable, exactly one path between any two cells), but each has a distinct character, so the level's algorithm changes how the maze feels to navigate:

- **Recursive DFS (recursive backtracker)**: walks from cell to random unvisited neighbor, carving as it goes, and backtracks up the recursion stack when it dead-ends. The depth-first bias produces long, winding corridors with relatively few branches.
- **Randomized Prim's**: grows the maze outward from a starting cell, repeatedly picking a random frontier wall and carving into the unvisited cell behind it. The result branches heavily, with lots of short dead ends off a bushy core.
- **Randomized Kruskal's**: treats every cell as its own set, shuffles the full list of interior walls, and removes a wall only when the cells on either side belong to different sets (tracked with union-find, which also guarantees no cycles). Because walls are considered in uniformly random order, the texture is even across the whole maze rather than biased toward any starting point.

### Enemy pathfinding

Enemies chase the player by pathfinding through the same grid, and different enemies run different algorithms:

- **Recursive DFS** finds *a* route to the player quickly, but not necessarily a short one. These enemies take meandering, unpredictable paths through the maze.
- **BFS** explores outward level by level, so the path it returns is guaranteed shortest, so these enemies beeline for the player, making them the more dangerous of the two.
