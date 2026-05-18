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
    ? `複習 ${pendingQueue.length} 個到期項目`
    : nextAction === "retake_current_lesson"
    ? `重跑 ${html(lesson?.lesson_id || "")}`
    : `${html(lesson?.lesson_id || "")} · ${html(lesson?.title || "")}`;
  const nextActionBtn = nextAction === "review_due_items"
    ? `<button class="button primary" type="button" onclick="VocabTracker.startReviewMode('due')">開始複習</button>`
    : `<button class="button primary" type="button" onclick="VocabTracker.startLesson('${html(lesson?.lesson_id || "")}')">${nextAction === "retake_current_lesson" ? "開始重跑" : "開始課程"}</button>`;

  return `
    ${buildCompletionMessage() ? `<div class="tracker-alert ok">${html(buildCompletionMessage())}</div>` : ""}
    ${window.VocabTracker?.hasInstallPrompt?.() && !state.prefs.install_dismissed ? `
      <div class="tracker-alert info install-banner">
        <span>安裝為桌面 App，可離線使用</span>
        <div class="install-banner-actions">
          <button class="button primary small" type="button" onclick="VocabTracker.triggerInstall()">安裝</button>
          <button class="button secondary small" type="button" onclick="VocabTracker.dismissInstall()">略過</button>
        </div>
      </div>` : ""}
    <section class="tracker-hero">
      <div>
        <div class="tracker-kicker">目前階段</div>
        <h2>${html(lesson?.stage || "V0")} ${html(lesson?.stage_name || "診斷")}</h2>
        <p>${html(lesson?.lesson_id || "-")} · ${html(lesson?.title || "尚未選擇課程")}</p>
      </div>
      ${nextActionBtn}
    </section>

    <section class="tracker-grid tracker-grid--five">
      <article class="tracker-stat">
        <span>今日題數</span>
        <strong>${todayAttempts.length}/${dailyGoal}</strong>
        <small>${streak > 0 ? `連續 ${streak} 天` : "今天開始"}</small>
        <div class="daily-goal-bar"><div style="width:${Math.min(100, Math.round(todayAttempts.length / dailyGoal * 100))}%"></div></div>
      </article>
      <article class="tracker-stat"><span>正確率</span><strong>${pct(accuracy)}</strong><small>${wrongAttempts.length} 題錯誤</small></article>
      <article class="tracker-stat"><span>平均時間</span><strong>${seconds(avgTime)}</strong><small>每題平均</small></article>
      <article class="tracker-stat"><span>課程進度</span><strong>${completed}/${state.lessons.length}</strong><small>${Math.round((completed / (state.lessons.length || 1)) * 100)}%</small></article>
      <article class="tracker-stat${pendingQueue.length ? " stat-alert" : ""}"><span>到期複習</span><strong>${pendingQueue.length}</strong><small>${pendingQueue.length ? "有待複習項目" : "目前清空"}</small></article>
    </section>

    ${diagnostic ? renderDiagnosticRecommendation(diagnostic) : ""}

    <section class="tracker-section-grid">
      <article class="tracker-panel">
        <h3>下一步</h3>
        <p class="tracker-bigline">${nextActionLabel}</p>
        ${renderTodayLessonFocus(lesson)}
        <div class="tracker-actions">
          ${nextActionBtn}
          <button class="button secondary" type="button" onclick="VocabTracker.setView('mistakes')">錯題複習</button>
          <button class="button secondary" type="button" onclick="VocabTracker.setView('export')">資料匯出</button>
          <button class="button secondary" type="button" onclick="VocabTracker.setView('bank')">題庫</button>
        </div>
      </article>
      <article class="tracker-panel">
        <h3>今日主要錯因</h3>
        ${topErrors.length ? `<ol class="tracker-list">${topErrors.map(([code, count]) => `<li>${html(errorCodeLabel(code))} <small class="muted-note error-code-tag">${html(code)}</small> <span>${count}</span></li>`).join("")}</ol>` : `<p class="muted-note">今天還沒有錯題紀錄。</p>`}
      </article>
      <article class="tracker-panel">
        <h3>目前較弱模組</h3>
        ${modules.length ? `<ol class="tracker-list">${modules.map(([type, value]) => `<li>${html(questionTypeLabel(type))} <span>${pct(value)}</span></li>`).join("")}</ol>` : `<p class="muted-note">完成一課後才會顯示模組正確率。</p>`}
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
    ? "V0 顯示基礎還不夠穩，建議先補強詞形與基本回想。"
    : weakRows.length
      ? `目前最弱的診斷面向是 ${questionTypeLabel(weakRows[0].type)}。`
      : "V0 已相對穩定，可以進入正常單字訓練。";

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
    ? `<button class="button primary" type="button" onclick="VocabTracker.startLesson('${html(diagnostic.primaryLesson.lesson_id)}')">開始 ${html(diagnostic.primaryLesson.lesson_id)}</button>`
    : `<button class="button secondary" type="button" onclick="VocabTracker.setView('roadmap')">打開課程地圖</button>`;

  return `
    <section class="tracker-panel diagnostic-panel" data-testid="diagnostic-recommendation">
      <div class="panel-head-row">
        <div>
          <h3>V0 診斷建議</h3>
          <p class="muted-note">${html(diagnostic.reason)}</p>
        </div>
        ${action}
      </div>
      <div class="diagnostic-summary">
        <span>整體 ${pct(diagnostic.overallAccuracy)}</span>
        <span>建議先從 ${html(diagnostic.primaryStage)}</span>
        <span>${html(diagnostic.primaryLesson?.title || "尚未選定課程")}</span>
      </div>
      <div class="diagnostic-rows">
        ${diagnostic.rows.map((row) => `
          <div class="${row.weak ? "weak" : ""}">
            <span>${html(questionTypeLabel(row.type))}</span>
            <strong>${pct(row.accuracy)}</strong>
            <small>${seconds(row.avgTime)} / 目標 ${row.target}s → ${html(row.stage)}</small>
          </div>
        `).join("")}
      </div>
    </section>
  `;
}

function renderTodayLessonFocus(lesson) {
  if (!lesson) return `<p class="muted-note">目前沒有可開始的課程。</p>`;
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
        <h3>本週概況</h3>
        <div class="mini-metrics">
          <span>課程 ${weekSessions.length}/${planned}</span>
          <span>正確率 ${pct(weeklyAccuracy)}</span>
          <span>平均 ${seconds(weeklyAvg)}</span>
          <span>修復率 ${pct(fixRate)}</span>
          <span>剩餘 ${state.lessons.filter((l) => !PASS_STATUSES.has(l.status)).length} 課 · 約 ${planned > 0 ? Math.ceil(state.lessons.filter((l) => !PASS_STATUSES.has(l.status)).length / planned) : "?"} 週</span>
        </div>
      </article>
      <article class="tracker-panel" data-testid="stage-seal-readiness">
        <h3>階段封關準備度</h3>
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
      label: "課程完成",
      ok: hasLessons && done === lessons.length,
      detail: hasLessons ? `${done}/${lessons.length} 已完成` : `${stageMeta.total_lessons || 0} 規劃中`
    },
    {
      label: "到期複習",
      ok: dueReview.length === 0,
      detail: dueReview.length ? `${dueReview.length} 項待處理` : "已清空"
    },
    {
      label: "反覆錯誤",
      ok: hasEnoughRecentAttempts && Number(repeatedRate || 0) <= SEAL_REPEATED_ERROR_LIMIT,
      detail: hasEnoughRecentAttempts
        ? `${pct(repeatedRate)} <= ${pct(SEAL_REPEATED_ERROR_LIMIT)}`
        : `需至少 ${SEAL_MIN_RECENT_ATTEMPTS} 次作答`
    },
    {
      label: "近期正確率",
      ok: hasEnoughRecentAttempts && Number(recentAccuracy || 0) >= SEAL_ACCURACY_TARGET,
      detail: hasEnoughRecentAttempts
        ? `${pct(recentAccuracy)} 最近 ${recentAttempts.length} 題`
        : `需至少 ${SEAL_MIN_RECENT_ATTEMPTS} 次作答`
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
          <strong>規劃中</strong>
        </div>
        <small>尚未有可執行課程。</small>
      </div>
    `;
  }

  const label = readiness.allSealed ? "已封關" : readiness.ready ? "可封關" : "開放中";
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
            <b>${check.ok ? "完成" : "待補"}</b> ${html(check.label)}：${html(check.detail)}
          </span>
        `).join("")}
      </div>
    </div>
  `;
}
