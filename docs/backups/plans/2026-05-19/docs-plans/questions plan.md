# Questions Rebuild Plan

Generated: 2026-05-18
Last updated: 2026-05-18 (Phase 10 first authored slice verified and optimized — 17 automated checks pass)

Status: active planning and draft implementation. This document does not modify production seed data.

## Tracker Summary

| Field | Value |
| --- | --- |
| Current phase | Phase 10 - Question Authoring, Validation, And Release |
| Current active steps | Step 49 |
| Current checkpoint | Phase 10 Step 46-48 are complete and optimized for the first authored slice: `V3-W1-01` now has 24 authored draft rows and 7 authored item examples, first-slice metadata is stamped `phase10_review_passed`, draft artifact notes reflect the mixed authored state, and [question-rebuild-phase10-first-authored-slice.md](question-rebuild-phase10-first-authored-slice.md) records the stricter 17-check verifier pass while production seed files remain unchanged |
| Immediate next target | Step 49 remains a hold: do not start seed-version sync or a V3 production merge until the Phase 7 merge order (`V1 -> V0 -> V2 -> V3`) is explicitly resolved for production work |
| Production impact | None yet; Step 46-48 are draft-only and all outputs remain under drafts/ |

## Tracker Rules

- `done`: a concrete repo artifact or validated planning decision already exists.
- `in_progress`: draft outputs exist, but the step is not yet production-ready or fully expanded.
- `pending`: not started yet.
- Update this file whenever the active step changes, a new artifact lands, or a step moves to `done`.

## Current Draft Outputs

- [../../drafts/collocation-rebuild/phrase_411_inventory.json](../../drafts/collocation-rebuild/phrase_411_inventory.json)
- [../../drafts/collocation-rebuild/wave1_lesson_blueprint.json](../../drafts/collocation-rebuild/wave1_lesson_blueprint.json)
- [../../drafts/collocation-rebuild/wave1_app_lesson_draft.json](../../drafts/collocation-rebuild/wave1_app_lesson_draft.json)
- [../../drafts/collocation-rebuild/wave1_question_plan.json](../../drafts/collocation-rebuild/wave1_question_plan.json)
- [../../drafts/collocation-rebuild/wave1_missing_item_backlog.json](../../drafts/collocation-rebuild/wave1_missing_item_backlog.json)
- [../../drafts/collocation-rebuild/wave1_vocab_items_seed_draft.json](../../drafts/collocation-rebuild/wave1_vocab_items_seed_draft.json)
- [../../drafts/collocation-rebuild/wave1_question_shells.json](../../drafts/collocation-rebuild/wave1_question_shells.json)
- [../../drafts/collocation-rebuild/wave1_phase10_slice_verification.json](../../drafts/collocation-rebuild/wave1_phase10_slice_verification.json)
- [../../drafts/collocation-rebuild/topic_normalization_table.json](../../drafts/collocation-rebuild/topic_normalization_table.json)
- [../../drafts/collocation-rebuild/phrase_family_table.json](../../drafts/collocation-rebuild/phrase_family_table.json)
- [../../drafts/collocation-rebuild/phrase_duplicate_reference.json](../../drafts/collocation-rebuild/phrase_duplicate_reference.json)
- [../../drafts/collocation-rebuild/wave1_difficulty_mixing_policy.json](../../drafts/collocation-rebuild/wave1_difficulty_mixing_policy.json)
- [../../drafts/collocation-rebuild/wave1_reference_bundle_v1.json](../../drafts/collocation-rebuild/wave1_reference_bundle_v1.json)
- [../../drafts/collocation-rebuild/wave1_schema_contracts.json](../../drafts/collocation-rebuild/wave1_schema_contracts.json)
- [../../drafts/collocation-rebuild/wave1_authoring_policy_pack.json](../../drafts/collocation-rebuild/wave1_authoring_policy_pack.json)
- [../../drafts/collocation-rebuild/wave1_sentence_context_bank.json](../../drafts/collocation-rebuild/wave1_sentence_context_bank.json)
- [../../drafts/collocation-rebuild/wave1_distractor_reference_bank.json](../../drafts/collocation-rebuild/wave1_distractor_reference_bank.json)
- [../../drafts/collocation-rebuild/wave1_explanation_reference_bank.json](../../drafts/collocation-rebuild/wave1_explanation_reference_bank.json)
- [../../drafts/v0-v3-rebuild/stage_map_v0_v3.json](../../drafts/v0-v3-rebuild/stage_map_v0_v3.json)
- [../../drafts/v0-v3-rebuild/mixed_review_architecture.json](../../drafts/v0-v3-rebuild/mixed_review_architecture.json)
- [../../drafts/v0-v3-rebuild/master_lesson_manifest.json](../../drafts/v0-v3-rebuild/master_lesson_manifest.json)
- [../../drafts/v4-rebuild/v4_reference_pack.json](../../drafts/v4-rebuild/v4_reference_pack.json)
- [../../drafts/v5-rebuild/v5_reference_pack.json](../../drafts/v5-rebuild/v5_reference_pack.json)
- [../../drafts/v6-rebuild/v6_reference_pack.json](../../drafts/v6-rebuild/v6_reference_pack.json)
- [question-rebuild-phase07-stage-blueprints.md](question-rebuild-phase07-stage-blueprints.md)
- [question-rebuild-phase08-future-reference-packs.md](question-rebuild-phase08-future-reference-packs.md)
- [question-rebuild-phase09-draft-content-generation.md](question-rebuild-phase09-draft-content-generation.md)

## Phase 1 - Governance And Boundaries

| Step | Status | Action | Tracker note |
| --- | --- | --- | --- |
| 1 | done | Freeze scope boundary: Program B only; production rebuild targets V0-V3 first; V4-V6 stay draft/reference only. | Verified against `TO_AI.md` and [../question-creation-spec.md](../question-creation-spec.md). Current production seed is intentionally empty, but the rebuild scope remains V0-V3 before any future V4 activation. |
| 2 | done | Freeze source rule: Background phrase file is an ability signal only, not the sole curriculum source. | Verified in `reference_role: "ability_signal_only"` metadata in the Wave 1 inventory and blueprint. Do not use stale root docs as evidence if they conflict with `TO_AI.md`. |
| 3 | done | Freeze quality policy: use [../question-creation-spec.md](../question-creation-spec.md) as the only question-authoring source of truth. | Verified: the spec defines uniqueness, schema, V4 draft exclusion, seed-version sync, and release-gate expectations. |
| 4 | done | Freeze release gate: [../../scripts/audit-quality-full.js](../../scripts/audit-quality-full.js), [../../scripts/audit-duplicates.js](../../scripts/audit-duplicates.js), [../../scripts/validate-vocab-data.js](../../scripts/validate-vocab-data.js), and `test:all`. | Verified scripts exist. Full production readiness requires the individual audit commands plus `test:all`; `test:all` alone is not a substitute for the explicit audit commands. |
| 5 | done | Establish milestone naming strategy for rebuild phases, seed versions, and result docs. | Policy is frozen below in "Phase 1 Governance Baseline". |

### Phase 1 Governance Baseline

Phase 1 is complete as a planning/governance phase. These rules apply to all later rebuild phases unless a future prompt explicitly updates this plan.

#### Verification Snapshot

Verified on 2026-05-18 from the current Program B workspace.

| Check | Evidence | Result |
| --- | --- | --- |
| Program boundary | `TO_AI.md` names Program B as `C:\Users\Keith\Toeic\toeic-app-Vorb` and Program A as `C:\Users\Keith\toeic-app`. | Pass |
| Current production baseline | `data/vocab/curriculum.json` has seed `toeic_vocab_tracker_c004_full_bank_clear_2026_05_18`, 0 lesson rows, 18 question manifest files, and 0 production question rows. | Pass |
| V4 exclusion | `TO_AI.md` and [../question-creation-spec.md](../question-creation-spec.md) state V4 remains under `drafts/v4/` and is skipped by production audit. | Pass |
| Ability-signal source rule | `drafts/collocation-rebuild/phrase_411_inventory.json` and `wave1_lesson_blueprint.json` both mark `reference_role` as `ability_signal_only`. | Pass |
| Authoring rule source | [../question-creation-spec.md](../question-creation-spec.md) is present and points current counts/priorities back to `TO_AI.md`. | Pass |
| Release-gate tools | `scripts/validate-vocab-data.js`, `scripts/audit-quality-full.js`, `scripts/audit-duplicates.js`, and package test scripts are present. | Pass |
| Draft outputs | Wave 1 inventory, blueprint, lesson draft, question plan, missing item backlog, vocab seed draft, and question shells are present under `drafts/collocation-rebuild/`. | Pass |

Documentation drift note: active root guidance docs describe the current empty production seed (0 lessons / 0 questions). Phase 7 now freezes **target** rebuild totals of 193 lessons and 4,399 unique question rows — use [question-rebuild-phase07-stage-blueprints.md](question-rebuild-phase07-stage-blueprints.md) and [../../drafts/v0-v3-rebuild/stage_map_v0_v3.json](../../drafts/v0-v3-rebuild/stage_map_v0_v3.json) for planning counts, not as proof that production is populated yet.

#### Boundary

- This rebuild belongs to Program B only: `C:\Users\Keith\Toeic\toeic-app-Vorb`.
- Do not modify Program A: `C:\Users\Keith\toeic-app`.
- V4 remains draft-only under `drafts/v4/`; do not move V4 files into `data/vocab/` and do not enable V4 during the V0-V3 rebuild.
- Draft planning artifacts are not production seed data. Nothing under `drafts/` becomes runnable until a production merge step explicitly updates curriculum, question files, seed versions, and validation docs.

#### Source Policy

- `TO_AI.md` is the current project handoff and source of truth for production counts, seed version, and active scope.
- [../question-creation-spec.md](../question-creation-spec.md) is the authoring rulebook for question rows.
- `Background/多益搭配詞全面測試/Phrase_411_by_topic.txt` is an ability-signal and priority reference only. It does not define final lesson wording, final distractors, final explanations, or production readiness.
- Browser Question Bank edits are IndexedDB-local until exported as a patch and applied through the approved source-of-truth workflow.
- If a root or historical document contradicts `TO_AI.md`, treat it as stale unless the contradiction is resolved by a dedicated documentation-alignment task.

#### Milestone Naming

Use stable, grep-friendly names for rebuild milestones:

| Artifact type | Naming rule | Example |
| --- | --- | --- |
| Planning tracker | Keep this master file at `docs/plans/questions plan.md` until a deliberate rename task exists. | `docs/plans/questions plan.md` |
| Phase result note | `docs/plans/question-rebuild-phaseNN-{slug}.md` | `docs/plans/question-rebuild-phase03-reference-inventory.md` |
| Wave draft folder | `drafts/{stage-or-scope}-rebuild/` | `drafts/collocation-rebuild/` |
| Wave draft JSON | `wave{N}_{artifact}.json` | `wave1_question_plan.json` |
| Draft lesson IDs | `V{stage}-W{wave}-{NN}` | `V3-W1-01` |
| Draft core question IDs | `{lesson_id}_Q{NN}` | `V3-W1-01_Q01` |
| Draft review question IDs | `{lesson_id}_R{NN}` | `V3-W1-01_R01` |
| Draft collocation item IDs | `item_coll_{english_slug}` | `item_coll_run_out_of` |
| Production seed version | `toeic_vocab_tracker_c{NNN}_{short_slug}_{YYYY_MM_DD}` | `toeic_vocab_tracker_c005_v3_wave1_seed_2026_05_18` |
| Release/result doc | `docs/question-rebuild-{scope}-{result_slug}.md` | `docs/question-rebuild-v3-wave1-release.md` |

Production lesson ID and file-splitting policy is not frozen in Phase 1. That remains Step 40. Until Step 40 is done, keep `V3-W1-*` as draft IDs and do not merge them into `data/vocab/`.

#### Seed Version Rule

- Draft-only work does not bump seed version.
- Any production curriculum, question, or vocab item merge must bump the same new seed version in exactly:
  - [../../data/vocab/curriculum.json](../../data/vocab/curriculum.json)
  - [../../js/vocab-db.js](../../js/vocab-db.js)
  - [../../tests/helpers/seed-idb.ts](../../tests/helpers/seed-idb.ts)
- The same production merge must update `TO_AI.md` with current counts, seed version, and validation result.

#### Release Gate

Before a production merge is considered ready, run:

```powershell
node scripts/validate-vocab-data.js
node scripts/audit-quality-full.js
node scripts/audit-duplicates.js
npm run test:scoring
npm run test:audit
npm run test:patch
npx playwright test
npm run test:all
```

Draft-only planning may use narrower checks, but it must never be described as production-ready until the release gate passes after the merge.

For draft-only work, at minimum verify that production remains untouched by running the read-only data checks:

```powershell
node scripts/validate-vocab-data.js
node scripts/audit-quality-full.js
node scripts/audit-duplicates.js
```

## Phase 2 - Baseline Inspection

| Step | Status | Action | Tracker note |
| --- | --- | --- | --- |
| 6 | done | Inspect current production empty-bank state. | Verified: seed `toeic_vocab_tracker_c004_full_bank_clear_2026_05_18`, 0 lesson rows, 18 manifest question files, 0 production question rows, 494 vocab items. |
| 7 | done | Inspect reusable seed/reference inputs. | Verified: [../../data/vocab/vocab_items.json](../../data/vocab/vocab_items.json) has 494 items; [../../data/vocab/grammar_links.json](../../data/vocab/grammar_links.json) has 14 grammar-link entries; Background phrase source and Wave 1 draft artifacts are available. |
| 8 | done | Inspect runtime dependencies so the rebuild reuses the current app rather than rewriting it. | Verified: [../../js/vocab-db.js](../../js/vocab-db.js) uses manifest-driven seeding; [../../js/state.js](../../js/state.js) loads current stores; [../../js/views/lesson.js](../../js/views/lesson.js) supports normal, review, stage-gate, and speed runtimes; export and Question Bank patch workflow exist. |
| 9 | done | Inspect existing generation scripts and reusable patterns. | Verified rebuild chain: [../../scripts/build-collocation-rebuild-plan.js](../../scripts/build-collocation-rebuild-plan.js) -> [../../scripts/map-collocation-blueprint-to-app-schema.js](../../scripts/map-collocation-blueprint-to-app-schema.js) -> [../../scripts/generate-collocation-wave1-draft-bank.js](../../scripts/generate-collocation-wave1-draft-bank.js). Historical content scripts remain reference-only unless explicitly reused. |
| 10 | done | Establish the overall control list across content, reference, validation, docs, and seed. | Verified: this 50-step plan is the master control list. Draft authoring may continue, but production merge must not skip unresolved Phase 3-8 policy work. |

### Phase 2 Baseline Inspection

Phase 2 is complete as a baseline-inspection phase. It describes what exists now, not what is production-ready.

Re-verified on 2026-05-18 against the current Program B workspace. No production data change is part of Phase 2.

#### Production Baseline

| Area | Current verified value |
| --- | ---: |
| Seed version | `toeic_vocab_tracker_c004_full_bank_clear_2026_05_18` |
| Curriculum lesson rows | 0 |
| Production question rows | 0 |
| Question files in manifest | 18 |
| Vocab item rows | 494 |
| Grammar link entries | 14 |
| Production stages listed | V0, V1, V2, V3 |
| Planned stages listed | V4, V5, V6 |

The production manifest still lists V0-V3 question files, but every listed file is empty. This is intentional after the full-bank clear. Rebuild work must therefore treat existing production questions as absent, not as a partially reusable live bank.

Stage metadata note: V0-V3 currently have `status: "available"` in `curriculum.json`, but each has `total_lessons: 0` and there are no lesson rows. "Available" here does not mean runnable content exists.

#### Consistency Checks

| Check | Verified detail | Planning implication |
| --- | --- | --- |
| Empty production bank | All 18 manifest question files contain 0 rows. | New production content must provide curriculum rows and question rows; it cannot depend on existing production question coverage. |
| Stage metadata | V0-V3 are listed as available but have 0 total lessons; V4-V6 are planned. | Do not infer runnable lessons from stage status alone. |
| Wave 1 item mapping | 100 Wave 1 targets are still missing/unresolved in the draft backlog. | Step 45 must turn draft item seed rows into reviewable merge candidates before production use, but only after Phase 7/8 sequencing decisions are clear. |
| Wave 1 question shells | 384 draft shell rows exist and are still TODO shells. | Step 46 must author real question text, options, explanations, and examples before editorial review, but it should not outrun Phase 7/8 and Step 40. |
| Runtime reuse | Current app can load manifest-seeded lessons/questions and existing stores. | No runtime rewrite is required for the rebuild; content should fit existing schema contracts. |
| Production merge gate | Step 40 has not frozen production lesson IDs, file splitting, or manifest placement. | Keep `V3-W1-*` draft IDs out of `data/vocab/` until Step 40 is completed. |

#### Reusable Inputs

| Input | Role | Current finding |
| --- | --- | --- |
| [../../data/vocab/vocab_items.json](../../data/vocab/vocab_items.json) | Existing item metadata and possible matching source | 494 rows; usable as reference, but Wave 1 collocation targets are currently unresolved/missing in the draft mapping. |
| [../../data/vocab/grammar_links.json](../../data/vocab/grammar_links.json) | Optional grammar metadata | 14 entries; useful for grammar-linked question types, but Wave 1 collocation shells mostly use `grammar_link_id: null`. |
| `Background/多益搭配詞全面測試/Phrase_411_by_topic.txt` | Ability-signal source | 411 phrase rows, 88 known, 323 unknown; not final curriculum content. |
| [../../drafts/collocation-rebuild/phrase_411_inventory.json](../../drafts/collocation-rebuild/phrase_411_inventory.json) | Parsed reference inventory | `reference_role: ability_signal_only`; duplicate phrase rows: 0. |
| [../../drafts/collocation-rebuild/wave1_lesson_blueprint.json](../../drafts/collocation-rebuild/wave1_lesson_blueprint.json) | Wave 1 target grouping | 16 draft lessons across 5 topics and 100 phrase targets. |
| [../../drafts/collocation-rebuild/wave1_app_lesson_draft.json](../../drafts/collocation-rebuild/wave1_app_lesson_draft.json) | Draft curriculum-shaped rows | Draft IDs `V3-W1-01` through `V3-W1-16`; not production IDs yet. |
| [../../drafts/collocation-rebuild/wave1_question_plan.json](../../drafts/collocation-rebuild/wave1_question_plan.json) | Question slot plan | 320 core slots and 64 review slots. |
| [../../drafts/collocation-rebuild/wave1_missing_item_backlog.json](../../drafts/collocation-rebuild/wave1_missing_item_backlog.json) | Missing item worklist | 100 missing item candidates; 0 ambiguous phrase matches. |
| [../../drafts/collocation-rebuild/wave1_vocab_items_seed_draft.json](../../drafts/collocation-rebuild/wave1_vocab_items_seed_draft.json) | Draft item seed rows | 100 draft item rows; not merged into production. |
| [../../drafts/collocation-rebuild/wave1_question_shells.json](../../drafts/collocation-rebuild/wave1_question_shells.json) | Draft question shells | 384 shell rows: 124 collocation, 100 Part 5, 96 Part 6, 64 review. All still have TODO wording. |

#### Runtime Dependency Map

| Runtime area | Existing dependency | Rebuild implication |
| --- | --- | --- |
| Seeding | `js/vocab-db.js -> seedIfNeeded()` loads `curriculum.question_files` and writes lessons/questions/items to IndexedDB. | Production merge must update `curriculum.json`, the relevant question files, `vocab_items.json` if needed, and the three seed-version locations. |
| Lesson loading | `getQuestionsForLesson(lesson)` resolves `review_question_ids` plus `question_ids` from the `questions` store. | Lesson rows must reference valid question IDs; missing IDs silently reduce runtime coverage, so validation must catch them before merge. |
| App state | `js/state.js -> loadData()` loads curriculum, lessons, questions, question edits, vocab items, attempts, sessions, error logs, and review queue. | New content should fit the existing stores; no backend or schema rewrite is needed for authored question rows. |
| Lesson runtime | `js/views/lesson.js` supports normal lesson mode, review mode, stage-seal soft warning, and speed-drill mode. | Rebuild should reuse current lesson types instead of creating a new runtime unless a future phase explicitly scopes it. |
| Export | `js/views/export.js -> buildExportFiles()` exports attempts, sessions, mastery, review queue, error/speed/stage analytics, and stage seal readiness. | New content will automatically appear in exports after production seed and learner attempts exist. |
| Question Bank | `js/views/bank.js` tracks local edits in `question_edits` and exports patch files. | Browser edits must remain review artifacts; production seed changes should go through source JSON and validation. |

#### Generation Script Map

| Script | Current role | Output |
| --- | --- | --- |
| [../../scripts/build-collocation-rebuild-plan.js](../../scripts/build-collocation-rebuild-plan.js) | Parse Background phrase source, mark known/unknown, choose Wave 1 topics, split phrases into draft lessons. | `phrase_411_inventory.json`, `wave1_lesson_blueprint.json`, `drafts/collocation-rebuild/README.md` |
| [../../scripts/map-collocation-blueprint-to-app-schema.js](../../scripts/map-collocation-blueprint-to-app-schema.js) | Map blueprint targets to app-shaped lesson rows and question slots. | `wave1_app_lesson_draft.json`, `wave1_question_plan.json`, `wave1_missing_item_backlog.json` |
| [../../scripts/generate-collocation-wave1-draft-bank.js](../../scripts/generate-collocation-wave1-draft-bank.js) | Generate draft item seed rows and TODO question shells from the lesson/question plan. | `wave1_vocab_items_seed_draft.json`, `wave1_question_shells.json` |
| [../../scripts/validate-vocab-data.js](../../scripts/validate-vocab-data.js) | Production structure validation. | Read-only validation result for current production seed. |
| [../../scripts/audit-quality-full.js](../../scripts/audit-quality-full.js) | Production quality audit, manifest-driven, V4 draft skipped by default. | Blocking/warning audit output. |
| [../../scripts/audit-duplicates.js](../../scripts/audit-duplicates.js) | Production duplicate stem audit. | Duplicate stem count. |

Historical expansion and cleanup scripts remain useful as examples, but they should not be run or reused as production writers unless a future task explicitly scopes that work.

#### Phase 2 Conclusions

- The app runtime is reusable. No app rewrite, backend, login, cloud sync, or runtime AI generation is needed for the rebuild.
- The current production bank is empty, so the next authored slice must bring its own lesson rows, vocab item rows where missing, and question rows.
- Wave 1 is draft-only and collocation-first. Phase 7 confirms it maps to production IDs `V3-A-121` through `V3-B-136` (16 lessons). It is not production-ready until Step 40 ID table freeze and Phase 10 merge gates pass.
- The first concrete content bottleneck is not script generation; it is authoring real questions and examples to replace TODO shells.
- Before any production merge, Step 40 must freeze production lesson IDs, file-splitting, and manifest placement.

#### Phase 2 Optimization Decisions

- Keep generation outputs under `drafts/collocation-rebuild/` until a dedicated production merge step.
- Treat `wave1_question_shells.json` as an authoring queue, not as importable question data.
- Use the existing app schema and stores; do not create a second question schema for the rebuild.
- Continue draft authoring work in small slices, starting with `V3-W1-01` and `V3-W1-02`.
- Do not run historical expansion/cleanup scripts as writers unless a future prompt explicitly scopes them.
- Do not update seed version during draft-only Phase 2 work.

## Phase 3 - Reference Inventory

| Step | Status | Action | Tracker note |
| --- | --- | --- | --- |
| 11 | done | Rebuild the canonical ability-reference inventory from Background phrase data. | [../../drafts/collocation-rebuild/phrase_411_inventory.json](../../drafts/collocation-rebuild/phrase_411_inventory.json) generated. |
| 12 | done | Mark `會/不會` as reference-only ability status. | Inventory and README now label the source as ability-signal only. |
| 13 | done | Build a topic normalization table. | [../../drafts/collocation-rebuild/topic_normalization_table.json](../../drafts/collocation-rebuild/topic_normalization_table.json) generated: 29 topics, 5 Wave 1 topics, 1 zero-entry topic. |
| 14 | done | Build a phrase-family list for near-related collocations and variants. | [../../drafts/collocation-rebuild/phrase_family_table.json](../../drafts/collocation-rebuild/phrase_family_table.json) generated: 83 same-head families covering 268 reference rows. |
| 15 | done | Build duplicate and near-duplicate reference tables. | [../../drafts/collocation-rebuild/phrase_duplicate_reference.json](../../drafts/collocation-rebuild/phrase_duplicate_reference.json) generated: 0 exact duplicate groups and 341 near/confusable reference pairs. |

### Phase 3 Reference Inventory

Phase 3 is complete as a reference-inventory phase. It adds planning references only; no production seed data is changed.

Generated by:

- [../../scripts/build-collocation-reference-tables.js](../../scripts/build-collocation-reference-tables.js)

#### Phase 3 Outputs

| Artifact | Purpose | Current summary |
| --- | --- | --- |
| [../../drafts/collocation-rebuild/topic_normalization_table.json](../../drafts/collocation-rebuild/topic_normalization_table.json) | Normalizes Background topic labels into stable `topic_XX` IDs for planning and cross-artifact reference. | 29 topics; 5 Wave 1 topics; 1 zero-entry topic. |
| [../../drafts/collocation-rebuild/phrase_family_table.json](../../drafts/collocation-rebuild/phrase_family_table.json) | Groups near-related collocations by first English token for contrast and distractor planning. | 83 same-head families; 268 reference rows covered; largest family size 9. |
| [../../drafts/collocation-rebuild/phrase_duplicate_reference.json](../../drafts/collocation-rebuild/phrase_duplicate_reference.json) | Lists exact duplicates and near/confusable phrase pairs for manual review before authoring. | 0 exact duplicate groups; 341 near/confusable pairs. |

#### Phase 3 Usage Rules

- These files are reference-only and keep `reference_role: "ability_signal_only"`.
- Topic IDs normalize planning labels only. They do not define production stage IDs, lesson IDs, or final curriculum order.
- Phrase families are contrast candidates, not automatic distractor sets.
- Near/confusable pairs are not automatically errors. Only exact duplicate groups are blocking by default.
- Any same-head or near pair used as a distractor must pass manual ambiguity review before authoring.
- Do not import these reference tables into `data/vocab/` unless a future production merge task explicitly requires and validates it.

#### Phase 3 Verification And Optimization

Re-verified on 2026-05-18 from the generated JSON artifacts and source inventory.

| Check | Result |
| --- | --- |
| Topic table consistency | 29 topic rows match `topic_count`; 5 Wave 1 topics; 1 zero-entry topic. |
| Phrase-family consistency | 83 families; 268 member rows; 0 missing topic IDs. |
| Duplicate reference consistency | 0 exact duplicate groups; 341 near/confusable pairs. |
| Relation counts | 291 same-head particle contrasts; 43 spelling/surface-close pairs; 7 prefix extensions. |
| Reference role | All Phase 3 outputs use `ability_signal_only`. |

Optimization note: `spelling_close` is used as a surface-confusability flag based on normalized edit distance. It does not mean the pair is a typo, true duplicate, or automatic blocker.

#### Phase 3 Findings

- The Background phrase source has no exact duplicate phrase groups after normalization.
- The broadest same-head families include common phrasal-verb heads such as `come`, `take`, `break`, `go`, `put`, `keep`, `look`, and `turn`.
- Wave 1 authoring should use phrase families to avoid teaching visually similar phrasal verbs in a way that creates answer ambiguity.
- The near/confusable pair table is intentionally conservative. It should guide human review, not block draft authoring by itself.
- Step 45 and Step 46 remain the later content bottlenecks: item seed review and real question authoring after Phase 7/8 sequencing and Step 40 manifest/file-split decisions are frozen.

## Phase 4 - Item Mapping And Priority

| Step | Status | Action | Tracker note |
| --- | --- | --- | --- |
| 16 | done | Map blueprint items to existing `vocab_items` rows. | Encoded in [../../scripts/map-collocation-blueprint-to-app-schema.js](../../scripts/map-collocation-blueprint-to-app-schema.js). |
| 17 | done | Build a missing-item backlog for unresolved targets. | [../../drafts/collocation-rebuild/wave1_missing_item_backlog.json](../../drafts/collocation-rebuild/wave1_missing_item_backlog.json) generated. |
| 18 | done | Build the topic priority matrix for Wave 1. | Priority order is encoded in the collocation rebuild plan and blueprint. |
| 19 | done | Define the difficulty mixing policy for lessons and question slots. | [../../drafts/collocation-rebuild/wave1_difficulty_mixing_policy.json](../../drafts/collocation-rebuild/wave1_difficulty_mixing_policy.json) generated: 100 targets, 384 question slots, C/B targets prioritized for reinforcement and review pressure. |
| 20 | done | Publish reference bundle v1 as the shared basis for later generation. | [../../drafts/collocation-rebuild/wave1_reference_bundle_v1.json](../../drafts/collocation-rebuild/wave1_reference_bundle_v1.json) generated as the Wave 1 shared draft bundle; all-stage unification remains Phase 7/8. |

### Phase 4 Item Mapping And Priority

Phase 4 is complete as a draft-only item mapping, priority, and difficulty-policy phase. It does not change production seed data.

Generated by:

- [../../scripts/build-collocation-phase4-bundle.js](../../scripts/build-collocation-phase4-bundle.js)

#### Phase 4 Outputs

| Artifact | Purpose | Current summary |
| --- | --- | --- |
| [../../drafts/collocation-rebuild/wave1_difficulty_mixing_policy.json](../../drafts/collocation-rebuild/wave1_difficulty_mixing_policy.json) | Freezes the Wave 1 target difficulty and question-slot mixing policy for authoring. | 16 lessons, 100 targets, 384 slots, 5 lessons with C items, 3 all-A lessons; consistency checks passed. |
| [../../drafts/collocation-rebuild/wave1_reference_bundle_v1.json](../../drafts/collocation-rebuild/wave1_reference_bundle_v1.json) | Bundles Phase 1-4 Wave 1 references, source file hashes, topic priority, mapping summary, blockers, and consistency checks. | Draft-only, `production_ready: false`, production merge not allowed; consistency checks passed. |

#### Item Mapping Summary

| Area | Current value |
| --- | ---: |
| Wave 1 target items | 100 |
| Existing production `vocab_items` matches | 0 |
| Missing item backlog rows | 100 |
| Ambiguous phrase matches | 0 |
| Draft vocab seed rows | 100 |

All Wave 1 target items currently depend on [../../drafts/collocation-rebuild/wave1_vocab_items_seed_draft.json](../../drafts/collocation-rebuild/wave1_vocab_items_seed_draft.json). These rows are draft seed candidates only; they require manual review before any production `vocab_items.json` merge.

#### Topic Priority Matrix

| Priority | Topic | Lessons | Target items | Difficulty mix |
| ---: | --- | ---: | ---: | --- |
| 1 | 辦公室 | 3 | 21 | A=12, B=8, C=1 |
| 2 | 文書作業 | 4 | 27 | A=17, B=7, C=3 |
| 3 | 商務會議 | 3 | 17 | A=0, B=14, C=3 |
| 4 | 業務協調 | 4 | 26 | A=5, B=16, C=5 |
| 5 | 人事與組織 | 2 | 9 | A=2, B=6, C=1 |

Priority comes from the Wave 1 blueprint. It is a draft authoring order, not a final production stage order.

#### Difficulty And Slot Policy

| Policy area | Frozen Phase 4 rule |
| --- | --- |
| Difficulty meaning | A = foundation / high-frequency, B = intermediate TOEIC workplace, C = advanced / abstract / easily confused. |
| Lesson mix | Preserve topic order; do not force cross-topic reshuffling just to balance A/B/C. |
| Target minimum | Each target gets at least one `collocation` slot and one `part5_sentence_completion` slot. |
| Reinforcement | Extra slots use `part6_context_choice` and `collocation`, prioritizing C then B then A targets. |
| Review pressure | Review slots prioritize C then B then A targets, but remain draft authoring pressure, not final mixed-review architecture. |
| Ambiguity rule | Same-head and surface-close collocations need manual ambiguity review before becoming distractors. |

Current slot counts:

| Slot area | Count |
| --- | ---: |
| Core slots | 320 |
| Review slots | 64 |
| Total question shells | 384 |
| `collocation` shells | 124 |
| `part5_sentence_completion` shells | 100 |
| `part6_context_choice` shells | 96 |
| `review_question` shells | 64 |

Current slot difficulty counts: A=121, B=203, C=60.

#### Phase 4 Usage Rules

- Use `wave1_reference_bundle_v1.json` as the shared Wave 1 input for later schema checks and authoring.
- Do not import the bundle, difficulty policy, draft seed rows, or TODO shells into `data/vocab/`.
- Do not bump seed version for Phase 4 because this is draft-only work.
- Do not treat `review_question` slots as the final mixed-review architecture; Step 39 still needs to define that.
- Step 40 must still freeze production lesson IDs, file splitting, and manifest placement before any production merge.

#### Phase 4 Verification

Verified on 2026-05-18:

| Check | Result |
| --- | --- |
| Difficulty policy sanity | Passed: `ability_signal_only`, 16 lessons, 100 targets, 384 shells. |
| Reference bundle sanity | Passed: `draft_only`, `production_merge_allowed: false`, `production_ready: false`. |
| Mapping consistency | Passed: 100 missing items, 0 ambiguous matches, 100 draft seed rows. |
| Question slot consistency | Passed: 320 core slots + 64 review slots = 384 TODO shells. |
| Reference duplicate status | Passed: 0 exact duplicate groups; 341 near/confusable pairs remain manual-review references. |
| Production impact | None; only draft/reference artifacts and this plan were updated. |

#### Phase 4 Optimization

Re-verified and optimized on 2026-05-18:

- [../../scripts/build-collocation-phase4-bundle.js](../../scripts/build-collocation-phase4-bundle.js) now writes `consistency_checks` into both Phase 4 JSON outputs.
- The builder refuses to publish `wave1_reference_bundle_v1.json` if consistency checks fail.
- Embedded checks cover reference-only status, lesson counts, target counts, missing item counts, question slot counts, production-readiness flags, and exact duplicate status.
- This improves future handoff safety because agents can inspect the bundle itself instead of relying on an external one-off validation snippet.

## Phase 5 - Schema Contracts

| Step | Status | Action | Tracker note |
| --- | --- | --- | --- |
| 21 | done | Reconfirm the curriculum schema shape. | [../../drafts/collocation-rebuild/wave1_schema_contracts.json](../../drafts/collocation-rebuild/wave1_schema_contracts.json) records required curriculum root fields, manifest behavior, and seed-version sync rule. |
| 22 | done | Reconfirm the question schema shape. | Schema contract records required question fields, option keys, valid types, V3 Wave 1 allowed types, and production authoring blockers. |
| 23 | done | Reconfirm the `vocab_item` schema shape. | Schema contract records required item fields and separates structural readiness from blank draft examples. |
| 24 | done | Define the lesson object contract for the rebuild. | Schema contract verifies 16 draft lessons, required lesson fields, valid shell references, and draft ID policy. |
| 25 | done | Define question quota policy per lesson. | Schema contract verifies 20 core + 4 review draft quota per lesson, 320 core slots, and 64 review slots. |

### Phase 5 Schema Contracts

Phase 5 is complete as a schema-contract phase. It makes the Wave 1 draft structurally checkable, but it does not make the content production-ready.

Generated by:

- [../../scripts/build-collocation-phase5-schema-contracts.js](../../scripts/build-collocation-phase5-schema-contracts.js)

#### Phase 5 Output

| Artifact | Purpose | Current summary |
| --- | --- | --- |
| [../../drafts/collocation-rebuild/wave1_schema_contracts.json](../../drafts/collocation-rebuild/wave1_schema_contracts.json) | Machine-readable schema contract for curriculum root, lesson rows, question rows, vocab item rows, runtime dependencies, Wave 1 quota, readiness metadata, and blocking authoring gaps. | `schema_ready: true`, `content_ready: false`, `authoring_ready: false`, `production_ready: false`, `production_merge_allowed: false`; 7 consistency checks passed. |

#### Contract Summary

| Contract area | Frozen Phase 5 rule |
| --- | --- |
| Curriculum root | Must include `course_id`, `course_name`, `schema_version`, `seed_version`, `generated_at`, `default_user`, `stages`, `lessons`, and `question_files`. |
| Production manifest | Only files listed in `curriculum.question_files` are production question files. Draft files stay outside `data/vocab/`. |
| Lesson rows | Wave 1 draft lesson rows require IDs, stage metadata, lesson type, topic, target items, `question_ids`, `review_question_ids`, thresholds, and status. |
| Question rows | Required fields follow [../question-creation-spec.md](../question-creation-spec.md): IDs, stage/type/skill/subskill, text, A-D options, answer, explanation, target item, distractor type, difficulty, time, error code, and tags. |
| Vocab item rows | Required fields include item identity, stage/lesson linkage, base word, variants, Chinese meaning, example, contexts, review priority, and mastery defaults. |
| Runtime dependency | `js/vocab-db.js` seeds lessons/questions/items into IndexedDB; `js/views/lesson.js` requires question text, options, correct answer, target item, error code, estimated time, and optional grammar link. |
| Wave 1 quota | 16 draft lessons, each with 20 core question IDs and 4 review question IDs. |

#### Phase 5 Verification

Verified on 2026-05-18:

| Check | Result |
| --- | --- |
| Curriculum shape | Passed: required root fields exist; production currently has 0 lesson rows. |
| Phase 4 bundle status | Passed: reference-only, draft-only, production merge disabled. |
| Lesson contract | Passed: 16 draft lessons satisfy required fields and shell references. |
| Question contract | Passed: 384 draft shells satisfy structural fields, option keys, valid types, and target references. |
| Vocab item contract | Passed: 100 draft item rows contain required structural fields. |
| Quota contract | Passed: every Wave 1 draft lesson has 20 core + 4 review shell IDs. |
| Authoring content status | Expected blocker: 384 question rows are TODO shells and 100 draft item examples are blank. |
| Readiness metadata | Passed: `schema_ready: true`; `content_ready`, `authoring_ready`, `production_ready`, and `production_merge_allowed` are all false. |

#### Phase 5 Usage Rules

- `schema_ready: true` means the draft artifacts satisfy structural contracts only.
- `production_ready: false` remains intentional because no real question text, distractors, explanations, or reviewed item examples exist yet.
- `content_ready: false` and `authoring_ready: false` are intentional until TODO shells, blank examples, and Phase 6 policy gaps are resolved.
- Do not import `wave1_schema_contracts.json` into production data.
- Do not bump seed version for Phase 5.
- Future authoring should use this contract together with [../question-creation-spec.md](../question-creation-spec.md), not as a replacement for the spec.
- Phase 6 must still define semantic sense, distractor bank, explanation rubric, source-of-truth workflow alignment, and doc sync before audit-ready authoring.

#### Phase 5 Optimization

Re-verified and optimized on 2026-05-18:

- [../../scripts/build-collocation-phase5-schema-contracts.js](../../scripts/build-collocation-phase5-schema-contracts.js) now writes a `readiness` block to separate structural readiness from authoring/content/production readiness.
- The same artifact now writes `blocking_authoring_gaps` so future agents can see exactly why production merge is blocked.

Current blockers recorded in [../../drafts/collocation-rebuild/wave1_schema_contracts.json](../../drafts/collocation-rebuild/wave1_schema_contracts.json):

| Blocker | Count | Blocks |
| --- | ---: | --- |
| TODO question shells | 384 / 384 | authoring, content, production |
| Blank draft item examples | 100 / 100 | content, production |
| Open Phase 6 policy gaps | 5 | authoring, production |

This optimization prevents a false-positive handoff where "7 consistency checks passed" is mistaken for "ready to merge". The "Open Phase 6 policy gaps" row records the original Phase 5 artifact state; Phase 6 resolves those policy gaps in [../../drafts/collocation-rebuild/wave1_authoring_policy_pack.json](../../drafts/collocation-rebuild/wave1_authoring_policy_pack.json), but the Phase 5 artifact remains unchanged as a historical schema checkpoint.

## Phase 6 - Rules And Documentation Alignment

| Step | Status | Action | Tracker note |
| --- | --- | --- | --- |
| 26 | done | Define `semantic_sense` and `target_item_id` policy. | [../../drafts/collocation-rebuild/wave1_authoring_policy_pack.json](../../drafts/collocation-rebuild/wave1_authoring_policy_pack.json) defines Wave 1 `target_item_id` rules, direct-definition limits, and `semantic_sense` tag requirements. |
| 27 | done | Define the distractor-bank schema. | Policy pack defines `wave1_distractor_bank_schema_v1`, approval rules, ambiguity review, and phrase-family / near-confusable reference use. |
| 28 | done | Define the explanation rubric for `explanation_zh`. | Policy pack defines Traditional Chinese explanation parts, templates, and fail conditions. |
| 29 | done | Rewrite the source-of-truth workflow doc for JSON, IndexedDB, and exports. | Policy pack references [../question-bank-source-of-truth-workflow.md](../question-bank-source-of-truth-workflow.md) and freezes the draft-to-production flow. |
| 30 | done | Sync the core reference docs to the rebuild model. | Updated [../question-creation-spec.md](../question-creation-spec.md), [../../README.md](../../README.md), [../../AGENTS.md](../../AGENTS.md), and [../../CLAUDE.md](../../CLAUDE.md) to avoid stale active-count claims. |

### Phase 6 Rules And Documentation Alignment

Phase 6 is complete as an authoring-policy and documentation-alignment phase. It does not change production seed data.

Generated by:

- [../../scripts/build-collocation-phase6-authoring-policy.js](../../scripts/build-collocation-phase6-authoring-policy.js)

#### Phase 6 Output

| Artifact | Purpose | Current summary |
| --- | --- | --- |
| [../../drafts/collocation-rebuild/wave1_authoring_policy_pack.json](../../drafts/collocation-rebuild/wave1_authoring_policy_pack.json) | Machine-readable authoring policy pack for Wave 1 semantic/target item rules, distractor schema, explanation rubric, source-of-truth workflow, doc sync rules, validation gate, and next-phase guardrails. | `phase6_policy_ready: true`, `authoring_ready: true`, `content_ready: false`, `production_ready: false`; 5 consistency checks passed. |

#### Phase 6 Policy Summary

| Policy area | Frozen Phase 6 rule |
| --- | --- |
| `target_item_id` | Wave 1 uses one stable `item_coll_{english_slug}` ID per collocation phrase. Every target must exist in production `vocab_items.json` before merge. |
| `semantic_sense` | Wave 1 V3 collocation should avoid direct-definition rows by default. If a direct-definition row is explicitly authored or a surface phrase is split into real meanings, use `semantic_sense:{sense}` and optional `domain_sense:{domain}`. |
| Distractor bank | Candidate rows must track source, role, grammar fit, collocation fit, ambiguity risk, and review status. Same-head and surface-close references require manual ambiguity review. |
| `explanation_zh` | Must use Traditional Chinese, name the collocation/pattern, explain why it fits the business context, and contrast a likely wrong option or trap. |
| Source of truth | Draft authoring stays in `drafts/collocation-rebuild/`; production source remains `data/vocab/` JSON plus seed-version sync. Browser Question Bank edits remain IndexedDB-local until patch-applied. |
| Documentation sync | `TO_AI.md` remains the handoff source of truth. Active docs must not claim 193 lessons / 4,399 active questions while production is cleared. |
| Validation gate | The policy pack now lists required release-gate commands and the exact three seed-version sync locations for any future production seed merge. |
| Next-phase guardrails | The policy pack now says Phase 7 stage blueprints come next; do not merge Wave 1 shells, bump seed version, or use V4 draft data during Phase 6. |

#### Phase 6 Documentation Alignment

Updated active docs:

| File | Alignment made |
| --- | --- |
| [../question-creation-spec.md](../question-creation-spec.md) | Added 2026-05-18 rebuild status, marked V0-V3 stage counts as target/historical, added Wave 1 policy-pack references for explanations, distractors, and prompt rules. |
| [../../README.md](../../README.md) | Updated current production seed metrics to 0 lessons / 0 question rows and seed `toeic_vocab_tracker_c004_full_bank_clear_2026_05_18`. |
| [../../AGENTS.md](../../AGENTS.md) | Updated production question file descriptions to current empty-manifest state, IndexedDB version, and Playwright wording. |
| [../../CLAUDE.md](../../CLAUDE.md) | Same active-doc alignment as `AGENTS.md`. |

#### Phase 6 Verification

Verified on 2026-05-18:

| Check | Result |
| --- | --- |
| Policy pack reference role | Passed: `ability_signal_only`, draft-only, no production merge allowed. |
| Policy sections | Passed: semantic/target item, distractor schema, explanation rubric, source-of-truth workflow, and doc sync are all defined. |
| Readiness flags | Passed: `phase6_policy_ready: true`, `authoring_ready: true`, `content_ready: false`, `production_ready: false`. |
| Content blockers preserved | Passed: 384 TODO question shells and 100 blank draft item examples remain explicit blockers. |
| Stale active-count scan | Passed for updated active docs: no 193 / 4,399 / old seed claims remain in README, AGENTS, CLAUDE, or question spec. |
| Phase 6 regeneration | Passed: `node scripts/build-collocation-phase6-authoring-policy.js` rebuilt the policy pack with 5 passing checks. |
| Validation gate metadata | Passed: policy pack includes production release commands, Phase 6 verification commands, and the three seed-version sync files. |
| Next-phase sequencing | Passed: policy pack points to Phase 7 - Stage Blueprints as the next required phase before production-shaped Wave 1 work. |
| Production data validation | Passed: `node scripts/validate-vocab-data.js` confirms 0 lessons, 0 questions, 18 empty manifest files, and no structural warnings. |
| Full quality audit | Passed: `node scripts/audit-quality-full.js` confirms no core, mixed-review, or V4 production leakage issues; V4 draft remains skipped by default. |
| Duplicate audit | Passed: `node scripts/audit-duplicates.js` confirms duplicate stems = 0 across the production manifest. |
| Scoring tests | Passed: `npm run test:scoring` ran 71 assertions with 0 failures. |
| Full regression | Failed: `npm run test:all` passes the Node/scoring/data/audit/patch steps, then fails in Playwright because several UI/content tests still expect the old 193-lesson / 4,399-question seed and old lesson IDs such as `V1-A-11` and `V1-F-53`. Treat this as a stale Playwright fixture/expectation risk for the empty-bank rebuild, not a Phase 6 policy-pack failure. |

#### Phase 6 Optimization

Re-verified and optimized on 2026-05-18:

- [../../scripts/build-collocation-phase6-authoring-policy.js](../../scripts/build-collocation-phase6-authoring-policy.js) now counts TODO question shells and blank draft item examples directly from the Wave 1 draft files instead of only relying on the Phase 5 summary.
- The generated policy pack now includes `validation_gate` and `next_phase_guardrails` blocks so future work cannot mistake `authoring_ready: true` for production readiness.
- The explanation rubric template for `review_question` now uses Traditional Chinese punctuation consistently.
- This plan now routes the immediate next work back to Phase 7 blueprint decisions, not Step 45/46 content authoring.

#### Phase 6 Regression Caveat

`npm run test:all` is not green on the current empty production seed. The failing Playwright tests still assert historical production data such as `193/193 課顯示中`, `4399` question-bank rows, V2/V3 lesson counts, and direct starts for removed lesson IDs like `V1-A-11` and `V1-F-53`. Before future work can use `test:all` as a clean release gate, update those tests or their fixtures to distinguish:

- current empty production seed behavior;
- draft rebuild artifacts under `drafts/`;
- future production content once Step 40 and the seed merge are complete.

#### Phase 6 Usage Rules

- `authoring_ready: true` means controlled draft authoring can start using the policy pack.
- `content_ready: false` remains intentional until TODO shells are replaced and draft item examples are reviewed.
- `production_ready: false` remains intentional until Phase 7/8 decisions, Step 40 manifest/file split, production merge, seed-version sync, and full validation.
- Do not import the policy pack into `data/vocab/`.
- Do not bump seed version for Phase 6.
- Continue to treat `docs/backups/` as historical only.
- Do not skip Phase 7/8 just because Phase 6 says `authoring_ready: true`.

## Phase 7 - Stage Blueprints

| Step | Status | Action | Tracker note |
| --- | --- | --- | --- |
| 31 | done | Design the full V0-V3 stage map from zero. | Blueprint + stage map published; [../../scripts/verify-phase7-stage-map.js](../../scripts/verify-phase7-stage-map.js) confirms 193 lessons / 4,399 question rows / 18 files. |
| 32 | done | Design the V0 diagnosis blueprint. | Frozen in Phase 7 doc: V0-01, 19 question_ids (12 meaning_choice + 7 format previews) + 12 review_question_ids = 31 rows in questions_v0.json. |
| 33 | done | Design the V1 word-family blueprint. | Frozen in Phase 7 doc: 60 lessons in groups A-F, lesson ID ranges V1-A-11 through V1-F-70, question file assignment, type mix per group, 1,728 total rows. |
| 34 | done | Design the V2 scene-vocabulary blueprint. | Frozen in Phase 7 doc: 50 core lessons V2-A-71 through V2-E-120 in 5 files, 10 mixed_review lessons V2-MR-01 through V2-MR-10, mixed-review source map, 1,200 total rows. |
| 35 | done | Design the V3 collocation-first blueprint. | Frozen in Phase 7 doc: 60 core lessons V3-A-121 through V3-F-180 in 6 files, 12 mixed_review lessons V3-MR-01 through V3-MR-12, Wave 1 maps to V3-A-121 through V3-B-136 (pending Step 40 for exact IDs), 1,440 total rows. |

### Phase 7 Stage Blueprints

Phase 7 is complete and re-verified as a structural-planning phase. It freezes lesson ID numbering, file assignments, question quotas, and stage blueprints for V0-V3. No production seed data was changed.

Generated artifacts:

- [question-rebuild-phase07-stage-blueprints.md](question-rebuild-phase07-stage-blueprints.md) — full narrative blueprint for all four stages
- [../../drafts/v0-v3-rebuild/stage_map_v0_v3.json](../../drafts/v0-v3-rebuild/stage_map_v0_v3.json) — machine-readable stage map (`status: planning_frozen` after verification)
- [../../scripts/verify-phase7-stage-map.js](../../scripts/verify-phase7-stage-map.js) — automated cross-checks against production baseline and Wave 1 drafts

#### Phase 7 Verification And Optimization

Re-verified on 2026-05-18:

```powershell
node scripts/verify-phase7-stage-map.js
node scripts/verify-phase7-stage-map.js --write
node scripts/validate-vocab-data.js
node scripts/audit-quality-full.js
node scripts/audit-duplicates.js
```

| Check | Result |
| --- | --- |
| Embedded stage-map consistency | Passed: 16/16 |
| Automated verifier (`verify-phase7-stage-map.js`) | Passed: 57/57 checks, 0 errors, 1 warning |
| Lesson ID ranges (V0–V3 + MR) | Passed: all `from..to` counts match frozen blueprint |
| Mixed-review source maps | Passed: V2 10×5 sources, V3 12×5 sources |
| Production baseline | Passed: 0 lessons, 0 questions, seed `toeic_vocab_tracker_c004_full_bank_clear_2026_05_18` |
| Wave 1 cross-link | Passed: 16 draft lessons, 384 shells, 20 core + 4 review per lesson |
| Wave 1 → production range | Passed at planning level: `V3-W1-01..16` → `V3-A-121..130` + `V3-B-131..136` |
| Production validation gate | Passed: validate + full audit + duplicates |

Optimization added in this verification pass:

- New repeatable verifier script so Phase 7 totals, lesson ranges, MR source maps, and Wave 1 draft alignment cannot drift silently.
- `stage_map_v0_v3.json` now records `last_verified_at`, `verification.known_gaps`, and `status: planning_frozen` when `--write` succeeds.
- Documented the one open naming gap: Phase 7 freezes `V2-MR-*` / `V3-MR-*`, but [../../scripts/add-mixed-review-lessons.js](../../scripts/add-mixed-review-lessons.js) still emits `V2-MIX-*` / `V3-MIX-*` — Step 39 must reconcile before merge.

#### Wave 1 ↔ V3 Production Mapping (planning baseline)

| Draft lesson IDs | Planned production IDs | Lessons |
| --- | --- | ---: |
| `V3-W1-01` … `V3-W1-10` | `V3-A-121` … `V3-A-130` | 10 |
| `V3-W1-11` … `V3-W1-16` | `V3-B-131` … `V3-B-136` | 6 |

Exact `V3-W1-*` → production ID table remains Step 40 work. Until then, keep draft IDs out of `data/vocab/`.

#### Production Merge Order (from Phase 7)

1. V1 — word-family items already in `vocab_items.json`
2. V0 — diagnostic sampler after V1 items confirmed
3. V2 — scene vocabulary (may need new vocab rows)
4. V3 — collocation (Wave 1 draft items first)

Each stage merge still requires seed-version sync in all three locations and the full release gate.

#### Lesson ID Ranges (frozen)

| Group | Range | Count |
| --- | --- | ---: |
| V0 | V0-01 | 1 |
| V1-A | V1-A-11 to V1-A-20 | 10 |
| V1-B | V1-B-21 to V1-B-28 | 8 |
| V1-C | V1-C-29 to V1-C-36 | 8 |
| V1-D | V1-D-37 to V1-D-44 | 8 |
| V1-E | V1-E-45 to V1-E-52 | 8 |
| V1-F | V1-F-53 to V1-F-70 | 18 |
| V2-A | V2-A-71 to V2-A-80 | 10 |
| V2-B | V2-B-81 to V2-B-90 | 10 |
| V2-C | V2-C-91 to V2-C-100 | 10 |
| V2-D | V2-D-101 to V2-D-110 | 10 |
| V2-E | V2-E-111 to V2-E-120 | 10 |
| V2-MR | V2-MR-01 to V2-MR-10 | 10 |
| V3-A | V3-A-121 to V3-A-130 | 10 |
| V3-B | V3-B-131 to V3-B-140 | 10 |
| V3-C | V3-C-141 to V3-C-150 | 10 |
| V3-D | V3-D-151 to V3-D-160 | 10 |
| V3-E | V3-E-161 to V3-E-170 | 10 |
| V3-F | V3-F-171 to V3-F-180 | 10 |
| V3-MR | V3-MR-01 to V3-MR-12 | 12 |
| **Total** | | **193** |

#### Totals Verified

| Stage | Lessons | Question rows | Files |
| --- | ---: | ---: | ---: |
| V0 | 1 | 31 | 1 |
| V1 | 60 | 1,728 | 6 |
| V2 | 60 | 1,200 | 5 |
| V3 | 72 | 1,440 | 6 |
| **Grand total** | **193** | **4,399** | **18** |

#### Phase 7 Usage Rules

- Lesson IDs and file assignments in this phase are the planning baseline. They must be confirmed by Step 40 before any production merge.
- Re-run `node scripts/verify-phase7-stage-map.js` after any edit to the stage map or Phase 7 blueprint doc.
- Do not bump seed version for Phase 7; this is planning-only work.
- Do not import `stage_map_v0_v3.json` into `data/vocab/`.
- V3 Wave 1 draft IDs (`V3-W1-01` through `V3-W1-16`) map to `V3-A-121` through `V3-B-136` at the group level; per-lesson mapping is frozen in Step 40.
- Phase 8 is complete; use the master manifest and mixed-review architecture as the planning baseline before expanding authored content.
- Canonical mixed-review lesson IDs are now `*-MR-*`; keep `*-MIX-*` only as a legacy alias in archived material.

## Phase 8 - Future Reference Packs

| Step | Status | Action | Tracker note |
| --- | --- | --- | --- |
| 36 | done | Build the V4 reference pack. | [../../drafts/v4-rebuild/v4_reference_pack.json](../../drafts/v4-rebuild/v4_reference_pack.json) generated and verified; profiles the existing V4-A draft slice (5 lessons / 100 questions) inside a 50-lesson planning pack. |
| 37 | done | Build the V5 reference pack. | [../../drafts/v5-rebuild/v5_reference_pack.json](../../drafts/v5-rebuild/v5_reference_pack.json) generated and verified; freezes 50 planned lessons across groups A-E with a false_friend + speed_drill mix. |
| 38 | done | Build the V6 reference pack. | [../../drafts/v6-rebuild/v6_reference_pack.json](../../drafts/v6-rebuild/v6_reference_pack.json) generated and verified; freezes 30 integrated-review lessons, 8 seal tests, and 2 capstones. |
| 39 | done | Design the mixed-review architecture across stages. | [../../drafts/v0-v3-rebuild/mixed_review_architecture.json](../../drafts/v0-v3-rebuild/mixed_review_architecture.json) freezes canonical `*-MR-*` IDs, legacy `*-MIX-*` alias policy, and V2/V3 source maps; [../../scripts/add-mixed-review-lessons.js](../../scripts/add-mixed-review-lessons.js) is aligned. |
| 40 | done | Freeze the master lesson manifest and file-splitting strategy. | [../../drafts/v0-v3-rebuild/master_lesson_manifest.json](../../drafts/v0-v3-rebuild/master_lesson_manifest.json) freezes the 193-lesson / 4,399-row target, Wave 1 `V3-W1-*` → production ID table, and a deduped 11-file `v4_plus_files_planned` list for V4-V6 planning files. |

### Phase 8 Future Reference Packs

Phase 8 is complete as a planning/reference phase. It freezes future-stage reference packs, mixed-review assembly rules, and the master lesson manifest without modifying production seed data.

Artifacts:

- [question-rebuild-phase08-future-reference-packs.md](question-rebuild-phase08-future-reference-packs.md) - full narrative summary for Steps 36-40
- [../../drafts/v4-rebuild/v4_reference_pack.json](../../drafts/v4-rebuild/v4_reference_pack.json) - V4 planning pack with the existing 5-lesson draft slice profiled inside the full 50-lesson range
- [../../drafts/v5-rebuild/v5_reference_pack.json](../../drafts/v5-rebuild/v5_reference_pack.json) - V5 planning pack for false-friend and speed-reflex lessons
- [../../drafts/v6-rebuild/v6_reference_pack.json](../../drafts/v6-rebuild/v6_reference_pack.json) - V6 planning pack for integrated review, seal tests, and capstones
- [../../drafts/v0-v3-rebuild/mixed_review_architecture.json](../../drafts/v0-v3-rebuild/mixed_review_architecture.json) - canonical `*-MR-*` mixed-review architecture and source maps
- [../../drafts/v0-v3-rebuild/master_lesson_manifest.json](../../drafts/v0-v3-rebuild/master_lesson_manifest.json) - frozen Wave 1 production mapping plus manifest file-splitting rules

Verification snapshot:

- `node scripts/verify-phase8.js` passes with 13 of 13 automated checks.
- `master_lesson_manifest.json` now stores `v4_plus_files_planned` as 11 unique file names instead of repeating shared V4 aliases.
- Production curriculum remains empty (`curriculum.lessons.length === 0`); all Phase 8 outputs remain under `drafts/`.

## Phase 9 - Draft Content Generation

| Step | Status | Action | Tracker note |
| --- | --- | --- | --- |
| 41 | done | Extract shared generator helpers into a cleaner reusable layer. | [../../scripts/collocation-rebuild-helpers.js](../../scripts/collocation-rebuild-helpers.js) now centralizes JSON/path/count helpers and is adopted by the core collocation rebuild scripts. |
| 42 | done | Build a sentence/context reference bank. | [../../drafts/collocation-rebuild/wave1_sentence_context_bank.json](../../drafts/collocation-rebuild/wave1_sentence_context_bank.json) generated and verified with 384 authoring prompts across all Wave 1 shells. |
| 43 | done | Build a distractor reference bank. | [../../drafts/collocation-rebuild/wave1_distractor_reference_bank.json](../../drafts/collocation-rebuild/wave1_distractor_reference_bank.json) generated and verified with 100 target rows and 264 reference candidates. |
| 44 | done | Build an explanation reference bank. | [../../drafts/collocation-rebuild/wave1_explanation_reference_bank.json](../../drafts/collocation-rebuild/wave1_explanation_reference_bank.json) generated and verified with 384 explanation templates aligned to the Phase 6 rubric. |
| 45 | done | Rebuild the first draft item seed set before true question authoring. | [../../scripts/generate-collocation-wave1-draft-bank.js](../../scripts/generate-collocation-wave1-draft-bank.js) reran successfully; [../../drafts/collocation-rebuild/wave1_vocab_items_seed_draft.json](../../drafts/collocation-rebuild/wave1_vocab_items_seed_draft.json) remains 100 rows and [../../drafts/collocation-rebuild/wave1_question_shells.json](../../drafts/collocation-rebuild/wave1_question_shells.json) remains 384 rows. |

### Phase 9 Draft Content Generation

Phase 9 is complete as a draft-authoring support phase. It adds a shared helper layer and three new Wave 1 reference banks, then re-validates the first draft seed set without touching production seed data.

Artifacts:

- [question-rebuild-phase09-draft-content-generation.md](question-rebuild-phase09-draft-content-generation.md) - full narrative summary for Steps 41-45
- [../../drafts/collocation-rebuild/wave1_sentence_context_bank.json](../../drafts/collocation-rebuild/wave1_sentence_context_bank.json) - 384 context recipes and authoring prompts for Wave 1 shells
- [../../drafts/collocation-rebuild/wave1_distractor_reference_bank.json](../../drafts/collocation-rebuild/wave1_distractor_reference_bank.json) - 100 target-level distractor pools with 264 reference candidates
- [../../drafts/collocation-rebuild/wave1_explanation_reference_bank.json](../../drafts/collocation-rebuild/wave1_explanation_reference_bank.json) - 384 explanation template previews aligned to Phase 6 rules
- [../../scripts/collocation-rebuild-helpers.js](../../scripts/collocation-rebuild-helpers.js) - shared helper layer used by the collocation rebuild chain

Verification snapshot:

- `node scripts/verify-phase9.js` passes with 16 of 16 automated checks.
- Sentence/context and explanation banks now derive `target_item_count` directly from the current shell set instead of only borrowing an upstream summary count.
- Phase 9 verification now checks exact `question_id` and `target_item_id` set alignment across the shell set and generated banks.
- Wave 1 draft outputs remain stable at 100 vocab seed rows and 384 question shells.
- All Phase 9 outputs remain under `drafts/` and continue to block production merge.

## Phase 10 - Question Authoring, Validation, And Release

| Step | Status | Action | Tracker note |
| --- | --- | --- | --- |
| 46 | done | Generate the first stage slice of lesson/question content. | [../../scripts/apply-phase10-wave1-slice.js](../../scripts/apply-phase10-wave1-slice.js) authors `V3-W1-01`, fills 7 matching vocab rows, stamps reviewed Phase 10 metadata, and refreshes the draft artifact notes to reflect the mixed authored state. |
| 47 | done | Perform lesson-set editorial review. | Recorded in [question-rebuild-phase10-first-authored-slice.md](question-rebuild-phase10-first-authored-slice.md); the first slice passes draft-level editorial review but is still not a production sign-off. |
| 48 | done | Run full validation on authored content. | [../../scripts/verify-phase10-slice.js](../../scripts/verify-phase10-slice.js) now passes 17/17 checks and writes [../../drafts/collocation-rebuild/wave1_phase10_slice_verification.json](../../drafts/collocation-rebuild/wave1_phase10_slice_verification.json), including target mapping, option schema, type-policy, metadata, and artifact-note guards. |
| 49 | pending | Sync seed version and handoff docs for a production merge. | Still blocked on purpose: production files under `data/vocab/` remain unchanged, and Phase 7 merge order still puts V3 after V1 / V0 / V2. |
| 50 | pending | Run release smoke tests and freeze the release bundle. | Still blocked because nothing from Phase 10 has been promoted into the production seed yet. |

## Immediate Next Gate

- Phase 10 Step 46-48 are complete for the first draft slice, documented in [question-rebuild-phase10-first-authored-slice.md](question-rebuild-phase10-first-authored-slice.md).
- Keep [question-rebuild-phase08-future-reference-packs.md](question-rebuild-phase08-future-reference-packs.md) and [../../drafts/v0-v3-rebuild/master_lesson_manifest.json](../../drafts/v0-v3-rebuild/master_lesson_manifest.json) as the ID/file-splitting baseline; the authored lesson is still draft ID `V3-W1-01`, not a production lesson row.
- Do not bump `seed_version`, edit `TO_AI.md`, or touch `data/vocab/` for this slice until the repo explicitly resolves whether Phase 10 may bypass the frozen production merge order from Phase 7.
- If future work continues draft authoring instead of production merge, use the first authored slice plus the Phase 9 banks as the template for `V3-W1-02` onward.

## Update Checklist

- Update `Current active steps` whenever work moves to a new numbered step.
- Add new draft or production outputs to `Current Draft Outputs`.
- Move a step to `done` only when a concrete artifact or verified decision exists in the repo.
- If a production merge happens, update this file together with seed-version docs and handoff files.
