"use client";

import {
  ChevronLeft,
  ChevronRight,
  Maximize,
  Minimize,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { PageCounter } from "@/components/reader/page-counter";
import { cn } from "@/lib/utils";

function BarButton({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-full text-ink transition-colors md:h-9 md:w-9",
        "hover:bg-ink/5 disabled:pointer-events-none disabled:opacity-30",
      )}
    >
      {children}
    </button>
  );
}

/**
 * Floating reader controls (Milestone 10): prev/next, counter,
 * zoom and fullscreen. Nothing else — chrome stays out of the way.
 */
export function ReaderControls({
  current,
  total,
  label,
  canPrev,
  canNext,
  onPrev,
  onNext,
  zoom,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  fullscreen,
  onFullscreen,
}: {
  current: number;
  total: number;
  label?: string;
  canPrev: boolean;
  canNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomReset: () => void;
  fullscreen: boolean;
  onFullscreen: () => void;
}) {
  return (
    <div className="pointer-events-auto flex max-w-[calc(100vw-2rem)] items-center gap-0.5 overflow-x-auto rounded-full border border-line bg-paper/90 py-1 pl-1 pr-2 shadow-[0_12px_40px_-16px_rgba(22,19,14,0.4)] backdrop-blur-md md:gap-1">
      <BarButton label="Previous" onClick={onPrev} disabled={!canPrev}>
        <ChevronLeft className="h-5 w-5" />
      </BarButton>
      <div className="min-w-[64px] text-center md:min-w-[92px]">
        <PageCounter current={current} total={total} label={label} />
      </div>
      <BarButton label="Next" onClick={onNext} disabled={!canNext}>
        <ChevronRight className="h-5 w-5" />
      </BarButton>
      <span aria-hidden className="mx-1 hidden h-5 w-px bg-line sm:block" />
      <BarButton label="Zoom out" onClick={onZoomOut} disabled={zoom <= 0.5}>
        <ZoomOut className="h-[18px] w-[18px]" />
      </BarButton>
      <button
        type="button"
        title="Reset zoom"
        aria-label={`Zoom ${Math.round(zoom * 100)} percent. Activate to reset.`}
        onClick={onZoomReset}
        className="hidden w-11 rounded-full px-1 py-1 text-center font-mono text-[11px] text-ink-soft transition-colors hover:bg-ink/5 min-[420px]:block"
      >
        {Math.round(zoom * 100)}%
      </button>
      <BarButton label="Zoom in" onClick={onZoomIn} disabled={zoom >= 2.5}>
        <ZoomIn className="h-[18px] w-[18px]" />
      </BarButton>
      <span aria-hidden className="mx-1 hidden h-5 w-px bg-line sm:block" />
      <BarButton
        label={fullscreen ? "Exit fullscreen" : "Enter fullscreen"}
        onClick={onFullscreen}
      >
        {fullscreen ? (
          <Minimize className="h-[18px] w-[18px]" />
        ) : (
          <Maximize className="h-[18px] w-[18px]" />
        )}
      </BarButton>
    </div>
  );
}
