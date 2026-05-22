# Wave Retrospective: C-11 V3-W2-07 Wave 18 Promotion
**Date:** 2026-05-22  
**Scope:** Promote `V3-W2-07` to `V3-A-143`  
**Status:** APPROVED - live production seed

---

## Promotion Summary

`V3-W2-07` is now live as:

- `V3-A-143` - 財務會計 搭配詞 4
- 3 targets: `allow for`, `draw from`, `bring down`
- 23 new question rows
- 1 reused cross-lesson pressure reference: `v3_a_142_rv_024`

Production now has 39 runnable lessons, 780 question-bank rows, and 632 vocab items.

Seed: `toeic_vocab_tracker_v3_w2_07_wave_18_2026_05_22`  
SW cache: `toeic-vorb-v37`

---

## Candidate Improvements

The first isolated candidate audit found duplicate direct-definition grouping for the two `allow for` review contexts. The candidate was revised before promotion:

- `v3_a_143_rv_021` uses `semantic_sense:cash_flow_refunds`.
- `v3_a_143_rv_024` uses `semantic_sense:warranty_reserve`.
- The promotion helper now preserves candidate `semantic_sense:*` tags in production rows.

---

## Validation

| Check | Result |
|---|---|
| Isolated full quality audit | passed: 39 lessons / 780 questions, 0 blocking issues |
| Production `validate-vocab-data` | passed: 39 lessons / 780 questions |
| Production full quality audit | passed: 0 blocking issues |
| Duplicate audit | passed: 780 unique stems |
| Docs consistency | passed: seed/cache/counts aligned |
| Inventory refresh | passed: `docs/REPO_COURSEWARE_INVENTORY_2026-05-22.md` |
| `npm run test:all` | passed: 71 scoring/unit checks and 28 Playwright tests |

Existing warning debt remains non-blocking: 195 preferred stem-length warnings and 152 staircase progression warnings.

---

## Release Decision

Approved for production. This completes the currently identified 財務會計 Phrase_411 slice across `V3-A-140` through `V3-A-143`.

**Next process:** `V3-W2-08` -> `V3-A-144` (企業經營 1), or fresh learner/export evidence review if supplied first.
