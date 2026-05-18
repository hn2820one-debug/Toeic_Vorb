const path = require("path");
const {
  countBy,
  readJSON,
  relativePath,
  slug,
  unique,
  writeJSON
} = require("./collocation-rebuild-helpers");

const repoRoot = path.join(__dirname, "..");
const outDir = path.join(repoRoot, "drafts", "collocation-rebuild");

const paths = {
  lessonDraft: path.join(outDir, "wave1_app_lesson_draft.json"),
  questionPlan: path.join(outDir, "wave1_question_plan.json"),
  questionShells: path.join(outDir, "wave1_question_shells.json"),
  vocabSeedDraft: path.join(outDir, "wave1_vocab_items_seed_draft.json"),
  referenceBundle: path.join(outDir, "wave1_reference_bundle_v1.json"),
  authoringPolicy: path.join(outDir, "wave1_authoring_policy_pack.json"),
  phraseFamilies: path.join(outDir, "phrase_family_table.json"),
  duplicateReference: path.join(outDir, "phrase_duplicate_reference.json")
};

const TOPIC_CONTEXTS = {
  "辦公室": {
    settings: ["辦公用品補貨", "訪客接待安排", "內部待辦追蹤"],
    actors: ["行政助理", "辦公室經理", "部門主管"],
    tasks: ["確認庫存", "安排臨時拜訪", "整理主管交辦事項"],
    documents: ["補給申請單", "訪客行程表", "內部備忘錄"],
    clues: ["資源快用完", "主管臨時要求", "跨部門協調延誤"]
  },
  "文書作業": {
    settings: ["合約校對", "表單填寫", "文件提交流程"],
    actors: ["文件專員", "法務助理", "專案協調員"],
    tasks: ["核對欄位", "整理附件", "提交修正版本"],
    documents: ["申請表", "合約草稿", "修訂紀錄"],
    clues: ["欄位缺漏", "簽核截止日", "附件版本不一致"]
  },
  "商務會議": {
    settings: ["部門週會", "客戶簡報前準備", "決策會議討論"],
    actors: ["會議主持人", "專案經理", "部門代表"],
    tasks: ["整理議程", "追蹤未決事項", "確認與會者意見"],
    documents: ["會議議程", "簡報大綱", "決議摘要"],
    clues: ["議程變更", "與會者追問", "需先確認前提資訊"]
  },
  "業務協調": {
    settings: ["跨部門專案協調", "交期追蹤", "客戶需求對接"],
    actors: ["業務代表", "供應鏈協調員", "專案聯絡人"],
    tasks: ["協調時程", "確認交付範圍", "回覆客戶進度"],
    documents: ["交期更新表", "需求摘要", "進度回報信"],
    clues: ["交期壓力", "需求異動", "供應商回覆延遲"]
  },
  "人事與組織": {
    settings: ["新人到職", "部門重組", "培訓安排"],
    actors: ["人資專員", "部門主管", "培訓協調員"],
    tasks: ["分派職責", "安排培訓", "通知組織調整"],
    documents: ["職務說明", "培訓通知", "組織公告"],
    clues: ["角色變動", "培訓時程", "交接需求"]
  },
  default: {
    settings: ["一般商務情境"],
    actors: ["員工"],
    tasks: ["完成工作事項"],
    documents: ["工作文件"],
    clues: ["語境需支持唯一搭配"]
  }
};

const TYPE_PROFILES = {
  collocation: {
    authoring_focus: "single_blank_collocation_sentence",
    prompt: "寫一個單句商務情境，讓目標搭配在空格前後成為唯一自然答案。",
    required_context_clue: "至少放一個明確的商務動作或結果線索，不能只靠中文翻譯提示。"
  },
  part5_sentence_completion: {
    authoring_focus: "part5_business_sentence",
    prompt: "寫一個 TOEIC Part 5 單句填空題，四個選項都要看起來像商務英語。",
    required_context_clue: "句型與語意要同時約束正解，避免只測單字定義。"
  },
  part6_context_choice: {
    authoring_focus: "multi_clause_context_choice",
    prompt: "寫一個較完整的前後文句子，讓前文或後文提供情境推理線索。",
    required_context_clue: "前後文至少要有一個事件或結果提示，支持語境推理。"
  },
  review_question: {
    authoring_focus: "fresh_review_context",
    prompt: "用和核心題不同的情境重測同一搭配，避免直接重寫原句。",
    required_context_clue: "情境要新，但仍需保留商務場景與可辨識的錯誤陷阱。"
  }
};

function pickFrom(values, index) {
  return values[index % values.length];
}

function fillTemplate(template, replacements) {
  return Object.entries(replacements).reduce((text, [key, value]) => (
    text.replaceAll(`{${key}}`, value)
  ), template);
}

function topicContext(topic) {
  return TOPIC_CONTEXTS[topic] || TOPIC_CONTEXTS.default;
}

function buildLessonIndex(lessonDraft) {
  return new Map((lessonDraft.lessons || []).map((lesson) => [lesson.lesson_id, lesson]));
}

function buildTargetIndex(questions, lessonsById) {
  const targets = new Map();

  questions.forEach((question) => {
    if (!targets.has(question.target_item_id)) {
      const lesson = lessonsById.get(question.lesson_id);
      targets.set(question.target_item_id, {
        target_item_id: question.target_item_id,
        source_phrase: question.draft_metadata?.source_phrase || null,
        gloss_zh: question.draft_metadata?.gloss_zh || null,
        topics: [],
        lesson_ids: [],
        question_ids: [],
        question_types: []
      });
      if (lesson?.topic) targets.get(question.target_item_id).topics.push(lesson.topic);
    }

    const target = targets.get(question.target_item_id);
    target.lesson_ids.push(question.lesson_id);
    target.question_ids.push(question.question_id);
    target.question_types.push(question.type);
    if (!target.topics.length) {
      const lesson = lessonsById.get(question.lesson_id);
      if (lesson?.topic) target.topics.push(lesson.topic);
    }
  });

  return new Map([...targets.entries()].map(([targetId, target]) => [targetId, {
    ...target,
    topics: unique(target.topics),
    lesson_ids: unique(target.lesson_ids),
    question_ids: unique(target.question_ids),
    question_types: unique(target.question_types)
  }]));
}

function buildSentenceContextBank(questionShells, lessonDraft, referenceBundle) {
  const lessonsById = buildLessonIndex(lessonDraft);
  const targetCount = new Set(questionShells.questions.map((question) => question.target_item_id)).size;
  const entries = questionShells.questions.map((question, index) => {
    const lesson = lessonsById.get(question.lesson_id);
    const topic = lesson?.topic || question.draft_metadata?.source_topic || "default";
    const context = topicContext(topic);
    const typeProfile = TYPE_PROFILES[question.type] || TYPE_PROFILES.collocation;
    const recipe = {
      setting: pickFrom(context.settings, index),
      actor: pickFrom(context.actors, index + 1),
      task: pickFrom(context.tasks, index + 2),
      document: pickFrom(context.documents, index + 3),
      clue: pickFrom(context.clues, index + 4)
    };

    return {
      context_id: `ctx_${slug(question.question_id)}`,
      question_id: question.question_id,
      lesson_id: question.lesson_id,
      target_item_id: question.target_item_id,
      source_phrase: question.draft_metadata?.source_phrase || null,
      gloss_zh: question.draft_metadata?.gloss_zh || null,
      question_type: question.type,
      topic,
      lesson_title: lesson?.title || null,
      authoring_focus: typeProfile.authoring_focus,
      context_recipe: recipe,
      required_context_clue: typeProfile.required_context_clue,
      banned_shortcuts: [
        "不可直接把中文釋義寫成答案線索",
        "不可用 definition-style wording 取代商務情境",
        "不可重複使用其他 shell 的同一句型"
      ],
      authoring_prompt: `${typeProfile.prompt} 主場景可用「${recipe.setting} / ${recipe.task} / ${recipe.document}」，並用「${recipe.clue}」當成限制線索。`
    };
  });

  return {
    generated_at: new Date().toISOString(),
    bank_version: "wave1_sentence_context_bank_v1",
    reference_role: "ability_signal_only",
    status: "draft_only",
    production_impact: "none",
    production_merge_allowed: false,
    source_files: [
      relativePath(repoRoot, paths.lessonDraft),
      relativePath(repoRoot, paths.questionShells),
      relativePath(repoRoot, paths.referenceBundle)
    ],
    scope: {
      stage: "V3",
      lesson_type: "collocation",
      wave: 1,
      lesson_count: lessonDraft.lessons.length,
      question_shell_count: questionShells.questions.length,
      target_item_count: targetCount
    },
    totals: {
      entry_count: entries.length,
      target_item_count: targetCount,
      question_type_counts: countBy(entries, (entry) => entry.question_type),
      topic_counts: countBy(entries, (entry) => entry.topic)
    },
    entries
  };
}

function buildPairIndex(duplicateReference) {
  const byTarget = new Map();

  const addCandidate = (targetId, candidate) => {
    if (!byTarget.has(targetId)) byTarget.set(targetId, []);
    byTarget.get(targetId).push(candidate);
  };

  duplicateReference.near_duplicate_pairs.forEach((pair, index) => {
    const leftId = pair.left.candidate_item_id;
    const rightId = pair.right.candidate_item_id;
    const referenceId = `pair_${index + 1}`;
    const role = pair.relation_type === "same_head_particle_contrast"
      ? "wrong_particle"
      : "near_surface";

    addCandidate(leftId, {
      option_text: pair.right.phrase,
      related_topic: pair.right.topic,
      source_type: "surface_close",
      source_reference_id: referenceId,
      distractor_role: role,
      ambiguity_risk: pair.risk_level,
      authoring_note: pair.authoring_note
    });

    addCandidate(rightId, {
      option_text: pair.left.phrase,
      related_topic: pair.left.topic,
      source_type: "surface_close",
      source_reference_id: referenceId,
      distractor_role: role,
      ambiguity_risk: pair.risk_level,
      authoring_note: pair.authoring_note
    });
  });

  return byTarget;
}

function buildFamilyIndex(phraseFamilies) {
  const byTarget = new Map();

  phraseFamilies.families.forEach((family) => {
    family.members.forEach((member) => {
      const candidates = family.members
        .filter((candidate) => candidate.candidate_item_id !== member.candidate_item_id)
        .map((candidate) => ({
          option_text: candidate.phrase,
          related_topic: candidate.topic,
          source_type: "same_head_family",
          source_reference_id: family.family_id,
          distractor_role: "semantic_neighbor",
          ambiguity_risk: "medium",
          authoring_note: family.authoring_use
        }));

      if (!byTarget.has(member.candidate_item_id)) byTarget.set(member.candidate_item_id, []);
      byTarget.get(member.candidate_item_id).push(...candidates);
    });
  });

  return byTarget;
}

function buildDistractorBank(questionShells, lessonDraft, phraseFamilies, duplicateReference) {
  const lessonsById = buildLessonIndex(lessonDraft);
  const targets = buildTargetIndex(questionShells.questions, lessonsById);
  const pairIndex = buildPairIndex(duplicateReference);
  const familyIndex = buildFamilyIndex(phraseFamilies);
  const targetRows = [];
  const flatCandidates = [];

  targets.forEach((target) => {
    const rawCandidates = [
      ...(pairIndex.get(target.target_item_id) || []),
      ...(familyIndex.get(target.target_item_id) || [])
    ];

    const seen = new Set();
    const candidates = rawCandidates
      .filter((candidate) => {
        const key = `${target.target_item_id}::${candidate.option_text}`.toLowerCase();
        if (candidate.option_text === target.source_phrase || seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .map((candidate, index) => ({
        distractor_id: `dstr_${slug(target.target_item_id)}_${String(index + 1).padStart(2, "0")}`,
        target_item_id: target.target_item_id,
        target_phrase: target.source_phrase,
        option_text: candidate.option_text,
        source_type: candidate.source_type,
        source_reference_id: candidate.source_reference_id,
        distractor_role: candidate.distractor_role,
        grammar_fit: null,
        collocation_fit: null,
        ambiguity_risk: candidate.ambiguity_risk,
        review_status: "candidate",
        rejection_reason: null,
        context_validation_required: true,
        related_topic: candidate.related_topic,
        authoring_note: candidate.authoring_note
      }));

    flatCandidates.push(...candidates);
    targetRows.push({
      target_item_id: target.target_item_id,
      source_phrase: target.source_phrase,
      gloss_zh: target.gloss_zh,
      primary_topic: target.topics[0] || null,
      lesson_ids: target.lesson_ids,
      question_types: target.question_types,
      reference_candidate_count: candidates.length,
      teacher_written_slots_required: Math.max(0, 4 - candidates.length),
      candidates
    });
  });

  return {
    generated_at: new Date().toISOString(),
    bank_version: "wave1_distractor_reference_bank_v1",
    reference_role: "ability_signal_only",
    status: "draft_only",
    production_impact: "none",
    production_merge_allowed: false,
    source_files: [
      relativePath(repoRoot, paths.questionShells),
      relativePath(repoRoot, paths.phraseFamilies),
      relativePath(repoRoot, paths.duplicateReference)
    ],
    scope: {
      stage: "V3",
      lesson_type: "collocation",
      wave: 1,
      target_item_count: targetRows.length
    },
    totals: {
      target_item_count: targetRows.length,
      targets_with_reference_candidates: targetRows.filter((row) => row.reference_candidate_count > 0).length,
      targets_needing_teacher_written_slots: targetRows.filter((row) => row.teacher_written_slots_required > 0).length,
      total_reference_candidates: flatCandidates.length,
      source_type_counts: countBy(flatCandidates, (row) => row.source_type),
      distractor_role_counts: countBy(flatCandidates, (row) => row.distractor_role)
    },
    targets: targetRows
  };
}

function buildExplanationBank(questionShells, lessonDraft, distractorBank, authoringPolicy) {
  const lessonsById = buildLessonIndex(lessonDraft);
  const distractorTargets = new Map(distractorBank.targets.map((target) => [target.target_item_id, target]));
  const rubric = authoringPolicy.policies.explanation_rubric;
  const targetCount = new Set(questionShells.questions.map((question) => question.target_item_id)).size;

  const entries = questionShells.questions.map((question, index) => {
    const lesson = lessonsById.get(question.lesson_id);
    const topic = lesson?.topic || question.draft_metadata?.source_topic || "default";
    const topicProfile = topicContext(topic);
    const distractorTarget = distractorTargets.get(question.target_item_id);
    const firstCandidate = distractorTarget?.candidates[0];
    const templateKey = question.type === "collocation"
      ? "collocation"
      : question.type === "part5_sentence_completion"
        ? "part5_sentence_completion"
        : question.type === "part6_context_choice"
          ? "part6_context_choice"
          : "review_question";

    return {
      explanation_id: `exp_${slug(question.question_id)}`,
      question_id: question.question_id,
      lesson_id: question.lesson_id,
      target_item_id: question.target_item_id,
      source_phrase: question.draft_metadata?.source_phrase || null,
      gloss_zh: question.draft_metadata?.gloss_zh || null,
      question_type: question.type,
      topic,
      required_parts: rubric.required_parts,
      fail_conditions: rubric.fail_conditions,
      length_target: rubric.length_target,
      trap_focus: firstCandidate?.distractor_role || "teacher_written_contrast",
      audit_alignment: {
        requires_rule_cue: true,
        requires_trap_cue: true,
        recommended_terms: ["搭配", "語境", "不是", "易錯"]
      },
      template_preview: fillTemplate(rubric.templates[templateKey], {
        correct_phrase: question.draft_metadata?.source_phrase || "[正確搭配]",
        meaning: question.draft_metadata?.gloss_zh || "[意思]",
        wrong_option: firstCandidate?.option_text || "[錯誤選項]",
        business_action: pickFrom(topicProfile.tasks, index),
        context_clue: pickFrom(topicProfile.clues, index + 1),
        usage: TYPE_PROFILES[question.type]?.authoring_focus || "business usage"
      }),
      authoring_prompt: `用繁中 1-2 句說明「${question.draft_metadata?.source_phrase || "[目標搭配]"}」為何符合 ${topic} 的商務語境，並點出至少一個 ${firstCandidate?.distractor_role || "易混淆錯項"} 陷阱。`
    };
  });

  return {
    generated_at: new Date().toISOString(),
    bank_version: "wave1_explanation_reference_bank_v1",
    reference_role: "ability_signal_only",
    status: "draft_only",
    production_impact: "none",
    production_merge_allowed: false,
    source_files: [
      relativePath(repoRoot, paths.questionShells),
      relativePath(repoRoot, paths.authoringPolicy)
    ],
    scope: {
      stage: "V3",
      lesson_type: "collocation",
      wave: 1,
      entry_count: entries.length,
      target_item_count: targetCount
    },
    totals: {
      entry_count: entries.length,
      target_item_count: targetCount,
      question_type_counts: countBy(entries, (entry) => entry.question_type),
      trap_focus_counts: countBy(entries, (entry) => entry.trap_focus)
    },
    entries
  };
}

function main() {
  const lessonDraft = readJSON(paths.lessonDraft);
  const questionPlan = readJSON(paths.questionPlan);
  const questionShells = readJSON(paths.questionShells);
  const vocabSeedDraft = readJSON(paths.vocabSeedDraft);
  const referenceBundle = readJSON(paths.referenceBundle);
  const authoringPolicy = readJSON(paths.authoringPolicy);
  const phraseFamilies = readJSON(paths.phraseFamilies);
  const duplicateReference = readJSON(paths.duplicateReference);

  const sentenceBank = buildSentenceContextBank(questionShells, lessonDraft, referenceBundle);
  const distractorBank = buildDistractorBank(questionShells, lessonDraft, phraseFamilies, duplicateReference);
  const explanationBank = buildExplanationBank(questionShells, lessonDraft, distractorBank, authoringPolicy);

  writeJSON(path.join(outDir, "wave1_sentence_context_bank.json"), sentenceBank);
  writeJSON(path.join(outDir, "wave1_distractor_reference_bank.json"), distractorBank);
  writeJSON(path.join(outDir, "wave1_explanation_reference_bank.json"), explanationBank);

  console.log(JSON.stringify({
    phase: 9,
    status: "passed",
    outputs: {
      sentence_context_bank: relativePath(repoRoot, path.join(outDir, "wave1_sentence_context_bank.json")),
      distractor_reference_bank: relativePath(repoRoot, path.join(outDir, "wave1_distractor_reference_bank.json")),
      explanation_reference_bank: relativePath(repoRoot, path.join(outDir, "wave1_explanation_reference_bank.json"))
    },
    lesson_count: lessonDraft.lessons.length,
    question_shell_count: questionShells.questions.length,
    draft_vocab_item_count: vocabSeedDraft.items.length,
    sentence_entries: sentenceBank.totals.entry_count,
    distractor_targets: distractorBank.totals.target_item_count,
    distractor_candidates: distractorBank.totals.total_reference_candidates,
    explanation_entries: explanationBank.totals.entry_count,
    question_plan_lessons: questionPlan.lessons.length
  }, null, 2));
}

main();