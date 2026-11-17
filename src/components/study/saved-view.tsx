"use client";

import { Bookmark, NotebookPen } from "lucide-react";
import type { Manifest } from "@/lib/types";
import { useStudyStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export function SavedView({ manifest }: { manifest: Manifest }) {
  const bookmarks = useStudyStore((s) => s.bookmarks);
  const notes = useStudyStore((s) => s.notes);
  const openLesson = useStudyStore((s) => s.openLesson);

  const bookmarkedLessons = manifest.lessons.filter((l) => bookmarks[l.slug]);
  const notedLessons = manifest.lessons.filter(
    (l) => (notes[l.slug] ?? "").trim().length > 0
  );

  return (
    <div className="space-y-8 pt-2">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight">Saved</h1>
        <p className="mt-1 text-sm font-semibold text-pencil">
          Bookmarked lessons and your personal notes, in one place.
        </p>
      </div>

      {/* bookmarks — paper slips with blue ribbon */}
      <section aria-label="Bookmarked lessons">
        <h2 className="hand mb-3 flex items-center gap-2 text-2xl font-bold">
          <Bookmark className="h-5 w-5 text-pen-blue" aria-hidden />
          Bookmarks <span className="font-sans text-sm font-semibold text-pencil">({bookmarkedLessons.length})</span>
        </h2>
        {bookmarkedLessons.length === 0 ? (
          <div className="sheet rounded-2xl border-2 border-dashed border-ink/20 py-12 text-center shadow-none">
            <Bookmark className="mx-auto h-8 w-8 text-pencil/50" aria-hidden />
            <p className="mt-3 text-sm font-bold">No bookmarks yet</p>
            <p className="mt-1 text-xs font-semibold text-pencil">
              Tap the bookmark key inside any lesson to save it here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {bookmarkedLessons.map((l) => (
              <button
                key={l.slug}
                onClick={() => openLesson(l.slug)}
                className="sheet btn3d relative flex min-h-[56px] w-full items-center gap-3 overflow-hidden rounded-xl px-4 py-3 pl-6 text-left"
              >
                <span className="ribbon absolute inset-y-2 left-1 w-2 rounded-full" aria-hidden />
                <span className="chip flex h-9 w-9 shrink-0 items-center justify-center rounded-lg font-display text-sm font-bold text-pen-blue">
                  {l.day}
                </span>
                <span className="min-w-0 flex-1 truncate text-sm font-bold">{l.title}</span>
                <span className="shrink-0 text-xs font-semibold text-pencil">{l.minutes} min</span>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* notes — sticky note wall */}
      <section aria-label="Lesson notes">
        <h2 className="hand mb-3 flex items-center gap-2 text-2xl font-bold">
          <NotebookPen className="h-5 w-5 text-pen-blue" aria-hidden />
          Notes <span className="font-sans text-sm font-semibold text-pencil">({notedLessons.length})</span>
        </h2>
        {notedLessons.length === 0 ? (
          <div className="sheet rounded-2xl border-2 border-dashed border-ink/20 py-12 text-center shadow-none">
            <NotebookPen className="mx-auto h-8 w-8 text-pencil/50" aria-hidden />
            <p className="mt-3 text-sm font-bold">No notes yet</p>
            <p className="mt-1 text-xs font-semibold text-pencil">
              Write notes inside a lesson — they will appear here.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2">
            {notedLessons.map((l, i) => (
              <div
                key={l.slug}
                className={cn(
                  "sticky-note relative min-h-[120px] rounded-sm px-5 pb-6 pt-7",
                  i % 2 === 1 && "alt"
                )}
              >
                <span className="washi" aria-hidden />
                <button
                  onClick={() => openLesson(l.slug)}
                  className="text-left font-display text-sm font-bold text-pen-blue underline-offset-2 hover:underline"
                >
                  Day {l.day} · <span className="text-foreground/80">{l.title}</span>
                </button>
                <p className="mt-2 whitespace-pre-wrap text-sm font-semibold leading-[26px] text-foreground/80">
                  {notes[l.slug]}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      {bookmarkedLessons.length === 0 && notedLessons.length === 0 && (
        <button
          onClick={() => openLesson(manifest.lessons[0].slug)}
          className="btn3d btn-ink min-h-[48px] w-full rounded-xl font-bold"
        >
          Start Day 1
        </button>
      )}
    </div>
  );
}
