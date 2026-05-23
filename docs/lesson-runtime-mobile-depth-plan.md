# Lesson Runtime Mobile Depth Plan

更新日期：2026-05-23  
計畫代號：`MOBILE-DEPTH-01`  
範圍：Program B 手機長時間學習體驗優化（以 Lesson runtime 為主，延伸到 Review、Mastery、恢復、安全、效能與驗收）

## Goal

把 Program B 從「手機可用」提升到「適合長時間手機學習」。完成本計畫後，使用者應能在手機上更穩定地開始課程、持續答題、處理中斷、快速回到進度、完成複習、看懂回饋、承受低網路 / 舊快取 / sync pending 狀態，並在真機上維持單手可操作、低摩擦、低疲勞的學習節奏。

## Current Baseline

- `PAGES-01` 已完成；GitHub Pages live URL、手機 baseline、`clear-sw.html`、Settings、Export 與最小 mobile smoke 已驗證。
- `tests/lesson-flow.spec.ts` 已有第一個 `390x844` Lesson runtime mobile probe，可從開始課程一路跑到完成課程，並檢查沒有整頁 horizontal overflow。
- 本計畫不取代 local-first 架構，也不授權任何內容 promotion。

## Constraints

- 維持 Program B local-first PWA；不可新增 backend。
- 不新增 build tooling，不改 deployment model。
- 不修改 `data/vocab/*` production seed、lesson content、question content，除非之後有獨立 content task。
- 不啟用 V4，不動 `drafts/v4/`。
- 不把桌面體驗打碎；手機優化必須與既有桌面流程共存。
- `SYNC-01` 仍是附屬 portability/sync 能力，不得反過來主導 lesson runtime 流程。

## 10 Phases / 120 Checkpoints

### Phase 1 — Baseline, Scenarios, And Success Metrics

- [x] MDEP-01-01 盤點正式支援的手機 viewport：`360x780`、`375x812`、`390x844`、`412x915`、`430x932`。
- [x] MDEP-01-02 定義 portrait 為主、landscape 為 fallback 的手機 lesson 支援政策。
- [x] MDEP-01-03 建立 lesson runtime 狀態矩陣：未開始、作答中、已確認待前進、摘要、已暫停、離線、重開恢復、review session。
- [x] MDEP-01-04 建立單手操作 thumb-zone 地圖，區分主要 CTA、次要 CTA、危險操作。
- [x] MDEP-01-05 定義手機 lesson 主要按鈕最小可點擊尺寸與最小間距規格。
- [x] MDEP-01-06 定義題目文字、選項文字、timer、hint 的最小可讀字級與行高規格。
- [x] MDEP-01-07 定義手機 lesson 的 page-level horizontal overflow 必須為 0 的強制規則。
- [x] MDEP-01-08 定義題目切換、確認答案、回饋切換的可接受互動延遲預算。
- [x] MDEP-01-09 定義中斷恢復成功標準：重開頁面後可回到原題或摘要，不遺失已確認答案。
- [x] MDEP-01-10 定義低網路、離線、sync pending、stale cache 四種手機風險情境。
- [x] MDEP-01-11 盤點現有 Playwright mobile 覆蓋缺口，列出必補狀態而不是只看 happy path。
- [x] MDEP-01-12 把本計畫連回 `docs/Future Plan.md`、`docs/pages-mobile-experience-plan.md`、`TO_AI.md`。

Completed on: 2026-05-23
Result record: `docs/lesson-runtime-mobile-phase-1-baseline-2026-05-23.md`
Decision: Phase 1 已固定手機 lesson 的支援 viewport、orientation policy、狀態矩陣、thumb-zone / 觸控 / 字級規格、overflow 強制規則、互動延遲預算、中斷恢復成功標準、風險情境矩陣與目前 mobile Playwright 覆蓋缺口。後續第一輪實作直接按 Phase 2、Phase 3、Phase 4、Phase 6、Phase 10 推進。

### Phase 2 — Entry, Launch, And Pre-Lesson Framing

- [x] MDEP-02-01 稽核 Today → 開始課程 的手機啟動路徑，記錄額外點擊與不必要捲動。（`tests/lesson-flow.spec.ts` 覆蓋 390x844 Today direct launch）
- [x] MDEP-02-02 稽核 Roadmap → 開始課程 的手機啟動路徑，確認不依賴桌面寬度。（`tests/lesson-flow.spec.ts` 覆蓋 390x844 Roadmap direct launch）
- [x] MDEP-02-03 定義手機版「開始目前課程」主 CTA 的視覺層級與位置規則。
- [x] MDEP-02-04 定義開始前課程摘要卡要保留哪些資訊，避免 metadata 過多導致首屏擁擠。
- [x] MDEP-02-05 定義 lesson 啟動 loading skeleton，避免白屏或 layout jump。
- [x] MDEP-02-06 定義 resume 與 fresh start 的差異文案，避免使用者誤以為進度遺失。
- [x] MDEP-02-07 定義本機優先、sync pending、offline 三種狀態在開課前的提示優先序。
- [x] MDEP-02-08 定義「返回首頁」在 lesson 前頁的可見性與不干擾原則。
- [ ] MDEP-02-09 定義首次使用 lesson runtime 的手機教學提示，限制顯示次數與關閉規則。（保留產品決策：目前不新增教學彈窗，避免增加手機首屏負擔）
- [x] MDEP-02-10 定義沒有可開始課程、只有 review queue、或資料不足時的手機入口文案。
- [x] MDEP-02-11 定義 lesson 啟動前的 safe-area padding 與頂部資訊條高度上限。
- [ ] MDEP-02-12 補 manual checklist：單手啟動、站立場景、地鐵場景、短時段學習場景。

Started on: 2026-05-23
Improved on: 2026-05-23
Current progress: `renderLesson()` 的 pre-start slice 已升級成手機友善的 start panel，固定主 CTA 優先序為「開始目前課程」→「選擇課程」→「返回首頁」，開始前摘要卡固定保留題數 / 預估時長 / 保存方式，並加入 local-first / pending sync / offline 的優先提示。2026-05-23 review 已補上 tracker 初始 loading skeleton、resume vs 重新開始文案、Today/Roadmap 手機啟動路徑 Playwright、empty/review-only lesson 文案與 safe-area 狀態記錄。剩餘只有 first-use coach mark 是否需要與人工通勤/站立情境 checklist。

### Phase 3 — Reading Layout, Content Density, And Visual Stability

- [x] MDEP-03-01 定義 runtime header 在手機的層級：lesson id、title、timers 哪些保留、哪些縮短。
- [x] MDEP-03-02 定義 step chips 在手機上的滾動、截斷、wrap 或縮寫規則。
- [x] MDEP-03-03 定義題目區塊與上方 header 的間距，避免首題被擠到首屏以下。
- [x] MDEP-03-04 定義 question text 的最大可讀行長與中英文混排規則。
- [x] MDEP-03-05 定義選項卡片內字數很長時的換行、對齊與最小高度規格。
- [x] MDEP-03-06 定義 question guidance 顯示策略，避免在手機首屏佔掉過多垂直空間。
- [x] MDEP-03-07 定義 keyboard hint 在手機上的顯示條件，避免無關資訊長期佔位。
- [x] MDEP-03-08 定義 highlight panel 在手機 runtime 的位置與折疊策略。
- [x] MDEP-03-09 定義底部 runtime actions 與主要答題區的距離，避免誤把次要按鈕當主要流程。
- [x] MDEP-03-10 定義題目切換前後 scroll anchoring 規則，避免每題跳到不可預期位置。
- [x] MDEP-03-11 定義 landscape fallback：不保證最佳，但必須可讀、可答、可離開。
- [x] MDEP-03-12 補針對長題幹、長選項、長中文說明的手機 overflow 稽核樣本。

Started on: 2026-05-23  
Current progress: 手機閱讀區已收斂：`question-text` 設 `65ch` 與斷行規則、選項 `overflow-wrap`、header/question 間距壓縮、`word-highlight-details` 預設收合、action tray 與確認列分離、`resetLessonRuntimeScroll()` 接到題目切換。`tests/lesson-flow.spec.ts` 新增 overflow、landscape 與強化 reading probe。

### Phase 4 — Answer Input, One-Hand Ergonomics, And Control Hierarchy

- [x] MDEP-04-01 稽核四個答案按鈕在手機上的點擊面積是否一致。
- [x] MDEP-04-02 定義 selected 狀態在手機戶外亮度下仍可辨識的對比與邊框規格。
- [x] MDEP-04-03 定義「確認答案」作為唯一主 CTA 的位置優先序。
- [x] MDEP-04-04 定義「略過 / 下一題」在未確認答案前的風險提示與次要化策略。
- [x] MDEP-04-05 定義「上一題」在手機上的存在必要性與可見時機。
- [x] MDEP-04-06 定義「暫停」與「離開」在手機上的危險操作隔離方式。
- [x] MDEP-04-07 加入防止連點或誤觸連續提交的互動規格。
- [x] MDEP-04-08 定義點選答案後到 UI 回應的延遲上限與視覺回饋要求。
- [x] MDEP-04-09 定義 disabled 狀態在手機上的可讀性，避免看起來像壞掉。
- [x] MDEP-04-10 定義 review session、normal lesson、speed drill 在手機上的控制差異是否要顯式提示。
- [x] MDEP-04-11 定義 speed drill 在手機上是否需要更大的選項面積或更少視覺噪音。
- [x] MDEP-04-12 定義 web 無法穩定提供 haptic 時的視覺替代回饋。

Started on: 2026-05-23  
Current progress: 手機 `860px` 以下：action tray、全寬確認 CTA、60px 答案列與 selected 對比；首題隱藏「上一題」、`confirmingAnswer` 防連點、`:active` 即時回饋、dashed disabled 樣式、`runtime-mode-badge` 與 speed 模式精簡控制。`tests/lesson-flow.spec.ts` 新增 controls probe。

### Phase 5 — Feedback, Transition, And Momentum Preservation

- [x] MDEP-05-01 定義正確 / 錯誤回饋在手機上的最短可理解資訊組合。
- [x] MDEP-05-02 定義 explanation、target item、中文義、例句的優先順序與折疊策略。
- [x] MDEP-05-03 定義 feedback 首屏要先顯示什麼，避免全部資訊一次壓上來。
- [x] MDEP-05-04 定義「下一題」與「查看摘要」兩個流向的手機 CTA 穩定位置。
- [x] MDEP-05-05 定義確認後 question timer 鎖定的視覺表達，讓使用者知道時間已停止。
- [x] MDEP-05-06 定義從 feedback 回到下一題時的 scroll reset 規則。
- [x] MDEP-05-07 定義微小 momentum 回饋，例如已完成題數、連續作答、剩餘題數。
- [x] MDEP-05-08 定義過場動畫或 state transition 的時間上限，避免手機上顯得拖慢。
- [x] MDEP-05-09 定義回饋頁面在長內容時的可掃讀結構，而不是一整塊文字。
- [x] MDEP-05-10 定義完成課程前的 summary 卡在手機首屏要保留哪些資訊。
- [x] MDEP-05-11 定義錯題安排 CTA 在手機上的順序，避免錯把次要選項當主流程。
- [x] MDEP-05-12 補 finish → error review scheduling → Mistakes 入口的手機流程驗收。

Started on: 2026-05-23  
Current progress: Phase 5 完成：`feedback-panel-enter`（≤300ms）、`finish-panel` 手機摘要、`error-review` 主 CTA 置頂、finish→Mistakes 手機 probe。`tests/lesson-flow.spec.ts` 新增 finish / transition 驗收。

### Phase 6 — Pause, Interruptions, Resume, And Recovery Safety

- [x] MDEP-06-01 建立來電、切背景、鎖屏、切 app、瀏覽器重整、PWA 喚回等中斷情境矩陣。
- [x] MDEP-06-02 定義手機上「暫停」後的首屏訊息，讓使用者明白計時與儲存狀態。
- [x] MDEP-06-03 定義 resume 後 timer、pendingAnswer、已確認答案三者的恢復規則。
- [x] MDEP-06-04 定義頁面重開時 lesson session 的回復優先序與保底文案。

Started on: 2026-05-23  
Current progress: `lesson-paused-alert`、`session.pending_answer`、`lesson-resume-banner`、`lesson-resume-entry` + `resumeLesson()`、`runtime-local-note`、手機離開 `confirm()`。Playwright 改用 `gotoSeededTracker()` 避免 production seed 卡住。矩陣見 `docs/lesson-runtime-mobile-phase-6-interruptions-2026-05-23.md`。
- [~] MDEP-06-05 定義 PWA 模式與一般瀏覽器模式下的 resume 差異驗收。（policy 在 phase-6 doc；真機 PWA 待簽）
- [x] MDEP-06-06 定義離線中斷後回來時的 lesson 狀態提示，不可讓使用者以為答題沒存到。
- [x] MDEP-06-07 定義 sync pending 與 lesson 儲存成功的區分，避免誤會「未同步 = 未保存」。
- [~] MDEP-06-08 定義低電量或省電模式下 lesson runtime 應避免的高成本行為。（已透過 defer Drive sync + 500ms timer 實作；省電模式真機待補）
- [x] MDEP-06-09 定義「離開課程」前的手機確認規則，避免誤觸直接丟失上下文。
- [x] MDEP-06-10 定義 abandon 後再次回來的入口與文案，不要讓使用者迷路。
- [x] MDEP-06-11 驗證 Settings 的「清除目前課程續作」在手機上可安全觸發且不會誤按。
- [~] MDEP-06-12 補真機中斷恢復 checklist：Chrome Android、Safari iPhone、PWA installed 狀態。（矩陣在 phase-6/9/10 docs；勾選待人工）

### Phase 7 — Review Mode, Micro-Sessions, And Long-Term Phone Learning

- [x] MDEP-07-01 定義 3–5 分鐘微型學習 session 的入口，不必每次都走完整課程心智負擔。
- [x] MDEP-07-02 定義 Today 的 due review 在手機上的 quick-start 入口與文案。
- [x] MDEP-07-03 定義 Mistakes 頁面在手機上的篩選、排序、分段資訊層級。
- [x] MDEP-07-04 定義 review queue 長度與優先級資訊在手機上的壓縮顯示方式。
- [x] MDEP-07-05 定義 review session 完成後的微型摘要卡，而不是沿用完整 lesson summary。
- [x] MDEP-07-06 定義 repeated-error 項目在手機上是否需要專屬聚焦模式。
- [x] MDEP-07-07 定義 review session 中斷後再進入的 resume 策略。
- [x] MDEP-07-08 定義新課與複習課在手機上的切換成本，要避免來回跳頁太深。
- [x] MDEP-07-09 定義「先做幾題再離開」的輕量流程，不要求一次清完整課。
- [x] MDEP-07-10 定義手機 review 的建議 chunk size，避免一口氣 20 題造成疲勞。
- [x] MDEP-07-11 定義錯題回顧裡從記錄回到題目背景資訊的最低需求。
- [x] MDEP-07-12 補 review queue → review lesson → completion 的手機 Playwright 與真機驗收路徑。

Started on: 2026-05-23  
Current progress: Phase 7 完成：`review-repeated-focus`、`review-partial-exit-hint`、`wrong-attempt-context`、手機 chunk 完成 → `review-mini-summary` Playwright。

### Phase 8 — Progress, Motivation, And Post-Lesson Mobile Surfaces

- [x] MDEP-08-01 稽核 Today 在手機上的進度卡密度，避免資訊太多但仍要保留可決策性。
- [x] MDEP-08-02 定義開課前 lesson goal、預估時長、困難度在手機上的顯示方式。
- [x] MDEP-08-03 定義 lesson 內 progress bar / answered count 在手機上的穩定位置。
- [x] MDEP-08-04 定義完成課程後首屏 recap，優先顯示哪些最有用的手機學習訊號。
- [x] MDEP-08-05 定義精熟度變化是否要在手機 lesson 結束後即時提示。
- [x] MDEP-08-06 定義 due review count 在 lesson 結束後如何帶出下一步，而不是把使用者扔回首頁。
- [x] MDEP-08-07 定義 Stage Seal Readiness 在手機上的可掃讀表現，不可像桌面表格縮小版。
- [x] MDEP-08-08 定義 daily target / 今日進度在手機上的激勵程度，避免形成壓力 UI。
- [x] MDEP-08-09 定義微型成就回饋的節制原則，避免影響專注。
- [x] MDEP-08-10 定義 session 結束時 sync/backup 成功訊息的顯示級別，不蓋過學習回饋。
- [x] MDEP-08-11 定義 lesson → Mastery / Mistakes / Today 的手機回流路徑。
- [x] MDEP-08-12 補 post-lesson mobile flow 驗收：完成課程後 30 秒內能清楚知道下一步。

Started on: 2026-05-23  
Current progress: Phase 8 完成：`today-daily-progress` 柔和文案、`today-milestone-note` 節制、`micro-feedback-subtle`。

### Phase 9 — Performance, Battery, Offline, Install, And Sync-Aware Behavior

- [x] MDEP-09-01 定義低階手機 lesson 首屏渲染與題目切換的效能預算。
- [x] MDEP-09-02 盤點 lesson runtime 會造成 layout shift 的元素，逐一標記風險來源。
- [x] MDEP-09-03 稽核 timer 更新是否造成不必要 reflow 或視覺抖動。
- [x] MDEP-09-04 定義手機 lesson 在字體載入延遲下的 fallback 體驗。
- [x] MDEP-09-05 定義 active lesson 期間 service worker 更新提示的安全策略。
- [x] MDEP-09-06 定義 active lesson 期間若發生 sync pending / reconnect required，訊息不能打斷答題。
- [x] MDEP-09-07 定義完全離線時哪些手機學習流程仍必須可用。
- [x] MDEP-09-08 定義從 stale cache 修復頁回到 lesson 的保底路徑。
- [x] MDEP-09-09 定義安裝式 PWA 模式與一般 tab 模式的 safe-area / browser chrome 差異。
- [x] MDEP-09-10 定義 lesson 完成後才處理的非即時工作，避免答題中塞入重成本操作。
- [x] MDEP-09-11 定義 sync unavailable 時的 local-only 成功文案，避免使用者誤會資料未保存。
- [x] MDEP-09-12 補低網路 / 離線 / sync pending / cache repair 的手機真機驗收矩陣。

Started on: 2026-05-23  
Current progress: `runtime-status-pill`、`sw-update-banner`（課程中不顯示）、`deferDriveSyncUntilLessonEnd`、timer 500ms + tabular-nums、CLS min-height、safe-area、`prefers-reduced-motion`。矩陣見 `docs/lesson-runtime-mobile-phase-9-connectivity-2026-05-23.md`；`tests/mobile-runtime-guard.spec.ts`。

### Phase 10 — Accessibility, Personalization, QA, And Release Gate

- [x] MDEP-10-01 定義手機 lesson 的文字放大支援範圍，避免字一放大就爆版。
- [x] MDEP-10-02 定義 reduced motion 模式在手機上的過場與提示替代方案。
- [x] MDEP-10-03 稽核答題狀態、正誤回饋、disabled state 的對比度是否足夠。
- [x] MDEP-10-04 定義手機 lesson 的 screen reader 朗讀順序與語意結構。
- [x] MDEP-10-05 定義外接鍵盤 / 藍牙鍵盤在手機上是否維持可用且不干擾觸控。
- [x] MDEP-10-06 評估左手模式或單手模式是否需要專屬排列切換。
- [x] MDEP-10-07 評估 Screen Wake Lock 或等價策略是否值得做成 opt-in 手機功能。
- [x] MDEP-10-08 定義個人化選項：大字、緊湊、低動態、低干擾模式的範圍。
- [x] MDEP-10-09 擴充 Playwright mobile suite，覆蓋 start、answer、feedback、pause、resume、finish、review、offline 提示等狀態。
- [x] MDEP-10-10 建立真機驗收清單：Android Chrome、iPhone Safari、installed PWA、弱網路、切背景恢復。
- [x] MDEP-10-11 定義 release gate：本計畫完成前，哪些 checkpoint 必須全綠才算可宣告手機深度體驗上線。
- [x] MDEP-10-12 定義 rollback 原則：若某一輪手機優化破壞 desktop 或 lesson safety，回退哪些改動層。

Started on: 2026-05-23  
Current progress: Settings `settings-mobile-learning`（大字 / 減動態 / 低干擾）、ARIA 語意、對比度 CSS、手機清除續作 confirm。`tests/mobile-accessibility.spec.ts`、`tests/mobile-viewport-matrix.spec.ts`。Release gate：`docs/lesson-runtime-mobile-release-gate-2026-05-23.md`。

## Acceptance Checklist

- [x] 10 個 phase 至少完成第一輪優先 tranche，且核心 lesson flow 不回歸。
- [x] `390x844`、`412x915`、`430x932` 至少各有一條完整手機答題覆蓋（`mobile-viewport-matrix.spec.ts` smoke）。
- [x] 手機上開始課程、作答、確認、回饋、完成、複習入口都可單手完成（Playwright 覆蓋）。
- [x] 中斷恢復、離線、sync pending、stale cache repair 都有清楚路徑。
- [x] 主要手機學習頁面沒有 page-level horizontal overflow。
- [x] Lesson runtime、Review、Today、Mistakes 的手機資訊層級可掃讀。
- [x] `npm run test:all` 維持通過（release 前跑一次）。
- [ ] 真機驗收至少覆蓋 Android Chrome 與 iPhone Safari。

## First Tranche Recommendation

先做 Phase 2、Phase 3、Phase 4、Phase 6、Phase 10 的第一輪核心 checkpoint，因為它們最直接影響手機長時間學習時的摩擦：開始課程是否順手、題目是否易讀、確認答案是否穩定、中斷後能否安全回來，以及手機專屬 QA 是否有足夠保護。

## Audit & next steps (2026-05-23)

- Phase 1-10 review: `docs/lesson-runtime-mobile-phase-1-10-review-2026-05-23.md`
- Full phase audit: `docs/lesson-runtime-mobile-audit-2026-05-23.md`
- Recommended follow-up: `docs/lesson-runtime-mobile-next-plan-2026-05-23.md`
- Release gate: `docs/lesson-runtime-mobile-release-gate-2026-05-23.md`
