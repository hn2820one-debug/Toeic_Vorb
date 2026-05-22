# Wave Retrospective: V2-A-74 Candidate Draft Review
**Date:** 2026-05-20  
**Task:** C-10 follow-up  
**Artifact:** `drafts/v0-v3-rebuild/v2_a_74_candidate_draft_pack.json`  
**Status:** PASSED — production_candidate_ready

---

## 1. Lesson Summary

| Field | Value |
|-------|-------|
| lesson_id | V2-A-74 |
| Title | Office Document Scene Vocabulary |
| Scene Domain | Office Documents |
| Target Items | memo, invoice, attachment, directory |
| New Question Rows | 24 |
| question_ids total | 21 (20 core + 1 old-item pressure ref) |
| Old-Item Pressure Ref | v2_a_73_rv_021 (appointment, from V2-A-73 draft) |
| review_question_ids | v2_a_74_rv_021 – v2_a_74_rv_024 |
| Answer Balance (24 rows) | A=6, B=6, C=6, D=6 ✓ |

---

## 2. Isolated Audit Result

**Audit Scope:** V2-A-71 production (24q) + V2-A-72 draft (24q) + V2-A-73 draft (24q) + V2-A-74 draft (24q) = 96q, 4 lessons  
**Audit Command:** `node scripts/audit-quality-full.js` with `VOCAB_AUDIT_ROOT=tmp/v2-a-74-isolated-audit`

| Check | Result |
|-------|--------|
| Blocking issues | 0 ✅ |
| Duplicate stems | 0 ✅ |
| Required field / format issues | 0 ✅ |
| Article giveaways | 0 ✅ |
| Old-item pressure issues | 0 ✅ |
| Lesson reference / count issues | 0 ✅ |
| Target item coverage issues | 0 ✅ |
| Answer distribution issues | 0 ✅ |
| Explanation quality warnings | 0 ✅ |
| Stem length warnings | 0 ✅ |
| Blank position concentration warnings | 0 ✅ |
| **Staircase progression warnings** | **16 (non-blocking)** |

**Final verdict:** ✅ PASSED — no blocking issues found.

---

## 3. Staircase Warnings (Non-Blocking)

4 new staircase warnings from V2-A-74 (memo, invoice, attachment, directory).  
4 inherited warnings from V2-A-73 (appointment, deadline, itinerary, availability) — already accepted.  
4 inherited warnings from V2-A-72 (agenda, minutes, attendee, venue) — already accepted.  
4 inherited warnings from V2-A-71 (extension, photocopier, stationery, workstation) — already accepted.

**Acceptance decision:** All 16 staircase warnings are accepted as candidate-status debt only. The current audit heuristic still flags same-type repetition across the 5 core rows plus 1 review row, but V2-A-74 uses distinct demand tags and document-purpose separation (`memo` internal notice, `invoice` billing document, `attachment` email file, `directory` contact list). Reclassification should wait for real learner export evidence rather than preemptive live-seed rewriting.

---

## 4. Content Quality Review

### 4.1 Article Giveaway Check

No article-giveaway rewrites were required in the final draft. All final stems avoid `a/an ______` style clues before the blank and still pass the full audit with article giveaways: 0.

### 4.2 Scene Realism And Document-Purpose Control

All 20 core questions stay within recognizable office document contexts:

- memo: staff notice, travel approval steps, meeting-summary note, appointment reschedule notice, filing-deadline announcement
- invoice: supplier release, purchase-order matching, late fee, corrected billing, mail routing to finance
- attachment: missing file, resent proposal, spreadsheet naming, launch email support file, PDF budget details
- directory: extension lookup, vendor branch lookup, employee update, online number search, visitor contact navigation

No item uses direct-definition wording inside the stem. The lesson avoids the main V2-A-74 risk identified in planning: document-purpose control remains clear, so `memo`, `invoice`, `attachment`, and `directory` do not collapse into generic “document” recognition.

### 4.3 Distractor Plausibility

Each question uses the four office-document words as options. All four are plausible office nouns, but the surrounding context makes the intended document purpose recoverable. Explanations include a named contrast to reduce false certainty from same-scene familiarity.

### 4.4 Old-Item Pressure

`v2_a_73_rv_021` (appointment) is placed at position 11 in the `question_ids` sequence, between the invoice and attachment clusters. This keeps same-stage pressure active while the new lesson shifts into office-document vocabulary. The combined isolated audit reports old-item pressure issues: 0.

---

## 5. Answer Distribution Verification

### Core Questions (q_001 – q_020)

| Item | Correct-answer pattern | Totals |
|------|------------------------|--------|
| memo | A, B, C, D, A | A×2, B×1, C×1, D×1 |
| invoice | B, C, D, A, B | A×1, B×2, C×1, D×1 |
| attachment | C, D, A, B, C | A×1, B×1, C×2, D×1 |
| directory | D, A, B, C, D | A×1, B×1, C×1, D×2 |

Total core: A=5, B=5, C=5, D=5 ✓

### Review Questions (rv_021 – rv_024)

| ID | Item | Correct |
|----|------|---------|
| rv_021 | memo | A |
| rv_022 | invoice | B |
| rv_023 | attachment | C |
| rv_024 | directory | D |

Total reviews: A=1, B=1, C=1, D=1 ✓

**Grand total (24 rows): A=6, B=6, C=6, D=6 ✓**

---

## 6. Post-Review Acceptance Decisions

| Issue | Classification | Decision |
|-------|---------------|----------|
| 4 staircase warnings for memo, invoice, attachment, directory | Non-blocking warning | Accepted as candidate-status debt. Same rationale as V2-A-71, V2-A-72, and V2-A-73. |

---

## 7. Wave 2 Gate Status

V2-A-74 now completes the three required wave 2 candidate drafts. Formal wave 2 release gate (T039) is no longer blocked on missing authoring work; the next step is to run the full release-gate checklist and production-promotion validations.

| Lesson | Status |
|--------|--------|
| V2-A-72 | ✅ production_candidate_ready |
| V2-A-73 | ✅ production_candidate_ready |
| V2-A-74 | ✅ production_candidate_ready |
| Wave 2 Promotion (T039) | 🟡 Ready for formal gate execution |
