import namesData from "../../data/names-v1.json" with { type: "json" };
import rulesData from "../../data/rules-v1.json" with { type: "json" };

import type { NameDefinitionDocument, RulesDefinitionDocument } from "./definitions.ts";
import { validateNameDocument, validateRulesDocument } from "./rules-validation.ts";

function deepFreeze<T>(value: T): Readonly<T> {
  if (typeof value !== "object" || value === null || Object.isFrozen(value)) return value;
  Object.freeze(value);
  Object.values(value).forEach((entry) => deepFreeze(entry));
  return value;
}

const result = validateRulesDocument(rulesData);
if (!result.success) {
  const detail = result.errors.map(({ path, message }) => `${path}: ${message}`).join("\n");
  throw new Error(`Bundled rules data is invalid:\n${detail}`);
}

const nameResult = validateNameDocument(namesData);
if (!nameResult.success) {
  const detail = nameResult.errors.map(({ path, message }) => `${path}: ${message}`).join("\n");
  throw new Error(`Bundled name data is invalid:\n${detail}`);
}

export const rules: RulesDefinitionDocument = deepFreeze(result.value);
export const names: NameDefinitionDocument = deepFreeze(nameResult.value);
export const squireTalentIds = rules.squireTalentIds;
