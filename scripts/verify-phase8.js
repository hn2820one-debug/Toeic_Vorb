/**
 * Verifies Phase 8 artifacts: V4-V6 reference packs, mixed-review architecture,
 * master lesson manifest, and MR script alignment.
 */

const fs = require("fs");
const path = require("path");

const repoRoot = path.join(__dirname, "..");

const files = {
  v4Pack: path.join(repoRoot, "drafts/v4-rebuild/v4_reference_pack.json"),
  v5Pack: path.join(repoRoot, "drafts/v5-rebuild/v5_reference_pack.json"),
  v6Pack: path.join(repoRoot, "drafts/v6-rebuild/v6_reference_pack.json"),
  mixedReview: path.join(repoRoot, "drafts/v0-v3-rebuild/mixed_review_architecture.json"),
  manifest: path.join(repoRoot, "drafts/v0-v3-rebuild/master_lesson_manifest.json"),
  stageMap: path.join(repoRoot, "drafts/v0-v3-rebuild/stage_map_v0_v3.json"),
  mixedReviewScript: path.join(repoRoot, "scripts/add-mixed-review-lessons.js"),
  curriculum: path.join(repoRoot, "data/vocab/curriculum.json")
};

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function check(id, pass, detail, severity = "error") {
  return { id, pass, detail, severity };
}

function main() {
  const write = process.argv.includes("--write");
  const v4 = readJson(files.v4Pack);
  const v5 = readJson(files.v5Pack);
  const v6 = readJson(files.v6Pack);
  const mixed = readJson(files.mixedReview);
  const manifest = readJson(files.manifest);
  const stageMap = readJson(files.stageMap);
  const curriculum = readJson(files.curriculum);
  const script = fs.readFileSync(files.mixedReviewScript, "utf8");

  const checks = [
    check("v4_pack_draft_only", v4.production_merge_allowed === false, "V4 pack blocks production merge."),
    check("v5_pack_planning", v5.scope.planned_total_lessons === 50, "V5 planned 50 lessons."),
    check("v6_pack_planning", v6.scope.planned_total_lessons === 40, "V6 planned 40 lessons."),
    check("v4_draft_slice", v4.scope.draft_slice_questions === 100, "V4 draft slice has 100 questions."),
    check("mixed_review_frozen", mixed.status === "planning_frozen", `mixed review status = ${mixed.status}`),
    check("mixed_review_canonical_mr", mixed.canonical_lesson_id_format.includes("MR"), "Canonical MR format defined."),
    check("manifest_frozen", manifest.status === "planning_frozen", `manifest status = ${manifest.status}`),
    check(
      "wave1_map_rows",
      manifest.wave1_production_id_map.length === 16,
      `wave1 map rows = ${manifest.wave1_production_id_map.length}`
    ),
    check(
      "manifest_stage_map_totals",
      manifest.v0_v3_target.total_lessons === stageMap.stage_totals.grand_total.total_lessons,
      "Manifest lesson total matches stage_map."
    ),
    check(
      "production_still_empty",
      (curriculum.lessons || []).length === 0,
      `curriculum lessons = ${(curriculum.lessons || []).length}`
    ),
    check(
      "mr_script_aligned",
      script.includes("${stage}-MR-") && !script.includes("${stage}-MIX-"),
      "Mixed-review script uses MR IDs only."
    ),
    check(
      "v4_plus_files_deduped",
      new Set(manifest.file_splitting_rules.v4_plus_files_planned).size
        === manifest.file_splitting_rules.v4_plus_files_planned.length,
      `v4+ planned files = ${manifest.file_splitting_rules.v4_plus_files_planned.length} unique entries`
    ),
    check(
      "embedded_manifest_checks",
      (manifest.consistency_checks?.status || "missing") === "passed",
      "Embedded manifest consistency checks passed."
    )
  ];

  const failures = checks.filter((row) => !row.pass && row.severity !== "warning");
  const report = {
    verified_at: new Date().toISOString(),
    script: "scripts/verify-phase8.js",
    phase: 8,
    status: failures.length === 0 ? "passed" : "failed",
    summary: {
      checks_total: checks.length,
      checks_passed: checks.filter((row) => row.pass).length,
      errors: failures.length
    },
    checks
  };

  if (write && failures.length === 0) {
    for (const artifact of [v4, v5, v6, mixed, manifest]) {
      artifact.last_verified_at = report.verified_at;
    }
    fs.writeFileSync(files.v4Pack, `${JSON.stringify(v4, null, 2)}\n`, "utf8");
    fs.writeFileSync(files.v5Pack, `${JSON.stringify(v5, null, 2)}\n`, "utf8");
    fs.writeFileSync(files.v6Pack, `${JSON.stringify(v6, null, 2)}\n`, "utf8");
    fs.writeFileSync(files.mixedReview, `${JSON.stringify(mixed, null, 2)}\n`, "utf8");
    fs.writeFileSync(files.manifest, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
  }

  console.log(JSON.stringify(report, null, 2));
  if (failures.length > 0) process.exit(1);
}

main();
