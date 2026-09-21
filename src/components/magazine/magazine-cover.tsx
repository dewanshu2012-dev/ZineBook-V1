import type { ReactNode } from "react";
import { MagazinePage } from "@/components/magazine/magazine-page";
import type { PageImage } from "@/lib/page-images";
import type { Page, PublicationMaterial } from "@/lib/publication";
import { cn } from "@/lib/utils";

/**
 * A closed cover: single page on heavier stock, centered and narrower
 * than an open spread so it reads as a different physical object.
 */
export function MagazineCover({
  page,
  images,
  material,
  children,
  className,
  onImageLoad,
}: {
  page: Page;
  images: Record<string, PageImage>;
  material: PublicationMaterial;
  children?: ReactNode;
  className?: string;
  onImageLoad?: () => void;
}) {
  return (
    <div className={cn("relative mx-auto w-[68%] max-w-[340px]", className)}>
      <div
        aria-hidden
        className="absolute -bottom-7 left-[8%] right-[8%] h-9 rounded-[100%] bg-ink/25 blur-2xl"
        style={{ opacity: 0.4 + material.shadowIntensity * 0.6 }}
      />
      <div
        aria-hidden
        className="absolute inset-y-[5px] -right-[9px] rounded-r-sm"
        style={{
          width: Math.round(4 + material.pageDepth * 9),
          background:
            "linear-gradient(to bottom, #efe9da, #e2d9c4 55%, #d8cdb4)",
        }}
      />
      <div
        className="relative aspect-[3/4] overflow-hidden rounded-[4px] border border-line"
        style={{
          boxShadow: `0 30px 80px -24px rgba(22,19,14,${(0.3 + material.shadowIntensity * 0.35).toFixed(2)})`,
        }}
      >
        <MagazinePage
          page={page}
          image={images[page.id]}
          material={material}
          side="solo"
          className="h-full w-full"
          onImageLoad={onImageLoad}
        >
          {children}
        </MagazinePage>
      </div>
    </div>
  );
}
