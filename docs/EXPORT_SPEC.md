# Export Spec

Status: CURRENT REVIEW DOCUMENT

This document defines the desired export format for ChatGPT analysis and notes the current implementation status.

## Export Package

Target folder name:

```text
toeic_vocab_export_YYYY-MM-DD/
```

Target files:

```text
summary.md
sessions.csv
attempts.csv
item_mastery.csv
error_summary.csv
review_effectiveness.csv
stage_progress.json
question_bank_snapshot.json
raw_events.jsonl
```

Current status:

- IMPLEMENTED/PARTIAL: `tracker.html` generates all listed files.
- PARTIAL: If browser folder access is unavailable, files download individually.
- PARTIAL: No zip archive is generated.

## summary.md

Status: IMPLEMENTED/PARTIAL

Current structure:

```markdown
# TOEIC Vocabulary Progress Export

User:
Export Date:
Current Stage:
Current Lesson:

## Overall Progress
- Completed Lessons:
- Total Lessons:
- Total Attempts:
- Overall Accuracy:
- Average Response Time:
- Repeated Error Rate:

## Module Accuracy
- question_type:

## Top Error Codes
1.

## Top Weak Items
1.

## Review Effectiveness
- review attempts:
- review fix rate:
- review average response time:

## Stage Status
- V0:
- V1:
- V2:
- V3:
- V4:
- V5:
- V6:

## Request
Please analyze my TOEIC vocabulary progress and recommend the next lessons.
```

Notes:

- IMPLEMENTED: Generated from current IndexedDB records.
- PARTIAL: Quality depends on actual completed sessions and confirmed errors.

## attempts.csv

Status: IMPLEMENTED

Columns:

```text
attempt_id
timestamp
user_id
course_id
stage
lesson_id
session_id
step
question_id
question_type
target_item_id
grammar_link_id
correct_answer
user_answer
is_correct
response_time_seconds
speed_bucket
error_code
default_error_code
is_repeated_error
review_priority
mode
review_filter
review_ids
```

Notes:

- Review Mode attempts use `mode=review_queue`.
- Normal lesson attempts use `mode=blind_drill`.

## sessions.csv

Status: IMPLEMENTED

Columns:

```text
session_id
date
stage
lesson_id
lesson_title
planned_minutes
actual_minutes
total_questions
correct_questions
wrong_questions
accuracy
avg_response_time_seconds
top_error_codes
mastery_status
next_action
mode
review_filter
```

Notes:

- `top_error_codes` is pipe-delimited in CSV.
- `actual_minutes` is measured runtime, not a strict 45-minute lesson enforcement.

## item_mastery.csv

Status: IMPLEMENTED

Columns:

```text
item_id
item_type
base_word
variants
first_seen
last_seen
seen_count
correct_count
wrong_count
avg_response_time_seconds
last_error_code
mastery_score
mastery_level
next_review_date
```

Notes:

- `variants` is pipe-delimited in CSV.
- `mastery_score` is calculated from accuracy, speed, stability, and recency.

## error_summary.csv

Status: IMPLEMENTED/PARTIAL

Columns:

```text
error_code
count
repeated_count
```

Notes:

- Current summary is count-based.
- Future versions should include item count, lesson count, latest occurrence date, and fix rate.

## review_effectiveness.csv

Status: IMPLEMENTED

Columns:

```text
group_type
group_key
attempts
correct
wrong
fix_rate
avg_response_time_seconds
fast_correct
latest_timestamp
```

Group types:

```text
target_item
error_code
question_type
```

Notes:

- Rows are generated from attempts where `mode=review_queue`.
- `fix_rate` is the review-session correctness rate for the group.
- This file is intended to answer whether review queue work is actually fixing weak items.

## stage_progress.json

Status: IMPLEMENTED/PARTIAL

Current object array shape:

```json
[
  {
    "stage": "V1",
    "stage_name": "Word Family",
    "lessons_available": 10,
    "lessons_completed": 1,
    "stage_progress": 0.1,
    "stage_accuracy": 0.83,
    "stage_avg_response_time": 6.4,
    "stage_mastered_items": 0,
    "stage_unstable_items": 22,
    "stage_repeated_errors": 0,
    "stage_seal_status": "open",
    "question_types_seen": ["word_family", "review_question"]
  }
]
```

Notes:

- IMPLEMENTED: Generated from current stages, lessons, and attempts.
- PARTIAL: Item counts are global in the current implementation, not filtered by exact stage ownership.

## question_bank_snapshot.json

Status: IMPLEMENTED

Current shape:

```json
{
  "exported_at": "2026-05-14T02:00:00+08:00",
  "question_count": 480,
  "questions": []
}
```

## raw_events.jsonl

Status: IMPLEMENTED/PARTIAL

Each line is one JSON object with `event_type`.

Current event types:

```text
session
attempt
error_log
review_queue
```

Example:

```json
{"event_type":"attempt","attempt_id":"...","lesson_id":"V1-A-14","question_id":"...","is_correct":false}
```

Notes:

- This is not a low-level clickstream. It is a raw joined export of current records.
- Program A `toeic_learning_db` events are not included in the Program B vocabulary export package.

## Complete JSON Bundle

Status: IMPLEMENTED/PARTIAL

Current extra file:

```text
toeic_vocab_export_YYYY-MM-DD.json
```

Purpose:

- Convenience bundle containing file names and raw data arrays.

Notes:

- This is not part of the original target package but is useful when folder download is not available.
