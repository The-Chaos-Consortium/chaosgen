// @vitest-environment jsdom

import { describe, expect, it } from "vitest";

import { mountApp } from "../../src/web/main.ts";

describe("web character generator", () => {
  it("generates, customizes, and downloads a character without rerolling it", async () => {
    const root = document.createElement("main");
    document.body.append(root);
    const loaded: string[] = [];
    const downloaded: { name?: string; bytes?: Uint8Array } = {};
    let renderedName: string | undefined;
    mountApp(root, {
      newSeed: () => "web-integration",
      async loadTemplate(kind) {
        loaded.push(kind);
        return new Uint8Array([1, 2, 3]);
      },
      async render(document) {
        renderedName = document.actor.name;
        return new Uint8Array([37, 80, 68, 70]);
      },
      download(name, bytes) {
        downloaded.name = name;
        downloaded.bytes = bytes;
      },
    });

    const background = root.querySelector<HTMLSelectElement>("#background")!;
    background.value = "knight";
    root.querySelector<HTMLButtonElement>("button")!.click();
    expect(root.textContent).toContain("Knight");
    expect(root.querySelector("[role=status]")?.textContent).toMatch(/^Generated /);
    expect(root.textContent).toContain("Quantity");

    const name = root.querySelector<HTMLInputElement>("#name")!;
    name.value = "Synthetic Knight";
    name.focus();
    name.setSelectionRange(2, 7);
    name.dispatchEvent(new Event("change"));
    const refreshedName = root.querySelector<HTMLInputElement>("#name")!;
    expect(document.activeElement).toBe(refreshedName);
    expect(refreshedName.selectionStart).toBe(2);
    expect(refreshedName.selectionEnd).toBe(7);
    const firstSwap = root.querySelector<HTMLSelectElement>("#swap-first")!;
    const secondSwap = root.querySelector<HTMLSelectElement>("#swap-second")!;
    firstSwap.value = "strength";
    firstSwap.dispatchEvent(new Event("change"));
    expect(firstSwap.value).toBe("strength");
    secondSwap.value = "willpower";
    secondSwap.dispatchEvent(new Event("change"));
    expect(root.textContent).toContain("Synthetic Knight");
    expect(root.textContent).toContain("Changes applied without rerolling.");

    root.querySelector<HTMLButtonElement>(".secondary")!.click();
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(loaded).toEqual(["character", "retainer", "mount"]);
    expect(renderedName).toBe("Synthetic Knight");
    expect(downloaded.name).toBe("synthetic-knight.pdf");
    expect(downloaded.bytes).toEqual(new Uint8Array([37, 80, 68, 70]));
  });

  it("locks generation and editing controls while rendering a PDF snapshot", async () => {
    const root = document.createElement("main");
    document.body.append(root);
    let completeRender: ((bytes: Uint8Array) => void) | undefined;
    mountApp(root, {
      newSeed: () => "locked-download",
      async loadTemplate() { return new Uint8Array([1]); },
      render() { return new Promise((resolve) => { completeRender = resolve; }); },
      download() {},
    });

    const background = root.querySelector<HTMLSelectElement>("#background")!;
    background.value = "witch";
    root.querySelector<HTMLButtonElement>("button")!.click();
    const name = root.querySelector<HTMLInputElement>("#name")!;
    const download = root.querySelector<HTMLButtonElement>(".secondary")!;
    download.click();
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(background.disabled).toBe(true);
    expect(name.disabled).toBe(true);
    expect(download.disabled).toBe(true);
    completeRender?.(new Uint8Array([37, 80, 68, 70]));
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(background.disabled).toBe(false);
    expect(name.disabled).toBe(false);
    expect(download.disabled).toBe(false);
  });
});
