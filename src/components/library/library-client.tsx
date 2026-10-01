"use client";

import { useEffect, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowRight01Icon,
  Bookshelf01Icon,
  Delete02Icon,
} from "@hugeicons/core-free-icons";
import { Button, ButtonLink } from "@/components/ui/button";
import { loadPageImages } from "@/lib/page-images";
import type { Publication } from "@/lib/publication";
import { usePublication } from "@/lib/publication-store";
import { calculateSpreads } from "@/lib/spreads";

const STORAGE_KEY = "zinebook:publication:v1";

type Status = "loading" | "empty" | "ready";

function readSavedPublication(): Publication | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Publication;
    if (!parsed || !Array.isArray(parsed.pages) || parsed.pages.length === 0) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

/** Library: every book saved in this browser, with an empty bookshelf for newcomers. */
export function LibraryClient() {
  const { clear } = usePublication();
  // Lazy boot reads the saved book once — no render-loop effect.
  // Guarded for prerender, where window does not exist.
  const [boot] = useState<{ saved: Publication | null }>(() => ({
    saved: typeof window === "undefined" ? null : readSavedPublication(),
  }));
  const [publication, setPublication] = useState<Publication | null>(boot.saved);
  const [status, setStatus] = useState<Status>(boot.saved ? "loading" : "empty");
  const [cover, setCover] = useState<string | null>(null);

  useEffect(() => {
    if (!boot.saved) return;
    let cancelled = false;
    const ids = boot.saved.pages.map((p) => p.id);
    loadPageImages(ids).then((map) => {
      if (cancelled || !boot.saved) return;
      const first = map[boot.saved.pages[0]?.id];
      setCover(first?.thumbnail ?? first?.preview ?? null);
      setStatus("ready");
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const remove = () => {
    clear();
    setPublication(null);
    setCover(null);
    setStatus("empty");
  };

  if (status === "loading") {
    return (
      <div className="mx-auto mt-10 max-w-3xl text-center">
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted">
          Loading your library…
        </p>
      </div>
    );
  }

  if (status === "empty" || !publication) {
    return (
      <div className="mx-auto mt-10 max-w-xl text-center">
        <HugeiconsIcon
          icon={Bookshelf01Icon}
          className="mx-auto h-10 w-10 text-muted"
          strokeWidth={1.5}
        />
        <h1 className="mt-4 font-display text-4xl tracking-[-0.02em]">
          Your bookshelf is empty.
        </h1>
        <p className="mx-auto mt-4 max-w-md text-[15px] leading-7 text-muted">
          There are no books in your library.
        </p>
        <div className="mt-8">
          <ButtonLink href="/upload" size="lg">
            Create a magazine
            <HugeiconsIcon icon={ArrowRight01Icon} className="h-4 w-4" strokeWidth={2} />
          </ButtonLink>
        </div>
      </div>
    );
  }

  const spreads = calculateSpreads(
    publication.pages,
    publication.coverMode,
    publication.readingDirection,
  );
  let updated = "";
  try {
    updated = new Date(publication.updatedAt).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    /* leave blank */
  }

  return (
    <div className="mx-auto mt-10 max-w-3xl">
      <div className="flex flex-col gap-6 rounded-2xl border border-line bg-paper p-5 sm:flex-row sm:items-center">
        <div className="mx-auto w-32 shrink-0 overflow-hidden rounded-lg border border-line bg-paper-deep/40 sm:mx-0">
          {cover ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={cover} alt="" className="aspect-[3/4] w-full object-cover" />
          ) : (
            <div className="flex aspect-[3/4] w-full items-center justify-center">
              <HugeiconsIcon icon={Bookshelf01Icon} className="h-8 w-8 text-muted" strokeWidth={1.5} />
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1 text-center sm:text-left">
          <h2 className="truncate font-display text-2xl tracking-[-0.01em]">
            {publication.title}
          </h2>
          <p className="mt-1 text-xs text-muted">
            {publication.pages.length}{" "}
            {publication.pages.length === 1 ? "page" : "pages"} ·{" "}
            {spreads.length} {spreads.length === 1 ? "spread" : "spreads"}
            {updated ? ` · Updated ${updated}` : ""}
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
            <ButtonLink href="/studio" variant="primary" size="sm">
              Open in Studio
            </ButtonLink>
            <ButtonLink href="/read" variant="secondary" size="sm">
              Read
            </ButtonLink>
            <Button variant="ghost" size="sm" onClick={remove}>
              <HugeiconsIcon icon={Delete02Icon} className="h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
