"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Home, BookOpen, Target, Bookmark, BarChart3, Flame, TerminalSquare } from "lucide-react";
import type { Manifest, QuizModule } from "@/lib/types";
import { useStudyStore, type AppView } from "@/lib/store";
import { Textures } from "./textures";
import { HomeView } from "./home-view";
import { LessonsView } from "./lessons-view";
import { LessonView } from "./lesson-view";
import { QuizView } from "./quiz-view";
import { SavedView } from "./saved-view";
import { ProgressView } from "./progress-view";
import { streakInfo, modulePercent } from "@/lib/progress-utils";
import { ModuleIcon } from "./module-icon";
import { cn } from "@/lib/utils";

const NAV_ITEMS: { id: AppView; label: string; icon: Home | BookOpen | Target | Bookmark | BarChart3 }[] = [
  { id: "home", label: "Home", icon: Home },
  { id: "lessons", label: "Lessons", icon: BookOpen },
  { id: "quiz", label: "Quiz", icon: Target },
  { id: "saved", label: "Saved", icon: Bookmark },
  { id: "progress", label: "Progress", icon: BarChart3 },
];

function LogoMark() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-ember shadow-lg shadow-primary/25">
        <TerminalSquare className="h-5 w-5 text-primary-foreground" aria-hidden />
      </div>
      <div className="leading-tight">
        <p className="font-display text-lg font-bold tracking-tight">PyDaily</p>
        <p className="text-[11px] text-muted-foreground">100 Days of Python</p>
      </div>
    </div>
  );
}

export function AppShell({ manifest, quizzes }: { manifest: Manifest; quizzes: QuizModule[] }) {
  const view = useStudyStore((s) => s.view);
  const setView = useStudyStore((s) => s.setView);
  const setModuleFilter = useStudyStore((s) => s.setModuleFilter);
  const bootstrap = useStudyStore((s) => s.bootstrap);
  const progress = useStudyStore((s) => s.progress);
  const streak = streakInfo(progress);

  useEffect(() => {
    void bootstrap();
  }, [bootstrap]);

  const navTo = (target: AppView) => {
    if (target === "lessons") setModuleFilter(null);
    setView(target);
  };

  return (
    <div className="relative min-h-screen flex flex-col">
      <Textures />

      {/* ---------------- Desktop sidebar ---------------- */}
      <aside className="hidden md:flex fixed inset-y-0 left-0 w-72 flex-col z-40 border-r border-border/60 bg-sidebar/70 backdrop-blur-xl">
        <div className="px-5 pt-6 pb-4">
          <button
            onClick={() => navTo("home")}
            className="text-left transition-opacity hover:opacity-80"
            aria-label="Go to home"
          >
            <LogoMark />
          </button>
        </div>

        <nav aria-label="Primary" className="px-3 space-y-1">
          {NAV_ITEMS.map((item) => {
            const active = view === item.id || (view === "lesson" && item.id === "lessons");
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => navTo(item.id)}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "group flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary/15 text-primary"
                    : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                )}
              >
                <Icon className={cn("h-[18px] w-[18px]", active && "text-primary")} aria-hidden />
                {item.label}
                {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" aria-hidden />}
              </button>
            );
          })}
        </nav>

        <div className="mx-5 my-4 h-px bg-border/70" />

        <div className="px-5 pb-2">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/70">
            Learning path
          </p>
        </div>
        <div className="flex-1 overflow-y-auto scroll-slim px-3 pb-4 space-y-1">
          {manifest.modules.map((mod) => {
            const pct = modulePercent(progress, manifest.lessons, mod.id);
            return (
              <button
                key={mod.id}
                onClick={() => {
                  setModuleFilter(mod.id);
                  setView("lessons");
                }}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition-colors hover:bg-secondary/60"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary">
                  <ModuleIcon icon={mod.icon} className="h-4 w-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-medium text-foreground/90">{mod.title}</span>
                  <span className="mt-1 block h-1 w-full overflow-hidden rounded-full bg-secondary">
                    <span
                      className="block h-full rounded-full bg-ember transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </span>
                </span>
                <span className="text-[11px] tabular-nums text-muted-foreground">{Math.round(pct)}%</span>
              </button>
            );
          })}
        </div>

        <div className="border-t border-border/60 px-5 py-4">
          <a
            href={manifest.course.source}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-muted-foreground hover:text-primary transition-colors"
          >
            Course content · dush404/Learn_Python
          </a>
        </div>
      </aside>

      {/* ---------------- Mobile top bar ---------------- */}
      <header className="md:hidden sticky top-0 z-40 glass border-b border-border/60">
        <div className="flex items-center justify-between px-4 py-3">
          <button onClick={() => navTo("home")} aria-label="Go to home" className="transition-opacity hover:opacity-80">
            <LogoMark />
          </button>
          <div
            className="flex items-center gap-1.5 rounded-full bg-secondary/80 px-3 py-1.5 text-sm font-semibold"
            aria-label={`Current streak: ${streak.current} days`}
          >
            <Flame className="h-4 w-4 text-primary" aria-hidden />
            <span className="tabular-nums">{streak.current}</span>
          </div>
        </div>
      </header>

      {/* ---------------- Main content ---------------- */}
      <main className="flex-1 flex flex-col md:pl-72">
        <div className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-10 pt-6 pb-32 md:pb-12">
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
              {view === "quiz" && <QuizView manifest={manifest} quizzes={quizzes} />}
              {view === "saved" && <SavedView manifest={manifest} />}
              {view === "progress" && <ProgressView manifest={manifest} quizzes={quizzes} />}
            </motion.div>
          </AnimatePresence>
        </div>

        <footer className="mt-auto hidden md:block border-t border-border/60">
          <div className="flex items-center justify-between px-8 py-4 text-xs text-muted-foreground">
            <p>
              {manifest.course.title} · {manifest.course.totalDays} lessons synced from the course repo
            </p>
            <p>Learn. Code. Repeat.</p>
          </div>
        </footer>
      </main>

      {/* ---------------- Mobile bottom nav ---------------- */}
      <nav
        aria-label="Bottom navigation"
        className="md:hidden fixed bottom-3 inset-x-3 z-50 glass rounded-[26px] border border-border/70 shadow-2xl shadow-black/40 pb-safe"
      >
        <div className="grid grid-cols-5 px-1.5 py-1.5">
          {NAV_ITEMS.map((item) => {
            const active = view === item.id || (view === "lesson" && item.id === "lessons");
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => navTo(item.id)}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-2xl py-2 text-[10.5px] font-medium transition-colors",
                  active ? "bg-ember text-primary-foreground" : "text-muted-foreground active:bg-secondary/70"
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
