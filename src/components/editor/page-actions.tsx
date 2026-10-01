"use client";

import { useEffect } from "react";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import {
  Copy01Icon,
  Delete02Icon,
  FileAddIcon,
  Rotate01Icon,
  UndoIcon,
} from "@hugeicons/core-free-icons";
import { usePublication } from "@/lib/publication-store";
import { cn } from "@/lib/utils";

function ActionButton({
  label,
  title,
  icon,
  onClick,
  danger,
  disabled,
}: {
  label: string;
  title: string;
  icon: IconSvgElement;
  onClick: () => void;
  danger?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={title}
      title={title}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex h-7 items-center gap-1 rounded-md border border-line bg-paper px-1.5 text-[10px] font-medium text-ink-soft transition-colors hover:border-ink/40 hover:text-ink disabled:pointer-events-none disabled:opacity-40",
        danger && "hover:border-red-900/30 hover:text-red-900",
      )}
    >
      <HugeiconsIcon icon={icon} className="h-3 w-3" />
      <span>{label}</span>
    </button>
  );
}

/** Actions for the currently selected page. */
export function PageActions() {
  const {
    publication,
    selectedId,
    duplicatePage,
    rotatePage,
    deletePage,
    insertBlank,
    undo,
    canUndo,
  } = usePublication();

  const page = publication?.pages.find((p) => p.id === selectedId);

  // ⌘Z / Ctrl+Z (ignored while typing).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA")) return;
      if ((e.metaKey || e.ctrlKey) && !e.shiftKey && e.key.toLowerCase() === "z") {
        e.preventDefault();
        undo();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [undo]);

  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <div className="min-w-0">
        <p className="text-xs font-semibold text-ink-soft">
          {page ? `Editing page ${page.position + 1}` : "Select a page"}
        </p>
        <p className="mt-0.5 text-[11px] text-muted">
          {page
            ? "These tools apply to the selected thumbnail."
            : "Choose a thumbnail below to edit it."}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-1.5">
        <ActionButton
          label="Undo"
          title="Undo last change"
          icon={UndoIcon}
          disabled={!canUndo}
          onClick={undo}
        />
        <ActionButton
          label="Duplicate"
          title="Duplicate selected page"
          icon={Copy01Icon}
          disabled={!page}
          onClick={() => page && duplicatePage(page.id)}
        />
        <ActionButton
          label="Rotate"
          title="Rotate selected page 90° clockwise"
          icon={Rotate01Icon}
          disabled={!page}
          onClick={() => page && rotatePage(page.id)}
        />
        <ActionButton
          label="Add page"
          title="Insert a blank page after the selected page"
          icon={FileAddIcon}
          onClick={() => insertBlank()}
        />
        <ActionButton
          label="Delete"
          title="Delete selected page"
          danger
          icon={Delete02Icon}
          disabled={!page}
          onClick={() => page && deletePage(page.id)}
        />
      </div>
    </div>
  );
}
