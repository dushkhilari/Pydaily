"use client";

interface ProgressRingProps {
  value: number; // 0..100
  size?: number;
  stroke?: number;
  showLabel?: boolean;
  className?: string;
  /** label material: "paper" (dark ink) or "cream" (on leather/brass) */
  tone?: "paper" | "cream";
}

/**
 * Brass bench gauge: brushed-metal bezel, debossed track and a
 * polished brass needle arc — like an analog dial on the study desk.
 */
export function ProgressRing({
  value,
  size = 128,
  stroke = 10,
  showLabel = true,
  className = "",
  tone = "paper",
}: ProgressRingProps) {
  const clamped = Math.max(0, Math.min(100, value));
  const r = (size - stroke - 6) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (clamped / 100) * c;
  const uid = `gauge-${size}-${stroke}`;
  const cx = size / 2;
  const cy = size / 2;

  return (
    <div
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
      role="img"
      aria-label={`Progress: ${Math.round(clamped)} percent`}
    >
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          {/* brushed metal bezel */}
          <linearGradient id={`${uid}-metal`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="oklch(0.93 0.02 84)" />
            <stop offset="50%" stopColor="oklch(0.8 0.025 80)" />
            <stop offset="100%" stopColor="oklch(0.62 0.03 74)" />
          </linearGradient>
          {/* polished brass fill */}
          <linearGradient id={`${uid}-brass`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="oklch(0.85 0.1 88)" />
            <stop offset="55%" stopColor="oklch(0.76 0.115 82)" />
            <stop offset="100%" stopColor="oklch(0.6 0.105 74)" />
          </linearGradient>
        </defs>

        {/* metal bezel */}
        <circle cx={cx} cy={cy} r={r + stroke / 2 + 3} fill="none" stroke={`url(#${uid}-metal)`} strokeWidth={4} />
        {/* debossed track */}
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="oklch(0.58 0.04 62 / 50%)" strokeWidth={stroke} />
        {/* brass needle arc */}
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={`url(#${uid}-brass)`}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          className="transition-[stroke-dashoffset] duration-700 ease-out"
          style={{ filter: "drop-shadow(0 0 3px oklch(0.74 0.115 82 / 45%))" }}
        />
      </svg>
      {showLabel && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className={
              tone === "cream"
                ? "font-display text-2xl font-bold text-engrave-cream"
                : "font-display text-2xl font-bold text-engrave"
            }
          >
            {Math.round(clamped)}%
          </span>
        </div>
      )}
    </div>
  );
}
