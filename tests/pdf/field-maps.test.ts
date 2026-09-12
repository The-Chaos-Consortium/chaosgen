import { readFile } from "node:fs/promises";

import { describe, expect, it } from "vitest";
import { PDFDocument, PDFTextField } from "pdf-lib";

const templates = [
  { path: "templates/fillable/character.pdf", pages: 2, fields: 41, multiline: ["character.spells", "character.talents", "character.notes"] },
  { path: "templates/fillable/retainer.pdf", pages: 1, fields: 66, multiline: ["retainer.left.notes", "retainer.right.notes"] },
  { path: "templates/fillable/mount.pdf", pages: 1, fields: 77, multiline: ["mount.notes"] },
] as const;

describe("fillable PDF templates", () => {
  it.each(templates)("preserves pages and creates all mapped editable fields for $path", async ({ path, pages, fields, multiline }) => {
    const pdf = await PDFDocument.load(await readFile(path));
    const formFields = pdf.getForm().getFields();

    expect(pdf.isEncrypted).toBe(false);
    expect(pdf.getPageCount()).toBe(pages);
    expect(formFields).toHaveLength(fields);
    expect(new Set(formFields.map((field) => field.getName())).size).toBe(fields);
    multiline.forEach((name) => {
      const field = pdf.getForm().getTextField(name);
      expect(field).toBeInstanceOf(PDFTextField);
      expect(field.isMultiline()).toBe(true);
    });
  });

  it("has unique left and right retainer-panel field namespaces", async () => {
    const pdf = await PDFDocument.load(await readFile("templates/fillable/retainer.pdf"));
    const names = pdf.getForm().getFields().map((field) => field.getName());

    expect(names.filter((name) => name.startsWith("retainer.left."))).toHaveLength(33);
    expect(names.filter((name) => name.startsWith("retainer.right."))).toHaveLength(33);
  });

  it("maps all sixty mount inventory rows without treating them as capacity", async () => {
    const pdf = await PDFDocument.load(await readFile("templates/fillable/mount.pdf"));
    const names = new Set(pdf.getForm().getFields().map((field) => field.getName()));

    expect(Array.from({ length: 60 }, (_, index) => `mount.inventory.${index + 1}`).every((name) => names.has(name))).toBe(true);
  });
});
