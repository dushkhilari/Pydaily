import { getLesson } from "@/lib/content";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const lesson = getLesson(slug);
  if (!lesson) {
    return Response.json({ error: "Lesson not found" }, { status: 404 });
  }
  return Response.json(lesson);
}
