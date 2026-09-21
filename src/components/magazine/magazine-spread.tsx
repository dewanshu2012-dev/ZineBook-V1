import type { ReactNode } from "react";
import { MagazinePage } from "@/components/magazine/magazine-page";
import type { PageImage } from "@/lib/page-images";
import type { PublicationMaterial } from "@/lib/publication";
import type { Spread } from "@/lib/spreads";
import { cn } from "@/lib/utils";

/** Stacked page-edge strips suggesting physical thickness. */
function PageEdges({
  side,
  depth,
  coverStock,
}: {
  side: "left" | "right";
  /** 0–1 visual thickness. */
  depth: number;
  /** Covers are printed on heavier stock. */
  coverStock?: boolean;
}) {
  const width = Math.round((coverStock ? 4 : 2) + depth * (coverStock ? 9 : 7));
  return (
    <div
      aria-hidden
      className={cn(
        "absolute inset-y-[5px] rounded-sm",
        side === "left" ? "-left-1" : "-right-1",
      )}
      style={{
        width,
        transform:
          side === "left" ? `translateX(${-width + 1}px)` : `translateX(${width - 1}px)`,
        background:
          side === "left"
            ? "linear-gradient(to bottom, #efe9da, #ddd2b8 55%, #cfc2a2)"
            : "linear-gradient(to bottom, #efe9da, #e2d9c4 55%, #d8cdb4)",
        opacity: 0.55 + depth * 0.45,
      }}
    />
  );
}

function ambientShadow(shadowIntensity: number): string {
  const alpha = 0.22 + shadowIntensity * 0.35;
  return `0 30px 80px -24px rgba(22,19,14,${alpha.toFixed(2)})`;
}

/**
 * An open interior spread: left + right page sharing one center coordinate,
 * outer page edges and ambient floor shadow. The only center treatment is
 * the fold shading rendered by each MagazinePage — there is no gutter
 * element between the surfaces.
 */
export function MagazineSpread({
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
  /** Fires per painted page image (for paint-gated layer swaps). */
  onImageLoad?: () => void;
}) {
  return (
    <div className={cn("relative", className)}>
      <div
        aria-hidden
        className="absolute -bottom-7 left-[6%] right-[6%] h-9 rounded-[100%] bg-ink/20 blur-2xl"
        style={{ opacity: 0.4 + material.shadowIntensity * 0.6 }}
      />
      <PageEdges side="left" depth={material.pageDepth} />
      <PageEdges side="right" depth={material.pageDepth} />

      <div
        className="relative flex overflow-hidden rounded-[4px] border border-line bg-[#fffdf8]"
        style={{ boxShadow: ambientShadow(material.shadowIntensity) }}
      >
        {spread.left ? (
          <MagazinePage
            page={spread.left}
            image={images[spread.left.id]}
            material={material}
            side="left"
            className="w-1/2"
            onImageLoad={onImageLoad}
          >
            {content?.[spread.left.id]}
          </MagazinePage>
        ) : (
          <div
            aria-label="Empty page"
            className="flex w-1/2 items-center justify-center bg-paper-deep/40"
          >
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
              Empty
            </span>
          </div>
        )}

        {spread.right ? (
          <MagazinePage
            page={spread.right}
            image={images[spread.right.id]}
            material={material}
            side="right"
            className="w-1/2"
            onImageLoad={onImageLoad}
          >
            {content?.[spread.right.id]}
          </MagazinePage>
        ) : (
          <div
            aria-label="Empty page"
            className="flex w-1/2 items-center justify-center bg-paper-deep/40"
          >
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
              Empty
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
