import { test, expect, type Page } from "@playwright/test";
import { gotoSeededTracker, trackerSeed } from "./helpers/seed-idb";

const APP_TIMEOUT = 15_000;
const STEP_TIMEOUT = 10_000;

async function seedReviewQueue(page: Page) {
  await page.evaluate(async ({ questionIds }) => {
    const today = window.VocabScoring.localDate();
    for (let index = 0; index < questionIds.length; index += 1) {
      const question = await window.VocabDB.get("questions", questionIds[index]);
      await window.VocabDB.put("review_queue", {
        review_id: `pw_review_${index + 1}`,
        item_id: question.target_item_id,
        question_ids: [question.question_id],
        reason: index === 0 ? "repeated_error" : "lesson_error",
        priority: index === 0 ? 5 : 3,
        due_date: today,
        status: "pending",
        created_at: window.VocabScoring.localIso(),
        updated_at: window.VocabScoring.localIso()
      });
    }
  }, { questionIds: trackerSeed.questionIds });
}

async function answerCurrentCorrect(page: Page) {
  const correctAnswer = await page.evaluate(async () => {
    const session = window.VocabDB.loadActiveSession();
    const questionId = session.question_ids[session.current_index || 0];
    const question = await window.VocabDB.get("questions", questionId);
    return question.correct_answer;
  });
  const index = "ABCD".indexOf(correctAnswer);
  await expect(page.locator(".answer-button").nth(index)).toBeEnabled({ timeout: STEP_TIMEOUT });
  await page.locator(".answer-button").nth(index).click({ timeout: STEP_TIMEOUT });
  const confirmButton = page.getByRole("button", { name: "確認答案" });
  await expect(confirmButton).toBeEnabled({ timeout: STEP_TIMEOUT });
  await confirmButton.click({ timeout: STEP_TIMEOUT });
  const advanceButton = page.getByRole("button", { name: /下一題|查看摘要/ });
  await expect(advanceButton).toBeVisible({ timeout: STEP_TIMEOUT });
  await advanceButton.click({ timeout: STEP_TIMEOUT });
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, "showDirectoryPicker", {
      configurable: true,
      writable: true,
      value: async () => {
        throw new DOMException("User aborted picker", "AbortError");
      }
    });
  });
});

test("review mode: due queue creates review attempts and export effectiveness", async ({ page }) => {
  await gotoSeededTracker(page);
  await seedReviewQueue(page);
  await page.reload({ waitUntil: "domcontentloaded", timeout: APP_TIMEOUT });
  await page.waitForFunction(() => typeof window.VocabTracker?.setView === "function", { timeout: APP_TIMEOUT });

  await page.evaluate(() => window.VocabTracker.setView("mistakes"));
  await expect(page.locator(".tracker-panel h3", { hasText: "複習模式" })).toBeVisible({ timeout: STEP_TIMEOUT });

  const startReview = page.getByRole("button", { name: /開始複習 \(5\)/ });
  await expect(startReview).toBeVisible({ timeout: STEP_TIMEOUT });
  await startReview.click({ timeout: STEP_TIMEOUT });

  await expect(page.locator(".runtime-head h2")).toContainText("複習模式", { timeout: STEP_TIMEOUT });
  for (let index = 0; index < trackerSeed.questionIds.length; index += 1) {
    await answerCurrentCorrect(page);
  }

  const finishReview = page.getByRole("button", { name: "完成複習" });
  await expect(finishReview).toBeVisible({ timeout: STEP_TIMEOUT });
  await finishReview.click({ timeout: STEP_TIMEOUT });
  await expect(page.locator(".tracker-panel h3", { hasText: "複習模式" })).toBeVisible({ timeout: APP_TIMEOUT });

  const reviewState = await page.evaluate(async () => {
    const attempts = await window.VocabDB.getAll("attempts");
    const sessions = await window.VocabDB.getAll("sessions");
    const queue = await window.VocabDB.getAll("review_queue");
    return {
      reviewAttempts: attempts.filter((attempt) => attempt.mode === "review_queue"),
      reviewSessions: sessions.filter((session) => session.mode === "review_queue"),
      queue
    };
  });

  expect(reviewState.reviewAttempts).toHaveLength(trackerSeed.questionIds.length);
  expect(reviewState.reviewAttempts.every((attempt) => attempt.step === "review_queue")).toBe(true);
  expect(reviewState.reviewAttempts.every((attempt) => attempt.is_correct)).toBe(true);
  expect(reviewState.reviewSessions).toHaveLength(1);
  expect(reviewState.reviewSessions[0].lesson_id).toBe("REVIEW_QUEUE");
  expect(reviewState.queue.every((entry) => entry.status === "done")).toBe(true);
  expect(reviewState.queue.every((entry) => entry.review_status === "fixed")).toBe(true);

  await page.evaluate(() => window.VocabTracker.setView("export"));
  const effectivenessButton = page.getByRole("button", { name: "review_effectiveness.csv" });
  await expect(effectivenessButton).toBeVisible({ timeout: STEP_TIMEOUT });
  await page.evaluate(() => {
    window.__pwDownloadedText = null;
    window.VocabScoring.downloadText = (filename, content) => {
      window.__pwDownloadedText = { filename, content };
    };
  });
  await effectivenessButton.click({ timeout: STEP_TIMEOUT });
  const downloaded = await page.waitForFunction(() => window.__pwDownloadedText, null, { timeout: APP_TIMEOUT });
  const effectivenessCsv = await downloaded.evaluate((value) => value.content);

  expect(effectivenessCsv).toContain("group_type");
  expect(effectivenessCsv).toContain("target_item");
  expect(effectivenessCsv).toContain("error_code");
  expect(effectivenessCsv).toContain("1");
});
