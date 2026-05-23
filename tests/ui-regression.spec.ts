import { test, expect, type Page } from "@playwright/test";
import { clearIndexedDb, waitForApp } from "./helpers/seed-idb";

const APP_TIMEOUT = 30_000;
const STEP_TIMEOUT = 10_000;

// Production live-seed regression coverage only. Seeded fixture flows live in seeded-ui-regression.spec.ts.

async function gotoProductionTracker(page: Page) {
  await clearIndexedDb(page);
  await page.goto("/tracker.html?pw-ui-regression=1", { waitUntil: "domcontentloaded", timeout: APP_TIMEOUT });
  await waitForApp(page);
  await page.waitForFunction(() => typeof window.VocabTracker?.setView === "function", { timeout: APP_TIMEOUT });
}

async function setTrackerView(page: Page, view: string) {
  await page.evaluate((targetView) => window.VocabTracker.setView(targetView), view);
}

test("roadmap filters: production seed renders thirty-nine lessons and respects stage filters", async ({ page }) => {
  await gotoProductionTracker(page);
  await setTrackerView(page, "roadmap");

  await expect(page.locator(".tracker-panel h3", { hasText: "課程地圖" })).toBeVisible({ timeout: STEP_TIMEOUT });

  const stageFilter = page.getByTestId("roadmap-filter-stage");
  const statusFilter = page.getByTestId("roadmap-filter-status");
  const typeFilter = page.getByTestId("roadmap-filter-lesson_type");
  const summary = page.getByTestId("roadmap-summary");
  const lessonRows = page.getByTestId("roadmap-lesson-row");

  await expect(stageFilter).toBeVisible({ timeout: STEP_TIMEOUT });
  await expect(statusFilter).toBeVisible({ timeout: STEP_TIMEOUT });
  await expect(typeFilter).toBeVisible({ timeout: STEP_TIMEOUT });
  await expect(summary).toContainText("39/39 課顯示中", { timeout: STEP_TIMEOUT });
  await expect(lessonRows).toHaveCount(39, { timeout: STEP_TIMEOUT });
  await expect(lessonRows.first()).toContainText("V2-A-71", { timeout: STEP_TIMEOUT });
  await expect(lessonRows.first()).toContainText("Office Equipment Scene Vocabulary", { timeout: STEP_TIMEOUT });
  await expect(lessonRows.filter({ hasText: "V3-A-121" })).toContainText("辦公室 搭配詞 1", { timeout: STEP_TIMEOUT });
  await expect(lessonRows.filter({ hasText: "V2-MR-01" })).toContainText("V2 Mixed Review 01", { timeout: STEP_TIMEOUT });
  await expect(lessonRows.filter({ hasText: "V2-MR-02" })).toContainText("V2 Mixed Review 02", { timeout: STEP_TIMEOUT });
  await expect(lessonRows.filter({ hasText: "V3-A-135" })).toContainText("人事與組織", { timeout: STEP_TIMEOUT });
  await expect(lessonRows.filter({ hasText: "V3-A-136" })).toContainText("人事與組織", { timeout: STEP_TIMEOUT });
  await expect(lessonRows.filter({ hasText: "V3-A-137" })).toContainText("人事與組織", { timeout: STEP_TIMEOUT });
  await expect(lessonRows.filter({ hasText: "V3-A-138" })).toContainText("行銷與宣傳", { timeout: STEP_TIMEOUT });
  await expect(lessonRows.filter({ hasText: "V3-A-141" })).toContainText("財務會計", { timeout: STEP_TIMEOUT });
  await expect(lessonRows.filter({ hasText: "V3-A-142" })).toContainText("財務會計", { timeout: STEP_TIMEOUT });
  await expect(lessonRows.filter({ hasText: "V3-A-143" })).toContainText("財務會計", { timeout: STEP_TIMEOUT });

  await page.evaluate(() => window.VocabTracker.setRoadmapFilter("stage", "V2"));
  await expect(summary).toContainText("12/39 課顯示中", { timeout: STEP_TIMEOUT });
  await expect(lessonRows).toHaveCount(12, { timeout: STEP_TIMEOUT });

  await page.evaluate(() => window.VocabTracker.setRoadmapFilter("stage", "V3"));
  await expect(summary).toContainText("27/39 課顯示中", { timeout: STEP_TIMEOUT });
  await expect(lessonRows).toHaveCount(27, { timeout: STEP_TIMEOUT });
  await expect(lessonRows.filter({ hasText: "V3-MR-03" })).toContainText("V3 Mixed Review 03", { timeout: STEP_TIMEOUT });
  await expect(lessonRows.first()).toContainText("V3-A-121", { timeout: STEP_TIMEOUT });

  await page.evaluate(() => window.VocabTracker.setRoadmapFilter("stage", "V1"));
  await expect(summary).toContainText("0/39 課顯示中", { timeout: STEP_TIMEOUT });
  await expect(lessonRows).toHaveCount(0, { timeout: STEP_TIMEOUT });
  await expect(page.getByTestId("roadmap-lesson-list")).toContainText("目前篩選條件下沒有符合的課程。", { timeout: STEP_TIMEOUT });

  await page.getByRole("button", { name: "清除篩選" }).click({ timeout: STEP_TIMEOUT });
  await expect(summary).toContainText("39/39 課顯示中", { timeout: STEP_TIMEOUT });
  await expect(lessonRows).toHaveCount(39, { timeout: STEP_TIMEOUT });
});

test("today dashboard: live production wave shows lesson CTA and no diagnostic recommendation", async ({ page }) => {
  await gotoProductionTracker(page);

  const stageSealPanel = page.getByTestId("stage-seal-readiness");
  const v0SealCard = page.getByTestId("stage-seal-card-V0");
  const v2SealCard = page.getByTestId("stage-seal-card-V2");

  await expect(stageSealPanel).toBeVisible({ timeout: STEP_TIMEOUT });
  await expect(stageSealPanel).toContainText("階段封關準備度", { timeout: STEP_TIMEOUT });
  await expect(v0SealCard).toContainText("規劃中", { timeout: STEP_TIMEOUT });
  await expect(v0SealCard).toContainText("尚未有可執行課程。", { timeout: STEP_TIMEOUT });
  await expect(v2SealCard).toContainText("待作答", { timeout: STEP_TIMEOUT });
  await expect(v2SealCard).toContainText("尚未有作答資料", { timeout: STEP_TIMEOUT });
  await expect(v2SealCard).toContainText("0/12 已完成", { timeout: STEP_TIMEOUT });
  await expect(page.getByTestId("diagnostic-recommendation")).toHaveCount(0);
  await expect(page.locator(".tracker-hero")).toContainText("V2 TOEIC Scene Vocabulary", { timeout: STEP_TIMEOUT });
  await expect(page.locator(".tracker-hero")).toContainText("V2-A-71 · Office Equipment Scene Vocabulary", { timeout: STEP_TIMEOUT });
  await expect(page.getByRole("button", { name: "開始課程" }).first()).toBeVisible({ timeout: STEP_TIMEOUT });
  await expect(page.locator(".tracker-bigline")).toContainText("V2-A-71 · Office Equipment Scene Vocabulary", { timeout: STEP_TIMEOUT });
  await expect(page.locator(".today-focus")).toContainText("extension", { timeout: STEP_TIMEOUT });
  await expect(page.locator(".today-focus")).toContainText("photocopier", { timeout: STEP_TIMEOUT });
});

test("today next action: future multi-lesson production state selects first incomplete lesson", async ({ page }) => {
  await gotoProductionTracker(page);

  const result = await page.evaluate(async () => {
    const stateModule = await import("/js/state.js");
    const todayModule = await import("/js/views/today.js");
    const { state, currentLesson } = stateModule;
    const baselineLesson = state.lessons.find((lesson) => lesson.lesson_id === "V2-A-71");
    if (!baselineLesson) throw new Error("Missing V2-A-71 baseline lesson");

    state.prefs = {};
    state.lessons = [
      { ...baselineLesson, status: "completed" },
      {
        ...baselineLesson,
        lesson_id: "V2-A-72",
        lesson_number: 72,
        title: "Meeting Room Scene Vocabulary",
        status: "not_started"
      },
      {
        ...baselineLesson,
        lesson_id: "V2-A-73",
        lesson_number: 73,
        title: "Schedule Scene Vocabulary",
        status: "not_started"
      }
    ];
    state.attempts = [];
    state.sessions = [];
    state.reviewQueue = [];

    const selected = currentLesson()?.lesson_id;
    const html = todayModule.renderToday();
    return {
      selected,
      hasNextAction: html.includes("V2-A-72 · Meeting Room Scene Vocabulary"),
      skippedCompleted: !html.includes("V2-A-71 · Office Equipment Scene Vocabulary")
    };
  });

  expect(result.selected).toBe("V2-A-72");
  expect(result.hasNextAction).toBe(true);
  expect(result.skippedCompleted).toBe(true);
});

test("production seed banner stays hidden across main views when live lessons exist", async ({ page }) => {
  await gotoProductionTracker(page);

  const banner = page.getByTestId("empty-seed-banner");
  await expect(banner).toHaveCount(0);

  for (const view of ["roadmap", "lesson", "export", "bank", "settings"]) {
    await setTrackerView(page, view);
    await expect(page.getByTestId("empty-seed-banner")).toHaveCount(0);
  }
});

test("lesson view: live production lesson shows normal start CTA", async ({ page }) => {
  await gotoProductionTracker(page);
  await setTrackerView(page, "lesson");

  await expect(page.getByTestId("lesson-empty-state")).toHaveCount(0);
  await expect(page.locator(".tracker-panel h3", { hasText: "開始課程" })).toBeVisible({ timeout: STEP_TIMEOUT });
  await expect(page.locator(".tracker-bigline")).toContainText("V2-A-71 · Office Equipment Scene Vocabulary", { timeout: STEP_TIMEOUT });
  await expect(page.getByTestId("lesson-start-summary")).toContainText("24", { timeout: STEP_TIMEOUT });
  await expect(page.getByTestId("lesson-start-summary")).toContainText("45", { timeout: STEP_TIMEOUT });
  await expect(page.getByRole("button", { name: "開始目前課程" })).toBeVisible({ timeout: STEP_TIMEOUT });
  await expect(page.locator(".lesson-preview")).toContainText("extension", { timeout: STEP_TIMEOUT });
});

test("advanced tools entries: Today, Roadmap, and Settings stay aligned on desktop and mobile", async ({ page }) => {
  for (const viewport of [
    { width: 1280, height: 900 },
    { width: 390, height: 844 }
  ]) {
    await page.setViewportSize(viewport);
    await gotoProductionTracker(page);

    const tabs = page.locator("#tracker-tabs .tracker-tab");
    await expect(tabs).toHaveCount(8, { timeout: STEP_TIMEOUT });
    await expect(tabs).toHaveText(["今日", "課程地圖", "課程", "複習", "精熟度", "匯出", "題庫", "設定"], { timeout: STEP_TIMEOUT });

    const todayPanel = page.getByTestId("today-advanced-tools");
    await expect(todayPanel).toBeVisible({ timeout: STEP_TIMEOUT });
    await expect(todayPanel.getByRole("button")).toHaveText(["匯出完整資料封包", "題庫管理"], { timeout: STEP_TIMEOUT });

    await setTrackerView(page, "roadmap");
    const roadmapPanel = page.getByTestId("roadmap-advanced-tools");
    await expect(roadmapPanel).toBeVisible({ timeout: STEP_TIMEOUT });
    await expect(roadmapPanel.getByRole("button")).toHaveText(["匯出完整資料封包", "題庫管理"], { timeout: STEP_TIMEOUT });

    await roadmapPanel.getByRole("button", { name: "題庫管理" }).click({ timeout: STEP_TIMEOUT });
    await expect(page.locator(".tracker-panel h3", { hasText: "題庫管理" })).toBeVisible({ timeout: STEP_TIMEOUT });

    await setTrackerView(page, "settings");
    const settingsPanel = page.getByTestId("settings-advanced-tools");
    await expect(settingsPanel).toBeVisible({ timeout: STEP_TIMEOUT });
    await expect(settingsPanel.getByRole("button")).toHaveText(["匯出完整資料封包", "題庫管理"], { timeout: STEP_TIMEOUT });

    await settingsPanel.getByRole("button", { name: "匯出完整資料封包" }).click({ timeout: STEP_TIMEOUT });
    await expect(page.locator(".tracker-panel h3", { hasText: "匯出總覽" })).toBeVisible({ timeout: STEP_TIMEOUT });
  }
});

test("export inventory: expected analysis files are visible without downloading", async ({ page }) => {
  await gotoProductionTracker(page);
  await setTrackerView(page, "export");

  const inventory = page.getByTestId("export-file-inventory");
  await expect(page.locator(".tracker-panel h3", { hasText: "匯出總覽" })).toBeVisible({ timeout: STEP_TIMEOUT });
  await expect(inventory).toBeVisible({ timeout: STEP_TIMEOUT });

  for (const fileName of [
    "report.md",
    "summary.md",
    "lesson_recommendations.md",
    "diagnostic_recommendation.json",
    "stage_progress.json",
    "content_quality_summary.json",
    "attempts.csv",
    "attempts.json",
    "attempts.jsonl",
    "sessions.csv",
    "sessions.json",
    "item_mastery.csv",
    "mastery.json",
    "review_queue.json",
    "word_highlights.csv",
    "word_highlights.json",
    "error_logs.json",
    "error_summary.csv",
    "error_summary.json",
    "speed_summary.json",
    "review_effectiveness.csv",
    "review_effectiveness.json",
    "stage_seal_readiness.json",
    "word_highlight_summary.csv",
    "word_highlight_summary.json",
    "question_bank_snapshot.json",
    "raw_events.jsonl"
  ]) {
    await expect(page.getByRole("button", { name: fileName, exact: true })).toBeVisible({ timeout: STEP_TIMEOUT });
  }

  await expect(page.getByRole("button", { name: /^toeic_vocab_export_\d{4}-\d{2}-\d{2}\.json$/ })).toBeVisible({ timeout: STEP_TIMEOUT });
});

test("lesson word highlighter: selected English word is tracked and exported", async ({ page }) => {
  await gotoProductionTracker(page);

  await page.evaluate(async () => {
    await window.VocabTracker.startLesson("V2-A-71", { force: true });
  });

  await expect(page.getByTestId("word-highlight-panel")).toBeVisible({ timeout: STEP_TIMEOUT });
  await expect(page.getByTestId("word-highlight-current")).toContainText("尚未標記", { timeout: STEP_TIMEOUT });

  const highlightedWord = await page.evaluate(() => {
    const root = document.querySelector("[data-highlight-source='question_text']");
    if (!root) throw new Error("Missing question text");
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let node: Node | null = walker.nextNode();
    let word = "";
    let index = -1;
    while (node?.textContent) {
      const match = node.textContent.match(/[A-Za-z]{5,}/);
      if (match?.[0]) {
        word = match[0];
        index = match.index ?? -1;
        break;
      }
      node = walker.nextNode();
    }
    if (!node?.textContent || !word || index < 0) throw new Error("Missing selectable word");
    const range = document.createRange();
    range.setStart(node, index);
    range.setEnd(node, index + word.length);
    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);
    window.VocabTracker.captureLessonHighlight();
    return word;
  });

  await expect(page.getByTestId("word-highlight-current")).toContainText(highlightedWord, { timeout: STEP_TIMEOUT });
  await expect(page.locator(".word-highlight-mark", { hasText: highlightedWord })).toBeVisible({ timeout: STEP_TIMEOUT });

  await setTrackerView(page, "export");
  await expect(page.getByRole("button", { name: "word_highlights.csv", exact: true })).toBeVisible({ timeout: STEP_TIMEOUT });
  await expect(page.getByRole("button", { name: "word_highlight_summary.json", exact: true })).toBeVisible({ timeout: STEP_TIMEOUT });
  await expect(page.locator(".export-preview")).toContainText(highlightedWord, { timeout: STEP_TIMEOUT });
});

test("question bank: live production wave renders controls and paginates 780 rows", async ({ page }) => {
  await gotoProductionTracker(page);
  await setTrackerView(page, "bank");

  await expect(page.locator(".tracker-panel h3", { hasText: "題庫管理" })).toBeVisible({ timeout: STEP_TIMEOUT });

  const searchInput = page.getByTestId("question-bank-search");
  const questionCount = page.getByTestId("question-bank-count");
  const rows = page.getByTestId("question-bank-row");
  const loadMore = page.getByTestId("question-bank-load-more");

  await expect(searchInput).toBeVisible({ timeout: STEP_TIMEOUT });
  await expect(page.getByTestId("question-bank-local-warning")).toContainText("瀏覽器內的編輯只會寫進本機 IndexedDB", { timeout: STEP_TIMEOUT });
  await expect(questionCount.locator("strong")).toHaveText("780", { timeout: STEP_TIMEOUT });
  await expect(page.getByTestId("question-bank-patch-export")).toBeVisible({ timeout: STEP_TIMEOUT });
  await expect(page.getByTestId("question-bank-seed-export")).toBeVisible({ timeout: STEP_TIMEOUT });
  await expect(rows).toHaveCount(120, { timeout: STEP_TIMEOUT });
  await expect(loadMore).toBeVisible({ timeout: STEP_TIMEOUT });
  await loadMore.click();
  await expect(rows).toHaveCount(240, { timeout: STEP_TIMEOUT });
  await expect(loadMore).toBeVisible({ timeout: STEP_TIMEOUT });
  await loadMore.click();
  await expect(rows).toHaveCount(360, { timeout: STEP_TIMEOUT });
  await expect(loadMore).toBeVisible({ timeout: STEP_TIMEOUT });
  await loadMore.click();
  await expect(rows).toHaveCount(480, { timeout: STEP_TIMEOUT });
  await expect(loadMore).toBeVisible({ timeout: STEP_TIMEOUT });
  await loadMore.click();
  await expect(rows).toHaveCount(600, { timeout: STEP_TIMEOUT });
  await expect(loadMore).toBeVisible({ timeout: STEP_TIMEOUT });
  await loadMore.click();
  await expect(rows).toHaveCount(720, { timeout: STEP_TIMEOUT });
  await expect(loadMore).toBeVisible({ timeout: STEP_TIMEOUT });
  await loadMore.click();
  await expect(rows).toHaveCount(780, { timeout: STEP_TIMEOUT });
  await expect(loadMore).toHaveCount(0);

  await searchInput.fill("v2_a_71_q_001");
  await expect(questionCount.locator("strong")).toHaveText("1", { timeout: STEP_TIMEOUT });
  await expect(rows).toHaveCount(1, { timeout: STEP_TIMEOUT });
  await expect(rows.first()).toContainText("v2_a_71_q_001", { timeout: STEP_TIMEOUT });
  await expect(loadMore).toHaveCount(0);
});

test("stage seal: V0 remains planned while V2 shows awaiting-attempt multi-lesson status", async ({ page }) => {
  await gotoProductionTracker(page);

  const v0Card = page.getByTestId("stage-seal-card-V0");
  const v2Card = page.getByTestId("stage-seal-card-V2");
  await expect(v0Card).toBeVisible({ timeout: STEP_TIMEOUT });
  await expect(v0Card).toContainText("V0", { timeout: STEP_TIMEOUT });
  await expect(v0Card).toContainText("規劃中", { timeout: STEP_TIMEOUT });
  await expect(v0Card).toContainText("尚未有可執行課程。", { timeout: STEP_TIMEOUT });
  await expect(v2Card).toBeVisible({ timeout: STEP_TIMEOUT });
  await expect(v2Card).toContainText("V2", { timeout: STEP_TIMEOUT });
  await expect(v2Card).toContainText("待作答", { timeout: STEP_TIMEOUT });
  await expect(v2Card).toContainText("尚未有作答資料", { timeout: STEP_TIMEOUT });
  await expect(v2Card).toContainText("0/12 已完成", { timeout: STEP_TIMEOUT });
});

test("review mode: Mistakes view renders with heading and Start Review button", async ({ page }) => {
  await gotoProductionTracker(page);
  await setTrackerView(page, "mistakes");

  await expect(page.locator(".tracker-panel h3", { hasText: "複習模式" })).toBeVisible({ timeout: STEP_TIMEOUT });
  await expect(page.getByRole("button", { name: /開始複習/ })).toBeVisible({ timeout: STEP_TIMEOUT });
});
