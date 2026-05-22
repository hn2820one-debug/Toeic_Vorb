# Wave Retrospective: C-11 V3-W2-06 Wave 17 Promotion
**Date:** 2026-05-22  
**Scope:** Promote `V3-W2-06` to `V3-A-142`  
**Status:** APPROVED - live production seed

---

## Promotion Summary

`V3-W2-06` is now live as:

- `V3-A-142` - 財務會計 搭配詞 3
- 6 targets: `add to`, `total up`, `count toward`, `break even`, `write off`, `close out`
- 23 new question rows
- 1 reused cross-lesson pressure reference: `v3_a_141_rv_024`

Production now has 38 runnable lessons, 757 question-bank rows, and 629 vocab items.

Seed: `toeic_vocab_tracker_v3_w2_06_wave_17_2026_05_22`  
SW cache: `toeic-vorb-v36`

---

## Candidate Improvements

The first isolated candidate audit found a Part 6 context that was too short and new preferred stem-length warnings. The candidate was revised before promotion:

- `V3-W2-06_Q15` now uses a two-sentence Part 6 context.
- Candidate stems were expanded into the preferred TOEIC context band.
- Isolated audit passed with 0 blocking issues and no new explanation-quality warnings.

---

## Validation

| Check | Result |
|---|---|
| Isolated full quality audit | passed: 38 lessons / 757 questions, 0 blocking issues |
| Production `validate-vocab-data` | passed: 38 lessons / 757 questions |
| Production full quality audit | passed: 0 blocking issues |
| Duplicate audit | passed: 757 unique stems |
| Docs consistency | passed: seed/cache/counts aligned |
| Inventory refresh | passed: `docs/REPO_COURSEWARE_INVENTORY_2026-05-22.md` |
| `npm run test:all` | passed: 71 scoring/unit checks and 28 Playwright tests |

Existing warning debt remains non-blocking: 195 preferred stem-length warnings and 149 staircase progression warnings.

---

## Release Decision

Approved for production. This advances V3 wave-2 to six live core lessons (`V3-A-137` through `V3-A-142`) after the `V3-MR-04` checkpoint.

**Next process:** `V3-W2-07` -> `V3-A-143` (財務會計 4), or fresh learner/export evidence review if supplied first.
