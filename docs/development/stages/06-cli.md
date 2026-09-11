# Stage 06 — PDF-only CLI

**Status:** pending

**Dependencies:** Stages 03 and 05

## Deliverable

Node CLI producing one complete PDF per character with usable random defaults.

## Tasks

- [ ] Add command entry point and documented invocation/install workflow.
- [ ] Support background, count, all, seed, output, and output-dir options.
- [ ] Validate names, numbers, conflicts, and output-path semantics.
- [ ] Load packaged assets independently of current working directory.
- [ ] Sanitize filenames, avoid collisions, and report paths/errors appropriately.
- [ ] Verify default, individual, seeded batch, all-background, invalid-input, and
  outside-repository invocation cases.
- [ ] Document working CLI usage and limits.

## Completion gate

CLI output artifacts are filled PDFs, each including appropriate companions.
Failures have meaningful messages and nonzero exit status; batches are reproducible
without repeating the same seeded character accidentally.

## Verification evidence

Not run; implementation pending.

## Partial-work checkpoint

No work started. Next: argument/output contract implementation.
