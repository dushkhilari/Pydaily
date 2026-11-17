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

export function ProgressView({ manifest, quizzes }: { manifest: Manifest; quizzes: QuizModule[] }) {
  const progress = useStudyStore((s) => s.progress);
  const quizResults = useStudyStore((s) => s.quizResults);
  const openLesson = useStudyStore((s) => s.openLesson);

  const pct = overallPercent(progress, manifest.lessons);
  const done = completedCount(progress);
  const streak = streakInfo(progress);
  const completedLessons = manifest.lessons.filter((l) => progress[l.slug]?.completed);

  return (
    <div className="space-y-8 pt-2">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight">Your progress</h1>
        <p className="mt-1 text-sm font-semibold text-pencil">
          Every lesson you finish builds the streak. Keep it burning.
        </p>
      </div>

      {/* summary hero — notebook page with blue progress dial */}
      <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
        <div className="sheet relative flex items-center gap-4 overflow-hidden rounded-2xl p-4 sm:gap-5 sm:p-6">
          <span className="washi" aria-hidden />
          <ProgressGauge value={pct} tone="paper" className="h-24 w-24 shrink-0 sm:h-28 sm:w-28" />
          <div className="relative min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-pencil">
              Overall completion
            </p>
            <p className="mt-1 font-display text-2xl font-bold">
              {done}/{manifest.lessons.length} lessons
            </p>
            <p className="mt-1 flex items-center gap-1 text-sm font-semibold text-pencil">
              <Flame className="h-4 w-4 text-pen-red" aria-hidden />
              {streak.current} day streak · best {streak.best}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <div className="sheet rounded-2xl p-3.5 sm:p-5">
            <span className="chip flex h-9 w-9 items-center justify-center rounded-lg text-pen-amber">
              <Trophy className="h-4.5 w-4.5" aria-hidden />
            </span>
            <p className="mt-3 font-display text-2xl font-bold tabular-nums">{streak.best}</p>
            <p className="mt-1 text-xs font-semibold text-pencil">best streak (days)</p>
          </div>
          <div className="sheet rounded-2xl p-3.5 sm:p-5">
            <span className="chip flex h-9 w-9 items-center justify-center rounded-lg text-pen-blue">
              <Target className="h-4.5 w-4.5" aria-hidden />
            </span>
            <p className="mt-3 font-display text-2xl font-bold tabular-nums">
              {Object.keys(quizResults).length}/{quizzes.length}
            </p>
            <p className="mt-1 text-xs font-semibold text-pencil">module quizzes taken</p>
          </div>
        </div>
      </div>

      {/* per-module breakdown */}
      <section aria-label="Module progress">
        <h2 className="hand mb-3 text-2xl font-bold">By module</h2>
        <div className="space-y-3">
          {manifest.modules.map((mod) => {
            const mPct = modulePercent(progress, manifest.lessons, mod.id);
            const mDone = manifest.lessons.filter(
              (l) => l.module === mod.id && progress[l.slug]?.completed
            ).length;
            return (
              <div key={mod.id} className="sheet rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <span className="chip flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-pen-blue">
                    <ModuleIcon icon={mod.icon} className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <p className="truncate font-display text-sm font-bold">{mod.title}</p>
                      <p className="shrink-0 text-xs font-semibold tabular-nums text-pencil">
                        {mDone}/{mod.lessonCount}
                      </p>
                    </div>
                    <div className="chip mt-2 h-2.5 w-full overflow-hidden rounded-full p-[2px]">
                      <div
                        className="h-full rounded-full bg-pen-blue shadow-[0_1px_1px_oklch(0.15_0.05_265/0.5)] transition-all duration-500"
                        style={{ width: `${mPct}%` }}
                      />
                    </div>
                  </div>
                  <span className="shrink-0 font-display text-sm font-bold tabular-nums text-pen-blue">
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
        <h2 className="hand mb-3 flex items-center gap-2 text-2xl font-bold">
          <CalendarDays className="h-5 w-5 text-pen-blue" aria-hidden />
          Completed lessons
        </h2>
        {completedLessons.length === 0 ? (
          <div className="sheet rounded-2xl border-2 border-dashed border-ink/20 py-12 text-center shadow-none">
            <CheckCircle2 className="mx-auto h-8 w-8 text-pencil/50" aria-hidden />
            <p className="mt-3 text-sm font-bold">Nothing completed yet</p>
            <p className="mt-1 text-xs font-semibold text-pencil">
              Finish your first lesson to see it here.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {completedLessons.map((l) => (
              <button
                key={l.slug}
                onClick={() => openLesson(l.slug)}
                className="sheet btn3d flex min-h-[52px] w-full items-center gap-3 rounded-xl px-4 py-3 text-left"
              >
                <span className="chip flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-pen-green">
                  <CheckCircle2 className="h-4.5 w-4.5" aria-hidden />
                </span>
                <span className="min-w-0 flex-1 truncate text-sm font-bold">
                  Day {l.day} · {l.title}
                </span>
                <span className="shrink-0 text-[11px] font-semibold tabular-nums text-pencil">
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
