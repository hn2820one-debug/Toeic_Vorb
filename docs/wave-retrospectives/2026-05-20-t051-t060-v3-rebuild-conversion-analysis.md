# V3 Rebuild Conversion Analysis
**Tasks:** T051 through T060  
**Date:** 2026-05-20  
**Scope:** `drafts/collocation-rebuild/` inventory triage, V3-W1-01 promotion readiness, first V3 wave strategy

---

## T051 — Inventory Classification: `drafts/collocation-rebuild/`

### Classification Summary

| File | Role | Promotable? |
|------|------|-------------|
| `phrase_411_inventory.json` | Ability reference only (background signal) | ❌ Not promotable |
| `phrase_duplicate_reference.json` | Reference metadata | ❌ Not promotable |
| `phrase_family_table.json` | Reference metadata | ❌ Not promotable |
| `topic_normalization_table.json` | Reference metadata | ❌ Not promotable |
| `wave1_lesson_blueprint.json` | Planning blueprint (item lists, lesson structure intent) | ❌ Not promotable — design artifact |
| `wave1_question_plan.json` | Planning artifact (slot assignments) | ❌ Not promotable |
| `wave1_authoring_policy_pack.json` | Authoring rules | ❌ Policy document |
| `wave1_difficulty_mixing_policy.json` | Policy document | ❌ Policy document |
| `wave1_missing_item_backlog.json` | Backlog tracker | ❌ Tracker only |
| `wave1_schema_contracts.json` | Schema constraints | ❌ Governance reference |
| `wave1_reference_bundle_v1.json` | Authoring reference bundle | ❌ Reference only |
| `wave1_distractor_reference_bank.json` | Distractor authoring reference | ❌ Reference only (needed during authoring) |
| `wave1_explanation_reference_bank.json` | Explanation reference | ❌ Reference only |
| `wave1_sentence_context_bank.json` | Sentence examples | ❌ Reference only |
| `wave1_question_shells.json` | **384 question rows** (V3-W1-01 fully authored; V3-W1-02–16 shell-only) | ⚠️ Partial — only V3-W1-01 section (24 rows) is a promotion candidate |
| `wave1_app_lesson_draft.json` | App-format lesson rows for all 16 lessons | ⚠️ Partial — only V3-W1-01 entry |
| `wave1_vocab_items_seed_draft.json` | 100 vocab item drafts (7 V3-W1-01 items authored, 93 shells) | ⚠️ Partial — only 7 V3-W1-01 items |
| `wave1_phase10_slice_verification.json` | Phase 10 verification report for V3-W1-01 | ✅ Supporting evidence (17/17 checks passed) |
| `README.md` | Documentation | ❌ Documentation |

### Key Finding

The directory contains extensive planning infrastructure but only **V3-W1-01 (24 question rows, 7 vocab items)** constitutes true production-candidate content. All other 15 V3 lessons (360 rows) are authoring shells containing TODO placeholder text.

---

## T052 — Promotion Subset from `wave1_question_shells.json`

### Promotable Subset

| Lesson | Rows | Status | Promotable? |
|--------|------|--------|-------------|
| V3-W1-01 | 24 | All authored (no TODO) | ✅ Subject to pre-promotion checks |
| V3-W1-02 | 24 | Shell-only (TODO content) | ❌ |
| V3-W1-03 | 24 | Shell-only | ❌ |
| V3-W1-04 | 24 | Shell-only | ❌ |
| V3-W1-05 | 24 | Shell-only | ❌ |
| V3-W1-06 | 24 | Shell-only | ❌ |
| V3-W1-07 through V3-W1-16 | 240 | Shell-only | ❌ |
| **Total promotable** | **24** | | |
| **Total in file** | **384** | | |

**Conclusion:** The promotion subset is exactly V3-W1-01 (24 rows). Attempting to promote any other lesson would fail quality audit immediately due to TODO markers, empty options, and missing explanations.

**Authoring backlog:** 15 lessons × 24 rows = 360 rows remain as TODO shells. Each lesson requires the same T031-T040 V2 authoring pipeline applied to a V3 collocation template.

---

## T053 — First V3 Production Wave Candidate Selection

### Candidate: V3-W1-01

| Criterion | Detail |
|-----------|--------|
| Lesson ID | V3-W1-01 |
| Title | 辦公室 搭配詞 1 |
| Scene/Topic | 辦公室 (Office collocations) |
| Target items | run out of, set up, drop by, look over, run into, pick up, give out |
| Difficulty | All Level A (most frequent, highest TOEIC exposure) |
| Question rows | 24 (all authored) |
| Phase 10 review | PASSED (17/17 checks, 2026-05-18) |
| Other candidates | None — only V3-W1-01 is authored |

**Rationale for selecting V3-W1-01 as first:**
1. It is the **only authored V3 lesson** — there is no selection contest.
2. Level A phrasal verbs are high-frequency in TOEIC Part 5/6 — appropriate gateway lesson.
3. All 7 items are "辦公室" office-context collocations — thematically coherent starter.
4. Phase 10 verification already performed and passed.

**Decision:** V3-W1-01 is the exclusive first V3 production wave candidate.

---

## T054 — V3-W1-01 Completeness Check

### Component Inventory

| Component | Status | Notes |
|-----------|--------|-------|
| 7 target items defined | ✅ | item_coll_run_out_of through item_coll_give_out |
| 24 question rows authored | ✅ | No TODO markers remaining |
| Question types | ✅ | collocation(7) + part5_sentence_completion(7) + part6_context_choice(6) + review_question(4) = 24 |
| 4 review_question_ids | ✅ | V3-W1-01_R01 through _R04 |
| App lesson row (wave1_app_lesson_draft.json) | ✅ | lesson_id=V3-W1-01, lesson_number=1 |
| Phase10 verification | ✅ | 17/17 checks passed |
| 7 vocab items in seed_draft | ✅ | Authored with examples and trap cues |
| Error code consistency | ✅ | COLLOCATION_GAP(7) + SCENE_VOCAB_GAP(6) + VOCAB_WEAK_RECALL(11) = 24 (see note) |
| **Answer distribution** | ❌ **BLOCKING** | A=5, B=9, C=5, D=5 — B over-represented (9/24 vs target 6/24) |

### Error Code Note
`VOCAB_WEAK_RECALL` (11) = part5_sentence_completion (7) + review_question (4). Per spec, part5 uses VOCAB_WEAK_RECALL ✓. part6 uses SCENE_VOCAB_GAP ✓. collocation core uses COLLOCATION_GAP ✓.

### ❌ BLOCKING ISSUE: Answer Distribution Imbalance

```
Current:  A=5, B=9, C=5, D=5
Required: A=6, B=6, C=6, D=6
Fix needed: reassign 3 B-answers to A (or C or D)
```

This must be corrected in `wave1_question_shells.json` before isolated quality audit can pass. Identify 3 questions with `correct_answer: "B"` where the correct answer can be moved to a different slot by rotating options, then update accordingly.

**Affected questions with B:** V3-W1-01_Q01, Q04, Q06, Q08, Q10, Q13, R02, R04 (and one more — verify full list from question shell file before fixing).

### Note on `unresolved_target_count: 7`
The `draft_metadata.unresolved_target_count: 7` in `wave1_app_lesson_draft.json` is legacy shell metadata. The actual items ARE authored in `wave1_vocab_items_seed_draft.json`. Update this field to `0` before promotion.

---

## T055 — Part6 Context Validation

### Findings

| Check | Result |
|-------|--------|
| 6 part6_context_choice rows | ✅ |
| Multi-sentence embedded passages | ✅ (phase10 `part6_passage_shape` check passed) |
| Separate `passage_context` or `context_block` field | ⚠️ Not present — context embedded in `question_text` |
| Error code (SCENE_VOCAB_GAP) | ✅ Matches spec |
| Estimated time (45s) | ✅ Matches spec |
| Distractor pattern (wrong_verb_collocation) | ✅ Consistent |

### Part6 Context Design

The 6 part6 rows use multi-sentence question_text that includes both context and the fill-in blank sentence (e.g., "The office manager expected the printer cartridges to last through Friday. However... By noon, we had ______ toner..."). This is functionally equivalent to a TOEIC Part 6 passage but embedded rather than separated.

**Schema note:** Production V2 lessons don't use part6, so there is no established production `passage_context` field precedent. Keeping context in `question_text` is acceptable for the first V3 wave. A separate `passage_context` field can be added in a future schema upgrade if UI rendering requires it (ISSUE-013 extension).

**Distractor quality:** All 6 part6 rows use run-family distractors (run through / run into / run by vs. run out of). These are plausible verb-phrase confusions at TOEIC difficulty. Human review should confirm all distractors are semantically distinct within the passage context.

---

## T056 — Old-Item Interference Check

**V3-W1-01 is the first V3 production lesson.** No prior same-stage V3 review_question_ids exist, so no old-item pressure is required. This mirrors the V2-A-71 policy (first lesson in stage = no pressure obligation).

**Gap:** None. Old-item pressure will be required for V3-W1-02 onward (must include 1 review_question_id from V3-W1-01).

---

## T057 — Single vs. Double Lesson First Wave

**Decision: Single-lesson first wave.**

| Factor | Assessment |
|--------|-----------|
| Authored lessons available | 1 (V3-W1-01 only) |
| Minimum for paired wave | 2 authored lessons |
| V3-W1-02 status | Shell-only — requires full authoring pipeline |
| Risk of single-lesson wave | Low — V2-A-71 set the precedent successfully |

**Rationale:** Forcing a paired wave would require authoring V3-W1-02 (24 more rows) before any V3 content reaches production. A single-lesson promotion gets real learner signal on V3 structure sooner and reduces risk of systemic errors propagating across a large batch.

**Follow-up:** After V3-W1-01 is in production, author V3-W1-02 using the same T031-T040 pipeline. Pair V3-W1-02 with V3-W1-03 for the second V3 wave (avoiding repeated single-lesson overhead).

---

## T058 — Promotion Slice Script and Schema Conversion Plan

### Existing Script
`scripts/apply-phase10-wave1-slice.js` exists and patches question content from `QUESTION_PATCHES` object into `wave1_question_shells.json`. It was used to generate the V3-W1-01 authored slice.

### Pre-Promotion Conversion Tasks (ordered)

| Step | Task | Tool / File |
|------|------|-------------|
| 1 | Fix answer distribution: 3 B→other corrections in `wave1_question_shells.json` | Manual edit |
| 2 | Update `unresolved_target_count: 0` in `wave1_app_lesson_draft.json` for V3-W1-01 | Manual edit |
| 3 | Resolve question_id naming: decide whether to normalize to snake_case (e.g., `v3_w1_01_q_001`) or keep `V3-W1-01_Q01` format | Decision needed — see note below |
| 4 | Run isolated full quality audit on V3-W1-01 alone | `node scripts/audit-quality-full.js` with VOCAB_AUDIT_ROOT |
| 5 | Fix any audit blocking issues | As needed |
| 6 | Add 7 vocab items to `data/vocab/vocab_items.json` | Merge from `wave1_vocab_items_seed_draft.json` |
| 7 | Add 24 question rows to `data/vocab/questions_v3a.json` | Manual slice or script |
| 8 | Add lesson row to `data/vocab/curriculum.json` | Manual |
| 9 | Bump seed_version in 3 files simultaneously | See seed governance |
| 10 | Create seed change record | `docs/seed-changes/` |
| 11 | Run `npm run test:all` + Playwright | Full release gate |

### Question ID Naming Decision

Current draft: `V3-W1-01_Q01`, `V3-W1-01_R01`  
V2 production pattern: `v2_a_71_q_001`, `v2_a_71_rv_021`

**Recommendation:** Normalize V3 IDs to snake_case matching V2 pattern:  
`V3-W1-01_Q01` → `v3_w1_01_q_001`  
`V3-W1-01_R01` → `v3_w1_01_rv_021` (or `v3_w1_01_r_001` — decide review prefix)

This normalization must be applied consistently across `wave1_question_shells.json`, `wave1_app_lesson_draft.json`, and any future reference files before promotion.

---

## T059 — Seed File Mapping for V3 Production Promotion

### V3 Production Question Files

| File | Capacity (10 lessons each) | First Wave Assignment |
|------|-----------------------------|----------------------|
| `data/vocab/questions_v3a.json` | V3-W1-01 through V3-W1-10 (lessons 1–10) | ← V3-W1-01 goes here |
| `data/vocab/questions_v3b.json` | V3-W1-11 through V3-W1-20 | Future |
| `data/vocab/questions_v3c.json` | V3-W1-21 through V3-W1-30 | Future |
| `data/vocab/questions_v3d.json` | V3-W1-31 through V3-W1-40 | Future |
| `data/vocab/questions_v3e.json` | V3-W1-41 through V3-W1-50 | Future |
| `data/vocab/questions_v3f.json` | V3-W1-51 through V3-W1-60 | Future |

All 6 files are currently empty arrays `[]`. First V3 promotion writes 24 rows to `questions_v3a.json`.

### Curriculum Lesson ID Scheme for V3

V3 has 60 planned core lessons (plus mixed review). The draft uses `V3-W1-01` through `V3-W1-16` for wave 1. Production curriculum lesson IDs should follow the same pattern unless a standardized scheme is established. The V3-A-01 alternative is available but `V3-W1-01` is already embedded in question IDs and easier to keep consistent.

**Recommendation:** Keep `V3-W1-01` as the production `lesson_id`. Assign `lesson_number: 1` (V3 lessons start at 1, same as V2 starting at 71 in its own range). Revisit lesson_number scheme when V3 reaches 10+ lessons.

---

## T060 — Human Review Schedule for V3-W1-01

### Review Scope

Minimum sample: 25% of 24 rows = 6 questions  
**Recommended full review of:** all 6 part6 questions + all 4 review_question rows = 10 questions (42%)

### Priority Review Queue

| Priority | Question IDs | Review Focus |
|----------|-------------|-------------|
| P0 | V3-W1-01_Q15 to _Q20 (part6 × 6) | Passage authenticity — does multi-sentence context match real TOEIC Part 6 style? Distractor plausibility within passage? |
| P0 | V3-W1-01_R01 to _R04 (review × 4) | Distinct from core questions? Tests recall vs. recognition? Explanation quality? |
| P1 | V3-W1-01_Q01, _Q03, _Q05, _Q07, _Q09, _Q11, _Q13 (collocation core × 7) | Item irreplaceability — can any other collocation fit? Distractor set completeness |
| P2 | V3-W1-01_Q02, _Q04, _Q06, _Q08, _Q10, _Q12, _Q14 (part5 × 7) | Part5 sentence naturalness, distractor grammar correctness |

### Review Checklist (per question)

1. Does the target collocation appear as the uniquely correct answer? (no synonym escape)
2. Are all 3 distractors plausible confusions (same verb stem / same function word)?
3. Does the explanation_zh identify WHY the distractors are wrong (not just why the answer is right)?
4. For part6: does the multi-sentence context provide enough information to rule out distractors without making the answer trivially obvious?
5. Is the question_text grammatically natural in an office/TOEIC context?

### SLA
Human review must be complete before the isolated full quality audit (Step 4 in T058 plan) is run on V3-W1-01.

---

## Summary of T051-T060 Outcomes

| Task | Status | Key Finding |
|------|--------|-------------|
| T051 | ✅ Complete | Only V3-W1-01 (24 rows) is a promotion candidate; 15 other lessons are shell-only |
| T052 | ✅ Complete | Promotion subset = V3-W1-01 only (24/384 rows) |
| T053 | ✅ Complete | V3-W1-01 (辦公室 Level A collocations) selected as first V3 wave candidate |
| T054 | ✅ Complete | **1 blocking issue found**: answer distribution B=9 (target 6/6/6/6) — must fix before audit |
| T055 | ✅ Complete | Part6 context embedded in question_text, passes phase10 check; no separate field needed yet |
| T056 | ✅ Complete | First V3 lesson — no old-item pressure required |
| T057 | ✅ Complete | Single-lesson first V3 wave; pair V3-W1-02+03 for wave 2 |
| T058 | ✅ Complete | 11-step promotion plan documented; question_id normalization decision needed |
| T059 | ✅ Complete | V3-W1-01 → `questions_v3a.json`; 10 lessons per file for 60-lesson V3 |
| T060 | ✅ Complete | Human review schedule: P0=part6+review (10q), P1=collocation core (7q), P2=part5 (7q) |

### Immediate Next Action for V3-W1-01 Promotion

1. **Fix answer distribution** — correct 3 questions to reassign B-answers (removes only blocking issue)  
2. **Complete human review** — P0 items (10 questions) per T060 schedule  
3. **Run isolated audit** — same isolated environment pattern as V2-A-71/72/73  
4. **Create candidate draft pack** — equivalent to `v2_a_73_candidate_draft_pack.json` for V3-W1-01

**V3-W1-01 promotion is gated on fixing answer distribution and completing human review. Everything else is already in place.**
