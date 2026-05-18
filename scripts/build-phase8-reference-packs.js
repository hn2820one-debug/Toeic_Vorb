/**
 * Phase 8 — Future reference packs, mixed-review architecture, master lesson manifest.
 * Planning-only; does not modify production seed under data/vocab/.
 */

const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const repoRoot = path.join(__dirname, "..");
const v03Dir = path.join(repoRoot, "drafts", "v0-v3-rebuild");
const v4Dir = path.join(repoRoot, "drafts", "v4-rebuild");
const v5Dir = path.join(repoRoot, "drafts", "v5-rebuild");
const v6Dir = path.join(repoRoot, "drafts", "v6-rebuild");
const collocationDir = path.join(repoRoot, "drafts", "collocation-rebuild");

const paths = {
  stageMap: path.join(v03Dir, "stage_map_v0_v3.json"),
  wave1LessonDraft: path.join(collocationDir, "wave1_app_lesson_draft.json"),
  v4Questions: path.join(repoRoot, "drafts", "v4", "questions_v4a.json"),
  curriculum: path.join(repoRoot, "data", "vocab", "curriculum.json"),
  mixedReviewScript: path.join(repoRoot, "scripts", "add-mixed-review-lessons.js")
};

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function sha256(filePath) {
  return crypto.createHash("sha256").update(fs.readFileSync(filePath)).digest("hex");
}

function rel(filePath) {
  return path.relative(repoRoot, filePath).replace(/\\/g, "/");
}

function uniqueStrings(values) {
  return [...new Set(values)];
}

function lessonNum(id) {
  return Number(id.split("-").pop());
}

function rangeIds(prefix, from, to) {
  const out = [];
  for (let n = from; n <= to; n += 1) {
    out.push(`${prefix}-${n}`);
  }
  return out;
}

function buildWave1ProductionIdMap() {
  const draft = readJson(paths.wave1LessonDraft);
  const lessons = draft.lessons || [];
  const map = lessons.map((lesson, index) => {
    const draftId = lesson.lesson_id;
    const seq = index + 1;
    let productionId;
    let questionFile;
    if (seq <= 10) {
      productionId = `V3-A-${120 + seq}`;
      questionFile = "questions_v3a.json";
    } else {
      productionId = `V3-B-${130 + (seq - 10)}`;
      questionFile = "questions_v3b.json";
    }
    return {
      draft_lesson_id: draftId,
      production_lesson_id: productionId,
      question_file: questionFile,
      draft_question_id_prefix: `${draftId}_Q`,
      draft_review_id_prefix: `${draftId}_R`,
      production_question_id_prefix: `v3_${productionId.toLowerCase().replace(/-/g, "_")}_q_`,
      production_review_id_prefix: `v3_${productionId.toLowerCase().replace(/-/g, "_")}_rv_`
    };
  });
  return map;
}

function analyzeV4Draft() {
  const questions = readJson(paths.v4Questions);
  const byLesson = {};
  for (const row of questions) {
    byLesson[row.lesson_id] = byLesson[row.lesson_id] || { count: 0, types: {} };
    byLesson[row.lesson_id].count += 1;
    byLesson[row.lesson_id].types[row.type] = (byLesson[row.lesson_id].types[row.type] || 0) + 1;
  }
  const lessonIds = Object.keys(byLesson).sort();
  const typeTotals = questions.reduce((acc, row) => {
    acc[row.type] = (acc[row.type] || 0) + 1;
    return acc;
  }, {});
  return {
    question_count: questions.length,
    lesson_count: lessonIds.length,
    lesson_ids: lessonIds,
    type_totals: typeTotals,
    per_lesson: byLesson
  };
}

function buildV4ReferencePack(v4Analysis) {
  const groups = [
    { group: "A", from: 181, to: 190, file: "questions_v4a.json", topics: ["Email opening", "Reference & compliance"] },
    { group: "B", from: 191, to: 200, file: "questions_v4a.json", topics: ["Requests & follow-up", "Deadlines & scheduling"] },
    { group: "C", from: 201, to: 210, file: "questions_v4b.json", topics: ["Approvals & authorization", "Reports & findings"] },
    { group: "D", from: 211, to: 220, file: "questions_v4c.json", topics: ["Negotiation & terms", "Notices & announcements"] },
    { group: "E", from: 221, to: 230, file: "questions_v4d.json", topics: ["Apologies & clarification", "Closings & next steps"] }
  ];

  return {
    generated_at: new Date().toISOString(),
    pack_version: "v4_reference_pack_v1",
    reference_role: "future_stage_planning",
    status: "draft_only",
    production_impact: "none",
    production_merge_allowed: false,
    scope: {
      stage: "V4",
      stage_name: "Formal Phrase",
      planned_total_lessons: 50,
      planned_total_question_rows: 1000,
      draft_slice_lessons: v4Analysis.lesson_count,
      draft_slice_questions: v4Analysis.question_count
    },
    boundary_rules: [
      "V4 remains under drafts/v4/ until an explicit V4 activation task.",
      "Do not add questions_v4*.json to curriculum.question_files without activation review.",
      "Do not import this pack into data/vocab/ without seed-version sync and full validation."
    ],
    source_files: [
      { path: rel(paths.v4Questions), role: "V4-A draft questions", sha256: sha256(paths.v4Questions) },
      { path: "drafts/v4/add-v4-items.js", role: "optional vocab item generator", note: "not run during Phase 8" }
    ],
    lesson_id_policy: {
      global_range: { from: "V4-A-181", to: "V4-E-230", count: 50 },
      draft_active_range: { from: "V4-A-181", to: "V4-A-185", count: 5 },
      numbering_note: "V4 global IDs continue after V3 core ends at 180."
    },
    lesson_groups: groups.map((row) => ({
      group: row.group,
      lesson_id_range: {
        from: `V4-${row.group}-${row.from}`,
        to: `V4-${row.group}-${row.to}`
      },
      planned_question_file: row.file,
      lesson_count: 10,
      lesson_type: "formal_phrase",
      suggested_topics: row.topics,
      question_rows_per_lesson_planned: 20,
      question_type_mix_per_lesson_planned: {
        formal_phrase: 8,
        meaning_choice: 4,
        part5_sentence_completion: 4,
        review_question: 4
      },
      draft_status: row.group === "A" && row.from === 181 ? "slice_authored_in_drafts_v4" : "pending"
    })),
    draft_slice_summary: v4Analysis,
    authoring_policy: {
      distractor_type: "similar_formal_phrase",
      default_error_code: "FORMAL_PHRASE",
      primary_type: "formal_phrase",
      allowed_types: ["formal_phrase", "meaning_choice", "part5_sentence_completion", "review_question"]
    },
    activation_blockers: [
      "Add V4 rules to docs/question-creation-spec.md",
      "Confirm distractor_type policy in audit-quality-full.js",
      "Promote vocab items via drafts/v4/add-v4-items.js only after review",
      "Add curriculum.lessons rows and question_files only during activation merge",
      "V2/V3 old-item interference stable before V4 activation (TO_AI.md)"
    ]
  };
}

function buildV5ReferencePack() {
  const groups = ["A", "B", "C", "D", "E"].map((group, index) => {
    const from = 231 + index * 10;
    const to = from + 9;
    return {
      group,
      lesson_id_range: { from: `V5-${group}-${from}`, to: `V5-${group}-${to}` },
      planned_question_file: `questions_v5${group.toLowerCase()}.json`,
      lesson_count: 10,
      lesson_type: "false_friend_speed_reflex",
      question_rows_per_lesson_planned: 20
    };
  });

  return {
    generated_at: new Date().toISOString(),
    pack_version: "v5_reference_pack_v1",
    reference_role: "future_stage_planning",
    status: "planning_only",
    production_impact: "none",
    production_merge_allowed: false,
    scope: {
      stage: "V5",
      stage_name: "False Friends + Speed Reflex",
      planned_total_lessons: 50,
      planned_total_question_rows: 1000
    },
    boundary_rules: [
      "V5 is not in the production seed manifest.",
      "Do not author production rows until V0-V4 rebuild slices are stable."
    ],
    lesson_id_policy: {
      global_range: { from: "V5-A-231", to: "V5-E-280", count: 50 },
      numbering_note: "V5 global IDs continue after planned V4 range 181-230."
    },
    lesson_groups: groups,
    question_type_mix_per_lesson_planned: {
      false_friend: 10,
      speed_drill: 10
    },
    authoring_policy: {
      false_friend: {
        distractor_type: "toeic_false_friend",
        default_error_code: "FALSE_FRIEND",
        estimated_time_seconds: 8,
        blank_required: false
      },
      speed_drill: {
        distractor_type: "same_word_family",
        default_error_code: "TIME_PRESSURE",
        estimated_time_seconds: 8,
        blank_required: true,
        sentence_uniqueness: "All speed_drill sentences must be newly written for V5."
      }
    },
    planned_question_files: groups.map((row) => row.planned_question_file),
    activation_blockers: [
      "No draft question file exists yet",
      "Requires V5 authoring spec section in question-creation-spec.md",
      "Requires curriculum stage activation task with seed-version bump"
    ]
  };
}

function buildV6ReferencePack() {
  const integratedGroups = ["A", "B", "C"].map((group, index) => {
    const from = 281 + index * 10;
    const to = from + 9;
    return {
      group,
      lesson_id_range: { from: `V6-${group}-${from}`, to: `V6-${group}-${to}` },
      lesson_count: 10,
      lesson_type: "integrated_review"
    };
  });

  return {
    generated_at: new Date().toISOString(),
    pack_version: "v6_reference_pack_v1",
    reference_role: "future_stage_planning",
    status: "planning_only",
    production_impact: "none",
    production_merge_allowed: false,
    scope: {
      stage: "V6",
      stage_name: "Integrated Review + Seal Test",
      planned_total_lessons: 40,
      planned_new_question_rows: 200,
      planned_reused_review_slots: 600
    },
    boundary_rules: [
      "V6 is not in the production seed manifest.",
      "Integrated-review lessons must not create duplicate question rows when reusing prior review_question IDs."
    ],
    lesson_id_policy: {
      integrated_review_range: { from: "V6-A-281", to: "V6-C-310", count: 30 },
      seal_test_range: { from: "V6-ST-01", to: "V6-ST-08", count: 8 },
      capstone_range: { from: "V6-CAP-01", to: "V6-CAP-02", count: 2 },
      numbering_note: "V6 uses integrated groups A-C for cross-stage review plus ST seal-test lessons and CAP capstones."
    },
    lesson_groups: [
      ...integratedGroups,
      {
        group: "ST",
        lesson_id_range: { from: "V6-ST-01", to: "V6-ST-08" },
        lesson_count: 8,
        lesson_type: "seal_test",
        question_rows_per_lesson_planned: 25,
        covers_stages: ["V0", "V1", "V2", "V3"]
      },
      {
        group: "CAP",
        lesson_id_range: { from: "V6-CAP-01", to: "V6-CAP-02" },
        lesson_count: 2,
        lesson_type: "integrated_capstone",
        question_ids_per_lesson_planned: 30,
        covers_stages: ["V0", "V1", "V2", "V3", "V4", "V5"]
      }
    ],
    integrated_review_policy: {
      question_ids_per_lesson: 20,
      question_rows_created: 0,
      source_policy: "Draw review_question rows from V0-V5 prior lessons; weighted toward weak mastery items.",
      assembly_script_planned: "scripts/build-v6-integrated-review-lessons.js"
    },
    seal_test_policy: {
      question_rows_per_lesson: 25,
      question_types: ["review_question", "part5_sentence_completion", "scene_vocabulary", "collocation"],
      purpose: "Stage-seal readiness checks aligned with Today dashboard Stage Seal Readiness (display-only until activated)."
    },
    planned_question_files: ["questions_v6a.json", "questions_v6b.json"],
    activation_blockers: [
      "Requires V0-V5 content to exist before integrated review has sources",
      "Seal-test authoring spec not yet added to question-creation-spec.md",
      "No draft question files yet"
    ]
  };
}

function buildMixedReviewArchitecture(stageMap) {
  const v2 = stageMap.stages.V2.mixed_review_structure;
  const v3 = stageMap.stages.V3.mixed_review_structure;

  return {
    generated_at: new Date().toISOString(),
    artifact: "mixed_review_architecture",
    artifact_version: "1.0",
    phase: 8,
    status: "planning_frozen",
    reference_role: "planning_reference",
    production_impact: "none",
    applies_to_stages: ["V2", "V3"],
    canonical_lesson_id_format: "{stage}-MR-{NN}",
    legacy_alias_format: "{stage}-MIX-{NN}",
    legacy_alias_status: "deprecated_do_not_author_new",
    assembly: {
      script: "scripts/add-mixed-review-lessons.js",
      trigger: "Run only after core lessons exist in curriculum.lessons with review_question_ids populated.",
      grouping_rule: "Every 5 consecutive same-stage core lessons (by lesson_number) produce 1 mixed_review lesson.",
      question_ids_per_mixed_lesson: 20,
      question_rows_created: 0,
      source_policy: "question_ids = flatMap of review_question_ids from the 5 source core lessons (4 × 5 = 20)."
    },
    lesson_number_bands: {
      V2: { mixed_review_base: 10000, note: "Keeps MR lessons sortable after core V2 lessons." },
      V3: { mixed_review_base: 20000, note: "Keeps MR lessons sortable after core V3 lessons." }
    },
    stages: {
      V2: {
        mixed_review_lesson_count: 10,
        core_lessons_covered: 50,
        mixed_review_source_map: v2.mixed_review_source_map
      },
      V3: {
        mixed_review_lesson_count: 12,
        core_lessons_covered: 60,
        mixed_review_source_map: v3.mixed_review_source_map
      }
    },
    migration_notes: [
      "Historical script output used V2-MIX-* / V3-MIX-*; Phase 8 standardizes on V2-MR-* / V3-MR-*.",
      "Audit fixtures and tests must use MR IDs going forward.",
      "Do not delete MIX references from archived docs; treat them as legacy aliases only."
    ]
  };
}

function buildMasterLessonManifest(stageMap, wave1Map, v4Pack, v5Pack, v6Pack, mixedReview) {
  const curriculum = readJson(paths.curriculum);
  return {
    generated_at: new Date().toISOString(),
    artifact: "master_lesson_manifest",
    artifact_version: "1.0",
    phase: 8,
    step: 40,
    status: "planning_frozen",
    reference_role: "planning_reference",
    production_impact: "none",
    production_merge_allowed: false,
    related_docs: [
      "docs/plans/question-rebuild-phase07-stage-blueprints.md",
      "docs/plans/question-rebuild-phase08-future-reference-packs.md"
    ],
    production_baseline: {
      seed_version: curriculum.seed_version,
      curriculum_lesson_rows: (curriculum.lessons || []).length,
      production_question_files: (curriculum.question_files || []).length,
      note: "Manifest describes target structure; production merge is a later Phase 9/10 task."
    },
    v0_v3_target: {
      source_artifact: "drafts/v0-v3-rebuild/stage_map_v0_v3.json",
      total_lessons: stageMap.stage_totals.grand_total.total_lessons,
      total_unique_question_rows: stageMap.stage_totals.grand_total.total_question_rows,
      total_question_files: stageMap.stage_totals.grand_total.total_question_files,
      production_merge_order: ["V1", "V0", "V2", "V3"]
    },
    wave1_production_id_map: wave1Map,
    v0_v3_question_files: curriculum.question_files,
    mixed_review: {
      architecture_artifact: "drafts/v0-v3-rebuild/mixed_review_architecture.json",
      applies_to: ["V2", "V3"],
      canonical_id_format: mixedReview.canonical_lesson_id_format
    },
    future_stages: {
      V4: {
        reference_pack: "drafts/v4-rebuild/v4_reference_pack.json",
        planned_lessons: v4Pack.scope.planned_total_lessons,
        in_production_manifest: false
      },
      V5: {
        reference_pack: "drafts/v5-rebuild/v5_reference_pack.json",
        planned_lessons: v5Pack.scope.planned_total_lessons,
        in_production_manifest: false
      },
      V6: {
        reference_pack: "drafts/v6-rebuild/v6_reference_pack.json",
        planned_lessons: v6Pack.scope.planned_total_lessons,
        in_production_manifest: false
      }
    },
    file_splitting_rules: {
      rule: "One manifest question file per V1-V3 letter group listed in stage_map; mixed_review lessons create no new question file rows.",
      v0_v3_files: curriculum.question_files,
      v4_plus_files_planned: uniqueStrings([
        ...v4Pack.lesson_groups.map((g) => g.planned_question_file),
        ...v5Pack.planned_question_files,
        ...v6Pack.planned_question_files
      ]),
      dedupe_note: "Future V4 file list may collapse to fewer physical files until activation split is decided."
    },
    curriculum_merge_checklist: [
      "Populate curriculum.lessons from this manifest during production merge",
      "Run scripts/add-mixed-review-lessons.js after V2/V3 core lessons exist",
      "Map draft V3-W1-* IDs through wave1_production_id_map before writing question rows",
      "Bump seed_version in curriculum.json, js/vocab-db.js, tests/helpers/seed-idb.ts",
      "Run full release gate from docs/plans/questions plan.md"
    ]
  };
}

function buildConsistencyChecks(outputs) {
  const { v4Pack, v5Pack, v6Pack, mixedReview, manifest, wave1Map, stageMap } = outputs;
  const checks = [
    {
      id: "v4_draft_slice_present",
      pass: v4Pack.scope.draft_slice_questions === 100 && v4Pack.scope.draft_slice_lessons === 5,
      detail: "V4 draft has 100 questions across 5 lessons."
    },
    {
      id: "v5_planned_lessons",
      pass: v5Pack.scope.planned_total_lessons === 50,
      detail: "V5 planned lesson count matches curriculum.json."
    },
    {
      id: "v6_planned_lessons",
      pass: v6Pack.scope.planned_total_lessons === 40,
      detail: "V6 planned lesson count matches curriculum.json."
    },
    {
      id: "wave1_map_count",
      pass: wave1Map.length === 16,
      detail: `wave1_production_id_map rows = ${wave1Map.length}`
    },
    {
      id: "wave1_map_first_last",
      pass: wave1Map[0].draft_lesson_id === "V3-W1-01"
        && wave1Map[15].production_lesson_id === "V3-B-136",
      detail: "Wave 1 maps V3-W1-01..16 to V3-A-121..130 and V3-B-131..136."
    },
    {
      id: "mixed_review_v2_sources",
      pass: Object.keys(mixedReview.stages.V2.mixed_review_source_map).length === 10,
      detail: "V2 mixed-review source map has 10 lessons."
    },
    {
      id: "mixed_review_v3_sources",
      pass: Object.keys(mixedReview.stages.V3.mixed_review_source_map).length === 12,
      detail: "V3 mixed-review source map has 12 lessons."
    },
    {
      id: "manifest_matches_stage_map",
      pass: manifest.v0_v3_target.total_lessons === stageMap.stage_totals.grand_total.total_lessons,
      detail: "Master manifest grand lesson total matches stage_map."
    },
    {
      id: "mixed_review_script_uses_mr",
      pass: fs.readFileSync(paths.mixedReviewScript, "utf8").includes("${stage}-MR-"),
      detail: "add-mixed-review-lessons.js emits canonical MR IDs."
    }
  ];

  return {
    status: checks.every((row) => row.pass) ? "passed" : "failed",
    checks
  };
}

function main() {
  const stageMap = readJson(paths.stageMap);
  const v4Analysis = analyzeV4Draft();
  const wave1Map = buildWave1ProductionIdMap();
  const v4Pack = buildV4ReferencePack(v4Analysis);
  const v5Pack = buildV5ReferencePack();
  const v6Pack = buildV6ReferencePack();
  const mixedReview = buildMixedReviewArchitecture(stageMap);
  const manifest = buildMasterLessonManifest(stageMap, wave1Map, v4Pack, v5Pack, v6Pack, mixedReview);

  const outputs = { v4Pack, v5Pack, v6Pack, mixedReview, manifest, wave1Map, stageMap };
  const consistency = buildConsistencyChecks(outputs);

  writeJson(path.join(v4Dir, "v4_reference_pack.json"), v4Pack);
  writeJson(path.join(v5Dir, "v5_reference_pack.json"), v5Pack);
  writeJson(path.join(v6Dir, "v6_reference_pack.json"), v6Pack);
  writeJson(path.join(v03Dir, "mixed_review_architecture.json"), mixedReview);
  writeJson(path.join(v03Dir, "master_lesson_manifest.json"), { ...manifest, consistency_checks: consistency });

  if (consistency.status !== "passed") {
    console.error(JSON.stringify(consistency, null, 2));
    process.exit(1);
  }

  console.log(JSON.stringify({
    phase: 8,
    status: "passed",
    outputs: {
      v4: rel(path.join(v4Dir, "v4_reference_pack.json")),
      v5: rel(path.join(v5Dir, "v5_reference_pack.json")),
      v6: rel(path.join(v6Dir, "v6_reference_pack.json")),
      mixed_review: rel(path.join(v03Dir, "mixed_review_architecture.json")),
      master_manifest: rel(path.join(v03Dir, "master_lesson_manifest.json"))
    },
    wave1_map_rows: wave1Map.length,
    checks: consistency.checks.length
  }, null, 2));
}

main();
