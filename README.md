# TOEIC Vocabulary Tracker

**Project Name:** TOEIC Vocabulary Tracker  
**Folder:** `C:\Users\Keith\Toeic\toeic-app-Vorb`  
**Separation Date:** 2026-05-14  

This project is **completely separate** from the Grammar / PoS App (located at `C:\Users\Keith\toeic-app`).  
Both folders are independent. They do not share JS, CSS, data, or storage keys.

---

## Purpose

單字 / Word Family / Collocation / TOEIC vocabulary tracking app.

- TOEIC vocabulary curriculum (V0 Diagnostic + V1 Word Family + V2 Scene Vocabulary + V3 Collocation)
- Word Family (4 forms per word: noun / adjective / adverb / negative)
- Collocation practice
- TOEIC scene vocabulary
- Formal phrase
- False friends + speed drill
- Error code tracking
- Review queue
- Review Mode from due / high-priority / repeated-error queue items
- Item mastery scoring
- Export for ChatGPT analysis

---

## How to Run

```powershell
cd C:\Users\Keith\Toeic\toeic-app-Vorb
python -m http.server 8787 --bind 127.0.0.1
```

Then open:

```
http://127.0.0.1:8787/
```

Or go directly to Vocabulary Tracker:

```
http://127.0.0.1:8787/tracker.html
```

---

## Entry Points

| File | Role |
|------|------|
| `index.html` | App launcher, links to tracker.html |
| `tracker.html` | Main Vocabulary Tracker app |
| `clear-sw.html` | Clear service worker cache |

---

## Data Location

```
data/vocab/curriculum.json      ← lesson definitions (180 lessons)
data/vocab/vocab_items.json     ← vocabulary item metadata
data/vocab/questions_v0.json    ← V0 Diagnostic questions
data/vocab/questions_v1a.json   ← V1-A Word Family questions
data/vocab/questions_v1b.json   ← V1-B Word Family questions
data/vocab/questions_v1c.json   ← V1-C Word Family questions
data/vocab/questions_v1d.json   ← V1-D Word Family questions
data/vocab/questions_v1e.json   ← V1-E Word Family questions
data/vocab/questions_v1f.json   ← V1-F Word Family questions
data/vocab/questions_v2a.json   ← V2-A Office / Administration scene vocabulary
data/vocab/questions_v2b.json   ← V2-B Logistics / Travel scene vocabulary
data/vocab/questions_v2c.json   ← V2-C HR / Workplace scene vocabulary
data/vocab/questions_v2d.json   ← V2-D Finance / Sales scene vocabulary
data/vocab/questions_v2e.json   ← V2-E Service / Public Notice scene vocabulary
data/vocab/questions_v3a.json   ← V3-A Office / Administration collocations
data/vocab/questions_v3b.json   ← V3-B Logistics / Operations collocations
data/vocab/questions_v3c.json   ← V3-C HR / Meetings collocations
data/vocab/questions_v3d.json   ← V3-D Finance / Compliance collocations
data/vocab/questions_v3e.json   ← V3-E Sales / Customer Service collocations
data/vocab/questions_v3f.json   ← V3-F Mixed Part 6 context collocations
```

---

## Storage

| Storage | Key / DB Name |
|---------|--------------|
| IndexedDB | `toeic_vocab_tracker_db` |
| localStorage | `toeic_vocab_tracker_preferences` |
| localStorage | `toeic_vocab_active_session` |

These storage keys are **independent** from the Grammar / PoS App.

---

## Current Content

| Stage | Lessons | Questions | Status |
|-------|---------|-----------|--------|
| V0 Diagnostic | 10 | 240 | IMPLEMENTED |
| V1-A Word Family | 10 | 240 | IMPLEMENTED |
| V1-B Word Family | 8 | 192 | IMPLEMENTED |
| V1-C Word Family | 8 | 192 | IMPLEMENTED |
| V1-D Word Family | 8 | 192 | IMPLEMENTED |
| V1-E Word Family | 8 | 192 | IMPLEMENTED |
| V1-F Speed Reflex | 18 | 720 | IMPLEMENTED |
| V2 TOEIC Scene Vocabulary | 50 | 1,200 | IMPLEMENTED |
| V3 Collocation | 60 | 1,440 | IMPLEMENTED |
| **Total** | **180** | **4,608** | |
| V4–V6 | — | — | PLANNED |

---

## Current Implemented App Features

- Lesson runtime records attempts immediately.
- Review queue is created from wrong answers and confirmed error codes.
- Review Mode can run due / high-priority / repeated-error queue items without starting a normal lesson.
- Review attempts are saved with `mode: "review_queue"` and update item mastery.
- Review queue outcomes are marked as `fixed`, `still_weak`, or `repeated_error`.
- Export includes review effectiveness by item, error code, and question type.

---

## Curriculum Structure

- V0 — Diagnosis (assess baseline, estimate TOEIC score range)
- V1 — Word Family A–F (high-frequency TOEIC vocabulary, 4 forms per word)
- V2 — TOEIC Scene Vocabulary (office, logistics, HR, finance, service/public notice)
- V3 — Collocation (verb-noun collocations, mostly Part 6 context choice)
- V4 — Formal Phrase *(planned)*
- V5 — False Friends + Speed *(planned)*
- V6 — Review + Final Test *(planned)*

---

## Scripts

```powershell
# Validate vocabulary data
node scripts\validate-vocab-data.js

# Generate learning-quality warnings and docs/V2_V3_QUALITY_AUDIT.md
node scripts\audit-vocab-quality.js

# Regenerate full current seed data (V0 + V1 + V2 + V3)
node scripts\build-vocab-tracker-data.js

# Expand / refresh V2 + V3 seed content without touching Grammar / PoS App.
# Run validation after using it.
node scripts\expand-v2-v3-content.js

# Check JS syntax
node --check js\vocab-db.js
node --check js\vocab-scoring.js
node --check js\vocab-tracker.js
```

---

## Export Purpose

Export learning records for ChatGPT analysis.

Target export files:

- `summary.md`
- `sessions.csv`
- `attempts.csv`
- `item_mastery.csv`
- `error_summary.csv`
- `review_effectiveness.csv`
- `stage_progress.json`
- `question_bank_snapshot.json`
- `raw_events.jsonl`

Export is generated in the browser (client-side only, no backend).

---

## Current Known Issues

1. V4–V6 are not implemented yet.
2. V2/V3 are implemented as structured seed content and still need human pedagogical review before long-term use.
3. Review Mode is implemented, but long-term spaced-repetition scheduling is still simple.
4. Export is browser-side only; no zip archive is generated automatically.
5. Folder export depends on browser's File System Access API support; otherwise files download individually.
6. No backend, no login, no cloud sync.
7. No AI question generation feature exists in the app.

---

## This Project Is Separate From Grammar / PoS App

| | Grammar / PoS App | Vocabulary Tracker |
|-|-------------------|-------------------|
| Folder | `C:\Users\Keith\toeic-app` | `C:\Users\Keith\Toeic\toeic-app-Vorb` |
| Entry | `grammar-index.html` | `index.html` / `tracker.html` |
| Data | `data/index.json`, `data/pos-booster/*`, `data/weakness-hunter/*` | `data/vocab/*` |
| IndexedDB | `toeic_learning_db` | `toeic_vocab_tracker_db` |
| localStorage | `toeic_progress` | `toeic_vocab_tracker_preferences`, `toeic_vocab_active_session` |
| Service Worker | `toeic-app-v*` cache | `toeic-vorb-v*` cache |

---

## Rollback Method

If anything breaks, the original files still exist in `C:\Users\Keith\toeic-app`.  
No files were deleted from the original folder during this separation.  
Vocabulary data remains in `C:\Users\Keith\toeic-app\data\vocab\` as a backup reference.
