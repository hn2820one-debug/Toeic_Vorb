# Seed Change Record — toeic_vocab_tracker_v2_a_71_first_wave_2026_05_20

Record status: approved
Change date: 2026-05-20
Owner: GitHub Copilot
PR / branch: workspace
Scope: Program B first production wave promotion for V2-A-71, plus required docs/tests sync
Production seed changed: yes
Source seed version: toeic_vocab_tracker_c004_full_bank_clear_2026_05_18
New seed version: toeic_vocab_tracker_v2_a_71_first_wave_2026_05_20
Reason: Promote the validated V2-A-71 minimum usable pack baseline into the first production wave.
Related plan item: C-08
Related ticket / wave: First production wave / V2-A-71

---

## 1. Change Summary

| Change item | Reason | Impacted files | Notes |
|---|---|---|---|
| Restore V2-A-71 lesson row in production curriculum | Reopen the first runnable lesson in production | `data/vocab/curriculum.json` | Adds 1 production lesson row for V2-A-71 |
| Promote 24 V2-A-71 question rows into production | Ship the first reviewed V2 question slice | `data/vocab/questions_v2a.json` | 20 `scene_vocabulary` + 4 `review_question` rows |
| Sync production seed version and cache | Force clean reseed and asset refresh | `js/vocab-db.js`, `tests/helpers/seed-idb.ts`, `sw.js` | Seed advanced to `toeic_vocab_tracker_v2_a_71_first_wave_2026_05_20`; cache advanced to `toeic-vorb-v11` |
| Sync current-truth docs and agent handoff | Remove obsolete empty-seed claims | `TO_AI.md`, `README.md`, `docs/使用說明書.md`, `docs/KNOWN_ISSUES.md`, `AGENTS.md`, `CLAUDE.md` | Current truth now reports 1 runnable lesson and 24 production question rows |
| Update regression coverage for first-wave production state | Replace obsolete empty-seed production assertions | `tests/ui-regression.spec.ts`, `tests/seed-sync.spec.ts` | `ui-regression` now expects first-wave UI; `seed-sync` now uses the current seed version |
| Decouple MUP verifier from the old empty-seed snapshot | Prevent future production-wave promotions from breaking draft-governance verification | `scripts/verify-minimum-usable-packs.js` | Verifier now checks production seed shape instead of pinning the old cleared seed |

---

## 2. Required File Sync

Required on every production seed change. Mark each row as `updated`, `unchanged`, `not_applicable`, or `blocked`.

| File / area | Required? | Status | Notes |
|---|---|---|---|
| `data/vocab/curriculum.json` -> `seed_version` | yes | updated | Seed version advanced and V2-A-71 lesson row restored |
| `js/vocab-db.js` -> `SEED_VERSION` | yes | updated | Synced to `toeic_vocab_tracker_v2_a_71_first_wave_2026_05_20` |
| `tests/helpers/seed-idb.ts` -> `APP_SEED_VERSION` | yes | updated | Synced to the new production seed version |
| Production data files changed in this seed | if applicable | updated | `data/vocab/curriculum.json`, `data/vocab/questions_v2a.json` |
| `TO_AI.md` current truth or process notes | if applicable | updated | Current truth now reflects the first production wave |
| `README.md` maintainer instructions | if applicable | updated | Production seed metrics and UI behavior updated |
| `docs/question-creation-spec.md` authoring / release rules | if applicable | unchanged | Existing rules already covered this release |
| `docs/question-bank-source-of-truth-workflow.md` patch workflow | if applicable | unchanged | Workflow unchanged |
| Other docs / scripts / tests touched by the seed | if applicable | updated | `docs/使用說明書.md`, `docs/KNOWN_ISSUES.md`, `AGENTS.md`, `CLAUDE.md`, `tests/ui-regression.spec.ts`, `tests/seed-sync.spec.ts`, `scripts/verify-minimum-usable-packs.js`, `sw.js` |

---

## 3. Validation

| Command | Required? | Result | Notes |
|---|---|---|---|
| `node scripts/validate-vocab-data.js` | yes | passed | 24 total questions, 0 errors, 0 warnings, answer distribution A/B/C/D = 6/6/6/6 |
| `node scripts/audit-quality-full.js` | yes for production content changes | passed | 0 blocking issues; accepted 4 staircase progression warnings and 1 first-core old-item policy exception note |
| `node scripts/audit-duplicates.js` | yes for question changes | passed | 24 unique stems, 0 duplicate stems |
| `npm run test:scoring` | yes | passed | Covered again inside `npm run test:all`; 71/71 passed |
| `npm run test:docs` | yes | passed | Active current-fact docs now match seed/cache/count source files |
| `npx playwright test` | yes for UI or production seed changes | passed | 26/26 tests passed |
| `npm run test:all` | preferred release gate | passed | Scoring, data, docs, audit, patch, MUP, export governance, and Playwright all passed |
| Additional targeted checks | if applicable | passed | `npx playwright test tests/ui-regression.spec.ts` 9/9; `npx playwright test tests/seed-sync.spec.ts` 1/1; `node scripts/verify-minimum-usable-packs.js` 20/20 |

Validation summary:

- Production seed promotion is validated end-to-end.
- Current production state is 1 runnable lesson and 24 production question rows.
- Non-blocking quality debt accepted for this first wave: 4 staircase progression warnings inside V2-A-71.
- Release gate is green after docs/test sync and verifier updates.

---

## 4. Rollback Plan

Previous seed version to restore: toeic_vocab_tracker_c004_full_bank_clear_2026_05_18
Files to restore:

- `data/vocab/curriculum.json`
- `data/vocab/questions_v2a.json`
- `js/vocab-db.js`
- `tests/helpers/seed-idb.ts`
- `sw.js`
- `TO_AI.md`
- `README.md`
- `docs/使用說明書.md`
- `docs/KNOWN_ISSUES.md`
- `AGENTS.md`
- `CLAUDE.md`
- `tests/ui-regression.spec.ts`
- `tests/seed-sync.spec.ts`
- `scripts/verify-minimum-usable-packs.js`

Rollback steps:

1. Revert every production data file changed in this seed.
2. Restore the previous seed version in the three required sync files.
3. Restore the previous service worker cache name and current-truth docs.
4. Rerun `node scripts/validate-vocab-data.js`, `node scripts/audit-quality-full.js`, `node scripts/audit-duplicates.js`, `npm run test:docs`, and `npm run test:all` for the restored state.
5. Confirm the app reseeds cleanly with the restored version and returns to empty-seed UI behavior.

Post-rollback verification:

- Expected restored state: 0 runnable lessons, 0 question-bank rows, empty-seed banner active.
- `tests/ui-regression.spec.ts` and `tests/seed-sync.spec.ts` would need to match the restored state before re-running the full Playwright suite.

---

## 5. Sign-off

| Role | Name | Status | Date | Notes |
|---|---|---|---|---|
| Content review | Codex | approved with short-term debt | 2026-05-20 | C-09 post-release review accepted 4 non-blocking staircase warnings as short-term debt; learner feedback remains a revisit trigger |
| Validation review | GitHub Copilot | approved | 2026-05-20 | Full validation gate passed |
| Release decision | GitHub Copilot | approved | 2026-05-20 | Limited first production wave approved for V2-A-71 |

Final decision: Approved as the first limited production wave for Program B.
Merge / ship window: Immediate after cache refresh and normal deployment sync.
Follow-up actions:

1. Collect V2-A-71 learner data and revisit the 4 staircase progression warnings if the C-09 triggers fire.
2. Continue V2/V3 production wave expansion before enabling any V4 content.
3. Keep V4 strictly draft-only in `drafts/v4/` until a future explicit activation task.
