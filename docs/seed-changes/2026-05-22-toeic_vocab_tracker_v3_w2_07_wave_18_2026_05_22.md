# Seed Change Record - toeic_vocab_tracker_v3_w2_07_wave_18_2026_05_22

Date: 2026-05-22  
Program: Program B - TOEIC Vocabulary Tracker  
Scope: V3 wave 18 production promotion - `V3-W2-07` to `V3-A-143` (財務會計 搭配詞 4)

## Change Summary

New seed version: `toeic_vocab_tracker_v3_w2_07_wave_18_2026_05_22`  
Previous seed version: `toeic_vocab_tracker_v3_w2_06_wave_17_2026_05_22`  
Service worker cache: `toeic-vorb-v37`

This promotion adds one V3 core lesson:

- `V3-A-143` - 財務會計 搭配詞 4
- 23 new question rows in `data/vocab/questions_v3a.json`
- 3 new V3 vocab items in `data/vocab/vocab_items.json`
- 1 reused prior review pressure reference: `v3_a_142_rv_024`

## Impacted Files

| Change | Reason | Files |
|---|---|---|
| Add `V3-A-143` lesson row | Complete the remaining Phrase_411 finance/accounting targets | `data/vocab/curriculum.json` |
| Add 23 authored V3 rows | Promote validated `V3-W2-07` candidate | `data/vocab/questions_v3a.json` |
| Add 3 vocab items | Support the remaining finance collocation targets | `data/vocab/vocab_items.json` |
| Preserve semantic sense tags | Avoid duplicate direct-definition grouping for two distinct `allow for` review contexts | `data/vocab/questions_v3a.json`, `tmp/promote-v3-w2-07.js` |
| Sync seed/cache/test constants | Force clean reseed and keep tests aligned | `js/vocab-db.js`, `tests/helpers/seed-idb.ts`, `tests/seed-sync.spec.ts`, `sw.js` |
| Update docs and regression counts | Keep current truth aligned | `TO_AI.md`, `README.md`, `docs/使用說明書.md`, `docs/KNOWN_ISSUES.md`, `docs/Future Plan.md`, `AGENTS.md`, `CLAUDE.md`, `tests/ui-regression.spec.ts` |

## Validation

| Command | Result |
|---|---|
| `node tmp/build-v3-w2-07-isolated-audit.js` | passed - isolated root built at 39 lessons / 780 questions |
| `VOCAB_AUDIT_ROOT=tmp/v3-w2-07-current-isolated-audit node scripts/audit-quality-full.js` | passed - 0 blocking issues |
| `node scripts/validate-vocab-data.js` | passed - 39 lessons / 780 questions |
| `node scripts/check-doc-consistency.js` | passed - seed/cache/count docs aligned |
| `node scripts/audit-quality-full.js` | passed - 0 blocking issues |
| `node scripts/audit-duplicates.js` | passed - 780 unique stems |
| `npm run report:inventory` | passed - wrote `docs/REPO_COURSEWARE_INVENTORY_2026-05-22.md` |
| `npm run test:all` | passed - 71 scoring/unit checks and 28 Playwright tests |

Known non-blocking warning debt after promotion: 195 preferred stem-length warnings and 152 staircase progression warnings. `V3-W2-07` did not add preferred stem-length or explanation-quality warnings.

## Rollback Plan

Rollback removes `V3-A-143`, its 23 question rows, and its 3 vocab items. Restore seed version `toeic_vocab_tracker_v3_w2_06_wave_17_2026_05_22` and service worker cache `toeic-vorb-v36`.

## Sign-off

Status: approved after isolated audit and production validation.  
Production seed changed: yes.
