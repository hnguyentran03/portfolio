A full-stack web application for logging Overwatch competitive matches and analyzing performance over time. A Flask REST API over a SQLAlchemy data model serves a React + TypeScript dashboard where you can search any battle tag to explore win rates per hero, per map, and per role, drill into detailed stat breakdowns, and view trends grouped by day, week, or month.

Match entry enforces real game rules: valid 5v5 and 6v6 team compositions, role-locked hero swaps, and per-team ban limits. An optional scoreboard autofill feature sends an end-of-match screenshot to a Claude vision model along with a labeled grid of hero portraits; the model identifies each player's hero and reads their stat line, filling the form automatically behind a rolling rate limit.

## Features

- Full match logging with enforced 5v5/6v6 team composition, role-locked hero swaps, and per-team ban limits
- AI scoreboard autofill, where a Claude vision model reads a screenshot and fills every player's hero and stats
- Player dashboard with overall, per-role, per-hero, and per-map win rates plus drill-down detail views
- Trend analysis of win rate and match volume grouped by day, week, or month
- Ranked/unranked and team-size filters that persist across page refreshes
- Deployed on AWS Lightsail behind Caddy with automatic HTTPS
