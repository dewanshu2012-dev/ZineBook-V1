import type { ReactNode } from "react";
import { MagazineCover } from "@/components/magazine/magazine-cover";
import { MagazineSpread } from "@/components/magazine/magazine-spread";
import type { PageImage } from "@/lib/page-images";
import type { PublicationMaterial } from "@/lib/publication";
import type { Spread } from "@/lib/spreads";

/**
 * Entry point of the magazine rendering engine (Milestone 7).
 *
 * Pure and reusable: given a Spread model + images + material, it renders
 * the physical object. Covers render as a distinct closed object;
 * interiors render as open two-page spreads. Page-turn animation (M8)
 * and material selection (M9) build on this component.
 */
export function MagazineRenderer({
  spread,
  images,
  material,
  content,
  className,
  onImageLoad,
}: {
  spread: Spread;
  images: Record<string, PageImage>;
  material: PublicationMaterial;
  /** Optional per-page custom content (keyed by page id). */
  content?: Record<string, ReactNode>;
  className?: string;
  /** Fires per painted interior page image (for paint-gated layer swaps). */
  onImageLoad?: () => void;
}) {
  if (spread.kind !== "interior") {
    const page = spread.left ?? spread.right;
    if (!page) return null;
    return (
      <MagazineCover
        page={page}
        images={images}
        material={material}
        className={className}
        onImageLoad={onImageLoad}
      >
        {content?.[page.id]}
      </MagazineCover>
    );
  }
  return (
    <MagazineSpread
      spread={spread}
      images={images}
      material={material}
      content={content}
      className={className}
      onImageLoad={onImageLoad}
    />
  );
}
