# Seed Change Record — toeic_vocab_tracker_v2_a_72_74_wave_2_2026_05_20

Record status: approved
Change date: 2026-05-20
Owner: GitHub Copilot
PR / branch: workspace
Scope: Program B wave 2 production promotion for V2-A-72 through V2-A-74, plus required seed/docs/tests sync
Production seed changed: yes
Source seed version: toeic_vocab_tracker_v2_a_71_first_wave_2026_05_20
New seed version: toeic_vocab_tracker_v2_a_72_74_wave_2_2026_05_20
Reason: Promote the validated V2 wave 2 lesson pack into the live production seed.
Related plan item: C-10 / T039
Related ticket / wave: Wave 2 / V2-A-72 through V2-A-74

---

## 1. Change Summary

| Change item | Reason | Impacted files | Notes |
|---|---|---|---|
| Add V2-A-72 through V2-A-74 lesson rows to production curriculum | Expand live V2 coverage from 1 lesson to 4 lessons | `data/vocab/curriculum.json` | V2 total lessons now 4 |
| Promote 72 new production question rows into `questions_v2a.json` | Ship the reviewed wave 2 content into live seed | `data/vocab/questions_v2a.json` | 60 `scene_vocabulary` + 12 `review_question` rows |
| Sync production seed version and cache | Force clean reseed and asset refresh for the new wave | `js/vocab-db.js`, `tests/helpers/seed-idb.ts`, `tests/seed-sync.spec.ts`, `sw.js` | Seed advanced to `toeic_vocab_tracker_v2_a_72_74_wave_2_2026_05_20`; cache advanced to `toeic-vorb-v12` |
| Sync current-truth docs and AI handoff files | Remove obsolete first-wave-only counts and next-step text | `TO_AI.md`, `README.md`, `docs/使用說明書.md`, `docs/KNOWN_ISSUES.md`, `AGENTS.md`, `CLAUDE.md`, `docs/Future Plan.md` | Current truth now reports 4 runnable lessons and 96 production rows |
| Update release-planning artifacts and targeted regression coverage | Mark T039 complete and align UI tests with the live seed | `docs/wave-retrospectives/2026-05-20-t038-v2-wave2-seed-promotion-plan.md`, `docs/v2-production-promotion-pipeline.md`, `tests/ui-regression.spec.ts` | Next live authoring target is `V2-A-75` |

---

## 2. Required File Sync

Required on every production seed change. Mark each row as `updated`, `unchanged`, `not_applicable`, or `blocked`.

| File / area | Required? | Status | Notes |
|---|---|---|---|
| `data/vocab/curriculum.json` -> `seed_version` | yes | updated | Seed advanced and 3 new lesson rows added |
| `js/vocab-db.js` -> `SEED_VERSION` | yes | updated | Synced to `toeic_vocab_tracker_v2_a_72_74_wave_2_2026_05_20` |
| `tests/helpers/seed-idb.ts` -> `APP_SEED_VERSION` | yes | updated | Synced to the new production seed version |
| Production data files changed in this seed | if applicable | updated | `data/vocab/curriculum.json`, `data/vocab/questions_v2a.json` |
| `TO_AI.md` current truth or process notes | if applicable | updated | Current truth now reflects 4 live lessons / 96 live rows |
| `README.md` maintainer instructions | if applicable | updated | Production seed metrics and seed version updated |
| `docs/question-creation-spec.md` authoring / release rules | if applicable | unchanged | Existing authoring/release rules already covered this promotion |
| `docs/question-bank-source-of-truth-workflow.md` patch workflow | if applicable | unchanged | Workflow unchanged |
| Other docs / scripts / tests touched by the seed | if applicable | updated | `docs/使用說明書.md`, `docs/KNOWN_ISSUES.md`, `AGENTS.md`, `CLAUDE.md`, `docs/Future Plan.md`, `docs/wave-retrospectives/2026-05-20-t038-v2-wave2-seed-promotion-plan.md`, `docs/v2-production-promotion-pipeline.md`, `tests/ui-regression.spec.ts`, `tests/seed-sync.spec.ts`, `sw.js` |

---

## 3. Validation

| Command | Required? | Result | Notes |
|---|---|---|---|
| `node scripts/validate-vocab-data.js` | yes | passed | 4 lessons, 96 questions, 0 warnings, A/B/C/D = 24/24/24/24 |
| `node scripts/audit-quality-full.js` | yes for production content changes | passed | 0 blocking issues; 16 staircase warnings and 1 `V2-A-71` first-core exception accepted as non-blocking debt |
| `node scripts/audit-duplicates.js` | yes for question changes | passed | 96 unique stems, 0 duplicate stems |
| `npm run test:scoring` | yes | passed | Covered inside `npm run test:all`; 71/71 passed |
| `npm run test:docs` | yes | passed | Active current-fact docs now match live seed/cache/count source files |
| `npx playwright test` | yes for UI or production seed changes | passed | 28/28 tests passed inside `npm run test:all` |
| `npm run test:all` | preferred release gate | passed | Scoring, data, docs, audit, patch, MUP, export governance, and Playwright all passed |
| Additional targeted checks | if applicable | passed | `npx playwright test tests/ui-regression.spec.ts` 11/11; `npx playwright test tests/seed-sync.spec.ts` 1/1 |

Validation summary:

- Production seed promotion is validated end-to-end.
- Current production state is 4 runnable lessons and 96 production question rows.
- Accepted non-blocking quality debt for the live seed: 16 staircase progression warnings across `V2-A-71` through `V2-A-74`, plus 1 first-core old-item policy exception for `V2-A-71`.
- The next production authoring target is `V2-A-75`.

---

## 4. Rollback Plan

Previous seed version to restore: toeic_vocab_tracker_v2_a_71_first_wave_2026_05_20
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
- `AGENTS.md`
- `CLAUDE.md`
- `docs/Future Plan.md`
- `docs/wave-retrospectives/2026-05-20-t038-v2-wave2-seed-promotion-plan.md`
- `docs/v2-production-promotion-pipeline.md`
- `tests/ui-regression.spec.ts`

Rollback steps:

1. Revert every production data file changed in this seed.
2. Restore the previous seed version in the three required sync files.
3. Restore the previous service worker cache name and all current-truth doc values.
4. Rerun `node scripts/validate-vocab-data.js`, `node scripts/audit-quality-full.js`, `node scripts/audit-duplicates.js`, `npm run test:docs`, and `npm run test:all` for the restored state.
5. Confirm the app reseeds cleanly with the restored version and returns to the 1-lesson / 24-row production state.

Post-rollback verification:

- Expected restored state: 1 runnable lesson (`V2-A-71`) and 24 production question rows.
- `tests/ui-regression.spec.ts` must again match the restored first-wave-only live state before rerunning the full Playwright suite.

---

## 5. Sign-off

| Role | Name | Status | Date | Notes |
|---|---|---|---|---|
| Content review | GitHub Copilot | approved with short-term debt | 2026-05-20 | Full audit passed; 16 staircase warnings and 1 first-core exception remain accepted as non-blocking debt |
| Validation review | GitHub Copilot | approved | 2026-05-20 | `npm run test:all` passed |
| Release decision | GitHub Copilot | approved | 2026-05-20 | Wave 2 production promotion released |

Final decision: Approved as the live wave 2 production seed for Program B.
Merge / ship window: Immediate after normal cache refresh and deployment sync.
Follow-up actions:

1. Draft and validate `V2-A-75` as the first wave 3 lesson and the fifth V2 core lesson needed for `V2-MR-01`.
2. Collect real V2 learner/export evidence before revisiting the live staircase warning debt.
3. Keep V4 strictly draft-only under `drafts/v4/` until a future explicit activation task.