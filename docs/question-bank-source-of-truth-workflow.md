# Question Bank Source-of-Truth Workflow

Status: implemented workflow. Browser edit tracking, patch export, comparison, patch apply, and fixture tests exist. Production seed JSON is still never rewritten by the browser UI.

Program boundary:

- Program B only: `C:\Users\Keith\Toeic\toeic-app-Vorb`
- Do not modify Program A: `C:\Users\Keith\toeic-app`
- Do not enable V4 or move `drafts/v4/` into `data/vocab/`
- Production seed source of truth remains JSON under `data/vocab/`

## 1. Current Behavior

The Question Bank UI is a browser-local editor over the IndexedDB `questions` store. It is useful for inspection and temporary corrections, but it does not write to production JSON seed files.

Current edit path:

1. App starts at `tracker.html`.
2. `window.VocabDB.seedIfNeeded()` loads `data/vocab/curriculum.json`, manifest question files, and `vocab_items.json` into IndexedDB.
3. Question Bank renders `state.questions`, loaded from `window.VocabDB.getAll("questions")`.
4. Selecting a row fills the JSON editor with the full question object.
5. `Save Question JSON` parses the editor JSON, runs minimal browser validation, and writes the whole object with `window.VocabDB.put("questions", question)`.
6. `Import JSON` accepts a question array or `{ questions: [...] }`, validates minimally, and writes all rows with `window.VocabDB.putAll("questions", questions)`.
7. `Delete` removes one row from IndexedDB with `window.VocabDB.remove("questions", question_id)`.

Editable fields:

- The editor is full-object JSON, so any field in a question row can be changed: `question_id`, `lesson_id`, `stage`, `type`, `skill`, `subskill`, `question_text`, `options`, `correct_answer`, `explanation_zh`, `target_item_id`, `distractor_type`, `difficulty`, `estimated_time_seconds`, `default_error_code`, `tags`, `grammar_link_id`, and any extra properties.
- Browser validation blocks missing required fields, invalid `correct_answer`, and missing A/B/C/D options.
- Browser validation warns about duplicate question text, missing `grammar_link_id`, missing tags, missing `estimated_time_seconds`, and answer distribution, but warnings do not block all exports.

Current export behavior:

- `Export JSON` downloads the currently filtered question list from IndexedDB as `toeic_vocab_questions_export.json`.
- `Download Seed JSON` reads all current IndexedDB questions, validates them, groups them by `seedFilenameForQuestion()`, and downloads JSON files.
- `Export Dashboard` includes `question_bank_snapshot.json`, which is also based on current IndexedDB rows.

Current limitations:

- The app now tracks local edit metadata in IndexedDB store `question_edits`.
- Edit metadata includes source seed version, file hint, changed fields, edited timestamp, before/after snapshots, and before/after hashes.
- Local edits are distinguishable only after the edit is made through the updated Question Bank save/import/delete paths. Older browser edits made before this workflow may not have metadata.
- `Download Seed JSON` uses a filename heuristic. It maps V0 and V1 subgroups, but V2/V3 rows fall back to `questions_v2.json` and `questions_v3.json`, not the production manifest files `questions_v2a.json` through `questions_v2e.json` and `questions_v3a.json` through `questions_v3f.json`.
- New custom IndexedDB questions can remain browser-local and may not be referenced by curriculum.
- A seed version bump reseeds source JSON rows, but the current seeding logic does not make the browser editor a production writer.

Conclusion: current Question Bank exports are review artifacts, not source-of-truth production seed changes.

Implemented browser controls:

- `Export Local Edits Patch`
- `Download Edited Seed JSON Snapshot`
- `Validate Bank`

The persistent Question Bank warning says:

```text
Browser edits are local IndexedDB edits. They are not production seed changes until exported and applied to seed JSON.
```

## 2. Proposed Safe Workflow

Required flow:

```text
Browser Edit
-> Local IndexedDB change
-> Export Local Edits Patch
-> Review patch file
-> Apply patch to production JSON using script
-> Bump seed version in exactly three files
-> Run validation
-> Commit
```

Detailed steps:

1. Make the correction in Question Bank.
2. Export a local edit patch, not production JSON.
3. Review the patch in a text editor or PR.
4. Run `scripts/apply-questionbank-patch.js` from Program B only.
5. The apply script modifies only allowed files under `data/vocab/questions_v*.json`, and only for rows included in the patch.
6. The apply script rejects Program A paths, V4 draft promotion, unknown question IDs, duplicate stems, missing fields, invalid answers, broken lesson references, and broken target item references.
7. Bump seed version in:
   - `data/vocab/curriculum.json` -> `seed_version`
   - `js/vocab-db.js` -> `SEED_VERSION`
   - `tests/helpers/seed-idb.ts` -> `APP_SEED_VERSION`
8. Run full validation.
9. Copy `docs/templates/seed-change-record-template.md` to `docs/seed-changes/YYYY-MM-DD-{new-seed-version}.md`, then record the reason, affected files, validation results, rollback plan, and sign-off. Do not skip this record.
10. Commit the production JSON change, seed-version sync, and any patch/audit documentation needed for traceability.

Browser edits must never silently rewrite files under `data/vocab/`.

## 3. Patch Schema

Patch files should be explicit and reviewable:

```json
{
  "patch_version": "1.0",
  "app": "toeic-vocab-tracker",
  "program": "Program B",
  "program_path": "C:\\Users\\Keith\\Toeic\\toeic-app-Vorb",
  "source_seed_version": "toeic_vocab_tracker_c002_old_item_interference_2026_05_18",
  "created_at": "2026-05-18T00:00:00+08:00",
  "created_by": "question-bank-local-editor",
  "base_manifest": [
    "questions_v0.json",
    "questions_v1a.json"
  ],
  "changes": [
    {
      "question_id": "v2_a_71_q_001",
      "file_hint": "questions_v2a.json",
      "change_type": "update",
      "before_hash": "sha256:...",
      "after_hash": "sha256:...",
      "before": {
        "question_text": "old text",
        "options": {
          "A": "old",
          "B": "old",
          "C": "old",
          "D": "old"
        },
        "correct_answer": "A",
        "explanation_zh": "old explanation"
      },
      "after": {
        "question_text": "new text",
        "options": {
          "A": "new",
          "B": "new",
          "C": "new",
          "D": "new"
        },
        "correct_answer": "A",
        "explanation_zh": "new explanation"
      },
      "fields_changed": [
        "question_text",
        "options",
        "explanation_zh"
      ],
      "reason": "Fix ambiguous distractor.",
      "review_notes": ""
    }
  ]
}
```

Allowed `change_type` values:

- `update`: edit an existing production question row.
- `add`: add a new production question row only when a content task explicitly authorizes new seed content.
- `delete`: delete a production question row only when a content task explicitly authorizes removal and curriculum references are updated.

Default workflow should support only `update`. `add` and `delete` should require explicit CLI flags such as `--allow-add` or `--allow-delete`.

Patch rules:

- `source_seed_version` must equal the current seed version before applying.
- `program_path` must match Program B.
- `file_hint` must be a production manifest file from `curriculum.question_files`.
- `file_hint` must not be under `drafts/v4/`.
- `question_id` must already exist in the hinted file for `update`.
- `before_hash` must match the current seed row before applying.
- `fields_changed` must exactly match the diff between `before` and `after`.
- Patches must contain only changed fields in `before` and `after`, not whole-bank snapshots.

Recommended hash input:

```text
sha256(canonical_json(full_question_row_before_change))
sha256(canonical_json(full_question_row_after_change))
```

Canonical JSON should sort object keys recursively and preserve array order.

## 4. Implemented Scripts

### `scripts/export-questionbank-edits.js`

Purpose:

- Export a patch file describing differences between browser-exported local question rows and production seed JSON.
- Validate a browser-exported local edits patch.
- It should not write production data.

Usage:

```powershell
node scripts/export-questionbank-edits.js --snapshot path\to\question_bank_snapshot.json --output tmp\questionbank-edits.patch.json
node scripts/export-questionbank-edits.js --validate-patch tmp\questionbank-edits.patch.json
```

Browser path:

1. Open Question Bank.
2. Make local edits.
3. Click `Export Local Edits Patch`.
4. Review the downloaded patch.
5. Validate or apply it with the Node scripts.

Inputs:

- Browser-exported `question_bank_snapshot.json`, or the dedicated patch JSON from `Export Local Edits Patch`.
- Production seed files from `data/vocab/`.
- Optional `--output tmp/questionbank-edits.patch.json`.
- Optional `--reason-file tmp/edit-reasons.json` for human reasons by `question_id`.

Outputs:

- Patch JSON using schema `patch_version: "1.0"`.
- Summary report:
  - changed rows
  - added rows
  - deleted rows
  - unchanged rows
  - unknown local-only rows
  - missing file hints

Safety checks:

- Resolve and verify Program B root before reading or writing.
- Read production question files only from `curriculum.question_files`.
- Exclude `drafts/v4/` by default.
- Reject V4 rows unless a future explicit draft-audit mode exists.
- Require `source_seed_version` from the three seed-version locations to match.
- Detect changed fields by comparing local row to production row.
- Refuse to infer V2/V3 file names from stage alone; use manifest lookup by `question_id`.

Failure cases:

- Snapshot is missing or malformed.
- Seed version mismatch.
- Local row has invalid required fields.
- Duplicate `question_id` in snapshot.
- Duplicate normalized `question_text` would be introduced.
- A local row exists only in IndexedDB and `--allow-add` was not passed.
- A seed row is missing locally and `--allow-delete` was not passed.
- Any row maps to V4 draft or non-manifest file.

Validation after use:

```powershell
node scripts/validate-vocab-data.js
node scripts/audit-quality-full.js
node scripts/audit-duplicates.js
npm run test:scoring
npx playwright test
```

### `scripts/apply-questionbank-patch.js`

Purpose:

- Apply a reviewed patch file to production seed JSON.
- This is the only approved path from browser-local Question Bank edits to source JSON.

Usage:

```powershell
node scripts/apply-questionbank-patch.js --patch tmp\questionbank-edits.patch.json
node scripts/apply-questionbank-patch.js --patch tmp\questionbank-edits.patch.json --write --new-seed-version toeic_vocab_tracker_c003_description_YYYY_MM_DD
```

Default mode is dry-run. `--write` is required for mutation.

Inputs:

- `--patch tmp/questionbank-edits.patch.json`
- Optional `--root <path>` for tests/fixtures. Default is current Program B root.
- Optional `--write` to edit production JSON.
- Required with `--write`: `--new-seed-version toeic_vocab_tracker_...`

Outputs:

- Updated production question JSON files only when `--write` is passed.
- A report listing each changed question and file.
- A seed-version sync check report.

Safety checks:

- Refuse to run outside `C:\Users\Keith\Toeic\toeic-app-Vorb`.
- Refuse any path resolving outside Program B.
- Refuse any path under Program A.
- Refuse `drafts/v4/` and `data/vocab/questions_v4*.json`.
- Refuse files not listed in production `curriculum.question_files`.
- Verify `source_seed_version` matches all three required seed-version files before applying.
- Verify `before_hash` matches the current production row.
- Verify `question_id` exists in `file_hint` for updates.
- Verify changed row keeps required fields, A/B/C/D options, valid `correct_answer`, valid `lesson_id`, valid `target_item_id`, and stage consistency.
- Verify no duplicate stems after applying.
- Verify no broken curriculum references after applying.
- Require a seed-version bump for any production write.
- Verify the new seed version is identical in all three files after write.

Failure cases:

- Patch version unsupported.
- Patch was created from a different seed version.
- Patch tries to change `question_id` without explicit `--allow-id-change`.
- Patch changes a row not matching `before_hash`.
- Patch introduces duplicate stems, invalid references, V4 leakage, or answer distribution failure.
- New seed version is missing or not synchronized.

Validation after use:

```powershell
node scripts/validate-vocab-data.js
node scripts/audit-quality-full.js
node scripts/audit-duplicates.js
npm run test:scoring
npm run test:patch
npx playwright test
npm run test:all
```

### `scripts/compare-idb-vs-seed.js`

Purpose:

- Compare a browser-exported IndexedDB question snapshot against production seed JSON without applying changes.
- This is a diagnostic tool for drift.

Usage:

```powershell
node scripts/compare-idb-vs-seed.js --snapshot path\to\question_bank_snapshot.json
node scripts/compare-idb-vs-seed.js --patch tmp\questionbank-edits.patch.json
node scripts/compare-idb-vs-seed.js --snapshot path\to\question_bank_snapshot.json --json tmp\idb-vs-seed-report.json
```

Inputs:

- `--snapshot downloads/question_bank_snapshot.json`
- Production seed files from `data/vocab/curriculum.json -> question_files`.
- Optional `--json tmp/idb-vs-seed-report.json`.

Outputs:

- Human-readable drift report.
- Optional machine-readable JSON report with:
  - `same`
  - `changed`
  - `local_only`
  - `seed_only`
  - `changed_fields`
  - `file_hint`
  - `seed_version`

Safety checks:

- Read-only by default and permanently.
- Manifest-driven seed loading.
- V4 draft excluded by default.
- Detect local-only custom questions.
- Detect seed-only rows missing from the browser snapshot.
- Detect rows whose source file cannot be inferred from manifest lookup.

Failure cases:

- Snapshot is malformed.
- Snapshot seed version is missing or mismatched.
- Duplicate IDs in snapshot.
- Production manifest file missing.
- V4 row appears in production snapshot.

Validation after use:

- No validation is required for read-only comparison.
- If the report becomes a patch, then run the full validation after applying the patch.

## 5. UI Design

Question Bank should display a persistent warning near the action buttons:

> Browser edits are local IndexedDB edits. They are not production seed changes until exported as a patch, reviewed, applied to JSON, seed-bumped, and validated.

Recommended controls:

- `Export Local Edits Patch`
  - Downloads a patch file only.
  - Should require comparing current IndexedDB questions against original seed rows or a stored seed baseline.
  - Should not download rewritten production seed files.

- `Download Edited Seed JSON`
  - Keep as a diagnostic or emergency snapshot action.
  - Label should say `Download Edited Seed JSON Snapshot`.
  - Must warn: `Not production-ready. Use patch workflow for source changes.`
  - Should preserve production manifest file names before it can be considered reliable for V2/V3.

- `Compare Local vs Seed`
  - Shows a count of local-only, seed-only, and changed rows.
  - Should export a comparison report.

Suggested Question Bank copy:

```text
Local editor mode
Changes saved here update only this browser's IndexedDB. They do not modify data/vocab JSON files.
For production changes: export a patch, review it, apply it with the maintenance script, bump seed version, and run validation.
```

Suggested button labels:

- `Export Local Edits Patch`
- `Compare Local vs Seed`
- `Download Edited Seed JSON Snapshot`
- `Validate Local Bank`

Do not use labels such as `Save to Seed`, `Publish`, or `Production Export` unless the workflow actually applies and validates source JSON.

## 6. Safety Rules

Production path rules:

- Only Program B may be read or written.
- Program A path `C:\Users\Keith\toeic-app` is forbidden.
- Production question data lives only under `data/vocab/`.
- V4 draft remains under `drafts/v4/` and is excluded from production patch workflows.

Seed version rules:

- Any production question or curriculum change requires the same new seed version in:
  - `data/vocab/curriculum.json`
  - `js/vocab-db.js`
  - `tests/helpers/seed-idb.ts`
- Patch apply must fail if the three values differ.

Data quality rules:

- `question_id` must be unique.
- `question_text` must remain globally unique.
- Required fields must be present.
- A/B/C/D options and `correct_answer` must be valid.
- `lesson_id` must exist in curriculum.
- `target_item_id` must exist in `vocab_items.json` for production V1-V3 rows, with known exceptions handled explicitly for V0 only.
- V2/V3 core and mixed-review rules must stay separated.
- Mixed-review reuse is allowed only by curriculum reference; duplicate production rows are not allowed.

Review rules:

- Patch files should be small and human-readable.
- Patches should explain the reason for each change.
- Applying a patch should support `--dry-run`.
- The script should print exact changed files before `--write`.
- The script should never edit archived docs or backup files.

## 7. Recommended Implementation Order

Completed:

1. Question Bank UI warning added.
2. `Download Seed JSON` relabeled to `Download Edited Seed JSON Snapshot`.
3. `Export Local Edits Patch` UI control added.
4. Local edit metadata is tracked in IndexedDB store `question_edits`.
5. `scripts/compare-idb-vs-seed.js` implemented as read-only.
6. `scripts/export-questionbank-edits.js` implemented for snapshot-to-patch and patch validation.
7. `scripts/apply-questionbank-patch.js` implemented with dry-run default and explicit `--write`.
8. Script tests use temporary fixture roots.
9. Playwright coverage checks the warning and patch/snapshot controls render.

Still optional:

- Add a browser-side `Compare Local vs Seed` report button. The Node compare script already supports downloaded snapshots and patches.

## 8. Required Validation

After any production patch is applied:

```powershell
node scripts/validate-vocab-data.js
node scripts/audit-quality-full.js
node scripts/audit-duplicates.js
npm run test:scoring
npm run test:patch
npx playwright test
npm run test:all
```

If any command fails, do not treat the browser edit as production-ready.
