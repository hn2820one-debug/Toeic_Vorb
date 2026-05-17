import {
  state,
  html,
  seconds,
  masteryLabel
} from "../state.js";

const MASTERY_LEVELS = ["blind", "weak", "unstable", "stable", "mastered"];

export function renderMastery() {
  const activeLevel = state.masteryFilter?.level || "";
  const levelCounts = {};
  state.vocabItems.forEach((item) => {
    const lv = item.mastery_level || "blind";
    levelCounts[lv] = (levelCounts[lv] || 0) + 1;
  });

  const filtered = state.vocabItems.filter((item) => !activeLevel || (item.mastery_level || "blind") === activeLevel);
  const rows = filtered
    .slice()
    .sort((a, b) => (a.mastery_score || 0) - (b.mastery_score || 0))
    .map((item) => `
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
          <span>Seen ${item.seen_count || 0}</span>
          <span>Correct ${item.correct_count || 0}</span>
          <span>Wrong ${item.wrong_count || 0}</span>
          <span>Avg ${seconds(item.avg_response_time_seconds)}</span>
          <span>Next ${html(item.next_review_date || "-")}</span>
        </div>
        ${item.example ? `<details class="item-example"><summary>Example</summary><p>${html(item.example)}</p></details>` : ""}
      </article>
    `).join("");

  const levelOptions = MASTERY_LEVELS.map((lv) => `
    <option value="${lv}" ${activeLevel === lv ? "selected" : ""}>${masteryLabel(lv)} (${levelCounts[lv] || 0})</option>
  `).join("");

  return `
    <section class="tracker-panel">
      <h3>Item Mastery Dashboard</h3>
      <div class="tracker-actions" style="margin-top:0;margin-bottom:12px">
        <label style="display:flex;align-items:center;gap:6px;font-size:13px">
          Level
          <select onchange="VocabTracker.setMasteryFilter('level', this.value)">
            <option value="">All (${state.vocabItems.length})</option>
            ${levelOptions}
          </select>
        </label>
        ${activeLevel ? `<span class="muted-note">${filtered.length} item${filtered.length === 1 ? "" : "s"} shown</span>` : ""}
      </div>
      <div class="mastery-list">${rows || `<p class="muted-note">No items match this filter.</p>`}</div>
    </section>
  `;
}