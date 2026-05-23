# Mobile Lesson Depth — Release Gate & Rollback (2026-05-23)

## Release gate (MDEP-10-11) — all required before declaring mobile depth “live”

| Gate | Command / artifact | Required |
|------|-------------------|----------|
| Data + audit | `node scripts/validate-vocab-data.js`, `node scripts/audit-quality-full.js` | Pass |
| Doc consistency | `node scripts/check-doc-consistency.js` | Pass |
| Mobile Playwright | `npx playwright test tests/lesson-flow.spec.ts tests/review-mode.spec.ts tests/post-lesson-mobile.spec.ts tests/mobile-runtime-guard.spec.ts tests/mobile-accessibility.spec.ts tests/mobile-viewport-matrix.spec.ts` | Pass |
| Full suite | `npm run test:all` | Pass |
| No horizontal overflow | Mobile tests in `lesson-flow.spec.ts` | Pass |
| Interrupt + offline | `lesson-flow` resume/pause + `mobile-runtime-guard` offline pill | Pass |
| Post-lesson next step | `post-lesson-next-steps` visible within 30s of finish | Pass |

Manual (MDEP-10-10): Android Chrome + iPhone Safari + optional installed PWA — checklist rows in phase 6/9/10 docs.

## Rollback layers (MDEP-10-12)

Rollback in reverse dependency order if desktop or lesson safety regresses:

1. **CSS only** — `css/tracker.css` mobile `@media (max-width: 860px)` and `html.tracker-*` pref classes.
2. **Lesson/Mistakes/Today views** — `js/views/lesson.js`, `mistakes.js`, `today.js` mobile-only markup.
3. **Shell / sync defer** — `js/vocab-tracker.js` connectivity banners, `deferDriveSyncUntilLessonEnd`, timer interval.
4. **Tests** — remove or skip new `tests/mobile-*.spec.ts` files without reverting production data.

Do **not** roll back seed JSON or `sw.js` cache bumps unless the regression is content-related.

## Acceptance checklist (plan-level)

- [x] Phases 1–9 first tranche implemented in repo.
- [x] Core lesson flow Playwright green on 390×844.
- [ ] `412×915` and `430×932` smoke (`mobile-viewport-matrix.spec.ts`).
- [ ] Manual Android + iPhone sign-off.
- [ ] `npm run test:all` on release branch.
