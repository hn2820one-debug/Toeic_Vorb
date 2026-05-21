import {
  state,
  $,
  html,
  renderAdvancedToolsPanel,
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
    <section class="tracker-panel settings-panel" data-testid="settings-panel">
      <h3>設定</h3>
      <div class="settings-grid" data-testid="settings-grid">
        <label><span>使用者</span><input id="setting-user" value="${html(state.user?.display_name || "Keith")}"></label>
        <label><span>起始分數</span><input id="setting-baseline" type="number" value="${html(state.user?.baseline_score || 570)}"></label>
        <label><span>目標分數</span><input id="setting-target" type="number" value="${html(state.user?.target_score || 750)}"></label>
        <label><span>每週規劃課數</span><input id="setting-weekly" type="number" min="1" max="14" value="${html(state.prefs.planned_lessons_this_week || 5)}"></label>
        <label><span>每日目標題數</span><input id="setting-daily-goal" type="number" min="10" max="200" value="${html(state.prefs.daily_goal_questions || 30)}"></label>
      </div>
      <div class="tracker-actions settings-actions" data-testid="settings-actions">
        <button class="button primary" type="button" data-testid="settings-save-button" onclick="VocabTracker.saveSettings()">儲存設定</button>
      </div>
      <aside class="settings-reset-card" data-testid="settings-reset-card">
        <strong>課程續作</strong>
        <p class="muted-note">只會清除目前未完成課程的續作位置，不會刪除作答紀錄、複習隊列、精熟度或匯出資料。</p>
        <button class="button secondary" type="button" data-testid="settings-clear-session-button" onclick="VocabTracker.clearActiveSession()">清除目前課程續作</button>
      </aside>
    </section>
    ${renderAdvancedToolsPanel({
      testId: "settings-advanced-tools",
      actionsTestId: "settings-advanced-tools-actions",
      note: "匯出完整資料封包與題庫管理屬於進階 / 維護功能；建議完成一個 stage，或需要備份 / 檢查本機資料時再使用。"
    })}
    <section class="tracker-panel settings-storage-panel" data-testid="settings-storage-panel">
      <h3>本機資料儲存</h3>
      <div class="stage-list" data-testid="settings-storage-list">
        <div class="stage-row"><span>users</span><strong>1</strong></div>
        <div class="stage-row"><span>lessons</span><strong>${state.lessons.length}</strong></div>
        <div class="stage-row"><span>questions</span><strong>${state.questions.length}</strong></div>
        <div class="stage-row"><span>attempts</span><strong>${state.attempts.length}</strong></div>
        <div class="stage-row"><span>sessions</span><strong>${state.sessions.length}</strong></div>
        <div class="stage-row"><span>review_queue</span><strong>${state.reviewQueue.length}</strong></div>
        <div class="stage-row"><span>word_highlights</span><strong>${state.wordHighlights.length}</strong></div>
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
  setNotice("設定已儲存。", "ok");
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
  setNotice("已清除目前課程續作。", "ok");
  callRender();
}

export async function changeLessonStatus(lessonId, status) {
  const lesson = await window.VocabDB.get("lessons", lessonId);
  if (!lesson) return;

  await window.VocabDB.put("lessons", { ...lesson, status });
  await loadData();
  callRender();
}
