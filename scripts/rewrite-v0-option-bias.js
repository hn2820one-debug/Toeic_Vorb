/**
 * Fix V0 option-length bias for meaning_choice, review_question, and false_friend types.
 * Replaces single-word distractors with short phrase definitions of other V0 words,
 * so all 4 options have comparable length and learners can't guess by length alone.
 */

const fs = require("fs");
const path = require("path");

const filePath = path.resolve(__dirname, "../data/vocab/questions_v0.json");

// Short phrase definitions for each V0 word used as distractors.
// Kept to 4–7 words to match the length of the correct-answer phrases.
const WORD_DEFS = {
  budget:      "a plan for spending money",
  conference:  "a formal meeting for discussion",
  deadline:    "the last date to finish a task",
  estimate:    "an approximate calculated figure",
  invoice:     "a bill requesting payment",
  maintenance: "keeping equipment in working order",
  recruitment: "the process of hiring staff",
  refund:      "money returned to a customer",
  reservation: "a booking to hold a spot",
  schedule:    "a plan showing times and dates",
  shipment:    "goods sent to a buyer",
  venue:       "a place where events are held",
  warranty:    "a guarantee to fix a product",
};

// Which 3 words to use as distractors for each target word.
// Each list picks semantically distant words of similar syllable count.
const DISTRACTORS_FOR = {
  budget:      ["invoice",      "schedule",     "refund"],
  conference:  ["venue",        "reservation",  "maintenance"],
  deadline:    ["schedule",     "estimate",     "invoice"],
  estimate:    ["invoice",      "budget",       "deadline"],
  invoice:     ["refund",       "estimate",     "warranty"],
  maintenance: ["recruitment",  "reservation",  "shipment"],
  recruitment: ["maintenance",  "conference",   "deadline"],
  refund:      ["invoice",      "warranty",     "budget"],
  reservation: ["venue",        "schedule",     "refund"],
  shipment:    ["invoice",      "refund",       "venue"],
  venue:       ["conference",   "reservation",  "schedule"],
  warranty:    ["refund",       "maintenance",  "invoice"],
};

// false_friend "actual": replace single-word wrong options with short phrases
const FALSE_FRIEND_WRONG = [
  "happening at this time",
  "likely in the near future",
  "proper and official",
];

function extractWord(questionText) {
  const m = String(questionText || "").match(/"([^"]+)"/);
  return m ? m[1] : null;
}

function rewrite(q) {
  const { type, question_text, correct_answer, options } = q;

  if (type === "meaning_choice" || type === "review_question") {
    const word = extractWord(question_text);
    if (!word || !DISTRACTORS_FOR[word]) return q;
    const distractorDefs = DISTRACTORS_FOR[word].map((w) => WORD_DEFS[w]);
    const wrongKeys = Object.keys(options).filter((k) => k !== correct_answer);
    const newOptions = { ...options };
    wrongKeys.forEach((key, i) => { newOptions[key] = distractorDefs[i]; });
    return { ...q, options: newOptions };
  }

  if (type === "false_friend") {
    const word = extractWord(question_text);
    if (word !== "actual") return q;
    const wrongKeys = Object.keys(options).filter((k) => k !== correct_answer);
    const newOptions = { ...options };
    wrongKeys.forEach((key, i) => { newOptions[key] = FALSE_FRIEND_WRONG[i]; });
    return { ...q, options: newOptions };
  }

  return q;
}

const questions = JSON.parse(fs.readFileSync(filePath, "utf8"));
let count = 0;
const updated = questions.map((q) => {
  const nq = rewrite(q);
  if (JSON.stringify(nq.options) !== JSON.stringify(q.options)) count++;
  return nq;
});

fs.writeFileSync(filePath, JSON.stringify(updated, null, 2) + "\n", "utf8");
console.log(`Fixed ${count} questions in questions_v0.json`);
console.log("Remember to bump SEED_VERSION after verifying.");
