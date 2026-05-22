# C-11 V3 Wave 3 Promotion Review — 2026-05-21

Status: approved and live
Scope: `V3-W1-04` → `V3-A-124`, `V3-W1-05` → `V3-A-125`, `V3-W1-06` → `V3-A-126`
Seed: `toeic_vocab_tracker_v3_w1_04_06_wave_3_2026_05_21`
Service worker cache: `toeic-vorb-v18`

## Pre-promotion validation

| Check | Result |
|---|---|
| Combined isolated audit (`tmp/v3-wave3-current-isolated-audit`) | passed |
| Scope | 17 lessons / 384 questions |
| Blocking issues | 0 |
| Duplicate stems | 0 |
| Legacy placeholders cleared | 12 rows on `V3-A-124`/`125`/`126` |

## Promotion decision

- Approved as a three-lesson production wave (文書作業 topic).
- Promotion script: `tmp/promote-v3-wave3.js`
- Seed change record: `docs/seed-changes/2026-05-21-toeic_vocab_tracker_v3_w1_04_06_wave_3_2026_05_21.md`
- Each lesson reuses `v3_a_121_rv_024` for same-stage old-item pressure (69 net-new question rows).

## Post-promotion production truth

| Metric | Value |
|---|---:|
| Runnable lessons | 17 |
| Question-bank rows | 384 |
| V3 core lessons live | 6 (`V3-A-121` … `V3-A-126`) |
| V3 core progress | 6/10 |

## Next process

- Author and validate `V3-W1-07` onward for V3 wave 4 (up to three core lessons).
- Plan `V3-MR-01` mixed review only after more V3 core lessons are live.
