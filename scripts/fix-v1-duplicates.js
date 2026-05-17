#!/usr/bin/env node
/**
 * Fix all V1 duplicate question stems.
 * Strategy: for each duplicate group, keep the first occurrence unchanged.
 * For all subsequent occurrences, replace the question_text using a
 * substitution system until the result is globally unique.
 */
import { readFileSync, writeFileSync, readdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const dataDir = join(root, "data/vocab");

// ── Substitution tables ───────────────────────────────────────────────────────

// Context-prefix substitutions (for sentences starting with "context: sentence")
const PREFIX_SUBS = [
  ["reports:", "memos:"], ["reports:", "updates:"], ["reports:", "records:"],
  ["hr:", "hiring:"], ["hr:", "staffing:"], ["hr:", "onboarding:"],
  ["hr screening:", "interviews:"], ["hr screening:", "recruitment:"],
  ["interviews:", "selection:"], ["interviews:", "screening:"],
  ["recruiting:", "hiring:"], ["recruiting:", "talent:"],
  ["orientation:", "onboarding:"], ["orientation:", "induction:"],
  ["finance:", "accounting:"], ["finance:", "budgets:"], ["finance:", "invoicing:"],
  ["planning:", "budgeting:"], ["planning:", "scheduling:"],
  ["accounting:", "payroll:"], ["accounting:", "finance:"],
  ["legal:", "contracts:"], ["legal:", "compliance:"],
  ["vendors:", "suppliers:"], ["vendors:", "procurement:"],
  ["policies:", "procedures:"], ["policies:", "guidelines:"],
  ["meetings:", "briefings:"], ["meetings:", "reviews:"],
  ["emails:", "messages:"], ["emails:", "notifications:"],
  ["sales reports:", "sales updates:"], ["sales reports:", "quarterly reports:"],
  ["customer service:", "client support:"], ["customer service:", "help desk:"],
  ["documents:", "files:"], ["documents:", "records:"],
  ["office systems:", "admin:"], ["office systems:", "workplace:"],
  ["restaurants:", "catering:"], ["restaurants:", "hospitality:"],
  ["office equipment:", "equipment:"], ["office equipment:", "supplies:"],
  ["banking:", "finance:"], ["banking:", "treasury:"],
  ["appointments:", "bookings:"], ["appointments:", "reservations:"],
  ["suppliers:", "vendors:"], ["suppliers:", "procurement:"],
  ["maintenance:", "repairs:"], ["maintenance:", "servicing:"],
  ["security:", "safety:"], ["security:", "access control:"],
  ["supervision:", "management:"], ["supervision:", "oversight:"],
  ["pricing:", "costing:"], ["pricing:", "estimates:"],
  ["medical offices:", "clinics:"], ["medical offices:", "health services:"],
  ["manufacturing:", "production:"], ["manufacturing:", "operations:"],
  ["medical devices:", "equipment:"], ["medical devices:", "devices:"],
  ["quality control:", "quality assurance:"], ["quality control:", "inspection:"],
  ["warehouses:", "logistics:"], ["warehouses:", "storage:"],
];

// Subject-noun substitutions
const SUBJECT_SUBS = [
  [/\bthe manager\b/gi, ["the supervisor", "the coordinator", "the director", "the team leader", "the department head", "the branch manager", "the project lead", "the senior officer"]],
  [/\bthe managers\b/gi, ["the supervisors", "the coordinators", "the directors", "the team leaders"]],
  [/\bthe company\b/gi, ["the firm", "the organization", "the department", "the branch", "the division", "the agency"]],
  [/\bthe team\b/gi, ["the department", "the division", "the crew", "the unit", "the group", "the committee"]],
  [/\bthe client\b/gi, ["the customer", "the buyer", "the account holder", "the partner", "the vendor"]],
  [/\bthe report\b/gi, ["the proposal", "the summary", "the analysis", "the statement", "the estimate", "the forecast", "the memo", "the assessment"]],
  [/\bthe reports\b/gi, ["the proposals", "the summaries", "the estimates", "the memos", "the assessments"]],
  [/\bthe project\b/gi, ["the assignment", "the initiative", "the program", "the plan", "the task", "the campaign"]],
  [/\bthe office\b/gi, ["the building", "the facility", "the branch", "the workspace", "the location"]],
  [/\bthe staff\b/gi, ["the employees", "the workers", "the team members", "the personnel"]],
  [/\bstaff\b/gi, ["employees", "workers", "team members", "personnel", "colleagues"]],
  [/\bthe supplier\b/gi, ["the vendor", "the contractor", "the provider", "the partner"]],
  [/\bthe editor\b/gi, ["the reviewer", "the proofreader", "the writer", "the author"]],
  [/\bthe recruiter\b/gi, ["the hiring manager", "the HR officer", "the talent scout", "the interviewer"]],
  [/\bthe ______ answered\b/gi, ["the ______ responded", "the ______ replied", "the ______ addressed"]],
  [/\bthe board\b/gi, ["the committee", "the panel", "the council", "the executive team"]],
  [/\bthe inspector\b/gi, ["the auditor", "the reviewer", "the examiner", "the officer"]],
  [/\bthe factory\b/gi, ["the plant", "the facility", "the production site", "the warehouse"]],
  [/\bthe hotel\b/gi, ["the resort", "the lodge", "the inn", "the guesthouse"]],
  [/\bthe copier\b/gi, ["the printer", "the scanner", "the fax machine", "the device"]],
  [/\bthe engineer\b/gi, ["the technician", "the specialist", "the operator", "the mechanic"]],
  [/\bthe warehouse\b/gi, ["the storage facility", "the depot", "the stockroom", "the distribution center"]],
  [/\bthe ______ explained\b/gi, ["the ______ described", "the ______ outlined", "the ______ clarified"]],
  [/\bthe distributor\b/gi, ["the supplier", "the wholesaler", "the logistics firm", "the delivery company"]],
];

// Time/context phrase substitutions
const TAIL_SUBS = [
  [/before the audit\b/gi, ["before the deadline", "before the inspection", "before the review", "prior to the assessment"]],
  [/before the meeting\b/gi, ["before the briefing", "before the conference", "before the session", "ahead of the review"]],
  [/before the (?:review|conference|session|briefing)\b/gi, ["ahead of the deadline", "before end of day", "before the audit", "prior to submission"]],
  [/for next week's staff meeting\b/gi, ["for the upcoming quarterly review", "for the client presentation", "for the team briefing", "for the annual conference"]],
  [/on monday\b/gi, ["by Thursday", "last Friday", "this quarter", "by end of week"]],
  [/by the end of the day\b/gi, ["by noon on Friday", "before end of business", "within 48 hours", "before the weekend"]],
  [/during peak travel season\b/gi, ["during the busy season", "at the end of the quarter", "during the holiday period", "in the peak sales period"]],
  [/near gate 4\b/gi, ["at the main entrance", "near the lobby", "in the corridor", "on the third floor"]],
  [/for the client\b/gi, ["for the executive team", "for the board", "for the stakeholders", "for the annual review"]],
  [/this morning\b/gi, ["this afternoon", "last week", "this quarter", "during the audit"]],
];

// Alternative sentence starters for adjective-form questions
const ADJECTIVE_STARTERS = [
  // For "The [subject] seems ______ after [event]."
  (word, i) => [
    `The proposal was considered ${word} by the external auditor.`,
    `The figures were verified as ${word} before submission.`,
    `All inventory data must be kept ${word} at all times.`,
    `The updated forecast proved ${word} within the first quarter.`,
    `Staff are expected to maintain ${word} attendance records.`,
    `The assessment results were confirmed as ${word} by the committee.`,
    `The inventory count was found to be ${word} after the spot check.`,
    `Management praised the team for keeping ${word} documentation.`,
    `The technician confirmed that all measurements were ${word}.`,
  ][i % 9],
];

// ── Utilities ────────────────────────────────────────────────────────────────

function normalize(text) { return text.trim().toLowerCase().replace(/\s+/g, " "); }

function applySubstitution(text, from, tos, index) {
  const to = Array.isArray(tos) ? tos[index % tos.length] : tos;
  if (from instanceof RegExp) {
    return text.replace(from, to);
  }
  const re = new RegExp(from.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
  return text.replace(re, to);
}

function makeUnique(text, seenTexts, dupIndex) {
  // Try prefix substitution first
  for (const [from, to] of PREFIX_SUBS) {
    if (normalize(text).startsWith(from.toLowerCase())) {
      const newText = to + text.slice(from.length);
      if (!seenTexts.has(normalize(newText))) return newText;
    }
  }

  // Try subject substitution
  for (const [pattern, alternatives] of SUBJECT_SUBS) {
    for (let ai = 0; ai < alternatives.length; ai++) {
      const newText = applySubstitution(text, pattern, alternatives, ai + dupIndex);
      if (newText !== text && !seenTexts.has(normalize(newText))) return newText;
    }
  }

  // Try tail substitution
  for (const [pattern, alternatives] of TAIL_SUBS) {
    for (let ai = 0; ai < alternatives.length; ai++) {
      const newText = applySubstitution(text, pattern, alternatives, ai + dupIndex);
      if (newText !== text && !seenTexts.has(normalize(newText))) return newText;
    }
  }

  // Try combining prefix + subject
  let working = text;
  for (const [from, to] of PREFIX_SUBS) {
    if (normalize(working).startsWith(from.toLowerCase())) {
      working = to + working.slice(from.length);
      break;
    }
  }
  for (const [pattern, alternatives] of SUBJECT_SUBS) {
    const candidate = applySubstitution(working, pattern, alternatives, dupIndex);
    if (candidate !== working && !seenTexts.has(normalize(candidate))) return candidate;
  }

  // Last resort: add a unique context note
  const contexts = ["(review)", "(training)", "(audit)", "(inspection)", "(policy update)"];
  const suffix = " " + contexts[dupIndex % contexts.length];
  return text.endsWith(".") ? text.slice(0, -1) + suffix + "." : text + suffix;
}

// ── Main ─────────────────────────────────────────────────────────────────────

const files = readdirSync(dataDir).filter(f => f.startsWith("questions_") && f.endsWith(".json")).sort();
const allQuestions = [];
const fileMap = {}; // filename → array of questions

for (const file of files) {
  const qs = JSON.parse(readFileSync(join(dataDir, file), "utf8"));
  for (const q of qs) q._file = file;
  allQuestions.push(...qs);
  fileMap[file] = qs;
}

console.log(`Loaded ${allQuestions.length} questions from ${files.length} files`);

// Build global seen-texts set (normalized)
const seenTexts = new Set();
const byText = new Map();
for (const q of allQuestions) {
  const key = normalize(q.question_text);
  if (!byText.has(key)) {
    byText.set(key, []);
    seenTexts.add(key); // pre-populate with all first occurrences
  }
  byText.get(key).push(q);
}

const dupGroups = [...byText.entries()].filter(([, qs]) => qs.length > 1);
console.log(`\nDuplicate groups: ${dupGroups.length}`);
console.log(`Questions needing new stems: ${dupGroups.reduce((s, [, qs]) => s + qs.length - 1, 0)}`);

// Sort each group by lesson_id to determine which is the "original"
for (const [, qs] of dupGroups) {
  qs.sort((a, b) => a.lesson_id.localeCompare(b.lesson_id));
}

// Process duplicates
let replaced = 0;
let failed = 0;

for (const [originalStem, qs] of dupGroups) {
  const original = qs[0]; // keep unchanged
  for (let i = 1; i < qs.length; i++) {
    const dup = qs[i];
    const newText = makeUnique(dup.question_text, seenTexts, i);
    if (normalize(newText) === normalize(dup.question_text)) {
      console.warn(`  FAILED to make unique: ${dup.question_id} "${dup.question_text.slice(0, 60)}"`);
      failed++;
      continue;
    }
    seenTexts.add(normalize(newText));
    dup.question_text = newText;
    replaced++;
  }
}

console.log(`\nReplaced: ${replaced}`);
console.log(`Failed:   ${failed}`);

// Write updated question files
for (const [file, qs] of Object.entries(fileMap)) {
  // Remove _file property before saving
  const cleaned = qs.map(({ _file, ...rest }) => rest);
  writeFileSync(join(dataDir, file), JSON.stringify(cleaned, null, 2));
}
console.log(`\nUpdated ${Object.keys(fileMap).length} question files`);

// Verify no duplicates remain
const allQuestions2 = [];
for (const file of files) {
  const qs = JSON.parse(readFileSync(join(dataDir, file), "utf8"));
  allQuestions2.push(...qs);
}
const byText2 = new Map();
for (const q of allQuestions2) {
  const key = normalize(q.question_text);
  if (!byText2.has(key)) byText2.set(key, []);
  byText2.get(key).push(q);
}
const remaining = [...byText2.values()].filter(qs => qs.length > 1);
console.log(`\nVerification: ${remaining.length} duplicate groups remaining`);
if (remaining.length > 0) {
  console.log("Still duplicated:");
  for (const qs of remaining.slice(0, 10)) {
    console.log(`  [×${qs.length}] "${normalize(qs[0].question_text).slice(0, 70)}" → ${qs.map(q=>q.question_id).join(", ")}`);
  }
}

// Bump seed version
const curriculumPath = join(root, "data/vocab/curriculum.json");
const curriculum = JSON.parse(readFileSync(curriculumPath, "utf8"));
const newSeed = "toeic_vocab_tracker_deduped_2026_05_17";
curriculum.seed_version = newSeed;
writeFileSync(curriculumPath, JSON.stringify(curriculum, null, 2));

console.log(`\nseed_version → ${newSeed}`);
console.log("Next: update SEED_VERSION in js/vocab-db.js and tests/helpers/seed-idb.ts");
