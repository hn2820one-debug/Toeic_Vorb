/**
 * Two targeted fixes in questions_v1a.json:
 *
 * 1. 30 speed_drill questions have default_error_code="WORD_FAMILY_POS" — must be "TIME_PRESSURE".
 *    These are timed-response drills; the wrong code pollutes Error Review analysis.
 *
 * 2. 2 meaning_choice questions have the correct answer 32–37 chars longer than the next-longest
 *    option, making "pick the longest" a reliable strategy.
 *    Fix: shorten the correct definition and lengthen the three distractors so all four options
 *    are within ~15 chars of each other.
 */

const fs = require("fs");
const path = require("path");

const filePath = path.resolve(__dirname, "../data/vocab/questions_v1a.json");

const MC_PATCHES = {
  "v1_a_12_q_012": {
    options: {
      A: "a formal rule that controls how work is done",
      B: "achieving results without wasting time or effort",
      C: "a method for allocating the department budget",
      D: "a system for tracking management performance",
    },
    correct_answer: "B",
  },
  "v1_a_16_q_012": {
    options: {
      A: "a tendency to adjust plans based on changing needs",
      B: "being consistently dependable and working as expected",
      C: "a scheduled review of a company's financial records",
      D: "a legal compliance standard required of all suppliers",
    },
    correct_answer: "B",
  },
};

const questions = JSON.parse(fs.readFileSync(filePath, "utf8"));
let speedFixed = 0;
let mcFixed = 0;

const updated = questions.map((q) => {
  // Fix 1: speed_drill error code
  if (q.type === "speed_drill" && q.default_error_code === "WORD_FAMILY_POS") {
    speedFixed++;
    return { ...q, default_error_code: "TIME_PRESSURE" };
  }

  // Fix 2: meaning_choice option balance
  const patch = MC_PATCHES[q.question_id];
  if (patch) {
    mcFixed++;
    return { ...q, options: patch.options, correct_answer: patch.correct_answer };
  }

  return q;
});

fs.writeFileSync(filePath, JSON.stringify(updated, null, 2) + "\n", "utf8");
console.log(`speed_drill error_code fixed: ${speedFixed}`);
console.log(`meaning_choice options balanced: ${mcFixed}`);

// Verify the MC fix
console.log("\nVerification — fixed meaning_choice options:");
Object.keys(MC_PATCHES).forEach((id) => {
  const q = updated.find((q) => q.question_id === id);
  const lens = Object.entries(q.options).map(([k, v]) => `${k}(${v.length})`);
  const correct = q.options[q.correct_answer];
  const others = Object.entries(q.options).filter(([k]) => k !== q.correct_answer).map(([, v]) => v.length);
  const edge = correct.length - Math.max(...others);
  console.log(`  ${id}: ${lens.join(", ")} | correct="${correct}" edge=${edge}`);
});
