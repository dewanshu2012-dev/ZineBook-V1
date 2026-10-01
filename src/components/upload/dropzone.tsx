"use client";

import { useRef, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { FileAddIcon } from "@hugeicons/core-free-icons";
import { ACCEPT } from "@/lib/pdf";
import { cn } from "@/lib/utils";

export function Dropzone({
  onFiles,
  disabled,
}: {
  onFiles: (files: FileList) => void;
  disabled?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  return (
    <div
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled}
      aria-label="Drop your PDF or images here, or press Enter to browse"
      onClick={() => !disabled && inputRef.current?.click()}
      onKeyDown={(e) => {
        if ((e.key === "Enter" || e.key === " ") && !disabled) {
          e.preventDefault();
          inputRef.current?.click();
        }
      }}
      onDragOver={(e) => {
        if (disabled) return;
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        if (disabled) return;
        e.preventDefault();
        setDragging(false);
        if (e.dataTransfer.files.length > 0) onFiles(e.dataTransfer.files);
      }}
      className={cn(
        "cursor-pointer rounded-2xl border border-dashed px-4 py-10 text-center transition-colors sm:px-8 sm:py-14",
        dragging
          ? "border-ink bg-ink/[0.04]"
          : "border-line bg-paper-deep/40 hover:border-ink/40",
        disabled && "pointer-events-none opacity-60",
      )}
    >
      <HugeiconsIcon icon={FileAddIcon} className="mx-auto h-8 w-8 text-muted" strokeWidth={1.5} />
      <p className="mt-4 text-[15px] font-medium">
        {dragging ? "Release to upload" : "Drop your PDF here"}
      </p>
      <p className="mt-1 text-sm text-muted">
        or{" "}
        <span className="font-medium text-ink underline underline-offset-4">
          choose a file
        </span>
      </p>
      <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
        PDF · JPG · PNG — processed locally
      </p>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        multiple
        className="hidden"
        disabled={disabled}
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            onFiles(e.target.files);
          }
          e.target.value = "";
        }}
      />
    </div>
  );
}
