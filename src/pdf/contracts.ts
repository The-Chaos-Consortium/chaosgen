import type {
  CharacterActor,
  GeneratedActorDocument,
} from "../core/actors.ts";

/**
 * A read-only structural view of PDF bytes.
 *
 * A `Uint8Array` is assignable to this type. This view prevents the renderer
 * contract from exposing byte-mutating methods, but cannot make the underlying
 * storage deeply immutable; callers must not mutate supplied template bytes
 * while rendering is in progress.
 */
export interface ReadonlyPdfBytes extends ArrayLike<number> {
  readonly byteLength: number;
}

export type PdfTemplateKind = "character" | "retainer" | "mount";

/** Template bytes that may still be loading or incomplete. */
export type PartialPdfTemplateSet = Readonly<
  Partial<Record<PdfTemplateKind, ReadonlyPdfBytes>>
>;

/**
 * Template bytes eligible for a renderer request. Character bytes are always
 * required; companion bytes remain optional because their requirement is
 * determined from the character's companion snapshots.
 */
export interface PdfTemplateSet {
  readonly character: ReadonlyPdfBytes;
  readonly retainer?: ReadonlyPdfBytes;
  readonly mount?: ReadonlyPdfBytes;
}

/** A generated document rooted at a character, suitable for assembled export. */
export type GeneratedCharacterDocument = Omit<GeneratedActorDocument, "actor"> & {
  readonly actor: CharacterActor;
};

/** The companion information needed to determine template requirements. */
export interface PdfCompanionTemplateSubject {
  readonly companions: readonly {
    readonly kind: "retainer" | "pet" | "mount";
  }[];
}

/**
 * Produces the required template kinds in assembled-PDF order:
 * character front/notes, then a retainer/pet sheet, then a mount sheet.
 *
 * Retainers and pets share the retainer-panel template. Each template *asset*
 * occurs once even when several companions use it; rendering may repeat that
 * asset across as many assembled companion pages or panels as are needed.
 */
export function requiredPdfTemplateKinds(
  character: PdfCompanionTemplateSubject,
): readonly PdfTemplateKind[] {
  const companionTemplates = new Set<PdfTemplateKind>();

  for (const companion of character.companions) {
    if (companion.kind === "retainer" || companion.kind === "pet") {
      companionTemplates.add("retainer");
    } else {
      companionTemplates.add("mount");
    }
  }

  const orderedKinds: PdfTemplateKind[] = ["character"];
  if (companionTemplates.has("retainer")) orderedKinds.push("retainer");
  if (companionTemplates.has("mount")) orderedKinds.push("mount");
  return orderedKinds;
}

/** Lists required template bytes that a supplied template set does not contain. */
export function missingPdfTemplateKinds(
  character: PdfCompanionTemplateSubject,
  templates: PartialPdfTemplateSet,
): readonly PdfTemplateKind[] {
  return requiredPdfTemplateKinds(character).filter((kind) => templates[kind] === undefined);
}

/**
 * Narrows loaded bytes into a renderable template set without a cast. It checks
 * the character asset and every companion asset required by the supplied actor.
 */
export function hasRequiredPdfTemplateKinds(
  character: PdfCompanionTemplateSubject,
  templates: PartialPdfTemplateSet,
): templates is PdfTemplateSet {
  return missingPdfTemplateKinds(character, templates).length === 0;
}

/**
 * The renderer receives all generated state and all required template bytes;
 * it never loads templates, writes output, evaluates randomness, or mutates
 * actor/template inputs. Callers construct requests only after
 * `hasRequiredPdfTemplateKinds` succeeds; implementations must still reject
 * missing companion assets rather than attempting an implicit asset lookup.
 */
export interface CharacterPdfRenderer {
  render(request: Readonly<CharacterPdfRenderRequest>): Promise<Uint8Array>;
}

export interface CharacterPdfRenderRequest {
  readonly document: GeneratedCharacterDocument;
  readonly templates: PdfTemplateSet;
}

/**
 * Platform adapters may acquire template bytes separately from rendering.
 * Implementations belong outside this PDF contract layer.
 */
export interface PdfTemplateByteSource {
  load(kind: PdfTemplateKind): Promise<Uint8Array>;
}

/** Platform adapters may persist or download rendered bytes outside this layer. */
export interface PdfByteSink {
  write(pdf: Uint8Array): Promise<void>;
}
