// Rewrite all duplicate questions in V1-C lessons 29–36 (P3-1, round 7)
// Run: node scripts/rewrite-dups-v1c.js

const fs = require("fs");
const path = require("path");
const FILE = path.join(__dirname, "../data/vocab/questions_v1c.json");

const REWRITES = {

  // ── Lesson 29 · item_finance_family ─────────────────────────────────────
  "v1_c_29_q_006": {
    question_text: "The director transferred funds to the corporate ______ division.",
    options: { A: "financially", B: "financely", C: "finance", D: "financial" },
    correct_answer: "C",
    explanation_zh: "the corporate ___ division 名詞修飾。正確答案是 finance。"
  },
  "v1_c_29_q_008": {
    question_text: "She majored in ______ and later joined a leading consulting firm.",
    options: { A: "finance", B: "financial", C: "financially", D: "financely" },
    correct_answer: "A",
    explanation_zh: "majored in ___ 後接名詞。正確答案是 finance。"
  },
  "v1_c_29_q_009": {
    question_text: "The project required external ______ from international development donors.",
    options: { A: "financial", B: "financially", C: "financely", D: "finance" },
    correct_answer: "D",
    explanation_zh: "external ___ 後接名詞。正確答案是 finance。"
  },
  "v1_c_29_q_012": {
    question_text: "The startup secured ______ from three leading venture capital firms.",
    options: { A: "finance", B: "financial", C: "financially", D: "financely" },
    correct_answer: "A",
    explanation_zh: "secured ___ 後接名詞。正確答案是 finance。"
  },
  "v1_c_29_q_014": {
    question_text: "The ______ team reviewed all outstanding accounts payable at year-end.",
    options: { A: "financially", B: "financely", C: "finance", D: "financial" },
    correct_answer: "C",
    explanation_zh: "The ___ team 名詞修飾。正確答案是 finance。"
  },
  "v1_c_29_q_015": {
    question_text: "The merger was pending approval from the board of ______.",
    options: { A: "financely", B: "finance", C: "financial", D: "financially" },
    correct_answer: "B",
    explanation_zh: "board of ___ 後接名詞。正確答案是 finance。"
  },

  // ── Lesson 30 · item_invest_family ──────────────────────────────────────
  "v1_c_30_q_005": {
    question_text: "The portfolio manager tracked the performance of each ______.",
    options: { A: "invest", B: "investing", C: "investment", D: "investor" },
    correct_answer: "C",
    explanation_zh: "tracked the performance of each ___ 後接名詞。正確答案是 investment。"
  },
  "v1_c_30_q_008": {
    question_text: "The board approved a significant ______ in renewable energy projects.",
    options: { A: "investor", B: "invest", C: "investing", D: "investment" },
    correct_answer: "D",
    explanation_zh: "a significant ___ in 後接名詞。正確答案是 investment。"
  },
  "v1_c_30_q_009": {
    question_text: "Shareholders expressed concerns about the risky overseas ______.",
    options: { A: "invest", B: "investing", C: "investment", D: "investor" },
    correct_answer: "C",
    explanation_zh: "the risky overseas ___ 後接名詞。正確答案是 investment。"
  },
  "v1_c_30_q_011": {
    question_text: "A sound ______ strategy requires careful analysis of market trends.",
    options: { A: "investment", B: "investor", C: "invest", D: "investing" },
    correct_answer: "A",
    explanation_zh: "A sound ___ strategy 名詞修飾。正確答案是 investment。"
  },
  "v1_c_30_q_012": {
    question_text: "Long-term ______ in infrastructure yielded strong returns last year.",
    options: { A: "investor", B: "invest", C: "investing", D: "investment" },
    correct_answer: "D",
    explanation_zh: "Long-term ___ in 後接名詞。正確答案是 investment。"
  },
  "v1_c_30_q_013": {
    question_text: "The pension fund made a large ______ in emerging market bonds.",
    options: { A: "invest", B: "investing", C: "investment", D: "investor" },
    correct_answer: "C",
    explanation_zh: "a large ___ in 後接名詞。正確答案是 investment。"
  },

  // ── Lesson 31 · item_budget_family ──────────────────────────────────────
  "v1_c_31_q_007": {
    question_text: "The procurement team sought approval before exceeding the ______.",
    options: { A: "budgetary", B: "budgeting", C: "budgetal", D: "budget" },
    correct_answer: "D",
    explanation_zh: "exceeding the ___ 後接名詞。正確答案是 budget。"
  },
  "v1_c_31_q_008": {
    question_text: "The event coordinator was asked to reduce the ______ for catering.",
    options: { A: "budgeting", B: "budgetal", C: "budget", D: "budgetary" },
    correct_answer: "C",
    explanation_zh: "reduce the ___ for 後接名詞。正確答案是 budget。"
  },
  "v1_c_31_q_009": {
    question_text: "The new hire was surprised by the tight ______ allocated for marketing.",
    options: { A: "budgetal", B: "budget", C: "budgetary", D: "budgeting" },
    correct_answer: "B",
    explanation_zh: "the tight ___ 後接名詞。正確答案是 budget。"
  },
  "v1_c_31_q_012": {
    question_text: "The CFO prepared a revised ______ to reflect the increased operating costs.",
    options: { A: "budgeting", B: "budgetal", C: "budget", D: "budgetary" },
    correct_answer: "C",
    explanation_zh: "a revised ___ 後接名詞。正確答案是 budget。"
  },
  "v1_c_31_q_013": {
    question_text: "Working within a limited ______ is a core skill for project managers.",
    options: { A: "budgetal", B: "budget", C: "budgetary", D: "budgeting" },
    correct_answer: "B",
    explanation_zh: "within a limited ___ 後接名詞。正確答案是 budget。"
  },
  "v1_c_31_q_015": {
    question_text: "The department head submitted an annual ______ proposal for executive review.",
    options: { A: "budgetary", B: "budgeting", C: "budgetal", D: "budget" },
    correct_answer: "D",
    explanation_zh: "an annual ___ proposal 後接名詞。正確答案是 budget。"
  },
  "v1_c_31_rv_023": {
    question_text: "The committee reviewed the quarterly ______ at the regular planning meeting.",
    options: { A: "budgetary", B: "budgeting", C: "budgetal", D: "budget" },
    correct_answer: "D",
    explanation_zh: "the quarterly ___ 後接名詞。正確答案是 budget。"
  },

  // ── Lesson 32 · item_revenue_family ─────────────────────────────────────
  "v1_c_32_q_004": {
    question_text: "Strong ______ from subscription services boosted the annual report figures.",
    options: { A: "revenue-based", B: "revenue", C: "revenues", D: "revenue tracking" },
    correct_answer: "B",
    explanation_zh: "Strong ___ from 後接名詞。正確答案是 revenue。"
  },
  "v1_c_32_q_005": {
    question_text: "International ______ accounted for sixty percent of total earnings.",
    options: { A: "revenue", B: "revenues", C: "revenue tracking", D: "revenue-based" },
    correct_answer: "A",
    explanation_zh: "International ___ 後接名詞。正確答案是 revenue。"
  },
  "v1_c_32_q_009": {
    question_text: "The advertising ______ for the channel exceeded all quarterly projections.",
    options: { A: "revenue", B: "revenues", C: "revenue tracking", D: "revenue-based" },
    correct_answer: "A",
    explanation_zh: "The advertising ___ 後接名詞。正確答案是 revenue。"
  },
  "v1_c_32_q_010": {
    question_text: "The monthly ______ report was presented to shareholders on Friday.",
    options: { A: "revenues", B: "revenue tracking", C: "revenue-based", D: "revenue" },
    correct_answer: "D",
    explanation_zh: "monthly ___ report 名詞修飾。正確答案是 revenue。"
  },
  "v1_c_32_q_011": {
    question_text: "Higher ticket sales significantly increased total ______ for the organizer.",
    options: { A: "revenue tracking", B: "revenue-based", C: "revenue", D: "revenues" },
    correct_answer: "C",
    explanation_zh: "total ___ 後接名詞。正確答案是 revenue。"
  },
  "v1_c_32_q_012": {
    question_text: "Dining and entertainment ______ surged during the summer festival period.",
    options: { A: "revenue-based", B: "revenue", C: "revenues", D: "revenue tracking" },
    correct_answer: "B",
    explanation_zh: "Dining and entertainment ___ 後接名詞。正確答案是 revenue。"
  },
  "v1_c_32_q_013": {
    question_text: "The store's ______ for the holiday season broke all previous records.",
    options: { A: "revenue", B: "revenues", C: "revenue tracking", D: "revenue-based" },
    correct_answer: "A",
    explanation_zh: "The store's ___ 後接名詞。正確答案是 revenue。"
  },
  "v1_c_32_q_015": {
    question_text: "The platform's total ______ grew by forty percent in the third quarter.",
    options: { A: "revenue tracking", B: "revenue-based", C: "revenue", D: "revenues" },
    correct_answer: "C",
    explanation_zh: "total ___ 後接名詞。正確答案是 revenue。"
  },
  "v1_c_32_rv_023": {
    question_text: "The finance team analyzed weekly ______ to forecast the annual performance.",
    options: { A: "revenue tracking", B: "revenue-based", C: "revenue", D: "revenues" },
    correct_answer: "C",
    explanation_zh: "analyzed weekly ___ 後接名詞。正確答案是 revenue。"
  },

  // ── Lesson 33 · item_expense_family ─────────────────────────────────────
  "v1_c_33_q_004": {
    question_text: "The hotel stay was listed as a business ______ on the travel report.",
    options: { A: "expense", B: "expenses", C: "expensive", D: "expensing" },
    correct_answer: "A",
    explanation_zh: "a business ___ 後接名詞。正確答案是 expense。"
  },
  "v1_c_33_q_007": {
    question_text: "The lunch with the client was later submitted as a business ______.",
    options: { A: "expensing", B: "expense", C: "expenses", D: "expensive" },
    correct_answer: "B",
    explanation_zh: "submitted as a business ___ 後接名詞。正確答案是 expense。"
  },
  "v1_c_33_q_009": {
    question_text: "Each business ______ requires a valid receipt for reimbursement.",
    options: { A: "expenses", B: "expensive", C: "expensing", D: "expense" },
    correct_answer: "D",
    explanation_zh: "Each business ___ 後接名詞。正確答案是 expense。"
  },
  "v1_c_33_q_010": {
    question_text: "The auditor flagged an unverified ______ in the quarterly accounts.",
    options: { A: "expensive", B: "expensing", C: "expense", D: "expenses" },
    correct_answer: "C",
    explanation_zh: "an unverified ___ 後接名詞。正確答案是 expense。"
  },
  "v1_c_33_q_012": {
    question_text: "Any ______ over $500 requires written approval from a senior director.",
    options: { A: "expense", B: "expenses", C: "expensive", D: "expensing" },
    correct_answer: "A",
    explanation_zh: "Any ___ over $500 後接名詞。正確答案是 expense。"
  },
  "v1_c_33_q_013": {
    question_text: "The accountant questioned the large client entertainment ______.",
    options: { A: "expenses", B: "expensive", C: "expensing", D: "expense" },
    correct_answer: "D",
    explanation_zh: "the client entertainment ___ 後接名詞。正確答案是 expense。"
  },
  "v1_c_33_q_015": {
    question_text: "The manager approved the business ______ after reviewing all receipts.",
    options: { A: "expensing", B: "expense", C: "expenses", D: "expensive" },
    correct_answer: "B",
    explanation_zh: "the business ___ 後接名詞。正確答案是 expense。"
  },
  "v1_c_33_rv_023": {
    question_text: "The ______ claim was submitted and processed within three business days.",
    options: { A: "expensing", B: "expense", C: "expenses", D: "expensive" },
    correct_answer: "B",
    explanation_zh: "The ___ claim 名詞修飾。正確答案是 expense。"
  },

  // ── Lesson 34 · item_audit_family ───────────────────────────────────────
  "v1_c_34_q_005": {
    question_text: "The financial ______ was scheduled for the end of the fiscal year.",
    options: { A: "audited", B: "audition", C: "audit", D: "auditor" },
    correct_answer: "C",
    explanation_zh: "The financial ___ 後接名詞。正確答案是 audit。"
  },
  "v1_c_34_q_006": {
    question_text: "The department requested an independent ______ to verify its figures.",
    options: { A: "audition", B: "audit", C: "auditor", D: "audited" },
    correct_answer: "B",
    explanation_zh: "an independent ___ 後接名詞。正確答案是 audit。"
  },
  "v1_c_34_q_008": {
    question_text: "The regulator conducted a surprise ______ of the bank's transaction records.",
    options: { A: "auditor", B: "audited", C: "audition", D: "audit" },
    correct_answer: "D",
    explanation_zh: "a surprise ___ of 後接名詞。正確答案是 audit。"
  },
  "v1_c_34_q_011": {
    question_text: "The company commissioned an external ______ to review its compliance record.",
    options: { A: "audit", B: "auditor", C: "audited", D: "audition" },
    correct_answer: "A",
    explanation_zh: "an external ___ 後接名詞。正確答案是 audit。"
  },
  "v1_c_34_q_014": {
    question_text: "Management requested a full internal ______ of all procurement contracts.",
    options: { A: "audition", B: "audit", C: "auditor", D: "audited" },
    correct_answer: "B",
    explanation_zh: "a full internal ___ of 後接名詞。正確答案是 audit。"
  },

  // ── Lesson 35 · item_contract_family ────────────────────────────────────
  "v1_c_35_q_006": {
    question_text: "Both parties signed the service ______ before any work began.",
    options: { A: "contract", B: "contractual", C: "contractually", D: "contractly" },
    correct_answer: "A",
    explanation_zh: "the service ___ 後接名詞。正確答案是 contract。"
  },
  "v1_c_35_q_008": {
    question_text: "The document clearly stated the payment terms and delivery schedule.",
    options: { A: "contractually", B: "contractly", C: "contract", D: "contractual" },
    correct_answer: "C",
    explanation_zh: "the ___ 在此作名詞使用。正確答案是 contract。"
  },
  "v1_c_35_q_009": {
    question_text: "The supplier was asked to review and sign the updated ______.",
    options: { A: "contractly", B: "contract", C: "contractual", D: "contractually" },
    correct_answer: "B",
    explanation_zh: "sign the updated ___ 後接名詞。正確答案是 contract。"
  },
  "v1_c_35_q_012": {
    question_text: "The purchasing team finalized a three-year ______ with the logistics firm.",
    options: { A: "contractually", B: "contractly", C: "contract", D: "contractual" },
    correct_answer: "C",
    explanation_zh: "a three-year ___ 後接名詞。正確答案是 contract。"
  },
  "v1_c_35_q_014": {
    question_text: "The original ______ was renewed automatically upon its expiry last November.",
    options: { A: "contract", B: "contractual", C: "contractually", D: "contractly" },
    correct_answer: "A",
    explanation_zh: "The original ___ 後接名詞。正確答案是 contract。"
  },
  "v1_c_35_q_015": {
    question_text: "Any modification to the signed ______ must be approved in writing.",
    options: { A: "contractual", B: "contractually", C: "contractly", D: "contract" },
    correct_answer: "D",
    explanation_zh: "the signed ___ 後接名詞。正確答案是 contract。"
  },

  // ── Lesson 36 · item_comply_family ──────────────────────────────────────
  "v1_c_36_q_007": {
    question_text: "The legal team advised on ______ with the new data protection law.",
    options: { A: "compliant", B: "complying", C: "compliance", D: "comply" },
    correct_answer: "C",
    explanation_zh: "advised on ___ with 後接名詞。正確答案是 compliance。"
  },
  "v1_c_36_q_008": {
    question_text: "Strict ______ with safety regulations is required at all work sites.",
    options: { A: "complying", B: "compliance", C: "comply", D: "compliant" },
    correct_answer: "B",
    explanation_zh: "___ with safety regulations 後接名詞作主語。正確答案是 compliance。"
  },
  "v1_c_36_q_009": {
    question_text: "All departments must report their ______ status by end of each month.",
    options: { A: "compliance", B: "comply", C: "compliant", D: "complying" },
    correct_answer: "A",
    explanation_zh: "their ___ status 名詞修飾。正確答案是 compliance。"
  },
  "v1_c_36_q_012": {
    question_text: "The manager submitted a report confirming ______ with the revised rules.",
    options: { A: "complying", B: "compliance", C: "comply", D: "compliant" },
    correct_answer: "B",
    explanation_zh: "confirming ___ with 後接名詞。正確答案是 compliance。"
  },
  "v1_c_36_q_013": {
    question_text: "Achieving full ______ requires consistent staff training and policy updates.",
    options: { A: "compliance", B: "comply", C: "compliant", D: "complying" },
    correct_answer: "A",
    explanation_zh: "Achieving full ___ 後接名詞。正確答案是 compliance。"
  },
  "v1_c_36_q_015": {
    question_text: "The external review confirmed the company's full ______ with industry rules.",
    options: { A: "compliant", B: "complying", C: "compliance", D: "comply" },
    correct_answer: "C",
    explanation_zh: "full ___ with 後接名詞。正確答案是 compliance。"
  },
  "v1_c_36_rv_023": {
    question_text: "Industry leaders discussed best practices for ______ at the annual summit.",
    options: { A: "compliant", B: "complying", C: "compliance", D: "comply" },
    correct_answer: "C",
    explanation_zh: "best practices for ___ 後接名詞。正確答案是 compliance。"
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
console.log(`Rewrote ${count} questions in questions_v1c.json`);
