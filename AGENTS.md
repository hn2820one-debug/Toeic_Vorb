# AGENTS.md — TOEIC Vocabulary Tracker (Program B)

> This file is read automatically by Codex at the start of every session.
> It describes Program B only. Do NOT touch Program A.

`TO_AI.md` is the single active AI handoff and source of truth. Old `TO_AI_APP_STATUS*.md` files under `docs/backups/to_ai/` are historical only and must not be used as current facts.

---

## CRITICAL: Two-App Boundary

| App | Path | Scope |
|-----|------|-------|
| **Program A** — Grammar / PoS App | `C:\Users\Keith\toeic-app` | Grammar lessons, PoS colour system — **DO NOT MODIFY** |
| **Program B** — TOEIC Vocabulary Tracker | `C:\Users\Keith\Toeic\toeic-app-Vorb` | Vocabulary curriculum, questions, mastery tracking |

**Never modify `C:\Users\Keith\toeic-app`.** It is a completely separate app. Any file in this repo (toeic-app-Vorb) is Program B only.

---

## Hard Rules

- Do not modify Program A: `C:\Users\Keith\toeic-app`.
- Do not enable V4.
- Do not move V4 draft files into `data/vocab/`.
- Do not add backend, login, cloud sync, build tooling, or runtime AI question generation.
- Do not refactor the whole app.
- Do not change production question or curriculum data without seed-version sync and full validation.
- Treat browser Question Bank edits as IndexedDB-only unless a future task explicitly asks to update source JSON.

---

## What This App Does

Static local-first PWA for TOEIC vocabulary learning (target: 570 → 750).
- Local-first: all data in IndexedDB (`toeic_vocab_tracker_db`), no backend
- No login, cloud sync, build step, or runtime AI question generation
- Tracks attempts, mastery, error codes, review queue per vocab item
- 8 views: Today / Roadmap / Lesson / Mistakes / Mastery / Export / Question Bank / Settings
- Accessible at `tracker.html`; launcher at `index.html`

---

## Question Bank — Current State (2026-05-18)

| Stage | Stage Name | Lessons | Questions | Status |
|-------|-----------|---------|-----------|--------|
| V0 | Diagnosis | 0 | 0 | Cleared |
| V1 | Word Family | 0 | 0 | Cleared |
| V2 | TOEIC Scene Vocabulary | 0 | 0 | Cleared |
| V3 | Collocation | 0 | 0 | Cleared |
| V4 | Formal Phrase | 0 active / 50 planned | 0 active / 100 draft | Draft isolated in `drafts/v4/` |
| V5 | False Friends + Speed Reflex | 50 | 0 | 🔲 Planned |
| V6 | Integrated Review + Seal Test | 40 | 0 | 🔲 Planned |

**Total: 0 runnable lessons, 0 question-bank rows, 494 vocab items, 18 manifest question files, 0 duplicate stems, 0 full-audit issues**
Audit tool: `node scripts/audit-quality-full.js` → must output `✅ PASSED`

Production seed manifest remains V0-V3 only, but all production V0-V3 lesson rows and question rows are intentionally cleared. V4 is draft-only in `drafts/v4/` and must not be promoted without a future explicit V4 activation task.

---

## Seed Version — Must Stay in Sync (3 Files)

When any question data or curriculum changes, bump `seed_version` in ALL THREE simultaneously:

```
data/vocab/curriculum.json        → "seed_version": "..."
js/vocab-db.js                    → const SEED_VERSION = "..."
tests/helpers/seed-idb.ts         → const APP_SEED_VERSION = "..."
```

Format: `toeic_vocab_tracker_{description}_{YYYY_MM_DD}`
Current: `toeic_vocab_tracker_c004_full_bank_clear_2026_05_18`

---

## JS Architecture

```
js/vocab-scoring.js   — pure functions: mastery score, error codes, speed buckets (IIFE, window.VocabScoring)
js/vocab-db.js        — IndexedDB wrapper + seedIfNeeded() (IIFE, window.VocabDB)
js/state.js           — shared state object, question type labels, learning guidance (ES module)
js/vocab-tracker.js   — app shell: tabs, routing, init (ES module, imports all views)
js/views/today.js     — Today dashboard
js/views/roadmap.js   — Lesson roadmap with filters
js/views/lesson.js    — Lesson runner: questions, answers, feedback, timer
js/views/mistakes.js  — Error review + spaced repetition queue
js/views/mastery.js   — Vocab item mastery view
js/views/export.js    — Export package (CSV + JSON)
js/views/bank.js      — Question bank browser + editor
js/views/settings.js  — Settings, clear session, lesson status override
```

---

## Data Files

```
data/vocab/curriculum.json          — course structure, lesson list, default user
data/vocab/questions_v0.json        — V0 manifest file; currently empty after full-bank clear
data/vocab/questions_v1a–f.json     — V1 manifest files; currently empty after full-bank clear
data/vocab/questions_v2a–e.json     — V2 manifest files; currently empty after full-bank clear
data/vocab/questions_v3a–f.json     — V3 manifest files; currently empty after full-bank clear
data/vocab/vocab_items.json         — 494 vocabulary items with metadata
data/vocab/grammar_links.json       — grammar pattern references (optional metadata)
drafts/v4/questions_v4a.json        — V4 draft only, not production seed
```

---

## Question Types (10 total)

| Type | Stage | Blank? | Time | Error Code |
|------|-------|--------|------|-----------|
| `meaning_choice` | V0, V2 | No | 10s | VOCAB_UNKNOWN |
| `scene_vocabulary` | V2 | Yes | 15s | SCENE_VOCAB_GAP |
| `word_family` | V1 | Yes | 20s | WORD_FAMILY_POS |
| `collocation` | V1, V3 | Yes | 15s | COLLOCATION_GAP |
| `part5_sentence_completion` | V1–V3 | Yes | 20s | VOCAB_WEAK_RECALL |
| `part6_context_choice` | V3 | Yes | 45s | SCENE_VOCAB_GAP |
| `speed_drill` | V1-F | Yes | 8s | TIME_PRESSURE |
| `review_question` | All | Both | 15s | VOCAB_WEAK_RECALL |
| `formal_phrase` | V0 | Yes | 20s | FORMAL_PHRASE |
| `false_friend` | V0 | No | 8s | FALSE_FRIEND |

Stage-level `distractor_type` values: V0=`toeic_realistic`, V1=`same_word_family`, V2=`same_scene_vocabulary`, V3=`wrong_verb_collocation`

---

## Lesson Structures

| Stage | question_ids | review_question_ids | Notes |
|-------|-------------|---------------------|-------|
| V0 | 19 | 12 | 1 lesson only |
| V1-A (lessons 11–20) | 18 | 6 | word_family type |
| V1-B/C/D/E (21–52) | 20 | 4 | word_family type |
| V1-F (speed_drill, 53–60) | 40 | 0 | speed_drill only |
| V2 core (50 lessons) | 20 | 4 | scene_vocabulary |
| V2 mixed_review (10) | 20 | 0 | from prior review_question_ids |
| V3 core (60 lessons) | 20 | 4 | collocation |
| V3 mixed_review (12) | 20 | 0 | from prior review_question_ids |

---

## Mastery Scoring (vocab_items)

Score = accuracy(50) + speed(25) + stability(15) + recency(10), clamped 0–100.

| Level | Score | Meaning |
|-------|-------|---------|
| blind | 0–39 | Never seen or always wrong |
| weak | 40–59 | Seen but unreliable |
| unstable | 60–74 | Often correct but inconsistent |
| stable | 75–84 | Reliable with occasional errors |
| mastered | 85–100 | Fast and consistent |

---

## Tests

```
node scripts/validate-vocab-data.js      — structural vocab validation
node scripts/audit-quality-full.js       — full production quality audit (must pass)
node scripts/audit-duplicates.js         — duplicate question_text audit (must be 0)
npm run test:scoring                     — mastery scoring fixture tests
npx playwright test                      — run current Playwright suite
npm run test:all                      — scoring + data validation + Playwright
tests/lesson-flow.spec.ts             — full lesson run
tests/review-mode.spec.ts             — review queue
tests/v2-v3-content.spec.ts           — V2/V3 question rendering
tests/export-flow.spec.ts             — export package
tests/fixtures/mastery-score-fixtures.json — scoring fixtures
tests/helpers/seed-idb.ts             — seed helper (uses APP_SEED_VERSION)
```

The full validation set above must pass before any production content or seed change is considered ready.

---

## Quality Scripts

```
node scripts/audit-quality-full.js    — full spec compliance audit (must pass)
node scripts/audit-duplicates.js      — duplicate question_text check (must be 0)
```

Run both after any question content change.
Full spec: `docs/question-creation-spec.md`

---

## IndexedDB Stores

`toeic_vocab_tracker_db` (version 2):
`users`, `settings`, `curriculum`, `lessons`, `questions`, `question_edits`, `vocab_items`, `attempts`, `sessions`, `error_logs`, `review_queue`, `exports`

LocalStorage keys: `toeic_vocab_tracker_preferences`, `toeic_vocab_active_session`

---

## Known Open Issues (summary)

- **ISSUE-001**: Programs A and B are separate folders — keep boundaries clear
- **ISSUE-007**: V4–V6 vocabulary content not active; V4-A draft is isolated
- **ISSUE-011**: Mastery formula has fixture tests but still needs real learner validation
- **ISSUE-012**: Review scheduling is simple (not full spaced-repetition)
- **ISSUE-013**: Question Bank editor writes to IndexedDB only (not source JSON)

Full list: `docs/KNOWN_ISSUES.md`

---

## Recent History (2026-05-17)

- Historical obsolete count: V0 consolidated from 240 questions (10 lessons) to 31 questions (1 diagnostic lesson)
- V1 duplicates fixed: 826 duplicate `question_text` values replaced
- V2 type fix: 200 questions relabelled `meaning_choice` → `scene_vocabulary`
- Article giveaways fixed: 14 V2 sentences restructured
- Quality audit: `scripts/audit-quality-full.js` → `✅ PASSED`
- `docs/question-creation-spec.md` created: full authoring standard + AI prompt template

## Recent History (2026-05-18)

- `TO_AI.md` consolidated as the single active bilingual handoff.
- Old root `TO_AI_APP_STATUS*.md` files archived under `docs/backups/to_ai/2026-05-18/`.
- V4-A draft moved outside production data under `drafts/v4/`.
- Today dashboard added display-only Stage Seal Readiness.
- V0 Diagnostic Recommendation and `diagnostic_recommendation.json` export added.
- Mastery scoring fixture tests added.
- Strict question-bank prune removed 25 production direct-definition rows that violated the new semantic-meaning policy; production audit now passes with warnings only.
- Full production bank clear removed the remaining V0-V3 lesson rows and production question rows after the strict warning-level review; production audit now passes with zero questions and zero lessons.
