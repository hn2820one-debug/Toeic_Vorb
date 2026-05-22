# Seed Change Record - toeic_vocab_tracker_v2_mr_01_mixed_review_2026_05_21

Record status: approved
Change date: 2026-05-21
Owner: Codex
PR / branch: workspace
Scope: Program B curriculum-only promotion for `V2-MR-01`
Production seed changed: yes
Source seed version: toeic_vocab_tracker_v2_a_75_77_wave_3_2026_05_20
New seed version: toeic_vocab_tracker_v2_mr_01_mixed_review_2026_05_21
Reason: Promote the validated first V2 mixed-review checkpoint into the live production seed without adding new question-bank rows.
Related plan item: C-13
Related ticket / wave: V2-MR-01 mixed-review promotion

---

## 1. Change Summary

| Change item | Reason | Impacted files | Notes |
|---|---|---|---|
| Add `V2-MR-01` lesson row to production curriculum | Make the first five-lesson V2 mixed-review checkpoint runnable | `data/vocab/curriculum.json` | Reuses 20 existing review question IDs from `V2-A-71` through `V2-A-75` |
| Keep question-bank rows unchanged | Mixed review lessons reuse existing review rows by policy | none | Production remains 168 question rows |
| Sync production seed version and cache | Force clean reseed and asset refresh for the new curriculum row | `js/vocab-db.js`, `tests/helpers/seed-idb.ts`, `tests/seed-sync.spec.ts`, `sw.js` | Seed advanced to `toeic_vocab_tracker_v2_mr_01_mixed_review_2026_05_21`; cache advanced to `toeic-vorb-v14` |
| Sync current-truth docs and regression expectations | Keep reported lesson counts and visible UI expectations aligned | `TO_AI.md`, `README.md`, `AGENTS.md`, `CLAUDE.md`, `docs/使用說明書.md`, `docs/KNOWN_ISSUES.md`, `docs/Future Plan.md`, `docs/v2-production-promotion-pipeline.md`, `tests/ui-regression.spec.ts` | Runnable lesson count is now 8; V2 core progress remains 7/10 |
| Record release evidence | Preserve the curriculum-only promotion decision and validation path | `docs/seed-changes/2026-05-21-toeic_vocab_tracker_v2_mr_01_mixed_review_2026_05_21.md`, `docs/wave-retrospectives/2026-05-21-c13-v2-mr-01-promotion-review.md` | This seed adds 0 question rows |

---

## 2. Required File Sync

| File / area | Required? | Status | Notes |
|---|---|---|---|
| `data/vocab/curriculum.json` -> `seed_version` | yes | updated | Seed advanced and `V2-MR-01` lesson row added |
| `js/vocab-db.js` -> `SEED_VERSION` | yes | updated | Synced to `toeic_vocab_tracker_v2_mr_01_mixed_review_2026_05_21` |
| `tests/helpers/seed-idb.ts` -> `APP_SEED_VERSION` | yes | updated | Synced to the new production seed version |
| Production data files changed in this seed | if applicable | updated | `data/vocab/curriculum.json` only; question files unchanged |
| `TO_AI.md` current truth or process notes | if applicable | updated | Current truth now reflects 8 live lessons / 168 live rows |
| `README.md` maintainer instructions | if applicable | updated | Production seed metrics and seed version updated |
| `docs/question-creation-spec.md` authoring / release rules | if applicable | unchanged | Existing mixed-review rules already cover this promotion |
| `docs/question-bank-source-of-truth-workflow.md` patch workflow | if applicable | unchanged | Workflow unchanged |
| Other docs / scripts / tests touched by the seed | if applicable | updated | `AGENTS.md`, `CLAUDE.md`, `docs/使用說明書.md`, `docs/KNOWN_ISSUES.md`, `docs/Future Plan.md`, `docs/v2-production-promotion-pipeline.md`, `tests/ui-regression.spec.ts`, `tests/seed-sync.spec.ts`, `sw.js` |

---

## 3. Validation

| Command | Required? | Result | Notes |
|---|---|---|---|
| `node scripts/validate-vocab-data.js` | yes | passed | 8 lessons, 168 questions, 0 warnings, A/B/C/D = 42/42/42/42 |
| `node scripts/audit-quality-full.js` | yes for production content changes | passed | 0 blocking issues; mixed-review audit reports 1 MR lesson, 20 intentional reused review refs, 0 invalid refs |
| `node scripts/audit-duplicates.js` | yes for question changes | passed | 168 unique stems, 0 duplicate stems |
| `npm run test:scoring` | yes | passed | Covered inside `npm run test:all`; 71/71 passed |
| `npm run test:docs` | yes | passed | Active current-fact docs match live seed/cache/count source files |
| `npx playwright test` | yes for UI or production seed changes | passed | 28/28 tests passed inside `npm run test:all` |
| `npm run test:all` | preferred release gate | passed | Scoring, data, docs, audit harness, patch workflow, MUP, export governance, and Playwright all passed |
| Additional targeted checks | if applicable | passed | `node scripts/check-doc-consistency.js`; `npm run report:inventory` generated `docs/REPO_COURSEWARE_INVENTORY_2026-05-21.md` |

Validation summary:

- `V2-MR-01` is now a live production lesson row.
- This seed added 0 question-bank rows and introduced no duplicate stems.
- Production state is 8 runnable lessons and 168 production question rows.
- V2 core progress remains 7/10; wave 4 (`V2-A-78` through `V2-A-80`) is still required to reach 10 core lessons.
- Inventory refresh completed with 8 live production lessons, 168 live production questions, and 28 non-blocking warnings.

---

## 4. Rollback Plan

Previous seed version to restore: toeic_vocab_tracker_v2_a_75_77_wave_3_2026_05_20
Files to restore:

- `data/vocab/curriculum.json`
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

1. Remove the `V2-MR-01` curriculum lesson row.
2. Restore V2 `total_lessons` to 7 and restore the previous seed version in the three required sync files.
3. Restore the previous service worker cache name and current-truth doc values.
4. Rerun `node scripts/validate-vocab-data.js`, `node scripts/audit-quality-full.js`, `node scripts/audit-duplicates.js`, `npm run test:docs`, and `npm run test:all` for the restored state.
5. Confirm the app reseeds cleanly with the restored version and returns to the 7-lesson / 168-row production state.

Post-rollback verification:

- Expected restored state: 7 runnable lessons (`V2-A-71` through `V2-A-77`) and 168 production question rows.
- `tests/ui-regression.spec.ts` must again match the restored wave-3 live state before rerunning the full Playwright suite.

---

## 5. Sign-off

| Role | Name | Status | Date | Notes |
|---|---|---|---|---|
| Content review | Codex | approved | 2026-05-21 | Candidate review passed; no new question rows |
| Validation review | Codex | approved | 2026-05-21 | `npm run test:all` passed |
| Release decision | Codex | approved | 2026-05-21 | Curriculum-only mixed-review promotion released |

Final decision: Approved as the live `V2-MR-01` mixed-review seed for Program B.
Merge / ship window: Immediate after normal cache refresh and deployment sync.
Follow-up actions:

1. Draft and validate wave 4 (`V2-A-78` through `V2-A-80`) to reach 10 runnable V2 core lessons.
2. Collect real V2 learner/export evidence before revisiting accepted staircase warning debt.
