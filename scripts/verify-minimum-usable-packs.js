const fs = require("fs");
const path = require("path");

const repoRoot = path.join(__dirname, "..");
const files = {
  packs: path.join(repoRoot, "drafts", "v0-v3-rebuild", "minimum_usable_packs.json"),
  productionItems: path.join(repoRoot, "data", "vocab", "vocab_items.json"),
  curriculum: path.join(repoRoot, "data", "vocab", "curriculum.json"),
  v3Questions: path.join(repoRoot, "drafts", "collocation-rebuild", "wave1_question_shells.json"),
  v3Items: path.join(repoRoot, "drafts", "collocation-rebuild", "wave1_vocab_items_seed_draft.json")
};

const REQUIRED_STAGE_PACKS = {
  V1: {
    pack_id: "MUP-V1-01",
    minimum_lessons: 2,
    minimum_question_rows: 64,
    required_types: ["word_family", "part5_sentence_completion", "collocation", "speed_drill", "review_question"]
  },
  V2: {
    pack_id: "MUP-V2-01",
    minimum_lessons: 1,
    minimum_question_rows: 24,
    required_types: ["scene_vocabulary", "review_question"]
  },
  V3: {
    pack_id: "MUP-V3-01",
    minimum_lessons: 1,
    minimum_question_rows: 24,
    required_types: ["collocation", "part5_sentence_completion", "part6_context_choice", "review_question"]
  }
};

const SAMPLE_TYPE_TIMES = {
  word_family: 20,
  part5_sentence_completion: 20,
  collocation: 15,
  speed_drill: 8,
  scene_vocabulary: 15,
  review_question: 15
};

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function check(id, pass, detail, severity = "error") {
  return { id, pass, detail, severity };
}

function sorted(values) {
  return [...values].sort();
}

function sameSet(left, right) {
  const a = sorted(left);
  const b = sorted(right);
  return a.length === b.length && a.every((value, index) => value === b[index]);
}

function unique(values) {
  return new Set(values).size === values.length;
}

function textLength(value) {
  return Array.from(String(value || "")).length;
}

function hasCjk(value) {
  return /[\u3400-\u9fff]/.test(String(value || ""));
}

function blankCount(value) {
  return (String(value || "").match(/______/g) || []).length;
}

function hasExactOptions(question) {
  const keys = Object.keys(question.options || {});
  return sameSet(keys, ["A", "B", "C", "D"])
    && keys.every((key) => String(question.options[key] || "").trim())
    && keys.includes(question.correct_answer);
}

function hasRequiredQuestionFields(question) {
  return [
    "question_id",
    "lesson_id",
    "stage",
    "type",
    "skill",
    "subskill",
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
  ].every((field) => Object.prototype.hasOwnProperty.call(question, field));
}

function validatesQuestionShape(question, knownProductionItems) {
  const optionShape = hasExactOptions(question);
  const explanationLength = textLength(question.explanation_zh);
  const explanationShape = explanationLength >= 20 && explanationLength <= 90 && hasCjk(question.explanation_zh);
  const targetItem = knownProductionItems.get(question.target_item_id);
  const targetShape = targetItem && targetItem.stage === question.stage;
  const tagsShape = Array.isArray(question.tags) && question.tags.length > 0;
  const timeShape = SAMPLE_TYPE_TIMES[question.type] === question.estimated_time_seconds;
  const blankShape = question.stage === "V2" && question.type === "review_question"
    ? blankCount(question.question_text) === 0 && question.question_text.startsWith("Quick review:")
    : blankCount(question.question_text) === 1;

  return optionShape && explanationShape && targetShape && tagsShape && timeShape && blankShape;
}

function main() {
  const packs = readJson(files.packs);
  const productionItems = readJson(files.productionItems);
  const curriculum = readJson(files.curriculum);
  const v3Questions = readJson(files.v3Questions);
  const v3Items = readJson(files.v3Items);

  const knownProductionItems = new Map(productionItems.map((item) => [item.item_id, item]));
  const knownV3DraftItems = new Map((v3Items.items || []).map((item) => [item.item_id, item]));
  const stagePacks = new Map((packs.stage_packs || []).map((pack) => [pack.stage, pack]));
  const samples = packs.authoring_samples || [];
  const externalSources = packs.external_sample_sources || [];
  const sampleIds = samples.map((sample) => sample.question_id);
  const sampleTexts = samples.map((sample) => sample.question_text);

  const checks = [
    check(
      "artifact_status",
      packs.artifact === "minimum_usable_packs"
        && packs.status === "draft_governance"
        && packs.production_impact === "none"
        && packs.production_ready === false,
      "Minimum usable packs artifact is explicitly draft governance with no production impact."
    ),
    check(
      "production_seed_shape",
      typeof curriculum.seed_version === "string"
        && curriculum.seed_version.trim().length > 0
        && Array.isArray(curriculum.lessons),
      "Production curriculum remains readable and app-shaped; this draft verifier does not pin production to a specific wave."
    ),
    check(
      "stage_pack_presence",
      Object.keys(REQUIRED_STAGE_PACKS).every((stage) => stagePacks.has(stage)),
      "V1, V2, and V3 minimum packs are all present."
    )
  ];

  for (const [stage, requirement] of Object.entries(REQUIRED_STAGE_PACKS)) {
    const pack = stagePacks.get(stage);
    const lessonPlan = pack?.lesson_plan || [];
    const lessonRows = lessonPlan.reduce((sum, lesson) => sum + Number(lesson.session_question_rows || 0) + Number(lesson.review_question_rows || 0), 0);
    const coveredTypes = Array.from(new Set(lessonPlan.flatMap((lesson) => lesson.required_type_coverage || [])));
    const targetItems = pack?.first_sample_target_items || [];
    const itemSource = stage === "V3" ? knownV3DraftItems : knownProductionItems;

    checks.push(
      check(
        `${stage.toLowerCase()}_pack_counts`,
        pack?.pack_id === requirement.pack_id
          && pack.minimum_lessons === requirement.minimum_lessons
          && pack.minimum_question_rows === requirement.minimum_question_rows
          && lessonPlan.length === requirement.minimum_lessons
          && lessonRows === requirement.minimum_question_rows,
        `${requirement.pack_id} has the required lesson and question-row counts.`
      ),
      check(
        `${stage.toLowerCase()}_type_coverage`,
        requirement.required_types.every((type) => coveredTypes.includes(type)),
        `${requirement.pack_id} covers required types: ${requirement.required_types.join(", ")}.`
      ),
      check(
        `${stage.toLowerCase()}_target_items_exist`,
        targetItems.length > 0 && targetItems.every((itemId) => itemSource.has(itemId)),
        `${requirement.pack_id} target items exist in the expected ${stage === "V3" ? "draft" : "production"} item source.`
      )
    );
  }

  checks.push(
    check(
      "sample_identity_unique",
      samples.length >= 7 && unique(sampleIds) && unique(sampleTexts),
      `Authoring samples are unique by ID and text; sample count = ${samples.length}.`
    ),
    check(
      "sample_required_fields",
      samples.every((sample) => hasRequiredQuestionFields(sample)),
      "Every inline authoring sample has the required app-schema question fields."
    ),
    check(
      "sample_question_shape",
      samples.every((sample) => validatesQuestionShape(sample, knownProductionItems)),
      "Inline V1/V2 samples have valid options, answer keys, explanations, targets, timing, tags, and blank/review shape."
    )
  );

  for (const [stage, requirement] of Object.entries(REQUIRED_STAGE_PACKS)) {
    if (stage === "V3") continue;
    const sampleTypes = Array.from(new Set(samples.filter((sample) => sample.stage === stage).map((sample) => sample.type)));
    checks.push(
      check(
        `${stage.toLowerCase()}_sample_type_coverage`,
        requirement.required_types.every((type) => sampleTypes.includes(type)),
        `Inline ${stage} samples cover ${requirement.required_types.join(", ")}.`
      )
    );
  }

  const v3Source = externalSources.find((source) => source.stage === "V3" && source.pack_id === "MUP-V3-01");
  const v3LessonQuestions = (v3Questions.questions || []).filter((question) => question.lesson_id === v3Source?.lesson_id);
  const v3SampleQuestions = v3LessonQuestions.filter((question) => (v3Source?.sample_question_ids || []).includes(question.question_id));
  const v3Types = Array.from(new Set(v3LessonQuestions.map((question) => question.type)));

  checks.push(
    check(
      "v3_external_source_present",
      Boolean(v3Source) && v3LessonQuestions.length === 24 && v3SampleQuestions.length === 4,
      "V3 external sample source points to the 24-row V3-W1-01 authored draft slice and four representative samples."
    ),
    check(
      "v3_external_type_coverage",
      REQUIRED_STAGE_PACKS.V3.required_types.every((type) => v3Types.includes(type)),
      "V3-W1-01 authored draft slice covers collocation, Part 5, Part 6, and review rows."
    ),
    check(
      "manual_review_checklist",
      [
        "content_quality",
        "semantic_sense_control",
        "error_code_mapping",
        "answer_distribution",
        "explanation_quality",
        "distractor_quality",
        "review_pressure",
        "seed_to_lesson_to_review_to_export_smoke"
      ].every((item) => (packs.manual_review_required || []).includes(item)),
      "Manual review checklist includes all required C-05 review areas."
    )
  );

  const failures = checks.filter((row) => !row.pass && row.severity !== "warning");
  const report = {
    verified_at: new Date().toISOString(),
    script: "scripts/verify-minimum-usable-packs.js",
    artifact: "drafts/v0-v3-rebuild/minimum_usable_packs.json",
    status: failures.length === 0 ? "passed" : "failed",
    summary: {
      checks_total: checks.length,
      checks_passed: checks.filter((row) => row.pass).length,
      errors: failures.length,
      inline_sample_questions: samples.length,
      v3_external_lesson_rows: v3LessonQuestions.length
    },
    checks
  };

  console.log(JSON.stringify(report, null, 2));

  if (failures.length > 0) {
    process.exit(1);
  }
}

main();
