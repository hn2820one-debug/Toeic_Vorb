# V1 Duplicate Cleanup Plan

Historical note: this plan is scoped to V1 cleanup before the V2/V3 content expansion. Current overall content counts and next priorities are maintained in `TO_AI_APP_STATUS_V2.md`.

## 1. Cleanup Scope

This cleanup only targets V1 question quality issues.
This cleanup does not add V2.
This cleanup does not change runtime logic.
This cleanup does not change schema.
This cleanup does not touch Grammar / PoS App.

## 2. Input Audit Baseline

- total V1 lessons: 60
- total V1 questions: 1728
- exact duplicates: 67
- distractor-only variation: 213
- acceptable speed repetition: 98
- acceptable review repetition: 61
- source audit file: docs/V1_QUESTION_QUALITY_AUDIT.md

## 3. Cleanup Priority

### P1 — Must Fix Now

- EXACT_DUPLICATE within same lesson
- identical question_text + identical options
- identical question_text + answer only reordered

### P2 — Fix Small Sample Only

- severe DISTRACTOR_ONLY_VARIATION
- repeated same sentence shell more than 3 times in same lesson
- repeated same sentence shell across adjacent lessons with no learning benefit

### P3 — Keep For Now

- ACCEPTABLE_SPEED_REPETITION
- ACCEPTABLE_REVIEW_REPETITION
- V1-F speed repetition unless exact duplicate is clearly harmful

## 4. Safety Rules

- do not reduce any normal lesson below 20 questions
- do not reduce any speed lesson below 40 questions
- do not break curriculum question_ids
- do not remove question_id references without updating curriculum
- prefer rewrite over delete if deleting would reduce lesson coverage
- preserve answer distribution as much as possible
- run validation after every cleanup batch
