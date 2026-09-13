import { readFile } from "node:fs/promises";

import { describe, expect, it } from "vitest";
import { PDFDocument } from "pdf-lib";

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
  it("flattens and assembles the character, retainer, and mount sheets without mutating a knight", async () => {
    const knight = document("knight");
    if (knight.actor.kind !== "character") throw new Error("expected a character");
    const before = structuredClone(knight);

    const pdf = await PDFDocument.load(await renderer.render({ document: knight, templates: await templates() }));

    expect(pdf.getPageCount()).toBe(4);
    expect(pdf.getForm().getFields()).toHaveLength(0);
    expect(knight).toEqual(before);
  });

  it("uses the dedicated mount page for a roadwarden and no companion page for a duelist", async () => {
    const roadwarden = await PDFDocument.load(await renderer.render({ document: document("roadwarden"), templates: await templates() }));
    const duelist = await PDFDocument.load(await renderer.render({ document: document("duelist"), templates: await templates() }));

    expect(roadwarden.getPageCount()).toBe(3);
    expect(duelist.getPageCount()).toBe(2);
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

  it("exports every background as a flattened PDF", async () => {
    const suppliedTemplates = await templates();

    for (const background of rules.backgrounds) {
      const pdf = await PDFDocument.load(await renderer.render({
        document: document(background.id),
        templates: suppliedTemplates,
      }));
      expect(pdf.getForm().getFields()).toHaveLength(0);
      expect(pdf.getPageCount()).toBeGreaterThanOrEqual(2);
    }
  });
});
