/**
 * Inserts Mixed Review lessons into curriculum.json.
 *
 * After every 5 core lessons in V2 and V3, a "mixed_review" lesson is inserted.
 * Each mixed_review lesson's question_ids = the review_question_ids from the
 * preceding 5 core lessons (4 review questions × 5 lessons = 20 questions).
 *
 * This creates cross-lesson interference: the student answers review questions
 * from 5 different lessons interleaved together, forcing genuine cross-lesson recall.
 *
 * Result: V2 50 → 60 lessons (+10 mixed), V3 60 → 72 lessons (+12 mixed).
 */

const fs = require("fs");
const path = require("path");

const curriculumPath = path.resolve(__dirname, "../data/vocab/curriculum.json");
const curriculum = JSON.parse(fs.readFileSync(curriculumPath, "utf8"));

function makeMixedLessons(stage, stageName, grammarLinkId, coreLessons) {
  const sorted = [...coreLessons].sort((a, b) => a.lesson_number - b.lesson_number);
  const mixed = [];
  let mixCount = 0;

  for (let i = 0; i + 4 < sorted.length; i += 5) {
    mixCount++;
    const group = sorted.slice(i, i + 5);
    const questionIds = group.flatMap((l) => l.review_question_ids || []);
    const firstId = group[0].lesson_id;
    const lastId = group[4].lesson_id;
    const padded = String(mixCount).padStart(2, "0");

    mixed.push({
      insertAfterId: group[4].lesson_id,
      lesson: {
        lesson_id: `${stage}-MIX-${padded}`,
        stage,
        stage_name: stageName,
        lesson_number: (stage === "V2" ? 10000 : 20000) + mixCount,
        title: `Mixed Review ${mixCount}: ${firstId} – ${lastId}`,
        estimated_minutes: 15,
        lesson_type: "mixed_review",
        target_items: [],
        question_ids: questionIds,
        review_question_ids: [],
        mastery_threshold: 0.8,
        seal_threshold: 0.85,
        grammar_link_id: grammarLinkId,
        status: "not_started"
      }
    });
  }

  return mixed;
}

const v2Core = curriculum.lessons.filter((l) => l.stage === "V2");
const v3Core = curriculum.lessons.filter((l) => l.stage === "V3");

const v2Mixed = makeMixedLessons("V2", "TOEIC Scene Vocabulary", "SCENE_VOCAB_CONTEXT", v2Core);
const v3Mixed = makeMixedLessons("V3", "Collocation", "COLLOCATION_VERB_NOUN", v3Core);

// Build index of current lesson positions
const lessonIndex = {};
curriculum.lessons.forEach((l, i) => { lessonIndex[l.lesson_id] = i; });

// Collect all insertions, sort by current position (descending) to avoid index drift
const insertions = [...v2Mixed, ...v3Mixed]
  .sort((a, b) => lessonIndex[b.insertAfterId] - lessonIndex[a.insertAfterId]);

const newLessons = [...curriculum.lessons];
for (const { insertAfterId, lesson } of insertions) {
  const idx = newLessons.findIndex((l) => l.lesson_id === insertAfterId);
  if (idx === -1) throw new Error(`Lesson ${insertAfterId} not found`);
  newLessons.splice(idx + 1, 0, lesson);
}

// Update stage totals
const v2Stage = curriculum.stages.find((s) => s.stage === "V2");
const v3Stage = curriculum.stages.find((s) => s.stage === "V3");
v2Stage.total_lessons += v2Mixed.length;
v3Stage.total_lessons += v3Mixed.length;

curriculum.lessons = newLessons;

fs.writeFileSync(curriculumPath, JSON.stringify(curriculum, null, 2) + "\n", "utf8");

console.log(`V2 mixed review lessons added: ${v2Mixed.length} (total V2: ${v2Stage.total_lessons})`);
console.log(`V3 mixed review lessons added: ${v3Mixed.length} (total V3: ${v3Stage.total_lessons})`);
console.log(`Grand total lessons: ${newLessons.length}`);
console.log("\nV2 mixed review question counts:");
v2Mixed.forEach(({ lesson }) => console.log(`  ${lesson.lesson_id}: ${lesson.question_ids.length} questions`));
console.log("\nV3 mixed review question counts:");
v3Mixed.forEach(({ lesson }) => console.log(`  ${lesson.lesson_id}: ${lesson.question_ids.length} questions`));
