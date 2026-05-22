# Wave Retrospective: C-11 V3-W1-01 Current-Baseline Candidate Review
**Date:** 2026-05-21  
**Task:** C-11 first V3 production candidate preparation  
**Scope:** Validate `V3-W1-01` as a draft-only production candidate against the current V2 ten-core baseline  
**Status:** PROMOTED on 2026-05-21 — see `docs/wave-retrospectives/2026-05-21-c11-v3-w1-01-promotion-review.md`

---

## 1. Review Summary

`V3-W1-01` is the first V3 collocation production candidate. It remains isolated in `drafts/v0-v3-rebuild/v3_w1_01_candidate_draft_pack.json` with `production_impact: none`; no production seed file was changed.

The candidate was revalidated against the current live baseline:

- Production baseline: `V2-A-71` through `V2-A-80` plus `V2-MR-01`
- Candidate added in isolated root only: `V3-W1-01`
- Isolated scope: 12 lessons / 264 questions
- Seed unchanged: `toeic_vocab_tracker_v2_a_78_80_wave_4_2026_05_21`

---

## 2. Fixes Applied Before Acceptance

| Area | Fix |
|---|---|
| Answer slot semantics | Repaired `V3-W1-01_Q04`, `V3-W1-01_Q10`, and `V3-W1-01_Q14` so the balanced `correct_answer` slot contains the phrase named by the explanation. |
| Stem length | Expanded `Q07`, `Q11`, `Q13`, and `Q14` into the preferred stem range. |
| Explanation quality | Added rule cues and trap cues to `Q12`, `Q14`, `Q15`, `Q18`, and `R03`. |
| Candidate metadata | Updated the validation block to reflect the current 240-row production baseline plus the 24-row V3 draft candidate. |

The final candidate answer distribution remains balanced: A=6, B=6, C=6, D=6.

---

## 3. Validation

| Check | Result |
|---|---|
| `node tmp/build-v3-current-isolated-audit.js` | passed: built isolated root with 12 lessons / 264 questions |
| `VOCAB_AUDIT_ROOT=tmp/v3-w1-01-current-isolated-audit node scripts/audit-quality-full.js` | passed: 0 blocking issues |
| Duplicate stems | 0 in isolated full audit |
| Answer validity | 0 issues |
| Definition leakage / article giveaways | 0 issues |
| Old-item pressure | 0 issues |
| V4 production leakage | 0 issues |
| Explanation quality warnings | 0 |
| Preferred stem length warnings | 0 |
| Staircase progression warnings | 44 total: 40 existing V2 warnings + 4 V3 candidate warnings |

The 4 V3 staircase warnings are expected for this first collocation candidate because each target phrase appears across a compact within-lesson progression and the audit demand-rank heuristic remains conservative. They are accepted as draft-candidate warning debt only, not as production debt.

---

## 4. Release Decision

`V3-W1-01` is approved as the first V3 draft production candidate under C-11.

It is not yet promoted. Formal production promotion still requires:

- seed/file mapping into `data/vocab/questions_v3a.json` and `data/vocab/curriculum.json`
- seed version sync across all required files
- seed-change record
- production validation, full audit, duplicate audit, docs consistency check, and Playwright regression
- explicit release decision that a single-lesson first V3 wave is acceptable

Next process: prepare the formal V3 seed promotion gate for `V3-W1-01`, or author/validate `V3-W1-02` first if the release strategy requires a paired V3 wave.
