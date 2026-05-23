import { test as base, expect, type Page } from "@playwright/test";

// Seeded Playwright fixture helper. Production-empty coverage should use clearIndexedDb() plus waitForApp().

const DB_NAME = "toeic_vocab_tracker_db";
const DB_VERSION = 2;
const COURSE_ID = "toeic_vocab_v1";
const APP_SEED_VERSION = "toeic_vocab_tracker_v3_w2_07_wave_18_2026_05_22";
const PREF_KEY = "toeic_vocab_tracker_preferences";
const ACTIVE_SESSION_KEY = "toeic_vocab_active_session";
const WORD_HIGHLIGHT_KEY = "toeic_vocab_word_highlights";
const PLAYWRIGHT_SEEDED_FLAG = "toeic_vocab_playwright_seeded_fixture";
const HELPER_TIMEOUT = 15_000;

const STORES = {
  users: { keyPath: "user_id" },
  settings: { keyPath: "key" },
  curriculum: { keyPath: "course_id" },
  lessons: { keyPath: "lesson_id", indexes: ["stage", "status", "lesson_type"] },
  questions: { keyPath: "question_id", indexes: ["lesson_id", "stage", "type", "default_error_code", "target_item_id"] },
  question_edits: { keyPath: "question_id", indexes: ["edited_at", "source_seed_version", "change_type"] },
  vocab_items: { keyPath: "item_id", indexes: ["item_type", "mastery_level", "next_review_date"] },
  attempts: { keyPath: "attempt_id", indexes: ["session_id", "lesson_id", "question_id", "stage", "timestamp", "error_code", "target_item_id"] },
  sessions: { keyPath: "session_id", indexes: ["date", "lesson_id", "stage", "mastery_status"] },
  error_logs: { keyPath: "error_log_id", indexes: ["item_id", "error_code", "lesson_id", "status"] },
  review_queue: { keyPath: "review_id", indexes: ["item_id", "due_date", "status", "priority"] },
  exports: { keyPath: "export_id", indexes: ["created_at"] }
} as const;

export const trackerSeed = {
  userId: "pw_user",
  lessonId: "PW-V1-001",
  lessonTitle: "Playwright Seed Lesson",
  questionIds: ["pw_q_001", "pw_q_002", "pw_q_003", "pw_q_004", "pw_q_005"]
};

const seedUser = {
  user_id: trackerSeed.userId,
  display_name: "Playwright User",
  baseline_score: 570,
  target_score: 750
};

const seedLesson = {
  lesson_id: trackerSeed.lessonId,
  lesson_number: 1,
  stage: "V1",
  stage_name: "Word Family",
  title: trackerSeed.lessonTitle,
  lesson_type: "core",
  status: "not_started",
  estimated_minutes: 15,
  grammar_link_id: "wf_accurate",
  question_ids: trackerSeed.questionIds,
  review_question_ids: []
};

const seedQuestions = [
  {
    question_id: trackerSeed.questionIds[0],
    lesson_id: trackerSeed.lessonId,
    stage: "V1",
    type: "meaning_choice",
    skill: "meaning_choice",
    subskill: "core_meaning",
    grammar_link_id: "wf_accurate",
    question_text: "Choose the best meaning of accurate.",
    options: { A: "correct", B: "late", C: "cheap", D: "silent" },
    correct_answer: "A",
    explanation_zh: "accurate 表示正確、精準。",
    target_item_id: "item_accurate",
    distractor_type: "toeic_realistic",
    difficulty: 1,
    estimated_time_seconds: 20,
    default_error_code: "VOCAB_WEAK_RECALL",
    tags: ["playwright", "seed"]
  },
  {
    question_id: trackerSeed.questionIds[1],
    lesson_id: trackerSeed.lessonId,
    stage: "V1",
    type: "word_family",
    skill: "word_family",
    subskill: "adjective",
    grammar_link_id: "wf_accurate",
    question_text: "The report was highly ____ and easy to trust.",
    options: { A: "accuracy", B: "accurate", C: "accurately", D: "inaccuracy" },
    correct_answer: "B",
    explanation_zh: "be 動詞後要接形容詞 accurate。",
    target_item_id: "item_accurate_family",
    distractor_type: "word_family",
    difficulty: 2,
    estimated_time_seconds: 20,
    default_error_code: "WORD_FAMILY_POS",
    tags: ["playwright", "seed"]
  },
  {
    question_id: trackerSeed.questionIds[2],
    lesson_id: trackerSeed.lessonId,
    stage: "V1",
    type: "collocation",
    skill: "collocation",
    subskill: "verb_noun",
    grammar_link_id: "wf_accurate",
    question_text: "Please ____ the final numbers before the meeting.",
    options: { A: "verify", B: "borrow", C: "divide", D: "ignore" },
    correct_answer: "A",
    explanation_zh: "verify the numbers 是常見搭配。",
    target_item_id: "item_verify",
    distractor_type: "toeic_realistic",
    difficulty: 2,
    estimated_time_seconds: 20,
    default_error_code: "COLLOCATION_PREP",
    tags: ["playwright", "seed"]
  },
  {
    question_id: trackerSeed.questionIds[3],
    lesson_id: trackerSeed.lessonId,
    stage: "V1",
    type: "part5_sentence_completion",
    skill: "toeic_sentence",
    subskill: "adjective_choice",
    grammar_link_id: "wf_accurate",
    question_text: "Our sales forecast is based on ____ market research.",
    options: { A: "accuracy", B: "accurate", C: "accurately", D: "accurateness" },
    correct_answer: "B",
    explanation_zh: "修飾名詞 research 要用形容詞 accurate。",
    target_item_id: "item_accurate_research",
    distractor_type: "toeic_realistic",
    difficulty: 2,
    estimated_time_seconds: 25,
    default_error_code: "VOCAB_WEAK_RECALL",
    tags: ["playwright", "seed"]
  },
  {
    question_id: trackerSeed.questionIds[4],
    lesson_id: trackerSeed.lessonId,
    stage: "V1",
    type: "speed_drill",
    skill: "speed_drill",
    subskill: "quick_recall",
    grammar_link_id: "wf_accurate",
    question_text: "Fast check: accurate most nearly means ____.",
    options: { A: "careless", B: "incorrect", C: "precise", D: "slow" },
    correct_answer: "C",
    explanation_zh: "precise 與 accurate 最接近。",
    target_item_id: "item_precise",
    distractor_type: "toeic_realistic",
    difficulty: 1,
    estimated_time_seconds: 8,
    default_error_code: "TIME_PRESSURE",
    tags: ["playwright", "seed"]
  }
];

const seedCurriculum = {
  course_id: COURSE_ID,
  version: "playwright_seed_v1",
  title: "TOEIC Vocabulary Tracker Test Seed",
  default_user: seedUser,
  stages: [
    { stage: "V1", stage_name: "Word Family", total_lessons: 1 }
  ],
  lessons: [seedLesson]
};

function trackerReady() {
  const view = document.getElementById("tracker-view");
  if (!view || !window.VocabTracker) return false;
  if (view.getAttribute("aria-busy") === "true") return false;
  if (view.querySelector("[data-testid='lesson-loading-skeleton']")) return false;
  return !(view.textContent || "").includes("Loading TOEIC Vocabulary Tracker");
}

export async function waitForVocabDb(page: Page) {
  await page.waitForFunction(async ({ dbName, dbVersion }) => {
    if (!window.VocabDB || !window.indexedDB) return false;

    try {
      const db = await new Promise<IDBDatabase>((resolve, reject) => {
        const request = window.indexedDB.open(dbName, dbVersion);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
        request.onblocked = () => reject(new Error("IndexedDB open blocked while waiting for VocabDB."));
      });
      const tx = db.transaction("settings", "readwrite");
      tx.objectStore("settings");
      await new Promise<void>((resolve, reject) => {
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
        tx.onabort = () => reject(tx.error);
      });
      db.close();
      return true;
    } catch (_err) {
      return false;
    }
  }, { dbName: DB_NAME, dbVersion: DB_VERSION }, { timeout: HELPER_TIMEOUT });
}

export async function clearIndexedDb(page: Page) {
  await page.goto("/index.html?pw-cleanup=1", { waitUntil: "load", timeout: HELPER_TIMEOUT });
  await page.evaluate(async ({ dbName, prefKey, activeSessionKey, wordHighlightKey, seededFlag }) => {
    const deleteDb = () => new Promise<void>((resolve, reject) => {
      const request = window.indexedDB.deleteDatabase(dbName);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
      request.onblocked = () => resolve();
    });

    localStorage.removeItem(prefKey);
    localStorage.removeItem(activeSessionKey);
    localStorage.removeItem(wordHighlightKey);
    localStorage.removeItem(seededFlag);
    sessionStorage.clear();
    await deleteDb();
  }, { dbName: DB_NAME, prefKey: PREF_KEY, activeSessionKey: ACTIVE_SESSION_KEY, wordHighlightKey: WORD_HIGHLIGHT_KEY, seededFlag: PLAYWRIGHT_SEEDED_FLAG });
}

export async function waitForApp(page: Page) {
  await Promise.all([
    page.waitForSelector("#tracker-tabs", { state: "attached", timeout: HELPER_TIMEOUT }),
    page.waitForSelector("#tracker-view", { state: "attached", timeout: HELPER_TIMEOUT })
  ]);
  await page.waitForFunction(trackerReady, { timeout: HELPER_TIMEOUT });
}

export async function clearAndSeedIndexedDb(page: Page) {
  await clearIndexedDb(page);
  await page.goto("/index.html", { waitUntil: "load", timeout: HELPER_TIMEOUT });

  await page.evaluate(async ({
    dbName,
    dbVersion,
    stores,
    prefKey,
    activeSessionKey,
    curriculum,
    lesson,
    questions,
    user,
    appSeedVersion,
    seededFlag
  }) => {
    const requestPromise = (request: IDBRequest) => new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    const txPromise = (tx: IDBTransaction) => new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    });

    const deleteDb = () => new Promise<void>((resolve, reject) => {
      const request = window.indexedDB.deleteDatabase(dbName);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
      request.onblocked = () => resolve();
    });

    const openDb = () => new Promise<IDBDatabase>((resolve, reject) => {
      const request = window.indexedDB.open(dbName, dbVersion);

      request.onupgradeneeded = () => {
        const db = request.result;
        Object.entries(stores).forEach(([storeName, config]) => {
          const store = db.objectStoreNames.contains(storeName)
            ? request.transaction!.objectStore(storeName)
            : db.createObjectStore(storeName, { keyPath: config.keyPath });
          (config.indexes || []).forEach((indexName: string) => {
            if (!store.indexNames.contains(indexName)) {
              store.createIndex(indexName, indexName, { unique: false });
            }
          });
        });
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
      request.onblocked = () => reject(new Error("IndexedDB open blocked during Playwright seed."));
    });

    localStorage.removeItem(prefKey);
    localStorage.removeItem(activeSessionKey);
  localStorage.setItem(seededFlag, "1");
    sessionStorage.clear();

    await deleteDb();
    const db = await openDb();
    const tx = db.transaction(Object.keys(stores), "readwrite");

    tx.objectStore("users").put(user);
    tx.objectStore("settings").put({ key: "seed_version", value: appSeedVersion });
    tx.objectStore("curriculum").put(curriculum);
    tx.objectStore("lessons").put(lesson);
    questions.forEach((question) => tx.objectStore("questions").put(question));

    await txPromise(tx);
    db.close();

    localStorage.setItem(prefKey, JSON.stringify({
      planned_lessons_this_week: 1,
      last_opened_lesson: lesson.lesson_id,
      current_stage: lesson.stage
    }));
  }, {
    dbName: DB_NAME,
    dbVersion: DB_VERSION,
    stores: STORES,
    prefKey: PREF_KEY,
    activeSessionKey: ACTIVE_SESSION_KEY,
    curriculum: seedCurriculum,
    lesson: seedLesson,
    questions: seedQuestions,
    user: seedUser,
    // Match the app seed marker so tracker init skips the full production seed.
    appSeedVersion: APP_SEED_VERSION,
    seededFlag: PLAYWRIGHT_SEEDED_FLAG
  });
}

export async function gotoSeededTracker(page: Page) {
  await clearAndSeedIndexedDb(page);
  await page.goto("/tracker.html?pw-seeded=1", { waitUntil: "domcontentloaded", timeout: HELPER_TIMEOUT });
  await waitForVocabDb(page);
  await waitForApp(page);
}

export const test = base.extend<{ seededTracker: void }>({
  seededTracker: [async ({ page }, use) => {
    await gotoSeededTracker(page);
    try {
      await use();
    } finally {
      await clearIndexedDb(page);
    }
  }, { auto: true }]
});

export { expect };
