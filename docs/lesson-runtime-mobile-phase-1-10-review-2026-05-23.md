# MOBILE-DEPTH-01 Phase 1-10 Review

Date: 2026-05-23  
Scope: Program B mobile lesson runtime, review flow, post-lesson surfaces, offline/sync-aware behavior, and release gate  
Production seed impact: none

## Summary

This review confirms that `MOBILE-DEPTH-01` Phase 1-10 has a complete first engineering tranche. The remaining work is manual device sign-off and one product decision: whether a first-use coach mark is worth adding later.

The review also applied a Phase 2 improvement pass:

- Added a stable initial tracker loading skeleton to reduce blank-screen perception and layout jump.
- Added mobile Today -> lesson and Roadmap -> lesson launch-path coverage.
- Added clearer resume vs fresh-start copy.
- Added a visible return-home action on the lesson pre-start surface.
- Improved the empty-lesson state so review-only users can still start due review.
- Updated the Playwright app-ready helper so tests wait for the skeleton to clear before interacting.
- Made Settings user selection explicit with `active_user_id` so saved display-name edits survive reload/render when multiple user records exist.
- Advanced the service-worker cache to `toeic-vorb-v49` because shipped shell/CSS/JS assets changed.

## Phase Status

| Phase | Status | Evidence |
|---|---|---|
| Phase 1 Baseline / metrics | Complete | `docs/lesson-runtime-mobile-phase-1-baseline-2026-05-23.md` |
| Phase 2 Entry / pre-lesson | Repo-side complete; product/manual follow-up remains | `lesson-start-panel`, skeleton, Today/Roadmap mobile launch tests |
| Phase 3 Reading layout | Complete | `tests/lesson-flow.spec.ts`, `tests/mobile-viewport-matrix.spec.ts` |
| Phase 4 Answer ergonomics | Complete | `tests/lesson-flow.spec.ts` controls probes |
| Phase 5 Feedback / momentum | Complete | finish, feedback, error-review mobile probes |
| Phase 6 Pause / resume | Mostly complete | resume, pause, pending-answer, exit confirm tests; manual PWA/battery sign-off remains |
| Phase 7 Review micro-sessions | Complete | `tests/review-mode.spec.ts` |
| Phase 8 Post-lesson surfaces | Complete | `tests/post-lesson-mobile.spec.ts` |
| Phase 9 Performance / offline / sync-aware | Complete for code | `tests/mobile-runtime-guard.spec.ts`; manual weak-network/PWA matrix remains |
| Phase 10 Accessibility / QA / gate | Complete for code/docs | `tests/mobile-accessibility.spec.ts`, release-gate doc |

## Remaining Checkpoints

- `MDEP-02-09`: first-use coach mark remains deferred by design. The current recommendation is not to add it until real usage shows confusion, because it adds friction to the phone first screen.
- `MDEP-02-12`: manual commute / standing / short-session checklist remains a human validation task.
- `MDEP-06-05`, `MDEP-06-08`, `MDEP-06-12`: PWA vs browser resume, low-power behavior, and real-device interruption matrix require Android/iPhone/PWA manual sign-off.
- Final acceptance still requires Android Chrome and iPhone Safari manual verification.

## Validation Commands

```powershell
npx playwright test tests/lesson-flow.spec.ts
npx playwright test tests/pages-subpath-routing.spec.ts
node scripts/check-doc-consistency.js
npm run test:all
```

## Validation Results

- `npx playwright test tests/lesson-flow.spec.ts`: passed, 16 tests.
- `npx playwright test tests/pages-subpath-routing.spec.ts`: passed, 11 tests.
- `node scripts/check-doc-consistency.js`: passed with cache `toeic-vorb-v49`.
- `npm run test:all`: passed, including 97 Playwright tests.

## No-Conflict Check

- Does not modify `data/vocab/*`.
- Does not change seed version.
- Does not enable V4.
- Does not change Google Drive sync contract.
- Does not add backend, build tooling, login, or runtime AI.
- Keeps `PAGES-01`, `XPLAT-01`, and `SYNC-01` closed.
