import { test, expect, trackerSeed, waitForApp } from "./helpers/seed-idb";

const APP_TIMEOUT = 30_000;

test("speed timer: seeded speed_drill uses canonical 8-second countdown", async ({ page }) => {
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

  await page.reload({ waitUntil: "domcontentloaded", timeout: APP_TIMEOUT });
  await waitForApp(page);
  await page.waitForFunction(() => typeof window.VocabTracker?.startLesson === "function", { timeout: APP_TIMEOUT });

  await page.evaluate((lessonId) => {
    window.VocabTracker.startLesson(lessonId, { force: true });
    window.VocabTracker.setView("lesson");
  }, trackerSeed.lessonId);

  await expect(page.locator(".speed-mode")).toBeVisible({ timeout: APP_TIMEOUT });
  await expect(page.locator("#speed-countdown")).toHaveText("8", { timeout: APP_TIMEOUT });
  await expect(page.locator(".question-meta")).toContainText("目標 8s", { timeout: APP_TIMEOUT });
});