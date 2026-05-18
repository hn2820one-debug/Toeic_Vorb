import {
  state,
  html,
  seconds,
  masteryLabel
} from "../state.js";

const MASTERY_LEVELS = ["blind", "weak", "unstable", "stable", "mastered"];

export function renderMastery() {
  const activeLevel = state.masteryFilter?.level || "";
  const search = (state.masteryFilter?.search || "").toLowerCase();
  const levelCounts = {};
  state.vocabItems.forEach((item) => {
    const lv = item.mastery_level || "blind";
    levelCounts[lv] = (levelCounts[lv] || 0) + 1;
  });

  let filtered = state.vocabItems.filter((item) => !activeLevel || (item.mastery_level || "blind") === activeLevel);
  if (search) {
    filtered = filtered.filter((item) =>
      (item.base_word || "").toLowerCase().includes(search) ||
      (item.chinese || "").toLowerCase().includes(search)
    );
  }

  const sorted = filtered.slice().sort((a, b) => (a.mastery_score || 0) - (b.mastery_score || 0));
  const byStage = {};
  sorted.forEach((item) => {
    const stage = item.stage || "未分類";
    if (!byStage[stage]) byStage[stage] = [];
    byStage[stage].push(item);
  });

  const stageGroups = Object.keys(byStage).sort().map((stage) => `
    <div class="mastery-stage-group">
      <h4>${html(stage)}</h4>
      ${byStage[stage].map((item) => `
        <article class="mastery-row level-${html(item.mastery_level || "blind")}">
          <div>
            <strong>${html(item.base_word || item.item_id)}</strong>
            <small>${html((item.variants || []).join(", "))}</small>
            ${item.chinese ? `<small class="item-chinese">${html(item.chinese)}</small>` : ""}
          </div>
          <div class="mastery-meta">
            <span>${item.mastery_score || 0}</span>
            <small>${masteryLabel(item.mastery_level)}</small>
          </div>
          <div class="mastery-details">
            <span>已看 ${item.seen_count || 0}</span>
            <span>答對 ${item.correct_count || 0}</span>
            <span>答錯 ${item.wrong_count || 0}</span>
            <span>平均 ${seconds(item.avg_response_time_seconds)}</span>
            <span>下次 ${html(item.next_review_date || "-")}</span>
          </div>
          ${item.example ? `<details class="item-example"><summary>例句</summary><p>${html(item.example)}</p></details>` : ""}
          <div class="mastery-row-actions">
            <button class="button small" type="button" onclick="VocabTracker.addItemToReview('${html(item.item_id)}')">加入複習</button>
          </div>
        </article>
      `).join("")}
    </div>
  `).join("");

  const levelOptions = MASTERY_LEVELS.map((lv) => `
    <option value="${lv}" ${activeLevel === lv ? "selected" : ""}>${masteryLabel(lv)} (${levelCounts[lv] || 0})</option>
  `).join("");

  return `
    <section class="tracker-panel">
      <h3>單字精熟度</h3>
      <div class="tracker-actions" style="margin-top:0;margin-bottom:12px">
        <input type="search" placeholder="搜尋詞彙..." value="${html(state.masteryFilter?.search || "")}"
          oninput="VocabTracker.setMasteryFilter('search', this.value)"
          style="padding:6px 10px;border:1px solid var(--border-light);border-radius:6px;font-size:13px;min-width:180px">
        <label style="display:flex;align-items:center;gap:6px;font-size:13px">
          等級
          <select onchange="VocabTracker.setMasteryFilter('level', this.value)">
            <option value="">全部 (${state.vocabItems.length})</option>
            ${levelOptions}
          </select>
        </label>
        ${(activeLevel || search) ? `<span class="muted-note">目前顯示 ${filtered.length} 筆</span>` : ""}
      </div>
      <div class="mastery-list">${stageGroups || `<p class="muted-note">目前篩選條件下沒有符合的項目。</p>`}</div>
    </section>
  `;
}
