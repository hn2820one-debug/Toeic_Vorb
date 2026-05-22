# Minimum Usable Content Packs

Status: Active rebuild planning standard
Last updated: 2026-05-20
Scope: Program B V1-V3 draft and production content rebuilds

This document defines the smallest content packages worth reviewing before any large-scale question-bank expansion. It complements `docs/rebuild-wave-release-gate.md`: this file defines the package shape; the release gate decides whether a package may be promoted.

Current production now contains the first rebuilt wave, `V2-A-71`, with 1 runnable lesson and 24 question rows. The remaining sample rows and references below are planning or draft-only unless a future task explicitly promotes them through the release gate.

---

## 1. Why This Exists

The old production bank was cleared because too much content was expanded before quality controls were stable. Future rebuild work should first prove each question type with a small, complete package:

- complete lesson and review wiring;
- real `target_item_id` coverage;
- high-quality questions, distractors, and Traditional Chinese explanations;
- automated verification;
- one seed-to-lesson-to-review-to-export smoke path before scale-up.

Large expansion should start only after the relevant minimum pack passes.

---

## 2. Package Summary

| Pack | Stage | Minimum lessons | Minimum rows | Review requirement | First sample status |
|---|---|---:|---:|---|---|
| `MUP-V1-01` | V1 Word Family | 2 | 64 | 4 review rows in the normal lesson; speed lesson has 0 review rows | Draft samples defined in `minimum_usable_packs.json` |
| `MUP-V2-01` | V2 Scene Vocabulary | 1 | 24 | 4 direct-meaning review rows, one per core scene item | Draft samples defined in `minimum_usable_packs.json` |
| `MUP-V3-01` | V3 Collocation | 1 | 24 | 4 review rows in the authored draft slice | Existing `V3-W1-01` draft slice |

Machine-readable artifact:

```text
drafts/v0-v3-rebuild/minimum_usable_packs.json
```

Verifier:

```powershell
node scripts/verify-minimum-usable-packs.js
```

---

## 3. V1 Minimum Pack

Pack ID: `MUP-V1-01`

Purpose: prove the normal word-family lesson surface and speed-drill runtime surface before expanding V1.

Minimum lesson set:

| Lesson | Role | Rows |
|---|---|---:|
| `V1-C-29` | Normal word-family lesson | 20 session + 4 review |
| `V1-F-53` | Speed-drill lesson | 40 session + 0 review |

Required type coverage:

- `word_family`
- `part5_sentence_completion`
- `collocation`
- `speed_drill`
- `review_question`

First sample target items:

- `item_finance_family`
- `item_budget_family`
- `item_confirm_family`
- `item_apply_family`

Review requirement:

- The normal lesson must include 4 `review_question` rows.
- The speed lesson does not need review rows, but it must prove the 8-second speed path.
- At least one wrong V1 answer in smoke testing should enter review/export data with a word-family error signal.

---

## 4. V2 Minimum Pack

Pack ID: `MUP-V2-01`

Purpose: prove scene-labeled TOEIC vocabulary prompts, same-scene distractors, and direct-meaning review rows.

Minimum lesson set:

| Lesson | Role | Rows |
|---|---|---:|
| `V2-A-71` | Office-administration scene baseline | 20 session + 4 review |

Required type coverage:

- `scene_vocabulary`
- `review_question`

First sample target items:

- `item_v2_v2_a_71_extension`
- `item_v2_v2_a_71_photocopier`
- `item_v2_v2_a_71_stationery`
- `item_v2_v2_a_71_workstation`

Review requirement:

- Each of the four scene items needs one direct-meaning `review_question`.
- Review rows must obey the semantic-meaning uniqueness policy.
- Scene prompts must begin with a matching scene label, such as `Office:`.

---

## 5. V3 Minimum Pack

Pack ID: `MUP-V3-01`

Purpose: reuse the existing high-quality authored V3 draft slice as the first collocation package reference.

Minimum lesson set:

| Lesson | Role | Rows |
|---|---|---:|
| `V3-W1-01` | Existing authored V3 Wave 1 draft slice | 20 session + 4 review |

Required type coverage:

- `collocation`
- `part5_sentence_completion`
- `part6_context_choice`
- `review_question`

First sample target items:

- `item_coll_run_out_of`
- `item_coll_set_up`
- `item_coll_drop_by`
- `item_coll_look_over`
- `item_coll_run_into`
- `item_coll_pick_up`
- `item_coll_give_out`

Verification:

```powershell
node scripts/verify-phase10-slice.js
```

Gate decision:

- Accepted as a draft authoring reference.
- Not production-releaseable until the production merge order, production IDs, final V3 type distribution, seed version, and full release smoke test are resolved.

---

## 6. Required Checks Before Scale-Up

Before expanding any stage beyond its minimum pack:

- Run `node scripts/verify-minimum-usable-packs.js`.
- Run stage-specific draft verifiers, such as `node scripts/verify-phase10-slice.js` for `V3-W1-01`.
- Record export feedback using `docs/export-analysis-feedback-governance.md` after smoke attempts exist.
- Run `npm run test:docs` after documentation edits.
- Run `npm run test:all` after the final edit set.
- Record a human review covering content quality, semantic sense, error-code mapping, A/B/C/D distribution, explanations, distractors, review pressure, and the smoke path.

Production promotion still requires the full release gate in `docs/rebuild-wave-release-gate.md`.
