import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "./reveal";

const covers = [
  {
    name: "No cover",
    spreads: "1+2 · 3+4 · 5+6",
    body: "Opens directly onto a two-page spread. Best for documents and decks.",
  },
  {
    name: "Single cover",
    spreads: "Cover → 2+3 · 4+5",
    body: "Page one behaves as the front. The first turn opens the magazine.",
  },
  {
    name: "Full physical cover",
    spreads: "Front → 2+3 → … → Back",
    body: "Closed front, interior spreads, closing back. The true print feeling.",
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
    <section id="craft" className="border-b border-line bg-paper-deep/40">
      <Container className="py-16 md:py-24">
        <Reveal>
          <SectionHeading
            eyebrow="Magazine logic"
            title="A magazine is not a sequence of PDF pages."
            lede="The rendering engine pairs pages into spreads from your cover mode, reading direction and blanks — never hardcoded pairs in the UI."
          />
        </Reveal>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
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
              Material system
            </p>
            <h3 className="mt-3 max-w-xl font-display text-2xl leading-tight md:text-3xl">
              Paper you can almost feel — grain, light, depth, shadow.
            </h3>
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
