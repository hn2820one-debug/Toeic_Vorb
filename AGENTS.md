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
- Do not add backend, build tooling, or runtime AI question generation.
- Do not add login/cloud sync except the approved `SYNC-01` scoped Google Identity Services + Google Drive API learner-record sync plan; it must remain local-first and must not modify production seed data.
- Do not refactor the whole app.
- Do not change production question or curriculum data without seed-version sync and full validation.
- Treat browser Question Bank edits as IndexedDB-only unless a future task explicitly asks to update source JSON.

---

## What This App Does

Static local-first PWA for TOEIC vocabulary learning (target: 570 → 750).
- Local-first: all data in IndexedDB (`toeic_vocab_tracker_db`), no backend
- No active login, cloud sync, build step, or runtime AI question generation in the shipped runtime
- `SYNC-01` is the approved future exception for Google Drive learner-record sync only; it does not authorize backend work, production seed changes, or V4 activation
- Tracks attempts, mastery, error codes, review queue per vocab item
- 8 views: Today / Roadmap / Lesson / Mistakes / Mastery / Export / Question Bank / Settings
- Accessible at `tracker.html`; launcher at `index.html`

---

## Question Bank — Current State (2026-05-22)

| Stage | Stage Name | Lessons | Questions | Status |
|-------|-----------|---------|-----------|--------|
| V0 | Diagnosis | 0 | 0 | Cleared |
| V1 | Word Family | 0 | 0 | Cleared |
| V2 | TOEIC Scene Vocabulary | 12 | 240 | Core `V2-A-71`–`V2-A-80` + `V2-MR-01` / `V2-MR-02` live |
| V3 | Collocation | 27 | 540 | Core `V3-A-121`–`V3-A-143` + `V3-MR-01`–`V3-MR-04` live |
| V4 | Formal Phrase | 0 active / 50 planned | 0 active / 100 draft | Draft isolated in `drafts/v4/` |
| V5 | False Friends + Speed Reflex | 50 | 0 | 🔲 Planned |
| V6 | Integrated Review + Seal Test | 40 | 0 | 🔲 Planned |

**Total: 39 runnable lessons, 780 question-bank rows, 632 vocab items, 18 manifest question files, 0 duplicate stems, 0 full-audit issues**
Audit tool: `node scripts/audit-quality-full.js` → must output `✅ PASSED`

Production seed manifest remains V0-V3 only. V2 restores `V2-A-71` through `V2-A-80` inside `questions_v2a.json` plus `V2-MR-01` / `V2-MR-02`; V3 restores `V3-A-121` through `V3-A-143` inside `questions_v3a.json` plus `V3-MR-01` through `V3-MR-04`. V4 is draft-only in `drafts/v4/` and must not be promoted without a future explicit V4 activation task.

---

## Seed Version — Must Stay in Sync (3 Files)

When any question data or curriculum changes, bump `seed_version` in ALL THREE simultaneously:

```
data/vocab/curriculum.json        → "seed_version": "..."
js/vocab-db.js                    → const SEED_VERSION = "..."
tests/helpers/seed-idb.ts         → const APP_SEED_VERSION = "..."
```

Format: `toeic_vocab_tracker_{description}_{YYYY_MM_DD}`
Current: `toeic_vocab_tracker_v3_w2_07_wave_18_2026_05_22`

Every production seed change must also create a filled record from `docs/templates/seed-change-record-template.md` under `docs/seed-changes/`; do not treat a seed change as complete without that record.

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
data/vocab/questions_v2a.json       — V2 production file; currently contains `V2-A-71` through `V2-A-80`
data/vocab/questions_v2b–e.json     — Remaining V2 manifest files; currently empty after full-bank clear
data/vocab/questions_v3a–f.json     — V3 manifest files; currently empty after full-bank clear
data/vocab/vocab_items.json         — 632 vocabulary items with metadata
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
node scripts/check-doc-consistency.js    — active documentation consistency check
node scripts/audit-quality-full.js       — full production quality audit (must pass)
node scripts/audit-duplicates.js         — duplicate question_text audit (must be 0)
npm run test:scoring                     — mastery scoring fixture tests
npm run test:mup                         — draft minimum usable content-pack verifier
npm run test:export-governance           — export feedback governance verifier
npx playwright test                      — run current Playwright suite
npm run test:all                      — scoring + data/doc/MUP/export-governance validation + Playwright
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

## Recent History (2026-05-19)

- `speed_drill` lesson runtime countdown was realigned to the canonical 8-second limit already used by scoring, docs, and seed fixtures.
- V0 Diagnostic Recommendation now requires at least 20 V0 attempts; partial data is marked insufficient in Today and export.

## Recent History (2026-05-20)

- First rebuilt production wave restored `V2-A-71` with 1 lesson row and 24 production question rows in `questions_v2a.json`.
- Wave 2 production promotion added `V2-A-72` through `V2-A-74`, bringing production to 4 lesson rows and 96 production question rows.
- Wave 3 production promotion added `V2-A-75` through `V2-A-77`, bringing production to 7 lesson rows and 168 production question rows.
- `V2-MR-01` mixed-review promotion added 1 curriculum lesson row and 0 question rows, bringing production to 8 runnable lessons and 168 question-bank rows.
- Production seed version advanced to `toeic_vocab_tracker_v2_mr_01_mixed_review_2026_05_21` and the service worker cache advanced to `toeic-vorb-v14`.
- Wave 4 production promotion added `V2-A-78` through `V2-A-80`, bringing production to 11 runnable lessons and 240 question-bank rows.
- Production seed version advanced to `toeic_vocab_tracker_v2_a_78_80_wave_4_2026_05_21` and the service worker cache advanced to `toeic-vorb-v15`.
- C-09 post-release review accepted the 4 `V2-A-71` staircase progression warnings as short-term debt only; no live seed rewrite is authorized until real learner/export evidence or an isolated draft probe justifies it.

## Recent History (2026-05-21)

- V3 MR-04 promoted mixed review for `V3-A-136`–`140`: 36 lessons, 711 rows (0 new questions). Seed `toeic_vocab_tracker_v3_mr_04_mixed_review_2026_05_21`; SW `toeic-vorb-v34`.
- V3 wave 15 promoted `V3-W2-04` → `V3-A-140` (財務會計 1): 35 lessons, 711 rows. Seed `toeic_vocab_tracker_v3_w2_04_wave_15_2026_05_21`; SW `toeic-vorb-v33`.
- V3 wave 14 promoted `V3-W2-03` → `V3-A-139` (行銷與宣傳 2): 34 lessons, 688 rows. Seed `toeic_vocab_tracker_v3_w2_03_wave_14_2026_05_21`; SW `toeic-vorb-v32`.
- V3 wave 13 promoted `V3-W2-02` → `V3-A-138` (行銷與宣傳 1): 33 lessons, 665 rows. Fixed duplicate stem on `v3_a_137_rv_021`. Seed `toeic_vocab_tracker_v3_w2_02_wave_13_2026_05_21`; SW `toeic-vorb-v31`.
- V3 wave 12 promoted `V3-W2-01` → `V3-A-137` (人事與組織 3): 32 runnable lessons, 642 question rows, 600 vocab items. Reuses `v3_a_136_rv_024`. Seed `toeic_vocab_tracker_v3_w2_01_wave_12_2026_05_21`; SW `toeic-vorb-v30`.
- V3-MR-03 promoted for `V3-A-131`–`135`: 31 runnable lessons, 619 question rows (unchanged). Seed `toeic_vocab_tracker_v3_mr_03_mixed_review_2026_05_21`; SW `toeic-vorb-v29`. Wave-1 draft ends at `V3-W1-16`; no `V3-W1-17`.
- V3 wave 11 promoted `V3-W1-16` → `V3-A-136` (人事與組織 2): 30 runnable lessons, 619 question rows, 594 vocab items. Reuses `v3_a_135_rv_024`. Seed `toeic_vocab_tracker_v3_w1_16_wave_11_2026_05_21`; SW `toeic-vorb-v28`.

## Recent History (2026-05-22)

- V3 wave 16 promoted `V3-W2-05` → `V3-A-141` (財務會計 2): 37 runnable lessons, 734 question-bank rows, 623 vocab items. Reuses `v3_a_140_rv_024`. Seed `toeic_vocab_tracker_v3_w2_05_wave_16_2026_05_22`; SW `toeic-vorb-v35`.
- V3 wave 17 promoted `V3-W2-06` → `V3-A-142` (財務會計 3): 38 runnable lessons, 757 question-bank rows, 629 vocab items. Reuses `v3_a_141_rv_024`. Seed `toeic_vocab_tracker_v3_w2_06_wave_17_2026_05_22`; SW `toeic-vorb-v36`.
- V3 wave 18 promoted `V3-W2-07` → `V3-A-143` (財務會計 4): 39 runnable lessons, 780 question-bank rows, 632 vocab items. Reuses `v3_a_142_rv_024`. Seed `toeic_vocab_tracker_v3_w2_07_wave_18_2026_05_22`; SW `toeic-vorb-v37`.
- V3 wave 10 promoted `V3-W1-15` → `V3-A-135` (人事與組織 1): 29 runnable lessons, 596 question rows, 590 vocab items. Reuses `v3_a_134_rv_024`. Seed `toeic_vocab_tracker_v3_w1_15_wave_10_2026_05_21`; SW `toeic-vorb-v27`.
- V3 wave 9 promoted `V3-W1-14` → `V3-A-134` (業務協調 4, block complete).
- V3 wave 8 promoted `V3-W1-13` → `V3-A-133` (業務協調 3).
- V3 wave 7 promoted `V3-W1-12` → `V3-A-132` (業務協調 2).
- V3 wave 6 promoted `V3-W1-11` → `V3-A-131` (業務協調): post-promote Q17–Q20 rebalance fixed target coverage audit.
- T049 export feedback review completed with insufficient current V2 learner data: the only repo export is 2026-05-14 `V1-B-21` with 24 attempts / 1 session / 0 V2 attempts.
- No V2 live seed rewrite is authorized by current learner evidence; the 40 V2 staircase warnings remain non-blocking warning debt.
- `V3-W1-01` was promoted to live `V3-A-121` in the first V3 production wave.
- `V3-W1-02` and `V3-W1-03` were promoted to live `V3-A-122` and `V3-A-123` in the second V3 production wave.
- `V3-W1-04` through `V3-W1-06` were promoted to live `V3-A-124` through `V3-A-126` in the third V3 production wave.
- `V3-W1-07` was promoted to live `V3-A-127` in the fourth V3 production wave.
- `V3-W1-08` through `V3-W1-10` were promoted to live `V3-A-128` through `V3-A-130` in the fifth V3 production wave. V3 core is 10/10.
- `V3-MR-01` and `V3-MR-02` were promoted as curriculum-only mixed-review checkpoints (0 new question rows).
- `V2-MR-02` was promoted (sources `V2-A-76`–`V2-A-80`; 0 new question rows). Production is now 24 runnable lessons / 480 question-bank rows; both V2 and V3 W1 tranches have 10/10 core + 2/2 mixed review.
- Next process is additional V2/V3 core authoring beyond current tranches, or learner/export review before any live rewrite.
