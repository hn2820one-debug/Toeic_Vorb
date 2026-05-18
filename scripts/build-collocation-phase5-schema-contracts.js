const fs = require("fs");
const path = require("path");

const repoRoot = path.join(__dirname, "..");
const outDir = path.join(repoRoot, "drafts", "collocation-rebuild");

const paths = {
  curriculum: path.join(repoRoot, "data", "vocab", "curriculum.json"),
  vocabItems: path.join(repoRoot, "data", "vocab", "vocab_items.json"),
  grammarLinks: path.join(repoRoot, "data", "vocab", "grammar_links.json"),
  questionSpec: path.join(repoRoot, "docs", "question-creation-spec.md"),
  vocabDb: path.join(repoRoot, "js", "vocab-db.js"),
  lessonView: path.join(repoRoot, "js", "views", "lesson.js"),
  phase4Bundle: path.join(outDir, "wave1_reference_bundle_v1.json"),
  lessonDraft: path.join(outDir, "wave1_app_lesson_draft.json"),
  questionPlan: path.join(outDir, "wave1_question_plan.json"),
  vocabSeedDraft: path.join(outDir, "wave1_vocab_items_seed_draft.json"),
  questionShells: path.join(outDir, "wave1_question_shells.json")
};

const QUESTION_REQUIRED_FIELDS = [
  "question_id",
  "lesson_id",
  "stage",
  "type",
  "skill",
  "subskill",
  "grammar_link_id",
  "question_text",
  "options",
  "correct_answer",
  "explanation_zh",
  "target_item_id",
  "distractor_type",
  "difficulty",
  "estimated_time_seconds",
  "default_error_code",
  "tags"
];

const LESSON_REQUIRED_FIELDS = [
  "lesson_id",
  "stage",
  "stage_name",
  "lesson_number",
  "title",
  "estimated_minutes",
  "lesson_type",
  "topic",
  "target_items",
  "question_ids",
  "review_question_ids",
  "mastery_threshold",
  "seal_threshold",
  "status"
];

const VOCAB_ITEM_REQUIRED_FIELDS = [
  "item_id",
  "item_type",
  "stage",
  "lesson_id",
  "lesson_ids",
  "base_word",
  "variants",
  "chinese",
  "example",
  "common_wrong_forms",
  "toeic_contexts",
  "review_priority",
  "mastery_score",
  "mastery_level"
];

const CURRICULUM_REQUIRED_FIELDS = [
  "course_id",
  "course_name",
  "schema_version",
  "seed_version",
  "generated_at",
  "default_user",
  "stages",
  "lessons",
  "question_files"
];

const OPTION_LETTERS = ["A", "B", "C", "D"];
const VALID_ANSWERS = new Set(OPTION_LETTERS);
const VALID_QUESTION_TYPES = [
  "meaning_choice",
  "scene_vocabulary",
  "word_family",
  "collocation",
  "part5_sentence_completion",
  "part6_context_choice",
  "speed_drill",
  "review_question",
  "formal_phrase",
  "false_friend"
];

function readJSON(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJSON(filePath, value) {
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function relative(filePath) {
  return path.relative(repoRoot, filePath).replace(/\\/g, "/");
}

function countBy(rows, getKey) {
  return rows.reduce((acc, row) => {
    const key = getKey(row) || "unknown";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
}

function hasValue(row, field) {
  return row[field] !== undefined && row[field] !== null && row[field] !== "";
}

function hasField(row, field) {
  return Object.prototype.hasOwnProperty.call(row, field) && row[field] !== undefined;
}

function missingFields(row, fields) {
  return fields.filter((field) => !hasField(row, field));
}

function validateQuestionRow(question, context) {
  const issues = [];
  const missing = missingFields(question, QUESTION_REQUIRED_FIELDS);
  if (missing.length) issues.push(`${context}: missing ${missing.join(", ")}`);

  if (!question.options || typeof question.options !== "object" || Array.isArray(question.options)) {
    issues.push(`${context}: options must be an object`);
  } else {
    const optionMissing = OPTION_LETTERS.filter((letter) => !hasValue(question.options, letter));
    if (optionMissing.length) issues.push(`${context}: missing options.${optionMissing.join(", options.")}`);
  }

  if (!VALID_ANSWERS.has(question.correct_answer)) {
    issues.push(`${context}: correct_answer must be A/B/C/D`);
  }

  if (!VALID_QUESTION_TYPES.includes(question.type)) {
    issues.push(`${context}: unknown question type ${question.type}`);
  }

  if (![1, 2, 3].includes(question.difficulty)) {
    issues.push(`${context}: difficulty must be 1/2/3`);
  }

  if (!Array.isArray(question.tags) || question.tags.length === 0) {
    issues.push(`${context}: tags must be a non-empty array`);
  }

  return issues;
}

function containsTodo(value) {
  if (typeof value === "string") return value.includes("TODO");
  if (Array.isArray(value)) return value.some(containsTodo);
  if (value && typeof value === "object") return Object.values(value).some(containsTodo);
  return false;
}

function buildConsistencyChecks({ curriculum, phase4Bundle, lessonDraft, questionPlan, vocabSeedDraft, questionShells, productionItems }) {
  const lessons = lessonDraft.lessons || [];
  const slots = (questionPlan.lessons || []).flatMap((lesson) => lesson.question_slots || []);
  const questions = questionShells.questions || [];
  const draftItems = vocabSeedDraft.items || [];
  const productionItemIds = new Set(productionItems.map((item) => item.item_id));
  const draftItemIds = new Set(draftItems.map((item) => item.item_id));
  const questionIds = new Set(questions.map((question) => question.question_id));
  const slotIds = new Set(slots.map((slot) => slot.question_id));

  const lessonFieldIssues = lessons.flatMap((lesson) => (
    missingFields(lesson, LESSON_REQUIRED_FIELDS).map((field) => `${lesson.lesson_id || "(missing lesson_id)"} missing ${field}`)
  ));
  const questionFieldIssues = questions.flatMap((question) => validateQuestionRow(question, question.question_id || "(missing question_id)"));
  const vocabItemFieldIssues = draftItems.flatMap((item) => (
    missingFields(item, VOCAB_ITEM_REQUIRED_FIELDS).map((field) => `${item.item_id || "(missing item_id)"} missing ${field}`)
  ));
  const lessonReferenceIssues = lessons.flatMap((lesson) => {
    const ids = [...(lesson.question_ids || []), ...(lesson.review_question_ids || [])];
    return ids.filter((id) => !questionIds.has(id)).map((id) => `${lesson.lesson_id} references missing question ${id}`);
  });
  const slotShellIssues = [
    ...slots.filter((slot) => !questionIds.has(slot.question_id)).map((slot) => `slot missing shell ${slot.question_id}`),
    ...questions.filter((question) => !slotIds.has(question.question_id)).map((question) => `shell missing slot ${question.question_id}`)
  ];
  const targetReferenceIssues = questions
    .filter((question) => !draftItemIds.has(question.target_item_id) && !productionItemIds.has(question.target_item_id))
    .map((question) => `${question.question_id} references unknown target_item_id ${question.target_item_id}`);

  const quotaIssues = lessons.flatMap((lesson) => {
    const issues = [];
    const qCount = (lesson.question_ids || []).length;
    const rvCount = (lesson.review_question_ids || []).length;
    if (qCount !== 20) issues.push(`${lesson.lesson_id} question_ids=${qCount}, expected 20 for Wave 1 draft core lesson`);
    if (rvCount !== 4) issues.push(`${lesson.lesson_id} review_question_ids=${rvCount}, expected 4 for Wave 1 draft core lesson`);
    return issues;
  });

  const todoShellCount = questions.filter(containsTodo).length;
  const draftItemExampleMissing = draftItems.filter((item) => !String(item.example || "").trim()).length;

  const checks = [
    {
      id: "curriculum_shape",
      pass: missingFields(curriculum, CURRICULUM_REQUIRED_FIELDS).length === 0,
      detail: `curriculum.json required root fields present; production lessons currently ${(curriculum.lessons || []).length}.`
    },
    {
      id: "phase4_bundle_status",
      pass: phase4Bundle.reference_role === "ability_signal_only"
        && phase4Bundle.status === "draft_only"
        && phase4Bundle.scope?.production_merge_allowed === false,
      detail: "Phase 4 bundle is draft-only and production merge is disabled."
    },
    {
      id: "lesson_contract",
      pass: lessonFieldIssues.length === 0 && lessonReferenceIssues.length === 0,
      detail: lessonFieldIssues.concat(lessonReferenceIssues).slice(0, 5).join("; ") || `${lessons.length} draft lessons satisfy required lesson fields and question references.`
    },
    {
      id: "question_contract",
      pass: questionFieldIssues.length === 0 && slotShellIssues.length === 0 && targetReferenceIssues.length === 0,
      detail: questionFieldIssues.concat(slotShellIssues, targetReferenceIssues).slice(0, 5).join("; ") || `${questions.length} draft question shells satisfy structural question fields and target references.`
    },
    {
      id: "vocab_item_contract",
      pass: vocabItemFieldIssues.length === 0,
      detail: vocabItemFieldIssues.slice(0, 5).join("; ") || `${draftItems.length} draft vocab item rows satisfy structural fields.`
    },
    {
      id: "quota_contract",
      pass: quotaIssues.length === 0,
      detail: quotaIssues.slice(0, 5).join("; ") || `${lessons.length} lessons use 20 core + 4 review draft quota.`
    },
    {
      id: "authoring_content_status",
      pass: todoShellCount === questions.length && draftItemExampleMissing === draftItems.length,
      detail: `${todoShellCount}/${questions.length} question rows are TODO shells; ${draftItemExampleMissing}/${draftItems.length} draft item examples are blank. This is expected before authoring but blocks production merge.`
    }
  ];

  return {
    status: checks.every((check) => check.pass) ? "passed" : "failed",
    checked_at: new Date().toISOString(),
    checks
  };
}

function buildContracts(data) {
  const questions = data.questionShells.questions || [];
  const lessons = data.lessonDraft.lessons || [];
  const draftItems = data.vocabSeedDraft.items || [];
  const slots = (data.questionPlan.lessons || []).flatMap((lesson) => lesson.question_slots || []);
  const todoQuestionShells = questions.filter(containsTodo).length;
  const blankDraftItemExamples = draftItems.filter((item) => !String(item.example || "").trim()).length;
  const contentReady = todoQuestionShells === 0 && blankDraftItemExamples === 0;

  const consistencyChecks = buildConsistencyChecks(data);
  const schemaReady = consistencyChecks.status === "passed";

  return {
    generated_at: new Date().toISOString(),
    contract_version: "wave1_phase5_schema_contracts_v1",
    reference_role: "ability_signal_only",
    status: "draft_only",
    production_impact: "none",
    production_merge_allowed: false,
    schema_ready: schemaReady,
    content_ready: contentReady,
    authoring_ready: false,
    production_ready: false,
    readiness: {
      schema_ready: schemaReady,
      content_ready: contentReady,
      authoring_ready: false,
      phase6_policy_ready: false,
      production_ready: false,
      production_merge_allowed: false,
      interpretation: "Phase 5 validates structural contracts only. It does not certify authored content, Phase 6 policies, or production merge readiness."
    },
    source_files: [
      relative(paths.curriculum),
      relative(paths.vocabItems),
      relative(paths.grammarLinks),
      relative(paths.questionSpec),
      relative(paths.vocabDb),
      relative(paths.lessonView),
      relative(paths.phase4Bundle),
      relative(paths.lessonDraft),
      relative(paths.questionPlan),
      relative(paths.vocabSeedDraft),
      relative(paths.questionShells)
    ],
    scope: {
      program: "Program B - TOEIC Vocabulary Tracker",
      stage: "V3",
      lesson_type: "collocation",
      wave: 1,
      lesson_count: lessons.length,
      question_shell_count: questions.length,
      draft_vocab_item_count: draftItems.length
    },
    contracts: {
      curriculum_root: {
        required_fields: CURRICULUM_REQUIRED_FIELDS,
        production_manifest_rule: "Only files listed in data/vocab/curriculum.json -> question_files are production question files.",
        seed_version_rule: "Production merges must sync seed_version in curriculum.json, js/vocab-db.js, and tests/helpers/seed-idb.ts."
      },
      lesson: {
        required_fields: LESSON_REQUIRED_FIELDS,
        id_policy: "Draft IDs stay V3-W1-NN until Step 40 freezes production lesson IDs.",
        runtime_reference_rule: "question_ids and review_question_ids must reference valid question rows loaded from the production manifest after merge.",
        wave1_quota: {
          question_ids: 20,
          review_question_ids: 4,
          total_session_rows_if_all_loaded: 24
        }
      },
      question: {
        required_fields: QUESTION_REQUIRED_FIELDS,
        option_keys: OPTION_LETTERS,
        valid_correct_answers: OPTION_LETTERS,
        valid_types: VALID_QUESTION_TYPES,
        wave1_allowed_types: ["collocation", "part5_sentence_completion", "part6_context_choice", "review_question"],
        wave1_stage: "V3",
        wave1_skill: "collocation",
        wave1_distractor_type: "wrong_verb_collocation",
        production_authoring_blockers: [
          "question_text must be fully authored and globally unique",
          "options must be real distractors, not TODO placeholders",
          "explanation_zh must be Traditional Chinese and explain the rule/trap",
          "target_item_id must exist in production vocab_items.json after item merge"
        ]
      },
      vocab_item: {
        required_fields: VOCAB_ITEM_REQUIRED_FIELDS,
        wave1_item_type: "collocation",
        production_authoring_blockers: [
          "example must be non-empty before production merge",
          "chinese must be reviewed for the intended collocation sense",
          "lesson_ids must point to the final production lesson IDs after Step 40"
        ]
      }
    },
    runtime_dependencies: {
      indexeddb_stores: {
        lessons: "keyPath lesson_id; indexes stage, status, lesson_type",
        questions: "keyPath question_id; indexes lesson_id, stage, type, default_error_code, target_item_id",
        vocab_items: "keyPath item_id; indexes item_type, mastery_level, next_review_date"
      },
      lesson_view_requires: [
        "question_text",
        "options.A-D",
        "correct_answer",
        "target_item_id",
        "default_error_code",
        "estimated_time_seconds",
        "grammar_link_id"
      ],
      seeding_requires: [
        "curriculum.question_files",
        "curriculum.lessons",
        "question arrays from data/vocab/*.json",
        "data/vocab/vocab_items.json"
      ]
    },
    current_counts: {
      question_type_counts: countBy(questions, (question) => question.type),
      slot_role_counts: countBy(slots, (slot) => slot.slot_role),
      draft_target_item_count: draftItems.length,
      todo_question_shells: todoQuestionShells,
      blank_draft_item_examples: blankDraftItemExamples
    },
    blocking_authoring_gaps: [
      {
        id: "todo_question_shells",
        count: todoQuestionShells,
        total: questions.length,
        blocks: ["authoring_ready", "content_ready", "production_ready"],
        required_action: "Replace TODO question_text, options, and explanation_zh with fully authored TOEIC content."
      },
      {
        id: "blank_draft_item_examples",
        count: blankDraftItemExamples,
        total: draftItems.length,
        blocks: ["content_ready", "production_ready"],
        required_action: "Add reviewed example sentences to Wave 1 vocab item rows before production merge."
      },
      {
        id: "phase6_policy_gaps",
        count: 5,
        blocks: ["authoring_ready", "production_ready"],
        required_action: "Complete semantic_sense/target_item_id policy, distractor-bank schema, explanation rubric, source-of-truth workflow alignment, and reference doc sync."
      }
    ],
    consistency_checks: consistencyChecks,
    next_phase_inputs: {
      phase6_needs: [
        "semantic_sense and target_item_id policy for direct-definition control",
        "distractor-bank schema",
        "explanation_zh rubric",
        "source-of-truth workflow alignment",
        "core reference doc synchronization"
      ],
      phase9_authoring_can_use: [
        "lesson required fields",
        "question required fields",
        "vocab item required fields",
        "20 core + 4 review quota"
      ]
    }
  };
}

function main() {
  const data = {
    curriculum: readJSON(paths.curriculum),
    productionItems: readJSON(paths.vocabItems),
    phase4Bundle: readJSON(paths.phase4Bundle),
    lessonDraft: readJSON(paths.lessonDraft),
    questionPlan: readJSON(paths.questionPlan),
    vocabSeedDraft: readJSON(paths.vocabSeedDraft),
    questionShells: readJSON(paths.questionShells)
  };

  const contracts = buildContracts(data);
  if (contracts.consistency_checks.status !== "passed") {
    console.error(JSON.stringify(contracts.consistency_checks, null, 2));
    process.exit(1);
  }

  const outPath = path.join(outDir, "wave1_schema_contracts.json");
  writeJSON(outPath, contracts);
  console.log(JSON.stringify({
    schema_contracts: relative(outPath),
    schema_ready: contracts.schema_ready,
    production_ready: contracts.production_ready,
    lesson_count: contracts.scope.lesson_count,
    question_shell_count: contracts.scope.question_shell_count,
    draft_vocab_item_count: contracts.scope.draft_vocab_item_count,
    checks: contracts.consistency_checks.checks.length
  }, null, 2));
}

main();
