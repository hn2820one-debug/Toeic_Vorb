# Seed Change Record - toeic_vocab_tracker_v3_mr_04_mixed_review_2026_05_21

Record status: approved
Change date: 2026-05-21
Owner: Codex
Scope: Program B V3 mixed-review promotion — `V3-MR-04` (sources `V3-A-136`–`V3-A-140`)
Production seed changed: yes
Source seed version: toeic_vocab_tracker_v3_w2_04_wave_15_2026_05_21
New seed version: toeic_vocab_tracker_v3_mr_04_mixed_review_2026_05_21
Reason: Five-lesson mixed-review checkpoint after wave-2 block `V3-A-136`–`140` completion.
Related plan item: C-11
Related ticket / wave: V3 MR-04 / curriculum-only

---

## 1. Change Summary

| Change item | Reason | Impacted files | Notes |
|---|---|---|---|
| Add `V3-MR-04` lesson row | MR gate for 136–140 block | `data/vocab/curriculum.json` | 36 runnable lessons |
| Reuse 20 review question IDs | No new authored rows | `data/vocab/curriculum.json` | 711 question rows unchanged |
| Sync seed version and cache | Force clean reseed | `js/vocab-db.js`, `tests/helpers/seed-idb.ts`, `tests/seed-sync.spec.ts`, `sw.js` | `toeic-vorb-v34` |

Source lessons: `V3-A-136`, `V3-A-137`, `V3-A-138`, `V3-A-139`, `V3-A-140` (4 `review_question` IDs each).

---

## 2. Validation

| Command | Result |
|---|---|
| `node scripts/validate-vocab-data.js` | passed — 36 lessons / 711 questions |
| `node scripts/audit-quality-full.js` | passed — 0 blocking |
| `node scripts/audit-duplicates.js` | passed — 711 unique stems |
| `node scripts/check-doc-consistency.js` | passed after doc sync |
| `npm run test:all` | passed |

---

## 3. Rollback

Rollback removes `V3-MR-04` lesson row only; restore prior seed version `toeic_vocab_tracker_v3_w2_04_wave_15_2026_05_21` and service worker cache `toeic-vorb-v33`.
