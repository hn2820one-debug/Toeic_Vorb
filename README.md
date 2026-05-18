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

## Current Production Seed

The active production seed is V0-V3 only. V4 is draft-only and must not be enabled or moved into `data/vocab/`.

| Metric | Current value |
|---|---:|
| Runnable lessons | 0 |
| Question-bank rows | 0 |
| Vocab items | 494 |
| Question files in manifest | 18 |
| Duplicate stems | 0 |
| Full quality audit issues | 0 |
| Seed version | `toeic_vocab_tracker_c004_full_bank_clear_2026_05_18` |
| Service worker cache | `toeic-vorb-v9` |

| Stage | Lessons | Questions | Status |
|---|---:|---:|---|
| V0 Diagnosis | 0 | 0 | Cleared |
| V1 Word Family + Speed | 0 | 0 | Cleared |
| V2 TOEIC Scene Vocabulary | 0 | 0 | Cleared |
| V3 Collocation | 0 | 0 | Cleared |
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
toeic_vocab_tracker_c004_full_bank_clear_2026_05_18
```

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

## Validation Commands

Run these after documentation consolidation that changes current facts, and after any production code, UI, or seed change:

```powershell
node scripts/validate-vocab-data.js
node scripts/audit-quality-full.js
node scripts/audit-duplicates.js
npm run test:scoring
npx playwright test
```

Useful package shortcuts:

```powershell
npm run test:data
npm run test:all
```

## Operational Rules

- `TO_AI.md` is the single active AI handoff document.
- Old `TO_AI_APP_STATUS*.md` files under `docs/backups/to_ai/` are historical only.
- Do not use archived status files as current facts.
- Do not modify `C:\Users\Keith\toeic-app`.
- Do not enable V4 in this repository unless a future prompt explicitly authorizes a V4 production seed change.
- Do not add backend, login, cloud sync, a build step, or runtime AI question generation.
- Question Bank edits made in the browser persist to IndexedDB only; they do not rewrite source JSON.
