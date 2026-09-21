"use client";

import { PageThumbnail } from "@/components/editor/page-thumbnail";
import type { PageImage } from "@/lib/page-images";
import type { Page } from "@/lib/publication";

export function ResultsGrid({
  pages,
  images,
}: {
  pages: Page[];
  images: Record<string, PageImage>;
}) {
  const missing = pages.filter((p) => !images[p.id]).length;
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
          {pages.length} {pages.length === 1 ? "page" : "pages"} extracted
        </p>
        <p className="font-mono text-[11px] text-muted">Arrange → Milestone 4</p>
      </div>
      {missing > 0 && (
        <p className="mt-3 rounded-lg border border-line bg-paper-deep/40 px-4 py-2.5 text-[13px] text-muted">
          {missing} {missing === 1 ? "thumbnail is" : "thumbnails are"} missing
          (stored images were cleared) — re-upload to regenerate.
        </p>
      )}
      <ol className="mt-4 grid grid-cols-2 gap-3 min-[420px]:grid-cols-3 sm:grid-cols-4 md:grid-cols-5">
        {pages.map((p) => (
          <li
            key={p.id}
            className="group overflow-hidden rounded-lg border border-line bg-white"
          >
            <PageThumbnail
              image={images[p.id]}
              pageNumber={p.position + 1}
              sourcePageNumber={p.sourcePageNumber}
              className="aspect-[3/4]"
            />
            <div className="flex items-center justify-between border-t border-line px-2.5 py-1.5">
              <span className="font-mono text-[11px] font-medium">
                {String(p.position + 1).padStart(2, "0")}
              </span>
              <span className="font-mono text-[10px] text-muted">
                src {p.sourcePageNumber}
              </span>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
