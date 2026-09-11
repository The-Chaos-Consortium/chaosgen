export type AttributeName = "strength" | "dexterity" | "willpower";

export interface ValueTrack {
  readonly current: number;
  readonly maximum: number;
}

export type Attributes = Readonly<Record<AttributeName, ValueTrack>>;

export type TraitName =
  | "physique"
  | "face"
  | "skin"
  | "hair"
  | "clothing"
  | "virtue"
  | "vice"
  | "speech"
  | "misfortune";

export type Traits = Readonly<Record<TraitName, string>>;

export interface RecordedRoll {
  readonly id: string;
  readonly dice: readonly number[];
  readonly total: number;
}

export interface RecordedChoice {
  readonly id: string;
  readonly value: string | number | boolean;
}

export interface AttributeSwapRecord {
  readonly first: AttributeName;
  readonly second: AttributeName;
}

export interface GenerationRecord {
  readonly originalRolls: readonly RecordedRoll[];
  readonly choices: readonly RecordedChoice[];
  readonly attributeSwap?: AttributeSwapRecord;
}

export interface InventoryItemInstance {
  readonly instanceId: string;
  readonly definitionId?: string;
  readonly name: string;
  readonly quantity: number;
  readonly ownerActorId: string;
  readonly occupiedSlots: readonly number[];
  readonly notes: readonly string[];
}

export interface TalentInstance {
  readonly definitionId?: string;
  readonly name: string;
}

export interface SpellInstance {
  readonly definitionId?: string;
  readonly name: string;
  readonly wording?: string;
}

export interface SpellBookInstance {
  readonly instanceId: string;
  readonly name: string;
  readonly ownerActorId: string;
  readonly occupiedSlots: readonly number[];
  readonly capacity: number;
  readonly spells: readonly SpellInstance[];
}

export interface ScrollInstance {
  readonly instanceId: string;
  readonly name: string;
  readonly ownerActorId: string;
  readonly occupiedSlots: readonly number[];
}

interface ActorBase {
  readonly id: string;
  readonly name: string;
  readonly attributes: Attributes;
  readonly stamina: ValueTrack;
  readonly notes: readonly string[];
}

export interface CharacterActor extends ActorBase {
  readonly kind: "character";
  readonly identity: {
    readonly age: number;
    readonly ancestry: string;
  };
  readonly background: {
    readonly id: string;
    readonly name: string;
  };
  readonly faction: "Chaos" | "Law" | "Balance";
  readonly rank: "Novice";
  readonly traits: Traits;
  readonly corruption: ValueTrack;
  readonly currency: {
    readonly amount: number;
    readonly unit: "silver-pennies";
  };
  readonly talents: readonly TalentInstance[];
  readonly inventory: readonly InventoryItemInstance[];
  readonly spellBooks: readonly SpellBookInstance[];
  readonly scrolls: readonly ScrollInstance[];
  readonly companions: readonly CompanionActor[];
}

export interface RetainerActor extends ActorBase {
  readonly kind: "retainer";
  readonly definitionId: string;
  readonly role: string;
  readonly loyalty: {
    readonly score: number;
    readonly retainerMaximum: number;
  };
  readonly talents: readonly TalentInstance[];
  readonly inventory: readonly InventoryItemInstance[];
}

export interface PetActor extends ActorBase {
  readonly kind: "pet";
  readonly definitionId: string;
  readonly petKind: "pet" | "familiar";
  readonly morale: number;
  readonly attacks: readonly string[];
}

export interface MountActor extends ActorBase {
  readonly kind: "mount";
  readonly definitionId: string;
  readonly morale: number;
  readonly ridden: boolean;
  readonly capacity: {
    readonly ridden: number;
    readonly unridden: number;
  };
  readonly travel?: string;
  readonly attacks: readonly string[];
  readonly abilities: readonly string[];
  readonly inventory: readonly InventoryItemInstance[];
}

export type CompanionActor = RetainerActor | PetActor | MountActor;
export type ActorSnapshot = CharacterActor | CompanionActor;

export interface GeneratedActorDocument {
  readonly schemaVersion: string;
  readonly rulesVersion: string;
  readonly seed: string;
  readonly generation: GenerationRecord;
  readonly actor: ActorSnapshot;
}
