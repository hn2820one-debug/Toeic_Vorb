import { expect, test, type BrowserContext, type Page } from "@playwright/test";

const APP_TIMEOUT = 30_000;
const STEP_TIMEOUT = 10_000;

async function gotoTracker(page: Page) {
  await page.goto("/tracker.html");
  await page.waitForFunction(() => typeof window.VocabTracker?.setView === "function", { timeout: APP_TIMEOUT });
}

async function primeMockGoogleDrive(page: Page) {
  await page.evaluate(() => {
    window.google = {
      accounts: {
        oauth2: {
          initTokenClient: (options) => {
            const client = {
              callback: options.callback,
              requestAccessToken: () => {
                client.callback?.({ access_token: "playwright_sync_token" });
              }
            };
            return client;
          },
          revoke: (_token, callback) => {
            if (typeof callback === "function") callback();
          }
        }
      }
    };
  });
}

async function connectMockGoogleDrive(page) {
  await primeMockGoogleDrive(page);
  await page.evaluate(() => window.GoogleDriveSyncClient.connect());
}

async function seedSyncLearnerSnapshot(page: Page, suffix = "a") {
  return page.evaluate(async (idSuffix) => {
    await window.VocabDB.seedIfNeeded();
    const now = window.VocabScoring.localIso();
    const lesson = await window.VocabDB.get("lessons", "V2-A-71");
    const question = await window.VocabDB.get("questions", "v2_a_71_q_001");
    const item = await window.VocabDB.get("vocab_items", question.target_item_id);
    const sessionId = `pw_sync_session_${idSuffix}`;
    const attemptId = `pw_sync_attempt_${idSuffix}`;
    const reviewId = `pw_sync_review_${idSuffix}`;

    await window.VocabDB.put("lessons", {
      ...lesson,
      status: "completed",
      completed_at: now,
      updated_at: now
    });
    await window.VocabDB.put("vocab_items", {
      ...item,
      seen_count: Math.max(Number(item.seen_count || 0), 3),
      correct_count: Math.max(Number(item.correct_count || 0), 2),
      wrong_count: Math.max(Number(item.wrong_count || 0), 1),
      mastery_score: Math.max(Number(item.mastery_score || 0), 72),
      mastery_level: "unstable",
      last_seen: now,
      next_review_date: window.VocabScoring.localDate()
    });
    await window.VocabDB.put("sessions", {
      session_id: sessionId,
      date: window.VocabScoring.localDate(),
      user_id: "Keith",
      course_id: "toeic_vocab_v1",
      stage: "V2",
      lesson_id: "V2-A-71",
      lesson_title: lesson.title,
      planned_minutes: 45,
      actual_minutes: 3,
      started_at: now,
      ended_at: now,
      total_questions: 1,
      correct_questions: 0,
      wrong_questions: 1,
      accuracy: 0,
      avg_response_time_seconds: 11.2,
      mastery_status: "needs_reinforcement",
      next_action: "review_errors"
    });
    await window.VocabDB.put("attempts", {
      attempt_id: attemptId,
      timestamp: now,
      user_id: "Keith",
      course_id: "toeic_vocab_v1",
      stage: "V2",
      lesson_id: "V2-A-71",
      session_id: sessionId,
      step: "question",
      question_id: question.question_id,
      question_type: question.type,
      target_item_id: question.target_item_id,
      grammar_link_id: question.grammar_link_id,
      correct_answer: question.correct_answer,
      user_answer: question.correct_answer === "A" ? "B" : "A",
      is_correct: false,
      response_time_seconds: 11.2,
      speed_bucket: "slow_wrong",
      error_code: "SCENE_VOCAB_GAP",
      default_error_code: question.default_error_code,
      is_repeated_error: false,
      review_priority: 3,
      mode: "lesson"
    });
    await window.VocabDB.put("review_queue", {
      review_id: reviewId,
      item_id: question.target_item_id,
      question_ids: [question.question_id],
      reason: "lesson_error",
      priority: 3,
      due_date: window.VocabScoring.localDate(),
      status: "pending",
      created_at: now,
      updated_at: now,
      review_state: "pending"
    });

    return {
      attemptId,
      sessionId,
      reviewId,
      itemId: question.target_item_id,
      baseWord: item.base_word
    };
  }, suffix);
}

function nextDriveTimestamp(step: number) {
  return new Date(Date.UTC(2026, 4, 24, 0, 0, step)).toISOString();
}

function parseMultipartJson(postData = "") {
  const boundaryMatch = postData.match(/^--([^\r\n]+)/);
  if (!boundaryMatch) {
    throw new Error("Missing multipart boundary.");
  }
  const boundary = boundaryMatch[1];
  const parts = postData
    .split(`--${boundary}`)
    .map((part) => part.trim())
    .filter((part) => part && part !== "--");
  const jsonParts = parts
    .map((part) => {
      const jsonStart = part.indexOf("{");
      return jsonStart >= 0 ? JSON.parse(part.slice(jsonStart)) : null;
    })
    .filter(Boolean);
  return {
    metadata: jsonParts[0] || {},
    payload: jsonParts[1] || {}
  };
}

function createDriveResponse(body: unknown, status = 200) {
  return {
    status,
    contentType: "application/json",
    body: typeof body === "string" ? body : JSON.stringify(body)
  };
}

function createFakeDriveBackend() {
  let step = 0;
  const state: {
    folder: null | Record<string, unknown>;
    file: null | Record<string, unknown>;
    payload: any;
    calls: string[];
  } = {
    folder: null,
    file: null,
    payload: null,
    calls: []
  };

  function metadataOf(file: any) {
    return {
      id: file.id,
      name: file.name,
      mimeType: file.mimeType,
      modifiedTime: file.modifiedTime,
      appProperties: file.appProperties
    };
  }

  async function install(context: BrowserContext) {
    await context.route("https://www.googleapis.com/**", async (route) => {
      const request = route.request();
      const url = new URL(request.url());
      const method = request.method();
      state.calls.push(`${method} ${url.pathname}${url.search ? url.search : ""}`);

      if (url.pathname === "/drive/v3/files" && method === "GET") {
        const query = url.searchParams.get("q") || "";
        const files = query.includes("mimeType='application/vnd.google-apps.folder'")
          ? (state.folder ? [metadataOf(state.folder)] : [])
          : (state.file ? [metadataOf(state.file)] : []);
        await route.fulfill(createDriveResponse({ files }));
        return;
      }

      if (url.pathname === "/drive/v3/files" && method === "POST") {
        const metadata = JSON.parse(request.postData() || "{}");
        state.folder = {
          id: "folder-001",
          name: metadata.name,
          mimeType: metadata.mimeType,
          modifiedTime: nextDriveTimestamp(step++),
          appProperties: metadata.appProperties || {}
        };
        await route.fulfill(createDriveResponse(metadataOf(state.folder)));
        return;
      }

      if (url.pathname === "/upload/drive/v3/files" && method === "POST") {
        const { metadata, payload } = parseMultipartJson(request.postData() || "");
        state.file = {
          id: "file-001",
          name: metadata.name,
          mimeType: metadata.mimeType,
          parents: metadata.parents || [],
          modifiedTime: nextDriveTimestamp(step++),
          appProperties: metadata.appProperties || {}
        };
        state.payload = payload;
        await route.fulfill(createDriveResponse(metadataOf(state.file)));
        return;
      }

      if (url.pathname.startsWith("/drive/v3/files/") && method === "GET") {
        const id = decodeURIComponent(url.pathname.split("/").pop() || "");
        if (url.searchParams.get("alt") === "media") {
          await route.fulfill(createDriveResponse(state.payload || {}));
          return;
        }
        const file = state.file && state.file.id === id
          ? state.file
          : state.folder && state.folder.id === id
            ? state.folder
            : null;
        await route.fulfill(file ? createDriveResponse(metadataOf(file)) : { status: 404, body: "not found" });
        return;
      }

      if (url.pathname.startsWith("/upload/drive/v3/files/") && method === "PATCH") {
        state.payload = JSON.parse(request.postData() || "{}");
        state.file = {
          ...(state.file || { id: "file-001", name: "toeic_vocab_drive_sync_state.json", mimeType: "application/json", appProperties: {} }),
          modifiedTime: nextDriveTimestamp(step++)
        };
        await route.fulfill(createDriveResponse(metadataOf(state.file)));
        return;
      }

      await route.continue();
    });
  }

  return { state, install };
}

test.beforeEach(async ({ page }) => {
  await gotoTracker(page);
});

test("Drive sync config stores the Web OAuth client ID without a client secret", async ({ page }) => {
  const config = await page.evaluate(() => window.GoogleDriveSyncConfig);
  expect(config).toMatchObject({
    appId: "toeic-vocab-tracker",
    clientId: "231659540073-6f94pr1akb4qsns5vrsdkkn6i8g70kj0.apps.googleusercontent.com",
    isConfigured: true,
    scope: "https://www.googleapis.com/auth/drive.file",
    folderName: "TOEIC Vocabulary Tracker Sync",
    syncFileName: "toeic_vocab_drive_sync_state.json",
    tokenStorage: "memory-only"
  });
  expect(config.clientSecret).toBeUndefined();

  const status = await page.evaluate(() => window.GoogleDriveSyncClient.getStatus());
  expect(status.state).toBe("disconnected");
  expect(status.configured).toBe(true);
  expect(status.hasToken).toBe(false);
});

test("Settings shows Drive Sync as configured but disconnected before authorization", async ({ page }) => {
  await page.evaluate(() => window.VocabTracker.setView("settings"));

  await expect(page.getByTestId("settings-drive-sync-panel")).toBeVisible({ timeout: STEP_TIMEOUT });
  await expect(page.getByTestId("settings-drive-sync-status")).toHaveText("未連接", { timeout: STEP_TIMEOUT });
  await expect(page.getByTestId("settings-drive-connect-button")).toBeEnabled({ timeout: STEP_TIMEOUT });
  await expect(page.getByTestId("settings-drive-sync-now-button")).toBeDisabled({ timeout: STEP_TIMEOUT });
  await expect(page.getByTestId("settings-drive-disconnect-button")).toBeDisabled({ timeout: STEP_TIMEOUT });
  await expect(page.getByTestId("settings-drive-last-sync")).toHaveText("尚未同步", { timeout: STEP_TIMEOUT });
  await expect(page.getByTestId("settings-drive-pending")).toHaveText("0 pending", { timeout: STEP_TIMEOUT });
  await expect(page.getByTestId("settings-drive-auto-sync-toggle")).not.toBeChecked({ timeout: STEP_TIMEOUT });
  await expect(page.getByTestId("settings-drive-background-note")).toContainText("app 關閉時", { timeout: STEP_TIMEOUT });
});

test("Drive sync client rejects Drive API calls before token without loading Google Identity Services", async ({ page }) => {
  const result = await page.evaluate(async () => {
    try {
      await window.GoogleDriveSyncClient.downloadSyncState("fake_file_id");
      return { ok: true };
    } catch (error) {
      return {
        ok: false,
        code: error.code,
        message: error.message,
        status: window.GoogleDriveSyncClient.getStatus(),
        gisScriptCount: document.querySelectorAll("script[src='https://accounts.google.com/gsi/client']").length
      };
    }
  });

  expect(result.ok).toBe(false);
  expect(result.code).toBe("DRIVE_SYNC_NOT_CONNECTED");
  expect(result.message).toContain("not connected");
  expect(result.status.state).toBe("disconnected");
  expect(result.gisScriptCount).toBe(0);
});

test("Drive sync payload builder outputs the required learner-record contract", async ({ page }) => {
  const payload = await page.evaluate(async () => {
    window.VocabDB.savePrefs({ device_label: "Playwright sync device", daily_goal_questions: 42 });
    localStorage.setItem("toeic_vocab_word_highlights", JSON.stringify([{
      highlight_id: "sync_highlight_001",
      text: "invoice",
      normalized: "invoice",
      question_id: "v2_a_71_q_001",
      session_id: "sync_session_001",
      created_at: "2026-05-23T00:00:00.000Z"
    }]));
    await window.VocabDB.put("sessions", {
      session_id: "sync_session_001",
      lesson_id: "V2-A-71",
      started_at: "2026-05-23T00:00:00.000Z",
      completed_at: "2026-05-23T00:03:00.000Z"
    });
    await window.VocabDB.put("attempts", {
      attempt_id: "sync_attempt_001",
      session_id: "sync_session_001",
      lesson_id: "V2-A-71",
      question_id: "v2_a_71_q_001",
      item_id: "invoice",
      selected: "A",
      correct: true,
      is_correct: true,
      timestamp: "2026-05-23T00:02:00.000Z"
    });
    return window.GoogleDriveSyncData.buildPayload();
  });

  expect(payload).toMatchObject({
    sync_version: "1.0",
    app_id: "toeic-vocab-tracker",
    seed_version: "toeic_vocab_tracker_v3_w2_07_wave_18_2026_05_22"
  });
  expect(payload.device_id).toMatch(/^sync_device_/);
  expect(payload.last_writer_device_id).toBe(payload.device_id);
  expect(payload.updated_at).toBeTruthy();
  expect(payload.summary.attempts).toBeGreaterThanOrEqual(1);
  expect(payload.summary.sessions).toBeGreaterThanOrEqual(1);
  expect(payload.summary.review_queue).toBeGreaterThanOrEqual(0);
  expect(typeof payload.summary.vocab_items).toBe("number");
  expect(Array.isArray(payload.stores.vocab_items)).toBe(true);
  expect(payload.summary.latest_attempt_at).toBe("2026-05-23T00:02:00.000Z");
  expect(payload.stores.attempts.some((row) => row.attempt_id === "sync_attempt_001")).toBe(true);
  expect(payload.stores.sessions.some((row) => row.session_id === "sync_session_001")).toBe(true);
  expect(payload.stores.word_highlights).toHaveLength(1);
  expect(payload.local_storage.preferences.device_label).toBe("Playwright sync device");
  expect(payload.local_storage.word_highlights).toHaveLength(1);
  expect(payload.stores.questions).toBeUndefined();
  expect(payload.stores.curriculum).toBeUndefined();
  expect(payload.stores.question_edits).toBeUndefined();
});

test("Drive sync device ID persists locally and is not tied to Google identity", async ({ page }) => {
  const ids = await page.evaluate(() => {
    localStorage.removeItem(window.GoogleDriveSyncData.DEVICE_ID_KEY);
    const first = window.GoogleDriveSyncData.getDeviceId();
    const second = window.GoogleDriveSyncData.getDeviceId();
    return {
      first,
      second,
      stored: localStorage.getItem(window.GoogleDriveSyncData.DEVICE_ID_KEY)
    };
  });

  expect(ids.first).toBe(ids.second);
  expect(ids.stored).toBe(ids.first);
  expect(ids.first).toMatch(/^sync_device_/);
  expect(ids.first.toLowerCase()).not.toContain("google");
});

test("Drive sync payload validator rejects missing required fields and forbidden source stores", async ({ page }) => {
  const result = await page.evaluate(async () => {
    const validPayload = await window.GoogleDriveSyncData.buildPayload();
    const valid = window.GoogleDriveSyncData.validatePayload(validPayload);
    const invalidPayload = {
      ...validPayload,
      app_id: "wrong-app",
      stores: {
        ...validPayload.stores,
        questions: []
      }
    };
    delete invalidPayload.device_id;
    const invalid = window.GoogleDriveSyncData.validatePayload(invalidPayload);
    return { valid, invalid };
  });

  expect(result.valid.ok).toBe(true);
  expect(result.valid.errors).toEqual([]);
  expect(result.invalid.ok).toBe(false);
  expect(result.invalid.errors).toEqual(expect.arrayContaining([
    "app_id must be toeic-vocab-tracker",
    "device_id must be a non-empty string",
    "stores.questions is not allowed in Drive sync payload"
  ]));
});

test("Drive sync Phase 7 warns on older sync versions and blocks unsupported future versions", async ({ page }) => {
  const result = await page.evaluate(async () => {
    await window.VocabDB.seedIfNeeded();
    const payload = await window.GoogleDriveSyncData.buildPayload();
    const olderPayload = {
      ...payload,
      sync_version: "0.9"
    };
    const futurePayload = {
      ...payload,
      sync_version: "2.0"
    };
    return {
      olderValidation: window.GoogleDriveSyncData.validatePayload(olderPayload),
      olderPreview: await window.GoogleDriveSyncData.analyzeMerge(olderPayload),
      futureValidation: window.GoogleDriveSyncData.validatePayload(futurePayload)
    };
  });

  expect(result.olderValidation.ok).toBe(true);
  expect(result.olderValidation.warnings.join(" ")).toContain("older than current");
  expect(result.olderPreview.ok).toBe(true);
  expect(result.olderPreview.warnings.join(" ")).toContain("older than current");
  expect(result.futureValidation.ok).toBe(false);
  expect(result.futureValidation.errors.join(" ")).toContain("newer than supported");
});

test("Drive sync safe merge is idempotent and preserves local seed metadata", async ({ page }) => {
  const result = await page.evaluate(async () => {
    await window.VocabDB.seedIfNeeded();
    const lessons = await window.VocabDB.getAll("lessons");
    const lesson = await window.VocabDB.get("lessons", "V2-A-71") || lessons[0];
    const vocabItem = (await window.VocabDB.getAll("vocab_items")).find((row) => row.item_id);
    const originalLessonTitle = lesson.title;
    const originalBaseWord = vocabItem.base_word;

    window.VocabDB.savePrefs({ device_label: "local-device", daily_goal_questions: 10 });
    await window.VocabDB.put("settings", { key: "sync_existing_setting", value: "local" });
    await window.VocabDB.put("lessons", {
      ...lesson,
      status: "in_progress",
      last_opened_at: "2026-05-20T00:00:00.000Z"
    });
    await window.VocabDB.put("vocab_items", {
      ...vocabItem,
      seen_count: 1,
      correct_count: 1,
      wrong_count: 0,
      mastery_score: 40,
      mastery_level: "weak",
      last_seen: "2026-05-20",
      next_review_date: "2026-05-30"
    });
    await window.VocabDB.put("review_queue", {
      review_id: "sync_review_merge",
      item_id: vocabItem.item_id,
      status: "done",
      due_date: "2026-05-30",
      priority: 1,
      review_state: "fixed",
      completed_at: "2026-05-22T00:00:00.000Z"
    });
    localStorage.setItem("toeic_vocab_word_highlights", JSON.stringify([{
      text: "contract",
      normalized: "contract",
      question_id: "sync_q_001",
      session_id: "sync_session_local",
      created_at: "2026-05-20T00:00:00.000Z"
    }]));

    const payload = await window.GoogleDriveSyncData.buildPayload();
    payload.seed_version = "older_seed_warning_only";
    payload.stores.users = [];
    payload.stores.settings = [
      { key: "seed_version", value: "malicious_seed_value" },
      { key: "sync_existing_setting", value: "cloud_should_not_win" },
      { key: "sync_cloud_only_setting", value: "cloud" }
    ];
    payload.stores.lessons = [{
      lesson_id: lesson.lesson_id,
      title: "DO_NOT_REPLACE_TITLE",
      status: "completed",
      completed_at: "2026-05-24T00:00:00.000Z",
      updated_at: "2026-05-24T00:00:00.000Z"
    }];
    payload.stores.vocab_items = [{
      item_id: vocabItem.item_id,
      base_word: "DO_NOT_REPLACE_BASE_WORD",
      seen_count: 5,
      correct_count: 4,
      wrong_count: 2,
      mastery_score: 90,
      mastery_level: "mastered",
      last_seen: "2026-05-24",
      next_review_date: "2026-05-25"
    }, {
      item_id: "cloud_seed_item_should_not_be_added",
      base_word: "cloud-only",
      seen_count: 9
    }];
    payload.stores.attempts = [
      {
        attempt_id: "sync_attempt_merge",
        session_id: "sync_session_merge",
        lesson_id: lesson.lesson_id,
        question_id: "sync_question_merge",
        target_item_id: vocabItem.item_id,
        is_correct: true,
        timestamp: "2026-05-24T00:01:00.000Z"
      },
      {
        attempt_id: "sync_attempt_merge",
        session_id: "sync_session_merge",
        lesson_id: lesson.lesson_id,
        question_id: "sync_question_merge",
        target_item_id: vocabItem.item_id,
        is_correct: true,
        timestamp: "2026-05-24T00:01:00.000Z"
      }
    ];
    payload.stores.sessions = [{
      session_id: "sync_session_merge",
      lesson_id: lesson.lesson_id,
      started_at: "2026-05-24T00:00:00.000Z",
      completed_at: "2026-05-24T00:03:00.000Z"
    }];
    payload.stores.error_logs = [{
      error_log_id: "sync_error_merge",
      attempt_id: "sync_attempt_merge",
      item_id: vocabItem.item_id,
      status: "confirmed"
    }];
    payload.stores.review_queue = [{
      review_id: "sync_review_merge",
      item_id: vocabItem.item_id,
      status: "pending",
      due_date: "2026-05-23",
      priority: 5,
      review_state: "repeated_error",
      repeated_error_count: 3
    }];
    payload.stores.exports = [{
      export_id: "sync_export_merge",
      created_at: "2026-05-24T00:04:00.000Z",
      export_type: "drive_sync_test"
    }];
    payload.stores.word_highlights = [
      {
        text: "contract",
        normalized: "contract",
        question_id: "sync_q_001",
        session_id: "sync_session_local",
        created_at: "2026-05-20T00:00:00.000Z"
      },
      {
        text: "invoice",
        normalized: "invoice",
        question_id: "sync_q_002",
        session_id: "sync_session_merge",
        created_at: "2026-05-24T00:00:00.000Z"
      },
      {
        text: "invoice",
        normalized: "invoice",
        question_id: "sync_q_002",
        session_id: "sync_session_merge",
        created_at: "2026-05-24T00:00:00.000Z"
      }
    ];
    payload.local_storage.preferences = {
      device_label: "cloud-device",
      daily_goal_questions: 99,
      sync_cloud_pref: "cloud"
    };
    payload.local_storage.word_highlights = payload.stores.word_highlights;
    payload.summary = window.GoogleDriveSyncData.buildSummary(payload.stores);

    const preview = await window.GoogleDriveSyncData.analyzeMerge(payload);
    const first = await window.GoogleDriveSyncData.mergePayload(payload);
    const second = await window.GoogleDriveSyncData.mergePayload(payload);

    const attempts = await window.VocabDB.getAll("attempts");
    const sessions = await window.VocabDB.getAll("sessions");
    const errorLogs = await window.VocabDB.getAll("error_logs");
    const exportsRows = await window.VocabDB.getAll("exports");
    const mergedLesson = await window.VocabDB.get("lessons", lesson.lesson_id);
    const mergedItem = await window.VocabDB.get("vocab_items", vocabItem.item_id);
    const unknownItem = await window.VocabDB.get("vocab_items", "cloud_seed_item_should_not_be_added");
    const mergedReview = await window.VocabDB.get("review_queue", "sync_review_merge");
    const seedSetting = await window.VocabDB.get("settings", "seed_version");
    const existingSetting = await window.VocabDB.get("settings", "sync_existing_setting");
    const cloudOnlySetting = await window.VocabDB.get("settings", "sync_cloud_only_setting");
    const prefs = window.VocabDB.loadPrefs();
    const highlights = JSON.parse(localStorage.getItem("toeic_vocab_word_highlights") || "[]");

    return {
      preview,
      first,
      second,
      originalLessonTitle,
      originalBaseWord,
      counts: {
        attempts: attempts.filter((row) => row.attempt_id === "sync_attempt_merge").length,
        sessions: sessions.filter((row) => row.session_id === "sync_session_merge").length,
        error_logs: errorLogs.filter((row) => row.error_log_id === "sync_error_merge").length,
        exports: exportsRows.filter((row) => row.export_id === "sync_export_merge").length,
        highlights: highlights.length
      },
      mergedLesson,
      mergedItem,
      unknownItem,
      mergedReview,
      seedSetting,
      existingSetting,
      cloudOnlySetting,
      prefs
    };
  });

  expect(result.preview.ok).toBe(true);
  expect(result.preview.seedMismatch).toBe(true);
  expect(result.preview.plans.attempts.duplicate).toBe(1);
  expect(result.preview.plans.word_highlights.duplicate).toBe(1);
  expect(result.first.seed_mismatch).toBe(true);
  expect(result.first.seed_version_changed).toBe(false);
  expect(result.first.added.attempts).toBe(1);
  expect(result.first.merged.lessons).toBe(1);
  expect(result.first.merged.vocab_items).toBe(1);
  expect(result.first.blocked.vocab_items).toBe(1);
  expect(result.first.merged.review_queue).toBe(1);
  expect(result.second.added.attempts).toBe(0);
  expect(result.second.merged.lessons).toBe(0);
  expect(result.second.merged.vocab_items).toBe(0);
  expect(result.counts).toEqual({
    attempts: 1,
    sessions: 1,
    error_logs: 1,
    exports: 1,
    highlights: 2
  });
  expect(result.mergedLesson.title).toBe(result.originalLessonTitle);
  expect(result.mergedLesson.status).toBe("completed");
  expect(result.mergedItem.base_word).toBe(result.originalBaseWord);
  expect(result.mergedItem.seen_count).toBe(5);
  expect(result.mergedItem.mastery_score).toBe(90);
  expect(result.mergedItem.mastery_level).toBe("mastered");
  expect(result.mergedItem.next_review_date).toBe("2026-05-25");
  expect(result.unknownItem).toBeUndefined();
  expect(result.mergedReview.status).toBe("pending");
  expect(result.mergedReview.due_date).toBe("2026-05-23");
  expect(result.mergedReview.priority).toBe(5);
  expect(result.mergedReview.review_state).toBe("repeated_error");
  expect(result.seedSetting.value).toBe("toeic_vocab_tracker_v3_w2_07_wave_18_2026_05_22");
  expect(result.existingSetting.value).toBe("local");
  expect(result.cloudOnlySetting.value).toBe("cloud");
  expect(result.prefs.device_label).toBe("local-device");
  expect(result.prefs.daily_goal_questions).toBe(10);
  expect(result.prefs.sync_cloud_pref).toBe("cloud");
});

test("Drive sync rejects invalid cloud merge and invalid upload payload before mutating local data", async ({ page }) => {
  const result = await page.evaluate(async () => {
    await window.VocabDB.put("attempts", {
      attempt_id: "sync_invalid_local_attempt",
      session_id: "sync_invalid_local_session",
      lesson_id: "V2-A-71",
      question_id: "sync_invalid_q",
      timestamp: "2026-05-24T00:00:00.000Z"
    });
    const before = (await window.VocabDB.getAll("attempts")).length;
    const invalidPayload = await window.GoogleDriveSyncData.buildPayload();
    invalidPayload.app_id = "wrong-app";
    invalidPayload.stores.questions = [];
    invalidPayload.stores.attempts = [{
      attempt_id: "sync_invalid_should_not_import",
      session_id: "sync_invalid_cloud_session",
      lesson_id: "V2-A-71",
      question_id: "sync_invalid_q_cloud",
      timestamp: "2026-05-24T00:01:00.000Z"
    }];

    const mergeError = await window.GoogleDriveSyncData.mergePayload(invalidPayload)
      .then(() => "")
      .catch((error) => error.message);
    const after = (await window.VocabDB.getAll("attempts")).length;
    const imported = await window.VocabDB.get("attempts", "sync_invalid_should_not_import");
    const uploadError = await window.GoogleDriveSyncClient.uploadSyncState(invalidPayload, "fake_file_id")
      .then(() => "")
      .catch((error) => error.message);
    const status = window.GoogleDriveSyncClient.getStatus();
    const gisScriptCount = document.querySelectorAll("script[src='https://accounts.google.com/gsi/client']").length;
    return { before, after, imported, mergeError, uploadError, status, gisScriptCount };
  });

  expect(result.before).toBe(result.after);
  expect(result.imported).toBeUndefined();
  expect(result.mergeError).toContain("app_id must be toeic-vocab-tracker");
  expect(result.mergeError).toContain("stores.questions is not allowed");
  expect(result.uploadError).toContain("upload payload is invalid");
  expect(result.status.state).toBe("error");
  expect(result.status.lastAction).toBe("upload-sync-state");
  expect(result.gisScriptCount).toBe(0);
});

test("Drive sync Phase 6 Settings UX tracks pending changes and auto-sync pause state", async ({ page }) => {
  await page.evaluate(() => window.VocabTracker.setView("settings"));

  await page.getByTestId("settings-save-button").click({ timeout: STEP_TIMEOUT });
  await expect(page.getByTestId("settings-drive-pending")).toHaveText("1 pending", { timeout: STEP_TIMEOUT });
  await expect(page.getByTestId("settings-drive-pending-reasons")).toContainText("settings", { timeout: STEP_TIMEOUT });

  await page.getByTestId("settings-drive-auto-sync-toggle").check({ timeout: STEP_TIMEOUT });
  await expect(page.getByTestId("settings-drive-auto-sync-toggle")).toBeChecked({ timeout: STEP_TIMEOUT });

  const enabled = await page.evaluate(() => window.GoogleDriveSyncData.getAutoSyncState().enabled);
  expect(enabled).toBe(true);

  await page.evaluate(() => {
    window.VocabTracker.markGoogleDriveLocalChange("lesson_completion");
    window.VocabTracker.setView("settings");
  });
  await expect(page.getByTestId("settings-drive-pending")).toHaveText("2 pending", { timeout: STEP_TIMEOUT });
  await expect(page.getByTestId("settings-drive-pending-reasons")).toContainText("lesson_completion", { timeout: STEP_TIMEOUT });

  await page.getByTestId("settings-drive-auto-sync-toggle").uncheck({ timeout: STEP_TIMEOUT });
  await expect(page.getByTestId("settings-drive-auto-sync-toggle")).not.toBeChecked({ timeout: STEP_TIMEOUT });
});

test("Drive sync Phase 6 scheduled auto sync runs only when connected and clears pending markers", async ({ page }) => {
  const result = await page.evaluate(async () => {
    await window.VocabDB.seedIfNeeded();
    const cloudPayload = await window.GoogleDriveSyncData.buildPayload();
    window.GoogleDriveSyncData.setAutoSyncEnabled(true);
    window.GoogleDriveSyncData.markLocalChange("lesson_completion");

    const calls = [];
    const originalStatus = window.GoogleDriveSyncClient.getStatus();
    window.GoogleDriveSyncClient.getStatus = () => ({
      ...originalStatus,
      state: "connected",
      connected: true,
      hasToken: true
    });
    window.GoogleDriveSyncClient.ensureSyncFile = async () => {
      calls.push("ensure");
      return { folder: { id: "folder" }, file: { id: "file" } };
    };
    window.GoogleDriveSyncClient.downloadSyncSnapshot = async () => {
      calls.push("download");
      return {
        payload: cloudPayload,
        file: { id: "file", modifiedTime: "2026-05-24T00:00:00.000Z" },
        validation: { ok: true, errors: [], warnings: [] }
      };
    };
    window.GoogleDriveSyncClient.uploadSyncState = async (payload) => {
      calls.push(`upload:${payload.app_id}:${payload.stores.questions ? "bad" : "safe"}`);
      return { id: "file", modifiedTime: "2026-05-24T00:00:00.000Z" };
    };

    const scheduled = window.VocabTracker.scheduleGoogleDriveAutoSync("lesson_completion", { mark: false, delayMs: 0 });
    const startedAt = Date.now();
    while (!calls.some((entry) => entry.startsWith("upload:")) && Date.now() - startedAt < 2000) {
      await new Promise((resolve) => setTimeout(resolve, 25));
    }
    return {
      scheduled,
      calls,
      auto: window.GoogleDriveSyncData.getAutoSyncState()
    };
  });

  expect(result.scheduled.scheduled).toBe(true);
  expect(result.calls).toEqual([
    "ensure",
    "download",
    "upload:toeic-vocab-tracker:safe"
  ]);
  expect(result.auto.enabled).toBe(true);
  expect(result.auto.pending).toBe(false);
  expect(result.auto.pendingCount).toBe(0);
  expect(result.auto.lastSuccessAt).toBeTruthy();
  expect(result.auto.lastError).toBe("");
});

test("Drive sync Phase 7 sets reconnect required after 401 and preserves pending local changes", async ({ page }) => {
  await connectMockGoogleDrive(page);

  const result = await page.evaluate(async () => {
    await window.VocabDB.seedIfNeeded();
    window.GoogleDriveSyncData.setAutoSyncEnabled(true);
    window.GoogleDriveSyncData.markLocalChange("lesson_completion");

    const originalFetch = window.fetch.bind(window);
    window.GoogleDriveSyncClient.ensureSyncFile = async () => ({
      folder: { id: "folder" },
      file: { id: "file" }
    });

    let fetchCalls = 0;
    window.fetch = async () => {
      fetchCalls += 1;
      return new Response("expired token", { status: 401, headers: { "Content-Type": "text/plain" } });
    };

    const syncResult = await window.VocabTracker.runGoogleDriveAutoSync("lesson_completion");
    window.fetch = originalFetch;

    return {
      fetchCalls,
      syncResult,
      status: window.GoogleDriveSyncClient.getStatus(),
      auto: window.GoogleDriveSyncData.getAutoSyncState()
    };
  });

  expect(result.fetchCalls).toBe(1);
  expect(result.syncResult.skipped).toBe(true);
  expect(result.syncResult.retryScheduled).toBe(false);
  expect(result.status.state).toBe("reconnect_required");
  expect(result.status.hasToken).toBe(false);
  expect(result.auto.pending).toBe(true);
  expect(result.auto.pendingCount).toBe(1);
  expect(result.auto.lastError).toContain("Google Drive API 401");
});

test("Drive sync Phase 7 keeps connected status on retryable Drive errors and schedules backoff retry", async ({ page }) => {
  await connectMockGoogleDrive(page);

  const result = await page.evaluate(async () => {
    await window.VocabDB.seedIfNeeded();
    window.GoogleDriveSyncData.setAutoSyncEnabled(true);
    window.GoogleDriveSyncData.markLocalChange("lesson_completion");

    const originalFetch = window.fetch.bind(window);
    window.GoogleDriveSyncClient.ensureSyncFile = async () => ({
      folder: { id: "folder" },
      file: { id: "file" }
    });

    let fetchCalls = 0;
    window.fetch = async () => {
      fetchCalls += 1;
      return new Response("temporary outage", {
        status: 503,
        headers: {
          "Content-Type": "text/plain",
          "Retry-After": "0"
        }
      });
    };

    const syncResult = await window.VocabTracker.runGoogleDriveAutoSync("lesson_completion");
    window.fetch = originalFetch;

    return {
      fetchCalls,
      syncResult,
      status: window.GoogleDriveSyncClient.getStatus(),
      auto: window.GoogleDriveSyncData.getAutoSyncState()
    };
  });

  expect(result.fetchCalls).toBe(3);
  expect(result.syncResult.skipped).toBe(true);
  expect(result.syncResult.retryScheduled).toBe(true);
  expect(result.status.state).toBe("connected");
  expect(result.status.hasToken).toBe(true);
  expect(result.auto.pending).toBe(true);
  expect(result.auto.pendingCount).toBe(1);
  expect(result.auto.lastError).toContain("Google Drive API 503");
});

test("Drive sync Phase 7 selects the latest app-created sync file when duplicates exist", async ({ page }) => {
  await connectMockGoogleDrive(page);

  const result = await page.evaluate(async () => {
    const originalFetch = window.fetch.bind(window);
    window.fetch = async () => new Response(JSON.stringify({
      files: [
        {
          id: "older-app",
          name: "toeic_vocab_drive_sync_state.json",
          mimeType: "application/json",
          modifiedTime: "2026-05-23T00:00:00.000Z",
          appProperties: { app_id: "toeic-vocab-tracker", file_kind: "sync_state" }
        },
        {
          id: "latest-app",
          name: "toeic_vocab_drive_sync_state.json",
          mimeType: "application/json",
          modifiedTime: "2026-05-24T00:00:00.000Z",
          appProperties: { app_id: "toeic-vocab-tracker", file_kind: "sync_state" }
        },
        {
          id: "foreign-newer",
          name: "toeic_vocab_drive_sync_state.json",
          mimeType: "application/json",
          modifiedTime: "2026-05-25T00:00:00.000Z",
          appProperties: { app_id: "other-app", file_kind: "sync_state" }
        }
      ]
    }), { status: 200, headers: { "Content-Type": "application/json" } });

    const file = await window.GoogleDriveSyncClient.findOrCreateSyncFile("folder-001");
    const status = window.GoogleDriveSyncClient.getStatus();
    window.fetch = originalFetch;
    return { file, status };
  });

  expect(result.file.id).toBe("latest-app");
  expect(result.status.lastWarning).toContain("2 app-created sync files");
});

test("Drive sync Phase 7 re-reads modifiedTime before upload and blocks stale overwrites", async ({ page }) => {
  await connectMockGoogleDrive(page);

  const result = await page.evaluate(async () => {
    const payload = await window.GoogleDriveSyncData.buildPayload();
    const originalFetch = window.fetch.bind(window);
    const urls = [];
    window.fetch = async (input) => {
      const url = String(input);
      urls.push(url);
      return new Response(JSON.stringify({
        id: "file-001",
        name: "toeic_vocab_drive_sync_state.json",
        mimeType: "application/json",
        modifiedTime: "2026-05-24T00:00:00.000Z",
        appProperties: { app_id: "toeic-vocab-tracker", file_kind: "sync_state" }
      }), { status: 200, headers: { "Content-Type": "application/json" } });
    };

    let errorCode = "";
    let errorMessage = "";
    try {
      await window.GoogleDriveSyncClient.uploadSyncState(payload, "file-001", {
        expectedModifiedTime: "2026-05-23T00:00:00.000Z"
      });
    } catch (error) {
      errorCode = error.code || "";
      errorMessage = error.message || "";
    }
    const status = window.GoogleDriveSyncClient.getStatus();
    window.fetch = originalFetch;
    return { errorCode, errorMessage, status, urls };
  });

  expect(result.errorCode).toBe("DRIVE_SYNC_UPLOAD_CONFLICT");
  expect(result.errorMessage).toContain("changed during upload preparation");
  expect(result.status.state).toBe("connected");
  expect(result.urls).toHaveLength(1);
  expect(result.urls[0]).toContain("fields=id,name,mimeType,modifiedTime,appProperties");
});

test("Drive sync Phase 7 re-merges once when the cloud file changes during upload preparation", async ({ page }) => {
  const result = await page.evaluate(async () => {
    await window.VocabDB.seedIfNeeded();
    const payload = await window.GoogleDriveSyncData.buildPayload();
    const calls = [];
    let downloadCount = 0;
    let uploadCount = 0;

    window.GoogleDriveSyncClient.ensureSyncFile = async () => ({
      folder: { id: "folder-001" },
      file: { id: "file-001", modifiedTime: "2026-05-23T00:00:00.000Z" }
    });
    window.GoogleDriveSyncClient.downloadSyncSnapshot = async () => {
      downloadCount += 1;
      calls.push(`download:${downloadCount}`);
      return {
        payload,
        file: {
          id: "file-001",
          modifiedTime: downloadCount === 1 ? "2026-05-23T00:00:00.000Z" : "2026-05-24T00:00:00.000Z"
        },
        validation: { ok: true, errors: [], warnings: [] }
      };
    };
    window.GoogleDriveSyncClient.uploadSyncState = async (_payload, _fileId, options = {}) => {
      uploadCount += 1;
      calls.push(`upload:${options.expectedModifiedTime || ""}`);
      if (uploadCount === 1) {
        const error = new Error("Google Drive sync file changed during upload preparation.");
        error.code = "DRIVE_SYNC_UPLOAD_CONFLICT";
        throw error;
      }
      return { id: "file-001", modifiedTime: "2026-05-24T00:00:05.000Z" };
    };

    const syncResult = await window.VocabTracker.performGoogleDriveSync({ reason: "manual_test" });
    return {
      calls,
      syncResult,
      auto: window.GoogleDriveSyncData.getAutoSyncState()
    };
  });

  expect(result.calls).toEqual([
    "download:1",
    "upload:2026-05-23T00:00:00.000Z",
    "download:2",
    "upload:2026-05-24T00:00:00.000Z"
  ]);
  expect(result.syncResult.remerged).toBe(true);
  expect(result.syncResult.mergeResult.remerged).toBe(true);
  expect(result.auto.pending).toBe(false);
  expect(result.auto.lastSuccessAt).toBeTruthy();
});

test("Drive sync Phase 8 mocked GIS connect flow updates Settings controls", async ({ page }) => {
  await page.evaluate(() => window.VocabTracker.setView("settings"));
  await primeMockGoogleDrive(page);

  await page.getByTestId("settings-drive-connect-button").click({ timeout: STEP_TIMEOUT });

  await expect(page.getByTestId("settings-drive-sync-status")).toHaveText("已連接", { timeout: STEP_TIMEOUT });
  await expect(page.getByTestId("settings-drive-sync-now-button")).toBeEnabled({ timeout: STEP_TIMEOUT });
  await expect(page.getByTestId("settings-drive-disconnect-button")).toBeEnabled({ timeout: STEP_TIMEOUT });

  const status = await page.evaluate(() => window.GoogleDriveSyncClient.getStatus());
  expect(status.state).toBe("connected");
  expect(status.hasToken).toBe(true);
});

test("Drive sync Phase 8 times out stalled OAuth popup attempts with a retryable disconnected state", async ({ page }) => {
  const result = await page.evaluate(async () => {
    window.GoogleDriveSyncConfig = Object.freeze({
      ...window.GoogleDriveSyncConfig,
      connectTimeoutMs: 25
    });
    window.google = {
      accounts: {
        oauth2: {
          initTokenClient: (options) => ({
            callback: options.callback,
            requestAccessToken: () => {}
          }),
          revoke: (_token, callback) => {
            if (typeof callback === "function") callback();
          }
        }
      }
    };

    try {
      await window.GoogleDriveSyncClient.connect();
      return { ok: true };
    } catch (error) {
      return {
        ok: false,
        code: error.code,
        message: error.message,
        status: window.GoogleDriveSyncClient.getStatus()
      };
    }
  });

  expect(result.ok).toBe(false);
  expect(result.code).toBe("DRIVE_SYNC_CONNECT_TIMEOUT");
  expect(result.message).toContain("popup blockers");
  expect(result.status.state).toBe("disconnected");
  expect(result.status.hasToken).toBe(false);
});

test("Drive sync Phase 8 rejects invalid cloud JSON before merge", async ({ page }) => {
  await connectMockGoogleDrive(page);

  const result = await page.evaluate(async () => {
    const originalFetch = window.fetch.bind(window);
    window.fetch = async (input) => {
      const url = new URL(String(input));
      if (url.searchParams.get("alt") === "media") {
        return new Response("{ bad json", { status: 200, headers: { "Content-Type": "application/json" } });
      }
      return new Response(JSON.stringify({
        id: "file-001",
        name: "toeic_vocab_drive_sync_state.json",
        mimeType: "application/json",
        modifiedTime: "2026-05-24T00:00:00.000Z",
        appProperties: { app_id: "toeic-vocab-tracker", file_kind: "sync_state" }
      }), { status: 200, headers: { "Content-Type": "application/json" } });
    };

    try {
      await window.GoogleDriveSyncClient.downloadSyncSnapshot("file-001");
      return { ok: true };
    } catch (error) {
      return {
        ok: false,
        message: error.message,
        status: window.GoogleDriveSyncClient.getStatus()
      };
    } finally {
      window.fetch = originalFetch;
    }
  });

  expect(result.ok).toBe(false);
  expect(result.message).toContain("not valid JSON");
  expect(result.status.state).toBe("error");
  expect(result.status.lastAction).toBe("download-sync-state");
});

test("Drive sync Phase 8 first device creates cloud state and second device restores Today Mastery Review", async ({ browser }) => {
  const drive = createFakeDriveBackend();
  const contextA = await browser.newContext();
  await drive.install(contextA);
  const pageA = await contextA.newPage();
  await gotoTracker(pageA);
  await primeMockGoogleDrive(pageA);
  await pageA.evaluate(() => window.VocabTracker.setView("settings"));
  await pageA.getByTestId("settings-drive-connect-button").click({ timeout: STEP_TIMEOUT });
  const seeded = await seedSyncLearnerSnapshot(pageA, "device_a");
  await pageA.getByTestId("settings-drive-sync-now-button").click({ timeout: STEP_TIMEOUT });
  await expect(pageA.locator("#tracker-notice")).toContainText("Google Drive safe sync 完成", { timeout: STEP_TIMEOUT });

  expect(drive.state.folder).toBeTruthy();
  expect(drive.state.file).toBeTruthy();
  expect(drive.state.payload.summary.attempts).toBe(1);
  expect(drive.state.payload.summary.sessions).toBe(1);

  const contextB = await browser.newContext();
  await drive.install(contextB);
  const pageB = await contextB.newPage();
  await gotoTracker(pageB);
  await primeMockGoogleDrive(pageB);
  await pageB.evaluate(() => window.VocabTracker.setView("settings"));
  await pageB.getByTestId("settings-drive-connect-button").click({ timeout: STEP_TIMEOUT });
  await pageB.getByTestId("settings-drive-sync-now-button").click({ timeout: STEP_TIMEOUT });
  await expect(pageB.locator("#tracker-notice")).toContainText("Google Drive safe sync 完成", { timeout: STEP_TIMEOUT });

  const restored = await pageB.evaluate(async () => {
    const attempts = await window.VocabDB.getAll("attempts");
    const sessions = await window.VocabDB.getAll("sessions");
    const reviewQueue = await window.VocabDB.getAll("review_queue");
    return {
      attempts: attempts.filter((row) => row.attempt_id.startsWith("pw_sync_attempt_")).length,
      sessions: sessions.filter((row) => row.session_id.startsWith("pw_sync_session_")).length,
      reviewQueue: reviewQueue.filter((row) => row.review_id.startsWith("pw_sync_review_")).length
    };
  });

  expect(restored).toEqual({ attempts: 1, sessions: 1, reviewQueue: 1 });

  await pageB.evaluate(() => window.VocabTracker.setView("today"));
  await expect(pageB.locator("body")).toContainText("1/39", { timeout: STEP_TIMEOUT });

  await pageB.evaluate(() => window.VocabTracker.setView("mistakes"));
  await expect(pageB.locator("body")).toContainText(seeded.baseWord, { timeout: STEP_TIMEOUT });

  await pageB.evaluate(() => window.VocabTracker.setView("mastery"));
  await expect(pageB.locator("body")).toContainText(seeded.baseWord, { timeout: STEP_TIMEOUT });

  await contextA.close();
  await contextB.close();
});

test("Drive sync Phase 8 merges two devices without losing attempts or sessions", async ({ browser }) => {
  const drive = createFakeDriveBackend();

  const contextA = await browser.newContext();
  await drive.install(contextA);
  const pageA = await contextA.newPage();
  await gotoTracker(pageA);
  await primeMockGoogleDrive(pageA);
  await pageA.evaluate(() => window.VocabTracker.setView("settings"));
  await pageA.getByTestId("settings-drive-connect-button").click({ timeout: STEP_TIMEOUT });
  await seedSyncLearnerSnapshot(pageA, "device_a");
  await pageA.getByTestId("settings-drive-sync-now-button").click({ timeout: STEP_TIMEOUT });
  await expect(pageA.locator("#tracker-notice")).toContainText("Google Drive safe sync 完成", { timeout: STEP_TIMEOUT });

  const contextB = await browser.newContext();
  await drive.install(contextB);
  const pageB = await contextB.newPage();
  await gotoTracker(pageB);
  await primeMockGoogleDrive(pageB);
  await pageB.evaluate(() => window.VocabTracker.setView("settings"));
  await pageB.getByTestId("settings-drive-connect-button").click({ timeout: STEP_TIMEOUT });
  await seedSyncLearnerSnapshot(pageB, "device_b");
  await pageB.getByTestId("settings-drive-sync-now-button").click({ timeout: STEP_TIMEOUT });
  await expect(pageB.locator("#tracker-notice")).toContainText("Google Drive safe sync 完成", { timeout: STEP_TIMEOUT });

  const pageASync = await pageA.evaluate(async () => window.VocabTracker.performGoogleDriveSync({ reason: "phase8_merge_pull" }));
  const counts = await pageA.evaluate(async () => {
    const attempts = await window.VocabDB.getAll("attempts");
    const sessions = await window.VocabDB.getAll("sessions");
    return {
      attempts: attempts.filter((row) => row.attempt_id.startsWith("pw_sync_attempt_")).length,
      sessions: sessions.filter((row) => row.session_id.startsWith("pw_sync_session_")).length
    };
  });

  expect(pageASync.mergeResult.added.attempts).toBe(1);
  expect(pageASync.mergeResult.added.sessions).toBe(1);
  expect(counts).toEqual({ attempts: 2, sessions: 2 });
  expect(drive.state.payload.summary.attempts).toBe(2);
  expect(drive.state.payload.summary.sessions).toBe(2);

  await contextA.close();
  await contextB.close();
});

test("Drive sync Phase 8 mobile Settings controls are usable at 390x844", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.evaluate(() => window.VocabTracker.setView("settings"));

  await expect(page.getByTestId("settings-drive-sync-panel")).toBeVisible({ timeout: STEP_TIMEOUT });
  await expect(page.getByTestId("settings-drive-auto-sync-row")).toBeVisible({ timeout: STEP_TIMEOUT });
  await expect(page.getByTestId("settings-drive-connect-button")).toBeVisible({ timeout: STEP_TIMEOUT });
  await expect(page.getByTestId("settings-drive-sync-now-button")).toBeVisible({ timeout: STEP_TIMEOUT });
  await expect(page.getByTestId("settings-drive-disconnect-button")).toBeVisible({ timeout: STEP_TIMEOUT });

  const width = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth
  }));
  expect(width.scrollWidth).toBeLessThanOrEqual(width.clientWidth + 1);
});
