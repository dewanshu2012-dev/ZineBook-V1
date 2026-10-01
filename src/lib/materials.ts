/**
 * Material surfaces (Milestone 7 foundation).
 *
 * Maps each material to how it modulates the render layers:
 * grain visibility, gloss sheen and paper warmth. Full user-facing
 * material selection lands in Milestone 9 — the renderer already
 * honours whatever material it is given.
 */

import type { MaterialType } from "@/lib/publication";

export type MaterialSurface = {
  /** Grain multiplier applied on top of textureIntensity. */
  grain: number;
  /** Whether a diagonal gloss highlight is rendered. */
  sheen: boolean;
  /** Paper colour, multiplied over the print (white areas take it on). */
  warmth: string;
  /** How ink sits on the stock (CSS filter on the printed image). */
  ink: string;
  /** Optional surface weave (CSS background). */
  pattern?: string;
};

const WEAVE =
  "repeating-linear-gradient(0deg, rgba(60,50,30,.07) 0 1px, transparent 1px 3px), repeating-linear-gradient(90deg, rgba(60,50,30,.06) 0 1px, transparent 1px 3px)";

const SURFACES: Record<MaterialType, MaterialSurface> = {
  original: { grain: 0, sheen: false, warmth: "#ffffff", ink: "none" },
  "smooth-matte": { grain: 0.6, sheen: false, warmth: "#fbf8f1", ink: "none" },
  glossy: { grain: 0.15, sheen: true, warmth: "#ffffff", ink: "contrast(1.06) saturate(1.15)" },
  "premium-matte": { grain: 0.5, sheen: false, warmth: "#fcfaf4", ink: "contrast(1.12)" },
  uncoated: { grain: 1.1, sheen: false, warmth: "#f6f0e2", ink: "contrast(0.9) saturate(0.85)" },
  "matte-cover": { grain: 0.4, sheen: false, warmth: "#faf8f2", ink: "contrast(1.04)" },
  "glossy-cover": { grain: 0.1, sheen: true, warmth: "#ffffff", ink: "contrast(1.1) saturate(1.2)" },
  "soft-touch": { grain: 0.5, sheen: false, warmth: "#f5f3ee", ink: "contrast(0.95) saturate(0.9) brightness(0.98)" },
  cardstock: { grain: 0.8, sheen: false, warmth: "#f2ead8", ink: "contrast(0.96)" },
  kraft: { grain: 1.4, sheen: false, warmth: "#d9bf91", ink: "contrast(0.9) saturate(0.7)" },
  linen: { grain: 0.6, sheen: false, warmth: "#f7f3ea", ink: "contrast(0.95)", pattern: WEAVE },
  recycled: { grain: 1.8, sheen: false, warmth: "#ebe4d3", ink: "contrast(0.9) saturate(0.75)" },
};

export function materialSurface(type: MaterialType): MaterialSurface {
  return SURFACES[type] ?? SURFACES["smooth-matte"];
}

export type MaterialGroup = {
  name: string;
  materials: { type: MaterialType; label: string; hint: string }[];
};

/**
 * Picker catalog. Adding a stock later = one entry here + one SURFACES row.
 * Matches the spec: magazine paper / cover stock / experimental.
 */
export const MATERIAL_GROUPS: MaterialGroup[] = [
  {
    name: "Original",
    materials: [
      { type: "original", label: "Original", hint: "Untouched document look" },
    ],
  },
  {
    name: "Magazine paper",
    materials: [
      { type: "smooth-matte", label: "Smooth Matte", hint: "Neutral everyday stock" },
      { type: "glossy", label: "Glossy", hint: "High-sheen photo finish" },
      { type: "premium-matte", label: "Premium Matte", hint: "Soft, deep blacks" },
      { type: "uncoated", label: "Uncoated", hint: "Fibrous editorial feel" },
    ],
  },
  {
    name: "Cover stock",
    materials: [
      { type: "matte-cover", label: "Matte Cover", hint: "Flat, fingerprint-proof" },
      { type: "glossy-cover", label: "Glossy Cover", hint: "Wet-look shine" },
      { type: "soft-touch", label: "Soft Touch", hint: "Velvety laminate" },
      { type: "cardstock", label: "Cardstock", hint: "Stiff and warm" },
    ],
  },
  {
    name: "Experimental",
    materials: [
      { type: "kraft", label: "Kraft", hint: "Brown fibrous board" },
      { type: "linen", label: "Linen", hint: "Woven texture" },
      { type: "recycled", label: "Recycled", hint: "Speckled natural fibre" },
    ],
  },
];
