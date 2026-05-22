# C-09 V2-A-71 Post-Release Review

Status: completed
Review date: 2026-05-20
Reviewer: Codex
Scope: `V2-A-71` first production wave, 1 lesson / 24 question rows
Production seed changed: no

## Verdict

`V2-A-71` remains acceptable as the first production baseline.

The 4 staircase progression warnings are accepted as short-term warning debt, not as the long-term V2 authoring pattern. No live seed rewrite is authorized by this review. A rewrite should begin only through an isolated draft probe if learner evidence shows the lesson is too flat, too easy, too slow, or weak at review repair.

## Evidence Used

- `data/vocab/curriculum.json`: `V2-A-71` lesson row and question wiring.
- `data/vocab/questions_v2a.json`: 20 `scene_vocabulary` rows and 4 `review_question` rows.
- `node scripts/audit-quality-full.js`: passed with 0 blocking issues and 4 staircase progression warnings.
- `docs/question-bank-source-of-truth-workflow.md` and `js/views/bank.js`: browser Question Bank edits remain IndexedDB-only until patch-applied.

No current `V2-A-71` learner/export attempts are available in the repo. `Background/toeic_progress_current.json` contains older general progress sessions, and `Log Download/` contains a 2026-05-14 V1-B-21 export, so neither can support a learner verdict for `V2-A-71`.

## Warning Disposition

| Target item | Rows flagged | Decision | Reason | Revisit trigger |
|---|---:|---|---|---|
| `extension` | 6 | accepted short-term debt | Office phone contexts are natural and unambiguous, but all rows still test the same recognition demand. | Rewrite if learners miss `extension` in 2 or more contexts after at least 3 full sessions, or if review fix rate stays below 50%. |
| `photocopier` | 6 | accepted short-term debt | Copy, paper jam, toner, lobby copy, and glass-platform contexts are varied enough for baseline launch, but demand rank is still flat. | Rewrite if wrong answers concentrate on `workstation` or `stationery`, or if average response time stays above the 15-second target. |
| `stationery` | 6 | accepted short-term debt | Supply, envelope, thank-you-card, and form-filling contexts are TOEIC-plausible, with no grammar shortcut found. | Rewrite if the direct review row is answered correctly while context rows remain weak, which would mean definition recall is not transferring. |
| `workstation` | 6 | accepted short-term debt | Desk, relocation, shared login, home setup, and renovation contexts are clear and plausible. | Rewrite if learners over-select `workstation` as a generic office answer or if review repair is weak. |

## Human Review

| Area | Finding | Decision |
|---|---|---|
| Lesson sequence | The lesson groups five context rows per item, followed by four direct review rows. This is predictable but acceptable for the first V2 baseline. | keep for now |
| Same-item demand shift | The audit warning is valid: each item repeats in the same `scene_vocabulary` demand rank before a direct review row. | accept short-term debt |
| Explanations | `explanation_zh` consistently explains the context contrast in Traditional Chinese and names a plausible distractor. | keep |
| Distractors | All options are from the same office-equipment scene, and no article or grammar giveaway was found. | keep |
| Answer distribution | A/B/C/D are balanced exactly 6 rows each. | keep |
| Review rows | The four review rows are direct meaning checks. They are useful as a first quick-recall baseline but do not prove transfer. | hold for learner data |
| Question Bank boundary | Browser edits save to IndexedDB and export patches/snapshots only; they do not rewrite source JSON. | keep |

## Learner Evidence Status

Status: `insufficient_data`

Minimum evidence before revisiting this verdict:

- at least 3 full `V2-A-71` lesson sessions, or 72 total lesson attempts;
- at least 1 review-mode pass containing due `V2-A-71` items, if review queue data exists;
- export review of `attempts.csv`, `sessions.csv`, `speed_summary.json`, `error_summary.json`, `review_effectiveness.csv`, `item_mastery.csv`, and `review_queue.json`.

## Follow-Up Rules

Do not edit `data/vocab/questions_v2a.json` directly for this debt. If any revisit trigger fires:

1. Create an isolated draft probe under `drafts/v0-v3-rebuild/` with `production_impact: none`.
2. Redesign each repeated item with a clearer staircase, such as context recognition, contrast, operational scene, and delayed review.
3. Run isolated validation and the full production release gate before any seed change.

For C-10 and later V2 waves, do not copy the flat five-context-plus-direct-review pattern as the default. New V2 lessons should show a more visible demand shift inside each repeated target item.

## Validation

Commands run for this review:

```powershell
node scripts/audit-quality-full.js
```

Result: passed, 0 blocking issues, 4 accepted non-blocking staircase warnings.
