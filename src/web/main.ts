import characterTemplateUrl from "../../templates/fillable/character.pdf?url";
import mountTemplateUrl from "../../templates/fillable/mount.pdf?url";
import retainerTemplateUrl from "../../templates/fillable/retainer.pdf?url";

import type { AttributeName, CharacterActor, TraitName } from "../core/actors.ts";
import { customizeCharacter, generateCharacter, type CharacterCustomization } from "../core/generation.ts";
import { createSeededRandom } from "../core/rng.ts";
import { rules } from "../core/rules.ts";
import { hasRequiredPdfTemplateKinds, requiredPdfTemplateKinds, type GeneratedCharacterDocument, type PdfTemplateKind, type PdfTemplateSet } from "../pdf/contracts.ts";
import { PdfLibCharacterRenderer } from "../pdf/rendering.ts";

import "./styles.css";

type StatusKind = "" | "error" | "success";

interface AppDependencies {
  readonly newSeed: () => string;
  readonly loadTemplate: (kind: PdfTemplateKind) => Promise<Uint8Array>;
  readonly render: (document: GeneratedCharacterDocument, templates: PdfTemplateSet) => Promise<Uint8Array>;
  readonly download: (name: string, bytes: Uint8Array) => void;
}

const templateUrls: Readonly<Record<PdfTemplateKind, string>> = {
  character: characterTemplateUrl,
  retainer: retainerTemplateUrl,
  mount: mountTemplateUrl,
};

const defaultDependencies: AppDependencies = {
  newSeed: () => crypto.randomUUID(),
  async loadTemplate(kind) {
    const response = await fetch(templateUrls[kind]);
    if (!response.ok) throw new Error(`Could not load the ${kind} PDF template (${response.status}).`);
    return new Uint8Array(await response.arrayBuffer());
  },
  render: (document, templates) => new PdfLibCharacterRenderer().render({ document, templates }),
  download(name, bytes) {
    const url = URL.createObjectURL(new Blob([new Uint8Array(bytes).buffer], { type: "application/pdf" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = name;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 0);
  },
};

interface AppState {
  document?: GeneratedCharacterDocument;
  busy: boolean;
}

export function mountApp(root: HTMLElement, dependencies: AppDependencies = defaultDependencies): void {
  const state: AppState = { busy: false };
  const status = element("p", { className: "status", role: "status", ariaLive: "polite" }) as HTMLParagraphElement;
  const result = element("div");
  const background = select("background", [option("", "Random background"), ...rules.backgrounds.map(({ id, d20Index, name }) => option(id, `${d20Index}. ${name}`))]);
  const generate = element("button", { type: "button" }, "Generate character");
  generate.addEventListener("click", () => {
    try {
      const seed = dependencies.newSeed();
      const generated = generateCharacter({ seed, random: createSeededRandom(seed), ...(background.value === "" ? {} : { backgroundId: background.value }) });
      if (generated.actor.kind !== "character") throw new Error("Character generation returned an unsupported actor.");
      state.document = { ...generated, actor: generated.actor };
      setStatus(status, "", "");
      renderResult();
    } catch (error: unknown) {
      setStatus(status, "error", message(error));
    }
  });

  root.replaceChildren(
    element("div", { className: "shell" },
      element("header", { className: "masthead" }, element("h1", {}, "Chaos & Conquest"), element("p", {}, "A new character, ready for the road.")),
      element("section", { className: "panel", ariaLabel: "Character generation" },
        element("h2", {}, "Begin a Character"),
        element("div", { className: "controls" }, label("background", "Background", background), generate),
        element("p", { className: "muted" }, "Choose a background or let fate choose. Generating creates a new character; editing never rolls again."),
      ),
      status,
      result,
    ),
  );

  function renderResult(): void {
    const document = state.document;
    if (document === undefined) return;
    result.replaceChildren(buildResult(document, state, dependencies, status, renderResult));
  }
}

function buildResult(document: GeneratedCharacterDocument, state: AppState, dependencies: AppDependencies, status: HTMLParagraphElement, refresh: () => void): HTMLElement {
  const { actor } = document;
  const name = input("name", actor.name);
  const age = input("age", String(actor.identity.age), "number");
  age.min = String(rules.characterCreation.minimumChosenAge);
  const faction = select("faction", rules.characterCreation.factions.map((entry) => option(entry, entry, entry === actor.faction)));
  const swapFirst = select("swap-first", [option("", "No swap"), ...attributeOptions(document.generation.attributeSwap?.first)]);
  const swapSecond = select("swap-second", [option("", "No swap"), ...attributeOptions(document.generation.attributeSwap?.second)]);
  const traits = (Object.keys(actor.traits) as TraitName[]).map((trait) => [trait, input(`trait-${trait}`, actor.traits[trait])] as const);
  const spellBook = actor.spellBooks[0];
  const spell = spellBook === undefined ? undefined : select("starting-spell", [
    ...spellOptions(spellBook.definitionId, spellBook.spells[0]?.definitionId),
    option("custom", "Custom wording", spellBook.spells[0]?.wording !== undefined),
  ]);
  const customWording = spellBook === undefined ? undefined : element("textarea", { id: "custom-spell", disabled: spell?.value !== "custom" }) as HTMLTextAreaElement;
  if (customWording !== undefined) customWording.value = spellBook?.spells[0]?.wording ?? "";

  const update = (): void => {
    try {
      const customization: CharacterCustomization = {
        name: name.value,
        age: Number(age.value),
        faction: faction.value as CharacterActor["faction"],
        traits: Object.fromEntries(traits.map(([trait, field]) => [trait, field.value])),
        ...(swapFirst.value !== "" && swapSecond.value !== "" ? { attributeSwap: { first: swapFirst.value as AttributeName, second: swapSecond.value as AttributeName } } : {}),
        ...(spellBook === undefined || spell === undefined ? {} : { startingSpells: { [spellBook.instanceId]: spell.value === "custom" ? { customWording: customWording?.value ?? "" } : spell.value } }),
      };
      const updated = customizeCharacter(document, customization);
      if (updated.actor.kind !== "character") throw new Error("Character customization returned an unsupported actor.");
      state.document = { ...updated, actor: updated.actor };
      setStatus(status, "success", "Changes applied without rerolling.");
      refresh();
    } catch (error: unknown) {
      setStatus(status, "error", message(error));
    }
  };
  for (const field of [name, age, faction, swapFirst, swapSecond, ...traits.map(([, field]) => field), ...(spell === undefined ? [] : [spell]), ...(customWording === undefined ? [] : [customWording])]) {
    field.addEventListener("change", () => {
      if (field === spell && customWording !== undefined) customWording.disabled = spell.value !== "custom";
      if ((field === swapFirst && swapSecond.value === "") || (field === swapSecond && swapFirst.value === "")) return;
      update();
    });
  }
  const download = element("button", { type: "button", className: "secondary" }, "Download PDF") as HTMLButtonElement;
  download.addEventListener("click", async () => {
    const current = state.document;
    if (current === undefined || state.busy) return;
    state.busy = true;
    download.disabled = true;
    setStatus(status, "", "Preparing editable PDF...");
    try {
      const templates = await loadTemplates(current.actor, dependencies);
      dependencies.download(`${safeFilename(current.actor.name)}.pdf`, await dependencies.render(current, templates));
      setStatus(status, "success", "PDF download is ready.");
    } catch (error: unknown) {
      setStatus(status, "error", message(error));
    } finally {
      state.busy = false;
      download.disabled = false;
    }
  });

  return element("section", { className: "panel", ariaLabel: "Generated character" },
    element("div", { className: "character-title" }, element("div", {}, element("h2", {}, actor.name), element("p", { className: "muted" }, `${actor.background.name} · ${actor.rank}`)), download),
    element("div", { className: "facts" }, ...facts(actor)),
    element("section", {}, element("h3", {}, "Customize"), element("div", { className: "grid" }, label("name", "Name", name), label("age", "Age", age), label("faction", "Faction", faction), label("swap-first", "Swap first attribute", swapFirst), label("swap-second", "Swap second attribute", swapSecond), ...traits.map(([trait, field]) => label(field.id, title(trait), field)), ...(spell === undefined ? [] : [label("starting-spell", "Starting spell", spell), label("custom-spell", "Custom spell wording", customWording!)]))),
    element("div", { className: "section-grid" },
      section("Statistics", statisticList(actor)),
      section("Talents", list(actor.talents.map(({ name: talent }) => talent))),
      section("Inventory", inventory(actor)),
      section("Spells", list([...actor.spellBooks.flatMap((book) => book.spells.map((entry) => `${book.name}: ${entry.name}${entry.wording === undefined ? "" : ` - ${entry.wording}`}`)), ...actor.scrolls.map(({ name: scroll }) => `Scroll: ${scroll}`)])),
      section("Companions", companions(actor)),
      section("Traits", list((Object.keys(actor.traits) as TraitName[]).map((trait) => `${title(trait)}: ${actor.traits[trait]}`))),
    ),
  );
}

async function loadTemplates(actor: CharacterActor, dependencies: AppDependencies): Promise<PdfTemplateSet> {
  const entries = await Promise.all(requiredPdfTemplateKinds(actor).map(async (kind) => [kind, await dependencies.loadTemplate(kind)] as const));
  const templates = Object.fromEntries(entries);
  if (!hasRequiredPdfTemplateKinds(actor, templates)) throw new Error("Required PDF templates are unavailable.");
  return templates;
}

function statisticList(actor: CharacterActor): HTMLElement {
  return list([
    `STR ${actor.attributes.strength.current}/${actor.attributes.strength.maximum}`,
    `DEX ${actor.attributes.dexterity.current}/${actor.attributes.dexterity.maximum}`,
    `WIL ${actor.attributes.willpower.current}/${actor.attributes.willpower.maximum}`,
    `Stamina ${actor.stamina.current}/${actor.stamina.maximum}`,
    `Corruption ${actor.corruption.current}/${actor.corruption.maximum}`,
    `${actor.currency.amount} silver pennies`,
    `Capacity ${actor.inventoryCapacity} slots`,
  ]);
}

function inventory(actor: CharacterActor): HTMLElement {
  const rows = actor.inventory.map((item) => [item.name, item.occupiedSlots.length === 0 ? "Trivial" : item.occupiedSlots.join(", "), item.armor === undefined ? "" : item.armor.canWear ? `AV ${item.armor.armorValue}` : `AV ${item.armor.armorValue}; cannot wear`]);
  const used = actor.inventory.flatMap(({ occupiedSlots }) => occupiedSlots).length + actor.spellBooks.flatMap(({ occupiedSlots }) => occupiedSlots).length + actor.scrolls.flatMap(({ occupiedSlots }) => occupiedSlots).length;
  return element("div", {}, element("p", { className: used > actor.inventoryCapacity ? "warning" : "muted" }, `${used}/${actor.inventoryCapacity} occupied slots${used > actor.inventoryCapacity ? "; granted gear exceeds capacity." : "."}`), table(["Item", "Slots", "Armor"], rows));
}

function companions(actor: CharacterActor): HTMLElement {
  if (actor.companions.length === 0) return element("p", { className: "muted" }, "No background-granted companions.");
  return list(actor.companions.map((companion) => {
    if (companion.kind === "retainer") return `${companion.name}, ${companion.role}: loyalty ${companion.loyalty.score}; talents ${companion.talents.map(({ name }) => name).join(", ")}.`;
    if (companion.kind === "pet") return `${companion.name}, ${companion.petKind}: morale ${companion.morale}; attacks ${companion.attacks.join(", ")}.`;
    return `${companion.name}: morale ${companion.morale}; capacity ${companion.capacity.ridden}/${companion.capacity.unridden} slots ridden/unridden.`;
  }));
}

function facts(actor: CharacterActor): HTMLElement[] {
  const values: readonly { readonly label: string; readonly value: string }[] = [
    { label: "Background", value: actor.background.name },
    { label: "Faction", value: actor.faction },
    { label: "Age", value: String(actor.identity.age) },
    { label: "Ancestry", value: actor.identity.ancestry },
  ];
  return values.map(({ label: labelText, value }) => element("div", { className: "fact" }, element("span", {}, labelText), element("strong", {}, value)));
}

function spellOptions(definitionId: string | undefined, selected: string | undefined): HTMLOptionElement[] {
  const book = rules.spellBooks.find(({ id }) => id === definitionId);
  if (book === undefined) return [];
  return book.spellIds.map((id) => option(id, rules.spells.find((spell) => spell.id === id)?.name ?? id, id === selected));
}

function attributeOptions(selected: AttributeName | undefined): HTMLOptionElement[] { return (["strength", "dexterity", "willpower"] as const).map((attribute) => option(attribute, title(attribute), attribute === selected)); }
function section(heading: string, content: HTMLElement): HTMLElement { return element("section", {}, element("h3", {}, heading), content); }
function list(values: readonly string[]): HTMLElement { return element("ul", { className: "compact-list" }, ...values.map((value) => element("li", {}, value))); }
function table(headers: readonly string[], rows: readonly (readonly string[])[]): HTMLElement {
  const head = element("thead", {}, element("tr", {}, ...headers.map((header) => element("th", {}, header))));
  const bodyRows = rows.map((row) => element("tr", {}, ...row.map((value) => element("td", {}, value))));
  const body = element("tbody", {}, ...bodyRows);
  return element("table", { className: "inventory-table" }, head, body);
}
function label(id: string, text: string, control: HTMLElement): HTMLLabelElement { return element("label", { htmlFor: id }, text, control) as HTMLLabelElement; }
function input(id: string, value: string, type = "text"): HTMLInputElement { return element("input", { id, type, value }) as HTMLInputElement; }
function select(id: string, options: readonly HTMLOptionElement[]): HTMLSelectElement { return element("select", { id }, ...options) as HTMLSelectElement; }
function option(value: string, text: string, selected = false): HTMLOptionElement { return element("option", { value, selected }, text) as HTMLOptionElement; }
function element(tag: string, properties: Record<string, unknown> = {}, ...children: (HTMLElement | string)[]): HTMLElement {
  const node = document.createElement(tag);
  Object.assign(node, properties);
  for (const child of children) node.append(child);
  return node;
}
function setStatus(element: HTMLParagraphElement, kind: StatusKind, text: string): void { element.className = `status ${kind}`; element.textContent = text; }
function safeFilename(value: string): string { const result = value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""); return result.length === 0 ? "character" : result; }
function title(value: string): string { return value.replace(/\b\w/g, (letter) => letter.toUpperCase()); }
function message(error: unknown): string { return error instanceof Error ? error.message : String(error); }

const root = document.querySelector<HTMLElement>("#app");
if (root !== null) mountApp(root);
