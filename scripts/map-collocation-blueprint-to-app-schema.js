const fs = require("fs");
const path = require("path");
const {
  ensureDir,
  normalizeText,
  readJSON,
  unique,
  writeJSON
} = require("./collocation-rebuild-helpers");

const repoRoot = path.join(__dirname, "..");
const blueprintPath = path.join(repoRoot, "drafts", "collocation-rebuild", "wave1_lesson_blueprint.json");
const vocabItemsPath = path.join(repoRoot, "data", "vocab", "vocab_items.json");
const outDir = path.join(repoRoot, "drafts", "collocation-rebuild");

const STAGE = "V3";
const STAGE_NAME = "Collocation";
const LESSON_TYPE = "collocation";
const CORE_QUESTION_TARGET = 20;
const REVIEW_QUESTION_TARGET = 4;

function difficultyRank(code) {
  if (code === "A") return 1;
  if (code === "B") return 2;
  if (code === "C") return 3;
  return 9;
}

function reviewPriorityForDifficulty(code) {
  if (code === "A") return 2;
  if (code === "B") return 3;
  if (code === "C") return 4;
  return 3;
}

function lessonIdFor(sequence) {
  return `V3-W1-${String(sequence).padStart(2, "0")}`;
}

function estimateMinutes(itemCount) {
  return 30 + Math.max(0, itemCount - 6) * 5;
}

function buildItemIndexes(vocabItems) {
  const byId = new Map();
  const byPhrase = new Map();

  function addPhrase(text, item) {
    const key = normalizeText(text);
    if (!key) return;
    if (!byPhrase.has(key)) byPhrase.set(key, []);
    byPhrase.get(key).push(item);
  }

  vocabItems.forEach((item) => {
    byId.set(item.item_id, item);
    addPhrase(item.base_word, item);
    (item.variants || []).forEach((variant) => addPhrase(variant, item));
  });

  return { byId, byPhrase };
}

function resolveBlueprintItem(item, indexes) {
  if (indexes.byId.has(item.candidate_item_id)) {
    return {
      ...item,
      resolution_status: "matched_by_candidate_id",
      resolved_item_id: item.candidate_item_id,
      matched_by: "candidate_item_id",
      matched_item: indexes.byId.get(item.candidate_item_id),
      target_item_id: item.candidate_item_id
    };
  }

  const phraseMatches = indexes.byPhrase.get(normalizeText(item.phrase)) || [];
  if (phraseMatches.length === 1) {
    return {
      ...item,
      resolution_status: "matched_by_phrase",
      resolved_item_id: phraseMatches[0].item_id,
      matched_by: "phrase",
      matched_item: phraseMatches[0],
      target_item_id: phraseMatches[0].item_id
    };
  }

  if (phraseMatches.length > 1) {
    return {
      ...item,
      resolution_status: "ambiguous_phrase_match",
      resolved_item_id: null,
      matched_by: "phrase",
      matched_item_ids: phraseMatches.map((match) => match.item_id),
      target_item_id: item.candidate_item_id
    };
  }

  return {
    ...item,
    resolution_status: "missing",
    resolved_item_id: null,
    matched_by: null,
    target_item_id: item.candidate_item_id
  };
}

function sortForReinforcement(items) {
  return [...items].sort((left, right) => (
    difficultyRank(right.difficulty) - difficultyRank(left.difficulty)
      || left.formal_index - right.formal_index
  ));
}

function buildQuestionSlots(lessonId, lessonItems) {
  const coreSlots = [];
  const reviewSlots = [];
  const reinforcementItems = sortForReinforcement(lessonItems);

  lessonItems.forEach((item) => {
    coreSlots.push({
      planned_type: "collocation",
      target_item_id: item.target_item_id,
      source_phrase: item.phrase,
      gloss_zh: item.gloss_zh,
      difficulty: item.difficulty,
      resolution_status: item.resolution_status
    });
    coreSlots.push({
      planned_type: "part5_sentence_completion",
      target_item_id: item.target_item_id,
      source_phrase: item.phrase,
      gloss_zh: item.gloss_zh,
      difficulty: item.difficulty,
      resolution_status: item.resolution_status
    });
  });

  const reinforcementCycle = ["part6_context_choice", "collocation"];
  let round = 0;
  while (coreSlots.length < CORE_QUESTION_TARGET) {
    const plannedType = reinforcementCycle[round % reinforcementCycle.length];
    for (const item of reinforcementItems) {
      if (coreSlots.length >= CORE_QUESTION_TARGET) break;
      coreSlots.push({
        planned_type: plannedType,
        target_item_id: item.target_item_id,
        source_phrase: item.phrase,
        gloss_zh: item.gloss_zh,
        difficulty: item.difficulty,
        resolution_status: item.resolution_status
      });
    }
    round += 1;
  }

  reinforcementItems
    .slice(0, Math.min(REVIEW_QUESTION_TARGET, reinforcementItems.length))
    .forEach((item) => {
      reviewSlots.push({
        planned_type: "review_question",
        target_item_id: item.target_item_id,
        source_phrase: item.phrase,
        gloss_zh: item.gloss_zh,
        difficulty: item.difficulty,
        resolution_status: item.resolution_status
      });
    });

  return {
    core: coreSlots.map((slot, index) => ({
      question_id: `${lessonId}_Q${String(index + 1).padStart(2, "0")}`,
      lesson_id: lessonId,
      stage: STAGE,
      slot_role: "core",
      sequence: index + 1,
      ...slot
    })),
    review: reviewSlots.map((slot, index) => ({
      question_id: `${lessonId}_R${String(index + 1).padStart(2, "0")}`,
      lesson_id: lessonId,
      stage: STAGE,
      slot_role: "review",
      sequence: index + 1,
      ...slot
    }))
  };
}

function buildLessonDraft(blueprintLesson, indexes) {
  const lessonId = lessonIdFor(blueprintLesson.sequence);
  const resolvedItems = blueprintLesson.items.map((item) => resolveBlueprintItem(item, indexes));
  const questionSlots = buildQuestionSlots(lessonId, resolvedItems);

  return {
    lesson: {
      lesson_id: lessonId,
      stage: STAGE,
      stage_name: STAGE_NAME,
      lesson_number: blueprintLesson.sequence,
      title: `${blueprintLesson.topic} 搭配詞 ${blueprintLesson.topic_lesson_index}`,
      estimated_minutes: estimateMinutes(blueprintLesson.item_count),
      lesson_type: LESSON_TYPE,
      topic: blueprintLesson.topic,
      target_items: unique(resolvedItems.map((item) => item.target_item_id)),
      question_ids: questionSlots.core.map((slot) => slot.question_id),
      review_question_ids: questionSlots.review.map((slot) => slot.question_id),
      mastery_threshold: 0.8,
      seal_threshold: 0.85,
      status: "not_started",
      draft_metadata: {
        wave: blueprintLesson.wave,
        source_blueprint_lesson_id: blueprintLesson.lesson_id,
        topic_lesson_index: blueprintLesson.topic_lesson_index,
        item_count: blueprintLesson.item_count,
        difficulty_breakdown: blueprintLesson.difficulty_breakdown,
        unresolved_target_count: resolvedItems.filter((item) => item.resolution_status !== "matched_by_candidate_id" && item.resolution_status !== "matched_by_phrase").length
      }
    },
    itemMappings: resolvedItems.map((item) => ({
      formal_index: item.formal_index,
      original_index: item.original_index,
      phrase: item.phrase,
      phrase_slug: item.phrase_slug,
      gloss_zh: item.gloss_zh,
      difficulty: item.difficulty,
      candidate_item_id: item.candidate_item_id,
      target_item_id: item.target_item_id,
      resolved_item_id: item.resolved_item_id,
      resolution_status: item.resolution_status,
      matched_by: item.matched_by || null,
      matched_item_ids: item.matched_item_ids || null
    })),
    questionSlots
  };
}

function buildMissingItemBacklog(lessonDrafts) {
  const backlog = new Map();

  lessonDrafts.forEach(({ lesson, itemMappings }) => {
    itemMappings.forEach((item) => {
      if (item.resolution_status === "matched_by_candidate_id" || item.resolution_status === "matched_by_phrase") return;

      const existing = backlog.get(item.candidate_item_id);
      if (existing) {
        existing.lesson_ids = unique([...existing.lesson_ids, lesson.lesson_id]);
        existing.source_blueprint_lessons = unique([...existing.source_blueprint_lessons, lesson.draft_metadata.source_blueprint_lesson_id]);
        return;
      }

      backlog.set(item.candidate_item_id, {
        candidate_item_id: item.candidate_item_id,
        target_item_id: item.target_item_id,
        phrase: item.phrase,
        gloss_zh: item.gloss_zh,
        difficulty: item.difficulty,
        resolution_status: item.resolution_status,
        matched_item_ids: item.matched_item_ids || [],
        lesson_ids: [lesson.lesson_id],
        source_blueprint_lessons: [lesson.draft_metadata.source_blueprint_lesson_id],
        suggested_seed_row: {
          item_id: item.candidate_item_id,
          item_type: LESSON_TYPE,
          stage: STAGE,
          lesson_id: lesson.lesson_id,
          lesson_ids: [lesson.lesson_id],
          base_word: item.phrase,
          variants: [item.phrase],
          chinese: item.gloss_zh,
          example: "",
          common_wrong_forms: [],
          toeic_contexts: [lesson.topic, "toeic_collocation_rebuild", "wave1"],
          review_priority: reviewPriorityForDifficulty(item.difficulty)
        }
      });
    });
  });

  return [...backlog.values()].sort((left, right) => (
    difficultyRank(left.difficulty) - difficultyRank(right.difficulty)
      || left.phrase.localeCompare(right.phrase)
  ));
}

function main() {
  const blueprint = readJSON(blueprintPath);
  const vocabItems = readJSON(vocabItemsPath);
  const indexes = buildItemIndexes(vocabItems);
  const lessonDrafts = blueprint.lessons.map((lesson) => buildLessonDraft(lesson, indexes));
  const missingItems = buildMissingItemBacklog(lessonDrafts);

  const lessonDraftOutput = {
    generated_at: new Date().toISOString(),
    source_blueprint: path.relative(repoRoot, blueprintPath).replace(/\\/g, "/"),
    reference_role: "ability_signal_only",
    content_generation_note: "These lesson rows are draft app-schema mappings derived from the Wave 1 blueprint. They reserve lesson/question structure, but do not represent final authored question content.",
    curriculum_stage_patch: {
      stage: STAGE,
      stage_name: STAGE_NAME,
      lesson_type: LESSON_TYPE,
      proposed_total_lessons: lessonDrafts.length,
      proposed_stage_status: "draft_ready"
    },
    lessons: lessonDrafts.map((entry) => entry.lesson)
  };

  const questionPlanOutput = {
    generated_at: new Date().toISOString(),
    source_blueprint: path.relative(repoRoot, blueprintPath).replace(/\\/g, "/"),
    reference_role: "ability_signal_only",
    planning_policy: {
      core_question_target: CORE_QUESTION_TARGET,
      review_question_target: REVIEW_QUESTION_TARGET,
      base_core_types: ["collocation", "part5_sentence_completion"],
      reinforcement_cycle: ["part6_context_choice", "collocation"],
      review_type: "review_question"
    },
    totals: {
      lesson_count: lessonDrafts.length,
      core_question_slots: lessonDrafts.reduce((sum, entry) => sum + entry.questionSlots.core.length, 0),
      review_question_slots: lessonDrafts.reduce((sum, entry) => sum + entry.questionSlots.review.length, 0),
      unresolved_target_items: lessonDrafts.reduce((sum, entry) => (
        sum + entry.itemMappings.filter((item) => item.resolution_status !== "matched_by_candidate_id" && item.resolution_status !== "matched_by_phrase").length
      ), 0)
    },
    lessons: lessonDrafts.map((entry) => ({
      lesson_id: entry.lesson.lesson_id,
      title: entry.lesson.title,
      topic: entry.lesson.topic,
      core_question_ids: entry.lesson.question_ids,
      review_question_ids: entry.lesson.review_question_ids,
      question_slots: [...entry.questionSlots.core, ...entry.questionSlots.review]
    }))
  };

  const missingItemOutput = {
    generated_at: new Date().toISOString(),
    source_blueprint: path.relative(repoRoot, blueprintPath).replace(/\\/g, "/"),
    reference_role: "ability_signal_only",
    totals: {
      missing_or_ambiguous_items: missingItems.length,
      missing_items: missingItems.filter((item) => item.resolution_status === "missing").length,
      ambiguous_phrase_matches: missingItems.filter((item) => item.resolution_status === "ambiguous_phrase_match").length
    },
    items: missingItems
  };

  ensureDir(outDir);
  writeJSON(path.join(outDir, "wave1_app_lesson_draft.json"), lessonDraftOutput);
  writeJSON(path.join(outDir, "wave1_question_plan.json"), questionPlanOutput);
  writeJSON(path.join(outDir, "wave1_missing_item_backlog.json"), missingItemOutput);

  console.log(JSON.stringify({
    lesson_draft_file: path.relative(repoRoot, path.join(outDir, "wave1_app_lesson_draft.json")).replace(/\\/g, "/"),
    question_plan_file: path.relative(repoRoot, path.join(outDir, "wave1_question_plan.json")).replace(/\\/g, "/"),
    missing_item_file: path.relative(repoRoot, path.join(outDir, "wave1_missing_item_backlog.json")).replace(/\\/g, "/"),
    lesson_count: lessonDrafts.length,
    core_question_slots: questionPlanOutput.totals.core_question_slots,
    review_question_slots: questionPlanOutput.totals.review_question_slots,
    missing_or_ambiguous_items: missingItemOutput.totals.missing_or_ambiguous_items
  }, null, 2));
}

main();