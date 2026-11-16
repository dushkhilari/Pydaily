"use client";

import { Bookmark, NotebookPen } from "lucide-react";
import type { Manifest } from "@/lib/types";
import { useStudyStore } from "@/lib/store";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight">Saved</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Bookmarked lessons and your personal notes, in one place.
        </p>
      </div>

      {/* bookmarks */}
      <section aria-label="Bookmarked lessons">
        <h2 className="mb-3 flex items-center gap-2 font-display text-lg font-bold">
          <Bookmark className="h-5 w-5 text-primary" aria-hidden />
          Bookmarks <span className="text-sm font-normal text-muted-foreground">({bookmarkedLessons.length})</span>
        </h2>
        {bookmarkedLessons.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border/70 py-12 text-center">
            <Bookmark className="mx-auto h-8 w-8 text-muted-foreground/40" aria-hidden />
            <p className="mt-3 text-sm font-medium">No bookmarks yet</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Tap the bookmark icon inside any lesson to save it here.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {bookmarkedLessons.map((l) => (
              <button
                key={l.slug}
                onClick={() => openLesson(l.slug)}
                className="flex w-full items-center gap-3 rounded-2xl border border-border/60 bg-card/70 px-4 py-3 text-left transition-colors hover:border-primary/40 hover:bg-card"
              >
                <span className="font-display flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-sm font-bold text-primary">
                  {l.day}
                </span>
                <span className="min-w-0 flex-1 truncate text-sm font-semibold">{l.title}</span>
                <span className="shrink-0 text-xs text-muted-foreground">{l.minutes} min</span>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* notes */}
      <section aria-label="Lesson notes">
        <h2 className="mb-3 flex items-center gap-2 font-display text-lg font-bold">
          <NotebookPen className="h-5 w-5 text-primary" aria-hidden />
          Notes <span className="text-sm font-normal text-muted-foreground">({notedLessons.length})</span>
        </h2>
        {notedLessons.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border/70 py-12 text-center">
            <NotebookPen className="mx-auto h-8 w-8 text-muted-foreground/40" aria-hidden />
            <p className="mt-3 text-sm font-medium">No notes yet</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Write notes inside a lesson — they will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {notedLessons.map((l) => (
              <Card key={l.slug} className="rounded-3xl border-border/60 bg-card/70">
                <CardContent className="p-5">
                  <button
                    onClick={() => openLesson(l.slug)}
                    className="flex items-center gap-2 text-sm font-bold text-primary hover:underline"
                  >
                    <span className="font-display">Day {l.day}</span>
                    <span className="text-foreground/80">·</span>
                    <span className="truncate">{l.title}</span>
                  </button>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-foreground/80">
                    {notes[l.slug]}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      {bookmarkedLessons.length === 0 && notedLessons.length === 0 && (
        <Button
          onClick={() => openLesson(manifest.lessons[0].slug)}
          className="w-full rounded-2xl bg-ember font-semibold text-primary-foreground"
        >
          Start Day 1
        </Button>
      )}
    </div>
  );
}
