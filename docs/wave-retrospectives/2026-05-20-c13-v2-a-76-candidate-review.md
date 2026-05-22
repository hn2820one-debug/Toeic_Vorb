# Wave Retrospective: V2-A-76 Candidate Draft Review
**Date:** 2026-05-20  
**Task:** C-13 continuation  
**Artifact:** `drafts/v0-v3-rebuild/v2_a_76_candidate_draft_pack.json`  
**Status:** PASSED - production_candidate_ready

---

## 1. Lesson Summary

| Field | Value |
|-------|-------|
| lesson_id | V2-A-76 |
| Title | Office Facility Scene Vocabulary |
| Scene Domain | Office Facility |
| Target Items | lobby, elevator, cafeteria, parking |
| New Question Rows | 24 |
| question_ids total | 22 (20 core + 2 old-item pressure refs) |
| Old-Item Pressure Refs | `v2_a_75_rv_022` (notification), `v2_a_74_rv_024` (directory) |
| review_question_ids | `v2_a_76_rv_021` through `v2_a_76_rv_024` |
| Answer Balance (24 rows) | A=6, B=6, C=6, D=6 |
| Production impact | none |

---

## 2. Isolated Audit Result

**Audit Scope:** V2-A-71 through V2-A-74 production (96q) + V2-A-75 draft (24q) + V2-A-76 draft (24q) = 144q, 6 lessons  
**Audit Root:** `tmp/v2-a-76-isolated-audit`

| Check | Result |
|-------|--------|
| Structural validation | passed |
| Blocking issues | 0 |
| Duplicate stems | 0 |
| Required field / format issues | 0 |
| Definition leakage issues | 0 |
| Article giveaways | 0 |
| Old-item pressure issues | 0 |
| Lesson reference / count issues | 0 |
| Target item coverage issues | 0 |
| Answer distribution issues | 0 |
| Explanation quality warnings | 0 |
| Stem length warnings | 0 |
| Blank position concentration warnings | 0 |
| Staircase progression warnings | 24 total, 4 new from V2-A-76 |

**Final verdict:** PASSED - no blocking issues found.

---

## 3. Content Quality Review

### 3.1 Scene Realism

All 20 core questions stay in office facility contexts:

- lobby: visitor waiting, reception flow, interview check-in, digital sign-in guidance, drill holding area
- elevator: floor access, freight movement, inspection notice, executive-floor travel, basement service route
- cafeteria: lunch break, overflow meal location, badge-paid meals, outside-food policy, night-shift dining
- parking: guest lot access, underground spaces, permit gate control, map guidance, temporary alternate parking

No final stem uses direct-definition wording. The lesson keeps the facility nouns separate by operational purpose rather than by place-name recognition only.

### 3.2 Old-Item Pressure

`V2-A-76` keeps wave 3 same-stage pressure active through two reused prior review refs:

- `v2_a_75_rv_022` keeps communication-alert context active through `notification`
- `v2_a_74_rv_024` keeps document-location context active through `directory`

Both references are valid earlier V2 review rows. The isolated audit reports old-item pressure issues: 0.

### 3.3 Answer Distribution

| Item | Correct-answer pattern | Totals |
|------|------------------------|--------|
| lobby | A, B, C, D, A | A=2, B=1, C=1, D=1 |
| elevator | B, C, D, A, B | A=1, B=2, C=1, D=1 |
| cafeteria | C, D, A, B, C | A=1, B=1, C=2, D=1 |
| parking | D, A, B, C, D | A=1, B=1, C=1, D=2 |

Core total: A=5, B=5, C=5, D=5  
Review total: A=1, B=1, C=1, D=1  
Grand total: A=6, B=6, C=6, D=6

---

## 4. Staircase Warnings

4 new staircase warnings appear for `lobby`, `elevator`, `cafeteria`, and `parking`.

**Decision:** Accept as candidate-status debt only. The current audit still ranks the five `scene_vocabulary` rows above the final `review_question`, so the same V2 staircase warning pattern remains expected for every core lesson using the 20+4 shape. No live rewrite is justified without learner/export evidence.

---

## 5. C-13 Status

`V2-A-76` candidate authoring, isolated validation, duplicate audit, full quality audit, and human review are complete. This does not promote `V2-A-76` to production.

At this stage, `V2-A-75` and `V2-A-76` are both candidate-ready; the next remaining authoring step was `V2-A-77`, followed by the formal wave 3 promotion gate.