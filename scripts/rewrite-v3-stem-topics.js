/**
 * Fix V3 stem repetition: 4 lessons (V3-A-121 to V3-A-124) share the same
 * "office task" topic phrase, causing each of the 5 stem templates to appear
 * 20 times across the dataset. Assign a unique topic to each lesson so each
 * template appears at most 5 times (within a single lesson by design).
 */

const fs = require("fs");
const path = require("path");

const vocabDir = path.resolve(__dirname, "../data/vocab");

// Only lessons 122–124 need a new topic; 121 keeps its current topic.
const TOPIC_REPLACEMENTS = {
  "V3-A-122": "document review",
  "V3-A-123": "staff coordination",
  "V3-A-124": "client briefing",
};

// The 5 regex patterns that locate the topic inside each template type.
// Each pattern has a capture group around the topic phrase (group 1).
const PATTERNS = [
  // Email: "...the {topic} assignment..."
  { re: /^(Email: Thank you for helping with the )(.+?)( assignment)/, group: [1, 3] },
  // Memo:  "...the {topic} update,..."
  { re: /^(Memo: For the )(.+?)( update,)/, group: [1, 3] },
  // Bare:  "The {topic} coordinator..."
  { re: /^(The )(.+?)( coordinator is expected)/, group: [1, 3] },
  // Announcement: "The {topic} schedule..."
  { re: /^(Announcement: The )(.+?)( schedule is tighter)/, group: [1, 3] },
  // Notice: "The {topic} plan..."
  { re: /^(Notice: The )(.+?)( plan has been revised)/, group: [1, 3] },
];

function rewriteStem(text, newTopic) {
  for (const { re, group } of PATTERNS) {
    const m = text.match(re);
    if (m) {
      return text.replace(re, `${m[1]}${newTopic}${m[3]}`);
    }
  }
  return text; // no pattern matched — leave unchanged
}

const V3_FILES = ["questions_v3a.json"];

let totalRewritten = 0;

V3_FILES.forEach((fileName) => {
  const filePath = path.join(vocabDir, fileName);
  const questions = JSON.parse(fs.readFileSync(filePath, "utf8"));
  let count = 0;

  const updated = questions.map((q) => {
    const newTopic = TOPIC_REPLACEMENTS[q.lesson_id];
    if (!newTopic) return q;
    const newText = rewriteStem(q.question_text, newTopic);
    if (newText === q.question_text) return q;
    count++;
    return { ...q, question_text: newText };
  });

  fs.writeFileSync(filePath, JSON.stringify(updated, null, 2) + "\n", "utf8");
  console.log(`  ${fileName}: ${count} questions rewritten`);
  totalRewritten += count;
});

console.log(`Total: ${totalRewritten} questions rewritten`);
console.log("Remember to bump SEED_VERSION after verifying.");
