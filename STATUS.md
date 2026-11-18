# Lumen status

Working codename in the brief: PLAIN. Product name: Lumen.

The owner pre-approved every stage, so the build continued through Stage 6 on `main` without pull requests. SQLite is used instead of hosted PostgreSQL so the app matches Ripple, Tether, Halo, and Bond and runs with no API key.

Checked on this machine after the last code change:

- `npm run lint` — pass
- `npm run typecheck` — pass
- `npm test` — pass, 17 tests
- `npm run build` — pass (Next.js 16.4.6)
- `npm run test:e2e` — pass, 14 Playwright tests

Screenshots: `docs/screenshots`. Runbook: `docs/RUNBOOK.md`. Pilot plan, not yet run: `docs/PILOT.md`.

```text
PRODUCT: Lumen
STAGE: 0
STATUS: PASS
USER-FACING WORKING FLOWS: None in this stage. The repo had only a one-line README. The first real action is search over three source-linked demo guides, then a saved step that survives refresh.
UI/UX: No screens yet. Mobile flow: Help → guide → one step → Next or Back → finish → Progress. Failure paths: no search match, missing translation, stale review, hidden draft, other person's session, save error.
DATA + SECURITY: Planned session hash, guide versions, progress, feedback. No passwords or form answers.
TESTS: Not run. No product code yet.
REAL INTEGRATIONS: none | SANDBOX: local editor code; device read-aloud | DISABLED: language model, email, SMS, push, browser overlay, form submission, hosted Postgres
FILES CHANGED: STATUS.md
OPEN BUGS/RISKS: Empty app at this commit. Device menus change. Sample Spanish is not certified. Sandbox editor code is unsafe on a shared server. SQLite is local only. No pilot.
NEXT STAGE PROPOSAL: Stage 1 foundation.
AWAITING APPROVAL: NO. The owner pre-approved every stage.
```

```text
PRODUCT: Lumen
STAGE: 1
STATUS: PASS
USER-FACING WORKING FLOWS: Home explains the job, search goes to the guide list, language switch, name save, 404, and security headers. The language-model button is visibly disabled.
UI/UX: Inspected at 390px and 1440px (docs/screenshots/01-home-*). Skip link is the first tab stop. Warm paper, charcoal text, royal blue actions, 18px body. Bottom navigation on small screens. Error and loading screens exist.
DATA + SECURITY: Guest session cookie lumen_session, token stored as SHA-256. Preferences and display name persist. Origin check on mutations. No secrets in the repo.
TESTS: npm run lint pass. npm run typecheck pass. npm test pass (17). npm run build pass. npm run test:e2e pass (14), including foundation.spec.ts.
REAL INTEGRATIONS: none | SANDBOX: editor desk code local-desk when LUMEN_EDITOR_CODE is unset | DISABLED: language model, email, SMS, push, overlay, form submission, hosted Postgres
FILES CHANGED: App scaffold, design tokens, shell, SQLite migrations, CI.
OPEN BUGS/RISKS: Sample Spanish is not a certified translation. Review dates can go stale. Sandbox editor code. No pilot. Not a compliance claim.
NEXT STAGE PROPOSAL: Stage 2 catalog.
AWAITING APPROVAL: NO
```

```text
PRODUCT: Lumen
STAGE: 2
STATUS: PASS
USER-FACING WORKING FLOWS: Three public demo guides (password, email, software update) with source links and review dates. Search and topic filters read the database. A nonsense query shows an empty state. The paper-form draft is not in the catalog or the public API.
UI/UX: Guide cards at 390px and 1440px (docs/screenshots/02-guides-*). Stale guide uses a caution border and the words "Review date has passed" (docs/screenshots/06-stale-390.png).
DATA + SECURITY: guides, guide_versions, guide_steps, glossary_terms. Public list is verified or unverified only. Drafts stay off that list.
TESTS: catalog.test.ts covers search, draft hiding, stale freshness, and Spanish fallback. e2e/catalog.spec.ts pass.
REAL INTEGRATIONS: none | SANDBOX: demo seed content | DISABLED: same as Stage 1
FILES CHANGED: Demo seed from CISA Secure Our World pages (paraphrased, linked), catalog service, guide list UI.
OPEN BUGS/RISKS: CISA pages were not re-fetched from this environment (the site returned 403 to the agent). URLs were checked against public search results. Menu names in the update guide are deliberately general because they change.
NEXT STAGE PROPOSAL: Stage 3 reading flow.
AWAITING APPROVAL: NO
```

```text
PRODUCT: Lumen
STAGE: 3
STATUS: PASS
USER-FACING WORKING FLOWS: Start a guide, mark a step done, go Next and Back, finish, and resume. A completed step is still complete after refresh. A lost network request shows an error and does not claim the step was saved. A second browser gets 404 for the first browser's session. Keyboard-only finish works. Copy link copies the public URL. Read aloud uses the device voice and says so.
UI/UX: One step per screen at 390px and 1440px (docs/screenshots/03-step-*). Large Back and Next controls. Glossary disclosure. Caution and example regions.
DATA + SECURITY: guide_sessions and session_steps. Writes check the session owner. Repeated Next for a step already left behind does not skip another step. Audit metadata does not store the feedback note.
TESTS: progress.test.ts and e2e/guide.spec.ts pass.
REAL INTEGRATIONS: none | SANDBOX: speechSynthesis on the device | DISABLED: same as Stage 1
FILES CHANGED: Progress service and guide reader.
OPEN BUGS/RISKS: An in-progress session stays on the version it started until language switch or a new session. Read aloud depends on the browser voice list.
NEXT STAGE PROPOSAL: Stage 4 language and accessibility.
AWAITING APPROVAL: NO
```

```text
PRODUCT: Lumen
STAGE: 4
STATUS: PASS
USER-FACING WORKING FLOWS: English and sample Spanish for the password and email guides. Switching language keeps the guide and the step, including a step already marked done. The software-update guide has no Spanish: the banner says so, the steps stay in English, and the buttons stay in Spanish. Text size, contrast, simpler wording, and reduced motion persist on the user row. Keyboard help is on the accessibility page.
UI/UX: Accessibility at 390px (docs/screenshots/04-access-390.png). Contrast pairs used for text meet WCAG 2.2 AA in contrast.test.ts (white on #2764C9 is about 5.6:1). prefers-reduced-motion and the saved reduced-motion setting shorten transitions.
DATA + SECURITY: locale, text_scale, contrast, simpler, and reduced_motion on the user. Language switch updates the session version and keeps completed ordinals.
TESTS: messages.test.ts, contrast.test.ts, progress locale test, e2e/language.spec.ts, accessibility portion of e2e/quality.spec.ts.
REAL INTEGRATIONS: none | SANDBOX: sample Spanish written for this demo, labeled not certified | DISABLED: language-model rewrite, professional translation service
FILES CHANGED: Message catalogs, preference API, fallback resolver, accessibility page.
OPEN BUGS/RISKS: Spanish is a demo translation, not a CISA translation and not certified. Simpler wording exists only where a shorter paragraph was written; otherwise the screen says the standard text is showing.
NEXT STAGE PROPOSAL: Stage 5 content quality.
AWAITING APPROVAL: NO
```

```text
PRODUCT: Lumen
STAGE: 5
STATUS: PASS
USER-FACING WORKING FLOWS: "This was confusing" and a 1–5 clarity rating save a feedback row. The editor desk rejects a wrong code, then opens with local-desk. Mark reviewed publishes the paper-form draft. Saving a draft of a live guide does not replace the reviewed public text. A placeholder step cannot be marked reviewed. A javascript: source URL is rejected.
UI/UX: Stale banner on the update guide. Drafts are labeled and absent from the public list until review. Editor notes show the text people typed, without their name.
DATA + SECURITY: Editor kind is stored on the user after the code matches (hash compare). Review requires the source checkbox. Feedback notes are omitted from security_events.
TESTS: editor.test.ts, feedback cases in account.test.ts, e2e/quality.spec.ts pass.
REAL INTEGRATIONS: none | SANDBOX: editor code local-desk when LUMEN_EDITOR_CODE is unset | DISABLED: email delivery of notes
FILES CHANGED: Editor services and pages, feedback API.
OPEN BUGS/RISKS: The sandbox code is public. Set LUMEN_EDITOR_CODE before sharing a server. Review is a person's checkbox, not an outside certification.
NEXT STAGE PROPOSAL: Stage 6 hardening.
AWAITING APPROVAL: NO
```

```text
PRODUCT: Lumen
STAGE: 6
STATUS: PASS
USER-FACING WORKING FLOWS: The flows above, plus download of this browser's data (no session token) and delete of that data only. Progress shows this browser's completion percent and the database total, both labeled as local rows, not a pilot result. Limits page lists what is off.
UI/UX: Progress at 1440px (docs/screenshots/05-progress-1440.png). Mobile and desktop shots are viewport captures so the fixed navigation is not stitched through the middle of a full-page image.
DATA + SECURITY: IDOR covered by a second browser receiving 404. Rate limits on preferences, sessions, feedback, editor unlock, and delete. Export omits the token hash. Delete removes that user's rows and leaves demo guides. Origin check on writes. Security headers: nosniff, DENY framing, referrer policy, permissions policy. Runbook covers migration and SQLite file rollback. Pilot plan is written and has not been run. Decision recorded there: iterate. No compliance claim and no production-readiness claim.
TESTS: npm run lint pass. npm run typecheck pass. npm test pass (17). npm run build pass. npm run test:e2e pass (14).
REAL INTEGRATIONS: none | SANDBOX: local editor desk; device read-aloud; sample Spanish | DISABLED: language model, email, SMS, push, browser overlay, form submission, hosted Postgres
FILES CHANGED: Account export/delete, metrics, rate limit, CI, README, runbook, pilot plan, screenshots.
OPEN BUGS/RISKS: No pilot evidence. Sample Spanish is not certified. CISA source pages were confirmed from public search snippets, not a live fetch (403 from this environment). SQLite is single-file and not a hosted database. Sandbox editor code until LUMEN_EDITOR_CODE is set. In-progress sessions stay on the guide version they started until the language changes or the person starts again.
NEXT STAGE PROPOSAL: Run the pilot in docs/PILOT.md before any wider release. Do not add a language model until a real adapter and a review process exist.
AWAITING APPROVAL: NO. Stage 6 is the last stage in the brief.
```
