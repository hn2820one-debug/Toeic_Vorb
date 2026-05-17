import {
  LESSON_STEPS,
  state,
  html,
  average,
  byId,
  currentLesson,
  topCounts,
  loadData,
  setNotice,
  optionText,
  questionTypeLabel,
  learningGuidance
} from "../state.js";

export const REVIEW_LESSON_ID = "REVIEW_QUEUE";
const REVIEW_QUESTION_LIMIT = 20;

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

function reviewFilterLabel(filter) {
  return {
    due: "Due Today",
    high_priority: "High Priority",
    repeated: "Repeated Errors",
    all: "All Pending"
  }[filter] || "Due Today";
}

function isDue(entry, today) {
  return !entry.due_date || String(entry.due_date) <= today;
}

function reviewEntryMatchesFilter(entry, filter, today) {
  if (entry.status !== "pending") return false;
  if (filter === "high_priority") return Number(entry.priority || 0) >= 5;
  if (filter === "repeated") return entry.reason === "repeated_error" || entry.review_status === "repeated_error" || Number(entry.priority || 0) >= 5;
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

function renderFeedback(question, userAnswer, isCorrect, hasMore) {
  const buttons = ["A", "B", "C", "D"].map((letter) => {
    const extraClass = letter === question.correct_answer
      ? "feedback-correct"
      : letter === userAnswer && !isCorrect ? "feedback-wrong" : "";
    return `
      <button class="answer-button ${extraClass}" type="button" disabled>
        <strong>${letter}</strong>
        <span>${html(question.options?.[letter] || "")}</span>
      </button>
    `;
  }).join("");

  return `
    <article class="question-panel">
      <div class="feedback-banner ${isCorrect ? "correct" : "wrong"}">
        ${isCorrect ? "✓ Correct" : "✗ Wrong — correct answer highlighted"}
      </div>
      <p class="question-text">${html(question.question_text)}</p>
      <div class="answer-grid">${buttons}</div>
      ${question.explanation_zh ? `<p class="feedback-explanation">${html(question.explanation_zh)}</p>` : ""}
      ${renderPostAnswerLearningCard(question, userAnswer, isCorrect)}
      <div class="tracker-actions">
        <button class="button primary" type="button" onclick="VocabTracker.advanceAfterFeedback()">${hasMore ? "Next Question →" : "See Summary →"}</button>
      </div>
    </article>
  `;
}

function targetItemForQuestion(question) {
  return state.vocabItems.find((item) => item.item_id === question?.target_item_id);
}

function renderQuestionGuidance(question) {
  return `
    <div class="question-guidance">
      <strong>${html(questionTypeLabel(question.type))}</strong>
      <span>${html(learningGuidance(question))}</span>
    </div>
  `;
}

function renderPostAnswerLearningCard(question, userAnswer, isCorrect) {
  const item = targetItemForQuestion(question);
  const grammarLink = question.grammar_link_id ? state.grammarLinks?.[question.grammar_link_id] : null;
  const correctText = optionText(question, question.correct_answer);
  return `
    <aside class="learning-card ${isCorrect ? "correct" : "review"}">
      <div>
        <span class="learning-card-label">${isCorrect ? "Locked In" : "Review Point"}</span>
        <strong>${html(correctText || item?.base_word || question.target_item_id || "Target item")}</strong>
        ${item?.chinese ? `<small>${html(item.chinese)}</small>` : ""}
      </div>
      <div class="learning-card-detail">
        ${item?.example ? `<p>${html(item.example)}</p>` : ""}
        ${!isCorrect ? `<p>Your answer: ${html(userAnswer)} ${html(optionText(question, userAnswer))}</p>` : ""}
        ${grammarLink ? `<p>${html(grammarLink.title_zh || question.grammar_link_id)}: ${html(grammarLink.rule_zh || "")}</p>` : ""}
      </div>
    </aside>
  `;
}

function renderLessonPreview(lesson) {
  if (!lesson) return "";
  if (lesson.lesson_type === "mixed_review") {
    return `
      <div class="lesson-preview">
        <strong>Mixed Review</strong>
        <span>This lesson recycles ${lesson.question_ids?.length || 0} review questions from earlier ${html(lesson.stage)} lessons.</span>
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
        <strong>Lesson Focus</strong>
        <div class="lesson-focus-grid">
          ${typeCounts.length
            ? typeCounts.map(([type, count]) => `<span><b>${html(questionTypeLabel(type))}</b> ${count}</span>`).join("")
            : `<span>${html(lesson.stage_name || lesson.lesson_type || "General lesson")}</span>`}
        </div>
      </div>
    `;
  }

  return `
    <div class="lesson-preview">
      <strong>Lesson Focus</strong>
      <div class="lesson-focus-grid">
        ${targetItems.slice(0, 8).map((item) => `
          <span><b>${html(item.base_word || item.item_id)}</b>${item.chinese ? ` ${html(item.chinese)}` : ""}</span>
        `).join("")}
      </div>
    </div>
  `;
}

export function renderLesson() {
  const active = window.VocabDB.loadActiveSession();
  if (!state.activeSession && active) {
    state.activeSession = active;
  }

  if (!state.activeSession) {
    const lesson = currentLesson();
    return `
      <section class="tracker-panel">
        <h3>Lesson Start</h3>
        <p class="tracker-bigline">${html(lesson?.lesson_id || "-")} · ${html(lesson?.title || "")}</p>
        ${renderLessonPreview(lesson)}
        <div class="step-plan">
          ${LESSON_STEPS.map((step) => `<div><strong>${html(step.label)}</strong><span>${step.minutes} min</span></div>`).join("")}
        </div>
        <div class="tracker-actions">
          <button class="button primary" type="button" onclick="VocabTracker.startLesson('${html(lesson?.lesson_id || "")}')">Start Current Lesson</button>
          <button class="button secondary" type="button" onclick="VocabTracker.setView('roadmap')">Choose Lesson</button>
        </div>
      </section>
    `;
  }

  const session = state.activeSession;
  const progress = runtimeProgress();
  const lesson = isReviewSession(session)
    ? {
      lesson_id: REVIEW_LESSON_ID,
      title: session.lesson_title || `Review Mode · ${reviewFilterLabel(session.review_filter)}`,
      stage: "REVIEW",
      stage_name: "Mistake Review"
    }
    : state.lessons.find((row) => row.lesson_id === session.lesson_id);

  if (state.showFeedback) {
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
            <div class="runtime-actions">
              <button class="button secondary" type="button" onclick="VocabTracker.togglePause()">${session.paused ? "Resume" : "Pause"}</button>
              <button class="button secondary" type="button" onclick="VocabTracker.exitLesson()">Exit</button>
            </div>
          </section>
        `;
      }
    }
    state.showFeedback = false;
  }

  const allAnswered = progress.answered >= progress.total && progress.total > 0;

  if (allAnswered) {
    const finishTitle = isReviewSession(session) ? "Review Summary" : "Step 5: Error Review + Scheduling";
    const finishNote = isReviewSession(session)
      ? "Generate the review session summary and update fixed / still weak / repeated-error queue status."
      : "Generate the session summary, apply the mastery gate, then confirm mistake causes.";
    const finishButton = isReviewSession(session) ? "Finish Review" : "Finish Lesson";
    return `
      <section class="runtime-shell">
        ${renderRuntimeHeader(lesson, "error_review_scheduling")}
        <article class="tracker-panel finish-panel">
          <h3>${finishTitle}</h3>
          <p class="tracker-bigline">${progress.answered}/${progress.total} answers saved immediately.</p>
          <p class="muted-note">${finishNote}</p>
          <button class="button primary" type="button" onclick="VocabTracker.finishLesson()">${finishButton}</button>
        </article>
      </section>
    `;
  }

  const row = progress.current;
  if (!row) return `<section class="tracker-panel"><p class="muted-note">No question is available for this lesson.</p></section>`;
  const question = row.question;
  ensureQuestionClock(question.question_id);
  const savedAnswer = session.answers?.[question.question_id]?.user_answer || null;
  const selected = savedAnswer || state.pendingAnswer;

  return `
    <section class="runtime-shell">
      ${renderRuntimeHeader(lesson, row.step)}
      <article class="question-panel">
        <div class="question-meta">
          <span>${html(questionTypeLabel(question.type))}</span>
          <span>Q ${progress.index + 1} / ${progress.total}</span>
          <span>Target ${window.VocabScoring.targetTime(question.type)}s</span>
        </div>
        ${renderQuestionGuidance(question)}
        <p class="question-text">${html(question.question_text)}</p>
        <div class="answer-grid">
          ${["A", "B", "C", "D"].map((letter) => `
            <button class="answer-button ${selected === letter ? "selected" : ""}" type="button" ${savedAnswer || session.paused ? "disabled" : ""} onclick="VocabTracker.answerCurrent('${letter}')">
              <strong>${letter}</strong>
              <span>${html(question.options?.[letter] || "")}</span>
            </button>
          `).join("")}
        </div>
        <div class="confirm-answer-row">
          <p class="muted-note">${savedAnswer ? "Answer locked and saved. Correctness is hidden until review." : selected ? `Selected ${html(selected)}. Press Confirm Answer to save.` : "Choose one answer, then press Confirm Answer. Nothing is saved until you confirm."}</p>
          <button class="button primary" type="button" onclick="VocabTracker.confirmCurrentAnswer()" ${!selected || savedAnswer || session.paused ? "disabled" : ""}>Confirm Answer</button>
        </div>
      </article>
      <div class="runtime-actions">
        <button class="button secondary" type="button" onclick="VocabTracker.previousQuestion()" ${progress.index <= 0 ? "disabled" : ""}>Previous</button>
        <button class="button secondary" type="button" onclick="VocabTracker.nextQuestion()">Skip / Next</button>
        <button class="button secondary" type="button" onclick="VocabTracker.togglePause()">${session.paused ? "Resume" : "Pause"}</button>
        <button class="button secondary" type="button" onclick="VocabTracker.exitLesson()">Exit</button>
      </div>
    </section>
  `;
}

export function renderRuntimeHeader(lesson, currentStepId) {
  const progress = runtimeProgress();
  const session = state.activeSession;
  const stepItems = isReviewSession(session)
    ? `
      <span class="step-chip active">${html(reviewFilterLabel(session.review_filter))}</span>
      <span class="step-chip">Review Queue</span>
      <span class="step-chip">${html(session.review_ids?.length || 0)} items</span>
    `
    : LESSON_STEPS.map((step) => `
      <span class="step-chip ${step.id === currentStepId ? "active" : ""}">${html(step.label)}</span>
    `).join("");
  const width = Math.round((progress.answered / Math.max(progress.total, 1)) * 100);
  return `
    <article class="runtime-head">
      <div>
        <div class="tracker-kicker">${html(lesson?.lesson_id || session.lesson_id)}</div>
        <h2>${html(lesson?.title || session.lesson_title)}</h2>
      </div>
      <div class="runtime-timers">
        <span>Lesson <strong id="lesson-elapsed">0:00</strong></span>
        <span>Question <strong id="question-elapsed">0.0s</strong></span>
      </div>
    </article>
    <div class="step-strip">${stepItems}</div>
    <div class="tracker-progress runtime-progress"><div style="width:${width}%"></div></div>
    ${session.paused ? `<div class="tracker-alert warn">Lesson paused. Resume to continue recording response time.</div>` : ""}
  `;
}

export function buildRuntimeQuestions(lesson, allLessonQuestions, session) {
  const questionMap = byId(allLessonQuestions, "question_id");
  if (session?.question_ids?.length) {
    return session.question_ids.map((questionId) => ({
      question: questionMap[questionId],
      step: session.step_by_question?.[questionId] || "toeic_practice"
    })).filter((row) => row.question);
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
  return picked;
}

export function ensureQuestionClock(questionId) {
  if (state.currentQuestionKey !== questionId) {
    state.currentQuestionKey = questionId;
    state.questionStartedAt = Date.now();
    state.pendingAnswer = null;
    state.lockedQuestionSeconds = null;
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
        stage_name: "Mistake Review",
        title: existingSession?.lesson_title || "Review Mode",
        lesson_type: "review_queue",
        estimated_minutes: existingSession?.planned_minutes || 15
      },
      runtime
    };
  }

  const lesson = state.lessons.find((row) => row.lesson_id === lessonId);
  if (!lesson) throw new Error(`Lesson not found: ${lessonId}`);
  const allLessonQuestions = await window.VocabDB.getQuestionsForLesson(lesson);
  const runtime = buildRuntimeQuestions(lesson, allLessonQuestions, existingSession);
  state.runtimeQuestions = runtime;
  return { lesson, runtime };
}

export async function startLesson(lessonId) {
  if (!lessonId) return;
  const active = window.VocabDB.loadActiveSession();
  if (active && active.lesson_id === lessonId) {
    state.activeSession = active;
    await prepareRuntime(lessonId, active);
    callSetView("lesson");
    return;
  }

  const { lesson, runtime } = await prepareRuntime(lessonId, null);
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
    question_ids: runtime.map((row) => row.question.question_id),
    step_by_question: Object.fromEntries(runtime.map((row) => [row.question.question_id, row.step])),
    answers: {}
  };

  state.activeSession = session;
  state.currentQuestionKey = null;
  state.questionStartedAt = null;
  state.pendingAnswer = null;
  state.lockedQuestionSeconds = null;
  window.VocabDB.saveActiveSession(session);
  window.VocabDB.savePrefs({ last_opened_lesson: lesson.lesson_id, current_stage: lesson.stage });
  await window.VocabDB.put("lessons", { ...lesson, status: "in_progress" });
  await loadData();
  state.activeSession = session;
  await prepareRuntime(lessonId, session);
  callSetView("lesson");
}

export async function startReviewMode(filter = "due") {
  const active = window.VocabDB.loadActiveSession();
  if (isReviewSession(active)) {
    state.activeSession = active;
    await prepareRuntime(REVIEW_LESSON_ID, active);
    callSetView("lesson");
    return;
  }

  const review = getReviewCandidates(filter, REVIEW_QUESTION_LIMIT);
  if (!review.rows.length) {
    setNotice(`No ${review.label.toLowerCase()} review questions are available.`, "warn");
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
    lesson_title: `Review Mode · ${review.label}`,
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
  state.runtimeQuestions = review.rows;
  state.currentQuestionKey = null;
  state.questionStartedAt = null;
  state.pendingAnswer = null;
  state.lockedQuestionSeconds = null;
  state.lastReviewSummary = null;
  window.VocabDB.saveActiveSession(session);
  window.VocabDB.savePrefs({ current_stage: "REVIEW" });
  callSetView("lesson");
}

export function answerCurrent(letter) {
  const session = state.activeSession;
  const progress = runtimeProgress();
  const row = progress.current;
  if (!session || !row || session.paused) return;
  const question = row.question;
  if (session.answers?.[question.question_id]) return;
  state.pendingAnswer = letter;
  callRender();
}

export async function confirmCurrentAnswer() {
  const session = state.activeSession;
  const progress = runtimeProgress();
  const row = progress.current;
  if (!session || !row || session.paused) return;
  const question = row.question;
  if (session.answers?.[question.question_id]) return;
  const letter = state.pendingAnswer;
  if (!letter) return;

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
    grammar_link_id: question.grammar_link_id || null
  };

  await window.VocabDB.put("attempts", attempt);
  await updateItemMastery(question, attempt);

  session.answers[question.question_id] = {
    attempt_id: attempt.attempt_id,
    user_answer: letter,
    is_correct: isCorrect,
    response_time_seconds: attempt.response_time_seconds
  };
  window.VocabDB.saveActiveSession(session);
  state.attempts.push(attempt);
  state.showFeedback = true;
  state.currentQuestionKey = question.question_id;
  state.pendingAnswer = null;
  state.questionStartedAt = null;
  state.lockedQuestionSeconds = attempt.response_time_seconds;
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
  state.lockedQuestionSeconds = null;
  callRender();
}

export function nextQuestion() {
  if (!state.activeSession) return;
  state.activeSession.current_index = Math.min(state.runtimeQuestions.length, (state.activeSession.current_index || 0) + 1);
  state.currentQuestionKey = null;
  state.pendingAnswer = null;
  state.lockedQuestionSeconds = null;
  window.VocabDB.saveActiveSession(state.activeSession);
  callRender();
}

export function previousQuestion() {
  if (!state.activeSession) return;
  state.activeSession.current_index = Math.max(0, (state.activeSession.current_index || 0) - 1);
  state.currentQuestionKey = null;
  state.pendingAnswer = null;
  state.lockedQuestionSeconds = null;
  window.VocabDB.saveActiveSession(state.activeSession);
  callRender();
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
  if (state.activeSession) window.VocabDB.saveActiveSession(state.activeSession);
  callSetView("today");
}

function reviewOutcomeForEntry(entry, attempts) {
  const itemAttempts = attempts.filter((attempt) => (
    attempt.target_item_id === entry.item_id || (entry.question_ids || []).includes(attempt.question_id)
  ));
  const total = itemAttempts.length;
  const correct = itemAttempts.filter((attempt) => attempt.is_correct).length;
  const wrong = total - correct;
  const fastCorrect = itemAttempts.filter((attempt) => attempt.speed_bucket === "fast_correct").length;
  const accuracy = total ? correct / total : 0;

  if (!total) {
    return {
      review_status: entry.review_status || "pending",
      status: entry.status,
      priority: entry.priority || 3,
      due_date: entry.due_date,
      reason: entry.reason,
      total,
      correct,
      wrong,
      fastCorrect,
      accuracy
    };
  }

  if (wrong === 0 && fastCorrect === total) {
    return {
      review_status: "fixed",
      status: "done",
      priority: Math.max(1, Number(entry.priority || 3) - 2),
      due_date: entry.due_date,
      reason: "fixed",
      total,
      correct,
      wrong,
      fastCorrect,
      accuracy
    };
  }

  if (wrong === 0) {
    return {
      review_status: "still_weak",
      status: "pending",
      priority: Math.max(2, Number(entry.priority || 3) - 1),
      due_date: window.VocabScoring.addDays(window.VocabScoring.localDate(), 2),
      reason: "slow_correct_review",
      total,
      correct,
      wrong,
      fastCorrect,
      accuracy
    };
  }

  return {
    review_status: wrong >= 2 || entry.reason === "repeated_error" ? "repeated_error" : "still_weak",
    status: "pending",
    priority: wrong >= 2 || entry.reason === "repeated_error" ? 5 : Math.max(4, Number(entry.priority || 3)),
    due_date: window.VocabScoring.addDays(window.VocabScoring.localDate(), 1),
    reason: wrong >= 2 || entry.reason === "repeated_error" ? "repeated_error" : "still_weak",
    total,
    correct,
    wrong,
    fastCorrect,
    accuracy
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
    lesson_title: session.lesson_title || "Review Mode",
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
      reason: outcome.reason,
      priority: outcome.priority,
      due_date: outcome.due_date,
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
    repeated_error_items: outcomes.filter((row) => row.review_status === "repeated_error").length
  };

  window.VocabDB.saveActiveSession(null);
  state.activeSession = null;
  state.currentQuestionKey = null;
  await loadData();
  setNotice(`Review saved: ${correct}/${total} correct, ${state.lastReviewSummary.fixed_items} fixed, ${state.lastReviewSummary.still_weak_items} still weak, ${state.lastReviewSummary.repeated_error_items} repeated.`, wrong ? "warn" : "ok");
  callSetView("mistakes");
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
    await loadData();
    callSetView("mistakes");
  } finally {
    state.isFinishing = false;
  }
}

export async function upsertReviewQueue(attempt, reason, priority) {
  if (!attempt.target_item_id) return;
  const today = window.VocabScoring.localDate();
  const dueDate = window.VocabScoring.addDays(today, priority >= 5 ? 1 : 2);
  const id = `review_${attempt.target_item_id}_${dueDate}`;
  const existing = await window.VocabDB.get("review_queue", id);
  const questionIds = new Set([...(existing?.question_ids || []), attempt.question_id]);
  const record = {
    review_id: id,
    item_id: attempt.target_item_id,
    question_ids: [...questionIds],
    reason,
    priority: Math.max(priority || 3, existing?.priority || 0),
    due_date: dueDate,
    status: existing?.status || "pending",
    created_at: existing?.created_at || window.VocabScoring.localIso(),
    updated_at: window.VocabScoring.localIso()
  };
  await window.VocabDB.put("review_queue", record);
}
