# TO_AI_APP_STATUS_V3 — TOEIC Vocabulary Tracker Review and Optimization Status

Last verified: 2026-05-17

Scope:

- Folder: `C:\Users\Keith\Toeic\toeic-app-Vorb`
- Program: TOEIC Vocabulary Tracker only
- Architecture rule: local-first static PWA, no backend, no login, no cloud sync, no runtime AI question generation
- This status supersedes the V2 status file for current V0-V3 counts and the 2026-05-17 UI/export optimization pass.

## 1. Current Truth

The current seed is newer than `TO_AI_APP_STATUS_V2.md`.

| Area | Current value |
|---|---:|
| Total runnable lessons | 202 |
| Total question-bank rows | 4,608 |
| V0 Diagnosis | 10 lessons / 240 questions |
| V1 Word Family + Speed | 60 lessons / 1,728 questions |
| V2 Scene Vocabulary | 60 lessons / 1,200 questions |
| V3 Collocation | 72 lessons / 1,440 questions |
| V2/V3 mixed review lessons | 22 lessons |
| Seed version | `toeic_vocab_tracker_c001_mixed_review_2026_05_17` |

Important count interpretation:

- V2 has 50 core lessons plus 10 mixed review lessons.
- V3 has 60 core lessons plus 12 mixed review lessons.
- Mixed review lessons reuse existing review questions, so lesson count increased to 202 while question count remains 4,608.

## 2. Review Coverage

Reviewed areas:

- Entry and PWA cache: `index.html`, `tracker.html`, `sw.js`
- App shell and shared state: `js/vocab-tracker.js`, `js/state.js`, `js/vocab-db.js`, `js/vocab-scoring.js`
- Main views: Today, Roadmap, Lesson, Mistakes, Mastery, Export, Question Bank, Settings
- Content data shape: `data/vocab/curriculum.json`, question-file manifest, V2/V3 mixed review lesson rows
- Validation and audits: `scripts/validate-vocab-data.js`, `scripts/audit-vocab-quality.js`
- Regression tests: Playwright lesson/review/export/content tests

## 3. Validation Snapshot

Latest data validation:

- Structural validation: PASS
- Missing required fields: 0
- Duplicate `question_id`: 0
- Validation warnings: 0
- Current lesson count by stage: V0 10, V1 60, V2 60, V3 72
- Current question count by stage: V0 240, V1 1,728, V2 1,200, V3 1,440

Latest content-quality audit:

| Audit item | Current count | Meaning |
|---|---:|---|
| Repeated V2/V3 stem templates | 0 | Good |
| Short V3 Part 6 contexts | 0 | Good |
| Translation-heavy V2 prompts | 0 | Good |
| Overused V3 distractor words | 0 | Good |
| Target coverage issues | 22 | Mostly mixed review lessons; acceptable but should be documented |
| V2/V3 lessons missing old-item interference | 110 | Next content-design priority |
| Speed drills not using `TIME_PRESSURE` | 0 | Good |

Regression verification completed in this pass:

- `node scripts\validate-vocab-data.js` PASS
- `node scripts\audit-vocab-quality.js` PASS, report regenerated
- `node scripts\test-scoring.js` PASS, 19/19 checks
- `npm test -- --reporter=list` PASS, 4/4 Playwright tests
- Quick UI smoke check PASS for Roadmap V3 filter, Lesson preview, and new export file inventory

## 4. Optimizations Completed In V3 Pass

1. Corrected visible curriculum count on the launcher.
   - `index.html` now shows 202 lessons / 4,608 questions and explains the 22 mixed review lessons.

2. Added Roadmap filtering.
   - `Roadmap` can now filter by stage, lesson status, and lesson type.
   - This reduces scanning cost now that the course has 202 lesson rows.

3. Made mixed review lessons clearer in Roadmap.
   - Mixed review rows are visually marked and described as cross-lesson review checkpoints.

4. Added lesson-focus preview before starting a lesson.
   - Normal lessons show target vocabulary focus.
   - Mixed review lessons show that they recycle review questions from earlier lessons.

5. Added question-type strategy guidance in the runtime.
   - V2 scene vocabulary, V3 collocation, Part 5, Part 6, speed drills, and review questions now show short strategy guidance before answering.
   - This guidance does not reveal the answer.

6. Added post-answer learning cards.
   - After answering, the runtime shows the correct target, Chinese meaning when available, example sentence when available, and linked grammar/collocation note when available.
   - This turns wrong answers into immediate learning feedback instead of only correctness feedback.

7. Upgraded export package.
   - Added `lesson_recommendations.md`.
   - Added `content_quality_summary.json`.
   - Export now carries both learner-performance data and current content-quality context.

8. Bumped the service worker cache.
   - `sw.js` cache changed to `toeic-vorb-v5` so the UI/export updates are not hidden behind stale PWA cache.

9. Added visible answer records.
   - The app was already saving every submitted answer in IndexedDB `attempts`.
   - `Mistakes` now includes `Recent Answer Records`, showing the answered question, selected answer, correct answer, correctness, timestamp, question type, and per-question response time.
   - `sw.js` cache changed to `toeic-vorb-v6` for this UI update.

10. Added answer confirmation and locked feedback timing.
   - Selecting A/B/C/D no longer saves immediately.
   - The learner must press `Confirm Answer` before the attempt is written to IndexedDB.
   - Per-question time now runs from question display until `Confirm Answer`.
   - The feedback/continue screen locks the question timer to the saved response time instead of continuing to count.
   - `sw.js` cache changed to `toeic-vorb-v7` for this runtime fix.

## 5. Recommended Next Optimization Measures

1. Add old-item interference to V2/V3 core lessons.
   - Current audit still flags 110 V2/V3 lessons with no old-item interference.
   - Best next content change: each lesson should include 1-3 items from earlier lessons as distractor or review pressure.

2. Separate mixed review coverage rules from core lesson coverage rules.
   - The 22 target coverage warnings come from mixed review structure.
   - The audit script should classify mixed review lessons separately so they are not confused with weak core lessons.

3. Add a V1-F speed-specific runtime.
   - Speed drills currently use the normal lesson shell.
   - A compact speed layout with pace bands would better match the teaching objective.

4. Add stage-seal readiness.
   - V1/V2/V3 should show whether all lessons are complete, repeated errors are under threshold, and review queue is clear.

5. Add diagnostic result routing for V0.
   - V0 can already run, but it should recommend whether the learner should start with V1, V2, V3, or review mode.

6. Add a source-of-truth workflow for Question Bank edits.
   - Browser edits update IndexedDB only.
   - Keep the warning label and add a maintenance script later if seed JSON round-trip editing becomes routine.

7. Add focused Playwright checks for Roadmap filters and export-file inventory.
   - Current tests cover lesson flow, review mode, export behavior, and V2/V3 runtime.
   - The new UI/export files should get direct regression checks in the next test pass.

## 6. Current Bottom Line

The app is structurally healthy for controlled V0-V3 learning. The biggest improvement is no longer raw content volume. The priority is now learning workflow quality:

- Make 202 lessons easier to navigate.
- Convert every answer into immediate learning feedback.
- Keep mixed review lessons clearly separated from new-learning lessons.
- Use export files to support both performance analysis and content-quality review.

Do not start V4-V6 expansion until V2/V3 old-item interference and stage-seal logic are addressed.
