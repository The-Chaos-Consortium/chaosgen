# Chaos & Conquest generator development plan

**Status:** Approved direction; implementation underway.

## 1. Goal and scope

Replace the Python/Discord generator with a lightweight browser application and
a Node.js CLI sharing current rules data, generation logic, and PDF rendering.
The browser displays generated characters as HTML and downloads completed PDFs.
The CLI writes PDFs. Both work locally; the static application targets GitHub
Pages without an application server.

Confirmed rulings are in [decisions.md](decisions.md). Delivery is divided into
[stages](stages/README.md); partial completion is expected and tracked in
[status.md](status.md).

Included: all 20 backgrounds, current creation rules and traits, starting gear,
spell choices, background-granted companions, basic customization, three new PDF
templates, CLI batches, verification, and static deployment configuration.

Deferred: shopping, standalone hired help, accounts/cloud storage, campaign
management, advancement workflows, automated spell adjudication, and full
downtime/domain/combat simulation.

## 2. Existing implementation and migration safeguards

| Path | Existing responsibility |
| --- | --- |
| `chaosgen/character_class.py` | Backgrounds, equipment, talents, datasets |
| `chaosgen/character.py` | Character generation |
| `chaosgen/mixins.py` | Supplemental generation/data |
| `chaosgen/dice.py` | Dice rolling |
| `chaosgen/generate_pdf.py` | Legacy filling and PDF assembly |
| `chaosgen/bot.py`, `chaosgen/bot_commands.py` | Discord integration |

Initial inspection found user currency-label edits in `character_class.py` and
`bot_commands.py`. Preserve the intended pennies terminology. Reinspect the
working tree at every session; this observation is not a permanent status report.

Known defects to avoid porting: import-time random equipment, shared mutable
background lists, destructive serialization, companion stamina rerolled by
renderers, old level/HD/Skill fields, and fragile argument/template-path handling.

Keep supplied printable PDFs intact. Do not incorporate local credentials or
modify the sibling rules repository. Remove old code only after replacement
functionality is verified.

## 3. Rules authority and provenance

The rules checkout discovered during planning is `../chaos-and-conquest/docs/`.
Use repository-relative references, not machine-specific absolute paths.

| Markdown source | Relevant content |
| --- | --- |
| `character-creation.md` | Formulas, equipment defaults, identity, factions, traits |
| `backgrounds.md` | Roster, descriptions, grants, talents |
| `equipment.md` | Slots, weapons, armor, consumables, mounts |
| `hired-help.md` | Retainer generation and loyalty |
| `magic-spellcasting.md` | Books, examples, oracle, scroll context |
| `magic-items.md` | Tonic of Health |
| `how-to-play.md` | Supporting inventory, stress, corruption rules |

Record the actual source commit at extraction, source sections, and schema/rules
version. Commit normalized datasets so builds do not require a sibling checkout.
Preserve source attribution and CC BY-SA licensing information. Background-specific
grants override generic defaults where explicit; special NPC examples do not
override player equipment tables. Audit every background, not only known changes.

## 4. Architecture and contracts

Use strict TypeScript, Vite, plain HTML/CSS/DOM APIs, `pdf-lib`, a maintained Node.js
LTS release, and suitable TypeScript and browser test tooling. Pin tooling through
a lockfile. Runtime generation must work without external services.

Suggested implementation layout (to be created during implementation):

```text
data/                       # Versioned immutable JSON definitions and provenance
src/core/                   # Types, RNG, generation, derivations, validation
src/pdf/field-maps/          # Named fields and PDF-point rectangles
src/pdf/                    # Preparation, value mapping, rendering, assembly
src/web/                    # Browser input, HTML rendering, asset loading
src/cli/                    # Node argument parsing and filesystem adapter
scripts/                    # Reproducible template preparation/build helpers
templates/fillable/         # Derived blank forms; printable originals stay above
tests/                      # Core, PDF, CLI, browser checks and synthetic fixtures
```

Rules data contains no executable randomness. The core has no DOM, filesystem,
or PDF dependency. PDF code takes complete actor data and template bytes, returning
PDF bytes. Browser and Node adapters load assets and write/download output.
Rendering is deterministic for an actor and does not mutate or reroll it.

### Definition model

- Background: stable ID, d20 index, name, description, talent references, equipment
  grants, companion grants, source references.
- Item: stable ID, name, slots, trivial status, damage/armor/requirements/effects,
  quantity rules, and explicit alternatives versus receive-all grants.
- Spells: wording and provenance, with book contents or named scroll metadata.
- Companion definitions: distinct retainer, pet/familiar, and mount kinds, including
  fixed statistics or explicit roll formulas.

### Generated model

- Schema/rules version, seed, original rolls, choices, and optional attribute swap.
- Identity, background, faction, Novice rank, nine traits.
- Current/max attributes and stamina, corruption, currency, talents, inventory
  instances, books/scrolls, companions, notes.
- Inventory ownership and slot occupancy independent of printed sheet rows.
- Separate loyalty and morale. Mount capacity distinguishes ridden/unridden values.

Derive capacity, armor applicability, corruption maximum, and retainer loyalty
from the actor state. A swap must be applied to original rolls and update all
dependent values; repeated UI edits must not permit arbitrary chained swaps.

## 5. Character creation requirements

| Element | Current rule |
| --- | --- |
| STR, DEX, WIL | Independent 3d6; optional swap of two scores |
| Stamina | 1d6 |
| Inventory capacity | max(STR, 10) |
| Corruption | Starts 0; maximum WIL + 3 |
| Shared starting gear | Two Supplies, one torch, one dagger |
| Wealth | 6d6 × 10 silver pennies |
| Experience | Novice |
| Age | Chosen 18+, or 2d10 + 16 |
| Ancestry | Human assumption |
| Faction | Chaos, Law, or Balance |
| Traits | Physique, face, skin, hair, clothing, virtue, vice, speech, misfortune |

Import all nine d20 tables (180 entries). Suitable legacy name lists are optional
convenience data, not prescribed rules. Choose a default/randomization policy for
identity that the UI can edit; record it rather than implying it is mandatory.

### Background roster in d20 order

1. Roadwarden
2. Ranger
3. Bounty Hunter
4. Outlaw
5. Soldier
6. Knight
7. Duelist
8. Slayer
9. Exorcist
10. Warpriest
11. Initiate
12. Charlatan
13. Wizard's Apprentice
14. Warlock
15. Alchemist
16. Witch
17. Rat Catcher
18. Beggar
19. Grave Robber
20. Burglar

All 20 talent triplets matched at initial comparison. Revalidate against the
recorded source revision. Known equipment corrections include Ranger's short
sword, Bounty Hunter's pistol/poster quantity, Outlaw's hand crossbow, Soldier's
short spear, Duelist receiving both weapons and Ammo, Slayer's entire kit, trivial
items, Warlock's one-slot eyes, Alchemist's tonic, and Burglar's equipment benefits.

Encode numeric slots rather than placeholder strings. Apply current armor
restrictions and AV limits; distinguish owning armor from being able to wear it.
Preserve all granted gear even when over capacity, visibly explaining the excess
rather than deleting items or treating printed rows as carrying permission.

### Spells

Import 36 example spell names and the four-column d20 wording oracle. Offer a
random example, chosen example, or custom wording for granted starting grimoires.
A grimoire is two slots, holds six spells, and starts with one where granted.
Record Bless/Heal scroll names without assigning effects, parameters, or costs.
Do not gate general casting on legacy Mage archetype membership.

## 6. Starting companions

| Background | Companion | Output template |
| --- | --- | --- |
| Roadwarden | Riding horse | Mount |
| Knight | Squire and warhorse | Retainer and mount |
| Witch | Familiar | Retainer panel |
| Rat Catcher | Dog | Retainer panel |

Squire: role/background Squire; each attribute 3d6; stamina d6; ten slots; spear
with d6 damage; three distinct random talents sampled uniformly from the
deduplicated union of all background talents. No other background loadout.
Use employer WIL for loyalty. Do not automatically deduct a hiring fee.

Fixed companion values identified in the initial audit (verify against source):

| Companion | STR | DEX | WIL | Stamina | Morale |
| --- | --- | --- | --- | --- | --- |
| Familiar | 6 | 10 | 10 | 2 | 7 |
| Dog | 6 | 8 | 10 | 3 | 8 |
| Riding horse | 10 | 14 | 10 | 6 | 7 |
| Warhorse | 14 | 8 | 12 | 9 | 9 |

Familiar names should be ironic or absurd. Dog bite is d6; riding horse kick d6;
warhorse kick d8. Import mount travel, capacity, and abilities from equipment
rules: riding horse capacity 10 ridden/20 unridden; warhorse 5/15. Do not infer
capacity from the sixty printed mount inventory lines.

Employer WIL → loyalty / retainer maximum:
`3 → 4/1; 4–5 → 5/2; 6–8 → 6/3; 9–12 → 7/4; 13–15 → 8/5;
16–17 → 9/6; 18 → 10/7`.

## 7. Web behavior

Workflow: select/randomize background → generate → customize identity, traits,
applicable starting spell, and optional attribute swap → review → download PDF.

Display clear sections for statistics, talents, gear, spells, companions, and
capacity. Editing one field or exporting must not reroll unrelated values.
Recompute capacity, corruption maximum, armor restrictions, and squire loyalty
after swaps. Show progress/errors for PDF creation.

Use accessible labels, keyboard-operable controls, responsive styling, and safe
text insertion. Support site-root and nested-project asset paths. No persistence,
account, shopping, or backend is necessary for this release.

## 8. PDF preparation and rendering

Originals:

- `templates/Chaos and Conquest Character Sheet Printable.pdf`
- `templates/Chaos and Conquest Retainer Sheet Printable.pdf`
- `templates/Chaos and Conquest Mount Sheet Printable.pdf`

Inspected layouts: character has two landscape pages (front plus notes), retainer
has two panels on one landscape page, mount has one landscape page with sixty
inventory lines across three columns. Character/retainer originals were confirmed
unencrypted and without form fields. Inspect all originals again during preparation.

### Preparation

Check page dimensions, rotation, encryption, and fields. Add transparent borderless
AcroForm fields with stable names and appropriate multiline behavior using a
checked-in coordinate map in PDF points. Prefix retainer panel names. Preserve
originals and generate derivatives under `templates/fillable/` reproducibly.
Render debug samples and visually check every field region. Portrait editing is
outside scope; do not place an irrelevant text field over the portrait box.

### Filling and assembly

Populate current/max starting values, identity, Novice rank, currency, equipment,
talents, spells, and notes from the generated actor. Use character notes for
traits and fields absent from the front. Put squire talents in retainer notes.
For familiar/dog, label morale in notes and leave loyalty unused. Use mount morale
and type fields, with capacity/travel/attacks/abilities in notes. Unsupported animal
fields must not be filled with invented mechanics.

Order: character front and notes → retainer/pet page if needed → mount page if
needed. Flatten each filled sheet with generated appearances before merging to
avoid repeated field-name collisions. Blank derivatives remain editable.

Represent multi-slot gear consistently; separate trivial items from occupied
slots. Preserve overflow in notes/continuation pages rather than truncating. Use
a font strategy supporting expected names and custom wording. Long text and
unsupported characters must not silently disappear. Visual verification is
required, not merely successful file creation.

## 9. CLI contract

Proposed commands (not implemented yet):

```sh
chaosgen --background knight --output knight.pdf
chaosgen --count 5 --output-dir output/
chaosgen --all --output-dir output/
chaosgen --background witch --seed example --output witch.pdf
```

No arguments generates one random character. Validate background names/IDs,
positive batch sizes, and mutually exclusive options. `--all` creates one per
background. `--output` is single-character output; `--output-dir` writes one
assembled PDF per character. Seeded batches must be reproducible without making
every character identical. Define seed derivation in the core contract.

Resolve templates independently of current working directory, sanitize filenames,
avoid accidental collisions, and report errors with nonzero exit codes. Status
and paths are console output; generated character artifacts are PDFs.

## 10. Deployment and cleanup

GitHub Pages serves the build output, template bytes, and any bundled fonts.
Generation/filling happens locally in the browser. Configure CI checks and static
publication with relative/base-aware URLs. Configure GitHub Actions to test,
build, publish the Pages artifact, and deploy it from the default branch. Actual
hosting setup requires owner authorization; verify the deployable artifact locally
first.

After replacements pass: remove Python modules/dependencies, Discord modules,
bot environment examples, bot-specific Docker configuration, and unused legacy
`char-sheet.pdf`/`hireling-sheet.pdf`. Keep all new originals. Update ignores and
usage documentation. Review before removing unfamiliar/user-modified files.

## 11. Acceptance criteria

### Data and core

- All 20 backgrounds in correct order, all references valid, nine complete traits
  tables, and correct equipment/companion grants.
- Correct formulas, derived values, independent state, seeded reproducibility,
  and one optional two-score swap.
- Squire talents distinct and valid; companions and loyalty match rules.
- No random evaluation at import time or rendering time.

### PDF

- Every mapped field exists and all backgrounds export.
- Displayed/exported actor data agree; export does not mutate actors.
- Knight includes separate squire and mount sheets; Roadwarden uses mount sheet.
- Pet morale is not mislabeled as loyalty.
- Long content, multi-slot gear, appearances, and merging work correctly.
- Visually inspect Knight, Roadwarden, Witch, Warpriest, Duelist, and synthetic
  long-name/custom-spell examples; record results and any remaining limitations.

### Interfaces and release

- Web generation/editing/download and keyboard/mobile usability work.
- Nested-base production assets load, including PDFs/fonts, without runtime services.
- CLI defaults, all-background batches, invalid inputs, and outside-repo invocation work.
- Relevant type/build/test checks pass with recorded evidence.
- Legacy integration is removed and docs match working commands.
- Public changes contain no secrets, private notes, machine paths, or personal PDFs.

See individual stage documents for dependencies and incremental completion gates.
