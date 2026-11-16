import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getUserKey, unauthorized } from "@/lib/user-auth";

interface VisitBody {
  slug?: string;
}

/** Track a lesson visit (increments counter, refreshes lastVisitedAt). */
export async function POST(req: NextRequest) {
  const userKey = getUserKey(req);
  if (!userKey) return unauthorized();

  let body: VisitBody;
  try {
    body = (await req.json()) as VisitBody;
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const slug = body.slug;
  if (!slug) {
    return Response.json({ error: "slug is required" }, { status: 400 });
  }

  const existing = await db.lessonProgress.findUnique({
    where: { userKey_lessonSlug: { userKey, lessonSlug: slug } },
  });

  const entry = await db.lessonProgress.upsert({
    where: { userKey_lessonSlug: { userKey, lessonSlug: slug } },
    create: { userKey, lessonSlug: slug, visits: 1 },
    update: {
      visits: (existing?.visits ?? 0) + 1,
      lastVisitedAt: new Date(),
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
