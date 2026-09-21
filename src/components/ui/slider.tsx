/** Labeled 0–100 slider bound to a 0–1 material value. */
export function Slider({
  label,
  minLabel,
  maxLabel,
  value,
  onChange,
}: {
  label: string;
  minLabel: string;
  maxLabel: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <label
          htmlFor={`slider-${label}`}
          className="text-[13px] font-medium text-ink"
        >
          {label}
        </label>
        <span className="font-mono text-[11px] text-muted">
          {Math.round(value * 100)}
        </span>
      </div>
      <input
        id={`slider-${label}`}
        type="range"
        min={0}
        max={100}
        value={Math.round(value * 100)}
        onChange={(e) => onChange(Number(e.target.value) / 100)}
        className="mt-1.5 w-full accent-ink"
        aria-valuetext={`${Math.round(value * 100)} percent`}
      />
      <div className="flex justify-between font-mono text-[10px] uppercase tracking-[0.12em] text-muted">
        <span>{minLabel}</span>
        <span>{maxLabel}</span>
      </div>
    </div>
  );
}
