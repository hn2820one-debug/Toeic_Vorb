# TO_AI — 程式設計優化計劃書

**版本：** 8.0  
**建立日期：** 2026-05-14（v2.0）；v3.0 深度審查：2026-05-14；v4.0 實作更新：2026-05-14；v5.0 現況更新：2026-05-15；v6.0 內容品質修正：2026-05-16；v7.0 V3 詞彙項目內容填入：2026-05-17；**v8.0 全題庫品質大整改 + 規格文件化：2026-05-17**  
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
| 離線支援 | Service Worker (`sw.js`, `toeic-vorb-v4`, stale-while-revalidate) |
| 題庫規模 | **193 課 / 4,399 題**（V0: 1 課 31 題, V1 A–F: 60 課 1,728 題, V2 A–E+MR: 60 課 1,200 題, V3 A–F+MR: 72 課 1,440 題） |
| 詞彙項目 | 494 個（word_family 42 + diagnostic_vocab 12 + scene_vocabulary 200 + collocation 240） |
| 學習目標 | TOEIC 570 → 750，單字 / Word Family / Collocation 為核心 |
| 種子版本 | `toeic_vocab_tracker_quality_fixed_2026_05_17` |
| 重複題數 | **0**（v8.0 全清；原有 826 個重複 stem） |
| 品質審核 | `node scripts/audit-quality-full.js` → `✅ PASSED`（0 issues） |

### 1.2 JS 模組職責

| 模組 | 職責 |
|------|------|
| `vocab-scoring.js` | 掌握度分數計算、速度桶分類、日期工具、CSV 輸出（IIFE，全域掛載） |
| `vocab-db.js` | IndexedDB 封裝、種子資料載入、localStorage 偏好設定（IIFE，全域掛載） |
| `js/state.js` | 共用狀態、utility 函數、`loadData()`（ES Module，export） |
| `js/vocab-tracker.js` | 主協調器：Shell 渲染、計時器、路由、鍵盤監聽、`window.VocabTracker` 公開 API |
| `js/views/today.js` | Today / 週儀表板視圖（含 Next Action 可點擊按鈕） |
| `js/views/roadmap.js` | 課程路線圖視圖 |
| `js/views/lesson.js` | 課程執行引擎（含即時反饋面板、mastery-adaptive 題目順序、Review Mode） |
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
| `lessons` | `lesson_id` | 193 堂課的狀態與題目清單 |
| `questions` | `question_id` | 4,399 道題目 |
| `vocab_items` | `item_id` | 每個詞彙項目的掌握度紀錄 |
| `attempts` | `attempt_id` | 每次作答紀錄（永久累積；dashboard 載入 300 筆，export 全量） |
| `sessions` | `session_id` | 每堂課的結束摘要 |
| `error_logs` | `error_log_id` | 確認後的錯誤分類 |
| `review_queue` | `review_id` | 待複習的弱點項目（Review Mode 使用） |
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
  showFeedback,      // 作答後反饋面板開關
  bankPage,          // Question Bank 分頁
  masteryFilter: { level },  // Mastery 篩選
  grammarLinks       // grammar_links.json 快取（啟動時載入）
};
```

### 1.5 課程執行流程（含即時反饋 + Review Mode）

```
startLesson()
  └─ prepareRuntime() → buildRuntimeQuestions()
       └─ review + core 各按 mastery_score 升序排列（blind/weak 優先）
           步驟分配（greedy take）:
           previous_review → new_vocabulary → pattern_focus → toeic_practice

[Review Mode] startLesson(REVIEW_LESSON_ID, filter)
  └─ 從 review_queue 取 pending items（due/high_priority/repeated/all）
       最多 20 題，mode: "review_queue"
       Queue entry 結果：fixed / still_weak / repeated_error

answerCurrent(letter)
  ├─ 計算 responseTime
  ├─ put("attempts", attempt)
  ├─ updateItemMastery() → put("vocab_items", item)
  ├─ saveActiveSession（current_index 不自動推進）
  └─ state.showFeedback = true → renderLesson() 顯示反饋面板

renderLesson() 反饋面板:
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
| `SCENE_VOCAB_CONTEXT` | TOEIC 情境詞彙（V2） |
| `COLLOCATION_VERB_NOUN` | 動詞 + 名詞固定搭配（V3） |
| `PART6_CONTEXT_COLLOCATION` | Part 6 上下文搭配（V3） |

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

## 2. 已完成項目彙整（截至 v5.0）

| 編號 | 項目 | 完成版本 |
|------|------|----------|
| BUG-001 | stable_review_sessions 遞增邏輯 | v3.0 |
| BUG-002 | finishLesson isFinishing guard | v3.0 |
| BUG-003 | 硬編碼本機路徑 | v3.0 |
| P0-1 | finishLesson try/finally 保護 | v3.0 |
| P0-2 | seedIfNeeded 合併邏輯修正（進度欄位保留策略） | v3.0 |
| P0-3 | getQuestionsForLesson N+1 消除（getAll + Set 過濾） | v3.0 |
| P1-1 | 作答後即時反饋（✓/✗ banner + 正確選項標綠 + explanation_zh + 按鍵繼續） | v4.0 |
| P1-2 | **Review Mode 完整實作**（dedicated queue runtime、mode:"review_queue"、fixed/still_weak/repeated_error、export review_effectiveness.csv） | v5.0 |
| P1-3 | Today 視圖 Next Action 可點擊（review/retake/start 各對應主要行動按鈕） | v4.0 |
| P1-5 | SW stale-while-revalidate | v3.0 |
| P2-1 | 鍵盤快捷鍵（A–D / 1–4 選答；Enter/Space 確認反饋） | v4.0 |
| P2-2 | Question Bank Load More 分頁（每頁 120 筆；篩選時重置頁碼） | v4.0 |
| P2-3 | Mastery 視圖 mastery_level 篩選（含各 level 計數下拉選單） | v4.0 |
| P3-1 | export 時全量取 attempts（exportPackage 暫換 state.attempts） | v3.0 |
| P3-2 | grammar_link_id 查找表（14 條記錄；Error Review 可折疊語法面板） | v4.0 |
| P3-3 | mastery-adaptive 題目選取（buildRuntimeQuestions 按 mastery_score 升序） | v4.0 |
| P4-1 | **V2 TOEIC Scene Vocabulary 完整實作**（50 課，V2-A～V2-E，1,200 題） | v5.0 |
| P4-2 | **V3 Collocation 完整實作**（60 課，V3-A～V3-F，1,440 題） | v5.0 |
| P4-3 | Playwright 測試（lesson-flow + export-flow + V2/V3 seed 驗證，3/3 passing） | v5.0 |
| — | Content validation v2（scripts/validate-vocab-data.js，0 duplicate，0 missing field） | v5.0 |
| — | Export review_effectiveness.csv | v5.0 |
| Q-001b | **V2 定義嵌入題幹完整修正** — 1,000 題（83.3%）→ **0 題（0%）**；新增 `scripts/rewrite-v2-definitions.js`，含 200 詞彙項目的 SENTENCE_BANK；Email: 型題保留，其餘 5 類全部改寫為真實 TOEIC 情境句 | v6.0 |
| Q-002a | **V0 選項長度偏差改善** — 整體 75%（180/240）→ **48.8%（117/240）**；meaning_choice 100%→40%，review_question 100%→38%，false_friend 100%→0%；新增 `scripts/rewrite-v0-option-bias.js`；3 個單字選項改為 4-7 字的近義定義短語 | v6.0 |
| Q-001c-partial | **V3 跨課模板重複消除** — 5 個模板 ×20 次（跨 4 課共用 "office task" 主題）→ **0 個模板 >10 次**；V3-A-122/123/124 各自獲得獨立主題（document review / staff coordination / client briefing）；最高重複上限降至 ×5（單課內設計性重複，正常）；新增 `scripts/rewrite-v3-stem-topics.js` | v6.0 |
| — | **V1 選項偏差確認為結構性假象** — 48.7% 偏差來自 word family 四個選項本身 {accurate/accuracy=8, accurately/inaccuracy=10} 的長度對稱，rank-1 理論期望值就是 50%；邊際差距 ≤5 字的題共 490 題，>5 字的僅 10 題；**不需修正** | v6.0 |
| Q-003 | **V3 vocab_items chinese/example 填入** — 240 個 collocation items 全部由空殼（`chinese: "固定搭配：[英文]"`、`example: ""`）改寫為：真實繁體中文釋義（如 "召開/舉行會議"）+ TOEIC 情境例句；新增 `scripts/fix-v3-item-quality.js`，按 A-F 組（辦公行政/物流/HR/財務/服務業/企業運營）組織 240 條 BANK | v7.0 |
| Q-004 | **V0 整合（10 課 240 題 → 1 課 31 題）** — 31 個唯一 stem 保留；19 題入 `question_ids`，12 個 `_rv_` 移至 `review_question_ids`；`scripts/consolidate-v0.js` | v8.0 |
| Q-005 | **V1 826 個重複 stem 全部消除** — substitution system（PREFIX_SUBS / SUBJECT_SUBS / TAIL_SUBS）+ lesson-number fallback；`scripts/fix-v1-duplicates.js` + `scripts/fix-v1-remaining.js` | v8.0 |
| Q-006 | **V2 200 題 type 錯誤修正** — 200 道 V2 fill-in 題被標記為 `meaning_choice`，全部改為 `scene_vocabulary`，同步更新 `skill`、`tags`；涉及 questions_v2a–e.json | v8.0 |
| Q-007 | **V2 14 個 article giveaway 修正** — "an ______" 前唯一母音開頭選項洩題；改為 "the ______" 或插入形容詞；涉及 questions_v2a/v2c/v2e.json | v8.0 |
| Q-008 | **V0 blank 格式修正** — 4 題 `____`（4 底線）改為 `______`（6 底線）；`scripts/fix-audit-bugs.js` | v8.0 |
| Q-009 | **v1_c_35_q_008 缺少 blank 修正** — question_text 無空格，補入 "The ______ clearly stated..." | v8.0 |
| — | **全題庫品質審核工具** — `scripts/audit-quality-full.js`；涵蓋 §1.1 唯一性、§1.2 必填欄位、§1.3 blank 數量/article giveaway、§1.4 explanation_zh 長度、§2 課程結構、§3 題型格式；結果 `✅ PASSED（0 issues）` | v8.0 |
| — | **出題規格文件** — `docs/question-creation-spec.md`；含 10 種題型標準、5 個 stage 規則、AI prompt 模板、§8 已知違規歷史 | v8.0 |
| — | **CLAUDE.md 建立** — 專案根目錄 AI 上下文速覽文件；Claude Code 每次啟動自動讀取 | v8.0 |
| — | **Playwright 第 4 個測試** — `tests/review-mode.spec.ts` 加入後共 4/4 passing | v8.0 |

---

## 3. 仍待解決的問題

### 3.1 內容品質問題（最影響教育效果）

#### Q-001b：V2 定義嵌入題幹 ✅ 已修正（v6.0）

**修正結果：** 1,000 題（83.3%）→ **0 題（0%）**  
`scripts/rewrite-v2-definitions.js`：Notice / Conversation / Memo / Announcement / review_question 五類題型全部改寫，Email: 型原本即無定義故保留。

**殘留（非迴歸）：** V2 Email: 型有 ×4 的小模板重複（topic 詞相同），DEF_PATTERNS 不偵測，教學影響極小。

---

#### Q-002a：V0 選項長度偏差 ✅ 已改善（v6.0）

**修正結果：**

| 題型 | 修正前 | 修正後 |
|------|--------|--------|
| V0 整體 | 75%（180/240） | **48.8%（117/240）** |
| meaning_choice | 100%（30/30） | **40%（12/30）** |
| review_question | 100%（40/40） | **38%（15/40）** |
| false_friend | 100%（20/20） | **0%（0/20）** |
| part5_sentence_completion | 100% | 100%（結構性，"approved" 僅比最長選項多 1 字，不是真偏差） |
| part6_context_choice | 80% | 80%（"schedule" 與 "discount" 同為 8 字，tied rank-1，無法靠選項長度答題）|

`scripts/rewrite-v0-option-bias.js`：3 個單字 distractor 改為 4-7 字短語定義。

**殘留（設計限制）：** part5/part6 屬於「tied for longest」統計假象，不是真偏差；V0 部分 meaning_choice 正確答案本身就較長（如 warranty="a written promise to repair or replace a product" 48 字），無法在不改變學習目標的前提下消除。

---

#### Q-001c-partial：V3 跨課模板重複 ✅ 已消除（v6.0）

**修正結果：**

| 指標 | 修正前 | 修正後 |
|------|--------|--------|
| 唯一模板數 | 285 | **300** |
| 模板 >10 次重複 | 5 個（×16–×20） | **0 個** |
| 最高重複次數 | ×20（"office task" 跨 4 課） | **×5（單課設計性重複）** |

`scripts/rewrite-v3-stem-topics.js`：V3-A-122/123/124 各自獲得獨立主題；跨課重複完全消除。

**說明：** ×5 的單課內重複是設計性的——同一課的 24 題使用相同 5 個模板，分別測試 4 個目標詞彙，這是 spaced repetition 設計，非問題。

---

#### Q-001 殘留：V2/V3 跨課干擾題 ⚠️ 未開始（P2）

每課的 24 題全部測同一課的 4 個詞彙，沒有舊課詞彙作為干擾項。學習者可能依賴「本課範圍」猜題。

**建議：** 每課 review_question 區加入 1-2 個舊課詞彙選項，或每 5 課加一堂跨課混合課。

---

#### Q-001 殘留：V1 選項偏差 ✅ 確認為結構性假象（不需修正）

V1 四個選項為同一詞根的四種詞形（如 accurate/accurately/accuracy/inaccuracy），長度自然呈 {8,10,8,10} 對稱分佈。rank-1 理論期望值本就是 50%（兩個 ×10 選項）。真正的 edge >5 字的題目僅 10 題（0.6%），**不需修正**。

---

### 3.2 學習體驗缺口

#### L-004：vocab_items 富格式內容未呈現

**問題：** `vocab_items.json` 中每個詞彙有 `chinese`（中文釋義）、`example`（TOEIC 例句）、`variants`（詞形變體）、`common_wrong_forms`、`toeic_contexts`，但 UI 中完全未顯示。  
**注意（v7.0）：** V3 的 240 個 collocation items 的 chinese + example 已在 v7.0 填入真實內容，**資料已就緒**。V1/V2 items 本來就有內容。現在可以安全實作 L-004。  
**改善方向：** Error Review 卡片加入 chinese 釋義 + variants + example；或加入獨立的「Vocabulary Card」視圖。

#### L-006：next_review_date 計算但不行動

**問題：** `updateItemMastery()` 計算 `next_review_date` 存入 IDB，但系統不使用此日期推薦或排程複習。  
**改善方向：** Today 視圖加入「Due for Review」計數器，並在到期時優先顯示於 Next Action。

---

### 3.3 資料與效能

#### D-001：attempts 長期累積無上限

**現狀：** Dashboard 載入 300 筆，export 全量。但 `attempts` store 無清理策略。  
**建議：** 設定選項「保留最近 N 天 attempt 記錄」。

#### D-002：DB_VERSION 升級路徑未測試

**建議：** 加入模擬升級腳本，V4+ 新 store 時先在 scripts/ 驗證。

---

### 3.4 App 層面功能缺口

#### F-001：Stage Seal 邏輯未嚴格執行

**問題：** 課程進度可以顯示為「完成」，但沒有嚴格的 stage seal 條件（正確率門檻 + 重複錯誤率 + seal test）。  
**建議：** 可選的 strict mode，seal 條件：所有課完成 + stage 正確率達標 + 重複錯誤率低於門檻 + seal test 通過。

#### F-002：V0 診斷結果未連結學習建議

**問題：** V0 診斷分數不會產生個性化的學習路徑建議。  
**建議：** V0 結束後輸出弱點分類 → 對應 V1/V2/V3 起點建議。

#### F-003：掌握度公式無 fixture 測試

**建議：** 在 `scripts/test-scoring.js` 為 `calculateMasteryScore()` 撰寫 Node.js 輸入/輸出邊界測試集。

---

## 4. 優化計劃 — 剩餘優先順序

### ~~優先級 P0~~（已完成，v6.0–v8.0）：內容品質修正

| 編號 | 項目 | 狀態 |
|------|------|------|
| Q-001a | **audit-option-length.js** — 量化選項長度偏差與定義嵌入問題 | ✅ 完成 |
| Q-001b | **V2 定義嵌入題幹改寫** — 1,000 題 → 0 題（0%） | ✅ 完成 |
| Q-002a | **V0 選項長度均衡** — 整體偏差 75% → 48.8% | ✅ 完成 |
| Q-001c-partial | **V3 跨課模板重複消除** — 最高 ×20 → ×5 | ✅ 完成 |
| V1 選項偏差 | 確認為詞形長度對稱的結構假象，不需修正 | ✅ 關閉 |
| Q-003 | **V3 vocab_items 空殼修正** — 240 items chinese/example 全部填入（v7.0） | ✅ 完成 |
| Q-004 | **V0 整合** — 10 課 240 題 → 1 課 31 題，0 重複 stem（v8.0） | ✅ 完成 |
| Q-005 | **V1 826 重複 stem 全清** — substitution + lesson-number fallback（v8.0） | ✅ 完成 |
| Q-006 | **V2 200 題 type 錯誤修正** — meaning_choice → scene_vocabulary（v8.0） | ✅ 完成 |
| Q-007 | **V2 14 個 article giveaway 修正**（v8.0） | ✅ 完成 |
| Q-008/009 | **V0 blank 格式 + v1_c_35_q_008 blank 缺失修正**（v8.0） | ✅ 完成 |
| — | **全題庫品質審核 `audit-quality-full.js`** → `✅ PASSED（0 issues）`（v8.0） | ✅ 完成 |
| — | **`docs/question-creation-spec.md`** 出題規格文件建立（v8.0） | ✅ 完成 |

---

### 優先級 P1（目前最高優先）：學習體驗核心改善

| 編號 | 項目 | 涉及檔案 | 工作量 |
|------|------|----------|--------|
| C-001 | **V2/V3 跨課干擾題** — 每課 review_question 加入 1-2 個舊課詞彙選項；或每 5 課插入跨課混合課 | `data/vocab/questions_v2*.json`, `questions_v3*.json`, `curriculum.json` | 大 |
| L-004 | **vocab_items 富格式資料呈現** — Error Review 卡片加入 chinese 釋義 + variants + example | `js/views/mistakes.js`, `js/views/mastery.js` | 中 |
| L-006 | **Due for Review 計數** — Today 視圖顯示到期複習項目數量 | `js/views/today.js` | 小 |

---

### 優先級 P2：App 層面功能

| 編號 | 項目 | 涉及檔案 | 工作量 |
|------|------|----------|--------|
| F-001 | **Stage Seal 嚴格模式** — 可選擇性開啟，seal 條件完整定義 | `views/settings.js`, `views/lesson.js` | 大 |
| F-002 | **V0 診斷 → 學習建議** — V0 結束後輸出弱點分類和建議起點 | `views/lesson.js`, `views/today.js` | 中 |
| F-003 | **掌握度公式 fixture 測試** | `scripts/test-scoring.js` | 中 |

---

### 優先級 P3：未來內容擴展（僅在 Q-001/Q-002 修完後開始）

| 編號 | 項目 | 工作量 |
|------|------|--------|
| P3-1 | V4 Formal Phrase（emails、notices、contracts、policy phrases）| 極大 |
| P3-2 | V5 False Friends + Speed（高風險混淆詞 + 時間壓力練習）| 極大 |
| P3-3 | V6 Integrated Review + Seal Test（混合複習、重複錯誤收束、stage sealing）| 極大 |

**注意：** V4 不得沿用 V2/V3 的 generator 模板風格。必須在 content quality lint 規則到位後才開始。

---

## 5. 當前 App 狀態總表（截至 v8.0，2026-05-17）

| 區域 | 狀態 | 備注 |
|------|------|------|
| 課程執行引擎 | ✅ 完整 | try/finally 保護；seed 合併邏輯正確 |
| 掌握度計算 | ✅ 邏輯正確 | stable_review_sessions 正確遞增；公式無 fixture 測試（F-003 待做） |
| 即時作答反饋 | ✅ 完成 | 綠/紅 banner + 答案著色 + explanation_zh + 鍵盤 Enter 繼續 |
| mastery-adaptive 題目 | ✅ 完成 | buildRuntimeQuestions 按 mastery_score 升序，blind/weak 優先 |
| Today Next Action | ✅ 完成 | review/retake/start 各對應主要行動按鈕 |
| 鍵盤快捷鍵 | ✅ 完成 | A–D / 1–4 選答；Enter/Space 確認反饋 |
| Review Mode | ✅ 完成 | dedicated queue runtime，mode:"review_queue"，fixed/still_weak/repeated_error |
| 錯誤複習佇列 | ✅ 完整 | 佇列建立、Review Mode 執行、grammar 面板 |
| Grammar Link 面板 | ✅ 完成 | Error Review 中可折疊語法說明（14 條記錄） |
| vocab_items 富格式 | ⚠️ 資料已填入，UI 未呈現 | 494 items 全部有 chinese + example；UI 不顯示（L-004 待做） |
| Question Bank | ✅ 完整 | 搜尋 / Load More 分頁 / 編輯 / Seed 匯出 |
| Mastery 視圖 | ✅ 含篩選 | mastery_level 下拉篩選，含各 level 計數 |
| 匯出功能 | ✅ 完整 | export 時全量取 attempts；review_effectiveness.csv；個別檔案 + Seed JSON |
| Service Worker | ✅ 完成 | stale-while-revalidate（toeic-vorb-v4） |
| Playwright 測試 | ✅ 通過 | **4/4 passing**（lesson-flow + review-mode + export-flow + V2/V3 seed 驗證） |
| 全題庫品質審核 | ✅ 通過 | `node scripts/audit-quality-full.js` → `✅ PASSED（0 issues）` |
| 重複題目 | ✅ 清零 | **0 重複**（原 826；全部替換） |
| 出題規格 | ✅ 文件化 | `docs/question-creation-spec.md` v1.0（含 AI prompt 模板） |
| CLAUDE.md | ✅ 建立 | 專案根目錄 AI 上下文文件，自動載入 |
| V0 內容 | ✅ 完成 | **1 課 / 31 題**（原 10 課 240 題，整合為單一診斷課） |
| V1 內容 | ✅ 品質通過 | 60 課 / 1,728 題；826 重複 stem 全清；speed_drill error_code 修正 |
| V2 內容 | ✅ 品質通過 | 60 課 / 1,200 題；200 題 type 修正；14 個 article giveaway 修正；定義嵌入 0% |
| V3 內容 | ✅ 品質通過 | 72 課 / 1,440 題；跨課重複 ×5 max；240 items chinese+example 已填入 |
| V4–V6 內容 | ❌ 規劃中 | 現在品質已達標，可以規劃 V4 |
| Stage Seal 邏輯 | ⚠️ 未嚴格 | 進度可見但 seal 條件未強制執行 |

---

## 6. 建議執行順序（剩餘工作）

```
✅ 第一輪（v6.0–v8.0 已完成）：內容品質修正
  Q-001a  audit-option-length.js（量化）               → 完成
  Q-001b  V2 定義嵌入題幹改寫（1,000 → 0 題）          → 完成
  Q-002a  V0 選項長度均衡（75% → 48.8%）               → 完成
  Q-001c  V3 跨課模板重複消除（×20 → ×5）              → 完成
          V1 選項偏差確認為假象，關閉                   → 完成
  Q-003   V3 vocab_items 空殼填入（240 items）          → 完成（v7.0）
  Q-004   V0 整合（240 → 31 題，10 → 1 課）            → 完成（v8.0）
  Q-005   V1 826 重複 stem 全清                         → 完成（v8.0）
  Q-006   V2 200 題 type 修正                           → 完成（v8.0）
  Q-007   V2 14 個 article giveaway 修正               → 完成（v8.0）
          audit-quality-full.js → ✅ PASSED             → 完成（v8.0）
          docs/question-creation-spec.md 建立           → 完成（v8.0）

第二輪（目前最高優先）：教學深度提升
  L-004   vocab_items 富格式呈現（chinese + variants + example）← 資料已就緒，優先
  C-001   V2/V3 跨課干擾題（每課加入舊課 distractor）
  L-006   Due for Review 計數（Today 視圖）

第三輪（App 功能）：
  F-001   Stage Seal 嚴格模式
  F-002   V0 診斷 → 學習建議
  F-003   掌握度公式 fixture 測試

長期（品質已全面通過，可開始規劃）：
  V4 Formal Phrase → V5 False Friends → V6 Integrated Review
```

---

## 7. 給下一位 AI 的說明

本計劃書由 Claude Sonnet 4.6 於 2026-05-17 更新為 v8.0。

**當前最高優先行動：L-004 vocab_items 富格式呈現（資料已就緒，UI 待做）**

所有內容品質 P0 問題已全部解決（v6.0–v8.0）。V0/V1/V2/V3 共 4,399 題，0 重複，品質審核 ✅ PASSED。可進行學習者測試，亦可開始 V4 規劃。

### 完整修正歷史摘要（v6.0–v8.0）

| 問題 | 修正前 | 修正後 | 腳本 |
|------|--------|--------|------|
| V2 定義嵌入題幹 | 1,000/1,200（83%） | **0/1,200（0%）** | `rewrite-v2-definitions.js` |
| V0 meaning_choice 選項偏差 | 100%（30/30） | **40%（12/30）** | `rewrite-v0-option-bias.js` |
| V0 false_friend 選項偏差 | 100%（20/20） | **0%（0/20）** | `rewrite-v0-option-bias.js` |
| V3 跨課模板重複 | ×20（5 個模板） | **×5 max（0 個 >10×）** | `rewrite-v3-stem-topics.js` |
| V1 speed_drill error_code | 30 題 WORD_FAMILY_POS | **0 題（TIME_PRESSURE）** | `fix-v1a-quality.js` |
| V3 vocab_items 空殼 | 240 items 全空 | **240 items 真實繁中釋義+例句** | `fix-v3-item-quality.js` |
| V0 整合 | 10 課 / 240 題 | **1 課 / 31 題（0 重複）** | `consolidate-v0.js` |
| V1 重複 stem | 826 個 | **0 個** | `fix-v1-duplicates.js` + `fix-v1-remaining.js` |
| V2 type 錯誤 | 200 題 meaning_choice | **200 題 scene_vocabulary** | 直接修正 questions_v2*.json |
| V2 article giveaway | 14 個 "an ______" 洩題 | **14 個句子重組** | `fix-audit-bugs.js` |
| V0 blank 格式 | 4 題 `____` | **`______`** | `fix-audit-bugs.js` |
| 全題庫品質 | 無系統化審核 | **`audit-quality-full.js` ✅ 0 issues** | `audit-quality-full.js` |

### 下一步：L-004 vocab_items 富格式呈現

494 個詞彙項目（V1: 42、V2: 212、V3: 240）均已有 `chinese` + `example`。

**建議實作方式：**
- `js/views/mistakes.js`：錯誤題目下方加入對應 vocab_item 的 `chinese` + `example`
- `js/views/mastery.js`：詞彙卡片展開後顯示 `chinese` + `variants` + `example`
- 資料路徑：`state.vocabItems`（已在 `loadData()` 時載入）→ 按 `target_item_id` 查找

**複雜度：** 小-中（純 UI 修改，無資料變更，無需 bump seed）

### 次要下一步：C-001 跨課干擾題

每課的 review_question 干擾項目前來自同課（同課競爭）。缺乏跨課舊詞彙干擾。

**建議：** 每課 4 個 review_question 中，至少 1-2 個干擾項來自前 3-5 課詞彙。  
**涉及：** `data/vocab/questions_v2*.json`、`questions_v3*.json`、`curriculum.json`（需 bump seed）

---

**開發注意事項（v8.0 更新）：**
- `vocab-scoring.js` 和 `vocab-db.js` 是 IIFE → `window.VocabScoring` / `window.VocabDB`；`views/` 是 ES Module。不要混用。
- `state.showFeedback` 控制反饋面板；`advanceAfterFeedback()` 推進 `current_index`。
- `buildRuntimeQuestions()` 按 `mastery_score` 升序，blind/weak 優先。
- Review Mode：`REVIEW_LESSON_ID = "REVIEW_QUEUE"`，limit 20，`mode: "review_queue"`。
- **seed 版本同步規則（最重要）：** 任何題目/課程資料異動都必須同步修改以下三個檔案：
  - `js/vocab-db.js` → `const SEED_VERSION`
  - `data/vocab/curriculum.json` → `"seed_version"`
  - `tests/helpers/seed-idb.ts` → `const APP_SEED_VERSION`
- **種子版本目前：** `toeic_vocab_tracker_quality_fixed_2026_05_17`
- 內容變更後必須執行：`node scripts/audit-quality-full.js`（0 issues）+ `npx playwright test`（4/4）
- 出題規格全文：`docs/question-creation-spec.md`（含 AI prompt 模板）
- **不屬於本程式範圍：** `C:\Users\Keith\toeic-app`（Grammar / PoS App），絕對不要修改。
