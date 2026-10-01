"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { MagazineVisual } from "./magazine-visual";

const rotatingWords = ["magazine.", "book."];

export function Hero() {
  const [wordIndex, setWordIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setWordIndex((i) => (i + 1) % rotatingWords.length);
    }, 2800);
    return () => clearInterval(id);
  }, []);
  return (
    <section className="relative overflow-hidden border-b border-line">
      <Container className="grid gap-12 py-16 md:py-24 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:gap-16 xl:gap-24">
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <h1 className="font-display text-[44px] font-medium leading-[1.02] tracking-[-0.03em] text-ink md:text-[68px]">
            <span className="block">Make your document</span>
            <span className="block">feel like a</span>
            <span className="block">
              <AnimatePresence mode="wait">
                <motion.em
                  key={rotatingWords[wordIndex]}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -14 }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  className="inline-block italic"
                >
                  {rotatingWords[wordIndex]}
                </motion.em>
              </AnimatePresence>
            </span>
          </h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-muted md:text-lg md:leading-8">
            Upload a PDF, JPG or PNG and get a true 1:1 magazine that keeps
            your original dimensions — with custom covers, physical materials
            and natural page turning.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <ButtonLink href="/upload" size="lg">
              Create a magazine
              <HugeiconsIcon icon={ArrowRight01Icon} className="h-4 w-4" strokeWidth={2} />
            </ButtonLink>
          </div>
          <dl className="mt-10 flex max-w-lg items-start justify-between gap-6 border-t border-line pt-6">
            {[
              ["PDF · JPG · PNG", "Upload & extract"],
              ["True 1:1", "Original dimensions"],
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
