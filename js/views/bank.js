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

export function configureBankView({ render }) {
  renderApp = render;
}

function callRender() {
  if (typeof renderApp !== "function") {
    throw new Error("Bank view not configured");
  }
  renderApp();
}

export function filteredQuestions() {
  return state.questions.filter((question) => {
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
        errors.push(`${question.question_id || "(unknown)"} missing ${field}`);
      }
    });

    if (!["A", "B", "C", "D"].includes(question.correct_answer)) {
      errors.push(`${question.question_id} correct_answer must be A/B/C/D`);
    }

    ["A", "B", "C", "D"].forEach((letter) => {
      if (!question.options || !question.options[letter]) {
        errors.push(`${question.question_id} missing option ${letter}`);
      }
    });

    if (ids.has(question.question_id)) errors.push(`duplicate question_id ${question.question_id}`);
    ids.add(question.question_id);

    const normalizedText = String(question.question_text || "").trim().toLowerCase();
    if (texts.has(normalizedText)) warnings.push(`duplicate question text: ${question.question_id}`);
    if (normalizedText) texts.add(normalizedText);
    if (!question.grammar_link_id) warnings.push(`${question.question_id} has no grammar_link_id`);
    if (!Array.isArray(question.tags) || !question.tags.length) warnings.push(`${question.question_id} has no tags`);
    if (!question.estimated_time_seconds) warnings.push(`${question.question_id} has no estimated_time_seconds`);
  });

  const dist = answerDistribution(questions);
  const total = questions.length || 1;
  Object.entries(dist).forEach(([letter, count]) => {
    if (count / total > 0.4) warnings.push(`answer ${letter} is ${count}/${total}, over 40%`);
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
      <h3>Question Bank Manager</h3>
      <div class="bank-filters">
        ${renderSelect("stage", "Stage", stages, state.bankFilters.stage)}
        ${renderSelect("lesson_id", "Lesson", lessons, state.bankFilters.lesson_id)}
        ${renderSelect("type", "Type", types, state.bankFilters.type)}
        ${renderSelect("error_code", "Error", window.VocabScoring.ERROR_CODES, state.bankFilters.error_code)}
      </div>
      <div class="bank-summary">
        <span>Question Count: <strong>${questions.length}</strong></span>
        <span>A:${validation.dist.A} / B:${validation.dist.B} / C:${validation.dist.C} / D:${validation.dist.D}</span>
        <span>Errors: ${validation.errors.length}</span>
        <span>Warnings: ${validation.warnings.length}</span>
      </div>
      <div class="tracker-actions">
        <button class="button secondary" type="button" onclick="VocabTracker.newQuestionTemplate()">Add Question</button>
        <button class="button secondary" type="button" onclick="VocabTracker.exportQuestions()">Export JSON</button>
        <button class="button secondary" type="button" onclick="VocabTracker.downloadSeedJson()">Download Seed JSON</button>
        <small class="muted-note">${state.questions.length} questions across ${seedFileCount} seed files</small>
        <label class="button secondary file-button">Import JSON<input type="file" accept="application/json,.json" onchange="VocabTracker.importQuestions(this.files[0])"></label>
        <button class="button secondary" type="button" onclick="VocabTracker.showValidation()">Validate Bank</button>
      </div>
    </section>
    <section class="bank-layout">
      <article class="tracker-panel question-list-panel">
        <h3>Questions</h3>
        <div class="question-list">
          ${(() => {
            const PAGE_SIZE = 120;
            const visibleCount = ((state.bankPage || 0) + 1) * PAGE_SIZE;
            const visible = questions.slice(0, visibleCount);
            const hasMore = questions.length > visibleCount;
            return visible.map((question) => `
              <button class="question-row ${state.selectedQuestionId === question.question_id ? "active" : ""}" type="button" onclick="VocabTracker.selectQuestion('${html(question.question_id)}')">
                <strong>${html(question.question_id)}</strong>
                <small>${html(question.lesson_id)} · ${html(question.type)} · ${html(question.default_error_code)}</small>
              </button>
            `).join("") + (hasMore ? `<button class="button secondary" type="button" onclick="VocabTracker.loadMoreBankQuestions()" style="width:100%;margin-top:6px">Load More (${questions.length - visibleCount} remaining)</button>` : "");
          })()}
        </div>
      </article>
      <article class="tracker-panel editor-panel">
        <h3>Editor</h3>
        <textarea id="question-json-editor" spellcheck="false">${html(selected ? JSON.stringify(selected, null, 2) : "")}</textarea>
        <div class="tracker-actions">
          <button class="button primary" type="button" onclick="VocabTracker.saveQuestionFromEditor()">Save Question JSON</button>
          <button class="button secondary" type="button" onclick="VocabTracker.deleteSelectedQuestion()" ${selected ? "" : "disabled"}>Delete</button>
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
        <option value="">All</option>
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
    setNotice(`Question JSON parse failed: ${err.message}`, "danger");
    return;
  }

  const validation = validateQuestionBank([question]);
  if (validation.errors.length) {
    setNotice(validation.errors.slice(0, 3).join(" | "), "danger");
    return;
  }

  await window.VocabDB.put("questions", question);
  state.selectedQuestionId = question.question_id;
  await loadData();
  setNotice("Question saved.", "ok");
  callRender();
}

export async function deleteSelectedQuestion() {
  if (!state.selectedQuestionId) return;
  if (!window.confirm(`Delete ${state.selectedQuestionId}?`)) return;

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
    setNotice(`Import JSON parse failed: ${err.message}`, "danger");
    return;
  }

  const questions = Array.isArray(parsed) ? parsed : parsed.questions;
  if (!Array.isArray(questions)) {
    setNotice("Import file must be a question array or an object with questions[].", "danger");
    return;
  }

  const validation = validateQuestionBank(questions);
  if (validation.errors.length) {
    setNotice(`Import rejected: ${validation.errors.slice(0, 5).join(" | ")}`, "danger");
    return;
  }

  await window.VocabDB.putAll("questions", questions);
  await loadData();
  setNotice(`${questions.length} questions imported.`, "ok");
  callRender();
}

export function exportQuestions() {
  const questions = filteredQuestions();
  window.VocabScoring.downloadText("toeic_vocab_questions_export.json", JSON.stringify(questions, null, 2), "application/json;charset=utf-8");
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
    setNotice(`Seed export blocked — ${validation.errors.length} error(s): ${validation.errors.slice(0, 5).join(" | ")}`, "danger");
    return;
  }

  if (validation.warnings.length) {
    setNotice(`${validation.warnings.length} warning(s): ${validation.warnings.slice(0, 3).join(" | ")} — export will proceed.`, "warn");
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
      setNotice(`Exported ${totalCount} questions to ${fileCount} files. Re-import to verify.`, "ok");
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

  setNotice(`Exported ${totalCount} questions to ${fileCount} files. Re-import to verify.`, "ok");
}

export function showValidation() {
  const validation = validateQuestionBank(filteredQuestions());
  const lines = [
    `Errors: ${validation.errors.length}`,
    ...validation.errors.slice(0, 8),
    `Warnings: ${validation.warnings.length}`,
    ...validation.warnings.slice(0, 8)
  ];

  setNotice(lines.join(" | "), validation.errors.length ? "danger" : validation.warnings.length ? "warn" : "ok");
}