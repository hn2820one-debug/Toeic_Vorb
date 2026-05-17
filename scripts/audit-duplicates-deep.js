#!/usr/bin/env node
/**
 * Deep duplicate analysis: distinguish between
 *   A) Same stem + same correct_answer (true duplicates — must remove)
 *   B) Same stem + different correct_answer (word-family variants — might be intentional)
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
}

function normalize(text) {
  return text.trim().toLowerCase().replace(/\s+/g, " ");
}

const byText = new Map();
for (const q of allQuestions) {
  const key = normalize(q.question_text);
  if (!byText.has(key)) byText.set(key, []);
  byText.get(key).push(q);
}

const duplicateGroups = [...byText.entries()].filter(([, qs]) => qs.length > 1);

// Categorize
let trueDuplicates = 0;   // same text + same answer
let wordFamilyVariants = 0; // same text + different answer (different word form)
let trueDupGroups = [];
let variantGroups = [];

for (const [stem, qs] of duplicateGroups) {
  const answers = new Set(qs.map(q => q.correct_answer));
  const options = new Set(qs.map(q => JSON.stringify(q.options)));

  if (options.size === 1) {
    // Identical options → true duplicate
    trueDuplicates += qs.length - 1;
    trueDupGroups.push([stem, qs]);
  } else if (answers.size === 1 && options.size > 1) {
    // Same answer, different options → still suspicious
    trueDuplicates += qs.length - 1;
    trueDupGroups.push([stem, qs]);
  } else {
    // Different answers → word-family or fill-in variants
    wordFamilyVariants += qs.length - 1;
    variantGroups.push([stem, qs]);
  }
}

console.log("=== SUMMARY ===");
console.log(`Total duplicate groups: ${duplicateGroups.length}`);
console.log(`True duplicates (identical options/answer): ${trueDupGroups.length} groups → ${trueDuplicates} excess questions`);
console.log(`Word-family/fill-in variants (same stem, different answers): ${variantGroups.length} groups → ${wordFamilyVariants} excess questions`);

console.log("\n=== TRUE DUPLICATES (first 20 groups) ===");
for (const [stem, qs] of trueDupGroups.slice(0, 20)) {
  console.log(`\n[×${qs.length}] "${stem.slice(0, 80)}"`);
  for (const q of qs) {
    console.log(`  ${q.question_id} [${q.stage}/${q.lesson_id}/${q.type}] ans:${q.correct_answer} target:${q.target_item_id}`);
  }
}

if (variantGroups.length > 0) {
  console.log("\n=== FILL-IN VARIANTS (same stem, different answer — first 10) ===");
  for (const [stem, qs] of variantGroups.slice(0, 10)) {
    console.log(`\n[×${qs.length}] "${stem.slice(0, 80)}"`);
    for (const q of qs) {
      console.log(`  ${q.question_id} [${q.lesson_id}/${q.type}] ans:${q.correct_answer} opt_C:"${q.options?.C}" target:${q.target_item_id}`);
    }
  }
}

// How many lessons are affected?
const affectedLessons = new Set();
for (const [, qs] of trueDupGroups) {
  for (const q of qs) affectedLessons.add(q.lesson_id);
}
console.log(`\nTrue duplicate questions span ${affectedLessons.size} lessons`);

// Which V1 files have the most true duplicates?
const fileCount = {};
for (const [, qs] of trueDupGroups) {
  for (const q of qs) {
    fileCount[q._file] = (fileCount[q._file] || 0) + 1;
  }
}
console.log("\nPer-file true duplicate counts:");
for (const [f, n] of Object.entries(fileCount).sort((a,b) => b[1]-a[1])) {
  console.log(`  ${f}: ${n}`);
}

// Variant analysis: is the same blank fill-in but with different word form?
// Check if word-family variants share the same target_item_id
const variantSameItem = variantGroups.filter(([, qs]) => {
  const items = new Set(qs.map(q => q.target_item_id));
  return items.size === 1;
});
const variantDiffItem = variantGroups.filter(([, qs]) => {
  const items = new Set(qs.map(q => q.target_item_id));
  return items.size > 1;
});
console.log(`\nVariants with same target_item: ${variantSameItem.length} (same word, different answer — TRUE DUPLICATES effectively)`);
console.log(`Variants with different target_item: ${variantDiffItem.length} (different words sharing a stem — debatable)`);
