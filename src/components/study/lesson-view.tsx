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
import { Screws } from "./textures";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export function LessonView({ manifest }: { manifest: Manifest }) {
  const activeSlug = useStudyStore((s) => s.activeSlug);

  if (!activeSlug) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <PlayCircle className="h-10 w-10 text-muted-foreground/40" aria-hidden />
        <h1 className="text-engrave mt-4 font-display text-xl font-bold">No lesson open</h1>
        <p className="mt-1 max-w-sm text-sm font-semibold text-muted-foreground">
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
      className="btn3d btn-leather gloss mt-5 min-h-[44px] rounded-xl px-5 font-bold"
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
        <div className="deboss h-8 w-40 animate-pulse rounded-xl" />
        <div className="deboss h-14 w-4/5 animate-pulse rounded-2xl" />
        <div className="deboss h-64 animate-pulse rounded-2xl" />
        <div className="deboss h-72 animate-pulse rounded-2xl" />
        <div className="flex items-center justify-center gap-2 text-sm font-semibold text-muted-foreground">
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
          className="btn3d btn-key inline-flex min-h-[40px] items-center gap-1.5 rounded-lg px-3 text-sm font-bold"
        >
          <ArrowLeft className="h-4 w-4 text-primary" aria-hidden />
          All lessons
        </button>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="btn-brass gloss relative rounded-lg px-3 py-1 font-display text-xs font-bold uppercase tracking-wider">
                Day {meta.day}
              </span>
              <span className="deboss inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold text-muted-foreground">
                <ModuleIcon icon={moduleMeta.icon} className="h-3 w-3 text-brass-deep" aria-hidden />
                {moduleMeta.title}
              </span>
              <span className="deboss inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold text-muted-foreground">
                <Clock3 className="h-3 w-3" aria-hidden />
                {meta.minutes} min read
              </span>
            </div>
            <h1 className="text-engrave mt-3 font-display text-2xl font-bold tracking-tight sm:text-3xl">
              {meta.title}
            </h1>
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <button
              onClick={handleToggleBookmark}
              aria-label={isBookmarked ? "Remove bookmark" : "Add bookmark"}
              aria-pressed={isBookmarked}
              className={cn(
                "btn3d flex h-11 w-11 items-center justify-center rounded-xl",
                isBookmarked ? "btn-pressed" : "btn-key"
              )}
            >
              {isBookmarked ? (
                <BookmarkCheck className="h-5 w-5 text-brass-deep" aria-hidden />
              ) : (
                <Bookmark className="h-5 w-5 text-foreground/70" aria-hidden />
              )}
            </button>
            <button
              onClick={handleToggleComplete}
              aria-pressed={isDone}
              className={cn(
                "btn3d gloss inline-flex min-h-[44px] items-center gap-2 rounded-xl px-4 font-bold",
                isDone ? "btn-pressed text-primary" : "btn-leather"
              )}
            >
              <CheckCircle2 className="h-4.5 w-4.5" aria-hidden />
              {isDone ? "Completed" : "Mark done"}
            </button>
          </div>
        </div>
      </header>

      {/* ---------- content tabs (file folders) ---------- */}
      <Tabs defaultValue="tutorial" className="space-y-0">
        <TabsList className="relative z-10 h-auto w-full justify-start gap-1.5 rounded-none border-b-0 bg-transparent p-0">
          <TabsTrigger
            value="tutorial"
            className="btn3d group relative top-[1.5px] z-10 inline-flex items-center gap-1.5 rounded-t-xl rounded-b-none border border-b-0 border-border/50 bg-secondary/70 px-4 py-2.5 text-sm font-bold text-muted-foreground shadow-none data-[state=active]:z-20 data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-[0_-2px_8px_oklch(0.42_0.06_55/0.12)]"
          >
            <FileText className="h-4 w-4 group-data-[state=active]:text-brass-deep sm:mr-0.5" aria-hidden />
            <span className="hidden sm:inline">Tutorial</span>
          </TabsTrigger>
          <TabsTrigger
            value="code"
            className="btn3d group relative top-[1.5px] z-10 inline-flex items-center gap-1.5 rounded-t-xl rounded-b-none border border-b-0 border-border/50 bg-secondary/70 px-4 py-2.5 text-sm font-bold text-muted-foreground shadow-none data-[state=active]:z-20 data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-[0_-2px_8px_oklch(0.42_0.06_55/0.12)]"
          >
            <Code2 className="h-4 w-4 group-data-[state=active]:text-brass-deep sm:mr-0.5" aria-hidden />
            <span className="hidden sm:inline">Code</span>
          </TabsTrigger>
          {detail.videoUrl && (
            <TabsTrigger
              value="video"
              className="btn3d group relative top-[1.5px] z-10 inline-flex items-center gap-1.5 rounded-t-xl rounded-b-none border border-b-0 border-border/50 bg-secondary/70 px-4 py-2.5 text-sm font-bold text-muted-foreground shadow-none data-[state=active]:z-20 data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-[0_-2px_8px_oklch(0.42_0.06_55/0.12)]"
            >
              <PlayCircle className="h-4 w-4 group-data-[state=active]:text-brass-deep sm:mr-0.5" aria-hidden />
              <span className="hidden sm:inline">Video</span>
            </TabsTrigger>
          )}
        </TabsList>

        {/* tutorial sheet with punch holes */}
        <TabsContent
          value="tutorial"
          className="paper-card relative mt-0 rounded-2xl !p-0"
        >
          {/* binder holes */}
          <div aria-hidden className="absolute left-5 top-10 hidden flex-col items-center gap-16 sm:flex">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="h-4 w-4 rounded-full border border-[oklch(0.55_0.05_62/35%)] bg-[oklch(0.86_0.028_83)] shadow-[0_2px_3px_oklch(0.45_0.06_55/25%)_inset]"
              />
            ))}
          </div>
          <div className="space-y-2 px-5 py-6 sm:px-14 sm:py-8">
            {detail.sections.map((section, idx) => (
              <article key={section.file} className={idx > 0 ? "border-t border-border/40 pt-6" : ""}>
                {detail.sections.length > 1 && (
                  <p className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
                    Part {idx + 1} of {detail.sections.length}
                  </p>
                )}
                <MarkdownRenderer markdown={section.markdown} />
              </article>
            ))}
          </div>
        </TabsContent>

        {/* code bench */}
        <TabsContent value="code" className="paper-card mt-0 rounded-2xl p-4 sm:p-6">
          {detail.code.length > 1 && (
            <div className="mb-3 flex flex-wrap gap-2" role="tablist" aria-label="Code files">
              {detail.code.map((c, i) => (
                <button
                  key={c.file}
                  role="tab"
                  aria-selected={codeFile === i}
                  onClick={() => setCodeFile(i)}
                  className={cn(
                    "btn3d rounded-lg px-3 py-1.5 font-mono text-xs font-bold",
                    codeFile === i ? "btn-pressed" : "btn-key"
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
            <p className="py-10 text-center text-sm font-semibold text-muted-foreground">
              This day has no standalone code file — follow the tutorial tab.
            </p>
          )}
        </TabsContent>

        {/* television set */}
        {detail.videoUrl && (
          <TabsContent value="video" className="mt-0">
            <div className="relative rounded-2xl border border-black/30 bg-bezel-mat p-3 shadow-[0_3px_8px_oklch(0.35_0.05_55/0.4)]">
              <Screws inset={9} />
              <div className="relative overflow-hidden rounded-xl border border-black/40 bg-black shadow-[0_3px_10px_oklch(0.08_0.02_60/0.7)_inset]">
                <div className="aspect-video w-full">
                  <iframe
                    src={detail.videoUrl}
                    title={`${meta.title} — lesson video`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="h-full w-full"
                  />
                </div>
              </div>
              <p className="mt-2.5 px-1 text-center font-mono text-[11px] font-bold uppercase tracking-wider text-oklch(0.9_0.02_80)/70">
                Lesson video · synced from the course repository
              </p>
            </div>
          </TabsContent>
        )}
      </Tabs>

      {/* ---------- notes: legal pad ---------- */}
      <section aria-label="Lesson notes" className="paper-card rounded-2xl p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-engrave flex items-center gap-2 font-display text-lg font-bold">
            <NotebookPen className="h-5 w-5 text-brass-deep" aria-hidden />
            My notes
          </h2>
          <button
            onClick={handleSaveNote}
            disabled={noteSaving}
            className="btn3d btn-key gloss inline-flex min-h-[40px] items-center gap-2 rounded-xl px-4 text-sm font-bold disabled:opacity-60"
          >
            {noteSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <StickyNote className="h-4 w-4 text-brass-deep" aria-hidden />
            )}
            Save note
          </button>
        </div>
        <div className="legal-pad mt-3 rounded-lg">
          <textarea
            value={noteDraft}
            onChange={(e) => setNoteDraft(e.target.value)}
            placeholder="Write what you learned today, snippets to remember, questions to revisit…"
            aria-label="Lesson notes"
            className="min-h-[168px] w-full resize-y bg-transparent px-14 py-[5px] text-sm font-semibold leading-[28px] text-foreground/85 placeholder:text-foreground/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-0"
          />
        </div>
      </section>

      {/* ---------- prev / next ---------- */}
      <nav aria-label="Lesson navigation" className="grid gap-3 sm:grid-cols-2">
        {prev ? (
          <button
            onClick={() => openLesson(prev.slug)}
            className="paper-card btn3d group flex min-h-[56px] items-center gap-3 rounded-2xl px-4 py-3.5 text-left"
          >
            <ChevronLeft className="h-5 w-5 shrink-0 text-muted-foreground transition-transform group-hover:-translate-x-0.5" aria-hidden />
            <span className="min-w-0">
              <span className="block text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
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
            className="paper-card btn3d group flex min-h-[56px] items-center justify-end gap-3 rounded-2xl px-4 py-3.5 text-right shadow-[0_1px_0_oklch(1_0_0/70%)_inset,0_2px_4px_oklch(0.45_0.06_55/14%),0_0_0_1.5px_oklch(0.74_0.115_82/45%)]"
          >
            <span className="min-w-0">
              <span className="block text-[11px] font-bold uppercase tracking-[0.14em] text-brass-deep">
                Next · Day {next.day}
              </span>
              <span className="mt-0.5 block truncate text-sm font-bold">{next.title}</span>
            </span>
            <ChevronRight className="h-5 w-5 shrink-0 text-brass-deep transition-transform group-hover:translate-x-0.5" aria-hidden />
          </button>
        ) : (
          <div className="paper-card flex min-h-[56px] items-center justify-center rounded-2xl px-4 py-3.5 text-center text-sm font-semibold text-muted-foreground">
            <span className="text-engrave font-display font-bold">Course complete.</span>
            <span className="ml-1.5">You made it to day {meta.day}.</span>
          </div>
        )}
      </nav>

      {/* completion flourish — brass plaque */}
      {isDone && (
        <div className="relative rounded-2xl border border-black/30 bg-brass-mat p-5 shadow-[0_2px_6px_oklch(0.4_0.08_65/0.4)]">
          <Screws inset={10} />
          <div className="relative flex items-center justify-center gap-4 text-center">
            <CheckCircle2
              className="h-7 w-7 shrink-0 text-engrave-brass drop-shadow-[0_1px_0_oklch(0.92_0.08_88/0.55)]"
              aria-hidden
            />
            <div>
              <p className="text-engrave-brass font-display text-sm font-bold">
                Day {meta.day} cleared
              </p>
              <p className="text-engrave-brass text-xs font-semibold opacity-80">
                Consistency beats intensity — see you tomorrow.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
