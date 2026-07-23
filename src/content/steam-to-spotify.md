A five-step wizard that turns Steam playtime into a soundtrack playlist. Enter a Steam ID (SteamID64, vanity name, or profile URL) and the app pulls every game played past an adjustable threshold, searches Spotify for each one's official soundtrack, and hands you a shareable playlist or a copyable track list with Spotify links.

Since Spotify has no official-soundtrack flag, a custom scoring heuristic ranks candidate albums, favoring exact-title official releases while disqualifying covers, tributes, and 8-bit/piano rearrangements. An interactive review step lets you pick multiple albums per game (base OST + DLC), exclude games, or search manually when the auto-match isn't confident.

Built to be resilient: one bad match never sinks the batch, Spotify calls are cached in SQLite, and known Spotify development-mode restrictions have explicit fallbacks. Playlist creation works for anonymous users via a bot-account refresh token, with no database and no user login.

## Features

- Imports a Steam library from a SteamID64, vanity name, or profile URL and filters by playtime
- Heuristic soundtrack matching that scores and ranks Spotify albums, rejecting covers and rearrangements
- Interactive review step to pick multiple albums per game, exclude games, or manually search Spotify
- Exports one track, the top 5, or the full album per release as a copyable list or a real public Spotify playlist
- Per-game error degradation, SQLite-backed caching, and rate limiting for resilience
