import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getUserKey, unauthorized } from "@/lib/user-auth";

interface MarkBody {
  slug?: string;
  completed?: boolean;
}

/** Mark a lesson complete / incomplete. */
export async function POST(req: NextRequest) {
  const userKey = getUserKey(req);
  if (!userKey) return unauthorized();

  let body: MarkBody;
  try {
    body = (await req.json()) as MarkBody;
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { slug, completed } = body;
  if (!slug || typeof completed !== "boolean") {
    return Response.json({ error: "slug and completed are required" }, { status: 400 });
  }

  const existing = await db.lessonProgress.findUnique({
    where: { userKey_lessonSlug: { userKey, lessonSlug: slug } },
  });

  const entry = await db.lessonProgress.upsert({
    where: { userKey_lessonSlug: { userKey, lessonSlug: slug } },
    create: {
      userKey,
      lessonSlug: slug,
      completed,
      completedAt: completed ? new Date() : null,
    },
    update: {
      completed,
      completedAt: completed ? (existing?.completedAt ?? new Date()) : null,
    },
  });

  return Response.json({
    lessonSlug: entry.lessonSlug,
    completed: entry.completed,
    visits: entry.visits,
    lastVisitedAt: entry.lastVisitedAt.toISOString(),
    completedAt: entry.completedAt ? entry.completedAt.toISOString() : null,
  });
}
