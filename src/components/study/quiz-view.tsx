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
import { Screws } from "./textures";
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
        <h1 className="text-engrave font-display text-3xl font-bold tracking-tight">Knowledge check</h1>
        <p className="mt-1 text-sm font-semibold text-muted-foreground">
          Quick quizzes per module — see how much sticks after each chapter.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {quizzes.map((q) => {
          const result = quizResults[q.moduleId] as QuizResult | undefined;
          const pct = result ? Math.round((result.score / result.total) * 100) : null;
          const mod = manifest.modules.find((m) => m.id === q.moduleId);
          return (
            <button
              key={q.moduleId}
              onClick={() => setActiveQuiz(q.moduleId)}
              className="paper-card btn3d rounded-2xl p-5 text-left hover:shadow-[0_3px_0_oklch(1_0_0/70%)_inset,0_5px_10px_oklch(0.42_0.06_55/0.2),0_14px_26px_-12px_oklch(0.4_0.06_55/0.3)]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-engrave truncate font-display text-[15px] font-bold">{q.title}</p>
                  <p className="mt-1 text-xs font-semibold text-muted-foreground">
                    {q.questions.length} questions{mod ? ` · Days ${mod.days[0]}–${mod.days[1]}` : ""}
                  </p>
                </div>
                {pct !== null ? (
                  <span className="btn-brass gloss inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold">
                    <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
                    {pct}%
                  </span>
                ) : (
                  <span className="deboss inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold text-muted-foreground">
                    <Target className="h-3.5 w-3.5" aria-hidden />
                    Start
                  </span>
                )}
              </div>
              {result && (
                <p className="mt-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
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
        <div className="relative rounded-[28px] border border-black/30 bg-brass-mat p-8 shadow-[0_3px_8px_oklch(0.4_0.08_65/0.4)] sm:p-10">
          <Screws inset={14} />
          <div className="bg-noise absolute inset-0 rounded-[28px] opacity-[0.08] mix-blend-overlay" aria-hidden />
          <div className="relative">
            <ProgressRing value={pct} size={140} stroke={12} tone="cream" />
            <h1 className="text-engrave-cream mt-5 font-display text-2xl font-bold">
              {score}/{total} correct
            </h1>
            <p className="text-engrave-cream mx-auto mt-1.5 max-w-xs text-sm font-semibold opacity-80">
              {passed
                ? "Nice work — that module is sinking in."
                : "Close one. Skim the module lessons and try again."}
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={restart}
                className="btn3d btn-key gloss inline-flex min-h-[44px] items-center gap-2 rounded-xl px-5 text-sm font-bold"
              >
                <RotateCcw className="h-4 w-4 text-primary" aria-hidden />
                Retake
              </button>
              <button
                onClick={() => setActiveQuiz(null)}
                className="btn3d btn-leather gloss inline-flex min-h-[44px] items-center gap-2 rounded-xl px-5 text-sm font-bold"
              >
                All quizzes
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5 pt-2">
      <button
        onClick={() => setActiveQuiz(null)}
        className="btn3d btn-key inline-flex min-h-[40px] items-center gap-1.5 rounded-lg px-3 text-sm font-bold"
      >
        <ArrowLeft className="h-4 w-4 text-primary" aria-hidden />
        All quizzes
      </button>

      {/* question progress — debossed gauge strip */}
      <div>
        <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-muted-foreground">
          <span>
            Question {current + 1} of {total}
          </span>
          <span className="tabular-nums normal-case">{score} correct so far</span>
        </div>
        <div className="deboss mt-2 h-3 overflow-hidden rounded-full p-[2px]">
          <div
            className="h-full rounded-full bg-brass-mat shadow-[0_1px_1px_oklch(0.35_0.06_55/0.5)] transition-all duration-300"
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
          className="paper-card rounded-2xl p-6 sm:p-7"
        >
          <h2 className="text-engrave font-display text-lg font-bold leading-snug">{q.prompt}</h2>
          <div className="mt-5 space-y-3" role="radiogroup" aria-label="Answer options">
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
                    "btn3d flex min-h-[52px] w-full items-center gap-3 rounded-xl px-4 py-3.5 text-left text-sm font-bold transition-all",
                    !reveal && "btn-key",
                    reveal && isAnswer && "btn-brass",
                    reveal && isPicked && !isAnswer &&
                      "border border-destructive/60 bg-destructive/15 text-destructive shadow-[0_2px_4px_oklch(0.4_0.1_30/0.3)_inset]",
                    reveal && !isPicked && !isAnswer && "border border-border/30 bg-transparent opacity-50 shadow-none"
                  )}
                >
                  <span
                    className={cn(
                      "gloss relative flex h-8 w-8 shrink-0 items-center justify-center rounded-lg font-display text-xs font-bold",
                      reveal && isAnswer
                        ? "border border-black/30 bg-[oklch(0.97_0.01_88)] text-foreground shadow-[0_1px_0_oklch(1_0_0/80%)_inset,0_1px_2px_oklch(0.4_0.07_65/0.4)]"
                        : reveal && isPicked
                          ? "deboss text-destructive"
                          : "deboss text-primary"
                    )}
                  >
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className="flex-1">{opt}</span>
                  {reveal && isAnswer && <CheckCircle2 className="h-5 w-5 shrink-0" aria-hidden />}
                  {reveal && isPicked && !isAnswer && (
                    <XCircle className="h-5 w-5 shrink-0" aria-hidden />
                  )}
                </button>
              );
            })}
          </div>

          {picked !== null && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="deboss mt-5 rounded-xl p-4"
            >
              <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
                <Trophy className="h-3.5 w-3.5 text-brass-deep" aria-hidden />
                {picked === q.answer ? "Correct" : "Explanation"}
              </p>
              <p className="mt-1.5 text-sm font-semibold leading-6 text-foreground/85">{q.explanation}</p>
              <button
                onClick={advance}
                className="btn3d btn-leather gloss mt-4 inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl px-6 text-sm font-bold sm:w-auto"
              >
                {current + 1 < total ? "Next question" : "See results"}
                <ArrowRight className="h-4 w-4" aria-hidden />
              </button>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
