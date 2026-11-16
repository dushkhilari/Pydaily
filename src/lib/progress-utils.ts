import type { LessonMeta, Manifest, ProgressEntry } from "./types";

export function completedCount(progress: Record<string, ProgressEntry>): number {
  return Object.values(progress).filter((p) => p.completed).length;
}

export function overallPercent(
  progress: Record<string, ProgressEntry>,
  lessons: LessonMeta[]
): number {
  if (lessons.length === 0) return 0;
  return (completedCount(progress) / lessons.length) * 100;
}

export function modulePercent(
  progress: Record<string, ProgressEntry>,
  lessons: LessonMeta[],
  moduleId: string
): number {
  const list = lessons.filter((l) => l.module === moduleId);
  if (list.length === 0) return 0;
  const done = list.filter((l) => progress[l.slug]?.completed).length;
  return (done / list.length) * 100;
}

export type LessonStatus = "done" | "in-progress" | "todo";

export function lessonStatus(
  meta: LessonMeta,
  progress: Record<string, ProgressEntry>
): LessonStatus {
  const p = progress[meta.slug];
  if (p?.completed) return "done";
  if (p && p.visits > 0) return "in-progress";
  return "todo";
}

/** First uncompleted lesson (falls back to the last lesson). */
export function nextLesson(manifest: Manifest, progress: Record<string, ProgressEntry>): LessonMeta {
  return manifest.lessons.find((l) => !progress[l.slug]?.completed) ?? manifest.lessons[manifest.lessons.length - 1];
}

/** Most recently visited, non-completed lessons. */
export function recentLessons(
  manifest: Manifest,
  progress: Record<string, ProgressEntry>,
  limit = 3
): LessonMeta[] {
  return manifest.lessons
    .filter((l) => progress[l.slug] && !progress[l.slug].completed)
    .sort(
      (a, b) =>
        new Date(progress[b.slug].lastVisitedAt).getTime() -
        new Date(progress[a.slug].lastVisitedAt).getTime()
    )
    .slice(0, limit);
}

/** Consecutive-day streak from lesson completion timestamps. */
export function streakInfo(progress: Record<string, ProgressEntry>): {
  current: number;
  best: number;
} {
  const days = new Set<string>();
  for (const p of Object.values(progress)) {
    if (p.completedAt) days.add(p.completedAt.slice(0, 10));
  }
  if (days.size === 0) return { current: 0, best: 0 };

  const sorted = Array.from(days).sort();
  // best streak
  let best = 1;
  let run = 1;
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1]);
    const curr = new Date(sorted[i]);
    const diff = (curr.getTime() - prev.getTime()) / 86400000;
    run = Math.round(diff) === 1 ? run + 1 : 1;
    best = Math.max(best, run);
  }

  // current streak: count backwards from today (or yesterday)
  const today = new Date();
  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  let current = 0;
  const cursor = new Date(today);
  if (!days.has(fmt(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
  }
  while (days.has(fmt(cursor))) {
    current++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return { current, best: Math.max(best, current) };
}

const TIPS = [
  "Strings are immutable in Python — every \"modification\" creates a new object.",
  "Use f-strings for readable formatting: f\"{name} scored {points:.1f}\".",
  "enumerate() gives you index and value together — no more manual counters.",
  "List comprehensions are faster and clearer than loops that build lists.",
  "try/except beats if-checks when you expect failure: EAFP — easier to ask forgiveness than permission.",
  "dict.get(key, default) avoids KeyError without a guard clause.",
  "Sets give you O(1) membership checks — great for deduplication.",
  "**kwargs lets functions accept any named arguments — flexible APIs for free.",
];

export function dailyTip(): string {
  const day = Math.floor(Date.now() / 86400000);
  return TIPS[day % TIPS.length];
}
