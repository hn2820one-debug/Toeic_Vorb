# Pages Mobile Coverage Audit — Phase 9 Verification

Date: 2026-05-22  
Project: TOEIC Vocabulary Tracker (Program B)  
Scope: minimal mobile smoke entrypoint, shared Pages/mobile coverage categories, and suite-boundary rules for Playwright  
Production seed impact: none  
Service worker cache impact: none; this phase formalizes the existing shared smoke surface

## Result

Phase 9 is verified for the current repo baseline. The existing shared Pages/mobile regression spec is formalized as a dedicated command entrypoint, its test names surface failure categories directly in Playwright output, and the aggregate validation workflow now runs `npm run test:all` instead of a Playwright-only command.

| Checkpoint | Result | Evidence |
|---|---|---|
| `PAGES-09-01` | Pass | `package.json` now exposes `npm run test:pages-mobile`, which runs the existing shared Pages/mobile smoke without creating a broader matrix. |
| `PAGES-09-02` | Pass | `tests/pages-subpath-routing.spec.ts` covers launcher pathing, tracker init, Settings mobile, Export mobile, and manifest/installability checks. |
| `PAGES-09-03` | Pass | The new mobile smoke entrypoint is additive; existing `playwright test` and desktop-oriented test flows remain unchanged. |
| `PAGES-09-04` | Pass | Service worker coverage remains scoped to the targeted `serviceWorkers: "allow"` block inside the shared spec instead of becoming a whole-suite default. |
| `PAGES-09-05` | Pass | Local validation confirms `npm run test:all` passes, and `.github/workflows/e2e.yml` now uses that aggregate command as the workflow entrypoint. |
| `PAGES-09-06` | Pass | Test titles now begin with category prefixes such as `path:`, `layout:`, `manifest:`, `export:`, `settings:`, `service-worker:`, and `repair:` so failures point to the affected surface immediately. |

## Files Reviewed

- `package.json`
- `tests/pages-subpath-routing.spec.ts`
- `docs/pages-mobile-experience-plan.md`
- `.github/workflows/e2e.yml`

## Verification

Focused command:

```powershell
npm run test:pages-mobile
```

Expected result after this Phase 9 verification:

```text
11 passed
```

## Findings

- The repo already had a good shared Pages/mobile smoke surface, but it was still implicit inside the general Playwright entrypoints.
- This phase makes that smoke reusable by name and makes failures easier to classify from the default Playwright output.
- The suite boundary stays intact: service-worker-sensitive checks remain explicit and local instead of leaking into every Playwright test, while the workflow now exercises the full aggregate validation command.

## Remaining Work

- If future mobile work expands beyond this spec, keep it as a smoke layer instead of turning it into a second full E2E matrix.