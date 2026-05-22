# C-11 V3 Wave 2 Promotion Review — 2026-05-21

Status: approved for production promotion
Scope: `V3-W1-02` → `V3-A-122`, `V3-W1-03` → `V3-A-123`
Seed: `toeic_vocab_tracker_v3_w1_02_03_wave_2_2026_05_21`
Service worker cache: `toeic-vorb-v17`

## Candidate validation

| Candidate | Draft pack | Isolated audit | Blocking issues | Notes |
|---|---|---|---|---|
| `V3-W1-02` | `drafts/v0-v3-rebuild/v3_w1_02_candidate_draft_pack.json` | `tmp/v3-w1-02-current-isolated-audit` (single-draft) | 0 | Reuses `v3_a_121_rv_024` for old-item pressure |
| `V3-W1-03` | `drafts/v0-v3-rebuild/v3_w1_03_candidate_draft_pack.json` | `tmp/v3-wave2-current-isolated-audit` (combined) | 0 | Reuses `v3_a_121_rv_024` for old-item pressure |
| Combined wave 2 | both drafts + production baseline | `tmp/v3-wave2-current-isolated-audit` | 0 | 14 lessons / 312 questions; 0 duplicate stems |

## Promotion decision

- Approved as a paired two-lesson production wave within the monthly governance cap (wave 1 was one lesson; wave 2 adds two).
- Cleared eight legacy placeholder vocab rows still linked to `V3-A-122` / `V3-A-123` before inserting the fourteen new production vocab items.
- Promotion script: `tmp/promote-v3-wave2.js`
- Seed change record: `docs/seed-changes/2026-05-21-toeic_vocab_tracker_v3_w1_02_03_wave_2_2026_05_21.md`

## Post-promotion production truth

| Metric | Value |
|---|---:|
| Runnable lessons | 14 |
| Question-bank rows | 312 |
| V3 core lessons live | 3 (`V3-A-121` … `V3-A-123`) |
| V3 core progress | 3/10 |

## Accepted non-blocking debt

- Staircase progression warnings remain accepted short-term debt, same policy as V2 and V3 wave 1.
- No live V3 rewrite is authorized without real learner/export evidence.

## Next process

- Author and validate `V3-W1-04` onward for V3 wave 3 (up to three core lessons per wave).
- Consider `V3-MR-01` mixed-review definition only after more V3 core lessons are live.
