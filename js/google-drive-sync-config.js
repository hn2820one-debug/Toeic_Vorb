// Static Google Drive sync configuration for SYNC-01.
// Web OAuth client IDs are public identifiers, not client secrets.
// Browser apps use the Web OAuth client ID only. Do not store client secrets here.
(function () {
  const clientId = "231659540073-6f94pr1akb4qsns5vrsdkkn6i8g70kj0.apps.googleusercontent.com";

  window.GoogleDriveSyncConfig = Object.freeze({
    appId: "toeic-vocab-tracker",
    clientId,
    isConfigured: Boolean(clientId),
    scope: "https://www.googleapis.com/auth/drive.file",
    folderName: "TOEIC Vocabulary Tracker Sync",
    syncFileName: "toeic_vocab_drive_sync_state.json",
    syncVersion: "1.0",
    tokenStorage: "memory-only",
    setupDoc: "./docs/google-drive-oauth-setup.md"
  });
})();
