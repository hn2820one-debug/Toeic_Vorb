# Seed Change Record - toeic_vocab_tracker_v3_w2_03_wave_14_2026_05_21

Record status: approved
Change date: 2026-05-21
Owner: Codex
Scope: Program B fourteenth V3 production promotion — `V3-W2-03` → `V3-A-139` (行銷與宣傳 搭配詞 2)
Production seed changed: yes
Source seed version: toeic_vocab_tracker_v3_w2_02_wave_13_2026_05_21
New seed version: toeic_vocab_tracker_v3_w2_03_wave_14_2026_05_21
Reason: Complete remaining Phrase_411 行銷與宣傳 targets (5 phrases) as wave-2 lesson 2.
Related plan item: C-11
Related ticket / wave: V3 wave 14 / `V3-A-139`

---

## 1. Change Summary

| Change item | Reason | Impacted files | Notes |
|---|---|---|---|
| Add `V3-A-139` lesson row | Wave-2 core lesson 3 | `data/vocab/curriculum.json` | 34 runnable lessons |
| Add 23 V3 question rows | Make lesson runnable | `data/vocab/questions_v3a.json` | 448 rows in `questions_v3a.json` |
| Add 5 V3 vocab items | Five collocation targets | `data/vocab/vocab_items.json` | Cleared 4 legacy `V3-B-139` placeholders |
| Reuse `v3_a_138_rv_024` | Cross-lesson pressure at Q10 | `data/vocab/curriculum.json` | Reuses `appeal to` review from `V3-A-138` |
| Sync seed version and cache | Force clean reseed | `js/vocab-db.js`, `tests/helpers/seed-idb.ts`, `tests/seed-sync.spec.ts`, `sw.js` | `toeic-vorb-v32` |

---

## 2. Validation

| Command | Result |
|---|---|
| `node scripts/validate-vocab-data.js` | passed — 34 lessons / 688 questions |
| `node scripts/audit-quality-full.js` | passed — 0 blocking |
| `node scripts/audit-duplicates.js` | passed — 688 unique stems |
| `node scripts/check-doc-consistency.js` | passed after doc sync |
| `npm run test:all` | passed |

---

## 3. Rollback

Rollback removes `V3-A-139`, its 23 question rows, and five vocab items; restore prior seed version `toeic_vocab_tracker_v3_w2_02_wave_13_2026_05_21` and service worker cache `toeic-vorb-v31`.
