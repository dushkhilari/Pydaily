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
import { Screws } from "./textures";

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
    <div className="paper-card rounded-xl p-2.5 sm:rounded-2xl sm:p-5">
      <div className="deboss flex h-8 w-8 items-center justify-center rounded-lg sm:h-9 sm:w-9">
        <Icon className="h-4 w-4 sm:h-[18px] sm:w-[18px] text-brass-deep" aria-hidden />
      </div>
      <p className="text-engrave mt-1.5 font-display text-lg font-bold tabular-nums leading-none sm:mt-3 sm:text-2xl">
        {value}
      </p>
      <p className="mt-0.5 text-[10px] font-semibold text-muted-foreground sm:mt-1.5 sm:text-xs">
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
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-brass-deep" aria-hidden />
            {manifest.course.title}
          </p>
          <h1 className="text-engrave mt-2 font-display text-2xl font-bold tracking-tight sm:text-4xl">
            Keep the <span className="text-brass-deep">streak</span> alive.
          </h1>
        </div>
        <div className="deboss hidden whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-bold text-muted-foreground sm:block">
          Day {next.day} of {manifest.course.totalDays}
        </div>
      </div>

      {/* continue hero — black leather planner */}
      <motion.section
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35 }}
        className="leather-card gloss relative overflow-hidden rounded-[20px] p-4 sm:rounded-[28px] sm:p-8"
      >
        <div className="stitch absolute inset-0" aria-hidden />
        <Screws inset={10} />
        <div className="bg-noise absolute inset-0 opacity-[0.07] mix-blend-overlay" aria-hidden />

        <div className="relative flex items-center gap-3.5 sm:gap-8">
          <ProgressGauge
            value={pct}
            tone="cream"
            className="h-[72px] w-[72px] shrink-0 sm:h-32 sm:w-32"
          />
          <div className="min-w-0 flex-1 text-left">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-engrave-cream opacity-80 sm:text-[11px]">
              Continue learning
            </p>
            <h2 className="text-engrave-cream mt-1 line-clamp-2 font-display text-[15px] font-bold leading-snug sm:mt-1.5 sm:text-2xl">
              Day {next.day} · {next.title}
            </h2>
            <p className="mt-1 hidden text-sm font-semibold text-engrave-cream opacity-75 sm:block">
              {done} of {manifest.lessons.length} lessons complete · {next.minutes} min estimated
            </p>
            <button
              onClick={() => openLesson(next.slug)}
              className="btn3d btn-key gloss mt-2.5 inline-flex min-h-[40px] items-center gap-2 rounded-full px-4 py-2 text-xs font-bold sm:mt-4 sm:min-h-[44px] sm:px-6 sm:py-2.5 sm:text-sm"
            >
              <Play className="h-3.5 w-3.5 fill-current text-primary sm:h-4 sm:w-4" aria-hidden />
              Resume lesson
            </button>
          </div>
        </div>
      </motion.section>

      {/* stats */}
      <section aria-label="Your stats" className="grid grid-cols-3 gap-2.5 sm:gap-4">
        <StatCard icon={CheckCircle2} label="Lessons" value={done} sub="lessons done" />
        <StatCard icon={Flame} label="Streak" value={streak.current} sub="day streak" />
        <StatCard icon={Bookmark} label="Saved" value={Object.keys(bookmarks).length} sub="bookmarks" />
      </section>

      {/* learning path */}
      <section aria-label="Learning path">
        <div className="mb-3 flex items-center justify-between sm:mb-4">
          <h2 className="text-engrave font-display text-lg font-bold tracking-tight sm:text-xl">Your path</h2>
          <button
            onClick={openLessons}
            className="inline-flex min-h-[36px] items-center gap-1 text-sm font-bold text-primary hover:underline"
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
                className="paper-card btn3d rounded-2xl p-4 text-left hover:shadow-[0_3px_0_oklch(1_0_0/70%)_inset,0_5px_10px_oklch(0.2_0.02_258/0.18),0_14px_26px_-12px_oklch(0.2_0.02_258/0.28)] sm:p-5"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="deboss flex h-9 w-9 items-center justify-center rounded-xl sm:h-11 sm:w-11">
                    <ModuleIcon icon={mod.icon} className="h-4 w-4 sm:h-5 sm:w-5 text-brass-deep" />
                  </span>
                  <span className="deboss rounded-full px-2 py-1 text-[10px] font-bold text-muted-foreground sm:px-2.5 sm:text-[11px]">
                    Days {mod.days[0]}–{mod.days[1]}
                  </span>
                </div>
                <h3 className="text-engrave mt-2.5 font-display text-sm font-bold leading-snug sm:mt-3.5 sm:text-[15px]">
                  {mod.title}
                </h3>
                <p className="mt-1 line-clamp-2 text-[11px] font-semibold text-muted-foreground sm:text-xs">
                  {mod.subtitle}
                </p>
                <div className="mt-2.5 flex items-center gap-2.5 sm:mt-4 sm:gap-3">
                  <div className="deboss h-2.5 flex-1 overflow-hidden rounded-full p-[2px]">
                    <div
                      className="h-full rounded-full bg-brass-mat shadow-[0_1px_1px_oklch(0.15_0.05_265/0.5)] transition-all duration-500"
                      style={{ width: `${mPct}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-bold tabular-nums text-muted-foreground sm:text-[11px]">
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
          <h2 className="text-engrave mb-2.5 font-display text-lg font-bold tracking-tight sm:mb-3 sm:text-xl">
            Jump back in
          </h2>
          <div className="space-y-2.5 sm:space-y-3">
            {recent.map((l) => (
              <button
                key={l.slug}
                onClick={() => openLesson(l.slug)}
                className="paper-card btn3d flex min-h-[52px] w-full items-center gap-3 rounded-2xl px-3.5 py-2.5 text-left sm:min-h-[56px] sm:px-4 sm:py-3"
              >
                <span className="deboss flex h-8 w-8 shrink-0 items-center justify-center rounded-lg font-display text-xs font-bold text-primary sm:h-9 sm:w-9 sm:text-sm">
                  {l.day}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-bold text-foreground/90 sm:text-sm">
                    Day {l.day} · {l.title}
                  </span>
                  <span className="text-[11px] font-semibold text-muted-foreground capitalize sm:text-xs">
                    {l.module.replace(/-/g, " ")}
                  </span>
                </span>
                <span className="hidden items-center gap-1 text-xs font-semibold text-muted-foreground sm:flex">
                  <Clock3 className="h-3.5 w-3.5" aria-hidden />
                  {l.minutes} min
                </span>
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
              </button>
            ))}
          </div>
        </section>
      )}

      {/* tip of the day — sticky note */}
      <section aria-label="Python tip" className="sticky-note relative mx-auto mt-1 max-w-xl rounded-sm px-4 pb-5 pt-7 sm:px-6 sm:pb-6 sm:pt-8">
        <span className="tape" aria-hidden />
        <div className="relative flex items-start gap-3">
          <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-brass-deep" aria-hidden />
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-foreground/55 sm:text-xs">
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
