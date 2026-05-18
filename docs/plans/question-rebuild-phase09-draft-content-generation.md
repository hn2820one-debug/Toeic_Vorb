# Question Rebuild Phase 09 - Draft Content Generation

Generated: 2026-05-18
Last verified: 2026-05-18 (`node scripts/verify-phase9.js --write`)
Status: done - all five steps (41-45) resolved in this document.

This document is the Phase 9 deliverable for the V0-V3 rebuild plan ([questions plan.md](questions%20plan.md)). It freezes the draft authoring support layer for Wave 1 by extracting shared rebuild helpers, generating sentence/context, distractor, and explanation reference banks, and re-validating the Wave 1 draft item seed set.

**Production impact: none.** This document is a draft-authoring artifact. No question rows, lesson rows, seed versions, or production manifests are changed here.

Machine-readable companions:

- [../../drafts/collocation-rebuild/wave1_sentence_context_bank.json](../../drafts/collocation-rebuild/wave1_sentence_context_bank.json)
- [../../drafts/collocation-rebuild/wave1_distractor_reference_bank.json](../../drafts/collocation-rebuild/wave1_distractor_reference_bank.json)
- [../../drafts/collocation-rebuild/wave1_explanation_reference_bank.json](../../drafts/collocation-rebuild/wave1_explanation_reference_bank.json)
- [../../drafts/collocation-rebuild/wave1_vocab_items_seed_draft.json](../../drafts/collocation-rebuild/wave1_vocab_items_seed_draft.json)
- [../../drafts/collocation-rebuild/wave1_question_shells.json](../../drafts/collocation-rebuild/wave1_question_shells.json)

---

## Step 41 - Shared Generator Helpers

### Overview

| Parameter | Value |
| --- | --- |
| Shared module | [../../scripts/collocation-rebuild-helpers.js](../../scripts/collocation-rebuild-helpers.js) |
| Purpose | Remove repeated JSON/file/path helper logic from collocation rebuild scripts |
| Adopted by | [../../scripts/map-collocation-blueprint-to-app-schema.js](../../scripts/map-collocation-blueprint-to-app-schema.js), [../../scripts/generate-collocation-wave1-draft-bank.js](../../scripts/generate-collocation-wave1-draft-bank.js), [../../scripts/build-collocation-phase6-authoring-policy.js](../../scripts/build-collocation-phase6-authoring-policy.js) |

### Extracted Helper Surface

- JSON read/write helpers for draft artifact generation.
- Shared directory creation for draft outputs.
- Normalization, slug, counting, uniqueness, and repo-relative path helpers.
- Cleaner reuse so later phase builders do not duplicate file and indexing utilities.

### Result

- Core Wave 1 rebuild scripts now share one local utility layer instead of redefining the same helper functions independently.
- The helper layer is already consumed by the new Phase 9 builder and verifier, so future draft-generation slices can extend the same utility surface.

## Step 42 - Sentence/Context Reference Bank

### Overview

| Parameter | Value |
| --- | --- |
| Artifact | [../../drafts/collocation-rebuild/wave1_sentence_context_bank.json](../../drafts/collocation-rebuild/wave1_sentence_context_bank.json) |
| Entry count | 384 |
| Lesson count covered | 16 |
| Target items covered | 100 |
| Topics covered | 5 |

### Coverage

| Question type | Entries |
| --- | ---: |
| collocation | 124 |
| part5_sentence_completion | 100 |
| part6_context_choice | 96 |
| review_question | 64 |
| **Total** | **384** |

### Topic Distribution

| Topic | Entries |
| --- | ---: |
| 辦公室 | 72 |
| 文書作業 | 96 |
| 商務會議 | 72 |
| 業務協調 | 96 |
| 人事與組織 | 48 |

### Bank Role

- Each shell now has a deterministic context recipe with setting, actor, task, document, and clue.
- Each row includes a type-specific authoring focus, required context clue, banned shortcuts, and a concrete writing prompt.
- Sentence-bank target coverage is now derived directly from the current Wave 1 shell set rather than an older Phase 4 summary count.
- This bank is reference-only; it guides authoring but does not replace real question writing.

## Step 43 - Distractor Reference Bank

### Overview

| Parameter | Value |
| --- | --- |
| Artifact | [../../drafts/collocation-rebuild/wave1_distractor_reference_bank.json](../../drafts/collocation-rebuild/wave1_distractor_reference_bank.json) |
| Target items covered | 100 |
| Targets with reference candidates | 83 |
| Targets needing teacher-written slots | 70 |
| Total reference candidates | 264 |

### Candidate Source Mix

| Source type | Count |
| --- | ---: |
| same_head_family | 68 |
| surface_close | 196 |
| **Total** | **264** |

### Candidate Role Mix

| Distractor role | Count |
| --- | ---: |
| semantic_neighbor | 68 |
| wrong_particle | 173 |
| near_surface | 23 |
| **Total** | **264** |

### Bank Role

- Same-head family and near-confusable references are converted into target-level distractor candidate pools.
- Every target now has at least four total distractor authoring slots when reference candidates and teacher-written requirements are combined.
- Candidate rows remain review-only until a real authored context proves that the distractor is grammatically possible but collocationally wrong.

## Step 44 - Explanation Reference Bank

### Overview

| Parameter | Value |
| --- | --- |
| Artifact | [../../drafts/collocation-rebuild/wave1_explanation_reference_bank.json](../../drafts/collocation-rebuild/wave1_explanation_reference_bank.json) |
| Entry count | 384 |
| Source | Wave 1 question shells + Phase 6 explanation rubric |
| Language target | Traditional Chinese |

### Coverage

| Question type | Entries |
| --- | ---: |
| collocation | 124 |
| part5_sentence_completion | 100 |
| part6_context_choice | 96 |
| review_question | 64 |
| **Total** | **384** |

### Trap Focus Distribution

| Trap focus | Count |
| --- | ---: |
| semantic_neighbor | 44 |
| wrong_particle | 222 |
| near_surface | 56 |
| teacher_written_contrast | 62 |
| **Total** | **384** |

### Bank Role

- Every shell now has a type-aligned explanation template preview and an explanation-writing prompt.
- The bank aligns explanation writing with audit heuristics by requiring both rule cues and trap cues.
- Explanation-bank target coverage is now derived directly from the current Wave 1 shell set, matching the same 100-target shell baseline used by the sentence bank and distractor bank.
- The bank remains a writing guide only; authored explanations still need manual editorial review.

## Step 45 - Rebuild The First Draft Item Seed Set

### Overview

| Parameter | Value |
| --- | --- |
| Seed artifact | [../../drafts/collocation-rebuild/wave1_vocab_items_seed_draft.json](../../drafts/collocation-rebuild/wave1_vocab_items_seed_draft.json) |
| Question shell artifact | [../../drafts/collocation-rebuild/wave1_question_shells.json](../../drafts/collocation-rebuild/wave1_question_shells.json) |
| Draft vocab item rows | 100 |
| Draft question shells | 384 |

### Regeneration Status

- [../../scripts/map-collocation-blueprint-to-app-schema.js](../../scripts/map-collocation-blueprint-to-app-schema.js) reran successfully after Step 41 helper extraction.
- [../../scripts/generate-collocation-wave1-draft-bank.js](../../scripts/generate-collocation-wave1-draft-bank.js) rebuilt the Wave 1 seed rows and question shells with unchanged structural totals.
- The draft seed set is now treated as a verified authoring baseline rather than only an earlier in-progress artifact.

## Verification Summary

Verified by [../../scripts/verify-phase9.js](../../scripts/verify-phase9.js).

| Check | Result |
| --- | --- |
| Total automated checks | 16 |
| Passed | 16 |
| Failed | 0 |
| Sentence/context entries | 384 |
| Distractor targets | 100 |
| Distractor candidates | 264 |
| Explanation entries | 384 |

Verification confirms:

- Shared helper extraction is adopted by the core collocation rebuild scripts.
- Wave 1 draft seed rows remain at 100 items and 384 question shells after regeneration.
- Sentence/context and explanation banks fully cover the 384 Wave 1 shells.
- Sentence/context, distractor, and explanation artifacts now verify both counts and exact shell-alignment for `question_id` / `target_item_id` sets.
- Distractor bank covers all 100 targets and preserves a minimum four-slot authoring floor via reference candidates plus teacher-written requirements.
- All Phase 9 outputs remain draft-only and block production merge.

## Phase 9 Usage Rules

- Re-run `node scripts/verify-phase9.js --write` after any edit to the helper layer, Phase 9 banks, or this document.
- Keep the Phase 9 banks under `drafts/collocation-rebuild/`; they are authoring references, not production seed files.
- Use these banks to replace TODO shells in Step 46, not to claim content is authored already.
- Do not bump seed version for Phase 9; production seed data is still unchanged.