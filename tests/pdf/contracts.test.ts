import { describe, expect, it } from "vitest";

import {
  hasRequiredPdfTemplateKinds,
  missingPdfTemplateKinds,
  requiredPdfTemplateKinds,
} from "../../src/pdf/contracts.ts";
import type { PartialPdfTemplateSet, PdfTemplateSet } from "../../src/pdf/contracts.ts";

const characterWith = (
  companions: readonly { readonly kind: "retainer" | "pet" | "mount" }[],
) => ({ companions });

describe("requiredPdfTemplateKinds", () => {
  it("requires only the character template for a character without companions", () => {
    expect(requiredPdfTemplateKinds(characterWith([]))).toEqual(["character"]);
  });

  it("maps retainers and pets to the shared retainer-panel template", () => {
    const actor = characterWith([{ kind: "pet" }, { kind: "retainer" }]);

    expect(requiredPdfTemplateKinds(actor)).toEqual(["character", "retainer"]);
  });

  it("uses the plan assembly order regardless of companion snapshot order", () => {
    const actor = characterWith([
      { kind: "mount" },
      { kind: "pet" },
      { kind: "mount" },
    ]);

    expect(requiredPdfTemplateKinds(actor)).toEqual([
      "character",
      "retainer",
      "mount",
    ]);
  });
});

describe("missingPdfTemplateKinds", () => {
  it("always requires explicitly supplied character bytes", () => {
    expect(missingPdfTemplateKinds(characterWith([]), {})).toEqual(["character"]);
  });

  it("reports companion templates explicitly instead of permitting implicit loading", () => {
    const actor = characterWith([{ kind: "retainer" }, { kind: "mount" }]);
    const characterTemplate = new Uint8Array([0x25, 0x50, 0x44, 0x46]);

    expect(missingPdfTemplateKinds(actor, { character: characterTemplate })).toEqual([
      "retainer",
      "mount",
    ]);
  });
});

describe("hasRequiredPdfTemplateKinds", () => {
  it("requires character bytes in renderer-eligible template types", () => {
    // @ts-expect-error PdfTemplateSet always requires the character template asset.
    const templatesWithoutCharacter: PdfTemplateSet = {};

    expect(templatesWithoutCharacter).toEqual({});
  });

  it("narrows loaded bytes into renderer-eligible templates without a cast", () => {
    const actor = characterWith([{ kind: "mount" }]);
    const loadingTemplates: PartialPdfTemplateSet = {
      character: new Uint8Array([1]),
      mount: new Uint8Array([2]),
    };

    expect(hasRequiredPdfTemplateKinds(actor, loadingTemplates)).toBe(true);

    if (hasRequiredPdfTemplateKinds(actor, loadingTemplates)) {
      const renderableTemplates: PdfTemplateSet = loadingTemplates;
      expect(renderableTemplates.character).toEqual(new Uint8Array([1]));
    }
  });

  it("does not narrow partial bytes when a required companion asset is absent", () => {
    const actor = characterWith([{ kind: "retainer" }]);
    const loadingTemplates: PartialPdfTemplateSet = { character: new Uint8Array([1]) };

    expect(hasRequiredPdfTemplateKinds(actor, loadingTemplates)).toBe(false);
  });
});
