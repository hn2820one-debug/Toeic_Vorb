import { test, expect, type Page } from "@playwright/test";
import fs from "node:fs/promises";
import path from "node:path";
import { clearIndexedDb, waitForApp } from "./helpers/seed-idb";

const APP_TIMEOUT = 30_000;
const STEP_TIMEOUT = 10_000;
const SUBPATH = "/tmp/pages-subpath-site/toeic-app-Vorb/";
const root = process.cwd();
const stageRoot = path.join(root, "tmp", "pages-subpath-site");
const siteRoot = path.join(stageRoot, "toeic-app-Vorb");
const rootFiles = ["index.html", "tracker.html", "clear-sw.html", "manifest.json", "sw.js"];
const artifactDirs = ["css", "js", "data", "icons"];
const MANIFEST_HREF = "./manifest.json";
const APPLE_TOUCH_ICON_HREF = "./icons/icon-192.svg";
const SW_SCRIPT_HREF = "./sw.js";
const SW_CACHE_NAME = "toeic-vorb-v38";
const LAUNCHER_STATUS_TEXT = "目前正式內容：V2 + V3，共 39 課 / 780 題；V0 / V1 已清空，V4 尚未啟用。";

function assertSafeStagePath(targetPath: string) {
  const resolvedRoot = path.resolve(root);
  const resolvedTarget = path.resolve(targetPath);
  const expected = path.resolve(root, "tmp", "pages-subpath-site");
  if (resolvedTarget !== expected || !resolvedTarget.startsWith(resolvedRoot + path.sep)) {
    throw new Error(`Refusing to clean unexpected test path: ${resolvedTarget}`);
  }
}

async function stagePagesArtifact() {
  assertSafeStagePath(stageRoot);
  await fs.rm(stageRoot, { recursive: true, force: true });
  await fs.mkdir(siteRoot, { recursive: true });

  for (const fileName of rootFiles) {
    await fs.copyFile(path.join(root, fileName), path.join(siteRoot, fileName));
  }
  for (const dirName of artifactDirs) {
    await fs.cp(path.join(root, dirName), path.join(siteRoot, dirName), { recursive: true });
  }
}

async function cleanupPagesArtifact() {
  assertSafeStagePath(stageRoot);
  await fs.rm(stageRoot, { recursive: true, force: true });
}

async function gotoSubpathLauncher(page: Page) {
  await clearIndexedDb(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${SUBPATH}index.html?pw-pages-subpath=1`, {
    waitUntil: "domcontentloaded",
    timeout: APP_TIMEOUT
  });
}

async function emulateStandaloneDisplayMode(page: Page) {
  await page.addInitScript(() => {
    const originalMatchMedia = window.matchMedia.bind(window);
    window.matchMedia = (query) => {
      const mediaQueryList = originalMatchMedia(query);
      if (query !== "(display-mode: standalone)") {
        return mediaQueryList;
      }
      return {
        matches: true,
        media: query,
        onchange: mediaQueryList.onchange,
        addListener: mediaQueryList.addListener.bind(mediaQueryList),
        removeListener: mediaQueryList.removeListener.bind(mediaQueryList),
        addEventListener: mediaQueryList.addEventListener.bind(mediaQueryList),
        removeEventListener: mediaQueryList.removeEventListener.bind(mediaQueryList),
        dispatchEvent: mediaQueryList.dispatchEvent.bind(mediaQueryList)
      };
    };
  });
}

function monitorSubpathRequests(page: Page) {
  const failedRequests: string[] = [];
  const badResponses: string[] = [];

  page.on("requestfailed", (request) => {
    if (request.url().includes(SUBPATH)) {
      failedRequests.push(`${request.url()} ${request.failure()?.errorText || ""}`.trim());
    }
  });
  page.on("response", (response) => {
    if (response.url().includes(SUBPATH) && response.status() >= 400) {
      badResponses.push(`${response.status()} ${response.url()}`);
    }
  });

  return { failedRequests, badResponses };
}

async function expectInstallLinks(page: Page) {
  await expect(page.locator('link[rel="manifest"]')).toHaveAttribute("href", MANIFEST_HREF);
  await expect(page.locator('link[rel="apple-touch-icon"]')).toHaveAttribute("href", APPLE_TOUCH_ICON_HREF);
}

async function fetchManifest(page: Page) {
  return page.evaluate(async () => {
    const response = await fetch("./manifest.json");
    const json = await response.json();
    return {
      ok: response.ok,
      status: response.status,
      json
    };
  });
}

async function getServiceWorkerRegistration(page: Page) {
  return page.evaluate(async () => {
    const registration = await navigator.serviceWorker.getRegistration();
    return {
      scope: registration?.scope || null,
      scriptURL: registration?.active?.scriptURL || registration?.waiting?.scriptURL || registration?.installing?.scriptURL || null
    };
  });
}

async function getCacheKeys(page: Page) {
  return page.evaluate(async () => caches.keys());
}

async function expectNoPageOverflow(page: Page) {
  const metrics = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth
  }));
  expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.clientWidth + 1);
}

async function expectLauncherStatusNote(page: Page) {
  await expect(page.locator(".launcher-card .launcher-note").first()).toContainText(LAUNCHER_STATUS_TEXT);
}

const TRACKER_VIEW_LABELS: Record<string, string> = {
  today: "今日",
  roadmap: "課程地圖",
  lesson: "課程",
  settings: "設定",
  export: "匯出"
};

async function gotoSubpathTracker(page: Page) {
  await gotoSubpathLauncher(page);
  await Promise.all([
    page.waitForURL(new RegExp(`${SUBPATH.replace(/\//g, "\\/")}tracker\\.html`), { timeout: APP_TIMEOUT }),
    page.getByRole("link", { name: /開始學習/ }).click({ timeout: STEP_TIMEOUT })
  ]);

  await waitForApp(page);
  await page.waitForFunction(() => typeof window.VocabTracker?.setView === "function", { timeout: APP_TIMEOUT });
}

async function setTrackerView(page: Page, view: keyof typeof TRACKER_VIEW_LABELS) {
  await page.evaluate((nextView) => window.VocabTracker.setView(nextView), view);
  await expect(page.locator("#tracker-tabs .tracker-tab.active")).toHaveText(TRACKER_VIEW_LABELS[view], { timeout: STEP_TIMEOUT });
}

async function getSettingsLayoutMetrics(page: Page) {
  return page.evaluate(() => {
    const grid = document.querySelector("[data-testid='settings-grid']");
    const saveButton = document.querySelector("[data-testid='settings-save-button']");
    const clearButton = document.querySelector("[data-testid='settings-clear-session-button']");
    const inputNodes = Array.from(document.querySelectorAll("[data-testid='settings-grid'] input"));
    return {
      columns: grid ? getComputedStyle(grid).gridTemplateColumns.split(" ").filter(Boolean).length : 0,
      inputFontSizes: inputNodes.map((node) => Number.parseFloat(getComputedStyle(node).fontSize || "0")),
      saveButtonHeight: saveButton?.getBoundingClientRect().height || 0,
      clearButtonHeight: clearButton?.getBoundingClientRect().height || 0,
      saveButtonWidth: saveButton?.getBoundingClientRect().width || 0,
      clearButtonWidth: clearButton?.getBoundingClientRect().width || 0,
      storageRows: document.querySelectorAll("[data-testid='settings-storage-list'] .stage-row").length
    };
  });
}

async function getExportLayoutMetrics(page: Page) {
  return page.evaluate(() => {
    const doc = document.documentElement;
    const packageButton = document.querySelector("[data-testid='export-package-button']");
    const inventory = document.querySelector("[data-testid='export-file-inventory']");
    const preview = document.querySelector("[data-testid='export-preview']");
    const fileButtons = Array.from(document.querySelectorAll(".export-category-files .button"));
    return {
      docScrollWidth: doc.scrollWidth,
      clientWidth: doc.clientWidth,
      packageButtonTop: packageButton?.getBoundingClientRect().top || 0,
      packageButtonHeight: packageButton?.getBoundingClientRect().height || 0,
      inventoryClientWidth: inventory?.clientWidth || 0,
      inventoryScrollWidth: inventory?.scrollWidth || 0,
      previewClientWidth: preview?.clientWidth || 0,
      previewScrollWidth: preview?.scrollWidth || 0,
      previewHeight: preview?.getBoundingClientRect().height || 0,
      fileButtonHeights: fileButtons.map((button) => button.getBoundingClientRect().height),
      fileButtonWidths: fileButtons.map((button) => button.getBoundingClientRect().width),
      fileButtonTexts: fileButtons.slice(0, 6).map((button) => button.textContent?.trim() || "")
    };
  });
}

async function getClearSwLayoutMetrics(page: Page) {
  return page.evaluate(() => {
    const doc = document.documentElement;
    const clearButton = document.querySelector("[data-testid='clear-sw-action-button']");
    const goButton = document.querySelector("[data-testid='clear-sw-home-button']");
    const status = document.querySelector("[data-testid='clear-sw-status']");
    const card = document.querySelector("[data-testid='clear-sw-card']");
    return {
      docScrollWidth: doc.scrollWidth,
      clientWidth: doc.clientWidth,
      cardWidth: card?.getBoundingClientRect().width || 0,
      clearButtonTop: clearButton?.getBoundingClientRect().top || 0,
      clearButtonHeight: clearButton?.getBoundingClientRect().height || 0,
      clearButtonWidth: clearButton?.getBoundingClientRect().width || 0,
      goButtonTop: goButton?.getBoundingClientRect().top || 0,
      goButtonHeight: goButton?.getBoundingClientRect().height || 0,
      goButtonWidth: goButton?.getBoundingClientRect().width || 0,
      goButtonDisplay: goButton ? getComputedStyle(goButton).display : "none",
      statusHeight: status?.getBoundingClientRect().height || 0
    };
  });
}

test.beforeAll(async () => {
  await stagePagesArtifact();
});

test.afterAll(async () => {
  await cleanupPagesArtifact();
});

test("path: mobile Pages-like subpath routes stay inside shipped app", async ({ page }) => {
  const { failedRequests, badResponses } = monitorSubpathRequests(page);

  await gotoSubpathLauncher(page);
  await expect(page).toHaveURL(new RegExp(`${SUBPATH.replace(/\//g, "\\/")}index\\.html`));
  await expectLauncherStatusNote(page);
  await expect(page.getByRole("link", { name: /開始學習/ })).toBeVisible({ timeout: STEP_TIMEOUT });
  await expect(page.getByRole("link", { name: "如果畫面怪怪的，先清除快取" })).toHaveAttribute("href", "./clear-sw.html");

  await Promise.all([
    page.waitForURL(new RegExp(`${SUBPATH.replace(/\//g, "\\/")}tracker\\.html`), { timeout: APP_TIMEOUT }),
    page.getByRole("link", { name: /開始學習/ }).click({ timeout: STEP_TIMEOUT })
  ]);

  await waitForApp(page);
  await page.waitForFunction(() => typeof window.VocabTracker?.setView === "function", { timeout: APP_TIMEOUT });

  await expect(page.locator("#tracker-tabs .tracker-tab")).toHaveCount(8, { timeout: STEP_TIMEOUT });
  await expect(page.locator(".tracker-hero")).toContainText("V2 TOEIC Scene Vocabulary", { timeout: STEP_TIMEOUT });
  await expect(page.getByTestId("empty-seed-banner")).toHaveCount(0);

  await Promise.all([
    page.waitForURL(new RegExp(`${SUBPATH.replace(/\//g, "\\/")}index\\.html`), { timeout: APP_TIMEOUT }),
    page.getByRole("button", { name: /返回首頁/ }).click({ timeout: STEP_TIMEOUT })
  ]);

  await expect(page.getByRole("link", { name: /開始學習/ })).toBeVisible({ timeout: STEP_TIMEOUT });

  await page.goto(`${SUBPATH}clear-sw.html?pw-pages-subpath=1`, {
    waitUntil: "domcontentloaded",
    timeout: APP_TIMEOUT
  });

  await expect(page).toHaveURL(new RegExp(`${SUBPATH.replace(/\//g, "\\/")}clear-sw\\.html`));
  await expect(page.getByRole("heading", { name: /清除 Service Worker 快取/ })).toBeVisible({ timeout: STEP_TIMEOUT });
  await expect(page.locator("#status")).toBeVisible({ timeout: STEP_TIMEOUT });

  expect(failedRequests).toEqual([]);
  expect(badResponses).toEqual([]);
});

test("layout: mobile shell keeps launcher CTA and tracker tabs usable without page overflow", async ({ page }) => {
  const { failedRequests, badResponses } = monitorSubpathRequests(page);

  await gotoSubpathLauncher(page);
  await expectLauncherStatusNote(page);
  await expect(page.getByRole("link", { name: /開始學習 \/ 開啟主程式/ })).toBeVisible({ timeout: STEP_TIMEOUT });
  await expect(page.getByRole("link", { name: /開始學習 \/ 開啟主程式/ })).toBeInViewport();
  await expect(page.getByRole("link", { name: /如果畫面怪怪的，先清除快取/ })).toBeVisible({ timeout: STEP_TIMEOUT });
  await expectNoPageOverflow(page);

  await Promise.all([
    page.waitForURL(new RegExp(`${SUBPATH.replace(/\//g, "\\/")}tracker\\.html`), { timeout: APP_TIMEOUT }),
    page.getByRole("link", { name: /開始學習/ }).click({ timeout: STEP_TIMEOUT })
  ]);

  await waitForApp(page);
  await page.waitForFunction(() => typeof window.VocabTracker?.setView === "function", { timeout: APP_TIMEOUT });

  const tabs = page.locator("#tracker-tabs .tracker-tab");
  await expect(tabs).toHaveCount(8, { timeout: STEP_TIMEOUT });
  await expect(tabs).toHaveText(["今日", "課程地圖", "課程", "複習", "精熟度", "匯出", "題庫", "設定"], { timeout: STEP_TIMEOUT });
  await expect(page.getByRole("button", { name: /返回首頁/ })).toBeVisible({ timeout: STEP_TIMEOUT });
  await expectNoPageOverflow(page);

  await tabs.last().scrollIntoViewIfNeeded();
  await tabs.last().click({ timeout: STEP_TIMEOUT });
  await expect(page.locator("#tracker-tabs .tracker-tab.active")).toHaveText("設定", { timeout: STEP_TIMEOUT });
  await expect(page.getByTestId("settings-advanced-tools")).toBeVisible({ timeout: STEP_TIMEOUT });

  expect(failedRequests).toEqual([]);
  expect(badResponses).toEqual([]);
});

test("layout: mobile primary actions stay reachable across Today, Roadmap, Lesson, Settings, and Export", async ({ page }) => {
  const { failedRequests, badResponses } = monitorSubpathRequests(page);

  await gotoSubpathTracker(page);

  const todayPrimary = page.locator(".tracker-panel").filter({
    has: page.getByRole("heading", { name: "下一步" })
  }).getByRole("button", { name: /^開始課程$|^開始重跑$|^開始複習$/ });
  await todayPrimary.scrollIntoViewIfNeeded();
  await expect(todayPrimary).toBeVisible({ timeout: STEP_TIMEOUT });
  await expect(todayPrimary).toBeEnabled({ timeout: STEP_TIMEOUT });

  await setTrackerView(page, "roadmap");
  const roadmapPrimary = page.locator("[data-testid='roadmap-lesson-row'] .lesson-tools .button").first();
  await roadmapPrimary.scrollIntoViewIfNeeded();
  await expect(roadmapPrimary).toBeVisible({ timeout: STEP_TIMEOUT });
  await expect(roadmapPrimary).toBeEnabled({ timeout: STEP_TIMEOUT });

  await setTrackerView(page, "lesson");
  const lessonPrimary = page.getByRole("button", { name: "開始目前課程" });
  await lessonPrimary.scrollIntoViewIfNeeded();
  await expect(lessonPrimary).toBeVisible({ timeout: STEP_TIMEOUT });
  await expect(lessonPrimary).toBeEnabled({ timeout: STEP_TIMEOUT });

  await setTrackerView(page, "settings");
  const settingsPrimary = page.getByTestId("settings-save-button");
  await settingsPrimary.scrollIntoViewIfNeeded();
  await expect(settingsPrimary).toBeVisible({ timeout: STEP_TIMEOUT });
  await expect(settingsPrimary).toBeEnabled({ timeout: STEP_TIMEOUT });
  await expect(page.getByTestId("settings-clear-session-button")).toBeVisible({ timeout: STEP_TIMEOUT });

  await setTrackerView(page, "export");
  const exportPrimary = page.getByRole("button", { name: "匯出完整資料封包" }).first();
  await exportPrimary.scrollIntoViewIfNeeded();
  await expect(exportPrimary).toBeVisible({ timeout: STEP_TIMEOUT });
  await expect(exportPrimary).toBeEnabled({ timeout: STEP_TIMEOUT });
  await expectNoPageOverflow(page);

  expect(failedRequests).toEqual([]);
  expect(badResponses).toEqual([]);
});

test("settings: mobile Settings stays single-column, uses touch-sized controls, and saves without leaving the view", async ({ page }) => {
  const { failedRequests, badResponses } = monitorSubpathRequests(page);

  await gotoSubpathTracker(page);
  await setTrackerView(page, "settings");

  const initialMetrics = await getSettingsLayoutMetrics(page);
  expect(initialMetrics.columns).toBe(1);
  expect(initialMetrics.inputFontSizes.every((size) => size >= 16)).toBe(true);
  expect(initialMetrics.saveButtonHeight).toBeGreaterThanOrEqual(48);
  expect(initialMetrics.clearButtonHeight).toBeGreaterThanOrEqual(48);
  expect(initialMetrics.storageRows).toBe(7);
  expect(initialMetrics.saveButtonWidth).toBeGreaterThan(200);
  expect(initialMetrics.clearButtonWidth).toBeGreaterThan(200);

  await page.evaluate(async () => {
    const lesson = await window.VocabDB.get("lessons", "V2-A-71");
    window.VocabDB.saveActiveSession({
      session_id: "pw_settings_mobile",
      lesson_id: lesson.lesson_id,
      question_ids: lesson.question_ids.slice(0, 2),
      current_index: 1,
      mode: "lesson"
    });
  });
  await expect.poll(async () => page.evaluate(() => window.VocabDB.loadActiveSession()?.session_id || null), {
    timeout: STEP_TIMEOUT
  }).toBe("pw_settings_mobile");

  await page.locator("#setting-user").fill("Mobile Settings Test");
  await page.locator("#setting-daily-goal").fill("42");
  await page.getByTestId("settings-save-button").click({ timeout: STEP_TIMEOUT });

  await expect(page.locator("#tracker-notice .tracker-alert.ok")).toContainText("設定已儲存。", { timeout: STEP_TIMEOUT });
  await expect(page.locator("#setting-user")).toHaveValue("Mobile Settings Test", { timeout: STEP_TIMEOUT });
  await expect(page.locator("#setting-daily-goal")).toHaveValue("42", { timeout: STEP_TIMEOUT });

  await page.getByTestId("settings-clear-session-button").scrollIntoViewIfNeeded();
  await page.getByTestId("settings-clear-session-button").click({ timeout: STEP_TIMEOUT });
  await expect(page.locator("#tracker-notice .tracker-alert.ok")).toContainText("已清除目前課程續作。", { timeout: STEP_TIMEOUT });
  await expect.poll(async () => page.evaluate(() => window.VocabDB.loadActiveSession()), {
    timeout: STEP_TIMEOUT
  }).toBeNull();
  await expect(page.getByTestId("settings-storage-panel")).toBeVisible({ timeout: STEP_TIMEOUT });
  await expectNoPageOverflow(page);

  expect(failedRequests).toEqual([]);
  expect(badResponses).toEqual([]);
});

test("export: mobile Export keeps the package CTA reachable and file inventory readable without page overflow", async ({ page }) => {
  const { failedRequests, badResponses } = monitorSubpathRequests(page);

  await gotoSubpathTracker(page);
  await setTrackerView(page, "export");

  const metrics = await getExportLayoutMetrics(page);
  expect(metrics.docScrollWidth).toBeLessThanOrEqual(metrics.clientWidth + 1);
  expect(metrics.packageButtonTop).toBeLessThan(844);
  expect(metrics.packageButtonHeight).toBeGreaterThanOrEqual(44);
  expect(metrics.inventoryScrollWidth).toBeLessThanOrEqual(metrics.inventoryClientWidth + 1);
  expect(metrics.previewScrollWidth).toBeLessThanOrEqual(metrics.previewClientWidth + 1);
  expect(metrics.previewHeight).toBeLessThanOrEqual(320.5);
  expect(metrics.fileButtonHeights.every((height) => height >= 44)).toBe(true);
  expect(metrics.fileButtonWidths.every((width) => width >= metrics.inventoryClientWidth * 0.9)).toBe(true);
  expect(metrics.fileButtonTexts.length).toBeGreaterThan(0);

  await expect(page.getByTestId("export-package-button")).toBeVisible({ timeout: STEP_TIMEOUT });
  await expect(page.getByTestId("export-file-inventory")).toBeVisible({ timeout: STEP_TIMEOUT });
  await expect(page.getByTestId("export-preview")).toBeVisible({ timeout: STEP_TIMEOUT });
  await expectNoPageOverflow(page);

  expect(failedRequests).toEqual([]);
  expect(badResponses).toEqual([]);
});

test("export: mobile Export fallback reports staged downloads when folder picker is unavailable", async ({ page }) => {
  const { failedRequests, badResponses } = monitorSubpathRequests(page);

  await gotoSubpathTracker(page);
  await setTrackerView(page, "export");

  const fileCount = await page.locator(".export-category-files .button").count();
  await page.evaluate(() => {
    window.__pwExportDownloads = [];
    Object.defineProperty(window, "showDirectoryPicker", {
      configurable: true,
      value: undefined
    });
    const originalDownloadText = window.VocabScoring.downloadText;
    window.__pwOriginalDownloadText = originalDownloadText;
    window.VocabScoring.downloadText = (name, content, mime) => {
      window.__pwExportDownloads.push({ name, size: String(content || "").length, mime });
    };
  });

  await page.getByTestId("export-package-button").click({ timeout: STEP_TIMEOUT });
  await expect(page.locator("#tracker-notice .tracker-alert.warn")).toContainText("逐一下載完整資料封包", { timeout: STEP_TIMEOUT });
  await expect.poll(async () => page.evaluate(() => window.__pwExportDownloads.length), {
    timeout: 10000
  }).toBe(fileCount);

  const fallbackSummary = await page.evaluate(() => ({
    count: window.__pwExportDownloads.length,
    sampleNames: window.__pwExportDownloads.slice(0, 4).map((row) => row.name),
    hasFolderPrefixedName: window.__pwExportDownloads.some((row) => String(row.name).startsWith("toeic_vocab_export_"))
  }));
  expect(fallbackSummary.count).toBe(fileCount);
  expect(fallbackSummary.sampleNames.length).toBeGreaterThan(0);
  expect(fallbackSummary.hasFolderPrefixedName).toBe(true);

  expect(failedRequests).toEqual([]);
  expect(badResponses).toEqual([]);
});

test("manifest: mobile Pages-like subpath serves a readable manifest and consistent install links", async ({ page }) => {
  const { failedRequests, badResponses } = monitorSubpathRequests(page);

  await gotoSubpathLauncher(page);
  await expectInstallLinks(page);

  const launcherManifest = await fetchManifest(page);
  expect(launcherManifest.ok).toBe(true);
  expect(launcherManifest.status).toBe(200);
  expect(launcherManifest.json).toMatchObject({
    start_url: "./index.html",
    scope: "./",
    display: "standalone"
  });
  expect(launcherManifest.json.icons).toEqual(expect.arrayContaining([
    expect.objectContaining({ src: "./icons/icon-192.svg" }),
    expect.objectContaining({ src: "./icons/icon-512.svg" })
  ]));

  await Promise.all([
    page.waitForURL(new RegExp(`${SUBPATH.replace(/\//g, "\\/")}tracker\\.html`), { timeout: APP_TIMEOUT }),
    page.getByRole("link", { name: /開始學習/ }).click({ timeout: STEP_TIMEOUT })
  ]);

  await waitForApp(page);
  await page.waitForFunction(() => typeof window.VocabTracker?.setView === "function", { timeout: APP_TIMEOUT });
  await expectInstallLinks(page);

  const trackerManifest = await fetchManifest(page);
  expect(trackerManifest.ok).toBe(true);
  expect(trackerManifest.status).toBe(200);
  expect(trackerManifest.json).toMatchObject({
    start_url: "./index.html",
    scope: "./",
    display: "standalone"
  });

  expect(failedRequests).toEqual([]);
  expect(badResponses).toEqual([]);
});

test("path: simulated standalone display mode keeps the return-home flow working", async ({ page }) => {
  const { failedRequests, badResponses } = monitorSubpathRequests(page);

  await emulateStandaloneDisplayMode(page);
  await gotoSubpathLauncher(page);

  await expect.poll(async () => page.evaluate(() => window.matchMedia("(display-mode: standalone)").matches), {
    timeout: STEP_TIMEOUT
  }).toBe(true);

  await Promise.all([
    page.waitForURL(new RegExp(`${SUBPATH.replace(/\//g, "\\/")}tracker\\.html`), { timeout: APP_TIMEOUT }),
    page.getByRole("link", { name: /開始學習/ }).click({ timeout: STEP_TIMEOUT })
  ]);

  await waitForApp(page);
  await page.waitForFunction(() => typeof window.VocabTracker?.setView === "function", { timeout: APP_TIMEOUT });
  await expect(page.getByRole("button", { name: /返回首頁/ })).toBeVisible({ timeout: STEP_TIMEOUT });

  await Promise.all([
    page.waitForURL(new RegExp(`${SUBPATH.replace(/\//g, "\\/")}index\\.html`), { timeout: APP_TIMEOUT }),
    page.getByRole("button", { name: /返回首頁/ }).click({ timeout: STEP_TIMEOUT })
  ]);

  await expect(page.getByRole("link", { name: /開始學習/ })).toBeVisible({ timeout: STEP_TIMEOUT });
  expect(failedRequests).toEqual([]);
  expect(badResponses).toEqual([]);
});

test.describe("service worker registration", () => {
  test.use({ serviceWorkers: "allow" });

  test("service-worker: Pages-like subpath registers the service worker within the repository scope", async ({ page }) => {
    const { failedRequests, badResponses } = monitorSubpathRequests(page);

    await clearIndexedDb(page);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${SUBPATH}index.html?pw-pages-sw=1`, {
      waitUntil: "load",
      timeout: APP_TIMEOUT
    });

    const expectedScope = new URL("./", page.url()).href;
    const expectedScriptURL = new URL(SW_SCRIPT_HREF, page.url()).href;

    await expect.poll(async () => (await getServiceWorkerRegistration(page)).scope, {
      timeout: APP_TIMEOUT
    }).toBe(expectedScope);
    await expect.poll(async () => (await getServiceWorkerRegistration(page)).scriptURL, {
      timeout: APP_TIMEOUT
    }).toBe(expectedScriptURL);
    await expect.poll(async () => page.evaluate(async (cacheName) => {
      const keys = await caches.keys();
      return keys.includes(cacheName);
    }, SW_CACHE_NAME), {
      timeout: APP_TIMEOUT
    }).toBe(true);

    await Promise.all([
      page.waitForURL(new RegExp(`${SUBPATH.replace(/\//g, "\\/")}tracker\\.html`), { timeout: APP_TIMEOUT }),
      page.getByRole("link", { name: /開始學習/ }).click({ timeout: STEP_TIMEOUT })
    ]);

    await waitForApp(page);
    await page.waitForFunction(() => typeof window.VocabTracker?.setView === "function", { timeout: APP_TIMEOUT });
    await expect.poll(async () => (await getServiceWorkerRegistration(page)).scope, {
      timeout: APP_TIMEOUT
    }).toBe(expectedScope);

    expect(failedRequests).toEqual([]);
    expect(badResponses).toEqual([]);
  });

  test("repair: mobile clear-sw keeps the repair status and return-home action usable", async ({ page }) => {
    const { failedRequests, badResponses } = monitorSubpathRequests(page);

    await clearIndexedDb(page);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${SUBPATH}index.html?pw-pages-clear-mobile=1`, {
      waitUntil: "load",
      timeout: APP_TIMEOUT
    });

    const expectedScope = new URL("./", page.url()).href;
    await expect.poll(async () => (await getServiceWorkerRegistration(page)).scope, {
      timeout: APP_TIMEOUT
    }).toBe(expectedScope);
    await expect.poll(async () => (await getCacheKeys(page)).includes(SW_CACHE_NAME), {
      timeout: APP_TIMEOUT
    }).toBe(true);

    await page.goto(`${SUBPATH}clear-sw.html?pw-pages-clear-mobile=1`, {
      waitUntil: "load",
      timeout: APP_TIMEOUT
    });

    const before = await getClearSwLayoutMetrics(page);
    expect(before.docScrollWidth).toBeLessThanOrEqual(before.clientWidth + 1);
    expect(before.clearButtonTop).toBeLessThan(844);
    expect(before.clearButtonHeight).toBeGreaterThanOrEqual(48);
    expect(before.clearButtonWidth).toBeGreaterThanOrEqual(before.cardWidth * 0.9);
    expect(before.statusHeight).toBeGreaterThanOrEqual(56);
    expect(before.goButtonDisplay).toBe("none");

    await expect(page.getByTestId("clear-sw-action-button")).toBeVisible({ timeout: STEP_TIMEOUT });
    await expect(page.getByTestId("clear-sw-status")).toContainText("偵測到", { timeout: STEP_TIMEOUT });
    await expectNoPageOverflow(page);

    await page.getByTestId("clear-sw-action-button").click({ timeout: STEP_TIMEOUT });
    await expect(page.getByTestId("clear-sw-status")).toContainText("完成", { timeout: APP_TIMEOUT });
    await expect(page.getByTestId("clear-sw-home-button")).toBeVisible({ timeout: STEP_TIMEOUT });

    const after = await getClearSwLayoutMetrics(page);
    expect(after.goButtonDisplay).toBe("block");
    expect(after.goButtonTop).toBeLessThan(844);
    expect(after.goButtonHeight).toBeGreaterThanOrEqual(48);
    expect(after.goButtonWidth).toBeGreaterThanOrEqual(after.cardWidth * 0.9);
    await expectNoPageOverflow(page);

    await Promise.all([
      page.waitForURL(new RegExp(`${SUBPATH.replace(/\//g, "\\/")}index\\.html`), { timeout: APP_TIMEOUT }),
      page.getByTestId("clear-sw-home-button").click({ timeout: STEP_TIMEOUT })
    ]);

    await expectLauncherStatusNote(page);
    await expect.poll(async () => (await getServiceWorkerRegistration(page)).scope, {
      timeout: APP_TIMEOUT
    }).toBe(expectedScope);

    expect(failedRequests).toEqual([]);
    expect(badResponses).toEqual([]);
  });

  test("repair: clear-sw removes stale caches and reloads the current launcher asset set", async ({ page }) => {
    const { failedRequests, badResponses } = monitorSubpathRequests(page);

    await clearIndexedDb(page);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${SUBPATH}index.html?pw-pages-clear=1`, {
      waitUntil: "load",
      timeout: APP_TIMEOUT
    });

    const expectedScope = new URL("./", page.url()).href;
    await expect.poll(async () => (await getServiceWorkerRegistration(page)).scope, {
      timeout: APP_TIMEOUT
    }).toBe(expectedScope);
    await expect.poll(async () => (await getCacheKeys(page)).includes(SW_CACHE_NAME), {
      timeout: APP_TIMEOUT
    }).toBe(true);

    await page.goto(`${SUBPATH}clear-sw.html?pw-pages-clear=1`, {
      waitUntil: "load",
      timeout: APP_TIMEOUT
    });
    await expect(page.locator("#status")).toContainText("偵測到", { timeout: STEP_TIMEOUT });

    await page.getByRole("button", { name: /清除快取並重新整理/ }).click({ timeout: STEP_TIMEOUT });
    await expect(page.locator("#status")).toContainText("完成", { timeout: APP_TIMEOUT });
    await expect(page.getByRole("button", { name: /前往首頁/ })).toBeVisible({ timeout: STEP_TIMEOUT });

    await expect.poll(async () => page.evaluate(async () => (await navigator.serviceWorker.getRegistrations()).length), {
      timeout: APP_TIMEOUT
    }).toBe(0);
    await expect.poll(async () => (await getCacheKeys(page)).length, {
      timeout: APP_TIMEOUT
    }).toBe(0);

    await Promise.all([
      page.waitForURL(new RegExp(`${SUBPATH.replace(/\//g, "\\/")}index\\.html`), { timeout: APP_TIMEOUT }),
      page.getByRole("button", { name: /前往首頁/ }).click({ timeout: STEP_TIMEOUT })
    ]);

    await expectLauncherStatusNote(page);
    await expect.poll(async () => (await getServiceWorkerRegistration(page)).scope, {
      timeout: APP_TIMEOUT
    }).toBe(expectedScope);
    await expect.poll(async () => (await getCacheKeys(page)).includes(SW_CACHE_NAME), {
      timeout: APP_TIMEOUT
    }).toBe(true);

    expect(failedRequests).toEqual([]);
    expect(badResponses).toEqual([]);
  });
});
