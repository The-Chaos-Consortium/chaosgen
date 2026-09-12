# Rules data

`rules-v1.json` is the normalized, runtime-independent rules snapshot used by
the generator. `provenance-v1.json` records its source revision and licensing,
and `names-v1.json` preserves optional legacy convenience names. Builds and
runtime generation do not read the sibling rules checkout.

The adapted Chaos & Conquest rules text in this directory is licensed under
[CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). Credit:
Alexander Gomez and The Chaos Consortium. No source artwork is included.

## Normalization notes

- Items with an explicit slot count use that count. Explicitly trivial items
  use zero slots. Other items and textual kits use the general one-slot default
  from `equipment.md`.
- Outlaw headwear and the Beggar's bowl/cup are `choose-one` groups. Duelist
  weapons and the Slayer's complete kit are receive-all grants, matching the
  current background text rather than the legacy generator.
- The Burglar's shoes and cloak retain separate advantage effects and use one
  slot each because that background does not label them trivial.
- Background equipment remains owned by the character. Nothing is silently
  moved to a mount; allocation and ridden state are later user/generation
  choices.
- A starting grimoire has one selected spell, six-spell capacity, and all 36
  examples as selection options. Custom wording remains a Stage 03 choice.
- Scrolls record only the names Bless and Heal. They intentionally contain no
  effect, parameter, or cost data.
- Familiar and dog morale is distinct from retainer loyalty. Unsupported animal
  corruption fields are absent rather than inferred from printable sheets.
- The squire pool is the explicit deduplicated union of all background talents.
  Its attributes, stamina, and grant quantities are declarative roll formulas;
  loading the files never rolls dice.
