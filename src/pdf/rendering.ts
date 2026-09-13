import { PDFDocument, StandardFonts } from "pdf-lib";

import type {
  CharacterActor,
  CompanionActor,
  InventoryItemInstance,
  MountActor,
  PetActor,
  RetainerActor,
} from "../core/actors.ts";
import type {
  CharacterPdfRenderRequest,
  CharacterPdfRenderer,
  ReadonlyPdfBytes,
} from "./contracts.ts";

type FieldValues = Readonly<Record<string, string>>;

/**
 * Renders supplied fillable templates without loading assets or changing the
 * generated document. Completed sheets use Helvetica, so unsupported text is
 * rejected rather than being silently omitted by pdf-lib.
 */
export class PdfLibCharacterRenderer implements CharacterPdfRenderer {
  async render(request: Readonly<CharacterPdfRenderRequest>): Promise<Uint8Array> {
    const { actor } = request.document;
    const result = await PDFDocument.create();

    await appendFilledTemplate(result, request.templates.character, characterValues(actor));

    const retainersAndPets = actor.companions.filter((companion) => companion.kind !== "mount");
    if (retainersAndPets.length > 0) {
      if (request.templates.retainer === undefined) throw new RangeError("retainer template is required for retainer or pet companions");
      for (let index = 0; index < retainersAndPets.length; index += 2) {
        const left = retainersAndPets[index];
        const right = retainersAndPets[index + 1];
        await appendFilledTemplate(result, request.templates.retainer, {
          ...(left === undefined ? {} : retainerPanelValues("left", left)),
          ...(right === undefined ? {} : retainerPanelValues("right", right)),
        });
      }
    }

    const mounts = actor.companions.filter((companion): companion is MountActor => companion.kind === "mount");
    if (mounts.length > 0) {
      if (request.templates.mount === undefined) throw new RangeError("mount template is required for mount companions");
      for (const mount of mounts) await appendFilledTemplate(result, request.templates.mount, mountValues(actor, mount));
    }

    return result.save();
  }
}

async function appendFilledTemplate(output: PDFDocument, bytes: ReadonlyPdfBytes, values: FieldValues): Promise<void> {
  assertHelveticaText(values);
  const filled = await PDFDocument.load(Uint8Array.from(bytes));
  const form = filled.getForm();
  for (const [name, value] of Object.entries(values)) form.getTextField(name).setText(value);
  form.updateFieldAppearances(await filled.embedFont(StandardFonts.Helvetica));
  form.flatten();
  const pages = await output.copyPages(filled, filled.getPageIndices());
  for (const page of pages) output.addPage(page);
}

function characterValues(actor: CharacterActor): FieldValues {
  const armor = armorValue(actor.inventory);
  const inventory = inventoryLines(actor.inventory, actor.spellBooks, actor.scrolls);
  const overflow = inventory.slice(20);
  return {
    "character.name": actor.name,
    "character.experience": actor.rank,
    "character.background": actor.background.name,
    "character.str.current": String(actor.attributes.strength.current),
    "character.str.maximum": String(actor.attributes.strength.maximum),
    "character.dex.current": String(actor.attributes.dexterity.current),
    "character.dex.maximum": String(actor.attributes.dexterity.maximum),
    "character.wil.current": String(actor.attributes.willpower.current),
    "character.wil.maximum": String(actor.attributes.willpower.maximum),
    "character.armor.current": String(armor),
    "character.armor.maximum": String(armor),
    "character.stamina.current": String(actor.stamina.current),
    "character.stamina.maximum": String(actor.stamina.maximum),
    "character.corruption.current": String(actor.corruption.current),
    "character.corruption.maximum": String(actor.corruption.maximum),
    "character.pennies": String(actor.currency.amount),
    "character.talents": actor.talents.map(({ name }) => name).join("\n"),
    "character.spells": spellLines(actor),
    "character.notes": characterNotes(actor, overflow),
    ...Object.fromEntries(inventory.slice(0, 20).map((line, index) => [`character.inventory.${index + 1}`, line])),
  };
}

function retainerPanelValues(panel: "left" | "right", actor: Exclude<CompanionActor, MountActor>): FieldValues {
  const prefix = `retainer.${panel}`;
  const inventory = actor.kind === "retainer" ? inventoryLines(actor.inventory) : [];
  const notes = actor.kind === "retainer" ? retainerNotes(actor, inventory.slice(15)) : petNotes(actor);
  return {
    [`${prefix}.name`]: actor.name,
    [`${prefix}.experience`]: "Novice",
    [`${prefix}.role`]: actor.kind === "retainer" ? actor.role : actor.petKind === "familiar" ? "Familiar" : "Dog",
    [`${prefix}.str.current`]: String(actor.attributes.strength.current),
    [`${prefix}.str.maximum`]: String(actor.attributes.strength.maximum),
    [`${prefix}.dex.current`]: String(actor.attributes.dexterity.current),
    [`${prefix}.dex.maximum`]: String(actor.attributes.dexterity.maximum),
    [`${prefix}.wil.current`]: String(actor.attributes.willpower.current),
    [`${prefix}.wil.maximum`]: String(actor.attributes.willpower.maximum),
    [`${prefix}.stamina.current`]: String(actor.stamina.current),
    [`${prefix}.stamina.maximum`]: String(actor.stamina.maximum),
    ...(actor.kind === "retainer" ? { [`${prefix}.loyalty`]: `${actor.loyalty.score} / ${actor.loyalty.retainerMaximum}` } : {}),
    [`${prefix}.notes`]: notes,
    ...Object.fromEntries(inventory.slice(0, 15).map((line, index) => [`${prefix}.inventory.${index + 1}`, line])),
  };
}

function mountValues(character: CharacterActor, mount: MountActor): FieldValues {
  const inventory = inventoryLines(mount.inventory);
  return {
    "mount.name": mount.name,
    "mount.player": character.name,
    "mount.type": mount.name,
    "mount.str.current": String(mount.attributes.strength.current),
    "mount.str.maximum": String(mount.attributes.strength.maximum),
    "mount.dex.current": String(mount.attributes.dexterity.current),
    "mount.dex.maximum": String(mount.attributes.dexterity.maximum),
    "mount.wil.current": String(mount.attributes.willpower.current),
    "mount.wil.maximum": String(mount.attributes.willpower.maximum),
    "mount.stamina.current": String(mount.stamina.current),
    "mount.stamina.maximum": String(mount.stamina.maximum),
    "mount.morale": String(mount.morale),
    "mount.notes": [
      `Capacity: ${mount.capacity.ridden} ridden / ${mount.capacity.unridden} unridden slots.`,
      ...(mount.travel === undefined ? [] : [`Travel: ${mount.travel}`]),
      ...(mount.attacks.length === 0 ? [] : [`Attacks: ${mount.attacks.join(", ")}`]),
      ...(mount.abilities.length === 0 ? [] : [`Abilities: ${mount.abilities.join(", ")}`]),
      ...mount.notes,
      ...(inventory.slice(60).length === 0 ? [] : ["Additional inventory:", ...inventory.slice(60)]),
    ].join("\n"),
    ...Object.fromEntries(inventory.slice(0, 60).map((line, index) => [`mount.inventory.${index + 1}`, line])),
  };
}

function inventoryLines(inventory: readonly InventoryItemInstance[], books: CharacterActor["spellBooks"] = [], scrolls: CharacterActor["scrolls"] = []): readonly string[] {
  return [
    ...inventory.map((item) => inventoryLine(item)),
    ...books.map((book) => slotLine(book.occupiedSlots, book.name)),
    ...scrolls.map((scroll) => slotLine(scroll.occupiedSlots, scroll.name)),
  ];
}

function inventoryLine(item: InventoryItemInstance): string {
  const quantity = item.quantity === 1 ? "" : ` x${item.quantity}`;
  return slotLine(item.occupiedSlots, `${item.name}${quantity}`);
}

function slotLine(slots: readonly number[], name: string): string {
  if (slots.length === 0) return `Trivial: ${name}`;
  const label = slots.length === 1 ? String(slots[0]) : `${slots[0]}-${slots.at(-1)}`;
  return `${label}: ${name}`;
}

function armorValue(inventory: readonly InventoryItemInstance[]): number {
  return Math.max(0, ...inventory.flatMap((item) => item.armor?.canWear ? [item.armor.armorValue] : []));
}

function spellLines(actor: CharacterActor): string {
  return [
    ...actor.spellBooks.flatMap((book) => book.spells.map((spell) => `${book.name}: ${spell.name}${spell.wording === undefined ? "" : ` - ${spell.wording}`}`)),
    ...actor.scrolls.map((scroll) => `Scroll: ${scroll.name}`),
  ].join("\n");
}

function characterNotes(actor: CharacterActor, overflow: readonly string[]): string {
  return [
    `Age: ${actor.identity.age}; Ancestry: ${actor.identity.ancestry}; Capacity: ${actor.inventoryCapacity} slots.`,
    `Traits: ${Object.entries(actor.traits).map(([name, value]) => `${name}: ${value}`).join("; ")}`,
    ...actor.inventory.filter((item) => item.armor !== undefined && !item.armor.canWear).map((item) => `${item.name} is owned but cannot currently be worn.`),
    ...actor.notes,
    ...(overflow.length === 0 ? [] : ["Additional inventory:", ...overflow]),
  ].join("\n");
}

function retainerNotes(actor: RetainerActor, overflow: readonly string[]): string {
  return [
    `Talents: ${actor.talents.map(({ name }) => name).join(", ")}.`,
    ...actor.notes,
    ...(overflow.length === 0 ? [] : ["Additional inventory:", ...overflow]),
  ].join("\n");
}

function petNotes(actor: PetActor): string {
  return [`Morale: ${actor.morale}.`, ...(actor.attacks.length === 0 ? [] : [`Attacks: ${actor.attacks.join(", ")}`]), ...actor.notes].join("\n");
}

function assertHelveticaText(values: FieldValues): void {
  for (const [field, value] of Object.entries(values)) {
    for (const character of value) {
      const codePoint = character.codePointAt(0);
      if (codePoint === undefined || (codePoint < 32 && character !== "\n") || codePoint > 126) {
        throw new RangeError(`PDF field ${field} contains unsupported Helvetica character U+${codePoint?.toString(16).toUpperCase().padStart(4, "0") ?? "UNKNOWN"}`);
      }
    }
  }
}
