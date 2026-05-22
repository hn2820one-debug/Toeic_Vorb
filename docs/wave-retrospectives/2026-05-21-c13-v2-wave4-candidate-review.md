# Wave Retrospective: V2 Wave 4 Candidate Draft Review
**Date:** 2026-05-21  
**Task:** C-13 continuation  
**Artifacts:** `drafts/v0-v3-rebuild/v2_a_78_candidate_draft_pack.json`, `drafts/v0-v3-rebuild/v2_a_79_candidate_draft_pack.json`, `drafts/v0-v3-rebuild/v2_a_80_candidate_draft_pack.json`  
**Status:** PASSED - production_candidate_ready

---

## 1. Lesson Summary

| Lesson | Title | Target Items | New Rows | Old-Item Pressure Refs | Final isolated warnings |
|---|---|---|---:|---|---:|
| `V2-A-78` | Business Event Scene Vocabulary | registration, banquet, booth, seminar | 24 | `v2_a_77_rv_024`, `v2_a_76_rv_021` | 32 total, 4 new |
| `V2-A-79` | Business Travel Scene Vocabulary | reservation, confirmation, departure, baggage | 24 | `v2_a_78_rv_021`, `v2_a_77_rv_023` | 36 total, 4 new |
| `V2-A-80` | Workplace Policy Scene Vocabulary | policy, guideline, compliance, requirement | 24 | `v2_a_79_rv_022`, `v2_a_78_rv_024` | 40 total, 4 new |

Each candidate keeps the fixed V2 core shape: 20 `scene_vocabulary` rows, 4 same-lesson `review_question` rows, and two reused prior review references inside `question_ids`.

Production impact: none. These files do not modify `data/vocab/curriculum.json`, `data/vocab/questions_v2a.json`, seed version, or service worker cache.

---

## 2. Isolated Audit Result

| Audit Root | Scope | Result |
|---|---|---|
| `tmp/v2-a-78-isolated-audit` | 192 questions / 9 lessons | passed, 0 blocking, 0 duplicate stems |
| `tmp/v2-a-79-isolated-audit` | 216 questions / 10 lessons | passed, 0 blocking, 0 duplicate stems |
| `tmp/v2-a-80-isolated-audit` | 240 questions / 11 lessons | passed, 0 blocking, 0 duplicate stems |
| `tmp/v2-wave4-isolated-audit` | full wave 4 candidate set, 240 questions / 11 lessons | passed, 0 blocking, 0 duplicate stems |

Final combined audit also reports:

- required field / format issues: 0
- definition leakage issues: 0
- article giveaways: 0
- answer distribution issues: 0
- lesson reference / count issues: 0
- target item coverage issues: 0
- old-item pressure issues: 0
- preferred stem length warnings: 0
- blank-position concentration warnings: 0
- staircase progression warnings: 40 total, 12 new from wave 4

---

## 3. Content Review

`V2-A-78` stays inside business-event logistics: registration records, banquet arrangements, trade-show booths, and seminar sessions.

`V2-A-79` stays inside business-travel operations: reservations, written confirmations, departure timing, and baggage handling. One short travel stem was expanded before the final audit so the lesson has 0 preferred stem length warnings.

`V2-A-80` stays inside workplace-policy language: formal policy, practical guideline, compliance checks, and specific requirements. The candidate avoids treating abstract terms as simple definitions by anchoring each blank in workplace action.

Answer balance is A=6, B=6, C=6, D=6 for each 24-row candidate pack.

---

## 4. Staircase Warnings

Each new candidate adds 4 staircase progression warnings. This is the same non-blocking audit pattern already documented for the current V2 same-type heuristic.

Decision: accept as candidate-status debt only. Do not rewrite live production seed from these warnings. Before promotion, the wave 4 release gate must still record warning triage, seed sync scope, seed-change record plan, UI/doc count updates, and the final production validation set.

---

## 5. C-13 Status

Wave 4 candidate authoring, isolated validation, duplicate audit, full quality audit, and combined human review are complete.

At candidate-review time, this did not promote `V2-A-78` through `V2-A-80` to production.

Postscript (2026-05-21): the formal wave 4 promotion gate later promoted these three lessons. See `docs/wave-retrospectives/2026-05-21-c13-v2-wave4-promotion-review.md` and `docs/seed-changes/2026-05-21-toeic_vocab_tracker_v2_a_78_80_wave_4_2026_05_21.md`.
