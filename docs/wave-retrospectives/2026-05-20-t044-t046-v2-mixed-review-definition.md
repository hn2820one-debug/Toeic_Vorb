# V2 Mixed Review — Lesson Definition, Release Gate, and Reference Validity
**Tasks:** T044, T045, T046  
**Date:** 2026-05-20  
**Source:** `drafts/v0-v3-rebuild/mixed_review_architecture.json`

---

## T044 — Mixed Review Lesson Definition (V2-MR-01)

### Grouping Rule

Every 5 consecutive V2 core lessons produce 1 mixed review lesson.  
V2-MR-01 draws from: **V2-A-71, V2-A-72, V2-A-73, V2-A-74, V2-A-75**

### Lesson Structure

| Field | Value |
|-------|-------|
| lesson_id | V2-MR-01 |
| lesson_type | mixed_review |
| title | V2 Mixed Review 01 |
| question_ids | 20 total (4 review_question_ids from each of the 5 source lessons) |
| review_question_ids | [] (mixed review lessons do not produce new review questions) |
| old-item pressure | Not applicable |
| mastery_threshold | 0.8 |
| estimated_minutes | 30 |

### question_ids Source (when all 5 core lessons exist)

| Source Lesson | Contributes |
|--------------|-------------|
| V2-A-71 | v2_a_71_rv_021, v2_a_71_rv_022, v2_a_71_rv_023, v2_a_71_rv_024 |
| V2-A-72 | v2_a_72_rv_021, v2_a_72_rv_022, v2_a_72_rv_023, v2_a_72_rv_024 |
| V2-A-73 | v2_a_73_rv_021, v2_a_73_rv_022, v2_a_73_rv_023, v2_a_73_rv_024 |
| V2-A-74 | v2_a_74_rv_021, v2_a_74_rv_022, v2_a_74_rv_023, v2_a_74_rv_024 |
| V2-A-75 | v2_a_75_rv_021, v2_a_75_rv_022, v2_a_75_rv_023, v2_a_75_rv_024 |

**Assembly script:** `scripts/add-mixed-review-lessons.js`  
**Assembly trigger:** Run only after all 5 source core lessons exist in curriculum with `review_question_ids` populated.

### Lesson_number Assignment

V2 mixed review lessons use the `10000+` band (e.g., V2-MR-01 = lesson_number 10001) to stay sortable after all 50 V2 core lessons. Defined in `mixed_review_architecture.json`.

### Current Readiness: V2-MR-01

| Source | Status |
|--------|--------|
| V2-A-71 | ✅ Production (rv_021–024 exist) |
| V2-A-72 | ✅ Production (rv_021–024 live) |
| V2-A-73 | ✅ Production (rv_021–024 live) |
| V2-A-74 | ✅ Production (rv_021–024 live) |
| V2-A-75 | ✅ Production (rv_021–024 live) |

**V2-MR-01 source coverage is now available after wave 3 promotion.** The assembled non-production candidate is `drafts/v0-v3-rebuild/v2_mr_01_candidate_draft_pack.json`.

---

## T045 — Release Gate Differences: Mixed Review vs Core Lesson

### Core Lesson Release Gate Requirements

| Check | Core Lesson |
|-------|------------|
| Isolated quality audit (audit-quality-full.js) | Required — must pass with 0 blocking issues |
| Duplicate stems | Required — must be 0 |
| Article giveaway check | Required |
| Old-item pressure (prior same-stage item in question_ids) | Required for V2-F (2nd lesson onward) |
| Staircase progression | Checked (warnings accepted for V2 scene_vocabulary pattern) |
| Answer distribution (A/B/C/D balance) | Required — 6/6/6/6 per 24-row lesson |
| Human review | Required before `production_candidate_ready` |
| 24 new question rows authored | Required |
| Wave grouping (3 per wave) | Required |

### Mixed Review Lesson Release Gate Requirements

| Check | Mixed Review Lesson |
|-------|-------------------|
| Quality audit (audit-quality-full.js) | Required — must pass with 0 blocking issues |
| Duplicate stems | Required — must be 0 |
| **No new question rows authored** | ✅ DIFFERENCE — MR lessons reuse existing review_question_ids only |
| **No old-item pressure required** | ✅ DIFFERENCE — cross-lesson mix itself provides pressure |
| **No staircase check** | ✅ DIFFERENCE — all questions are review_question type; staircase heuristic N/A |
| **Answer distribution** | Verified but less strict — review_question balance may differ from 5/5/5/5 |
| **No human authoring review required** | ✅ DIFFERENCE — content was reviewed at core lesson stage |
| Reference validity check (T046 checklist) | Required — all 20 question_ids must exist and be review_question type |
| Assembly script run: add-mixed-review-lessons.js | Required |
| All 5 source core lessons in production seed | Required |

### Summary of Key Differences

1. **No new content authored** — MR lessons only assemble pre-existing review_question_ids.
2. **No old-item pressure requirement** — the lesson inherently mixes 5 lessons' worth of items.
3. **No staircase audit** — all questions are `review_question` type; audit heuristic is irrelevant.
4. **Simpler gate** — the hard work is validating that referenced IDs exist and are correct type.

---

## T046 — Review Reference Validity Checklist (V2-MR-01 Template)

Before assembling or promoting any mixed review lesson, validate the following for each of the 20 question_ids:

### Per-Question Checklist

For each expected review question ID (`v2_a_NN_rv_0NN`):

- [ ] The question_id exists in `data/vocab/questions_v2a.json` (or the relevant question file)
- [ ] The `type` field is exactly `"review_question"`
- [ ] The `lesson_id` matches the expected source core lesson
- [ ] The `target_item_id` is one of the 4 items from the source core lesson
- [ ] `correct_answer` is A, B, C, or D (not null/empty)
- [ ] `question_text` contains a meaningful office context sentence (not a template stub)
- [ ] `default_error_code` is `"VOCAB_WEAK_RECALL"`

### Aggregate Checklist for the MR Lesson

- [ ] All 20 question_ids are accounted for (5 sources × 4 review questions each)
- [ ] No question_id appears more than once in the lesson's question_ids list
- [ ] All 5 source core lesson_ids exist in `curriculum.json` with `production` status
- [ ] answer_distribution of the 20 questions is within acceptable range (A ≠ 0, B ≠ 0, C ≠ 0, D ≠ 0; no single answer > 8)
- [ ] `audit-quality-full.js` passes with 0 blocking issues after lesson row is added to curriculum

### Automated Validation

The audit script `scripts/audit-quality-full.js` includes:
- `invalid review references: 0` check (validates that MR question_ids resolve to existing review_question rows)
- `intentional reused review questions: OK` check (validates that non-MR lessons don't accidentally share review IDs)

These automated checks cover most of the checklist items above. The per-question manual spot-check is only required for the first MR lesson of each stage; subsequent MR lessons may rely on automated checks.

---

## Current Status

| Task | Status |
|------|--------|
| T044: V2-MR-01 lesson definition | ✅ Defined — source coverage available after wave 3 promotion |
| T045: MR vs core release gate differences | ✅ Documented |
| T046: Review reference validity checklist | ✅ Created |
| V2-MR-01 draft slice (T047) | ✅ Candidate assembled — `drafts/v0-v3-rebuild/v2_mr_01_candidate_draft_pack.json` |
