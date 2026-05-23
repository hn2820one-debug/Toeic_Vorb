import { test, expect } from "@playwright/test";
import { gotoSeededTracker } from "./helpers/seed-idb";

const VIEWPORTS = [
  { name: "iphone-13", width: 390, height: 844 },
  { name: "pixel-7", width: 412, height: 915 },
  { name: "iphone-14-pro-max", width: 430, height: 932 }
];

const INIT_TIMEOUT = 30_000;
const STEP_TIMEOUT = 10_000;

for (const viewport of VIEWPORTS) {
  test(`mobile viewport matrix (${viewport.name}): lesson shell fits without horizontal scroll`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await gotoSeededTracker(page);
    await page.waitForFunction(() => typeof window.VocabTracker?.setView === "function", { timeout: INIT_TIMEOUT });

    await page.evaluate(() => window.VocabTracker.setView("lesson"));
    await page.getByTestId("lesson-start-goal").waitFor({ state: "visible", timeout: STEP_TIMEOUT });
    await page.getByRole("button", { name: "開始目前課程" }).click({ timeout: STEP_TIMEOUT });

    const overflow = await page.evaluate(() => {
      const doc = document.documentElement;
      return doc.scrollWidth > doc.clientWidth + 1;
    });
    expect(overflow).toBe(false);

    await expect(page.getByTestId("lesson-runtime-shell")).toBeVisible({ timeout: STEP_TIMEOUT });
    await expect(page.getByTestId("confirm-answer")).toBeVisible({ timeout: STEP_TIMEOUT });
  });
}
