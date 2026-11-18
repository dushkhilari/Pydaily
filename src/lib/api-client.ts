"use client";

import type { ProgressEntry, QuizAnswerRecord } from "./types";

/**
 * Thin API client. Every request carries the anonymous `x-user-key`
 * header so the backend can scope progress / bookmarks / notes / quiz
 * results without a full auth flow.
 */

function headers(): HeadersInit {
  const key = typeof window !== "undefined" ? window.localStorage.getItem("pydaily-user-key") : "";
  return { "Content-Type": "application/json", "x-user-key": key ?? "" };
}

async function handle<T>(res: Response): Promise<T | null> {
  if (!res.ok) return null;
  try {
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export async function fetchState(): Promise<{
  progress: Record<string, ProgressEntry>;
  bookmarks: Record<string, string>;
  notes: Record<string, string>;
  quizResults: Record<string, unknown>;
} | null> {
  const res = await fetch("/api/state", { headers: headers() });
  return handle(res);
}

export async function markLessonComplete(
  slug: string,
  completed: boolean
): Promise<ProgressEntry | null> {
  const res = await fetch("/api/progress", {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ slug, completed }),
  });
  return handle(res);
}

export async function trackLessonVisit(slug: string): Promise<ProgressEntry | null> {
  const res = await fetch("/api/progress/visit", {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ slug }),
  });
  return handle(res);
}

export async function toggleBookmarkApi(slug: string, bookmarked: boolean): Promise<boolean> {
  if (bookmarked) {
    const res = await fetch(`/api/bookmarks?slug=${encodeURIComponent(slug)}`, {
      method: "DELETE",
      headers: headers(),
    });
    return res.ok;
  }
  const res = await fetch("/api/bookmarks", {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ slug }),
  });
  return res.ok;
}

export async function saveNoteApi(slug: string, content: string): Promise<boolean> {
  const res = await fetch("/api/notes", {
    method: "PUT",
    headers: headers(),
    body: JSON.stringify({ slug, content }),
  });
  return res.ok;
}

export async function saveQuizResultApi(
  quizId: string,
  score: number,
  total: number,
  details: QuizAnswerRecord[]
): Promise<boolean> {
  const res = await fetch("/api/quiz-results", {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ quizId, score, total, details }),
  });
  return res.ok;
}

