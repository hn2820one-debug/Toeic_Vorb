# Wave Retrospective: V2-A-75 Candidate Draft Review
**Date:** 2026-05-20  
**Task:** C-13 start  
**Artifact:** `drafts/v0-v3-rebuild/v2_a_75_candidate_draft_pack.json`  
**Status:** PASSED - production_candidate_ready

---

## 1. Lesson Summary

| Field | Value |
|-------|-------|
| lesson_id | V2-A-75 |
| Title | Office Communication Scene Vocabulary |
| Scene Domain | Office Communication |
| Target Items | correspondence, notification, inquiry, recipient |
| New Question Rows | 24 |
| question_ids total | 22 (20 core + 2 old-item pressure refs) |
| Old-Item Pressure Refs | `v2_a_74_rv_021` (memo), `v2_a_73_rv_022` (deadline) |
| review_question_ids | `v2_a_75_rv_021` through `v2_a_75_rv_024` |
| Answer Balance (24 rows) | A=6, B=6, C=6, D=6 |
| Production impact | none |

---

## 2. Isolated Audit Result

**Audit Scope:** V2-A-71 through V2-A-74 production (96q) + V2-A-75 draft (24q) = 120q, 5 lessons  
**Audit Root:** `tmp/v2-a-75-isolated-audit`

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
| Staircase progression warnings | 20 total, 4 new from V2-A-75 |

**Final verdict:** PASSED - no blocking issues found.

---

## 3. Process Improvement From The First Gate

The first isolated full audit caught one blocking issue in `v2_a_75_q_004`: the original stem listed "two letters and three emails", which the audit correctly classified as embedded definition leakage for `correspondence`.

The row was rewritten from a direct clue into a neutral project-file context:

`Office: After the phone call, Maya added the vendor ______ to the project file before the legal review.`

The second isolated audit then passed with definition leakage issues: 0. This confirms the previous release-gate process is still useful for catching authoring shortcuts before any production seed change.

---

## 4. Content Quality Review

### 4.1 Scene Realism

All 20 core questions stay in office communication contexts:

- correspondence: client records, supplier email files, cross-office written records, vendor project files, audit evidence
- notification: system alerts, HR portal confirmations, urgent facility notices, schedule changes, security reminders
- inquiry: pricing questions, delivery-date questions, invoice case opening, training-date questions, technical support questions
- recipient: memo send list, mailroom package names, invoice routing, email privacy, failed notification routing

No final stem uses direct-definition wording. The lesson separates communication object, alert, question, and receiver roles clearly enough for same-scene distractors to remain plausible without creating second-correct answers.

### 4.2 Old-Item Pressure

`V2-A-75` improves on the wave 2 pattern by using two prior same-stage review refs in `question_ids`:

- `v2_a_74_rv_021` keeps document vocabulary active through `memo`
- `v2_a_73_rv_022` keeps scheduling pressure active through `deadline`

Both are valid earlier V2 core review rows. The isolated audit reports old-item pressure issues: 0.

### 4.3 Answer Distribution

| Item | Correct-answer pattern | Totals |
|------|------------------------|--------|
| correspondence | A, B, C, D, A | A=2, B=1, C=1, D=1 |
| notification | B, C, D, A, B | A=1, B=2, C=1, D=1 |
| inquiry | C, D, A, B, C | A=1, B=1, C=2, D=1 |
| recipient | D, A, B, C, D | A=1, B=1, C=1, D=2 |

Core total: A=5, B=5, C=5, D=5  
Review total: A=1, B=1, C=1, D=1  
Grand total: A=6, B=6, C=6, D=6

---

## 5. Staircase Warnings

4 new staircase warnings appear for `correspondence`, `notification`, `inquiry`, and `recipient`.

**Decision:** Accept as candidate-status debt only. The current audit ranks all `scene_vocabulary` rows equally, then treats the final V2 `review_question` as a lower-rank direct-definition row, so this warning remains expected for every V2 core lesson using the current 20+4 shape. A live production rewrite is not justified without learner/export evidence.

---

## 6. C-13 Status

`V2-A-75` candidate authoring, isolated validation, duplicate audit, full quality audit, and human review are complete. This does not promote `V2-A-75` to production.

Next process:

1. Prepare wave 3 continuation candidates `V2-A-76` and `V2-A-77`.
2. After wave 3 candidates pass isolated validation and human review, run the formal wave 3 production promotion gate for `V2-A-75` through `V2-A-77`.
3. Only after `V2-A-75` is live in production, assemble `V2-MR-01` from the five source core lessons.
