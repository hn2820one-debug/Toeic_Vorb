# ChatGPT Analysis Package

Status: CURRENT AFTER P1 REVIEW MODE

## 1. Project Summary

This folder is the standalone Program B: TOEIC Vocabulary Tracker, located at `C:\Users\Keith\Toeic\toeic-app-Vorb`. The separate Grammar / PoS App is kept in `C:\Users\Keith\toeic-app` and is not part of this folder. This app is a static, local-first vocabulary learning PWA. It uses `tracker.html` as the main entry, `data/vocab/*` as the curriculum/question seed source, IndexedDB `toeic_vocab_tracker_db` for progress, and localStorage only for preferences and active session state. There is no backend, login, cloud sync, runtime AI question generation, or Grammar / PoS course engine inside this app. Current content covers V0 Diagnosis, full V1 Word Family, V2 TOEIC Scene Vocabulary, and V3 Collocation. P1 Review Mode is implemented: due/high-priority/repeated review queue items can be answered in a dedicated review runtime and exported through `review_effectiveness.csv`. V4 Formal Phrase, V5 False Friends + Speed Reflex, and V6 Integrated Review + Seal Test remain planned.

## 2. Intended Product

TOEIC Vocabulary Tracker: a mobile-first local PWA for recording every lesson, question attempt, response time, error code, review queue item, mastery score, and export package for ChatGPT analysis. Grammar links are metadata only through `grammar_link_id`.

## 3. Current Content

- Total lessons: 180
- Total questions: 4608
- V0: 10 lessons, 240 questions
- V1: 60 lessons, 1728 questions
- V2: 50 lessons, 1200 questions
- V3: 60 lessons, 1440 questions
- V4-V6: planned only

## 4. Current File Tree

```text
toeic-app-Vorb/
├── index.html
├── tracker.html
├── clear-sw.html
├── manifest.json
├── sw.js
├── css/
│   ├── base.css
│   └── tracker.css
├── js/
│   ├── vocab-db.js
│   ├── vocab-scoring.js
│   ├── vocab-tracker.js
│   ├── state.js
│   └── views/
├── data/vocab/
│   ├── curriculum.json
│   ├── grammar_links.json
│   ├── vocab_items.json
│   ├── questions_v0.json
│   ├── questions_v1a.json
│   ├── questions_v1b.json
│   ├── questions_v1c.json
│   ├── questions_v1d.json
│   ├── questions_v1e.json
│   ├── questions_v1f.json
│   ├── questions_v2a.json
│   ├── questions_v2b.json
│   ├── questions_v2c.json
│   ├── questions_v2d.json
│   ├── questions_v2e.json
│   ├── questions_v3a.json
│   ├── questions_v3b.json
│   ├── questions_v3c.json
│   ├── questions_v3d.json
│   ├── questions_v3e.json
│   ├── questions_v3f.json
├── scripts/
│   ├── build-vocab-tracker-data.js
│   ├── expand-v1-content.js
│   ├── expand-v2-v3-content.js
│   ├── validate-vocab-data.js
│   └── test-scoring.js
├── tests/
└── docs/
```

## 5. Key Files and Their Purpose

| file path | purpose | status | concerns |
|---|---|---|---|
| `tracker.html` | Main app shell | IMPLEMENTED | Must not import Grammar / PoS scripts |
| `js/vocab-db.js` | IndexedDB wrapper and seed loader | IMPLEMENTED | Seed version must bump when content changes |
| `js/vocab-tracker.js` | App bootstrap and tab routing | IMPLEMENTED/PARTIAL | Runtime is browser-only |
| `js/views/lesson.js` | Lesson runtime, attempt recording, Review Mode runtime | IMPLEMENTED | Review scheduling remains simple |
| `js/views/export.js` | Analysis export package | IMPLEMENTED/PARTIAL | Folder export depends on browser APIs |
| `data/vocab/curriculum.json` | V0-V3 lesson manifest | IMPLEMENTED | V4-V6 planned only |
| `data/vocab/vocab_items.json` | Item mastery seed metadata | IMPLEMENTED | V2/V3 content needs human quality review |
| `scripts/expand-v2-v3-content.js` | Generates V2/V3 static seed content | IMPLEMENTED | Static generation script only; not an app AI feature |
| `scripts/validate-vocab-data.js` | Validates curriculum/questions | IMPLEMENTED | Structural validation only |
| `sw.js` | PWA cache | IMPLEMENTED | Cache name must change when static files change |

## 6. Current Routes / Screens

| path | component/module | purpose | status |
|---|---|---|---|
| `/` / `/index.html` | launcher | Opens tracker | IMPLEMENTED |
| `/tracker.html` | `js/vocab-tracker.js` + views | Today, Roadmap, Lesson, Mistakes, Mastery, Export, Question Bank, Settings | IMPLEMENTED/PARTIAL |
| `/clear-sw.html` | standalone page | Clears service worker/cache | IMPLEMENTED |

## 7. Current Data Schemas

- Lesson: `lesson_id`, `stage`, `stage_name`, `lesson_number`, `title`, `estimated_minutes`, `lesson_type`, `target_items`, `question_ids`, `review_question_ids`, `mastery_threshold`, `seal_threshold`, `grammar_link_id`, `status`.
- Question: `question_id`, `lesson_id`, `stage`, `type`, `skill`, `subskill`, `grammar_link_id`, `question_text`, `options.A-D`, `correct_answer`, `explanation_zh`, `target_item_id`, `distractor_type`, `difficulty`, `estimated_time_seconds`, `default_error_code`, `tags`.
- Attempt: saved immediately with `attempt_id`, `timestamp`, `stage`, `lesson_id`, `session_id`, `question_id`, `question_type`, `user_answer`, `correct_answer`, `is_correct`, `response_time_seconds`, `error_code`, `review_priority`, `target_item_id`, `grammar_link_id`, `mode`, `review_filter`, `review_ids`.
- Vocab item: `item_id`, `item_type`, `stage`, `lesson_id`, `lesson_ids`, `base_word`, `variants`, `chinese`, `example`, `common_wrong_forms`, `toeic_contexts`, `review_priority`, mastery fields.

## 8. Current Storage

- IndexedDB: `toeic_vocab_tracker_db`.
- localStorage: `toeic_vocab_tracker_preferences`, `toeic_vocab_active_session`.
- JSON seed files: `data/vocab/*`.
- No Grammar / PoS storage keys are used in this app.

## 9. Current Tracking Capability

- Lesson progress: implemented.
- Question attempts: implemented.
- Response time: implemented.
- Error code: implemented with post-lesson confirmation.
- Review queue: implemented/partial. Dedicated Review Mode exists; scheduling remains simple.
- Mastery status: implemented/partial, needs long-term real data validation.
- Export data: implemented.

## 10. Current Export Capability

Exports browser-side files: `summary.md`, `attempts.csv`, `sessions.csv`, `item_mastery.csv`, `error_summary.csv`, `review_effectiveness.csv`, `stage_progress.json`, `question_bank_snapshot.json`, and `raw_events.jsonl`.

## 11. Problems Found

1. V2/V3 are structurally valid seed content but still need human pedagogical review.
2. V4-V6 are planned only.
3. Review Mode exists, but long-term spaced-repetition scheduling is still basic.
4. Export folder behavior depends on browser File System Access API support.
5. `build-vocab-tracker-data.js` now chains the V1 and V2/V3 expansion scripts, but generated seed quality still needs review before long-term use.
6. Question bank edits persist in IndexedDB but do not rewrite source JSON files.
7. Service worker cache can serve stale files unless cache is cleared or cache version changes.

## 12. Recommended Next Steps

1. Smoke test V2-A and V3-A lessons in browser after a clean IndexedDB seed.
2. Review V2 scene vocabulary wording for natural TOEIC context quality.
3. Review V3 collocation distractors for overly artificial wrong options.
4. Run a real learner session and inspect exported `attempts.csv`, `item_mastery.csv`, and `summary.md`.
5. Only after V2/V3 quality review, start V4 Formal Phrase content.

## 13. Questions for ChatGPT

1. Which V2 scene vocabulary lessons need better TOEIC-style sentence context?
2. Which V3 collocation distractors are too unnatural and should be rewritten first?
3. Should V2/V3 use 24 questions per lesson or add heavier review lessons?
4. What should be the V4 Formal Phrase schema/content pattern?
5. What export fields would improve analysis of V2/V3 mastery?
