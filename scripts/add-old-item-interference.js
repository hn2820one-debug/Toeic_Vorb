/**
 * Adds old-item interference to V2 and V3 core lessons.
 *
 * For each core lesson starting from the 4th (index ≥ 3), 2 review_questions from
 * prior lessons are appended to the lesson's question_ids. These questions already
 * exist in the question bank; they are simply referenced an extra time so the
 * student encounters a prior-lesson item during the current lesson session.
 *
 * Interference selection:
 *   - slot 0: review_question_ids[0] from the lesson 3 positions back
 *   - slot 1: review_question_ids[2] from the lesson 6 positions back
 *             (falls back to 3-back if < 6 prior lessons available, picks [1])
 *
 * The two slots deliberately pick different target words (index 0 vs 2) so
 * neither interference question tests the same item as the other.
 *
 * Effect on audit:
 *   - Each modified lesson will have outside_items ≥ 2 → passes oldItemInterference check
 *   - No question files are changed; only curriculum.json is updated
 */

const fs = require("fs");
const path = require("path");

const curriculumPath = path.resolve(__dirname, "../data/vocab/curriculum.json");
const curriculum = JSON.parse(fs.readFileSync(curriculumPath, "utf8"));

function processStage(stage) {
  const coreLessons = curriculum.lessons
    .filter((l) => l.stage === stage && l.lesson_type !== "mixed_review")
    .sort((a, b) => a.lesson_number - b.lesson_number);

  let modified = 0;

  coreLessons.forEach((lesson, i) => {
    if (i < 3) return;

    const backA = coreLessons[i - 3];
    const backB = i >= 6 ? coreLessons[i - 6] : coreLessons[i - 3];
    const qA = backA.review_question_ids?.[0];
    const qB = backB.review_question_ids?.[2] ?? backB.review_question_ids?.[1];

    if (!qA || !qB) return;

    const existing = new Set(lesson.question_ids || []);
    const toAdd = [];
    if (!existing.has(qA)) toAdd.push(qA);
    if (!existing.has(qB) && qB !== qA) toAdd.push(qB);
    if (!toAdd.length) return;

    lesson.question_ids = [...(lesson.question_ids || []), ...toAdd];
    modified++;
  });

  return modified;
}

const v2Modified = processStage("V2");
const v3Modified = processStage("V3");

fs.writeFileSync(curriculumPath, JSON.stringify(curriculum, null, 2) + "\n", "utf8");

console.log(`V2 core lessons updated with interference: ${v2Modified}`);
console.log(`V3 core lessons updated with interference: ${v3Modified}`);

// Quick verification
const v2Core = curriculum.lessons.filter((l) => l.stage === "V2" && l.lesson_type !== "mixed_review");
const v3Core = curriculum.lessons.filter((l) => l.stage === "V3" && l.lesson_type !== "mixed_review");
const v2Sample = v2Core.find((l) => l.question_ids?.length > 20);
if (v2Sample) console.log(`\nSample: ${v2Sample.lesson_id} question_ids length: ${v2Sample.question_ids.length} (was 20)`);
