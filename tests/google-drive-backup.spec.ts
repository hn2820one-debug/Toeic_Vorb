import { test, expect, type Page } from "@playwright/test";
import { clearIndexedDb, waitForApp } from "./helpers/seed-idb";

const APP_TIMEOUT = 30_000;
const STEP_TIMEOUT = 10_000;
const CURRENT_SEED_VERSION = "toeic_vocab_tracker_v3_w2_07_wave_18_2026_05_22";

async function gotoProductionTracker(page: Page) {
  await clearIndexedDb(page);
  await page.goto("/tracker.html?pw-google-drive-backup=1", { waitUntil: "domcontentloaded", timeout: APP_TIMEOUT });
  await waitForApp(page);
  await page.waitForFunction(() => typeof window.VocabTracker?.setView === "function", { timeout: APP_TIMEOUT });
}

async function setTrackerView(page: Page, view: string) {
  await page.evaluate((targetView) => window.VocabTracker.setView(targetView), view);
}

async function seedLearnerSnapshot(page: Page, suffix = "a") {
  return page.evaluate(async (idSuffix) => {
    const now = window.VocabScoring.localIso();
    const lesson = await window.VocabDB.get("lessons", "V2-A-71");
    const question = await window.VocabDB.get("questions", "v2_a_71_q_001");
    const item = await window.VocabDB.get("vocab_items", question.target_item_id);
    const sessionId = `pw_backup_session_${idSuffix}`;
    const attemptId = `pw_backup_attempt_${idSuffix}`;
    const reviewId = `pw_backup_review_${idSuffix}`;
    const errorLogId = `pw_backup_error_${idSuffix}`;
    const highlightId = `pw_backup_highlight_${idSuffix}`;

    await window.VocabDB.put("lessons", {
      ...lesson,
      status: "completed",
      completed_at: now,
      updated_at: now
    });
    await window.VocabDB.put("vocab_items", {
      ...item,
      seen_count: Math.max(Number(item.seen_count || 0), 3),
      correct_count: Math.max(Number(item.correct_count || 0), 2),
      wrong_count: Math.max(Number(item.wrong_count || 0), 1),
      mastery_score: Math.max(Number(item.mastery_score || 0), 72),
      mastery_level: "unstable",
      first_seen: item.first_seen || now,
      last_seen: now,
      last_error_code: "SCENE_VOCAB_GAP",
      next_review_date: window.VocabScoring.localDate()
    });
    await window.VocabDB.put("sessions", {
      session_id: sessionId,
      date: window.VocabScoring.localDate(),
      user_id: "Keith",
      course_id: "toeic_vocab_v1",
      stage: "V2",
      lesson_id: "V2-A-71",
      lesson_title: lesson.title,
      planned_minutes: 45,
      actual_minutes: 3,
      started_at: now,
      ended_at: now,
      total_questions: 1,
      correct_questions: 0,
      wrong_questions: 1,
      accuracy: 0,
      avg_response_time_seconds: 11.2,
      mastery_status: "needs_reinforcement",
      next_action: "review_errors"
    });
    await window.VocabDB.put("attempts", {
      attempt_id: attemptId,
      timestamp: now,
      user_id: "Keith",
      course_id: "toeic_vocab_v1",
      stage: "V2",
      lesson_id: "V2-A-71",
      session_id: sessionId,
      step: "question",
      question_id: question.question_id,
      question_type: question.type,
      target_item_id: question.target_item_id,
      grammar_link_id: question.grammar_link_id,
      correct_answer: question.correct_answer,
      user_answer: question.correct_answer === "A" ? "B" : "A",
      is_correct: false,
      response_time_seconds: 11.2,
      speed_bucket: "slow_wrong",
      error_code: "SCENE_VOCAB_GAP",
      default_error_code: question.default_error_code,
      is_repeated_error: false,
      review_priority: 3,
      mode: "lesson"
    });
    await window.VocabDB.put("review_queue", {
      review_id: reviewId,
      item_id: question.target_item_id,
      question_ids: [question.question_id],
      reason: "lesson_error",
      priority: 3,
      due_date: window.VocabScoring.localDate(),
      status: "pending",
      created_at: now,
      updated_at: now
    });
    await window.VocabDB.put("error_logs", {
      error_log_id: errorLogId,
      item_id: question.target_item_id,
      error_code: "SCENE_VOCAB_GAP",
      lesson_id: "V2-A-71",
      question_id: question.question_id,
      status: "open",
      created_at: now,
      updated_at: now
    });

    localStorage.setItem("toeic_vocab_word_highlights", JSON.stringify([{
      highlight_id: highlightId,
      created_at: now,
      updated_at: now,
      status: "active",
      occurrences: 1,
      text: "extension",
      normalized: "extension",
      user_id: "Keith",
      session_id: sessionId,
      stage: "V2",
      lesson_id: "V2-A-71",
      lesson_title: lesson.title,
      question_id: question.question_id,
      question_type: question.type,
      target_item_id: question.target_item_id,
      source: "lesson_text",
      context_text: question.question_text
    }]));

    return { attemptId, sessionId, reviewId, errorLogId, highlightId, itemId: question.target_item_id };
  }, suffix);
}

async function backupFromPage(page: Page, suffix = "a") {
  await seedLearnerSnapshot(page, suffix);
  return page.evaluate((label) => window.VocabTracker.buildGoogleDriveBackupPayload(label), `device-${suffix}`);
}

async function selectBackupFile(page: Page, payload: unknown, name = "toeic_vocab_backup_test.json") {
  await page.getByTestId("google-drive-backup-import-input").setInputFiles({
    name,
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(payload), "utf8")
  });
}

test("Google Drive backup builder outputs required fields and summary", async ({ page }) => {
  await gotoProductionTracker(page);
  const seeded = await seedLearnerSnapshot(page, "builder");
  const payload = await page.evaluate(() => window.VocabTracker.buildGoogleDriveBackupPayload("Playwright laptop"));

  expect(payload.backup_version).toBe("1.0");
  expect(payload.app_id).toBe("toeic-vocab-tracker");
  expect(payload.seed_version).toBe(CURRENT_SEED_VERSION);
  expect(payload.source_device_label).toBe("Playwright laptop");
  expect(payload.summary.attempts).toBe(1);
  expect(payload.summary.sessions).toBe(1);
  expect(payload.summary.review_queue).toBe(1);
  expect(payload.summary.latest_attempt_at).toBeTruthy();
  for (const storeName of [
    "users",
    "settings",
    "lessons",
    "vocab_items",
    "attempts",
    "sessions",
    "error_logs",
    "review_queue",
    "exports",
    "question_edits",
    "word_highlights"
  ]) {
    expect(Array.isArray(payload.stores[storeName])).toBe(true);
  }
  expect(payload.stores.attempts.some((attempt) => attempt.attempt_id === seeded.attemptId)).toBe(true);
  expect(Array.isArray(payload.local_storage.word_highlights)).toBe(true);
});

test("invalid backup JSON is rejected before merge", async ({ page }) => {
  await gotoProductionTracker(page);
  await setTrackerView(page, "export");

  await page.getByTestId("google-drive-backup-import-input").setInputFiles({
    name: "not-a-backup.json",
    mimeType: "application/json",
    buffer: Buffer.from("{ bad json", "utf8")
  });

  await expect(page.locator("#tracker-notice")).toContainText("備份檔解析失敗", { timeout: STEP_TIMEOUT });
  await expect(page.getByTestId("google-drive-backup-preview")).toContainText("備份檔解析失敗", { timeout: STEP_TIMEOUT });
  await expect(page.getByTestId("google-drive-backup-merge")).toHaveCount(0);
});

test("safe merge restores learner records, warns on seed mismatch, and stays idempotent", async ({ page }) => {
  await gotoProductionTracker(page);
  const seeded = await seedLearnerSnapshot(page, "merge");
  const payload = await page.evaluate(() => window.VocabTracker.buildGoogleDriveBackupPayload("old phone"));
  payload.seed_version = "toeic_vocab_tracker_old_device_2026_01_01";

  await gotoProductionTracker(page);
  await setTrackerView(page, "export");
  await selectBackupFile(page, payload);
  await expect(page.getByTestId("google-drive-backup-preview")).toBeVisible({ timeout: STEP_TIMEOUT });
  await expect(page.getByTestId("google-drive-backup-warnings")).toContainText("seed_version 不同", { timeout: STEP_TIMEOUT });
  await page.getByTestId("google-drive-backup-merge").click({ timeout: STEP_TIMEOUT });
  await expect(page.locator("#tracker-notice")).toContainText("Safe merge 完成", { timeout: STEP_TIMEOUT });

  const afterFirstMerge = await page.evaluate(async ({ ids, currentSeed }) => {
    const attempts = await window.VocabDB.getAll("attempts");
    const sessions = await window.VocabDB.getAll("sessions");
    const reviewQueue = await window.VocabDB.getAll("review_queue");
    const errorLogs = await window.VocabDB.getAll("error_logs");
    const lesson = await window.VocabDB.get("lessons", "V2-A-71");
    const item = await window.VocabDB.get("vocab_items", ids.itemId);
    const seedSetting = await window.VocabDB.get("settings", "seed_version");
    const highlights = JSON.parse(localStorage.getItem("toeic_vocab_word_highlights") || "[]");
    return {
      attempts: attempts.filter((row) => row.attempt_id === ids.attemptId).length,
      sessions: sessions.filter((row) => row.session_id === ids.sessionId).length,
      reviewQueue: reviewQueue.filter((row) => row.review_id === ids.reviewId).length,
      errorLogs: errorLogs.filter((row) => row.error_log_id === ids.errorLogId).length,
      lessonStatus: lesson.status,
      seenCount: item.seen_count,
      masteryScore: item.mastery_score,
      seedSetting: seedSetting.value,
      seedUnchanged: seedSetting.value === currentSeed,
      highlights: highlights.filter((row) => row.highlight_id === ids.highlightId).length
    };
  }, { ids: seeded, currentSeed: CURRENT_SEED_VERSION });

  expect(afterFirstMerge).toMatchObject({
    attempts: 1,
    sessions: 1,
    reviewQueue: 1,
    errorLogs: 1,
    lessonStatus: "completed",
    seedSetting: CURRENT_SEED_VERSION,
    seedUnchanged: true,
    highlights: 1
  });
  expect(afterFirstMerge.seenCount).toBeGreaterThanOrEqual(3);
  expect(afterFirstMerge.masteryScore).toBeGreaterThanOrEqual(72);

  await selectBackupFile(page, payload);
  await page.getByTestId("google-drive-backup-merge").click({ timeout: STEP_TIMEOUT });
  const afterSecondMerge = await page.evaluate(async ({ ids }) => {
    const attempts = await window.VocabDB.getAll("attempts");
    const sessions = await window.VocabDB.getAll("sessions");
    const highlights = JSON.parse(localStorage.getItem("toeic_vocab_word_highlights") || "[]");
    return {
      attempts: attempts.filter((row) => row.attempt_id === ids.attemptId).length,
      sessions: sessions.filter((row) => row.session_id === ids.sessionId).length,
      highlights: highlights.filter((row) => row.highlight_id === ids.highlightId).length
    };
  }, { ids: seeded });

  expect(afterSecondMerge).toEqual({ attempts: 1, sessions: 1, highlights: 1 });
});

test("two different device backups merge without losing either device records", async ({ page }) => {
  await gotoProductionTracker(page);
  const payloadA = await backupFromPage(page, "device_a");

  await gotoProductionTracker(page);
  const payloadB = await backupFromPage(page, "device_b");

  await gotoProductionTracker(page);
  await page.evaluate(async ({ a, b }) => {
    await window.VocabTracker.mergeGoogleDriveBackupPayload(a);
    await window.VocabTracker.mergeGoogleDriveBackupPayload(b);
  }, { a: payloadA, b: payloadB });

  const counts = await page.evaluate(async () => {
    const attempts = await window.VocabDB.getAll("attempts");
    const sessions = await window.VocabDB.getAll("sessions");
    return {
      attempts: attempts.filter((row) => row.attempt_id.startsWith("pw_backup_attempt_device_")).length,
      sessions: sessions.filter((row) => row.session_id.startsWith("pw_backup_session_device_")).length
    };
  });
  expect(counts).toEqual({ attempts: 2, sessions: 2 });
});

test("mobile export, file selection, preview, and safe merge are usable at 390px", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await gotoProductionTracker(page);
  const payload = await backupFromPage(page, "mobile");

  await gotoProductionTracker(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await setTrackerView(page, "export");

  const backupDownload = page.waitForEvent("download", {
    predicate: (download) => /^toeic_vocab_backup_\d{4}-\d{2}-\d{2}\.json$/.test(download.suggestedFilename()),
    timeout: APP_TIMEOUT
  });
  await page.getByTestId("google-drive-backup-export").click({ timeout: STEP_TIMEOUT });
  await backupDownload;

  await selectBackupFile(page, payload);
  await expect(page.getByTestId("google-drive-backup-preview")).toBeVisible({ timeout: STEP_TIMEOUT });
  await expect(page.getByTestId("google-drive-backup-plan")).toContainText("作答紀錄", { timeout: STEP_TIMEOUT });
  await expect(page.getByTestId("google-drive-backup-merge")).toBeVisible({ timeout: STEP_TIMEOUT });
  await page.getByTestId("google-drive-backup-merge").click({ timeout: STEP_TIMEOUT });
  await expect(page.locator("#tracker-notice")).toContainText("Safe merge 完成", { timeout: STEP_TIMEOUT });

  const width = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth
  }));
  expect(width.scrollWidth).toBeLessThanOrEqual(width.clientWidth + 1);
});
