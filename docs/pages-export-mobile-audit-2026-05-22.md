# Pages Export Mobile Audit — Phase 7 Verification

Date: 2026-05-22  
Project: TOEIC Vocabulary Tracker (Program B)  
Scope: Export mobile layout, inventory readability, fallback download flow, and preview containment under a Pages-like mobile viewport  
Production seed impact: none  
Service worker cache impact: none; this audit reuses the shared Pages/mobile smoke

## Result

Phase 7 is verified for the current repo-controlled Pages/mobile baseline. The Export view exposes the primary package CTA earlier in the mobile viewport, renders inventory buttons as full-width touch targets under mobile widths, keeps the preview inside a local scroll area, and has automated proof that the no-folder-picker fallback stages per-file downloads instead of silently failing. The only remaining item is a manual real-device browser download check for `PAGES-07-06`.

| Checkpoint | Result | Evidence |
|---|---|---|
| `PAGES-07-01` | Pass | The shared mobile smoke verifies the export inventory stays readable under `390x844`, with full-width file buttons and no full-page horizontal overflow. |
| `PAGES-07-02` | Pass | Playwright forces `showDirectoryPicker` to be unavailable, clicks `匯出完整資料封包`, and confirms the fallback path records staged per-file downloads. |
| `PAGES-07-03` | Pass | Mobile CSS now renders `.export-category-files` as a single-column grid with touch-sized full-width buttons, eliminating overlap risk between per-file download actions. |
| `PAGES-07-04` | Pass | The mobile smoke verifies `.export-preview` stays inside its own scroll area and does not expand the document width beyond the viewport. |
| `PAGES-07-05` | Pass | `tests/pages-subpath-routing.spec.ts` now includes a mobile Export fallback smoke that asserts the warning notice and per-file staged download events. |
| `PAGES-07-06` | In progress | Real mobile Chrome or Safari download behavior still needs a manual device/browser check before this phase can fully close. |

## Files Reviewed

- `js/views/export.js`
- `css/tracker.css`
- `tests/pages-subpath-routing.spec.ts`

## Verification

Repeatable command:

```powershell
npx playwright test tests/pages-subpath-routing.spec.ts
```

Expected result after this Phase 7 verification:

```text
11 passed
```

## Findings

- The previous mobile Export layout kept the main package CTA below the metrics grid, which pushed the primary action beneath the first viewport on smaller screens.
- This phase moved the primary export action earlier in the panel and converted per-file download buttons into full-width touch targets under mobile width.
- The fallback path is now explicitly regression-tested by stubbing `downloadText`, so the mobile export flow has automated evidence even without invoking a real browser download UI.

## Remaining Work

- Manual real-device verification is still needed for Chrome/Safari download behavior.
- If later export categories or file counts increase, the one-column mobile button layout should remain part of the regression baseline.