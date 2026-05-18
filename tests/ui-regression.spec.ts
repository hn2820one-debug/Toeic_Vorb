import { test, expect, type Page } from "@playwright/test";
import { clearIndexedDb, waitForApp } from "./helpers/seed-idb";

const APP_TIMEOUT = 30_000;
const STEP_TIMEOUT = 10_000;

async function gotoProductionTracker(page: Page) {
  await clearIndexedDb(page);
  await page.goto("/tracker.html?pw-ui-regression=1", { waitUntil: "domcontentloaded", timeout: APP_TIMEOUT });
  await waitForApp(page);
  await page.waitForFunction(() => typeof window.VocabTracker?.setView === "function", { timeout: APP_TIMEOUT });
}

async function setTrackerView(page: Page, view: string) {
  await page.evaluate((targetView) => window.VocabTracker.setView(targetView), view);
}

async function seedReadyV0Attempts(page: Page) {
  await page.evaluate(async () => {
    const questions = (await window.VocabDB.getAll("questions"))
      .filter((question) => question.stage === "V0")
      .slice(0, 20);

    for (const [index, question] of questions.entries()) {
      await window.VocabDB.put("attempts", {
        attempt_id: `pw_v0_ready_${String(index + 1).padStart(2, "0")}`,
        timestamp: window.VocabScoring.localIso(),
        user_id: "Keith",
        course_id: window.VocabDB.COURSE_ID,
        stage: "V0",
        lesson_id: question.lesson_id,
        step: "diagnostic",
        session_id: "pw_v0_ready_session",
        question_id: question.question_id,
        question_type: question.type,
        correct_answer: question.correct_answer,
        user_answer: question.correct_answer,
        is_correct: true,
        response_time_seconds: Math.max(1, Math.min(5, Number(question.estimated_time_seconds || 10) / 2)),
        speed_bucket: "fast_correct",
        error_code: null,
        default_error_code: question.default_error_code,
        is_repeated_error: false,
        review_priority: 0,
        mode: "blind_drill",
        review_ids: [],
        review_filter: null,
        target_item_id: question.target_item_id,
        grammar_link_id: question.grammar_link_id || null
      });
    }

    const lesson = await window.VocabDB.get("lessons", "V0-1");
    if (lesson) {
      await window.VocabDB.put("lessons", { ...lesson, status: "completed" });
    }
  });
}

test("roadmap filters: controls render, filter lessons, and clear", async ({ page }) => {
  await gotoProductionTracker(page);
  await setTrackerView(page, "roadmap");

  await expect(page.locator(".tracker-panel h3", { hasText: "課程地圖" })).toBeVisible({ timeout: STEP_TIMEOUT });

  const stageFilter = page.getByTestId("roadmap-filter-stage");
  const statusFilter = page.getByTestId("roadmap-filter-status");
  const typeFilter = page.getByTestId("roadmap-filter-lesson_type");
  const summary = page.getByTestId("roadmap-summary");
  const lessonRows = page.getByTestId("roadmap-lesson-row");

  await expect(stageFilter).toBeVisible({ timeout: STEP_TIMEOUT });
  await expect(statusFilter).toBeVisible({ timeout: STEP_TIMEOUT });
  await expect(typeFilter).toBeVisible({ timeout: STEP_TIMEOUT });
  await expect(summary).toContainText("193/193 課顯示中", { timeout: STEP_TIMEOUT });
  await expect(lessonRows).toHaveCount(193, { timeout: STEP_TIMEOUT });

  await stageFilter.selectOption("V2");
  await expect(summary).toContainText("60/193 課顯示中", { timeout: STEP_TIMEOUT });
  await expect(lessonRows).toHaveCount(60, { timeout: STEP_TIMEOUT });

  await typeFilter.selectOption("mixed_review");
  await expect(summary).toContainText("10/193 課顯示中", { timeout: STEP_TIMEOUT });
  await expect(lessonRows).toHaveCount(10, { timeout: STEP_TIMEOUT });

  await page.getByRole("button", { name: "清除篩選" }).click({ timeout: STEP_TIMEOUT });
  await expect(summary).toContainText("193/193 課顯示中", { timeout: STEP_TIMEOUT });
  await expect(lessonRows).toHaveCount(193, { timeout: STEP_TIMEOUT });
});

test("today dashboard: Stage Seal Readiness survives empty and populated V0 attempts", async ({ page }) => {
  await gotoProductionTracker(page);

  const stageSealPanel = page.getByTestId("stage-seal-readiness");
  const v0SealCard = page.getByTestId("stage-seal-card-V0");

  await expect(stageSealPanel).toBeVisible({ timeout: STEP_TIMEOUT });
  await expect(stageSealPanel).toContainText("階段封關準備度", { timeout: STEP_TIMEOUT });
  await expect(v0SealCard).toContainText("開放中", { timeout: STEP_TIMEOUT });
  await expect(v0SealCard).toContainText("需至少 20 次作答", { timeout: STEP_TIMEOUT });
  await expect(page.getByTestId("diagnostic-recommendation")).toHaveCount(0);

  await seedReadyV0Attempts(page);
  await page.reload({ waitUntil: "domcontentloaded", timeout: APP_TIMEOUT });
  await waitForApp(page);

  await expect(page.getByTestId("diagnostic-recommendation")).toBeVisible({ timeout: STEP_TIMEOUT });
  await expect(page.getByTestId("diagnostic-recommendation")).toContainText("整體", { timeout: STEP_TIMEOUT });
  await expect(page.getByTestId("diagnostic-recommendation")).toContainText("建議先從", { timeout: STEP_TIMEOUT });
  await expect(v0SealCard).toContainText("可封關", { timeout: STEP_TIMEOUT });
  await expect(v0SealCard).toContainText("近期正確率", { timeout: STEP_TIMEOUT });
  await expect(v0SealCard).toContainText("100%", { timeout: STEP_TIMEOUT });
});

test("export inventory: expected analysis files are visible without downloading", async ({ page }) => {
  await gotoProductionTracker(page);
  await setTrackerView(page, "export");

  const inventory = page.getByTestId("export-file-inventory");
  await expect(page.locator(".tracker-panel h3", { hasText: "匯出總覽" })).toBeVisible({ timeout: STEP_TIMEOUT });
  await expect(inventory).toBeVisible({ timeout: STEP_TIMEOUT });

  for (const fileName of [
    "report.md",
    "summary.md",
    "lesson_recommendations.md",
    "diagnostic_recommendation.json",
    "stage_progress.json",
    "content_quality_summary.json",
    "attempts.csv",
    "attempts.json",
    "attempts.jsonl",
    "sessions.csv",
    "sessions.json",
    "item_mastery.csv",
    "mastery.json",
    "review_queue.json",
    "error_logs.json",
    "error_summary.csv",
    "error_summary.json",
    "speed_summary.json",
    "review_effectiveness.csv",
    "review_effectiveness.json",
    "stage_seal_readiness.json",
    "question_bank_snapshot.json",
    "raw_events.jsonl"
  ]) {
    await expect(page.getByRole("button", { name: fileName, exact: true })).toBeVisible({ timeout: STEP_TIMEOUT });
  }

  await expect(page.getByRole("button", { name: /^toeic_vocab_export_\d{4}-\d{2}-\d{2}\.json$/ })).toBeVisible({ timeout: STEP_TIMEOUT });
});

test("question bank: search, pagination, and seed JSON export controls render", async ({ page }) => {
  await gotoProductionTracker(page);
  await setTrackerView(page, "bank");

  await expect(page.locator(".tracker-panel h3", { hasText: "題庫管理" })).toBeVisible({ timeout: STEP_TIMEOUT });

  const searchInput = page.getByTestId("question-bank-search");
  const questionCount = page.getByTestId("question-bank-count");
  const rows = page.getByTestId("question-bank-row");

  await expect(searchInput).toBeVisible({ timeout: STEP_TIMEOUT });
  await expect(page.getByTestId("question-bank-local-warning")).toContainText("瀏覽器內的編輯只會寫進本機 IndexedDB", { timeout: STEP_TIMEOUT });
  await expect(questionCount).toContainText("4399", { timeout: STEP_TIMEOUT });
  await expect(page.getByTestId("question-bank-load-more")).toBeVisible({ timeout: STEP_TIMEOUT });
  await expect(page.getByTestId("question-bank-patch-export")).toBeVisible({ timeout: STEP_TIMEOUT });
  await expect(page.getByTestId("question-bank-seed-export")).toBeVisible({ timeout: STEP_TIMEOUT });
  await expect(rows).toHaveCount(120, { timeout: STEP_TIMEOUT });

  await searchInput.fill("v0_1_q_001");
  await expect(questionCount).toContainText("1", { timeout: STEP_TIMEOUT });
  await expect(rows).toHaveCount(1, { timeout: STEP_TIMEOUT });
  await expect(rows.first()).toContainText("v0_1_q_001", { timeout: STEP_TIMEOUT });
  await expect(page.getByTestId("question-bank-load-more")).toHaveCount(0);
});

test("stage seal: Today dashboard shows Wait checks with detail on not-ready stage", async ({ page }) => {
  await gotoProductionTracker(page);

  const v0Card = page.getByTestId("stage-seal-card-V0");
  await expect(v0Card).toBeVisible({ timeout: STEP_TIMEOUT });
  await expect(v0Card).toContainText("V0", { timeout: STEP_TIMEOUT });
  // With empty DB: lessons check fails (0/1 complete) and attempt-based checks show "need 20 attempts"
  await expect(v0Card).toContainText("待補", { timeout: STEP_TIMEOUT });
  await expect(v0Card).toContainText("0/1 已完成", { timeout: STEP_TIMEOUT });
  await expect(v0Card).toContainText("需至少 20 次作答", { timeout: STEP_TIMEOUT });
});

test("stage seal: attempting a V1 lesson when V0 is not ready shows soft warning", async ({ page }) => {
  await gotoProductionTracker(page);

  // Trigger gate by starting a V1 lesson with V0 not ready
  await page.evaluate(() => window.VocabTracker.startLesson("V1-A-11"));

  const warning = page.getByTestId("stage-gate-warning");
  await expect(warning).toBeVisible({ timeout: STEP_TIMEOUT });
  await expect(warning).toContainText("V0", { timeout: STEP_TIMEOUT });
  await expect(warning).toContainText("階段準備度檢查", { timeout: STEP_TIMEOUT });

  const reasons = page.getByTestId("stage-gate-reasons");
  await expect(reasons).toBeVisible({ timeout: STEP_TIMEOUT });
  await expect(reasons).toContainText("課程完成", { timeout: STEP_TIMEOUT });
});

test("stage seal: Continue Anyway starts the lesson without blocking", async ({ page }) => {
  await gotoProductionTracker(page);

  await page.evaluate(() => window.VocabTracker.startLesson("V1-A-11"));
  await expect(page.getByTestId("stage-gate-warning")).toBeVisible({ timeout: STEP_TIMEOUT });

  await page.getByTestId("stage-gate-continue").click();

  // Lesson runtime should be active now
  await expect(page.locator(".runtime-shell")).toBeVisible({ timeout: APP_TIMEOUT });
});

test("stage seal: Go to Review Mode redirects when no items are due", async ({ page }) => {
  await gotoProductionTracker(page);

  await page.evaluate(() => window.VocabTracker.startLesson("V1-A-11"));
  await expect(page.getByTestId("stage-gate-warning")).toBeVisible({ timeout: STEP_TIMEOUT });

  await page.getByRole("button", { name: "先去複習模式" }).click();

  // With empty DB there are no due items; app navigates to Mistakes view
  // Scope to the main nav bar only (not the review filter tabs inside Mistakes view)
  const activeTab = page.locator("#tracker-tabs .tracker-tab.active");
  await expect(activeTab).toContainText(/複習/, { timeout: STEP_TIMEOUT });
});

test("stage seal: Cancel returns user to Today view", async ({ page }) => {
  await gotoProductionTracker(page);

  await page.evaluate(() => window.VocabTracker.startLesson("V1-A-11"));
  await expect(page.getByTestId("stage-gate-warning")).toBeVisible({ timeout: STEP_TIMEOUT });

  await page.getByRole("button", { name: "取消" }).click();

  const activeTab = page.locator(".tracker-tab.active");
  await expect(activeTab).toContainText(/今日/, { timeout: STEP_TIMEOUT });
});

test("review mode: Mistakes view renders with heading and Start Review button", async ({ page }) => {
  await gotoProductionTracker(page);
  await setTrackerView(page, "mistakes");

  await expect(page.locator(".tracker-panel h3", { hasText: "複習模式" })).toBeVisible({ timeout: STEP_TIMEOUT });
  await expect(page.getByRole("button", { name: /開始複習/ })).toBeVisible({ timeout: STEP_TIMEOUT });
});

test("speed mode: V1-F-53 opens runtime with speed-mode class and countdown visible", async ({ page }) => {
  await gotoProductionTracker(page);

  // Force-start the speed drill lesson, bypassing stage gate
  await page.evaluate(() => window.VocabTracker.startLesson("V1-F-53", { force: true }));
  await setTrackerView(page, "lesson");

  await expect(page.locator(".speed-mode")).toBeVisible({ timeout: APP_TIMEOUT });
  await expect(page.locator("#speed-countdown")).toBeVisible({ timeout: STEP_TIMEOUT });
});

test("speed mode: clicking answer auto-advances without Confirm button", async ({ page }) => {
  await gotoProductionTracker(page);

  await page.evaluate(() => window.VocabTracker.startLesson("V1-F-53", { force: true }));
  await setTrackerView(page, "lesson");

  await expect(page.locator(".speed-mode")).toBeVisible({ timeout: APP_TIMEOUT });

  // No Confirm Answer button should be present in speed mode
  await expect(page.locator(".confirm-answer-row")).toHaveCount(0);

  // Click the first answer button — app should auto-advance (question key changes or summary appears)
  const firstAnswer = page.locator(".answer-button").first();
  await expect(firstAnswer).toBeVisible({ timeout: STEP_TIMEOUT });
  await firstAnswer.click();

  // After click, either next question or summary renders — no feedback screen
  await expect(page.locator(".feedback-banner")).toHaveCount(0);
  await expect(page.locator(".runtime-shell")).toBeVisible({ timeout: STEP_TIMEOUT });
});

test("normal lesson: non-speed-drill lesson shows Confirm Answer button", async ({ page }) => {
  await gotoProductionTracker(page);

  // Start a V1-A lesson (word_family, not speed_drill) bypassing gate
  await page.evaluate(() => window.VocabTracker.startLesson("V1-A-11", { force: true }));
  await setTrackerView(page, "lesson");

  // Select an answer to reveal the confirm button
  await expect(page.locator(".runtime-shell")).toBeVisible({ timeout: APP_TIMEOUT });
  await expect(page.locator(".speed-mode")).toHaveCount(0);

  const firstAnswer = page.locator(".answer-button").first();
  await expect(firstAnswer).toBeVisible({ timeout: STEP_TIMEOUT });
  await firstAnswer.click();

  await expect(page.locator(".confirm-answer-row")).toBeVisible({ timeout: STEP_TIMEOUT });
});
