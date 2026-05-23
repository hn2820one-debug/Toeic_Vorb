# MOBILE-DEPTH-01 — Phases 1–10 Audit (2026-05-23)

Plan: `docs/lesson-runtime-mobile-depth-plan.md`  
Automated gate: `docs/lesson-runtime-mobile-release-gate-2026-05-23.md`

## Executive summary

| Metric | Count |
|--------|------:|
| Total checkpoints (MDEP) | 120 |
| Implemented + tested (code tranche) | **~109** |
| Documented only (manual / policy) | **~9** |
| Open (manual/product-decision leftovers) | **~2** |

**Verdict:** Phases **3–5, 7–10** are production-ready for the first tranche. Phase **1** is complete as specification. Phase **2** is now repo-side complete except the intentionally deferred first-use coach mark and manual commute checklist. Phase **6** is mostly complete; PWA/battery/manual device matrices remain manual sign-off work.

**Automated tests:** 31 mobile-focused specs + full `npm run test:all` (after confirm-dialog test fixes).

---

## Phase-by-phase status

### Phase 1 — Baseline ✅ Complete

All 12 checkpoints documented in `docs/lesson-runtime-mobile-phase-1-baseline-2026-05-23.md`.

### Phase 2 — Entry / pre-lesson ✅ Repo-side complete, manual/product follow-up remains

| Done in code | Open |
|--------------|------|
| Start panel CTA hierarchy, summary, sync/offline notes (`lesson-start-panel`, `lesson-start-goal`) | First-use coach mark remains a product decision (02-09) |
| Today and Roadmap mobile launch path probes | Manual commute / standing / short-session checklist (02-12) |
| Initial tracker loading skeleton | |
| Resume vs fresh-start copy + return-home action | |
| Empty lesson / review-only copy | |

### Phase 3 — Reading layout ✅ Complete

CSS + `resetLessonRuntimeScroll`, collapsed guidance, landscape probe.

### Phase 4 — Answer ergonomics ✅ Complete

Action tray, 60px targets, confirm primary, anti double-submit.

### Phase 5 — Feedback / finish ✅ Complete

Momentum bar, collapsed details, finish panel, error-review CTA order.

### Phase 6 — Pause / resume ⚠️ Mostly complete (4/12 open)

| Done | Open |
|------|------|
| Resume banner/entry, pause alert, pending answer, exit confirm, interruption matrix doc | PWA vs browser resume sign-off (06-05) |
| Offline/sync pills, clear-session confirm | Low-power policy (06-08) |
| | Manual device matrix (06-12) |

### Phase 7 — Review micro-sessions ✅ Complete

5-question chunk, Today quick review, mini summary, repeated-focus hint.

### Phase 8 — Post-lesson surfaces ✅ Complete

Today 2×2 stats, post-lesson-next-steps, stage seal compact, gentle daily progress.

### Phase 9 — Performance / offline ✅ Complete (code)

Defer Drive sync during lesson, SW banner deferral, CLS guards, connectivity docs.

### Phase 10 — A11y / QA / gate ✅ Complete (code + docs)

Settings mobile prefs, ARIA, contrast, release gate + rollback docs. Manual device sign-off still required.

---

## Test coverage map

| File | Phases touched |
|------|----------------|
| `tests/lesson-flow.spec.ts` | 2–6, 8 |
| `tests/review-mode.spec.ts` | 7 |
| `tests/post-lesson-mobile.spec.ts` | 8 |
| `tests/mobile-runtime-guard.spec.ts` | 9 |
| `tests/mobile-accessibility.spec.ts` | 10 |
| `tests/mobile-viewport-matrix.spec.ts` | 1, 3 |
| `tests/pages-subpath-routing.spec.ts` | PAGES + settings mobile |
| `tests/helpers/mobile-dialogs.ts` | 6, 10 (confirm flows) |

---

## Improvements applied in this audit

1. Fixed regressions from mobile `confirm()` on exit lesson and clear session (`tests/helpers/mobile-dialogs.ts`).
2. Updated `ui-regression` for `lesson-start-summary` (replaces removed `.lesson-quick-meta`).
3. This audit document + honest Phase 2/6 checkbox alignment in the depth plan.
4. Added stable tracker loading skeleton for initial lesson shell load.
5. Added Today/Roadmap mobile launch coverage in `tests/lesson-flow.spec.ts`.
6. Added resume vs fresh-start copy, return-home action, and empty/review-only entry copy.
7. Updated Playwright readiness checks so skeleton render cannot race Settings input tests.
8. Made Settings user selection explicit through `active_user_id`, keeping saved display names stable after render/reload.
9. Advanced service-worker cache to `toeic-vorb-v49` because shipped shell/CSS/JS assets changed.

---

## Remaining before “mobile depth live”

1. Run `npm run test:all` green on release branch.
2. Manual: Android Chrome + iPhone Safari (phase 6/9/10 matrices).
3. Decide whether first-use coach mark is worth adding; current recommendation is to defer unless real-user confusion appears.
