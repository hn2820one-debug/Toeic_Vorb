# Pages Service Worker Audit — Phase 4

Date: 2026-05-22  
Project: TOEIC Vocabulary Tracker (Program B)  
Scope: Pages subpath service worker scope, precache coverage, and manual cache-repair path  
Production seed impact: none  
Service worker cache impact: none to `CACHE_NAME`; precache coverage repaired inside the current service worker

## Result

Phase 4 is complete for the current Pages/mobile baseline. The service worker registers correctly under a Pages-like repository subpath, the shipped precache list covers every runtime-fetched vocabulary data file, `data/vocab/*.json` now uses network-first fallback instead of cache-first stale delivery, and `clear-sw.html` has an automated recovery proof that clears stale caches before reloading the current launcher asset set.

| Checkpoint | Result | Evidence |
|---|---|---|
| `PAGES-04-01` | Pass | Playwright runs with `serviceWorkers: "allow"` and confirms `navigator.serviceWorker.getRegistration()` resolves to the repository subpath scope and `./sw.js` script URL under `/tmp/pages-subpath-site/toeic-app-Vorb/`. |
| `PAGES-04-02` | Pass | `node scripts/verify-pages-service-worker.js` confirms every `STATIC_ASSETS` entry exists in the staged Pages artifact, and that all runtime-fetched vocab data files are precached. The audit exposed a gap and this phase repaired it by adding `./data/vocab/grammar_links.json` to `STATIC_ASSETS`. |
| `PAGES-04-03` | Pass | `sw.js` now documents the cache-bump rule directly, and this phase advanced the cache from `toeic-vorb-v37` to `toeic-vorb-v38` because deployed shell assets changed (`index.html`, `sw.js`). |
| `PAGES-04-04` | Pass | `sw.js` now applies network-first fallback to same-origin `data/vocab/*.json` requests while keeping stale-while-revalidate for the shell, reducing stale curriculum/question payload risk when online. |
| `PAGES-04-05` | Pass | `clear-sw.html` remains in the shipped root artifact, and the existing mobile subpath smoke opens it successfully as a manual cache-repair page. |
| `PAGES-04-06` | Pass | Playwright seeds the current service worker cache, opens `clear-sw.html`, confirms registrations and caches drop to zero after the clear action, then returns to `index.html` and verifies the current launcher asset plus the re-registered `toeic-vorb-v38` cache. |

## Files Reviewed

- `sw.js`
- `index.html`
- `tracker.html`
- `clear-sw.html`
- `js/vocab-tracker.js`
- `scripts/verify-pages-service-worker.js`
- `tests/pages-subpath-routing.spec.ts`

## Verification

Repeatable commands:

```powershell
node scripts/verify-pages-service-worker.js
npx playwright test tests/pages-subpath-routing.spec.ts
```

Expected result after this Phase 4 verification:

```text
verify-pages-service-worker.js => status: passed
pages-subpath-routing.spec.ts => 11 passed
```

## Findings

- The app initializes `grammar_links.json` during tracker startup, and the service worker now precaches it alongside the rest of the runtime vocab data set.
- This phase changed deployed shell assets, so the cache name advanced to `toeic-vorb-v38` in line with the documented bump rule.
- `data/vocab/*.json` no longer waits for background refresh; online requests now try the network first and fall back to cache only when needed.

## Remaining Work

- Real offline behavior and post-update first-load UX still belong to Phase 8.
- Post-audit note: `XPLAT-01` changed shipped JS assets after this Phase 4 audit, advancing `CACHE_NAME` beyond `toeic-vorb-v38` to `toeic-vorb-v39`. `SYNC-01` Phase 3 added Drive sync config/client shipped assets (`toeic-vorb-v40`), Phase 4 added the sync payload builder asset, the user-provided Web OAuth client ID updated the shipped config asset, Phase 5 added safe-merge logic, Phase 6 added auto-sync UX/state, and Phase 7 completed the repo-side failure-handling/safety slice, so current cache is `toeic-vorb-v46`.
