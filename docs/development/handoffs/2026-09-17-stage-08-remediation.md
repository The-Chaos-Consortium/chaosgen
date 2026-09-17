# Handoff - Stage 08 remediation checkpoint

**Date:** 2026-09-17

**Stage:** [Stage 08](../stages/08-delivery.md)

**Branch:** `docs/development-plan`

**State:** complete

## Accomplished

- Preserved rolled quantities for zero-slot browser and PDF inventory output.
  Slotted PDF rows retain their D13 singular item labels.
- Corrected Charlatan counterfeit silver coins to the source-backed one-slot,
  non-trivial classification.
- Made generation and customization consume character-creation and retainer
  loyalty rules definitions, including spell counts, and retained squire capacity.
- Resolved trait values by recorded d20 index and strengthened roll provenance
  validation for IDs, dice, and totals.
- Fitted printable long names and custom spell wording, verified the synthetic
  long-text sample visually, and used file-URL-safe template paths.
- Preserved focus through browser edits and locked controls while a PDF snapshot
  is prepared.
- Added a polite successful-generation status announcement and a WCAG AA-safe
  generic button hover color.
- Recorded D15 and exported faction in character PDF notes; public documentation
  now describes the implemented application.
- Recorded D16 and D17. The copyright holders authorize distribution through
  this repository and GitHub Pages while restricting end-user sale or
  redistribution of generated PDFs.
- Pinned Pages workflow actions to reviewed commits and added deployment
  concurrency.

## Verification

| Check/command | Result |
| --- | --- |
| `npm run typecheck` | passed |
| `npm test` | passed: 9 files, 82 tests |
| `npm run build` | passed; Vite reports the existing JavaScript chunk-size warning. |
| `npm run prepare:pdf-templates -- --debug` | passed: generated all three synthetic debug forms. |
| `npm run generate:pdf-review-samples` | passed: generated six synthetic samples. |
| Visual PDF review | passed: long name wraps and long custom spell wording is visible. |
| `git diff --check` | passed |
| Final acceptance | passed: typecheck, 82 tests, build, 20-PDF all-background CLI batch, and required six-sample visual review. |

## Remaining external action

- After review and merge, select GitHub Actions as the repository Pages source
  and observe the first deployment from `main`.
