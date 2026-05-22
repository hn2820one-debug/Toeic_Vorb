import { test, expect, type Page } from "@playwright/test";
import { clearIndexedDb, waitForApp, waitForVocabDb } from "./helpers/seed-idb";

const DB_NAME = "toeic_vocab_tracker_db";
const DB_VERSION = 2;
const APP_SEED_VERSION = "toeic_vocab_tracker_v3_w2_07_wave_18_2026_05_22";
const ACTIVE_SESSION_KEY = "toeic_vocab_active_session";
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

async function seedStaleCurrentVersionDb(page: Page) {
  await page.goto("/index.html?pw-stale-seed=1", { waitUntil: "load", timeout: HELPER_TIMEOUT });
  await page.evaluate(async ({ dbName, dbVersion, stores, seedVersion, activeSessionKey }) => {
    const txPromise = (tx: IDBTransaction) => new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
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
    });

    const db = await openDb();
    const tx = db.transaction(["settings", "lessons", "questions"], "readwrite");
    tx.objectStore("settings").put({ key: "seed_version", value: seedVersion });
    tx.objectStore("lessons").put({
      lesson_id: "V4-A-181",
      lesson_number: 181,
      stage: "V4",
      stage_name: "Formal Phrase",
      title: "Stale V4 Lesson",
      lesson_type: "formal_phrase",
      status: "in_progress",
      question_ids: ["stale_q_001"],
      review_question_ids: []
    });
    tx.objectStore("questions").put({
      question_id: "stale_q_001",
      lesson_id: "V4-A-181",
      stage: "V4",
      type: "formal_phrase",
      question_text: "Stale question for on behalf of.",
      options: { A: "on behalf of", B: "in spite of", C: "next to", D: "as long as" },
      correct_answer: "A",
      explanation_zh: "Stale local row.",
      target_item_id: "item_v4_on_behalf_of",
      default_error_code: "FORMAL_PHRASE",
      difficulty: 2
    });
    await txPromise(tx);
    db.close();

    localStorage.setItem(activeSessionKey, JSON.stringify({
      lesson_id: "V4-A-181",
      question_ids: ["stale_q_001"],
      current_index: 0,
      answers: {}
    }));
  }, {
    dbName: DB_NAME,
    dbVersion: DB_VERSION,
    stores: STORES,
    seedVersion: APP_SEED_VERSION,
    activeSessionKey: ACTIVE_SESSION_KEY
  });
}

test("seed sync prunes stale lessons and questions when current seed is already marked", async ({ page }) => {
  await clearIndexedDb(page);
  await seedStaleCurrentVersionDb(page);

  await page.goto("/tracker.html?pw-stale-seed=1", { waitUntil: "domcontentloaded", timeout: HELPER_TIMEOUT });
  await waitForVocabDb(page);
  await waitForApp(page);

  const result = await page.evaluate(async () => ({
    lessons: (await window.VocabDB.getAll("lessons")).length,
    questions: (await window.VocabDB.getAll("questions")).length,
    syncVersion: (await window.VocabDB.get("settings", "seed_version"))?.value,
    activeSession: localStorage.getItem(window.VocabDB.ACTIVE_SESSION_KEY)
  }));

  expect(result.lessons).toBe(0);
  expect(result.questions).toBe(0);
  expect(result.syncVersion).toBe(APP_SEED_VERSION);
  expect(result.activeSession).toBeNull();
});
