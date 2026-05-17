import {
  PASS_STATUSES,
  state,
  html,
  statusLabel,
  lessonTypeLabel,
  currentLesson
} from "../state.js";

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
          <span>${html(stage.status)}</span>
        </div>
        ${isLocked
          ? `<div class="locked-stage-badge">即將開放</div>`
          : `<div class="tracker-progress"><div style="width:${Math.round((done / denom) * 100)}%"></div></div>
             <small>${done}/${denom} lessons</small>`}
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
      ? `Cross-lesson review · ${lesson.question_ids?.length || 0} questions`
      : `${html(lesson.stage_name)} · ${lessonTypeLabel(lesson.lesson_type)} · ${lesson.estimated_minutes} min · ${lesson.question_ids?.length || 0} questions + ${lesson.review_question_ids?.length || 0} review`;
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
          <button class="button small" type="button" onclick="VocabTracker.startLesson('${html(lesson.lesson_id)}')">Start</button>
        </div>
      </article>
    `;
  }).join("");

  return `
    <section class="tracker-grid stage-grid">${stageCards}</section>
    <section class="tracker-panel">
      <div class="panel-head-row">
        <div>
          <h3>Curriculum Roadmap</h3>
          <p class="muted-note" data-testid="roadmap-summary">${visibleLessons.length}/${state.lessons.length} lessons shown. Mixed review lessons are block-level checks, not new question-bank rows.</p>
        </div>
        <div style="display:flex;gap:8px">
          <a class="button secondary small" href="#current-lesson">▶ 跳到目前進度</a>
          <button class="button secondary small" type="button" onclick="VocabTracker.clearRoadmapFilters()">Clear Filters</button>
        </div>
      </div>
      <div class="roadmap-filters" data-testid="roadmap-filters">
        ${renderRoadmapSelect("stage", "Stage", stages, filters.stage, (value) => value)}
        ${renderRoadmapSelect("status", "Status", statuses, filters.status, statusLabel)}
        ${renderRoadmapSelect("lesson_type", "Type", lessonTypes, filters.lesson_type, lessonTypeLabel)}
      </div>
      <div class="lesson-list" data-testid="roadmap-lesson-list">${rows || `<p class="muted-note">No lessons match the current filters.</p>`}</div>
    </section>
  `;
}

function renderRoadmapSelect(key, label, values, selected, labelFn) {
  return `
    <label>
      <span>${html(label)}</span>
      <select data-testid="roadmap-filter-${html(key)}" onchange="VocabTracker.setRoadmapFilter('${key}', this.value)">
        <option value="">All</option>
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
