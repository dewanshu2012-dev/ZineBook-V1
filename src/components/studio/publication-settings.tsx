"use client";

import { BookOpen, MoveHorizontal } from "lucide-react";
import { describePairing, type Spread } from "@/lib/spreads";
import { usePublication } from "@/lib/publication-store";
import type { CoverMode, ReadingDirection } from "@/lib/publication";
import { cn } from "@/lib/utils";

const COVERS: { mode: CoverMode; name: string; body: string }[] = [
  {
    mode: "none",
    name: "No cover",
    body: "Opens directly onto a two-page spread.",
  },
  {
    mode: "single",
    name: "Single cover",
    body: "Page 1 is the front. The first turn opens the magazine.",
  },
  {
    mode: "full",
    name: "Full cover",
    body: "Closed front, interior spreads, closing back.",
  },
];

const DIRECTIONS: { dir: ReadingDirection; name: string }[] = [
  { dir: "ltr", name: "Left → Right" },
  { dir: "rtl", name: "Right → Left" },
];

export function CoverSettings({ spreads }: { spreads: Spread[] }) {
  const { publication, setCoverMode } = usePublication();
  if (!publication) return null;

  return (
    <section className="rounded-xl border border-line bg-paper p-4">
      <h3 className="flex items-center gap-2 text-sm font-semibold">
        <BookOpen className="h-4 w-4" />
        Cover
      </h3>
      <div className="mt-3 space-y-1.5" role="radiogroup" aria-label="Cover mode">
        {COVERS.map((c) => {
          const active = publication.coverMode === c.mode;
          return (
            <button
              key={c.mode}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => setCoverMode(c.mode)}
              className={cn(
                "w-full rounded-lg border px-3 py-2 text-left transition-colors",
                active
                  ? "border-ink bg-ink text-paper"
                  : "border-line bg-white hover:border-ink/40",
              )}
            >
              <span className="block text-[13px] font-semibold">{c.name}</span>
              <span
                className={cn(
                  "mt-0.5 block text-xs leading-5",
                  active ? "text-paper/70" : "text-muted",
                )}
              >
                {c.body}
              </span>
            </button>
          );
        })}
      </div>
      <p className="mt-3 border-t border-line pt-2.5 font-mono text-[10px] leading-5 text-muted">
        {describePairing(spreads)}
      </p>
    </section>
  );
}

export function ReadingSettings() {
  const { publication, setReadingDirection } = usePublication();
  if (!publication) return null;

  return (
    <section className="rounded-xl border border-line bg-paper p-4">
      <h3 className="flex items-center gap-2 text-sm font-semibold">
        <MoveHorizontal className="h-4 w-4" />
        Reading
      </h3>
      <div
        className="mt-3 grid grid-cols-2 gap-1 rounded-lg border border-line bg-white p-1"
        role="radiogroup"
        aria-label="Reading direction"
      >
        {DIRECTIONS.map((d) => {
          const active = publication.readingDirection === d.dir;
          return (
            <button
              key={d.dir}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => setReadingDirection(d.dir)}
              className={cn(
                "rounded-md px-2 py-1.5 text-xs font-medium transition-colors",
                active ? "bg-ink text-paper" : "text-ink-soft hover:text-ink",
              )}
            >
              {d.name}
            </button>
          );
        })}
      </div>
    </section>
  );
}
