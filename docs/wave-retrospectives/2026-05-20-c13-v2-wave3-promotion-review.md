# C-13 V2 Wave 3 Promotion Review

Date: 2026-05-20
Program: Program B - TOEIC Vocabulary Tracker
Scope: Promote `V2-A-75` through `V2-A-77` into production
Status: Approved

---

## Summary

Wave 3 promoted three validated V2 core lessons into the live production seed:

- `V2-A-75` - Office Communication Scene Vocabulary
- `V2-A-76` - Office Facility Scene Vocabulary
- `V2-A-77` - Office Procedure Scene Vocabulary

Production now contains 7 runnable lessons and 168 question-bank rows, all in `data/vocab/questions_v2a.json`. The seed version advanced to `toeic_vocab_tracker_v2_a_75_77_wave_3_2026_05_20`, and the service worker cache advanced to `toeic-vorb-v13`.

## Evidence

Candidate review artifacts:

- `docs/wave-retrospectives/2026-05-20-c13-v2-a-75-candidate-review.md`
- `docs/wave-retrospectives/2026-05-20-c13-v2-a-76-candidate-review.md`
- `docs/wave-retrospectives/2026-05-20-c13-v2-a-77-candidate-review.md`
- `docs/wave-retrospectives/2026-05-20-c13-v2-wave3-seed-promotion-plan.md`

Final validation:

- `node scripts/validate-vocab-data.js` passed: 7 lessons, 168 questions, A/B/C/D = 42/42/42/42.
- `node scripts/audit-quality-full.js` passed: 0 blocking issues, 28 staircase warnings, 1 accepted first-core old-item policy exception for `V2-A-71`.
- `node scripts/audit-duplicates.js` passed: 168 unique stems, 0 duplicate stems.
- `npm run test:docs` passed: active docs match seed/cache/count source files.
- `npx playwright test tests/ui-regression.spec.ts` passed: 11/11.
- `npx playwright test tests/seed-sync.spec.ts` passed: 1/1.
- `npm run test:all` passed: scoring, data, docs, audit harness, patch workflow, MUP, export governance, and 28 Playwright tests.
- Production-wave metadata tags were normalized after promotion: each wave 3 lesson now has 24 rows tagged as `production_wave_v2_a_75`, `production_wave_v2_a_76`, or `production_wave_v2_a_77`, with 0 truncated or candidate-wave tags left in production.

## Non-Blocking Debt

The 28 staircase progression warnings remain accepted short-term debt. They are warning-level only and do not block production because:

- there are 0 definition leakage issues;
- there are 0 article giveaway issues;
- there are 0 old-item pressure issues;
- answer distribution is exactly balanced across the live production rows;
- no current learner/export evidence proves the staircase warnings are harming outcomes.

Do not rewrite the live seed for these warnings until real learner/export evidence or an isolated draft probe justifies it.

## Next Process

1. Run the formal promotion gate for the assembled `V2-MR-01` candidate; it reuses the existing 20 review rows across `V2-A-71` through `V2-A-75` and adds 0 new question-bank rows.
2. Keep T049 export feedback review blocked until real learner/export sessions exist.
3. Draft and validate wave 4 (`V2-A-78` through `V2-A-80`) to reach 10 runnable V2 core lessons.
