# C-13 V2-MR-02 Promotion Review

Date: 2026-05-21
Seed: `toeic_vocab_tracker_v2_mr_02_mixed_review_2026_05_21`
Service worker cache: `toeic-vorb-v22`

## Scope

`V2-MR-02` reuses 20 existing `review_question` rows from `V2-A-76` through `V2-A-80` (0 new question-bank rows).

## Gate Evidence

| Check | Result |
|---|---|
| Reference validity | 20/20 exist, all `review_question`, A/B/C/D = 5/5/5/5 |
| Isolated audit | 24 lessons / 480 questions, 0 blocking |
| Production audit | 4 mixed-review lessons, 80 intentional reused refs, 0 invalid |
| Duplicate stems | 0 |

## Production Impact

| Metric | Before | After |
|---|---:|---:|
| Runnable lessons | 23 | 24 |
| Question-bank rows | 480 | 480 |
| V2 runnable lessons | 11 | 12 |
| V2 core (C-13 tranche) | 10/10 | 10/10 |

## Decision

Approved. V2 W1 tranche now has both mixed-review checkpoints (`V2-MR-01`, `V2-MR-02`) matching V3.
