import type { ReactNode } from "react";
import { MagazinePage } from "@/components/magazine/magazine-page";
import type { PageImage } from "@/lib/page-images";
import type { Page, PublicationMaterial } from "@/lib/publication";
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
  // Layered: contact edge, mid lift, soft ambient floor.
  const a = 0.18 + shadowIntensity * 0.3;
  return [
    "0 1px 1px rgba(22,19,14,0.10)",
    `0 6px 14px -6px rgba(22,19,14,${(a * 0.8).toFixed(2)})`,
    `0 28px 56px -20px rgba(22,19,14,${a.toFixed(2)})`,
    `0 60px 120px -40px rgba(22,19,14,${(a * 0.7).toFixed(2)})`,
  ].join(", ");
}

/**
 * A two-page spread sized from --page-aspect (source page w/h, A4 default). Interiors fill
 * both halves; a closed cover fills one half and leaves the other empty,
 * so every spread kind shares the same geometry and turns line up.
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
  const closed = spread.kind !== "interior";
  const sheet = "relative overflow-hidden rounded-[4px] border border-line bg-[#fffdf8]";
  const shadow = { boxShadow: ambientShadow(material.shadowIntensity) };

  const half = (page: Page | null, side: "left" | "right") => {
    if (page) {
      const face = (
        <MagazinePage
          page={page}
          image={images[page.id]}
          material={material}
          side={closed ? "solo" : side}
          className="h-full w-full"
          onImageLoad={onImageLoad}
        >
          {content?.[page.id]}
        </MagazinePage>
      );
      if (!closed) return <div className="relative w-1/2">{face}</div>;
      return (
        <div className="relative w-1/2">
          <PageEdges side={side} depth={material.pageDepth} coverStock />
          <div className={cn(sheet, "h-full")} style={shadow}>
            {face}
          </div>
        </div>
      );
    }
    // Closed cover: the other half is just table.
    if (closed) return <div aria-hidden className="w-1/2" />;
    return (
      <div
        aria-label="Empty page"
        className="flex w-1/2 items-center justify-center bg-paper-deep/40"
      >
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
          Empty
        </span>
      </div>
    );
  };

  return (
    <div
      className={cn("relative w-full", className)}
      style={{ aspectRatio: "calc(2 * var(--page-aspect, 0.7071))" }}
    >
      {!closed && (
        <>
          <div
            aria-hidden
            className="absolute -bottom-7 left-[6%] right-[6%] h-9 rounded-[100%] bg-ink/20 blur-2xl"
            style={{ opacity: 0.4 + material.shadowIntensity * 0.6 }}
          />
          <PageEdges side="left" depth={material.pageDepth} />
          <PageEdges side="right" depth={material.pageDepth} />
        </>
      )}
      <div
        className={cn("relative flex h-full", !closed && sheet)}
        style={closed ? undefined : shadow}
      >
        {half(spread.left, "left")}
        {half(spread.right, "right")}
        {!closed && (
          // Spine: pages dip into the binding.
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 left-1/2 w-[6%] -translate-x-1/2"
            style={{
              background:
                "linear-gradient(to right, rgba(22,19,14,0) 0%, rgba(22,19,14,.10) 38%, rgba(22,19,14,.28) 50%, rgba(22,19,14,.10) 62%, rgba(22,19,14,0) 100%)",
            }}
          />
        )}
      </div>
    </div>
  );
}
