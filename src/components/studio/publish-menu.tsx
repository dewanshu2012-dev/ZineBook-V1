"use client";

import { useEffect, useRef, useState } from "react";
import { BookOpen, Download, Upload } from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/button";
import {
  parsePublicationFile,
  serializePublication,
  slugify,
} from "@/lib/publication-io";
import { usePublication } from "@/lib/publication-store";
import { cn } from "@/lib/utils";

/**
 * Publish menu (Milestone 12). Local-first publishing: open the reader,
 * export a portable `.zinebook.json` artifact, or import one back.
 * The artifact shape doubles as the future cloud-sync payload.
 */
export function PublishMenu() {
  const { publication, images, sourceName, restoreSnapshot } = usePublication();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Close on outside click / Escape.
  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open ]);

  const exportFile = () => {
    if (!publication) return;
    const blob = new Blob(
      [serializePublication(publication, images, sourceName)],
      { type: "application/json" },
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = slugify(publication.title);
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setError(null);
    setDone(`Exported ${slugify(publication.title)}`);
  };

  const importFile = async (file: File) => {
    setError(null);
    setDone(null);
    try {
      const text = await file.text();
      const parsed = parsePublicationFile(text);
      restoreSnapshot(parsed.publication, parsed.images, parsed.sourceName);
      setDone(`Imported “${parsed.publication.title}”`);
      setOpen(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not import this file.");
    }
  };

  return (
    <div ref={rootRef} className="relative">
      <Button
        variant="primary"
        size="sm"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => {
          setOpen((o) => !o);
          setError(null);
        }}
      >
        Publish
      </Button>

      {open && (
        <div
          role="menu"
          aria-label="Publish options"
          className="absolute right-0 z-40 mt-2 w-64 rounded-xl border border-line bg-paper p-1.5 shadow-[0_24px_60px_-20px_rgba(22,19,14,0.45)]"
        >
          <ButtonLink
            href="/read"
            variant="ghost"
            size="sm"
            role="menuitem"
            className="w-full justify-start"
          >
            <BookOpen className="h-4 w-4" />
            Open reader
          </ButtonLink>
          <button
            type="button"
            role="menuitem"
            onClick={exportFile}
            disabled={!publication}
            className={cn(
              "flex h-9 w-full items-center gap-2 rounded-full px-4 text-[13px] font-medium transition-colors",
              "text-ink-soft hover:bg-ink/5 hover:text-ink disabled:pointer-events-none disabled:opacity-50",
            )}
          >
            <Download className="h-4 w-4" />
            Export .zinebook
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => fileRef.current?.click()}
            className="flex h-9 w-full items-center gap-2 rounded-full px-4 text-[13px] font-medium text-ink-soft transition-colors hover:bg-ink/5 hover:text-ink"
          >
            <Upload className="h-4 w-4" />
            Import .zinebook
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".json,application/json"
            className="hidden"
            aria-label="Import publication file"
            onChange={(e) => {
              const f = e.target.files?.[0];
              e.target.value = "";
              if (f) void importFile(f);
            }}
          />
          {error && (
            <p role="alert" className="px-4 py-2 text-xs leading-5 text-red-900">
              {error}
            </p>
          )}
          {done && (
            <p role="status" className="px-4 py-2 font-mono text-[11px] text-muted">
              {done}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
