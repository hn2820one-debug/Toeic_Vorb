// Fixture tests for calculateMasteryScore() and masteryLevel() in vocab-scoring.js
// Run: node scripts/test-scoring.js

const fs = require("fs");
const path = require("path");

// Load vocab-scoring.js into a mock browser environment
const src = fs.readFileSync(path.join(__dirname, "../js/vocab-scoring.js"), "utf8");
const window = {};
eval(src); // eslint-disable-line no-eval
const { calculateMasteryScore, masteryLevel } = window.VocabScoring;

let passed = 0;
let failed = 0;

function assert(label, actual, expected) {
  if (actual === expected) {
    console.log(`  PASS  ${label}`);
    passed += 1;
  } else {
    console.error(`  FAIL  ${label} — expected ${expected}, got ${actual}`);
    failed += 1;
  }
}

function assertRange(label, actual, min, max) {
  if (actual >= min && actual <= max) {
    console.log(`  PASS  ${label} (${actual} in [${min}, ${max}])`);
    passed += 1;
  } else {
    console.error(`  FAIL  ${label} — expected [${min}, ${max}], got ${actual}`);
    failed += 1;
  }
}

// --- masteryLevel thresholds ---
console.log("\n[masteryLevel thresholds]");
assert("score 0  → blind",    masteryLevel(0),   "blind");
assert("score 39 → blind",    masteryLevel(39),  "blind");
assert("score 40 → weak",     masteryLevel(40),  "weak");
assert("score 59 → weak",     masteryLevel(59),  "weak");
assert("score 60 → unstable", masteryLevel(60),  "unstable");
assert("score 74 → unstable", masteryLevel(74),  "unstable");
assert("score 75 → stable",   masteryLevel(75),  "stable");
assert("score 84 → stable",   masteryLevel(84),  "stable");
assert("score 85 → mastered", masteryLevel(85),  "mastered");
assert("score 100 → mastered",masteryLevel(100), "mastered");

// --- calculateMasteryScore edge cases ---
console.log("\n[calculateMasteryScore edge cases]");

assert("unseen item → 0",
  calculateMasteryScore({ seen_count: 0 }), 0);

assert("seen but never correct, very slow → low score",
  calculateMasteryScore({
    seen_count: 5, correct_count: 0, wrong_count: 5,
    avg_response_time_seconds: 60, consecutive_fast_correct: 0,
    last_seen: window.VocabScoring.localDate(), last_question_type: "meaning_choice"
  }) < 20, true);

// Perfect item: all correct, fast, recent
const perfectItem = {
  seen_count: 6, correct_count: 6, wrong_count: 0,
  avg_response_time_seconds: 3,
  consecutive_fast_correct: 3,
  last_seen: window.VocabScoring.localDate(),
  last_question_type: "meaning_choice"
};
assertRange("perfect item → mastered range (85–100)",
  calculateMasteryScore(perfectItem), 85, 100);
assert("perfect item masteryLevel → mastered",
  masteryLevel(calculateMasteryScore(perfectItem)), "mastered");

// Stale item: correct but seen 60 days ago → low recency
const staleItem = {
  seen_count: 4, correct_count: 4, wrong_count: 0,
  avg_response_time_seconds: 8,
  consecutive_fast_correct: 3,
  last_seen: window.VocabScoring.addDays(window.VocabScoring.localDate(), -60),
  last_question_type: "word_family"
};
assert("stale item (60d ago) gets 0 recency points",
  calculateMasteryScore(staleItem) < calculateMasteryScore({ ...staleItem, last_seen: window.VocabScoring.localDate() }),
  true);

// Repeated errors penalty (wrong >= 3) halves stability score
const repeatedErrorItem = {
  seen_count: 6, correct_count: 3, wrong_count: 3,
  avg_response_time_seconds: 10,
  consecutive_fast_correct: 3,
  last_seen: window.VocabScoring.localDate(),
  last_question_type: "collocation"
};
const noErrorItem = { ...repeatedErrorItem, wrong_count: 0, correct_count: 6 };
assert("wrong>=3 lowers score vs no errors",
  calculateMasteryScore(repeatedErrorItem) < calculateMasteryScore(noErrorItem), true);

// Speed: avg faster than target → higher speedScore
const fastItem = {
  seen_count: 4, correct_count: 4, wrong_count: 0,
  avg_response_time_seconds: 5,
  consecutive_fast_correct: 2,
  last_seen: window.VocabScoring.localDate(),
  last_question_type: "speed_drill" // target = 8s
};
const slowItem = { ...fastItem, avg_response_time_seconds: 30 };
assert("fast avg time scores higher than slow",
  calculateMasteryScore(fastItem) > calculateMasteryScore(slowItem), true);

// Score is always in [0, 100]
const extremeItems = [
  { seen_count: 1, correct_count: 1, wrong_count: 0, avg_response_time_seconds: 0.1, consecutive_fast_correct: 10, last_seen: window.VocabScoring.localDate(), last_question_type: "meaning_choice" },
  { seen_count: 100, correct_count: 0, wrong_count: 100, avg_response_time_seconds: 999, consecutive_fast_correct: 0, last_seen: "2020-01-01", last_question_type: "part6_context_choice" }
];
extremeItems.forEach((item, i) => {
  const score = calculateMasteryScore(item);
  assertRange(`score always in [0,100] (item ${i + 1})`, score, 0, 100);
});

// --- summary ---
console.log(`\n${passed + failed} tests: ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
