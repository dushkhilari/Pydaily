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
import { SOFT_CLS } from "@/lib/accents";
import { cn } from "@/lib/utils";

/** Neo tile colours for the A/B/C/D option keys, cycled per option. */
const OPTION_TILE = [
  "bg-nb-red text-white dark:text-[#1a1108]",
  "bg-nb-purple text-[#17110a]",
  "bg-nb-teal text-[#0c2725]",
  "bg-nb-yellow text-[#17110a]",
];

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
    <div className="space-y-4 pt-2 sm:space-y-6">
      <div className="space-y-3 sm:flex sm:flex-wrap sm:items-center sm:justify-between sm:gap-3">
        <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">Practice</h1>

        {/* mode switch — segmented tabs */}
        <div className="neo-seg w-full sm:w-auto" role="tablist" aria-label="Practice mode">
          <button
            role="tab"
            aria-selected={mode === "quiz"}
            data-active={mode === "quiz"}
            onClick={() => setMode("quiz")}
            className="neo-seg-item flex-1 text-sm sm:flex-none"
          >
            <Target className="h-4 w-4" aria-hidden />
            Quiz
          </button>
          <button
            role="tab"
            aria-selected={mode === "practice"}
            data-active={mode === "practice"}
            onClick={() => setMode("practice")}
            className="neo-seg-item flex-1 text-sm sm:flex-none"
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
/* Quiz list                                                           */
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
            className="neo-card-sm flex w-full items-center gap-3 p-4 text-left transition-transform hover:scale-[1.01] sm:gap-4"
          >
            <span className="neo-tile h-11 w-11 shrink-0 bg-nb-purple">
              <Target className="h-5 w-5 text-[#17110a]" aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <p className="line-clamp-2 font-display text-sm font-bold leading-snug sm:text-[15px]">
                {q.title}
              </p>
              <p className="mt-1 text-[11px] font-bold text-nb-muted sm:text-xs">
                {q.questions.length} questions{mod ? ` · Days ${mod.days[0]}–${mod.days[1]}` : ""}
              </p>
            </div>
            {pct !== null ? (
              <span className="neo-chip shrink-0 bg-nb-green px-2.5 py-1 text-[11px] text-[#0b2a17]">
                <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
                {pct}%
              </span>
            ) : (
              <span className="neo-chip shrink-0 bg-nb-yellow px-2.5 py-1 text-[11px] text-[#17110a]">
                Start
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Exercise list                                                       */
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

  const DIFF: Record<Exercise["difficulty"], string> = {
    easy: SOFT_CLS.green,
    medium: SOFT_CLS.orange,
    hard: SOFT_CLS.red,
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      {exercises.map((ex) => (
        <div key={ex.id} className="neo-card-sm space-y-3 p-4 sm:p-5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="neo-chip px-2.5 py-1 text-[10px]">Day {ex.day}</span>
            <span
              className={cn(
                "neo-chip px-2.5 py-1 text-[10px] capitalize",
                DIFF[ex.difficulty]
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

          <div className="grid gap-3 lg:grid-cols-2">
            <div className="neo-inset overflow-hidden bg-nb-code shadow-hard-xs">
              <p className="border-b-2 border-nb-border bg-nb-code-deep px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-nb-muted">
                Starter code
              </p>
              <pre className="overflow-x-auto scroll-slim whitespace-pre px-3 py-2.5 font-mono text-xs leading-5 text-[#f2e9d8]">
                {ex.starterCode}
              </pre>
            </div>
            <div className="neo-inset overflow-hidden shadow-hard-xs">
              <p className="border-b-2 border-nb-border bg-nb-teal px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#0c2725]">
                Expected output
              </p>
              <pre className="overflow-x-auto scroll-slim whitespace-pre-wrap break-words px-3 py-2.5 font-mono text-xs leading-5 text-foreground/90">
                {ex.expectedOutput}
              </pre>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => openInLab(ex.starterCode)}
              className="neo-btn neo-btn-red min-h-[40px] gap-2 rounded-xl px-4 text-sm"
            >
              <TerminalSquare className="h-4 w-4" aria-hidden />
              Open in Code Lab
            </button>
            <button
              onClick={() => setOpenHint(openHint === ex.id ? null : ex.id)}
              aria-expanded={openHint === ex.id}
              className={cn(
                "neo-btn min-h-[40px] gap-1.5 rounded-xl px-3.5 text-sm",
                openHint === ex.id ? "bg-nb-yellow text-[#17110a]" : ""
              )}
            >
              <Lightbulb className="h-4 w-4" aria-hidden />
              Hint
            </button>
            <button
              onClick={() => setOpenSolution(openSolution === ex.id ? null : ex.id)}
              aria-expanded={openSolution === ex.id}
              className="neo-btn min-h-[40px] gap-1.5 rounded-xl px-3.5 text-sm"
            >
              {openSolution === ex.id ? (
                <EyeOff className="h-4 w-4" aria-hidden />
              ) : (
                <Eye className="h-4 w-4" aria-hidden />
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
                <div className="neo-inset bg-nb-yellow/25 p-3 text-[13px] font-semibold text-foreground/90">
                  <span className="mr-2 font-display font-bold text-[#7a5b00] dark:text-nb-yellow">Hint:</span>
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
                <pre className="neo-inset overflow-x-auto scroll-slim whitespace-pre bg-nb-code p-3 font-mono text-xs leading-5 text-[#f2e9d8]">
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
        <div className="neo-card w-full max-w-md p-6 sm:p-9">
          <div className="flex min-w-0 flex-col items-center">
            <ProgressGauge value={pct} className="h-28 w-28 sm:h-36 sm:w-36" />
            <p
              className={cn(
                "neo-chip mt-4 -rotate-1 px-4 py-1.5 font-display text-base",
                passed ? "bg-nb-green text-[#0b2a17]" : "bg-nb-red text-white dark:text-[#1a1108]"
              )}
            >
              {passed ? "Nice work!" : "So close!"}
            </p>
            <h1 className="mt-2 font-display text-xl font-bold sm:text-2xl">
              {score}/{total} correct
            </h1>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5 sm:mt-6 sm:gap-3">
              <button
                onClick={restart}
                className="neo-btn neo-btn-red min-h-[44px] gap-2 rounded-xl px-5 text-sm"
              >
                <RotateCcw className="h-4 w-4" aria-hidden />
                Retake
              </button>
              <button
                onClick={() => setActiveQuiz(null)}
                className="neo-btn min-h-[44px] rounded-xl px-5 text-sm"
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
        className="neo-btn min-h-[40px] gap-1.5 rounded-lg px-3 text-sm"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        All quizzes
      </button>

      {/* question progress */}
      <div>
        <div className="flex items-center justify-between gap-2 text-[11px] font-bold uppercase tracking-wider text-nb-muted sm:text-xs">
          <span>
            Question {current + 1} of {total}
          </span>
          <span className="tabular-nums normal-case">{score} correct</span>
        </div>
        <div className="neo-bar mt-2">
          <div
            className="neo-bar-fill bg-nb-purple"
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
          className="neo-card min-w-0 p-4 sm:p-6"
        >
          <h2 className="font-display text-[16px] font-bold leading-snug sm:text-lg">
            {q.prompt}
          </h2>
          <div className="mt-4 space-y-2.5 sm:space-y-3" role="radiogroup" aria-label="Answer options">
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
                    "flex min-h-[50px] w-full items-center gap-2.5 rounded-xl border-[3px] px-3 py-2.5 text-left text-[13px] font-bold transition-all sm:min-h-[54px] sm:gap-3 sm:px-4 sm:text-sm",
                    !reveal &&
                      "border-nb-border bg-nb-card shadow-hard-xs hover:-translate-y-px hover:shadow-hard-sm",
                    reveal && isAnswer && "border-nb-green bg-nb-green/15",
                    reveal && isPicked && !isAnswer && "border-nb-red bg-nb-red/15",
                    reveal && !isPicked && !isAnswer && "border-border/30 bg-transparent opacity-50 shadow-none"
                  )}
                >
                  <span
                    className={cn(
                      "neo-tile h-8 w-8 font-display text-xs",
                      reveal && isAnswer
                        ? "border-nb-green bg-nb-green text-[#0b2a17]"
                        : reveal && isPicked && !isAnswer
                          ? "border-nb-red bg-nb-red text-white dark:text-[#1a1108]"
                          : OPTION_TILE[idx % OPTION_TILE.length]
                    )}
                  >
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className="min-w-0 flex-1 break-words">{opt}</span>
                  {reveal && isAnswer && (
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-nb-green" aria-hidden />
                  )}
                  {reveal && isPicked && !isAnswer && (
                    <XCircle className="h-5 w-5 shrink-0 text-nb-red" aria-hidden />
                  )}
                </button>
              );
            })}
          </div>

          {picked !== null && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="neo-inset mt-4 bg-nb-yellow/20 p-3.5 sm:mt-5 sm:p-4"
            >
              <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-nb-muted">
                <Trophy className="h-3.5 w-3.5 text-nb-orange" aria-hidden />
                {picked === q.answer ? "Correct" : "Explanation"}
              </p>
              <p className="mt-1.5 break-words text-[13px] font-semibold leading-6 text-foreground/90 sm:text-sm">
                {q.explanation}
              </p>
              <button
                onClick={advance}
                className="neo-btn neo-btn-red mt-3.5 inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl px-6 text-sm sm:mt-4 sm:w-auto"
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
