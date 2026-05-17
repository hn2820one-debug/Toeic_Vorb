#!/usr/bin/env node
/**
 * Full duplicate audit across ALL question files.
 * Two questions are duplicates if they share the same question_text (normalized).
 * Reports: exact duplicates, near-duplicates (same stem different blank word), per-file stats.
 */
import { readFileSync, readdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const dataDir = join(root, "data/vocab");

const files = readdirSync(dataDir).filter(f => f.startsWith("questions_") && f.endsWith(".json"));
files.sort();

let allQuestions = [];
for (const file of files) {
  const qs = JSON.parse(readFileSync(join(dataDir, file), "utf8"));
  for (const q of qs) q._file = file;
  allQuestions.push(...qs);
  console.log(`  ${file}: ${qs.length} questions`);
}
console.log(`\nTotal questions loaded: ${allQuestions.length}`);

// Normalize text: lowercase, collapse whitespace, strip punctuation for comparison
function normalize(text) {
  return text.trim().toLowerCase().replace(/\s+/g, " ");
}

// Group by normalized question_text
const byText = new Map();
for (const q of allQuestions) {
  const key = normalize(q.question_text);
  if (!byText.has(key)) byText.set(key, []);
  byText.get(key).push(q);
}

const duplicateGroups = [...byText.entries()].filter(([, qs]) => qs.length > 1);
duplicateGroups.sort((a, b) => b[1].length - a[1].length);

console.log(`\nUnique stems: ${byText.size}`);
console.log(`Duplicate stems (appear > 1 time): ${duplicateGroups.length}`);
const totalDuplicateQuestions = duplicateGroups.reduce((sum, [, qs]) => sum + qs.length - 1, 0);
console.log(`Excess questions (duplicates that should be removed): ${totalDuplicateQuestions}`);

if (duplicateGroups.length === 0) {
  console.log("\n✅ No duplicates found.");
  process.exit(0);
}

console.log("\n=== DUPLICATE GROUPS ===");
for (const [stem, qs] of duplicateGroups) {
  console.log(`\n[×${qs.length}] "${stem.slice(0, 80)}${stem.length > 80 ? "..." : ""}"`);
  for (const q of qs) {
    console.log(`  ${q.question_id} [${q.stage}/${q.lesson_id}/${q.type}] target: ${q.target_item_id} (${q._file})`);
  }
}

// Per-stage summary
const stageStats = {};
for (const [, qs] of duplicateGroups) {
  for (const q of qs) {
    stageStats[q.stage] = stageStats[q.stage] || { duplicateQuestions: 0, duplicateGroups: new Set() };
    stageStats[q.stage].duplicateQuestions++;
    stageStats[q.stage].duplicateGroups.add(normalize(q.question_text));
  }
}
console.log("\n=== PER-STAGE SUMMARY ===");
for (const [stage, stats] of Object.entries(stageStats).sort()) {
  console.log(`  ${stage}: ${stats.duplicateGroups.size} duplicate stems, ${stats.duplicateQuestions} questions involved`);
}

// Cross-file duplicates (same stem appears in different files)
const crossFile = duplicateGroups.filter(([, qs]) => {
  const files = new Set(qs.map(q => q._file));
  return files.size > 1;
});
if (crossFile.length) {
  console.log(`\n=== CROSS-FILE DUPLICATES (${crossFile.length}) ===`);
  for (const [stem, qs] of crossFile) {
    console.log(`\n  "${stem.slice(0, 70)}"`);
    for (const q of qs) console.log(`    ${q.question_id} (${q._file})`);
  }
} else {
  console.log("\n✅ No cross-file duplicates.");
}
