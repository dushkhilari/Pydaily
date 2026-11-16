/**
 * Content sync pipeline for the Python study site.
 *
 * Reads the cloned course repo (/tmp/Learn_Python) and produces a normalized
 * content tree + manifest under `content/`:
 *
 *   content/
 *     lessons/
 *       index.json                      <- manifest of all days + modules
 *       day-01-intro-to-python/
 *         meta.json
 *         tutorial/01-*.md ...          <- raw markdown lesson parts
 *         code/main.py ...              <- raw python code files
 *
 * Usage: bun scripts/sync-content.mjs [--src /tmp/Learn_Python]
 */
import fs from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
const srcIdx = args.indexOf("--src");
const SRC = srcIdx !== -1 ? args[srcIdx + 1] : "/tmp/Learn_Python";
const ROOT = process.cwd();
const DEST = path.join(ROOT, "content");
const LESSONS_DIR = path.join(DEST, "lessons");

/* ------------------------------------------------------------------ */
/* Module grouping (6 modules across the 100 days)                     */
/* ------------------------------------------------------------------ */
const MODULES = [
  {
    id: "getting-started",
    title: "Getting Started",
    subtitle: "Setup, first programs & the Python mindset",
    from: 1,
    to: 8,
    icon: "rocket",
    accent: "amber",
  },
  {
    id: "language-basics",
    title: "Language Basics",
    subtitle: "Types, strings, input & control flow",
    from: 9,
    to: 19,
    icon: "code",
    accent: "orange",
  },
  {
    id: "functions-collections",
    title: "Functions & Collections",
    subtitle: "Functions, lists, tuples, sets & dictionaries",
    from: 20,
    to: 35,
    icon: "layers",
    accent: "amber",
  },
  {
    id: "errors-files-functional",
    title: "Errors, Files & Functional Tools",
    subtitle: "Exception handling, file I/O, lambda, map/filter",
    from: 36,
    to: 55,
    icon: "shield",
    accent: "orange",
  },
  {
    id: "oop",
    title: "Object-Oriented Python",
    subtitle: "Classes, inheritance, dunder methods & more",
    from: 56,
    to: 83,
    icon: "boxes",
    accent: "amber",
  },
  {
    id: "advanced",
    title: "Advanced Python",
    subtitle: "Time, regex, asyncio, threading & multiprocessing",
    from: 84,
    to: 100,
    icon: "zap",
    accent: "orange",
  },
];

function moduleForDay(day) {
  return MODULES.find((m) => day >= m.from && day <= m.to) ?? MODULES[MODULES.length - 1];
}

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */
const slugify = (s) =>
  s
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

/** Folder names look like "07-Day7-Exercise-1-Create-a-Calculator" */
function parseFolderName(name) {
  const match = name.match(/^(\d+)-(.*)$/);
  if (!match) return null;
  const day = parseInt(match[1], 10);
  let topic = match[2];
  // strip the redundant "Day7" / "Day-16" segment right after the number
  topic = topic.replace(/^Day-?\d+-?/i, "");
  return { day, topic };
}

function detectType(day, folderName) {
  const n = folderName.toLowerCase();
  if (day === 100) return "conclusion";
  if (n.includes("solution")) return "solution";
  if (n.includes("exercise")) return "exercise";
  return "lesson";
}

const TITLE_PREFIX = /^day\s*[-–]?\s*\d+\s*[-–:]?\s*/i;

/** Extract a clean title from the first markdown file's leading H1 */
function titleFromMarkdown(mdFiles) {
  for (const f of mdFiles) {
    const text = fs.readFileSync(f.path, "utf8");
    const h1 = text.split("\n").find((l) => l.trim().startsWith("# "));
    if (h1) {
      let t = h1.replace(/^#+\s*/, "").trim();
      t = t.replace(/\[([^\]]+)\]\([^)]*\)/g, "$1"); // unwrap links
      t = t.replace(TITLE_PREFIX, "").trim();
      if (t) return t;
    }
  }
  return null;
}

const prettyTopic = (topic) =>
  topic
    .split("-")
    .filter(Boolean)
    .map((w) => (/^\d+$/.test(w) ? w : w.charAt(0).toUpperCase() + w.slice(1)))
    .join(" ");

function estimateMinutes(words, codeLines) {
  return Math.max(4, Math.round(words / 45 + codeLines / 12));
}

function wordCount(mdFiles) {
  return mdFiles.reduce((acc, f) => acc + fs.readFileSync(f.path, "utf8").split(/\s+/).length, 0);
}

/* ------------------------------------------------------------------ */
/* Main sync                                                           */
/* ------------------------------------------------------------------ */
function main() {
  if (!fs.existsSync(SRC)) {
    console.error(`Source repo not found at ${SRC}. Clone it first or pass --src.`);
    process.exit(1);
  }

  fs.rmSync(LESSONS_DIR, { recursive: true, force: true });
  fs.mkdirSync(LESSONS_DIR, { recursive: true });

  const folders = fs
    .readdirSync(SRC, { withFileTypes: true })
    .filter((d) => d.isDirectory() && !d.name.startsWith("."))
    .map((d) => d.name)
    .filter((n) => parseFolderName(n) !== null)
    .sort((a, b) => {
      const da = parseFolderName(a).day;
      const db = parseFolderName(b).day;
      if (da !== db) return da - db;
      // prefer the canonical folder when duplicates like " (1)" exist
      return a.includes("(") ? 1 : -1;
    });

  const seenDays = new Set();
  const index = [];
  const skipped = [];

  for (const folder of folders) {
    const { day, topic } = parseFolderName(folder);
    if (folder.includes("(")) {
      skipped.push(folder);
      continue;
    }
    if (seenDays.has(day)) {
      skipped.push(folder);
      continue;
    }
    seenDays.add(day);

    const dayDir = path.join(SRC, folder);
    const tutorialDir = path.join(dayDir, ".tutorial");
    if (!fs.existsSync(tutorialDir)) {
      skipped.push(folder + " (no .tutorial)");
      continue;
    }

    // --- collect tutorial markdown files, sorted by their numeric prefix ---
    const mdFiles = fs
      .readdirSync(tutorialDir)
      .filter((f) => f.toLowerCase().endsWith(".md"))
      .sort((a, b) => {
        const na = parseInt(a.match(/^(\d+)/)?.[1] ?? "0", 10);
        const nb = parseInt(b.match(/^(\d+)/)?.[1] ?? "0", 10);
        return na - nb || a.localeCompare(b);
      })
      .map((f) => ({ name: f, path: path.join(tutorialDir, f) }));

    if (mdFiles.length === 0) {
      skipped.push(folder + " (no md)");
      continue;
    }

    // --- collect root-level python code files ---
    const pyFiles = fs
      .readdirSync(dayDir)
      .filter((f) => f.toLowerCase().endsWith(".py"))
      .sort()
      .map((f) => ({ name: f, path: path.join(dayDir, f) }));

    // --- video link ---
    let videoUrl = null;
    const videoJsonPath = path.join(tutorialDir, "video.json");
    if (fs.existsSync(videoJsonPath)) {
      try {
        const parsed = JSON.parse(fs.readFileSync(videoJsonPath, "utf8"));
        videoUrl = parsed.embedUrl ?? null;
      } catch {
        /* ignore malformed json */
      }
    }

    // --- slug & metadata ---
    const slug = slugify(`day-${String(day).padStart(2, "0")}-${topic}`);
    const type = detectType(day, folder);
    const mod = moduleForDay(day);
    const title = titleFromMarkdown(mdFiles) ?? prettyTopic(topic);
    const words = wordCount(mdFiles);
    const codeLines = pyFiles.reduce(
      (acc, f) => acc + fs.readFileSync(f.path, "utf8").split("\n").length,
      0
    );
    const minutes = estimateMinutes(words, codeLines);

    // --- write files ---
    const outDir = path.join(LESSONS_DIR, slug);
    fs.mkdirSync(path.join(outDir, "tutorial"), { recursive: true });
    fs.mkdirSync(path.join(outDir, "code"), { recursive: true });

    const sections = [];
    for (const md of mdFiles) {
      fs.copyFileSync(md.path, path.join(outDir, "tutorial", md.name));
      const firstHeading = fs
        .readFileSync(md.path, "utf8")
        .split("\n")
        .find((l) => l.trim().startsWith("#"));
      sections.push({
        file: md.name,
        heading: firstHeading
          ? firstHeading
              .replace(/^#+\s*/, "")
              .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
              .trim()
          : prettyTopic(md.name.replace(/\.md$/i, "")),
      });
    }

    const code = [];
    for (const py of pyFiles) {
      fs.copyFileSync(py.path, path.join(outDir, "code", py.name));
      code.push({ file: py.name, lines: fs.readFileSync(py.path, "utf8").split("\n").length });
    }

    const meta = {
      day,
      slug,
      title,
      type,
      module: mod.id,
      minutes,
      words,
      videoUrl,
      sections,
      code,
      sourceFolder: folder,
    };
    fs.writeFileSync(path.join(outDir, "meta.json"), JSON.stringify(meta, null, 2));
    index.push(meta);
  }

  index.sort((a, b) => a.day - b.day);

  const manifest = {
    course: {
      title: "100 Days of Python",
      description:
        "A 100-day journey from zero to job-ready Python developer — synced from the Learn_Python course repository.",
      source: "https://github.com/dush404/Learn_Python",
      totalDays: index.length,
    },
    modules: MODULES.map((m) => ({
      ...m,
      lessonCount: index.filter((l) => l.module === m.id).length,
      days: [m.from, m.to],
    })),
    lessons: index,
  };

  fs.writeFileSync(path.join(LESSONS_DIR, "index.json"), JSON.stringify(manifest, null, 2));

  console.log(`Synced ${index.length} lessons into content/lessons`);
  console.log(
    `Modules: ${MODULES.map((m) => `${m.id}(${manifest.modules.find((x) => x.id === m.id).lessonCount})`).join(", ")}`
  );
  console.log(`Skipped: ${skipped.length ? skipped.join(", ") : "none"}`);
}

main();
