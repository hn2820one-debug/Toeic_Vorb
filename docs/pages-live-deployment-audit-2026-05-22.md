# Pages Live Deployment Audit — 2026-05-22

Date: 2026-05-22  
Project: TOEIC Vocabulary Tracker (Program B)  
Scope: real GitHub Pages URL verification against current repo truth for launcher copy, manifest, curriculum seed, and service-worker cache  
Production seed impact: none  
Service worker cache impact: none; this audit verifies deployment state only

## Result

The real GitHub Pages URL is reachable and its `manifest.json` is readable, but the live deployment is stale relative to the current repo baseline. The deployed launcher still advertises the historical `193 lessons / 4,399 questions` state, and the live curriculum remains on seed `toeic_vocab_tracker_c004_full_bank_clear_2026_05_18` instead of the current production seed.

## Verified URL

- `https://hn2820one-debug.github.io/Toeic_Vorb/`

## Current Live Findings

| Check | Live result | Expected repo result | Status |
|---|---|---|---|
| Launcher reachable | Yes | Yes | Pass |
| `manifest.json` readable | Yes | Yes | Pass |
| `manifest.start_url` | `./index.html` | `./index.html` | Pass |
| `manifest.scope` | `./` | `./` | Pass |
| Live `curriculum.seed_version` | `toeic_vocab_tracker_c004_full_bank_clear_2026_05_18` | `toeic_vocab_tracker_v3_w2_07_wave_18_2026_05_22` | Fail |
| Live launcher note | `目前內容：V0 + V1 + V2 + V3，共 193 lessons / 4,399 questions（含 22 個混合複習課）` | `目前正式內容：V2 + V3，共 39 課 / 780 題；V0 / V1 已清空，V4 尚未啟用。` | Fail |
| Live runnable lessons | `0` | `39` | Fail |
| Live shell cache | `toeic-vorb-v9` | `toeic-vorb-v38` | Fail |

## Verification Paths

- Web fetch confirmed the public launcher and `manifest.json` are reachable.
- `scripts/verify-pages-live-release.js` now provides a repeatable live release-gate check for launcher note, manifest fields, curriculum seed, lesson count, and service-worker cache.

## Findings

- Repo-side Phases 1-10 validation is substantially complete, but live deployment sync is not.
- `manifest.json` being readable on the public URL is not enough to treat the live deployment as current.
- Final closure for `PAGES-01` must treat stale public deployment as a release blocker, not as a documentation-only gap.

## Remaining Work

- Redeploy the current `main` branch to GitHub Pages.
- Re-run `npm run test:pages-live` against the public URL until it passes without soft mode.
- Then execute the remaining real-device checks for export download and GitHub Pages phone acceptance.