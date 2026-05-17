#!/usr/bin/env node
/**
 * Fix the 4 real bugs found by audit-quality-full.js:
 *   1. V0 blanks: ____ → ______  (4 questions)
 *   2. v1_c_35_q_008: no blank in question_text
 *   3. V0: 12 _rv_ IDs in question_ids should move to review_question_ids
 *   4. V2 article giveaways: 3 questions where "an ______" reveals vowel-starting answer
 */
import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const dataDir = join(root, "data/vocab");

// ── Fix 1 & 2: Question file patches ─────────────────────────────────────────

const Q_PATCHES = {
  // Fix 1: ____ → ______ (4 underscores → 6)
  "v0_1_q_003": { question_text: "All visitors must ______ at the reception desk." },
  "v0_1_q_004": { question_text: "I am writing ______ Ms. Chen from the accounting team." },
  "v0_1_q_006": { question_text: "The report was ______ by the finance director." },
  "v0_1_q_008": { question_text: "The sales team failed to ______ the quarterly target." },

  // Fix 2: v1_c_35_q_008 — add blank to question_text
  "v1_c_35_q_008": {
    question_text: "The ______ clearly stated the payment terms and delivery schedule.",
    explanation_zh: "the ______ 在此作名詞使用，指「合約」。正確答案是 contract。"
  },

  // Fix 4: V2 article giveaways — restructure sentences to remove "an ______"
  // v2_a_73_q_017: "make an ______ with" → "confirm the ______ with"
  "v2_a_73_q_017": {
    question_text: "Conversation: Please confirm the ______ with the department head for next Wednesday. (V2-A-73-17)"
  },
  // v2_a_74_q_003: "as an ______ to this email" → "as the ______ to this email"
  "v2_a_74_q_003": {
    question_text: "Memo: The signed contract is included as the ______ to this email for your records. (V2-A-74-03)"
  },
  // v2_a_74_q_007: "with an ______" → rephrase to avoid article
  "v2_a_74_q_007": {
    question_text: "Conversation: I sent you an email — did you receive the ______ I included with it? (V2-A-74-07)"
  },
};

// Apply patches to question files
import { readdirSync } from "fs";
const files = readdirSync(dataDir).filter(f => f.startsWith("questions_") && f.endsWith(".json")).sort();
let patchesApplied = 0;

for (const file of files) {
  const qs = JSON.parse(readFileSync(join(dataDir, file), "utf8"));
  let changed = false;
  for (const q of qs) {
    const patch = Q_PATCHES[q.question_id];
    if (patch) {
      Object.assign(q, patch);
      console.log(`  ✅ Patched ${q.question_id}: ${JSON.stringify(patch)}`);
      patchesApplied++;
      changed = true;
    }
  }
  if (changed) writeFileSync(join(dataDir, file), JSON.stringify(qs, null, 2));
}
console.log(`\nQuestion patches applied: ${patchesApplied} / ${Object.keys(Q_PATCHES).length}`);

// ── Fix 3: Move V0 _rv_ IDs from question_ids → review_question_ids ──────────

const currPath = join(dataDir, "curriculum.json");
const curriculum = JSON.parse(readFileSync(currPath, "utf8"));

const v0Lesson = curriculum.lessons.find(l => l.stage === "V0");
if (!v0Lesson) throw new Error("V0 lesson not found");

const rvIds = v0Lesson.question_ids.filter(id => id.includes("_rv_"));
const mainIds = v0Lesson.question_ids.filter(id => !id.includes("_rv_"));

console.log(`\nV0 lesson:`);
console.log(`  Before: question_ids=${v0Lesson.question_ids.length}, review_question_ids=${v0Lesson.review_question_ids?.length ?? 0}`);

v0Lesson.question_ids = mainIds;
v0Lesson.review_question_ids = rvIds;

console.log(`  After:  question_ids=${v0Lesson.question_ids.length}, review_question_ids=${v0Lesson.review_question_ids.length}`);
console.log(`  Moved to review_question_ids: ${rvIds.join(", ")}`);

// Bump seed version
const newSeed = "toeic_vocab_tracker_quality_fixed_2026_05_17";
curriculum.seed_version = newSeed;
writeFileSync(currPath, JSON.stringify(curriculum, null, 2));
console.log(`\nseed_version → ${newSeed}`);

// ── Verify no new duplicates from patches ─────────────────────────────────────

const allQ = [];
for (const file of files) allQ.push(...JSON.parse(readFileSync(join(dataDir, file), "utf8")));
const stems = new Map();
for (const q of allQ) {
  const k = q.question_text.trim().toLowerCase().replace(/\s+/g, " ");
  if (!stems.has(k)) stems.set(k, []);
  stems.get(k).push(q.question_id);
}
const dups = [...stems.values()].filter(ids => ids.length > 1);
if (dups.length === 0) {
  console.log("✅ No duplicate stems after patches");
} else {
  console.log(`❌ ${dups.length} new duplicate stems introduced — review patches!`);
  for (const ids of dups) console.log(`   ${ids.join(", ")}`);
}
