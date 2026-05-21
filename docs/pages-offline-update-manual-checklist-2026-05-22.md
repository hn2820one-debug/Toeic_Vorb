# Pages Offline / Update Manual Checklist — 2026-05-22

Date: 2026-05-22  
Project: TOEIC Vocabulary Tracker (Program B)  
Purpose: Phase 8 manual acceptance for offline reopen, update pickup, and stale-shell repair on a Pages-like deployment  
Production seed impact: none  
Service worker cache impact: none; this checklist documents manual execution only

## Scope

Use this checklist when validating a real browser or phone against a deployed Pages-like URL. It is intentionally manual because broad offline service-worker automation remains out of the default Playwright matrix.

## Preconditions

- A Pages-like deployment is reachable at `index.html`, `tracker.html`, and `clear-sw.html`.
- The browser allows service workers and local caches for that origin.
- At least one browser session has loaded the app online once before the offline reopen checks.
- When validating update pickup, use a build where the shell assets or cache name changed.

## PAGES-08-01 — First Online Load Then Reopen Offline

1. Open the launcher online and wait for the page to fully settle.
2. Tap `開始學習 / 開啟主程式`, confirm `tracker.html` loads, then return to the launcher once.
3. Turn the device or browser fully offline.
4. Reopen `index.html` from the same origin.
5. Reopen `tracker.html` from the same origin.

Expected result:

- Launcher still renders readable copy and the main CTA.
- Tracker still opens the existing shell without a browser network error page.
- No cross-origin or missing-asset error is visible during the offline reopen.

Capture:

- Browser/device name and version.
- Whether launcher and tracker both reopened successfully offline.
- Any visible stale-content symptom.

## PAGES-08-02 — Update Pickup After Cache Version Change

1. Start from a browser that already visited the old deployed version.
2. Deploy or expose a build where `sw.js` has a newer `CACHE_NAME` or shell assets changed.
3. Reopen the launcher while online.
4. If the launcher still looks stale, use the `如果畫面怪怪的，先清除快取` link.
5. On `clear-sw.html`, tap `清除快取並重新整理`, then tap `完成 — 前往首頁`.
6. Confirm the launcher and tracker now show the new shell state.

Expected result:

- The new shell is visible after normal reopen or after the clear-sw recovery path.
- The browser no longer serves the stale cache after recovery.
- The launcher and tracker remain inside the shipped app paths.

Capture:

- Old cache name / new cache name if known.
- Whether normal reopen was enough or recovery was needed.
- Which visible app detail confirmed the update landed.

## PAGES-08-06 — Stale Shell Repair Path

1. From the launcher, open the `如果畫面怪怪的，先清除快取` link.
2. Confirm the page explains why the repair action exists.
3. Tap `清除快取並重新整理`.
4. Confirm the status message reports success and reveals `完成 — 前往首頁`.
5. Return to the launcher and reopen the tracker.

Expected result:

- The user can complete the repair flow without guessing hidden steps.
- The success state is visible before returning home.
- Returning home restores a working launcher/tracker shell.

Capture:

- Whether the repair copy was clear enough without developer assistance.
- Whether the recovery action solved the stale-shell symptom.
- Any wording that still caused hesitation on a phone-sized screen.

## Notes

- If the browser blocks service workers entirely, log that limitation and stop; the failure is environmental, not app-level.
- Keep screenshots of launcher, clear-sw status, and post-repair launcher state when running this checklist on a real device.