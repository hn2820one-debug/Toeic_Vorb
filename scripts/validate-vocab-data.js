const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const vocabDir = path.join(root, "data", "vocab");
const curriculumPath = path.join(vocabDir, "curriculum.json");

const REQUIRED_QUESTION_FIELDS = [
  "question_id",
  "lesson_id",
  "stage",
  "type",
  "question_text",
  "correct_answer",
  "explanation_zh",
  "target_item_id",
  "default_error_code",
  "difficulty"
];

const OPTION_LETTERS = ["A", "B", "C", "D"];
const VALID_ANSWERS = new Set(OPTION_LETTERS);

const errors = [];
const warnings = [];
const summary = {
  totalVocabLessons: 0,
  totalVocabQuestions: 0,
  totalV1Lessons: 0,
  totalV1Questions: 0,
  stageLessonCounts: {},
  stageQuestionCounts: {},
  missingFieldCount: 0,
  duplicateCount: 0,
  nearDuplicateQuestionTextCount: 0,
  warningCount: 0,
  answerDistributionByFile: {}
};

function readJSON(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function addMissing(label, field) {
  summary.missingFieldCount += 1;
  errors.push(`${label}: missing ${field}`);
}

function normalizeText(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/_{2,}/g, "____")
    .replace(/[^a-z0-9_ ]+/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function validateQuestion(question, fileName, seenIds, seenText) {
  const label = `${fileName}/${question.question_id || "(missing question_id)"}`;

  REQUIRED_QUESTION_FIELDS.forEach((field) => {
    if (question[field] === undefined || question[field] === null || question[field] === "") {
      addMissing(label, field);
    }
  });

  if (!question.options || typeof question.options !== "object" || Array.isArray(question.options)) {
    errors.push(`${label}: options must be an object with A/B/C/D`);
  } else {
    OPTION_LETTERS.forEach((letter) => {
      if (question.options[letter] === undefined || question.options[letter] === null || question.options[letter] === "") {
        addMissing(label, `options.${letter}`);
      }
    });
  }

  if (question.correct_answer && !VALID_ANSWERS.has(question.correct_answer)) {
    errors.push(`${label}: correct_answer must be A/B/C/D`);
  }

  if (question.question_id) {
    if (seenIds.has(question.question_id)) {
      summary.duplicateCount += 1;
      errors.push(`${label}: duplicate question_id`);
    }
    seenIds.add(question.question_id);
  }

  const textKey = `${question.lesson_id || fileName}:${normalizeText(question.question_text)}`;
  if (question.stage !== "V0" && textKey) {
    if (seenText.has(textKey)) {
      summary.nearDuplicateQuestionTextCount += 1;
      warnings.push(`${label}: duplicate or near-duplicate question_text with ${seenText.get(textKey)}`);
    } else {
      seenText.set(textKey, label);
    }
  }

  if (question.stage !== "V0" && !question.grammar_link_id) warnings.push(`${label}: no grammar_link_id`);
  if (!Array.isArray(question.tags) || !question.tags.length) warnings.push(`${label}: no tags`);
  if (question.estimated_time_seconds === undefined || question.estimated_time_seconds === null) {
    warnings.push(`${label}: estimated_time_seconds missing`);
  }
}

function validateDistribution(fileName, questions) {
  const counts = { A: 0, B: 0, C: 0, D: 0 };
  questions.forEach((question) => {
    if (counts[question.correct_answer] !== undefined) counts[question.correct_answer] += 1;
  });
  summary.answerDistributionByFile[fileName] = counts;

  const values = Object.values(counts);
  const max = Math.max(...values);
  const min = Math.min(...values);
  if (questions.length >= 20 && max - min > Math.ceil(questions.length * 0.15)) {
    warnings.push(`${fileName}: uneven answer distribution ${JSON.stringify(counts)}`);
  }
}

function main() {
  const curriculum = readJSON(curriculumPath);
  const questionFiles = Array.isArray(curriculum.question_files) && curriculum.question_files.length
    ? curriculum.question_files
    : fs.readdirSync(vocabDir).filter((fileName) => /^questions_.*\.json$/.test(fileName)).sort();
  const lessonIds = new Set((curriculum.lessons || []).map((lesson) => lesson.lesson_id));
  const seenIds = new Set();
  const seenText = new Map();

  summary.totalVocabLessons = (curriculum.lessons || []).length;
  summary.totalV1Lessons = (curriculum.lessons || []).filter((lesson) => lesson.stage === "V1").length;
  (curriculum.lessons || []).forEach((lesson) => {
    const stage = lesson.stage || "UNKNOWN";
    summary.stageLessonCounts[stage] = (summary.stageLessonCounts[stage] || 0) + 1;
  });

  questionFiles.forEach((fileName) => {
    const filePath = path.join(vocabDir, fileName);
    if (!fs.existsSync(filePath)) {
      errors.push(`missing question file ${fileName}`);
      return;
    }

    const questions = readJSON(filePath);
    if (!Array.isArray(questions)) {
      errors.push(`${fileName}: expected array`);
      return;
    }

    questions.forEach((question) => {
      validateQuestion(question, fileName, seenIds, seenText);
      if (question.lesson_id && !lessonIds.has(question.lesson_id)) {
        errors.push(`${fileName}/${question.question_id}: lesson_id ${question.lesson_id} not found in curriculum`);
      }
    });

    validateDistribution(fileName, questions);
    summary.totalVocabQuestions += questions.length;
    summary.totalV1Questions += questions.filter((question) => question.stage === "V1").length;
    questions.forEach((question) => {
      const stage = question.stage || "UNKNOWN";
      summary.stageQuestionCounts[stage] = (summary.stageQuestionCounts[stage] || 0) + 1;
    });
  });

  const referencedQuestionIds = new Set();
  (curriculum.lessons || []).forEach((lesson) => {
    [...(lesson.question_ids || []), ...(lesson.review_question_ids || [])].forEach((id) => referencedQuestionIds.add(id));
  });
  referencedQuestionIds.forEach((id) => {
    if (!seenIds.has(id)) errors.push(`curriculum references missing question_id ${id}`);
  });

  console.log("Vocabulary validation summary:");
  console.log(`- total vocab lessons: ${summary.totalVocabLessons}`);
  console.log(`- total vocab questions: ${summary.totalVocabQuestions}`);
  console.log(`- total V1 lessons: ${summary.totalV1Lessons}`);
  console.log(`- total V1 questions: ${summary.totalV1Questions}`);
  console.log("- lessons by stage:");
  Object.keys(summary.stageLessonCounts).sort().forEach((stage) => {
    console.log(`  ${stage}: ${summary.stageLessonCounts[stage]}`);
  });
  console.log("- questions by stage:");
  Object.keys(summary.stageQuestionCounts).sort().forEach((stage) => {
    console.log(`  ${stage}: ${summary.stageQuestionCounts[stage]}`);
  });
  console.log(`- missing field count: ${summary.missingFieldCount}`);
  console.log(`- duplicate question_id count: ${summary.duplicateCount}`);
  console.log(`- duplicate / near-duplicate question_text warnings: ${summary.nearDuplicateQuestionTextCount}`);
  summary.warningCount = warnings.length;
  console.log(`- warning count: ${summary.warningCount}`);
  console.log("- answer distribution per file:");
  Object.entries(summary.answerDistributionByFile).forEach(([fileName, counts]) => {
    console.log(`  ${fileName}: A=${counts.A} B=${counts.B} C=${counts.C} D=${counts.D}`);
  });

  if (warnings.length) {
    console.warn("\nWarnings:");
    warnings.slice(0, 40).forEach((warning) => console.warn(`- ${warning}`));
    if (warnings.length > 40) console.warn(`- ... ${warnings.length - 40} more warnings`);
  }

  if (errors.length) {
    console.error("\nErrors:");
    errors.forEach((error) => console.error(`- ${error}`));
    process.exit(1);
  }

  console.log("\nVocab data validation passed.");
}

main();
