import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { parseOptions, runCli } from "../../src/cli/main.ts";

describe("CLI option parsing", () => {
  it("accepts background IDs and display names", () => {
    expect(parseOptions(["--background", "Wizard's Apprentice", "--seed", "example"])).toMatchObject({
      backgroundId: "wizards-apprentice",
      count: 1,
      seed: "example",
    });
  });

  it("rejects ambiguous batches and invalid options", () => {
    expect(() => parseOptions(["--all", "--count", "2"])).toThrow("cannot be combined");
    expect(() => parseOptions(["--count", "0"])).toThrow("positive integer");
    expect(() => parseOptions(["--background", "missing"])).toThrow("unknown background");
    expect(() => parseOptions(["--output", "one.pdf", "--output-dir", "out"])).toThrow("cannot be combined");
  });
});

describe("CLI rendering", () => {
  it("writes a requested single PDF without depending on the current directory", async () => {
    const directory = await mkdtemp(join(tmpdir(), "chaosgen-cli-"));
    const output = join(directory, "witch.pdf");
    try {
      await runCli(["--background", "witch", "--seed", "cli-test", "--output", output]);
      const pdf = await readFile(output);
      expect(pdf.subarray(0, 5).toString()).toBe("%PDF-");
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  });

  it("avoids collisions for generated output names and reports the final path", async () => {
    const directory = await mkdtemp(join(tmpdir(), "chaosgen-cli-"));
    const paths: string[] = [];
    try {
      await runCli(["--background", "witch", "--seed", "first", "--output-dir", directory], (path) => paths.push(path));
      await runCli(["--background", "witch", "--seed", "second", "--output-dir", directory], (path) => paths.push(path));
      expect(paths).toEqual([join(directory, "witch.pdf"), join(directory, "witch-2.pdf")]);
      expect((await readFile(paths[1]!)).byteLength).toBeGreaterThan(0);
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  });
});
