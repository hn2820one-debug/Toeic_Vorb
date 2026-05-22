# Seed Change Record - toeic_vocab_tracker_v3_w2_01_wave_12_2026_05_21

Record status: approved
Change date: 2026-05-21
Owner: Codex
Scope: Program B twelfth V3 production promotion — first wave-2 core lesson `V3-W2-01` → `V3-A-137` (人事與組織 搭配詞 3)
Production seed changed: yes
Source seed version: toeic_vocab_tracker_v3_mr_03_mixed_review_2026_05_21
New seed version: toeic_vocab_tracker_v3_w2_01_wave_12_2026_05_21
Reason: Start wave-2 collocation rebuild after wave-1 core completion; third HR/org lesson from Phrase_411 remaining targets.
Related plan item: C-11
Related ticket / wave: V3 wave 12 / `V3-A-137`

---

## 1. Change Summary

| Change item | Reason | Impacted files | Notes |
|---|---|---|---|
| Add `V3-A-137` lesson row | First wave-2 core lesson | `data/vocab/curriculum.json` | 32 runnable lessons |
| Add 23 V3 question rows | Make lesson runnable | `data/vocab/questions_v3a.json` | 402 rows in `questions_v3a.json` |
| Add 6 V3 vocab items | Six collocation targets | `data/vocab/vocab_items.json` | Cleared 4 legacy `V3-B-137` placeholders |
| Reuse `v3_a_136_rv_024` | Cross-lesson pressure | `data/vocab/curriculum.json` | 0 duplicate new review rows |
| Sync seed version and cache | Force clean reseed | `js/vocab-db.js`, `tests/helpers/seed-idb.ts`, `tests/seed-sync.spec.ts`, `sw.js` | `toeic-vorb-v30` |

---

## 2. Validation

| Command | Result |
|---|---|
| `node scripts/validate-vocab-data.js` | passed — 32 lessons / 642 questions |
| `node scripts/audit-quality-full.js` | passed — 0 blocking |
| `node scripts/audit-duplicates.js` | passed — 642 unique stems |
| `node scripts/check-doc-consistency.js` | passed after doc sync |
| `npm run test:all` | passed |

---

## 3. Rollback

Rollback removes `V3-A-137`, its 23 question rows, and six vocab items; restore prior seed version `toeic_vocab_tracker_v3_mr_03_mixed_review_2026_05_21` and service worker cache `toeic-vorb-v29`.
