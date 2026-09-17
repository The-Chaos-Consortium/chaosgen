import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { randomUUID } from "node:crypto";

import { generateCharacter } from "../core/generation.ts";
import { createSeededRandom, deriveBatchSeed } from "../core/rng.ts";
import { rules } from "../core/rules.ts";
import type { GeneratedCharacterDocument, PdfTemplateKind, PdfTemplateSet } from "../pdf/contracts.ts";
import { PdfLibCharacterRenderer } from "../pdf/rendering.ts";

interface CliOptions {
  readonly backgroundId?: string;
  readonly count: number;
  readonly all: boolean;
  readonly seed?: string;
  readonly output?: string;
  readonly outputDirectory?: string;
}

const templateUrls: Readonly<Record<PdfTemplateKind, URL>> = {
  character: new URL("../../templates/fillable/character.pdf", import.meta.url),
  retainer: new URL("../../templates/fillable/retainer.pdf", import.meta.url),
  mount: new URL("../../templates/fillable/mount.pdf", import.meta.url),
};

export async function runCli(arguments_: readonly string[], write: (message: string) => void = console.log): Promise<void> {
  const options = parseOptions(arguments_);
  const backgrounds: readonly (string | undefined)[] = options.all
    ? rules.backgrounds.map(({ id }) => id)
    : Array.from({ length: options.count }, () => options.backgroundId);
  const rootSeed = options.seed ?? randomUUID();
  const renderer = new PdfLibCharacterRenderer();

  if (options.outputDirectory !== undefined) await mkdir(options.outputDirectory, { recursive: true });
  for (const [index, background] of backgrounds.entries()) {
    const seed = backgrounds.length === 1 ? rootSeed : deriveBatchSeed(rootSeed, index);
    const document = generateCharacter({
      seed,
      random: createSeededRandom(seed),
      ...(background === undefined ? {} : { backgroundId: background }),
    });
    if (document.actor.kind !== "character") throw new TypeError("CLI generation must produce a character");
    const characterDocument: GeneratedCharacterDocument = { ...document, actor: document.actor };
    const templates = await loadTemplates();
    const pdf = await renderer.render({ document: characterDocument, templates });
    const outputPath = outputPathFor(options, characterDocument.actor.background.id, index, backgrounds.length);
    write(await writePdf(outputPath, pdf, options.output === undefined));
  }
}

export function parseOptions(arguments_: readonly string[]): CliOptions {
  let backgroundId: string | undefined;
  let count = 1;
  let countSpecified = false;
  let all = false;
  let seed: string | undefined;
  let output: string | undefined;
  let outputDirectory: string | undefined;

  for (let index = 0; index < arguments_.length; index += 1) {
    const argument = arguments_[index]!;
    if (argument === "--all") {
      if (all) throw new RangeError("--all may be specified only once");
      all = true;
      continue;
    }
    if (argument === "--help" || argument === "-h") throw new CliHelp();
    const value = arguments_[index + 1];
    if (value === undefined || value.startsWith("--")) throw new RangeError(`${argument} requires a value`);
    index += 1;
    switch (argument) {
      case "--background":
        if (backgroundId !== undefined) throw new RangeError("--background may be specified only once");
        backgroundId = backgroundIdFor(value);
        break;
      case "--count":
        if (countSpecified) throw new RangeError("--count may be specified only once");
        count = positiveInteger(value, "--count");
        countSpecified = true;
        break;
      case "--seed":
        if (seed !== undefined) throw new RangeError("--seed may be specified only once");
        if (value.length === 0) throw new RangeError("--seed must not be empty");
        seed = value;
        break;
      case "--output":
        if (output !== undefined) throw new RangeError("--output may be specified only once");
        output = resolve(value);
        break;
      case "--output-dir":
        if (outputDirectory !== undefined) throw new RangeError("--output-dir may be specified only once");
        outputDirectory = resolve(value);
        break;
      default:
        throw new RangeError(`unknown option: ${argument}`);
    }
  }

  if (all && backgroundId !== undefined) throw new RangeError("--all cannot be combined with --background");
  if (all && countSpecified) throw new RangeError("--all cannot be combined with --count");
  if (output !== undefined && outputDirectory !== undefined) throw new RangeError("--output cannot be combined with --output-dir");
  if (output !== undefined && (all || count !== 1)) throw new RangeError("--output requires exactly one character; use --output-dir for batches");
  return { ...(backgroundId === undefined ? {} : { backgroundId }), count, all, ...(seed === undefined ? {} : { seed }), ...(output === undefined ? {} : { output }), ...(outputDirectory === undefined ? {} : { outputDirectory }) };
}

async function loadTemplates(): Promise<PdfTemplateSet> {
  const [character, retainer, mount] = await Promise.all([
    readFile(templateUrls.character),
    readFile(templateUrls.retainer),
    readFile(templateUrls.mount),
  ]);
  return {
    character: new Uint8Array(character),
    retainer: new Uint8Array(retainer),
    mount: new Uint8Array(mount),
  };
}

function outputPathFor(options: CliOptions, backgroundId: string, index: number, total: number): string {
  if (options.output !== undefined) return options.output;
  const suffix = total === 1 ? "" : `-${index + 1}`;
  const filename = `${safeFilename(backgroundId)}${suffix}.pdf`;
  return resolve(options.outputDirectory ?? process.cwd(), filename);
}

async function writePdf(path: string, pdf: Uint8Array, findAvailableName: boolean): Promise<string> {
  await mkdir(dirname(path), { recursive: true });
  if (!findAvailableName) {
    await writeFile(path, pdf, { flag: "wx" });
    return path;
  }
  const extension = ".pdf";
  for (let suffix = 1; suffix <= Number.MAX_SAFE_INTEGER; suffix += 1) {
    const candidate = suffix === 1 ? path : `${path.slice(0, -extension.length)}-${suffix}${extension}`;
    try {
      await writeFile(candidate, pdf, { flag: "wx" });
      return candidate;
    } catch (error: unknown) {
      if (isExistingFileError(error)) continue;
      throw error;
    }
  }
  throw new RangeError("could not allocate a unique output filename");
}

function backgroundIdFor(value: string): string {
  const normalized = value.trim().toLowerCase();
  const background = rules.backgrounds.find(({ id, name }) => id === normalized || name.toLowerCase() === normalized);
  if (background === undefined) throw new RangeError(`unknown background: ${value}`);
  return background.id;
}

function positiveInteger(value: string, name: string): number {
  if (!/^[1-9]\d*$/.test(value)) throw new RangeError(`${name} must be a positive integer`);
  const number = Number(value);
  if (!Number.isSafeInteger(number)) throw new RangeError(`${name} must be a positive safe integer`);
  return number;
}

function safeFilename(value: string): string {
  const filename = value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  return filename.length === 0 ? "character" : filename;
}

function isExistingFileError(error: unknown): error is NodeJS.ErrnoException {
  return typeof error === "object" && error !== null && "code" in error && error.code === "EEXIST";
}

class CliHelp extends Error {}

function usage(): string {
  return [
    "Usage: npm run chaosgen -- [options]",
    "  --background <id or name>  Generate a selected background.",
    "  --count <positive integer> Generate a seeded or random batch.",
    "  --all                      Generate one character for every background.",
    "  --seed <text>              Make generation reproducible.",
    "  --output <path>            Output path for exactly one character.",
    "  --output-dir <directory>   Output directory for one or more characters.",
  ].join("\n");
}

if (import.meta.main) {
  runCli(process.argv.slice(2)).catch((error: unknown) => {
    if (error instanceof CliHelp) {
      console.log(usage());
      return;
    }
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
}
