# Seed Change Record - toeic_vocab_tracker_v3_w1_07_wave_4_2026_05_21

Record status: approved
Change date: 2026-05-21
Owner: Codex
Scope: Program B fourth V3 production promotion for `V3-W1-07` → `V3-A-127`
Production seed changed: yes
Source seed version: toeic_vocab_tracker_v3_w1_04_06_wave_3_2026_05_21
New seed version: toeic_vocab_tracker_v3_w1_07_wave_4_2026_05_21
Reason: Promote the validated advanced paperwork collocation lesson (6 target items) into the live production seed.
Related plan item: C-11
Related ticket / wave: V3 wave 4 / `V3-A-127`

---

## 1. Change Summary

| Change item | Reason | Impacted files | Notes |
|---|---|---|---|
| Add `V3-A-127` lesson row | Fourth live V3 wave (single lesson) | `data/vocab/curriculum.json` | 18 runnable lessons |
| Add 24 V3 question rows | Make `V3-A-127` runnable | `data/vocab/questions_v3a.json` | 168 rows in `questions_v3a.json` |
| Add 6 V3 vocab items | Support six collocation targets | `data/vocab/vocab_items.json` | Cleared 4 legacy placeholders on `V3-A-127` |
| Sync seed version and cache | Force clean reseed | `js/vocab-db.js`, `tests/helpers/seed-idb.ts`, `tests/seed-sync.spec.ts`, `sw.js` | `toeic-vorb-v19` |
| Post-promotion stem fix | Remove duplicate stem vs `v3_a_126_q_014` | `data/vocab/questions_v3a.json` | Rewrote `v3_a_127_q_012` before final audit |

---

## 2. Validation

| Command | Result |
|---|---|
| `node scripts/validate-vocab-data.js` | passed — 18 lessons / 408 questions |
| `node scripts/audit-quality-full.js` | passed — 0 blocking |
| `node scripts/audit-duplicates.js` | passed — 408 unique stems |
| `node scripts/check-doc-consistency.js` | passed |
| `npm run test:all` | passed — 28/28 Playwright |

---

## 3. Rollback

Rollback removes `V3-A-127`, its 24 question rows, and six vocab items; restore legacy placeholder links only with a full vocab snapshot rollback.
