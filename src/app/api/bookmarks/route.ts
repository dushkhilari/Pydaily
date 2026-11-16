import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getUserKey, unauthorized } from "@/lib/user-auth";

interface BookmarkBody {
  slug?: string;
}

/** Add a bookmark. */
export async function POST(req: NextRequest) {
  const userKey = getUserKey(req);
  if (!userKey) return unauthorized();

  let body: BookmarkBody;
  try {
    body = (await req.json()) as BookmarkBody;
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.slug) {
    return Response.json({ error: "slug is required" }, { status: 400 });
  }

  const bookmark = await db.bookmark.upsert({
    where: { userKey_lessonSlug: { userKey, lessonSlug: body.slug } },
    create: { userKey, lessonSlug: body.slug },
    update: {},
  });

  return Response.json({ slug: bookmark.lessonSlug, createdAt: bookmark.createdAt.toISOString() });
}

/** Remove a bookmark. */
export async function DELETE(req: NextRequest) {
  const userKey = getUserKey(req);
  if (!userKey) return unauthorized();

  const slug = req.nextUrl.searchParams.get("slug");
  if (!slug) {
    return Response.json({ error: "slug query param is required" }, { status: 400 });
  }

  await db.bookmark.deleteMany({ where: { userKey, lessonSlug: slug } });
  return Response.json({ ok: true });
}
