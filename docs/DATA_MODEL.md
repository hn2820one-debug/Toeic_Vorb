# Data Model

Status: CURRENT REVIEW DOCUMENT

This document describes the data structures currently present in the codebase. It does not describe an ideal future schema unless marked PLANNED.

## Vocabulary Lesson

Status: IMPLEMENTED/PARTIAL

Source:

- Seed: `data/vocab/curriculum.json`
- Store: IndexedDB `toeic_vocab_tracker_db.lessons`

Current shape:

```json
{
  "lesson_id": "V1-A-14",
  "stage": "V1",
  "stage_name": "Word Family",
  "lesson_number": 14,
  "title": "available word family",
  "estimated_minutes": 45,
  "lesson_type": "word_family",
  "target_items": ["availability", "available", "unavailable", "availably"],
  "question_ids": ["..."],
  "review_question_ids": ["..."],
  "mastery_threshold": 0.8,
  "seal_threshold": 0.85,
  "grammar_link_id": "ADJ_AFTER_BE",
  "status": "not_started"
}
```

Notes:

- IMPLEMENTED: `status` is updated by runtime.
- PARTIAL: Unlock logic is minimal; manual override exists through Roadmap status dropdown.
- IMPLEMENTED: V0, full V1 Word Family, V2 TOEIC Scene Vocabulary, and V3 Collocation are present.
- PLANNED: V4-V6 remain planned.
- NO SCHEMA CHANGE: V2 and V3 reuse the existing lesson schema.

## Vocabulary Question

Status: IMPLEMENTED

Source:

- `data/vocab/questions_v0.json`
- `data/vocab/questions_v1a.json`
- `data/vocab/questions_v1b.json`
- `data/vocab/questions_v1c.json`
- `data/vocab/questions_v1d.json`
- `data/vocab/questions_v1e.json`
- `data/vocab/questions_v1f.json`
- `data/vocab/questions_v2a.json`
- `data/vocab/questions_v2b.json`
- `data/vocab/questions_v2c.json`
- `data/vocab/questions_v2d.json`
- `data/vocab/questions_v2e.json`
- `data/vocab/questions_v3a.json`
- `data/vocab/questions_v3b.json`
- `data/vocab/questions_v3c.json`
- `data/vocab/questions_v3d.json`
- `data/vocab/questions_v3e.json`
- `data/vocab/questions_v3f.json`
- IndexedDB `questions`

Current shape:

```json
{
  "question_id": "v1_a_14_q_001",
  "lesson_id": "V1-A-14",
  "stage": "V1",
  "type": "word_family",
  "skill": "word_family",
  "subskill": "adjective_after_linking_verb",
  "grammar_link_id": "ADJ_AFTER_BE",
  "question_text": "The report seems ______ after the final review.",
  "options": {
    "A": "availability",
    "B": "available",
    "C": "unavailable",
    "D": "availably"
  },
  "correct_answer": "B",
  "explanation_zh": "seems 後面描述主詞狀態，要用形容詞。",
  "target_item_id": "item_available_family",
  "distractor_type": "same_word_family",
  "difficulty": 2,
  "estimated_time_seconds": 20,
  "default_error_code": "WORD_FAMILY_POS",
  "tags": ["toeic_part5", "word_family", "adj_after_be"]
}
```

Notes:

- IMPLEMENTED: Options are an object keyed by `A/B/C/D`.
- IMPLEMENTED: `grammar_link_id` exists as optional metadata.
- IMPLEMENTED: `curriculum.json` now includes `question_files` so the loader can import all vocabulary question files without hardcoding only V0/V1-A.
- NO SCHEMA CHANGE: V2 scene vocabulary and V3 collocation questions reuse the existing question schema.
- PARTIAL: Imported questions are validated but not deeply checked for TOEIC quality.

## Vocabulary Attempt

Status: IMPLEMENTED

Store:

- IndexedDB `attempts`

Current shape:

```json
{
  "attempt_id": "20260514_V1_A_14_Q001_1760000000000",
  "timestamp": "2026-05-14T02:00:00+08:00",
  "user_id": "Keith",
  "course_id": "toeic_vocab_v1",
  "stage": "V1",
  "lesson_id": "V1-A-14",
  "step": "toeic_practice",
  "session_id": "ses_...",
  "question_id": "v1_a_14_q_001",
  "question_type": "word_family",
  "correct_answer": "B",
  "user_answer": "C",
  "is_correct": false,
  "response_time_seconds": 14.2,
  "speed_bucket": "fast_wrong",
  "error_code": "WORD_FAMILY_POS",
  "default_error_code": "WORD_FAMILY_POS",
  "is_repeated_error": true,
  "review_priority": 5,
  "mode": "blind_drill",
  "review_filter": null,
  "review_ids": [],
  "target_item_id": "item_available_family",
  "grammar_link_id": "ADJ_AFTER_BE"
}
```

Notes:

- IMPLEMENTED: Saved immediately on answer.
- IMPLEMENTED: Review Mode attempts are saved with `mode: "review_queue"`, `step: "review_queue"`, `review_filter`, and `review_ids`.
- PARTIAL: `error_code` starts as default and can be confirmed/changed after lesson.
- PARTIAL: `mastery_status` is not stored directly on every attempt.

## Vocabulary Session

Status: IMPLEMENTED

Store:

- IndexedDB `sessions`

Current shape:

```json
{
  "session_id": "ses_...",
  "date": "2026-05-14",
  "user_id": "Keith",
  "course_id": "toeic_vocab_v1",
  "stage": "V1",
  "lesson_id": "V1-A-14",
  "lesson_title": "available word family",
  "planned_minutes": 45,
  "actual_minutes": 3.5,
  "started_at": "2026-05-14T02:00:00+08:00",
  "ended_at": "2026-05-14T02:03:30+08:00",
  "total_questions": 24,
  "correct_questions": 20,
  "wrong_questions": 4,
  "accuracy": 0.8333333333,
  "avg_response_time_seconds": 6.4,
  "fast_correct_count": 18,
  "slow_correct_count": 2,
  "top_error_codes": ["WORD_FAMILY_POS"],
  "mastery_status": "passed",
  "next_action": "unlock_next_lesson",
  "mode": "",
  "review_filter": ""
}
```

Notes:

- IMPLEMENTED: Created at lesson finish.
- IMPLEMENTED: Review Mode creates session rows with `stage: "REVIEW"`, `lesson_id: "REVIEW_QUEUE"`, `mode: "review_queue"`, and `review_filter`.
- PARTIAL: Actual runtime can be much shorter than 45 minutes in testing; the app does not enforce a 45-minute wall-clock lesson.

## Vocab Item

Status: IMPLEMENTED/PARTIAL

Source/store:

- Seed: `data/vocab/vocab_items.json`
- Store: IndexedDB `vocab_items`

Current shape:

```json
{
  "item_id": "item_available_family",
  "item_type": "word_family",
  "base_word": "available",
  "variants": ["availability", "available", "unavailable", "availably"],
  "first_seen": "2026-05-14",
  "last_seen": "2026-05-14",
  "seen_count": 8,
  "correct_count": 5,
  "wrong_count": 3,
  "avg_response_time_seconds": 17.8,
  "last_error_code": "WORD_FAMILY_POS",
  "last_question_type": "word_family",
  "consecutive_fast_correct": 2,
  "stable_review_sessions": 0,
  "next_review_date": "2026-05-16",
  "mastery_score": 62,
  "mastery_level": "unstable"
}
```

Notes:

- IMPLEMENTED/PARTIAL: Mastery score formula exists in `js/vocab-scoring.js`.
- IMPLEMENTED: V1 word-family, V2 scene vocabulary, and V3 collocation seed items include `stage`, `lesson_id`, `lesson_ids`, `chinese`, `example`, `common_wrong_forms`, `toeic_contexts`, and `review_priority`.
- PARTIAL: Long-term stable/mastered promotion has not been validated with real repeated review sessions.

## Review Queue

Status: IMPLEMENTED/PARTIAL

Store:

- IndexedDB `review_queue`

Current shape:

```json
{
  "review_id": "review_item_available_family_2026-05-16",
  "item_id": "item_available_family",
  "question_ids": ["v1_a_14_q_001"],
  "reason": "repeated_error",
  "priority": 5,
  "due_date": "2026-05-16",
  "status": "pending",
  "review_status": "still_weak",
  "last_review_session_id": "rev_...",
  "last_reviewed_at": "2026-05-14T02:10:00+08:00",
  "review_attempt_count": 3,
  "review_correct_count": 2,
  "review_wrong_count": 1,
  "last_review_accuracy": 0.67,
  "created_at": "2026-05-14T02:00:00+08:00",
  "updated_at": "2026-05-14T02:05:00+08:00"
}
```

Notes:

- IMPLEMENTED: Queue entries are created from wrong attempts and weak sessions.
- IMPLEMENTED/PARTIAL: Dedicated Review Mode can run queue items and mark outcomes as `fixed`, `still_weak`, or `repeated_error`.
- PARTIAL: Long-term spaced-repetition scheduling is still simple.

## Error Code

Status: IMPLEMENTED

Source:

- `js/vocab-scoring.js`

Current values:

```text
VOCAB_UNKNOWN
VOCAB_WEAK_RECALL
WORD_FAMILY_POS
COLLOCATION_PREP
PHRASE_MEANING
FORMAL_PHRASE
FALSE_FRIEND
SCENE_VOCAB_GAP
TIME_PRESSURE
CARELESS
REPEATED_ERROR
```

Notes:

- IMPLEMENTED: Error codes can be selected during post-lesson error review.
- PARTIAL: Error-code analytics are basic counts.

## Export Data

Status: IMPLEMENTED/PARTIAL

Generated by:

- `js/vocab-tracker.js`

Current output files:

```text
summary.md
sessions.csv
attempts.csv
item_mastery.csv
error_summary.csv
stage_progress.json
question_bank_snapshot.json
raw_events.jsonl
toeic_vocab_export_YYYY-MM-DD.json
```

Notes:

- IMPLEMENTED: Data can be downloaded from the Export view.
- PARTIAL: Folder export depends on browser support; otherwise individual files download.
- PARTIAL: No zip packaging.

## Program A Lesson Schema

Status: IMPLEMENTED/PARTIAL, PROGRAM A ONLY

Source:

- `data/index.json`
- `data/weakness-hunter/*.json`
- `data/pos-booster/*.json`

Current lesson/question schema is incompatible with vocabulary tracker. It uses fields such as:

```json
{
  "lesson_id": "pos-d1",
  "module_id": "pos-booster",
  "questions": [
    {
      "q_id": "pos-d1-q1",
      "stem": "Paragraph 3 states that any {BLANK} ...",
      "options": [
        { "label": "A", "text": "modify", "pos": "verb", "is_correct": false }
      ],
      "answer": "C",
      "weakness_tag": "word-form-position",
      "solution_steps": []
    }
  ]
}
```

This Program A schema should not be treated as the Program B vocabulary tracker schema.
