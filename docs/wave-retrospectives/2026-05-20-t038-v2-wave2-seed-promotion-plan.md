# V2 Wave 2 Seed Promotion Plan
**Task:** T038  
**Date:** 2026-05-20  
**Status:** COMPLETED — T039 release gate passed and wave 2 promoted to production

---

## 1. Wave 2 Scope

| Lesson | Scene Domain | Items | Status |
|--------|-------------|-------|--------|
| V2-A-72 | Office Meetings | agenda, minutes, attendee, venue | ✅ candidate_ready |
| V2-A-73 | Office Scheduling | appointment, deadline, itinerary, availability | ✅ candidate_ready |
| V2-A-74 | Office Documents | memo, invoice, attachment, directory | ✅ candidate_ready |

Total new question rows: 72 (24 × 3)  
Total review_question_ids added to V2-MR-01 pool: 12 (4 per lesson)

---

## 2. Final Seed Version

```
toeic_vocab_tracker_v2_a_72_74_wave_2_2026_05_20
```

T039 used the same-day promotion date after the full release gate passed.

---

## 3. Files That Will Change on Promotion

### 3.1 Data Files

| File | Change |
|------|--------|
| `data/vocab/questions_v2a.json` | Append 72 new question rows (V2-A-72 × 24 + V2-A-73 × 24 + V2-A-74 × 24) |
| `data/vocab/curriculum.json` | Add 3 lesson rows (V2-A-72, V2-A-73, V2-A-74) + bump `seed_version` |

### 3.2 JS Seed Version (must be simultaneous with curriculum.json)

| File | Change |
|------|--------|
| `js/vocab-db.js` | Update `const SEED_VERSION = "..."` |
| `tests/helpers/seed-idb.ts` | Update `const APP_SEED_VERSION = "..."` |

### 3.3 Service Worker Cache

| File | Change |
|------|--------|
| `sw.js` | Advance `CACHE_NAME` from `toeic-vorb-v11` to `toeic-vorb-v12` |

---

## 4. Seed Change Record

A completed record from `docs/templates/seed-change-record-template.md` was created under `docs/seed-changes/` as:
```
docs/seed-changes/2026-05-20-toeic_vocab_tracker_v2_a_72_74_wave_2_2026_05_20.md
```

---

## 5. UI Regressions to Verify After Promotion

| Regression | Expected Behaviour |
|------------|-------------------|
| Question Bank row count | Shows 96 rows (24 V2-A-71 + 72 wave 2) |
| Roadmap shows V2-A-72, V2-A-73, V2-A-74 | All three appear as `not_started` lessons |
| Today view selects V2-A-72 after V2-A-71 is completed | Correct sequencing |
| Lesson runner loads V2-A-72 first question | `scene_vocabulary` type, 15s timer |
| Old-item pressure appears at position 11 in V2-A-73 | `v2_a_72_rv_021` (agenda quick recall) rendered mid-lesson |
| Old-item pressure appears at position 11 in V2-A-72 | `v2_a_71_rv_021` rendered mid-lesson |
| Review queue correctly identifies SCENE_VOCAB_GAP errors | Wave 2 errors appear in Mistakes view |
| Export includes all 96 question rows | question_bank_snapshot.json covers all V2 production questions |

---

## 6. Release Gate Checklist (T039 — completed)

- [x] V2-A-74 isolated audit: ✅ PASSED
- [x] Human review of V2-A-74: PASSED
- [x] Combined wave 2 audit (V2-A-71 + V2-A-72 + V2-A-73 + V2-A-74): ✅ PASSED
- [x] `node scripts/audit-duplicates.js` on combined data: 0 duplicates
- [x] `node scripts/validate-vocab-data.js` on combined data: PASSED
- [x] `npm run test:all` (scoring + data/doc/MUP/export + Playwright): PASSED
- [x] Seed version bumped in all 3 files simultaneously
- [x] `sw.js` CACHE_NAME advanced to `toeic-vorb-v12`
- [x] Seed change record created: `docs/seed-changes/2026-05-20-toeic_vocab_tracker_v2_a_72_74_wave_2_2026_05_20.md`
- [x] UI regressions verified (Section 5 above)

---

## 7. Promotion Constraint Reminder

Per hard rule (C-10): formal promotion to production seed only after ALL three wave 2 lessons (V2-A-72, V2-A-73, V2-A-74) pass release gate. Do not promote V2-A-72 or V2-A-73 individually ahead of V2-A-74.

T039 result: constraint satisfied. `V2-A-72`, `V2-A-73`, and `V2-A-74` were promoted together into the live seed, bringing production to 4 lesson rows and 96 question rows.
