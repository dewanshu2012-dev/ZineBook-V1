import type { ReactNode } from "react";
import { MaterialLayer } from "@/components/magazine/material-layer";
import type { PageImage } from "@/lib/page-images";
import type { Page, PublicationMaterial } from "@/lib/publication";
import { cn } from "@/lib/utils";

function rotationClass(rotation: number): string {
  if (rotation === 90) return "rotate-90";
  if (rotation === 180) return "rotate-180";
  if (rotation === 270) return "-rotate-90";
  return "";
}

/**
 * One physical page: printed content (or custom children), inner fold
 * shading and the material layer. `side` controls which edge carries
 * the fold shadow.
 */
export function MagazinePage({
  page,
  image,
  material,
  side,
  variant = "preview",
  children,
  className,
  onImageLoad,
}: {
  page: Page;
  image?: PageImage;
  material: PublicationMaterial;
  side: "left" | "right" | "solo";
  variant?: "thumb" | "preview";
  /** Custom printed content (e.g. landing demo). Defaults to the image. */
  children?: ReactNode;
  className?: string;
  /** Fires when the printed image paints (for paint-gated layer swaps). */
  onImageLoad?: () => void;
}) {
  const src = variant === "preview" ? image?.preview : image?.thumbnail;
  const foldOpacity = 0.25 + material.shadowIntensity * 0.75;

  return (
    <div
      className={cn(
        "magazine-page-surface relative overflow-hidden",
        className,
      )}
    >
      {children ??
        (src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt={`Page ${page.position + 1}`}
            className={cn(
              "h-full w-full object-contain",
              rotationClass(page.rotation),
            )}
            draggable={false}
            onLoad={onImageLoad}
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-1">
            <span className="font-display text-4xl text-ink/20">
              {String(page.position + 1).padStart(2, "0")}
            </span>
            {page.type === "blank" && (
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink/30">
                Blank
              </span>
            )}
          </div>
        ))}

      {/* Inner fold shading — the page curves into the spine. */}
      {side !== "solo" && (
        <div
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-y-0 w-[18%]",
            side === "left"
              ? "right-0 bg-gradient-to-l from-ink/[0.16] to-transparent"
              : "left-0 bg-gradient-to-r from-ink/[0.16] to-transparent",
          )}
          style={{ opacity: foldOpacity }}
        />
      )}

      <MaterialLayer material={material} />
    </div>
  );
}
