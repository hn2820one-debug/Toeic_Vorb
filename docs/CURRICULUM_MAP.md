# Curriculum Map

Status: HISTORICAL SNAPSHOT FROM THE PRE-CLEAR 2026-05-17 SEED

This document describes Program B only: TOEIC Vocabulary Tracker in `C:\Users\Keith\Toeic\toeic-app-Vorb`. It does not describe the separate Grammar / PoS App.

Current production truth now lives in root `TO_AI.md`: the production seed currently has the first rebuilt wave, `V2-A-71`, with 1 runnable lesson and 24 question-bank rows. The lesson and stage listings below are retained as a historical/reference snapshot of the last populated V0-V3 production seed before the full-bank clear and should not be treated as current production counts.

## Historical Summary (snapshot updated 2026-05-17)

- Vocabulary lessons: 193 (was 180)
- Vocabulary questions: 4,399 (was 4,608 — 826 duplicates replaced, 200 types corrected, V0 consolidated)
- V0: **1 lesson, 31 questions** (was 10 lessons, 240 questions — consolidated to 1 diagnostic lesson)
- V1: 60 lessons, 1,728 questions
- V2: 60 lessons, 1,200 questions (was 50 — +10 mixed_review lessons added)
- V3: 72 lessons, 1,440 questions (was 60 — +12 mixed_review lessons added)
- Seed version: `toeic_vocab_tracker_quality_fixed_2026_05_17`
- Duplicates: **0** (was 826)
- Audit: `✅ PASSED` — `node scripts/audit-quality-full.js`
- Question files: questions_v0.json, questions_v1a.json, questions_v1b.json, questions_v1c.json, questions_v1d.json, questions_v1e.json, questions_v1f.json, questions_v2a.json, questions_v2b.json, questions_v2c.json, questions_v2d.json, questions_v2e.json, questions_v3a.json, questions_v3b.json, questions_v3c.json, questions_v3d.json, questions_v3e.json, questions_v3f.json

## Historical Stage Status

| stage | stage_name | total_lessons | questions | status |
|---|---|---:|---:|---|
| V0 | Diagnosis | 1 | 31 | available |
| V1 | Word Family | 60 | 1,728 | available |
| V2 | TOEIC Scene Vocabulary | 60 | 1,200 | available |
| V3 | Collocation | 72 | 1,440 | available |
| V4 | Formal Phrase | 50 | 0 | planned |
| V5 | False Friends + Speed Reflex | 50 | 0 | planned |
| V6 | Integrated Review + Seal Test | 40 | 0 | planned |

## Historical Lesson Listing

| stage | lesson_id | title | type | vocabulary_focus | grammar_link_id | question_count | status | source_file |
|---|---|---|---|---|---|---:|---|---|
| V0 | V0-1 | V0 Baseline Vocabulary Diagnostic | diagnostic | assessment, baseline, estimate, target |  | 24 | IMPLEMENTED_PROGRAM_B | data/vocab/curriculum.json |
| V0 | V0-2 | Meaning Recall Diagnostic | meaning_choice | invoice, shipment, venue, refund |  | 24 | IMPLEMENTED_PROGRAM_B | data/vocab/curriculum.json |
| V0 | V0-3 | TOEIC Scene Vocabulary Diagnostic | scene_vocabulary | conference, reservation, maintenance, recruitment |  | 24 | IMPLEMENTED_PROGRAM_B | data/vocab/curriculum.json |
| V0 | V0-4 | Collocation Diagnostic | collocation | make arrangements, submit a report, meet a deadline, place an order |  | 24 | IMPLEMENTED_PROGRAM_B | data/vocab/curriculum.json |
| V0 | V0-5 | Formal Phrase Diagnostic | formal_phrase | regarding, in accordance with, prior to, on behalf of |  | 24 | IMPLEMENTED_PROGRAM_B | data/vocab/curriculum.json |
| V0 | V0-6 | False Friends Diagnostic | false_friend | actual, eventually, currently, sensible |  | 24 | IMPLEMENTED_PROGRAM_B | data/vocab/curriculum.json |
| V0 | V0-7 | Part 5 Speed Diagnostic | part5_sentence_completion | complete, confirm, process, approve |  | 24 | IMPLEMENTED_PROGRAM_B | data/vocab/curriculum.json |
| V0 | V0-8 | Part 6 Context Diagnostic | part6_context_choice | notice, policy, schedule, procedure |  | 24 | IMPLEMENTED_PROGRAM_B | data/vocab/curriculum.json |
| V0 | V0-9 | Mixed Interference Diagnostic | speed_drill | accurate, available, efficient, responsible |  | 24 | IMPLEMENTED_PROGRAM_B | data/vocab/curriculum.json |
| V0 | V0-10 | V0 Seal Check | diagnostic | review, priority, weakness, mastery |  | 24 | IMPLEMENTED_PROGRAM_B | data/vocab/curriculum.json |
| V1 | V1-A-11 | accurate word family | word_family | accuracy, accurate, accurately, inaccuracy | SVC_LINKING_VERB_ADJ | 24 | IMPLEMENTED_PROGRAM_B | data/vocab/curriculum.json |
| V1 | V1-A-12 | efficient word family | word_family | efficiency, efficient, efficiently, inefficiency | ADV_MODIFIES_VERB | 24 | IMPLEMENTED_PROGRAM_B | data/vocab/curriculum.json |
| V1 | V1-A-13 | responsible word family | word_family | responsibility, responsible, responsibly, irresponsible | ADJ_AFTER_BE | 24 | IMPLEMENTED_PROGRAM_B | data/vocab/curriculum.json |
| V1 | V1-A-14 | available word family | word_family | availability, available, unavailable, availably | ADJ_AFTER_BE | 24 | IMPLEMENTED_PROGRAM_B | data/vocab/curriculum.json |
| V1 | V1-A-15 | successful word family | word_family | success, successful, successfully, unsuccessful | ADV_MODIFIES_VERB | 24 | IMPLEMENTED_PROGRAM_B | data/vocab/curriculum.json |
| V1 | V1-A-16 | reliable word family | word_family | reliability, reliable, reliably, unreliable | ADJ_BEFORE_NOUN | 24 | IMPLEMENTED_PROGRAM_B | data/vocab/curriculum.json |
| V1 | V1-A-17 | productive word family | word_family | productivity, productive, productively, unproductive | ADJ_AFTER_LINKING_VERB | 24 | IMPLEMENTED_PROGRAM_B | data/vocab/curriculum.json |
| V1 | V1-A-18 | competitive word family | word_family | competition, competitive, competitively, competitiveness | ADJ_BEFORE_NOUN | 24 | IMPLEMENTED_PROGRAM_B | data/vocab/curriculum.json |
| V1 | V1-A-19 | profitable word family | word_family | profitability, profitable, profitably, profit | ADJ_AFTER_LINKING_VERB | 24 | IMPLEMENTED_PROGRAM_B | data/vocab/curriculum.json |
| V1 | V1-A-20 | secure word family | word_family | security, secure, securely, insecure | ADJ_AFTER_BE | 24 | IMPLEMENTED_PROGRAM_B | data/vocab/curriculum.json |
| V1 | V1-B-21 | qualify word family | word_family | qualify, qualification, qualified | WORD_FAMILY_VERB_NOUN_ADJ | 24 | IMPLEMENTED_PROGRAM_B | data/vocab/curriculum.json |
| V1 | V1-B-22 | employ word family | word_family | employ, employment, employer, employee, employed | WORD_FAMILY_VERB_NOUN_ADJ | 24 | IMPLEMENTED_PROGRAM_B | data/vocab/curriculum.json |
| V1 | V1-B-23 | apply word family | word_family | apply, application, applicant, applicable | WORD_FAMILY_VERB_NOUN_ADJ | 24 | IMPLEMENTED_PROGRAM_B | data/vocab/curriculum.json |
| V1 | V1-B-24 | promote word family | word_family | promote, promotion, promotional | WORD_FAMILY_VERB_NOUN_ADJ | 24 | IMPLEMENTED_PROGRAM_B | data/vocab/curriculum.json |
| V1 | V1-B-25 | assess word family | word_family | assess, assessment | WORD_FAMILY_VERB_NOUN | 24 | IMPLEMENTED_PROGRAM_B | data/vocab/curriculum.json |
| V1 | V1-B-26 | recruit word family | word_family | recruit, recruitment, recruiter | WORD_FAMILY_VERB_NOUN | 24 | IMPLEMENTED_PROGRAM_B | data/vocab/curriculum.json |
| V1 | V1-B-27 | train word family | word_family | train, training, trainer, trained | WORD_FAMILY_VERB_NOUN_ADJ | 24 | IMPLEMENTED_PROGRAM_B | data/vocab/curriculum.json |
| V1 | V1-B-28 | certify word family | word_family | certify, certification, certified | WORD_FAMILY_VERB_NOUN_ADJ | 24 | IMPLEMENTED_PROGRAM_B | data/vocab/curriculum.json |
| V1 | V1-C-29 | finance word family | word_family | finance, financial, financially | WORD_FAMILY_NOUN_ADJ_ADV | 24 | IMPLEMENTED_PROGRAM_B | data/vocab/curriculum.json |
| V1 | V1-C-30 | invest word family | word_family | invest, investment, investor | WORD_FAMILY_VERB_NOUN | 24 | IMPLEMENTED_PROGRAM_B | data/vocab/curriculum.json |
| V1 | V1-C-31 | budget word family | word_family | budget, budgetary | WORD_FAMILY_NOUN_ADJ | 24 | IMPLEMENTED_PROGRAM_B | data/vocab/curriculum.json |
| V1 | V1-C-32 | revenue word family | word_family | revenue | WORD_FAMILY_NOUN_USAGE | 24 | IMPLEMENTED_PROGRAM_B | data/vocab/curriculum.json |
| V1 | V1-C-33 | expense word family | word_family | expense, expensive | WORD_FAMILY_NOUN_ADJ | 24 | IMPLEMENTED_PROGRAM_B | data/vocab/curriculum.json |
| V1 | V1-C-34 | audit word family | word_family | audit, auditor, audited | WORD_FAMILY_NOUN_VERB | 24 | IMPLEMENTED_PROGRAM_B | data/vocab/curriculum.json |
| V1 | V1-C-35 | contract word family | word_family | contract, contractual, contractually | WORD_FAMILY_NOUN_ADJ_ADV | 24 | IMPLEMENTED_PROGRAM_B | data/vocab/curriculum.json |
| V1 | V1-C-36 | comply word family | word_family | comply, compliance, compliant | WORD_FAMILY_VERB_NOUN_ADJ | 24 | IMPLEMENTED_PROGRAM_B | data/vocab/curriculum.json |
| V1 | V1-D-37 | propose word family | word_family | propose, proposal, proposed | WORD_FAMILY_VERB_NOUN_ADJ | 24 | IMPLEMENTED_PROGRAM_B | data/vocab/curriculum.json |
| V1 | V1-D-38 | confirm word family | word_family | confirm, confirmation, confirmed | WORD_FAMILY_VERB_NOUN_ADJ | 24 | IMPLEMENTED_PROGRAM_B | data/vocab/curriculum.json |
| V1 | V1-D-39 | notify word family | word_family | notify, notification, notice | WORD_FAMILY_VERB_NOUN | 24 | IMPLEMENTED_PROGRAM_B | data/vocab/curriculum.json |
| V1 | V1-D-40 | revise word family | word_family | revise, revision, revised | WORD_FAMILY_VERB_NOUN_ADJ | 24 | IMPLEMENTED_PROGRAM_B | data/vocab/curriculum.json |
| V1 | V1-D-41 | distribute word family | word_family | distribute, distribution, distributor | WORD_FAMILY_VERB_NOUN | 24 | IMPLEMENTED_PROGRAM_B | data/vocab/curriculum.json |
| V1 | V1-D-42 | present word family | word_family | present, presentation, presenter | WORD_FAMILY_VERB_NOUN | 24 | IMPLEMENTED_PROGRAM_B | data/vocab/curriculum.json |
| V1 | V1-D-43 | attach word family | word_family | attach, attachment, attached | WORD_FAMILY_VERB_NOUN_ADJ | 24 | IMPLEMENTED_PROGRAM_B | data/vocab/curriculum.json |
| V1 | V1-D-44 | respond word family | word_family | respond, response, responsive | WORD_FAMILY_VERB_NOUN_ADJ | 24 | IMPLEMENTED_PROGRAM_B | data/vocab/curriculum.json |
| V1 | V1-E-45 | maintain word family | word_family | maintain, maintenance | WORD_FAMILY_VERB_NOUN | 24 | IMPLEMENTED_PROGRAM_B | data/vocab/curriculum.json |
| V1 | V1-E-46 | inspect word family | word_family | inspect, inspection, inspector | WORD_FAMILY_VERB_NOUN | 24 | IMPLEMENTED_PROGRAM_B | data/vocab/curriculum.json |
| V1 | V1-E-47 | install word family | word_family | install, installation, installed | WORD_FAMILY_VERB_NOUN_ADJ | 24 | IMPLEMENTED_PROGRAM_B | data/vocab/curriculum.json |
| V1 | V1-E-48 | operate word family | word_family | operate, operation, operational | WORD_FAMILY_VERB_NOUN_ADJ | 24 | IMPLEMENTED_PROGRAM_B | data/vocab/curriculum.json |
| V1 | V1-E-49 | repair word family | word_family | repair, repaired, repairing | WORD_FAMILY_NOUN_VERB | 24 | IMPLEMENTED_PROGRAM_B | data/vocab/curriculum.json |
| V1 | V1-E-50 | renovate word family | word_family | renovate, renovation, renovated | WORD_FAMILY_VERB_NOUN_ADJ | 24 | IMPLEMENTED_PROGRAM_B | data/vocab/curriculum.json |
| V1 | V1-E-51 | equip word family | word_family | equip, equipment, equipped | WORD_FAMILY_VERB_NOUN_ADJ | 24 | IMPLEMENTED_PROGRAM_B | data/vocab/curriculum.json |
| V1 | V1-E-52 | calibrate word family | word_family | calibrate, calibration, calibrated | WORD_FAMILY_VERB_NOUN_ADJ | 24 | IMPLEMENTED_PROGRAM_B | data/vocab/curriculum.json |
| V1 | V1-F-53 | V1 mixed word family speed reflex 01 | speed_drill | accurate, available, productive, secure, apply, recruit, finance, revenue, contract, confirm, distribute, respond, install, renovate | WORD_FAMILY_SPEED_REFLEX | 40 | IMPLEMENTED_PROGRAM_B | data/vocab/curriculum.json |
| V1 | V1-F-54 | V1 mixed word family speed reflex 02 | speed_drill | employ, assess, certify, budget, audit, propose, revise, attach, inspect, repair, calibrate, responsible, reliable, profitable | WORD_FAMILY_SPEED_REFLEX | 40 | IMPLEMENTED_PROGRAM_B | data/vocab/curriculum.json |
| V1 | V1-F-55 | V1 mixed word family speed reflex 03 | speed_drill | expense, comply, notify, present, maintain, operate, equip, efficient, successful, competitive, qualify, promote, train, invest | WORD_FAMILY_SPEED_REFLEX | 40 | IMPLEMENTED_PROGRAM_B | data/vocab/curriculum.json |
| V1 | V1-F-56 | V1 mixed word family speed reflex 04 | speed_drill | respond, install, renovate, accurate, available, productive, secure, apply, recruit, finance, revenue, contract, confirm, distribute | WORD_FAMILY_SPEED_REFLEX | 40 | IMPLEMENTED_PROGRAM_B | data/vocab/curriculum.json |
| V1 | V1-F-57 | V1 mixed word family speed reflex 05 | speed_drill | responsible, reliable, profitable, employ, assess, certify, budget, audit, propose, revise, attach, inspect, repair, calibrate | WORD_FAMILY_SPEED_REFLEX | 40 | IMPLEMENTED_PROGRAM_B | data/vocab/curriculum.json |
| V1 | V1-F-58 | V1 mixed word family speed reflex 06 | speed_drill | promote, train, invest, expense, comply, notify, present, maintain, operate, equip, efficient, successful, competitive, qualify | WORD_FAMILY_SPEED_REFLEX | 40 | IMPLEMENTED_PROGRAM_B | data/vocab/curriculum.json |
| V1 | V1-F-59 | V1 mixed word family speed reflex 07 | speed_drill | contract, confirm, distribute, respond, install, renovate, accurate, available, productive, secure, apply, recruit, finance, revenue | WORD_FAMILY_SPEED_REFLEX | 40 | IMPLEMENTED_PROGRAM_B | data/vocab/curriculum.json |
| V1 | V1-F-60 | V1 mixed word family speed reflex 08 | speed_drill | inspect, repair, calibrate, responsible, reliable, profitable, employ, assess, certify, budget, audit, propose, revise, attach | WORD_FAMILY_SPEED_REFLEX | 40 | IMPLEMENTED_PROGRAM_B | data/vocab/curriculum.json |
| V1 | V1-F-61 | V1 mixed word family speed reflex 09 | speed_drill | successful, competitive, qualify, promote, train, invest, expense, comply, notify, present, maintain, operate, equip, efficient | WORD_FAMILY_SPEED_REFLEX | 40 | IMPLEMENTED_PROGRAM_B | data/vocab/curriculum.json |
| V1 | V1-F-62 | V1 mixed word family speed reflex 10 | speed_drill | recruit, finance, revenue, contract, confirm, distribute, respond, install, renovate, accurate, available, productive, secure, apply | WORD_FAMILY_SPEED_REFLEX | 40 | IMPLEMENTED_PROGRAM_B | data/vocab/curriculum.json |
| V1 | V1-F-63 | V1 mixed word family speed reflex 11 | speed_drill | propose, revise, attach, inspect, repair, calibrate, responsible, reliable, profitable, employ, assess, certify, budget, audit | WORD_FAMILY_SPEED_REFLEX | 40 | IMPLEMENTED_PROGRAM_B | data/vocab/curriculum.json |
| V1 | V1-F-64 | V1 mixed word family speed reflex 12 | speed_drill | operate, equip, efficient, successful, competitive, qualify, promote, train, invest, expense, comply, notify, present, maintain | WORD_FAMILY_SPEED_REFLEX | 40 | IMPLEMENTED_PROGRAM_B | data/vocab/curriculum.json |
| V1 | V1-F-65 | V1 mixed word family speed reflex 13 | speed_drill | productive, secure, apply, recruit, finance, revenue, contract, confirm, distribute, respond, install, renovate, accurate, available | WORD_FAMILY_SPEED_REFLEX | 40 | IMPLEMENTED_PROGRAM_B | data/vocab/curriculum.json |
| V1 | V1-F-66 | V1 mixed word family speed reflex 14 | speed_drill | certify, budget, audit, propose, revise, attach, inspect, repair, calibrate, responsible, reliable, profitable, employ, assess | WORD_FAMILY_SPEED_REFLEX | 40 | IMPLEMENTED_PROGRAM_B | data/vocab/curriculum.json |
| V1 | V1-F-67 | V1 mixed word family speed reflex 15 | speed_drill | notify, present, maintain, operate, equip, efficient, successful, competitive, qualify, promote, train, invest, expense, comply | WORD_FAMILY_SPEED_REFLEX | 40 | IMPLEMENTED_PROGRAM_B | data/vocab/curriculum.json |
| V1 | V1-F-68 | V1 mixed word family speed reflex 16 | speed_drill | renovate, accurate, available, productive, secure, apply, recruit, finance, revenue, contract, confirm, distribute, respond, install | WORD_FAMILY_SPEED_REFLEX | 40 | IMPLEMENTED_PROGRAM_B | data/vocab/curriculum.json |
| V1 | V1-F-69 | V1 mixed word family speed reflex 17 | speed_drill | profitable, employ, assess, certify, budget, audit, propose, revise, attach, inspect, repair, calibrate, responsible, reliable | WORD_FAMILY_SPEED_REFLEX | 40 | IMPLEMENTED_PROGRAM_B | data/vocab/curriculum.json |
| V1 | V1-F-70 | V1 mixed word family speed reflex 18 | speed_drill | invest, expense, comply, notify, present, maintain, operate, equip, efficient, successful, competitive, qualify, promote, train | WORD_FAMILY_SPEED_REFLEX | 40 | IMPLEMENTED_PROGRAM_B | data/vocab/curriculum.json |
| V2 | V2-A-71 | Office Equipment Scene Vocabulary | scene_vocabulary | workstation, extension, photocopier, stationery | SCENE_VOCAB_CONTEXT | 24 | IMPLEMENTED_PROGRAM_B | data/vocab/curriculum.json |
| V2 | V2-A-72 | Meeting Scene Vocabulary | scene_vocabulary | agenda, minutes, attendee, venue | SCENE_VOCAB_CONTEXT | 24 | IMPLEMENTED_PROGRAM_B | data/vocab/curriculum.json |
| V2 | V2-A-73 | Scheduling Scene Vocabulary | scene_vocabulary | appointment, deadline, itinerary, availability | SCENE_VOCAB_CONTEXT | 24 | IMPLEMENTED_PROGRAM_B | data/vocab/curriculum.json |
| V2 | V2-A-74 | Office Document Scene Vocabulary | scene_vocabulary | memo, invoice, attachment, directory | SCENE_VOCAB_CONTEXT | 24 | IMPLEMENTED_PROGRAM_B | data/vocab/curriculum.json |
| V2 | V2-A-75 | Office Communication Scene Vocabulary | scene_vocabulary | correspondence, notification, inquiry, recipient | SCENE_VOCAB_CONTEXT | 24 | IMPLEMENTED_PROGRAM_B | data/vocab/curriculum.json |
| V2 | V2-A-76 | Office Facility Scene Vocabulary | scene_vocabulary | lobby, elevator, cafeteria, parking | SCENE_VOCAB_CONTEXT | 24 | IMPLEMENTED_PROGRAM_B | data/vocab/curriculum.json |
| V2 | V2-A-77 | Office Procedure Scene Vocabulary | scene_vocabulary | authorization, request form, approval, submission | SCENE_VOCAB_CONTEXT | 24 | IMPLEMENTED_PROGRAM_B | data/vocab/curriculum.json |
| V2 | V2-A-78 | Business Event Scene Vocabulary | scene_vocabulary | registration, banquet, booth, seminar | SCENE_VOCAB_CONTEXT | 24 | IMPLEMENTED_PROGRAM_B | data/vocab/curriculum.json |
| V2 | V2-A-79 | Business Travel Scene Vocabulary | scene_vocabulary | reservation, confirmation, departure, baggage | SCENE_VOCAB_CONTEXT | 24 | IMPLEMENTED_PROGRAM_B | data/vocab/curriculum.json |
| V2 | V2-A-80 | Workplace Policy Scene Vocabulary | scene_vocabulary | policy, guideline, compliance, requirement | SCENE_VOCAB_CONTEXT | 24 | IMPLEMENTED_PROGRAM_B | data/vocab/curriculum.json |
| V2 | V2-B-81 | Shipping Status Scene Vocabulary | scene_vocabulary | shipment, carrier, tracking number, warehouse | SCENE_VOCAB_CONTEXT | 24 | IMPLEMENTED_PROGRAM_B | data/vocab/curriculum.json |
| V2 | V2-B-82 | Inventory Scene Vocabulary | scene_vocabulary | inventory, stock, reorder, supplier | SCENE_VOCAB_CONTEXT | 24 | IMPLEMENTED_PROGRAM_B | data/vocab/curriculum.json |
| V2 | V2-B-83 | International Delivery Scene Vocabulary | scene_vocabulary | delivery, freight, customs, clearance | SCENE_VOCAB_CONTEXT | 24 | IMPLEMENTED_PROGRAM_B | data/vocab/curriculum.json |
| V2 | V2-B-84 | Package Document Scene Vocabulary | scene_vocabulary | package, label, receipt, packing slip | SCENE_VOCAB_CONTEXT | 24 | IMPLEMENTED_PROGRAM_B | data/vocab/curriculum.json |
| V2 | V2-B-85 | Manufacturing Scene Vocabulary | scene_vocabulary | production, assembly line, component, defect | SCENE_VOCAB_CONTEXT | 24 | IMPLEMENTED_PROGRAM_B | data/vocab/curriculum.json |
| V2 | V2-B-86 | Maintenance Request Scene Vocabulary | scene_vocabulary | inspection, repair request, technician, equipment | SCENE_VOCAB_CONTEXT | 24 | IMPLEMENTED_PROGRAM_B | data/vocab/curriculum.json |
| V2 | V2-B-87 | Employee Travel Scene Vocabulary | scene_vocabulary | boarding pass, accommodation, reimbursement, travel allowance | SCENE_VOCAB_CONTEXT | 24 | IMPLEMENTED_PROGRAM_B | data/vocab/curriculum.json |
| V2 | V2-B-88 | Vendor Purchase Scene Vocabulary | scene_vocabulary | quotation, purchase order, contract, delivery date | SCENE_VOCAB_CONTEXT | 24 | IMPLEMENTED_PROGRAM_B | data/vocab/curriculum.json |
| V2 | V2-B-89 | Cargo Document Scene Vocabulary | scene_vocabulary | bill of lading, cargo, destination, delay | SCENE_VOCAB_CONTEXT | 24 | IMPLEMENTED_PROGRAM_B | data/vocab/curriculum.json |
| V2 | V2-B-90 | Return Process Scene Vocabulary | scene_vocabulary | return authorization, replacement, refund, warranty | SCENE_VOCAB_CONTEXT | 24 | IMPLEMENTED_PROGRAM_B | data/vocab/curriculum.json |
| V2 | V2-C-91 | Recruitment Scene Vocabulary | scene_vocabulary | recruitment, applicant, resume, reference | SCENE_VOCAB_CONTEXT | 24 | IMPLEMENTED_PROGRAM_B | data/vocab/curriculum.json |
| V2 | V2-C-92 | Interview Scene Vocabulary | scene_vocabulary | interview, orientation, probation, position | SCENE_VOCAB_CONTEXT | 24 | IMPLEMENTED_PROGRAM_B | data/vocab/curriculum.json |
| V2 | V2-C-93 | Employee Benefit Scene Vocabulary | scene_vocabulary | benefits, payroll, overtime, vacation leave | SCENE_VOCAB_CONTEXT | 24 | IMPLEMENTED_PROGRAM_B | data/vocab/curriculum.json |
| V2 | V2-C-94 | Performance Scene Vocabulary | scene_vocabulary | appraisal, promotion, transfer, resignation | SCENE_VOCAB_CONTEXT | 24 | IMPLEMENTED_PROGRAM_B | data/vocab/curriculum.json |
| V2 | V2-C-95 | Training Scene Vocabulary | scene_vocabulary | workshop, certificate, instructor, enrollment | SCENE_VOCAB_CONTEXT | 24 | IMPLEMENTED_PROGRAM_B | data/vocab/curriculum.json |
| V2 | V2-C-96 | Workplace Conduct Scene Vocabulary | scene_vocabulary | attendance, dress code, supervisor, colleague | SCENE_VOCAB_CONTEXT | 24 | IMPLEMENTED_PROGRAM_B | data/vocab/curriculum.json |
| V2 | V2-C-97 | Staffing Scene Vocabulary | scene_vocabulary | vacancy, candidate, department, branch | SCENE_VOCAB_CONTEXT | 24 | IMPLEMENTED_PROGRAM_B | data/vocab/curriculum.json |
| V2 | V2-C-98 | Onboarding Scene Vocabulary | scene_vocabulary | handbook, badge, access card, workspace | SCENE_VOCAB_CONTEXT | 24 | IMPLEMENTED_PROGRAM_B | data/vocab/curriculum.json |
| V2 | V2-C-99 | Employee Record Scene Vocabulary | scene_vocabulary | personnel file, emergency contact, tax form, direct deposit | SCENE_VOCAB_CONTEXT | 24 | IMPLEMENTED_PROGRAM_B | data/vocab/curriculum.json |
| V2 | V2-C-100 | Workplace Safety Scene Vocabulary | scene_vocabulary | evacuation, hazard, incident report, first aid kit | SCENE_VOCAB_CONTEXT | 24 | IMPLEMENTED_PROGRAM_B | data/vocab/curriculum.json |
| V2 | V2-D-101 | Financial Result Scene Vocabulary | scene_vocabulary | budget, expense, revenue, profit | SCENE_VOCAB_CONTEXT | 24 | IMPLEMENTED_PROGRAM_B | data/vocab/curriculum.json |
| V2 | V2-D-102 | Payment Scene Vocabulary | scene_vocabulary | payment, billing address, balance, due date | SCENE_VOCAB_CONTEXT | 24 | IMPLEMENTED_PROGRAM_B | data/vocab/curriculum.json |
| V2 | V2-D-103 | Banking Scene Vocabulary | scene_vocabulary | deposit, withdrawal, transaction, statement | SCENE_VOCAB_CONTEXT | 24 | IMPLEMENTED_PROGRAM_B | data/vocab/curriculum.json |
| V2 | V2-D-104 | Accounting Scene Vocabulary | scene_vocabulary | ledger, audit, tax, deduction | SCENE_VOCAB_CONTEXT | 24 | IMPLEMENTED_PROGRAM_B | data/vocab/curriculum.json |
| V2 | V2-D-105 | Pricing Scene Vocabulary | scene_vocabulary | estimate, discount, surcharge, rate | SCENE_VOCAB_CONTEXT | 24 | IMPLEMENTED_PROGRAM_B | data/vocab/curriculum.json |
| V2 | V2-D-106 | Sales Scene Vocabulary | scene_vocabulary | client, prospect, subscription, renewal | SCENE_VOCAB_CONTEXT | 24 | IMPLEMENTED_PROGRAM_B | data/vocab/curriculum.json |
| V2 | V2-D-107 | Procurement Scene Vocabulary | scene_vocabulary | procurement, vendor, requisition, bid | SCENE_VOCAB_CONTEXT | 24 | IMPLEMENTED_PROGRAM_B | data/vocab/curriculum.json |
| V2 | V2-D-108 | Compliance Scene Vocabulary | scene_vocabulary | regulation, violation, permit, license | SCENE_VOCAB_CONTEXT | 24 | IMPLEMENTED_PROGRAM_B | data/vocab/curriculum.json |
| V2 | V2-D-109 | Insurance Scene Vocabulary | scene_vocabulary | coverage, claim, premium, policyholder | SCENE_VOCAB_CONTEXT | 24 | IMPLEMENTED_PROGRAM_B | data/vocab/curriculum.json |
| V2 | V2-D-110 | Investment Scene Vocabulary | scene_vocabulary | portfolio, dividend, shareholder, forecast | SCENE_VOCAB_CONTEXT | 24 | IMPLEMENTED_PROGRAM_B | data/vocab/curriculum.json |
| V2 | V2-E-111 | Hotel Scene Vocabulary | scene_vocabulary | front desk, housekeeping, checkout, guest room | SCENE_VOCAB_CONTEXT | 24 | IMPLEMENTED_PROGRAM_B | data/vocab/curriculum.json |
| V2 | V2-E-112 | Restaurant Scene Vocabulary | scene_vocabulary | menu, catering, beverage, reservation desk | SCENE_VOCAB_CONTEXT | 24 | IMPLEMENTED_PROGRAM_B | data/vocab/curriculum.json |
| V2 | V2-E-113 | Retail Scene Vocabulary | scene_vocabulary | merchandise, aisle, cashier, exchange policy | SCENE_VOCAB_CONTEXT | 24 | IMPLEMENTED_PROGRAM_B | data/vocab/curriculum.json |
| V2 | V2-E-114 | Customer Service Scene Vocabulary | scene_vocabulary | complaint, representative, resolution, follow-up | SCENE_VOCAB_CONTEXT | 24 | IMPLEMENTED_PROGRAM_B | data/vocab/curriculum.json |
| V2 | V2-E-115 | Healthcare Scene Vocabulary | scene_vocabulary | prescription, clinic, patient, appointment reminder | SCENE_VOCAB_CONTEXT | 24 | IMPLEMENTED_PROGRAM_B | data/vocab/curriculum.json |
| V2 | V2-E-116 | Airline Scene Vocabulary | scene_vocabulary | gate, boarding, luggage, flight delay | SCENE_VOCAB_CONTEXT | 24 | IMPLEMENTED_PROGRAM_B | data/vocab/curriculum.json |
| V2 | V2-E-117 | Public Notice Scene Vocabulary | scene_vocabulary | renovation, closure, relocation, access restriction | SCENE_VOCAB_CONTEXT | 24 | IMPLEMENTED_PROGRAM_B | data/vocab/curriculum.json |
| V2 | V2-E-118 | Technology Support Scene Vocabulary | scene_vocabulary | password, outage, update, backup | SCENE_VOCAB_CONTEXT | 24 | IMPLEMENTED_PROGRAM_B | data/vocab/curriculum.json |
| V2 | V2-E-119 | Marketing Scene Vocabulary | scene_vocabulary | brochure, campaign, sample, feedback | SCENE_VOCAB_CONTEXT | 24 | IMPLEMENTED_PROGRAM_B | data/vocab/curriculum.json |
| V2 | V2-E-120 | Building Utility Scene Vocabulary | scene_vocabulary | electricity, plumbing, heating, ventilation | SCENE_VOCAB_CONTEXT | 24 | IMPLEMENTED_PROGRAM_B | data/vocab/curriculum.json |
| V3 | V3-A-121 | Office Task Collocations 01 | collocation | make arrangements, submit a report, meet a deadline, hold a meeting | COLLOCATION_VERB_NOUN | 24 | IMPLEMENTED_PROGRAM_B | data/vocab/curriculum.json |
| V3 | V3-A-122 | Office Task Collocations 02 | collocation | take notes, prepare an agenda, review a document, file a complaint | COLLOCATION_VERB_NOUN | 24 | IMPLEMENTED_PROGRAM_B | data/vocab/curriculum.json |
| V3 | V3-A-123 | Office Task Collocations 03 | collocation | issue a memo, schedule an appointment, update a record, make a request | COLLOCATION_VERB_NOUN | 24 | IMPLEMENTED_PROGRAM_B | data/vocab/curriculum.json |
| V3 | V3-A-124 | Office Task Collocations 04 | collocation | approve a proposal, sign a contract, attend a seminar, give a presentation | COLLOCATION_VERB_NOUN | 24 | IMPLEMENTED_PROGRAM_B | data/vocab/curriculum.json |
| V3 | V3-A-125 | Office Communication Collocations | collocation | answer an inquiry, forward an email, attach a file, confirm a reservation | COLLOCATION_VERB_NOUN | 24 | IMPLEMENTED_PROGRAM_B | data/vocab/curriculum.json |
| V3 | V3-A-126 | Office Paperwork Collocations | collocation | keep records, process paperwork, obtain approval, complete a form | COLLOCATION_VERB_NOUN | 24 | IMPLEMENTED_PROGRAM_B | data/vocab/curriculum.json |
| V3 | V3-A-127 | Office Event Collocations | collocation | conduct a survey, collect feedback, arrange seating, reserve a venue | COLLOCATION_VERB_NOUN | 24 | IMPLEMENTED_PROGRAM_B | data/vocab/curriculum.json |
| V3 | V3-A-128 | Office Procedure Collocations | collocation | announce a policy, follow procedures, check availability, resolve an issue | COLLOCATION_VERB_NOUN | 24 | IMPLEMENTED_PROGRAM_B | data/vocab/curriculum.json |
| V3 | V3-A-129 | Office Coordination Collocations | collocation | coordinate an event, send a reminder, verify details, provide instructions | COLLOCATION_VERB_NOUN | 24 | IMPLEMENTED_PROGRAM_B | data/vocab/curriculum.json |
| V3 | V3-A-130 | Office Notice Collocations | collocation | post a notice, print copies, share minutes, set priorities | COLLOCATION_VERB_NOUN | 24 | IMPLEMENTED_PROGRAM_B | data/vocab/curriculum.json |
| V3 | V3-B-131 | Shipping Collocations | collocation | place an order, track a shipment, receive a package, inspect goods | COLLOCATION_VERB_NOUN | 24 | IMPLEMENTED_PROGRAM_B | data/vocab/curriculum.json |
| V3 | V3-B-132 | Inventory Collocations | collocation | maintain inventory, replenish stock, contact a supplier, compare prices | COLLOCATION_VERB_NOUN | 24 | IMPLEMENTED_PROGRAM_B | data/vocab/curriculum.json |
| V3 | V3-B-133 | Freight Collocations | collocation | load cargo, clear customs, arrange delivery, cover shipping costs | COLLOCATION_VERB_NOUN | 24 | IMPLEMENTED_PROGRAM_B | data/vocab/curriculum.json |
| V3 | V3-B-134 | Delivery Status Collocations | collocation | dispatch a truck, confirm arrival, reduce delays, update tracking | COLLOCATION_VERB_NOUN | 24 | IMPLEMENTED_PROGRAM_B | data/vocab/curriculum.json |
| V3 | V3-B-135 | Manufacturing Collocations | collocation | assemble components, operate machinery, detect defects, meet specifications | COLLOCATION_VERB_NOUN | 24 | IMPLEMENTED_PROGRAM_B | data/vocab/curriculum.json |
| V3 | V3-B-136 | Maintenance Collocations | collocation | perform maintenance, request repairs, replace parts, inspect equipment | COLLOCATION_VERB_NOUN | 24 | IMPLEMENTED_PROGRAM_B | data/vocab/curriculum.json |
| V3 | V3-B-137 | Retail Logistics Collocations | collocation | pack merchandise, print labels, handle returns, issue refunds | COLLOCATION_VERB_NOUN | 24 | IMPLEMENTED_PROGRAM_B | data/vocab/curriculum.json |
| V3 | V3-B-138 | Warehouse Collocations | collocation | process invoices, check quantities, store materials, manage warehouses | COLLOCATION_VERB_NOUN | 24 | IMPLEMENTED_PROGRAM_B | data/vocab/curriculum.json |
| V3 | V3-B-139 | Vendor Contract Collocations | collocation | negotiate terms, renew a contract, request a quotation, approve a purchase | COLLOCATION_VERB_NOUN | 24 | IMPLEMENTED_PROGRAM_B | data/vocab/curriculum.json |
| V3 | V3-B-140 | Operations Improvement Collocations | collocation | avoid delays, improve efficiency, reduce costs, monitor progress | COLLOCATION_VERB_NOUN | 24 | IMPLEMENTED_PROGRAM_B | data/vocab/curriculum.json |
| V3 | V3-C-141 | Recruitment Collocations | collocation | apply for a position, submit a resume, schedule an interview, check references | COLLOCATION_VERB_NOUN | 24 | IMPLEMENTED_PROGRAM_B | data/vocab/curriculum.json |
| V3 | V3-C-142 | Employment Collocations | collocation | conduct training, attend orientation, complete probation, receive benefits | COLLOCATION_VERB_NOUN | 24 | IMPLEMENTED_PROGRAM_B | data/vocab/curriculum.json |
| V3 | V3-C-143 | Attendance Collocations | collocation | calculate payroll, approve overtime, request leave, update attendance | COLLOCATION_VERB_NOUN | 24 | IMPLEMENTED_PROGRAM_B | data/vocab/curriculum.json |
| V3 | V3-C-144 | Performance Collocations | collocation | evaluate performance, offer a promotion, transfer employees, accept resignation | COLLOCATION_VERB_NOUN | 24 | IMPLEMENTED_PROGRAM_B | data/vocab/curriculum.json |
| V3 | V3-C-145 | Training Collocations | collocation | enroll in a workshop, earn a certificate, provide instruction, develop skills | COLLOCATION_VERB_NOUN | 24 | IMPLEMENTED_PROGRAM_B | data/vocab/curriculum.json |
| V3 | V3-C-146 | Workplace Conduct Collocations | collocation | follow a dress code, report an incident, contact a supervisor, assist colleagues | COLLOCATION_VERB_NOUN | 24 | IMPLEMENTED_PROGRAM_B | data/vocab/curriculum.json |
| V3 | V3-C-147 | Staffing Collocations | collocation | fill a vacancy, screen candidates, expand a department, open a branch | COLLOCATION_VERB_NOUN | 24 | IMPLEMENTED_PROGRAM_B | data/vocab/curriculum.json |
| V3 | V3-C-148 | Onboarding Collocations | collocation | issue a badge, grant access, assign workspace, distribute handbooks | COLLOCATION_VERB_NOUN | 24 | IMPLEMENTED_PROGRAM_B | data/vocab/curriculum.json |
| V3 | V3-C-149 | Employee Record Collocations | collocation | update personnel files, provide emergency contacts, file tax forms, set up direct deposit | COLLOCATION_VERB_NOUN | 24 | IMPLEMENTED_PROGRAM_B | data/vocab/curriculum.json |
| V3 | V3-C-150 | Safety Collocations | collocation | conduct an evacuation drill, identify hazards, submit incident reports, stock first aid kits | COLLOCATION_VERB_NOUN | 24 | IMPLEMENTED_PROGRAM_B | data/vocab/curriculum.json |
| V3 | V3-D-151 | Budget Collocations | collocation | prepare a budget, reduce expenses, increase revenue, earn a profit | COLLOCATION_VERB_NOUN | 24 | IMPLEMENTED_PROGRAM_B | data/vocab/curriculum.json |
| V3 | V3-D-152 | Payment Collocations | collocation | make a payment, send an invoice, issue a receipt, settle a balance | COLLOCATION_VERB_NOUN | 24 | IMPLEMENTED_PROGRAM_B | data/vocab/curriculum.json |
| V3 | V3-D-153 | Banking Collocations | collocation | make a deposit, record a transaction, review a statement, withdraw funds | COLLOCATION_VERB_NOUN | 24 | IMPLEMENTED_PROGRAM_B | data/vocab/curriculum.json |
| V3 | V3-D-154 | Accounting Collocations | collocation | update a ledger, conduct an audit, calculate taxes, claim a deduction | COLLOCATION_VERB_NOUN | 24 | IMPLEMENTED_PROGRAM_B | data/vocab/curriculum.json |
| V3 | V3-D-155 | Pricing Collocations | collocation | provide an estimate, request a quotation, offer a discount, add a surcharge | COLLOCATION_VERB_NOUN | 24 | IMPLEMENTED_PROGRAM_B | data/vocab/curriculum.json |
| V3 | V3-D-156 | Sales Contract Collocations | collocation | sign a contract, retain clients, attract prospects, renew subscriptions | COLLOCATION_VERB_NOUN | 24 | IMPLEMENTED_PROGRAM_B | data/vocab/curriculum.json |
| V3 | V3-D-157 | Procurement Collocations | collocation | manage procurement, evaluate vendors, approve requisitions, negotiate contracts | COLLOCATION_VERB_NOUN | 24 | IMPLEMENTED_PROGRAM_B | data/vocab/curriculum.json |
| V3 | V3-D-158 | Compliance Collocations | collocation | comply with regulations, report violations, obtain permits, renew licenses | COLLOCATION_VERB_NOUN | 24 | IMPLEMENTED_PROGRAM_B | data/vocab/curriculum.json |
| V3 | V3-D-159 | Insurance Collocations | collocation | file a claim, provide coverage, pay premiums, review policyholders | COLLOCATION_VERB_NOUN | 24 | IMPLEMENTED_PROGRAM_B | data/vocab/curriculum.json |
| V3 | V3-D-160 | Investment Collocations | collocation | forecast demand, manage a portfolio, pay dividends, notify shareholders | COLLOCATION_VERB_NOUN | 24 | IMPLEMENTED_PROGRAM_B | data/vocab/curriculum.json |
| V3 | V3-E-161 | Hotel Collocations | collocation | take a reservation, greet guests, clean rooms, process checkout | COLLOCATION_VERB_NOUN | 24 | IMPLEMENTED_PROGRAM_B | data/vocab/curriculum.json |
| V3 | V3-E-162 | Restaurant Collocations | collocation | revise a menu, confirm catering, serve beverages, handle complaints | COLLOCATION_VERB_NOUN | 24 | IMPLEMENTED_PROGRAM_B | data/vocab/curriculum.json |
| V3 | V3-E-163 | Retail Collocations | collocation | display merchandise, scan items, process refunds, assist customers | COLLOCATION_VERB_NOUN | 24 | IMPLEMENTED_PROGRAM_B | data/vocab/curriculum.json |
| V3 | V3-E-164 | Customer Support Collocations | collocation | answer complaints, provide resolutions, follow up with clients, contact representatives | COLLOCATION_VERB_NOUN | 24 | IMPLEMENTED_PROGRAM_B | data/vocab/curriculum.json |
| V3 | V3-E-165 | Healthcare Collocations | collocation | schedule appointments, fill prescriptions, admit patients, contact clinics | COLLOCATION_VERB_NOUN | 24 | IMPLEMENTED_PROGRAM_B | data/vocab/curriculum.json |
| V3 | V3-E-166 | Airline Collocations | collocation | announce delays, board passengers, check luggage, change gates | COLLOCATION_VERB_NOUN | 24 | IMPLEMENTED_PROGRAM_B | data/vocab/curriculum.json |
| V3 | V3-E-167 | Public Notice Collocations | collocation | begin renovations, announce closures, complete relocation, restrict access | COLLOCATION_VERB_NOUN | 24 | IMPLEMENTED_PROGRAM_B | data/vocab/curriculum.json |
| V3 | V3-E-168 | IT Support Collocations | collocation | reset passwords, report outages, install updates, back up files | COLLOCATION_VERB_NOUN | 24 | IMPLEMENTED_PROGRAM_B | data/vocab/curriculum.json |
| V3 | V3-E-169 | Marketing Collocations | collocation | launch a campaign, distribute brochures, collect samples, analyze feedback | COLLOCATION_VERB_NOUN | 24 | IMPLEMENTED_PROGRAM_B | data/vocab/curriculum.json |
| V3 | V3-E-170 | Utility Collocations | collocation | restore electricity, repair plumbing, adjust heating, improve ventilation | COLLOCATION_VERB_NOUN | 24 | IMPLEMENTED_PROGRAM_B | data/vocab/curriculum.json |
| V3 | V3-F-171 | Security Context Collocations | collocation | strengthen security, protect data, update software, report a breach | COLLOCATION_VERB_NOUN | 24 | IMPLEMENTED_PROGRAM_B | data/vocab/curriculum.json |
| V3 | V3-F-172 | Expansion Context Collocations | collocation | expand operations, enter a market, open a branch, increase capacity | COLLOCATION_VERB_NOUN | 24 | IMPLEMENTED_PROGRAM_B | data/vocab/curriculum.json |
| V3 | V3-F-173 | Service Context Collocations | collocation | improve service, reduce waiting times, train staff, monitor satisfaction | COLLOCATION_VERB_NOUN | 24 | IMPLEMENTED_PROGRAM_B | data/vocab/curriculum.json |
| V3 | V3-F-174 | Facility Context Collocations | collocation | complete construction, inspect facilities, install equipment, reopen offices | COLLOCATION_VERB_NOUN | 24 | IMPLEMENTED_PROGRAM_B | data/vocab/curriculum.json |
| V3 | V3-F-175 | Travel Context Collocations | collocation | organize transportation, book accommodations, submit reimbursement, confirm itinerary | COLLOCATION_VERB_NOUN | 24 | IMPLEMENTED_PROGRAM_B | data/vocab/curriculum.json |
| V3 | V3-F-176 | Policy Context Collocations | collocation | revise guidelines, enforce policies, clarify requirements, announce changes | COLLOCATION_VERB_NOUN | 24 | IMPLEMENTED_PROGRAM_B | data/vocab/curriculum.json |
| V3 | V3-F-177 | Vendor Context Collocations | collocation | compare bids, select vendors, finalize agreements, schedule delivery | COLLOCATION_VERB_NOUN | 24 | IMPLEMENTED_PROGRAM_B | data/vocab/curriculum.json |
| V3 | V3-F-178 | Hiring Context Collocations | collocation | review applications, shortlist candidates, offer positions, conduct onboarding | COLLOCATION_VERB_NOUN | 24 | IMPLEMENTED_PROGRAM_B | data/vocab/curriculum.json |
| V3 | V3-F-179 | Finance Context Collocations | collocation | prepare statements, review expenses, approve budgets, forecast revenue | COLLOCATION_VERB_NOUN | 24 | IMPLEMENTED_PROGRAM_B | data/vocab/curriculum.json |
| V3 | V3-F-180 | Customer Resolution Collocations | collocation | resolve disputes, answer inquiries, replace products, extend warranties | COLLOCATION_VERB_NOUN | 24 | IMPLEMENTED_PROGRAM_B | data/vocab/curriculum.json |
