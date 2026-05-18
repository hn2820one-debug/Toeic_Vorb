const fs = require("fs");
const path = require("path");
const {
  countBy,
  readJSON,
  relativePath,
  slug,
  writeJSON
} = require("./collocation-rebuild-helpers");

const repoRoot = path.join(__dirname, "..");
const outDir = path.join(repoRoot, "drafts", "collocation-rebuild");

const inputs = {
  schemaContracts: "wave1_schema_contracts.json",
  referenceBundle: "wave1_reference_bundle_v1.json",
  difficultyPolicy: "wave1_difficulty_mixing_policy.json",
  phraseFamilies: "phrase_family_table.json",
  duplicateReference: "phrase_duplicate_reference.json",
  questionShells: "wave1_question_shells.json",
  vocabSeedDraft: "wave1_vocab_items_seed_draft.json"
};

const stageMapPath = path.join(repoRoot, "drafts", "v0-v3-rebuild", "stage_map_v0_v3.json");

function readStageMapIfPresent() {
  if (!fs.existsSync(stageMapPath)) return null;
  return JSON.parse(fs.readFileSync(stageMapPath, "utf8"));
}

function isPhase7BlueprintFrozen(stageMap) {
  return stageMap
    && (stageMap.status === "planning_frozen" || stageMap.verification?.status === "passed");
}

function relativeOut(fileName) {
  return relativePath(repoRoot, path.join(outDir, fileName));
}

function countTodoQuestionShells(questionShells) {
  return questionShells.questions.filter((question) => {
    const optionValues = Object.values(question.options || {});
    return question.draft_metadata?.authoring_status === "shell_only"
      || String(question.question_text || "").includes("TODO")
      || String(question.explanation_zh || "").includes("TODO")
      || optionValues.some((option) => String(option || "").includes("TODO"));
  }).length;
}

function countBlankDraftItemExamples(vocabSeedDraft) {
  return vocabSeedDraft.items.filter((item) => !String(item.example || "").trim()).length;
}

function readDraftJSON(fileName) {
  return readJSON(path.join(outDir, fileName));
}

function writeDraftJSON(fileName, value) {
  writeJSON(path.join(outDir, fileName), value);
}

function buildTargetPolicy(questionShells, vocabSeedDraft) {
  return {
    status: "defined",
    applies_to: "Wave 1 V3 collocation rebuild",
    target_item_id_rule: "Use one stable target_item_id per collocation phrase. For Wave 1 drafts this is item_coll_{english_slug}.",
    production_merge_rule: "Before production merge, every target_item_id in questions must exist in production vocab_items.json, not only in a draft seed artifact.",
    direct_definition_policy: {
      default_for_wave1: "Do not author direct-definition questions for Wave 1 V3 collocation unless a future prompt explicitly scopes one.",
      semantic_sense_required_when: [
        "A direct-definition row is authored for the same surface phrase or item more than once.",
        "The same surface phrase is intentionally split into genuinely different meanings.",
        "A reviewer cannot determine the intended meaning from target_item_id alone."
      ],
      semantic_sense_tag_format: "semantic_sense:{short_snake_case_sense}",
      domain_sense_tag_format: "domain_sense:{short_snake_case_domain}",
      domain_sense_limit: "domain_sense may clarify context, but it never justifies duplicate direct-definition rows by itself."
    },
    contextual_practice_rule: "For collocations, later practice should test use in sentence, Part 5, Part 6, or review context rather than repeating definitions.",
    current_counts: {
      draft_target_items: vocabSeedDraft.items.length,
      question_target_items: new Set(questionShells.questions.map((q) => q.target_item_id)).size,
      direct_definition_shells: questionShells.questions.filter((q) => ["meaning_choice", "false_friend"].includes(q.type)).length
    }
  };
}

function buildDistractorSchema(phraseFamilies, duplicateReference) {
  return {
    status: "defined",
    schema_version: "wave1_distractor_bank_schema_v1",
    purpose: "Define a reviewable distractor candidate format before real authoring begins.",
    row_schema: {
      distractor_id: "string, unique; suggested dstr_{target_item_id}_{nn}",
      target_item_id: "string, target item being tested",
      target_phrase: "string, correct phrase",
      option_text: "string, proposed distractor option",
      source_type: "same_head_family | surface_close | topic_peer | teacher_written",
      source_reference_id: "string|null, reference row/pair/family identifier when available",
      distractor_role: "wrong_particle | wrong_verb | wrong_object | near_surface | semantic_neighbor | register_mismatch",
      grammar_fit: "true when the option can grammatically fit the blank",
      collocation_fit: "false for a valid distractor; true means reject as ambiguous",
      ambiguity_risk: "low | medium | high",
      review_status: "candidate | approved | rejected",
      rejection_reason: "string|null"
    },
    approval_rules: [
      "The distractor must be grammatically possible in the sentence.",
      "The distractor must be collocationally wrong in the authored context.",
      "The correct answer must remain the only natural TOEIC answer.",
      "Same-head and surface-close references require manual ambiguity review.",
      "Do not use a future-stage item or V4 draft item as a distractor source for Wave 1 production authoring.",
      "Do not leak the Chinese or English definition in option text."
    ],
    reference_sources: {
      phrase_families: {
        file: relativeOut(inputs.phraseFamilies),
        family_count: phraseFamilies.totals.family_count,
        usage: "Candidate source for same-head contrasts only, not automatic options."
      },
      near_confusable_pairs: {
        file: relativeOut(inputs.duplicateReference),
        exact_duplicate_groups: duplicateReference.totals.exact_duplicate_groups,
        near_confusable_pairs: duplicateReference.totals.near_duplicate_pairs,
        usage: "Manual review list for possible contrast, not a blocker by itself."
      }
    }
  };
}

function buildExplanationRubric() {
  return {
    status: "defined",
    schema_version: "wave1_explanation_rubric_v1",
    language: "Traditional Chinese",
    length_target: "20-80 Chinese characters; shorter is acceptable only if the rule and trap are clear.",
    required_parts: [
      "Name the correct collocation or phrase pattern.",
      "State why it fits the business context.",
      "Contrast at least one likely wrong option or trap.",
      "Avoid merely translating the question."
    ],
    templates: {
      collocation: "固定搭配為「{correct_phrase}」，表示{meaning}；{wrong_option}語法可通但搭配不自然。",
      part5_sentence_completion: "此處需要「{correct_phrase}」完成{business_action}；{wrong_option}常見但不符合句意。",
      part6_context_choice: "前文提到{context_clue}，所以用「{correct_phrase}」；{wrong_option}與語境不合。",
      review_question: "複習重點是「{correct_phrase}」的{usage}；{wrong_option}容易混淆但不是此情境用法。"
    },
    fail_conditions: [
      "Only translates the English sentence.",
      "Says only that the answer is correct without explaining why.",
      "Uses simplified Chinese.",
      "Mentions the correct answer in a way that leaks a later question.",
      "Does not identify any trap or contrast."
    ]
  };
}

function buildSourceWorkflow() {
  return {
    status: "defined",
    workflow_version: "wave1_source_of_truth_v1",
    source_of_truth: {
      handoff: "TO_AI.md",
      authoring_spec: "docs/question-creation-spec.md",
      production_seed: "data/vocab/*.json files listed by data/vocab/curriculum.json -> question_files",
      draft_workspace: "drafts/collocation-rebuild/",
      browser_editor: "IndexedDB review surface only; not production source"
    },
    draft_to_production_flow: [
      "Author draft rows under drafts/collocation-rebuild/.",
      "Review target item rows and examples.",
      "Replace TODO question shells with real TOEIC questions.",
      "Run draft/schema checks.",
      "Complete Phase 7/8 manifest and mixed-review policy decisions.",
      "Only then merge approved rows into data/vocab/ with a production task.",
      "Bump seed version in exactly three files.",
      "Run full validation and update TO_AI.md."
    ],
    forbidden_paths: [
      "C:\\Users\\Keith\\toeic-app",
      "data/vocab/questions_v4*.json unless V4 activation is explicitly approved",
      "drafts/v4/ promotion during V0-V3 rebuild"
    ]
  };
}

function buildDocSyncPolicy() {
  return {
    status: "defined",
    active_docs: [
      "TO_AI.md",
      "README.md",
      "AGENTS.md",
      "CLAUDE.md",
      "docs/question-creation-spec.md",
      "docs/question-bank-source-of-truth-workflow.md",
      "docs/plans/questions plan.md"
    ],
    sync_rules: [
      "TO_AI.md remains the current handoff source of truth.",
      "README.md, AGENTS.md, and CLAUDE.md must not claim 193 lessons or 4,399 active question rows while production is cleared.",
      "docs/question-creation-spec.md may describe historical/target structures, but must label them as target/rebuild structures, not current production counts.",
      "Question Bank workflow docs must state that browser edits are IndexedDB-local until patch-applied.",
      "Archived docs under docs/backups/ remain historical and are not current facts."
    ]
  };
}

function buildValidationGate() {
  return {
    status: "defined",
    applies_before: "Any production seed merge or release claim",
    commands: [
      "node scripts/validate-vocab-data.js",
      "node scripts/audit-quality-full.js",
      "node scripts/audit-duplicates.js",
      "npm run test:scoring",
      "npx playwright test",
      "npm run test:all"
    ],
    phase6_verification_commands: [
      "node scripts/build-collocation-phase6-authoring-policy.js",
      "node scripts/validate-vocab-data.js",
      "node scripts/audit-quality-full.js",
      "node scripts/audit-duplicates.js"
    ],
    seed_sync_rule: [
      "data/vocab/curriculum.json -> seed_version",
      "js/vocab-db.js -> SEED_VERSION",
      "tests/helpers/seed-idb.ts -> APP_SEED_VERSION"
    ]
  };
}

function buildNextPhaseGuardrails(stageMap) {
  const phase7Frozen = isPhase7BlueprintFrozen(stageMap);
  if (phase7Frozen) {
    return {
      status: "defined",
      next_required_phase: "Phase 8 - Future Reference Packs",
      do_next: [
        "Complete Steps 36-39 reference packs and mixed-review architecture reconciliation.",
        "Freeze Step 40 master lesson manifest, file split, and V3-W1 production ID table.",
        "Keep Wave 1 content under drafts/collocation-rebuild/ until Step 40 is complete."
      ],
      do_not_do_yet: [
        "Do not merge Wave 1 shells into data/vocab/.",
        "Do not author production rows from TODO shells until Step 40 manifest/file split is frozen.",
        "Do not bump the production seed version for draft-only policy work.",
        "Do not use V4 draft data as a source for production distractors or lesson rows."
      ],
      phase7_reference: path.relative(repoRoot, stageMapPath).replace(/\\/g, "/")
    };
  }

  return {
    status: "defined",
    next_required_phase: "Phase 7 - Stage Blueprints",
    do_next: [
      "Freeze the full V0-V3 stage blueprint from the empty production baseline.",
      "Define the complete V3 map beyond Wave 1 before treating Wave 1 as production-shaped.",
      "Keep Wave 1 content under drafts/collocation-rebuild/ until production IDs and file split are frozen."
    ],
    do_not_do_yet: [
      "Do not merge Wave 1 shells into data/vocab/.",
      "Do not author production rows from TODO shells until stage blueprints and Step 40 manifest/file split are settled.",
      "Do not bump the production seed version for Phase 6.",
      "Do not use V4 draft data as a source for production distractors or lesson rows."
    ]
  };
}

function buildChecks(pack, phase7Frozen) {
  const expectedNextPhase = phase7Frozen
    ? "Phase 8 - Future Reference Packs"
    : "Phase 7 - Stage Blueprints";
  const checks = [
    {
      id: "reference_role",
      pass: pack.reference_role === "ability_signal_only",
      detail: "Phase 6 policy pack is reference-only."
    },
    {
      id: "all_policy_sections_defined",
      pass: Object.values(pack.policies).every((policy) => policy.status === "defined"),
      detail: "Semantic/target, distractor, explanation, workflow, and doc sync policies are all defined."
    },
    {
      id: "readiness_flags",
      pass: pack.readiness.phase6_policy_ready === true
        && pack.readiness.authoring_ready === true
        && pack.readiness.content_ready === false
        && pack.readiness.production_ready === false
        && pack.readiness.production_merge_allowed === false,
      detail: "Phase 6 policies are ready for draft authoring, but production merge is still disabled."
    },
    {
      id: "content_blockers_preserved",
      pass: pack.remaining_blockers.todo_question_shells === pack.scope.question_shell_count
        && pack.remaining_blockers.blank_draft_item_examples === pack.scope.draft_vocab_item_count,
      detail: "Authoring blockers remain explicit after policy completion."
    },
    {
      id: "phase6_guardrails_defined",
      pass: pack.validation_gate.status === "defined"
        && pack.next_phase_guardrails.status === "defined"
        && pack.next_phase_guardrails.next_required_phase === expectedNextPhase,
      detail: "Validation commands and next-phase sequencing are explicit."
    }
  ];

  return {
    status: checks.every((check) => check.pass) ? "passed" : "failed",
    checked_at: new Date().toISOString(),
    checks
  };
}

function main() {
  const stageMap = readStageMapIfPresent();
  const phase7Frozen = isPhase7BlueprintFrozen(stageMap);
  const schemaContracts = readDraftJSON(inputs.schemaContracts);
  const referenceBundle = readDraftJSON(inputs.referenceBundle);
  const difficultyPolicy = readDraftJSON(inputs.difficultyPolicy);
  const phraseFamilies = readDraftJSON(inputs.phraseFamilies);
  const duplicateReference = readDraftJSON(inputs.duplicateReference);
  const questionShells = readDraftJSON(inputs.questionShells);
  const vocabSeedDraft = readDraftJSON(inputs.vocabSeedDraft);
  const todoQuestionShells = countTodoQuestionShells(questionShells);
  const blankDraftItemExamples = countBlankDraftItemExamples(vocabSeedDraft);

  const pack = {
    generated_at: new Date().toISOString(),
    policy_pack_version: "wave1_phase6_authoring_policy_pack_v1",
    reference_role: "ability_signal_only",
    status: "draft_only",
    production_impact: "none",
    production_merge_allowed: false,
    source_files: Object.values(inputs).map(relativeOut),
    scope: {
      program: "Program B - TOEIC Vocabulary Tracker",
      stage: "V3",
      lesson_type: "collocation",
      wave: 1,
      lesson_count: schemaContracts.scope.lesson_count,
      question_shell_count: schemaContracts.scope.question_shell_count,
      draft_vocab_item_count: schemaContracts.scope.draft_vocab_item_count
    },
    policies: {
      semantic_sense_and_target_item: buildTargetPolicy(questionShells, vocabSeedDraft),
      distractor_bank_schema: buildDistractorSchema(phraseFamilies, duplicateReference),
      explanation_rubric: buildExplanationRubric(),
      source_of_truth_workflow: buildSourceWorkflow(),
      documentation_sync: buildDocSyncPolicy()
    },
    validation_gate: buildValidationGate(),
    next_phase_guardrails: buildNextPhaseGuardrails(stageMap),
    readiness: {
      schema_ready: schemaContracts.schema_ready,
      phase6_policy_ready: true,
      authoring_ready: true,
      content_ready: false,
      production_ready: false,
      production_merge_allowed: false,
      interpretation: "Phase 6 defines authoring rules. It permits controlled draft authoring, not production merge."
    },
    remaining_blockers: {
      todo_question_shells: todoQuestionShells,
      blank_draft_item_examples: blankDraftItemExamples,
      production_lesson_ids_not_frozen_until_step40: true,
      full_v0_v3_stage_blueprint_incomplete_until_phase7: !phase7Frozen,
      mixed_review_architecture_incomplete_until_step39: true
    },
    current_counts: {
      todo_question_shells: todoQuestionShells,
      blank_draft_item_examples: blankDraftItemExamples,
      question_type_counts: schemaContracts.current_counts.question_type_counts,
      slot_role_counts: schemaContracts.current_counts.slot_role_counts,
      target_difficulty_counts: difficultyPolicy.totals.target_difficulty_counts,
      planned_type_counts: referenceBundle.phase4_summary.question_slots.planned_type_counts
    }
  };

  pack.consistency_checks = buildChecks(pack, phase7Frozen);
  if (pack.consistency_checks.status !== "passed") {
    console.error(JSON.stringify(pack.consistency_checks, null, 2));
    process.exit(1);
  }

  writeDraftJSON("wave1_authoring_policy_pack.json", pack);
  console.log(JSON.stringify({
    policy_pack: relativeOut("wave1_authoring_policy_pack.json"),
    phase6_policy_ready: pack.readiness.phase6_policy_ready,
    authoring_ready: pack.readiness.authoring_ready,
    content_ready: pack.readiness.content_ready,
    production_ready: pack.readiness.production_ready,
    policies: Object.keys(pack.policies).length,
    checks: pack.consistency_checks.checks.length
  }, null, 2));
}

main();
