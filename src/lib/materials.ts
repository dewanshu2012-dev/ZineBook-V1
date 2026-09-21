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
  /** Warm paper tint overlay (CSS color, applied at low opacity). */
  warmth: string;
};

const SURFACES: Record<MaterialType, MaterialSurface> = {
  "smooth-matte": { grain: 1.0, sheen: false, warmth: "#fffdf8" },
  glossy: { grain: 0.3, sheen: true, warmth: "#ffffff" },
  "premium-matte": { grain: 0.8, sheen: false, warmth: "#fffdf8" },
  uncoated: { grain: 1.3, sheen: false, warmth: "#faf6ec" },
  "matte-cover": { grain: 0.6, sheen: false, warmth: "#fffdf8" },
  "glossy-cover": { grain: 0.3, sheen: true, warmth: "#ffffff" },
  "soft-touch": { grain: 0.8, sheen: false, warmth: "#fbf9f5" },
  cardstock: { grain: 0.6, sheen: false, warmth: "#f8f4e9" },
  kraft: { grain: 1.3, sheen: false, warmth: "#e8d5b0" },
  linen: { grain: 1.2, sheen: false, warmth: "#faf8f2" },
  recycled: { grain: 1.4, sheen: false, warmth: "#f3eee1" },
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
