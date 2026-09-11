# Stage 01 — Foundation and contracts

**Status:** in_progress

**Dependencies:** explicit authorization to begin implementation

## Deliverable

A reproducible TypeScript development environment and agreed boundaries for data,
generated actors, deterministic randomness, template loading, and PDF output.

## Tasks

- [x] Choose maintained Node LTS and compatible pinned tooling; add package/lockfile.
- [ ] Configure strict TypeScript, Vite, build and test commands.
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
- `git diff --check` passed.

## Partial-work checkpoint

Node 24, npm 11.11.0, TypeScript 7.0.2, Vite 8.3.0, Vitest 5.0.0, and
pdf-lib 1.17.1 are pinned in `package.json` and `package-lock.json`. See the
[tooling baseline handoff](../handoffs/2026-09-11-stage-01-tooling-baseline.md).
Next: configure strict TypeScript, Vite, build, and test commands.
