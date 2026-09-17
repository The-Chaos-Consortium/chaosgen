import type {
  NameDefinitionDocument,
  RulesDefinitionDocument,
  SourceReference,
} from "./definitions.ts";
import type { ValidationError, ValidationResult } from "./validation.ts";

const traitNames = [
  "physique",
  "face",
  "skin",
  "hair",
  "clothing",
  "virtue",
  "vice",
  "speech",
  "misfortune",
] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function error(errors: ValidationError[], path: string, message: string): void {
  errors.push({ path, message });
}

function record(
  value: unknown,
  path: string,
  errors: ValidationError[],
): Record<string, unknown> | undefined {
  if (!isRecord(value)) {
    error(errors, path, "must be an object");
    return undefined;
  }
  return value;
}

function array(
  value: unknown,
  path: string,
  errors: ValidationError[],
): readonly unknown[] | undefined {
  if (!Array.isArray(value)) {
    error(errors, path, "must be an array");
    return undefined;
  }
  return value;
}

function string(
  value: unknown,
  path: string,
  errors: ValidationError[],
): value is string {
  if (typeof value !== "string" || value.length === 0) {
    error(errors, path, "must be a non-empty string");
    return false;
  }
  return true;
}

function integer(
  value: unknown,
  path: string,
  errors: ValidationError[],
  minimum?: number,
): value is number {
  if (!Number.isInteger(value) || (minimum !== undefined && (value as number) < minimum)) {
    error(errors, path, minimum === undefined ? "must be an integer" : `must be an integer >= ${minimum}`);
    return false;
  }
  return true;
}

function stringArray(value: unknown, path: string, errors: ValidationError[]): readonly string[] {
  const values = array(value, path, errors) ?? [];
  return values.filter((entry, index): entry is string => string(entry, `${path}[${index}]`, errors));
}

function sources(value: unknown, path: string, errors: ValidationError[]): readonly SourceReference[] {
  const values = array(value, path, errors) ?? [];
  if (values.length === 0) error(errors, path, "must contain at least one source reference");
  const parsed: SourceReference[] = [];
  values.forEach((entry, index) => {
    const sourcePath = `${path}[${index}]`;
    const source = record(entry, sourcePath, errors);
    if (source && string(source.document, `${sourcePath}.document`, errors) && string(source.section, `${sourcePath}.section`, errors)) {
      parsed.push({ document: source.document, section: source.section });
    }
  });
  return parsed;
}

function valueDefinition(value: unknown, path: string, errors: ValidationError[]): void {
  const definition = record(value, path, errors);
  if (!definition) return;
  if (definition.kind === "fixed") {
    integer(definition.value, `${path}.value`, errors, 1);
    return;
  }
  if (definition.kind === "dice") {
    integer(definition.count, `${path}.count`, errors, 1);
    integer(definition.sides, `${path}.sides`, errors, 2);
    if (definition.modifier !== undefined) integer(definition.modifier, `${path}.modifier`, errors);
    return;
  }
  error(errors, `${path}.kind`, "must be one of: fixed, dice");
}

function d20Table(value: unknown, path: string, errors: ValidationError[]): void {
  const entries = array(value, path, errors);
  if (!entries) return;
  if (entries.length !== 20) error(errors, path, "must contain exactly 20 entries");
  const indexes = new Set<number>();
  entries.forEach((entry, index) => {
    const entryPath = `${path}[${index}]`;
    const row = record(entry, entryPath, errors);
    if (!row) return;
    if (integer(row.d20Index, `${entryPath}.d20Index`, errors, 1)) indexes.add(row.d20Index);
    string(row.value, `${entryPath}.value`, errors);
  });
  for (let index = 1; index <= 20; index += 1) {
    if (!indexes.has(index)) error(errors, path, `must contain d20 index ${index}`);
  }
}

function uniqueIds(
  values: readonly unknown[],
  path: string,
  errors: ValidationError[],
): ReadonlySet<string> {
  const ids = new Set<string>();
  values.forEach((entry, index) => {
    const definition = record(entry, `${path}[${index}]`, errors);
    if (!definition || !string(definition.id, `${path}[${index}].id`, errors)) return;
    if (ids.has(definition.id)) error(errors, `${path}[${index}].id`, `duplicate id: ${definition.id}`);
    ids.add(definition.id);
  });
  return ids;
}

function grants(
  value: unknown,
  path: string,
  itemIds: ReadonlySet<string>,
  errors: ValidationError[],
): void {
  const groups = array(value, path, errors);
  groups?.forEach((entry, groupIndex) => {
    const groupPath = `${path}[${groupIndex}]`;
    const group = record(entry, groupPath, errors);
    if (!group) return;
    if (group.kind !== "receive-all" && group.kind !== "choose-one") {
      error(errors, `${groupPath}.kind`, "must be one of: receive-all, choose-one");
    }
    const groupGrants = array(group.grants, `${groupPath}.grants`, errors);
    if (groupGrants?.length === 0) error(errors, `${groupPath}.grants`, "must not be empty");
    if (group.kind === "choose-one" && groupGrants && groupGrants.length < 2) {
      error(errors, `${groupPath}.grants`, "must contain at least two choices");
    }
    groupGrants?.forEach((grantValue, grantIndex) => {
      const grantPath = `${groupPath}.grants[${grantIndex}]`;
      const grant = record(grantValue, grantPath, errors);
      if (!grant) return;
      if (string(grant.itemId, `${grantPath}.itemId`, errors) && !itemIds.has(grant.itemId)) {
        error(errors, `${grantPath}.itemId`, `unknown item id: ${grant.itemId}`);
      }
      valueDefinition(grant.quantity, `${grantPath}.quantity`, errors);
    });
  });
}

function references(
  values: readonly string[],
  ids: ReadonlySet<string>,
  path: string,
  errors: ValidationError[],
): void {
  values.forEach((id, index) => {
    if (!ids.has(id)) error(errors, `${path}[${index}]`, `unknown id: ${id}`);
  });
}

/** Deeply validates all Stage 02 rules data before exposing it as a contract type. */
export function validateRulesDocument(input: unknown): ValidationResult<RulesDefinitionDocument> {
  const errors: ValidationError[] = [];
  const root = record(input, "$", errors);
  if (!root) return { success: false, errors };

  string(root.schemaVersion, "$.schemaVersion", errors);
  string(root.rulesVersion, "$.rulesVersion", errors);
  const talents = array(root.talents, "$.talents", errors) ?? [];
  const backgrounds = array(root.backgrounds, "$.backgrounds", errors) ?? [];
  const items = array(root.items, "$.items", errors) ?? [];
  const spells = array(root.spells, "$.spells", errors) ?? [];
  const spellBooks = array(root.spellBooks, "$.spellBooks", errors) ?? [];
  const scrolls = array(root.scrolls, "$.scrolls", errors) ?? [];
  const oracles = array(root.spellWordingOracles, "$.spellWordingOracles", errors) ?? [];
  const companions = array(root.companions, "$.companions", errors) ?? [];
  const talentIds = uniqueIds(talents, "$.talents", errors);
  const backgroundIds = uniqueIds(backgrounds, "$.backgrounds", errors);
  const itemIds = uniqueIds(items, "$.items", errors);
  const spellIds = uniqueIds(spells, "$.spells", errors);
  const spellBookIds = uniqueIds(spellBooks, "$.spellBooks", errors);
  const scrollIds = uniqueIds(scrolls, "$.scrolls", errors);
  uniqueIds(oracles, "$.spellWordingOracles", errors);
  const companionIds = uniqueIds(companions, "$.companions", errors);

  if (backgrounds.length !== 20) error(errors, "$.backgrounds", "must contain exactly 20 backgrounds");
  if (spells.length !== 36) error(errors, "$.spells", "must contain exactly 36 example spells");
  if (backgroundIds.size !== backgrounds.length) error(errors, "$.backgrounds", "background ids must be unique");

  talents.forEach((entry, index) => {
    const path = `$.talents[${index}]`;
    const talent = record(entry, path, errors);
    if (!talent) return;
    string(talent.name, `${path}.name`, errors);
    string(talent.description, `${path}.description`, errors);
    sources(talent.sources, `${path}.sources`, errors);
  });

  const traitTables = record(root.traitTables, "$.traitTables", errors);
  traitNames.forEach((name) => d20Table(traitTables?.[name], `$.traitTables.${name}`, errors));

  items.forEach((entry, index) => {
    const itemPath = `$.items[${index}]`;
    const item = record(entry, itemPath, errors);
    if (!item) return;
    string(item.name, `${itemPath}.name`, errors);
    if (integer(item.slots, `${itemPath}.slots`, errors, 0) && typeof item.trivial === "boolean") {
      if (item.trivial && item.slots !== 0) error(errors, `${itemPath}.slots`, "must be 0 for a trivial item");
      if (!item.trivial && item.slots === 0) error(errors, `${itemPath}.slots`, "must be positive for a non-trivial item");
    }
    if (typeof item.trivial !== "boolean") error(errors, `${itemPath}.trivial`, "must be a boolean");
    if (item.damage !== undefined) string(item.damage, `${itemPath}.damage`, errors);
    if (item.armor !== undefined) integer(item.armor, `${itemPath}.armor`, errors, 0);
    if (item.requirements !== undefined) stringArray(item.requirements, `${itemPath}.requirements`, errors);
    if (item.effects !== undefined) stringArray(item.effects, `${itemPath}.effects`, errors);
    sources(item.sources, `${itemPath}.sources`, errors);
  });

  const creation = record(root.characterCreation, "$.characterCreation", errors);
  if (creation) {
    valueDefinition(creation.attributeRoll, "$.characterCreation.attributeRoll", errors);
    valueDefinition(creation.staminaRoll, "$.characterCreation.staminaRoll", errors);
    valueDefinition(creation.randomAgeRoll, "$.characterCreation.randomAgeRoll", errors);
    valueDefinition(creation.wealthRoll, "$.characterCreation.wealthRoll", errors);
    ["randomAgeBase", "minimumChosenAge", "inventoryMinimum", "corruptionMaximumModifier", "wealthMultiplier"].forEach((key) => integer(creation[key], `$.characterCreation.${key}`, errors, 0));
    if (creation.currencyUnit !== "silver-pennies") error(errors, "$.characterCreation.currencyUnit", "must be silver-pennies");
    string(creation.ancestry, "$.characterCreation.ancestry", errors);
    string(creation.rank, "$.characterCreation.rank", errors);
    stringArray(creation.factions, "$.characterCreation.factions", errors);
    grants(creation.sharedEquipmentGrants, "$.characterCreation.sharedEquipmentGrants", itemIds, errors);
    sources(creation.sources, "$.characterCreation.sources", errors);
  }

  const loyaltyDefinition = record(root.retainerLoyalty, "$.retainerLoyalty", errors);
  const loyalty = array(loyaltyDefinition?.bands, "$.retainerLoyalty.bands", errors) ?? [];
  if (loyaltyDefinition) sources(loyaltyDefinition.sources, "$.retainerLoyalty.sources", errors);
  const coveredWillpower = new Set<number>();
  loyalty.forEach((entry, index) => {
    const path = `$.retainerLoyalty.bands[${index}]`;
    const band = record(entry, path, errors);
    if (!band) return;
    const validMinimum = integer(band.minimumWillpower, `${path}.minimumWillpower`, errors, 3);
    const validMaximum = integer(band.maximumWillpower, `${path}.maximumWillpower`, errors, 3);
    integer(band.loyalty, `${path}.loyalty`, errors, 1);
    integer(band.retainerMaximum, `${path}.retainerMaximum`, errors, 1);
    if (validMinimum && validMaximum) {
      const minimumWillpower = band.minimumWillpower as number;
      const maximumWillpower = band.maximumWillpower as number;
      if (minimumWillpower > maximumWillpower) error(errors, path, "minimumWillpower must not exceed maximumWillpower");
      for (let score = minimumWillpower; score <= maximumWillpower; score += 1) {
        if (coveredWillpower.has(score)) error(errors, path, `overlaps WIL ${score}`);
        coveredWillpower.add(score);
      }
    }
  });
  for (let score = 3; score <= 18; score += 1) {
    if (!coveredWillpower.has(score)) error(errors, "$.retainerLoyalty.bands", `must cover WIL ${score}`);
  }

  const squireTalentIds = stringArray(root.squireTalentIds, "$.squireTalentIds", errors);
  references(squireTalentIds, talentIds, "$.squireTalentIds", errors);
  if (new Set(squireTalentIds).size !== squireTalentIds.length) {
    error(errors, "$.squireTalentIds", "must contain unique talent ids");
  }

  backgrounds.forEach((entry, index) => {
    const path = `$.backgrounds[${index}]`;
    const background = record(entry, path, errors);
    if (!background) return;
    if (integer(background.d20Index, `${path}.d20Index`, errors, 1) && background.d20Index !== index + 1) {
      error(errors, `${path}.d20Index`, `must be ${index + 1} in canonical order`);
    }
    string(background.name, `${path}.name`, errors);
    string(background.description, `${path}.description`, errors);
    const backgroundTalents = stringArray(background.talentIds, `${path}.talentIds`, errors);
    if (backgroundTalents.length !== 3) error(errors, `${path}.talentIds`, "must contain exactly three talents");
    references(backgroundTalents, talentIds, `${path}.talentIds`, errors);
    grants(background.equipmentGrants, `${path}.equipmentGrants`, itemIds, errors);
    references(stringArray(background.companionDefinitionIds, `${path}.companionDefinitionIds`, errors), companionIds, `${path}.companionDefinitionIds`, errors);
    references(stringArray(background.spellBookDefinitionIds, `${path}.spellBookDefinitionIds`, errors), spellBookIds, `${path}.spellBookDefinitionIds`, errors);
    references(stringArray(background.scrollDefinitionIds, `${path}.scrollDefinitionIds`, errors), scrollIds, `${path}.scrollDefinitionIds`, errors);
    sources(background.sources, `${path}.sources`, errors);
  });
  const backgroundTalentIds = new Set(
    backgrounds.flatMap((entry) => isRecord(entry) && Array.isArray(entry.talentIds)
      ? entry.talentIds.filter((id): id is string => typeof id === "string")
      : []),
  );
  if (
    backgroundTalentIds.size !== squireTalentIds.length ||
    squireTalentIds.some((id) => !backgroundTalentIds.has(id))
  ) {
    error(errors, "$.squireTalentIds", "must equal the deduplicated union of background talents");
  }

  spells.forEach((entry, index) => {
    const path = `$.spells[${index}]`;
    const spell = record(entry, path, errors);
    if (!spell) return;
    string(spell.name, `${path}.name`, errors);
    if (spell.wording !== undefined) string(spell.wording, `${path}.wording`, errors);
    sources(spell.sources, `${path}.sources`, errors);
  });

  spellBooks.forEach((entry, index) => {
    const path = `$.spellBooks[${index}]`;
    const book = record(entry, path, errors);
    if (!book) return;
    string(book.name, `${path}.name`, errors);
    integer(book.slots, `${path}.slots`, errors, 1);
    const validCapacity = integer(book.capacity, `${path}.capacity`, errors, 1);
    const validStarting = integer(book.startingSpellCount, `${path}.startingSpellCount`, errors, 1);
    if (validCapacity && validStarting && (book.startingSpellCount as number) > (book.capacity as number)) error(errors, `${path}.startingSpellCount`, "must not exceed capacity");
    references(stringArray(book.spellIds, `${path}.spellIds`, errors), spellIds, `${path}.spellIds`, errors);
    sources(book.sources, `${path}.sources`, errors);
  });

  scrolls.forEach((entry, index) => {
    const path = `$.scrolls[${index}]`;
    const scroll = record(entry, path, errors);
    if (!scroll) return;
    string(scroll.name, `${path}.name`, errors);
    string(scroll.spellName, `${path}.spellName`, errors);
    integer(scroll.slots, `${path}.slots`, errors, 1);
    ["effects", "parameters", "cost"].forEach((key) => {
      if (scroll[key] !== undefined) error(errors, `${path}.${key}`, "must be absent from a starting scroll");
    });
    sources(scroll.sources, `${path}.sources`, errors);
  });

  if (oracles.length !== 1) error(errors, "$.spellWordingOracles", "must contain exactly one oracle");
  oracles.forEach((entry, index) => {
    const path = `$.spellWordingOracles[${index}]`;
    const oracle = record(entry, path, errors);
    if (!oracle) return;
    const columns = array(oracle.columns, `${path}.columns`, errors);
    if (columns?.length !== 4) error(errors, `${path}.columns`, "must contain exactly four columns");
    const columnIds = uniqueIds(columns ?? [], `${path}.columns`, errors);
    if (columns && columnIds.size !== columns.length) error(errors, `${path}.columns`, "column ids must be unique");
    columns?.forEach((columnEntry, columnIndex) => {
      const columnPath = `${path}.columns[${columnIndex}]`;
      const column = record(columnEntry, columnPath, errors);
      if (!column) return;
      string(column.label, `${columnPath}.label`, errors);
      d20Table(column.entries, `${columnPath}.entries`, errors);
    });
    sources(oracle.sources, `${path}.sources`, errors);
  });

  companions.forEach((entry, index) => {
    const path = `$.companions[${index}]`;
    const companion = record(entry, path, errors);
    if (!companion) return;
    string(companion.name, `${path}.name`, errors);
    const attributes = record(companion.attributes, `${path}.attributes`, errors);
    valueDefinition(attributes?.strength, `${path}.attributes.strength`, errors);
    valueDefinition(attributes?.dexterity, `${path}.attributes.dexterity`, errors);
    valueDefinition(attributes?.willpower, `${path}.attributes.willpower`, errors);
    valueDefinition(companion.stamina, `${path}.stamina`, errors);
    if (companion.kind === "retainer") {
      string(companion.role, `${path}.role`, errors);
      integer(companion.inventoryCapacity, `${path}.inventoryCapacity`, errors, 1);
      grants(companion.equipmentGrants, `${path}.equipmentGrants`, itemIds, errors);
      integer(companion.talentSelectionCount, `${path}.talentSelectionCount`, errors, 1);
    } else if (companion.kind === "pet") {
      if (companion.petKind !== "pet" && companion.petKind !== "familiar") error(errors, `${path}.petKind`, "must be one of: pet, familiar");
      integer(companion.morale, `${path}.morale`, errors, 1);
      stringArray(companion.attacks, `${path}.attacks`, errors);
    } else if (companion.kind === "mount") {
      integer(companion.morale, `${path}.morale`, errors, 1);
      const capacity = record(companion.capacity, `${path}.capacity`, errors);
      integer(capacity?.ridden, `${path}.capacity.ridden`, errors, 0);
      integer(capacity?.unridden, `${path}.capacity.unridden`, errors, 0);
      if (companion.travel !== undefined) string(companion.travel, `${path}.travel`, errors);
      stringArray(companion.attacks, `${path}.attacks`, errors);
      stringArray(companion.abilities, `${path}.abilities`, errors);
    } else {
      error(errors, `${path}.kind`, "must be one of: retainer, pet, mount");
    }
    sources(companion.sources, `${path}.sources`, errors);
  });

  return errors.length === 0
    ? { success: true, value: input as RulesDefinitionDocument }
    : { success: false, errors };
}

/** Validates optional legacy names without treating imported JSON as trusted. */
export function validateNameDocument(input: unknown): ValidationResult<NameDefinitionDocument> {
  const errors: ValidationError[] = [];
  const root = record(input, "$", errors);
  if (!root) return { success: false, errors };
  string(root.schemaVersion, "$.schemaVersion", errors);
  string(root.rulesVersion, "$.rulesVersion", errors);
  string(root.source, "$.source", errors);
  const human = record(root.human, "$.human", errors);
  const groups = [
    ["$.human.masculine", human?.masculine],
    ["$.human.feminine", human?.feminine],
    ["$.human.family", human?.family],
    ["$.ironicOrAbsurdFamiliar", root.ironicOrAbsurdFamiliar],
  ] as const;
  groups.forEach(([path, value]) => {
    const names = stringArray(value, path, errors);
    if (names.length === 0) error(errors, path, "must not be empty");
    if (new Set(names).size !== names.length) error(errors, path, "must contain unique names");
  });
  return errors.length === 0
    ? { success: true, value: input as NameDefinitionDocument }
    : { success: false, errors };
}
