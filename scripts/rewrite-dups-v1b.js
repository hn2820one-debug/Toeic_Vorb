// Rewrite duplicate questions in all V1-B lessons 21–28 (P3-1, round 5)
// Run: node scripts/rewrite-dups-v1b.js

const fs = require("fs");
const path = require("path");
const FILE = path.join(__dirname, "../data/vocab/questions_v1b.json");

const REWRITES = {

  // ── Lesson 21 · item_qualify_family ─────────────────────────────────────
  "v1_b_21_q_011": {
    question_text: "The company sought a ______ professional for the senior audit role.",
    options: { A: "qualifying", B: "qualified", C: "qualification", D: "qualify" },
    correct_answer: "B",
    explanation_zh: "名詞 professional 前需要形容詞修飾。正確答案是 qualified。"
  },
  "v1_b_21_q_012": {
    question_text: "The HR team verified each applicant's ______ before the interview stage.",
    options: { A: "qualification", B: "qualify", C: "qualified", D: "qualifying" },
    correct_answer: "A",
    explanation_zh: "each applicant's ___ 需要名詞。正確答案是 qualification。"
  },
  "v1_b_21_q_013": {
    question_text: "Attending the course was a minimum ______ for the management promotion.",
    options: { A: "qualify", B: "qualified", C: "qualifying", D: "qualification" },
    correct_answer: "D",
    explanation_zh: "a minimum ___ 後接名詞。正確答案是 qualification。"
  },
  "v1_b_21_q_015": {
    question_text: "The board reviewed the ______ requirements for committee membership.",
    options: { A: "qualifying", B: "qualification", C: "qualify", D: "qualified" },
    correct_answer: "B",
    explanation_zh: "the ___ requirements 需要名詞。正確答案是 qualification。"
  },
  "v1_b_21_q_018": {
    question_text: "Candidates must ______ by submitting proof of relevant experience.",
    options: { A: "qualification", B: "qualified", C: "qualify", D: "qualifying" },
    correct_answer: "C",
    explanation_zh: "must 後接動詞原形。正確答案是 qualify。"
  },
  "v1_b_21_rv_022": {
    question_text: "Staff are reminded that ______ for the bonus requires full-year attendance.",
    options: { A: "qualify", B: "qualified", C: "qualifying", D: "qualification" },
    correct_answer: "C",
    explanation_zh: "___ for the bonus 作主語，要用動名詞形式。正確答案是 qualifying。"
  },
  "v1_b_21_rv_023": {
    question_text: "A professional ______ is often required before applying for senior roles.",
    options: { A: "qualifying", B: "qualification", C: "qualify", D: "qualified" },
    correct_answer: "B",
    explanation_zh: "A professional ___ 後接名詞。正確答案是 qualification。"
  },
  "v1_b_21_rv_024": {
    question_text: "The minimum ______ for the position was a degree in engineering.",
    options: { A: "qualification", B: "qualify", C: "qualified", D: "qualifying" },
    correct_answer: "A",
    explanation_zh: "The minimum ___ 後接名詞。正確答案是 qualification。"
  },

  // ── Lesson 22 · item_employ_family ──────────────────────────────────────
  "v1_b_22_q_011": {
    question_text: "Rising ______ rates were cited in the company's annual economic report.",
    options: { A: "employment", B: "employee", C: "employer", D: "employ" },
    correct_answer: "A",
    explanation_zh: "___ rates 後接抽象名詞。正確答案是 employment。"
  },
  "v1_b_22_q_012": {
    question_text: "She has been ______ at the same firm for over a decade.",
    options: { A: "employment", B: "employee", C: "employer", D: "employed" },
    correct_answer: "D",
    explanation_zh: "has been ___ 後接過去分詞。正確答案是 employed。"
  },
  "v1_b_22_q_013": {
    question_text: "The agency provides ______ services to recent graduates seeking work.",
    options: { A: "employer", B: "employ", C: "employment", D: "employee" },
    correct_answer: "C",
    explanation_zh: "___ services 後接名詞。正確答案是 employment。"
  },
  "v1_b_22_q_015": {
    question_text: "The ______ provided health insurance for all full-time workers.",
    options: { A: "employer", B: "employment", C: "employee", D: "employ" },
    correct_answer: "A",
    explanation_zh: "句意指提供保險的一方，要用僱主名詞。正確答案是 employer。"
  },
  "v1_b_22_q_018": {
    question_text: "The firm will ______ fifty additional technicians next month.",
    options: { A: "employment", B: "employ", C: "employee", D: "employer" },
    correct_answer: "B",
    explanation_zh: "will 後接動詞原形。正確答案是 employ。"
  },
  "v1_b_22_rv_022": {
    question_text: "Contract terms outlined the conditions of ______ for seasonal workers.",
    options: { A: "employ", B: "employment", C: "employee", D: "employer" },
    correct_answer: "B",
    explanation_zh: "conditions of ___ 後接抽象名詞。正確答案是 employment。"
  },
  "v1_b_22_rv_023": {
    question_text: "Any changes to the work schedule must be approved by the ______.",
    options: { A: "employer", B: "employment", C: "employee", D: "employ" },
    correct_answer: "A",
    explanation_zh: "句意指有批准權的一方，要用僱主名詞。正確答案是 employer。"
  },
  "v1_b_22_rv_024": {
    question_text: "The ______ contract was reviewed and signed before the quarter began.",
    options: { A: "employee", B: "employer", C: "employ", D: "employment" },
    correct_answer: "D",
    explanation_zh: "___ contract 作名詞修飾。正確答案是 employment。"
  },

  // ── Lesson 23 · item_apply_family ───────────────────────────────────────
  "v1_b_23_q_011": {
    question_text: "Please read all terms and conditions that are ______ to your account type.",
    options: { A: "application", B: "applicant", C: "apply", D: "applicable" },
    correct_answer: "D",
    explanation_zh: "that are ___ to 需要形容詞。正確答案是 applicable。"
  },
  "v1_b_23_q_012": {
    question_text: "The deadline for submitting your ______ is the end of this month.",
    options: { A: "apply", B: "applicable", C: "application", D: "applicant" },
    correct_answer: "C",
    explanation_zh: "submitting your ___ 後接名詞。正確答案是 application。"
  },
  "v1_b_23_q_013": {
    question_text: "You must complete the online ______ before the screening process begins.",
    options: { A: "applicable", B: "application", C: "applicant", D: "apply" },
    correct_answer: "B",
    explanation_zh: "the online ___ 後接名詞。正確答案是 application。"
  },
  "v1_b_23_q_015": {
    question_text: "Each ______ will receive an email notification within two business days.",
    options: { A: "application", B: "apply", C: "applicable", D: "applicant" },
    correct_answer: "D",
    explanation_zh: "句意指提交申請的人，要用表人名詞。正確答案是 applicant。"
  },
  "v1_b_23_q_018": {
    question_text: "Interested candidates should ______ online before the closing date.",
    options: { A: "apply", B: "applicant", C: "application", D: "applicable" },
    correct_answer: "A",
    explanation_zh: "should 後接動詞原形。正確答案是 apply。"
  },
  "v1_b_23_rv_022": {
    question_text: "The ______ form required three professional references from each candidate.",
    options: { A: "application", B: "applicant", C: "apply", D: "applicable" },
    correct_answer: "A",
    explanation_zh: "___ form 名詞修飾。正確答案是 application。"
  },
  "v1_b_23_rv_023": {
    question_text: "A successful ______ must have at least five years of field experience.",
    options: { A: "application", B: "apply", C: "applicable", D: "applicant" },
    correct_answer: "D",
    explanation_zh: "A successful ___ 指成功申請者，要用表人名詞。正確答案是 applicant。"
  },
  "v1_b_23_rv_024": {
    question_text: "The recruiter shortlisted ten ______ forms from over a hundred submissions.",
    options: { A: "apply", B: "applicable", C: "application", D: "applicant" },
    correct_answer: "C",
    explanation_zh: "ten ___ forms 後接名詞。正確答案是 application。"
  },

  // ── Lesson 24 · item_promote_family ─────────────────────────────────────
  "v1_b_24_q_011": {
    question_text: "The store distributed ______ leaflets near the entrance to attract shoppers.",
    options: { A: "promote", B: "promoting", C: "promotional", D: "promotion" },
    correct_answer: "C",
    explanation_zh: "___ leaflets 名詞前要用形容詞。正確答案是 promotional。"
  },
  "v1_b_24_q_012": {
    question_text: "Her ______ to regional manager was officially announced at the staff meeting.",
    options: { A: "promoting", B: "promotion", C: "promote", D: "promotional" },
    correct_answer: "B",
    explanation_zh: "Her ___ to 後接名詞。正確答案是 promotion。"
  },
  "v1_b_24_q_013": {
    question_text: "The advertising campaign relied on aggressive ______ through social media.",
    options: { A: "promotion", B: "promote", C: "promotional", D: "promoting" },
    correct_answer: "A",
    explanation_zh: "relied on ___ 後接名詞。正確答案是 promotion。"
  },
  "v1_b_24_q_015": {
    question_text: "She worked hard to earn a ______ within her first year at the company.",
    options: { A: "promotional", B: "promoting", C: "promotion", D: "promote" },
    correct_answer: "C",
    explanation_zh: "earn a ___ 後接名詞。正確答案是 promotion。"
  },
  "v1_b_24_q_018": {
    question_text: "The marketing team agreed to ______ the new product at the upcoming trade fair.",
    options: { A: "promotional", B: "promotion", C: "promoting", D: "promote" },
    correct_answer: "D",
    explanation_zh: "agreed to 後接動詞原形。正確答案是 promote。"
  },
  "v1_b_24_rv_022": {
    question_text: "The intern was responsible for ______ upcoming events on the company's social pages.",
    options: { A: "promotion", B: "promote", C: "promotional", D: "promoting" },
    correct_answer: "D",
    explanation_zh: "responsible for ___ 後接動名詞。正確答案是 promoting。"
  },
  "v1_b_24_rv_023": {
    question_text: "The manager designed a special ______ to clear end-of-season inventory.",
    options: { A: "promotional", B: "promoting", C: "promotion", D: "promote" },
    correct_answer: "C",
    explanation_zh: "a special ___ 後接名詞。正確答案是 promotion。"
  },
  "v1_b_24_rv_024": {
    question_text: "An internal ______ was awarded to the most dedicated employee of the year.",
    options: { A: "promoting", B: "promotion", C: "promote", D: "promotional" },
    correct_answer: "B",
    explanation_zh: "An internal ___ 後接名詞。正確答案是 promotion。"
  },

  // ── Lesson 25 · item_assess_family ──────────────────────────────────────
  "v1_b_25_q_011": {
    question_text: "The manager requested a full ______ of the project's current risks.",
    options: { A: "assessing", B: "assessment", C: "assess", D: "assessed" },
    correct_answer: "B",
    explanation_zh: "a full ___ of 後接名詞。正確答案是 assessment。"
  },
  "v1_b_25_q_012": {
    question_text: "Each new employee's skills were ______ during the onboarding process.",
    options: { A: "assessed", B: "assessment", C: "assess", D: "assessing" },
    correct_answer: "A",
    explanation_zh: "were ___ 後接過去分詞。正確答案是 assessed。"
  },
  "v1_b_25_q_013": {
    question_text: "The safety ______ revealed several hazards in the warehouse layout.",
    options: { A: "assess", B: "assessed", C: "assessing", D: "assessment" },
    correct_answer: "D",
    explanation_zh: "The safety ___ 後接名詞。正確答案是 assessment。"
  },
  "v1_b_25_q_015": {
    question_text: "Results of the performance ______ will be shared with each department head.",
    options: { A: "assessing", B: "assessment", C: "assess", D: "assessed" },
    correct_answer: "B",
    explanation_zh: "the performance ___ 後接名詞。正確答案是 assessment。"
  },
  "v1_b_25_q_018": {
    question_text: "The board asked the consultant to ______ all existing supplier contracts.",
    options: { A: "assessing", B: "assessment", C: "assess", D: "assessed" },
    correct_answer: "C",
    explanation_zh: "to 後接動詞原形。正確答案是 assess。"
  },
  "v1_b_25_rv_022": {
    question_text: "The committee spent a week ______ bids from three different contractors.",
    options: { A: "assess", B: "assessed", C: "assessing", D: "assessment" },
    correct_answer: "C",
    explanation_zh: "spent a week ___ 後接動名詞。正確答案是 assessing。"
  },
  "v1_b_25_rv_023": {
    question_text: "A thorough ______ of the system's vulnerabilities was completed last quarter.",
    options: { A: "assessing", B: "assessment", C: "assess", D: "assessed" },
    correct_answer: "B",
    explanation_zh: "A thorough ___ of 後接名詞。正確答案是 assessment。"
  },
  "v1_b_25_rv_024": {
    question_text: "The HR team developed a new ______ tool for annual performance reviews.",
    options: { A: "assessment", B: "assess", C: "assessed", D: "assessing" },
    correct_answer: "A",
    explanation_zh: "a new ___ tool 名詞前要用名詞修飾。正確答案是 assessment。"
  },

  // ── Lesson 26 · item_recruit_family ─────────────────────────────────────
  "v1_b_26_q_011": {
    question_text: "The company launched a ______ drive to hire fifty engineers this quarter.",
    options: { A: "recruitment", B: "recruit", C: "recruiter", D: "recruition" },
    correct_answer: "A",
    explanation_zh: "a ___ drive 後接名詞。正確答案是 recruitment。"
  },
  "v1_b_26_q_012": {
    question_text: "The agency specializes in ______ for the financial services industry.",
    options: { A: "recruit", B: "recruiter", C: "recruition", D: "recruitment" },
    correct_answer: "D",
    explanation_zh: "specializes in ___ 後接名詞。正確答案是 recruitment。"
  },
  "v1_b_26_q_013": {
    question_text: "Online platforms have transformed the ______ process significantly.",
    options: { A: "recruiter", B: "recruition", C: "recruitment", D: "recruit" },
    correct_answer: "C",
    explanation_zh: "the ___ process 後接名詞。正確答案是 recruitment。"
  },
  "v1_b_26_q_015": {
    question_text: "The ______ contacted three shortlisted candidates after the job fair.",
    options: { A: "recruiter", B: "recruitment", C: "recruit", D: "recruition" },
    correct_answer: "A",
    explanation_zh: "句意指執行招募工作的人，要用表人名詞。正確答案是 recruiter。"
  },
  "v1_b_26_q_018": {
    question_text: "The campaign was designed to ______ graduates with strong analytical skills.",
    options: { A: "recruitment", B: "recruit", C: "recruiter", D: "recruition" },
    correct_answer: "B",
    explanation_zh: "to 後接動詞原形。正確答案是 recruit。"
  },
  "v1_b_26_rv_022": {
    question_text: "The HR budget allocated thirty percent to ______ and onboarding activities.",
    options: { A: "recruition", B: "recruitment", C: "recruit", D: "recruiter" },
    correct_answer: "B",
    explanation_zh: "allocated to ___ 後接名詞。正確答案是 recruitment。"
  },
  "v1_b_26_rv_023": {
    question_text: "An external ______ was hired to find candidates for the new overseas division.",
    options: { A: "recruiter", B: "recruitment", C: "recruit", D: "recruition" },
    correct_answer: "A",
    explanation_zh: "An external ___ 指外部招募人員。正確答案是 recruiter。"
  },
  "v1_b_26_rv_024": {
    question_text: "The policy outlined clear ethical standards for ______ agencies to follow.",
    options: { A: "recruit", B: "recruiter", C: "recruition", D: "recruitment" },
    correct_answer: "D",
    explanation_zh: "___ agencies 名詞修飾。正確答案是 recruitment。"
  },

  // ── Lesson 27 · item_train_family ───────────────────────────────────────
  "v1_b_27_q_011": {
    question_text: "All new staff members must complete a safety ______ before starting work.",
    options: { A: "trainer", B: "train", C: "trained", D: "training" },
    correct_answer: "D",
    explanation_zh: "a safety ___ 後接名詞。正確答案是 training。"
  },
  "v1_b_27_q_012": {
    question_text: "The new customer service team was fully ______ within two weeks.",
    options: { A: "trainer", B: "train", C: "trained", D: "training" },
    correct_answer: "C",
    explanation_zh: "was fully ___ 後接過去分詞。正確答案是 trained。"
  },
  "v1_b_27_q_013": {
    question_text: "The annual ______ budget was increased by twenty percent this year.",
    options: { A: "trained", B: "training", C: "trainer", D: "train" },
    correct_answer: "B",
    explanation_zh: "The annual ___ budget 名詞修飾。正確答案是 training。"
  },
  "v1_b_27_q_015": {
    question_text: "An experienced ______ was brought in to lead the team's development workshop.",
    options: { A: "training", B: "train", C: "trained", D: "trainer" },
    correct_answer: "D",
    explanation_zh: "An experienced ___ 指有經驗的講師。正確答案是 trainer。"
  },
  "v1_b_27_q_018": {
    question_text: "The workshop was designed to ______ staff on the new inventory software.",
    options: { A: "train", B: "training", C: "trainer", D: "trained" },
    correct_answer: "A",
    explanation_zh: "to 後接動詞原形。正確答案是 train。"
  },
  "v1_b_27_rv_022": {
    question_text: "The ______ program was revised after receiving feedback from the previous cohort.",
    options: { A: "training", B: "trainer", C: "train", D: "trained" },
    correct_answer: "A",
    explanation_zh: "The ___ program 名詞修飾。正確答案是 training。"
  },
  "v1_b_27_rv_023": {
    question_text: "Each department was assigned a dedicated ______ for the software rollout.",
    options: { A: "training", B: "train", C: "trained", D: "trainer" },
    correct_answer: "D",
    explanation_zh: "a dedicated ___ 指負責的講師。正確答案是 trainer。"
  },
  "v1_b_27_rv_024": {
    question_text: "The policy requires all managers to complete compliance ______ every two years.",
    options: { A: "train", B: "trained", C: "training", D: "trainer" },
    correct_answer: "C",
    explanation_zh: "complete compliance ___ 後接名詞。正確答案是 training。"
  },

  // ── Lesson 28 · item_certify_family ─────────────────────────────────────
  "v1_b_28_q_011": {
    question_text: "Only ______ electricians are permitted to inspect the building's wiring.",
    options: { A: "certify", B: "certifying", C: "certified", D: "certification" },
    correct_answer: "C",
    explanation_zh: "___ electricians 名詞前要用形容詞。正確答案是 certified。"
  },
  "v1_b_28_q_012": {
    question_text: "Completing the course grants a ______ recognized by major industry bodies.",
    options: { A: "certifying", B: "certification", C: "certify", D: "certified" },
    correct_answer: "B",
    explanation_zh: "grants a ___ 後接名詞。正確答案是 certification。"
  },
  "v1_b_28_q_013": {
    question_text: "The ______ process involves both written exams and practical assessments.",
    options: { A: "certification", B: "certify", C: "certified", D: "certifying" },
    correct_answer: "A",
    explanation_zh: "The ___ process 名詞修飾。正確答案是 certification。"
  },
  "v1_b_28_q_015": {
    question_text: "The employee submitted her industry ______ to the HR department upon hire.",
    options: { A: "certified", B: "certifying", C: "certification", D: "certify" },
    correct_answer: "C",
    explanation_zh: "her industry ___ 後接名詞。正確答案是 certification。"
  },
  "v1_b_28_q_018": {
    question_text: "The lab must ______ all test results before sending reports to clients.",
    options: { A: "certification", B: "certified", C: "certifying", D: "certify" },
    correct_answer: "D",
    explanation_zh: "must 後接動詞原形。正確答案是 certify。"
  },
  "v1_b_28_rv_022": {
    question_text: "The agency was responsible for ______ all field equipment before deployment.",
    options: { A: "certification", B: "certify", C: "certified", D: "certifying" },
    correct_answer: "D",
    explanation_zh: "responsible for ___ 後接動名詞。正確答案是 certifying。"
  },
  "v1_b_28_rv_023": {
    question_text: "A valid product ______ is required before distribution to retailers begins.",
    options: { A: "certified", B: "certifying", C: "certification", D: "certify" },
    correct_answer: "C",
    explanation_zh: "A valid product ___ 後接名詞。正確答案是 certification。"
  },
  "v1_b_28_rv_024": {
    question_text: "The company was proud of its ISO ______ for quality management standards.",
    options: { A: "certifying", B: "certification", C: "certify", D: "certified" },
    correct_answer: "B",
    explanation_zh: "its ISO ___ 後接名詞。正確答案是 certification。"
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
