import { test, expect } from "@playwright/test";
import { clearAndSeedIndexedDb, trackerSeed } from "./helpers/seed-idb";

const APP_TIMEOUT = 15_000;
const STEP_TIMEOUT = 10_000;

const mockSession = {
  session_id: "pw_session_export_001",
  date: "2026-05-14",
  user_id: trackerSeed.userId,
  course_id: "toeic_vocab_v1",
  stage: "V1",
  lesson_id: trackerSeed.lessonId,
  lesson_title: trackerSeed.lessonTitle,
  planned_minutes: 15,
  actual_minutes: 4.5,
  started_at: "2026-05-14T08:00:00+08:00",
  ended_at: "2026-05-14T08:04:30+08:00",
  total_questions: 5,
  correct_questions: 4,
  wrong_questions: 1,
  accuracy: 0.8,
  avg_response_time_seconds: 6.2,
  fast_correct_count: 3,
  slow_correct_count: 1,
  top_error_codes: ["VOCAB_WEAK_RECALL"],
  mastery_status: "passed",
  next_action: "unlock_next_lesson"
};

async function insertCompletedSession(page) {
  await page.evaluate(async ({ session }) => {
    await window.VocabDB.put("sessions", session);
    const lesson = await window.VocabDB.get("lessons", session.lesson_id);
    if (lesson) {
      await window.VocabDB.put("lessons", { ...lesson, status: "completed" });
    }
  }, { session: mockSession });
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

  await clearAndSeedIndexedDb(page);
});

test("export flow: completed session appears on dashboard and download fallbacks fire", async ({ page }) => {
  await page.goto("/tracker.html?pw-export-flow=1", { waitUntil: "domcontentloaded", timeout: APP_TIMEOUT });
  await page.waitForSelector("#tracker-tabs", { state: "visible", timeout: APP_TIMEOUT });
  await page.waitForFunction(() => typeof window.VocabTracker?.setView === "function", { timeout: APP_TIMEOUT });

  await insertCompletedSession(page);
  await page.reload({ waitUntil: "domcontentloaded", timeout: APP_TIMEOUT });
  await page.waitForSelector("#tracker-tabs", { state: "visible", timeout: APP_TIMEOUT });

  await page.evaluate(() => window.VocabTracker.setView("export"));

  const exportHeading = page.locator(".tracker-panel h3", { hasText: "匯出總覽" });
  await expect(exportHeading).toBeVisible({ timeout: STEP_TIMEOUT });

  const sessionsStat = page.locator(".tracker-stat").filter({ has: page.locator("span", { hasText: "課程紀錄" }) });
  await expect(sessionsStat.locator("strong")).toHaveText(/^[1-9]\d*$/, { timeout: STEP_TIMEOUT });

  const exportPackageButton = page.getByRole("button", { name: "匯出給 ChatGPT 分析" });
  await expect(exportPackageButton).toBeVisible({ timeout: STEP_TIMEOUT });

  const exportDownloads = [];
  const onExportDownload = (download) => exportDownloads.push(download);
  page.on("download", onExportDownload);
  await exportPackageButton.click({ timeout: STEP_TIMEOUT });
  await page.waitForEvent("download", { timeout: APP_TIMEOUT });
  await expect.poll(() => exportDownloads.length, { timeout: APP_TIMEOUT }).toBeGreaterThanOrEqual(12);
  page.off("download", onExportDownload);

  const summaryButton = page.getByRole("button", { name: "summary.md" });
  const exportPreview = page.locator(".export-preview");
  await expect(summaryButton).toBeVisible({ timeout: STEP_TIMEOUT });
  const summaryDownload = page.waitForEvent("download", {
    predicate: (download) => download.suggestedFilename() === "summary.md",
    timeout: APP_TIMEOUT
  });
  await summaryButton.click({ timeout: STEP_TIMEOUT });
  await summaryDownload;
  await expect(exportPreview).toContainText("# TOEIC Vocabulary Tracker Export Summary", { timeout: STEP_TIMEOUT });

  await page.evaluate(() => window.VocabTracker.setView("bank"));
  const bankHeading = page.locator(".tracker-panel h3", { hasText: "題庫管理" });
  await expect(bankHeading).toBeVisible({ timeout: STEP_TIMEOUT });

  const seedDownloadButton = page.getByRole("button", { name: "下載已編輯 Seed JSON 快照" });
  await expect(seedDownloadButton).toBeVisible({ timeout: STEP_TIMEOUT });
  const seedDownload = page.waitForEvent("download", {
    predicate: (download) => /questions_.*\.json$/.test(download.suggestedFilename()),
    timeout: APP_TIMEOUT
  });
  await seedDownloadButton.click({ timeout: STEP_TIMEOUT });
  const downloadedSeed = await seedDownload;
  expect(downloadedSeed.suggestedFilename()).toMatch(/questions_.*\.json$/);
});
