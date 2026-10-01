"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { PaletteIcon } from "@hugeicons/core-free-icons";
import { Slider } from "@/components/ui/slider";
import { MATERIAL_GROUPS, materialSurface } from "@/lib/materials";
import { usePublication } from "@/lib/publication-store";
import type { MaterialType } from "@/lib/publication";
import { cn } from "@/lib/utils";

function Swatch({ type }: { type: MaterialType }) {
  const surface = materialSurface(type);
  if (type === "original") {
    return (
      <span
        aria-hidden
        className="h-6 w-6 shrink-0 rounded-md border border-ink/15 bg-white"
      />
    );
  }
  return (
    <span
      aria-hidden
      className="relative h-6 w-6 shrink-0 overflow-hidden rounded-md border border-ink/15"
      style={{ backgroundColor: surface.warmth }}
    >
      {surface.pattern && (
        <span className="absolute inset-0" style={{ backgroundImage: surface.pattern }} />
      )}
      <span
        className="absolute inset-0"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='24' height='24' filter='url(%23n)' opacity='0.35'/%3E%3C/svg%3E\")",
          opacity: 0.25 + surface.grain * 0.35,
        }}
      />
      {surface.sheen && (
        <span
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(115deg, rgba(255,255,255,0) 40%, rgba(255,255,255,0.9) 50%, rgba(255,255,255,0) 60%)",
          }}
        />
      )}
    </span>
  );
}

/**
 * Material studio (Milestone 9): stock picker + depth/shadow/texture.
 * Every control writes publication.material, which the renderer, book
 * and persistence layer already honour — changes appear instantly.
 */
export function MaterialSettings() {
  const { publication, setMaterialType, setMaterialValue } = usePublication();
  if (!publication) return null;
  const material = publication.material;

  return (
    <section className="border-b border-line p-4 last:border-b-0">
      <h3 className="flex items-center gap-2 text-sm font-semibold text-ink">
        <HugeiconsIcon icon={PaletteIcon} className="h-3.5 w-3.5" />
        Material
      </h3>

      <div className="mt-2 space-y-3" role="radiogroup" aria-label="Paper stock">
        {MATERIAL_GROUPS.map((group) => (
          <div key={group.name}>
            <p className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
              {group.name}
            </p>
            <div className="space-y-1">
              {group.materials.map((m) => {
                const active = material.type === m.type;
                return (
                  <button
                    key={m.type}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    title={m.hint}
                    onClick={() => setMaterialType(m.type)}
                    className={cn(
                      "flex w-full items-center gap-2.5 rounded-lg border px-2 py-1.5 text-left transition-colors",
                      active
                        ? "border-ink bg-ink text-paper"
                        : "border-line bg-white hover:border-ink/40",
                    )}
                  >
                    <Swatch type={m.type} />
                    <span>
                      <span className="block text-xs font-medium leading-4">
                        {m.label}
                      </span>
                      <span
                        className={cn(
                          "mt-0.5 block text-[11px] leading-4",
                          active ? "text-paper/70" : "text-muted",
                        )}
                      >
                        {m.hint}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 space-y-3 border-t border-line pt-3">
        <Slider
          label="Page depth"
          minLabel="Thin"
          maxLabel="Thick"
          value={material.pageDepth}
          onChange={(v) => setMaterialValue("pageDepth", v)}
        />
        <Slider
          label="Page shadow"
          minLabel="None"
          maxLabel="Strong"
          value={material.shadowIntensity}
          onChange={(v) => setMaterialValue("shadowIntensity", v)}
        />
        <Slider
          label="Texture"
          minLabel="Subtle"
          maxLabel="Strong"
          value={material.textureIntensity}
          onChange={(v) => setMaterialValue("textureIntensity", v)}
        />
      </div>
    </section>
  );
}
