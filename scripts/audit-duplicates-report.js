#!/usr/bin/env node
/**
 * Full duplicate report — categorized by severity.
 */
import { readFileSync, readdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const dataDir = join(root, "data/vocab");

const files = readdirSync(dataDir).filter(f => f.startsWith("questions_") && f.endsWith(".json")).sort();
let allQuestions = [];
for (const file of files) {
  const qs = JSON.parse(readFileSync(join(dataDir, file), "utf8"));
  for (const q of qs) q._file = file;
  allQuestions.push(...qs);
}

function normalize(text) { return text.trim().toLowerCase().replace(/\s+/g, " "); }

const byText = new Map();
for (const q of allQuestions) {
  const key = normalize(q.question_text);
  if (!byText.has(key)) byText.set(key, []);
  byText.get(key).push(q);
}
const dupGroups = [...byText.entries()].filter(([, qs]) => qs.length > 1);

// Category A: identical question (same text + same options)
// Category B: same stem + same target_item + different answer (same word, different form)
// Category C: same stem + different target_item (template sentence used for different words)
const catA = [], catB = [], catC = [];
for (const [stem, qs] of dupGroups) {
  const opts = new Set(qs.map(q => JSON.stringify(q.options)));
  const items = new Set(qs.map(q => q.target_item_id));
  if (opts.size === 1) catA.push([stem, qs]);
  else if (items.size === 1) catB.push([stem, qs]);
  else catC.push([stem, qs]);
}

const excessA = catA.reduce((s,[,qs])=>s+qs.length-1,0);
const excessB = catB.reduce((s,[,qs])=>s+qs.length-1,0);
const excessC = catC.reduce((s,[,qs])=>s+qs.length-1,0);

console.log("╔══════════════════════════════════════════════════════════════╗");
console.log("║            FULL DUPLICATE AUDIT REPORT                       ║");
console.log("╚══════════════════════════════════════════════════════════════╝\n");
console.log(`Total questions:     ${allQuestions.length}`);
console.log(`Unique stems:        ${byText.size}`);
console.log(`Duplicate stems:     ${dupGroups.length}`);
console.log(`Excess questions:    ${excessA+excessB+excessC}\n`);

console.log("─── CATEGORY A: Identical questions (same text + same options) ───");
console.log(`  Groups: ${catA.length}  |  Excess questions: ${excessA}  |  MUST REMOVE\n`);
for (const [stem, qs] of catA) {
  console.log(`  [×${qs.length}] "${stem.slice(0,70)}"`);
  for (const q of qs) console.log(`    ${q.question_id} [${q.lesson_id}/${q.type}]`);
}

console.log("\n─── CATEGORY B: Same word, same sentence, different word-form asked ───");
console.log(`  Groups: ${catB.length}  |  Excess questions: ${excessB}  |  MUST FIX (need new sentences)\n`);
// Show 5 examples
for (const [stem, qs] of catB.slice(0,5)) {
  console.log(`  [×${qs.length}] "${stem.slice(0,70)}"`);
  const lessons = [...new Set(qs.map(q=>q.lesson_id))].join(", ");
  console.log(`    Used in: ${lessons}`);
  console.log(`    Answers: ${qs.map(q=>q.correct_answer+":"+q.options[q.correct_answer]).join(" | ")}`);
}
if (catB.length > 5) console.log(`  ... and ${catB.length-5} more groups`);

console.log("\n─── CATEGORY C: Template sentence, different target words ───");
console.log(`  Groups: ${catC.length}  |  Excess questions: ${excessC}  |  MUST FIX (need new sentences)\n`);
for (const [stem, qs] of catC.slice(0,5)) {
  console.log(`  [×${qs.length}] "${stem.slice(0,70)}"`);
  const items = [...new Set(qs.map(q=>q.target_item_id))].join(", ");
  console.log(`    Target items: ${items.slice(0,80)}`);
}
if (catC.length > 5) console.log(`  ... and ${catC.length-5} more groups`);

// Where do the duplicates live?
const v1fDups = dupGroups.filter(([,qs])=>qs.some(q=>q._file==="questions_v1f.json"));
const crossFile = dupGroups.filter(([,qs])=>{
  const fs = new Set(qs.map(q=>q._file));
  return fs.size > 1;
});

console.log("\n═══ ROOT CAUSE ═══");
console.log(`• questions_v1f.json (speed_drill) is involved in most cross-file duplicates.`);
console.log(`  V1F copies ${catA.length} stems verbatim from earlier V1 lessons (A–E).`);
console.log(`• V1A–E word_family lessons use the SAME template sentences across 10 lessons.`);
console.log(`  e.g. "The report seems ______ after the final review." appears in 10 lessons`);
console.log(`  (V1-A-11 through V1-A-20), each testing a different adjective.\n`);

console.log("═══ WHAT CAN BE FIXED AUTOMATICALLY ═══");
console.log(`• Category A (${catA.length} groups, ${excessA} excess): Can remove exact copies automatically.`);
console.log(`• Category B+C (${catB.length+catC.length} groups, ${excessB+excessC} excess): Need NEW question text.`);
console.log(`  Generating unique stems requires rewriting V1 content.\n`);

// Per-file breakdown of duplicate involvement
const fileInvolvement = {};
for (const [,qs] of dupGroups) {
  for (const q of qs) {
    fileInvolvement[q._file] = fileInvolvement[q._file] || { total: 0, questions: 0 };
    fileInvolvement[q._file].total++;
  }
}
console.log("═══ PER-FILE DUPLICATE INVOLVEMENT ═══");
for (const [f, s] of Object.entries(fileInvolvement).sort((a,b)=>b[1].total-a[1].total)) {
  const total = JSON.parse(readFileSync(join(dataDir, f), "utf8")).length;
  console.log(`  ${f}: ${s.total} questions involved in duplicates (out of ${total})`);
}
