// SYNC-01 learner-record sync payload builder and validator.
// This module does not call Google APIs and does not read production source JSON.
(function () {
  const DEVICE_ID_KEY = "toeic_vocab_drive_sync_device_id";
  const WORD_HIGHLIGHT_KEY = "toeic_vocab_word_highlights";
  const AUTO_SYNC_PREFS = {
    enabled: "drive_auto_sync_enabled",
    pendingSince: "drive_sync_pending_since",
    pendingCount: "drive_sync_pending_count",
    pendingReasons: "drive_sync_pending_reasons",
    lastLocalChangeAt: "drive_sync_last_local_change_at",
    lastAttemptAt: "drive_sync_last_attempt_at",
    lastSuccessAt: "drive_sync_last_success_at",
    lastError: "drive_sync_last_error"
  };
  const SYNC_STORES = [
    "users",
    "settings",
    "lessons",
    "vocab_items",
    "attempts",
    "sessions",
    "error_logs",
    "review_queue",
    "exports",
    "word_highlights"
  ];
  const KEY_PATHS = {
    users: "user_id",
    settings: "key",
    lessons: "lesson_id",
    vocab_items: "item_id",
    attempts: "attempt_id",
    sessions: "session_id",
    error_logs: "error_log_id",
    review_queue: "review_id",
    exports: "export_id",
    word_highlights: "highlight_id"
  };
  const PROTECTED_SETTING_KEYS = new Set(["seed_version", "course_id"]);
  const LESSON_STATUS_RANK = {
    not_started: 0,
    in_progress: 1,
    needs_retake: 2,
    completed: 3,
    completed_with_reinforcement: 4,
    sealed: 5
  };
  const MASTERY_LEVEL_RANK = {
    blind: 0,
    weak: 1,
    unstable: 2,
    stable: 3,
    mastered: 4
  };
  const REVIEW_STATE_RANK = {
    fixed: 0,
    done: 0,
    completed: 0,
    reviewed: 1,
    slow_correct: 2,
    pending: 3,
    still_weak: 4,
    repeated_error: 5
  };

  function config() {
    return window.GoogleDriveSyncConfig || {};
  }

  function syncVersion() {
    return config().syncVersion || "1.0";
  }

  function appId() {
    return config().appId || "toeic-vocab-tracker";
  }

  function nowIso() {
    return window.VocabScoring?.localIso?.() || new Date().toISOString();
  }

  function cloneJson(value) {
    return JSON.parse(JSON.stringify(value ?? null));
  }

  function safeArray(value) {
    return Array.isArray(value) ? value : [];
  }

  function safeObject(value) {
    return value && typeof value === "object" && !Array.isArray(value) ? value : {};
  }

  function isPlainObject(value) {
    return Boolean(value && typeof value === "object" && !Array.isArray(value));
  }

  function parseSyncVersion(value) {
    const text = String(value || "").trim();
    if (!text) return null;
    const parts = text.split(".").map((segment) => Number(segment));
    if (!parts.length || parts.some((segment) => !Number.isFinite(segment) || segment < 0)) {
      return null;
    }
    return parts;
  }

  function compareSyncVersions(left, right) {
    const leftParts = parseSyncVersion(left);
    const rightParts = parseSyncVersion(right);
    if (!leftParts || !rightParts) return null;
    const length = Math.max(leftParts.length, rightParts.length);
    for (let index = 0; index < length; index += 1) {
      const leftValue = leftParts[index] ?? 0;
      const rightValue = rightParts[index] ?? 0;
      if (leftValue > rightValue) return 1;
      if (leftValue < rightValue) return -1;
    }
    return 0;
  }

  function latestValue(values) {
    const clean = safeArray(values).filter(Boolean).map(String).sort();
    return clean.length ? clean[clean.length - 1] : null;
  }

  function earliestValue(values) {
    const clean = safeArray(values).filter(Boolean).map(String).sort();
    return clean.length ? clean[0] : null;
  }

  function masteryLevelForScore(score) {
    const n = Number(score);
    if (!Number.isFinite(n)) return "";
    if (n >= 85) return "mastered";
    if (n >= 75) return "stable";
    if (n >= 60) return "unstable";
    if (n >= 40) return "weak";
    return "blind";
  }

  function strongestMasteryLevel(localLevel, incomingLevel) {
    const localRank = MASTERY_LEVEL_RANK[localLevel] ?? 0;
    const incomingRank = MASTERY_LEVEL_RANK[incomingLevel] ?? 0;
    return incomingRank > localRank ? incomingLevel : localLevel;
  }

  function numericMax(localValue, incomingValue) {
    const localNumber = Number(localValue);
    const incomingNumber = Number(incomingValue);
    if (Number.isFinite(localNumber) && Number.isFinite(incomingNumber)) return Math.max(localNumber, incomingNumber);
    if (Number.isFinite(incomingNumber)) return incomingNumber;
    if (Number.isFinite(localNumber)) return localNumber;
    return localValue ?? incomingValue ?? 0;
  }

  function recordsByKey(records, keyPath) {
    const map = {};
    safeArray(records).forEach((record) => {
      const key = String(record?.[keyPath] ?? "").trim();
      if (key) map[key] = record;
    });
    return map;
  }

  function uniqueByKey(records, keyPath) {
    const seen = new Set();
    const rows = [];
    let invalid = 0;
    let duplicate = 0;
    safeArray(records).forEach((record) => {
      if (!record || typeof record !== "object" || Array.isArray(record)) {
        invalid += 1;
        return;
      }
      const key = String(record[keyPath] ?? "").trim();
      if (!key) {
        invalid += 1;
        return;
      }
      if (seen.has(key)) {
        duplicate += 1;
        return;
      }
      seen.add(key);
      rows.push(record);
    });
    return { rows, invalid, duplicate };
  }

  function wordHighlightRecordKey(record) {
    const id = String(record?.highlight_id || "").trim();
    if (id) return `id:${id}`;
    return [
      "fallback",
      String(record?.normalized || record?.text || "").toLowerCase().trim(),
      String(record?.question_id || "").trim(),
      String(record?.session_id || "").trim(),
      String(record?.created_at || "").trim()
    ].join("|");
  }

  function uniqueWordHighlights(records) {
    const seen = new Set();
    const rows = [];
    let invalid = 0;
    let duplicate = 0;
    safeArray(records).forEach((record) => {
      if (!record || typeof record !== "object" || Array.isArray(record)) {
        invalid += 1;
        return;
      }
      const key = wordHighlightRecordKey(record);
      if (!key || key === "fallback||||") {
        invalid += 1;
        return;
      }
      if (seen.has(key)) {
        duplicate += 1;
        return;
      }
      seen.add(key);
      rows.push(record);
    });
    return { rows, invalid, duplicate };
  }

  function getPayloadWordHighlights(payload) {
    const storeRows = safeArray(payload?.stores?.word_highlights);
    if (storeRows.length) return storeRows;
    return safeArray(payload?.local_storage?.word_highlights);
  }

  function readJsonStorage(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (_error) {
      return fallback;
    }
  }

  function createDeviceId() {
    if (window.crypto?.randomUUID) return `sync_device_${window.crypto.randomUUID()}`;
    return `sync_device_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  }

  function getDeviceId() {
    const existing = String(localStorage.getItem(DEVICE_ID_KEY) || "").trim();
    if (existing) return existing;
    const next = createDeviceId();
    localStorage.setItem(DEVICE_ID_KEY, next);
    return next;
  }

  function loadWordHighlights() {
    return safeArray(readJsonStorage(WORD_HIGHLIGHT_KEY, []));
  }

  function saveWordHighlights(rows) {
    localStorage.setItem(WORD_HIGHLIGHT_KEY, JSON.stringify(safeArray(rows)));
  }

  function loadPrefs() {
    return window.VocabDB?.loadPrefs?.() || {};
  }

  function savePrefs(patch) {
    window.VocabDB?.savePrefs?.(patch || {});
    return getAutoSyncState();
  }

  function reasonList(value) {
    return safeArray(value).map((item) => String(item || "").trim()).filter(Boolean);
  }

  function getAutoSyncState() {
    const prefs = loadPrefs();
    const pendingCount = Number(prefs[AUTO_SYNC_PREFS.pendingCount] || 0);
    const pendingReasons = reasonList(prefs[AUTO_SYNC_PREFS.pendingReasons]);
    return {
      enabled: Boolean(prefs[AUTO_SYNC_PREFS.enabled]),
      paused: !prefs[AUTO_SYNC_PREFS.enabled],
      pending: pendingCount > 0,
      pendingSince: prefs[AUTO_SYNC_PREFS.pendingSince] || "",
      pendingCount,
      pendingReasons,
      lastLocalChangeAt: prefs[AUTO_SYNC_PREFS.lastLocalChangeAt] || "",
      lastAttemptAt: prefs[AUTO_SYNC_PREFS.lastAttemptAt] || "",
      lastSuccessAt: prefs[AUTO_SYNC_PREFS.lastSuccessAt] || "",
      lastError: prefs[AUTO_SYNC_PREFS.lastError] || ""
    };
  }

  function setAutoSyncEnabled(enabled) {
    return savePrefs({
      [AUTO_SYNC_PREFS.enabled]: Boolean(enabled),
      [AUTO_SYNC_PREFS.lastError]: ""
    });
  }

  function markLocalChange(reason = "local_change") {
    const prefs = loadPrefs();
    const now = nowIso();
    const reasons = reasonList(prefs[AUTO_SYNC_PREFS.pendingReasons]);
    const nextReason = String(reason || "local_change").trim() || "local_change";
    const nextReasons = [nextReason, ...reasons.filter((item) => item !== nextReason)].slice(0, 8);
    return savePrefs({
      [AUTO_SYNC_PREFS.pendingSince]: prefs[AUTO_SYNC_PREFS.pendingSince] || now,
      [AUTO_SYNC_PREFS.pendingCount]: Number(prefs[AUTO_SYNC_PREFS.pendingCount] || 0) + 1,
      [AUTO_SYNC_PREFS.pendingReasons]: nextReasons,
      [AUTO_SYNC_PREFS.lastLocalChangeAt]: now
    });
  }

  function clearPendingChanges() {
    return savePrefs({
      [AUTO_SYNC_PREFS.pendingSince]: "",
      [AUTO_SYNC_PREFS.pendingCount]: 0,
      [AUTO_SYNC_PREFS.pendingReasons]: [],
      [AUTO_SYNC_PREFS.lastError]: ""
    });
  }

  function recordSyncAttempt() {
    return savePrefs({
      [AUTO_SYNC_PREFS.lastAttemptAt]: nowIso()
    });
  }

  function recordSyncSuccess() {
    return savePrefs({
      [AUTO_SYNC_PREFS.pendingSince]: "",
      [AUTO_SYNC_PREFS.pendingCount]: 0,
      [AUTO_SYNC_PREFS.pendingReasons]: [],
      [AUTO_SYNC_PREFS.lastAttemptAt]: nowIso(),
      [AUTO_SYNC_PREFS.lastSuccessAt]: nowIso(),
      [AUTO_SYNC_PREFS.lastError]: ""
    });
  }

  function recordSyncFailure(error) {
    return savePrefs({
      [AUTO_SYNC_PREFS.lastAttemptAt]: nowIso(),
      [AUTO_SYNC_PREFS.lastError]: String(error?.message || error || "Google Drive sync failed")
    });
  }

  function buildSummary(stores) {
    const attempts = safeArray(stores.attempts);
    return {
      attempts: attempts.length,
      sessions: safeArray(stores.sessions).length,
      review_queue: safeArray(stores.review_queue).length,
      vocab_items: safeArray(stores.vocab_items).length,
      latest_attempt_at: latestValue(attempts.map((attempt) => attempt.timestamp || attempt.created_at))
    };
  }

  async function readStores() {
    const [
      users,
      settings,
      lessons,
      vocabItems,
      attempts,
      sessions,
      errorLogs,
      reviewQueue,
      exports
    ] = await Promise.all([
      window.VocabDB.getAll("users"),
      window.VocabDB.getAll("settings"),
      window.VocabDB.getAll("lessons"),
      window.VocabDB.getAll("vocab_items"),
      window.VocabDB.getAll("attempts"),
      window.VocabDB.getAll("sessions"),
      window.VocabDB.getAll("error_logs"),
      window.VocabDB.getAll("review_queue"),
      window.VocabDB.getAll("exports")
    ]);
    const wordHighlights = loadWordHighlights();
    return {
      users: cloneJson(users),
      settings: cloneJson(settings),
      lessons: cloneJson(lessons),
      vocab_items: cloneJson(vocabItems),
      attempts: cloneJson(attempts),
      sessions: cloneJson(sessions),
      error_logs: cloneJson(errorLogs),
      review_queue: cloneJson(reviewQueue),
      exports: cloneJson(exports),
      word_highlights: cloneJson(wordHighlights)
    };
  }

  async function buildPayload() {
    const deviceId = getDeviceId();
    const stores = await readStores();
    const prefs = window.VocabDB?.loadPrefs?.() || {};
    return {
      sync_version: syncVersion(),
      app_id: appId(),
      seed_version: window.VocabDB?.SEED_VERSION || "",
      updated_at: nowIso(),
      device_id: deviceId,
      last_writer_device_id: deviceId,
      summary: buildSummary(stores),
      stores,
      local_storage: {
        preferences: cloneJson(prefs),
        word_highlights: cloneJson(stores.word_highlights)
      }
    };
  }

  function validatePayload(payload) {
    const errors = [];
    const warnings = [];
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
      return { ok: false, errors: ["sync payload must be a JSON object"], warnings };
    }
    if (!payload.sync_version || typeof payload.sync_version !== "string") {
      errors.push("sync_version must be a non-empty string");
    } else {
      const versionComparison = compareSyncVersions(payload.sync_version, syncVersion());
      if (versionComparison === null) {
        errors.push(`sync_version must use numeric dot-separated format like ${syncVersion()}`);
      } else if (versionComparison > 0) {
        errors.push(`sync_version ${payload.sync_version} is newer than supported ${syncVersion()}`);
      } else if (versionComparison < 0) {
        warnings.push(`sync_version ${payload.sync_version} is older than current ${syncVersion()}; compatibility mode will ignore newer fields.`);
      }
    }
    if (payload.app_id !== appId()) {
      errors.push(`app_id must be ${appId()}`);
    }
    ["seed_version", "updated_at", "device_id", "last_writer_device_id"].forEach((key) => {
      if (!payload[key] || typeof payload[key] !== "string") {
        errors.push(`${key} must be a non-empty string`);
      }
    });
    if (!isPlainObject(payload.summary)) {
      errors.push("summary must be an object");
    }
    if (!isPlainObject(payload.stores)) {
      errors.push("stores must be an object");
    } else {
      SYNC_STORES.forEach((storeName) => {
        if (!Array.isArray(payload.stores[storeName])) {
          errors.push(`stores.${storeName} must be an array`);
        }
      });
      ["questions", "curriculum", "question_edits"].forEach((storeName) => {
        if (Object.prototype.hasOwnProperty.call(payload.stores, storeName)) {
          errors.push(`stores.${storeName} is not allowed in Drive sync payload`);
        }
      });
    }
    if (!isPlainObject(payload.local_storage)) {
      errors.push("local_storage must be an object");
    } else {
      if (!isPlainObject(payload.local_storage.preferences)) {
        errors.push("local_storage.preferences must be an object");
      }
      if (!Array.isArray(payload.local_storage.word_highlights)) {
        errors.push("local_storage.word_highlights must be an array");
      }
    }
    return { ok: errors.length === 0, errors, warnings };
  }

  function shouldMergeLesson(localRecord, incomingRecord) {
    if (!localRecord || !incomingRecord) return false;
    return JSON.stringify(mergeLessonProgress(localRecord, incomingRecord)) !== JSON.stringify(localRecord);
  }

  function shouldMergeVocabItem(localRecord, incomingRecord) {
    if (!localRecord || !incomingRecord) return false;
    return JSON.stringify(mergeVocabItemProgress(localRecord, incomingRecord)) !== JSON.stringify(localRecord);
  }

  function shouldMergeReviewQueue(localRecord, incomingRecord) {
    if (!localRecord || !incomingRecord) return false;
    return JSON.stringify(mergeReviewQueueRecord(localRecord, incomingRecord)) !== JSON.stringify(localRecord);
  }

  function mergeLessonProgress(localRecord, incomingRecord) {
    const merged = { ...localRecord };
    const localStatus = localRecord.status || "not_started";
    const incomingStatus = incomingRecord.status || "not_started";
    if ((LESSON_STATUS_RANK[incomingStatus] ?? 0) > (LESSON_STATUS_RANK[localStatus] ?? 0)) {
      merged.status = incomingStatus;
    }
    [
      "last_opened_at",
      "started_at",
      "completed_at",
      "updated_at",
      "last_completed_at"
    ].forEach((field) => {
      const value = latestValue([localRecord[field], incomingRecord[field]]);
      if (value) merged[field] = value;
    });
    [
      "attempt_count",
      "question_count",
      "completed_question_count",
      "correct_count",
      "wrong_count",
      "review_count"
    ].forEach((field) => {
      if (field in localRecord || field in incomingRecord) {
        merged[field] = numericMax(localRecord[field], incomingRecord[field]);
      }
    });
    return merged;
  }

  function mergeVocabItemProgress(localRecord, incomingRecord) {
    const merged = { ...localRecord };
    [
      "seen_count",
      "correct_count",
      "wrong_count",
      "mastery_score",
      "consecutive_fast_correct",
      "stable_review_sessions"
    ].forEach((field) => {
      if (field in localRecord || field in incomingRecord) {
        merged[field] = numericMax(localRecord[field], incomingRecord[field]);
      }
    });

    const firstSeen = earliestValue([localRecord.first_seen, incomingRecord.first_seen]);
    const lastSeen = latestValue([localRecord.last_seen, incomingRecord.last_seen]);
    const nextReviewDate = earliestValue([localRecord.next_review_date, incomingRecord.next_review_date]);
    if (firstSeen) merged.first_seen = firstSeen;
    if (lastSeen) merged.last_seen = lastSeen;
    if (nextReviewDate) merged.next_review_date = nextReviewDate;

    const incomingIsNewer = String(incomingRecord.last_seen || "") > String(localRecord.last_seen || "");
    if ((incomingIsNewer || !localRecord.avg_response_time_seconds) && incomingRecord.avg_response_time_seconds !== undefined) {
      merged.avg_response_time_seconds = incomingRecord.avg_response_time_seconds;
    }
    if (incomingIsNewer && incomingRecord.last_error_code !== undefined) {
      merged.last_error_code = incomingRecord.last_error_code;
    }

    const scoreLevel = masteryLevelForScore(merged.mastery_score);
    merged.mastery_level = scoreLevel || strongestMasteryLevel(localRecord.mastery_level, incomingRecord.mastery_level) || "blind";
    return merged;
  }

  function saferReviewState(localValue, incomingValue) {
    const localRank = REVIEW_STATE_RANK[localValue] ?? 0;
    const incomingRank = REVIEW_STATE_RANK[incomingValue] ?? 0;
    return incomingRank > localRank ? incomingValue : localValue;
  }

  function mergeReviewQueueRecord(localRecord, incomingRecord) {
    const merged = { ...localRecord, ...incomingRecord };
    merged.review_id = localRecord.review_id || incomingRecord.review_id;
    if (localRecord.status === "pending" || incomingRecord.status === "pending") {
      merged.status = "pending";
    } else {
      merged.status = saferReviewState(localRecord.status, incomingRecord.status) || localRecord.status || incomingRecord.status || "pending";
    }
    ["reason", "review_state", "review_status"].forEach((field) => {
      merged[field] = saferReviewState(localRecord[field], incomingRecord[field]) || localRecord[field] || incomingRecord[field];
    });
    ["due_date", "next_review_at"].forEach((field) => {
      const value = earliestValue([localRecord[field], incomingRecord[field]]);
      if (value) merged[field] = value;
    });
    ["created_at"].forEach((field) => {
      const value = earliestValue([localRecord[field], incomingRecord[field]]);
      if (value) merged[field] = value;
    });
    ["last_reviewed_at", "completed_at", "updated_at"].forEach((field) => {
      const value = latestValue([localRecord[field], incomingRecord[field]]);
      if (value) merged[field] = value;
    });
    [
      "priority",
      "repeated_error_count",
      "review_attempt_count",
      "review_correct_count",
      "wrong_count"
    ].forEach((field) => {
      if (field in localRecord || field in incomingRecord) {
        merged[field] = numericMax(localRecord[field], incomingRecord[field]);
      }
    });
    return merged;
  }

  function analyzeStorePlan(storeName, incomingRows, currentRows) {
    const keyPath = KEY_PATHS[storeName];
    const unique = uniqueByKey(incomingRows, keyPath);
    const current = recordsByKey(currentRows, keyPath);
    const plan = {
      store: storeName,
      incoming: unique.rows.length,
      add: 0,
      merge: 0,
      skip: 0,
      invalid: unique.invalid,
      duplicate: unique.duplicate,
      blocked: 0
    };

    unique.rows.forEach((record) => {
      const key = String(record[keyPath]);
      const localRecord = current[key];
      if (storeName === "settings") {
        if (PROTECTED_SETTING_KEYS.has(key) || localRecord) plan.skip += 1;
        else plan.add += 1;
        return;
      }
      if (storeName === "lessons") {
        if (!localRecord) plan.blocked += 1;
        else if (shouldMergeLesson(localRecord, record)) plan.merge += 1;
        else plan.skip += 1;
        return;
      }
      if (storeName === "vocab_items") {
        if (!localRecord) plan.blocked += 1;
        else if (shouldMergeVocabItem(localRecord, record)) plan.merge += 1;
        else plan.skip += 1;
        return;
      }
      if (storeName === "review_queue") {
        if (!localRecord) plan.add += 1;
        else if (shouldMergeReviewQueue(localRecord, record)) plan.merge += 1;
        else plan.skip += 1;
        return;
      }
      if (localRecord) plan.skip += 1;
      else plan.add += 1;
    });
    return plan;
  }

  function summarizePlans(plans) {
    return Object.values(plans).reduce((sum, plan) => ({
      incoming: sum.incoming + (plan.incoming || 0),
      add: sum.add + (plan.add || 0),
      merge: sum.merge + (plan.merge || 0),
      skip: sum.skip + (plan.skip || 0),
      invalid: sum.invalid + (plan.invalid || 0),
      duplicate: sum.duplicate + (plan.duplicate || 0),
      blocked: sum.blocked + (plan.blocked || 0)
    }), { incoming: 0, add: 0, merge: 0, skip: 0, invalid: 0, duplicate: 0, blocked: 0 });
  }

  async function currentRowsBySyncStore() {
    const indexedStores = SYNC_STORES.filter((storeName) => storeName !== "word_highlights");
    const entries = await Promise.all(indexedStores.map(async (storeName) => {
      const rows = await window.VocabDB.getAll(storeName);
      return [storeName, rows];
    }));
    return {
      ...Object.fromEntries(entries),
      word_highlights: loadWordHighlights()
    };
  }

  async function analyzeMerge(payload) {
    const validation = validatePayload(payload);
    const preview = {
      payload,
      ok: validation.ok,
      errors: validation.errors,
      warnings: [...(validation.warnings || [])],
      seedMismatch: false,
      plans: {},
      totals: { incoming: 0, add: 0, merge: 0, skip: 0, invalid: 0, duplicate: 0, blocked: 0 },
      summary: safeObject(payload?.summary),
      seedVersion: payload?.seed_version || ""
    };
    if (!validation.ok) return preview;

    if (payload.seed_version !== window.VocabDB?.SEED_VERSION) {
      preview.seedMismatch = true;
      preview.warnings.push(`seed_version differs: cloud=${payload.seed_version}, local=${window.VocabDB?.SEED_VERSION || ""}. Sync will merge learner records only and will not change production seed.`);
    }

    const currentRows = await currentRowsBySyncStore();
    SYNC_STORES.filter((storeName) => storeName !== "word_highlights").forEach((storeName) => {
      preview.plans[storeName] = analyzeStorePlan(storeName, payload.stores[storeName], currentRows[storeName]);
    });

    const incomingHighlights = uniqueWordHighlights(getPayloadWordHighlights(payload));
    const localHighlightKeys = new Set(loadWordHighlights().map(wordHighlightRecordKey));
    preview.plans.word_highlights = {
      store: "word_highlights",
      incoming: incomingHighlights.rows.length,
      add: incomingHighlights.rows.filter((row) => !localHighlightKeys.has(wordHighlightRecordKey(row))).length,
      merge: 0,
      skip: incomingHighlights.rows.filter((row) => localHighlightKeys.has(wordHighlightRecordKey(row))).length,
      invalid: incomingHighlights.invalid,
      duplicate: incomingHighlights.duplicate,
      blocked: 0
    };

    preview.totals = summarizePlans(preview.plans);
    preview.summary = {
      ...buildSummary(payload.stores),
      ...safeObject(payload.summary)
    };
    return preview;
  }

  async function putMissingRecords(storeName, rows) {
    const keyPath = KEY_PATHS[storeName];
    const current = recordsByKey(await window.VocabDB.getAll(storeName), keyPath);
    let added = 0;
    let skipped = 0;
    for (const record of uniqueByKey(rows, keyPath).rows) {
      const key = String(record[keyPath]);
      if (storeName === "settings" && PROTECTED_SETTING_KEYS.has(key)) {
        skipped += 1;
        continue;
      }
      if (!current[key]) {
        await window.VocabDB.put(storeName, cloneJson(record));
        current[key] = record;
        added += 1;
      } else {
        skipped += 1;
      }
    }
    return { added, skipped };
  }

  async function mergeLessonRecords(rows) {
    let merged = 0;
    let skipped = 0;
    let blocked = 0;
    for (const record of uniqueByKey(rows, KEY_PATHS.lessons).rows) {
      const localRecord = await window.VocabDB.get("lessons", record.lesson_id);
      if (!localRecord) {
        blocked += 1;
        continue;
      }
      const next = mergeLessonProgress(localRecord, record);
      if (JSON.stringify(next) !== JSON.stringify(localRecord)) {
        await window.VocabDB.put("lessons", next);
        merged += 1;
      } else {
        skipped += 1;
      }
    }
    return { merged, skipped, blocked };
  }

  async function mergeVocabItemRecords(rows) {
    let merged = 0;
    let skipped = 0;
    let blocked = 0;
    for (const record of uniqueByKey(rows, KEY_PATHS.vocab_items).rows) {
      const localRecord = await window.VocabDB.get("vocab_items", record.item_id);
      if (!localRecord) {
        blocked += 1;
        continue;
      }
      const next = mergeVocabItemProgress(localRecord, record);
      if (JSON.stringify(next) !== JSON.stringify(localRecord)) {
        await window.VocabDB.put("vocab_items", next);
        merged += 1;
      } else {
        skipped += 1;
      }
    }
    return { merged, skipped, blocked };
  }

  async function mergeReviewQueueRecords(rows) {
    let added = 0;
    let merged = 0;
    let skipped = 0;
    for (const record of uniqueByKey(rows, KEY_PATHS.review_queue).rows) {
      const localRecord = await window.VocabDB.get("review_queue", record.review_id);
      if (!localRecord) {
        await window.VocabDB.put("review_queue", cloneJson(record));
        added += 1;
        continue;
      }
      const next = mergeReviewQueueRecord(localRecord, record);
      if (JSON.stringify(next) !== JSON.stringify(localRecord)) {
        await window.VocabDB.put("review_queue", next);
        merged += 1;
      } else {
        skipped += 1;
      }
    }
    return { added, merged, skipped };
  }

  function mergePreferences(localStoragePayload) {
    const incomingPrefs = safeObject(localStoragePayload?.preferences);
    const localPrefs = window.VocabDB?.loadPrefs?.() || {};
    window.VocabDB?.savePrefs?.({ ...incomingPrefs, ...localPrefs });
  }

  function mergeWordHighlights(payload) {
    const localRows = loadWordHighlights();
    const localKeys = new Set(localRows.map(wordHighlightRecordKey));
    const incoming = uniqueWordHighlights(getPayloadWordHighlights(payload));
    const additions = incoming.rows.filter((row) => !localKeys.has(wordHighlightRecordKey(row)));
    if (additions.length) saveWordHighlights([...localRows, ...cloneJson(additions)]);
    return {
      added: additions.length,
      skipped: incoming.rows.length - additions.length,
      invalid: incoming.invalid,
      duplicate: incoming.duplicate
    };
  }

  async function mergePayload(payload) {
    const preview = await analyzeMerge(payload);
    if (!preview.ok) {
      throw new Error(preview.errors.join("; "));
    }
    const result = {
      added: {},
      merged: {},
      skipped: {},
      blocked: {},
      warnings: [...preview.warnings],
      seed_mismatch: preview.seedMismatch,
      seed_version_changed: false
    };

    for (const storeName of ["users", "settings", "attempts", "sessions", "error_logs", "exports"]) {
      const storeResult = await putMissingRecords(storeName, payload.stores[storeName]);
      result.added[storeName] = storeResult.added;
      result.skipped[storeName] = storeResult.skipped;
    }

    const lessonResult = await mergeLessonRecords(payload.stores.lessons);
    result.merged.lessons = lessonResult.merged;
    result.skipped.lessons = lessonResult.skipped;
    result.blocked.lessons = lessonResult.blocked;

    const vocabResult = await mergeVocabItemRecords(payload.stores.vocab_items);
    result.merged.vocab_items = vocabResult.merged;
    result.skipped.vocab_items = vocabResult.skipped;
    result.blocked.vocab_items = vocabResult.blocked;

    const reviewResult = await mergeReviewQueueRecords(payload.stores.review_queue);
    result.added.review_queue = reviewResult.added;
    result.merged.review_queue = reviewResult.merged;
    result.skipped.review_queue = reviewResult.skipped;

    mergePreferences(payload.local_storage);
    const highlightResult = mergeWordHighlights(payload);
    result.added.word_highlights = highlightResult.added;
    result.skipped.word_highlights = highlightResult.skipped;

    const seedSetting = await window.VocabDB.get("settings", "seed_version");
    result.seed_version_changed = seedSetting?.value !== window.VocabDB.SEED_VERSION;
    result.totals = {
      added: Object.values(result.added).reduce((sum, value) => sum + Number(value || 0), 0),
      merged: Object.values(result.merged).reduce((sum, value) => sum + Number(value || 0), 0),
      skipped: Object.values(result.skipped).reduce((sum, value) => sum + Number(value || 0), 0),
      blocked: Object.values(result.blocked).reduce((sum, value) => sum + Number(value || 0), 0)
    };
    return result;
  }

  window.GoogleDriveSyncData = {
    AUTO_SYNC_PREFS: { ...AUTO_SYNC_PREFS },
    DEVICE_ID_KEY,
    KEY_PATHS: { ...KEY_PATHS },
    SYNC_STORES: [...SYNC_STORES],
    analyzeMerge,
    buildPayload,
    buildSummary,
    clearPendingChanges,
    getAutoSyncState,
    getDeviceId,
    markLocalChange,
    mergePayload,
    recordSyncAttempt,
    recordSyncFailure,
    recordSyncSuccess,
    setAutoSyncEnabled,
    validatePayload
  };
})();
