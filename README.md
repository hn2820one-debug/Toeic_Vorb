# TOEIC Vocabulary Tracker (Program B)

Official AI handoff: `TO_AI.md`.

This repository is Program B only: the TOEIC Vocabulary Tracker.

Program B path:

```text
C:\Users\Keith\Toeic\toeic-app-Vorb
```

Do not modify Program A:

```text
C:\Users\Keith\toeic-app
```

Program A is the separate Grammar / PoS App. Program B is the vocabulary curriculum, question bank, mastery tracking, review queue, and export tool.

## App Model

Program B is a static local-first PWA.

- Entry launcher: `index.html`
- Main app: `tracker.html`
- Service worker: `sw.js`
- Storage: IndexedDB `toeic_vocab_tracker_db`
- Preferences/session: `toeic_vocab_tracker_preferences`, `toeic_vocab_active_session`
- No backend
- No login
- No cloud sync
- No build step
- No runtime AI question generation

## Navigation

The main tracker shell uses 8 top-level tabs:

- Today
- Roadmap
- Lesson
- Mistakes
- Mastery
- Export
- Question Bank
- Settings

With the current 39-lesson production seed, Today routes learners to the first incomplete lesson; on a clean reseed this starts at `V2-A-71`. The tracker shell still supports a non-dismissible empty-seed banner, but it appears only when both lesson rows and question rows return to 0.

## Current Production Seed

The active production seed is V0-V3 only. V2 restores `V2-A-71` through `V2-A-80` plus `V2-MR-01` / `V2-MR-02`; V3 restores `V3-A-121` through `V3-A-143` plus `V3-MR-01` through `V3-MR-04`. V4 remains draft-only and must not be enabled or moved into `data/vocab/`.

| Metric | Current value |
|---|---:|
| Runnable lessons | 39 |
| Question-bank rows | 780 |
| Vocab items | 632 |
| Question files in manifest | 18 |
| Duplicate stems | 0 |
| Full quality audit issues | 0 |
| Seed version | `toeic_vocab_tracker_v3_w2_07_wave_18_2026_05_22` |
| Service worker cache | `toeic-vorb-v38` |

| Stage | Lessons | Questions | Status |
|---|---:|---:|---|
| V0 Diagnosis | 0 | 0 | Cleared |
| V1 Word Family + Speed | 0 | 0 | Cleared |
| V2 TOEIC Scene Vocabulary | 12 | 240 | Core `V2-A-71`–`V2-A-80` + `V2-MR-01` / `V2-MR-02` live |
| V3 Collocation | 27 | 540 | Core `V3-A-121`–`V3-A-143` + `V3-MR-01`–`V3-MR-04` live |
| V4 Formal Phrase | 0 active | 0 active | Draft only in `drafts/v4/` |
| V5 False Friends + Speed Reflex | 0 | 0 | Planned |
| V6 Integrated Review + Seal Test | 0 | 0 | Planned |

## Data Files

Production data:

```text
data/vocab/curriculum.json
data/vocab/vocab_items.json
data/vocab/grammar_links.json
data/vocab/questions_v0.json
data/vocab/questions_v1a.json
data/vocab/questions_v1b.json
data/vocab/questions_v1c.json
data/vocab/questions_v1d.json
data/vocab/questions_v1e.json
data/vocab/questions_v1f.json
data/vocab/questions_v2a.json
data/vocab/questions_v2b.json
data/vocab/questions_v2c.json
data/vocab/questions_v2d.json
data/vocab/questions_v2e.json
data/vocab/questions_v3a.json
data/vocab/questions_v3b.json
data/vocab/questions_v3c.json
data/vocab/questions_v3d.json
data/vocab/questions_v3e.json
data/vocab/questions_v3f.json
```

Draft-only V4 files:

```text
drafts/v4/questions_v4a.json
drafts/v4/add-v4-items.js
```

Do not move V4 draft files into `data/vocab/` unless V4 is intentionally activated in a future seed change.

## Seed Version Sync

When production curriculum or question data changes, update the seed version in exactly these three files:

```text
data/vocab/curriculum.json        -> seed_version
js/vocab-db.js                    -> SEED_VERSION
tests/helpers/seed-idb.ts         -> APP_SEED_VERSION
```

Current seed version:

```text
toeic_vocab_tracker_v3_w2_07_wave_18_2026_05_22
```

Every production seed change must also copy `docs/templates/seed-change-record-template.md` to `docs/seed-changes/YYYY-MM-DD-{new-seed-version}.md` and fill the required file-sync checklist, validation results, rollback plan, and sign-off. See `docs/seed-changes/example-seed-change-record.md` for the expected format. Do not skip this record.

## Main Files

```text
js/vocab-scoring.js   -> scoring functions, window.VocabScoring
js/vocab-db.js        -> IndexedDB wrapper, window.VocabDB
js/state.js           -> shared app state and labels
js/vocab-tracker.js   -> app shell, routing, initialization
js/views/today.js     -> Today dashboard
js/views/roadmap.js   -> lesson roadmap
js/views/lesson.js    -> lesson runner
js/views/mistakes.js  -> mistakes and review queue
js/views/mastery.js   -> mastery view
js/views/export.js    -> export package
js/views/bank.js      -> question bank browser/editor
js/views/settings.js  -> settings
```

## How To Run

```powershell
cd C:\Users\Keith\Toeic\toeic-app-Vorb
python -m http.server 8787 --bind 127.0.0.1
```

Then open:

```text
http://127.0.0.1:8787/
```

Or go directly to:

```text
http://127.0.0.1:8787/tracker.html
```

## GitHub Pages / Mobile Baseline

Program B is shipped as a repo-subpath-safe static PWA. Launcher, tracker, manifest, icons, and service-worker registration all use relative `./` paths so the app can run under a GitHub Pages repository subpath.

- Official deploy target stays `main` + `.github/workflows/pages.yml`.
- If a deployed shell looks stale, use `clear-sw.html` or the launcher link `如果畫面怪怪的，先清除快取` before reopening the app.
- The dedicated Pages/mobile smoke entrypoint is `npm run test:pages-mobile`.
- The live deployment release gate is `npm run test:pages-live`.
- The aggregate local release gate is `npm run test:all`.
- Manual phone/browser checks for offline reopen and update pickup are documented in `docs/pages-offline-update-manual-checklist-2026-05-22.md`.
- The current Pages/mobile phase plan is tracked in `docs/pages-mobile-experience-plan.md`.
- Still pending real-device acceptance: mobile export download confirmation and GitHub Pages real-URL phone validation.

## Validation Commands

Run these after documentation consolidation that changes current facts, and after any production code, UI, or seed change:

```powershell
node scripts/validate-vocab-data.js
node scripts/check-doc-consistency.js
node scripts/audit-quality-full.js
node scripts/audit-duplicates.js
npm run test:scoring
npm run test:mup
npm run test:export-governance
npm run test:pages-mobile
npm run test:pages-live
npx playwright test
```

Useful package shortcuts:

```powershell
npm run test:data
npm run test:docs
npm run test:mup
npm run test:export-governance
npm run test:pages-mobile
npm run test:pages-live
npm run test:all
```

Content rebuild waves must also follow `docs/rebuild-wave-release-gate.md` before a draft slice or production seed change is treated as ready.
Export-based content feedback reviews are defined in `docs/export-analysis-feedback-governance.md`.

## Operational Rules

- `TO_AI.md` is the single active AI handoff document.
- Old `TO_AI_APP_STATUS*.md` files under `docs/backups/to_ai/` are historical only.
- Do not use archived status files as current facts.
- Do not modify `C:\Users\Keith\toeic-app`.
- Do not enable V4 in this repository unless a future prompt explicitly authorizes a V4 production seed change.
- Do not add backend, login, cloud sync, a build step, or runtime AI question generation.
- Question Bank edits made in the browser persist to IndexedDB only; they do not rewrite source JSON.
