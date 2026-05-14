# P0 Stabilization Result

Status: COMPLETED

Date: 2026-05-14

Scope: TOEIC Vocabulary Tracker Program B only.

## What Changed

- Added content quality validation v2: `scripts/audit-vocab-quality.js`.
- Generated quality warning report: `docs/V2_V3_QUALITY_AUDIT.md`.
- Added human review checklist: `docs/V2_V3_HUMAN_REVIEW_CHECKLIST.md`.
- Expanded Playwright V2/V3 smoke coverage to six representative lessons.
- Confirmed export package includes V2/V3 attempts in `attempts.csv` and `raw_events.jsonl`.
- Marked stale V1/status docs as historical where needed.

## Representative Runtime Smoke Lessons

The automated smoke test now starts each lesson, answers 6 questions, writes attempts, exports data, and verifies exported rows.

| Stage | Lesson | Evidence |
|---|---|---|
| V2-A | `V2-A-71` | Attempts written and found in export |
| V2-C | `V2-C-91` | Attempts written and found in export |
| V2-E | `V2-E-111` | Attempts written and found in export |
| V3-A | `V3-A-121` | Attempts written and found in export |
| V3-D | `V3-D-151` | Attempts written and found in export |
| V3-F | `V3-F-171` | Attempts written and found in export |

## Quality Audit Summary

Latest `node scripts\audit-vocab-quality.js` result:

| Warning type | Count |
|---|---:|
| repeated_templates | 45 |
| short_part6_context_questions | 480 |
| translation_heavy_v2_questions | 1200 |
| overused_v3_distractor_words | 3 |
| target_coverage_issues | 0 |
| missing_old_item_interference_lessons | 110 |
| speed_drill_non_time_pressure | 30 |

These are quality warnings, not structural data failures.

## Validation Result

Latest `node scripts\validate-vocab-data.js` result:

- total vocab lessons: 180
- total vocab questions: 4,608
- V0: 10 lessons / 240 questions
- V1: 60 lessons / 1,728 questions
- V2: 50 lessons / 1,200 questions
- V3: 60 lessons / 1,440 questions
- missing field count: 0
- duplicate question_id count: 0
- structural warning count: 0

## Test Result

Latest `npm test -- --reporter=list` result:

- `export-flow.spec.ts`: PASS
- `lesson-flow.spec.ts`: PASS
- `v2-v3-content.spec.ts`: PASS

Total: 3 passed.

## P0 Acceptance

| Acceptance item | Status |
|---|---|
| Structural validation passes | PASS |
| Quality warning report exists | PASS |
| At least 6 representative lessons have browser runtime evidence | PASS |
| Export includes V2/V3 attempts correctly | PASS |

## Remaining P0 Findings

- V2 is currently translation/clue heavy and should be rewritten toward TOEIC-style context.
- V3 Part 6 rows are too short and should become real mini-passages.
- V3 distractors overuse `do`, `take`, and `make`.
- V2/V3 lack old-item interference.

Recommended next sprint: P1 Review Mode or P2 V2/V3 content quality rewrite. If the goal is learning impact, prioritize P1 Review Mode first; if the goal is content trust, prioritize P2 rewrite first.
