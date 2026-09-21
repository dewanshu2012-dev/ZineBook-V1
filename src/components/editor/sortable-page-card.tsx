"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, X } from "lucide-react";
import { PageThumbnail } from "@/components/editor/page-thumbnail";
import type { PageImage } from "@/lib/page-images";
import type { Page } from "@/lib/publication";
import { cn } from "@/lib/utils";

const TYPE_BADGE: Partial<Record<Page["type"], string>> = {
  cover: "Cover",
  "back-cover": "Back",
  blank: "Blank",
};

export function SortablePageCard({
  page,
  image,
  selected,
  onSelect,
  onDelete,
}: {
  page: Page;
  image?: PageImage;
  selected: boolean;
  onSelect: () => void;
  onDelete: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: page.id });

  const sideways = page.rotation % 180 !== 0;
  const badge = TYPE_BADGE[page.type];

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "w-32 shrink-0 sm:w-36 md:w-auto",
        isDragging && "z-10 opacity-80",
      )}
    >
      <div
        role="button"
        tabIndex={0}
        aria-pressed={selected}
        aria-label={`Select page ${page.position + 1}`}
        onClick={onSelect}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onSelect();
          }
        }}
        className={cn(
          "group relative cursor-pointer overflow-hidden rounded-lg border bg-white text-left transition-colors",
          selected
            ? "border-ink ring-2 ring-ink ring-offset-2 ring-offset-paper"
            : "border-line hover:border-ink/40",
        )}
      >
        <div className="flex items-center gap-1 border-b border-line bg-paper px-1.5 py-1">
          <span
            {...attributes}
            {...listeners}
            role="button"
            tabIndex={0}
            aria-label={`Drag page ${page.position + 1} to reorder`}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
            className="cursor-grab touch-none rounded p-1 text-muted hover:bg-ink/5 hover:text-ink active:cursor-grabbing"
          >
            <GripVertical className="h-3.5 w-3.5" />
          </span>
          <span className="font-mono text-[11px] font-semibold">
            {String(page.position + 1).padStart(2, "0")}
          </span>
          {badge && (
            <span className="ml-auto rounded-full bg-ink px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.12em] text-paper">
              {badge}
            </span>
          )}
          {page.rotation !== 0 && (
            <span
              className={cn(
                "font-mono text-[9px] text-muted",
                badge && "ml-1",
                !badge && "ml-auto",
              )}
            >
              {page.rotation}°
            </span>
          )}
          <button
            type="button"
            aria-label={`Delete page ${page.position + 1}`}
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className={cn(
              "ml-auto rounded p-1 text-muted opacity-0 hover:bg-red-50 hover:text-red-900 focus-visible:opacity-100 group-hover:opacity-100",
              badge && "ml-1",
            )}
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
        <PageThumbnail
          image={image}
          pageNumber={page.position + 1}
          sourcePageNumber={page.sourcePageNumber}
          rotation={page.rotation}
          className={sideways ? "aspect-[4/3]" : "aspect-[3/4]"}
        />
      </div>
    </li>
  );
}
