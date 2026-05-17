const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawnSync } = require("child_process");
const { sha256, writeJson } = require("./questionbank-patch-lib");

const repoRoot = path.resolve(__dirname, "..");
const applyScript = path.join(repoRoot, "scripts", "apply-questionbank-patch.js");
const compareScript = path.join(repoRoot, "scripts", "compare-idb-vs-seed.js");
const exportScript = path.join(repoRoot, "scripts", "export-questionbank-edits.js");
const OLD_SEED = "toeic_vocab_tracker_fixture_2026_05_18";
const NEW_SEED = "toeic_vocab_tracker_fixture_patch_2026_05_18";

function buildQuestion(overrides = {}) {
  return {
    question_id: "v2_a_71_q_001",
    lesson_id: "V2-A-71",
    stage: "V2",
    type: "scene_vocabulary",
    skill: "scene_vocabulary",
    subskill: "office",
    question_text: "Office: Please update the ______ before the staff meeting.",
    options: { A: "workstation", B: "extension", C: "photocopier", D: "stationery" },
    correct_answer: "A",
    explanation_zh: "The office context points to workstation.",
    target_item_id: "item_v2_a_71_workstation",
    distractor_type: "same_scene_vocabulary",
    difficulty: 1,
    estimated_time_seconds: 15,
    default_error_code: "SCENE_VOCAB_GAP",
    tags: ["toeic_scene", "office"],
    ...overrides
  };
}

function buildFixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "toeic-qb-patch-"));
  const vocabDir = path.join(root, "data", "vocab");
  const jsDir = path.join(root, "js");
  const helperDir = path.join(root, "tests", "helpers");
  fs.mkdirSync(vocabDir, { recursive: true });
  fs.mkdirSync(jsDir, { recursive: true });
  fs.mkdirSync(helperDir, { recursive: true });

  const question = buildQuestion();
  writeJson(path.join(vocabDir, "curriculum.json"), {
    course_id: "toeic_vocab_v1",
    seed_version: OLD_SEED,
    lessons: [{
      lesson_id: "V2-A-71",
      stage: "V2",
      stage_name: "TOEIC Scene Vocabulary",
      lesson_number: 71,
      title: "Fixture Lesson",
      lesson_type: "scene_vocabulary",
      question_ids: [question.question_id],
      review_question_ids: []
    }],
    question_files: ["questions_v2a.json"]
  });
  writeJson(path.join(vocabDir, "questions_v2a.json"), [question]);
  writeJson(path.join(vocabDir, "vocab_items.json"), [{
    item_id: "item_v2_a_71_workstation",
    base_word: "workstation",
    lesson_ids: ["V2-A-71"],
    item_type: "scene_vocabulary"
  }]);
  fs.writeFileSync(path.join(jsDir, "vocab-db.js"), `const SEED_VERSION = "${OLD_SEED}";\n`);
  fs.writeFileSync(path.join(helperDir, "seed-idb.ts"), `const APP_SEED_VERSION = "${OLD_SEED}";\n`);
  return { root, question };
}

function makePatch(question, afterFields, overrides = {}) {
  const updated = { ...question, ...afterFields };
  const fields = Object.keys(afterFields).sort();
  return {
    patch_version: "1.0",
    source_seed_version: OLD_SEED,
    changes: [{
      question_id: question.question_id,
      file_hint: "questions_v2a.json",
      change_type: "update",
      before_hash: sha256(question),
      after_hash: sha256(updated),
      before: fields.reduce((out, field) => ({ ...out, [field]: question[field] }), {}),
      after: afterFields,
      fields_changed: fields,
      reason: "fixture",
      ...overrides
    }]
  };
}

function runNode(script, args, cwd = repoRoot) {
  return spawnSync(process.execPath, [script, ...args], {
    cwd,
    encoding: "utf8"
  });
}

function withFixture(name, fn) {
  const fixture = buildFixture();
  try {
    fn(fixture);
    console.log(`PASS ${name}`);
  } finally {
    fs.rmSync(fixture.root, { recursive: true, force: true });
  }
}

withFixture("valid patch applies and bumps seed version", ({ root, question }) => {
  const patchPath = path.join(root, "patch.json");
  writeJson(patchPath, makePatch(question, { explanation_zh: "Updated explanation for fixture validation." }));
  const result = runNode(applyScript, ["--root", root, "--patch", patchPath, "--write", "--new-seed-version", NEW_SEED]);
  assert.strictEqual(result.status, 0, result.stdout + result.stderr);
  const questions = JSON.parse(fs.readFileSync(path.join(root, "data", "vocab", "questions_v2a.json"), "utf8"));
  assert.strictEqual(questions[0].explanation_zh, "Updated explanation for fixture validation.");
  const curriculum = JSON.parse(fs.readFileSync(path.join(root, "data", "vocab", "curriculum.json"), "utf8"));
  assert.strictEqual(curriculum.seed_version, NEW_SEED);
  assert.match(fs.readFileSync(path.join(root, "js", "vocab-db.js"), "utf8"), new RegExp(NEW_SEED));
  assert.match(fs.readFileSync(path.join(root, "tests", "helpers", "seed-idb.ts"), "utf8"), new RegExp(NEW_SEED));
});

withFixture("mismatched before value fails", ({ root, question }) => {
  const patchPath = path.join(root, "patch.json");
  const patch = makePatch(question, { explanation_zh: "Updated explanation." }, { before_hash: null });
  patch.changes[0].before.question_text = "Wrong before text";
  writeJson(patchPath, patch);
  const result = runNode(applyScript, ["--root", root, "--patch", patchPath, "--write", "--new-seed-version", NEW_SEED]);
  assert.notStrictEqual(result.status, 0, result.stdout + result.stderr);
  assert.match(result.stderr, /before\.question_text does not match/);
});

withFixture("unknown question_id fails", ({ root, question }) => {
  const patchPath = path.join(root, "patch.json");
  const patch = makePatch(question, { explanation_zh: "Updated explanation." }, { question_id: "missing_q_001" });
  writeJson(patchPath, patch);
  const result = runNode(applyScript, ["--root", root, "--patch", patchPath]);
  assert.notStrictEqual(result.status, 0, result.stdout + result.stderr);
  assert.match(result.stderr, /unknown question_id/);
});

withFixture("invalid answer fails", ({ root, question }) => {
  const patchPath = path.join(root, "patch.json");
  const patch = makePatch(question, { correct_answer: "Z" }, { after_hash: null });
  writeJson(patchPath, patch);
  const result = runNode(applyScript, ["--root", root, "--patch", patchPath]);
  assert.notStrictEqual(result.status, 0, result.stdout + result.stderr);
  assert.match(result.stderr, /correct_answer must be A\/B\/C\/D/);
});

withFixture("V4 target fails by default", ({ root, question }) => {
  const patchPath = path.join(root, "patch.json");
  const patch = makePatch(question, { explanation_zh: "Updated explanation." }, { file_hint: "questions_v4a.json" });
  writeJson(patchPath, patch);
  const result = runNode(applyScript, ["--root", root, "--patch", patchPath]);
  assert.notStrictEqual(result.status, 0, result.stdout + result.stderr);
  assert.match(result.stderr, /V4 draft\/production target rejected/);
});

withFixture("compare script reports differences without mutation", ({ root, question }) => {
  const snapshotPath = path.join(root, "snapshot.json");
  const reportPath = path.join(root, "report.json");
  const beforeText = fs.readFileSync(path.join(root, "data", "vocab", "questions_v2a.json"), "utf8");
  writeJson(snapshotPath, {
    questions: [buildQuestion({ explanation_zh: "Browser-local edited explanation." })]
  });
  const result = runNode(compareScript, ["--root", root, "--snapshot", snapshotPath, "--json", reportPath]);
  assert.strictEqual(result.status, 0, result.stdout + result.stderr);
  const report = JSON.parse(fs.readFileSync(reportPath, "utf8"));
  assert.strictEqual(report.changed.length, 1);
  assert.deepStrictEqual(report.changed[0].fields_changed, ["explanation_zh"]);
  assert.strictEqual(fs.readFileSync(path.join(root, "data", "vocab", "questions_v2a.json"), "utf8"), beforeText);
});

withFixture("export script creates patch from snapshot", ({ root }) => {
  const snapshotPath = path.join(root, "snapshot.json");
  const patchPath = path.join(root, "generated.patch.json");
  writeJson(snapshotPath, {
    questions: [buildQuestion({ explanation_zh: "Browser-local edited explanation." })]
  });
  const result = runNode(exportScript, ["--root", root, "--snapshot", snapshotPath, "--output", patchPath]);
  assert.strictEqual(result.status, 0, result.stdout + result.stderr);
  const patch = JSON.parse(fs.readFileSync(patchPath, "utf8"));
  assert.strictEqual(patch.changes.length, 1);
  assert.strictEqual(patch.changes[0].change_type, "update");
});

console.log("Question Bank patch workflow tests passed.");
