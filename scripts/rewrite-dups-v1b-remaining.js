// Rewrite remaining V1-B duplicate questions (positions q_005–q_014) (P3-1, round 6)
// Run: node scripts/rewrite-dups-v1b-remaining.js

const fs = require("fs");
const path = require("path");
const FILE = path.join(__dirname, "../data/vocab/questions_v1b.json");

const REWRITES = {

  // ── Lesson 21 · qualify_family ───────────────────────────────────────────
  "v1_b_21_q_007": {
    question_text: "All workers must hold a valid safety ______ to enter the construction site.",
    options: { A: "qualifying", B: "qualification", C: "qualify", D: "qualified" },
    correct_answer: "B",
    explanation_zh: "hold a valid ___ 後接名詞。正確答案是 qualification。"
  },
  "v1_b_21_q_008": {
    question_text: "Each candidate's educational ______ was listed clearly on the application form.",
    options: { A: "qualification", B: "qualify", C: "qualified", D: "qualifying" },
    correct_answer: "A",
    explanation_zh: "educational ___ 後接名詞。正確答案是 qualification。"
  },
  "v1_b_21_q_009": {
    question_text: "The committee set a new ______ standard for all overseas job applicants.",
    options: { A: "qualify", B: "qualified", C: "qualifying", D: "qualification" },
    correct_answer: "D",
    explanation_zh: "a new ___ standard 後接名詞。正確答案是 qualification。"
  },

  // ── Lesson 22 · employ_family ────────────────────────────────────────────
  "v1_b_22_q_005": {
    question_text: "The new regulation sets minimum conditions for ______ in private companies.",
    options: { A: "employer", B: "employ", C: "employment", D: "employee" },
    correct_answer: "C",
    explanation_zh: "conditions for ___ 後接抽象名詞。正確答案是 employment。"
  },
  "v1_b_22_q_006": {
    question_text: "The center assists job seekers in finding and securing stable ______.",
    options: { A: "employ", B: "employment", C: "employee", D: "employer" },
    correct_answer: "B",
    explanation_zh: "securing stable ___ 後接抽象名詞。正確答案是 employment。"
  },
  "v1_b_22_q_008": {
    question_text: "The government launched a new initiative to boost youth ______ nationally.",
    options: { A: "employee", B: "employer", C: "employ", D: "employment" },
    correct_answer: "D",
    explanation_zh: "boost youth ___ 後接抽象名詞。正確答案是 employment。"
  },
  "v1_b_22_q_014": {
    question_text: "All forms of self-______ must be declared on the annual tax return.",
    options: { A: "employ", B: "employment", C: "employee", D: "employer" },
    correct_answer: "B",
    explanation_zh: "self-___ 複合詞後接名詞。正確答案是 employment。"
  },

  // ── Lesson 23 · apply_family ─────────────────────────────────────────────
  "v1_b_23_q_006": {
    question_text: "The scholarship ______ must be submitted before the end of the month.",
    options: { A: "application", B: "applicant", C: "apply", D: "applicable" },
    correct_answer: "A",
    explanation_zh: "The scholarship ___ 後接名詞。正確答案是 application。"
  },
  "v1_b_23_q_008": {
    question_text: "Successful candidates are contacted after reviewing each ______ carefully.",
    options: { A: "apply", B: "applicable", C: "application", D: "applicant" },
    correct_answer: "C",
    explanation_zh: "reviewing each ___ 後接名詞。正確答案是 application。"
  },
  "v1_b_23_q_009": {
    question_text: "The manager evaluated each ______ carefully and shortlisted the top five.",
    options: { A: "applicable", B: "application", C: "applicant", D: "apply" },
    correct_answer: "B",
    explanation_zh: "evaluated each ___ 後接名詞。正確答案是 application。"
  },
  "v1_b_23_q_014": {
    question_text: "The ______ pack required a resume, a cover letter, and two references.",
    options: { A: "application", B: "applicant", C: "apply", D: "applicable" },
    correct_answer: "A",
    explanation_zh: "The ___ pack 名詞修飾。正確答案是 application。"
  },

  // ── Lesson 24 · promote_family ───────────────────────────────────────────
  "v1_b_24_q_007": {
    question_text: "An exciting ______ was launched to raise awareness of the new product line.",
    options: { A: "promotional", B: "promoting", C: "promotion", D: "promote" },
    correct_answer: "C",
    explanation_zh: "An exciting ___ 後接名詞。正確答案是 promotion。"
  },
  "v1_b_24_q_008": {
    question_text: "The staff member was informed of her ______ to head of department.",
    options: { A: "promoting", B: "promotion", C: "promote", D: "promotional" },
    correct_answer: "B",
    explanation_zh: "her ___ to 後接名詞。正確答案是 promotion。"
  },
  "v1_b_24_q_009": {
    question_text: "The limited-time ______ offered all customers a thirty percent discount.",
    options: { A: "promotion", B: "promote", C: "promotional", D: "promoting" },
    correct_answer: "A",
    explanation_zh: "The limited-time ___ 後接名詞。正確答案是 promotion。"
  },

  // ── Lesson 25 · assess_family ────────────────────────────────────────────
  "v1_b_25_q_005": {
    question_text: "The results of the financial ______ were discussed at the board meeting.",
    options: { A: "assess", B: "assessed", C: "assessing", D: "assessment" },
    correct_answer: "D",
    explanation_zh: "the financial ___ 後接名詞。正確答案是 assessment。"
  },
  "v1_b_25_q_008": {
    question_text: "The annual risk ______ highlighted several areas needing immediate improvement.",
    options: { A: "assessment", B: "assess", C: "assessed", D: "assessing" },
    correct_answer: "A",
    explanation_zh: "The annual risk ___ 後接名詞。正確答案是 assessment。"
  },

  // ── Lesson 26 · recruit_family ───────────────────────────────────────────
  "v1_b_26_q_005": {
    question_text: "The new platform streamlined ______ by automating the initial screening step.",
    options: { A: "recruiter", B: "recruition", C: "recruitment", D: "recruit" },
    correct_answer: "C",
    explanation_zh: "streamlined ___ 後接名詞。正確答案是 recruitment。"
  },
  "v1_b_26_q_006": {
    question_text: "The agency's ______ fees are paid by the hiring company, not the candidate.",
    options: { A: "recruition", B: "recruitment", C: "recruit", D: "recruiter" },
    correct_answer: "B",
    explanation_zh: "agency's ___ fees 名詞修飾。正確答案是 recruitment。"
  },
  "v1_b_26_q_008": {
    question_text: "The company announced a major ______ effort to expand its engineering division.",
    options: { A: "recruit", B: "recruiter", C: "recruition", D: "recruitment" },
    correct_answer: "D",
    explanation_zh: "a major ___ effort 後接名詞。正確答案是 recruitment。"
  },
  "v1_b_26_q_009": {
    question_text: "The annual job fair served as a key ______ opportunity for local companies.",
    options: { A: "recruiter", B: "recruition", C: "recruitment", D: "recruit" },
    correct_answer: "C",
    explanation_zh: "a key ___ opportunity 後接名詞。正確答案是 recruitment。"
  },
  "v1_b_26_q_014": {
    question_text: "Managers attended a seminar on modern ______ practices and talent strategies.",
    options: { A: "recruition", B: "recruitment", C: "recruit", D: "recruiter" },
    correct_answer: "B",
    explanation_zh: "modern ___ practices 名詞修飾。正確答案是 recruitment。"
  },

  // ── Lesson 27 · train_family ─────────────────────────────────────────────
  "v1_b_27_q_005": {
    question_text: "The division invested in leadership ______ for all department heads.",
    options: { A: "trained", B: "training", C: "trainer", D: "train" },
    correct_answer: "B",
    explanation_zh: "leadership ___ 後接名詞。正確答案是 training。"
  },
  "v1_b_27_q_006": {
    question_text: "Staff were given ______ on how to use the new digital invoice system.",
    options: { A: "training", B: "trainer", C: "train", D: "trained" },
    correct_answer: "A",
    explanation_zh: "given ___ on 後接名詞。正確答案是 training。"
  },
  "v1_b_27_q_008": {
    question_text: "The updated ______ schedule was posted on the company intranet yesterday.",
    options: { A: "train", B: "trained", C: "training", D: "trainer" },
    correct_answer: "C",
    explanation_zh: "The updated ___ schedule 名詞修飾。正確答案是 training。"
  },
  "v1_b_27_q_014": {
    question_text: "Completion of the online ______ module is mandatory for all new recruits.",
    options: { A: "training", B: "trainer", C: "train", D: "trained" },
    correct_answer: "A",
    explanation_zh: "the ___ module 後接名詞。正確答案是 training。"
  },

  // ── Lesson 28 · certify_family ───────────────────────────────────────────
  "v1_b_28_q_007": {
    question_text: "A food safety ______ is required for all commercial kitchen operations.",
    options: { A: "certified", B: "certifying", C: "certification", D: "certify" },
    correct_answer: "C",
    explanation_zh: "A food safety ___ 後接名詞。正確答案是 certification。"
  },
  "v1_b_28_q_008": {
    question_text: "The manufacturer needed a quality ______ before selling products overseas.",
    options: { A: "certifying", B: "certification", C: "certify", D: "certified" },
    correct_answer: "B",
    explanation_zh: "a quality ___ 後接名詞。正確答案是 certification。"
  },
  "v1_b_28_q_009": {
    question_text: "Candidates receive an official ______ upon successfully passing the final exam.",
    options: { A: "certification", B: "certify", C: "certified", D: "certifying" },
    correct_answer: "A",
    explanation_zh: "an official ___ 後接名詞。正確答案是 certification。"
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
console.log(`Rewrote ${count} questions in questions_v1b.json`);
