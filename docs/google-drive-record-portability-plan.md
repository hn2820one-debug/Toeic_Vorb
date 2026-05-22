# Google Drive 跨平台記錄落地計畫

更新日期：2026-05-22
計畫代號：`XPLAT-01`
範圍：Program B learner records portability

## Summary

本計畫提供 Google Drive 手動檔案搬運流程，讓學習紀錄可跨裝置延續。App 只負責產生單一備份 JSON、匯入前 preview、以及本機 safe merge；使用者自行把檔案上傳到 Google Drive 或從 Google Drive 下載。

這不是即時雲端同步，不新增登入、後端、Google Drive API、cloud sync、build tooling，也不改 production seed。

## Non-Goals

- 不串 Google Drive API。
- 不新增 Google login 或任何帳號系統。
- 不新增後端或雲端同步。
- 不修改 `data/vocab/*` production 題庫或課程來源 JSON。
- 不啟用 V4，不移動 `drafts/v4/`。
- 不改 seed version；seed mismatch 只警告。
- 不改 Question Bank source-of-truth workflow。

## Backup Interface

備份檔固定為單一 JSON，檔名格式：

```text
toeic_vocab_backup_YYYY-MM-DD.json
```

Payload:

```json
{
  "backup_version": "1.0",
  "app_id": "toeic-vocab-tracker",
  "seed_version": "toeic_vocab_tracker_v3_w2_07_wave_18_2026_05_22",
  "exported_at": "...",
  "source_device_label": "...",
  "summary": {
    "attempts": 0,
    "sessions": 0,
    "review_queue": 0,
    "vocab_items": 0,
    "latest_attempt_at": null
  },
  "stores": {
    "users": [],
    "settings": [],
    "lessons": [],
    "vocab_items": [],
    "attempts": [],
    "sessions": [],
    "error_logs": [],
    "review_queue": [],
    "exports": [],
    "question_edits": [],
    "word_highlights": []
  },
  "local_storage": {
    "preferences": {},
    "word_highlights": []
  }
}
```

## Safe Merge Rules

- Default import mode is safe merge.
- Same keyPath records are deduped.
- Local settings win; `seed_version` and `course_id` are never imported from backup.
- `attempts`, `sessions`, `error_logs`, `review_queue`, `exports`, and `users` are insert-only by ID.
- `lessons` only merges learner progress fields into existing local lesson rows; unknown lesson IDs are skipped.
- `vocab_items` merges mastery/progress fields conservatively and keeps local seed metadata.
- `word_highlights` merges missing localStorage highlight rows by `highlight_id` or fallback text/question/session key.
- `question_edits` is exported for audit visibility but skipped during automatic restore; source JSON remains governed by the existing Question Bank patch workflow.
- Production curriculum/questions/source JSON are never imported or overwritten.

## Phase Plan

### Phase 1 — Future Plan Linkage

- [x] Add `XPLAT-01` to `docs/Future Plan.md`.
- [x] Mark it as user-requested non-content promotion parallel work.
- [x] State that `PAGES-01` remains open and is not replaced.
- [x] State that no seed or production content data changes are authorized.

### Phase 2 — Backup Contract

- [x] Define backup version, app ID, seed metadata, source device label, summary, stores, and localStorage block.
- [x] Include learner records needed for cross-device continuity.
- [x] Keep Question Bank source workflow out of automatic restore.

### Phase 3 — Export UI

- [x] Add Export-page action `匯出 Google Drive 備份檔`.
- [x] Generate one JSON file named `toeic_vocab_backup_YYYY-MM-DD.json`.
- [x] Record backup export in the existing `exports` store.
- [x] Explain that the user manually uploads the file to Google Drive.

### Phase 4 — Import Preview

- [x] Add Export-page `匯入備份檔` file picker.
- [x] Reject invalid JSON before any merge.
- [x] Validate required backup fields.
- [x] Show seed mismatch and old-file warnings without changing local data.
- [x] Show per-store add/merge/skip preview before confirmation.

### Phase 5 — Safe Merge

- [x] Implement insert-only merge for append records.
- [x] Implement conservative mastery and lesson-progress merge.
- [x] Keep local settings and production seed metadata authoritative.
- [x] Ensure importing the same backup twice does not duplicate attempts, sessions, or highlights.

### Phase 6 — Documentation

- [x] Update `README.md`.
- [x] Update `TO_AI.md`.
- [x] Update `docs/使用說明書.md`.
- [x] Preserve this detailed plan in `docs/google-drive-record-portability-plan.md`.

### Phase 7 — Automated Tests

- [x] Add Playwright coverage for backup builder shape and summary.
- [x] Add invalid JSON rejection test.
- [x] Add seed mismatch warning and seed non-overwrite test.
- [x] Add duplicate-import idempotency test.
- [x] Add two-device merge count test.
- [x] Add mobile `390x844` export/select/preview/confirm test.

### Phase 8 — Regression Gate

- [x] Run targeted backup/restore spec.
- [x] Run `npx playwright test tests/app-pages-click-smoke.spec.ts`.
- [x] Run `node scripts/check-doc-consistency.js`.
- [x] Run `npm run test:all`.

## Definition of Done

- [x] `Future Plan.md` contains `XPLAT-01` and explicitly says it does not conflict with `PAGES-01`.
- [x] Full portability plan is saved as this document.
- [x] User can export a single backup JSON.
- [x] User can download a backup JSON from Google Drive and import it for preview.
- [x] Safe merge restores learner records across devices.
- [x] Re-importing the same backup does not duplicate attempts/sessions/highlights.
- [x] Wrong file, stale file, and seed mismatch paths warn clearly and do not overwrite local seed.
- [x] Docs explain this is not real-time cloud sync.
- [x] Full regression suite passes after implementation.

## Test Commands

```powershell
npx playwright test tests/google-drive-backup.spec.ts
npx playwright test tests/app-pages-click-smoke.spec.ts
node scripts/check-doc-consistency.js
npm run test:all
```

## Rollback

Code rollback is limited to:

- `js/views/export.js`
- `js/vocab-tracker.js`
- `tests/google-drive-backup.spec.ts`
- `sw.js`
- `tests/pages-subpath-routing.spec.ts`
- related docs

No production seed rollback is needed because this task does not modify `data/vocab/*`, `SEED_VERSION`, or source question/curriculum JSON.
