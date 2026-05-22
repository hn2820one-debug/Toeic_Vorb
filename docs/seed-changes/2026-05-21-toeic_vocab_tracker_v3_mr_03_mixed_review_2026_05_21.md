# Seed Change Record - toeic_vocab_tracker_v3_mr_03_mixed_review_2026_05_21

Record status: approved
Change date: 2026-05-21
Owner: Codex
Scope: Program B V3 mixed-review promotion for `V3-MR-03` (sources `V3-A-131` through `V3-A-135`)
Production seed changed: yes
Source seed version: toeic_vocab_tracker_v3_w1_16_wave_11_2026_05_21
New seed version: toeic_vocab_tracker_v3_mr_03_mixed_review_2026_05_21
Reason: Add third V3 mixed-review checkpoint after wave-1 extension core lessons 131–135 went live.
Related plan item: C-11
Related ticket / wave: V3 mixed review 03

---

## 1. Change Summary

| Change item | Reason | Impacted files | Notes |
|---|---|---|---|
| Add `V3-MR-03` lesson row | Third V3 MR for extension block | `data/vocab/curriculum.json` | 31 runnable lessons |
| Reuse 20 review_question rows | No new question-bank rows | `data/vocab/curriculum.json` | 619 question rows unchanged |
| Sync seed version and cache | Force clean reseed | `js/vocab-db.js`, `tests/helpers/seed-idb.ts`, `tests/seed-sync.spec.ts`, `sw.js` | `toeic-vorb-v29` |

---

## 2. Validation

| Command | Result |
|---|---|
| `node scripts/validate-vocab-data.js` | passed — 31 lessons / 619 questions |
| `node scripts/audit-quality-full.js` | passed — 0 blocking |
| `node scripts/audit-duplicates.js` | passed — 619 unique stems |
| `node scripts/check-doc-consistency.js` | passed after doc sync |
| `npm run test:all` | passed |

---

## 3. Rollback

Rollback removes `V3-MR-03`; restore prior seed version `toeic_vocab_tracker_v3_w1_16_wave_11_2026_05_21` and service worker cache `toeic-vorb-v28`.
