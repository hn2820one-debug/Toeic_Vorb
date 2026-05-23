# Lesson Runtime Mobile Phase 6 — Interruption Matrix

更新日期：2026-05-23  
計畫代號：`MOBILE-DEPTH-01` / Phase 6

## Matrix

| Scenario | Expected behavior | Automated probe |
|----------|-------------------|-----------------|
| 使用者按暫停 | 計時停止、答案按鈕 disabled、顯示 `lesson-paused-alert` | `lesson-flow.spec.ts` pause/reload |
| 瀏覽器重整（session 仍在 localStorage） | 回到原題、已確認答案保留、`pending_answer` 還原 | pause/reload + resume banner |
| 離線作答 | `runtime-local-note` 提示離線仍本機保存 | manual / future offline probe |
| sync pending | 提示「本機已保存 · 待同步」不阻擋作答 | `lesson-start-sync` probe |
| 誤觸離開（手機） | `confirm()` 需二次確認 | `lesson-flow` exit confirm |
| 切背景 / 鎖屏 | 依 PWA / 瀏覽器 freeze；回來後 session 仍在 | 真機 checklist（06-12） |
| PWA 喚回 | 與重整相同：IndexedDB + active session | 真機 checklist |

## Recovery priority

1. `loadActiveSession()` from localStorage  
2. `prepareRuntime()` rebuild question list  
3. Restore `pending_answer` per current question  
4. If `paused`, keep timers stopped until「繼續」
