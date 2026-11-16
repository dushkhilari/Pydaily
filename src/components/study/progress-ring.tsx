"use client";

interface ProgressRingProps {
  value: number; // 0..100
  size?: number;
  stroke?: number;
  showLabel?: boolean;
  className?: string;
}

/** Gradient progress ring used on hero cards and stats. */
export function ProgressRing({
  value,
  size = 128,
  stroke = 10,
  showLabel = true,
  className = "",
}: ProgressRingProps) {
  const clamped = Math.max(0, Math.min(100, value));
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (clamped / 100) * c;
  const gid = `ring-grad-${size}-${stroke}`;

  return (
    <div
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id={gid} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="oklch(0.88 0.13 95)" />
            <stop offset="60%" stopColor="oklch(0.82 0.16 78)" />
            <stop offset="100%" stopColor="oklch(0.72 0.18 55)" />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="oklch(0.985 0 0 / 10%)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={`url(#${gid})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          className="transition-[stroke-dashoffset] duration-700 ease-out"
        />
      </svg>
      {showLabel && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-2xl font-bold text-foreground">{Math.round(clamped)}%</span>
        </div>
      )}
    </div>
  );
}
