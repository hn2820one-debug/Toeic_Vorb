# Seed Change Record - toeic_vocab_tracker_v3_w2_02_wave_13_2026_05_21

Record status: approved
Change date: 2026-05-21
Owner: Codex
Scope: Program B thirteenth V3 production promotion — `V3-W2-02` → `V3-A-138` (行銷與宣傳 搭配詞 1) plus `v3_a_137_rv_021` duplicate-stem repair
Production seed changed: yes
Source seed version: toeic_vocab_tracker_v3_w2_01_wave_12_2026_05_21
New seed version: toeic_vocab_tracker_v3_w2_02_wave_13_2026_05_21
Reason: Second wave-2 core lesson; first marketing collocation slice from Phrase_411 行銷與宣傳 topic.
Related plan item: C-11
Related ticket / wave: V3 wave 13 / `V3-A-138`

---

## 1. Change Summary

| Change item | Reason | Impacted files | Notes |
|---|---|---|---|
| Add `V3-A-138` lesson row | Wave-2 core lesson 2 | `data/vocab/curriculum.json` | 33 runnable lessons |
| Add 23 V3 question rows | Make lesson runnable | `data/vocab/questions_v3a.json` | 425 rows in `questions_v3a.json` |
| Add 6 V3 vocab items | Six marketing collocation targets | `data/vocab/vocab_items.json` | Cleared legacy `V3-B-138` placeholders |
| Reuse `v3_a_137_rv_024` | Cross-lesson pressure at Q10 | `data/vocab/curriculum.json` | 0 duplicate new review rows |
| Repair `v3_a_137_rv_021` stem | Production audit duplicate with `v3_a_137_q_011` | `data/vocab/questions_v3a.json` | Night-shift / adapt-to context |
| Sync seed version and cache | Force clean reseed | `js/vocab-db.js`, `tests/helpers/seed-idb.ts`, `tests/seed-sync.spec.ts`, `sw.js` | `toeic-vorb-v31` |

---

## 2. Validation

| Command | Result |
|---|---|
| `node scripts/validate-vocab-data.js` | passed — 33 lessons / 665 questions |
| `node scripts/audit-quality-full.js` | passed — 0 blocking |
| `node scripts/audit-duplicates.js` | passed — 665 unique stems |
| `node scripts/check-doc-consistency.js` | passed after doc sync |
| `npm run test:all` | passed |

---

## 3. Rollback

Rollback removes `V3-A-138`, its 23 question rows, and six vocab items; optionally revert `v3_a_137_rv_021` to pre-repair text if rolling back wave 12+13 together. Restore prior seed version `toeic_vocab_tracker_v3_w2_01_wave_12_2026_05_21` and service worker cache `toeic-vorb-v30`.
