// Rewrite all duplicate questions in V1-D lessons 37–44 (P3-1, round 8)
// Run: node scripts/rewrite-dups-v1d.js

const fs = require("fs");
const path = require("path");
const FILE = path.join(__dirname, "../data/vocab/questions_v1d.json");

const REWRITES = {

  // ── Lesson 37 · propose_family ───────────────────────────────────────────
  "v1_d_37_q_005": {
    question_text: "The team prepared a comprehensive ______ for the new product launch.",
    options: { A: "propose", B: "proposed", C: "proposing", D: "proposal" },
    correct_answer: "D",
    explanation_zh: "a comprehensive ___ 後接名詞。正確答案是 proposal。"
  },
  "v1_d_37_q_008": {
    question_text: "The board accepted the annual ______ for expanding the sales division.",
    options: { A: "proposal", B: "propose", C: "proposed", D: "proposing" },
    correct_answer: "A",
    explanation_zh: "the annual ___ 後接名詞。正確答案是 proposal。"
  },
  "v1_d_37_q_011": {
    question_text: "The manager submitted the budget ______ well before the deadline.",
    options: { A: "proposing", B: "proposal", C: "propose", D: "proposed" },
    correct_answer: "B",
    explanation_zh: "the budget ___ 後接名詞。正確答案是 proposal。"
  },
  "v1_d_37_q_015": {
    question_text: "The supplier submitted a detailed ______ for the construction project.",
    options: { A: "proposing", B: "proposal", C: "propose", D: "proposed" },
    correct_answer: "B",
    explanation_zh: "a detailed ___ 後接名詞。正確答案是 proposal。"
  },
  "v1_d_37_rv_023": {
    question_text: "All contractors must submit a formal ______ before starting any work.",
    options: { A: "proposing", B: "proposal", C: "propose", D: "proposed" },
    correct_answer: "B",
    explanation_zh: "a formal ___ 後接名詞。正確答案是 proposal。"
  },

  // ── Lesson 38 · confirm_family ───────────────────────────────────────────
  "v1_d_38_q_005": {
    question_text: "Please send us a written ______ of your attendance at the event.",
    options: { A: "confirmed", B: "confirming", C: "confirmation", D: "confirm" },
    correct_answer: "C",
    explanation_zh: "a written ___ of 後接名詞。正確答案是 confirmation。"
  },
  "v1_d_38_q_008": {
    question_text: "The travel agent emailed a flight ______ to the client after booking.",
    options: { A: "confirm", B: "confirmed", C: "confirming", D: "confirmation" },
    correct_answer: "D",
    explanation_zh: "a flight ___ 後接名詞。正確答案是 confirmation。"
  },
  "v1_d_38_q_011": {
    question_text: "The hotel sent a room ______ along with the check-in instructions.",
    options: { A: "confirmation", B: "confirm", C: "confirmed", D: "confirming" },
    correct_answer: "A",
    explanation_zh: "a room ___ 後接名詞。正確答案是 confirmation。"
  },
  "v1_d_38_q_015": {
    question_text: "An order ______ was automatically sent to the customer after purchase.",
    options: { A: "confirmation", B: "confirm", C: "confirmed", D: "confirming" },
    correct_answer: "A",
    explanation_zh: "An order ___ 後接名詞。正確答案是 confirmation。"
  },
  "v1_d_38_rv_023": {
    question_text: "A ______ email will be sent once your payment has been processed.",
    options: { A: "confirmation", B: "confirm", C: "confirmed", D: "confirming" },
    correct_answer: "A",
    explanation_zh: "A ___ email 名詞修飾。正確答案是 confirmation。"
  },

  // ── Lesson 39 · notify_family ────────────────────────────────────────────
  "v1_d_39_q_005": {
    question_text: "A ______ was sent to all registered users about the upcoming update.",
    options: { A: "notifying", B: "notification", C: "notice", D: "notify" },
    correct_answer: "B",
    explanation_zh: "A ___ was sent 後接名詞。正確答案是 notification。"
  },
  "v1_d_39_q_008": {
    question_text: "Staff received an email ______ about the scheduled system maintenance.",
    options: { A: "notify", B: "notifying", C: "notification", D: "notice" },
    correct_answer: "C",
    explanation_zh: "an email ___ 後接名詞。正確答案是 notification。"
  },
  "v1_d_39_q_009": {
    question_text: "Each passenger received a flight delay ______ via text message.",
    options: { A: "notifying", B: "notification", C: "notice", D: "notify" },
    correct_answer: "B",
    explanation_zh: "a flight delay ___ 後接名詞。正確答案是 notification。"
  },
  "v1_d_39_q_011": {
    question_text: "The employee acknowledged the safety ______ by signing the form.",
    options: { A: "notice", B: "notify", C: "notifying", D: "notification" },
    correct_answer: "D",
    explanation_zh: "the safety ___ 後接名詞。正確答案是 notification。"
  },
  "v1_d_39_q_012": {
    question_text: "The system generates an automatic ______ upon successful order completion.",
    options: { A: "notify", B: "notifying", C: "notification", D: "notice" },
    correct_answer: "C",
    explanation_zh: "an automatic ___ 後接名詞。正確答案是 notification。"
  },
  "v1_d_39_q_013": {
    question_text: "A ______ about the revised working hours was issued to all departments.",
    options: { A: "notifying", B: "notification", C: "notice", D: "notify" },
    correct_answer: "B",
    explanation_zh: "A ___ about 後接名詞。正確答案是 notification。"
  },
  "v1_d_39_q_015": {
    question_text: "The app sends a push ______ whenever a new message is received.",
    options: { A: "notice", B: "notify", C: "notifying", D: "notification" },
    correct_answer: "D",
    explanation_zh: "a push ___ 後接名詞。正確答案是 notification。"
  },
  "v1_d_39_rv_023": {
    question_text: "The building manager sent a scheduled maintenance ______ to all tenants.",
    options: { A: "notice", B: "notify", C: "notifying", D: "notification" },
    correct_answer: "D",
    explanation_zh: "a maintenance ___ 後接名詞。正確答案是 notification。"
  },

  // ── Lesson 40 · revise_family ────────────────────────────────────────────
  "v1_d_40_q_005": {
    question_text: "The manager requested a complete ______ of the budget estimates.",
    options: { A: "revision", B: "revise", C: "revised", D: "revising" },
    correct_answer: "A",
    explanation_zh: "a complete ___ of 後接名詞。正確答案是 revision。"
  },
  "v1_d_40_q_008": {
    question_text: "The author made several updates after the first ______ of the draft.",
    options: { A: "revising", B: "revision", C: "revise", D: "revised" },
    correct_answer: "B",
    explanation_zh: "the first ___ of 後接名詞。正確答案是 revision。"
  },
  "v1_d_40_q_011": {
    question_text: "The committee recommended a major ______ of the company safety guidelines.",
    options: { A: "revised", B: "revising", C: "revision", D: "revise" },
    correct_answer: "C",
    explanation_zh: "a major ___ of 後接名詞。正確答案是 revision。"
  },
  "v1_d_40_q_015": {
    question_text: "The final ______ of the contract was approved by the legal department.",
    options: { A: "revised", B: "revising", C: "revision", D: "revise" },
    correct_answer: "C",
    explanation_zh: "The final ___ of 後接名詞。正確答案是 revision。"
  },
  "v1_d_40_rv_023": {
    question_text: "A thorough ______ of the employee handbook was completed last month.",
    options: { A: "revised", B: "revising", C: "revision", D: "revise" },
    correct_answer: "C",
    explanation_zh: "A thorough ___ of 後接名詞。正確答案是 revision。"
  },

  // ── Lesson 41 · distribute_family ───────────────────────────────────────
  "v1_d_41_q_005": {
    question_text: "Efficient ______ of goods is the key to maintaining customer satisfaction.",
    options: { A: "distributor", B: "distribute", C: "distributing", D: "distribution" },
    correct_answer: "D",
    explanation_zh: "Efficient ___ of 後接名詞作主語。正確答案是 distribution。"
  },
  "v1_d_41_q_008": {
    question_text: "The logistics team optimized the ______ route to cut delivery time.",
    options: { A: "distribution", B: "distributor", C: "distribute", D: "distributing" },
    correct_answer: "A",
    explanation_zh: "the ___ route 名詞修飾。正確答案是 distribution。"
  },
  "v1_d_41_q_009": {
    question_text: "The contract covered the exclusive ______ rights for the entire region.",
    options: { A: "distributor", B: "distribute", C: "distributing", D: "distribution" },
    correct_answer: "D",
    explanation_zh: "the exclusive ___ rights 名詞修飾。正確答案是 distribution。"
  },
  "v1_d_41_q_011": {
    question_text: "The new ______ center opened to serve customers across the southern region.",
    options: { A: "distributing", B: "distribution", C: "distributor", D: "distribute" },
    correct_answer: "B",
    explanation_zh: "the new ___ center 名詞修飾。正確答案是 distribution。"
  },
  "v1_d_41_q_012": {
    question_text: "The company expanded its ______ network to reach rural and remote areas.",
    options: { A: "distribution", B: "distributor", C: "distribute", D: "distributing" },
    correct_answer: "A",
    explanation_zh: "its ___ network 名詞修飾。正確答案是 distribution。"
  },
  "v1_d_41_q_013": {
    question_text: "The schedule outlined the ______ plan for the nationwide product launch.",
    options: { A: "distributor", B: "distribute", C: "distributing", D: "distribution" },
    correct_answer: "D",
    explanation_zh: "the ___ plan 名詞修飾。正確答案是 distribution。"
  },

  // ── Lesson 42 · present_family ──────────────────────────────────────────
  "v1_d_42_q_006": {
    question_text: "The keynote ______ was delivered to over two hundred conference attendees.",
    options: { A: "presentment", B: "presentation", C: "presenter", D: "present" },
    correct_answer: "B",
    explanation_zh: "The keynote ___ 後接名詞。正確答案是 presentation。"
  },
  "v1_d_42_q_008": {
    question_text: "The annual shareholder ______ covered the company's financial highlights.",
    options: { A: "presenter", B: "present", C: "presentment", D: "presentation" },
    correct_answer: "D",
    explanation_zh: "The annual shareholder ___ 後接名詞。正確答案是 presentation。"
  },
  "v1_d_42_q_009": {
    question_text: "The client was impressed by the product ______ given by the sales team.",
    options: { A: "present", B: "presentment", C: "presentation", D: "presenter" },
    correct_answer: "C",
    explanation_zh: "the product ___ 後接名詞。正確答案是 presentation。"
  },
  "v1_d_42_q_012": {
    question_text: "Each team had ten minutes to deliver its department ______ to management.",
    options: { A: "presenter", B: "present", C: "presentment", D: "presentation" },
    correct_answer: "D",
    explanation_zh: "its department ___ 後接名詞。正確答案是 presentation。"
  },
  "v1_d_42_q_013": {
    question_text: "A detailed ______ was prepared for the board of directors meeting.",
    options: { A: "present", B: "presentment", C: "presentation", D: "presenter" },
    correct_answer: "C",
    explanation_zh: "A detailed ___ 後接名詞。正確答案是 presentation。"
  },
  "v1_d_42_q_014": {
    question_text: "The marketing department's ______ successfully won the new client's approval.",
    options: { A: "presentment", B: "presentation", C: "presenter", D: "present" },
    correct_answer: "B",
    explanation_zh: "The department's ___ 後接名詞。正確答案是 presentation。"
  },

  // ── Lesson 43 · attach_family ───────────────────────────────────────────
  "v1_d_43_q_005": {
    question_text: "The application form was sent as an ______ to the welcome email.",
    options: { A: "attaching", B: "attachment", C: "attach", D: "attached" },
    correct_answer: "B",
    explanation_zh: "as an ___ 後接名詞。正確答案是 attachment。"
  },
  "v1_d_43_q_008": {
    question_text: "The email included a detailed ______ with all relevant project documents.",
    options: { A: "attached", B: "attaching", C: "attachment", D: "attach" },
    correct_answer: "C",
    explanation_zh: "a detailed ___ 後接名詞。正確答案是 attachment。"
  },
  "v1_d_43_q_011": {
    question_text: "The invoice was sent as a PDF ______ in the follow-up email.",
    options: { A: "attach", B: "attached", C: "attaching", D: "attachment" },
    correct_answer: "D",
    explanation_zh: "as a PDF ___ 後接名詞。正確答案是 attachment。"
  },
  "v1_d_43_q_015": {
    question_text: "Please review the ______ carefully before replying to the client inquiry.",
    options: { A: "attach", B: "attached", C: "attaching", D: "attachment" },
    correct_answer: "D",
    explanation_zh: "review the ___ 後接名詞。正確答案是 attachment。"
  },
  "v1_d_43_rv_023": {
    question_text: "All supporting documents were included as an ______ to the official report.",
    options: { A: "attach", B: "attached", C: "attaching", D: "attachment" },
    correct_answer: "D",
    explanation_zh: "as an ___ to 後接名詞。正確答案是 attachment。"
  },

  // ── Lesson 44 · respond_family ───────────────────────────────────────────
  "v1_d_44_q_007": {
    question_text: "The emergency ______ team arrived within minutes of receiving the alarm.",
    options: { A: "responsive", B: "responding", C: "response", D: "respond" },
    correct_answer: "C",
    explanation_zh: "The emergency ___ team 名詞修飾。正確答案是 response。"
  },
  "v1_d_44_q_008": {
    question_text: "The company issued an official ______ to address the media inquiry.",
    options: { A: "responding", B: "response", C: "respond", D: "responsive" },
    correct_answer: "B",
    explanation_zh: "an official ___ 後接名詞。正確答案是 response。"
  },
  "v1_d_44_q_009": {
    question_text: "A prompt ______ from the help desk resolved the technical issue quickly.",
    options: { A: "response", B: "respond", C: "responsive", D: "responding" },
    correct_answer: "A",
    explanation_zh: "A prompt ___ 後接名詞。正確答案是 response。"
  },
  "v1_d_44_q_012": {
    question_text: "Management issued a ______ clarifying its position on the policy matter.",
    options: { A: "responding", B: "response", C: "respond", D: "responsive" },
    correct_answer: "B",
    explanation_zh: "issued a ___ 後接名詞。正確答案是 response。"
  },
  "v1_d_44_q_013": {
    question_text: "The team prepared a detailed written ______ to the client's complaint.",
    options: { A: "response", B: "respond", C: "responsive", D: "responding" },
    correct_answer: "A",
    explanation_zh: "a detailed written ___ 後接名詞。正確答案是 response。"
  },
  "v1_d_44_q_015": {
    question_text: "The survey measured the customer ______ to the newly launched product.",
    options: { A: "responsive", B: "responding", C: "response", D: "respond" },
    correct_answer: "C",
    explanation_zh: "the customer ___ to 後接名詞。正確答案是 response。"
  },
  "v1_d_44_rv_023": {
    question_text: "The positive ______ from early users encouraged the team to invest further.",
    options: { A: "responsive", B: "responding", C: "response", D: "respond" },
    correct_answer: "C",
    explanation_zh: "The positive ___ from 後接名詞。正確答案是 response。"
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
console.log(`Rewrote ${count} questions in questions_v1d.json`);
