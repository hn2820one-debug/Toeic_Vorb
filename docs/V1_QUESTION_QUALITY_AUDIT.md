# V1 Question Quality Audit

Historical note: this audit is scoped to V1 only and was written before the V2/V3 content expansion. Current overall content counts are maintained in `README.md`, `docs/CURRICULUM_MAP.md`, and `docs/CHATGPT_ANALYSIS_PACKAGE.md`.

## 1. Scope

This audit only covers the Vocabulary Tracker project at `C:\Users\Keith\Toeic\toeic-app-Vorb`.

This round only did audit, explanation, and documentation.

Explicitly not done in this round:

- no Grammar / PoS App work
- no backend
- no login
- no cloud sync
- no V2-V6 expansion
- no tracker runtime refactor
- no mass question-bank rewrite

## 2. Method

This audit used four passes:

1. Structural baseline from `node scripts\validate-vocab-data.js`
2. Rule-based classification of the existing 439 warning rows using the validator's real duplicate rule
3. Cross-lesson hotspot grouping on normalized sentence stems after removing the context prefix before `:`
4. A deterministic 90-question naturalness sample spread across `questions_v1a.json` to `questions_v1f.json`

Important definition note:

- The validator warning is not broad semantic similarity.
- It is effectively: `lesson_id + normalizeText(question_text)`.
- That means the 439 warnings are lesson-local repeated normalized question texts.
- Broader cross-lesson template reuse shows up better in hotspot analysis than in the raw warning count.

## 3. V1 Dataset Overview

| File | Lessons Covered | Lesson Range | Question Count | Question Types | Correct Answer Distribution |
| --- | --- | --- | --- | --- | --- |
| `questions_v1a.json` | 10 | `V1-A-11` to `V1-A-20` | 240 | `collocation`, `meaning_choice`, `part5_sentence_completion`, `review_question`, `speed_drill`, `word_family` | A 60 / B 60 / C 60 / D 60 |
| `questions_v1b.json` | 8 | `V1-B-21` to `V1-B-28` | 192 | `part5_sentence_completion`, `review_question`, `word_family` | A 48 / B 48 / C 48 / D 48 |
| `questions_v1c.json` | 8 | `V1-C-29` to `V1-C-36` | 192 | `part5_sentence_completion`, `review_question`, `word_family` | A 48 / B 48 / C 48 / D 48 |
| `questions_v1d.json` | 8 | `V1-D-37` to `V1-D-44` | 192 | `part5_sentence_completion`, `review_question`, `word_family` | A 48 / B 48 / C 48 / D 48 |
| `questions_v1e.json` | 8 | `V1-E-45` to `V1-E-52` | 192 | `part5_sentence_completion`, `review_question`, `word_family` | A 48 / B 48 / C 48 / D 48 |
| `questions_v1f.json` | 18 | `V1-F-53` to `V1-F-70` | 720 | `speed_drill` | A 180 / B 180 / C 180 / D 180 |

V1 total:

- 60 lessons
- 1728 questions
- balanced A/B/C/D answer distribution in every V1 source file

## 4. 439 Warning Classification

### 4.1 Raw Classification Result

| Category | Severity | Count | Interpretation | Recommended Action |
| --- | --- | --- | --- | --- |
| `EXACT_DUPLICATE` | HIGH | 67 | Same lesson-local normalized text, same options, same correct answer, same explanation | Rewrite or merge one copy before using it as a model for future content. |
| `SAME_STEM_DIFFERENT_OPTIONS` | MEDIUM | 0 | Did not appear in the raw 439 warnings because the validator rule is narrower than stem-family similarity | Track in hotspot analysis instead of raw warning count. |
| `TEMPLATE_SIMILARITY` | MEDIUM | 0 | Did not appear in the raw 439 warnings because the validator rule is narrower than cross-lesson templating | Track in hotspot analysis instead of raw warning count. |
| `ACCEPTABLE_SPEED_REPETITION` | LOW | 98 | Repetition inside speed-drill content, mostly V1-F style reuse | Accept for now in V1-F, but watch for over-concentration of one shell within a lesson. |
| `ACCEPTABLE_REVIEW_REPETITION` | LOW | 61 | Review-question repetition that is structurally expected in review content | Accept in small amounts, but avoid stacking too many identical review prompts. |
| `DISTRACTOR_ONLY_VARIATION` | MEDIUM | 213 | Same lesson-local normalized text with mostly superficial option reshuffling / low learning gain variation | Vary sentence/context, not just option order. |
| `NEEDS_HUMAN_REVIEW` | MEDIUM | 0 | No unresolved bucket remained after this pass | No immediate action required. |

### 4.2 What The 439 Warnings Actually Mean

The 439 warnings are not 439 equally severe content failures.

The stronger interpretation is:

- 67 are high-value exact duplicates.
- 213 are medium-severity low-gain repeats where the sentence shell stays the same and only the distractor arrangement changes.
- 159 are structurally acceptable repetitions for speed or review use cases.
- 0 required escalation into a separate manual-review bucket under the current heuristic pass.

That means the warning count is real, but it overstates the number of truly blocking duplicates.

## 5. Warning Distribution By File

| File | Warning Count | Read |
| --- | --- | --- |
| `questions_v1a.json` | 140 | Highest local repetition pressure. |
| `questions_v1b.json` | 54 | Repeated recruiting / manager-review shells. |
| `questions_v1c.json` | 56 | Same issue pattern continues into finance / contracts set. |
| `questions_v1d.json` | 56 | Communication / travel set has multiple recycled shells. |
| `questions_v1e.json` | 55 | Facilities / maintenance set still shows repeated shells. |
| `questions_v1f.json` | 78 | Repetition is expected in speed drills, but still concentrated in a few shells. |

## 6. Top 20 Repeated Hotspots

This section is broader than the 439 raw warnings. It groups by normalized sentence body after removing the context prefix before `:`.

| Rank | Normalized Stem Pattern | Count | Category | Representative Lessons | Audit Read |
| --- | --- | --- | --- | --- | --- |
| 1 | `the manager reviewed the ____ before approving the request` | 187 | `SAME_STEM_DIFFERENT_OPTIONS` | `V1-B-21` to `V1-B-26`, plus `V1-C-31`, `V1-D-41`, `V1-F-*` | The single biggest template hotspot in V1. |
| 2 | `the ____ report was sent to the department manager` | 36 | `SAME_STEM_DIFFERENT_OPTIONS` | `V1-B-21` to `V1-B-25`, `V1-C-31` | High reuse with limited situational change. |
| 3 | `the committee reviewed the marketing ____ before lunch` | 35 | `TEMPLATE_SIMILARITY` | `V1-D-37` to `V1-D-42`, `V1-E-*`, `V1-F-*` | Reads formulaic across multiple lessons. |
| 4 | `guests will receive a booking ____ by email` | 34 | `TEMPLATE_SIMILARITY` | `V1-D-38` to `V1-D-43`, `V1-E-*`, `V1-F-*` | Reused too broadly for one shell. |
| 5 | `the editor requested one final ____ before printing` | 32 | `TEMPLATE_SIMILARITY` | `V1-D-40` to `V1-E-45`, `V1-F-*` | Good business shell, but overused. |
| 6 | `the analyst checked the figures ____ before sending them` | 30 | `SAME_STEM_DIFFERENT_OPTIONS` | `V1-A-11` to `V1-A-16` | Early V1-A template cluster. |
| 7 | `the company wants to improve operational ____` | 30 | `SAME_STEM_DIFFERENT_OPTIONS` | `V1-A-11` to `V1-A-16` | Another V1-A cluster with minimal situational spread. |
| 8 | `the old process was considered ____ by the audit team` | 30 | `SAME_STEM_DIFFERENT_OPTIONS` | `V1-A-11` to `V1-A-16` | Reused too directly across sibling items. |
| 9 | `the project depends on the ____ of the supplier` | 30 | `SAME_STEM_DIFFERENT_OPTIONS` | `V1-A-11` to `V1-A-16` | Same shell appears across six lessons. |
| 10 | `the report seems ____ after the final review` | 30 | `SAME_STEM_DIFFERENT_OPTIONS` | `V1-A-11` to `V1-A-16` | Exact shell reuse is visible even without tooling. |
| 11 | `the warehouse improved product ____ to regional stores` | 30 | `TEMPLATE_SIMILARITY` | `V1-D-41` to `V1-E-46`, `V1-F-*` | Good domain fit, but repeated too often. |
| 12 | `customers will receive a text ____ when the order ships` | 25 | `TEMPLATE_SIMILARITY` | `V1-D-39`, `V1-F-55`, `V1-F-58`, `V1-F-61`, `V1-F-64`, `V1-F-67` | Often reintroduced with only label changes. |
| 13 | `the hotel reported a sharp increase in ____ after the summer promotion` | 25 | `TEMPLATE_SIMILARITY` | `V1-C-32`, `V1-F-53`, `V1-F-56`, `V1-F-59`, `V1-F-62`, `V1-F-65` | Strong example of cross-mode recycling. |
| 14 | `please complete the online ____ before the recruitment deadline` | 23 | `TEMPLATE_SIMILARITY` | `V1-B-23`, `V1-B-25`, `V1-B-26`, `V1-C-29`, `V1-F-53`, `V1-F-56` | Useful shell, but appears too many times. |
| 15 | `the agency offers ____ services for recent graduates` | 23 | `TEMPLATE_SIMILARITY` | `V1-B-22`, `V1-B-26`, `V1-B-27`, `V1-C-29`, `V1-F-54`, `V1-F-57` | Cross-lesson templating is obvious. |
| 16 | `the hospital expanded its nurse ____ campaign this year` | 23 | `TEMPLATE_SIMILARITY` | `V1-B-26`, `V1-F-53`, `V1-F-56`, `V1-F-59`, `V1-F-62`, `V1-F-65` | Over-reused shell in recruiting / healthcare cluster. |
| 17 | `the recruiter reviewed the applicants ____ before scheduling the final interview` | 23 | `TEMPLATE_SIMILARITY` | `V1-B-21`, `V1-B-27`, `V1-B-28`, `V1-C-31`, `V1-F-55`, `V1-F-58` | Same recruiting shell keeps returning. |
| 18 | `the factory manager reviewed the daily ____ schedule` | 22 | `TEMPLATE_SIMILARITY` | `V1-E-48`, `V1-F-55`, `V1-F-58`, `V1-F-61`, `V1-F-64`, `V1-F-67` | Feels copied into speed mode from core lessons. |
| 19 | `the sales team prepared a new ____ for the summer catalog` | 22 | `TEMPLATE_SIMILARITY` | `V1-B-24`, `V1-B-25`, `V1-B-28`, `V1-F-55`, `V1-F-58`, `V1-F-61` | High reuse for one merchandising shell. |
| 20 | `the task was completed ____ by the coordinator` | 22 | `ACCEPTABLE_SPEED_REPETITION` | `V1-F-53` to `V1-F-58` | Reasonable for speed mode, but still concentrated. |

## 7. Error Code Audit

| Error Code | Count | Observed Question Types | Audit Read |
| --- | --- | --- | --- |
| `WORD_FAMILY_POS` | 978 | `collocation`, `part5_sentence_completion`, `review_question`, `speed_drill`, `word_family` | Broad but mostly reasonable for V1 word-family content. |
| `TIME_PRESSURE` | 720 | `speed_drill` | Cleanly scoped to V1-F speed drills. |
| `VOCAB_WEAK_RECALL` | 30 | `meaning_choice` | Narrow and reasonable. |

Important nuance:

- `questions_v1f.json` speed drills use `TIME_PRESSURE` consistently.
- `questions_v1a.json` also contains 30 `speed_drill` items, but those still use `WORD_FAMILY_POS`.
- That is not a blocker, but it does blur analytics if all speed-style content is expected to report as time pressure.

## 8. Estimated Time Audit

| Question Type | Min | Max | Average | Audit Read |
| --- | --- | --- | --- | --- |
| `collocation` | 15 | 15 | 15.00 | No immediate concern. |
| `meaning_choice` | 10 | 10 | 10.00 | Slightly aggressive, but not clearly broken. |
| `part5_sentence_completion` | 20 | 20 | 20.00 | No immediate concern. |
| `review_question` | 12 | 20 | 14.55 | No immediate concern. |
| `speed_drill` | 8 | 8 | 8.00 | Matches V1-F intent. |
| `word_family` | 20 | 20 | 20.00 | No immediate concern. |

No major estimated-time defect was found in this pass.

## 9. 90-Question Naturalness Sample

### 9.1 Sample Method

- `questions_v1a.json`: 10 sampled rows
- `questions_v1b.json`: 15 sampled rows
- `questions_v1c.json`: 15 sampled rows
- `questions_v1d.json`: 15 sampled rows
- `questions_v1e.json`: 15 sampled rows
- `questions_v1f.json`: 20 sampled rows

This was a deterministic spread sample, not a random sample.

### 9.2 Sample Summary

| Issue Type | Count | Read |
| --- | --- | --- |
| `too_template_like` | 61 | Main problem in the sample. The issue is usually repetition, not broken English. |
| `acceptable` | 29 | Generic but workable. |
| `weak_distractors` | 0 | No strong blocker found in the sampled rows. |
| `wrong_explanation` | 0 | No clear blocker found in the sampled rows. |
| `wrong_error_code` | 0 | No clear blocker found in the sampled rows. |
| `bad_estimated_time` | 0 | No clear blocker found in the sampled rows. |
| `unclear_context` | 0 | Usually the bigger issue was repetition, not incomprehensibility. |
| `needs_human_review` | 0 | No separate escalation bucket needed for this sample pass. |

Short conclusion from the sample:

- The dominant quality issue is template overuse.
- Most items are still answerable and structurally aligned to the target form.
- The problem is more pedagogical variety than outright correctness.

### 9.3 Sample Table

| question_id | lesson_id | type | short_text | issue_type | comment | recommended_fix |
| --- | --- | --- | --- | --- | --- | --- |
| v1_a_11_q_001 | V1-A-11 | word_family | The report seems ______ after the final review. | too_template_like | This exact sentence shell appears repeatedly, so the item feels formulaic. | Rewrite one or more sibling items to reduce full-stem repetition. |
| v1_a_12_q_001 | V1-A-12 | word_family | The report seems ______ after the final review. | too_template_like | This exact sentence shell appears repeatedly, so the item feels formulaic. | Rewrite one or more sibling items to reduce full-stem repetition. |
| v1_a_13_q_001 | V1-A-13 | word_family | The report seems ______ after the final review. | too_template_like | This exact sentence shell appears repeatedly, so the item feels formulaic. | Rewrite one or more sibling items to reduce full-stem repetition. |
| v1_a_14_q_001 | V1-A-14 | word_family | The report seems ______ after the final review. | too_template_like | This exact sentence shell appears repeatedly, so the item feels formulaic. | Rewrite one or more sibling items to reduce full-stem repetition. |
| v1_a_15_q_001 | V1-A-15 | word_family | The report seems ______ after the final review. | too_template_like | This exact sentence shell appears repeatedly, so the item feels formulaic. | Rewrite one or more sibling items to reduce full-stem repetition. |
| v1_a_16_q_001 | V1-A-16 | word_family | The report seems ______ after the final review. | too_template_like | This exact sentence shell appears repeatedly, so the item feels formulaic. | Rewrite one or more sibling items to reduce full-stem repetition. |
| v1_a_17_q_001 | V1-A-17 | word_family | The report seems ______ after the final review. | too_template_like | This exact sentence shell appears repeatedly, so the item feels formulaic. | Rewrite one or more sibling items to reduce full-stem repetition. |
| v1_a_18_q_001 | V1-A-18 | word_family | The report seems ______ after the final review. | too_template_like | This exact sentence shell appears repeatedly, so the item feels formulaic. | Rewrite one or more sibling items to reduce full-stem repetition. |
| v1_a_19_q_001 | V1-A-19 | word_family | The report seems ______ after the final review. | too_template_like | This exact sentence shell appears repeatedly, so the item feels formulaic. | Rewrite one or more sibling items to reduce full-stem repetition. |
| v1_a_20_q_001 | V1-A-20 | word_family | The report seems ______ after the final review. | too_template_like | This exact sentence shell appears repeatedly, so the item feels formulaic. | Rewrite one or more sibling items to reduce full-stem repetition. |
| v1_b_21_q_001 | V1-B-21 | word_family | Recruiting: The recruiter reviewed the applicant's ______ before ... | too_template_like | This exact sentence shell appears repeatedly, so the item feels formulaic. | Rewrite one or more sibling items to reduce full-stem repetition. |
| v1_b_21_q_013 | V1-B-21 | part5_sentence_completion | Interviews: The recruiter reviewed the applicant's ______ before ... | too_template_like | This exact sentence shell appears repeatedly, so the item feels formulaic. | Rewrite one or more sibling items to reduce full-stem repetition. |
| v1_b_22_q_002 | V1-B-22 | word_family | Staffing: The retailer plans to ______ ten temporary workers in D... | too_template_like | This exact sentence shell appears repeatedly, so the item feels formulaic. | Rewrite one or more sibling items to reduce full-stem repetition. |
| v1_b_22_q_015 | V1-B-22 | word_family | HR: The ______ must provide safety training to all staff. | acceptable | Business context is generic but still serviceable for the target form check. | No immediate change required. |
| v1_b_23_q_004 | V1-B-23 | word_family | Forms: Please complete the online ______ before the recruitment d... | too_template_like | This exact sentence shell appears repeatedly, so the item feels formulaic. | Rewrite one or more sibling items to reduce full-stem repetition. |
| v1_b_23_q_017 | V1-B-23 | word_family | Hotel: The manager reviewed the ______ before approving the request. | too_template_like | This exact sentence shell appears repeatedly, so the item feels formulaic. | Rewrite one or more sibling items to reduce full-stem repetition. |
| v1_b_24_q_005 | V1-B-24 | word_family | HR Advancement: The sales team prepared a new ______ for the summ... | too_template_like | This exact sentence shell appears repeatedly, so the item feels formulaic. | Rewrite one or more sibling items to reduce full-stem repetition. |
| v1_b_24_q_018 | V1-B-24 | part5_sentence_completion | Supervision: The manager reviewed the ______ before approving the... | too_template_like | This exact sentence shell appears repeatedly, so the item feels formulaic. | Rewrite one or more sibling items to reduce full-stem repetition. |
| v1_b_25_q_007 | V1-B-25 | word_family | HR Review: The supervisor completed an employee ______ after the ... | too_template_like | This exact sentence shell appears repeatedly, so the item feels formulaic. | Rewrite one or more sibling items to reduce full-stem repetition. |
| v1_b_25_q_020 | V1-B-25 | word_family | Supervision: The manager reviewed the ______ before approving the... | too_template_like | This exact sentence shell appears repeatedly, so the item feels formulaic. | Rewrite one or more sibling items to reduce full-stem repetition. |
| v1_b_26_q_009 | V1-B-26 | word_family | Job Fairs: The hospital expanded its nurse ______ campaign this y... | too_template_like | This exact sentence shell appears repeatedly, so the item feels formulaic. | Rewrite one or more sibling items to reduce full-stem repetition. |
| v1_b_26_rv_021 | V1-B-26 | review_question | HR: Quick review: choose the correct recruit word-family form. Th... | acceptable | Review item is acceptable for reinforcement within current V1 scope. | No immediate change required. |
| v1_b_27_q_010 | V1-B-27 | word_family | Orientation: The consultant will ______ the accounting staff on t... | acceptable | Business context is generic but still serviceable for the target form check. | No immediate change required. |
| v1_b_27_rv_023 | V1-B-27 | review_question | Office Systems: Quick review: choose the correct train word-famil... | acceptable | Review item is acceptable for reinforcement within current V1 scope. | No immediate change required. |
| v1_b_28_q_012 | V1-B-28 | word_family | Professional Licenses: The technician must renew his safety _____... | too_template_like | This exact sentence shell appears repeatedly, so the item feels formulaic. | Rewrite one or more sibling items to reduce full-stem repetition. |
| v1_c_29_q_001 | V1-C-29 | word_family | Banking: The director of ______ approved the annual spending plan. | too_template_like | This exact sentence shell appears repeatedly, so the item feels formulaic. | Rewrite one or more sibling items to reduce full-stem repetition. |
| v1_c_29_q_013 | V1-C-29 | part5_sentence_completion | Budgets: The project is ______ risky for a small branch. | acceptable | Business context is generic but still serviceable for the target form check. | No immediate change required. |
| v1_c_30_q_002 | V1-C-30 | word_family | Banks: The company plans to ______ in energy-efficient lighting. | acceptable | Business context is generic but still serviceable for the target form check. | No immediate change required. |
| v1_c_30_q_015 | V1-C-30 | word_family | Finance: The ______ requested a copy of the audited statement. | acceptable | Business context is generic but still serviceable for the target form check. | No immediate change required. |
| v1_c_31_q_004 | V1-C-31 | word_family | Planning: The manager reduced travel costs to meet the annual ___... | too_template_like | This exact sentence shell appears repeatedly, so the item feels formulaic. | Rewrite one or more sibling items to reduce full-stem repetition. |
| v1_c_31_q_017 | V1-C-31 | word_family | Airline: The manager reviewed the ______ before approving the req... | too_template_like | This exact sentence shell appears repeatedly, so the item feels formulaic. | Rewrite one or more sibling items to reduce full-stem repetition. |
| v1_c_32_q_005 | V1-C-32 | word_family | Hospitality: The hotel reported a sharp increase in ______ after ... | too_template_like | This exact sentence shell appears repeatedly, so the item feels formulaic. | Rewrite one or more sibling items to reduce full-stem repetition. |
| v1_c_32_q_018 | V1-C-32 | part5_sentence_completion | Pricing: The manager reviewed the ______ before approving the req... | too_template_like | This exact sentence shell appears repeatedly, so the item feels formulaic. | Rewrite one or more sibling items to reduce full-stem repetition. |
| v1_c_33_q_007 | V1-C-33 | word_family | Reports: The accountant questioned one travel ______ on the report. | too_template_like | This exact sentence shell appears repeatedly, so the item feels formulaic. | Rewrite one or more sibling items to reduce full-stem repetition. |
| v1_c_33_q_020 | V1-C-33 | word_family | Branches: The manager reviewed the ______ before approving the re... | too_template_like | This exact sentence shell appears repeatedly, so the item feels formulaic. | Rewrite one or more sibling items to reduce full-stem repetition. |
| v1_c_34_q_009 | V1-C-34 | word_family | Accounting: The annual ______ found several missing receipts. | too_template_like | This exact sentence shell appears repeatedly, so the item feels formulaic. | Rewrite one or more sibling items to reduce full-stem repetition. |
| v1_c_34_rv_021 | V1-C-34 | review_question | Records: Quick review: choose the correct audit word-family form.... | acceptable | Review item is acceptable for reinforcement within current V1 scope. | No immediate change required. |
| v1_c_35_q_010 | V1-C-35 | word_family | Legal: The airline will ______ a local company to clean the aircr... | too_template_like | This exact sentence shell appears repeatedly, so the item feels formulaic. | Rewrite one or more sibling items to reduce full-stem repetition. |
| v1_c_35_rv_023 | V1-C-35 | review_question | Procurement: Quick review: choose the correct contract word-famil... | acceptable | Review item is acceptable for reinforcement within current V1 scope. | No immediate change required. |
| v1_c_36_q_012 | V1-C-36 | word_family | Regulations: The bank hired a consultant to improve policy ______. | too_template_like | This exact sentence shell appears repeatedly, so the item feels formulaic. | Rewrite one or more sibling items to reduce full-stem repetition. |
| v1_d_37_q_001 | V1-D-37 | word_family | Meetings: The committee reviewed the marketing ______ before lunch. | too_template_like | This exact sentence shell appears repeatedly, so the item feels formulaic. | Rewrite one or more sibling items to reduce full-stem repetition. |
| v1_d_37_q_013 | V1-D-37 | part5_sentence_completion | Emails: The committee reviewed the marketing ______ before lunch. | too_template_like | This exact sentence shell appears repeatedly, so the item feels formulaic. | Rewrite one or more sibling items to reduce full-stem repetition. |
| v1_d_38_q_002 | V1-D-38 | word_family | Appointments: Please ______ your flight number with the travel desk. | acceptable | Business context is generic but still serviceable for the target form check. | No immediate change required. |
| v1_d_38_q_015 | V1-D-38 | word_family | Hotels: Guests will receive a booking ______ by email. | too_template_like | This exact sentence shell appears repeatedly, so the item feels formulaic. | Rewrite one or more sibling items to reduce full-stem repetition. |
| v1_d_39_q_004 | V1-D-39 | word_family | Airlines: Customers will receive a text ______ when the order ships. | too_template_like | This exact sentence shell appears repeatedly, so the item feels formulaic. | Rewrite one or more sibling items to reduce full-stem repetition. |
| v1_d_39_q_017 | V1-D-39 | word_family | Hotels: Guests will receive a booking ______ by email. | too_template_like | This exact sentence shell appears repeatedly, so the item feels formulaic. | Rewrite one or more sibling items to reduce full-stem repetition. |
| v1_d_40_q_005 | V1-D-40 | word_family | Invoices: The editor requested one final ______ before printing. | too_template_like | This exact sentence shell appears repeatedly, so the item feels formulaic. | Rewrite one or more sibling items to reduce full-stem repetition. |
| v1_d_40_q_018 | V1-D-40 | part5_sentence_completion | Airlines: The airline must ______ passengers about the delay. | too_template_like | This exact sentence shell appears repeatedly, so the item feels formulaic. | Rewrite one or more sibling items to reduce full-stem repetition. |
| v1_d_41_q_007 | V1-D-41 | word_family | Documents: The ______ handles medical supplies for local clinics. | too_template_like | This exact sentence shell appears repeatedly, so the item feels formulaic. | Rewrite one or more sibling items to reduce full-stem repetition. |
| v1_d_41_q_020 | V1-D-41 | word_family | Reports: The manager reviewed the ______ before approving the req... | too_template_like | This exact sentence shell appears repeatedly, so the item feels formulaic. | Rewrite one or more sibling items to reduce full-stem repetition. |
| v1_d_42_q_009 | V1-D-42 | word_family | Training: The sales team prepared a short ______ for the client. | too_template_like | This exact sentence shell appears repeatedly, so the item feels formulaic. | Rewrite one or more sibling items to reduce full-stem repetition. |
| v1_d_42_rv_021 | V1-D-42 | review_question | Sales Reports: Quick review: choose the correct present word-fami... | acceptable | Review item is acceptable for reinforcement within current V1 scope. | No immediate change required. |
| v1_d_43_q_010 | V1-D-43 | word_family | Emails: Remember to ______ the receipt to the expense report. | acceptable | Business context is generic but still serviceable for the target form check. | No immediate change required. |
| v1_d_43_rv_023 | V1-D-43 | review_question | Invoices: Quick review: choose the correct attach word-family for... | acceptable | Review item is acceptable for reinforcement within current V1 scope. | No immediate change required. |
| v1_d_44_q_012 | V1-D-44 | word_family | Support: The client expects a written ______ by the end of the day. | too_template_like | This exact sentence shell appears repeatedly, so the item feels formulaic. | Rewrite one or more sibling items to reduce full-stem repetition. |
| v1_e_45_q_001 | V1-E-45 | word_family | Facilities: The hotel scheduled elevator ______ for Tuesday morning. | too_template_like | This exact sentence shell appears repeatedly, so the item feels formulaic. | Rewrite one or more sibling items to reduce full-stem repetition. |
| v1_e_45_q_013 | V1-E-45 | part5_sentence_completion | Equipment: The hotel scheduled elevator ______ for Tuesday morning. | too_template_like | This exact sentence shell appears repeatedly, so the item feels formulaic. | Rewrite one or more sibling items to reduce full-stem repetition. |
| v1_e_46_q_002 | V1-E-46 | word_family | Facilities: A technician will ______ the air-conditioning unit to... | acceptable | Business context is generic but still serviceable for the target form check. | No immediate change required. |
| v1_e_46_q_015 | V1-E-46 | word_family | Safety: The ______ found a problem with the emergency lights. | acceptable | Business context is generic but still serviceable for the target form check. | No immediate change required. |
| v1_e_47_q_004 | V1-E-47 | word_family | Facilities: The newly ______ system requires a password. | acceptable | Business context is generic but still serviceable for the target form check. | No immediate change required. |
| v1_e_47_q_017 | V1-E-47 | word_family | Hotels: Guests will receive a booking ______ by email. | too_template_like | This exact sentence shell appears repeatedly, so the item feels formulaic. | Rewrite one or more sibling items to reduce full-stem repetition. |
| v1_e_48_q_005 | V1-E-48 | word_family | Facilities: The factory manager reviewed the daily ______ schedule. | too_template_like | This exact sentence shell appears repeatedly, so the item feels formulaic. | Rewrite one or more sibling items to reduce full-stem repetition. |
| v1_e_48_q_018 | V1-E-48 | part5_sentence_completion | Airlines: The airline must ______ passengers about the delay. | too_template_like | This exact sentence shell appears repeatedly, so the item feels formulaic. | Rewrite one or more sibling items to reduce full-stem repetition. |
| v1_e_49_q_007 | V1-E-49 | word_family | Service Requests: The copier needs a minor ______ before the audit. | too_template_like | This exact sentence shell appears repeatedly, so the item feels formulaic. | Rewrite one or more sibling items to reduce full-stem repetition. |
| v1_e_49_q_020 | V1-E-49 | word_family | Retail: The warehouse improved product ______ to regional stores. | too_template_like | This exact sentence shell appears repeatedly, so the item feels formulaic. | Rewrite one or more sibling items to reduce full-stem repetition. |
| v1_e_50_q_009 | V1-E-50 | word_family | Offices: The lobby ______ will be completed by September. | too_template_like | This exact sentence shell appears repeatedly, so the item feels formulaic. | Rewrite one or more sibling items to reduce full-stem repetition. |
| v1_e_50_rv_021 | V1-E-50 | review_question | Facilities: Quick review: choose the correct renovate word-family... | acceptable | Review item is acceptable for reinforcement within current V1 scope. | No immediate change required. |
| v1_e_51_q_010 | V1-E-51 | word_family | Training Rooms: The company will ______ each driver with a mobile... | acceptable | Business context is generic but still serviceable for the target form check. | No immediate change required. |
| v1_e_51_rv_023 | V1-E-51 | review_question | Warehouses: Quick review: choose the correct equip word-family fo... | acceptable | Review item is acceptable for reinforcement within current V1 scope. | No immediate change required. |
| v1_e_52_q_012 | V1-E-52 | word_family | Quality Control: Only ______ instruments may be used for the test. | acceptable | Business context is generic but still serviceable for the target form check. | No immediate change required. |
| v1_f_53_q_001 | V1-F-53 | speed_drill | Finance: The manager reviewed the ______ before approving the req... | too_template_like | Speed shell recurs across enough items that it starts to feel mechanical. | Keep speed mode, but diversify stem shells in future cleanup. |
| v1_f_53_q_037 | V1-F-53 | speed_drill | Legal: The supplier is ______ required to replace defective items. | acceptable | Fast-response item is generic but workable for V1-F speed practice. | No immediate change required. |
| v1_f_54_q_033 | V1-F-54 | speed_drill | Compliance: The annual ______ found several missing receipts. | too_template_like | Speed shell recurs across enough items that it starts to feel mechanical. | Keep speed mode, but diversify stem shells in future cleanup. |
| v1_f_55_q_029 | V1-F-55 | speed_drill | Travel: The accountant questioned one travel ______ on the report. | too_template_like | Speed shell recurs across enough items that it starts to feel mechanical. | Keep speed mode, but diversify stem shells in future cleanup. |
| v1_f_56_q_025 | V1-F-56 | speed_drill | Hospitality: The hotel reported a sharp increase in ______ after ... | too_template_like | Speed shell recurs across enough items that it starts to feel mechanical. | Keep speed mode, but diversify stem shells in future cleanup. |
| v1_f_57_q_021 | V1-F-57 | speed_drill | Office Spending: The manager reduced travel costs to meet the ann... | acceptable | Fast-response item is generic but workable for V1-F speed practice. | No immediate change required. |
| v1_f_58_q_017 | V1-F-58 | speed_drill | Finance: The committee approved a major ______ in new medical equ... | acceptable | Fast-response item is generic but workable for V1-F speed practice. | No immediate change required. |
| v1_f_59_q_013 | V1-F-59 | speed_drill | Budgets: The project is ______ risky for a small branch. | acceptable | Fast-response item is generic but workable for V1-F speed practice. | No immediate change required. |
| v1_f_60_q_009 | V1-F-60 | speed_drill | Training: The technician must renew his safety ______ every two y... | too_template_like | Speed shell recurs across enough items that it starts to feel mechanical. | Keep speed mode, but diversify stem shells in future cleanup. |
| v1_f_61_q_005 | V1-F-61 | speed_drill | Office Systems: The company scheduled safety ______ for warehouse... | too_template_like | Speed shell recurs across enough items that it starts to feel mechanical. | Keep speed mode, but diversify stem shells in future cleanup. |
| v1_f_62_q_001 | V1-F-62 | speed_drill | Recruiting: The hospital expanded its nurse ______ campaign this ... | too_template_like | Speed shell recurs across enough items that it starts to feel mechanical. | Keep speed mode, but diversify stem shells in future cleanup. |
| v1_f_62_q_037 | V1-F-62 | speed_drill | Hotels: The lobby ______ will be completed by September. | acceptable | Fast-response item is generic but workable for V1-F speed practice. | No immediate change required. |
| v1_f_63_q_033 | V1-F-63 | speed_drill | Office Equipment: The copier needs a minor ______ before the audit. | too_template_like | Speed shell recurs across enough items that it starts to feel mechanical. | Keep speed mode, but diversify stem shells in future cleanup. |
| v1_f_64_q_029 | V1-F-64 | speed_drill | Operations: The factory manager reviewed the daily ______ schedule. | too_template_like | Speed shell recurs across enough items that it starts to feel mechanical. | Keep speed mode, but diversify stem shells in future cleanup. |
| v1_f_65_q_025 | V1-F-65 | speed_drill | Security Systems: The software ______ will take about thirty minu... | acceptable | Fast-response item is generic but workable for V1-F speed practice. | No immediate change required. |
| v1_f_66_q_021 | V1-F-66 | speed_drill | Restaurants: The restaurant passed its annual safety ______. | too_template_like | Speed shell recurs across enough items that it starts to feel mechanical. | Keep speed mode, but diversify stem shells in future cleanup. |
| v1_f_67_q_017 | V1-F-67 | speed_drill | Facilities: The hotel scheduled elevator ______ for Tuesday morning. | acceptable | Fast-response item is generic but workable for V1-F speed practice. | No immediate change required. |
| v1_f_68_q_013 | V1-F-68 | speed_drill | Emails: The client expects a written ______ by the end of the day. | too_template_like | Speed shell recurs across enough items that it starts to feel mechanical. | Keep speed mode, but diversify stem shells in future cleanup. |
| v1_f_69_q_009 | V1-F-69 | speed_drill | Documents: Please open the email ______ for the revised contract. | acceptable | Fast-response item is generic but workable for V1-F speed practice. | No immediate change required. |
| v1_f_70_q_005 | V1-F-70 | speed_drill | Sales Reports: The sales team prepared a short ______ for the cli... | acceptable | Fast-response item is generic but workable for V1-F speed practice. | No immediate change required. |

## 10. Verdict

### 10.1 Structural Verdict

PASS.

- No duplicate `question_id` issues were found.
- No missing required-field problems were found.
- Answer distribution remains balanced.
- Estimated times are internally consistent.

### 10.2 Pedagogical Verdict

PARTIAL.

The central V1 quality problem is not catastrophic grammatical failure.

It is over-reliance on a relatively small set of sentence shells, especially in:

- V1-A template clusters
- V1-B to V1-E manager-review / booking / marketing / printing / shipment shells
- V1-F speed drills that inherit or repeat those same shells

## 11. Recommendations

1. Prioritize the 67 `EXACT_DUPLICATE` rows first if a cleanup round is approved.
2. After that, reduce the highest-value subset of the 213 `DISTRACTOR_ONLY_VARIATION` rows, especially where only option order changes.
3. Leave `ACCEPTABLE_REVIEW_REPETITION` mostly alone for now.
4. Leave most V1-F speed repetition alone for now, but trim the top 5 shell families before using V1 as a pattern source for future content.
5. If analytics needs cleaner speed-drill reporting, normalize the 30 V1-A `speed_drill` rows that still use `WORD_FAMILY_POS` instead of `TIME_PRESSURE`.
6. Do not expand V2-V6 until the project decides whether V1 should remain as-is or receive a low-risk duplicate cleanup batch.
