"use client";

import { cn } from "@/lib/utils";

interface ProgressGaugeProps {
  value: number; // 0..100
  /** sizing classes, e.g. "h-24 w-24 sm:h-32 sm:w-32" */
  className?: string;
  showLabel?: boolean;
}

/**
 * Neobrutalism progress dial: a white disc with a thick ink border and a
 * hard shadow, wrapped around a flat teal progress ring with a bold
 * percentage stamped in the middle.
 */
export function ProgressGauge({
  value,
  className = "h-24 w-24",
  showLabel = true,
}: ProgressGaugeProps) {
  const clamped = Math.max(0, Math.min(100, value));

  const R = 46;
  const C = 2 * Math.PI * R;
  const offset = C * (1 - clamped / 100);

  return (
    <div
      className={cn(
        "relative inline-flex items-center justify-center rounded-full border-[3px] border-nb-border bg-nb-card shadow-hard-sm",
        className
      )}
      role="img"
      aria-label={`Progress: ${Math.round(clamped)} percent`}
    >
      <svg viewBox="0 0 110 110" fill="none" className="h-[78%] w-[78%] -rotate-90">
        {/* track */}
        <circle cx="55" cy="55" r={R} stroke="var(--nb-track)" strokeWidth="11" />
        {/* progress */}
        <circle
          cx="55"
          cy="55"
          r={R}
          stroke="var(--nb-teal)"
          strokeWidth="11"
          strokeLinecap="round"
          strokeDasharray={C}
          strokeDashoffset={offset}
          className="transition-[stroke-dashoffset] duration-700 ease-out"
        />
      </svg>
      {showLabel && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-display text-lg font-bold tabular-nums text-foreground sm:text-2xl">
            {Math.round(clamped)}%
          </span>
        </div>
      )}
    </div>
  );
}
