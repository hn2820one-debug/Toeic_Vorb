# V1-F Speed Lesson Smoke Test

## 1. Scope

This smoke test only covered the Vocabulary Tracker project at `C:\Users\Keith\Toeic\toeic-app-Vorb`.

Lesson tested:

- `V1-F-53`
- title: `V1 mixed word family speed reflex 01`

Environment used:

- local static server: `python -m http.server 8788`
- URL: `http://127.0.0.1:8788/tracker.html`
- browser: integrated headless browser via Playwright tools

This round did not change runtime code or question JSON files.

## 2. Pre-Test State

Before starting `V1-F-53`:

- existing attempts for `V1-F-53`: 0
- existing sessions for `V1-F-53`: 0
- existing review queue rows linked to `V1-F-53`: 0
- active session: `null`
- `last_opened_lesson` in prefs: `V1-B-21`

## 3. Runtime Start Check

The runtime was started directly through `window.VocabTracker.startLesson('V1-F-53')`.

Observed immediately after start:

- active lesson id: `V1-F-53`
- active stage: `V1`
- runtime question count: 40
- current question type: `speed_drill`
- target time shown in UI: 8s
- step distribution from `step_by_question`:
  - `previous_review`: 1
  - `toeic_practice`: 39

Interpretation:

- `V1-F-53` is operational and clearly treated as a speed lesson.
- The generic runtime step builder is still in control, so this lesson is mostly flattened into `toeic_practice` rather than using a dedicated speed-mode flow.

## 4. Controlled Answer Plan

To verify all four speed buckets plus lesson completion and reinforcement behavior, the run used a controlled answer mix:

- 10 wrong answers total
- 30 correct answers total
- 3 slow wrong
- 7 fast wrong
- 27 fast correct
- 3 slow correct

Important observation:

- The first question recorded `68.98s`, not `~8.5s`.
- That happened because the question timer starts when the question is rendered and keeps counting while the user remains idle on the first question.
- This is honest runtime behavior, not a logging typo.
- Because of that, session average time is slightly inflated by the initial inspection delay.

## 5. Session Result

| Field | Value |
| --- | --- |
| `session_id` | `ses_61a03fe8-c48e-45c8-8002-8db277e9a3e6` |
| `lesson_id` | `V1-F-53` |
| `stage` | `V1` |
| `total_questions` | 40 |
| `correct_questions` | 30 |
| `wrong_questions` | 10 |
| `accuracy` | 0.75 |
| `avg_response_time_seconds` | 3.01 |
| `mastery_status` | `unstable` |
| `next_action` | `add_5_reinforcement_questions` |
| `fast_correct_count` | 27 |
| `slow_correct_count` | 3 |
| `repeated_error_count` | 0 |
| top error codes | `TIME_PRESSURE` |

Additional timing read:

- min response time: `0.26s`
- median response time: `0.26s`
- max response time: `68.98s`

## 6. Speed Bucket Verification

| Bucket | Count | Result |
| --- | --- | --- |
| `fast_correct` | 27 | PASS |
| `slow_correct` | 3 | PASS |
| `fast_wrong` | 7 | PASS |
| `slow_wrong` | 3 | PASS |

This verifies that the runtime is recording all four bucket variants into attempts for a V1-F speed lesson.

## 7. Review Queue Verification

Because session accuracy ended at `0.75`, the lesson resolved to reinforcement rather than a clean pass.

Observed result:

- 5 new pending review queue rows were created from the first 5 wrong attempts
- priority: `4`
- reason: `reinforcement`
- due date: `2026-05-16`

New review queue rows confirmed from this session:

| review_id | item_id | question_ids | status |
| --- | --- | --- | --- |
| `review_item_accurate_family_2026-05-16` | `item_accurate_family` | `v1_f_53_q_001` | `pending` |
| `review_item_apply_family_2026-05-16` | `item_apply_family` | `v1_f_53_q_005` | `pending` |
| `review_item_available_family_2026-05-16` | `item_available_family` | `v1_f_53_q_002` | `pending` |
| `review_item_productive_family_2026-05-16` | `item_productive_family` | `v1_f_53_q_003` | `pending` |
| `review_item_secure_family_2026-05-16` | `item_secure_family` | `v1_f_53_q_004` | `pending` |

This confirms that V1-F speed errors can feed the reinforcement queue.

## 8. Export Verification

This smoke test also rechecked the browser-side export path for the new V1-F data.

Method used:

- hook `window.VocabScoring.downloadText`
- call `window.VocabTracker.downloadExportFile('attempts.csv')`
- call `window.VocabTracker.downloadExportFile('summary.md')`
- inspect captured browser-side export payloads

### 8.1 `attempts.csv`

Captured header:

`"attempt_id","timestamp","user_id","course_id","stage","lesson_id","session_id","step","question_id","question_type","target_item_id","grammar_link_id","correct_answer","user_answer","is_correct","response_time_seconds","speed_bucket","error_code","default_error_code","is_repeated_error","review_priority","mode"`

Verified:

- 40 exported rows for `V1-F-53`
- `speed_bucket` persisted correctly
- `stage`, `session_id`, `step`, `target_item_id`, `grammar_link_id`, and `default_error_code` persisted correctly

Representative first exported row:

- `v1_f_53_q_001`
- `step=previous_review`
- `question_type=speed_drill`
- `response_time_seconds=68.98`
- `speed_bucket=slow_wrong`
- `error_code=TIME_PRESSURE`

Representative last exported row:

- `v1_f_53_q_040`
- `step=toeic_practice`
- `question_type=speed_drill`
- `response_time_seconds=0.26`
- `speed_bucket=fast_correct`
- `default_error_code=TIME_PRESSURE`

### 8.2 `summary.md`

Verified:

- `summary.md` regenerated successfully
- the file contained the speed-analysis section
- the summary still aggregates all current runtime data, not just `V1-F-53`

Observed speed-analysis block after this test:

- overall average response time: `3.2s`
- overall accuracy: `78.1%`
- `fast_correct`: 46
- `slow_correct`: 4
- `fast_wrong`: 10
- `slow_wrong`: 4

Interpretation:

- Export behavior for the new V1-F attempts is working.
- `summary.md` is still a global export summary, not a lesson-scoped summary.

## 9. Smoke Test Verdict

| Area | Status | Notes |
| --- | --- | --- |
| Lesson start | PASS | `V1-F-53` starts correctly and enters lesson mode. |
| Lesson completion | PASS | 40 questions were answered and a session record was saved. |
| Speed bucket recording | PASS | All four bucket variants were recorded. |
| Session rollup | PASS | Accuracy, avg time, mastery status, and next action were saved. |
| Review queue generation | PASS | Reinforcement queue rows were created at 75% accuracy. |
| Export retention of V1-F attempts | PASS | `attempts.csv` captured the new V1-F rows and `speed_bucket`. |
| Generic step mapping | PARTIAL | 39 of 40 items are `toeic_practice`; there is no dedicated speed-mode flow. |
| Timer behavior | PARTIAL | First-question timer accumulates idle time before the first answer. |
| OS-level saved-file verification | NOT RUN | Browser-side payloads were verified, but saved download artifacts were not independently inspected. |

## 10. Key Findings

1. `V1-F-53` is operational as a real lesson, not just static content.
2. Speed bucket analytics are functioning and survive export.
3. Reinforcement queue generation also works for a speed lesson.
4. The lesson currently relies on the generic runtime step system rather than a dedicated speed-mode runtime.
5. The timer behavior on the first visible question should be treated as known runtime behavior; it can materially inflate average time if the learner pauses before answering question 1.

## 11. Recommended Follow-Up

1. If runtime polish is approved, patch first-question timing so the timer starts on interaction or on first answerable state rather than on passive inspection time.
2. If speed UX matters, consider giving V1-F a dedicated speed-mode runtime instead of flattening almost the entire lesson into `toeic_practice`.
3. Keep export behavior as-is for now; it already retains the fields needed for V1-F analytics.