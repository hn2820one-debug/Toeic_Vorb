# Production Baseline Smoke Checklist

Status: Active smoke checklist
Last updated: 2026-05-20
Scope: Program B first-wave production baseline and future production-wave preflight
Mapped blueprint tasks: `T011` through `T020`

This checklist hardens the current `V2-A-71` production baseline and defines what to rerun before the next production seed wave. It does not change production seed data.

---

## 1. Current Baseline

Current live production baseline:

- lesson: `V2-A-71`
- title: `Office Equipment Scene Vocabulary`
- production lesson rows: 1
- production question rows: 24
- target items: `extension`, `photocopier`, `stationery`, `workstation`
- accepted short-term warning debt: 4 staircase progression warnings
- learner evidence status: `insufficient_data`

Post-release review:

```text
docs/wave-retrospectives/2026-05-20-c09-v2-a-71-post-release-review.md
```

Export-review record:

```text
drafts/v0-v3-rebuild/export_review_cycles/2026-05-20-c09-v2-a-71-post-release-review.json
```

---

## 2. T011-T020 Status

| Task | Status | Decision |
|---|---|---|
| `T011` | complete | The 4 staircase warnings were reviewed and accepted as short-term debt only. |
| `T012` | complete | Human review found the baseline usable, with flat same-item demand shift documented. |
| `T013` | blocked | No real `V2-A-71` learner/export sessions exist in the repo. Do not fabricate learner evidence. |
| `T014` | complete | Review rows are useful as quick recall but not enough to prove transfer; revisit after learner data. |
| `T015` | conditional | Rewrite only if learner evidence triggers it; any rewrite starts as an isolated draft probe. |
| `T016` | complete | Post-release review note exists under `docs/wave-retrospectives/`. |
| `T017` | complete | Question Bank source boundary remains IndexedDB-only until patch-applied and validated. |
| `T018` | complete | Existing production UI regression covers Today, Roadmap, Lesson, Export, Question Bank, Settings, desktop, and mobile surfaces for the first wave. |
| `T019` | complete | This document defines the baseline smoke checklist to rerun before future production waves. |
| `T020` | complete | `tests/ui-regression.spec.ts` verifies the next-action selection rule for a future multi-lesson production state. |

---

## 3. Required Baseline Smoke Commands

Run this set after any production wave and before starting the next promotion:

```powershell
node scripts/validate-vocab-data.js
node scripts/audit-quality-full.js
node scripts/audit-duplicates.js
npm run test:docs
npx playwright test tests/ui-regression.spec.ts
npx playwright test tests/seed-sync.spec.ts
```

For production seed changes, this smoke set is not enough by itself. Continue through the full release gate in `docs/rebuild-wave-release-gate.md`.

---

## 4. UI Smoke Coverage

The first-wave production UI must show:

- Today hero points to `V2-A-71`.
- Today next action starts the current lesson when no review items are due.
- Empty-seed banner stays hidden while 1 lesson / 24 questions are live.
- Roadmap shows 1 / 1 lesson and stage filters work.
- Lesson view shows `V2-A-71`, 24 questions, and a normal start CTA.
- Question Bank shows 24 rows, local-edit warning, patch export, and edited seed snapshot controls.
- Export inventory lists all analysis files.
- Advanced tool entries stay aligned on desktop and mobile.
- Mistakes / Review view still opens normally.

Current automated coverage:

```text
tests/ui-regression.spec.ts
```

---

## 5. Multi-Lesson Next Action Rule

When production grows beyond one lesson, Today must select the first non-passing lesson sorted by `lesson_number`, unless `last_opened_lesson` points to a non-passing lesson.

Expected behavior:

- If `V2-A-71` is completed and `V2-A-72` is `not_started`, Today should point to `V2-A-72`.
- If a non-passing lesson is stored as `last_opened_lesson`, Today may resume that lesson.
- `needs_retake` lessons are selected after normal incomplete lessons unless they are the active `last_opened_lesson`.
- Passing statuses are `completed`, `completed_with_reinforcement`, and `sealed`.

Current automated coverage:

```text
tests/ui-regression.spec.ts
```

Test name:

```text
today next action: future multi-lesson production state selects first incomplete lesson
```

---

## 6. Learner Evidence Gate

Do not mark `T013` complete until at least one of these exists:

- 3 full `V2-A-71` learner sessions;
- 72 total `V2-A-71` lesson attempts;
- a review-mode export containing due `V2-A-71` items.

Required export files for the learner review:

- `attempts.csv`
- `sessions.csv`
- `speed_summary.json`
- `error_summary.json`
- `review_effectiveness.csv`
- `item_mastery.csv`
- `review_queue.json`

If the data remains absent, record `insufficient_data`; do not infer a content rewrite decision.

---

## 7. Rewrite Trigger

Do not edit `data/vocab/questions_v2a.json` directly for the current staircase debt.

If learner evidence shows concentrated errors, abnormal timing, or poor review repair:

1. Create an isolated draft probe under `drafts/v0-v3-rebuild/` with `production_impact: none`.
2. Redesign repeated target items with a clearer demand shift.
3. Run isolated validation.
4. Promote only through seed sync, seed-change record, human review, export-review follow-up, and the full production release gate.

---

## 8. 2026-05-20 Reverification

This pass rechecked `T011` through `T020` before starting the V2 wave expansion tasks.

| Check | Result | Follow-up |
|---|---|---|
| `T011` warning debt | Still accepted as short-term first-wave debt only. | Do not copy the flat staircase pattern into later V2 lessons. |
| `T012` human review | Still usable for baseline learning. | Keep the post-release review as the template for later wave notes. |
| `T013` learner evidence | Still blocked; no real `V2-A-71` learner/export sessions are present in the repo. | Revisit only after the learner evidence gate in section 6 is met. |
| `T014` review value | Still limited to quick recall evidence. | Mixed review and learner exports must prove transfer later. |
| `T015` rewrite decision | Still conditional. | Any rewrite starts as a `production_impact: none` draft probe. |
| `T016` retrospective | Present and linked from this checklist. | Reuse its structure for V2 wave 2. |
| `T017` Question Bank boundary | IndexedDB-only browser editing boundary remains the correct rule. | Source JSON changes still require patch review and seed validation. |
| `T018` UI readability | Existing smoke coverage remains the required pre-promotion baseline. | Rerun section 3 before any production promotion. |
| `T019` baseline checklist | This document remains the active smoke checklist. | Update it when future production states add new surfaces. |
| `T020` multi-lesson ordering | Covered by `tests/ui-regression.spec.ts`. | Keep the future multi-lesson regression when wave 2 is promoted. |

Optimization made in this pass: the baseline gate now explicitly separates "blocked by missing learner evidence" from "complete by review or regression." This prevents `T013` and `T015` from being closed by fixture data or by documentation review alone.
