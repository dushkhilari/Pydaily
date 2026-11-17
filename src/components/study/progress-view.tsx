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
import { ProgressGauge } from "./progress-gauge";
import { ModuleIcon } from "./module-icon";
import { accentFor, TILE_CLS, BAR_CLS } from "@/lib/accents";
import { cn } from "@/lib/utils";

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
      <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">Progress</h1>

      {/* ---------- summary ---------- */}
      <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
        <div className="neo-card flex items-center gap-4 p-4 sm:gap-5 sm:p-6">
          <ProgressGauge value={pct} className="h-24 w-24 shrink-0 sm:h-28 sm:w-28" />
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-nb-muted">
              Overall completion
            </p>
            <p className="mt-1 font-display text-2xl font-bold">
              {done}/{manifest.lessons.length} lessons
            </p>
            <p className="mt-1.5 flex items-center gap-1.5 text-sm font-bold text-nb-muted">
              <Flame className="h-4 w-4 text-nb-red" aria-hidden />
              {streak.current} day streak · best {streak.best}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <div className="neo-card-sm flex flex-col justify-center p-3.5 sm:p-5">
            <span className="neo-tile h-10 w-10 bg-nb-yellow">
              <Trophy className="h-5 w-5 text-[#17110a]" aria-hidden />
            </span>
            <p className="mt-3 font-display text-2xl font-bold tabular-nums">{streak.best}</p>
            <p className="mt-1 text-[11px] font-bold text-nb-muted">Best streak</p>
          </div>
          <div className="neo-card-sm flex flex-col justify-center p-3.5 sm:p-5">
            <span className="neo-tile h-10 w-10 bg-nb-teal">
              <Target className="h-5 w-5 text-[#0c2725]" aria-hidden />
            </span>
            <p className="mt-3 font-display text-2xl font-bold tabular-nums">
              {Object.keys(quizResults).length}/{quizzes.length}
            </p>
            <p className="mt-1 text-[11px] font-bold text-nb-muted">Quizzes taken</p>
          </div>
        </div>
      </div>

      {/* ---------- per-module ---------- */}
      <section aria-label="Module progress">
        <h2 className="mb-3 font-display text-xl font-bold sm:text-2xl">By chapter</h2>
        <div className="space-y-3">
          {manifest.modules.map((mod, idx) => {
            const mPct = modulePercent(progress, manifest.lessons, mod.id);
            const mDone = manifest.lessons.filter(
              (l) => l.module === mod.id && progress[l.slug]?.completed
            ).length;
            const accent = accentFor(idx);
            return (
              <div key={mod.id} className="neo-card-sm flex items-center gap-3 p-3.5 sm:p-4">
                <span className={cn("neo-tile h-10 w-10 shrink-0", TILE_CLS[accent])}>
                  <ModuleIcon icon={mod.icon} className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <p className="truncate font-display text-sm font-bold">{mod.title}</p>
                    <p className="shrink-0 text-[11px] font-bold tabular-nums text-nb-muted">
                      {mDone}/{mod.lessonCount}
                    </p>
                  </div>
                  <div className="neo-bar mt-2 !h-3.5">
                    <div className={cn("neo-bar-fill", BAR_CLS[accent])} style={{ width: `${mPct}%` }} />
                  </div>
                </div>
                <span className="neo-chip shrink-0 px-2.5 py-1 text-xs tabular-nums">
                  {Math.round(mPct)}%
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* ---------- completed timeline ---------- */}
      <section aria-label="Completed lessons">
        <h2 className="mb-3 flex items-center gap-2 font-display text-xl font-bold sm:text-2xl">
          <CalendarDays className="h-5 w-5 text-nb-teal" aria-hidden />
          Completed lessons
        </h2>
        {completedLessons.length === 0 ? (
          <div className="neo-card border-dashed py-12 text-center shadow-none">
            <CheckCircle2 className="mx-auto h-8 w-8 text-nb-muted/50" aria-hidden />
            <p className="mt-3 text-sm font-bold text-nb-muted">Nothing completed yet</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {completedLessons.map((l) => (
              <button
                key={l.slug}
                onClick={() => openLesson(l.slug)}
                className="neo-card-sm flex min-h-[52px] w-full items-center gap-3 px-3.5 py-2.5 text-left transition-transform hover:scale-[1.01]"
              >
                <span className="neo-tile h-8 w-8 shrink-0 border-2 bg-nb-green">
                  <CheckCircle2 className="h-4.5 w-4.5 text-[#0b2a17]" aria-hidden />
                </span>
                <span className="min-w-0 flex-1 truncate text-sm font-bold">
                  Day {l.day} · {l.title}
                </span>
                <span className="shrink-0 text-[11px] font-bold tabular-nums text-nb-muted">
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
