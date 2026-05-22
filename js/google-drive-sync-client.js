// SYNC-01 Google Drive auth/API client.
// This module is inert until a configured client ID is provided and the user
// explicitly connects from the UI.
(function () {
  const DRIVE_API = "https://www.googleapis.com/drive/v3";
  const DRIVE_UPLOAD_API = "https://www.googleapis.com/upload/drive/v3";
  const GIS_SCRIPT = "https://accounts.google.com/gsi/client";
  const FOLDER_MIME_TYPE = "application/vnd.google-apps.folder";
  const JSON_MIME_TYPE = "application/json";
  const RETRYABLE_STATUSES = new Set([429, 500, 502, 503, 504]);
  const MAX_RETRY_ATTEMPTS = 3;
  const BASE_RETRY_DELAY_MS = 750;
  const MAX_RETRY_DELAY_MS = 15000;
  const DEFAULT_CONNECT_TIMEOUT_MS = 12000;

  let tokenClient = null;
  let accessToken = "";
  let gisScriptPromise = null;
  let status = baseStatus();

  function config() {
    return window.GoogleDriveSyncConfig || {};
  }

  function nowIso() {
    return new Date().toISOString();
  }

  function wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  function retryDelayMs(retryAfterHeader, attempt) {
    const seconds = Number(retryAfterHeader);
    if (Number.isFinite(seconds) && seconds >= 0) {
      return Math.min(MAX_RETRY_DELAY_MS, Math.max(250, seconds * 1000));
    }
    const retryAt = Date.parse(String(retryAfterHeader || ""));
    if (Number.isFinite(retryAt)) {
      return Math.min(MAX_RETRY_DELAY_MS, Math.max(250, retryAt - Date.now()));
    }
    return Math.min(MAX_RETRY_DELAY_MS, BASE_RETRY_DELAY_MS * (2 ** Math.max(0, attempt)));
  }

  function retryableError(message, code, extra = {}) {
    const error = new Error(message);
    error.code = code;
    error.retryable = true;
    Object.assign(error, extra);
    return error;
  }

  function connectTimeoutMs() {
    const configured = Number(config().connectTimeoutMs);
    return Number.isFinite(configured) && configured > 0 ? configured : DEFAULT_CONNECT_TIMEOUT_MS;
  }

  function baseStatus() {
    const cfg = window.GoogleDriveSyncConfig || {};
    return {
      state: cfg.isConfigured ? "disconnected" : "unavailable",
      configured: Boolean(cfg.isConfigured),
      connected: false,
      hasToken: false,
      folderId: "",
      fileId: "",
      scope: cfg.scope || "",
      folderName: cfg.folderName || "TOEIC Vocabulary Tracker Sync",
      syncFileName: cfg.syncFileName || "toeic_vocab_drive_sync_state.json",
      lastAction: "",
      lastError: "",
      lastWarning: "",
      updatedAt: nowIso()
    };
  }

  function setStatus(patch) {
    const hasLastWarning = Boolean(patch && Object.prototype.hasOwnProperty.call(patch, "lastWarning"));
    status = {
      ...status,
      configured: Boolean(config().isConfigured),
      scope: config().scope || status.scope,
      folderName: config().folderName || status.folderName,
      syncFileName: config().syncFileName || status.syncFileName,
      ...patch,
      lastWarning: hasLastWarning ? patch.lastWarning : "",
      updatedAt: nowIso()
    };
    status.hasToken = Boolean(accessToken);
    status.connected = Boolean(accessToken) && status.state === "connected";
    return getStatus();
  }

  function getStatus() {
    return { ...status };
  }

  function ensureConfigured() {
    if (!config().isConfigured || !config().clientId) {
      const error = new Error("Google Drive sync is not configured. Add a Web OAuth Client ID first.");
      error.code = "DRIVE_SYNC_NOT_CONFIGURED";
      setStatus({
        state: "unavailable",
        lastAction: "configuration-check",
        lastError: error.message
      });
      throw error;
    }
  }

  function loadIdentityScript() {
    ensureConfigured();
    if (window.google?.accounts?.oauth2) return Promise.resolve();
    if (gisScriptPromise) return gisScriptPromise;

    gisScriptPromise = new Promise((resolve, reject) => {
      const existing = document.querySelector(`script[src="${GIS_SCRIPT}"]`);
      if (existing) {
        existing.addEventListener("load", () => resolve(), { once: true });
        existing.addEventListener("error", () => reject(new Error("Unable to load Google Identity Services.")), { once: true });
        return;
      }

      const script = document.createElement("script");
      script.src = GIS_SCRIPT;
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Unable to load Google Identity Services."));
      document.head.appendChild(script);
    }).catch((error) => {
      gisScriptPromise = null;
      setStatus({
        state: "error",
        lastAction: "load-identity-script",
        lastError: error.message
      });
      throw error;
    });

    return gisScriptPromise;
  }

  async function initTokenClient() {
    ensureConfigured();
    await loadIdentityScript();
    if (tokenClient) return tokenClient;
    if (!window.google?.accounts?.oauth2?.initTokenClient) {
      throw new Error("Google Identity Services token client is unavailable.");
    }

    tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: config().clientId,
      scope: config().scope,
      callback: () => {}
    });
    return tokenClient;
  }

  async function connect() {
    ensureConfigured();
    setStatus({ state: "connecting", lastAction: "connect", lastError: "" });
    const client = await initTokenClient();

    return new Promise((resolve, reject) => {
      let settled = false;
      const timeoutId = setTimeout(() => {
        const error = new Error("Google Drive authorization did not finish. Check popup blockers and complete the Google sign-in window.");
        error.code = "DRIVE_SYNC_CONNECT_TIMEOUT";
        finishReject(error, "disconnected");
      }, connectTimeoutMs());

      function finishReject(error, nextState = "error") {
        if (settled) return;
        settled = true;
        clearTimeout(timeoutId);
        accessToken = "";
        setStatus({ state: nextState, lastAction: "connect", lastError: error.message });
        reject(error);
      }

      function finishResolve() {
        if (settled) return;
        settled = true;
        clearTimeout(timeoutId);
        setStatus({ state: "connected", lastAction: "connect", lastError: "" });
        resolve(getStatus());
      }

      client.callback = (response) => {
        if (response?.error) {
          const error = new Error(response.error_description || response.error);
          error.code = response.error || "DRIVE_SYNC_CONNECT_ERROR";
          finishReject(error, "error");
          return;
        }
        accessToken = response?.access_token || "";
        if (!accessToken) {
          const error = new Error("Google Drive did not return an access token.");
          error.code = "DRIVE_SYNC_MISSING_ACCESS_TOKEN";
          finishReject(error, "error");
          return;
        }
        finishResolve();
      };

      try {
        client.requestAccessToken({ prompt: "" });
      } catch (error) {
        finishReject(error, "error");
      }
    });
  }

  async function disconnect() {
    const token = accessToken;
    accessToken = "";
    tokenClient = null;

    if (token && window.google?.accounts?.oauth2?.revoke) {
      await new Promise((resolve) => {
        window.google.accounts.oauth2.revoke(token, () => resolve());
      });
    }

    return setStatus({
      state: config().isConfigured ? "disconnected" : "unavailable",
      lastAction: "disconnect",
      lastError: ""
    });
  }

  function requireToken() {
    ensureConfigured();
    if (!accessToken) {
      const error = new Error("Google Drive is not connected.");
      error.code = "DRIVE_SYNC_NOT_CONNECTED";
      setStatus({
        state: "disconnected",
        lastAction: "token-check",
        lastError: error.message
      });
      throw error;
    }
  }

  async function driveFetch(url, options = {}) {
    requireToken();
    const headers = new Headers(options.headers || {});
    headers.set("Authorization", `Bearer ${accessToken}`);

    for (let attempt = 0; attempt < MAX_RETRY_ATTEMPTS; attempt += 1) {
      if (navigator.onLine === false) {
        const error = retryableError(
          "Google Drive sync is offline. Local changes stay queued until the browser is online again.",
          "DRIVE_SYNC_OFFLINE"
        );
        setStatus({ state: "connected", lastAction: "drive-api", lastError: error.message });
        throw error;
      }

      let response;
      try {
        response = await fetch(url, {
          ...options,
          headers
        });
      } catch (error) {
        const networkError = retryableError(
          error?.message || "Google Drive request failed before a response was received.",
          "DRIVE_SYNC_NETWORK_ERROR"
        );
        setStatus({ state: "connected", lastAction: "drive-api", lastError: networkError.message });
        throw networkError;
      }

      if (response.ok) {
        return response;
      }

      const text = await response.text().catch(() => "");
      const message = `Google Drive API ${response.status}: ${text || response.statusText}`;
      if (response.status === 401 || response.status === 403) {
        const error = new Error(message);
        error.code = "DRIVE_SYNC_RECONNECT_REQUIRED";
        error.status = response.status;
        accessToken = "";
        setStatus({ state: "reconnect_required", lastAction: "drive-api", lastError: error.message });
        throw error;
      }

      if (RETRYABLE_STATUSES.has(response.status)) {
        const error = retryableError(message, "DRIVE_SYNC_RETRYABLE", {
          status: response.status,
          retryAfterMs: retryDelayMs(response.headers.get("Retry-After"), attempt)
        });
        setStatus({ state: "connected", lastAction: "drive-api", lastError: error.message });
        if (attempt < MAX_RETRY_ATTEMPTS - 1) {
          await wait(error.retryAfterMs);
          continue;
        }
        throw error;
      }

      const error = new Error(message);
      error.status = response.status;
      setStatus({ state: "error", lastAction: "drive-api", lastError: error.message });
      throw error;
    }

    const error = retryableError("Google Drive request exhausted retry attempts.", "DRIVE_SYNC_RETRYABLE", {
      retryAfterMs: MAX_RETRY_DELAY_MS
    });
    setStatus({ state: "connected", lastAction: "drive-api", lastError: error.message });
    throw error;
  }

  function quoteDriveQuery(value) {
    return String(value || "").replace(/\\/g, "\\\\").replace(/'/g, "\\'");
  }

  function modifiedTimeValue(file) {
    const value = Date.parse(String(file?.modifiedTime || ""));
    return Number.isFinite(value) ? value : 0;
  }

  function sortByModifiedTimeDesc(files) {
    return [...files].sort((left, right) => modifiedTimeValue(right) - modifiedTimeValue(left));
  }

  function isAppCreatedSyncFile(file) {
    return file?.appProperties?.app_id === (config().appId || "toeic-vocab-tracker")
      && file?.appProperties?.file_kind === "sync_state";
  }

  function chooseSyncFileCandidate(files) {
    const appCreated = sortByModifiedTimeDesc(files.filter(isAppCreatedSyncFile));
    if (appCreated.length) {
      return {
        file: appCreated[0],
        warning: appCreated.length > 1
          ? `Detected ${appCreated.length} app-created sync files; using the latest modified candidate.`
          : ""
      };
    }

    const sameNameFiles = sortByModifiedTimeDesc(files);
    if (sameNameFiles.length) {
      return {
        file: sameNameFiles[0],
        warning: sameNameFiles.length > 1
          ? `Detected ${sameNameFiles.length} sync files with the same name; using the latest modified candidate.`
          : ""
      };
    }

    return { file: null, warning: "" };
  }

  async function listFiles(query, fields = "files(id,name,mimeType,modifiedTime,appProperties)") {
    const params = new URLSearchParams({
      q: query,
      spaces: "drive",
      pageSize: "10",
      fields
    });
    const response = await driveFetch(`${DRIVE_API}/files?${params.toString()}`);
    const json = await response.json();
    return Array.isArray(json.files) ? json.files : [];
  }

  async function createMetadataFile(metadata) {
    const response = await driveFetch(`${DRIVE_API}/files?fields=id,name,mimeType,modifiedTime,appProperties`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(metadata)
    });
    return response.json();
  }

  async function findOrCreateSyncFolder() {
    const cfg = config();
    const folderName = cfg.folderName || status.folderName;
    const appId = cfg.appId || "toeic-vocab-tracker";
    const query = [
      `name='${quoteDriveQuery(folderName)}'`,
      `mimeType='${FOLDER_MIME_TYPE}'`,
      "trashed=false"
    ].join(" and ");
    const existing = await listFiles(query);
    const folder = existing[0] || await createMetadataFile({
      name: folderName,
      mimeType: FOLDER_MIME_TYPE,
      appProperties: {
        app_id: appId,
        file_kind: "sync_folder",
        sync_version: cfg.syncVersion || "1.0"
      }
    });

    setStatus({ state: "connected", folderId: folder.id, lastAction: "ensure-folder", lastError: "", lastWarning: "" });
    return folder;
  }

  function multipartBody(metadata, payload) {
    const boundary = `toeic_sync_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const body = [
      `--${boundary}`,
      "Content-Type: application/json; charset=UTF-8",
      "",
      JSON.stringify(metadata),
      `--${boundary}`,
      "Content-Type: application/json; charset=UTF-8",
      "",
      JSON.stringify(payload || {}, null, 2),
      `--${boundary}--`,
      ""
    ].join("\r\n");
    return { boundary, body };
  }

  async function createJsonFile(parentId, payload) {
    const cfg = config();
    const metadata = {
      name: cfg.syncFileName || status.syncFileName,
      mimeType: JSON_MIME_TYPE,
      parents: [parentId],
      appProperties: {
        app_id: cfg.appId || "toeic-vocab-tracker",
        file_kind: "sync_state",
        sync_version: cfg.syncVersion || "1.0"
      }
    };
    const { boundary, body } = multipartBody(metadata, payload || {});
    const response = await driveFetch(`${DRIVE_UPLOAD_API}/files?uploadType=multipart&fields=id,name,mimeType,modifiedTime,appProperties`, {
      method: "POST",
      headers: { "Content-Type": `multipart/related; boundary=${boundary}` },
      body
    });
    return response.json();
  }

  async function findOrCreateSyncFile(folderId) {
    const cfg = config();
    const fileName = cfg.syncFileName || status.syncFileName;
    const query = [
      `name='${quoteDriveQuery(fileName)}'`,
      `'${quoteDriveQuery(folderId)}' in parents`,
      "trashed=false"
    ].join(" and ");
    const existing = await listFiles(query);
    const selection = chooseSyncFileCandidate(existing);
    const initialPayload = window.GoogleDriveSyncData?.buildPayload
      ? await window.GoogleDriveSyncData.buildPayload()
      : {
          sync_version: cfg.syncVersion || "1.0",
          app_id: cfg.appId || "toeic-vocab-tracker",
          seed_version: "",
          updated_at: nowIso(),
          stores: {}
        };
    const file = selection.file || await createJsonFile(folderId, initialPayload);

    setStatus({
      state: "connected",
      fileId: file.id,
      lastAction: "ensure-file",
      lastError: "",
      lastWarning: selection.warning || ""
    });
    return file;
  }

  async function ensureSyncFile() {
    const folder = await findOrCreateSyncFolder();
    const file = await findOrCreateSyncFile(folder.id);
    return { folder, file };
  }

  async function getSyncFileMetadata(fileId) {
    const response = await driveFetch(`${DRIVE_API}/files/${encodeURIComponent(fileId)}?fields=id,name,mimeType,modifiedTime,appProperties`);
    return response.json();
  }

  async function downloadSyncSnapshot(fileId) {
    const resolvedFile = fileId
      ? await getSyncFileMetadata(fileId)
      : status.fileId
        ? await getSyncFileMetadata(status.fileId)
        : (await ensureSyncFile()).file;
    const id = resolvedFile.id;
    const response = await driveFetch(`${DRIVE_API}/files/${encodeURIComponent(id)}?alt=media`);
    const text = await response.text();
    let parsed;
    try {
      parsed = text.trim() ? JSON.parse(text) : {};
    } catch (_error) {
      const error = new Error("Google Drive sync state is not valid JSON.");
      setStatus({ state: "error", fileId: id, lastAction: "download-sync-state", lastError: error.message, lastWarning: "" });
      throw error;
    }

    const validation = window.GoogleDriveSyncData?.validatePayload?.(parsed);
    if (validation && !validation.ok) {
      const error = new Error(`Google Drive sync state is invalid: ${validation.errors.join("; ")}`);
      setStatus({ state: "error", fileId: id, lastAction: "download-sync-state", lastError: error.message, lastWarning: "" });
      throw error;
    }

    const warning = validation?.warnings?.join(" ") || "";
    setStatus({ state: "connected", fileId: id, lastAction: "download-sync-state", lastError: "", lastWarning: warning });
    return {
      payload: parsed,
      file: resolvedFile,
      validation: validation || { ok: true, errors: [], warnings: [] }
    };
  }

  async function downloadSyncState(fileId) {
    return (await downloadSyncSnapshot(fileId)).payload;
  }

  async function uploadSyncState(payload, fileId, options = {}) {
    const validation = window.GoogleDriveSyncData?.validatePayload?.(payload);
    if (validation && !validation.ok) {
      const error = new Error(`Google Drive sync upload payload is invalid: ${validation.errors.join("; ")}`);
      setStatus({ state: "error", lastAction: "upload-sync-state", lastError: error.message, lastWarning: "" });
      throw error;
    }
    const id = fileId || status.fileId || (await ensureSyncFile()).file.id;
    const expectedModifiedTime = String(options.expectedModifiedTime || "").trim();
    if (expectedModifiedTime) {
      const currentFile = await getSyncFileMetadata(id);
      if (currentFile?.modifiedTime && currentFile.modifiedTime !== expectedModifiedTime) {
        const error = new Error(`Google Drive sync file changed during upload preparation (${expectedModifiedTime} -> ${currentFile.modifiedTime}).`);
        error.code = "DRIVE_SYNC_UPLOAD_CONFLICT";
        error.currentFile = currentFile;
        setStatus({ state: "connected", fileId: id, lastAction: "upload-sync-state", lastError: error.message, lastWarning: "" });
        throw error;
      }
    }
    const response = await driveFetch(`${DRIVE_UPLOAD_API}/files/${encodeURIComponent(id)}?uploadType=media&fields=id,name,mimeType,modifiedTime,appProperties`, {
      method: "PATCH",
      headers: { "Content-Type": JSON_MIME_TYPE },
      body: JSON.stringify(payload || {}, null, 2)
    });
    const file = await response.json();
    setStatus({ state: "connected", fileId: id, lastAction: "upload-sync-state", lastError: "", lastWarning: "" });
    return file;
  }

  window.GoogleDriveSyncClient = {
    connect,
    disconnect,
    downloadSyncSnapshot,
    downloadSyncState,
    ensureSyncFile,
    findOrCreateSyncFile,
    findOrCreateSyncFolder,
    getSyncFileMetadata,
    getStatus,
    initTokenClient,
    isConfigured: () => Boolean(config().isConfigured),
    loadIdentityScript,
    uploadSyncState
  };

  setStatus(baseStatus());
})();
