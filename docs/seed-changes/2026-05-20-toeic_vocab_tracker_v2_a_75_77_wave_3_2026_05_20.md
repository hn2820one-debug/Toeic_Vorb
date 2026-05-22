# Seed Change Record - toeic_vocab_tracker_v2_a_75_77_wave_3_2026_05_20

Record status: approved
Change date: 2026-05-20
Owner: Codex
PR / branch: workspace
Scope: Program B wave 3 production promotion for V2-A-75 through V2-A-77, plus required seed/docs/tests sync
Production seed changed: yes
Source seed version: toeic_vocab_tracker_v2_a_72_74_wave_2_2026_05_20
New seed version: toeic_vocab_tracker_v2_a_75_77_wave_3_2026_05_20
Reason: Promote the validated V2 wave 3 lesson pack into the live production seed and advance the app from 4 to 7 runnable V2 lessons.
Related plan item: C-13
Related ticket / wave: Wave 3 / V2-A-75 through V2-A-77

---

## 1. Change Summary

| Change item | Reason | Impacted files | Notes |
|---|---|---|---|
| Add V2-A-75 through V2-A-77 lesson rows to production curriculum | Expand live V2 coverage from 4 lessons to 7 lessons | `data/vocab/curriculum.json` | V2 total lessons now 7 |
| Promote 72 new production question rows into `questions_v2a.json` | Ship the reviewed wave 3 content into live seed | `data/vocab/questions_v2a.json` | 60 `scene_vocabulary` + 12 `review_question` rows; production-wave tags normalized to `_75`, `_76`, and `_77` |
| Sync production seed version and cache | Force clean reseed and asset refresh for the new wave | `js/vocab-db.js`, `tests/helpers/seed-idb.ts`, `tests/seed-sync.spec.ts`, `sw.js` | Seed advanced to `toeic_vocab_tracker_v2_a_75_77_wave_3_2026_05_20`; cache advanced to `toeic-vorb-v13` |
| Sync current-truth docs and planning docs | Remove obsolete wave-2-current counts and next-step text | `TO_AI.md`, `README.md`, `docs/使用說明書.md`, `docs/KNOWN_ISSUES.md`, `docs/Future Plan.md`, `docs/QUESTION_BANK_BUILD_BLUEPRINT_2026-05-20.md`, `docs/v2-production-promotion-pipeline.md` | Current truth now reports 7 runnable lessons and 168 production rows |
| Update targeted regression coverage | Keep UI tests aligned with the live seed and Question Bank pagination | `tests/ui-regression.spec.ts` | Question Bank test now verifies 168 total rows through Load More pagination |
| Record release evidence | Close the production promotion with seed and retrospective documentation | `docs/seed-changes/2026-05-20-toeic_vocab_tracker_v2_a_75_77_wave_3_2026_05_20.md`, `docs/wave-retrospectives/2026-05-20-c13-v2-wave3-promotion-review.md` | Formal release evidence added |

---

## 2. Required File Sync

Required on every production seed change. Mark each row as `updated`, `unchanged`, `not_applicable`, or `blocked`.

| File / area | Required? | Status | Notes |
|---|---|---|---|
| `data/vocab/curriculum.json` -> `seed_version` | yes | updated | Seed advanced and 3 new lesson rows added |
| `js/vocab-db.js` -> `SEED_VERSION` | yes | updated | Synced to `toeic_vocab_tracker_v2_a_75_77_wave_3_2026_05_20` |
| `tests/helpers/seed-idb.ts` -> `APP_SEED_VERSION` | yes | updated | Synced to the new production seed version |
| Production data files changed in this seed | if applicable | updated | `data/vocab/curriculum.json`, `data/vocab/questions_v2a.json` |
| `TO_AI.md` current truth or process notes | if applicable | updated | Current truth now reflects 7 live lessons / 168 live rows |
| `README.md` maintainer instructions | if applicable | updated | Production seed metrics and seed version updated |
| `docs/question-creation-spec.md` authoring / release rules | if applicable | unchanged | Existing authoring/release rules already covered this promotion |
| `docs/question-bank-source-of-truth-workflow.md` patch workflow | if applicable | unchanged | Workflow unchanged |
| Other docs / scripts / tests touched by the seed | if applicable | updated | `docs/使用說明書.md`, `docs/KNOWN_ISSUES.md`, `docs/Future Plan.md`, `docs/QUESTION_BANK_BUILD_BLUEPRINT_2026-05-20.md`, `docs/v2-production-promotion-pipeline.md`, `docs/wave-retrospectives/2026-05-20-c13-v2-wave3-promotion-review.md`, `tests/ui-regression.spec.ts`, `tests/seed-sync.spec.ts`, `sw.js` |

---

## 3. Validation

| Command | Required? | Result | Notes |
|---|---|---|---|
| `node scripts/validate-vocab-data.js` | yes | passed | 7 lessons, 168 questions, 0 warnings, A/B/C/D = 42/42/42/42 |
| `node scripts/audit-quality-full.js` | yes for production content changes | passed | 0 blocking issues; 28 staircase warnings and 1 `V2-A-71` first-core exception accepted as non-blocking debt |
| `node scripts/audit-duplicates.js` | yes for question changes | passed | 168 unique stems, 0 duplicate stems |
| `npm run test:scoring` | yes | passed | Covered inside `npm run test:all`; 71/71 passed |
| `npm run test:docs` | yes | passed | Active current-fact docs now match live seed/cache/count source files |
| `npx playwright test` | yes for UI or production seed changes | passed | 28/28 tests passed inside `npm run test:all` |
| `npm run test:all` | preferred release gate | passed | Scoring, data, docs, audit harness, patch workflow, MUP, export governance, and Playwright all passed |
| Additional targeted checks | if applicable | passed | `npx playwright test tests/ui-regression.spec.ts` 11/11; `npx playwright test tests/seed-sync.spec.ts` 1/1 |

Validation summary:

- Production seed promotion is validated end-to-end.
- Current production state is 7 runnable lessons and 168 production question rows.
- Accepted non-blocking quality debt for the live seed: 28 staircase progression warnings across `V2-A-71` through `V2-A-77`, plus 1 first-core old-item policy exception for `V2-A-71`.
- The next process is the formal `V2-MR-01` mixed-review promotion gate, then wave 4 (`V2-A-78` through `V2-A-80`) to reach 10 runnable V2 core lessons.

---

## 4. Rollback Plan

Previous seed version to restore: toeic_vocab_tracker_v2_a_72_74_wave_2_2026_05_20
Files to restore:

- `data/vocab/curriculum.json`
- `data/vocab/questions_v2a.json`
- `js/vocab-db.js`
- `tests/helpers/seed-idb.ts`
- `tests/seed-sync.spec.ts`
- `sw.js`
- `TO_AI.md`
- `README.md`
- `docs/使用說明書.md`
- `docs/KNOWN_ISSUES.md`
- `docs/Future Plan.md`
- `docs/QUESTION_BANK_BUILD_BLUEPRINT_2026-05-20.md`
- `docs/v2-production-promotion-pipeline.md`
- `tests/ui-regression.spec.ts`

Rollback steps:

1. Revert every production data file changed in this seed.
2. Restore the previous seed version in the three required sync files.
3. Restore the previous service worker cache name and all current-truth doc values.
4. Rerun `node scripts/validate-vocab-data.js`, `node scripts/audit-quality-full.js`, `node scripts/audit-duplicates.js`, `npm run test:docs`, and `npm run test:all` for the restored state.
5. Confirm the app reseeds cleanly with the restored version and returns to the 4-lesson / 96-row production state.

Post-rollback verification:

- Expected restored state: 4 runnable lessons (`V2-A-71` through `V2-A-74`) and 96 production question rows.
- `tests/ui-regression.spec.ts` must again match the restored wave-2 live state before rerunning the full Playwright suite.

---

## 5. Sign-off

| Role | Name | Status | Date | Notes |
|---|---|---|---|---|
| Content review | Codex | approved with short-term debt | 2026-05-20 | Full audit passed; 28 staircase warnings and 1 first-core exception remain accepted as non-blocking debt |
| Validation review | Codex | approved | 2026-05-20 | `npm run test:all` passed |
| Release decision | Codex | approved | 2026-05-20 | Wave 3 production promotion released |

Final decision: Approved as the live wave 3 production seed for Program B.
Merge / ship window: Immediate after normal cache refresh and deployment sync.
Follow-up actions:

1. Run the formal promotion gate for the assembled `V2-MR-01` mixed-review candidate using the existing 20 review rows from `V2-A-71` through `V2-A-75`.
2. Collect real V2 learner/export evidence before revisiting the live staircase warning debt.
3. Draft and validate wave 4 (`V2-A-78` through `V2-A-80`) to reach 10 runnable V2 core lessons.
4. Keep V4 strictly draft-only under `drafts/v4/` until a future explicit activation task.
