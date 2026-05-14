// Rewrite duplicate questions in V1-A lessons 17–19 (P3-1, round 3)
// Run: node scripts/rewrite-dups-v1a-17-19.js

const fs = require("fs");
const path = require("path");
const FILE = path.join(__dirname, "../data/vocab/questions_v1a.json");

const REWRITES = {

  // ── Lesson 17 · item_productive_family ──────────────────────────────────
  "v1_a_17_q_011": {
    question_text: "The new management style significantly boosted team ______.",
    options: { A: "unproductive", B: "productivity", C: "productive", D: "productively" },
    correct_answer: "B",
    explanation_zh: "boosted team ___ 後接抽象名詞。正確答案是 productivity。"
  },
  "v1_a_17_q_012": {
    question_text: "Which definition best describes 'productive' in a TOEIC workplace context?",
    options: {
      A: "generating positive results or good output",
      B: "related to financial loss",
      C: "describing a stressful deadline",
      D: "a method of product distribution"
    },
    correct_answer: "A",
    explanation_zh: "productive 指能產生正面成果或有效率的。正確答案是 A。"
  },
  "v1_a_17_q_013": {
    question_text: "Remote work policies were revised to improve employee ______.",
    options: { A: "productive", B: "productively", C: "unproductive", D: "productivity" },
    correct_answer: "D",
    explanation_zh: "improve employee ___ 後接抽象名詞。正確答案是 productivity。"
  },
  "v1_a_17_q_015": {
    question_text: "Management blamed the renovation delays for the fall in ______.",
    options: { A: "unproductive", B: "productivity", C: "productive", D: "productively" },
    correct_answer: "B",
    explanation_zh: "fall in ___ 後接抽象名詞。正確答案是 productivity。"
  },
  "v1_a_17_q_018": {
    question_text: "The team worked ______ despite the tight deadline.",
    options: { A: "productive", B: "unproductive", C: "productively", D: "productivity" },
    correct_answer: "C",
    explanation_zh: "修飾 worked，要用副詞。正確答案是 productively。"
  },
  "v1_a_17_rv_022": {
    question_text: "The remaining budget was spent ______ on staff training.",
    options: { A: "productive", B: "unproductive", C: "productively", D: "productivity" },
    correct_answer: "C",
    explanation_zh: "修飾 was spent，要用副詞。正確答案是 productively。"
  },
  "v1_a_17_rv_023": {
    question_text: "Flexible hours were introduced to support employee ______.",
    options: { A: "unproductive", B: "productivity", C: "productive", D: "productively" },
    correct_answer: "B",
    explanation_zh: "support employee ___ 需要抽象名詞。正確答案是 productivity。"
  },
  "v1_a_17_rv_024": {
    question_text: "The meeting was considered ______ because no decisions were made.",
    options: { A: "unproductive", B: "productivity", C: "productive", D: "productively" },
    correct_answer: "A",
    explanation_zh: "was considered 後接形容詞，此處表否定評價。正確答案是 unproductive。"
  },

  // ── Lesson 18 · item_competitive_family ─────────────────────────────────
  "v1_a_18_q_011": {
    question_text: "The new product launch intensified ______ in the smartphone market.",
    options: { A: "competition", B: "competitive", C: "competitively", D: "competitiveness" },
    correct_answer: "A",
    explanation_zh: "intensified ___ 後接抽象名詞。正確答案是 competition。"
  },
  "v1_a_18_q_012": {
    question_text: "Which definition best fits 'competitive' in a TOEIC business context?",
    options: {
      A: "focused on cooperation between companies",
      B: "describing a steady decline in sales",
      C: "related to internal office procedures",
      D: "having the ability to compete successfully in a market"
    },
    correct_answer: "D",
    explanation_zh: "competitive 指具備與他人競爭能力的。正確答案是 D。"
  },
  "v1_a_18_q_013": {
    question_text: "The retailer lowered prices to stand out from the ______.",
    options: { A: "competitively", B: "competitiveness", C: "competition", D: "competitive" },
    correct_answer: "C",
    explanation_zh: "stand out from the ___ 後接名詞。正確答案是 competition。"
  },
  "v1_a_18_q_015": {
    question_text: "The brand's success depends on monitoring ______ in the industry.",
    options: { A: "competition", B: "competitive", C: "competitively", D: "competitiveness" },
    correct_answer: "A",
    explanation_zh: "monitoring ___ 後接名詞。正確答案是 competition。"
  },
  "v1_a_18_q_018": {
    question_text: "The retailer priced its products ______ to attract budget-conscious shoppers.",
    options: { A: "competitiveness", B: "competitively", C: "competition", D: "competitive" },
    correct_answer: "B",
    explanation_zh: "修飾 priced，要用副詞。正確答案是 competitively。"
  },
  "v1_a_18_rv_022": {
    question_text: "The software was sold ______ against established industry brands.",
    options: { A: "competitiveness", B: "competitively", C: "competition", D: "competitive" },
    correct_answer: "B",
    explanation_zh: "修飾 was sold，要用副詞。正確答案是 competitively。"
  },
  "v1_a_18_rv_023": {
    question_text: "The firm studied its rivals to better understand the ______ it faced.",
    options: { A: "competition", B: "competitive", C: "competitively", D: "competitiveness" },
    correct_answer: "A",
    explanation_zh: "the ___ it faced 後接名詞。正確答案是 competition。"
  },
  "v1_a_18_rv_024": {
    subskill: "noun_phrase",
    question_text: "The company invested in research to strengthen its ______ in global markets.",
    options: { A: "competition", B: "competitive", C: "competitively", D: "competitiveness" },
    correct_answer: "D",
    explanation_zh: "strengthen its ___ 需要抽象名詞。正確答案是 competitiveness。"
  },

  // ── Lesson 19 · item_profitable_family ──────────────────────────────────
  "v1_a_19_q_011": {
    question_text: "Investors closely monitored the ______ of the new retail division.",
    options: { A: "profitable", B: "profitably", C: "profit", D: "profitability" },
    correct_answer: "D",
    explanation_zh: "monitored the ___ of 後接抽象名詞。正確答案是 profitability。"
  },
  "v1_a_19_q_012": {
    question_text: "Which definition best fits 'profitable' in TOEIC financial English?",
    options: {
      A: "related to budget cuts and cost reduction",
      B: "describing a loss-making investment",
      C: "generating or likely to generate financial gain",
      D: "used only in government financial reports"
    },
    correct_answer: "C",
    explanation_zh: "profitable 指能產生財務收益的。正確答案是 C。"
  },
  "v1_a_19_q_013": {
    question_text: "The restructuring plan aimed to restore long-term ______.",
    options: { A: "profit", B: "profitability", C: "profitable", D: "profitably" },
    correct_answer: "B",
    explanation_zh: "restore long-term ___ 後接抽象名詞。正確答案是 profitability。"
  },
  "v1_a_19_q_015": {
    question_text: "The CEO's speech focused on improving the overall ______ of each division.",
    options: { A: "profitable", B: "profitably", C: "profit", D: "profitability" },
    correct_answer: "D",
    explanation_zh: "improving the overall ___ of 後接抽象名詞。正確答案是 profitability。"
  },
  "v1_a_19_q_018": {
    question_text: "The company operated ______ for the third consecutive quarter.",
    options: { A: "profitably", B: "profitability", C: "profitable", D: "profit" },
    correct_answer: "A",
    explanation_zh: "修飾 operated，要用副詞。正確答案是 profitably。"
  },
  "v1_a_19_rv_022": {
    question_text: "The franchise was run ______ under the new management team.",
    options: { A: "profitably", B: "profitability", C: "profitable", D: "profit" },
    correct_answer: "A",
    explanation_zh: "修飾 was run，要用副詞。正確答案是 profitably。"
  },
  "v1_a_19_rv_023": {
    question_text: "The analyst questioned the long-term ______ of the expansion strategy.",
    options: { A: "profitable", B: "profitably", C: "profit", D: "profitability" },
    correct_answer: "D",
    explanation_zh: "questioned the long-term ___ of 需要抽象名詞。正確答案是 profitability。"
  },
  "v1_a_19_rv_024": {
    subskill: "noun_in_context",
    question_text: "The company reported a net ______ of $2 million for the quarter.",
    options: { A: "profitable", B: "profitably", C: "profit", D: "profitability" },
    correct_answer: "C",
    explanation_zh: "a net ___ of 後接可量化名詞。正確答案是 profit。"
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
