# P1 Review Mode Result

Status: COMPLETED

Date: 2026-05-14

Scope: TOEIC Vocabulary Tracker Program B only.

## What Changed

- Added dedicated Review Mode from `review_queue`.
- Added review filters:
  - due today
  - high priority
  - repeated errors
  - all pending
- Review Mode creates an active review session without starting a normal curriculum lesson.
- Review attempts are saved immediately with `mode: "review_queue"` and `step: "review_queue"`.
- Review attempts update item mastery through the existing mastery scoring path.
- Review queue entries are updated after review:
  - `fixed`
  - `still_weak`
  - `repeated_error`
- Export now includes `review_effectiveness.csv`.
- `summary.md` now includes a Review Effectiveness section.

## Current Behavior

Review Mode starts from the Mistakes page. It builds a 1-20 question runtime from pending queue entries, prioritizing higher priority and earlier due dates. It reuses the existing question screen, timer, immediate attempt persistence, feedback, session summary, and item mastery update code.

Normal lesson attempts keep `mode: "blind_drill"`. Review attempts use `mode: "review_queue"`, while preserving the original question `stage`, `lesson_id`, `question_type`, `target_item_id`, and `grammar_link_id`.

## Export Evidence

New export file:

```text
review_effectiveness.csv
```

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

The export groups review effectiveness by target item, error code, and question type.

## Test Evidence

Latest targeted test:

```powershell
npx playwright test tests/review-mode.spec.ts --reporter=list
```

Result:

```text
1 passed
```

The test confirms:

- due queue items appear in Review Mode
- review runtime starts
- correct answers create `mode=review_queue` attempts
- a review session is saved as `REVIEW_QUEUE`
- queue entries become `fixed`
- `review_effectiveness.csv` is generated

## Remaining Gaps

- Review scheduling is still simple: fixed items are marked done, weak items are due again in 1-2 days.
- There is no advanced spaced-repetition algorithm yet.
- Review Mode currently selects up to 20 available questions; it does not yet enforce a minimum 10-question session if the queue has fewer items.
- V2/V3 content quality warnings remain separate from this P1 work.
