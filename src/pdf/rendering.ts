import { PDFDocument, PDFFont, PDFName, PDFTextField, StandardFonts } from "pdf-lib";

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
 * generated document. Editable sheets use Helvetica, so unsupported text is
 * rejected rather than being silently omitted by pdf-lib.
 */
export class PdfLibCharacterRenderer implements CharacterPdfRenderer {
  async render(request: Readonly<CharacterPdfRenderRequest>): Promise<Uint8Array> {
    const { actor } = request.document;
    const result = await filledTemplate(request.templates.character, characterValues(actor));

    const retainersAndPets = actor.companions.filter((companion) => companion.kind !== "mount");
    if (retainersAndPets.length > 0) {
      if (request.templates.retainer === undefined) throw new RangeError("retainer template is required for retainer or pet companions");
      for (let index = 0; index < retainersAndPets.length; index += 2) {
        const left = retainersAndPets[index];
        const right = retainersAndPets[index + 1];
        await appendEditableTemplate(result, request.templates.retainer, {
          ...(left === undefined ? {} : retainerPanelValues("left", left)),
          ...(right === undefined ? {} : retainerPanelValues("right", right)),
        });
      }
    }

    const mounts = actor.companions.filter((companion): companion is MountActor => companion.kind === "mount");
    if (mounts.length > 0) {
      if (request.templates.mount === undefined) throw new RangeError("mount template is required for mount companions");
      for (const mount of mounts) await appendEditableTemplate(result, request.templates.mount, mountValues(actor, mount));
    }

    return result.save();
  }
}

async function filledTemplate(bytes: ReadonlyPdfBytes, values: FieldValues): Promise<PDFDocument> {
  assertHelveticaText(values);
  const filled = await PDFDocument.load(Uint8Array.from(bytes));
  const form = filled.getForm();
  const font = await filled.embedFont(StandardFonts.Helvetica);
  for (const [name, value] of Object.entries(values)) setFittedText(form.getTextField(name), value, font);
  form.updateFieldAppearances(font);
  return filled;
}

async function appendEditableTemplate(output: PDFDocument, bytes: ReadonlyPdfBytes, values: FieldValues): Promise<void> {
  const filled = await filledTemplate(bytes, values);
  const pages = await output.copyPages(filled, filled.getPageIndices());
  for (const page of pages) output.addPage(page);
  const targetPage = pages[0];
  if (targetPage === undefined || pages.length !== 1) throw new RangeError("companion templates must contain exactly one page");

  // Copied page annotations are not registered in the target AcroForm. Rebuild
  // them from the source widgets so the assembled PDF remains editable.
  targetPage.node.delete(PDFName.of("Annots"));
  const form = output.getForm();
  const existingNames = new Set(form.getFields().map((field) => field.getName()));
  const font = await output.embedFont(StandardFonts.Helvetica);
  for (const sourceField of filled.getForm().getFields()) {
    if (!(sourceField instanceof PDFTextField)) throw new TypeError(`${sourceField.getName()} is not a text field`);
    const widget = sourceField.acroField.getWidgets()[0];
    if (widget === undefined) throw new RangeError(`${sourceField.getName()} is missing its widget`);
    const rectangle = widget.getRectangle();
    const name = uniqueFieldName(sourceField.getName(), existingNames);
    const targetField = form.createTextField(name);
    if (sourceField.isMultiline()) targetField.enableMultiline();
    targetField.addToPage(targetPage, {
      x: rectangle.x,
      y: rectangle.y,
      width: rectangle.width,
      height: rectangle.height,
      borderWidth: 0,
      font,
    });
    targetField.acroField.getWidgets().forEach((targetWidget) => {
      targetWidget.getAppearanceCharacteristics()?.dict.delete(PDFName.of("BG"));
    });
    targetField.setAlignment(sourceField.getAlignment());
    setFittedText(targetField, sourceField.getText() ?? "", font);
  }
  form.updateFieldAppearances(font);
}

/** Keeps editable appearances readable and rejects text that cannot fit safely. */
function setFittedText(field: PDFTextField, value: string, font: PDFFont): void {
  const rectangle = field.acroField.getWidgets()[0]?.getRectangle();
  if (rectangle === undefined) throw new RangeError(`${field.getName()} is missing its widget`);
  const maximum = field.isMultiline() ? 8 : 10;
  const minimum = 5;
  for (let size = maximum; size >= minimum; size -= 0.5) {
    if (textFits(value, rectangle.width, rectangle.height, size, field.isMultiline(), font)) {
      field.setFontSize(size);
      field.setText(value);
      return;
    }
  }
  if (!field.isMultiline() && field.getName().endsWith(".name")) {
    field.enableMultiline();
    for (let size = maximum; size >= minimum; size -= 0.5) {
      if (textFits(value, rectangle.width, rectangle.height, size, true, font)) {
        field.setFontSize(size);
        field.setText(value);
        return;
      }
    }
  }
  throw new RangeError(`PDF field ${field.getName()} text does not fit at ${minimum}pt`);
}

function textFits(value: string, width: number, height: number, size: number, multiline: boolean, font: PDFFont): boolean {
  const usableWidth = Math.max(1, width - 4);
  if (!multiline) return font.widthOfTextAtSize(value, size) <= usableWidth;
  const lines = value.split("\n").reduce((count, paragraph) => count + wrappedLineCount(paragraph, usableWidth, size, font), 0);
  return lines * size * 1.2 <= Math.max(1, height - 4);
}

function wrappedLineCount(paragraph: string, width: number, size: number, font: PDFFont): number {
  if (paragraph.length === 0) return 1;
  let lines = 1;
  let line = "";
  for (const word of paragraph.split(/\s+/)) {
    const candidate = line.length === 0 ? word : `${line} ${word}`;
    if (font.widthOfTextAtSize(candidate, size) <= width) {
      line = candidate;
    } else if (line.length === 0) {
      lines += Math.ceil(font.widthOfTextAtSize(word, size) / width) - 1;
      line = word;
    } else {
      lines += 1;
      line = word;
    }
  }
  return lines;
}

function uniqueFieldName(name: string, existingNames: Set<string>): string {
  if (!existingNames.has(name)) {
    existingNames.add(name);
    return name;
  }
  let suffix = 2;
  while (existingNames.has(`${name}.${suffix}`)) suffix += 1;
  const unique = `${name}.${suffix}`;
  existingNames.add(unique);
  return unique;
}

function characterValues(actor: CharacterActor): FieldValues {
  const armor = armorValue(actor.inventory);
  const inventory = inventoryFields("character.inventory", 20, inventoryEntries(actor.inventory, actor.spellBooks, actor.scrolls));
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
    "character.notes": characterNotes(actor, inventory.overflow),
    ...inventory.values,
  };
}

function retainerPanelValues(panel: "left" | "right", actor: Exclude<CompanionActor, MountActor>): FieldValues {
  const prefix = `retainer.${panel}`;
  const inventory = actor.kind === "retainer"
    ? inventoryFields(`${prefix}.inventory`, 15, inventoryEntries(actor.inventory))
    : { values: {}, overflow: [] };
  const notes = actor.kind === "retainer" ? retainerNotes(actor, inventory.overflow) : petNotes(actor);
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
    ...(actor.kind === "retainer" ? { [`${prefix}.loyalty`]: String(actor.loyalty.score) } : {}),
    [`${prefix}.notes`]: notes,
    ...inventory.values,
  };
}

function mountValues(character: CharacterActor, mount: MountActor): FieldValues {
  const inventory = inventoryFields("mount.inventory", 60, inventoryEntries(mount.inventory));
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
      ...(inventory.overflow.length === 0 ? [] : ["Additional inventory:", ...inventory.overflow]),
    ].join("\n"),
    ...inventory.values,
  };
}

function inventoryEntries(inventory: readonly InventoryItemInstance[], books: CharacterActor["spellBooks"] = [], scrolls: CharacterActor["scrolls"] = []): readonly { readonly name: string; readonly slots: readonly number[] }[] {
  return [
    ...inventory.map((item) => ({ name: inventoryName(item), slots: item.occupiedSlots })),
    ...books.map((book) => ({ name: book.name, slots: book.occupiedSlots })),
    ...scrolls.map((scroll) => ({ name: scroll.name, slots: scroll.occupiedSlots })),
  ];
}

function inventoryName(item: InventoryItemInstance): string {
  return item.quantity === 1 || item.occupiedSlots.length > 0 ? item.name : `${item.name} x${item.quantity}`;
}

function inventoryFields(prefix: string, rowCount: number, entries: readonly { readonly name: string; readonly slots: readonly number[] }[]): { readonly values: FieldValues; readonly overflow: readonly string[] } {
  const values: Record<string, string> = {};
  const overflow: string[] = [];
  const trivial: string[] = [];
  for (const entry of entries) {
    if (entry.slots.length === 0) {
      trivial.push(`${entry.name} - trivial`);
      continue;
    }
    for (const slot of entry.slots) {
      if (slot > rowCount) overflow.push(entry.name);
      else values[`${prefix}.${slot}`] = entry.name;
    }
  }
  for (const name of trivial) {
    const row = Array.from({ length: rowCount }, (_, index) => index + 1).find((index) => values[`${prefix}.${index}`] === undefined);
    if (row === undefined) overflow.push(name);
    else values[`${prefix}.${row}`] = name;
  }
  return { values, overflow };
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
    `Age: ${actor.identity.age}; Ancestry: ${actor.identity.ancestry}; Faction: ${actor.faction}; Capacity: ${actor.inventoryCapacity} slots.`,
    `Traits: ${Object.entries(actor.traits).map(([name, value]) => `${name}: ${value}`).join("; ")}`,
    ...actor.inventory.filter((item) => item.armor !== undefined && !item.armor.canWear).map((item) => `${item.name} is owned but cannot currently be worn.`),
    ...actor.notes,
    ...(overflow.length === 0 ? [] : ["Additional inventory:", ...overflow]),
  ].join("\n");
}

function retainerNotes(actor: RetainerActor, overflow: readonly string[]): string {
  return [
    `Capacity: ${actor.inventoryCapacity} slots.`,
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
