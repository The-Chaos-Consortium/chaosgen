# Handoff - stage 01: tooling baseline

**Date:** 2026-09-11

**Stage:** [Stage 01](../stages/01-foundation.md)

**Branch:** `docs/development-plan`

**State:** partial

## Accomplished

- Selected Node 24 LTS and npm 11.11.0 in `.nvmrc` and `package.json`.
- Added exact dependency versions and generated `package-lock.json`.
- Added `.npmrc` to preserve exact dependency pinning.
- Added `node_modules/` to `.gitignore` without altering the legacy application.
- Updated `docs/development/AGENTS.md` to require commits for completed, verified
  checkpoints while keeping pushes and pull requests explicitly authorized.

## Working tree and Git state

- The checkpoint includes `.nvmrc`, `.npmrc`, `package.json`, `package-lock.json`,
  the Node section of `.gitignore`, and Stage 01 status docs.
- The macOS metadata section of `.gitignore` predated this work and was preserved
  in the checkpoint.
- The checkpoint is committed but not pushed.

## Verification

| Check/command | Result | Evidence or limitation |
| --- | --- | --- |
| `npm install --package-lock-only` | passed | 46 packages audited; no vulnerabilities |
| `npm ci` | passed | 45 packages installed; 46 audited; no vulnerabilities |
| `npm pkg get name version private type engines packageManager dependencies devDependencies` | passed | Manifest contains the selected exact versions and Node engine range |
| `git diff --check` | passed | No whitespace errors |

## Decisions and blockers

- This checkpoint follows the approved TypeScript, Vite, Vitest, and pdf-lib
  direction in [the plan](../plan.md) and [decisions](../decisions.md).
- No blocker was found. Runtime and test configuration is intentionally deferred
  to the next Stage 01 task.

## Next steps

1. Add strict TypeScript and Vite configuration plus build and test commands.
2. Verify type checking, a production build, and the test runner before completing
   the second Stage 01 checkbox.
