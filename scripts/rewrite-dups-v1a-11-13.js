// Rewrite duplicate questions in V1-A lessons 11–13 (P3-1, round 1)
// Run: node scripts/rewrite-dups-v1a-11-13.js
// Each replacement keeps: question_id, lesson_id, stage, target_item_id,
// type, subskill, difficulty, estimated_time_seconds, default_error_code, tags, grammar_link_id
// Only question_text, options, correct_answer, explanation_zh change.

const fs = require("fs");
const path = require("path");
const FILE = path.join(__dirname, "../data/vocab/questions_v1a.json");

// Map: question_id → { question_text, options, correct_answer, explanation_zh }
const REWRITES = {

  // ── Lesson 11 · item_accurate_family ────────────────────────────────────
  "v1_a_11_q_011": {
    question_text: "The client praised the ______ of the financial report.",
    options: { A: "accurate", B: "accurately", C: "inaccuracy", D: "accuracy" },
    correct_answer: "D",
    explanation_zh: "the ___ of 結構後接抽象名詞。正確答案是 accuracy。"
  },
  "v1_a_11_q_012": {
    question_text: "Which definition best fits 'accuracy' as used in a TOEIC business context?",
    options: {
      A: "the ability to work independently",
      B: "speed in completing a task",
      C: "the quality of being correct and without errors",
      D: "a formal complaint about service"
    },
    correct_answer: "C",
    explanation_zh: "accuracy 指資料或結果正確無誤的品質。正確答案是 C。"
  },
  "v1_a_11_q_013": {
    question_text: "Staff training focused on ensuring the ______ of inventory records.",
    options: { A: "inaccuracy", B: "accuracy", C: "accurate", D: "accurately" },
    correct_answer: "B",
    explanation_zh: "ensuring the ___ of 後接抽象名詞。正確答案是 accuracy。"
  },
  "v1_a_11_q_015": {
    question_text: "The CEO stressed the importance of ______ in all client communications.",
    options: { A: "accurate", B: "accurately", C: "inaccuracy", D: "accuracy" },
    correct_answer: "D",
    explanation_zh: "importance of + 抽象名詞結構。正確答案是 accuracy。"
  },
  "v1_a_11_q_018": {
    question_text: "The shipment weights were recorded ______ in the warehouse system.",
    options: { A: "accurately", B: "accuracy", C: "accurate", D: "inaccuracy" },
    correct_answer: "A",
    explanation_zh: "修飾 were recorded，要用副詞。正確答案是 accurately。"
  },
  "v1_a_11_rv_022": {
    question_text: "The new safety procedures were followed ______ by all workers.",
    options: { A: "accurately", B: "accuracy", C: "accurate", D: "inaccuracy" },
    correct_answer: "A",
    explanation_zh: "修飾 were followed，要用副詞。正確答案是 accurately。"
  },
  "v1_a_11_rv_023": {
    question_text: "The manual emphasizes the ______ of measurement in quality control.",
    options: { A: "accurate", B: "accurately", C: "inaccuracy", D: "accuracy" },
    correct_answer: "D",
    explanation_zh: "emphasizes the ___ of 需要抽象名詞。正確答案是 accuracy。"
  },
  "v1_a_11_rv_024": {
    question_text: "The report contained a significant ______ that misled stakeholders.",
    options: { A: "accurate", B: "accurately", C: "inaccuracy", D: "accuracy" },
    correct_answer: "C",
    explanation_zh: "句意指報告中的錯誤，要用否定名詞。正確答案是 inaccuracy。"
  },

  // ── Lesson 12 · item_efficient_family ───────────────────────────────────
  "v1_a_12_q_011": {
    question_text: "The audit exposed the ______ of the current billing process.",
    options: { A: "efficiently", B: "inefficiency", C: "efficiency", D: "efficient" },
    correct_answer: "C",
    explanation_zh: "the ___ of 結構後接抽象名詞。正確答案是 efficiency。"
  },
  "v1_a_12_q_012": {
    question_text: "What does 'efficiency' mean in a TOEIC workplace setting?",
    options: {
      A: "a rigid company policy",
      B: "the ability to achieve results without wasting time or resources",
      C: "a budget allocation method",
      D: "a type of management report"
    },
    correct_answer: "B",
    explanation_zh: "efficiency 指以最少資源達成目標的能力。正確答案是 B。"
  },
  "v1_a_12_q_013": {
    question_text: "The new software was designed to boost production ______.",
    options: { A: "efficiency", B: "efficient", C: "inefficiency", D: "efficiently" },
    correct_answer: "A",
    explanation_zh: "boost production ___ 後接抽象名詞。正確答案是 efficiency。"
  },
  "v1_a_12_q_015": {
    question_text: "Management focused on improving the overall ______ of the supply chain.",
    options: { A: "efficient", B: "efficiently", C: "efficiency", D: "inefficiency" },
    correct_answer: "C",
    explanation_zh: "improving the overall ___ of 接抽象名詞。正確答案是 efficiency。"
  },
  "v1_a_12_q_018": {
    question_text: "The warehouse staff packed the orders ______ to meet the deadline.",
    options: { A: "efficiency", B: "efficient", C: "inefficiency", D: "efficiently" },
    correct_answer: "D",
    explanation_zh: "修飾 packed，要用副詞。正確答案是 efficiently。"
  },
  "v1_a_12_rv_022": {
    question_text: "Resources were allocated ______ across all project teams.",
    options: { A: "efficiency", B: "efficient", C: "inefficiency", D: "efficiently" },
    correct_answer: "D",
    explanation_zh: "修飾 were allocated，要用副詞。正確答案是 efficiently。"
  },
  "v1_a_12_rv_023": {
    question_text: "The director praised the ______ of the new scheduling system.",
    options: { A: "efficient", B: "efficiently", C: "efficiency", D: "inefficiency" },
    correct_answer: "C",
    explanation_zh: "praised the ___ of 需要抽象名詞。正確答案是 efficiency。"
  },
  "v1_a_12_rv_024": {
    question_text: "The report identified a serious ______ in the approval workflow.",
    options: { A: "efficient", B: "inefficiency", C: "efficiently", D: "efficiency" },
    correct_answer: "B",
    explanation_zh: "句意指工作流程中的低效問題，要用否定名詞。正確答案是 inefficiency。"
  },

  // ── Lesson 13 · item_responsible_family ─────────────────────────────────
  "v1_a_13_q_011": {
    question_text: "The audit highlighted the ______ of each team leader.",
    options: { A: "responsible", B: "responsibility", C: "irresponsibility", D: "responsibly" },
    correct_answer: "B",
    explanation_zh: "the ___ of 結構後接抽象名詞。正確答案是 responsibility。"
  },
  "v1_a_13_q_012": {
    question_text: "What does 'responsibility' mean in a TOEIC management context?",
    options: {
      A: "a duty or obligation to handle a task or situation",
      B: "a type of formal business contract",
      C: "a quick decision made without authorization",
      D: "a benefit package offered to employees"
    },
    correct_answer: "A",
    explanation_zh: "responsibility 指對某項工作或事務負責的義務。正確答案是 A。"
  },
  "v1_a_13_q_013": {
    question_text: "The new hire quickly understood the ______ that came with the role.",
    options: { A: "responsible", B: "responsibly", C: "irresponsibility", D: "responsibility" },
    correct_answer: "D",
    explanation_zh: "came with the role 後接抽象名詞。正確答案是 responsibility。"
  },
  "v1_a_13_q_015": {
    question_text: "The team accepted ______ for the delayed shipment.",
    options: { A: "responsible", B: "responsibility", C: "irresponsibility", D: "responsibly" },
    correct_answer: "B",
    explanation_zh: "accepted ___ for 後接抽象名詞。正確答案是 responsibility。"
  },
  "v1_a_13_q_018": {
    question_text: "The company is expected to handle client data ______.",
    options: { A: "responsibility", B: "responsible", C: "responsibly", D: "irresponsibility" },
    correct_answer: "C",
    explanation_zh: "修飾 handle，要用副詞。正確答案是 responsibly。"
  },
  "v1_a_13_rv_022": {
    question_text: "The environmental policy requires waste to be disposed of ______.",
    options: { A: "responsibility", B: "responsible", C: "responsibly", D: "irresponsibility" },
    correct_answer: "C",
    explanation_zh: "修飾 be disposed of，要用副詞。正確答案是 responsibly。"
  },
  "v1_a_13_rv_023": {
    question_text: "Accepting ______ for one's actions is a sign of professionalism.",
    options: { A: "responsible", B: "responsibility", C: "irresponsibility", D: "responsibly" },
    correct_answer: "B",
    explanation_zh: "Accepting ___ for 後接抽象名詞。正確答案是 responsibility。"
  },
  "v1_a_13_rv_024": {
    question_text: "The chairman criticized the ______ shown in the handling of complaints.",
    options: { A: "irresponsibility", B: "responsible", C: "responsibly", D: "responsibility" },
    correct_answer: "A",
    explanation_zh: "句意指處理投訴時的不負責任態度，要用否定名詞。正確答案是 irresponsibility。"
  }
};

const questions = JSON.parse(fs.readFileSync(FILE, "utf8"));
let count = 0;

const updated = questions.map((q) => {
  const patch = REWRITES[q.question_id];
  if (!patch) return q;
  count++;
  return { ...q, ...patch };
});

fs.writeFileSync(FILE, JSON.stringify(updated, null, 2), "utf8");
console.log(`Rewrote ${count} questions in questions_v1a.json`);
