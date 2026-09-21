import { ArrowRight } from "lucide-react";
import { Craft } from "@/components/landing/craft";
import { Hero } from "@/components/landing/hero";
import { Reveal } from "@/components/landing/reveal";
import { SiteFooter } from "@/components/landing/site-footer";
import { SiteHeader } from "@/components/landing/site-header";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

export default function Home() {
  return (
    <div className="flex min-h-full flex-col">
      <SiteHeader />
      <main className="flex-1">
        <Hero />
        <Craft />

        {/* Closing CTA */}
        <section className="border-b border-line">
          <Container className="py-16 md:py-24">
            <Reveal>
              <div className="mx-auto max-w-3xl text-center">
                <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted">
                  Begin your issue
                </p>
                <h2 className="mt-4 font-display text-4xl leading-[1.05] tracking-[-0.02em] md:text-[52px]">
                  Your pages, bound
                  <br />
                  like print.
                </h2>
                <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-muted">
                  Upload a document in the next step. Arrangement, covers,
                  materials and the reader arrive milestone by milestone.
                </p>
                <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                  <ButtonLink href="/upload" size="lg">
                    Create a magazine
                    <ArrowRight className="h-4 w-4" strokeWidth={2} />
                  </ButtonLink>
                  <ButtonLink href="#craft" variant="secondary" size="lg">
                    Revisit the craft
                  </ButtonLink>
                </div>
              </div>
            </Reveal>
          </Container>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
