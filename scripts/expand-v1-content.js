const fs = require("fs");
const path = require("path");

const OUT_DIR = path.join(__dirname, "..", "data", "vocab");
const SEED_VERSION = "toeic_vocab_tracker_v1_full_2026_05_14";
const QUESTION_FILES = [
  "questions_v0.json",
  "questions_v1a.json",
  "questions_v1b.json",
  "questions_v1c.json",
  "questions_v1d.json",
  "questions_v1e.json",
  "questions_v1f.json"
];
const LETTERS = ["A", "B", "C", "D"];
const SPEED_LESSON_IDS = Array.from({ length: 18 }, (_, index) => `V1-F-${53 + index}`);

const v1aMetadata = [
  {
    group: "V1-A",
    lessonId: "V1-A-11",
    base: "accurate",
    item: "item_accurate_family",
    variants: ["accuracy", "accurate", "accurately", "inaccuracy"],
    forms: { noun: "accuracy", adj: "accurate", adv: "accurately", negative: "inaccuracy" },
    wrong: ["accuratey", "accuration", "accurated"],
    chinese: "準確；準確度；準確地；不準確",
    example: "The finance team checked the accuracy of the invoice before approval.",
    contexts: ["finance", "reports", "invoices"],
    grammar: "SVC_LINKING_VERB_ADJ"
  },
  {
    group: "V1-A",
    lessonId: "V1-A-12",
    base: "efficient",
    item: "item_efficient_family",
    variants: ["efficiency", "efficient", "efficiently", "inefficiency"],
    forms: { noun: "efficiency", adj: "efficient", adv: "efficiently", negative: "inefficiency" },
    wrong: ["efficienty", "efficiencely", "efficienced"],
    chinese: "有效率；效率；有效率地；低效率",
    example: "The warehouse adopted a more efficient delivery process.",
    contexts: ["warehouse", "operations", "delivery"],
    grammar: "ADV_MODIFIES_VERB"
  },
  {
    group: "V1-A",
    lessonId: "V1-A-13",
    base: "responsible",
    item: "item_responsible_family",
    variants: ["responsibility", "responsible", "responsibly", "irresponsible"],
    forms: { noun: "responsibility", adj: "responsible", adv: "responsibly", negative: "irresponsible" },
    wrong: ["responsable", "responsibleness", "responsibled"],
    chinese: "負責；責任；負責地；不負責",
    example: "The supervisor is responsible for checking safety procedures.",
    contexts: ["office", "supervision", "safety"],
    grammar: "ADJ_AFTER_BE"
  },
  {
    group: "V1-A",
    lessonId: "V1-A-14",
    base: "available",
    item: "item_available_family",
    variants: ["availability", "available", "unavailable", "availably"],
    forms: { noun: "availability", adj: "available", adv: "availably", negative: "unavailable" },
    wrong: ["availableness", "availabling", "availablely"],
    chinese: "可取得；可用性；不可用",
    example: "Please check the availability of the meeting room.",
    contexts: ["hotel", "booking", "meetings"],
    grammar: "ADJ_AFTER_BE"
  },
  {
    group: "V1-A",
    lessonId: "V1-A-15",
    base: "successful",
    item: "item_successful_family",
    variants: ["success", "successful", "successfully", "unsuccessful"],
    forms: { noun: "success", adj: "successful", adv: "successfully", negative: "unsuccessful" },
    wrong: ["successly", "successed", "successness"],
    chinese: "成功；成功的；成功地；不成功",
    example: "The campaign was successful in attracting new customers.",
    contexts: ["retail", "marketing", "customers"],
    grammar: "ADV_MODIFIES_VERB"
  },
  {
    group: "V1-A",
    lessonId: "V1-A-16",
    base: "reliable",
    item: "item_reliable_family",
    variants: ["reliability", "reliable", "reliably", "unreliable"],
    forms: { noun: "reliability", adj: "reliable", adv: "reliably", negative: "unreliable" },
    wrong: ["reliablely", "reliabled", "reliableness"],
    chinese: "可靠；可靠性；可靠地；不可靠",
    example: "The clinic needs a reliable supplier for medical equipment.",
    contexts: ["medical", "suppliers", "equipment"],
    grammar: "ADJ_BEFORE_NOUN"
  },
  {
    group: "V1-A",
    lessonId: "V1-A-17",
    base: "productive",
    item: "item_productive_family",
    variants: ["productivity", "productive", "productively", "unproductive"],
    forms: { noun: "productivity", adj: "productive", adv: "productively", negative: "unproductive" },
    wrong: ["productivelyness", "productivityly", "producted"],
    chinese: "有生產力；生產力；有效產出地；無效率",
    example: "The revised schedule made the office more productive.",
    contexts: ["office", "scheduling", "operations"],
    grammar: "ADJ_AFTER_LINKING_VERB"
  },
  {
    group: "V1-A",
    lessonId: "V1-A-18",
    base: "competitive",
    item: "item_competitive_family",
    variants: ["competition", "competitive", "competitively", "competitiveness"],
    forms: { noun: "competition", adj: "competitive", adv: "competitively", abstractNoun: "competitiveness" },
    wrong: ["competitivelyness", "competitioned", "competitiving"],
    chinese: "競爭；有競爭力；以競爭方式；競爭力",
    example: "The airline offered a competitive fare for business travelers.",
    contexts: ["airline", "pricing", "sales"],
    grammar: "ADJ_BEFORE_NOUN"
  },
  {
    group: "V1-A",
    lessonId: "V1-A-19",
    base: "profitable",
    item: "item_profitable_family",
    variants: ["profitability", "profitable", "profitably", "profit"],
    forms: { noun: "profitability", adj: "profitable", adv: "profitably", baseNoun: "profit" },
    wrong: ["profitableness", "profitablely", "profitted"],
    chinese: "獲利；有利可圖；獲利地；利潤",
    example: "The new branch became profitable within six months.",
    contexts: ["finance", "branches", "sales"],
    grammar: "ADJ_AFTER_LINKING_VERB"
  },
  {
    group: "V1-A",
    lessonId: "V1-A-20",
    base: "secure",
    item: "item_secure_family",
    variants: ["security", "secure", "securely", "insecure"],
    forms: { noun: "security", adj: "secure", adv: "securely", negative: "insecure" },
    wrong: ["securement", "securelyness", "securinged"],
    chinese: "安全；安全性；安全地；不安全",
    example: "All customer records must be stored securely.",
    contexts: ["IT", "customer records", "security"],
    grammar: "ADJ_AFTER_BE"
  }
];

const expansionFamilies = [
  {
    group: "V1-B",
    lessonId: "V1-B-21",
    base: "qualify",
    item: "item_qualify_family",
    variants: ["qualify", "qualification", "qualified"],
    forms: { verb: "qualify", noun: "qualification", adj: "qualified", gerund: "qualifying" },
    wrong: ["qualificated", "qualificationed", "qualifiedly"],
    chinese: "符合資格；資格；合格的",
    example: "The recruiter checked each applicant's qualification before the interview.",
    contexts: ["recruiting", "interviews", "HR screening"],
    grammar: "WORD_FAMILY_VERB_NOUN_ADJ",
    sentences: {
      noun: "The recruiter reviewed the applicant's ______ before scheduling the final interview.",
      verb: "Only candidates who ______ for the trainee program will be contacted this week.",
      adj: "The hotel is looking for a ______ supervisor for the front desk team.",
      gerund: "The HR system helps managers with ______ applicants before interviews."
    }
  },
  {
    group: "V1-B",
    lessonId: "V1-B-22",
    base: "employ",
    item: "item_employ_family",
    variants: ["employ", "employment", "employer", "employee", "employed"],
    forms: { verb: "employ", noun: "employment", personNoun: "employer", objectNoun: "employee", past: "employed" },
    wrong: ["employement", "employeer", "employeed"],
    chinese: "雇用；就業；雇主；員工；受雇的",
    example: "The company will employ additional staff during the holiday season.",
    contexts: ["HR", "staffing", "employment contracts"],
    grammar: "WORD_FAMILY_VERB_NOUN_ADJ",
    sentences: {
      noun: "The agency offers ______ services for recent graduates.",
      verb: "The retailer plans to ______ ten temporary workers in December.",
      personNoun: "The ______ must provide safety training to all staff.",
      objectNoun: "Each ______ must wear an identification badge in the warehouse.",
      past: "The technicians were ______ by a certified maintenance firm."
    }
  },
  {
    group: "V1-B",
    lessonId: "V1-B-23",
    base: "apply",
    item: "item_apply_family",
    variants: ["apply", "application", "applicant", "applicable"],
    forms: { verb: "apply", noun: "application", personNoun: "applicant", adj: "applicable" },
    wrong: ["applicance", "applicated", "applicantly"],
    chinese: "申請；申請書；申請人；適用的",
    example: "Each applicant must submit an application by Friday.",
    contexts: ["jobs", "forms", "policy"],
    grammar: "WORD_FAMILY_VERB_NOUN_ADJ",
    sentences: {
      noun: "Please complete the online ______ before the recruitment deadline.",
      verb: "Employees may ______ for the transfer program through the HR portal.",
      personNoun: "The ______ answered all interview questions clearly.",
      adj: "The discount is not ______ to international shipping charges."
    }
  },
  {
    group: "V1-B",
    lessonId: "V1-B-24",
    base: "promote",
    item: "item_promote_family",
    variants: ["promote", "promotion", "promotional"],
    forms: { verb: "promote", noun: "promotion", adj: "promotional", gerund: "promoting" },
    wrong: ["promotive", "promotionally", "promotedly"],
    chinese: "升遷；促銷；推廣的",
    example: "The store launched a promotional campaign for the new product.",
    contexts: ["retail", "marketing", "HR advancement"],
    grammar: "WORD_FAMILY_VERB_NOUN_ADJ",
    sentences: {
      noun: "The sales team prepared a new ______ for the summer catalog.",
      verb: "The company will ______ the assistant manager next month.",
      adj: "The retail chain printed ______ coupons for loyal customers.",
      gerund: "The marketing team is responsible for ______ the new service."
    }
  },
  {
    group: "V1-B",
    lessonId: "V1-B-25",
    base: "assess",
    item: "item_assess_family",
    variants: ["assess", "assessment"],
    forms: { verb: "assess", noun: "assessment", gerund: "assessing", past: "assessed" },
    wrong: ["assession", "assessive", "assessmental"],
    chinese: "評估；評量",
    example: "The manager will assess the training results next week.",
    contexts: ["training", "performance", "HR review"],
    grammar: "WORD_FAMILY_VERB_NOUN",
    sentences: {
      noun: "The supervisor completed an employee ______ after the probation period.",
      verb: "Managers must ______ each trainee's progress before certification.",
      gerund: "The online tool is useful for ______ customer satisfaction.",
      past: "The candidates were ______ by three department heads."
    }
  },
  {
    group: "V1-B",
    lessonId: "V1-B-26",
    base: "recruit",
    item: "item_recruit_family",
    variants: ["recruit", "recruitment", "recruiter"],
    forms: { verb: "recruit", noun: "recruitment", personNoun: "recruiter", objectNoun: "recruit" },
    wrong: ["recruition", "recruitor", "recruitmently"],
    chinese: "招募；招聘；招募人員；新進人員",
    example: "The recruiter posted the opening on several job sites.",
    contexts: ["recruiting", "job fairs", "HR"],
    grammar: "WORD_FAMILY_VERB_NOUN",
    sentences: {
      noun: "The hospital expanded its nurse ______ campaign this year.",
      verb: "The airline hopes to ______ bilingual customer service agents.",
      personNoun: "The ______ reviewed twenty resumes before lunch.",
      objectNoun: "Each new ______ attended an orientation session on Monday."
    }
  },
  {
    group: "V1-B",
    lessonId: "V1-B-27",
    base: "train",
    item: "item_train_family",
    variants: ["train", "training", "trainer", "trained"],
    forms: { verb: "train", noun: "training", personNoun: "trainer", past: "trained" },
    wrong: ["trainment", "trainingly", "trainor"],
    chinese: "訓練；培訓；訓練師；受訓的",
    example: "All new employees receive training before using the system.",
    contexts: ["orientation", "safety", "office systems"],
    grammar: "WORD_FAMILY_VERB_NOUN_ADJ",
    sentences: {
      noun: "The company scheduled safety ______ for warehouse employees.",
      verb: "The consultant will ______ the accounting staff on the new software.",
      personNoun: "The ______ explained the emergency procedures clearly.",
      past: "Only ______ operators may use the calibration equipment."
    }
  },
  {
    group: "V1-B",
    lessonId: "V1-B-28",
    base: "certify",
    item: "item_certify_family",
    variants: ["certify", "certification", "certified"],
    forms: { verb: "certify", noun: "certification", adj: "certified", gerund: "certifying" },
    wrong: ["certificatedly", "certificationed", "certifical"],
    chinese: "認證；證照；合格認證的",
    example: "A certified technician inspected the elevator.",
    contexts: ["maintenance", "training", "professional licenses"],
    grammar: "WORD_FAMILY_VERB_NOUN_ADJ",
    sentences: {
      noun: "The technician must renew his safety ______ every two years.",
      verb: "The agency will ______ inspectors who complete the course.",
      adj: "Only a ______ electrician may repair the control panel.",
      gerund: "The board is responsible for ______ medical assistants."
    }
  },
  {
    group: "V1-C",
    lessonId: "V1-C-29",
    base: "finance",
    item: "item_finance_family",
    variants: ["finance", "financial", "financially"],
    forms: { noun: "finance", adj: "financial", adv: "financially", verb: "finance" },
    wrong: ["financely", "finantial", "financialed"],
    chinese: "財務；財務的；財務上",
    example: "The financial report was sent to the board on Friday.",
    contexts: ["banking", "budgets", "reports"],
    grammar: "WORD_FAMILY_NOUN_ADJ_ADV",
    sentences: {
      noun: "The director of ______ approved the annual spending plan.",
      verb: "The bank agreed to ______ the restaurant's expansion.",
      adj: "The board reviewed the quarterly ______ report.",
      adv: "The project is ______ risky for a small branch."
    }
  },
  {
    group: "V1-C",
    lessonId: "V1-C-30",
    base: "invest",
    item: "item_invest_family",
    variants: ["invest", "investment", "investor"],
    forms: { verb: "invest", noun: "investment", personNoun: "investor", gerund: "investing" },
    wrong: ["investion", "investorly", "investmental"],
    chinese: "投資；投資案；投資人",
    example: "The investor asked for a detailed revenue forecast.",
    contexts: ["finance", "banks", "business plans"],
    grammar: "WORD_FAMILY_VERB_NOUN",
    sentences: {
      noun: "The committee approved a major ______ in new medical equipment.",
      verb: "The company plans to ______ in energy-efficient lighting.",
      personNoun: "The ______ requested a copy of the audited statement.",
      gerund: "The seminar explains the risks of ______ in overseas markets."
    }
  },
  {
    group: "V1-C",
    lessonId: "V1-C-31",
    base: "budget",
    item: "item_budget_family",
    variants: ["budget", "budgetary"],
    forms: { noun: "budget", adj: "budgetary", verb: "budget", gerund: "budgeting" },
    wrong: ["budgetal", "budgetly", "budgetment"],
    chinese: "預算；預算的；編列預算",
    example: "The department must stay within its annual budget.",
    contexts: ["finance", "planning", "office spending"],
    grammar: "WORD_FAMILY_NOUN_ADJ",
    sentences: {
      noun: "The manager reduced travel costs to meet the annual ______.",
      verb: "The team must ______ carefully for the conference.",
      adj: "The accounting office announced several ______ restrictions.",
      gerund: "The workshop covers ______ for small retail businesses."
    }
  },
  {
    group: "V1-C",
    lessonId: "V1-C-32",
    base: "revenue",
    item: "item_revenue_family",
    variants: ["revenue"],
    forms: { noun: "revenue", pluralNoun: "revenues", compound: "revenue-based", gerund: "revenue tracking" },
    wrong: ["revenual", "revenuely", "revenued"],
    chinese: "收入；營收",
    example: "The hotel reported higher revenue after the renovation.",
    contexts: ["finance", "sales", "hospitality"],
    grammar: "WORD_FAMILY_NOUN_USAGE",
    sentences: {
      noun: "The hotel reported a sharp increase in ______ after the summer promotion.",
      pluralNoun: "Monthly ______ were lower than expected at the downtown branch.",
      compound: "The finance team prepared a ______ forecast for investors.",
      gerund: "The software simplifies ______ for regional stores."
    }
  },
  {
    group: "V1-C",
    lessonId: "V1-C-33",
    base: "expense",
    item: "item_expense_family",
    variants: ["expense", "expensive"],
    forms: { noun: "expense", pluralNoun: "expenses", adj: "expensive", gerund: "expensing" },
    wrong: ["expensely", "expension", "expensial"],
    chinese: "費用；昂貴的",
    example: "Travel expenses must be submitted with receipts.",
    contexts: ["accounting", "travel", "reports"],
    grammar: "WORD_FAMILY_NOUN_ADJ",
    sentences: {
      noun: "The accountant questioned one travel ______ on the report.",
      pluralNoun: "All business ______ must be supported by receipts.",
      adj: "The replacement part was too ______ to order immediately.",
      gerund: "The policy explains rules for ______ client meals."
    }
  },
  {
    group: "V1-C",
    lessonId: "V1-C-34",
    base: "audit",
    item: "item_audit_family",
    variants: ["audit", "auditor", "audited"],
    forms: { noun: "audit", personNoun: "auditor", past: "audited", verb: "audit" },
    wrong: ["audition", "auditorialy", "auditted"],
    chinese: "稽核；稽核員；已稽核的",
    example: "The auditor reviewed the expense records.",
    contexts: ["compliance", "accounting", "records"],
    grammar: "WORD_FAMILY_NOUN_VERB",
    sentences: {
      noun: "The annual ______ found several missing receipts.",
      verb: "An outside firm will ______ the regional office next month.",
      personNoun: "The ______ asked for copies of the purchase orders.",
      past: "The ______ financial statements were sent to investors."
    }
  },
  {
    group: "V1-C",
    lessonId: "V1-C-35",
    base: "contract",
    item: "item_contract_family",
    variants: ["contract", "contractual", "contractually"],
    forms: { noun: "contract", adj: "contractual", adv: "contractually", verb: "contract" },
    wrong: ["contractly", "contractuality", "contractedness"],
    chinese: "合約；合約上的；依合約地",
    example: "The supplier is contractually required to deliver parts by Friday.",
    contexts: ["legal", "vendors", "procurement"],
    grammar: "WORD_FAMILY_NOUN_ADJ_ADV",
    sentences: {
      noun: "The vendor signed the service ______ on Monday.",
      verb: "The airline will ______ a local company to clean the aircraft.",
      adj: "The lawyer explained the ______ obligations to the client.",
      adv: "The supplier is ______ required to replace defective items."
    }
  },
  {
    group: "V1-C",
    lessonId: "V1-C-36",
    base: "comply",
    item: "item_comply_family",
    variants: ["comply", "compliance", "compliant"],
    forms: { verb: "comply", noun: "compliance", adj: "compliant", gerund: "complying" },
    wrong: ["compliation", "compliantly", "complyment"],
    chinese: "遵守；合規；合規的",
    example: "All branches must comply with the updated safety policy.",
    contexts: ["compliance", "policies", "regulations"],
    grammar: "WORD_FAMILY_VERB_NOUN_ADJ",
    sentences: {
      noun: "The bank hired a consultant to improve policy ______.",
      verb: "All employees must ______ with the new privacy rules.",
      adj: "The factory is fully ______ with environmental standards.",
      gerund: "The manual explains the process for ______ with local laws."
    }
  },
  {
    group: "V1-D",
    lessonId: "V1-D-37",
    base: "propose",
    item: "item_propose_family",
    variants: ["propose", "proposal", "proposed"],
    forms: { verb: "propose", noun: "proposal", past: "proposed", gerund: "proposing" },
    wrong: ["proposion", "proposaled", "proposedly"],
    chinese: "提議；提案；被提議的",
    example: "The proposed schedule was attached to the email.",
    contexts: ["meetings", "emails", "projects"],
    grammar: "WORD_FAMILY_VERB_NOUN_ADJ",
    sentences: {
      noun: "The committee reviewed the marketing ______ before lunch.",
      verb: "The consultant will ______ a new seating arrangement.",
      past: "The ______ changes were discussed during the staff meeting.",
      gerund: "The team is ______ a shorter process for refunds."
    }
  },
  {
    group: "V1-D",
    lessonId: "V1-D-38",
    base: "confirm",
    item: "item_confirm_family",
    variants: ["confirm", "confirmation", "confirmed"],
    forms: { verb: "confirm", noun: "confirmation", past: "confirmed", gerund: "confirming" },
    wrong: ["confirmance", "confirmationed", "confirmedly"],
    chinese: "確認；確認信；已確認的",
    example: "Please confirm your reservation before noon.",
    contexts: ["hotels", "appointments", "emails"],
    grammar: "WORD_FAMILY_VERB_NOUN_ADJ",
    sentences: {
      noun: "Guests will receive a booking ______ by email.",
      verb: "Please ______ your flight number with the travel desk.",
      past: "The ______ appointment appears on the doctor's schedule.",
      gerund: "The receptionist is ______ tomorrow's reservations."
    }
  },
  {
    group: "V1-D",
    lessonId: "V1-D-39",
    base: "notify",
    item: "item_notify_family",
    variants: ["notify", "notification", "notice"],
    forms: { verb: "notify", noun: "notification", baseNoun: "notice", gerund: "notifying" },
    wrong: ["notificate", "noticement", "notificationed"],
    chinese: "通知；通知訊息；公告",
    example: "The airline will notify passengers of the gate change.",
    contexts: ["announcements", "airlines", "office notices"],
    grammar: "WORD_FAMILY_VERB_NOUN",
    sentences: {
      noun: "Customers will receive a text ______ when the order ships.",
      verb: "The airline must ______ passengers about the delay.",
      baseNoun: "A safety ______ was posted near the elevator.",
      gerund: "The clinic is ______ patients about revised office hours."
    }
  },
  {
    group: "V1-D",
    lessonId: "V1-D-40",
    base: "revise",
    item: "item_revise_family",
    variants: ["revise", "revision", "revised"],
    forms: { verb: "revise", noun: "revision", past: "revised", gerund: "revising" },
    wrong: ["revisement", "revisioned", "revisedly"],
    chinese: "修訂；修訂版；已修訂的",
    example: "The revised invoice includes the correct tax amount.",
    contexts: ["documents", "reports", "invoices"],
    grammar: "WORD_FAMILY_VERB_NOUN_ADJ",
    sentences: {
      noun: "The editor requested one final ______ before printing.",
      verb: "Please ______ the invoice before sending it to accounting.",
      past: "The ______ policy will take effect on July first.",
      gerund: "The team spent the morning ______ the user manual."
    }
  },
  {
    group: "V1-D",
    lessonId: "V1-D-41",
    base: "distribute",
    item: "item_distribute_family",
    variants: ["distribute", "distribution", "distributor"],
    forms: { verb: "distribute", noun: "distribution", personNoun: "distributor", gerund: "distributing" },
    wrong: ["distributement", "distributerly", "distributionalize"],
    chinese: "分發；配送；經銷商",
    example: "The distributor delivered the manuals to each branch.",
    contexts: ["shipping", "retail", "documents"],
    grammar: "WORD_FAMILY_VERB_NOUN",
    sentences: {
      noun: "The warehouse improved product ______ to regional stores.",
      verb: "The assistant will ______ the agenda before the meeting.",
      personNoun: "The ______ handles medical supplies for local clinics.",
      gerund: "The office clerk is ______ updated forms to employees."
    }
  },
  {
    group: "V1-D",
    lessonId: "V1-D-42",
    base: "present",
    item: "item_present_family",
    variants: ["present", "presentation", "presenter"],
    forms: { verb: "present", noun: "presentation", personNoun: "presenter", adj: "present" },
    wrong: ["presentment", "presentationer", "presentate"],
    chinese: "呈現；簡報；簡報者；出席的",
    example: "The presenter explained the sales figures clearly.",
    contexts: ["meetings", "training", "sales reports"],
    grammar: "WORD_FAMILY_VERB_NOUN",
    sentences: {
      noun: "The sales team prepared a short ______ for the client.",
      verb: "The analyst will ______ the quarterly figures tomorrow.",
      personNoun: "The ______ answered questions after the training session.",
      adj: "All managers must be ______ at the safety briefing."
    }
  },
  {
    group: "V1-D",
    lessonId: "V1-D-43",
    base: "attach",
    item: "item_attach_family",
    variants: ["attach", "attachment", "attached"],
    forms: { verb: "attach", noun: "attachment", past: "attached", gerund: "attaching" },
    wrong: ["attachation", "attachmented", "attachedly"],
    chinese: "附上；附件；已附上的",
    example: "The invoice is attached to this email.",
    contexts: ["emails", "documents", "invoices"],
    grammar: "WORD_FAMILY_VERB_NOUN_ADJ",
    sentences: {
      noun: "Please open the email ______ for the revised contract.",
      verb: "Remember to ______ the receipt to the expense report.",
      past: "The ______ document explains the warranty terms.",
      gerund: "The assistant is ______ labels to the product samples."
    }
  },
  {
    group: "V1-D",
    lessonId: "V1-D-44",
    base: "respond",
    item: "item_respond_family",
    variants: ["respond", "response", "responsive"],
    forms: { verb: "respond", noun: "response", adj: "responsive", gerund: "responding" },
    wrong: ["respondment", "responsely", "respondate"],
    chinese: "回覆；回應；反應迅速的",
    example: "Customer service gave a quick response to the complaint.",
    contexts: ["customer service", "emails", "support"],
    grammar: "WORD_FAMILY_VERB_NOUN_ADJ",
    sentences: {
      noun: "The client expects a written ______ by the end of the day.",
      verb: "Please ______ to the customer's email within two hours.",
      adj: "The support team is highly ______ during peak travel season.",
      gerund: "The manager thanked staff for ______ quickly to complaints."
    }
  },
  {
    group: "V1-E",
    lessonId: "V1-E-45",
    base: "maintain",
    item: "item_maintain_family",
    variants: ["maintain", "maintenance"],
    forms: { verb: "maintain", noun: "maintenance", gerund: "maintaining", past: "maintained" },
    wrong: ["maintainance", "maintainment", "maintenanced"],
    chinese: "維持；保養；維護",
    example: "Regular maintenance keeps the elevators safe.",
    contexts: ["facilities", "equipment", "buildings"],
    grammar: "WORD_FAMILY_VERB_NOUN",
    sentences: {
      noun: "The hotel scheduled elevator ______ for Tuesday morning.",
      verb: "Staff must ______ a clean lobby throughout the day.",
      gerund: "The facility team is responsible for ______ all emergency exits.",
      past: "The heating system was carefully ______ during winter."
    }
  },
  {
    group: "V1-E",
    lessonId: "V1-E-46",
    base: "inspect",
    item: "item_inspect_family",
    variants: ["inspect", "inspection", "inspector"],
    forms: { verb: "inspect", noun: "inspection", personNoun: "inspector", gerund: "inspecting" },
    wrong: ["inspectation", "inspecter", "inspectioned"],
    chinese: "檢查；檢查作業；檢查員",
    example: "The inspector checked the kitchen equipment.",
    contexts: ["safety", "facilities", "restaurants"],
    grammar: "WORD_FAMILY_VERB_NOUN",
    sentences: {
      noun: "The restaurant passed its annual safety ______.",
      verb: "A technician will ______ the air-conditioning unit tomorrow.",
      personNoun: "The ______ found a problem with the emergency lights.",
      gerund: "The crew is ______ each machine before production starts."
    }
  },
  {
    group: "V1-E",
    lessonId: "V1-E-47",
    base: "install",
    item: "item_install_family",
    variants: ["install", "installation", "installed"],
    forms: { verb: "install", noun: "installation", past: "installed", gerund: "installing" },
    wrong: ["installment", "installationed", "instalation"],
    chinese: "安裝；安裝工程；已安裝的",
    example: "The installed security cameras cover every entrance.",
    contexts: ["IT", "facilities", "security systems"],
    grammar: "WORD_FAMILY_VERB_NOUN_ADJ",
    sentences: {
      noun: "The software ______ will take about thirty minutes.",
      verb: "The technician will ______ new monitors in the training room.",
      past: "The newly ______ system requires a password.",
      gerund: "The contractor is ______ lights in the parking area."
    }
  },
  {
    group: "V1-E",
    lessonId: "V1-E-48",
    base: "operate",
    item: "item_operate_family",
    variants: ["operate", "operation", "operational"],
    forms: { verb: "operate", noun: "operation", adj: "operational", gerund: "operating" },
    wrong: ["operationed", "operationallyed", "operatement"],
    chinese: "操作；營運；可運作的",
    example: "The machine is fully operational after the repair.",
    contexts: ["machines", "operations", "facilities"],
    grammar: "WORD_FAMILY_VERB_NOUN_ADJ",
    sentences: {
      noun: "The factory manager reviewed the daily ______ schedule.",
      verb: "Only trained staff may ______ the packaging machine.",
      adj: "The backup generator is now fully ______.",
      gerund: "The manual explains safe ______ procedures."
    }
  },
  {
    group: "V1-E",
    lessonId: "V1-E-49",
    base: "repair",
    item: "item_repair_family",
    variants: ["repair", "repaired", "repairing"],
    forms: { noun: "repair", verb: "repair", past: "repaired", gerund: "repairing" },
    wrong: ["repairment", "reparationed", "repairly"],
    chinese: "修理；維修；已修好的",
    example: "The repaired printer was returned to the accounting office.",
    contexts: ["office equipment", "maintenance", "service requests"],
    grammar: "WORD_FAMILY_NOUN_VERB",
    sentences: {
      noun: "The copier needs a minor ______ before the audit.",
      verb: "A technician will ______ the printer after lunch.",
      past: "The ______ equipment was moved back to the conference room.",
      gerund: "The service team is ______ the escalator near Gate 4."
    }
  },
  {
    group: "V1-E",
    lessonId: "V1-E-50",
    base: "renovate",
    item: "item_renovate_family",
    variants: ["renovate", "renovation", "renovated"],
    forms: { verb: "renovate", noun: "renovation", past: "renovated", gerund: "renovating" },
    wrong: ["renovationed", "renovately", "renovative"],
    chinese: "翻新；整修；已翻新的",
    example: "The renovated lobby opened before the conference.",
    contexts: ["hotels", "offices", "facilities"],
    grammar: "WORD_FAMILY_VERB_NOUN_ADJ",
    sentences: {
      noun: "The lobby ______ will be completed by September.",
      verb: "The hotel plans to ______ all guest rooms this year.",
      past: "The ______ office has more natural light.",
      gerund: "The contractor is ______ the reception area at night."
    }
  },
  {
    group: "V1-E",
    lessonId: "V1-E-51",
    base: "equip",
    item: "item_equip_family",
    variants: ["equip", "equipment", "equipped"],
    forms: { verb: "equip", noun: "equipment", past: "equipped", gerund: "equipping" },
    wrong: ["equipments", "equiped", "equipmental"],
    chinese: "配備；設備；配備好的",
    example: "The training room is equipped with video screens.",
    contexts: ["training rooms", "medical offices", "warehouses"],
    grammar: "WORD_FAMILY_VERB_NOUN_ADJ",
    sentences: {
      noun: "The clinic ordered new medical ______ for the exam rooms.",
      verb: "The company will ______ each driver with a mobile scanner.",
      past: "The conference room is ______ with wireless microphones.",
      gerund: "The warehouse is ______ workers with protective gear."
    }
  },
  {
    group: "V1-E",
    lessonId: "V1-E-52",
    base: "calibrate",
    item: "item_calibrate_family",
    variants: ["calibrate", "calibration", "calibrated"],
    forms: { verb: "calibrate", noun: "calibration", past: "calibrated", gerund: "calibrating" },
    wrong: ["calibrationed", "calibrately", "calibratment"],
    chinese: "校準；校準作業；已校準的",
    example: "The calibrated device produced accurate readings.",
    contexts: ["medical devices", "manufacturing", "quality control"],
    grammar: "WORD_FAMILY_VERB_NOUN_ADJ",
    sentences: {
      noun: "The scale requires ______ before the laboratory opens.",
      verb: "Technicians must ______ the device every morning.",
      past: "Only ______ instruments may be used for the test.",
      gerund: "The engineer is ______ the sensor in the production line."
    }
  }
];

function readJSON(fileName) {
  return JSON.parse(fs.readFileSync(path.join(OUT_DIR, fileName), "utf8"));
}

function writeJSON(fileName, value) {
  fs.writeFileSync(path.join(OUT_DIR, fileName), `${JSON.stringify(value, null, 2)}\n`);
}

function normalizeId(value) {
  return String(value).toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function optionObject(options, correctShift) {
  const cleaned = unique(options).slice(0, 4);
  if (cleaned.length !== 4) {
    throw new Error(`Question options must contain four unique values. Got: ${JSON.stringify(options)}`);
  }
  const out = {};
  LETTERS.forEach((letter, index) => {
    out[letter] = cleaned[(index + correctShift) % cleaned.length];
  });
  const correct = cleaned[0];
  return {
    options: out,
    correct_answer: LETTERS.find((letter) => out[letter] === correct)
  };
}

function optionPool(family, correct) {
  return unique([
    correct,
    family.forms.noun,
    family.forms.pluralNoun,
    family.forms.baseNoun,
    family.forms.objectNoun,
    family.forms.personNoun,
    family.forms.verb,
    family.forms.adj,
    family.forms.adv,
    family.forms.past,
    family.forms.gerund,
    family.forms.compound,
    family.forms.negative,
    family.forms.abstractNoun,
    ...(family.variants || []),
    ...(family.wrong || [])
  ]);
}

function pickForm(family, requested, index) {
  const preferred = [
    requested,
    "noun",
    "verb",
    "adj",
    "adv",
    "past",
    "gerund",
    "personNoun",
    "pluralNoun",
    "baseNoun",
    "objectNoun",
    "compound",
    "negative",
    "abstractNoun"
  ];
  for (const key of preferred) {
    if (family.forms[key]) return { key, value: family.forms[key] };
  }
  const fallback = unique([...(family.variants || []), ...(family.wrong || [])])[index % unique([...(family.variants || []), ...(family.wrong || [])]).length];
  return { key: "form", value: fallback };
}

function titleCase(value) {
  return String(value || "TOEIC context")
    .split(/[\s-]+/)
    .map((part) => part ? part.charAt(0).toUpperCase() + part.slice(1) : "")
    .join(" ");
}

function withScene(sentence, index, family) {
  const contexts = family.contexts || ["TOEIC context"];
  const context = contexts[(index + Math.floor(index / contexts.length)) % contexts.length];
  return `${titleCase(context)}: ${sentence}`;
}

function defaultSentence(family, formKey) {
  const sentences = family.sentences || {};
  if (sentences[formKey]) return sentences[formKey];
  if (formKey === "noun" || formKey === "pluralNoun" || formKey === "baseNoun" || formKey === "objectNoun") {
    return `The manager reviewed the ______ before approving the request.`;
  }
  if (formKey === "verb") return `The team must ______ the documents before noon.`;
  if (formKey === "adj" || formKey === "past" || formKey === "compound") {
    return `The ______ report was sent to the department manager.`;
  }
  if (formKey === "adv") return `The task was completed ______ by the coordinator.`;
  if (formKey === "gerund") return `The manual explains procedures for ______ requests.`;
  return `The manager selected the correct ______ for the sentence.`;
}

function explanationFor(formKey, correct, family, interference) {
  const label = interference ? "舊字族干擾題：" : "";
  const notes = {
    noun: "此空格需要名詞。",
    pluralNoun: "此空格需要複數或集合名詞。",
    baseNoun: "此空格需要名詞。",
    objectNoun: "此空格需要表示人的名詞。",
    personNoun: "此空格需要表示人的名詞。",
    verb: "此空格位於助動詞或不定詞後，需要動詞原形。",
    adj: "此空格修飾名詞或描述主詞，需要形容詞。",
    past: "此空格需要過去分詞或已完成狀態。",
    adv: "此空格修飾動作，需要副詞。",
    gerund: "此空格位於介系詞或程序描述後，需要動名詞。",
    compound: "此空格需要複合形容詞。",
    negative: "句意需要否定或反向形式。",
    abstractNoun: "此空格需要抽象名詞。"
  };
  return `${label}${notes[formKey] || "此空格需要正確字族形式。"} ${family.base} 字族中正確答案是 ${correct}。`;
}

const patternCycle = ["noun", "verb", "adj", "past", "adv", "gerund", "personNoun", "pluralNoun"];

function buildQuestion({ family, lessonId, index, review, speed, interference }) {
  const requested = patternCycle[index % patternCycle.length];
  const picked = pickForm(family, requested, index);
  const sequence = String(index + 1).padStart(3, "0");
  const prefix = review ? "rv" : "q";
  const idPrefix = lessonId.toLowerCase().replace(/-/g, "_");
  const type = speed
    ? "speed_drill"
    : review
      ? "review_question"
      : index % 5 === 2
        ? "part5_sentence_completion"
        : "word_family";
  const shift = (index + Number(lessonId.split("-").pop())) % 4;
  const { options, correct_answer } = optionObject(optionPool(family, picked.value), shift);
  const questionText = type === "review_question"
    ? withScene(`Quick review: choose the correct ${family.base} word-family form. ${defaultSentence(family, picked.key)}`, index, family)
    : withScene(defaultSentence(family, picked.key), index, family);

  return {
    question_id: `${idPrefix}_${prefix}_${sequence}`,
    lesson_id: lessonId,
    stage: "V1",
    type,
    skill: "word_family",
    subskill: speed ? "mixed_speed_reflex" : picked.key,
    grammar_link_id: family.grammar || "WORD_FAMILY_FORM",
    question_text: questionText,
    options,
    correct_answer,
    explanation_zh: explanationFor(picked.key, picked.value, family, interference),
    target_item_id: family.item,
    distractor_type: "same_word_family",
    difficulty: speed ? 3 : 2 + (index % 2),
    estimated_time_seconds: speed ? 8 : type === "review_question" ? 12 : 20,
    default_error_code: speed ? "TIME_PRESSURE" : "WORD_FAMILY_POS",
    tags: unique([
      "toeic_part5",
      "word_family",
      speed ? "speed_drill" : "v1_full",
      family.group.toLowerCase(),
      ...(interference ? ["old_item_interference"] : [])
    ])
  };
}

function buildFamilyLessonQuestions(family, priorFamilies) {
  const questions = [];
  for (let index = 0; index < 20; index += 1) {
    const useInterference = index >= 15 && priorFamilies.length > 0;
    const source = useInterference
      ? priorFamilies[(index + Number(family.lessonId.split("-").pop())) % priorFamilies.length]
      : family;
    questions.push(buildQuestion({
      family: source,
      lessonId: family.lessonId,
      index,
      review: false,
      speed: false,
      interference: useInterference
    }));
  }
  for (let index = 20; index < 24; index += 1) {
    questions.push(buildQuestion({
      family,
      lessonId: family.lessonId,
      index,
      review: true,
      speed: false,
      interference: false
    }));
  }
  return questions;
}

function buildSpeedQuestions(allFamilies) {
  const questions = [];
  SPEED_LESSON_IDS.forEach((lessonId, lessonIndex) => {
    for (let index = 0; index < 40; index += 1) {
      const family = allFamilies[(lessonIndex * 11 + index * 3) % allFamilies.length];
      questions.push(buildQuestion({
        family,
        lessonId,
        index,
        review: false,
        speed: true,
        interference: lessonIndex > 0 || index > 4
      }));
    }
  });
  return questions;
}

function buildLessonRecord(family, questions) {
  const lessonQuestions = questions.filter((question) => question.lesson_id === family.lessonId && question.type !== "review_question");
  const reviewQuestions = questions.filter((question) => question.lesson_id === family.lessonId && question.type === "review_question");
  return {
    lesson_id: family.lessonId,
    stage: "V1",
    stage_name: "Word Family",
    lesson_number: Number(family.lessonId.split("-").pop()),
    title: `${family.base} word family`,
    estimated_minutes: 45,
    lesson_type: "word_family",
    target_items: family.variants,
    question_ids: lessonQuestions.map((question) => question.question_id),
    review_question_ids: reviewQuestions.map((question) => question.question_id),
    mastery_threshold: 0.8,
    seal_threshold: 0.85,
    grammar_link_id: family.grammar || null,
    status: "not_started"
  };
}

function buildSpeedLessonRecord(lessonId, questions, allFamilies) {
  const lessonNumber = Number(lessonId.split("-").pop());
  const lessonQuestions = questions.filter((question) => question.lesson_id === lessonId);
  const targetItems = unique(lessonQuestions.map((question) => {
    const family = allFamilies.find((row) => row.item === question.target_item_id);
    return family ? family.base : question.target_item_id;
  })).slice(0, 16);
  return {
    lesson_id: lessonId,
    stage: "V1",
    stage_name: "Word Family",
    lesson_number: lessonNumber,
    title: `V1 mixed word family speed reflex ${String(lessonNumber - 52).padStart(2, "0")}`,
    estimated_minutes: 45,
    lesson_type: "speed_drill",
    target_items: targetItems,
    question_ids: lessonQuestions.map((question) => question.question_id),
    review_question_ids: [],
    mastery_threshold: 0.8,
    seal_threshold: 0.85,
    grammar_link_id: "WORD_FAMILY_SPEED_REFLEX",
    status: "not_started"
  };
}

function updateCurriculum(curriculum, groupedQuestions, allFamilies) {
  const existing = curriculum.lessons.filter((lesson) => {
    if (lesson.stage !== "V1") return true;
    return /^V1-A-/.test(lesson.lesson_id);
  });
  const newLessons = [];
  expansionFamilies.forEach((family) => {
    newLessons.push(buildLessonRecord(family, groupedQuestions[normalizeId(family.group)] || []));
  });
  SPEED_LESSON_IDS.forEach((lessonId) => {
    newLessons.push(buildSpeedLessonRecord(lessonId, groupedQuestions.v1f || [], allFamilies));
  });

  const stages = curriculum.stages.map((stage) => (
    stage.stage === "V1"
      ? { ...stage, total_lessons: 60, status: "available" }
      : stage
  ));

  return {
    ...curriculum,
    seed_version: SEED_VERSION,
    generated_at: "2026-05-14T00:00:00+08:00",
    question_files: QUESTION_FILES,
    stages,
    lessons: [...existing, ...newLessons].sort((a, b) => (a.lesson_number || 0) - (b.lesson_number || 0))
  };
}

function itemRecord(family, existing) {
  const speedLessonIds = SPEED_LESSON_IDS;
  return {
    item_id: family.item,
    item_type: "word_family",
    stage: "V1",
    lesson_id: family.lessonId,
    lesson_ids: unique([family.lessonId, ...speedLessonIds]),
    base_word: family.base,
    variants: family.variants,
    chinese: family.chinese,
    example: family.example,
    common_wrong_forms: family.wrong || [],
    toeic_contexts: family.contexts || [],
    review_priority: 3,
    mastery_score: 0,
    mastery_level: "blind",
    ...(existing || {})
  };
}

function updateVocabItems(items, allFamilies) {
  const byId = Object.fromEntries(items.map((item) => [item.item_id, item]));
  allFamilies.forEach((family) => {
    byId[family.item] = itemRecord(family, byId[family.item]);
  });
  return Object.values(byId).sort((a, b) => String(a.item_id).localeCompare(String(b.item_id)));
}

function expandV1Content(options = {}) {
  const curriculum = readJSON("curriculum.json");
  const vocabItems = readJSON("vocab_items.json");
  const allFamilies = [...v1aMetadata, ...expansionFamilies];
  const groupedQuestions = {};
  const priorFamilies = [...v1aMetadata];

  ["v1_b", "v1_c", "v1_d", "v1_e"].forEach((group) => {
    const groupFamilies = expansionFamilies.filter((family) => normalizeId(family.group) === group);
    groupedQuestions[group] = [];
    groupFamilies.forEach((family) => {
      groupedQuestions[group].push(...buildFamilyLessonQuestions(family, priorFamilies));
      priorFamilies.push(family);
    });
    writeJSON(`questions_${group.replace("_", "")}.json`, groupedQuestions[group]);
  });

  groupedQuestions.v1f = buildSpeedQuestions(allFamilies);
  writeJSON("questions_v1f.json", groupedQuestions.v1f);

  writeJSON("curriculum.json", updateCurriculum(curriculum, groupedQuestions, allFamilies));
  writeJSON("vocab_items.json", updateVocabItems(vocabItems, allFamilies));

  if (!options.silent) {
    const newQuestionCount = Object.values(groupedQuestions).flat().length;
    console.log(`Expanded V1-B to V1-F with ${expansionFamilies.length + SPEED_LESSON_IDS.length} lessons and ${newQuestionCount} questions.`);
  }
}

if (require.main === module) {
  expandV1Content();
}

module.exports = {
  QUESTION_FILES,
  SEED_VERSION,
  expandV1Content
};
