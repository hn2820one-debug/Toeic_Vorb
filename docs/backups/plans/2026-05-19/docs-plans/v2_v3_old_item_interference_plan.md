# V2/V3 Old-Item Interference Plan

Generated: 2026-05-17T16:56:34.727Z

Status: planning only. This document does not modify production seed data.

## Boundary

- Program B only: `C:\Users\Keith\Toeic\toeic-app-Vorb`
- Do not modify Program A: `C:\Users\Keith\toeic-app`
- Do not enable V4 or move `drafts/v4/` into `data/vocab/`.
- Do not edit production question JSON as part of this plan.

## Current Inspection Summary

| Metric | Count |
| --- | --- |
| V2 core lessons inspected | 50 |
| V2 mixed-review lessons excluded | 10 |
| V3 core lessons inspected | 60 |
| V3 mixed-review lessons excluded | 12 |
| Affected lessons | 6 |
| Implementable with same-stage prior review pressure | 4 |
| First-core-lesson policy exceptions | 2 |
| Proposed old-item rows | 6 |

## Sufficiency Rule Used

Core V2/V3 lesson is sufficient when session questions include at least 2 target_item_ids whose vocab_items.lesson_ids do not include the current lesson_id. Mixed-review lessons are excluded.

Mixed-review lessons are intentionally excluded because they are assembled from prior review questions and should not be converted into core lesson logic.

## Selection Rules

- Use same-stage prior lessons by default; do not use V4 items.
- Do not include mixed_review lessons as candidate sources or targets for core interference changes.
- Prefer existing prior review_question IDs as review pressure to avoid duplicate stems, answer distribution changes, and source question rewrites.
- Use direct distractor insertion only after manual ambiguity review.
- Treat first core lesson of a stage as a same-stage prior-item exception unless cross-stage policy is explicitly approved.

## Affected Lessons and Proposed Actions

| lesson_id | stage | type | targets | old pressure now | proposed old items | source lessons | interference type | expected next edit | risk notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| V2-A-71 | V2 | scene_vocabulary | workstation, extension, photocopier, stationery | 0 | None: first same-stage core lesson | None | audit/spec exception | scripts/audit-vocab-quality.js; docs/question-creation-spec.md | No earlier same-stage lesson exists. Do not force V0/V1 or future items into this lesson unless cross-stage interference policy is explicitly approved. Recommended fix is to update old-item audit logic/spec to exempt first core lesson of a stage from same-stage old-item pressure. |
| V2-A-72 | V2 | scene_vocabulary | agenda, minutes, attendee, venue | 0 | extension (v2_a_71_rv_022) | V2-A-71 | review_pressure | data/vocab/curriculum.json | Preferred implementation is to append existing prior review_question IDs to question_ids, preserving source question JSON and answer distribution. If instead converting old items into distractors, manually verify no second-correct answer, article giveaway, or definition leak is introduced. |
| V2-A-73 | V2 | scene_vocabulary | appointment, deadline, itinerary, availability | 0 | agenda (v2_a_72_rv_021); extension (v2_a_71_rv_022) | V2-A-72; V2-A-71 | review_pressure; semantic_contrast | data/vocab/curriculum.json | Preferred implementation is to append existing prior review_question IDs to question_ids, preserving source question JSON and answer distribution. If instead converting old items into distractors, manually verify no second-correct answer, article giveaway, or definition leak is introduced. |
| V3-A-121 | V3 | collocation | make arrangements, submit a report, meet a deadline, hold a meeting | 0 | None: first same-stage core lesson | None | audit/spec exception | scripts/audit-vocab-quality.js; docs/question-creation-spec.md | No earlier same-stage lesson exists. Do not force V0/V1 or future items into this lesson unless cross-stage interference policy is explicitly approved. Recommended fix is to update old-item audit logic/spec to exempt first core lesson of a stage from same-stage old-item pressure. |
| V3-A-122 | V3 | collocation | take notes, prepare an agenda, review a document, file a complaint | 0 | hold a meeting (v3_a_121_rv_024) | V3-A-121 | review_pressure | data/vocab/curriculum.json | Preferred implementation is to append existing prior review_question IDs to question_ids, preserving source question JSON and answer distribution. If instead converting old items into distractors, manually verify no second-correct answer, article giveaway, or definition leak is introduced. |
| V3-A-123 | V3 | collocation | issue a memo, schedule an appointment, update a record, make a request | 0 | file a complaint (v3_a_122_rv_024); hold a meeting (v3_a_121_rv_024) | V3-A-122; V3-A-121 | review_pressure; collocation_contrast | data/vocab/curriculum.json | Preferred implementation is to append existing prior review_question IDs to question_ids, preserving source question JSON and answer distribution. If instead converting old items into distractors, manually verify no second-correct answer, article giveaway, or definition leak is introduced. |

## Per-Lesson Rationale

### V2-A-71

- Current target items: workstation, extension, photocopier, stationery
- Earlier same-stage lessons available: 0
- Current old-item pressure count: 0
- Proposed action: do not force a cross-stage item in planning. Treat this as a first-core-lesson exception unless cross-stage review pressure is explicitly approved.
- Expected files to edit next prompt: scripts/audit-vocab-quality.js, docs/question-creation-spec.md
- Risk notes: No earlier same-stage lesson exists. Do not force V0/V1 or future items into this lesson unless cross-stage interference policy is explicitly approved. Recommended fix is to update old-item audit logic/spec to exempt first core lesson of a stage from same-stage old-item pressure.

### V2-A-72

- Current target items: agenda, minutes, attendee, venue
- Earlier same-stage lessons available: 1
- Current old-item pressure count: 0
- Proposed additions:
  - extension from V2-A-71 via v2_a_71_rv_022: review_pressure. Reuse extension from V2-A-71 as a direct old-item review row before the current scene set. This avoids redefining the current target words and tests whether the learner still recognizes an earlier TOEIC scene item.
- Expected files to edit next prompt: data/vocab/curriculum.json
- Risk notes: Preferred implementation is to append existing prior review_question IDs to question_ids, preserving source question JSON and answer distribution. If instead converting old items into distractors, manually verify no second-correct answer, article giveaway, or definition leak is introduced.

### V2-A-73

- Current target items: appointment, deadline, itinerary, availability
- Earlier same-stage lessons available: 2
- Current old-item pressure count: 0
- Proposed additions:
  - agenda from V2-A-72 via v2_a_72_rv_021: review_pressure. Reuse agenda from V2-A-72 as a direct old-item review row before the current scene set. This avoids redefining the current target words and tests whether the learner still recognizes an earlier TOEIC scene item.
  - extension from V2-A-71 via v2_a_71_rv_022: semantic_contrast. Use extension as semantic contrast against current targets (appointment, deadline, itinerary, availability). It is business-plausible but should only appear in a stem where the current correct answer remains unambiguous.
- Expected files to edit next prompt: data/vocab/curriculum.json
- Risk notes: Preferred implementation is to append existing prior review_question IDs to question_ids, preserving source question JSON and answer distribution. If instead converting old items into distractors, manually verify no second-correct answer, article giveaway, or definition leak is introduced.

### V3-A-121

- Current target items: make arrangements, submit a report, meet a deadline, hold a meeting
- Earlier same-stage lessons available: 0
- Current old-item pressure count: 0
- Proposed action: do not force a cross-stage item in planning. Treat this as a first-core-lesson exception unless cross-stage review pressure is explicitly approved.
- Expected files to edit next prompt: scripts/audit-vocab-quality.js, docs/question-creation-spec.md
- Risk notes: No earlier same-stage lesson exists. Do not force V0/V1 or future items into this lesson unless cross-stage interference policy is explicitly approved. Recommended fix is to update old-item audit logic/spec to exempt first core lesson of a stage from same-stage old-item pressure.

### V3-A-122

- Current target items: take notes, prepare an agenda, review a document, file a complaint
- Earlier same-stage lessons available: 1
- Current old-item pressure count: 0
- Proposed additions:
  - hold a meeting from V3-A-121 via v3_a_121_rv_024: review_pressure. Reuse hold a meeting from V3-A-121 as a prior collocation review row before the current collocation set.
- Expected files to edit next prompt: data/vocab/curriculum.json
- Risk notes: Preferred implementation is to append existing prior review_question IDs to question_ids, preserving source question JSON and answer distribution. If instead converting old items into distractors, manually verify no second-correct answer, article giveaway, or definition leak is introduced.

### V3-A-123

- Current target items: issue a memo, schedule an appointment, update a record, make a request
- Earlier same-stage lessons available: 2
- Current old-item pressure count: 0
- Proposed additions:
  - file a complaint from V3-A-122 via v3_a_122_rv_024: review_pressure. Reuse file a complaint from V3-A-122 as a prior collocation review row before the current collocation set.
  - hold a meeting from V3-A-121 via v3_a_121_rv_024: collocation_contrast. Use hold a meeting as a collocation contrast so the learner distinguishes the older verb-noun pairing from current targets (issue a memo, schedule an appointment, update a record, make a request).
- Expected files to edit next prompt: data/vocab/curriculum.json
- Risk notes: Preferred implementation is to append existing prior review_question IDs to question_ids, preserving source question JSON and answer distribution. If instead converting old items into distractors, manually verify no second-correct answer, article giveaway, or definition leak is introduced.

## Recommended Implementation Sequence For Next Prompt

1. Decide policy for first core lesson of V2/V3: audit exception is recommended; cross-stage old pressure is not recommended without explicit approval.
2. For V2-A-72, V2-A-73, V3-A-122, and V3-A-123, append the listed existing prior `review_question` IDs to `question_ids` in `data/vocab/curriculum.json`.
3. Do not edit `questions_v2*.json` or `questions_v3*.json` unless a selected old item lacks a usable review question; current plan avoids that.
4. If curriculum changes, bump seed version in `data/vocab/curriculum.json`, `js/vocab-db.js`, and `tests/helpers/seed-idb.ts`.
5. Run full validation: data validation, full audit, duplicate audit, scoring tests, and Playwright.

## Machine-Readable Companion

See `tmp/v2_v3_old_item_interference_plan.json` for the full machine-readable plan, including all inspected core lessons.

