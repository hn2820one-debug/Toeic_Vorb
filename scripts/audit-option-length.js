// Audit two specific quality problems:
// 1. Option length bias — correct answer is systematically the longest option
// 2. Definition embedded in question stem — definition given as a parenthetical clue

const fs = require("fs");
const path = require("path");

const vocabDir = path.resolve(__dirname, "..", "data", "vocab");
const curriculum = JSON.parse(fs.readFileSync(path.join(vocabDir, "curriculum.json"), "utf8"));

const questionFiles = Array.isArray(curriculum.question_files) && curriculum.question_files.length
  ? curriculum.question_files
  : fs.readdirSync(vocabDir).filter((f) => /^questions_.*\.json$/.test(f)).sort();

const questions = questionFiles.flatMap((fileName) =>
  JSON.parse(fs.readFileSync(path.join(vocabDir, fileName), "utf8"))
    .map((q) => ({ ...q, source_file: fileName }))
);

// ── helpers ──────────────────────────────────────────────────────────────────

function optionLen(text) {
  return String(text || "").trim().length;
}

function optionWords(text) {
  return String(text || "").trim().split(/\s+/).filter(Boolean).length;
}

// Returns rank of correct answer by char length (1 = longest, 4 = shortest)
// Ties share the higher rank (i.e. two options of equal length both get rank 1)
function correctAnswerRank(q) {
  const options = q.options || {};
  const correct = q.correct_answer;
  if (!correct || !options[correct]) return null;
  const correctLen = optionLen(options[correct]);
  const lengths = Object.values(options).map(optionLen);
  const rank = lengths.filter((l) => l > correctLen).length + 1;
  return rank;
}

// How much longer (chars) is the correct answer vs the second-longest option?
function correctAnswerEdge(q) {
  const options = q.options || {};
  const correct = q.correct_answer;
  if (!correct || !options[correct]) return null;
  const correctLen = optionLen(options[correct]);
  const others = Object.entries(options)
    .filter(([k]) => k !== correct)
    .map(([, v]) => optionLen(v));
  if (!others.length) return 0;
  return correctLen - Math.max(...others);
}

// Detect definition-in-stem pattern:
// e.g. "______, the desk-and-computer setup for work,"
//      "______, which means X,"
//      "______, 表示X,"
const DEFINITION_IN_STEM_PATTERNS = [
  /,\s+the [a-z][^,]{5,50},/i,           // , the [definition phrase],
  /,\s+which (means?|refers? to)[^,]{3,}/i,
  /,\s+[a-z][^,]{5,40},\s*(V\d|for|in|at|on|by)/i,
  /[㐀-鿿]{2,}/,                  // any CJK in question_text
];

function hasDefinitionInStem(q) {
  const text = String(q.question_text || "");
  return DEFINITION_IN_STEM_PATTERNS.some((re) => re.test(text));
}

// Normalise stem for dedup check
function normStem(text) {
  return String(text || "")
    .replace(/\([^)]*-\d{2}\)\s*$/g, "")   // trailing IDs like (V2-A-71-01)
    .replace(/\bV\d-[A-Z]-\d+-\d+\b/g, "")
    .replace(/_{2,}/g, "____")
    .replace(/\s+/g, " ")
    .trim();
}

// ── compute per-question metrics ──────────────────────────────────────────────

const rows = questions.map((q) => ({
  question_id: q.question_id,
  source_file: q.source_file,
  stage: q.stage,
  lesson_id: q.lesson_id,
  type: q.type,
  correct_answer: q.correct_answer,
  correct_len: optionLen((q.options || {})[q.correct_answer]),
  correct_words: optionWords((q.options || {})[q.correct_answer]),
  rank: correctAnswerRank(q),         // 1 = longest
  edge: correctAnswerEdge(q),        // chars longer than 2nd-longest
  def_in_stem: hasDefinitionInStem(q),
  stem_norm: normStem(q.question_text),
}));

// ── REPORT SECTION 1: Option length bias ─────────────────────────────────────

function lengthBiasReport() {
  const eligible = rows.filter((r) => r.rank !== null);
  const total = eligible.length;
  const rank1 = eligible.filter((r) => r.rank === 1).length;
  const rank1Plus = eligible.filter((r) => r.rank === 1 && r.edge > 0).length; // strictly longest

  console.log("\n══════════════════════════════════════════════════════");
  console.log(" SECTION 1: Option Length Bias");
  console.log("══════════════════════════════════════════════════════");
  console.log(`Total questions with options: ${total}`);
  console.log(`Correct answer is LONGEST (rank 1):   ${rank1}  (${pct(rank1 / total)})`);
  console.log(`  …of which strictly longer (edge>0): ${rank1Plus}  (${pct(rank1Plus / total)})`);
  console.log(`Expected by chance (4 options):        ~25%`);

  // By stage
  console.log("\n── By stage ──");
  ["V0", "V1", "V2", "V3"].forEach((stage) => {
    const s = eligible.filter((r) => r.stage === stage);
    if (!s.length) return;
    const n = s.filter((r) => r.rank === 1).length;
    console.log(`  ${stage}: ${n}/${s.length} = ${pct(n / s.length)}`);
  });

  // By question type
  console.log("\n── By question type (top 8) ──");
  const byType = {};
  eligible.forEach((r) => {
    if (!byType[r.type]) byType[r.type] = { total: 0, rank1: 0 };
    byType[r.type].total++;
    if (r.rank === 1) byType[r.type].rank1++;
  });
  Object.entries(byType)
    .sort((a, b) => (b[1].rank1 / b[1].total) - (a[1].rank1 / a[1].total))
    .slice(0, 10)
    .forEach(([type, { total: t, rank1: n }]) => {
      const bar = "█".repeat(Math.round((n / t) * 20));
      console.log(`  ${type.padEnd(30)} ${pct(n / t).padStart(6)}  ${bar}  (${n}/${t})`);
    });

  // By source file
  console.log("\n── By source file ──");
  const byFile = {};
  eligible.forEach((r) => {
    if (!byFile[r.source_file]) byFile[r.source_file] = { total: 0, rank1: 0 };
    byFile[r.source_file].total++;
    if (r.rank === 1) byFile[r.source_file].rank1++;
  });
  Object.entries(byFile)
    .sort((a, b) => (b[1].rank1 / b[1].total) - (a[1].rank1 / a[1].total))
    .forEach(([file, { total: t, rank1: n }]) => {
      const bar = "█".repeat(Math.round((n / t) * 20));
      const flag = (n / t) > 0.45 ? " ⚠" : "";
      console.log(`  ${file.padEnd(28)} ${pct(n / t).padStart(6)}  ${bar}${flag}  (${n}/${t})`);
    });

  // Edge distribution: how many chars longer is correct vs 2nd-longest
  console.log("\n── Edge distribution (correct - 2nd longest, chars) ──");
  const edgeBuckets = { "≤0 (shorter/equal)": 0, "1–5": 0, "6–15": 0, "16–30": 0, ">30": 0 };
  eligible.forEach((r) => {
    const e = r.edge ?? 0;
    if (e <= 0) edgeBuckets["≤0 (shorter/equal)"]++;
    else if (e <= 5) edgeBuckets["1–5"]++;
    else if (e <= 15) edgeBuckets["6–15"]++;
    else if (e <= 30) edgeBuckets["16–30"]++;
    else edgeBuckets[">30"]++;
  });
  Object.entries(edgeBuckets).forEach(([label, count]) => {
    console.log(`  ${label.padEnd(22)} ${count.toString().padStart(5)}  (${pct(count / total)})`);
  });

  // Sample worst offenders (edge > 30)
  const worst = eligible.filter((r) => (r.edge ?? 0) > 30).slice(0, 8);
  if (worst.length) {
    console.log("\n── Sample: correct answer >30 chars longer than 2nd-longest ──");
    worst.forEach((r) => {
      console.log(`  ${r.question_id}  [${r.type}]  edge=${r.edge}  correct_len=${r.correct_len}`);
    });
  }
}

// ── REPORT SECTION 2: Definition in stem ─────────────────────────────────────

function definitionInStemReport() {
  const withDef = rows.filter((r) => r.def_in_stem);
  const total = rows.length;

  console.log("\n══════════════════════════════════════════════════════");
  console.log(" SECTION 2: Definition Embedded in Question Stem");
  console.log("══════════════════════════════════════════════════════");
  console.log(`Questions with definition/clue in stem: ${withDef.length}/${total} (${pct(withDef.length / total)})`);

  // By stage
  console.log("\n── By stage ──");
  ["V0", "V1", "V2", "V3"].forEach((stage) => {
    const s = rows.filter((r) => r.stage === stage);
    const n = s.filter((r) => r.def_in_stem).length;
    if (n === 0) return;
    console.log(`  ${stage}: ${n}/${s.length} = ${pct(n / s.length)}`);
  });

  // By question type
  console.log("\n── By question type ──");
  const byType = {};
  rows.forEach((r) => {
    if (!byType[r.type]) byType[r.type] = { total: 0, hit: 0 };
    byType[r.type].total++;
    if (r.def_in_stem) byType[r.type].hit++;
  });
  Object.entries(byType)
    .filter(([, { hit }]) => hit > 0)
    .sort((a, b) => (b[1].hit / b[1].total) - (a[1].hit / a[1].total))
    .forEach(([type, { total: t, hit: n }]) => {
      console.log(`  ${type.padEnd(30)} ${pct(n / t).padStart(6)}  (${n}/${t})`);
    });

  // Samples
  console.log("\n── Sample stems with embedded definitions (first 10) ──");
  withDef.slice(0, 10).forEach((r) => {
    const q = questions.find((q) => q.question_id === r.question_id);
    const stem = String(q?.question_text || "").slice(0, 110);
    console.log(`  [${r.type}] ${r.question_id}`);
    console.log(`    "${stem}"`);
  });
}

// ── REPORT SECTION 3: Stem template repetition ───────────────────────────────

function stemRepeatReport() {
  console.log("\n══════════════════════════════════════════════════════");
  console.log(" SECTION 3: Repeated Stem Templates");
  console.log("══════════════════════════════════════════════════════");

  ["V2", "V3", "V1", "V0"].forEach((stage) => {
    const stageRows = rows.filter((r) => r.stage === stage);
    const stemCount = {};
    stageRows.forEach((r) => {
      stemCount[r.stem_norm] = (stemCount[r.stem_norm] || 0) + 1;
    });
    const sorted = Object.entries(stemCount).sort((a, b) => b[1] - a[1]);
    const unique = sorted.length;
    const repeated = sorted.filter(([, c]) => c > 1);
    const top10 = sorted.slice(0, 10);

    console.log(`\n── ${stage} (${stageRows.length} questions, ${unique} unique stems) ──`);
    console.log(`   Stems appearing >1 time: ${repeated.length}`);
    console.log(`   Stems appearing >10 times: ${sorted.filter(([, c]) => c > 10).length}`);
    console.log(`   Top 5 most-repeated stems:`);
    top10.slice(0, 5).forEach(([stem, count]) => {
      console.log(`     ×${count}  "${stem.slice(0, 90)}"`);
    });
  });
}

// ── REPORT SECTION 4: Lesson-level breakdown (V2/V3 only) ───────────────────

function lessonLevelReport() {
  console.log("\n══════════════════════════════════════════════════════");
  console.log(" SECTION 4: Items per Lesson (V2/V3 — expect 4 items × 6 reps)");
  console.log("══════════════════════════════════════════════════════");

  const lessons = curriculum.lessons || [];
  const questionById = new Map(questions.map((q) => [q.question_id, q]));

  const v23lessons = lessons.filter((l) => ["V2", "V3"].includes(l.stage));
  const counts = { exactly4: 0, lessThan4: 0, moreThan4: 0 };
  const narrow = []; // lessons where max_reps_per_item >= 6

  v23lessons.forEach((lesson) => {
    const ids = [...(lesson.question_ids || []), ...(lesson.review_question_ids || [])];
    const qs = ids.map((id) => questionById.get(id)).filter(Boolean);
    const itemCounts = {};
    qs.forEach((q) => {
      const id = q.target_item_id || "(none)";
      itemCounts[id] = (itemCounts[id] || 0) + 1;
    });
    const items = Object.keys(itemCounts).filter((k) => k !== "(none)");
    const reps = Object.values(itemCounts).filter((_, i) => Object.keys(itemCounts)[i] !== "(none)");
    const maxRep = reps.length ? Math.max(...reps) : 0;

    if (items.length < 4) counts.lessThan4++;
    else if (items.length === 4) counts.exactly4++;
    else counts.moreThan4++;

    if (maxRep >= 6) narrow.push({ lesson_id: lesson.lesson_id, stage: lesson.stage, items: items.length, maxRep });
  });

  console.log(`\n  Lessons with exactly 4 target items: ${counts.exactly4}`);
  console.log(`  Lessons with < 4 target items:       ${counts.lessThan4}`);
  console.log(`  Lessons with > 4 target items:       ${counts.moreThan4}`);
  console.log(`\n  Lessons where any item repeated ≥6×: ${narrow.length}/${v23lessons.length}`);
  if (narrow.length) {
    console.log("  Sample:");
    narrow.slice(0, 5).forEach((r) => {
      console.log(`    ${r.lesson_id}  items=${r.items}  max_reps=${r.maxRep}`);
    });
  }
}

// ── REPORT SECTION 5: V3 distractor verb concentration ───────────────────────

function distractorReport() {
  console.log("\n══════════════════════════════════════════════════════");
  console.log(" SECTION 5: V3 Distractor First-Word Concentration");
  console.log("══════════════════════════════════════════════════════");

  const v3 = questions.filter((q) => q.stage === "V3");
  const wordCount = {};
  let totalDistractors = 0;

  v3.forEach((q) => {
    Object.entries(q.options || {}).forEach(([letter, text]) => {
      if (letter === q.correct_answer) return;
      const first = String(text || "").split(/\s+/)[0].toLowerCase().replace(/[^a-z]/g, "");
      if (!first) return;
      wordCount[first] = (wordCount[first] || 0) + 1;
      totalDistractors++;
    });
  });

  const sorted = Object.entries(wordCount).sort((a, b) => b[1] - a[1]);
  console.log(`\n  Total distractor options in V3: ${totalDistractors}`);
  console.log(`  Unique first words:             ${sorted.length}`);
  console.log(`\n  Top 15 distractor first words:`);
  sorted.slice(0, 15).forEach(([word, count]) => {
    const share = pct(count / totalDistractors);
    const bar = "█".repeat(Math.round((count / totalDistractors) * 100));
    const flag = count / totalDistractors > 0.08 ? " ⚠" : "";
    console.log(`  ${word.padEnd(18)} ${share.padStart(6)}  ${bar}${flag}  (${count})`);
  });
}

// ── utilities ─────────────────────────────────────────────────────────────────

function pct(ratio) {
  return `${Math.round(ratio * 1000) / 10}%`;
}

// ── main ──────────────────────────────────────────────────────────────────────

console.log("═══════════════════════════════════════════════════════════════");
console.log(" TOEIC Vocab Tracker — Content Quality Audit (Option Length)");
console.log(`  Questions loaded: ${questions.length}  Files: ${questionFiles.length}`);
console.log("═══════════════════════════════════════════════════════════════");

lengthBiasReport();
definitionInStemReport();
stemRepeatReport();
lessonLevelReport();
distractorReport();

console.log("\n══════════════════════════════════════════════════════");
console.log(" Done.");
console.log("══════════════════════════════════════════════════════\n");
