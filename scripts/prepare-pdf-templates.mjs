import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { basename, dirname, join } from "node:path";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

const root = new URL("..", import.meta.url).pathname;
const templatesDirectory = join(root, "templates");
const outputDirectory = join(templatesDirectory, "fillable");
const debugDirectory = join(templatesDirectory, "debug");
const mapDirectory = join(root, "src", "pdf", "field-maps");
const debug = process.argv.includes("--debug");
const reproducibleDate = new Date("2026-01-01T00:00:00.000Z");

for (const mapName of ["character", "retainer", "mount"]) {
  const map = JSON.parse(await readFile(join(mapDirectory, `${mapName}.json`), "utf8"));
  const sourcePath = join(templatesDirectory, map.source);
  const source = await readFile(sourcePath);
  const fields = expandFields(map);
  const pdf = await PDFDocument.load(source);
  pdf.setCreationDate(reproducibleDate);
  pdf.setModificationDate(reproducibleDate);
  const pages = pdf.getPages();
  if (pdf.isEncrypted || pages.length !== map.pages || pages.some((page) => page.getRotation().angle !== 0 || page.getWidth() !== 792 || page.getHeight() !== 612)) {
    throw new Error(`${map.source} does not match the audited template metadata`);
  }
  const form = pdf.getForm();
  if (form.getFields().length !== 0) throw new Error(`${map.source} unexpectedly has existing form fields`);
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  for (const field of fields) {
    const text = form.createTextField(field.name);
    if (field.multiline) text.enableMultiline();
    text.addToPage(pages[field.page], {
      x: field.x,
      y: field.y,
      width: field.width,
      height: field.height,
      borderWidth: 0,
      textColor: rgb(0, 0, 0),
      font,
      fontSize: field.multiline ? 8 : 10,
    });
    text.setFontSize(field.multiline ? 8 : 10);
    if (debug) text.setText(debugLabel(field));
  }
  if (form.getFields().length !== fields.length) throw new Error(`${map.source} field creation count mismatch`);
  if (debug) {
    form.updateFieldAppearances(font);
    form.flatten();
  }
  const directory = debug ? debugDirectory : outputDirectory;
  await mkdir(directory, { recursive: true });
  await writeFile(join(directory, map.output), await pdf.save({ useObjectStreams: false }));
  console.log(JSON.stringify({ source: basename(sourcePath), sha256: createHash("sha256").update(source).digest("hex"), fields: fields.length, output: join("templates", debug ? "debug" : "fillable", map.output) }));
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
