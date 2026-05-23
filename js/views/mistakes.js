import {
  state,
  html,
  seconds,
  byId,
  optionText,
  setNotice,
  loadData,
  errorCodeLabel,
  ERROR_CODE_LABELS,
  questionTypeLabel
} from "../state.js";
import { getReviewCandidates, upsertReviewQueue } from "./lesson.js";

const mistakesRuntime = {
  render: null,
  setView: null
};

function markDriveChange(reason) {
  window.VocabTracker?.markGoogleDriveLocalChange?.(reason);
}

export function configureMistakesView(deps) {
  mistakesRuntime.render = deps?.render || mistakesRuntime.render;
  mistakesRuntime.setView = deps?.setView || mistakesRuntime.setView;
}

function callRender() {
  if (typeof mistakesRuntime.render !== "function") {
    throw new Error("Mistakes module render callback is not configured.");
  }
  mistakesRuntime.render();
}

function callSetView(view) {
  if (typeof mistakesRuntime.setView === "function") {
    mistakesRuntime.setView(view);
    return;
  }
  state.view = view;
  callRender();
}

function isCompactTrackerViewport() {
  return typeof window !== "undefined"
    && Boolean(window.matchMedia?.("(max-width: 860px)").matches);
}

const MOBILE_REVIEW_CHUNK = 5;

function reviewStateLabel(value) {
  return {
    repeated_error: "反覆錯誤",
    still_weak: "仍不穩定",
    new_error: "新錯誤",
    fixed: "已修正，待複習",
    stable: "已穩定，待複習",
    reviewed: "已複習",
    pending: "待複習",
    lesson_error: "課程錯誤",
    manual_add: "手動加入",
    timeout_error: "超時錯誤",
    speed_error: "速度錯誤",
    reinforcement: "補強練習",
    needs_retake: "需要重跑"
  }[value] || value || "待複習";
}

export function dismissPostLessonSummary() {
  state.postLessonSummary = null;
  callRender();
}

export function renderPostLessonNextSteps() {
  const summary = state.postLessonSummary;
  if (!summary) return "";
  const compact = isCompactTrackerViewport();
  const dueReview = Number(summary.due_review_count || 0);
  const primaryCta = dueReview > 0
    ? `<button class="button primary" type="button" data-testid="post-lesson-start-review" onclick="VocabTracker.startReviewMode('due')">複習到期項目 (${dueReview})</button>`
    : `<button class="button primary" type="button" data-testid="post-lesson-back-today" onclick="VocabTracker.setView('today')">回今日首頁</button>`;
  const syncNote = compact
    ? "本機已保存；同步狀態請稍後在設定查看。"
    : "作答與精熟度已寫入本機；若 Google Drive 同步尚未完成，資料仍安全保存在裝置上。";

  return `
    <section class="tracker-panel post-lesson-panel" data-testid="post-lesson-next-steps">
      <div class="post-lesson-head">
        <h3>本課完成</h3>
        <p class="tracker-bigline">${html(summary.lesson_id)} · ${pct(summary.accuracy)}</p>
        <p class="muted-note" data-testid="post-lesson-recap">${summary.correct_questions}/${summary.total_questions} 題答對 · 精熟度已更新${summary.wrong_questions ? ` · ${summary.wrong_questions} 題待確認錯因` : ""}</p>
        ${dueReview > 0 ? `<p class="post-lesson-due muted-note" data-testid="post-lesson-due-review">${dueReview} 項到期複習</p>` : `<p class="muted-note">目前沒有到期複習</p>`}
        <p class="muted-note post-lesson-sync-note">${html(syncNote)}</p>
      </div>
      <div class="tracker-actions post-lesson-actions" data-testid="post-lesson-actions">
        ${primaryCta}
        <button class="button secondary" type="button" data-testid="post-lesson-mastery" onclick="VocabTracker.setView('mastery')">查看精熟度</button>
        <button class="button secondary" type="button" data-testid="post-lesson-today" onclick="VocabTracker.setView('today')">今日首頁</button>
        <button class="button secondary" type="button" data-testid="dismiss-post-lesson" onclick="VocabTracker.dismissPostLessonSummary()">關閉摘要</button>
      </div>
    </section>
  `;
}

function pct(value) {
  return `${Math.round(Number(value || 0) * 100)}%`;
}

export function renderMistakes() {
  const postLessonBlock = renderPostLessonNextSteps();
  if (state.reviewSessionId) return postLessonBlock + renderSessionErrorReview(state.reviewSessionId);
  const pending = state.reviewQueue.filter((item) => item.status === "pending");
  const filter = state.reviewFilter || "due";
  const candidates = getReviewCandidates(filter);
  const filterTabs = [
    ["due", "今日到期"],
    ["high_priority", "高優先"],
    ["repeated", "反覆錯誤"],
    ["all", "全部待處理"]
  ];
  const counts = {
    due: getReviewCandidates("due").rows.length,
    high_priority: getReviewCandidates("high_priority").rows.length,
    repeated: getReviewCandidates("repeated").rows.length,
    all: getReviewCandidates("all").rows.length
  };
  const visibleReviewIds = new Set(candidates.entries.map((entry) => entry.review_id));
  const visibleQueue = filter === "all"
    ? pending
    : pending.filter((entry) => visibleReviewIds.has(entry.review_id));
  const items = byId(state.vocabItems, "item_id");
  const rows = visibleQueue.map((entry) => {
    const reviewState = entry.review_state || "";
    const whyDue = reviewStateLabel(reviewState || entry.reason || "pending");
    const nextAt = entry.next_review_at ? `下次 ${html(entry.next_review_at)}` : `到期 ${html(entry.due_date)}`;
    const repCount = entry.repeated_error_count ? ` · 反覆 ${entry.repeated_error_count} 次` : "";
    return `
    <article class="queue-card priority-${entry.priority}">
      <div>
        <strong>${html(items[entry.item_id]?.base_word || entry.item_id)}</strong>
        <p class="queue-why">${html(whyDue)}${repCount}</p>
        <p class="queue-meta">${nextAt} · ${entry.question_ids?.length || 0} 題</p>
      </div>
      <div class="queue-actions">
        <span class="priority-pill">P${entry.priority}</span>
        <button class="button small" type="button" onclick="VocabTracker.markQueueDone('${html(entry.review_id)}')">完成</button>
      </div>
    </article>
  `;
  }).join("");
  const recentOutcomes = state.reviewQueue
    .filter((entry) => entry.last_review_session_id)
    .sort((a, b) => String(b.last_reviewed_at || "").localeCompare(String(a.last_reviewed_at || "")))
    .slice(0, 8);

  const compact = isCompactTrackerViewport();
  const chunkHint = compact
    ? `<p class="muted-note review-chunk-hint" data-testid="review-chunk-hint">手機建議每次先做 ${MOBILE_REVIEW_CHUNK} 題，完成後可再開下一組。</p>`
    : "";
  const repeatedFocus = compact && filter === "repeated"
    ? `<p class="muted-note review-repeated-focus" data-testid="review-repeated-focus">反覆錯誤模式：優先處理 P5 與連續答錯項目。</p>`
    : "";

  return `
    ${postLessonBlock}
    <section class="tracker-panel mistakes-review-panel" data-testid="mistakes-review-panel">
      <h3>複習模式</h3>
      ${chunkHint}
      ${repeatedFocus}
      <div class="tracker-grid review-grid">
        <article class="tracker-stat"><span>到期</span><strong>${counts.due}</strong><small>題</small></article>
        <article class="tracker-stat"><span>高優先</span><strong>${counts.high_priority}</strong><small>題</small></article>
        <article class="tracker-stat"><span>反覆錯</span><strong>${counts.repeated}</strong><small>題</small></article>
        <article class="tracker-stat"><span>待處理</span><strong>${counts.all}</strong><small>題</small></article>
      </div>
      <div class="review-filter-tabs">
        ${filterTabs.map(([id, label]) => `
          <button class="tracker-tab ${filter === id ? "active" : ""}" type="button" onclick="VocabTracker.setReviewFilter('${id}')">${html(label)} (${counts[id]})</button>
        `).join("")}
      </div>
      <div class="tracker-actions mistakes-review-actions" data-testid="mistakes-review-actions">
        <button class="button primary" type="button" data-testid="start-review-mode" onclick="VocabTracker.startReviewMode('${html(filter)}')" ${candidates.rows.length ? "" : "disabled"}>開始複習 (${candidates.rows.length})</button>
        <button class="button secondary" type="button" onclick="VocabTracker.setView('lesson')">一般課程</button>
        <button class="button secondary" type="button" onclick="VocabTracker.setView('export')">匯出完整資料封包</button>
      </div>
      ${state.lastReviewSummary ? `
        <div class="tracker-alert review-mini-summary ${state.lastReviewSummary.wrong_questions ? "warn" : "ok"}" data-testid="review-mini-summary">
          <strong>上次複習</strong>
          <span>${state.lastReviewSummary.correct_questions}/${state.lastReviewSummary.total_questions} 題答對 · ${state.lastReviewSummary.fixed_items} 項已修正 · ${state.lastReviewSummary.still_weak_items} 項仍不穩 · ${state.lastReviewSummary.repeated_error_items} 項反覆錯誤</span>
        </div>
      ` : ""}
    </section>
    <section class="tracker-panel">
      <h3>錯題複習佇列</h3>
      ${visibleQueue.length ? `<div class="queue-list">${rows}</div>` : `<p class="muted-note">${pending.length ? "目前這個複習模式下沒有符合項目。" : "目前沒有待複習項目。"}</p>`}
    </section>
    <section class="tracker-panel">
      <h3>最近複習結果</h3>
      ${recentOutcomes.length ? `<div class="queue-list">${recentOutcomes.map((entry) => {
        const stateLabel = reviewStateLabel(entry.review_state || entry.review_status || "reviewed");
        const consec = entry.consecutive_review_correct ? ` · 連續 ${entry.consecutive_review_correct} 次` : "";
        return `
        <article class="queue-card">
          <div>
            <strong>${html(items[entry.item_id]?.base_word || entry.item_id)}</strong>
            <p class="queue-why">${html(stateLabel)}${consec}</p>
            <p class="queue-meta">${html(entry.review_correct_count || 0)}/${html(entry.review_attempt_count || 0)} 題答對 · ${html(entry.last_reviewed_at || "")}</p>
          </div>
          <span class="priority-pill status-${html(stateLabel)}">${html(stateLabel)}</span>
        </article>
      `;
      }).join("")}</div>` : `<p class="muted-note">目前還沒有複習結果。</p>`}
    </section>
    <section class="tracker-panel">
      <h3>最近錯題</h3>
      ${renderWrongAttemptList()}
    </section>
    <section class="tracker-panel">
      <h3>最近作答紀錄</h3>
      <p class="muted-note">每次送出答案後，系統都會自動保存你選的選項與作答時間。</p>
      ${renderAnswerRecordList()}
    </section>
  `;
}

export function setReviewFilter(filter) {
  state.reviewFilter = filter || "due";
  callRender();
}

export function renderWrongAttemptList() {
  const questionMap = byId(state.questions, "question_id");
  const itemMap = byId(state.vocabItems, "item_id");
  const wrong = state.attempts.filter((attempt) => !attempt.is_correct).slice(-20).reverse();
  if (!wrong.length) return `<p class="muted-note">目前還沒有錯題紀錄。</p>`;
  return wrong.map((attempt) => {
    const q = questionMap[attempt.question_id];
    const vocabItem = itemMap[q?.target_item_id];
    return `
      <article class="wrong-line" data-testid="wrong-attempt-row">
        <div class="wrong-attempt-context" data-testid="wrong-attempt-context">
          <span>${html(attempt.lesson_id)} · ${html(questionTypeLabel(q?.type || attempt.question_type))}</span>
          <p class="question-text small">${html(q?.question_text || attempt.question_id)}</p>
        </div>
        <small>你的 ${html(attempt.user_answer)} (${html(optionText(q, attempt.user_answer))}) · 正解 ${html(attempt.correct_answer)} (${html(optionText(q, attempt.correct_answer))}) · ${seconds(attempt.response_time_seconds)} · ${html(errorCodeLabel(attempt.error_code || attempt.default_error_code))}</small>
        ${vocabItem?.chinese ? `<div class="vocab-card"><p class="vocab-chinese">${html(vocabItem.chinese)}</p>${vocabItem.example ? `<p class="vocab-example">${html(vocabItem.example)}</p>` : ""}</div>` : ""}
      </article>
    `;
  }).join("");
}

export function renderAnswerRecordList() {
  const questionMap = byId(state.questions, "question_id");
  const attempts = state.attempts.slice(-30).reverse();
  if (!attempts.length) return `<p class="muted-note">目前還沒有作答紀錄。先開始一課並送出答案，就會出現第一筆紀錄。</p>`;
  return `
    <div class="answer-record-list">
      ${attempts.map((attempt) => {
        const q = questionMap[attempt.question_id];
        return `
          <article class="answer-record ${attempt.is_correct ? "is-correct" : "is-wrong"}">
            <div class="answer-record-head">
              <strong>${html(attempt.lesson_id)} · ${html(q?.question_text || attempt.question_id)}</strong>
              <span>${seconds(attempt.response_time_seconds)}</span>
            </div>
            <div class="answer-record-meta">
              <span>${html(attempt.timestamp || "")}</span>
              <span>${html(questionTypeLabel(attempt.question_type || q?.type || ""))}</span>
              <span>你的 ${html(attempt.user_answer)}：${html(optionText(q, attempt.user_answer))}</span>
              <span>正解 ${html(attempt.correct_answer)}：${html(optionText(q, attempt.correct_answer))}</span>
              <span>${attempt.is_correct ? "答對" : "答錯"}</span>
            </div>
          </article>
        `;
      }).join("")}
    </div>
  `;
}

function renderGrammarLink(grammarLinkId) {
  if (!grammarLinkId) return "";
  const link = state.grammarLinks?.[grammarLinkId];
  if (!link) return `<p class="muted-note grammar-link-id">${html(grammarLinkId)}</p>`;
  return `
    <details class="grammar-link-panel">
      <summary>${html(link.title_zh)} <span class="grammar-link-id">${html(grammarLinkId)}</span></summary>
      <p>${html(link.rule_zh)}</p>
      <p class="muted-note">${html(link.example || "")}</p>
    </details>
  `;
}

function renderV0Diagnostic(sessionId) {
  const allAttempts = state.attempts.filter((a) => a.session_id === sessionId);
  const total = allAttempts.length;
  const correctCount = allAttempts.filter((a) => a.is_correct).length;
  const accuracy = total ? correctCount / total : 0;
  const pct = Math.round(accuracy * 100);

  const wrongByCode = {};
  allAttempts.filter((a) => !a.is_correct).forEach((a) => {
    const code = a.error_code || a.default_error_code || "UNKNOWN";
    wrongByCode[code] = (wrongByCode[code] || 0) + 1;
  });

  const codeRec = {
    VOCAB_UNKNOWN:     "V1 詞族基礎",
    VOCAB_WEAK_RECALL: "V1 間隔複習課",
    SCENE_VOCAB_GAP:   "V2 商務情境字彙",
    FORMAL_PHRASE:     "V4 正式片語（規劃中）",
    FALSE_FRIEND:      "V1 易混字題型",
    TIME_PRESSURE:     "各階段速度練習",
    WORD_FAMILY_POS:   "V1 詞族練習",
    COLLOCATION_PREP:  "V3 搭配詞練習",
    CARELESS:          "放慢作答速度，仔細閱讀選項",
    REPEATED_ERROR:    "加入複習佇列，集中練習弱點"
  };

  const weakItems = Object.entries(wrongByCode)
    .sort((a, b) => b[1] - a[1])
    .map(([code, count]) => {
      const label = errorCodeLabel(code);
      const rec = codeRec[code] || "一般練習";
      return `<li><strong>${html(label)}</strong>（${count} 題）→ 建議加強：${html(rec)}</li>`;
    }).join("");

  const advice = accuracy >= 0.8
    ? "成績良好，V1 可以正常進度推進。"
    : accuracy >= 0.6
      ? "基礎尚可，按 V1 標準進度學習，注意弱點題型。"
      : "建議放慢 V1 節奏，每課都完成複習題，勿跳過 Review Session。";

  return `
    <section class="tracker-panel v0-diagnostic">
      <h3>V0 診斷結果</h3>
      <p class="tracker-bigline">${correctCount} / ${total} 正確 · ${pct}%</p>
      <p class="muted-note">${html(advice)}</p>
      ${weakItems ? `<h4 class="diagnostic-heading">發現弱點 → 建議學習重點</h4><ul class="diagnostic-list">${weakItems}</ul>` : `<p class="muted-note">全部答對，各題型掌握良好！</p>`}
    </section>
  `;
}

export function renderSessionErrorReview(sessionId) {
  const questionMap = byId(state.questions, "question_id");
  const itemMap = byId(state.vocabItems, "item_id");
  const session = state.sessions.find((s) => s.session_id === sessionId);
  const isV0 = session?.stage === "V0";
  const compact = isCompactTrackerViewport();
  const attempts = state.attempts.filter((attempt) => attempt.session_id === sessionId && !attempt.is_correct);
  if (!attempts.length) {
    return `
      ${isV0 ? renderV0Diagnostic(sessionId) : ""}
      <section class="tracker-panel">
        <h3>錯題回顧與安排</h3>
        <p class="tracker-bigline">本次沒有答錯題目。</p>
        <button class="button primary" type="button" onclick="VocabTracker.closeSessionReview()">開始下一課</button>
      </section>
    `;
  }
  return `
    ${isV0 ? renderV0Diagnostic(sessionId) : ""}
    <section class="tracker-panel error-review-panel" data-testid="error-review-panel">
      <div class="error-review-head" data-testid="error-review-summary">
        <h3>錯題回顧與安排</h3>
        <p class="tracker-bigline">${attempts.length} 題待確認錯因</p>
        <p class="muted-note">${compact ? "先儲存錯因再離開；也可稍後回來處理。" : "請確認或調整實際錯因。確認後會同步更新作答紀錄、錯誤日誌、精熟度與複習佇列。"}</p>
      </div>
      <div class="error-review-list">
        ${attempts.map((attempt) => {
          const q = questionMap[attempt.question_id];
          const vocabItem = itemMap[q?.target_item_id];
          return `
            <article class="error-card">
              <div class="question-meta">
                <span>${html(attempt.lesson_id)}</span>
                <span>${html(attempt.question_type)}</span>
                <span>${seconds(attempt.response_time_seconds)}</span>
              </div>
              <p class="question-text small">${html(q?.question_text || attempt.question_id)}</p>
              <div class="answer-compare">
                <span>你的 ${html(attempt.user_answer)}：${html(optionText(q, attempt.user_answer))}</span>
                <span>正解 ${html(attempt.correct_answer)}：${html(optionText(q, attempt.correct_answer))}</span>
              </div>
              <p class="explanation">${html(q?.explanation_zh || "")}</p>
              ${vocabItem?.chinese ? `<div class="vocab-card"><p class="vocab-chinese">${html(vocabItem.chinese)}</p>${vocabItem.example ? `<p class="vocab-example">${html(vocabItem.example)}</p>` : ""}</div>` : ""}
              ${renderGrammarLink(q?.grammar_link_id)}
              <label class="field-label">錯因代碼</label>
              <select data-error-attempt="${html(attempt.attempt_id)}">
                ${window.VocabScoring.ERROR_CODES.map((code) => `<option value="${code}" ${(attempt.error_code || attempt.default_error_code) === code ? "selected" : ""}>${ERROR_CODE_LABELS[code] || code}</option>`).join("")}
              </select>
            </article>
          `;
        }).join("")}
      </div>
      <div class="tracker-actions error-review-actions" data-testid="error-review-actions">
        <button class="button primary" type="button" data-testid="confirm-session-errors" onclick="VocabTracker.confirmSessionErrors()">儲存確認後錯因</button>
        <button class="button secondary" type="button" data-testid="skip-session-review" onclick="VocabTracker.closeSessionReview()">先跳過</button>
      </div>
    </section>
  `;
}

export async function confirmSessionErrors() {
  const selects = [...document.querySelectorAll("[data-error-attempt]")];
  for (const select of selects) {
    await confirmError(select.dataset.errorAttempt, select.value);
  }
  state.reviewSessionId = null;
  await loadData();
  markDriveChange("error_review");
  setNotice("錯因已儲存，複習佇列也已更新。", "ok");
  callSetView("lesson");
}

export async function confirmError(attemptId, errorCode) {
  const attempt = await window.VocabDB.get("attempts", attemptId);
  if (!attempt) return;
  const vocabItemForError = await window.VocabDB.get("vocab_items", attempt.target_item_id);
  const wrongCount = Number(vocabItemForError?.wrong_count || 0);
  const repeated = wrongCount >= 2;
  const priority = wrongCount >= 3 || errorCode === "REPEATED_ERROR" ? 5 : errorCode === "CARELESS" ? 2 : 3;
  const updated = {
    ...attempt,
    error_code: errorCode,
    is_repeated_error: repeated,
    review_priority: priority,
    confirmed_at: window.VocabScoring.localIso()
  };
  await window.VocabDB.put("attempts", updated);
  await window.VocabDB.put("error_logs", {
    error_log_id: `err_${attemptId}`,
    attempt_id: attemptId,
    timestamp: window.VocabScoring.localIso(),
    user_id: attempt.user_id,
    course_id: attempt.course_id,
    stage: attempt.stage,
    lesson_id: attempt.lesson_id,
    question_id: attempt.question_id,
    item_id: attempt.target_item_id,
    error_code: errorCode,
    default_error_code: attempt.default_error_code,
    is_repeated_error: repeated,
    status: "confirmed"
  });
  await upsertReviewQueue(updated, repeated ? "repeated_error" : "lesson_error", priority);
  const item = await window.VocabDB.get("vocab_items", attempt.target_item_id);
  if (item) {
    item.last_error_code = errorCode;
    item.next_review_date = window.VocabScoring.addDays(window.VocabScoring.localDate(), priority >= 5 ? 1 : 2);
    await window.VocabDB.put("vocab_items", item);
  }
}

export function closeSessionReview() {
  state.reviewSessionId = null;
  callSetView("lesson");
}

export async function markQueueDone(reviewId) {
  const entry = await window.VocabDB.get("review_queue", reviewId);
  if (!entry) return;
  await window.VocabDB.put("review_queue", { ...entry, status: "done", completed_at: window.VocabScoring.localIso() });
  await loadData();
  markDriveChange("review_queue");
  callRender();
}
