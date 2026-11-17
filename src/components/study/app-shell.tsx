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
  NotebookPen,
  type LucideIcon,
} from "lucide-react";
import type { Manifest, QuizModule, Exercise } from "@/lib/types";
import { useStudyStore, type AppView } from "@/lib/store";
import { Textures } from "./textures";
import { GaugeDefs } from "./progress-gauge";
import { ThemeToggle } from "./theme-toggle";
import { HomeView } from "./home-view";
import { LessonsView } from "./lessons-view";
import { LessonView } from "./lesson-view";
import { QuizView } from "./quiz-view";
import { PlaygroundView } from "./playground-view";
import { SavedView } from "./saved-view";
import { ProgressView } from "./progress-view";
import { streakInfo, modulePercent } from "@/lib/progress-utils";
import { ModuleIcon } from "./module-icon";
import { cn } from "@/lib/utils";

const NAV_ITEMS: { id: AppView; label: string; icon: LucideIcon }[] = [
  { id: "home", label: "Home", icon: Home },
  { id: "lessons", label: "Lessons", icon: BookOpen },
  { id: "quiz", label: "Quiz", icon: Target },
  { id: "lab", label: "Code Lab", icon: TerminalSquare },
  { id: "saved", label: "Saved", icon: Bookmark },
  { id: "progress", label: "Progress", icon: BarChart3 },
];

/** Paper logo sticker — ink on paper, legible in both themes. */
function LogoMark() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="relative flex h-11 w-11 -rotate-2 items-center justify-center rounded-xl border border-ink/25 bg-paper shadow-sm">
        <NotebookPen className="h-5 w-5 text-pen-blue" aria-hidden />
      </div>
      <div className="leading-tight">
        <p className="hand text-2xl leading-none text-foreground">PyDaily</p>
        <p className="mt-0.5 text-[11px] font-semibold text-pencil">Python Notebook</p>
      </div>
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
    <div className="relative min-h-screen flex flex-col">
      <Textures />
      <GaugeDefs />

      {/* ---------------- Desktop: notebook cover sidebar ---------------- */}
      <aside className="cover-mat hidden md:flex fixed inset-y-0 left-0 w-64 flex-col z-40 border-r border-black/50 shadow-[inset_-6px_0_12px_-8px_oklch(0_0_0/0.6)]">
        <div className="bg-noise pointer-events-none absolute inset-0 opacity-[0.08] mix-blend-overlay" aria-hidden />
        {/* elastic closure band */}
        <span aria-hidden className="elastic-band absolute inset-y-0 right-3 w-2.5" />

        <div className="relative flex items-start justify-between gap-2 px-5 pt-6 pb-4">
          <div className="relative inline-block -rotate-1 rounded-lg border border-ink/20 bg-paper px-4 py-3 shadow-[0_2px_6px_oklch(0_0_0/0.4)]">
            <span className="washi !left-auto right-[-14px] top-[-8px] !w-[58px] !h-4" aria-hidden />
            <button
              onClick={() => navTo("home")}
              className="text-left transition-opacity hover:opacity-85"
              aria-label="Go to home"
            >
              <LogoMark />
            </button>
          </div>
          <ThemeToggle className="mt-1 !bg-paper" />
        </div>

        <nav aria-label="Primary" className="relative px-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            const active = view === item.id || (view === "lesson" && item.id === "lessons");
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => navTo(item.id)}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "btn3d group flex min-h-[44px] w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-bold transition-all",
                  active
                    ? "bg-paper text-foreground shadow-[0_2px_6px_oklch(0_0_0/0.35)]"
                    : "cover-text opacity-85 hover:opacity-100 hover:bg-white/5"
                )}
              >
                <Icon
                  className={cn("h-[18px] w-[18px]", active ? "text-pen-blue" : "opacity-80")}
                  aria-hidden
                />
                {item.label}
                {active && <span className="ribbon ml-auto h-3 w-1.5 rounded-full" aria-hidden />}
              </button>
            );
          })}
        </nav>

        <div className="relative mx-6 my-4 border-t border-dashed border-white/15" />

        <div className="relative px-6 pb-2">
          <p className="hand text-xl text-[oklch(0.96_0.006_95)] opacity-80">contents</p>
        </div>
        <div className="relative flex-1 overflow-y-auto scroll-slim px-4 pb-4 space-y-1">
          {manifest.modules.map((mod) => {
            const pct = modulePercent(progress, manifest.lessons, mod.id);
            return (
              <button
                key={mod.id}
                onClick={() => {
                  setModuleFilter(mod.id);
                  setView("lessons");
                }}
                className="btn3d flex min-h-[52px] w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left hover:bg-white/5"
              >
                <span className="chip-dark flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[oklch(0.85_0.04_255)]">
                  <ModuleIcon icon={mod.icon} className="h-4 w-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-bold cover-text opacity-90">
                    {mod.title}
                  </span>
                  <span className="chip-dark mt-1.5 block h-2 w-full overflow-hidden rounded-full p-[2px]">
                    <span
                      className="block h-full rounded-full bg-pen-blue shadow-[0_1px_1px_oklch(0.15_0.05_265/0.5)]"
                      style={{ width: `${pct}%` }}
                    />
                  </span>
                </span>
                <span className="text-[11px] font-bold tabular-nums cover-text opacity-70">
                  {Math.round(pct)}%
                </span>
              </button>
            );
          })}
        </div>
      </aside>

      {/* ---------------- Mobile paper header ---------------- */}
      <header className="sticky top-0 z-40 border-b border-ink/10 bg-card/95 shadow-[0_1px_0_oklch(1_0_0/60%)_inset,0_2px_6px_oklch(0.3_0.03_262/0.12)] backdrop-blur supports-[backdrop-filter]:bg-card/85 md:hidden">
        <div className="flex items-center justify-between gap-2 px-3.5 py-2">
          <button onClick={() => navTo("home")} aria-label="Go to home" className="transition-opacity hover:opacity-80">
            <LogoMark />
          </button>
          <div className="flex items-center gap-2">
            <div
              className="chip flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-bold"
              aria-label={`Current streak: ${streak.current} days`}
            >
              <Flame className="h-4 w-4 text-pen-red" aria-hidden />
              <span className="tabular-nums">{streak.current}</span>
            </div>
            <ThemeToggle className="h-9 w-9" />
          </div>
        </div>
      </header>

      {/* ---------------- Main: the open notebook page ---------------- */}
      <main className="relative flex-1 flex w-full min-w-0 flex-col md:pl-64">
        <div className="page-sheet relative flex w-full flex-1 flex-col md:mx-5 md:my-5 md:w-auto md:rounded-[22px] md:border md:border-ink/15">
          {/* punched holes + red margin line (desktop page) */}
          <div aria-hidden className="hole-strip pointer-events-none absolute inset-y-0 left-4 hidden w-5 md:block" />
          <div aria-hidden className="pointer-events-none absolute inset-y-0 left-14 hidden w-px bg-margin-line/45 md:block" />

          <div className="relative w-full min-w-0 max-w-5xl flex-1 mx-auto px-4 sm:px-6 md:pl-20 md:pr-8 lg:pl-24 lg:pr-10 pt-4 sm:pt-6 pb-28 md:pb-10">
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

          <footer className="relative mt-auto border-t border-dashed border-ink/20 px-4 py-3.5 sm:px-6 md:pl-20 md:pr-8 lg:pl-24">
            <p className="hand text-lg leading-none text-pen-blue">Learn. Code. Repeat.</p>
          </footer>
        </div>
      </main>

      {/* ---------------- Mobile paper dock ---------------- */}
      <nav
        aria-label="Bottom navigation"
        className="fixed bottom-3 inset-x-3 z-50 rounded-[24px] border border-ink/20 bg-card shadow-[0_1px_0_oklch(1_0_0/70%)_inset,0_12px_28px_-8px_oklch(0.3_0.03_262/0.45)] pb-safe md:hidden"
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
                  "btn3d flex min-h-[48px] flex-col items-center justify-center gap-1 rounded-xl py-1.5 text-[9.5px] font-bold transition-all",
                  active ? "btn-pressed" : "text-pencil hover:text-foreground"
                )}
              >
                <Icon className={cn("h-[18px] w-[18px]", active && "text-pen-blue")} aria-hidden />
                {item.label}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
