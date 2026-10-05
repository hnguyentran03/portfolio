A single-user Overwatch 2 scrim analytics app. Where Overwatch Stats logs individual competitive matches, this one ingests the per-map log files that the ScrimTime Workshop code writes through Overwatch's Workshop Inspector, parses every event into a local database, and builds per-map breakdowns of a scrim plus team, player, and hero trends across every scrim in a date range. It is a Next.js full-stack app on Drizzle ORM and PGlite (embedded Postgres), so it runs on one machine with no services to set up. A public copy runs against real Postgres with every player and team name pseudonymised, and any change a visitor makes lands in a private database cloned for them on the spot.

## Features

- Parses all 27 ScrimTime event types, including the high-volume damage, healing, and ability-use streams, and keeps the raw log alongside the parsed rows
- Scrim pages with a scoreboard, per-player per-10-minute rates, and a fight-grouped killfeed naming who engaged each fight first, with a CSV download
- Per-map charts: a tempo curve, ult advantage per fight, combos and counter-ults, initiation win rates, final blows by fight and role, and hero damage by round
- A Telemetry tab with damage by opposing hero, focus fire by role, and a matchup radar against the enemy in the same role
- Team overview with record, strongest and blind-spot maps and modes, and role balance; trends for win rate by map, hero picks against recorded bans, and ult economy over time
- Teamfight stats: fight, first-pick, first-death, and first-ult win rates, win rate when engaging first or when engaged, and per-hero ultimate and ability impact
- Player pages with per-10 stats, MVP score, play style, personal records, and a per-scrim chart
- Figures out which side was yours from player names it has seen before, asking only when it cannot tell
- Public demo with throwaway per-visitor sandboxes: reads come from a shared read-only snapshot, and the first write clones a fresh database that is reaped after two hours idle
- One-command snapshot push that anonymises a copy of the local database, verifies no real name survived, and swaps it in as the template every sandbox is cloned from
- Vitest unit tests against an in-memory PGlite and Playwright end-to-end tests, run by GitHub Actions on every push

## Implementation details

The interesting problems are the data itself. A ScrimTime log is a flat text file, one event per line, written only by the lobby host's game, and it is noisy: newer builds censor some values, some lines are malformed, and the same event can be logged twice. Everything above the parser has to be defined carefully enough that stats stay stable across that noise.

### Descriptor-driven parsing

Each line is `[timestamp] ,event_type,field,field,...`. Rather than one parser per event, a single descriptor table lists every event type's columns in log order, each with a kind (`text`, `real`, `integer`, or `position`) and `optional`/`nullable` flags. A generic coercer walks a line's fields against that descriptor, and the Drizzle schema defines one table per event type with matching column names, so one generic insert routine handles all 27 types. Inserts run in one transaction in chunks of 500 rows, and the raw file is written to disk only after the rows commit.

A sanitizer runs before coercion to absorb the Workshop's quirks.

| Quirk in the log | Rule |
|---|---|
| Newer builds censor the `kill` event type as `****` | Renamed back to `kill` |
| Any field containing `*` (a redacted name or number) | Replaced with `"0"` |
| `mercy_rez` lines with an empty field | Dropped entirely |
| Suicides and environmental kills logged with attacker team "All Teams" | Victim's team, name, and hero copied into the attacker slot |
| Map names like `Lijiang Tower (Lunar New Year)` or `NEON JUNCTION` | Variant suffix stripped and all-caps names title-cased, so seasonal variants count as one map |

A map is rejected as a duplicate when the same scrim already has a map with the same name, the same duration within a hundredth of a second, and the same set of player names.

### Deriving results and sides

The log never says who won or which team was yours. The winner is derived per game mode.

| Mode | Rule |
|---|---|
| Control, Flashpoint, Clash | Higher score |
| Escort, Hybrid | Score, then capture count, then whichever team's last capture had more time remaining |
| Push | Never derived; set by hand, which also writes the score |

Which side is "ours" is inferred from the roster. The app keeps the distinct player names seen on our side over the 20 most recently uploaded maps, and a side is chosen when it shares at least 3 names with that roster while the other side shares at most 1. Anything less decisive returns a 422 with both rosters, and the uploader asks the user to pick.

### Fights, ults, and tempo

Most of the analysis is built on two derived structures. Fights group counted kills separated by no more than 15 seconds, and a fight's winner is a strict majority of kills, null on a tie. Kills are classified as real kills, suicides, or environmental, and only real kills count toward fight outcomes while deaths always count against the victim. A fight's initiator is the earliest cross-team damage row from 10 seconds before its first kill through the end of the fight that does not fall inside the previous fight.

Ultimates are harder because the Workshop's `ultimate_id` is a per-player counter that can be malformed, so starts are never joined to ends by id. Instead a start pairs with the next `ultimate_end` for the same player at or after it, a start followed by another start from the same player within one second is dropped as a false cast (Kiriko logs start/end/start inside a second), and because the charge meter flickers at 100% and can log dozens of `ultimate_charged` events before one cast, the charge moment is the first charged event after the player's previous kept cast.

The tempo curve on the Charts tab turns those into one line. Every counted kill is worth ±1 and every kept ult cast ±0.5, ours positive, decaying with a 20-second half-life and sampled every second across the map, with fight spans shaded by winner behind it.

### Storage

PGlite runs Postgres in-process against a data directory, so the app needs no database server, and the same Drizzle schema and migrations target real Postgres when `DATABASE_URL` is set. Migrations run automatically on first connection, and the connection is cached on `globalThis` so Next.js hot reloads reuse one PGlite instance instead of reopening the data directory.

### Throwaway sandboxes

The app was designed as single-user with no accounts, so putting it on the internet raised a question: how do visitors try uploading and editing without trampling each other or the real data? The answer is sandbox mode, which turns on when the server has a Postgres URL and a template database name. Three kinds of database exist.

| Database | Role |
|---|---|
| `ow_template` | Never connected to directly, only cloned |
| `ow_public` | The shared read copy, opened with `default_transaction_read_only=on` so a stray write is refused by Postgres itself |
| `ow_sb_<id>` | One per visitor, cloned from the template with `CREATE DATABASE … TEMPLATE … STRATEGY = FILE_COPY` on their first write |

Reads go to the visitor's sandbox when their session cookie names a live one and to the public copy otherwise. Writes go through a separate accessor that creates the sandbox if needed, so the read path can never create one by accident. The sandbox id is 32 lowercase hex characters, validated before it is interpolated into a database name, which makes it the entire injection surface. Every page is forced dynamic (a test fails if one is added without it) so one visitor's sandbox never ends up cached into another's response. A registry caps live sandboxes at 20, evicting the least recently seen, throttles clones to 10 a minute, caps the maps one sandbox can hold, and a maintenance loop started at boot drops anything a previous process left behind and reaps sandboxes idle for two hours. A bar at the top tells visitors whether they are on the shared snapshot or in a private sandbox, with a Reset that drops their database and returns them to the snapshot.

### Anonymising the snapshot

Nothing in the public copy is permanent except the snapshot pushed from the local database, and that snapshot is real scrim data with teammates' and opponents' battle tags in it. The push script copies the local PGlite directory, extends a git-ignored alias map with a pseudonym for every new name (so pseudonyms stay stable across pushes), applies it, dumps the result with `pg_dump` over PGlite, and hands it to a restore step that promotes it to the template and rebuilds the public copy from it.

The sweep is schema-driven. Every text column in the schema is classified exactly once as a player column, a team column, or other text, and a test fails if a new column is added without a classification. Sentinels like `"0"` (a censored value) and the default labels "Team 1" and "Team 2" are never rewritten. Scrim names are free text that can contain any name, so they are rewritten in one alternation pass, longest name first, so a short real name inside an inserted pseudonym is not substituted twice. Before anything ships, a verifier checks that no real name survives in any name column, that no pseudonym collides with a real name, and that no real name of three or more characters survives inside scrim names or original filenames, masking every pseudonym occurrence first so a real name that only appears as a substring of its own pseudonym is not a false positive. ScrimTime filenames carry the team names, so they are blanked to `log.txt` before verification.

### Testing

Tests use the same database code path pointed at an in-memory PGlite. Each stats module has hand-built fixtures plus values pinned against the sample logs, and the anonymiser is tested against a PGlite instance seeded from a real log. The sandbox registry is tested against a fake backend (joining an in-flight create, eviction past the cap, a failed eviction that still serves the new sandbox), and an integration test runs the real clone-and-drop cycle against a Postgres service container in CI. A Playwright suite drives the built app through uploading logs and reading the map and team tabs.
