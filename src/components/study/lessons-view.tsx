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
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

const TYPE_BADGES: Record<
  LessonMeta["type"],
  { label: string; className: string; icon: typeof Dumbbell } | undefined
> = {
  exercise: {
    label: "Exercise",
    className: "bg-primary/15 text-primary border-primary/30",
    icon: Dumbbell,
  },
  solution: {
    label: "Solution",
    className: "bg-[oklch(0.85_0.13_95)]/15 text-[oklch(0.88_0.13_95)] border-[oklch(0.85_0.13_95)]/30",
    icon: Lightbulb,
  },
  conclusion: {
    label: "Finale",
    className: "bg-secondary text-foreground border-border",
    icon: Trophy,
  },
  lesson: undefined,
};

function StatusIcon({ status }: { status: LessonStatus }) {
  if (status === "done")
    return <CheckCircle2 className="h-5 w-5 text-primary" aria-label="Completed" />;
  if (status === "in-progress")
    return <CircleDot className="h-5 w-5 text-primary/60" aria-label="In progress" />;
  return <Circle className="h-5 w-5 text-muted-foreground/40" aria-label="Not started" />;
}

function LessonRow({ lesson, index }: { lesson: LessonMeta; index: number }) {
  const progress = useStudyStore((s) => s.progress);
  const openLesson = useStudyStore((s) => s.openLesson);
  const status = lessonStatus(lesson, progress);
  const badge = TYPE_BADGES[lesson.type];

  return (
    <motion.button
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.02, 0.3), duration: 0.2 }}
      onClick={() => openLesson(lesson.slug)}
      className={cn(
        "group flex w-full items-center gap-3 rounded-2xl border px-3.5 py-3 text-left transition-all",
        status === "done"
          ? "border-primary/25 bg-primary/[0.06]"
          : "border-border/50 bg-card/50 hover:border-primary/35 hover:bg-card",
        "hover:shadow-sm hover:shadow-primary/10"
      )}
    >
      <span
        className={cn(
          "font-display w-11 shrink-0 rounded-xl py-1.5 text-center text-sm font-bold tabular-nums",
          status === "done" ? "bg-ember text-primary-foreground" : "bg-secondary text-foreground/80"
        )}
      >
        {lesson.day}
      </span>

      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className="truncate text-sm font-semibold text-foreground/90">{lesson.title}</span>
        </span>
        <span className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
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
            <span className={cn("inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-medium", badge.className)}>
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
    <div className="space-y-7 pt-2">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">All lessons</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {manifest.lessons.length} days of Python, from hello world to asyncio.
          </p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search lessons…"
            aria-label="Search lessons"
            className="h-11 rounded-2xl border-border/60 bg-card/70 pl-10 text-sm"
          />
        </div>
      </div>

      {moduleFilter && (
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="gap-1.5 rounded-full bg-primary/15 text-primary border-primary/30 px-3 py-1">
            {manifest.modules.find((m) => m.id === moduleFilter)?.title}
          </Badge>
          <button
            onClick={() => setModuleFilter(null)}
            className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" aria-hidden />
            Clear filter
          </button>
        </div>
      )}

      <div className="space-y-8">
        {grouped.map(({ module: mod, lessons }) => {
          const pct = modulePercent(progress, manifest.lessons, mod.id);
          const doneCount = lessons.filter((l) => progress[l.slug]?.completed).length;
          return (
            <section key={mod.id} aria-label={mod.title}>
              <div className="mb-3 flex items-center gap-3 rounded-2xl border border-border/50 bg-card/60 px-4 py-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
                  <ModuleIcon icon={mod.icon} className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <h2 className="truncate font-display text-[15px] font-bold">{mod.title}</h2>
                  <p className="truncate text-xs text-muted-foreground">
                    {doneCount}/{lessons.length} complete · Days {mod.days[0]}–{mod.days[1]}
                  </p>
                </div>
                <span className="font-display text-sm font-bold tabular-nums text-primary">
                  {Math.round(pct)}%
                </span>
              </div>
              <div className="space-y-2">
                {lessons.map((l, i) => (
                  <LessonRow key={l.slug} lesson={l} index={i} />
                ))}
              </div>
            </section>
          );
        })}
      </div>

      {grouped.length === 0 && (
        <div className="rounded-3xl border border-dashed border-border/70 py-16 text-center">
          <Search className="mx-auto h-8 w-8 text-muted-foreground/50" aria-hidden />
          <p className="mt-3 text-sm font-medium">No lessons match “{query}”</p>
          <p className="mt-1 text-xs text-muted-foreground">Try a different keyword or clear the module filter.</p>
        </div>
      )}
    </div>
  );
}
