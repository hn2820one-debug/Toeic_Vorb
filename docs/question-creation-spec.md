# Question Creation Specification
## TOEIC Vocabulary Tracker — v1.0 (2026-05-17)

This document defines all rules for creating questions for this question bank.
**Every rule here exists because a violation has already caused a real problem.**
When asking an AI to generate questions, paste the relevant sections as instructions.

Current production scope is V0-V3 only. V4 remains draft-only under `drafts/v4/` and must not be added to `data/vocab/` or the production manifest until a future V4 activation task explicitly updates the spec, curriculum, seed version, data, and tests. For current counts and priorities, use root `TO_AI.md` as the source of truth.

The default production audit is manifest-driven: it loads only files listed in `data/vocab/curriculum.json -> question_files`. Files under `drafts/v4/` are skipped by default. A V4 file under `data/vocab/` or in the production manifest is treated as production leakage.

---

## 1. Global Rules (apply to every question in every stage)

### 1.1 Uniqueness — the most important rule

**Every production question row's `question_text` must be unique across the entire question bank.**

This means:
- Two questions cannot share the same sentence, even if they test different words
- Two questions cannot share the same sentence with only a prefix changed (`"Reports: The manager..."` vs `"Emails: The manager..."`)
- Two questions in different lessons, different stages, or different types cannot share a stem
- Template sentences that are reused across lessons are **forbidden**
- `mixed_review` lessons are the only exception to the "new row" assumption: they intentionally reuse existing `review_question` IDs from core lessons and do not create new question rows

Verification: run `node scripts/audit-duplicates.js` after generation. Zero duplicates required before import.

### 1.2 Required fields for every question

| Field | Type | Rule |
|-------|------|------|
| `question_id` | string | Unique across entire bank. Format: `{stage_lower}_{lesson_slug}_q_{NNN}` or `_rv_{NNN}` for review questions |
| `lesson_id` | string | Must match a lesson in `curriculum.json` |
| `stage` | string | V0 / V1 / V2 / V3 for production data |
| `type` | string | One of the 10 defined types (§3) |
| `skill` | string | The lesson's **pedagogical skill**, not necessarily equal to `type`. V1=`word_family`, V2=`scene_vocabulary`, V3=`collocation` for all questions in the lesson regardless of question format |
| `subskill` | string | The grammatical sub-category tested (e.g. `noun`, `adjective`, `adverb`, or the scene name) |
| `question_text` | string | Globally unique; contains exactly one `______` for fill-in types |
| `options` | object | Keys A, B, C, D — exactly four options |
| `correct_answer` | string | A, B, C, or D |
| `explanation_zh` | string | Non-empty Traditional Chinese, 20–60 characters |
| `target_item_id` | string | Must exist in `vocab_items` store |
| `distractor_type` | string | Must use the stage-appropriate value: `toeic_realistic` (V0), `same_word_family` (V1), `same_scene_vocabulary` (V2), `wrong_verb_collocation` (V3) |
| `difficulty` | number | 1, 2, or 3 |
| `estimated_time_seconds` | number | See §3 per type |
| `default_error_code` | string | See §3 per type |
| `tags` | array | At least one tag |
| `grammar_link_id` | string\|null | null unless the question tests a grammar pattern |

### 1.3 Options quality

- All four options must be the **same part of speech** as the correct answer (unless the question explicitly tests part-of-speech identification)
- Distractors must be **TOEIC-realistic**: words that a test-taker who half-knows the material might plausibly choose
- Distractors must **not** be eliminated by grammatical cues alone (article `a/an`, singular/plural, subject-verb agreement must not rule out options)
- At least two distractors should be from the **same semantic field** as the correct answer

### 1.4 `explanation_zh` rules

- Language: Traditional Chinese only
- Must explain **why the correct answer is right**, not merely translate the question
- For fill-in questions: name the grammar pattern or semantic rule ("be 動詞後接形容詞", "固定搭配 make a decision")
- For meaning questions: give the business-context definition and contrast one key distractor
- Length: 20–60 characters

### 1.5 English language standards

- Business English, B2 level (CEFR)
- Sentence length: 8–22 words for fill-in; up to 60 words for `part6_context_choice`
- No invented company names — use generic labels (the company, the firm, the client)
- Tense: present simple or past simple preferred; avoid future perfect or conditionals
- Register: formal business prose, not casual

---

## 2. Stage Rules

### V0 — Diagnostic (1 lesson, 31 questions)

**Purpose:** Establish a compact baseline before V1 starts.

- Current production distribution: 19 `question_ids` + 12 `review_question_ids`
- Current type mix: 12 `meaning_choice`, 1 each of `scene_vocabulary`, `collocation`, `formal_phrase`, `false_friend`, `part5_sentence_completion`, `part6_context_choice`, `speed_drill`, plus 12 `review_question`
- Keep stems globally unique and avoid expanding V0 unless it is an intentional production seed change
- Difficulty: 1–2 only

### V1 — Word Family (60 lessons across A–F groups)

**Purpose:** Teach four grammatical forms of each root word (noun / verb / adjective / adverb).

**Lesson structure:**
- `question_ids`: 18 questions per lesson
- `review_question_ids`: 6 questions per lesson (used for mixed review and interference; not shown in the main session)

**Per-lesson type distribution:**

V1-A (lessons 11–20): **18 question_ids + 6 review_question_ids**

V1-B through V1-E (lessons 21–52): **20 question_ids + 4 review_question_ids**

| Type | Count (V1-A) | Count (V1-B/C/D/E) | Role |
|------|-------------|---------------------|------|
| `word_family` | 8 | 8 | Core — tests correct word form in sentence context |
| `part5_sentence_completion` | 4 | 5 | TOEIC Part 5 format |
| `collocation` | 2 | 3 | Phrase-level usage |
| `speed_drill` | 4 | 4 | Fast recall practice |

**V1-specific rules:**
- Every sentence in a `word_family` question must be **unique to that lesson** — no sentence may appear in any other V1 lesson regardless of type
- `speed_drill` sentences must be **newly written**, not copied from `word_family` or `part5` questions in earlier lessons
- Options for `word_family` questions must always include all four forms: base verb, noun, adjective, adverb (or the closest available four forms)
- The correct answer must require understanding the grammatical role in the sentence, not guesswork
- `default_error_code`: `WORD_FAMILY_POS` for ALL question types within a V1 lesson (lesson-level consistency — all errors in V1 are word-family errors)
- `distractor_type`: `same_word_family` for ALL question types within a V1 lesson

### V2 — TOEIC Scene Vocabulary (50 core + 10 mixed_review = 60 lessons)

**Purpose:** Teach four scene-specific target items per core lesson through in-context fill-in-the-blank.

**Lesson structure:**
- `question_ids`: 20-22 session questions
  - first same-stage core lesson: 20 same-lesson questions because no prior same-stage items exist
  - second same-stage core lesson: typically 20 same-lesson questions + 1 prior review-pressure row
  - later core lessons: typically 20 same-lesson questions + 2 prior review-pressure rows
- `review_question_ids`: 4 questions per lesson

**Per-lesson base type distribution (20 same-lesson questions, before old-item review pressure):**

| Type | Count | Role |
|------|-------|------|
| `scene_vocabulary` | 20 | Core — scene-based fill-in |
| prior `review_question` rows | 0-2 | Old-item review pressure from earlier same-stage core lessons |

**V2-specific rules:**
- Every `scene_vocabulary` question must include a **scene label prefix** followed by a colon: `"Office: ..."`, `"Finance: ..."`, `"HR: ..."`
- The scene label must match the lesson's thematic scene
- The blank (`______`) must be placed where **only the target word** fits given the full sentence context — no other word in the options should be grammatically and semantically acceptable
- `default_error_code`: `SCENE_VOCAB_GAP`
- Old-item pressure must use earlier same-stage items only. Do not use V4 items, future items, or mixed-review lessons as sources.
- `V2-A-71` is a first-core policy exception because no earlier V2 core lesson exists.

### V3 — Collocation (60 core + 12 mixed_review = 72 lessons)

**Purpose:** Teach four target collocations per core lesson.

**Lesson structure:**
- `question_ids`: 20-22 session questions
  - first same-stage core lesson: 20 same-lesson questions because no prior same-stage items exist
  - second same-stage core lesson: typically 20 same-lesson questions + 1 prior review-pressure row
  - later core lessons: typically 20 same-lesson questions + 2 prior review-pressure rows
- `review_question_ids`: 4 questions per lesson

**Per-lesson base type distribution (20 same-lesson questions, before old-item review pressure):**

| Type | Count | Role |
|------|-------|------|
| `part6_context_choice` | 12 | Multi-sentence context |
| `collocation` | 4 | Direct collocation test |
| `part5_sentence_completion` | 4 | Single-sentence TOEIC Part 5 |
| prior `review_question` rows | 0-2 | Old-item review pressure from earlier same-stage core lessons |

**V3-specific rules:**
- The question must test **collocational knowledge**, not word meaning — a test-taker who knows the word's meaning but not its collocations should still find it challenging
- Distractors must be words that would be **grammatically legal** but collocationally wrong (`make a decision` vs `do a decision` — both grammatically possible, only one is correct)
- `part6_context_choice` requires a 2–4 sentence mini-passage before the question
- `default_error_code`: `COLLOCATION_GAP`
- Old-item pressure must use earlier same-stage items only. Do not use V4 items, future items, or mixed-review lessons as sources.
- `V3-A-121` is a first-core policy exception because no earlier V3 core lesson exists.

### mixed_review lessons (22 lessons: 10 for V2, 12 for V3)

- `question_ids`: taken entirely from the `review_question_ids` of the preceding 5 core lessons (20 questions total = 4 per lesson × 5 lessons)
- No new questions are written for mixed_review lessons — they are assembled automatically by `scripts/add-mixed-review-lessons.js`
- Reuse is intentional only when the curriculum lesson has `"lesson_type": "mixed_review"` and the referenced IDs are valid existing `review_question` rows from earlier same-stage core lessons
- Invalid references, non-review question references, future references, or cross-stage references still fail the full audit
- Mixed-review reuse must not be counted as duplicate core question stems because no duplicate production question rows are created

---

## 3. Question Type Reference

### `meaning_choice`
```
Format:  In a TOEIC business context, what does "[word]" most nearly mean?
Options: Four English definitions (not word forms)
Answer:  The most precise business-English definition
Time:    10 seconds
Error:   VOCAB_UNKNOWN
Tags:    ["toeic_part5", "meaning"]
```

### `scene_vocabulary`
```
Format:  [Scene label]: [Business sentence with ______.]
Example: "HR: The department issued a new ______ for handling overtime requests."
Options: Four words from the same lesson's vocabulary set (or plausible TOEIC distractors)
Answer:  The only word that fits the scene
Time:    15 seconds
Error:   SCENE_VOCAB_GAP
Tags:    ["toeic_scene", "<scene_name>"]
```

### `collocation`
```
Format:  [Sentence with ______ at the collocation slot.]
         OR "Choose the best phrase: [noun/verb phrase] ______."
Example: "The finance team will ______ a detailed budget report by Friday."
Options: Four verbs or nouns — one collocates correctly, three do not
Answer:  The standard collocate
Time:    15 seconds
Error:   COLLOCATION_GAP
Tags:    ["toeic_part5", "collocation"]
```

### `word_family`
```
Format:  [Business sentence with ______.]
Example: "The contractor was held ______ for any delays in delivery."
Options: Four forms of the target root (e.g. responsible / responsibly / responsibility / irresponsible)
Answer:  The grammatically correct form for the blank's position
Time:    15 seconds
Error:   WORD_FAMILY_POS
Tags:    ["toeic_part5", "word_family", "<grammar_pattern>"]
Note:    grammar_link_id should reference the relevant POS pattern
```

### `part5_sentence_completion`
```
Format:  [Single standalone sentence with ______.]
Example: "All departments must ______ their quarterly reports by the 15th."
Options: Four words — mix of plausible wrong words and correct answer
Answer:  The best completion
Time:    15 seconds
Error:   VOCAB_WEAK_RECALL
Tags:    ["toeic_part5"]
```

### `part6_context_choice`
```
Format:  [2–4 sentence mini-passage ending with a question sentence containing ______.]
Example: "The annual review has been moved to next month.
          All staff should update their self-assessment forms.
          Please submit the ______ version by the new deadline."
Options: Four words — only one fits the full passage context
Answer:  The word consistent with the whole passage
Time:    25 seconds
Error:   SCENE_VOCAB_GAP
Tags:    ["toeic_part6", "context"]
```

### `speed_drill`
```
Format:  [Short business sentence with ______.] (8–12 words preferred)
Example: "The client asked us to ______ the proposal by noon."
Options: Four plausible completions
Answer:  The most natural completion
Time:    10 seconds
Error:   TIME_PRESSURE
Tags:    ["toeic_part5", "speed"]
Note:    Sentence must be newly written — not copied from word_family or part5 questions
```

### `review_question`
```
V0 / V2 / V3 format:
  "Quick review: choose the best TOEIC meaning for \"[word]\"."

V1 format (word_family lessons):
  Fill-in-the-blank sentence — same as word_family format.
  Tests a word-family form in a short business sentence.
  Does NOT start with "Quick review:".

Options:  Definitions (V0/V2/V3) or word forms (V1)
Answer:   Correct meaning or form
Time:     10 seconds
Error:    VOCAB_WEAK_RECALL (V0/V2/V3) / WORD_FAMILY_POS (V1)
Tags:     ["review"]
Note:     Goes in review_question_ids only — never in question_ids main session flow.
```

### `formal_phrase`
```
Format:  [Business sentence with a formal phrase slot: ______.]
Example: "I am writing ______ the operations director to request an extension."
Options: Four prepositional or fixed phrases (on behalf of / in spite of / etc.)
Answer:  The standard formal phrase
Time:    20 seconds
Error:   FORMAL_PHRASE
Tags:    ["formal_phrase", "business_email"]
```

### `false_friend`
```
Format:  In TOEIC English, "[word]" usually means ______.
Options: Four definitions — one correct, at least one Chinese-speaker false friend
Answer:  The true English meaning
Time:    15 seconds
Error:   FALSE_FRIEND
Tags:    ["false_friend"]
```

---

## 4. Distractor Quality Checklist

Before finalising any question, verify every distractor:

- [ ] Is the same part of speech as the correct answer (unless POS is being tested)
- [ ] Cannot be ruled out by `a/an`, singular/plural, or subject-verb agreement
- [ ] Is a real TOEIC-level English word (not invented or obscure)
- [ ] Comes from the same semantic field or business domain as the correct answer
- [ ] Would plausibly attract a test-taker who partially knows the topic
- [ ] Does not accidentally also fit the blank (second-correct-answer problem)

---

## 5. AI Generation Prompt Template

Use this template when asking an AI to write new questions.
Replace `[...]` blocks with actual data.

```
You are designing questions for a TOEIC vocabulary learning app.

══ TASK ══
Stage:        [V2]
Lesson:       [V2-C-91]
Lesson type:  [scene_vocabulary]
Scene:        [Office Administration]
Target words: [list each as: item_id | English word | Chinese meaning]
Questions needed: [20 same-lesson core rows + 4 review_question rows]
Type distribution:
- V2 example: [20 scene_vocabulary, 4 review_question]
- V3 example: [12 part6_context_choice, 4 collocation, 4 part5_sentence_completion, 4 review_question]
Old-item pressure: [0-2 prior same-stage review_question IDs are added in curriculum question_ids when prior same-stage core lessons exist; do not create duplicate rows for mixed_review]

══ MANDATORY RULES ══
1. UNIQUENESS: Every question_text must be globally unique.
   The following stems are already in use — do not reuse or paraphrase them:
   [paste the existing question_text list here]

2. OPTIONS: Exactly four options A/B/C/D. One correct answer.
   All options must be the same part of speech. No grammatical giveaways.
   Distractors must be plausible TOEIC vocabulary from the same semantic field.

3. EXPLANATION: explanation_zh must be Traditional Chinese, 20–60 characters.
   Explain WHY the answer is correct. Do not just translate the sentence.

4. SCENE LABEL: All scene_vocabulary questions must start with "[Scene]: ..."

5. REVIEW QUESTIONS: go in review_question_ids (not question_ids).
   Format: "Quick review: choose the best TOEIC meaning for \"[word]\"."

══ OUTPUT FORMAT ══
JSON array. Each object must have:
question_id, lesson_id, stage, type, skill, subskill,
grammar_link_id (null unless grammar-specific),
question_text, options {A,B,C,D}, correct_answer, explanation_zh,
target_item_id, distractor_type (stage-appropriate value, e.g. "same_scene_vocabulary" for V2),
difficulty (1/2/3), estimated_time_seconds,
default_error_code, tags (array)
```

---

## 6. Post-Generation Checklist

After receiving generated questions and before adding them to the question bank:

1. **Run the duplicate audit:**
   ```
   node scripts/audit-duplicates.js
   ```
   Must report zero duplicate groups.

2. **Verify target_item_id references:**
   Every `target_item_id` in the new questions must exist in `vocab_items`.

3. **Check lesson question counts:**
   - V1 lesson: 18 `question_ids` + 6 `review_question_ids`
   - V2 core lesson: 20-22 final `question_ids` + 4 `review_question_ids`
   - V3 core lesson: 20-22 final `question_ids` + 4 `review_question_ids`
   - V2/V3 mixed-review lesson: `question_ids` should be valid reused `review_question` IDs from earlier same-stage core lessons; no `review_question_ids`

4. **Bump `seed_version`** in three files simultaneously:
   - `data/vocab/curriculum.json` → `seed_version`
   - `js/vocab-db.js` → `SEED_VERSION`
   - `tests/helpers/seed-idb.ts` → `APP_SEED_VERSION`
   Format: `toeic_vocab_tracker_{description}_{YYYY_MM_DD}`

5. **Run all Playwright tests:**
   ```
   npx playwright test
   ```
   All Playwright tests must pass before the content is considered ready.

Full validation for production changes:

```powershell
node scripts/validate-vocab-data.js
node scripts/audit-quality-full.js
node scripts/audit-duplicates.js
npm run test:scoring
npm run test:audit
npx playwright test
npm run test:all
```

---

## 7. Error Code Reference

| Code | Meaning | Used by |
|------|---------|---------|
| `VOCAB_UNKNOWN` | Word meaning completely unknown | meaning_choice |
| `SCENE_VOCAB_GAP` | Word known but not recognized in scene | scene_vocabulary, part6 |
| `COLLOCATION_GAP` | Meaning known but wrong collocate chosen | collocation (generic) |
| `COLLOCATION_PREP` | Wrong preposition or fixed collocation pattern | V3 questions (all types) |
| `WORD_FAMILY_POS` | Wrong grammatical form selected | word_family |
| `VOCAB_WEAK_RECALL` | Slow or uncertain recall | part5, review_question |
| `TIME_PRESSURE` | Correct under normal conditions but slow | speed_drill |
| `FORMAL_PHRASE` | Formal phrase not memorized | formal_phrase |
| `FALSE_FRIEND` | Chinese false-friend interference | false_friend |
| `CARELESS` | (Manually assigned) Known word, careless error | any |
| `REPEATED_ERROR` | (Manually assigned) Same error made again | any |

---

## 8. Known Past Violations (for reference)

These are real problems that occurred and are now fixed. The rules above were written to prevent recurrence.

| Issue | Root cause | Rule that prevents it |
|-------|-----------|----------------------|
| Historical V0 pre-consolidation draft: 31 unique stems repeated across an obsolete 240-question draft. Current production V0 is 31 questions. | No uniqueness constraint in generation prompt | §1.1 |
| V1: 762 duplicate stems across lessons | `speed_drill` lessons copied `word_family` sentences; `word_family` shared 17 template sentences across 10 lessons | §1.1, §2 V1 |
| V3 vocab_items: empty `chinese` and `example` | Item data was generated without requiring those fields | (Vocab item spec, not question spec) |
| Audit script missed duplicates | Audit checked coverage and interference but not text uniqueness | §6 post-generation checklist |
