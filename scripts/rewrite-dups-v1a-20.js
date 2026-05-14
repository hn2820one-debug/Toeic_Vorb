// Rewrite duplicate questions in V1-A lesson 20 (P3-1, round 4 — finishes V1-A)
// Run: node scripts/rewrite-dups-v1a-20.js

const fs = require("fs");
const path = require("path");
const FILE = path.join(__dirname, "../data/vocab/questions_v1a.json");

const REWRITES = {

  // ── Lesson 20 · item_secure_family ──────────────────────────────────────
  "v1_a_20_q_011": {
    question_text: "The building's ______ system was upgraded to prevent unauthorized access.",
    options: { A: "securely", B: "insecure", C: "security", D: "secure" },
    correct_answer: "C",
    explanation_zh: "building's ___ system 需要名詞修飾。正確答案是 security。"
  },
  "v1_a_20_q_012": {
    question_text: "Which definition best fits 'secure' in a TOEIC business context?",
    options: {
      A: "easily accessible to everyone",
      B: "safe, protected, or free from risk",
      C: "related to digital file formats",
      D: "a type of management contract"
    },
    correct_answer: "B",
    explanation_zh: "secure 指安全、受保護或無風險的。正確答案是 B。"
  },
  "v1_a_20_q_013": {
    question_text: "The company invested heavily in cybersecurity and network ______.",
    options: { A: "security", B: "secure", C: "securely", D: "insecure" },
    correct_answer: "A",
    explanation_zh: "network ___ 後接名詞。正確答案是 security。"
  },
  "v1_a_20_q_015": {
    question_text: "The manager reviewed the ______ protocols before the annual inspection.",
    options: { A: "securely", B: "insecure", C: "security", D: "secure" },
    correct_answer: "C",
    explanation_zh: "the ___ protocols 需要名詞修飾。正確答案是 security。"
  },
  "v1_a_20_q_018": {
    question_text: "The confidential files were stored ______ in the main server room.",
    options: { A: "security", B: "secure", C: "insecure", D: "securely" },
    correct_answer: "D",
    explanation_zh: "修飾 were stored，要用副詞。正確答案是 securely。"
  },
  "v1_a_20_rv_022": {
    question_text: "All visitor passes were fastened ______ to employees' badge lanyards.",
    options: { A: "security", B: "secure", C: "insecure", D: "securely" },
    correct_answer: "D",
    explanation_zh: "修飾 were fastened，要用副詞。正確答案是 securely。"
  },
  "v1_a_20_rv_023": {
    question_text: "Passengers were reminded to report any concerns to ______ staff.",
    options: { A: "securely", B: "insecure", C: "security", D: "secure" },
    correct_answer: "C",
    explanation_zh: "___ staff 需要名詞修飾。正確答案是 security。"
  },
  "v1_a_20_rv_024": {
    question_text: "The old password policy left the network ______ against external threats.",
    options: { A: "securely", B: "insecure", C: "security", D: "secure" },
    correct_answer: "B",
    explanation_zh: "left the network ___ 後接形容詞表負面狀態。正確答案是 insecure。"
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
