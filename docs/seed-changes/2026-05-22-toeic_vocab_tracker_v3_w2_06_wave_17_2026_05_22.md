# Seed Change Record - toeic_vocab_tracker_v3_w2_06_wave_17_2026_05_22

Date: 2026-05-22  
Program: Program B - TOEIC Vocabulary Tracker  
Scope: V3 wave 17 production promotion - `V3-W2-06` to `V3-A-142` (財務會計 搭配詞 3)

## Change Summary

New seed version: `toeic_vocab_tracker_v3_w2_06_wave_17_2026_05_22`  
Previous seed version: `toeic_vocab_tracker_v3_w2_05_wave_16_2026_05_22`  
Service worker cache: `toeic-vorb-v36`

This promotion adds one V3 core lesson:

- `V3-A-142` - 財務會計 搭配詞 3
- 23 new question rows in `data/vocab/questions_v3a.json`
- 6 new V3 vocab items in `data/vocab/vocab_items.json`
- 1 reused prior review pressure reference: `v3_a_141_rv_024`

## Impacted Files

| Change | Reason | Files |
|---|---|---|
| Add `V3-A-142` lesson row | Continue V3 wave-2 finance/accounting sequence | `data/vocab/curriculum.json` |
| Add 23 authored V3 rows | Promote validated `V3-W2-06` candidate | `data/vocab/questions_v3a.json` |
| Add 6 vocab items | Support new finance collocation targets | `data/vocab/vocab_items.json` |
| Sync seed/cache/test constants | Force clean reseed and keep tests aligned | `js/vocab-db.js`, `tests/helpers/seed-idb.ts`, `tests/seed-sync.spec.ts`, `sw.js` |
| Update docs and regression counts | Keep current truth aligned | `TO_AI.md`, `README.md`, `docs/使用說明書.md`, `docs/KNOWN_ISSUES.md`, `docs/Future Plan.md`, `AGENTS.md`, `CLAUDE.md`, `tests/ui-regression.spec.ts` |

## Validation

| Command | Result |
|---|---|
| `node tmp/build-v3-w2-06-isolated-audit.js` | passed - isolated root built at 38 lessons / 757 questions |
| `VOCAB_AUDIT_ROOT=tmp/v3-w2-06-current-isolated-audit node scripts/audit-quality-full.js` | passed - 0 blocking issues |
| `node scripts/validate-vocab-data.js` | passed - 38 lessons / 757 questions |
| `node scripts/check-doc-consistency.js` | passed - seed/cache/count docs aligned |
| `node scripts/audit-quality-full.js` | passed - 0 blocking issues |
| `node scripts/audit-duplicates.js` | passed - 757 unique stems |
| `npm run report:inventory` | passed - wrote `docs/REPO_COURSEWARE_INVENTORY_2026-05-22.md` |
| `npm run test:all` | passed - 71 scoring/unit checks and 28 Playwright tests |

Known non-blocking warning debt after isolated promotion check: 195 preferred stem-length warnings and 149 staircase progression warnings. `V3-W2-06` was revised before promotion to fix the Part 6 context length and keep preferred stem-length / explanation-quality warnings from increasing.

## Rollback Plan

Rollback removes `V3-A-142`, its 23 question rows, and its 6 vocab items. Restore seed version `toeic_vocab_tracker_v3_w2_05_wave_16_2026_05_22` and service worker cache `toeic-vorb-v35`.

## Sign-off

Status: approved after isolated audit and production validation.  
Production seed changed: yes.
