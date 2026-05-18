const fs = require("fs");
const path = require("path");

const repoRoot = path.join(__dirname, "..");
const outDir = path.join(repoRoot, "drafts", "collocation-rebuild");
const inventoryPath = path.join(outDir, "phrase_411_inventory.json");
const blueprintPath = path.join(outDir, "wave1_lesson_blueprint.json");

function readJSON(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJSON(filePath, value) {
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function slugify(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "") || "item";
}

function normalizePhrase(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ");
}

function phraseTokens(value) {
  return normalizePhrase(value).split(" ").filter(Boolean);
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function countBy(rows, field) {
  return rows.reduce((acc, row) => {
    const key = row[field] || "unknown";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
}

function startsWithTokens(shorter, longer) {
  return shorter.length <= longer.length && shorter.every((token, index) => token === longer[index]);
}

function levenshtein(left, right) {
  const a = String(left || "");
  const b = String(right || "");
  const dp = Array.from({ length: a.length + 1 }, () => Array(b.length + 1).fill(0));
  for (let i = 0; i <= a.length; i += 1) dp[i][0] = i;
  for (let j = 0; j <= b.length; j += 1) dp[0][j] = j;
  for (let i = 1; i <= a.length; i += 1) {
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost
      );
    }
  }
  return dp[a.length][b.length];
}

function buildTopicTable(inventory, blueprint) {
  const wave1Topics = blueprint.selected_topics || [];
  const wave1Index = new Map(wave1Topics.map((topic, index) => [topic, index + 1]));

  const topics = inventory.topic_summaries.map((summary, index) => {
    const topicId = `topic_${String(index + 1).padStart(2, "0")}`;
    const entries = inventory.entries.filter((entry) => entry.topic === summary.topic);
    return {
      topic_id: topicId,
      canonical_topic_zh: summary.topic,
      aliases: [summary.topic],
      reference_role: "ability_signal_only",
      total_entries: summary.actual_count,
      known_entries: summary.known_count,
      unknown_entries: summary.unknown_count,
      difficulty_breakdown: summary.difficulty_breakdown,
      wave1_selected: wave1Index.has(summary.topic),
      wave1_sequence: wave1Index.get(summary.topic) || null,
      first_formal_index: entries.length ? Math.min(...entries.map((entry) => entry.formal_index)) : null,
      last_formal_index: entries.length ? Math.max(...entries.map((entry) => entry.formal_index)) : null,
      source_note: "Generated from the Background phrase inventory; topic labels are normalized for planning only."
    };
  });

  return {
    generated_at: new Date().toISOString(),
    source_files: [
      path.relative(repoRoot, inventoryPath).replace(/\\/g, "/"),
      path.relative(repoRoot, blueprintPath).replace(/\\/g, "/")
    ],
    reference_role: "ability_signal_only",
    content_generation_note: "Topic normalization table for rebuild planning only. It does not define production curriculum rows.",
    totals: {
      topic_count: topics.length,
      wave1_topic_count: topics.filter((topic) => topic.wave1_selected).length,
      zero_entry_topics: topics.filter((topic) => topic.total_entries === 0).length
    },
    topics
  };
}

function buildPhraseFamilies(inventory, topicTable) {
  const topicByName = new Map(topicTable.topics.map((topic) => [topic.canonical_topic_zh, topic]));
  const byHead = new Map();

  for (const entry of inventory.entries) {
    const head = phraseTokens(entry.phrase)[0] || "unknown";
    if (!byHead.has(head)) byHead.set(head, []);
    byHead.get(head).push(entry);
  }

  const families = [...byHead.entries()]
    .filter(([, entries]) => entries.length > 1)
    .sort((left, right) => right[1].length - left[1].length || left[0].localeCompare(right[0]))
    .map(([head, entries]) => {
      const topics = unique(entries.map((entry) => entry.topic)).map((topicName) => {
        const topic = topicByName.get(topicName);
        return {
          topic_id: topic?.topic_id || null,
          topic: topicName
        };
      });

      return {
        family_id: `family_${slugify(head)}`,
        family_type: "same_head_token",
        head_token: head,
        member_count: entries.length,
        status_counts: countBy(entries, "status"),
        difficulty_counts: countBy(entries, "difficulty"),
        topics,
        authoring_use: "Use as a reference for semantic contrast and distractor planning only; manually check ambiguity before authoring.",
        members: entries
          .sort((left, right) => left.formal_index - right.formal_index)
          .map((entry) => ({
            formal_index: entry.formal_index,
            phrase: entry.phrase,
            phrase_slug: entry.phrase_slug,
            topic_id: topicByName.get(entry.topic)?.topic_id || null,
            topic: entry.topic,
            status: entry.status,
            difficulty: entry.difficulty,
            gloss_zh: entry.gloss_zh,
            candidate_item_id: entry.candidate_item_id
          }))
      };
    });

  return {
    generated_at: new Date().toISOString(),
    source_files: [
      path.relative(repoRoot, inventoryPath).replace(/\\/g, "/")
    ],
    reference_role: "ability_signal_only",
    content_generation_note: "Phrase-family table for near-related collocation planning. Families are not production lessons and are not automatic distractor sets.",
    family_policy: {
      grouping_rule: "Group phrases by first English token when at least two reference phrases share that token.",
      usage_rule: "Treat groups as contrast candidates. A same-family phrase is not automatically a valid distractor.",
      ambiguity_rule: "Before authoring, verify that only the correct phrase can complete the sentence."
    },
    totals: {
      family_count: families.length,
      member_rows_in_families: families.reduce((sum, family) => sum + family.member_count, 0),
      largest_family_size: families.length ? Math.max(...families.map((family) => family.member_count)) : 0
    },
    families
  };
}

function relationForPair(left, right) {
  const leftNorm = normalizePhrase(left.phrase);
  const rightNorm = normalizePhrase(right.phrase);
  if (leftNorm === rightNorm) return { type: "exact_duplicate", risk_level: "blocking" };

  const leftTokens = phraseTokens(left.phrase);
  const rightTokens = phraseTokens(right.phrase);
  if ((leftTokens.length >= 2 && startsWithTokens(leftTokens, rightTokens))
    || (rightTokens.length >= 2 && startsWithTokens(rightTokens, leftTokens))) {
    return { type: "prefix_extension", risk_level: "medium" };
  }

  if (leftTokens[0] && leftTokens[0] === rightTokens[0] && leftTokens.length === rightTokens.length && leftTokens.length >= 2) {
    const diffs = leftTokens.reduce((sum, token, index) => sum + (token === rightTokens[index] ? 0 : 1), 0);
    if (diffs === 1) return { type: "same_head_particle_contrast", risk_level: "low" };
  }

  const distance = levenshtein(leftNorm, rightNorm);
  if (distance <= 2 && leftTokens[0] !== rightTokens[0] && Math.min(leftNorm.length, rightNorm.length) >= 8) {
    return { type: "spelling_close", risk_level: "medium" };
  }

  return null;
}

function buildDuplicateReference(inventory) {
  const byNorm = new Map();
  for (const entry of inventory.entries) {
    const key = normalizePhrase(entry.phrase);
    if (!byNorm.has(key)) byNorm.set(key, []);
    byNorm.get(key).push(entry);
  }

  const exactDuplicateGroups = [...byNorm.entries()]
    .filter(([, entries]) => entries.length > 1)
    .map(([normalized_phrase, entries]) => ({
      normalized_phrase,
      count: entries.length,
      entries: entries.map((entry) => ({
        formal_index: entry.formal_index,
        phrase: entry.phrase,
        topic: entry.topic,
        status: entry.status,
        difficulty: entry.difficulty,
        candidate_item_id: entry.candidate_item_id
      }))
    }));

  const nearPairs = [];
  for (let i = 0; i < inventory.entries.length; i += 1) {
    for (let j = i + 1; j < inventory.entries.length; j += 1) {
      const left = inventory.entries[i];
      const right = inventory.entries[j];
      const relation = relationForPair(left, right);
      if (!relation || relation.type === "exact_duplicate") continue;
      nearPairs.push({
        relation_type: relation.type,
        risk_level: relation.risk_level,
        left: {
          formal_index: left.formal_index,
          phrase: left.phrase,
          topic: left.topic,
          status: left.status,
          difficulty: left.difficulty,
          candidate_item_id: left.candidate_item_id
        },
        right: {
          formal_index: right.formal_index,
          phrase: right.phrase,
          topic: right.topic,
          status: right.status,
          difficulty: right.difficulty,
          candidate_item_id: right.candidate_item_id
        },
        authoring_note: "Reference only. Review manually before treating this as a duplicate, contrast pair, or distractor pair."
      });
    }
  }

  const relationCounts = nearPairs.reduce((acc, pair) => {
    acc[pair.relation_type] = (acc[pair.relation_type] || 0) + 1;
    return acc;
  }, {});

  return {
    generated_at: new Date().toISOString(),
    source_files: [
      path.relative(repoRoot, inventoryPath).replace(/\\/g, "/")
    ],
    reference_role: "ability_signal_only",
    content_generation_note: "Duplicate and near-duplicate reference table for planning. Only exact duplicates are blocking; near pairs require human review.",
    duplicate_policy: {
      exact_duplicate: "Same normalized phrase. Blocking if found in a production target list.",
      prefix_extension: "One phrase starts with another phrase, such as a shorter phrasal verb plus an added particle or object.",
      spelling_close: "Low edit distance between normalized phrases; flags surface-confusable pairs, not necessarily spelling variants.",
      same_head_particle_contrast: "Same head token and one changed particle; useful for contrast but often not a duplicate."
    },
    totals: {
      exact_duplicate_groups: exactDuplicateGroups.length,
      exact_duplicate_rows: exactDuplicateGroups.reduce((sum, group) => sum + group.count, 0),
      near_duplicate_pairs: nearPairs.length,
      relation_counts: relationCounts
    },
    exact_duplicate_groups: exactDuplicateGroups,
    near_duplicate_pairs: nearPairs
  };
}

function main() {
  const inventory = readJSON(inventoryPath);
  const blueprint = readJSON(blueprintPath);

  const topicTable = buildTopicTable(inventory, blueprint);
  const phraseFamilies = buildPhraseFamilies(inventory, topicTable);
  const duplicateReference = buildDuplicateReference(inventory);

  const topicPath = path.join(outDir, "topic_normalization_table.json");
  const familyPath = path.join(outDir, "phrase_family_table.json");
  const duplicatePath = path.join(outDir, "phrase_duplicate_reference.json");

  writeJSON(topicPath, topicTable);
  writeJSON(familyPath, phraseFamilies);
  writeJSON(duplicatePath, duplicateReference);

  console.log(JSON.stringify({
    topic_normalization_table: path.relative(repoRoot, topicPath).replace(/\\/g, "/"),
    phrase_family_table: path.relative(repoRoot, familyPath).replace(/\\/g, "/"),
    phrase_duplicate_reference: path.relative(repoRoot, duplicatePath).replace(/\\/g, "/"),
    topics: topicTable.totals.topic_count,
    families: phraseFamilies.totals.family_count,
    exact_duplicate_groups: duplicateReference.totals.exact_duplicate_groups,
    near_duplicate_pairs: duplicateReference.totals.near_duplicate_pairs
  }, null, 2));
}

main();
