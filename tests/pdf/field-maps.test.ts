import { readFile } from "node:fs/promises";

import { describe, expect, it } from "vitest";
import { PDFDocument, PDFTextField, TextAlignment } from "pdf-lib";

const templates = [
  { path: "templates/fillable/character.pdf", map: "src/pdf/field-maps/character.json", pages: 2, fields: 41, multiline: ["character.spells", "character.talents", "character.notes"] },
  { path: "templates/fillable/retainer.pdf", map: "src/pdf/field-maps/retainer.json", pages: 1, fields: 66, multiline: ["retainer.left.notes", "retainer.right.notes"] },
  { path: "templates/fillable/mount.pdf", map: "src/pdf/field-maps/mount.json", pages: 1, fields: 77, multiline: ["mount.notes"] },
] as const;

type FieldMap = {
  fields: Array<[string, number, number, number, number, number, boolean?]>;
  repeating: Array<[string, number, number, number, number, number, number, number, number]>;
};

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

  it.each(templates)("uses transparent fills for every field in $path", async ({ path }) => {
    const pdf = await PDFDocument.load(await readFile(path));

    pdf.getForm().getFields().forEach((field) => {
      field.acroField.getWidgets().forEach((widget) => {
        expect(widget.getAppearanceCharacteristics()?.getBackgroundColor()).toBeUndefined();
      });
    });
  });

  it.each(templates)("aligns text appropriately in $path", async ({ path }) => {
    const pdf = await PDFDocument.load(await readFile(path));

    pdf.getForm().getFields().forEach((field) => {
      const leftAligned = field.getName().includes(".inventory.")
        || field.getName().endsWith(".spells")
        || field.getName().endsWith(".talents")
        || field.getName().endsWith(".notes");
      expect((field as PDFTextField).getAlignment()).toBe(leftAligned ? TextAlignment.Left : TextAlignment.Center);
    });
  });

  it.each(templates)("matches the checked-in field rectangles for $path", async ({ path, map: mapPath }) => {
    const pdf = await PDFDocument.load(await readFile(path));
    const map = JSON.parse(await readFile(mapPath, "utf8")) as FieldMap;
    const fields = [
      ...map.fields.map(([name, page, x, y, width, height]) => ({ name, page, x, y, width, height })),
      ...map.repeating.flatMap(([prefix, page, first, count, x, y, width, height, yStep]) => (
        Array.from({ length: count }, (_, offset) => ({ name: `${prefix}${first + offset}`, page, x, y: y - offset * yStep, width, height }))
      )),
    ];

    expect(fields).toHaveLength(pdf.getForm().getFields().length);
    fields.forEach(({ name, x, y, width, height }) => {
      const widgets = pdf.getForm().getTextField(name).acroField.getWidgets();
      expect(widgets).toHaveLength(1);
      const widget = widgets[0];
      if (!widget) throw new Error(`${name} is missing its widget`);
      const rectangle = widget.getRectangle();
      expect(rectangle.x).toBeCloseTo(x, 6);
      expect(rectangle.y).toBeCloseTo(y, 6);
      expect(rectangle.width).toBeCloseTo(width, 6);
      expect(rectangle.height).toBeCloseTo(height, 6);
    });
  });

  it("maps all sixty mount inventory rows without treating them as capacity", async () => {
    const pdf = await PDFDocument.load(await readFile("templates/fillable/mount.pdf"));
    const names = new Set(pdf.getForm().getFields().map((field) => field.getName()));

    expect(Array.from({ length: 60 }, (_, index) => `mount.inventory.${index + 1}`).every((name) => names.has(name))).toBe(true);
  });
});
