# Lumen

Lumen explains a few everyday internet tasks in plain language, one step at a time. It does not fill in forms, and it does not sign in for anyone.

The working codename in the original brief was PLAIN. The product name is Lumen.

## Quickstart

Node.js 22 or newer. No API key.

```bash
npm install
npm run db:setup
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

`npm run db:setup` creates `data/lumen.db` and applies the SQL in `drizzle/migrations`. The database path is `LUMEN_DB_PATH` (see `.env.example`).

A production-style local process:

```bash
npm run db:setup
npm run build
npm run start
```

The editor desk uses the sandbox code `local-desk` until `LUMEN_EDITOR_CODE` is set. The editor screen says so. Do not use the sandbox code on a shared server.

## Architecture

- Next.js App Router and React, TypeScript strict, Tailwind CSS.
- SQLite through `better-sqlite3` and Drizzle. This matches the owner’s sibling apps (Ripple, Tether, Halo, and Bond), so Lumen runs locally without a hosted database. PostgreSQL is not wired up.
- Server routes under `src/app/api` call services in `src/lib`. Pages read those services directly.
- A browser session is a random token stored only as a SHA-256 hash. The cookie is `lumen_session`, `httpOnly`, `SameSite=Lax`, and `Secure` only on HTTPS.
- Public guides can be read without a session. Starting a guide, saving a setting, or saving a guide creates a guest session. Progress, notes, and export belong to that session. Another browser gets a different session, and a request for someone else’s session returns 404.
- Cache Components are off so one person’s place in a guide is not placed in a shared cache.
- Mutations check the `Origin` header against the host.

```text
src/app            routes and pages
src/components     shell, guide reader, and design-system pieces
src/lib/db         schema, migrations, demo seed
src/lib/auth       sessions and preferences
src/lib/guides     catalog, freshness, editor
src/lib/sessions   one-step progress
src/lib/feedback   clarity notes
src/lib/account    export, deletion, completion counts
```

## What is real, sandboxed, or disabled

| Capability | State |
| --- | --- |
| Three demo guides with source links and review dates | Real rows in SQLite, labeled Demo guide. Steps paraphrase public CISA Secure Our World pages. |
| Search and topic filters | Real. They filter those rows. An empty search is an empty state, not a made-up result. |
| One step at a time, Back, Next, and “I did this step” | Real. Completed steps are rows in `session_steps` and remain after refresh. |
| Resume from My progress | Real. The link opens the saved step. |
| Glossary on a step | Real. Definitions are stored with the guide version. |
| Read aloud | Local to the device (`speechSynthesis`). Lumen does not send the text to a speech service. If the browser has no voice, the button says so. |
| English and sample Spanish | Real stored copy. Spanish is not a CISA translation and is not a certified translation. The screen says that. |
| Missing Spanish on the software-update guide | Real fallback. The steps stay in English and the buttons stay in the language you chose. |
| Text size, contrast, simpler wording, reduced motion | Real. Saved on the user row. |
| Stale review warning | Real. The software-update guide’s review date is in the past on purpose. |
| “This was confusing” and clarity rating | Real feedback rows. The note is not copied into the audit log. |
| Editor desk, drafts, and review | Real. A draft stays off the public list until Mark reviewed. Saving a draft of a live guide does not replace the reviewed text. |
| Editor code when unset | Sandbox. The code is `local-desk` and the screen says so. |
| Copy link | Real. The link is the public guide address. It does not include progress. |
| Download my data, delete my data | Real for the current session. Demo guides stay. |
| Completion percent | Real counts of sessions in this database. Not a published statistic and not a pilot result. |
| Language-model rewrite | Disabled. No provider is called. A key would not turn one on, because there is no adapter. |
| Email, SMS, push, browser overlay, form submission | Disabled. Nothing is simulated. |
| Hosted Postgres | Not in this repo. Not verified in CI. |

## Checks

```bash
npm run lint
npm run typecheck
npm test
npm run build
npm run test:e2e
```

GitHub Actions runs the same list on pushes to `main`. Playwright deletes and recreates `data/lumen-e2e.db` for that run.

Screenshots of the main screens are in `docs/screenshots`. Deployment and rollback notes are in `docs/RUNBOOK.md`. The unrun pilot plan is in `docs/PILOT.md`.

This repository does not claim a compliance certification or that the app is ready for a public launch.
