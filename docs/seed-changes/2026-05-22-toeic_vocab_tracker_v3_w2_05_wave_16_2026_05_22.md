# Seed Change Record - toeic_vocab_tracker_v3_w2_05_wave_16_2026_05_22

Date: 2026-05-22  
Program: Program B - TOEIC Vocabulary Tracker  
Scope: V3 wave 16 production promotion - `V3-W2-05` to `V3-A-141` (財務會計 搭配詞 2)

## Change Summary

New seed version: `toeic_vocab_tracker_v3_w2_05_wave_16_2026_05_22`  
Previous seed version: `toeic_vocab_tracker_v3_mr_04_mixed_review_2026_05_21`  
Service worker cache: `toeic-vorb-v35`

This promotion adds one V3 core lesson:

- `V3-A-141` - 財務會計 搭配詞 2
- 23 new question rows in `data/vocab/questions_v3a.json`
- 6 new V3 vocab items in `data/vocab/vocab_items.json`
- 1 reused prior review pressure reference: `v3_a_140_rv_024`

## Impacted Files

| Change | Reason | Files |
|---|---|---|
| Add `V3-A-141` lesson row | Continue V3 wave-2 finance/accounting sequence | `data/vocab/curriculum.json` |
| Add 23 authored V3 rows | Promote validated `V3-W2-05` candidate | `data/vocab/questions_v3a.json` |
| Add 6 vocab items | Support new finance collocation targets | `data/vocab/vocab_items.json` |
| Sync seed/cache/test constants | Force clean reseed and keep tests aligned | `js/vocab-db.js`, `tests/helpers/seed-idb.ts`, `tests/seed-sync.spec.ts`, `sw.js` |
| Update docs and regression counts | Keep current truth aligned | `TO_AI.md`, `README.md`, `docs/使用說明書.md`, `docs/KNOWN_ISSUES.md`, `docs/Future Plan.md`, `AGENTS.md`, `CLAUDE.md`, `tests/ui-regression.spec.ts` |

## Validation

| Command | Result |
|---|---|
| `node tmp/build-v3-w2-05-isolated-audit.js` | passed - isolated root built at 37 lessons / 734 questions |
| `VOCAB_AUDIT_ROOT=tmp/v3-w2-05-current-isolated-audit node scripts/audit-quality-full.js` | passed - 0 blocking issues |
| `node scripts/validate-vocab-data.js` | passed - 37 lessons / 734 questions |
| `node scripts/check-doc-consistency.js` | passed - seed/cache/count docs aligned |
| `node scripts/audit-quality-full.js` | passed - 0 blocking issues |
| `node scripts/audit-duplicates.js` | passed - 734 unique stems |
| `npm run report:inventory` | passed - wrote `docs/REPO_COURSEWARE_INVENTORY_2026-05-22.md` |
| `npm run test:all` | passed - 71 scoring/unit checks and 28 Playwright tests |

Known non-blocking warning debt after promotion: 195 preferred stem-length warnings and 143 staircase progression warnings. `V3-W2-05` did not add new preferred stem-length or explanation-quality warnings.

## Rollback Plan

Rollback removes `V3-A-141`, its 23 question rows, and its 6 vocab items. Restore seed version `toeic_vocab_tracker_v3_mr_04_mixed_review_2026_05_21` and service worker cache `toeic-vorb-v34`.

## Sign-off

Status: approved after isolated audit and production validation.  
Production seed changed: yes.
