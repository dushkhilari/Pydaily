/**
 * Neobrutalism accent system — every module / section gets one of the
 * loud sticker colours from the design palette, cycled by index.
 */

export type Accent = "red" | "purple" | "teal" | "yellow" | "pink" | "orange" | "green";

export const ACCENT_CYCLE: Exclude<Accent, "green">[] = [
  "red",
  "purple",
  "teal",
  "yellow",
  "pink",
  "orange",
];

export function accentFor(index: number): Exclude<Accent, "green"> {
  return ACCENT_CYCLE[index % ACCENT_CYCLE.length];
}

/** Icon-tile classes: coloured background with a readable text colour. */
export const TILE_CLS: Record<Accent, string> = {
  red: "bg-nb-red text-white dark:text-[#1a1108]",
  purple: "bg-nb-purple text-[#17110a]",
  teal: "bg-nb-teal text-[#0c2725]",
  yellow: "bg-nb-yellow text-[#17110a]",
  pink: "bg-nb-pink text-[#17110a]",
  orange: "bg-nb-orange text-[#17110a]",
  green: "bg-nb-green text-[#0b2a17]",
};

/** Progress-bar fill classes. */
export const BAR_CLS: Record<Accent, string> = {
  red: "bg-nb-red",
  purple: "bg-nb-purple",
  teal: "bg-nb-teal",
  yellow: "bg-nb-yellow",
  pink: "bg-nb-pink",
  orange: "bg-nb-orange",
  green: "bg-nb-green",
};

/** Soft tinted badge classes (tinted background + matching text). */
export const SOFT_CLS: Record<Accent, string> = {
  red: "bg-nb-red/15 text-nb-red dark:text-nb-red",
  purple: "bg-nb-purple/15 text-nb-purple",
  teal: "bg-nb-teal/15 text-[#0c665f] dark:text-nb-teal",
  yellow: "bg-nb-yellow/25 text-[#7a5b00] dark:text-nb-yellow",
  pink: "bg-nb-pink/20 text-[#a33058] dark:text-nb-pink",
  orange: "bg-nb-orange/20 text-[#8a4a00] dark:text-nb-orange",
  green: "bg-nb-green/15 text-[#116a38] dark:text-nb-green",
};
