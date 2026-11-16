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
    <div className="rounded-3xl border border-border/60 bg-card/70 p-4 sm:p-5">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15 text-primary">
        <Icon className="h-[18px] w-[18px]" aria-hidden />
      </div>
      <p className="mt-3 font-display text-2xl font-bold tabular-nums leading-none">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{sub ?? label}</p>
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
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-primary" aria-hidden />
            {manifest.course.title}
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Keep the <span className="text-ember">streak</span> alive.
          </h1>
        </div>
        <div className="hidden sm:block rounded-full bg-secondary/80 px-3.5 py-1.5 text-xs text-muted-foreground">
          Day {next.day} of {manifest.course.totalDays}
        </div>
      </div>

      {/* continue hero */}
      <motion.section
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35 }}
        className="relative overflow-hidden rounded-[28px] border border-primary/25 bg-ember p-6 sm:p-8 shadow-xl shadow-primary/20"
      >
        <div className="absolute inset-0 bg-noise opacity-[0.08] mix-blend-overlay" aria-hidden />
        <div
          className="absolute -top-24 -right-16 h-64 w-64 rounded-full bg-glow-amber opacity-60"
          aria-hidden
        />
        <div className="relative flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
          <ProgressRing value={pct} size={124} stroke={11} className="shrink-0 [&_span]:text-primary-foreground" />
          <div className="min-w-0 flex-1 text-center sm:text-left">
            <p className="text-[11px] font-bold uppercase tracking-widest text-primary-foreground/80">
              Continue learning
            </p>
            <h2 className="mt-1.5 font-display text-xl sm:text-2xl font-bold text-primary-foreground leading-snug">
              Day {next.day} · {next.title}
            </h2>
            <p className="mt-1 text-sm text-primary-foreground/75">
              {done} of {manifest.lessons.length} lessons complete · {next.minutes} min estimated
            </p>
            <button
              onClick={() => openLesson(next.slug)}
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-[oklch(0.97_0.008_85)] px-5 py-2.5 text-sm font-bold text-[oklch(0.3_0.07_65)] shadow-md shadow-black/20 transition-transform hover:scale-[1.03] active:scale-95"
            >
              <Play className="h-4 w-4 fill-current" aria-hidden />
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
          <h2 className="font-display text-xl font-bold tracking-tight">Your path</h2>
          <button
            onClick={openLessons}
            className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            All lessons
            <ChevronRight className="h-4 w-4" aria-hidden />
          </button>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {manifest.modules.map((mod) => {
            const mPct = modulePercent(progress, manifest.lessons, mod.id);
            return (
              <button
                key={mod.id}
                onClick={() => {
                  setModuleFilter(mod.id);
                  setView("lessons");
                }}
                className="group rounded-3xl border border-border/60 bg-card/70 p-5 text-left transition-all hover:border-primary/40 hover:bg-card hover:shadow-lg hover:shadow-primary/5"
              >
                <div className="flex items-start justify-between">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/15 text-primary">
                    <ModuleIcon icon={mod.icon} className="h-5 w-5" />
                  </span>
                  <span className="rounded-full bg-secondary/80 px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                    Days {mod.days[0]}–{mod.days[1]}
                  </span>
                </div>
                <h3 className="mt-3.5 font-display text-[15px] font-bold leading-snug">{mod.title}</h3>
                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{mod.subtitle}</p>
                <div className="mt-4 flex items-center gap-3">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-secondary">
                    <div
                      className="h-full rounded-full bg-ember transition-all duration-500"
                      style={{ width: `${mPct}%` }}
                    />
                  </div>
                  <span className="text-[11px] tabular-nums text-muted-foreground">
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
          <h2 className="mb-3 font-display text-xl font-bold tracking-tight">Jump back in</h2>
          <div className="space-y-2.5">
            {recent.map((l) => (
              <button
                key={l.slug}
                onClick={() => openLesson(l.slug)}
                className="flex w-full items-center gap-3 rounded-2xl border border-border/60 bg-card/70 px-4 py-3 text-left transition-colors hover:border-primary/40 hover:bg-card"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary">
                  <BookOpen className="h-4 w-4" aria-hidden />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold">Day {l.day} · {l.title}</span>
                  <span className="text-xs text-muted-foreground capitalize">{l.module.replace(/-/g, " ")}</span>
                </span>
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock3 className="h-3.5 w-3.5" aria-hidden />
                  {l.minutes} min
                </span>
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
              </button>
            ))}
          </div>
        </section>
      )}

      {/* tip of the day */}
      <section
        aria-label="Python tip"
        className="relative overflow-hidden rounded-3xl border border-primary/20 bg-card/60 p-5 sm:p-6"
      >
        <div className="absolute inset-0 bg-dot-grid opacity-30" aria-hidden />
        <div className="relative flex items-start gap-3.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <Sparkles className="h-4 w-4" aria-hidden />
          </span>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Tip of the day</p>
            <p className="mt-1.5 text-sm leading-6 text-foreground/85">{dailyTip()}</p>
          </div>
        </div>
      </section>
    </div>
  );
}
