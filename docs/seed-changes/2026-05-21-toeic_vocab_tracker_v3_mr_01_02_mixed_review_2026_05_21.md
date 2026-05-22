# Seed Change Record - toeic_vocab_tracker_v3_mr_01_02_mixed_review_2026_05_21

Record status: approved
Change date: 2026-05-21
Owner: Codex
Scope: Program B curriculum-only promotion for `V3-MR-01` and `V3-MR-02`
Production seed changed: yes
Source seed version: toeic_vocab_tracker_v3_w1_08_10_wave_5_2026_05_21
New seed version: toeic_vocab_tracker_v3_mr_01_02_mixed_review_2026_05_21
Reason: Add the first two V3 mixed-review checkpoints after the W1 core tranche reached 10/10, without adding new question-bank rows.
Related plan item: C-11
Related ticket / wave: V3-MR-01 / V3-MR-02 mixed-review promotion

---

## 1. Change Summary

| Change item | Reason | Impacted files | Notes |
|---|---|---|---|
| Add `V3-MR-01` lesson row | First five-lesson V3 mixed-review checkpoint | `data/vocab/curriculum.json` | Reuses 20 review IDs from `V3-A-121`–`V3-A-125` |
| Add `V3-MR-02` lesson row | Second five-lesson V3 mixed-review checkpoint | `data/vocab/curriculum.json` | Reuses 20 review IDs from `V3-A-126`–`V3-A-130` |
| Keep question-bank rows unchanged | Mixed review policy | none | Production remains 480 question rows |
| Sync seed version and cache | Force clean reseed | `js/vocab-db.js`, `tests/helpers/seed-idb.ts`, `tests/seed-sync.spec.ts`, `sw.js` | `toeic-vorb-v21` |

---

## 2. Validation

| Command | Result |
|---|---|
| `node scripts/validate-vocab-data.js` | passed — 23 lessons / 480 questions |
| `node scripts/audit-quality-full.js` | passed — 0 blocking, 3 mixed-review lessons |
| `node scripts/audit-duplicates.js` | passed — 480 unique stems |
| `node scripts/check-doc-consistency.js` | passed |
| `npm run test:all` | passed — 28/28 Playwright |

---

## 3. Rollback

Rollback removes `V3-MR-01` and `V3-MR-02` lesson rows only; restore seed `toeic_vocab_tracker_v3_w1_08_10_wave_5_2026_05_21` and cache `toeic-vorb-v20`.
