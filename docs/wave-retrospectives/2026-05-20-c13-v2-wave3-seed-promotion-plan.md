# V2 Wave 3 Seed Promotion Plan
**Task:** C-13 / wave 3 promotion prep  
**Date:** 2026-05-20  
**Status:** READY — candidate trio validated; formal release gate pending

---

## 1. Wave 3 Scope

| Lesson | Scene Domain | Items | Status |
|--------|-------------|-------|--------|
| V2-A-75 | Office Communication | correspondence, notification, inquiry, recipient | ✅ candidate_ready |
| V2-A-76 | Office Facility | lobby, elevator, cafeteria, parking | ✅ candidate_ready |
| V2-A-77 | Office Procedure | authorization, request form, approval, submission | ✅ candidate_ready |

Total new question rows: 72 (24 × 3)  
Total new review_question_ids added to future mixed-review pools: 12 (4 per lesson)

---

## 2. Proposed Seed Version

```
toeic_vocab_tracker_v2_a_75_77_wave_3_{YYYY_MM_DD}
```

If promotion happens on the same day as this plan, the concrete seed version should be:

```
toeic_vocab_tracker_v2_a_75_77_wave_3_2026_05_20
```

---

## 3. Files That Will Change on Promotion

### 3.1 Data Files

| File | Change |
|------|--------|
| `data/vocab/questions_v2a.json` | Append 72 new question rows (V2-A-75 × 24 + V2-A-76 × 24 + V2-A-77 × 24) |
| `data/vocab/curriculum.json` | Add 3 lesson rows (V2-A-75, V2-A-76, V2-A-77) + bump `seed_version` |

### 3.2 JS / Test Seed Version Sync

| File | Change |
|------|--------|
| `js/vocab-db.js` | Update `const SEED_VERSION = "..."` |
| `tests/helpers/seed-idb.ts` | Update `const APP_SEED_VERSION = "..."` |

### 3.3 Service Worker Cache

| File | Change |
|------|--------|
| `sw.js` | Advance `CACHE_NAME` from `toeic-vorb-v12` to `toeic-vorb-v13` |

### 3.4 Test / Current-Truth Docs

| File | Change |
|------|--------|
| `tests/ui-regression.spec.ts` | Update live V2 lesson count, question-bank row count, and sequencing expectations |
| `tests/seed-sync.spec.ts` | Sync live seed version expectations if referenced |
| `TO_AI.md`, `README.md`, `docs/使用說明書.md`, `docs/KNOWN_ISSUES.md`, `docs/Future Plan.md` | Sync live counts, seed version, and next-step text |

---

## 4. Candidate Validation Evidence

| Lesson | Candidate Pack | Human Review |
|--------|----------------|--------------|
| V2-A-75 | `drafts/v0-v3-rebuild/v2_a_75_candidate_draft_pack.json` | `docs/wave-retrospectives/2026-05-20-c13-v2-a-75-candidate-review.md` |
| V2-A-76 | `drafts/v0-v3-rebuild/v2_a_76_candidate_draft_pack.json` | `docs/wave-retrospectives/2026-05-20-c13-v2-a-76-candidate-review.md` |
| V2-A-77 | `drafts/v0-v3-rebuild/v2_a_77_candidate_draft_pack.json` | `docs/wave-retrospectives/2026-05-20-c13-v2-a-77-candidate-review.md` |

Isolated audit progression:

- A75 scope: 120 questions / 5 lessons — PASSED
- A76 scope: 144 questions / 6 lessons — PASSED
- A77 scope: 168 questions / 7 lessons — PASSED

Shared candidate-state warning debt: staircase progression only (28 total across A71-A77 in the final isolated snapshot, 4 new from A77).

---

## 5. UI Regressions to Verify After Promotion

| Regression | Expected Behaviour |
|------------|-------------------|
| Question Bank row count | Shows 168 rows (96 live + 72 wave 3) |
| Roadmap shows V2-A-75, V2-A-76, V2-A-77 | All three appear as `not_started` lessons |
| Today view selects V2-A-75 after V2-A-74 is completed | Correct sequencing |
| Lesson runner loads V2-A-75 first question | `scene_vocabulary` type, 15s timer |
| Old-item pressure appears in V2-A-76 positions 11-12 | `v2_a_75_rv_022` and `v2_a_74_rv_024` render mid-lesson |
| Old-item pressure appears in V2-A-77 positions 11-12 | `v2_a_76_rv_024` and `v2_a_75_rv_022` render mid-lesson |
| Export includes all 168 question rows | `question_bank_snapshot.json` covers the full wave 3 seed |

---

## 6. Release Gate Checklist

- [x] V2-A-75 isolated audit: ✅ PASSED
- [x] V2-A-76 isolated audit: ✅ PASSED
- [x] V2-A-77 isolated audit: ✅ PASSED
- [x] Human review of V2-A-75, V2-A-76, V2-A-77: PASSED
- [ ] Combined wave 3 audit on final promotion payload (post-merge into production files)
- [ ] `node scripts/audit-duplicates.js` on live production payload: 0 duplicates
- [ ] `node scripts/validate-vocab-data.js` on live production payload: PASSED
- [ ] `npm run test:all` (scoring + data/doc/MUP/export + Playwright): PASSED
- [ ] Seed version bumped in all 3 files simultaneously
- [ ] `sw.js` CACHE_NAME advanced to `toeic-vorb-v13`
- [ ] Seed change record created under `docs/seed-changes/`
- [ ] UI regressions verified (Section 5 above)

---

## 7. Promotion Constraint Reminder

Per C-13, formal promotion to production seed should happen only after the full wave 3 set (`V2-A-75` through `V2-A-77`) passes the release gate together. Do not promote `V2-A-75` individually just because it is the fifth lesson needed by `V2-MR-01`.

`V2-MR-01` remains a follow-up step after `V2-A-75` becomes live in production; this plan covers the wave 3 core-lesson promotion only.