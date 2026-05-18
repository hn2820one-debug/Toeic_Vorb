#!/usr/bin/env node
/**
 * Full production question-bank quality audit against docs/question-creation-spec.md.
 *
 * Default mode is production-only:
 * - Loads question files from data/vocab/curriculum.json -> question_files.
 * - Does not load drafts/v4.
 * - Fails if V4 question files leak into data/vocab or the production manifest.
 */
import { existsSync, readFileSync, readdirSync } from "fs";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, "..");
const root = process.env.VOCAB_AUDIT_ROOT ? resolve(process.env.VOCAB_AUDIT_ROOT) : repoRoot;
const dataDir = join(root, "data/vocab");
const draftV4Dir = join(root, "drafts/v4");

// ── Load data ─────────────────────────────────────────────────────────────────

function readJSON(filePath) {
  return JSON.parse(readFileSync(filePath, "utf8"));
}

const curriculum = readJSON(join(dataDir, "curriculum.json"));
const lessons = curriculum.lessons || [];
const lessonById = new Map(lessons.map((lesson) => [lesson.lesson_id, lesson]));
const coreLessons = lessons.filter((lesson) => lesson.lesson_type !== "mixed_review");
const mixedReviewLessons = lessons.filter((lesson) => lesson.lesson_type === "mixed_review");

const manifestFiles = Array.isArray(curriculum.question_files) ? [...curriculum.question_files] : [];
const questionFiles = manifestFiles.length
  ? manifestFiles
  : readdirSync(dataDir).filter((file) => /^questions_.*\.json$/i.test(file)).sort();

const dataQuestionFiles = existsSync(dataDir)
  ? readdirSync(dataDir).filter((file) => /^questions_.*\.json$/i.test(file)).sort()
  : [];
const draftV4Files = existsSync(draftV4Dir)
  ? readdirSync(draftV4Dir).filter((file) => /^questions_.*\.json$/i.test(file)).sort()
  : [];

const allQ = [];
const loadIssues = [];
const manifestSeen = new Set();
for (const file of questionFiles) {
  if (manifestSeen.has(file)) {
    loadIssues.push({ id: file, file: "curriculum.json", msg: `Duplicate question_files manifest entry: ${file}` });
    continue;
  }
  manifestSeen.add(file);

  const filePath = join(dataDir, file);
  if (!existsSync(filePath)) {
    loadIssues.push({ id: file, file: "curriculum.json", msg: `Manifest question file not found: ${file}` });
    continue;
  }
  const qs = readJSON(filePath);
  if (!Array.isArray(qs)) {
    loadIssues.push({ id: file, file, msg: `Manifest question file must contain an array: ${file}` });
    continue;
  }
  for (const q of qs) allQ.push({ ...q, _file: file });
}

let vocabItems = [];
const vocabItemsPath = join(dataDir, "vocab_items.json");
if (existsSync(vocabItemsPath)) {
  vocabItems = readJSON(vocabItemsPath);
}
const itemById = new Map(vocabItems.map((item) => [item.item_id, item]));
const questionById = new Map(allQ.map((q) => [q.question_id, q]));

function normalize(text) {
  return String(text || "").trim().toLowerCase().replace(/\s+/g, " ");
}

function itemLessonIds(item) {
  if (!item) return [];
  if (Array.isArray(item.lesson_ids)) return item.lesson_ids;
  return [item.lesson_id].filter(Boolean);
}

function lessonQuestions(lesson, fields = ["question_ids", "review_question_ids"]) {
  return fields
    .flatMap((field) => lesson[field] || [])
    .map((id) => questionById.get(id))
    .filter(Boolean);
}

function questionBelongsToLessonItem(question, lesson) {
  const item = itemById.get(question.target_item_id);
  return itemLessonIds(item).includes(lesson.lesson_id);
}

function countBy(rows, keyFn) {
  return rows.reduce((acc, row) => {
    const key = keyFn(row) || "(empty)";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
}

function addIssue(bucket, metric, rule, id, file, msg) {
  bucket.push({ metric, rule, id, file, msg });
}

function addWarning(bucket, metric, rule, id, file, msg) {
  bucket.push({ metric, rule, id, file, msg });
}

function questionTags(question) {
  return Array.isArray(question?.tags) ? question.tags.map((tag) => String(tag)) : [];
}

function taggedValue(question, prefix) {
  const lowerPrefix = `${String(prefix).toLowerCase()}:`;
  const tag = questionTags(question).find((entry) => entry.toLowerCase().startsWith(lowerPrefix));
  if (!tag) return "";
  return tag.slice(tag.indexOf(":") + 1).trim();
}

function semanticSense(question) {
  return taggedValue(question, "semantic_sense");
}

function isDirectDefinitionQuestion(question) {
  return Boolean(
    question && (
      (question.type === "meaning_choice" && ["V0", "V2", "V3"].includes(question.stage))
      || (question.type === "review_question" && ["V0", "V2", "V3"].includes(question.stage))
    )
  );
}

function itemSurfaceWord(question) {
  const item = itemById.get(question?.target_item_id);
  return normalize(item?.base_word || item?.word || item?.term || item?.lemma || question?.target_item_id || "");
}

function definitionMeaningKey(question) {
  return `${question?.target_item_id || "(missing_target_item_id)"}::${semanticSense(question) || "__default__"}`;
}

function escapeRegex(text) {
  return String(text).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function contextSkeleton(question) {
  let text = normalize(question?.question_text || "");
  text = text.replace(/^[a-z][a-z &/]+:\s+/i, "");
  text = text.replace(/"[^"]+"/g, '"__quoted__"');
  text = text.replace(/\b\d+\b/g, "__num__");
  text = text.replace(/______/g, "__blank__");

  const item = itemById.get(question?.target_item_id);
  const variants = [
    item?.base_word,
    item?.word,
    item?.term,
    item?.lemma,
    ...(Array.isArray(item?.variants) ? item.variants : [])
  ]
    .filter(Boolean)
    .map((entry) => normalize(entry))
    .filter((entry) => /^[a-z][a-z -]*$/.test(entry) && entry.length >= 3);

  for (const token of new Set(variants)) {
    text = text.replace(new RegExp(`\\b${escapeRegex(token)}\\b`, "gi"), "__target__");
  }

  return text;
}

function lessonQuestionSequence(lesson) {
  return [
    ...(lesson.question_ids || []).map((id) => questionById.get(id)).filter(Boolean),
    ...(lesson.review_question_ids || []).map((id) => questionById.get(id)).filter(Boolean)
  ];
}

function questionDemandRank(question) {
  if (!question) return 0;
  if (isDirectDefinitionQuestion(question)) return 1;

  switch (question.type) {
    case "scene_vocabulary":
    case "false_friend":
      return 2;
    case "collocation":
    case "formal_phrase":
      return 3;
    case "part5_sentence_completion":
    case "speed_drill":
    case "word_family":
      return 4;
    case "part6_context_choice":
      return 5;
    case "review_question":
      return 6;
    default:
      return 2;
  }
}

const coreIssues = [];
const mixedReviewIssues = [];
const mixedReviewCoverageWarnings = [];
const qualityWarnings = [];

for (const issue of loadIssues) {
  addIssue(coreIssues, "manifest", "Core Lesson Audit", issue.id, issue.file, issue.msg);
}

// ── Constants from spec ───────────────────────────────────────────────────────

const VALID_TYPES = new Set([
  "meaning_choice", "scene_vocabulary", "collocation", "word_family",
  "part5_sentence_completion", "part6_context_choice", "speed_drill",
  "review_question", "formal_phrase", "false_friend"
]);

const FILL_IN_TYPES = new Set([
  "scene_vocabulary", "collocation", "word_family",
  "part5_sentence_completion", "speed_drill", "formal_phrase", "false_friend"
]);

const REQUIRED = [
  "question_id", "lesson_id", "stage", "type", "skill", "subskill",
  "question_text", "options", "correct_answer", "explanation_zh",
  "target_item_id", "distractor_type", "difficulty", "estimated_time_seconds",
  "default_error_code", "tags"
];

const STAGE_ERROR_CODES = {
  V0: ["VOCAB_UNKNOWN", "SCENE_VOCAB_GAP", "COLLOCATION_GAP", "VOCAB_WEAK_RECALL", "FORMAL_PHRASE", "FALSE_FRIEND", "TIME_PRESSURE"],
  V1: ["WORD_FAMILY_POS", "VOCAB_WEAK_RECALL", "TIME_PRESSURE"],
  V2: ["SCENE_VOCAB_GAP", "VOCAB_UNKNOWN", "VOCAB_WEAK_RECALL"],
  V3: ["COLLOCATION_GAP", "COLLOCATION_PREP", "SCENE_VOCAB_GAP", "VOCAB_WEAK_RECALL"],
};

const ALLOWED_DISTRACTOR_TYPES = {
  V0: ["toeic_realistic", "semantic_confusion"],
  V1: ["same_word_family", "toeic_realistic", "semantic_confusion"],
  V2: ["same_scene_vocabulary", "toeic_realistic"],
  V3: ["wrong_verb_collocation", "toeic_realistic"],
};

const DEFINITION_IN_STEM_PATTERNS = [
  /,\s+the [a-z][^,]{5,50},/i,
  /,\s+which (means?|refers? to)[^,]{3,}/i,
  /,\s+[a-z][^,]{5,40},\s*(V\d|for|in|at|on|by)/i,
  /[\u3400-\u9fff]{2,}/,
];

// ── Production manifest and draft leakage checks ─────────────────────────────

const v4DataFiles = dataQuestionFiles.filter((file) => /^questions_v4/i.test(file));
for (const file of v4DataFiles) {
  addIssue(coreIssues, "draftLeakage", "Draft Audit", file, file, "V4 question file is under data/vocab; keep V4 drafts under drafts/v4 only.");
}
for (const file of questionFiles.filter((file) => /^questions_v4/i.test(file))) {
  addIssue(coreIssues, "draftLeakage", "Draft Audit", file, "curriculum.json", "V4 question file is present in the production question_files manifest.");
}
for (const lesson of lessons.filter((lesson) => lesson.stage === "V4")) {
  addIssue(coreIssues, "draftLeakage", "Draft Audit", lesson.lesson_id, "curriculum.json", "V4 lesson is present in production curriculum lessons.");
}

// ── Core question-bank checks ────────────────────────────────────────────────

const stemMap = new Map();
const questionIdMap = new Map();
for (const q of allQ) {
  const stemKey = normalize(q.question_text);
  if (!stemMap.has(stemKey)) stemMap.set(stemKey, []);
  stemMap.get(stemKey).push(q);

  if (q.question_id) {
    if (!questionIdMap.has(q.question_id)) questionIdMap.set(q.question_id, []);
    questionIdMap.get(q.question_id).push(q);
  }
}

for (const [, qs] of stemMap) {
  if (qs.length <= 1) continue;
  for (const q of qs.slice(1)) {
    addIssue(coreIssues, "duplicateStems", "§1.1", q.question_id, q._file, `Duplicate stem shared with ${qs[0].question_id}`);
  }
}

for (const [questionId, qs] of questionIdMap) {
  if (qs.length <= 1) continue;
  for (const q of qs.slice(1)) {
    addIssue(coreIssues, "requiredFields", "§1.2", q.question_id, q._file, `Duplicate question_id shared with ${qs[0]._file}: ${questionId}`);
  }
}

for (const q of allQ) {
  for (const field of REQUIRED) {
    if (q[field] === undefined || q[field] === null || q[field] === "") {
      addIssue(coreIssues, "requiredFields", "§1.2", q.question_id, q._file, `Missing or empty field: ${field}`);
    }
  }

  const allowedDt = ALLOWED_DISTRACTOR_TYPES[q.stage] || ["toeic_realistic"];
  if (q.distractor_type && !allowedDt.includes(q.distractor_type)) {
    addIssue(coreIssues, "requiredFields", "§1.2", q.question_id, q._file, `distractor_type "${q.distractor_type}" not allowed for stage ${q.stage}`);
  }
  if (![1, 2, 3].includes(q.difficulty)) {
    addIssue(coreIssues, "requiredFields", "§1.2", q.question_id, q._file, `difficulty must be 1/2/3, got ${q.difficulty}`);
  }
  if (!VALID_TYPES.has(q.type)) {
    addIssue(coreIssues, "requiredFields", "§1.2", q.question_id, q._file, `Unknown type: "${q.type}"`);
  }
  if (!Array.isArray(q.tags) || q.tags.length === 0) {
    addIssue(coreIssues, "requiredFields", "§1.2", q.question_id, q._file, "tags must be a non-empty array");
  }
  if (!q.skill) {
    addIssue(coreIssues, "requiredFields", "§1.2", q.question_id, q._file, "Missing skill field");
  }

  const options = q.options || {};
  const optionKeys = Object.keys(options);
  if (optionKeys.length !== 4 || !["A", "B", "C", "D"].every((key) => key in options)) {
    addIssue(coreIssues, "answerValidity", "§1.2", q.question_id, q._file, `options must have exactly A,B,C,D (got: ${optionKeys.join(",")})`);
  }
  if (!["A", "B", "C", "D"].includes(q.correct_answer)) {
    addIssue(coreIssues, "answerValidity", "§1.2", q.question_id, q._file, `correct_answer must be A/B/C/D, got "${q.correct_answer}"`);
  }
  if (q.options && q.correct_answer && !q.options[q.correct_answer]) {
    addIssue(coreIssues, "answerValidity", "§1.2", q.question_id, q._file, `correct_answer "${q.correct_answer}" not found in options`);
  }
  for (const [key, value] of Object.entries(options)) {
    if (!value || String(value).trim() === "") {
      addIssue(coreIssues, "answerValidity", "§1.2", q.question_id, q._file, `Empty option text for option ${key}`);
    }
  }

  const explanation = String(q.explanation_zh || "").trim();
  if (explanation.length < 10) {
    addIssue(coreIssues, "requiredFields", "§1.4", q.question_id, q._file, `explanation_zh too short (${explanation.length} chars)`);
  }
  if (explanation.length > 120) {
    addIssue(coreIssues, "requiredFields", "§1.4", q.question_id, q._file, `explanation_zh too long (${explanation.length} chars)`);
  }
  if (explanation.toLowerCase().startsWith("this sentence") || explanation.toLowerCase().startsWith("the sentence")) {
    addIssue(coreIssues, "requiredFields", "§1.4", q.question_id, q._file, "explanation_zh appears to describe the question rather than explain the answer");
  }

  if (!q.target_item_id) {
    addIssue(coreIssues, "requiredFields", "§1.2", q.question_id, q._file, "Missing target_item_id");
  }

  const lesson = lessonById.get(q.lesson_id);
  if (!lesson) {
    addIssue(coreIssues, "requiredFields", "§1.2", q.question_id, q._file, `lesson_id "${q.lesson_id}" not found in curriculum.json`);
  } else if (lesson.stage !== q.stage) {
    addIssue(coreIssues, "requiredFields", "§1.2", q.question_id, q._file, `stage mismatch: question says "${q.stage}", lesson says "${lesson.stage}"`);
  }

  if (q.stage === "V4") {
    addIssue(coreIssues, "draftLeakage", "Draft Audit", q.question_id, q._file, "V4 question row loaded by production audit.");
  }

  if (FILL_IN_TYPES.has(q.type)) {
    const blanks = (String(q.question_text || "").match(/______/g) || []).length;
    if (blanks === 0) {
      addIssue(coreIssues, "blankChecks", "§1.3", q.question_id, q._file, `Fill-in type "${q.type}" has no blank (______) in question_text`);
    } else if (blanks > 1) {
      addIssue(coreIssues, "blankChecks", "§1.3", q.question_id, q._file, `Fill-in type "${q.type}" has ${blanks} blanks; must have exactly 1`);
    }
  }

  const allowedErrorCodes = STAGE_ERROR_CODES[q.stage];
  if (allowedErrorCodes && !allowedErrorCodes.includes(q.default_error_code)) {
    addIssue(coreIssues, "requiredFields", "§3", q.question_id, q._file, `default_error_code "${q.default_error_code}" not valid for stage ${q.stage}`);
  }
  if (q.type === "scene_vocabulary" && q.stage !== "V0" && !/^[A-Za-z][A-Za-z &/]+:\s/.test(String(q.question_text || ""))) {
    addIssue(coreIssues, "requiredFields", "§3", q.question_id, q._file, `scene_vocabulary question missing scene label prefix: "${String(q.question_text || "").slice(0, 60)}"`);
  }
  if (q.type === "review_question" && q.stage === "V0" && !normalize(q.question_text).startsWith("quick review:")) {
    addIssue(coreIssues, "requiredFields", "§3", q.question_id, q._file, `V0 review_question must start with "Quick review:"`);
  }
  if (q.type === "meaning_choice") {
    const questionText = normalize(q.question_text);
    const validPatterns = [
      "what does", "most nearly mean", "which option best describes",
      "which definition best", "select the best toeic", "in toeic english"
    ];
    if (!validPatterns.some((pattern) => questionText.includes(pattern))) {
      addIssue(coreIssues, "requiredFields", "§3", q.question_id, q._file, `meaning_choice format unexpected: "${String(q.question_text || "").slice(0, 70)}"`);
    }
  }
  if (q.type === "false_friend" && !normalize(q.question_text).includes("usually means")) {
    addIssue(coreIssues, "requiredFields", "§3", q.question_id, q._file, `false_friend format unexpected; should include "usually means"`);
  }
  if (q.type === "speed_drill") {
    const words = String(q.question_text || "").split(/\s+/).filter(Boolean).length;
    if (words > 25) {
      addIssue(coreIssues, "requiredFields", "§3", q.question_id, q._file, `speed_drill sentence too long (${words} words, prefer <=22)`);
    }
  }
  if (q.type === "part6_context_choice") {
    const sentences = String(q.question_text || "").split(/[.!?]+/).filter((part) => part.trim().length > 5);
    if (sentences.length < 2) {
      addIssue(coreIssues, "requiredFields", "§3", q.question_id, q._file, `part6_context_choice should have >=2 sentences (found ${sentences.length})`);
    }
  }
  if (DEFINITION_IN_STEM_PATTERNS.some((pattern) => pattern.test(String(q.question_text || "")))) {
    addIssue(coreIssues, "definitionLeakage", "§1.3", q.question_id, q._file, "Question stem appears to embed a definition or direct clue.");
  }
}

// ── Core lesson structure, references, coverage, and interference ────────────

const lessonQidSets = {};
const lessonRvSets = {};
for (const lesson of lessons) {
  lessonQidSets[lesson.lesson_id] = new Set(lesson.question_ids || []);
  lessonRvSets[lesson.lesson_id] = new Set(lesson.review_question_ids || []);
}

for (const q of allQ) {
  if (q.type !== "review_question") continue;
  const sourceLesson = lessonById.get(q.lesson_id);
  if (!sourceLesson || sourceLesson.lesson_type === "mixed_review") continue;
  const inOwnMain = lessonQidSets[q.lesson_id]?.has(q.question_id);
  const inOwnReview = lessonRvSets[q.lesson_id]?.has(q.question_id);
  if (inOwnMain && !inOwnReview) {
    addIssue(coreIssues, "lessonStructure", "§2", q.question_id, q._file, `review_question is in its own core lesson question_ids but not review_question_ids`);
  }
}

const referencedQuestionIds = new Set();
for (const lesson of lessons) {
  for (const qid of [...(lesson.question_ids || []), ...(lesson.review_question_ids || [])]) {
    referencedQuestionIds.add(qid);
  }
}
const orphans = allQ.filter((q) => !referencedQuestionIds.has(q.question_id));
for (const q of orphans) {
  addIssue(coreIssues, "lessonStructure", "§2", q.question_id, q._file, `Question row is not referenced by any curriculum lesson`);
}

function expectedCountsForCoreLesson(lesson) {
  const num = Number.parseInt(lesson.lesson_number, 10);
  if (lesson.stage === "V1" && lesson.lesson_type === "word_family") {
    return num <= 20 ? { q: [18, 18], rv: [6, 6] } : { q: [20, 20], rv: [4, 4] };
  }
  if (lesson.stage === "V1" && lesson.lesson_type === "speed_drill") return { q: [40, 40], rv: [0, 0] };
  if (lesson.stage === "V2" && lesson.lesson_type === "scene_vocabulary") return { q: [20, 22], rv: [4, 4] };
  if (lesson.stage === "V3" && lesson.lesson_type === "collocation") return { q: [20, 22], rv: [4, 4] };
  if (lesson.stage === "V0") return { q: [1, 50], rv: [0, 20] };
  return null;
}

function inRange(value, [min, max]) {
  return value >= min && value <= max;
}

function isReviewCapacityWarning(lesson, actual, expectedRange) {
  return ["V2", "V3"].includes(lesson.stage)
    && actual > 0
    && actual < expectedRange[0];
}

for (const lesson of coreLessons) {
  const qids = lesson.question_ids || [];
  const rvids = lesson.review_question_ids || [];
  const expected = expectedCountsForCoreLesson(lesson);
  if (expected && !inRange(qids.length, expected.q)) {
    addIssue(coreIssues, "lessonStructure", "§2", lesson.lesson_id, "curriculum.json", `question_ids=${qids.length}, expected ${expected.q[0] === expected.q[1] ? expected.q[0] : expected.q.join("-")}`);
  }
  if (expected && !inRange(rvids.length, expected.rv)) {
    if (isReviewCapacityWarning(lesson, rvids.length, expected.rv)) {
      addWarning(qualityWarnings, "reviewCapacity", "§2", lesson.lesson_id, "curriculum.json", `review_question_ids=${rvids.length}, expected ${expected.rv[0] === expected.rv[1] ? expected.rv[0] : expected.rv.join("-")}; underflow is currently tolerated after strict question pruning`);
    } else {
      addIssue(coreIssues, "lessonStructure", "§2", lesson.lesson_id, "curriculum.json", `review_question_ids=${rvids.length}, expected ${expected.rv[0] === expected.rv[1] ? expected.rv[0] : expected.rv.join("-")}`);
    }
  }
  for (const qid of qids) {
    if (!questionById.has(qid)) {
      addIssue(coreIssues, "lessonStructure", "§2", qid, lesson.lesson_id, `question_id "${qid}" in curriculum.json not found in production question files`);
    }
  }
  for (const qid of rvids) {
    if (!questionById.has(qid)) {
      addIssue(coreIssues, "lessonStructure", "§2", qid, lesson.lesson_id, `review_question_id "${qid}" in curriculum.json not found in production question files`);
    }
  }
}

const AN_WORDS = /^(a|e|i|o|u)/i;
for (const q of allQ) {
  const questionText = String(q.question_text || "");
  if (!/ an? ______/i.test(questionText)) continue;
  const options = Object.values(q.options || {});
  const vowelStarters = options.filter((option) => AN_WORDS.test(String(option).trim()));
  if (/ an ______/i.test(questionText) && vowelStarters.length > 0 && vowelStarters.length < options.length) {
    addIssue(coreIssues, "articleGiveaways", "§1.3", q.question_id, q._file, `Potential article giveaway before blank: "${questionText.slice(0, 80)}"`);
  }
}

for (const lesson of coreLessons) {
  const rows = lessonQuestions(lesson);
  const counts = countBy(rows, (question) => question.correct_answer);
  const total = Object.values(counts).reduce((sum, count) => sum + count, 0);
  const max = Math.max(...Object.values(counts), 0);
  if (total >= 8 && max / total > 0.65) {
    addIssue(coreIssues, "answerDistribution", "§1.3", lesson.lesson_id, "curriculum.json", `Answer distribution ${JSON.stringify(counts)} uses one slot ${Math.round(max / total * 100)}% of the time`);
  }
}

const coreByStage = new Map();
for (const lesson of coreLessons) {
  if (!coreByStage.has(lesson.stage)) coreByStage.set(lesson.stage, []);
  coreByStage.get(lesson.stage).push(lesson);
}
for (const stageLessons of coreByStage.values()) {
  stageLessons.sort((a, b) => Number(a.lesson_number) - Number(b.lesson_number));
}

const oldItemFirstCoreExceptions = [];
for (const lesson of coreLessons.filter((row) => ["V2", "V3"].includes(row.stage))) {
  const expectedItemIds = vocabItems
    .filter((item) => itemLessonIds(item).includes(lesson.lesson_id))
    .map((item) => item.item_id);
  const ownRows = lessonQuestions(lesson).filter((question) => questionBelongsToLessonItem(question, lesson));
  const coverage = countBy(ownRows, (question) => question.target_item_id);
  const counts = expectedItemIds.map((itemId) => coverage[itemId] || 0);
  const min = counts.length ? Math.min(...counts) : 0;
  const max = counts.length ? Math.max(...counts) : 0;
  if (expectedItemIds.length === 0 || min < 2 || max - min > 2) {
    addIssue(coreIssues, "targetCoverage", "Core Lesson Audit", lesson.lesson_id, "curriculum.json", `Target item coverage weak: targets=${expectedItemIds.length}, min=${min}, max=${max}`);
  }

  const priorSameStageCoreLessons = (coreByStage.get(lesson.stage) || [])
    .filter((candidate) => Number(candidate.lesson_number) < Number(lesson.lesson_number));
  const mainRows = (lesson.question_ids || []).map((id) => questionById.get(id)).filter(Boolean);
  const outsideRows = mainRows.filter((question) => !questionBelongsToLessonItem(question, lesson));

  if (priorSameStageCoreLessons.length === 0) {
    oldItemFirstCoreExceptions.push(lesson.lesson_id);
  } else if (outsideRows.length === 0) {
    addIssue(coreIssues, "oldItemPressure", "Core Lesson Audit", lesson.lesson_id, "curriculum.json", "V2/V3 core lesson has no prior same-stage old-item pressure in question_ids");
  }

  for (const question of outsideRows) {
    const sourceLesson = lessonById.get(question.lesson_id);
    if (!sourceLesson) continue;
    const invalidSource = sourceLesson.stage !== lesson.stage
      || sourceLesson.lesson_type === "mixed_review"
      || Number(sourceLesson.lesson_number) >= Number(lesson.lesson_number);
    if (invalidSource) {
      addIssue(coreIssues, "oldItemPressure", "Core Lesson Audit", lesson.lesson_id, "curriculum.json", `Old-item pressure question ${question.question_id} is not from an earlier same-stage core lesson`);
    }
  }
}

// ── Direct-definition blocking checks and non-blocking quality warnings ─────

const directDefinitionRows = allQ.filter(isDirectDefinitionQuestion);

for (const lesson of coreLessons) {
  const groups = new Map();
  for (const question of lessonQuestions(lesson).filter(isDirectDefinitionQuestion)) {
    const key = definitionMeaningKey(question);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(question);
  }

  for (const questions of groups.values()) {
    if (questions.length <= 1) continue;
    const targetItemId = questions[0].target_item_id || "(missing_target_item_id)";
    const sense = semanticSense(questions[0]) || "default";
    const word = itemSurfaceWord(questions[0]) || targetItemId;
    const questionIds = questions.map((question) => question.question_id).join(", ");
    const metric = lesson.stage === "V0" ? "diagnosticDefinitionReuse" : "definitionReuseSameLesson";
    addIssue(
      coreIssues,
      metric,
      "§1.6",
      lesson.lesson_id,
      questions[0]._file,
      `Direct-definition repetition for ${word} (${targetItemId}, sense=${sense}) in lesson ${lesson.lesson_id}: ${questionIds}`
    );
  }
}

const directDefinitionByMeaning = new Map();
for (const question of directDefinitionRows) {
  const key = definitionMeaningKey(question);
  if (!directDefinitionByMeaning.has(key)) directDefinitionByMeaning.set(key, []);
  directDefinitionByMeaning.get(key).push(question);
}

for (const questions of directDefinitionByMeaning.values()) {
  const lessonIds = [...new Set(questions.map((question) => question.lesson_id))];
  if (lessonIds.length <= 1) continue;
  const targetItemId = questions[0].target_item_id || "(missing_target_item_id)";
  const sense = semanticSense(questions[0]) || "default";
  const word = itemSurfaceWord(questions[0]) || targetItemId;
  addIssue(
    coreIssues,
    "definitionReuseCrossLesson",
    "§1.6",
    targetItemId,
    questions[0]._file,
    `Direct-definition meaning reused across lessons for ${word} (${targetItemId}, sense=${sense}): ${lessonIds.join(", ")}`
  );
}

const directDefinitionBySurfaceWord = new Map();
for (const question of directDefinitionRows) {
  const word = itemSurfaceWord(question);
  if (!word) continue;
  if (!directDefinitionBySurfaceWord.has(word)) directDefinitionBySurfaceWord.set(word, []);
  directDefinitionBySurfaceWord.get(word).push(question);
}

for (const [word, questions] of directDefinitionBySurfaceWord.entries()) {
  if (questions.length <= 1) continue;

  const distinctLessons = new Set(questions.map((question) => question.lesson_id));
  const distinctTargets = new Set(questions.map((question) => question.target_item_id));
  if (distinctLessons.size === 1 && distinctTargets.size === 1) continue;

  const missingSenseRows = questions.filter((question) => !semanticSense(question));
  if (missingSenseRows.length === 0) continue;

  addIssue(
    coreIssues,
    "missingSemanticSenseTag",
    "§1.6",
    word,
    missingSenseRows[0]._file,
    `Surface word "${word}" has multiple direct-definition rows but these question_ids are missing semantic_sense tags: ${missingSenseRows.map((question) => question.question_id).join(", ")}`
  );
}

const templateSensitiveRows = allQ.filter((question) => !isDirectDefinitionQuestion(question) && question.stage !== "V1");
const rowsBySkeleton = new Map();
for (const question of templateSensitiveRows) {
  const skeleton = contextSkeleton(question);
  if (skeleton.length < 18) continue;
  if (!rowsBySkeleton.has(skeleton)) rowsBySkeleton.set(skeleton, []);
  rowsBySkeleton.get(skeleton).push(question);
}

for (const questions of rowsBySkeleton.values()) {
  if (questions.length <= 1) continue;
  const distinctTexts = new Set(questions.map((question) => normalize(question.question_text)));
  if (distinctTexts.size <= 1) continue;
  addWarning(
    qualityWarnings,
    "nearTemplateSimilarity",
    "§1.6",
    questions[0].question_id,
    questions[0]._file,
    `Questions share an almost identical context skeleton: ${questions.slice(0, 5).map((question) => question.question_id).join(", ")}`
  );
}

const contextualRowsByItem = new Map();
for (const question of allQ.filter((row) => row.stage !== "V1" && !isDirectDefinitionQuestion(row))) {
  if (!question.target_item_id) continue;
  if (!contextualRowsByItem.has(question.target_item_id)) contextualRowsByItem.set(question.target_item_id, []);
  contextualRowsByItem.get(question.target_item_id).push(question);
}

for (const [targetItemId, questions] of contextualRowsByItem.entries()) {
  const exposureCount = questions.length;
  const requiredSkeletons = exposureCount >= 3 ? 3 : exposureCount >= 2 ? 2 : 0;
  if (!requiredSkeletons) continue;

  const skeletonCount = new Set(questions.map(contextSkeleton)).size;
  if (skeletonCount >= requiredSkeletons) continue;

  const word = itemSurfaceWord(questions[0]) || targetItemId;
  addWarning(
    qualityWarnings,
    "contextDiversity",
    "§1.6",
    targetItemId,
    questions[0]._file,
    `Context diversity below target for ${word} (${targetItemId}): exposures=${exposureCount}, distinct_context_skeletons=${skeletonCount}, target=${requiredSkeletons}`
  );
}

for (const question of allQ) {
  const options = Object.values(question.options || {}).map((value) => normalize(value));
  if (options.length === 4) {
    const lengths = options.map((value) => value.length).filter(Boolean);
    if (lengths.length === 4) {
      const min = Math.min(...lengths);
      const max = Math.max(...lengths);
      const sorted = [...lengths].sort((a, b) => a - b);
      const median = (sorted[1] + sorted[2]) / 2;
      const correctLength = normalize(question.options?.[question.correct_answer] || "").length;
      if ((min > 0 && max / min >= 3 && max - min >= 8) || Math.abs(correctLength - median) >= 10) {
        addWarning(
          qualityWarnings,
          "weakDistractors",
          "§4",
          question.question_id,
          question._file,
          `Distractor length pattern looks weak: lengths=${lengths.join("/")}, correct=${correctLength}`
        );
      }
    }
  }

  const explanation = String(question.explanation_zh || "").trim();
  const hasRuleCue = /(因為|表示|指|後接|搭配|語境|文意|語法|固定|用法)/.test(explanation);
  const hasTrapCue = /(不是|而非|誤|陷阱|不要|別選|混淆|易錯|常見)/.test(explanation);
  if (explanation.length < 20 || !hasRuleCue || !hasTrapCue) {
    addWarning(
      qualityWarnings,
      "explanationHeuristics",
      "§1.4",
      question.question_id,
      question._file,
      `Explanation may be too weak for the current policy: length=${explanation.length}, ruleCue=${hasRuleCue}, trapCue=${hasTrapCue}`
    );
  }
}

for (const lesson of coreLessons.filter((row) => row.stage !== "V1")) {
  const orderedRows = lessonQuestionSequence(lesson);
  const rowsByTarget = new Map();

  for (const question of orderedRows) {
    if (!question?.target_item_id) continue;
    if (!rowsByTarget.has(question.target_item_id)) rowsByTarget.set(question.target_item_id, []);
    rowsByTarget.get(question.target_item_id).push(question);
  }

  for (const [targetItemId, questions] of rowsByTarget.entries()) {
    if (questions.length <= 1) continue;
    let staircaseWeak = false;
    let previousRank = -1;

    for (const question of questions) {
      const currentRank = questionDemandRank(question);
      if (currentRank <= previousRank) {
        staircaseWeak = true;
        break;
      }
      previousRank = currentRank;
    }

    if (!staircaseWeak) continue;

    const word = itemSurfaceWord(questions[0]) || targetItemId;
    addWarning(
      qualityWarnings,
      "staircaseWeakness",
      "§1.6",
      lesson.lesson_id,
      questions[0]._file,
      `Repeated item lacks clear staircase progression for ${word} (${targetItemId}): ${questions.map((question) => `${question.question_id}:${question.type}`).join(", ")}`
    );
  }
}

// ── Mixed review audit ───────────────────────────────────────────────────────

let intentionalMixedReviewRefs = 0;
for (const lesson of mixedReviewLessons) {
  const qids = lesson.question_ids || [];
  const rvids = lesson.review_question_ids || [];
  const seenInLesson = new Set();
  const sourceLessonIds = new Set();
  const targetItemIds = new Set();

  if (rvids.length > 0) {
    addIssue(mixedReviewIssues, "invalidReviewReferences", "Mixed Review Audit", lesson.lesson_id, "curriculum.json", "mixed_review lessons must not define review_question_ids");
  }
  if (qids.length === 0) {
    addIssue(mixedReviewIssues, "invalidReviewReferences", "Mixed Review Audit", lesson.lesson_id, "curriculum.json", "mixed_review lesson has no question_ids");
  }

  for (const qid of qids) {
    if (seenInLesson.has(qid)) {
      addIssue(mixedReviewIssues, "invalidReviewReferences", "Mixed Review Audit", lesson.lesson_id, "curriculum.json", `Duplicate question_id inside mixed_review lesson: ${qid}`);
      continue;
    }
    seenInLesson.add(qid);

    const question = questionById.get(qid);
    if (!question) {
      addIssue(mixedReviewIssues, "invalidReviewReferences", "Mixed Review Audit", lesson.lesson_id, "curriculum.json", `mixed_review references missing question_id: ${qid}`);
      continue;
    }

    const sourceLesson = lessonById.get(question.lesson_id);
    if (!sourceLesson) {
      addIssue(mixedReviewIssues, "invalidReviewReferences", "Mixed Review Audit", lesson.lesson_id, "curriculum.json", `mixed_review question ${qid} has missing source lesson ${question.lesson_id}`);
      continue;
    }
    sourceLessonIds.add(sourceLesson.lesson_id);
    if (question.target_item_id) targetItemIds.add(question.target_item_id);

    if (question.type !== "review_question") {
      addIssue(mixedReviewIssues, "invalidReviewReferences", "Mixed Review Audit", lesson.lesson_id, "curriculum.json", `mixed_review question ${qid} is type ${question.type}, expected review_question`);
    }
    if (sourceLesson.lesson_type === "mixed_review") {
      addIssue(mixedReviewIssues, "invalidReviewReferences", "Mixed Review Audit", lesson.lesson_id, "curriculum.json", `mixed_review question ${qid} points to another mixed_review lesson`);
    }
    if (sourceLesson.stage !== lesson.stage || question.stage !== lesson.stage) {
      addIssue(mixedReviewIssues, "invalidReviewReferences", "Mixed Review Audit", lesson.lesson_id, "curriculum.json", `mixed_review question ${qid} stage mismatch`);
    }
    if (!lessonRvSets[sourceLesson.lesson_id]?.has(qid)) {
      addIssue(mixedReviewIssues, "invalidReviewReferences", "Mixed Review Audit", lesson.lesson_id, "curriculum.json", `mixed_review question ${qid} is not listed in source lesson review_question_ids`);
    }
    if (Number(sourceLesson.lesson_number) >= Number(lesson.lesson_number)) {
      addIssue(mixedReviewIssues, "invalidReviewReferences", "Mixed Review Audit", lesson.lesson_id, "curriculum.json", `mixed_review question ${qid} does not come from an earlier source lesson`);
    }
    intentionalMixedReviewRefs += 1;
  }

  if (qids.length < 12 || sourceLessonIds.size < 3 || targetItemIds.size < 4) {
    mixedReviewCoverageWarnings.push({
      lesson_id: lesson.lesson_id,
      msg: `question_ids=${qids.length}, source_lessons=${sourceLessonIds.size}, target_items=${targetItemIds.size}`
    });
  }
}

// ── Print report ──────────────────────────────────────────────────────────────

function countMetric(issues, metric) {
  return issues.filter((issue) => issue.metric === metric).length;
}

function printIssueDetails(title, issues, max = 15) {
  if (issues.length === 0) return;
  console.log(`\n${title} (${issues.length}):`);
  for (const issue of issues.slice(0, max)) {
    console.log(`   - [${issue.id}] ${issue.msg} (${issue.file})`);
  }
  if (issues.length > max) console.log(`   ... and ${issues.length - max} more`);
}

console.log("╔══════════════════════════════════════════════════════════════════╗");
console.log("║              FULL QUALITY AUDIT REPORT                           ║");
console.log(`║  ${new Date().toISOString().slice(0, 10)}   Questions: ${allQ.length}   Lessons: ${lessons.length}${" ".repeat(16)}║`);
console.log("╚══════════════════════════════════════════════════════════════════╝");

console.log("\nCore Lesson Audit:");
console.log(`- production manifest question files: ${questionFiles.length}`);
console.log(`- loaded production questions: ${allQ.length}`);
console.log(`- duplicate stems: ${countMetric(coreIssues, "duplicateStems")}`);
console.log(`- required field / format issues: ${countMetric(coreIssues, "requiredFields")}`);
console.log(`- answer validity issues: ${countMetric(coreIssues, "answerValidity")}`);
console.log(`- blank check issues: ${countMetric(coreIssues, "blankChecks")}`);
console.log(`- definition leakage issues: ${countMetric(coreIssues, "definitionLeakage")}`);
console.log(`- article giveaways: ${countMetric(coreIssues, "articleGiveaways")}`);
console.log(`- answer distribution issues: ${countMetric(coreIssues, "answerDistribution")}`);
console.log(`- lesson reference/count issues: ${countMetric(coreIssues, "lessonStructure")}`);
console.log(`- target item coverage issues: ${countMetric(coreIssues, "targetCoverage")}`);
console.log(`- old-item pressure issues: ${countMetric(coreIssues, "oldItemPressure")}`);
console.log(`- same-lesson direct-definition issues: ${countMetric(coreIssues, "definitionReuseSameLesson")}`);
console.log(`- cross-lesson direct-definition issues: ${countMetric(coreIssues, "definitionReuseCrossLesson")}`);
console.log(`- V0 diagnostic definition issues: ${countMetric(coreIssues, "diagnosticDefinitionReuse")}`);
console.log(`- missing semantic_sense tag issues: ${countMetric(coreIssues, "missingSemanticSenseTag")}`);
console.log(`- first-core old-item policy exceptions: ${oldItemFirstCoreExceptions.length}${oldItemFirstCoreExceptions.length ? ` (${oldItemFirstCoreExceptions.join(", ")})` : ""}`);
console.log(`- V4 production leakage issues: ${countMetric(coreIssues, "draftLeakage")}`);

console.log("\nMixed Review Audit:");
console.log(`- mixed-review lessons: ${mixedReviewLessons.length}`);
console.log(`- invalid review references: ${countMetric(mixedReviewIssues, "invalidReviewReferences")}`);
console.log(`- intentional reused review questions: ${mixedReviewIssues.length === 0 ? "OK" : "CHECK"} (${intentionalMixedReviewRefs} references)`);
console.log(`- mixed-review coverage warnings: ${mixedReviewCoverageWarnings.length}`);

console.log("\nQuality Warnings:");
console.log(`- near-template similarity warnings: ${countMetric(qualityWarnings, "nearTemplateSimilarity")}`);
console.log(`- context diversity warnings: ${countMetric(qualityWarnings, "contextDiversity")}`);
console.log(`- weak distractor warnings: ${countMetric(qualityWarnings, "weakDistractors")}`);
console.log(`- explanation quality warnings: ${countMetric(qualityWarnings, "explanationHeuristics")}`);
console.log(`- staircase progression warnings: ${countMetric(qualityWarnings, "staircaseWeakness")}`);
console.log(`- review capacity warnings: ${countMetric(qualityWarnings, "reviewCapacity")}`);

console.log("\nDraft Audit:");
console.log("- V4 draft audit: skipped by default");
console.log(`- drafts/v4 question files detected but not loaded: ${draftV4Files.length}`);

printIssueDetails("Core Lesson Audit issues", coreIssues);
printIssueDetails("Mixed Review Audit issues", mixedReviewIssues);
printIssueDetails("Quality warnings", qualityWarnings, 20);
if (mixedReviewCoverageWarnings.length > 0) {
  console.log(`\nMixed Review coverage warnings (${mixedReviewCoverageWarnings.length}):`);
  for (const warning of mixedReviewCoverageWarnings.slice(0, 15)) {
    console.log(`   - [${warning.lesson_id}] ${warning.msg}`);
  }
  if (mixedReviewCoverageWarnings.length > 15) console.log(`   ... and ${mixedReviewCoverageWarnings.length - 15} more`);
}

const totalIssues = coreIssues.length + mixedReviewIssues.length;
console.log(`\n${"─".repeat(68)}`);
if (totalIssues === 0) {
  if (mixedReviewCoverageWarnings.length > 0 || qualityWarnings.length > 0) {
    console.log("✅  PASSED — no blocking issues found. Review non-blocking warnings above.");
  } else {
    console.log("✅  PASSED — no issues found across core, mixed-review, and draft handling checks.");
  }
} else {
  console.log(`❌  TOTAL ISSUES: ${totalIssues}`);
  console.log("    Correct the production seed or audit classification issues above.");
  process.exitCode = 1;
}
