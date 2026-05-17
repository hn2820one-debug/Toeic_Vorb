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
  togglePause,
  exitLesson,
  finishLesson
} from "./views/lesson.js";
import {
  configureMistakesView,
  renderMistakes,
  confirmSessionErrors,
  closeSessionReview,
  markQueueDone,
  setReviewFilter
} from "./views/mistakes.js";
import {
  configureExportView,
  renderExport,
  exportPackage,
  downloadExportFile
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
  downloadSeedJson,
  showValidation,
  loadMoreBankQuestions
} from "./views/bank.js";
import {
  configureSettingsView,
  renderSettings,
  saveSettings,
  clearActiveSession,
  changeLessonStatus
} from "./views/settings.js";

(function () {

  function renderShell() {
    const completed = state.lessons.filter((lesson) => PASS_STATUSES.has(lesson.status)).length;
    const total = state.lessons.length || 1;
    const lesson = currentLesson();
    $("top-strip").textContent = `TOEIC Vocabulary Tracker | ${completed}/${total} vocab lessons | Current: ${lesson?.lesson_id || "-"} | Local-first IndexedDB`;

    const tabs = [
      ["today", "Today"],
      ["roadmap", "Roadmap"],
      ["lesson", "Lesson"],
      ["mistakes", "Mistakes"],
      ["mastery", "Mastery"],
      ["export", "Export"],
      ["bank", "Question Bank"],
      ["settings", "Settings"]
    ];
    $("tracker-tabs").innerHTML = tabs.map(([id, label]) => (
      `<button class="tracker-tab ${state.view === id ? "active" : ""}" type="button" onclick="VocabTracker.setView('${id}')">${html(label)}</button>`
    )).join("");
  }

  function stopTicker() {
    if (state.tickId) {
      clearInterval(state.tickId);
      state.tickId = null;
    }
  }

  function startTicker() {
    if (state.tickId) return;
    state.tickId = setInterval(updateRuntimeTimers, 1000);
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
        return;
      }
      const value = state.activeSession.paused || !state.questionStartedAt
        ? 0
        : Math.max(0, (Date.now() - state.questionStartedAt) / 1000);
      questionTimer.textContent = seconds(value);
    }
  }

  function render() {
    renderShell();
    stopTicker();

    const view = $("tracker-view");
    if (!view) return;

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
      $("tracker-view").innerHTML = `<section class="tracker-panel"><p class="muted-note">Loading TOEIC Vocabulary Tracker...</p></section>`;
      const seed = await window.VocabDB.seedIfNeeded();
      state.grammarLinks = await window.VocabDB.fetchJSON("./data/vocab/grammar_links.json").catch(() => ({}));
      await loadData();
      const active = window.VocabDB.loadActiveSession();
      if (active) {
        state.activeSession = active;
        await prepareRuntime(active.lesson_id, active);
      }
      render();
      if (seed.seeded) setNotice("Seeded V0-V3 curriculum and question bank into IndexedDB.", "ok");
    } catch (err) {
      console.error(err);
      const isIdbError = err.message === "NO_IDB" || String(err.message).toLowerCase().includes("indexeddb");
      const msg = isIdbError
        ? "此瀏覽器不支援 IndexedDB。請使用 Chrome / Edge / Firefox 的正常模式（非隱私模式）開啟。"
        : html(err.message || String(err));
      $("tracker-view").innerHTML = `<section class="tracker-panel"><div class="tracker-alert danger">${msg}</div></section>`;
    }
  }

  window.VocabTracker = {
    advanceAfterFeedback,
    answerCurrent,
    changeLessonStatus,
    clearActiveSession,
    clearRoadmapFilters,
    closeSessionReview,
    confirmSessionErrors,
    confirmCurrentAnswer,
    deleteSelectedQuestion,
    downloadExportFile,
    downloadSeedJson,
    exitLesson,
    exportPackage,
    exportQuestions,
    finishLesson,
    importQuestions,
    init,
    loadMoreBankQuestions,
    markQueueDone,
    newQuestionTemplate,
    nextQuestion,
    previousQuestion,
    saveQuestionFromEditor,
    saveSettings,
    selectQuestion,
    setBankFilter,
    setMasteryFilter,
    setRoadmapFilter,
    setView,
    showValidation,
    startLesson,
    startReviewMode,
    setReviewFilter,
    togglePause
  };
})();
