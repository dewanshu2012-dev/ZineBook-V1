"use client";

import { useMemo, useRef, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon, ArrowRight01Icon, MaximizeScreenIcon } from "@hugeicons/core-free-icons";
import { PageActions } from "@/components/editor/page-actions";
import { PageStrip } from "@/components/editor/page-strip";
import { MagazineBook, type BookHandle } from "@/components/magazine";
import {
  CoverSettings,
  ReadingSettings,
} from "@/components/studio/publication-settings";
import { MaterialSettings } from "@/components/studio/material-settings";
import { PublishMenu } from "@/components/studio/publish-menu";
import { ButtonLink } from "@/components/ui/button";
import { calculateSpreads, findSpread } from "@/lib/spreads";
import { usePublication } from "@/lib/publication-store";

/**
 * Interactive flip-book preview. The book owns turning (click, swipe,
 * arrow keys); selection follows the visible spread and vice versa.
 */
function PreviewPanel() {
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
  const stageRef = useRef<HTMLDivElement>(null);
  const toggleFullscreen = () =>
    document.fullscreenElement
      ? document.exitFullscreen()
      : stageRef.current?.requestFullscreen();

  if (!spread || !publication) return null;

  const arrow =
    "grid h-10 w-10 shrink-0 place-items-center rounded-full border border-line bg-white/80 text-ink-soft shadow-sm transition hover:border-ink/40 hover:text-ink disabled:opacity-30";

  return (
    <div
      ref={stageRef}
      style={{ "--page-aspect": publication.pageAspect ?? 0.7071 } as React.CSSProperties}
      className="relative flex flex-col bg-[radial-gradient(ellipse_at_50%_40%,#f7f3ea,#e9e2d3)] lg:min-h-0 lg:flex-1 [&:fullscreen]:h-screen [&:fullscreen_.book-fit]:[container-type:size]"
    >
      <button
        type="button"
        onClick={toggleFullscreen}
        aria-label="Toggle fullscreen"
        className="group absolute right-3 top-3 z-30 grid h-8 w-8 place-items-center rounded-md border border-line bg-white/80 text-ink-soft shadow-sm transition hover:border-ink/40 hover:text-ink"
      >
        <HugeiconsIcon icon={MaximizeScreenIcon} className="h-4 w-4" />
        <span
          aria-hidden
          className="pointer-events-none absolute right-0 top-full mt-1.5 whitespace-nowrap rounded-md bg-ink px-2 py-1 text-[11px] font-medium text-paper opacity-0 shadow-md transition group-hover:opacity-100"
        >
          Fullscreen (Esc to exit)
        </span>
      </button>
      <div className="flex items-center gap-3 px-3 py-8 md:gap-6 md:px-6 lg:min-h-0 lg:flex-1 lg:py-6">
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
            className="w-full lg:w-[min(96cqw,calc(94cqh*2*var(--page-aspect,0.7071)))] [:fullscreen_&]:w-[min(96cqw,calc(94cqh*2*var(--page-aspect,0.7071)))]"
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

function TitleInput() {
  const { publication, rename } = usePublication();
  // Draft lives in local state only; remount per publication via key below.
  const [draft, setDraft] = useState(publication?.title ?? "");
  if (!publication) return null;

  const commit = () => {
    const clean = draft.trim().slice(0, 80);
    if (clean.length === 0) {
      setDraft(publication.title);
    } else {
      rename(draft);
      setDraft(clean);
    }
  };

  return (
    <input
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === "Enter") (e.target as HTMLInputElement).blur();
      }}
      aria-label="Publication title"
      spellCheck={false}
      className="w-full max-w-md rounded-lg bg-transparent font-display text-2xl tracking-[-0.01em] outline-none transition-colors hover:bg-ink/[0.03] focus:bg-ink/[0.03] focus:px-2 md:text-[28px]"
    />
  );
}

export function StudioClient() {
  const { publication, sourceName } = usePublication();
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
    <div className="mt-2 flex flex-col lg:min-h-0 lg:flex-1">
      {/* Studio toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h1 className="max-w-md">
            <TitleInput key={publication.id} />
          </h1>
          <p className="mt-0.5 text-xs text-muted">
            {sourceName ?? "Document"} · {publication.pages.length}{" "}
            {publication.pages.length === 1 ? "page" : "pages"} ·{" "}
            {spreads.length} {spreads.length === 1 ? "spread" : "spreads"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ButtonLink href="/read" variant="secondary" size="sm">
            Read
          </ButtonLink>
          <PublishMenu />
        </div>
      </div>

      {/* Settings column | stage (tools · book · filmstrip). */}
      <div className="mt-4 grid gap-5 lg:min-h-0 lg:flex-1 lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="rounded-xl border border-line bg-paper lg:overflow-y-auto">
          <div className="border-b border-line px-4 py-3">
            <h2 className="text-sm font-semibold text-ink">Book setup</h2>
            <p className="mt-0.5 text-[11px] text-muted">
              Choose how the book opens and feels.
            </p>
          </div>
          <CoverSettings spreads={spreads} />
          <ReadingSettings />
          <MaterialSettings />
        </aside>

        <div className="order-first flex flex-col overflow-hidden rounded-xl border border-line bg-paper lg:order-none lg:min-h-0">
          <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-2.5">
            <div>
              <h2 className="text-sm font-semibold text-ink">Preview</h2>
              <p className="mt-0.5 text-[11px] text-muted">Updates as you edit</p>
            </div>
            <span className="font-mono text-[10px] text-muted">
              {spreads.length} {spreads.length === 1 ? "spread" : "spreads"}
            </span>
          </div>
          <div className="border-b border-line px-4 py-2.5">
            <PageActions />
          </div>
          <PreviewPanel />
          <div className="border-t border-line px-3 pt-2">
            <div className="flex flex-wrap items-baseline justify-between gap-x-3 px-1 pb-1">
              <h2 className="text-sm font-semibold text-ink">Pages</h2>
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
