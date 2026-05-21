# Pages Manifest And Installability Audit — Phase 3

Date: 2026-05-22  
Project: TOEIC Vocabulary Tracker (Program B)  
Scope: manifest readability, relative install metadata, and launcher/tracker install links under a Pages-like repository subpath  
Production seed impact: none  
Service worker cache impact: none

## Result

Phase 3 is complete for the current Pages/mobile baseline. The deployed manifest metadata is Pages-safe and browser-readable from a repository subpath, the launcher/tracker pages expose consistent install metadata, and a Playwright standalone-display simulation now proves the in-app return-home flow still works under mobile viewport conditions.

| Checkpoint | Result | Evidence |
|---|---|---|
| `PAGES-03-01` | Pass | `manifest.json` is copied into the staged Pages artifact root and `fetch("./manifest.json")` returns `200` from the launcher and tracker under `/tmp/pages-subpath-site/toeic-app-Vorb/`. |
| `PAGES-03-02` | Pass | `manifest.json` keeps Pages-safe relative values: `start_url`=`./index.html`, `scope`=`./`, icons=`./icons/...`. |
| `PAGES-03-03` | Pass | Playwright simulates `display-mode: standalone`, opens the tracker from the launcher, and confirms the in-app `返回首頁` action still round-trips to `index.html` under the Pages-like subpath. |
| `PAGES-03-04` | Pass | `index.html` and `tracker.html` both declare `link rel="apple-touch-icon" href="./icons/icon-192.svg"`. |
| `PAGES-03-05` | Pass | Playwright browser context fetches the manifest successfully from the staged Pages subpath with no request failures or `4xx/5xx` responses. |
| `PAGES-03-06` | Pass | Playwright parses the returned manifest JSON and validates `start_url`, `scope`, `display`, and icon entries. |

## Files Reviewed

- `manifest.json`
- `index.html`
- `tracker.html`
- `tests/pages-subpath-routing.spec.ts`

## Verification

Repeatable command:

```powershell
npx playwright test tests/pages-subpath-routing.spec.ts
```

Expected result after this Phase 3 verification:

```text
11 passed
```

This Phase 3 verification intentionally reuses the staged Pages-like subpath test harness from Phase 2 instead of expanding into a broader mobile matrix.

## Remaining Work

- Decide later whether `clear-sw.html` also needs explicit install metadata, based on real-device install behavior.
- Fold the manifest smoke into the later mobile CI gate during Phase 9.
- Cross-browser install prompt differences and real-device home-screen install behavior remain deferred work, even though the app-shell return-home path now has automated standalone-mode coverage.

## Improvement

2026-05-22 follow-up improvement: `tests/pages-subpath-routing.spec.ts` now includes a standalone-display simulation that verifies the mobile launcher/tracker round-trip still works when the browser reports `display-mode: standalone`. The shared Pages/mobile smoke currently returns `11 passed` because later phases now reuse the same staged subpath harness for service worker, shell, Settings-mobile, Export-mobile, and clear-sw mobile recovery verification.