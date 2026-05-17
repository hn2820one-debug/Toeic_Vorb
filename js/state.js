export const LESSON_STEPS = [
  { id: "previous_review", label: "Previous Quick Review", minutes: 5 },
  { id: "new_vocabulary", label: "New Vocabulary", minutes: 10 },
  { id: "pattern_focus", label: "Pattern / Collocation Focus", minutes: 10 },
  { id: "toeic_practice", label: "TOEIC Practice", minutes: 15 },
  { id: "error_review_scheduling", label: "Error Review + Scheduling", minutes: 5 }
];

export const PASS_STATUSES = new Set(["completed", "completed_with_reinforcement", "sealed"]);

export const state = {
  view: "today",
  curriculum: null,
  user: null,
  lessons: [],
  questions: [],
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
    stage: "",
    lesson_id: "",
    type: "",
    error_code: ""
  },
  tickId: null,
  showFeedback: false,
  bankPage: 0,
  masteryFilter: { level: "" },
  grammarLinks: {}
};

export function questionTypeLabel(type) {
  return {
    meaning_choice: "Meaning",
    word_family: "Word Family",
    collocation: "Collocation",
    formal_phrase: "Formal Phrase",
    false_friend: "False Friend",
    scene_vocabulary: "Scene Vocabulary",
    part5_sentence_completion: "Part 5",
    part6_context_choice: "Part 6 Context",
    speed_drill: "Speed Drill",
    review_question: "Review"
  }[type] || type || "Question";
}

export function lessonTypeLabel(type) {
  return {
    diagnostic: "Diagnostic",
    word_family: "Word Family",
    scene_vocabulary: "Scene Vocabulary",
    collocation: "Collocation",
    mixed_review: "Mixed Review",
    speed_reflex: "Speed Reflex"
  }[type] || type || "Lesson";
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
    blind: "Blind",
    weak: "Weak",
    unstable: "Unstable",
    stable: "Stable",
    mastered: "Mastered"
  }[level] || "Blind";
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
  state.vocabItems = vocabItems.sort((a, b) => String(a.item_id).localeCompare(String(b.item_id)));
  state.attempts = attempts.sort((a, b) => String(a.timestamp).localeCompare(String(b.timestamp)));
  state.sessions = sessions.sort((a, b) => String(a.date).localeCompare(String(b.date)));
  state.errorLogs = errorLogs;
  state.reviewQueue = reviewQueue.sort((a, b) => (b.priority || 0) - (a.priority || 0) || String(a.due_date).localeCompare(String(b.due_date)));
  state.prefs = window.VocabDB.loadPrefs();
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
