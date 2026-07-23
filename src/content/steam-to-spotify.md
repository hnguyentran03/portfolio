A Next.js web app that turns Steam playtime into a soundtrack playlist. Enter a Steam ID (SteamID64, vanity name, or full profile URL) and a five-step wizard pulls every game played past an adjustable hour threshold, matches each one to its official soundtrack on Spotify, and ends with a copyable track list or a real, shareable public playlist. The whole run lives in client state; each step calls one thin API route that validates input and delegates to a unit-tested `lib/` module.

## Features

- Imports a Steam library from a SteamID64, vanity name, or profile URL and filters by an adjustable playtime threshold
- Heuristic album scoring that favors exact-title official releases and disqualifies covers, tributes, and 8-bit/piano rearrangements
- Interactive review step to pick multiple albums per game, exclude games, or search Spotify manually
- Exports one track, the top 5 by popularity, or the full album per release as a copyable list or a real public Spotify playlist
- Per-item error degradation, fail-open SQLite caching, and single-retry budgets for expired tokens and rate limits
- HMAC-signed delete tokens let a playlist's creator remove it later with nothing stored on the server

## Implementation details

The hard part is that Spotify has no "official soundtrack" flag: a search for a game's OST returns the real release mixed in with covers, tributes, and piano rearrangements, so a custom scoring heuristic has to infer which album is the genuine one. The other constraint is that the app runs with no database and no user login, which forces some unusual design: playlists are created on a bot account for anonymous users, and deletion rights are handed out as signed capability tokens instead of server-side records.

### Matching without an OST flag

Each game name is first normalized, with trademark symbols dropped and stacked edition suffixes ("Game of the Year Edition", "Remastered", "Director's Cut") stripped in a loop, then searched twice on Spotify ("*name* original soundtrack" and "*name* soundtrack"). Every candidate album is scored against the game: containing the full game title scores highest, at least 80% token overlap scores a bit less, and anything below that is rejected outright. A strong OST keyword ("original/official soundtrack", including the "sound track" spelling FromSoftware uses) beats a weak one ("OST", "original score"), proper albums edge out singles, and every meaningful title token beyond the game's own name (sequel numbers, "Vol. 5", mod names) costs points, so the exact-title base release ranks first. A disqualifier regex zeroes covers, tributes, karaoke, and piano/lullaby/8-bit rearrangements no matter how well they match.

Candidates under a confidence floor are dropped, and any game whose top match isn't confident is flagged for attention on a review screen, where the user can pick multiple albums per game (base OST plus DLC), exclude games, or run a manual Spotify search. Selected albums then expand into tracks — one per game, the top 5 by Spotify popularity, or the full album — with a fallback to album order when Spotify's development-mode API withholds popularity data.

### Stateless by design

Spotify reads use an app-level client-credentials token, but that grade of token cannot create playlists, so a bot account authorizes the app once, and its OAuth refresh token lets the server publish public playlists on anonymous users' behalf. Since the host's compute instances are ephemeral and there is no database, the creator's right to delete their playlist can't be stored server-side: instead, the creation response includes an HMAC-signed delete token binding the playlist ID, verified later with a timing-safe comparison. The playlist route, being the one privileged write, also gets an Origin-based CSRF check and a per-IP rate limit that the read routes don't need.

Resilience follows the same philosophy throughout: one bad game never sinks a batch (match and track fetches degrade per item), Spotify responses are cached in SQLite with per-kind TTLs (a fail-open cache that turns any storage error into a miss), and expired tokens and 429s each get a single retry that honors Spotify's Retry-After header.
