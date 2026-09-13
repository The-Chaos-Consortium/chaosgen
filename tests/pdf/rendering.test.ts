import { readFile } from "node:fs/promises";

import { describe, expect, it } from "vitest";
import { PDFDocument, PDFTextField } from "pdf-lib";

import { generateCharacter } from "../../src/core/generation.ts";
import { createSeededRandom } from "../../src/core/rng.ts";
import { rules } from "../../src/core/rules.ts";
import { PdfLibCharacterRenderer } from "../../src/pdf/rendering.ts";
import type { GeneratedCharacterDocument } from "../../src/pdf/contracts.ts";

const renderer = new PdfLibCharacterRenderer();

async function templates() {
  const [character, retainer, mount] = await Promise.all([
    readFile("templates/fillable/character.pdf"),
    readFile("templates/fillable/retainer.pdf"),
    readFile("templates/fillable/mount.pdf"),
  ]);
  return { character, retainer, mount };
}

function document(backgroundId: string): GeneratedCharacterDocument {
  const generated = generateCharacter({
    seed: `pdf/${backgroundId}`,
    backgroundId,
    random: createSeededRandom(`pdf/${backgroundId}`),
  });
  if (generated.actor.kind !== "character") throw new Error("expected a character");
  return { ...generated, actor: generated.actor };
}

describe("PdfLibCharacterRenderer", () => {
  it("keeps editable fields while assembling the character, retainer, and mount sheets without mutating a knight", async () => {
    const knight = document("knight");
    if (knight.actor.kind !== "character") throw new Error("expected a character");
    const before = structuredClone(knight);

    const pdf = await PDFDocument.load(await renderer.render({ document: knight, templates: await templates() }));

    expect(pdf.getPageCount()).toBe(4);
    expect(pdf.getForm().getFields()).toHaveLength(184);
    const firstSlot = knight.actor.inventory.find(({ occupiedSlots }) => occupiedSlots.includes(1));
    if (firstSlot === undefined) throw new Error("expected an item in inventory slot 1");
    const squire = knight.actor.companions.find((companion) => companion.kind === "retainer");
    if (squire === undefined) throw new Error("expected a squire");
    expect(pdf.getForm().getTextField("character.inventory.1").getText()).toBe(firstSlot.name);
    expect(pdf.getForm().getTextField("character.inventory.2").getText()).toBe(firstSlot.name);
    expect(pdf.getForm().getTextField("retainer.left.loyalty").getText()).toBe(String(squire.loyalty.score));
    pdf.getForm().getFields().forEach((field) => {
      field.acroField.getWidgets().forEach((widget) => {
        expect(widget.getAppearanceCharacteristics()?.getBackgroundColor()).toBeUndefined();
      });
    });
    expect(knight).toEqual(before);
  });

  it("uses the dedicated mount page for a roadwarden and no companion page for a duelist", async () => {
    const roadwarden = await PDFDocument.load(await renderer.render({ document: document("roadwarden"), templates: await templates() }));
    const duelist = await PDFDocument.load(await renderer.render({ document: document("duelist"), templates: await templates() }));

    expect(roadwarden.getPageCount()).toBe(3);
    expect(duelist.getPageCount()).toBe(2);
  });

  it("marks zero-slot gear as trivial", async () => {
    const warpriest = document("warpriest");
    if (warpriest.actor.kind !== "character") throw new Error("expected a character");
    const holySymbol = warpriest.actor.inventory.find(({ name }) => name === "Holy Symbol");
    if (holySymbol === undefined || holySymbol.occupiedSlots.length !== 0) throw new Error("expected a trivial holy symbol");
    const pdf = await PDFDocument.load(await renderer.render({ document: warpriest, templates: await templates() }));

    expect(pdf.getForm().getFields().some((field) => (field as PDFTextField).getText() === "Holy Symbol - trivial")).toBe(true);
  });

  it("rejects custom wording Helvetica cannot encode instead of dropping it", async () => {
    const witch = document("witch");
    if (witch.actor.kind !== "character") throw new Error("expected a character");
    const custom = {
      ...witch,
      actor: { ...witch.actor, spellBooks: witch.actor.spellBooks.map((book) => ({ ...book, spells: [{ name: "Custom spell", wording: "Snowman: ☃" }] })) },
    };

    await expect(renderer.render({ document: custom, templates: await templates() })).rejects.toThrow("unsupported Helvetica character U+2603");
  });

  it("exports every background as an editable PDF", async () => {
    const suppliedTemplates = await templates();

    for (const background of rules.backgrounds) {
      const pdf = await PDFDocument.load(await renderer.render({
        document: document(background.id),
        templates: suppliedTemplates,
      }));
      expect(pdf.getForm().getFields().length).toBeGreaterThanOrEqual(41);
      expect(pdf.getPageCount()).toBeGreaterThanOrEqual(2);
    }
  });
});
