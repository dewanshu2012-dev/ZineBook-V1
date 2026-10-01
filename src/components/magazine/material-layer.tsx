import { materialSurface } from "@/lib/materials";
import type { PublicationMaterial } from "@/lib/publication";
import { cn } from "@/lib/utils";

const GRAIN_URL =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='120' height='120' filter='url(%23n)' opacity='0.45'/%3E%3C/svg%3E\")";

/**
 * Paper over print: grain, warmth tint and an optional gloss sheen.
 * Opacity stays low so uploaded content remains readable.
 */
export function MaterialLayer({
  material,
  className,
}: {
  material: PublicationMaterial;
  className?: string;
}) {
  const surface = materialSurface(material.type);
  return (
    <div aria-hidden className={cn("pointer-events-none absolute inset-0", className)}>
      <div
        className="absolute inset-0"
        style={{
          backgroundColor: surface.warmth,
          mixBlendMode: "multiply",
        }}
      />
      {surface.pattern && (
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: surface.pattern,
            opacity: 0.4 + material.textureIntensity,
            mixBlendMode: "multiply",
          }}
        />
      )}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: GRAIN_URL,
          opacity: Math.min(1, material.textureIntensity * surface.grain * 0.8),
          mixBlendMode: "multiply",
        }}
      />
      {surface.sheen && (
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(115deg, rgba(255,255,255,0) 42%, rgba(255,255,255,0.5) 50%, rgba(255,255,255,0) 58%)",
            opacity: 0.35 + material.textureIntensity * 0.4,
          }}
        />
      )}
    </div>
  );
}
