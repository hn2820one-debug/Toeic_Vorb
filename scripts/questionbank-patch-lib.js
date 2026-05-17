const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const PROGRAM_A_PATH = path.resolve("C:/Users/Keith/toeic-app").toLowerCase();
const REQUIRED_QUESTION_FIELDS = [
  "question_id",
  "lesson_id",
  "stage",
  "type",
  "question_text",
  "options",
  "correct_answer",
  "explanation_zh",
  "target_item_id",
  "default_error_code",
  "difficulty"
];
const OPTION_LETTERS = ["A", "B", "C", "D"];

function parseArgs(argv) {
  const args = {};
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token.startsWith("--")) continue;
    const key = token.slice(2);
    const next = argv[index + 1];
    if (!next || next.startsWith("--")) {
      args[key] = true;
    } else {
      args[key] = next;
      index += 1;
    }
  }
  return args;
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

function canonicalize(value) {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === "object") {
    return Object.keys(value).sort().reduce((out, key) => {
      out[key] = canonicalize(value[key]);
      return out;
    }, {});
  }
  return value;
}

function stableStringify(value) {
  return JSON.stringify(canonicalize(value));
}

function sha256(value) {
  return `sha256:${crypto.createHash("sha256").update(stableStringify(value ?? null)).digest("hex")}`;
}

function sameValue(left, right) {
  return stableStringify(left) === stableStringify(right);
}

function changedFields(before, after) {
  const keys = new Set([...Object.keys(before || {}), ...Object.keys(after || {})]);
  return [...keys].filter((key) => !sameValue(before?.[key], after?.[key])).sort();
}

function pickFields(record, fields) {
  if (!record) return null;
  return fields.reduce((out, field) => {
    out[field] = record[field];
    return out;
  }, {});
}

function normalizeStem(text) {
  return String(text || "").trim().toLowerCase().replace(/\s+/g, " ");
}

function isV4Target(fileName, question) {
  return /^questions_v4/i.test(String(fileName || "")) || String(question?.stage || "").toUpperCase() === "V4";
}

function isInside(parent, child) {
  const relative = path.relative(parent, child);
  return relative === "" || (!!relative && !relative.startsWith("..") && !path.isAbsolute(relative));
}

function resolveRoot(rootArg) {
  return path.resolve(rootArg || process.cwd());
}

function assertProgramRoot(root) {
  const resolved = resolveRoot(root);
  const lower = resolved.toLowerCase();
  if (lower === PROGRAM_A_PATH || lower.startsWith(`${PROGRAM_A_PATH}${path.sep}`)) {
    throw new Error(`Refusing to operate inside Program A: ${resolved}`);
  }
  const curriculumPath = path.join(resolved, "data", "vocab", "curriculum.json");
  if (!fs.existsSync(curriculumPath)) {
    throw new Error(`Program B curriculum not found at ${curriculumPath}`);
  }
  return resolved;
}

function safePath(root, relativePath) {
  const target = path.resolve(root, relativePath);
  if (!isInside(root, target)) {
    throw new Error(`Refusing path outside Program B root: ${relativePath}`);
  }
  const lower = target.toLowerCase();
  if (lower === PROGRAM_A_PATH || lower.startsWith(`${PROGRAM_A_PATH}${path.sep}`)) {
    throw new Error(`Refusing Program A path: ${target}`);
  }
  return target;
}

function extractConst(filePath, name) {
  if (!fs.existsSync(filePath)) return null;
  const text = fs.readFileSync(filePath, "utf8");
  const match = text.match(new RegExp(`${name}\\s*=\\s*["']([^"']+)["']`));
  return match ? match[1] : null;
}

function loadSeedVersions(root, curriculum) {
  return {
    curriculum: curriculum.seed_version || null,
    vocabDb: extractConst(path.join(root, "js", "vocab-db.js"), "SEED_VERSION"),
    seedIdb: extractConst(path.join(root, "tests", "helpers", "seed-idb.ts"), "APP_SEED_VERSION")
  };
}

function assertSeedVersionsAligned(versions) {
  const values = Object.values(versions).filter(Boolean);
  if (!values.length) throw new Error("No seed version values found.");
  const unique = new Set(values);
  if (unique.size !== 1) {
    throw new Error(`Seed version mismatch across required files: ${JSON.stringify(versions)}`);
  }
  return values[0];
}

function loadSeedContext(rootArg) {
  const root = assertProgramRoot(rootArg);
  const dataDir = path.join(root, "data", "vocab");
  const curriculum = readJson(path.join(dataDir, "curriculum.json"));
  const questionFiles = Array.isArray(curriculum.question_files) && curriculum.question_files.length
    ? curriculum.question_files
    : fs.readdirSync(dataDir).filter((file) => /^questions_.*\.json$/i.test(file)).sort();
  const manifest = new Set(questionFiles);
  const fileQuestions = new Map();
  const questionIndex = new Map();

  for (const fileName of questionFiles) {
    if (isV4Target(fileName)) {
      throw new Error(`V4 file is present in production manifest: ${fileName}`);
    }
    const filePath = safePath(root, path.join("data", "vocab", fileName));
    if (!fs.existsSync(filePath)) throw new Error(`Missing production question file: ${fileName}`);
    const questions = readJson(filePath);
    if (!Array.isArray(questions)) throw new Error(`${fileName} must contain a JSON array.`);
    fileQuestions.set(fileName, questions);
    questions.forEach((question, index) => {
      if (questionIndex.has(question.question_id)) {
        throw new Error(`Duplicate seed question_id: ${question.question_id}`);
      }
      questionIndex.set(question.question_id, { fileName, index, question });
    });
  }

  const vocabItemsPath = path.join(dataDir, "vocab_items.json");
  const vocabItems = fs.existsSync(vocabItemsPath) ? readJson(vocabItemsPath) : [];
  const vocabItemIds = new Set(vocabItems.map((item) => item.item_id));
  const lessons = curriculum.lessons || [];
  const lessonById = new Map(lessons.map((lesson) => [lesson.lesson_id, lesson]));
  const versions = loadSeedVersions(root, curriculum);

  return {
    root,
    dataDir,
    curriculum,
    questionFiles,
    manifest,
    fileQuestions,
    questionIndex,
    vocabItems,
    vocabItemIds,
    lessonById,
    versions
  };
}

function loadPatch(filePath) {
  const patch = readJson(filePath);
  if (patch.patch_version !== "1.0") {
    throw new Error(`Unsupported patch_version: ${patch.patch_version}`);
  }
  if (!Array.isArray(patch.changes)) {
    throw new Error("Patch must contain changes[].");
  }
  return patch;
}

function loadSnapshot(filePath) {
  const snapshot = readJson(filePath);
  if (Array.isArray(snapshot)) return { questions: snapshot };
  if (Array.isArray(snapshot.questions)) return snapshot;
  throw new Error("Snapshot must be a question array or an object with questions[].");
}

function validateQuestionRow(question, context, options = {}) {
  const errors = [];
  for (const field of REQUIRED_QUESTION_FIELDS) {
    if (question[field] === undefined || question[field] === null || question[field] === "") {
      errors.push(`missing ${field}`);
    }
  }
  if (!String(question.question_text || "").trim()) {
    errors.push("question_text must not be blank");
  }
  if (!question.options || typeof question.options !== "object" || Array.isArray(question.options)) {
    errors.push("options must be an object with A/B/C/D");
  } else {
    for (const letter of OPTION_LETTERS) {
      if (!String(question.options[letter] || "").trim()) errors.push(`missing option ${letter}`);
    }
  }
  if (!OPTION_LETTERS.includes(question.correct_answer)) {
    errors.push(`correct_answer must be A/B/C/D, got ${question.correct_answer}`);
  } else if (!question.options?.[question.correct_answer]) {
    errors.push(`correct_answer ${question.correct_answer} does not exist in options`);
  }
  const lesson = context.lessonById.get(question.lesson_id);
  if (!lesson) {
    errors.push(`lesson_id ${question.lesson_id} not found in curriculum`);
  } else if (lesson.stage !== question.stage) {
    errors.push(`stage mismatch: question=${question.stage}, lesson=${lesson.stage}`);
  }
  if (!options.allowMissingTargetItem && question.target_item_id && !context.vocabItemIds.has(question.target_item_id)) {
    errors.push(`target_item_id ${question.target_item_id} not found in vocab_items.json`);
  }
  if (isV4Target("", question) && !options.draft) {
    errors.push("V4 question rows are rejected by default");
  }
  if (errors.length) {
    throw new Error(`${question.question_id || "(unknown question)"} invalid: ${errors.join("; ")}`);
  }
}

function assertNoDuplicateStems(fileQuestions) {
  const stems = new Map();
  for (const questions of fileQuestions.values()) {
    for (const question of questions) {
      const key = normalizeStem(question.question_text);
      if (!key) continue;
      if (stems.has(key)) {
        throw new Error(`Duplicate question_text stem introduced: ${question.question_id} duplicates ${stems.get(key)}`);
      }
      stems.set(key, question.question_id);
    }
  }
}

function resolveChangeTarget(change, context, options = {}) {
  const fileHint = change.file_hint || context.questionIndex.get(change.question_id)?.fileName;
  if (!fileHint) throw new Error(`${change.question_id}: no file_hint and question_id not found in seed.`);
  if (isV4Target(fileHint, change.after || change.before) && !options.draft) {
    throw new Error(`${change.question_id}: V4 draft/production target rejected by default.`);
  }
  if (!context.manifest.has(fileHint)) {
    throw new Error(`${change.question_id}: file_hint ${fileHint} is not in production question_files manifest.`);
  }
  const found = context.questionIndex.get(change.question_id);
  if (!found) throw new Error(`${change.question_id}: unknown question_id.`);
  if (found.fileName !== fileHint) {
    throw new Error(`${change.question_id}: file_hint ${fileHint} does not match seed file ${found.fileName}.`);
  }
  return found;
}

function applyPatchToMemory(patch, context, options = {}) {
  const currentSeedVersion = assertSeedVersionsAligned(context.versions);
  if (patch.source_seed_version !== currentSeedVersion && !options.force) {
    throw new Error(`Patch source_seed_version ${patch.source_seed_version} does not match current seed ${currentSeedVersion}.`);
  }

  const seenPatchIds = new Set();
  const results = [];
  for (const change of patch.changes) {
    if (seenPatchIds.has(change.question_id)) throw new Error(`Duplicate question_id in patch: ${change.question_id}`);
    seenPatchIds.add(change.question_id);

    const changeType = change.change_type || "update";
    if (changeType === "add" && !options.allowAdd) throw new Error(`${change.question_id}: add changes require --allow-add.`);
    if (changeType === "delete" && !options.allowDelete) throw new Error(`${change.question_id}: delete changes require --allow-delete.`);
    if (!["update", "add", "delete"].includes(changeType)) throw new Error(`${change.question_id}: unsupported change_type ${changeType}`);

    if (changeType !== "update") {
      throw new Error(`${change.question_id}: ${changeType} is not implemented in this production workflow yet.`);
    }

    const target = resolveChangeTarget(change, context, options);
    const current = target.question;
    if (change.before_hash && change.before_hash !== sha256(current)) {
      throw new Error(`${change.question_id}: before_hash does not match current seed row.`);
    }
    for (const [field, expected] of Object.entries(change.before || {})) {
      if (!sameValue(current[field], expected)) {
        throw new Error(`${change.question_id}: before.${field} does not match current seed row.`);
      }
    }

    const afterFields = change.after || {};
    if (afterFields.question_id && afterFields.question_id !== change.question_id && !options.allowIdChange) {
      throw new Error(`${change.question_id}: changing question_id requires --allow-id-change.`);
    }
    const updated = { ...current, ...afterFields, question_id: current.question_id };
    validateQuestionRow(updated, context, options);
    if (change.after_hash && change.after_hash !== sha256(updated)) {
      throw new Error(`${change.question_id}: after_hash does not match patched row.`);
    }

    const questions = context.fileQuestions.get(target.fileName);
    questions[target.index] = updated;
    context.questionIndex.set(change.question_id, { ...target, question: updated });
    results.push({ question_id: change.question_id, file: target.fileName, fields_changed: changedFields(current, updated) });
  }

  assertNoDuplicateStems(context.fileQuestions);
  return results;
}

function updateSeedVersions(context, newSeedVersion) {
  if (!newSeedVersion) throw new Error("--new-seed-version is required when writing a production patch.");
  context.curriculum.seed_version = newSeedVersion;
  writeJson(path.join(context.dataDir, "curriculum.json"), context.curriculum);

  const replacements = [
    {
      filePath: path.join(context.root, "js", "vocab-db.js"),
      regex: /const SEED_VERSION = "([^"]+)";/
    },
    {
      filePath: path.join(context.root, "tests", "helpers", "seed-idb.ts"),
      regex: /const APP_SEED_VERSION = "([^"]+)";/
    }
  ];
  for (const { filePath, regex } of replacements) {
    if (!fs.existsSync(filePath)) throw new Error(`Missing seed version file: ${filePath}`);
    const text = fs.readFileSync(filePath, "utf8");
    if (!regex.test(text)) throw new Error(`Could not find seed version constant in ${filePath}`);
    fs.writeFileSync(filePath, text.replace(regex, (match) => match.replace(/"[^"]+"/, `"${newSeedVersion}"`)));
  }
}

function writeQuestionFiles(context) {
  for (const [fileName, questions] of context.fileQuestions.entries()) {
    writeJson(path.join(context.dataDir, fileName), questions);
  }
}

function buildPatchFromSnapshot(snapshot, context) {
  const localQuestions = snapshot.questions || [];
  const seen = new Set();
  const changes = [];

  for (const local of localQuestions) {
    if (seen.has(local.question_id)) throw new Error(`Duplicate question_id in snapshot: ${local.question_id}`);
    seen.add(local.question_id);
    const seed = context.questionIndex.get(local.question_id);
    if (!seed) {
      changes.push({
        question_id: local.question_id,
        file_hint: null,
        change_type: "add",
        before_hash: null,
        after_hash: sha256(local),
        before: null,
        after: local,
        fields_changed: Object.keys(local).sort(),
        reason: ""
      });
      continue;
    }
    if (sameValue(seed.question, local)) continue;
    const fields = changedFields(seed.question, local);
    changes.push({
      question_id: local.question_id,
      file_hint: seed.fileName,
      change_type: "update",
      before_hash: sha256(seed.question),
      after_hash: sha256(local),
      before: pickFields(seed.question, fields),
      after: pickFields(local, fields),
      fields_changed: fields,
      reason: ""
    });
  }

  const sourceSeedVersion = assertSeedVersionsAligned(context.versions);
  return {
    patch_version: "1.0",
    app: "toeic-vocab-tracker",
    program: "Program B",
    program_path: "C:\\Users\\Keith\\Toeic\\toeic-app-Vorb",
    source_seed_version: sourceSeedVersion,
    created_at: new Date().toISOString(),
    created_by: "export-questionbank-edits.js",
    base_manifest: context.questionFiles,
    changes
  };
}

function compareSnapshotToSeed(snapshot, context) {
  const localQuestions = snapshot.questions || [];
  const localById = new Map();
  for (const question of localQuestions) {
    if (localById.has(question.question_id)) throw new Error(`Duplicate question_id in snapshot: ${question.question_id}`);
    localById.set(question.question_id, question);
  }

  const report = { same: [], changed: [], local_only: [], seed_only: [] };
  for (const [questionId, local] of localById.entries()) {
    const seed = context.questionIndex.get(questionId);
    if (!seed) {
      report.local_only.push({ question_id: questionId });
    } else if (sameValue(seed.question, local)) {
      report.same.push({ question_id: questionId, file: seed.fileName });
    } else {
      report.changed.push({ question_id: questionId, file: seed.fileName, fields_changed: changedFields(seed.question, local) });
    }
  }
  for (const [questionId, seed] of context.questionIndex.entries()) {
    if (!localById.has(questionId)) report.seed_only.push({ question_id: questionId, file: seed.fileName });
  }
  return report;
}

module.exports = {
  applyPatchToMemory,
  assertProgramRoot,
  buildPatchFromSnapshot,
  changedFields,
  compareSnapshotToSeed,
  loadPatch,
  loadSeedContext,
  loadSnapshot,
  parseArgs,
  readJson,
  safePath,
  sha256,
  stableStringify,
  updateSeedVersions,
  validateQuestionRow,
  writeJson,
  writeQuestionFiles
};
