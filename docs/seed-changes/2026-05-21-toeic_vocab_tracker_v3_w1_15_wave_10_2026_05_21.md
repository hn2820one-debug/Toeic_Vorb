# Seed Change Record - toeic_vocab_tracker_v3_w1_15_wave_10_2026_05_21

Record status: approved
Change date: 2026-05-21
Owner: Codex
Scope: Program B tenth V3 production promotion for `V3-W1-15` → `V3-A-135` (人事與組織 搭配詞 1)
Production seed changed: yes
Source seed version: toeic_vocab_tracker_v3_w1_14_wave_9_2026_05_21
New seed version: toeic_vocab_tracker_v3_w1_15_wave_10_2026_05_21
Reason: Open the 人事與組織 topic in live V3 production after completing 業務協調 W1.
Related plan item: C-11
Related ticket / wave: V3 wave 10 / `V3-A-135`

---

## 1. Change Summary

| Change item | Reason | Impacted files | Notes |
|---|---|---|---|
| Add `V3-A-135` lesson row | Tenth live V3 wave (1 lesson) | `data/vocab/curriculum.json` | 29 runnable lessons |
| Add 23 V3 question rows | Make lesson runnable | `data/vocab/questions_v3a.json` | 356 rows in `questions_v3a.json` |
| Add 5 V3 vocab items | Support five collocation targets | `data/vocab/vocab_items.json` | Cleared 4 legacy `V3-B-135` placeholders |
| Reuse `v3_a_134_rv_024` | Cross-topic old-item pressure | `data/vocab/curriculum.json` | 0 duplicate new review rows |
| Sync seed version and cache | Force clean reseed | `js/vocab-db.js`, `tests/helpers/seed-idb.ts`, `tests/seed-sync.spec.ts`, `sw.js` | `toeic-vorb-v27` |

---

## 2. Validation

| Command | Result |
|---|---|
| `node scripts/validate-vocab-data.js` | passed — 29 lessons / 596 questions |
| `node scripts/audit-quality-full.js` | passed — 0 blocking |
| `node scripts/audit-duplicates.js` | passed — 596 unique stems |
| `node scripts/check-doc-consistency.js` | passed after doc sync |
| `npm run test:all` | passed |

---

## 3. Rollback

Rollback removes `V3-A-135`, its 23 question rows, and five vocab items; restore prior seed version `toeic_vocab_tracker_v3_w1_14_wave_9_2026_05_21` and service worker cache `toeic-vorb-v26`.
