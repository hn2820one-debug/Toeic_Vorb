# TO_AI_APP_STATUS — TOEIC Vocabulary Tracker

Historical note: this document predates the V2/V3 content expansion. For the current improvement plan and verified V0-V3 status, use `TO_AI_APP_STATUS_V2.md`.

Last verified: 2026-05-14

Scope of this document:

- This document covers only `C:\Users\Keith\Toeic\toeic-app-Vorb`.
- It does not modify or audit `C:\Users\Keith\toeic-app`.
- It is based on direct file inspection plus actual command runs on 2026-05-14.

## 1. Executive Summary

TOEIC Vocabulary Tracker is a local-first, browser-based vocabulary training and tracking app located in `C:\Users\Keith\Toeic\toeic-app-Vorb`. It is now separated at the folder level from the Grammar / PoS App in `C:\Users\Keith\toeic-app`; the two systems do not share runtime files, vocab data files, IndexedDB names, or localStorage keys inside this project folder. The current app is designed to seed curriculum data into IndexedDB, let a learner run vocab lessons in the browser, record attempts and sessions immediately, maintain item-level mastery metadata, build a review queue, and export learning data for later analysis by ChatGPT or another engineer.

The real implementation state is narrower than the long-term roadmap. The currently runnable content is V0 Diagnostic plus full V1 Word Family, for a verified total of 70 lessons and 1,968 questions. The runtime, local storage model, review confirmation UI, mastery dashboard, browser-side export, and question bank manager all exist. However, several pieces are only partial: review queue entries are recorded but there is no dedicated review lesson engine; unlock / seal behavior is lightweight and partly manual; export is useful but not zipped and not browser-smoke-tested in this round; question bank edits only change IndexedDB, not source JSON files; and the large single-file controller in `js/vocab-tracker.js` is maintainable but already heavy.

This project is not an AI question generator, not a backend service, not a login-based app, not a cloud-sync system, and not a full TOEIC mock-test platform. V2-V6 exist only as planned stage rows in curriculum metadata and are not implemented as lesson/question data files. Future readers should treat V0 + V1 as the real implemented scope, treat review/export/question-bank as partially complete utilities around that scope, and treat V2-V6, backend, cloud sync, and AI generation as not implemented.

Current status split:

| Category | Status | Notes |
|---|---|---|
| IMPLEMENTED | Folder separation, V0 content, V1 content, IndexedDB seeding, attempt/session recording, local export, service worker, question bank basic tools | These exist in code now. |
| PARTIAL | Review queue workflow, mastery confidence, unlock/seal logic, export completeness, question bank validation depth | Present but not fully enforced or deeply validated. |
| PLANNED | V2-V6 stage roadmap | Present only as metadata in curriculum stages. |
| NOT IMPLEMENTED | Backend, login, cloud sync, AI question generation, zip export, committed browser regression suite, full TOEIC mock platform | No implementation found in this folder. |

## 2. Current Folder Path and Run Method

Project folder:

```text
C:\Users\Keith\Toeic\toeic-app-Vorb
```

Recommended run command:

```powershell
cd C:\Users\Keith\Toeic\toeic-app-Vorb
python -m http.server 8788 --bind 127.0.0.1
```

Open:

```text
http://127.0.0.1:8788/
```

Notes:

- `README.md` still shows port `8787`.
- `index.html` footer also still shows port `8787`.
- For current local workflow, `8788` is the safer recommendation to avoid colliding with the separate Grammar App on `8787`.
- The port number does not change app logic, but stale docs can confuse side-by-side local testing.

## 3. Folder Tree

```text
toeic-app-Vorb/
├── index.html                      # Launcher page; links to tracker.html and registers sw.js.
├── tracker.html                    # Main Vocabulary Tracker app shell.
├── clear-sw.html                   # Browser utility to unregister service workers and clear caches.
├── manifest.json                   # PWA manifest for the vocabulary app.
├── sw.js                           # Vocabulary app service worker and static cache list.
├── README.md                       # Existing project summary; currently still shows 8787 in run instructions.
├── TO_AI_APP_STATUS.md             # This handoff document.
├── css/
│   ├── base.css                    # Shared app visual foundation for launcher and tracker pages.
│   └── tracker.css                 # Vocabulary Tracker UI layout and component styling.
├── js/
│   ├── vocab-db.js                 # IndexedDB wrapper, seed loader, storage helpers.
│   ├── vocab-scoring.js            # Error code constants, timing buckets, mastery math, CSV/download helpers.
│   └── vocab-tracker.js            # Main UI controller, runtime, dashboards, export, question bank, settings.
├── data/
│   └── vocab/
│       ├── curriculum.json         # Course metadata, stage metadata, lesson rows, question_files list.
│       ├── vocab_items.json        # Seed vocab item metadata for V0/V1 tracking.
│       ├── questions_v0.json       # V0 diagnostic question bank.
│       ├── questions_v1a.json      # V1-A word family question bank.
│       ├── questions_v1b.json      # V1-B word family question bank.
│       ├── questions_v1c.json      # V1-C word family question bank.
│       ├── questions_v1d.json      # V1-D word family question bank.
│       ├── questions_v1e.json      # V1-E word family question bank.
│       └── questions_v1f.json      # V1-F mixed speed-reflex question bank.
├── scripts/
│   ├── build-vocab-tracker-data.js # Generates / rewrites curriculum, vocab items, and question JSON seed files.
│   ├── expand-v1-content.js        # V1-B to V1-F content expansion helper used by build script.
│   └── validate-vocab-data.js      # Validation script for vocab lesson/question content.
├── docs/
│   ├── CHATGPT_ANALYSIS_PACKAGE.md # Existing analysis-oriented handoff; includes historical separation context.
│   ├── CURRICULUM_MAP.md           # Generated curriculum map; still contains old Program A/B framing.
│   ├── DATA_MODEL.md               # Existing data model notes for lessons/questions/attempts/session/items.
│   ├── EXPORT_SPEC.md              # Existing export-file spec and status notes.
│   └── KNOWN_ISSUES.md             # Existing issue log; some entries are historical and cross-project in tone.
└── icons/
    ├── icon-192.svg                # Manifest icon.
    └── icon-512.svg                # Manifest icon.
```

## 4. Main Entry Points

### `index.html`

- Role: launcher page.
- It is not the main lesson runtime.
- It displays basic app identity, storage names, current content counts, and a button linking to `./tracker.html`.
- It registers `./sw.js` on page load.
- It still shows `python -m http.server 8787` in the footer, so its run note is stale relative to the recommended `8788` workflow.

### `tracker.html`

- Role: main app.
- CSS loaded:
  - `./css/base.css`
  - `./css/tracker.css`
- JS loaded:
  - `./js/vocab-scoring.js`
  - `./js/vocab-db.js`
  - `./js/vocab-tracker.js`
- It defines the UI containers that the runtime uses:
  - `#top-strip`
  - `#tracker-tabs`
  - `#tracker-notice`
  - `#tracker-view`
- It registers `./sw.js` and immediately runs `window.VocabTracker.init()`.

### `clear-sw.html`

- Role: cache reset utility page.
- It unregisters all service workers visible to the current origin.
- It deletes all cache entries returned by `caches.keys()`.
- It then exposes a button to return to `./index.html`.
- It is a real working maintenance page, not a placeholder.

### `sw.js`

- Role: service worker for this vocabulary app.
- Current cache name: `toeic-vorb-v1`.
- Static assets cached on install:
  - `./`
  - `./index.html`
  - `./tracker.html`
  - `./clear-sw.html`
  - `./manifest.json`
  - `./css/base.css`
  - `./css/tracker.css`
  - `./js/vocab-db.js`
  - `./js/vocab-scoring.js`
  - `./js/vocab-tracker.js`
  - all current `data/vocab/*.json`
  - both manifest icons
- Scope is vocab-only inside this folder. No grammar data files are cached here.

### `manifest.json`

- Role: vocabulary app PWA manifest.
- `name`: `TOEIC Vocabulary Tracker`
- `short_name`: `Vocab Tracker`
- `start_url`: `./index.html`
- `scope`: `./`
- `display`: `standalone`
- Icons: `./icons/icon-192.svg`, `./icons/icon-512.svg`
- This manifest is vocab-specific.

## 5. JavaScript Files and Responsibilities

No other files exist under `js/` beyond the three listed below.

| File | Responsibility | Actual behavior | Status |
|---|---|---|---|
| `js/vocab-db.js` | Storage and seeding layer | Opens IndexedDB, creates stores/indexes, loads curriculum/question files/vocab items, seeds initial records, wraps generic get/put/getAll/getByIndex helpers, stores preferences and active session in localStorage | IMPLEMENTED |
| `js/vocab-scoring.js` | Shared scoring helpers | Defines error-code catalog, target response times, speed buckets, mastery formula, date helpers, CSV helpers, text download helper | PARTIAL |
| `js/vocab-tracker.js` | Main UI controller | Owns views, lesson runtime, attempt/session writing, review queue updates, dashboards, export builder, question bank manager, settings UI | NEEDS_REFACTOR |

### `js/vocab-db.js`

Status: IMPLEMENTED

Responsibilities:

- Owns IndexedDB setup.
- Database name: `toeic_vocab_tracker_db`.
- Database version: `1`.
- Course ID constant: `toeic_vocab_v1`.
- Seed version constant: `toeic_vocab_tracker_v1_full_2026_05_14`.
- localStorage keys:
  - `toeic_vocab_tracker_preferences`
  - `toeic_vocab_active_session`

Object stores created here:

- `users`
- `settings`
- `curriculum`
- `lessons`
- `questions`
- `vocab_items`
- `attempts`
- `sessions`
- `error_logs`
- `review_queue`
- `exports`

Seed loading behavior:

- Loads `./data/vocab/curriculum.json` first.
- Uses `curriculum.question_files` when present.
- Current `question_files` value is:
  - `questions_v0.json`
  - `questions_v1a.json`
  - `questions_v1b.json`
  - `questions_v1c.json`
  - `questions_v1d.json`
  - `questions_v1e.json`
  - `questions_v1f.json`
- Loads all listed question files plus `./data/vocab/vocab_items.json`.
- Merges seed lessons / questions / items with existing records rather than blindly discarding all existing IndexedDB rows.

Attempts / sessions / review_queue / exports write behavior:

- `vocab-db.js` itself does not contain business-specific write logic for those records.
- Instead, it provides generic `put`, `putAll`, `get`, `getAll`, and `getByIndex` helpers.
- The actual writes are triggered from `js/vocab-tracker.js`.

### `js/vocab-scoring.js`

Status: PARTIAL

What is here now:

- Error code catalog:
  - `VOCAB_UNKNOWN`
  - `VOCAB_WEAK_RECALL`
  - `WORD_FAMILY_POS`
  - `COLLOCATION_PREP`
  - `PHRASE_MEANING`
  - `FORMAL_PHRASE`
  - `FALSE_FRIEND`
  - `SCENE_VOCAB_GAP`
  - `TIME_PRESSURE`
  - `CARELESS`
  - `REPEATED_ERROR`
- Response-time target table by question type.
- `speedBucket()` classification:
  - `fast_correct`
  - `slow_correct`
  - `fast_wrong`
  - `slow_wrong`
- Mastery helpers:
  - `calculateMasteryScore()`
  - `masteryLevel()`
- Date helpers:
  - `localDate()`
  - `localIso()`
  - `addDays()`
- Export helpers:
  - `toCsv()`
  - `downloadText()`

Important boundary note:

- `js/vocab-scoring.js` does not directly assign review priority.
- Review priority decisions are made inside `js/vocab-tracker.js` when attempts are recorded or confirmed.
- Mastery math exists, but it has not been validated with long-term real user data, so the file is better described as PARTIAL rather than fully proven.

### `js/vocab-tracker.js`

Status: NEEDS_REFACTOR

It is the main UI controller and currently owns all of the following:

- View routing:
  - `today`
  - `roadmap`
  - `lesson`
  - `mistakes`
  - `mastery`
  - `export`
  - `bank`
  - `settings`
- Lesson runtime assembly and timers.
- Immediate question answering persistence.
- Session completion and summary generation.
- Review queue updates.
- Dashboard rendering.
- Export-file building and browser downloads.
- Question bank filter / editor / import / export / validation UI.
- Settings and manual lesson-status overrides.

Lesson runtime behavior:

- Uses a fixed UI step plan:
  - `previous_review`
  - `new_vocabulary`
  - `pattern_focus`
  - `toeic_practice`
  - `error_review_scheduling`
- Runtime questions are built from `lesson.question_ids` and `lesson.review_question_ids`.
- The step assignment is heuristic by question type, not author-defined per lesson.
- All answered questions are saved immediately.

Question answering behavior:

- Each answer creates an `attempts` record immediately.
- Item mastery is updated immediately.
- Active session progress is saved into localStorage for resume.
- Correctness is hidden until later review; the UI says the answer is locked and saved.

Dashboard behavior:

- Today metrics, weekly summary, stage summary, lesson roadmap, review queue, mastery list, export preview, and question bank all render from this same file.

Export behavior:

- All export files are built here on the client side.
- If `showDirectoryPicker` is available, files are written into a browser-selected folder.
- Otherwise files are downloaded one by one.

Question bank manager:

- Also lives here.
- Edits are written into IndexedDB `questions` store only.
- Source JSON files under `data/vocab/` are not rewritten by browser edits.

Why NEEDS_REFACTOR:

- The file mixes storage orchestration, view rendering, runtime logic, export building, and question-bank maintenance in one place.
- Functionality exists, but future expansion will be harder unless it is split by concern.

## 6. Data Files and Curriculum Content

### Files in `data/vocab/`

| File | Purpose | Verified count / note | Status |
|---|---|---|---|
| `curriculum.json` | Course metadata, stages, lessons, top-level `question_files` list | 70 lessons | IMPLEMENTED |
| `vocab_items.json` | Seed vocab item metadata | 54 items | IMPLEMENTED |
| `questions_v0.json` | V0 diagnostic questions | 240 questions | IMPLEMENTED |
| `questions_v1a.json` | V1-A word family questions | 240 questions | IMPLEMENTED |
| `questions_v1b.json` | V1-B word family questions | 192 questions | IMPLEMENTED |
| `questions_v1c.json` | V1-C word family questions | 192 questions | IMPLEMENTED |
| `questions_v1d.json` | V1-D word family questions | 192 questions | IMPLEMENTED |
| `questions_v1e.json` | V1-E word family questions | 192 questions | IMPLEMENTED |
| `questions_v1f.json` | V1-F mixed speed-reflex questions | 720 questions | IMPLEMENTED |

### Verified totals

- Total lessons: `70`
- Total questions: `1968`
- Total vocab seed items: `54`

### Lessons per stage / group

| Stage / Group | Lessons | Status |
|---|---:|---|
| V0 | 10 | IMPLEMENTED |
| V1-A | 10 | IMPLEMENTED |
| V1-B | 8 | IMPLEMENTED |
| V1-C | 8 | IMPLEMENTED |
| V1-D | 8 | IMPLEMENTED |
| V1-E | 8 | IMPLEMENTED |
| V1-F | 18 | IMPLEMENTED |
| V2 | 0 lesson rows in `lessons`; stage exists only in top-level stage metadata | PLANNED |
| V3 | 0 lesson rows in `lessons`; stage exists only in top-level stage metadata | PLANNED |
| V4 | 0 lesson rows in `lessons`; stage exists only in top-level stage metadata | PLANNED |
| V5 | 0 lesson rows in `lessons`; stage exists only in top-level stage metadata | PLANNED |
| V6 | 0 lesson rows in `lessons`; stage exists only in top-level stage metadata | PLANNED |

### Questions per file

| File | Questions | Status |
|---|---:|---|
| `questions_v0.json` | 240 | IMPLEMENTED |
| `questions_v1a.json` | 240 | IMPLEMENTED |
| `questions_v1b.json` | 192 | IMPLEMENTED |
| `questions_v1c.json` | 192 | IMPLEMENTED |
| `questions_v1d.json` | 192 | IMPLEMENTED |
| `questions_v1e.json` | 192 | IMPLEMENTED |
| `questions_v1f.json` | 720 | IMPLEMENTED |

### Content status by stage

| Area | Real status |
|---|---|
| V0 content | IMPLEMENTED |
| V1-A content | IMPLEMENTED |
| V1-B content | IMPLEMENTED |
| V1-C content | IMPLEMENTED |
| V1-D content | IMPLEMENTED |
| V1-E content | IMPLEMENTED |
| V1-F content | IMPLEMENTED |
| V2-V6 content files | NOT PRESENT |
| V2-V6 stage roadmap | PLANNED only |

Important honesty note:

- V2-V6 are not implemented in this folder.
- They appear only as planned stage entries in `curriculum.json`.
- No `questions_v2*.json`, `questions_v3*.json`, `questions_v4*.json`, `questions_v5*.json`, or `questions_v6*.json` files were found.

## 7. Curriculum Logic

### Lesson field logic

| Field | Current behavior |
|---|---|
| `lesson_id` | Actual formats include `V0-1`, `V0-10`, `V1-A-11`, `V1-F-70`. |
| `stage` | Only `V0` and `V1` appear in actual lesson rows. V1 subgroup detail is encoded in `lesson_id`, not in `stage`. |
| `lesson_number` | Sequential numeric order across the whole implemented course, 1 through 70. |
| `title` | Human-readable lesson title. |
| `lesson_type` | Real values include `diagnostic`, `meaning_choice`, `scene_vocabulary`, `collocation`, `formal_phrase`, `false_friend`, `part5_sentence_completion`, `part6_context_choice`, `speed_drill`, `word_family`. |
| `target_items` | Array of target words / phrases / family forms for the lesson. |
| `question_files` | Top-level curriculum field used only during seed loading to know which JSON files to import. |
| `question_ids` | Per-lesson list of core questions actually used by the runtime. |
| `review_question_ids` | Per-lesson list of lesson-linked review questions. |
| `mastery_threshold` | Present in data, but current JS runtime does not read it. |
| `seal_threshold` | Present in data, but current JS runtime does not read it. |
| `status` | Persisted lesson state in IndexedDB: `not_started`, `in_progress`, `completed`, `completed_with_reinforcement`, `needs_retake`, `sealed`. |

### Unlock / retake / reinforcement reality

| Feature | Real status | Notes |
|---|---|---|
| Lesson unlock | PARTIAL | `currentLesson()` chooses the next unfinished lesson, but the roadmap lets the user start any lesson manually. There is no strict lock gate. |
| Retake | IMPLEMENTED | `needs_retake` is a real lesson status and the user can restart lessons. |
| Reinforcement | PARTIAL | Wrong attempts can create review queue entries, but there is no dedicated generated reinforcement lesson runtime. |
| Seal | PARTIAL | `sealed` exists as a status and is shown in stage summaries, but there is no automatic seal transition in current runtime. Manual override exists in Roadmap. |

### Threshold reality

This is important for future maintainers:

- `curriculum.json` stores `mastery_threshold` and `seal_threshold` per lesson.
- Current runtime does **not** read those fields.
- `finishLesson()` uses hardcoded gates instead:
  - `accuracy >= 0.8` -> `completed`
  - `0.6 <= accuracy < 0.8` -> `completed_with_reinforcement`
  - `< 0.6` -> `needs_retake`
- Auto-seal logic is not implemented even though `seal_threshold` exists in data.

### Actual V0 / V1 flow

V0:

- 10 diagnostic lessons.
- Each V0 lesson has 20 core questions plus 4 review questions = 24 total seed questions.
- All V0 lessons run through the same fixed five-step UI shell.

V1-A to V1-E:

- Word-family lessons.
- Each lesson has 20 core questions plus 4 review questions = 24 total seed questions.
- Runtime heuristics place questions into previous review / new vocabulary / pattern focus / TOEIC practice buckets based on question type.

V1-F:

- Mixed speed-reflex lessons.
- Each lesson has 40 questions.
- Because V1-F questions are `speed_drill`, the current step-mapping heuristic puts 1 question into `previous_review` and nearly all remaining questions into `toeic_practice`.
- That is workable, but it is a heuristic runtime artifact, not a custom-authored step plan.

## 8. Question Schema

### Actual top-level question keys found in current data

```json
[
  "correct_answer",
  "default_error_code",
  "difficulty",
  "distractor_type",
  "estimated_time_seconds",
  "explanation_zh",
  "grammar_link_id",
  "lesson_id",
  "options",
  "question_id",
  "question_text",
  "skill",
  "stage",
  "subskill",
  "tags",
  "target_item_id",
  "type"
]
```

### Representative actual question shape

```json
{
  "question_id": "v0_1_q_001",
  "lesson_id": "V0-1",
  "stage": "V0",
  "type": "meaning_choice",
  "skill": "meaning_choice",
  "subskill": "meaning_choice",
  "grammar_link_id": null,
  "question_text": "In a TOEIC business context, what does \"shipment\" most nearly mean?",
  "options": {
    "A": "discount",
    "B": "venue",
    "C": "policy",
    "D": "goods sent for delivery"
  },
  "correct_answer": "D",
  "explanation_zh": "\"shipment\" 在 TOEIC 商務情境中通常指「goods sent for delivery」。",
  "target_item_id": "item_shipment",
  "distractor_type": "toeic_realistic",
  "difficulty": 1,
  "estimated_time_seconds": 10,
  "default_error_code": "VOCAB_UNKNOWN",
  "tags": ["toeic_part5", "diagnostic", "meaning"]
}
```

### Required vs optional in current validation script

Required by `scripts/validate-vocab-data.js`:

- `question_id`
- `lesson_id`
- `stage`
- `type`
- `question_text`
- `correct_answer`
- `explanation_zh`
- `target_item_id`
- `default_error_code`
- `difficulty`
- `options.A`
- `options.B`
- `options.C`
- `options.D`
- `correct_answer` must be one of `A/B/C/D`

Optional at script level, but currently present in all existing data rows:

- `skill`
- `subskill`
- `distractor_type`
- `estimated_time_seconds`
- `tags`

Optional / nullable in real data:

- `grammar_link_id`
  - Missing / null for all 240 V0 questions.
  - Present in V1 data.

### What the validation script checks

`scripts/validate-vocab-data.js` currently checks:

- required top-level fields
- `options` object shape and A/B/C/D presence
- `correct_answer` value validity
- duplicate `question_id`
- lesson reference existence in `curriculum.json`
- duplicate / near-duplicate normalized `question_text` for non-V0 questions
- missing `grammar_link_id` for non-V0 questions
- missing `tags`
- missing `estimated_time_seconds`
- answer distribution balance per file

### Duplicate / near-duplicate warning status

- Verified warning count: `439`
- Verified duplicate `question_id` count: `0`
- Verified missing field count: `0`
- Blocking: `No`
- The script printed warnings and still ended with `Vocab data validation passed.`

Important nuance:

- The standalone validation script does near-duplicate detection with normalized question text and reports the current `439` warnings.
- The in-app question bank validator is lighter and only detects exact duplicate question text inside the currently filtered set.
- So the browser question bank UI does **not** replace the full validation script.

## 9. Vocab Item Schema

This section describes the actual schema of `data/vocab/vocab_items.json`, not the enriched IndexedDB record after runtime use.

### Actual top-level item keys found in `vocab_items.json`

```json
[
  "base_word",
  "chinese",
  "common_wrong_forms",
  "example",
  "item_id",
  "item_type",
  "lesson_id",
  "lesson_ids",
  "mastery_level",
  "mastery_score",
  "review_priority",
  "stage",
  "toeic_contexts",
  "variants"
]
```

### Representative actual `vocab_items.json` row

```json
{
  "item_id": "item_accurate_family",
  "item_type": "word_family",
  "stage": "V1",
  "lesson_id": "V1-A-11",
  "lesson_ids": [
    "V1-A-11",
    "V1-F-53",
    "V1-F-54",
    "V1-F-55",
    "V1-F-56",
    "V1-F-57",
    "V1-F-58",
    "V1-F-59",
    "V1-F-60",
    "V1-F-61",
    "V1-F-62",
    "V1-F-63",
    "V1-F-64",
    "V1-F-65",
    "V1-F-66",
    "V1-F-67",
    "V1-F-68",
    "V1-F-69",
    "V1-F-70"
  ],
  "base_word": "accurate",
  "variants": ["accuracy", "accurate", "accurately", "inaccuracy"],
  "chinese": "準確；準確度；準確地；不準確",
  "example": "The finance team checked the accuracy of the invoice before approval.",
  "common_wrong_forms": ["accuratey", "accuration", "accurated"],
  "toeic_contexts": ["finance", "reports", "invoices"],
  "review_priority": 3,
  "mastery_score": 0,
  "mastery_level": "blind"
}
```

### Linking between items and questions

- Questions link to items through `question.target_item_id`.
- `target_item_id` values match `vocab_items.item_id`.
- Runtime records continue using that same linkage:
  - `attempts.target_item_id`
  - `error_logs.item_id`
  - `review_queue.item_id`

Important nuance:

- `vocab_items.json` is seed metadata only.
- When first seeded into IndexedDB, `vocab-db.js` adds tracking fields such as `first_seen`, `last_seen`, `seen_count`, `correct_count`, `wrong_count`, `avg_response_time_seconds`, `last_error_code`, `consecutive_fast_correct`, `stable_review_sessions`, and `next_review_date`.
- Those extra tracking fields are not part of the source JSON file itself.

## 10. IndexedDB / Storage Model

### Database

- IndexedDB database name: `toeic_vocab_tracker_db`
- Database version: `1`
- Course ID constant: `toeic_vocab_v1`

### localStorage keys

Confirmed keys used by this project:

| Key | Purpose | Status |
|---|---|---|
| `toeic_vocab_tracker_preferences` | Stores lightweight preferences such as `last_opened_lesson`, `current_stage`, and `planned_lessons_this_week` | IMPLEMENTED |
| `toeic_vocab_active_session` | Stores resumable active lesson session snapshot | IMPLEMENTED |

Other vocab-specific localStorage keys found in this folder:

- None beyond the two keys above.

### IndexedDB object stores

| Store | KeyPath | Purpose | Main fields | Written by | Read by | Status |
|---|---|---|---|---|---|---|
| `users` | `user_id` | Learner profile | `user_id`, `display_name`, `baseline_score`, `target_score` | `vocab-db.js` seed, `vocab-tracker.js` settings save | `vocab-tracker.js` loadData | IMPLEMENTED |
| `settings` | `key` | Seed / course metadata flags | `seed_version`, `course_id`, `updated_at` | `vocab-db.js` seedIfNeeded | `vocab-db.js` seedIfNeeded | IMPLEMENTED |
| `curriculum` | `course_id` | Top-level course metadata | `course_id`, `course_name`, `schema_version`, `seed_version`, `generated_at`, `question_files`, `stages` | `vocab-db.js` seedIfNeeded | `vocab-tracker.js` loadData | IMPLEMENTED |
| `lessons` | `lesson_id` | Lesson rows and progress state | `lesson_id`, `stage`, `lesson_number`, `title`, `lesson_type`, `target_items`, `question_ids`, `review_question_ids`, `status` | `vocab-db.js` seedIfNeeded, `vocab-tracker.js` start/finish/manual status change | `vocab-tracker.js` loadData, current lesson logic, roadmap, runtime prep | IMPLEMENTED / PARTIAL |
| `questions` | `question_id` | Full question bank | schema from Section 8 | `vocab-db.js` seedIfNeeded, `vocab-tracker.js` question-bank save/import | `vocab-tracker.js` loadData, runtime prep, question bank, export | IMPLEMENTED |
| `vocab_items` | `item_id` | Item metadata plus rolling mastery tracking | source item fields plus runtime counts/timing/mastery fields | `vocab-db.js` seedIfNeeded, `vocab-tracker.js` updateItemMastery / confirmError | `vocab-tracker.js` loadData, mastery dashboard, export, review queue labels | IMPLEMENTED / PARTIAL |
| `attempts` | `attempt_id` | Per-question answer records | attempt fields from Section 12 | `vocab-tracker.js` answerCurrent, confirmError update | `vocab-tracker.js` loadData, finishLesson, mistakes, export | IMPLEMENTED |
| `sessions` | `session_id` | Per-lesson summary records | session fields from Section 13 | `vocab-tracker.js` finishLesson | `vocab-tracker.js` loadData, dashboards, export | IMPLEMENTED |
| `error_logs` | `error_log_id` | Confirmed post-lesson error-cause records | `attempt_id`, `item_id`, `error_code`, `status`, timestamps | `vocab-tracker.js` confirmError | `vocab-tracker.js` loadData, export | PARTIAL |
| `review_queue` | `review_id` | Pending review tasks tied to items/questions | `item_id`, `question_ids`, `reason`, `priority`, `due_date`, `status` | `vocab-tracker.js` upsertReviewQueue, markQueueDone | `vocab-tracker.js` loadData, mistakes view, export | PARTIAL |
| `exports` | `export_id` | Export audit metadata | `created_at`, `folder_name`, `file_names`, `session_count`, `attempt_count` | `vocab-tracker.js` exportPackage | No active UI read path found | PARTIAL |

Key storage notes:

- `lessons` is PARTIAL because unlock/seal logic is lightweight and manual override exists.
- `vocab_items` is PARTIAL because the formula exists, but the learning model is not yet proven with real longitudinal usage.
- `error_logs` is PARTIAL because only confirmed error-review writes exist; there is no broader analytics or remediation workflow on top of it.
- `review_queue` is PARTIAL because it records tasks, but does not yet drive a dedicated review lesson engine.
- `exports` is PARTIAL because records are written, but no current UI reads the `exports` store back.

## 11. Runtime Flow

### Actual user flow

1. User opens `index.html`.
2. User clicks into `tracker.html`.
3. `tracker.html` loads `vocab-scoring.js`, `vocab-db.js`, and `vocab-tracker.js`.
4. `window.VocabTracker.init()` runs.
5. `seedIfNeeded()` checks `settings.seed_version`.
6. If seed is missing or outdated, curriculum, question files, and vocab items are fetched from `data/vocab/*.json` and written into IndexedDB.
7. `loadData()` pulls curriculum, user, lessons, questions, vocab items, attempts, sessions, error logs, and review queue into runtime state.
8. Dashboard renders.
9. User starts a lesson.
10. An active session object is created and saved to localStorage.
11. Questions are assembled from `question_ids` plus `review_question_ids`.
12. User answers a question.
13. Attempt is written immediately to IndexedDB.
14. Item mastery is updated immediately.
15. Session answer snapshot is updated in localStorage.
16. After all questions are answered, user finishes the lesson.
17. Session summary is generated and written to IndexedDB.
18. Lesson status is updated.
19. If needed, review queue entries are created.
20. User lands in the mistakes / error-review flow.
21. User can confirm or change error codes.
22. Confirmed error review updates attempts, error_logs, review_queue, and item next-review date.
23. Dashboard state reflects the new data.
24. User can export all current data from the Export page.

### Flow chart text

```text
index.html
  ↓
tracker.html
  ↓
load data/vocab/*.json
  ↓
seed IndexedDB
  ↓
start lesson
  ↓
answer question
  ↓
save attempt
  ↓
session summary
  ↓
review queue
  ↓
dashboard / export
```

### Important runtime reality

- The runtime is local-first and browser-only.
- There is no backend checkpoint.
- Active session resume depends on localStorage plus IndexedDB.
- The five-step lesson shell is fixed UI structure, not deeply customized per lesson file.

## 12. Attempt Recording Logic

### Fields recorded per answer

Representative current attempt shape:

```json
{
  "attempt_id": "20260514_V1_A_14_Q001_1760000000000",
  "timestamp": "2026-05-14T02:00:00+08:00",
  "user_id": "Keith",
  "course_id": "toeic_vocab_v1",
  "stage": "V1",
  "lesson_id": "V1-A-14",
  "step": "toeic_practice",
  "session_id": "ses_...",
  "question_id": "v1_a_14_q_001",
  "question_type": "word_family",
  "correct_answer": "B",
  "user_answer": "C",
  "is_correct": false,
  "response_time_seconds": 14.2,
  "speed_bucket": "fast_wrong",
  "error_code": "WORD_FAMILY_POS",
  "default_error_code": "WORD_FAMILY_POS",
  "is_repeated_error": true,
  "review_priority": 5,
  "mode": "blind_drill",
  "target_item_id": "item_available_family",
  "grammar_link_id": "ADJ_AFTER_BE"
}
```

Minimum field set the user specifically asked for:

- `attempt_id`
- `timestamp`
- `user_id`
- `course_id`
- `stage`
- `lesson_id`
- `step`
- `question_id`
- `question_type`
- `correct_answer`
- `user_answer`
- `is_correct`
- `response_time_seconds`
- `error_code`
- `review_priority`
- `mode`

### When the attempt is written

- It is written immediately when the learner clicks an answer.
- It is **not** deferred until lesson finish.
- `answerCurrent()` writes the attempt to IndexedDB before moving on.

### Refresh / loss behavior

- If the learner has already answered previous questions, those attempts are already in IndexedDB and are not lost on refresh.
- The active session snapshot is also stored in localStorage, so lesson resume is supported.
- However, the timer for the current unanswered question is stored only in memory (`state.questionStartedAt`).
- So if the page refreshes before the current question is answered, elapsed time already spent on that one unanswered question is lost and the clock restarts.

### Answer time calculation

- `response_time_seconds` is calculated as:
  - `Date.now() - state.questionStartedAt`
- A floor of `0.2` seconds is enforced.
- Pause / resume adjusts the question timer by adding paused duration back into `questionStartedAt`.

### Error code determination

Initial write:

- If correct: `error_code = null`
- If wrong: `error_code = question.default_error_code`

Post-lesson confirmation:

- The learner can confirm or change the error code in the Error Review screen.
- `confirmError()` updates the stored attempt record later.

### Review priority determination

Initial write in `answerCurrent()`:

- wrong with at least 2 previous wrongs on same `target_item_id` -> `5`
- wrong otherwise -> `3`
- correct -> `0`

Confirmed review in `confirmError()`:

- `wrongCount >= 3` or chosen error code `REPEATED_ERROR` -> `5`
- chosen error code `CARELESS` -> `2`
- otherwise -> `3`

### Repeated error determination

- Uses prior / current wrong history for the same `target_item_id`.
- It is item-level repeatedness, not only exact-question repeatedness.

## 13. Session Summary Logic

### When a session is created

- A lesson session object is created at lesson start and stored in localStorage.
- The durable IndexedDB `sessions` record is created only when the learner finishes the lesson.

### Representative session record

```json
{
  "session_id": "ses_...",
  "date": "2026-05-14",
  "stage": "V1",
  "lesson_id": "V1-A-14",
  "lesson_title": "available word family",
  "total_questions": 24,
  "correct_questions": 20,
  "wrong_questions": 4,
  "accuracy": 0.8333333333,
  "avg_response_time_seconds": 6.4,
  "top_error_codes": ["WORD_FAMILY_POS"],
  "mastery_status": "passed",
  "next_action": "unlock_next_lesson"
}
```

### Required summary behavior in current code

- `total_questions` comes from attempts in the session.
- `correct_questions` / `wrong_questions` are counted from session attempts.
- `accuracy` is session correct ratio.
- `avg_response_time_seconds` is average session response time.
- `top_error_codes` is the top 5 wrong-attempt error codes for that session.
- `mastery_status` and `next_action` are derived from accuracy.

### Current mastery gate

Lesson status gate currently implemented in runtime:

- `accuracy >= 0.8` -> `completed`
- `0.6 <= accuracy < 0.8` -> `completed_with_reinforcement`
- `accuracy < 0.6` -> `needs_retake`

Session-level descriptive fields currently implemented in runtime:

- `accuracy >= 0.85` -> `mastery_status = stable`
- `accuracy >= 0.8` -> `mastery_status = passed`
- `accuracy >= 0.6` -> `mastery_status = unstable`
- otherwise -> `mastery_status = needs_retake`

`next_action` values currently used:

- `unlock_next_lesson`
- `add_5_reinforcement_questions`
- `retake_lesson`

### Does this truly unlock the next lesson?

Not strictly.

- The current lesson status is updated in IndexedDB.
- `currentLesson()` then tends to pick the next unfinished lesson.
- But there is no strict lock / unlock system preventing the user from launching later lessons in the roadmap.
- So `unlock_next_lesson` is mostly a recorded recommendation plus default flow hint, not a hard gate.

### Does reinforcement truly generate a new lesson?

Only partially.

- `completed_with_reinforcement` causes up to 5 wrong attempts to be inserted into `review_queue`.
- It does not generate a dedicated reinforcement lesson file or dynamic runtime lesson.

## 14. Error Review / Review Queue Logic

### Error review flow

- After `finishLesson()`, the app moves to the Mistakes view.
- If the just-finished session has wrong answers, `renderSessionErrorReview()` shows them.
- Each wrong attempt shows:
  - lesson ID
  - question type
  - response time
  - question text
  - learner answer vs correct answer
  - explanation
  - error-code dropdown
- The learner can confirm or change the cause.

### What `confirmError()` updates

When the learner saves confirmed error codes, the app:

- updates the existing `attempts` row
- writes a new `error_logs` row
- upserts a `review_queue` row
- updates the linked `vocab_items` row with:
  - `last_error_code`
  - `next_review_date`

### How `review_queue` is built

Queue record shape:

```json
{
  "review_id": "review_item_available_family_2026-05-16",
  "item_id": "item_available_family",
  "question_ids": ["v1_a_14_q_001"],
  "reason": "repeated_error",
  "priority": 5,
  "due_date": "2026-05-16",
  "status": "pending",
  "created_at": "2026-05-14T02:00:00+08:00",
  "updated_at": "2026-05-14T02:05:00+08:00"
}
```

Rules:

- Queue key is based on item + due date.
- Existing queue entries for the same item/date are merged.
- `question_ids` are unioned into one set.
- Due date is currently computed from priority:
  - priority `>= 5` -> due in 1 day
  - otherwise -> due in 2 days

### Repeated error logic

- Uses wrong-attempt count on the same `target_item_id`.
- In confirmation flow, `wrongCount >= 2` marks `is_repeated_error = true`.

### Review priority logic

Current confirmation rules:

- `REPEATED_ERROR` or large wrong history -> highest priority
- `CARELESS` -> lower priority
- other confirmed wrong causes -> medium priority

### Is the review queue only a log, or does it actively schedule lessons?

Current reality: PARTIAL.

- It is more than a passive log because due date, priority, and status are tracked.
- But it does not yet create or launch a dedicated review lesson engine.
- The current UI only displays queue cards and allows manual `Done` marking.

### Status summary

| Feature | Status | Notes |
|---|---|---|
| Post-lesson error confirmation | IMPLEMENTED | Real UI exists. |
| Error code change / confirm | IMPLEMENTED | Writes back to attempts and error logs. |
| Review queue creation | IMPLEMENTED | Real records are created. |
| Repeated error detection | IMPLEMENTED / PARTIAL | Works by item history, but remains simple. |
| Priority assignment | IMPLEMENTED / PARTIAL | Exists, but heuristic only. |
| Dedicated review lesson runtime | NOT IMPLEMENTED | Queue does not yet launch a review mode lesson. |

## 15. Dashboard Logic

Current UI views / cards are spread across several screens.

| View / card | What it shows | Data source | Real-time behavior | Status |
|---|---|---|---|---|
| Today hero | current stage, lesson, start button | `lessons`, `prefs` | Updates on render after state changes | IMPLEMENTED |
| Today Questions | today's attempt count and session count | `attempts`, `sessions` | Immediate after answer / finish | IMPLEMENTED |
| Accuracy | today's accuracy and wrong count | `attempts` | Immediate after answer | IMPLEMENTED |
| Avg Time | today's average response time | `attempts` | Immediate after answer | IMPLEMENTED |
| Vocab Progress | completed vs total lessons | `lessons` | Updates after finish/status change | IMPLEMENTED |
| Next Action | review due / retake / start current lesson hint | `review_queue`, `lessons` | Updates after finish/review | PARTIAL |
| Top Error Codes | today's most frequent error codes | `attempts` | Updates after answer / confirm | IMPLEMENTED |
| Weakest Modules | lowest-accuracy question types | `attempts` grouped by `question_type` | Updates after answer | IMPLEMENTED |
| Weekly Dashboard | lessons this week, weekly accuracy, average time, review fix rate | `sessions`, `attempts`, `prefs` | Recomputed on render | IMPLEMENTED |
| Stage Dashboard | completed lessons per stage | `curriculum.stages`, `lessons` | Recomputed on render | IMPLEMENTED / PARTIAL |
| Roadmap stage cards | progress bars by stage | `curriculum.stages`, `lessons` | Recomputed on render | IMPLEMENTED |
| Roadmap lesson list | lesson title, estimated minutes, question counts, manual status dropdown, start button | `lessons` | Recomputed on render | IMPLEMENTED / PARTIAL |
| Mistake Review Queue | pending review entries | `review_queue`, `vocab_items` | Updates after confirm / done | PARTIAL |
| Recent Wrong Attempts | last 20 wrong attempts | `attempts`, `questions` | Updates after answer / confirm | IMPLEMENTED |
| Item Mastery Dashboard | per-item mastery rows | `vocab_items` | Updates after answer / confirm | IMPLEMENTED / PARTIAL |
| Export Dashboard | counts plus export buttons and summary preview | `sessions`, `attempts`, `vocab_items`, `questions` | Rebuilt on render | IMPLEMENTED / PARTIAL |
| Question Bank | filtered question list, editor, validation counts | `questions` | Rebuilt on render | PARTIAL |
| Settings | user display name, baseline/target score, lessons/week, local store counts | `users`, `prefs`, in-memory counts | Updates after save/load | IMPLEMENTED |

Important dashboard nuance:

- The app feels immediate within a single tab because state is updated in memory and re-rendered.
- It is not a cross-tab live-sync system.
- If another browser tab changes IndexedDB, the current tab will not auto-refresh unless the app reloads or calls `loadData()` again through some action.

## 16. Export Logic

### Current export mechanism

- Export is browser-side only.
- No backend is involved.
- No zip archive is created.
- Preferred path when supported:
  - use `showDirectoryPicker()`
  - create folder `toeic_vocab_export_YYYY-MM-DD`
  - write files inside it
- Fallback path:
  - download files individually with staggered browser downloads

### Current output files actually built in code

| File | Current status | Notes |
|---|---|---|
| `summary.md` | IMPLEMENTED | Markdown summary generated from current state. |
| `sessions.csv` | IMPLEMENTED | Per-session summary rows. |
| `attempts.csv` | IMPLEMENTED | Per-attempt rows. |
| `item_mastery.csv` | IMPLEMENTED | Per-item mastery rows. |
| `error_summary.csv` | IMPLEMENTED / PARTIAL | Count-based error summary. |
| `stage_progress.json` | IMPLEMENTED / PARTIAL | Stage summary array. |
| `raw_events.jsonl` | IMPLEMENTED / PARTIAL | Session/attempt/error/review events. |
| `question_bank_snapshot.json` | IMPLEMENTED | Full question bank snapshot. |
| `toeic_vocab_export_YYYY-MM-DD.json` | IMPLEMENTED | Extra manifest-style wrapper containing export metadata plus embedded data. |

### Export columns / payload summary

`summary.md`:

- user
- export date
- current stage
- current lesson
- completed lessons
- total lessons
- total attempts
- overall accuracy
- average response time
- repeated error rate
- module accuracy
- top error codes
- top weak items
- stage status

`attempts.csv` currently outputs:

- `attempt_id`
- `timestamp`
- `user_id`
- `course_id`
- `stage`
- `lesson_id`
- `step`
- `question_id`
- `question_type`
- `correct_answer`
- `user_answer`
- `is_correct`
- `response_time_seconds`
- `error_code`
- `is_repeated_error`
- `review_priority`
- `mode`

Important limit:

- IndexedDB attempts actually contain more fields (`session_id`, `target_item_id`, `grammar_link_id`, `speed_bucket`, `default_error_code`), but those are not currently exported in `attempts.csv`.

`sessions.csv` currently outputs:

- `session_id`
- `date`
- `lesson_id`
- `lesson_title`
- `planned_minutes`
- `actual_minutes`
- `total_questions`
- `correct_questions`
- `wrong_questions`
- `accuracy`
- `avg_response_time_seconds`
- `top_error_codes`
- `mastery_status`
- `next_action`

`item_mastery.csv` currently outputs:

- `item_id`
- `item_type`
- `base_word`
- `variants`
- `first_seen`
- `last_seen`
- `seen_count`
- `correct_count`
- `wrong_count`
- `avg_response_time_seconds`
- `last_error_code`
- `mastery_score`
- `mastery_level`
- `next_review_date`

`error_summary.csv` currently outputs:

- `error_code`
- `count`
- `repeated_count`

`stage_progress.json` currently outputs for each stage:

- `stage`
- `stage_name`
- `lessons_available`
- `lessons_completed`
- `stage_progress`
- `stage_accuracy`
- `stage_avg_response_time`
- `stage_mastered_items`
- `stage_unstable_items`
- `stage_repeated_errors`
- `stage_seal_status`
- `question_types_seen`

### Has export been practically tested in this round?

- Implementation inspected: Yes.
- Browser export clicked and manually downloaded in this round: No.
- Therefore export should be described as IMPLEMENTED / PARTIAL, not fully field-tested here.

### Can the current export answer these questions?

| Question | Current answer |
|---|---|
| Which lesson is weakest? | Yes, from `sessions.csv` accuracy / wrong counts. |
| Which `question_type` is weakest? | Yes, from `attempts.csv` grouped by `question_type`, and `summary.md` module accuracy. |
| Which item is most often wrong? | Yes, mainly from `item_mastery.csv` wrong counts; more detail possible if `attempts.csv` later exports `target_item_id`. |
| Average response time? | Yes, from `sessions.csv`, `attempts.csv`, and `summary.md`. |
| Top error codes? | Yes, from `error_summary.csv`, `sessions.csv`, and `summary.md`. |
| Repeated error? | Yes, from `attempts.csv` and `error_summary.csv`. |

### Current export limits

- No zip archive.
- Browser folder-save depends on File System Access API support.
- Fallback downloads many separate files.
- `attempts.csv` omits some useful fields already present in IndexedDB.
- `stage_progress.json` counts mastered / unstable items globally from `state.vocabItems`, not by exact stage ownership filtering.
- This round did not perform browser-click smoke testing of export UI.

## 17. Question Bank Manager

### Current capability status

| Capability | Real status | Notes |
|---|---|---|
| View questions | Yes | Filtered list shown, capped to first 120 visible rows in UI. |
| Filter by stage | Yes | `stage` dropdown exists. |
| Filter by lesson | Yes | `lesson_id` dropdown exists. |
| Filter by type | Yes | `type` dropdown exists. |
| Filter by error code | Yes | `default_error_code` dropdown exists. |
| Import JSON | Yes | Accepts array or `{ questions: [...] }`. |
| Export JSON | Yes | Exports currently filtered questions. |
| Validate | Yes | Runs in-app lightweight validation. |
| Show answer distribution | Yes | Displays A/B/C/D counts for current filtered set. |
| Detect duplicate | PARTIAL | Detects exact duplicate text in filtered set; does not replace the full near-duplicate script. |
| Edit question | Yes | JSON editor allows save/delete. |
| Write back to source JSON files | No | Browser writes IndexedDB only. |

### Important storage boundary

- `Save Question JSON` writes to IndexedDB `questions` store.
- `Delete` deletes from IndexedDB `questions` store.
- `Import JSON` bulk-inserts into IndexedDB `questions` store.
- None of those browser operations write changes back to:
  - `data/vocab/questions_v0.json`
  - `data/vocab/questions_v1a.json`
  - `data/vocab/questions_v1b.json`
  - `data/vocab/questions_v1c.json`
  - `data/vocab/questions_v1d.json`
  - `data/vocab/questions_v1e.json`
  - `data/vocab/questions_v1f.json`

This must be stated clearly to avoid false assumptions.

## 18. Validation Scripts

### `scripts/validate-vocab-data.js`

Purpose:

- validate lesson/question integrity for vocab content

Checks:

- required question fields
- options object structure and A/B/C/D presence
- valid `correct_answer`
- duplicate `question_id`
- lesson references existing in curriculum
- duplicate / near-duplicate question text warnings for non-V0
- missing `grammar_link_id` warnings for non-V0
- missing `tags` warnings
- missing `estimated_time_seconds` warnings
- uneven answer distribution warnings by file

How to run:

```powershell
node scripts\validate-vocab-data.js
```

Most recent result in this round:

- Passed
- 70 lessons
- 1968 questions
- 439 warnings
- 0 missing fields
- 0 duplicate question IDs

Warnings blocking?

- No

### `scripts/build-vocab-tracker-data.js`

Purpose:

- generates / rebuilds the vocab seed files under `data/vocab/`

Current role:

- still relevant if the team intentionally wants to regenerate curriculum and question banks from generator logic
- not needed for normal runtime use

Will it overwrite `data/vocab`?

- Yes
- It is a generation script, so it should be treated as a rebuild tool, not a harmless read-only helper

Should it still be used?

- Yes, but only when intentionally rebuilding the seed set
- It should not be run casually on a working content set without diff review

### `scripts/expand-v1-content.js`

Purpose:

- provides expansion metadata / helper logic for V1-B through V1-F content generation

Current role:

- historical content-expansion task is already reflected in the generated data
- the file should still be kept because `build-vocab-tracker-data.js` imports it

Should it remain in the repo?

- Yes
- It is still part of the content-generation path, not dead code yet

## 19. Current Validation Results

### Command run

```powershell
node scripts\validate-vocab-data.js
```

Actual result from this round:

```text
Vocabulary validation summary:
- total vocab lessons: 70
- total vocab questions: 1968
- total V1 lessons: 60
- total V1 questions: 1728
- missing field count: 0
- duplicate question_id count: 0
- duplicate / near-duplicate question_text warnings: 439
- warning count: 439
- answer distribution per file:
  questions_v0.json: A=60 B=60 C=60 D=60
  questions_v1a.json: A=60 B=60 C=60 D=60
  questions_v1b.json: A=48 B=48 C=48 D=48
  questions_v1c.json: A=48 B=48 C=48 D=48
  questions_v1d.json: A=48 B=48 C=48 D=48
  questions_v1e.json: A=48 B=48 C=48 D=48
  questions_v1f.json: A=180 B=180 C=180 D=180

Warnings:
- questions_v1a.json/v1_a_11_q_009: duplicate or near-duplicate question_text with questions_v1a.json/v1_a_11_q_001
- questions_v1a.json/v1_a_11_q_010: duplicate or near-duplicate question_text with questions_v1a.json/v1_a_11_q_002
- questions_v1a.json/v1_a_11_q_011: duplicate or near-duplicate question_text with questions_v1a.json/v1_a_11_q_003
- questions_v1a.json/v1_a_11_q_012: duplicate or near-duplicate question_text with questions_v1a.json/v1_a_11_q_005
- questions_v1a.json/v1_a_11_q_013: duplicate or near-duplicate question_text with questions_v1a.json/v1_a_11_q_006
- ... 399 more warnings

Vocab data validation passed.
```

### Node syntax checks requested by this handoff

Commands run:

```powershell
node --check js\vocab-db.js
node --check js\vocab-scoring.js
node --check js\vocab-tracker.js
node --check sw.js
node --check scripts\validate-vocab-data.js
node --check scripts\build-vocab-tracker-data.js
node --check scripts\expand-v1-content.js
```

Actual result from this round:

```text
js/vocab-db.js OK
js/vocab-scoring.js OK
js/vocab-tracker.js OK
sw.js OK
scripts/validate-vocab-data.js OK
scripts/build-vocab-tracker-data.js OK
scripts/expand-v1-content.js OK
```

## 20. Service Worker and Cache

### Current service worker state

- Cache name: `toeic-vorb-v1`
- Strategy:
  - pre-cache listed static assets on install
  - delete old caches on activate
  - on fetch, return cached response if present, otherwise fetch and cache the successful response

### Cached files

Current pre-cache list includes:

- launcher / tracker / clear pages
- manifest
- base / tracker CSS
- all three vocab JS files
- all current `data/vocab/*.json`
- both icon files

### Is it vocab-only?

- Yes inside this folder.
- The cache list in this repo only includes vocabulary app assets.

### How to clear cache

Preferred method:

- open `clear-sw.html`
- click the clear button

What that page does:

- unregisters all service workers on the current origin
- deletes all caches on the current origin

### Is `clear-sw.html` usable?

- Yes, based on direct code inspection it is a real reset utility.

### Stale cache risk

- Medium real risk.
- Because question JSON files are cached, content edits under `data/vocab/` may not appear immediately if the service worker still serves the old cached version.

### If `data/vocab` changes do not appear

Recommended order:

1. Open `clear-sw.html` and clear service worker + caches.
2. Reload the app.
3. If still stale, change the cache name in `sw.js` in a future update round.
4. If IndexedDB seed version also changed, confirm whether a new seed version should be written.

## 21. Current Known Issues

| Severity | Issue | Real status |
|---|---|---|
| HIGH | V2-V6 not implemented | Only planned stage metadata exists; no lesson/question files found. |
| HIGH | 439 near-duplicate question warnings | Validation passes, but content repetition remains significant in current V1 data. |
| HIGH | Question naturalness not fully audited | No script or test in this repo proves TOEIC naturalness / realism at scale. |
| HIGH | No backend / login / cloud sync | Entire app is local-browser only. |
| MEDIUM | Export is browser-side only and no zip is generated | Folder API may be unavailable; fallback downloads many files individually. |
| MEDIUM | Review queue is partial | Queue records exist, but there is no dedicated review lesson engine. |
| MEDIUM | Lesson unlock / seal logic is partial | Threshold fields exist in data, but runtime uses hardcoded gates and no automatic seal logic. |
| MEDIUM | `js/vocab-tracker.js` is large and mixed-responsibility | Runtime, export, dashboards, settings, and bank tools all live in one file. |
| MEDIUM | IndexedDB migration risk | DB version is still `1`; future schema changes may require careful migration and seed-version coordination. |
| MEDIUM | Question bank edits do not write back to source JSON | Browser edits can drift away from repo data files. |
| MEDIUM | No committed browser regression tests | No Playwright suite, no package.json-based test harness, no automated end-to-end lesson/export check. |
| LOW | README / launcher still show 8787 | Recommended local coexistence port is 8788, so docs are slightly stale. |
| LOW | No AI question generation | Not implemented in this app. |

## 22. What Is Safe To Modify Next

### Safe

- `data/vocab/*`
- `js/vocab-*.js`
- `tracker.html`
- `index.html`
- `clear-sw.html`
- `sw.js`
- `manifest.json`
- `css/base.css`
- `css/tracker.css`
- `docs/*`
- `scripts/validate-vocab-data.js`
- `scripts/build-vocab-tracker-data.js`
- `scripts/expand-v1-content.js`

### Not safe for this scope

- `C:\Users\Keith\toeic-app`
- Grammar / PoS project files
- grammar data
- unrelated system files outside this folder

## 23. Recommended Next Steps

Do not execute these in this round. These are recommendations only.

### Priority recommendation

1. Option A first
2. Option B second
3. Option C third

### Option A: V1 smoke test with real export

Goal:

- run 1 to 2 real V1 lessons in the browser
- complete post-lesson error confirmation
- export data and inspect whether the export is sufficient for analysis

Why this should be first:

- It validates the current runtime, active-session resume, session summary, review queue, and export usefulness using real data instead of static inspection.

### Option B: V1 quality audit

Goal:

- reduce the 439 near-duplicate warnings
- audit question naturalness and business-context realism
- review whether V1-F speed-reflex content is too repetitive or too templated

Why this should be second:

- Content quality is the biggest known weakness after runtime smoke test.
- It is safer to clean V1 before expanding the roadmap.

### Option C: Begin V2 Collocation

Precondition:

- Only after Option A confirms export is analytically useful and Option B confirms V1 content quality is acceptable enough to use as the base pattern.

Why third:

- Starting V2 before proving V1 runtime/export/content quality risks repeating the same structural issues in a larger corpus.

## 24. Questions For ChatGPT

Suggested questions to ask next:

1. Is the current app architecture stable enough to continue into V2 without first splitting `js/vocab-tracker.js`?
2. Is the current export package sufficient for serious learning analysis, or should `attempts.csv` include `target_item_id`, `session_id`, `speed_bucket`, and `grammar_link_id`?
3. Should the team clean the 439 near-duplicate warnings before writing any V2 content?
4. Should review queue logic be strengthened before expanding the curriculum?
5. Should the next engineering task be a small browser regression suite before more content work?
6. Does the current mastery model look usable enough, or does it need fixture-based validation first?
7. Should `mastery_threshold` / `seal_threshold` start driving runtime behavior, or stay as metadata?
8. Is V1-F speed-reflex runtime step assignment acceptable, or should it get a dedicated speed mode?
9. Should question bank edits remain IndexedDB-only, or should there be a safer source-JSON round-trip workflow later?
10. Given the current state, should the next priority be V1 smoke testing, V1 content cleanup, or V2 Collocation authoring?

## 25. Final Status Summary

| Area | Status | Notes |
|---|---|---|
| App separation | COMPLETE | Separate folder, separate data files, separate storage names inside this project. |
| V0 content | IMPLEMENTED | 10 lessons / 240 questions verified. |
| V1 content | IMPLEMENTED | 60 lessons / 1728 questions verified. |
| V2-V6 | PLANNED | Stage metadata exists, but no lesson/question content files exist. |
| Tracking | PARTIAL | Attempts and sessions are implemented; unlock/seal/review behavior is only partly enforced. |
| Export | PARTIAL | Real export builder exists, but no zip and this round did not browser-smoke-test it. |
| Review queue | PARTIAL | Queue records exist, but no dedicated review lesson engine. |
| Question bank | PARTIAL | View/filter/import/export/edit/validate exist, but edits stay in IndexedDB only and validation is lighter than the full script. |
| Validation | IMPLEMENTED | Script validation and syntax checks ran successfully in this round. |
| Tests | NOT IMPLEMENTED | No committed browser regression suite found. |
