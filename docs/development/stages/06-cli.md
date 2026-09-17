# Stage 06 — PDF-only CLI

**Status:** completed

**Dependencies:** Stages 03 and 05

## Deliverable

Node CLI producing one complete PDF per character with usable random defaults.

## Tasks

- [x] Add command entry point and documented invocation/install workflow.
- [x] Support background, count, all, seed, output, and output-dir options.
- [x] Validate names, numbers, conflicts, and output-path semantics.
- [x] Load packaged assets independently of current working directory.
- [x] Sanitize filenames, avoid collisions, and report paths/errors appropriately.
- [x] Verify default, individual, seeded batch, all-background, invalid-input, and
  outside-repository invocation cases.
- [x] Document working CLI usage and limits.

## Completion gate

CLI output artifacts are filled PDFs, each including appropriate companions.
Failures have meaningful messages and nonzero exit status; batches are reproducible
without repeating the same seeded character accidentally.

## Verification evidence

| Check/command | Result |
| --- | --- |
| `npm run typecheck` | passed |
| `npm test` | passed: 8 files, 74 tests |
| `npm run build` | passed |
| `git diff --check` | passed |
| CLI default outside the repository | passed: generated one PDF from a temporary current directory |
| CLI individual output | passed: Knight PDF generated with `--output` |
| CLI seeded batch | passed: two distinct background PDFs generated with `--count 2` |
| CLI all backgrounds | passed: 20 PDFs generated with `--all` |
| CLI invalid input | passed: `--all --count 2` rejected with a nonzero exit status |
| External `pdfinfo` inspection | skipped: `pdfinfo` is not installed; renderer structural and visual checks remain recorded in Stage 05 |

## Partial-work checkpoint

Completed. Next: Stage 07 can consume the core generator and PDF renderer for
browser generation and download.
