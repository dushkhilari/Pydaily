/* ------------------------------------------------------------------ */
/* Shared types for the Python study site                              */
/* ------------------------------------------------------------------ */

export type LessonType = "lesson" | "exercise" | "solution" | "conclusion";

export interface LessonSectionMeta {
  file: string;
  heading: string;
}

export interface LessonCodeMeta {
  file: string;
  lines: number;
}

export interface LessonMeta {
  day: number;
  slug: string;
  title: string;
  type: LessonType;
  module: string;
  minutes: number;
  words: number;
  videoUrl: string | null;
  sections: LessonSectionMeta[];
  code: LessonCodeMeta[];
  sourceFolder: string;
}

export interface ModuleMeta {
  id: string;
  title: string;
  subtitle: string;
  from: number;
  to: number;
  icon: string;
  accent: string;
  lessonCount: number;
  days: [number, number];
}

export interface CourseMeta {
  title: string;
  description: string;
  source: string;
  totalDays: number;
}

export interface Manifest {
  course: CourseMeta;
  modules: ModuleMeta[];
  lessons: LessonMeta[];
}

export interface LessonSection extends LessonSectionMeta {
  markdown: string;
}

export interface LessonCode extends LessonCodeMeta {
  code: string;
}

export interface LessonDetail {
  meta: LessonMeta;
  sections: LessonSection[];
  code: LessonCode[];
  videoUrl: string | null;
}

/* ---------------- User data (API layer) ---------------- */

export interface ProgressEntry {
  lessonSlug: string;
  completed: boolean;
  visits: number;
  lastVisitedAt: string;
  completedAt: string | null;
}

export interface QuizAnswerRecord {
  questionId: string;
  answer: number;
  correct: boolean;
}

export interface QuizResult {
  quizId: string;
  score: number;
  total: number;
  details: QuizAnswerRecord[];
  completedAt: string;
}

export interface QuizQuestion {
  id: string;
  prompt: string;
  options: string[];
  answer: number;
  explanation: string;
}

export interface QuizModule {
  moduleId: string;
  title: string;
  questions: QuizQuestion[];
}

/* ---------------- Practice exercises ---------------- */

export type Difficulty = "easy" | "medium" | "hard";

export interface Exercise {
  id: string;
  title: string;
  module: string;
  day: number;
  difficulty: Difficulty;
  task: string;
  starterCode: string;
  expectedOutput: string;
  hint: string;
  solution: string;
}

/* ---------------- Derived helpers ---------------- */

export interface StreakInfo {
  current: number;
  best: number;
}
