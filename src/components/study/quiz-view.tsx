"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Dumbbell,
  Eye,
  EyeOff,
  Lightbulb,
  RotateCcw,
  Target,
  TerminalSquare,
  Trophy,
  XCircle,
} from "lucide-react";
import type {
  Manifest,
  QuizModule,
  QuizAnswerRecord,
  QuizResult,
  Exercise,
} from "@/lib/types";
import { useStudyStore } from "@/lib/store";
import { saveQuizResultApi } from "@/lib/api-client";
import { ProgressGauge } from "./progress-gauge";
import { cn } from "@/lib/utils";

const DIFFICULTY_STYLES: Record<Exercise["difficulty"], string> = {
  easy: "border-pen-green/40 text-pen-green",
  medium: "border-pen-amber/50 text-pen-amber",
  hard: "border-pen-red/40 text-pen-red",
};

export function QuizView({
  manifest,
  quizzes,
  exercises,
}: {
  manifest: Manifest;
  quizzes: QuizModule[];
  exercises: Exercise[];
}) {
  const quizResults = useStudyStore((s) => s.quizResults);
  const activeQuiz = useStudyStore((s) => s.activeQuiz);
  const setActiveQuiz = useStudyStore((s) => s.setActiveQuiz);
  const [mode, setMode] = useState<"quiz" | "practice">("quiz");

  const quiz = quizzes.find((q) => q.moduleId === activeQuiz) ?? null;
  if (quiz) {
    return <QuizRunner key={quiz.moduleId} quiz={quiz} />;
  }

  return (
    <div className="space-y-5 pt-2 sm:space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
            Knowledge check
          </h1>
          <p className="mt-1 text-[13px] font-semibold text-pencil sm:text-sm">
            Quizzes and coding exercises per module — see how much sticks after each chapter.
          </p>
        </div>

        {/* mode switch — paper tabs */}
        <div className="chip inline-flex rounded-full p-1" role="tablist" aria-label="Practice mode">
          <button
            role="tab"
            aria-selected={mode === "quiz"}
            onClick={() => setMode("quiz")}
            className={cn(
              "btn3d inline-flex min-h-[38px] items-center gap-1.5 rounded-full px-4 text-sm font-bold",
              mode === "quiz" ? "btn-pressed" : "text-pencil hover:text-foreground"
            )}
          >
            <Target className="h-4 w-4" aria-hidden />
            Quiz
          </button>
          <button
            role="tab"
            aria-selected={mode === "practice"}
            onClick={() => setMode("practice")}
            className={cn(
              "btn3d inline-flex min-h-[38px] items-center gap-1.5 rounded-full px-4 text-sm font-bold",
              mode === "practice" ? "btn-pressed" : "text-pencil hover:text-foreground"
            )}
          >
            <Dumbbell className="h-4 w-4" aria-hidden />
            Exercises
          </button>
        </div>
      </div>

      {mode === "quiz" ? (
        <QuizList quizzes={quizzes} manifest={manifest} results={quizResults} />
      ) : (
        <ExerciseList exercises={exercises} />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Quiz list — responsive paper cards                                  */
/* ------------------------------------------------------------------ */

function QuizList({
  quizzes,
  manifest,
  results,
}: {
  quizzes: QuizModule[];
  manifest: Manifest;
  results: Record<string, QuizResult>;
}) {
  const setActiveQuiz = useStudyStore((s) => s.setActiveQuiz);

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
      {quizzes.map((q) => {
        const result = results[q.moduleId] as QuizResult | undefined;
        const pct = result ? Math.round((result.score / result.total) * 100) : null;
        const mod = manifest.modules.find((m) => m.id === q.moduleId);
        return (
          <button
            key={q.moduleId}
            onClick={() => setActiveQuiz(q.moduleId)}
            className="sheet btn3d flex w-full flex-col gap-3 rounded-2xl p-4 text-left sm:flex-row sm:items-center sm:justify-between sm:p-5"
          >
            <div className="min-w-0 flex-1">
              <p className="line-clamp-2 font-display text-sm font-bold leading-snug sm:text-[15px]">
                {q.title}
              </p>
              <p className="mt-1 text-[11px] font-semibold text-pencil sm:text-xs">
                {q.questions.length} questions
                {mod ? ` · Days ${mod.days[0]}–${mod.days[1]}` : ""}
              </p>
              {result && (
                <p className="mt-2 text-[10px] font-bold uppercase tracking-wider text-pencil sm:mt-3 sm:text-[11px]">
                  Best score {result.score}/{result.total}
                </p>
              )}
            </div>
            <span className="shrink-0 self-start sm:self-center">
              {pct !== null ? (
                <span className="inline-flex items-center gap-1 rounded-full border border-pen-green/40 bg-pen-green/10 px-2.5 py-1 text-[11px] font-bold text-pen-green sm:text-xs">
                  <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
                  {pct}%
                </span>
              ) : (
                <span className="chip inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold text-pencil sm:text-xs">
                  <Target className="h-3.5 w-3.5" aria-hidden />
                  Start
                </span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Exercise list — coding tasks solved in the Code Lab                 */
/* ------------------------------------------------------------------ */

function ExerciseList({ exercises }: { exercises: Exercise[] }) {
  const queueLabCode = useStudyStore((s) => s.queueLabCode);
  const setView = useStudyStore((s) => s.setView);
  const [openHint, setOpenHint] = useState<string | null>(null);
  const [openSolution, setOpenSolution] = useState<string | null>(null);

  const openInLab = (code: string) => {
    queueLabCode(code);
    setView("lab");
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      {exercises.map((ex) => (
        <div key={ex.id} className="sheet space-y-3 rounded-2xl p-4 sm:p-5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="chip rounded-full px-2.5 py-1 text-[10px] font-bold text-pencil">
              Day {ex.day}
            </span>
            <span
              className={cn(
                "rounded-full border bg-card px-2.5 py-1 text-[10px] font-bold capitalize",
                DIFFICULTY_STYLES[ex.difficulty]
              )}
            >
              {ex.difficulty}
            </span>
            <h3 className="min-w-0 flex-1 font-display text-[15px] font-bold leading-snug sm:text-base">
              {ex.title}
            </h3>
          </div>

          <p className="text-[13px] font-semibold leading-6 text-foreground/85 sm:text-sm">
            {ex.task}
          </p>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-ink/15 bg-grid-paper p-3">
              <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-pencil">
                Starter code
              </p>
              <pre className="overflow-x-auto scroll-slim whitespace-pre font-mono text-xs leading-5 text-foreground/90">
                {ex.starterCode}
              </pre>
            </div>
            <div className="rounded-xl border border-ink/15 bg-paper-cream p-3">
              <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-pencil">
                Expected output
              </p>
              <pre className="whitespace-pre-wrap break-words font-mono text-xs leading-5 text-pen-blue">
                {ex.expectedOutput}
              </pre>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => openInLab(ex.starterCode)}
              className="btn3d btn-ink inline-flex min-h-[40px] items-center gap-2 rounded-xl px-4 text-sm font-bold"
            >
              <TerminalSquare className="h-4 w-4" aria-hidden />
              Open in Code Lab
            </button>
            <button
              onClick={() => setOpenHint(openHint === ex.id ? null : ex.id)}
              aria-expanded={openHint === ex.id}
              className="btn3d btn-paper inline-flex min-h-[40px] items-center gap-1.5 rounded-xl px-3.5 text-sm font-bold"
            >
              <Lightbulb className="h-4 w-4 text-pen-amber" aria-hidden />
              Hint
            </button>
            <button
              onClick={() => setOpenSolution(openSolution === ex.id ? null : ex.id)}
              aria-expanded={openSolution === ex.id}
              className="btn3d btn-paper inline-flex min-h-[40px] items-center gap-1.5 rounded-xl px-3.5 text-sm font-bold"
            >
              {openSolution === ex.id ? (
                <EyeOff className="h-4 w-4 text-pencil" aria-hidden />
              ) : (
                <Eye className="h-4 w-4 text-pencil" aria-hidden />
              )}
              Solution
            </button>
          </div>

          <AnimatePresence>
            {openHint === ex.id && (
              <motion.div
                key="hint"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="rounded-xl border border-pen-amber/40 bg-pen-amber/10 p-3 text-[13px] font-semibold text-foreground/85">
                  <span className="hand mr-2 text-xl leading-none text-pen-amber">Hint:</span>
                  {ex.hint}
                </div>
              </motion.div>
            )}
            {openSolution === ex.id && (
              <motion.div
                key="solution"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <pre className="overflow-x-auto scroll-slim whitespace-pre rounded-xl border border-pen-green/40 bg-pen-green/10 p-3 font-mono text-xs leading-5 text-foreground/90">
                  {ex.solution}
                </pre>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Quiz runner                                                         */
/* ------------------------------------------------------------------ */

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
        className="flex w-full min-w-0 flex-col items-center py-6 text-center sm:py-10"
      >
        <div className="sheet relative w-full max-w-md rounded-[22px] p-6 sm:p-10">
          <span className="washi" aria-hidden />
          <div className="relative flex min-w-0 flex-col items-center">
            <ProgressGauge value={pct} tone="paper" className="h-28 w-28 sm:h-36 sm:w-36" />
            <p className={cn("hand mt-3 text-3xl leading-none", passed ? "text-pen-green" : "text-pen-red")}>
              {passed ? "Nice work!" : "So close!"}
            </p>
            <h1 className="mt-1.5 font-display text-xl font-bold sm:text-2xl">
              {score}/{total} correct
            </h1>
            <p className="mx-auto mt-1.5 max-w-xs text-[13px] font-semibold text-pencil sm:text-sm">
              {passed
                ? "That module is sinking in — keep the momentum."
                : "Skim the module lessons and try again."}
            </p>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5 sm:mt-6 sm:gap-3">
              <button
                onClick={restart}
                className="btn3d btn-ink inline-flex min-h-[44px] items-center gap-2 rounded-xl px-5 text-sm font-bold"
              >
                <RotateCcw className="h-4 w-4" aria-hidden />
                Retake
              </button>
              <button
                onClick={() => setActiveQuiz(null)}
                className="btn3d btn-paper inline-flex min-h-[44px] items-center gap-2 rounded-xl px-5 text-sm font-bold"
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
    <div className="mx-auto min-w-0 max-w-2xl space-y-4 pt-2 sm:space-y-5">
      <button
        onClick={() => setActiveQuiz(null)}
        className="btn3d btn-paper inline-flex min-h-[40px] items-center gap-1.5 rounded-lg px-3 text-sm font-bold"
      >
        <ArrowLeft className="h-4 w-4 text-pen-blue" aria-hidden />
        All quizzes
      </button>

      {/* question progress */}
      <div>
        <div className="flex items-center justify-between gap-2 text-[11px] font-bold uppercase tracking-wider text-pencil sm:text-xs">
          <span>
            Question {current + 1} of {total}
          </span>
          <span className="tabular-nums normal-case">{score} correct so far</span>
        </div>
        <div className="chip mt-2 h-3 overflow-hidden rounded-full p-[2px]">
          <div
            className="h-full rounded-full bg-pen-blue shadow-[0_1px_1px_oklch(0.15_0.05_265/0.5)] transition-all duration-300"
            style={{ width: `${((current + (picked !== null ? 1 : 0)) / total) * 100}%` }}
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={q.id}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.2 }}
          className="sheet min-w-0 rounded-2xl p-4 sm:p-7"
        >
          <h2 className="font-display text-[15.5px] font-bold leading-snug sm:text-lg">
            {q.prompt}
          </h2>
          <div className="mt-3.5 space-y-2.5 sm:mt-5 sm:space-y-3" role="radiogroup" aria-label="Answer options">
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
                    "btn3d flex min-h-[48px] w-full items-center gap-2.5 rounded-xl px-3 py-3 text-left text-[13px] font-bold transition-all sm:min-h-[52px] sm:gap-3 sm:px-4 sm:py-3.5 sm:text-sm",
                    !reveal && "btn-paper",
                    reveal && isAnswer &&
                      "border border-pen-green bg-pen-green/10 text-foreground shadow-[0_2px_4px_oklch(0.55_0.12_155/0.2)_inset]",
                    reveal && isPicked && !isAnswer &&
                      "border border-pen-red bg-pen-red/10 text-foreground shadow-[0_2px_4px_oklch(0.55_0.19_25/0.2)_inset]",
                    reveal && !isPicked && !isAnswer &&
                      "border border-ink/10 bg-transparent opacity-50 shadow-none"
                  )}
                >
                  <span
                    className={cn(
                      "relative flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border font-display text-[11px] font-bold sm:h-8 sm:w-8 sm:text-xs",
                      reveal && isAnswer
                        ? "border-pen-green bg-card text-pen-green"
                        : reveal && isPicked && !isAnswer
                          ? "border-pen-red bg-card text-pen-red"
                          : "chip text-pen-blue"
                    )}
                  >
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className="min-w-0 flex-1 break-words">{opt}</span>
                  {reveal && isAnswer && (
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-pen-green" aria-hidden />
                  )}
                  {reveal && isPicked && !isAnswer && (
                    <XCircle className="h-5 w-5 shrink-0 text-pen-red" aria-hidden />
                  )}
                </button>
              );
            })}
          </div>

          {picked !== null && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 rounded-xl border border-ink/15 bg-paper-cream p-3.5 sm:mt-5 sm:p-4"
            >
              <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-pencil sm:text-xs">
                <Trophy className="h-3.5 w-3.5 text-pen-amber" aria-hidden />
                {picked === q.answer ? "Correct" : "Explanation"}
              </p>
              <p className="mt-1.5 break-words text-[13px] font-semibold leading-6 text-foreground/85 sm:text-sm">
                {q.explanation}
              </p>
              <button
                onClick={advance}
                className="btn3d btn-ink mt-3.5 inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl px-6 text-sm font-bold sm:mt-4 sm:w-auto"
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
