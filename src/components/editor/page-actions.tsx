"use client";

import {
  Copy,
  FilePlus2,
  PanelBottom,
  PanelTop,
  RotateCw,
  Square,
  Trash2,
} from "lucide-react";
import { usePublication } from "@/lib/publication-store";
import type { PageType } from "@/lib/publication";
import { cn } from "@/lib/utils";

function ActionButton({
  label,
  title,
  onClick,
  active,
  danger,
}: {
  label: string;
  title: string;
  onClick: () => void;
  active?: boolean;
  danger?: boolean;
  icon: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors",
        active
          ? "border-ink bg-ink text-paper"
          : "border-line bg-paper text-ink-soft hover:border-ink/40 hover:text-ink",
        danger && !active && "hover:border-red-900/30 hover:text-red-900",
      )}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

const icon = "h-3.5 w-3.5";

/** Actions for the currently selected page (Milestone 4). */
export function PageActions() {
  const {
    publication,
    selectedId,
    duplicatePage,
    rotatePage,
    deletePage,
    insertBlank,
    setPageType,
  } = usePublication();

  const page = publication?.pages.find((p) => p.id === selectedId);

  const setType = (type: PageType) => {
    if (page) setPageType(page.id, type);
  };

  return (
    <div className="rounded-xl border border-line bg-paper p-2.5">
      <p className="px-1 pb-2 font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
        {page ? `Page ${page.position + 1} — ${page.type}` : "No page selected"}
      </p>
      <div className="flex flex-wrap gap-1.5">
        <ActionButton
          label="Duplicate"
          title="Duplicate selected page"
          icon={<Copy className={icon} />}
          onClick={() => page && duplicatePage(page.id)}
        />
        <ActionButton
          label="Rotate"
          title="Rotate 90° clockwise"
          icon={<RotateCw className={icon} />}
          onClick={() => page && rotatePage(page.id)}
        />
        <ActionButton
          label="Delete"
          title="Delete selected page"
          danger
          icon={<Trash2 className={icon} />}
          onClick={() => page && deletePage(page.id)}
        />
        <span className="mx-0.5 w-px self-stretch bg-line" aria-hidden />
        <ActionButton
          label="Cover"
          title="Set as front cover"
          active={page?.type === "cover"}
          icon={<PanelTop className={icon} />}
          onClick={() => setType("cover")}
        />
        <ActionButton
          label="Back"
          title="Set as back cover"
          active={page?.type === "back-cover"}
          icon={<PanelBottom className={icon} />}
          onClick={() => setType("back-cover")}
        />
        <ActionButton
          label="Page"
          title="Mark as interior page"
          active={page?.type === "page"}
          icon={<Square className={icon} />}
          onClick={() => setType("page")}
        />
        <span className="mx-0.5 w-px self-stretch bg-line" aria-hidden />
        <ActionButton
          label="Blank"
          title="Insert blank page after selection"
          icon={<FilePlus2 className={icon} />}
          onClick={() => insertBlank()}
        />
      </div>
      {!page && (
        <p className="px-1 pt-2 text-xs text-muted">
          Select a page in the strip to edit it.
        </p>
      )}
    </div>
  );
}
