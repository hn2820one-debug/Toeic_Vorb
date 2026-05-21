# Pages Mobile Shell Audit — Phase 5

Date: 2026-05-22  
Project: TOEIC Vocabulary Tracker (Program B)  
Scope: launcher first-screen CTA, tracker shell navigation, and page-level overflow under a Pages-like mobile viewport  
Production seed impact: none  
Service worker cache impact: covered separately by Phase 4; this audit reuses the shared subpath smoke

## Result

Phase 5 is complete for the current Pages/mobile baseline. The launcher and tracker shell hold up at `390x844`, and the mobile smoke now covers view-level primary actions across Today / Roadmap / Lesson / Settings / Export. This phase also introduced a small mobile-shell improvement: tracker action rows now stack vertically with full-width buttons under mobile widths, reducing cramped two-button rows across shell-level views.

| Checkpoint | Result | Evidence |
|---|---|---|
| `PAGES-05-01` | Pass | Playwright opens the launcher at `390x844` and verifies the primary `開始學習 / 開啟主程式` CTA is visible and inside the viewport. |
| `PAGES-05-02` | Pass | The mobile shell smoke scrolls to the last tracker tab, activates `設定`, and confirms the active tab state updates correctly without truncating navigation access. |
| `PAGES-05-03` | Pass | The same smoke confirms the tracker `返回首頁` button remains visible under mobile width and that the page-level document width does not overflow beyond the viewport. |
| `PAGES-05-04` | Pass | The shared mobile smoke verifies primary actions remain reachable across Today, Roadmap, Lesson, Settings, and Export under `390x844`, including the first Roadmap lesson start button and each view's primary action row. |
| `PAGES-05-05` | Pass | The shared mobile subpath smoke now validates tab count, tab labels, and active-state switching under `390x844`. |
| `PAGES-05-06` | Pass | The mobile shell smoke asserts `documentElement.scrollWidth <= clientWidth + 1`, so no full-page horizontal overflow is present; only local scrolling containers remain allowed. |

## Files Reviewed

- `index.html`
- `tracker.html`
- `css/base.css`
- `css/tracker.css`
- `tests/pages-subpath-routing.spec.ts`

## Verification

Repeatable command:

```powershell
npx playwright test tests/pages-subpath-routing.spec.ts
```

Expected result after this Phase 5 verification:

```text
11 passed
```

## Findings

- The launcher shell already fit the mobile baseline, but shell-level action rows benefited from a small CSS improvement: `.tracker-actions` now stacks into full-width controls under mobile widths.
- The launcher status note was updated to the current live production scope (`V2 + V3`, 39 lessons / 780 questions), removing stale first-screen product messaging.
- The tracker tab strip remains a local horizontal scroll region, while the document itself stays within viewport width.
- The shared mobile smoke now covers both shell-level tab behavior and view-level primary-action reachability without widening into a broader matrix.

## Remaining Work

- Decide later whether the launcher support copy should be compressed further for even smaller devices.
- Detailed lesson-runtime phone interaction still belongs to later mobile phases rather than this shell audit.