# V2/V3 Quality Audit

Status: GENERATED CONTENT QUALITY REVIEW

Generated at: 2026-05-16T17:14:58.325Z

Historical-count warning: this generated report predates the current V0 consolidation and mixed-review seed. Its counts are obsolete; use root `TO_AI.md` for current production counts and priorities.

This report is a learning-quality audit. It does not replace `scripts/validate-vocab-data.js`, which remains the structural pass/fail validator.

## Summary

| Metric | Count |
| --- | --- |
| Total lessons | 202 |
| Total questions | 4608 |
| Repeated V2/V3 stem templates above threshold | 0 |
| Short Part 6 context questions | 0 |
| Translation-heavy V2 questions | 0 |
| Overused V3 distractor words | 0 |
| Target coverage issues | 0 |
| Lessons missing old-item interference | 6 |
| Speed drills not using TIME_PRESSURE | 0 |

## Question Type Summary

| Stage | Questions | Types |
| --- | --- | --- |
| V0 | 240 | review_question:40, collocation:30, formal_phrase:30, meaning_choice:30, scene_vocabulary:30, false_friend:20, part5_sentence_completion:20, part6_context_choice:20, speed_drill:20 |
| V1 | 1728 | speed_drill:750, word_family:572, review_question:188, part5_sentence_completion:158, collocation:30, meaning_choice:30 |
| V2 | 1200 | scene_vocabulary:800, meaning_choice:200, review_question:200 |
| V3 | 1440 | part6_context_choice:720, collocation:240, part5_sentence_completion:240, review_question:240 |

## High-Signal Findings

1. V2 scene-vocabulary prompts no longer rely on direct Chinese clue recognition inside question_text.
2. V3 part6_context_choice rows now satisfy the audit's mini-passage length and sentence-count thresholds.
3. V3 distractor verbs are now distributed below the audit's overuse threshold.
4. No repeated V2/V3 stem template remains above the current warning threshold.
5. V2/V3 lessons still lack old-item interference; each lesson mostly drills its own four target items.

## Repeated Template Hotspots

No repeated template hotspot remains above the current threshold.

## Overused V3 Distractor Words

No overused V3 distractor word exceeds the current threshold.

## Short Part 6 Context Samples

No short Part 6 context question is currently flagged.

## Translation-Heavy V2 Samples

No translation-heavy V2 question is currently flagged.

## Lessons Missing Old-Item Interference

| Stage | Lesson count | Sample lessons |
| --- | --- | --- |
| V2 | 3 | V2-A-71, V2-A-72, V2-A-73 |
| V3 | 3 | V3-A-121, V3-A-122, V3-A-123 |

## Speed Drill Error-Code Findings

| Count | Sample |
| --- | --- |
| 0 |  |

## Recommended Fix Order

1. Add old-item interference questions every lesson or every block.
2. Keep structural validation separate from this quality audit.

## Machine Summary

```json
{
  "generated_at": "2026-05-16T17:14:58.325Z",
  "total_lessons": 202,
  "total_questions": 4608,
  "warnings": {
    "repeated_templates": 0,
    "short_part6_context_questions": 0,
    "translation_heavy_v2_questions": 0,
    "overused_v3_distractor_words": 0,
    "target_coverage_issues": 0,
    "missing_old_item_interference_lessons": 6,
    "speed_drill_non_time_pressure": 0
  }
}
```
