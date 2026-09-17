import type {
  AttributeName,
  AttributeSwapRecord,
  CharacterActor,
  CompanionActor,
  GeneratedActorDocument,
  InventoryItemInstance,
  OriginalRolls,
  RecordedChoice,
  RecordedRoll,
  SpellBookInstance,
  TraitName,
  Traits,
} from "./actors.ts";
import { deriveCharacterCreation, deriveRetainerLoyalty, replaceAttributeSwap, rollOriginalAttributes } from "./character-creation.ts";
import type {
  BackgroundDefinition,
  CompanionDefinition,
  ItemGrantGroup,
  RulesDefinitionDocument,
  ValueDefinition,
} from "./definitions.ts";
import { rollDice, type RandomSource } from "./rng.ts";
import { names, rules } from "./rules.ts";

export interface GenerateCharacterOptions {
  readonly seed: string;
  readonly random: RandomSource;
  readonly backgroundId?: string;
  readonly faction?: CharacterActor["faction"];
  readonly age?: number;
  readonly name?: string;
  readonly startingSpells?: Readonly<Record<string, StartingSpellSelections>>;
  readonly rules?: RulesDefinitionDocument;
}

export type StartingSpellSelection = string | { readonly customWording: string };
type StartingSpellSelections = StartingSpellSelection | readonly StartingSpellSelection[];

export interface CharacterCustomization {
  readonly name?: string;
  readonly age?: number;
  readonly faction?: CharacterActor["faction"];
  readonly traits?: Partial<Traits>;
  readonly attributeSwap?: AttributeSwapRecord;
  readonly startingSpells?: Readonly<Record<string, StartingSpellSelections>>;
}

/** Generates a complete character snapshot using only the supplied random stream. */
export function generateCharacter(options: GenerateCharacterOptions): GeneratedActorDocument {
  const definition = options.rules ?? rules;
  const { characterCreation } = definition;
  const choices: RecordedChoice[] = [];
  const additional: RecordedRoll[] = [];
  const background = options.backgroundId === undefined
    ? choose(options.random, definition.backgrounds, choices, "background").value
    : requireById(definition.backgrounds, options.backgroundId, "background");
  const faction = options.faction ?? choose(options.random, characterCreation.factions, choices, "faction").value;
  assertFaction(faction, characterCreation.factions);
  const age = options.age ?? rollValue(options.random, characterCreation.randomAgeRoll, "identity.age", additional) + characterCreation.randomAgeBase;
  assertAge(age, characterCreation.minimumChosenAge);
  const generatedName = options.name ?? generateHumanName(options.random, choices, "identity");
  assertName(generatedName);
  const originalRolls: OriginalRolls = {
    attributes: rollOriginalAttributes(options.random, characterCreation.attributeRoll),
    additional,
  };
  const stamina = rollValue(options.random, characterCreation.staminaRoll, "stamina", additional);
  const wealth = rollValue(options.random, characterCreation.wealthRoll, "wealth", additional) * characterCreation.wealthMultiplier;
  const traits = generateTraits(options.random, definition, additional);
  const talents = background.talentIds.map((id) => requireById(definition.talents, id, "talent"));
  const inventory = generateInventory(
    options.random,
    definition,
    [...characterCreation.sharedEquipmentGrants, ...background.equipmentGrants],
    "character",
    additional,
    choices,
  );
  const spellBooks = background.spellBookDefinitionIds.map((id, index) => {
    const book = requireById(definition.spellBooks, id, "spell book");
    const selected = selectStartingSpells(options.random, book, options.startingSpells?.[book.id], choices, index);
    return {
      instanceId: `character:spell-book:${index}`,
      definitionId: book.id,
      name: book.name,
      ownerActorId: "character",
      occupiedSlots: slotsFor(book.slots, nextSlot(inventory)),
      capacity: book.capacity,
      spells: selected.map((selection) => spellFromSelection(selection, book.spellIds, definition, book.name)),
    } satisfies SpellBookInstance;
  });
  const derivations = deriveCharacterCreation(originalRolls, undefined, characterCreation);
  const actor: CharacterActor = {
    id: "character",
    kind: "character",
    name: generatedName,
    identity: { age, ancestry: characterCreation.ancestry },
    background: { id: background.id, name: background.name },
    faction,
    rank: "Novice",
    attributes: derivations.attributes,
    stamina: track(stamina),
    traits,
    corruption: { current: 0, maximum: derivations.corruptionMaximum },
    inventoryCapacity: derivations.inventoryCapacity,
    currency: { amount: wealth, unit: characterCreation.currencyUnit },
    talents: talents.map(({ id, name }) => ({ definitionId: id, name })),
    inventory: applyArmorEligibility(inventory, derivations.attributes.strength.current, background.talentIds, definition),
    spellBooks,
    scrolls: background.scrollDefinitionIds.map((id, index) => {
      const scroll = requireById(definition.scrolls, id, "scroll");
      return { instanceId: `character:scroll:${index}`, name: scroll.name, ownerActorId: "character", occupiedSlots: slotsFor(scroll.slots, nextSlot(inventory) + spellBooks.reduce((total, book) => total + book.occupiedSlots.length, 0)) };
    }),
    companions: generateCompanions(options.random, definition, background, derivations.attributes.willpower.current, additional, choices),
    notes: [],
  };
  return {
    schemaVersion: definition.schemaVersion,
    rulesVersion: definition.rulesVersion,
    seed: options.seed,
    generation: { originalRolls, choices },
    actor,
  };
}

/** Applies edits by rebuilding only values derived from persisted generation data. */
export function customizeCharacter(
  document: GeneratedActorDocument,
  customization: CharacterCustomization,
  definition: RulesDefinitionDocument = rules,
): GeneratedActorDocument {
  if (document.actor.kind !== "character") throw new TypeError("document actor must be a character");
  const actor = document.actor;
  const faction = customization.faction ?? actor.faction;
  assertFaction(faction, definition.characterCreation.factions);
  const age = customization.age ?? actor.identity.age;
  assertAge(age, definition.characterCreation.minimumChosenAge);
  const name = customization.name ?? actor.name;
  assertName(name);
  const derivations = deriveCharacterCreation(document.generation.originalRolls, customization.attributeSwap, definition.characterCreation);
  const background = requireById(definition.backgrounds, actor.background.id, "background");
  const spellBooks = actor.spellBooks.map((book) => customizeSpellBook(book, customization.startingSpells, definition));
  return {
    ...document,
    generation: replaceAttributeSwap(document.generation, customization.attributeSwap),
    actor: {
      ...actor,
      name,
      identity: { ...actor.identity, age },
      faction,
      traits: { ...actor.traits, ...customization.traits },
      attributes: derivations.attributes,
      corruption: { current: actor.corruption.current, maximum: derivations.corruptionMaximum },
      inventoryCapacity: derivations.inventoryCapacity,
      inventory: applyArmorEligibility(actor.inventory, derivations.attributes.strength.current, background.talentIds, definition),
      spellBooks,
      companions: actor.companions.map((companion) => companion.kind === "retainer"
        ? { ...companion, loyalty: deriveRetainerLoyalty(derivations.attributes.willpower.current, definition.retainerLoyalty) }
        : companion),
    },
  };
}

function generateTraits(random: RandomSource, definition: RulesDefinitionDocument, rolls: RecordedRoll[]): Traits {
  return Object.fromEntries(
    (Object.keys(definition.traitTables) as TraitName[]).map((trait) => {
      const result = rollValue(random, { kind: "dice", count: 1, sides: 20 }, `trait.${trait}`, rolls);
      const entry = definition.traitTables[trait].find(({ d20Index }) => d20Index === result);
      if (entry === undefined) throw new RangeError(`trait.${trait} has no d20 entry for ${result}`);
      return [trait, entry.value];
    }),
  ) as Traits;
}

function generateCompanions(random: RandomSource, definition: RulesDefinitionDocument, background: BackgroundDefinition, employerWillpower: number, rolls: RecordedRoll[], choices: RecordedChoice[]): readonly CompanionActor[] {
  return background.companionDefinitionIds.map((id, index) => {
    const companion = requireById(definition.companions, id, "companion");
    const actorId = `character:companion:${index}`;
    const attributes = attributesFor(random, companion, actorId, rolls);
    const stamina = rollValue(random, companion.stamina, `${actorId}.stamina`, rolls);
    if (companion.kind === "retainer") {
      const talentIds = sampleDistinct(random, definition.squireTalentIds, companion.talentSelectionCount, choices, `${actorId}.talents`);
      return { id: actorId, kind: "retainer", definitionId: companion.id, role: companion.role, name: generateHumanName(random, choices, `${actorId}.name`), attributes, stamina: track(stamina), inventoryCapacity: companion.inventoryCapacity, loyalty: deriveRetainerLoyalty(employerWillpower, definition.retainerLoyalty), talents: talentIds.map((talentId) => { const talent = requireById(definition.talents, talentId, "talent"); return { definitionId: talent.id, name: talent.name }; }), inventory: generateInventory(random, definition, companion.equipmentGrants, actorId, rolls, choices), notes: [] };
    }
    if (companion.kind === "pet") {
      const name = companion.petKind === "familiar" ? choose(random, names.ironicOrAbsurdFamiliar, choices, `${actorId}.name`).value : companion.name;
      return { id: actorId, kind: "pet", definitionId: companion.id, petKind: companion.petKind, name, attributes, stamina: track(stamina), morale: companion.morale, attacks: companion.attacks, notes: [] };
    }
    return {
      id: actorId,
      kind: "mount",
      definitionId: companion.id,
      name: companion.name,
      attributes,
      stamina: track(stamina),
      morale: companion.morale,
      ridden: false,
      capacity: companion.capacity,
      ...(companion.travel === undefined ? {} : { travel: companion.travel }),
      attacks: companion.attacks,
      abilities: companion.abilities,
      inventory: [],
      notes: ["Starting gear remains with the character; no automatic transfer to mount."],
    };
  });
}

function generateInventory(random: RandomSource, definition: RulesDefinitionDocument, groups: readonly ItemGrantGroup[], ownerActorId: string, rolls: RecordedRoll[], choices: RecordedChoice[]): readonly InventoryItemInstance[] {
  const selected = groups.flatMap((group, groupIndex) => group.kind === "receive-all" ? group.grants : [choose(random, group.grants, choices, `${ownerActorId}.grant.${groupIndex}`).value]);
  let nextSlotNumber = 1;
  return selected.map((grant, index) => {
    const item = requireById(definition.items, grant.itemId, "item");
    const quantity = rollValue(random, grant.quantity, `${ownerActorId}.item.${index}.quantity`, rolls);
    const occupiedSlots = slotsFor(item.slots * quantity, nextSlotNumber);
    nextSlotNumber += occupiedSlots.length;
    return { instanceId: `${ownerActorId}:item:${index}`, definitionId: item.id, name: item.name, quantity, ownerActorId, occupiedSlots, notes: [] };
  });
}

function attributesFor(random: RandomSource, definition: CompanionDefinition, id: string, rolls: RecordedRoll[]) {
  return Object.fromEntries((Object.keys(definition.attributes) as AttributeName[]).map((attribute) => [attribute, track(rollValue(random, definition.attributes[attribute], `${id}.attribute.${attribute}`, rolls))])) as CharacterActor["attributes"];
}

function applyArmorEligibility(inventory: readonly InventoryItemInstance[], strength: number, talentIds: readonly string[], definition: RulesDefinitionDocument): readonly InventoryItemInstance[] {
  const armorMaster = talentIds.includes("armor-master");
  return inventory.map((instance) => {
    const item = instance.definitionId === undefined ? undefined : definition.items.find(({ id }) => id === instance.definitionId);
    if (item?.armor === undefined) return instance;
    const requiredStrength = item.requirements?.find((requirement) => /^\d+\+ STR/.test(requirement));
    const minimum = requiredStrength === undefined ? 0 : Number.parseInt(requiredStrength, 10);
    return { ...instance, armor: { armorValue: item.armor, canWear: armorMaster || strength >= minimum } };
  });
}

function customizeSpellBook(book: SpellBookInstance, selections: CharacterCustomization["startingSpells"], definition: RulesDefinitionDocument): SpellBookInstance {
  const selection = selections?.[book.instanceId];
  if (selection === undefined) return book;
  const bookDefinition = book.definitionId === undefined
    ? undefined
    : requireById(definition.spellBooks, book.definitionId, "spell book");
  if (bookDefinition === undefined) throw new RangeError(`spell book definition is missing for ${book.name}`);
  const selected = Array.isArray(selection) ? selection : [selection];
  if (selected.length !== book.spells.length) throw new RangeError(`${book.name} requires ${book.spells.length} starting spell selections`);
  return { ...book, spells: selected.map((entry) => spellFromSelection(entry, bookDefinition.spellIds, definition, book.name)) };
}

function selectStartingSpells(random: RandomSource, book: RulesDefinitionDocument["spellBooks"][number], provided: StartingSpellSelections | undefined, choices: RecordedChoice[], bookIndex: number): readonly StartingSpellSelection[] {
  if (provided === undefined) {
    return Array.from({ length: book.startingSpellCount }, (_, spellIndex) => choose(random, book.spellIds, choices, `spell-book.${bookIndex}.${spellIndex}`).value);
  }
  const selected = Array.isArray(provided) ? provided : [provided];
  if (selected.length !== book.startingSpellCount) throw new RangeError(`${book.name} requires ${book.startingSpellCount} starting spell selections`);
  selected.forEach((selection, spellIndex) => choices.push({ id: `spell-book.${bookIndex}.${spellIndex}`, value: typeof selection === "string" ? selection : selection.customWording }));
  return selected;
}

function spellFromSelection(selection: StartingSpellSelection, allowedSpellIds: readonly string[], definition: RulesDefinitionDocument, bookName: string) {
  if (typeof selection !== "string") {
    if (selection.customWording.trim().length === 0) throw new RangeError("custom spell wording must be non-empty");
    return { name: "Custom spell", wording: selection.customWording };
  }
  if (!allowedSpellIds.includes(selection)) throw new RangeError(`spell is not available in ${bookName}: ${selection}`);
  const spell = requireById(definition.spells, selection, "spell");
  return { definitionId: spell.id, name: spell.name };
}

function rollValue(random: RandomSource, value: ValueDefinition, id: string, rolls: RecordedRoll[]): number {
  if (value.kind === "fixed") return value.value;
  const result = rollDice(random, value.count, value.sides);
  const total = result.total + (value.modifier ?? 0);
  rolls.push({ id, dice: result.dice, total });
  return total;
}

function choose<T>(random: RandomSource, options: readonly T[], choices: RecordedChoice[], id: string): { readonly value: T } {
  if (options.length === 0) throw new RangeError(`${id} has no choices`);
  const index = Math.floor(random.next() * options.length);
  if (!Number.isInteger(index) || index < 0 || index >= options.length) throw new RangeError("random source must return a finite value in [0, 1)");
  const value = options[index]!;
  choices.push({ id, value: typeof value === "string" || typeof value === "number" || typeof value === "boolean" ? value : index });
  return { value };
}

function generateHumanName(random: RandomSource, choices: RecordedChoice[], id: string): string {
  return `${choose(random, names.human.masculine, choices, `${id}.given-name`).value} ${choose(random, names.human.family, choices, `${id}.family-name`).value}`;
}

function sampleDistinct(random: RandomSource, options: readonly string[], count: number, choices: RecordedChoice[], id: string): readonly string[] {
  if (count > options.length) throw new RangeError(`${id} cannot select ${count} distinct values`);
  const remaining = [...options];
  return Array.from({ length: count }, (_, index) => {
    const selected = choose(random, remaining, choices, `${id}.${index}`).value;
    remaining.splice(remaining.indexOf(selected), 1);
    return selected;
  });
}

function requireById<T extends { readonly id: string }>(values: readonly T[], id: string, kind: string): T {
  const value = values.find((entry) => entry.id === id);
  if (value === undefined) throw new RangeError(`unknown ${kind}: ${id}`);
  return value;
}

function slotsFor(count: number, firstSlot: number): readonly number[] {
  return Array.from({ length: count }, (_, index) => firstSlot + index);
}

function nextSlot(inventory: readonly InventoryItemInstance[]): number {
  return inventory.flatMap(({ occupiedSlots }) => occupiedSlots).length + 1;
}

function track(value: number): { readonly current: number; readonly maximum: number } { return { current: value, maximum: value }; }

function assertAge(age: number, minimum: number): void { if (!Number.isInteger(age) || age < minimum) throw new RangeError(`age must be an integer of at least ${minimum}`); }
function assertName(name: string): void { if (name.trim().length === 0) throw new RangeError("name must be non-empty"); }
function assertFaction(faction: string, factions: readonly string[]): asserts faction is CharacterActor["faction"] { if (!factions.includes(faction)) throw new RangeError(`unknown faction: ${faction}`); }
