# TO_AI.md — Program B Master Handoff / 程式 B 總交接文件

**Version / 版本:** 9.3
**Last verified / 最後確認:** 2026-05-18
**Program / 程式:** TOEIC Vocabulary Tracker (Program B)
**Path / 路徑:** `C:\Users\Keith\Toeic\toeic-app-Vorb`
**Single source of truth / 唯一正式來源:** This file replaces the old root `TO_AI_APP_STATUS*.md` files. Historical versions are archived under `docs/backups/to_ai/2026-05-18/`.

---

## 1. Boundary / 邊界

Program B is the TOEIC Vocabulary Tracker only. Do not modify Program A.

程式 B 只代表 TOEIC Vocabulary Tracker。不要修改 Program A。

| App | Path | Scope |
|---|---|---|
| Program A — Grammar / PoS App | `C:\Users\Keith\toeic-app` | Grammar lessons and PoS color system. Do not modify. |
| Program B — TOEIC Vocabulary Tracker | `C:\Users\Keith\Toeic\toeic-app-Vorb` | Vocabulary curriculum, questions, mastery, review, export. |

---

## 2. Current Truth / 現況真相

The runnable production seed is V0-V3 only. V4 is draft-only and is not loaded by the app.

目前正式可執行 seed 只包含 V0-V3。V4 只是草稿，不會被 app 載入。

| Area / 區域 | Current value / 目前值 |
|---|---:|
| Runnable lessons / 可執行課程 | 193 |
| Question-bank rows / 題庫題數 | 4,399 |
| Vocab items / 詞彙項目 | 494 |
| Question files in manifest / manifest 題檔 | 18 |
| Duplicate stems / 重複題幹 | 0 |
| Full quality audit issues / 全題庫品質問題 | 0 |
| Seed version / 種子版本 | `toeic_vocab_tracker_c002_old_item_interference_2026_05_18` |
| Service worker cache / SW 快取 | `toeic-vorb-v8` |

| Stage | Lessons | Questions | Status |
|---|---:|---:|---|
| V0 Diagnosis | 1 | 31 | Active |
| V1 Word Family + Speed | 60 | 1,728 | Active |
| V2 TOEIC Scene Vocabulary | 60 | 1,200 | Active |
| V3 Collocation | 72 | 1,440 | Active |
| V4 Formal Phrase | 0 active | 0 active | Draft only |
| V5 False Friends + Speed Reflex | 0 | 0 | Planned |
| V6 Integrated Review + Seal Test | 0 | 0 | Planned |

Important notes:

- V2 has 50 core lessons plus 10 mixed-review lessons.
- V3 has 60 core lessons plus 12 mixed-review lessons.
- Mixed-review lessons reuse review questions; they do not add new question-bank rows.
- V4 draft lives in `drafts/v4/` and must not be promoted until its blockers are fixed.

---

## 3. Architecture / 架構

This is a static local-first PWA. There is no backend, login, cloud sync, build step, or runtime AI question generation.

這是靜態 local-first PWA。沒有後端、登入、雲端同步、建置流程，也沒有 runtime AI 產題。

| Layer / 層 | Current design / 目前設計 |
|---|---|
| Entry / 入口 | `index.html` launcher, `tracker.html` app |
| Storage / 儲存 | IndexedDB `toeic_vocab_tracker_db`, localStorage preferences/session |
| DB version / DB 版本 | IndexedDB version 2 |
| App shell / 主程式 | `js/vocab-tracker.js` imports view modules |
| State / 狀態 | `js/state.js` shared state and helpers |
| Scoring / 計分 | `js/vocab-scoring.js` as `window.VocabScoring` |
| DB wrapper / DB 封裝 | `js/vocab-db.js` as `window.VocabDB` |
| Views / 畫面 | Today, Roadmap, Lesson, Mistakes, Mastery, Export, Question Bank, Settings |

IndexedDB stores:

`users`, `settings`, `curriculum`, `lessons`, `questions`, `question_edits`, `vocab_items`, `attempts`, `sessions`, `error_logs`, `review_queue`, `exports`

Seed version must stay synchronized in exactly these three files when production curriculum or question data changes:

當正式課程或題庫資料變更時，seed version 必須同時同步以下三個檔案：

- `data/vocab/curriculum.json` -> `seed_version`
- `js/vocab-db.js` -> `SEED_VERSION`
- `tests/helpers/seed-idb.ts` -> `APP_SEED_VERSION`

---

## 4. Active Data / 正式資料

Production data files:

- `data/vocab/curriculum.json`
- `data/vocab/questions_v0.json`
- `data/vocab/questions_v1a.json` through `questions_v1f.json`
- `data/vocab/questions_v2a.json` through `questions_v2e.json`
- `data/vocab/questions_v3a.json` through `questions_v3f.json`
- `data/vocab/vocab_items.json`
- `data/vocab/grammar_links.json`

Draft-only files:

- `drafts/v4/questions_v4a.json`
- `drafts/v4/add-v4-items.js`

V4 draft is intentionally outside `data/vocab/`, so `audit-quality-full.js` and production seeding do not load it.

V4 草稿刻意放在 `data/vocab/` 外面，因此正式 audit 與 production seed 不會載入它。

---

## 5. Completed Work / 已完成工作

Content quality and seed cleanup:

- V0 was consolidated from 10 lessons / 240 questions to 1 diagnostic lesson / 31 questions.
- V1 duplicate stems were removed; 826 repeated `question_text` values were replaced.
- V2 definition-embedded prompts were rewritten; definition leakage is now 0.
- V2 type mistakes were fixed: 200 fill-in questions changed from `meaning_choice` to `scene_vocabulary`.
- V2 article giveaways were fixed.
- V2/V3 same-stage old-item review pressure was added for implementable early core lessons: `V2-A-72`, `V2-A-73`, `V3-A-122`, and `V3-A-123`.
- V3 cross-lesson template repetition was reduced to acceptable within-lesson repetition.
- V3 collocation item Chinese meanings and examples were filled.
- `docs/question-creation-spec.md` defines current authoring and audit rules.
- `scripts/audit-quality-full.js` now separates Core Lesson Audit, Mixed Review Audit, and Draft Audit; production audit skips `drafts/v4/` by default.

Learning workflow:

- Answer confirmation is required before attempts are saved.
- Feedback screen shows correctness, correct answer, selected answer, explanation, target item, Chinese meaning, example, and grammar/collocation note when available.
- Review Mode can run due / high-priority / repeated-error queue items.
- Review queue outcomes are marked `fixed`, `still_weak`, or `repeated_error`.
- Today dashboard has clickable Next Action and due-review count.
- Today dashboard shows V0 Diagnostic Recommendation after V0 attempts exist.
- Today dashboard shows display-only Stage Seal Readiness.
- Roadmap has filtering by stage, status, and lesson type.
- Mastery view has mastery-level filtering.
- Question Bank has search, pagination, editing in IndexedDB, import, and seed JSON export.
- Question Bank local edits are tracked in `question_edits` and can be exported as a reviewed patch workflow; browser edits still do not write source JSON directly.

Export and tests:

- Export includes CSV, JSON, Markdown, JSONL, review effectiveness, content quality summary, stage progress, and diagnostic recommendation.
- Scoring fixture tests exist in `tests/fixtures/mastery-score-fixtures.json`.
- `package.json` includes `test:scoring`, `test:audit`, `test:patch`, `test:data`, and `test:all`.
- Playwright suite currently runs 8 tests in this workspace.

---

## 6. Current Gaps / 目前缺口

High priority:

1. V2/V3 first-core old-item policy still needs audit/spec cleanup.
   - The implementable same-stage old-item plan was applied to production seed data.
   - `V2-A-71` and `V3-A-121` remain first-core policy exceptions because no earlier same-stage items exist.
   - Do not force cross-stage pressure into those first core lessons unless that policy is explicitly approved.

2. Stage Seal is display-only.
   - Today shows readiness, but it does not enforce locks or set `sealed` automatically.
   - This is intentional for now to avoid blocking existing learning flow.

3. Browser Question Bank source workflow still needs optional UI polish.
   - Patch export, compare, and apply scripts exist.
   - A browser-side `Compare Local vs Seed` button is still optional future UI.

Medium priority:

- V1-F speed drills still use the normal lesson shell; a speed-specific runtime would better match the goal.
- Review scheduling is simple, not a mature spaced-repetition algorithm.
- Attempts accumulate without a retention policy.
- DB version upgrade paths are not covered by migration tests.
- Export package is not zipped; browser fallback downloads individual files.

Closed or mostly closed:

- Mastery formula now has fixture tests, but long-term learner validation is still pending.
- V0 diagnostic recommendation exists, but it should be refined after real learner data.
- Mixed-review audit separation is implemented; future work should maintain this classification as new stages are promoted.
- Rich vocab information appears in lesson feedback and mistake review; full Mastery-card enrichment can still be improved later.

---

## 7. V4 Draft Status / V4 草稿狀態

V4 is not active.

V4 尚未啟用。

Current draft:

- `drafts/v4/questions_v4a.json`
- 100 questions across `V4-A-181` to `V4-A-185`
- `drafts/v4/add-v4-items.js` can regenerate 40 formal phrase items when V4 is intentionally activated.

Current blockers before V4 activation:

1. Add V4 stage rules to `docs/question-creation-spec.md`.
2. Decide V4 `distractor_type` policy.
3. Balance answer slots; current draft uses answer A too heavily.
4. Add V4 lessons to `curriculum.json`.
5. Add `questions_v4a.json` to the production manifest only after audit rules pass.
6. Add V4 vocab items to `data/vocab/vocab_items.json`.
7. Bump seed version in all 3 required files.
8. Run full validation and Playwright regression.

Do not activate V4 before V2/V3 old-item interference and stage-seal readiness are stable.

在 V2/V3 跨課干擾與 Stage Seal readiness 穩定前，不要啟用 V4。

---

## 8. Next Plan / 下一步計畫

### P0 — Documentation and regression cleanup / 文件與測試收斂

Goal: keep `TO_AI.md` as the only active AI handoff document and prevent future stale-count drift.

目標：讓 `TO_AI.md` 成為唯一正式 AI 交接文件，避免 202 / 4,608 等舊數字再次混入。

- Keep old root status files archived under `docs/backups/to_ai/2026-05-18/`.
- Add or extend Playwright checks for Roadmap filters, Stage Seal Readiness, and export file inventory.
- Keep `README.md`, `AGENTS.md`, and `CLAUDE.md` aligned with this file.

### P1 — V2/V3 old-item interference policy cleanup / V2-V3 跨課干擾規則收斂

Goal: reduce lesson-scope guessing by mixing old target items into V2/V3 core lessons.

目標：降低學生靠「本課範圍」猜題的可能，讓 V2/V3 核心課加入舊詞壓力。

- Production seed now includes same-stage review pressure for the implementable early V2/V3 core lessons.
- Keep `V2-A-71` and `V3-A-121` as first-core policy exceptions unless cross-stage pressure is explicitly approved.
- Keep mixed-review lessons assembled from review question IDs.
- Keep audit/spec wording aligned so historical "110 lessons" reports are not treated as current truth.

### P2 — Audit rule maintenance / Audit 規則維護

Goal: keep audit reports strict while preserving the current core/mixed-review/draft separation.

目標：保持 audit 嚴格，同時維持目前核心課、混合複習、草稿的分類。

- Keep core lesson coverage checks separate from mixed-review checks.
- Keep answer distribution, required fields, blank checks, article giveaway checks, and duplicate checks strict.
- Add clear audit output for V4 drafts only after V4 is intentionally promoted.

### P3 — Source-of-truth editing maintenance / 題庫來源流程維護

Goal: keep browser-local Question Bank edits reviewable without letting the browser rewrite production JSON.

目標：避免 Question Bank 在瀏覽器改了 IndexedDB，但正式 JSON seed 沒跟上。

- Keep current warning that Question Bank edits are browser-local until patch-applied.
- Use `docs/question-bank-source-of-truth-workflow.md` plus the patch scripts for source JSON updates.
- Do not let browser edits silently rewrite production seed files.

### P4 — Future V4 activation / 未來 V4 啟用

Goal: activate V4 only when its spec, audit rules, curriculum rows, item metadata, and tests are ready.

目標：只有在 V4 規格、audit、課程列、詞彙資料與測試都準備好後才正式啟用。

- Fix current V4-A draft blockers.
- Promote only a small V4 slice first.
- Treat V4 activation as a content seed change and bump seed version.

---

## 9. Validation Commands / 驗證命令

Run these after any production code, UI, seed, or documentation consolidation that affects current facts:

任何會影響正式程式、UI、seed 或狀態文件的修改後，請跑：

```powershell
node scripts/validate-vocab-data.js
node scripts/audit-quality-full.js
node scripts/audit-duplicates.js
npm run test:scoring
npm run test:audit
npm run test:patch
npx playwright test
```

For a broader local check:

```powershell
npm run test:all
```

Manual smoke checklist:

- Today: diagnostic recommendation and Stage Seal Readiness render.
- Roadmap: filters still work.
- Lesson: answer selection, Confirm Answer, feedback, and Next Question work.
- Mistakes: review queue and recent answer records render.
- Export: file inventory includes diagnostic recommendation and content quality summary.
- Question Bank: search, pagination, local edit warning, patch export, and edited seed JSON snapshot still work.

---

## 10. Operational Rules / 操作規則

- Do not modify `C:\Users\Keith\toeic-app`.
- Do not put draft question files under `data/vocab/` unless they are intended for production.
- Do not change production question or curriculum JSON without seed version sync.
- Do not consider a content change ready until full audit and Playwright pass.
- Keep Program A and Program B storage keys separate.
- Keep `TO_AI.md` current when major scope, counts, seed versions, or next priorities change.

---

## 11. Archived Documents / 已歸檔文件

The following old root status documents are historical references only:

以下舊根目錄狀態文件只作為歷史參考：

- `docs/backups/to_ai/2026-05-18/TO_AI_APP_STATUS.md`
- `docs/backups/to_ai/2026-05-18/TO_AI_APP_STATUS_V2.md`
- `docs/backups/to_ai/2026-05-18/TO_AI_APP_STATUS_V3.md`

Older backups from 2026-05-14 remain under `docs/backups/to_ai/2026-05-14/`.
