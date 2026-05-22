# Wave Retrospective: C-11 V3-W1-02 Candidate Review
**Date:** 2026-05-21  
**Task:** V3 wave 2 candidate authoring (lesson 2 of 10)  
**Scope:** Author and validate `V3-W1-02` against the live `V3-A-121` production baseline  
**Status:** APPROVED AS DRAFT CANDIDATE — not promoted

---

## 1. Review Summary

`V3-W1-02` ("辦公室 搭配詞 2") is the second V3 collocation candidate. It remains isolated in `drafts/v0-v3-rebuild/v3_w1_02_candidate_draft_pack.json` with `production_impact: none`.

| Item | Value |
|---|---|
| Draft lesson | `V3-W1-02` (`lesson_number` 122 for audit ordering) |
| Promotion target | `V3-A-122` |
| New rows | 24 |
| Staged vocab items | 7 |
| Prior review pressure | `v3_a_121_rv_024` from live `V3-A-121` |

---

## 2. Validation

| Check | Result |
|---|---|
| `node tmp/build-v3-w1-02-candidate.js` | passed |
| `node tmp/build-v3-w1-02-isolated-audit.js` | passed: 13 lessons / 288 questions |
| `VOCAB_AUDIT_ROOT=tmp/v3-w1-02-current-isolated-audit node scripts/audit-quality-full.js` | passed: 0 blocking issues |
| Answer distribution | A=6, B=6, C=6, D=6 |
| Staircase warnings | 8 new on `V3-W1-02`; 48 total with production baseline |

---

## 3. Release Decision

`V3-W1-02` is approved as a draft production candidate only.

Do not promote until:

1. `V3-W1-03` is authored (planned paired V3 wave 2), or a deliberate single-lesson promotion is approved.
2. Formal promotion mapping to `V3-A-122` and seed sync are executed through `docs/rebuild-wave-release-gate.md`.
3. `npm run test:all` passes after any production promotion.

Next process: author `V3-W1-03`, then run the formal V3 wave 2 promotion gate for `V3-A-122` (+ optional `V3-A-123`).
