# TO_AI.md — Program B Master Handoff / 程式 B 總交接文件

**Version / 版本:** 10.41
**Last verified / 最後確認:** 2026-05-23
**Program / 程式:** TOEIC Vocabulary Tracker (Program B)
**Path / 路徑:** `C:\Users\Keith\Toeic\toeic-app-Vorb`
**Single source of truth / 唯一正式來源:** This file replaces the old root `TO_AI_APP_STATUS*.md` files. Historical versions are archived under `docs/backups/to_ai/2026-05-18/`.
**Active planning document / 唯一有效計劃文件:** `docs/Future Plan.md`. Historical planning documents are archived under `docs/backups/plans/2026-05-19/` and must not guide future updates.

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

The runnable production seed is V0-V3 only. V2 restores `V2-A-71` through `V2-A-80` (10/10 core) plus `V2-MR-01` and `V2-MR-02`. V3 restores `V3-A-121` through `V3-A-143` plus `V3-MR-01` through `V3-MR-04`. V4 remains draft-only and is not loaded by the app.

目前正式 production seed manifest 仍指向 V0-V3 題檔：V2 已有 `V2-A-71`–`V2-A-80`（core 10/10）與 `V2-MR-01` / `V2-MR-02`；V3 已有 `V3-A-121`–`V3-A-143`（rebuild wave-1 core 16/16 + wave-2 core 7 live）與 `V3-MR-01` / `V3-MR-02` / `V3-MR-03` / `V3-MR-04`。目前正式 lesson row 為 39、question row 為 780；V4 仍然只是草稿，不會被 app 載入。

| Area / 區域 | Current value / 目前值 |
|---|---:|
| Runnable lessons / 可執行課程 | 39 |
| Question-bank rows / 題庫題數 | 780 |
| Vocab items / 詞彙項目 | 632 |
| Question files in manifest / manifest 題檔 | 18 |
| Duplicate stems / 重複題幹 | 0 |
| Full quality audit issues / 全題庫品質問題 | 0 |
| Seed version / 種子版本 | `toeic_vocab_tracker_v3_w2_07_wave_18_2026_05_22` |
| Service worker cache / SW 快取 | `toeic-vorb-v46` |

| Stage | Lessons | Questions | Status |
|---|---:|---:|---|
| V0 Diagnosis | 0 | 0 | Cleared |
| V1 Word Family + Speed | 0 | 0 | Cleared |
| V2 TOEIC Scene Vocabulary | 12 | 240 | Core `V2-A-71`–`V2-A-80` + `V2-MR-01` / `V2-MR-02` live |
| V3 Collocation | 27 | 540 | Core `V3-A-121`–`V3-A-143` + `V3-MR-01`–`V3-MR-04` live |
| V4 Formal Phrase | 0 active | 0 active | Draft only |
| V5 False Friends + Speed Reflex | 0 | 0 | Planned |
| V6 Integrated Review + Seal Test | 0 | 0 | Planned |

Important notes:

- V2 has 50 core lessons plus 10 mixed-review lessons.
- V3 has 60 core lessons plus 12 mixed-review lessons.
- Current production content restores `V2-A-71` through `V2-A-80`, `V2-MR-01`, `V2-MR-02`, `V3-A-121` through `V3-A-143`, and `V3-MR-01` through `V3-MR-04`; the remaining V0/V1/V3 rebuild waves are still pending.
- The current full production audit passes with 0 blocking issues, 195 preferred stem-length warnings, 152 staircase progression warnings, and first-core old-item policy exceptions for `V2-A-71` and `V3-A-121`.
- C-09 post-release review accepted the 4 `V2-A-71` staircase progression warnings as short-term warning debt only. Wave 2, wave 3, and wave 4 promotion extended the same warning pattern through `V2-A-80`; no live seed rewrite is authorized until real learner/export evidence or an isolated draft probe justifies it.
- C-13 wave 3, `V2-MR-01`, wave 4 promotion, and T049 export feedback review are complete. `V2-A-75` through `V2-A-80` and `V2-MR-01` are live production lessons. T049 found no current V2 learner evidence, so no V2 live seed rewrite is authorized.
- C-11 promoted `V3-W1-01` to live `V3-A-121` in the first V3 production wave. V3 core progress is now 1/10.
- `V3-W1-02` is validated as the next draft candidate (`drafts/v0-v3-rebuild/v3_w1_02_candidate_draft_pack.json`); promotion target is `V3-A-122` after `V3-W1-03` authoring or an approved single-lesson wave 2 gate.
- Historical wave 2 candidate artifacts remain in `drafts/v0-v3-rebuild/`, but the live seed now already contains `V2-A-72` through `V2-A-74`.
- Mixed-review lessons reuse review questions; they do not add new question-bank rows.
- V4 draft lives in `drafts/v4/` and must not be promoted until its blockers are fixed.
- Canonical `speed_drill` time limit is 8 seconds across scoring, lesson runtime, authoring spec, and Playwright seed fixtures.
- The tracker shell still shows a non-dismissible empty production seed banner when both lesson rows and question rows are 0; it is not active in the current `V2-A-71` to `V2-A-80`, `V2-MR-01`, and `V3-A-121` production seed.

---

## 3. Architecture / 架構

This is a static local-first PWA. The shipped runtime still has no backend, active Google login, active cloud sync, build step, or runtime AI question generation. `SYNC-01` is now an approved user-requested scoped future exception for Google Identity Services + Google Drive API learner-record sync only; it must not add a backend, modify production seed data, enable V4, or replace local-first IndexedDB.

這是靜態 local-first PWA。目前已出貨 runtime 仍沒有後端、Google 登入、即時雲端同步、建置流程，也沒有 runtime AI 產題。`SYNC-01` 現已被使用者批准為有限 future exception：只允許 Google Identity Services + Google Drive API 做 learner-record sync；不得新增後端、修改 production seed、啟用 V4，或取代 local-first IndexedDB。

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

Every production seed change must also create a filled record from `docs/templates/seed-change-record-template.md` under `docs/seed-changes/`. The record must include the reason, impacted files, validation results, rollback plan, and sign-off. Do not treat a seed change as complete without it.

之後每次正式 seed 變更也必須從 `docs/templates/seed-change-record-template.md` 複製一份填寫後存放到 `docs/seed-changes/`。紀錄中必須包含原因、受影響檔案、驗證結果、回滾方式與簽核；未完成前不得視為 seed 變更完成。

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
- `drafts/v0-v3-rebuild/v2_a_72_candidate_draft_pack.json`
- `drafts/v0-v3-rebuild/v2_a_73_candidate_draft_pack.json`
- `drafts/v0-v3-rebuild/v2_a_74_candidate_draft_pack.json`
- `drafts/v0-v3-rebuild/v2_a_75_candidate_draft_pack.json`
- `drafts/v0-v3-rebuild/v2_a_76_candidate_draft_pack.json`
- `drafts/v0-v3-rebuild/v2_a_77_candidate_draft_pack.json`
- `drafts/v0-v3-rebuild/v2_a_78_candidate_draft_pack.json`
- `drafts/v0-v3-rebuild/v2_a_79_candidate_draft_pack.json`
- `drafts/v0-v3-rebuild/v2_a_80_candidate_draft_pack.json`
- `drafts/v0-v3-rebuild/v2_mr_01_structural_placeholder.json`
- `drafts/v0-v3-rebuild/v3_w1_01_candidate_draft_pack.json`

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
- Historical V2/V3 same-stage old-item plans exist in archived references, but current production seed now contains `V2-A-71` through `V2-A-80` plus `V2-MR-01`; C-13 defines how old-item pressure should continue into future V2/V3 lessons.
- V3 cross-lesson template repetition was reduced to acceptable within-lesson repetition.
- V3 collocation item Chinese meanings and examples were filled.
- `docs/question-creation-spec.md` defines current authoring and audit rules.
- `docs/rebuild-wave-release-gate.md` defines the minimum output, validation, and human-review gate for any draft or production content rebuild wave.
- `docs/question-bank-build-governance.md` defines the T001-T010 operating rules for 90-day production expansion, content buckets, Future Plan mapping, naming, role separation, completion rules, promotion-candidate criteria, priority labels, and monthly production-wave limits.
- `docs/production-baseline-smoke-checklist.md` defines the T011-T020 production baseline smoke workflow; T013 remains blocked until real `V2-A-71` learner/export evidence exists, and T015 remains conditional on that evidence.
- `docs/v2-production-promotion-pipeline.md` defines the T021-T030 V2 expansion plan: wave 2 is `V2-A-72` through `V2-A-74`, wave 3 is `V2-A-75` through `V2-A-77`, wave 4 is `V2-A-78` through `V2-A-80`, and `V2-MR-01` reuses review IDs after five V2 core lessons.
- `docs/minimum-usable-content-packs.md` and `drafts/v0-v3-rebuild/minimum_usable_packs.json` define the first V1/V2/V3 minimum usable content packs before scale-up.
- `docs/export-analysis-feedback-governance.md` and `drafts/v0-v3-rebuild/export_analysis_review_policy.json` define the export-review feedback loop after content updates.
- `scripts/audit-quality-full.js` now separates Core Lesson Audit, Mixed Review Audit, and Draft Audit; production audit skips `drafts/v4/` by default.
- Strict production prune removed 25 direct-definition rows that violated the semantic-meaning uniqueness policy; full audit now passes with warnings only.
- Full production bank clear removed the remaining V0-V3 production lesson rows and question rows after the warning-level review.
- `V2-A-71` was restored as the first rebuilt production wave with 1 lesson row and 24 question rows in `questions_v2a.json`.
- Wave 2 promotion added `V2-A-72` through `V2-A-74`, bringing `questions_v2a.json` to 4 production lesson rows and 96 production question rows.
- Wave 3 promotion added `V2-A-75` through `V2-A-77`, bringing `questions_v2a.json` to 7 production lesson rows and 168 production question rows.
- `V2-MR-01` mixed-review promotion added 1 curriculum lesson row and 0 question rows, bringing production to 8 runnable lessons and 168 question-bank rows.
- Wave 4 promotion added `V2-A-78` through `V2-A-80`, bringing production to 11 runnable lessons and 240 question-bank rows.
- Wave 4 advanced production to seed `toeic_vocab_tracker_v2_a_78_80_wave_4_2026_05_21`, service worker cache `toeic-vorb-v15`, and seed change record `docs/seed-changes/2026-05-21-toeic_vocab_tracker_v2_a_78_80_wave_4_2026_05_21.md` at that release step.
- C-09 recorded the `V2-A-71` post-release human review and export-review follow-up in `docs/wave-retrospectives/2026-05-20-c09-v2-a-71-post-release-review.md` and `drafts/v0-v3-rebuild/export_review_cycles/2026-05-20-c09-v2-a-71-post-release-review.json`.
- T049 recorded the ten-core V2 export feedback review in `drafts/v0-v3-rebuild/export_review_cycles/2026-05-21-t049-v2-live-feedback-review.json`. The only repo export is the 2026-05-14 `V1-B-21` package with 24 attempts / 1 session / 0 V2 attempts, so the review is complete with insufficient current V2 learner data and does not authorize a V2 seed rewrite.
- C-11 selected and validated `V3-W1-01` as the first V3 draft production candidate in `drafts/v0-v3-rebuild/v3_w1_01_candidate_draft_pack.json`; the human review is `docs/wave-retrospectives/2026-05-21-c11-v3-w1-01-current-baseline-review.md`. The isolated current-baseline audit scope was 12 lessons / 264 questions and passed with 0 blocking issues, 0 explanation warnings, and 0 preferred stem length warnings.
- V3 wave 16 promoted `V3-W2-05` to live `V3-A-141` (財務會計 搭配詞 2), adding 23 new question rows and 6 vocab items while reusing `v3_a_140_rv_024` for cross-lesson pressure.
- V3 wave 17 promoted `V3-W2-06` to live `V3-A-142` (財務會計 搭配詞 3), adding 23 new question rows and 6 vocab items while reusing `v3_a_141_rv_024` for cross-lesson pressure.
- V3 wave 18 promoted `V3-W2-07` to live `V3-A-143` (財務會計 搭配詞 4), adding 23 new question rows and 3 vocab items while reusing `v3_a_142_rv_024` for cross-lesson pressure. Current seed is `toeic_vocab_tracker_v3_w2_07_wave_18_2026_05_22`; current service worker cache is `toeic-vorb-v46` after the 2026-05-23 SYNC-01 Phase 7 verification update.
- C-10 execution has completed `T031` through `T037` for `V2-A-72`: the validated draft candidate is `drafts/v0-v3-rebuild/v2_a_72_candidate_draft_pack.json`, and the human review is `docs/wave-retrospectives/2026-05-20-t031-t037-v2-a-72-candidate-review.md`.

Learning workflow:

- Answer confirmation is required before attempts are saved.
- Feedback screen shows correctness, correct answer, selected answer, explanation, target item, Chinese meaning, example, and grammar/collocation note when available.
- Lesson runtime supports mouse-selected English word highlights for learner-marked unknown words. Highlights are saved locally under `toeic_vocab_word_highlights`, shown immediately in the current question panel, and kept out of production seed data.
- Export page supports Google Drive manual backup/restore: `匯出 Google Drive 備份檔` creates one `toeic_vocab_backup_YYYY-MM-DD.json`; `匯入備份檔` validates, previews, and safe-merges learner records. This is manual file portability only, not cloud sync, not Google Drive API, and not a login flow.
- `SYNC-01` repo-side Phases 1-7 are verified. The plan is recorded in `docs/google-drive-cloud-sync-plan.md`, manual OAuth setup is in `docs/google-drive-oauth-setup.md`, the Web OAuth client ID is configured in `js/google-drive-sync-config.js` without storing the downloaded client secret, the sync payload/validator/safe-merge/pending-change/auto-sync metadata logic is `js/google-drive-sync-data.js`, and the inert Drive auth/API client is `js/google-drive-sync-client.js`. Repo-side sync safety, auto-sync UX, retry/backoff, version-compatibility warnings, duplicate file selection, and one-shot re-merge on upload conflict are implemented; live OAuth/API validation is still blocked until Drive API, OAuth consent/test-user access, missing local authorized origins, and live browser authorization are confirmed.
- Review Mode can run due / high-priority / repeated-error queue items.
- Review queue outcomes are marked `fixed`, `still_weak`, or `repeated_error`.
- Today dashboard has clickable Next Action and due-review count.
- Empty production seed mode remains available: when both lesson rows and question rows are 0, Today and Lesson route to rebuild guidance instead of a dead Start Lesson path.
- A global empty production seed banner appears only when there are 0 lessons and 0 questions. It is non-dismissible, does not use localStorage, and links to Roadmap, Question Bank, and Export so deployed Pages builds do not depend on shipped docs.
- Today dashboard shows V0 Diagnostic Recommendation after at least 20 V0 attempts; partial V0 data is shown as insufficient data.
- Today dashboard shows display-only Stage Seal Readiness, with separate `planned`, `no data`, `not ready`, `ready`, and `sealed` states.
- Roadmap has filtering by stage, status, and lesson type.
- Mastery view has mastery-level filtering.
- Question Bank has search, pagination, editing in IndexedDB, import, and seed JSON export.
- Question Bank local edits are tracked in `question_edits` and can be exported as a reviewed patch workflow; browser edits still do not write source JSON directly.

Export and tests:

- Export includes CSV, JSON, Markdown, JSONL, review effectiveness, content quality summary, stage progress, diagnostic recommendation, learner word-highlight files, and a manual Google Drive backup JSON. `diagnostic_recommendation.json` uses the same 20-attempt V0 threshold.
- Google Drive backup import safe-merges learner records only: attempts, sessions, review queue, error logs, vocab item mastery/progress, lesson progress, local-first settings, exports, and word highlights. Production question/curriculum source JSON and seed version are not overwritten; `question_edits` remain governed by the Question Bank patch workflow.
- Scoring fixture tests exist in `tests/fixtures/mastery-score-fixtures.json`.
- `scripts/check-doc-consistency.js` validates active current-fact docs against seed/cache/count source files.
- `scripts/verify-minimum-usable-packs.js` validates the draft minimum usable content-pack artifact for V1-V3.
- `scripts/verify-export-review-governance.js` validates the export analysis feedback policy, template, sample review cycle, export builder, and related Playwright coverage.
- `package.json` includes `test:scoring`, `test:audit`, `test:patch`, `test:mup`, `test:export-governance`, `test:data`, `test:docs`, `test:pages-mobile`, and `test:all`.
- Playwright includes Google Drive backup/restore coverage in `tests/google-drive-backup.spec.ts` for backup shape, invalid JSON rejection, seed mismatch warnings, idempotent import, two-device merge, and mobile 390px operation. The shared Pages/mobile smoke is `tests/pages-subpath-routing.spec.ts`, currently returns 11 passed, and uses category prefixes such as `path:`, `layout:`, `manifest:`, `export:`, `settings:`, `service-worker:`, and `repair:`.
- `scripts/verify-pages-live-release.js` and `npm run test:pages-live` now verify the public GitHub Pages deployment against the current repo truth for launcher note, manifest fields, curriculum seed, and service-worker cache.

---

## 6. Current Gaps / 目前缺口

High priority:

1. V2/V3 old-item pressure still needs implementation through future waves.
   - Current production seed contains `V2-A-71` through `V2-A-80` plus `V2-MR-01`, so same-stage old-item pressure is now live through the first 10 V2 core lessons and the first mixed-review checkpoint.
   - `V2-A-71` and future `V3-A-121` remain first-core policy exceptions because no earlier same-stage items exist.
   - Wave 3 and later V2 lessons still need stronger same-item demand shift; do not force cross-stage pressure into first core lessons unless that policy is explicitly approved.

2. `V2-A-71` learner evidence is still pending.
   - C-09 accepted the 4 staircase warnings as short-term debt after human review, but repo exports contain no current `V2-A-71` learner attempts.
   - Revisit only after at least 3 full `V2-A-71` sessions / 72 attempts or review-mode export evidence, or through an isolated draft probe.
   - Future V2 lessons should use clearer same-item demand shift instead of copying the flat first-wave pattern.

3. V2 learner/export feedback is complete for this milestone, but remains insufficient for rewriting live seed.
   - `V2-A-71` through `V2-A-80` are live with V2 core 10/10; `V2-MR-01` and `V2-MR-02` are live mixed-review checkpoints (0 new question rows each).
   - Production has 12 runnable V2 lessons / 240 V2 question rows in manifest.
   - T049 export feedback review found only the old 2026-05-14 `V1-B-21` export package: 24 attempts, 1 session, and 0 current V2 attempts.
   - No production V2 rewrite is authorized by current evidence; revisit V2 staircase debt only after real current V2 learner/export evidence or a separate isolated draft probe.
   - W1 tranche export review (T050) confirms no current V2/V3 learner data; next expansion is `V3-W1-11` draft authoring.

4. W1 tranche milestone is complete on both V2 and V3; next work is wave 6 authoring or learner evidence.
   - V2: core `V2-A-71`–`80` (10/10) + `V2-MR-01` / `V2-MR-02`.
   - V3: core `V3-A-121`–`130` (10/10) + `V3-MR-01` / `V3-MR-02`.
   - T050 export feedback review (`2026-05-21-t050-w1-tranche-live-feedback-review.json`): 0 current V2/V3 attempts in repo; no live seed rewrite authorized.
   - Next content process: `V3-W1-11` → `V3-B-131` (業務協調), unless a fresh learner export is supplied first.
   - MR evidence: `docs/wave-retrospectives/2026-05-21-c11-v3-mr-01-02-promotion-review.md` and `docs/seed-changes/2026-05-21-toeic_vocab_tracker_v3_mr_01_02_mixed_review_2026_05_21.md`.
   - Wave 5 evidence: `docs/wave-retrospectives/2026-05-21-c11-v3-wave5-promotion-review.md` and `docs/seed-changes/2026-05-21-toeic_vocab_tracker_v3_w1_08_10_wave_5_2026_05_21.md`.
   - Wave 4 evidence: `docs/wave-retrospectives/2026-05-21-c11-v3-w1-07-promotion-review.md` and `docs/seed-changes/2026-05-21-toeic_vocab_tracker_v3_w1_07_wave_4_2026_05_21.md`.
   - Wave 1 evidence: `docs/wave-retrospectives/2026-05-21-c11-v3-w1-01-promotion-review.md` and `docs/seed-changes/2026-05-21-toeic_vocab_tracker_v3_w1_01_first_wave_2026_05_21.md`.
   - Wave 2 evidence: `docs/wave-retrospectives/2026-05-21-c11-v3-wave2-promotion-review.md` and `docs/seed-changes/2026-05-21-toeic_vocab_tracker_v3_w1_02_03_wave_2_2026_05_21.md`.
   - Wave 3 single-lesson review: `docs/wave-retrospectives/2026-05-21-c11-v3-w1-04-candidate-review.md`.

5. Stage Seal is display-only.
   - Today shows readiness, but it does not enforce locks or set `sealed` automatically.
   - This is intentional for now to avoid blocking existing learning flow.

6. Browser Question Bank source workflow still needs optional UI polish.
   - Patch export, compare, and apply scripts exist.
   - A browser-side `Compare Local vs Seed` button is still optional future UI.

Medium priority:

- V1-F speed drills still use the normal lesson shell; a speed-specific runtime would better match the goal.
- Review scheduling is simple, not a mature spaced-repetition algorithm.
- Attempts accumulate without a retention policy.
- DB version upgrade paths are not covered by migration tests.
- Export package is not zipped; browser fallback downloads individual files.
- Full Lesson runtime mobile depth testing is still pending after the shell/settings/export baseline.
- Question Bank mobile management ergonomics still need a dedicated follow-up pass.
- Cross-browser PWA install prompt / install-flow behavior is still pending real-device verification.
- Public GitHub Pages deployment is now aligned with current repo truth: `npm run test:pages-live` passes on the live URL with seed `toeic_vocab_tracker_v3_w2_07_wave_18_2026_05_22`, 39 runnable lessons, the current launcher note, and service-worker cache `toeic-vorb-v46`.

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

### P0 — GitHub Pages + mobile baseline / Pages 與手機端基線

Goal: make the static PWA reliable on GitHub Pages and usable on mobile before the next content promotion.

目標：在下一個內容 promotion 前，先讓 static PWA 在 GitHub Pages 上穩定，並補齊手機端基線體驗。

- Current priority is `PAGES-01`, tracked in `docs/pages-mobile-experience-plan.md`.
- Phase 9 is verified: `npm run test:pages-mobile` is the dedicated shared mobile smoke, and `.github/workflows/e2e.yml` now runs `npm run test:all`.
- Phase 10 is in progress: release-gate docs are synchronized, the live deployment gate now passes, and no content promotion is authorized while `PAGES-01` remains open.
- Keep the official deploy target as `main` branch + `.github/workflows/pages.yml`; do not switch to `docs/` publishing or a `gh-pages` branch.
- Do not modify production seed data, enable V4, or continue `V3-W2-08` unless the user explicitly asks for content promotion.
- Complete the 10 phases / 60 checkpoints, keep the minimum mobile smoke test green, run `npm run test:all`, and complete the GitHub Pages mobile acceptance checklist.
- Remaining manual acceptance before `PAGES-01` can close: real GitHub Pages URL phone validation, mobile export download confirmation, and execution of the offline/update manual checklist on a real device/browser.
- Public `main` redeploy is complete and `npm run test:pages-live` already passes; the remaining blockers are the real-device checks only.

### P1 — Documentation and regression cleanup / 文件與測試收斂

Goal: keep `TO_AI.md` as the only active AI handoff document and prevent future stale-count drift.

目標：讓 `TO_AI.md` 成為唯一正式 AI 交接文件，避免 202 / 4,608 等舊數字再次混入。

- Keep old root status files archived under `docs/backups/to_ai/2026-05-18/`.
- `XPLAT-01` is tracked in `docs/google-drive-record-portability-plan.md` as user-requested parallel UX/data-portability work. It does not close `PAGES-01`, does not authorize content promotion, and does not change production seed data.
- `SYNC-01` is tracked in `docs/google-drive-cloud-sync-plan.md` as user-requested parallel Google Drive sync work. Phase 1 documentation/linkage is verified, Phase 2 repo-side setup is verified with the user-provided Web OAuth client ID copied into `js/google-drive-sync-config.js` and no client secret stored, Phase 3 disabled-safe Drive client skeleton is in place, Phase 4 sync data contract is verified, Phase 5 safe-merge/conflict rules are implemented, Phase 6 auto-sync UX/state is verified through `js/google-drive-sync-data.js` and Settings, and Phase 7 failure-handling/safety is now repo-side verified through `js/google-drive-sync-client.js`, `js/vocab-tracker.js`, `js/views/settings.js`, and `tests/google-drive-sync.spec.ts`. Live authorization remains blocked on confirming Google Cloud project, Drive API, OAuth consent/test-user access, missing local authorized origins, and browser auth validation. It is a scoped exception to the no-login/no-cloud-sync rule for future Google Identity Services + Google Drive API learner-record sync only; it does not close `PAGES-01`, does not authorize content promotion, and does not change production seed data.
- Add or extend Playwright checks for Roadmap filters, Stage Seal Readiness, and export file inventory.
- Keep `README.md`, `AGENTS.md`, and `CLAUDE.md` aligned with this file.

### P2 — V2/V3 old-item interference policy cleanup / V2-V3 跨課干擾規則收斂

Goal: reduce lesson-scope guessing by mixing old target items into V2/V3 core lessons.

目標：降低學生靠「本課範圍」猜題的可能，讓 V2/V3 核心課加入舊詞壓力。

- Rebuild wave-1 tranche is complete (16/16); wave-2 has `V3-A-137`–`142` (人事與組織 3 + 行銷與宣傳 1–2 + 財務會計 1–3). `V3-MR-03` covers `V3-A-131`–`135`, and `V3-MR-04` covers `V3-A-136`–`140`. There is no `V3-W1-17` in `wave1_app_lesson_draft.json`.
- T049 and T050 export reviews are complete with insufficient current V2/V3 learner data; collect fresh exports before any live seed rewrite.
- Next content process remains `V3-W2-08` → `V3-A-144` (企業經營 1), but it is deferred until `PAGES-01` is complete or the user explicitly asks for content promotion.
- Continue later same-stage review pressure in isolated drafts before touching production seed files.
- Keep `V2-A-71` and future `V3-A-121` as first-core policy exceptions unless cross-stage pressure is explicitly approved.
- Keep mixed-review lessons assembled from review question IDs.
- Keep audit/spec wording aligned so historical "110 lessons" reports are not treated as current truth.

### P3 — Audit rule maintenance / Audit 規則維護

Goal: keep audit reports strict while preserving the current core/mixed-review/draft separation.

目標：保持 audit 嚴格，同時維持目前核心課、混合複習、草稿的分類。

- Keep core lesson coverage checks separate from mixed-review checks.
- Keep answer distribution, required fields, blank checks, article giveaway checks, and duplicate checks strict.
- Add clear audit output for V4 drafts only after V4 is intentionally promoted.

### P4 — Source-of-truth editing maintenance / 題庫來源流程維護

Goal: keep browser-local Question Bank edits reviewable without letting the browser rewrite production JSON.

目標：避免 Question Bank 在瀏覽器改了 IndexedDB，但正式 JSON seed 沒跟上。

- Keep current warning that Question Bank edits are browser-local until patch-applied.
- Use `docs/question-bank-source-of-truth-workflow.md` plus the patch scripts for source JSON updates.
- Do not let browser edits silently rewrite production seed files.

### P5 — Future V4 activation / 未來 V4 啟用

Goal: activate V4 only when its spec, audit rules, curriculum rows, item metadata, and tests are ready.

目標：只有在 V4 規格、audit、課程列、詞彙資料與測試都準備好後才正式啟用。

- Fix current V4-A draft blockers.
- Promote only a small V4 slice first.
- Treat V4 activation as a content seed change and bump seed version.

---

## 9. Validation Commands / 驗證命令

Run these after any production code, UI, seed, or documentation consolidation that affects current facts:

任何會影響正式程式、UI、seed 或狀態文件的修改後，請跑：

For content rebuild waves, follow `docs/rebuild-wave-release-gate.md` before treating a draft slice or production seed change as ready.

內容重建 wave 必須先通過 `docs/rebuild-wave-release-gate.md` 的 gate，才可視為草稿切片或正式 seed 變更已準備好。

```powershell
node scripts/validate-vocab-data.js
node scripts/check-doc-consistency.js
node scripts/audit-quality-full.js
node scripts/audit-duplicates.js
npm run test:scoring
npm run test:audit
npm run test:patch
npm run test:mup
npm run test:export-governance
npm run test:docs
npm run test:pages-mobile
npm run test:pages-live
npx playwright test tests/google-drive-backup.spec.ts
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

Manual Pages/mobile checklist references:

- `docs/pages-mobile-experience-plan.md`
- `docs/pages-offline-update-manual-checklist-2026-05-22.md`
- `docs/pages-export-mobile-audit-2026-05-22.md`

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
