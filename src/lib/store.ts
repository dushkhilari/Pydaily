"use client";

import { create } from "zustand";
import type { ProgressEntry, QuizResult } from "./types";

export type AppView = "home" | "lessons" | "lesson" | "quiz" | "saved" | "progress";

interface UserState {
  progress: Record<string, ProgressEntry>;
  bookmarks: Record<string, string>;
  notes: Record<string, string>;
  quizResults: Record<string, QuizResult>;
}

interface StudyStore extends UserState {
  hydrated: boolean;
  userKey: string;
  view: AppView;
  activeSlug: string | null;
  moduleFilter: string | null;
  activeQuiz: string | null;
  setActiveQuiz: (quizId: string | null) => void;
  setView: (view: AppView) => void;
  openLesson: (slug: string) => void;
  setModuleFilter: (moduleId: string | null) => void;
  bootstrap: () => Promise<void>;
  applyUserData: (data: Partial<UserState>) => void;
  upsertProgress: (entry: ProgressEntry) => void;
  removeBookmarkLocal: (slug: string) => void;
  addBookmarkLocal: (slug: string) => void;
  setNoteLocal: (slug: string, content: string) => void;
  setQuizResultLocal: (result: QuizResult) => void;
}

const STORAGE_KEY = "pydaily-user-key";

function readUserKey(): string {
  if (typeof window === "undefined") return "";
  let key = window.localStorage.getItem(STORAGE_KEY);
  if (!key) {
    key =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `u-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    window.localStorage.setItem(STORAGE_KEY, key);
  }
  return key;
}

export const useStudyStore = create<StudyStore>()((set) => ({
  hydrated: false,
  userKey: "",
  view: "home",
  activeSlug: null,
  moduleFilter: null,
  activeQuiz: null,
  progress: {},
  bookmarks: {},
  notes: {},
  quizResults: {},

  setView: (view) => set({ view }),

  openLesson: (slug) => set({ view: "lesson", activeSlug: slug }),

  setActiveQuiz: (quizId) => set({ activeQuiz: quizId }),

  setModuleFilter: (moduleId) => set({ moduleFilter: moduleId }),

  applyUserData: (data) =>
    set((s) => ({
      hydrated: true,
      progress: data.progress ?? s.progress,
      bookmarks: data.bookmarks ?? s.bookmarks,
      notes: data.notes ?? s.notes,
      quizResults: data.quizResults ?? s.quizResults,
    })),

  upsertProgress: (entry) =>
    set((s) => ({ progress: { ...s.progress, [entry.lessonSlug]: entry } })),

  addBookmarkLocal: (slug) =>
    set((s) => ({ bookmarks: { ...s.bookmarks, [slug]: new Date().toISOString() } })),

  removeBookmarkLocal: (slug) =>
    set((s) => {
      const next = { ...s.bookmarks };
      delete next[slug];
      return { bookmarks: next };
    }),

  setNoteLocal: (slug, content) =>
    set((s) => ({ notes: { ...s.notes, [slug]: content } })),

  setQuizResultLocal: (result) =>
    set((s) => {
      const prev = s.quizResults[result.quizId];
      const better = !prev || result.score / result.total >= prev.score / prev.total;
      return { quizResults: { ...s.quizResults, [result.quizId]: better ? result : prev } };
    }),

  bootstrap: async () => {
    const userKey = readUserKey();
    set({ userKey });
    try {
      const res = await fetch("/api/state", { headers: { "x-user-key": userKey } });
      if (res.ok) {
        const data = (await res.json()) as Partial<UserState>;
        set({
          progress: data.progress ?? {},
          bookmarks: data.bookmarks ?? {},
          notes: data.notes ?? {},
          quizResults: data.quizResults ?? {},
          hydrated: true,
        });
      } else {
        set({ hydrated: true });
      }
    } catch {
      set({ hydrated: true });
    }
  },
}));
