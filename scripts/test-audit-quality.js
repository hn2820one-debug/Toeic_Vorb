const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawnSync } = require("child_process");

const repoRoot = path.resolve(__dirname, "..");
const auditScript = path.join(repoRoot, "scripts", "audit-quality-full.js");

const TERMS = ["workstation", "extension", "photocopier", "stationery"];

function questionId(lessonNumber, prefix, index) {
  const kind = prefix === "rv" ? "rv" : "q";
  return `v2_a_${lessonNumber}_${kind}_${String(index).padStart(3, "0")}`;
}

function buildQuestion({ lessonId, lessonNumber, index, review = false }) {
  const termIndex = (index - 1) % TERMS.length;
  const correct = ["A", "B", "C", "D"][termIndex];
  const term = TERMS[termIndex];
  return {
    question_id: questionId(lessonNumber, review ? "rv" : "q", review ? index + 20 : index),
    lesson_id: lessonId,
    stage: "V2",
    type: review ? "review_question" : "scene_vocabulary",
    skill: "scene_vocabulary",
    subskill: "office_equipment",
    question_text: review
      ? `Office review ${lessonNumber}-${index}: The team confirmed the ${term} request after the inventory check.`
      : `Office: The team updated the ______ request for record ${lessonNumber}-${index}.`,
    options: {
      A: TERMS[0],
      B: TERMS[1],
      C: TERMS[2],
      D: TERMS[3]
    },
    correct_answer: correct,
    explanation_zh: `正確答案是 ${term}，符合辦公情境。`,
    target_item_id: `item_v2_a_${lessonNumber}_${term}`,
    distractor_type: "same_scene_vocabulary",
    difficulty: 1,
    estimated_time_seconds: review ? 10 : 15,
    default_error_code: review ? "VOCAB_WEAK_RECALL" : "SCENE_VOCAB_GAP",
    tags: ["toeic_scene", "office"]
  };
}

function buildFixture(mutator) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "toeic-audit-"));
  const vocabDir = path.join(root, "data", "vocab");
  const draftDir = path.join(root, "drafts", "v4");
  fs.mkdirSync(vocabDir, { recursive: true });
  fs.mkdirSync(draftDir, { recursive: true });

  const lessons = [];
  const questions = [];
  const vocabItems = [];
  const mixedReviewQuestionIds = [];

  for (let offset = 0; offset < 5; offset += 1) {
    const lessonNumber = 71 + offset;
    const lessonId = `V2-A-${lessonNumber}`;
    const ownQuestionIds = [];
    const ownQuestionCount = offset === 0 ? 20 : 19;

    TERMS.forEach((term) => {
      vocabItems.push({
        item_id: `item_v2_a_${lessonNumber}_${term}`,
        base_word: term,
        item_type: "scene_vocabulary",
        lesson_ids: [lessonId],
        chinese: `測試詞 ${term}`,
        example: `The ${term} was checked during the office review.`
      });
    });

    for (let index = 1; index <= ownQuestionCount; index += 1) {
      const question = buildQuestion({ lessonId, lessonNumber, index });
      questions.push(question);
      ownQuestionIds.push(question.question_id);
    }

    if (offset > 0) {
      ownQuestionIds.push(questionId(lessonNumber - 1, "rv", 21));
    }

    const reviewQuestionIds = [];
    for (let index = 1; index <= 4; index += 1) {
      const question = buildQuestion({ lessonId, lessonNumber, index, review: true });
      questions.push(question);
      reviewQuestionIds.push(question.question_id);
      mixedReviewQuestionIds.push(question.question_id);
    }

    lessons.push({
      lesson_id: lessonId,
      stage: "V2",
      stage_name: "TOEIC Scene Vocabulary",
      lesson_number: lessonNumber,
      title: `Fixture Scene Vocabulary ${lessonNumber}`,
      estimated_minutes: 45,
      lesson_type: "scene_vocabulary",
      target_items: TERMS,
      question_ids: ownQuestionIds,
      review_question_ids: reviewQuestionIds,
      mastery_threshold: 0.8,
      seal_threshold: 0.85,
      grammar_link_id: "SCENE_VOCAB_CONTEXT",
      status: "not_started"
    });
  }

  lessons.push({
    lesson_id: "V2-MIX-01",
    stage: "V2",
    stage_name: "TOEIC Scene Vocabulary",
    lesson_number: 10001,
    title: "Mixed Review Fixture",
    estimated_minutes: 15,
    lesson_type: "mixed_review",
    target_items: [],
    question_ids: mixedReviewQuestionIds,
    review_question_ids: [],
    mastery_threshold: 0.8,
    seal_threshold: 0.85,
    grammar_link_id: "SCENE_VOCAB_CONTEXT",
    status: "not_started"
  });

  const curriculum = {
    course_id: "fixture_course",
    course_name: "Audit Fixture",
    schema_version: 1,
    seed_version: "fixture_seed",
    generated_at: "2026-05-18T00:00:00+08:00",
    lessons,
    question_files: ["questions_v2a.json"]
  };

  const fixture = { root, vocabDir, draftDir, curriculum, questions, vocabItems };
  if (mutator) mutator(fixture);

  fs.writeFileSync(path.join(vocabDir, "curriculum.json"), JSON.stringify(fixture.curriculum, null, 2));
  fs.writeFileSync(path.join(vocabDir, "questions_v2a.json"), JSON.stringify(fixture.questions, null, 2));
  fs.writeFileSync(path.join(vocabDir, "vocab_items.json"), JSON.stringify(fixture.vocabItems, null, 2));
  fs.writeFileSync(path.join(draftDir, "questions_v4a.json"), JSON.stringify([
    {
      question_id: "draft_v4_broken",
      stage: "V4",
      question_text: "This malformed draft must not be loaded by production audit."
    }
  ], null, 2));

  return root;
}

function runAudit(root) {
  return spawnSync(process.execPath, [auditScript], {
    cwd: repoRoot,
    env: { ...process.env, VOCAB_AUDIT_ROOT: root },
    encoding: "utf8"
  });
}

function withFixture(name, mutator, assertion) {
  const root = buildFixture(mutator);
  try {
    const result = runAudit(root);
    assertion(result);
    console.log(`PASS ${name}`);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
}

withFixture("mixed-review reuse is classified and V4 draft is skipped", null, (result) => {
  assert.strictEqual(result.status, 0, result.stdout + result.stderr);
  assert.match(result.stdout, /Core Lesson Audit:/);
  assert.match(result.stdout, /duplicate stems: 0/);
  assert.match(result.stdout, /Mixed Review Audit:/);
  assert.match(result.stdout, /intentional reused review questions: OK/);
  assert.match(result.stdout, /Draft Audit:/);
  assert.match(result.stdout, /V4 draft audit: skipped by default/);
  assert.match(result.stdout, /drafts\/v4 question files detected but not loaded: 1/);
});

withFixture("invalid mixed-review reference fails", (fixture) => {
  const mixed = fixture.curriculum.lessons.find((lesson) => lesson.lesson_type === "mixed_review");
  mixed.question_ids[0] = "missing_review_question";
}, (result) => {
  assert.notStrictEqual(result.status, 0, result.stdout + result.stderr);
  assert.match(result.stdout, /invalid review references: 1/);
  assert.match(result.stdout, /mixed_review references missing question_id/);
});

withFixture("V4 production file leakage fails", (fixture) => {
  fs.writeFileSync(path.join(fixture.vocabDir, "questions_v4a.json"), JSON.stringify([], null, 2));
}, (result) => {
  assert.notStrictEqual(result.status, 0, result.stdout + result.stderr);
  assert.match(result.stdout, /V4 production leakage issues: 1/);
  assert.match(result.stdout, /V4 question file is under data\/vocab/);
});

console.log("Audit quality script tests passed.");
