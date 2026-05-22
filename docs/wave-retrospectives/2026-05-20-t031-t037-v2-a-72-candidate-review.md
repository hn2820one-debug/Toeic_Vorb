# V2-A-72 Candidate Review — T031-T037

Date: 2026-05-20
Scope: `V2-A-72` / Meeting Scene Vocabulary
Artifact: `drafts/v0-v3-rebuild/v2_a_72_candidate_draft_pack.json`
Production impact: none

## Verdict

`V2-A-72` is accepted as a production candidate draft only. It is not promoted to live seed data.

This completes blueprint tasks `T031` through `T037` for the first lesson in V2 wave 2. Tasks `T038` through `T040` remain open because they require production seed sync, seed-change record, UI regression/release gate, and the second wave-2 lesson path.

## Shape

- New draft question rows: 24
- Same-lesson core rows: 20
- Same-lesson review rows: 4
- Final `question_ids`: 21
- Reused old-item pressure reference: `v2_a_71_rv_021`
- Final `review_question_ids`: 4
- Answer balance inside new rows: A/B/C/D = 6/6/6/6

The shape intentionally uses 24 new rows plus one reused prior same-stage review reference. This corrects the earlier T020-T030 planning assumption that every V2 lesson would always have exactly 20 final `question_ids`; the active spec allows 20-22 and the current audit requires old-item pressure for non-first V2 core lessons.

## Validation

- Draft structural validation: passed
- Draft duplicate stems: 0
- Isolated audit root: `tmp/v2-a-72-isolated-audit`
- Isolated full quality audit: passed
- Blocking issues: 0
- Duplicate stems in isolated audit: 0
- Old-item pressure issues: 0
- Explanation quality warnings: 0
- Preferred stem length warnings: 0
- Blank-position concentration warnings: 0
- Total staircase progression warnings in isolated audit: 8
- New `V2-A-72` staircase progression warnings: 4

## Human Review

Scene realism: passed. The lesson stays inside office meeting operations: agendas, minutes, attendees, room capacity, invitations, compliance records, and meeting logistics.

Distractor plausibility: passed. The four options stay in the same meeting scene, and the stems make only one option semantically valid. No row relies on article, grammar form, or part of speech to reveal the answer.

Old-item pressure: passed for candidate status. `v2_a_71_rv_021` is reused inside the lesson flow as prior V2 pressure without creating a duplicate question row.

Explanations: passed after revision. Each explanation now contains a semantic rule cue and one explicit trap contrast.

Staircase warning acceptance: accepted for candidate status only. The new rows include distinct `demand:*` tags and vary scene demands inside each item, but the current automated staircase heuristic ranks all `scene_vocabulary` rows the same. This warning must be revisited before full wave promotion if the audit is strengthened to inspect demand tags.

## Next Gate

Do not edit production seed data yet. Continue the wave by drafting `V2-A-73` and `V2-A-74` as `production_impact: none` candidates, then run the full wave release gate before any seed-version, seed-record, service-worker, or UI-regression promotion work.
