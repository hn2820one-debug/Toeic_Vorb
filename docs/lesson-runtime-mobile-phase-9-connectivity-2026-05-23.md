# Phase 9 — Connectivity, Offline, And Runtime Performance (2026-05-23)

Mobile lesson runtime guardrails for Program B (`toeic-app-Vorb`). No production seed changes.

## Performance budget (MDEP-09-01)

| Surface | Target |
|---------|--------|
| Lesson first paint (cached PWA) | Question shell visible ≤ 2s on mid-tier phone |
| Question advance | DOM swap only; no full `render()` of other tabs |
| Timer tick | Text-only updates; 500ms interval on ≤860px |

## Layout shift risks (MDEP-09-02)

| Element | Mitigation |
|---------|------------|
| `answer-grid` | `min-height` on mobile lesson shell |
| `question-panel` | `min-height` reserved before options render |
| `runtime-progress-sticky` | Sticky bar with fixed height |
| Feedback panel | Enter animation disabled under `prefers-reduced-motion` |

## Active lesson connectivity (MDEP-09-05–09-11)

| Scenario | During active lesson | After lesson / other tabs |
|----------|----------------------|---------------------------|
| Offline | `runtime-status-pill` only | `offline-banner` |
| Drive sync pending | Pill: 本機已保存 · 待同步 | Normal settings/export flow |
| SW update waiting | Hidden (no reload interrupt) | `sw-update-banner` + repair link |
| Auto Drive sync | Deferred (`deferDriveSyncUntilLessonEnd`) | Runs on tab leave / lesson end |

## Offline-capable flows (MDEP-09-07)

- Start / resume lesson
- Select + confirm answers (IndexedDB)
- Pause / resume / exit with confirm
- Review mode chunk
- Finish → Mistakes error review (local)

## Manual matrix (MDEP-09-12)

| Device | Offline lesson | SW update banner | Stale cache repair |
|--------|----------------|------------------|-------------------|
| Android Chrome | ☐ | ☐ | ☐ via `clear-sw.html` |
| iPhone Safari | ☐ | ☐ | ☐ |
| Installed PWA | ☐ safe-area | ☐ deferred during lesson | ☐ |

Automated: `tests/mobile-runtime-guard.spec.ts` (offline pill, SW defer during lesson, sticky progress, gentle Today copy).
