// Rewrite duplicate questions in V1-A lessons 14–16 (P3-1, round 2)
// Run: node scripts/rewrite-dups-v1a-14-16.js

const fs = require("fs");
const path = require("path");
const FILE = path.join(__dirname, "../data/vocab/questions_v1a.json");

const REWRITES = {

  // ── Lesson 14 · item_available_family ───────────────────────────────────
  "v1_a_14_q_011": {
    question_text: "The team confirmed the ______ of the conference room for Monday.",
    options: { A: "availability", B: "available", C: "unavailable", D: "availably" },
    correct_answer: "A",
    explanation_zh: "confirmed the ___ of 後接抽象名詞。正確答案是 availability。"
  },
  "v1_a_14_q_012": {
    question_text: "Which definition best captures 'availability' in a scheduling context?",
    options: {
      A: "the speed at which tasks are completed",
      B: "a measure of company revenue",
      C: "a formal approval process",
      D: "the state of being ready or accessible for use"
    },
    correct_answer: "D",
    explanation_zh: "availability 指可被使用或獲取的狀態。正確答案是 D。"
  },
  "v1_a_14_q_013": {
    question_text: "The app displays real-time ______ of meeting rooms in the building.",
    options: { A: "unavailable", B: "availably", C: "availability", D: "available" },
    correct_answer: "C",
    explanation_zh: "real-time ___ of 後接抽象名詞。正確答案是 availability。"
  },
  "v1_a_14_q_015": {
    question_text: "The contractor confirmed the ______ of materials before starting work.",
    options: { A: "availability", B: "available", C: "unavailable", D: "availably" },
    correct_answer: "A",
    explanation_zh: "confirmed the ___ of 需要抽象名詞。正確答案是 availability。"
  },
  "v1_a_14_q_018": {
    subskill: "adjective_after_linking_verb",
    question_text: "The requested product was ______ at the regional warehouse.",
    options: { A: "availably", B: "unavailable", C: "availability", D: "available" },
    correct_answer: "B",
    explanation_zh: "was 後接形容詞描述主詞狀態。正確答案是 unavailable。"
  },
  "v1_a_14_rv_022": {
    subskill: "adjective_after_linking_verb",
    question_text: "The requested documents were ______ at the time of the audit.",
    options: { A: "availably", B: "unavailable", C: "availability", D: "available" },
    correct_answer: "B",
    explanation_zh: "were 後接形容詞表示狀態。正確答案是 unavailable。"
  },
  "v1_a_14_rv_023": {
    question_text: "Customers can check the ______ of products on the company website.",
    options: { A: "availability", B: "available", C: "unavailable", D: "availably" },
    correct_answer: "A",
    explanation_zh: "check the ___ of 需要抽象名詞。正確答案是 availability。"
  },
  "v1_a_14_rv_024": {
    question_text: "The keynote speaker was ______ on the scheduled date due to illness.",
    options: { A: "availability", B: "available", C: "unavailable", D: "availably" },
    correct_answer: "C",
    explanation_zh: "句意表示無法出席，要用否定形容詞。正確答案是 unavailable。"
  },

  // ── Lesson 15 · item_successful_family ──────────────────────────────────
  "v1_a_15_q_011": {
    question_text: "The launch marked a major ______ for the product development team.",
    options: { A: "successful", B: "successfully", C: "unsuccessful", D: "success" },
    correct_answer: "D",
    explanation_zh: "a major ___ 後接名詞。正確答案是 success。"
  },
  "v1_a_15_q_012": {
    question_text: "Which definition best fits 'successful' in a TOEIC business context?",
    options: {
      A: "related to failed business negotiations",
      B: "a method of financial reporting",
      C: "achieving a desired outcome or goal",
      D: "used only in informal communication"
    },
    correct_answer: "C",
    explanation_zh: "successful 指達成預期目標的。正確答案是 C。"
  },
  "v1_a_15_q_013": {
    question_text: "The campaign was celebrated as a ______ by the entire marketing team.",
    options: { A: "unsuccessful", B: "success", C: "successful", D: "successfully" },
    correct_answer: "B",
    explanation_zh: "a ___ 後接名詞。正確答案是 success。"
  },
  "v1_a_15_q_015": {
    question_text: "The merger depends on the ______ of the integration plan.",
    options: { A: "successful", B: "successfully", C: "unsuccessful", D: "success" },
    correct_answer: "D",
    explanation_zh: "depends on the ___ of 需要抽象名詞。正確答案是 success。"
  },
  "v1_a_15_q_018": {
    question_text: "The project was completed ______ within the allocated budget.",
    options: { A: "successfully", B: "success", C: "successful", D: "unsuccessful" },
    correct_answer: "A",
    explanation_zh: "修飾 was completed，要用副詞。正確答案是 successfully。"
  },
  "v1_a_15_rv_022": {
    question_text: "The proposal was presented ______ to the board last Friday.",
    options: { A: "successfully", B: "success", C: "successful", D: "unsuccessful" },
    correct_answer: "A",
    explanation_zh: "修飾 was presented，要用副詞。正確答案是 successfully。"
  },
  "v1_a_15_rv_023": {
    question_text: "The trainer attributed the team's ______ to strong communication skills.",
    options: { A: "successful", B: "successfully", C: "unsuccessful", D: "success" },
    correct_answer: "D",
    explanation_zh: "the team's ___ 需要名詞。正確答案是 success。"
  },
  "v1_a_15_rv_024": {
    question_text: "The first version of the app proved ______ in the test market.",
    options: { A: "successful", B: "successfully", C: "unsuccessful", D: "success" },
    correct_answer: "C",
    explanation_zh: "proved 後接形容詞，此處表負面結果。正確答案是 unsuccessful。"
  },

  // ── Lesson 16 · item_reliable_family ────────────────────────────────────
  "v1_a_16_q_011": {
    question_text: "Customers value the ______ of this brand above all other factors.",
    options: { A: "reliably", B: "unreliable", C: "reliability", D: "reliable" },
    correct_answer: "C",
    explanation_zh: "value the ___ of 後接抽象名詞。正確答案是 reliability。"
  },
  "v1_a_16_q_012": {
    question_text: "Which definition best fits 'reliability' in a business context?",
    options: {
      A: "a tendency to change plans frequently",
      B: "the quality of consistently working as expected and being trustworthy",
      C: "a type of financial audit",
      D: "a legal requirement for suppliers"
    },
    correct_answer: "B",
    explanation_zh: "reliability 指持續可信、穩定運作的品質。正確答案是 B。"
  },
  "v1_a_16_q_013": {
    question_text: "Long-term contracts are built on the ______ of the service provider.",
    options: { A: "reliability", B: "reliable", C: "reliably", D: "unreliable" },
    correct_answer: "A",
    explanation_zh: "built on the ___ of 後接抽象名詞。正確答案是 reliability。"
  },
  "v1_a_16_q_015": {
    question_text: "The client expressed concerns about the ______ of the new supplier.",
    options: { A: "reliably", B: "unreliable", C: "reliability", D: "reliable" },
    correct_answer: "C",
    explanation_zh: "about the ___ of 需要抽象名詞。正確答案是 reliability。"
  },
  "v1_a_16_q_018": {
    question_text: "The server has performed ______ since the hardware upgrade.",
    options: { A: "reliability", B: "reliable", C: "unreliable", D: "reliably" },
    correct_answer: "D",
    explanation_zh: "修飾 has performed，要用副詞。正確答案是 reliably。"
  },
  "v1_a_16_rv_022": {
    question_text: "The equipment has been maintained ______ by the facilities team.",
    options: { A: "reliability", B: "reliable", C: "unreliable", D: "reliably" },
    correct_answer: "D",
    explanation_zh: "修飾 has been maintained，要用副詞。正確答案是 reliably。"
  },
  "v1_a_16_rv_023": {
    question_text: "The survey measured the ______ of public transportation services.",
    options: { A: "reliably", B: "unreliable", C: "reliability", D: "reliable" },
    correct_answer: "C",
    explanation_zh: "measured the ___ of 需要抽象名詞。正確答案是 reliability。"
  },
  "v1_a_16_rv_024": {
    question_text: "Customer complaints increased after the system became ______ during peak hours.",
    options: { A: "reliably", B: "unreliable", C: "reliability", D: "reliable" },
    correct_answer: "B",
    explanation_zh: "became 後接形容詞表負面狀態。正確答案是 unreliable。"
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
