import {
  PASS_STATUSES,
  state,
  $,
  html,
  seconds,
  setNotice,
  loadData,
  currentLesson
} from "./state.js";
import { renderToday } from "./views/today.js";
import {
  renderRoadmap,
  setRoadmapFilter as updateRoadmapFilter,
  clearRoadmapFilters as resetRoadmapFilters
} from "./views/roadmap.js";
import { renderMastery } from "./views/mastery.js";
import {
  configureLessonView,
  renderLesson,
  prepareRuntime,
  startLesson,
  startReviewMode,
  answerCurrent,
  confirmCurrentAnswer,
  advanceAfterFeedback,
  nextQuestion,
  previousQuestion,
  resumeLesson,
  togglePause,
  exitLesson,
  finishLesson,
  confirmStartLesson,
  cancelStageSeal,
  speedAnswerCurrent,
  speedTimeoutCurrent,
  SPEED_TIME_LIMIT,
  isSpeedSession,
  addItemToReview,
  captureLessonHighlight,
  removeLessonHighlight,
  dismissLessonResumeBanner
} from "./views/lesson.js";
import {
  configureMistakesView,
  renderMistakes,
  confirmSessionErrors,
  closeSessionReview,
  dismissPostLessonSummary,
  markQueueDone,
  setReviewFilter
} from "./views/mistakes.js";
import {
  configureExportView,
  renderExport,
  exportPackage,
  downloadExportFile,
  exportGoogleDriveBackup,
  previewGoogleDriveBackup,
  mergeGoogleDriveBackup,
  buildGoogleDriveBackupPayload,
  analyzeGoogleDriveBackupPayload,
  mergeGoogleDriveBackupPayload
} from "./views/export.js";
import {
  configureBankView,
  renderQuestionBank,
  setBankFilter,
  selectQuestion,
  newQuestionTemplate,
  saveQuestionFromEditor,
  deleteSelectedQuestion,
  importQuestions,
  exportQuestions,
  exportLocalEditsPatch,
  downloadSeedJson,
  showValidation,
  loadMoreBankQuestions
} from "./views/bank.js";
import {
  configureSettingsView,
  renderSettings,
  saveSettings,
  clearActiveSession,
  connectGoogleDrive,
  disconnectGoogleDrive,
  performGoogleDriveSync,
  setGoogleDriveAutoSync,
  syncGoogleDriveNow,
  changeLessonStatus
} from "./views/settings.js";

(function () {
  let deferredInstallPrompt = null;
  let driveAutoSyncTimer = null;
  let driveAutoSyncInFlight = false;
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredInstallPrompt = e;
  });

  function driveAutoSyncState() {
    return window.GoogleDriveSyncData?.getAutoSyncState?.() || { enabled: false, pending: false };
  }

  function driveClientStatus() {
    return window.GoogleDriveSyncClient?.getStatus?.() || { state: "unavailable", connected: false, hasToken: false };
  }

  function canRunGoogleDriveAutoSync() {
    const auto = driveAutoSyncState();
    const status = driveClientStatus();
    return Boolean(auto.enabled && status.state === "connected" && status.connected && status.hasToken && navigator.onLine !== false);
  }

  function isRetryableGoogleDriveError(error) {
    return Boolean(error?.retryable || [
      "DRIVE_SYNC_OFFLINE",
      "DRIVE_SYNC_NETWORK_ERROR",
      "DRIVE_SYNC_RETRYABLE"
    ].includes(error?.code));
  }

  function googleDriveRetryDelayMs(error) {
    const retryAfterMs = Number(error?.retryAfterMs);
    if (Number.isFinite(retryAfterMs) && retryAfterMs > 0) {
      return Math.min(60000, Math.max(1000, retryAfterMs));
    }
    return 15000;
  }

  async function runGoogleDriveAutoSync(reason = "auto") {
    if (driveAutoSyncInFlight || !canRunGoogleDriveAutoSync()) {
      return { skipped: true, reason };
    }
    driveAutoSyncInFlight = true;
    try {
      const result = await performGoogleDriveSync({ reason });
      if (state.view === "settings") render();
      return { skipped: false, reason, result };
    } catch (error) {
      const auto = driveAutoSyncState();
      const retryScheduled = isRetryableGoogleDriveError(error) && auto.enabled && auto.pending
        ? scheduleGoogleDriveAutoSync("auto_retry_backoff", { mark: false, delayMs: googleDriveRetryDelayMs(error) }).scheduled
        : false;
      if (state.view === "settings") {
        const message = error.message || "Google Drive auto sync failed.";
        setNotice(retryScheduled ? `${message} 系統會稍後自動重試。` : message, "warn");
        render();
      }
      return {
        skipped: true,
        reason,
        error: error.message || String(error),
        retryScheduled
      };
    } finally {
      driveAutoSyncInFlight = false;
    }
  }

  function isActiveLessonRuntime() {
    return Boolean(state.activeSession && state.view === "lesson");
  }

  function flushDeferredDriveSync() {
    if (!state.deferDriveSyncUntilLessonEnd) return;
    state.deferDriveSyncUntilLessonEnd = false;
    const auto = driveAutoSyncState();
    if (auto.enabled && auto.pending) {
      scheduleGoogleDriveAutoSync("lesson_end", { mark: false, delayMs: 800 });
    }
  }

  function scheduleGoogleDriveAutoSync(reason = "local_change", options = {}) {
    const shouldMark = options.mark !== false;
    const delayMs = Number.isFinite(Number(options.delayMs)) ? Number(options.delayMs) : 1500;
    const auto = shouldMark
      ? window.GoogleDriveSyncData?.markLocalChange?.(reason)
      : driveAutoSyncState();
    if (driveAutoSyncTimer) {
      clearTimeout(driveAutoSyncTimer);
      driveAutoSyncTimer = null;
    }
    if (isActiveLessonRuntime() && shouldMark) {
      state.deferDriveSyncUntilLessonEnd = true;
      return { scheduled: false, deferred: true, auto };
    }
    if (!auto?.enabled || !canRunGoogleDriveAutoSync()) return { scheduled: false, auto };
    driveAutoSyncTimer = setTimeout(() => {
      driveAutoSyncTimer = null;
      runGoogleDriveAutoSync(reason);
    }, Math.max(0, delayMs));
    return { scheduled: true, auto };
  }

  function markGoogleDriveLocalChange(reason = "local_change") {
    return scheduleGoogleDriveAutoSync(reason, { mark: true });
  }

  window.addEventListener("online", () => {
    state.connectivity = "online";
    const auto = driveAutoSyncState();
    if (!isActiveLessonRuntime() && auto.enabled && auto.pending) {
      scheduleGoogleDriveAutoSync("online_retry", { mark: false, delayMs: 1000 });
    }
    if (!isActiveLessonRuntime()) render();
  });

  window.addEventListener("offline", () => {
    state.connectivity = "offline";
    if (!isActiveLessonRuntime()) render();
  });

  function dismissSwUpdateNotice() {
    state.swUpdatePending = false;
    render();
  }

  async function watchServiceWorkerUpdates() {
    if (!("serviceWorker" in navigator)) return;
    try {
      const registration = await navigator.serviceWorker.ready;
      registration.addEventListener("updatefound", () => {
        const worker = registration.installing;
        if (!worker) return;
        worker.addEventListener("statechange", () => {
          if (worker.state === "installed" && navigator.serviceWorker.controller) {
            state.swUpdatePending = true;
            if (!isActiveLessonRuntime()) render();
          }
        });
      });
    } catch (_error) {
      // Ignore SW registration failures in unsupported contexts.
    }
  }

  function renderConnectivityBanners() {
    const parts = [];
    if (state.swUpdatePending && !isActiveLessonRuntime()) {
      parts.push(`
        <aside class="tracker-alert info sw-update-banner" data-testid="sw-update-banner" aria-live="polite">
          <span>有新版本可更新（建議完成目前題組後再重新整理）</span>
          <div class="sw-update-actions">
            <button class="button secondary small" type="button" data-testid="sw-update-reload" onclick="location.reload()">重新整理</button>
            <a class="button secondary small" href="./clear-sw.html" data-testid="sw-update-repair">修復快取</a>
            <button class="button secondary small" type="button" data-testid="dismiss-sw-update" onclick="VocabTracker.dismissSwUpdateNotice()">稍後</button>
          </div>
        </aside>
      `);
    }
    if (state.connectivity === "offline" && !isActiveLessonRuntime()) {
      parts.push(`
        <aside class="tracker-alert warn offline-banner" data-testid="offline-banner" aria-live="polite">
          <span>目前離線 · 學習資料仍會保存在此裝置</span>
        </aside>
      `);
    }
    return parts.join("");
  }

  function renderShell() {
    const completed = state.lessons.filter((lesson) => PASS_STATUSES.has(lesson.status)).length;
    const total = state.lessons.length;
    const questionTotal = state.questions.length;
    const isEmptyProductionSeed = total === 0 && questionTotal === 0;
    const lesson = currentLesson();
    const progressLabel = total ? `已完成 ${completed}/${total} 課` : "目前沒有正式課程";
    const lessonLabel = lesson?.lesson_id || (total ? "-" : "重建中");
    $("top-strip").textContent = `TOEIC 單字追蹤器｜${progressLabel}｜目前課程：${lessonLabel}｜本機優先 IndexedDB`;

    const tabs = [
      ["today", "今日"],
      ["roadmap", "課程地圖"],
      ["lesson", "課程"],
      ["mistakes", "複習"],
      ["mastery", "精熟度"],
      ["export", "匯出"],
      ["bank", "題庫"],
      ["settings", "設定"]
    ];
    $("tracker-tabs").innerHTML = tabs.map(([id, label]) => (
      `<button class="tracker-tab ${state.view === id ? "active" : ""}" type="button" onclick="VocabTracker.setView('${id}')">${html(label)}</button>`
    )).join("");

    const banner = $("empty-seed-banner");
    if (banner) {
      banner.hidden = !isEmptyProductionSeed;
      banner.innerHTML = isEmptyProductionSeed ? `
        <aside class="empty-seed-banner" data-testid="empty-seed-banner" aria-label="Production seed 清空狀態">
          <div class="empty-seed-banner-copy">
            <strong>正式課程重建中</strong>
            <p>production seed 目前為空：0 lessons / 0 questions。Today、Roadmap 與 Lesson 不會提供可開始的正式課程；既有 IndexedDB 學習資料、Export、Mastery、Mistakes 與 Question Bank 仍可使用。</p>
            <small>此提示不可手動關閉，會在正式 lesson 與 question seed 恢復後自動消失。</small>
          </div>
          <div class="empty-seed-banner-actions" aria-label="清空模式下一步">
            <button class="button primary small" type="button" onclick="VocabTracker.setView('roadmap')">查看課程地圖</button>
              <button class="button secondary small" type="button" onclick="VocabTracker.setView('export')">匯出完整資料封包</button>
              <button class="button secondary small" type="button" onclick="VocabTracker.setView('bank')">題庫管理</button>
          </div>
        </aside>
      ` : "";
    }
  }

  function stopTicker() {
    if (state.tickId) {
      clearInterval(state.tickId);
      state.tickId = null;
    }
    lastQuestionTimerLabel = "";
  }

  let lastQuestionTimerLabel = "";

  function startTicker() {
    if (state.tickId) return;
    const intervalMs = state.activeSession && state.view === "lesson" && window.matchMedia?.("(max-width: 860px)").matches
      ? 500
      : 1000;
    state.tickId = setInterval(updateRuntimeTimers, intervalMs);
  }

  function lessonElapsedSeconds() {
    const session = state.activeSession;
    if (!session) return 0;
    const now = Date.now();
    const pausedNow = session.paused && session.pause_started_at_ms ? now - session.pause_started_at_ms : 0;
    return Math.max(0, Math.round((now - session.started_at_ms - (session.total_paused_ms || 0) - pausedNow) / 1000));
  }

  function updateRuntimeTimers() {
    if (!state.activeSession) return;
    const lessonTimer = $("lesson-elapsed");
    const questionTimer = $("question-elapsed");
    if (lessonTimer) {
      const elapsed = lessonElapsedSeconds();
      const mins = Math.floor(elapsed / 60);
      const secs = String(elapsed % 60).padStart(2, "0");
      lessonTimer.textContent = `${mins}:${secs}`;
    }
    if (questionTimer) {
      if (state.lockedQuestionSeconds !== null && state.lockedQuestionSeconds !== undefined) {
        questionTimer.textContent = seconds(state.lockedQuestionSeconds);
        questionTimer.classList.add("is-locked");
        return;
      }
      questionTimer.classList.remove("is-locked");
      const value = state.activeSession.paused || !state.questionStartedAt
        ? 0
        : Math.max(0, (Date.now() - state.questionStartedAt) / 1000);
      const label = seconds(value);
      if (label !== lastQuestionTimerLabel) {
        questionTimer.textContent = label;
        lastQuestionTimerLabel = label;
      }
    }
    if (isSpeedSession(state.activeSession) && !state.activeSession.paused && state.questionStartedAt) {
      const currentQId = state.currentQuestionKey;
      if (currentQId && !state.activeSession.answers?.[currentQId]) {
        const elapsed = (Date.now() - state.questionStartedAt) / 1000;
        const remaining = Math.max(0, SPEED_TIME_LIMIT - elapsed);
        const countdownEl = document.getElementById("speed-countdown");
        if (countdownEl) {
          countdownEl.textContent = String(Math.ceil(remaining));
          countdownEl.className = `speed-countdown${remaining <= 3 ? " danger" : remaining <= 6 ? " warn" : ""}`;
        }
        if (remaining <= 0 && !state.speedTimerFired) {
          speedTimeoutCurrent();
        }
      }
    }
  }

  function applyTrackerDisplayPrefs() {
    const prefs = state.prefs || {};
    const root = document.documentElement;
    const systemReducedMotion = Boolean(window.matchMedia?.("(prefers-reduced-motion: reduce)").matches);
    root.classList.toggle("tracker-large-text", Boolean(prefs.mobile_large_text));
    root.classList.toggle("tracker-reduced-motion", Boolean(prefs.mobile_reduced_motion) || systemReducedMotion);
    root.classList.toggle("tracker-low-distraction", Boolean(prefs.mobile_low_distraction));
  }

  function render() {
    applyTrackerDisplayPrefs();
    renderShell();
    stopTicker();

    const bannerHost = $("tracker-runtime-banners");
    if (bannerHost) bannerHost.innerHTML = renderConnectivityBanners();

    const view = $("tracker-view");
    if (!view) return;
    view.removeAttribute("aria-busy");

    if (state.view === "today") view.innerHTML = renderToday();
    if (state.view === "roadmap") view.innerHTML = renderRoadmap();
    if (state.view === "lesson") view.innerHTML = renderLesson();
    if (state.view === "mistakes") view.innerHTML = renderMistakes();
    if (state.view === "mastery") view.innerHTML = renderMastery();
    if (state.view === "export") view.innerHTML = renderExport();
    if (state.view === "bank") view.innerHTML = renderQuestionBank();
    if (state.view === "settings") view.innerHTML = renderSettings();

    if (state.view === "lesson" && state.activeSession) {
      // Reset question clock when entering lesson view so tab-switch idle time is excluded.
      if (state.currentQuestionKey && !state.activeSession.answers?.[state.currentQuestionKey] && !state.questionStartedAt) {
        state.questionStartedAt = Date.now();
      }
      startTicker();
      updateRuntimeTimers();
    }
  }

  function setView(view) {
    state.view = view;
    if (view !== "mistakes") state.reviewSessionId = null;
    if (view !== "lesson" && !state.activeSession) flushDeferredDriveSync();
    if (view !== "lesson") state.stageSealPending = null;
    render();
  }

  function setRoadmapFilter(key, value) {
    updateRoadmapFilter(key, value);
    render();
  }

  function clearRoadmapFilters() {
    resetRoadmapFilters();
    render();
  }

  configureLessonView({ render, setView, lessonElapsedSeconds });
  configureMistakesView({ render, setView });
  configureExportView({ render });
  configureBankView({ render });
  configureSettingsView({ render });

  document.addEventListener("keydown", (event) => {
    if (state.view !== "lesson" || !state.activeSession || state.activeSession.paused) return;
    if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement || event.target instanceof HTMLSelectElement) return;
    if (state.showFeedback) {
      if (event.key === "Enter" || event.key === " ") { event.preventDefault(); advanceAfterFeedback(); }
      return;
    }
    if (state.pendingAnswer && (event.key === "Enter" || event.key === " ")) {
      event.preventDefault();
      confirmCurrentAnswer();
      return;
    }
    const keyMap = { a: "A", b: "B", c: "C", d: "D", "1": "A", "2": "B", "3": "C", "4": "D" };
    const letter = keyMap[event.key.toLowerCase()];
    if (letter) { event.preventDefault(); answerCurrent(letter); }
  });

  function setMasteryFilter(key, value) {
    if (!state.masteryFilter) state.masteryFilter = {};
    state.masteryFilter[key] = value;
    render();
  }

  async function init() {
    try {
      if (!window.indexedDB) {
        throw new Error("NO_IDB");
      }
      $("tracker-view").setAttribute("aria-busy", "true");
      $("tracker-view").innerHTML = `
        <section class="tracker-panel tracker-loading-skeleton" data-testid="lesson-loading-skeleton" aria-label="課程載入中">
          <div class="skeleton-line skeleton-line-strong"></div>
          <div class="skeleton-line"></div>
          <div class="skeleton-grid">
            <div class="skeleton-tile"></div>
            <div class="skeleton-tile"></div>
            <div class="skeleton-tile"></div>
          </div>
          <div class="skeleton-button"></div>
        </section>
      `;
      const seed = await window.VocabDB.seedIfNeeded();
      state.grammarLinks = await window.VocabDB.fetchJSON("./data/vocab/grammar_links.json").catch(() => ({}));
      await loadData();
      const active = window.VocabDB.loadActiveSession();
      if (active) {
        state.activeSession = active;
        await prepareRuntime(active.lesson_id, active);
      }
      state.connectivity = typeof navigator !== "undefined" && navigator.onLine === false ? "offline" : "online";
      watchServiceWorkerUpdates();
      render();
      scheduleGoogleDriveAutoSync("app_start", { mark: false, delayMs: 0 });
      if (seed.seeded) setNotice("Seeded V0-V3 curriculum and question bank into IndexedDB.", "ok");
    } catch (err) {
      console.error(err);
      const isIdbError = err.message === "NO_IDB" || String(err.message).toLowerCase().includes("indexeddb");
      const msg = isIdbError
        ? "此瀏覽器不支援 IndexedDB。請使用 Chrome / Edge / Firefox 的正常模式（非隱私模式）開啟。"
        : html(err.message || String(err));
      $("tracker-view").removeAttribute("aria-busy");
      $("tracker-view").innerHTML = `<section class="tracker-panel"><div class="tracker-alert danger">${msg}</div></section>`;
    }
  }

  function triggerInstall() {
    if (!deferredInstallPrompt) return;
    deferredInstallPrompt.prompt();
    deferredInstallPrompt.userChoice.then(() => { deferredInstallPrompt = null; });
    window.VocabDB.savePrefs({ ...window.VocabDB.loadPrefs(), install_dismissed: true });
  }

  function dismissInstall() {
    deferredInstallPrompt = null;
    window.VocabDB.savePrefs({ ...window.VocabDB.loadPrefs(), install_dismissed: true });
    render();
  }

  function hasInstallPrompt() {
    return !!deferredInstallPrompt;
  }

  window.VocabTracker = {
    addItemToReview,
    advanceAfterFeedback,
    answerCurrent,
    cancelStageSeal,
    speedAnswerCurrent,
    speedTimeoutCurrent,
    changeLessonStatus,
    clearActiveSession,
    clearRoadmapFilters,
    closeSessionReview,
    confirmSessionErrors,
    confirmCurrentAnswer,
    confirmStartLesson,
    connectGoogleDrive,
    captureLessonHighlight,
    deleteSelectedQuestion,
    disconnectGoogleDrive,
    downloadExportFile,
    downloadSeedJson,
    exitLesson,
    exportPackage,
    exportGoogleDriveBackup,
    exportLocalEditsPatch,
    exportQuestions,
    finishLesson,
    previewGoogleDriveBackup,
    mergeGoogleDriveBackup,
    analyzeGoogleDriveSyncPayload: (payload) => window.GoogleDriveSyncData.analyzeMerge(payload),
    buildGoogleDriveBackupPayload,
    buildGoogleDriveSyncPayload: () => window.GoogleDriveSyncData.buildPayload(),
    analyzeGoogleDriveBackupPayload,
    mergeGoogleDriveBackupPayload,
    mergeGoogleDriveSyncPayload: (payload) => window.GoogleDriveSyncData.mergePayload(payload),
    validateGoogleDriveSyncPayload: (payload) => window.GoogleDriveSyncData.validatePayload(payload),
    importQuestions,
    init,
    loadMoreBankQuestions,
    markQueueDone,
    newQuestionTemplate,
    nextQuestion,
    previousQuestion,
    performGoogleDriveSync,
    removeLessonHighlight,
    saveQuestionFromEditor,
    saveSettings,
    selectQuestion,
    setGoogleDriveAutoSync,
    setBankFilter,
    setMasteryFilter,
    setRoadmapFilter,
    setView,
    showValidation,
    startLesson,
    startReviewMode,
    setReviewFilter,
    markGoogleDriveLocalChange,
    runGoogleDriveAutoSync,
    scheduleGoogleDriveAutoSync,
    syncGoogleDriveNow,
    togglePause,
    triggerInstall,
    dismissInstall,
    dismissLessonResumeBanner,
    dismissPostLessonSummary,
    dismissSwUpdateNotice,
    hasInstallPrompt
  };
})();
