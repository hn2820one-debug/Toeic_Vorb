import {
  PASS_STATUSES,
  state,
  html,
  renderAdvancedToolsPanel,
  statusLabel,
  lessonTypeLabel,
  currentLesson
} from "../state.js";

function stageStatusLabel(status) {
  return {
    active: "啟用中",
    planned: "規劃中",
    draft: "草稿"
  }[status] || status || "未知";
}

export function renderRoadmap() {
  const filters = state.roadmapFilters || { stage: "", status: "", lesson_type: "" };
  const activeLessonId = currentLesson()?.lesson_id;
  const stageCards = (state.curriculum?.stages || []).map((stage) => {
    const lessons = state.lessons.filter((lesson) => lesson.stage === stage.stage);
    const isLocked = stage.status === "planned" || stage.status === "draft" || !lessons.length;
    const done = lessons.filter((lesson) => PASS_STATUSES.has(lesson.status)).length;
    const denom = lessons.length || stage.total_lessons || 1;
    return `
      <article class="stage-card${isLocked ? " stage-locked" : ""}">
        <div class="stage-card-head">
          <strong>${html(stage.stage)} ${html(stage.stage_name)}</strong>
          <span>${html(stageStatusLabel(stage.status))}</span>
        </div>
        ${isLocked
          ? `<div class="locked-stage-badge">即將開放</div>`
          : `<div class="tracker-progress"><div style="width:${Math.round((done / denom) * 100)}%"></div></div>
             <small>${done}/${denom} 課</small>`}
      </article>
    `;
  }).join("");

  const stages = [...new Set(state.lessons.map((lesson) => lesson.stage))].sort();
  const statuses = ["not_started", "in_progress", "completed", "completed_with_reinforcement", "needs_retake", "sealed"];
  const lessonTypes = [...new Set(state.lessons.map((lesson) => lesson.lesson_type || "lesson"))].sort();
  const visibleLessons = state.lessons.filter((lesson) => {
    if (filters.stage && lesson.stage !== filters.stage) return false;
    if (filters.status && (lesson.status || "not_started") !== filters.status) return false;
    if (filters.lesson_type && (lesson.lesson_type || "lesson") !== filters.lesson_type) return false;
    return true;
  });

  const rows = visibleLessons.map((lesson) => {
    const isMixed = lesson.lesson_type === "mixed_review";
    const metaLine = isMixed
      ? `跨課複習 · ${lesson.question_ids?.length || 0} 題`
      : `${html(lesson.stage_name)} · ${lessonTypeLabel(lesson.lesson_type)} · ${lesson.estimated_minutes} 分鐘 · ${lesson.question_ids?.length || 0} 題 + ${lesson.review_question_ids?.length || 0} 題複習`;
    const isCurrent = lesson.lesson_id === activeLessonId;
    return `
      <article class="lesson-line status-${html(lesson.status || "not_started")}${isMixed ? " type-mixed-review" : ""}${isCurrent ? " is-current" : ""}"${isCurrent ? ` id="current-lesson"` : ""} data-testid="roadmap-lesson-row">
        <div class="lesson-main">
          <span class="lesson-dot"></span>
          <div>
            <strong>${isMixed ? "&#9733; " : ""}${html(lesson.lesson_id)} · ${html(lesson.title)}</strong>
            <small>${metaLine}</small>
          </div>
        </div>
        <div class="lesson-tools">
          <select onchange="VocabTracker.changeLessonStatus('${html(lesson.lesson_id)}', this.value)">
            ${["not_started", "in_progress", "completed", "completed_with_reinforcement", "needs_retake", "sealed"].map((status) => `<option value="${status}" ${lesson.status === status ? "selected" : ""}>${statusLabel(status)}</option>`).join("")}
          </select>
          <button class="button small" type="button" data-testid="roadmap-start-lesson" onclick="VocabTracker.startLesson('${html(lesson.lesson_id)}')">開始</button>
        </div>
      </article>
    `;
  }).join("");

  return `
    <section class="tracker-grid stage-grid">${stageCards}</section>
    <section class="tracker-panel">
      <div class="panel-head-row">
        <div>
          <h3>課程地圖</h3>
          <p class="muted-note" data-testid="roadmap-summary">${visibleLessons.length}/${state.lessons.length} 課顯示中。混合複習課屬於整體檢查，不是新的題庫列。</p>
        </div>
        <div class="panel-head-actions">
          <a class="button secondary small" href="#current-lesson">▶ 跳到目前進度</a>
          <button class="button secondary small" type="button" onclick="VocabTracker.clearRoadmapFilters()">清除篩選</button>
        </div>
      </div>
      <div class="roadmap-filters" data-testid="roadmap-filters">
        ${renderRoadmapSelect("stage", "階段", stages, filters.stage, (value) => value)}
        ${renderRoadmapSelect("status", "狀態", statuses, filters.status, statusLabel)}
        ${renderRoadmapSelect("lesson_type", "類型", lessonTypes, filters.lesson_type, lessonTypeLabel)}
      </div>
      <div class="lesson-list" data-testid="roadmap-lesson-list">${rows || `<p class="muted-note">目前篩選條件下沒有符合的課程。</p>`}</div>
    </section>
    ${renderAdvancedToolsPanel({
      testId: "roadmap-advanced-tools",
      actionsTestId: "roadmap-advanced-tools-actions",
      note: "課程地圖用來安排正式學習進度；需要備份資料或檢查本機題庫時，再使用這兩項進階工具。"
    })}
  `;
}

function renderRoadmapSelect(key, label, values, selected, labelFn) {
  return `
    <label>
      <span>${html(label)}</span>
      <select data-testid="roadmap-filter-${html(key)}" onchange="VocabTracker.setRoadmapFilter('${key}', this.value)">
        <option value="">全部</option>
        ${values.map((value) => `<option value="${html(value)}" ${selected === value ? "selected" : ""}>${html(labelFn(value))}</option>`).join("")}
      </select>
    </label>
  `;
}

export function setRoadmapFilter(key, value) {
  if (!state.roadmapFilters) state.roadmapFilters = {};
  state.roadmapFilters[key] = value;
}

export function clearRoadmapFilters() {
  state.roadmapFilters = { stage: "", status: "", lesson_type: "" };
}
