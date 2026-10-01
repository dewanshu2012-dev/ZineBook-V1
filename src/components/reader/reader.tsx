"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon } from "@hugeicons/core-free-icons";
import { MagazineBook, type BookHandle } from "@/components/magazine";
import { MobilePager } from "@/components/reader/mobile-pager";
import { ReaderControls } from "@/components/reader/reader-controls";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Logo } from "@/components/ui/logo";
import { calculateSpreads } from "@/lib/spreads";
import { useMediaQuery } from "@/lib/use-media-query";
import { usePublication } from "@/lib/publication-store";
import { cn } from "@/lib/utils";

const CHROME_IDLE_MS = 2800;

/**
 * Distraction-free reader (Milestone 10).
 * Desktop: two-page turning spreads. Mobile: single-page swipe flow.
 * Chrome auto-hides while reading; zoom and fullscreen are one tap away.
 */
export function Reader() {
  const { publication, images, hydrated } = usePublication();
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const [spreadIdx, setSpreadIdx] = useState(0);
  const [pageIdx, setPageIdx] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [fullscreen, setFullscreen] = useState(false);
  const [chrome, setChrome] = useState(true);
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bookRef = useRef<BookHandle>(null);

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
  const pages = publication?.pages ?? [];

  // Fullscreen state follows the document.
  useEffect(() => {
    const onChange = () => setFullscreen(document.fullscreenElement != null);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  // Wake chrome on activity, hide it when idle.
  useEffect(() => {
    const wake = () => {
      setChrome(true);
      if (idleTimer.current) clearTimeout(idleTimer.current);
      idleTimer.current = setTimeout(() => setChrome(false), CHROME_IDLE_MS);
    };
    wake();
    window.addEventListener("pointermove", wake);
    window.addEventListener("pointerdown", wake);
    window.addEventListener("keydown", wake);
    return () => {
      window.removeEventListener("pointermove", wake);
      window.removeEventListener("pointerdown", wake);
      window.removeEventListener("keydown", wake);
      if (idleTimer.current) clearTimeout(idleTimer.current);
    };
  }, []);

  const toggleFullscreen = useCallback(async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await document.documentElement.requestFullscreen();
    } catch {
      /* unsupported — button simply does nothing */
    }
  }, []);

  const goPrev = useCallback(() => {
    if (isDesktop) bookRef.current?.prev();
    else setPageIdx((i) => Math.max(0, i - 1));
  }, [isDesktop]);

  const goNext = useCallback(() => {
    if (isDesktop) bookRef.current?.next();
    else setPageIdx((i) => Math.min(pages.length - 1, i + 1));
  }, [isDesktop, pages.length]);

  // Reader-level arrows drive whichever flow is visible.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA")) return;
      if (e.key === "ArrowRight") {
        e.preventDefault();
        goNext();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        goPrev();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goNext, goPrev]);

  if (!hydrated) {
    return <p className="py-24 text-center text-sm text-muted">Opening…</p>;
  }

  if (!publication || spreads.length === 0) {
    return (
      <div className="mx-auto max-w-xl py-24 text-center">
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted">
          Nothing to read
        </p>
        <h1 className="mt-4 font-display text-4xl tracking-[-0.02em]">
          Upload a magazine first.
        </h1>
        <div className="mt-8">
          <ButtonLink href="/upload" size="lg">
            Go to upload
          </ButtonLink>
        </div>
      </div>
    );
  }

  const desktop = isDesktop;
  const current = desktop ? spreadIdx + 1 : pageIdx + 1;
  const total = desktop ? spreads.length : pages.length;
  const label = desktop ? "Spread" : "Page";

  return (
    <div className={cn(!chrome && "cursor-none")}>
      {/* Header chrome */}
      <div
        className={cn(
          "transition-opacity duration-300",
          chrome ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      >
        <Container className="flex h-[60px] items-center justify-between">
          <Logo />
          <p className="hidden truncate px-4 font-display text-[17px] sm:block">
            {publication.title}
          </p>
          <ButtonLink href="/studio" variant="ghost" size="sm">
            <HugeiconsIcon icon={Cancel01Icon} className="h-4 w-4" />
            Exit
          </ButtonLink>
        </Container>
      </div>

      {/* Stage */}
      <div className="overflow-auto px-4 pb-32 pt-4 md:px-8">
        <div
          className="mx-auto w-full max-w-4xl origin-top"
          style={
            {
              transform: `scale(${zoom})`,
              "--page-aspect": publication.pageAspect ?? 0.7071,
            } as React.CSSProperties
          }
        >
          {desktop ? (
            <MagazineBook
              ref={bookRef}
              spreads={spreads}
              images={images}
              material={publication.material}
              index={spreadIdx}
              onIndexChange={setSpreadIdx}
              keyboard={false}
              className="px-6 md:px-12"
            />
          ) : (
            <MobilePager
              pages={pages}
              images={images}
              material={publication.material}
              index={pageIdx}
              onIndexChange={setPageIdx}
            />
          )}
        </div>
      </div>

      {/* Bottom chrome */}
      <div
        className={cn(
          "fixed inset-x-0 bottom-5 z-30 flex justify-center transition-all duration-300",
          chrome
            ? "translate-y-0 opacity-100"
            : "pointer-events-none translate-y-3 opacity-0",
        )}
      >
        <ReaderControls
          current={Math.min(current, total)}
          total={total}
          label={label}
          canPrev={(desktop ? spreadIdx : pageIdx) > 0}
          canNext={(desktop ? spreadIdx : pageIdx) < total - 1}
          onPrev={goPrev}
          onNext={goNext}
          zoom={zoom}
          onZoomIn={() => setZoom((z) => Math.min(2.5, +(z + 0.25).toFixed(2)))}
          onZoomOut={() => setZoom((z) => Math.max(0.5, +(z - 0.25).toFixed(2)))}
          onZoomReset={() => setZoom(1)}
          fullscreen={fullscreen}
          onFullscreen={toggleFullscreen}
        />
      </div>
    </div>
  );
}
