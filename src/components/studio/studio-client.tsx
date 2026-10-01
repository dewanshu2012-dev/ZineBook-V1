"use client";

import { useMemo, useRef } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { PageActions } from "@/components/editor/page-actions";
import { PageStrip } from "@/components/editor/page-strip";
import { MagazineBook, type BookHandle } from "@/components/magazine";
import {
  CoverSettings,
} from "@/components/studio/publication-settings";
import { MaterialSettings } from "@/components/studio/material-settings";
import { ButtonLink } from "@/components/ui/button";
import { calculateSpreads, findSpread } from "@/lib/spreads";
import { usePublication } from "@/lib/publication-store";

/**
 * Interactive flip-book preview. The book owns turning (click, swipe,
 * arrow keys); selection follows the visible spread and vice versa.
 */
function PreviewPanel({
  stageRef,
  onFullscreen,
}: {
  stageRef: React.RefObject<HTMLDivElement | null>;
  onFullscreen: () => void;
}) {
  const { publication, images, selectedId, select } = usePublication();
  const spreads = useMemo(
    () =>
      publication
        ? calculateSpreads(
            publication.pages,
            publication.coverMode,
            publication.readingDirection,
          )
        : [],
    [publication],
  );
  const index = selectedId ? (findSpread(spreads, selectedId)?.index ?? 0) : 0;
  const spread = spreads[index];
  const bookRef = useRef<BookHandle>(null);

  if (!spread || !publication) return null;

  const arrow =
    "grid h-10 w-10 shrink-0 place-items-center rounded-full border border-line bg-white/80 text-ink-soft shadow-sm transition hover:border-ink/40 hover:text-ink disabled:opacity-30";

  return (
    <div
      ref={stageRef}
      style={{ "--page-aspect": publication.pageAspect ?? 0.7071 } as React.CSSProperties}
      className="relative flex min-h-[420px] flex-col overflow-hidden rounded-xl border border-line bg-[radial-gradient(ellipse_at_50%_40%,#f7f3ea,#e9e2d3)] lg:min-h-0 lg:flex-1 [&:fullscreen]:h-screen [&:fullscreen_.book-fit]:[container-type:size]"
    >
      <div className="flex justify-end px-3 pt-3 md:px-4">
        <PageActions onFullscreen={onFullscreen} />
      </div>
      <div className="flex min-h-0 flex-1 items-center gap-2 px-2 py-4 md:gap-4 md:px-4 lg:py-4">
        <button
          type="button"
          aria-label="Previous spread"
          onClick={() => bookRef.current?.prev()}
          disabled={index === 0}
          className={arrow}
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} className="h-5 w-5" />
        </button>
        {/* Size container: the book takes the largest A4 spread that fits
            both width and height, so the stage never scrolls. */}
        <div className="book-fit flex min-w-0 flex-1 items-center justify-center self-stretch lg:[container-type:size]">
          <MagazineBook
            ref={bookRef}
            spreads={spreads}
            images={images}
            material={publication.material}
            index={index}
            onIndexChange={(i) => {
              const s = spreads[i];
              const p = s.left ?? s.right;
              if (p) select(p.id);
            }}
            className="w-full lg:w-[min(100cqw,calc(100cqh*2*var(--page-aspect,0.7071)))] [:fullscreen_&]:w-[min(100cqw,calc(100cqh*2*var(--page-aspect,0.7071)))]"
          />
        </div>
        <button
          type="button"
          aria-label="Next spread"
          onClick={() => bookRef.current?.next()}
          disabled={index === spreads.length - 1}
          className={arrow}
        >
          <HugeiconsIcon icon={ArrowRight01Icon} className="h-5 w-5" />
        </button>
      </div>
      <p className="pb-2 text-center font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
        Spread {index + 1} of {spreads.length} · {spread.kind.replace("-", " ")}
      </p>
    </div>
  );
}

export function StudioClient() {
  const { publication } = usePublication();
  const stageRef = useRef<HTMLDivElement>(null);
  const toggleFullscreen = () =>
    document.fullscreenElement
      ? document.exitFullscreen()
      : stageRef.current?.requestFullscreen();
  const spreads = useMemo(
    () =>
      publication
        ? calculateSpreads(
            publication.pages,
            publication.coverMode,
            publication.readingDirection,
          )
        : [],
    [publication],
  );

  if (!publication || publication.pages.length === 0) {
    return (
      <div className="mx-auto mt-10 max-w-xl text-center">
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted">
          Magazine Setup Studio
        </p>
        <h1 className="mt-4 font-display text-4xl tracking-[-0.02em]">
          No pages yet.
        </h1>
        <p className="mx-auto mt-4 max-w-md text-[15px] leading-7 text-muted">
          Upload a PDF or some images first. Your pages will appear here for
          arranging, covers and materials.
        </p>
        <div className="mt-8">
          <ButtonLink href="/upload" size="lg">
            Go to upload
            <HugeiconsIcon icon={ArrowRight01Icon} className="h-4 w-4" strokeWidth={2} />
          </ButtonLink>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:min-h-0 lg:flex-1 lg:overflow-hidden">
      {/* Settings column | stage (tools · book · filmstrip). */}
      <div className="grid gap-5 lg:min-h-0 lg:flex-1 lg:grid-cols-[260px_minmax(0,1fr)] lg:overflow-hidden">
        <aside className="rounded-xl border border-line bg-paper lg:min-h-0 lg:overflow-y-auto">
          <div className="border-b border-line bg-paper-deep/40 px-4 pb-3 pt-4">
            <h2 className="font-display text-lg font-semibold tracking-[-0.01em] text-ink">Book setup</h2>
            <p className="mt-0.5 text-[11px] text-muted">
              Choose how the book opens and feels.
            </p>
          </div>
          <CoverSettings spreads={spreads} />
          <MaterialSettings />
        </aside>

        <div className="order-first flex min-h-0 flex-col lg:order-none lg:min-h-0 lg:overflow-hidden">
          <PreviewPanel stageRef={stageRef} onFullscreen={toggleFullscreen} />
          <div className="mt-3 shrink-0 rounded-xl border border-line bg-paper px-3 pt-2">
            <div className="flex flex-wrap items-baseline justify-between gap-x-3 px-1 pb-1">
              <h2 className="text-sm font-semibold text-ink">
                Pages{" "}
                <span className="ml-1 text-[11px] font-normal text-muted">
                  {publication.pages.length}{" "}
                  {publication.pages.length === 1 ? "page" : "pages"} ·{" "}
                  {spreads.length} {spreads.length === 1 ? "spread" : "spreads"}
                </span>
              </h2>
              <p className="text-[11px] text-muted">
                Click to select. Drag to reorder.
              </p>
            </div>
            <PageStrip />
          </div>
        </div>
      </div>
    </div>
  );
}
