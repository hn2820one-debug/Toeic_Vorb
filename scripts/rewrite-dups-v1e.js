// Rewrite all duplicate questions in V1-E lessons 45–52 (P3-1, round 9)
// Run: node scripts/rewrite-dups-v1e.js

const fs = require("fs");
const path = require("path");
const FILE = path.join(__dirname, "../data/vocab/questions_v1e.json");

const REWRITES = {

  // ── Lesson 45 · maintain_family ─────────────────────────────────────────
  "v1_e_45_q_005": {
    question_text: "The service contract covered both ______ and support for the first year.",
    options: { A: "maintain", B: "maintained", C: "maintaining", D: "maintenance" },
    correct_answer: "D",
    explanation_zh: "both ___ and support 後接名詞。正確答案是 maintenance。"
  },
  "v1_e_45_q_008": {
    question_text: "The building requires regular ______ to keep all systems running efficiently.",
    options: { A: "maintenance", B: "maintain", C: "maintained", D: "maintaining" },
    correct_answer: "A",
    explanation_zh: "regular ___ 後接名詞。正確答案是 maintenance。"
  },
  "v1_e_45_q_011": {
    question_text: "The annual ______ schedule was posted on the company notice board.",
    options: { A: "maintaining", B: "maintenance", C: "maintain", D: "maintained" },
    correct_answer: "B",
    explanation_zh: "The annual ___ schedule 名詞修飾。正確答案是 maintenance。"
  },
  "v1_e_45_q_015": {
    question_text: "The factory hired a specialist for equipment ______ and emergency repairs.",
    options: { A: "maintaining", B: "maintenance", C: "maintain", D: "maintained" },
    correct_answer: "B",
    explanation_zh: "equipment ___ and repairs 後接名詞。正確答案是 maintenance。"
  },
  "v1_e_45_rv_023": {
    question_text: "Proper ______ of machinery significantly extends its operational lifespan.",
    options: { A: "maintaining", B: "maintenance", C: "maintain", D: "maintained" },
    correct_answer: "B",
    explanation_zh: "Proper ___ of 後接名詞作主語。正確答案是 maintenance。"
  },

  // ── Lesson 46 · inspect_family ──────────────────────────────────────────
  "v1_e_46_q_005": {
    question_text: "A routine fire safety ______ was conducted by the local authorities.",
    options: { A: "inspect", B: "inspecting", C: "inspection", D: "inspector" },
    correct_answer: "C",
    explanation_zh: "A routine fire safety ___ 後接名詞。正確答案是 inspection。"
  },
  "v1_e_46_q_008": {
    question_text: "The goods passed the quality ______ before being shipped to retailers.",
    options: { A: "inspector", B: "inspect", C: "inspecting", D: "inspection" },
    correct_answer: "D",
    explanation_zh: "the quality ___ 後接名詞。正確答案是 inspection。"
  },
  "v1_e_46_q_009": {
    question_text: "The vehicle must pass a safety ______ before it can be officially registered.",
    options: { A: "inspect", B: "inspecting", C: "inspection", D: "inspector" },
    correct_answer: "C",
    explanation_zh: "a safety ___ 後接名詞。正確答案是 inspection。"
  },
  "v1_e_46_q_011": {
    question_text: "A surprise ______ found several violations in the food processing plant.",
    options: { A: "inspection", B: "inspector", C: "inspect", D: "inspecting" },
    correct_answer: "A",
    explanation_zh: "A surprise ___ 後接名詞。正確答案是 inspection。"
  },
  "v1_e_46_q_012": {
    question_text: "The factory passed its annual safety ______ without any recorded violations.",
    options: { A: "inspector", B: "inspect", C: "inspecting", D: "inspection" },
    correct_answer: "D",
    explanation_zh: "its annual safety ___ 後接名詞。正確答案是 inspection。"
  },
  "v1_e_46_q_013": {
    question_text: "The customs agent ordered a thorough ______ of the incoming cargo container.",
    options: { A: "inspect", B: "inspecting", C: "inspection", D: "inspector" },
    correct_answer: "C",
    explanation_zh: "a thorough ___ of 後接名詞。正確答案是 inspection。"
  },

  // ── Lesson 47 · install_family ──────────────────────────────────────────
  "v1_e_47_q_005": {
    question_text: "The instruction guide provided step-by-step directions for the ______.",
    options: { A: "installing", B: "installation", C: "install", D: "installed" },
    correct_answer: "B",
    explanation_zh: "directions for the ___ 後接名詞。正確答案是 installation。"
  },
  "v1_e_47_q_008": {
    question_text: "The technician completed the software ______ in under an hour.",
    options: { A: "installed", B: "installing", C: "installation", D: "install" },
    correct_answer: "C",
    explanation_zh: "the software ___ 後接名詞。正確答案是 installation。"
  },
  "v1_e_47_q_011": {
    question_text: "A specialized team handled the ______ of all new server equipment.",
    options: { A: "install", B: "installed", C: "installing", D: "installation" },
    correct_answer: "D",
    explanation_zh: "the ___ of 後接名詞。正確答案是 installation。"
  },
  "v1_e_47_q_015": {
    question_text: "The new lighting ______ significantly improved visibility throughout the office.",
    options: { A: "install", B: "installed", C: "installing", D: "installation" },
    correct_answer: "D",
    explanation_zh: "The new lighting ___ 後接名詞。正確答案是 installation。"
  },
  "v1_e_47_rv_023": {
    question_text: "The HVAC system ______ was completed ahead of the scheduled deadline.",
    options: { A: "install", B: "installed", C: "installing", D: "installation" },
    correct_answer: "D",
    explanation_zh: "The HVAC system ___ 後接名詞。正確答案是 installation。"
  },

  // ── Lesson 48 · operate_family ──────────────────────────────────────────
  "v1_e_48_q_007": {
    question_text: "The new business ______ model reduced overhead costs by twenty percent.",
    options: { A: "operational", B: "operating", C: "operation", D: "operate" },
    correct_answer: "C",
    explanation_zh: "The new business ___ model 名詞修飾。正確答案是 operation。"
  },
  "v1_e_48_q_008": {
    question_text: "The company's global ______ expanded to three new countries this year.",
    options: { A: "operating", B: "operation", C: "operate", D: "operational" },
    correct_answer: "B",
    explanation_zh: "global ___ 後接名詞。正確答案是 operation。"
  },
  "v1_e_48_q_009": {
    question_text: "The airline resumed full ______ after the temporary weather disruption.",
    options: { A: "operation", B: "operate", C: "operational", D: "operating" },
    correct_answer: "A",
    explanation_zh: "full ___ 後接名詞。正確答案是 operation。"
  },
  "v1_e_48_q_012": {
    question_text: "Continuous ______ throughout the public holiday period was approved.",
    options: { A: "operating", B: "operation", C: "operate", D: "operational" },
    correct_answer: "B",
    explanation_zh: "Continuous ___ 後接名詞作主語。正確答案是 operation。"
  },
  "v1_e_48_q_013": {
    question_text: "The day-to-day ______ of the store is managed by a team of ten staff.",
    options: { A: "operation", B: "operate", C: "operational", D: "operating" },
    correct_answer: "A",
    explanation_zh: "The day-to-day ___ of 後接名詞。正確答案是 operation。"
  },
  "v1_e_48_q_015": {
    question_text: "The smooth ______ of the factory depends on regular equipment maintenance.",
    options: { A: "operational", B: "operating", C: "operation", D: "operate" },
    correct_answer: "C",
    explanation_zh: "The smooth ___ of 後接名詞。正確答案是 operation。"
  },
  "v1_e_48_rv_023": {
    question_text: "The offshore ______ contributed significantly to the company's annual revenues.",
    options: { A: "operational", B: "operating", C: "operation", D: "operate" },
    correct_answer: "C",
    explanation_zh: "The offshore ___ 後接名詞。正確答案是 operation。"
  },

  // ── Lesson 49 · repair_family ────────────────────────────────────────────
  "v1_e_49_q_005": {
    question_text: "The technician was sent to the site to carry out the ______.",
    options: { A: "repaired", B: "repairing", C: "repairment", D: "repair" },
    correct_answer: "D",
    explanation_zh: "carry out the ___ 後接名詞。正確答案是 repair。"
  },
  "v1_e_49_q_008": {
    question_text: "The roof ______ was completed just before the start of the rainy season.",
    options: { A: "repair", B: "repaired", C: "repairing", D: "repairment" },
    correct_answer: "A",
    explanation_zh: "The roof ___ 後接名詞。正確答案是 repair。"
  },
  "v1_e_49_q_011": {
    question_text: "The estimate for the ______ was reviewed and approved by the property manager.",
    options: { A: "repairment", B: "repair", C: "repaired", D: "repairing" },
    correct_answer: "B",
    explanation_zh: "the estimate for the ___ 後接名詞。正確答案是 repair。"
  },
  "v1_e_49_q_015": {
    question_text: "The client requested an urgent ______ of the broken heating system.",
    options: { A: "repairment", B: "repair", C: "repaired", D: "repairing" },
    correct_answer: "B",
    explanation_zh: "an urgent ___ of 後接名詞。正確答案是 repair。"
  },
  "v1_e_49_rv_023": {
    question_text: "The ______ was completed within the agreed two-business-day timeframe.",
    options: { A: "repairment", B: "repair", C: "repaired", D: "repairing" },
    correct_answer: "B",
    explanation_zh: "The ___ was completed 後接名詞。正確答案是 repair。"
  },

  // ── Lesson 50 · renovate_family ──────────────────────────────────────────
  "v1_e_50_q_005": {
    question_text: "The building required a full structural ______ before it could reopen.",
    options: { A: "renovated", B: "renovating", C: "renovation", D: "renovate" },
    correct_answer: "C",
    explanation_zh: "a full structural ___ 後接名詞。正確答案是 renovation。"
  },
  "v1_e_50_q_008": {
    question_text: "The hotel underwent a complete interior ______ during the winter season.",
    options: { A: "renovate", B: "renovated", C: "renovating", D: "renovation" },
    correct_answer: "D",
    explanation_zh: "a complete interior ___ 後接名詞。正確答案是 renovation。"
  },
  "v1_e_50_q_011": {
    question_text: "The kitchen ______ added significant value to the commercial property.",
    options: { A: "renovation", B: "renovate", C: "renovated", D: "renovating" },
    correct_answer: "A",
    explanation_zh: "The kitchen ___ 後接名詞。正確答案是 renovation。"
  },
  "v1_e_50_q_015": {
    question_text: "The ______ project was expected to take approximately six months to complete.",
    options: { A: "renovation", B: "renovate", C: "renovated", D: "renovating" },
    correct_answer: "A",
    explanation_zh: "The ___ project 名詞修飾。正確答案是 renovation。"
  },
  "v1_e_50_rv_023": {
    question_text: "The office ______ was funded entirely by the company's capital expenditure budget.",
    options: { A: "renovation", B: "renovate", C: "renovated", D: "renovating" },
    correct_answer: "A",
    explanation_zh: "The office ___ 後接名詞。正確答案是 renovation。"
  },

  // ── Lesson 51 · equip_family ─────────────────────────────────────────────
  "v1_e_51_q_005": {
    question_text: "All kitchen ______ was cleaned and carefully inspected before the reopening.",
    options: { A: "equipping", B: "equipment", C: "equip", D: "equipped" },
    correct_answer: "B",
    explanation_zh: "kitchen ___ 後接名詞。正確答案是 equipment。"
  },
  "v1_e_51_q_008": {
    question_text: "The laboratory replaced all outdated testing ______ with modern instruments.",
    options: { A: "equipped", B: "equipping", C: "equipment", D: "equip" },
    correct_answer: "C",
    explanation_zh: "outdated testing ___ 後接名詞。正確答案是 equipment。"
  },
  "v1_e_51_q_011": {
    question_text: "The office manager ordered new computer ______ for the entire sales team.",
    options: { A: "equip", B: "equipped", C: "equipping", D: "equipment" },
    correct_answer: "D",
    explanation_zh: "new computer ___ 後接名詞。正確答案是 equipment。"
  },
  "v1_e_51_q_015": {
    question_text: "Workers must return all safety ______ at the end of each work shift.",
    options: { A: "equip", B: "equipped", C: "equipping", D: "equipment" },
    correct_answer: "D",
    explanation_zh: "safety ___ 後接名詞。正確答案是 equipment。"
  },
  "v1_e_51_rv_023": {
    question_text: "The new manufacturing ______ reduced total production time by thirty percent.",
    options: { A: "equip", B: "equipped", C: "equipping", D: "equipment" },
    correct_answer: "D",
    explanation_zh: "manufacturing ___ 後接名詞。正確答案是 equipment。"
  },

  // ── Lesson 52 · calibrate_family ────────────────────────────────────────
  "v1_e_52_q_005": {
    question_text: "Accurate readings depend entirely on the regular ______ of all instruments.",
    options: { A: "calibration", B: "calibrate", C: "calibrated", D: "calibrating" },
    correct_answer: "A",
    explanation_zh: "regular ___ of 後接名詞。正確答案是 calibration。"
  },
  "v1_e_52_q_008": {
    question_text: "A precise ______ of all sensors was required before testing could begin.",
    options: { A: "calibrating", B: "calibration", C: "calibrate", D: "calibrated" },
    correct_answer: "B",
    explanation_zh: "A precise ___ of 後接名詞。正確答案是 calibration。"
  },
  "v1_e_52_q_011": {
    question_text: "The lab manager scheduled monthly ______ of all pressure measurement gauges.",
    options: { A: "calibrated", B: "calibrating", C: "calibration", D: "calibrate" },
    correct_answer: "C",
    explanation_zh: "monthly ___ of 後接名詞。正確答案是 calibration。"
  },
  "v1_e_52_q_015": {
    question_text: "The engineer performed a full ______ of the temperature measurement instruments.",
    options: { A: "calibrated", B: "calibrating", C: "calibration", D: "calibrate" },
    correct_answer: "C",
    explanation_zh: "a full ___ of 後接名詞。正確答案是 calibration。"
  },
  "v1_e_52_rv_023": {
    question_text: "Quarterly ______ ensures that all measurement devices remain consistently accurate.",
    options: { A: "calibrated", B: "calibrating", C: "calibration", D: "calibrate" },
    correct_answer: "C",
    explanation_zh: "Quarterly ___ ensures 後接名詞作主語。正確答案是 calibration。"
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
console.log(`Rewrote ${count} questions in questions_v1e.json`);
