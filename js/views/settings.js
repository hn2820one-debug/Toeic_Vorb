import {
  state,
  $,
  html,
  renderAdvancedToolsPanel,
  setNotice,
  loadData,
  isCompactTrackerViewport
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

function driveSyncStatusText(status) {
  const labels = {
    unavailable: "未設定",
    disconnected: "未連接",
    connecting: "連接中",
    connected: "已連接",
    reconnect_required: "需要重新連接",
    error: "錯誤"
  };
  return labels[status?.state] || "未設定";
}

function syncTimeLabel(value) {
  return value ? String(value) : "尚未同步";
}

function pendingReasonsLabel(reasons) {
  const rows = Array.isArray(reasons) ? reasons : [];
  return rows.length ? rows.join(", ") : "無";
}

function mergeNamedCounts(left = {}, right = {}) {
  const merged = {};
  const keys = new Set([...Object.keys(left || {}), ...Object.keys(right || {})]);
  keys.forEach((key) => {
    merged[key] = Number(left?.[key] || 0) + Number(right?.[key] || 0);
  });
  return merged;
}

function combineMergeResults(primary, secondary) {
  const result = {
    added: mergeNamedCounts(primary?.added, secondary?.added),
    merged: mergeNamedCounts(primary?.merged, secondary?.merged),
    skipped: mergeNamedCounts(primary?.skipped, secondary?.skipped),
    blocked: mergeNamedCounts(primary?.blocked, secondary?.blocked),
    warnings: Array.from(new Set([...(primary?.warnings || []), ...(secondary?.warnings || [])])),
    seed_mismatch: Boolean(primary?.seed_mismatch || secondary?.seed_mismatch),
    seed_version_changed: Boolean(primary?.seed_version_changed || secondary?.seed_version_changed),
    remerged: true
  };
  result.totals = {
    added: Object.values(result.added).reduce((sum, value) => sum + Number(value || 0), 0),
    merged: Object.values(result.merged).reduce((sum, value) => sum + Number(value || 0), 0),
    skipped: Object.values(result.skipped).reduce((sum, value) => sum + Number(value || 0), 0),
    blocked: Object.values(result.blocked).reduce((sum, value) => sum + Number(value || 0), 0)
  };
  return result;
}

function renderDriveSyncPanel() {
  const client = window.GoogleDriveSyncClient;
  const config = window.GoogleDriveSyncConfig || {};
  const autoSync = window.GoogleDriveSyncData?.getAutoSyncState?.() || {
    enabled: false,
    pending: false,
    pendingCount: 0,
    pendingReasons: [],
    lastSuccessAt: "",
    lastAttemptAt: "",
    lastError: ""
  };
  const status = client?.getStatus?.() || {
    state: config.isConfigured ? "disconnected" : "unavailable",
    configured: Boolean(config.isConfigured),
    folderName: config.folderName || "TOEIC Vocabulary Tracker Sync",
    syncFileName: config.syncFileName || "toeic_vocab_drive_sync_state.json",
    lastError: ""
  };
  const configured = Boolean(status.configured);
  const connected = status.state === "connected";
  const connectDisabled = !configured || status.state === "connecting";
  const syncDisabled = !connected;

  return `
    <section class="tracker-panel settings-drive-sync-panel" data-testid="settings-drive-sync-panel">
      <div class="section-title-row">
        <div>
          <h3>Google Drive 同步</h3>
          <p class="muted-note">SYNC-01：一般瀏覽器可連接 Google Drive 做跨裝置同步；手動備份仍在 Export 可用。</p>
        </div>
        <span class="status-pill ${configured ? "done" : "todo"}" data-testid="settings-drive-sync-status">${html(driveSyncStatusText(status))}</span>
      </div>
      <div class="stage-list compact" data-testid="settings-drive-sync-details">
        <div class="stage-row"><span>OAuth Client ID</span><strong>${configured ? "已設定" : "未設定"}</strong></div>
        <div class="stage-row"><span>Drive folder</span><strong>${html(status.folderName || config.folderName || "-")}</strong></div>
        <div class="stage-row"><span>Sync file</span><strong>${html(status.syncFileName || config.syncFileName || "-")}</strong></div>
        <div class="stage-row"><span>Token storage</span><strong>memory-only</strong></div>
        <div class="stage-row"><span>Last successful sync</span><strong data-testid="settings-drive-last-sync">${html(syncTimeLabel(autoSync.lastSuccessAt))}</strong></div>
        <div class="stage-row"><span>Pending local changes</span><strong data-testid="settings-drive-pending">${autoSync.pending ? `${html(autoSync.pendingCount)} pending` : "0 pending"}</strong></div>
        <div class="stage-row"><span>Pending reasons</span><strong data-testid="settings-drive-pending-reasons">${html(pendingReasonsLabel(autoSync.pendingReasons))}</strong></div>
      </div>
      ${status.lastError ? `<div class="tracker-alert warn">${html(status.lastError)}</div>` : ""}
      ${status.lastWarning ? `<div class="tracker-alert warn" data-testid="settings-drive-sync-warning">${html(status.lastWarning)}</div>` : ""}
      ${autoSync.lastError ? `<div class="tracker-alert warn" data-testid="settings-drive-auto-sync-error">${html(autoSync.lastError)}</div>` : ""}
      <label class="settings-inline-toggle" data-testid="settings-drive-auto-sync-row">
        <input type="checkbox" data-testid="settings-drive-auto-sync-toggle" onchange="VocabTracker.setGoogleDriveAutoSync(this.checked)" ${autoSync.enabled ? "checked" : ""}>
        <span>Auto sync while this app is open and Google Drive is connected</span>
      </label>
      <p class="muted-note" data-testid="settings-drive-background-note">背景同步不會在 app 關閉時執行；token 只保存在記憶體，重新開啟後需要重新連接 Google Drive。</p>
      <div class="tracker-actions settings-actions">
        <button class="button primary" type="button" data-testid="settings-drive-connect-button" onclick="VocabTracker.connectGoogleDrive()" ${connectDisabled ? "disabled" : ""}>連接 Google Drive</button>
        <button class="button secondary" type="button" data-testid="settings-drive-sync-now-button" onclick="VocabTracker.syncGoogleDriveNow()" ${syncDisabled ? "disabled" : ""}>立即同步</button>
        <button class="button secondary" type="button" data-testid="settings-drive-disconnect-button" onclick="VocabTracker.disconnectGoogleDrive()" ${connected ? "" : "disabled"}>中斷連接</button>
      </div>
    </section>
  `;
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
        <button class="button ${isCompactTrackerViewport() ? "warning" : "secondary"}" type="button" data-testid="settings-clear-session-button" onclick="VocabTracker.clearActiveSession()">清除目前課程續作</button>
      </aside>
    </section>
    <section class="tracker-panel settings-mobile-panel" data-testid="settings-mobile-learning">
      <h3>手機學習體驗</h3>
      <p class="muted-note">僅影響本機顯示，不改變題庫或評分規則。外接鍵盤在課程中仍可使用 A/B/C/D 與 Enter。</p>
      <div class="settings-mobile-toggles">
        <label class="settings-inline-toggle" data-testid="settings-mobile-large-text">
          <input id="setting-mobile-large-text" type="checkbox" ${state.prefs.mobile_large_text ? "checked" : ""}>
          <span>較大字級（題幹與選項，避免爆版）</span>
        </label>
        <label class="settings-inline-toggle" data-testid="settings-mobile-reduced-motion">
          <input id="setting-mobile-reduced-motion" type="checkbox" ${state.prefs.mobile_reduced_motion ? "checked" : ""}>
          <span>減少動態效果（含回饋過場）</span>
        </label>
        <label class="settings-inline-toggle" data-testid="settings-mobile-low-distraction">
          <input id="setting-mobile-low-distraction" type="checkbox" ${state.prefs.mobile_low_distraction ? "checked" : ""}>
          <span>低干擾模式（隱藏非必要提示列）</span>
        </label>
      </div>
      <p class="muted-note settings-mobile-note" data-testid="settings-mobile-wake-lock-note">螢幕常亮：v1 未啟用（避免額外耗電）；左手模式：v1 以全寬底部主按鈕取代，不提供額外切換。</p>
    </section>
    ${renderDriveSyncPanel()}
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
    active_user_id: user.user_id,
    planned_lessons_this_week: Number($("setting-weekly").value || 5),
    daily_goal_questions: Number($("setting-daily-goal")?.value || 30),
    mobile_large_text: Boolean($("setting-mobile-large-text")?.checked),
    mobile_reduced_motion: Boolean($("setting-mobile-reduced-motion")?.checked),
    mobile_low_distraction: Boolean($("setting-mobile-low-distraction")?.checked)
  });
  window.VocabTracker?.markGoogleDriveLocalChange?.("settings");
  await loadData();
  setNotice("設定已儲存。", "ok");
  callRender();
}

export async function clearActiveSession() {
  if (isCompactTrackerViewport()) {
    const ok = window.confirm("確定要清除目前課程續作？\n\n作答紀錄、複習隊列與精熟度不會刪除。");
    if (!ok) return;
  }
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

export async function connectGoogleDrive() {
  try {
    const status = await window.GoogleDriveSyncClient.connect();
    setNotice(`Google Drive 已連接。狀態：${driveSyncStatusText(status)}。`, "ok");
    window.VocabTracker?.scheduleGoogleDriveAutoSync?.("connect", { mark: false, delayMs: 0 });
  } catch (error) {
    setNotice(error.message || "Google Drive 連接失敗。", "warn");
  }
  callRender();
}

export async function disconnectGoogleDrive() {
  try {
    await window.GoogleDriveSyncClient.disconnect();
    setNotice("Google Drive 已中斷連接。", "ok");
  } catch (error) {
    setNotice(error.message || "Google Drive 中斷連接失敗。", "warn");
  }
  callRender();
}

export async function syncGoogleDriveNow() {
  try {
    const { mergeResult } = await performGoogleDriveSync({ reason: "manual" });
    const added = mergeResult.totals?.added || 0;
    const merged = mergeResult.totals?.merged || 0;
    const warningNote = mergeResult.warnings?.length ? "；有 seed/version 警告但未改 production seed" : "";
    setNotice(`Google Drive safe sync 完成：新增 ${added} 筆、合併 ${merged} 筆${warningNote}。`, "ok");
  } catch (error) {
    setNotice(error.message || "Google Drive 同步失敗。", "warn");
  }
  callRender();
}

export async function performGoogleDriveSync({ reason = "manual" } = {}) {
  void reason;
  window.GoogleDriveSyncData.recordSyncAttempt();
  try {
    const syncFile = await window.GoogleDriveSyncClient.ensureSyncFile();
    let snapshot = await window.GoogleDriveSyncClient.downloadSyncSnapshot(syncFile.file.id);
    let mergeResult = await window.GoogleDriveSyncData.mergePayload(snapshot.payload);
    let nextPayload = await window.GoogleDriveSyncData.buildPayload();
    let uploadResult;
    let remerged = false;

    try {
      uploadResult = await window.GoogleDriveSyncClient.uploadSyncState(nextPayload, snapshot.file.id, {
        expectedModifiedTime: snapshot.file.modifiedTime || ""
      });
    } catch (error) {
      if (error?.code !== "DRIVE_SYNC_UPLOAD_CONFLICT") {
        throw error;
      }
      const latestSnapshot = await window.GoogleDriveSyncClient.downloadSyncSnapshot(snapshot.file.id);
      const remergeResult = await window.GoogleDriveSyncData.mergePayload(latestSnapshot.payload);
      mergeResult = combineMergeResults(mergeResult, remergeResult);
      nextPayload = await window.GoogleDriveSyncData.buildPayload();
      uploadResult = await window.GoogleDriveSyncClient.uploadSyncState(nextPayload, latestSnapshot.file.id, {
        expectedModifiedTime: latestSnapshot.file.modifiedTime || ""
      });
      snapshot = latestSnapshot;
      remerged = true;
    }

    window.GoogleDriveSyncData.recordSyncSuccess();
    await loadData();
    return { mergeResult: remerged ? { ...mergeResult, remerged: true } : mergeResult, uploadResult, payload: nextPayload, remerged };
  } catch (error) {
    window.GoogleDriveSyncData.recordSyncFailure(error);
    throw error;
  }
}

export function setGoogleDriveAutoSync(enabled) {
  const state = window.GoogleDriveSyncData.setAutoSyncEnabled(Boolean(enabled));
  setNotice(enabled ? "Google Drive auto sync 已啟用；只會在 app 開啟且已連接時執行。" : "Google Drive auto sync 已暫停。", enabled ? "ok" : "warn");
  if (state.enabled) {
    window.VocabTracker?.scheduleGoogleDriveAutoSync?.("auto_sync_enabled", { mark: false, delayMs: 0 });
  }
  callRender();
}

export async function changeLessonStatus(lessonId, status) {
  const lesson = await window.VocabDB.get("lessons", lessonId);
  if (!lesson) return;

  await window.VocabDB.put("lessons", { ...lesson, status });
  window.VocabTracker?.markGoogleDriveLocalChange?.("lesson_status");
  await loadData();
  callRender();
}
