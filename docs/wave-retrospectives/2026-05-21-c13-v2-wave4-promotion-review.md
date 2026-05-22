# Wave Retrospective: V2 Wave 4 Production Promotion
**Date:** 2026-05-21  
**Task:** C-13 wave 4 release gate  
**Scope:** Promote `V2-A-78` through `V2-A-80` into production  
**Status:** APPROVED - live production seed

---

## 1. Promotion Summary

Wave 4 promoted the validated candidate trio into the live V2 production seed:

- `V2-A-78` - Business Event Scene Vocabulary
- `V2-A-79` - Business Travel Scene Vocabulary
- `V2-A-80` - Workplace Policy Scene Vocabulary

Production now contains 11 runnable lessons and 240 question-bank rows: 10 V2 core lessons (`V2-A-71` through `V2-A-80`) plus `V2-MR-01`.

Seed version advanced to `toeic_vocab_tracker_v2_a_78_80_wave_4_2026_05_21`, and service worker cache advanced to `toeic-vorb-v15`.

---

## 2. Data Changes

| File | Change |
|---|---|
| `data/vocab/curriculum.json` | Added 3 lesson rows and updated V2 `total_lessons` to 11 |
| `data/vocab/questions_v2a.json` | Added 72 question rows |
| `js/vocab-db.js` | Synced `SEED_VERSION` |
| `tests/helpers/seed-idb.ts` | Synced `APP_SEED_VERSION` |
| `tests/seed-sync.spec.ts` | Synced test seed constant |
| `sw.js` | Advanced cache to `toeic-vorb-v15` |

Candidate tags were converted from `candidate_wave_v2_a_78/79/80` to `production_wave_v2_a_78/79/80` before entering production.

---

## 3. Validation

| Check | Result |
|---|---|
| `node scripts/validate-vocab-data.js` | passed: 11 lessons, 240 questions |
| `node scripts/check-doc-consistency.js` | passed: seed/cache/counts aligned |
| `node scripts/audit-quality-full.js` | passed: 0 blocking issues |
| `node scripts/audit-duplicates.js` | passed: 240 unique stems |
| Answer distribution | A=60, B=60, C=60, D=60 |
| Old-item pressure issues | 0 |
| Preferred stem length warnings | 0 |
| Staircase progression warnings | 40 total |

The 40 staircase warnings are accepted as existing non-blocking V2 warning debt. They should not trigger a live seed rewrite without real learner/export evidence or an isolated draft probe.

---

## 4. Release Decision

Approved for production. This completes the C-13 target of 10 live V2 core lessons.

The next process is not another V2 core promotion. The next process is T049 learner/export feedback review when real learner data exists; after that, the content expansion path should move to C-11 V3 production candidate preparation.
