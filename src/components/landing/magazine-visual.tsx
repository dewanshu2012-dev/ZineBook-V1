import { useMemo } from "react";
import { MagazineRenderer } from "@/components/magazine/magazine-renderer";
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

/**
 * Landing hero visual, now rendered by the real magazine engine:
 * a Spread model + MagazineRenderer with crafted demo content.
 * Same component family the studio preview uses.
 */
export function MagazineVisual() {
  const { spread, material, content } = useMemo(() => {
    const pages: Page[] = [1, 2].map((n) => ({
      id: `demo-${n}`,
      sourcePageNumber: n,
      position: n - 1,
      type: "page" as const,
      rotation: 0,
    }));
    const [first] = calculateSpreads(pages, "none", "ltr");
    return {
      spread: first,
      material: createPublication("Demo").material,
      content: { "demo-1": <LeftDemo />, "demo-2": <RightDemo /> },
    };
  }, []);

  return (
    <div
      className="relative mx-auto w-full max-w-[560px] select-none"
      role="img"
      aria-label="Preview of an open magazine spread"
    >
      <MagazineRenderer spread={spread} images={{}} material={material} content={content} />
      <div className="mt-8 flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
        <span>Spread 12 — 13</span>
        <span>Smooth matte · Fold shadow</span>
      </div>
    </div>
  );
}
