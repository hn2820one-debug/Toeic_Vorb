# Wave Retrospective: V2-A-73 Candidate Draft Review
**Date:** 2026-05-20  
**Task:** T040  
**Artifact:** `drafts/v0-v3-rebuild/v2_a_73_candidate_draft_pack.json`  
**Status:** PASSED — production_candidate_ready

---

## 1. Lesson Summary

| Field | Value |
|-------|-------|
| lesson_id | V2-A-73 |
| Title | Scheduling Scene Vocabulary |
| Scene Domain | Office Scheduling |
| Target Items | appointment, deadline, itinerary, availability |
| New Question Rows | 24 |
| question_ids total | 21 (20 core + 1 old-item pressure ref) |
| Old-Item Pressure Ref | v2_a_72_rv_021 (agenda, from V2-A-72 draft) |
| review_question_ids | v2_a_73_rv_021 – v2_a_73_rv_024 |
| Answer Balance (24 rows) | A=6, B=6, C=6, D=6 ✓ |

---

## 2. Isolated Audit Result

**Audit Scope:** V2-A-71 production (24q) + V2-A-72 draft (24q) + V2-A-73 draft (24q) = 72q, 3 lessons  
**Audit Command:** `node scripts/audit-quality-full.js` with `VOCAB_AUDIT_ROOT=tmp/v2-a-73-isolated-audit`

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
| **Staircase progression warnings** | **12 (non-blocking)** |

**Final verdict:** ✅ PASSED — no blocking issues found.

---

## 3. Staircase Warnings (Non-Blocking)

4 new staircase warnings from V2-A-73 (appointment, deadline, itinerary, availability).  
4 inherited warnings from V2-A-72 (agenda, minutes, attendee, venue) — already accepted.  
4 inherited warnings from V2-A-71 (extension, photocopier, stationery, workstation) — already accepted.

**Acceptance decision:** All 12 staircase warnings accepted as candidate-status debt. The audit heuristic flags same-type repetition (all 5 core questions use `scene_vocabulary`), but demand tags (`demand:basic_scene_fit`, `demand:consequence_warning`, `demand:scheduling_conflict`, etc.) provide genuine contextual difficulty graduation. Will not be reclassified until real learner export data provides evidence of an actual pedagogical problem.

---

## 4. Content Quality Review

### 4.1 Article Giveaway Fixes Applied During Authoring

Four sentences initially drafted with `"an ______ "` were restructured before final audit:
- q_001: `schedule an ______` → `schedule your ______`
- q_002: `book an ______` → `schedule their ______`
- q_005: `have an ______` → `have back-to-back ______ slots`
- rv_021: `arrange an ______` → `book the first ______`

All four fixes confirmed article-giveaway free in audit.

### 4.2 Scene Realism

All 20 core questions situate vocabulary in recognisable office scheduling contexts:
- appointment: consultant booking, HR portal, automated reminder, rescheduling, conflict detection
- deadline: invoice extension, shipping warning, holiday adjustment, partial compliance, supplier negotiation
- itinerary: delegate distribution, revision reissue, accommodation cross-reference, speaker logistics, CEO approval
- availability: room booking, director schedule constraint, server resource check, self-service booking, conflict prevention

No items use direct-definition phrasing. All stems describe an office scenario where the word would naturally appear.

### 4.3 Distractor Plausibility

Each question uses the four scheduling scene words (appointment, deadline, itinerary, availability) as options. All four are plausible office vocabulary; none are trivially easy to eliminate. Explanations include an explicit named distractor contrast.

### 4.4 Old-Item Pressure

`v2_a_72_rv_021` (agenda, "Which meeting word means the list of topics to discuss?") is placed at position 11 in the question_ids sequence (between deadline cluster and itinerary cluster). This maintains cross-lesson pressure on the prior lesson's highest-recall item. The reference is validated in the combined V2-A-71 + V2-A-72 + V2-A-73 isolated audit with old-item pressure issues: 0.

---

## 5. Answer Distribution Verification

### Core Questions (q_001 – q_020)

| Item | q_001 | q_002 | q_003 | q_004 | q_005 | Dist |
|------|-------|-------|-------|-------|-------|------|
| appointment | A | B | C | D | A | A×2, B×1, C×1, D×1 |
| deadline | B | C | D | A | B | A×1, B×2, C×1, D×1 |
| itinerary | C | D | A | B | C | A×1, B×1, C×2, D×1 |
| availability | D | A | B | C | D | A×1, B×1, C×1, D×2 |

Total core: A=5, B=5, C=5, D=5 ✓

### Review Questions (rv_021 – rv_024)

| ID | Item | Correct |
|----|------|---------|
| rv_021 | appointment | A |
| rv_022 | deadline | B |
| rv_023 | itinerary | C |
| rv_024 | availability | D |

Total reviews: A=1, B=1, C=1, D=1 ✓

**Grand total (24 rows): A=6, B=6, C=6, D=6 ✓**

---

## 6. Post-Release Acceptance Decisions

| Issue | Classification | Decision |
|-------|---------------|----------|
| 4 staircase warnings for appointment, deadline, itinerary, availability | Non-blocking warning | Accepted as candidate-status debt. Same rationale as V2-A-71 and V2-A-72. |

---

## 7. Wave 2 Gate Status

V2-A-73 is now the second of three required wave 2 lessons. Wave 2 seed promotion (T039) remains blocked until V2-A-74 is also drafted, passes isolated audit, and passes human review.

| Lesson | Status |
|--------|--------|
| V2-A-72 | ✅ production_candidate_ready |
| V2-A-73 | ✅ production_candidate_ready |
| V2-A-74 | 🔲 Not yet drafted |
| Wave 2 Promotion (T039) | ⛔ Blocked on V2-A-74 |
