import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { basename, dirname, join } from "node:path";
import { PDFDocument, PDFName, StandardFonts, TextAlignment, rgb } from "pdf-lib";

const root = new URL("..", import.meta.url).pathname;
const templatesDirectory = join(root, "templates");
const outputDirectory = join(templatesDirectory, "fillable");
const debugDirectory = join(templatesDirectory, "debug");
const mapDirectory = join(root, "src", "pdf", "field-maps");
const debug = process.argv.includes("--debug");
const updateExisting = process.argv.includes("--update-existing");
const reproducibleDate = new Date("2026-01-01T00:00:00.000Z");

if (debug && updateExisting) throw new Error("--debug and --update-existing cannot be used together");

for (const mapName of ["character", "retainer", "mount"]) {
  const map = JSON.parse(await readFile(join(mapDirectory, `${mapName}.json`), "utf8"));
  const sourcePath = join(templatesDirectory, map.source);
  const inputPath = updateExisting ? join(outputDirectory, map.output) : sourcePath;
  const source = await readFile(inputPath);
  const fields = expandFields(map);
  const pdf = await PDFDocument.load(source);
  pdf.setCreationDate(reproducibleDate);
  pdf.setModificationDate(reproducibleDate);
  const pages = pdf.getPages();
  if (pdf.isEncrypted || pages.length !== map.pages || pages.some((page) => page.getRotation().angle !== 0 || page.getWidth() !== 792 || page.getHeight() !== 612)) {
    throw new Error(`${inputPath} does not match the audited template metadata`);
  }
  const form = pdf.getForm();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  if (updateExisting) {
    if (form.getFields().length !== fields.length) throw new Error(`${inputPath} field count mismatch`);
    for (const text of form.getFields()) {
      text.setAlignment(fieldAlignment(text.getName()));
      for (const widget of text.acroField.getWidgets()) {
        widget.getAppearanceCharacteristics()?.dict.delete(PDFName.of("BG"));
      }
    }
    form.updateFieldAppearances(font);
  } else {
    if (form.getFields().length !== 0) throw new Error(`${map.source} unexpectedly has existing form fields`);
    for (const field of fields) {
      const text = form.createTextField(field.name);
      if (field.multiline) text.enableMultiline();
      text.addToPage(pages[field.page], {
        x: field.x,
        y: field.y,
        width: field.width,
        height: field.height,
        borderWidth: 0,
        // pdf-lib defaults absent backgroundColor options to opaque white.
        backgroundColor: undefined,
        textColor: rgb(0, 0, 0),
        font,
        fontSize: field.multiline ? 8 : 10,
      });
      text.setFontSize(field.multiline ? 8 : 10);
      text.setAlignment(fieldAlignment(field.name));
      if (debug) text.setText(debugLabel(field));
    }
  }
  if (form.getFields().length !== fields.length) throw new Error(`${map.source} field creation count mismatch`);
  if (debug) {
    form.updateFieldAppearances(font);
    form.flatten();
  }
  const directory = debug ? debugDirectory : outputDirectory;
  await mkdir(directory, { recursive: true });
  await writeFile(join(directory, map.output), await pdf.save({ useObjectStreams: false }));
  console.log(JSON.stringify({ source: basename(inputPath), sha256: createHash("sha256").update(source).digest("hex"), fields: fields.length, output: join("templates", debug ? "debug" : "fillable", map.output) }));
}

function expandFields(map) {
  const fields = map.fields.map(([name, page, x, y, width, height, multiline = false]) => ({ name, page, x, y, width, height, multiline }));
  for (const [prefix, page, first, count, x, y, width, height, yStep] of map.repeating) {
    for (let offset = 0; offset < count; offset += 1) fields.push({ name: `${prefix}${first + offset}`, page, x, y: y - offset * yStep, width, height, multiline: false });
  }
  const names = new Set(fields.map(({ name }) => name));
  if (names.size !== fields.length) throw new Error(`${map.source} has duplicate field names`);
  return fields;
}

function debugLabel(field) {
  return field.multiline ? "Synthetic debug text" : field.name.split(".").at(-1);
}

function fieldAlignment(name) {
  return name.includes(".inventory.") || name.endsWith(".spells") || name.endsWith(".talents") || name.endsWith(".notes")
    ? TextAlignment.Left
    : TextAlignment.Center;
}
