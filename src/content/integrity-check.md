A command line tool that verifies the integrity of files by computing cryptographic hashes with SHA-256 and comparing them against a stored baseline. It accepts either a single log file or an entire directory, and clearly reports any discrepancies that indicate possible file tampering.

The tool works in three modes: init computes and securely stores the hashes of the given file or directory, check re-computes them and compares against the stored baseline, and update re-initializes the baseline after intentional changes.

## Features

- Accepts a single file or an entire directory as input
- Computes SHA-256 hashes and stores them securely on first use
- Reports discrepancies that indicate possible file tampering
- init / check / update commands for initializing, verifying, and re-baselining hashes
