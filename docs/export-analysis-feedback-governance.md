# Export Analysis Feedback Governance

Status: Active governance document
Last updated: 2026-05-20
Scope: Program B content updates and rebuild waves

This document defines how exported learning data feeds back into question-bank and curriculum decisions. It does not change production seed data. It tells future rebuild work what to inspect after learner attempts, draft smoke tests, or a production content wave.

Machine-readable policy:

```text
drafts/v0-v3-rebuild/export_analysis_review_policy.json
```

Review template:

```text
docs/templates/export-content-review-template.md
```

Verifier:

```powershell
npm run test:export-governance
```

---

## 1. When Review Is Required

Run an export review after any of these events:

- production seed content changes;
- a draft authored slice is used as a quality reference;
- a minimum usable content pack is reviewed;
- a question type is scaled beyond its first sample pack;
- Playwright or manual smoke testing produces new lesson/review/export data.

Do not describe a content wave as ready for scale-up until an export review is recorded or the review is explicitly blocked by insufficient data.

---

## 2. Required Files

Every review should inspect these export files when available.

| Group | Files |
|---|---|
| Summary | `summary.md`, `report.md`, `lesson_recommendations.md`, `diagnostic_recommendation.json`, `stage_progress.json`, `content_quality_summary.json` |
| Data | `attempts.csv`, `attempts.json`, `attempts.jsonl`, `sessions.csv`, `sessions.json`, `item_mastery.csv`, `mastery.json`, `review_queue.json`, `error_logs.json` |
| Analytics | `error_summary.csv`, `error_summary.json`, `speed_summary.json`, `review_effectiveness.csv`, `review_effectiveness.json`, `stage_seal_readiness.json` |
| Package | `question_bank_snapshot.json`, `raw_events.jsonl`, `toeic_vocab_export_YYYY-MM-DD.json` |

If a file is empty because production seed is empty or no learner has attempted lessons yet, record `insufficient_data` rather than inventing a content conclusion.

---

## 3. Core Metrics

Track these metrics for every content review:

| Metric | Source files | Decision use |
|---|---|---|
| Attempt volume | `attempts.csv`, `sessions.csv` | Confirm enough data exists before judging content. |
| Accuracy by stage, lesson, and question type | `attempts.csv`, `sessions.csv`, `stage_progress.json` | Find weak lessons, stages, and question types. |
| Average response time by type | `attempts.csv`, `speed_summary.json` | Detect slow recall and timing pressure. |
| Speed bucket distribution | `attempts.csv`, `speed_summary.json` | Separate fast wrong, slow correct, and timeout-like behavior. |
| Error-code distribution | `error_summary.csv`, `error_summary.json`, `attempts.csv` | Identify dominant learner error patterns. |
| Repeated-error rate | `attempts.csv`, `error_summary.csv` | Decide whether distractors or explanations need revision. |
| Review fix rate | `review_effectiveness.csv`, `review_effectiveness.json` | Judge whether review rows repair weak items. |
| Target item mastery | `item_mastery.csv`, `mastery.json` | Select items to reinforce, rewrite, or retire. |
| Review queue pressure | `review_queue.json`, `raw_events.jsonl` | Find high-priority stuck items. |
| Content-quality flags | `content_quality_summary.json`, `question_bank_snapshot.json` | Catch duplicate, coverage, and question-shape risks. |
| Stage readiness | `stage_seal_readiness.json`, `stage_progress.json` | Decide whether stage gates need content or data before scale-up. |
| Diagnostic status | `diagnostic_recommendation.json` | Avoid acting on insufficient V0 diagnostic data. |

---

## 4. Review Decisions

Each reviewed lesson, question type, or target item should end with one of these decisions:

- `keep`
- `revise_question_text`
- `revise_distractors`
- `revise_explanation`
- `add_review_pressure`
- `reduce_or_remove_item`
- `add_prerequisite_lesson`
- `promote_to_next_wave`
- `hold_for_more_data`

The review note must explain why the decision follows from export evidence. Script warnings or low data volume may justify `hold_for_more_data`.

---

## 5. Feedback Loop

After the review:

1. Record the review using `docs/templates/export-content-review-template.md`.
2. Put the completed review cycle under `drafts/v0-v3-rebuild/export_review_cycles/`.
3. Add or update rebuild priorities in `docs/Future Plan.md`.
4. Update `docs/minimum-usable-content-packs.md` or `drafts/v0-v3-rebuild/minimum_usable_packs.json` if the review changes a minimum-pack requirement.
5. Update `docs/rebuild-wave-release-gate.md` only when the review changes release-blocking policy.
6. Carry item-level decisions into the next wave authoring backlog before writing more rows.

For production content changes, this export review is additional to the release gate. It does not replace seed sync, duplicate audit, quality audit, or Playwright validation.

---

## 6. First Process Validation

The first C-06 review cycle is recorded here:

```text
drafts/v0-v3-rebuild/export_review_cycles/2026-05-19-c06-seeded-fixture-review.json
```

It uses current automated smoke coverage:

- `tests/ui-regression.spec.ts` verifies the export inventory lists all analysis files.
- `tests/export-flow.spec.ts` verifies the package download fallback path.
- `tests/review-mode.spec.ts` verifies `review_effectiveness.csv`.
- `tests/v2-v3-content.spec.ts` verifies seeded V2/V3 attempts appear in `attempts.csv` and `raw_events.jsonl`.

Decision: process validated, production content unchanged. At the time of C-06, production seed had 0 runnable lessons and 0 question-bank rows, so real learner content decisions were blocked until a later production or draft content wave produced reviewable attempt data.

---

## 7. First Production-Wave Follow-Up

After `V2-A-71` was promoted as the first production wave, C-09 recorded the first post-release export review here:

```text
drafts/v0-v3-rebuild/export_review_cycles/2026-05-20-c09-v2-a-71-post-release-review.json
```

Human review note:

```text
docs/wave-retrospectives/2026-05-20-c09-v2-a-71-post-release-review.md
```

Decision: `V2-A-71` remains live unchanged. The 4 staircase progression warnings are accepted as short-term warning debt only. No current `V2-A-71` learner/export package exists in the repo, so learner evidence is recorded as `insufficient_data` and future rewrite work must begin as an isolated draft probe before any production seed change.
