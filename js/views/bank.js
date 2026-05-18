import {
  state,
  $,
  html,
  setNotice,
  loadData,
  currentLesson,
  answerDistribution
} from "../state.js";

let renderApp = null;
let seedQuestionMapPromise = null;

export function configureBankView({ render }) {
  renderApp = render;
}

function callRender() {
  if (typeof renderApp !== "function") {
    throw new Error("Bank view not configured");
  }
  renderApp();
}

function cloneJson(value) {
  return value === undefined ? undefined : JSON.parse(JSON.stringify(value));
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

async function sha256(value) {
  const payload = stableStringify(value ?? null);
  if (!window.crypto?.subtle) return `sha256:unavailable:${payload.length}`;
  const bytes = new TextEncoder().encode(payload);
  const digest = await window.crypto.subtle.digest("SHA-256", bytes);
  return `sha256:${[...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("")}`;
}

function changedFields(before, after) {
  const keys = new Set([...Object.keys(before || {}), ...Object.keys(after || {})]);
  return [...keys].filter((key) => stableStringify(before?.[key]) !== stableStringify(after?.[key])).sort();
}

function pickFields(record, fields) {
  if (!record) return null;
  return fields.reduce((out, field) => {
    out[field] = cloneJson(record[field]);
    return out;
  }, {});
}

async function getSeedQuestionMap() {
  if (seedQuestionMapPromise) return seedQuestionMapPromise;
  seedQuestionMapPromise = (async () => {
    const files = state.curriculum?.question_files || [];
    const map = new Map();
    await Promise.all(files.map(async (fileName) => {
      const questions = await window.VocabDB.fetchJSON(`./data/vocab/${fileName}`);
      questions.forEach((question) => {
        map.set(question.question_id, { file: fileName, question: cloneJson(question) });
      });
    }));
    return map;
  })();
  return seedQuestionMapPromise;
}

async function seedInfoForQuestion(questionId) {
  if (!questionId) return null;
  const seedMap = await getSeedQuestionMap();
  return seedMap.get(questionId) || null;
}

async function trackQuestionEdit(question, previousQuestion, changeType = "update") {
  const questionId = question?.question_id || previousQuestion?.question_id;
  if (!questionId) return;

  const [existingEdit, seedInfo] = await Promise.all([
    window.VocabDB.get("question_edits", questionId).catch(() => null),
    seedInfoForQuestion(questionId)
  ]);

  const beforeSnapshot = cloneJson(existingEdit?.before_snapshot || seedInfo?.question || previousQuestion || null);
  const afterSnapshot = changeType === "delete" ? null : cloneJson(question);

  if (seedInfo?.question && afterSnapshot && stableStringify(seedInfo.question) === stableStringify(afterSnapshot)) {
    await window.VocabDB.remove("question_edits", questionId);
    return;
  }

  const fields = changeType === "delete"
    ? Object.keys(beforeSnapshot || {}).sort()
    : changedFields(beforeSnapshot || {}, afterSnapshot || {});

  if (changeType === "update" && fields.length === 0) return;

  const record = {
    question_id: questionId,
    file_hint: seedInfo?.file || existingEdit?.file_hint || seedFilenameForQuestion(question || previousQuestion || {}),
    change_type: changeType,
    source_seed_version: existingEdit?.source_seed_version || window.VocabDB.SEED_VERSION,
    edited_at: window.VocabScoring.localIso(),
    fields_changed: fields,
    before_hash: beforeSnapshot ? await sha256(beforeSnapshot) : null,
    after_hash: afterSnapshot ? await sha256(afterSnapshot) : null,
    before_snapshot: beforeSnapshot,
    after_snapshot: afterSnapshot,
    reason: existingEdit?.reason || ""
  };

  await window.VocabDB.put("question_edits", record);
}

export function filteredQuestions() {
  return state.questions.filter((question) => {
    const search = String(state.bankFilters.search || "").trim().toLowerCase();
    if (search) {
      const haystack = [
        question.question_id,
        question.lesson_id,
        question.stage,
        question.type,
        question.question_text,
        question.target_item_id,
        question.default_error_code,
        question.explanation_zh,
        ...Object.values(question.options || {})
      ].join(" ").toLowerCase();
      if (!haystack.includes(search)) return false;
    }
    if (state.bankFilters.stage && question.stage !== state.bankFilters.stage) return false;
    if (state.bankFilters.lesson_id && question.lesson_id !== state.bankFilters.lesson_id) return false;
    if (state.bankFilters.type && question.type !== state.bankFilters.type) return false;
    if (state.bankFilters.error_code && question.default_error_code !== state.bankFilters.error_code) return false;
    return true;
  }).sort((a, b) => String(a.question_id).localeCompare(String(b.question_id)));
}

export function validateQuestionBank(questions) {
  const required = ["question_id", "lesson_id", "stage", "type", "question_text", "correct_answer", "explanation_zh", "target_item_id", "default_error_code", "difficulty"];
  const errors = [];
  const warnings = [];
  const ids = new Set();
  const texts = new Set();

  questions.forEach((question) => {
    required.forEach((field) => {
      if (question[field] === undefined || question[field] === null || question[field] === "") {
        errors.push(`${question.question_id || "(未知)"} 缺少欄位 ${field}`);
      }
    });

    if (!["A", "B", "C", "D"].includes(question.correct_answer)) {
      errors.push(`${question.question_id} 的 correct_answer 必須是 A/B/C/D`);
    }

    ["A", "B", "C", "D"].forEach((letter) => {
      if (!question.options || !question.options[letter]) {
        errors.push(`${question.question_id} 缺少選項 ${letter}`);
      }
    });

    if (ids.has(question.question_id)) errors.push(`重複的 question_id：${question.question_id}`);
    ids.add(question.question_id);

    const normalizedText = String(question.question_text || "").trim().toLowerCase();
    if (texts.has(normalizedText)) warnings.push(`題幹重複：${question.question_id}`);
    if (normalizedText) texts.add(normalizedText);
    if (!question.grammar_link_id) warnings.push(`${question.question_id} 沒有 grammar_link_id`);
    if (!Array.isArray(question.tags) || !question.tags.length) warnings.push(`${question.question_id} 沒有 tags`);
    if (!question.estimated_time_seconds) warnings.push(`${question.question_id} 沒有 estimated_time_seconds`);
  });

  const dist = answerDistribution(questions);
  const total = questions.length || 1;
  Object.entries(dist).forEach(([letter, count]) => {
    if (count / total > 0.4) warnings.push(`答案 ${letter} 佔 ${count}/${total}，超過 40%`);
  });

  return { errors, warnings, dist };
}

export function renderQuestionBank() {
  const questions = filteredQuestions();
  const validation = validateQuestionBank(questions);
  const seedFileCount = new Set(state.questions.map(seedFilenameForQuestion)).size;
  const stages = [...new Set(state.questions.map((question) => question.stage))].sort();
  const lessons = [...new Set(state.questions.map((question) => question.lesson_id))].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  const types = [...new Set(state.questions.map((question) => question.type))].sort();
  const selected = state.selectedQuestionId
    ? state.questions.find((question) => question.question_id === state.selectedQuestionId)
    : null;

  return `
    <section class="tracker-panel">
      <h3>題庫管理</h3>
      <div class="bank-filters">
        <label>
          <span>搜尋</span>
          <input data-testid="question-bank-search" type="search" value="${html(state.bankFilters.search || "")}" oninput="VocabTracker.setBankFilter('search', this.value)" placeholder="題號、單字、題幹文字">
        </label>
        ${renderSelect("stage", "階段", stages, state.bankFilters.stage)}
        ${renderSelect("lesson_id", "課程", lessons, state.bankFilters.lesson_id)}
        ${renderSelect("type", "題型", types, state.bankFilters.type)}
        ${renderSelect("error_code", "錯因", window.VocabScoring.ERROR_CODES, state.bankFilters.error_code)}
      </div>
      <div class="bank-summary">
        <span data-testid="question-bank-count">題目數量：<strong>${questions.length}</strong></span>
        <span>本機編輯：<strong>${state.questionEdits.length}</strong></span>
        <span>A:${validation.dist.A} / B:${validation.dist.B} / C:${validation.dist.C} / D:${validation.dist.D}</span>
        <span>錯誤：${validation.errors.length}</span>
        <span>警告：${validation.warnings.length}</span>
      </div>
      <div class="tracker-alert warn" data-testid="question-bank-local-warning">
        瀏覽器內的編輯只會寫進本機 IndexedDB。只有在匯出並套用回 seed JSON 後，才算正式資料變更。
      </div>
      <div class="tracker-actions">
        <button class="button secondary" type="button" onclick="VocabTracker.newQuestionTemplate()">新增題目</button>
        <button class="button secondary" type="button" onclick="VocabTracker.exportQuestions()">匯出 JSON</button>
        <button class="button secondary" data-testid="question-bank-patch-export" type="button" onclick="VocabTracker.exportLocalEditsPatch()">匯出本機編輯 Patch</button>
        <button class="button secondary" data-testid="question-bank-seed-export" type="button" onclick="VocabTracker.downloadSeedJson()">下載已編輯 Seed JSON 快照</button>
        <small class="muted-note">共 ${state.questions.length} 題，分布在 ${seedFileCount} 個 seed 檔</small>
        <label class="button secondary file-button">匯入 JSON<input type="file" accept="application/json,.json" onchange="VocabTracker.importQuestions(this.files[0])"></label>
        <button class="button secondary" type="button" onclick="VocabTracker.showValidation()">驗證題庫</button>
      </div>
    </section>
    <section class="bank-layout">
      <article class="tracker-panel question-list-panel">
        <h3>題目列表</h3>
        <div class="question-list" data-testid="question-bank-list">
          ${(() => {
            const PAGE_SIZE = 120;
            const visibleCount = ((state.bankPage || 0) + 1) * PAGE_SIZE;
            const visible = questions.slice(0, visibleCount);
            const hasMore = questions.length > visibleCount;
            return visible.map((question) => `
              <button class="question-row ${state.selectedQuestionId === question.question_id ? "active" : ""}" data-testid="question-bank-row" type="button" onclick="VocabTracker.selectQuestion('${html(question.question_id)}')">
                <strong>${html(question.question_id)}</strong>
                <small>${html(question.lesson_id)} · ${html(question.type)} · ${html(question.default_error_code)}</small>
              </button>
            `).join("") + (hasMore ? `<button class="button secondary" data-testid="question-bank-load-more" type="button" onclick="VocabTracker.loadMoreBankQuestions()" style="width:100%;margin-top:6px">載入更多（剩餘 ${questions.length - visibleCount} 題）</button>` : "");
          })()}
        </div>
      </article>
      <article class="tracker-panel editor-panel">
        <h3>編輯器</h3>
        <textarea id="question-json-editor" spellcheck="false">${html(selected ? JSON.stringify(selected, null, 2) : "")}</textarea>
        <div class="tracker-actions">
          <button class="button primary" type="button" onclick="VocabTracker.saveQuestionFromEditor()">儲存題目 JSON</button>
          <button class="button secondary" type="button" onclick="VocabTracker.deleteSelectedQuestion()" ${selected ? "" : "disabled"}>刪除</button>
        </div>
      </article>
    </section>
  `;
}

export function renderSelect(key, label, values, selected) {
  return `
    <label>
      <span>${html(label)}</span>
      <select onchange="VocabTracker.setBankFilter('${key}', this.value)">
        <option value="">全部</option>
        ${values.map((value) => `<option value="${html(value)}" ${selected === value ? "selected" : ""}>${html(value)}</option>`).join("")}
      </select>
    </label>
  `;
}

export function setBankFilter(key, value) {
  state.bankFilters[key] = value;
  state.bankPage = 0;
  callRender();
}

export function loadMoreBankQuestions() {
  state.bankPage = (state.bankPage || 0) + 1;
  callRender();
}

export function selectQuestion(questionId) {
  state.selectedQuestionId = questionId;
  callRender();
}

export function newQuestionTemplate() {
  const lesson = currentLesson();
  const template = {
    question_id: `custom_${Date.now()}`,
    lesson_id: lesson.lesson_id,
    stage: lesson.stage,
    type: "meaning_choice",
    skill: "meaning_choice",
    subskill: "custom",
    grammar_link_id: lesson.grammar_link_id || null,
    question_text: "Choose the best answer.",
    options: { A: "", B: "", C: "", D: "" },
    correct_answer: "A",
    explanation_zh: "",
    target_item_id: "item_custom",
    distractor_type: "toeic_realistic",
    difficulty: 2,
    estimated_time_seconds: 20,
    default_error_code: "VOCAB_WEAK_RECALL",
    tags: ["custom"]
  };

  state.selectedQuestionId = null;
  callRender();
  $("question-json-editor").value = JSON.stringify(template, null, 2);
}

export async function saveQuestionFromEditor() {
  const raw = $("question-json-editor")?.value || "";
  let question;

  try {
    question = JSON.parse(raw);
  } catch (err) {
    setNotice(`題目 JSON 解析失敗：${err.message}`, "danger");
    return;
  }

  const validation = validateQuestionBank([question]);
  if (validation.errors.length) {
    setNotice(validation.errors.slice(0, 3).join(" | "), "danger");
    return;
  }

  const previous = await window.VocabDB.get("questions", question.question_id).catch(() => null);
  await window.VocabDB.put("questions", question);
  await trackQuestionEdit(question, previous, previous ? "update" : "add");
  state.selectedQuestionId = question.question_id;
  await loadData();
  setNotice("題目已儲存在本機 IndexedDB。若要套用到正式 seed JSON，請先匯出 patch。", "ok");
  callRender();
}

export async function deleteSelectedQuestion() {
  if (!state.selectedQuestionId) return;
  if (!window.confirm(`要刪除 ${state.selectedQuestionId} 嗎？`)) return;

  const previous = await window.VocabDB.get("questions", state.selectedQuestionId).catch(() => null);
  if (previous) await trackQuestionEdit(null, previous, "delete");
  await window.VocabDB.remove("questions", state.selectedQuestionId);
  state.selectedQuestionId = null;
  await loadData();
  callRender();
}

export async function importQuestions(file) {
  if (!file) return;

  const text = await file.text();
  let parsed;

  try {
    parsed = JSON.parse(text);
  } catch (err) {
    setNotice(`匯入 JSON 解析失敗：${err.message}`, "danger");
    return;
  }

  const questions = Array.isArray(parsed) ? parsed : parsed.questions;
  if (!Array.isArray(questions)) {
    setNotice("匯入檔案必須是題目陣列，或是帶有 questions[] 的物件。", "danger");
    return;
  }

  const validation = validateQuestionBank(questions);
  if (validation.errors.length) {
    setNotice(`Import rejected: ${validation.errors.slice(0, 5).join(" | ")}`, "danger");
    return;
  }

  const previousRows = await Promise.all(questions.map((question) => window.VocabDB.get("questions", question.question_id).catch(() => null)));
  await window.VocabDB.putAll("questions", questions);
  for (const [index, question] of questions.entries()) {
    await trackQuestionEdit(question, previousRows[index], previousRows[index] ? "update" : "add");
  }
  await loadData();
  setNotice(`已匯入 ${questions.length} 題到本機。若要套用到正式 seed JSON，請先匯出 patch。`, "ok");
  callRender();
}

export function exportQuestions() {
  const questions = filteredQuestions();
  window.VocabScoring.downloadText("toeic_vocab_questions_export.json", JSON.stringify(questions, null, 2), "application/json;charset=utf-8");
}

export async function exportLocalEditsPatch() {
  const edits = await window.VocabDB.getAll("question_edits");
  if (!edits.length) {
    setNotice("這個瀏覽器目前沒有追蹤到任何本機題庫編輯。", "warn");
    return;
  }

  const changes = [];
  for (const edit of edits.sort((a, b) => String(a.question_id).localeCompare(String(b.question_id)))) {
    const current = await window.VocabDB.get("questions", edit.question_id).catch(() => null);
    const before = cloneJson(edit.before_snapshot || null);
    const after = edit.change_type === "delete" ? null : cloneJson(current || edit.after_snapshot || null);
    const fields = edit.change_type === "delete"
      ? edit.fields_changed || Object.keys(before || {}).sort()
      : changedFields(before || {}, after || {});

    changes.push({
      question_id: edit.question_id,
      file_hint: edit.file_hint,
      change_type: edit.change_type,
      before_hash: before ? await sha256(before) : null,
      after_hash: after ? await sha256(after) : null,
      before: pickFields(before, fields),
      after: pickFields(after, fields),
      fields_changed: fields,
      reason: edit.reason || "",
      edited_at: edit.edited_at
    });
  }

  const patch = {
    patch_version: "1.0",
    app: "toeic-vocab-tracker",
    program: "Program B",
    program_path: "C:\\Users\\Keith\\Toeic\\toeic-app-Vorb",
    source_seed_version: window.VocabDB.SEED_VERSION,
    created_at: window.VocabScoring.localIso(),
    created_by: "question-bank-local-editor",
    base_manifest: state.curriculum?.question_files || [],
    changes
  };

  const stamp = window.VocabScoring.localDate();
  window.VocabScoring.downloadText(`questionbank_edits_patch_${stamp}.json`, JSON.stringify(patch, null, 2), "application/json;charset=utf-8");
  setNotice(`已匯出 ${changes.length} 筆本機編輯 patch。套用到正式 JSON 前請先檢查。`, "ok");
}

function seedFilenameForQuestion(question) {
  const lessonId = String(question.lesson_id || "").toUpperCase();
  if (lessonId.startsWith("V1-A")) return "questions_v1a.json";
  if (lessonId.startsWith("V1-B")) return "questions_v1b.json";
  if (lessonId.startsWith("V1-C")) return "questions_v1c.json";
  if (lessonId.startsWith("V1-D")) return "questions_v1d.json";
  if (lessonId.startsWith("V1-E")) return "questions_v1e.json";
  if (lessonId.startsWith("V1-F")) return "questions_v1f.json";
  if (lessonId.startsWith("V0")) return "questions_v0.json";

  const stage = String(question.stage || "").toLowerCase().replace(/[^a-z0-9]/g, "");
  return `questions_${stage || "unknown"}.json`;
}

export async function downloadSeedJson() {
  const allQuestions = await window.VocabDB.getAll("questions");
  const validation = validateQuestionBank(allQuestions);
  if (validation.errors.length) {
    setNotice(`Seed 匯出已阻擋：${validation.errors.length} 個錯誤：${validation.errors.slice(0, 5).join(" | ")}`, "danger");
    return;
  }

  if (validation.warnings.length) {
    setNotice(`${validation.warnings.length} 個警告：${validation.warnings.slice(0, 3).join(" | ")}；仍會繼續匯出。`, "warn");
  }

  const groups = {};
  allQuestions.forEach((question) => {
    const filename = seedFilenameForQuestion(question);
    if (!groups[filename]) groups[filename] = [];
    groups[filename].push(question);
  });

  Object.values(groups).forEach((group) => group.sort((a, b) => String(a.question_id).localeCompare(String(b.question_id))));

  const fileCount = Object.keys(groups).length;
  const totalCount = allQuestions.length;

  if (window.showDirectoryPicker) {
    try {
      const root = await window.showDirectoryPicker({ mode: "readwrite" });
      for (const [name, questions] of Object.entries(groups)) {
        const handle = await root.getFileHandle(name, { create: true });
        const writable = await handle.createWritable();
        await writable.write(JSON.stringify(questions, null, 2));
        await writable.close();
      }
      setNotice(`已匯出 ${totalCount} 題到 ${fileCount} 個檔案。建議再重新匯入檢查。`, "ok");
      return;
    } catch (err) {
      if (err?.name !== "AbortError") throw err;
    }
  }

  Object.entries(groups).forEach(([name, questions], index) => {
    setTimeout(() => {
      window.VocabScoring.downloadText(name, JSON.stringify(questions, null, 2), "application/json;charset=utf-8");
    }, index * 160);
  });

  setNotice(`已匯出 ${totalCount} 題到 ${fileCount} 個檔案。建議再重新匯入檢查。`, "ok");
}

export function showValidation() {
  const validation = validateQuestionBank(filteredQuestions());
  const lines = [
    `錯誤：${validation.errors.length}`,
    ...validation.errors.slice(0, 8),
    `警告：${validation.warnings.length}`,
    ...validation.warnings.slice(0, 8)
  ];

  setNotice(lines.join(" | "), validation.errors.length ? "danger" : validation.warnings.length ? "warn" : "ok");
}
