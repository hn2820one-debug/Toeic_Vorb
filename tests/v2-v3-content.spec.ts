import { test, expect, type Download } from "@playwright/test";
import fs from "node:fs";
import { clearAndSeedIndexedDb, waitForApp } from "./helpers/seed-idb";

const APP_TIMEOUT = 20_000;
const STEP_TIMEOUT = 10_000;

// Seeded V2/V3 fixture coverage only. Production-empty behavior is covered elsewhere.

async function answerQuestions(page, lessonId: string, count: number) {
  await page.evaluate(async (id) => {
    // force: true bypasses the stage-seal soft gate so V2/V3 content tests are not blocked
    await window.VocabTracker.startLesson(id, { force: true });
  }, lessonId);

  const questionText = page.locator(".question-text");
  const answerButtons = page.locator(".answer-button");
  await expect(questionText).toBeVisible({ timeout: STEP_TIMEOUT });
  await expect(answerButtons).toHaveCount(4, { timeout: STEP_TIMEOUT });

  for (let index = 0; index < count; index += 1) {
    await expect(answerButtons.first()).toBeEnabled({ timeout: STEP_TIMEOUT });
    await answerButtons.first().click({ timeout: STEP_TIMEOUT });
    const confirmButton = page.getByRole("button", { name: "確認答案" });
    await expect(confirmButton).toBeEnabled({ timeout: STEP_TIMEOUT });
    await confirmButton.click({ timeout: STEP_TIMEOUT });
    const advanceButton = page.getByRole("button", { name: /下一題|查看摘要/ });
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

async function seedV2V3Fixture(page) {
  await page.evaluate(async () => {
    const lessons = [
      {
        lesson_id: "PW-V2-001",
        lesson_number: 201,
        stage: "V2",
        stage_name: "TOEIC Scene Vocabulary",
        title: "Playwright V2 Scene Lesson",
        lesson_type: "core",
        status: "not_started",
        estimated_minutes: 12,
        grammar_link_id: "wf_accurate",
        question_ids: ["pw_v2_q_001", "pw_v2_q_002", "pw_v2_q_003"],
        review_question_ids: []
      },
      {
        lesson_id: "PW-V3-001",
        lesson_number: 301,
        stage: "V3",
        stage_name: "Collocation",
        title: "Playwright V3 Context Lesson",
        lesson_type: "core",
        status: "not_started",
        estimated_minutes: 12,
        grammar_link_id: "wf_accurate",
        question_ids: ["pw_v3_q_001", "pw_v3_q_002", "pw_v3_q_003"],
        review_question_ids: []
      }
    ];

    const questions = [
      {
        question_id: "pw_v2_q_001",
        lesson_id: "PW-V2-001",
        stage: "V2",
        type: "scene_vocabulary",
        skill: "scene_vocabulary",
        subskill: "office_scene",
        grammar_link_id: "wf_accurate",
        question_text: "Office: Please place the signed contract in the ______ before noon.",
        options: { A: "cabinet", B: "receipt", C: "festival", D: "highway" },
        correct_answer: "A",
        explanation_zh: "辦公室場景中，signed contract 最自然放進 cabinet。",
        target_item_id: "item_pw_v2_001",
        distractor_type: "same_scene_vocabulary",
        difficulty: 1,
        estimated_time_seconds: 15,
        default_error_code: "SCENE_VOCAB_GAP",
        tags: ["playwright", "seed", "v2"]
      },
      {
        question_id: "pw_v2_q_002",
        lesson_id: "PW-V2-001",
        stage: "V2",
        type: "scene_vocabulary",
        skill: "scene_vocabulary",
        subskill: "meeting_scene",
        grammar_link_id: "wf_accurate",
        question_text: "Meetings: Every attendee should review the ______ before the session begins.",
        options: { A: "agenda", B: "warehouse", C: "receipt", D: "highway" },
        correct_answer: "A",
        explanation_zh: "會議前自然要先看 agenda。",
        target_item_id: "item_pw_v2_002",
        distractor_type: "same_scene_vocabulary",
        difficulty: 1,
        estimated_time_seconds: 15,
        default_error_code: "SCENE_VOCAB_GAP",
        tags: ["playwright", "seed", "v2"]
      },
      {
        question_id: "pw_v2_q_003",
        lesson_id: "PW-V2-001",
        stage: "V2",
        type: "scene_vocabulary",
        skill: "scene_vocabulary",
        subskill: "travel_scene",
        grammar_link_id: "wf_accurate",
        question_text: "Travel: The updated ______ includes the hotel check-in time.",
        options: { A: "itinerary", B: "scooter", C: "contractor", D: "cafeteria" },
        correct_answer: "A",
        explanation_zh: "行程資料最自然是 itinerary。",
        target_item_id: "item_pw_v2_003",
        distractor_type: "same_scene_vocabulary",
        difficulty: 1,
        estimated_time_seconds: 15,
        default_error_code: "SCENE_VOCAB_GAP",
        tags: ["playwright", "seed", "v2"]
      },
      {
        question_id: "pw_v3_q_001",
        lesson_id: "PW-V3-001",
        stage: "V3",
        type: "part6_context_choice",
        skill: "part6_context_choice",
        subskill: "context_fit",
        grammar_link_id: "wf_accurate",
        question_text: "The maintenance team inspected the elevators this morning.\nSeveral parts were worn out after years of heavy use.\nManagement approved a full ______ before the holiday season.",
        options: { A: "renovation", B: "receipt", C: "customer", D: "invoice" },
        correct_answer: "A",
        explanation_zh: "整段語境在說設備翻新，renovation 最合理。",
        target_item_id: "item_pw_v3_001",
        distractor_type: "wrong_verb_collocation",
        difficulty: 2,
        estimated_time_seconds: 45,
        default_error_code: "SCENE_VOCAB_GAP",
        tags: ["playwright", "seed", "v3"]
      },
      {
        question_id: "pw_v3_q_002",
        lesson_id: "PW-V3-001",
        stage: "V3",
        type: "part6_context_choice",
        skill: "part6_context_choice",
        subskill: "context_fit",
        grammar_link_id: "wf_accurate",
        question_text: "The legal department revised the supplier contract yesterday.\nBoth sides agreed on the final wording after a short call.\nThe signed version will be sent as an email ______ this afternoon.",
        options: { A: "attachment", B: "corridor", C: "budget", D: "intern" },
        correct_answer: "A",
        explanation_zh: "email attachment 最符合全文語境。",
        target_item_id: "item_pw_v3_002",
        distractor_type: "wrong_verb_collocation",
        difficulty: 2,
        estimated_time_seconds: 45,
        default_error_code: "SCENE_VOCAB_GAP",
        tags: ["playwright", "seed", "v3"]
      },
      {
        question_id: "pw_v3_q_003",
        lesson_id: "PW-V3-001",
        stage: "V3",
        type: "part6_context_choice",
        skill: "part6_context_choice",
        subskill: "context_fit",
        grammar_link_id: "wf_accurate",
        question_text: "The sales branch missed its quarterly target in March.\nManagers reviewed the weekly numbers and adjusted the discount plan.\nThey expect the new strategy to improve overall ______ next month.",
        options: { A: "revenue", B: "hallway", C: "drawer", D: "passport" },
        correct_answer: "A",
        explanation_zh: "sales target 與 discount plan 的語境對應 revenue。",
        target_item_id: "item_pw_v3_003",
        distractor_type: "wrong_verb_collocation",
        difficulty: 2,
        estimated_time_seconds: 45,
        default_error_code: "SCENE_VOCAB_GAP",
        tags: ["playwright", "seed", "v3"]
      }
    ];

    for (const lesson of lessons) {
      await window.VocabDB.put("lessons", lesson);
    }
    for (const question of questions) {
      await window.VocabDB.put("questions", question);
    }
  });

  await page.reload({ waitUntil: "domcontentloaded", timeout: APP_TIMEOUT });
  await waitForApp(page);
}

test("seeded content: V2 and V3 fixture lessons and runtime record attempts", async ({ page }, testInfo) => {
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
  await page.goto("/tracker.html?pw-v2-v3-content=1", { waitUntil: "domcontentloaded", timeout: APP_TIMEOUT });
  await waitForApp(page);
  await seedV2V3Fixture(page);

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

  expect(summary.lessonsByStage.V2).toBe(1);
  expect(summary.lessonsByStage.V3).toBe(1);
  expect(summary.questionsByStage.V2).toBe(3);
  expect(summary.questionsByStage.V3).toBe(3);

  const representativeLessons = [
    "PW-V2-001",
    "PW-V3-001"
  ];

  for (const lessonId of representativeLessons) {
    await answerQuestions(page, lessonId, 3);
  }

  const totalAttempts = await page.evaluate(async () => {
    const attempts = await window.VocabDB.getAll("attempts");
    return attempts.length;
  });
  expect(totalAttempts).toBeGreaterThanOrEqual(6);

  await page.evaluate(() => window.VocabTracker.setView("export"));
  const exportPackageButton = page.getByRole("button", { name: "匯出完整資料封包" });
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
