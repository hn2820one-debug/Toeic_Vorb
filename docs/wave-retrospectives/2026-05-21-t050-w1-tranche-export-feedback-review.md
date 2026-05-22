# T050 W1 Tranche Export Feedback Review

Date: 2026-05-21
Seed: `toeic_vocab_tracker_v2_mr_02_mixed_review_2026_05_21`
Scope: Post-milestone export feedback after W1 tranche (24 lessons / 480 questions)

## Production scope reviewed

| Stage | Core | Mixed review | Question rows |
|-------|-----:|-------------:|--------------:|
| V2 | `V2-A-71`–`80` (10/10) | `V2-MR-01`, `V2-MR-02` | 240 in `questions_v2a.json` |
| V3 | `V3-A-121`–`130` (10/10) | `V3-MR-01`, `V3-MR-02` | 240 in `questions_v3a.json` |

## Export evidence

| Source | Result |
|--------|--------|
| `Log Download/toeic_vocab_export_2026-05-14_toeic_vocab_export_2026-05-14.json` | 24 attempts, 1 session, **all `V1-B-21`** |
| V2 attempts | **0** |
| V3 attempts | **0** |

## Decision

**Status:** `completed_with_insufficient_learner_data`

- Do **not** rewrite live V2 or V3 seed from export feedback.
- Keep 143 non-blocking audit warnings (stem length + staircase) as debt until real attempts exist.
- **Next content process:** `V3-W1-11` → `V3-B-131` (業務協調 搭配詞 1), unless a fresh learner export arrives first.

Review cycle: `drafts/v0-v3-rebuild/export_review_cycles/2026-05-21-t050-w1-tranche-live-feedback-review.json`
