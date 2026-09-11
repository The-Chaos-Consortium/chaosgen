# Stage 01 — Foundation and contracts

**Status:** in_progress

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
- [ ] Document scripts/contracts for downstream stages and appropriate ignores.

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

## Partial-work checkpoint

Seeded generation, batch seed derivation, original-based attribute swaps, confirmed
derived values, and platform-neutral PDF byte contracts are implemented and tested.
See the [RNG and PDF contracts handoff](../handoffs/2026-09-11-stage-01-rng-pdf-contracts.md).
Next: document downstream scripts/contracts and verify the Stage 01 completion gate.
