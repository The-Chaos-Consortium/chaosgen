# Stage 01 — Foundation and contracts

**Status:** in_progress

**Dependencies:** explicit authorization to begin implementation

## Deliverable

A reproducible TypeScript development environment and agreed boundaries for data,
generated actors, deterministic randomness, template loading, and PDF output.

## Tasks

- [x] Choose maintained Node LTS and compatible pinned tooling; add package/lockfile.
- [x] Configure strict TypeScript, Vite, build and test commands.
- [ ] Define definitions versus actor-instance types and validation strategy.
- [ ] Define seeded RNG injection, batch seed behavior, and original-roll/swap model.
- [ ] Define PDF byte interfaces independent of filesystem/browser APIs.
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
- `git diff --check` passed.

## Partial-work checkpoint

Node 24 and the TypeScript/Vite/Vitest/pdf-lib toolchain are pinned. Strict
type checking, test, development, preview, and production build commands are
configured; the development page explicitly says generation is not implemented.
See the [tooling configuration handoff](../handoffs/2026-09-11-stage-01-tooling-configuration.md).
Next: define definition versus actor-instance types and the validation strategy.
