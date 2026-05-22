# Seed Change Record - toeic_vocab_tracker_v3_w1_01_first_wave_2026_05_21

Record status: approved
Change date: 2026-05-21
Owner: Codex
PR / branch: workspace
Scope: Program B first V3 production promotion for `V3-W1-01` → `V3-A-121`
Production seed changed: yes
Source seed version: toeic_vocab_tracker_v2_a_78_80_wave_4_2026_05_21
New seed version: toeic_vocab_tracker_v3_w1_01_first_wave_2026_05_21
Reason: Promote the validated first V3 collocation candidate into the live production seed as a single-lesson first wave.
Related plan item: C-11
Related ticket / wave: V3 wave 1 / `V3-A-121`

---

## 1. Change Summary

| Change item | Reason | Impacted files | Notes |
|---|---|---|---|
| Add `V3-A-121` lesson row | First live V3 core lesson | `data/vocab/curriculum.json` | Production now has 12 runnable lessons |
| Add 24 V3 question rows | Make `V3-A-121` runnable from production seed | `data/vocab/questions_v3a.json` | `questions_v3a.json` now has 24 rows |
| Add 7 V3 vocab items | Support collocation targets for the promoted lesson | `data/vocab/vocab_items.json` | Unlinked 4 legacy placeholder rows still keyed to the old `V3-A-121` slot |
| Sync production seed version and cache | Force clean reseed and asset refresh | `js/vocab-db.js`, `tests/helpers/seed-idb.ts`, `tests/seed-sync.spec.ts`, `sw.js` | Seed advanced to `toeic_vocab_tracker_v3_w1_01_first_wave_2026_05_21`; cache advanced to `toeic-vorb-v16` |
| Sync current-truth docs and regression expectations | Keep reported lesson counts aligned | `TO_AI.md`, `README.md`, `AGENTS.md`, `CLAUDE.md`, `docs/使用說明書.md`, `docs/Future Plan.md`, `tests/ui-regression.spec.ts` | Production count is now 12 lessons / 264 rows |
| Record release evidence | Preserve the promotion decision and validation path | `docs/seed-changes/2026-05-21-toeic_vocab_tracker_v3_w1_01_first_wave_2026_05_21.md`, `docs/wave-retrospectives/2026-05-21-c11-v3-w1-01-promotion-review.md` | C-11 first V3 wave is live |

---

## 2. Required File Sync

| File / area | Required? | Status | Notes |
|---|---|---|---|
| `data/vocab/curriculum.json` -> `seed_version` | yes | updated | Seed advanced and `V3-A-121` lesson row added |
| `js/vocab-db.js` -> `SEED_VERSION` | yes | updated | Synced to `toeic_vocab_tracker_v3_w1_01_first_wave_2026_05_21` |
| `tests/helpers/seed-idb.ts` -> `APP_SEED_VERSION` | yes | updated | Synced to the new production seed version |
| Production data files changed in this seed | if applicable | updated | `data/vocab/curriculum.json`, `data/vocab/questions_v3a.json`, `data/vocab/vocab_items.json` |
| `TO_AI.md` current truth or process notes | if applicable | updated | Current truth now reflects 12 live lessons / 264 live rows |
| `README.md` maintainer instructions | if applicable | updated | Production seed metrics and seed version updated |
| Other docs / scripts / tests touched by the seed | if applicable | updated | `AGENTS.md`, `CLAUDE.md`, `docs/使用說明書.md`, `docs/Future Plan.md`, `tests/ui-regression.spec.ts`, `tests/seed-sync.spec.ts`, `sw.js` |

---

## 3. Validation

| Command | Required? | Result | Notes |
|---|---|---|---|
| `node scripts/validate-vocab-data.js` | yes | passed | 12 lessons, 264 questions, 24 grammar_link warnings on V3 rows only |
| `node scripts/audit-quality-full.js` | yes for production content changes | passed | 0 blocking issues; 44 non-blocking staircase warnings; first-core exceptions for `V2-A-71` and `V3-A-121` |
| `node scripts/audit-duplicates.js` | yes for question changes | passed | 264 unique stems, 0 duplicate stems |
| `npm run test:docs` | yes | passed | `node scripts/check-doc-consistency.js` |
| `npx playwright test` | yes for UI or production seed changes | passed | 28/28 inside `npm run test:all` |
| `npm run test:all` | preferred release gate | passed | Scoring, data, docs, audit harness, patch workflow, MUP, export governance, and Playwright |

Validation summary:

- `V3-A-121` is now the first live V3 core lesson.
- Production state is 12 runnable lessons and 264 production question rows.
- V3 core progress for the current expansion milestone is 1/10.
- V4 remains draft-only and was not promoted.

---

## 4. Rollback Plan

Previous seed version to restore: toeic_vocab_tracker_v2_a_78_80_wave_4_2026_05_21

Files to restore:

- `data/vocab/curriculum.json`
- `data/vocab/questions_v3a.json`
- `data/vocab/vocab_items.json`
- `js/vocab-db.js`
- `tests/helpers/seed-idb.ts`
- `tests/seed-sync.spec.ts`
- `sw.js`
- current-truth docs and Playwright expectations listed above

Rollback removes `V3-A-121`, the 24 `questions_v3a.json` rows, and the seven promoted vocab items; restore the four legacy placeholder lesson links only if the pre-promotion vocab snapshot is also restored.

---

## 5. Sign-off

| Role | Name | Date | Decision |
|---|---|---|---|
| Content owner | Codex | 2026-05-21 | approved |
| Technical reviewer | Codex | 2026-05-21 | approved |
