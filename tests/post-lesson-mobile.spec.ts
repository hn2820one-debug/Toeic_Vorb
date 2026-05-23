import { test, expect } from "@playwright/test";
import { gotoSeededTracker } from "./helpers/seed-idb";

const APP_TIMEOUT = 15_000;
const STEP_TIMEOUT = 10_000;
const INIT_TIMEOUT = 30_000;

test("post-lesson mobile: today stats stay compact and stage seal scannable", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await gotoSeededTracker(page);
  await page.waitForFunction(() => typeof window.VocabTracker?.setView === "function", { timeout: INIT_TIMEOUT });

  await page.evaluate(() => window.VocabTracker.setView("today"));
  await expect(page.getByTestId("today-stats-row")).toBeVisible({ timeout: STEP_TIMEOUT });
  await expect(page.locator(".tracker-grid--compact-today")).toHaveCount(1, { timeout: STEP_TIMEOUT });
  await expect(page.getByTestId("today-secondary-details")).toBeVisible({ timeout: STEP_TIMEOUT });
  await expect(page.getByTestId("stage-seal-readiness")).toBeVisible({ timeout: STEP_TIMEOUT });
  await expect(page.locator(".stage-seal-compact")).toHaveCount(1, { timeout: STEP_TIMEOUT });
});

test("post-lesson mobile: lesson start shows goal and sticky progress", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await gotoSeededTracker(page);
  await page.waitForFunction(() => typeof window.VocabTracker?.setView === "function", { timeout: INIT_TIMEOUT });

  await page.evaluate(() => window.VocabTracker.setView("lesson"));
  await expect(page.getByTestId("lesson-start-goal")).toBeVisible({ timeout: STEP_TIMEOUT });
  await page.getByRole("button", { name: "開始目前課程" }).click({ timeout: STEP_TIMEOUT });
  await expect(page.getByTestId("runtime-progress")).toHaveClass(/runtime-progress-sticky/, { timeout: STEP_TIMEOUT });
});
