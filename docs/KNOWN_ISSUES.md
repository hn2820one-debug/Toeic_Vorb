# Known Issues

Status: CURRENT REVIEW DOCUMENT

Scope note: this document covers Program B only (`C:\Users\Keith\Toeic\toeic-app-Vorb`). Program A lives separately at `C:\Users\Keith\toeic-app` and must not be modified. Root `TO_AI.md` is the current source of truth for counts, seed status, and priorities.

## ISSUE-001｜Program A / Program B boundary must remain explicit

Status: Open
Severity: High
Affected files: root guidance docs, AI handoff docs, generated status docs
Problem: Program A and Program B are separate folders, but historical docs may still imply a shared repo or shared cache.
Evidence: Program B path is `C:\Users\Keith\Toeic\toeic-app-Vorb`; Program A path is `C:\Users\Keith\toeic-app`.
Recommended fix: Keep root `README.md`, `AGENTS.md`, `CLAUDE.md`, and `TO_AI.md` aligned. Do not modify Program A.
Do not fix now unless it is documentation-only.

## ISSUE-002｜Documentation can drift toward one-app framing

Status: Documented
Severity: High
Affected files: `README.md`
Problem: Root Program B docs must not drift into Program A scope or old two-app-in-one-repo framing.
Evidence: `TO_AI.md` is now the single active AI handoff for Program B.
Recommended fix: Keep README aligned with `TO_AI.md`.
Do not fix now unless it is documentation-only.

## ISSUE-003｜Program A docs described grammar app as main system

Status: Documented
Severity: High
Affected files: `Background/PLAN.md`, `Background/TOEIC_App_Program_Plan.md`, `使用說明書.md`
Problem: Background docs describe Program A only, so readers may mistake them for whole-repo architecture.
Evidence: `Background/TOEIC_App_Program_Plan.md` describes Claude grammar teaching replication and PoS color system.
Recommended fix: Keep Background files as Program A references and keep Program B documentation separate.
Do not fix now unless it is documentation-only.

## ISSUE-004｜Root route is now a launcher but PWA cache can mask it

Status: Open
Severity: High
Affected files: `index.html`, `tracker.html`
Problem: Root `index.html` is the Program B launcher, but a stale service worker may still serve older Program B assets.
Evidence: `sw.js` caches Program B files with cache `toeic-vorb-v8`; cache reset is needed after route changes.
Recommended fix: Use `clear-sw.html` or unregister the service worker before regression testing.
Do not fix now unless it is documentation-only.

## ISSUE-005｜Two incompatible lesson schemas

Status: Open
Severity: High
Affected files: `data/vocab/*.json`, `data/index.json`, `data/pos-booster/*.json`, `data/weakness-hunter/*.json`
Problem: Vocabulary questions use `question_id/options object/correct_answer`; Program A questions use `q_id/options array/answer`.
Evidence: `js/vocab-tracker.js` and `js/quiz-engine.js` cannot consume each other's question records.
Recommended fix: Keep schemas separate and document conversion only if needed later.
Do not fix now unless it is documentation-only.

## ISSUE-006｜Storage keys are split and easy to confuse

Status: Open
Severity: Medium
Affected files: `js/storage.js`, `js/learning-log.js`, `js/vocab-db.js`
Problem: Program A and vocabulary systems store progress in different places without a single status page explaining boundaries.
Evidence: Program A uses `toeic_progress` and `toeic_learning_db`; vocabulary uses `toeic_vocab_tracker_db`, `toeic_vocab_tracker_preferences`, and `toeic_vocab_active_session`.
Recommended fix: Keep stores separate but add clear reset/export UI labels.
Do not fix now unless it is documentation-only.

## ISSUE-007｜Vocabulary content still lacks V4-V6

Status: Open
Severity: High
Affected files: `data/vocab/curriculum.json`, `data/vocab/questions_v*.json`
Problem: V0, V1, V2, and V3 are implemented, but V4-V6 vocabulary content is not active in the production seed.
Evidence: Current vocabulary curriculum has 193 runnable lessons and 4,399 production questions: V0 has 1/31, V1 has 60/1,728, V2 has 60/1,200, and V3 has 72/1,440. V4-A has a draft under `drafts/v4/`, but V4-V6 remain inactive.
Recommended fix: Review V2/V3 seed quality with real learner sessions before starting V4 Formal Phrase.
Do not fix now unless it is documentation-only.

## ISSUE-008｜Program A roadmap claims many planned lessons that are not runnable

Status: Open
Severity: Medium
Affected files: `data/index.json`, `index.html`, `progress.html`
Problem: `data/index.json` contains 814 lesson rows, but only 17 have lesson files.
Evidence: JSON inventory shows 797 Program A rows with `file: null`.
Recommended fix: Label Program A map rows as planned/building or move Program A roadmap out of the vocabulary product.
Do not fix now unless it is documentation-only.

## ISSUE-009｜Export package is not zipped

Status: Open
Severity: Medium
Affected files: `js/vocab-tracker.js`
Problem: Export target says one-click package folder, but browser support varies.
Evidence: Implementation uses File System Access API when available; otherwise downloads files individually.
Recommended fix: Add optional zip generation later if needed, without backend.
Do not fix now unless it is documentation-only.

## ISSUE-010｜Dashboard metrics come from different systems

Status: Open
Severity: Medium
Affected files: `progress.html`, `tracker.html`, `js/vocab-tracker.js`, `js/storage.js`
Problem: Program A progress dashboard and vocabulary dashboard calculate from different stores and cannot be compared directly.
Evidence: `progress.html` reads `toeic_progress` / `toeic_learning_db`; `tracker.html` reads `toeic_vocab_tracker_db`.
Recommended fix: Rename UI labels or separate dashboards.
Do not fix now unless it is documentation-only.

## ISSUE-011｜Mastery scoring is implemented but not proven

Status: Open
Severity: Medium
Affected files: `js/vocab-scoring.js`, `js/vocab-tracker.js`
Problem: Mastery formula has fixture tests, but has not been validated with long-term real learner data.
Evidence: Current score uses accuracy, speed, stability, recency; `scripts/test-scoring.js` covers boundary and fixture behavior, but exported real learner sessions still need review.
Recommended fix: Add fixture-based tests and compare against real review sessions.
Do not fix now unless it is documentation-only.

## ISSUE-012｜Review scheduling is still simple

Status: Open
Severity: Low
Affected files: `js/views/lesson.js`, `js/views/mistakes.js`, `js/vocab-scoring.js`
Problem: Dedicated Review Mode exists, but scheduling is still a simple fixed/due-again rule rather than a mature spaced-repetition algorithm.
Evidence: Review outcomes are marked as `fixed`, `still_weak`, or `repeated_error`; weak items are scheduled again in 1-2 days.
Recommended fix: After real learner testing, tune review intervals and stable/mastered transitions using exported review effectiveness data.
Do not fix now unless it is documentation-only.

## ISSUE-013｜Question bank manager edits IndexedDB but not seed JSON

Status: Open
Severity: Medium
Affected files: `js/vocab-tracker.js`, `data/vocab/*.json`
Problem: Browser edits persist in IndexedDB but do not modify source JSON files.
Evidence: Static browser app cannot write repo files directly without explicit file-system save flow.
Recommended fix: Document import/export workflow or add a local maintenance script later.
Do not fix now unless it is documentation-only.

## ISSUE-014｜PWA cache can show stale files

Status: Open
Severity: Medium
Affected files: `sw.js`, `clear-sw.html`
Problem: Service worker caches Program B assets; stale cache can hide changes.
Evidence: `sw.js` explicitly caches Vocabulary Tracker files only.
Recommended fix: Keep cache version updated and provide a clear cache-reset path.
Do not fix now unless it is documentation-only.

## ISSUE-015｜No automated browser test suite

Status: Documented
Severity: Medium
Affected files: project-wide
Problem: Browser coverage exists but should be expanded for newer dashboard/export surfaces.
Evidence: `package.json`, Playwright config, and 4 E2E tests exist; focused checks for Roadmap filters, Stage Seal Readiness, and export inventory are still recommended.
Recommended fix: Extend the local Playwright suite before larger content changes.
Do not fix now unless it is documentation-only.

## ISSUE-016｜No `src/` or `public/` directories despite earlier plans

Status: Open
Severity: Low
Affected files: repo root
Problem: Earlier plans mention React/Vite-style structure, but current project is static root HTML.
Evidence: No `src/` or `public/` app structure exists; `package.json` is for tests/dev tooling, not a build step.
Recommended fix: Document actual static structure; do not migrate or add a build step unless explicitly planned.
Do not fix now unless it is documentation-only.

## ISSUE-017｜Program A file names and user names are inconsistent

Status: Open
Severity: Low
Affected files: `README.md`, `data/index.json`, `js/storage.js`, `data/vocab/curriculum.json`
Problem: Program A data uses `Joseph`; vocabulary seed uses `Keith`.
Evidence: `js/storage.js` default student is Joseph; vocabulary default user is Keith.
Recommended fix: Decide final user identity/config model and keep it in one vocabulary settings store.
Do not fix now unless it is documentation-only.

## ISSUE-018｜Program A grammar content could be mistaken for Program B vocabulary scope

Status: Documented
Severity: High
Affected files: `Background/*`, `data/index.json`, `data/pos-booster/*`, `data/weakness-hunter/*`
Problem: Existing Program A grammar/PoS content may make Program B development drift into grammar-course work.
Evidence: Background plans and Program A data are grammar-heavy.
Recommended fix: Treat grammar as optional metadata/reference only for vocabulary tracker.
Do not fix now unless it is documentation-only.
