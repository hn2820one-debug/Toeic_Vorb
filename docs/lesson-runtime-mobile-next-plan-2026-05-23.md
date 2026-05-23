# Recommended Next Plan After MOBILE-DEPTH-01 (2026-05-23)

`MOBILE-DEPTH-01` first tranche (Phases 1–10 code + automated tests) is **complete enough to close the block** in `docs/Future Plan.md` once `npm run test:all` is green and you sign off two real phones.

Pick **one** primary track below; do not parallel content promotion without explicit user request.

---

## Option A — Close MOBILE-DEPTH-01 (recommended, 1–2 sessions)

**Goal:** Declare mobile lesson depth “live” with no open engineering debt.

| Step | Work |
|------|------|
| A1 | Green `npm run test:all` |
| A2 | Manual matrix: Android Chrome + iPhone Safari (06-12, 09-12, 10-10) |
| A3 | Product decision: keep first-use coach mark deferred unless real users miss the start/resume flow |
| A4 | Mark `MOBILE-DEPTH-01` done in `docs/Future Plan.md`; update `TO_AI.md` one paragraph |

**Do not** modify `data/vocab/*` in this track.

---

## Option B — MOBILE-DEPTH-02 (polish tranche)

Only after Option A sign-off. Scope ideas:

- PWA installed-mode QA + `display-mode: standalone` CSS tweaks
- Wake Lock opt-in (if product wants it)
- Roadmap / Today one-tap “continue last lesson” without extra tabs
- Weak-network throttle Playwright (offline + slow 3G)
- Left-hand reachability study (no toggle unless data supports it)

Plan file: create `docs/lesson-runtime-mobile-depth-plan-v2.md` when starting.

---

## Option C — Return to content mainline (user-directed only)

Per `docs/Future Plan.md`, content promotion remains **blocked** until real V2 learner/export evidence exists.

When unblocked:

1. Next V3 production wave per existing wave governance
2. Re-run `audit-quality-full.js` + seed sync on each promotion
3. Re-run mobile lesson smoke (`lesson-flow` + `mobile-viewport-matrix`) after any lesson-adjacent change

Mobile depth work **does not** authorize skipping release gates.

---

## Option D — Learner evidence loop (unblocks C)

| Step | Output |
|------|--------|
| D1 | You complete 3–5 V2 lessons on phone; export package |
| D2 | T049-style export feedback review with real V2 attempts |
| D3 | Decide if staircase-warning debt warrants isolated draft probe |

This is the highest-leverage product input but not a coding milestone by itself.

---

## Recommendation

**Do Option A now** (test:all + two-phone sign-off + Future Plan close).  
**Then Option D** in parallel with real study time.  
**Defer Option C** until export shows meaningful V2 data unless you explicitly prioritize more V3 lessons over polish.

---

## Suggested `Future Plan.md` block after close

```markdown
- [x] MOBILE-DEPTH-01：手機深度學習體驗（第一輪）
  Completed on: YYYY-MM-DD. Evidence: audit doc, 31+ mobile Playwright specs, test:all green, manual Android + iPhone sign-off.
- [ ] MOBILE-DEPTH-02：手機體驗第二輪（PWA / weak network / entry polish）— optional
```
