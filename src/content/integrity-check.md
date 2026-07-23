A Rust command-line tool that detects file tampering by fingerprinting files with SHA-256 and comparing them against a stored baseline. It accepts either a single log file or a whole directory, and works in three modes: `init` computes and stores the hashes of every file given, `check` re-computes them and reports per file whether it is unchanged or has been modified, and `update` re-baselines after intentional changes.

## Features

- `init` / `check` / `update` subcommands for baselining, verifying, and re-baselining
- Accepts a single file or an entire directory of files as input
- SHA-256 digests computed incrementally through a buffered reader
- Baseline persisted in a SQLite database keyed by file path
- Per-file verdicts on check: unchanged, modified, or missing from the baseline (an error, not a pass)
- Library/binary split with an integration test suite run against tempdir-isolated fixtures

## Implementation details

The CLI is built on clap's derive parser, and every fallible step carries an `anyhow` context, so failures surface as readable chains ("could not open file X") rather than bare I/O errors. Hashes are computed by streaming each file through a buffered reader into an incremental SHA-256 hasher, so a file is never loaded into memory whole; the digest accumulates as bytes come off disk and is finalized into a hex string at the end.

### The SQLite baseline

Rather than a flat text file, the baseline lives in a local SQLite database with a single `file_hashes` table mapping each file's path (the primary key) to its hex-encoded digest. The schema is created idempotently on every open (`CREATE TABLE IF NOT EXISTS`), so `init`, `check`, and `update` all work against a fresh or existing database without a separate setup step, and loading an empty baseline simply yields an empty map.

On `check`, the entire baseline is read into an in-memory map keyed by path, then each file on disk is re-hashed and looked up against it. A digest mismatch is reported as a modification; a file with no stored hash at all is treated as an error rather than silently passing, so an attacker can't evade detection by swapping in a file the baseline has never seen. `update` goes the other direction: it loads the stored map, recomputes the digest for each target file, and writes the merged result back.

The hashing, storage, and comparison logic all live in a library crate that the thin CLI binary calls into. That split makes the core testable in isolation: an integration test suite exercises the round trip (hash, store, load, compare, update) against temporary directories and scratch databases, including the tamper case where a file's contents change between baseline and check.
