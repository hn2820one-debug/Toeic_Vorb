#!/usr/bin/env node
/**
 * Full question-bank quality audit against docs/question-creation-spec.md.
 * Reports every violation by rule number.
 */
import { readFileSync, readdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const dataDir = join(root, "data/vocab");

// ── Load data ─────────────────────────────────────────────────────────────────

const curriculum = JSON.parse(readFileSync(join(dataDir, "curriculum.json"), "utf8"));
const lessons = curriculum.lessons;
const lessonById = new Map(lessons.map(l => [l.lesson_id, l]));

const files = readdirSync(dataDir).filter(f => f.startsWith("questions_") && f.endsWith(".json")).sort();
const allQ = [];
for (const file of files) {
  const qs = JSON.parse(readFileSync(join(dataDir, file), "utf8"));
  for (const q of qs) { q._file = file; allQ.push(q); }
}

// Load vocab_items from curriculum (they're not in a separate file — derive from questions)
const vocabItemIds = new Set(allQ.map(q => q.target_item_id).filter(Boolean));

function normalize(t) { return (t || "").trim().toLowerCase().replace(/\s+/g, " "); }

// ── Violation collector ───────────────────────────────────────────────────────

const issues = [];
function warn(rule, qid, file, msg) {
  issues.push({ rule, qid, file, msg });
}

// ── Constants from spec ───────────────────────────────────────────────────────

const VALID_TYPES = new Set([
  "meaning_choice", "scene_vocabulary", "collocation", "word_family",
  "part5_sentence_completion", "part6_context_choice", "speed_drill",
  "review_question", "formal_phrase", "false_friend"
]);

const TYPE_ERROR_CODE = {
  meaning_choice: "VOCAB_UNKNOWN",
  scene_vocabulary: "SCENE_VOCAB_GAP",
  collocation: "COLLOCATION_GAP",
  word_family: "WORD_FAMILY_POS",
  part5_sentence_completion: "VOCAB_WEAK_RECALL",
  part6_context_choice: "SCENE_VOCAB_GAP",
  speed_drill: "TIME_PRESSURE",
  review_question: "VOCAB_WEAK_RECALL",
  formal_phrase: "FORMAL_PHRASE",
  false_friend: "FALSE_FRIEND",
};

const TYPE_TIME = {
  meaning_choice: 10,
  scene_vocabulary: 15,
  collocation: 15,
  word_family: 15,
  part5_sentence_completion: 15,
  part6_context_choice: 25,
  speed_drill: 10,
  review_question: 10,
  formal_phrase: 20,
  false_friend: 15,
};

const FILL_IN_TYPES = new Set([
  "scene_vocabulary", "collocation", "word_family",
  "part5_sentence_completion", "speed_drill", "formal_phrase", "false_friend"
]);

// ── §1.1 Uniqueness ───────────────────────────────────────────────────────────

const stemMap = new Map();
for (const q of allQ) {
  const key = normalize(q.question_text);
  if (!stemMap.has(key)) stemMap.set(key, []);
  stemMap.get(key).push(q);
}
let dupCount = 0;
for (const [, qs] of stemMap) {
  if (qs.length > 1) {
    dupCount++;
    for (const q of qs.slice(1)) {
      warn("§1.1", q.question_id, q._file, `Duplicate stem shared with ${qs[0].question_id}`);
    }
  }
}

// ── §1.2 Required fields ──────────────────────────────────────────────────────

const REQUIRED = ["question_id", "lesson_id", "stage", "type", "skill", "subskill",
  "question_text", "options", "correct_answer", "explanation_zh",
  "target_item_id", "distractor_type", "difficulty", "estimated_time_seconds",
  "default_error_code", "tags"];

for (const q of allQ) {
  for (const f of REQUIRED) {
    if (q[f] === undefined || q[f] === null || q[f] === "") {
      warn("§1.2", q.question_id, q._file, `Missing or empty field: ${f}`);
    }
  }
  // distractor_type — stage-specific allowed values (§1.2 / spec updated)
  const ALLOWED_DT = {
    V0: ["toeic_realistic", "semantic_confusion"],
    V1: ["same_word_family", "toeic_realistic", "semantic_confusion"],
    V2: ["same_scene_vocabulary", "toeic_realistic"],
    V3: ["wrong_verb_collocation", "toeic_realistic"],
  };
  const allowedDt = ALLOWED_DT[q.stage] || ["toeic_realistic"];
  if (q.distractor_type && !allowedDt.includes(q.distractor_type)) {
    warn("§1.2", q.question_id, q._file, `distractor_type "${q.distractor_type}" not allowed for stage ${q.stage} (allowed: ${allowedDt.join(", ")})`);
  }
  // difficulty
  if (![1, 2, 3].includes(q.difficulty)) {
    warn("§1.2", q.question_id, q._file, `difficulty must be 1/2/3, got ${q.difficulty}`);
  }
  // type
  if (!VALID_TYPES.has(q.type)) {
    warn("§1.2", q.question_id, q._file, `Unknown type: "${q.type}"`);
  }
  // tags
  if (!Array.isArray(q.tags) || q.tags.length === 0) {
    warn("§1.2", q.question_id, q._file, `tags must be a non-empty array`);
  }
  // skill is lesson-level pedagogical skill, not required to equal type (spec §1.2)
  // Only flag if skill is missing entirely
  if (!q.skill) {
    warn("§1.2", q.question_id, q._file, `Missing skill field`);
  }
}

// ── §1.2 Options — exactly A,B,C,D ───────────────────────────────────────────

for (const q of allQ) {
  const opts = q.options || {};
  const keys = Object.keys(opts);
  if (keys.length !== 4 || !["A","B","C","D"].every(k => k in opts)) {
    warn("§1.2", q.question_id, q._file, `options must have exactly A,B,C,D (got: ${keys.join(",")})`);
  }
  if (!["A","B","C","D"].includes(q.correct_answer)) {
    warn("§1.2", q.question_id, q._file, `correct_answer must be A/B/C/D, got "${q.correct_answer}"`);
  }
  // Check correct_answer key exists in options
  if (q.options && q.correct_answer && !q.options[q.correct_answer]) {
    warn("§1.2", q.question_id, q._file, `correct_answer "${q.correct_answer}" not found in options`);
  }
  // Check for empty option text
  for (const [k, v] of Object.entries(opts)) {
    if (!v || v.trim() === "") {
      warn("§1.2", q.question_id, q._file, `Empty option text for option ${k}`);
    }
  }
}

// ── §1.2 explanation_zh ───────────────────────────────────────────────────────

for (const q of allQ) {
  const ex = (q.explanation_zh || "").trim();
  if (ex.length < 10) {
    warn("§1.4", q.question_id, q._file, `explanation_zh too short (${ex.length} chars): "${ex}"`);
  }
  if (ex.length > 120) {
    warn("§1.4", q.question_id, q._file, `explanation_zh too long (${ex.length} chars)`);
  }
  // Must not just repeat the question_text back
  if (ex.toLowerCase().startsWith("this sentence") || ex.toLowerCase().startsWith("the sentence")) {
    warn("§1.4", q.question_id, q._file, `explanation_zh appears to describe the question rather than explain the answer`);
  }
}

// ── §1.2 target_item_id exists ────────────────────────────────────────────────

// (We check that target_item_id is at least non-null and consistent with stage)
for (const q of allQ) {
  if (!q.target_item_id) {
    warn("§1.2", q.question_id, q._file, `Missing target_item_id`);
  }
}

// ── §1.2 stage consistency with lesson ───────────────────────────────────────

for (const q of allQ) {
  const lesson = lessonById.get(q.lesson_id);
  if (!lesson) {
    warn("§1.2", q.question_id, q._file, `lesson_id "${q.lesson_id}" not found in curriculum.json`);
    continue;
  }
  if (lesson.stage !== q.stage) {
    warn("§1.2", q.question_id, q._file, `stage mismatch: question says "${q.stage}", lesson says "${lesson.stage}"`);
  }
}

// ── §1.3 Fill-in types must have exactly one blank ───────────────────────────

for (const q of allQ) {
  if (FILL_IN_TYPES.has(q.type)) {
    const blanks = (q.question_text.match(/______/g) || []).length;
    if (blanks === 0) {
      warn("§1.3", q.question_id, q._file, `Fill-in type "${q.type}" has no blank (______) in question_text`);
    } else if (blanks > 1) {
      warn("§1.3", q.question_id, q._file, `Fill-in type "${q.type}" has ${blanks} blanks — must have exactly 1`);
    }
  }
}

// ── §3 error_code — stage-level consistency (V1=WORD_FAMILY_POS, V2=SCENE_VOCAB_GAP, etc.) ──

const STAGE_ERROR_CODES = {
  V0: ["VOCAB_UNKNOWN", "SCENE_VOCAB_GAP", "COLLOCATION_GAP", "VOCAB_WEAK_RECALL", "FORMAL_PHRASE", "FALSE_FRIEND", "TIME_PRESSURE"],
  V1: ["WORD_FAMILY_POS", "VOCAB_WEAK_RECALL", "TIME_PRESSURE"],
  V2: ["SCENE_VOCAB_GAP", "VOCAB_UNKNOWN", "VOCAB_WEAK_RECALL"],
  V3: ["COLLOCATION_GAP", "COLLOCATION_PREP", "SCENE_VOCAB_GAP", "VOCAB_WEAK_RECALL"],
};

for (const q of allQ) {
  const allowed = STAGE_ERROR_CODES[q.stage];
  if (allowed && !allowed.includes(q.default_error_code)) {
    warn("§3", q.question_id, q._file, `default_error_code "${q.default_error_code}" not valid for stage ${q.stage}`);
  }
}

// ── §3 scene_vocabulary must have "Scene: " prefix ───────────────────────────

for (const q of allQ) {
  if (q.type === "scene_vocabulary" && q.stage !== "V0") {
    // Check for a "Word: " prefix pattern
    if (!/^[A-Za-z][A-Za-z &\/]+:\s/.test(q.question_text)) {
      warn("§3", q.question_id, q._file, `scene_vocabulary question missing scene label prefix ("Office: ...", "HR: ..." etc.): "${q.question_text.slice(0, 60)}"`);
    }
  }
}

// ── §3 review_question format ────────────────────────────────────────────────
// V0/V2/V3: "Quick review: choose the best TOEIC meaning for X"
// V1: fill-in-the-blank (word family form) — different format by design

for (const q of allQ) {
  // Only V0 uses "Quick review:" format; V1/V2/V3 use fill-in-the-blank
  if (q.type === "review_question" && q.stage === "V0") {
    const qt = normalize(q.question_text);
    if (!qt.startsWith("quick review:")) {
      warn("§3", q.question_id, q._file, `review_question must start with "Quick review:" — got: "${q.question_text.slice(0, 60)}"`);
    }
  }
}

// ── §3 meaning_choice format ─────────────────────────────────────────────────
// Canonical: "In a TOEIC business context, what does X most nearly mean?"
// V1 variants also accepted: "Which option best describes...", "Select the best TOEIC-style definition..."

for (const q of allQ) {
  if (q.type === "meaning_choice") {
    const qt = normalize(q.question_text);
    const VALID_MC_PATTERNS = [
      "what does", "most nearly mean", "which option best describes",
      "which definition best", "select the best toeic", "in toeic english"
    ];
    if (!VALID_MC_PATTERNS.some(p => qt.includes(p))) {
      warn("§3", q.question_id, q._file, `meaning_choice format unexpected: "${q.question_text.slice(0, 70)}"`);
    }
  }
}

// ── §3 false_friend format ───────────────────────────────────────────────────

for (const q of allQ) {
  if (q.type === "false_friend") {
    const qt = normalize(q.question_text);
    if (!qt.includes("usually means")) {
      warn("§3", q.question_id, q._file, `false_friend format unexpected — should include "usually means": "${q.question_text.slice(0, 70)}"`);
    }
  }
}

// ── §3 speed_drill sentence length (8–22 words, warn if >22) ─────────────────

for (const q of allQ) {
  if (q.type === "speed_drill") {
    const words = q.question_text.split(/\s+/).length;
    if (words > 25) {
      warn("§3", q.question_id, q._file, `speed_drill sentence too long (${words} words, prefer ≤22): "${q.question_text.slice(0, 60)}"`);
    }
  }
}

// ── §3 part6_context_choice should have ≥2 sentences ────────────────────────

for (const q of allQ) {
  if (q.type === "part6_context_choice") {
    const sentences = q.question_text.split(/[.!?]+/).filter(s => s.trim().length > 5);
    if (sentences.length < 2) {
      warn("§3", q.question_id, q._file, `part6_context_choice should have ≥2 sentences (found ${sentences.length}): "${q.question_text.slice(0, 80)}"`);
    }
  }
}

// ── §2 V1 — review_question must not appear in question_ids ──────────────────

const lessonQidSets = {};
const lessonRvSets = {};
for (const lesson of lessons) {
  lessonQidSets[lesson.lesson_id] = new Set(lesson.question_ids || []);
  lessonRvSets[lesson.lesson_id] = new Set(lesson.review_question_ids || []);
}

for (const q of allQ) {
  if (q.type === "review_question") {
    const lesson = lessonById.get(q.lesson_id);
    if (!lesson) continue;
    const inMain = lessonQidSets[q.lesson_id]?.has(q.question_id);
    const inReview = lessonRvSets[q.lesson_id]?.has(q.question_id);
    if (inMain && !inReview) {
      warn("§2", q.question_id, q._file, `review_question "${q.question_id}" is in question_ids (main session) — should be in review_question_ids only`);
    }
  }
}

// ── §2 Per-lesson question count checks ──────────────────────────────────────

const lessonCountIssues = [];
for (const lesson of lessons) {
  if (lesson.lesson_type === "mixed_review") continue; // assembled from rv, skip
  const qids = lesson.question_ids || [];
  const rvids = lesson.review_question_ids || [];
  const { stage, lesson_type } = lesson;

  let expectedQ = null, expectedRv = null;
  // V1-A (11-20) = 18+6; V1-B/C/D/E (21-52) = 20+4 — both are valid (spec §2)
  if (stage === "V1" && lesson_type === "word_family") {
    const num = parseInt(lesson.lesson_number);
    if (num <= 20) { expectedQ = 18; expectedRv = 6; }
    else           { expectedQ = 20; expectedRv = 4; }
  }
  if (stage === "V1" && lesson_type === "speed_drill")  { expectedQ = 40; expectedRv = 0; }
  if (stage === "V2" && lesson_type === "scene_vocabulary") { expectedQ = [20, 22]; expectedRv = 4; }
  if (stage === "V3" && lesson_type === "collocation")  { expectedQ = [20, 22]; expectedRv = 4; }
  if (stage === "V0") { expectedQ = [1, 50]; expectedRv = [0, 20]; }

  if (expectedQ !== null) {
    const minQ = Array.isArray(expectedQ) ? expectedQ[0] : expectedQ;
    const maxQ = Array.isArray(expectedQ) ? expectedQ[1] : expectedQ;
    if (qids.length < minQ || qids.length > maxQ) {
      lessonCountIssues.push(`${lesson.lesson_id} (${lesson_type}): question_ids=${qids.length}, expected ${Array.isArray(expectedQ)?expectedQ.join("–"):expectedQ}`);
    }
  }
  if (expectedRv !== null) {
    const minR = Array.isArray(expectedRv) ? expectedRv[0] : expectedRv;
    const maxR = Array.isArray(expectedRv) ? expectedRv[1] : expectedRv;
    if (rvids.length < minR || rvids.length > maxR) {
      lessonCountIssues.push(`${lesson.lesson_id} (${lesson_type}): review_question_ids=${rvids.length}, expected ${Array.isArray(expectedRv)?expectedRv.join("–"):expectedRv}`);
    }
  }

  // Check all question_ids actually exist
  for (const qid of qids) {
    if (!allQ.find(q => q.question_id === qid)) {
      warn("§2", qid, lesson.lesson_id, `question_id "${qid}" in curriculum.json not found in any question file`);
    }
  }
  for (const qid of rvids) {
    if (!allQ.find(q => q.question_id === qid)) {
      warn("§2", qid, lesson.lesson_id, `review_question_id "${qid}" in curriculum.json not found in any question file`);
    }
  }
}

// ── §2 Orphaned questions (in files but not in any lesson) ───────────────────

const allLessonQids = new Set();
for (const lesson of lessons) {
  for (const qid of [...(lesson.question_ids||[]), ...(lesson.review_question_ids||[])]) {
    allLessonQids.add(qid);
  }
}
const orphans = allQ.filter(q => !allLessonQids.has(q.question_id));

// ── §1.3 Options: check for obvious grammatical giveaway (a/an) ──────────────

const AN_WORDS = /^(a|e|i|o|u)/i;
const articleGiveaways = [];
for (const q of allQ) {
  const qt = q.question_text || "";
  // Check if "a ______" or "an ______" is in the question
  const aBlank  = / a (?:______)/i.test(qt);
  const anBlank = / an (?:______)/i.test(qt);
  if (aBlank || anBlank) {
    const opts = Object.values(q.options || {});
    const vowelStarters = opts.filter(o => AN_WORDS.test(o.trim()));
    const consonantStarters = opts.filter(o => !AN_WORDS.test(o.trim()));
    // Only flag if the article narrows options significantly:
    // "an ______" is a giveaway only if SOME (not all) options start with vowels
    // If ALL options start with vowels, "an" doesn't help at all — not a giveaway
    if (anBlank && vowelStarters.length > 0 && vowelStarters.length < opts.length) {
      // "an" rules out consonant-starting options — that's a giveaway
      articleGiveaways.push({ qid: q.question_id, file: q._file, text: qt.slice(0, 60) });
    }
  }
}

// ── §1.3 Duplicate correct answers in a lesson (all 4 questions point to same answer slot) ─

// Check within-lesson answer distribution
const lessonAnswers = {};
for (const q of allQ) {
  if (!lessonAnswers[q.lesson_id]) lessonAnswers[q.lesson_id] = {};
  lessonAnswers[q.lesson_id][q.correct_answer] = (lessonAnswers[q.lesson_id][q.correct_answer] || 0) + 1;
}
const answerImbalance = [];
for (const [lid, counts] of Object.entries(lessonAnswers)) {
  const total = Object.values(counts).reduce((a,b)=>a+b,0);
  const maxCount = Math.max(...Object.values(counts));
  if (total >= 8 && maxCount / total > 0.65) {
    answerImbalance.push(`${lid}: answer distribution ${JSON.stringify(counts)} — one answer slot used ${Math.round(maxCount/total*100)}% of the time`);
  }
}

// ── Print report ──────────────────────────────────────────────────────────────

console.log("╔══════════════════════════════════════════════════════════════════╗");
console.log("║              FULL QUALITY AUDIT REPORT                           ║");
console.log(`║  ${new Date().toISOString().slice(0,10)}   Questions: ${allQ.length}   Lessons: ${lessons.length}${" ".repeat(16)}║`);
console.log("╚══════════════════════════════════════════════════════════════════╝\n");

// Group issues by rule
const byRule = {};
for (const issue of issues) {
  if (!byRule[issue.rule]) byRule[issue.rule] = [];
  byRule[issue.rule].push(issue);
}

const SECTIONS = [
  ["§1.1", "Uniqueness"],
  ["§1.2", "Required fields / options / stage consistency"],
  ["§1.3", "Fill-in blank count / grammatical giveaways"],
  ["§1.4", "explanation_zh quality"],
  ["§2",   "Lesson structure / question counts / orphans"],
  ["§3",   "Type-specific format rules"],
];

let totalIssues = 0;
for (const [rule, label] of SECTIONS) {
  const ruleIssues = byRule[rule] || [];
  totalIssues += ruleIssues.length;
  const status = ruleIssues.length === 0 ? "✅" : "❌";
  console.log(`${status}  ${rule}  ${label}`);
  if (ruleIssues.length > 0) {
    console.log(`   ${ruleIssues.length} issue(s):`);
    for (const issue of ruleIssues.slice(0, 15)) {
      console.log(`   • [${issue.qid}] ${issue.msg}`);
    }
    if (ruleIssues.length > 15) console.log(`   ... and ${ruleIssues.length - 15} more`);
  }
}

// Lesson count issues
if (lessonCountIssues.length > 0) {
  totalIssues += lessonCountIssues.length;
  console.log(`\n❌  Lesson question count mismatches (${lessonCountIssues.length}):`);
  for (const msg of lessonCountIssues.slice(0, 20)) console.log(`   • ${msg}`);
  if (lessonCountIssues.length > 20) console.log(`   ... and ${lessonCountIssues.length - 20} more`);
} else {
  console.log(`\n✅  All lesson question counts correct`);
}

// Orphaned questions
if (orphans.length > 0) {
  totalIssues += orphans.length;
  console.log(`\n❌  Orphaned questions (in files but not in any lesson): ${orphans.length}`);
  for (const q of orphans.slice(0, 10)) console.log(`   • ${q.question_id} [${q.lesson_id}] (${q._file})`);
} else {
  console.log(`✅  No orphaned questions`);
}

// Article giveaways
if (articleGiveaways.length > 0) {
  console.log(`\n⚠️   Potential article giveaway (a/an before blank): ${articleGiveaways.length}`);
  for (const a of articleGiveaways.slice(0, 5)) console.log(`   • [${a.qid}] "${a.text}"`);
} else {
  console.log(`✅  No article giveaways detected`);
}

// Answer distribution
if (answerImbalance.length > 0) {
  console.log(`\n⚠️   Answer distribution imbalance (>65% same slot): ${answerImbalance.length} lessons`);
  for (const a of answerImbalance.slice(0, 5)) console.log(`   • ${a}`);
} else {
  console.log(`✅  Answer distribution balanced across all lessons`);
}

console.log(`\n${"─".repeat(68)}`);
if (totalIssues === 0) {
  console.log("✅  PASSED — no issues found across all checks.");
} else {
  console.log(`❌  TOTAL ISSUES: ${totalIssues}`);
  console.log(`    Run the relevant fix scripts or manually correct the issues above.`);
}
