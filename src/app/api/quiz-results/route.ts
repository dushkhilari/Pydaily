import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getUserKey, unauthorized } from "@/lib/user-auth";

interface QuizBody {
  quizId?: string;
  score?: number;
  total?: number;
  details?: { questionId: string; answer: number; correct: boolean }[];
}

/** Save a quiz attempt. */
export async function POST(req: NextRequest) {
  const userKey = getUserKey(req);
  if (!userKey) return unauthorized();

  let body: QuizBody;
  try {
    body = (await req.json()) as QuizBody;
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { quizId, score, total, details } = body;
  if (!quizId || typeof score !== "number" || typeof total !== "number" || !Array.isArray(details)) {
    return Response.json({ error: "quizId, score, total and details are required" }, { status: 400 });
  }
  if (total <= 0 || score < 0 || score > total) {
    return Response.json({ error: "Invalid score/total" }, { status: 400 });
  }

  const result = await db.quizResult.create({
    data: {
      userKey,
      quizId,
      score,
      total,
      details: JSON.stringify(details.slice(0, 100)),
    },
  });

  return Response.json({
    quizId: result.quizId,
    score: result.score,
    total: result.total,
    completedAt: result.completedAt.toISOString(),
  });
}

/** List previous attempts (newest first). */
export async function GET(req: NextRequest) {
  const userKey = getUserKey(req);
  if (!userKey) return unauthorized();

  const results = await db.quizResult.findMany({
    where: { userKey },
    orderBy: { completedAt: "desc" },
    take: 100,
  });

  return Response.json({
    results: results.map((r) => ({
      quizId: r.quizId,
      score: r.score,
      total: r.total,
      details: JSON.parse(r.details || "[]"),
      completedAt: r.completedAt.toISOString(),
    })),
  });
}
