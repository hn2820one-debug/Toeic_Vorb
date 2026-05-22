import type { Download, Page } from "@playwright/test";
import fs from "node:fs/promises";
import { test, expect, trackerSeed, waitForApp } from "./helpers/seed-idb";

const APP_TIMEOUT = 30_000;
const STEP_TIMEOUT = 10_000;
const COURSE_ID = "toeic_vocab_v1";

// Seeded fixture regression coverage only. Production-empty flows live in ui-regression.spec.ts.

async function setTrackerView(page: Page, view: string) {
  await page.evaluate((targetView) => window.VocabTracker.setView(targetView), view);
}

async function reloadSeededTracker(page: Page) {
  await page.reload({ waitUntil: "domcontentloaded", timeout: APP_TIMEOUT });
  await waitForApp(page);
  await page.waitForFunction(() => typeof window.VocabTracker?.setView === "function", { timeout: APP_TIMEOUT });
}

async function readDownloadJson(download: Download) {
  const failure = await download.failure();
  if (failure) throw new Error(`Download failed for ${download.suggestedFilename()}: ${failure}`);

  const downloadedPath = await download.path();
  expect(downloadedPath).toBeTruthy();

  for (let attempt = 0; attempt < 20; attempt += 1) {
    try {
      const text = await fs.readFile(downloadedPath, "utf8");
      if (text.length) return JSON.parse(text);
    } catch (error) {
      if (attempt === 19) throw error;
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  throw new Error(`Downloaded file was empty for ${download.suggestedFilename()}`);
}

async function seedV0DiagnosticData(page: Page, attemptCount = 20) {
  await page.evaluate(async ({ courseId, userId, attemptCount }) => {
    const curriculum = await window.VocabDB.get("curriculum", courseId);
    await window.VocabDB.put("curriculum", {
      ...curriculum,
      stages: [
        { stage: "V0", stage_name: "Diagnosis", total_lessons: 1, status: "available" },
        ...(curriculum.stages || []).filter((stage) => stage.stage !== "V0")
      ]
    });

    const questionIds = Array.from({ length: 20 }, (_row, index) => `pw_v0_q_${String(index + 1).padStart(3, "0")}`);
    await window.VocabDB.put("lessons", {
      lesson_id: "PW-V0-001",
      lesson_number: 0,
      stage: "V0",
      stage_name: "Diagnosis",
      title: "Playwright V0 Diagnostic",
      lesson_type: "diagnostic",
      status: "completed",
      estimated_minutes: 10,
      grammar_link_id: "wf_accurate",
      question_ids: questionIds,
      review_question_ids: []
    });

    for (const [index, questionId] of questionIds.entries()) {
      const targetItemId = `item_v0_${String(index + 1).padStart(3, "0")}`;
      await window.VocabDB.put("questions", {
        question_id: questionId,
        lesson_id: "PW-V0-001",
        stage: "V0",
        type: "meaning_choice",
        skill: "meaning_choice",
        subskill: "diagnostic",
        grammar_link_id: "wf_accurate",
        question_text: `Seeded V0 diagnostic question ${index + 1}`,
        options: { A: "correct", B: "late", C: "cheap", D: "silent" },
        correct_answer: "A",
        explanation_zh: "Seeded V0 diagnostic question.",
        target_item_id: targetItemId,
        distractor_type: "toeic_realistic",
        difficulty: 1,
        estimated_time_seconds: 10,
        default_error_code: "VOCAB_UNKNOWN",
        tags: ["playwright", "seed", "v0"]
      });

      if (index >= attemptCount) continue;
      await window.VocabDB.put("attempts", {
        attempt_id: `pw_v0_att_${String(index + 1).padStart(3, "0")}`,
        timestamp: window.VocabScoring.localIso(),
        user_id: userId,
        course_id: courseId,
        stage: "V0",
        lesson_id: "PW-V0-001",
        step: "diagnostic",
        session_id: "pw_v0_ready_session",
        question_id: questionId,
        question_type: "meaning_choice",
        correct_answer: "A",
        user_answer: "A",
        is_correct: true,
        response_time_seconds: 4,
        speed_bucket: "fast_correct",
        error_code: null,
        default_error_code: "VOCAB_UNKNOWN",
        is_repeated_error: false,
        review_priority: 0,
        mode: "blind_drill",
        review_ids: [],
        review_filter: null,
        target_item_id: targetItemId,
        grammar_link_id: "wf_accurate"
      });
    }
  }, {
    courseId: COURSE_ID,
    userId: trackerSeed.userId,
    attemptCount
  });

  await reloadSeededTracker(page);
}

async function seedStageGateScenario(page: Page) {
  await page.evaluate(async (courseId) => {
    const curriculum = await window.VocabDB.get("curriculum", courseId);
    await window.VocabDB.put("curriculum", {
      ...curriculum,
      stages: [
        { stage: "V0", stage_name: "Diagnosis", total_lessons: 1, status: "available" },
        ...(curriculum.stages || []).filter((stage) => stage.stage !== "V0")
      ]
    });
  }, COURSE_ID);

  await reloadSeededTracker(page);
}

async function seedSpeedLessonScenario(page: Page) {
  await page.evaluate(async ({ lessonId, speedQuestionId }) => {
    const lesson = await window.VocabDB.get("lessons", lessonId);
    const question = await window.VocabDB.get("questions", speedQuestionId);

    await window.VocabDB.put("lessons", {
      ...lesson,
      lesson_type: "speed_drill",
      question_ids: [speedQuestionId],
      review_question_ids: []
    });

    await window.VocabDB.put("questions", {
      ...question,
      estimated_time_seconds: 8
    });
  }, {
    lessonId: trackerSeed.lessonId,
    speedQuestionId: trackerSeed.questionIds[4]
  });

  await reloadSeededTracker(page);
}

test("today dashboard: seeded V0 attempts produce diagnostic recommendation and ready V0 seal", async ({ page }) => {
  await seedV0DiagnosticData(page);

  const v0SealCard = page.getByTestId("stage-seal-card-V0");
  await expect(page.getByTestId("empty-seed-banner")).toHaveCount(0);
  await expect(page.getByTestId("diagnostic-recommendation")).toBeVisible({ timeout: STEP_TIMEOUT });
  await expect(page.getByTestId("diagnostic-recommendation")).toContainText("整體", { timeout: STEP_TIMEOUT });
  await expect(page.getByTestId("diagnostic-recommendation")).toContainText("建議先從", { timeout: STEP_TIMEOUT });
  await expect(v0SealCard).toContainText("可封關", { timeout: STEP_TIMEOUT });
  await expect(v0SealCard).toContainText("近期正確率", { timeout: STEP_TIMEOUT });
  await expect(v0SealCard).toContainText("100%", { timeout: STEP_TIMEOUT });
});

test("today dashboard: partial V0 attempts show insufficient diagnostic data", async ({ page }) => {
  await seedV0DiagnosticData(page, 5);

  const diagnostic = page.getByTestId("diagnostic-recommendation");
  await expect(diagnostic).toBeVisible({ timeout: STEP_TIMEOUT });
  await expect(diagnostic).toContainText("V0 診斷資料不足", { timeout: STEP_TIMEOUT });
  await expect(diagnostic).toContainText("5/20 次作答", { timeout: STEP_TIMEOUT });
  await expect(diagnostic).toContainText("暫不產生分流建議", { timeout: STEP_TIMEOUT });
  await expect(diagnostic).not.toContainText("建議先從", { timeout: STEP_TIMEOUT });
});

test("export: partial V0 diagnostic reports insufficient data", async ({ page }) => {
  await seedV0DiagnosticData(page, 5);
  await setTrackerView(page, "export");

  const diagnosticDownload = page.waitForEvent("download", {
    predicate: (download) => download.suggestedFilename() === "diagnostic_recommendation.json",
    timeout: APP_TIMEOUT
  });
  await page.getByRole("button", { name: "diagnostic_recommendation.json" }).click({ timeout: STEP_TIMEOUT });
  const download = await diagnosticDownload;
  const payload = await readDownloadJson(download);

  expect(payload.status).toBe("insufficient_data");
  expect(payload.attempt_count).toBe(5);
  expect(payload.min_required_attempts).toBe(20);
  expect(payload.remaining_attempts).toBe(15);
  expect(payload.recommended_stage).toBeUndefined();
});

test("stage seal: no-data V0 shows a data warning before seeded V1", async ({ page }) => {
  await seedStageGateScenario(page);

  const v0SealCard = page.getByTestId("stage-seal-card-V0");
  await expect(v0SealCard).toContainText("無資料", { timeout: STEP_TIMEOUT });
  await expect(v0SealCard).toContainText("尚未載入課程資料", { timeout: STEP_TIMEOUT });

  await page.evaluate((lessonId) => window.VocabTracker.startLesson(lessonId), trackerSeed.lessonId);

  const warning = page.getByTestId("stage-gate-warning");
  await expect(warning).toBeVisible({ timeout: STEP_TIMEOUT });
  await expect(warning).toContainText("V0", { timeout: STEP_TIMEOUT });
  await expect(warning).toContainText("階段資料不足", { timeout: STEP_TIMEOUT });
  await expect(warning).toContainText("尚無足夠資料可判斷", { timeout: STEP_TIMEOUT });
  await expect(page.getByTestId("stage-gate-reasons")).toContainText("目前缺少的資料", { timeout: STEP_TIMEOUT });
  await expect(page.getByTestId("stage-gate-reasons")).toContainText("尚未載入課程資料", { timeout: STEP_TIMEOUT });
  await expect(warning.getByRole("button", { name: "查看課程地圖" })).toBeVisible({ timeout: STEP_TIMEOUT });
  await expect(warning.getByRole("button", { name: "先去複習模式" })).toHaveCount(0);
});

test("stage seal: partial V0 data stays not-ready instead of no-data", async ({ page }) => {
  await seedV0DiagnosticData(page, 5);

  const v0SealCard = page.getByTestId("stage-seal-card-V0");
  await expect(v0SealCard).toContainText("未達標", { timeout: STEP_TIMEOUT });
  await expect(v0SealCard).toContainText("需至少 20 次作答（目前 5）", { timeout: STEP_TIMEOUT });

  await page.evaluate((lessonId) => window.VocabTracker.startLesson(lessonId), trackerSeed.lessonId);

  const warning = page.getByTestId("stage-gate-warning");
  await expect(warning).toBeVisible({ timeout: STEP_TIMEOUT });
  await expect(warning).toContainText("階段準備度檢查", { timeout: STEP_TIMEOUT });
  await expect(warning).toContainText("尚未達到就緒條件", { timeout: STEP_TIMEOUT });
  await expect(page.getByTestId("stage-gate-reasons")).toContainText("需至少 20 次作答（目前 5）", { timeout: STEP_TIMEOUT });
  await expect(warning.getByRole("button", { name: "先去複習模式" })).toBeVisible({ timeout: STEP_TIMEOUT });
});

test("stage seal: Continue Anyway starts the seeded lesson without blocking", async ({ page }) => {
  await seedStageGateScenario(page);
  await page.evaluate((lessonId) => window.VocabTracker.startLesson(lessonId), trackerSeed.lessonId);
  await expect(page.getByTestId("stage-gate-warning")).toBeVisible({ timeout: STEP_TIMEOUT });

  await page.getByTestId("stage-gate-continue").click();
  await expect(page.locator(".runtime-shell")).toBeVisible({ timeout: APP_TIMEOUT });
});

test("stage seal: Go to Review Mode redirects when no items are due", async ({ page }) => {
  await seedV0DiagnosticData(page, 5);
  await page.evaluate((lessonId) => window.VocabTracker.startLesson(lessonId), trackerSeed.lessonId);
  await expect(page.getByTestId("stage-gate-warning")).toBeVisible({ timeout: STEP_TIMEOUT });

  await page.getByRole("button", { name: "先去複習模式" }).click();
  await expect(page.locator("#tracker-tabs .tracker-tab.active")).toContainText(/複習/, { timeout: STEP_TIMEOUT });
});

test("stage seal: Cancel returns user to Today view", async ({ page }) => {
  await seedStageGateScenario(page);
  await page.evaluate((lessonId) => window.VocabTracker.startLesson(lessonId), trackerSeed.lessonId);
  await expect(page.getByTestId("stage-gate-warning")).toBeVisible({ timeout: STEP_TIMEOUT });

  await page.getByRole("button", { name: "取消" }).click();
  await expect(page.locator(".tracker-tab.active")).toContainText(/今日/, { timeout: STEP_TIMEOUT });
});

test("speed mode: seeded speed lesson opens runtime with speed-mode class and countdown visible", async ({ page }) => {
  await seedSpeedLessonScenario(page);
  await page.evaluate((lessonId) => window.VocabTracker.startLesson(lessonId, { force: true }), trackerSeed.lessonId);
  await setTrackerView(page, "lesson");

  await expect(page.locator(".speed-mode")).toBeVisible({ timeout: APP_TIMEOUT });
  await expect(page.locator("#speed-countdown")).toBeVisible({ timeout: STEP_TIMEOUT });
});

test("speed mode: clicking answer auto-advances without Confirm button", async ({ page }) => {
  await seedSpeedLessonScenario(page);
  await page.evaluate((lessonId) => window.VocabTracker.startLesson(lessonId, { force: true }), trackerSeed.lessonId);
  await setTrackerView(page, "lesson");

  await expect(page.locator(".speed-mode")).toBeVisible({ timeout: APP_TIMEOUT });
  await expect(page.locator(".confirm-answer-row")).toHaveCount(0);

  const firstAnswer = page.locator(".answer-button").first();
  await expect(firstAnswer).toBeVisible({ timeout: STEP_TIMEOUT });
  await firstAnswer.click();

  await expect(page.locator(".feedback-banner")).toHaveCount(0);
  await expect(page.locator(".runtime-shell")).toBeVisible({ timeout: STEP_TIMEOUT });
});

test("normal lesson: seeded non-speed lesson shows Confirm Answer button", async ({ page }) => {
  await page.evaluate((lessonId) => window.VocabTracker.startLesson(lessonId, { force: true }), trackerSeed.lessonId);
  await setTrackerView(page, "lesson");

  await expect(page.locator(".runtime-shell")).toBeVisible({ timeout: APP_TIMEOUT });
  await expect(page.locator(".speed-mode")).toHaveCount(0);

  const firstAnswer = page.locator(".answer-button").first();
  await expect(firstAnswer).toBeVisible({ timeout: STEP_TIMEOUT });
  await firstAnswer.click();

  await expect(page.locator(".confirm-answer-row")).toBeVisible({ timeout: STEP_TIMEOUT });
});
