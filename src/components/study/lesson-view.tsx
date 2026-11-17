"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Bookmark,
  BookmarkCheck,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Code2,
  FileText,
  Loader2,
  NotebookPen,
  PlayCircle,
  StickyNote,
} from "lucide-react";
import type { LessonDetail, Manifest } from "@/lib/types";
import { useStudyStore } from "@/lib/store";
import { markLessonComplete, toggleBookmarkApi, trackLessonVisit, saveNoteApi } from "@/lib/api-client";
import { MarkdownRenderer } from "./markdown-renderer";
import { ModuleIcon } from "./module-icon";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

type LessonTab = "tutorial" | "code" | "video";

export function LessonView({ manifest }: { manifest: Manifest }) {
  const activeSlug = useStudyStore((s) => s.activeSlug);

  if (!activeSlug) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <span className="neo-tile h-14 w-14 bg-nb-yellow">
          <PlayCircle className="h-7 w-7 text-[#17110a]" aria-hidden />
        </span>
        <h1 className="mt-4 font-display text-xl font-bold">No lesson open</h1>
        <p className="mt-1 text-sm font-bold text-nb-muted">Pick a lesson from the list.</p>
        <OpenLessonsButton />
      </div>
    );
  }

  // keyed remount per lesson: state resets automatically when the slug changes
  return <LessonReader key={activeSlug} manifest={manifest} slug={activeSlug} />;
}

function OpenLessonsButton() {
  const setView = useStudyStore((s) => s.setView);
  return (
    <Button
      onClick={() => setView("lessons")}
      className="neo-btn neo-btn-red mt-5 min-h-[44px] rounded-xl px-5 text-sm"
    >
      Browse lessons
    </Button>
  );
}

function LessonReader({ manifest, slug }: { manifest: Manifest; slug: string }) {
  const setView = useStudyStore((s) => s.setView);
  const openLesson = useStudyStore((s) => s.openLesson);
  const progressEntry = useStudyStore((s) => s.progress[slug]);
  const isBookmarked = useStudyStore((s) => Boolean(s.bookmarks[slug]));
  const savedNote = useStudyStore((s) => s.notes[slug] ?? "");
  const upsertProgress = useStudyStore((s) => s.upsertProgress);
  const addBookmarkLocal = useStudyStore((s) => s.addBookmarkLocal);
  const removeBookmarkLocal = useStudyStore((s) => s.removeBookmarkLocal);
  const setNoteLocal = useStudyStore((s) => s.setNoteLocal);
  const { toast } = useToast();

  const [detail, setDetail] = useState<LessonDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [noteDraft, setNoteDraft] = useState(savedNote);
  const [noteSaving, setNoteSaving] = useState(false);
  const [codeFile, setCodeFile] = useState(0);
  const [tab, setTab] = useState<LessonTab>("tutorial");

  const currentIndex = useMemo(
    () => manifest.lessons.findIndex((l) => l.slug === slug),
    [manifest.lessons, slug]
  );
  const prev = currentIndex > 0 ? manifest.lessons[currentIndex - 1] : null;
  const next =
    currentIndex >= 0 && currentIndex < manifest.lessons.length - 1
      ? manifest.lessons[currentIndex + 1]
      : null;

  const meta = detail?.meta ?? null;
  const moduleMeta = manifest.modules.find((m) => m.id === meta?.module) ?? manifest.modules[0];
  const isDone = Boolean(progressEntry?.completed);

  // fetch lesson content from the API (content lives on disk, not in the DB)
  useEffect(() => {
    let cancelled = false;
    fetch(`/api/lessons/${slug}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("load failed"))))
      .then((d: LessonDetail) => {
        if (cancelled) return;
        setDetail(d);
        setNoteDraft("");
        setCodeFile(0);
        setTab("tutorial");
        window.scrollTo({ top: 0 });
      })
      .catch(() => undefined)
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    void trackLessonVisit(slug).then((entry) => entry && upsertProgress(entry));
    return () => {
      cancelled = true;
    };
  }, [slug, upsertProgress]);

  const handleToggleComplete = useCallback(async () => {
    if (!meta) return;
    const completed = !isDone;
    const now = new Date().toISOString();
    upsertProgress({
      lessonSlug: slug,
      completed,
      visits: progressEntry?.visits ?? 1,
      lastVisitedAt: now,
      completedAt: completed ? now : null,
    });
    const saved = await markLessonComplete(slug, completed);
    if (saved) upsertProgress(saved);
    toast({
      title: completed ? "Lesson complete" : "Marked as not done",
      description: completed
        ? `Day ${meta.day} added to your streak.`
        : `Day ${meta.day} is back on the list.`,
    });
  }, [meta, isDone, slug, progressEntry, upsertProgress, toast]);

  const handleToggleBookmark = useCallback(async () => {
    if (isBookmarked) removeBookmarkLocal(slug);
    else addBookmarkLocal(slug);
    const ok = await toggleBookmarkApi(slug, isBookmarked);
    if (!ok) {
      if (isBookmarked) addBookmarkLocal(slug);
      else removeBookmarkLocal(slug);
      toast({ title: "Could not update bookmark", variant: "destructive" });
    }
  }, [slug, isBookmarked, addBookmarkLocal, removeBookmarkLocal, toast]);

  const handleSaveNote = useCallback(async () => {
    setNoteSaving(true);
    const ok = await saveNoteApi(slug, noteDraft);
    setNoteSaving(false);
    if (ok) {
      setNoteLocal(slug, noteDraft);
      toast({ title: "Note saved" });
    } else {
      toast({ title: "Could not save note", variant: "destructive" });
    }
  }, [slug, noteDraft, setNoteLocal, toast]);

  if (loading || !detail || !meta) {
    return (
      <div className="space-y-5 py-10">
        <div className="neo-inset h-8 w-40 animate-pulse" />
        <div className="neo-card-sm h-16 w-4/5 animate-pulse" />
        <div className="neo-card h-64 animate-pulse" />
        <div className="flex items-center justify-center gap-2 text-sm font-bold text-nb-muted">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          Loading
        </div>
      </div>
    );
  }

  const hasVideo = Boolean(detail.videoUrl);

  const segTabs: { id: LessonTab; label: string; icon: typeof FileText }[] = [
    { id: "tutorial", label: "Tutorial", icon: FileText },
    { id: "code", label: "Code", icon: Code2 },
    ...(hasVideo ? [{ id: "video" as LessonTab, label: "Video", icon: PlayCircle }] : []),
  ];

  return (
    <div className="space-y-5 pt-1 sm:space-y-6">
      {/* ---------- header ---------- */}
      <header className="space-y-4">
        <button
          onClick={() => setView("lessons")}
          className="neo-btn min-h-[40px] gap-1.5 rounded-lg px-3 text-sm"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          All lessons
        </button>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="neo-chip -rotate-1 bg-nb-red px-3 py-1 font-display text-xs font-bold uppercase tracking-wider text-white dark:text-[#1a1108]">
                Day {meta.day}
              </span>
              <span className="neo-chip px-3 py-1 text-xs">
                <ModuleIcon icon={moduleMeta.icon} className="h-3 w-3 text-nb-purple" aria-hidden />
                {moduleMeta.title}
              </span>
              <span className="neo-chip px-3 py-1 text-xs">
                <Clock3 className="h-3 w-3 text-nb-teal" aria-hidden />
                {meta.minutes} min
              </span>
            </div>
            <h1 className="mt-3 font-display text-2xl font-bold tracking-tight sm:text-3xl">
              {meta.title}
            </h1>
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <button
              onClick={handleToggleBookmark}
              aria-label={isBookmarked ? "Remove bookmark" : "Add bookmark"}
              aria-pressed={isBookmarked}
              className={cn(
                "neo-btn h-11 w-11 rounded-xl",
                isBookmarked ? "bg-nb-yellow text-[#17110a]" : ""
              )}
            >
              {isBookmarked ? (
                <BookmarkCheck className="h-5 w-5" aria-hidden />
              ) : (
                <Bookmark className="h-5 w-5" aria-hidden />
              )}
            </button>
            <button
              onClick={handleToggleComplete}
              aria-pressed={isDone}
              className={cn(
                "neo-btn min-h-[44px] gap-2 rounded-xl px-4 text-sm",
                isDone ? "bg-nb-green text-[#0b2a17]" : "neo-btn-teal"
              )}
            >
              <CheckCircle2 className="h-4.5 w-4.5" aria-hidden />
              {isDone ? "Done" : "Mark done"}
            </button>
          </div>
        </div>
      </header>

      {/* ---------- segmented tabs ---------- */}
      <div className="neo-seg w-full sm:w-auto" role="tablist" aria-label="Lesson content">
        {segTabs.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              role="tab"
              aria-selected={tab === t.id}
              data-active={tab === t.id}
              onClick={() => setTab(t.id)}
              className="neo-seg-item flex-1 text-sm sm:flex-none"
            >
              <Icon className="h-4 w-4" aria-hidden />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* ---------- tutorial ---------- */}
      {tab === "tutorial" && (
        <div className="neo-card px-4 py-6 sm:px-8 sm:py-8">
          {detail.sections.map((section, idx) => (
            <article
              key={section.file}
              className={idx > 0 ? "mt-6 border-t-[3px] border-dashed border-border/30 pt-6" : ""}
            >
              {detail.sections.length > 1 && (
                <span className="neo-chip mb-3 px-2.5 py-0.5 text-[10px] uppercase tracking-wider">
                  Part {idx + 1}/{detail.sections.length}
                </span>
              )}
              <MarkdownRenderer markdown={section.markdown} />
            </article>
          ))}
        </div>
      )}

      {/* ---------- code ---------- */}
      {tab === "code" && (
        <div className="neo-card p-4 sm:p-6">
          {detail.code.length > 1 && (
            <div className="mb-3 flex flex-wrap gap-2" role="tablist" aria-label="Code files">
              {detail.code.map((c, i) => (
                <button
                  key={c.file}
                  role="tab"
                  aria-selected={codeFile === i}
                  onClick={() => setCodeFile(i)}
                  className={cn(
                    "neo-btn rounded-lg px-3 py-1.5 font-mono text-xs",
                    codeFile === i ? "bg-nb-yellow text-[#17110a]" : ""
                  )}
                >
                  {c.file}
                </button>
              ))}
            </div>
          )}
          {detail.code.length > 0 ? (
            <MarkdownRenderer
              markdown={`\`\`\`python\n${detail.code[codeFile]?.code ?? ""}\n\`\`\``}
            />
          ) : (
            <p className="py-10 text-center text-sm font-bold text-nb-muted">No code for this day.</p>
          )}
        </div>
      )}

      {/* ---------- video ---------- */}
      {tab === "video" && hasVideo && (
        <div className="neo-card p-3 sm:p-4">
          <div className="overflow-hidden rounded-xl border-[3px] border-nb-border bg-black shadow-hard-sm">
            <div className="aspect-video w-full">
              <iframe
                src={detail.videoUrl!}
                title={`${meta.title} — lesson video`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="h-full w-full"
              />
            </div>
          </div>
        </div>
      )}

      {/* ---------- notes ---------- */}
      <section aria-label="Lesson notes" className="neo-card p-4 sm:p-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 font-display text-xl font-bold">
            <NotebookPen className="h-5 w-5 text-nb-purple" aria-hidden />
            Notes
          </h2>
          <button
            onClick={handleSaveNote}
            disabled={noteSaving}
            className="neo-btn min-h-[40px] gap-2 rounded-xl px-4 text-sm disabled:opacity-60"
          >
            {noteSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <StickyNote className="h-4 w-4 text-nb-purple" aria-hidden />
            )}
            Save
          </button>
        </div>
        <div className="neo-inset mt-3 shadow-hard-xs">
          <textarea
            value={noteDraft}
            onChange={(e) => setNoteDraft(e.target.value)}
            placeholder="Write your notes here"
            aria-label="Lesson notes"
            className="min-h-[150px] w-full resize-y bg-transparent px-3.5 py-3 text-sm font-semibold leading-6 text-foreground placeholder:text-nb-muted/70 focus-visible:outline-none"
          />
        </div>
      </section>

      {/* ---------- prev / next ---------- */}
      <nav aria-label="Lesson navigation" className="grid gap-3 sm:grid-cols-2">
        {prev ? (
          <button
            onClick={() => openLesson(prev.slug)}
            className="neo-card-sm group flex min-h-[56px] items-center gap-3 px-4 py-3 text-left transition-transform hover:scale-[1.01]"
          >
            <ChevronLeft className="h-5 w-5 shrink-0 text-nb-muted transition-transform group-hover:-translate-x-0.5" aria-hidden />
            <span className="min-w-0">
              <span className="block text-[10px] font-bold uppercase tracking-[0.14em] text-nb-muted">
                Previous · Day {prev.day}
              </span>
              <span className="mt-0.5 block truncate text-sm font-bold">{prev.title}</span>
            </span>
          </button>
        ) : (
          <div />
        )}
        {next ? (
          <button
            onClick={() => openLesson(next.slug)}
            className="neo-card-sm group flex min-h-[56px] items-center justify-end gap-3 bg-nb-purple px-4 py-3 text-right transition-transform hover:scale-[1.01]"
          >
            <span className="min-w-0">
              <span className="block text-[10px] font-bold uppercase tracking-[0.14em] text-[#17110a]/70">
                Next · Day {next.day}
              </span>
              <span className="mt-0.5 block truncate text-sm font-bold text-[#17110a]">{next.title}</span>
            </span>
            <ChevronRight className="h-5 w-5 shrink-0 text-[#17110a] transition-transform group-hover:translate-x-0.5" aria-hidden />
          </button>
        ) : (
          <div className="neo-card-sm flex min-h-[56px] items-center justify-center bg-nb-green px-4 py-3 text-center">
            <span className="font-display text-lg font-bold text-[#0b2a17]">Course complete!</span>
          </div>
        )}
      </nav>

      {/* completion banner */}
      {isDone && (
        <div className="neo-card-sm flex items-center justify-center gap-2.5 bg-nb-green px-4 py-3.5 text-center">
          <CheckCircle2 className="h-6 w-6 shrink-0 text-[#0b2a17]" aria-hidden />
          <p className="font-display text-lg font-bold text-[#0b2a17]">Day {meta.day} cleared</p>
        </div>
      )}
    </div>
  );
}
