# Seed Change Record - toeic_vocab_tracker_v2_a_78_80_wave_4_2026_05_21

Record status: approved
Change date: 2026-05-21
Owner: Codex
PR / branch: workspace
Scope: Program B wave 4 production promotion for `V2-A-78` through `V2-A-80`
Production seed changed: yes
Source seed version: toeic_vocab_tracker_v2_mr_01_mixed_review_2026_05_21
New seed version: toeic_vocab_tracker_v2_a_78_80_wave_4_2026_05_21
Reason: Promote the validated wave 4 candidate lessons into the live V2 production seed and complete the current 10-core-lesson C-13 milestone.
Related plan item: C-13
Related ticket / wave: V2 wave 4 / `V2-A-78` through `V2-A-80`

---

## 1. Change Summary

| Change item | Reason | Impacted files | Notes |
|---|---|---|---|
| Add `V2-A-78` through `V2-A-80` lesson rows | Complete the current 10-core V2 milestone | `data/vocab/curriculum.json` | Production now has 11 runnable V2 lessons including `V2-MR-01` |
| Add 72 V2 question rows | Make wave 4 lessons runnable from production seed | `data/vocab/questions_v2a.json` | `questions_v2a.json` now has 240 rows |
| Sync production seed version and cache | Force clean reseed and asset refresh for the new production content | `js/vocab-db.js`, `tests/helpers/seed-idb.ts`, `tests/seed-sync.spec.ts`, `sw.js` | Seed advanced to `toeic_vocab_tracker_v2_a_78_80_wave_4_2026_05_21`; cache advanced to `toeic-vorb-v15` |
| Sync current-truth docs and regression expectations | Keep reported lesson counts and visible UI expectations aligned | `TO_AI.md`, `README.md`, `AGENTS.md`, `CLAUDE.md`, `docs/使用說明書.md`, `docs/KNOWN_ISSUES.md`, `docs/Future Plan.md`, `docs/v2-production-promotion-pipeline.md`, `tests/ui-regression.spec.ts` | Production count is now 11 lessons / 240 rows |
| Record release evidence | Preserve the promotion decision and validation path | `docs/seed-changes/2026-05-21-toeic_vocab_tracker_v2_a_78_80_wave_4_2026_05_21.md`, `docs/wave-retrospectives/2026-05-21-c13-v2-wave4-promotion-review.md` | C-13 10-core milestone is complete |

---

## 2. Required File Sync

| File / area | Required? | Status | Notes |
|---|---|---|---|
| `data/vocab/curriculum.json` -> `seed_version` | yes | updated | Seed advanced and three wave 4 lesson rows added |
| `js/vocab-db.js` -> `SEED_VERSION` | yes | updated | Synced to `toeic_vocab_tracker_v2_a_78_80_wave_4_2026_05_21` |
| `tests/helpers/seed-idb.ts` -> `APP_SEED_VERSION` | yes | updated | Synced to the new production seed version |
| Production data files changed in this seed | if applicable | updated | `data/vocab/curriculum.json` and `data/vocab/questions_v2a.json` |
| `TO_AI.md` current truth or process notes | if applicable | updated | Current truth now reflects 11 live lessons / 240 live rows |
| `README.md` maintainer instructions | if applicable | updated | Production seed metrics and seed version updated |
| `docs/question-creation-spec.md` authoring / release rules | if applicable | unchanged | Existing V2 rules already cover this promotion |
| `docs/question-bank-source-of-truth-workflow.md` patch workflow | if applicable | unchanged | Workflow unchanged |
| Other docs / scripts / tests touched by the seed | if applicable | updated | `AGENTS.md`, `CLAUDE.md`, `docs/使用說明書.md`, `docs/KNOWN_ISSUES.md`, `docs/Future Plan.md`, `docs/v2-production-promotion-pipeline.md`, `tests/ui-regression.spec.ts`, `tests/seed-sync.spec.ts`, `sw.js` |

---

## 3. Validation

| Command | Required? | Result | Notes |
|---|---|---|---|
| `node scripts/validate-vocab-data.js` | yes | passed | 11 lessons, 240 questions, 0 warnings, A/B/C/D = 60/60/60/60 |
| `node scripts/audit-quality-full.js` | yes for production content changes | passed | 0 blocking issues; 40 non-blocking staircase warnings; 1 first-core exception for `V2-A-71` |
| `node scripts/audit-duplicates.js` | yes for question changes | passed | 240 unique stems, 0 duplicate stems |
| `npm run test:scoring` | yes | passed | Covered inside `npm run test:all`; 71/71 passed |
| `npm run test:docs` | yes | passed | Active current-fact docs match live seed/cache/count source files |
| `npx playwright test` | yes for UI or production seed changes | passed | 28/28 tests passed inside `npm run test:all` |
| `npm run test:all` | preferred release gate | passed | Scoring, data, docs, audit harness, patch workflow, MUP, export governance, and Playwright all passed |
| Additional targeted checks | if applicable | passed | `node scripts/check-doc-consistency.js`; `npm run report:inventory` generated `docs/REPO_COURSEWARE_INVENTORY_2026-05-21.md` |

Validation summary:

- `V2-A-78` through `V2-A-80` are now live production core lessons.
- Production state is 11 runnable lessons and 240 production question rows.
- V2 core progress for the current C-13 milestone is 10/10.
- V4 remains draft-only and was not promoted.
- Inventory refresh completed after the seed change.

---

## 4. Rollback Plan

Previous seed version to restore: toeic_vocab_tracker_v2_mr_01_mixed_review_2026_05_21
Files to restore:

- `data/vocab/curriculum.json`
- `data/vocab/questions_v2a.json`
- `js/vocab-db.js`
- `tests/helpers/seed-idb.ts`
- `tests/seed-sync.spec.ts`
- `sw.js`
- `TO_AI.md`
- `README.md`
- `AGENTS.md`
- `CLAUDE.md`
- `docs/使用說明書.md`
- `docs/KNOWN_ISSUES.md`
- `docs/Future Plan.md`
- `docs/v2-production-promotion-pipeline.md`
- `tests/ui-regression.spec.ts`

Rollback steps:

1. Remove the `V2-A-78` through `V2-A-80` curriculum lesson rows.
2. Remove the 72 wave 4 question rows from `data/vocab/questions_v2a.json`.
3. Restore V2 `total_lessons` to 8 and restore the previous seed version in the three required sync files.
4. Restore the previous service worker cache name and current-truth doc values.
5. Rerun `node scripts/validate-vocab-data.js`, `node scripts/audit-quality-full.js`, `node scripts/audit-duplicates.js`, `npm run test:docs`, and `npm run test:all` for the restored state.
6. Confirm the app reseeds cleanly with the restored version and returns to the 8-lesson / 168-row production state.

Post-rollback verification:

- Expected restored state: 8 runnable lessons (`V2-A-71` through `V2-A-77` plus `V2-MR-01`) and 168 production question rows.
- `tests/ui-regression.spec.ts` must again match the restored mixed-review live state before rerunning the full Playwright suite.

---

## 5. Sign-off

| Role | Name | Status | Date | Notes |
|---|---|---|---|---|
| Content review | Codex | approved | 2026-05-21 | Wave 4 candidate review passed |
| Validation review | Codex | approved | 2026-05-21 | `npm run test:all` passed |
| Release decision | Codex | approved | 2026-05-21 | Wave 4 production promotion released |

Final decision: Approved as the live V2 wave 4 seed for Program B.
Merge / ship window: Immediate after normal cache refresh and deployment sync.
Follow-up actions:

1. Collect real V2 learner/export evidence for T049 before rewriting accepted staircase warning debt.
2. Prepare C-11 V3 production candidates after documenting whether learner evidence is available.
