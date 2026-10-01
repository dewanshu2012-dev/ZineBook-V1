"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { BookOpen01Icon } from "@hugeicons/core-free-icons";
import type { Spread } from "@/lib/spreads";
import { usePublication } from "@/lib/publication-store";
import type { CoverMode } from "@/lib/publication";
import { cn } from "@/lib/utils";

const COVER_STYLES: { mode: CoverMode; name: string; body: string }[] = [
  {
    mode: "single",
    name: "Front only",
    body: "The first page opens as a standalone front cover.",
  },
  {
    mode: "full",
    name: "Front + Back",
    body: "The first and last pages are standalone covers.",
  },
];

export function CoverSettings({ spreads }: { spreads: Spread[] }) {
  const { publication, setCoverMode } = usePublication();
  if (!publication) return null;
  const hasCover = publication.coverMode !== "none";
  const activeStyle = COVER_STYLES.find(
    (style) => style.mode === publication.coverMode,
  );

  return (
    <section className="border-b border-line p-4 last:border-b-0">
      <h3 className="flex items-center gap-2 text-sm font-semibold text-ink">
        <HugeiconsIcon icon={BookOpen01Icon} className="h-3.5 w-3.5" />
        Covers
      </h3>
      <div className="mt-2 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-ink-soft">Cover pages</p>
          <p className="mt-0.5 text-[11px] text-muted">
            {hasCover
              ? publication.coverMode === "full"
                ? "Front and back"
                : "Front only"
              : "Off. Pages open normally."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">
            {hasCover ? "On" : "Off"}
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={hasCover}
            aria-label="Toggle book covers"
            onClick={() => setCoverMode(hasCover ? "none" : "single")}
            className={cn(
              "relative h-6 w-11 shrink-0 rounded-full p-0.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/30",
              hasCover ? "bg-ink" : "bg-line",
            )}
          >
            <span
              className={cn(
                "block h-5 w-5 rounded-full bg-white shadow-sm transition-transform",
                hasCover && "translate-x-5",
              )}
            />
          </button>
        </div>
      </div>
      {hasCover && (
        <>
          <p className="mt-3 text-xs font-medium text-ink-soft">Cover layout</p>
          <div
            className="mt-1.5 grid grid-cols-2 gap-1 rounded-lg border border-line bg-white p-1"
            role="radiogroup"
            aria-label="Choose cover style"
          >
            {COVER_STYLES.map((style) => {
              const active = publication.coverMode === style.mode;
              return (
                <button
                  key={style.mode}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setCoverMode(style.mode)}
                  className={cn(
                    "rounded-md px-2 py-1.5 text-[11px] font-medium transition-colors",
                    active ? "bg-ink text-paper" : "text-ink-soft hover:text-ink",
                  )}
                >
                  {style.name}
                </button>
              );
            })}
          </div>
          <p className="mt-2 text-[11px] leading-4 text-muted">
            {activeStyle?.body} Drag pages below to change which page is first
            or last.
          </p>
        </>
      )}
      <p className="mt-2 font-mono text-[10px] text-muted">
        {spreads.length} {spreads.length === 1 ? "spread" : "spreads"} in preview
      </p>
    </section>
  );
}
