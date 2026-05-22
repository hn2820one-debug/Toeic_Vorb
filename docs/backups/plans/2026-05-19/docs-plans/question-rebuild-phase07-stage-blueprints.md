# Question Rebuild Phase 07 — Stage Blueprints

Generated: 2026-05-18
Last verified: 2026-05-18 (`node scripts/verify-phase7-stage-map.js --write`)
Status: done — all five steps (31–35) resolved in this document.

This document is the Phase 7 deliverable for the V0-V3 rebuild plan (`docs/plans/questions plan.md`). It freezes structural planning decisions for all four production stages so that later content authoring, script generation, and production merges have a stable foundation to build on.

**Production impact: none.** This document is a planning artifact. No question rows, lesson rows, or seed versions are changed here.

Machine-readable companion: [../../drafts/v0-v3-rebuild/stage_map_v0_v3.json](../../drafts/v0-v3-rebuild/stage_map_v0_v3.json)

---

## Step 31 — Full V0-V3 Stage Map

### Global Lesson Numbering Policy

Lesson IDs use the format `{stage}-{group}-{nn}` where `nn` is a global sequential integer shared across all V0-V3 core lessons.

| Range | Stage-Group | Lesson type | Count |
| ---: | --- | --- | ---: |
| V0-01 | V0 (single diagnostic) | diagnostic | 1 |
| V1-A-11 to V1-A-20 | V1-A | word_family | 10 |
| V1-B-21 to V1-B-28 | V1-B | word_family | 8 |
| V1-C-29 to V1-C-36 | V1-C | word_family | 8 |
| V1-D-37 to V1-D-44 | V1-D | word_family | 8 |
| V1-E-45 to V1-E-52 | V1-E | word_family | 8 |
| V1-F-53 to V1-F-70 | V1-F | speed_drill | 18 |
| V2-A-71 to V2-A-80 | V2-A | scene_vocabulary | 10 |
| V2-B-81 to V2-B-90 | V2-B | scene_vocabulary | 10 |
| V2-C-91 to V2-C-100 | V2-C | scene_vocabulary | 10 |
| V2-D-101 to V2-D-110 | V2-D | scene_vocabulary | 10 |
| V2-E-111 to V2-E-120 | V2-E | scene_vocabulary | 10 |
| V2-MR-01 to V2-MR-10 | V2-MR | mixed_review | 10 |
| V3-A-121 to V3-A-130 | V3-A | collocation | 10 |
| V3-B-131 to V3-B-140 | V3-B | collocation | 10 |
| V3-C-141 to V3-C-150 | V3-C | collocation | 10 |
| V3-D-151 to V3-D-160 | V3-D | collocation | 10 |
| V3-E-161 to V3-E-170 | V3-E | collocation | 10 |
| V3-F-171 to V3-F-180 | V3-F | collocation | 10 |
| V3-MR-01 to V3-MR-12 | V3-MR | mixed_review | 12 |
| **Total** | | | **193** |

**Numbering rationale.** V1 historically started at 11 because V0 had 10 lessons that were later consolidated into 1 diagnostic. The existing `vocab_items.json` already uses V1-A-11 through V1-F-70 IDs; those are preserved. V2 starts at 71 (immediately after V1-F-70). V3 starts at 121 (immediately after V2 core ends at 120). Mixed-review lessons use a per-stage `{stage}-MR-{nn}` counter so they never collide with core lesson numbering.

### Question File Assignment

| File | Group | Core lessons | Question rows |
| --- | --- | ---: | ---: |
| questions_v0.json | V0 | 1 | 31 |
| questions_v1a.json | V1-A | 10 | 240 |
| questions_v1b.json | V1-B | 8 | 192 |
| questions_v1c.json | V1-C | 8 | 192 |
| questions_v1d.json | V1-D | 8 | 192 |
| questions_v1e.json | V1-E | 8 | 192 |
| questions_v1f.json | V1-F | 18 | 720 |
| questions_v2a.json | V2-A | 10 | 240 |
| questions_v2b.json | V2-B | 10 | 240 |
| questions_v2c.json | V2-C | 10 | 240 |
| questions_v2d.json | V2-D | 10 | 240 |
| questions_v2e.json | V2-E | 10 | 240 |
| questions_v3a.json | V3-A | 10 | 240 |
| questions_v3b.json | V3-B | 10 | 240 |
| questions_v3c.json | V3-C | 10 | 240 |
| questions_v3d.json | V3-D | 10 | 240 |
| questions_v3e.json | V3-E | 10 | 240 |
| questions_v3f.json | V3-F | 10 | 240 |
| **Total** | | **193 core** | **4,399** |

Mixed-review lessons (V2-MR and V3-MR) do not create new question rows. They reference existing `review_question` rows from prior same-stage core lessons and are assembled by `scripts/add-mixed-review-lessons.js`.

**Naming gap (Step 39):** Phase 7 freezes `V2-MR-*` / `V3-MR-*` lesson IDs. The current mixed-review script still emits `V2-MIX-*` / `V3-MIX-*`. Reconcile the script, audit fixtures, and any historical docs in Step 39 before production merge.

### Consistency Checks

| Check | Expected | Result |
| --- | ---: | --- |
| Grand total lessons | 193 | ✅ 1+60+60+72 = 193 |
| Grand total question rows | 4,399 | ✅ 31+1728+1200+1440 = 4399 |
| Total question files | 18 | ✅ 1+6+5+6 = 18 |
| V1 total lessons | 60 | ✅ 10+8+8+8+8+18 = 60 |
| V1 total question rows | 1,728 | ✅ 240+192×4+720 = 1728 |
| V2 core lessons | 50 | ✅ 10×5 = 50 |
| V2 question rows | 1,200 | ✅ 50×24 = 1200 |
| V3 core lessons | 60 | ✅ 10×6 = 60 |
| V3 question rows | 1,440 | ✅ 60×24 = 1440 |
| V2 MR source coverage | 50 core | ✅ 10 MR × 5 sources = 50 |
| V3 MR source coverage | 60 core | ✅ 12 MR × 5 sources = 60 |

### Production Merge Order

Stages should be merged in dependency order:

1. V1 — no cross-stage dependencies; word family items already exist in `vocab_items.json`
2. V0 — diagnostic samples from V1-V3 vocab items; merge after V1 items are confirmed
3. V2 — scene vocabulary items may need new `vocab_items.json` rows; merge after V1
4. V3 — collocation items definitely need new `vocab_items.json` rows (Wave 1 draft exists); merge after V2

Each merge requires a seed-version bump in the three sync locations and a full release gate run.

---

## Step 32 — V0 Diagnosis Blueprint

### Overview

| Parameter | Value |
| --- | --- |
| Stage | V0 |
| Stage name | Diagnosis |
| Lesson ID | V0-01 |
| Lesson type | diagnostic |
| Question file | questions_v0.json |
| Total question rows | 31 |
| distractor_type | toeic_realistic |
| default_error_code | VOCAB_UNKNOWN |
| Difficulty range | 1–2 only |

### Lesson Structure

```
question_ids:        19 rows
review_question_ids: 12 rows
Total:               31 rows
```

### Question Type Distribution

| Type | Count in question_ids | Purpose |
| --- | ---: | --- |
| `meaning_choice` | 12 | Core diagnostic — tests broad TOEIC word meaning recognition |
| `scene_vocabulary` | 1 | Preview V2 scene-context format |
| `collocation` | 1 | Preview V3 collocation format |
| `formal_phrase` | 1 | Preview formal-phrase awareness |
| `false_friend` | 1 | Preview false-friend trap awareness |
| `part5_sentence_completion` | 1 | Preview TOEIC Part 5 format |
| `part6_context_choice` | 1 | Preview TOEIC Part 6 format |
| `speed_drill` | 1 | Preview speed format |
| **question_ids subtotal** | **19** | |
| `review_question` | 12 | Diagnostic review set |
| **Total rows** | **31** | |

### Authoring Rules

- The 12 `meaning_choice` questions sample broadly across V1-V3 vocabulary to identify blind spots before V1 starts.
- Each target item appears at most once in V0 (same `target_item_id` + same semantic meaning constraint applies).
- Difficulty is 1–2 only; no difficulty-3 questions in V0.
- The 7 non-`meaning_choice` questions in `question_ids` use one each of the other TOEIC formats as format previews — not depth tests.
- V0 `question_id` format: `v0_v0-01_q_001` through `v0_v0-01_q_019`
- V0 `review_question_id` format: `v0_v0-01_rv_001` through `v0_v0-01_rv_012`

### Vocab Item Source

V0 diagnostic items are a sampler drawn from the vocabulary pool established by V1-V3. Since V1 vocab items already exist in `vocab_items.json`, V0 can draw from those immediately. V2/V3 diagnostic items should be confirmed after V2/V3 item rows are merged.

---

## Step 33 — V1 Word-Family Blueprint

### Overview

| Parameter | Value |
| --- | --- |
| Stage | V1 |
| Stage name | Word Family |
| Total lessons | 60 (groups A–F) |
| Total question rows | 1,728 |
| Question files | questions_v1a.json through questions_v1f.json |
| distractor_type | same_word_family |
| default_error_code | WORD_FAMILY_POS |

### Lesson Groups

| Group | Lesson ID range | Count | File | Lesson type | Core / Review per lesson | Rows per lesson | Group total rows |
| --- | --- | ---: | --- | --- | --- | ---: | ---: |
| A | V1-A-11 to V1-A-20 | 10 | questions_v1a.json | word_family | 18 / 6 | 24 | 240 |
| B | V1-B-21 to V1-B-28 | 8 | questions_v1b.json | word_family | 20 / 4 | 24 | 192 |
| C | V1-C-29 to V1-C-36 | 8 | questions_v1c.json | word_family | 20 / 4 | 24 | 192 |
| D | V1-D-37 to V1-D-44 | 8 | questions_v1d.json | word_family | 20 / 4 | 24 | 192 |
| E | V1-E-45 to V1-E-52 | 8 | questions_v1e.json | word_family | 20 / 4 | 24 | 192 |
| F | V1-F-53 to V1-F-70 | 18 | questions_v1f.json | speed_drill | 40 / 0 | 40 | 720 |
| **Total** | | **60** | | | | | **1,728** |

### Question Type Mix Per Lesson

**V1-A (18 question_ids + 6 review_question_ids):**

| Type | Count | Role |
| --- | ---: | --- |
| `word_family` | 8 | Grammatical form choice — tests noun / verb / adjective / adverb |
| `part5_sentence_completion` | 4 | TOEIC Part 5 single-sentence fill-in |
| `collocation` | 2 | Phrase-level usage in context |
| `speed_drill` | 4 | Fast recall practice — new sentences only |
| `review_question` | 6 | V1-A review pool |
| **Total** | **24** | |

**V1-B through V1-E (20 question_ids + 4 review_question_ids):**

| Type | Count | Role |
| --- | ---: | --- |
| `word_family` | 8 | |
| `part5_sentence_completion` | 5 | |
| `collocation` | 3 | |
| `speed_drill` | 4 | |
| `review_question` | 4 | |
| **Total** | **24** | |

**V1-F (40 question_ids + 0 review_question_ids):**

| Type | Count | Role |
| --- | ---: | --- |
| `speed_drill` | 40 | All questions are speed_drill; no review pool |
| **Total** | **40** | |

### V1-Specific Authoring Rules

- All question types within a V1 lesson use `distractor_type: same_word_family` and `default_error_code: WORD_FAMILY_POS` — lesson-level consistency, not type-level.
- Every sentence in a `word_family` question must be unique to that lesson. No sentence may appear in any other V1 lesson regardless of type.
- Options for `word_family` questions must always present all four grammatical forms of the target root.
- `speed_drill` sentences must be newly written — never copied from `word_family` or `part5_sentence_completion` questions in the same or earlier V1 lessons.
- V1-F lessons (speed_drill only) have no `review_question_ids`. The 40 speed_drill questions per lesson use all-new sentences.

### Vocab Item Source

V1 word-family items already exist in `data/vocab/vocab_items.json` (items with `item_type: "word_family"`). The rebuild writes new question content that references these existing item IDs. No new vocab item rows are needed for V1 unless new word families are explicitly added.

---

## Step 34 — V2 Scene-Vocabulary Blueprint

### Overview

| Parameter | Value |
| --- | --- |
| Stage | V2 |
| Stage name | TOEIC Scene Vocabulary |
| Total lessons | 60 (50 core + 10 mixed_review) |
| Total question rows | 1,200 (core only; MR reuses rows) |
| Question files | questions_v2a.json through questions_v2e.json |
| distractor_type | same_scene_vocabulary |
| default_error_code | SCENE_VOCAB_GAP |

### Core Lesson Groups

| Group | Lesson ID range | Count | File | Suggested scenes | Question rows |
| --- | --- | ---: | --- | --- | ---: |
| A | V2-A-71 to V2-A-80 | 10 | questions_v2a.json | HR, Staffing, Recruitment, Training, Performance Review | 240 |
| B | V2-B-81 to V2-B-90 | 10 | questions_v2b.json | Finance, Accounting, Banking, Budgeting, Payments | 240 |
| C | V2-C-91 to V2-C-100 | 10 | questions_v2c.json | Office Administration, Meetings, Correspondence, Scheduling | 240 |
| D | V2-D-101 to V2-D-110 | 10 | questions_v2d.json | Supply Chain, Purchasing, Inventory, Manufacturing, Logistics | 240 |
| E | V2-E-111 to V2-E-120 | 10 | questions_v2e.json | Customer Service, Marketing, Travel, Contracts, Legal | 240 |
| **Total core** | | **50** | | | **1,200** |

### Core Lesson Question Structure

Each V2 core lesson has 20 base `scene_vocabulary` questions plus old-item review pressure:

| Lesson position | question_ids count | Notes |
| --- | ---: | --- |
| First core lesson (V2-A-71) | 20 | No review pressure — first same-stage lesson |
| Second core lesson | 21 | +1 prior `review_question` row |
| Third and later | 22 | +2 prior `review_question` rows |

`review_question_ids` per core lesson: always 4.

Base type mix (20 same-lesson questions):

| Type | Count | Role |
| --- | ---: | --- |
| `scene_vocabulary` | 20 | Core fill-in — scene label prefix required |
| `review_question` | 4 | V2 review pool for this lesson |
| prior `review_question` | 0–2 | Old-item pressure rows (existing rows, not new) |

### Mixed-Review Assembly

V2 has 10 mixed_review lessons (V2-MR-01 through V2-MR-10). Each draws 20 `question_ids` from the `review_question_ids` of the 5 preceding same-stage core lessons (4 per lesson × 5 = 20). No new question rows are created.

| Mixed-review lesson | Source core lessons |
| --- | --- |
| V2-MR-01 | V2-A-71 through V2-A-75 |
| V2-MR-02 | V2-A-76 through V2-A-80 |
| V2-MR-03 | V2-B-81 through V2-B-85 |
| V2-MR-04 | V2-B-86 through V2-B-90 |
| V2-MR-05 | V2-C-91 through V2-C-95 |
| V2-MR-06 | V2-C-96 through V2-C-100 |
| V2-MR-07 | V2-D-101 through V2-D-105 |
| V2-MR-08 | V2-D-106 through V2-D-110 |
| V2-MR-09 | V2-E-111 through V2-E-115 |
| V2-MR-10 | V2-E-116 through V2-E-120 |

### V2-Specific Authoring Rules

- Every `scene_vocabulary` question must start with a scene label followed by a colon: `"Finance: ..."`, `"HR: ..."`, etc.
- The blank (`______`) must uniquely fit the target word — no distractor should be both grammatically and semantically valid in context.
- Old-item review pressure rows must reference earlier same-stage items only. No V3, V4, or future items.
- V2-A-71 is a first-lesson policy exception — no review pressure.

### Vocab Item Source

V2 scene vocabulary items may already exist in `vocab_items.json`. Any new scene vocab words introduced in V2 require new vocab item rows before the production merge.

---

## Step 35 — V3 Collocation-First Blueprint

### Overview

| Parameter | Value |
| --- | --- |
| Stage | V3 |
| Stage name | Collocation |
| Total lessons | 72 (60 core + 12 mixed_review) |
| Total question rows | 1,440 (core only; MR reuses rows) |
| Question files | questions_v3a.json through questions_v3f.json |
| distractor_type | wrong_verb_collocation |
| default_error_code | COLLOCATION_GAP |

### Core Lesson Groups

| Group | Lesson ID range | Count | File | Wave / Topic coverage | Question rows |
| --- | --- | ---: | --- | --- | ---: |
| A | V3-A-121 to V3-A-130 | 10 | questions_v3a.json | Wave 1 first 10 lessons | 240 |
| B | V3-B-131 to V3-B-140 | 10 | questions_v3b.json | Wave 1 final 6 + Wave 2 start 4 | 240 |
| C | V3-C-141 to V3-C-150 | 10 | questions_v3c.json | Wave 2 (Finance, Banking, Procurement) | 240 |
| D | V3-D-151 to V3-D-160 | 10 | questions_v3d.json | Wave 3 (Customer Service, Marketing, Retail) | 240 |
| E | V3-E-161 to V3-E-170 | 10 | questions_v3e.json | Wave 4 (Travel, Transportation, Manufacturing) | 240 |
| F | V3-F-171 to V3-F-180 | 10 | questions_v3f.json | Wave 5 (Legal, Contracts, Compliance, Media) | 240 |
| **Total core** | | **60** | | | **1,440** |

### Core Lesson Question Structure

Each V3 core lesson has 20 base questions plus old-item review pressure:

| Lesson position | question_ids count | Notes |
| --- | ---: | --- |
| First core lesson (V3-A-121) | 20 | No review pressure — first same-stage lesson |
| Second core lesson | 21 | +1 prior `review_question` row |
| Third and later | 22 | +2 prior `review_question` rows |

`review_question_ids` per core lesson: always 4.

Base type mix (20 same-lesson questions):

| Type | Count | Role |
| --- | ---: | --- |
| `part6_context_choice` | 12 | 2–4 sentence mini-passage collocation test |
| `collocation` | 4 | Direct collocation fill-in |
| `part5_sentence_completion` | 4 | Single-sentence TOEIC Part 5 |
| `review_question` | 4 | V3 review pool for this lesson |
| prior `review_question` | 0–2 | Old-item pressure rows (existing rows, not new) |

### Mixed-Review Assembly

V3 has 12 mixed_review lessons (V3-MR-01 through V3-MR-12). Each draws from 5 preceding core lessons (4 review_questions × 5 = 20).

| Mixed-review lesson | Source core lessons |
| --- | --- |
| V3-MR-01 | V3-A-121 through V3-A-125 |
| V3-MR-02 | V3-A-126 through V3-A-130 |
| V3-MR-03 | V3-B-131 through V3-B-135 |
| V3-MR-04 | V3-B-136 through V3-B-140 |
| V3-MR-05 | V3-C-141 through V3-C-145 |
| V3-MR-06 | V3-C-146 through V3-C-150 |
| V3-MR-07 | V3-D-151 through V3-D-155 |
| V3-MR-08 | V3-D-156 through V3-D-160 |
| V3-MR-09 | V3-E-161 through V3-E-165 |
| V3-MR-10 | V3-E-166 through V3-E-170 |
| V3-MR-11 | V3-F-171 through V3-F-175 |
| V3-MR-12 | V3-F-176 through V3-F-180 |

### V3 Wave Structure

V3 is built in authoring waves across 60 core lessons:

| Wave | Draft lessons | Production ID range (approx) | Topics | Status |
| --- | ---: | --- | --- | --- |
| Wave 1 | 16 | V3-A-121 to V3-B-136 | 辦公室, 文書作業, 商務會議, 業務協調, 人事與組織 | Draft in `drafts/collocation-rebuild/` |
| Wave 2 | ~14 | V3-B-137 to V3-C-150 | Finance, Banking, Procurement, Supply Chain | Pending |
| Wave 3 | ~10 | V3-D-151 to V3-D-160 | Customer Service, Marketing, Retail | Pending |
| Wave 4 | ~10 | V3-E-161 to V3-E-170 | Travel, Transportation, Manufacturing | Pending |
| Wave 5 | ~10 | V3-F-171 to V3-F-180 | Legal, Contracts, Compliance, Media | Pending |

Wave 1 topic breakdown (16 lessons):

| Topic | Lessons in Wave 1 |
| --- | ---: |
| 辦公室 (Office) | 3 |
| 文書作業 (Documents & Admin) | 4 |
| 商務會議 (Business Meetings) | 3 |
| 業務協調 (Business Coordination) | 4 |
| 人事與組織 (Personnel & Organization) | 2 |
| **Total** | **16** |

**Production ID freeze:** The exact mapping of Wave 1 draft IDs (`V3-W1-01` through `V3-W1-16`) to production IDs (`V3-A-121` onward) is frozen in Step 40, not here.

### V3-Specific Authoring Rules

- Questions must test collocational knowledge, not word meaning. A test-taker who knows the word's meaning but not its collocations should still find the question challenging.
- Distractors must be grammatically legal but collocationally wrong (`make a decision` vs `do a decision`).
- `part6_context_choice` requires a 2–4 sentence mini-passage before the question sentence.
- Old-item review pressure must use earlier same-stage items only.
- V3-A-121 is the first-lesson policy exception — no review pressure.

### Vocab Item Source

Wave 1: 100 draft collocation items are in `drafts/collocation-rebuild/wave1_vocab_items_seed_draft.json`. These must be reviewed and merged into `data/vocab/vocab_items.json` before any Wave 1 questions can be production-merged. Waves 2+: additional collocation items to be identified and drafted in future wave planning steps.

---

## Phase 7 Verification

Verified on 2026-05-18 against the empty-bank production baseline.

Automated verifier: [../../scripts/verify-phase7-stage-map.js](../../scripts/verify-phase7-stage-map.js)

```powershell
node scripts/verify-phase7-stage-map.js
node scripts/verify-phase7-stage-map.js --write
```

Latest run: **57 checks passed**, **0 errors**, **1 warning** (mixed-review script still uses `V2-MIX` / `V3-MIX` IDs).

| Check | Result |
| --- | --- |
| Grand total lessons | ✅ 193 (1+60+60+72) |
| Grand total question rows | ✅ 4,399 (31+1728+1200+1440) |
| Total question files | ✅ 18 (1+6+5+6) |
| Lesson ID ranges | ✅ All 20 frozen ranges match `from..to` counts |
| V1 group counts | ✅ A=10, B=8, C=8, D=8, E=8, F=18 = 60 |
| V1 question row counts | ✅ 240+768+720 = 1,728 |
| V2 mixed-review coverage | ✅ 10 MR × 5 sources = 50 core lessons covered |
| V3 mixed-review coverage | ✅ 12 MR × 5 sources = 60 core lessons covered |
| V3 Wave 1 topic count | ✅ 3+4+3+4+2 = 16 draft lessons |
| Wave 1 draft cross-link | ✅ 16 lessons, 384 shells, 20+4 quota per lesson |
| Wave 1 production range plan | ✅ V3-A-121..130 + V3-B-131..136 (exact table in Step 40) |
| Production data unchanged | ✅ 0 question rows, 0 lesson rows, seed version unchanged |
| Production validation gate | ✅ `validate-vocab-data`, `audit-quality-full`, `audit-duplicates` |
| Machine-readable artifact | ✅ `drafts/v0-v3-rebuild/stage_map_v0_v3.json` — 16 embedded checks + `verification.known_gaps` |
| Mixed-review script naming | ⚠️ `add-mixed-review-lessons.js` still emits `*-MIX-*`; reconcile in Step 39 |

---

## Phase 7 Usage Rules

- This document freezes structural decisions (lesson IDs, file assignments, question counts, type mixes, mixed-review source mapping).
- Step 40 (Freeze master lesson manifest and file-splitting strategy) must confirm these decisions before any production merge. If Step 40 changes any IDs or file splits, this document must be updated.
- Do not import `stage_map_v0_v3.json` into `data/vocab/`.
- Do not bump seed version for Phase 7 — this is a planning-only phase.
- Do not begin content authoring (Step 46) ahead of Phase 7/8 sequencing and Step 40. Phase 7 is now complete; Phase 8 (future reference packs) and Step 40 are the next required gates before production merge.
- V3 Wave 1 draft (`drafts/collocation-rebuild/`) remains draft-only until Step 40 assigns final production IDs and Step 46–49 completes authoring, review, and seed merge.
