# PyDaily — 100 Days of Python

**Learn Python one day at a time.** PyDaily is a browser-based learning app that brings a 100-day Python course together with lessons, code examples, quizzes, a runnable Python lab, and personal progress tracking.

**Live site:** [pydaily.onrender.com](https://pydaily.onrender.com/)

## What you can do

- **Follow a 100-day curriculum** organized into six learning modules, from setup and language basics through object-oriented and advanced Python.
- **Study each lesson** with written tutorials, code examples, and video links where available.
- **Practice Python in the Code Lab.** The embedded lab uses CodeMirror for editing and Pyodide to run Python in the browser. You can also open it full-screen.
- **Check your understanding** with module quizzes and coding exercises.
- **Keep track of your learning** with lesson completion, visit counts, a daily streak, and an overall progress view.
- **Save useful material** with lesson bookmarks and personal notes.
- **Use the app on desktop or mobile**, with responsive navigation and light/dark theme support.

## Curriculum

| Days | Module |
| --- | --- |
| 1–8 | Getting Started |
| 9–19 | Language Basics |
| 20–35 | Functions & Collections |
| 36–55 | Errors, Files & Functional Tools |
| 56–83 | Object-Oriented Python |
| 84–100 | Advanced Python |

The course content is synced from the [Learn_Python repository](https://github.com/dush404/Learn_Python). PyDaily serves lesson text and examples from the project's local `content/` files; these materials are separate from user progress data.

## How it works

- **Frontend:** Next.js App Router, React, TypeScript, Tailwind CSS, Zustand, and reusable Radix/shadcn UI components.
- **Python practice:** A standalone CodeMirror + Pyodide playground is hosted from `public/playground/` and embedded in the app.
- **Content:** Lesson metadata, Markdown tutorials, code samples, quizzes, and exercises are stored in `content/`.
- **API and persistence:** Next.js route handlers use Prisma to store lesson progress, bookmarks, notes, and quiz attempts in PostgreSQL.
- **Deployment:** The app builds as a Next.js standalone server and is deployed at the live link above.

### Progress and accounts

PyDaily currently uses an **anonymous browser key**, not email/password accounts. The browser stores the key in local storage and sends it with API requests to associate progress, bookmarks, notes, and quiz results. There is no sign-in or cross-device account recovery; clearing the browser's local storage can lose the association with that anonymous data.

## Run locally

### Requirements

- [Bun](https://bun.sh/)
- A PostgreSQL database, such as a development Neon database

### Setup

1. Clone the repository and open a terminal in the project directory.
2. Install dependencies:

   ```sh
   bun install --frozen-lockfile
   ```

3. Copy `.env.example` to `.env` and set `DATABASE_URL` to your PostgreSQL connection URL. Keep `.env` private; never commit database credentials.
4. Generate Prisma Client and apply the checked-in migrations:

   ```sh
   bun run db:generate
   bun run db:migrate:deploy
   ```

5. Start the development server:

   ```sh
   bunx next dev -p 3000
   ```

6. Visit [http://localhost:3000](http://localhost:3000).

Use `bun run db:migrate` when developing a schema change and creating a new migration. Use `bun run db:migrate:deploy` to apply existing migrations; production should use migrations rather than `prisma db push`.

## Deploy on Render

Connect the repository to a Render **Web Service**, then configure:

**Build command**

```sh
bun install --frozen-lockfile && bun run db:generate && bun run build
```

**Start command**

```sh
bunx prisma migrate deploy && bun run start
```

Add `DATABASE_URL` in the Render service's environment settings using the Neon PostgreSQL URL. Do not put credentials in this README or in `render.yaml`. The standalone launcher uses Render's `PORT` and binds to `0.0.0.0`.

## Moving data from the old SQLite database

The initial Prisma migration creates PostgreSQL tables; it **does not copy rows** from the old `db/custom.db`. Back up that file before migrating. If you need to keep existing progress, bookmarks, notes, or quiz results, export and import the rows from `LessonProgress`, `Bookmark`, `Note`, and `QuizResult` into the corresponding PostgreSQL tables, preserving their IDs and timestamps. Verify the row counts after import. Keep the SQLite backup until the PostgreSQL data is confirmed.

## Useful project paths

```text
src/app/                 Next.js pages and API routes
src/components/study/    Learning app views and components
src/lib/                 Content access, API client, state, and Prisma client
content/                 Lessons, examples, quizzes, and exercises
public/playground/       Standalone browser-based Python lab
prisma/                  Prisma schema and PostgreSQL migrations
scripts/                 Build asset copier and standalone server launcher
```
