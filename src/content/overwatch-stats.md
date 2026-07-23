A full-stack web application for logging Overwatch competitive matches and analyzing performance over time. A Flask REST API over a SQLAlchemy data model serves a React + TypeScript dashboard where you can search any battle tag to explore win rates per hero, per map, and per role, drill into detailed stat breakdowns with per-10-minute rates, and view trends grouped by day, week, or month.

## Features

- Full match logging with enforced 5v5/6v6 team composition, role-locked hero swaps, and a two-ban-per-team cap
- AI scoreboard autofill: a Claude vision model reads a screenshot against a labeled hero-portrait reference grid and returns all ten players' heroes and stats as schema-validated structured output
- Player dashboard with overall, per-role, per-hero, and per-map win rates plus per-10-minute stat breakdowns and drill-down detail views
- Trend analysis of win rate and match volume grouped by day, week, or month, with ranked/unranked and team-size filters that survive a page refresh
- Labeled evaluation harness that scores hero-identification accuracy on real screenshots and calibrates the portrait crop without spending API calls
- Deployed on AWS Lightsail behind Caddy with automatic HTTPS

## Implementation details

The schema is built around a `MatchPlayer` row per hero a player used in a match, so hero swaps carry their own stat lines and every aggregate (hero win rates, map preferences, role splits) falls out of the same joins. Match entry enforces real game rules in the form itself: 5v5 requires exactly 1 Tank, 2 Damage, and 2 Supports per team while 6v6 caps Tanks at two, swaps are restricted to heroes of the primary hero's role, and bans are limited to two per team. Players are created automatically the first time a battle tag appears, filters persist across page refreshes via localStorage, and the whole thing runs on a single AWS Lightsail instance behind Caddy with automatic HTTPS.

### AI scoreboard autofill

Rather than typing in ten players' stat lines by hand, you can upload an end-of-match screenshot and have a Claude vision model fill the form. The interesting part is how the request is built: the model receives up to three images: a labeled reference grid of every roster hero's portrait, the screenshot itself, and a 3x-upscaled crop of just the hero-portrait column, extracted with calibrated fractional bounds and gated on the image's aspect ratio matching the match-summary card layout. The reference grid is composed offline by a script that downloads official portraits and prints each hero's exact name beneath its image, turning hero identification into a matching problem against named references instead of recall from training data. The prompt also encodes the scoreboard's structure (role icons mark each row as Tank, Damage, or Support) and forces the model to write down the visual features it actually sees in each portrait before committing to a hero name, with instructions to return an empty string rather than guess.

The response comes back through structured outputs validated against a Pydantic schema, so it is guaranteed parseable, and hero names are checked against the roster again on save. A small eval harness measures per-row hero-identification accuracy against labeled real screenshots, and can dump the portrait crops without any API calls to visually calibrate the crop bounds. Since every parse is a paid API call, the endpoint sits behind an in-memory sliding-window rate limiter — three calls per rolling 24 hours, with a refund when no model call was actually made — plus upload type and size checks.
