"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  RotateCcw,
  Target,
  Trophy,
  XCircle,
} from "lucide-react";
import type { Manifest, QuizModule, QuizAnswerRecord, QuizResult } from "@/lib/types";
import { useStudyStore } from "@/lib/store";
import { saveQuizResultApi } from "@/lib/api-client";
import { ProgressRing } from "./progress-ring";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function QuizView({
  manifest,
  quizzes,
}: {
  manifest: Manifest;
  quizzes: QuizModule[];
}) {
  const quizResults = useStudyStore((s) => s.quizResults);
  const activeQuiz = useStudyStore((s) => s.activeQuiz);
  const setActiveQuiz = useStudyStore((s) => s.setActiveQuiz);

  const quiz = quizzes.find((q) => q.moduleId === activeQuiz) ?? null;
  if (quiz) {
    return <QuizRunner key={quiz.moduleId} quiz={quiz} />;
  }

  return (
    <div className="space-y-6 pt-2">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight">Knowledge check</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Quick quizzes per module — see how much sticks after each chapter.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {quizzes.map((q) => {
          const result = quizResults[q.moduleId] as QuizResult | undefined;
          const pct = result ? Math.round((result.score / result.total) * 100) : null;
          const mod = manifest.modules.find((m) => m.id === q.moduleId);
          return (
            <button
              key={q.moduleId}
              onClick={() => setActiveQuiz(q.moduleId)}
              className="group rounded-3xl border border-border/60 bg-card/70 p-5 text-left transition-all hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-display text-[15px] font-bold">{q.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {q.questions.length} questions{mod ? ` · Days ${mod.days[0]}–${mod.days[1]}` : ""}
                  </p>
                </div>
                {pct !== null ? (
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-primary/15 px-2.5 py-1 text-xs font-bold text-primary">
                    <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
                    {pct}%
                  </span>
                ) : (
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-secondary/80 px-2.5 py-1 text-xs font-medium text-muted-foreground">
                    <Target className="h-3.5 w-3.5" aria-hidden />
                    Start
                  </span>
                )}
              </div>
              {result && (
                <p className="mt-3 text-[11px] font-medium text-muted-foreground">
                  Best score {result.score}/{result.total}
                </p>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function QuizRunner({ quiz }: { quiz: QuizModule }) {
  const [current, setCurrent] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [answers, setAnswers] = useState<QuizAnswerRecord[]>([]);
  const [finished, setFinished] = useState(false);
  const setQuizResultLocal = useStudyStore((s) => s.setQuizResultLocal);
  const setActiveQuiz = useStudyStore((s) => s.setActiveQuiz);

  const total = quiz.questions.length;
  const q = quiz.questions[current];
  const score = useMemo(() => answers.filter((a) => a.correct).length, [answers]);

  const pick = (idx: number) => {
    if (picked !== null) return;
    setPicked(idx);
    setAnswers((prev) => [...prev, { questionId: q.id, answer: idx, correct: idx === q.answer }]);
  };

  const advance = async () => {
    if (current + 1 < total) {
      setCurrent(current + 1);
      setPicked(null);
      return;
    }
    setFinished(true);
    const result: QuizResult = {
      quizId: quiz.moduleId,
      score: answers.filter((a) => a.correct).length,
      total,
      details: answers,
      completedAt: new Date().toISOString(),
    };
    setQuizResultLocal(result);
    await saveQuizResultApi(result.quizId, result.score, result.total, result.details);
  };

  const restart = () => {
    setCurrent(0);
    setPicked(null);
    setAnswers([]);
    setFinished(false);
  };

  if (finished) {
    const pct = Math.round((score / total) * 100);
    const passed = pct >= 60;
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center py-10 text-center"
      >
        <div className="rounded-[32px] border border-border/60 bg-card/70 p-8 sm:p-10">
          <ProgressRing value={pct} size={140} stroke={12} />
          <h1 className="mt-5 font-display text-2xl font-bold">
            {score}/{total} correct
          </h1>
          <p className="mt-1.5 max-w-xs text-sm text-muted-foreground">
            {passed
              ? "Nice work — that module is sinking in."
              : "Close one. Skim the module lessons and try again."}
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Button
              onClick={restart}
              variant="outline"
              className="rounded-full border-border/60 bg-card px-5 font-semibold"
            >
              <RotateCcw className="h-4 w-4" aria-hidden />
              Retake
            </Button>
            <Button
              onClick={() => setActiveQuiz(null)}
              className="rounded-full bg-ember px-5 font-semibold text-primary-foreground hover:opacity-90"
            >
              All quizzes
            </Button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5 pt-2">
      <button
        onClick={() => setActiveQuiz(null)}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        All quizzes
      </button>

      {/* question progress */}
      <div>
        <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
          <span>
            Question {current + 1} of {total}
          </span>
          <span className="tabular-nums">{score} correct so far</span>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full rounded-full bg-ember transition-all duration-300"
            style={{ width: `${((current + (picked !== null ? 1 : 0)) / total) * 100}%` }}
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={q.id}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.2 }}
          className="rounded-3xl border border-border/50 bg-card/70 p-6 sm:p-7"
        >
          <h2 className="font-display text-lg font-bold leading-snug">{q.prompt}</h2>
          <div className="mt-5 space-y-2.5" role="radiogroup" aria-label="Answer options">
            {q.options.map((opt, idx) => {
              const isPicked = picked === idx;
              const isAnswer = q.answer === idx;
              const reveal = picked !== null;
              return (
                <button
                  key={idx}
                  role="radio"
                  aria-checked={isPicked}
                  disabled={reveal}
                  onClick={() => pick(idx)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-2xl border px-4 py-3.5 text-left text-sm font-medium transition-all",
                    !reveal &&
                      "border-border/60 bg-background/40 hover:border-primary/50 hover:bg-primary/[0.07] active:scale-[0.99]",
                    reveal && isAnswer && "border-primary/60 bg-primary/15 text-primary",
                    reveal &&
                      isPicked &&
                      !isAnswer &&
                      "border-destructive/60 bg-destructive/10 text-destructive",
                    reveal && !isPicked && !isAnswer && "border-border/40 bg-transparent opacity-50"
                  )}
                >
                  <span
                    className={cn(
                      "font-display flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold",
                      reveal && isAnswer
                        ? "bg-primary text-primary-foreground"
                        : reveal && isPicked
                          ? "bg-destructive/20 text-destructive"
                          : "bg-secondary text-foreground/70"
                    )}
                  >
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className="flex-1">{opt}</span>
                  {reveal && isAnswer && <CheckCircle2 className="h-5 w-5 shrink-0 text-primary" aria-hidden />}
                  {reveal && isPicked && !isAnswer && (
                    <XCircle className="h-5 w-5 shrink-0 text-destructive" aria-hidden />
                  )}
                </button>
              );
            })}
          </div>

          {picked !== null && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-5 rounded-2xl border border-border/50 bg-background/50 p-4"
            >
              <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                <Trophy className="h-3.5 w-3.5 text-primary" aria-hidden />
                {picked === q.answer ? "Correct" : "Explanation"}
              </p>
              <p className="mt-1.5 text-sm leading-6 text-foreground/85">{q.explanation}</p>
              <Button
                onClick={advance}
                className="mt-4 w-full rounded-2xl bg-ember font-semibold text-primary-foreground hover:opacity-90 sm:w-auto sm:px-6"
              >
                {current + 1 < total ? "Next question" : "See results"}
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Button>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
