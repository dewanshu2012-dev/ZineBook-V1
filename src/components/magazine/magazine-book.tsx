"use client";

import { motion, useReducedMotion } from "framer-motion";
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
import { CurlLeaf } from "@/components/magazine/curl-leaf";
import type { PageImage } from "@/lib/page-images";
import type { Page, PublicationMaterial } from "@/lib/publication";
import type { Spread } from "@/lib/spreads";
import { nextSpreadIndex, prevSpreadIndex } from "@/lib/spreads";
import { cn } from "@/lib/utils";

type Turn = { dir: 1 | -1; from: number; to: number };

const TURN_DURATION = 0.9;
const TURN_EASE = [0.32, 0.72, 0.35, 1] as const;
const SWIPE_PX = 60;

function LeafFace({
  page,
  image,
  material,
  side,
  children,
  shadeFrom,
  shadeTo,
}: {
  page: Page | null;
  image?: PageImage;
  material: PublicationMaterial;
  side: "left" | "right";
  children?: ReactNode;
  /** Darkening travels with the flip: front 0→.45, back .45→0. */
  shadeFrom: number;
  shadeTo: number;
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
        <div className="flex h-full items-center justify-center bg-paper-deep/40">
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
            Empty
          </span>
        </div>
      )}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-ink"
        initial={{ opacity: shadeFrom }}
        animate={{ opacity: shadeTo }}
        transition={{ duration: TURN_DURATION, ease: [...TURN_EASE] }}
      />
    </div>
  );
}

/**
 * Rigid flat leaf (fallback). Used when a turning page is rotated or
 * carries custom React content, which the background-sliced curl cannot
 * reproduce without snapping at landing.
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
  return (
    <div
      aria-hidden
      className={cn(
        "absolute inset-y-0 z-10 w-1/2",
        dir === 1 ? "right-0" : "left-0",
      )}
      style={{ perspective: "2200px" }}
    >
      <motion.div
        className="relative h-full w-full"
        style={{
          transformStyle: "preserve-3d",
          transformOrigin: dir === 1 ? "left center" : "right center",
        }}
        initial={{ rotateY: 0 }}
        animate={{ rotateY: dir === 1 ? -180 : 180 }}
        transition={{ duration: TURN_DURATION, ease: [...TURN_EASE] }}
        onAnimationComplete={onDone}
      >
        <div
          className="absolute inset-0"
          style={{ backfaceVisibility: "hidden" }}
        >
          <LeafFace
            page={frontPage}
            image={frontImage}
            material={material}
            side={frontSide}
            shadeFrom={0}
            shadeTo={0.45}
          >
            {frontPage ? content?.[frontPage.id] : undefined}
          </LeafFace>
        </div>
        <div
          className="absolute inset-0"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          <LeafFace
            page={backPage}
            image={backImage}
            material={material}
            side={backSide}
            shadeFrom={0.45}
            shadeTo={0}
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

  // Curl slices reproduce page images as backgrounds, so rotated pages,
  // custom React content, and narrow solo covers fall back to the rigid
  // flat leaf (no landing snap; covers are stiff boards anyway).
  const needsFlatLeaf =
    turn != null &&
    ([frontPage, backPage].some(
      (p) => p && (p.rotation % 180 !== 0 || content?.[p.id] != null),
    ) ||
      spreads[turn.from].kind !== "interior" ||
      spreads[turn.to].kind !== "interior");

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
        key={baseSpread.id}
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
          key={spreads[reveal.to].id}
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

      {/* Turning leaf: curling chain, or the flat fallback for rotated /
          custom-content pages. The ONLY animated elements live in here. */}
      {turn &&
        (needsFlatLeaf ? (
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
        ) : (
          <CurlLeaf
            dir={turn.dir}
            front={{
              page: frontPage,
              src: frontPage ? images[frontPage.id]?.preview : undefined,
            }}
            back={{
              page: backPage,
              src: backPage ? images[backPage.id]?.preview : undefined,
            }}
            material={material}
            onDone={commit}
            className={cn(
              "absolute inset-y-0 z-10 w-1/2",
              turn.dir === 1 ? "right-0" : "left-0",
            )}
          />
        ))}

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
