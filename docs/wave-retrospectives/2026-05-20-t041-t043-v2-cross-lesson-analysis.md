# V2 Three-Lesson Cross-Lesson Quality Analysis
**Tasks:** T041, T042, T043  
**Date:** 2026-05-20  
**Scope:** V2-A-71 (production) + V2-A-72 (candidate) + V2-A-73 (candidate) = 72 question rows

---

## T041 — Answer Distribution (Cross-Lesson Bias Check)

### Per-Lesson Distribution

| Lesson | n | A | B | C | D | Balanced? |
|--------|---|---|---|---|---|-----------|
| V2-A-71 | 24 | 6 | 6 | 6 | 6 | ✅ |
| V2-A-72 | 24 | 6 | 6 | 6 | 6 | ✅ |
| V2-A-73 | 24 | 6 | 6 | 6 | 6 | ✅ |
| **Combined** | **72** | **18** | **18** | **18** | **18** | **✅** |

**Result:** No long-term directional bias in any lesson or across the first three V2 lessons. Each answer slot appears exactly 25% of the time.

**Action required:** None.

---

## T042 — Error Code Consistency

| Error Code | Count | Expected |
|-----------|-------|----------|
| SCENE_VOCAB_GAP | 60 | 20 core × 3 lessons = 60 ✓ |
| VOCAB_WEAK_RECALL | 12 | 4 review × 3 lessons = 12 ✓ |
| Any other codes | 0 | — |

**Result:** Error code assignment is fully consistent across all three V2 lessons. Core `scene_vocabulary` questions correctly use `SCENE_VOCAB_GAP`; all `review_question` rows correctly use `VOCAB_WEAK_RECALL`. No stray error codes found.

**Action required:** None. V2-A-74 should follow the same pattern.

---

## T043 — Vocabulary Item Appearance (Over-dependence Check)

### Per-Item Frequency (all 72 rows)

| Item | Count | Breakdown |
|------|-------|-----------|
| item_v2_v2_a_71_extension | 6 | 5 core + 1 review |
| item_v2_v2_a_71_photocopier | 6 | 5 core + 1 review |
| item_v2_v2_a_71_stationery | 6 | 5 core + 1 review |
| item_v2_v2_a_71_workstation | 6 | 5 core + 1 review |
| item_v2_v2_a_72_agenda | 6 | 5 core + 1 review |
| item_v2_v2_a_72_minutes | 6 | 5 core + 1 review |
| item_v2_v2_a_72_attendee | 6 | 5 core + 1 review |
| item_v2_v2_a_72_venue | 6 | 5 core + 1 review |
| item_v2_v2_a_73_appointment | 6 | 5 core + 1 review |
| item_v2_v2_a_73_deadline | 6 | 5 core + 1 review |
| item_v2_v2_a_73_itinerary | 6 | 5 core + 1 review |
| item_v2_v2_a_73_availability | 6 | 5 core + 1 review |

**Result:** Perfectly even distribution. Each item appears exactly 6 times (5 core + 1 review), scoped within its own lesson. No item appears across multiple lessons as a target item. No over-dependence on any single vocabulary item.

**Note on old-item pressure references:** The cross-lesson pressure referencing system (V2-A-72 reuses `v2_a_71_rv_021`; V2-A-73 reuses `v2_a_72_rv_021`) creates additional exposures to prior lesson items, but these rows are counted within the *referencing* lesson for accounting purposes and do not inflate the target-item frequency shown above. This is by design: old-item pressure appears at most once per subsequent lesson.

**Action required:** None. V2-A-74 should introduce 4 new items with the same 6-count pattern.

---

## Overall Assessment

All three cross-lesson quality checks pass with no issues. The first three V2 production lessons demonstrate a healthy, unbiased, and consistent question bank pattern. This analysis serves as a quality baseline for V2-A-74 and the wave 2 release gate.
