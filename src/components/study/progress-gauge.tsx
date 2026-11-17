"use client";

import { cn } from "@/lib/utils";

interface ProgressGaugeProps {
  value: number; // 0..100
  /** sizing classes, e.g. "h-20 w-20 sm:h-32 sm:w-32" */
  className?: string;
  showLabel?: boolean;
  /** label material: "paper" (dark ink) or "cream" (on the dark cover) */
  tone?: "paper" | "cream";
}

/**
 * Shared SVG gradient defs for all gauges. Rendered once in the app shell so
 * every gauge references stable, hydration-safe ids.
 */
export function GaugeDefs() {
  return (
    <svg
      aria-hidden
      focusable="false"
      className="absolute h-0 w-0 overflow-hidden"
    >
      <defs>
        {/* paper bezel ring */}
        <linearGradient id="pgauge-metal" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="oklch(0.995 0.003 95)" />
          <stop offset="50%" stopColor="oklch(0.9 0.008 93)" />
          <stop offset="100%" stopColor="oklch(0.76 0.012 90)" />
        </linearGradient>
        {/* ballpoint-blue ink fill */}
        <linearGradient id="pgauge-fill" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="oklch(0.6 0.15 260)" />
          <stop offset="55%" stopColor="oklch(0.5 0.14 263)" />
          <stop offset="100%" stopColor="oklch(0.4 0.13 266)" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/**
 * Rounded-square progress dial: a paper bezel, a debossed track and a
 * ballpoint-blue ink bar with rounded corners — drawn like a stamped
 * progress sticker inside the notebook.
 */
export function ProgressGauge({
  value,
  className = "h-24 w-24",
  showLabel = true,
  tone = "paper",
}: ProgressGaugeProps) {
  const clamped = Math.max(0, Math.min(100, value));

  // rounded-rect ring geometry (viewBox 120x120)
  const x = 10;
  const y = 10;
  const w = 100;
  const h = 100;
  const rx = 20;
  // perimeter of a rounded rectangle
  const perimeter = 2 * (w + h) - 8 * rx + 2 * Math.PI * rx;
  const offset = perimeter * (1 - clamped / 100);

  return (
    <div
      className={cn("relative inline-flex items-center justify-center", className)}
      role="img"
      aria-label={`Progress: ${Math.round(clamped)} percent`}
    >
      <svg viewBox="0 0 120 120" fill="none" className="h-full w-full -rotate-90">
        {/* paper bezel */}
        <rect
          x="3"
          y="3"
          width="114"
          height="114"
          rx="26"
          stroke="url(#pgauge-metal)"
          strokeWidth="5"
        />
        {/* debossed track */}
        <rect
          x={x}
          y={y}
          width={w}
          height={h}
          rx={rx}
          stroke="oklch(0.45 0.04 262 / 32%)"
          strokeWidth="9"
        />
        {/* blue ink progress bar */}
        <rect
          x={x}
          y={y}
          width={w}
          height={h}
          rx={rx}
          stroke="url(#pgauge-fill)"
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={perimeter}
          strokeDashoffset={offset}
          className="transition-[stroke-dashoffset] duration-700 ease-out"
          style={{ filter: "drop-shadow(0 0 3px oklch(0.5 0.14 262 / 35%))" }}
        />
      </svg>
      {showLabel && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className={cn(
              "font-display font-bold tabular-nums text-lg sm:text-2xl",
              tone === "cream" ? "text-[oklch(0.96_0.006_95)]" : "text-foreground"
            )}
          >
            {Math.round(clamped)}%
          </span>
        </div>
      )}
    </div>
  );
}
