# Stage 01 — Foundation and contracts

**Status:** completed

**Dependencies:** explicit authorization to begin implementation

## Deliverable

A reproducible TypeScript development environment and agreed boundaries for data,
generated actors, deterministic randomness, template loading, and PDF output.

## Tasks

- [x] Choose maintained Node LTS and compatible pinned tooling; add package/lockfile.
- [x] Configure strict TypeScript, Vite, build and test commands.
- [x] Define definitions versus actor-instance types and validation strategy.
- [x] Define seeded RNG injection, batch seed behavior, and original-roll/swap model.
- [x] Define PDF byte interfaces independent of filesystem/browser APIs.
- [x] Document scripts/contracts for downstream stages and appropriate ignores.

## Completion gate

Tooling checks run successfully; contracts support character, retainer, pet, and
mount data without depending on legacy rendering. No misleading placeholder
feature is presented as complete.

## Verification evidence

- `npm install --package-lock-only` passed (46 packages audited, no vulnerabilities).
- `npm ci` passed (45 packages installed, 46 audited, no vulnerabilities).
- `npm run typecheck` passed with strict TypeScript settings.
- `npm test` passed with no test files; feature tests begin with implementation.
- `npm run build` passed and emitted relative asset URLs under `dist/`.
- `npm test` passed with 10 definition/actor envelope validation tests.
- `npm run typecheck` and `npm run build` passed for the model contracts.
- `npm test` passed with 34 validation, RNG/swap, derivation, and PDF contract tests.
- `npm run typecheck` and `npm run build` passed for the integrated contracts.
- `git diff --check` passed.
- 2026-09-12: `npm ci`, `npm test` (3 files, 34 tests), `npm run typecheck`,
  `npm run build`, and `git diff --check` passed. See the [completion
  handoff](../handoffs/2026-09-12-stage-01-completion.md).

## Completion

The completion gate passed: tooling checks succeed; the documented contracts
cover character, retainer, pet/familiar, and mount data independently of legacy
rendering; and the development page explicitly says generation is not
implemented. Downstream stages must follow [the durable contracts](../contracts.md).
