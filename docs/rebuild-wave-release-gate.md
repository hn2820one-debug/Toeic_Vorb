# Rebuild Wave Release Gate

Status: Active governance document
Last updated: 2026-05-20
Scope: Program B production and draft content rebuild waves

This document defines the minimum release standard for any TOEIC Vocabulary Tracker content rebuild wave. It applies before a wave is described as ready, merged, or promoted from draft content into production seed data.

Current production contains the first rebuilt wave, `V2-A-71`, with 1 runnable lesson and 24 question rows. Any later production wave still must pass this gate and perform seed-version sync.

---

## 1. Wave Types

### Draft wave

A draft wave may live entirely under `drafts/**`.

- It can validate authoring quality without changing production counts.
- It must not change `data/vocab/**`, seed version, or active handoff counts.
- It must have a stage-specific verifier or documented manual review before it is used as an authoring template.

### Production release wave

A production release wave changes at least one production seed file under `data/vocab/**`.

- It must update lessons, questions, vocab items, review links, docs, and tests as a single coherent release.
- It must bump `seed_version` in all three required files.
- It is not mergeable when any blocking item in this gate is unchecked.

---

## 2. Minimum Output Per Wave

Every claimed wave must include these outputs. A wave may be small, but it cannot be partial.

For V1-V3 stage rebuilds, use `docs/minimum-usable-content-packs.md` to decide whether the first package is large enough to review before scale-up.

After learner attempts, draft smoke tests, or production content changes, use `docs/export-analysis-feedback-governance.md` to feed export evidence back into the next rebuild priorities.

| Area | Minimum output |
|---|---|
| Wave manifest | Stage, wave ID, lesson IDs, source draft path if any, production target files, and explicit draft/production status. |
| Lessons | Complete curriculum lesson rows for every included lesson. No placeholder or half-promoted lesson rows. |
| Questions | Complete question rows for every included `question_id` and `review_question_id`, with globally unique `question_text`. |
| Review | Review rows and old-item pressure policy documented. Mixed-review lessons may only reuse valid earlier same-stage `review_question` IDs. |
| Items | Every `target_item_id` exists in vocab items with Chinese meaning, example, and any known trap metadata needed by feedback/review views. |
| Documentation | `docs/Future Plan.md`, `TO_AI.md`, and `docs/question-creation-spec.md` updated when current facts, rules, counts, or priorities change. |
| Tests | Automated tests or verifier coverage added for the behavior changed by the wave. Existing validation must still pass. |

Production waves must also preserve the Program B boundary, keep V4 draft-only unless explicitly authorized, and avoid backend/login/cloud/build/runtime-AI changes.

---

## 3. Automated Validation

### Required for every production release wave

Run all of these before calling a production wave ready:

```powershell
node scripts/validate-vocab-data.js
node scripts/audit-quality-full.js
node scripts/audit-duplicates.js
npm run test:scoring
npm run test:audit
npm run test:patch
npm run test:mup
npm run test:export-governance
npm run test:docs
npx playwright test
npm run test:all
```

Release standards:

- `node scripts/validate-vocab-data.js` must pass with no structural errors.
- `node scripts/audit-quality-full.js` must pass with no blocking issues.
- `node scripts/audit-duplicates.js` must report zero duplicate `question_text` groups.
- `npm run test:docs` must pass after any current-fact documentation change.
- `npm run test:mup` must pass before a V1-V3 minimum usable pack is used as a scale-up baseline.
- `npm run test:export-governance` must pass before export feedback review policy is treated as current.
- Playwright must pass for both production-empty and seeded-fixture expectations that remain relevant after the wave.
- `npm run test:all` must pass after the final content and documentation edits.

### Required for draft-only waves

Draft-only waves must run the most specific verifier available for that draft plus doc checks if active docs changed.

Example:

```powershell
node scripts/verify-phase10-slice.js
npm run test:docs
```

Draft verification is not a substitute for the production release gate. It proves the draft slice can be reviewed or reused; it does not prove that production seed data is mergeable.

---

## 4. Human Review

Every wave needs a short human-review note before release.

| Review area | Required decision |
|---|---|
| Content quality | Sentences are natural TOEIC business English and match the learner level. |
| Semantic control | Direct-definition rows obey the `target_item_id` + semantic meaning uniqueness policy. |
| Error-code mapping | Each question type uses the correct `default_error_code`; stage-level exceptions are documented. |
| Distractors | Wrong answers are plausible, same-field where possible, and not eliminated by grammar giveaways. |
| Answer distribution | A/B/C/D distribution is checked for obvious skew, especially in generated or draft-promoted rows. |
| Explanations | `explanation_zh` is Traditional Chinese and explains the rule or contrast, not just a translation. |
| Progression | Same-item repetition is staircased across meaning, context, collocation, speed, or review demand. |
| Review pressure | Review rows and mixed-review reuse reinforce prior material without invalid future/cross-stage references. |

Warnings from quality scripts may be accepted only when the review note explains why they are intentional and non-blocking.

---

## 5. Blocking Release Checklist

A production wave is not ready unless every item below is checked.

- [ ] Scope is declared as draft-only or production.
- [ ] Program A files are untouched.
- [ ] V4 is not promoted unless the task explicitly authorizes V4 activation.
- [ ] Every included lesson is complete and stage-consistent.
- [ ] Every included question row has required fields, four options, a valid answer key, and a valid `target_item_id`.
- [ ] Every included review row is wired through `review_question_ids` or valid mixed-review reuse.
- [ ] Duplicate stem audit reports zero duplicate groups.
- [ ] Full quality audit passes with zero blocking issues.
- [ ] Human review note covers content, semantic sense, error code, answer distribution, explanation, and distractor checks.
- [ ] Seed version is synchronized in all three required files for production data changes.
- [ ] `TO_AI.md` and active user-facing docs reflect any changed current facts.
- [ ] Relevant Playwright coverage exists or an explicit test-gap note is recorded.
- [ ] `npm run test:all` passes after the final edit.

---

## 6. First Trial Run

Trial target: V3 Wave 1 first authored draft slice, `V3-W1-01`

Command:

```powershell
node scripts/verify-phase10-slice.js
```

Result on 2026-05-19:

- Draft verifier passed 17/17 checks.
- The slice has 24 authored draft question rows and 7 authored draft vocab item rows.
- Production seed files remained unchanged.

Gate decision:

- Draft authoring reference: accepted.
- Production release: blocked by design.

Blocking reasons for production promotion:

- The slice is V3-only while the frozen production merge order is `V1 -> V0 -> V2 -> V3`.
- It uses draft lesson ID `V3-W1-01`, not production curriculum IDs.
- It is one authored slice, not a complete production wave with seed-version sync, production lesson rows, production item rows, and full release smoke coverage.
