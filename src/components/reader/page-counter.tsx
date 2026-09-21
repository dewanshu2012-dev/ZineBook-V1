/** Minimal page counter: current / total with an optional kind label. */
export function PageCounter({
  current,
  total,
  label,
}: {
  /** 1-indexed. */
  current: number;
  total: number;
  label?: string;
}) {
  return (
    <p
      className="font-mono text-xs tabular-nums text-ink-soft"
      role="status"
      aria-live="polite"
      aria-label={label ? `${label}: ${current} of ${total}` : `${current} of ${total}`}
    >
      {label && <span className="mr-2 hidden uppercase tracking-[0.16em] text-muted min-[420px]:inline">{label}</span>}
      {current} / {total}
    </p>
  );
}
