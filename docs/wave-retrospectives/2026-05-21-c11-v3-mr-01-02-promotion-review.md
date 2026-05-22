# C-11 V3-MR-01 / V3-MR-02 Promotion Review

Date: 2026-05-21
Seed: `toeic_vocab_tracker_v3_mr_01_02_mixed_review_2026_05_21`
Service worker cache: `toeic-vorb-v21`

## Scope

| Lesson | Source core lessons | New question rows |
|---|---|---:|
| `V3-MR-01` | `V3-A-121`–`V3-A-125` | 0 |
| `V3-MR-02` | `V3-A-126`–`V3-A-130` | 0 |

## Gate Evidence

| Check | Result |
|---|---|
| Reference validity (40 review IDs) | 0 missing / 0 wrong type |
| Isolated audit (`tmp/v3-mr-current-isolated-audit`) | 23 lessons / 480 questions, 0 blocking |
| Production audit | 0 blocking, 3 mixed-review lessons, 60 intentional reused refs |
| Duplicate stems | 0 |

## Production Impact

| Metric | Before | After |
|---|---:|---:|
| Runnable lessons | 21 | 23 |
| Question-bank rows | 480 | 480 |
| V3 runnable lessons | 10 | 12 |
| V3 core progress (W1 tranche) | 10/10 | 10/10 |

## Notes

- `V3-MR-02` reused review rows skew D-heavy (20/20 correct_answer = D); accepted under mixed-review gate (no new authored rows).
- Next process: additional V3 core waves beyond W1-10, or export-feedback review before any live rewrite.
