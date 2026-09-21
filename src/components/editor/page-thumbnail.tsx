import type { PageImage } from "@/lib/page-images";
import { cn } from "@/lib/utils";

type Variant = "thumb" | "preview";

/**
 * Reusable page image (Milestones 3–4).
 * Shows a numbered paper placeholder whenever the image is missing —
 * e.g. storage was cleared but the publication shell survived.
 * `rotation` is applied as a CSS transform (0/90/180/270).
 */
export function PageThumbnail({
  image,
  pageNumber,
  sourcePageNumber,
  variant = "thumb",
  rotation = 0,
  className,
  imgClassName,
}: {
  image?: PageImage;
  /** 1-indexed position label. */
  pageNumber: number;
  sourcePageNumber?: number;
  variant?: Variant;
  rotation?: number;
  className?: string;
  imgClassName?: string;
}) {
  const src = variant === "preview" ? image?.preview : image?.thumbnail;
  const rotateClass =
    rotation === 90
      ? "rotate-90"
      : rotation === 180
        ? "rotate-180"
        : rotation === 270
          ? "-rotate-90"
          : "";
  return (
    <div className={cn("relative overflow-hidden bg-paper-deep/50", className)}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={`Page ${pageNumber}`}
          className={cn("h-full w-full object-contain", rotateClass, imgClassName)}
          loading="lazy"
          draggable={false}
        />
      ) : (
        <div className="flex h-full flex-col items-center justify-center gap-1">
          <span className="font-display text-2xl text-muted">
            {String(pageNumber).padStart(2, "0")}
          </span>
          {sourcePageNumber != null && (
            <span className="font-mono text-[10px] text-muted">
              src {sourcePageNumber}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
