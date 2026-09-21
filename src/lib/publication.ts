/**
 * Publication data model (Milestone 1 foundation).
 *
 * Kept deliberately separate from rendering. Spread calculation,
 * page-turn animation and material rendering build on top of this
 * in later milestones — no page pairing is hardcoded here.
 */

export type CoverMode = "none" | "single" | "full";

export type ReadingDirection = "ltr" | "rtl";

export type PageType = "cover" | "page" | "blank" | "back-cover";

export type MaterialType =
  | "smooth-matte"
  | "glossy"
  | "premium-matte"
  | "uncoated"
  | "matte-cover"
  | "glossy-cover"
  | "soft-touch"
  | "cardstock"
  | "kraft"
  | "linen"
  | "recycled";

export type Page = {
  id: string;
  /** Original PDF page number (1-indexed). 0 for inserted blanks. */
  sourcePageNumber: number;
  /** Current position in the publication (0-indexed). */
  position: number;
  type: PageType;
  rotation: number;
};

export type PublicationMaterial = {
  type: MaterialType;
  /** 0–1, must stay subtle enough to keep content readable. */
  textureIntensity: number;
  /** 0–1, visual page thickness. */
  pageDepth: number;
  /** 0–1, fold + edge + ambient shadow strength. */
  shadowIntensity: number;
};

export type Publication = {
  id: string;
  title: string;
  pages: Page[];
  coverMode: CoverMode;
  readingDirection: ReadingDirection;
  material: PublicationMaterial;
  createdAt: string;
  updatedAt: string;
};

export function createBlankPage(position: number): Page {
  return {
    id: `blank-${Date.now()}-${position}`,
    sourcePageNumber: 0,
    position,
    type: "blank",
    rotation: 0,
  };
}

export function createPublication(title = "Untitled Magazine"): Publication {
  const now = new Date().toISOString();
  return {
    id: `pub-${Date.now()}`,
    title,
    pages: [],
    coverMode: "single",
    readingDirection: "ltr",
    material: {
      type: "smooth-matte",
      textureIntensity: 0.4,
      pageDepth: 0.5,
      shadowIntensity: 0.55,
    },
    createdAt: now,
    updatedAt: now,
  };
}
