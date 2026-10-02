import { HugeiconsIcon } from "@hugeicons/react";
import {
  BookOpen01Icon,
  PaintBrush01Icon,
  Upload01Icon,
} from "@hugeicons/core-free-icons";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "./reveal";

const steps = [
  {
    icon: Upload01Icon,
    name: "Upload anything",
    body: "Drop in a PDF, JPG or PNG. ZineBook extracts every page at its original size — true 1:1, no squashed layouts.",
  },
  {
    icon: BookOpen01Icon,
    name: "Make it a book",
    body: "Pages are paired into real spreads with covers, reading direction and blanks handled for you — just flip.",
  },
  {
    icon: PaintBrush01Icon,
    name: "Feel the paper",
    body: "Pick a stock like Glossy, Kraft or Linen, then tune depth, shadow and texture until it feels printed.",
  },
];

const covers = [
  {
    name: "No cover",
    spreads: "1+2 · 3+4 · 5+6",
    body: "Opens directly onto a two-page spread. Best for documents, decks and PDFs you want to read instantly.",
  },
  {
    name: "Single cover",
    spreads: "Cover → 2+3 · 4+5",
    body: "Page one becomes the front. The first turn opens your magazine — the classic single-issue feel.",
  },
  {
    name: "Full physical cover",
    spreads: "Front → 2+3 → … → Back",
    body: "Closed front, interior spreads, closing back. Front + back covers for the true print-book feeling.",
  },
];

const materials = [
  "Smooth Matte",
  "Glossy",
  "Premium Matte",
  "Uncoated",
  "Matte Cover",
  "Soft Touch",
  "Kraft",
  "Linen",
];

export function Craft() {
  return (
    <section id="about" className="scroll-mt-[68px] border-b border-line bg-paper-deep/40">
      <Container className="py-16 md:py-24">
        <Reveal>
          <SectionHeading
            eyebrow="About ZineBook"
            title="Your documents, reborn as digital magazines and books."
            lede="ZineBook converts your PDFs, JPGs and PNGs into a true 1:1 digital magazine — keeping your original dimensions, pairing pages into natural spreads, and wrapping them in covers and paper you can almost feel. Upload, style it, flip through it like print."
          />
        </Reveal>

        {/* How it works */}
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {steps.map((s, i) => (
            <Reveal key={s.name} delay={i * 0.07}>
              <article className="flex h-full flex-col rounded-2xl border border-line bg-paper p-7">
                <span className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-paper-deep/60">
                  <HugeiconsIcon icon={s.icon} className="h-5 w-5" strokeWidth={1.8} />
                </span>
                <p className="mt-5 font-mono text-[11px] uppercase tracking-[0.2em] text-gold">
                  Step {i + 1}
                </p>
                <h3 className="mt-2 font-display text-2xl">{s.name}</h3>
                <p className="mt-3 text-sm leading-6 text-muted">{s.body}</p>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal>
          <div className="mt-12">
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted">
              Cover options
            </p>
            <h3 className="mt-3 max-w-xl font-display text-2xl leading-tight md:text-3xl">
              Three ways to bind your issue.
            </h3>
            <p className="mt-3 max-w-2xl text-[15px] leading-7 text-muted">
              Choose how your magazine opens. The rendering engine pairs pages
              into spreads from your cover mode, reading direction and blanks —
              never hardcoded pairs.
            </p>
          </div>
        </Reveal>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {covers.map((c, i) => (
            <Reveal key={c.name} delay={i * 0.07}>
              <article className="flex h-full flex-col rounded-2xl border border-line bg-paper p-7">
                <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-gold">
                  Option {i + 1}
                </p>
                <h3 className="mt-2 font-display text-2xl">{c.name}</h3>
                <p className="mt-2 font-mono text-xs text-muted">{c.spreads}</p>
                <p className="mt-3 text-sm leading-6 text-muted">{c.body}</p>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.05}>
          <div
            id="materials"
            className="mt-6 rounded-2xl border border-line bg-ink p-7 text-paper md:p-10"
          >
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-paper/60">
              Textures & materials
            </p>
            <h3 className="mt-3 max-w-xl font-display text-2xl leading-tight md:text-3xl">
              Pick a stock, tune it till it feels like paper.
            </h3>
            <p className="mt-3 max-w-2xl text-[15px] leading-7 text-paper/70">
              In the studio, choose from magazine paper, cover stock and
              experimental finishes — Smooth Matte, Glossy, Kraft, Linen and
              more — then dial in page depth, shadow and texture intensity.
              Every change previews instantly in the reader.
            </p>
            <ul className="mt-6 flex flex-wrap gap-2">
              {materials.map((m) => (
                <li
                  key={m}
                  className="rounded-full border border-paper/20 px-4 py-1.5 text-sm text-paper/85"
                >
                  {m}
                </li>
              ))}
            </ul>
            <div className="mt-8 grid gap-6 border-t border-paper/15 pt-6 sm:grid-cols-3">
              {[
                ["Page depth", "Thin — Thick"],
                ["Page shadow", "None — Strong"],
                ["Texture", "Subtle — Strong"],
              ].map(([k, v]) => (
                <div key={k}>
                  <p className="text-sm font-medium">{k}</p>
                  <p className="mt-1 font-mono text-xs text-paper/60">{v}</p>
                  <div className="mt-3 h-[3px] rounded bg-paper/15">
                    <div className="h-full w-1/2 rounded bg-paper/80" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
