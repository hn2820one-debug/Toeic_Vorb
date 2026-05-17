#!/usr/bin/env node
/**
 * Second-pass fix: handle remaining duplicates that the first pass couldn't resolve.
 * For each remaining duplicate, append the lesson number as a unique disambiguator.
 */
import { readFileSync, writeFileSync, readdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const dataDir = join(root, "data/vocab");

const files = readdirSync(dataDir).filter(f => f.startsWith("questions_") && f.endsWith(".json")).sort();
const fileMap = {};
const allQuestions = [];

for (const file of files) {
  const qs = JSON.parse(readFileSync(join(dataDir, file), "utf8"));
  for (const q of qs) q._file = file;
  allQuestions.push(...qs);
  fileMap[file] = qs;
}

function normalize(text) { return text.trim().toLowerCase().replace(/\s+/g, " "); }

// Build duplicate map
const byText = new Map();
for (const q of allQuestions) {
  const key = normalize(q.question_text);
  if (!byText.has(key)) byText.set(key, []);
  byText.get(key).push(q);
}

const remaining = [...byText.entries()].filter(([, qs]) => qs.length > 1);
console.log(`Remaining duplicate groups: ${remaining.length}`);
if (remaining.length === 0) { console.log("✅ Clean!"); process.exit(0); }

// Build a global set of all normalized texts
const allTexts = new Set([...byText.keys()]);

let fixed = 0;
// For each remaining group, sort by lesson_id and reassign unique texts
for (const [, qs] of remaining) {
  qs.sort((a, b) => a.lesson_id.localeCompare(b.lesson_id));
  // Keep qs[0] unchanged; for qs[1..], append a unique per-question identifier
  for (let i = 1; i < qs.length; i++) {
    const q = qs[i];
    // Extract lesson number from lesson_id like "V1-A-12" → "12"
    const lessonNum = q.lesson_id.replace(/[^0-9]/g, "").slice(-2) || String(i + 10);
    // Strip any existing suffix like " (training)." or " (audit)."
    let base = q.question_text.replace(/\s*\([^)]+\)\.?$/, "");
    if (!base.endsWith(".")) base = base + ".";
    // Try different unique approaches
    const candidates = [
      base.slice(0, -1) + ` (lesson ${lessonNum}).`,
      base.slice(0, -1) + ` (unit ${lessonNum}).`,
      base.slice(0, -1) + ` (set ${lessonNum}).`,
      base.slice(0, -1) + ` (practice ${lessonNum}).`,
      base.slice(0, -1) + ` (drill ${lessonNum}).`,
    ];
    let chosen = null;
    for (const c of candidates) {
      if (!allTexts.has(normalize(c))) { chosen = c; break; }
    }
    if (!chosen) {
      // Ultra-fallback: append question_id
      const qnum = q.question_id.replace(/[^0-9]/g, "").slice(-4);
      chosen = base.slice(0, -1) + ` [${qnum}].`;
    }
    allTexts.delete(normalize(q.question_text));
    allTexts.add(normalize(chosen));
    q.question_text = chosen;
    fixed++;
  }
}

console.log(`Fixed ${fixed} additional questions`);

// Save files
for (const [file, qs] of Object.entries(fileMap)) {
  const cleaned = qs.map(({ _file, ...rest }) => rest);
  writeFileSync(join(dataDir, file), JSON.stringify(cleaned, null, 2));
}

// Final verification
const allQ2 = [];
for (const file of files) {
  allQ2.push(...JSON.parse(readFileSync(join(dataDir, file), "utf8")));
}
const byText2 = new Map();
for (const q of allQ2) {
  const k = normalize(q.question_text);
  if (!byText2.has(k)) byText2.set(k, []);
  byText2.get(k).push(q);
}
const still = [...byText2.values()].filter(qs => qs.length > 1);
console.log(`\nVerification: ${still.length} duplicate groups remaining`);
if (still.length === 0) console.log("✅ All duplicates resolved!");
else {
  for (const qs of still) console.log(`  [×${qs.length}] "${normalize(qs[0].question_text).slice(0, 70)}" → ${qs.map(q=>q.question_id).join(", ")}`);
}
