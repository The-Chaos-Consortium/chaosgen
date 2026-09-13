# Decisions and rules interpretations

## Confirmed by the project owner

| ID | Decision |
| --- | --- |
| D01 | Replace Python with TypeScript shared by the browser and a Node.js CLI. |
| D02 | Use a lightweight HTML-based web UI with basic customization. |
| D03 | Initial scope covers new characters and their background-granted companions, not standalone hired help or shopping. |
| D04 | Remove Discord integration and its references from the application. |
| D05 | Target GitLab Pages; character and PDF generation run in the browser. |
| D06 | Use the new character, retainer, and mount printable PDFs; mounts use the dedicated mount sheet. |
| D07 | Starting scrolls need names only. The Arbiter defines effects, parameters, and costs later. Never require these for generation. |
| D08 | A squire has role/background Squire and three random talents from the entire pool of the 20 backgrounds; do not give it another background/loadout. |
| D09 | The CLI generates filled PDFs. |
| D10 | Develop incrementally with staged documentation and handoffs; preparing this documentation does not authorize implementation. |

## Approved plan defaults

- Squire talents: sample three distinct talents uniformly from a deduplicated
  pool, rather than weighting common talents by repeated background appearances.
- Use Vite, plain TypeScript/HTML/CSS, and `pdf-lib`.
- Preserve printable originals and build fillable derivatives.
- Default completed PDFs are flattened and print-ready; blank derivatives remain
  fillable.
- Familiar/dog use retainer panels with morale explicitly in notes, not loyalty.
- Do not automatically deduct a squire hiring fee from starting wealth.
- Keep all granted gear recorded even if it exceeds carrying capacity.

## Interpretation queue

Resolve these while auditing sources, before encoding an unsupported assumption:

- Initial allocation of gear between character and mount; ridden/unridden state.
- Any animal corruption fields not explicitly supported by rules. A printed box
  is not evidence of a rule; leave unsupported fields blank and document why.
- Faction display/export treatment, given the rules' advice to keep it private.
- Legacy archetype terminology: do not use it to gate mechanics without support
  in current rules.

Check general equipment rules and background-specific text first. Escalate
remaining questions when they materially affect statistics or equipment legality.
The scroll and squire questions are resolved and should not be reopened without
new conflicting information.

## Source-backed interpretations

| ID | Status | Decision | Source / rationale | Affected stages | Supersedes |
| --- | --- | --- | --- | --- | --- |
| D11 | confirmed | Explicit slot counts and trivial labels control when present; otherwise a starting item or bundled textual kit occupies one slot. Clothing is zero-slot only when its background explicitly labels it trivial. | `equipment.md`, Items & Equipment establishes one slot as the general default and `backgrounds.md` repeatedly marks exceptions as trivial. This preserves the source's distinction between the Outlaw/Grave Robber cloaks and the Burglar's separately beneficial cloak and shoes. | 02, 03, 05, 07 | — |
| D12 | confirmed | Completed generated PDFs remain editable with clear, borderless AcroForm fields; do not flatten them. Each occupied inventory row shows only its item text, with multi-slot items repeated in each occupied row. | Owner review of Stage 05 samples. This supersedes the approved-plan default to flatten completed PDFs. | 05, 06, 07 | approved plan default |
| D13 | confirmed | A multi-slot item's occupied rows show its singular item name, not an aggregate quantity. Zero-slot gear is labeled `<item> - trivial`. Retainer loyalty fields show only the loyalty score, not the retainer maximum. | Owner review of Stage 05 samples. | 05, 06, 07 | — |

## Recording future decisions

Append a stable ID, status (`proposed` or `confirmed`), concise decision, source
section or owner ruling, rationale, affected stages, and any superseded decision.
Keep historical decisions visible when superseded rather than silently rewriting
their meaning.
