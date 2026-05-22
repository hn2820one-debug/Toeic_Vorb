const fs = require("fs");
const path = require("path");

const repoRoot = rootFromArgs();
const errors = [];

function rootFromArgs() {
  const index = process.argv.indexOf("--root");
  if (index >= 0 && process.argv[index + 1]) {
    return path.resolve(process.argv[index + 1]);
  }
  return path.resolve(__dirname, "..");
}

function filePath(relativePath) {
  return path.join(repoRoot, relativePath);
}

function readText(relativePath) {
  return fs.readFileSync(filePath(relativePath), "utf8");
}

function readJson(relativePath) {
  return JSON.parse(readText(relativePath));
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function extractConst(relativePath, name) {
  const text = readText(relativePath);
  const match = text.match(new RegExp(`const\\s+${escapeRegExp(name)}\\s*=\\s*["']([^"']+)["']`));
  if (!match) {
    errors.push(`${relativePath}: missing const ${name}`);
    return null;
  }
  return match[1];
}

function expectEqual(label, actual, expected) {
  if (actual !== expected) {
    errors.push(`${label}: expected ${expected}, found ${actual}`);
  }
}

function rowPattern(label, value) {
  return new RegExp(`\\|\\s*${escapeRegExp(label)}\\s*\\|\\s*\`?${escapeRegExp(value)}\`?\\s*\\|`);
}

function expectPattern(relativePath, pattern, label) {
  const text = readText(relativePath);
  if (!pattern.test(text)) {
    errors.push(`${relativePath}: expected ${label}`);
  }
}

function loadQuestions(questionFiles) {
  return questionFiles.flatMap((fileName) => {
    const relativePath = path.join("data", "vocab", fileName);
    const questions = readJson(relativePath);
    if (!Array.isArray(questions)) {
      errors.push(`${relativePath}: expected question file to contain an array`);
      return [];
    }
    return questions;
  });
}

function main() {
  const curriculum = readJson(path.join("data", "vocab", "curriculum.json"));
  const questionFiles = Array.isArray(curriculum.question_files) ? curriculum.question_files : [];
  const questions = loadQuestions(questionFiles);
  const vocabItems = readJson(path.join("data", "vocab", "vocab_items.json"));
  if (!Array.isArray(vocabItems)) {
    errors.push("data/vocab/vocab_items.json: expected array");
  }

  const expected = {
    seedVersion: curriculum.seed_version,
    cacheName: extractConst("sw.js", "CACHE_NAME"),
    runnableLessons: String((curriculum.lessons || []).length),
    questionRows: String(questions.length),
    vocabItems: String(Array.isArray(vocabItems) ? vocabItems.length : 0),
    questionFiles: String(questionFiles.length)
  };

  expectEqual("js/vocab-db.js SEED_VERSION", extractConst(path.join("js", "vocab-db.js"), "SEED_VERSION"), expected.seedVersion);
  expectEqual(
    "tests/helpers/seed-idb.ts APP_SEED_VERSION",
    extractConst(path.join("tests", "helpers", "seed-idb.ts"), "APP_SEED_VERSION"),
    expected.seedVersion
  );

  expectPattern("TO_AI.md", rowPattern("Runnable lessons / 可執行課程", expected.runnableLessons), "current runnable lesson count");
  expectPattern("TO_AI.md", rowPattern("Question-bank rows / 題庫題數", expected.questionRows), "current question-bank row count");
  expectPattern("TO_AI.md", rowPattern("Vocab items / 詞彙項目", expected.vocabItems), "current vocab item count");
  expectPattern("TO_AI.md", rowPattern("Question files in manifest / manifest 題檔", expected.questionFiles), "current manifest question-file count");
  expectPattern("TO_AI.md", rowPattern("Seed version / 種子版本", expected.seedVersion), "current seed version");
  expectPattern("TO_AI.md", rowPattern("Service worker cache / SW 快取", expected.cacheName), "current service worker cache name");

  expectPattern("README.md", rowPattern("Runnable lessons", expected.runnableLessons), "current runnable lesson count");
  expectPattern("README.md", rowPattern("Question-bank rows", expected.questionRows), "current question-bank row count");
  expectPattern("README.md", rowPattern("Vocab items", expected.vocabItems), "current vocab item count");
  expectPattern("README.md", rowPattern("Question files in manifest", expected.questionFiles), "current manifest question-file count");
  expectPattern("README.md", rowPattern("Seed version", expected.seedVersion), "current seed version");
  expectPattern("README.md", rowPattern("Service worker cache", expected.cacheName), "current service worker cache name");

  expectPattern("docs/使用說明書.md", rowPattern("可執行正式課程", expected.runnableLessons), "current runnable lesson count");
  expectPattern("docs/使用說明書.md", rowPattern("Question Bank 正式題目", expected.questionRows), "current question-bank row count");
  expectPattern("docs/使用說明書.md", rowPattern("詞彙項目", expected.vocabItems), "current vocab item count");
  expectPattern("docs/使用說明書.md", rowPattern("Manifest 題檔", expected.questionFiles), "current manifest question-file count");
  expectPattern("docs/KNOWN_ISSUES.md", new RegExp(escapeRegExp(expected.cacheName)), "current service worker cache name");

  console.log("Document consistency summary:");
  console.log(`- seed_version: ${expected.seedVersion}`);
  console.log(`- service worker cache: ${expected.cacheName}`);
  console.log(`- runnable lessons: ${expected.runnableLessons}`);
  console.log(`- question-bank rows: ${expected.questionRows}`);
  console.log(`- vocab items: ${expected.vocabItems}`);
  console.log(`- manifest question files: ${expected.questionFiles}`);
  console.log("- checked active docs: TO_AI.md, README.md, docs/使用說明書.md, docs/KNOWN_ISSUES.md");

  if (errors.length) {
    console.error("\nDocument consistency errors:");
    errors.forEach((error) => console.error(`- ${error}`));
    process.exit(1);
  }

  console.log("\nDocument consistency check passed.");
}

main();
