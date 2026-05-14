// Rewrite all duplicate questions in V1-F lessons 53–70 (P3-1, final round)
// Run: node scripts/rewrite-dups-v1f.js

const fs = require("fs");
const path = require("path");
const FILE = path.join(__dirname, "../data/vocab/questions_v1f.json");

const REWRITES = {
  // ── Lesson 53 ────────────────────────────────────────────────────────────
  "v1_f_53_q_015": {
    question_text: "The ______ of the measurements was verified by an independent laboratory.",
    options: { A: "inaccuracy", B: "accuracy", C: "accurate", D: "accurately" },
    correct_answer: "B",
    explanation_zh: "The ___ of 後接名詞。正確答案是 accuracy。"
  },
  "v1_f_53_q_018": {
    question_text: "The ______ badge must be worn at all times within the restricted building.",
    options: { A: "securely", B: "insecure", C: "security", D: "secure" },
    correct_answer: "C",
    explanation_zh: "___ badge 名詞修飾。正確答案是 security。"
  },
  "v1_f_53_q_027": {
    question_text: "The contractor completed the air conditioning ______ on schedule.",
    options: { A: "installing", B: "installation", C: "install", D: "installed" },
    correct_answer: "B",
    explanation_zh: "the air conditioning ___ 後接名詞。正確答案是 installation。"
  },
  "v1_f_53_q_030": {
    question_text: "The hotel confirmed the ______ of rooms for all conference dates.",
    options: { A: "availably", B: "unavailable", C: "availability", D: "available" },
    correct_answer: "C",
    explanation_zh: "the ___ of rooms 後接名詞。正確答案是 availability。"
  },

  // ── Lesson 54 ────────────────────────────────────────────────────────────
  "v1_f_54_q_021": {
    question_text: "The legal team submitted a final ______ of the partnership agreement.",
    options: { A: "revised", B: "revising", C: "revision", D: "revise" },
    correct_answer: "C",
    explanation_zh: "a final ___ of 後接名詞。正確答案是 revision。"
  },
  "v1_f_54_q_033": {
    question_text: "The internal ______ revealed several discrepancies in the expense accounts.",
    options: { A: "audited", B: "audition", C: "audit", D: "auditor" },
    correct_answer: "C",
    explanation_zh: "The internal ___ 後接名詞。正確答案是 audit。"
  },
  "v1_f_54_q_039": {
    question_text: "Proper ______ of measuring devices ensures consistent and reliable test results.",
    options: { A: "calibration", B: "calibrate", C: "calibrated", D: "calibrating" },
    correct_answer: "A",
    explanation_zh: "Proper ___ of 後接名詞作主語。正確答案是 calibration。"
  },

  // ── Lesson 55 ────────────────────────────────────────────────────────────
  "v1_f_55_q_015": {
    question_text: "The consultant billed each client meeting as a separate billable ______.",
    options: { A: "expenses", B: "expensive", C: "expensing", D: "expense" },
    correct_answer: "D",
    explanation_zh: "a billable ___ 後接名詞。正確答案是 expense。"
  },
  "v1_f_55_q_021": {
    question_text: "The research team was provided with state-of-the-art laboratory ______.",
    options: { A: "equipping", B: "equipment", C: "equip", D: "equipped" },
    correct_answer: "B",
    explanation_zh: "laboratory ___ 後接名詞。正確答案是 equipment。"
  },
  "v1_f_55_q_024": {
    question_text: "The new entrant faced intense ______ from well-established local brands.",
    options: { A: "competitively", B: "competitiveness", C: "competition", D: "competitive" },
    correct_answer: "C",
    explanation_zh: "faced intense ___ 後接名詞。正確答案是 competition。"
  },
  "v1_f_55_q_027": {
    question_text: "All new hires must complete a mandatory induction ______ in their first week.",
    options: { A: "trainer", B: "train", C: "trained", D: "training" },
    correct_answer: "D",
    explanation_zh: "induction ___ 後接名詞。正確答案是 training。"
  },
  "v1_f_55_q_033": {
    question_text: "The budget allocated funds for routine ______ of all company vehicles.",
    options: { A: "maintaining", B: "maintenance", C: "maintain", D: "maintained" },
    correct_answer: "B",
    explanation_zh: "routine ___ of 後接名詞。正確答案是 maintenance。"
  },
  "v1_f_55_q_036": {
    question_text: "Automating the packaging process led to a major improvement in ______.",
    options: { A: "efficiently", B: "inefficiency", C: "efficiency", D: "efficient" },
    correct_answer: "C",
    explanation_zh: "improvement in ___ 後接名詞。正確答案是 efficiency。"
  },
  "v1_f_55_q_039": {
    question_text: "A technical ______ is often essential when applying for engineering positions.",
    options: { A: "qualify", B: "qualified", C: "qualifying", D: "qualification" },
    correct_answer: "D",
    explanation_zh: "A technical ___ 後接名詞。正確答案是 qualification。"
  },

  // ── Lesson 56 ────────────────────────────────────────────────────────────
  "v1_f_56_q_015": {
    question_text: "The board issued an official ______ to address the shareholders' concerns.",
    options: { A: "responsive", B: "responding", C: "response", D: "respond" },
    correct_answer: "C",
    explanation_zh: "an official ___ 後接名詞。正確答案是 response。"
  },
  "v1_f_56_q_018": {
    question_text: "The laboratory test confirmed the ______ of all experimental data.",
    options: { A: "accurate", B: "accurately", C: "inaccuracy", D: "accuracy" },
    correct_answer: "D",
    explanation_zh: "the ___ of 後接名詞。正確答案是 accuracy。"
  },
  "v1_f_56_q_027": {
    question_text: "The airline emailed a travel ______ to the passenger's registered address.",
    options: { A: "confirmed", B: "confirming", C: "confirmation", D: "confirm" },
    correct_answer: "C",
    explanation_zh: "a travel ___ 後接名詞。正確答案是 confirmation。"
  },
  "v1_f_56_q_036": {
    question_text: "The shortlisted candidate submitted a complete job ______ with references.",
    options: { A: "applicable", B: "application", C: "applicant", D: "apply" },
    correct_answer: "B",
    explanation_zh: "a complete job ___ 後接名詞。正確答案是 application。"
  },
  "v1_f_56_q_039": {
    question_text: "Subscription fees accounted for most of the platform's annual ______.",
    options: { A: "revenue tracking", B: "revenue-based", C: "revenue", D: "revenues" },
    correct_answer: "C",
    explanation_zh: "annual ___ 後接名詞。正確答案是 revenue。"
  },

  // ── Lesson 57 ────────────────────────────────────────────────────────────
  "v1_f_57_q_015": {
    question_text: "Delegating tasks without losing ______ is a key skill for effective managers.",
    options: { A: "irresponsible", B: "responsibility", C: "responsible", D: "responsibly" },
    correct_answer: "B",
    explanation_zh: "losing ___ 後接名詞。正確答案是 responsibility。"
  },
  "v1_f_57_q_021": {
    question_text: "The project manager monitored spending carefully to stay within the ______.",
    options: { A: "budgetary", B: "budgeting", C: "budgetal", D: "budget" },
    correct_answer: "D",
    explanation_zh: "stay within the ___ 後接名詞。正確答案是 budget。"
  },
  "v1_f_57_q_027": {
    question_text: "The plumber provided a cost estimate for the emergency pipe ______.",
    options: { A: "repairment", B: "repair", C: "repaired", D: "repairing" },
    correct_answer: "B",
    explanation_zh: "the emergency pipe ___ 後接名詞。正確答案是 repair。"
  },
  "v1_f_57_q_030": {
    question_text: "Customers choose this brand primarily for its known ______ and quality.",
    options: { A: "reliably", B: "unreliable", C: "reliability", D: "reliable" },
    correct_answer: "C",
    explanation_zh: "known ___ and quality 後接名詞。正確答案是 reliability。"
  },
  "v1_f_57_q_033": {
    question_text: "The environmental impact ______ took approximately three months to finalize.",
    options: { A: "assess", B: "assessed", C: "assessing", D: "assessment" },
    correct_answer: "D",
    explanation_zh: "The environmental impact ___ 後接名詞。正確答案是 assessment。"
  },
  "v1_f_57_q_039": {
    question_text: "Please check the ______ for the revised project timeline and cost breakdown.",
    options: { A: "attaching", B: "attachment", C: "attach", D: "attached" },
    correct_answer: "B",
    explanation_zh: "check the ___ 後接名詞。正確答案是 attachment。"
  },

  // ── Lesson 58 ────────────────────────────────────────────────────────────
  "v1_f_58_q_015": {
    question_text: "Her outstanding performance earned her a well-deserved ______ last month.",
    options: { A: "promotion", B: "promote", C: "promotional", D: "promoting" },
    correct_answer: "A",
    explanation_zh: "earned her a ___ 後接名詞。正確答案是 promotion。"
  },
  "v1_f_58_q_018": {
    question_text: "The team dinner was submitted and approved as a company ______.",
    options: { A: "expensing", B: "expense", C: "expenses", D: "expensive" },
    correct_answer: "B",
    explanation_zh: "as a company ___ 後接名詞。正確答案是 expense。"
  },
  "v1_f_58_q_030": {
    question_text: "The updated platform requires a period of specialized ______ for all users.",
    options: { A: "trained", B: "training", C: "trainer", D: "train" },
    correct_answer: "B",
    explanation_zh: "specialized ___ for 後接名詞。正確答案是 training。"
  },
  "v1_f_58_q_039": {
    question_text: "The restructuring plan aimed to boost overall operational ______ across the firm.",
    options: { A: "efficiency", B: "efficient", C: "efficiently", D: "inefficiency" },
    correct_answer: "A",
    explanation_zh: "boost overall operational ___ 後接名詞。正確答案是 efficiency。"
  },

  // ── Lesson 59 ────────────────────────────────────────────────────────────
  "v1_f_59_q_015": {
    question_text: "Both parties agreed to sign a formal service ______ before work started.",
    options: { A: "contractual", B: "contractually", C: "contractly", D: "contract" },
    correct_answer: "D",
    explanation_zh: "a formal service ___ 後接名詞。正確答案是 contract。"
  },
  "v1_f_59_q_024": {
    question_text: "The warehouse required an upgraded ______ system following the break-in.",
    options: { A: "securely", B: "insecure", C: "security", D: "secure" },
    correct_answer: "C",
    explanation_zh: "___ system 名詞修飾。正確答案是 security。"
  },
  "v1_f_59_q_033": {
    question_text: "The cost of ______ was clearly included in the original project estimate.",
    options: { A: "installing", B: "installation", C: "install", D: "installed" },
    correct_answer: "B",
    explanation_zh: "The cost of ___ 後接名詞。正確答案是 installation。"
  },
  "v1_f_59_q_036": {
    question_text: "The scheduling depends largely on the lead technician's ______.",
    options: { A: "availably", B: "unavailable", C: "availability", D: "available" },
    correct_answer: "C",
    explanation_zh: "the lead technician's ___ 後接名詞。正確答案是 availability。"
  },

  // ── Lesson 60 ────────────────────────────────────────────────────────────
  "v1_f_60_q_018": {
    question_text: "The new role came with significantly increased ______ for budget decisions.",
    options: { A: "responsible", B: "responsibly", C: "irresponsible", D: "responsibility" },
    correct_answer: "D",
    explanation_zh: "increased ___ for 後接名詞。正確答案是 responsibility。"
  },
  "v1_f_60_q_027": {
    question_text: "A major ______ of the pricing strategy was approved at last month's meeting.",
    options: { A: "revised", B: "revising", C: "revision", D: "revise" },
    correct_answer: "C",
    explanation_zh: "A major ___ of 後接名詞。正確答案是 revision。"
  },

  // ── Lesson 61 ────────────────────────────────────────────────────────────
  "v1_f_61_q_015": {
    question_text: "The new product launch was a commercial ______ that exceeded all forecasts.",
    options: { A: "unsuccessful", B: "success", C: "successful", D: "successfully" },
    correct_answer: "B",
    explanation_zh: "a commercial ___ 後接名詞。正確答案是 success。"
  },
  "v1_f_61_q_021": {
    question_text: "Filing a reimbursement ______ requires a valid receipt and manager approval.",
    options: { A: "expenses", B: "expensive", C: "expensing", D: "expense" },
    correct_answer: "D",
    explanation_zh: "a reimbursement ___ 後接名詞。正確答案是 expense。"
  },
  "v1_f_61_q_027": {
    question_text: "The factory ordered replacement production ______ for the main assembly line.",
    options: { A: "equipping", B: "equipment", C: "equip", D: "equipped" },
    correct_answer: "B",
    explanation_zh: "production ___ 後接名詞。正確答案是 equipment。"
  },
  "v1_f_61_q_030": {
    question_text: "Rising costs and global ______ forced the company to lower its prices.",
    options: { A: "competitively", B: "competitiveness", C: "competition", D: "competitive" },
    correct_answer: "C",
    explanation_zh: "global ___ 後接名詞。正確答案是 competition。"
  },
  "v1_f_61_q_033": {
    question_text: "The HR department oversees the formal onboarding ______ for all new staff.",
    options: { A: "trainer", B: "train", C: "trained", D: "training" },
    correct_answer: "D",
    explanation_zh: "onboarding ___ 後接名詞。正確答案是 training。"
  },
  "v1_f_61_q_039": {
    question_text: "The technician visited the site quarterly for routine equipment ______.",
    options: { A: "maintaining", B: "maintenance", C: "maintain", D: "maintained" },
    correct_answer: "B",
    explanation_zh: "routine equipment ___ 後接名詞。正確答案是 maintenance。"
  },

  // ── Lesson 62 ────────────────────────────────────────────────────────────
  "v1_f_62_q_021": {
    question_text: "The spokesperson drafted a clear ______ to address the journalist's questions.",
    options: { A: "responsive", B: "responding", C: "response", D: "respond" },
    correct_answer: "C",
    explanation_zh: "a clear ___ to 後接名詞。正確答案是 response。"
  },
  "v1_f_62_q_024": {
    question_text: "The controller verified the ______ of all figures before publishing the report.",
    options: { A: "accurate", B: "accurately", C: "inaccuracy", D: "accuracy" },
    correct_answer: "D",
    explanation_zh: "verified the ___ of 後接名詞。正確答案是 accuracy。"
  },
  "v1_f_62_q_030": {
    question_text: "The startup received seed ______ from a government-backed investment program.",
    options: { A: "financely", B: "finance", C: "financial", D: "financially" },
    correct_answer: "B",
    explanation_zh: "seed ___ 後接名詞。正確答案是 finance。"
  },
  "v1_f_62_q_033": {
    question_text: "The booking ______ was emailed to the guest within minutes of the reservation.",
    options: { A: "confirmed", B: "confirming", C: "confirmation", D: "confirm" },
    correct_answer: "C",
    explanation_zh: "The booking ___ 後接名詞。正確答案是 confirmation。"
  },
  "v1_f_62_q_039": {
    question_text: "The system checks the real-time ______ of all shared conference facilities.",
    options: { A: "availability", B: "available", C: "availably", D: "unavailable" },
    correct_answer: "A",
    explanation_zh: "real-time ___ of 後接名詞。正確答案是 availability。"
  },

  // ── Lesson 63 ────────────────────────────────────────────────────────────
  "v1_f_63_q_015": {
    question_text: "The team submitted a revised ______ to address all of the client's concerns.",
    options: { A: "propose", B: "proposed", C: "proposing", D: "proposal" },
    correct_answer: "D",
    explanation_zh: "a revised ___ 後接名詞。正確答案是 proposal。"
  },
  "v1_f_63_q_033": {
    question_text: "The building manager authorized the emergency ______ of the boiler system.",
    options: { A: "repairment", B: "repair", C: "repaired", D: "repairing" },
    correct_answer: "B",
    explanation_zh: "the emergency ___ of 後接名詞。正確答案是 repair。"
  },
  "v1_f_63_q_036": {
    question_text: "The vendor was selected based on its long-established ______ and low prices.",
    options: { A: "reliably", B: "unreliable", C: "reliability", D: "reliable" },
    correct_answer: "C",
    explanation_zh: "its ___ and low prices 後接名詞。正確答案是 reliability。"
  },
  "v1_f_63_q_039": {
    question_text: "The project team conducted a full risk ______ before the final decision.",
    options: { A: "assess", B: "assessed", C: "assessing", D: "assessment" },
    correct_answer: "D",
    explanation_zh: "a risk ___ 後接名詞。正確答案是 assessment。"
  },

  // ── Lesson 64 ────────────────────────────────────────────────────────────
  "v1_f_64_q_015": {
    question_text: "The ______ of the processing plant runs continuously for sixteen hours daily.",
    options: { A: "operational", B: "operating", C: "operation", D: "operate" },
    correct_answer: "C",
    explanation_zh: "The ___ of 後接名詞。正確答案是 operation。"
  },
  "v1_f_64_q_018": {
    question_text: "The team celebrated the notable ______ of the new product testing phase.",
    options: { A: "successful", B: "successfully", C: "unsuccessful", D: "success" },
    correct_answer: "D",
    explanation_zh: "the ___ of 後接名詞。正確答案是 success。"
  },
  "v1_f_64_q_021": {
    question_text: "The top employee received a ______ following her outstanding annual review.",
    options: { A: "promotion", B: "promote", C: "promotional", D: "promoting" },
    correct_answer: "A",
    explanation_zh: "received a ___ 後接名詞。正確答案是 promotion。"
  },
  "v1_f_64_q_039": {
    question_text: "Full ______ with all building codes was confirmed before granting occupancy.",
    options: { A: "compliant", B: "complying", C: "compliance", D: "comply" },
    correct_answer: "C",
    explanation_zh: "Full ___ with 後接名詞。正確答案是 compliance。"
  },

  // ── Lesson 65 ────────────────────────────────────────────────────────────
  "v1_f_65_q_015": {
    question_text: "The leadership coaching sessions led to measurable improvements in team ______.",
    options: { A: "unproductive", B: "productivity", C: "productive", D: "productively" },
    correct_answer: "B",
    explanation_zh: "improvements in ___ 後接名詞。正確答案是 productivity。"
  },
  "v1_f_65_q_030": {
    question_text: "The data center upgraded its cybersecurity and network ______ protocols.",
    options: { A: "securely", B: "insecure", C: "security", D: "secure" },
    correct_answer: "C",
    explanation_zh: "___ protocols 名詞修飾。正確答案是 security。"
  },
  "v1_f_65_q_039": {
    question_text: "The ______ of the new server network took an entire business day to complete.",
    options: { A: "installing", B: "installation", C: "install", D: "installed" },
    correct_answer: "B",
    explanation_zh: "The ___ of 後接名詞。正確答案是 installation。"
  },

  // ── Lesson 66 ────────────────────────────────────────────────────────────
  "v1_f_66_q_015": {
    question_text: "Obtaining a recognized project management ______ can significantly boost career prospects.",
    options: { A: "certification", B: "certify", C: "certified", D: "certifying" },
    correct_answer: "A",
    explanation_zh: "a ___ 後接名詞。正確答案是 certification。"
  },
  "v1_f_66_q_024": {
    question_text: "Reporting financial irregularities is a shared ______ at every level of the firm.",
    options: { A: "responsible", B: "responsibly", C: "irresponsible", D: "responsibility" },
    correct_answer: "D",
    explanation_zh: "a shared ___ at 後接名詞。正確答案是 responsibility。"
  },
  "v1_f_66_q_027": {
    question_text: "The career fair helped recent graduates explore local ______ opportunities.",
    options: { A: "employment", B: "employee", C: "employer", D: "employ" },
    correct_answer: "A",
    explanation_zh: "___ opportunities 名詞修飾。正確答案是 employment。"
  },
  "v1_f_66_q_033": {
    question_text: "The architect submitted an updated ______ of the floor plan to the client.",
    options: { A: "revised", B: "revising", C: "revision", D: "revise" },
    correct_answer: "C",
    explanation_zh: "an updated ___ of 後接名詞。正確答案是 revision。"
  },
  "v1_f_66_q_039": {
    question_text: "The network's ______ was rigorously tested during both peak and off-peak hours.",
    options: { A: "reliability", B: "reliable", C: "reliably", D: "unreliable" },
    correct_answer: "A",
    explanation_zh: "The network's ___ 後接名詞。正確答案是 reliability。"
  },

  // ── Lesson 67 ────────────────────────────────────────────────────────────
  "v1_f_67_q_015": {
    question_text: "The system sends an automatic ______ when new stock becomes available.",
    options: { A: "notice", B: "notify", C: "notifying", D: "notification" },
    correct_answer: "D",
    explanation_zh: "an automatic ___ 後接名詞。正確答案是 notification。"
  },
  "v1_f_67_q_030": {
    question_text: "The team prepared a compelling ______ for the visiting venture capital firm.",
    options: { A: "presentation", B: "presenter", C: "present", D: "presentment" },
    correct_answer: "A",
    explanation_zh: "a compelling ___ 後接名詞。正確答案是 presentation。"
  },
  "v1_f_67_q_033": {
    question_text: "Heavy construction ______ was brought to the site to complete the foundations.",
    options: { A: "equipping", B: "equipment", C: "equip", D: "equipped" },
    correct_answer: "B",
    explanation_zh: "construction ___ 後接名詞。正確答案是 equipment。"
  },
  "v1_f_67_q_036": {
    question_text: "Aggressive pricing by rival firms intensified ______ in the technology sector.",
    options: { A: "competitively", B: "competitiveness", C: "competition", D: "competitive" },
    correct_answer: "C",
    explanation_zh: "intensified ___ in 後接名詞。正確答案是 competition。"
  },

  // ── Lesson 68 ────────────────────────────────────────────────────────────
  "v1_f_68_q_015": {
    question_text: "The building committee approved a complete ______ of the main lobby area.",
    options: { A: "renovated", B: "renovating", C: "renovation", D: "renovate" },
    correct_answer: "C",
    explanation_zh: "a complete ___ of 後接名詞。正確答案是 renovation。"
  },
  "v1_f_68_q_018": {
    question_text: "Improved working conditions and flexible hours directly boosted team ______.",
    options: { A: "productive", B: "productively", C: "unproductive", D: "productivity" },
    correct_answer: "D",
    explanation_zh: "boosted team ___ 後接名詞。正確答案是 productivity。"
  },
  "v1_f_68_q_030": {
    question_text: "The engineers double-checked all critical figures to ensure full ______.",
    options: { A: "accurate", B: "accurately", C: "inaccuracy", D: "accuracy" },
    correct_answer: "D",
    explanation_zh: "ensure full ___ 後接名詞。正確答案是 accuracy。"
  },
  "v1_f_68_q_036": {
    question_text: "The startup attracted ______ from both public agencies and private investors.",
    options: { A: "financely", B: "finance", C: "financial", D: "financially" },
    correct_answer: "B",
    explanation_zh: "attracted ___ from 後接名詞。正確答案是 finance。"
  },
  "v1_f_68_q_039": {
    question_text: "Customers receive an instant payment ______ once their transaction is cleared.",
    options: { A: "confirmed", B: "confirming", C: "confirmation", D: "confirm" },
    correct_answer: "C",
    explanation_zh: "a payment ___ 後接名詞。正確答案是 confirmation。"
  },

  // ── Lesson 69 ────────────────────────────────────────────────────────────
  "v1_f_69_q_015": {
    question_text: "The management team tracked the ______ of each individual product line closely.",
    options: { A: "profitably", B: "profitability", C: "profit", D: "profitable" },
    correct_answer: "B",
    explanation_zh: "the ___ of 後接名詞。正確答案是 profitability。"
  },
  "v1_f_69_q_021": {
    question_text: "The sales team drafted a compelling ______ to attract the new client.",
    options: { A: "propose", B: "proposed", C: "proposing", D: "proposal" },
    correct_answer: "D",
    explanation_zh: "a compelling ___ 後接名詞。正確答案是 proposal。"
  },
  "v1_f_69_q_030": {
    question_text: "The agency helped seniors find meaningful part-time ______ after retirement.",
    options: { A: "employer", B: "employ", C: "employment", D: "employee" },
    correct_answer: "C",
    explanation_zh: "part-time ___ 後接名詞。正確答案是 employment。"
  },
  "v1_f_69_q_039": {
    question_text: "The initial ______ cost was far lower than the total replacement cost.",
    options: { A: "repairment", B: "repair", C: "repaired", D: "repairing" },
    correct_answer: "B",
    explanation_zh: "The initial ___ cost 名詞修飾。正確答案是 repair。"
  },

  // ── Lesson 70 ────────────────────────────────────────────────────────────
  "v1_f_70_q_021": {
    question_text: "Efficient ______ of the supply chain minimizes both delays and overhead costs.",
    options: { A: "operational", B: "operating", C: "operation", D: "operate" },
    correct_answer: "C",
    explanation_zh: "Efficient ___ of 後接名詞作主語。正確答案是 operation。"
  },
  "v1_f_70_q_024": {
    question_text: "The marketing campaign was a major ______ that tripled website traffic.",
    options: { A: "successful", B: "successfully", C: "unsuccessful", D: "success" },
    correct_answer: "D",
    explanation_zh: "a major ___ 後接名詞。正確答案是 success。"
  },
  "v1_f_70_q_039": {
    question_text: "Fierce ______ in the market keeps product prices low and quality standards high.",
    options: { A: "competition", B: "competitive", C: "competitively", D: "competitiveness" },
    correct_answer: "A",
    explanation_zh: "Fierce ___ in 後接名詞作主語。正確答案是 competition。"
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
console.log(`Rewrote ${count} questions in questions_v1f.json`);
