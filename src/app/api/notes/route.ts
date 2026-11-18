import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getUserKey, unauthorized } from "@/lib/user-auth";

interface NoteBody {
  slug?: string;
  content?: string;
}

/** Create or update the note for a lesson. */
export async function PUT(req: NextRequest) {
  const userKey = getUserKey(req);
  if (!userKey) return unauthorized();

  let body: NoteBody;
  try {
    body = (await req.json()) as NoteBody;
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { slug, content } = body;
  if (!slug || typeof content !== "string") {
    return Response.json({ error: "slug and content are required" }, { status: 400 });
  }
  if (content.length > 20000) {
    return Response.json({ error: "Note too long (max 20000 chars)" }, { status: 400 });
  }

  const note = await db.note.upsert({
    where: { userKey_lessonSlug: { userKey, lessonSlug: slug } },
    create: { userKey, lessonSlug: slug, content },
    update: { content },
  });

  return Response.json({ slug: note.lessonSlug, content: note.content, updatedAt: note.updatedAt.toISOString() });
}

/** Read notes (optionally for one lesson). */
export async function GET(req: NextRequest) {
  const userKey = getUserKey(req);
  if (!userKey) return unauthorized();

  const slug = req.nextUrl.searchParams.get("slug");
  const notes = await db.note.findMany({
    where: { userKey, ...(slug ? { lessonSlug: slug } : {}) },
  });

  const noteMap: Record<string, string> = {};
  for (const n of notes) noteMap[n.lessonSlug] = n.content;
  return Response.json({ notes: noteMap });
}
