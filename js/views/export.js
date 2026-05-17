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
  const files = buildExportFiles();
  return `
    <section class="tracker-panel">
      <h3>Export Dashboard</h3>
      <div class="tracker-grid export-grid">
        <article class="tracker-stat"><span>Sessions</span><strong>${state.sessions.length}</strong><small>saved</small></article>
        <article class="tracker-stat"><span>Attempts</span><strong>${state.attempts.length}</strong><small>saved</small></article>
        <article class="tracker-stat"><span>Items</span><strong>${state.vocabItems.length}</strong><small>mastery rows</small></article>
        <article class="tracker-stat"><span>Questions</span><strong>${state.questions.length}</strong><small>bank snapshot</small></article>
      </div>
      <div class="tracker-actions">
        <button class="button primary" type="button" onclick="VocabTracker.exportPackage()">Export for ChatGPT Analysis</button>
        ${Object.keys(files).map((name) => `<button class="button secondary" type="button" onclick="VocabTracker.downloadExportFile('${html(name)}')">${html(name)}</button>`).join("")}
      </div>
    </section>
    <section class="tracker-panel">
      <h3>summary.md Preview</h3>
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
      translation_heavy_v2_questions: state.questions.filter((question) => question.stage === "V2" && /[\u3400-\u9fff]/.test(question.question_text || "")).length,
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

export function buildExportFiles() {
  const date = window.VocabScoring.localDate();
  const attemptsRows = [[
    "attempt_id", "timestamp", "user_id", "course_id", "stage", "lesson_id", "session_id", "step", "question_id", "question_type", "target_item_id", "grammar_link_id", "correct_answer", "user_answer", "is_correct", "response_time_seconds", "speed_bucket", "error_code", "default_error_code", "is_repeated_error", "review_priority", "mode", "review_filter", "review_ids"
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
      (attempt.review_ids || []).join("|")
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
  const rawEvents = [
    ...state.sessions.map((record) => ({ event_type: "session", ...record })),
    ...state.attempts.map((record) => ({ event_type: "attempt", ...record })),
    ...state.errorLogs.map((record) => ({ event_type: "error_log", ...record })),
    ...state.reviewQueue.map((record) => ({ event_type: "review_queue", ...record }))
  ].map((record) => JSON.stringify(record)).join("\n");

  return {
    "summary.md": buildSummaryMarkdown(stageProgress),
    "lesson_recommendations.md": buildLessonRecommendationsMarkdown(stageProgress),
    "sessions.csv": `\ufeff${window.VocabScoring.toCsv(sessionsRows)}`,
    "attempts.csv": `\ufeff${window.VocabScoring.toCsv(attemptsRows)}`,
    "item_mastery.csv": `\ufeff${window.VocabScoring.toCsv(masteryRows)}`,
    "error_summary.csv": `\ufeff${window.VocabScoring.toCsv(errorSummaryRows)}`,
    "review_effectiveness.csv": `\ufeff${window.VocabScoring.toCsv(reviewEffectivenessRows)}`,
    "content_quality_summary.json": JSON.stringify(contentQualitySummary, null, 2),
    "stage_progress.json": JSON.stringify(stageProgress, null, 2),
    "question_bank_snapshot.json": JSON.stringify({
      exported_at: window.VocabScoring.localIso(),
      question_count: state.questions.length,
      questions: state.questions
    }, null, 2),
    "raw_events.jsonl": `${rawEvents}\n`,
    [`toeic_vocab_export_${date}.json`]: JSON.stringify({
      exported_at: window.VocabScoring.localIso(),
      files: {
        summary_md: "summary.md",
        sessions_csv: "sessions.csv",
        attempts_csv: "attempts.csv",
        item_mastery_csv: "item_mastery.csv",
        error_summary_csv: "error_summary.csv",
        review_effectiveness_csv: "review_effectiveness.csv",
        content_quality_summary_json: "content_quality_summary.json",
        lesson_recommendations_md: "lesson_recommendations.md",
        stage_progress_json: "stage_progress.json",
        question_bank_snapshot_json: "question_bank_snapshot.json",
        raw_events_jsonl: "raw_events.jsonl"
      },
      data: { sessions: state.sessions, attempts: state.attempts, item_mastery: state.vocabItems, errors: state.errorLogs, review_queue: state.reviewQueue, review_effectiveness: reviewEffectiveness, content_quality_summary: contentQualitySummary, stage_progress: stageProgress }
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
      const dir = await root.getDirectoryHandle(folderName, { create: true });
      for (const [name, content] of Object.entries(files)) {
        const handle = await dir.getFileHandle(name, { create: true });
        const writable = await handle.createWritable();
        await writable.write(content);
        await writable.close();
      }
      setNotice(`Export package saved to ${folderName}.`, "ok");
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
  setNotice("Browser does not expose folder save access here, so files were downloaded individually.", "warn");
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
  window.VocabScoring.downloadText(name, files[name], "text/plain;charset=utf-8");
}
