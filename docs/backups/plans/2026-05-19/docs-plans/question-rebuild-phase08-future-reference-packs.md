# Question Rebuild Phase 08 - Future Reference Packs

Generated: 2026-05-18
Last verified: 2026-05-18 (`node scripts/verify-phase8.js --write`)
Status: done - all five steps (36-40) resolved in this document.

This document is the Phase 8 deliverable for the V0-V3 rebuild plan ([questions plan.md](questions%20plan.md)). It freezes the future-stage reference packs, the cross-stage mixed-review architecture, and the master lesson manifest so later draft authoring and production merge work can use stable planning IDs and file rules.

**Production impact: none.** This document is a planning artifact. No question rows, lesson rows, seed versions, or production manifests are changed here.

Machine-readable companions:

- [../../drafts/v4-rebuild/v4_reference_pack.json](../../drafts/v4-rebuild/v4_reference_pack.json)
- [../../drafts/v5-rebuild/v5_reference_pack.json](../../drafts/v5-rebuild/v5_reference_pack.json)
- [../../drafts/v6-rebuild/v6_reference_pack.json](../../drafts/v6-rebuild/v6_reference_pack.json)
- [../../drafts/v0-v3-rebuild/mixed_review_architecture.json](../../drafts/v0-v3-rebuild/mixed_review_architecture.json)
- [../../drafts/v0-v3-rebuild/master_lesson_manifest.json](../../drafts/v0-v3-rebuild/master_lesson_manifest.json)

---

## Step 36 - V4 Reference Pack

### Overview

| Parameter | Value |
| --- | --- |
| Stage | V4 |
| Stage name | Formal Phrase |
| Planned lessons | 50 |
| Planned question rows | 1,000 |
| Global lesson range | V4-A-181 to V4-E-230 |
| Draft slice already present | 5 lessons / 100 questions |
| Draft source | [../../drafts/v4/questions_v4a.json](../../drafts/v4/questions_v4a.json) |
| Planning artifact | [../../drafts/v4-rebuild/v4_reference_pack.json](../../drafts/v4-rebuild/v4_reference_pack.json) |

### Lesson Groups

| Group | Lesson range | Planned file | Lessons | Suggested topics | Status |
| --- | --- | --- | ---: | --- | --- |
| A | V4-A-181 to V4-A-190 | questions_v4a.json | 10 | Email opening; Reference and compliance | Draft slice profiled |
| B | V4-B-191 to V4-B-200 | questions_v4a.json | 10 | Requests and follow-up; Deadlines and scheduling | Planned |
| C | V4-C-201 to V4-C-210 | questions_v4b.json | 10 | Approvals and authorization; Reports and findings | Planned |
| D | V4-D-211 to V4-D-220 | questions_v4c.json | 10 | Negotiation and terms; Notices and announcements | Planned |
| E | V4-E-221 to V4-E-230 | questions_v4d.json | 10 | Apologies and clarification; Closings and next steps | Planned |

### Question Mix Per Lesson

| Type | Count | Role |
| --- | ---: | --- |
| formal_phrase | 8 | Primary formal-phrase recognition and usage |
| meaning_choice | 4 | Direct meaning discrimination in business context |
| part5_sentence_completion | 4 | TOEIC Part 5 sentence completion |
| review_question | 4 | Same-stage review pool |
| **Total** | **20** | |

### Activation Blockers

- Add V4-specific authoring rules to [../question-creation-spec.md](../question-creation-spec.md).
- Confirm `similar_formal_phrase` handling in [../../scripts/audit-quality-full.js](../../scripts/audit-quality-full.js).
- Review V4 vocab item promotion path before using [../../drafts/v4/add-v4-items.js](../../drafts/v4/add-v4-items.js).
- Do not add `questions_v4*.json` to production manifest until a future V4 activation task.

## Step 37 - V5 Reference Pack

### Overview

| Parameter | Value |
| --- | --- |
| Stage | V5 |
| Stage name | False Friends + Speed Reflex |
| Planned lessons | 50 |
| Planned question rows | 1,000 |
| Global lesson range | V5-A-231 to V5-E-280 |
| Planned files | questions_v5a.json through questions_v5e.json |
| Planning artifact | [../../drafts/v5-rebuild/v5_reference_pack.json](../../drafts/v5-rebuild/v5_reference_pack.json) |

### Lesson Structure

| Group | Lesson range | Planned file | Lessons | Lesson type |
| --- | --- | --- | ---: | --- |
| A | V5-A-231 to V5-A-240 | questions_v5a.json | 10 | false_friend_speed_reflex |
| B | V5-B-241 to V5-B-250 | questions_v5b.json | 10 | false_friend_speed_reflex |
| C | V5-C-251 to V5-C-260 | questions_v5c.json | 10 | false_friend_speed_reflex |
| D | V5-D-261 to V5-D-270 | questions_v5d.json | 10 | false_friend_speed_reflex |
| E | V5-E-271 to V5-E-280 | questions_v5e.json | 10 | false_friend_speed_reflex |

### Question Mix Per Lesson

| Type | Count | Policy |
| --- | ---: | --- |
| false_friend | 10 | `distractor_type: toeic_false_friend`, `FALSE_FRIEND`, 8 seconds |
| speed_drill | 10 | `distractor_type: same_word_family`, `TIME_PRESSURE`, 8 seconds, new sentences only |
| **Total** | **20** | |

### Activation Blockers

- No V5 draft question files exist yet.
- Add V5 authoring rules to [../question-creation-spec.md](../question-creation-spec.md).
- Keep V5 out of the production seed manifest until a dedicated activation task with seed-version sync.

## Step 38 - V6 Reference Pack

### Overview

| Parameter | Value |
| --- | --- |
| Stage | V6 |
| Stage name | Integrated Review + Seal Test |
| Planned lessons | 40 |
| Planned new question rows | 200 |
| Planned reused review slots | 600 |
| Planning artifact | [../../drafts/v6-rebuild/v6_reference_pack.json](../../drafts/v6-rebuild/v6_reference_pack.json) |

### Lesson Structure

| Group | Lesson range | Lessons | Lesson type | Notes |
| --- | --- | ---: | --- | --- |
| A | V6-A-281 to V6-A-290 | 10 | integrated_review | Cross-stage review assembly |
| B | V6-B-291 to V6-B-300 | 10 | integrated_review | Cross-stage review assembly |
| C | V6-C-301 to V6-C-310 | 10 | integrated_review | Cross-stage review assembly |
| ST | V6-ST-01 to V6-ST-08 | 8 | seal_test | 25 rows per lesson; covers V0-V3 |
| CAP | V6-CAP-01 to V6-CAP-02 | 2 | integrated_capstone | 30 question IDs per lesson; covers V0-V5 |

### Policy Snapshot

- Integrated-review lessons create **0 new question rows** and assemble 20 IDs per lesson from earlier-stage `review_question` rows.
- Seal tests create 25 rows per lesson using `review_question`, `part5_sentence_completion`, `scene_vocabulary`, and `collocation`.
- Capstones remain future-stage planning only until V4 and V5 content exists.

### Activation Blockers

- V0-V5 content must exist before integrated review has real sources.
- Seal-test rules are not yet written into [../question-creation-spec.md](../question-creation-spec.md).
- No V6 draft question files exist yet.

## Step 39 - Mixed-Review Architecture

### Frozen Decisions

| Parameter | Value |
| --- | --- |
| Artifact | [../../drafts/v0-v3-rebuild/mixed_review_architecture.json](../../drafts/v0-v3-rebuild/mixed_review_architecture.json) |
| Canonical lesson ID format | `{stage}-MR-{NN}` |
| Legacy alias format | `{stage}-MIX-{NN}` |
| Legacy alias policy | Deprecated, do not author new IDs |
| Assembly script | [../../scripts/add-mixed-review-lessons.js](../../scripts/add-mixed-review-lessons.js) |
| New question rows created | 0 |

### Per-Stage Coverage

| Stage | Mixed-review lessons | Core lessons covered | Grouping rule |
| --- | ---: | ---: | --- |
| V2 | 10 | 50 | Every 5 consecutive core lessons feed 1 MR lesson |
| V3 | 12 | 60 | Every 5 consecutive core lessons feed 1 MR lesson |

### Architecture Rules

- `question_ids` for a mixed-review lesson are the flattened `review_question_ids` from its five source lessons.
- Mixed-review lessons do not create new question rows or new question files.
- Lesson numbering bands are frozen at 10,000 for V2 MR and 20,000 for V3 MR so sorting remains stable after core lessons.
- Historical `*-MIX-*` references remain archival aliases only; new planning and validation work uses `*-MR-*` exclusively.

## Step 40 - Master Lesson Manifest And File Splitting

### Overview

| Parameter | Value |
| --- | --- |
| Artifact | [../../drafts/v0-v3-rebuild/master_lesson_manifest.json](../../drafts/v0-v3-rebuild/master_lesson_manifest.json) |
| V0-V3 target lessons | 193 |
| V0-V3 target unique question rows | 4,399 |
| V0-V3 target question files | 18 |
| Production merge order | V1, V0, V2, V3 |
| Wave 1 production ID map rows | 16 |
| Production impact | none; planning only |

### Wave 1 Mapping Baseline

| Draft lesson IDs | Planned production IDs | Planned file |
| --- | --- | --- |
| V3-W1-01 to V3-W1-10 | V3-A-121 to V3-A-130 | questions_v3a.json |
| V3-W1-11 to V3-W1-16 | V3-B-131 to V3-B-136 | questions_v3b.json |

### File-Splitting Policy

- V0-V3 keep one manifest question file per frozen letter group from Phase 7.
- V2/V3 mixed-review lessons create no new question file rows.
- V4+ file names are frozen as planning references only and remain outside the production manifest.
- The master manifest now stores `v4_plus_files_planned` as 11 unique file names, so shared V4 file aliases like `questions_v4a.json` are not duplicated in the planning list.
- Future V4 physical file splitting may collapse or expand during activation review, but the Phase 8 naming baseline is now fixed.

### Production Merge Checklist

1. Populate `curriculum.lessons` from the master manifest during a later production merge.
2. Run [../../scripts/add-mixed-review-lessons.js](../../scripts/add-mixed-review-lessons.js) only after V2/V3 core lessons exist with populated `review_question_ids`.
3. Remap `V3-W1-*` draft IDs through the frozen Wave 1 production ID table before writing real question rows.
4. Bump the shared seed version in the three required locations only during a production merge.
5. Run the full release gate listed in [questions plan.md](questions%20plan.md).

## Verification Summary

Verified by [../../scripts/verify-phase8.js](../../scripts/verify-phase8.js).

| Check | Result |
| --- | --- |
| Total automated checks | 13 |
| Passed | 13 |
| Failed | 0 |
| Production curriculum lesson rows | 0 |
| Embedded manifest consistency checks | Passed |

Verification confirms:

- V4/V5/V6 packs are draft/planning only and block production merge.
- Mixed-review architecture is frozen on canonical `*-MR-*` IDs.
- The master manifest matches the Phase 7 stage map totals and Wave 1 production mapping.
- The master manifest file-splitting section keeps `v4_plus_files_planned` deduped to 11 unique entries.
- Production seed data remains untouched.

## Phase 8 Usage Rules

- Re-run `node scripts/verify-phase8.js --write` after any edit to a Phase 8 artifact or this document.
- Do not bump seed version for Phase 8; it is planning-only work.
- Do not add V4-V6 files to `curriculum.question_files` until a future activation task explicitly does so.
- Use the master lesson manifest and mixed-review architecture as the planning baseline before expanding Steps 45-46.