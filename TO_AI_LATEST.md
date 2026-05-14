# TO_AI_LATEST — TOEIC Vocabulary Tracker Current Status

Last verified: 2026-05-14

This is the current source-of-truth handoff for the Vocabulary Tracker in this repo.

Historical TO_AI files were backed up to:

- docs/backups/to_ai/2026-05-14/TO_AI.md
- docs/backups/to_ai/2026-05-14/TO_AI_APP_STATUS.md
- docs/backups/to_ai/2026-05-14/TO_AI_APP_STATUS_V2.md

## 1. Verdict

The app is now a usable local-first TOEIC vocabulary trainer for V0-V3.

It is not yet a fully complete end-state program.

What is currently true:

- The browser app runs as a static PWA.
- IndexedDB seeding works for the current V0-V3 curriculum.
- Lesson runtime, mistake review, review mode, export, question bank, and settings all exist.
- Current automated validation is green.
- V0-V3 content is present and structurally valid.

What is not yet true:

- V4-V6 learning content is not implemented.
- V2/V3 still need old-item interference before they count as pedagogically mature.
- Some maintenance documents in the repo are historical and no longer accurate.
- Long-term mastery and review scheduling are usable, but not yet proven by long-run learner data.

Short conclusion:

- Usable now: yes, for V0-V3 local learning and export.
- Complete final product: no.

## 2. Current Verified Scope

### Content inventory

| Stage | Lessons | Questions | Status |
| --- | ---: | ---: | --- |
| V0 Diagnosis | 10 | 240 | Implemented |
| V1 Word Family | 60 | 1728 | Implemented |
| V2 TOEIC Scene Vocabulary | 50 | 1200 | Implemented |
| V3 Collocation | 60 | 1440 | Implemented |
| V4 Formal Phrase | 0 | 0 | Planned |
| V5 False Friends + Speed Reflex | 0 | 0 | Planned |
| V6 Integrated Review + Seal Test | 0 | 0 | Planned |

Current total:

- 180 lessons
- 4608 questions
- 494 vocab/collocation items

### Runtime capability

Implemented now:

- Today dashboard
- Roadmap view
- Lesson runtime with immediate attempt saving
- Session finish flow
- Error review confirmation
- Review queue and Review Mode
- Mastery dashboard
- Export package generation
- Question Bank manager
- Settings and lesson status tools

### Technical shape

- Static HTML/CSS/JavaScript app
- ES modules for app controller and views
- IndexedDB: toeic_vocab_tracker_db
- localStorage: toeic_vocab_tracker_preferences, toeic_vocab_active_session
- Service worker cached PWA shell
- No backend, no login, no cloud sync

## 3. Verification Run On 2026-05-14

Commands run:

```powershell
node scripts\validate-vocab-data.js
node scripts\test-scoring.js
node scripts\audit-vocab-quality.js
npm test -- --reporter=line
```

Verified results:

- Structural vocabulary validation: PASS
- Missing required fields: 0
- Duplicate question_id: 0
- Duplicate / near-duplicate question_text warnings: 0
- Scoring tests: 19 passed
- Playwright tests: 4 passed

Current Playwright coverage:

- Lesson flow
- Export flow
- Review mode flow
- V2/V3 seeded production content and runtime attempt recording

## 4. Learning Content Review

### V0

Status:

- Usable as a mixed diagnostic entry stage.

Remaining gap:

- Diagnostic output is still not strongly tied to personalized placement logic.

### V1

Status:

- Fully present and runnable.
- Word-family tracking and speed-oriented practice are already useful.

Remaining gap:

- 30 speed-drill rows still use a non-TIME_PRESSURE error-code pattern.

### V2

Status:

- Translation-heavy prompt problem has been cleaned up.
- Scene-vocabulary prompts now use English TOEIC-like clue framing.

Remaining gap:

- Lessons still mostly drill their own four target items.
- Old-item interference is still missing.

### V3

Status:

- Short/generic Part 6 prompt problem has been cleaned up.
- Distractor overuse problem has been cleaned up.

Remaining gap:

- Like V2, lessons still need deliberate old-item interference to become more robust for retention.

## 5. Current Quality Audit Snapshot

Latest audit summary:

- repeated_templates: 0
- short_part6_context_questions: 0
- translation_heavy_v2_questions: 0
- overused_v3_distractor_words: 0
- target_coverage_issues: 0
- missing_old_item_interference_lessons: 110
- speed_drill_non_time_pressure: 30

Interpretation:

- The recent V2/V3 quality batch solved the main prompt-quality issues.
- The remaining content work is no longer structural quality; it is retention-oriented lesson design.

## 6. Important Repo Reality

These points matter for future maintenance:

- Older TO_AI files are now historical references, not the source of truth.
- Some repo docs still describe pre-V2/V3 or pre-Playwright states.
- Service worker cache and existing local IndexedDB data can make a browser page look older than the current repo state unless the cache is refreshed.

## 7. Recommended Next Order

1. Add old-item interference to V2/V3 lessons.
2. Fix the 30 V1 speed-drill rows that still use non-TIME_PRESSURE error coding.
3. Refresh or retire stale review documents so future maintenance uses one authoritative status file.
4. Only start V4 after V2/V3 retention quality is improved.

## 8. Final Status Statement

If the question is whether this repo already contains a runnable and useful vocabulary-learning app, the answer is yes.

If the question is whether it is already a complete final TOEIC vocabulary program with the full planned curriculum and mature review design, the answer is no.