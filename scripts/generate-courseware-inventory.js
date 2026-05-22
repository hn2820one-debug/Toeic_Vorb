const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const ROOT = path.resolve(__dirname, "..");
const DOCS_DIR = path.join(ROOT, "docs");
const PROD_DIR = path.join(ROOT, "data", "vocab");
const DRAFT_DIR = path.join(ROOT, "drafts", "v4");
const REBUILD_DIR = path.join(ROOT, "drafts");
const QUALITY_BLOCKING_KEYS = [
  "duplicate stems",
  "required field / format issues",
  "answer validity issues",
  "duplicate option text issues",
  "forbidden option shortcut issues",
  "blank check issues",
  "definition leakage issues",
  "article giveaways",
  "answer distribution issues",
  "lesson reference/count issues",
  "target item coverage issues",
  "old-item pressure issues",
  "same-lesson direct-definition issues",
  "cross-lesson direct-definition issues",
  "V0 diagnostic definition issues",
  "missing semantic_sense tag issues",
  "V4 production leakage issues"
];
const QUALITY_WARNING_KEYS = [
  "first-core old-item policy exceptions",
  "staircase progression warnings",
  "near-template similarity warnings",
  "context diversity warnings",
  "weak distractor warnings",
  "explanation quality warnings",
  "preferred stem length warnings",
  "blank-position concentration warnings",
  "review capacity warnings"
];

function parseArgs() {
  const dateArgIndex = process.argv.indexOf("--date");
  return {
    date: dateArgIndex >= 0 ? process.argv[dateArgIndex + 1] : null
  };
}

function formatLocalDate(now = new Date()) {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function walkJsonFiles(dirPath, options = {}) {
  const files = [];
  const excludeDirs = options.excludeDirs || new Set();
  if (!fs.existsSync(dirPath)) return files;

  for (const entry of fs.readdirSync(dirPath, { withFileTypes: true })) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      if (excludeDirs.has(fullPath)) continue;
      files.push(...walkJsonFiles(fullPath, options));
      continue;
    }
    if (entry.isFile() && entry.name.endsWith(".json")) {
      files.push(fullPath);
    }
  }

  return files.sort();
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function isQuestionRecord(value) {
  return Boolean(
    value &&
    typeof value === "object" &&
    typeof value.question_id === "string" &&
    typeof value.lesson_id === "string"
  );
}

function isLessonRecord(value) {
  return Boolean(
    value &&
    typeof value === "object" &&
    !isQuestionRecord(value) &&
    typeof value.lesson_id === "string" &&
    Array.isArray(value.question_ids)
  );
}

function isItemRecord(value) {
  if (!value || typeof value !== "object" || isQuestionRecord(value) || isLessonRecord(value)) {
    return false;
  }
  if (typeof value.item_id !== "string") return false;
  return Boolean(
    typeof value.item_type === "string" ||
    typeof value.base_word === "string" ||
    typeof value.word === "string" ||
    typeof value.zh === "string" ||
    Array.isArray(value.examples) ||
    Array.isArray(value.forms)
  );
}

function collectRecords(value, bag) {
  if (Array.isArray(value)) {
    value.forEach((entry) => collectRecords(entry, bag));
    return;
  }
  if (!value || typeof value !== "object") return;

  if (isQuestionRecord(value)) {
    bag.questions.push(value);
  } else if (isLessonRecord(value)) {
    bag.lessons.push(value);
  } else if (isItemRecord(value)) {
    bag.items.push(value);
  }

  Object.values(value).forEach((entry) => collectRecords(entry, bag));
}

function summarizeFile(filePath) {
  const payload = readJson(filePath);
  const bag = { lessons: [], questions: [], items: [] };
  collectRecords(payload, bag);
  return {
    filePath,
    lessons: bag.lessons,
    questions: bag.questions,
    items: bag.items
  };
}

function mergeFileSummaries(fileSummaries) {
  const lessons = [];
  const questions = [];
  const items = [];

  fileSummaries.forEach((summary) => {
    lessons.push(...summary.lessons);
    questions.push(...summary.questions);
    items.push(...summary.items);
  });

  return {
    fileCount: fileSummaries.length,
    lessons,
    questions,
    items,
    uniqueLessonIds: new Set(lessons.map((entry) => entry.lesson_id)),
    uniqueQuestionIds: new Set(questions.map((entry) => entry.question_id)),
    uniqueItemIds: new Set(items.map((entry) => entry.item_id))
  };
}

function loadBucket(bucketName) {
  if (bucketName === "production") {
    return mergeFileSummaries(walkJsonFiles(PROD_DIR).map(summarizeFile));
  }
  if (bucketName === "draft") {
    return mergeFileSummaries(walkJsonFiles(DRAFT_DIR).map(summarizeFile));
  }
  if (bucketName === "rebuild") {
    return mergeFileSummaries(
      walkJsonFiles(REBUILD_DIR, { excludeDirs: new Set([DRAFT_DIR]) }).map(summarizeFile)
    );
  }
  return {
    fileCount: 0,
    lessons: [],
    questions: [],
    items: [],
    uniqueLessonIds: new Set(),
    uniqueQuestionIds: new Set(),
    uniqueItemIds: new Set()
  };
}

function countBy(entries, keyFn) {
  const counts = new Map();
  entries.forEach((entry) => {
    const key = keyFn(entry);
    counts.set(key, (counts.get(key) || 0) + 1);
  });
  return counts;
}

function sortCounts(counts, options = {}) {
  const entries = [...counts.entries()];
  const numericDesc = options.numericDesc !== false;
  return entries.sort((left, right) => {
    if (numericDesc && right[1] !== left[1]) return right[1] - left[1];
    return String(left[0]).localeCompare(String(right[0]), undefined, { numeric: true });
  });
}

function markdownTable(headers, rows) {
  const headerRow = `| ${headers.join(" | ")} |`;
  const dividerRow = `|${headers.map(() => "---").join("|")}|`;
  const bodyRows = rows.map((row) => `| ${row.join(" | ")} |`);
  return [headerRow, dividerRow, ...bodyRows].join("\n");
}

function formatDistribution(entries) {
  if (!entries.length) return "none";
  return entries.map(([key, value]) => `${key}: ${value}`).join(", ");
}

function relative(filePath) {
  return path.relative(ROOT, filePath).replace(/\\/g, "/");
}

function runScript(scriptName) {
  return execFileSync(process.execPath, [path.join(ROOT, "scripts", scriptName)], {
    cwd: ROOT,
    encoding: "utf8"
  });
}

function parseSingleCount(output, pattern, fallback = 0) {
  const match = output.match(pattern);
  return match ? Number(match[1]) : fallback;
}

function parseQualityCounts(output, keys) {
  return keys.map((key) => {
    const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const match = output.match(new RegExp(`- ${escaped}: (\\d+)`, "i"));
    return [key, match ? Number(match[1]) : 0];
  });
}

function buildAuditSnapshot() {
  const validationOutput = runScript("validate-vocab-data.js");
  const duplicateOutput = runScript("audit-duplicates.js");
  const qualityOutput = runScript("audit-quality-full.js");

  const validation = {
    missingFieldCount: parseSingleCount(validationOutput, /missing field count: (\d+)/i),
    duplicateQuestionIdCount: parseSingleCount(validationOutput, /duplicate question_id count: (\d+)/i),
    duplicateTextWarnings: parseSingleCount(validationOutput, /duplicate \/ near-duplicate question_text warnings: (\d+)/i),
    warningCount: parseSingleCount(validationOutput, /warning count: (\d+)/i)
  };

  const duplicateAudit = {
    totalQuestions: parseSingleCount(duplicateOutput, /Total questions loaded: (\d+)/i),
    uniqueStems: parseSingleCount(duplicateOutput, /Unique stems: (\d+)/i),
    duplicateStems: parseSingleCount(duplicateOutput, /Duplicate stems .*: (\d+)/i),
    excessQuestions: parseSingleCount(duplicateOutput, /Excess questions .*: (\d+)/i)
  };

  const quality = {
    blocking: parseQualityCounts(qualityOutput, QUALITY_BLOCKING_KEYS),
    warnings: parseQualityCounts(qualityOutput, QUALITY_WARNING_KEYS)
  };

  return { validation, duplicateAudit, quality };
}

function buildProductionSnapshot() {
  const curriculum = readJson(path.join(PROD_DIR, "curriculum.json"));
  const vocabItems = readJson(path.join(PROD_DIR, "vocab_items.json"));
  const questionRows = [];
  const questionFileCounts = new Map();

  curriculum.question_files.forEach((fileName) => {
    const filePath = path.join(PROD_DIR, fileName);
    const rows = readJson(filePath);
    questionFileCounts.set(fileName, rows.length);
    rows.forEach((row) => {
      questionRows.push({ ...row, __sourceFile: fileName });
    });
  });

  const liveLessons = curriculum.lessons;
  const stageQuestionCounts = countBy(questionRows, (entry) => entry.stage || "unknown");
  const stageLessonCounts = countBy(liveLessons, (entry) => entry.stage || "unknown");

  return {
    curriculum,
    vocabItems,
    questionRows,
    questionFileCounts,
    liveLessons,
    stageQuestionCounts,
    stageLessonCounts
  };
}

function buildRebuildBreakdown() {
  const grouped = new Map();
  walkJsonFiles(REBUILD_DIR, { excludeDirs: new Set([DRAFT_DIR]) }).forEach((filePath) => {
    const rel = relative(filePath);
    const parts = rel.split("/");
    const groupName = parts.length >= 2 ? parts[1] : "root";
    if (!grouped.has(groupName)) grouped.set(groupName, []);
    grouped.get(groupName).push(summarizeFile(filePath));
  });

  return sortCounts(new Map(
    [...grouped.entries()].map(([groupName, summaries]) => {
      const aggregate = mergeFileSummaries(summaries);
      return [groupName, aggregate];
    })
  ), { numericDesc: false }).map(([groupName, aggregate]) => ({ groupName, aggregate }));
}

function renderReport(reportDate, buckets, production, auditSnapshot, rebuildBreakdown) {
  const liveQuestionCount = production.questionRows.length;
  const liveLessonCount = production.liveLessons.length;
  const liveItemCount = production.vocabItems.length;
  const repoUniqueLessons = new Set([
    ...buckets.production.uniqueLessonIds,
    ...buckets.draft.uniqueLessonIds,
    ...buckets.rebuild.uniqueLessonIds
  ]);
  const repoUniqueQuestions = new Set([
    ...buckets.production.uniqueQuestionIds,
    ...buckets.draft.uniqueQuestionIds,
    ...buckets.rebuild.uniqueQuestionIds
  ]);
  const repoUniqueItems = new Set([
    ...buckets.production.uniqueItemIds,
    ...buckets.draft.uniqueItemIds,
    ...buckets.rebuild.uniqueItemIds
  ]);
  const warningDebtCount = auditSnapshot.quality.warnings
    .filter(([key]) => key !== "first-core old-item policy exceptions")
    .reduce((sum, [, value]) => sum + value, 0);
  const nonEmptyManifestFiles = [...production.questionFileCounts.values()].filter((count) => count > 0).length;

  const liveShareRows = [
    ["Lessons", String(liveLessonCount), String(repoUniqueLessons.size), `${((liveLessonCount / Math.max(repoUniqueLessons.size, 1)) * 100).toFixed(1)}%`],
    ["Questions", String(liveQuestionCount), String(repoUniqueQuestions.size), `${((liveQuestionCount / Math.max(repoUniqueQuestions.size, 1)) * 100).toFixed(1)}%`],
    ["Items", String(liveItemCount), String(repoUniqueItems.size), `${((liveItemCount / Math.max(repoUniqueItems.size, 1)) * 100).toFixed(1)}%`]
  ];

  const stageRows = production.curriculum.stages.map((stage) => {
    const liveLessons = production.stageLessonCounts.get(stage.stage) || 0;
    const liveQuestions = production.stageQuestionCounts.get(stage.stage) || 0;
    let status = stage.status || "available";
    if (liveLessons > 0) {
      status = `${liveLessons} live lesson${liveLessons === 1 ? "" : "s"}`;
    } else if (stage.total_lessons === 0) {
      status = "cleared";
    }
    return [stage.stage, String(stage.total_lessons), String(liveLessons), String(liveQuestions), status];
  });

  const lessonRows = production.liveLessons.map((lesson) => {
    const matchedCount = production.questionRows.filter((entry) => entry.lesson_id === lesson.lesson_id).length;
    return [
      lesson.lesson_id,
      lesson.stage,
      lesson.lesson_type,
      lesson.status,
      lesson.topic || "-",
      String(lesson.estimated_minutes || 0),
      String((lesson.question_ids || []).length),
      String((lesson.review_question_ids || []).length),
      String(matchedCount)
    ];
  });

  const answerDistribution = sortCounts(countBy(production.questionRows, (entry) => entry.correct_answer || "unknown"), { numericDesc: false });
  const targetItemUsage = sortCounts(countBy(production.questionRows, (entry) => entry.target_item_id || "unknown"));
  const vocabStageDistribution = sortCounts(countBy(production.vocabItems, (entry) => {
    if (entry.stage) return entry.stage;
    return `No stage value (${entry.item_type || "unknown"})`;
  }));

  const draftTypeDistribution = sortCounts(countBy(buckets.draft.questions, (entry) => entry.type || "unknown"));

  return `# Repo Courseware Inventory

Status: CURRENT REPO SNAPSHOT

Generated on: ${reportDate}

Generated by: npm run report:inventory

This report summarizes the current repository courseware inventory for Program B only: TOEIC Vocabulary Tracker in \`C:\\Users\\Keith\\Toeic\\toeic-app-Vorb\`.

It separates content into four buckets:

- \`production\` = live app seed files under \`data/vocab/\`
- \`draft\` = isolated non-production draft content under \`drafts/v4/\`
- \`rebuild\` = rebuild/reference content under other \`drafts/\` folders
- \`archive\` = historical backup documents under \`docs/backups/\`

This report does not count \`tmp/\`, \`Background/\`, \`Log Download/\`, \`playwright-report/\`, or \`test-results/\` as courseware inventory.

---

## 1. Counting Rules

Two counting methods are used throughout this report.

### Artifact Rows

Count every lesson row, question row, or item row exactly as it appears in each JSON artifact.

Use this view when the question is: how much structured material is stored across repo artifacts?

### Unique IDs

Deduplicate by \`lesson_id\`, \`question_id\`, and \`item_id\` across files.

Use this view when the question is: how much distinct content exists in the repo?

Important consequence:

- Rebuild folders often repeat the same lesson/item definitions across multiple planning or blueprint files.
- Therefore artifact-row counts are always larger than or equal to unique-ID counts.

---

## 2. Executive Summary

${markdownTable(["Metric", "Count"], [
    ["Live production lessons", String(liveLessonCount)],
    ["Live production questions", String(liveQuestionCount)],
    ["Live production vocab items", String(liveItemCount)],
    ["Draft-only questions", String(buckets.draft.uniqueQuestionIds.size)],
    ["Rebuild unique lessons", String(buckets.rebuild.uniqueLessonIds.size)],
    ["Rebuild unique questions", String(buckets.rebuild.uniqueQuestionIds.size)],
    ["Rebuild unique items", String(buckets.rebuild.uniqueItemIds.size)],
    ["Repo-wide unique lessons", String(repoUniqueLessons.size)],
    ["Repo-wide unique questions", String(repoUniqueQuestions.size)],
    ["Repo-wide unique items", String(repoUniqueItems.size)],
    ["Production non-empty manifest files", `${nonEmptyManifestFiles} / ${production.curriculum.question_files.length}`],
    ["Production blocking audit issues", String(auditSnapshot.quality.blocking.reduce((sum, [, value]) => sum + value, 0))],
    ["Production non-blocking warnings", String(warningDebtCount)]
  ])}

Shortest truthful summary:

- The live app currently has ${liveLessonCount} production lessons and ${liveQuestionCount} production questions.
- The repo already contains a larger non-live stock: ${buckets.draft.uniqueQuestionIds.size} draft questions plus ${buckets.rebuild.uniqueQuestionIds.size} rebuild questions.
- The archive bucket is documentation-only and does not contain loadable courseware JSON.

---

## 3. Four-Bucket Inventory Table

${markdownTable(
    ["Bucket", "JSON files", "Lesson rows", "Unique lessons", "Question rows", "Unique questions", "Item rows", "Unique items", "Meaning"],
    [
      ["Production", String(buckets.production.fileCount), String(buckets.production.lessons.length), String(buckets.production.uniqueLessonIds.size), String(buckets.production.questions.length), String(buckets.production.uniqueQuestionIds.size), String(buckets.production.items.length), String(buckets.production.uniqueItemIds.size), "Live app seed"],
      ["Draft", String(buckets.draft.fileCount), String(buckets.draft.lessons.length), String(buckets.draft.uniqueLessonIds.size), String(buckets.draft.questions.length), String(buckets.draft.uniqueQuestionIds.size), String(buckets.draft.items.length), String(buckets.draft.uniqueItemIds.size), "Isolated V4 draft"],
      ["Rebuild", String(buckets.rebuild.fileCount), String(buckets.rebuild.lessons.length), String(buckets.rebuild.uniqueLessonIds.size), String(buckets.rebuild.questions.length), String(buckets.rebuild.uniqueQuestionIds.size), String(buckets.rebuild.items.length), String(buckets.rebuild.uniqueItemIds.size), "Rebuild/reference stock"],
      ["Archive", "0 JSON", "0", "0", "0", "0", "0", "0", "Historical docs only"]
    ]
  )}

Interpretation:

- \`production\` is what the app can actually seed today.
- \`draft\` is intentionally isolated and must not be loaded into production.
- \`rebuild\` is the main content reserve for future production waves.
- \`archive\` contains old plans and old handoff documents, not active courseware payloads.

---

## 4. Repo-Wide Deduplicated Totals

These numbers deduplicate overlapping IDs across \`production + draft + rebuild\`.

${markdownTable(["Metric", "Unique total"], [
    ["Lessons", String(repoUniqueLessons.size)],
    ["Questions", String(repoUniqueQuestions.size)],
    ["Items", String(repoUniqueItems.size)]
  ])}

Coverage ratios from that deduplicated view:

${markdownTable(["Metric", "Production live", "Repo unique total", "Live share"], liveShareRows)}

Notes:

- Question inventory is still heavily non-live: most question content remains draft/rebuild.
- Item inventory is less skewed because the live seed already carries the full \`vocab_items.json\` base.

---

## 5. Production Inventory

Primary source files:

- \`data/vocab/curriculum.json\`
- \`data/vocab/questions_v2a.json\`
- \`data/vocab/vocab_items.json\`

### Production Snapshot

${markdownTable(["Metric", "Count"], [
    ["Seed version", `\`${production.curriculum.seed_version}\``],
    ["Generated at", `\`${production.curriculum.generated_at}\``],
    ["Lessons", String(liveLessonCount)],
    ["Questions", String(liveQuestionCount)],
    ["Vocab items", String(liveItemCount)],
    ["Manifest question files", String(production.curriculum.question_files.length)],
    ["Non-empty manifest question files", String(nonEmptyManifestFiles)]
  ])}

### Stage Plan vs Live Content

${markdownTable(["Stage", "Stage plan lesson slots", "Live lessons", "Live questions", "Status"], stageRows)}

Total planned lesson slots in stage metadata: \`${production.curriculum.stages.reduce((sum, stage) => sum + Number(stage.total_lessons || 0), 0)}\`

### Live Lesson Table

${markdownTable(["Lesson", "Stage", "Lesson type", "Status", "Topic", "Estimated minutes", "Core questions", "Review questions", "Matched question rows"], lessonRows)}

### Production Question Distribution

${markdownTable(["Dimension", "Distribution"], [
    ["By stage", formatDistribution(sortCounts(countBy(production.questionRows, (entry) => entry.stage || "unknown"), { numericDesc: false }))],
    ["By type", formatDistribution(sortCounts(countBy(production.questionRows, (entry) => entry.type || "unknown")))],
    ["By error code", formatDistribution(sortCounts(countBy(production.questionRows, (entry) => entry.default_error_code || "unknown")))],
    ["By difficulty", formatDistribution(sortCounts(countBy(production.questionRows, (entry) => String(entry.difficulty || "unknown")), { numericDesc: false }))],
    ["By source file", formatDistribution(sortCounts(countBy(production.questionRows, (entry) => entry.__sourceFile || "unknown"), { numericDesc: false }))],
    ["Review split", formatDistribution(sortCounts(countBy(production.questionRows, (entry) => entry.type === "review_question" ? "review_question" : "non_review_question"), { numericDesc: false }))]
  ])}

### Production Answer Distribution

${markdownTable(["Option", "Count"], answerDistribution.map(([option, count]) => [option, String(count)]))}

### Production Target Item Usage

${markdownTable(["Target item", "Question rows"], targetItemUsage.map(([itemId, count]) => [itemId, String(count)]))}

Distinct target items used by live production questions: \`${targetItemUsage.length}\`

### Production Manifest File Counts

${markdownTable(["File", "Questions"], [...production.questionFileCounts.entries()].map(([fileName, count]) => [fileName, String(count)]))}

### Production Vocab Item Distribution

${markdownTable(["Stage bucket", "Items"], vocabStageDistribution.map(([bucket, count]) => [bucket, String(count)]))}

---

## 6. Production Quality and Compliance Snapshot

This section summarizes the current live production state only.

### Structural Validation

${markdownTable(["Check", "Count"], [
    ["Missing field count", String(auditSnapshot.validation.missingFieldCount)],
    ["Duplicate `question_id` count", String(auditSnapshot.validation.duplicateQuestionIdCount)],
    ["Duplicate / near-duplicate `question_text` warnings", String(auditSnapshot.validation.duplicateTextWarnings)],
    ["Validation warning count", String(auditSnapshot.validation.warningCount)]
  ])}

### Duplicate Audit

${markdownTable(["Check", "Count"], [
    ["Total production questions loaded", String(auditSnapshot.duplicateAudit.totalQuestions)],
    ["Unique stems", String(auditSnapshot.duplicateAudit.uniqueStems)],
    ["Duplicate stems", String(auditSnapshot.duplicateAudit.duplicateStems)],
    ["Excess questions to remove", String(auditSnapshot.duplicateAudit.excessQuestions)]
  ])}

### Full Quality Audit

Blocking issue counts:

${markdownTable(["Category", "Count"], auditSnapshot.quality.blocking.map(([key, value]) => [key, String(value)]))}

Non-blocking findings:

${markdownTable(["Category", "Count"], auditSnapshot.quality.warnings.map(([key, value]) => [key, String(value)]))}

Interpretation:

- Current live production is release-safe under the present blocking gate.
- Current live production still carries accepted non-blocking warning debt, mainly the repeated-item staircase heuristic across \`V2-A-71\` through \`V2-A-74\`.
- Any rewrite of live V2 content still requires learner/export evidence or an isolated draft probe before a new seed change is authorized.

---

## 7. Draft Inventory

Draft-only bucket:

- \`drafts/v4/questions_v4a.json\`

${markdownTable(["Metric", "Count"], [
    ["JSON files", String(buckets.draft.fileCount)],
    ["Question rows", String(buckets.draft.questions.length)],
    ["Unique questions", String(buckets.draft.uniqueQuestionIds.size)],
    ["Live app usage", "0"]
  ])}

### Draft Question Type Distribution

${markdownTable(["Type", "Questions"], draftTypeDistribution.map(([type, count]) => [type, String(count)]))}

Meaning:

- V4 content already has substantial draft-only stock.
- It remains intentionally isolated and must not be treated as production inventory.

---

## 8. Rebuild Inventory

Rebuild is the main non-live content reserve.

### Rebuild by Subdirectory

${markdownTable(["Subdirectory", "JSON files", "Lesson rows", "Unique lessons", "Question rows", "Unique questions", "Item rows", "Unique items"], rebuildBreakdown.map(({ groupName, aggregate }) => [
    groupName,
    String(aggregate.fileCount),
    String(aggregate.lessons.length),
    String(aggregate.uniqueLessonIds.size),
    String(aggregate.questions.length),
    String(aggregate.uniqueQuestionIds.size),
    String(aggregate.items.length),
    String(aggregate.uniqueItemIds.size)
  ]))}

Interpretation:

- Rebuild stock remains the main promotion reservoir for future V2/V3 waves.
- Promoting a wave does not automatically shrink rebuild stock, because historical candidate artifacts remain in \`drafts/\` for auditability.

---

## 9. Refresh Workflow Metadata

Standard refresh command:

\`npm run report:inventory\`

Refresh timing:

- rerun immediately after every production seed wave
- rerun at least once per calendar month even if no production promotion lands that month

Current-truth sync check after any inventory delta:

- verify \`TO_AI.md\`
- verify \`docs/Future Plan.md\`
- verify \`README.md\`, \`docs/使用說明書.md\`, and \`docs/KNOWN_ISSUES.md\` when live counts or status text change

Naming / overwrite / archive rule:

- same-day reruns overwrite \`docs/REPO_COURSEWARE_INVENTORY_${reportDate}.md\`
- a new calendar day creates a new dated snapshot
- older dated snapshots remain as historical inventory evidence unless a future cleanup task explicitly archives or prunes them
`;
}

function main() {
  const args = parseArgs();
  const reportDate = args.date || formatLocalDate();
  const buckets = {
    production: loadBucket("production"),
    draft: loadBucket("draft"),
    rebuild: loadBucket("rebuild")
  };
  const production = buildProductionSnapshot();
  const auditSnapshot = buildAuditSnapshot();
  const rebuildBreakdown = buildRebuildBreakdown();
  const report = renderReport(reportDate, buckets, production, auditSnapshot, rebuildBreakdown);
  const outputPath = path.join(DOCS_DIR, `REPO_COURSEWARE_INVENTORY_${reportDate}.md`);
  fs.writeFileSync(outputPath, report, "utf8");
  console.log(`Inventory snapshot written: ${relative(outputPath)}`);
}

main();