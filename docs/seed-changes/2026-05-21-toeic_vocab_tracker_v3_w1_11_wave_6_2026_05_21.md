# Seed Change Record - toeic_vocab_tracker_v3_w1_11_wave_6_2026_05_21

Record status: approved
Change date: 2026-05-21
Owner: Codex
Scope: Program B sixth V3 production promotion for `V3-W1-11` → `V3-A-131` (業務協調)
Production seed changed: yes
Source seed version: toeic_vocab_tracker_v2_mr_02_mixed_review_2026_05_21
New seed version: toeic_vocab_tracker_v3_w1_11_wave_6_2026_05_21
Reason: Extend the live V3 W1 tranche with the first post–mixed-review core lesson after W1-10 completion.
Related plan item: C-11
Related ticket / wave: V3 wave 6 / `V3-A-131`

---

## 1. Change Summary

| Change item | Reason | Impacted files | Notes |
|---|---|---|---|
| Add `V3-A-131` lesson row | Sixth live V3 wave (1 lesson) | `data/vocab/curriculum.json` | 25 runnable lessons |
| Add 24 V3 question rows | Make lesson runnable | `data/vocab/questions_v3a.json` | 264 rows in `questions_v3a.json` |
| Add 7 V3 vocab items | Support seven collocation targets | `data/vocab/vocab_items.json` | Cleared 4 legacy `V3-B-131` placeholders |
| Rebalance Q17–Q20 targets | Fix target coverage spread (max−min ≤ 2) | `data/vocab/questions_v3a.json` | Post-promote editorial fix |
| Sync seed version and cache | Force clean reseed | `js/vocab-db.js`, `tests/helpers/seed-idb.ts`, `tests/seed-sync.spec.ts`, `sw.js` | `toeic-vorb-v23` |

---

## 2. Validation

| Command | Result |
|---|---|
| `node scripts/validate-vocab-data.js` | passed — 25 lessons / 504 questions |
| `node scripts/audit-quality-full.js` | passed — 0 blocking |
| `node scripts/audit-duplicates.js` | passed — 504 unique stems |
| `node scripts/check-doc-consistency.js` | passed after doc sync |
| `npm run test:all` | passed |

---

## 3. Rollback

Rollback removes `V3-A-131`, its 24 question rows, and seven vocab items; restore prior seed version `toeic_vocab_tracker_v2_mr_02_mixed_review_2026_05_21` and service worker cache `toeic-vorb-v22`.
