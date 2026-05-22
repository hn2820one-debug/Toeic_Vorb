# Question Bank Build Blueprint

Status: PLANNING BLUEPRINT

Generated on: 2026-05-20

Primary basis:

- `docs/REPO_COURSEWARE_INVENTORY_2026-05-20.md`
- `docs/Future Plan.md`
- `docs/rebuild-wave-release-gate.md`
- `docs/question-creation-spec.md`
- `docs/minimum-usable-content-packs.md`
- `docs/export-analysis-feedback-governance.md`

This blueprint is not a replacement for `docs/Future Plan.md`.

`docs/Future Plan.md` remains the only active execution checklist.

This file is a planning reservoir: it converts the current inventory snapshot into a prioritized future build plan with 100+ actionable tasks that can later be promoted into active blocks.

---

## 1. Planning Premise

The inventory report establishes four important facts:

1. Live production is still early-stage but no longer single-lesson: `7 lessons / 168 questions`.
2. The repo already contains meaningful non-live stock: `100 draft questions` and `487 rebuild questions`.
3. The largest immediate promotion reservoir is `drafts/collocation-rebuild/`.
4. The main bottleneck is promotion quality and release discipline, not raw absence of content.

Therefore the next-generation question-bank strategy should be:

- prioritize promotion of the best existing stock before authoring large new stock
- expand V2 and V3 in controlled waves with strong validation
- keep V4 isolated until V2/V3 learner evidence is strong enough
- treat V5/V6 as later scaffolding work, not near-term content volume targets

---

## 2. Success Criteria

The future build program should aim to reach all of the following:

- live production is no longer dependent on a single lesson
- every promoted wave passes structural validation, duplicate audit, full quality audit, docs validation, and Playwright
- production warning debt is visible and intentionally accepted, not accidental
- V2 and V3 become the stable learning core before V4 activation
- draft / rebuild / production boundaries remain explicit and auditable
- every new wave has human review evidence and export-feedback follow-up

---

## 3. Workstream Map

This blueprint is divided into 12 workstreams:

1. Program Setup and Governance
2. Production Baseline Hardening
3. V2 Wave Expansion
4. V3 Rebuild Conversion
5. V4 Decision Gate and Isolation
6. V5/V6 Scaffolding
7. Content Quality Automation
8. Human Review Operations
9. Item and Metadata Integrity
10. UX and Learning Loop Alignment
11. Release Operations and Seed Governance
12. Documentation, Reporting, and Archive Discipline

Total checklist tasks: `120`

---

## 4. Master Checklist

### Workstream 1 — Program Setup and Governance

- [x] T001 確認未來 90 天的題庫建設主目標是「擴大 production wave」，不是「堆積更多未上線草稿」。
- [x] T002 依 inventory 報告重新確認 production、draft、rebuild、archive 四桶的官方定義。
- [x] T003 將所有後續題庫工作都映射回 `docs/Future Plan.md` 的正式 block 編號。
- [x] T004 決定未來 wave 命名規則，固定 lesson、seed、seed-change record、release note 的命名格式。
- [x] T005 建立每週一次的題庫治理節點，固定檢查 production warnings、rebuild 候選與 docs 同步狀態。
- [x] T006 決定誰負責 authoring、誰負責 human review、誰負責 release validation，避免角色混疊。
- [x] T007 為每次新 wave 建立統一的完成定義：內容、驗證、文檔、測試、seed record 缺一不可。
- [x] T008 定義「可 promotion 候選」與「僅供參考的 artifact」的區分標準。
- [x] T009 為 blueprint 中的所有 task 建立優先順序標記規則，例如 P0 / P1 / P2。
- [x] T010 決定每個月最多允許多少 production waves，避免為追數量犧牲審核品質。

T001-T010 decision: completed through `docs/question-bank-build-governance.md` and mapped to `D-11` in `docs/Future Plan.md`. The 90-day objective is controlled V2/V3 production expansion, the four inventory buckets are fixed as production/draft/rebuild/archive, all future work must map to `Future Plan`, production waves are capped at 2 seed releases per calendar month until production reaches at least 10 runnable lessons and two clean consecutive release gates, and new production waves must preserve role separation, naming discipline, release-gate validation, seed-change records, human review, and export-review follow-up.

### Workstream 2 — Production Baseline Hardening

- [x] T011 重新審視 `V2-A-71` 的 4 條 staircase progression warnings，決定是否接受為長期 warning debt。
- [x] T012 對 `V2-A-71` 補做一次人工學習體驗審查，確認題序、重覆 item 節奏與解說品質。
- [ ] T013 收集 `V2-A-71` 的第一輪真實 learner sessions，觀察是否出現集中錯題或異常耗時。
- [x] T014 檢查 `V2-A-71` 的 review_question 是否真的有額外回想價值，而不是重覆同一 demand rank。
- [ ] T015 如果 learner evidence 顯示 staircase 太平，重寫 `V2-A-71` 的 item 階梯設計。
- [x] T016 為 `V2-A-71` 建立一份 post-release review note，作為 V2 後續 wave 的模板。
- [x] T017 驗證 `V2-A-71` 的 question bank 編輯流程是否仍正確保留 IndexedDB-only 邊界。
- [x] T018 檢查 production hero、roadmap、lesson、question bank UI 在 lesson 數增加後是否仍易讀。
- [x] T019 建立「production baseline smoke checklist」，供每次新 wave promotion 前重跑。
- [x] T020 確認當 production lessons 從 1 課成長到多課時，Today 的 next action 仍符合預期排序。

C-09 note: T011/T012/T014/T016/T017 are complete through `docs/wave-retrospectives/2026-05-20-c09-v2-a-71-post-release-review.md` and `drafts/v0-v3-rebuild/export_review_cycles/2026-05-20-c09-v2-a-71-post-release-review.json`. T013 remains a future evidence task because no current `V2-A-71` learner/export attempts exist in the repo. T015 stays conditional; no live seed rewrite is authorized until learner evidence triggers an isolated draft probe.

T018-T020 note: completed through `docs/production-baseline-smoke-checklist.md` and `tests/ui-regression.spec.ts`. The current UI smoke coverage verifies Today, Roadmap, Lesson, Export, Question Bank, Settings, desktop/mobile advanced-tool alignment, hidden empty-seed banner, and the live 168-row multi-lesson Question Bank state with Load More pagination. The added multi-lesson regression verifies that Today selects the first incomplete lesson after `V2-A-71` is completed. T013 stays open until real learner/export evidence exists; T015 stays conditional and must start as an isolated draft probe if evidence triggers a rewrite.

### Workstream 3 — V2 Wave Expansion

- [x] T021 從 `drafts/v0-v3-rebuild/` 與既有 V2 authoring context 中列出最適合接續 `V2-A-71` 的下一個 lesson 候選。
- [x] T022 優先為 V2 規劃連續 3 個 production-ready core lessons，而不是零散單課 promotion。
- [x] T023 為 V2 下一波 lesson 固定 target item coverage 模板，避免每課只做四個 item 的重覆平面練習。
- [x] T024 為 V2 lesson 設計 item staircase 機制，要求同一 item 在同課中至少出現明顯 demand shift。
- [x] T025 為 V2 lesson 補上 old-item pressure 的波次策略，避免每課都只操練新 item。
- [x] T026 規劃 V2 每個 core lesson 的 question / review row 配比，維持 minimum usable pack 的一致節奏。
- [x] T027 建立 V2 authoring 產線 checklist，涵蓋 stem、options、explanation、tags、error code、semantic sense。
- [x] T028 將 V2 候選 lesson 按 promotion 難度分成 A/B/C 級，先做最容易轉正的 lessons。
- [x] T029 為 V2 建立「每 5 課一個 mixed review checkpoint」的正式規劃草案。
- [x] T030 定義 V2 wave 1、wave 2、wave 3 的目標 lesson 數與預計 question rows。

T021-T030 decision: completed through `docs/v2-production-promotion-pipeline.md`. Wave 2 (`V2-A-72` through `V2-A-74`) and wave 3 (`V2-A-75` through `V2-A-77`) are now live in production. `V2-MR-01` is the first mixed-review checkpoint after `V2-A-75`; it should reuse 20 existing review IDs and add 0 new question-bank rows. The next core expansion target is wave 4 (`V2-A-78` through `V2-A-80`).

T020-T030 optimization note (2026-05-20): active spec/audit permits V2 core lessons to use 20-22 final `question_ids` and requires old-item pressure for non-first V2 core lessons. The pipeline was corrected so each lesson still creates 24 new rows, but may also reuse 0-2 prior same-stage review IDs in `question_ids`. `V2-A-72` uses `v2_a_71_rv_021` as the first reused pressure reference.

- [x] T031 產出 V2 wave 2 的第一課草稿，並明確標為 `production_impact: none`。
- [x] T032 對 V2 wave 2 的第一課跑 isolated structural validation。
- [x] T033 對 V2 wave 2 的第一課跑 isolated full quality audit。
- [x] T034 清理 V2 wave 2 第一課的 blocking issues 至 0。
- [x] T035 對 V2 wave 2 第一課記錄所有 non-blocking warnings 與接受理由。
- [x] T036 為 V2 wave 2 第一課補做人審，至少檢查 scene 真實性與 distractor plausibility。
- [x] T037 將通過審查的 V2 wave 2 第一課升格為 production 候選。
- [x] T038 完成對應 seed version、seed record、docs、UI regression 調整。
- [x] T039 針對 V2 wave 2 promotion 重跑完整 release gate。
- [x] T040 以相同流程完成 V2 wave 2 的第二課 promotion。

T031-T037 note: completed through `drafts/v0-v3-rebuild/v2_a_72_candidate_draft_pack.json` and `docs/wave-retrospectives/2026-05-20-t031-t037-v2-a-72-candidate-review.md`. `V2-A-72` has 24 new draft rows, 21 final `question_ids` including reused old pressure `v2_a_71_rv_021`, 4 `review_question_ids`, 0 blocking issues in isolated full quality audit, 0 duplicate stems, and A/B/C/D answer balance of 6/6/6/6 inside new rows. Non-blocking warnings are limited to staircase progression: 4 inherited from `V2-A-71` plus 4 new `V2-A-72` warnings caused by the current type-rank heuristic. T038-T040 are now complete and the wave 2 lessons are live in production.

T038 note: completed 2026-05-20. Seed promotion plan document created at `docs/wave-retrospectives/2026-05-20-t038-v2-wave2-seed-promotion-plan.md`. Final wave 2 seed version is `toeic_vocab_tracker_v2_a_72_74_wave_2_2026_05_20`. UI regressions and file change list were documented and then executed during the completed promotion.

T039 note: completed 2026-05-20. Wave 2 full release gate passed and promoted `V2-A-72` through `V2-A-74` into live production. Wave 2 seed at that point: `toeic_vocab_tracker_v2_a_72_74_wave_2_2026_05_20`; cache at that point: `toeic-vorb-v12`; formal seed record: `docs/seed-changes/2026-05-20-toeic_vocab_tracker_v2_a_72_74_wave_2_2026_05_20.md`.

T040 note: completed 2026-05-20. `V2-A-73` candidate draft created at `drafts/v0-v3-rebuild/v2_a_73_candidate_draft_pack.json`. Scene: Office Scheduling. Items: appointment, deadline, itinerary, availability. 24 new rows, 21 final question_ids (20 core + reused `v2_a_72_rv_021`), 4 review_question_ids. Combined isolated audit (V2-A-71 + V2-A-72 + V2-A-73 = 72q) passed: 0 blocking issues, 0 article giveaways, 0 old-item pressure issues, 12 staircase warnings (all accepted). Human review: `docs/wave-retrospectives/2026-05-20-t040-v2-a-73-candidate-review.md`.

A74 note: completed 2026-05-20. `V2-A-74` candidate draft created at `drafts/v0-v3-rebuild/v2_a_74_candidate_draft_pack.json`. Scene: Office Documents. Items: memo, invoice, attachment, directory. 24 new rows, 21 final question_ids (20 core + reused `v2_a_73_rv_021`), 4 review_question_ids. Combined isolated audit (V2-A-71 + V2-A-72 + V2-A-73 + V2-A-74 = 96q) passed: 0 blocking issues, 0 article giveaways, 0 old-item pressure issues, 16 staircase warnings (all accepted as candidate-status debt). Human review: `docs/wave-retrospectives/2026-05-20-c10-v2-a-74-candidate-review.md`.

- [x] T041 建立 V2 三課後的答案分布橫向檢查，避免跨課長期偏向某個選項。
- [x] T042 建立 V2 三課後的 error-code 使用一致性審查。
- [x] T043 檢查 V2 三課後的 item 重覆壓力，避免過度依賴少數詞彙。
- [x] T044 規劃 V2 wave 3 要開始引入的 mixed review lesson 定義。
- [x] T045 定義 V2 mixed review 與 core lesson 的 release gate 差異。
- [x] T046 為 V2 mixed review 設計 review reference validity checklist。
- [x] T047 完成第一個 V2 mixed review draft slice。
- [x] T048 驗證 mixed review 是否正確重用 review_question_ids，而不是誤造新庫存。
- [ ] T049 完成 V2 五課後的 export feedback review，觀察 learner 錯因與 fix rate。
- [ ] T050 根據 export feedback 重新排序 V2 下一批 lesson 的 promotion 優先序。

T041-T043 note: completed 2026-05-20. Cross-lesson analysis on V2-A-71 (prod) + V2-A-72 + V2-A-73 (candidates) = 72 rows. Results: answer distribution perfectly balanced (A=B=C=D=18 across all 72 rows, 6/6/6/6 per lesson); error codes 100% consistent (SCENE_VOCAB_GAP=60, VOCAB_WEAK_RECALL=12); all 12 items appear exactly 6 times with zero cross-lesson concentration. Report: `docs/wave-retrospectives/2026-05-20-t041-t043-v2-cross-lesson-analysis.md`.

T044-T046 note: completed 2026-05-20. V2-MR-01 definition, MR vs core release gate differences, and review reference validity checklist documented at `docs/wave-retrospectives/2026-05-20-t044-t046-v2-mixed-review-definition.md`. V2-MR-01 requires all 5 source core lessons (`V2-A-71` through `V2-A-75`); all 5 source lessons are now live after wave 3 promotion.

T047-T048 note: completed 2026-05-20 as structural placeholder and candidate assembly. `drafts/v0-v3-rebuild/v2_mr_01_structural_placeholder.json` created the expected question_ids list (20 total from 5 source lessons x 4 rv each), and `drafts/v0-v3-rebuild/v2_mr_01_candidate_draft_pack.json` now holds the assembled non-production candidate. Isolated mixed-review audit passed with 1 mixed-review lesson, 0 invalid review references, 20 intentional reused review questions, and 0 new question-bank rows. Known dual-use exceptions now include old-item pressure refs through A75 and must remain intentionally classified by audit.

T049 note: DEFERRED - requires real learner export sessions. The lesson-count prerequisite is now satisfied because `V2-A-71` through `V2-A-77` are live; activate after real export evidence exists.

T050 note: Updated priority order after wave 3 promotion and `V2-MR-01` candidate assembly. `V2-A-75` through `V2-A-77` are now live, so production live count is 7/10. Updated priority: (1) run the formal `V2-MR-01` mixed-review promotion gate, (2) activate T049 only after real export evidence exists, (3) draft and validate wave 4 (`V2-A-78` through `V2-A-80`) to reach 10 runnable V2 core lessons. Re-evaluate after T049 export feedback becomes available.

A75 note: completed 2026-05-20 as candidate-only work. `drafts/v0-v3-rebuild/v2_a_75_candidate_draft_pack.json` contains 24 new rows, 22 final `question_ids` (20 core + reused `v2_a_74_rv_021` and `v2_a_73_rv_022`), and 4 `review_question_ids`. Combined isolated audit (V2-A-71 through V2-A-74 production + V2-A-75 draft = 120q) passed: 0 blocking issues, 0 duplicate stems, 0 definition leakage, 0 article giveaways, 0 old-item pressure issues, and 20 staircase warnings total (4 new A75 warnings accepted as candidate-status debt). Human review: `docs/wave-retrospectives/2026-05-20-c13-v2-a-75-candidate-review.md`.

A76 note: completed 2026-05-20 as candidate-only work. `drafts/v0-v3-rebuild/v2_a_76_candidate_draft_pack.json` contains 24 new rows, 22 final `question_ids` (20 core + reused `v2_a_75_rv_022` and `v2_a_74_rv_024`), and 4 `review_question_ids`. Combined isolated audit (V2-A-71 through V2-A-74 production + V2-A-75 draft + V2-A-76 draft = 144q) passed: 0 blocking issues, 0 duplicate stems, 0 definition leakage, 0 article giveaways, 0 old-item pressure issues, and 24 staircase warnings total (4 new A76 warnings accepted as candidate-status debt). Human review: `docs/wave-retrospectives/2026-05-20-c13-v2-a-76-candidate-review.md`.

A77 note: completed 2026-05-20 as candidate-only work. `drafts/v0-v3-rebuild/v2_a_77_candidate_draft_pack.json` contains 24 new rows, 22 final `question_ids` (20 core + reused `v2_a_76_rv_024` and `v2_a_75_rv_022`), and 4 `review_question_ids`. Combined isolated audit (V2-A-71 through V2-A-74 production + V2-A-75 through V2-A-77 drafts = 168q) passed: 0 blocking issues, 0 duplicate stems, 0 definition leakage, 0 article giveaways, 0 old-item pressure issues, and 28 staircase warnings total (4 new A77 warnings accepted as candidate-status debt). Human review: `docs/wave-retrospectives/2026-05-20-c13-v2-a-77-candidate-review.md`.

Wave 3 promotion note: completed 2026-05-20. `V2-A-75` through `V2-A-77` were promoted together into production, bringing the live seed to 7 runnable lessons and 168 question-bank rows. Current seed: `toeic_vocab_tracker_v2_a_75_77_wave_3_2026_05_20`; current cache: `toeic-vorb-v13`; formal seed record: `docs/seed-changes/2026-05-20-toeic_vocab_tracker_v2_a_75_77_wave_3_2026_05_20.md`.

### Workstream 4 — V3 Rebuild Conversion

- [x] T051 盤點 `drafts/collocation-rebuild/` 內哪些 JSON 只是 blueprint，哪些是真正可轉 production 的內容。
- [x] T052 為 `wave1_question_shells.json` 建立可 promotion 子集清單，避免一次面對 384 題造成審查負荷過大。
- [x] T053 從 32 個 unique V3 lessons 中選出最適合當第一個 production V3 wave 的 lesson。
- [x] T054 核對被選中的 V3 lesson 是否已具備對應 items、question shells、review rows 與 lesson blueprint。
- [x] T055 驗證 V3 候選 lesson 的 part6 context 長度、語境完整度與 distractor 邏輯。
- [x] T056 檢查 V3 候選 lesson 是否仍存在舊的 old-item interference 缺口。
- [x] T057 決定 V3 第一個 production wave 是單課上線還是雙課成對上線。
- [x] T058 為 V3 production promotion 建立從 `wave1_question_shells.json` 切出 app-seed 片段的腳本流程。
- [x] T059 為 V3 production promotion 建立 seed file 對應表，明確對應到 `questions_v3*.json`。
- [x] T060 為 V3 第一個 wave 建立 human review 排程，優先審 part6 與 review_question 的教學品質。

T051-T060 note: completed 2026-05-20. Full analysis at `docs/wave-retrospectives/2026-05-20-t051-t060-v3-rebuild-conversion-analysis.md`. Key findings:

T051: Only V3-W1-01 (24 rows) out of 384 total shell rows in `wave1_question_shells.json` is a promotion candidate. All other 15 lessons (V3-W1-02 through V3-W1-16) are shell-only with TODO content. All other files in the directory are planning/reference artifacts only.

T052: Promotion subset confirmed as V3-W1-01 (24 rows). 360 remaining rows are authoring backlog.

T053: V3-W1-01 ("辦公室 搭配詞 1") selected as first V3 production candidate. 7 Level A office phrasal collocations (run out of, set up, drop by, look over, run into, pick up, give out). Phase 10 verification already passed (17/17 checks, 2026-05-18).

T054: V3-W1-01 completeness confirmed with **1 blocking issue**: answer distribution A=5, B=9, C=5, D=5 — B over-represented by 3 questions vs. target 6/6/6/6. Must fix before isolated audit. All other components complete (7 items authored, 4 review rows, app lesson row, phase10 passed).

T055: Part6 context embedded in multi-sentence `question_text` (phase10 `part6_passage_shape` check passed). No separate `passage_context` field needed at this stage. Error codes correct (SCENE_VOCAB_GAP ✓).

T056: First V3 lesson — no old-item pressure needed. No interference gap.

T057: Decision: single-lesson first wave (V3-W1-01 only). Only viable choice given 1 authored lesson. Pair V3-W1-02+03 for wave 2 after V3-W1-02 is authored.

T058: 11-step promotion plan documented. Key tasks: (1) fix answer distribution, (2) normalize question_id to snake_case (`v3_w1_01_q_001` pattern), (3) merge 7 vocab items to `vocab_items.json`, (4) run isolated audit, (5) seed sync.

T059: V3-W1-01 → `data/vocab/questions_v3a.json`. Mapping: ~10 lessons per file for 6 files covering all 60 V3 lessons.

T060: Human review schedule: P0 = all 6 part6 questions + all 4 review_question rows (10 questions, 42%). Review must complete before isolated audit run.

- [x] T061 完成 V3 第一個 production 候選 lesson 的切片資料包。→ `drafts/v0-v3-rebuild/v3_w1_01_candidate_draft_pack.json` 已建立。lesson=V3-W1-01, 24q, 7 vocab items staged.
- [x] T062 對該 V3 候選 lesson 跑 isolated schema validation。→ `tmp/v3-w1-01-isolated-audit/` 建立完成；isolated schema OK。修復：R01-R04 distractor_type `mixed_review_collocation`→`wrong_verb_collocation`。
- [x] T063 對該 V3 候選 lesson 跑 isolated quality audit。→ `node scripts/audit-quality-full.js` PASSED — 0 blocking issues, 28 warnings (全部接受)。
- [x] T064 補齊該 V3 候選 lesson 缺失的 metadata、tags、error codes 與 explanations。→ 所有 24 rows 已有完整 metadata/tags/error codes；explanation 長度警告為 V3 結構債，已接受。
- [x] T065 清理所有 blocking issues 至 0。→ 修復 3 個問題：(1) R01-R04 distractor_type, (2) Q04/Q10/Q14 答案分佈 A=6 B=6 C=6 D=6, (3) Q20 干擾選項改為 pick 同家族。最終 blocking=0。
- [x] T066 記錄所有 warning 並確認是否可接受為第一波 release debt。→ 28 warnings 已全數記錄在 `v3_w1_01_candidate_draft_pack.json` validation 區塊並標記接受：explanation quality (16, V3 concise style), stem length (4, by design), staircase (8, first V3 lesson)。
- [ ] T067 進行 V3 第一波 learner-journey 人審，檢查課內節奏與 part6 負荷。
- [ ] T068 將 V3 第一個候選 wave 升格為 production data 候選。
- [ ] T069 重跑完整 release gate 與 seed sync 測試。
- [ ] T070 產出 V3 第一個 production wave 的 release note 與 follow-up review note。

- [ ] T071 在 V3 第一波上線後建立「每 2 課一個 review checkpoint」的中期策略。
- [ ] T072 為 V3 建立 collocation family coverage matrix，避免高頻 collocation 遺漏。
- [ ] T073 為 V3 建立 part5 / part6 / review_question 三題型的跨課平衡檢查。
- [ ] T074 補做 V3 distractor overuse 橫向審查，避免常見錯誤選項反覆濫用。
- [ ] T075 根據 learner data 調整 V3 第一波後續候選課的排序。
- [ ] T076 確立 V3 第二波最小 promotion 規模，例如 2 lessons / 48 questions。
- [ ] T077 準備 V3 第二波的 seed slicing 工具與校驗腳本。
- [ ] T078 完成 V3 第二波前的人審樣本抽查制度。
- [ ] T079 將 V3 內容逐步納入 roadmap 與 seal-readiness 的長期預期設計。
- [ ] T080 在 V3 進入穩定期前，不啟動任何 V4 production promotion。

### Workstream 5 — V4 Decision Gate and Isolation

- [ ] T081 維持 `drafts/v4/questions_v4a.json` 與 `data/vocab/` 的嚴格隔離，不做偷跑 promotion。
- [ ] T082 盤點 V4 100 題中哪些題型已接近 production schema 完整度，哪些仍只是早期草稿。
- [ ] T083 為 V4 draft 建立一份完整的 quality triage 表，按 formal_phrase / meaning_choice / part5 / review 分類。
- [ ] T084 對 V4 draft 跑一次 isolated audit，確認目前 warning / blocking 全貌。
- [ ] T085 建立 V4 activation prerequisite list，至少包含 V2/V3 learner evidence、UI readiness、review policy 與 docs 同步。
- [ ] T086 明確規定在 V2/V3 未達穩定 lessons 門檻前，V4 不得 promotion。
- [ ] T087 為 V4 draft 建立 item coverage 檢查，避免 phrase stock 與 lesson 設計脫節。
- [ ] T088 補上 V4 如果未來啟用時需要的 lesson blueprint，而不是只有 questions array。
- [ ] T089 規劃 V4 若啟用時的最小 usable pack，而不是一次上線全部 100 題。
- [ ] T090 每次 V4 文件或草稿更新後，都重新確認「仍未啟用」的 boundary 文案未漂移。

### Workstream 6 — V5/V6 Scaffolding

- [ ] T091 盤點 `drafts/v5-rebuild/` 與 `drafts/v6-rebuild/` 目前實際只有 reference pack、尚未有 question stock 的現況。
- [ ] T092 為 V5 建立 lesson architecture 草案，定義 false_friend 與 speed reflex 的配比。
- [ ] T093 為 V6 建立 integrated review / seal test 的 lesson architecture 草案。
- [ ] T094 明確定義 V5/V6 在整體學習路徑中的前置條件，避免過早 authoring。
- [ ] T095 把 V5/V6 的題型需求映射回既有 app schema，找出缺少的支援點。
- [ ] T096 若 schema 不足，先記錄為 future capability，而不是偷改 production 規格。
- [ ] T097 為 V5/V6 建立 item sourcing plan，確認使用既有 items 還是新增 item families。
- [ ] T098 為 V5/V6 建立 distractor policy 草案，避免直接沿用 V2/V3 的錯誤心理模型。
- [ ] T099 在 V2/V3 未達目標 lessons 前，將 V5/V6 限定為規劃工作，不進入大規模 authoring。
- [ ] T100 將 V5/V6 的 long-range plan 摘要回寫到 stage roadmap 文檔中，避免日後失真。

### Workstream 7 — Content Quality Automation

- [ ] T101 把 staircase progression 從 warning 層級進一步細分成可量測的規則。
- [ ] T102 為 repeated-item ladder 設計更多機器可檢查的 heuristics。
- [ ] T103 為跨課 old-item pressure 建立更嚴格的 audit 指標。
- [ ] T104 為 review_question 與 core question 的差異建立自動檢查器。
- [ ] T105 增加對 explanation quality 的更細粒度檢查，例如 target exclusivity 與 distractor rationale。
- [ ] T106 增加對 difficulty staircase 的跨課檢查，而不是只看單課。
- [ ] T107 將 V3 part6 context quality 的主要人工標準再編碼為更多 audit rules。
- [ ] T108 為 answer distribution 建立跨檔案、跨 wave 的長期趨勢檢查。
- [ ] T109 擴充 audit fixture tests，讓所有新 heuristics 都有回歸保護。
- [ ] T110 每次新增 audit 規則後，同步更新 `docs/question-creation-spec.md` 的 audit matrix。

### Workstream 8 — Human Review Operations

- [ ] T111 為 V2 human review 建立固定審查單，檢查 scene plausibility、item irreplacability、解析品質。
- [ ] T112 為 V3 human review 建立固定審查單，特別強化 collocation 與 part6 passage 合理性。
- [ ] T113 為 review_question 建立專屬審查單，確認它不是 core question 的弱拷貝。
- [ ] T114 建立每課至少抽查多少題的人審比例規則。
- [ ] T115 建立 reviewer disagreement 記錄格式，避免爭議只留在聊天記錄中。
- [ ] T116 把 human review 發現的問題分類回寫為 spec、audit 或 authoring 模板改進點。
- [ ] T117 每個 production wave 都輸出一份簡短 review verdict，說明能上線與不能上線的原因。
- [ ] T118 建立高風險題型優先複審機制，例如 V3 part6 與未來 V4 formal phrase。
- [ ] T119 建立 human review SLA，避免內容完成後卡在無限待審狀態。
- [ ] T120 每個月回顧一次人審流程是否真的降低了 production warning debt。

### Workstream 9 — Item and Metadata Integrity

- [ ] T121 建立全 repo item lineage 表，分清 production items、draft-only items、rebuild-only items。
- [ ] T122 清查 rebuild item 與 production item 的重疊關係，避免 promotion 時發生 item ID 衝突。
- [ ] T123 補齊所有候選 promotion lesson 的 grammar_link_id 與 topic metadata 一致性。
- [ ] T124 驗證 V2/V3 候選課的 target_items 是否都能對映到正確 stage item。
- [ ] T125 為 no-stage diagnostic vocab 建立單獨治理說明，避免被誤認成 metadata 錯誤。
- [ ] T126 建立 item deprecation 規則，若某個 item 不再進入 lesson，仍需保留歷史解釋。
- [ ] T127 為未來新增 items 建立最小 metadata 套件，包含中文、例句、stage、tags 與相關說明。
- [ ] T128 在 promotion 前檢查 question tags 是否與 item lineage 一致。
- [ ] T129 為跨課重用 items 建立頻率審查，避免局部 item 被過度打磨而其他 items 閒置。
- [ ] T130 建立 item-level release note 模板，記錄哪些 items 在哪一波首次進入 production。

### Workstream 10 — UX and Learning Loop Alignment

- [ ] T131 當 production lessons 超過 3 課後，重新檢查 Today 的 next action 是否仍合理。
- [ ] T132 當 production lessons 超過 5 課後，重新檢查 Roadmap 過濾器與課程列表可讀性。
- [ ] T133 隨題庫成長調整 question bank 頁面的預設摘要與管理提示文案。
- [ ] T134 建立 lesson growth 後的 UI regression 清單，確保不再只覆蓋 1 課情境。
- [ ] T135 在 V2/V3 課堂增加後，重新評估 seal-readiness 卡片的無資料 / 規劃中文案。
- [ ] T136 將 production wave 成長節奏反映到使用說明書的學習流程建議。
- [ ] T137 建立當題庫從 24 題擴張到 100+ 題後的 export smoke test 重點清單。
- [ ] T138 驗證當 review queue 明顯增長後，Mistakes view 是否仍維持清晰操作路徑。
- [ ] T139 決定何時需要把 question bank 的 load-more 或篩選體驗再升級。
- [ ] T140 在 lesson 數量增加後，重新檢查 Settings 中 lesson status override 是否仍安全。

### Workstream 11 — Release Operations and Seed Governance

- [ ] T141 為每個新 production wave 固定建立 seed change record，不得補票。
- [ ] T142 建立 release checklist 模板，強制列出 validate、audit、duplicates、docs、Playwright、test:all。
- [ ] T143 將 service worker cache bump 納入 production content release checklist。
- [ ] T144 釐清哪些情況需要更新 `tests/ui-regression.spec.ts`，哪些只需 seed helper 同步。
- [ ] T145 針對 production wave promotion 建立標準化命令序列，減少人工遺漏。
- [ ] T146 將 release 結果摘要固定回寫到 `docs/Future Plan.md` 與 `TO_AI.md`。
- [ ] T147 每次 release 後都重跑 `npm run test:all`，不得只跑局部測試就宣告完成。
- [ ] T148 如果 release gate 中出現與舊 seed snapshot 綁死的檢查，立即修正治理工具而不是繞過。
- [ ] T149 每次 release 後都確認 docs/backups 不會被誤當成 current truth。
- [ ] T150 為每個 production wave 建立 rollback rehearsal checklist。

### Workstream 12 — Documentation, Reporting, and Archive Discipline

- [ ] T151 每次 production wave 後更新 `docs/REPO_COURSEWARE_INVENTORY_*.md` 或建立新快照。
- [ ] T152 維持 `TO_AI.md`、`README.md`、`docs/使用說明書.md`、`docs/KNOWN_ISSUES.md` 的 current truth 一致。
- [ ] T153 將每次大規模 rebuild 結果用 inventory 口徑重新描述，避免只報 raw artifact rows。
- [ ] T154 對外或對內匯報時，固定區分 live production、draft、rebuild、archive，避免數字混淆。
- [ ] T155 若某份 rebuild / draft 文檔已失效，及時封存到 `docs/backups/`，不要留在活躍區混淆判讀。
- [ ] T156 建立 monthly inventory review，追蹤 live share 是否上升、warning debt 是否下降。
- [ ] T157 為每次大型 promotion 建立簡短的 wave retrospective，記錄實際卡點是內容、人審、還是 tooling。
- [ ] T158 如果 V4/V5/V6 規劃長期未動，定期更新文檔標記避免被誤認為即將上線。
- [ ] T159 把高價值統計沉澱成 reusable 報表模板，避免每次重新手算。
- [ ] T160 當 production lessons 達到 10 課以上時，重新設計 inventory 報表的摘要層級，避免單純表格失去可讀性。

---

## 5. Suggested Execution Order

The most pragmatic execution order based on the current inventory is:

1. Harden the current single-wave production baseline.
2. Expand V2 with several controlled production waves.
3. Convert the highest-value subset of `drafts/collocation-rebuild/` into the first V3 production waves.
4. Accumulate real learner evidence and export-feedback cycles.
5. Only then revisit V4 activation.
6. Keep V5/V6 at scaffold level until V2/V3 become stable.

In other words: do not chase the largest raw stock first; chase the highest-confidence promotion path first.

---

## 6. Recommended First Active Blocks

If this blueprint is turned into active `Future Plan` blocks, the best next candidates are:

1. `C-09` — 強化 `V2-A-71` 的 post-release review 與 staircase debt 決策
2. `C-10` — 建立 V2 下一波 2-3 課的 production promotion pipeline
3. `C-11` — 從 `drafts/collocation-rebuild/` 切出第一個 V3 production 候選 wave
4. `D-10` — 建立 inventory refresh / monthly reporting 流程

---

## 7. Bottom Line

This repo already contains enough material to support a long build program.

The right strategy is not unlimited new drafting.

The right strategy is disciplined conversion:

- stabilize live production
- promote the best existing V2/V3 stock
- strengthen automation and human review together
- keep V4 isolated until the app earns the right to activate it
