import { mkdir, readFile, writeFile } from "node:fs/promises";
import { customizeCharacter, generateCharacter } from "../src/core/generation.ts";
import { createSeededRandom } from "../src/core/rng.ts";
import type { GeneratedCharacterDocument } from "../src/pdf/contracts.ts";
import { PdfLibCharacterRenderer } from "../src/pdf/rendering.ts";

const outputDirectory = new URL("../output/pdf-review/", import.meta.url);
const renderer = new PdfLibCharacterRenderer();
const templates = await loadTemplates();

const samples = [
  ["01-knight", character("knight")],
  ["02-roadwarden", character("roadwarden")],
  ["03-witch", character("witch")],
  ["04-warpriest", character("warpriest")],
  ["05-duelist", character("duelist")],
  ["06-long-name-custom-spell", longCustomSpellCharacter()],
] as const;

await mkdir(outputDirectory, { recursive: true });
for (const [name, document] of samples) {
  const path = new URL(`${name}.pdf`, outputDirectory);
  await writeFile(path, await renderer.render({ document, templates }));
  console.log(`output/pdf-review/${name}.pdf`);
}

function character(backgroundId: string): GeneratedCharacterDocument {
  const seed = `pdf-review/${backgroundId}`;
  const generated = generateCharacter({ backgroundId, seed, random: createSeededRandom(seed) });
  if (generated.actor.kind !== "character") throw new Error("expected a generated character");
  return { ...generated, actor: generated.actor };
}

function longCustomSpellCharacter(): GeneratedCharacterDocument {
  const witch = character("witch");
  const startingSpells = Object.fromEntries(witch.actor.spellBooks.map((book) => [book.instanceId, {
    customWording: "A synthetic, deliberately long spell description for visual review. It repeats clear ASCII wording so that wrapping, overflow, and notes remain readable in the completed PDF without testing private character data.",
  }]));
  const customized = customizeCharacter(witch, {
    name: "Synthetic Character With An Intentionally Long Name For PDF Field Fit Review",
    startingSpells,
  });
  if (customized.actor.kind !== "character") throw new Error("expected a customized character");
  return { ...customized, actor: customized.actor };
}

async function loadTemplates() {
  const template = (name: string) => readFile(new URL(`../templates/fillable/${name}.pdf`, import.meta.url));
  const [character, retainer, mount] = await Promise.all([
    template("character"),
    template("retainer"),
    template("mount"),
  ]);
  return { character, retainer, mount };
}
