# Development agent guidance

Read this file explicitly when implementing this migration, including when code
changes are outside this directory. Its location does not automatically scope
these instructions to source files elsewhere in the repository.

## Starting work

- Read `README.md`, `plan.md`, `decisions.md`, and `status.md` in this directory.
- Read the selected stage and latest relevant handoff.
- Inspect branch, `git status`, and relevant diffs before changing files. Existing
  changes and newly supplied templates may be user work.
- Work on an agreed stage or a clearly recorded subset of one. Do not assume the
  entire migration should be completed in one session.
- Mark the stage in progress and record the next concrete deliverable.
- Check dependencies before claiming a stage is ready. Parallel work must agree
  on shared contracts; delegation requires applicable user/instruction approval.

## Implementation boundaries

- The approved plan and recorded user decisions govern scope.
- Keep rules data, pure generation, PDF rendering, and platform adapters separate.
- Never roll dice during rendering or mutate shared rules definitions.
- Preserve supplied printable PDFs; create fillable derivatives reproducibly.
- Do not alter the sibling rules repository during this migration.
- Ask about material rules gaps rather than silently inventing mechanics.
- Update decisions when the owner resolves a question; distinguish proposals
  from confirmed rulings.

## Verification and handoff

- Run checks appropriate to the change and stage acceptance criteria.
- Record actual commands/results, including skipped checks and reasons. Do not
  mark a stage complete merely because code exists.
- PDF acceptance requires visual inspection as well as structural checks.
- On a partial stop, leave completed checkboxes accurate, list blockers, and
  identify exact files and the next actionable step in a handoff.
- Update `status.md` and the stage document together. Do not duplicate long logs.
- Keep public handoffs technical: no private conversations, local identity data,
  secrets, absolute home paths, or real character/player data.

## Public repository and Git

- Never stage everything indiscriminately. Review intended paths and staged diff.
- Do not commit credentials, `.env` contents, OS metadata, dependency directories,
  private notes, or generated personal PDFs. Use synthetic data for fixtures.
- Do not include machine-specific paths or private service details in docs.
- Commit, push, and open PRs only when explicitly requested. Creating a branch
  alone does not authorize any of those actions.
- Follow repository commit conventions; do not add AI co-author trailers.
- Keep implementation and its documentation changes reviewable in small units.
