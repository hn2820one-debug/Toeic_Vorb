export const LESSON_STEPS = [
  { id: "previous_review", label: "上一輪快速複習", minutes: 5 },
  { id: "new_vocabulary", label: "新單字學習", minutes: 10 },
  { id: "pattern_focus", label: "句型 / 搭配詞聚焦", minutes: 10 },
  { id: "toeic_practice", label: "TOEIC 練習", minutes: 15 },
  { id: "error_review_scheduling", label: "錯題回顧與安排", minutes: 5 }
];

export const PASS_STATUSES = new Set(["completed", "completed_with_reinforcement", "sealed"]);
export const WORD_HIGHLIGHT_KEY = "toeic_vocab_word_highlights";

export const ERROR_CODE_LABELS = {
  VOCAB_UNKNOWN:     "核心詞義不熟",
  VOCAB_WEAK_RECALL: "記憶鞏固不足",
  WORD_FAMILY_POS:   "詞性混淆",
  COLLOCATION_PREP:  "搭配詞錯誤",
  PHRASE_MEANING:    "詞組語意不明",
  FORMAL_PHRASE:     "正式用語欠缺",
  FALSE_FRIEND:      "近義詞混淆",
  SCENE_VOCAB_GAP:   "商業情境詞彙",
  TIME_PRESSURE:     "反應速度不足",
  CARELESS:          "粗心失誤",
  REPEATED_ERROR:    "反覆出錯"
};

export function errorCodeLabel(code) {
  return ERROR_CODE_LABELS[code] || code || "未知";
}

export const state = {
  view: "today",
  curriculum: null,
  user: null,
  lessons: [],
  questions: [],
  questionEdits: [],
  vocabItems: [],
  attempts: [],
  sessions: [],
  errorLogs: [],
  reviewQueue: [],
  prefs: {},
  activeSession: null,
  isFinishing: false,
  runtimeQuestions: [],
  currentQuestionKey: null,
  questionStartedAt: null,
  pendingAnswer: null,
  lockedQuestionSeconds: null,
  reviewSessionId: null,
  reviewFilter: "due",
  lastReviewSummary: null,
  roadmapFilters: {
    stage: "",
    status: "",
    lesson_type: ""
  },
  selectedQuestionId: null,
  bankFilters: {
    search: "",
    stage: "",
    lesson_id: "",
    type: "",
    error_code: ""
  },
  tickId: null,
  showFeedback: false,
  bankPage: 0,
  masteryFilter: { level: "", search: "" },
  grammarLinks: {},
  stageSealPending: null,
  speedTimerFired: false,
  wordHighlights: [],
  wordHighlightSuppressAnswerUntil: 0
};

export function questionTypeLabel(type) {
  return {
    meaning_choice: "詞義判斷",
    word_family: "詞族變化",
    collocation: "搭配詞",
    formal_phrase: "正式用語",
    false_friend: "易混字",
    scene_vocabulary: "情境字彙",
    part5_sentence_completion: "Part 5",
    part6_context_choice: "Part 6 語境",
    speed_drill: "速度練習",
    review_question: "複習題"
  }[type] || type || "題型";
}

export function lessonTypeLabel(type) {
  return {
    diagnostic: "診斷",
    word_family: "詞族",
    scene_vocabulary: "情境字彙",
    collocation: "搭配詞",
    mixed_review: "混合複習",
    speed_reflex: "速度反應"
  }[type] || type || "課程";
}

export function learningGuidance(question) {
  return {
    meaning_choice: "先看空格前後的語意限制，再排除同場景但不合語意的選項。",
    word_family: "先判斷空格需要的詞性，再用句子功能檢查字尾形式。",
    collocation: "重點是自然搭配，不是單字各自的中文意思。",
    formal_phrase: "檢查正式語氣、文件目的，以及商務信件常見固定說法。",
    false_friend: "先確認題目情境，不要只靠看起來熟悉的字面意思。",
    scene_vocabulary: "先判斷文件或對話場景，再選能自然完成 TOEIC 情境的詞。",
    part5_sentence_completion: "先快速定位文法或搭配線索，再回到整句確認語意。",
    part6_context_choice: "先讀前後句的工作流程，再選能讓段落邏輯連貫的搭配。",
    speed_drill: "用第一反應作答；慢但答對也要回頭練到穩定快速。",
    review_question: "這題用來確認舊錯是否真的修正，請優先檢查上次錯因。"
  }[question?.type] || "先判斷題目要測的能力，再排除看似合理但不自然的選項。";
}

export function $(id) {
  return document.getElementById(id);
}

export function html(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[char]));
}

export const ADVANCED_TOOL_ACTIONS = [
  { view: "export", label: "匯出完整資料封包" },
  { view: "bank", label: "題庫管理" }
];

export function renderAdvancedToolButtons(options = {}) {
  const {
    views = ADVANCED_TOOL_ACTIONS.map((action) => action.view),
    containerClass = "tracker-actions",
    containerTestId = "",
    buttonClass = "button secondary"
  } = options;
  const visibleActions = ADVANCED_TOOL_ACTIONS.filter((action) => views.includes(action.view));
  const testAttr = containerTestId ? ` data-testid="${html(containerTestId)}"` : "";
  return `
    <div class="${html(containerClass)}"${testAttr}>
      ${visibleActions.map((action) => `<button class="${html(buttonClass)}" type="button" onclick="VocabTracker.setView('${html(action.view)}')">${html(action.label)}</button>`).join("")}
    </div>
  `;
}

export function renderAdvancedToolsPanel(options = {}) {
  const {
    tag = "section",
    title = "進階工具",
    note = "匯出完整資料封包與題庫管理屬於進階 / 維護功能；一般學習請優先使用 Today、Roadmap、Lesson 與 Mistakes。",
    testId = "",
    actionsTestId = ""
  } = options;
  const testAttr = testId ? ` data-testid="${html(testId)}"` : "";
  return `
    <${tag} class="tracker-panel"${testAttr}>
      <h3>${html(title)}</h3>
      <p class="muted-note">${html(note)}</p>
      ${renderAdvancedToolButtons({ containerTestId: actionsTestId })}
    </${tag}>
  `;
}

export function renderQuestionText(text) {
  return html(text).replace(/_{4,}/g, (m) => `<span class="blank-token">${m}</span>`);
}

export function normalizeHighlightedText(text) {
  const words = String(text || "").match(/[A-Za-z][A-Za-z'-]*/g) || [];
  if (!words.length || words.length > 6) return "";
  return words.join(" ");
}

export function normalizeHighlightKey(text) {
  return normalizeHighlightedText(text).toLowerCase();
}

export function loadWordHighlights() {
  try {
    const rows = JSON.parse(localStorage.getItem(WORD_HIGHLIGHT_KEY) || "[]");
    return Array.isArray(rows) ? rows : [];
  } catch (_err) {
    return [];
  }
}

export function saveWordHighlights(rows) {
  const cleanRows = Array.isArray(rows) ? rows.slice(-1000) : [];
  state.wordHighlights = cleanRows;
  try {
    localStorage.setItem(WORD_HIGHLIGHT_KEY, JSON.stringify(cleanRows));
    if (window.VocabTracker?.markGoogleDriveLocalChange) {
      window.VocabTracker.markGoogleDriveLocalChange("word_highlights");
    } else {
      window.GoogleDriveSyncData?.markLocalChange?.("word_highlights");
    }
  } catch (_err) {
    // Keep in-memory state even if localStorage is unavailable or full.
  }
  return cleanRows;
}

export function addWordHighlight(record) {
  const text = normalizeHighlightedText(record?.text);
  const normalized = normalizeHighlightKey(text);
  if (!text || !normalized || !record?.question_id) return null;

  const rows = loadWordHighlights();
  const now = new Date().toISOString();
  const existing = rows.find((row) => (
    row.status !== "removed"
    && row.normalized === normalized
    && row.question_id === record.question_id
    && row.session_id === record.session_id
  ));

  if (existing) {
    existing.updated_at = now;
    existing.occurrences = Number(existing.occurrences || 1) + 1;
    saveWordHighlights(rows);
    return existing;
  }

  const highlight = {
    highlight_id: `hl_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    created_at: now,
    updated_at: now,
    status: "active",
    occurrences: 1,
    text,
    normalized,
    user_id: record.user_id || "",
    session_id: record.session_id || "",
    stage: record.stage || "",
    lesson_id: record.lesson_id || "",
    lesson_title: record.lesson_title || "",
    question_id: record.question_id || "",
    question_type: record.question_type || "",
    target_item_id: record.target_item_id || "",
    source: record.source || "lesson_text",
    context_text: record.context_text || ""
  };
  rows.push(highlight);
  saveWordHighlights(rows);
  return highlight;
}

export function removeWordHighlight(highlightId) {
  const rows = loadWordHighlights().filter((row) => row.highlight_id !== highlightId);
  saveWordHighlights(rows);
}

export function wordHighlightsForQuestion(questionId, sessionId = "") {
  return (state.wordHighlights || []).filter((row) => (
    row.status !== "removed"
    && row.question_id === questionId
    && (!sessionId || row.session_id === sessionId)
  ));
}

export function wordHighlightSummary(rows = state.wordHighlights || []) {
  const groups = {};
  rows
    .filter((row) => row.status !== "removed")
    .forEach((row) => {
      const key = row.normalized || normalizeHighlightKey(row.text);
      if (!key) return;
      if (!groups[key]) {
        groups[key] = {
          normalized: key,
          text: row.text || key,
          occurrences: 0,
          question_ids: new Set(),
          lesson_ids: new Set(),
          latest_at: ""
        };
      }
      const group = groups[key];
      group.occurrences += Number(row.occurrences || 1);
      if (row.question_id) group.question_ids.add(row.question_id);
      if (row.lesson_id) group.lesson_ids.add(row.lesson_id);
      if (String(row.updated_at || row.created_at || "") > String(group.latest_at || "")) {
        group.latest_at = row.updated_at || row.created_at || "";
        group.text = row.text || group.text;
      }
    });

  return Object.values(groups)
    .map((group) => ({
      normalized: group.normalized,
      text: group.text,
      occurrences: group.occurrences,
      question_count: group.question_ids.size,
      lesson_count: group.lesson_ids.size,
      lesson_ids: [...group.lesson_ids],
      latest_at: group.latest_at
    }))
    .sort((a, b) => (b.occurrences - a.occurrences) || String(b.latest_at).localeCompare(String(a.latest_at)));
}

export function pct(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return "0%";
  return `${Math.round(Number(value) * 100)}%`;
}

export function seconds(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return "0.0s";
  return `${Number(value).toFixed(1)}s`;
}

export function round(value, digits) {
  const n = Number(value || 0);
  return Number.isFinite(n) ? n.toFixed(digits ?? 1) : "0";
}

export function average(values) {
  const clean = values.map(Number).filter(Number.isFinite);
  return clean.length ? clean.reduce((sum, value) => sum + value, 0) / clean.length : 0;
}

export function byId(records, key) {
  const out = {};
  records.forEach((record) => {
    out[record[key]] = record;
  });
  return out;
}

export function statusLabel(status) {
  return {
    not_started: "未開始",
    in_progress: "進行中",
    completed: "完成",
    completed_with_reinforcement: "完成 + 補強",
    needs_retake: "需重跑",
    sealed: "已封存"
  }[status] || status || "未開始";
}

export function masteryLabel(level) {
  return {
    blind: "陌生",
    weak: "薄弱",
    unstable: "不穩定",
    stable: "穩定",
    mastered: "精熟"
  }[level] || "陌生";
}

export function optionText(question, answer) {
  if (!question || !answer) return "";
  return question.options?.[answer] || answer;
}

export function setNotice(message, tone) {
  const el = $("tracker-notice");
  if (!el) return;
  el.innerHTML = message ? `<div class="tracker-alert ${tone || ""}">${html(message)}</div>` : "";
}

export function localDateFromTimestamp(timestamp) {
  if (!timestamp) return "";
  return String(timestamp).slice(0, 10);
}

export function isWithinLastDays(dateText, days) {
  if (!dateText) return false;
  const d = new Date(`${dateText}T00:00:00`);
  if (Number.isNaN(d.getTime())) return false;
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  cutoff.setHours(0, 0, 0, 0);
  return d >= cutoff;
}

export async function loadData() {
  const [
    curriculumRows,
    users,
    lessons,
    questions,
    questionEdits,
    vocabItems,
    attempts,
    sessions,
    errorLogs,
    reviewQueue
  ] = await Promise.all([
    window.VocabDB.getAll("curriculum"),
    window.VocabDB.getAll("users"),
    window.VocabDB.getAll("lessons"),
    window.VocabDB.getAll("questions"),
    window.VocabDB.getAll("question_edits"),
    window.VocabDB.getAll("vocab_items"),
    window.VocabDB.getRecentAttempts(300),
    window.VocabDB.getAll("sessions"),
    window.VocabDB.getAll("error_logs"),
    window.VocabDB.getAll("review_queue")
  ]);

  state.curriculum = curriculumRows.find((row) => row.course_id === window.VocabDB.COURSE_ID) || curriculumRows[0] || null;
  state.user = users[0] || { user_id: "Keith", display_name: "Keith", baseline_score: 570, target_score: 750 };
  state.lessons = lessons.sort((a, b) => (a.lesson_number || 0) - (b.lesson_number || 0));
  state.questions = questions;
  state.questionEdits = questionEdits.sort((a, b) => String(b.edited_at || "").localeCompare(String(a.edited_at || "")));
  state.vocabItems = vocabItems.sort((a, b) => String(a.item_id).localeCompare(String(b.item_id)));
  state.attempts = attempts.sort((a, b) => String(a.timestamp).localeCompare(String(b.timestamp)));
  state.sessions = sessions.sort((a, b) => String(a.date).localeCompare(String(b.date)));
  state.errorLogs = errorLogs;
  state.reviewQueue = reviewQueue.sort((a, b) => (b.priority || 0) - (a.priority || 0) || String(a.due_date).localeCompare(String(b.due_date)));
  state.prefs = window.VocabDB.loadPrefs();
  state.wordHighlights = loadWordHighlights();
}

export function currentLesson() {
  const lastOpened = state.prefs.last_opened_lesson;
  const active = state.lessons.find((lesson) => lesson.lesson_id === lastOpened && !PASS_STATUSES.has(lesson.status));
  if (active) return active;
  return state.lessons.find((lesson) => !PASS_STATUSES.has(lesson.status) && lesson.status !== "needs_retake")
    || state.lessons.find((lesson) => lesson.status === "needs_retake")
    || state.lessons[0];
}

export function topCounts(records, field, limit) {
  const counts = {};
  records.forEach((record) => {
    const value = record[field];
    if (!value) return;
    counts[value] = (counts[value] || 0) + 1;
  });
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit || 5);
}

export function answerDistribution(questions) {
  const dist = { A: 0, B: 0, C: 0, D: 0 };
  questions.forEach((question) => {
    if (dist[question.correct_answer] !== undefined) dist[question.correct_answer] += 1;
  });
  return dist;
}

export function moduleAccuracy() {
  const groups = {};
  state.attempts.forEach((attempt) => {
    const type = attempt.question_type || "unknown";
    if (!groups[type]) groups[type] = [];
    groups[type].push(attempt.is_correct ? 1 : 0);
  });
  return Object.entries(groups)
    .map(([type, values]) => [type, average(values)])
    .sort((a, b) => a[1] - b[1]);
}
