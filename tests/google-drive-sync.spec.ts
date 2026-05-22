import { expect, test } from "@playwright/test";

const APP_TIMEOUT = 30_000;
const STEP_TIMEOUT = 10_000;

async function connectMockGoogleDrive(page) {
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
  await page.evaluate(() => window.GoogleDriveSyncClient.connect());
}

test.beforeEach(async ({ page }) => {
  await page.goto("/tracker.html");
  await page.waitForFunction(() => typeof window.VocabTracker?.setView === "function", { timeout: APP_TIMEOUT });
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
