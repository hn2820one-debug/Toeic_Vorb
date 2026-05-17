import {
  state,
  html,
  seconds,
  byId,
  optionText,
  setNotice,
  loadData,
  errorCodeLabel,
  ERROR_CODE_LABELS
} from "../state.js";
import { getReviewCandidates, upsertReviewQueue } from "./lesson.js";

const mistakesRuntime = {
  render: null,
  setView: null
};

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

export function renderMistakes() {
  if (state.reviewSessionId) return renderSessionErrorReview(state.reviewSessionId);
  const pending = state.reviewQueue.filter((item) => item.status === "pending");
  const filter = state.reviewFilter || "due";
  const candidates = getReviewCandidates(filter);
  const filterTabs = [
    ["due", "Due Today"],
    ["high_priority", "High Priority"],
    ["repeated", "Repeated"],
    ["all", "All Pending"]
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
    const whyDue = reviewState === "repeated_error" ? "Repeated error"
      : reviewState === "still_weak" ? "Still weak"
      : reviewState === "new_error" ? "New error"
      : reviewState === "fixed" ? "Fixed · due review"
      : reviewState === "stable" ? "Stable · due review"
      : entry.reason || "Pending review";
    const nextAt = entry.next_review_at ? `next ${entry.next_review_at}` : `due ${html(entry.due_date)}`;
    const repCount = entry.repeated_error_count ? ` · ${entry.repeated_error_count}× repeated` : "";
    return `
    <article class="queue-card priority-${entry.priority}">
      <div>
        <strong>${html(items[entry.item_id]?.base_word || entry.item_id)}</strong>
        <p class="queue-why">${html(whyDue)}${repCount}</p>
        <p class="queue-meta">${nextAt} · ${entry.question_ids?.length || 0} questions</p>
      </div>
      <div class="queue-actions">
        <span class="priority-pill">P${entry.priority}</span>
        <button class="button small" type="button" onclick="VocabTracker.markQueueDone('${html(entry.review_id)}')">Done</button>
      </div>
    </article>
  `;
  }).join("");
  const recentOutcomes = state.reviewQueue
    .filter((entry) => entry.last_review_session_id)
    .sort((a, b) => String(b.last_reviewed_at || "").localeCompare(String(a.last_reviewed_at || "")))
    .slice(0, 8);

  return `
    <section class="tracker-panel">
      <h3>Review Mode</h3>
      <div class="tracker-grid review-grid">
        <article class="tracker-stat"><span>Due</span><strong>${counts.due}</strong><small>questions</small></article>
        <article class="tracker-stat"><span>High P</span><strong>${counts.high_priority}</strong><small>questions</small></article>
        <article class="tracker-stat"><span>Repeated</span><strong>${counts.repeated}</strong><small>questions</small></article>
        <article class="tracker-stat"><span>All Pending</span><strong>${counts.all}</strong><small>questions</small></article>
      </div>
      <div class="review-filter-tabs">
        ${filterTabs.map(([id, label]) => `
          <button class="tracker-tab ${filter === id ? "active" : ""}" type="button" onclick="VocabTracker.setReviewFilter('${id}')">${html(label)} (${counts[id]})</button>
        `).join("")}
      </div>
      <div class="tracker-actions">
        <button class="button primary" type="button" onclick="VocabTracker.startReviewMode('${html(filter)}')" ${candidates.rows.length ? "" : "disabled"}>Start Review (${candidates.rows.length})</button>
        <button class="button secondary" type="button" onclick="VocabTracker.setView('lesson')">Normal Lesson</button>
        <button class="button secondary" type="button" onclick="VocabTracker.setView('export')">Export</button>
      </div>
      ${state.lastReviewSummary ? `
        <div class="tracker-alert ${state.lastReviewSummary.wrong_questions ? "warn" : "ok"}">
          Last review: ${state.lastReviewSummary.correct_questions}/${state.lastReviewSummary.total_questions} correct · ${state.lastReviewSummary.fixed_items} fixed · ${state.lastReviewSummary.still_weak_items} still weak · ${state.lastReviewSummary.repeated_error_items} repeated
        </div>
      ` : ""}
    </section>
    <section class="tracker-panel">
      <h3>Mistake Review Queue</h3>
      ${visibleQueue.length ? `<div class="queue-list">${rows}</div>` : `<p class="muted-note">${pending.length ? "No queue item matches this review mode." : "No pending review items."}</p>`}
    </section>
    <section class="tracker-panel">
      <h3>Recent Review Outcomes</h3>
      ${recentOutcomes.length ? `<div class="queue-list">${recentOutcomes.map((entry) => {
        const stateLabel = entry.review_state || entry.review_status || "reviewed";
        const consec = entry.consecutive_review_correct ? ` · ${entry.consecutive_review_correct} consec` : "";
        return `
        <article class="queue-card">
          <div>
            <strong>${html(items[entry.item_id]?.base_word || entry.item_id)}</strong>
            <p class="queue-why">${html(stateLabel)}${consec}</p>
            <p class="queue-meta">${html(entry.review_correct_count || 0)}/${html(entry.review_attempt_count || 0)} correct · ${html(entry.last_reviewed_at || "")}</p>
          </div>
          <span class="priority-pill status-${html(stateLabel)}">${html(stateLabel)}</span>
        </article>
      `;
      }).join("")}</div>` : `<p class="muted-note">No review outcomes yet.</p>`}
    </section>
    <section class="tracker-panel">
      <h3>Recent Wrong Attempts</h3>
      ${renderWrongAttemptList()}
    </section>
    <section class="tracker-panel">
      <h3>Recent Answer Records</h3>
      <p class="muted-note">Every submitted answer is saved automatically with the selected answer and per-question time.</p>
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
  if (!wrong.length) return `<p class="muted-note">No wrong attempts yet.</p>`;
  return wrong.map((attempt) => {
    const q = questionMap[attempt.question_id];
    const vocabItem = itemMap[q?.target_item_id];
    return `
      <article class="wrong-line">
        <strong>${html(attempt.lesson_id)} · ${html(q?.question_text || attempt.question_id)}</strong>
        <small>Your ${html(attempt.user_answer)} (${html(optionText(q, attempt.user_answer))}) · Correct ${html(attempt.correct_answer)} (${html(optionText(q, attempt.correct_answer))}) · ${seconds(attempt.response_time_seconds)} · ${html(errorCodeLabel(attempt.error_code || attempt.default_error_code))}</small>
        ${vocabItem?.chinese ? `<div class="vocab-card"><p class="vocab-chinese">${html(vocabItem.chinese)}</p>${vocabItem.example ? `<p class="vocab-example">${html(vocabItem.example)}</p>` : ""}</div>` : ""}
      </article>
    `;
  }).join("");
}

export function renderAnswerRecordList() {
  const questionMap = byId(state.questions, "question_id");
  const attempts = state.attempts.slice(-30).reverse();
  if (!attempts.length) return `<p class="muted-note">No answer records yet. Start a lesson and submit an answer to create the first record.</p>`;
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
              <span>${html(attempt.question_type || q?.type || "")}</span>
              <span>Your ${html(attempt.user_answer)}: ${html(optionText(q, attempt.user_answer))}</span>
              <span>Correct ${html(attempt.correct_answer)}: ${html(optionText(q, attempt.correct_answer))}</span>
              <span>${attempt.is_correct ? "Correct" : "Wrong"}</span>
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
    VOCAB_UNKNOWN:     "V1 Word Family 詞族基礎",
    VOCAB_WEAK_RECALL: "V1 Review Sessions 間隔複習",
    SCENE_VOCAB_GAP:   "V2 Business Context 商業情境",
    FORMAL_PHRASE:     "V4 Formal Phrases（規劃中）",
    FALSE_FRIEND:      "V1 False Friends 題型",
    TIME_PRESSURE:     "各階段 Speed Drill 練習",
    WORD_FAMILY_POS:   "V1 Word Family 詞族練習",
    COLLOCATION_PREP:  "V3 Collocation 搭配詞練習",
    CARELESS:          "放慢作答速度，仔細閱讀選項",
    REPEATED_ERROR:    "加入複習佇列，集中練習弱點"
  };

  const weakItems = Object.entries(wrongByCode)
    .sort((a, b) => b[1] - a[1])
    .map(([code, count]) => {
      const label = errorCodeLabel(code);
      const rec = codeRec[code] || "General Practice";
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
  const attempts = state.attempts.filter((attempt) => attempt.session_id === sessionId && !attempt.is_correct);
  if (!attempts.length) {
    return `
      ${isV0 ? renderV0Diagnostic(sessionId) : ""}
      <section class="tracker-panel">
        <h3>Error Review + Scheduling</h3>
        <p class="tracker-bigline">No incorrect answers in this session.</p>
        <button class="button primary" type="button" onclick="VocabTracker.closeSessionReview()">開始下一課</button>
      </section>
    `;
  }
  return `
    ${isV0 ? renderV0Diagnostic(sessionId) : ""}
    <section class="tracker-panel">
      <h3>Error Review + Scheduling</h3>
      <p class="muted-note">Confirm or change the actual cause. Confirmed errors update attempts, error logs, item mastery, and review queue.</p>
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
                <span>Your ${html(attempt.user_answer)}: ${html(optionText(q, attempt.user_answer))}</span>
                <span>Correct ${html(attempt.correct_answer)}: ${html(optionText(q, attempt.correct_answer))}</span>
              </div>
              <p class="explanation">${html(q?.explanation_zh || "")}</p>
              ${vocabItem?.chinese ? `<div class="vocab-card"><p class="vocab-chinese">${html(vocabItem.chinese)}</p>${vocabItem.example ? `<p class="vocab-example">${html(vocabItem.example)}</p>` : ""}</div>` : ""}
              ${renderGrammarLink(q?.grammar_link_id)}
              <label class="field-label">Error code</label>
              <select data-error-attempt="${html(attempt.attempt_id)}">
                ${window.VocabScoring.ERROR_CODES.map((code) => `<option value="${code}" ${(attempt.error_code || attempt.default_error_code) === code ? "selected" : ""}>${ERROR_CODE_LABELS[code] || code}</option>`).join("")}
              </select>
            </article>
          `;
        }).join("")}
      </div>
      <div class="tracker-actions">
        <button class="button primary" type="button" onclick="VocabTracker.confirmSessionErrors()">Save Confirmed Error Codes</button>
        <button class="button secondary" type="button" onclick="VocabTracker.closeSessionReview()">Skip</button>
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
  setNotice("Error codes saved and review queue updated.", "ok");
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
  callRender();
}
