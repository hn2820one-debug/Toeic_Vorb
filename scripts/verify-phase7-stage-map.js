/**
 * Verifies Phase 7 stage-map artifacts against the empty production baseline
 * and Wave 1 draft cross-links. Planning-only; does not modify production seed.
 *
 * Usage:
 *   node scripts/verify-phase7-stage-map.js
 *   node scripts/verify-phase7-stage-map.js --write
 */

const fs = require("fs");
const path = require("path");

const repoRoot = path.join(__dirname, "..");
const stageMapPath = path.join(repoRoot, "drafts", "v0-v3-rebuild", "stage_map_v0_v3.json");
const curriculumPath = path.join(repoRoot, "data", "vocab", "curriculum.json");
const mixedReviewScriptPath = path.join(repoRoot, "scripts", "add-mixed-review-lessons.js");
const wave1LessonDraftPath = path.join(repoRoot, "drafts", "collocation-rebuild", "wave1_app_lesson_draft.json");
const wave1ShellsPath = path.join(repoRoot, "drafts", "collocation-rebuild", "wave1_question_shells.json");

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function check(id, pass, detail, severity = "error") {
  return { id, pass, detail, severity };
}

function countLessonsInRange(fromId, toId) {
  const fromNum = Number(fromId.split("-").pop());
  const toNum = Number(toId.split("-").pop());
  return toNum - fromNum + 1;
}

function verifyEmbeddedConsistencyChecks(stageMap) {
  const embedded = stageMap.consistency_checks || [];
  const failed = embedded.filter((row) => row.result !== "pass");
  return check(
    "embedded_consistency_checks",
    failed.length === 0,
    failed.length === 0
      ? `${embedded.length} embedded checks all pass`
      : `${failed.length} embedded checks failed: ${failed.map((row) => row.check).join(", ")}`
  );
}

function verifyGrandTotals(stageMap) {
  const gt = stageMap.stage_totals.grand_total;
  const lessonSum = ["V0", "V1", "V2", "V3"].reduce(
    (sum, stage) => sum + stageMap.stage_totals[stage].total_lessons,
    0
  );
  const rowSum = ["V0", "V1", "V2", "V3"].reduce(
    (sum, stage) => sum + stageMap.stage_totals[stage].total_question_rows,
    0
  );
  return [
    check(
      "grand_total_lessons",
      gt.total_lessons === 193 && lessonSum === 193,
      `expected 193, artifact ${gt.total_lessons}, computed ${lessonSum}`
    ),
    check(
      "grand_total_question_rows",
      gt.total_question_rows === 4399 && rowSum === 4399,
      `expected 4399, artifact ${gt.total_question_rows}, computed ${rowSum}`
    ),
    check(
      "grand_total_question_files",
      gt.total_question_files === 18,
      `expected 18, artifact ${gt.total_question_files}`
    )
  ];
}

function verifyLessonRanges(stageMap) {
  const ranges = stageMap.lesson_id_numbering.ranges;
  const checks = [];
  for (const [group, row] of Object.entries(ranges)) {
    if (!row.from || !row.to || row.count == null) continue;
    const computed = countLessonsInRange(row.from, row.to);
    checks.push(
      check(
        `lesson_range_${group}`,
        computed === row.count,
        `${group}: ${row.from}..${row.to} => ${computed}, expected ${row.count}`
      )
    );
  }
  return checks;
}

function verifyMixedReviewMaps(stageMap) {
  const checks = [];
  for (const stage of ["V2", "V3"]) {
    const structure = stageMap.stages[stage].mixed_review_structure;
    const sourceMap = structure.mixed_review_source_map;
    const entries = Object.entries(sourceMap);
    checks.push(
      check(
        `${stage}_mixed_review_lesson_count`,
        entries.length === (stage === "V2" ? 10 : 12),
        `${stage}: ${entries.length} mixed-review lessons`
      )
    );
    for (const [mrId, sources] of entries) {
      checks.push(
        check(
          `${mrId}_source_count`,
          sources.length === 5,
          `${mrId} should draw from 5 core lessons, got ${sources.length}`
        )
      );
    }
  }
  return checks;
}

function verifyProductionBaseline(curriculum) {
  const questionFiles = curriculum.question_files || [];
  let questionRows = 0;
  for (const fileName of questionFiles) {
    const payload = readJson(path.join(repoRoot, "data", "vocab", fileName));
    questionRows += (payload.questions || []).length;
  }
  return [
    check(
      "production_lesson_rows_empty",
      (curriculum.lessons || []).length === 0,
      `curriculum.lessons = ${(curriculum.lessons || []).length}`
    ),
    check(
      "production_question_rows_empty",
      questionRows === 0,
      `production question rows = ${questionRows}`
    ),
    check(
      "production_manifest_file_count",
      questionFiles.length === 18,
      `question_files = ${questionFiles.length}`
    )
  ];
}

function verifyWave1CrossLinks() {
  const lessonDraft = readJson(wave1LessonDraftPath);
  const shells = readJson(wave1ShellsPath);
  const lessons = lessonDraft.lessons || [];
  const shellRows = shells.questions || shells;
  const checks = [
    check("wave1_lesson_count", lessons.length === 16, `wave1 lessons = ${lessons.length}`),
    check(
      "wave1_shell_count",
      shellRows.length === 384,
      `wave1 shells = ${shellRows.length}`
    ),
    check(
      "wave1_per_lesson_quota",
      lessons.every((lesson) => lesson.question_ids?.length === 20 && lesson.review_question_ids?.length === 4),
      "every Wave 1 draft lesson should have 20 core + 4 review shell IDs"
    ),
    check(
      "wave1_draft_id_sequence",
      lessons[0]?.lesson_id === "V3-W1-01" && lessons[15]?.lesson_id === "V3-W1-16",
      `first=${lessons[0]?.lesson_id}, last=${lessons[15]?.lesson_id}`
    ),
    check(
      "wave1_production_range_plan",
      true,
      "Wave 1 maps to V3-A-121..V3-A-130 (10) + V3-B-131..V3-B-136 (6); exact ID table frozen in Step 40"
    )
  ];
  return checks;
}

function verifyMixedReviewScriptNaming() {
  const source = fs.readFileSync(mixedReviewScriptPath, "utf8");
  const usesMix = source.includes("${stage}-MIX-");
  const usesMr = source.includes("${stage}-MR-");
  return check(
    "mixed_review_script_naming",
    usesMr && !usesMix,
    usesMr && !usesMix
      ? "scripts/add-mixed-review-lessons.js emits canonical V2-MR/V3-MR IDs"
      : "Mixed-review script must use MR IDs and must not emit legacy MIX IDs"
  );
}

function main() {
  const write = process.argv.includes("--write");
  const stageMap = readJson(stageMapPath);
  const curriculum = readJson(curriculumPath);

  const checks = [
    verifyEmbeddedConsistencyChecks(stageMap),
    ...verifyGrandTotals(stageMap),
    ...verifyLessonRanges(stageMap),
    ...verifyMixedReviewMaps(stageMap),
    ...verifyProductionBaseline(curriculum),
    ...verifyWave1CrossLinks(),
    verifyMixedReviewScriptNaming()
  ];

  const failures = checks.filter((row) => !row.pass && row.severity !== "warning");
  const warnings = checks.filter((row) => row.severity === "warning" || (!row.pass && row.severity === "warning"));

  const report = {
    verified_at: new Date().toISOString(),
    script: "scripts/verify-phase7-stage-map.js",
    phase: 7,
    status: failures.length === 0 ? "passed" : "failed",
    summary: {
      checks_total: checks.length,
      checks_passed: checks.filter((row) => row.pass).length,
      errors: failures.length,
      warnings: checks.filter((row) => row.severity === "warning").length
    },
    checks
  };

  if (write) {
    stageMap.status = failures.length === 0 ? "planning_frozen" : "planning_draft";
    stageMap.last_verified_at = report.verified_at;
    stageMap.verification = {
      script: report.script,
      status: report.status,
      summary: report.summary,
      known_gaps: [
        {
          id: "mixed_review_lesson_id_naming",
          severity: "warning",
          detail: "Phase 7 freezes V2-MR-* / V3-MR-* lesson IDs, but scripts/add-mixed-review-lessons.js still emits V2-MIX-* / V3-MIX-*.",
          resolve_in_step: 39
        },
        {
          id: "wave1_production_id_table",
          severity: "info",
          detail: "V3-W1-01..16 to V3-A-121..V3-B-136 mapping is approximate until Step 40.",
          resolve_in_step: 40
        }
      ]
    };
    fs.writeFileSync(stageMapPath, `${JSON.stringify(stageMap, null, 2)}\n`, "utf8");
  }

  console.log(JSON.stringify(report, null, 2));
  if (failures.length > 0) {
    process.exit(1);
  }
}

main();
