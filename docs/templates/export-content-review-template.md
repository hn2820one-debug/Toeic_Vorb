# Export Content Review Template

Review ID:
Review date:
Reviewer:
Scope:
Wave / pack:
Data source:
Production seed changed: yes/no

---

## 1. Export Files Reviewed

Mark each file as `reviewed`, `empty`, `not_available`, or `blocked`.

| File | Status | Notes |
|---|---|---|
| `summary.md` |  |  |
| `report.md` |  |  |
| `lesson_recommendations.md` |  |  |
| `diagnostic_recommendation.json` |  |  |
| `stage_progress.json` |  |  |
| `content_quality_summary.json` |  |  |
| `attempts.csv` |  |  |
| `attempts.json` |  |  |
| `attempts.jsonl` |  |  |
| `sessions.csv` |  |  |
| `sessions.json` |  |  |
| `item_mastery.csv` |  |  |
| `mastery.json` |  |  |
| `review_queue.json` |  |  |
| `error_logs.json` |  |  |
| `error_summary.csv` |  |  |
| `error_summary.json` |  |  |
| `speed_summary.json` |  |  |
| `review_effectiveness.csv` |  |  |
| `review_effectiveness.json` |  |  |
| `stage_seal_readiness.json` |  |  |
| `question_bank_snapshot.json` |  |  |
| `raw_events.jsonl` |  |  |
| `toeic_vocab_export_YYYY-MM-DD.json` |  |  |

---

## 2. Metric Snapshot

| Metric | Value | Source | Interpretation |
|---|---:|---|---|
| Attempt volume |  |  |  |
| Session count |  |  |  |
| Accuracy by stage |  |  |  |
| Accuracy by lesson |  |  |  |
| Accuracy by question type |  |  |  |
| Average response time by type |  |  |  |
| Speed bucket distribution |  |  |  |
| Error-code distribution |  |  |  |
| Repeated-error rate |  |  |  |
| Review fix rate |  |  |  |
| Weak / unstable / mastered item counts |  |  |  |
| Review queue pressure |  |  |  |
| Content-quality flags |  |  |  |
| Stage readiness |  |  |  |
| Diagnostic status |  |  |  |

---

## 3. Findings

| Area | Finding | Evidence | Decision |
|---|---|---|---|
| Lesson |  |  | keep / revise_question_text / hold_for_more_data |
| Question type |  |  | keep / revise_distractors / add_review_pressure |
| Target item |  |  | keep / reduce_or_remove_item / add_prerequisite_lesson |
| Review flow |  |  | keep / revise_explanation / promote_to_next_wave |

---

## 4. Feedback To Rebuild Plan

Future Plan update needed: yes/no
Minimum pack update needed: yes/no
Release gate update needed: yes/no
Next wave backlog changes:

- 

Blocked on:

- 

---

## 5. Validation

Commands run:

```powershell
npm run test:export-governance
npm run test:docs
npm run test:all
```

Result:

Final decision:

