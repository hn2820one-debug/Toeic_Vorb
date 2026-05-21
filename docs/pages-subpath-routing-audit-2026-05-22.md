# Pages Subpath Routing Audit — Phase 2

Date: 2026-05-22  
Project: TOEIC Vocabulary Tracker (Program B)  
Scope: root path and repository-subpath routing  
Production seed impact: none  
Service worker cache impact: none

## Result

Phase 2 is complete. The launcher, tracker, return-home flow, and `clear-sw.html` utility page all load correctly from a Pages-like repository subpath, and production app navigation no longer points to files that are excluded from the Pages artifact.

| Checkpoint | Result | Evidence |
|---|---|---|
| `PAGES-02-01` | Pass | `index.html` uses relative `./manifest.json`, `./icons/icon-192.svg`, `./css/base.css`, `./tracker.html`, `./clear-sw.html`, and `./sw.js` paths. |
| `PAGES-02-02` | Pass | `tracker.html` uses relative stylesheet, manifest, icon, classic script, module script, and service worker paths under `./...`. |
| `PAGES-02-03` | Pass | App navigation to `index.html`, `tracker.html`, and `clear-sw.html` uses relative paths. Empty-seed runtime actions now stay inside the shipped app views. |
| `PAGES-02-04` | Pass | Static scan found no root-absolute production asset paths such as `/js/...`, `/data/...`, or `/css/...`. |
| `PAGES-02-05` | Pass | `tests/pages-subpath-routing.spec.ts` now covers mobile launcher-to-tracker navigation, tracker return-to-home, and direct `clear-sw.html` loading from a Pages-like subpath. |
| `PAGES-02-06` | Pass | Playwright served a copied Pages artifact through the existing local `http-server` at `/tmp/pages-subpath-site/toeic-app-Vorb/`; launcher, tracker, return-home flow, and `clear-sw.html` all loaded successfully. |

## Fix Applied

The audit found runtime buttons pointing to `./docs/Future%20Plan.md`. The Pages artifact intentionally excludes `docs/`, so those links would be dead in deployed Pages builds if an empty production seed state appeared.

Changed deployed app actions to stay inside shipped views:

- `js/vocab-tracker.js`: empty-seed banner primary action now opens Roadmap.
- `js/views/today.js`: empty-seed Next Action now opens Roadmap.
- `js/views/lesson.js`: empty lesson state primary action now opens Export.
- `TO_AI.md` and `docs/使用說明書.md`: updated current behavior notes.

## Verification

```text
node scripts/verify-pages-baseline.js
status: passed
```

```text
npx playwright test tests/pages-subpath-routing.spec.ts
11 passed
```

```text
node scripts/check-doc-consistency.js
Document consistency check passed.
```

The temporary subpath artifact used by the Playwright smoke was removed after the test run.

## Verification Improvement

2026-05-22 follow-up improvement: the shared Pages/mobile smoke now returns `11 passed`. Phase 2 route checks still prove the app can round-trip from launcher to tracker and back to launcher without leaving the shipped Pages artifact, while later phases reuse the same staged subpath harness for manifest, service worker, mobile shell, Settings-mobile, Export-mobile, and clear-sw mobile recovery verification.
