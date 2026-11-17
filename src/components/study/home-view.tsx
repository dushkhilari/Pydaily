"use client";

import { motion } from "framer-motion";
import {
  Flame,
  Play,
  Bookmark,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  Clock3,
  Lightbulb,
} from "lucide-react";
import type { Manifest } from "@/lib/types";
import { useStudyStore } from "@/lib/store";
import {
  completedCount,
  dailyTip,
  modulePercent,
  nextLesson,
  overallPercent,
  recentLessons,
  streakInfo,
} from "@/lib/progress-utils";
import { ProgressGauge } from "./progress-gauge";
import { ModuleIcon } from "./module-icon";

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: typeof Flame;
  label: string;
  value: string | number;
  sub?: string;
}) {
  return (
    <div className="sheet relative rounded-xl p-3 sm:rounded-2xl sm:p-5">
      <div className="chip flex h-8 w-8 items-center justify-center rounded-lg sm:h-9 sm:w-9">
        <Icon className="h-4 w-4 sm:h-[18px] sm:w-[18px] text-pen-blue" aria-hidden />
      </div>
      <p className="mt-1.5 font-display text-base font-bold tabular-nums leading-none sm:mt-3 sm:text-2xl">
        {value}
      </p>
      <p className="mt-0.5 text-[10px] font-semibold text-pencil sm:mt-1.5 sm:text-xs">
        {sub ?? label}
      </p>
    </div>
  );
}

export function HomeView({ manifest }: { manifest: Manifest }) {
  const progress = useStudyStore((s) => s.progress);
  const bookmarks = useStudyStore((s) => s.bookmarks);
  const openLesson = useStudyStore((s) => s.openLesson);
  const setView = useStudyStore((s) => s.setView);
  const setModuleFilter = useStudyStore((s) => s.setModuleFilter);

  const pct = overallPercent(progress, manifest.lessons);
  const done = completedCount(progress);
  const streak = streakInfo(progress);
  const next = nextLesson(manifest, progress);
  const recent = recentLessons(manifest, progress, 3);

  const openLessons = () => {
    setModuleFilter(null);
    setView("lessons");
  };

  return (
    <div className="space-y-5 pt-2 sm:space-y-8">
      {/* greeting */}
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-pencil">
            <Sparkles className="h-3.5 w-3.5 text-pen-blue" aria-hidden />
            {manifest.course.title}
          </p>
          <h1 className="mt-2 font-display text-2xl font-bold tracking-tight sm:text-4xl">
            Keep the <span className="marker-hl">streak</span> alive.
          </h1>
        </div>
        <div className="chip hidden whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-bold text-pencil sm:block">
          Day {next.day} of {manifest.course.totalDays}
        </div>
      </div>

      {/* continue hero — a page from the notebook */}
      <motion.section
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35 }}
        className="sheet relative overflow-hidden rounded-[20px] p-4 sm:rounded-[26px] sm:p-8"
      >
        <span className="washi" aria-hidden />
        <p
          className="hand absolute right-5 top-4 hidden rotate-2 text-xl text-pen-blue/70 sm:block"
          aria-hidden
        >
          keep going!
        </p>

        {/* symmetric composition: gauge on top, resume button directly below,
            lesson text vertically centred beside it */}
        <div className="relative flex flex-col items-center gap-4 sm:flex-row sm:gap-8">
          <div className="flex shrink-0 flex-col items-center gap-3 sm:gap-4">
            <ProgressGauge
              value={pct}
              tone="paper"
              className="h-20 w-20 sm:h-32 sm:w-32"
            />
            <button
              onClick={() => openLesson(next.slug)}
              className="btn3d btn-ink inline-flex min-h-[40px] items-center gap-2 rounded-full px-5 py-2 text-xs font-bold sm:min-h-[44px] sm:px-6 sm:py-2.5 sm:text-sm"
            >
              <Play className="h-3.5 w-3.5 fill-current sm:h-4 sm:w-4" aria-hidden />
              Resume lesson
            </button>
          </div>

          <div className="min-w-0 flex-1 text-center sm:text-left">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-pencil sm:text-[11px]">
              Continue learning
            </p>
            <h2 className="mt-1 line-clamp-2 font-display text-[15px] font-bold leading-snug sm:mt-1.5 sm:text-2xl">
              Day {next.day} · {next.title}
            </h2>
            <p className="mt-1.5 text-xs font-semibold text-pencil sm:text-sm">
              {done} of {manifest.lessons.length} lessons complete · {next.minutes} min estimated
            </p>
          </div>
        </div>
      </motion.section>

      {/* stats — small paper scraps */}
      <section aria-label="Your stats" className="grid grid-cols-3 gap-2.5 sm:gap-4">
        <StatCard icon={CheckCircle2} label="Lessons" value={done} sub="lessons done" />
        <StatCard icon={Flame} label="Streak" value={streak.current} sub="day streak" />
        <StatCard icon={Bookmark} label="Saved" value={Object.keys(bookmarks).length} sub="bookmarks" />
      </section>

      {/* learning path */}
      <section aria-label="Learning path">
        <div className="mb-3 flex items-center justify-between sm:mb-4">
          <h2 className="hand text-2xl font-bold tracking-tight sm:text-3xl">Your path</h2>
          <button
            onClick={openLessons}
            className="inline-flex min-h-[36px] items-center gap-1 text-sm font-bold text-pen-blue hover:underline"
          >
            All lessons
            <ChevronRight className="h-4 w-4" aria-hidden />
          </button>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
          {manifest.modules.map((mod) => {
            const mPct = modulePercent(progress, manifest.lessons, mod.id);
            return (
              <button
                key={mod.id}
                onClick={() => {
                  setModuleFilter(mod.id);
                  setView("lessons");
                }}
                className="sheet btn3d rounded-2xl p-4 text-left sm:p-5"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="chip flex h-9 w-9 items-center justify-center rounded-xl sm:h-11 sm:w-11">
                    <ModuleIcon icon={mod.icon} className="h-4 w-4 sm:h-5 sm:w-5 text-pen-blue" />
                  </span>
                  <span className="chip rounded-full px-2 py-1 text-[10px] font-bold text-pencil sm:px-2.5 sm:text-[11px]">
                    Days {mod.days[0]}–{mod.days[1]}
                  </span>
                </div>
                <h3 className="mt-2.5 font-display text-sm font-bold leading-snug sm:mt-3.5 sm:text-[15px]">
                  {mod.title}
                </h3>
                <p className="mt-1 line-clamp-2 text-[11px] font-semibold text-pencil sm:text-xs">
                  {mod.subtitle}
                </p>
                <div className="mt-2.5 flex items-center gap-2.5 sm:mt-4 sm:gap-3">
                  <div className="chip h-2.5 flex-1 overflow-hidden rounded-full p-[2px]">
                    <div
                      className="h-full rounded-full bg-pen-blue shadow-[0_1px_1px_oklch(0.15_0.05_265/0.5)] transition-all duration-500"
                      style={{ width: `${mPct}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-bold tabular-nums text-pencil sm:text-[11px]">
                    {mod.lessonCount} lessons
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* jump back in */}
      {recent.length > 0 && (
        <section aria-label="Jump back in">
          <h2 className="hand mb-2.5 text-2xl font-bold tracking-tight sm:mb-3 sm:text-3xl">
            Jump back in
          </h2>
          <div className="space-y-2.5 sm:space-y-3">
            {recent.map((l) => (
              <button
                key={l.slug}
                onClick={() => openLesson(l.slug)}
                className="sheet btn3d flex min-h-[52px] w-full items-center gap-3 rounded-2xl px-3.5 py-2.5 text-left sm:min-h-[56px] sm:px-4 sm:py-3"
              >
                <span className="chip flex h-8 w-8 shrink-0 items-center justify-center rounded-lg font-display text-xs font-bold text-pen-blue sm:h-9 sm:w-9 sm:text-sm">
                  {l.day}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-bold text-foreground/90 sm:text-sm">
                    Day {l.day} · {l.title}
                  </span>
                  <span className="text-[11px] font-semibold text-pencil capitalize sm:text-xs">
                    {l.module.replace(/-/g, " ")}
                  </span>
                </span>
                <span className="hidden items-center gap-1 text-xs font-semibold text-pencil sm:flex">
                  <Clock3 className="h-3.5 w-3.5" aria-hidden />
                  {l.minutes} min
                </span>
                <ChevronRight className="h-4 w-4 shrink-0 text-pencil" aria-hidden />
              </button>
            ))}
          </div>
        </section>
      )}

      {/* tip of the day — sticky note */}
      <section
        aria-label="Python tip"
        className="sticky-note relative mx-auto mt-1 max-w-xl rounded-sm px-4 pb-5 pt-7 sm:px-6 sm:pb-6 sm:pt-8"
      >
        <span className="washi" aria-hidden />
        <div className="relative flex items-start gap-3">
          <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-pen-purple" aria-hidden />
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-foreground/60 sm:text-xs">
              Tip of the day
            </p>
            <p className="mt-1 text-[13px] font-semibold leading-6 text-foreground/80 sm:text-sm sm:leading-[26px]">
              {dailyTip()}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
