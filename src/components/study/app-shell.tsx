"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Home,
  BookOpen,
  Target,
  Bookmark,
  BarChart3,
  Flame,
  TerminalSquare,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import type { Manifest, QuizModule, Exercise } from "@/lib/types";
import { useStudyStore, type AppView } from "@/lib/store";
import { Textures } from "./textures";
import { ThemeToggle } from "./theme-toggle";
import { HomeView } from "./home-view";
import { LessonsView } from "./lessons-view";
import { LessonView } from "./lesson-view";
import { QuizView } from "./quiz-view";
import { PlaygroundView } from "./playground-view";
import { SavedView } from "./saved-view";
import { ProgressView } from "./progress-view";
import { streakInfo } from "@/lib/progress-utils";
import { cn } from "@/lib/utils";

const NAV_ITEMS: { id: AppView; label: string; icon: LucideIcon }[] = [
  { id: "home", label: "Home", icon: Home },
  { id: "lessons", label: "Lessons", icon: BookOpen },
  { id: "quiz", label: "Quiz", icon: Target },
  { id: "lab", label: "Code Lab", icon: TerminalSquare },
  { id: "saved", label: "Saved", icon: Bookmark },
  { id: "progress", label: "Progress", icon: BarChart3 },
];

/** Logo sticker — loud icon tile + bold wordmark, readable on any surface. */
function LogoMark() {
  return (
    <div className="flex items-center gap-2.5">
      <span className="neo-tile h-10 w-10 rotate-[-3deg] bg-nb-yellow">
        <Sparkles className="h-5 w-5 text-[#17110a]" aria-hidden />
      </span>
      <span className="leading-none">
        <span className="block font-display text-xl font-bold tracking-tight text-foreground">
          PyDaily<span className="text-nb-red">.</span>
        </span>
        <span className="mt-0.5 block text-[10px] font-bold uppercase tracking-[0.16em] text-nb-muted">
          Learn Python
        </span>
      </span>
    </div>
  );
}

export function AppShell({
  manifest,
  quizzes,
  exercises,
}: {
  manifest: Manifest;
  quizzes: QuizModule[];
  exercises: Exercise[];
}) {
  const view = useStudyStore((s) => s.view);
  const setView = useStudyStore((s) => s.setView);
  const setModuleFilter = useStudyStore((s) => s.setModuleFilter);
  const setActiveQuiz = useStudyStore((s) => s.setActiveQuiz);
  const bootstrap = useStudyStore((s) => s.bootstrap);
  const progress = useStudyStore((s) => s.progress);
  const streak = streakInfo(progress);

  useEffect(() => {
    void bootstrap();
  }, [bootstrap]);

  const navTo = (target: AppView) => {
    if (target === "lessons") setModuleFilter(null);
    if (target === "quiz") setActiveQuiz(null);
    setView(target);
  };

  return (
    <div className="relative flex min-h-screen flex-col">
      <Textures />

      {/* ================= top navbar ================= */}
      <header className="sticky top-0 z-40 border-b-[3px] border-nb-border bg-nb-card">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-2 px-3 sm:px-5">
          <button
            onClick={() => navTo("home")}
            aria-label="Go to home"
            className="shrink-0 transition-transform hover:scale-[1.03] active:scale-95"
          >
            <LogoMark />
          </button>

          {/* desktop nav pills */}
          <nav aria-label="Primary" className="hidden items-center gap-1 md:flex">
            {NAV_ITEMS.map((item) => {
              const active = view === item.id || (view === "lesson" && item.id === "lessons");
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => navTo(item.id)}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex min-h-[40px] items-center gap-1.5 rounded-xl border-[2.5px] px-2.5 py-1.5 text-[13px] font-bold transition-all lg:px-3.5",
                    active
                      ? "border-nb-border bg-nb-yellow text-[#17110a] shadow-hard-xs"
                      : "border-transparent text-nb-muted hover:border-nb-border hover:bg-nb-card hover:text-foreground hover:shadow-hard-xs"
                  )}
                >
                  <Icon className="h-4 w-4" aria-hidden />
                  {item.label}
                </button>
              );
            })}
          </nav>

          <div className="flex shrink-0 items-center gap-2">
            <div
              className="neo-chip h-10 px-3 text-sm"
              aria-label={`Current streak: ${streak.current} days`}
              title="Day streak"
            >
              <Flame className="h-4 w-4 text-nb-red" aria-hidden />
              <span className="tabular-nums">{streak.current}</span>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* ================= main content ================= */}
      <main className="relative flex w-full min-w-0 flex-1 flex-col">
        <div className="mx-auto w-full max-w-6xl flex-1 px-3 pb-28 pt-4 sm:px-5 sm:pt-6 md:pb-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={view}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
            >
              {view === "home" && <HomeView manifest={manifest} />}
              {view === "lessons" && <LessonsView manifest={manifest} />}
              {view === "lesson" && <LessonView manifest={manifest} />}
              {view === "quiz" && <QuizView manifest={manifest} quizzes={quizzes} exercises={exercises} />}
              {view === "lab" && <PlaygroundView />}
              {view === "saved" && <SavedView manifest={manifest} />}
              {view === "progress" && <ProgressView manifest={manifest} quizzes={quizzes} />}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* sticky footer: hugs the bottom on short pages, pushed down on long ones */}
        <footer className="mt-auto border-t-[3px] border-nb-border bg-nb-card">
          <div className="mx-auto flex w-full max-w-6xl items-center justify-center gap-2 px-4 py-4 pb-safe md:pb-4">
            <Sparkles className="h-4 w-4 text-nb-purple" aria-hidden />
            <p className="font-display text-sm font-bold tracking-tight text-foreground">
              PyDaily<span className="text-nb-red">.</span>
            </p>
          </div>
        </footer>
      </main>

      {/* ================= mobile bottom dock ================= */}
      <nav
        aria-label="Bottom navigation"
        className="fixed inset-x-2 bottom-2 z-50 rounded-2xl border-[3px] border-nb-border bg-nb-card shadow-hard pb-safe md:hidden"
      >
        <div className="grid grid-cols-6 px-1 py-1.5">
          {NAV_ITEMS.map((item) => {
            const active = view === item.id || (view === "lesson" && item.id === "lessons");
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => navTo(item.id)}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-h-[50px] flex-col items-center justify-center gap-0.5 rounded-xl py-1 text-[9px] font-bold transition-all",
                  active
                    ? "mx-0.5 border-2 border-nb-border bg-nb-yellow text-[#17110a] shadow-hard-xs"
                    : "text-nb-muted hover:text-foreground"
                )}
              >
                <Icon className="h-[18px] w-[18px]" aria-hidden />
                {item.label}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
