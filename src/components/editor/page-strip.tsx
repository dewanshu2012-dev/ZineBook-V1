"use client";

import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useMemo } from "react";
import { SortablePageCard } from "@/components/editor/sortable-page-card";
import { usePublication } from "@/lib/publication-store";

export function PageStrip() {
  const {
    publication,
    images,
    selectedId,
    select,
    reorderPages,
    deletePage,
  } = usePublication();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const ids = useMemo(
    () => publication?.pages.map((p) => p.id) ?? [],
    [publication],
  );

  if (!publication) return null;

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (over && active.id !== over.id) {
      reorderPages(String(active.id), String(over.id));
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={ids} strategy={horizontalListSortingStrategy}>
        <ol
          className="flex gap-2 overflow-x-auto px-1 pb-2 pt-1"
          aria-label="Pages, drag to reorder"
        >
          {publication.pages.map((p) => (
            <SortablePageCard
              key={p.id}
              page={p}
              coverMode={publication.coverMode}
              totalPages={publication.pages.length}
              image={images[p.id]}
              selected={p.id === selectedId}
              onSelect={() => select(p.id)}
              onDelete={() => deletePage(p.id)}
            />
          ))}
        </ol>
      </SortableContext>
    </DndContext>
  );
}
