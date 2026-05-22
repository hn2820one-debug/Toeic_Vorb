# Google Drive OAuth Setup Checklist

更新日期：2026-05-23
計畫代號：`SYNC-01`
範圍：Phase 2 Google Cloud / OAuth setup

## Purpose

This checklist records the manual Google Cloud setup needed before the app can implement Drive sync. It is for personal testing only.

The app remains local-first. OAuth is used only to obtain a short-lived browser access token for the Google Drive API. Do not add a backend, do not store refresh tokens, and do not modify production seed data.

## Required Google Cloud Setup

- [ ] Create or choose a Google Cloud project for Program B personal testing.
- [ ] Enable the Google Drive API in that project.
- [ ] Configure the OAuth consent screen / Google Auth Platform.
- [ ] Set the app name to `TOEIC Vocabulary Tracker`.
- [ ] Set the audience for personal testing and add the user's Google account as a test user if required by the selected audience mode.
- [ ] Add the Drive scope `https://www.googleapis.com/auth/drive.file`.
- [x] Create an OAuth 2.0 Client ID with application type `Web application`.
- [ ] Add the missing local authorized JavaScript origins listed below.
- [x] Copy the generated Web Client ID.
- [x] Paste the Web Client ID into `js/google-drive-sync-config.js`.
- [x] Do not store or paste a client secret into this repo; browser apps use the client ID, not a client secret.

## Authorized JavaScript Origins

Add these origins in the Google Cloud OAuth client. Origins must not include `tracker.html`, query strings, or subpaths.

```text
http://127.0.0.1:3000
http://localhost:3000
http://127.0.0.1:8787
http://localhost:8787
https://hn2820one-debug.github.io
```

Notes:

- `http://127.0.0.1:3000` is the Playwright/http-server origin from `playwright.config.ts`.
- `http://127.0.0.1:8787` is the documented manual local server origin.
- The GitHub Pages live app path is currently `https://hn2820one-debug.github.io/Toeic_Vorb/`, but OAuth authorized JavaScript origins use only `https://hn2820one-debug.github.io`.
- If `PAGES_URL` or the GitHub remote changes later, update this checklist before implementing or testing Drive sync.

Observed downloaded Web OAuth client on 2026-05-23:

- Client ID copied into repo config: `231659540073-6f94pr1akb4qsns5vrsdkkn6i8g70kj0.apps.googleusercontent.com`.
- The downloaded JSON contains a `client_secret`; do not copy it into this repo.
- Current authorized JavaScript origins in that JSON: `http://localhost:5173`, `https://hn2820one-debug.github.io`.
- Still add `http://127.0.0.1:3000`, `http://localhost:3000`, `http://127.0.0.1:8787`, and `http://localhost:8787` in Google Cloud before local browser authorization testing.

## Repo-Side Phase 2 Defaults

- Static config file: `js/google-drive-sync-config.js`.
- `clientId`: `231659540073-6f94pr1akb4qsns5vrsdkkn6i8g70kj0.apps.googleusercontent.com`.
- Scope: `https://www.googleapis.com/auth/drive.file`.
- Drive folder: `TOEIC Vocabulary Tracker Sync`.
- Sync file: `toeic_vocab_drive_sync_state.json`.
- Access token storage: memory only in the future Drive sync client.
- Manual fallback: `XPLAT-01` Export backup/restore remains available.

## Official References

- Google Identity Services for web authorization: https://developers.google.com/identity/oauth2/web/guides/overview
- Google API Client ID setup and authorized JavaScript origins: https://developers.google.com/identity/oauth2/web/guides/get-google-api-clientid
- Google Identity Services token model: https://developers.google.com/identity/oauth2/web/guides/use-token-model
- Enable Google Workspace APIs / Drive API: https://developers.google.com/workspace/guides/enable-apis
- Drive API scopes and `drive.file`: https://developers.google.com/workspace/drive/api/guides/api-specific-auth

## Phase 2 Status

- [x] Repo-side setup checklist created.
- [x] Required origins documented.
- [x] Static config location selected.
- [x] Personal-testing-only boundary documented.
- [x] Missing-client-ID disabled state implemented in Settings.
- [x] Missing-client-ID disabled state covered by `tests/google-drive-sync.spec.ts`.
- [x] Web OAuth Client ID provided by user and copied into `js/google-drive-sync-config.js`.
- [x] Client secret intentionally not copied into repo.
- [ ] Google Cloud project confirmed by user.
- [ ] Drive API enabled in Google Cloud.
- [ ] OAuth consent screen configured.
- [ ] Test user added if needed.
- [x] Web OAuth Client ID created.
- [x] Client ID copied into `js/google-drive-sync-config.js`.

Blocked on: confirming Drive API, OAuth consent screen, test-user access, and adding the missing local authorized origins in Google Cloud Console.
