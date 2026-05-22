# Compact AI Question Authoring Prompt

Use this when asking an AI to draft questions. The full policy source of truth remains `docs/question-creation-spec.md`.

```text
You are writing TOEIC vocabulary questions for a static local-first learning app.
Return JSON array only. No prose. No markdown.

TASK
Stage: [V2]
Lesson: [V2-A-71]
Lesson type: [scene_vocabulary]
Scene/domain: [Office Administration]
Target words: [item_id | word | zh meaning]
Rows needed: [20 core + 4 review_question]
Old-item pressure: [0-2 earlier same-stage review_question IDs may already be reused in curriculum question_ids; do not create duplicate mixed_review rows]
Existing stems to avoid: [paste current production question_text list or relevant subset]

NON-NEGOTIABLE RULES
1. Every question_text must be globally unique.
2. Use only the current schema. Keep `difficulty` at 1/2/3 and use one `explanation_zh` field only.
3. Exactly 4 options: A/B/C/D. Exactly 1 correct answer.
4. No option may use `All of the above` or `None of the above`.
5. Options must stay in the same part of speech and same business domain. Avoid trivial grammar giveaways.
6. `scene_vocabulary` stems must start with `[Scene]: ...`.
7. `explanation_zh` must be Traditional Chinese, production-ready, and explain why the answer wins. Prefer 20-60 characters. Mention one likely wrong choice or trap when natural.
8. For direct-definition rows (`meaning_choice` and V0/V2/V3 `review_question`), the same `target_item_id` + same meaning may appear only once across production. If the same surface word truly needs another direct-definition row, add `semantic_sense:<sense_id>`.
9. Repeated practice for one item must move upward in demand: definition -> context -> collocation / Part 5 / Part 6, not definition + definition repetition.
10. Contextual stems should usually be closed-context business English and preferably 15-25 words when the type allows it.
11. If a lesson has many fill-in rows, do not place the blank at sentence end almost every time.
12. Distractors must be plausible, grammatically legal in the slot, and close enough in length / shape that the answer does not stand out.
13. Use only implemented system behavior. Do not invent 1-5 difficulty, per-distractor explanation fields, learner dispute buttons, or runtime shuffle promises that do not exist.
14. For V3 Wave 1 collocation drafts, follow `drafts/collocation-rebuild/wave1_authoring_policy_pack.json`.

TYPE NOTES
- V2 core: mostly `scene_vocabulary`; 4 rows are `review_question`.
- V3 core: mix `part6_context_choice`, `collocation`, `part5_sentence_completion`, plus 4 `review_question`.
- `review_question` rows belong in `review_question_ids`, not the main authored contextual batch.
- Mixed-review lessons reuse earlier same-stage `review_question` IDs; they do not need newly authored duplicate rows.

SELF-CHECK BEFORE RETURN
- No duplicate stems.
- No duplicate option texts inside one question.
- No forbidden shortcut options.
- Tags, difficulty, distractor_type, and error code match the real test point.
- Repeated target items use genuinely different context skeletons.
- The blanked target is semantically indispensable.
- The answer is not made obvious by article, number, or option formatting giveaways.

OUTPUT SCHEMA
Each object must include:
question_id, lesson_id, stage, type, skill, subskill,
grammar_link_id, question_text, options {A,B,C,D}, correct_answer,
explanation_zh, target_item_id, distractor_type, difficulty,
estimated_time_seconds, default_error_code, tags
```