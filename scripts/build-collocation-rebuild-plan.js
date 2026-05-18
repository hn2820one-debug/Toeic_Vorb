const fs = require("fs");
const path = require("path");

const repoRoot = path.join(__dirname, "..");
const sourcePath = path.join(repoRoot, "Background", "多益搭配詞全面測試", "Phrase_411_by_topic.txt");
const outDir = path.join(repoRoot, "drafts", "collocation-rebuild");

const WAVE1_UNKNOWN_TARGET = 96;
const TOPIC_PRIORITY = [
  "辦公室",
  "文書作業",
  "商務會議",
  "業務協調",
  "人事與組織",
  "人才招募",
  "財務會計",
  "企業經營"
];

function readSource(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function writeJSON(filePath, value) {
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function writeText(filePath, value) {
  fs.writeFileSync(filePath, value, "utf8");
}

function slugify(text) {
  return String(text || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    || "item";
}

function difficultyRank(code) {
  if (code === "A") return 1;
  if (code === "B") return 2;
  if (code === "C") return 3;
  return 9;
}

function knownStatus(raw) {
  if (raw === "會") return "known";
  if (raw === "不會") return "unknown";
  return "unknown";
}

function parseTopicHeader(line) {
  const match = line.match(/^【(.+?)】（(\d+)題）$/);
  if (!match) return null;
  return {
    topic: match[1].trim(),
    expectedCount: Number.parseInt(match[2], 10)
  };
}

function parseEntry(line, topic, orderInTopic) {
  const parts = line.split("｜").map((part) => part.trim());
  if (parts.length !== 6) return null;

  const [formalIndex, originalIndex, phrase, knownRaw, glossZh, difficulty] = parts;
  return {
    formal_index: Number.parseInt(formalIndex, 10),
    original_index: Number.parseInt(originalIndex, 10),
    topic,
    order_in_topic: orderInTopic,
    phrase,
    phrase_slug: slugify(phrase),
    known_raw: knownRaw,
    status: knownStatus(knownRaw),
    gloss_zh: glossZh,
    difficulty,
    difficulty_rank: difficultyRank(difficulty),
    candidate_item_id: `item_coll_${slugify(phrase)}`
  };
}

function parsePhraseFile(content) {
  const lines = content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const topicMap = new Map();
  const entries = [];
  let currentTopic = null;
  let orderInTopic = 0;

  for (const line of lines) {
    if (line.startsWith("《") || line.startsWith("欄位：")) continue;

    const topicHeader = parseTopicHeader(line);
    if (topicHeader) {
      currentTopic = topicHeader.topic;
      orderInTopic = 0;
      if (!topicMap.has(currentTopic)) {
        topicMap.set(currentTopic, {
          topic: currentTopic,
          expected_count: topicHeader.expectedCount,
          entries: []
        });
      }
      continue;
    }

    if (!currentTopic || !/^\d+｜\d+｜/.test(line)) continue;

    orderInTopic += 1;
    const entry = parseEntry(line, currentTopic, orderInTopic);
    if (!entry) continue;

    topicMap.get(currentTopic).entries.push(entry);
    entries.push(entry);
  }

  return { topicMap, entries };
}

function buildTopicSummaries(topicMap) {
  return [...topicMap.values()].map((group) => {
    const known = group.entries.filter((entry) => entry.status === "known").length;
    const unknown = group.entries.filter((entry) => entry.status === "unknown").length;
    const difficulty = group.entries.reduce((acc, entry) => {
      acc[entry.difficulty] = (acc[entry.difficulty] || 0) + 1;
      return acc;
    }, { A: 0, B: 0, C: 0 });

    return {
      topic: group.topic,
      expected_count: group.expected_count,
      actual_count: group.entries.length,
      known_count: known,
      unknown_count: unknown,
      difficulty_breakdown: difficulty
    };
  });
}

function markDuplicatePhrases(entries) {
  const counts = new Map();
  for (const entry of entries) {
    counts.set(entry.phrase_slug, (counts.get(entry.phrase_slug) || 0) + 1);
  }

  return entries.map((entry) => ({
    ...entry,
    duplicate_phrase_count: counts.get(entry.phrase_slug) || 1,
    is_duplicate_phrase: (counts.get(entry.phrase_slug) || 1) > 1
  }));
}

function selectWaveTopics(topicSummaries) {
  const topicIndex = new Map(topicSummaries.map((entry) => [entry.topic, entry]));
  const selected = [];
  let totalUnknown = 0;

  for (const topic of TOPIC_PRIORITY) {
    const summary = topicIndex.get(topic);
    if (!summary || summary.unknown_count === 0) continue;
    selected.push(topic);
    totalUnknown += summary.unknown_count;
    if (totalUnknown >= WAVE1_UNKNOWN_TARGET) break;
  }

  return { selectedTopics: selected, selectedUnknownCount: totalUnknown };
}

function splitIntoLessonChunks(items, maxSize = 8) {
  if (items.length === 0) return [];
  const chunkCount = Math.ceil(items.length / maxSize);
  const baseSize = Math.floor(items.length / chunkCount);
  const remainder = items.length % chunkCount;
  const sizes = Array.from({ length: chunkCount }, (_, index) => baseSize + (index < remainder ? 1 : 0));

  const chunks = [];
  let cursor = 0;
  for (const size of sizes) {
    chunks.push(items.slice(cursor, cursor + size));
    cursor += size;
  }
  return chunks;
}

function buildLessonBlueprint(entries, selectedTopics) {
  const byTopic = new Map();
  for (const topic of selectedTopics) byTopic.set(topic, []);

  for (const entry of entries) {
    if (entry.status !== "unknown") continue;
    if (!byTopic.has(entry.topic)) continue;
    byTopic.get(entry.topic).push(entry);
  }

  let lessonNumber = 1;
  const lessons = [];

  for (const topic of selectedTopics) {
    const topicEntries = byTopic.get(topic)
      .sort((left, right) => left.difficulty_rank - right.difficulty_rank || left.formal_index - right.formal_index);

    const chunks = splitIntoLessonChunks(topicEntries, 8);
    chunks.forEach((chunk, index) => {
      const difficulty = chunk.reduce((acc, entry) => {
        acc[entry.difficulty] = (acc[entry.difficulty] || 0) + 1;
        return acc;
      }, { A: 0, B: 0, C: 0 });

      lessons.push({
        lesson_id: `draft_coll_w1_${String(lessonNumber).padStart(2, "0")}`,
        wave: 1,
        sequence: lessonNumber,
        topic,
        topic_lesson_index: index + 1,
        item_count: chunk.length,
        difficulty_breakdown: difficulty,
        build_policy: {
          direct_definition_limit_per_phrase: 1,
          follow_up_types: [
            "collocation",
            "part5_sentence_completion",
            "part6_context_choice"
          ],
          review_strategy: "known phrases stay out of core lessons; unknown phrases use staircase progression"
        },
        items: chunk.map((entry) => ({
          formal_index: entry.formal_index,
          original_index: entry.original_index,
          phrase: entry.phrase,
          phrase_slug: entry.phrase_slug,
          gloss_zh: entry.gloss_zh,
          difficulty: entry.difficulty,
          candidate_item_id: entry.candidate_item_id
        }))
      });
      lessonNumber += 1;
    });
  }

  return lessons;
}

function buildSummaryMarkdown({ topicSummaries, knownEntries, unknownEntries, waveTopics, waveLessons }) {
  const lines = [];
  lines.push("# Collocation Rebuild Plan");
  lines.push("");
  lines.push(`能力參考來源: Background/多益搭配詞全面測試/Phrase_411_by_topic.txt`);
  lines.push(`生成時間: ${new Date().toISOString()}`);
  lines.push("");
  lines.push("說明: 這份 Background 檔只用來估計已知/未知與 topic 優先級；正式教材、句子與題目內容仍需另外生成。");
  lines.push("");
  lines.push("## Inventory Summary");
  lines.push("");
  lines.push(`- 全部搭配詞: ${knownEntries.length + unknownEntries.length}`);
  lines.push(`- 已知（跳過主課）: ${knownEntries.length}`);
  lines.push(`- 未知（待重建）: ${unknownEntries.length}`);
  lines.push(`- Wave 1 topic 數: ${waveTopics.length}`);
  lines.push(`- Wave 1 lesson 數: ${waveLessons.length}`);
  lines.push(`- Wave 1 phrase 數: ${waveLessons.reduce((sum, lesson) => sum + lesson.item_count, 0)}`);
  lines.push("");
  lines.push("## Topic Summary");
  lines.push("");
  lines.push("| Topic | Total | Known | Unknown | A | B | C |");
  lines.push("|---|---:|---:|---:|---:|---:|---:|");
  for (const summary of topicSummaries) {
    lines.push(`| ${summary.topic} | ${summary.actual_count} | ${summary.known_count} | ${summary.unknown_count} | ${summary.difficulty_breakdown.A} | ${summary.difficulty_breakdown.B} | ${summary.difficulty_breakdown.C} |`);
  }
  lines.push("");
  lines.push("## Wave 1 Topics");
  lines.push("");
  waveTopics.forEach((topic, index) => {
    lines.push(`${index + 1}. ${topic}`);
  });
  lines.push("");
  lines.push("## Wave 1 Lessons");
  lines.push("");
  for (const lesson of waveLessons) {
    lines.push(`### ${lesson.lesson_id}｜${lesson.topic}｜${lesson.item_count} items`);
    lines.push("");
    lesson.items.forEach((item) => {
      lines.push(`- ${item.phrase}｜${item.gloss_zh}｜${item.difficulty}`);
    });
    lines.push("");
  }
  return `${lines.join("\n")}\n`;
}

function main() {
  const source = readSource(sourcePath);
  const parsed = parsePhraseFile(source);
  const entries = markDuplicatePhrases(parsed.entries);
  const topicSummaries = buildTopicSummaries(parsed.topicMap)
    .sort((left, right) => left.topic.localeCompare(right.topic, "zh-Hant"));

  const knownEntries = entries.filter((entry) => entry.status === "known");
  const unknownEntries = entries.filter((entry) => entry.status === "unknown");
  const { selectedTopics, selectedUnknownCount } = selectWaveTopics(topicSummaries);
  const waveLessons = buildLessonBlueprint(entries, selectedTopics);

  const referenceFile = path.relative(repoRoot, sourcePath).replace(/\\/g, "/");

  const inventory = {
    reference_file: referenceFile,
    generated_at: new Date().toISOString(),
    reference_role: "ability_signal_only",
    content_generation_note: "The Background phrase list is a placement and prioritization reference only. Formal lesson content and question rows must be generated separately.",
    selection_policy: {
      skip_rule: "phrase-level skip",
      reference_status_meaning: "rows marked 會/不會 are treated as current ability signals, not as final lesson content",
      known_status_meaning: "rows marked 會 stay out of the first-wave core lesson pool by default",
      unknown_status_meaning: "rows marked 不會 enter the rebuild priority pool for later content generation",
      wave1_unknown_target: WAVE1_UNKNOWN_TARGET,
      wave1_topic_priority: TOPIC_PRIORITY
    },
    totals: {
      all_entries: entries.length,
      known_entries: knownEntries.length,
      unknown_entries: unknownEntries.length,
      duplicate_phrase_rows: entries.filter((entry) => entry.is_duplicate_phrase).length
    },
    topic_summaries: topicSummaries,
    entries
  };

  const blueprint = {
    reference_file: referenceFile,
    generated_at: new Date().toISOString(),
    reference_role: "ability_signal_only",
    content_generation_note: "This blueprint defines which phrase targets should be taught first. It does not contain the final generated lessons, sentences, or question rows.",
    wave: 1,
    selected_topics: selectedTopics,
    selected_unknown_count: selectedUnknownCount,
    lessons: waveLessons
  };

  ensureDir(outDir);
  writeJSON(path.join(outDir, "phrase_411_inventory.json"), inventory);
  writeJSON(path.join(outDir, "wave1_lesson_blueprint.json"), blueprint);
  writeText(
    path.join(outDir, "README.md"),
    buildSummaryMarkdown({ topicSummaries, knownEntries, unknownEntries, waveTopics: selectedTopics, waveLessons })
  );

  const summary = {
    inventory_file: path.relative(repoRoot, path.join(outDir, "phrase_411_inventory.json")).replace(/\\/g, "/"),
    blueprint_file: path.relative(repoRoot, path.join(outDir, "wave1_lesson_blueprint.json")).replace(/\\/g, "/"),
    readme_file: path.relative(repoRoot, path.join(outDir, "README.md")).replace(/\\/g, "/"),
    total_entries: entries.length,
    known_entries: knownEntries.length,
    unknown_entries: unknownEntries.length,
    selected_topics: selectedTopics,
    wave1_lesson_count: waveLessons.length,
    wave1_phrase_count: waveLessons.reduce((sum, lesson) => sum + lesson.item_count, 0)
  };

  console.log(JSON.stringify(summary, null, 2));
}

main();