import {
  PASS_STATUSES,
  state,
  html,
  average,
  byId,
  setNotice,
  loadData,
  currentLesson,
  topCounts
} from "../state.js";
import { buildStageSealReadiness } from "./today.js";

// Maps flat file names to the subdirectory they belong to when saving as a folder.
// Files not listed here are saved at the root of the export folder.
const FILE_SUBDIRS = {
  "report.md": "summary",
  "diagnostic_recommendation.json": "summary",
  "stage_progress.json": "summary",
  "content_quality_summary.json": "summary",
  "attempts.csv": "data",
  "attempts.json": "data",
  "attempts.jsonl": "data",
  "sessions.csv": "data",
  "sessions.json": "data",
  "item_mastery.csv": "data",
  "mastery.json": "data",
  "review_queue.json": "data",
  "error_logs.json": "data",
  "error_summary.json": "analytics",
  "error_summary.csv": "analytics",
  "speed_summary.json": "analytics",
  "review_effectiveness.json": "analytics",
  "review_effectiveness.csv": "analytics",
  "stage_seal_readiness.json": "analytics"
};

// Controls which files appear in each UI category group.
const EXPORT_CATEGORIES = [
  {
    key: "summary",
    label: "摘要 / 報告",
    files: [
      "report.md",
      "summary.md",
      "lesson_recommendations.md",
      "diagnostic_recommendation.json",
      "stage_progress.json",
      "content_quality_summary.json"
    ]
  },
  {
    key: "data",
    label: "資料",
    files: [
      "attempts.csv",
      "attempts.json",
      "attempts.jsonl",
      "sessions.csv",
      "sessions.json",
      "item_mastery.csv",
      "mastery.json",
      "review_queue.json",
      "error_logs.json"
    ]
  },
  {
    key: "analytics",
    label: "分析",
    files: [
      "error_summary.json",
      "error_summary.csv",
      "speed_summary.json",
      "review_effectiveness.json",
      "review_effectiveness.csv",
      "stage_seal_readiness.json"
    ]
  },
  {
    key: "package",
    label: "完整封包",
    files: [
      "question_bank_snapshot.json",
      "raw_events.jsonl"
    ]
    // toeic_vocab_export_DATE.json is added dynamically in renderExport()
  }
];

const exportRuntime = {
  render: null
};

export function configureExportView(deps) {
  exportRuntime.render = deps?.render || exportRuntime.render;
}

function callRender() {
  if (typeof exportRuntime.render !== "function") {
    throw new Error("Export module render callback is not configured.");
  }
  exportRuntime.render();
}

export function renderExport() {
  const date = window.VocabScoring.localDate();
  const files = buildExportFiles();
  const fileNames = Object.keys(files);
  const dateKey = `toeic_vocab_export_${date}.json`;
  const hasDirectoryPicker = typeof window.showDirectoryPicker === "function";
  const modeNote = hasDirectoryPicker
    ? `可直接儲存資料夾。按下匯出後，檔案會自動整理到 <strong>summary/</strong>、<strong>data/</strong> 與 <strong>analytics/</strong> 子資料夾。`
    : `目前是逐檔下載模式，會分別下載 ${fileNames.length} 個檔案。此靜態版本不支援 zip 封裝。`;

  const warnings = [];
  if (!state.attempts.length) warnings.push("目前還沒有作答資料，分析檔案會顯示空值。");
  if (!state.sessions.length) warnings.push("目前還沒有課程紀錄，sessions 類檔案會是空的。");
  if (!state.reviewQueue.length) warnings.push("目前複習佇列是空的，review_queue.json 會輸出空陣列。");

  const warningHtml = warnings.length
    ? `<div class="export-warnings">${warnings.map((w) => `<p class="muted-note">⚠ ${html(w)}</p>`).join("")}</div>`
    : "";

  // Build category sections for the inventory, injecting the dynamic date-keyed file into "Full Package"
  const categoryHtml = EXPORT_CATEGORIES.map((cat) => {
    const catFiles = cat.key === "package"
      ? [...cat.files, dateKey]
      : cat.files;
    const visibleFiles = catFiles.filter((name) => fileNames.includes(name));
    if (!visibleFiles.length) return "";
    return `
      <div class="export-category">
        <h4>${html(cat.label)}</h4>
        <div class="export-category-files">
          ${visibleFiles.map((name) => `<button class="button secondary small" type="button" onclick="VocabTracker.downloadExportFile('${html(name)}')">${html(name)}</button>`).join("")}
        </div>
      </div>
    `;
  }).join("");

  return `
    <section class="tracker-panel">
      <h3>匯出總覽</h3>
      <div class="tracker-grid export-grid">
        <article class="tracker-stat"><span>課程紀錄</span><strong>${state.sessions.length}</strong><small>筆</small></article>
        <article class="tracker-stat"><span>作答紀錄</span><strong>${state.attempts.length}</strong><small>筆</small></article>
        <article class="tracker-stat"><span>單字項目</span><strong>${state.vocabItems.length}</strong><small>精熟度列</small></article>
        <article class="tracker-stat"><span>題目快照</span><strong>${state.questions.length}</strong><small>題</small></article>
      </div>
      <p class="export-mode-note">${modeNote}</p>
      <div class="tracker-actions">
        <button class="button primary" type="button" onclick="VocabTracker.exportPackage()">匯出給 ChatGPT 分析</button>
      </div>
    </section>

    <section class="tracker-panel">
      <div class="panel-head-row">
        <div>
          <h3>匯出清單 — ${fileNames.length} 個檔案</h3>
          <p class="muted-note">點任何檔案都可以單獨下載。</p>
        </div>
      </div>
      ${warningHtml}
      <div class="export-inventory" data-testid="export-file-inventory">
        ${categoryHtml}
      </div>
    </section>

    <section class="tracker-panel">
      <h3>summary.md 預覽</h3>
      <pre class="export-preview">${html(files["summary.md"])}</pre>
    </section>
  `;
}

export function exportValue(value) {
  return value === undefined || value === null ? "" : value;
}

export function exportPercent(value) {
  const n = Number(value);
  return Number.isFinite(n) ? `${(n * 100).toFixed(1)}%` : "insufficient data";
}

export function exportSeconds(value) {
  const n = Number(value);
  return Number.isFinite(n) ? `${n.toFixed(1)}s` : "insufficient data";
}

export function exportMarkdownCell(value) {
  return String(value ?? "")
    .replace(/\|/g, "\\|")
    .replace(/\r?\n/g, " ");
}

export function exportMarkdownTable(headers, rows) {
  if (!rows.length) return "insufficient data";
  return [
    `| ${headers.map(exportMarkdownCell).join(" | ")} |`,
    `| ${headers.map(() => "---").join(" | ")} |`,
    ...rows.map((row) => `| ${row.map(exportMarkdownCell).join(" | ")} |`)
  ].join("\n");
}

export function latestSessionByLesson() {
  const latest = {};
  state.sessions
    .slice()
    .sort((a, b) => String(b.ended_at || b.date || "").localeCompare(String(a.ended_at || a.date || "")))
    .forEach((session) => {
      if (!latest[session.lesson_id]) latest[session.lesson_id] = session;
    });
  return latest;
}

function buildQuestionTypeStats(attempts) {
  const questionTypeStats = {};
  attempts.forEach((attempt) => {
    const key = attempt.question_type || "(unknown)";
    if (!questionTypeStats[key]) {
      questionTypeStats[key] = {
        question_type: key,
        attempts: 0,
        correct: 0,
        wrong: 0,
        total_response_time: 0
      };
    }
    questionTypeStats[key].attempts += 1;
    questionTypeStats[key].correct += attempt.is_correct ? 1 : 0;
    questionTypeStats[key].wrong += attempt.is_correct ? 0 : 1;
    questionTypeStats[key].total_response_time += Number(attempt.response_time_seconds || 0);
  });

  return Object.values(questionTypeStats)
    .map((row) => ({
      ...row,
      accuracy: row.attempts ? row.correct / row.attempts : null,
      avg_response_time: row.attempts ? row.total_response_time / row.attempts : null
    }))
    .sort((a, b) => (Number(a.accuracy) - Number(b.accuracy)) || (b.wrong - a.wrong) || (Number(b.avg_response_time) - Number(a.avg_response_time)));
}

function buildTargetItemStats(attempts) {
  const targetItemStats = {};
  attempts.forEach((attempt) => {
    const key = attempt.target_item_id || "";
    if (!key) return;
    if (!targetItemStats[key]) {
      targetItemStats[key] = {
        target_item_id: key,
        attempts: 0,
        wrong_count: 0,
        correct_count: 0,
        total_response_time: 0,
        last_error_code: "",
        last_timestamp: ""
      };
    }
    const row = targetItemStats[key];
    row.attempts += 1;
    row.wrong_count += attempt.is_correct ? 0 : 1;
    row.correct_count += attempt.is_correct ? 1 : 0;
    row.total_response_time += Number(attempt.response_time_seconds || 0);
    if (String(attempt.timestamp || "") >= String(row.last_timestamp || "")) {
      row.last_timestamp = attempt.timestamp || "";
      row.last_error_code = attempt.error_code || row.last_error_code || "";
    }
  });

  return Object.values(targetItemStats)
    .map((row) => ({
      ...row,
      accuracy: row.attempts ? row.correct_count / row.attempts : null,
      avg_response_time: row.attempts ? row.total_response_time / row.attempts : null
    }))
    .sort((a, b) => (b.wrong_count - a.wrong_count) || (Number(a.accuracy) - Number(b.accuracy)) || (b.attempts - a.attempts));
}

function buildReviewEffectiveness(attempts) {
  const reviewAttempts = attempts.filter((attempt) => attempt.mode === "review_queue");
  const groups = {};

  function add(groupType, groupKey, attempt) {
    if (!groupKey) return;
    const key = `${groupType}:${groupKey}`;
    if (!groups[key]) {
      groups[key] = {
        group_type: groupType,
        group_key: groupKey,
        attempts: 0,
        correct: 0,
        wrong: 0,
        fast_correct: 0,
        total_response_time: 0,
        latest_timestamp: ""
      };
    }
    const row = groups[key];
    row.attempts += 1;
    row.correct += attempt.is_correct ? 1 : 0;
    row.wrong += attempt.is_correct ? 0 : 1;
    row.fast_correct += attempt.speed_bucket === "fast_correct" ? 1 : 0;
    row.total_response_time += Number(attempt.response_time_seconds || 0);
    if (String(attempt.timestamp || "") >= String(row.latest_timestamp || "")) row.latest_timestamp = attempt.timestamp || "";
  }

  reviewAttempts.forEach((attempt) => {
    add("target_item", attempt.target_item_id, attempt);
    add("error_code", attempt.error_code || attempt.default_error_code || "(correct_review)", attempt);
    add("question_type", attempt.question_type || "(unknown)", attempt);
  });

  const rows = Object.values(groups)
    .map((row) => ({
      ...row,
      fix_rate: row.attempts ? row.correct / row.attempts : null,
      avg_response_time: row.attempts ? row.total_response_time / row.attempts : null
    }))
    .sort((a, b) => a.group_type.localeCompare(b.group_type) || (Number(a.fix_rate) - Number(b.fix_rate)) || (b.wrong - a.wrong));

  const overall = {
    attempts: reviewAttempts.length,
    correct: reviewAttempts.filter((attempt) => attempt.is_correct).length,
    wrong: reviewAttempts.filter((attempt) => !attempt.is_correct).length,
    fast_correct: reviewAttempts.filter((attempt) => attempt.speed_bucket === "fast_correct").length,
    fix_rate: reviewAttempts.length ? reviewAttempts.filter((attempt) => attempt.is_correct).length / reviewAttempts.length : null,
    avg_response_time: reviewAttempts.length ? average(reviewAttempts.map((attempt) => attempt.response_time_seconds)) : null
  };

  return {
    overall,
    rows,
    itemRows: rows.filter((row) => row.group_type === "target_item"),
    errorRows: rows.filter((row) => row.group_type === "error_code")
  };
}

function buildRecommendedActions({ attempts, sessions, weakestLessons, questionTypeRows, targetItemRows, pendingQueue, repeatedAttempts }) {
  const recommendedActions = [];
  const weakestLesson = weakestLessons[0];
  const weakestQuestionType = questionTypeRows[0];
  const weakestTargetItem = targetItemRows[0];

  if (!attempts.length || !sessions.length) {
    recommendedActions.push("insufficient data - complete at least one lesson and export again before making curriculum decisions.");
    return recommendedActions;
  }

  if (weakestLesson && Number(weakestLesson.accuracy) < 0.8) {
    recommendedActions.push(`Retake ${weakestLesson.lesson_id} before moving forward; latest accuracy is ${exportPercent(weakestLesson.accuracy)}.`);
  }
  if (weakestQuestionType && Number(weakestQuestionType.accuracy) < 0.8) {
    recommendedActions.push(`Prioritize ${weakestQuestionType.question_type}; current accuracy is ${exportPercent(weakestQuestionType.accuracy)} across ${weakestQuestionType.attempts} attempts.`);
  }
  if (weakestTargetItem && weakestTargetItem.wrong_count >= 2) {
    recommendedActions.push(`Review target item ${weakestTargetItem.target_item_id}; it has ${weakestTargetItem.wrong_count} wrong attempts and latest error code ${weakestTargetItem.last_error_code || "(none)"}.`);
  }
  if (pendingQueue > 0) {
    recommendedActions.push(`Clear the pending review queue (${pendingQueue} items) before expanding into new content.`);
  }
  if (repeatedAttempts.length > 0) {
    recommendedActions.push("Repeated errors exist; stabilize current weak items before starting the next stage.");
  }
  recommendedActions.push("Do not mark V4-V6 as completed; they remain planned-only in the current dataset.");
  return recommendedActions;
}

function buildContentQualitySummary() {
  const lessonById = byId(state.lessons, "lesson_id");
  const itemById = byId(state.vocabItems, "item_id");
  const questionFiles = state.curriculum?.question_files || [];
  const stageQuestionCounts = {};
  const questionTypeCounts = {};

  state.questions.forEach((question) => {
    stageQuestionCounts[question.stage] = (stageQuestionCounts[question.stage] || 0) + 1;
    const typeKey = `${question.stage || "UNKNOWN"}:${question.type || "unknown"}`;
    questionTypeCounts[typeKey] = (questionTypeCounts[typeKey] || 0) + 1;
  });

  function lessonQuestions(lesson) {
    const ids = new Set([...(lesson.question_ids || []), ...(lesson.review_question_ids || [])]);
    return state.questions.filter((question) => ids.has(question.question_id));
  }

  function normalizeStem(text) {
    return String(text || "")
      .replace(/\([^)]*-\d{2}\)\s*$/g, "")
      .replace(/"[^"]+"/g, "\"__\"")
      .replace(/\bV[0-9]-[A-Z]-[0-9]+-\d+\b/g, "ID")
      .replace(/_{2,}/g, "____")
      .replace(/\s+/g, " ")
      .trim();
  }

  function wordCount(text) {
    return String(text || "").split(/\s+/).filter(Boolean).length;
  }

  function sentenceCount(text) {
    return String(text || "").split(/[.!?]+/).filter((part) => part.trim()).length;
  }

  const stemCounts = {};
  state.questions
    .filter((question) => ["V2", "V3"].includes(question.stage))
    .forEach((question) => {
      const key = `${question.stage}:${normalizeStem(question.question_text)}`;
      stemCounts[key] = (stemCounts[key] || 0) + 1;
    });

  const repeatedTemplates = Object.entries(stemCounts)
    .filter(([, count]) => count > 24)
    .map(([key, count]) => ({ key, count }));

  const targetCoverageIssues = state.lessons
    .filter((lesson) => ["V2", "V3"].includes(lesson.stage))
    .map((lesson) => {
      const coverage = {};
      lessonQuestions(lesson).forEach((question) => {
        if (!question.target_item_id) return;
        coverage[question.target_item_id] = (coverage[question.target_item_id] || 0) + 1;
      });
      const counts = Object.values(coverage);
      const min = counts.length ? Math.min(...counts) : 0;
      const max = counts.length ? Math.max(...counts) : 0;
      return {
        lesson_id: lesson.lesson_id,
        stage: lesson.stage,
        targets: counts.length,
        min,
        max,
        spread: max - min
      };
    })
    .filter((row) => row.targets === 0 || row.spread > 2 || row.min < 2);

  const missingOldItemInterference = state.lessons
    .filter((lesson) => ["V2", "V3"].includes(lesson.stage))
    .map((lesson) => {
      const outside = lessonQuestions(lesson).filter((question) => {
        const item = itemById[question.target_item_id];
        if (!item) return false;
        const lessonIds = Array.isArray(item.lesson_ids) ? item.lesson_ids : [item.lesson_id].filter(Boolean);
        return !lessonIds.includes(lesson.lesson_id);
      }).length;
      return { lesson_id: lesson.lesson_id, stage: lesson.stage, outside_items: outside };
    })
    .filter((row) => row.outside_items === 0);

  return {
    generated_at: window.VocabScoring.localIso(),
    seed_version: window.VocabDB.SEED_VERSION,
    total_lessons: state.lessons.length,
    total_questions: state.questions.length,
    question_files: questionFiles,
    stages: (state.curriculum?.stages || []).map((stage) => ({
      stage: stage.stage,
      stage_name: stage.stage_name,
      status: stage.status,
      planned_total_lessons: stage.total_lessons,
      actual_lessons: state.lessons.filter((lesson) => lesson.stage === stage.stage).length,
      actual_questions: stageQuestionCounts[stage.stage] || 0,
      mixed_review_lessons: state.lessons.filter((lesson) => lesson.stage === stage.stage && lesson.lesson_type === "mixed_review").length
    })),
    question_type_counts: Object.entries(questionTypeCounts)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([key, count]) => {
        const [stage, type] = key.split(":");
        return { stage, type, count };
      }),
    quality_warnings: {
      repeated_v2_v3_templates_above_24: repeatedTemplates.length,
      short_v3_part6_context_questions: state.questions.filter((question) => question.stage === "V3" && question.type === "part6_context_choice" && (wordCount(question.question_text) < 24 || sentenceCount(question.question_text) < 2)).length,
      translation_heavy_v2_questions: state.questions.filter((question) => question.stage === "V2" && /[㐀-鿿]/.test(question.question_text || "")).length,
      target_coverage_issues: targetCoverageIssues.length,
      missing_old_item_interference_lessons: missingOldItemInterference.length,
      speed_drill_non_time_pressure: state.questions.filter((question) => question.type === "speed_drill" && question.default_error_code !== "TIME_PRESSURE").length
    },
    samples: {
      target_coverage_issues: targetCoverageIssues.slice(0, 12),
      missing_old_item_interference_lessons: missingOldItemInterference.slice(0, 12),
      repeated_templates: repeatedTemplates.slice(0, 12),
      first_lesson_by_stage: Object.fromEntries((state.curriculum?.stages || []).map((stage) => [
        stage.stage,
        state.lessons.find((lesson) => lesson.stage === stage.stage)?.lesson_id || ""
      ]))
    },
    lesson_lookup_note: Object.keys(lessonById).length
      ? "lesson_id references are available in question_bank_snapshot.json"
      : "no lesson rows loaded"
  };
}

function buildLessonRecommendationsMarkdown(stageProgress) {
  const today = window.VocabScoring.localDate();
  const current = currentLesson();
  const dueQueue = state.reviewQueue.filter((entry) => entry.status === "pending" && (!entry.due_date || String(entry.due_date) <= today));
  const pendingQueue = state.reviewQueue.filter((entry) => entry.status === "pending");
  const latestSessions = latestSessionByLesson();
  const weakestLessons = Object.values(latestSessions)
    .sort((a, b) => Number(a.accuracy || 0) - Number(b.accuracy || 0))
    .slice(0, 5);
  const targetItems = (current?.target_items || [])
    .map((itemId) => state.vocabItems.find((item) => item.item_id === itemId))
    .filter(Boolean)
    .map((item) => `${item.base_word || item.item_id}${item.chinese ? ` (${item.chinese})` : ""}`);

  const nextAction = dueQueue.length
    ? `Run Review Mode for ${dueQueue.length} due item(s) before starting new work.`
    : current
      ? `Start ${current.lesson_id} - ${current.title}.`
      : "No available lesson found.";

  const stageLines = stageProgress.map((stage) => (
    `- ${stage.stage} ${stage.stage_name}: ${exportPercent(stage.stage_progress)} complete, accuracy ${exportPercent(stage.stage_accuracy)}, repeated errors ${stage.stage_repeated_errors}`
  )).join("\n") || "- insufficient data";

  return `# Lesson Recommendations

Generated: ${window.VocabScoring.localIso()}

## Next Action
- ${nextAction}
- Pending review queue: ${pendingQueue.length}
- Current lesson focus: ${targetItems.length ? targetItems.join(", ") : "mixed review or diagnostic lesson"}

## Weakest Recent Lessons
${weakestLessons.length ? weakestLessons.map((session) => `- ${session.lesson_id}: ${exportPercent(session.accuracy)} accuracy, ${exportSeconds(session.avg_response_time_seconds)} average, next action ${session.next_action || "review"}`).join("\n") : "- insufficient data"}

## Stage Snapshot
${stageLines}

## Study Rule
- Clear due review first.
- Retake any lesson below 80% before moving forward.
- Treat V2/V3 mixed review lessons as block checkpoints, not new vocabulary inventory.
`;
}

function buildDiagnosticRecommendationForExport() {
  const v0Attempts = state.attempts.filter((attempt) => attempt.stage === "V0");
  if (!v0Attempts.length) return {
    status: "not_available",
    message: "No V0 diagnostic attempts found."
  };
  const groups = {};
  v0Attempts.forEach((attempt) => {
    const type = attempt.question_type || "unknown";
    if (!groups[type]) groups[type] = [];
    groups[type].push(attempt);
  });
  const rows = Object.entries(groups).map(([type, attempts]) => ({
    question_type: type,
    attempts: attempts.length,
    accuracy: average(attempts.map((attempt) => attempt.is_correct ? 1 : 0)),
    avg_response_time_seconds: average(attempts.map((attempt) => attempt.response_time_seconds))
  })).sort((a, b) => Number(a.accuracy) - Number(b.accuracy));
  const overallAccuracy = average(v0Attempts.map((attempt) => attempt.is_correct ? 1 : 0));
  const weakest = rows[0];
  const recommendedStage = overallAccuracy < 0.6
    ? "V1"
    : ["meaning_choice", "scene_vocabulary"].includes(weakest?.question_type) ? "V2"
    : ["collocation", "part6_context_choice"].includes(weakest?.question_type) ? "V3"
    : ["formal_phrase", "false_friend"].includes(weakest?.question_type) ? "V4"
    : "V1";
  return {
    status: "available",
    overall_accuracy: overallAccuracy,
    recommended_stage: recommendedStage,
    weakest_question_type: weakest?.question_type || "",
    rows
  };
}

// --- New analytics builders ---

function buildErrorSummaryJson() {
  const attempts = state.attempts;
  const wrongAttempts = attempts.filter((attempt) => !attempt.is_correct);

  const errorCodeCounts = {};
  const defaultErrorCodeCounts = {};
  wrongAttempts.forEach((attempt) => {
    if (attempt.error_code) errorCodeCounts[attempt.error_code] = (errorCodeCounts[attempt.error_code] || 0) + 1;
    if (attempt.default_error_code) defaultErrorCodeCounts[attempt.default_error_code] = (defaultErrorCodeCounts[attempt.default_error_code] || 0) + 1;
  });

  const itemWrongCounts = {};
  wrongAttempts.forEach((attempt) => {
    if (attempt.target_item_id) itemWrongCounts[attempt.target_item_id] = (itemWrongCounts[attempt.target_item_id] || 0) + 1;
  });
  const topWeakItems = Object.entries(itemWrongCounts)
    .sort((a, b) => b[1] - a[1]).slice(0, 10)
    .map(([item_id, wrong_count]) => {
      const item = state.vocabItems.find((i) => i.item_id === item_id);
      return { item_id, base_word: item?.base_word || "", wrong_count };
    });

  const lessonWrongCounts = {};
  wrongAttempts.forEach((attempt) => {
    if (attempt.lesson_id) lessonWrongCounts[attempt.lesson_id] = (lessonWrongCounts[attempt.lesson_id] || 0) + 1;
  });
  const topWeakLessons = Object.entries(lessonWrongCounts)
    .sort((a, b) => b[1] - a[1]).slice(0, 10)
    .map(([lesson_id, wrong_count]) => ({ lesson_id, wrong_count }));

  const stageWrongCounts = {};
  wrongAttempts.forEach((attempt) => {
    if (attempt.stage) stageWrongCounts[attempt.stage] = (stageWrongCounts[attempt.stage] || 0) + 1;
  });
  const topWeakStages = Object.entries(stageWrongCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([stage, wrong_count]) => ({ stage, wrong_count }));

  return {
    generated_at: window.VocabScoring.localIso(),
    total_attempts: attempts.length,
    total_incorrect: wrongAttempts.length,
    incorrect_rate: attempts.length ? Number((wrongAttempts.length / attempts.length).toFixed(4)) : 0,
    error_code_counts: errorCodeCounts,
    default_error_code_counts: defaultErrorCodeCounts,
    repeated_error_count: attempts.filter((attempt) => attempt.is_repeated_error).length,
    top_weak_vocab_items: topWeakItems,
    top_weak_lessons: topWeakLessons,
    top_weak_stages: topWeakStages
  };
}

function buildSpeedSummary() {
  const attempts = state.attempts;
  const timed = attempts.filter((attempt) => Number.isFinite(attempt.response_time_seconds));
  const dataAvailable = timed.length > 0;

  let avgTime = null;
  let medianTime = null;
  if (dataAvailable) {
    avgTime = average(timed.map((attempt) => attempt.response_time_seconds));
    const sorted = timed.map((attempt) => attempt.response_time_seconds).sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    medianTime = sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  }

  const speedBuckets = { fast_correct: 0, slow_correct: 0, fast_wrong: 0, slow_wrong: 0 };
  attempts.forEach((attempt) => {
    if (speedBuckets[attempt.speed_bucket] !== undefined) speedBuckets[attempt.speed_bucket] += 1;
  });

  const itemTimes = {};
  timed.forEach((attempt) => {
    if (!attempt.target_item_id) return;
    if (!itemTimes[attempt.target_item_id]) itemTimes[attempt.target_item_id] = [];
    itemTimes[attempt.target_item_id].push(attempt.response_time_seconds);
  });
  const slowestItems = Object.entries(itemTimes)
    .filter(([, times]) => times.length >= 2)
    .map(([item_id, times]) => {
      const item = state.vocabItems.find((i) => i.item_id === item_id);
      return {
        item_id,
        base_word: item?.base_word || "",
        avg_seconds: Number(average(times).toFixed(2)),
        attempt_count: times.length
      };
    })
    .sort((a, b) => b.avg_seconds - a.avg_seconds)
    .slice(0, 10);

  const lessonTimes = {};
  timed.forEach((attempt) => {
    if (!attempt.lesson_id) return;
    if (!lessonTimes[attempt.lesson_id]) lessonTimes[attempt.lesson_id] = [];
    lessonTimes[attempt.lesson_id].push(attempt.response_time_seconds);
  });
  const slowestLessons = Object.entries(lessonTimes)
    .filter(([, times]) => times.length >= 2)
    .map(([lesson_id, times]) => ({
      lesson_id,
      avg_seconds: Number(average(times).toFixed(2)),
      attempt_count: times.length
    }))
    .sort((a, b) => b.avg_seconds - a.avg_seconds)
    .slice(0, 10);

  const overTargetCount = timed.filter((attempt) => {
    const target = window.VocabScoring.targetTime(attempt.question_type);
    return target && attempt.response_time_seconds > target * 2;
  }).length;

  return {
    generated_at: window.VocabScoring.localIso(),
    data_available: dataAvailable,
    total_timed_attempts: timed.length,
    avg_response_time_seconds: avgTime !== null ? Number(avgTime.toFixed(2)) : null,
    median_response_time_seconds: medianTime !== null ? Number(medianTime.toFixed(2)) : null,
    speed_bucket_distribution: speedBuckets,
    over_target_time_count: overTargetCount,
    timeout_count: "not_available",
    slowest_items: slowestItems,
    slowest_lessons: slowestLessons
  };
}

function buildStageSealReadinessExport() {
  return {
    generated_at: window.VocabScoring.localIso(),
    stages: (state.curriculum?.stages || []).map((stage) => buildStageSealReadiness(stage))
  };
}

// --- Core export builder ---

export function buildExportFiles() {
  const date = window.VocabScoring.localDate();

  const attemptsRows = [[
    "attempt_id", "timestamp", "user_id", "course_id", "stage", "lesson_id", "session_id", "step", "question_id", "question_type", "target_item_id", "grammar_link_id", "correct_answer", "user_answer", "is_correct", "response_time_seconds", "speed_bucket", "error_code", "default_error_code", "is_repeated_error", "review_priority", "mode", "review_filter", "review_ids", "lesson_runtime", "timeout"
  ]];
  state.attempts.forEach((attempt) => {
    attemptsRows.push([
      exportValue(attempt.attempt_id),
      exportValue(attempt.timestamp),
      exportValue(attempt.user_id),
      exportValue(attempt.course_id),
      exportValue(attempt.stage),
      exportValue(attempt.lesson_id),
      exportValue(attempt.session_id),
      exportValue(attempt.step),
      exportValue(attempt.question_id),
      exportValue(attempt.question_type),
      exportValue(attempt.target_item_id),
      exportValue(attempt.grammar_link_id),
      exportValue(attempt.correct_answer),
      exportValue(attempt.user_answer),
      exportValue(attempt.is_correct),
      exportValue(attempt.response_time_seconds),
      exportValue(attempt.speed_bucket),
      exportValue(attempt.error_code),
      exportValue(attempt.default_error_code),
      exportValue(attempt.is_repeated_error),
      exportValue(attempt.review_priority),
      exportValue(attempt.mode),
      exportValue(attempt.review_filter),
      (attempt.review_ids || []).join("|"),
      exportValue(attempt.lesson_runtime || "normal"),
      exportValue(attempt.timeout || false)
    ]);
  });

  const sessionsRows = [["session_id", "date", "stage", "lesson_id", "lesson_title", "planned_minutes", "actual_minutes", "total_questions", "correct_questions", "wrong_questions", "accuracy", "avg_response_time_seconds", "top_error_codes", "mastery_status", "next_action", "mode", "review_filter"]];
  state.sessions.forEach((session) => {
    sessionsRows.push([
      session.session_id,
      session.date,
      session.stage,
      session.lesson_id,
      session.lesson_title,
      session.planned_minutes,
      session.actual_minutes,
      session.total_questions,
      session.correct_questions,
      session.wrong_questions,
      session.accuracy,
      session.avg_response_time_seconds,
      (session.top_error_codes || []).join("|"),
      session.mastery_status,
      session.next_action,
      session.mode || "",
      session.review_filter || ""
    ]);
  });

  const masteryRows = [["item_id", "item_type", "base_word", "variants", "first_seen", "last_seen", "seen_count", "correct_count", "wrong_count", "avg_response_time_seconds", "last_error_code", "mastery_score", "mastery_level", "next_review_date"]];
  state.vocabItems.forEach((item) => {
    masteryRows.push([
      item.item_id,
      item.item_type,
      item.base_word,
      (item.variants || []).join("|"),
      item.first_seen || "",
      item.last_seen || "",
      item.seen_count || 0,
      item.correct_count || 0,
      item.wrong_count || 0,
      item.avg_response_time_seconds || 0,
      item.last_error_code || "",
      item.mastery_score || 0,
      item.mastery_level || "blind",
      item.next_review_date || ""
    ]);
  });

  const errorSummaryRows = [["error_code", "count", "repeated_count"]];
  topCounts(state.attempts.filter((attempt) => !attempt.is_correct), "error_code", 99).forEach(([code, count]) => {
    const repeated = state.attempts.filter((attempt) => attempt.error_code === code && attempt.is_repeated_error).length;
    errorSummaryRows.push([code, count, repeated]);
  });

  const reviewEffectiveness = buildReviewEffectiveness(state.attempts);
  const reviewEffectivenessRows = [["group_type", "group_key", "attempts", "correct", "wrong", "fix_rate", "avg_response_time_seconds", "fast_correct", "latest_timestamp"]];
  reviewEffectiveness.rows.forEach((row) => {
    reviewEffectivenessRows.push([
      row.group_type,
      row.group_key,
      row.attempts,
      row.correct,
      row.wrong,
      row.fix_rate,
      row.avg_response_time,
      row.fast_correct,
      row.latest_timestamp
    ]);
  });

  const stageProgress = buildStageProgress();
  const contentQualitySummary = buildContentQualitySummary();
  const diagnosticRecommendation = buildDiagnosticRecommendationForExport();
  const errorSummaryJson = buildErrorSummaryJson();
  const speedSummary = buildSpeedSummary();
  const stageSealReadiness = buildStageSealReadinessExport();

  const rawEvents = [
    ...state.sessions.map((record) => ({ event_type: "session", ...record })),
    ...state.attempts.map((record) => ({ event_type: "attempt", ...record })),
    ...state.errorLogs.map((record) => ({ event_type: "error_log", ...record })),
    ...state.reviewQueue.map((record) => ({ event_type: "review_queue", ...record }))
  ].map((record) => JSON.stringify(record)).join("\n");

  const summaryMd = buildSummaryMarkdown(stageProgress);

  return {
    // --- Summary / Reports ---
    "summary.md": summaryMd,
    "report.md": summaryMd,
    "lesson_recommendations.md": buildLessonRecommendationsMarkdown(stageProgress),
    "diagnostic_recommendation.json": JSON.stringify(diagnosticRecommendation, null, 2),
    "stage_progress.json": JSON.stringify(stageProgress, null, 2),
    "content_quality_summary.json": JSON.stringify(contentQualitySummary, null, 2),

    // --- Data (CSV + JSON) ---
    "attempts.csv": `﻿${window.VocabScoring.toCsv(attemptsRows)}`,
    "attempts.json": JSON.stringify({
      exported_at: window.VocabScoring.localIso(),
      count: state.attempts.length,
      attempts: state.attempts
    }, null, 2),
    "attempts.jsonl": state.attempts.map((attempt) => JSON.stringify(attempt)).join("\n") + "\n",
    "sessions.csv": `﻿${window.VocabScoring.toCsv(sessionsRows)}`,
    "sessions.json": JSON.stringify({
      exported_at: window.VocabScoring.localIso(),
      count: state.sessions.length,
      sessions: state.sessions
    }, null, 2),
    "item_mastery.csv": `﻿${window.VocabScoring.toCsv(masteryRows)}`,
    "mastery.json": JSON.stringify({
      exported_at: window.VocabScoring.localIso(),
      count: state.vocabItems.length,
      items: state.vocabItems
    }, null, 2),
    "review_queue.json": JSON.stringify({
      exported_at: window.VocabScoring.localIso(),
      count: state.reviewQueue.length,
      review_queue: state.reviewQueue
    }, null, 2),
    "error_logs.json": JSON.stringify({
      exported_at: window.VocabScoring.localIso(),
      count: state.errorLogs.length,
      error_logs: state.errorLogs
    }, null, 2),

    // --- Analytics ---
    "error_summary.csv": `﻿${window.VocabScoring.toCsv(errorSummaryRows)}`,
    "error_summary.json": JSON.stringify(errorSummaryJson, null, 2),
    "speed_summary.json": JSON.stringify(speedSummary, null, 2),
    "review_effectiveness.csv": `﻿${window.VocabScoring.toCsv(reviewEffectivenessRows)}`,
    "review_effectiveness.json": JSON.stringify({
      generated_at: window.VocabScoring.localIso(),
      overall: reviewEffectiveness.overall,
      rows: reviewEffectiveness.rows
    }, null, 2),
    "stage_seal_readiness.json": JSON.stringify(stageSealReadiness, null, 2),

    // --- Full Package ---
    "question_bank_snapshot.json": JSON.stringify({
      exported_at: window.VocabScoring.localIso(),
      question_count: state.questions.length,
      questions: state.questions
    }, null, 2),
    "raw_events.jsonl": `${rawEvents}\n`,
    [`toeic_vocab_export_${date}.json`]: JSON.stringify({
      exported_at: window.VocabScoring.localIso(),
      files: {
        report_md: "report.md",
        summary_md: "summary.md",
        sessions_csv: "sessions.csv",
        sessions_json: "sessions.json",
        attempts_csv: "attempts.csv",
        attempts_json: "attempts.json",
        attempts_jsonl: "attempts.jsonl",
        item_mastery_csv: "item_mastery.csv",
        mastery_json: "mastery.json",
        review_queue_json: "review_queue.json",
        error_logs_json: "error_logs.json",
        error_summary_csv: "error_summary.csv",
        error_summary_json: "error_summary.json",
        speed_summary_json: "speed_summary.json",
        review_effectiveness_csv: "review_effectiveness.csv",
        review_effectiveness_json: "review_effectiveness.json",
        stage_seal_readiness_json: "stage_seal_readiness.json",
        content_quality_summary_json: "content_quality_summary.json",
        diagnostic_recommendation_json: "diagnostic_recommendation.json",
        lesson_recommendations_md: "lesson_recommendations.md",
        stage_progress_json: "stage_progress.json",
        question_bank_snapshot_json: "question_bank_snapshot.json",
        raw_events_jsonl: "raw_events.jsonl"
      },
      data: {
        sessions: state.sessions,
        attempts: state.attempts,
        item_mastery: state.vocabItems,
        review_queue: state.reviewQueue,
        errors: state.errorLogs,
        review_effectiveness: reviewEffectiveness,
        content_quality_summary: contentQualitySummary,
        diagnostic_recommendation: diagnosticRecommendation,
        stage_progress: stageProgress,
        error_summary: errorSummaryJson,
        speed_summary: speedSummary,
        stage_seal_readiness: stageSealReadiness
      }
    }, null, 2)
  };
}

export function buildStageProgress() {
  const questionMap = byId(state.questions, "question_id");
  return (state.curriculum?.stages || []).map((stage) => {
    const lessons = state.lessons.filter((lesson) => lesson.stage === stage.stage);
    const attempts = state.attempts.filter((attempt) => attempt.stage === stage.stage);
    const masteredItems = state.vocabItems.filter((item) => item.mastery_level === "mastered").length;
    const unstableItems = state.vocabItems.filter((item) => ["blind", "weak", "unstable"].includes(item.mastery_level)).length;
    const repeatedErrors = attempts.filter((attempt) => attempt.is_repeated_error).length;
    return {
      stage: stage.stage,
      stage_name: stage.stage_name,
      lessons_available: lessons.length,
      lessons_completed: lessons.filter((lesson) => PASS_STATUSES.has(lesson.status)).length,
      stage_progress: lessons.length ? lessons.filter((lesson) => PASS_STATUSES.has(lesson.status)).length / lessons.length : 0,
      stage_accuracy: attempts.length ? average(attempts.map((attempt) => attempt.is_correct ? 1 : 0)) : 0,
      stage_avg_response_time: average(attempts.map((attempt) => attempt.response_time_seconds)),
      stage_mastered_items: masteredItems,
      stage_unstable_items: unstableItems,
      stage_repeated_errors: repeatedErrors,
      stage_seal_status: lessons.length && lessons.every((lesson) => lesson.status === "sealed") ? "sealed" : "open",
      question_types_seen: [...new Set(attempts.map((attempt) => questionMap[attempt.question_id]?.type || attempt.question_type))]
    };
  });
}

export function buildSummaryMarkdown(stageProgress) {
  const appPath = window.location.origin + window.location.pathname.replace(/\/[^/]*$/, "");
  const attempts = state.attempts;
  const sessions = state.sessions;
  const current = currentLesson();
  const lessonMap = byId(state.lessons, "lesson_id");
  const itemMap = byId(state.vocabItems, "item_id");
  const latestSessions = latestSessionByLesson();
  const completedLessons = state.lessons
    .filter((lesson) => PASS_STATUSES.has(lesson.status))
    .sort((a, b) => (a.lesson_number || 0) - (b.lesson_number || 0));
  const wrongAttempts = attempts.filter((attempt) => !attempt.is_correct);
  const repeatedAttempts = attempts.filter((attempt) => attempt.is_repeated_error);
  const overallAccuracy = attempts.length ? average(attempts.map((attempt) => attempt.is_correct ? 1 : 0)) : null;
  const overallAvgTime = attempts.length ? average(attempts.map((attempt) => attempt.response_time_seconds)) : null;
  const speedBuckets = {
    fast_correct: 0,
    slow_correct: 0,
    fast_wrong: 0,
    slow_wrong: 0
  };

  attempts.forEach((attempt) => {
    const bucket = attempt.speed_bucket;
    if (speedBuckets[bucket] !== undefined) speedBuckets[bucket] += 1;
  });

  const questionTypeRows = buildQuestionTypeStats(attempts);
  const targetItemRows = buildTargetItemStats(attempts);
  const reviewEffectiveness = buildReviewEffectiveness(attempts);
  const errorRows = topCounts(wrongAttempts.filter((attempt) => attempt.error_code), "error_code", 5)
    .map(([code, count]) => ({
      error_code: code,
      count,
      percentage: wrongAttempts.length ? count / wrongAttempts.length : null,
      repeated_count: wrongAttempts.filter((attempt) => attempt.error_code === code && attempt.is_repeated_error).length
    }));
  const weakestLessons = Object.values(latestSessions)
    .map((session) => ({
      lesson_id: session.lesson_id,
      title: session.lesson_title || lessonMap[session.lesson_id]?.title || "",
      accuracy: session.accuracy,
      avg_response_time_seconds: session.avg_response_time_seconds,
      mastery_status: session.mastery_status || "",
      next_action: session.next_action || ""
    }))
    .sort((a, b) => (Number(a.accuracy) - Number(b.accuracy)) || (Number(b.avg_response_time_seconds) - Number(a.avg_response_time_seconds)))
    .slice(0, 10);
  const repeatedTargetItemRows = targetItemRows
    .map((row) => ({
      target_item_id: row.target_item_id,
      base_word: itemMap[row.target_item_id]?.base_word || "",
      repeated_count: repeatedAttempts.filter((attempt) => attempt.target_item_id === row.target_item_id).length,
      last_error_code: row.last_error_code
    }))
    .filter((row) => row.repeated_count > 0)
    .sort((a, b) => b.repeated_count - a.repeated_count)
    .slice(0, 5);
  const completedLessonTable = completedLessons.length
    ? exportMarkdownTable(
      ["lesson_id", "title", "accuracy", "avg_response_time", "mastery_status", "next_action"],
      completedLessons.map((lesson) => {
        const session = latestSessions[lesson.lesson_id];
        return [
          lesson.lesson_id,
          lesson.title || "",
          session ? exportPercent(session.accuracy) : "insufficient data",
          session ? exportSeconds(session.avg_response_time_seconds) : "insufficient data",
          session?.mastery_status || "insufficient data",
          session?.next_action || "insufficient data"
        ];
      })
    )
    : "No completed lessons yet.";
  const weakestLessonTable = exportMarkdownTable(
    ["lesson_id", "title", "accuracy", "avg_response_time", "mastery_status", "next_action"],
    weakestLessons.map((lesson) => [
      lesson.lesson_id,
      lesson.title,
      exportPercent(lesson.accuracy),
      exportSeconds(lesson.avg_response_time_seconds),
      lesson.mastery_status || "",
      lesson.next_action || ""
    ])
  );
  const weakestQuestionTypeTable = exportMarkdownTable(
    ["question_type", "attempts", "accuracy", "avg_response_time", "wrong_count"],
    questionTypeRows.map((row) => [
      row.question_type,
      row.attempts,
      exportPercent(row.accuracy),
      exportSeconds(row.avg_response_time),
      row.wrong
    ])
  );
  const weakestTargetItemTable = exportMarkdownTable(
    ["target_item_id", "attempts", "wrong_count", "accuracy", "avg_response_time", "last_error_code"],
    targetItemRows.slice(0, 10).map((row) => [
      row.target_item_id,
      row.attempts,
      row.wrong_count,
      exportPercent(row.accuracy),
      exportSeconds(row.avg_response_time),
      row.last_error_code || ""
    ])
  );
  const topErrorCodeTable = exportMarkdownTable(
    ["error_code", "count", "percentage", "repeated_count"],
    errorRows.map((row) => [
      row.error_code,
      row.count,
      exportPercent(row.percentage),
      row.repeated_count
    ])
  );
  const repeatedTargetItemTable = exportMarkdownTable(
    ["target_item_id", "base_word", "repeated_count", "last_error_code"],
    repeatedTargetItemRows.map((row) => [
      row.target_item_id,
      row.base_word,
      row.repeated_count,
      row.last_error_code || ""
    ])
  );
  const reviewItemTable = exportMarkdownTable(
    ["target_item_id", "review_attempts", "fix_rate", "avg_response_time", "wrong_count", "fast_correct"],
    reviewEffectiveness.itemRows.slice(0, 10).map((row) => [
      row.group_key,
      row.attempts,
      exportPercent(row.fix_rate),
      exportSeconds(row.avg_response_time),
      row.wrong,
      row.fast_correct
    ])
  );
  const reviewErrorTable = exportMarkdownTable(
    ["error_code", "review_attempts", "fix_rate", "wrong_count"],
    reviewEffectiveness.errorRows.slice(0, 10).map((row) => [
      row.group_key,
      row.attempts,
      exportPercent(row.fix_rate),
      row.wrong
    ])
  );
  const recommendedActions = buildRecommendedActions({
    attempts,
    sessions,
    weakestLessons,
    questionTypeRows,
    targetItemRows,
    pendingQueue: state.reviewQueue.filter((entry) => entry.status === "pending").length,
    repeatedAttempts
  });
  const stageStatusLines = stageProgress.length
    ? stageProgress.map((stage) => `- ${stage.stage} ${stage.stage_name}: ${exportPercent(stage.stage_progress)} complete, accuracy ${exportPercent(stage.stage_accuracy)}, seal status ${stage.stage_seal_status}`).join("\n")
    : "insufficient data";

  return `# TOEIC Vocabulary Tracker Export Summary

## 1. Export Metadata
- export date: ${window.VocabScoring.localDate()}
- app path: ${appPath}
- current stage: ${current?.stage || "insufficient data"}
- current lesson: ${current?.lesson_id || "insufficient data"}
- total lessons: ${state.lessons.length}
- total questions: ${state.questions.length}
- total attempts: ${attempts.length}
- total sessions: ${sessions.length}

## 2. Completed Lessons
${completedLessonTable}

## 3. Weakest Lessons
${weakestLessonTable}

## 4. Weakest Question Types
${weakestQuestionTypeTable}

## 5. Weakest Target Items
${weakestTargetItemTable}

## 6. Top Error Codes
${topErrorCodeTable}

## 7. Speed Analysis
- overall average response time: ${exportSeconds(overallAvgTime)}
- overall accuracy: ${exportPercent(overallAccuracy)}
- fast_correct count: ${speedBuckets.fast_correct}
- slow_correct count: ${speedBuckets.slow_correct}
- fast_wrong count: ${speedBuckets.fast_wrong}
- slow_wrong count: ${speedBuckets.slow_wrong}

## 8. Repeated Error Analysis
- repeated_error count: ${repeatedAttempts.length}
- repeated_error rate: ${attempts.length ? exportPercent(repeatedAttempts.length / attempts.length) : "insufficient data"}
- top repeated target_items:
${repeatedTargetItemTable}

## 9. Review Effectiveness
- review attempts: ${reviewEffectiveness.overall.attempts}
- review fix rate: ${exportPercent(reviewEffectiveness.overall.fix_rate)}
- review average response time: ${exportSeconds(reviewEffectiveness.overall.avg_response_time)}
- review fast_correct count: ${reviewEffectiveness.overall.fast_correct}

### Review Fix Rate by Item
${reviewItemTable}

### Review Fix Rate by Error Code
${reviewErrorTable}

## 10. Recommended Next Actions
${recommendedActions.length ? recommendedActions.map((line) => `- ${line}`).join("\n") : "- insufficient data"}

## Stage Status Snapshot
${stageStatusLines}
`;
}

export async function exportPackage() {
  const date = window.VocabScoring.localDate();
  const folderName = `toeic_vocab_export_${date}`;
  const savedAttempts = state.attempts;
  const allAttempts = await window.VocabDB.getAll("attempts");
  state.attempts = allAttempts.sort((a, b) => String(a.timestamp).localeCompare(String(b.timestamp)));
  let files;
  try {
    files = buildExportFiles();
  } finally {
    state.attempts = savedAttempts;
  }
  await window.VocabDB.put("exports", {
    export_id: `export_${Date.now()}`,
    created_at: window.VocabScoring.localIso(),
    folder_name: folderName,
    file_names: Object.keys(files),
    session_count: state.sessions.length,
    attempt_count: state.attempts.length
  });

  if (window.showDirectoryPicker) {
    try {
      const root = await window.showDirectoryPicker({ mode: "readwrite" });
      const mainDir = await root.getDirectoryHandle(folderName, { create: true });
      const subdirHandles = {};
      for (const [name, content] of Object.entries(files)) {
        const subdir = FILE_SUBDIRS[name] || "";
        let targetDir = mainDir;
        if (subdir) {
          if (!subdirHandles[subdir]) {
            subdirHandles[subdir] = await mainDir.getDirectoryHandle(subdir, { create: true });
          }
          targetDir = subdirHandles[subdir];
        }
        const handle = await targetDir.getFileHandle(name, { create: true });
        const writable = await handle.createWritable();
        await writable.write(content);
        await writable.close();
      }
      setNotice(`匯出封包已儲存到 ${folderName}/，並包含 summary/、data/、analytics/ 子資料夾。`, "ok");
      await loadData();
      callRender();
      return;
    } catch (err) {
      if (err?.name !== "AbortError") throw err;
    }
  }

  Object.entries(files).forEach(([name, content], index) => {
    setTimeout(() => {
      const mime = name.endsWith(".json") ? "application/json;charset=utf-8"
        : name.endsWith(".csv") ? "text/csv;charset=utf-8"
        : name.endsWith(".md") ? "text/markdown;charset=utf-8"
        : "application/x-ndjson;charset=utf-8";
      window.VocabScoring.downloadText(`${folderName}_${name}`, content, mime);
    }, index * 160);
  });
  setNotice(`將逐一下載 ${Object.keys(files).length} 個檔案。目前無法直接存成資料夾，且此靜態版本不支援 zip。`, "warn");
  await loadData();
  callRender();
}

export async function downloadExportFile(name) {
  const savedAttempts = state.attempts;
  const allAttempts = await window.VocabDB.getAll("attempts");
  state.attempts = allAttempts.sort((a, b) => String(a.timestamp).localeCompare(String(b.timestamp)));
  let files;
  try {
    files = buildExportFiles();
  } finally {
    state.attempts = savedAttempts;
  }
  if (!files[name]) return;
  const mime = name.endsWith(".json") ? "application/json;charset=utf-8"
    : name.endsWith(".csv") ? "text/csv;charset=utf-8"
    : name.endsWith(".md") ? "text/markdown;charset=utf-8"
    : "application/x-ndjson;charset=utf-8";
  window.VocabScoring.downloadText(name, files[name], mime);
}
