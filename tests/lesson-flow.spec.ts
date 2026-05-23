import { test, expect } from "@playwright/test";
import { clearAndSeedIndexedDb, gotoSeededTracker, trackerSeed } from "./helpers/seed-idb";

const APP_TIMEOUT = 15_000;
const STEP_TIMEOUT = 10_000;
const INIT_TIMEOUT = 30_000;

/** Upper fold: question stem should start in the top ~48% of the viewport. */
const MOBILE_READING_MAX_QUESTION_TOP_RATIO = 0.48;
/** First answer option should remain in the upper ~78% (thumb reach without scrolling). */
const MOBILE_READING_MAX_FIRST_ANSWER_TOP_RATIO = 0.78;

test.beforeEach(async ({ page }) => {
  await gotoSeededTracker(page);
});

test("lesson start: mobile preflight panel keeps the primary CTA and local-first context visible", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/tracker.html?pw-lesson-start-mobile=1", { waitUntil: "domcontentloaded", timeout: APP_TIMEOUT });
  await page.waitForSelector("#tracker-tabs", { state: "visible", timeout: APP_TIMEOUT });
  await page.waitForFunction(() => typeof window.VocabTracker?.setView === "function", { timeout: INIT_TIMEOUT });

  await page.evaluate(() => window.VocabTracker.setView("lesson"));

  const panel = page.getByTestId("lesson-start-panel");
  await expect(panel).toBeVisible({ timeout: STEP_TIMEOUT });
  await expect(page.getByTestId("lesson-start-summary")).toContainText("5 題", { timeout: STEP_TIMEOUT });
  await expect(page.getByTestId("lesson-start-summary")).toContainText("約 15 分鐘", { timeout: STEP_TIMEOUT });
  await expect(page.getByTestId("lesson-start-sync-note")).toContainText("本機優先", { timeout: STEP_TIMEOUT });

  const actionLabels = await page.locator("[data-testid='lesson-start-actions'] .button").evaluateAll((elements) => elements.map((element) => element.textContent?.trim()));
  expect(actionLabels).toEqual(["開始目前課程", "選擇課程", "返回首頁"]);
  await expect(page.getByTestId("lesson-return-home")).toBeVisible({ timeout: STEP_TIMEOUT });

  const hasPageOverflow = await page.evaluate(() => {
    const root = document.documentElement;
    return root.scrollWidth > root.clientWidth + 1;
  });
  expect(hasPageOverflow).toBe(false);
});

test("lesson start: mobile Today and Roadmap launch paths work without desktop width", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/tracker.html?pw-lesson-entry-today=1", { waitUntil: "domcontentloaded", timeout: APP_TIMEOUT });
  await page.waitForSelector("#tracker-tabs", { state: "visible", timeout: APP_TIMEOUT });
  await page.waitForFunction(() => typeof window.VocabTracker?.setView === "function", { timeout: INIT_TIMEOUT });

  await page.evaluate(() => window.VocabTracker.setView("today"));
  const todayStart = page.getByTestId("today-start-lesson").first();
  await expect(todayStart).toBeVisible({ timeout: STEP_TIMEOUT });
  await expect(todayStart).toBeInViewport({ timeout: STEP_TIMEOUT });
  await todayStart.click({ timeout: STEP_TIMEOUT });
  await expect(page.locator(".runtime-shell")).toBeVisible({ timeout: STEP_TIMEOUT });

  let hasPageOverflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
  expect(hasPageOverflow).toBe(false);

  await gotoSeededTracker(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.evaluate(() => window.VocabTracker.setView("roadmap"));
  const roadmapStart = page.getByTestId("roadmap-start-lesson").first();
  await roadmapStart.scrollIntoViewIfNeeded();
  await expect(roadmapStart).toBeVisible({ timeout: STEP_TIMEOUT });
  await roadmapStart.click({ timeout: STEP_TIMEOUT });
  await expect(page.locator(".runtime-shell")).toBeVisible({ timeout: STEP_TIMEOUT });

  hasPageOverflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
  expect(hasPageOverflow).toBe(false);
});

test("lesson start: mobile preflight panel prioritizes pending sync context before launch", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/tracker.html?pw-lesson-start-sync=1", { waitUntil: "domcontentloaded", timeout: APP_TIMEOUT });
  await page.waitForSelector("#tracker-tabs", { state: "visible", timeout: APP_TIMEOUT });
  await page.waitForFunction(() => typeof window.VocabTracker?.setView === "function", { timeout: INIT_TIMEOUT });

  await page.evaluate(() => {
    window.GoogleDriveSyncData?.setAutoSyncEnabled?.(true);
    window.GoogleDriveSyncData?.markLocalChange?.("lesson_completion");
    window.VocabTracker.setView("lesson");
  });

  await expect(page.getByTestId("lesson-start-sync-note")).toContainText("待同步變更", { timeout: STEP_TIMEOUT });
});

test("lesson flow: start lesson, answer every question, and finish into error review", async ({ page }) => {
  await page.goto("/tracker.html?pw-lesson-flow=1", { waitUntil: "domcontentloaded", timeout: APP_TIMEOUT });
  await page.waitForSelector("#tracker-tabs", { state: "visible", timeout: APP_TIMEOUT });
  await page.waitForFunction(() => typeof window.VocabTracker?.setView === "function", { timeout: INIT_TIMEOUT });

  await page.evaluate(() => window.VocabTracker.setView("lesson"));

  const startLessonButton = page.getByRole("button", { name: "開始目前課程" });
  await expect(startLessonButton).toBeVisible({ timeout: STEP_TIMEOUT });
  await startLessonButton.click({ timeout: STEP_TIMEOUT });

  const questionText = page.locator(".question-text");
  const answerButtons = page.locator(".answer-button");
  const lessonElapsed = page.locator("#lesson-elapsed");

  await expect(questionText).toBeVisible({ timeout: STEP_TIMEOUT });
  await expect(answerButtons).toHaveCount(4, { timeout: STEP_TIMEOUT });
  await page.waitForFunction(() => {
    const timer = document.getElementById("lesson-elapsed");
    return !!timer && (timer.textContent || "").trim() !== "0:00";
  }, { timeout: STEP_TIMEOUT });
  await expect(lessonElapsed).not.toHaveText("0:00", { timeout: STEP_TIMEOUT });

  for (let index = 0; index < trackerSeed.questionIds.length; index += 1) {
    await expect(questionText).toBeVisible({ timeout: STEP_TIMEOUT });
    await expect(answerButtons).toHaveCount(4, { timeout: STEP_TIMEOUT });

    const currentQuestionText = ((await questionText.textContent()) || "").trim();
    const firstAnswerButton = answerButtons.first();
    await expect(firstAnswerButton).toBeEnabled({ timeout: STEP_TIMEOUT });
    await firstAnswerButton.click({ timeout: STEP_TIMEOUT });
    const attemptsBeforeConfirm = await page.evaluate(async () => {
      const attempts = await window.VocabDB.getAll("attempts");
      return attempts.length;
    });
    expect(attemptsBeforeConfirm).toBe(index);

    const confirmButton = page.getByRole("button", { name: "確認答案" });
    await expect(confirmButton).toBeEnabled({ timeout: STEP_TIMEOUT });
    await confirmButton.click({ timeout: STEP_TIMEOUT });
    const attemptsAfterConfirm = await page.evaluate(async () => {
      const attempts = await window.VocabDB.getAll("attempts");
      return attempts.length;
    });
    expect(attemptsAfterConfirm).toBe(index + 1);

    // Feedback panel appears — wait for the advance button and click it
    const advanceButton = page.getByRole("button", { name: /下一題|查看摘要/ });
    await expect(advanceButton).toBeVisible({ timeout: STEP_TIMEOUT });
    const lockedQuestionTime = ((await page.locator("#question-elapsed").textContent()) || "").trim();
    await page.waitForTimeout(1200);
    await expect(page.locator("#question-elapsed")).toHaveText(lockedQuestionTime, { timeout: STEP_TIMEOUT });
    await advanceButton.click({ timeout: STEP_TIMEOUT });

    if (index < trackerSeed.questionIds.length - 1) {
      await page.waitForFunction((questionTextValue) => {
        const currentQuestion = document.querySelector(".question-text");
        return !!currentQuestion && currentQuestion.textContent?.trim() !== questionTextValue;
      }, currentQuestionText, { timeout: STEP_TIMEOUT });
      await expect(questionText).not.toHaveText(currentQuestionText, { timeout: STEP_TIMEOUT });
    }
  }

  const finishLessonButton = page.getByRole("button", { name: "完成課程" });
  await expect(finishLessonButton).toBeVisible({ timeout: STEP_TIMEOUT });
  await finishLessonButton.click({ timeout: STEP_TIMEOUT });

  const errorReviewHeading = page.locator(".tracker-panel h3", { hasText: "錯題回顧與安排" });
  await expect(errorReviewHeading).toBeVisible({ timeout: APP_TIMEOUT });

  await page.getByRole("button", { name: "先跳過" }).click({ timeout: STEP_TIMEOUT });
  await page.evaluate(() => window.VocabTracker.setView("mistakes"));

  await expect(page.locator(".tracker-panel h3", { hasText: "最近作答紀錄" })).toBeVisible({ timeout: STEP_TIMEOUT });
  await expect(page.locator(".answer-record").first()).toContainText("你的 A", { timeout: STEP_TIMEOUT });
  await expect(page.locator(".answer-record").first()).toContainText(/\d+\.\d+s/, { timeout: STEP_TIMEOUT });
});

test("lesson flow: mobile viewport completes the lesson flow without page overflow", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/tracker.html?pw-lesson-flow-mobile=1", { waitUntil: "domcontentloaded", timeout: APP_TIMEOUT });
  await page.waitForSelector("#tracker-tabs", { state: "visible", timeout: APP_TIMEOUT });
  await page.waitForFunction(() => typeof window.VocabTracker?.setView === "function", { timeout: INIT_TIMEOUT });

  await page.evaluate(() => window.VocabTracker.setView("lesson"));

  const runtimeShell = page.locator(".runtime-shell");
  const questionText = page.locator(".question-text");
  const answerButtons = page.locator(".answer-button");
  const confirmButton = page.getByRole("button", { name: "確認答案" });

  await expect(page.getByRole("button", { name: "開始目前課程" })).toBeVisible({ timeout: STEP_TIMEOUT });
  await page.getByRole("button", { name: "開始目前課程" }).click({ timeout: STEP_TIMEOUT });

  await expect(runtimeShell).toBeVisible({ timeout: STEP_TIMEOUT });
  await expect(questionText).toBeVisible({ timeout: STEP_TIMEOUT });
  await expect(answerButtons).toHaveCount(4, { timeout: STEP_TIMEOUT });

  const hasPageOverflow = await page.evaluate(() => {
    const root = document.documentElement;
    return root.scrollWidth > root.clientWidth + 1;
  });
  expect(hasPageOverflow).toBe(false);

  for (let index = 0; index < trackerSeed.questionIds.length; index += 1) {
    await expect(questionText).toBeVisible({ timeout: STEP_TIMEOUT });
    await expect(answerButtons).toHaveCount(4, { timeout: STEP_TIMEOUT });
    await expect(answerButtons.first()).toBeVisible({ timeout: STEP_TIMEOUT });

    await answerButtons.first().click({ timeout: STEP_TIMEOUT });
    await expect(confirmButton).toBeEnabled({ timeout: STEP_TIMEOUT });
    await confirmButton.click({ timeout: STEP_TIMEOUT });
    const advanceButton = page.getByRole("button", { name: /^(下一題|查看摘要)$/ });
    await expect(advanceButton).toBeVisible({ timeout: STEP_TIMEOUT });
    await advanceButton.click({ timeout: STEP_TIMEOUT });
  }

  await expect(page.getByRole("button", { name: "完成課程" })).toBeVisible({ timeout: STEP_TIMEOUT });
  await page.getByRole("button", { name: "完成課程" }).click({ timeout: STEP_TIMEOUT });
  await expect(page.locator(".tracker-panel h3", { hasText: "錯題回顧與安排" })).toBeVisible({ timeout: APP_TIMEOUT });
});

test("lesson flow: mobile runtime keeps the first question inside the upper reading zone", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/tracker.html?pw-lesson-reading-mobile=1", { waitUntil: "domcontentloaded", timeout: APP_TIMEOUT });
  await page.waitForSelector("#tracker-tabs", { state: "visible", timeout: APP_TIMEOUT });
  await page.waitForFunction(() => typeof window.VocabTracker?.setView === "function", { timeout: INIT_TIMEOUT });

  await page.evaluate(() => window.VocabTracker.setView("lesson"));
  await page.getByRole("button", { name: "開始目前課程" }).click({ timeout: STEP_TIMEOUT });

  const guidance = page.getByTestId("question-guidance");
  await expect(guidance).toBeVisible({ timeout: STEP_TIMEOUT });
  await expect(guidance).not.toHaveAttribute("open", { timeout: STEP_TIMEOUT });
  await expect(page.locator(".keyboard-hint")).toHaveCount(0);

  const highlightPanel = page.getByTestId("word-highlight-panel");
  await expect(highlightPanel).toBeVisible({ timeout: STEP_TIMEOUT });
  await expect(highlightPanel).not.toHaveAttribute("open", { timeout: STEP_TIMEOUT });

  const readingStyles = await page.evaluate(() => {
    const question = document.querySelector(".question-text");
    const option = document.querySelector(".answer-button span");
    const questionStyle = question ? window.getComputedStyle(question) : null;
    const optionStyle = option ? window.getComputedStyle(option) : null;
    return {
      questionMaxWidth: questionStyle?.maxWidth || "",
      optionOverflowWrap: optionStyle?.overflowWrap || ""
    };
  });
  expect(readingStyles.questionMaxWidth).not.toBe("none");
  expect(["break-word", "anywhere"].includes(readingStyles.optionOverflowWrap)).toBe(true);

  const metrics = await page.evaluate(() => {
    const question = document.querySelector(".question-text")?.getBoundingClientRect();
    const firstAnswer = document.querySelector(".answer-button")?.getBoundingClientRect();
    return {
      questionTop: Math.round(question?.top || 0),
      firstAnswerTop: Math.round(firstAnswer?.top || 0),
      viewportHeight: window.innerHeight
    };
  });

  expect(metrics.questionTop / metrics.viewportHeight).toBeLessThan(MOBILE_READING_MAX_QUESTION_TOP_RATIO);
  expect(metrics.firstAnswerTop / metrics.viewportHeight).toBeLessThan(MOBILE_READING_MAX_FIRST_ANSWER_TOP_RATIO);
});

test("lesson flow: mobile reading layout wraps long option text without horizontal overflow", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/tracker.html?pw-lesson-reading-overflow=1", { waitUntil: "domcontentloaded", timeout: APP_TIMEOUT });
  await page.waitForSelector("#tracker-tabs", { state: "visible", timeout: APP_TIMEOUT });
  await page.waitForFunction(() => typeof window.VocabTracker?.setView === "function", { timeout: INIT_TIMEOUT });

  await page.evaluate(() => window.VocabTracker.setView("lesson"));
  await page.getByRole("button", { name: "開始目前課程" }).click({ timeout: STEP_TIMEOUT });

  await page.evaluate(() => {
    const option = document.querySelector(".answer-button span");
    if (option) {
      option.textContent = "internationalization supercalifragilisticexpialidocious procurement subcontractor";
    }
  });

  const overflow = await page.evaluate(() => {
    const root = document.documentElement;
    const button = document.querySelector(".answer-button");
    const buttonOverflow = button ? button.scrollWidth > button.clientWidth + 1 : false;
    return {
      page: root.scrollWidth > root.clientWidth + 1,
      button: buttonOverflow
    };
  });
  expect(overflow.page).toBe(false);
  expect(overflow.button).toBe(false);
});

test("lesson flow: landscape mobile keeps lesson readable and actionable", async ({ page }) => {
  await page.setViewportSize({ width: 844, height: 390 });
  await page.goto("/tracker.html?pw-lesson-landscape-mobile=1", { waitUntil: "domcontentloaded", timeout: APP_TIMEOUT });
  await page.waitForSelector("#tracker-tabs", { state: "visible", timeout: APP_TIMEOUT });
  await page.waitForFunction(() => typeof window.VocabTracker?.setView === "function", { timeout: INIT_TIMEOUT });

  await page.evaluate(() => window.VocabTracker.setView("lesson"));
  await page.getByRole("button", { name: "開始目前課程" }).click({ timeout: STEP_TIMEOUT });

  await expect(page.locator(".question-text")).toBeVisible({ timeout: STEP_TIMEOUT });
  await expect(page.getByRole("button", { name: "確認答案" })).toBeVisible({ timeout: STEP_TIMEOUT });
  await expect(page.getByTestId("runtime-action-tray")).toBeVisible({ timeout: STEP_TIMEOUT });

  const hasPageOverflow = await page.evaluate(() => {
    const root = document.documentElement;
    return root.scrollWidth > root.clientWidth + 1;
  });
  expect(hasPageOverflow).toBe(false);
});

test("lesson flow: larger mobile viewport keeps reading density stable and isolates secondary actions", async ({ page }) => {
  await page.setViewportSize({ width: 412, height: 915 });
  await page.goto("/tracker.html?pw-lesson-ergonomics-mobile=1", { waitUntil: "domcontentloaded", timeout: APP_TIMEOUT });
  await page.waitForSelector("#tracker-tabs", { state: "visible", timeout: APP_TIMEOUT });
  await page.waitForFunction(() => typeof window.VocabTracker?.setView === "function", { timeout: INIT_TIMEOUT });

  await page.evaluate(() => window.VocabTracker.setView("lesson"));
  await page.getByRole("button", { name: "開始目前課程" }).click({ timeout: STEP_TIMEOUT });

  const actionTray = page.getByTestId("runtime-action-tray");
  await expect(actionTray).toBeVisible({ timeout: STEP_TIMEOUT });
  await expect(actionTray).not.toHaveAttribute("open", { timeout: STEP_TIMEOUT });
  await expect(page.getByRole("button", { name: "上一題" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "確認答案" })).toBeVisible({ timeout: STEP_TIMEOUT });
  await expect(page.getByRole("button", { name: "先略過這題" })).toBeHidden({ timeout: STEP_TIMEOUT });

  const beforeSelect = await page.evaluate(() => {
    const question = document.querySelector(".question-text")?.getBoundingClientRect();
    const buttons = [...document.querySelectorAll(".answer-button")].map((element) => {
      const style = window.getComputedStyle(element);
      return {
        height: Math.round(element.getBoundingClientRect().height),
        borderColor: style.borderColor,
        backgroundColor: style.backgroundColor,
        selected: element.classList.contains("selected")
      };
    });
    return {
      questionTop: Math.round(question?.top || 0),
      viewportHeight: window.innerHeight,
      buttons
    };
  });

  expect(beforeSelect.questionTop / beforeSelect.viewportHeight).toBeLessThan(MOBILE_READING_MAX_QUESTION_TOP_RATIO);
  expect(new Set(beforeSelect.buttons.map((button) => button.height)).size).toBe(1);
  expect(beforeSelect.buttons[0]?.height || 0).toBeGreaterThanOrEqual(60);

  await page.locator(".answer-button").first().click({ timeout: STEP_TIMEOUT });

  const afterSelect = await page.evaluate(() => {
    const buttons = [...document.querySelectorAll(".answer-button")].map((element) => {
      const style = window.getComputedStyle(element);
      return {
        borderColor: style.borderColor,
        backgroundColor: style.backgroundColor,
        selected: element.classList.contains("selected")
      };
    });
    return {
      selected: buttons.find((button) => button.selected),
      unselected: buttons.find((button) => !button.selected)
    };
  });

  expect(afterSelect.selected?.borderColor).not.toBe(afterSelect.unselected?.borderColor);
  expect(afterSelect.selected?.backgroundColor).not.toBe(afterSelect.unselected?.backgroundColor);

  await actionTray.locator("summary").click({ timeout: STEP_TIMEOUT });
  await expect(actionTray).toHaveAttribute("open", { timeout: STEP_TIMEOUT });
  await expect(page.getByRole("button", { name: "先略過這題" })).toBeVisible({ timeout: STEP_TIMEOUT });
  await expect(page.getByRole("button", { name: "離開" })).toBeVisible({ timeout: STEP_TIMEOUT });
});

test("lesson flow: mobile shows previous control only after the first question", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/tracker.html?pw-lesson-previous-mobile=1", { waitUntil: "domcontentloaded", timeout: APP_TIMEOUT });
  await page.waitForSelector("#tracker-tabs", { state: "visible", timeout: APP_TIMEOUT });
  await page.waitForFunction(() => typeof window.VocabTracker?.setView === "function", { timeout: INIT_TIMEOUT });

  await page.evaluate(() => window.VocabTracker.setView("lesson"));
  await page.getByRole("button", { name: "開始目前課程" }).click({ timeout: STEP_TIMEOUT });

  const actionTray = page.getByTestId("runtime-action-tray");
  await actionTray.locator("summary").click({ timeout: STEP_TIMEOUT });
  await expect(page.getByRole("button", { name: "上一題" })).toHaveCount(0);

  await page.locator(".answer-button").first().click({ timeout: STEP_TIMEOUT });
  await page.getByTestId("confirm-answer").click({ timeout: STEP_TIMEOUT });
  await page.getByTestId("feedback-advance").click({ timeout: STEP_TIMEOUT });

  await actionTray.locator("summary").click({ timeout: STEP_TIMEOUT });
  await expect(page.getByRole("button", { name: "上一題" })).toBeVisible({ timeout: STEP_TIMEOUT });
});

test("lesson flow: mobile answer controls prevent double confirm and show disabled affordance", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/tracker.html?pw-lesson-controls-mobile=1", { waitUntil: "domcontentloaded", timeout: APP_TIMEOUT });
  await page.waitForSelector("#tracker-tabs", { state: "visible", timeout: APP_TIMEOUT });
  await page.waitForFunction(() => typeof window.VocabTracker?.setView === "function", { timeout: INIT_TIMEOUT });

  await page.evaluate(() => window.VocabTracker.setView("lesson"));
  await page.getByRole("button", { name: "開始目前課程" }).click({ timeout: STEP_TIMEOUT });

  const confirmButton = page.getByTestId("confirm-answer");
  await expect(confirmButton).toBeDisabled({ timeout: STEP_TIMEOUT });

  const disabledStyle = await confirmButton.evaluate((element) => {
    const style = window.getComputedStyle(element);
    return {
      borderStyle: style.borderStyle,
      opacity: style.opacity
    };
  });
  expect(disabledStyle.borderStyle).toBe("dashed");

  const selectionStarted = Date.now();
  await page.locator(".answer-button").first().click({ timeout: STEP_TIMEOUT });
  await page.locator(".answer-button.selected").waitFor({ state: "visible", timeout: 250 });
  expect(Date.now() - selectionStarted).toBeLessThan(250);

  await confirmButton.dblclick({ timeout: STEP_TIMEOUT });
  await expect(page.getByTestId("feedback-panel")).toBeVisible({ timeout: STEP_TIMEOUT });
  const attemptCount = await page.evaluate(async () => {
    const attempts = await window.VocabDB.getAll("attempts");
    return attempts.length;
  });
  expect(attemptCount).toBe(1);
});

test("lesson flow: mobile feedback keeps momentum visible and defers detail until expanded", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/tracker.html?pw-lesson-feedback-mobile=1", { waitUntil: "domcontentloaded", timeout: APP_TIMEOUT });
  await page.waitForSelector("#tracker-tabs", { state: "visible", timeout: APP_TIMEOUT });
  await page.waitForFunction(() => typeof window.VocabTracker?.setView === "function", { timeout: INIT_TIMEOUT });

  await page.evaluate(() => window.VocabTracker.setView("lesson"));
  await page.getByRole("button", { name: "開始目前課程" }).click({ timeout: STEP_TIMEOUT });

  const firstQuestionText = ((await page.locator(".question-text").textContent()) || "").trim();
  await page.locator(".answer-button").first().click({ timeout: STEP_TIMEOUT });

  const confirmStarted = Date.now();
  await page.getByRole("button", { name: "確認答案" }).click({ timeout: STEP_TIMEOUT });

  const feedbackPanel = page.getByTestId("feedback-panel");
  await expect(feedbackPanel).toBeVisible({ timeout: 300 });
  expect(Date.now() - confirmStarted).toBeLessThan(300);
  await expect(page.getByTestId("feedback-momentum")).toContainText("1 /", { timeout: STEP_TIMEOUT });
  await expect(page.getByTestId("feedback-learning-details")).toBeVisible({ timeout: STEP_TIMEOUT });
  await expect(page.getByTestId("feedback-learning-details")).not.toHaveAttribute("open", { timeout: STEP_TIMEOUT });
  await expect(page.getByTestId("feedback-advance")).toBeVisible({ timeout: STEP_TIMEOUT });

  const timerLocked = await page.evaluate(() => {
    const timer = document.querySelector("#question-elapsed");
    return {
      text: timer?.textContent?.trim() || "",
      locked: timer?.classList.contains("is-locked") || false
    };
  });
  expect(timerLocked.text).toMatch(/\d/);
  expect(timerLocked.locked).toBe(true);

  const advanceTop = await page.getByTestId("feedback-advance").evaluate((element) => {
    const rect = element.getBoundingClientRect();
    return rect.top / window.innerHeight;
  });
  expect(advanceTop).toBeLessThan(0.92);

  await page.getByTestId("feedback-advance").click({ timeout: STEP_TIMEOUT });
  await page.waitForFunction((questionTextValue) => {
    const currentQuestion = document.querySelector(".question-text");
    return !!currentQuestion && currentQuestion.textContent?.trim() !== questionTextValue;
  }, firstQuestionText, { timeout: STEP_TIMEOUT });
  await expect(page.locator(".question-text")).not.toHaveText(firstQuestionText, { timeout: STEP_TIMEOUT });

  const nextQuestionTop = await page.locator(".question-text").evaluate((element) => element.getBoundingClientRect().top / window.innerHeight);
  expect(nextQuestionTop).toBeLessThan(MOBILE_READING_MAX_QUESTION_TOP_RATIO);
});

test("lesson flow: mobile finish and error review keep primary CTA first", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/tracker.html?pw-lesson-finish-mobile=1", { waitUntil: "domcontentloaded", timeout: APP_TIMEOUT });
  await page.waitForSelector("#tracker-tabs", { state: "visible", timeout: APP_TIMEOUT });
  await page.waitForFunction(() => typeof window.VocabTracker?.setView === "function", { timeout: INIT_TIMEOUT });

  await page.evaluate(() => window.VocabTracker.setView("lesson"));
  await page.getByRole("button", { name: "開始目前課程" }).click({ timeout: STEP_TIMEOUT });

  const questionText = page.locator(".question-text");
  const answerButtons = page.locator(".answer-button");
  const confirmButton = page.getByTestId("confirm-answer");

  for (let index = 0; index < trackerSeed.questionIds.length; index += 1) {
    await expect(questionText).toBeVisible({ timeout: STEP_TIMEOUT });
    const currentQuestionText = ((await questionText.textContent()) || "").trim();
    await answerButtons.first().click({ timeout: STEP_TIMEOUT });
    await expect(confirmButton).toBeEnabled({ timeout: STEP_TIMEOUT });
    await confirmButton.click({ timeout: STEP_TIMEOUT });

    const advanceButton = page.getByTestId("feedback-advance");
    await expect(advanceButton).toBeVisible({ timeout: STEP_TIMEOUT });
    await advanceButton.click({ timeout: STEP_TIMEOUT });

    if (index < trackerSeed.questionIds.length - 1) {
      await page.waitForFunction((questionTextValue) => {
        const currentQuestion = document.querySelector(".question-text");
        return !!currentQuestion && currentQuestion.textContent?.trim() !== questionTextValue;
      }, currentQuestionText, { timeout: STEP_TIMEOUT });
    }
  }

  const finishPanel = page.getByTestId("finish-panel");
  await expect(finishPanel).toBeVisible({ timeout: STEP_TIMEOUT });
  await expect(page.getByTestId("finish-panel-summary")).toContainText("5", { timeout: STEP_TIMEOUT });

  const finishTop = await page.getByTestId("finish-lesson").evaluate((element) => element.getBoundingClientRect().top / window.innerHeight);
  expect(finishTop).toBeLessThan(0.92);
  await expect(page.getByTestId("finish-recap-metrics")).toBeVisible({ timeout: STEP_TIMEOUT });

  await page.getByTestId("finish-lesson").click({ timeout: STEP_TIMEOUT });
  await expect(page.getByTestId("post-lesson-next-steps")).toBeVisible({ timeout: APP_TIMEOUT });
  await expect(page.getByTestId("post-lesson-recap")).toContainText("/", { timeout: STEP_TIMEOUT });
  await expect(page.getByTestId("error-review-panel")).toBeVisible({ timeout: APP_TIMEOUT });

  const actionOrder = await page.getByTestId("error-review-actions").evaluate((element) => {
    const buttons = [...element.querySelectorAll(".button")];
    return buttons.map((button) => button.textContent?.trim() || "");
  });
  expect(actionOrder[0]).toContain("儲存確認後錯因");

  await page.getByTestId("skip-session-review").click({ timeout: STEP_TIMEOUT });
  await page.evaluate(() => window.VocabTracker.setView("mistakes"));
  await expect(page.locator(".tracker-panel h3", { hasText: "最近作答紀錄" })).toBeVisible({ timeout: STEP_TIMEOUT });
});

test("lesson flow: mobile reload shows resume banner after partial progress", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/tracker.html?pw-lesson-resume-banner=1", { waitUntil: "domcontentloaded", timeout: APP_TIMEOUT });
  await page.waitForSelector("#tracker-tabs", { state: "visible", timeout: APP_TIMEOUT });
  await page.waitForFunction(() => typeof window.VocabTracker?.setView === "function", { timeout: INIT_TIMEOUT });

  await page.evaluate(() => window.VocabTracker.setView("lesson"));
  await page.getByRole("button", { name: "開始目前課程" }).click({ timeout: STEP_TIMEOUT });
  await page.locator(".answer-button").first().click({ timeout: STEP_TIMEOUT });
  await page.getByTestId("confirm-answer").click({ timeout: STEP_TIMEOUT });
  await page.getByTestId("feedback-advance").click({ timeout: STEP_TIMEOUT });

  await page.reload({ waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => typeof window.VocabTracker?.setView === "function", { timeout: INIT_TIMEOUT });
  await page.evaluate(() => window.VocabTracker.setView("lesson"));

  await expect(page.getByTestId("lesson-resume-banner")).toBeVisible({ timeout: STEP_TIMEOUT });
  await expect(page.getByTestId("lesson-resume-banner")).toContainText("1/5", { timeout: STEP_TIMEOUT });
  await page.getByTestId("dismiss-resume-banner").click({ timeout: STEP_TIMEOUT });
  await expect(page.getByTestId("lesson-resume-banner")).toHaveCount(0, { timeout: STEP_TIMEOUT });
});

test("lesson flow: mobile exit lesson requires confirmation", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  page.once("dialog", async (dialog) => {
    expect(dialog.type()).toBe("confirm");
    await dialog.accept();
  });

  await page.goto("/tracker.html?pw-lesson-exit-confirm=1", { waitUntil: "domcontentloaded", timeout: APP_TIMEOUT });
  await page.waitForSelector("#tracker-tabs", { state: "visible", timeout: APP_TIMEOUT });
  await page.waitForFunction(() => typeof window.VocabTracker?.setView === "function", { timeout: INIT_TIMEOUT });

  await page.evaluate(() => window.VocabTracker.setView("lesson"));
  await page.getByRole("button", { name: "開始目前課程" }).click({ timeout: STEP_TIMEOUT });

  const actionTray = page.getByTestId("runtime-action-tray");
  await actionTray.locator("summary").click({ timeout: STEP_TIMEOUT });
  await page.getByRole("button", { name: "離開" }).click({ timeout: STEP_TIMEOUT });
  await expect(page.locator(".tracker-tab.active")).toContainText("今日", { timeout: STEP_TIMEOUT });
});

test("lesson flow: mobile pause keeps pending answer after reload", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/tracker.html?pw-lesson-pause-mobile=1", { waitUntil: "domcontentloaded", timeout: APP_TIMEOUT });
  await page.waitForSelector("#tracker-tabs", { state: "visible", timeout: APP_TIMEOUT });
  await page.waitForFunction(() => typeof window.VocabTracker?.setView === "function", { timeout: INIT_TIMEOUT });

  await page.evaluate(() => window.VocabTracker.setView("lesson"));
  await page.getByRole("button", { name: "開始目前課程" }).click({ timeout: STEP_TIMEOUT });
  await page.locator(".answer-button").nth(1).click({ timeout: STEP_TIMEOUT });

  const actionTray = page.getByTestId("runtime-action-tray");
  await actionTray.locator("summary").click({ timeout: STEP_TIMEOUT });
  await page.getByRole("button", { name: "暫停" }).click({ timeout: STEP_TIMEOUT });
  await expect(page.getByTestId("lesson-paused-alert")).toBeVisible({ timeout: STEP_TIMEOUT });
  await expect(page.getByTestId("confirm-answer")).toBeDisabled({ timeout: STEP_TIMEOUT });

  await page.reload({ waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => typeof window.VocabTracker?.setView === "function", { timeout: INIT_TIMEOUT });
  await page.evaluate(() => window.VocabTracker.setView("lesson"));

  await expect(page.locator(".answer-button.selected")).toHaveCount(1, { timeout: STEP_TIMEOUT });
  await expect(page.getByTestId("lesson-paused-alert")).toBeVisible({ timeout: STEP_TIMEOUT });
});
