import type { TraitName } from "./actors.ts";

export interface SourceReference {
  readonly document: string;
  readonly section: string;
}

export interface DiceDefinition {
  readonly kind: "dice";
  readonly count: number;
  readonly sides: number;
  readonly modifier?: number;
}

export interface FixedValueDefinition {
  readonly kind: "fixed";
  readonly value: number;
}

export type ValueDefinition = DiceDefinition | FixedValueDefinition;

export interface ItemQuantityGrant {
  readonly itemId: string;
  readonly quantity: number;
}

/** A group either grants every entry or requires one explicit alternative. */
export interface ItemGrantGroup {
  readonly kind: "receive-all" | "choose-one";
  readonly grants: readonly ItemQuantityGrant[];
}

export interface TalentDefinition {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly sources: readonly SourceReference[];
}

export interface TraitTableEntry {
  readonly d20Index: number;
  readonly value: string;
}

/**
 * The nine character-creation tables. Their 20-entry/range semantics are
 * domain data to be checked when the Stage 02 dataset is parsed.
 */
export type TraitTables = Readonly<Record<TraitName, readonly TraitTableEntry[]>>;

export interface BackgroundDefinition {
  readonly id: string;
  readonly d20Index: number;
  readonly name: string;
  readonly description: string;
  readonly talentIds: readonly string[];
  readonly equipmentGrants: readonly ItemGrantGroup[];
  readonly companionDefinitionIds: readonly string[];
  readonly spellBookDefinitionIds: readonly string[];
  readonly scrollDefinitionIds: readonly string[];
  readonly sources: readonly SourceReference[];
}

export interface ItemDefinition {
  readonly id: string;
  readonly name: string;
  readonly slots: number;
  readonly trivial: boolean;
  readonly damage?: string;
  readonly armor?: number;
  readonly requirements?: readonly string[];
  readonly effects?: readonly string[];
  readonly sources: readonly SourceReference[];
}

export interface SpellDefinition {
  readonly id: string;
  readonly name: string;
  readonly wording?: string;
  readonly sources: readonly SourceReference[];
}

export interface SpellBookDefinition {
  readonly id: string;
  readonly name: string;
  readonly slots: number;
  readonly capacity: number;
  readonly spellIds: readonly string[];
  readonly sources: readonly SourceReference[];
}

/** A named scroll records its spell name only; effects are intentionally absent. */
export interface ScrollDefinition {
  readonly id: string;
  readonly name: string;
  readonly spellName: string;
  readonly slots: number;
  readonly sources: readonly SourceReference[];
}

export interface SpellWordingOracleColumn {
  readonly id: string;
  readonly label: string;
  readonly entries: readonly TraitTableEntry[];
}

/** Declarative d20 oracle data; it never evaluates randomness. */
export interface SpellWordingOracleDefinition {
  readonly id: string;
  readonly columns: readonly SpellWordingOracleColumn[];
  readonly sources: readonly SourceReference[];
}

export interface CompanionAttributeDefinitions {
  readonly strength: ValueDefinition;
  readonly dexterity: ValueDefinition;
  readonly willpower: ValueDefinition;
}

interface CompanionDefinitionBase {
  readonly id: string;
  readonly name: string;
  readonly attributes: CompanionAttributeDefinitions;
  readonly stamina: ValueDefinition;
  readonly sources: readonly SourceReference[];
}

export interface RetainerDefinition extends CompanionDefinitionBase {
  readonly kind: "retainer";
  readonly role: string;
  readonly inventoryCapacity: number;
  readonly equipmentGrants: readonly ItemGrantGroup[];
  readonly talentSelectionCount: number;
}

export interface PetDefinition extends CompanionDefinitionBase {
  readonly kind: "pet";
  readonly petKind: "pet" | "familiar";
  readonly morale: number;
  readonly attacks: readonly string[];
}

export interface MountDefinition extends CompanionDefinitionBase {
  readonly kind: "mount";
  readonly morale: number;
  readonly capacity: {
    readonly ridden: number;
    readonly unridden: number;
  };
  readonly travel?: string;
  readonly attacks: readonly string[];
  readonly abilities: readonly string[];
}

export type CompanionDefinition =
  | RetainerDefinition
  | PetDefinition
  | MountDefinition;

export interface RulesDefinitionDocument {
  readonly schemaVersion: string;
  readonly rulesVersion: string;
  readonly talents: readonly TalentDefinition[];
  readonly traitTables: TraitTables;
  readonly backgrounds: readonly BackgroundDefinition[];
  readonly items: readonly ItemDefinition[];
  readonly spells: readonly SpellDefinition[];
  readonly spellBooks: readonly SpellBookDefinition[];
  readonly scrolls: readonly ScrollDefinition[];
  readonly spellWordingOracles: readonly SpellWordingOracleDefinition[];
  readonly companions: readonly CompanionDefinition[];
}
