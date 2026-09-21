/**
 * Spread calculator (Milestone 6).
 *
 * Pure function: ordered pages + cover mode + reading direction → spreads.
 * No React, no DOM, no hardcoded pairs in components — the renderer (M7+)
 * consumes this model directly. RTL is resolved here by mirroring sides,
 * so renderers never branch on direction.
 */

import type {
  CoverMode,
  Page,
  ReadingDirection,
} from "@/lib/publication";

export type SpreadKind = "cover" | "interior" | "back-cover";

export type Spread = {
  id: string;
  kind: SpreadKind;
  /** 0-indexed among spreads. */
  index: number;
  left: Page | null;
  right: Page | null;
};

/**
 * Pair pages into spreads.
 *
 * - "none":   1+2 · 3+4 · 5+6 …
 * - "single": COVER · 2+3 · 4+5 …
 * - "full":   FRONT · 2+3 · 4+5 … · BACK
 *
 * Covers are positional (first/last page). An odd leftover interior page
 * fills the leading side in reading direction; the other side stays empty.
 */
export function calculateSpreads(
  pages: Page[],
  coverMode: CoverMode,
  readingDirection: ReadingDirection,
): Spread[] {
  if (pages.length === 0) return [];
  const rtl = readingDirection === "rtl";

  let front: Page | null = null;
  let back: Page | null = null;
  let interior = pages;

  if (coverMode !== "none") {
    front = pages[0];
    interior = pages.slice(1);
  }
  if (coverMode === "full" && interior.length > 0) {
    back = interior[interior.length - 1];
    interior = interior.slice(0, -1);
  }

  const spreads: Spread[] = [];
  const push = (kind: SpreadKind, left: Page | null, right: Page | null) => {
    const tag = left?.id ?? right?.id ?? "empty";
    spreads.push({ id: `spread-${spreads.length}-${kind}-${tag}`, kind, index: spreads.length, left, right });
  };

  if (front) {
    // A closed front cover presents its face on the leading side.
    push("cover", rtl ? front : null, rtl ? null : front);
  }
  for (let i = 0; i < interior.length; i += 2) {
    const a = interior[i];
    const b = interior[i + 1] ?? null;
    push("interior", rtl ? b : a, rtl ? a : b);
  }
  if (back) {
    push("back-cover", rtl ? null : back, rtl ? back : null);
  }
  return spreads;
}

/** Spread containing a page, or undefined. */
export function findSpread(
  spreads: Spread[],
  pageId: string,
): Spread | undefined {
  return spreads.find((s) => s.left?.id === pageId || s.right?.id === pageId);
}

/** Turn-navigation helpers — pure, clamped, no wrapping. */
export function nextSpreadIndex(index: number, total: number): number {
  return Math.min(Math.max(total - 1, 0), index + 1);
}
export function prevSpreadIndex(index: number): number {
  return Math.max(0, index - 1);
}

/** Human pairing summary, e.g. "COVER · 2+3 · 4+5 · BACK". */
export function describePairing(spreads: Spread[]): string {
  return spreads
    .map((s) => {
      if (s.kind === "cover") return "COVER";
      if (s.kind === "back-cover") return "BACK";
      const l = s.left ? s.left.position + 1 : "–";
      const r = s.right ? s.right.position + 1 : "–";
      return `${l}+${r}`;
    })
    .join(" · ");
}
