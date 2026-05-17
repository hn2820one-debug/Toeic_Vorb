import { test, expect, type Download } from "@playwright/test";
import fs from "node:fs";
import { clearIndexedDb, waitForApp } from "./helpers/seed-idb";

const APP_TIMEOUT = 20_000;
const STEP_TIMEOUT = 10_000;

async function answerQuestions(page, lessonId: string, count: number) {
  await page.evaluate(async (id) => {
    await window.VocabTracker.startLesson(id);
  }, lessonId);

  const questionText = page.locator(".question-text");
  const answerButtons = page.locator(".answer-button");
  await expect(questionText).toBeVisible({ timeout: STEP_TIMEOUT });
  await expect(answerButtons).toHaveCount(4, { timeout: STEP_TIMEOUT });

  for (let index = 0; index < count; index += 1) {
    await expect(answerButtons.first()).toBeEnabled({ timeout: STEP_TIMEOUT });
    await answerButtons.first().click({ timeout: STEP_TIMEOUT });
    const confirmButton = page.getByRole("button", { name: "Confirm Answer" });
    await expect(confirmButton).toBeEnabled({ timeout: STEP_TIMEOUT });
    await confirmButton.click({ timeout: STEP_TIMEOUT });
    const advanceButton = page.getByRole("button", { name: /Next Question|See Summary/ });
    await expect(advanceButton).toBeVisible({ timeout: STEP_TIMEOUT });
    await advanceButton.click({ timeout: STEP_TIMEOUT });
  }

  const attemptCount = await page.evaluate(async (id) => {
    const attempts = await window.VocabDB.getByIndex("attempts", "lesson_id", id);
    return attempts.length;
  }, lessonId);
  expect(attemptCount).toBeGreaterThanOrEqual(count);

  await page.evaluate(async () => {
    await window.VocabTracker.clearActiveSession();
  });
}

async function readDownloadText(download: Download, targetPath: string) {
  const failure = await download.failure();
  if (failure) throw new Error(`Download failed for ${download.suggestedFilename()}: ${failure}`);
  const sourcePath = await download.path();
  const filePath = sourcePath || targetPath;
  for (let attempt = 0; attempt < 20; attempt += 1) {
    try {
      const text = fs.readFileSync(filePath, "utf8");
      if (text.length) return text;
    } catch (err) {
      if (attempt === 19) throw err;
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  return "";
}

test("production content: V2 and V3 seed and runtime record attempts", async ({ page }, testInfo) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, "showDirectoryPicker", {
      configurable: true,
      writable: true,
      value: async () => {
        throw new DOMException("User aborted picker", "AbortError");
      }
    });
  });

  await clearIndexedDb(page);
  await page.goto("/tracker.html?pw-v2-v3-content=1", { waitUntil: "domcontentloaded", timeout: APP_TIMEOUT });
  await waitForApp(page);

  const summary = await page.evaluate(async () => {
    const [lessons, questions] = await Promise.all([
      window.VocabDB.getAll("lessons"),
      window.VocabDB.getAll("questions")
    ]);
    const lessonsByStage = lessons.reduce((map, lesson) => {
      map[lesson.stage] = (map[lesson.stage] || 0) + 1;
      return map;
    }, {});
    const questionsByStage = questions.reduce((map, question) => {
      map[question.stage] = (map[question.stage] || 0) + 1;
      return map;
    }, {});
    return { lessonsByStage, questionsByStage };
  });

  expect(summary.lessonsByStage.V2).toBe(60);  // 50 core + 10 mixed review
  expect(summary.lessonsByStage.V3).toBe(72);  // 60 core + 12 mixed review
  expect(summary.questionsByStage.V2).toBe(1200);
  expect(summary.questionsByStage.V3).toBe(1440);

  const representativeLessons = [
    "V2-A-71",
    "V2-C-91",
    "V2-E-111",
    "V3-A-121",
    "V3-D-151",
    "V3-F-171"
  ];

  for (const lessonId of representativeLessons) {
    await answerQuestions(page, lessonId, 6);
  }

  const totalAttempts = await page.evaluate(async () => {
    const attempts = await window.VocabDB.getAll("attempts");
    return attempts.length;
  });
  expect(totalAttempts).toBeGreaterThanOrEqual(36);

  await page.evaluate(() => window.VocabTracker.setView("export"));
  const exportPackageButton = page.getByRole("button", { name: "Export for ChatGPT Analysis" });
  await expect(exportPackageButton).toBeVisible({ timeout: STEP_TIMEOUT });

  const downloads: Download[] = [];
  page.on("download", (download) => downloads.push(download));
  await exportPackageButton.click({ timeout: STEP_TIMEOUT });

  await expect.poll(() => downloads.some((download) => download.suggestedFilename().endsWith("_attempts.csv")), {
    timeout: APP_TIMEOUT
  }).toBeTruthy();
  await expect.poll(() => downloads.some((download) => download.suggestedFilename().endsWith("_raw_events.jsonl")), {
    timeout: APP_TIMEOUT
  }).toBeTruthy();

  const attemptsDownload = downloads.find((download) => download.suggestedFilename().endsWith("_attempts.csv"));
  const rawEventsDownload = downloads.find((download) => download.suggestedFilename().endsWith("_raw_events.jsonl"));
  expect(attemptsDownload).toBeTruthy();
  expect(rawEventsDownload).toBeTruthy();

  const attemptsText = await readDownloadText(attemptsDownload!, testInfo.outputPath("attempts.csv"));
  const rawEventsText = await readDownloadText(rawEventsDownload!, testInfo.outputPath("raw_events.jsonl"));
  for (const lessonId of representativeLessons) {
    expect(attemptsText).toContain(lessonId);
    expect(rawEventsText).toContain(lessonId);
  }
  expect(attemptsText).toContain("scene_vocabulary");
  expect(attemptsText).toContain("part6_context_choice");
});
