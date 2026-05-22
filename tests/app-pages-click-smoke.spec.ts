import { test, expect, type Page } from "@playwright/test";
import { clearIndexedDb, waitForApp } from "./helpers/seed-idb";

const APP_TIMEOUT = 30_000;
const STEP_TIMEOUT = 10_000;

const MAIN_TABS = [
  { id: "today", label: "今日", marker: ".tracker-hero" },
  { id: "roadmap", label: "課程地圖", heading: "課程地圖" },
  { id: "lesson", label: "課程", heading: "開始課程" },
  { id: "mistakes", label: "複習", heading: "複習模式" },
  { id: "mastery", label: "精熟度", heading: "單字精熟度" },
  { id: "export", label: "匯出", heading: "匯出總覽" },
  { id: "bank", label: "題庫", heading: "題庫管理" },
  { id: "settings", label: "設定", heading: "設定" }
];

function watchRuntimeProblems(page: Page) {
  const pageErrors: string[] = [];
  const consoleErrors: string[] = [];
  const badResponses: string[] = [];
  const failedRequests: string[] = [];

  page.on("pageerror", (error) => pageErrors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("response", (response) => {
    const url = response.url();
    if (
      url.startsWith("http://127.0.0.1:3000/")
      && response.status() >= 400
      && !url.endsWith("/favicon.ico")
      && !url.endsWith(".map")
    ) {
      badResponses.push(`${response.status()} ${url}`);
    }
  });
  page.on("requestfailed", (request) => {
    const url = request.url();
    if (url.startsWith("http://127.0.0.1:3000/") && !url.endsWith("/favicon.ico")) {
      failedRequests.push(`${url} ${request.failure()?.errorText || ""}`.trim());
    }
  });

  return { pageErrors, consoleErrors, badResponses, failedRequests };
}

async function gotoTrackerFromLauncher(page: Page) {
  await clearIndexedDb(page);
  await page.goto("/index.html?pw-app-pages-click-smoke=1", {
    waitUntil: "domcontentloaded",
    timeout: APP_TIMEOUT
  });
  await expect(page.getByRole("link", { name: /開始學習/ })).toBeVisible({ timeout: STEP_TIMEOUT });

  await Promise.all([
    page.waitForURL(/\/tracker\.html/, { timeout: APP_TIMEOUT }),
    page.getByRole("link", { name: /開始學習/ }).click({ timeout: STEP_TIMEOUT })
  ]);

  await waitForApp(page);
  await page.waitForFunction(() => typeof window.VocabTracker?.setView === "function", { timeout: APP_TIMEOUT });
}

async function clickMainTab(page: Page, label: string) {
  const tab = page.locator("#tracker-tabs").getByRole("button", { name: label, exact: true });
  await expect(tab).toBeVisible({ timeout: STEP_TIMEOUT });
  await tab.click({ timeout: STEP_TIMEOUT });
  await expect(page.locator("#tracker-tabs .tracker-tab.active")).toHaveText(label, { timeout: STEP_TIMEOUT });
}

async function expectViewReady(page: Page, tab: typeof MAIN_TABS[number]) {
  if (tab.marker) {
    await expect(page.locator(tab.marker)).toBeVisible({ timeout: STEP_TIMEOUT });
    return;
  }
  await expect(page.locator(".tracker-panel h3", { hasText: tab.heading })).toBeVisible({ timeout: STEP_TIMEOUT });
}

async function expectNoPageOverflow(page: Page) {
  const width = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth
  }));
  expect(width.scrollWidth).toBeLessThanOrEqual(width.clientWidth + 1);
}

test("all main pages can be clicked and used from the launcher", async ({ page }) => {
  const problems = watchRuntimeProblems(page);

  await page.setViewportSize({ width: 390, height: 844 });
  await gotoTrackerFromLauncher(page);

  await expect(page.locator("#tracker-tabs .tracker-tab")).toHaveText(
    MAIN_TABS.map((tab) => tab.label),
    { timeout: STEP_TIMEOUT }
  );

  for (const tab of MAIN_TABS) {
    await clickMainTab(page, tab.label);
    await expectViewReady(page, tab);
    await expectNoPageOverflow(page);
  }

  await clickMainTab(page, "課程");
  await page.getByRole("button", { name: "開始目前課程" }).click({ timeout: STEP_TIMEOUT });
  if (await page.getByTestId("stage-gate-warning").count()) {
    await expect(page.getByTestId("stage-gate-warning")).toBeVisible({ timeout: STEP_TIMEOUT });
    await page.getByTestId("stage-gate-continue").click({ timeout: STEP_TIMEOUT });
  }
  await expect(page.locator(".runtime-shell")).toBeVisible({ timeout: APP_TIMEOUT });
  await expect(page.locator(".answer-button")).toHaveCount(4, { timeout: STEP_TIMEOUT });
  await page.locator(".answer-button").first().click({ timeout: STEP_TIMEOUT });
  await expect(page.getByRole("button", { name: "確認答案" })).toBeEnabled({ timeout: STEP_TIMEOUT });
  await page.getByRole("button", { name: "確認答案" }).click({ timeout: STEP_TIMEOUT });
  await expect(page.locator(".feedback-banner")).toBeVisible({ timeout: STEP_TIMEOUT });
  await page.getByRole("button", { name: "離開" }).click({ timeout: STEP_TIMEOUT });
  await expect(page.locator("#tracker-tabs .tracker-tab.active")).toHaveText("今日", { timeout: STEP_TIMEOUT });
  await expect(page.locator(".tracker-hero")).toBeVisible({ timeout: STEP_TIMEOUT });

  await clickMainTab(page, "複習");
  await expect(page.locator(".review-filter-tabs .tracker-tab")).toHaveCount(4, { timeout: STEP_TIMEOUT });
  await page.locator(".review-filter-tabs .tracker-tab").filter({ hasText: "高優先" }).click({ timeout: STEP_TIMEOUT });
  await expect(page.locator(".review-filter-tabs .tracker-tab.active")).toContainText("高優先", { timeout: STEP_TIMEOUT });

  await clickMainTab(page, "精熟度");
  await page.getByPlaceholder("搜尋詞彙...").fill("extension");
  await expect(page.locator(".mastery-list")).toContainText("extension", { timeout: STEP_TIMEOUT });
  await page.getByRole("button", { name: "加入複習" }).first().click({ timeout: STEP_TIMEOUT });
  await expect(page.locator("#tracker-notice")).toContainText("已加入複習", { timeout: STEP_TIMEOUT });

  await clickMainTab(page, "匯出");
  const summaryDownload = page.waitForEvent("download", {
    predicate: (download) => download.suggestedFilename() === "summary.md",
    timeout: APP_TIMEOUT
  });
  await page.getByRole("button", { name: "summary.md" }).click({ timeout: STEP_TIMEOUT });
  await summaryDownload;
  await expect(page.getByTestId("export-preview")).toContainText("# TOEIC Vocabulary Tracker Export Summary", {
    timeout: STEP_TIMEOUT
  });

  await clickMainTab(page, "題庫");
  await page.getByTestId("question-bank-search").fill("v2_a_71_q_001");
  await expect(page.getByTestId("question-bank-count").locator("strong")).toHaveText("1", { timeout: STEP_TIMEOUT });
  await page.getByTestId("question-bank-row").click({ timeout: STEP_TIMEOUT });
  await expect(page.locator("#question-json-editor")).toContainText("v2_a_71_q_001", { timeout: STEP_TIMEOUT });
  await page.getByRole("button", { name: "驗證題庫" }).click({ timeout: STEP_TIMEOUT });
  await expect(page.locator("#tracker-notice")).toContainText("錯誤：0", { timeout: STEP_TIMEOUT });

  await clickMainTab(page, "設定");
  await page.locator("#setting-user").fill("Mobile Click Smoke");
  await page.locator("#setting-daily-goal").fill("42");
  await page.getByTestId("settings-save-button").click({ timeout: STEP_TIMEOUT });
  await expect(page.locator("#tracker-notice")).toContainText("設定已儲存", { timeout: STEP_TIMEOUT });
  await page.getByTestId("settings-clear-session-button").click({ timeout: STEP_TIMEOUT });
  await expect(page.locator("#tracker-notice")).toContainText("已清除目前課程續作", { timeout: STEP_TIMEOUT });

  expect(problems.pageErrors).toEqual([]);
  expect(problems.consoleErrors).toEqual([]);
  expect(problems.badResponses).toEqual([]);
  expect(problems.failedRequests).toEqual([]);
});
