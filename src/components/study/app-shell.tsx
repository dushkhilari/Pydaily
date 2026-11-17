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

function LogoMark({ onLeather = false }: { onLeather?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="gloss relative flex h-11 w-11 items-center justify-center rounded-xl border border-black/30 bg-brass-mat shadow-[0_1px_0_oklch(1_0_0/45%)_inset,0_2px_4px_oklch(0.35_0.06_55/0.4)]">
        <TerminalSquare
          className="h-5 w-5 text-[color:var(--brass-ink)] drop-shadow-[0_1px_0_oklch(0.9_0.08_88/0.55)]"
          aria-hidden
        />
      </div>
      <div className="leading-tight">
        <p
          className={cn(
            "font-display text-lg font-bold tracking-tight",
            onLeather ? "text-engrave-cream" : "text-engrave"
          )}
        >
          PyDaily
        </p>
        <p
          className={cn(
            "text-[11px] font-semibold",
            onLeather ? "text-engrave-cream opacity-70" : "text-muted-foreground"
          )}
        >
          100 Days of Python
        </p>
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

      {/* ---------------- Desktop leather sidebar ---------------- */}
      <aside className="leather-card stitch hidden md:flex fixed inset-y-0 left-0 w-72 flex-col z-40 !rounded-none border-y-0 border-l-0">
        <div className="px-6 pt-7 pb-4">
          <button
            onClick={() => navTo("home")}
            className="text-left transition-opacity hover:opacity-85"
            aria-label="Go to home"
          >
            <LogoMark onLeather />
          </button>
        </div>

        <nav aria-label="Primary" className="px-4 space-y-1.5">
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
                  active ? "btn-pressed !bg-none !shadow-[0_2px_5px_oklch(0.18_0.04_47/50%)_inset] text-primary" : "text-engrave-cream opacity-85 hover:opacity-100 hover:!bg-white/5"
                )}
              >
                <Icon
                  className={cn("h-[18px] w-[18px]", active ? "text-brass-deep" : "opacity-80")}
                  aria-hidden
                />
                {item.label}
                {active && <span className="ml-auto h-2 w-2 rounded-full bg-brass-mat shadow-sm" aria-hidden />}
              </button>
            );
          })}
        </nav>

        <div className="mx-6 my-4 h-px bg-black/25 shadow-[0_1px_0_oklch(1_0_0/12%)]" />

        <div className="px-6 pb-2">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-engrave-cream opacity-70">
            Learning path
          </p>
        </div>
        <div className="flex-1 overflow-y-auto scroll-slim px-4 pb-4 space-y-1.5">
          {manifest.modules.map((mod) => {
            const pct = modulePercent(progress, manifest.lessons, mod.id);
            return (
              <button
                key={mod.id}
                onClick={() => {
                  setModuleFilter(mod.id);
                  setView("lessons");
                }}
                className="btn3d flex min-h-[52px] w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left hover:!bg-white/5"
              >
                <span className="deboss-dark flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[oklch(0.9_0.06_90)]">
                  <ModuleIcon icon={mod.icon} className="h-4 w-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-bold text-engrave-cream opacity-90">
                    {mod.title}
                  </span>
                  <span className="deboss-dark mt-1.5 block h-2 w-full overflow-hidden rounded-full p-[2px]">
                    <span
                      className="block h-full rounded-full bg-brass-mat shadow-[0_1px_1px_oklch(0.35_0.06_55/0.5)]"
                      style={{ width: `${pct}%` }}
                    />
                  </span>
                </span>
                <span className="text-[11px] font-bold tabular-nums text-engrave-cream opacity-70">
                  {Math.round(pct)}%
                </span>
              </button>
            );
          })}
        </div>

        <div className="border-t border-black/25 px-6 py-4 shadow-[0_1px_0_oklch(1_0_0/10%)_inset]">
          <a
            href={manifest.course.source}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] font-semibold text-engrave-cream opacity-60 transition-opacity hover:opacity-100 break-all"
          >
            Course content · dush404/Learn_Python
          </a>
        </div>
      </aside>

      {/* ---------------- Mobile brushed-metal top bar ---------------- */}
      <header className="sticky top-0 z-40 border-b border-black/25 bg-metal-mat shadow-[0_1px_0_oklch(1_0_0/60%)_inset,0_2px_6px_oklch(0.4_0.06_55/0.25)] md:hidden">
        <div className="flex items-center justify-between px-4 py-2.5">
          <button onClick={() => navTo("home")} aria-label="Go to home" className="transition-opacity hover:opacity-80">
            <LogoMark />
          </button>
          <div
            className="gloss relative flex items-center gap-1.5 rounded-full border border-black/25 bg-brass-mat px-3 py-1.5 text-sm font-bold shadow-[0_1px_0_oklch(1_0_0/45%)_inset,0_2px_4px_oklch(0.4_0.07_60/0.35)]"
            aria-label={`Current streak: ${streak.current} days`}
          >
            <Flame
              className="h-4 w-4 text-engrave-brass drop-shadow-[0_1px_0_oklch(0.9_0.08_88/0.5)]"
              aria-hidden
            />
            <span className="text-engrave-brass tabular-nums">{streak.current}</span>
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

        <footer className="mt-auto hidden md:block border-t border-[oklch(0.55_0.05_62/30%)] shadow-[0_1px_0_oklch(1_0_0/55%)]">
          <div className="flex items-center justify-between px-8 py-4 text-xs font-semibold text-muted-foreground">
            <p>
              {manifest.course.title} · {manifest.course.totalDays} lessons synced from the course repo
            </p>
            <p className="text-engrave">Learn. Code. Repeat.</p>
          </div>
        </footer>
      </main>

      {/* ---------------- Mobile brushed-metal dock ---------------- */}
      <nav
        aria-label="Bottom navigation"
        className="fixed bottom-3 inset-x-3 z-50 rounded-[26px] border border-black/25 bg-metal-mat shadow-[0_1px_0_oklch(1_0_0/60%)_inset,0_10px_24px_-6px_oklch(0.35_0.06_55/0.5)] pb-safe md:hidden"
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
                  "btn3d flex min-h-[48px] flex-col items-center justify-center gap-1 rounded-2xl py-2 text-[10.5px] font-bold transition-all",
                  active
                    ? "btn-pressed text-primary !shadow-[0_2px_5px_oklch(0.42_0.06_55/0.35)_inset]"
                    : "text-foreground/55 hover:text-foreground/80"
                )}
              >
                <Icon className={cn("h-[19px] w-[19px]", active && "text-brass-deep")} aria-hidden />
                {item.label}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
