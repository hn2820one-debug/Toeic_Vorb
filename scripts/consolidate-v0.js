#!/usr/bin/env node
/**
 * Consolidate V0 from 10 lessons into 1 diagnostic lesson.
 * Strategy: pick 1 question per unique question_text stem, preferring
 *   - the earliest lesson (V0-1) for variety of items
 *   - meaning_choice first (simplest format), then scene_vocabulary, then collocation
 *   - maximum coverage of unique target_item_ids
 */
import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const questionsPath = join(root, "data/vocab/questions_v0.json");
const curriculumPath = join(root, "data/vocab/curriculum.json");

const questions = JSON.parse(readFileSync(questionsPath, "utf8"));
const curriculum = JSON.parse(readFileSync(curriculumPath, "utf8"));

// Group by question_text (stem)
const byText = new Map();
for (const q of questions) {
  const key = q.question_text.trim();
  if (!byText.has(key)) byText.set(key, []);
  byText.get(key).push(q);
}

console.log(`Total questions: ${questions.length}`);
console.log(`Unique stems: ${byText.size}`);

// Type preference order for selection
const TYPE_ORDER = ["meaning_choice", "scene_vocabulary", "collocation", "review_question", "toeic_practice"];

// For each stem, pick the best representative
const selected = [];
const seenItems = new Set();

// Sort stems by text so output is deterministic
const sortedStems = [...byText.entries()].sort((a, b) => a[0].localeCompare(b[0]));

for (const [stem, group] of sortedStems) {
  // Sort by type preference, then by lesson_id (prefer V0-1)
  group.sort((a, b) => {
    const ta = TYPE_ORDER.indexOf(a.type) === -1 ? 99 : TYPE_ORDER.indexOf(a.type);
    const tb = TYPE_ORDER.indexOf(b.type) === -1 ? 99 : TYPE_ORDER.indexOf(b.type);
    if (ta !== tb) return ta - tb;
    return a.lesson_id.localeCompare(b.lesson_id);
  });
  selected.push(group[0]);
}

console.log(`\nSelected ${selected.length} unique-stem questions:`);

// Separate new-item questions (meaning_choice) from fill-in questions
const newItems = selected.filter(q => q.type === "meaning_choice");
const fillIn = selected.filter(q => q.type !== "meaning_choice");

console.log(`  meaning_choice: ${newItems.length}`);
console.log(`  fill-in types: ${fillIn.length} (${[...new Set(fillIn.map(q => q.type))].join(", ")})`);
console.log(`  unique target items: ${new Set(selected.map(q => q.target_item_id)).size}`);

// Print selected question IDs
console.log("\nSelected question IDs:");
for (const q of selected) {
  console.log(`  ${q.question_id} [${q.type}] "${q.question_text.slice(0, 60)}..."`);
}

// Update curriculum.json
// 1. Replace V0 stage total_lessons
const v0Stage = curriculum.stages.find(s => s.stage === "V0");
v0Stage.total_lessons = 1;

// 2. Remove all V0 lessons and replace with 1 consolidated lesson
const v0Lessons = curriculum.lessons.filter(l => l.stage === "V0");
console.log(`\nRemoving ${v0Lessons.length} V0 lessons from curriculum`);

const nonV0 = curriculum.lessons.filter(l => l.stage !== "V0");

// Build consolidated lesson
// Put meaning_choice first (new vocab intro), then fill-in questions
const consolidatedQids = [
  ...newItems.map(q => q.question_id),
  ...fillIn.map(q => q.question_id)
];

const consolidatedLesson = {
  lesson_id: "V0-1",
  stage: "V0",
  stage_name: "Diagnosis",
  lesson_number: 1,
  title: "V0 Baseline Vocabulary Diagnostic",
  estimated_minutes: 20,
  lesson_type: "diagnostic",
  target_items: [...new Set(selected.map(q => q.target_item_id.replace("item_", "")))],
  question_ids: consolidatedQids,
  review_question_ids: []
};

curriculum.lessons = [consolidatedLesson, ...nonV0];

// 3. Bump seed version
const newSeedVersion = "toeic_vocab_tracker_v0_consolidated_2026_05_17";
curriculum.seed_version = newSeedVersion;

writeFileSync(curriculumPath, JSON.stringify(curriculum, null, 2));
console.log(`\ncurriculum.json updated:`);
console.log(`  V0 lessons: 10 → 1`);
console.log(`  Consolidated question_ids: ${consolidatedQids.length}`);
console.log(`  seed_version: ${newSeedVersion}`);

// 4. Also remove orphaned questions from questions_v0.json (keep only selected)
const selectedIds = new Set(selected.map(q => q.question_id));
const cleanedQuestions = questions.filter(q => selectedIds.has(q.question_id));
// Update lesson_id to V0-1 for all kept questions
for (const q of cleanedQuestions) {
  q.lesson_id = "V0-1";
}
writeFileSync(questionsPath, JSON.stringify(cleanedQuestions, null, 2));
console.log(`  questions_v0.json: 240 → ${cleanedQuestions.length} questions (all set to lesson_id V0-1)`);

console.log("\nNext: bump seed_version in js/vocab-db.js and tests/helpers/seed-idb.ts");
console.log(`  New version: ${newSeedVersion}`);
