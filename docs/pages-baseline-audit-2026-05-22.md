# Pages Baseline Audit — Phase 1

Date: 2026-05-22  
Project: TOEIC Vocabulary Tracker (Program B)  
Scope: GitHub Pages deployment baseline only  
Production seed impact: none  
Service worker cache impact: none

## Result

Phase 1 is complete. The current Pages workflow and root static app files are suitable for a baseline GitHub Pages deployment from `main`, with repository-subpath-safe relative paths.

| Checkpoint | Result | Evidence |
|---|---|---|
| `PAGES-01-01` | Pass | `.github/workflows/pages.yml` publishes on `push` to `main` and `workflow_dispatch` only. |
| `PAGES-01-02` | Pass | Artifact collection copies `index.html`, `tracker.html`, `clear-sw.html`, `manifest.json`, `sw.js`, plus `css`, `js`, `data`, and `icons`. |
| `PAGES-01-03` | Pass | Simulated artifact excludes `drafts`, `tmp`, `docs`, `tests`, `Background`, `.github`, `node_modules`, `playwright-report`, and `test-results`. No Program A path is copied. |
| `PAGES-01-04` | Pass | Upload path is the artifact root, and app asset/navigation paths are relative (`./...`), so the app is compatible with a repository subpath such as `/toeic-app-Vorb/`. |
| `PAGES-01-05` | Pass | `index.html` links to `./tracker.html`; cache repair links use `./clear-sw.html`; tracker return links use `./index.html`. |
| `PAGES-01-06` | Pass | This file is the baseline acceptance checklist and result record. |

## Files Reviewed

- `.github/workflows/pages.yml`
- `index.html`
- `tracker.html`
- `clear-sw.html`
- `manifest.json`
- `sw.js`
- `css/`
- `js/`
- `data/`
- `icons/`

## Verification Notes

Repeatable command:

```powershell
node scripts/verify-pages-baseline.js
```

Static workflow check:

```text
workflowPushMain: true
workflowDispatch: true
artifactRootFiles: true
artifactDirs: true
uploadPathTmpSite: true
deployPages: true
missingRequiredAssets: []
```

Simulated artifact check:

```text
RequiredMissing: ""
ForbiddenPresent: ""
FileCount: 42
```

Root-absolute path check:

```text
No root-absolute asset or navigation paths found.
```

2026-05-22 improvement: `scripts/verify-pages-baseline.js` now reruns the workflow trigger check, artifact simulation, required-file check, forbidden-entry check, and root-absolute path scan from one command.

## Boundary Notes

- No files under `C:\Users\Keith\toeic-app` were read or modified.
- No `data/vocab/*` production content or seed version was changed.
- No V4 draft file was moved or enabled.
- This phase does not prove live GitHub Pages behavior, mobile layout, manifest fetch, or service worker update behavior. Those are covered by later phases in `docs/pages-mobile-experience-plan.md`.
