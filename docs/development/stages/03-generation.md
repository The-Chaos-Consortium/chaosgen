# Stage 03 — Generation and customization

**Status:** pending

**Dependencies:** Stages 01 and 02

## Deliverable

Pure shared generation returning complete, stable character and companion data.

## Tasks

- [ ] Implement creation formulas, identity/traits, background grants, and spells.
- [ ] Implement seeded choices/quantities and independent inventory instances.
- [ ] Generate squire, familiar, dog, and mounts using confirmed rules.
- [ ] Implement one optional two-score swap against original rolls.
- [ ] Derive capacity, corruption, armor restrictions, and retainer loyalty.
- [ ] Validate customization without unrelated rerolls or state mutation.
- [ ] Test formula bounds, reproducibility, independence, all backgrounds, and
  squire talent uniqueness; include deterministic edge cases rather than flaky
  statistical assertions.

## Completion gate

All actor kinds and derived values are correct; rendering needs no further dice
rolls. Excess equipment is preserved and distinguishable from legal capacity.

## Verification evidence

Not run; implementation pending.

## Partial-work checkpoint

No work started. Next: implement formula and RNG tests against agreed contracts.
