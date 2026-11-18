# Lumen status

Working codename in the brief: PLAIN. Product name: Lumen.

The repository was empty except for a one-line README. Sibling apps (Ripple, Tether, Halo, Bond) are Next.js, TypeScript strict, SQLite via better-sqlite3 and Drizzle, Vitest, Playwright, and GitHub Actions. Lumen follows that local stack. The brief's hosted PostgreSQL option is not used, so the app runs with `npm install`, `npm run db:setup`, and `npm run dev` and no API keys.

## Stage 0 decisions

Primary flow: a visitor searches or picks a demo guide, reads one step at a time, marks steps done, and comes back to the same step after a refresh. Progress is stored in SQLite for that browser's session. Guides are public to read. Writes require the session that owns them.

Three public demo guides, each source-linked:

1. Make a password that is hard to guess (CISA). Current review. English and sample Spanish.
2. Check an email before you click (CISA). Current review. English and sample Spanish.
3. Install an update from the device itself (CISA). Review date in the past, so the stale warning shows. English only, to exercise the fallback.

One draft guide stays off the public catalog until an editor reviews it. Lumen does not submit forms, store passwords, or call a language model.

Integrations: none configured. Read-aloud uses the device voice and is labeled as such. The editor desk uses a local sandbox code when `LUMEN_EDITOR_CODE` is unset. Email, SMS, browser overlay, and LLM rewrite stay disabled.

Risks:

1. Device menus change, so even a reviewed guide can go stale. The review-due date is the warning, not a promise the steps are current.
2. Sample Spanish is not a certified translation.
3. The local editor code is not safe on a shared server until `LUMEN_EDITOR_CODE` is set.
4. SQLite is the local store. It is not a hosted production database.
5. No pilot has been run. Completion counts are this database only.

```text
PRODUCT: Lumen
STAGE: 0
STATUS: PASS
USER-FACING WORKING FLOWS: None yet. The repo had no application code. The first real action by the end of Stage 2 is search over three source-linked demo guides. By Stage 3 a person can finish a guide and see the same completed step after refresh.
UI/UX: No screens yet. Mobile flow: Help (search and large cards) → guide overview → one step → Next or Back → completion → Progress. Failure paths: no search match, missing translation, stale review, draft hidden, other person's session rejected, save error.
DATA + SECURITY: Planned tables: users, sessions, guides, guide_versions, guide_steps, glossary_terms, guide_sessions, session_steps, saved_guides, feedback, metric_events, security_events, rate_buckets. Session token stored only as a SHA-256 hash. No passwords, form answers, or documents.
TESTS: Not run. No product code in this stage.
REAL INTEGRATIONS: none | SANDBOX: local editor desk code when LUMEN_EDITOR_CODE is unset; device read-aloud | DISABLED: language-model rewrite, email, SMS, push, browser overlay, form submission, hosted Postgres
FILES CHANGED: STATUS.md
OPEN BUGS/RISKS: Empty app. Risks above are medium until the later stages land.
NEXT STAGE PROPOSAL: Stage 1 foundation: strict Next.js app, tokens, shell, one real screen, lint, typecheck, test, build.
AWAITING APPROVAL: NO. The owner pre-approved every stage for this build.
```
