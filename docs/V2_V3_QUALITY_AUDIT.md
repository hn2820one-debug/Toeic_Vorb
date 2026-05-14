# V2/V3 Quality Audit

Status: GENERATED CONTENT QUALITY REVIEW

Generated at: 2026-05-14T04:32:00.263Z

This report is a learning-quality audit. It does not replace `scripts/validate-vocab-data.js`, which remains the structural pass/fail validator.

## Summary

| Metric | Count |
| --- | --- |
| Total lessons | 180 |
| Total questions | 4608 |
| Repeated V2/V3 stem templates above threshold | 0 |
| Short Part 6 context questions | 0 |
| Translation-heavy V2 questions | 0 |
| Overused V3 distractor words | 0 |
| Target coverage issues | 0 |
| Lessons missing old-item interference | 110 |
| Speed drills not using TIME_PRESSURE | 30 |

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
6. V1 still has speed drills using non-TIME_PRESSURE error codes; this is separate from the V2/V3 content batch.

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
| V2 | 50 | V2-A-71, V2-A-72, V2-A-73, V2-A-74, V2-A-75, V2-A-76, V2-A-77, V2-A-78, V2-A-79, V2-A-80 |
| V3 | 60 | V3-A-121, V3-A-122, V3-A-123, V3-A-124, V3-A-125, V3-A-126, V3-A-127, V3-A-128, V3-A-129, V3-A-130 |

## Speed Drill Error-Code Findings

| Count | Sample |
| --- | --- |
| 30 | v1_a_11_q_004:WORD_FAMILY_POS, v1_a_11_q_011:WORD_FAMILY_POS, v1_a_11_q_018:WORD_FAMILY_POS, v1_a_12_q_004:WORD_FAMILY_POS, v1_a_12_q_011:WORD_FAMILY_POS, v1_a_12_q_018:WORD_FAMILY_POS, v1_a_13_q_004:WORD_FAMILY_POS, v1_a_13_q_011:WORD_FAMILY_POS, v1_a_13_q_018:WORD_FAMILY_POS, v1_a_14_q_004:WORD_FAMILY_POS, v1_a_14_q_011:WORD_FAMILY_POS, v1_a_14_q_018:WORD_FAMILY_POS |

## Recommended Fix Order

1. Add old-item interference questions every lesson or every block.
2. Fix V1 speed drills so they consistently use TIME_PRESSURE.
3. Keep structural validation separate from this quality audit.

## Machine Summary

```json
{
  "generated_at": "2026-05-14T04:32:00.263Z",
  "total_lessons": 180,
  "total_questions": 4608,
  "warnings": {
    "repeated_templates": 0,
    "short_part6_context_questions": 0,
    "translation_heavy_v2_questions": 0,
    "overused_v3_distractor_words": 0,
    "target_coverage_issues": 0,
    "missing_old_item_interference_lessons": 110,
    "speed_drill_non_time_pressure": 30
  }
}
```

