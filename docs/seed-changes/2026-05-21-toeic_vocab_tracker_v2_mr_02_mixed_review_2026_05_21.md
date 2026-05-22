# Seed Change Record - toeic_vocab_tracker_v2_mr_02_mixed_review_2026_05_21

Record status: approved
Change date: 2026-05-21
Owner: Codex
Scope: Program B curriculum-only promotion for `V2-MR-02`
Production seed changed: yes
Source seed version: toeic_vocab_tracker_v3_mr_01_02_mixed_review_2026_05_21
New seed version: toeic_vocab_tracker_v2_mr_02_mixed_review_2026_05_21
Reason: Add the second V2 mixed-review checkpoint after V2 core reached 10/10, without adding new question-bank rows.
Related plan item: C-13
Related ticket / wave: V2-MR-02 mixed-review promotion

---

## 1. Change Summary

| Change item | Reason | Impacted files | Notes |
|---|---|---|---|
| Add `V2-MR-02` lesson row | Second five-lesson V2 mixed-review checkpoint | `data/vocab/curriculum.json` | Reuses 20 review IDs from `V2-A-76`–`V2-A-80` |
| Keep question-bank rows unchanged | Mixed review policy | none | Production remains 480 question rows |
| Sync seed version and cache | Force clean reseed | `js/vocab-db.js`, `tests/helpers/seed-idb.ts`, `tests/seed-sync.spec.ts`, `sw.js` | `toeic-vorb-v22` |

---

## 2. Validation

| Command | Result |
|---|---|
| `node scripts/validate-vocab-data.js` | passed — 24 lessons / 480 questions |
| `node scripts/audit-quality-full.js` | passed — 0 blocking, 4 mixed-review lessons |
| `node scripts/audit-duplicates.js` | passed — 480 unique stems |
| `node scripts/check-doc-consistency.js` | passed |
| `npm run test:all` | passed — 28/28 Playwright |

---

## 3. Rollback

Rollback removes `V2-MR-02` only; restore seed `toeic_vocab_tracker_v3_mr_01_02_mixed_review_2026_05_21` and cache `toeic-vorb-v21`.
