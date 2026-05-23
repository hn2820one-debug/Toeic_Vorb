import {
  LESSON_STEPS,
  state,
  html,
  pct,
  seconds,
  average,
  byId,
  currentLesson,
  topCounts,
  loadData,
  setNotice,
  optionText,
  questionTypeLabel,
  lessonTypeLabel,
  learningGuidance,
  renderQuestionText,
  normalizeHighlightedText,
  addWordHighlight,
  removeWordHighlight,
  wordHighlightsForQuestion,
  wordHighlightSummary
} from "../state.js";
import { buildStageSealReadiness } from "./today.js";

export const REVIEW_LESSON_ID = "REVIEW_QUEUE";
const REVIEW_QUESTION_LIMIT = 20;
const MOBILE_REVIEW_CHUNK = 5;
export const SPEED_TIME_LIMIT = window.VocabScoring?.targetTime("speed_drill") ?? 8;
const MOBILE_LESSON_BREAKPOINT = 860;

const STAGE_ORDER = ["V0", "V1", "V2", "V3"];
const COMPACT_STEP_LABELS = {
  previous_review: "複習",
  new_vocabulary: "新字",
  pattern_focus: "搭配",
  toeic_practice: "TOEIC",
  error_review_scheduling: "錯題"
};

function markDriveChange(reason) {
  window.VocabTracker?.markGoogleDriveLocalChange?.(reason);
}

function findPreviousStageId(stageId) {
  const idx = STAGE_ORDER.indexOf(stageId);
  return idx > 0 ? STAGE_ORDER[idx - 1] : null;
}

function isCompactLessonViewport() {
  return typeof window !== "undefined"
    && Boolean(window.matchMedia?.(`(max-width: ${MOBILE_LESSON_BREAKPOINT}px)`).matches);
}

function countDueReviewQueue() {
  const today = window.VocabScoring.localDate();
  return state.reviewQueue.filter((entry) => (
    entry.status === "pending"
    && (!entry.due_date || String(entry.due_date) <= today)
  )).length;
}

function lessonDifficultyHint(lesson) {
  if (!lesson) return "一般";
  if (lesson.lesson_type === "speed_drill") return "速度";
  if (lesson.lesson_type === "mixed_review") return "複習";
  if (lesson.lesson_type === "diagnostic") return "診斷";
  const minutes = Number(lesson.estimated_minutes || 20);
  if (minutes >= 25) return "進階";
  if (minutes >= 18) return "標準";
  return "入門";
}

function buildPostLessonSummary(session, metrics) {
  return {
    lesson_id: session.lesson_id,
    lesson_title: session.lesson_title,
    correct_questions: metrics.correct,
    total_questions: metrics.total,
    wrong_questions: metrics.wrong,
    accuracy: metrics.accuracy,
    due_review_count: countDueReviewQueue(),
    completed_at: window.VocabScoring.localIso()
  };
}

function resetLessonRuntimeScroll() {
  if (typeof window === "undefined") return;
  window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
  const view = document.getElementById("tracker-view");
  if (view) view.scrollTop = 0;
  const anchor = document.querySelector(".runtime-shell .question-text, .runtime-shell .question-panel");
  if (anchor) {
    anchor.scrollIntoView({ block: "start", behavior: "auto" });
    return;
  }
  document.querySelector(".runtime-shell")?.scrollIntoView({ block: "start", behavior: "auto" });
}

function runtimeStepLabel(step, compact) {
  if (!compact) return step.label;
  return COMPACT_STEP_LABELS[step.id] || step.label;
}

function renderRuntimeActions(session, progress, options = {}) {
  const {
    includePrevious = false,
    includeSkip = false,
    includePause = true,
    includeExit = true
  } = options;
  const compact = isCompactLessonViewport();
  const flowButtons = [];
  const utilityButtons = [];

  if (includePrevious && (!compact || progress.index > 0)) {
    flowButtons.push(`
      <button class="button secondary" type="button" onclick="VocabTracker.previousQuestion()" ${progress.index <= 0 ? "disabled" : ""}>上一題</button>
    `);
  }
  if (includeSkip) {
    flowButtons.push(`
      <button class="button secondary" type="button" onclick="VocabTracker.nextQuestion()">${compact ? "先略過這題" : "略過 / 下一題"}</button>
    `);
  }
  if (includePause) {
    utilityButtons.push(`
      <button class="button secondary" type="button" onclick="VocabTracker.togglePause()">${session.paused ? "繼續" : "暫停"}</button>
    `);
  }
  if (includeExit) {
    utilityButtons.push(`
      <button class="button ${compact ? "warning" : "secondary"}" type="button" onclick="VocabTracker.exitLesson()">離開</button>
    `);
  }

  const buttons = [...flowButtons, ...utilityButtons];
  if (!buttons.length) return "";
  if (!compact) {
    return `<div class="runtime-actions">${buttons.join("")}</div>`;
  }

  const summaryTitle = flowButtons.length ? "其他操作" : "暫停與離開";
  const summaryNote = flowButtons.length ? "略過、返回或離開時再展開" : "需要中斷或離開時再展開";
  const groups = [];
  if (flowButtons.length) {
    groups.push(`<div class="runtime-action-group">${flowButtons.join("")}</div>`);
  }
  if (utilityButtons.length) {
    groups.push(`<div class="runtime-action-group runtime-action-group-utility">${utilityButtons.join("")}</div>`);
  }
  return `
    <details class="runtime-action-tray" data-testid="runtime-action-tray">
      <summary>
        <span class="runtime-action-tray-title">
          <strong>${summaryTitle}</strong>
          <small>${summaryNote}</small>
        </span>
      </summary>
      <div class="runtime-action-groups">${groups.join("")}</div>
    </details>
  `;
}

function checkStageSealGate(lessonId) {
  const lesson = state.lessons.find((l) => l.lesson_id === lessonId);
  if (!lesson) return null;
  const prevStageId = findPreviousStageId(lesson.stage);
  if (!prevStageId) return null;
  const prevStageMeta = (state.curriculum?.stages || []).find((s) => s.stage === prevStageId);
  if (!prevStageMeta) return null;
  const readiness = buildStageSealReadiness(prevStageMeta);
  if (readiness.ready || readiness.allSealed) return null;
  return readiness;
}

function renderStageSealWarning({ lessonId, warning }) {
  const lesson = state.lessons.find((l) => l.lesson_id === lessonId);
  const reasons = warning.reasons || [];
  const isNoData = Boolean(warning.noData);
  const title = isNoData ? "階段資料不足" : "階段準備度檢查";
  const bigline = isNoData
    ? `${html(warning.stage)} ${html(warning.stageName)} 尚無足夠資料可判斷`
    : `${html(warning.stage)} ${html(warning.stageName)} 尚未達到就緒條件`;
  const note = isNoData
    ? `你正要開始 <strong>${html(lessonId)}</strong>（${html(lesson?.stage || "")} 階段），但上一階段目前沒有足夠的課程或作答資料可判斷。這不是失敗狀態，而是資料尚未建立或尚未完成。`
    : `你正要開始 <strong>${html(lessonId)}</strong>（${html(lesson?.stage || "")} 階段），但上一階段還沒有通過準備度條件。`;
  const reasonTitle = isNoData ? "目前缺少的資料：" : "尚未就緒的原因：";
  const actions = isNoData
    ? `
        <button class="button secondary" type="button" onclick="VocabTracker.setView('today')">回 Today</button>
        <button class="button secondary" type="button" onclick="VocabTracker.setView('roadmap')">查看課程地圖</button>
        <button class="button primary" type="button" data-testid="stage-gate-continue" onclick="VocabTracker.confirmStartLesson()">仍要繼續</button>
        <button class="button secondary" type="button" onclick="VocabTracker.cancelStageSeal()">取消</button>
      `
    : `
        <button class="button secondary" type="button" onclick="VocabTracker.startReviewMode('due')">先去複習模式</button>
        <button class="button primary" type="button" data-testid="stage-gate-continue" onclick="VocabTracker.confirmStartLesson()">仍要繼續</button>
        <button class="button secondary" type="button" onclick="VocabTracker.cancelStageSeal()">取消</button>
      `;
  return `
    <section class="tracker-panel stage-gate-warning" data-testid="stage-gate-warning">
      <h3>${title}</h3>
      <p class="tracker-bigline">${bigline}</p>
      <p class="muted-note">${note}</p>
      ${reasons.length ? `
        <div class="stage-gate-reasons" data-testid="stage-gate-reasons">
          <strong>${reasonTitle}</strong>
          <ul>${reasons.map((r) => `<li>${html(r)}</li>`).join("")}</ul>
        </div>
      ` : ""}
      <div class="tracker-actions">
        ${actions}
      </div>
    </section>
  `;
}

const lessonRuntime = {
  render: null,
  setView: null,
  lessonElapsedSeconds: null
};

export function configureLessonView(deps) {
  lessonRuntime.render = deps?.render || lessonRuntime.render;
  lessonRuntime.setView = deps?.setView || lessonRuntime.setView;
  lessonRuntime.lessonElapsedSeconds = deps?.lessonElapsedSeconds || lessonRuntime.lessonElapsedSeconds;
}

function callRender() {
  if (typeof lessonRuntime.render !== "function") {
    throw new Error("Lesson module render callback is not configured.");
  }
  lessonRuntime.render();
}

function callSetView(view) {
  if (typeof lessonRuntime.setView === "function") {
    lessonRuntime.setView(view);
    return;
  }
  state.view = view;
  callRender();
}

function callLessonElapsedSeconds() {
  if (typeof lessonRuntime.lessonElapsedSeconds !== "function") {
    throw new Error("Lesson module lessonElapsedSeconds callback is not configured.");
  }
  return lessonRuntime.lessonElapsedSeconds();
}

function isReviewSession(session) {
  return session?.mode === "review_queue";
}

export function isSpeedSession(session) {
  return session?.mode === "speed_drill";
}

function reviewFilterLabel(filter) {
  return {
    due: "今日到期",
    high_priority: "高優先",
    repeated: "反覆錯誤",
    all: "全部待處理"
  }[filter] || "今日到期";
}

function highlightRegexForTerms(terms) {
  const parts = [...new Set(terms.map((term) => String(term || "").trim()).filter(Boolean))]
    .sort((a, b) => b.length - a.length)
    .map((term) => term
      .split(/\s+/)
      .map((part) => part.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
      .join("\\s+"));
  return parts.length ? new RegExp(`\\b(${parts.join("|")})\\b`, "gi") : null;
}

function renderTextSegment(text) {
  return html(text).replace(/_{4,}/g, (m) => `<span class="blank-token">${m}</span>`);
}

function renderHighlightableText(text, question) {
  const sessionId = state.activeSession?.session_id || "";
  const terms = wordHighlightsForQuestion(question?.question_id, sessionId).map((row) => row.normalized || row.text);
  const regex = highlightRegexForTerms(terms);
  if (!regex) return renderQuestionText(text);

  const value = String(text || "");
  let output = "";
  let lastIndex = 0;
  let match;
  while ((match = regex.exec(value)) !== null) {
    output += renderTextSegment(value.slice(lastIndex, match.index));
    output += `<mark class="word-highlight-mark">${html(match[0])}</mark>`;
    lastIndex = match.index + match[0].length;
  }
  output += renderTextSegment(value.slice(lastIndex));
  return output;
}

function renderRuntimeModeBadge(session) {
  if (!session) return "";
  if (isReviewSession(session)) {
    return `<span class="runtime-mode-badge review">複習模式</span>`;
  }
  if (isSpeedSession(session)) {
    return `<span class="runtime-mode-badge speed">速度模式 · 點選即答</span>`;
  }
  return "";
}

function renderWordHighlightPanel(question) {
  const session = state.activeSession;
  if (!session || !question) return "";
  const compact = isCompactLessonViewport();
  const questionHighlights = wordHighlightsForQuestion(question.question_id, session.session_id);
  const lessonHighlights = (state.wordHighlights || []).filter((row) => (
    row.status !== "removed"
    && row.session_id === session.session_id
    && row.lesson_id === session.lesson_id
  ));
  const summary = wordHighlightSummary(lessonHighlights).slice(0, 8);
  const totalOccurrences = lessonHighlights.reduce((sum, row) => sum + Number(row.occurrences || 1), 0);
  const chips = questionHighlights.length
    ? questionHighlights.map((row) => `
        <button class="word-highlight-chip active" type="button" onclick="VocabTracker.removeLessonHighlight('${html(row.highlight_id)}')" aria-label="移除 ${html(row.text)}">
          <span>${html(row.text)}</span>
          <small>${Number(row.occurrences || 1)}</small>
        </button>
      `).join("")
    : `<span class="word-highlight-chip empty">尚未標記</span>`;
  const summaryChips = summary.length
    ? `<div class="word-highlight-summary">${summary.map((row) => `
        <span class="word-highlight-chip summary">
          ${html(row.text)}
          <small>${row.occurrences}</small>
        </span>
      `).join("")}</div>`
    : "";

  const panelBody = `
    <div class="word-highlight-head">
      <strong>不熟單字</strong>
      <span>本題 ${questionHighlights.length} · 本輪 ${totalOccurrences}</span>
    </div>
    <div class="word-highlight-chips" data-testid="word-highlight-current">${chips}</div>
    ${summaryChips}
  `;

  if (compact) {
    return `
      <details class="word-highlight-details compact" data-testid="word-highlight-panel">
        <summary>標記不熟單字（本題 ${questionHighlights.length}）</summary>
        <aside class="word-highlight-panel">${panelBody}</aside>
      </details>
    `;
  }

  return `
    <aside class="word-highlight-panel" data-testid="word-highlight-panel">
      ${panelBody}
    </aside>
  `;
}

function selectionRoot(selection) {
  const node = selection?.anchorNode;
  if (!node) return null;
  return node.nodeType === Node.ELEMENT_NODE ? node : node.parentElement;
}

function selectionInLessonText(selection) {
  return Boolean(selectionRoot(selection)?.closest("[data-highlight-capture-zone]"));
}

function hasPendingLessonTextSelection() {
  const selection = window.getSelection?.();
  return Boolean(
    selection
    && !selection.isCollapsed
    && normalizeHighlightedText(selection.toString())
    && selectionInLessonText(selection)
  );
}

function suppressAnswerClickAfterHighlight() {
  return Date.now() < Number(state.wordHighlightSuppressAnswerUntil || 0);
}

function isDue(entry, today) {
  return !entry.due_date || String(entry.due_date) <= today;
}

function reviewEntryMatchesFilter(entry, filter, today) {
  if (entry.status !== "pending") return false;
  if (filter === "high_priority") return Number(entry.priority || 0) >= 5;
  if (filter === "repeated") return entry.reason === "repeated_error" || entry.review_status === "repeated_error" || entry.review_state === "repeated_error" || Number(entry.priority || 0) >= 5;
  if (filter === "all") return true;
  return isDue(entry, today);
}

function reviewSort(a, b) {
  return (Number(b.priority || 0) - Number(a.priority || 0))
    || String(a.due_date || "").localeCompare(String(b.due_date || ""))
    || String(b.updated_at || b.created_at || "").localeCompare(String(a.updated_at || a.created_at || ""));
}

function availableQuestionsForEntry(entry, questionMap) {
  const direct = (entry.question_ids || []).map((id) => questionMap[id]).filter(Boolean);
  const fallback = state.questions
    .filter((question) => question.target_item_id === entry.item_id && !direct.some((row) => row.question_id === question.question_id))
    .sort((a, b) => String(a.lesson_id || "").localeCompare(String(b.lesson_id || "")));
  return [...direct, ...fallback];
}

export function getReviewCandidates(filter = "due", limit = REVIEW_QUESTION_LIMIT) {
  const today = window.VocabScoring.localDate();
  const questionMap = byId(state.questions, "question_id");
  const eligibleEntries = state.reviewQueue
    .filter((entry) => reviewEntryMatchesFilter(entry, filter, today))
    .sort(reviewSort);
  const usedQuestionIds = new Set();
  const rows = [];
  const queueByQuestion = {};

  function addQuestion(entry, question) {
    if (!question || usedQuestionIds.has(question.question_id) || rows.length >= limit) return false;
    usedQuestionIds.add(question.question_id);
    rows.push({ question, step: "review_queue" });
    queueByQuestion[question.question_id] = [...(queueByQuestion[question.question_id] || []), entry.review_id];
    return true;
  }

  for (const entry of eligibleEntries) {
    addQuestion(entry, availableQuestionsForEntry(entry, questionMap)[0]);
    if (rows.length >= limit) break;
  }

  if (rows.length < Math.min(limit, eligibleEntries.length * 2)) {
    for (const entry of eligibleEntries) {
      const options = availableQuestionsForEntry(entry, questionMap).slice(1);
      for (const question of options) {
        addQuestion(entry, question);
        if (rows.length >= limit) break;
      }
      if (rows.length >= limit) break;
    }
  }

  const usedReviewIds = new Set(Object.values(queueByQuestion).flat());
  return {
    filter,
    label: reviewFilterLabel(filter),
    entries: eligibleEntries.filter((entry) => usedReviewIds.has(entry.review_id)),
    rows,
    queueByQuestion
  };
}

function buildReviewRuntimeFromSession(session) {
  const questionMap = byId(state.questions, "question_id");
  return (session?.question_ids || []).map((questionId) => ({
    question: questionMap[questionId],
    step: session.step_by_question?.[questionId] || "review_queue"
  })).filter((row) => row.question);
}

function renderFeedbackLearningDetails(question, userAnswer, isCorrect, compact) {
  const inner = `
    ${question.explanation_zh ? `<p class="feedback-explanation">${html(question.explanation_zh)}</p>` : ""}
    ${renderPostAnswerLearningCard(question, userAnswer, isCorrect)}
    ${renderWordHighlightPanel(question)}
  `;
  if (!inner.trim()) return "";
  if (compact) {
    return `
      <details class="feedback-learning-details compact" data-testid="feedback-learning-details">
        <summary>查看解析與詞彙重點</summary>
        ${inner}
      </details>
    `;
  }
  return inner;
}

function renderFeedback(question, userAnswer, isCorrect, hasMore) {
  const progress = runtimeProgress();
  const compact = isCompactLessonViewport();
  const lockedSeconds = state.lockedQuestionSeconds;
  const lockedNote = lockedSeconds !== null && lockedSeconds !== undefined
    ? `<small class="feedback-timer-lock">時間已鎖定 · ${Number(lockedSeconds).toFixed(1)}s</small>`
    : "";
  const remaining = Math.max(0, progress.total - progress.answered);

  const buttons = ["A", "B", "C", "D"].map((letter) => {
    const extraClass = letter === question.correct_answer
      ? "feedback-correct"
      : letter === userAnswer && !isCorrect ? "feedback-wrong" : "";
    return `
      <button class="answer-button ${extraClass}" type="button" disabled>
        <strong>${letter}</strong>
        <span data-highlight-source="option_${letter}">${renderHighlightableText(question.options?.[letter] || "", question)}</span>
      </button>
    `;
  }).join("");

  return `
    <article class="question-panel feedback-panel feedback-panel-enter" data-testid="feedback-panel" role="status" aria-live="polite" aria-label="答題結果" data-highlight-capture-zone="lesson" onmouseup="VocabTracker.captureLessonHighlight()">
      <div class="feedback-momentum ${compact ? "micro-feedback-subtle" : ""}" data-testid="feedback-momentum">
        <span>已完成 <strong>${progress.answered} / ${progress.total}</strong></span>
        <span class="muted-note">${remaining > 0 ? `剩 ${remaining} 題` : "最後一題"}</span>
      </div>
      <div class="feedback-banner ${isCorrect ? "correct" : "wrong"}">
        <span>${isCorrect ? "✓ 答對" : "✗ 答錯，已標示正解"}</span>
        ${compact ? lockedNote : ""}
      </div>
      <p class="question-text" data-highlight-source="question_text">${renderHighlightableText(question.question_text, question)}</p>
      <div class="answer-grid">${buttons}</div>
      ${renderFeedbackLearningDetails(question, userAnswer, isCorrect, compact)}
      <div class="tracker-actions feedback-advance-row">
        <button class="button primary" type="button" data-testid="feedback-advance" onclick="VocabTracker.advanceAfterFeedback()">${hasMore ? "下一題" : "查看摘要"}</button>
      </div>
    </article>
  `;
}

function targetItemForQuestion(question) {
  return state.vocabItems.find((item) => item.item_id === question?.target_item_id);
}

function renderFinishPanel(session, progress) {
  const compact = isCompactLessonViewport();
  const isReview = isReviewSession(session);
  const answers = Object.values(session?.answers || {});
  const correctCount = answers.filter((answer) => answer.is_correct).length;
  const recapTotal = Math.max(progress.total, answers.length);
  const recapAccuracy = recapTotal ? correctCount / recapTotal : 0;
  const finishTitle = isReview ? "複習完成" : "第 5 步：錯題回顧與安排";
  const finishNote = isReview
    ? (compact
      ? "儲存後會更新複習佇列狀態，可稍後再回 Mistakes 查看。"
      : "產生這次複習摘要，並更新已修正 / 仍不穩 / 反覆錯誤的佇列狀態。")
    : (compact
      ? "下一步會進入錯題回顧；可先確認錯因或稍後再處理。"
      : "先產生本次課程摘要、套用精熟度判定，再確認錯因。");
  const finishButton = isReview ? "完成複習" : "完成課程";
  const localNote = lessonLocalSaveNote();

  return `
    <article class="tracker-panel finish-panel ${isReview ? "review-finish-panel" : ""}" data-testid="finish-panel">
      <div class="finish-panel-summary" data-testid="finish-panel-summary">
        <h3>${finishTitle}</h3>
        <p class="tracker-bigline">${progress.answered}/${progress.total} 題已即時儲存</p>
        <div class="finish-recap-metrics" data-testid="finish-recap-metrics">
          <span>正確 <strong>${pct(recapAccuracy)}</strong></span>
          <span>${correctCount} / ${recapTotal} 題</span>
          ${!isReview && compact ? `<span class="muted-note">精熟度將在儲存後更新</span>` : ""}
        </div>
        ${isReview && compact ? `<p class="finish-panel-hint muted-note">微型複習回合完成 · 可隨時再做下一組</p>` : ""}
        ${!isReview && compact ? `<p class="finish-panel-hint muted-note">主流程：完成後進入錯題回顧</p>` : ""}
        ${localNote ? `<p class="finish-panel-hint muted-note">${html(localNote)}</p>` : ""}
      </div>
      <p class="muted-note">${finishNote}</p>
      <div class="tracker-actions finish-panel-actions">
        <button class="button primary" type="button" data-testid="finish-lesson" onclick="VocabTracker.finishLesson()">${finishButton}</button>
      </div>
    </article>
  `;
}

function renderQuestionGuidance(question) {
  const compact = isCompactLessonViewport();
  return `
    <details class="question-guidance ${compact ? "compact" : ""}" data-testid="question-guidance" ${compact ? "" : "open"}>
      <summary>
        <span class="question-guidance-title">
          <strong>${html(questionTypeLabel(question.type))}</strong>
          <small>${compact ? "點開查看答題提示" : "答題提示"}</small>
        </span>
      </summary>
      <p>${html(learningGuidance(question))}</p>
    </details>
  `;
}

function renderPostAnswerLearningCard(question, userAnswer, isCorrect) {
  const item = targetItemForQuestion(question);
  const grammarLink = question.grammar_link_id ? state.grammarLinks?.[question.grammar_link_id] : null;
  const correctText = optionText(question, question.correct_answer);
  return `
    <aside class="learning-card ${isCorrect ? "correct" : "review"}">
      <div>
        <span class="learning-card-label">${isCorrect ? "已記住" : "回顧重點"}</span>
        <strong>${html(correctText || item?.base_word || question.target_item_id || "目標詞")}</strong>
        ${item?.chinese ? `<small>${html(item.chinese)}</small>` : ""}
      </div>
      <div class="learning-card-detail">
        ${item?.example ? `<p>${html(item.example)}</p>` : ""}
        ${!isCorrect ? `<p>你的答案：${html(userAnswer)} ${html(optionText(question, userAnswer))}</p>` : ""}
        ${grammarLink ? `<p>${html(grammarLink.title_zh || question.grammar_link_id)}: ${html(grammarLink.rule_zh || "")}</p>` : ""}
      </div>
    </aside>
    ${!isCorrect && item?.chinese ? `
    <div class="vocab-card feedback-vocab">
      <p class="vocab-chinese">${html(item.chinese)}</p>
      ${item.example ? `<p class="vocab-example">${html(item.example)}</p>` : ""}
    </div>` : ""}
  `;
}

function renderLessonPreview(lesson) {
  if (!lesson) return "";
  if (lesson.lesson_type === "mixed_review") {
    return `
      <div class="lesson-preview">
        <strong>混合複習</strong>
        <span>這一課會回收先前 ${html(lesson.stage)} 課程中的 ${lesson.question_ids?.length || 0} 題複習題。</span>
      </div>
    `;
  }

  if (lesson.lesson_type === "speed_drill") {
    return `
      <div class="lesson-preview speed-preview">
        <strong>速度反應練習</strong>
        <span>${lesson.question_ids?.length || 0} 題速度題 · 每題 ${SPEED_TIME_LIMIT} 秒 · 點選即作答 · 不需再次確認</span>
      </div>
    `;
  }

  const targetItems = (lesson.target_items || [])
    .map((itemId) => state.vocabItems.find((item) => item.item_id === itemId))
    .filter(Boolean);
  if (!targetItems.length) {
    const ids = new Set([...(lesson.question_ids || []), ...(lesson.review_question_ids || [])]);
    const typeCounts = topCounts(state.questions.filter((question) => ids.has(question.question_id)), "type", 4);
    return `
      <div class="lesson-preview">
        <strong>本課重點</strong>
        <div class="lesson-focus-grid">
          ${typeCounts.length
            ? typeCounts.map(([type, count]) => `<span><b>${html(questionTypeLabel(type))}</b> ${count}</span>`).join("")
            : `<span>${html(lesson.stage_name || lesson.lesson_type || "一般課程")}</span>`}
        </div>
      </div>
    `;
  }

  return `
    <div class="lesson-preview">
      <strong>本課重點</strong>
      <div class="lesson-focus-grid">
        ${targetItems.slice(0, 8).map((item) => `
          <span><b>${html(item.base_word || item.item_id)}</b>${item.chinese ? ` ${html(item.chinese)}` : ""}</span>
        `).join("")}
      </div>
    </div>
  `;
}

function plannedLessonQuestionCount(lesson) {
  if (!lesson) return 0;
  if (lesson.lesson_type === "speed_drill") return lesson.question_ids?.length || 0;
  if (lesson.lesson_type !== "diagnostic") {
    return (lesson.question_ids?.length || 0) + (lesson.review_question_ids?.length || 0);
  }

  const ids = new Set([...(lesson.question_ids || []), ...(lesson.review_question_ids || [])]);
  const usedTargetIds = new Set();
  let total = 0;

  state.questions.forEach((question) => {
    if (!ids.has(question.question_id)) return;
    const targetId = question.target_item_id || question.question_id;
    if (usedTargetIds.has(targetId)) return;
    usedTargetIds.add(targetId);
    total += 1;
  });

  return total || lesson.target_items?.length || ids.size;
}

function renderRuntimeStatusPill() {
  const note = lessonLocalSaveNote();
  if (!note || !isCompactLessonViewport()) return "";
  return `<p class="runtime-status-pill muted-note" data-testid="runtime-status-pill" aria-live="polite">${html(note)}</p>`;
}

function lessonLocalSaveNote() {
  if (state.connectivity === "offline" || (typeof navigator !== "undefined" && navigator.onLine === false)) {
    return "離線中 · 確認答案仍會先保存到此裝置";
  }
  const autoSync = window.GoogleDriveSyncData?.getAutoSyncState?.() || { enabled: false, pending: false };
  if (autoSync.enabled && autoSync.pending) {
    return "本機已保存 · 尚有變更待同步（不影響目前作答）";
  }
  return "";
}

function renderLessonResumeBanner(session, progress) {
  if (!isCompactLessonViewport() || !session || progress.answered <= 0 || state.lessonResumeBannerDismissed) {
    return "";
  }
  const pausedNote = session.paused ? " · 課程暫停中" : "";
  return `
    <div class="lesson-resume-banner" data-testid="lesson-resume-banner">
      <div>
        <strong>已恢復本機進度</strong>
        <span>第 ${progress.index + 1} 題 · 已完成 ${progress.answered}/${progress.total}${pausedNote}</span>
      </div>
      <button class="button secondary small" type="button" data-testid="dismiss-resume-banner" onclick="VocabTracker.dismissLessonResumeBanner()">知道了</button>
    </div>
  `;
}

export function dismissLessonResumeBanner() {
  state.lessonResumeBannerDismissed = true;
  callRender();
}

function lessonStartSyncNote() {
  const autoSync = window.GoogleDriveSyncData?.getAutoSyncState?.() || { enabled: false, pending: false };
  if (typeof navigator !== "undefined" && navigator.onLine === false) {
    return "目前離線；開始後你的作答仍會先保存在本機，恢復連線後再處理同步。";
  }
  if (autoSync.pending) {
    return "本機已有待同步變更；開始後你的作答仍會先保存在此裝置，不會因同步狀態而阻擋學習。";
  }
  if (autoSync.enabled) {
    return "本機優先；確認答案後會先保存到此裝置，並在可用時再同步到 Google Drive。";
  }
  return "本機優先；確認答案後會先保存到此裝置。若之後需要跨裝置同步，可在設定連接 Google Drive。";
}

function renderLessonResumeEntry(lesson) {
  const active = window.VocabDB.loadActiveSession();
  if (!active || active.lesson_id !== lesson?.lesson_id) return "";
  const answered = Object.keys(active.answers || {}).length;
  const total = active.question_ids?.length || 0;
  const pausedNote = active.paused ? " · 已暫停" : "";
  return `
    <div class="lesson-resume-entry" data-testid="lesson-resume-entry">
      <strong>有未完成的本機進度</strong>
      <p class="muted-note">已完成 ${answered}/${total} 題${pausedNote} · 可從上次位置繼續</p>
      <p class="muted-note">重新開始會從第 1 題建立新的續作；已確認答案仍保留在本機作答紀錄。</p>
      <button class="button primary" type="button" data-testid="resume-lesson" onclick="VocabTracker.resumeLesson()">繼續上次進度</button>
    </div>
  `;
}

function renderLessonStartPanel(lesson) {
  const isSpeed = lesson?.lesson_type === "speed_drill";
  const resumeEntry = renderLessonResumeEntry(lesson);
  const questionCount = plannedLessonQuestionCount(lesson);
  const estimatedMinutes = lesson?.estimated_minutes || 20;
  const primaryDetail = isSpeed ? `${SPEED_TIME_LIMIT}s / 題` : "確認後保存";
  const primaryLabel = isSpeed ? "答題節奏" : "保存方式";
  const introNote = isSpeed
    ? "這一課是速度反應模式；點下選項就會立即作答。開始前先確認你已準備好連續快速作答。"
    : "開始前先看本課重點；真正儲存在你按下「確認答案」後才發生，未確認前不會寫入作答紀錄。";

  return `
    <section class="tracker-panel lesson-start-panel" data-testid="lesson-start-panel">
      <div class="lesson-start-head">
        <h3>開始課程</h3>
        <p class="tracker-bigline">${html(lesson?.lesson_id || "-")} · ${html(lesson?.title || "")}</p>
      </div>
      <div class="lesson-start-goal" data-testid="lesson-start-goal">
        <span><strong>目標</strong> ${html(lessonTypeLabel(lesson?.lesson_type))}</span>
        <span><strong>難度</strong> ${html(lessonDifficultyHint(lesson))} · ${html(lesson?.stage || "")}</span>
      </div>
      ${renderLessonPreview(lesson)}
      <div class="lesson-start-summary" data-testid="lesson-start-summary">
        <div class="lesson-start-stat">
          <strong>${questionCount} 題</strong>
          <span>本課題數</span>
        </div>
        <div class="lesson-start-stat">
          <strong>約 ${estimatedMinutes} 分鐘</strong>
          <span>預估時長</span>
        </div>
        <div class="lesson-start-stat">
          <strong>${html(primaryDetail)}</strong>
          <span>${html(primaryLabel)}</span>
        </div>
      </div>
      <p class="lesson-start-note">${html(introNote)}</p>
      <p class="lesson-start-sync-note" data-testid="lesson-start-sync-note">${html(lessonStartSyncNote())}</p>
      ${resumeEntry}
      ${!isSpeed ? `
      <details class="step-plan-details lesson-start-steps">
        <summary>查看學習步驟</summary>
        <div class="step-plan">
          ${LESSON_STEPS.map((step) => `<div><strong>${html(step.label)}</strong><span>${step.minutes} min</span></div>`).join("")}
        </div>
      </details>` : ""}
      <div class="tracker-actions lesson-start-actions" data-testid="lesson-start-actions">
        ${resumeEntry ? `<button class="button secondary" type="button" data-testid="restart-current-lesson" onclick="VocabTracker.startLesson('${html(lesson?.lesson_id || "")}')">重新開始</button>` : `<button class="button primary" type="button" data-testid="start-current-lesson" onclick="VocabTracker.startLesson('${html(lesson?.lesson_id || "")}')">開始目前課程</button>`}
        <button class="button ${resumeEntry ? "secondary" : "secondary"}" type="button" onclick="VocabTracker.setView('roadmap')">選擇課程</button>
        <button class="button secondary" type="button" data-testid="lesson-return-home" onclick="location.href='./index.html'">返回首頁</button>
      </div>
    </section>
  `;
}

// --- Speed Mode rendering ---

function renderSpeedLesson(lesson, row, progress) {
  const session = state.activeSession;
  const question = row.question;
  const answeredList = Object.values(session.answers || {});
  const correctSoFar = answeredList.filter((a) => a.is_correct).length;
  const wrongSoFar = answeredList.length - correctSoFar;
  const width = Math.round((progress.answered / Math.max(progress.total, 1)) * 100);

  return `
    <section class="runtime-shell speed-mode">
      <div class="speed-header">
        <div class="speed-progress-info">
          <span>Q <strong>${progress.index + 1}</strong> / ${progress.total}</span>
          <span class="speed-score">✓ ${correctSoFar} &nbsp; ✗ ${wrongSoFar}</span>
        </div>
        <div class="speed-countdown-wrapper">
          <span id="speed-countdown" class="speed-countdown">${SPEED_TIME_LIMIT}</span>
          <small>秒</small>
        </div>
        <div class="speed-lesson-label">${html(lesson?.lesson_id || session.lesson_id)}</div>
      </div>
      <div class="tracker-progress runtime-progress"><div style="width:${width}%"></div></div>
      <article class="question-panel speed-question" data-highlight-capture-zone="lesson" onmouseup="VocabTracker.captureLessonHighlight()">
        <div class="question-meta">
          ${renderRuntimeModeBadge(session)}
          <span>${html(questionTypeLabel(question.type))}</span>
          <span>目標 ${window.VocabScoring.targetTime(question.type)}s</span>
        </div>
        <p class="question-text" data-highlight-source="question_text">${renderHighlightableText(question.question_text, question)}</p>
        <div class="answer-grid">
          ${["A", "B", "C", "D"].map((letter) => `
            <button class="answer-button" type="button" onclick="VocabTracker.speedAnswerCurrent('${letter}')">
              <strong>${letter}</strong>
              <span data-highlight-source="option_${letter}">${renderHighlightableText(question.options?.[letter] || "", question)}</span>
            </button>
          `).join("")}
        </div>
        ${isCompactLessonViewport() ? "" : renderWordHighlightPanel(question)}
      </article>
      ${renderRuntimeActions(session, progress, { includePrevious: false, includeSkip: false, includePause: false })}
    </section>
  `;
}

function renderSpeedSummary(session) {
  const answers = session.answers || {};
  const rows = state.runtimeQuestions;
  const total = rows.length;
  const answeredList = Object.values(answers);
  const correct = answeredList.filter((a) => a.is_correct).length;
  const timeouts = answeredList.filter((a) => a.timeout).length;
  const accuracy = total ? correct / total : 0;
  const totalTime = answeredList.reduce((s, a) => s + (Number(a.response_time_seconds) || 0), 0);
  const avgTime = answeredList.length ? totalTime / answeredList.length : 0;
  const targetSec = window.VocabScoring.targetTime("speed_drill");
  const fastCorrect = answeredList.filter((a) => a.is_correct && Number(a.response_time_seconds) <= targetSec).length;
  const slowCorrect = answeredList.filter((a) => a.is_correct && Number(a.response_time_seconds) > targetSec).length;
  const wrong = answeredList.length - correct;

  const wrongRows = rows
    .filter((row) => {
      const a = answers[row.question.question_id];
      return a && !a.is_correct;
    })
    .map((row) => {
      const q = row.question;
      const a = answers[q.question_id];
      const item = state.vocabItems.find((i) => i.item_id === q.target_item_id);
      return `
        <article class="speed-review-row ${a.timeout ? "timeout" : "wrong"}">
          <p class="question-text small">${renderQuestionText(q.question_text)}</p>
          <div class="speed-review-meta">
            <span>你的：${html(a.user_answer)} ${html(q.options?.[a.user_answer] || "（超時）")}</span>
            <span>正解：${html(q.correct_answer)} ${html(q.options?.[q.correct_answer] || "")}</span>
            <span>${seconds(a.response_time_seconds)}${a.timeout ? " ⏱ 超時" : ""}</span>
            ${item?.chinese ? `<span>${html(item.chinese)}</span>` : ""}
          </div>
        </article>
      `;
    }).join("");

  return `
    <section class="runtime-shell speed-mode">
      <article class="tracker-panel">
        <h3>速度練習完成</h3>
        <div class="tracker-grid speed-summary-grid">
          <article class="tracker-stat ${accuracy >= 0.8 ? "" : "stat-warn"}">
            <span>正確率</span><strong>${pct(accuracy)}</strong><small>${correct}/${total}</small>
          </article>
          <article class="tracker-stat">
            <span>平均時間</span><strong>${seconds(avgTime)}</strong><small>每題</small>
          </article>
          <article class="tracker-stat">
            <span>快答正確</span><strong>${fastCorrect}</strong><small>≤ ${targetSec}s</small>
          </article>
          <article class="tracker-stat ${timeouts ? "stat-warn" : ""}">
            <span>超時</span><strong>${timeouts}</strong><small>未完成</small>
          </article>
        </div>
        <div class="speed-bucket-breakdown">
          <span class="speed-stat ok">快答正確：${fastCorrect}</span>
          <span class="speed-stat slow">較慢但答對：${slowCorrect}</span>
          <span class="speed-stat bad">超時：${timeouts}</span>
        </div>
        <div class="tracker-actions">
          <button class="button primary" type="button" onclick="VocabTracker.finishLesson()">完成並儲存</button>
          <button class="button secondary" type="button" onclick="VocabTracker.exitLesson()">離開且不儲存</button>
        </div>
      </article>
      ${wrong > 0 ? `
        <article class="tracker-panel">
          <h3>需要回顧的題目 (${wrong})</h3>
          <div class="speed-review-list">${wrongRows}</div>
        </article>
      ` : `<article class="tracker-panel"><p class="tracker-bigline">沒有錯誤，這輪很完整。</p></article>`}
    </section>
  `;
}

function renderEmptyLessonState() {
  const dueReview = countDueReviewQueue();
  return `
    <section class="tracker-panel lesson-empty-state" data-testid="lesson-empty-state">
      <h3>正式課程重建中</h3>
      <p class="tracker-bigline">目前沒有可開始的 production 課程。</p>
      <p class="muted-note">${dueReview
        ? `目前沒有新課可開始，但有 ${dueReview} 個到期複習項目；可先用複習模式延續手機微型學習。`
        : "production seed 已清空，正式課程會依 Future Plan 重新建立。你仍可查看進度、匯出本機資料，或進入題庫管理檢查 IndexedDB 內容。"}</p>
      <div class="tracker-actions">
        ${dueReview ? `<button class="button primary" type="button" onclick="VocabTracker.startReviewMode('due')">開始複習</button>` : ""}
        <button class="button secondary" type="button" onclick="VocabTracker.setView('today')">回到 Today</button>
        <button class="button secondary" type="button" onclick="VocabTracker.setView('roadmap')">課程地圖</button>
        <button class="button secondary" type="button" onclick="VocabTracker.setView('bank')">題庫管理</button>
        <button class="button ${dueReview ? "secondary" : "primary"}" type="button" onclick="VocabTracker.setView('export')">匯出完整資料封包</button>
      </div>
    </section>
  `;
}

// --- Main lesson renderer ---

export function renderLesson() {
  const active = window.VocabDB.loadActiveSession();
  if (!state.activeSession && active) {
    state.activeSession = active;
  }

  if (!state.activeSession && state.stageSealPending) {
    return renderStageSealWarning(state.stageSealPending);
  }

  if (!state.activeSession) {
    const lesson = currentLesson();
    if (!lesson) return renderEmptyLessonState();
    return renderLessonStartPanel(lesson);
  }

  const session = state.activeSession;
  const progress = runtimeProgress();
  const lesson = isReviewSession(session)
    ? {
      lesson_id: REVIEW_LESSON_ID,
      title: session.lesson_title || `複習模式 · ${reviewFilterLabel(session.review_filter)}`,
      stage: "REVIEW",
      stage_name: "錯題複習"
    }
    : state.lessons.find((row) => row.lesson_id === session.lesson_id);

  // Speed mode: all-answered → show speed summary
  if (isSpeedSession(session) && progress.answered >= progress.total && progress.total > 0) {
    return renderSpeedSummary(session);
  }

  if (state.showFeedback && !isSpeedSession(session)) {
    const row = progress.current;
    if (row) {
      const question = row.question;
      const answerData = session.answers?.[question.question_id];
      if (answerData) {
        const hasMore = progress.answered < progress.total;
        return `
          <section class="runtime-shell">
            ${renderRuntimeHeader(lesson, row.step)}
            ${renderFeedback(question, answerData.user_answer, answerData.is_correct, hasMore)}
            ${renderRuntimeActions(session, progress, { includePrevious: false, includeSkip: false })}
          </section>
        `;
      }
    }
    state.showFeedback = false;
  }

  const allAnswered = progress.answered >= progress.total && progress.total > 0;

  if (allAnswered) {
    return `
      <section class="runtime-shell">
        ${renderRuntimeHeader(lesson, "error_review_scheduling")}
        ${renderFinishPanel(session, progress)}
      </section>
    `;
  }

  const row = progress.current;
  if (!row) return `<section class="tracker-panel"><p class="muted-note">這一課目前沒有可作答題目。</p></section>`;
  const question = row.question;
  ensureQuestionClock(question.question_id);

  // Speed mode: click-to-answer, no confirm button
  if (isSpeedSession(session)) {
    return renderSpeedLesson(lesson, row, progress);
  }

  const savedAnswer = session.answers?.[question.question_id]?.user_answer || null;
  const pendingForQuestion = session.pending_answer?.question_id === question.question_id
    ? session.pending_answer.letter
    : null;
  if (!savedAnswer && pendingForQuestion && state.pendingAnswer !== pendingForQuestion) {
    state.pendingAnswer = pendingForQuestion;
  }
  const selected = savedAnswer || state.pendingAnswer;
  const compact = isCompactLessonViewport();
  const confirmNote = savedAnswer
    ? (compact ? "答案已鎖定" : "答案已鎖定並儲存，對錯會等回顧時再顯示。")
    : selected
      ? (compact ? `已選 ${html(selected)}` : `已選擇 ${html(selected)}，按下「確認答案」後才會儲存。`)
      : (compact ? "請先選擇答案" : "請先選一個答案，再按下「確認答案」。在你確認前，系統不會儲存。");

  const localNote = lessonLocalSaveNote();
  const showInlineLocalNote = localNote && !isCompactLessonViewport();

  return `
    <section class="runtime-shell lesson-runtime-shell" data-testid="lesson-runtime-shell">
      ${renderLessonResumeBanner(session, progress)}
      ${renderRuntimeHeader(lesson, row.step)}
      ${showInlineLocalNote ? `<p class="runtime-local-note" data-testid="runtime-local-note">${html(localNote)}</p>` : ""}
      <article class="question-panel" role="group" aria-label="作答區 · 第 ${progress.index + 1} 題，共 ${progress.total} 題" data-highlight-capture-zone="lesson" onmouseup="VocabTracker.captureLessonHighlight()">
        <div class="question-meta">
          ${renderRuntimeModeBadge(session)}
          <span>${html(questionTypeLabel(question.type))}</span>
          <span>Q ${progress.index + 1} / ${progress.total}</span>
          <span>目標 ${window.VocabScoring.targetTime(question.type)}s</span>
        </div>
        ${renderQuestionGuidance(question)}
        <p class="question-text" data-highlight-source="question_text">${renderHighlightableText(question.question_text, question)}</p>
        <div class="answer-grid">
          ${["A", "B", "C", "D"].map((letter) => `
            <button class="answer-button ${selected === letter ? "selected" : ""}" type="button" aria-pressed="${selected === letter ? "true" : "false"}" aria-label="選項 ${letter}" ${savedAnswer || session.paused ? "disabled" : ""} onclick="VocabTracker.answerCurrent('${letter}')">
              <strong>${letter}</strong>
              <span data-highlight-source="option_${letter}">${renderHighlightableText(question.options?.[letter] || "", question)}</span>
            </button>
          `).join("")}
        </div>
        ${renderWordHighlightPanel(question)}
        ${isCompactLessonViewport() ? "" : `<p class="keyboard-hint">快捷鍵：A / B / C / D 選擇 · Enter 確認</p>`}
        <div class="confirm-answer-row" data-testid="confirm-answer-row">
          <p class="muted-note">${confirmNote}</p>
          <button class="button primary" type="button" data-testid="confirm-answer" aria-label="確認答案" onclick="VocabTracker.confirmCurrentAnswer()" ${!selected || savedAnswer || session.paused || state.confirmingAnswer ? "disabled" : ""}>確認答案</button>
        </div>
      </article>
      ${renderRuntimeActions(session, progress, { includePrevious: true, includeSkip: true })}
    </section>
  `;
}

export function renderRuntimeHeader(lesson, currentStepId) {
  const progress = runtimeProgress();
  const session = state.activeSession;
  const compact = isCompactLessonViewport();
  const stepItems = isReviewSession(session)
    ? `
      <span class="step-chip active">${html(reviewFilterLabel(session.review_filter))}</span>
      <span class="step-chip">複習佇列</span>
      <span class="step-chip">${html(session.review_ids?.length || 0)} 個項目</span>
    `
    : LESSON_STEPS.map((step) => `
      <span class="step-chip ${step.id === currentStepId ? "active" : ""}">${html(runtimeStepLabel(step, compact))}</span>
    `).join("");
  const width = Math.round((progress.answered / Math.max(progress.total, 1)) * 100);
  return `
    <article class="runtime-head lesson-runtime-head" data-testid="lesson-runtime-head">
      <div class="runtime-head-main">
        <div class="tracker-kicker">${html(lesson?.lesson_id || session.lesson_id)}</div>
        <h2>${html(lesson?.title || session.lesson_title)}</h2>
      </div>
      <div class="runtime-timers">
        <span>課程 <strong id="lesson-elapsed">0:00</strong></span>
        <span>本題 <strong id="question-elapsed">0.0s</strong></span>
      </div>
    </article>
    <div class="step-strip">${stepItems}</div>
    <div class="tracker-progress runtime-progress ${compact ? "runtime-progress-sticky" : ""}" data-testid="runtime-progress"><div style="width:${width}%"></div></div>
    ${renderRuntimeStatusPill()}
    ${isReviewSession(session) && compact ? `<p class="review-partial-exit-hint muted-note" data-testid="review-partial-exit-hint">可先完成本組再離開；進度會保留在本機。</p>` : ""}
    ${session.paused ? `
      <div class="tracker-alert warn lesson-paused-alert" data-testid="lesson-paused-alert">
        <strong>課程已暫停</strong>
        <span>已儲存進度 ${progress.answered}/${progress.total} 題 · 計時已停止 · 按「繼續」恢復</span>
      </div>
    ` : ""}
    ${!compact && lessonLocalSaveNote() && !session.paused ? `<p class="runtime-local-note runtime-local-note-inline" data-testid="runtime-local-note">${html(lessonLocalSaveNote())}</p>` : ""}
  `;
}

function buildSpeedRuntimeQuestions(lesson, allLessonQuestions, session) {
  const questionMap = byId(allLessonQuestions, "question_id");
  if (session?.question_ids?.length) {
    return session.question_ids.map((id) => ({
      question: questionMap[id],
      step: "toeic_practice"
    })).filter((row) => row.question);
  }
  return (lesson.question_ids || [])
    .map((id) => questionMap[id])
    .filter(Boolean)
    .map((q) => ({ question: q, step: "toeic_practice" }));
}

const ITEM_REPEAT_COOLDOWN = 6;

function spreadRuntimeQuestions(rows) {
  const remaining = rows.slice();
  const ordered = [];

  while (remaining.length) {
    const recentItemIds = new Set(
      ordered
        .slice(-ITEM_REPEAT_COOLDOWN)
        .map((row) => row?.question?.target_item_id)
        .filter(Boolean)
    );
    const previousItemId = ordered.at(-1)?.question?.target_item_id || null;
    let nextIndex = remaining.findIndex((row) => !recentItemIds.has(row?.question?.target_item_id));
    if (nextIndex < 0) {
      nextIndex = remaining.findIndex((row) => (row?.question?.target_item_id || null) !== previousItemId);
    }
    if (nextIndex < 0) nextIndex = 0;
    ordered.push(remaining.splice(nextIndex, 1)[0]);
  }

  return ordered;
}

function lessonStepForQuestion(question) {
  if (!question) return "toeic_practice";
  if (question.type === "review_question") return "previous_review";
  if (["meaning_choice", "scene_vocabulary", "word_family"].includes(question.type)) return "new_vocabulary";
  if (["collocation", "formal_phrase", "false_friend"].includes(question.type)) return "pattern_focus";
  return "toeic_practice";
}

function buildDiagnosticRuntimeQuestions(lesson, questionMap) {
  const orderedIds = [...(lesson.question_ids || []), ...(lesson.review_question_ids || [])];
  const usedTargetIds = new Set();
  const rows = [];

  orderedIds.forEach((questionId) => {
    const question = questionMap[questionId];
    if (!question) return;
    const targetId = question.target_item_id || question.question_id;
    if (usedTargetIds.has(targetId)) return;
    usedTargetIds.add(targetId);
    rows.push({
      question,
      step: lessonStepForQuestion(question)
    });
  });

  return rows;
}

export function buildRuntimeQuestions(lesson, allLessonQuestions, session) {
  const questionMap = byId(allLessonQuestions, "question_id");
  if (session?.question_ids?.length) {
    return session.question_ids.map((questionId) => ({
      question: questionMap[questionId],
      step: session.step_by_question?.[questionId] || "toeic_practice"
    })).filter((row) => row.question);
  }

  if (lesson.lesson_type === "diagnostic") {
    return buildDiagnosticRuntimeQuestions(lesson, questionMap);
  }

  const masteryByItem = {};
  state.vocabItems.forEach((item) => { masteryByItem[item.item_id] = item.mastery_score || 0; });
  const itemMastery = (q) => masteryByItem[q?.target_item_id] ?? 0;

  const review = (lesson.review_question_ids || []).map((id) => questionMap[id]).filter(Boolean)
    .sort((a, b) => itemMastery(a) - itemMastery(b));
  const core = (lesson.question_ids || []).map((id) => questionMap[id]).filter(Boolean)
    .sort((a, b) => itemMastery(a) - itemMastery(b));
  const used = new Set();
  const picked = [];

  function take(candidates, count, step) {
    const rows = [];
    for (const question of candidates) {
      if (!question || used.has(question.question_id) || rows.length >= count) continue;
      used.add(question.question_id);
      rows.push({ question, step });
    }
    picked.push(...rows);
    return rows;
  }

  take(review, 4, "previous_review");
  take(core, 1, "previous_review");
  take(core.filter((q) => ["meaning_choice", "scene_vocabulary", "word_family"].includes(q.type)), 5, "new_vocabulary");
  take(core.filter((q) => ["word_family", "collocation", "formal_phrase", "false_friend"].includes(q.type)), 6, "pattern_focus");
  take(core.filter((q) => ["part5_sentence_completion", "part6_context_choice", "speed_drill"].includes(q.type)), 8, "toeic_practice");
  take([...core, ...review], 99, "toeic_practice");
  return spreadRuntimeQuestions(picked);
}

export function ensureQuestionClock(questionId) {
  const session = state.activeSession;
  if (state.currentQuestionKey !== questionId) {
    state.currentQuestionKey = questionId;
    state.questionStartedAt = session?.paused ? null : Date.now();
    const pendingForQuestion = session?.pending_answer?.question_id === questionId
      ? session.pending_answer.letter
      : null;
    state.pendingAnswer = pendingForQuestion;
    state.lockedQuestionSeconds = null;
    state.speedTimerFired = false;
  } else if (!state.questionStartedAt && session && !session.paused) {
    state.questionStartedAt = Date.now();
  }
}

export function runtimeProgress() {
  const session = state.activeSession;
  if (!session) return { answered: 0, total: 0, current: null, index: 0 };
  const total = state.runtimeQuestions.length;
  const answered = Object.keys(session.answers || {}).length;
  const index = Math.min(session.current_index || 0, total);
  return { answered, total, current: state.runtimeQuestions[index], index };
}

export async function prepareRuntime(lessonId, existingSession) {
  if (isReviewSession(existingSession) || lessonId === REVIEW_LESSON_ID) {
    const runtime = buildReviewRuntimeFromSession(existingSession);
    state.runtimeQuestions = runtime;
    return {
      lesson: {
        lesson_id: REVIEW_LESSON_ID,
        stage: "REVIEW",
        stage_name: "錯題複習",
        title: existingSession?.lesson_title || "複習模式",
        lesson_type: "review_queue",
        estimated_minutes: existingSession?.planned_minutes || 15
      },
      runtime
    };
  }

  const lesson = state.lessons.find((row) => row.lesson_id === lessonId);
  if (!lesson) throw new Error(`Lesson not found: ${lessonId}`);
  const allLessonQuestions = await window.VocabDB.getQuestionsForLesson(lesson);

  const runtime = lesson.lesson_type === "speed_drill"
    ? buildSpeedRuntimeQuestions(lesson, allLessonQuestions, existingSession)
    : buildRuntimeQuestions(lesson, allLessonQuestions, existingSession);

  state.runtimeQuestions = runtime;
  return { lesson, runtime };
}

export async function resumeLesson() {
  const active = window.VocabDB.loadActiveSession();
  if (!active?.lesson_id) {
    setNotice("目前沒有可恢復的課程進度。", "warn");
    return;
  }
  state.activeSession = active;
  state.lessonResumeBannerDismissed = false;
  state.pendingAnswer = active.pending_answer?.letter || null;
  const { runtime } = await prepareRuntime(active.lesson_id, active);
  if (!runtime.length) {
    setNotice("找不到可恢復的課程題目。", "warn");
    return;
  }
  callSetView("lesson");
}

export async function startLesson(lessonId, opts = {}) {
  if (!lessonId) {
    setNotice("目前沒有可開始的正式課程；production seed 正在重建。", "warn");
    callSetView("lesson");
    return;
  }
  if (!state.lessons.some((lesson) => lesson.lesson_id === lessonId)) {
    setNotice(`找不到課程 ${lessonId}；目前 production seed 沒有這堂課。`, "warn");
    callSetView("lesson");
    return;
  }
  const active = window.VocabDB.loadActiveSession();
  if (active && active.lesson_id === lessonId) {
    state.activeSession = active;
    const resumePending = active.pending_answer?.letter || null;
    state.pendingAnswer = resumePending;
    const { runtime } = await prepareRuntime(lessonId, active);
    if (!runtime.length) {
      window.VocabDB.saveActiveSession(null);
      state.activeSession = null;
      setNotice(`課程 ${lessonId} 目前沒有可作答題目。`, "warn");
      callSetView("lesson");
      return;
    }
    callSetView("lesson");
    return;
  }

  if (!opts.force) {
    const gateFailure = checkStageSealGate(lessonId);
    if (gateFailure) {
      state.stageSealPending = { lessonId, warning: gateFailure };
      callSetView("lesson");
      return;
    }
  }

  state.stageSealPending = null;
  const { lesson, runtime } = await prepareRuntime(lessonId, null);
  if (!runtime.length) {
    setNotice(`課程 ${lesson.lesson_id} 目前沒有可作答題目。`, "warn");
    callSetView("lesson");
    return;
  }
  const isSpeed = lesson.lesson_type === "speed_drill";
  const now = new Date();
  const session = {
    session_id: window.VocabDB.createId("ses"),
    date: window.VocabScoring.localDate(now),
    user_id: state.user?.user_id || "Keith",
    course_id: window.VocabDB.COURSE_ID,
    stage: lesson.stage,
    lesson_id: lesson.lesson_id,
    lesson_title: lesson.title,
    planned_minutes: lesson.estimated_minutes || 45,
    started_at: window.VocabScoring.localIso(now),
    started_at_ms: Date.now(),
    total_paused_ms: 0,
    paused: false,
    pause_started_at_ms: null,
    current_index: 0,
    mode: isSpeed ? "speed_drill" : undefined,
    question_ids: runtime.map((row) => row.question.question_id),
    step_by_question: Object.fromEntries(runtime.map((row) => [row.question.question_id, row.step])),
    answers: {}
  };

  state.activeSession = session;
  state.lessonResumeBannerDismissed = false;
  state.currentQuestionKey = null;
  state.questionStartedAt = null;
  state.pendingAnswer = null;
  state.lockedQuestionSeconds = null;
  state.speedTimerFired = false;
  window.VocabDB.saveActiveSession(session);
  window.VocabDB.savePrefs({ last_opened_lesson: lesson.lesson_id, current_stage: lesson.stage });
  await window.VocabDB.put("lessons", { ...lesson, status: "in_progress" });
  await loadData();
  state.activeSession = session;
  await prepareRuntime(lessonId, session);
  callSetView("lesson");
}

export async function confirmStartLesson() {
  const pending = state.stageSealPending;
  if (!pending) return;
  state.stageSealPending = null;
  await startLesson(pending.lessonId, { force: true });
}

export function cancelStageSeal() {
  state.stageSealPending = null;
  callSetView("today");
}

export async function startReviewMode(filter = "due") {
  const active = window.VocabDB.loadActiveSession();
  if (isReviewSession(active)) {
    state.activeSession = active;
    await prepareRuntime(REVIEW_LESSON_ID, active);
    callSetView("lesson");
    return;
  }

  const reviewLimit = isCompactLessonViewport() ? MOBILE_REVIEW_CHUNK : REVIEW_QUESTION_LIMIT;
  const review = getReviewCandidates(filter, reviewLimit);
  if (!review.rows.length) {
    setNotice(`目前沒有可用的「${review.label}」複習題。`, "warn");
    callSetView("mistakes");
    return;
  }

  const now = new Date();
  const session = {
    session_id: window.VocabDB.createId("rev"),
    date: window.VocabScoring.localDate(now),
    user_id: state.user?.user_id || "Keith",
    course_id: window.VocabDB.COURSE_ID,
    stage: "REVIEW",
    lesson_id: REVIEW_LESSON_ID,
    lesson_title: `複習模式 · ${review.label}`,
    planned_minutes: 15,
    started_at: window.VocabScoring.localIso(now),
    started_at_ms: Date.now(),
    total_paused_ms: 0,
    paused: false,
    pause_started_at_ms: null,
    current_index: 0,
    mode: "review_queue",
    review_filter: filter,
    review_ids: review.entries.map((entry) => entry.review_id),
    review_item_ids: review.entries.map((entry) => entry.item_id),
    queue_by_question: review.queueByQuestion,
    question_ids: review.rows.map((row) => row.question.question_id),
    step_by_question: Object.fromEntries(review.rows.map((row) => [row.question.question_id, "review_queue"])),
    answers: {}
  };

  state.activeSession = session;
  state.lessonResumeBannerDismissed = false;
  state.runtimeQuestions = review.rows;
  state.currentQuestionKey = null;
  state.questionStartedAt = null;
  state.pendingAnswer = null;
  state.lockedQuestionSeconds = null;
  state.lastReviewSummary = null;
  state.speedTimerFired = false;
  window.VocabDB.saveActiveSession(session);
  window.VocabDB.savePrefs({ current_stage: "REVIEW" });
  callSetView("lesson");
}

export function captureLessonHighlight() {
  const session = state.activeSession;
  const progress = runtimeProgress();
  const row = progress.current;
  const question = row?.question;
  const selection = window.getSelection?.();
  if (!session || !question || !selection || selection.isCollapsed || !selectionInLessonText(selection)) return;

  const text = normalizeHighlightedText(selection.toString());
  if (!text) return;

  const sourceElement = selectionRoot(selection)?.closest("[data-highlight-source]");
  const highlight = addWordHighlight({
    text,
    user_id: session.user_id,
    session_id: session.session_id,
    stage: isReviewSession(session) ? question.stage || session.stage : session.stage,
    lesson_id: isReviewSession(session) ? question.lesson_id || session.lesson_id : session.lesson_id,
    lesson_title: session.lesson_title,
    question_id: question.question_id,
    question_type: question.type,
    target_item_id: question.target_item_id,
    source: sourceElement?.dataset?.highlightSource || "lesson_text",
    context_text: question.question_text
  });
  selection.removeAllRanges();
  if (!highlight) return;
  state.wordHighlightSuppressAnswerUntil = Date.now() + 600;
  setNotice(`已標記「${highlight.text}」為不熟單字。`, "ok");
  callRender();
}

export function removeLessonHighlight(highlightId) {
  removeWordHighlight(highlightId);
  setNotice("已移除單字標記。", "ok");
  callRender();
}

export function answerCurrent(letter) {
  const session = state.activeSession;
  const progress = runtimeProgress();
  const row = progress.current;
  if (!session || !row || session.paused) return;
  if (suppressAnswerClickAfterHighlight()) return;
  if (hasPendingLessonTextSelection()) {
    captureLessonHighlight();
    return;
  }
  const question = row.question;
  if (session.answers?.[question.question_id]) return;
  state.pendingAnswer = letter;
  session.pending_answer = { question_id: question.question_id, letter };
  window.VocabDB.saveActiveSession(session);
  callRender();
}

export async function confirmCurrentAnswer() {
  const session = state.activeSession;
  const progress = runtimeProgress();
  const row = progress.current;
  if (!session || !row || session.paused || state.confirmingAnswer) return;
  const question = row.question;
  if (session.answers?.[question.question_id]) return;
  const letter = state.pendingAnswer;
  if (!letter) return;

  state.confirmingAnswer = true;
  callRender();

  try {
  const responseTime = Math.max(0.2, (Date.now() - (state.questionStartedAt || Date.now())) / 1000);
  const vocabItem = state.vocabItems.find((item) => item.item_id === question.target_item_id);
  const previousWrongCount = Number(vocabItem?.wrong_count || 0);
  const isCorrect = letter === question.correct_answer;
  const speedBucket = window.VocabScoring.speedBucket(isCorrect, responseTime, question.type);
  const reviewMode = isReviewSession(session);
  const reviewIds = reviewMode ? (session.queue_by_question?.[question.question_id] || []) : [];
  const attempt = {
    attempt_id: window.VocabDB.createId("att"),
    timestamp: window.VocabScoring.localIso(),
    user_id: session.user_id,
    course_id: session.course_id,
    stage: reviewMode ? question.stage || session.stage : session.stage,
    lesson_id: reviewMode ? question.lesson_id || session.lesson_id : session.lesson_id,
    step: reviewMode ? "review_queue" : row.step,
    session_id: session.session_id,
    question_id: question.question_id,
    question_type: question.type,
    correct_answer: question.correct_answer,
    user_answer: letter,
    is_correct: isCorrect,
    response_time_seconds: Number(responseTime.toFixed(2)),
    speed_bucket: speedBucket,
    error_code: isCorrect ? null : question.default_error_code,
    default_error_code: question.default_error_code,
    is_repeated_error: !isCorrect && previousWrongCount >= 1,
    review_priority: !isCorrect && previousWrongCount >= 2 ? 5 : !isCorrect ? 3 : 0,
    mode: reviewMode ? "review_queue" : "blind_drill",
    review_ids: reviewIds,
    review_filter: reviewMode ? session.review_filter : null,
    target_item_id: question.target_item_id,
    grammar_link_id: question.grammar_link_id || null,
    lesson_runtime: "normal",
    timeout: false
  };

  await window.VocabDB.put("attempts", attempt);
  await updateItemMastery(question, attempt);

  // Immediate review queue update: wrong → new error; slow correct → low priority review
  if (!isCorrect && !reviewMode) {
    await upsertReviewQueue(attempt, attempt.is_repeated_error ? "repeated_error" : "new_error", attempt.review_priority);
  }
  if (isCorrect && speedBucket === "slow_correct" && !reviewMode) {
    await upsertReviewQueue(attempt, "slow_correct", 2);
  }

  session.answers[question.question_id] = {
    attempt_id: attempt.attempt_id,
    user_answer: letter,
    is_correct: isCorrect,
    response_time_seconds: attempt.response_time_seconds,
    timeout: false
  };
  window.VocabDB.saveActiveSession(session);
  state.attempts.push(attempt);
  state.showFeedback = true;
  state.currentQuestionKey = question.question_id;
  state.pendingAnswer = null;
  delete session.pending_answer;
  state.questionStartedAt = null;
  state.lockedQuestionSeconds = attempt.response_time_seconds;
  window.VocabDB.saveActiveSession(session);
  callRender();
  } finally {
    state.confirmingAnswer = false;
  }
}

// Speed mode: click-to-answer with auto-advance (no confirm button, no feedback screen)
export async function speedAnswerCurrent(letter) {
  const session = state.activeSession;
  const progress = runtimeProgress();
  const row = progress.current;
  if (!session || !row || session.paused) return;
  if (suppressAnswerClickAfterHighlight()) return;
  if (hasPendingLessonTextSelection()) {
    captureLessonHighlight();
    return;
  }
  const question = row.question;
  if (session.answers?.[question.question_id]) return;

  state.speedTimerFired = false;
  const responseTime = Math.max(0.2, (Date.now() - (state.questionStartedAt || Date.now())) / 1000);
  const vocabItem = state.vocabItems.find((item) => item.item_id === question.target_item_id);
  const previousWrongCount = Number(vocabItem?.wrong_count || 0);
  const isCorrect = letter === question.correct_answer;
  const bucket = window.VocabScoring.speedBucket(isCorrect, responseTime, question.type);

  const attempt = {
    attempt_id: window.VocabDB.createId("att"),
    timestamp: window.VocabScoring.localIso(),
    user_id: session.user_id,
    course_id: session.course_id,
    stage: session.stage,
    lesson_id: session.lesson_id,
    step: "toeic_practice",
    session_id: session.session_id,
    question_id: question.question_id,
    question_type: question.type,
    correct_answer: question.correct_answer,
    user_answer: letter,
    is_correct: isCorrect,
    response_time_seconds: Number(responseTime.toFixed(2)),
    speed_bucket: bucket,
    error_code: isCorrect ? null : (question.default_error_code || "TIME_PRESSURE"),
    default_error_code: question.default_error_code,
    is_repeated_error: !isCorrect && previousWrongCount >= 1,
    review_priority: !isCorrect && previousWrongCount >= 2 ? 5 : !isCorrect ? 3 : 0,
    mode: "speed_drill",
    review_ids: [],
    review_filter: null,
    target_item_id: question.target_item_id,
    grammar_link_id: question.grammar_link_id || null,
    lesson_runtime: "speed",
    timeout: false
  };

  await window.VocabDB.put("attempts", attempt);
  await updateItemMastery(question, attempt);

  session.answers[question.question_id] = {
    attempt_id: attempt.attempt_id,
    user_answer: letter,
    is_correct: isCorrect,
    response_time_seconds: attempt.response_time_seconds,
    timeout: false
  };

  // Auto-advance to next question
  state.showFeedback = false;
  const next = nextUnansweredIndex(progress.index + 1);
  session.current_index = next >= 0 ? next : state.runtimeQuestions.length;
  state.currentQuestionKey = null;
  state.pendingAnswer = null;
  state.lockedQuestionSeconds = null;
  state.questionStartedAt = null;
  state.speedTimerFired = false;
  window.VocabDB.saveActiveSession(session);
  state.attempts.push(attempt);
  callRender();
}

// Speed mode: auto-submit as timeout when countdown expires
export async function speedTimeoutCurrent() {
  const session = state.activeSession;
  const progress = runtimeProgress();
  const row = progress.current;
  if (!session || !row) return;
  const question = row.question;
  if (session.answers?.[question.question_id]) return;
  if (state.speedTimerFired) return;
  state.speedTimerFired = true;

  const vocabItem = state.vocabItems.find((item) => item.item_id === question.target_item_id);
  const previousWrongCount = Number(vocabItem?.wrong_count || 0);

  const attempt = {
    attempt_id: window.VocabDB.createId("att"),
    timestamp: window.VocabScoring.localIso(),
    user_id: session.user_id,
    course_id: session.course_id,
    stage: session.stage,
    lesson_id: session.lesson_id,
    step: "toeic_practice",
    session_id: session.session_id,
    question_id: question.question_id,
    question_type: question.type,
    correct_answer: question.correct_answer,
    user_answer: "(timeout)",
    is_correct: false,
    response_time_seconds: SPEED_TIME_LIMIT,
    speed_bucket: "slow_wrong",
    error_code: "TIME_PRESSURE",
    default_error_code: question.default_error_code || "TIME_PRESSURE",
    is_repeated_error: previousWrongCount >= 1,
    review_priority: 4,
    mode: "speed_drill",
    review_ids: [],
    review_filter: null,
    target_item_id: question.target_item_id,
    grammar_link_id: question.grammar_link_id || null,
    lesson_runtime: "speed",
    timeout: true
  };

  await window.VocabDB.put("attempts", attempt);
  await updateItemMastery(question, attempt);

  session.answers[question.question_id] = {
    attempt_id: attempt.attempt_id,
    user_answer: "(timeout)",
    is_correct: false,
    response_time_seconds: SPEED_TIME_LIMIT,
    timeout: true
  };

  const next = nextUnansweredIndex(progress.index + 1);
  session.current_index = next >= 0 ? next : state.runtimeQuestions.length;
  state.currentQuestionKey = null;
  state.pendingAnswer = null;
  state.lockedQuestionSeconds = null;
  state.questionStartedAt = null;
  state.speedTimerFired = false;
  window.VocabDB.saveActiveSession(session);
  state.attempts.push(attempt);
  callRender();
}

export async function updateItemMastery(question, attempt) {
  const today = window.VocabScoring.localDate();
  const existing = await window.VocabDB.get("vocab_items", question.target_item_id);
  const seenCount = Number(existing?.seen_count || 0) + 1;
  const correctCount = Number(existing?.correct_count || 0) + (attempt.is_correct ? 1 : 0);
  const wrongCount = Number(existing?.wrong_count || 0) + (attempt.is_correct ? 0 : 1);
  const previousAvg = Number(existing?.avg_response_time_seconds || 0);
  const avgResponse = previousAvg
    ? ((previousAvg * Number(existing.seen_count || 0)) + attempt.response_time_seconds) / seenCount
    : attempt.response_time_seconds;
  const consecutiveFastCorrect = attempt.speed_bucket === "fast_correct"
    ? Number(existing?.consecutive_fast_correct || 0) + 1
    : attempt.is_correct ? Number(existing?.consecutive_fast_correct || 0) : 0;
  const item = {
    item_id: question.target_item_id,
    item_type: existing?.item_type || question.skill || question.type,
    base_word: existing?.base_word || question.target_item_id.replace(/^item_/, "").replace(/_/g, " "),
    variants: existing?.variants || [],
    first_seen: existing?.first_seen || today,
    last_seen: today,
    seen_count: seenCount,
    correct_count: correctCount,
    wrong_count: wrongCount,
    avg_response_time_seconds: Number(avgResponse.toFixed(2)),
    last_error_code: attempt.is_correct ? existing?.last_error_code || null : attempt.error_code,
    last_question_type: question.type,
    consecutive_fast_correct: consecutiveFastCorrect,
    stable_review_sessions: attempt.is_correct && existing?.mastery_level === "stable" && existing?.last_seen !== today
      ? Number(existing?.stable_review_sessions || 0) + 1
      : Number(existing?.stable_review_sessions || 0),
    next_review_date: attempt.is_correct ? existing?.next_review_date || null : window.VocabScoring.addDays(today, wrongCount >= 3 ? 1 : 2)
  };
  item.mastery_score = window.VocabScoring.calculateMasteryScore(item);
  item.mastery_level = consecutiveFastCorrect >= 3 && item.mastery_score >= 75 ? "stable" : window.VocabScoring.masteryLevel(item.mastery_score);
  if (item.mastery_level === "stable" && Number(item.stable_review_sessions || 0) >= 2) {
    item.mastery_level = "mastered";
    item.mastery_score = Math.max(item.mastery_score, 85);
  }
  await window.VocabDB.put("vocab_items", item);
}

export function nextUnansweredIndex(start) {
  const session = state.activeSession;
  for (let i = start; i < state.runtimeQuestions.length; i += 1) {
    const questionId = state.runtimeQuestions[i].question.question_id;
    if (!session.answers?.[questionId]) return i;
  }
  for (let i = 0; i < start; i += 1) {
    const questionId = state.runtimeQuestions[i].question.question_id;
    if (!session.answers?.[questionId]) return i;
  }
  return -1;
}

export function advanceAfterFeedback() {
  const session = state.activeSession;
  if (!session) return;
  state.showFeedback = false;
  const progress = runtimeProgress();
  const next = nextUnansweredIndex(progress.index + 1);
  session.current_index = next >= 0 ? next : state.runtimeQuestions.length;
  window.VocabDB.saveActiveSession(session);
  state.currentQuestionKey = null;
  state.pendingAnswer = null;
  delete session.pending_answer;
  state.lockedQuestionSeconds = null;
  window.VocabDB.saveActiveSession(session);
  callRender();
  if (isCompactLessonViewport()) {
    resetLessonRuntimeScroll();
    requestAnimationFrame(() => resetLessonRuntimeScroll());
  }
}

export function nextQuestion() {
  if (!state.activeSession) return;
  state.activeSession.current_index = Math.min(state.runtimeQuestions.length, (state.activeSession.current_index || 0) + 1);
  state.currentQuestionKey = null;
  state.pendingAnswer = null;
  delete state.activeSession.pending_answer;
  state.lockedQuestionSeconds = null;
  window.VocabDB.saveActiveSession(state.activeSession);
  callRender();
  if (isCompactLessonViewport()) {
    resetLessonRuntimeScroll();
    requestAnimationFrame(() => resetLessonRuntimeScroll());
  }
}

export function previousQuestion() {
  if (!state.activeSession) return;
  state.activeSession.current_index = Math.max(0, (state.activeSession.current_index || 0) - 1);
  state.currentQuestionKey = null;
  state.pendingAnswer = null;
  delete state.activeSession.pending_answer;
  state.lockedQuestionSeconds = null;
  window.VocabDB.saveActiveSession(state.activeSession);
  callRender();
  if (isCompactLessonViewport()) {
    resetLessonRuntimeScroll();
    requestAnimationFrame(() => resetLessonRuntimeScroll());
  }
}

export function togglePause() {
  const session = state.activeSession;
  if (!session) return;
  if (session.paused) {
    const pausedFor = Date.now() - (session.pause_started_at_ms || Date.now());
    session.total_paused_ms = Number(session.total_paused_ms || 0) + pausedFor;
    session.paused = false;
    session.pause_started_at_ms = null;
    if (state.questionStartedAt) state.questionStartedAt += pausedFor;
  } else {
    session.paused = true;
    session.pause_started_at_ms = Date.now();
  }
  window.VocabDB.saveActiveSession(session);
  callRender();
}

export function exitLesson() {
  const session = state.activeSession;
  if (session && isCompactLessonViewport()) {
    const progress = runtimeProgress();
    const label = isReviewSession(session) ? "複習" : "課程";
    const message = `已完成 ${progress.answered}/${progress.total} 題會保留在本機。確定離開${label}？`;
    if (!window.confirm(message)) return;
  }
  if (session) window.VocabDB.saveActiveSession(session);
  callSetView("today");
}

// --- Review outcome with SRS intervals ---

function reviewOutcomeForEntry(entry, attempts) {
  const itemAttempts = attempts.filter((attempt) => (
    attempt.target_item_id === entry.item_id || (entry.question_ids || []).includes(attempt.question_id)
  ));
  const total = itemAttempts.length;
  const correct = itemAttempts.filter((attempt) => attempt.is_correct).length;
  const wrong = total - correct;
  const fastCorrect = itemAttempts.filter((attempt) => attempt.speed_bucket === "fast_correct").length;
  const accuracy = total ? correct / total : 0;
  const today = window.VocabScoring.localDate();

  const prevConsecutive = Number(entry.consecutive_review_correct || 0);
  const prevRepeatedCount = Number(entry.repeated_error_count || 0);

  if (!total) {
    return {
      review_state: entry.review_state || entry.reason || "new_error",
      review_status: entry.review_status || "pending",
      status: entry.status,
      priority: entry.priority || 3,
      due_date: entry.due_date,
      next_review_at: entry.next_review_at || entry.due_date,
      consecutive_review_correct: prevConsecutive,
      repeated_error_count: prevRepeatedCount,
      total, correct, wrong, fastCorrect, accuracy
    };
  }

  // All correct AND all fast → strong fix signal
  if (wrong === 0 && fastCorrect === total) {
    const newConsecutive = prevConsecutive + 1;
    const reviewState = newConsecutive >= 2 ? "stable" : "fixed";
    const daysOut = newConsecutive >= 2 ? 7 : 3;
    return {
      review_state: reviewState,
      review_status: reviewState,
      status: "done",
      priority: Math.max(1, Number(entry.priority || 3) - 2),
      due_date: window.VocabScoring.addDays(today, daysOut),
      next_review_at: window.VocabScoring.addDays(today, daysOut),
      consecutive_review_correct: newConsecutive,
      repeated_error_count: prevRepeatedCount,
      total, correct, wrong, fastCorrect, accuracy
    };
  }

  // All correct but not all fast → still_weak
  if (wrong === 0) {
    return {
      review_state: "still_weak",
      review_status: "still_weak",
      status: "pending",
      priority: Math.max(2, Number(entry.priority || 3) - 1),
      due_date: window.VocabScoring.addDays(today, 2),
      next_review_at: window.VocabScoring.addDays(today, 2),
      consecutive_review_correct: prevConsecutive + 1,
      repeated_error_count: prevRepeatedCount,
      total, correct, wrong, fastCorrect, accuracy
    };
  }

  // Wrong answers → repeated_error or still_weak
  const newRepeatedCount = prevRepeatedCount + wrong;
  const isRepeated = newRepeatedCount >= 2 || entry.reason === "repeated_error" || entry.review_state === "repeated_error";
  return {
    review_state: isRepeated ? "repeated_error" : "still_weak",
    review_status: isRepeated ? "repeated_error" : "still_weak",
    status: "pending",
    priority: isRepeated ? Math.min(10, Number(entry.priority || 3) + 2) : Math.max(4, Number(entry.priority || 3)),
    due_date: window.VocabScoring.addDays(today, 1),
    next_review_at: window.VocabScoring.addDays(today, 1),
    consecutive_review_correct: 0,
    repeated_error_count: newRepeatedCount,
    total, correct, wrong, fastCorrect, accuracy
  };
}

async function finishReviewSession(session) {
  const attempts = await window.VocabDB.getByIndex("attempts", "session_id", session.session_id);
  const total = attempts.length;
  const correct = attempts.filter((attempt) => attempt.is_correct).length;
  const wrong = total - correct;
  const accuracy = total ? correct / total : 0;
  const avgTime = average(attempts.map((attempt) => attempt.response_time_seconds));
  const topErrors = topCounts(attempts.filter((attempt) => !attempt.is_correct), "error_code", 5).map(([code]) => code);
  const now = new Date();
  const sessionRecord = {
    session_id: session.session_id,
    date: window.VocabScoring.localDate(now),
    user_id: session.user_id,
    course_id: session.course_id,
    stage: "REVIEW",
    lesson_id: REVIEW_LESSON_ID,
    lesson_title: session.lesson_title || "複習模式",
    planned_minutes: session.planned_minutes || 15,
    actual_minutes: Number((callLessonElapsedSeconds() / 60).toFixed(1)),
    started_at: session.started_at,
    ended_at: window.VocabScoring.localIso(now),
    total_questions: total,
    correct_questions: correct,
    wrong_questions: wrong,
    accuracy,
    avg_response_time_seconds: Number(avgTime.toFixed(2)),
    fast_correct_count: attempts.filter((attempt) => attempt.speed_bucket === "fast_correct").length,
    slow_correct_count: attempts.filter((attempt) => attempt.speed_bucket === "slow_correct").length,
    top_error_codes: topErrors,
    mastery_status: accuracy >= 0.85 ? "review_fixed" : accuracy >= 0.6 ? "review_unstable" : "review_failed",
    next_action: wrong ? "continue_review_queue" : "review_queue_fixed",
    mode: "review_queue",
    review_filter: session.review_filter,
    review_ids: session.review_ids || []
  };

  await window.VocabDB.put("sessions", sessionRecord);
  const outcomes = [];
  for (const reviewId of session.review_ids || []) {
    const entry = await window.VocabDB.get("review_queue", reviewId);
    if (!entry) continue;
    const outcome = reviewOutcomeForEntry(entry, attempts);
    const updatedEntry = {
      ...entry,
      status: outcome.status,
      reason: outcome.review_state,
      review_state: outcome.review_state,
      priority: outcome.priority,
      due_date: outcome.due_date,
      next_review_at: outcome.next_review_at,
      consecutive_review_correct: outcome.consecutive_review_correct,
      repeated_error_count: outcome.repeated_error_count,
      review_status: outcome.review_status,
      last_review_session_id: session.session_id,
      last_reviewed_at: window.VocabScoring.localIso(now),
      review_attempt_count: Number(entry.review_attempt_count || 0) + outcome.total,
      review_correct_count: Number(entry.review_correct_count || 0) + outcome.correct,
      review_wrong_count: Number(entry.review_wrong_count || 0) + outcome.wrong,
      last_review_accuracy: outcome.accuracy,
      updated_at: window.VocabScoring.localIso(now)
    };
    if (outcome.status === "done") updatedEntry.completed_at = window.VocabScoring.localIso(now);
    await window.VocabDB.put("review_queue", updatedEntry);
    outcomes.push({ review_id: reviewId, item_id: entry.item_id, ...outcome });
  }

  state.lastReviewSummary = {
    session_id: session.session_id,
    total_questions: total,
    correct_questions: correct,
    wrong_questions: wrong,
    accuracy,
    fixed_items: outcomes.filter((row) => row.review_status === "fixed").length,
    still_weak_items: outcomes.filter((row) => row.review_status === "still_weak").length,
    repeated_error_items: outcomes.filter((row) => row.review_status === "repeated_error").length,
    stable_items: outcomes.filter((row) => row.review_status === "stable").length
  };

  window.VocabDB.saveActiveSession(null);
  state.activeSession = null;
  state.currentQuestionKey = null;
  await loadData();
  markDriveChange("review_completion");
  setNotice(`複習已儲存：${correct}/${total} 題答對，${state.lastReviewSummary.fixed_items} 項已修正，${state.lastReviewSummary.still_weak_items} 項仍不穩，${state.lastReviewSummary.repeated_error_items} 項反覆錯誤。`, wrong ? "warn" : "ok");
  callSetView("mistakes");
}

async function finishSpeedSession(session) {
  const attempts = await window.VocabDB.getByIndex("attempts", "session_id", session.session_id);
  const total = attempts.length;
  const correct = attempts.filter((a) => a.is_correct).length;
  const wrong = total - correct;
  const timeouts = attempts.filter((a) => a.timeout).length;
  const accuracy = total ? correct / total : 0;
  const avgTime = average(attempts.map((a) => a.response_time_seconds));
  const topErrors = topCounts(attempts.filter((a) => !a.is_correct), "error_code", 5).map(([code]) => code);
  const status = accuracy >= 0.8 ? "completed" : accuracy >= 0.6 ? "completed_with_reinforcement" : "needs_retake";
  const now = new Date();

  const sessionRecord = {
    session_id: session.session_id,
    date: window.VocabScoring.localDate(now),
    user_id: session.user_id,
    course_id: session.course_id,
    stage: session.stage,
    lesson_id: session.lesson_id,
    lesson_title: session.lesson_title,
    planned_minutes: session.planned_minutes,
    actual_minutes: Number((callLessonElapsedSeconds() / 60).toFixed(1)),
    started_at: session.started_at,
    ended_at: window.VocabScoring.localIso(now),
    total_questions: total,
    correct_questions: correct,
    wrong_questions: wrong,
    timeout_count: timeouts,
    accuracy,
    avg_response_time_seconds: Number(avgTime.toFixed(2)),
    fast_correct_count: attempts.filter((a) => a.speed_bucket === "fast_correct").length,
    slow_correct_count: attempts.filter((a) => a.speed_bucket === "slow_correct").length,
    top_error_codes: topErrors,
    mastery_status: accuracy >= 0.85 ? "stable" : accuracy >= 0.8 ? "passed" : accuracy >= 0.6 ? "unstable" : "needs_retake",
    next_action: accuracy >= 0.8 ? "unlock_next_lesson" : "retake_lesson",
    mode: "speed_drill"
  };

  await window.VocabDB.put("sessions", sessionRecord);
  const lesson = state.lessons.find((row) => row.lesson_id === session.lesson_id);
  if (lesson) await window.VocabDB.put("lessons", { ...lesson, status });

  // Add wrong + timeout attempts to review queue
  for (const attempt of attempts.filter((a) => !a.is_correct)) {
    await upsertReviewQueue(attempt, attempt.timeout ? "timeout_error" : "speed_error", attempt.timeout ? 4 : 3);
  }

  window.VocabDB.saveActiveSession(null);
  state.activeSession = null;
  state.currentQuestionKey = null;
  state.speedTimerFired = false;
  await loadData();
  markDriveChange("lesson_completion");
  setNotice(`速度練習已儲存：${correct}/${total} 題答對，${timeouts} 題超時。`, wrong ? "warn" : "ok");
  callSetView("today");
}

export async function finishLesson() {
  const session = state.activeSession;
  if (!session || state.isFinishing) return;
  state.isFinishing = true;
  try {
    if (isReviewSession(session)) {
      await finishReviewSession(session);
      return;
    }

    if (isSpeedSession(session)) {
      await finishSpeedSession(session);
      return;
    }

    const attempts = await window.VocabDB.getByIndex("attempts", "session_id", session.session_id);
    const total = attempts.length;
    const correct = attempts.filter((attempt) => attempt.is_correct).length;
    const wrong = total - correct;
    const accuracy = total ? correct / total : 0;
    const avgTime = average(attempts.map((attempt) => attempt.response_time_seconds));
    const topErrors = topCounts(attempts.filter((attempt) => !attempt.is_correct), "error_code", 5).map(([code]) => code);
    const status = accuracy >= 0.8 ? "completed" : accuracy >= 0.6 ? "completed_with_reinforcement" : "needs_retake";
    const now = new Date();
    const sessionRecord = {
      session_id: session.session_id,
      date: window.VocabScoring.localDate(now),
      user_id: session.user_id,
      course_id: session.course_id,
      stage: session.stage,
      lesson_id: session.lesson_id,
      lesson_title: session.lesson_title,
      planned_minutes: session.planned_minutes,
      actual_minutes: Number((callLessonElapsedSeconds() / 60).toFixed(1)),
      started_at: session.started_at,
      ended_at: window.VocabScoring.localIso(now),
      total_questions: total,
      correct_questions: correct,
      wrong_questions: wrong,
      accuracy,
      avg_response_time_seconds: Number(avgTime.toFixed(2)),
      fast_correct_count: attempts.filter((attempt) => attempt.speed_bucket === "fast_correct").length,
      slow_correct_count: attempts.filter((attempt) => attempt.speed_bucket === "slow_correct").length,
      top_error_codes: topErrors,
      mastery_status: accuracy >= 0.85 ? "stable" : accuracy >= 0.8 ? "passed" : accuracy >= 0.6 ? "unstable" : "needs_retake",
      next_action: accuracy >= 0.8 ? "unlock_next_lesson" : accuracy >= 0.6 ? "add_5_reinforcement_questions" : "retake_lesson"
    };

    await window.VocabDB.put("sessions", sessionRecord);
    const lesson = state.lessons.find((row) => row.lesson_id === session.lesson_id);
    if (lesson) await window.VocabDB.put("lessons", { ...lesson, status });

    if (status === "completed_with_reinforcement") {
      const wrongAttempts = attempts.filter((attempt) => !attempt.is_correct).slice(0, 5);
      for (const attempt of wrongAttempts) {
        await upsertReviewQueue(attempt, "reinforcement", 4);
      }
    }
    if (status === "needs_retake") {
      const wrongAttempts = attempts.filter((attempt) => !attempt.is_correct);
      for (const attempt of wrongAttempts) {
        await upsertReviewQueue(attempt, "needs_retake", 5);
      }
    }

    window.VocabDB.saveActiveSession(null);
    state.activeSession = null;
    state.currentQuestionKey = null;
    state.reviewSessionId = session.session_id;
    state.postLessonSummary = buildPostLessonSummary(session, {
      correct,
      total,
      wrong,
      accuracy
    });
    await loadData();
    if (state.postLessonSummary) {
      state.postLessonSummary.due_review_count = countDueReviewQueue();
    }
    markDriveChange("lesson_completion");
    callSetView("mistakes");
  } finally {
    state.isFinishing = false;
  }
}

export async function addItemToReview(itemId) {
  const item = await window.VocabDB.get("vocab_items", itemId);
  if (!item) return;
  const fakeAttempt = {
    target_item_id: itemId,
    lesson_id: item.lesson_id || "manual",
    question_id: null,
    question_type: item.item_type || "review_question",
    is_correct: false,
    is_repeated_error: false,
    response_time_seconds: 0,
    stage: item.stage,
    user_id: state.user?.user_id || "Keith"
  };
  await upsertReviewQueue(fakeAttempt, "manual_add", 3);
  await loadData();
  markDriveChange("review_queue");
  setNotice(`已加入複習：${item.base_word || itemId}`, "ok");
}

// SRS-based review queue: one canonical entry per item (review_${item_id}) with priority and interval calculation.
export async function upsertReviewQueue(attempt, reason, priority) {
  if (!attempt.target_item_id) return;
  const today = window.VocabScoring.localDate();
  const id = `review_${attempt.target_item_id}`;
  const existing = await window.VocabDB.get("review_queue", id);

  // Compute updated repeated_error_count
  const prevRepeatedCount = Number(existing?.repeated_error_count || 0);
  const repeatedErrorCount = (attempt.is_repeated_error || reason === "repeated_error") ? prevRepeatedCount + 1 : prevRepeatedCount;

  // Compute priority using mastery data
  const item = await window.VocabDB.get("vocab_items", attempt.target_item_id);
  const computedPriority = item
    ? window.VocabScoring.calculateReviewPriority(item, { repeated_error_count: repeatedErrorCount })
    : Math.max(priority || 3, existing?.priority || 0);

  // SRS interval based on review state
  const reviewState = repeatedErrorCount >= 2 || reason === "repeated_error" || existing?.review_state === "repeated_error"
    ? "repeated_error"
    : existing?.review_state && existing.review_state !== "done" ? existing.review_state
    : "new_error";
  const daysOut = reviewState === "repeated_error" ? 1 : (computedPriority >= 7 ? 1 : 2);
  const dueDate = window.VocabScoring.addDays(today, daysOut);

  const questionIds = new Set([...(existing?.question_ids || []), attempt.question_id].filter(Boolean));

  await window.VocabDB.put("review_queue", {
    review_id: id,
    item_id: attempt.target_item_id,
    question_ids: [...questionIds],
    reason,
    review_state: reviewState,
    priority: computedPriority,
    due_date: dueDate,
    next_review_at: dueDate,
    repeated_error_count: repeatedErrorCount,
    consecutive_review_correct: 0,
    status: existing?.status === "done" ? "pending" : (existing?.status || "pending"),
    created_at: existing?.created_at || window.VocabScoring.localIso(),
    updated_at: window.VocabScoring.localIso(),
    last_reviewed_at: existing?.last_reviewed_at || null,
    review_attempt_count: existing?.review_attempt_count || 0,
    review_correct_count: existing?.review_correct_count || 0,
    review_wrong_count: existing?.review_wrong_count || 0,
    review_status: existing?.review_status || "pending",
    last_review_session_id: existing?.last_review_session_id || null
  });
}
