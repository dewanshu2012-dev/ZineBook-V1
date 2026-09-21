"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowRight } from "lucide-react";
import { PageActions } from "@/components/editor/page-actions";
import { PageStrip } from "@/components/editor/page-strip";
import { MagazineRenderer } from "@/components/magazine/magazine-renderer";
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
 * Spread preview powered by the magazine rendering engine (Milestone 7).
 * Shows the spread containing the selection — the engine decides whether
 * it is a closed cover or an open spread.
 */
function PreviewPanel() {
  const { publication, images, selectedId, select } = usePublication();
  const pages = useMemo(() => publication?.pages ?? [], [publication]);
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
  const spread = selectedId ? findSpread(spreads, selectedId) : undefined;
  const selIdx = pages.findIndex((p) => p.id === selectedId);

  // Arrow keys move selection across the whole publication.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA")) return;
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      if (pages.length === 0) return;
      e.preventDefault();
      const next =
        e.key === "ArrowRight"
          ? Math.min(pages.length - 1, (selIdx < 0 ? -1 : selIdx) + 1)
          : Math.max(0, (selIdx < 0 ? pages.length : selIdx) - 1);
      select(pages[next].id);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [pages, selIdx, select]);

  if (!spread || !publication) {
    return (
      <div className="flex h-full min-h-[320px] items-center justify-center rounded-xl border border-dashed border-line text-sm text-muted">
        Select a page to preview its spread.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-white">
      <div className="flex min-h-[380px] items-center justify-center bg-paper-deep/40 px-4 py-10 md:min-h-[520px] md:px-8">
        {spread.kind !== "interior" && (
          <p className="sr-only">
            {spread.kind === "cover" ? "Front cover" : "Back cover"}
          </p>
        )}
        <MagazineRenderer
          spread={spread}
          images={images}
          material={publication.material}
          className="w-full max-w-[560px]"
        />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line px-4 py-2.5">
        <p className="font-mono text-[11px] text-muted">
          Spread {spread.index + 1} of {spreads.length} · {spread.kind}
        </p>
        <p className="font-mono text-[11px] text-muted">← → to browse</p>
      </div>
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
          Upload a PDF or some images first — your pages will appear here for
          arranging, covers and materials.
        </p>
        <div className="mt-8">
          <ButtonLink href="/upload" size="lg">
            Go to upload
            <ArrowRight className="h-4 w-4" strokeWidth={2} />
          </ButtonLink>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6">
      {/* Studio toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <TitleInput key={publication.id} />
          <p className="mt-0.5 font-mono text-[11px] uppercase tracking-[0.16em] text-muted">
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

      {/* Three-pane workspace:
          mobile = stacked (preview first, strip as horizontal rail),
          tablet = strip + preview with settings in a 3-up row,
          desktop = full three panes. */}
      <div className="mt-5 grid items-start gap-4 md:grid-cols-[240px_minmax(0,1fr)] lg:grid-cols-[300px_minmax(0,1fr)_280px]">
        {/* Left — page list */}
        <div className="space-y-3">
          <PageActions />
          <div className="rounded-xl border border-line bg-paper p-2.5">
            <p className="px-1 pb-2 font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
              Pages — drag to reorder
            </p>
            <div className="md:max-h-[60vh] md:overflow-y-auto md:pr-0.5 lg:max-h-[calc(100vh-320px)]">
              <PageStrip />
            </div>
          </div>
        </div>

        {/* Center — spread preview (first on mobile) */}
        <div className="order-first md:order-none">
          <PreviewPanel />
        </div>

        {/* Right — settings */}
        <div className="grid gap-3 md:col-span-2 lg:col-span-1 lg:grid-cols-1 md:grid-cols-3">
          <CoverSettings spreads={spreads} />
          <ReadingSettings />
          <MaterialSettings />
        </div>
      </div>
    </div>
  );
}
