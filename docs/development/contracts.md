# Stage 01 contracts

This document began as the Stage 01 boundary record and now summarizes durable
contracts for data, generation, PDF, CLI, and web work. Character generation and
PDF export are available as documented in the [project README](../../README.md).

## Working npm scripts

Run these from the repository root with the pinned Node/npm versions declared
in `package.json`.

| Command | Current behavior |
| --- | --- |
| `npm ci` | Reproduces the lockfile installation. |
| `npm run dev` | Starts the Vite development server for the browser generator. |
| `npm run build` | Runs `typecheck`, then creates the Vite production output in ignored `dist/`. |
| `npm run preview` | Serves an existing Vite production build for local preview. |
| `npm test` | Runs the Vitest contract tests once. |
| `npm run test:watch` | Runs Vitest in watch mode. |
| `npm run typecheck` | Runs strict TypeScript checking without emitting files. |
| `npm run chaosgen -- [options]` | Runs the PDF-only CLI. |
| `npm run prepare:pdf-templates` | Validates printable originals and recreates fillable derivatives. |
| `npm run generate:pdf-review-samples` | Creates ignored synthetic samples for visual PDF review. |

See the project README for supported CLI examples and `templates/README.md` for
the complete template-maintenance workflow.

## Data and actor boundary

- `src/core/definitions.ts` defines immutable, declarative rules definitions.
  Definitions record data, source references, and roll formulas; they do not
  evaluate randomness or become mutable generated state. Their normalized
  snapshots and provenance are maintained under `data/`.
- `src/core/actors.ts` defines generated actor snapshots and their generation
  record. A document carries `schemaVersion`, `rulesVersion`, `seed`, original
  rolls, choices, and an actor. Inventory ownership/slots remain actor state,
  not printed-sheet rows.
- Treat JSON, files, and other external values as `unknown`. The Stage 01
  envelope validators in `src/core/validation.ts` reject malformed top-level
  shapes and discriminate character, retainer, pet/familiar, and mount envelopes
  without coercion. `src/core/rules-validation.ts` deep-parses definitions, references,
  discriminants, d20 tables, quantities, and domain invariants before
  `src/core/rules.ts` exposes frozen rules and name documents. Do not cast an
  envelope result to `RulesDefinitionDocument` or `ActorSnapshot`.

## Randomness, provenance, and derivations

- Core generation receives an injected `RandomSource`; it must not select a
  global source, evaluate randomness at import time, or let renderers roll.
  `createSeededRandom` uses the specified UTF-8 FNV-1a/Mulberry32 stream solely
  for reproducibility, not security.
- Seeded batch items use `deriveBatchSeed(rootSeed, zeroBasedIndex)`. Its
  persisted `batch-v1/<index>/<utf16-length>:<root-seed>` form is stable:
  change the derivation only under a new batch version. A batch therefore
  reproduces while its items use distinct streams.
- `generation.originalRolls` is the single authority for creation rolls.
  `deriveCharacterCreation` starts from it every time. An attribute swap names
  two different attributes and replaces the previous swap; omitting it clears
  the swap. Never compose swaps or overwrite original rolls during an edit.
- The confirmed derivations are attribute current/maximum values,
  inventory capacity `max(STR, 10)`, corruption maximum `WIL + 3`, and the
  confirmed employer-WIL retainer loyalty table. Implementations derive these
  from current actor state after a swap and record any new rules ruling in
  `decisions.md` rather than inventing mechanics.

## PDF and platform boundary

- `src/pdf/contracts.ts` accepts a completed character document and supplied
  template bytes, then returns assembled PDF bytes. A renderer neither loads
  templates, writes/downloads output, rolls, nor mutates actor or template
  inputs.
- Character template bytes are always required. Retainers and pets use the
  retainer template; mounts use the mount template. Required assets are ordered
  character, retainer, mount, and must be present explicitly before rendering.
- `PdfTemplateByteSource` and `PdfByteSink` are platform adapters. Browser and
  Node code own fetching/filesystem/download behavior; the PDF layer has no
  DOM, filesystem, current-working-directory, or legacy-renderer dependency.
  Treat input bytes as read-only while rendering and keep returned bytes at the
  adapter boundary.

These contracts support character, retainer, pet/familiar, and mount data
without a legacy rendering dependency. See [Stage 01](stages/01-foundation.md)
for original completion evidence and [the plan](plan.md) for historical scope.
