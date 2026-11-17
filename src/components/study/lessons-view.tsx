"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  CheckCircle2,
  Circle,
  CircleDot,
  Clock3,
  X,
  Dumbbell,
  Lightbulb,
  Trophy,
  FileCode2,
} from "lucide-react";
import type { LessonMeta, Manifest } from "@/lib/types";
import { useStudyStore } from "@/lib/store";
import { lessonStatus, modulePercent, type LessonStatus } from "@/lib/progress-utils";
import { ModuleIcon } from "./module-icon";
import { accentFor, TILE_CLS, SOFT_CLS } from "@/lib/accents";
import { cn } from "@/lib/utils";

const TYPE_BADGES: Record<
  LessonMeta["type"],
  { label: string; accent: "purple" | "yellow" | "orange"; icon: typeof Dumbbell } | undefined
> = {
  exercise: { label: "Exercise", accent: "yellow", icon: Dumbbell },
  solution: { label: "Solution", accent: "purple", icon: Lightbulb },
  conclusion: { label: "Finale", accent: "orange", icon: Trophy },
  lesson: undefined,
};

function StatusIcon({ status }: { status: LessonStatus }) {
  if (status === "done")
    return <CheckCircle2 className="h-5 w-5 text-nb-green" aria-label="Completed" />;
  if (status === "in-progress")
    return <CircleDot className="h-5 w-5 text-nb-orange" aria-label="In progress" />;
  return <Circle className="h-5 w-5 text-nb-muted/50" aria-label="Not started" />;
}

function LessonRow({ lesson, index }: { lesson: LessonMeta; index: number }) {
  const openLesson = useStudyStore((s) => s.openLesson);
  const progress = useStudyStore((s) => s.progress);
  const status = lessonStatus(lesson, progress);
  const badge = TYPE_BADGES[lesson.type];

  return (
    <motion.button
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.02, 0.3), duration: 0.2 }}
      onClick={() => openLesson(lesson.slug)}
      className="neo-card-sm flex min-h-[54px] w-full items-center gap-2.5 px-2.5 py-2 text-left transition-transform hover:scale-[1.01] sm:min-h-[58px] sm:gap-3 sm:px-3.5 sm:py-2.5"
    >
      <span
        className={cn(
          "neo-tile h-10 w-11 font-display text-sm font-bold",
          status === "done" ? "bg-nb-green text-[#0b2a17]" : "bg-nb-purple text-[#17110a]"
        )}
      >
        {lesson.day}
      </span>

      <span className="min-w-0 flex-1">
        <span className="block truncate text-[13px] font-bold text-foreground sm:text-sm">
          {lesson.title}
        </span>
        <span className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[10.5px] font-bold text-nb-muted sm:text-[11px]">
          <span className="flex items-center gap-1">
            <Clock3 className="h-3 w-3" aria-hidden />
            {lesson.minutes} min
          </span>
          {lesson.code.length > 0 && (
            <span className="flex items-center gap-1">
              <FileCode2 className="h-3 w-3" aria-hidden />
              {lesson.code.length} file{lesson.code.length > 1 ? "s" : ""}
            </span>
          )}
          {badge && (
            <span className={cn("neo-chip !shadow-hard-xs px-2 py-px text-[10px]", SOFT_CLS[badge.accent])}>
              <badge.icon className="h-3 w-3" aria-hidden />
              {badge.label}
            </span>
          )}
        </span>
      </span>

      <StatusIcon status={status} />
    </motion.button>
  );
}

export function LessonsView({ manifest }: { manifest: Manifest }) {
  const progress = useStudyStore((s) => s.progress);
  const moduleFilter = useStudyStore((s) => s.moduleFilter);
  const setModuleFilter = useStudyStore((s) => s.setModuleFilter);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return manifest.lessons.filter((l) => {
      if (moduleFilter && l.module !== moduleFilter) return false;
      if (!q) return true;
      return (
        l.title.toLowerCase().includes(q) ||
        String(l.day).includes(q) ||
        l.type.includes(q)
      );
    });
  }, [manifest.lessons, moduleFilter, query]);

  const grouped = useMemo(() => {
    const byModule = new Map<string, LessonMeta[]>();
    for (const l of filtered) {
      const arr = byModule.get(l.module) ?? [];
      arr.push(l);
      byModule.set(l.module, arr);
    }
    return manifest.modules
      .filter((m) => byModule.has(m.id))
      .map((m) => ({ module: m, lessons: byModule.get(m.id)! }));
  }, [filtered, manifest.modules]);

  return (
    <div className="space-y-5 pt-2 sm:space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">Lessons</h1>
        <div className="relative w-full sm:w-72">
          <Search
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-nb-muted"
            aria-hidden
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search lessons"
            aria-label="Search lessons"
            className="neo-inset h-11 w-full bg-nb-card pl-10 pr-3 text-sm font-bold text-foreground shadow-hard-xs placeholder:font-semibold placeholder:text-nb-muted focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-nb-purple/50"
          />
        </div>
      </div>

      {moduleFilter && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="neo-chip bg-nb-yellow px-3 py-1.5 text-xs text-[#17110a]">
            {manifest.modules.find((m) => m.id === moduleFilter)?.title}
          </span>
          <button
            onClick={() => setModuleFilter(null)}
            className="neo-btn min-h-[36px] gap-1 rounded-lg px-2.5 text-xs"
          >
            <X className="h-3.5 w-3.5" aria-hidden />
            Clear
          </button>
        </div>
      )}

      <div className="space-y-6 sm:space-y-8">
        {grouped.map(({ module: mod, lessons }, modIdx) => {
          const pct = modulePercent(progress, manifest.lessons, mod.id);
          const doneCount = lessons.filter((l) => progress[l.slug]?.completed).length;
          const accent = accentFor(modIdx);
          return (
            <section key={mod.id} aria-label={mod.title}>
              <div className="neo-card-sm mb-2.5 flex items-center gap-3 px-3 py-2.5 sm:mb-3 sm:px-4">
                <span className={cn("neo-tile h-10 w-10", TILE_CLS[accent])}>
                  <ModuleIcon icon={mod.icon} className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <h2 className="truncate font-display text-[15px] font-bold">{mod.title}</h2>
                  <p className="truncate text-[11px] font-bold text-nb-muted">
                    {doneCount}/{lessons.length} done · Days {mod.days[0]}–{mod.days[1]}
                  </p>
                </div>
                <span className="neo-chip bg-nb-teal px-2.5 py-1 text-xs text-[#0c2725]">
                  {Math.round(pct)}%
                </span>
              </div>
              <div className="space-y-2 sm:space-y-2.5">
                {lessons.map((l, i) => (
                  <LessonRow key={l.slug} lesson={l} index={i} />
                ))}
              </div>
            </section>
          );
        })}
      </div>

      {grouped.length === 0 && (
        <div className="neo-card border-dashed py-14 text-center shadow-none">
          <Search className="mx-auto h-8 w-8 text-nb-muted/50" aria-hidden />
          <p className="mt-3 text-sm font-bold">No lessons match &ldquo;{query}&rdquo;</p>
        </div>
      )}
    </div>
  );
}
