import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getUserKey, unauthorized } from "@/lib/user-auth";

/** Aggregated bootstrap endpoint: progress + bookmarks + notes + quiz results. */
export async function GET(req: NextRequest) {
  const userKey = getUserKey(req);
  if (!userKey) return unauthorized();

  const [progress, bookmarks, notes, quizResults] = await Promise.all([
    db.lessonProgress.findMany({ where: { userKey } }),
    db.bookmark.findMany({ where: { userKey }, orderBy: { createdAt: "desc" } }),
    db.note.findMany({ where: { userKey } }),
    db.quizResult.findMany({ where: { userKey }, orderBy: { completedAt: "desc" } }),
  ]);

  const progressMap: Record<string, unknown> = {};
  for (const p of progress) {
    progressMap[p.lessonSlug] = {
      lessonSlug: p.lessonSlug,
      completed: p.completed,
      visits: p.visits,
      lastVisitedAt: p.lastVisitedAt.toISOString(),
      completedAt: p.completedAt ? p.completedAt.toISOString() : null,
    };
  }

  const bookmarkMap: Record<string, string> = {};
  for (const b of bookmarks) {
    bookmarkMap[b.lessonSlug] = b.createdAt.toISOString();
  }

  const noteMap: Record<string, string> = {};
  for (const n of notes) {
    noteMap[n.lessonSlug] = n.content;
  }

  // keep only the best attempt per quiz (client applies the same rule)
  const quizMap: Record<string, unknown> = {};
  for (const q of quizResults) {
    if (!quizMap[q.quizId]) {
      quizMap[q.quizId] = {
        quizId: q.quizId,
        score: q.score,
        total: q.total,
        details: JSON.parse(q.details || "[]"),
        completedAt: q.completedAt.toISOString(),
      };
    }
  }

  return Response.json({
    progress: progressMap,
    bookmarks: bookmarkMap,
    notes: noteMap,
    quizResults: quizMap,
  });
}
