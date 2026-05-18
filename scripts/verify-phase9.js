const fs = require("fs");
const path = require("path");

const repoRoot = path.join(__dirname, "..");

const files = {
  helper: path.join(repoRoot, "scripts", "collocation-rebuild-helpers.js"),
  lessonMapper: path.join(repoRoot, "scripts", "map-collocation-blueprint-to-app-schema.js"),
  questionShellBuilder: path.join(repoRoot, "scripts", "generate-collocation-wave1-draft-bank.js"),
  policyBuilder: path.join(repoRoot, "scripts", "build-collocation-phase6-authoring-policy.js"),
  questionShells: path.join(repoRoot, "drafts", "collocation-rebuild", "wave1_question_shells.json"),
  vocabSeedDraft: path.join(repoRoot, "drafts", "collocation-rebuild", "wave1_vocab_items_seed_draft.json"),
  sentenceBank: path.join(repoRoot, "drafts", "collocation-rebuild", "wave1_sentence_context_bank.json"),
  distractorBank: path.join(repoRoot, "drafts", "collocation-rebuild", "wave1_distractor_reference_bank.json"),
  explanationBank: path.join(repoRoot, "drafts", "collocation-rebuild", "wave1_explanation_reference_bank.json")
};

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function check(id, pass, detail, severity = "error") {
  return { id, pass, detail, severity };
}

function sortedUnique(values) {
  return [...new Set(values)].sort();
}

function sameStringSet(left, right) {
  if (left.length !== right.length) return false;
  return left.every((value, index) => value === right[index]);
}

function main() {
  const write = process.argv.includes("--write");
  const questionShells = readJson(files.questionShells);
  const vocabSeedDraft = readJson(files.vocabSeedDraft);
  const sentenceBank = readJson(files.sentenceBank);
  const distractorBank = readJson(files.distractorBank);
  const explanationBank = readJson(files.explanationBank);

  const helperSource = fs.readFileSync(files.helper, "utf8");
  const lessonMapper = fs.readFileSync(files.lessonMapper, "utf8");
  const questionShellBuilder = fs.readFileSync(files.questionShellBuilder, "utf8");
  const policyBuilder = fs.readFileSync(files.policyBuilder, "utf8");

  const targetIds = new Set(questionShells.questions.map((question) => question.target_item_id));
  const questionIds = sortedUnique(questionShells.questions.map((question) => question.question_id));
  const sentenceQuestionIds = sortedUnique(sentenceBank.entries.map((entry) => entry.question_id));
  const explanationQuestionIds = sortedUnique(explanationBank.entries.map((entry) => entry.question_id));
  const distractorTargetIds = sortedUnique(distractorBank.targets.map((target) => target.target_item_id));
  const shellTargetIds = sortedUnique([...targetIds]);
  const distractorCoverage = distractorBank.targets.every((target) => (
    target.reference_candidate_count + target.teacher_written_slots_required >= 4
  ));

  const checks = [
    check("shared_helper_exists", helperSource.includes("module.exports"), "Shared collocation rebuild helper module exists."),
    check(
      "shared_helper_adopted",
      lessonMapper.includes('require("./collocation-rebuild-helpers")')
        && questionShellBuilder.includes('require("./collocation-rebuild-helpers")')
        && policyBuilder.includes('require("./collocation-rebuild-helpers")'),
      "Core collocation rebuild scripts use the shared helper layer."
    ),
    check(
      "step45_seed_count",
      vocabSeedDraft.totals.item_count === 100,
      `Wave 1 vocab seed rows = ${vocabSeedDraft.totals.item_count}`
    ),
    check(
      "question_shell_count",
      questionShells.totals.question_count === 384,
      `Wave 1 question shells = ${questionShells.totals.question_count}`
    ),
    check(
      "sentence_bank_matches_shells",
      sentenceBank.totals.entry_count === questionShells.questions.length,
      `Sentence/context entries = ${sentenceBank.totals.entry_count}`
    ),
    check(
      "sentence_bank_question_id_alignment",
      sameStringSet(sentenceQuestionIds, questionIds),
      `Sentence/context question_id coverage = ${sentenceQuestionIds.length}`
    ),
    check(
      "sentence_bank_target_alignment",
      sentenceBank.totals.target_item_count === shellTargetIds.length,
      `Sentence/context target coverage = ${sentenceBank.totals.target_item_count}`
    ),
    check(
      "distractor_bank_target_coverage",
      distractorBank.totals.target_item_count === targetIds.size,
      `Distractor bank target rows = ${distractorBank.totals.target_item_count}`
    ),
    check(
      "distractor_bank_target_id_alignment",
      sameStringSet(distractorTargetIds, shellTargetIds),
      `Distractor bank target_id coverage = ${distractorTargetIds.length}`
    ),
    check(
      "distractor_bank_slot_floor",
      distractorCoverage,
      "Every target has at least four total distractor authoring slots (reference candidates + teacher-written requirement)."
    ),
    check(
      "explanation_bank_matches_shells",
      explanationBank.totals.entry_count === questionShells.questions.length,
      `Explanation entries = ${explanationBank.totals.entry_count}`
    ),
    check(
      "explanation_bank_question_id_alignment",
      sameStringSet(explanationQuestionIds, questionIds),
      `Explanation question_id coverage = ${explanationQuestionIds.length}`
    ),
    check(
      "explanation_bank_target_alignment",
      explanationBank.totals.target_item_count === shellTargetIds.length,
      `Explanation target coverage = ${explanationBank.totals.target_item_count}`
    ),
    check(
      "phase9_outputs_draft_only",
      sentenceBank.production_merge_allowed === false
        && distractorBank.production_merge_allowed === false
        && explanationBank.production_merge_allowed === false,
      "Phase 9 outputs remain draft-only and block production merge."
    ),
    check(
      "sentence_bank_has_prompts",
      sentenceBank.entries.every((entry) => String(entry.authoring_prompt || "").trim()),
      "Sentence/context bank entries all include authoring prompts."
    ),
    check(
      "explanation_bank_has_templates",
      explanationBank.entries.every((entry) => String(entry.template_preview || "").trim()),
      "Explanation bank entries all include template previews."
    )
  ];

  const failures = checks.filter((row) => !row.pass && row.severity !== "warning");
  const report = {
    verified_at: new Date().toISOString(),
    script: "scripts/verify-phase9.js",
    phase: 9,
    status: failures.length === 0 ? "passed" : "failed",
    summary: {
      checks_total: checks.length,
      checks_passed: checks.filter((row) => row.pass).length,
      errors: failures.length
    },
    checks
  };

  if (write && failures.length === 0) {
    for (const artifact of [sentenceBank, distractorBank, explanationBank]) {
      artifact.last_verified_at = report.verified_at;
    }
    fs.writeFileSync(files.sentenceBank, `${JSON.stringify(sentenceBank, null, 2)}\n`, "utf8");
    fs.writeFileSync(files.distractorBank, `${JSON.stringify(distractorBank, null, 2)}\n`, "utf8");
    fs.writeFileSync(files.explanationBank, `${JSON.stringify(explanationBank, null, 2)}\n`, "utf8");
  }

  console.log(JSON.stringify(report, null, 2));
  if (failures.length > 0) process.exit(1);
}

main();