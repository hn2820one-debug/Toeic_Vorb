import {
  state,
  html,
  seconds,
  byId,
  optionText,
  setNotice,
  loadData
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
  const rows = visibleQueue.map((entry) => `
    <article class="queue-card priority-${entry.priority}">
      <div>
        <strong>${html(items[entry.item_id]?.base_word || entry.item_id)}</strong>
        <p>${html(entry.reason)} · ${html(entry.review_status || "pending")} · due ${html(entry.due_date)} · ${entry.question_ids?.length || 0} questions</p>
      </div>
      <div class="queue-actions">
        <span class="priority-pill">P${entry.priority}</span>
        <button class="button small" type="button" onclick="VocabTracker.markQueueDone('${html(entry.review_id)}')">Done</button>
      </div>
    </article>
  `).join("");
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
      ${recentOutcomes.length ? `<div class="queue-list">${recentOutcomes.map((entry) => `
        <article class="queue-card">
          <div>
            <strong>${html(items[entry.item_id]?.base_word || entry.item_id)}</strong>
            <p>${html(entry.review_status || "reviewed")} · ${html(entry.review_correct_count || 0)}/${html(entry.review_attempt_count || 0)} review correct · ${html(entry.last_reviewed_at || "")}</p>
          </div>
          <span class="priority-pill status-${html(entry.review_status || "pending")}">${html(entry.review_status || "pending")}</span>
        </article>
      `).join("")}</div>` : `<p class="muted-note">No review outcomes yet.</p>`}
    </section>
    <section class="tracker-panel">
      <h3>Recent Wrong Attempts</h3>
      ${renderWrongAttemptList()}
    </section>
  `;
}

export function setReviewFilter(filter) {
  state.reviewFilter = filter || "due";
  callRender();
}

export function renderWrongAttemptList() {
  const questionMap = byId(state.questions, "question_id");
  const wrong = state.attempts.filter((attempt) => !attempt.is_correct).slice(-20).reverse();
  if (!wrong.length) return `<p class="muted-note">No wrong attempts yet.</p>`;
  return wrong.map((attempt) => {
    const q = questionMap[attempt.question_id];
    return `
      <article class="wrong-line">
        <strong>${html(attempt.lesson_id)} · ${html(q?.question_text || attempt.question_id)}</strong>
        <small>Your ${html(attempt.user_answer)} (${html(optionText(q, attempt.user_answer))}) · Correct ${html(attempt.correct_answer)} (${html(optionText(q, attempt.correct_answer))}) · ${html(attempt.error_code || attempt.default_error_code)}</small>
      </article>
    `;
  }).join("");
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

export function renderSessionErrorReview(sessionId) {
  const questionMap = byId(state.questions, "question_id");
  const attempts = state.attempts.filter((attempt) => attempt.session_id === sessionId && !attempt.is_correct);
  if (!attempts.length) {
    return `
      <section class="tracker-panel">
        <h3>Error Review + Scheduling</h3>
        <p class="tracker-bigline">No incorrect answers in this session.</p>
        <button class="button primary" type="button" onclick="VocabTracker.closeSessionReview()">Back to Dashboard</button>
      </section>
    `;
  }
  return `
    <section class="tracker-panel">
      <h3>Error Review + Scheduling</h3>
      <p class="muted-note">Confirm or change the actual cause. Confirmed errors update attempts, error logs, item mastery, and review queue.</p>
      <div class="error-review-list">
        ${attempts.map((attempt) => {
          const q = questionMap[attempt.question_id];
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
              ${renderGrammarLink(q?.grammar_link_id)}
              <label class="field-label">Error code</label>
              <select data-error-attempt="${html(attempt.attempt_id)}">
                ${window.VocabScoring.ERROR_CODES.map((code) => `<option value="${code}" ${(attempt.error_code || attempt.default_error_code) === code ? "selected" : ""}>${code}</option>`).join("")}
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
  callSetView("today");
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
  callSetView("today");
}

export async function markQueueDone(reviewId) {
  const entry = await window.VocabDB.get("review_queue", reviewId);
  if (!entry) return;
  await window.VocabDB.put("review_queue", { ...entry, status: "done", completed_at: window.VocabScoring.localIso() });
  await loadData();
  callRender();
}
