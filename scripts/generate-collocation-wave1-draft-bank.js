const fs = require("fs");
const path = require("path");
const {
  ensureDir,
  readJSON,
  writeJSON
} = require("./collocation-rebuild-helpers");

const repoRoot = path.join(__dirname, "..");
const outDir = path.join(repoRoot, "drafts", "collocation-rebuild");
const lessonDraftPath = path.join(outDir, "wave1_app_lesson_draft.json");
const questionPlanPath = path.join(outDir, "wave1_question_plan.json");
const missingItemPath = path.join(outDir, "wave1_missing_item_backlog.json");
const vocabItemsPath = path.join(repoRoot, "data", "vocab", "vocab_items.json");

function difficultyLevel(code) {
  if (code === "A") return 1;
  if (code === "B") return 2;
  if (code === "C") return 3;
  return 2;
}

function estimatedTimeSeconds(type) {
  if (type === "part6_context_choice") return 45;
  if (type === "part5_sentence_completion") return 20;
  if (type === "review_question") return 15;
  return 15;
}

function defaultErrorCode(type) {
  if (type === "collocation") return "COLLOCATION_GAP";
  if (type === "part5_sentence_completion") return "VOCAB_WEAK_RECALL";
  if (type === "part6_context_choice") return "SCENE_VOCAB_GAP";
  if (type === "review_question") return "VOCAB_WEAK_RECALL";
  return "VOCAB_WEAK_RECALL";
}

function distractorType(type) {
  if (type === "review_question") return "mixed_review_collocation";
  return "wrong_verb_collocation";
}

function subskill(type) {
  if (type === "collocation") return "target_collocation";
  if (type === "part5_sentence_completion") return "sentence_completion";
  if (type === "part6_context_choice") return "context_choice";
  if (type === "review_question") return "spaced_review";
  return "draft_shell";
}

function draftQuestionText(slot) {
  if (slot.planned_type === "collocation") {
    return `TODO: Write a TOEIC collocation sentence for "${slot.source_phrase}" (${slot.gloss_zh}) with one blank: ______.`;
  }
  if (slot.planned_type === "part5_sentence_completion") {
    return `TODO: Write a Part 5 style sentence for "${slot.source_phrase}" (${slot.gloss_zh}) with four business-English options.`;
  }
  if (slot.planned_type === "part6_context_choice") {
    return `TODO: Write a broader context sentence for "${slot.source_phrase}" (${slot.gloss_zh}) that tests usage in context.`;
  }
  return `TODO: Write a review question in a fresh context for "${slot.source_phrase}" (${slot.gloss_zh}).`;
}

function draftExplanation(slot) {
  return `TODO: Explain why \"${slot.source_phrase}\" is correct in this context, and why the distractors are wrong.`;
}

function draftOptions(slot) {
  return {
    A: `TODO correct option for ${slot.source_phrase}`,
    B: `TODO distractor 1 for ${slot.source_phrase}`,
    C: `TODO distractor 2 for ${slot.source_phrase}`,
    D: `TODO distractor 3 for ${slot.source_phrase}`
  };
}

function buildItemSeedRows(missingItems) {
  return missingItems.items.map((entry) => ({
    ...entry.suggested_seed_row,
    mastery_score: 0,
    mastery_level: "blind",
    draft_metadata: {
      authoring_status: "seed_shell",
      source_phrase: entry.phrase,
      gloss_zh: entry.gloss_zh,
      source_lessons: entry.lesson_ids,
      source_blueprint_lessons: entry.source_blueprint_lessons,
      resolution_status: entry.resolution_status,
      matched_item_ids: entry.matched_item_ids
    }
  }));
}

function buildQuestionShells(questionPlan, lessonDraftById, vocabItemsById) {
  const questions = [];

  questionPlan.lessons.forEach((lessonPlan) => {
    const lesson = lessonDraftById.get(lessonPlan.lesson_id);
    lessonPlan.question_slots.forEach((slot) => {
      const item = vocabItemsById.get(slot.target_item_id);
      questions.push({
        question_id: slot.question_id,
        lesson_id: slot.lesson_id,
        stage: slot.stage,
        type: slot.planned_type,
        skill: "collocation",
        subskill: subskill(slot.planned_type),
        grammar_link_id: null,
        question_text: draftQuestionText(slot),
        options: draftOptions(slot),
        correct_answer: "A",
        explanation_zh: draftExplanation(slot),
        target_item_id: slot.target_item_id,
        distractor_type: distractorType(slot.planned_type),
        difficulty: difficultyLevel(slot.difficulty),
        estimated_time_seconds: estimatedTimeSeconds(slot.planned_type),
        default_error_code: defaultErrorCode(slot.planned_type),
        tags: [
          "draft_shell",
          "wave1",
          `lesson:${slot.lesson_id}`,
          `topic:${lesson?.topic || "unknown"}`,
          `slot_role:${slot.slot_role}`,
          `resolution:${slot.resolution_status}`
        ],
        draft_metadata: {
          authoring_status: "shell_only",
          lesson_title: lesson?.title || null,
          source_phrase: slot.source_phrase,
          gloss_zh: slot.gloss_zh,
          source_topic: lesson?.topic || null,
          source_item_found_in_vocab_items: Boolean(item),
          source_item_base_word: item?.base_word || null,
          authoring_requirements: [
            "must_be_context_first",
            "no_direct_definition_repeat",
            "must_fill_real_distractors",
            "must_write_real_explanation_zh"
          ]
        }
      });
    });
  });

  return questions;
}

function main() {
  const lessonDraft = readJSON(lessonDraftPath);
  const questionPlan = readJSON(questionPlanPath);
  const missingItems = readJSON(missingItemPath);
  const existingVocabItems = readJSON(vocabItemsPath);

  const lessonDraftById = new Map(lessonDraft.lessons.map((lesson) => [lesson.lesson_id, lesson]));
  const existingVocabItemsById = new Map(existingVocabItems.map((item) => [item.item_id, item]));
  const itemSeedRows = buildItemSeedRows(missingItems);
  itemSeedRows.forEach((item) => existingVocabItemsById.set(item.item_id, item));

  const questionShells = buildQuestionShells(questionPlan, lessonDraftById, existingVocabItemsById);

  const itemSeedOutput = {
    generated_at: new Date().toISOString(),
    source_files: [
      path.relative(repoRoot, lessonDraftPath).replace(/\\/g, "/"),
      path.relative(repoRoot, missingItemPath).replace(/\\/g, "/")
    ],
    reference_role: "ability_signal_only",
    content_generation_note: "These vocab item rows are draft seed shells for Wave 1 only. They are not merged into production vocab_items.json yet.",
    totals: {
      item_count: itemSeedRows.length
    },
    items: itemSeedRows
  };

  const questionShellOutput = {
    generated_at: new Date().toISOString(),
    source_files: [
      path.relative(repoRoot, lessonDraftPath).replace(/\\/g, "/"),
      path.relative(repoRoot, questionPlanPath).replace(/\\/g, "/"),
      path.relative(repoRoot, missingItemPath).replace(/\\/g, "/")
    ],
    reference_role: "ability_signal_only",
    content_generation_note: "These question rows are authoring shells only. They satisfy draft schema needs, but the wording, options, and explanations must be fully authored before any production use.",
    totals: {
      lesson_count: lessonDraft.lessons.length,
      question_count: questionShells.length,
      collocation_shells: questionShells.filter((question) => question.type === "collocation").length,
      part5_shells: questionShells.filter((question) => question.type === "part5_sentence_completion").length,
      part6_shells: questionShells.filter((question) => question.type === "part6_context_choice").length,
      review_shells: questionShells.filter((question) => question.type === "review_question").length
    },
    questions: questionShells
  };

  ensureDir(outDir);
  writeJSON(path.join(outDir, "wave1_vocab_items_seed_draft.json"), itemSeedOutput);
  writeJSON(path.join(outDir, "wave1_question_shells.json"), questionShellOutput);

  console.log(JSON.stringify({
    item_seed_file: path.relative(repoRoot, path.join(outDir, "wave1_vocab_items_seed_draft.json")).replace(/\\/g, "/"),
    question_shell_file: path.relative(repoRoot, path.join(outDir, "wave1_question_shells.json")).replace(/\\/g, "/"),
    item_count: itemSeedOutput.totals.item_count,
    question_count: questionShellOutput.totals.question_count,
    collocation_shells: questionShellOutput.totals.collocation_shells,
    part5_shells: questionShellOutput.totals.part5_shells,
    part6_shells: questionShellOutput.totals.part6_shells,
    review_shells: questionShellOutput.totals.review_shells
  }, null, 2));
}

main();