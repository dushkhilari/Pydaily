import fs from "node:fs";
import path from "node:path";
import type { LessonDetail, Manifest } from "./types";

/**
 * Server-only content access layer.
 * Reads lesson Markdown / Python code straight from the `content/` tree
 * produced by `scripts/sync-content.mjs` — nothing is stored in the DB.
 */

const LESSONS_DIR = path.join(process.cwd(), "content", "lessons");

let manifestCache: Manifest | null = null;

export function getManifest(): Manifest {
  if (manifestCache) return manifestCache;
  const raw = fs.readFileSync(path.join(LESSONS_DIR, "index.json"), "utf8");
  manifestCache = JSON.parse(raw) as Manifest;
  return manifestCache;
}

const safeSlug = (slug: string) => slug.replace(/[^a-z0-9-]/gi, "");

export function getLesson(slug: string): LessonDetail | null {
  const dir = path.join(LESSONS_DIR, safeSlug(slug));
  const metaPath = path.join(dir, "meta.json");
  if (!fs.existsSync(metaPath)) return null;

  const meta = JSON.parse(fs.readFileSync(metaPath, "utf8")) as LessonDetail["meta"];

  const sections = meta.sections.map((s) => ({
    ...s,
    markdown: fs.readFileSync(path.join(dir, "tutorial", s.file), "utf8"),
  }));

  const code = meta.code.map((c) => ({
    ...c,
    code: fs.readFileSync(path.join(dir, "code", c.file), "utf8"),
  }));

  return { meta, sections, code, videoUrl: meta.videoUrl ?? null };
}

export function getQuizzes(): unknown {
  const p = path.join(process.cwd(), "content", "quizzes.json");
  if (!fs.existsSync(p)) return [];
  return JSON.parse(fs.readFileSync(p, "utf8"));
}
