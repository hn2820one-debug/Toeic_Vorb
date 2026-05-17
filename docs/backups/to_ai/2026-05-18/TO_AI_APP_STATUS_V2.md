# TO_AI_APP_STATUS_V2 — TOEIC Vocabulary Tracker Improvement Plan

Last verified: 2026-05-14

Scope:

- This document covers only `C:\Users\Keith\Toeic\toeic-app-Vorb`.
- It does not audit or modify the separate Grammar / PoS App at `C:\Users\Keith\toeic-app`.
- This is a current-state review plus improvement plan for the Vocabulary Tracker app and its learning content.
- This app must remain local-first: no AI question generation, no backend, no login, no cloud sync.

## 1. Executive Summary

TOEIC Vocabulary Tracker is now a runnable local PWA with real V0-V3 vocabulary content. The current implementation can seed curriculum/questions into IndexedDB, run lessons, record every attempt immediately, track response time, create sessions, update item mastery, collect error codes, maintain a review queue, and export data for ChatGPT analysis.

The major status change since the older `TO_AI_APP_STATUS.md` is that V2 and V3 are no longer planned-only. Current verified content is:

| Stage | Lessons | Questions | Status |
|---|---:|---:|---|
| V0 Diagnosis | 10 | 240 | IMPLEMENTED |
| V1 Word Family | 60 | 1,728 | IMPLEMENTED |
| V2 TOEIC Scene Vocabulary | 50 | 1,200 | IMPLEMENTED as seed content |
| V3 Collocation | 60 | 1,440 | IMPLEMENTED as seed content |
| V4 Formal Phrase | 50 planned | 0 | PLANNED |
| V5 False Friends + Speed Reflex | 50 planned | 0 | PLANNED |
| V6 Integrated Review + Seal Test | 40 planned | 0 | PLANNED |

Total current implemented content:

```text
180 lessons
4,608 questions
494 vocab/collocation items
```

The app is structurally healthy enough for real smoke testing. The biggest improvement opportunity is no longer raw quantity; it is learning quality and workflow depth. V2/V3 are structurally valid but still template-heavy. Review Mode now launches a dedicated queue-based runtime, saves review attempts with `mode: "review_queue"`, and exports review effectiveness. Validation catches schema problems but not enough pedagogical quality issues.

Recommended next direction:

1. Improve V2/V3 learning quality before expanding V4.
2. Improve mastery/seal logic so the 320-lesson plan is enforceable, not just visible.
3. Upgrade export analytics further if needed.
4. Keep Program B independent and do not touch Grammar / PoS App.

## 2. Current App Status

### Entry and runtime

| Area | Current state | Assessment |
|---|---|---|
| Entry | `index.html` launcher, `tracker.html` app | OK |
| Storage | IndexedDB `toeic_vocab_tracker_db`; localStorage preferences/session | OK |
| Seed version | `toeic_vocab_tracker_v2_v3_full_2026_05_14` | OK |
| Loader | Uses `curriculum.question_files` manifest | OK |
| Service worker | `toeic-vorb-v4` caches V0-V3 data files and P1 Review Mode assets | OK, cache reset still important |
| Lesson runtime | Start, pause/resume, answer, save attempts, finish session | IMPLEMENTED |
| Error review | Confirm/change error code after lesson | IMPLEMENTED/PARTIAL |
| Review queue | Creates queue records, launches Review Mode, tracks fixed/still weak/repeated outcomes | IMPLEMENTED/PARTIAL |
| Export | Browser-side analysis package | IMPLEMENTED/PARTIAL |
| Question bank | Import/edit/export/validate in IndexedDB | PARTIAL |
| Tests | Playwright smoke tests and scoring tests exist | GOOD baseline |

### Verification snapshot

Latest commands run:

```powershell
node scripts\validate-vocab-data.js
node scripts\test-scoring.js
npm test -- --reporter=list
```

Verified result:

- Data validation: PASS.
- Missing required fields: 0.
- Duplicate `question_id`: 0.
- Validation warning count: 0.
- Scoring tests: 19 passed.
- Playwright tests: 3 passed.

Current Playwright coverage:

- Lesson flow.
- Export flow.
- V2/V3 seed + runtime attempt recording.

## 3. Current Content Inventory

### Question files

| File | Questions | Main role |
|---|---:|---|
| `questions_v0.json` | 240 | Diagnostic |
| `questions_v1a.json` | 240 | V1-A Word Family |
| `questions_v1b.json` | 192 | V1-B HR / recruiting word family |
| `questions_v1c.json` | 192 | V1-C finance / compliance word family |
| `questions_v1d.json` | 192 | V1-D document / communication word family |
| `questions_v1e.json` | 192 | V1-E facilities / maintenance word family |
| `questions_v1f.json` | 720 | V1-F speed reflex |
| `questions_v2a.json` | 240 | office / administration scene vocabulary |
| `questions_v2b.json` | 240 | logistics / travel scene vocabulary |
| `questions_v2c.json` | 240 | HR / workplace scene vocabulary |
| `questions_v2d.json` | 240 | finance / sales scene vocabulary |
| `questions_v2e.json` | 240 | service / public notice scene vocabulary |
| `questions_v3a.json` | 240 | office collocations |
| `questions_v3b.json` | 240 | logistics / operations collocations |
| `questions_v3c.json` | 240 | HR / meetings collocations |
| `questions_v3d.json` | 240 | finance / compliance collocations |
| `questions_v3e.json` | 240 | sales / customer service collocations |
| `questions_v3f.json` | 240 | mixed Part 6 context collocations |

### Question type totals

| Type | Count |
|---|---:|
| speed_drill | 770 |
| scene_vocabulary | 830 |
| part6_context_choice | 740 |
| review_question | 668 |
| word_family | 572 |
| part5_sentence_completion | 418 |
| collocation | 300 |
| meaning_choice | 260 |
| formal_phrase | 30 |
| false_friend | 20 |

### Item totals

| Item type | Count |
|---|---:|
| word_family | 42 |
| diagnostic_vocab | 12 |
| scene_vocabulary | 200 |
| collocation | 240 |

## 4. Learning Content Review

### V0 Diagnosis

Strengths:

- Covers multiple question types.
- Gives baseline exposure to meaning, scene vocabulary, collocation, formal phrase, false friends, Part 5, Part 6, and speed.
- Good as a diagnostic entry stage.

Issues:

- Diagnostic score is not yet tied to a strong placement algorithm.
- V0 does not yet produce a personalized recommendation beyond normal dashboard signals.

Recommended improvements:

- Add a diagnostic result report that maps weak types to suggested starting points.
- Use V0 result to prioritize review queue and first V1/V2/V3 lessons.

### V1 Word Family

Strengths:

- Full V1 is implemented.
- Covers V1-A to V1-F.
- Good item-level tracking for word family accuracy and speed.
- V1-F gives speed-reflex repetition across prior families.

Issues:

- Some V1 content remains template-like, especially speed drills.
- V1-F uses the normal lesson runtime; it does not have a dedicated speed-drill UX.
- A few V1-A speed rows may still use `WORD_FAMILY_POS` where `TIME_PRESSURE` might be more analytically useful.

Recommended improvements:

- Add a V1 quality cleanup pass focused on repeated shells, not schema.
- Add dedicated speed mode for V1-F with tighter timer display and per-question pace feedback.
- Add a content lint rule for repeated stem shells.

### V2 TOEIC Scene Vocabulary

Strengths:

- Full 50-lesson stage exists.
- Covers office, logistics, HR, finance/sales, service/public notice.
- 200 scene vocabulary items are present.
- Each lesson has 24 questions and balanced answer distribution.

Issues:

- V2 currently tests many items through clue-style prompts rather than realistic TOEIC sentence/notice/dialogue context.
- Each lesson has 4 target items repeated 6 times. This is trackable, but may feel narrow.
- Distractors are same-scene terms, which is good structurally, but some questions are recognition-heavy rather than usage-heavy.

Evidence from audit:

- V2 top prompt templates repeat by scene group.
- Per lesson pattern is stable: 16 `scene_vocabulary`, 4 `meaning_choice`, 4 `review_question`.
- Target item distribution is exactly 6 questions per item.

Recommended improvements:

- Convert at least 40% of V2 questions into real TOEIC-style mini-contexts: notices, emails, schedules, announcements, hotel/travel/customer-service snippets.
- Add old-scene interference questions after every 5 lessons.
- Add mixed V2 review lessons every 10 lessons.
- Add semantic tags such as `office_equipment`, `travel_booking`, `finance_payment`, `public_notice`.

### V3 Collocation

Strengths:

- Full 60-lesson stage exists.
- 240 collocation items are present.
- V3 is mostly `part6_context_choice`, matching the intended direction.
- Every lesson has 24 questions and balanced answer distribution.

Issues:

- Several Part 6 questions are single-sentence or generic paragraph shells, not full Part 6 context.
- Distractor verbs are heavily concentrated around `do`, `take`, and `make`.
- Some wrong collocations are useful as learner traps, but others may be too artificial.

Evidence from audit:

- V3 question type mix: 720 `part6_context_choice`, 240 `collocation`, 240 `part5_sentence_completion`, 240 `review_question`.
- Common repeated template: `The department expects each coordinator to ______ when the request is received.` appears 300 times after normalization.
- Top distractor verbs are very concentrated: `do`, `take`, `make`.

Recommended improvements:

- Rewrite V3 Part 6 questions into real 2-4 sentence mini-passages.
- Add distractor taxonomy:
  - wrong verb
  - wrong noun
  - wrong preposition
  - meaning-compatible but unnatural phrase
- Add collocation group review lessons.
- Add validation that flags overused distractor verbs and repeated blank sentence shells.

### V4-V6 Planned Content

Do not start V4-V6 until V2/V3 have passed a quality review.

Suggested future scope:

- V4 Formal Phrase: emails, notices, contracts, policy phrases.
- V5 False Friends + Speed: high-risk confusion pairs plus response-time pressure.
- V6 Integrated Review + Seal Test: mixed review, repeated-error closure, stage sealing.

## 5. App-Level Improvement Opportunities

### 5.1 Review Mode

Current state:

- Review queue records exist.
- Queue cards can be marked done.
- Wrong attempts can create queue entries.
- Dedicated Review Mode exists for due today, high priority, repeated errors, and all pending queue items.
- Review attempts are saved with `mode: "review_queue"`.
- Queue entries are updated to `fixed`, `still_weak`, or `repeated_error`.
- Export includes `review_effectiveness.csv`.

Acceptance:

- PASS: User can run due review without starting a normal lesson.
- PASS: Review attempts write to IndexedDB.
- PASS: Correct review attempts affect item mastery through the same scoring path.
- PASS: Export shows review fix rate by item and error code.

### 5.2 Mastery Gate and Seal Logic

Current state:

- Lesson accuracy gates exist.
- Lesson statuses exist.
- Manual status override exists.

Gap:

- Unlock/seal logic is not strict.
- Stage seal status is mostly summary-level.

Plan:

- Add optional strict mode in settings.
- Enforce lesson progression by default only for new learners.
- Seal a stage only after:
  - all lessons complete,
  - stage accuracy threshold met,
  - repeated errors below threshold,
  - seal test passed.

Acceptance:

- V1/V2/V3 stage dashboards show clear seal readiness.
- User can still manually override, but override is recorded.

### 5.3 Export v2

Current state:

- Export includes summary, sessions, attempts, item mastery, errors, stage progress, question snapshot, raw events.

Gap:

- Export can be more useful for external analysis.
- No zip package.
- No content-quality report export.

Plan:

- Add `content_quality_summary.json`.
- `review_effectiveness.csv` is implemented.
- Add `lesson_recommendations.md`.
- Add optional browser-side zip if feasible.

Acceptance:

- ChatGPT can see current weakest lesson, item, question type, error code, repeated-error rate, review fix rate, and next recommended lesson.

### 5.4 Content Validation v2

Current state:

- Validates required fields, duplicates, answer distribution, tags, grammar links.

Gap:

- Does not catch enough learning-quality problems.

Plan:

- Add checks for:
  - repeated normalized stem templates,
  - overused distractor verbs,
  - target item coverage per lesson,
  - missing old-item interference,
  - Part 6 questions shorter than a minimum context length,
  - speed drill rows with non-speed error code,
  - unbalanced question types per lesson.

Acceptance:

- Structural validation remains strict.
- Quality warnings are separated from hard errors.
- Each content expansion must include a warning summary.

### 5.5 Question Bank Source-of-Truth

Current state:

- Question Bank Manager edits IndexedDB only.
- Seed JSON files do not update from browser edits.

Gap:

- Browser-edited questions can diverge from source JSON.

Plan:

- Keep browser edits local.
- Add clear label: `Local IndexedDB edits only`.
- Add export/import path for edited question bank snapshots.
- Add `source_file` metadata in question rows later.

Acceptance:

- User understands whether they are editing seed JSON or local copy.
- Exported question bank can be re-imported without losing IDs.

### 5.6 UX / Mobile

Current state:

- Mobile-first layout exists.
- Lesson runtime is usable.

Gap:

- V1-F speed mode and V3 Part 6 need better mode-specific UI.
- Dense question bank/export screens are desktop-biased.

Plan:

- Add mode-specific runtime headers:
  - speed drill: compact timer and pace indicator,
  - Part 6: passage block + answer options,
  - scene vocabulary: scene badge and context label.
- Add mobile filters for Roadmap and Question Bank.

Acceptance:

- V2/V3 lessons are comfortable on mobile.
- Part 6 questions do not feel like ordinary Part 5 blanks.

## 6. Technical Maintainability Review

Current module split is better than the original single controller, but some files are now large:

| File | Lines | Assessment |
|---|---:|---|
| `js/views/export.js` | 579 | Needs later split by export builders |
| `js/views/lesson.js` | 551 | Needs later split by runtime, mastery update, session finish |
| `js/views/bank.js` | 341 | Acceptable but growing |
| `scripts/expand-v1-content.js` | 1,125 | Large content generator |
| `scripts/expand-v2-v3-content.js` | 628 | Acceptable for current generated seed, but should not keep growing indefinitely |

Refactor rule:

- Do not refactor during content fixes unless needed.
- When refactoring, keep write scope small and add tests first.

Suggested later split:

```text
js/features/lesson/runtime.js
js/features/lesson/session-summary.js
js/features/lesson/mastery-updates.js
js/features/export/build-files.js
js/features/export/summary-md.js
js/features/review/review-runtime.js
scripts/content/v2-scenes.js
scripts/content/v3-collocations.js
scripts/content/quality-lint.js
```

## 7. Prioritized Roadmap

### P0 — Stabilize Current V0-V3 Before More Expansion

Status: COMPLETED on 2026-05-14. See `docs/P0_STABILIZATION_RESULT.md`, `docs/V2_V3_QUALITY_AUDIT.md`, and `docs/V2_V3_HUMAN_REVIEW_CHECKLIST.md`.

Goal: make current app/content trustworthy for real learning.

Tasks:

1. Add content quality validation v2.
2. Add V2/V3 human review checklist.
3. Smoke test one lesson from V2-A, V2-C, V2-E, V3-A, V3-D, V3-F.
4. Confirm export after V2/V3 attempts.
5. Update stale docs or mark old docs as historical.

Acceptance:

- Structural validation passes.
- Quality warning report exists.
- At least 6 representative lessons have browser runtime evidence.
- Export includes V2/V3 attempts correctly.

### P1 — Build Dedicated Review Mode

Status: COMPLETED on 2026-05-14. See `docs/P1_REVIEW_MODE_RESULT.md`.

Goal: make error tracking actionable.

Tasks:

1. Add Review page mode: due today / high priority / repeated errors.
2. Build review runtime from `review_queue`.
3. Record attempts with `mode: "review_queue"`.
4. Calculate review fix rate by item and error code.
5. Show fixed / still weak / repeated error status.

Acceptance:

- User can review due items without starting a normal lesson.
- Review attempts affect mastery.
- Export contains review effectiveness.

### P2 — Improve V2/V3 Learning Quality

Goal: reduce seed-template feel.

Tasks:

1. Rewrite V2 scene questions into richer TOEIC contexts.
2. Rewrite V3 Part 6 questions into short passages.
3. Diversify V3 distractors beyond `do/take/make`.
4. Add mixed review lessons after each V2/V3 block.
5. Add interference questions from older lessons.

Acceptance:

- Top repeated template count drops materially.
- V3 has real paragraph context, not only sentence blanks.
- V2 has enough context for usage, not just translation recognition.

### P3 — Export and Analytics Upgrade

Goal: make ChatGPT analysis more precise.

Tasks:

1. Add `content_quality_summary.json`.
2. Add `lesson_recommendations.md`.
3. Add optional zip export.
4. Add export schema version.

Already implemented:

- `review_effectiveness.csv`.

Acceptance:

- Export can answer: what to study next, why, and which errors are repeated.
- Export can separate V1/V2/V3 weakness patterns.

### P4 — Mastery Gate and Stage Seal

Goal: make 320-lesson course progression reliable.

Tasks:

1. Add strict progression toggle.
2. Add stage seal criteria.
3. Add seal test lessons for implemented stages.
4. Record manual overrides.
5. Expose seal readiness in dashboard/export.

Acceptance:

- A learner knows whether V1/V2/V3 is complete, unstable, or ready to seal.

### P5 — Future Content Expansion

Only after P0-P2:

1. V4 Formal Phrase.
2. V5 False Friends + Speed.
3. V6 Integrated Review + Seal Test.

Do not start V4 by copying V2/V3 generator style blindly. V4 should be designed after the content-quality lint rules are in place.

## 8. Recommended Immediate Next Sprint

Recommended sprint name:

```text
P0 Current Content Quality and Review Readiness
```

Scope:

1. Create `scripts/audit-vocab-quality.js`.
2. Report repeated templates by stage/file/lesson.
3. Report overused distractor words.
4. Report too-short Part 6 context questions.
5. Add smoke test coverage for 6 representative V2/V3 lessons.
6. Export after V2/V3 attempts and inspect `summary.md`.
7. Produce `docs/V2_V3_QUALITY_AUDIT.md`.

Do not include:

- New AI question generation.
- New backend.
- New login.
- Cloud sync.
- V4 content.
- Grammar / PoS App changes.

## 9. Known Risks

| Risk | Severity | Why it matters | Recommended fix |
|---|---|---|---|
| V2/V3 content is structurally valid but template-heavy | High | Learner may memorize patterns rather than TOEIC usage | P2 content rewrite |
| Stage sealing is weak | Medium | Course progress can look complete before stable mastery | P4 seal logic |
| Browser question-bank edits do not update seed JSON | Medium | Source of truth can diverge | Snapshot export/import and labels |
| Service worker cache can go stale | Medium | User may see old content after seed changes | Cache version bump and clear instructions |
| Large content generators can become hard to maintain | Medium | V4-V6 may become brittle | Split content data from generator logic |

## 10. Bottom Line

The current app is ready for controlled V0-V3 learner testing, not yet ready for blind large-scale content expansion. P0 validation and P1 Review Mode are complete. The strongest next learning-design move is to rewrite and audit V2/V3 so they feel like TOEIC practice, not just generated schema-compliant questions.

Next recommended action:

```text
Start P2 V2/V3 content quality rewrite, or run a real V0-V3 learner pilot using the new Review Mode.
```
