# V2 Production Promotion Pipeline

Status: Active planning artifact after wave 4 production promotion
Last updated: 2026-05-21
Scope: Program B V2 production expansion through `V2-A-80`
Mapped blueprint tasks: `T021` through `T030`
Production impact: wave 4 is now live in production

This file records the V2 production-wave plan through wave 4. It does not change `data/vocab/`, seed version, service worker cache, or production question rows by itself.

---

## 1. Verified Inputs

Current production baseline:

- `V2-A-71` through `V2-A-80` are live in `data/vocab/questions_v2a.json`.
- `V2-MR-01` is live as a curriculum-only mixed-review lesson.
- The current production seed has 11 lesson rows and 240 question rows.
- The current `V2-A-71` review rows are `v2_a_71_rv_021` through `v2_a_71_rv_024`.
- The current extension review row is `v2_a_71_rv_021`.

Planning sources:

- `docs/CURRICULUM_MAP.md` lists `V2-A-72` through `V2-A-80`.
- `data/vocab/vocab_items.json` already contains four target item rows for each `V2-A-72` through `V2-A-80`.
- `drafts/v0-v3-rebuild/stage_map_v0_v3.json` preserves the V2-A sequence.
- `drafts/v0-v3-rebuild/mixed_review_architecture.json` groups `V2-A-71` through `V2-A-75` as the first mixed-review checkpoint set.
- `docs/production-baseline-smoke-checklist.md` is the pre-promotion smoke checklist.

Archived plans may be used as historical hints only. Current seed IDs and current source files override archived ID references.

---

## 2. Next Lesson Candidates (`T021`, `T028`)

Promotion difficulty:

- `A`: can be drafted first because items exist, scene boundary is narrow, and likely distractors are controllable.
- `B`: suitable after one more review pass because second-correct risk or scene breadth is higher.
- `C`: keep as backlog until earlier V2 waves prove the authoring checklist and mixed-review rhythm.

| Priority | Lesson | Title | Target items | Difficulty | Decision |
|---:|---|---|---|---|---|
| 1 | `V2-A-72` | Meeting Scene Vocabulary | `agenda`, `minutes`, `attendee`, `venue` | A | First wave 2 draft. It naturally follows office equipment and can use `V2-A-71` office terms as old-item pressure. |
| 2 | `V2-A-73` | Scheduling Scene Vocabulary | `appointment`, `deadline`, `itinerary`, `availability` | A | Second wave 2 draft. It can reuse meeting terms as context and contrast once `V2-A-72` is drafted. |
| 3 | `V2-A-74` | Office Document Scene Vocabulary | `memo`, `invoice`, `attachment`, `directory` | B | Third wave 2 draft. It is still office-administration adjacent but needs careful document-purpose control. |
| 4 | `V2-A-75` | Office Communication Scene Vocabulary | `correspondence`, `notification`, `inquiry`, `recipient` | B | First wave 3 candidate and the fifth V2 core lesson needed for `V2-MR-01`. |
| 5 | `V2-A-76` | Office Facility Scene Vocabulary | `lobby`, `elevator`, `cafeteria`, `parking` | B | Wave 3 candidate; scene is clear but must avoid place-name-only recognition. |
| 6 | `V2-A-77` | Office Procedure Scene Vocabulary | `authorization`, `request form`, `approval`, `submission` | B | Wave 3 candidate; needs stronger semantic separation between approval and authorization. |
| 7 | `V2-A-78` | Business Event Scene Vocabulary | `registration`, `banquet`, `booth`, `seminar` | C | Promoted in wave 4; event-scene distractor checks passed in isolated and production audit. |
| 8 | `V2-A-79` | Business Travel Scene Vocabulary | `reservation`, `confirmation`, `departure`, `baggage` | C | Promoted in wave 4; travel-scene stem length and second-correct risks were triaged before final audit. |
| 9 | `V2-A-80` | Workplace Policy Scene Vocabulary | `policy`, `guideline`, `compliance`, `requirement` | C | Promoted in wave 4; abstract policy terms are anchored in workplace action contexts. |

---

## 3. Wave Targets (`T022`, `T030`)

| Wave | Lessons | New lesson rows | New question rows | File target if promoted | Seed strategy |
|---|---|---:|---:|---|---|
| Wave 1 | `V2-A-71` | 1 | 24 | `data/vocab/questions_v2a.json` | Done: `toeic_vocab_tracker_v2_a_71_first_wave_2026_05_20` |
| Wave 2 | `V2-A-72` through `V2-A-74` | 3 | 72 | `data/vocab/questions_v2a.json` | Done: `toeic_vocab_tracker_v2_a_72_74_wave_2_2026_05_20` |
| Wave 3 | `V2-A-75` through `V2-A-77` | 3 | 72 | `data/vocab/questions_v2a.json` | Done: `toeic_vocab_tracker_v2_a_75_77_wave_3_2026_05_20` |
| Mixed Review 1 | `V2-MR-01` | 1 | 0 | `data/vocab/curriculum.json` only | Done: `toeic_vocab_tracker_v2_mr_01_mixed_review_2026_05_21` |
| Wave 4 | `V2-A-78` through `V2-A-80` | 3 | 72 | `data/vocab/questions_v2a.json` | Done: `toeic_vocab_tracker_v2_a_78_80_wave_4_2026_05_21` |

Historical wave 2 draft artifacts remain available for reference:

- `drafts/v0-v3-rebuild/v2_a_72_candidate_draft_pack.json`
- `drafts/v0-v3-rebuild/v2_a_73_candidate_draft_pack.json`
- `drafts/v0-v3-rebuild/v2_a_74_candidate_draft_pack.json`

Historical wave 3 draft artifacts remain available for reference:

- `drafts/v0-v3-rebuild/v2_a_75_candidate_draft_pack.json`
- `drafts/v0-v3-rebuild/v2_a_76_candidate_draft_pack.json`
- `drafts/v0-v3-rebuild/v2_a_77_candidate_draft_pack.json`

Wave 4 candidate artifacts remain available for reference; the lessons are now live in production:

- `drafts/v0-v3-rebuild/v2_a_78_candidate_draft_pack.json`
- `drafts/v0-v3-rebuild/v2_a_79_candidate_draft_pack.json`
- `drafts/v0-v3-rebuild/v2_a_80_candidate_draft_pack.json`
- `docs/wave-retrospectives/2026-05-21-c13-v2-wave4-candidate-review.md`

Promotion rule for future waves: do not promote a single lesson opportunistically if the three-lesson wave has not passed isolated validation, human review, warning triage, docs sync planning, and the release gate.

---

## 4. Fixed Core-Lesson Shape (`T023`, `T026`)

Each V2 core lesson should keep the minimum usable pack rhythm:

- 4 target items per lesson.
- 20 new `scene_vocabulary` core rows.
- 4 new `review_question` rows.
- 24 new question-bank rows per core lesson.
- `question_ids`: 20 current-lesson core row IDs plus 0-2 reused prior same-stage review IDs when the active old-item-pressure audit requires them.
- `review_question_ids`: 4 current-lesson review row IDs.

T020-T030 verification correction (2026-05-20): the active authoring spec and `scripts/audit-quality-full.js` expect V2/V3 non-first core lessons to carry old-item pressure inside final `question_ids` while keeping 24 new rows per lesson. For `V2-A-72`, the candidate shape is therefore 24 new rows plus the existing prior reference `v2_a_71_rv_021`, giving 21 final `question_ids` and 4 current `review_question_ids`. This does not add a new question-bank row.

Default per-item coverage:

| Slot | Demand | Purpose |
|---|---|---|
| Core 1 | basic scene fit | Learner recognizes the word in a natural TOEIC workplace sentence. |
| Core 2 | operational role | Learner identifies what the item does in a meeting, schedule, document, or procedure. |
| Core 3 | same-scene contrast | Learner separates the item from plausible same-scene distractors. |
| Core 4 | document or message context | Learner uses surrounding communication purpose, not just one keyword. |
| Core 5 | delayed transfer | Learner sees the item after other targets and old-item distractors have appeared. |
| Review | quick recall plus light transfer | Learner recalls the item without repeating the exact core demand. |

This keeps the visible row count stable while fixing the main `V2-A-71` weakness: five appearances of the same item must not all feel like the same demand.

---

## 5. Staircase Rule (`T024`)

Every repeated target item must show a visible demand shift inside the same lesson.

Minimum rule:

- at least 3 distinct demand slots across the 5 core rows for each item;
- no target item may use five near-paraphrases of the same scene sentence;
- at least one row per item must require contrast against a plausible same-scene distractor;
- at least one row per item must require document, message, schedule, meeting, or procedure context;
- review rows must not be direct copies of the easiest core row.

Authoring warning sign:

- If changing the correct answer to another option still leaves the sentence plausible, the row has a second-correct risk and must be rewritten.
- If the blank can be solved mainly by article, grammar form, or part of speech, the row is not a valid V2 scene-vocabulary row.

---

## 6. Old-Item Pressure Strategy (`T025`)

Old-item pressure should reduce lesson-scope guessing without changing the 24-new-row core lesson inventory.

Default strategy for wave 2:

- Keep 20 current core rows and 4 current review rows per lesson.
- Use prior V2 terms as plausible distractors, context words, or contrast points inside current core rows.
- Reuse 0-2 prior same-stage `review_question` IDs in `question_ids` when needed to pass the active old-item-pressure audit; these are references, not new rows.
- Mixed-review lessons are the main place where old items become correct answers again.

Planned old-item pressure:

| Lesson | Prior pressure | Implementation note |
|---|---|---|
| `V2-A-72` | `extension`, `photocopier`, `stationery`, `workstation` from `V2-A-71` | Reuse `v2_a_71_rv_021` in `question_ids` as the first old-item pressure reference; keep all 24 new rows focused on `agenda`, `minutes`, `attendee`, and `venue`. |
| `V2-A-73` | `agenda`, `minutes`, `attendee`, `venue` plus selected `V2-A-71` office terms | Use meeting terms as context around scheduling rows; verify future `V2-A-72` review IDs before any reuse. |
| `V2-A-74` | `agenda`, `minutes`, `deadline`, `appointment`, and selected office-equipment terms | Use prior meeting/scheduling terms to prevent document rows from becoming isolated definition checks. |
| `V2-A-75` | document and scheduling terms | Prepare the fifth core lesson for `V2-MR-01`. |
| `V2-A-76` | communication and document terms | Reuse `v2_a_75_rv_022` and `v2_a_74_rv_024` in `question_ids`; keep all 24 new rows focused on facility flow rather than pure place-name recall. |
| `V2-A-77` | facility and communication terms | Reuse `v2_a_76_rv_024` and `v2_a_75_rv_022` in `question_ids`; keep procedure rows distinct across permission, form, sign-off, and hand-in contexts. |
| `V2-A-78` | procedure and facility terms | Live lesson reuses `v2_a_77_rv_024` and `v2_a_76_rv_021`; event rows stay focused on registration, banquet, booth, and seminar contexts. |
| `V2-A-79` | event and procedure terms | Live lesson reuses `v2_a_78_rv_021` and `v2_a_77_rv_023`; travel rows separate reservation, confirmation, departure, and baggage. |
| `V2-A-80` | travel and event terms | Live lesson reuses `v2_a_79_rv_022` and `v2_a_78_rv_024`; policy rows anchor abstract terms in workplace action. |

---

## 7. Authoring Checklist (`T027`)

A V2 candidate lesson is not production-ready until all checks are true:

| Area | Requirement |
|---|---|
| IDs | Stable `question_id`, `lesson_id`, `target_item_id`, and future seed references match current source files. |
| Type | Core rows use `scene_vocabulary`; review rows use `review_question`. |
| Stem | Natural TOEIC workplace context, blank present for V2 core rows, no direct definition embedded in the stem. |
| Options | Four same-scene options, exactly one correct answer, no article or grammar giveaway. |
| Explanation | `explanation_zh` explains the semantic reason and names a plausible confusion to avoid. |
| Error code | Core rows use `SCENE_VOCAB_GAP`; review rows use `VOCAB_WEAK_RECALL`. |
| Timing | Core rows use the V2 15-second expectation; review rows stay at 15 seconds unless a future spec changes it. |
| Tags | Include stage, scene, production wave or draft wave, and `item:{base_word}` tags. |
| Staircase | Each target item passes the demand-shift rule in section 5. |
| Old-item pressure | Prior V2 items appear intentionally and cannot become second correct answers. |
| Answer balance | Lesson-level answer slots should remain close to balanced; wave-level balance must also be checked before promotion. |
| Validation | Isolated structural validation, quality audit, duplicate audit, human review, release-gate planning, and seed sync plan are complete. |

---

## 8. Mixed Review Checkpoint (`T029`)

V2 should add one mixed-review checkpoint after every 5 core lessons.

First checkpoint:

- ID: `V2-MR-01`
- Coverage: `V2-A-71` through `V2-A-75`
- Question references: 20 review question IDs total
- Composition: 4 review IDs from each of the 5 core lessons
- New question-bank rows: 0
- Seed impact: done as `toeic_vocab_tracker_v2_mr_01_mixed_review_2026_05_21`; curriculum lesson row added, 0 question-bank rows added

Do not author new question rows for `V2-MR-01` unless a future spec explicitly changes mixed-review policy. It should reuse existing review rows and prove that review references remain valid outside their original lesson.

---

## 9. Next Execution Step

Current execution status (2026-05-21): wave 3, `V2-MR-01`, and wave 4 promotion are complete. `V2-A-75` through `V2-A-80` and `V2-MR-01` are live in production after passing isolated validation, full quality audit, duplicate/reference checks, human review, seed sync, and release documentation. Production now has 11 runnable lessons and 240 question-bank rows. The final production audit passes with 0 blocking issues, 0 duplicate stems, 0 old-item pressure issues, 0 preferred stem length warnings, and 40 staircase warnings total.

Next execution step: collect real V2 learner/export evidence for T049; if evidence is still unavailable, document `insufficient_data` and move the expansion path to C-11 V3 production candidate preparation.
