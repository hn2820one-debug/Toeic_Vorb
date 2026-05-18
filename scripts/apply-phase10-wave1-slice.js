const path = require("path");

const { readJSON, unique, writeJSON } = require("./collocation-rebuild-helpers");

const ROOT = path.resolve(__dirname, "..");
const QUESTION_SHELLS_PATH = path.join(ROOT, "drafts", "collocation-rebuild", "wave1_question_shells.json");
const VOCAB_ITEMS_PATH = path.join(ROOT, "drafts", "collocation-rebuild", "wave1_vocab_items_seed_draft.json");

const QUESTION_PATCHES = {
  V3_W1_01_Q01: {
    question_text: "The reception team had to borrow copy paper from another floor after we ______ it before noon.",
    options: {
      A: "run by",
      B: "run out of",
      C: "run through",
      D: "run into"
    },
    correct_answer: "B",
    explanation_zh: "run out of 表示用品用盡；句中交代紙張耗盡，run into 只是碰到。"
  },
  V3_W1_01_Q02: {
    question_text: "The front desk may ______ visitor badges if the courier is delayed again this morning.",
    options: {
      A: "run into",
      B: "run through",
      C: "run by",
      D: "run out of"
    },
    correct_answer: "D",
    explanation_zh: "may 後接原形；語意是名牌快耗盡，所以用 run out of，不是 run into。"
  },
  V3_W1_01_Q03: {
    question_text: "Before the auditors arrive, Ms. Wu will ______ a temporary workspace in the small meeting room.",
    options: {
      A: "set up",
      B: "set aside",
      C: "set back",
      D: "set off"
    },
    correct_answer: "A",
    explanation_zh: "set up 表示安排或設立臨時空間；set aside 是保留，不合語境。"
  },
  V3_W1_01_Q04: {
    question_text: "The operations assistant was asked to ______ a video call for the branch managers before 3 p.m.",
    options: {
      A: "set back",
      B: "set up",
      C: "set aside",
      D: "set off"
    },
    correct_answer: "B",
    explanation_zh: "此處要安排視訊會議，固定用 set up；set aside 只有保留之意。"
  },
  V3_W1_01_Q05: {
    question_text: "If Mr. Ito has a few minutes after lunch, he can ______ our office to sign the delivery form.",
    options: {
      A: "drop off",
      B: "drop over",
      C: "drop by",
      D: "drop from"
    },
    correct_answer: "C",
    explanation_zh: "drop by 表示順道拜訪；drop off 多指送達或下降，不是臨時來訪。"
  },
  V3_W1_01_Q06: {
    question_text: "Our supplier plans to ______ the office this afternoon because the sample boxes need approval today.",
    options: {
      A: "drop by",
      B: "drop off",
      C: "drop from",
      D: "drop over"
    },
    correct_answer: "A",
    explanation_zh: "語境是供應商順道來辦公室，因此用 drop by；drop off 偏向送下貨。"
  },
  V3_W1_01_Q07: {
    question_text: "Please ______ the revised seating chart before the visitors arrive at reception.",
    options: {
      A: "look into",
      B: "look for",
      C: "look over",
      D: "look after"
    },
    correct_answer: "C",
    explanation_zh: "look over 表示快速查看文件；look into 是調查，與接待前檢查不符。"
  },
  V3_W1_01_Q08: {
    question_text: "The director asked me to ______ the reimbursement list once more before finance receives it.",
    options: {
      A: "look after",
      B: "look over",
      C: "look around",
      D: "look for"
    },
    correct_answer: "B",
    explanation_zh: "此處是再審閱名單，所以用 look over；look around 只表示四處查看。"
  },
  V3_W1_01_Q09: {
    question_text: "We may ______ a scheduling problem if the training room is still occupied at noon.",
    options: {
      A: "run through",
      B: "run out of",
      C: "run by",
      D: "run into"
    },
    correct_answer: "D",
    explanation_zh: "run into 可指遭遇問題；run out of 是耗盡，和會議室衝突不符。"
  },
  V3_W1_01_Q10: {
    question_text: "The office move could ______ delays unless the IT team finishes the network check tonight.",
    options: {
      A: "run by",
      B: "run into",
      C: "run through",
      D: "run out of"
    },
    correct_answer: "B",
    explanation_zh: "句意是搬遷可能遭遇延誤，因此用 run into；run through 不表示碰到障礙。"
  },
  V3_W1_01_Q11: {
    question_text: "Please ______ the guest badges from reception before escorting the clients upstairs.",
    options: {
      A: "pick up",
      B: "hand in",
      C: "turn down",
      D: "sort out"
    },
    correct_answer: "A",
    explanation_zh: "pick up 表示拿取物件；hand in 是提交，和去櫃檯領取相反。"
  },
  V3_W1_01_Q12: {
    question_text: "Ms. Lin will ______ the signed contract from the courier desk after the afternoon briefing.",
    options: {
      A: "take over",
      B: "check in",
      C: "pick up",
      D: "close out"
    },
    correct_answer: "C",
    explanation_zh: "此處是到櫃檯領取文件，所以用 pick up；take over 是接管，語意不同。"
  },
  V3_W1_01_Q13: {
    question_text: "The receptionist will ______ parking passes to all conference guests at the lobby desk.",
    options: {
      A: "give over",
      B: "give out",
      C: "give away",
      D: "give back"
    },
    correct_answer: "B",
    explanation_zh: "give out 在此表示分發；give away 偏向白送或洩露，不是正式派發。"
  },
  V3_W1_01_Q14: {
    question_text: "Please ______ the updated evacuation cards before the safety drill begins on Friday.",
    options: {
      A: "give back",
      B: "give out",
      C: "give over",
      D: "give away"
    },
    correct_answer: "B",
    explanation_zh: "安全演練前要分發卡片，因此用 give out；give back 是歸還，不合句意。"
  },
  V3_W1_01_Q15: {
    question_text: "The office manager expected the printer cartridges to last through Friday. However, two departments printed extra presentation packets this morning. By noon, we had ______ toner and had to delay the copies for the client visit.",
    options: {
      A: "run through",
      B: "run into",
      C: "run out of",
      D: "run by"
    },
    correct_answer: "C",
    explanation_zh: "前文說大量加印導致碳粉耗盡，所以用 run out of；run into 不表用完。"
  },
  V3_W1_01_Q16: {
    question_text: "The regional managers were told at 9 a.m. that the original meeting link had failed. To keep the review on schedule, the assistant quickly ______ a new video conference and emailed the access code to everyone.",
    options: {
      A: "set aside",
      B: "set off",
      C: "set back",
      D: "set up"
    },
    correct_answer: "D",
    explanation_zh: "語境要臨時安排新會議，因此用 set up；set aside 只是擱置保留。"
  },
  V3_W1_01_Q17: {
    question_text: "The purchasing director cannot stay for the full site tour because another meeting was moved forward. She said she would ______ our office after lunch, sign the samples, and then head to the airport.",
    options: {
      A: "drop off",
      B: "drop by",
      C: "drop from",
      D: "drop over"
    },
    correct_answer: "B",
    explanation_zh: "前後文表示短暫順道到訪，所以用 drop by；drop off 只像送人或送貨。"
  },
  V3_W1_01_Q18: {
    question_text: "The assistant finished revising the visitor schedule, but the director has not approved it yet. Before the guests arrive, he wants to ______ the final version for any timing conflicts.",
    options: {
      A: "look for",
      B: "look after",
      C: "look into",
      D: "look over"
    },
    correct_answer: "D",
    explanation_zh: "此處是快速審閱最終版本，所以用 look over；look into 偏向深入調查。"
  },
  V3_W1_01_Q19: {
    question_text: "The delivery route looked simple on paper, yet a road closure was announced just before departure. As a result, the driver may ______ traffic delays and miss the first appointment.",
    options: {
      A: "run through",
      B: "run by",
      C: "run into",
      D: "run out of"
    },
    correct_answer: "C",
    explanation_zh: "前文指出道路封閉，會遭遇延誤，所以用 run into；run out of 是耗盡。"
  },
  V3_W1_01_Q20: {
    question_text: "The reception desk called to say the client welcome packets had arrived early. Since the sales team is still in a cross-department briefing, could you ______ the packets and place them in the meeting room?",
    options: {
      A: "close out",
      B: "check in",
      C: "take over",
      D: "pick up"
    },
    correct_answer: "D",
    explanation_zh: "語境是先去櫃檯拿取資料，所以用 pick up；take over 並非領取物件。"
  },
  V3_W1_01_R01: {
    question_text: "Quick review: choose the best TOEIC meaning for \"run out of\".",
    options: {
      A: "to finish using all of something",
      B: "to meet unexpectedly",
      C: "to establish a new system",
      D: "to review quickly"
    },
    correct_answer: "A",
    explanation_zh: "run out of 指用品或資源用盡；易和 run into 混淆，但後者是碰到。",
    subskill: "meaning_review"
  },
  V3_W1_01_R02: {
    question_text: "Quick review: choose the best TOEIC meaning for \"set up\".",
    options: {
      A: "to cancel a reservation",
      B: "to arrange or establish something",
      C: "to pass something to another person",
      D: "to check something briefly"
    },
    correct_answer: "B",
    explanation_zh: "set up 指安排或設立；不是快速查看，也不是取消預約。",
    subskill: "meaning_review"
  },
  V3_W1_01_R03: {
    question_text: "Quick review: choose the best TOEIC meaning for \"drop by\".",
    options: {
      A: "to pay a short informal visit",
      B: "to use all that remains",
      C: "to recover after a slowdown",
      D: "to delay until later"
    },
    correct_answer: "A",
    explanation_zh: "drop by 是順道短暫拜訪；不是用完資源，也不是恢復狀態。",
    subskill: "meaning_review"
  },
  V3_W1_01_R04: {
    question_text: "Quick review: choose the best TOEIC meaning for \"look over\".",
    options: {
      A: "to distribute to everyone",
      B: "to check something quickly",
      C: "to meet someone unexpectedly",
      D: "to hand something in"
    },
    correct_answer: "B",
    explanation_zh: "look over 指快速查看或審閱；不是分發 give out，也不是遇見 run into。",
    subskill: "meaning_review"
  }
};

const ITEM_PATCHES = {
  item_coll_run_out_of: {
    example: "We ran out of toner just before the monthly reports were printed.",
    common_wrong_forms: ["run into", "run through"]
  },
  item_coll_set_up: {
    example: "The assistant set up a video call for the regional managers.",
    common_wrong_forms: ["set aside", "set off"]
  },
  item_coll_drop_by: {
    example: "The supplier will drop by the office after the client meeting.",
    common_wrong_forms: ["drop off", "drop over"]
  },
  item_coll_look_over: {
    example: "Please look over the contract summary before the director signs it.",
    common_wrong_forms: ["look into", "look after"]
  },
  item_coll_run_into: {
    example: "Our team ran into a scheduling problem during the office move.",
    common_wrong_forms: ["run by", "run through"]
  },
  item_coll_pick_up: {
    example: "Ms. Chen will pick up the visitor badges at reception.",
    common_wrong_forms: ["take over", "check in"]
  },
  item_coll_give_out: {
    example: "The receptionist will give out parking passes to conference guests.",
    common_wrong_forms: ["give away", "give back"]
  }
};

const QUESTION_KEYS = new Set(Object.keys(QUESTION_PATCHES));
const ITEM_IDS = new Set(Object.keys(ITEM_PATCHES));
const EDITORIAL_REVIEW_STATUS = "phase10_review_passed";

function normalizeQuestionKey(questionId) {
  return String(questionId || "").replaceAll("-", "_");
}

function updateQuestion(question) {
  const patch = QUESTION_PATCHES[normalizeQuestionKey(question.question_id)];
  if (!patch) {
    return question;
  }

  return {
    ...question,
    ...patch,
    tags: unique([
      ...(question.tags || []).filter((tag) => tag !== "draft_shell" && tag !== "resolution:missing"),
      "draft_authored",
      "phase10",
      "resolution:authored"
    ]),
    draft_metadata: {
      ...question.draft_metadata,
      authoring_status: "authored_slice",
      authored_in_phase: "phase10",
      authored_slice_lesson_id: "V3-W1-01",
      editorial_review_status: EDITORIAL_REVIEW_STATUS
    }
  };
}

function updateItem(item) {
  const patch = ITEM_PATCHES[item.item_id];
  if (!patch) {
    return item;
  }

  return {
    ...item,
    ...patch,
    common_wrong_forms: unique(patch.common_wrong_forms),
    draft_metadata: {
      ...item.draft_metadata,
      authoring_status: "authored_slice",
      resolution_status: "authored_slice",
      authored_in_phase: "phase10",
      editorial_review_status: EDITORIAL_REVIEW_STATUS
    }
  };
}

function main() {
  const shells = readJSON(QUESTION_SHELLS_PATH);
  const vocabItemShells = readJSON(VOCAB_ITEMS_PATH);

  let updatedQuestionCount = 0;
  const nextQuestions = shells.questions.map((question) => {
    if (!QUESTION_KEYS.has(normalizeQuestionKey(question.question_id))) {
      return question;
    }
    updatedQuestionCount += 1;
    return updateQuestion(question);
  });

  let updatedItemCount = 0;
  const nextItems = vocabItemShells.items.map((item) => {
    if (!ITEM_IDS.has(item.item_id)) {
      return item;
    }
    updatedItemCount += 1;
    return updateItem(item);
  });

  if (updatedQuestionCount !== QUESTION_KEYS.size) {
    throw new Error(`Expected to update ${QUESTION_KEYS.size} questions, updated ${updatedQuestionCount}.`);
  }

  if (updatedItemCount !== ITEM_IDS.size) {
    throw new Error(`Expected to update ${ITEM_IDS.size} vocab items, updated ${updatedItemCount}.`);
  }

  writeJSON(QUESTION_SHELLS_PATH, {
    ...shells,
    content_generation_note: "Wave 1 remains draft-only. Most rows are still authoring shells, but V3-W1-01 is now a fully authored draft slice for Phase 10 review.",
    questions: nextQuestions
  });

  writeJSON(VOCAB_ITEMS_PATH, {
    ...vocabItemShells,
    content_generation_note: "Wave 1 vocab rows remain draft-only. Seven V3-W1-01 items now include authored examples and trap cues, while the remaining rows are still seed shells.",
    items: nextItems
  });

  console.log(`Authored Phase 10 slice for V3-W1-01: ${updatedQuestionCount} questions, ${updatedItemCount} vocab items.`);
}

main();