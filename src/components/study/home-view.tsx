"use client";

import { motion } from "framer-motion";
import {
  Flame,
  Play,
  Bookmark,
  CheckCircle2,
  ChevronRight,
  Lightbulb,
  Sparkles,
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
import { accentFor, TILE_CLS, BAR_CLS } from "@/lib/accents";
import { cn } from "@/lib/utils";

/** Stat sticker: white card, coloured icon tile, slight rotation. */
function StatSticker({
  icon: Icon,
  value,
  label,
  accent,
  tilt,
}: {
  icon: typeof Flame;
  value: string | number;
  label: string;
  accent: "teal" | "yellow" | "pink";
  tilt: "left" | "right" | "none";
}) {
  return (
    <div
      className={cn(
        "neo-card-sm flex flex-col items-center gap-1.5 px-2 pb-3.5 pt-3.5 text-center sm:pb-4",
        tilt === "left" && "-rotate-1",
        tilt === "right" && "rotate-1"
      )}
    >
      <span className={cn("neo-tile h-9 w-9", TILE_CLS[accent])}>
        <Icon className="h-4.5 w-4.5" aria-hidden />
      </span>
      <p className="font-display text-xl font-bold tabular-nums leading-none sm:text-2xl">
        {value}
      </p>
      <p className="text-[10px] font-bold uppercase tracking-wide text-nb-muted sm:text-[11px]">
        {label}
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
    <div className="space-y-4 pt-1 sm:space-y-7">
      {/* ---------- hero: the poster ---------- */}
      <motion.section
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35 }}
        className="neo-card relative overflow-hidden px-4 pb-7 pt-9 sm:px-8 sm:pb-9 sm:pt-12"
      >
        {/* corner deco */}
        <span className="neo-shape left-4 top-4 hidden sm:block">
          <DecoDot className="h-4 w-4 text-nb-red" />
        </span>
        <span className="neo-shape right-5 top-7 hidden sm:block">
          <DecoStar className="h-5 w-5 text-nb-purple" />
        </span>
        <span className="neo-shape bottom-6 left-7 hidden sm:block">
          <DecoDiamond className="h-4 w-4 text-nb-teal" />
        </span>
        <span className="neo-shape bottom-8 right-8 hidden sm:block">
          <DecoDot className="h-3.5 w-3.5 text-nb-orange" />
        </span>

        <div className="relative flex flex-col items-center text-center">
          {/* logo tile — like the reference's centred app icon */}
          <span className="neo-tile h-16 w-16 rotate-[-3deg] rounded-2xl bg-nb-red shadow-hard-sm">
            <Sparkles className="h-8 w-8 text-white dark:text-[#1a1108]" aria-hidden />
          </span>

          <h1 className="mt-5 font-display text-[2.1rem] font-bold leading-[1.05] tracking-tight sm:text-6xl">
            100 Days of{" "}
            <span className="relative inline-block">
              <span className="absolute inset-x-[-4px] inset-y-[8%] -rotate-1 bg-nb-yellow" aria-hidden />
              <span className="relative text-[#17110a]">Python</span>
            </span>
          </h1>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-2" aria-label="Course contents">
            <span className="neo-chip px-3 py-1 text-[11px]">Lessons</span>
            <span className="neo-chip bg-nb-purple px-3 py-1 text-[11px] text-[#17110a]">Quizzes</span>
            <span className="neo-chip bg-nb-teal px-3 py-1 text-[11px] text-[#0c2725]">Code Lab</span>
          </div>

          {/* progress dial with the resume key directly beneath it */}
          <div className="mt-7 flex flex-col items-center gap-4">
            <ProgressGauge value={pct} className="h-24 w-24 sm:h-28 sm:w-28" />
            <button
              onClick={() => openLesson(next.slug)}
              className="neo-btn neo-btn-red min-h-[46px] rounded-xl px-7 text-sm"
            >
              <Play className="h-4 w-4 fill-current" aria-hidden />
              Resume
            </button>
            <p className="max-w-[280px] truncate text-xs font-bold text-nb-muted sm:max-w-md sm:text-sm">
              Day {next.day} · {next.title}
            </p>
          </div>
        </div>
      </motion.section>

      {/* ---------- stats — sticker cards ---------- */}
      <section aria-label="Your stats" className="grid grid-cols-3 gap-2.5 sm:gap-5">
        <StatSticker icon={CheckCircle2} value={done} label="Lessons done" accent="teal" tilt="left" />
        <StatSticker icon={Flame} value={streak.current} label="Day streak" accent="yellow" tilt="none" />
        <StatSticker icon={Bookmark} value={Object.keys(bookmarks).length} label="Bookmarks" accent="pink" tilt="right" />
      </section>

      {/* ---------- chapters ---------- */}
      <section aria-label="Learning path">
        <div className="mb-3 flex items-center justify-between sm:mb-4">
          <h2 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">Chapters</h2>
          <button
            onClick={openLessons}
            className="neo-btn min-h-[38px] rounded-lg px-3.5 text-[13px]"
          >
            All lessons
            <ChevronRight className="h-4 w-4" aria-hidden />
          </button>
        </div>
        <div className="space-y-2.5 sm:space-y-3">
          {manifest.modules.map((mod, idx) => {
            const mPct = modulePercent(progress, manifest.lessons, mod.id);
            const accent = accentFor(idx);
            return (
              <button
                key={mod.id}
                onClick={() => {
                  setModuleFilter(mod.id);
                  setView("lessons");
                }}
                className="neo-card-sm flex min-h-[64px] w-full items-center gap-3 px-3 py-2.5 text-left transition-transform hover:scale-[1.01] sm:gap-4 sm:px-4"
              >
                <span className={cn("neo-tile h-10 w-10 sm:h-11 sm:w-11", TILE_CLS[accent])}>
                  <ModuleIcon icon={mod.icon} className="h-5 w-5" />
                </span>

                <span className="min-w-0 flex-1">
                  <span className="flex items-baseline gap-2">
                    <span className="truncate text-sm font-bold sm:text-[15px]">{mod.title}</span>
                    <span className="ml-auto shrink-0 text-[10px] font-bold tabular-nums text-nb-muted sm:text-[11px]">
                      Days {mod.days[0]}–{mod.days[1]}
                    </span>
                  </span>
                  <span className="mt-2 flex items-center gap-2">
                    <span className="neo-bar flex-1 !h-3.5">
                      <span
                        className={cn("neo-bar-fill", BAR_CLS[accent])}
                        style={{ width: `${mPct}%` }}
                      />
                    </span>
                    <span className="w-9 shrink-0 text-right text-[10px] font-bold tabular-nums text-nb-muted sm:text-[11px]">
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
          <h2 className="mb-2.5 font-display text-2xl font-bold tracking-tight sm:mb-3 sm:text-3xl">
            Jump back in
          </h2>
          <div className="space-y-2.5 sm:space-y-3">
            {recent.map((l) => (
              <button
                key={l.slug}
                onClick={() => openLesson(l.slug)}
                className="neo-card-sm flex min-h-[52px] w-full items-center gap-3 px-3 py-2.5 text-left sm:min-h-[56px] sm:px-4"
              >
                <span className="neo-tile h-9 w-9 bg-nb-purple font-display text-sm font-bold text-[#17110a]">
                  {l.day}
                </span>
                <span className="min-w-0 flex-1 truncate text-[13px] font-bold sm:text-sm">
                  Day {l.day} · {l.title}
                </span>
                <ChevronRight className="h-4 w-4 shrink-0 text-nb-muted" aria-hidden />
              </button>
            ))}
          </div>
        </section>
      )}

      {/* ---------- tip of the day ---------- */}
      <section
        aria-label="Python tip"
        className="neo-card-sm relative mx-auto max-w-xl rotate-[0.6deg] bg-nb-purple px-4 py-4 sm:px-6 sm:py-5"
      >
        <div className="flex items-start gap-3">
          <span className="neo-tile h-10 w-10 shrink-0 bg-nb-card">
            <Lightbulb className="h-5 w-5 text-nb-purple" aria-hidden />
          </span>
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#17110a]/70">
              Tip of the day
            </p>
            <p className="mt-1 text-[13px] font-bold leading-6 text-[#17110a] sm:text-sm sm:leading-[26px]">
              {dailyTip()}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ---------------- hero deco shapes ---------------- */

function DecoDot({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <circle cx="12" cy="12" r="9" />
    </svg>
  );
}

function DecoStar({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2l1.9 6.1L20 10l-6.1 1.9L12 18l-1.9-6.1L4 10l6.1-1.9L12 2z" />
    </svg>
  );
}

function DecoDiamond({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <rect x="6" y="6" width="12" height="12" rx="2.5" transform="rotate(45 12 12)" />
    </svg>
  );
}
