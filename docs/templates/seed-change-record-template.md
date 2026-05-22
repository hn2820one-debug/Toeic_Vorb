# Seed Change Record Template

Copy this file to `docs/seed-changes/YYYY-MM-DD-{new-seed-version}.md` for every production seed change. Do not edit the template in place.

Record status:
Change date:
Owner:
PR / branch:
Scope:
Production seed changed: yes/no
Source seed version:
New seed version:
Reason:
Related plan item:
Related ticket / wave:

---

## 1. Change Summary

| Change item | Reason | Impacted files | Notes |
|---|---|---|---|
|  |  |  |  |

---

## 2. Required File Sync

Required on every production seed change. Mark each row as `updated`, `unchanged`, `not_applicable`, or `blocked`.

| File / area | Required? | Status | Notes |
|---|---|---|---|
| `data/vocab/curriculum.json` -> `seed_version` | yes |  |  |
| `js/vocab-db.js` -> `SEED_VERSION` | yes |  |  |
| `tests/helpers/seed-idb.ts` -> `APP_SEED_VERSION` | yes |  |  |
| Production data files changed in this seed | if applicable |  |  |
| `TO_AI.md` current truth or process notes | if applicable |  |  |
| `README.md` maintainer instructions | if applicable |  |  |
| `docs/question-creation-spec.md` authoring / release rules | if applicable |  |  |
| `docs/question-bank-source-of-truth-workflow.md` patch workflow | if applicable |  |  |
| Other docs / scripts / tests touched by the seed | if applicable |  |  |

---

## 3. Validation

| Command | Required? | Result | Notes |
|---|---|---|---|
| `node scripts/validate-vocab-data.js` | yes |  |  |
| `node scripts/audit-quality-full.js` | yes for production content changes |  |  |
| `node scripts/audit-duplicates.js` | yes for question changes |  |  |
| `npm run test:scoring` | yes |  |  |
| `npm run test:docs` | yes |  |  |
| `npx playwright test` | yes for UI or production seed changes |  |  |
| `npm run test:all` | preferred release gate |  |  |
| Additional targeted checks | if applicable |  |  |

Validation summary:

---

## 4. Rollback Plan

Previous seed version to restore:
Files to restore:

Rollback steps:

1. Revert every production data file changed in this seed.
2. Restore the previous seed version in the three required sync files.
3. Rerun the relevant validation commands for the restored state.
4. Confirm the app reseeds cleanly with the restored version.

Post-rollback verification:

---

## 5. Sign-off

| Role | Name | Status | Date | Notes |
|---|---|---|---|---|
| Content review |  | pending / approved |  |  |
| Validation review |  | pending / approved |  |  |
| Release decision |  | hold / approved |  |  |

Final decision:
Merge / ship window:
Follow-up actions: