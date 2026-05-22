# Seed Change Record - toeic_vocab_tracker_v3_w1_13_wave_8_2026_05_21

Record status: approved
Change date: 2026-05-21
Owner: Codex
Scope: Program B eighth V3 production promotion for `V3-W1-13` → `V3-A-133` (業務協調 搭配詞 3)
Production seed changed: yes
Source seed version: toeic_vocab_tracker_v3_w1_12_wave_7_2026_05_21
New seed version: toeic_vocab_tracker_v3_w1_13_wave_8_2026_05_21
Reason: Continue the live V3 W1 tranche with the third business-coordination collocation lesson (6 targets).
Related plan item: C-11
Related ticket / wave: V3 wave 8 / `V3-A-133`

---

## 1. Change Summary

| Change item | Reason | Impacted files | Notes |
|---|---|---|---|
| Add `V3-A-133` lesson row | Eighth live V3 wave (1 lesson) | `data/vocab/curriculum.json` | 27 runnable lessons |
| Add 23 V3 question rows | Make lesson runnable (Q10 reuses prior review) | `data/vocab/questions_v3a.json` | 310 rows in `questions_v3a.json` |
| Add 6 V3 vocab items | Support six collocation targets | `data/vocab/vocab_items.json` | Cleared 4 legacy `V3-B-133` placeholders |
| Reuse `v3_a_132_rv_024` | Same-stage old-item pressure | `data/vocab/curriculum.json` | 0 duplicate new review rows |
| Sync seed version and cache | Force clean reseed | `js/vocab-db.js`, `tests/helpers/seed-idb.ts`, `tests/seed-sync.spec.ts`, `sw.js` | `toeic-vorb-v25` |

---

## 2. Validation

| Command | Result |
|---|---|
| `node scripts/validate-vocab-data.js` | passed — 27 lessons / 550 questions |
| `node scripts/audit-quality-full.js` | passed — 0 blocking |
| `node scripts/audit-duplicates.js` | passed — 550 unique stems |
| `node scripts/check-doc-consistency.js` | passed after doc sync |
| `npm run test:all` | passed |

---

## 3. Rollback

Rollback removes `V3-A-133`, its 23 question rows, and six vocab items; restore prior seed version `toeic_vocab_tracker_v3_w1_12_wave_7_2026_05_21` and service worker cache `toeic-vorb-v24`.
