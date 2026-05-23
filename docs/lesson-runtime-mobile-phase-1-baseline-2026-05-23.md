# Lesson Runtime Mobile Phase 1 Baseline

更新日期：2026-05-23  
計畫代號：`MOBILE-DEPTH-01`  
對應階段：Phase 1 — Baseline, Scenarios, And Success Metrics

## Purpose

這份記錄把 `MOBILE-DEPTH-01` Phase 1 的 12 個 checkpoint 轉成可執行基線：定義正式手機支援範圍、lesson runtime 狀態矩陣、控制層級、字級與觸控規格、互動延遲預算、中斷恢復成功標準，以及目前自動化覆蓋缺口。

## Evidence Base

- `playwright.config.ts`：目前全域 Playwright project 仍是 desktop Chromium；手機 viewport 由 spec 個別設定。
- `tests/pages-subpath-routing.spec.ts`：已覆蓋 `390x844` 的 launcher、shell、Settings、Export、manifest、repair flow。
- `tests/lesson-flow.spec.ts`：已覆蓋 `390x844` 的完整 lesson flow 與 page-level horizontal overflow 檢查。
- `tests/google-drive-sync.spec.ts`：已覆蓋 `390x844` 的 Settings Drive Sync 操作。
- `tests/google-drive-backup.spec.ts`：已覆蓋 `390x844` 的 Export backup/import 操作。
- `tests/ui-regression.spec.ts`：已有 desktop/mobile 對照的 advanced tools entry 檢查。
- `tests/review-mode.spec.ts`：目前只有 desktop-style review flow，沒有專屬手機 probe。
- `js/views/lesson.js`：目前 lesson runtime 的主要結構是 `.runtime-shell`、`.runtime-head`、`.question-panel`、`.confirm-answer-row`、`.runtime-actions`，並已有 `paused`、`review`、`finish` 等狀態分支。

## Decisions

### MDEP-01-01 正式手機 viewport inventory

支援分級採兩層：

- Tier A / 首輪 release gate viewport：`390x844`、`412x915`、`430x932`
- Tier B / 窄寬相容 viewport：`360x780`、`375x812`

理由：`390x844` 已有 lesson probe；`412x915`、`430x932` 對應較常見的大手機；`360x780`、`375x812` 則是窄寬壓力測試。Phase 1 先定義支援清單，後續 Phase 10 release gate 再要求至少 `390x844`、`412x915`、`430x932` 各有一條完整手機答題覆蓋。

### MDEP-01-02 portrait / landscape policy

- Portrait 是正式主路徑，所有 lesson runtime 主要驗收都以 portrait 為準。
- Landscape 是 fallback，不追求最佳排版，但必須滿足可讀、可答、可暫停、可離開、不可 page-level overflow。
- 若 landscape 與 portrait 規格衝突，優先保護 portrait 的學習效率與控制穩定性。

### MDEP-01-03 lesson runtime state matrix

| State | Trigger | 必須保留的資訊 | 備註 |
|---|---|---|---|
| `prestart` | 進入 lesson tab、尚未開始課程 | lesson id、title、resume / start CTA | 開課前資訊不可過度擁擠 |
| `active_question` | 題目顯示、未確認答案 | current index、question text、options、timers | 主答題狀態 |
| `selected_pending_confirm` | 已選答案、未按確認 | pending answer、confirm CTA enable | 確認前不得儲存 attempts |
| `feedback_locked` | 已確認答案、等待前進 | locked answer、correctness、feedback、next CTA | question timer 已停止 |
| `finish_summary` | 最後一題完成後 | answered total、finish CTA | `finish-panel` |
| `paused` | 使用者按暫停或中斷恢復前 | current index、saved answers、pause notice | `session.paused` 驅動 |
| `review_runtime` | review queue 啟動 | review filter、review ids、queue mode | finish CTA 是 `完成複習` |
| `speed_runtime` | speed drill 題型 | click-to-answer flow、target time | 不走 confirm button |
| `resume_recovered` | reload / reopen 後回到 lesson | current index、saved answers、mode、lesson id | 屬恢復成功結果，不是獨立視覺模式 |
| `offline_local_only` | offline / sync unavailable | local save success、non-blocking warning | 不可阻擋答題 |

### MDEP-01-04 thumb-zone map

- Zone A / 主拇指區：畫面下半部中央到偏右，保留給 `確認答案`、`下一題`、`完成課程` 這些主 CTA。
- Zone B / 次要操作區：底部 actions strip，保留給 `上一題`、`略過 / 下一題`、`暫停`。
- Zone C / 危險操作區：`離開`、未來的 abandon / clear-resume 類操作要與主 CTA 分離，優先放在最不易誤觸的位置。
- Zone D / 低頻資訊區：runtime header、chips、timer、sync/offline 提示維持在上半部，不可與主答題區搶觸控資源。

### MDEP-01-05 觸控尺寸與間距規格

- 主 CTA 最小尺寸：`min-height: 52px`，建議寬度填滿可用欄寬。
- 次要 CTA 最小尺寸：`min-height: 48px`。
- 答案按鈕最小尺寸：`min-height: 56px`，因為它是高頻連續操作元件。
- 控件最小間距：垂直 `10px`，水平 `8px`。
- 危險操作與主 CTA 之間要至少有一個明顯間距層或視覺分組。

### MDEP-01-06 手機 lesson 字級與行高最低規格

- 題目文字：最小 `18px / 1.55`。
- 選項文字：最小 `17px / 1.45`。
- explanation / 中文義 / 例句：最小 `16px / 1.55`。
- timer 與 question meta：最小 `14px / 1.35`。
- muted hint / keyboard hint：最小 `13px / 1.4`，且手機上可視情況折疊或隱藏。

### MDEP-01-07 page-level horizontal overflow 強制規則

- `document.documentElement.scrollWidth` 不得超過 `clientWidth + 1`。
- 允許局部橫向捲動的元件必須是白名單，例如未來若 step chips 必須可橫滑，該捲動必須被包在元件內，不可造成整頁 overflow。
- 任何新手機優化若重新引入 page-level overflow，視為 release-blocking regression。

### MDEP-01-08 互動延遲預算

| Action | 預算 | 說明 |
|---|---:|---|
| 點選答案到 selected state | 100ms 內 | 必須立即給視覺回饋 |
| 點選 `確認答案` 到 feedback 顯示 | 300ms 內 | local-first，不應等待網路 |
| 點選 `下一題` 到下一題可互動 | 250ms 內 | 不含大段動畫 |
| 點選 `暫停` / `繼續` 到狀態切換 | 250ms 內 | 需要清楚 pause notice |
| 點選 `完成課程` 到 summary / error review scheduling | 500ms 內 | 可接受一次較重計算 |
| reload / reopen 後 lesson 恢復 | 1500ms 內 | 超過則需顯示恢復中狀態 |

### MDEP-01-09 中斷恢復成功標準

恢復成功必須同時滿足以下條件：

- 已確認答案不遺失。
- `current_index` 回到正確題目或正確 summary/finish 狀態。
- `lesson_id`、mode、review filter 不錯置。
- 使用者能分辨現在是恢復續作，不是被重置成新課。
- 若只有 sync 失敗但 local save 成功，文案必須說清楚是「未同步」而不是「未保存」。

### MDEP-01-10 手機風險情境矩陣

- 低網路：lesson runtime 必須維持 local-only 答題，不等待網路 round trip。
- 離線：local save 必須成功，warning 不能遮住主答題流程。
- sync pending：只可作狀態提示，不得在答題中插入重連流程。
- stale cache：保留 `clear-sw.html` 作修復入口，但 active lesson 期間不主動打斷答題。

### MDEP-01-11 目前 Playwright mobile 覆蓋與缺口

現有覆蓋：

- `tests/pages-subpath-routing.spec.ts`：launcher / shell / Settings / Export / manifest / repair。
- `tests/google-drive-sync.spec.ts`：Settings sync controls at `390x844`。
- `tests/google-drive-backup.spec.ts`：Export backup/import at `390x844`。
- `tests/ui-regression.spec.ts`：desktop/mobile advanced tools 對照。
- `tests/lesson-flow.spec.ts`：`390x844` full lesson happy path。

明確缺口：

- `412x915`、`430x932` 尚未有完整 lesson probe。
- `360x780`、`375x812` 尚未有窄寬壓力測試。
- pause / resume / reload recovery 尚未有手機 probe。
- `上一題`、`略過 / 下一題`、`離開` 的手機風險路徑尚未有專屬覆蓋。
- feedback 長內容與 finish scheduling 的手機可掃讀性尚未有專屬覆蓋。
- review mode 沒有手機 probe。
- landscape、offline、sync pending、stale cache during lesson、accessibility 尚未有手機覆蓋。

### MDEP-01-12 active docs linkage

2026-05-23 已完成以下連結：

- `docs/Future Plan.md`：已把 `MOBILE-DEPTH-01` 掛入下一個主線。
- `docs/pages-mobile-experience-plan.md`：已把後續主線導向 `docs/lesson-runtime-mobile-depth-plan.md`。
- `TO_AI.md`：已記錄手機深度體驗工作已開始，且第一個 `390x844` lesson probe 已通過。

## Result

Phase 1 已完成。後續實作以這份基線作為判準，下一輪直接進入 Phase 2、Phase 3、Phase 4、Phase 6、Phase 10 的第一輪核心 tranche。