# Wave Retrospective: C-11 V3-W1-01 Production Promotion
**Date:** 2026-05-21  
**Task:** C-11 first V3 production wave promotion  
**Scope:** Promote `V3-W1-01` draft candidate to live `V3-A-121` production seed  
**Status:** PROMOTED

---

## 1. Promotion Summary

| Item | Value |
|---|---|
| Draft lesson | `V3-W1-01` |
| Production lesson | `V3-A-121` |
| Question file | `data/vocab/questions_v3a.json` |
| New lesson rows | 1 |
| New question rows | 24 |
| New vocab items | 7 |
| Seed version | `toeic_vocab_tracker_v3_w1_01_first_wave_2026_05_21` |
| Service worker cache | `toeic-vorb-v16` |

---

## 2. ID Mapping

| Draft | Production |
|---|---|
| `V3-W1-01` | `V3-A-121` |
| `V3-W1-01_Q01..Q20` | `v3_a_121_q_001..q_020` |
| `V3-W1-01_R01..R04` | `v3_a_121_rv_021..rv_024` |
| `item_coll_*` | `item_v3_v3_a_121_*` |

Four legacy placeholder vocab rows that previously pointed at `V3-A-121` were unlinked before promotion so target-item coverage audit would count only the seven live lesson targets.

---

## 3. Validation

| Check | Result |
|---|---|
| `node scripts/validate-vocab-data.js` | passed |
| `node scripts/audit-quality-full.js` | passed: 0 blocking issues |
| `node scripts/audit-duplicates.js` | passed: 0 duplicate stems |
| Staircase warnings | 44 total (40 existing V2 + 4 new V3) accepted as non-blocking debt |
| First-core policy exceptions | `V2-A-71`, `V3-A-121` |

---

## 4. Release Decision

Single-lesson first V3 wave is accepted. Production expansion milestone for V3 is now **1/10 core lessons**.

Next process:

1. Collect real V3 learner/export evidence after at least one full `V3-A-121` session.
2. Author `V3-W1-02` and `V3-W1-03` for the planned paired V3 wave 2, or continue single-lesson waves if authoring throughput stays narrow.
3. Keep V2 live seed unchanged until current V2 learner evidence justifies a rewrite.
