import { test, expect } from "@playwright/test";
import { clearAndSeedIndexedDb, trackerSeed } from "./helpers/seed-idb";

const APP_TIMEOUT = 15_000;
const STEP_TIMEOUT = 10_000;

test.beforeEach(async ({ page }) => {
  await clearAndSeedIndexedDb(page);
});

test("lesson flow: start lesson, answer every question, and finish into error review", async ({ page }) => {
  await page.goto("/tracker.html?pw-lesson-flow=1", { waitUntil: "domcontentloaded", timeout: APP_TIMEOUT });
  await page.waitForSelector("#tracker-tabs", { state: "visible", timeout: APP_TIMEOUT });
  await page.waitForFunction(() => typeof window.VocabTracker?.setView === "function", { timeout: APP_TIMEOUT });

  await page.evaluate(() => window.VocabTracker.setView("lesson"));

  const startLessonButton = page.getByRole("button", { name: "Start Current Lesson" });
  await expect(startLessonButton).toBeVisible({ timeout: STEP_TIMEOUT });
  await startLessonButton.click({ timeout: STEP_TIMEOUT });

  const questionText = page.locator(".question-text");
  const answerButtons = page.locator(".answer-button");
  const lessonElapsed = page.locator("#lesson-elapsed");

  await expect(questionText).toBeVisible({ timeout: STEP_TIMEOUT });
  await expect(answerButtons).toHaveCount(4, { timeout: STEP_TIMEOUT });
  await page.waitForFunction(() => {
    const timer = document.getElementById("lesson-elapsed");
    return !!timer && (timer.textContent || "").trim() !== "0:00";
  }, { timeout: STEP_TIMEOUT });
  await expect(lessonElapsed).not.toHaveText("0:00", { timeout: STEP_TIMEOUT });

  for (let index = 0; index < trackerSeed.questionIds.length; index += 1) {
    await expect(questionText).toBeVisible({ timeout: STEP_TIMEOUT });
    await expect(answerButtons).toHaveCount(4, { timeout: STEP_TIMEOUT });

    const currentQuestionText = ((await questionText.textContent()) || "").trim();
    const firstAnswerButton = answerButtons.first();
    await expect(firstAnswerButton).toBeEnabled({ timeout: STEP_TIMEOUT });
    await firstAnswerButton.click({ timeout: STEP_TIMEOUT });

    // Feedback panel appears — wait for the advance button and click it
    const advanceButton = page.getByRole("button", { name: /Next Question|See Summary/ });
    await expect(advanceButton).toBeVisible({ timeout: STEP_TIMEOUT });
    await advanceButton.click({ timeout: STEP_TIMEOUT });

    if (index < trackerSeed.questionIds.length - 1) {
      await page.waitForFunction((questionTextValue) => {
        const currentQuestion = document.querySelector(".question-text");
        return !!currentQuestion && currentQuestion.textContent?.trim() !== questionTextValue;
      }, currentQuestionText, { timeout: STEP_TIMEOUT });
      await expect(questionText).not.toHaveText(currentQuestionText, { timeout: STEP_TIMEOUT });
    }
  }

  const finishLessonButton = page.getByRole("button", { name: "Finish Lesson" });
  await expect(finishLessonButton).toBeVisible({ timeout: STEP_TIMEOUT });
  await finishLessonButton.click({ timeout: STEP_TIMEOUT });

  const errorReviewHeading = page.locator(".tracker-panel h3", { hasText: "Error Review" });
  await expect(errorReviewHeading).toBeVisible({ timeout: APP_TIMEOUT });
});