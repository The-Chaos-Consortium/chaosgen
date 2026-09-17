# Repository agent guidance

These instructions apply across the repository. The implementation is complete;
the staged migration documents under `docs/development/` are historical delivery
records, not an active migration checklist.

## Setup and checks

- Use `mise install` and `npm ci` for the pinned Node.js and npm toolchain.
- Run `npm run typecheck`, `npm test`, and `npm run build` before declaring a
  source or build change ready.
- Run focused PDF and CLI checks when those paths change. PDF acceptance requires
  structural checks and visual inspection of affected synthetic samples.
- Record commands actually run and disclose skipped checks or warnings.

## Architecture and data

- Keep rules data, pure generation, PDF rendering, and browser/Node adapters
  separate. Never roll dice during rendering or mutate shared rules definitions.
- Treat `data/*.json` as versioned rules snapshots. Preserve provenance and
  attribution, and do not modify a sibling rules repository as part of this work.
- Ask before inventing mechanics for a material rules gap. Record confirmed
  rulings in `docs/development/decisions.md`.
- Preserve the supplied printable PDFs. Recreate fillable derivatives through
  the documented scripts and retain their separate copyright terms.

## Repository hygiene

- Do not commit credentials, `.env` files, OS metadata, dependency directories,
  private notes, generated personal PDFs, or machine-specific paths.
- Use synthetic data in tests, fixtures, screenshots, and PDF review samples.
- Generated `dist/`, `output/`, `downloads/`, and `templates/debug/` content is
  ignored and must not be staged.
- Review intended paths and diffs rather than staging the whole worktree.
- Push, open a pull request, or change repository settings only when explicitly
  requested. Do not add AI co-author trailers.

## Development records

Read `docs/development/README.md` before changing historical contracts, decisions,
stage evidence, or handoffs. Keep dated records historically accurate; update live
indexes and current documentation instead of rewriting old checkpoint facts.
