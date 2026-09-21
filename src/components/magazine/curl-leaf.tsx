"use client";

import { motion } from "framer-motion";
import { MaterialLayer } from "@/components/magazine/material-layer";
import type { Page, PublicationMaterial } from "@/lib/publication";

/**
 * Curling page leaf (Path C motion upgrade).
 *
 * Ports the real-paper motion formula: each slice rotates proportionally
 * further from the spine (angle grows with distance, like pageflipopen's
 * per-vertex curl), the fore-edge leads, a highlight travels across the
 * curl, and the whole leaf lifts slightly mid-turn. Implemented as a
 * nested preserve-3d chain — joints compose into a true curl curve —
 * so the Studio pipeline (arrange/covers/materials) is untouched.
 */

export const CURL_SLICES = 8;
const JOINT_DEG = 180 / CURL_SLICES;
const JOINT_DURATION = 0.7;
const JOINT_STAGGER = 0.035;
const TOTAL_DURATION = JOINT_DURATION + JOINT_STAGGER * (CURL_SLICES - 1);
const EASE = [0.32, 0.72, 0.35, 1] as const;

export type CurlFace = {
  page: Page | null;
  /** Preview data URL (background-sliced across the chain). */
  src?: string;
};

function FaceStrip({
  face,
  strip,
  flip,
  shadeFrom,
  shadeTo,
  material,
}: {
  face: CurlFace;
  /** Which vertical strip of the page this slice shows. */
  strip: number;
  /** Back faces ride inside a 180° wrapper (mirrors like a real page). */
  flip: boolean;
  shadeFrom: number;
  shadeTo: number;
  material: PublicationMaterial;
}) {
  return (
    <div
      className="absolute inset-0"
      style={{
        backfaceVisibility: "hidden",
        transform: flip ? "rotateY(180deg)" : undefined,
      }}
    >
      {face.src ? (
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("${face.src}")`,
            backgroundSize: `${CURL_SLICES * 100}% 100%`,
            backgroundPosition: `${(strip / (CURL_SLICES - 1)) * 100}% 50%`,
            backgroundRepeat: "no-repeat",
            backgroundColor: "#fffdf8",
          }}
        />
      ) : (
        <div className="absolute inset-0 bg-[#fffdf8]" />
      )}
      <MaterialLayer material={material} />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-ink"
        initial={{ opacity: shadeFrom }}
        animate={{ opacity: shadeTo }}
        transition={{ duration: TOTAL_DURATION, ease: "linear" }}
      />
    </div>
  );
}

function CurlLevel({
  depth,
  dir,
  front,
  back,
  material,
  onDone,
}: {
  depth: number;
  dir: 1 | -1;
  front: CurlFace;
  back: CurlFace;
  material: PublicationMaterial;
  onDone?: () => void;
}) {
  const last = depth === CURL_SLICES - 1;
  // Hinge-side strip first; mirrored for backward turns.
  const frontStrip = dir === 1 ? depth : CURL_SLICES - 1 - depth;
  const backStrip = CURL_SLICES - 1 - frontStrip;
  return (
    <motion.div
      className="absolute top-0 bottom-0"
      style={{
        width: `${100 / CURL_SLICES}%`,
        ...(depth === 0
          ? dir === 1
            ? { left: 0 }
            : { right: 0 }
          : dir === 1
            ? { left: "100%" }
            : { right: "100%" }),
        transformOrigin: dir === 1 ? "left center" : "right center",
        transformStyle: "preserve-3d",
      }}
      initial={{ rotateY: 0 }}
      animate={{ rotateY: (dir === 1 ? -1 : 1) * JOINT_DEG }}
      transition={{
        duration: JOINT_DURATION,
        delay: depth * JOINT_STAGGER,
        ease: [...EASE],
      }}
      onAnimationComplete={last ? onDone : undefined}
    >
      <FaceStrip
        face={front}
        strip={frontStrip}
        flip={false}
        shadeFrom={0}
        shadeTo={0.4}
        material={material}
      />
      <FaceStrip
        face={back}
        strip={backStrip}
        flip
        shadeFrom={0.4}
        shadeTo={0}
        material={material}
      />
      {!last && (
        <CurlLevel
          depth={depth + 1}
          dir={dir}
          front={front}
          back={back}
          material={material}
          onDone={onDone}
        />
      )}
    </motion.div>
  );
}

export function CurlLeaf({
  dir,
  front,
  back,
  material,
  onDone,
  className,
}: {
  dir: 1 | -1;
  front: CurlFace;
  back: CurlFace;
  material: PublicationMaterial;
  onDone: () => void;
  className?: string;
}) {
  return (
    <motion.div
      aria-hidden
      className={className}
      style={{ perspective: "2200px" }}
      initial={{ scale: 1 }}
      animate={{ scale: [1, 1.035, 1] }}
      transition={{ duration: TOTAL_DURATION, times: [0, 0.45, 1], ease: "easeInOut" }}
    >
      <CurlLevel
        depth={0}
        dir={dir}
        front={front}
        back={back}
        material={material}
        onDone={onDone}
      />
      {/* Traveling highlight: light plays across the curl as it travels. */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 w-[35%]"
        style={{
          background:
            "linear-gradient(105deg, rgba(255,255,255,0) 25%, rgba(255,255,255,0.55) 50%, rgba(255,255,255,0) 75%)",
          mixBlendMode: "soft-light",
        }}
        initial={{ x: dir === 1 ? "-120%" : "420%", opacity: 0 }}
        animate={{
          x: dir === 1 ? ["-120%", "150%", "420%"] : ["420%", "150%", "-120%"],
          opacity: [0, 1, 0],
        }}
        transition={{ duration: TOTAL_DURATION, times: [0, 0.5, 1], ease: "easeInOut" }}
      />
    </motion.div>
  );
}
