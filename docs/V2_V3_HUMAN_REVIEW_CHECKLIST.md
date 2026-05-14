# V2/V3 Human Review Checklist

Status: P0 REVIEW CHECKLIST

Scope: TOEIC Vocabulary Tracker Program B only.

Use this checklist after running:

```powershell
node scripts\validate-vocab-data.js
node scripts\audit-vocab-quality.js
npm test -- --reporter=list
```

## Review Goal

V2/V3 already pass structural validation. This review checks whether the learning content is good enough for real TOEIC vocabulary practice.

## Representative Lessons

Use these six lessons for manual browser review:

| Stage | Lesson | Why this lesson |
|---|---|---|
| V2-A | `V2-A-71` Office Equipment Scene Vocabulary | Office/admin baseline |
| V2-C | `V2-C-91` Recruitment Scene Vocabulary | HR scene vocabulary |
| V2-E | `V2-E-111` Hotel Scene Vocabulary | Service / public-facing scene |
| V3-A | `V3-A-121` Office Task Collocations 01 | Office collocation baseline |
| V3-D | `V3-D-151` Budget Collocations | Finance / compliance collocation |
| V3-F | `V3-F-171` Security Context Collocations | Mixed Part 6 context |

## V2 Scene Vocabulary Checks

For each V2 lesson:

| Check | Pass condition | Notes |
|---|---|---|
| Scene fit | Every target item belongs naturally to the lesson scene | Office items should not feel like random general vocab |
| TOEIC realism | At least some questions feel like notices, emails, schedules, calls, announcements, or service situations | Avoid pure translation drills only |
| Distractor quality | Wrong options are plausible same-scene distractors | Avoid unrelated filler options |
| Context variety | Stems vary within the lesson | Avoid the same clue shell all lesson |
| Meaning clarity | Chinese explanation is accurate and concise | No misleading translation |
| Old-item interference | Lesson includes prior scene items or planned review exposure | Currently weak and should be improved |

## V3 Collocation Checks

For each V3 lesson:

| Check | Pass condition | Notes |
|---|---|---|
| Natural collocation | Correct phrase is a natural business English collocation | e.g. `submit a report`, `meet a deadline` |
| Distractor plausibility | Wrong options are realistic learner traps, not only awkward phrases | Current audit flags overuse of `do/take/make` |
| Part 6 context | Part 6 rows should contain enough context to choose by meaning | Prefer 2-4 sentence mini-passages |
| Domain fit | Collocations match the lesson domain | Finance collocations should sound finance-related |
| Explanation quality | `explanation_zh` explains why the collocation is natural | Not only "this is correct" |
| Repetition | Repeated sentence shells are limited | Audit currently flags this as a quality issue |

## Export Review Checks

After answering representative V2/V3 lessons:

| File | Required evidence |
|---|---|
| `attempts.csv` | Contains V2 and V3 rows with `stage`, `lesson_id`, `question_type`, `target_item_id`, `response_time_seconds`, `error_code` |
| `sessions.csv` | Contains completed or partial session records if lessons are finished |
| `item_mastery.csv` | Contains V2 scene vocabulary and V3 collocation items after attempts |
| `summary.md` | Mentions V2/V3 weakness patterns if attempts exist |
| `raw_events.jsonl` | Contains V2/V3 attempt events |

## Severity Labels

Use these labels when logging issues:

| Severity | Meaning |
|---|---|
| High | Blocks real learning or produces misleading analysis |
| Medium | Usable but noticeably reduces quality |
| Low | Cosmetic or wording cleanup |

## Recommended Issue Format

```text
Issue:
Severity:
Lesson:
Question ID:
Problem:
Evidence:
Recommended rewrite:
```

## P0 Exit Criteria

P0 is complete when:

- `scripts/validate-vocab-data.js` passes.
- `scripts/audit-vocab-quality.js` generates `docs/V2_V3_QUALITY_AUDIT.md`.
- Six representative lessons have automated runtime smoke evidence.
- Export test confirms V2/V3 attempts are present in `attempts.csv` and `raw_events.jsonl`.
- Human review has at least identified the first rewrite batch for V2/V3.
