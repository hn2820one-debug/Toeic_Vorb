# C-13 V2-MR-01 Promotion Review

Date: 2026-05-21
Program: Program B - TOEIC Vocabulary Tracker
Scope: Promote `V2-MR-01` into production curriculum
Status: Approved

---

## Promotion Scope

`V2-MR-01` is the first V2 mixed-review checkpoint. It reuses the 20 existing `review_question` rows from `V2-A-71` through `V2-A-75` and adds 0 new question-bank rows.

Production impact:

- `data/vocab/curriculum.json`: add 1 lesson row and advance V2 `total_lessons` from 7 to 8.
- `data/vocab/questions_v2a.json`: unchanged at 168 rows.
- Seed version: `toeic_vocab_tracker_v2_mr_01_mixed_review_2026_05_21`.
- Service worker cache: `toeic-vorb-v14`.

## Gate Result

The candidate source is `drafts/v0-v3-rebuild/v2_mr_01_candidate_draft_pack.json`.

Checks:

- All 5 source core lessons are live in production.
- All 20 referenced IDs exist in `questions_v2a.json`.
- Every referenced row is type `review_question`.
- `V2-MR-01` has no `review_question_ids` of its own.
- The mixed-review audit reports 20 intentional reused review questions and 0 invalid references.
- Answer distribution across reused rows remains balanced at A/B/C/D = 5/5/5/5.

## Validation Evidence

- `node scripts/validate-vocab-data.js`: passed, 8 lessons / 168 questions.
- `node scripts/check-doc-consistency.js`: passed, seed `toeic_vocab_tracker_v2_mr_01_mixed_review_2026_05_21`, cache `toeic-vorb-v14`.
- `node scripts/audit-quality-full.js`: passed, 0 blocking issues, 1 mixed-review lesson, 0 mixed-review coverage warnings.
- `node scripts/audit-duplicates.js`: passed, 168 unique stems, 0 duplicate stems.
- `npm run report:inventory`: passed, wrote `docs/REPO_COURSEWARE_INVENTORY_2026-05-21.md`.
- `npm run test:all`: passed, including 28/28 Playwright tests.

## Decision

`V2-MR-01` is approved and live as a production mixed-review lesson.

This promotion does not change the V2 core count: core progress remains 7/10. The next content process remains wave 4, `V2-A-78` through `V2-A-80`, which is required to reach 10 runnable V2 core lessons.
