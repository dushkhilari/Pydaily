"use client";

import { motion } from "framer-motion";
import {
  Flame,
  Play,
  BookOpen,
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
import { ProgressRing } from "./progress-ring";
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
    <div className="paper-card rounded-2xl p-4 sm:p-5">
      <div className="deboss flex h-9 w-9 items-center justify-center rounded-lg text-brass-deep">
        <Icon className="h-[18px] w-[18px]" aria-hidden />
      </div>
      <p className="text-engrave mt-3 font-display text-2xl font-bold tabular-nums leading-none">{value}</p>
      <p className="mt-1.5 text-xs font-semibold text-muted-foreground">{sub ?? label}</p>
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
    <div className="space-y-8 pt-2">
      {/* greeting */}
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-brass-deep" aria-hidden />
            {manifest.course.title}
          </p>
          <h1 className="text-engrave mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Keep the <span className="text-brass-deep">streak</span> alive.
          </h1>
        </div>
        <div className="deboss hidden rounded-full px-3.5 py-1.5 text-xs font-bold text-muted-foreground sm:block">
          Day {next.day} of {manifest.course.totalDays}
        </div>
      </div>

      {/* continue hero — leather planner */}
      <motion.section
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35 }}
        className="leather-card gloss relative overflow-hidden rounded-[28px] p-6 sm:p-8"
      >
        <div className="stitch absolute inset-0" aria-hidden />
        <Screws inset={12} />
        <div className="bg-noise absolute inset-0 opacity-[0.07] mix-blend-overlay" aria-hidden />

        <div className="relative flex flex-col items-center gap-6 sm:flex-row sm:gap-8">
          <ProgressRing value={pct} size={124} stroke={11} tone="cream" className="shrink-0" />
          <div className="min-w-0 flex-1 text-center sm:text-left">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-engrave-cream opacity-80">
              Continue learning
            </p>
            <h2 className="text-engrave-cream mt-1.5 font-display text-xl font-bold leading-snug sm:text-2xl">
              Day {next.day} · {next.title}
            </h2>
            <p className="mt-1 text-sm font-semibold text-engrave-cream opacity-75">
              {done} of {manifest.lessons.length} lessons complete · {next.minutes} min estimated
            </p>
            <button
              onClick={() => openLesson(next.slug)}
              className="btn3d btn-key gloss mt-4 inline-flex min-h-[44px] items-center gap-2 rounded-full px-6 py-2.5 text-sm font-bold"
            >
              <Play className="h-4 w-4 fill-current text-primary" aria-hidden />
              Resume lesson
            </button>
          </div>
        </div>
      </motion.section>

      {/* stats */}
      <section aria-label="Your stats" className="grid grid-cols-3 gap-3 sm:gap-4">
        <StatCard icon={CheckCircle2} label="Lessons" value={done} sub="lessons done" />
        <StatCard icon={Flame} label="Streak" value={streak.current} sub="day streak" />
        <StatCard icon={Bookmark} label="Saved" value={Object.keys(bookmarks).length} sub="bookmarks" />
      </section>

      {/* learning path */}
      <section aria-label="Learning path">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-engrave font-display text-xl font-bold tracking-tight">Your path</h2>
          <button
            onClick={openLessons}
            className="inline-flex min-h-[36px] items-center gap-1 text-sm font-bold text-primary hover:underline"
          >
            All lessons
            <ChevronRight className="h-4 w-4" aria-hidden />
          </button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {manifest.modules.map((mod) => {
            const mPct = modulePercent(progress, manifest.lessons, mod.id);
            return (
              <button
                key={mod.id}
                onClick={() => {
                  setModuleFilter(mod.id);
                  setView("lessons");
                }}
                className="paper-card btn3d rounded-2xl p-5 text-left hover:shadow-[0_3px_0_oklch(1_0_0/70%)_inset,0_5px_10px_oklch(0.42_0.06_55/0.2),0_14px_26px_-12px_oklch(0.4_0.06_55/0.3)]"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="deboss flex h-11 w-11 items-center justify-center rounded-xl text-brass-deep">
                    <ModuleIcon icon={mod.icon} className="h-5 w-5" />
                  </span>
                  <span className="deboss rounded-full px-2.5 py-1 text-[11px] font-bold text-muted-foreground">
                    Days {mod.days[0]}–{mod.days[1]}
                  </span>
                </div>
                <h3 className="text-engrave mt-3.5 font-display text-[15px] font-bold leading-snug">{mod.title}</h3>
                <p className="mt-1 line-clamp-2 text-xs font-semibold text-muted-foreground">{mod.subtitle}</p>
                <div className="mt-4 flex items-center gap-3">
                  <div className="deboss h-2.5 flex-1 overflow-hidden rounded-full p-[2px]">
                    <div
                      className="h-full rounded-full bg-brass-mat shadow-[0_1px_1px_oklch(0.35_0.06_55/0.5)] transition-all duration-500"
                      style={{ width: `${mPct}%` }}
                    />
                  </div>
                  <span className="text-[11px] font-bold tabular-nums text-muted-foreground">
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
          <h2 className="text-engrave mb-3 font-display text-xl font-bold tracking-tight">Jump back in</h2>
          <div className="space-y-3">
            {recent.map((l) => (
              <button
                key={l.slug}
                onClick={() => openLesson(l.slug)}
                className="paper-card btn3d flex min-h-[56px] w-full items-center gap-3 rounded-2xl px-4 py-3 text-left"
              >
                <span className="deboss flex h-9 w-9 shrink-0 items-center justify-center rounded-lg font-display text-sm font-bold text-primary">
                  {l.day}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-bold text-foreground/90">
                    Day {l.day} · {l.title}
                  </span>
                  <span className="text-xs font-semibold text-muted-foreground capitalize">
                    {l.module.replace(/-/g, " ")}
                  </span>
                </span>
                <span className="flex items-center gap-1 text-xs font-semibold text-muted-foreground">
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
      <section aria-label="Python tip" className="sticky-note relative mx-auto mt-2 max-w-xl rounded-sm px-6 pb-6 pt-8">
        <span className="tape" aria-hidden />
        <div className="relative flex items-start gap-3.5">
          <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-brass-deep" aria-hidden />
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-foreground/55">Tip of the day</p>
            <p className="mt-1.5 text-sm font-semibold leading-[26px] text-foreground/80">{dailyTip()}</p>
          </div>
        </div>
      </section>
    </div>
  );
}
