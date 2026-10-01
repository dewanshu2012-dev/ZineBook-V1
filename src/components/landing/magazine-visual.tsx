import { useEffect, useMemo, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { MagazineBook, type BookHandle } from "@/components/magazine/magazine-book";
import { createPublication, type Page } from "@/lib/publication";
import { calculateSpreads } from "@/lib/spreads";

function TextBars({ widths }: { widths: string[] }) {
  return (
    <div className="space-y-2">
      {widths.map((w, i) => (
        <div key={i} className="h-[5px] rounded bg-ink/10" style={{ width: w }} />
      ))}
    </div>
  );
}

function LeftDemo() {
  return (
    <div className="h-full p-6 md:p-8">
      <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-muted">
        No. 04 — Essay
      </p>
      <p className="mt-4 font-display text-[26px] leading-[1.05] tracking-[-0.02em] md:text-[34px]">
        The quiet
        <br />
        geometry
        <br />
        of paper
      </p>
      <div className="mt-5">
        <TextBars widths={["100%", "100%", "92%", "100%", "75%"]} />
      </div>
      <div className="mt-6 flex items-end justify-between">
        <div className="h-16 w-20 rounded-[2px] bg-ink/[0.08]" />
        <span className="font-mono text-[11px] text-muted">24</span>
      </div>
    </div>
  );
}

function RightDemo() {
  return (
    <div className="h-full p-6 md:p-8">
      <div className="overflow-hidden rounded-[2px] bg-[#20241f]">
        <div className="flex h-28 items-center justify-center md:h-36">
          <div className="h-16 w-16 rounded-full bg-[#e9e2d2]/90 blur-[1px] md:h-20 md:w-20" />
        </div>
        <p className="bg-[#faf8f4] px-3 py-2 font-mono text-[9px] uppercase tracking-[0.18em] text-muted">
          Plate 12 — Morning light
        </p>
      </div>
      <div className="mt-5">
        <TextBars widths={["100%", "84%", "100%"]} />
      </div>
      <div className="mt-6 flex items-center justify-between">
        <span className="font-mono text-[11px] text-muted">25</span>
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
          ZineBook
        </span>
      </div>
    </div>
  );
}

function ThirdDemo() {
  return (
    <div className="h-full p-6 md:p-8">
      <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-muted">
        No. 05 — Process
      </p>
      <p className="mt-4 font-display text-[26px] leading-[1.05] tracking-[-0.02em] md:text-[34px]">
        The weight
        <br />
        of ink
        <br />
        on paper
      </p>
      <div className="mt-5">
        <TextBars widths={["92%", "100%", "100%", "84%", "100%"]} />
      </div>
      <div className="mt-6 flex items-end justify-between">
        <div className="h-16 w-20 rounded-[2px] bg-ink/[0.08]" />
        <span className="font-mono text-[11px] text-muted">26</span>
      </div>
    </div>
  );
}

function FourthDemo() {
  return (
    <div className="h-full p-6 md:p-8">
      <div className="overflow-hidden rounded-[2px] bg-[#2a2f28]">
        <div className="flex h-28 items-center justify-center md:h-36">
          <div className="h-16 w-24 rounded-[2px] bg-[#e9e2d2]/90 blur-[1px] md:h-20 md:w-28" />
        </div>
        <p className="bg-[#faf8f4] px-3 py-2 font-mono text-[9px] uppercase tracking-[0.18em] text-muted">
          Plate 13 — Evening fold
        </p>
      </div>
      <div className="mt-5">
        <TextBars widths={["100%", "100%", "84%"]} />
      </div>
      <div className="mt-6 flex items-center justify-between">
        <span className="font-mono text-[11px] text-muted">27</span>
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
          ZineBook
        </span>
      </div>
    </div>
  );
}

/**
 * Landing hero visual, now rendered by the real magazine engine:
 * a Spread model + auto-flipping book with crafted demo content.
 * Same component family the studio preview uses. Flips every 4s.
 */
export function MagazineVisual() {
  const { spreads, material, content } = useMemo(() => {
    const pages: Page[] = [1, 2, 3, 4].map((n) => ({
      id: `demo-${n}`,
      sourcePageNumber: n,
      position: n - 1,
      type: "page" as const,
      rotation: 0,
    }));
    const all = calculateSpreads(pages, "none", "ltr");
    return {
      spreads: all,
      material: createPublication("Demo").material,
      content: {
        "demo-1": <LeftDemo />,
        "demo-2": <RightDemo />,
        "demo-3": <ThirdDemo />,
        "demo-4": <FourthDemo />,
      },
    };
  }, []);

  const bookRef = useRef<BookHandle>(null);
  const [index, setIndex] = useState(0);
  const dirRef = useRef<1 | -1>(1);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (reduceMotion) return;
    const id = setInterval(() => {
      if (index >= spreads.length - 1) dirRef.current = -1;
      else if (index <= 0) dirRef.current = 1;
      if (dirRef.current === 1) bookRef.current?.next();
      else bookRef.current?.prev();
    }, 4000);
    return () => clearInterval(id);
  }, [index, spreads.length, reduceMotion]);

  return (
    <div
      className="relative mx-auto w-full max-w-[560px] select-none"
      role="img"
      aria-label="Preview of an open magazine spread auto-flipping pages"
    >
      <MagazineBook
        ref={bookRef}
        spreads={spreads}
        images={{}}
        material={material}
        content={content}
        index={index}
        onIndexChange={setIndex}
        keyboard={false}
      />
      <div className="mt-8 flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
        <span>Spread 12 — 13</span>
        <span>Smooth matte · Fold shadow</span>
      </div>
    </div>
  );
}
