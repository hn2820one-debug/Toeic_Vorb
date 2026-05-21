# GitHub Pages + Mobile Experience Plan

更新日期：2026-05-22  
專案：TOEIC Vocabulary Tracker (Program B)  
範圍：GitHub Pages 部署穩定、PWA 行為、手機端完整體驗 baseline

## Goal

把 Program B 的首要短期目標從繼續新增內容，暫時切換到 GitHub Pages 與手機端可用性。完成本計劃後，使用者應能在手機瀏覽器或安裝式 PWA 中穩定開啟首頁、進入 tracker、使用 Settings / Export、清除舊快取，並取得可驗證的 mobile smoke test coverage。

## Constraints

- 維持 `main` branch + `.github/workflows/pages.yml` 的 GitHub Actions Pages 部署方式。
- 不改成 `docs/` 發布，不新增 `gh-pages` 分支。
- 不修改 `data/vocab/*`、production seed、service worker cache name，除非未來實作階段真的變更 deployed asset。
- 不啟用 V4，不移動 `drafts/v4/`。
- 不新增 backend、login、cloud sync、build tooling 或 runtime AI question generation。
- 本計劃完成前，不繼續下一個 content promotion，除非使用者明確要求。

## 10 Phases / 60 Checkpoints

### Phase 1 — Pages Baseline Audit

- [x] PAGES-01-01 確認 `.github/workflows/pages.yml` 只從 `main` 與 `workflow_dispatch` 發布。
- [x] PAGES-01-02 確認 artifact 包含 root static PWA 必需檔案。
- [x] PAGES-01-03 確認 artifact 不包含 Program A 或不必要 debug / draft-only 檔案。
- [x] PAGES-01-04 確認 Pages artifact 路徑支援 repository subpath。
- [x] PAGES-01-05 確認 `index.html` 到 `tracker.html` 使用相對路徑。
- [x] PAGES-01-06 建立 Pages baseline 驗收清單與結果紀錄：`docs/pages-baseline-audit-2026-05-22.md`。

### Phase 2 — Root Path And Subpath Routing

- [x] PAGES-02-01 檢查 `index.html` 所有 link / script / style / icon path 是否為 Pages-safe relative path。
- [x] PAGES-02-02 檢查 `tracker.html` 所有 module import 與靜態資源 path。
- [x] PAGES-02-03 檢查 app 內導向 `index.html` / `tracker.html` / `clear-sw.html` 的 path。
- [x] PAGES-02-04 避免 production path 使用絕對 `/js/...`、`/data/...`、`/css/...`。
- [x] PAGES-02-05 補 mobile smoke：從 Pages-like subpath 開首頁、進 tracker、返回首頁，並直開 `clear-sw.html`。
- [x] PAGES-02-06 驗收：本地 `http-server` 模擬 subpath 時首頁、tracker、返回首頁流程與 `clear-sw.html` 都可載入。結果紀錄：`docs/pages-subpath-routing-audit-2026-05-22.md`。

### Phase 3 — Manifest And Installability

- [x] PAGES-03-01 確認 `manifest.json` 可在 Pages artifact root 被讀取。
- [x] PAGES-03-02 確認 `start_url`、`scope`、icons 都使用相對路徑。
- [x] PAGES-03-03 確認 mobile standalone display 不破壞返回首頁流程。
- [x] PAGES-03-04 檢查 `apple-touch-icon` 在首頁與 tracker 都一致。
- [x] PAGES-03-05 補 smoke：browser context 能 fetch manifest 並得到 200。
- [x] PAGES-03-06 驗收：Chrome / Playwright 可讀到 manifest JSON。結果紀錄：`docs/pages-manifest-installability-audit-2026-05-22.md`。

### Phase 4 — Service Worker Scope And Cache Safety

- [x] PAGES-04-01 確認 `navigator.serviceWorker.register("./sw.js")` 在 Pages subpath 下 scope 正確。
- [x] PAGES-04-02 確認 `STATIC_ASSETS` 全部是 Pages artifact 內存在的檔案。
- [x] PAGES-04-03 確認 cache version bump policy：deployed asset 或 production seed 變更才更新 cache name。
- [x] PAGES-04-04 檢查 stale-while-revalidate 是否可能長時間保留舊 `data/vocab/*.json`。
- [x] PAGES-04-05 保留 `clear-sw.html` 作手機可用的手動修復入口。
- [x] PAGES-04-06 驗收：舊 cache 清除後重新進入 tracker 會載入最新 seed。

Phase 4 結果紀錄：`docs/pages-service-worker-audit-2026-05-22.md`。

### Phase 5 — Mobile Shell And Navigation

- [x] PAGES-05-01 在 `390x844` viewport 檢查首頁第一屏 CTA 是否清楚可點。
- [x] PAGES-05-02 檢查 tracker tabs 橫向捲動不遮擋、不截斷。
- [x] PAGES-05-03 檢查 top strip、header、返回首頁 button 在手機不擠壓主內容。
- [x] PAGES-05-04 檢查 Today / Roadmap / Lesson / Settings / Export 主要入口都可單手操作。
- [x] PAGES-05-05 補 smoke：mobile viewport 下 tabs 數量、文字、active state 正確。
- [x] PAGES-05-06 驗收：手機寬度下沒有整頁 horizontal overflow，只允許局部 tab / table overflow。

Phase 5 起始結果紀錄：`docs/pages-mobile-shell-audit-2026-05-22.md`。

### Phase 6 — Settings Mobile Usability

- [x] PAGES-06-01 檢查 Settings inputs 在 `390x844` 下單欄排列。
- [x] PAGES-06-02 檢查儲存設定 button 觸控高度足夠。
- [x] PAGES-06-03 檢查清除目前課程續作 button 不會誤觸主要儲存流程。
- [x] PAGES-06-04 檢查本機資料儲存區在手機能完整掃讀。
- [x] PAGES-06-05 補 smoke：手機 viewport 可修改設定值並看到成功 notice。
- [x] PAGES-06-06 驗收：Settings 不需要縮放畫面即可操作。

Phase 6 結果紀錄：`docs/pages-settings-mobile-audit-2026-05-22.md`。

### Phase 7 — Export Mobile Usability

- [x] PAGES-07-01 檢查 Export 頁面檔案 inventory 在手機可讀。
- [x] PAGES-07-02 檢查「匯出完整資料封包」在手機瀏覽器可觸發下載或產生 fallback 資料。
- [x] PAGES-07-03 檢查個別檔案下載 button 在手機不互相重疊。
- [x] PAGES-07-04 檢查 export preview 不造成整頁 horizontal overflow。
- [x] PAGES-07-05 補 smoke：mobile viewport 下點擊 export package，驗證 download / fallback event。
- [ ] PAGES-07-06 驗收：手機 Chrome 或 Safari 至少一種能成功取得 export package。

Phase 7 起始結果紀錄：`docs/pages-export-mobile-audit-2026-05-22.md`。
Phase 7 驗證狀態：repo 可控範圍已通過，僅剩 `PAGES-07-06` 實機瀏覽器下載驗收未完成。

### Phase 8 — Offline And Update Experience

- [x] PAGES-08-01 建立手動驗收：首次 online 載入後，切 offline 仍能打開首頁 / tracker。
- [x] PAGES-08-02 建立手動驗收：更新 cache version 後重新進入會取得新版資源。
- [x] PAGES-08-03 確認 `clear-sw.html` 在手機上清除 cache 後可返回首頁。
- [x] PAGES-08-04 補 smoke：`clear-sw.html` mobile viewport 顯示狀態與按鈕。
- [x] PAGES-08-05 記錄已知限制：Playwright 預設 block service worker，offline 行為以手動 checklist 驗收。
- [x] PAGES-08-06 驗收：使用者遇到舊檔殘留時有清楚修復路徑。

Phase 8 起始結果紀錄：`docs/pages-offline-update-audit-2026-05-22.md`。
Phase 8 手動驗收清單：`docs/pages-offline-update-manual-checklist-2026-05-22.md`。

### Phase 9 — CI / Playwright Mobile Coverage

- [x] PAGES-09-01 新增最小 mobile smoke spec，不擴大成完整 E2E matrix。
- [x] PAGES-09-02 測試至少覆蓋首頁、tracker init、Settings、Export、manifest fetch。
- [x] PAGES-09-03 保持現有 desktop Chromium suite 不變。
- [x] PAGES-09-04 不把 service worker 開進全 suite，避免 flake。
- [x] PAGES-09-05 在 CI 中跑 `npm run test:all`，確保既有測試與新增 mobile smoke 都過。
- [x] PAGES-09-06 驗收：mobile smoke 失敗時能指出 path、layout、manifest、export 哪一類。

Phase 9 起始結果紀錄：`docs/pages-mobile-coverage-audit-2026-05-22.md`。

### Phase 10 — Documentation And Release Gate

- [x] PAGES-10-01 更新 `docs/Future Plan.md`，把 Pages / mobile 設為下一輪首要目標。
- [x] PAGES-10-02 更新 README 的 Pages 使用方式與手機驗收清單。
- [x] PAGES-10-03 更新 `TO_AI.md` current process，標明下一階段仍不改課程內容。
- [x] PAGES-10-04 記錄尚未處理問題：完整 Lesson runtime mobile、Question Bank mobile、跨瀏覽器 PWA install。
- [x] PAGES-10-05 每次完成小段後記錄 checkpoint、驗證命令、是否可回滾。
- [ ] PAGES-10-06 完成後決策：若 Phase 1-10 驗收都過，下一階段才進入「上課流程」手機測試。

Phase 10 起始結果紀錄：`docs/pages-documentation-release-gate-audit-2026-05-22.md`。
Phase 10 live deployment 稽核：`docs/pages-live-deployment-audit-2026-05-22.md`。

## Acceptance Checklist

- [ ] 十階段 60 個 checkpoint 全部完成。
- [x] 最小 mobile smoke test 已加入並通過。
- [x] `npm run test:all` 通過。
- [ ] GitHub Pages 真實 URL 手機驗收完成。
- [x] `manifest.json` 在 Pages URL 可讀。
- [x] service worker scope / cache 行為已驗收，且 `clear-sw.html` 可作修復入口。
- [x] Settings / Export 在 `390x844` viewport 可操作。
- [x] 完成紀錄已回寫 `docs/Future Plan.md` 與 `TO_AI.md`。

目前總阻塞：公開 GitHub Pages 部署仍停在舊 seed / 舊 launcher 文案；`PAGES-07-06` 與 `PAGES-10-06` 仍需在 redeploy 後完成實機驗收。

## Deferred Work

- Lesson runtime 的完整手機答題體驗測試。
- Question Bank 手機管理工具深度優化。
- 跨瀏覽器 PWA install prompt 差異處理。
- 真實離線模式自動化測試。
- 任何 V3 下一課 content promotion。
