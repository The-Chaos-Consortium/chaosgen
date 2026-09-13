# Handoff - Stage 08 PR review

**Date:** 2026-09-13

**Stage:** [Stage 08](../stages/08-delivery.md)

**Branch:** `docs/development-plan`

**State:** partial

## Accomplished

- Reviewed `origin/main...HEAD`, all branch commits, migration guidance, stage
  records, implementation, tests, workflow, and public documentation.
- Reopened Stage 08 and recorded the complete remediation backlog. No application
  or configuration issue was corrected during this review.
- Did not open a pull request because the branch did not satisfy the requested
  review-ready condition.

## Working tree and Git state

- The branch tip is pushed at `origin/docs/development-plan`.
- The reviewed `.example_env` deletion is included in this documentation and
  cleanup checkpoint.
- This handoff, `../status.md`, and `../stages/08-delivery.md` are the intended
  documentation changes from the review.

## Review findings

| Priority | Finding | Locations |
| --- | --- | --- |
| resolved | The obsolete Discord environment example remained in `HEAD`; its reviewed deletion is included in this follow-up checkpoint. | `.example_env`; `../stages/08-delivery.md`; `2026-09-13-stage-08-completion.md` |
| high | Browser and PDF inventory output discard rolled quantities for zero-slot items such as wanted posters and counterfeit coins. | `../../../src/web/main.ts:188`; `../../../src/pdf/rendering.ts:190` |
| medium | Faction is displayed and editable in the browser but omitted from PDF output while its export treatment remains an unresolved decision. | `../../../src/web/main.ts:203`; `../../../src/pdf/rendering.ts:112`; `../decisions.md` |
| medium | Generation accepts and validates configurable rules values but hard-codes attribute rolls, capacity minimum, corruption modifier, starting spell count, and retainer loyalty. | `../../../src/core/generation.ts:63`; `../../../src/core/character-creation.ts:25`; `../../../src/core/character-creation.ts:63`; `../../../src/core/character-creation.ts:80` |
| medium | The squire definition declares a ten-slot capacity, but the generated retainer actor cannot retain it. | `../../../src/core/definitions.ts:130`; `../../../src/core/generation.ts:181`; `../../../src/core/actors.ts:130` |
| medium | Counterfeit coins are marked zero-slot/trivial even though D11 requires unspecified starting bundles to occupy one slot. | `../../../data/rules-v1.json:164`; `../decisions.md` |
| medium | Fixed-size PDF fields can clip unrestricted names and custom spell wording without fitting, continuation, or input limits. | `../../../src/pdf/rendering.ts:52`; `../../../src/pdf/rendering.ts:224`; `../../../scripts/prepare-pdf-templates.mjs:61` |
| medium | Replacing the complete result after each browser edit disrupts keyboard focus. | `../../../src/web/main.ts:85`; `../../../src/web/main.ts:109` |
| medium | Character controls remain active during asynchronous PDF preparation, so the downloaded snapshot can disagree with the currently displayed character. | `../../../src/web/main.ts:57`; `../../../src/web/main.ts:135` |
| medium | Copyright, redistribution terms, and attribution for the supplied printable PDFs and published derivatives are not explicit. | `../../../templates/README.md`; `../../../README.md` |
| low | Rules validation accepts shuffled d20 tables, but generation indexes table arrays by position instead of `d20Index`. | `../../../src/core/rules-validation.ts:112`; `../../../src/core/generation.ts:166` |
| low | Generated-document validation accepts malformed original-roll provenance, including invalid dice and totals unrelated to dice. | `../../../src/core/validation.ts:147` |
| low | PDF template preparation derives filesystem paths from URL pathnames without decoding or platform-safe conversion. | `../../../scripts/prepare-pdf-templates.mjs:6` |
| low | Successful browser generation is not announced through the status region or focus movement. | `../../../src/web/main.ts:58`; `../../../src/web/main.ts:80` |
| low | The generic button hover color does not meet normal-text WCAG AA contrast with white text. | `../../../src/web/styles.css:27` |
| low | Public overview documents still describe the completed implementation as incomplete, conflicting with the stage records. | `../../../README.md:3`; `../../README.md:5`; `../README.md:3` |
| low | GitHub Actions use mutable major-version tags rather than reviewed commit SHAs. | `../../../.github/workflows/pages.yml:15`; `../../../.github/workflows/pages.yml:23`; `../../../.github/workflows/pages.yml:39` |
| low | Pages deployments have no concurrency guard for closely spaced pushes. | `../../../.github/workflows/pages.yml:27` |

## Verification

| Check/command | Result | Evidence or limitation |
| --- | --- | --- |
| `npm run typecheck` | passed | TypeScript reported no errors. |
| `npm test` | passed | 9 files and 75 tests passed; the findings identify uncovered behavior. |
| `npm run build` | passed | All three PDF assets were emitted; Vite reported the existing 505 kB JavaScript chunk warning. |
| `npm run chaosgen -- --all --seed pr-review-stage08 --output-dir <temporary-directory>` | passed | Generated 20 synthetic PDFs outside the repository. No new visual acceptance review was performed. |
| `git diff --check origin/main...HEAD` | passed | No branch whitespace errors. |
| `git diff --check` | passed | No working-tree whitespace errors. |

## Decisions and blockers

- Resolve the existing faction display/export interpretation queue before changing
  PDF behavior.
- Confirm template redistribution rights and attribution with the project owner;
  do not infer a license from the code or rules-data licenses.
- Automated checks passing does not close the findings above. Visual PDF review
  must be repeated for changes that affect field appearances or inventory output.

## Next steps

1. Correct zero-slot quantity preservation and the counterfeit-coin slot rule,
   with browser, generation, and PDF regression tests.
2. Align generation with its rules-document contract and retain squire capacity.
3. Resolve faction and template-license questions, then complete the remaining
   browser, PDF, validation, documentation, and workflow checklist.
4. Repeat all acceptance checks and review the complete branch before opening a
   pull request.
