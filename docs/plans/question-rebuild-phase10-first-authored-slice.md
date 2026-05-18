# Question Rebuild Phase 10 - First Authored Slice

Generated: 2026-05-18
Last verified: 2026-05-18 (`node scripts/verify-phase10-slice.js --write`)
Status: in_progress - Steps 46-48 are complete and optimized for the first draft slice; Steps 49-50 remain intentionally pending.

This document is the Phase 10 deliverable for the first authored Wave 1 slice in the V0-V3 rebuild plan ([questions plan.md](questions%20plan.md)). It freezes one fully authored draft lesson slice for V3 Wave 1, records the editorial review outcome, and validates that the production seed remains untouched.

**Production impact: none.** All authored content in this phase remains under `drafts/collocation-rebuild/`. No `data/vocab/` production JSON, seed version, or handoff counts are changed here.

Machine-readable companions:

- [../../drafts/collocation-rebuild/wave1_question_shells.json](../../drafts/collocation-rebuild/wave1_question_shells.json)
- [../../drafts/collocation-rebuild/wave1_vocab_items_seed_draft.json](../../drafts/collocation-rebuild/wave1_vocab_items_seed_draft.json)
- [../../drafts/collocation-rebuild/wave1_phase10_slice_verification.json](../../drafts/collocation-rebuild/wave1_phase10_slice_verification.json)
- [../../scripts/apply-phase10-wave1-slice.js](../../scripts/apply-phase10-wave1-slice.js)
- [../../scripts/verify-phase10-slice.js](../../scripts/verify-phase10-slice.js)

---

## Step 46 - Generate The First Stage Slice Of Lesson/Question Content

### Overview

| Parameter | Value |
| --- | --- |
| Draft lesson ID | `V3-W1-01` |
| Planned production mapping | `V3-A-121` (Phase 7/8 baseline only; not merged) |
| Lesson title | 辦公室 搭配詞 1 |
| Authored question rows | 24 |
| Authored target vocab rows | 7 |
| Core / review split | 20 core + 4 review |

### Type Distribution

| Type | Rows |
| --- | ---: |
| `collocation` | 7 |
| `part5_sentence_completion` | 7 |
| `part6_context_choice` | 6 |
| `review_question` | 4 |
| **Total** | **24** |

### Result

- [../../scripts/apply-phase10-wave1-slice.js](../../scripts/apply-phase10-wave1-slice.js) now rewrites the first lesson slice in [../../drafts/collocation-rebuild/wave1_question_shells.json](../../drafts/collocation-rebuild/wave1_question_shells.json) with real question text, options, correct answers, and `explanation_zh`.
- The same script also fills the seven lesson-matched item rows in [../../drafts/collocation-rebuild/wave1_vocab_items_seed_draft.json](../../drafts/collocation-rebuild/wave1_vocab_items_seed_draft.json) with real example sentences and common trap cues.
- The authoring script now also stamps the first-slice rows and matching vocab rows with `editorial_review_status: phase10_review_passed` and refreshes both draft artifacts from a shell-only note to a mixed authored-slice note.
- The authored slice stays on the draft lesson ID `V3-W1-01`, so it can be reviewed without implying a production merge.

## Step 47 - Perform Lesson-Set Editorial Review

### Editorial Review Outcome

| Review area | Result |
| --- | --- |
| Core question framing | Passed: all 20 core rows are context-first and avoid direct-definition repetition. |
| Review question format | Passed: the 4 review rows use the V3 direct-meaning `Quick review:` format from the active question spec. |
| Distractor quality | Passed for draft-slice review: wrong-particle traps were used where the Phase 9 bank supplied them, and teacher-written contrasts were added for `pick up` / `give out`. |
| Explanation quality | Passed for draft-slice review: all rows use Traditional Chinese and explain both fit and a likely trap. |
| Topic coherence | Passed: all rows stay inside the office / reception / scheduling / document-review cluster for `V3-W1-01`. |
| Production readiness | Hold: one lesson slice is not enough to justify seed sync or a V3-first production merge. |

### Review Notes

- This slice deliberately follows the question spec for V3 `review_question` rows even though the Phase 9 context bank framed review prompts as fresh-context reminders. The spec remains the higher-priority source of truth for authored rows.
- The authored slice is strong enough to serve as a template for later Wave 1 lesson authoring, but it is still a draft-only editorial pass, not a release sign-off.

## Step 48 - Run Full Validation On Authored Content

### Overview

| Parameter | Value |
| --- | --- |
| Verification script | [../../scripts/verify-phase10-slice.js](../../scripts/verify-phase10-slice.js) |
| Verification report | [../../drafts/collocation-rebuild/wave1_phase10_slice_verification.json](../../drafts/collocation-rebuild/wave1_phase10_slice_verification.json) |
| Automated checks | 17 |
| Status | Passed |

### Checks Covered

- Slice authoring script exists and targets `V3-W1-01`.
- The lesson contains exactly 24 authored rows with the expected `question_id` set.
- The lesson preserves the expected `question_id -> target_item_id` mapping for all 24 rows.
- No TODO markers remain in question text, options, or explanations for the first slice.
- Every row uses a complete four-option `A/B/C/D` schema with a valid `correct_answer` pointer.
- Type distribution matches 7 collocation + 7 Part 5 + 6 Part 6 + 4 review rows.
- Review rows follow the V3 direct-meaning format.
- Part 6 rows use multi-sentence passage-style prompts.
- Type-specific policy fields now verify together: `skill`, `subskill`, `estimated_time_seconds`, `default_error_code`, `distractor_type`, and `slot_role` tag all match the Phase 10 slice design.
- All explanations pass the draft review length band and remain unique enough for lesson-level review.
- Seven target vocab rows now contain real example sentences and trap metadata.
- Question and vocab-row metadata now record `authored_slice` plus `phase10_review_passed` status instead of leaving the slice marked as pending review.
- Draft artifact notes now explicitly describe the mixed state: overall draft-only, but `V3-W1-01` is already an authored slice.
- Production seed files remain unchanged: `curriculum.seed_version` is still `toeic_vocab_tracker_c004_full_bank_clear_2026_05_18`, [../../data/vocab/questions_v3a.json](../../data/vocab/questions_v3a.json) remains empty, and the seven authored target IDs are still absent from [../../data/vocab/vocab_items.json](../../data/vocab/vocab_items.json).

## Phase 10 Optimization

Re-verified and optimized on 2026-05-18:

- [../../scripts/apply-phase10-wave1-slice.js](../../scripts/apply-phase10-wave1-slice.js) now writes reviewed Phase 10 metadata instead of leaving the authored slice marked `pending` after editorial review was already documented.
- The same script now refreshes the top-level draft artifact notes in [../../drafts/collocation-rebuild/wave1_question_shells.json](../../drafts/collocation-rebuild/wave1_question_shells.json) and [../../drafts/collocation-rebuild/wave1_vocab_items_seed_draft.json](../../drafts/collocation-rebuild/wave1_vocab_items_seed_draft.json) so they no longer claim the entire file is shell-only.
- [../../scripts/verify-phase10-slice.js](../../scripts/verify-phase10-slice.js) grew from 12 to 17 automated checks and now blocks drift in target mapping, option schema, type-policy fields, reviewed metadata, and artifact-level mixed-state notes.
- The refreshed verification report in [../../drafts/collocation-rebuild/wave1_phase10_slice_verification.json](../../drafts/collocation-rebuild/wave1_phase10_slice_verification.json) confirms that these stricter checks still pass while production seed files remain untouched.

## Step 49-50 Hold - Production Merge And Release Gate

These two steps remain pending by design.

- Phase 7 froze the production merge order as `V1 -> V0 -> V2 -> V3`.
- The current authored slice is V3-only and still uses draft lesson IDs.
- Production source files under `data/vocab/` are intentionally unchanged, so seed-version sync and release smoke tests would be misleading at this point.

Until a later task explicitly approves a production merge path that respects the frozen order or revises it with documentation, do **not**:

- bump `seed_version` in the three required files;
- edit `TO_AI.md`, `AGENTS.md`, or `CLAUDE.md` to claim new production counts;
- move this authored slice from `drafts/collocation-rebuild/` into `data/vocab/`.

## Phase 10 Usage Rules

- Re-run `node scripts/apply-phase10-wave1-slice.js` if the first lesson shell rows or item seed rows are regenerated.
- Re-run `node scripts/verify-phase10-slice.js --write` after any edit to the `V3-W1-01` authored slice.
- Treat this slice as a draft authoring reference for later Wave 1 lessons, not as proof that V3 is ready for production.
- Keep Step 49 and Step 50 pending until the repo chooses a production merge path consistent with the frozen rebuild order.