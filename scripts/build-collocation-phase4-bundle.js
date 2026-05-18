const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const repoRoot = path.join(__dirname, "..");
const outDir = path.join(repoRoot, "drafts", "collocation-rebuild");

const files = {
  inventory: "phrase_411_inventory.json",
  blueprint: "wave1_lesson_blueprint.json",
  lessonDraft: "wave1_app_lesson_draft.json",
  questionPlan: "wave1_question_plan.json",
  missingItems: "wave1_missing_item_backlog.json",
  vocabSeedDraft: "wave1_vocab_items_seed_draft.json",
  questionShells: "wave1_question_shells.json",
  topicTable: "topic_normalization_table.json",
  phraseFamilies: "phrase_family_table.json",
  duplicateReference: "phrase_duplicate_reference.json"
};

function readJSON(fileName) {
  return JSON.parse(fs.readFileSync(path.join(outDir, fileName), "utf8"));
}

function writeJSON(fileName, value) {
  fs.writeFileSync(path.join(outDir, fileName), `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function relativeOut(fileName) {
  return path.relative(repoRoot, path.join(outDir, fileName)).replace(/\\/g, "/");
}

function sha256(fileName) {
  return crypto
    .createHash("sha256")
    .update(fs.readFileSync(path.join(outDir, fileName)))
    .digest("hex");
}

function countBy(rows, getKey) {
  return rows.reduce((acc, row) => {
    const key = getKey(row) || "unknown";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
}

function difficultyRank(code) {
  if (code === "C") return 3;
  if (code === "B") return 2;
  if (code === "A") return 1;
  return 0;
}

function sumObjectValues(value) {
  return Object.values(value || {}).reduce((sum, count) => sum + count, 0);
}

function buildConsistencyChecks(data, difficultyPolicy) {
  const {
    inventory,
    blueprint,
    lessonDraft,
    questionPlan,
    missingItems,
    vocabSeedDraft,
    questionShells,
    topicTable,
    phraseFamilies,
    duplicateReference
  } = data;
  const targetItems = blueprint.lessons.flatMap((lesson) => lesson.items);
  const slotTotal = questionPlan.totals.core_question_slots + questionPlan.totals.review_question_slots;
  const referenceArtifacts = [
    inventory,
    blueprint,
    lessonDraft,
    questionPlan,
    missingItems,
    vocabSeedDraft,
    questionShells,
    topicTable,
    phraseFamilies,
    duplicateReference,
    difficultyPolicy
  ];
  const checks = [
    {
      id: "reference_role",
      pass: referenceArtifacts.every((artifact) => artifact.reference_role === "ability_signal_only"),
      detail: "All Phase 4 inputs and outputs must remain reference-only."
    },
    {
      id: "lesson_count",
      pass: lessonDraft.lessons.length === blueprint.lessons.length
        && questionPlan.totals.lesson_count === lessonDraft.lessons.length
        && difficultyPolicy.scope.lesson_count === lessonDraft.lessons.length,
      detail: `${lessonDraft.lessons.length} lesson rows, ${blueprint.lessons.length} blueprint lessons, ${questionPlan.totals.lesson_count} question-plan lessons.`
    },
    {
      id: "target_item_count",
      pass: targetItems.length === blueprint.selected_unknown_count
        && difficultyPolicy.scope.target_item_count === targetItems.length,
      detail: `${targetItems.length} Wave 1 target items.`
    },
    {
      id: "missing_item_count",
      pass: missingItems.totals.missing_items === questionPlan.totals.unresolved_target_items
        && vocabSeedDraft.totals.item_count === missingItems.totals.missing_items,
      detail: `${missingItems.totals.missing_items} missing items, ${vocabSeedDraft.totals.item_count} draft seed rows.`
    },
    {
      id: "question_slot_count",
      pass: slotTotal === questionShells.totals.question_count
        && difficultyPolicy.scope.question_shell_count === questionShells.totals.question_count,
      detail: `${slotTotal} planned slots, ${questionShells.totals.question_count} question shells.`
    },
    {
      id: "production_ready_flag",
      pass: true,
      detail: "Phase 4 is draft-only; production readiness is intentionally false in the reference bundle."
    },
    {
      id: "reference_duplicate_status",
      pass: duplicateReference.totals.exact_duplicate_groups === 0,
      detail: `${duplicateReference.totals.exact_duplicate_groups} exact duplicate groups; ${duplicateReference.totals.near_duplicate_pairs} near/confusable pairs for manual review.`
    }
  ];

  return {
    status: checks.every((check) => check.pass) ? "passed" : "failed",
    checked_at: new Date().toISOString(),
    checks
  };
}

function buildTopicPriorityMatrix(blueprint, inventory, topicTable) {
  const inventoryTopics = new Map(inventory.topic_summaries.map((topic) => [topic.topic, topic]));
  const normalizedTopics = new Map(topicTable.topics.map((topic) => [topic.canonical_topic_zh, topic]));

  return blueprint.selected_topics.map((topicName, index) => {
    const lessons = blueprint.lessons.filter((lesson) => lesson.topic === topicName);
    const items = lessons.flatMap((lesson) => lesson.items);
    const inventoryTopic = inventoryTopics.get(topicName);
    const normalizedTopic = normalizedTopics.get(topicName);

    return {
      priority: index + 1,
      topic_id: normalizedTopic?.topic_id || null,
      topic: topicName,
      source_unknown_count: inventoryTopic?.unknown_count || 0,
      source_known_count: inventoryTopic?.known_count || 0,
      wave1_lesson_count: lessons.length,
      wave1_target_count: items.length,
      wave1_difficulty_counts: countBy(items, (item) => item.difficulty),
      policy_note: "Priority comes from the Wave 1 blueprint; topic IDs are planning labels only."
    };
  });
}

function buildLessonMatrix(blueprint, questionPlan) {
  const planByLessonId = new Map(questionPlan.lessons.map((lesson) => [lesson.lesson_id, lesson]));

  return blueprint.lessons.map((lesson) => {
    const lessonId = `V3-W1-${String(lesson.sequence).padStart(2, "0")}`;
    const questionSlots = planByLessonId.get(lessonId)?.question_slots || [];
    const coreSlots = questionSlots.filter((slot) => slot.slot_role === "core");
    const reviewSlots = questionSlots.filter((slot) => slot.slot_role === "review");
    const cItemCount = lesson.items.filter((item) => item.difficulty === "C").length;

    return {
      lesson_id: lessonId,
      source_blueprint_lesson_id: lesson.lesson_id,
      topic: lesson.topic,
      topic_lesson_index: lesson.topic_lesson_index,
      target_item_count: lesson.item_count,
      target_difficulty_counts: lesson.difficulty_breakdown,
      has_c_items: cItemCount > 0,
      max_target_difficulty: lesson.items.reduce((max, item) => (
        difficultyRank(item.difficulty) > difficultyRank(max) ? item.difficulty : max
      ), "A"),
      core_slot_count: coreSlots.length,
      review_slot_count: reviewSlots.length,
      slot_difficulty_counts: countBy(questionSlots, (slot) => slot.difficulty),
      planned_type_counts: countBy(questionSlots, (slot) => slot.planned_type),
      mixing_note: cItemCount
        ? "Contains advanced targets; extra reinforcement and review pressure should prioritize C then B items."
        : "No C targets; keep topic progression and avoid adding unrelated hard items only for balance."
    };
  });
}

function buildDifficultyPolicy(data) {
  const { blueprint, lessonDraft, questionPlan, missingItems, questionShells } = data;
  const slots = questionPlan.lessons.flatMap((lesson) => lesson.question_slots);
  const targetItems = blueprint.lessons.flatMap((lesson) => lesson.items);
  const lessonMatrix = buildLessonMatrix(blueprint, questionPlan);

  return {
    generated_at: new Date().toISOString(),
    policy_version: "wave1_phase4_difficulty_mixing_v1",
    reference_role: "ability_signal_only",
    production_impact: "none",
    source_files: [
      relativeOut(files.blueprint),
      relativeOut(files.lessonDraft),
      relativeOut(files.questionPlan),
      relativeOut(files.missingItems),
      relativeOut(files.questionShells)
    ],
    content_generation_note: "Draft-only difficulty and slot-mixing policy for Wave 1 collocation authoring. It is not production curriculum data.",
    scope: {
      stage: "V3",
      lesson_type: "collocation",
      wave: 1,
      lesson_count: lessonDraft.lessons.length,
      target_item_count: targetItems.length,
      question_shell_count: questionShells.totals.question_count
    },
    difficulty_code_meaning: {
      A: "foundation or high-frequency operational collocation",
      B: "intermediate TOEIC workplace collocation",
      C: "advanced, abstract, formal, or easily confused collocation"
    },
    target_item_policy: {
      source_difficulty_is_authoring_signal: true,
      all_wave1_targets_require_seed_review: true,
      unresolved_target_count: questionPlan.totals.unresolved_target_items,
      missing_item_count: missingItems.totals.missing_items,
      ambiguous_item_count: missingItems.totals.ambiguous_phrase_matches,
      rule: "Do not merge Wave 1 questions until every target item row has been manually reviewed as a production vocab item."
    },
    lesson_mixing_policy: {
      target_items_per_lesson: "4-7",
      preserve_topic_order: true,
      do_not_force_cross_topic_difficulty_balance: true,
      c_item_rule: "If a lesson contains C items, assign those items extra reinforcement and review pressure before easier items.",
      all_a_lesson_rule: "All-A lessons are allowed when the topic slice naturally starts with foundation phrases.",
      ambiguity_rule: "Do not place visually similar collocations in one lesson unless the authored contexts make the correct answer unambiguous."
    },
    question_slot_policy: {
      core_slots_per_lesson: 20,
      review_slots_per_lesson: 4,
      per_target_minimum: ["collocation", "part5_sentence_completion"],
      reinforcement_cycle: ["part6_context_choice", "collocation"],
      reinforcement_priority: ["C", "B", "A"],
      review_priority: ["C", "B", "A"],
      review_question_rule: "Review slots are draft review pressure inside the authoring plan; mixed-review production architecture is still Phase 8."
    },
    totals: {
      target_difficulty_counts: countBy(targetItems, (item) => item.difficulty),
      slot_difficulty_counts: countBy(slots, (slot) => slot.difficulty),
      planned_type_counts: countBy(slots, (slot) => slot.planned_type),
      lessons_with_c_items: lessonMatrix.filter((lesson) => lesson.has_c_items).length,
      all_a_lessons: lessonMatrix.filter((lesson) => (
        sumObjectValues(lesson.target_difficulty_counts) === (lesson.target_difficulty_counts.A || 0)
      )).length
    },
    lessons: lessonMatrix
  };
}

function buildReferenceBundle(data, difficultyPolicy) {
  const {
    inventory,
    blueprint,
    lessonDraft,
    questionPlan,
    missingItems,
    vocabSeedDraft,
    questionShells,
    topicTable,
    phraseFamilies,
    duplicateReference
  } = data;

  const sourceFiles = [
    [files.inventory, "ability inventory"],
    [files.blueprint, "Wave 1 topic and lesson blueprint"],
    [files.lessonDraft, "draft app lesson rows"],
    [files.questionPlan, "draft question slot plan"],
    [files.missingItems, "missing item backlog"],
    [files.vocabSeedDraft, "draft vocab item seed rows"],
    [files.questionShells, "draft TODO question shells"],
    [files.topicTable, "topic normalization table"],
    [files.phraseFamilies, "phrase-family reference"],
    [files.duplicateReference, "duplicate and near-confusable reference"],
    ["wave1_difficulty_mixing_policy.json", "Phase 4 difficulty and slot policy"]
  ];

  return {
    generated_at: new Date().toISOString(),
    bundle_version: "wave1_reference_bundle_v1",
    reference_role: "ability_signal_only",
    status: "draft_only",
    production_impact: "none",
    scope: {
      program: "Program B - TOEIC Vocabulary Tracker",
      stage: "V3",
      lesson_type: "collocation",
      wave: 1,
      production_merge_allowed: false
    },
    boundary_rules: [
      "Do not modify Program A.",
      "Do not enable V4.",
      "Do not move V4 draft files into data/vocab/.",
      "Do not import this bundle into production seed files without a later production merge task.",
      "Do not treat TODO question shells as valid production questions."
    ],
    source_files: sourceFiles.map(([fileName, role]) => ({
      path: relativeOut(fileName),
      role,
      sha256: sha256(fileName)
    })),
    phase4_summary: {
      topic_priority_count: blueprint.selected_topics.length,
      wave1_lesson_count: lessonDraft.lessons.length,
      wave1_target_item_count: blueprint.selected_unknown_count,
      target_difficulty_counts: difficultyPolicy.totals.target_difficulty_counts,
      item_mapping: {
        production_matches: 0,
        missing_items: missingItems.totals.missing_items,
        ambiguous_phrase_matches: missingItems.totals.ambiguous_phrase_matches,
        draft_seed_rows: vocabSeedDraft.totals.item_count
      },
      question_slots: {
        core: questionPlan.totals.core_question_slots,
        review: questionPlan.totals.review_question_slots,
        total: questionShells.totals.question_count,
        planned_type_counts: difficultyPolicy.totals.planned_type_counts
      },
      reference_checks: {
        topic_count: topicTable.totals.topic_count,
        phrase_family_count: phraseFamilies.totals.family_count,
        exact_duplicate_groups: duplicateReference.totals.exact_duplicate_groups,
        near_confusable_pairs: duplicateReference.totals.near_duplicate_pairs
      }
    },
    topic_priority_matrix: buildTopicPriorityMatrix(blueprint, inventory, topicTable),
    authoring_readiness: {
      item_seed_review_required: true,
      question_shell_authoring_required: true,
      production_ready: false,
      blockers: [
        "100 Wave 1 target items are draft seed rows, not reviewed production vocab items.",
        "384 Wave 1 question rows are TODO shells.",
        "Production lesson IDs, file split, and manifest placement are not frozen until Step 40."
      ]
    },
    consistency_checks: difficultyPolicy.consistency_checks,
    next_use: [
      "Use this bundle as the shared Wave 1 input for Phase 5 schema checks and Phase 9 authoring.",
      "Use the difficulty policy to prioritize C and B targets for reinforcement, not to reshuffle topics blindly.",
      "Use duplicate and phrase-family references for manual ambiguity checks before writing distractors."
    ]
  };
}

function main() {
  const data = Object.fromEntries(
    Object.entries(files).map(([key, fileName]) => [key, readJSON(fileName)])
  );

  const difficultyPolicy = buildDifficultyPolicy(data);
  difficultyPolicy.consistency_checks = buildConsistencyChecks(data, difficultyPolicy);
  writeJSON("wave1_difficulty_mixing_policy.json", difficultyPolicy);

  const referenceBundle = buildReferenceBundle(data, difficultyPolicy);
  if (referenceBundle.consistency_checks.status !== "passed") {
    throw new Error("Phase 4 consistency checks failed; refusing to publish reference bundle.");
  }
  writeJSON("wave1_reference_bundle_v1.json", referenceBundle);

  console.log(JSON.stringify({
    difficulty_policy: relativeOut("wave1_difficulty_mixing_policy.json"),
    reference_bundle: relativeOut("wave1_reference_bundle_v1.json"),
    lesson_count: difficultyPolicy.scope.lesson_count,
    target_item_count: difficultyPolicy.scope.target_item_count,
    question_shell_count: difficultyPolicy.scope.question_shell_count,
    missing_item_count: referenceBundle.phase4_summary.item_mapping.missing_items,
    production_ready: referenceBundle.authoring_readiness.production_ready
  }, null, 2));
}

main();
