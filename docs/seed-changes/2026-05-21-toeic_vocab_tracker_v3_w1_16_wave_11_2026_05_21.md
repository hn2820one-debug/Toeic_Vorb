# Seed Change Record - toeic_vocab_tracker_v3_w1_16_wave_11_2026_05_21

Record status: approved
Change date: 2026-05-21
Owner: Codex
Scope: Program B eleventh V3 production promotion for `V3-W1-16` → `V3-A-136` (人事與組織 搭配詞 2)
Production seed changed: yes
Source seed version: toeic_vocab_tracker_v3_w1_15_wave_10_2026_05_21
New seed version: toeic_vocab_tracker_v3_w1_16_wave_11_2026_05_21
Reason: Continue 人事與組織 W1 collocation rebuild after `V3-A-135`.
Related plan item: C-11
Related ticket / wave: V3 wave 11 / `V3-A-136`

---

## 1. Change Summary

| Change item | Reason | Impacted files | Notes |
|---|---|---|---|
| Add `V3-A-136` lesson row | Eleventh live V3 wave (1 lesson) | `data/vocab/curriculum.json` | 30 runnable lessons |
| Add 23 V3 question rows | Make lesson runnable | `data/vocab/questions_v3a.json` | 379 rows in `questions_v3a.json` |
| Add 4 V3 vocab items | Support four collocation targets | `data/vocab/vocab_items.json` | Cleared 4 legacy `V3-B-136` placeholders |
| Reuse `v3_a_135_rv_024` | Cross-lesson old-item pressure | `data/vocab/curriculum.json` | 0 duplicate new review rows |
| Sync seed version and cache | Force clean reseed | `js/vocab-db.js`, `tests/helpers/seed-idb.ts`, `tests/seed-sync.spec.ts`, `sw.js` | `toeic-vorb-v28` |

---

## 2. Validation

| Command | Result |
|---|---|
| `node scripts/validate-vocab-data.js` | passed — 30 lessons / 619 questions |
| `node scripts/audit-quality-full.js` | passed — 0 blocking |
| `node scripts/audit-duplicates.js` | passed — 619 unique stems |
| `node scripts/check-doc-consistency.js` | passed after doc sync |
| `npm run test:all` | passed |

---

## 3. Rollback

Rollback removes `V3-A-136`, its 23 question rows, and four vocab items; restore prior seed version `toeic_vocab_tracker_v3_w1_15_wave_10_2026_05_21` and service worker cache `toeic-vorb-v27`.
