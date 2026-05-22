# Seed Change Record - toeic_vocab_tracker_v3_w2_04_wave_15_2026_05_21

Record status: approved
Change date: 2026-05-21
Owner: Codex
Scope: Program B fifteenth V3 production promotion — `V3-W2-04` → `V3-A-140` (財務會計 搭配詞 1)
Production seed changed: yes
Source seed version: toeic_vocab_tracker_v3_w2_03_wave_14_2026_05_21
New seed version: toeic_vocab_tracker_v3_w2_04_wave_15_2026_05_21
Reason: Start Phrase_411 財務會計 topic in wave-2 rebuild (first 6-phrase slice).
Related plan item: C-11
Related ticket / wave: V3 wave 15 / `V3-A-140`

---

## 1. Change Summary

| Change item | Reason | Impacted files | Notes |
|---|---|---|---|
| Add `V3-A-140` lesson row | Wave-2 core lesson 4 | `data/vocab/curriculum.json` | 35 runnable lessons |
| Add 23 V3 question rows | Make lesson runnable | `data/vocab/questions_v3a.json` | 471 rows in `questions_v3a.json` |
| Add 6 V3 vocab items | Six finance collocation targets | `data/vocab/vocab_items.json` | Cleared 4 legacy `V3-B-140` placeholders |
| Reuse `v3_a_139_rv_024` | Cross-topic pressure at Q10 | `data/vocab/curriculum.json` | Reuses `tie in with` from `V3-A-139` |
| Sync seed version and cache | Force clean reseed | `js/vocab-db.js`, `tests/helpers/seed-idb.ts`, `tests/seed-sync.spec.ts`, `sw.js` | `toeic-vorb-v33` |

---

## 2. Validation

| Command | Result |
|---|---|
| `node scripts/validate-vocab-data.js` | passed — 35 lessons / 711 questions |
| `node scripts/audit-quality-full.js` | passed — 0 blocking |
| `node scripts/audit-duplicates.js` | passed — 711 unique stems |
| `node scripts/check-doc-consistency.js` | passed after doc sync |
| `npm run test:all` | passed |

---

## 3. Rollback

Rollback removes `V3-A-140`, its 23 question rows, and six vocab items; restore prior seed version `toeic_vocab_tracker_v3_w2_03_wave_14_2026_05_21` and service worker cache `toeic-vorb-v32`.
