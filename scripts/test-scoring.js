// Fixture tests for vocab-scoring.js
// Run: node scripts/test-scoring.js
//
// Formula reference:
//   accuracyScore  = (correct / seen) * 50                           [0–50]
//   speedScore     = clamp(targetTime / max(avg, 0.5), 0, 1) * 25   [0–25]
//   stabilityScore = clamp(consecutive / 3, 0, 1) * 15 * penalty    [0–15]
//     penalty: wrong>=3 → 0.55 | wrong>=2 → 0.75 | else → 1.0
//   recencyScore   = gap<=3d→10 | <=7d→8 | <=14d→5 | <=30d→2 | >30d→0
//   total          = round(clamp(sum, 0, 100))

const fs = require("fs");
const path = require("path");

const src = fs.readFileSync(path.join(__dirname, "../js/vocab-scoring.js"), "utf8");
const window = {};
eval(src); // eslint-disable-line no-eval
const { calculateMasteryScore, masteryLevel, speedBucket, targetTime, addDays, localDate } = window.VocabScoring;

let passed = 0;
let failed = 0;

function assert(label, actual, expected) {
  if (actual === expected) {
    console.log(`  PASS  ${label}`);
    passed++;
  } else {
    console.error(`  FAIL  ${label} — expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
    failed++;
  }
}

function assertRange(label, actual, min, max) {
  if (actual >= min && actual <= max) {
    console.log(`  PASS  ${label} (${actual} in [${min},${max}])`);
    passed++;
  } else {
    console.error(`  FAIL  ${label} — expected [${min},${max}], got ${actual}`);
    failed++;
  }
}

const today = localDate();

// ── masteryLevel thresholds ──────────────────────────────────────────────────
console.log("\n[masteryLevel — boundary values]");
assert("0  → blind",    masteryLevel(0),   "blind");
assert("39 → blind",    masteryLevel(39),  "blind");
assert("40 → weak",     masteryLevel(40),  "weak");
assert("59 → weak",     masteryLevel(59),  "weak");
assert("60 → unstable", masteryLevel(60),  "unstable");
assert("74 → unstable", masteryLevel(74),  "unstable");
assert("75 → stable",   masteryLevel(75),  "stable");
assert("84 → stable",   masteryLevel(84),  "stable");
assert("85 → mastered", masteryLevel(85),  "mastered");
assert("100→ mastered", masteryLevel(100), "mastered");

// ── calculateMasteryScore — exact fixture values ─────────────────────────────
// All fixtures use last_seen = today (recencyScore = 10) unless noted.
console.log("\n[calculateMasteryScore — exact fixtures]");

// F1: perfect meaning_choice
//   accuracy=50, speed=clamp(10/10)*25=25, stability=clamp(3/3)*15*1=15, recency=10 → 100
assert("F1 perfect meaning_choice → 100",
  calculateMasteryScore({
    seen_count: 4, correct_count: 4, wrong_count: 0,
    avg_response_time_seconds: 10, consecutive_fast_correct: 3,
    last_seen: today, last_question_type: "meaning_choice"
  }), 100);

// F2: consecutive=1 (partial stability)
//   accuracy=50, speed=25, stability=clamp(1/3)*15=5, recency=10 → 90
assert("F2 consecutive=1 → 90",
  calculateMasteryScore({
    seen_count: 4, correct_count: 4, wrong_count: 0,
    avg_response_time_seconds: 10, consecutive_fast_correct: 1,
    last_seen: today, last_question_type: "meaning_choice"
  }), 90);

// F3: consecutive=2
//   stability=clamp(2/3)*15=10 → 95
assert("F3 consecutive=2 → 95",
  calculateMasteryScore({
    seen_count: 4, correct_count: 4, wrong_count: 0,
    avg_response_time_seconds: 10, consecutive_fast_correct: 2,
    last_seen: today, last_question_type: "meaning_choice"
  }), 95);

// F4: wrong=2 stability penalty (0.75×)
//   stability=clamp(1)*15*0.75=11.25, total=50+25+11.25+10=96.25 → 96
assert("F4 wrong=2 penalty → 96",
  calculateMasteryScore({
    seen_count: 6, correct_count: 6, wrong_count: 2,
    avg_response_time_seconds: 8, consecutive_fast_correct: 3,
    last_seen: today, last_question_type: "speed_drill"
  }), 96);

// F5: wrong=3 penalty (0.55×)
//   stability=clamp(1)*15*0.55=8.25, total=50+25+8.25+10=93.25 → 93
assert("F5 wrong=3 penalty → 93",
  calculateMasteryScore({
    seen_count: 6, correct_count: 6, wrong_count: 3,
    avg_response_time_seconds: 8, consecutive_fast_correct: 3,
    last_seen: today, last_question_type: "speed_drill"
  }), 93);

// F6: 50% accuracy, fast, no stability
//   accuracy=25, speed=clamp(10/5=2→1)*25=25, stability=0, recency=10 → 60 "unstable"
assert("F6 50% accuracy, fast, no stability → 60",
  calculateMasteryScore({
    seen_count: 4, correct_count: 2, wrong_count: 0,
    avg_response_time_seconds: 5, consecutive_fast_correct: 0,
    last_seen: today, last_question_type: "meaning_choice"
  }), 60);
assert("F6 masteryLevel → unstable", masteryLevel(60), "unstable");

// F7: zero accuracy, at-target speed
//   accuracy=0, speed=clamp(10/10)*25=25, stability=clamp(0/3)*15*0.55=0, recency=10 → 35 "blind"
assert("F7 zero accuracy → 35",
  calculateMasteryScore({
    seen_count: 3, correct_count: 0, wrong_count: 3,
    avg_response_time_seconds: 10, consecutive_fast_correct: 0,
    last_seen: today, last_question_type: "meaning_choice"
  }), 35);
assert("F7 masteryLevel → blind", masteryLevel(35), "blind");

// F8: unseen item always 0
assert("F8 unseen → 0", calculateMasteryScore({ seen_count: 0 }), 0);

// F9: speed clamping — avg much faster than target still gives max speedScore
//   speed_drill target=8s, avg=1s → clamp(8/1=8, 0,1)=1 → same as avg=8s
assert("F9 avg<<target speed clamped to max",
  calculateMasteryScore({
    seen_count: 4, correct_count: 4, wrong_count: 0,
    avg_response_time_seconds: 1, consecutive_fast_correct: 3,
    last_seen: today, last_question_type: "speed_drill"
  }),
  calculateMasteryScore({
    seen_count: 4, correct_count: 4, wrong_count: 0,
    avg_response_time_seconds: 8, consecutive_fast_correct: 3,
    last_seen: today, last_question_type: "speed_drill"
  }));

// F10: consecutive >3 clamped to same as consecutive=3
assert("F10 consecutive=10 clamped same as consecutive=3",
  calculateMasteryScore({
    seen_count: 4, correct_count: 4, wrong_count: 0,
    avg_response_time_seconds: 10, consecutive_fast_correct: 10,
    last_seen: today, last_question_type: "meaning_choice"
  }),
  calculateMasteryScore({
    seen_count: 4, correct_count: 4, wrong_count: 0,
    avg_response_time_seconds: 10, consecutive_fast_correct: 3,
    last_seen: today, last_question_type: "meaning_choice"
  }));

// F11: score always in [0, 100]
[
  { seen_count: 1, correct_count: 1, wrong_count: 0, avg_response_time_seconds: 0.01, consecutive_fast_correct: 100, last_seen: today, last_question_type: "speed_drill" },
  { seen_count: 999, correct_count: 0, wrong_count: 999, avg_response_time_seconds: 9999, consecutive_fast_correct: 0, last_seen: "2020-01-01", last_question_type: "part6_context_choice" }
].forEach((item, i) => {
  assertRange(`F11 score always [0,100] (${i + 1})`, calculateMasteryScore(item), 0, 100);
});

// ── Recency boundary fixtures ─────────────────────────────────────────────────
// Base item (no recency variation): accuracy=50, speed=25, stability=15 → base=90
// recencyScore: gap=0 or 3 → 10; gap=4 or 7 → 8; gap=8 or 14 → 5; gap=15 or 30 → 2; gap=31+ → 0
console.log("\n[calculateMasteryScore — recency breakpoints]");
const baseItem = (daysAgo) => ({
  seen_count: 4, correct_count: 4, wrong_count: 0,
  avg_response_time_seconds: 10, consecutive_fast_correct: 3,
  last_seen: addDays(today, -daysAgo), last_question_type: "meaning_choice"
});

assert("recency gap=0  → score 100 (+10)", calculateMasteryScore(baseItem(0)),  100);
assert("recency gap=3  → score 100 (+10)", calculateMasteryScore(baseItem(3)),  100);
assert("recency gap=4  → score 98  (+8)",  calculateMasteryScore(baseItem(4)),  98);
assert("recency gap=7  → score 98  (+8)",  calculateMasteryScore(baseItem(7)),  98);
assert("recency gap=8  → score 95  (+5)",  calculateMasteryScore(baseItem(8)),  95);
assert("recency gap=14 → score 95  (+5)",  calculateMasteryScore(baseItem(14)), 95);
assert("recency gap=15 → score 92  (+2)",  calculateMasteryScore(baseItem(15)), 92);
assert("recency gap=30 → score 92  (+2)",  calculateMasteryScore(baseItem(30)), 92);
assert("recency gap=31 → score 90  (+0)",  calculateMasteryScore(baseItem(31)), 90);
assert("recency gap=365→ score 90  (+0)",  calculateMasteryScore(baseItem(365)), 90);

// ── targetTime ────────────────────────────────────────────────────────────────
console.log("\n[targetTime — per question type]");
assert("meaning_choice           → 10s",  targetTime("meaning_choice"),           10);
assert("word_family              → 20s",  targetTime("word_family"),              20);
assert("collocation              → 15s",  targetTime("collocation"),              15);
assert("formal_phrase            → 20s",  targetTime("formal_phrase"),            20);
assert("false_friend             → 8s",   targetTime("false_friend"),             8);
assert("scene_vocabulary         → 15s",  targetTime("scene_vocabulary"),         15);
assert("part5_sentence_completion→ 20s",  targetTime("part5_sentence_completion"),20);
assert("part6_context_choice     → 45s",  targetTime("part6_context_choice"),     45);
assert("speed_drill              → 8s",   targetTime("speed_drill"),              8);
assert("review_question          → 15s",  targetTime("review_question"),          15);
assert("unknown_type             → 20s",  targetTime("unknown_type"),             20);

// ── speedBucket ───────────────────────────────────────────────────────────────
console.log("\n[speedBucket — correct × fast combinations]");
assert("correct + fast  → fast_correct",  speedBucket(true,  5,  "meaning_choice"), "fast_correct");   // 5 ≤ 10
assert("correct + slow  → slow_correct",  speedBucket(true,  11, "meaning_choice"), "slow_correct");   // 11 > 10
assert("wrong   + fast  → fast_wrong",    speedBucket(false, 5,  "meaning_choice"), "fast_wrong");
assert("wrong   + slow  → slow_wrong",    speedBucket(false, 11, "meaning_choice"), "slow_wrong");
assert("correct + at target boundary → fast_correct", speedBucket(true, 20, "word_family"), "fast_correct"); // 20 ≤ 20
assert("correct + 1s over target → slow_correct",     speedBucket(true, 21, "word_family"), "slow_correct"); // 21 > 20
assert("wrong + 0s (fast_wrong)",  speedBucket(false, 0, "speed_drill"),  "fast_wrong");  // 0 ≤ 8
assert("part6: correct + 45s → fast_correct", speedBucket(true, 45, "part6_context_choice"), "fast_correct");
assert("part6: correct + 46s → slow_correct", speedBucket(true, 46, "part6_context_choice"), "slow_correct");

// ── addDays ───────────────────────────────────────────────────────────────────
console.log("\n[addDays — date arithmetic]");
assert("addDays +7 within month",    addDays("2026-03-20", 7),   "2026-03-27");
assert("addDays +7 month boundary",  addDays("2026-03-25", 7),   "2026-04-01");
assert("addDays +5 Feb (non-leap)",  addDays("2026-02-25", 5),   "2026-03-02");
assert("addDays +5 year boundary",   addDays("2026-12-28", 5),   "2027-01-02");
assert("addDays -5 (backwards)",     addDays("2026-05-17", -5),  "2026-05-12");
assert("addDays  0 (no change)",     addDays("2026-05-17", 0),   "2026-05-17");
assert("addDays -1 day boundary",    addDays("2026-03-01", -1),  "2026-02-28");

// ── summary ───────────────────────────────────────────────────────────────────
console.log(`\n${passed + failed} tests: ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
