import { getManifest, getQuizzes, getExercises } from "@/lib/content";
import { AppShell } from "@/components/study/app-shell";
import type { QuizModule, Exercise } from "@/lib/types";

export default async function Home() {
  const manifest = getManifest();
  const quizzes = getQuizzes() as QuizModule[];
  const exercises = getExercises() as Exercise[];

  return <AppShell manifest={manifest} quizzes={quizzes} exercises={exercises} />;
}
