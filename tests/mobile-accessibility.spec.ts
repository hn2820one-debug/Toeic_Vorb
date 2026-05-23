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

test("mobile accessibility: settings apply large text and reduced motion prefs", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await gotoSeededTracker(page);
  await page.waitForFunction(() => typeof window.VocabTracker?.setView === "function", { timeout: INIT_TIMEOUT });

  await page.evaluate(() => window.VocabTracker.setView("settings"));
  await page.locator("#setting-mobile-large-text").check();
  await page.locator("#setting-mobile-reduced-motion").check();
  await page.getByTestId("settings-save-button").click({ timeout: STEP_TIMEOUT });

  await expect(page.locator("html")).toHaveClass(/tracker-large-text/, { timeout: STEP_TIMEOUT });
  await expect(page.locator("html")).toHaveClass(/tracker-reduced-motion/, { timeout: STEP_TIMEOUT });
});

test("mobile accessibility: lesson question and feedback expose status semantics", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await gotoSeededTracker(page);
  await page.waitForFunction(() => typeof window.VocabTracker?.setView === "function", { timeout: INIT_TIMEOUT });

  await page.evaluate(() => window.VocabTracker.setView("lesson"));
  await page.getByRole("button", { name: "開始目前課程" }).click({ timeout: STEP_TIMEOUT });

  await expect(page.locator(".question-panel[role='group']")).toBeVisible({ timeout: STEP_TIMEOUT });
  await expect(page.locator(".answer-button").first()).toHaveAttribute("aria-pressed", "false");

  await page.locator(".answer-button").first().click({ timeout: STEP_TIMEOUT });
  await expect(page.locator(".answer-button").first()).toHaveAttribute("aria-pressed", "true", { timeout: STEP_TIMEOUT });
  await page.getByTestId("confirm-answer").click({ timeout: STEP_TIMEOUT });

  await expect(page.getByTestId("feedback-panel")).toHaveAttribute("role", "status", { timeout: STEP_TIMEOUT });
});

test("mobile accessibility: Enter confirms selected answer", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await gotoSeededTracker(page);
  await page.waitForFunction(() => typeof window.VocabTracker?.setView === "function", { timeout: INIT_TIMEOUT });

  await page.evaluate(() => window.VocabTracker.setView("lesson"));
  await page.getByRole("button", { name: "開始目前課程" }).click({ timeout: STEP_TIMEOUT });
  await page.locator(".answer-button").first().click({ timeout: STEP_TIMEOUT });
  await page.keyboard.press("Enter");

  await expect(page.getByTestId("feedback-panel")).toBeVisible({ timeout: STEP_TIMEOUT });
});

test("mobile accessibility: clear session uses confirm on compact settings", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await gotoSeededTracker(page);
  await page.waitForFunction(() => typeof window.VocabTracker?.setView === "function", { timeout: INIT_TIMEOUT });

  let confirmShown = false;
  page.once("dialog", async (dialog) => {
    confirmShown = true;
    expect(dialog.type()).toBe("confirm");
    await dialog.dismiss();
  });

  await page.evaluate(() => window.VocabTracker.setView("settings"));
  await page.getByTestId("settings-clear-session-button").click({ timeout: STEP_TIMEOUT });
  expect(confirmShown).toBe(true);
});
