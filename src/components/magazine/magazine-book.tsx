"use client";

import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type MotionValue,
} from "framer-motion";
import {
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type ReactNode,
  type Ref,
} from "react";
import { MagazinePage } from "@/components/magazine/magazine-page";
import { MagazineRenderer } from "@/components/magazine/magazine-renderer";
import type { PageImage } from "@/lib/page-images";
import type { Page, PublicationMaterial } from "@/lib/publication";
import type { Spread } from "@/lib/spreads";
import { nextSpreadIndex, prevSpreadIndex } from "@/lib/spreads";
import { cn } from "@/lib/utils";

type Turn = { dir: 1 | -1; from: number; to: number };

const TURN_DURATION = 0.7;
// Quick lift, long soft settle — like a page dropping onto the stack.
const TURN_EASE = [0.3, 0.1, 0.2, 1] as const;
const SWIPE_PX = 60;

// Shadows are spine-anchored gradients; only their opacity animates.
const ink = (a: number) => `rgba(22,19,14,${a})`;
const spineShade = (towards: "left" | "right") =>
  `linear-gradient(to ${towards}, ${ink(0.55)}, ${ink(0.18)} 30%, ${ink(0)} 70%)`;

function LeafFace({
  page,
  image,
  material,
  side,
  children,
  shade,
}: {
  page: Page | null;
  image?: PageImage;
  material: PublicationMaterial;
  side: "left" | "right";
  children?: ReactNode;
  shade: MotionValue<number>;
}) {
  return (
    <div className="absolute inset-0 overflow-hidden bg-[#fffdf8]">
      {page ? (
        <MagazinePage
          page={page}
          image={image}
          material={material}
          side={side}
          className="h-full w-full"
        >
          {children}
        </MagazinePage>
      ) : (
        <div className="h-full bg-paper-deep/40" />
      )}
      {/* Light falls off as the leaf turns away from the viewer. */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          opacity: shade,
          background: spineShade(side === "right" ? "right" : "left"),
        }}
      />
    </div>
  );
}

/**
 * Rigid leaf rotating around the spine. One progress value (0→1) drives
 * rotation and every shadow, so they can never drift apart, and only
 * transform/opacity change per frame (compositor-only, no repaints).
 */
function FlatLeaf({
  dir,
  frontPage,
  frontImage,
  frontSide,
  backPage,
  backImage,
  backSide,
  material,
  content,
  onDone,
}: {
  dir: 1 | -1;
  frontPage: Page | null;
  frontImage?: PageImage;
  frontSide: "left" | "right";
  backPage: Page | null;
  backImage?: PageImage;
  backSide: "left" | "right";
  material: PublicationMaterial;
  content?: Record<string, ReactNode>;
  onDone: () => void;
}) {
  const p = useMotionValue(0);
  const rotateY = useTransform(p, [0, 1], [0, dir === 1 ? -180 : 180]);
  // Leaf faces darken toward edge-on (p = .5), then lighten as it lands.
  const frontShade = useTransform(p, [0, 0.5], [0, 0.5]);
  const backShade = useTransform(p, [0.5, 1], [0.5, 0]);
  // Shadow on the page being uncovered: strong at lift-off, gone by edge-on.
  const fromShadow = useTransform(p, [0, 0.08, 0.5], [0, 0.6, 0]);
  // Shadow cast onto the page the leaf lands on: builds, then closes up.
  const toShadow = useTransform(p, [0.5, 0.88, 1], [0, 0.55, 0]);

  const done = useRef(onDone);
  useEffect(() => {
    done.current = onDone;
  });
  useEffect(() => {
    const controls = animate(p, 1, {
      duration: TURN_DURATION,
      ease: [...TURN_EASE],
      onComplete: () => done.current(),
    });
    return () => controls.stop();
  }, [p]);

  const leafSide = dir === 1 ? "right" : "left";
  const landSide = dir === 1 ? "left" : "right";

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-10"
      style={{ perspective: "2400px" }}
    >
      <motion.div
        className={cn("absolute inset-y-0 w-1/2", leafSide === "right" ? "right-0" : "left-0")}
        style={{ opacity: fromShadow, background: spineShade(leafSide) }}
      />
      <motion.div
        className={cn("absolute inset-y-0 w-1/2", landSide === "right" ? "right-0" : "left-0")}
        style={{ opacity: toShadow, background: spineShade(landSide) }}
      />
      <motion.div
        className={cn("absolute inset-y-0 w-1/2", leafSide === "right" ? "right-0" : "left-0")}
        style={{
          rotateY,
          transformStyle: "preserve-3d",
          transformOrigin: dir === 1 ? "left center" : "right center",
          willChange: "transform",
        }}
      >
        <div className="absolute inset-0" style={{ backfaceVisibility: "hidden" }}>
          <LeafFace
            page={frontPage}
            image={frontImage}
            material={material}
            side={frontSide}
            shade={frontShade}
          >
            {frontPage ? content?.[frontPage.id] : undefined}
          </LeafFace>
        </div>
        <div
          className="absolute inset-0"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          <LeafFace
            page={backPage}
            image={backImage}
            material={material}
            side={backSide}
            shade={backShade}
          >
            {backPage ? content?.[backPage.id] : undefined}
          </LeafFace>
        </div>
      </motion.div>
    </div>
  );
}

/**
 * Page-turning book (Milestones 8+).
 *
 * Double-buffered layers over a frozen base spread:
 *
 *   base  (in-flow)  — the committed spread. NEVER swapped mid-turn, so the
 *                       stationary half is geometrically locked: same element,
 *                       same key, same props → React mutates nothing there.
 *   float (overlay)  — the target spread in the same box (pixel-aligned
 *                       halves), clipped to the turning side while the leaf
 *                       travels, unclipped at commit. Only hidden after the
 *                       base layer's images report painted (paint-gated).
 *   leaf  (overlay)  — the only animated element: a half-width 3D plane
 *                       rotating around the binding edge. No layout, x, y or
 *                       scale animation anywhere; no parent transforms.
 *
 * The transform layer stays isolated here so a WebGL deformer can replace
 * the leaf later without touching spreads, pages or materials.
 */
export type BookHandle = { next: () => void; prev: () => void };

export function MagazineBook({
  spreads,
  images,
  material,
  content,
  initialIndex = 0,
  index: controlledIndex,
  onIndexChange,
  keyboard = true,
  ref,
  className,
}: {
  spreads: Spread[];
  images: Record<string, PageImage>;
  material: PublicationMaterial;
  content?: Record<string, ReactNode>;
  initialIndex?: number;
  /** Controlled mode: Reader owns the index. */
  index?: number;
  onIndexChange?: (index: number) => void;
  /** Arrow-key turning. Disable when an ancestor handles keys. */
  keyboard?: boolean;
  ref?: Ref<BookHandle>;
  className?: string;
}) {
  const [internalIndex, setInternalIndex] = useState(() =>
    Math.max(0, Math.min(initialIndex, spreads.length - 1)),
  );
  const index =
    controlledIndex == null
      ? internalIndex
      : Math.max(0, Math.min(controlledIndex, spreads.length - 1));
  const [turn, setTurn] = useState<Turn | null>(null);
  // Overlay target spread: mounted at turn start (clipped to the turning
  // side), unclipped at commit, hidden once the base reports painted.
  const [reveal, setReveal] = useState<{
    to: number;
    dir: 1 | -1;
    open: boolean;
  } | null>(null);
  // Paint gate: base swaps invisibly under the opaque overlay; the overlay
  // lifts only after every base image fires onLoad (0 when none paintable).
  const pendingPaints = useRef(0);
  const reduceMotion = useReducedMotion();
  const swipeX = useRef<number | null>(null);

  const commitIndex = useCallback(
    (to: number) => {
      setInternalIndex(to);
      onIndexChange?.(to);
    },
    [onIndexChange],
  );

  // Decode neighboring spreads' images while settled, so every image a
  // turn reveals is already in the bitmap cache — newly mounted <img>
  // elements otherwise paint white for a few frames while decoding.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const anchor = turn ? turn.to : index;
    for (const si of [anchor - 1, anchor + 1]) {
      const s = spreads[si];
      if (!s) continue;
      for (const p of [s.left, s.right]) {
        const src = p ? images[p.id]?.preview : undefined;
        if (src) {
          const warmer = new window.Image();
          warmer.src = src;
        }
      }
    }
  }, [turn, index, spreads, images]);

  const go = useCallback(
    (dir: 1 | -1) => {
      if (turn || spreads.length === 0) return;
      const to = dir === 1 ? nextSpreadIndex(index, spreads.length) : prevSpreadIndex(index);
      if (to === index) return;
      if (reduceMotion) {
        commitIndex(to);
        return;
      }
      setTurn({ dir, from: index, to });
      setReveal({ to, dir, open: false });
    },
    [turn, index, spreads.length, reduceMotion, commitIndex],
  );
  const next = useCallback(() => go(1), [go]);
  const prev = useCallback(() => go(-1), [go]);

  useImperativeHandle(ref, () => ({ next, prev }), [next, prev]);

  // Paint gate: the base swaps under the opaque overlay at commit; the
  // overlay lifts only after every base image reports painted.
  const onBasePaint = useCallback(() => {
    pendingPaints.current -= 1;
    if (pendingPaints.current <= 0) {
      pendingPaints.current = 0;
      setReveal(null);
    }
  }, []);

  // Arrow keys turn pages (ignored while typing).
  useEffect(() => {
    if (!keyboard) return;
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA")) return;
      if (e.key === "ArrowRight") {
        e.preventDefault();
        go(1);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        go(-1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, keyboard]);

  if (spreads.length === 0) {
    return (
      <div className="flex min-h-[320px] items-center justify-center rounded-xl border border-dashed border-line text-sm text-muted">
        Nothing to read yet.
      </div>
    );
  }

  // Frozen base: the committed spread. During a turn this stays on the
  // FROM spread — same element, same key, same props — so React performs
  // zero DOM mutations on it and the stationary half cannot move.
  const baseSpread = turn ? spreads[turn.from] : spreads[index];

  // Leaf faces: forward lifts the right page onto the next left;
  // backward lifts the left page onto the previous right.
  const fromSpread = turn ? spreads[turn.from] : null;
  const toSpread = turn ? spreads[turn.to] : null;
  const frontPage =
    turn?.dir === 1 ? fromSpread?.right ?? null : fromSpread?.left ?? null;
  const backPage =
    turn?.dir === 1 ? toSpread?.left ?? null : toSpread?.right ?? null;
  const frontSide = turn?.dir === 1 ? "right" : ("left" as const);
  const backSide = turn?.dir === 1 ? "left" : ("right" as const);

  const commit = () => {
    if (!turn) return;
    const target = spreads[turn.to];
    // Sides that will actually paint an <img> in the base layer.
    pendingPaints.current = [target.left, target.right].filter(
      (p) => p && images[p.id] && !content?.[p.id],
    ).length;
    commitIndex(turn.to);
    setTurn(null);
    if (pendingPaints.current === 0) {
      setReveal(null);
    } else {
      setReveal({ to: turn.to, dir: turn.dir, open: true });
    }
  };

  return (
    <div
      className={cn("relative select-none", className)}
      onPointerDown={(e) => {
        swipeX.current = e.clientX;
      }}
      onPointerUp={(e) => {
        if (swipeX.current == null) return;
        const dx = e.clientX - swipeX.current;
        swipeX.current = null;
        if (dx <= -SWIPE_PX) next();
        else if (dx >= SWIPE_PX) prev();
      }}
    >
      {/* Base spread: the committed state. Frozen for the whole turn —
          the stationary page lives here and is never touched mid-turn. */}
      <MagazineRenderer
        key={`base-${baseSpread.id}`}
        spread={baseSpread}
        images={images}
        material={material}
        content={content}
        onImageLoad={onBasePaint}
      />

      {/* Overlay target spread: same box as the base (halves stay
          pixel-aligned), clipped to the turning side until commit, then
          opened full and lifted only once the base reports painted. */}
      {reveal && (
        <div
          key={`reveal-${spreads[reveal.to].id}`}
          aria-hidden
          className="absolute inset-0 z-[5] overflow-hidden rounded-[4px]"
          style={{
            clipPath: reveal.open
              ? undefined
              : reveal.dir === 1
                ? "inset(0 0 0 50%)"
                : "inset(0 50% 0 0)",
          }}
        >
          <MagazineRenderer
            spread={spreads[reveal.to]}
            images={images}
            material={material}
            content={content}
          />
        </div>
      )}

      {/* Turning leaf: the ONLY animated element. */}
      {turn && (
        <FlatLeaf
          dir={turn.dir}
          frontPage={frontPage}
          frontImage={frontPage ? images[frontPage.id] : undefined}
          frontSide={frontSide}
          backPage={backPage}
          backImage={backPage ? images[backPage.id] : undefined}
          backSide={backSide}
          material={material}
          content={content}
          onDone={commit}
        />
      )}

      {/* Click zones. */}
      <button
        type="button"
        aria-label="Previous spread"
        onClick={prev}
        disabled={turn != null || index === 0}
        className="absolute inset-y-0 left-0 z-20 w-[18%] cursor-w-resize disabled:cursor-default"
      />
      <button
        type="button"
        aria-label="Next spread"
        onClick={next}
        disabled={turn != null || index === spreads.length - 1}
        className="absolute inset-y-0 right-0 z-20 w-[18%] cursor-e-resize disabled:cursor-default"
      />
    </div>
  );
}
