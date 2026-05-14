const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const vocabDir = path.join(root, "data", "vocab");
const docsDir = path.join(root, "docs");
const reportPath = path.join(docsDir, "V2_V3_QUALITY_AUDIT.md");

const curriculum = readJSON(path.join(vocabDir, "curriculum.json"));
const questionFiles = Array.isArray(curriculum.question_files) && curriculum.question_files.length
  ? curriculum.question_files
  : fs.readdirSync(vocabDir).filter((file) => /^questions_.*\.json$/.test(file)).sort();

const questions = questionFiles.flatMap((fileName) => (
  readJSON(path.join(vocabDir, fileName)).map((question) => ({ ...question, source_file: fileName }))
));
const lessons = curriculum.lessons || [];
const questionById = new Map(questions.map((question) => [question.question_id, question]));
const vocabItems = readJSON(path.join(vocabDir, "vocab_items.json"));
const itemById = new Map(vocabItems.map((item) => [item.item_id, item]));

function readJSON(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
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

function hasCjk(text) {
  return /[\u3400-\u9fff]/.test(String(text || ""));
}

function countBy(rows, keyFn) {
  return rows.reduce((map, row) => {
    const key = keyFn(row) || "(empty)";
    map[key] = (map[key] || 0) + 1;
    return map;
  }, {});
}

function asRows(map) {
  return Object.entries(map).sort((a, b) => b[1] - a[1] || String(a[0]).localeCompare(String(b[0])));
}

function mdTable(headers, rows) {
  const safe = (value) => String(value ?? "").replace(/\|/g, "/").replace(/\n/g, "<br>");
  return [
    `| ${headers.join(" | ")} |`,
    `| ${headers.map(() => "---").join(" | ")} |`,
    ...rows.map((row) => `| ${row.map(safe).join(" | ")} |`)
  ].join("\n");
}

function pct(value) {
  return `${Math.round(value * 1000) / 10}%`;
}

function stageQuestions(stage) {
  return questions.filter((question) => question.stage === stage);
}

function stageLessons(stage) {
  return lessons.filter((lesson) => lesson.stage === stage);
}

function lessonQuestions(lesson) {
  return [...(lesson.question_ids || []), ...(lesson.review_question_ids || [])]
    .map((id) => questionById.get(id))
    .filter(Boolean);
}

function repeatedTemplateWarnings(stages = ["V2", "V3"], threshold = 24) {
  const rows = [];
  stages.forEach((stage) => {
    const grouped = countBy(stageQuestions(stage), (question) => normalizeStem(question.question_text));
    asRows(grouped)
      .filter(([, count]) => count > threshold)
      .forEach(([template, count]) => rows.push({ stage, template, count, severity: count >= 100 ? "High" : "Medium" }));
  });
  return rows;
}

function part6ContextWarnings() {
  return questions
    .filter((question) => question.stage === "V3" && question.type === "part6_context_choice")
    .filter((question) => wordCount(question.question_text) < 24 || sentenceCount(question.question_text) < 2)
    .map((question) => ({
      question_id: question.question_id,
      lesson_id: question.lesson_id,
      stage: question.stage,
      words: wordCount(question.question_text),
      sentences: sentenceCount(question.question_text),
      sample: question.question_text.slice(0, 90)
    }));
}

function translationHeavyV2Warnings() {
  return stageQuestions("V2")
    .filter((question) => hasCjk(question.question_text))
    .map((question) => ({
      question_id: question.question_id,
      lesson_id: question.lesson_id,
      type: question.type,
      sample: question.question_text.slice(0, 90)
    }));
}

function distractorWarnings() {
  const v3 = stageQuestions("V3");
  const distractorWords = {};
  let distractorCount = 0;
  v3.forEach((question) => {
    Object.entries(question.options || {}).forEach(([letter, option]) => {
      if (letter === question.correct_answer) return;
      const firstWord = String(option || "").split(/\s+/)[0].toLowerCase();
      if (!firstWord) return;
      distractorWords[firstWord] = (distractorWords[firstWord] || 0) + 1;
      distractorCount += 1;
    });
  });
  return asRows(distractorWords)
    .filter(([, count]) => distractorCount && count / distractorCount > 0.15)
    .map(([word, count]) => ({ word, count, share: count / distractorCount }));
}

function targetCoverageWarnings() {
  return lessons
    .filter((lesson) => ["V2", "V3"].includes(lesson.stage))
    .map((lesson) => {
      const rows = lessonQuestions(lesson);
      const coverage = countBy(rows, (question) => question.target_item_id);
      const counts = Object.values(coverage);
      const min = Math.min(...counts);
      const max = Math.max(...counts);
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
}

function oldItemInterferenceWarnings() {
  return stageLessons("V2").concat(stageLessons("V3"))
    .map((lesson) => {
      const rows = lessonQuestions(lesson);
      const outside = rows.filter((question) => {
        const item = itemById.get(question.target_item_id);
        if (!item) return false;
        const lessonIds = Array.isArray(item.lesson_ids) ? item.lesson_ids : [item.lesson_id].filter(Boolean);
        return !lessonIds.includes(lesson.lesson_id);
      }).length;
      return { lesson_id: lesson.lesson_id, stage: lesson.stage, outside_items: outside };
    })
    .filter((row) => row.outside_items === 0);
}

function speedErrorCodeWarnings() {
  return questions
    .filter((question) => question.type === "speed_drill" && question.default_error_code !== "TIME_PRESSURE")
    .map((question) => ({
      question_id: question.question_id,
      lesson_id: question.lesson_id,
      stage: question.stage,
      default_error_code: question.default_error_code
    }));
}

function stageTypeSummary() {
  return ["V0", "V1", "V2", "V3"].map((stage) => {
    const rows = stageQuestions(stage);
    return {
      stage,
      questions: rows.length,
      types: asRows(countBy(rows, (question) => question.type)).map(([type, count]) => `${type}:${count}`).join(", ")
    };
  });
}

function buildFindings({ repeatedTemplates, part6Short, translationHeavy, distractors, oldInterference, speedErrorCodes }) {
  const findings = [];
  findings.push(
    translationHeavy.length
      ? "V2 still contains translation/clue-heavy prompts. Rewrite more rows into TOEIC-like notice, email, or dialogue contexts."
      : "V2 scene-vocabulary prompts no longer rely on direct Chinese clue recognition inside question_text."
  );
  findings.push(
    part6Short.length
      ? "V3 still has short Part 6 rows that read like sentence blanks instead of mini-passages."
      : "V3 part6_context_choice rows now satisfy the audit's mini-passage length and sentence-count thresholds."
  );
  findings.push(
    distractors.length
      ? "V3 distractors are still concentrated around a small set of wrong verbs, so collocation patterns remain too visible."
      : "V3 distractor verbs are now distributed below the audit's overuse threshold."
  );
  findings.push(
    repeatedTemplates.length
      ? "Some V2/V3 stem templates are still repeated above the warning threshold and should be diversified further."
      : "No repeated V2/V3 stem template remains above the current warning threshold."
  );
  if (oldInterference.length) {
    findings.push("V2/V3 lessons still lack old-item interference; each lesson mostly drills its own four target items.");
  }
  if (speedErrorCodes.length) {
    findings.push("V1 still has speed drills using non-TIME_PRESSURE error codes; this is separate from the V2/V3 content batch.");
  }
  return findings;
}

function buildRecommendedFixOrder({ repeatedTemplates, part6Short, translationHeavy, distractors, oldInterference, speedErrorCodes }) {
  const nextSteps = [];
  if (part6Short.length) nextSteps.push("Rewrite remaining V3 part6_context_choice rows into real mini-passages.");
  if (translationHeavy.length) nextSteps.push("Rewrite remaining V2 rows so the question_text uses TOEIC-like English context instead of direct clue recognition.");
  if (distractors.length) nextSteps.push("Diversify V3 distractors beyond the remaining overused wrong-verb set.");
  if (repeatedTemplates.length) nextSteps.push("Diversify any V2/V3 templates that still exceed the repeated-stem warning threshold.");
  if (oldInterference.length) nextSteps.push("Add old-item interference questions every lesson or every block.");
  if (speedErrorCodes.length) nextSteps.push("Fix V1 speed drills so they consistently use TIME_PRESSURE.");
  nextSteps.push("Keep structural validation separate from this quality audit.");
  return nextSteps;
}

function main() {
  const repeatedTemplates = repeatedTemplateWarnings();
  const part6Short = part6ContextWarnings();
  const translationHeavy = translationHeavyV2Warnings();
  const distractors = distractorWarnings();
  const targetCoverage = targetCoverageWarnings();
  const oldInterference = oldItemInterferenceWarnings();
  const speedErrorCodes = speedErrorCodeWarnings();
  const findings = buildFindings({ repeatedTemplates, part6Short, translationHeavy, distractors, oldInterference, speedErrorCodes });
  const nextSteps = buildRecommendedFixOrder({ repeatedTemplates, part6Short, translationHeavy, distractors, oldInterference, speedErrorCodes });

  const summary = {
    generated_at: new Date().toISOString(),
    total_lessons: lessons.length,
    total_questions: questions.length,
    warnings: {
      repeated_templates: repeatedTemplates.length,
      short_part6_context_questions: part6Short.length,
      translation_heavy_v2_questions: translationHeavy.length,
      overused_v3_distractor_words: distractors.length,
      target_coverage_issues: targetCoverage.length,
      missing_old_item_interference_lessons: oldInterference.length,
      speed_drill_non_time_pressure: speedErrorCodes.length
    }
  };

  const report = [];
  report.push("# V2/V3 Quality Audit");
  report.push("");
  report.push("Status: GENERATED CONTENT QUALITY REVIEW");
  report.push("");
  report.push(`Generated at: ${summary.generated_at}`);
  report.push("");
  report.push("This report is a learning-quality audit. It does not replace `scripts/validate-vocab-data.js`, which remains the structural pass/fail validator.");
  report.push("");
  report.push("## Summary");
  report.push("");
  report.push(mdTable(["Metric", "Count"], [
    ["Total lessons", summary.total_lessons],
    ["Total questions", summary.total_questions],
    ["Repeated V2/V3 stem templates above threshold", summary.warnings.repeated_templates],
    ["Short Part 6 context questions", summary.warnings.short_part6_context_questions],
    ["Translation-heavy V2 questions", summary.warnings.translation_heavy_v2_questions],
    ["Overused V3 distractor words", summary.warnings.overused_v3_distractor_words],
    ["Target coverage issues", summary.warnings.target_coverage_issues],
    ["Lessons missing old-item interference", summary.warnings.missing_old_item_interference_lessons],
    ["Speed drills not using TIME_PRESSURE", summary.warnings.speed_drill_non_time_pressure]
  ]));
  report.push("");
  report.push("## Question Type Summary");
  report.push("");
  report.push(mdTable(["Stage", "Questions", "Types"], stageTypeSummary().map((row) => [row.stage, row.questions, row.types])));
  report.push("");
  report.push("## High-Signal Findings");
  report.push("");
  findings.forEach((line, index) => report.push(`${index + 1}. ${line}`));
  report.push("");
  report.push("## Repeated Template Hotspots");
  report.push("");
  report.push(repeatedTemplates.length
    ? mdTable(
      ["Stage", "Count", "Severity", "Template"],
      repeatedTemplates.slice(0, 25).map((row) => [row.stage, row.count, row.severity, row.template])
    )
    : "No repeated template hotspot remains above the current threshold.");
  report.push("");
  report.push("## Overused V3 Distractor Words");
  report.push("");
  report.push(distractors.length
    ? mdTable(
      ["Distractor word", "Count", "Share"],
      distractors.map((row) => [row.word, row.count, pct(row.share)])
    )
    : "No overused V3 distractor word exceeds the current threshold.");
  report.push("");
  report.push("## Short Part 6 Context Samples");
  report.push("");
  report.push(part6Short.length
    ? mdTable(
      ["question_id", "lesson_id", "stage", "words", "sentences", "sample"],
      part6Short.slice(0, 20).map((row) => [row.question_id, row.lesson_id, row.stage, row.words, row.sentences, row.sample])
    )
    : "No short Part 6 context question is currently flagged.");
  report.push("");
  report.push("## Translation-Heavy V2 Samples");
  report.push("");
  report.push(translationHeavy.length
    ? mdTable(
      ["question_id", "lesson_id", "type", "sample"],
      translationHeavy.slice(0, 20).map((row) => [row.question_id, row.lesson_id, row.type, row.sample])
    )
    : "No translation-heavy V2 question is currently flagged.");
  report.push("");
  report.push("## Lessons Missing Old-Item Interference");
  report.push("");
  report.push(mdTable(
    ["Stage", "Lesson count", "Sample lessons"],
    ["V2", "V3"].map((stage) => {
      const rows = oldInterference.filter((row) => row.stage === stage);
      return [stage, rows.length, rows.slice(0, 10).map((row) => row.lesson_id).join(", ")];
    })
  ));
  report.push("");
  report.push("## Speed Drill Error-Code Findings");
  report.push("");
  report.push(mdTable(
    ["Count", "Sample"],
    [[speedErrorCodes.length, speedErrorCodes.slice(0, 12).map((row) => `${row.question_id}:${row.default_error_code}`).join(", ")]]
  ));
  report.push("");
  report.push("## Recommended Fix Order");
  report.push("");
  nextSteps.forEach((line, index) => report.push(`${index + 1}. ${line}`));
  report.push("");
  report.push("## Machine Summary");
  report.push("");
  report.push("```json");
  report.push(JSON.stringify(summary, null, 2));
  report.push("```");
  report.push("");

  fs.writeFileSync(reportPath, `${report.join("\n")}\n`, "utf8");

  console.log("Vocab quality audit summary:");
  Object.entries(summary.warnings).forEach(([key, value]) => console.log(`- ${key}: ${value}`));
  console.log(`- report: ${path.relative(root, reportPath)}`);
}

main();
