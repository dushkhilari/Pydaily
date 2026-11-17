"use client";

import { motion } from "framer-motion";
import {
  Flame,
  Play,
  Bookmark,
  CheckCircle2,
  ChevronRight,
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
import { cn } from "@/lib/utils";

/** Small sticky-note scrap used for the three stats. */
function StatScrap({
  icon: Icon,
  value,
  label,
  tilt,
  iconClass,
}: {
  icon: typeof Flame;
  value: string | number;
  label: string;
  tilt: "left" | "right" | "none";
  iconClass: string;
}) {
  return (
    <div
      className={cn(
        "sticky-note rounded-sm px-2 pb-3 pt-4 sm:px-4 sm:pb-4",
        tilt === "left" && "-rotate-1",
        tilt === "right" && "rotate-1",
        tilt === "none" && "rotate-0"
      )}
    >
      <Icon className={cn("h-4 w-4", iconClass)} aria-hidden />
      <p className="mt-1 font-display text-lg font-bold tabular-nums leading-none sm:text-2xl">
        {value}
      </p>
      <p className="mt-0.5 text-[10px] font-semibold text-pencil sm:text-xs">{label}</p>
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
    <div className="space-y-4 pt-1 sm:space-y-7">
      {/* ---------- the notebook's front page ---------- */}
      <motion.section
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35 }}
        className="sheet relative overflow-hidden rounded-[20px] px-4 pb-6 pt-8 sm:rounded-[26px] sm:px-8 sm:pb-8 sm:pt-10"
      >
        <span className="washi" aria-hidden />

        <div className="relative flex flex-col items-center text-center">
          <p className="hand text-2xl leading-none text-pencil sm:text-3xl">My Python Notebook</p>

          <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.18em] text-pencil sm:text-[11px]">
            This notebook belongs to
          </p>
          <p className="hand mt-1 border-b-2 border-dashed border-pen-blue/50 px-8 text-3xl leading-tight text-foreground sm:text-4xl">
            a Python learner
          </p>

          {/* progress dial with the resume key directly beneath it */}
          <div className="mt-6 flex flex-col items-center gap-3.5">
            <ProgressGauge value={pct} tone="paper" className="h-24 w-24 sm:h-28 sm:w-28" />
            <button
              onClick={() => openLesson(next.slug)}
              className="btn3d btn-ink inline-flex min-h-[42px] items-center gap-2 rounded-full px-6 py-2.5 text-sm font-bold"
            >
              <Play className="h-4 w-4 fill-current" aria-hidden />
              Resume lesson
            </button>
            <p className="max-w-full truncate text-xs font-semibold text-pencil sm:text-sm">
              Next: Day {next.day} · {next.title}
            </p>
          </div>
        </div>
      </motion.section>

      {/* ---------- stats — sticky scraps ---------- */}
      <section aria-label="Your stats" className="grid grid-cols-3 gap-2.5 sm:gap-5">
        <StatScrap icon={CheckCircle2} value={done} label="lessons done" tilt="left" iconClass="text-pen-green" />
        <StatScrap icon={Flame} value={streak.current} label="day streak" tilt="none" iconClass="text-pen-red" />
        <StatScrap icon={Bookmark} value={Object.keys(bookmarks).length} label="bookmarks" tilt="right" iconClass="text-pen-blue" />
      </section>

      {/* ---------- contents — notebook index ---------- */}
      <section aria-label="Learning path">
        <div className="mb-3 flex items-center justify-between sm:mb-4">
          <h2 className="hand text-2xl font-bold tracking-tight sm:text-3xl">Contents</h2>
          <button
            onClick={openLessons}
            className="inline-flex min-h-[36px] items-center gap-1 text-sm font-bold text-pen-blue hover:underline"
          >
            All lessons
            <ChevronRight className="h-4 w-4" aria-hidden />
          </button>
        </div>
        <div className="space-y-2 sm:space-y-2.5">
          {manifest.modules.map((mod) => {
            const mPct = modulePercent(progress, manifest.lessons, mod.id);
            return (
              <button
                key={mod.id}
                onClick={() => {
                  setModuleFilter(mod.id);
                  setView("lessons");
                }}
                className="sheet btn3d flex min-h-[60px] w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-left"
              >
                <span className="chip flex h-9 w-9 shrink-0 items-center justify-center rounded-lg sm:h-10 sm:w-10">
                  <ModuleIcon icon={mod.icon} className="h-4 w-4 text-pen-blue sm:h-5 sm:w-5" />
                </span>

                <span className="min-w-0 flex-1">
                  {/* index row: title …… days */}
                  <span className="flex items-center gap-2">
                    <span className="truncate text-[13px] font-bold sm:text-sm">{mod.title}</span>
                    <span
                      aria-hidden
                      className="hidden h-px min-w-6 flex-1 translate-y-[-2px] border-b border-dashed border-ink/25 sm:block"
                    />
                    <span className="shrink-0 text-[10px] font-bold tabular-nums text-pencil sm:text-[11px]">
                      Days {mod.days[0]}–{mod.days[1]}
                    </span>
                  </span>
                  <span className="mt-1.5 flex items-center gap-2">
                    <span className="chip h-2 flex-1 overflow-hidden rounded-full p-[2px]">
                      <span
                        className="block h-full rounded-full bg-pen-blue transition-all duration-500"
                        style={{ width: `${mPct}%` }}
                      />
                    </span>
                    <span className="w-9 shrink-0 text-right text-[10px] font-bold tabular-nums text-pencil sm:text-[11px]">
                      {Math.round(mPct)}%
                    </span>
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* ---------- jump back in ---------- */}
      {recent.length > 0 && (
        <section aria-label="Jump back in">
          <h2 className="hand mb-2.5 text-2xl font-bold tracking-tight sm:mb-3 sm:text-3xl">
            Jump back in
          </h2>
          <div className="space-y-2 sm:space-y-2.5">
            {recent.map((l) => (
              <button
                key={l.slug}
                onClick={() => openLesson(l.slug)}
                className="sheet btn3d flex min-h-[48px] w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-left sm:min-h-[52px]"
              >
                <span className="chip flex h-8 w-8 shrink-0 items-center justify-center rounded-lg font-display text-xs font-bold text-pen-blue sm:h-9 sm:w-9 sm:text-sm">
                  {l.day}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-bold text-foreground/90 sm:text-sm">
                    Day {l.day} · {l.title}
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

      {/* ---------- tip of the day — sticky note ---------- */}
      <section
        aria-label="Python tip"
        className="sticky-note relative mx-auto max-w-xl rounded-sm px-4 pb-5 pt-7 sm:px-6 sm:pb-6 sm:pt-8"
      >
        <span className="washi" aria-hidden />
        <div className="relative flex items-start gap-3">
          <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-pen-purple" aria-hidden />
          <div className="min-w-0">
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
