import {
  state,
  $,
  html,
  setNotice,
  loadData
} from "../state.js";

let renderApp = null;

export function configureSettingsView({ render }) {
  renderApp = render;
}

function callRender() {
  if (typeof renderApp !== "function") {
    throw new Error("Settings view not configured");
  }
  renderApp();
}

export function renderSettings() {
  return `
    <section class="tracker-panel">
      <h3>Settings</h3>
      <div class="settings-grid">
        <label><span>User</span><input id="setting-user" value="${html(state.user?.display_name || "Keith")}"></label>
        <label><span>Baseline Score</span><input id="setting-baseline" type="number" value="${html(state.user?.baseline_score || 570)}"></label>
        <label><span>Target Score</span><input id="setting-target" type="number" value="${html(state.user?.target_score || 750)}"></label>
        <label><span>Planned Lessons / Week</span><input id="setting-weekly" type="number" min="1" max="14" value="${html(state.prefs.planned_lessons_this_week || 5)}"></label>
        <label><span>每日目標題數</span><input id="setting-daily-goal" type="number" min="10" max="200" value="${html(state.prefs.daily_goal_questions || 30)}"></label>
      </div>
      <div class="tracker-actions">
        <button class="button primary" type="button" onclick="VocabTracker.saveSettings()">Save Settings</button>
        <button class="button secondary" type="button" onclick="VocabTracker.clearActiveSession()">Clear Active Lesson Resume</button>
      </div>
    </section>
    <section class="tracker-panel">
      <h3>進階工具</h3>
      <p class="muted-note">資料匯出與題庫管理屬於進階功能，建議學習完一個 stage 後使用。</p>
      <div class="tracker-actions">
        <button class="button secondary" type="button" onclick="VocabTracker.setView('export')">Export 資料匯出</button>
        <button class="button secondary" type="button" onclick="VocabTracker.setView('bank')">Question Bank 題庫管理</button>
      </div>
    </section>
    <section class="tracker-panel">
      <h3>Local Stores</h3>
      <div class="stage-list">
        <div class="stage-row"><span>users</span><strong>1</strong></div>
        <div class="stage-row"><span>lessons</span><strong>${state.lessons.length}</strong></div>
        <div class="stage-row"><span>questions</span><strong>${state.questions.length}</strong></div>
        <div class="stage-row"><span>attempts</span><strong>${state.attempts.length}</strong></div>
        <div class="stage-row"><span>sessions</span><strong>${state.sessions.length}</strong></div>
        <div class="stage-row"><span>review_queue</span><strong>${state.reviewQueue.length}</strong></div>
      </div>
    </section>
  `;
}

export async function saveSettings() {
  const user = {
    ...(state.user || {}),
    user_id: state.user?.user_id || "Keith",
    display_name: $("setting-user").value || "Keith",
    baseline_score: Number($("setting-baseline").value || 570),
    target_score: Number($("setting-target").value || 750)
  };

  await window.VocabDB.put("users", user);
  window.VocabDB.savePrefs({
    planned_lessons_this_week: Number($("setting-weekly").value || 5),
    daily_goal_questions: Number($("setting-daily-goal")?.value || 30)
  });
  await loadData();
  setNotice("Settings saved.", "ok");
  callRender();
}

export async function clearActiveSession() {
  window.VocabDB.saveActiveSession(null);
  state.activeSession = null;
  state.runtimeQuestions = [];
  state.currentQuestionKey = null;
  state.questionStartedAt = null;
  state.pendingAnswer = null;
  state.lockedQuestionSeconds = null;
  await loadData();
  callRender();
}

export async function changeLessonStatus(lessonId, status) {
  const lesson = await window.VocabDB.get("lessons", lessonId);
  if (!lesson) return;

  await window.VocabDB.put("lessons", { ...lesson, status });
  await loadData();
  callRender();
}
