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
  questionTypeLabel,
  errorCodeLabel
} from "../state.js";

const SEAL_ACCURACY_TARGET = 0.85;
const SEAL_REPEATED_ERROR_LIMIT = 0.05;
const SEAL_RECENT_ATTEMPT_LIMIT = 80;
const SEAL_MIN_RECENT_ATTEMPTS = 20;

function calculateStreak() {
  const today = window.VocabScoring.localDate();
  const dates = [...new Set(state.attempts.map((a) => localDateFromTimestamp(a.timestamp)))].filter(Boolean).sort();
  if (!dates.length) return 0;
  let streak = 0;
  let cur = today;
  for (let i = dates.length - 1; i >= 0; i--) {
    if (dates[i] === cur) {
      streak++;
      cur = window.VocabScoring.addDays(cur, -1);
    } else if (dates[i] < cur) {
      break;
    }
  }
  return streak;
}

export function renderToday() {
  const today = window.VocabScoring.localDate();
  const lesson = currentLesson();
  const todayAttempts = state.attempts.filter((attempt) => localDateFromTimestamp(attempt.timestamp) === today);
  const todaySessions = state.sessions.filter((session) => session.date === today);
  const dailyGoal = Number(state.prefs.daily_goal_questions || 30);
  const streak = calculateStreak();
  const wrongAttempts = todayAttempts.filter((attempt) => !attempt.is_correct);
  const topErrors = topCounts(wrongAttempts, "error_code", 3);
  const accuracy = todayAttempts.length ? average(todayAttempts.map((attempt) => attempt.is_correct ? 1 : 0)) : 0;
  const avgTime = average(todayAttempts.map((attempt) => attempt.response_time_seconds));
  const modules = moduleAccuracy().slice(0, 3);
  const completed = state.lessons.filter((item) => PASS_STATUSES.has(item.status)).length;
  const pendingQueue = state.reviewQueue.filter((item) => item.status === "pending" && (!item.due_date || String(item.due_date) <= today));
  const diagnostic = buildDiagnosticRecommendation();
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
    ${buildCompletionMessage() ? `<div class="tracker-alert ok">${html(buildCompletionMessage())}</div>` : ""}
    ${window.VocabTracker?.hasInstallPrompt?.() && !state.prefs.install_dismissed ? `
      <div class="tracker-alert info install-banner" style="display:flex;justify-content:space-between;align-items:center">
        <span>安裝為桌面 App，可離線使用</span>
        <div style="display:flex;gap:8px">
          <button class="button primary small" type="button" onclick="VocabTracker.triggerInstall()">安裝</button>
          <button class="button secondary small" type="button" onclick="VocabTracker.dismissInstall()">略過</button>
        </div>
      </div>` : ""}
    <section class="tracker-hero">
      <div>
        <div class="tracker-kicker">Current Stage</div>
        <h2>${html(lesson?.stage || "V0")} ${html(lesson?.stage_name || "Diagnosis")}</h2>
        <p>${html(lesson?.lesson_id || "-")} · ${html(lesson?.title || "No lesson")}</p>
      </div>
      ${nextActionBtn}
    </section>

    <section class="tracker-grid" style="grid-template-columns: repeat(5, minmax(0, 1fr))">
      <article class="tracker-stat">
        <span>Today</span>
        <strong>${todayAttempts.length}/${dailyGoal}</strong>
        <small>${streak > 0 ? `${streak} 天連續` : "今日開始"}</small>
        <div class="daily-goal-bar"><div style="width:${Math.min(100, Math.round(todayAttempts.length / dailyGoal * 100))}%"></div></div>
      </article>
      <article class="tracker-stat"><span>Accuracy</span><strong>${pct(accuracy)}</strong><small>${wrongAttempts.length} wrong</small></article>
      <article class="tracker-stat"><span>Avg Time</span><strong>${seconds(avgTime)}</strong><small>per attempt</small></article>
      <article class="tracker-stat"><span>Vocab Progress</span><strong>${completed}/${state.lessons.length}</strong><small>${Math.round((completed / (state.lessons.length || 1)) * 100)}%</small></article>
      <article class="tracker-stat${pendingQueue.length ? " stat-alert" : ""}"><span>Due Review</span><strong>${pendingQueue.length}</strong><small>${pendingQueue.length ? "items due" : "all clear"}</small></article>
    </section>

    ${diagnostic ? renderDiagnosticRecommendation(diagnostic) : ""}

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
        ${topErrors.length ? `<ol class="tracker-list">${topErrors.map(([code, count]) => `<li>${html(errorCodeLabel(code))} <small class="muted-note" style="font-size:10px">${html(code)}</small> <span>${count}</span></li>`).join("")}</ol>` : `<p class="muted-note">No mistakes recorded today.</p>`}
      </article>
      <article class="tracker-panel">
        <h3>Weakest Modules</h3>
        ${modules.length ? `<ol class="tracker-list">${modules.map(([type, value]) => `<li>${html(questionTypeLabel(type))} <span>${pct(value)}</span></li>`).join("")}</ol>` : `<p class="muted-note">Complete a lesson to populate module accuracy.</p>`}
      </article>
    </section>

    ${renderWeeklyStageSummary()}
  `;
}

function buildCompletionMessage() {
  const v3Lessons = state.lessons.filter((l) => l.stage === "V3");
  if (!v3Lessons.length) return null;
  return v3Lessons.every((l) => PASS_STATUSES.has(l.status))
    ? "V3 全部完成！建議繼續做 Review 鞏固 V1-V3，靜待 V4 Formal Phrase 開放。"
    : null;
}

function questionTypeStage(type) {
  if (["word_family", "part5_sentence_completion", "speed_drill"].includes(type)) return "V1";
  if (["meaning_choice", "scene_vocabulary"].includes(type)) return "V2";
  if (["collocation", "part6_context_choice"].includes(type)) return "V3";
  if (["formal_phrase", "false_friend"].includes(type)) return "V4";
  return "V1";
}

function nextAvailableLessonForStage(stage) {
  return state.lessons.find((lesson) => lesson.stage === stage && !PASS_STATUSES.has(lesson.status))
    || state.lessons.find((lesson) => lesson.stage === stage)
    || null;
}

function buildDiagnosticRecommendation() {
  const v0Attempts = state.attempts.filter((attempt) => attempt.stage === "V0");
  if (!v0Attempts.length) return null;

  const grouped = {};
  v0Attempts.forEach((attempt) => {
    const type = attempt.question_type || "unknown";
    if (!grouped[type]) grouped[type] = [];
    grouped[type].push(attempt);
  });

  const rows = Object.entries(grouped).map(([type, attempts]) => {
    const accuracy = average(attempts.map((attempt) => attempt.is_correct ? 1 : 0));
    const avgTime = average(attempts.map((attempt) => attempt.response_time_seconds));
    const target = window.VocabScoring.targetTime(type);
    const weak = accuracy < 0.75 || avgTime > target * 1.25;
    return { type, attempts: attempts.length, accuracy, avgTime, target, weak, stage: questionTypeStage(type) };
  }).sort((a, b) => Number(a.accuracy) - Number(b.accuracy) || Number(b.avgTime) - Number(a.avgTime));

  const overallAccuracy = average(v0Attempts.map((attempt) => attempt.is_correct ? 1 : 0));
  const weakRows = rows.filter((row) => row.weak);
  const stageCounts = {};
  weakRows.forEach((row) => {
    stageCounts[row.stage] = (stageCounts[row.stage] || 0) + 1;
  });

  const primaryStage = overallAccuracy < 0.6
    ? "V1"
    : Object.entries(stageCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || (overallAccuracy >= 0.85 ? "V2" : "V1");
  const primaryLesson = nextAvailableLessonForStage(primaryStage);

  const reason = overallAccuracy < 0.6
    ? "V0 shows the baseline is unstable. Rebuild word-form and basic recall first."
    : weakRows.length
      ? `Weakest diagnostic area: ${questionTypeLabel(weakRows[0].type)}.`
      : "V0 is stable enough to move into regular vocabulary training.";

  return {
    overallAccuracy,
    primaryStage,
    primaryLesson,
    reason,
    rows: rows.slice(0, 5)
  };
}

function renderDiagnosticRecommendation(diagnostic) {
  const action = diagnostic.primaryLesson
    ? `<button class="button primary" type="button" onclick="VocabTracker.startLesson('${html(diagnostic.primaryLesson.lesson_id)}')">Start ${html(diagnostic.primaryLesson.lesson_id)}</button>`
    : `<button class="button secondary" type="button" onclick="VocabTracker.setView('roadmap')">Open Roadmap</button>`;

  return `
    <section class="tracker-panel diagnostic-panel" data-testid="diagnostic-recommendation">
      <div class="panel-head-row">
        <div>
          <h3>V0 Diagnostic Recommendation</h3>
          <p class="muted-note">${html(diagnostic.reason)}</p>
        </div>
        ${action}
      </div>
      <div class="diagnostic-summary">
        <span>Overall ${pct(diagnostic.overallAccuracy)}</span>
        <span>Recommended ${html(diagnostic.primaryStage)}</span>
        <span>${html(diagnostic.primaryLesson?.title || "No lesson selected")}</span>
      </div>
      <div class="diagnostic-rows">
        ${diagnostic.rows.map((row) => `
          <div class="${row.weak ? "weak" : ""}">
            <span>${html(questionTypeLabel(row.type))}</span>
            <strong>${pct(row.accuracy)}</strong>
            <small>${seconds(row.avgTime)} / target ${row.target}s → ${html(row.stage)}</small>
          </div>
        `).join("")}
      </div>
    </section>
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
  const stageRows = (state.curriculum?.stages || [])
    .map((stage) => renderStageSealReadiness(buildStageSealReadiness(stage)))
    .join("");

  return `
    <section class="tracker-section-grid">
      <article class="tracker-panel">
        <h3>Weekly Dashboard</h3>
        <div class="mini-metrics">
          <span>Lessons ${weekSessions.length}/${planned}</span>
          <span>Accuracy ${pct(weeklyAccuracy)}</span>
          <span>Avg ${seconds(weeklyAvg)}</span>
          <span>Fix Rate ${pct(fixRate)}</span>
          <span>剩餘 ${state.lessons.filter((l) => !PASS_STATUSES.has(l.status)).length} 課 · 約 ${planned > 0 ? Math.ceil(state.lessons.filter((l) => !PASS_STATUSES.has(l.status)).length / planned) : "?"} 週</span>
        </div>
      </article>
      <article class="tracker-panel" data-testid="stage-seal-readiness">
        <h3>Stage Seal Readiness</h3>
        <div class="stage-seal-list">${stageRows}</div>
      </article>
    </section>
  `;
}

export function calculateReviewFixRate() {
  const reviewAttempts = state.attempts.filter((attempt) => attempt.step === "previous_review" || attempt.question_type === "review_question");
  return reviewAttempts.length ? average(reviewAttempts.map((attempt) => attempt.is_correct ? 1 : 0)) : 0;
}

function queueBelongsToStage(entry, stageId) {
  const item = state.vocabItems.find((row) => row.item_id === entry.item_id);
  if (item?.stage === stageId) return true;
  const questionIds = new Set(entry.question_ids || []);
  return state.questions.some((question) => questionIds.has(question.question_id) && question.stage === stageId);
}

export function buildStageSealReadiness(stageMeta) {
  const today = window.VocabScoring.localDate();
  const lessons = state.lessons.filter((lesson) => lesson.stage === stageMeta.stage);
  const done = lessons.filter((lesson) => PASS_STATUSES.has(lesson.status)).length;
  const attempts = state.attempts.filter((attempt) => attempt.stage === stageMeta.stage);
  const recentAttempts = attempts.slice(-SEAL_RECENT_ATTEMPT_LIMIT);
  const recentAccuracy = recentAttempts.length
    ? average(recentAttempts.map((attempt) => attempt.is_correct ? 1 : 0))
    : null;
  const repeatedCount = attempts.filter((attempt) => attempt.is_repeated_error).length;
  const repeatedRate = attempts.length ? repeatedCount / attempts.length : null;
  const dueReview = state.reviewQueue.filter((entry) => (
    entry.status === "pending"
    && (!entry.due_date || String(entry.due_date) <= today)
    && queueBelongsToStage(entry, stageMeta.stage)
  ));

  const hasLessons = lessons.length > 0;
  const hasEnoughRecentAttempts = recentAttempts.length >= SEAL_MIN_RECENT_ATTEMPTS;
  const checks = [
    {
      label: "Lessons",
      ok: hasLessons && done === lessons.length,
      detail: hasLessons ? `${done}/${lessons.length} complete` : `${stageMeta.total_lessons || 0} planned`
    },
    {
      label: "Due review",
      ok: dueReview.length === 0,
      detail: dueReview.length ? `${dueReview.length} due` : "clear"
    },
    {
      label: "Repeated errors",
      ok: hasEnoughRecentAttempts && Number(repeatedRate || 0) <= SEAL_REPEATED_ERROR_LIMIT,
      detail: hasEnoughRecentAttempts
        ? `${pct(repeatedRate)} <= ${pct(SEAL_REPEATED_ERROR_LIMIT)}`
        : `need ${SEAL_MIN_RECENT_ATTEMPTS} attempts`
    },
    {
      label: "Recent accuracy",
      ok: hasEnoughRecentAttempts && Number(recentAccuracy || 0) >= SEAL_ACCURACY_TARGET,
      detail: hasEnoughRecentAttempts
        ? `${pct(recentAccuracy)} last ${recentAttempts.length}`
        : `need ${SEAL_MIN_RECENT_ATTEMPTS} attempts`
    }
  ];
  const allSealed = hasLessons && lessons.every((lesson) => lesson.status === "sealed");
  const ready = hasLessons && checks.every((check) => check.ok);
  const reasons = checks.filter((check) => !check.ok).map((check) => `${check.label}: ${check.detail}`);
  const metrics = {
    accuracy: recentAccuracy,
    due_review_count: dueReview.length,
    repeated_error_count: repeatedCount,
    lessons_completed: done,
    lessons_total: lessons.length
  };

  return {
    stage: stageMeta.stage,
    stage_id: stageMeta.stage,
    stageName: stageMeta.stage_name,
    planned: !hasLessons,
    ready,
    is_ready: ready,
    allSealed,
    progress: hasLessons ? done / lessons.length : 0,
    checks,
    reasons,
    metrics
  };
}

function renderStageSealReadiness(readiness) {
  if (readiness.planned) {
    return `
      <div class="stage-seal-card is-planned" data-testid="stage-seal-card-${html(readiness.stage)}">
        <div class="stage-seal-head">
          <span>${html(readiness.stage)} ${html(readiness.stageName)}</span>
          <strong>Planned</strong>
        </div>
        <small>No runnable lessons yet.</small>
      </div>
    `;
  }

  const label = readiness.allSealed ? "Sealed" : readiness.ready ? "Ready" : "Open";
  const statusClass = readiness.allSealed ? "is-sealed" : readiness.ready ? "is-ready" : "is-open";

  return `
    <div class="stage-seal-card ${statusClass}" data-testid="stage-seal-card-${html(readiness.stage)}">
      <div class="stage-seal-head">
        <span>${html(readiness.stage)} ${html(readiness.stageName)}</span>
        <strong>${label}</strong>
      </div>
      <div class="tracker-progress"><div style="width:${Math.round(readiness.progress * 100)}%"></div></div>
      <div class="stage-seal-checks">
        ${readiness.checks.map((check) => `
          <span class="${check.ok ? "ok" : "wait"}">
            <b>${check.ok ? "OK" : "Wait"}</b> ${html(check.label)}: ${html(check.detail)}
          </span>
        `).join("")}
      </div>
    </div>
  `;
}
