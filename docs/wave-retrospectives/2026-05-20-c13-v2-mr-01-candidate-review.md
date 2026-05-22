# C-13 V2-MR-01 Candidate Review

Date: 2026-05-20
Program: Program B - TOEIC Vocabulary Tracker
Artifact: `drafts/v0-v3-rebuild/v2_mr_01_candidate_draft_pack.json`
Status: Candidate ready, production impact none

---

## Scope

`V2-MR-01` is the first V2 mixed-review lesson. It reuses the 20 existing `review_question` rows from `V2-A-71` through `V2-A-75` and adds 0 new question-bank rows.

Source lessons:

- `V2-A-71`
- `V2-A-72`
- `V2-A-73`
- `V2-A-74`
- `V2-A-75`

## Review Results

Reference validity:

- All 5 source lessons exist in production.
- All 20 referenced question IDs exist in `data/vocab/questions_v2a.json`.
- Every referenced row is type `review_question`.
- Every referenced row appears in its source lesson's `review_question_ids`.
- `V2-MR-01` has no `review_question_ids` of its own.
- The candidate adds 0 new question rows.

Answer distribution across the 20 reused rows:

| A | B | C | D |
|---:|---:|---:|---:|
| 5 | 5 | 5 | 5 |

Validation:

- Custom T046 reference checklist: passed, 0 errors.
- Isolated full quality audit with `V2-MR-01` inserted into a tmp curriculum: passed.
- Isolated audit result: 8 lessons, 168 questions, 1 mixed-review lesson, 0 invalid review references, 20 intentional reused review questions, 0 mixed-review coverage warnings.

## Verdict

`V2-MR-01` is ready for the formal mixed-review promotion gate. Promotion will be a production curriculum seed change because it adds a lesson row, even though it adds 0 question-bank rows.

Do not promote it without:

- seed version sync in the three required files;
- service worker cache bump;
- seed-change record;
- current-truth docs/count updates from 7 to 8 runnable lessons;
- targeted UI/Playwright updates if lesson counts change visible expectations;
- full validation after the production seed change.

