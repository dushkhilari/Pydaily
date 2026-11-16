"use client";

import { CheckCircle2, Flame, Trophy, Target, CalendarDays } from "lucide-react";
import type { Manifest, QuizModule } from "@/lib/types";
import { useStudyStore } from "@/lib/store";
import {
  completedCount,
  modulePercent,
  overallPercent,
  streakInfo,
} from "@/lib/progress-utils";
import { ProgressRing } from "./progress-ring";
import { ModuleIcon } from "./module-icon";

export function ProgressView({ manifest, quizzes }: { manifest: Manifest; quizzes: QuizModule[] }) {
  const progress = useStudyStore((s) => s.progress);
  const quizResults = useStudyStore((s) => s.quizResults);
  const openLesson = useStudyStore((s) => s.openLesson);

  const pct = overallPercent(progress, manifest.lessons);
  const done = completedCount(progress);
  const streak = streakInfo(progress);
  const completedLessons = manifest.lessons.filter((l) => progress[l.slug]?.completed);

  return (
    <div className="space-y-7 pt-2">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight">Your progress</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Every lesson you finish builds the streak. Keep it burning.
        </p>
      </div>

      {/* summary hero */}
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="relative flex items-center gap-5 overflow-hidden rounded-3xl border border-primary/25 bg-ember p-6 shadow-lg shadow-primary/15">
          <div className="absolute inset-0 bg-noise opacity-[0.08] mix-blend-overlay" aria-hidden />
          <ProgressRing
            value={pct}
            size={104}
            stroke={10}
            className="shrink-0 [&_span]:text-primary-foreground"
          />
          <div className="relative">
            <p className="text-[11px] font-bold uppercase tracking-widest text-primary-foreground/80">
              Overall completion
            </p>
            <p className="mt-1 font-display text-2xl font-bold text-primary-foreground">
              {done}/{manifest.lessons.length} lessons
            </p>
            <p className="mt-1 flex items-center gap-1 text-sm text-primary-foreground/80">
              <Flame className="h-4 w-4" aria-hidden />
              {streak.current} day streak · best {streak.best}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-3xl border border-border/60 bg-card/70 p-5">
            <Trophy className="h-5 w-5 text-primary" aria-hidden />
            <p className="mt-3 font-display text-2xl font-bold tabular-nums">{streak.best}</p>
            <p className="mt-1 text-xs text-muted-foreground">best streak (days)</p>
          </div>
          <div className="rounded-3xl border border-border/60 bg-card/70 p-5">
            <Target className="h-5 w-5 text-primary" aria-hidden />
            <p className="mt-3 font-display text-2xl font-bold tabular-nums">
              {Object.keys(quizResults).length}/{quizzes.length}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">module quizzes taken</p>
          </div>
        </div>
      </div>

      {/* per-module breakdown */}
      <section aria-label="Module progress">
        <h2 className="mb-3 font-display text-lg font-bold">By module</h2>
        <div className="space-y-3">
          {manifest.modules.map((mod) => {
            const mPct = modulePercent(progress, manifest.lessons, mod.id);
            const mDone = manifest.lessons.filter(
              (l) => l.module === mod.id && progress[l.slug]?.completed
            ).length;
            return (
              <div key={mod.id} className="rounded-2xl border border-border/60 bg-card/70 p-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
                    <ModuleIcon icon={mod.icon} className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <p className="truncate font-display text-sm font-bold">{mod.title}</p>
                      <p className="shrink-0 text-xs tabular-nums text-muted-foreground">
                        {mDone}/{mod.lessonCount}
                      </p>
                    </div>
                    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                      <div
                        className="h-full rounded-full bg-ember transition-all duration-500"
                        style={{ width: `${mPct}%` }}
                      />
                    </div>
                  </div>
                  <span className="font-display shrink-0 text-sm font-bold tabular-nums text-primary">
                    {Math.round(mPct)}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* completed timeline */}
      <section aria-label="Completed lessons">
        <h2 className="mb-3 flex items-center gap-2 font-display text-lg font-bold">
          <CalendarDays className="h-5 w-5 text-primary" aria-hidden />
          Completed lessons
        </h2>
        {completedLessons.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border/70 py-12 text-center">
            <CheckCircle2 className="mx-auto h-8 w-8 text-muted-foreground/40" aria-hidden />
            <p className="mt-3 text-sm font-medium">Nothing completed yet</p>
            <p className="mt-1 text-xs text-muted-foreground">Finish your first lesson to see it here.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {completedLessons.map((l) => (
              <button
                key={l.slug}
                onClick={() => openLesson(l.slug)}
                className="flex w-full items-center gap-3 rounded-2xl border border-border/60 bg-card/70 px-4 py-3 text-left transition-colors hover:border-primary/40"
              >
                <CheckCircle2 className="h-5 w-5 shrink-0 text-primary" aria-hidden />
                <span className="min-w-0 flex-1 truncate text-sm font-semibold">
                  Day {l.day} · {l.title}
                </span>
                <span className="shrink-0 text-[11px] tabular-nums text-muted-foreground">
                  {progress[l.slug].completedAt?.slice(0, 10)}
                </span>
              </button>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
