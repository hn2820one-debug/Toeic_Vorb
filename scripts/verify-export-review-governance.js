const fs = require("fs");
const path = require("path");

const repoRoot = path.join(__dirname, "..");
const files = {
  policy: path.join(repoRoot, "drafts", "v0-v3-rebuild", "export_analysis_review_policy.json"),
  reviewCycle: path.join(repoRoot, "drafts", "v0-v3-rebuild", "export_review_cycles", "2026-05-19-c06-seeded-fixture-review.json"),
  governanceDoc: path.join(repoRoot, "docs", "export-analysis-feedback-governance.md"),
  template: path.join(repoRoot, "docs", "templates", "export-content-review-template.md"),
  exportView: path.join(repoRoot, "js", "views", "export.js"),
  packageJson: path.join(repoRoot, "package.json"),
  uiRegression: path.join(repoRoot, "tests", "ui-regression.spec.ts"),
  exportFlow: path.join(repoRoot, "tests", "export-flow.spec.ts"),
  reviewMode: path.join(repoRoot, "tests", "review-mode.spec.ts"),
  seededUi: path.join(repoRoot, "tests", "seeded-ui-regression.spec.ts"),
  v2v3Content: path.join(repoRoot, "tests", "v2-v3-content.spec.ts")
};

const REQUIRED_METRIC_IDS = [
  "attempt_volume",
  "accuracy_by_stage_lesson_type",
  "avg_response_time_by_type",
  "speed_bucket_distribution",
  "error_code_distribution",
  "repeated_error_rate",
  "review_fix_rate",
  "target_item_mastery",
  "review_queue_pressure",
  "content_quality_flags",
  "stage_readiness",
  "diagnostic_status"
];

const REQUIRED_DECISIONS = [
  "keep",
  "revise_question_text",
  "revise_distractors",
  "revise_explanation",
  "add_review_pressure",
  "reduce_or_remove_item",
  "add_prerequisite_lesson",
  "promote_to_next_wave",
  "hold_for_more_data"
];

function read(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

function readJson(filePath) {
  return JSON.parse(read(filePath));
}

function check(id, pass, detail, severity = "error") {
  return { id, pass, detail, severity };
}

function normalizeRequiredFile(fileName) {
  return fileName === "toeic_vocab_export_YYYY-MM-DD.json"
    ? "toeic_vocab_export_${date}.json"
    : fileName;
}

function unique(values) {
  return new Set(values).size === values.length;
}

function main() {
  const policy = readJson(files.policy);
  const reviewCycle = readJson(files.reviewCycle);
  const governanceDoc = read(files.governanceDoc);
  const template = read(files.template);
  const exportView = read(files.exportView);
  const packageJson = readJson(files.packageJson);
  const uiRegression = read(files.uiRegression);
  const exportFlow = read(files.exportFlow);
  const reviewMode = read(files.reviewMode);
  const seededUi = read(files.seededUi);
  const v2v3Content = read(files.v2v3Content);

  const requiredFiles = (policy.required_export_files || []).map((row) => row.file);
  const requiredMetricIds = (policy.core_metrics || []).map((row) => row.id);
  const requiredDecisions = policy.decision_actions || [];
  const cycleFiles = (reviewCycle.files_reviewed || []).map((row) => row.file);
  const cycleMetrics = (reviewCycle.metrics_reviewed || []).map((row) => row.metric);

  const checks = [
    check(
      "policy_identity",
      policy.artifact === "export_analysis_review_policy"
        && policy.status === "active_governance"
        && policy.production_impact === "none"
        && policy.production_ready === false,
      "Export analysis review policy is active governance with no production impact."
    ),
    check(
      "required_file_list",
      requiredFiles.length >= 24 && unique(requiredFiles),
      `Policy defines a unique required export file list (${requiredFiles.length} files).`
    ),
    check(
      "required_files_exist_in_export_builder",
      requiredFiles.every((fileName) => exportView.includes(normalizeRequiredFile(fileName))),
      "Every required export-review file is present in js/views/export.js."
    ),
    check(
      "core_metric_list",
      REQUIRED_METRIC_IDS.every((id) => requiredMetricIds.includes(id)),
      "Policy defines all required export feedback metrics."
    ),
    check(
      "decision_action_list",
      REQUIRED_DECISIONS.every((decision) => requiredDecisions.includes(decision)),
      "Policy defines all required review decision actions."
    ),
    check(
      "governance_doc_references",
      [
        "Required Files",
        "Core Metrics",
        "Review Decisions",
        "Feedback Loop",
        "First Process Validation",
        "npm run test:export-governance"
      ].every((token) => governanceDoc.includes(token)),
      "Governance doc includes required workflow sections and command."
    ),
    check(
      "template_file_coverage",
      requiredFiles.every((fileName) => template.includes(fileName)),
      "Review template includes every required export file."
    ),
    check(
      "template_metric_coverage",
      [
        "Attempt volume",
        "Accuracy by stage",
        "Average response time by type",
        "Speed bucket distribution",
        "Error-code distribution",
        "Repeated-error rate",
        "Review fix rate",
        "Content-quality flags",
        "Diagnostic status"
      ].every((token) => template.includes(token)),
      "Review template includes the core metric snapshot fields."
    ),
    check(
      "review_cycle_identity",
      reviewCycle.review_id === "export_review_2026_05_19_c06_seeded_fixture"
        && reviewCycle.status === "passed_for_process_validation"
        && reviewCycle.production_seed_changed === false,
      "Sample review cycle records the C-06 seeded-fixture process validation without production seed changes."
    ),
    check(
      "review_cycle_file_coverage",
      requiredFiles.every((fileName) => cycleFiles.includes(fileName)),
      "Sample review cycle covers every required export file."
    ),
    check(
      "review_cycle_metric_coverage",
      REQUIRED_METRIC_IDS.every((id) => cycleMetrics.includes(id)),
      "Sample review cycle covers every required metric."
    ),
    check(
      "review_cycle_feedback",
      Array.isArray(reviewCycle.feedback_actions)
        && reviewCycle.feedback_actions.some((row) => row.target === "docs/Future Plan.md")
        && Array.isArray(reviewCycle.findings)
        && reviewCycle.findings.some((row) => row.decision === "hold_for_more_data"),
      "Sample review cycle records feedback targets and an insufficient-production-data decision."
    ),
    check(
      "playwright_inventory_coverage",
      requiredFiles
        .filter((fileName) => fileName !== "toeic_vocab_export_YYYY-MM-DD.json")
        .every((fileName) => uiRegression.includes(fileName))
        && uiRegression.includes("toeic_vocab_export_\\d{4}-\\d{2}-\\d{2}\\.json"),
      "UI regression test verifies visible export inventory and dynamic package file."
    ),
    check(
      "playwright_export_flow_coverage",
      exportFlow.includes("匯出完整資料封包")
        && exportFlow.includes("exportDownloads.length")
        && exportFlow.includes("summary.md"),
      "Export-flow test verifies package fallback downloads and summary file access."
    ),
    check(
      "playwright_review_effectiveness_coverage",
      reviewMode.includes("review_effectiveness.csv")
        && reviewMode.includes("target_item")
        && reviewMode.includes("error_code"),
      "Review-mode test verifies review_effectiveness.csv content."
    ),
    check(
      "playwright_seeded_export_coverage",
      seededUi.includes("diagnostic_recommendation.json")
        && seededUi.includes("insufficient_data")
        && v2v3Content.includes("_attempts.csv")
        && v2v3Content.includes("_raw_events.jsonl")
        && v2v3Content.includes("scene_vocabulary")
        && v2v3Content.includes("part6_context_choice"),
      "Seeded UI and V2/V3 tests verify diagnostic and representative attempts/raw-events export content."
    ),
    check(
      "package_scripts",
      packageJson.scripts?.["test:export-governance"] === "node scripts/verify-export-review-governance.js"
        && String(packageJson.scripts?.["test:all"] || "").includes("node scripts/verify-export-review-governance.js"),
      "package.json exposes test:export-governance and includes it in test:all."
    )
  ];

  const failures = checks.filter((row) => !row.pass && row.severity !== "warning");
  const report = {
    verified_at: new Date().toISOString(),
    script: "scripts/verify-export-review-governance.js",
    policy: "drafts/v0-v3-rebuild/export_analysis_review_policy.json",
    status: failures.length === 0 ? "passed" : "failed",
    summary: {
      checks_total: checks.length,
      checks_passed: checks.filter((row) => row.pass).length,
      errors: failures.length,
      required_export_files: requiredFiles.length,
      required_metrics: requiredMetricIds.length
    },
    checks
  };

  console.log(JSON.stringify(report, null, 2));

  if (failures.length > 0) {
    process.exit(1);
  }
}

main();
