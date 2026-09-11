# Stage 01 — Foundation and contracts

**Status:** pending

**Dependencies:** explicit authorization to begin implementation

## Deliverable

A reproducible TypeScript development environment and agreed boundaries for data,
generated actors, deterministic randomness, template loading, and PDF output.

## Tasks

- [ ] Choose maintained Node LTS and compatible pinned tooling; add package/lockfile.
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

Not run; implementation pending.

## Partial-work checkpoint

No work started. Next: inspect project tooling and agree contract details.
