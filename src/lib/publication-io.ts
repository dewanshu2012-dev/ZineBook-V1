/**
 * Portable publication artifact (Milestone 12).
 *
 * `.zinebook.json` bundles the lean Publication shell plus its page images,
 * so a magazine can be exported, backed up and re-imported without any
 * backend. The same shape is what a future cloud sync API will exchange —
 * local-first today, backend-ready tomorrow.
 */

import type { PageImage } from "@/lib/page-images";
import type { Page, Publication } from "@/lib/publication";

export const PUBLICATION_FILE_VERSION = 1;

export type PublicationFile = {
  app: "zinebook";
  version: number;
  exportedAt: string;
  sourceName: string | null;
  publication: Publication;
  images: PageImage[];
};

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

function validPage(p: unknown): p is Page {
  if (!isRecord(p)) return false;
  return (
    typeof p.id === "string" &&
    typeof p.sourcePageNumber === "number" &&
    typeof p.position === "number" &&
    typeof p.type === "string" &&
    ["cover", "page", "blank", "back-cover"].includes(p.type) &&
    typeof p.rotation === "number"
  );
}

function validImage(img: unknown): img is PageImage {
  if (!isRecord(img)) return false;
  return (
    typeof img.id === "string" &&
    typeof img.thumbnail === "string" &&
    typeof img.preview === "string"
  );
}

/** Serialize the working state into a shareable file payload. */
export function serializePublication(
  publication: Publication,
  images: Record<string, PageImage>,
  sourceName: string | null,
): string {
  const file: PublicationFile = {
    app: "zinebook",
    version: PUBLICATION_FILE_VERSION,
    exportedAt: new Date().toISOString(),
    sourceName,
    publication,
    images: publication.pages
      .map((p) => images[p.id])
      .filter((img): img is PageImage => img != null),
  };
  return JSON.stringify(file);
}

export type ParsedPublication = {
  publication: Publication;
  images: PageImage[];
  sourceName: string | null;
};

/** Parse + structurally validate an imported file. Throws on any problem. */
export function parsePublicationFile(text: string): ParsedPublication {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    throw new Error("This file is not valid JSON.");
  }
  if (!isRecord(raw) || raw.app !== "zinebook") {
    throw new Error("This is not a ZineBook publication file.");
  }
  if (raw.version !== PUBLICATION_FILE_VERSION) {
    throw new Error(
      `Unsupported file version (${String(raw.version)}). Expected version ${PUBLICATION_FILE_VERSION}.`,
    );
  }
  const pub = raw.publication;
  if (!isRecord(pub) || typeof pub.title !== "string" || !Array.isArray(pub.pages)) {
    throw new Error("The publication inside this file is corrupted.");
  }
  if (pub.pages.length === 0) {
    throw new Error("This file contains no pages.");
  }
  if (!pub.pages.every(validPage)) {
    throw new Error("One or more pages in this file are corrupted.");
  }
  const images = Array.isArray(raw.images) ? raw.images : [];
  if (!images.every(validImage)) {
    throw new Error("One or more page images in this file are corrupted.");
  }
  const sourceName =
    typeof raw.sourceName === "string" || raw.sourceName === null
      ? raw.sourceName
      : null;
  // Re-mirror positions from array order — the single source of truth.
  const pages = (pub.pages as Page[]).map((p, i) => ({ ...p, position: i }));
  return {
    publication: { ...(pub as unknown as Publication), pages },
    images: images as PageImage[],
    sourceName,
  };
}

/** Safe download filename from a title. */
export function slugify(title: string): string {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  return `${slug || "magazine"}.zinebook.json`;
}
