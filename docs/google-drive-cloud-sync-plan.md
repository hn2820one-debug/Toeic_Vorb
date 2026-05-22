# Google Drive 自動跨裝置同步計畫

更新日期：2026-05-23
計畫代號：`SYNC-01`
範圍：Program B learner records cloud sync

## Summary

本計畫把已完成的 `XPLAT-01` 手動 Google Drive 備份 / 還原，升級為真正跨裝置同步。目標是讓使用者在不同裝置使用同一個 Google Drive 帳戶時，學習進度、複習隊列、答題紀錄與 mastery progress 可以延續。

`SYNC-01` 是使用者指定的 parallel UX/data-portability work，不是 content promotion。它不取代 `PAGES-01`，不解除 GitHub Pages live deployment 與手機端剩餘驗收，不修改 `data/vocab/*`，不啟用 V4，不改 production seed version，也不新增後端或 build tooling。

這是原本「不新增 login / cloud sync」規則的明確有限例外：只允許 Google Identity Services + Google Drive API，使用可見 Google Drive 資料夾 `TOEIC Vocabulary Tracker Sync` 與單一同步檔 `toeic_vocab_drive_sync_state.json`。App 仍然保持 local-first；IndexedDB 是本機主資料，Google Drive 只是同步層。

## Sync Contract

- Drive location: Google Drive visible folder `TOEIC Vocabulary Tracker Sync`.
- Main cloud file: `toeic_vocab_drive_sync_state.json`.
- OAuth mode: personal testing Web Client ID.
- Scope: `https://www.googleapis.com/auth/drive.file`.
- Token policy: access token stays in memory only; do not store Google token in IndexedDB or localStorage.
- Fallback: existing `XPLAT-01` manual backup/restore remains available.
- Data included: learner records only (`attempts`, `sessions`, `review_queue`, `error_logs`, `vocab_items` mastery/progress, `lessons` progress/status, local-first settings, exports metadata, word highlights).
- Data excluded: production question JSON, curriculum source JSON, V4 draft files, active runtime session, Google account profile beyond the minimum auth state.
- Seed policy: `seed_version` is recorded for warning and audit only; Drive sync must not overwrite production seed or local source content.

## Phase Plan

### Phase 1 — Plan / Future Plan Linkage

- [x] Create this file as `docs/google-drive-cloud-sync-plan.md`.
- [x] Mark the plan code as `SYNC-01`.
- [x] State that `SYNC-01` follows `XPLAT-01` and does not replace the manual fallback.
- [x] State that `PAGES-01` remains open and is not closed by this work.
- [x] State that GitHub Pages live deployment acceptance remains required.
- [x] State that no content promotion is authorized by this work.
- [x] State that no `data/vocab/*` production question or curriculum source files are modified.
- [x] State that V4 remains draft-only and must not be enabled.
- [x] State that production seed version is not changed by the plan phase.
- [x] Record the scoped exception to the existing no-login / no-cloud-sync hard rule.
- [x] Add `SYNC-01` to `docs/Future Plan.md` as user-requested parallel work.
- [x] Update `TO_AI.md` so future agents see the approved scoped sync exception.

### Phase 2 — Google Cloud / OAuth Setup

Status: completed on 2026-05-23. Web OAuth Client ID is copied into `js/google-drive-sync-config.js`, and live authorization is validated on normal desktop/mobile browsers for the user's Google Drive account. Remaining local authorized origins are optional follow-up for future local browser auth testing only.

- [x] Confirm the Google Cloud project used for personal testing.
- [x] Enable the Google Drive API in that project.
- [x] Configure OAuth consent screen for personal testing.
- [x] Add the user's Google account as a test user.
- [x] Create a Web OAuth Client ID.
- Optional local-only follow-up: add local development origins such as `http://127.0.0.1:8787` when future local browser authorization testing is required.
- Optional local-only follow-up: add any active local dev origin used by Playwright or smoke testing when future local browser authorization testing is required.
- [x] Add the GitHub Pages origin for the deployed Program B URL.
- [x] Store the client ID in a static config location that can be disabled safely when blank: `js/google-drive-sync-config.js`.
- [x] Verify the app shows Drive Sync as unavailable when the client ID is missing, and disconnected with connect enabled after the client ID is configured.
- [x] Document that the OAuth setup is personal testing only, not a public multi-user rollout: `docs/google-drive-oauth-setup.md`.

Phase 2 repo-side additions:

- [x] Create `docs/google-drive-oauth-setup.md` with manual Google Cloud setup steps.
- [x] Document required authorized JavaScript origins for Playwright/local/manual/GitHub Pages use.
- [x] Record official Google references for GIS authorization, token model, Drive API enablement, and `drive.file`.
- [x] Create `js/google-drive-sync-config.js` with `drive.file` scope, folder name, sync filename, and the user-provided Web OAuth Client ID.
- [x] User fills `clientId` after creating the Web OAuth Client ID in Google Cloud Console.
- [x] Verify the downloaded OAuth JSON is a Web client and that no client secret is copied into repo.
- [x] Settings UI verifies and displays both the prior missing-client-ID disabled state and the current configured-but-disconnected state.
- [x] `tests/google-drive-sync.spec.ts` covers configured client ID, no client secret in config, disconnected Settings controls, and no GIS script load for pre-token Drive API rejection.

### Phase 3 — Drive Auth / API Client

Status: completed on 2026-05-23. The Drive client is implemented, the Web OAuth client ID is configured without storing a client secret, and live Google authorization is validated in normal desktop/mobile browsers.

- [x] Add a small Drive sync client module without changing app build tooling: `js/google-drive-sync-client.js`.
- [x] Load Google Identity Services only when the user explicitly connects or sync code asks for a token.
- [x] Initialize a token client with the configured Web Client ID and `drive.file` scope.
- [x] Implement Connect to Google Drive.
- [x] Implement Disconnect from Google Drive.
- [x] Keep access tokens in memory and clear them on disconnect.
- [x] Find or create the visible sync folder `TOEIC Vocabulary Tracker Sync`.
- [x] Find or create the sync file `toeic_vocab_drive_sync_state.json`.
- [x] Download and parse cloud sync state.
- [x] Upload sync state with Drive file update.
- [x] Surface auth/API errors through a small status object for the UI.

Phase 3 repo-side additions:

- [x] Add `js/google-drive-sync-client.js` as an inert global client loaded after `js/google-drive-sync-config.js`.
- [x] Add Settings Drive Sync status panel with disabled controls while `clientId` is blank, and configured/disconnected controls after the client ID is present.
- [x] Expose `connectGoogleDrive`, `disconnectGoogleDrive`, and `syncGoogleDriveNow` through `window.VocabTracker`.
- [x] Add `tests/google-drive-sync.spec.ts` for the unconfigured/configured safety paths and later Phase 6 auto-sync UX.
- [x] Add the new config/client assets to `tracker.html` and the service-worker precache.
- [x] Advance service-worker cache to `toeic-vorb-v40` because shipped JS assets changed.
- [x] Validate live Google authorization in normal desktop/mobile browsers.

### Phase 4 — Sync Data Contract / Builder

Status: verified and improved on 2026-05-23. Repo-side payload builder/validator is implemented and tested; upload payload validation was added before Drive writes. Merge behavior is now Phase 5 work.

- [x] Define `sync_version`.
- [x] Define `app_id` as `toeic-vocab-tracker`.
- [x] Include current `seed_version`.
- [x] Include `updated_at`.
- [x] Generate and persist a local `device_id` that is not tied to Google identity.
- [x] Include `last_writer_device_id`.
- [x] Include summary counts for attempts, sessions, review queue, vocab items, and latest attempt time.
- [x] Export learner stores from IndexedDB through existing DB helpers where possible.
- [x] Include localStorage learner preferences/highlights that are already part of the manual backup contract.
- [x] Exclude production question and curriculum source JSON.
- [x] Validate required fields before accepting a downloaded cloud state.

Phase 4 repo-side additions:

- [x] Add `js/google-drive-sync-data.js` for payload building, validation, summary, and local device ID persistence.
- [x] Load `js/google-drive-sync-data.js` from `tracker.html` before the Drive client.
- [x] Expose `buildGoogleDriveSyncPayload` and `validateGoogleDriveSyncPayload` through `window.VocabTracker`.
- [x] Use the data builder when the Drive client creates the initial sync file.
- [x] Validate downloaded Drive sync state before returning it from the Drive client.
- [x] Validate upload payload shape before writing a sync state back to Drive.
- [x] Extend `tests/google-drive-sync.spec.ts` to cover payload shape, device ID persistence, forbidden source stores, and validator errors.
- [x] Add the new data module to the service-worker precache.
- [x] Advance service-worker cache to `toeic-vorb-v42` because the shipped sync config asset now contains the user-provided Web OAuth client ID.

### Phase 5 — Safe Merge / Conflict Rules

Status: verified and improved on 2026-05-23. Repo-side safe merge/conflict rules are implemented and covered by `tests/google-drive-sync.spec.ts`; pending-change metadata is now connected to Phase 6 auto-sync UX. Live Drive authorization still depends on Phase 2 Google Cloud setup.

- [x] Treat local IndexedDB as usable even when Drive sync fails.
- [x] Deduplicate `attempts` by keyPath / stable ID.
- [x] Deduplicate `sessions` by keyPath / stable ID.
- [x] Deduplicate `error_logs` by keyPath / stable ID.
- [x] Deduplicate `review_queue` by keyPath / stable ID and keep the safer due/retry state.
- [x] Merge `vocab_items` learner mastery/progress fields without replacing seed metadata.
- [x] Merge `lessons` progress/status fields without replacing curriculum metadata.
- [x] Keep settings local-first unless a setting is explicitly safe to merge.
- [x] Merge `word_highlights` by highlight ID or stable fallback key.
- [x] Treat seed mismatch as a warning and never as permission to rewrite production seed.
- [x] Ensure syncing the same cloud state twice is idempotent.

Phase 5 repo-side additions:

- [x] Add `GoogleDriveSyncData.analyzeMerge(payload)` for previewable merge plans and seed mismatch warnings.
- [x] Add `GoogleDriveSyncData.mergePayload(payload)` for learner-record safe merge.
- [x] Block unknown `lessons` and unknown `vocab_items` instead of importing cloud seed metadata.
- [x] Add safer `review_queue` conflict handling: earliest due/retry date, max priority/retry counts, pending/repeated-error preserved.
- [x] Keep existing settings local-first; add only missing non-protected settings and never import cloud `seed_version`.
- [x] Keep localStorage preferences local-first while allowing missing cloud preference keys to be added.
- [x] Update Settings `Sync now` to download, validate, safe-merge, rebuild local payload, and upload the merged learner state.
- [x] Expose sync merge helpers through `window.VocabTracker` for tests and future UI.
- [x] Extend `tests/google-drive-sync.spec.ts` for idempotent safe merge, seed mismatch warning, metadata preservation, and invalid-payload no-mutation behavior.
- [x] Advance service-worker cache to `toeic-vorb-v43` because shipped sync JS assets changed.

### Phase 6 — Auto Sync UX

Status: verified and improved on 2026-05-23. Repo-side auto-sync UX/state is implemented and tested without storing Google tokens. Live end-to-end Drive behavior still waits on Phase 2 OAuth/API confirmation.

- [x] Add a Drive Sync panel in Settings.
- [x] Show connected / disconnected / reconnect required status.
- [x] Show the Google Drive folder and sync filename.
- [x] Show last successful sync time.
- [x] Show pending local changes when available.
- [x] Add a `Sync now` action.
- [x] Add an auto-sync enabled/paused toggle.
- [x] Trigger pull/merge on app start when auto-sync is enabled and token is valid.
- [x] Trigger scheduled push after lesson completion, review completion, settings changes, and word highlight changes.
- [x] Trigger retry when the browser returns online.
- [x] Explain that background sync does not run while the app is closed.

Phase 6 repo-side additions:

- [x] Add local auto-sync metadata helpers: enabled/paused, pending count/reasons, last attempt, last success, and last error.
- [x] Settings shows last successful sync, pending local changes, pending reasons, auto-sync toggle, and the background-sync limitation note.
- [x] Manual `Sync now` records attempt/success/failure metadata and clears pending markers after successful upload.
- [x] Auto sync runs only when enabled, browser is online, and Drive client status is connected with an in-memory token.
- [x] App start schedules a pull/merge/upload only if auto sync is enabled and a valid in-memory token exists.
- [x] Online retry schedules sync for pending local changes when auto sync is enabled.
- [x] Lesson completion, review completion, settings changes, and word-highlight changes mark pending local changes and schedule auto sync when connected.
- [x] `tests/google-drive-sync.spec.ts` covers Settings auto-sync UX, pending markers, connected-only scheduler, and pending clear after upload.
- [x] Advance service-worker cache to `toeic-vorb-v44` because shipped sync UX/state assets changed.

### Phase 7 — Failure Handling / Safety

Status: verified and improved on 2026-05-23. Repo-side failure-handling/safety is implemented and tested: pending changes stay queued while offline, 401/403 becomes reconnect-required, retryable Drive API failures back off without breaking the connected state, older sync versions warn, duplicate sync files prefer the latest app-created candidate, and upload conflicts trigger one safe re-merge before retry.

- [x] Handle offline state without blocking learning.
- [x] Queue a pending sync marker when local changes cannot be pushed.
- [x] Handle 401/403 by showing reconnect required.
- [x] Handle 429 and 5xx with retry/backoff.
- [x] Reject invalid JSON before any local merge.
- [x] Reject wrong `app_id` before any local merge.
- [x] Warn on old `sync_version` and block unsupported future versions.
- [x] Detect duplicate candidate sync files and select the latest app-created file.
- [x] Re-read cloud modified time before upload to reduce overwrite conflicts.
- [x] Re-merge once if the cloud file changed during upload preparation.
- [x] Keep `XPLAT-01` manual backup export available as rollback and recovery path.

Phase 7 repo-side additions:

- [x] Retryable Drive API failures (`429`, `500`, `502`, `503`, `504`) now retry up to three attempts with backoff before surfacing a warning.
- [x] Retryable Drive failures keep the Drive client status as connected, so future auto-sync retries do not require a manual reconnect.
- [x] Offline/manual failures leave pending local changes queued; the existing online retry path remains active.
- [x] `401` / `403` now clear the in-memory token and switch Settings to reconnect-required status.
- [x] Older `sync_version` payloads now pass with a compatibility warning, while unsupported future versions are rejected before merge.
- [x] Duplicate sync-file candidates now prefer the latest app-created Drive file instead of the first arbitrary match.
- [x] Upload now re-reads `modifiedTime` before write, and `performGoogleDriveSync()` re-merges once if the cloud file changed during upload preparation.
- [x] `tests/google-drive-sync.spec.ts` now covers reconnect-required and retryable-backoff failure paths.
- [x] `tests/google-drive-sync.spec.ts` now also covers sync-version compatibility warnings, duplicate sync-file selection, upload conflict blocking, and one-shot re-merge behavior.
- [x] Advance service-worker cache to `toeic-vorb-v46` because shipped sync failure-handling assets changed again.

### Phase 8 — Tests / Acceptance

Status: completed on 2026-05-23. Acceptance coverage is implemented and green: payload shape, invalid JSON rejection, idempotent merge, seed mismatch warning, mocked GIS connect, first-device cloud push, second-device restore, two-device merge, mobile Settings controls, full regression, and real browser desktop/mobile sync validation all pass.

- [x] Add unit or script coverage for sync payload shape.
- [x] Add invalid cloud JSON rejection coverage.
- [x] Add idempotent merge coverage for repeated cloud state.
- [x] Add seed mismatch warning coverage.
- [x] Add mocked Google Identity Services connect coverage.
- [x] Add mocked Drive folder/file create coverage.
- [x] Add Playwright coverage for first-device lesson completion and cloud push.
- [x] Add Playwright coverage for second-device pull and restored Today/Mastery/Review state.
- [x] Add two-device merge coverage for attempts and sessions counts.
- [x] Add mobile `390x844` coverage for Settings Drive Sync controls.
- [x] Add timeout handling for stalled/popup-blocked OAuth connect attempts so Connect no longer hangs indefinitely.
- [x] Validate normal-browser live sync on both desktop and phone using the same Google Drive account.
- [x] Run `node scripts/check-doc-consistency.js`.
- [x] Run `npm run test:all`.

Phase 8 repo-side additions:

- [x] `tests/google-drive-sync.spec.ts` now covers mocked GIS connect via Settings controls, stalled OAuth connect timeout handling, invalid cloud JSON rejection, first-device cloud push, second-device restore, two-device merge, and mobile `390x844` Settings operation.
- [x] `GoogleDriveSyncClient.connect()` now times out stalled GIS popup attempts and returns a retryable disconnected state with a clear popup-blocker / sign-in completion message instead of hanging indefinitely.
- [x] Live Pages probing in the VS Code embedded browser reached GIS but the popup could not open there; treat embedded-browser popup blocking as a tooling limitation, not as proof that the configured Pages origin is invalid.
- [x] User confirmed successful same-account desktop/phone live sync in normal browsers on 2026-05-23.
- [x] Advance service-worker cache to `toeic-vorb-v48` because shipped sync Settings/status assets changed after SYNC completion cleanup.

## Definition of Done

- [x] `docs/Future Plan.md` contains `SYNC-01` and states it does not conflict with `PAGES-01`.
- [x] This plan remains the detailed checkpoint source for the Drive sync implementation.
- [x] Settings exposes Google Drive connect, status, sync now, pause, and disconnect controls.
- [x] Same Google Drive account can sync learner records between at least two devices.
- [x] Auto sync works while the app is open and the token is valid.
- [x] Token expiry, offline state, seed mismatch, and corrupt cloud file paths warn clearly and do not damage local data.
- [x] Repeated sync does not duplicate attempts, sessions, review queue items, or word highlights.
- [x] Production question/curriculum seed files are never imported from Drive.
- [x] `XPLAT-01` manual backup/restore remains available.
- [x] Full regression suite passes after implementation.

## Test Commands

```powershell
node scripts/check-doc-consistency.js
npm run test:all
npx playwright test tests/google-drive-sync.spec.ts
```

## Rollback

Rollback should remove or disable only the Drive Sync feature surface and related sync client/tests/docs. No production seed rollback is required because `SYNC-01` must not modify `data/vocab/*`, `SEED_VERSION`, source question JSON, or source curriculum JSON.

## Completion

`SYNC-01` completed on 2026-05-23.

Completion evidence:

- Repo-side Phases 1-8 are green.
- `tests/google-drive-sync.spec.ts` passes with the full sync acceptance suite.
- `npm run test:all` passes.
- The user confirmed successful normal-browser sync on both desktop and phone using the same Google Drive account.
