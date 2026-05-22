# Example Seed Change Record

This is a demonstration only. It shows how to fill the required seed-change record. It is not current repository truth and must not be used to infer the active production seed.

Record status: example
Change date: 2026-05-20
Owner: GitHub Copilot
PR / branch: example/demo-only
Scope: Demonstration of a hypothetical V2 sample-pack production seed change
Production seed changed: no - sample only
Source seed version: toeic_vocab_tracker_c004_full_bank_clear_2026_05_18
New seed version: toeic_vocab_tracker_example_v2_scene_pack_2026_05_20
Reason: Show the minimum documentation expected before any real production seed bump
Related plan item: D-06 建立 Seed 變更標準模板
Related ticket / wave: example-only

---

## 1. Change Summary

| Change item | Reason | Impacted files | Notes |
|---|---|---|---|
| Add a hypothetical V2 sample lesson pack | Demonstrate how a content change should be described | `data/vocab/questions_v2a.json`, `data/vocab/curriculum.json` | Example only; not applied in this repo |
| Sync the new seed identifier across the app | Force clean reseed behavior for clients and tests | `data/vocab/curriculum.json`, `js/vocab-db.js`, `tests/helpers/seed-idb.ts` | Always required for a real seed bump |
| Update maintainer-facing docs | Keep workflow and release rules aligned | `TO_AI.md`, `README.md`, `docs/question-creation-spec.md`, `docs/question-bank-source-of-truth-workflow.md` | Required when process or current-truth wording changes |

---

## 2. Required File Sync

| File / area | Required? | Status | Notes |
|---|---|---|---|
| `data/vocab/curriculum.json` -> `seed_version` | yes | updated | Example new seed value recorded |
| `js/vocab-db.js` -> `SEED_VERSION` | yes | updated | Example new seed value recorded |
| `tests/helpers/seed-idb.ts` -> `APP_SEED_VERSION` | yes | updated | Example new seed value recorded |
| Production data files changed in this seed | if applicable | updated | Example pack file updated |
| `TO_AI.md` current truth or process notes | if applicable | updated | Example workflow reminder added |
| `README.md` maintainer instructions | if applicable | updated | Example workflow reminder added |
| `docs/question-creation-spec.md` authoring / release rules | if applicable | updated | Example workflow reminder added |
| `docs/question-bank-source-of-truth-workflow.md` patch workflow | if applicable | updated | Example workflow reminder added |
| Other docs / scripts / tests touched by the seed | if applicable | not_applicable | No extra files in this sample |

---

## 3. Validation

| Command | Required? | Result | Notes |
|---|---|---|---|
| `node scripts/validate-vocab-data.js` | yes | pass | Example schema validation after content update |
| `node scripts/audit-quality-full.js` | yes for production content changes | pass | Example production audit result |
| `node scripts/audit-duplicates.js` | yes for question changes | pass | Example duplicate check result |
| `npm run test:scoring` | yes | pass | Example fixture stability check |
| `npm run test:docs` | yes | pass | Example active-doc consistency check |
| `npx playwright test` | yes for UI or production seed changes | pass | Example regression result |
| `npm run test:all` | preferred release gate | pass | Example final release gate |
| Additional targeted checks | if applicable | pass | Example V2 seeded smoke test |

Validation summary: All required example checks passed; record is complete but demonstration-only.

---

## 4. Rollback Plan

Previous seed version to restore: `toeic_vocab_tracker_c004_full_bank_clear_2026_05_18`
Files to restore: `data/vocab/questions_v2a.json`, `data/vocab/curriculum.json`, `js/vocab-db.js`, `tests/helpers/seed-idb.ts`

Rollback steps:

1. Revert the hypothetical V2 content file and curriculum update.
2. Restore `toeic_vocab_tracker_c004_full_bank_clear_2026_05_18` in the three required sync files.
3. Rerun validation for the restored state.
4. Launch the tracker with a fresh local session to confirm the restored seed reseeds cleanly.

Post-rollback verification: Example only; no real rollback executed.

---

## 5. Sign-off

| Role | Name | Status | Date | Notes |
|---|---|---|---|---|
| Content review | Example reviewer | approved | 2026-05-20 | Demonstration sign-off only |
| Validation review | Example reviewer | approved | 2026-05-20 | Demonstration sign-off only |
| Release decision | Example owner | hold | 2026-05-20 | Example only; do not merge |

Final decision: Demonstration only.
Merge / ship window: n/a
Follow-up actions: Copy the template for the next real production seed change and replace every example value.