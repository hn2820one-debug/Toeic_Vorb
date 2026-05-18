#!/usr/bin/env node
import { readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, "..");
const dataDir = join(repoRoot, "data", "vocab");
const dryRun = process.argv.includes("--dry-run");

function readJSON(filePath) {
  return JSON.parse(readFileSync(filePath, "utf8"));
}

function writeJSON(filePath, value) {
  writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

const curriculumPath = join(dataDir, "curriculum.json");
const curriculum = readJSON(curriculumPath);
const questionFiles = Array.isArray(curriculum.question_files) ? curriculum.question_files : [];

const summary = {
  dryRun,
  removed_lessons: Array.isArray(curriculum.lessons) ? curriculum.lessons.length : 0,
  cleared_question_files: questionFiles.length,
  removed_questions: 0
};

for (const file of questionFiles) {
  const filePath = join(dataDir, file);
  const rows = readJSON(filePath);
  summary.removed_questions += Array.isArray(rows) ? rows.length : 0;
  if (!dryRun) writeJSON(filePath, []);
}

if (!dryRun) {
  const nextCurriculum = {
    ...curriculum,
    lessons: [],
    stages: (curriculum.stages || []).map((stage) => (
      ["V0", "V1", "V2", "V3"].includes(stage.stage)
        ? { ...stage, total_lessons: 0 }
        : stage
    ))
  };
  writeJSON(curriculumPath, nextCurriculum);
}

console.log(JSON.stringify(summary, null, 2));