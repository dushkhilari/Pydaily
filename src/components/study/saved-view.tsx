"use client";

import { Bookmark, NotebookPen, Sparkles } from "lucide-react";
import type { Manifest } from "@/lib/types";
import { useStudyStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const NOTE_BG = [
  "bg-nb-yellow",
  "bg-nb-pink",
  "bg-nb-teal",
];

export function SavedView({ manifest }: { manifest: Manifest }) {
  const bookmarks = useStudyStore((s) => s.bookmarks);
  const notes = useStudyStore((s) => s.notes);
  const openLesson = useStudyStore((s) => s.openLesson);

  const bookmarkedLessons = manifest.lessons.filter((l) => bookmarks[l.slug]);
  const notedLessons = manifest.lessons.filter(
    (l) => (notes[l.slug] ?? "").trim().length > 0
  );

  return (
    <div className="space-y-7 pt-2">
      <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">Saved</h1>

      {/* ---------- bookmarks ---------- */}
      <section aria-label="Bookmarked lessons">
        <h2 className="mb-3 flex items-center gap-2 font-display text-xl font-bold sm:text-2xl">
          <Bookmark className="h-5 w-5 text-nb-red" aria-hidden />
          Bookmarks
          <span className="neo-chip px-2 py-0.5 text-xs">{bookmarkedLessons.length}</span>
        </h2>
        {bookmarkedLessons.length === 0 ? (
          <div className="neo-card border-dashed py-12 text-center shadow-none">
            <Bookmark className="mx-auto h-8 w-8 text-nb-muted/50" aria-hidden />
            <p className="mt-3 text-sm font-bold text-nb-muted">No bookmarks yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {bookmarkedLessons.map((l) => (
              <button
                key={l.slug}
                onClick={() => openLesson(l.slug)}
                className="neo-card-sm flex min-h-[56px] w-full items-center gap-3 px-4 py-3 text-left transition-transform hover:scale-[1.01]"
              >
                <span className="neo-tile h-9 w-9 bg-nb-red font-display text-sm font-bold text-white dark:text-[#1a1108]">
                  {l.day}
                </span>
                <span className="min-w-0 flex-1 truncate text-sm font-bold">{l.title}</span>
                <Bookmark className="h-4 w-4 shrink-0 text-nb-red" aria-hidden />
              </button>
            ))}
          </div>
        )}
      </section>

      {/* ---------- notes ---------- */}
      <section aria-label="Lesson notes">
        <h2 className="mb-3 flex items-center gap-2 font-display text-xl font-bold sm:text-2xl">
          <NotebookPen className="h-5 w-5 text-nb-purple" aria-hidden />
          Notes
          <span className="neo-chip px-2 py-0.5 text-xs">{notedLessons.length}</span>
        </h2>
        {notedLessons.length === 0 ? (
          <div className="neo-card border-dashed py-12 text-center shadow-none">
            <NotebookPen className="mx-auto h-8 w-8 text-nb-muted/50" aria-hidden />
            <p className="mt-3 text-sm font-bold text-nb-muted">No notes yet</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {notedLessons.map((l, i) => (
              <div
                key={l.slug}
                className={cn(
                  "neo-card-sm relative p-4",
                  NOTE_BG[i % NOTE_BG.length],
                  i % 2 === 0 ? "-rotate-[0.5deg]" : "rotate-[0.5deg]"
                )}
              >
                <button
                  onClick={() => openLesson(l.slug)}
                  className="flex items-center gap-1.5 text-left font-display text-sm font-bold text-[#17110a] underline-offset-2 hover:underline"
                >
                  <Sparkles className="h-4 w-4" aria-hidden />
                  Day {l.day} · {l.title}
                </button>
                <p className="mt-2 whitespace-pre-wrap text-[13px] font-bold leading-6 text-[#17110a]/85">
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
          className="neo-btn neo-btn-red min-h-[48px] w-full rounded-xl text-sm"
        >
          Start Day 1
        </button>
      )}
    </div>
  );
}
