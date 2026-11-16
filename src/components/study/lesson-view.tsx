"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
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
import { ProgressRing } from "./progress-ring";
import { ModuleIcon } from "./module-icon";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export function LessonView({ manifest }: { manifest: Manifest }) {
  const activeSlug = useStudyStore((s) => s.activeSlug);

  if (!activeSlug) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <PlayCircle className="h-10 w-10 text-muted-foreground/40" aria-hidden />
        <h1 className="mt-4 font-display text-xl font-bold">No lesson open</h1>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          Pick any day from the Lessons tab and start learning Python.
        </p>
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
      className="mt-5 rounded-full bg-ember font-semibold text-primary-foreground hover:opacity-90"
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
        ? `Day ${meta.day} added to your streak. Keep going.`
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
        <div className="h-8 w-40 animate-pulse rounded-xl bg-secondary/70" />
        <div className="h-14 w-4/5 animate-pulse rounded-2xl bg-secondary/70" />
        <div className="h-64 animate-pulse rounded-3xl bg-secondary/50" />
        <div className="h-72 animate-pulse rounded-3xl bg-secondary/40" />
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          Loading lesson…
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pt-1">
      {/* ---------- header ---------- */}
      <header className="space-y-4">
        <button
          onClick={() => setView("lessons")}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          All lessons
        </button>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-ember px-3 py-1 font-display text-xs font-bold text-primary-foreground">
                Day {meta.day}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-border bg-card/70 px-3 py-1 text-xs text-muted-foreground">
                <ModuleIcon icon={moduleMeta.icon} className="h-3 w-3 text-primary" aria-hidden />
                {moduleMeta.title}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-border bg-card/70 px-3 py-1 text-xs text-muted-foreground">
                <Clock3 className="h-3 w-3" aria-hidden />
                {meta.minutes} min read
              </span>
            </div>
            <h1 className="mt-3 font-display text-2xl font-bold tracking-tight sm:text-3xl">{meta.title}</h1>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handleToggleBookmark}
              aria-label={isBookmarked ? "Remove bookmark" : "Add bookmark"}
              aria-pressed={isBookmarked}
              className="h-11 w-11 rounded-2xl border-border/60 bg-card/70"
            >
              {isBookmarked ? (
                <BookmarkCheck className="h-5 w-5 text-primary" aria-hidden />
              ) : (
                <Bookmark className="h-5 w-5" aria-hidden />
              )}
            </Button>
            <Button
              onClick={handleToggleComplete}
              aria-pressed={isDone}
              className={cn(
                "h-11 rounded-2xl px-4 font-semibold shadow-lg transition-all",
                isDone
                  ? "bg-primary/15 text-primary shadow-primary/10 hover:bg-primary/25"
                  : "bg-ember text-primary-foreground shadow-primary/25 hover:opacity-90"
              )}
            >
              <CheckCircle2 className="h-4.5 w-4.5" aria-hidden />
              {isDone ? "Completed" : "Mark done"}
            </Button>
          </div>
        </div>
      </header>

      {/* ---------- content tabs ---------- */}
      <Tabs defaultValue="tutorial" className="space-y-5">
        <TabsList className="h-12 w-full justify-start gap-1 rounded-2xl border border-border/60 bg-card/60 p-1.5 backdrop-blur">
          <TabsTrigger
            value="tutorial"
            className="rounded-xl px-3.5 py-2 text-sm font-medium data-[state=active]:bg-ember data-[state=active]:text-primary-foreground"
          >
            <FileText className="h-4 w-4 sm:mr-1.5" aria-hidden />
            <span className="hidden sm:inline">Tutorial</span>
          </TabsTrigger>
          <TabsTrigger
            value="code"
            className="rounded-xl px-3.5 py-2 text-sm font-medium data-[state=active]:bg-ember data-[state=active]:text-primary-foreground"
          >
            <Code2 className="h-4 w-4 sm:mr-1.5" aria-hidden />
            <span className="hidden sm:inline">Code</span>
          </TabsTrigger>
          {detail.videoUrl && (
            <TabsTrigger
              value="video"
              className="rounded-xl px-3.5 py-2 text-sm font-medium data-[state=active]:bg-ember data-[state=active]:text-primary-foreground"
            >
              <PlayCircle className="h-4 w-4 sm:mr-1.5" aria-hidden />
              <span className="hidden sm:inline">Video</span>
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="tutorial" className="space-y-6">
          {detail.sections.map((section, idx) => (
            <article
              key={section.file}
              className="rounded-3xl border border-border/50 bg-card/70 p-5 sm:p-7"
            >
              {detail.sections.length > 1 && (
                <p className="mb-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  Part {idx + 1} of {detail.sections.length}
                </p>
              )}
              <MarkdownRenderer markdown={section.markdown} />
            </article>
          ))}
        </TabsContent>

        <TabsContent value="code">
          <div className="rounded-3xl border border-border/50 bg-card/70 p-4 sm:p-6">
            {detail.code.length > 1 && (
              <div className="mb-3 flex flex-wrap gap-2" role="tablist" aria-label="Code files">
                {detail.code.map((c, i) => (
                  <button
                    key={c.file}
                    role="tab"
                    aria-selected={codeFile === i}
                    onClick={() => setCodeFile(i)}
                    className={cn(
                      "rounded-xl px-3 py-1.5 font-mono text-xs transition-colors",
                      codeFile === i
                        ? "bg-primary/15 text-primary"
                        : "bg-secondary/60 text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {c.file}
                  </button>
                ))}
              </div>
            )}
            {detail.code.length > 0 ? (
              <div className="md-scope [&>div]:my-0">
                <MarkdownRenderer
                  markdown={`\`\`\`python\n${detail.code[codeFile]?.code ?? ""}\n\`\`\``}
                />
              </div>
            ) : (
              <p className="py-10 text-center text-sm text-muted-foreground">
                This day has no standalone code file — follow the tutorial tab.
              </p>
            )}
          </div>
        </TabsContent>

        {detail.videoUrl && (
          <TabsContent value="video">
            <div className="overflow-hidden rounded-3xl border border-border/50 bg-card/70 p-2.5 sm:p-4">
              <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-black/60">
                <iframe
                  src={detail.videoUrl}
                  title={`${meta.title} — lesson video`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 h-full w-full"
                />
              </div>
              <p className="mt-3 px-1 text-xs text-muted-foreground">
                Lesson video synced from the course repository.
              </p>
            </div>
          </TabsContent>
        )}
      </Tabs>

      {/* ---------- notes ---------- */}
      <section
        aria-label="Lesson notes"
        className="rounded-3xl border border-border/50 bg-card/70 p-5 sm:p-6"
      >
        <div className="flex items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 font-display text-lg font-bold">
            <NotebookPen className="h-5 w-5 text-primary" aria-hidden />
            My notes
          </h2>
          <Button
            size="sm"
            onClick={handleSaveNote}
            disabled={noteSaving}
            className="rounded-xl bg-secondary font-semibold text-foreground hover:bg-secondary/80"
          >
            {noteSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <StickyNote className="h-4 w-4" aria-hidden />
            )}
            Save note
          </Button>
        </div>
        <Textarea
          value={noteDraft}
          onChange={(e) => setNoteDraft(e.target.value)}
          placeholder="Write what you learned today, snippets to remember, questions to revisit…"
          className="mt-3 min-h-28 resize-y rounded-2xl border-border/60 bg-background/60 text-sm"
        />
      </section>

      {/* ---------- prev / next ---------- */}
      <nav aria-label="Lesson navigation" className="grid gap-3 sm:grid-cols-2">
        {prev ? (
          <button
            onClick={() => openLesson(prev.slug)}
            className="group flex items-center gap-3 rounded-2xl border border-border/50 bg-card/60 px-4 py-3.5 text-left transition-colors hover:border-primary/40 hover:bg-card"
          >
            <ChevronLeft className="h-5 w-5 shrink-0 text-muted-foreground transition-transform group-hover:-translate-x-0.5" aria-hidden />
            <span className="min-w-0">
              <span className="block text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                Previous · Day {prev.day}
              </span>
              <span className="mt-0.5 block truncate text-sm font-semibold">{prev.title}</span>
            </span>
          </button>
        ) : (
          <div />
        )}
        {next ? (
          <button
            onClick={() => openLesson(next.slug)}
            className="group flex items-center justify-end gap-3 rounded-2xl border border-primary/30 bg-primary/[0.08] px-4 py-3.5 text-right transition-colors hover:bg-primary/[0.15]"
          >
            <span className="min-w-0">
              <span className="block text-[11px] font-semibold uppercase tracking-widest text-primary">
                Next · Day {next.day}
              </span>
              <span className="mt-0.5 block truncate text-sm font-semibold">{next.title}</span>
            </span>
            <ChevronRight className="h-5 w-5 shrink-0 text-primary transition-transform group-hover:translate-x-0.5" aria-hidden />
          </button>
        ) : (
          <div className="rounded-2xl border border-border/50 bg-card/60 px-4 py-3.5 text-center text-sm text-muted-foreground">
            <span className="font-display font-bold text-foreground">Course complete.</span> You made it to day{" "}
            {meta.day}.
          </div>
        )}
      </nav>

      {/* completion flourish for done lessons */}
      {isDone && (
        <div className="flex items-center justify-center gap-4 rounded-3xl border border-primary/25 bg-card/50 p-5">
          <ProgressRing value={100} size={56} stroke={6} showLabel={false} />
          <div>
            <p className="font-display text-sm font-bold">Day {meta.day} cleared</p>
            <p className="text-xs text-muted-foreground">Consistency beats intensity — see you tomorrow.</p>
          </div>
        </div>
      )}
    </div>
  );
}
