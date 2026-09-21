"use client";

import { Loader2 } from "lucide-react";

export function ProcessingView({
  stage,
  done,
  total,
}: {
  stage: string;
  done: number;
  total: number;
}) {
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  return (
    <div
      className="rounded-2xl border border-line bg-paper px-8 py-10 text-center"
      role="status"
      aria-live="polite"
    >
      <Loader2 className="mx-auto h-7 w-7 animate-spin text-ink" strokeWidth={1.75} />
      <p className="mt-4 text-[15px] font-medium">{stage}</p>
      <div
        className="mx-auto mt-5 h-[6px] max-w-sm overflow-hidden rounded-full bg-ink/10"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="h-full rounded-full bg-ink transition-[width] duration-200"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="mt-3 font-mono text-xs text-muted">
        {done} / {total} · {pct}%
      </p>
    </div>
  );
}
