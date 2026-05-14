# TO_AI — 程式設計優化計劃書

**版本：** 4.0  
**建立日期：** 2026-05-14（v2.0）；v3.0 深度審查：2026-05-14；v4.0 實作更新：2026-05-14  
**適用程式：** TOEIC Vocabulary Tracker（Program B）  
**路徑：** `C:\Users\Keith\Toeic\toeic-app-Vorb`  
**撰寫目的：** 全面審查程式碼架構、學習內容、資料模型、UI/UX，識別所有待解決問題，並輸出有優先順序的優化計劃。

---

## 1. 程式深度理解摘要

### 1.1 技術架構

| 層次 | 現狀 |
|------|------|
| 類型 | 靜態 PWA，無框架，無建置步驟 |
| 語言 | 純 HTML / CSS / JavaScript (ES2020，ES Modules) |
| 主要儲存 | IndexedDB (`toeic_vocab_tracker_db`, v1) |
| 次要儲存 | localStorage (`toeic_vocab_tracker_preferences`, `toeic_vocab_active_session`) |
| 離線支援 | Service Worker (`sw.js`, stale-while-revalidate) |
| 題庫規模 | 70 課 / 1,968 題 (V0: 10 課, V1 A–F: 60 課) |
| 學習目標 | TOEIC 570 → 750，單字 / Word Family 為核心 |

### 1.2 JS 模組職責

| 模組 | 職責 |
|------|------|
| `vocab-scoring.js` | 掌握度分數計算、速度桶分類、日期工具、CSV 輸出（IIFE，全域掛載） |
| `vocab-db.js` | IndexedDB 封裝、種子資料載入、localStorage 偏好設定（IIFE，全域掛載） |
| `js/state.js` | 共用狀態、utility 函數、`loadData()`（ES Module，export） |
| `js/vocab-tracker.js` | 主協調器：Shell 渲染、計時器、路由、鍵盤監聽、`window.VocabTracker` 公開 API |
| `js/views/today.js` | Today / 週儀表板視圖（含 Next Action 可點擊按鈕） |
| `js/views/roadmap.js` | 課程路線圖視圖 |
| `js/views/lesson.js` | 課程執行引擎（含即時反饋面板、mastery-adaptive 題目順序） |
| `js/views/mistakes.js` | 錯誤複習佇列、Session Error Review（含 grammar_link 面板） |
| `js/views/mastery.js` | 詞彙掌握度儀表板（含 mastery_level 篩選） |
| `js/views/export.js` | 多格式匯出（CSV、JSON、Markdown、JSONL；export 時全量取 attempts） |
| `js/views/bank.js` | Question Bank 管理（搜尋、分頁、編輯、匯入、Seed JSON 匯出） |
| `js/views/settings.js` | 使用者設定、課程狀態管理 |

### 1.3 IndexedDB 儲存結構

| Store | 主鍵 | 用途 |
|-------|------|------|
| `users` | `user_id` | 使用者資料 |
| `settings` | `key` | Seed 版本、course_id |
| `curriculum` | `course_id` | 課程元資料與階段定義 |
| `lessons` | `lesson_id` | 70 堂課的狀態與題目清單 |
| `questions` | `question_id` | 1,968 道題目 |
| `vocab_items` | `item_id` | 每個詞彙項目的掌握度紀錄 |
| `attempts` | `attempt_id` | 每次作答紀錄（永久累積；dashboard 載入 300 筆，export 全量） |
| `sessions` | `session_id` | 每堂課的結束摘要 |
| `error_logs` | `error_log_id` | 確認後的錯誤分類 |
| `review_queue` | `review_id` | 待複習的弱點項目 |
| `exports` | `export_id` | 匯出紀錄 |

### 1.4 共用狀態物件（js/state.js）

```javascript
export const state = {
  view, curriculum, user, lessons, questions, vocabItems,
  attempts, sessions, errorLogs, reviewQueue, prefs,
  activeSession, isFinishing,
  runtimeQuestions, currentQuestionKey, questionStartedAt,
  reviewSessionId, selectedQuestionId,
  bankFilters: { stage, lesson_id, type, error_code },
  tickId,
  showFeedback,      // P1-1：作答後反饋面板開關
  bankPage,          // P2-2：Question Bank 分頁
  masteryFilter: { level },  // P2-3：Mastery 篩選
  grammarLinks       // P3-2：grammar_links.json 快取（啟動時載入）
};
```

### 1.5 課程執行流程（含即時反饋）

```
startLesson()
  └─ prepareRuntime() → buildRuntimeQuestions()
       └─ review + core 各按 mastery_score 升序排列（blind/weak 優先）
           步驟分配（greedy take）:
           previous_review → new_vocabulary → pattern_focus → toeic_practice

answerCurrent(letter)
  ├─ 計算 responseTime
  ├─ put("attempts", attempt)
  ├─ updateItemMastery() → put("vocab_items", item)
  ├─ saveActiveSession（current_index 不自動推進）
  └─ state.showFeedback = true → renderLesson() 顯示反饋面板

renderLesson() 反饋面板（P1-1）:
  ├─ 顯示 ✓/✗ banner（綠/紅）
  ├─ 所有選項按鈕：正確答案標綠、錯誤選項標紅（disabled）
  ├─ explanation_zh 顯示
  └─ "Next Question →" / "See Summary →" 按鈕

advanceAfterFeedback()
  ├─ showFeedback = false
  ├─ current_index 推進至下一未答題（nextUnansweredIndex）
  └─ callRender()

finishLesson()
  ├─ isFinishing guard（try/finally 保護）
  ├─ 計算正確率 → status (completed / completed_with_reinforcement / needs_retake)
  ├─ put("sessions", sessionRecord)
  ├─ put("lessons", { ...lesson, status })
  ├─ upsertReviewQueue() (如果未過關)
  └─ 跳至 Mistakes 視圖做 Session Error Review
```

### 1.6 掌握度計算公式（vocab-scoring.js）

```
masteryScore = accuracyScore (0–50) + speedScore (0–25) + stabilityScore (0–15) + recencyScore (0–10)

masteryLevel: blind (0–39) → weak (40–59) → unstable (60–74) → stable (75–84) → mastered (85+)

stable → mastered 條件:
  consecutiveFastCorrect >= 3 AND masteryScore >= 75 → stable
  stable + stable_review_sessions >= 2 → mastered
```

### 1.7 grammar_links.json（data/vocab/grammar_links.json）

目前共 14 個 grammar_link_id（V1 原生 11 個 + V2/V3 預備 3 個）：

| ID | 說明 |
|----|------|
| `ADJ_AFTER_BE` | be 動詞後接形容詞 |
| `ADJ_AFTER_LINKING_VERB` | 連繫動詞後接形容詞 |
| `ADJ_BEFORE_NOUN` | 形容詞修飾名詞（定語） |
| `ADV_MODIFIES_VERB` | 副詞修飾動詞 |
| `SVC_LINKING_VERB_ADJ` | 主詞 + 連繫動詞 + 形容詞補語 |
| `WORD_FAMILY_NOUN_ADJ` | 名詞 vs. 形容詞辨析 |
| `WORD_FAMILY_NOUN_ADJ_ADV` | 名詞 / 形容詞 / 副詞三選一 |
| `WORD_FAMILY_NOUN_USAGE` | 名詞形式辨析 |
| `WORD_FAMILY_NOUN_VERB` | 名詞 vs. 動詞辨析 |
| `WORD_FAMILY_VERB_NOUN` | 動詞 vs. 名詞辨析 |
| `WORD_FAMILY_VERB_NOUN_ADJ` | 動詞 / 名詞 / 形容詞三選一 |
| `SCENE_VOCAB_CONTEXT` | TOEIC 情境詞彙（V2 預備） |
| `COLLOCATION_VERB_NOUN` | 動詞 + 名詞固定搭配（V2 預備） |
| `PART6_CONTEXT_COLLOCATION` | Part 6 上下文搭配（V3 預備） |

### 1.8 公開 API（window.VocabTracker）

```javascript
advanceAfterFeedback, answerCurrent, changeLessonStatus, clearActiveSession,
closeSessionReview, confirmSessionErrors, deleteSelectedQuestion, downloadExportFile,
downloadSeedJson, exitLesson, exportPackage, exportQuestions, finishLesson,
importQuestions, init, loadMoreBankQuestions, markQueueDone, newQuestionTemplate,
nextQuestion, previousQuestion, saveQuestionFromEditor, saveSettings, selectQuestion,
setBankFilter, setMasteryFilter, setView, showValidation, startLesson, togglePause
```

**鍵盤快捷鍵**（課程進行中，非 input/textarea/select 時）：
- `A` / `B` / `C` / `D` 或 `1` / `2` / `3` / `4` → 選答
- `Enter` / `Space` → 反饋面板時前進下一題

---

## 2. 已完成項目彙整（截至 v4.0）

| 編號 | 項目 | 完成版本 |
|------|------|----------|
| BUG-001 | stable_review_sessions 遞增邏輯 | v3.0 確認已修 |
| BUG-002 | finishLesson isFinishing guard | v3.0 確認已修 |
| BUG-003 | 硬編碼本機路徑 | v3.0 確認已修 |
| P0-1 | finishLesson try/finally 保護 | v3.0 |
| P0-2 | seedIfNeeded 合併邏輯修正（進度欄位保留策略） | v3.0 |
| P0-3 | getQuestionsForLesson N+1 消除（getAll + Set 過濾） | v3.0 |
| P1-1 | **作答後即時反饋**（✓/✗ banner + 正確選項標綠 + explanation_zh + 按鍵繼續） | v4.0 |
| P1-3 | **Today 視圖 Next Action 可點擊**（review/retake/start 各對應主要行動按鈕） | v4.0 |
| P1-5 | SW stale-while-revalidate | v3.0 確認已完成 |
| P2-1 | **鍵盤快捷鍵**（A–D / 1–4 選答；Enter/Space 確認反饋） | v4.0 |
| P2-2 | **Question Bank Load More 分頁**（每頁 120 筆；篩選時重置頁碼） | v4.0 |
| P2-3 | **Mastery 視圖 mastery_level 篩選**（含各 level 計數下拉選單） | v4.0 |
| P3-1 | export 時全量取 attempts（exportPackage 暫換 state.attempts） | v3.0 確認已完成 |
| P3-2 | **grammar_link_id 查找表**（14 條記錄；Error Review 可折疊語法面板） | v4.0 |
| P3-3 | **mastery-adaptive 題目選取**（buildRuntimeQuestions 按 mastery_score 升序） | v4.0 |
| P3-1（dup） | P4-2 Seed JSON 匯出 | v3.0 |
| P4-1 | 模組拆分（state.js + 8 views） | v3.0 |
| P4-3 | Playwright 測試（lesson-flow + export-flow，2/2 passing） | v3.0 |

---

## 3. 仍待解決的問題

### 3.1 學習體驗缺口（最影響教育效果）

#### L-002：review_queue 是死清單（最大學習缺口）
**問題：** 答錯的題目被加入 `review_queue`，但只有「Done」按鈕標記完成，沒有實際練習機會。  
**後果：** 弱點詞彙得不到針對性練習，SRS 系統形同虛設。  
**改善方向：** Mistakes 視圖加入「Start Review Session」按鈕，從 pending items 取出最多 10–15 題，以現有 lesson runtime 模式執行。需在 `startLesson()` 中支援傳入自定義 question_ids（不依賴 lesson_id）。

#### L-004：vocab_items 富格式內容未呈現
**問題：** `vocab_items.json` 中每個詞彙有 `chinese`（中文釋義）、`example`（TOEIC 例句）、`variants`（詞形變體）、`common_wrong_forms`、`toeic_contexts`，但 UI 中完全未顯示。  
**改善方向：** Error Review 卡片加入 chinese 釋義 + variants + example；或加入獨立的「Vocabulary Card」視圖。

#### L-006：next_review_date 計算但不行動
**問題：** `updateItemMastery()` 計算 `next_review_date` 存入 IDB，但系統不使用此日期推薦或排程複習。  
**改善方向：** Today 視圖加入「Due for Review」計數器，並在到期時優先顯示於 Next Action。

---

### 3.2 資料與效能

#### D-001：attempts 長期累積無上限
**現狀：** Dashboard 載入 300 筆，export 全量。但 `attempts` store 無清理策略。  
**建議：** 設定選項「保留最近 N 天 attempt 記錄」。

#### D-002：DB_VERSION 升級路徑未測試
**建議：** 加入模擬升級腳本，V2+ 新 store 時先在 scripts/ 驗證。

---

### 3.3 內容

#### C-001：V2–V6 內容缺失
**狀況：** `grammar_links.json` 已預備 `SCENE_VOCAB_CONTEXT`、`COLLOCATION_VERB_NOUN`、`PART6_CONTEXT_COLLOCATION`，顯示 V2/V3 開發已在進行中。V2 Scene Vocabulary 和 V3 Collocation 題庫尚未建立。

#### C-002：V1-A 語意審核
**問題：** 部分 Word Family 題目語境仍不自然，待人工逐一審核。

---

### 3.4 待實作功能

#### F-001：掌握度公式 fixture 測試（P2-4）
**建議：** 在 `scripts/test-scoring.js` 為 `calculateMasteryScore()` 撰寫 Node.js 輸入/輸出測試集，驗證邊界情況。

---

## 4. 優化計劃 — 剩餘優先順序

### 優先級 P1（剩餘）：學習體驗核心改善

| 編號 | 項目 | 涉及檔案 | 工作量 |
|------|------|----------|--------|
| P1-2 | **複習課程執行引擎** — Mistakes 視圖加「Start Review Session」，從 pending review_queue 取題，走現有 lesson runtime；`startLesson()` 需支援傳入自定義 question_ids | `views/mistakes.js`, `views/lesson.js` | 大 |
| P1-4 | **vocab_items 富格式資料呈現** — Error Review 卡片加入 chinese 釋義 + variants + example；Mastery 視圖加詞形變體欄 | `views/mistakes.js`, `views/mastery.js` | 中 |

---

### 優先級 P2（剩餘）：UI/UX 改善

| 編號 | 項目 | 涉及檔案 | 工作量 |
|------|------|----------|--------|
| P2-4 | **掌握度公式 fixture 測試** — 為 `calculateMasteryScore()` 撰寫 Node.js 輸入/輸出測試集 | `scripts/test-scoring.js` | 中 |

---

### 優先級 P3（剩餘）：資料與效能

| 編號 | 項目 | 涉及檔案 | 工作量 |
|------|------|----------|--------|
| P3-4 | **V1-A 語意審核** — 逐一檢視仍有語境問題的 Word Family 題目 | `data/vocab/questions_v1a.json` | 中（內容） |

---

### 優先級 P4：內容擴展

| 編號 | 項目 | 涉及檔案 | 工作量 |
|------|------|----------|--------|
| P4-1 | **V2 TOEIC Scene Vocabulary** — 50 課，辦公室 / 物流 / 人事 / 財務情境詞彙，`scene_vocabulary` 題型為主 | 新增 `data/vocab/questions_v2*.json` | 極大 |
| P4-2 | **V3 Collocation** — 60 課，TOEIC 常見動詞-名詞搭配，`collocation` / `part6_context_choice` 為主 | 新增 `data/vocab/questions_v3*.json` | 極大 |

---

## 5. 當前 App 狀態總表（截至 v4.0）

| 區域 | 狀態 | 備注 |
|------|------|------|
| 課程執行引擎 | ✅ 完整 | try/finally 保護；seed 合併邏輯正確 |
| 掌握度計算 | ✅ 邏輯正確 | stable_review_sessions 正確遞增；公式未有 fixture 測試 |
| 即時作答反饋 | ✅ 完成 | 綠/紅 banner + 答案著色 + explanation_zh + 鍵盤 Enter 繼續 |
| mastery-adaptive 題目 | ✅ 完成 | buildRuntimeQuestions 按 mastery_score 升序，blind/weak 優先 |
| Today Next Action | ✅ 完成 | review/retake/start 各對應主要行動按鈕 |
| 鍵盤快捷鍵 | ✅ 完成 | A–D / 1–4 選答；Enter/Space 確認反饋 |
| 複習課程引擎 | ❌ 缺失 | review_queue 是死清單（最大剩餘缺口） |
| 錯誤複習佇列 | ⚠️ 部分 | 佇列建立正常；grammar 面板已加；無法實際練習 |
| Grammar Link 面板 | ✅ 完成 | Error Review 中可折疊語法說明（14 條記錄） |
| vocab_items 富格式 | ❌ 未呈現 | chinese / example / variants 存在但 UI 不顯示（P1-4） |
| Question Bank | ✅ 完整 | 搜尋 / Load More 分頁 / 編輯 / Seed 匯出 |
| Mastery 視圖 | ✅ 含篩選 | mastery_level 下拉篩選，含各 level 計數 |
| 匯出功能 | ✅ 完整 | export 時全量取 attempts；個別檔案 + Seed JSON |
| Service Worker | ✅ 完成 | stale-while-revalidate |
| Playwright 測試 | ✅ 通過 | 2/2 passing（含反饋面板流程） |
| V0 內容 | ✅ 完成 | 10 課診斷題 |
| V1 內容 | ✅ 完成 | 60 課，0 duplicate warnings |
| V2–V6 內容 | 🔄 進行中 | grammar_links.json 已預備 V2/V3 語法點 |

---

## 6. 建議執行順序（剩餘工作）

```
第一輪（最高教育效益）：
  P1-2 複習課程執行引擎（解決 review_queue 是死清單的問題）
  P1-4 vocab_items 富格式呈現（chinese + variants + example）

第二輪（內容擴展）：
  P4-1 V2 Scene Vocabulary 開發
  P4-2 V3 Collocation 開發
  （開發時在 grammar_links.json 新增對應語法點）

第三輪（資料品質）：
  P2-4 掌握度公式 fixture 測試
  P3-4 V1-A 語意審核

長期：
  V4 Formal Phrase / V5 False Friends / V6 Speed Drill
```

---

## 7. 給下一位 AI 的說明

本計劃書由 Claude Sonnet 4.6 於 2026-05-14 更新為 v4.0。

**當前最高優先行動：**

1. **P1-2 複習課程引擎** — 整個 SRS 系統的最後一塊拼圖。review_queue 有 pending items，但使用者無法實際練習。需要：
   - `startLesson()` 或新函數 `startReviewSession(questionIds)` 支援傳入自定義題目清單（繞過 lesson_id 查找）
   - Mistakes 視圖加「Start Review Session」按鈕，從 `pending` review_queue 取最多 15 題
   - Review session 結束後，把成功複習的 items 標為 `done`

2. **P1-4 vocab_items 富格式** — 資料都在 IDB 中（`state.vocabItems`），只需在 `renderSessionErrorReview()` 的 error 卡片和 `renderMastery()` 中顯示 `item.chinese`、`item.example`、`item.variants`。

**開發注意事項：**
- `vocab-scoring.js` 和 `vocab-db.js` 是 IIFE，掛載在 `window.VocabScoring` / `window.VocabDB`；`views/` 是 ES Module。不要混用。
- `state.showFeedback` 控制反饋面板顯示；`advanceAfterFeedback()` 負責推進 `current_index`。
- `buildRuntimeQuestions()` 現在按 `mastery_score` 升序排列 core/review，盲點詞彙優先。
- Playwright 測試在 `tests/`，`lesson-flow.spec.ts` 已更新為點擊「Next Question →」反饋按鈕。
- Question Bank 有 `state.bankPage` 控制分頁；`setBankFilter()` 時自動重置為第 0 頁。
- `state.grammarLinks` 在 init() 時從 `data/vocab/grammar_links.json` 載入；新增 V2/V3 語法點只需更新該 JSON 檔。
- SEED_VERSION 更改後，所有使用者下次開啟時重新 seed（現有 question 內容欄位由 seed 覆蓋，進度欄位保留）。
