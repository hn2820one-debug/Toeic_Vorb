# Question Bank Build Governance

Status: Active governance document
Last updated: 2026-05-20
Scope: Program B question-bank build program
Mapped blueprint tasks: `T001` through `T010`

This document turns the Program Setup and Governance workstream from `docs/QUESTION_BANK_BUILD_BLUEPRINT_2026-05-20.md` into operating rules. It does not change production seed data.

Program boundary:

- Program B path: `C:\Users\Keith\Toeic\toeic-app-Vorb`
- Program A path: `C:\Users\Keith\toeic-app`
- Do not modify Program A.
- Do not promote V4 without a future explicit V4 activation task.

---

## 1. 90-Day Build Objective

The next 90 days should optimize for controlled production expansion, not for accumulating more unshipped draft stock.

Primary goal:

- expand live production through small, validated V2/V3 production waves;
- convert the highest-confidence existing rebuild stock before authoring large new stock;
- keep each production wave small enough for real review, validation, rollback, and export follow-up.

Non-goals:

- adding large draft-only packs that have no promotion path;
- chasing raw question count while warning debt grows;
- activating V4/V5/V6 before V2/V3 have a stable learning core.

Success signal:

- live production is no longer dependent on one lesson;
- production warning debt is documented and shrinking or intentionally accepted;
- every production wave has a seed-change record, human review note, validation evidence, and export-review follow-up.

---

## 2. Official Content Buckets

Use these definitions in every inventory, report, review, and release note.

| Bucket | Definition | Current examples | Counts as live app content? |
|---|---|---|---|
| `production` | Files loaded by the app seed from `data/vocab/` through the manifest in `curriculum.json`. | `data/vocab/curriculum.json`, `data/vocab/questions_v2a.json` with `V2-A-71` | yes |
| `draft` | Isolated prototype or planned content that is not loaded by production seed. | `drafts/v4/questions_v4a.json` | no |
| `rebuild` | Candidate or reference material under rebuild folders that may later be converted through the release gate. | `drafts/v0-v3-rebuild/`, `drafts/collocation-rebuild/` | no |
| `archive` | Historical files retained for traceability only. | `docs/backups/` | no |

Do not count `tmp/`, `Background/`, `Log Download/`, `playwright-report/`, or `test-results/` as courseware inventory unless a future task explicitly defines a separate evidence inventory.

---

## 3. Active Work Mapping

`docs/Future Plan.md` remains the only active execution checklist.

Rules:

- Blueprint tasks are a source pool, not an execution substitute.
- Every future content, governance, or current-truth documentation task must map to a `Future Plan` block before it changes production data or current facts.
- If no block exists, add one first with scope, priority, checklist, and completion rule.
- This governance pass maps `T001-T010` to `D-11`.

Recommended mappings:

| Blueprint range | Future Plan block |
|---|---|
| `T001-T010` | `D-11` question-bank build governance |
| `T011-T020` | `C-09` plus follow-up `C-10` / production baseline checks |
| `T021-T040` | `C-10` V2 production promotion pipeline |
| `T061-T080` | `C-11` V3 rebuild conversion |
| `T151-T160` | `D-10` inventory refresh / monthly reporting |

---

## 4. Naming Rules

Use stable names that make the artifact type and production status obvious.

| Artifact | Required pattern | Example |
|---|---|---|
| Production lesson ID | Existing curriculum stage/group/number format | `V2-A-71` |
| Draft pack file | `drafts/{area}/{stage_or_wave}_{lesson_or_range}_{purpose}_draft_pack.json` | `drafts/v0-v3-rebuild/v2_a_72_candidate_draft_pack.json` |
| Export review cycle | `drafts/v0-v3-rebuild/export_review_cycles/YYYY-MM-DD-{block}-{wave}-review.json` | `2026-05-20-c09-v2-a-71-post-release-review.json` |
| Human review / retrospective | `docs/wave-retrospectives/YYYY-MM-DD-{block}-{wave}-{purpose}.md` | `2026-05-20-c09-v2-a-71-post-release-review.md` |
| Seed version | `toeic_vocab_tracker_{description}_{YYYY_MM_DD}` | `toeic_vocab_tracker_v2_a_71_first_wave_2026_05_20` |
| Seed-change record | `docs/seed-changes/YYYY-MM-DD-{seed_version}.md` | `2026-05-20-toeic_vocab_tracker_v2_a_71_first_wave_2026_05_20.md` |
| Inventory snapshot | `docs/REPO_COURSEWARE_INVENTORY_YYYY-MM-DD.md` | `REPO_COURSEWARE_INVENTORY_2026-05-20.md` |

Avoid spaces in newly created machine-readable artifact filenames. Existing human documents with spaces can remain.

---

## 5. Weekly Governance Checkpoint

Run a short governance checkpoint once per week while content work is active, and after every production wave.

Checklist:

- Review current production counts and warning debt.
- Check whether any warning debt has become a blocker because of learner/export evidence.
- Review the next V2/V3 promotion candidates and confirm they are still mapped to `Future Plan`.
- Confirm V4 remains isolated unless an explicit V4 activation block exists.
- Confirm active docs still separate production, draft, rebuild, and archive.
- Confirm validation commands and Playwright expectations still match current production state.
- Update `docs/Future Plan.md` progress snapshot if priorities changed.

---

## 6. Role Separation

Use role names even when the same person or AI agent performs more than one role. If one role self-approves another, record that in the review note or seed-change record.

| Role | Owns | Must produce |
|---|---|---|
| Authoring owner | Drafting or editing lesson/question/item rows. | Draft pack or production patch, rationale, known risks. |
| Human review owner | Content quality, TOEIC realism, explanations, distractor plausibility, warning-debt decision. | Human review note or wave retrospective. |
| Release validation owner | Seed sync, release gate, duplicate/audit validation, docs/test consistency. | Validation command results and seed-change record for production waves. |

The authoring owner should not silently approve production content without a separate review note. For small maintenance tasks, the separation can be documented rather than assigned to separate people.

---

## 7. Definition Of Done

### Production wave

A production wave is done only when all are true:

- lesson rows, question rows, review rows, and referenced item rows are complete;
- production seed version is synchronized in all three required files;
- seed-change record is complete under `docs/seed-changes/`;
- human review note covers content, semantic control, error codes, distractors, answer distribution, explanations, progression, and review pressure;
- export-review follow-up is recorded or explicitly blocked by `insufficient_data`;
- `node scripts/validate-vocab-data.js`, `node scripts/audit-quality-full.js`, `node scripts/audit-duplicates.js`, docs checks, and required Playwright/release-gate checks pass;
- `TO_AI.md`, `docs/Future Plan.md`, and other current-truth docs are updated when facts changed;
- rollback path is documented.

### Draft or rebuild wave

A draft or rebuild wave is done only when:

- it is explicitly marked `production_impact: none` where the artifact format supports it;
- it does not change `data/vocab/**` or seed version;
- it has a targeted verifier or manual review note;
- it states whether it is a promotion candidate or only a reference artifact.

### Governance/documentation task

A governance task is done only when:

- its active doc is created or updated;
- `docs/Future Plan.md` maps and records the task;
- affected current-truth docs are checked;
- `npm run test:docs` passes when current-fact docs changed.

---

## 8. Promotion Candidate Criteria

A file or pack is a promotion candidate only when all of these are true:

- it has complete lesson/question/review wiring for the intended scope;
- every `target_item_id` exists or has a planned production item change;
- it has zero known blocking audit issues;
- duplicate stem risk has been checked;
- it states target production files and seed-version impact;
- it has human-review readiness, not only machine-generated rows;
- it can be promoted without touching Program A or activating V4 accidentally.

An artifact is reference-only when any of these are true:

- it is a blueprint, shell, template, or partial sample;
- it has placeholder IDs, missing item metadata, or unknown target production files;
- it is under archive or `tmp/`;
- it has not passed a targeted verifier;
- it exists only to inform future authoring patterns.

---

## 9. Priority Labels

Use these labels consistently in future blocks and blueprint updates.

| Priority | Meaning | Examples |
|---|---|---|
| `P0` | Blocks safe production expansion or protects current production truth. Must be resolved before the next relevant production wave. | seed sync, release gate failure, V4 leakage, duplicate stems, current-truth count drift |
| `P1` | Directly improves the next 1-2 waves but can be sequenced after current blockers. | candidate selection, human review operations, inventory refresh, next-wave smoke checklist |
| `P2` | Useful scale-up work that should follow after the next wave path is stable. | monthly reporting refinement, non-blocking UI polish, additional authoring analytics |
| `P3` | Backlog work with no near-term release dependency. | convenience reports, optional visual polish, larger automation ideas |
| `P4` | Future-stage activation or long-horizon expansion. | V4 activation, V5/V6 content expansion |

If a task changes production data, it cannot be lower than `P1`; if it can break the app or seed truth, it is `P0`.

---

## 10. Production Wave Rate Limit

Until production has at least 10 runnable lessons and two consecutive production releases pass the full gate without new blocking issues, the maximum release rate is:

- at most 2 production seed waves per calendar month;
- at most 3 core lessons per production wave;
- emergency content hotfixes are allowed outside the cap, but they still require seed sync, seed-change record, validation, and rollback notes.

Draft-only verifier runs are not capped, but they cannot be described as production-ready until they pass the production release gate after merge.

---

## 11. T001-T010 Verification

Verification date: 2026-05-20

| Task | Verification result | Evidence |
|---|---|---|
| `T001` | pass | Section 1 fixes the 90-day objective as controlled production expansion, not draft accumulation. |
| `T002` | pass | Section 2 defines `production`, `draft`, `rebuild`, and `archive`, plus excluded evidence folders. |
| `T003` | pass | Section 3 makes `docs/Future Plan.md` the required active mapping target. |
| `T004` | pass | Section 4 defines naming for lessons, draft packs, export reviews, retrospectives, seed versions, seed records, and inventory snapshots. |
| `T005` | pass | Section 5 defines the weekly governance checkpoint. |
| `T006` | pass | Section 6 defines authoring, human review, and release validation roles. |
| `T007` | pass | Section 7 defines done criteria for production, draft/rebuild, and governance work. |
| `T008` | pass | Section 8 separates promotion candidates from reference-only artifacts. |
| `T009` | pass | Section 9 defines `P0` through `P4` priority labels. |
| `T010` | pass | Section 10 caps production seed waves at 2 per calendar month and 3 core lessons per wave until the documented release maturity threshold is met. |

Optimization made after verification:

- Added this verification table so future reviewers can re-check `T001-T010` without re-inferring coverage from prose.
- Kept all governance decisions documentation-only; no production seed files or seed versions changed.
