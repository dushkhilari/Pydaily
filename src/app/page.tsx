import { getManifest, getQuizzes } from "@/lib/content";
import { AppShell } from "@/components/study/app-shell";
import type { QuizModule } from "@/lib/types";

export default async function Home() {
  const manifest = getManifest();
  const quizzes = getQuizzes() as QuizModule[];

  return <AppShell manifest={manifest} quizzes={quizzes} />;
}
