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
| Total runnable lessons | 193 |
| Total question-bank rows | 4,399 |
| V0 Diagnosis | 1 lesson / 31 questions |
| V1 Word Family + Speed | 60 lessons / 1,728 questions |
| V2 Scene Vocabulary | 60 lessons / 1,200 questions |
| V3 Collocation | 72 lessons / 1,440 questions |
| V2/V3 mixed review lessons | 22 lessons |
| Seed version | `toeic_vocab_tracker_c001_cross_lesson_2026_05_17` |

Important count interpretation:

- V2 has 50 core lessons plus 10 mixed review lessons.
- V3 has 60 core lessons plus 12 mixed review lessons.
- Mixed review lessons reuse existing review questions; V4 draft content is not part of the runnable seed.

## 2. Review Coverage

Reviewed areas:

- Entry and PWA cache: `index.html`, `tracker.html`, `sw.js`
- App shell and shared state: `js/vocab-tracker.js`, `js/state.js`, `js/vocab-db.js`, `js/vocab-scoring.js`
- Main views: Today, Roadmap, Lesson, Mistakes, Mastery, Export, Question Bank, Settings
- Content data shape: `data/vocab/curriculum.json`, question-file manifest, V2/V3 mixed review lesson rows
- Validation and audits: `scripts/validate-vocab-data.js`, `scripts/audit-quality-full.js`, `scripts/audit-duplicates.js`
- Regression tests: Playwright lesson/review/export/content tests

## 3. Validation Snapshot

Latest data validation:

- Structural validation: PASS
- Missing required fields: 0
- Duplicate `question_id`: 0
- Validation warnings: 0
- Current lesson count by stage: V0 1, V1 60, V2 60, V3 72
- Current question count by stage: V0 31, V1 1,728, V2 1,200, V3 1,440

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
- `node scripts\audit-quality-full.js` PASS, 0 issues
- `node scripts\audit-duplicates.js` PASS, 0 duplicates
- `node scripts\test-scoring.js` PASS, 71/71 checks
- `npm test -- --reporter=list` PASS, 4/4 Playwright tests
- Quick UI smoke check PASS for Roadmap V3 filter, Lesson preview, and new export file inventory

## 4. Optimizations Completed In V3 Pass

1. Corrected visible curriculum count on the launcher.
   - `index.html` now shows 193 lessons / 4,399 questions and explains the 22 mixed review lessons.

2. Added Roadmap filtering.
   - `Roadmap` can now filter by stage, lesson status, and lesson type.
   - This reduces scanning cost now that the course has 193 lesson rows.

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

11. Completed F-003 scoring fixture protection.
   - Added external mastery-score fixture cases in `tests/fixtures/mastery-score-fixtures.json`.
   - `scripts/test-scoring.js` now validates the mastery formula against fixture data as well as boundary cases.
   - Added `npm run test:scoring`, `npm run test:data`, and `npm run test:all`.

12. Completed F-002 V0 diagnostic recommendations.
   - Today dashboard now shows `V0 Diagnostic Recommendation` after V0 attempts exist.
   - The recommendation maps weak V0 question types to V1/V2/V3/V4 direction and gives a start button for the next available lesson.
   - Export now includes `diagnostic_recommendation.json`.
   - `sw.js` cache changed to `toeic-vorb-v8`.

13. Completed F-001 stage-seal readiness display.
   - Today dashboard now shows `Stage Seal Readiness` for each stage.
   - Readiness checks are display-only: lesson completion, due review clear, repeated-error rate under 5%, and recent accuracy at 85%+.
   - This does not lock lessons or force `sealed` status.

14. Isolated V4 draft content from production validation.
   - V4-A draft questions and the V4 item helper script live under `drafts/v4/`.
   - Formal-phrase V4 items are not present in production `data/vocab/vocab_items.json`.
   - `node scripts/audit-quality-full.js` returns to `✅ PASSED` against the V0-V3 seed.

## V4 Formal Phrase Status

V4 is not promoted to available yet.

- Existing draft: `drafts/v4/questions_v4a.json`
- Draft size: 100 questions across `V4-A-181` to `V4-A-185`
- Existing V4 item helper: `drafts/v4/add-v4-items.js` can regenerate 40 formal phrase items when V4 is intentionally activated.
- Current blockers: V4 lessons are not in `curriculum.json`, `questions_v4a.json` is not in the manifest, V4 draft `distractor_type` policy must be finalized, and answer slots must be balanced.
- Required before activation: validate against `docs/question-creation-spec.md`, add V4 curriculum lessons, add the question file to the manifest, bump seed versions, and run full regression.

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

4. Add a source-of-truth workflow for Question Bank edits.
   - Browser edits update IndexedDB only.
   - Keep the warning label and add a maintenance script later if seed JSON round-trip editing becomes routine.

5. Add focused Playwright checks for Roadmap filters, stage-seal readiness, and export-file inventory.
   - Current tests cover lesson flow, review mode, export behavior, and V2/V3 runtime.
   - The new UI/export files should get direct regression checks in the next test pass.

## 6. Current Bottom Line

The app is structurally healthy for controlled V0-V3 learning. The biggest improvement is no longer raw content volume. The priority is now learning workflow quality:

- Make 193 lessons easier to navigate.
- Convert every answer into immediate learning feedback.
- Keep mixed review lessons clearly separated from new-learning lessons.
- Use export files to support both performance analysis and content-quality review.

Do not start V4-V6 expansion until V2/V3 old-item interference and stage-seal logic are addressed.
