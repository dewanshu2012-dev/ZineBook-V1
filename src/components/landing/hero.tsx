"use client";

import { motion } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon, PlayIcon } from "@hugeicons/core-free-icons";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/section-heading";
import { MagazineVisual } from "./magazine-visual";

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-line">
      <Container className="grid gap-12 py-16 md:py-24 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:gap-8">
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <Eyebrow>Digital publishing studio — v1</Eyebrow>
          <h1 className="mt-5 font-display text-[44px] font-medium leading-[1.02] tracking-[-0.03em] text-ink md:text-[68px]">
            Make your PDF feel like a real magazine.
          </h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-muted md:text-lg md:leading-8">
            Turn documents, portfolios and publications into realistic digital
            magazines with custom covers, physical materials and natural page
            turning.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <ButtonLink href="/upload" size="lg">
              Create a magazine
              <HugeiconsIcon icon={ArrowRight01Icon} className="h-4 w-4" strokeWidth={2} />
            </ButtonLink>
            <ButtonLink href="#craft" variant="secondary" size="lg">
              <HugeiconsIcon icon={PlayIcon} className="h-4 w-4" strokeWidth={2} />
              View example
            </ButtonLink>
          </div>
          <dl className="mt-10 flex max-w-md items-start justify-between gap-6 border-t border-line pt-6">
            {[
              ["PDF", "Upload & extract"],
              ["A5–A4", "True spread ratio"],
              ["CSS 3D", "Real page turns"],
            ].map(([k, v]) => (
              <div key={k}>
                <dt className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
                  {v}
                </dt>
                <dd className="mt-1 font-display text-xl">{k}</dd>
              </div>
            ))}
          </dl>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 28, rotate: 0.5 }}
          animate={{ opacity: 1, y: 0, rotate: 0 }}
          transition={{ duration: 0.8, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
          className="relative"
        >
          <div
            aria-hidden
            className="absolute -top-10 left-1/2 -z-10 h-64 w-[130%] -translate-x-1/2 rounded-[100%] bg-paper-deep blur-3xl"
          />
          <MagazineVisual />
        </motion.div>
      </Container>
    </section>
  );
}
