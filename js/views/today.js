import {
  PASS_STATUSES,
  state,
  html,
  pct,
  seconds,
  average,
  localDateFromTimestamp,
  isWithinLastDays,
  currentLesson,
  topCounts,
  moduleAccuracy,
  lessonTypeLabel,
  questionTypeLabel
} from "../state.js";

export function renderToday() {
  const today = window.VocabScoring.localDate();
  const lesson = currentLesson();
  const todayAttempts = state.attempts.filter((attempt) => localDateFromTimestamp(attempt.timestamp) === today);
  const todaySessions = state.sessions.filter((session) => session.date === today);
  const wrongAttempts = todayAttempts.filter((attempt) => !attempt.is_correct);
  const topErrors = topCounts(wrongAttempts, "error_code", 3);
  const accuracy = todayAttempts.length ? average(todayAttempts.map((attempt) => attempt.is_correct ? 1 : 0)) : 0;
  const avgTime = average(todayAttempts.map((attempt) => attempt.response_time_seconds));
  const modules = moduleAccuracy().slice(0, 3);
  const completed = state.lessons.filter((item) => PASS_STATUSES.has(item.status)).length;
  const pendingQueue = state.reviewQueue.filter((item) => item.status === "pending" && (!item.due_date || String(item.due_date) <= today));
  const nextAction = pendingQueue.length ? "review_due_items" : lesson?.status === "needs_retake" ? "retake_current_lesson" : "start_current_lesson";
  const nextActionLabel = nextAction === "review_due_items"
    ? `Review ${pendingQueue.length} Due Item${pendingQueue.length === 1 ? "" : "s"}`
    : nextAction === "retake_current_lesson"
    ? `Retake ${html(lesson?.lesson_id || "")}`
    : `${html(lesson?.lesson_id || "")} · ${html(lesson?.title || "")}`;
  const nextActionBtn = nextAction === "review_due_items"
    ? `<button class="button primary" type="button" onclick="VocabTracker.startReviewMode('due')">Start Review →</button>`
    : `<button class="button primary" type="button" onclick="VocabTracker.startLesson('${html(lesson?.lesson_id || "")}')">Start ${nextAction === "retake_current_lesson" ? "Retake" : "Lesson"} →</button>`;

  return `
    <section class="tracker-hero">
      <div>
        <div class="tracker-kicker">Current Stage</div>
        <h2>${html(lesson?.stage || "V0")} ${html(lesson?.stage_name || "Diagnosis")}</h2>
        <p>${html(lesson?.lesson_id || "-")} · ${html(lesson?.title || "No lesson")}</p>
      </div>
      ${nextActionBtn}
    </section>

    <section class="tracker-grid" style="grid-template-columns: repeat(5, minmax(0, 1fr))">
      <article class="tracker-stat"><span>Today Questions</span><strong>${todayAttempts.length}</strong><small>${todaySessions.length} sessions</small></article>
      <article class="tracker-stat"><span>Accuracy</span><strong>${pct(accuracy)}</strong><small>${wrongAttempts.length} wrong</small></article>
      <article class="tracker-stat"><span>Avg Time</span><strong>${seconds(avgTime)}</strong><small>per attempt</small></article>
      <article class="tracker-stat"><span>Vocab Progress</span><strong>${completed}/${state.lessons.length}</strong><small>${Math.round((completed / (state.lessons.length || 1)) * 100)}%</small></article>
      <article class="tracker-stat${pendingQueue.length ? " stat-alert" : ""}"><span>Due Review</span><strong>${pendingQueue.length}</strong><small>${pendingQueue.length ? "items due" : "all clear"}</small></article>
    </section>

    <section class="tracker-section-grid">
      <article class="tracker-panel">
        <h3>Next Action</h3>
        <p class="tracker-bigline">${nextActionLabel}</p>
        ${renderTodayLessonFocus(lesson)}
        <div class="tracker-actions">
          ${nextActionBtn}
          <button class="button secondary" type="button" onclick="VocabTracker.setView('mistakes')">Mistakes</button>
          <button class="button secondary" type="button" onclick="VocabTracker.setView('export')">Export</button>
          <button class="button secondary" type="button" onclick="VocabTracker.setView('bank')">Q Bank</button>
        </div>
      </article>
      <article class="tracker-panel">
        <h3>Top Error Codes</h3>
        ${topErrors.length ? `<ol class="tracker-list">${topErrors.map(([code, count]) => `<li>${html(code)} <span>${count}</span></li>`).join("")}</ol>` : `<p class="muted-note">No mistakes recorded today.</p>`}
      </article>
      <article class="tracker-panel">
        <h3>Weakest Modules</h3>
        ${modules.length ? `<ol class="tracker-list">${modules.map(([type, value]) => `<li>${html(type)} <span>${pct(value)}</span></li>`).join("")}</ol>` : `<p class="muted-note">Complete a lesson to populate module accuracy.</p>`}
      </article>
    </section>

    ${renderWeeklyStageSummary()}
  `;
}

function renderTodayLessonFocus(lesson) {
  if (!lesson) return `<p class="muted-note">No lesson is available.</p>`;
  const ids = new Set([...(lesson.question_ids || []), ...(lesson.review_question_ids || [])]);
  const questionTypes = topCounts(state.questions.filter((question) => ids.has(question.question_id)), "type", 4);
  const targetItems = (lesson.target_items || [])
    .map((itemId) => state.vocabItems.find((item) => item.item_id === itemId))
    .filter(Boolean);

  return `
    <div class="today-focus">
      <span>${html(lessonTypeLabel(lesson.lesson_type))}</span>
      ${questionTypes.map(([type, count]) => `<span>${html(questionTypeLabel(type))}: ${count}</span>`).join("")}
      ${targetItems.slice(0, 4).map((item) => `<span>${html(item.base_word || item.item_id)}${item.chinese ? ` / ${html(item.chinese)}` : ""}</span>`).join("")}
    </div>
  `;
}

export function renderWeeklyStageSummary() {
  const weekSessions = state.sessions.filter((session) => isWithinLastDays(session.date, 7));
  const weekAttempts = state.attempts.filter((attempt) => isWithinLastDays(localDateFromTimestamp(attempt.timestamp), 7));
  const planned = Number(state.prefs.planned_lessons_this_week || 5);
  const weeklyAccuracy = weekAttempts.length ? average(weekAttempts.map((attempt) => attempt.is_correct ? 1 : 0)) : 0;
  const weeklyAvg = average(weekAttempts.map((attempt) => attempt.response_time_seconds));
  const fixRate = calculateReviewFixRate();
  const stageRows = (state.curriculum?.stages || []).map((stage) => {
    const lessons = state.lessons.filter((lesson) => lesson.stage === stage.stage);
    const done = lessons.filter((lesson) => PASS_STATUSES.has(lesson.status)).length;
    return `<div class="stage-row"><span>${html(stage.stage)} ${html(stage.stage_name)}</span><strong>${done}/${lessons.length || stage.total_lessons}</strong></div>`;
  }).join("");

  return `
    <section class="tracker-section-grid">
      <article class="tracker-panel">
        <h3>Weekly Dashboard</h3>
        <div class="mini-metrics">
          <span>Lessons ${weekSessions.length}/${planned}</span>
          <span>Accuracy ${pct(weeklyAccuracy)}</span>
          <span>Avg ${seconds(weeklyAvg)}</span>
          <span>Fix Rate ${pct(fixRate)}</span>
        </div>
      </article>
      <article class="tracker-panel">
        <h3>Stage Dashboard</h3>
        <div class="stage-list">${stageRows}</div>
      </article>
    </section>
  `;
}

export function calculateReviewFixRate() {
  const reviewAttempts = state.attempts.filter((attempt) => attempt.step === "previous_review" || attempt.question_type === "review_question");
  return reviewAttempts.length ? average(reviewAttempts.map((attempt) => attempt.is_correct ? 1 : 0)) : 0;
}
