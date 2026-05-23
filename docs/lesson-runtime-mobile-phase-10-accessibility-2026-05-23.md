# Phase 10 — Accessibility, Personalization, QA (2026-05-23)

Program B mobile lesson depth plan. Settings prefs persist in `localStorage` via `VocabDB.savePrefs()`.

## Personalization (MDEP-10-08)

| Pref | Effect |
|------|--------|
| `mobile_large_text` | `html.tracker-large-text` — clamped question/option size |
| `mobile_reduced_motion` | `html.tracker-reduced-motion` — no feedback/answer transitions |
| `mobile_low_distraction` | Hides install banner, Today secondary details, action-tray subtitles |

System `prefers-reduced-motion: reduce` also applies reduced motion without saving a pref.

## Accessibility

| ID | Implementation |
|----|----------------|
| 10-01 | Large text uses `clamp()`; options wrap (`overflow-wrap`) |
| 10-02 | Pref + system reduced motion |
| 10-03 | Stronger selected/correct/wrong/disabled contrast in `tracker.css` |
| 10-04 | Question `role="group"` + `aria-label`; options `aria-pressed`; feedback `role="status"` `aria-live="polite"` |
| 10-05 | Desktop keyboard path unchanged; mobile hides keyboard hint only |
| 10-06 | v1: full-width bottom primary CTAs; no left-hand toggle |
| 10-07 | Wake lock documented as not enabled in v1 (settings note) |

## Automated coverage (MDEP-10-09)

- `tests/mobile-runtime-guard.spec.ts` — offline, SW defer, sticky progress
- `tests/mobile-accessibility.spec.ts` — prefs + ARIA + keyboard
- `tests/mobile-viewport-matrix.spec.ts` — 390 / 412 / 430 lesson shell smoke
- `tests/lesson-flow.spec.ts`, `tests/review-mode.spec.ts`, `tests/post-lesson-mobile.spec.ts`

## Manual device matrix (MDEP-10-10)

See `docs/lesson-runtime-mobile-release-gate-2026-05-23.md`.
