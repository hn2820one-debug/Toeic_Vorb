# Seed Change Record - toeic_vocab_tracker_v3_w1_12_wave_7_2026_05_21

Record status: approved
Change date: 2026-05-21
Owner: Codex
Scope: Program B seventh V3 production promotion for `V3-W1-12` → `V3-A-132` (業務協調 搭配詞 2)
Production seed changed: yes
Source seed version: toeic_vocab_tracker_v3_w1_11_wave_6_2026_05_21
New seed version: toeic_vocab_tracker_v3_w1_12_wave_7_2026_05_21
Reason: Continue the live V3 W1 tranche with the second business-coordination collocation lesson.
Related plan item: C-11
Related ticket / wave: V3 wave 7 / `V3-A-132`

---

## 1. Change Summary

| Change item | Reason | Impacted files | Notes |
|---|---|---|---|
| Add `V3-A-132` lesson row | Seventh live V3 wave (1 lesson) | `data/vocab/curriculum.json` | 26 runnable lessons |
| Add 23 V3 question rows | Make lesson runnable (Q10 slot reuses prior review) | `data/vocab/questions_v3a.json` | 287 rows in `questions_v3a.json` |
| Add 7 V3 vocab items | Support seven collocation targets | `data/vocab/vocab_items.json` | Cleared 4 legacy `V3-B-132` placeholders |
| Reuse `v3_a_131_rv_024` | Same-stage old-item pressure | `data/vocab/curriculum.json` | 0 duplicate new review rows |
| Sync seed version and cache | Force clean reseed | `js/vocab-db.js`, `tests/helpers/seed-idb.ts`, `tests/seed-sync.spec.ts`, `sw.js` | `toeic-vorb-v24` |

---

## 2. Validation

| Command | Result |
|---|---|
| `node scripts/validate-vocab-data.js` | passed — 26 lessons / 527 questions |
| `node scripts/audit-quality-full.js` | passed — 0 blocking |
| `node scripts/audit-duplicates.js` | passed — 527 unique stems |
| `node scripts/check-doc-consistency.js` | passed after doc sync |
| `npm run test:all` | passed |

---

## 3. Rollback

Rollback removes `V3-A-132`, its 23 question rows, and seven vocab items; restore prior seed version `toeic_vocab_tracker_v3_w1_11_wave_6_2026_05_21` and service worker cache `toeic-vorb-v23`.
