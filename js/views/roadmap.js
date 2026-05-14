import {
  PASS_STATUSES,
  state,
  html,
  statusLabel
} from "../state.js";

export function renderRoadmap() {
  const stageCards = (state.curriculum?.stages || []).map((stage) => {
    const lessons = state.lessons.filter((lesson) => lesson.stage === stage.stage);
    const done = lessons.filter((lesson) => PASS_STATUSES.has(lesson.status)).length;
    const denom = lessons.length || stage.total_lessons || 1;
    return `
      <article class="stage-card">
        <div class="stage-card-head">
          <strong>${html(stage.stage)} ${html(stage.stage_name)}</strong>
          <span>${html(stage.status)}</span>
        </div>
        <div class="tracker-progress"><div style="width:${Math.round((done / denom) * 100)}%"></div></div>
        <small>${done}/${denom} lessons</small>
      </article>
    `;
  }).join("");

  const rows = state.lessons.map((lesson) => `
    <article class="lesson-line status-${html(lesson.status || "not_started")}">
      <div class="lesson-main">
        <span class="lesson-dot"></span>
        <div>
          <strong>${html(lesson.lesson_id)} · ${html(lesson.title)}</strong>
          <small>${html(lesson.stage_name)} · ${lesson.estimated_minutes} min · ${lesson.question_ids?.length || 0} questions + ${lesson.review_question_ids?.length || 0} review</small>
        </div>
      </div>
      <div class="lesson-tools">
        <select onchange="VocabTracker.changeLessonStatus('${html(lesson.lesson_id)}', this.value)">
          ${["not_started", "in_progress", "completed", "completed_with_reinforcement", "needs_retake", "sealed"].map((status) => `<option value="${status}" ${lesson.status === status ? "selected" : ""}>${statusLabel(status)}</option>`).join("")}
        </select>
        <button class="button small" type="button" onclick="VocabTracker.startLesson('${html(lesson.lesson_id)}')">Start</button>
      </div>
    </article>
  `).join("");

  return `
    <section class="tracker-grid stage-grid">${stageCards}</section>
    <section class="tracker-panel">
      <h3>Curriculum Roadmap</h3>
      <div class="lesson-list">${rows}</div>
    </section>
  `;
}