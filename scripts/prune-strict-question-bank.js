#!/usr/bin/env node
import { readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, "..");
const dataDir = join(repoRoot, "data", "vocab");

const dryRun = process.argv.includes("--dry-run");
const curriculumPath = join(dataDir, "curriculum.json");
const vocabItemsPath = join(dataDir, "vocab_items.json");
const stageRank = { V0: 0, V1: 1, V2: 2, V3: 3, V4: 4, V5: 5, V6: 6 };

function readJSON(filePath) {
  return JSON.parse(readFileSync(filePath, "utf8"));
}

function writeJSON(filePath, value) {
  writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function normalize(text) {
  return String(text || "").trim().toLowerCase().replace(/\s+/g, " ");
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

function definitionMeaningKey(question) {
  return `${question?.target_item_id || "(missing_target_item_id)"}::${semanticSense(question) || "__default__"}`;
}

function itemSurfaceWord(question, itemById) {
  const item = itemById.get(question?.target_item_id);
  return normalize(item?.base_word || item?.word || item?.term || item?.lemma || question?.target_item_id || "");
}

function lessonSortNumber(lesson) {
  const value = Number.parseInt(lesson?.lesson_number, 10);
  return Number.isFinite(value) ? value : Number.MAX_SAFE_INTEGER;
}

function buildQuestionOrder(lessons) {
  const order = new Map();
  for (const lesson of lessons) {
    let index = 0;
    for (const questionId of lesson.question_ids || []) {
      order.set(questionId, {
        stage: lesson.stage,
        lessonNumber: lessonSortNumber(lesson),
        lessonId: lesson.lesson_id,
        listRank: 0,
        index: index++
      });
    }
    for (const questionId of lesson.review_question_ids || []) {
      order.set(questionId, {
        stage: lesson.stage,
        lessonNumber: lessonSortNumber(lesson),
        lessonId: lesson.lesson_id,
        listRank: 1,
        index: index++
      });
    }
  }
  return order;
}

function compareQuestions(left, right, questionOrder) {
  const leftOrder = questionOrder.get(left.question_id) || {
    stage: left.stage,
    lessonNumber: Number.MAX_SAFE_INTEGER,
    lessonId: left.lesson_id,
    listRank: 9,
    index: Number.MAX_SAFE_INTEGER
  };
  const rightOrder = questionOrder.get(right.question_id) || {
    stage: right.stage,
    lessonNumber: Number.MAX_SAFE_INTEGER,
    lessonId: right.lesson_id,
    listRank: 9,
    index: Number.MAX_SAFE_INTEGER
  };

  return (stageRank[leftOrder.stage] ?? 99) - (stageRank[rightOrder.stage] ?? 99)
    || leftOrder.lessonNumber - rightOrder.lessonNumber
    || leftOrder.listRank - rightOrder.listRank
    || leftOrder.index - rightOrder.index
    || left.question_id.localeCompare(right.question_id);
}

const curriculum = readJSON(curriculumPath);
const lessons = curriculum.lessons || [];
const lessonById = new Map(lessons.map((lesson) => [lesson.lesson_id, lesson]));
const questionFiles = Array.isArray(curriculum.question_files) ? curriculum.question_files : [];
const vocabItems = readJSON(vocabItemsPath);
const itemById = new Map(vocabItems.map((item) => [item.item_id, item]));
const questionOrder = buildQuestionOrder(lessons);

const questionFileRows = new Map();
const questionById = new Map();
for (const file of questionFiles) {
  const filePath = join(dataDir, file);
  const rows = readJSON(filePath).map((row) => ({ ...row, _file: file }));
  questionFileRows.set(file, rows);
  for (const row of rows) {
    questionById.set(row.question_id, row);
  }
}

function lessonQuestions(lesson) {
  return [...(lesson.question_ids || []), ...(lesson.review_question_ids || [])]
    .map((questionId) => questionById.get(questionId))
    .filter(Boolean);
}

const deleteReasons = new Map();
function markDelete(questionId, reason) {
  if (!deleteReasons.has(questionId)) deleteReasons.set(questionId, new Set());
  deleteReasons.get(questionId).add(reason);
}

for (const lesson of lessons.filter((entry) => entry.lesson_type !== "mixed_review")) {
  const groups = new Map();
  const directRows = lessonQuestions(lesson)
    .filter(isDirectDefinitionQuestion)
    .sort((left, right) => compareQuestions(left, right, questionOrder));

  for (const question of directRows) {
    const key = definitionMeaningKey(question);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(question);
  }

  for (const questions of groups.values()) {
    questions.slice(1).forEach((question) => markDelete(question.question_id, "same-lesson-definition-duplicate"));
  }
}

const remainingAfterLesson = [...questionById.values()]
  .filter(isDirectDefinitionQuestion)
  .filter((question) => !deleteReasons.has(question.question_id));
const crossLessonGroups = new Map();
for (const question of remainingAfterLesson) {
  const key = definitionMeaningKey(question);
  if (!crossLessonGroups.has(key)) crossLessonGroups.set(key, []);
  crossLessonGroups.get(key).push(question);
}
for (const questions of crossLessonGroups.values()) {
  const distinctLessons = new Set(questions.map((question) => question.lesson_id));
  if (distinctLessons.size <= 1) continue;
  questions
    .sort((left, right) => compareQuestions(left, right, questionOrder))
    .slice(1)
    .forEach((question) => markDelete(question.question_id, "cross-lesson-definition-duplicate"));
}

const remainingAfterMeaning = [...questionById.values()]
  .filter(isDirectDefinitionQuestion)
  .filter((question) => !deleteReasons.has(question.question_id));
const surfaceWordGroups = new Map();
for (const question of remainingAfterMeaning) {
  const word = itemSurfaceWord(question, itemById);
  if (!word) continue;
  if (!surfaceWordGroups.has(word)) surfaceWordGroups.set(word, []);
  surfaceWordGroups.get(word).push(question);
}

for (const questions of surfaceWordGroups.values()) {
  if (questions.length <= 1) continue;
  const sorted = [...questions].sort((left, right) => compareQuestions(left, right, questionOrder));
  const tagged = sorted.filter((question) => semanticSense(question));
  const untagged = sorted.filter((question) => !semanticSense(question));
  if (untagged.length === 0) continue;

  if (tagged.length === 0) {
    untagged.slice(1).forEach((question) => markDelete(question.question_id, "surface-word-missing-semantic-sense"));
    continue;
  }

  untagged.forEach((question) => markDelete(question.question_id, "surface-word-missing-semantic-sense"));
}

const deleteIds = new Set(deleteReasons.keys());
const byFile = {};
const byLesson = {};
for (const questionId of deleteIds) {
  const question = questionById.get(questionId);
  if (!question) continue;
  byFile[question._file] = (byFile[question._file] || 0) + 1;
  byLesson[question.lesson_id] = (byLesson[question.lesson_id] || 0) + 1;
}

const summary = {
  dryRun,
  delete_count: deleteIds.size,
  by_file: Object.fromEntries(Object.entries(byFile).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))),
  by_lesson: Object.fromEntries(Object.entries(byLesson).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))),
  samples: [...deleteIds]
    .slice(0, 20)
    .map((questionId) => ({
      question_id: questionId,
      lesson_id: questionById.get(questionId)?.lesson_id,
      type: questionById.get(questionId)?.type,
      target_item_id: questionById.get(questionId)?.target_item_id,
      reasons: [...(deleteReasons.get(questionId) || [])]
    }))
};

if (!dryRun) {
  for (const [file, rows] of questionFileRows.entries()) {
    const nextRows = rows.filter((row) => !deleteIds.has(row.question_id)).map(({ _file, ...row }) => row);
    writeJSON(join(dataDir, file), nextRows);
  }

  const nextCurriculum = {
    ...curriculum,
    lessons: lessons.map((lesson) => ({
      ...lesson,
      question_ids: (lesson.question_ids || []).filter((questionId) => !deleteIds.has(questionId)),
      review_question_ids: (lesson.review_question_ids || []).filter((questionId) => !deleteIds.has(questionId))
    }))
  };
  writeJSON(curriculumPath, nextCurriculum);
}

console.log(JSON.stringify(summary, null, 2));