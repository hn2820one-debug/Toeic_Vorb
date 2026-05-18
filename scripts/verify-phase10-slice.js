const fs = require("fs");
const path = require("path");

const repoRoot = path.join(__dirname, "..");
const reportPath = path.join(repoRoot, "drafts", "collocation-rebuild", "wave1_phase10_slice_verification.json");

const files = {
  applyScript: path.join(repoRoot, "scripts", "apply-phase10-wave1-slice.js"),
  questionShells: path.join(repoRoot, "drafts", "collocation-rebuild", "wave1_question_shells.json"),
  vocabSeedDraft: path.join(repoRoot, "drafts", "collocation-rebuild", "wave1_vocab_items_seed_draft.json"),
  curriculum: path.join(repoRoot, "data", "vocab", "curriculum.json"),
  questionsV3a: path.join(repoRoot, "data", "vocab", "questions_v3a.json"),
  productionVocabItems: path.join(repoRoot, "data", "vocab", "vocab_items.json")
};

const LESSON_ID = "V3-W1-01";
const QUESTION_IDS = [
  "V3-W1-01_Q01",
  "V3-W1-01_Q02",
  "V3-W1-01_Q03",
  "V3-W1-01_Q04",
  "V3-W1-01_Q05",
  "V3-W1-01_Q06",
  "V3-W1-01_Q07",
  "V3-W1-01_Q08",
  "V3-W1-01_Q09",
  "V3-W1-01_Q10",
  "V3-W1-01_Q11",
  "V3-W1-01_Q12",
  "V3-W1-01_Q13",
  "V3-W1-01_Q14",
  "V3-W1-01_Q15",
  "V3-W1-01_Q16",
  "V3-W1-01_Q17",
  "V3-W1-01_Q18",
  "V3-W1-01_Q19",
  "V3-W1-01_Q20",
  "V3-W1-01_R01",
  "V3-W1-01_R02",
  "V3-W1-01_R03",
  "V3-W1-01_R04"
];
const ITEM_IDS = [
  "item_coll_run_out_of",
  "item_coll_set_up",
  "item_coll_drop_by",
  "item_coll_look_over",
  "item_coll_run_into",
  "item_coll_pick_up",
  "item_coll_give_out"
];
const EXPECTED_SEED_VERSION = "toeic_vocab_tracker_c004_full_bank_clear_2026_05_18";
const EXPECTED_EDITORIAL_REVIEW_STATUS = "phase10_review_passed";
const QUESTION_TARGETS = {
  "V3-W1-01_Q01": "item_coll_run_out_of",
  "V3-W1-01_Q02": "item_coll_run_out_of",
  "V3-W1-01_Q03": "item_coll_set_up",
  "V3-W1-01_Q04": "item_coll_set_up",
  "V3-W1-01_Q05": "item_coll_drop_by",
  "V3-W1-01_Q06": "item_coll_drop_by",
  "V3-W1-01_Q07": "item_coll_look_over",
  "V3-W1-01_Q08": "item_coll_look_over",
  "V3-W1-01_Q09": "item_coll_run_into",
  "V3-W1-01_Q10": "item_coll_run_into",
  "V3-W1-01_Q11": "item_coll_pick_up",
  "V3-W1-01_Q12": "item_coll_pick_up",
  "V3-W1-01_Q13": "item_coll_give_out",
  "V3-W1-01_Q14": "item_coll_give_out",
  "V3-W1-01_Q15": "item_coll_run_out_of",
  "V3-W1-01_Q16": "item_coll_set_up",
  "V3-W1-01_Q17": "item_coll_drop_by",
  "V3-W1-01_Q18": "item_coll_look_over",
  "V3-W1-01_Q19": "item_coll_run_into",
  "V3-W1-01_Q20": "item_coll_pick_up",
  "V3-W1-01_R01": "item_coll_run_out_of",
  "V3-W1-01_R02": "item_coll_set_up",
  "V3-W1-01_R03": "item_coll_drop_by",
  "V3-W1-01_R04": "item_coll_look_over"
};
const TYPE_POLICY = {
  collocation: {
    skill: "collocation",
    subskill: "target_collocation",
    estimated_time_seconds: 15,
    default_error_code: "COLLOCATION_GAP",
    distractor_type: "wrong_verb_collocation",
    slot_role_tag: "slot_role:core"
  },
  part5_sentence_completion: {
    skill: "collocation",
    subskill: "sentence_completion",
    estimated_time_seconds: 20,
    default_error_code: "VOCAB_WEAK_RECALL",
    distractor_type: "wrong_verb_collocation",
    slot_role_tag: "slot_role:core"
  },
  part6_context_choice: {
    skill: "collocation",
    subskill: "context_choice",
    estimated_time_seconds: 45,
    default_error_code: "SCENE_VOCAB_GAP",
    distractor_type: "wrong_verb_collocation",
    slot_role_tag: "slot_role:core"
  },
  review_question: {
    skill: "collocation",
    subskill: "meaning_review",
    estimated_time_seconds: 15,
    default_error_code: "VOCAB_WEAK_RECALL",
    distractor_type: "mixed_review_collocation",
    slot_role_tag: "slot_role:review"
  }
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

function sameStringSet(left, right) {
  if (left.length !== right.length) return false;
  return left.every((value, index) => value === right[index]);
}

function textLength(value) {
  return Array.from(String(value || "")).length;
}

function containsTodo(question) {
  const optionValues = Object.values(question.options || {});
  return [question.question_text, question.explanation_zh, ...optionValues].some((value) => String(value || "").includes("TODO"));
}

function sentenceCount(text) {
  return String(text || "")
    .split(/[.!?](?:\s|$)/)
    .map((part) => part.trim())
    .filter(Boolean).length;
}

function hasExactOptions(question) {
  const optionKeys = sorted(Object.keys(question.options || {}));
  return sameStringSet(optionKeys, ["A", "B", "C", "D"])
    && optionKeys.every((key) => String(question.options[key] || "").trim())
    && optionKeys.includes(question.correct_answer);
}

function matchesTypePolicy(question) {
  const policy = TYPE_POLICY[question.type];
  if (!policy) return false;

  return question.skill === policy.skill
    && question.subskill === policy.subskill
    && question.estimated_time_seconds === policy.estimated_time_seconds
    && question.default_error_code === policy.default_error_code
    && question.distractor_type === policy.distractor_type
    && Array.isArray(question.tags)
    && question.tags.includes(policy.slot_role_tag);
}

function main() {
  const write = process.argv.includes("--write");

  const questionShells = readJson(files.questionShells);
  const vocabSeedDraft = readJson(files.vocabSeedDraft);
  const curriculum = readJson(files.curriculum);
  const questionsV3a = readJson(files.questionsV3a);
  const productionVocabItems = readJson(files.productionVocabItems);
  const applyScriptSource = fs.readFileSync(files.applyScript, "utf8");

  const lessonQuestions = questionShells.questions.filter((question) => question.lesson_id === LESSON_ID);
  const lessonQuestionIds = sorted(lessonQuestions.map((question) => question.question_id));
  const expectedQuestionIds = sorted(QUESTION_IDS);
  const lessonItems = vocabSeedDraft.items.filter((item) => ITEM_IDS.includes(item.item_id));
  const reviewQuestions = lessonQuestions.filter((question) => question.type === "review_question");
  const part6Questions = lessonQuestions.filter((question) => question.type === "part6_context_choice");
  const questionTexts = lessonQuestions.map((question) => question.question_text);
  const typeCounts = lessonQuestions.reduce((acc, question) => {
    acc[question.type] = (acc[question.type] || 0) + 1;
    return acc;
  }, {});
  const productionTargetIds = new Set(productionVocabItems.map((item) => item.item_id));

  const checks = [
    check(
      "apply_script_present",
      applyScriptSource.includes("Authored Phase 10 slice for V3-W1-01"),
      "Phase 10 slice authoring script exists and targets V3-W1-01."
    ),
    check(
      "slice_question_count",
      lessonQuestions.length === QUESTION_IDS.length,
      `Lesson ${LESSON_ID} authored question rows = ${lessonQuestions.length}`
    ),
    check(
      "slice_question_id_alignment",
      sameStringSet(lessonQuestionIds, expectedQuestionIds),
      `Lesson ${LESSON_ID} question_id coverage = ${lessonQuestionIds.length}`
    ),
    check(
      "question_target_alignment",
      lessonQuestions.every((question) => QUESTION_TARGETS[question.question_id] === question.target_item_id),
      "All 24 first-slice rows keep the expected question_id -> target_item_id mapping."
    ),
    check(
      "no_todo_markers",
      lessonQuestions.every((question) => !containsTodo(question)),
      "All first-slice question text, options, and explanations are authored (no TODO markers remain)."
    ),
    check(
      "option_schema_integrity",
      lessonQuestions.every((question) => hasExactOptions(question)),
      "All first-slice rows use exactly four non-empty A/B/C/D options, and correct_answer points to one of them."
    ),
    check(
      "type_distribution",
      typeCounts.collocation === 7
        && typeCounts.part5_sentence_completion === 7
        && typeCounts.part6_context_choice === 6
        && typeCounts.review_question === 4,
      `Type counts = ${JSON.stringify(typeCounts)}`
    ),
    check(
      "review_format",
      reviewQuestions.length === 4 && reviewQuestions.every((question) => /^Quick review: choose the best TOEIC meaning for ".+"\.$/.test(question.question_text)),
      "All four review rows use the V3 direct-meaning review format."
    ),
    check(
      "part6_passage_shape",
      part6Questions.length === 6 && part6Questions.every((question) => question.question_text.includes("______") && sentenceCount(question.question_text) >= 2),
      "All six Part 6 rows use multi-sentence passage-style prompts with a blank."
    ),
    check(
      "type_policy_alignment",
      lessonQuestions.every((question) => matchesTypePolicy(question)),
      "All first-slice rows keep the expected skill, subskill, time, error-code, distractor, and slot-role policy by type."
    ),
    check(
      "explanation_length",
      lessonQuestions.every((question) => {
        const length = textLength(question.explanation_zh);
        return length >= 20 && length <= 80;
      }),
      "All first-slice explanations are within the draft review length band (20-80 chars)."
    ),
    check(
      "question_text_unique",
      new Set(questionTexts).size === questionTexts.length,
      "All 24 first-slice question_text values are unique."
    ),
    check(
      "item_example_coverage",
      lessonItems.length === ITEM_IDS.length && lessonItems.every((item) => String(item.example || "").trim()),
      `Authored vocab item examples = ${lessonItems.length}`
    ),
    check(
      "item_trap_metadata",
      lessonItems.every((item) => Array.isArray(item.common_wrong_forms) && item.common_wrong_forms.length >= 2),
      "All seven authored vocab items include at least two common_wrong_forms trap cues."
    ),
    check(
      "authored_metadata_alignment",
      lessonQuestions.every((question) => {
        const metadata = question.draft_metadata || {};
        const tags = Array.isArray(question.tags) ? question.tags : [];
        return metadata.authoring_status === "authored_slice"
          && metadata.authored_in_phase === "phase10"
          && metadata.authored_slice_lesson_id === LESSON_ID
          && metadata.editorial_review_status === EXPECTED_EDITORIAL_REVIEW_STATUS
          && tags.includes("draft_authored")
          && tags.includes("phase10")
          && tags.includes("resolution:authored");
      }) && lessonItems.every((item) => {
        const metadata = item.draft_metadata || {};
        return metadata.authoring_status === "authored_slice"
          && metadata.resolution_status === "authored_slice"
          && metadata.authored_in_phase === "phase10"
          && metadata.editorial_review_status === EXPECTED_EDITORIAL_REVIEW_STATUS;
      }),
      "Question and vocab-row metadata both record authored-slice + reviewed Phase 10 status."
    ),
    check(
      "artifact_note_alignment",
      String(questionShells.content_generation_note || "").includes("V3-W1-01")
        && String(questionShells.content_generation_note || "").includes("draft-only")
        && String(vocabSeedDraft.content_generation_note || "").includes("V3-W1-01")
        && String(vocabSeedDraft.content_generation_note || "").includes("draft-only"),
      "Draft artifact notes now reflect a mixed state: draft-only overall, with V3-W1-01 already authored."
    ),
    check(
      "production_seed_unchanged",
      curriculum.seed_version === EXPECTED_SEED_VERSION
        && questionsV3a.length === 0
        && ITEM_IDS.every((itemId) => !productionTargetIds.has(itemId)),
      "Production curriculum seed, questions_v3a, and vocab_items remain unchanged after the draft-only slice authoring."
    )
  ];

  const failures = checks.filter((row) => !row.pass && row.severity !== "warning");
  const report = {
    verified_at: new Date().toISOString(),
    script: "scripts/verify-phase10-slice.js",
    phase: 10,
    lesson_id: LESSON_ID,
    status: failures.length === 0 ? "passed" : "failed",
    summary: {
      checks_total: checks.length,
      checks_passed: checks.filter((row) => row.pass).length,
      errors: failures.length,
      authored_question_rows: lessonQuestions.length,
      authored_vocab_items: lessonItems.length
    },
    checks
  };

  if (write) {
    fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  }

  console.log(JSON.stringify(report, null, 2));
  if (failures.length > 0) {
    process.exit(1);
  }
}

main();