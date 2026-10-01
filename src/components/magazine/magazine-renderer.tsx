import type { ReactNode } from "react";
import { MagazineSpread } from "@/components/magazine/magazine-spread";
import type { PageImage } from "@/lib/page-images";
import type { PublicationMaterial } from "@/lib/publication";
import type { Spread } from "@/lib/spreads";

/**
 * Entry point of the magazine rendering engine.
 *
 * Every spread kind renders in the same fixed-aspect two-page box, so
 * covers and interiors share geometry and page turns line up exactly.
 * A closed cover is simply a spread with one side empty.
 */
export function MagazineRenderer(props: {
  spread: Spread;
  images: Record<string, PageImage>;
  material: PublicationMaterial;
  /** Optional per-page custom content (keyed by page id). */
  content?: Record<string, ReactNode>;
  className?: string;
  /** Fires per painted page image (for paint-gated layer swaps). */
  onImageLoad?: () => void;
}) {
  return <MagazineSpread {...props} />;
}
