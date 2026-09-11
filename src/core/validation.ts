import type { TraitName } from "./actors.ts";

const actorKinds = ["character", "retainer", "pet", "mount"] as const;
const companionKinds = ["retainer", "pet", "mount"] as const;
const petKinds = ["pet", "familiar"] as const;
type CompanionDefinitionKind = (typeof companionKinds)[number];

export interface ValidationError {
  readonly path: string;
  readonly message: string;
}

export type ValidationResult<T> =
  | { readonly success: true; readonly value: T }
  | { readonly success: false; readonly errors: readonly ValidationError[] };

type ValidatedActorIdentity =
  | { readonly id: string; readonly kind: "character" }
  | {
      readonly id: string;
      readonly kind: "retainer";
      readonly loyalty: {
        readonly score: number;
        readonly retainerMaximum: number;
      };
    }
  | {
      readonly id: string;
      readonly kind: "pet";
      readonly petKind: "pet" | "familiar";
      readonly morale: number;
    }
  | {
      readonly id: string;
      readonly kind: "mount";
      readonly morale: number;
      readonly ridden: boolean;
      readonly capacity: {
        readonly ridden: number;
        readonly unridden: number;
      };
    };

export interface ValidatedActorEnvelope {
  readonly schemaVersion: string;
  readonly rulesVersion: string;
  readonly seed: string;
  readonly generation: {
    readonly originalRolls: readonly unknown[];
    readonly choices: readonly unknown[];
  };
  readonly actor: ValidatedActorIdentity;
}

export interface ValidatedRulesEnvelope {
  readonly schemaVersion: string;
  readonly rulesVersion: string;
  readonly talents: readonly unknown[];
  readonly traitTables: Readonly<Record<TraitName, readonly unknown[]>>;
  readonly backgrounds: readonly unknown[];
  readonly items: readonly unknown[];
  readonly spells: readonly unknown[];
  readonly spellBooks: readonly unknown[];
  readonly scrolls: readonly unknown[];
  readonly spellWordingOracles: readonly unknown[];
  readonly companions: readonly {
    readonly id: string;
    readonly kind: CompanionDefinitionKind;
  }[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readRecord(
  value: unknown,
  path: string,
  errors: ValidationError[],
): Record<string, unknown> | undefined {
  if (!isRecord(value)) {
    errors.push({ path, message: "must be an object" });
    return undefined;
  }
  return value;
}

function readString(
  object: Record<string, unknown>,
  key: string,
  path: string,
  errors: ValidationError[],
): string | undefined {
  const value = object[key];
  if (typeof value !== "string" || value.length === 0) {
    errors.push({ path: `${path}.${key}`, message: "must be a non-empty string" });
    return undefined;
  }
  return value;
}

function readArray(
  object: Record<string, unknown>,
  key: string,
  path: string,
  errors: ValidationError[],
): readonly unknown[] | undefined {
  const value = object[key];
  if (!Array.isArray(value)) {
    errors.push({ path: `${path}.${key}`, message: "must be an array" });
    return undefined;
  }
  return value;
}

function readNumber(
  object: Record<string, unknown>,
  key: string,
  path: string,
  errors: ValidationError[],
): number | undefined {
  const value = object[key];
  if (typeof value !== "number" || !Number.isFinite(value)) {
    errors.push({ path: `${path}.${key}`, message: "must be a finite number" });
    return undefined;
  }
  return value;
}

function readBoolean(
  object: Record<string, unknown>,
  key: string,
  path: string,
  errors: ValidationError[],
): boolean | undefined {
  const value = object[key];
  if (typeof value !== "boolean") {
    errors.push({ path: `${path}.${key}`, message: "must be a boolean" });
    return undefined;
  }
  return value;
}

function readEnum<T extends string>(
  object: Record<string, unknown>,
  key: string,
  path: string,
  values: readonly T[],
  errors: ValidationError[],
): T | undefined {
  const value = object[key];
  const match = typeof value === "string" ? values.find((candidate) => candidate === value) : undefined;
  if (match === undefined) {
    errors.push({ path: `${path}.${key}`, message: `must be one of: ${values.join(", ")}` });
  }
  return match;
}

function failure(errors: ValidationError[]): ValidationResult<never> {
  return { success: false, errors };
}

/**
 * Validates only the generated-document envelope it returns, not an
 * `ActorSnapshot`. Full domain parsing belongs in a later validator and must
 * preserve the unknown-at-the-boundary rule.
 */
export function validateActorEnvelope(
  input: unknown,
): ValidationResult<ValidatedActorEnvelope> {
  const errors: ValidationError[] = [];
  const root = readRecord(input, "$", errors);
  if (root === undefined) return failure(errors);

  const schemaVersion = readString(root, "schemaVersion", "$", errors);
  const rulesVersion = readString(root, "rulesVersion", "$", errors);
  const seed = readString(root, "seed", "$", errors);
  const generation = readRecord(root.generation, "$.generation", errors);
  const originalRolls = generation
    ? readArray(generation, "originalRolls", "$.generation", errors)
    : undefined;
  const choices = generation
    ? readArray(generation, "choices", "$.generation", errors)
    : undefined;
  const actor = readRecord(root.actor, "$.actor", errors);
  const id = actor ? readString(actor, "id", "$.actor", errors) : undefined;
  const kind = actor ? readEnum(actor, "kind", "$.actor", actorKinds, errors) : undefined;

  let validatedActor: ValidatedActorIdentity | undefined;
  if (actor !== undefined && id !== undefined) {
    if (kind === "character") {
      validatedActor = { id, kind };
    } else if (kind === "retainer") {
      const loyalty = readRecord(actor.loyalty, "$.actor.loyalty", errors);
      const score = loyalty
        ? readNumber(loyalty, "score", "$.actor.loyalty", errors)
        : undefined;
      const retainerMaximum = loyalty
        ? readNumber(loyalty, "retainerMaximum", "$.actor.loyalty", errors)
        : undefined;
      if (score !== undefined && retainerMaximum !== undefined) {
        validatedActor = { id, kind, loyalty: { score, retainerMaximum } };
      }
    } else if (kind === "pet") {
      const petKind = readEnum(actor, "petKind", "$.actor", petKinds, errors);
      const morale = readNumber(actor, "morale", "$.actor", errors);
      if (petKind !== undefined && morale !== undefined) {
        validatedActor = { id, kind, petKind, morale };
      }
    } else if (kind === "mount") {
      const morale = readNumber(actor, "morale", "$.actor", errors);
      const ridden = readBoolean(actor, "ridden", "$.actor", errors);
      const capacity = readRecord(actor.capacity, "$.actor.capacity", errors);
      const riddenCapacity = capacity
        ? readNumber(capacity, "ridden", "$.actor.capacity", errors)
        : undefined;
      const unriddenCapacity = capacity
        ? readNumber(capacity, "unridden", "$.actor.capacity", errors)
        : undefined;
      if (
        morale !== undefined &&
        ridden !== undefined &&
        riddenCapacity !== undefined &&
        unriddenCapacity !== undefined
      ) {
        validatedActor = {
          id,
          kind,
          morale,
          ridden,
          capacity: { ridden: riddenCapacity, unridden: unriddenCapacity },
        };
      }
    }
  }

  if (
    errors.length > 0 ||
    schemaVersion === undefined ||
    rulesVersion === undefined ||
    seed === undefined ||
    originalRolls === undefined ||
    choices === undefined ||
    validatedActor === undefined
  ) {
    return failure(errors);
  }
  return {
    success: true,
    value: {
      schemaVersion,
      rulesVersion,
      seed,
      generation: { originalRolls, choices },
      actor: validatedActor,
    },
  };
}

/**
 * Validates the rules-document envelope and companion identifiers/kinds only.
 * It deliberately returns unparsed arrays; Stage 02 will parse references,
 * d20 entries, quantities, and the remaining definition discriminants.
 */
export function validateRulesEnvelope(
  input: unknown,
): ValidationResult<ValidatedRulesEnvelope> {
  const errors: ValidationError[] = [];
  const root = readRecord(input, "$", errors);
  if (root === undefined) return failure(errors);

  const schemaVersion = readString(root, "schemaVersion", "$", errors);
  const rulesVersion = readString(root, "rulesVersion", "$", errors);
  const talents = readArray(root, "talents", "$", errors);
  const traitTableRoot = readRecord(root.traitTables, "$.traitTables", errors);
  const traitTables = traitTableRoot === undefined
    ? undefined
    : {
        physique: readArray(traitTableRoot, "physique", "$.traitTables", errors),
        face: readArray(traitTableRoot, "face", "$.traitTables", errors),
        skin: readArray(traitTableRoot, "skin", "$.traitTables", errors),
        hair: readArray(traitTableRoot, "hair", "$.traitTables", errors),
        clothing: readArray(traitTableRoot, "clothing", "$.traitTables", errors),
        virtue: readArray(traitTableRoot, "virtue", "$.traitTables", errors),
        vice: readArray(traitTableRoot, "vice", "$.traitTables", errors),
        speech: readArray(traitTableRoot, "speech", "$.traitTables", errors),
        misfortune: readArray(traitTableRoot, "misfortune", "$.traitTables", errors),
      };
  const backgrounds = readArray(root, "backgrounds", "$", errors);
  const items = readArray(root, "items", "$", errors);
  const spells = readArray(root, "spells", "$", errors);
  const spellBooks = readArray(root, "spellBooks", "$", errors);
  const scrolls = readArray(root, "scrolls", "$", errors);
  const spellWordingOracles = readArray(root, "spellWordingOracles", "$", errors);
  const companions = readArray(root, "companions", "$", errors);
  const validatedCompanions: { id: string; kind: CompanionDefinitionKind }[] = [];
  const companionIds = new Set<string>();

  companions?.forEach((entry, index) => {
    const path = `$.companions[${index}]`;
    const companion = readRecord(entry, path, errors);
    if (companion === undefined) return;
    const id = readString(companion, "id", path, errors);
    const kind = readEnum(companion, "kind", path, companionKinds, errors);
    if (id !== undefined && kind !== undefined) {
      if (companionIds.has(id)) {
        errors.push({ path: `${path}.id`, message: "must be unique among companions" });
      } else {
        companionIds.add(id);
        validatedCompanions.push({ id, kind });
      }
    }
  });

  if (
    errors.length > 0 ||
    schemaVersion === undefined ||
    rulesVersion === undefined ||
    talents === undefined ||
    traitTables === undefined ||
    traitTables.physique === undefined ||
    traitTables.face === undefined ||
    traitTables.skin === undefined ||
    traitTables.hair === undefined ||
    traitTables.clothing === undefined ||
    traitTables.virtue === undefined ||
    traitTables.vice === undefined ||
    traitTables.speech === undefined ||
    traitTables.misfortune === undefined ||
    backgrounds === undefined ||
    items === undefined ||
    spells === undefined ||
    spellBooks === undefined ||
    scrolls === undefined ||
    spellWordingOracles === undefined ||
    companions === undefined
  ) {
    return failure(errors);
  }
  return {
    success: true,
    value: {
      schemaVersion,
      rulesVersion,
      talents,
      traitTables: {
        physique: traitTables.physique,
        face: traitTables.face,
        skin: traitTables.skin,
        hair: traitTables.hair,
        clothing: traitTables.clothing,
        virtue: traitTables.virtue,
        vice: traitTables.vice,
        speech: traitTables.speech,
        misfortune: traitTables.misfortune,
      },
      backgrounds,
      items,
      spells,
      spellBooks,
      scrolls,
      spellWordingOracles,
      companions: validatedCompanions,
    },
  };
}
