# Question Creation Specification
## TOEIC Vocabulary Tracker — v1.3 (2026-05-20)

This document defines all rules for creating questions for this question bank.
**Every rule here exists because a violation has already caused a real problem.**
When asking an AI to generate questions, paste the relevant sections as instructions.

Current production scope is V0-V3 only. V4 remains draft-only under `drafts/v4/` and must not be added to `data/vocab/` or the production manifest until a future V4 activation task explicitly updates the spec, curriculum, seed version, data, and tests. For current counts and priorities, use root `TO_AI.md` as the source of truth.

Rebuild status as of 2026-05-18: the active production seed is intentionally cleared, with 0 production lesson rows and 0 production question rows. Stage structures below are authoring targets or historical production structures unless a later section explicitly says they are current runnable counts. For current rebuild priorities, use `docs/Future Plan.md`. Historical planning documents are archived under `docs/backups/plans/2026-05-19/`. For any rebuild wave release, use this spec together with `docs/rebuild-wave-release-gate.md`. For the Wave 1 V3 collocation rebuild, also use `drafts/collocation-rebuild/wave1_authoring_policy_pack.json`.

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
| `explanation_zh` | string | Non-empty Traditional Chinese, 20–60 characters; must explain the correct rule and at least one key distractor contrast |
| `target_item_id` | string | Must exist in `vocab_items` store |
| `distractor_type` | string | Must use the stage-appropriate value: `toeic_realistic` (V0), `same_word_family` (V1), `same_scene_vocabulary` (V2), `wrong_verb_collocation` (V3) |
| `difficulty` | number | 1, 2, or 3 in the current production schema; finer difficulty nuance must go into `tags` or review notes until the schema is intentionally upgraded |
| `estimated_time_seconds` | number | See §3 per type |
| `default_error_code` | string | See §3 per type |
| `tags` | array | At least one tag; include lexical / scene / sense / risk tags when relevant (for example `semantic_sense:*`, `business_scene:*`, `phrasal_verb`, `connector`, `degree_adverb`, `collocation`) |
| `grammar_link_id` | string\|null | null unless the question tests a grammar pattern |

### 1.3 Options quality

- All four options must be the **same part of speech** as the correct answer (unless the question explicitly tests part-of-speech identification)
- Distractors must be **TOEIC-realistic**: words that a test-taker who half-knows the material might plausibly choose
- Distractors must **not** be eliminated by grammatical cues alone (article `a/an`, singular/plural, subject-verb agreement must not rule out options)
- At least two distractors should be from the **same semantic field** as the correct answer
- Distractors should usually be **grammatically legal but semantically or collocationally wrong** once inserted into the blank
- Avoid absolute-synonym option pairs or two wrong options that are effectively the same meaning; duplicate wrong meanings lower discrimination
- Prefer similar option length / surface shape / difficulty when practical so the correct answer does not stand out visually
- All options must be real English words or established business phrases; do not invent misspellings or fake words
- When natural, include a realistic Chinese-speaker confusion distractor, but only if it still survives grammar screening

### 1.4 `explanation_zh` rules

- Language: Traditional Chinese only
- Must explain **why the correct answer is right**, not merely translate the question
- For fill-in questions: name the grammar pattern or semantic rule ("be 動詞後接形容詞", "固定搭配 make a decision")
- For meaning questions: give the business-context definition and contrast one key distractor
- Length: 20–60 characters
- The paid-quality target is: correct rule + why at least one likely distractor is wrong + Chinese-speaker trap when relevant
- The current production schema stores only one `explanation_zh` field. If fuller rationale for all three distractors is needed, keep it in authoring notes, review sheets, or policy packs until the schema is deliberately expanded.
- For Wave 1 V3 collocation drafts, also follow `wave1_authoring_policy_pack.json -> explanation_rubric`.

### 1.5 English language standards

- Business English, B2 level (CEFR)
- Most single-sentence stems should target **15–25 words**. Shorter 8–14 word stems are acceptable only for `speed_drill`, very tight collocation prompts, or other clearly justified fast-response formats; `part6_context_choice` may still run up to 60 words.
- No invented company names — use generic labels (the company, the firm, the client)
- Tense: present simple or past simple preferred; avoid unstable tense stacks unless the context genuinely requires them
- Register: formal, neutral business prose rather than casual or emotional language
- Context should prefer universal business scenes such as procurement, HR, customer service, finance, operations, logistics, compliance, and IT support
- Grammar and spelling must be fully correct; the stem itself may not create noise or ambiguity
- Vary syntax across the bank: relative clauses, participle phrases, contrast clauses, and other TOEIC-relevant structures are encouraged when they remain clear and natural
- Avoid culture-bound jokes, slang, or country-specific assumptions that a global learner would not reasonably know

### 1.6 Production quality policy — semantic meaning, progression, and reuse

For this spec, a **direct-definition question** means:
- `meaning_choice`
- `review_question` in V0 / V2 / V3 when the options are English definitions

V1 `word_family` and V1 `review_question` are excluded from this definition because they test form, not vocabulary meaning.

Rules:
- Across the entire production bank, one `target_item_id` + one semantic meaning may have only **one** direct-definition question row.
- A second direct-definition row is allowed only when the word has a **genuinely different semantic meaning**. A different department, scene, or business domain by itself does **not** justify a second definition row.
- If more than one direct-definition row exists for the same surface word, each such row must include a `semantic_sense:<sense_id>` tag. Add `domain_sense:<domain>` only when it helps document the different meaning. `domain_sense` alone never justifies a second definition row.
- V0 diagnostic is strict: the same `target_item_id` + same semantic meaning must appear only once as a direct-definition question.
- After a target item's direct-definition row has been used, later practice for that same meaning should shift to `collocation`, `part5_sentence_completion`, `part6_context_choice`, `scene_vocabulary`, or other context-based usage questions.
- The same item may appear multiple times within one lesson only when the cognitive demand is clearly staircased, for example: definition → meaning in sentence → collocation → fill-in → context → review. `definition + definition` repetition is forbidden.
- Contextual reuse must be meaningfully different. Changing only a scene label, department name, or a few surface words does not count as a new context.
- Scene diversity target: high-frequency core words should appear in at least 3 distinct context skeletons across the bank, mid-frequency words in at least 2, and low-frequency words in 1–2.
- Formal production content should avoid near-template rewrites. Limited template reuse may be tolerated in drafts or temporary practice content, but not as a normal production strategy.

### 1.7 High-reliability authoring rules

#### 1.7.1 Vocabulary and collocation selection

- Test **application ability**, not rote memorisation. If a learner can answer from dictionary memory alone, the item is usually too weak.
- Prioritise **high-frequency TOEIC / workplace vocabulary**. Reject literary, obscure, or low-utility words unless a future explicitly approved wave requires them.
- When a target word has a stable partner or preposition, the item should often force **collocational knowledge** rather than isolated translation, for example `access to`, `comply with`, `streamline the process`, `leverage resources`.
- Use **polysemy deliberately**: prefer high-utility secondary senses such as `address = deal with` or `outstanding = unpaid` when those senses matter in business English.
- Use **phrasal-verb contrast** when the particle changes meaning materially, for example `turn in` vs `turn down`, but only when all options remain real and plausible business English.
- Avoid contestable near-synonym fights that even strong speakers could argue over. If the discrimination relies on microscopic stylistic preference rather than a clear rule, rewrite the item.
- Strengthen **business idioms and operating language** when natural, not as decorative jargon.
- Use **word-family confusion** strategically when the sentence structure truly requires that sensitivity.
- Include **connectors and logical linkers** such as `therefore`, `nevertheless`, and `in contrast` when the sentence logic genuinely depends on them.
- Include **degree-adverb precision** when a specific collocation matters, for example `highly successful` rather than any generic intensifier.
- The blanked target must be the **semantic core** of the sentence. If several harmless substitutions preserve the same meaning, the stem is too weak.

#### 1.7.2 Stem design and context control

- The stem must be **closed-context**: once the correct answer is inserted, the sentence or passage should support only one natural interpretation.
- Every stem should contain at least one **context clue** that points toward the answer or rules out common traps.
- Prefer **real workplace situations**: procurement, hiring, meetings, customer support, budgeting, documentation, facilities, equipment, scheduling, and compliance.
- Vary sentence structures across the bank; do not let the whole set collapse into repetitive `S + V + O` fillers.
- Keep the tone **professional and neutral**. Do not use melodramatic, sarcastic, or chatty narration.
- Avoid accidental answer leakage from articles, number agreement, or obvious morphology.
- Distribute blank positions across subject, verb, object, complement, and modifier slots instead of always blanking the sentence tail.
- If a stem is shorter than the preferred target length, it must still contain enough information to prevent ambiguity.
- If a stem is longer than the preferred target length, every extra word must materially support context, not padding.
- Do not use culture-specific references, local memes, or idioms that are not part of international business English.

#### 1.7.3 Distractor psychology

- All options must keep the **same part of speech** unless POS is the explicit test point.
- Distractors should cluster around the **same topic family** as the answer, so the learner must discriminate meaning or usage, not simply detect category mismatch.
- When natural, use **visual or phonological twins** (`adapt`, `adopt`, `adept`) to probe lexical precision.
- Wrong options should stay **grammar-compatible** after insertion whenever the skill being tested is meaning, collocation, or context.
- Use **Chinese L1 transfer traps** only when they are real learner errors, not caricatures.
- No two distractors may be effectively the same wrong idea. Otherwise the single-correct-answer logic becomes easier to reverse-engineer.
- Keep option length and structure reasonably symmetrical.
- Keep distractor difficulty in the same band as the answer; do not prop up an easy answer with obviously harder or much easier filler options.
- Every distractor must be a real English word or phrase.
- Reverse common sense carefully: a distractor may sound plausible in daily life but should fail in the specific business context of the stem.

#### 1.7.4 System architecture and governance notes

- Across a large release batch, canonical `A/B/C/D` correct-answer distribution should stay close to **25% each**.
- The current production app still stores canonical option order in JSON. **Do not assume frontend shuffling is already guaranteed.** If runtime randomisation is added later, it must preserve `correct_answer`, review logic, exports, and analytics.
- `All of the above` and `None of the above` are forbidden.
- The current schema uses `difficulty` 1/2/3 plus `tags`; do not invent a parallel 1–5 production field until the schema is explicitly upgraded.
- A single lesson or test session should not accidentally collide on the same target word or collocation unless the reuse is an intentional staircase or review design.
- Formatting and punctuation must be consistent. Single-word options should usually stay lowercase and unpunctuated; full-sentence options should follow sentence casing and punctuation consistently.
- Rich explanation structure is mandatory at the authoring level even though production JSON currently stores only `explanation_zh`.
- UI readability and whitespace matter, but they are presentation constraints; do not solve poor UI readability by weakening stem precision.
- The app does **not** currently expose a learner-facing dispute button. Until such a feature exists, question disputes must flow through `question_edits`, patch export / review, and seed-change records.
- Question fixes must remain traceable and must not invalidate historical attempt data. Use seed records, patch workflow, and source-seed metadata instead of silent overwrites.

---

## 2. Stage Rules

Current production has no runnable V0-V3 lessons after the full-bank clear. The structures in this section remain target authoring contracts for future production rebuilds.

### V0 — Diagnostic (target/historical: 1 lesson, 31 questions)

**Purpose:** Establish a compact baseline before V1 starts.

- Target/historical distribution before the full-bank clear: 19 `question_ids` + 12 `review_question_ids`
- Target/historical type mix: 12 `meaning_choice`, 1 each of `scene_vocabulary`, `collocation`, `formal_phrase`, `false_friend`, `part5_sentence_completion`, `part6_context_choice`, `speed_drill`, plus 12 `review_question`
- Keep stems globally unique and avoid expanding V0 unless it is an intentional production seed change
- Keep diagnostic meaning coverage clean: do not repeat the same `target_item_id` + same semantic meaning as a second direct-definition question in V0
- Difficulty: 1–2 only

### V1 — Word Family (target/historical: 60 lessons across A–F groups)

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

### V2 — TOEIC Scene Vocabulary (target/historical: 50 core + 10 mixed_review = 60 lessons)

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

### V3 — Collocation (target/historical: 60 core + 12 mixed_review = 72 lessons)

**Purpose:** Teach four target collocations per core lesson.

Wave 1 rebuild note: the current V3 Wave 1 draft under `drafts/collocation-rebuild/` uses 16 draft collocation lessons with 20 core slots and 4 review slots per lesson. These are draft authoring rows only, not production rows.

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
- Current architecture is reuse-based. If future mixed-review authoring explicitly adds new rows, target mix should be 70–80% new contextual review rows and 20–30% reused old-error rows.

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
Rule:    Only one direct-definition row is allowed per target_item_id + semantic meaning
         across the production bank. If the same surface word truly needs a second
         definition row for a different meaning, tag it with `semantic_sense:<sense_id>`
         and, when helpful, `domain_sense:<domain>`.
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
Time:    8 seconds
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
          For V0 / V2 / V3, do not write a second same-meaning definition prompt for an
          item that already has a direct-definition row in the production bank.
          Follow-up review should shift to collocation, Part 5 vocabulary fill-in,
          Part 6 context, or other contextual sentence practice.
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

## 4. Authoring Quality Checklists

Use these checklists before finalising any question set.

### 4.1 Target vocabulary and collocation checklist

- [ ] The target is high-frequency TOEIC / workplace vocabulary, not literary or low-utility filler
- [ ] The question tests application, not bare dictionary recall
- [ ] If the target naturally selects a partner word or preposition, the item forces collocation knowledge instead of translation only
- [ ] If the item uses polysemy, the chosen sense is a real high-utility meaning and the context makes that sense explicit
- [ ] If the item uses a phrasal verb, connector, or degree adverb, the wrong options create a meaningful but incorrect contrast
- [ ] The blanked target is semantically indispensable; a harmless synonym cannot replace it without changing the core message

### 4.2 Stem and context checklist

- [ ] Most single-sentence stems stay in the 15–25 word target zone unless a speed / tight-context exception is justified
- [ ] The context is closed and leads to one natural interpretation
- [ ] The stem contains at least one useful clue that points toward the answer or screens out common traps
- [ ] The scenario is realistic workplace English and free from culture-specific barriers
- [ ] Grammar, spelling, and register are fully professional and correct
- [ ] The blank position is not predictable and does not leak the answer through articles, agreement, or morphology
- [ ] The sentence pattern adds variety without becoming unnatural or overloaded

### 4.3 Distractor quality checklist

Before finalising any question, verify every distractor:

- [ ] Is the same part of speech as the correct answer (unless POS is being tested)
- [ ] Cannot be ruled out by `a/an`, singular/plural, or subject-verb agreement
- [ ] Is a real TOEIC-level English word or phrase (not invented or obscure)
- [ ] Comes from the same semantic field or business domain as the correct answer
- [ ] Would plausibly attract a test-taker who partially knows the topic
- [ ] Is grammatically legal in the slot when the item is meant to test meaning / context / collocation
- [ ] Has similar length / surface shape to the correct answer when practical, so it is not too easy to eliminate
- [ ] Ideally includes at least one realistic Chinese-speaker confusion distractor that still survives grammatical screening
- [ ] Does not accidentally also fit the blank (second-correct-answer problem)
- [ ] Does not duplicate another wrong option's meaning
- [ ] Matches the answer's general difficulty band rather than making the answer stand out

### 4.4 System and governance checklist

- [ ] No option uses `All of the above` or `None of the above`
- [ ] The batch still supports healthy A/B/C/D answer balance
- [ ] `difficulty` and `tags` reflect the actual test point, scene, and sense using the current schema rather than invented extra fields
- [ ] The lesson does not accidentally retest the same target word / collocation unless the reuse is an intentional staircase or review row
- [ ] `explanation_zh` is strong enough for production, and fuller distractor rationale is preserved in review notes when needed
- [ ] Any expected future dispute can be traced through patch workflow, `question_edits`, or seed records
- [ ] Option casing, punctuation, and formatting are internally consistent

For Wave 1 V3 collocation drafts, distractor candidates must follow the schema in `drafts/collocation-rebuild/wave1_authoring_policy_pack.json -> distractor_bank_schema`.

---

## 5. AI Generation Prompt Template

Use this template when asking an AI to write new questions.
Replace `[...]` blocks with actual data.

For a shorter copy-paste version aimed at day-to-day AI authoring, use `docs/templates/ai-question-authoring-prompt.md`. The inline template below remains the fuller reference version tied directly to this spec.

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

6. DEFINITION CONTROL: For direct-definition questions (`meaning_choice` and V0/V2/V3
   `review_question`), one `target_item_id` + one semantic meaning may appear only once
   across the production bank.

7. SENSE TAGGING: If the same surface word truly requires a second direct-definition row,
   it must carry `semantic_sense:<sense_id>`. Add `domain_sense:<domain>` only when it
   clarifies the different meaning. Domain alone does not justify the second row.

8. PROGRESSION: Do not write `definition + definition` repetition in the same lesson.
   After the first definition row, move later practice into context, collocation,
   Part 5 vocabulary fill-in, or Part 6 passage questions.

9. CONTEXT DIVERSITY: Repeated practice for the same item must use genuinely different
   sentence skeletons. Prefix swaps and near-template rewrites are not acceptable.

10. EXPLANATION / DISTRACTOR QUALITY: explanation_zh should state the rule, one likely
    wrong choice, and a common Chinese-speaker trap when relevant. Distractors should be
    structurally similar and not instantly removable.

11. WAVE 1 POLICY PACK: For V3 Wave 1 collocation drafts, follow
    drafts/collocation-rebuild/wave1_authoring_policy_pack.json. It defines
    target_item_id, semantic_sense, distractor, explanation, and source-of-truth rules.

12. HIGH-RELIABILITY AUTHORING: Also follow §1.7 and the checklists in §4.
   Prefer high-frequency business vocabulary, force collocation when natural,
   write closed-context stems, avoid contestable absolute synonyms, and keep
   the blanked target semantically indispensable.

13. SYSTEM HONESTY: Use only fields supported by the current schema.
   `difficulty` is still 1/2/3, and production JSON still has one `explanation_zh`
   field. Do not invent extra runtime fields for 1–5 difficulty, per-distractor
   explanations, or unimplemented learner-feedback features.

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

4. **Run the §4 authoring quality checklists** for target choice, stem design, distractors, and governance notes.
   Any deliberate exception should be recorded in draft review notes before import.

5. **Bump `seed_version`** in three files simultaneously:
   - `data/vocab/curriculum.json` → `seed_version`
   - `js/vocab-db.js` → `SEED_VERSION`
   - `tests/helpers/seed-idb.ts` → `APP_SEED_VERSION`
   Format: `toeic_vocab_tracker_{description}_{YYYY_MM_DD}`

6. **Create a seed-change record** from `docs/templates/seed-change-record-template.md` and save it as `docs/seed-changes/YYYY-MM-DD-{new-seed-version}.md`.
   - Record the change items, reason, affected files, validation results, rollback plan, and sign-off.
   - Do not merge or describe a production seed change as complete without this record.

7. **Run all Playwright tests:**
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
npm run test:docs
npm run test:audit
npx playwright test
npm run test:all
```

### 6.1 Rebuild wave minimum release gate

Every rebuild wave must follow `docs/rebuild-wave-release-gate.md` before it is described as ready, merged, or production-promoted.

Before scaling a V1, V2, or V3 rebuild, first pass the relevant minimum usable content pack in `docs/minimum-usable-content-packs.md` and `drafts/v0-v3-rebuild/minimum_usable_packs.json`. The machine check is:

```powershell
npm run test:mup
```

Minimum output:

- A declared wave scope: draft-only or production release.
- Complete lesson rows for every claimed lesson; no placeholder production lesson rows.
- Complete question rows for every claimed `question_id` and `review_question_id`.
- Valid review wiring, including mixed-review reuse only from earlier same-stage `review_question` rows.
- Complete target item coverage in vocab items for every production `target_item_id`.
- Documentation updates for any changed counts, rules, current facts, or user-facing behavior.
- Automated tests or verifier coverage for the wave-specific behavior.

Required production validation:

```powershell
node scripts/validate-vocab-data.js
node scripts/audit-quality-full.js
node scripts/audit-duplicates.js
npm run test:scoring
npm run test:audit
npm run test:patch
npm run test:docs
npx playwright test
npm run test:all
```

Required human review:

- High-frequency business vocabulary selection and target-word irreplaceability.
- Polysemy, phrasal-verb, connector, and degree-adverb precision when those are the intended traps.
- Stem clue sufficiency, single-interpretation closure, and cultural neutrality.
- Content quality and natural TOEIC business English.
- Semantic-sense policy for direct-definition rows.
- Error-code and distractor-type alignment.
- Answer distribution across A/B/C/D.
- Tag completeness and schema-aligned difficulty.
- Traditional Chinese explanations that explain the rule or contrast.
- Authoring rationale for why the correct answer wins and why major distractors fail.
- Distractor plausibility and grammar-giveaway screening.
- Review-row and old-item pressure validity.

Any unchecked blocking item in `docs/rebuild-wave-release-gate.md` blocks production promotion.

### 6.2 Release-gate interpretation

- New production rows must pass all blocking checks before import.
- Warning checks do not block import by themselves, but they must be reviewed and should trend downward over time.
- Temporarily non-automated checks remain part of human quality review even when no script enforces them yet.

### 6.3 Audit check matrix

#### Blocking

| Check | Scope | Standard |
|------|------|----------|
| Duplicate `question_text` | Whole production bank | Fail if any production row reuses an existing stem |
| Duplicate `question_id` / missing required fields | Whole production bank | Fail immediately |
| Duplicate option text inside one question | Per question | Fail if two options normalize to the same text |
| Forbidden shortcut options | Per question | Fail if any option uses `All of the above` or `None of the above` |
| Same-lesson direct-definition repetition | One lesson | Fail if the same `target_item_id` + same semantic meaning appears twice in direct-definition rows |
| Whole-bank direct-definition repetition | Whole production bank | Fail if a new direct-definition row duplicates an existing `target_item_id` + same semantic meaning already present elsewhere in production |
| Missing sense tag on an allowed second definition row | Whole production bank | Fail if a surface word has more than one direct-definition row and the extra row lacks `semantic_sense:<sense_id>` |
| V0 diagnostic definition contamination | V0 only | Fail if V0 repeats the same `target_item_id` + same semantic meaning as a second direct-definition row |
| Invalid mixed-review references | Mixed-review lessons | Fail if reused IDs are invalid, cross-stage, future, or non-review rows |

#### Warning

| Check | Scope | Standard |
|------|------|----------|
| Near-template similarity | Whole production bank | Warn when stems are highly similar in sentence skeleton even if not exact duplicates |
| Context diversity below target | Per target item | Warn when high-frequency words have fewer than 3 distinct context skeletons, or mid-frequency words fewer than 2 |
| Weak distractor heuristics | Per question | Warn when distractors are too short/long, too structurally different, or trivially removable |
| Explanation quality heuristics | Per question | Warn when explanation_zh appears to omit rule, likely wrong choice, or common trap guidance |
| Preferred stem length drift | Per contextual question | Warn when contextual stems fall outside the preferred 15-25 word range for types that should normally stay within one controlled sentence |
| Blank-position concentration | Per lesson | Warn when fill-in blanks are overly concentrated near sentence end across the same lesson |
| Same-lesson staircase weakness | Per lesson | Warn when one item repeats within a lesson but the question types do not clearly increase cognitive demand |
| Mixed-review composition drift | Mixed-review content when explicitly newly authored | Warn if new contextual rows fall far below the target 70–80% and reused old-error rows exceed the intended 20–30% |

#### Temporarily not auto-checked

| Check | Why it is not fully automated yet |
|------|----------------------------------|
| Whether two `semantic_sense` tags represent truly different meanings | This requires semantic judgment; tags alone can be faked or oversimplified |
| Whether a business context is truly natural and authentic | Naturalness is hard to score reliably with simple heuristics |
| Whether a distractor is a genuine high-probability Chinese-speaker confusion | This needs bilingual learner-error knowledge, not just string rules |
| Whether the chosen progression for one item is pedagogically optimal | Scripts can detect rough type order, but not deeper learning value |
| Whether V1 word-family content should remain on the vocabulary main track | This is a curriculum decision, not only a question-audit decision |

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
| Historical V0 pre-consolidation draft: 31 unique stems repeated across an obsolete 240-question draft. V0 was later compacted to 31 questions, then cleared with the rest of production during the 2026-05-18 rebuild reset. | No uniqueness constraint in generation prompt | §1.1 |
| V1: 762 duplicate stems across lessons | `speed_drill` lessons copied `word_family` sentences; `word_family` shared 17 template sentences across 10 lessons | §1.1, §2 V1 |
| V3 vocab_items: empty `chinese` and `example` | Item data was generated without requiring those fields | (Vocab item spec, not question spec) |
| Audit script missed duplicates | Audit checked coverage and interference but not text uniqueness | §6 post-generation checklist |
