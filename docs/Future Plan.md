# Future Plan

更新日期：2026-05-23
專案：TOEIC Vocabulary Tracker (Program B)
範圍：整體程式 + 教學內容 + 使用體驗 + 文檔記錄

唯一有效計劃文件：`docs/Future Plan.md`
舊計劃封存位置：`docs/backups/plans/2026-05-19/`
清理原則：舊的 phase / rebuild / duplicate cleanup / Program A planning 文件已封存；臨時機器計劃檔已刪除；之後所有程式更新只以本文件配合 `TO_AI.md` 判斷方向。

## 1) 使用規則

本文件改為唯一執行 checklist，之後所有更新都應按以下規則進行：

- [ ] 每次開始新工作前，先確認該項目是否已在本文件建立 block。
- [ ] 每個 block 只有在所有 checkpoint 完成後，才可以整項打勾。
- [ ] 如果需求改變，先更新本文件，再開始改程式或改資料。
- [ ] 如果進度被卡住，在對應 block 下方補一行 `Blocked on:` 說明原因。
- [ ] 如果更新涉及現況真相，完成後同步檢查 `TO_AI.md` 是否需要更新。
- [ ] 如果只想照順序往下做，先看第 2 節的主執行順序；第 3-8 節只保留 block 細節、完成紀錄與參考說明，不代表先後順序。

### Current Progress Snapshot

- Last updated by: Codex
- Last updated on: 2026-05-23
- Current focus: `PAGES-01` — GitHub Pages + mobile baseline remains the only mainline gate. Repo-side Pages/mobile hardening is effectively at 58/60 phase checkpoints complete; the remaining mainline blockers are public GitHub Pages redeploy drift plus `PAGES-07-06` and `PAGES-10-06` real-device acceptance. `XPLAT-01` is complete, and `SYNC-01` repo-side Phases 1-7 are verified; neither replaces `PAGES-01`. See `docs/pages-mobile-experience-plan.md`, `docs/google-drive-record-portability-plan.md`, and `docs/google-drive-cloud-sync-plan.md`.
- Current stage: stable local-first production baseline, not the next content-promotion stage. Current repo truth is 39 runnable lessons / 780 question-bank rows / 632 vocab items, `seed_version` `toeic_vocab_tracker_v3_w2_07_wave_18_2026_05_22`, service worker cache `toeic-vorb-v46`, and `npm run test:all` is green.
- Newly completed: `V3-W2-07` → `V3-A-143` (39 lessons / 780 rows, +23 new questions); seed `toeic_vocab_tracker_v3_w2_07_wave_18_2026_05_22`. `XPLAT-01` added Google Drive manual backup/restore flow without production seed changes.
- Newly verified: `SYNC-01` repo-side Phases 1-7 are now complete. Phase 1 linkage, Phase 2 repo-side setup, Phase 3 disabled-safe Drive client skeleton, Phase 4 sync payload contract, Phase 5 safe-merge/conflict rules, Phase 6 auto-sync UX/state, and Phase 7 failure-handling/safety are verified in-repo; remaining blockers are external Google Cloud / OAuth authorization setup plus later Phase 8 acceptance coverage. Shipped asset cache is `toeic-vorb-v46`.
- Current priority rule: 完成 `PAGES-01` 前，不繼續下一個 content promotion，除非使用者明確要求。`SYNC-01` 是 user-requested parallel sync work，不授權任何 content promotion。
- Blocked on (mainline): 公開 GitHub Pages 部署仍停在舊 seed / 舊 launcher 文案；`PAGES-07-06` 與 `PAGES-10-06` 要在 redeploy 後完成實機驗收。
- Blocked on (content rewrite): production V2/V3 rewrites remain blocked until real current learner/export evidence exists (repo export still 2026-05-14 `V1-B-21` only).
- Note: `V3-W1-17` is not in `wave1_app_lesson_draft.json` (wave-1 ends at `V3-W1-16`); do not plan a W1-17 promotion without a new blueprint slice.

---

## 2) 主執行順序

本節是唯一的 top-down execution path。之後如果只想照順序往下做，不要先看分類；直接由上往下完成本節即可。第 3-8 節只負責保留各 block 的詳細 checklist、完成紀錄與參考說明。

### 已完成基礎層

- [x] Foundation closed：C-01..C-09、C-12、U-01..U-06、D-01..D-09、D-11

說明：empty-state、單一真相、release gate、題庫治理、文檔一致性、第一個 production wave、baseline smoke 與 UI 結構基礎都已完成。除非現況真相改變，否則不需要回頭重排這一層。

### 唯一下一輪執行順序

- [ ] Step 0 / PAGES-01：完善 GitHub Pages 與手機端完整體驗。
	Done when: `docs/pages-mobile-experience-plan.md` 的十階段 60 個 checkpoint 全部完成，最小 mobile smoke test 通過，`npm run test:all` 通過，GitHub Pages 真實 URL 手機驗收清單完成。完成前不要繼續下一個 content promotion，除非使用者明確要求。
- [x] User-requested parallel / XPLAT-01：Google Drive 手動跨平台備份 / 還原。
	Done when: `docs/google-drive-record-portability-plan.md` 的 Phase 1-8、Export backup JSON、Import preview、safe merge、文件更新與 backup/restore Playwright 覆蓋完成。這是「使用者指定的非內容 promotion 並行工作」；不取代 `PAGES-01`，不解除 Pages live deployment 剩餘驗收，不修改 `data/vocab/*`，不啟用 V4，也不影響 seed version。
- [ ] User-requested parallel / SYNC-01：Google Drive 自動跨裝置同步。
	Done when: `docs/google-drive-cloud-sync-plan.md` 的 Phase 1-8 全部完成，Settings 提供 Google Drive connect/status/sync now/pause/disconnect，同一 Google Drive 帳戶可在至少兩部裝置 safe merge learner records，重複同步不產生重複資料，seed mismatch/corrupt cloud file/token/offline paths 都安全處理，`XPLAT-01` 手動備份仍保留，且 `npm run test:all` 通過。這是使用者指定的 no-login/no-cloud-sync hard rule scoped exception；只允許 Google Identity Services + Google Drive API 作為 local-first learner-record sync layer，不新增後端、不修改 `data/vocab/*`、不啟用 V4、不改 seed version，也不取代 `PAGES-01`。
- [x] Step 1 / C-10：完成 wave 2（`V2-A-72` 到 `V2-A-74`）候選草稿、isolated validation、人審與正式 promotion，讓 production 由 1 課擴到 4 課。
	Done when: `V2-A-74` 候選草稿完成，且 `V2-A-72`、`V2-A-73`、`V2-A-74` 一起通過 release gate 並寫入 live seed。
- [x] Step 2 / D-10：在第一個多課 production wave 之後固定 inventory refresh / monthly reporting 流程，讓 production / draft / rebuild / archive 四桶統計與 current-truth sync 不再靠手動臨時整理。
	Done when: D-10 六個 checkpoint 全部完成，且至少完成一次真實 refresh cycle。
- [x] Step 3 / C-13：依已固定的十堂課路線完成 `V2-A-75` 到 `V2-A-80`、`V2-MR-01`、export feedback review、wave 3 與 wave 4 promotion，讓 production 達到 10 堂 V2 core lessons。
	Done when: live production 達到 `V2-A-71` 到 `V2-A-80` 十堂 core lessons，`V2-MR-01` 已按 policy 組裝，且至少完成一次五課後 export feedback review。
- [x] Step 4 / C-11：在 V2 十堂課與 reporting 流程穩定後，切出、驗證並記錄第一個 V3 production candidate wave，補齊下一階段擴張結構。
	Done when: 第一個 V3 production candidate wave 完成 isolated validation、human review、promotion mapping 與 release-candidate 定義。

### 本輪完成條件

- [ ] 當 Step 0 / PAGES-01 完成後，才恢復評估下一個 content promotion 或進入「上課流程」手機深度測試。`XPLAT-01` 與 `SYNC-01` 都是 user-requested parallel portability/sync work，不授權任何 content promotion。

### 狀態總覽

- [x] 已完成基礎層：C-01..C-09、C-12、U-01..U-06、D-01..D-09、D-11
- [ ] 目前唯一主線：`PAGES-01` GitHub Pages + mobile baseline（`docs/pages-mobile-experience-plan.md`；repo-side 58/60 checkpoints complete，剩餘 `PAGES-07-06` / `PAGES-10-06` 與 redeploy 後實機驗收）
- [x] 非主線並行工作：`XPLAT-01` Google Drive 手動跨平台備份 / 還原（使用者指定；不改 seed、不碰 content promotion、不解除 PAGES-01 驗收）
- [ ] 非主線並行工作：`SYNC-01` Google Drive 自動跨裝置同步（使用者指定；repo-side Phase 1-7 verified；剩餘 Google Cloud / OAuth live auth 與 Phase 8 acceptance；不改 seed、不碰 content promotion、不解除 PAGES-01 驗收）

---

## 3) 教學內容 Checklist

說明：以下區塊按領域保留詳細 checklist 與完成紀錄，方便查閱；真正執行順序只看第 2 節。

### C-01 建立空題庫教學模式
Priority: P0
重要性: 高
複雜度: 中

- [x] 盤點 `Today`、`Roadmap`、`Lesson`、`Settings` 在 0 lessons / 0 questions 狀態下的錯誤或誤導文案。
- [x] 定義 empty-seed 模式的標準文案，包括「目前無正式課程」、「如何查看進度」、「如何進入重建資訊」。
- [x] 在 `Today` 加入可執行 CTA，避免顯示無效的開始課程語意。
- [x] 在 `Lesson` 或相關入口加入防呆，避免無課程時仍進入錯誤流程。
- [x] 補上最少 1 個 UI regression 或 smoke test，驗證 empty-seed 模式可正常顯示。
- [x] 完成後同步檢查 `使用說明書` 與 `TO_AI.md` 的描述是否一致。

Completed on: 2026-05-20
Decision: C-01 的內容已由後續空狀態治理工作實際完成。Today 目前會顯示「目前沒有可開始的正式課程」與 Future Plan CTA；Lesson 有 empty-state 防呆與重建指引；tracker shell 有全域 empty-seed banner 覆蓋 Today / Roadmap / Lesson / Settings；Roadmap 與 Settings 也保留可進入的進階工具入口。`tests/ui-regression.spec.ts` 已覆蓋 Today、Roadmap、Lesson 與 banner 跨頁顯示；`docs/使用說明書.md` 與 `TO_AI.md` 也都已同步記錄 empty production seed 現況與下一步路徑。

### C-02 統一 speed_drill 時限單一真相
Priority: P0
重要性: 高
複雜度: 低

Decision (2026-05-19): 正式時限採 8 秒。
Reason: `js/vocab-scoring.js`、`AGENTS.md`、`CLAUDE.md`、`docs/使用說明書.md` 原本已把 `speed_drill` 定義為 8 秒；`js/views/lesson.js` 的 12 秒是單點漂移。維持 8 秒可以保留既有 `TIME_PRESSURE` 意圖、題型節奏與文檔一致性，修正面也最小。

- [x] 決定正式時限是 8 秒還是 12 秒，並把決策寫入本文件。
- [x] 更新執行邏輯中的常數與相關顯示文案。
- [x] 更新 `使用說明書`、`AGENTS.md`、`TO_AI.md`、規格文件中的 speed_drill 時限敘述。
- [x] 更新 Playwright 或其他測試預期，避免規格與測試不一致。
- [x] 全域搜尋 repo，確認不再存在舊時限值的活躍引用。
- [x] 完成後記錄決策日期與採用原因。

### C-03 建立重建波次最小上線標準
Priority: P0
重要性: 高
複雜度: 中

- [x] 定義每一個 rebuild wave 的最小產出內容：lesson、question、review、item、文檔、測試。
- [x] 定義每一波上線前必須通過的驗證：schema、duplicate、quality audit、Playwright。
- [x] 定義每一波需要的人工作業：內容審核、語意檢查、錯因檢查、答案分布檢查。
- [x] 把 release gate 寫成固定 checklist，未通過任何一項不得視為可合併。
- [x] 把最小上線標準同步到 `question-creation-spec.md` 相關位置。
- [x] 完成後以第一個實際 wave 試跑一次流程。

Completed on: 2026-05-19
Decision: 新增 `docs/rebuild-wave-release-gate.md` 作為 rebuild wave 的固定 gate，區分 draft wave 與 production release wave。production wave 至少要有完整 lesson/question/review/item/docs/tests 產出，並通過 schema、duplicate、quality audit、docs、Playwright 與 `npm run test:all`；人工檢查必須涵蓋內容品質、語意、錯因、答案分布、解析、干擾選項與 review 壓力。第一個實際試跑使用 `V3-W1-01` draft slice，`node scripts/verify-phase10-slice.js` 通過 17/17 checks，但依 gate 判定只能作為 draft authoring reference，不能視為 production release。

### C-04 為 V0 診斷建議加入資料量門檻
Priority: P1
重要性: 中高
複雜度: 中

- [x] 定義 V0 診斷最少需要多少 attempts 才能給出有效建議。
- [x] 定義資料不足時要顯示的文案，例如 `insufficient data` 或更友善中文說明。
- [x] 更新 `Today` 診斷推薦邏輯，讓低資料量時不產生誤導性建議。
- [x] 確認 export 檔是否也需要區分「資料不足」與「有建議」。
- [x] 補上對應測試，驗證資料不足與資料足夠兩條分支。
- [x] 完成後把門檻規則寫回本文件與必要文檔。

Completed on: 2026-05-19
Decision: V0 診斷建議至少需要 20 次 V0 attempts；1–19 次時 Today 顯示「V0 診斷資料不足」，Export 的 `diagnostic_recommendation.json` 輸出 `status: "insufficient_data"`，不輸出 `recommended_stage`。

### C-05 建立每題型最小可用包
Priority: P1
重要性: 中高
複雜度: 中

- [x] 為 V1、V2、V3 各自定義最小可用包的 lesson 數、question 數與 review 要求。
- [x] 為每個題型指定第一批要重建的示範課與目標 item。
- [x] 完成第一批高品質樣本題，確保 explanation、distractor、target_item 都符合規格。
- [x] 針對最小可用包執行完整 audit 與人工教學檢查。
- [x] 進行一次從 seeding、作答、review、export 的完整 smoke test。
- [x] 通過後才進入大規模擴量。

Completed on: 2026-05-19
Decision: 新增 `docs/minimum-usable-content-packs.md` 與 `drafts/v0-v3-rebuild/minimum_usable_packs.json`，固定 V1/V2/V3 第一批最小可用包。V1 需同時覆蓋正常 word-family lesson 與 speed-drill runtime（2 lessons / 64 rows / 4 review rows）；V2 以 `V2-A-71` 作 1 lesson / 24 rows / 4 review rows 的 scene vocabulary baseline；V3 使用既有 `V3-W1-01` draft slice 作 1 lesson / 24 rows / 4 review rows 的 draft reference。新增 `scripts/verify-minimum-usable-packs.js` 與 `npm run test:mup`，檢查 pack counts、type coverage、target item、sample question schema、V3 draft linkage 與人工檢查清單。完整 seeding→lesson→review→export smoke 由現有 Playwright seeded suite 保持覆蓋；正式 production promotion 仍須通過 C-03 release gate 與 seed sync。

### C-06 建立匯出分析反饋內容治理流程
Priority: P2
重要性: 中
複雜度: 中高

- [x] 指定每次內容更新後要固定檢視的 export 檔案清單。
- [x] 定義要追蹤的核心指標，例如錯因分布、修復率、平均作答時間、題型正確率。
- [x] 建立一份內容回顧模板，記錄哪些題型要加強、刪減或重寫。
- [x] 規定每一波內容更新後必須完成一次 export review。
- [x] 將 export review 結果回寫到下一輪題目重建優先順序。
- [x] 至少完成一次實際的 review cycle 作為流程驗證。

Completed on: 2026-05-19
Decision: 新增 `docs/export-analysis-feedback-governance.md`、`docs/templates/export-content-review-template.md`、`drafts/v0-v3-rebuild/export_analysis_review_policy.json` 與第一份實際 review cycle `drafts/v0-v3-rebuild/export_review_cycles/2026-05-19-c06-seeded-fixture-review.json`。每次 production seed content change、draft authored slice review、minimum usable pack review 或 question type scale-up 後都必須做 export review。固定檢視 24 個 export 檔案與 12 個核心指標，決策需回寫 `Future Plan`、minimum pack、release gate 或下一波 authoring backlog。新增 `scripts/verify-export-review-governance.js` 與 `npm run test:export-governance`，檢查 policy、template、review cycle、Export builder 與 Playwright 覆蓋。

### C-07 試跑 AI 精簡 prompt V2 草稿並檢視 audit warning
Priority: P1
重要性: 中高
複雜度: 中

- [x] 以 `docs/templates/ai-question-authoring-prompt.md` 為基準，直接起 1 個最小可審核的 V2 或 V3 草稿包。
- [x] 草稿必須維持 `production_impact: none`，不可改動 production seed、`curriculum.question_files` 或 `data/vocab/questions_v*.json`。
- [x] 使用 isolated audit root 跑 `scripts/audit-quality-full.js`，先把 blocking issue 修到 0。
- [x] 記錄命中的 non-blocking warning，作為下一輪 compact prompt 或 authoring checklist 微調依據。
- [x] 回寫本文件，說明這次 probe 選了哪一課、為何選它、以及命中的 warning 類型。

Completed on: 2026-05-20
Decision: 這次 probe 選擇 `V2-A-71`，因為它是 `minimum usable pack` 裡最小、最乾淨的 V2 baseline，且作為 first-core exception 不需要處理 earlier same-stage old-item pressure，能把觀察焦點集中在 compact prompt 與 authoring quality 本身。草稿產物落在 `drafts/v0-v3-rebuild/v2_a_71_compact_prompt_draft_pack.json`，明確標成 `production_impact: none`。隔離 audit root 跑完後，第一輪先命中 4 條 preferred stem length warning 與 4 條 staircase progression warning；將 4 個過短題幹補到 15–25 詞後，最終結果收斂到 0 blocking、4 條 staircase progression warning。剩餘 warning 反映的不是表層格式問題，而是 `scene_vocabulary` 在同一課對同一 target 重複 5 次、但題型仍維持同一 demand rank 的結構性設計限制。下一輪若要進一步壓低 warning，應調整同一 item 的題型階梯，而不只是再微調字面 prompt。

### C-08 將 V2-A-71 升格為第一個 production wave
Priority: P0
重要性: 高
複雜度: 高

- [x] 將 `V2-A-71` lesson row 與 24 個 question rows 由 draft-only 轉入 production data。
- [x] 同步更新 production seed version、service worker cache、以及必要的 reseed 測試常數。
- [x] 先通過 production data validation 與 full quality audit，再繼續擴散到 docs 與 UI regression。
- [x] 更新 active current-truth docs，移除「production seed 完全為空」的描述。
- [x] 建立正式 seed change record，記錄 validation 結果與 rollback plan。
- [x] 更新 production UI regression，使其反映「已有第一課上線」而不是 empty-seed 模式。
- [x] 完成後執行完整 production release gate 驗證。

Completed on: 2026-05-20
Decision: `V2-A-71` 已由 `drafts/v0-v3-rebuild/v2_a_71_compact_prompt_draft_pack.json` 升格為第一個正式 production wave。當時 `data/vocab/curriculum.json` 只有 1 個正式課程 row，`data/vocab/questions_v2a.json` 只有 24 個正式題目 row；當時 seed version 為 `toeic_vocab_tracker_v2_a_71_first_wave_2026_05_20`，service worker cache 為 `toeic-vorb-v11`。current-truth docs、`AGENTS.md` / `CLAUDE.md`、`tests/ui-regression.spec.ts`、`tests/seed-sync.spec.ts`、`scripts/verify-minimum-usable-packs.js` 與正式 seed change record 已全部同步更新。驗證結果：`node scripts/validate-vocab-data.js`、`node scripts/audit-quality-full.js`、`node scripts/audit-duplicates.js`、`npm run test:docs`、`npx playwright test tests/ui-regression.spec.ts`、`npx playwright test tests/seed-sync.spec.ts`、`npx playwright test` 與 `npm run test:all` 全部通過。此次 promotion 接受 4 條 staircase progression warning 作為第一波上線後續追蹤項目，不構成 blocking issue。

### C-09 強化 V2-A-71 的 post-release review 與 staircase debt 決策
Priority: P0
重要性: 高
複雜度: 中

- [x] 匯總 `V2-A-71` 現有 4 條 staircase progression warnings，逐條判定是 accepted debt、需要微調，還是需要重寫。
- [x] 為 `V2-A-71` 建立一次 post-release human review，檢查題序節奏、同 item demand shift、解析品質與 distractor plausibility。
- [x] 以真實 learner sessions / export feedback 為基礎，確認 `V2-A-71` 是否存在集中錯因、異常耗時或 review_question 價值不足的現象；目前 repo 無 `V2-A-71` learner/export attempts，因此結論正式標記為 `insufficient_data`。
- [x] 若判定需要調整內容，先建立 isolated draft probe，再決定是否回寫 production，而不是直接修改 live seed。
- [x] 若判定目前 warning debt 可接受，將接受理由、觀察指標與 revisit 條件寫入對應 wave retrospective 或 seed follow-up note。
- [x] 完成後回寫本文件與必要 current-truth docs，明確記錄 `V2-A-71` 的 post-release verdict。

Completed on: 2026-05-20
Decision: 已新增 `docs/wave-retrospectives/2026-05-20-c09-v2-a-71-post-release-review.md` 與 `drafts/v0-v3-rebuild/export_review_cycles/2026-05-20-c09-v2-a-71-post-release-review.json`。`node scripts/audit-quality-full.js` 仍為 0 blocking issues、4 條 staircase progression warnings；4 條 warning 分別對應 `extension`、`photocopier`、`stationery`、`workstation`，本次判定為 first production baseline 的短期 accepted warning debt，不直接修改 live seed。人審結論是題序偏平、同 item demand shift 不足，但題幹場景自然、distractor 同場景且無明顯 grammar/article giveaway、A/B/C/D 答案分布為 6/6/6/6、`explanation_zh` 可接受。review_question 目前只能視為 quick recall baseline，尚無 transfer 證據；repo 中沒有 `V2-A-71` 真實 learner sessions 或 export feedback，舊 `Log Download/` export 是 2026-05-14 的 V1-B-21 資料，不能用來判定 `V2-A-71`。後續若至少有 3 次完整 `V2-A-71` sessions / 72 attempts 或 review-mode export 顯示集中錯題、平均耗時超過 15 秒、review fix rate 低於 50%，才建立 isolated draft probe；任何 production rewrite 仍須走 seed sync、seed change record 與完整 release gate。C-10 之後的 V2 lessons 不應複製此「每 item 5 個同 demand context + direct review」作為預設 staircase。

### C-10 建立 V2 下一波 2-3 課的 production promotion pipeline
Priority: P0
重要性: 高
複雜度: 高
Execution position: Step 1 / top-down critical path

- [x] 選定 V2 下一波 2-3 課的 lesson candidates、target items、question row 規模與預計 promotion 順序。
- [x] 為每個候選 lesson 建立 `production_impact: none` 的 draft slice，避免直接改動 live seed。
- [x] 對每個候選 lesson 跑 isolated structural validation、quality audit 與 duplicate audit，先將 blocking issues 清到 0。
- [x] 為每個候選 lesson 補做 V2 human review，特別檢查 staircase 設計、old-item pressure 與 scene realism。
- [x] 定義這一波要寫入哪個 `questions_v2*.json` 檔與 seed version / seed change record 的同步策略。
- [x] 盤點 promotion 後需要同步的 docs、UI regression、seed helper 與 service worker cache 變更範圍。
- [x] 僅在整波候選都通過 release gate 後，才正式升格為下一個 V2 production wave。

Completed on: 2026-05-20
Progress (2026-05-20 T039): `V2-A-72`、`V2-A-73`、`V2-A-74` 已全部由 candidate draft 正式升格為 wave 2 production lessons。`data/vocab/curriculum.json` 現在包含 `V2-A-71` 到 `V2-A-74` 共 4 個 V2 lesson rows，`data/vocab/questions_v2a.json` 現在包含 96 個 production question rows；seed version 已同步到 `toeic_vocab_tracker_v2_a_72_74_wave_2_2026_05_20`，service worker cache 已同步到 `toeic-vorb-v12`。production `validate-vocab-data`、`audit-quality-full` 與 `audit-duplicates` 已通過；full audit 維持 0 blocking issues，並接受 16 條 staircase progression warnings 與 1 條 `V2-A-71` first-core old-item policy exception 作為既有非阻塞 debt。T038（seed promotion plan）與 current-truth docs / UI regression / seed helper 已同步改寫，下一個 production authoring target 改為 `V2-A-75`。

Progress on: 2026-05-20
Decision: C-10 已由規劃階段進入正式 promotion 完成態。Wave 2 的三個候選 lessons 已全部寫入 live seed，seed version / cache / current-truth docs / UI regression / seed helper 均已同步。C-10 之後的下一步不再是回頭補 A72-A74，而是沿 C-13 進入 `V2-A-75` 與 wave 3 準備，並在至少 5 堂 V2 core lessons live 後執行第一輪 export feedback review。

### C-11 從 `drafts/collocation-rebuild/` 切出第一個 V3 production 候選 wave
Priority: P1
重要性: 高
複雜度: 高
Execution position: Step 4 / after ten-lesson V2 path and reporting flow stabilize

- [x] 盤點 `drafts/collocation-rebuild/` 內哪些檔案只是 blueprint，哪些內容足以切出第一個 V3 production 候選 wave。
- [x] 從 `wave1_question_shells.json` 與對應 lesson / item artifacts 中選出最適合先 promotion 的 1-2 個 V3 lessons。
- [x] 為選中的 V3 lessons 切出 `production_impact: none` 的候選資料包，保持與 production data 完全隔離。
- [x] 對候選 V3 wave 跑 isolated validation、quality audit 與 duplicate audit，先把 blocking issues 清到 0。
- [x] 補做 V3 human review，重點檢查 collocation 合理性、Part 5/Part 6 教學負荷與 review rows 的學習價值。
- [x] 決定第一個 V3 production wave 是單課上線還是雙課成對上線，並寫出 promotion 所需的 seed/file mapping。
- [x] 在 V2 下一波 promotion pipeline 穩定後，將這個 V3 候選 wave 升格為正式 release 候選。

Completed on: 2026-05-21
Decision: 前四個 V3 production waves 已上線（單課、雙課、三課、單課 `V3-A-127`）。Wave 4 promotion script 為 `tmp/promote-v3-w1-07.js`；seed record 為 `docs/seed-changes/2026-05-21-toeic_vocab_tracker_v3_w1_07_wave_4_2026_05_21.md`。Production 現為 18 runnable lessons / 408 question rows / seed `toeic_vocab_tracker_v3_w1_07_wave_4_2026_05_21` / cache `toeic-vorb-v19`。V3 core progress 7/10 live。下一步是 authoring `V3-W1-08`/`09`/`10`（商務會議） toward 10/10。

### C-12 建立 production baseline smoke checklist（T018-T020）
Priority: P0
重要性: 高
複雜度: 中

- [x] 先驗證 `T001-T010` 的治理文件覆蓋是否完整，並補上逐項 verification table。
- [x] 檢查 `V2-A-71` production baseline 目前可用的 UI regression 覆蓋範圍。
- [x] 建立可重跑的 production baseline smoke checklist，供每次新 wave promotion 前使用。
- [x] 補上多課 production 狀態下 Today next action 的排序驗證，確認完成 `V2-A-71` 後會指向下一個未完成 lesson。
- [x] 明確記錄 `T013` 仍 blocked by missing real learner/export data，不得用測試 fixture 代替真實 learner evidence。
- [x] 明確記錄 `T015` 仍 conditional，只有 learner evidence 觸發後才從 isolated draft probe 開始。

Completed on: 2026-05-20
Decision: 新增 `docs/production-baseline-smoke-checklist.md` 作為 `T011-T020` 的 baseline hardening 文件。`T011/T012/T014/T016/T017` 沿用 C-09 post-release review；`T018/T019/T020` 已由 smoke checklist 與 `tests/ui-regression.spec.ts` 補強完成，並新增「future multi-lesson production state selects first incomplete lesson」regression，驗證 Today 在 `V2-A-71` completed、`V2-A-72` not_started 時會選 `V2-A-72`。`T013` 不能完成，因 repo 仍沒有真實 `V2-A-71` learner/export sessions；`T015` 不應主動 rewrite production seed，只有當 learner evidence 顯示集中錯題、異常耗時或 review repair 弱時，才建立 `production_impact: none` 的 isolated draft probe。

### C-13 建立十堂正式課 production expansion 執行清單
Priority: P0
重要性: 高
複雜度: 高
Execution position: Step 3 / after wave 2 promotion and D-10 reporting flow

目標定義：本 block 的「十堂課」一律指 10 堂 runnable production V2 core lessons；draft、rebuild、archive、mixed review placeholder 與純候選資料包都不計入達標數。正式目標範圍固定為 `V2-A-71` 到 `V2-A-80`。

執行原則：在 production 尚未達到 10 堂課，且尚未連續兩次 production release gate 乾淨通過前，維持現有治理上限：每月最多 2 次 production seed waves、每波最多 3 個 core lessons，不得以單課 opportunistic promotion 取代整波 promotion。

Current progress snapshot: live production lessons 現為 `V2-A-71` 到 `V2-A-80` 加 `V2-MR-01`（11 runnable lessons；V2 core progress 10/10），production question rows 為 240，current seed 為 `toeic_vocab_tracker_v2_a_78_80_wave_4_2026_05_21`，current cache 為 `toeic-vorb-v15`。

Progress (2026-05-20/2026-05-21 C-13): `V2-A-75`、`V2-A-76`、`V2-A-77` candidate drafts 已建立於 `drafts/v0-v3-rebuild/v2_a_75_candidate_draft_pack.json`、`drafts/v0-v3-rebuild/v2_a_76_candidate_draft_pack.json`、`drafts/v0-v3-rebuild/v2_a_77_candidate_draft_pack.json`；human review 分別為 `docs/wave-retrospectives/2026-05-20-c13-v2-a-75-candidate-review.md`、`docs/wave-retrospectives/2026-05-20-c13-v2-a-76-candidate-review.md`、`docs/wave-retrospectives/2026-05-20-c13-v2-a-77-candidate-review.md`。最終隔離 7 課 snapshot（A71-A74 production + A75-A77 drafts = 168q）通過 structural validation、full quality audit、duplicate audit：0 blocking issues、0 duplicate stems、0 old-item pressure issues、28 staircase warnings。Wave 3 已正式 promotion。`V2-MR-01` 也已由 `drafts/v0-v3-rebuild/v2_mr_01_candidate_draft_pack.json` 升格為 production curriculum lesson，重用 20 個既有 review IDs，新增 0 question rows。此段為 wave 4 前的歷史狀態；目前 live count 已由後續 wave 4 更新為 11 runnable lessons / 240 rows。

Progress (2026-05-21 C-13): wave 4 candidate drafts `V2-A-78`、`V2-A-79`、`V2-A-80` 已建立於 `drafts/v0-v3-rebuild/v2_a_78_candidate_draft_pack.json`、`drafts/v0-v3-rebuild/v2_a_79_candidate_draft_pack.json`、`drafts/v0-v3-rebuild/v2_a_80_candidate_draft_pack.json`。Combined human review 為 `docs/wave-retrospectives/2026-05-21-c13-v2-wave4-candidate-review.md`。最終隔離 wave 4 snapshot（A71-A77 production + V2-MR-01 + A78-A80 drafts = 240q / 11 lessons）通過 full quality audit：0 blocking issues、0 duplicate stems、0 old-item pressure issues、0 preferred stem length warnings、40 staircase warnings total（其中 12 條來自 A78-A80）。Wave 4 已正式 promotion，新增 3 堂 core lessons / 72 題，production 現為 11 runnable lessons / 240 question rows。

- [x] 鎖定十堂課的正式計數口徑：只計 runnable production V2 core lessons，不把 mixed review、draft packs、rebuild stock 或 archive artifacts 算進 live lesson count。
- [x] 將十堂課路線固定切成三個 production waves：wave 2 = `V2-A-72` 到 `V2-A-74`、wave 3 = `V2-A-75` 到 `V2-A-77`、wave 4 = `V2-A-78` 到 `V2-A-80`。
- [x] 先完成 `V2-A-74` 的 `production_impact: none` candidate draft，補齊目前 T039 formal seed promotion gate 的唯一前置缺口。
- [x] 對 `V2-A-74` 跑 isolated structural validation、quality audit 與 duplicate audit，把 blocking issues 清到 0，並補上 human review note，明確檢查 staircase、old-item pressure、scene realism、answer balance 與 distractor plausibility。
- [x] 在 `V2-A-72`、`V2-A-73`、`V2-A-74` 三課都通過 isolated validation、人審與 warning triage 後，一次執行 wave 2 production promotion；不得跳過整波 release gate 直接把單課寫入 live seed。
- [x] wave 2 promotion 完成時，同步更新 `data/vocab/curriculum.json`、`data/vocab/questions_v2a.json`、三個 seed version 檔、seed-change record、service worker cache、UI regression、seed helper、`TO_AI.md` 與本文件的 current-truth 描述。
- [x] 完成 `V2-A-75` through `V2-A-77` candidate drafts, isolated validation, human review, production promotion, seed sync, and wave 3 release documentation; `V2-A-71` through `V2-A-75` now satisfy the `V2-MR-01` source condition.
	Status note: wave 3, `V2-MR-01`, and wave 4 are live in production; current focus moves to T049 export feedback evidence and then C-11 V3 candidate preparation.
- [x] 依 mixed review policy 組裝並升格 `V2-MR-01`：只重用 5 堂 source core lessons 的 20 個 `review_question_ids`，不得額外新增 question-bank rows 假裝 mixed review 擴量。
- [x] 完成 wave 4 (`V2-A-78` through `V2-A-80`) draft-only candidate packs、isolated validation、duplicate/full quality audit 與 combined human review；production_seed_changed=false。
- [x] 在至少 5 堂 V2 core lessons live 後，執行第一輪真實 export feedback review（對應 T049），固定檢查錯因分布、平均作答時間、review fix rate、warning debt 是否因 learner evidence 升級為 blocker。
- [x] 依 export feedback 結果重新排序 `V2-A-78` 到 `V2-A-80` 的實際 promotion 優先序；若 evidence 沒有顯示新的 blocker，預設維持 wave 4 (`V2-A-78` 到 `V2-A-80`) 的波次順序。
- [x] 完成 wave 3 (`V2-A-75` through `V2-A-77`) draft, validation, human review, production promotion, seed sync, and wave retrospective/seed record path; production release gate has 0 blocking issues.
- [x] 完成 wave 4（`V2-A-78` 到 `V2-A-80`）的 formal release gate、production promotion、seed sync 與 seed-change record，讓 production 達到 10 堂 runnable V2 core lessons（加 `V2-MR-01` 共 11 runnable lessons）。
- [x] 十堂課達標後，重新檢查 production wave rate cap 是否可放寬，並決定下一階段優先推進 `V2-MR-02`、V3 第一個 production candidate wave，或兩者並行。
- [x] 每一個 production wave 結束後，都要同步更新 `TO_AI.md`、本文件 Current Progress Snapshot、seed-change record、human review note、wave retrospective 與必要 current-truth docs，避免 live lesson count、question count、seed version 與 cache version 漂移。

Completed on: 2026-05-21
Decision: C-13 已完成。Production 現為 `V2-A-71` 到 `V2-A-80` 十堂 V2 core lessons，加 `V2-MR-01` 共 11 runnable lessons / 240 question rows。T049 export feedback review 記錄於 `drafts/v0-v3-rebuild/export_review_cycles/2026-05-21-t049-v2-live-feedback-review.json`；repo 內唯一 export 是 2026-05-14 的 `V1-B-21` 資料（24 attempts / 1 session / 0 V2 attempts），因此本輪判定為 `completed_with_insufficient_learner_data`。沒有任何 learner evidence 授權重寫 V2 live seed；40 條 V2 staircase warnings 維持 non-blocking warning debt。Production wave rate cap 暫不放寬，下一階段優先推進 C-11 V3 第一個 production candidate gate，不並行啟動 `V2-MR-02`。

---

## 4) 使用體驗 Checklist

### U-01 主導覽資訊架構一致化
Priority: P0
重要性: 高
複雜度: 低

- [x] 決定產品正式採用 6 分頁還是 8 分頁。
- [x] 更新主導覽 tabs，確保實際 UI 與定義一致。
- [x] 更新 `README`、`使用說明書`、必要說明文案，不再描述錯誤分頁數。
- [x] 檢查 `Today`、`Settings`、快速入口按鈕是否與最終導覽結構一致。
- [x] 補上 regression test，驗證 tabs 顯示與導航正常。
- [x] 完成後全域搜尋 repo，確認活躍文件不再出現舊分頁數敘述。

### U-02 空狀態下一步行動重寫
Priority: P0
重要性: 高
複雜度: 低

- [x] 盤點所有會出現「開始課程」或類似 CTA 的位置。
- [x] 定義 empty-seed 狀態下的替代 CTA 文案與按鈕行為。
- [x] 更新 `Today` 的 next action 與相關按鈕。
- [x] 更新 `Lesson` 或其他直接進課入口，避免空狀態誤導。
- [x] 手動驗證使用者在 empty-seed 狀態不會卡在死路。
- [x] 補上最少 1 個自動化或 smoke test 覆蓋此流程。

### U-03 匯出文案一致化
Priority: P1
重要性: 中高
複雜度: 低

- [x] 盤點目前所有 export 相關按鈕與文案。
- [x] 選定唯一標準用語，例如「匯出完整封包」或其他統一命名。
- [x] 更新 `Export` 畫面的主要按鈕、副標題與說明文字。
- [x] 更新 `使用說明書` 與其他活躍文件中的 export 相關描述。
- [x] 檢查不同瀏覽器模式下的文案是否仍清楚描述逐檔下載與資料夾匯出差異。
- [x] 完成後執行 UI 檢查，確認文案不再互相矛盾。

Completed on: 2026-05-20
Decision: 將正式主用語統一為「匯出完整資料封包」。`Export` 畫面的主按鈕、副標題、資料夾儲存與逐檔下載說明、成功/警示通知都改為同一套命名；`docs/使用說明書.md` 也同步改寫成相同用語並明確說明資料夾匯出與逐檔下載差異。直接依賴此按鈕名稱的 Playwright 測試與 export governance 驗證腳本已同步更新。

### U-04 進階功能入口一致策略
Priority: P1
重要性: 中
複雜度: 低

- [x] 定義 `Today`、`Roadmap`、`Settings` 對 `Export` / `Question Bank` 的入口策略。
- [x] 統一按鈕命名與顯示順序，避免同功能多種叫法。
- [x] 檢查手機與桌面版是否都能清楚找到進階功能。
- [x] 更新必要提示文案，說明哪些功能屬於一般使用、哪些屬於維護或進階用途。
- [x] 手動測試所有入口是否都可到達正確頁面。
- [x] 補上至少 1 個針對進階入口的 UI 回歸檢查。

Completed on: 2026-05-20
Decision: 將 `Today`、`Roadmap`、`Settings` 的進階入口統一為同一個共享 `進階工具` 區塊，固定提供 `匯出完整資料封包` 與 `題庫管理`，順序一律先匯出再題庫。Today 的 `下一步` 區塊只保留一般學習動作，避免把維護用途按鈕混進主要學習流程；Roadmap 補上同一套進階工具入口；Settings 改用相同 helper 與相同提示文案。相鄰 quick entry（empty-seed banner、Mistakes 的 export 入口）也同步改名，避免再次出現多種叫法。新增 UI regression 覆蓋桌面與手機 viewport，確認三個頁面都能清楚找到進階功能並成功導頁。

### U-05 Stage Gate 無資料情境文案
Priority: P1
重要性: 中
複雜度: 中

- [x] 定義 Stage Gate 在「未達標」與「無資料」兩種情境的不同顯示規則。
- [x] 更新 readiness 計算結果的顯示文案，避免無資料時被誤判成失敗。
- [x] 更新警示框與行動按鈕文案，讓使用者知道下一步可以做什麼。
- [x] 檢查 `Today` 與 `Lesson` 的 stage gate 呈現是否一致。
- [x] 補上針對 no-data stage gate 的測試案例。
- [x] 完成後記錄正式文案規則，避免後續再漂移。

Completed on: 2026-05-19
Decision: Stage Seal / Stage Gate 狀態分為 `planned`（目前無正式課程規劃可執行）、`無資料`（有規劃或後續階段入口，但缺少課程或作答資料可判斷）、`未達標`（已有資料但未達封關條件）、`可封關`、`已封關`。Lesson gate 在 `無資料` 時顯示「階段資料不足」與 Today / Roadmap 入口；在 `未達標` 時保留「先去複習模式」與繼續選項。

### U-06 建立清空模式 Banner
Priority: P2
重要性: 中
複雜度: 中

- [x] 定義何時顯示清空模式 Banner，以及哪些頁面必須顯示。
- [x] 定義 Banner 必須包含的資訊：目前狀態、限制、下一步、參考文件。
- [x] 在主要頁面實作 Banner 顯示與樣式。
- [x] 決定 Banner 是否可關閉，以及關閉後的保存規則。
- [x] 驗證 Banner 在 Service Worker cache 更新後仍能穩定顯示。
- [x] 補上文件與 UI smoke test，確認使用者能理解目前狀態。

Completed on: 2026-05-19
Decision: 清空模式 Banner 由 tracker shell 根據 `state.lessons.length === 0 && state.questions.length === 0` 顯示，覆蓋主要 tracker views。Banner 內容只在 production seed 同時為 0 lessons / 0 questions 時說明 Today / Roadmap / Lesson 的限制，以及 Future Plan、題庫管理、資料匯出入口。提示不可手動關閉，不寫入 localStorage；正式 lesson 與 question seed 恢復後自動消失。Service Worker cache 當時更新為 `toeic-vorb-v10`，C-08 後推進到 `toeic-vorb-v11`，T039 wave 2 promotion 後為 `toeic-vorb-v12`，C-13 wave 3 promotion 後為 `toeic-vorb-v13`，`V2-MR-01` promotion 後為 `toeic-vorb-v14`，wave 4 promotion 後 current cache 為 `toeic-vorb-v15`；測試保留 production-empty banner smoke test 與 seeded fixture 隱藏檢查。

### XPLAT-01 Google Drive 手動跨平台備份 / 還原
Priority: P1
重要性: 高
複雜度: 中
Execution position: user-requested parallel UX/data-portability work

Scope decision: 這是使用者指定的非內容 promotion 並行工作；不取代 `PAGES-01`，不解除 Pages live deployment 與 real-device acceptance 的剩餘驗收。它不修改 `data/vocab/*`，不啟用 V4，不移動 `drafts/v4/`，不改 seed version，也不新增登入、後端、Google Drive API、cloud sync、build tooling 或 runtime AI。

- [x] 將完整計畫保存為 `docs/google-drive-record-portability-plan.md`。
- [x] 在 Export 新增 `匯出 Google Drive 備份檔`，產生 `toeic_vocab_backup_YYYY-MM-DD.json`。
- [x] 備份檔包含 `backup_version`、`app_id`、`seed_version`、`exported_at`、`source_device_label`、summary、learner stores 與 localStorage highlights。
- [x] 在 Export 新增 `匯入備份檔`，先 preview 再確認 safe merge。
- [x] Safe merge 只處理 learner records：attempts、sessions、review_queue、error_logs、vocab_items mastery、lesson progress、settings local-first、exports、word_highlights；Question Bank source workflow 不被自動改寫。
- [x] 相同 keyPath records 去重；本機已有同 ID 時不重複匯入，lesson/mastery 只合併可保留進度的欄位。
- [x] seed mismatch 只警告，不覆蓋 production seed。
- [x] 更新 `README.md`、`TO_AI.md`、`docs/使用說明書.md`，說明 Google Drive 只是手動保存位置，不是即時同步。
- [x] 新增 Playwright backup/restore 覆蓋：builder summary、invalid JSON、duplicate import、seed mismatch、two-device merge、mobile 390x844 操作。
- [x] 完整 regression gate：`npx playwright test tests/app-pages-click-smoke.spec.ts`、`node scripts/check-doc-consistency.js`、`npm run test:all` 全部通過。

Completed on: 2026-05-22
Decision: 採「Google Drive 檔案搬運」而不是雲端同步。App 只產生與讀取 JSON，使用者自行把檔案上傳 / 下載到 Google Drive；任何真正同步功能都需要另開架構決策並重新評估 hard rules。

### SYNC-01 Google Drive 自動跨裝置同步
Priority: P1
重要性: 高
複雜度: 高
Execution position: user-requested parallel UX/data-sync work

Scope decision: 這是使用者指定的 `XPLAT-01` 後續同步計畫；不取代 `PAGES-01`，不解除 Pages live deployment 與 real-device acceptance 的剩餘驗收。`SYNC-01` 是原 no-login / no-cloud-sync hard rule 的 scoped exception，只允許 Google Identity Services + Google Drive API 讀寫同一 Google Drive 帳戶下的 learner-record sync file。它不新增後端、不新增 build tooling、不修改 `data/vocab/*`、不啟用 V4、不移動 `drafts/v4/`、不改 production seed version，也不授權 content promotion。

Phase 1 completed on: 2026-05-23

- [x] 將完整計畫保存為 `docs/google-drive-cloud-sync-plan.md`。
- [x] 計畫代號固定為 `SYNC-01`。
- [x] 記錄 `SYNC-01` 是 `XPLAT-01` 手動備份 / 還原之後的真正同步計畫。
- [x] 記錄 `XPLAT-01` 手動 backup/restore 仍保留為 fallback。
- [x] 記錄 `PAGES-01` 仍是唯一 mainline gate，且不因 `SYNC-01` 關閉。
- [x] 記錄 GitHub Pages live deployment 與手機端驗收仍需完成。
- [x] 記錄本計畫不授權任何 content promotion。
- [x] 記錄本計畫不修改 `data/vocab/*` production question/curriculum source files。
- [x] 記錄 V4 仍是 draft-only，不得啟用。
- [x] 記錄 production seed version 不因計畫階段改變。
- [x] 記錄 no-login / no-cloud-sync hard rule 的有限例外範圍。
- [x] 更新 `TO_AI.md`，讓 future handoff 知道 `SYNC-01` 已被使用者批准為 scoped future sync work。

Phase 2 started on: 2026-05-23

- [x] 核對 Phase 1 linkage：`docs/google-drive-cloud-sync-plan.md`、`docs/Future Plan.md`、`TO_AI.md`、README 與 handoff rules 已一致。
- [x] 新增 `docs/google-drive-oauth-setup.md`，保存 Google Cloud / OAuth personal testing 設定 checklist。
- [x] 在 OAuth setup checklist 記錄 required origins：Playwright `127.0.0.1:3000`、manual local `127.0.0.1:8787`、GitHub Pages origin `https://hn2820one-debug.github.io`。
- [x] 新增 `js/google-drive-sync-config.js`，以空 `clientId` 與 `isConfigured: false` 作為 disabled-safe placeholder。
- [x] 記錄 `drive.file` scope、Drive folder name、sync filename 與 token memory-only policy。
- [x] 記錄官方 Google Identity Services / Drive API 文件來源。
- [x] Settings 已覆蓋 Drive Sync 未設定狀態，以及 client ID 已設定但尚未連接時的 disconnected 狀態。
- [x] `tests/google-drive-sync.spec.ts` 覆蓋 configured client ID、no client secret、Settings disconnected controls、pre-token Drive API rejection 不載入 GIS script。
- [ ] 使用者在 Google Cloud Console 確認 project。
- [ ] 使用者啟用 Google Drive API。
- [ ] 使用者設定 OAuth consent screen / Google Auth Platform。
- [x] 使用者建立 Web OAuth Client ID 並填入 `js/google-drive-sync-config.js`；下載 JSON 內的 client secret 沒有複製到 repo。

Phase 3 started on: 2026-05-23

- [x] 新增 `js/google-drive-sync-client.js`，不改 build tooling，以 browser global 提供 Drive auth/API client。
- [x] `tracker.html` 載入 `js/google-drive-sync-config.js` 與 `js/google-drive-sync-client.js`。
- [x] Google Identity Services 只在 connect/token path 被要求時才載入；token 前 Drive API rejection 不載入外部 script。
- [x] Drive client 提供 connect / disconnect / in-memory token clear。
- [x] Drive client 提供 find/create sync folder、find/create sync file、download state、upload state 的 REST API methods。
- [x] Drive client 透過 status object 回報 unavailable / disconnected / connecting / connected / reconnect_required / error。
- [x] Settings 暴露初步 Drive Sync panel；full auto sync UX 已於 Phase 6 repo-side 開始。
- [x] 因新增 shipped JS assets，service worker cache 推進到 `toeic-vorb-v40`，並同步 Pages smoke expectation。
- [ ] 在 Drive API、OAuth consent/test-user access 與 local authorized origins 確認後，使用真實 Web OAuth Client ID 驗證 live Google authorization。

Phase 4 verified on: 2026-05-23

- [x] 新增 `js/google-drive-sync-data.js`，負責 sync payload build / validate / summary / local device ID。
- [x] Payload 固定包含 `sync_version`、`app_id`、`seed_version`、`updated_at`、`device_id`、`last_writer_device_id`、summary、learner stores 與 localStorage block。
- [x] `device_id` 使用 localStorage `toeic_vocab_drive_sync_device_id` 持久保存，不依賴 Google identity。
- [x] Learner stores 只包含 users/settings/lessons/vocab_items/attempts/sessions/error_logs/review_queue/exports/word_highlights。
- [x] Payload validator 禁止 `stores.questions`、`stores.curriculum`、`stores.question_edits`，避免 Drive sync 改寫 production source workflow。
- [x] Drive client 建立初始 sync file 時改用 P4 payload builder。
- [x] Drive client 下載 cloud state 後會先 validate，invalid state 不會被接受。
- [x] Drive client 上傳 sync state 前會先 validate payload，invalid state 不會寫入 Drive。
- [x] `tests/google-drive-sync.spec.ts` 補 payload shape、device ID persistence、validator rejection 覆蓋。
- [x] 因新增 shipped JS asset 並填入 Web OAuth client ID，service worker cache 曾推進到 `toeic-vorb-v42`。

Phase 5 verified on: 2026-05-23

- [x] 新增 `GoogleDriveSyncData.analyzeMerge(payload)`，可預覽 safe merge plan、seed mismatch warning、add/merge/skip/blocked totals。
- [x] 新增 `GoogleDriveSyncData.mergePayload(payload)`，只合併 learner records。
- [x] `attempts`、`sessions`、`error_logs`、`exports` 依 keyPath 去重，只新增本機缺少的 records。
- [x] `review_queue` 依 `review_id` 去重；相同 ID 保留較早 due/retry date、較高 priority / retry count、pending / repeated_error 等較安全狀態。
- [x] `vocab_items` 只合併 mastery/progress 欄位；本機不存在的 cloud vocab item 會 blocked，不匯入 seed metadata。
- [x] `lessons` 只合併 progress/status 欄位；本機不存在的 cloud lesson 會 blocked，不匯入 curriculum metadata。
- [x] `settings` 採本機優先；既有 settings 不被 cloud 覆蓋，`seed_version` / `course_id` 不匯入。
- [x] localStorage preferences 採本機優先，但可補入本機沒有的 cloud preference key。
- [x] `word_highlights` 依 `highlight_id` 或 fallback key 去重合併。
- [x] seed mismatch 只回傳 warning，不修改 production seed 或 `settings.seed_version`。
- [x] 同一份 cloud state 重複 merge 不會重複新增 attempts/sessions/error_logs/review_queue/word_highlights。
- [x] Settings `Sync now` 改為 download -> validate -> safe merge -> rebuild local payload -> upload merged state。
- [x] `tests/google-drive-sync.spec.ts` 覆蓋 idempotent merge、metadata preservation、seed mismatch warning、invalid payload 不改本機資料、invalid upload before Drive write。
- [x] 因 P5 shipped JS asset 變更，service worker cache 曾推進到 `toeic-vorb-v43`。

Phase 6 verified on: 2026-05-23

- [x] Settings Drive Sync panel 顯示 status、Drive folder、sync filename、token storage。
- [x] Settings 顯示 last successful sync、pending local changes、pending reasons。
- [x] Settings 新增 auto-sync enabled/paused toggle。
- [x] Settings 顯示背景同步限制：app 關閉時不執行，token 只在記憶體內保存，重開後需重新連接。
- [x] `GoogleDriveSyncData` 新增 auto-sync metadata helpers：enabled、pending count/reasons、last attempt、last success、last error。
- [x] 手動 `Sync now` 會記錄 attempt/success/failure metadata；成功 upload 後清除 pending markers。
- [x] auto sync 只在 enabled、browser online、Drive client connected、且有 memory token 時執行。
- [x] app start 會在 auto sync enabled 且 token valid 時排程 pull/merge/upload。
- [x] browser 回到 online 時，若有 pending changes 且 auto sync enabled，會排程 retry。
- [x] lesson completion、review completion、settings changes、word highlight changes 會標記 pending local changes 並在 connected 時排程 auto sync。
- [x] `tests/google-drive-sync.spec.ts` 覆蓋 Phase 6 Settings UX、pending markers、connected-only scheduler、upload 後清除 pending。
- [x] 因 P6 shipped JS asset 變更，service worker cache 推進到 `toeic-vorb-v44`。

Phase 7 verified on: 2026-05-23

- [x] retryable Drive API failure（`429` / `500` / `502` / `503` / `504`）會先做 backoff retry，不會立刻把 client 打成永久錯誤狀態。
- [x] `401` / `403` 會清掉 memory token，並把 Settings 狀態切到 reconnect required。
- [x] retryable 失敗會保留 pending local changes，讓 auto sync 可在後續 backoff 或重新連線後繼續重試。
- [x] 舊版 `sync_version` 會給 compatibility warning，未來不支援版本會在 merge 前被阻擋。
- [x] duplicate sync file 候選現在會優先選最新的 app-created 檔案，而不是任意第一個結果。
- [x] upload 前會先 re-read cloud `modifiedTime`；若準備期間雲端檔案變更，會安全 re-merge 一次後再重試 upload。
- [x] `tests/google-drive-sync.spec.ts` 新增 P7 failure-path 覆蓋：reconnect-required、retryable backoff、sync-version compatibility、duplicate file selection、upload conflict、one-shot re-merge。
- [x] 因 P7 shipped JS asset 變更，service worker cache 推進到 `toeic-vorb-v46`。

Blocked on: confirming Google Cloud project, Drive API enablement, OAuth consent/test-user access, adding the missing local authorized origins, and live browser authorization validation. Phase 8 acceptance tests remain open in `docs/google-drive-cloud-sync-plan.md`.

---

## 5) 文檔記錄 Checklist

### D-01 建立單一現況摘要來源
Priority: P0
重要性: 高
複雜度: 低

- [x] 定義哪些欄位屬於「現況真相」，例如 lessons、questions、seed_version、cache version。
- [x] 指定 `TO_AI.md` 為現況真相來源，其他活躍文件只可引用而不可各自發明新數字。
- [x] 盤點 `README`、`使用說明書`、`KNOWN_ISSUES`、`CURRICULUM_MAP` 是否存在獨立敘事。
- [x] 更新上述文件，使其引用或同步同一套現況數據。
- [x] 完成一次全域搜尋，確認活躍文件不再出現矛盾數字。
- [x] 在本文件記錄完成日期與最後檢查範圍。

Completed on: 2026-05-19
Last checked scope: `README.md`, `TO_AI.md`, `docs/使用說明書.md`, `docs/KNOWN_ISSUES.md`, `docs/CURRICULUM_MAP.md`, `docs/CHATGPT_ANALYSIS_PACKAGE.md`

### D-02 立即修正過期數字與版本
Priority: P0
重要性: 高
複雜度: 低

- [x] 盤點 repo 內所有過期 lesson/question/test/cache 數字。
- [x] 更新 `KNOWN_ISSUES`、`README`、`使用說明書`、其他活躍文件的過期值。
- [x] 更新明顯過期的 cache 版本、E2E 測試數量、舊 lesson/question 統計描述。
- [x] 完成後全域搜尋 `193`、`4399`、`toeic-vorb-v8` 等高風險舊值。
- [x] 確認剩餘出現的舊數字只存在於封存區或歷史記錄中。
- [x] 將本次清理結果簡述回填到本文件。

Cleanup note: 已把 `KNOWN_ISSUES.md` 的 production counts 與 Playwright 測試數量更新為現況，並把 `CURRICULUM_MAP.md`、`CHATGPT_ANALYSIS_PACKAGE.md` 明確標成歷史快照，避免再被當成 current production truth。

### D-03 測試敘事分離：production-empty vs fixture-seeded
Priority: P0
重要性: 高
複雜度: 中

- [x] 定義哪些測試屬於 production-empty 現況，哪些屬於 seeded-fixture 模式。
- [x] 更新測試命名或測試檔結構，讓兩種敘事清楚分開。
- [x] 更新 seed helper 與測試資料，避免 production-empty 測試偷偷依賴舊題庫數字。
- [x] 更新測試相關文檔或註解，說明兩套測試的用途。
- [x] 執行一次完整測試，確認 empty 與 seeded 都能正確表達預期。
- [x] 將拆分完成後的規則回寫本文件與必要說明文件。

Resolved note (2026-05-20): 先前 `npm run test:all` 與單獨執行 `tests/seeded-ui-regression.spec.ts --grep "partial V0 diagnostic reports insufficient data"` 會在 Windows 上因 Playwright download artifact 路徑讀取發生 `EPERM` 而失敗，位置在 `tests/seeded-ui-regression.spec.ts` 的下載 JSON 斷言。現已改為與既有下載測試一致的 retry 讀取模式，單測、整份 `tests/seeded-ui-regression.spec.ts` 與 `npm run test:all` 均已重新通過。

### D-04 使用說明書加上清空題庫警示
Priority: P1
重要性: 中高
複雜度: 低

- [x] 在 `使用說明書` 開頭加入目前為 empty production seed 的醒目說明。
- [x] 補充「為什麼課程是空的」與「接下來看哪份文件」的 FAQ。
- [x] 確認使用說明中的操作流程不再暗示有可立即開始的正式課程。
- [x] 補充對 export / backup 的提醒，避免使用者誤以為資料會永久存在。
- [x] 檢查文件中的頁面說明是否仍與目前 UI 相符。
- [x] 完成後請另一個角度重新閱讀一次，確認不會再被舊計劃誤導。

### D-05 建立文檔一致性檢查腳本
Priority: P1
重要性: 中高
複雜度: 中

- [x] 列出腳本需要比對的檔案與欄位。
- [x] 實作檢查腳本，至少覆蓋 seed_version、cache name、lesson count、question count。
- [x] 在 `package.json` 加入可直接執行的命令。
- [x] 在文件中說明腳本使用方式與預期輸出。
- [x] 至少執行一次真實檢查並修正發現的不一致項。
- [x] 規定未來重要文件變更後需執行此腳本。

Completed on: 2026-05-19
Script: `scripts/check-doc-consistency.js`
Command: `npm run test:docs`
Checked scope: `seed_version` across the three required seed files, `sw.js` cache name, production lesson count, question-bank row count, vocab item count, and manifest question-file count in active docs (`TO_AI.md`, `README.md`, `docs/使用說明書.md`, `docs/KNOWN_ISSUES.md`). The script intentionally ignores `docs/backups/**`.

### D-06 建立 Seed 變更標準模板
Priority: P2
重要性: 中
複雜度: 中

- [x] 建立 seed 變更紀錄模板，至少包含變更項、原因、受影響檔案、驗證結果、回滾方式。
- [x] 定義每次 seed 變更必須同步更新的檔案清單。
- [x] 在模板中加入驗證命令清單與簽核欄位。
- [x] 把模板位置與使用規則寫入本文件與必要說明文件。
- [x] 用一個實際或示範 seed 變更案例試填一次模板。
- [x] 完成後規定後續 seed 變更不得跳過此模板。

Completed on: 2026-05-20
Decision: 新增 `docs/templates/seed-change-record-template.md` 與 `docs/seed-changes/example-seed-change-record.md`，把 seed 變更紀錄固定成正式流程。之後每次 production seed 變更都必須先複製模板到 `docs/seed-changes/YYYY-MM-DD-{new-seed-version}.md`，完整記錄三個必同步的 seed version 檔案、受影響資料檔、驗證命令、回滾方式與簽核結果；`TO_AI.md`、`README.md`、`docs/question-creation-spec.md`、`docs/question-bank-source-of-truth-workflow.md` 也同步加入不得跳過此模板的規則。

### D-07 整合 40 條出題品質規則到 spec
Priority: P1
重要性: 高
複雜度: 中

- [x] 盤點 `docs/question-creation-spec.md` 目前已覆蓋與未覆蓋的規則範圍。
- [x] 把詞彙 / 搭配詞、題幹設計、誘答心理、系統規範四大類規則整合進既有 spec，而不是平行另開一份規格。
- [x] 明確標示哪些規則是目前 production schema 已支援，哪些是 authoring rule，哪些是未來系統能力方向。
- [x] 更新 AI prompt template、distractor checklist、human review 重點，使新增規則能直接被作者與審核者執行。
- [x] 避免把尚未實作的 runtime 能力誤寫成既成事實。
- [x] 完成後執行文檔檢查並把整合結果回寫本文件。

Completed on: 2026-05-20
Decision: 將 40 條規則整合進 `docs/question-creation-spec.md` 的既有骨架，而不是另開平行規格。新增 `1.7 High-reliability authoring rules` 四大分組，涵蓋詞彙 / 搭配詞選擇、題幹設計、誘答心理與系統治理；同時把 `§4` 擴充為作者檢查清單、把 AI prompt template 加入高可靠規則與 schema honesty 提示，並把 human review gate 補上高頻詞彙、polysemy / phrasal verb / connector / degree adverb、target irreplaceability、tag completeness 與 distractor rationale 等審核點。對於尚未實作的能力（例如前端動態洗牌、學習者爭議回報按鈕、結構化逐一誘答欄位），spec 已明確標成現況限制或未來方向，避免把未上線功能寫成既成事實。

### D-08 建立 AI 精簡 prompt 並擴充 audit 自動檢查
Priority: P1
重要性: 高
複雜度: 中

- [x] 從 `docs/question-creation-spec.md` 萃取一版專門給 AI 出題用的精簡 prompt，降低貼給模型時的噪音。
- [x] 把目前可機器檢查的新增規則落入既有 audit script，而不是另開平行檢查器。
- [x] 明確區分 blocking issue、warning 與仍需人工判斷的規則。
- [x] 補上對應 audit 測試，避免新規則只寫進腳本但沒有回歸保護。
- [x] 在 spec 中指出精簡 prompt 模板位置與新增 audit 覆蓋範圍。
- [x] 完成後執行 audit / docs 驗證並把結果回寫本文件。

Completed on: 2026-05-20
Decision: 將 AI 專用精簡 prompt 落在 `docs/templates/ai-question-authoring-prompt.md`，讓日常貼給模型的版本與完整 spec 分流；完整政策仍以 `docs/question-creation-spec.md` 為準。audit 端則延伸既有 `scripts/audit-quality-full.js`，新增兩個 blocking 檢查（forbidden shortcut options、duplicate option text）與兩個 warning 檢查（preferred stem length、blank-position concentration），並由 `scripts/test-audit-quality.js` 加入 fixture 覆蓋。同步在 `question-creation-spec.md` 的 audit matrix 記錄新自動檢查範圍，避免規則只存在於文檔或只存在於程式其中一邊。驗證結果：`npm run test:audit` 通過，`npm run test:docs` 通過。

### D-09 根據庫存報告建立 100+ task 題庫建設藍圖
Priority: P1
重要性: 高
複雜度: 中

- [x] 根據 `docs/REPO_COURSEWARE_INVENTORY_2026-05-20.md` 重新整理 production / draft / rebuild / archive 的內容分布。
- [x] 把規劃重心由「從零產題」改為「優先 promotion 現有高價值 rebuild / draft stock」。
- [x] 定義未來題庫建設的階段順序、品質門檻、release gate 與風險控制原則。
- [x] 產出至少 100 個可直接勾選的 tasks / checklist，而不是只有方向性建議。
- [x] 在藍圖中明確區分 production stabilization、V2/V3 wave promotion、V4 decision gate、V5/V6 scaffold、QA automation、human review 與 release operations。
- [x] 把藍圖位置回填到本文件，供之後選定下一個 execution block。

Completed on: 2026-05-20
Decision: 已新增 `docs/QUESTION_BANK_BUILD_BLUEPRINT_2026-05-20.md` 作為附屬執行藍圖。該文件以 inventory 結果為基礎，承認目前真正瓶頸不是 repo 內沒有內容，而是 live production promotion 太少，因此把優先順序定為：先擴大 V2 production wave、再轉化 `drafts/collocation-rebuild/` 的 V3 rebuild stock、持續隔離 V4 draft、最後才啟動 V5/V6。藍圖共拆成 12 個 workstreams、120 個具體 checklist tasks，可作為後續新增 block 時的來源池。

### D-10 建立 inventory refresh / monthly reporting 流程
Priority: P1
重要性: 中高
複雜度: 中
Execution position: Step 2 / immediately after first multi-lesson production wave lands

- [x] 定義 inventory refresh 的固定節奏，至少區分「每次 production wave 後必更新」與「每月固定快照」兩種時點。
- [x] 固定 inventory 報告必須輸出的核心指標：production / draft / rebuild / archive 四桶、artifact rows、unique IDs、live share、warning debt。
- [x] 建立 inventory refresh 的標準掃描流程或命令，避免每次重新手算 repo 內容分布。
- [x] 規定每次 inventory 數字變動後，需要同步檢查 `TO_AI.md`、`docs/Future Plan.md` 與其他 current-truth docs 是否要更新。
- [x] 定義 inventory 報告的命名、覆寫與封存規則，避免活躍區堆積多份互相矛盾的快照。
- [x] 至少完成一次真實 refresh cycle，驗證新流程能在 production wave 變更後快速重建完整統計。

Completed on: 2026-05-20
Decision: 新增 `scripts/generate-courseware-inventory.js` 與 `npm run report:inventory` 作為固定 refresh 命令，並以它重建 `docs/REPO_COURSEWARE_INVENTORY_2026-05-20.md` 完成第一個真實 refresh cycle。固定節奏為：每次 production wave 後立即重跑一次，且即使當月沒有 production promotion 也至少每月重跑一次。固定輸出指標包含四桶（production / draft / rebuild / archive）、artifact rows、unique IDs、live share 與 current warning debt。每次 inventory 數字變動後必須同步檢查 `TO_AI.md`、本文件與其他 current-truth docs。命名與覆寫規則固定為 `docs/REPO_COURSEWARE_INVENTORY_YYYY-MM-DD.md`；同日重跑覆寫同日快照，新日期建立新快照，舊日期保留作歷史證據。

### D-11 建立題庫建設治理規則（T001-T010）
Priority: P0
重要性: 高
複雜度: 低

- [x] 確認未來 90 天的題庫建設主目標是擴大 validated production waves，而不是堆積未上線草稿。
- [x] 固定 production / draft / rebuild / archive 四桶定義，並說明哪些資料夾不計入 courseware inventory。
- [x] 規定 blueprint tasks 只是來源池，後續執行前必須映射到 `docs/Future Plan.md` 的正式 block。
- [x] 固定 lesson、draft pack、export review cycle、wave retrospective、seed version、seed-change record 與 inventory snapshot 的命名規則。
- [x] 建立每週 governance checkpoint，檢查 production warnings、rebuild candidates、docs drift、V4 isolation 與 validation freshness。
- [x] 定義 authoring owner、human review owner、release validation owner 三種角色與最小輸出。
- [x] 固定 production wave、draft/rebuild wave、governance task 的 Definition of Done。
- [x] 定義 promotion candidate 與 reference-only artifact 的分界。
- [x] 建立 P0 / P1 / P2 / P3 / P4 優先級規則。
- [x] 決定目前 production seed waves 上限為每月最多 2 次、每波最多 3 個 core lessons，直到 production 至少 10 runnable lessons 且連續兩次 release gate 乾淨通過後再重估。

Completed on: 2026-05-20
Decision: 新增 `docs/question-bank-build-governance.md` 作為 T001-T010 的正式治理文件，並在 `docs/QUESTION_BANK_BUILD_BLUEPRINT_2026-05-20.md` 將 T001-T010 勾選完成。治理結論是：未來 90 天以「受控 production expansion」為主，優先推進 V2/V3 validated waves；`production` 僅指 `data/vocab/` manifest 實際載入內容，`draft` / `rebuild` / `archive` 不得混算為 live content；所有後續題庫工作都必須先有 `Future Plan` block；production waves 必須保留命名、角色、human review、seed-change record、validation、export-review follow-up 與 rollback 紀錄；在 production 未達 10 課且連續兩次 release gate 無新增 blocking issue 前，每月最多 2 次 production seed waves、每波最多 3 個 core lessons。

---

## 6) 已完成 Gate Milestones（歷史）

說明：Gate A-C 都已完成，保留作為歷史里程碑；未來實際執行順序以第 2 節主執行順序為準。

### Gate A (Week 1-2): 一致性止血
- [x] 完成 U-01 主導覽資訊架構一致化。
- [x] 完成 U-02 空狀態下一步行動重寫。
- [x] 完成 C-02 speed_drill 時限單一真相。
- [x] 完成 D-01 單一現況摘要來源整理。
- [x] 完成 D-02 過期數字與版本清理。

### Gate B (Week 3-6): 測試與流程雙軌
- [x] 完成 D-03 測試敘事分離。
- [x] 完成 C-04 V0 診斷資料量門檻。
- [x] 完成 U-05 Stage Gate 無資料文案。
- [x] 完成 D-04 使用說明書清空題庫警示。
- [x] 完成 D-05 文檔一致性檢查腳本。

### Gate C (Week 7-12): 內容重建治理
- [x] 完成 C-03 重建波次最小上線標準。
- [x] 完成 C-05 每題型最小可用包。
- [x] 完成 C-06 匯出分析反饋內容治理流程。
- [x] 完成 U-06 清空模式 Banner。
- [x] 完成 D-06 Seed 變更標準模板。
- [x] 完成 D-11 題庫建設治理規則（T001-T010）。
- [x] 完成 C-12 production baseline smoke checklist（T018-T020）。

---

## 7) 進度更新格式

每次更新本文件時，建議沿用以下格式，避免進度混亂：

- Last updated by:
- Last updated on:
- Current focus:
- Newly completed:
- Blocked on:
- Next target:

---

## 8) 參考文件

活躍參考文件：
- TO_AI.md（唯一現況真相）
- docs/question-bank-build-governance.md（題庫建設治理規則）
- docs/production-baseline-smoke-checklist.md（production baseline smoke 與 T011-T020 狀態）
- docs/question-creation-spec.md（題目生成與審核規格）
- docs/使用說明書.md（使用者導向文件）
- docs/KNOWN_ISSUES.md（風險與技術債）

封存文件：
- docs/backups/plans/2026-05-19/

規則：封存文件只可作歷史參考，不可作為後續更新依據。
