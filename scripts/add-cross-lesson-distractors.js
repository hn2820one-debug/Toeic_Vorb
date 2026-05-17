#!/usr/bin/env node
/**
 * C-001: Add cross-lesson interference to V2 review_questions.
 *
 * Current state: Each V2 lesson's review_questions use the same-lesson target
 * words as all 4 options (1 correct + 3 same-lesson distractors). A learner can
 * guess by process of elimination from the lesson's own word list.
 *
 * After fix: 1 correct + 1 same-lesson distractor + 2 distractors from the
 * preceding 2–4 V2 lessons. This forces genuine vocabulary recall rather than
 * within-lesson elimination.
 *
 * Scope: V2 core lessons starting from index 2 (so there are at least 2 prior
 * lessons to draw donors from). V3 review_questions test verb collocation via
 * verb-variation distractors — cross-lesson interference does not apply.
 */

import { readFileSync, writeFileSync, readdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const dataDir = join(root, "data/vocab");

const curriculum = JSON.parse(readFileSync(join(dataDir, "curriculum.json"), "utf8"));
const v2Core = curriculum.lessons.filter(
  l => l.stage === "V2" && l.lesson_type !== "mixed_review"
);
console.log(`V2 core lessons: ${v2Core.length}`);

// Load all V2 question files, keep mutable in-place objects
const v2Files = readdirSync(dataDir)
  .filter(f => f.startsWith("questions_v2") && f.endsWith(".json"))
  .sort();

const fileQuestions = {};
const qMap = {};
const qToFile = {};
for (const f of v2Files) {
  fileQuestions[f] = JSON.parse(readFileSync(join(dataDir, f), "utf8"));
  fileQuestions[f].forEach(q => {
    qMap[q.question_id] = q;
    qToFile[q.question_id] = f;
  });
}

const changedFiles = new Set();
let totalModified = 0;
let lessonsModified = 0;

for (let i = 2; i < v2Core.length; i++) {
  const lesson = v2Core[i];
  const rvIds = lesson.review_question_ids || [];
  if (!rvIds.length) continue;

  const lessonWordSet = new Set(lesson.target_items || []);

  // Collect unique donor words from the preceding 4 core lessons (excluding current lesson words)
  const seen = new Set(lessonWordSet);
  const donors = [];
  for (const prev of v2Core.slice(Math.max(0, i - 4), i)) {
    for (const word of (prev.target_items || [])) {
      if (!seen.has(word)) { donors.push(word); seen.add(word); }
    }
  }
  if (donors.length < 2) continue;

  let lessonChanged = false;

  for (let qIdx = 0; qIdx < rvIds.length; qIdx++) {
    const q = qMap[rvIds[qIdx]];
    if (!q || q.type !== "review_question") continue;

    const correctKey = q.correct_answer;
    const wrongKeys = ["A", "B", "C", "D"].filter(k => k !== correctKey);

    // Rotate which same-lesson distractor to keep (one per question, cycling)
    const keepKey = wrongKeys[qIdx % wrongKeys.length];
    const replaceKeys = wrongKeys.filter(k => k !== keepKey);  // 2 keys

    // Pick 2 unique donors (deterministic via prime-step indexing)
    const d1 = donors[(qIdx * 7) % donors.length];
    const rest = donors.filter(w => w !== d1);
    if (!rest.length) continue;
    const d2 = rest[(qIdx * 11) % rest.length];

    q.options[replaceKeys[0]] = d1;
    q.options[replaceKeys[1]] = d2;
    // correctKey and keepKey remain unchanged

    changedFiles.add(qToFile[q.question_id]);
    totalModified++;
    lessonChanged = true;
  }

  if (lessonChanged) lessonsModified++;
}

for (const f of changedFiles) {
  writeFileSync(join(dataDir, f), JSON.stringify(fileQuestions[f], null, 2));
  console.log(`  Updated: ${f}`);
}

console.log(`\nDone: ${totalModified} review_questions modified across ${lessonsModified} V2 lessons`);
console.log("Next: bump seed_version in 3 files, then run audit-quality-full.js");
