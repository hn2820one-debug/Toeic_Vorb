import { test, expect } from "@playwright/test";
import { gotoSeededTracker } from "./helpers/seed-idb";

const STEP_TIMEOUT = 10_000;
const INIT_TIMEOUT = 30_000;

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

test("mobile runtime guard: offline lesson shows status pill not top banner", async ({ page, context }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await gotoSeededTracker(page);
  await page.waitForFunction(() => typeof window.VocabTracker?.setView === "function", { timeout: INIT_TIMEOUT });

  await context.setOffline(true);
  await page.evaluate(() => window.dispatchEvent(new Event("offline")));
  await page.evaluate(() => window.VocabTracker.setView("lesson"));
  await page.getByRole("button", { name: "開始目前課程" }).click({ timeout: STEP_TIMEOUT });

  await expect(page.getByTestId("runtime-status-pill")).toContainText("離線", { timeout: STEP_TIMEOUT });
  await expect(page.getByTestId("offline-banner")).toHaveCount(0);
  await expect(page.getByTestId("runtime-local-note")).toHaveCount(0);

  await context.setOffline(false);
  await page.evaluate(() => window.dispatchEvent(new Event("online")));
});

test("mobile runtime guard: today daily progress uses gentle mobile copy", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await gotoSeededTracker(page);
  await page.waitForFunction(() => typeof window.VocabTracker?.setView === "function", { timeout: INIT_TIMEOUT });

  await page.evaluate(() => window.VocabTracker.setView("today"));
  await expect(page.getByTestId("today-daily-progress")).toContainText("今日進度", { timeout: STEP_TIMEOUT });
  await expect(page.getByTestId("today-daily-hint")).toContainText("慢慢來", { timeout: STEP_TIMEOUT });
});

test("mobile runtime guard: sticky progress and lesson shell markers", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await gotoSeededTracker(page);
  await page.waitForFunction(() => typeof window.VocabTracker?.setView === "function", { timeout: INIT_TIMEOUT });

  await page.evaluate(() => window.VocabTracker.setView("lesson"));
  await page.getByRole("button", { name: "開始目前課程" }).click({ timeout: STEP_TIMEOUT });
  await expect(page.getByTestId("lesson-runtime-shell")).toBeVisible({ timeout: STEP_TIMEOUT });
  await expect(page.getByTestId("runtime-progress")).toHaveClass(/runtime-progress-sticky/, { timeout: STEP_TIMEOUT });
});

test("mobile runtime guard: sw update banner hidden during active lesson", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await gotoSeededTracker(page);
  await page.waitForFunction(() => typeof window.VocabTracker?.setView === "function", { timeout: INIT_TIMEOUT });

  await page.evaluate(async () => {
    const { state } = await import("./js/state.js");
    state.swUpdatePending = true;
    window.VocabTracker.setView("lesson");
  });

  await page.getByRole("button", { name: "開始目前課程" }).click({ timeout: STEP_TIMEOUT });
  await expect(page.getByTestId("sw-update-banner")).toHaveCount(0, { timeout: STEP_TIMEOUT });

  await page.evaluate(async () => {
    const { state } = await import("./js/state.js");
    state.activeSession = null;
    state.swUpdatePending = true;
    window.VocabTracker.setView("today");
  });
  await expect(page.getByTestId("sw-update-banner")).toBeVisible({ timeout: STEP_TIMEOUT });
});
