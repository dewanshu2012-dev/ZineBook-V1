"use client";

import { useState } from "react";
import { PageThumbnail } from "@/components/editor/page-thumbnail";
import { MaterialLayer } from "@/components/magazine/material-layer";
import type { PageImage } from "@/lib/page-images";
import type { Page, PublicationMaterial } from "@/lib/publication";
import { cn } from "@/lib/utils";

const SWIPE_PX = 60;

/**
 * One draggable page. Keyed by page id from the pager, so the drag
 * offset resets naturally on remount — no sync effect needed.
 */
function DraggablePage({
  page,
  pagesLength,
  images,
  material,
  onSwipe,
}: {
  page: Page;
  pagesLength: number;
  images: Record<string, PageImage>;
  material: PublicationMaterial;
  onSwipe: (dir: 1 | -1) => void;
}) {
  const [offset, setOffset] = useState(0);
  const [startX, setStartX] = useState<number | null>(null);
  const sideways = page.rotation % 180 !== 0;

  return (
    <div
      className="relative touch-pan-y select-none overflow-hidden"
      onPointerDown={(e) => setStartX(e.clientX)}
      onPointerMove={(e) => {
        if (startX == null) return;
        setOffset(e.clientX - startX);
      }}
      onPointerUp={(e) => {
        if (startX == null) return;
        const dx = e.clientX - startX;
        setStartX(null);
        setOffset(0);
        if (dx <= -SWIPE_PX) onSwipe(1);
        else if (dx >= SWIPE_PX) onSwipe(-1);
      }}
      onPointerCancel={() => {
        setStartX(null);
        setOffset(0);
      }}
    >
      <div
        className="mx-auto w-full max-w-[420px]"
        style={{ transform: `translateX(${offset * 0.35}px)` }}
      >
        <div className="relative overflow-hidden rounded-[4px] border border-line bg-white shadow-[0_24px_60px_-24px_rgba(22,19,14,0.45)]">
          <PageThumbnail
            image={images[page.id]}
            pageNumber={page.position + 1}
            sourcePageNumber={page.sourcePageNumber}
            variant="preview"
            rotation={page.rotation}
            className={sideways ? "aspect-[4/3]" : "aspect-[3/4]"}
          />
          <MaterialLayer material={material} />
        </div>
        <p className="mt-3 text-center font-mono text-[11px] text-muted">
          Page {page.position + 1} of {pagesLength} · {page.type}
        </p>
      </div>
    </div>
  );
}

/**
 * Mobile reading flow (Milestone 10): one page at a time, swipe to move.
 * Controlled — the Reader owns the index so shared controls stay in sync.
 */
export function MobilePager({
  pages,
  images,
  material,
  index,
  onIndexChange,
  className,
}: {
  pages: Page[];
  images: Record<string, PageImage>;
  material: PublicationMaterial;
  index: number;
  onIndexChange: (index: number) => void;
  className?: string;
}) {
  const current = Math.max(0, Math.min(index, pages.length - 1));
  const page = pages[current];
  if (!page) return null;

  return (
    <div className={cn(className)}>
      <DraggablePage
        key={page.id}
        page={page}
        pagesLength={pages.length}
        images={images}
        material={material}
        onSwipe={(dir) =>
          onIndexChange(
            Math.max(0, Math.min(pages.length - 1, current + dir)),
          )
        }
      />
    </div>
  );
}
