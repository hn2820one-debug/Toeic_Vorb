# Pages Offline And Update Audit — Phase 8 Verification

Date: 2026-05-22  
Project: TOEIC Vocabulary Tracker (Program B)  
Scope: clear-sw mobile recovery flow, status visibility, return-home path, and Phase 8 test-boundary notes under a Pages-like mobile viewport  
Production seed impact: none  
Service worker cache impact: none; this audit reuses the shared Pages/mobile smoke

## Result

Phase 8 is verified for the current repo-controlled baseline. The `clear-sw.html` page behaves as a mobile recovery entry, and the previously open offline/update items are now closed by an explicit manual acceptance checklist that covers first-load-online then reopen-offline, cache-version update pickup, and the stale-shell repair path. Broad offline behavior still stays manual by design instead of being forced into the default Playwright matrix.

| Checkpoint | Result | Evidence |
|---|---|---|
| `PAGES-08-01` | Pass | `docs/pages-offline-update-manual-checklist-2026-05-22.md` now defines a manual acceptance flow for first online load, then launcher/tracker reopen while offline. |
| `PAGES-08-02` | Pass | The same manual checklist now defines the cache-version update pickup flow, including when to fall back to `clear-sw.html`. |
| `PAGES-08-03` | Pass | A new mobile clear-sw smoke clears cache state, exposes the `前往首頁` recovery action, and confirms the launcher reload path works under `390x844`. |
| `PAGES-08-04` | Pass | `tests/pages-subpath-routing.spec.ts` now asserts clear-sw status visibility, touch-sized buttons, and no page-level horizontal overflow in the mobile viewport. |
| `PAGES-08-05` | Pass | This audit records the current limitation explicitly: only the service-worker-allowed slice uses SW in Playwright, while broader offline behavior remains manual to avoid suite flake. |
| `PAGES-08-06` | Pass | The repair path is now documented both in-product and in the manual checklist, so stale-shell recovery has a clear user-facing route. |

## Files Reviewed

- `clear-sw.html`
- `tests/pages-subpath-routing.spec.ts`
- `docs/pages-mobile-experience-plan.md`
- `docs/pages-offline-update-manual-checklist-2026-05-22.md`

## Verification

Repeatable focused command:

```powershell
npx playwright test tests/pages-subpath-routing.spec.ts -g "clear-sw"
```

Expected focused result:

```text
2 passed
```

Shared smoke command:

```powershell
npx playwright test tests/pages-subpath-routing.spec.ts
```

Expected shared result after this Phase 8 verification:

```text
11 passed
```

## Findings

- The previous `clear-sw.html` page already worked, but it behaved like a minimal utility page rather than a clearly mobile-friendly repair surface.
- This phase adds a card-based layout, touch-sized action buttons, an `aria-live` status region, and automated proof that the recovery action remains reachable after clearing caches.
- Playwright should continue to keep most offline/update validation out of the default matrix; the targeted clear-sw slice is stable because it runs only inside the service-worker-allowed block.

## Remaining Work

- Execute the manual checklist on a real Pages URL and record device/browser results.