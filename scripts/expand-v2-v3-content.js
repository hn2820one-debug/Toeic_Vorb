const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const vocabDir = path.join(root, "data", "vocab");
const curriculumPath = path.join(vocabDir, "curriculum.json");
const vocabItemsPath = path.join(vocabDir, "vocab_items.json");
const grammarLinksPath = path.join(vocabDir, "grammar_links.json");

const SEED_VERSION = "toeic_vocab_tracker_v2_v3_quality_2026_05_14";
const ANSWERS = ["A", "B", "C", "D"];
const V2_FILES = ["questions_v2a.json", "questions_v2b.json", "questions_v2c.json", "questions_v2d.json", "questions_v2e.json"];
const V3_FILES = ["questions_v3a.json", "questions_v3b.json", "questions_v3c.json", "questions_v3d.json", "questions_v3e.json", "questions_v3f.json"];

function readJSON(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJSON(filePath, value) {
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function slug(value) {
  return String(value)
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function titleCase(value) {
  return String(value)
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function arrangeOptions(correct, distractors, desiredAnswer) {
  const cleanDistractors = [...new Set(distractors.filter((item) => item && item !== correct))].slice(0, 3);
  while (cleanDistractors.length < 3) cleanDistractors.push(`${correct} option ${cleanDistractors.length + 1}`);
  const values = {};
  let distractorIndex = 0;
  ANSWERS.forEach((letter) => {
    values[letter] = letter === desiredAnswer ? correct : cleanDistractors[distractorIndex++];
  });
  return values;
}

function answerFor(index, offset = 0) {
  return ANSWERS[(index + offset) % ANSWERS.length];
}

function sceneItem(lessonId, term, chinese, context, groupCode) {
  return {
    item_id: `item_v2_${lessonId.toLowerCase().replace(/-/g, "_")}_${slug(term)}`,
    item_type: "scene_vocabulary",
    stage: "V2",
    lesson_id: lessonId,
    lesson_ids: [lessonId],
    base_word: term,
    variants: [term],
    chinese,
    example: `The ${context} task required the team to understand "${term}" correctly.`,
    common_wrong_forms: [],
    toeic_contexts: [context, groupCode.toLowerCase(), "toeic_scene"],
    review_priority: 3,
    mastery_score: 0,
    mastery_level: "blind"
  };
}

function collocationItem(lessonId, phrase, context, groupCode) {
  const wrongForms = wrongCollocations(phrase);
  return {
    item_id: `item_v3_${lessonId.toLowerCase().replace(/-/g, "_")}_${slug(phrase)}`,
    item_type: "collocation",
    stage: "V3",
    lesson_id: lessonId,
    lesson_ids: [lessonId],
    base_word: phrase,
    variants: [phrase, ...wrongForms],
    chinese: `固定搭配：${phrase}`,
    example: `The department needs to ${phrase} during the ${context} task.`,
    common_wrong_forms: wrongForms,
    toeic_contexts: [context, groupCode.toLowerCase(), "toeic_collocation"],
    review_priority: 3,
    mastery_score: 0,
    mastery_level: "blind"
  };
}

const SCENE_GROUPS = [
  {
    code: "A",
    file: "questions_v2a.json",
    offset: 0,
    groupTitle: "Office / Administration",
    context: "office administration",
    lessons: [
      ["Office Equipment Scene Vocabulary", [["workstation", "工作站"], ["extension", "分機"], ["photocopier", "影印機"], ["stationery", "文具"]]],
      ["Meeting Scene Vocabulary", [["agenda", "議程"], ["minutes", "會議紀錄"], ["attendee", "與會者"], ["venue", "場地"]]],
      ["Scheduling Scene Vocabulary", [["appointment", "預約"], ["deadline", "截止期限"], ["itinerary", "行程表"], ["availability", "可用時間"]]],
      ["Office Document Scene Vocabulary", [["memo", "備忘錄"], ["invoice", "發票"], ["attachment", "附件"], ["directory", "名錄"]]],
      ["Office Communication Scene Vocabulary", [["correspondence", "往來信件"], ["notification", "通知"], ["inquiry", "詢問"], ["recipient", "收件人"]]],
      ["Office Facility Scene Vocabulary", [["lobby", "大廳"], ["elevator", "電梯"], ["cafeteria", "員工餐廳"], ["parking", "停車"]]],
      ["Office Procedure Scene Vocabulary", [["authorization", "授權"], ["request form", "申請表"], ["approval", "核准"], ["submission", "提交"]]],
      ["Business Event Scene Vocabulary", [["registration", "報名"], ["banquet", "宴會"], ["booth", "攤位"], ["seminar", "研討會"]]],
      ["Business Travel Scene Vocabulary", [["reservation", "預訂"], ["confirmation", "確認函"], ["departure", "出發"], ["baggage", "行李"]]],
      ["Workplace Policy Scene Vocabulary", [["policy", "政策"], ["guideline", "指引"], ["compliance", "合規"], ["requirement", "要求"]]]
    ]
  },
  {
    code: "B",
    file: "questions_v2b.json",
    offset: 1,
    groupTitle: "Logistics / Travel",
    context: "logistics",
    lessons: [
      ["Shipping Status Scene Vocabulary", [["shipment", "貨運"], ["carrier", "承運商"], ["tracking number", "追蹤號碼"], ["warehouse", "倉庫"]]],
      ["Inventory Scene Vocabulary", [["inventory", "庫存"], ["stock", "存貨"], ["reorder", "再次訂購"], ["supplier", "供應商"]]],
      ["International Delivery Scene Vocabulary", [["delivery", "送貨"], ["freight", "貨運費"], ["customs", "海關"], ["clearance", "通關"]]],
      ["Package Document Scene Vocabulary", [["package", "包裹"], ["label", "標籤"], ["receipt", "收據"], ["packing slip", "裝箱單"]]],
      ["Manufacturing Scene Vocabulary", [["production", "生產"], ["assembly line", "裝配線"], ["component", "零件"], ["defect", "瑕疵"]]],
      ["Maintenance Request Scene Vocabulary", [["inspection", "檢查"], ["repair request", "維修申請"], ["technician", "技術人員"], ["equipment", "設備"]]],
      ["Employee Travel Scene Vocabulary", [["boarding pass", "登機證"], ["accommodation", "住宿"], ["reimbursement", "報銷"], ["travel allowance", "差旅津貼"]]],
      ["Vendor Purchase Scene Vocabulary", [["quotation", "報價"], ["purchase order", "採購單"], ["contract", "合約"], ["delivery date", "交貨日期"]]],
      ["Cargo Document Scene Vocabulary", [["bill of lading", "提單"], ["cargo", "貨物"], ["destination", "目的地"], ["delay", "延誤"]]],
      ["Return Process Scene Vocabulary", [["return authorization", "退貨授權"], ["replacement", "替換品"], ["refund", "退款"], ["warranty", "保固"]]]
    ]
  },
  {
    code: "C",
    file: "questions_v2c.json",
    offset: 2,
    groupTitle: "HR / Workplace",
    context: "human resources",
    lessons: [
      ["Recruitment Scene Vocabulary", [["recruitment", "招募"], ["applicant", "申請人"], ["resume", "履歷"], ["reference", "推薦人"]]],
      ["Interview Scene Vocabulary", [["interview", "面試"], ["orientation", "到職訓練"], ["probation", "試用期"], ["position", "職位"]]],
      ["Employee Benefit Scene Vocabulary", [["benefits", "福利"], ["payroll", "薪資作業"], ["overtime", "加班"], ["vacation leave", "休假"]]],
      ["Performance Scene Vocabulary", [["appraisal", "考核"], ["promotion", "升遷"], ["transfer", "調職"], ["resignation", "辭職"]]],
      ["Training Scene Vocabulary", [["workshop", "工作坊"], ["certificate", "證書"], ["instructor", "講師"], ["enrollment", "報名"]]],
      ["Workplace Conduct Scene Vocabulary", [["attendance", "出勤"], ["dress code", "服裝規定"], ["supervisor", "主管"], ["colleague", "同事"]]],
      ["Staffing Scene Vocabulary", [["vacancy", "職缺"], ["candidate", "候選人"], ["department", "部門"], ["branch", "分公司"]]],
      ["Onboarding Scene Vocabulary", [["handbook", "手冊"], ["badge", "識別證"], ["access card", "門禁卡"], ["workspace", "工作空間"]]],
      ["Employee Record Scene Vocabulary", [["personnel file", "人事檔案"], ["emergency contact", "緊急聯絡人"], ["tax form", "稅務表格"], ["direct deposit", "薪資轉帳"]]],
      ["Workplace Safety Scene Vocabulary", [["evacuation", "疏散"], ["hazard", "危害"], ["incident report", "事故報告"], ["first aid kit", "急救箱"]]]
    ]
  },
  {
    code: "D",
    file: "questions_v2d.json",
    offset: 3,
    groupTitle: "Finance / Sales",
    context: "finance and sales",
    lessons: [
      ["Financial Result Scene Vocabulary", [["budget", "預算"], ["expense", "費用"], ["revenue", "收入"], ["profit", "利潤"]]],
      ["Payment Scene Vocabulary", [["payment", "付款"], ["billing address", "帳單地址"], ["balance", "餘額"], ["due date", "到期日"]]],
      ["Banking Scene Vocabulary", [["deposit", "存款"], ["withdrawal", "提款"], ["transaction", "交易"], ["statement", "對帳單"]]],
      ["Accounting Scene Vocabulary", [["ledger", "分類帳"], ["audit", "稽核"], ["tax", "稅"], ["deduction", "扣除額"]]],
      ["Pricing Scene Vocabulary", [["estimate", "估價"], ["discount", "折扣"], ["surcharge", "附加費"], ["rate", "費率"]]],
      ["Sales Scene Vocabulary", [["client", "客戶"], ["prospect", "潛在客戶"], ["subscription", "訂閱"], ["renewal", "續約"]]],
      ["Procurement Scene Vocabulary", [["procurement", "採購"], ["vendor", "供應商"], ["requisition", "請購單"], ["bid", "投標"]]],
      ["Compliance Scene Vocabulary", [["regulation", "法規"], ["violation", "違規"], ["permit", "許可證"], ["license", "執照"]]],
      ["Insurance Scene Vocabulary", [["coverage", "保障範圍"], ["claim", "理賠申請"], ["premium", "保費"], ["policyholder", "保戶"]]],
      ["Investment Scene Vocabulary", [["portfolio", "投資組合"], ["dividend", "股利"], ["shareholder", "股東"], ["forecast", "預測"]]]
    ]
  },
  {
    code: "E",
    file: "questions_v2e.json",
    offset: 0,
    groupTitle: "Service / Public Notice",
    context: "customer service",
    lessons: [
      ["Hotel Scene Vocabulary", [["front desk", "櫃檯"], ["housekeeping", "客房清潔"], ["checkout", "退房"], ["guest room", "客房"]]],
      ["Restaurant Scene Vocabulary", [["menu", "菜單"], ["catering", "外燴"], ["beverage", "飲料"], ["reservation desk", "訂位櫃台"]]],
      ["Retail Scene Vocabulary", [["merchandise", "商品"], ["aisle", "走道"], ["cashier", "收銀員"], ["exchange policy", "換貨政策"]]],
      ["Customer Service Scene Vocabulary", [["complaint", "投訴"], ["representative", "客服代表"], ["resolution", "解決方案"], ["follow-up", "後續追蹤"]]],
      ["Healthcare Scene Vocabulary", [["prescription", "處方"], ["clinic", "診所"], ["patient", "病人"], ["appointment reminder", "預約提醒"]]],
      ["Airline Scene Vocabulary", [["gate", "登機門"], ["boarding", "登機"], ["luggage", "行李"], ["flight delay", "班機延誤"]]],
      ["Public Notice Scene Vocabulary", [["renovation", "整修"], ["closure", "關閉"], ["relocation", "搬遷"], ["access restriction", "通行限制"]]],
      ["Technology Support Scene Vocabulary", [["password", "密碼"], ["outage", "服務中斷"], ["update", "更新"], ["backup", "備份"]]],
      ["Marketing Scene Vocabulary", [["brochure", "小冊子"], ["campaign", "活動"], ["sample", "樣品"], ["feedback", "意見回饋"]]],
      ["Building Utility Scene Vocabulary", [["electricity", "電力"], ["plumbing", "水管系統"], ["heating", "暖氣"], ["ventilation", "通風"]]]
    ]
  }
];

const V2_SCENE_VOCABULARY_CLUES = {
  workstation: "desk-and-computer setup for work",
  extension: "internal phone number within office",
  photocopier: "machine making paper copies",
  stationery: "office paper supplies and materials",
  agenda: "list of meeting discussion topics",
  minutes: "official written record of meeting",
  attendee: "person present at meeting event",
  venue: "location where event is held",
  appointment: "scheduled meeting with specific person",
  deadline: "final date for task completion",
  itinerary: "detailed travel schedule and plan",
  availability: "times when person is free",
  memo: "brief written office communication",
  invoice: "bill for goods or services",
  attachment: "document sent with email message",
  directory: "list of names and contact details",
  correspondence: "exchange of written messages",
  notification: "official announcement or alert",
  inquiry: "formal question or request",
  recipient: "person receiving the communication",
  lobby: "entrance hall of building",
  elevator: "moving platform between floors",
  cafeteria: "dining hall for employees",
  parking: "lot for storing vehicles",
  authorization: "official permission to proceed",
  "request form": "document asking for something",
  approval: "official agreement or consent",
  submission: "act of sending something formal",
  registration: "process of signing up",
  banquet: "formal dinner event for group",
  booth: "temporary enclosed sales area",
  seminar: "small educational training session",
  reservation: "advance booking or hold",
  confirmation: "verification that a booking is final",
  departure: "leaving on a journey",
  baggage: "luggage and personal items",
  shipment: "delivery of goods by transport",
  carrier: "company transporting goods",
  "tracking number": "reference used to follow package status",
  warehouse: "large storage building for goods",
  inventory: "count of goods in stock",
  stock: "items available for sale",
  reorder: "placing a new purchase request",
  supplier: "business providing goods",
  delivery: "bringing goods to destination",
  freight: "cargo transported by vehicle",
  customs: "government border inspection point",
  clearance: "official permission to proceed",
  package: "wrapped item ready for shipping",
  label: "tag with information on item",
  receipt: "proof of purchase or delivery",
  "packing slip": "document included inside shipment",
  production: "process of manufacturing goods",
  "assembly line": "automated manufacturing process",
  component: "single part in larger product",
  defect: "flaw or malfunction in product",
  inspection: "detailed examination for quality",
  "repair request": "formal request for fixing equipment",
  technician: "skilled person doing repairs",
  equipment: "tools and machinery for work",
  "boarding pass": "ticket for airplane travel",
  accommodation: "lodging or hotel arrangement",
  reimbursement: "repayment of spent money",
  "travel allowance": "budget for a business trip",
  "bill of lading": "shipping document listing cargo",
  cargo: "goods transported by vehicle",
  destination: "final location for shipment",
  delay: "postponement from original schedule",
  "return authorization": "permission to send item back",
  replacement: "new item replacing defective one",
  refund: "money returned to buyer",
  warranty: "guarantee for product quality",
  recruitment: "process of hiring new staff",
  applicant: "person applying for job",
  resume: "document listing work experience",
  reference: "person who recommends candidate",
  interview: "formal meeting to assess candidate",
  orientation: "introduction training for new employee",
  probation: "testing period for new worker",
  position: "job title or role",
  benefits: "employee perks like insurance",
  payroll: "system for paying salaries",
  overtime: "working hours beyond normal",
  "vacation leave": "approved time off work",
  appraisal: "formal evaluation of performance",
  promotion: "advancement to a higher role",
  transfer: "move to a different job",
  resignation: "formal notice of leaving",
  workshop: "hands-on training session",
  certificate: "official document confirming completion",
  instructor: "person who teaches or trains",
  enrollment: "process of registering for course",
  attendance: "presence at work or class",
  "dress code": "rules about workplace clothing",
  supervisor: "manager overseeing employees",
  colleague: "coworker in same organization",
  vacancy: "open job position still unfilled",
  candidate: "person considered for job",
  department: "division of organization",
  branch: "separate location of company",
  handbook: "guide with company information",
  badge: "identification card worn at work",
  "access card": "card for entering secured areas",
  workspace: "area where person works",
  "personnel file": "document record of employee details",
  "emergency contact": "person to call in crisis",
  "tax form": "document used for income tax",
  "direct deposit": "automatic salary payment method",
  evacuation: "rapid departure from dangerous area",
  hazard: "dangerous condition or substance",
  "incident report": "official record of accident",
  "first aid kit": "emergency medical supplies",
  budget: "plan for spending money",
  expense: "cost for goods or services",
  revenue: "income from business sales",
  profit: "money earned after expenses",
  payment: "money transferred to recipient",
  "billing address": "location for sending invoice",
  balance: "amount owed or in account",
  "due date": "final date payment is required",
  deposit: "money placed in account",
  withdrawal: "money taken from account",
  transaction: "exchange of money or funds",
  statement: "official record of account activity",
  ledger: "accounting record of transactions",
  audit: "official check of financial records",
  tax: "money paid to government",
  deduction: "amount subtracted from total",
  estimate: "calculated prediction of cost",
  discount: "reduction in price",
  surcharge: "additional fee on bill",
  rate: "price per unit measurement",
  client: "customer of a business",
  prospect: "potential future customer",
  subscription: "recurring payment for service",
  renewal: "extension of an agreement",
  procurement: "purchasing process for business",
  vendor: "supplier of goods or services",
  requisition: "formal request for supplies",
  bid: "competitive price offer",
  regulation: "official rule or requirement",
  violation: "breaking of rule or law",
  permit: "official document granting permission",
  license: "official document authorizing activity",
  coverage: "extent of insurance protection",
  claim: "formal request for insurance payment",
  premium: "payment for insurance coverage",
  policyholder: "person insured by a policy",
  portfolio: "collection of investments",
  dividend: "payment distributed to shareholders",
  shareholder: "owner of company stock",
  forecast: "prediction of future activity",
  "front desk": "reception area of hotel or office",
  housekeeping: "cleaning and maintenance staff",
  checkout: "process of leaving a hotel",
  "guest room": "bedroom provided by hotel",
  menu: "list of food and drinks",
  catering: "service providing food for events",
  beverage: "drink offered for consumption",
  "reservation desk": "place for booking arrangements",
  merchandise: "goods offered for sale",
  aisle: "walkway between store shelves",
  cashier: "person handling payments in store",
  "exchange policy": "rules for returning items",
  complaint: "expression of dissatisfaction",
  representative: "person authorized to assist customer",
  resolution: "solution to a problem",
  "follow-up": "subsequent action after initial contact",
  prescription: "medical instruction for medication",
  clinic: "small medical facility",
  patient: "person receiving medical care",
  "appointment reminder": "notification of scheduled visit",
  gate: "entrance and exit point for boarding",
  boarding: "process of entering an airplane",
  luggage: "baggage carried by traveler",
  "flight delay": "postponement of aircraft departure",
  renovation: "major repair and modernization",
  closure: "temporary or permanent shutdown",
  relocation: "moving to a new location",
  "access restriction": "limits on entering area",
  password: "secret code for account access",
  outage: "interruption of service",
  update: "software improvement or revision",
  backup: "duplicate copy kept for safety",
  brochure: "printed marketing material",
  campaign: "organized marketing effort",
  sample: "small amount for testing",
  feedback: "comments and suggestions received",
  electricity: "power supplied for use",
  plumbing: "system for water pipes",
  heating: "system that provides warmth",
  ventilation: "system for air circulation"
};

const COLLOCATION_GROUPS = [
  {
    code: "A",
    file: "questions_v3a.json",
    offset: 0,
    groupTitle: "Office / Administration Collocation",
    context: "office administration",
    lessons: [
      ["Office Task Collocations 01", ["make arrangements", "submit a report", "meet a deadline", "hold a meeting"]],
      ["Office Task Collocations 02", ["take notes", "prepare an agenda", "review a document", "file a complaint"]],
      ["Office Task Collocations 03", ["issue a memo", "schedule an appointment", "update a record", "make a request"]],
      ["Office Task Collocations 04", ["approve a proposal", "sign a contract", "attend a seminar", "give a presentation"]],
      ["Office Communication Collocations", ["answer an inquiry", "forward an email", "attach a file", "confirm a reservation"]],
      ["Office Paperwork Collocations", ["keep records", "process paperwork", "obtain approval", "complete a form"]],
      ["Office Event Collocations", ["conduct a survey", "collect feedback", "arrange seating", "reserve a venue"]],
      ["Office Procedure Collocations", ["announce a policy", "follow procedures", "check availability", "resolve an issue"]],
      ["Office Coordination Collocations", ["coordinate an event", "send a reminder", "verify details", "provide instructions"]],
      ["Office Notice Collocations", ["post a notice", "print copies", "share minutes", "set priorities"]]
    ]
  },
  {
    code: "B",
    file: "questions_v3b.json",
    offset: 1,
    groupTitle: "Logistics / Operations Collocation",
    context: "logistics",
    lessons: [
      ["Shipping Collocations", ["place an order", "track a shipment", "receive a package", "inspect goods"]],
      ["Inventory Collocations", ["maintain inventory", "replenish stock", "contact a supplier", "compare prices"]],
      ["Freight Collocations", ["load cargo", "clear customs", "arrange delivery", "cover shipping costs"]],
      ["Delivery Status Collocations", ["dispatch a truck", "confirm arrival", "reduce delays", "update tracking"]],
      ["Manufacturing Collocations", ["assemble components", "operate machinery", "detect defects", "meet specifications"]],
      ["Maintenance Collocations", ["perform maintenance", "request repairs", "replace parts", "inspect equipment"]],
      ["Retail Logistics Collocations", ["pack merchandise", "print labels", "handle returns", "issue refunds"]],
      ["Warehouse Collocations", ["process invoices", "check quantities", "store materials", "manage warehouses"]],
      ["Vendor Contract Collocations", ["negotiate terms", "renew a contract", "request a quotation", "approve a purchase"]],
      ["Operations Improvement Collocations", ["avoid delays", "improve efficiency", "reduce costs", "monitor progress"]]
    ]
  },
  {
    code: "C",
    file: "questions_v3c.json",
    offset: 2,
    groupTitle: "HR / Meetings Collocation",
    context: "human resources",
    lessons: [
      ["Recruitment Collocations", ["apply for a position", "submit a resume", "schedule an interview", "check references"]],
      ["Employment Collocations", ["conduct training", "attend orientation", "complete probation", "receive benefits"]],
      ["Attendance Collocations", ["calculate payroll", "approve overtime", "request leave", "update attendance"]],
      ["Performance Collocations", ["evaluate performance", "offer a promotion", "transfer employees", "accept resignation"]],
      ["Training Collocations", ["enroll in a workshop", "earn a certificate", "provide instruction", "develop skills"]],
      ["Workplace Conduct Collocations", ["follow a dress code", "report an incident", "contact a supervisor", "assist colleagues"]],
      ["Staffing Collocations", ["fill a vacancy", "screen candidates", "expand a department", "open a branch"]],
      ["Onboarding Collocations", ["issue a badge", "grant access", "assign workspace", "distribute handbooks"]],
      ["Employee Record Collocations", ["update personnel files", "provide emergency contacts", "file tax forms", "set up direct deposit"]],
      ["Safety Collocations", ["conduct an evacuation drill", "identify hazards", "submit incident reports", "stock first aid kits"]]
    ]
  },
  {
    code: "D",
    file: "questions_v3d.json",
    offset: 3,
    groupTitle: "Finance / Compliance Collocation",
    context: "finance and compliance",
    lessons: [
      ["Budget Collocations", ["prepare a budget", "reduce expenses", "increase revenue", "earn a profit"]],
      ["Payment Collocations", ["make a payment", "send an invoice", "issue a receipt", "settle a balance"]],
      ["Banking Collocations", ["make a deposit", "record a transaction", "review a statement", "withdraw funds"]],
      ["Accounting Collocations", ["update a ledger", "conduct an audit", "calculate taxes", "claim a deduction"]],
      ["Pricing Collocations", ["provide an estimate", "request a quotation", "offer a discount", "add a surcharge"]],
      ["Sales Contract Collocations", ["sign a contract", "retain clients", "attract prospects", "renew subscriptions"]],
      ["Procurement Collocations", ["manage procurement", "evaluate vendors", "approve requisitions", "negotiate contracts"]],
      ["Compliance Collocations", ["comply with regulations", "report violations", "obtain permits", "renew licenses"]],
      ["Insurance Collocations", ["file a claim", "provide coverage", "pay premiums", "review policyholders"]],
      ["Investment Collocations", ["forecast demand", "manage a portfolio", "pay dividends", "notify shareholders"]]
    ]
  },
  {
    code: "E",
    file: "questions_v3e.json",
    offset: 0,
    groupTitle: "Sales / Customer Service Collocation",
    context: "customer service",
    lessons: [
      ["Hotel Collocations", ["take a reservation", "greet guests", "clean rooms", "process checkout"]],
      ["Restaurant Collocations", ["revise a menu", "confirm catering", "serve beverages", "handle complaints"]],
      ["Retail Collocations", ["display merchandise", "scan items", "process refunds", "assist customers"]],
      ["Customer Support Collocations", ["answer complaints", "provide resolutions", "follow up with clients", "contact representatives"]],
      ["Healthcare Collocations", ["schedule appointments", "fill prescriptions", "admit patients", "contact clinics"]],
      ["Airline Collocations", ["announce delays", "board passengers", "check luggage", "change gates"]],
      ["Public Notice Collocations", ["begin renovations", "announce closures", "complete relocation", "restrict access"]],
      ["IT Support Collocations", ["reset passwords", "report outages", "install updates", "back up files"]],
      ["Marketing Collocations", ["launch a campaign", "distribute brochures", "collect samples", "analyze feedback"]],
      ["Utility Collocations", ["restore electricity", "repair plumbing", "adjust heating", "improve ventilation"]]
    ]
  },
  {
    code: "F",
    file: "questions_v3f.json",
    offset: 1,
    groupTitle: "Mixed Part 6 Context Collocation",
    context: "mixed TOEIC context",
    lessons: [
      ["Security Context Collocations", ["strengthen security", "protect data", "update software", "report a breach"]],
      ["Expansion Context Collocations", ["expand operations", "enter a market", "open a branch", "increase capacity"]],
      ["Service Context Collocations", ["improve service", "reduce waiting times", "train staff", "monitor satisfaction"]],
      ["Facility Context Collocations", ["complete construction", "inspect facilities", "install equipment", "reopen offices"]],
      ["Travel Context Collocations", ["organize transportation", "book accommodations", "submit reimbursement", "confirm itinerary"]],
      ["Policy Context Collocations", ["revise guidelines", "enforce policies", "clarify requirements", "announce changes"]],
      ["Vendor Context Collocations", ["compare bids", "select vendors", "finalize agreements", "schedule delivery"]],
      ["Hiring Context Collocations", ["review applications", "shortlist candidates", "offer positions", "conduct onboarding"]],
      ["Finance Context Collocations", ["prepare statements", "review expenses", "approve budgets", "forecast revenue"]],
      ["Customer Resolution Collocations", ["resolve disputes", "answer inquiries", "replace products", "extend warranties"]]
    ]
  }
];

const WRONG_VERBS = [
  "make", "do", "take", "have", "give", "hold", "submit", "issue", "meet", "process",
  "conduct", "arrange", "confirm", "approve", "review", "provide", "request", "receive",
  "reduce", "increase", "manage", "handle", "attend", "schedule", "update", "renew",
  "file", "report", "install", "launch", "complete", "prepare", "contact", "monitor"
];

function topicLabel(lesson) {
  return String(lesson.title || lesson.context || "TOEIC task")
    .replace(/\s+Scene Vocabulary$/i, "")
    .replace(/\s+Collocations?(?:\s+\d+)?$/i, "")
    .replace(/\s+Context$/i, "")
    .trim()
    .toLowerCase();
}

function phraseSeed(value) {
  return [...String(value || "")].reduce((sum, char, index) => sum + char.charCodeAt(0) * (index + 1), 0);
}

function wrongCollocations(phrase, seed = 0) {
  const parts = phrase.split(" ");
  const verb = parts[0];
  const rest = parts.slice(1).join(" ");
  const pool = WRONG_VERBS.filter((candidate) => candidate !== verb);
  const start = (phraseSeed(phrase) + seed) % pool.length;
  const wrong = [];
  for (let index = 0; index < pool.length && wrong.length < 3; index += 1) {
    const candidate = pool[(start + index * 5) % pool.length];
    const phraseCandidate = `${candidate} ${rest}`;
    if (phraseCandidate !== phrase && !wrong.includes(phraseCandidate)) wrong.push(phraseCandidate);
  }
  return wrong;
}

function sceneClue(term) {
  return V2_SCENE_VOCABULARY_CLUES[term] || "key TOEIC business term";
}

function createSceneLead(lesson, item, questionNumber) {
  const clue = sceneClue(item.term || item.base_word);
  const topic = topicLabel(lesson);
  return [
    `Email: The ${topic} update says staff should confirm the ______, meaning the ${clue}, before the visitor arrives.`,
    `Notice: Please review the ______, the ${clue}, before you continue with this ${lesson.context} task.`,
    `Conversation: We still need the ______, the ${clue}, for today's ${topic} work. Which term best completes the speaker's meaning?`,
    `Memo: During the ${topic} briefing, the manager referred to the ______, the ${clue}, more than once.`,
    `Announcement: Everyone on the ${topic} team should understand the ______, the ${clue}, before the meeting begins.`
  ][questionNumber % 5];
}

function createCollocationLead(lesson, pattern) {
  const topic = topicLabel(lesson);
  return [
    `Notice: The ${topic} plan has been revised for next week. Several tasks still need follow-up before the client visit, and one coordinator will handle the final update. To keep the project on track, the team should ______ before Friday afternoon.`,
    `Email: Thank you for helping with the ${topic} assignment. The supervisor needs a clear update by 3 p.m., and the rest of the team cannot proceed until this step is complete. Please ______ and send the confirmation to your supervisor.`,
    `Memo: For the ${topic} update, the manager said the team would need to ______ before the next review.`,
    `The ${topic} coordinator is expected to ______ as soon as the request reaches the department.`,
    `Announcement: The ${topic} schedule is tighter than expected this week. Managers want each team to finish the key coordination step before the status meeting begins. After reviewing the revised plan, the staff will ______ before leaving for the day.`
  ][pattern];
}

function lessonId(stage, groupCode, lessonNumber) {
  return `${stage}-${groupCode}-${lessonNumber}`;
}

function questionId(stage, groupCode, lessonNumber, kind, index) {
  return `${stage.toLowerCase()}_${groupCode.toLowerCase()}_${lessonNumber}_${kind}_${String(index).padStart(3, "0")}`;
}

function createSceneQuestion({ lesson, item, choices, questionNumber, fileQuestionIndex, group, kind }) {
  const isReview = kind === "rv";
  const type = isReview ? "review_question" : questionNumber % 5 === 2 ? "meaning_choice" : "scene_vocabulary";
  const correctAnswer = answerFor(fileQuestionIndex, group.offset);
  const term = item.term || item.base_word;
  const otherChoices = choices.filter((choice) => choice.term !== term).map((choice) => choice.term);
  const questionLead = createSceneLead(lesson, item, questionNumber);

  return {
    question_id: questionId("V2", group.code, lesson.lesson_number, kind, questionNumber),
    lesson_id: lesson.lesson_id,
    stage: "V2",
    type,
    skill: "scene_vocabulary",
    subskill: slug(lesson.context),
    grammar_link_id: "SCENE_VOCAB_CONTEXT",
    question_text: `${questionLead} (${lesson.lesson_id}-${String(questionNumber).padStart(2, "0")})`,
    options: arrangeOptions(term, otherChoices, correctAnswer),
    correct_answer: correctAnswer,
    explanation_zh: `在 ${lesson.context} 情境中，"${term}" 表示「${item.chinese}」。`,
    target_item_id: item.item_id,
    distractor_type: "same_scene_vocabulary",
    difficulty: isReview ? 3 : questionNumber % 4 === 0 ? 3 : 2,
    estimated_time_seconds: type === "review_question" ? 15 : 15,
    default_error_code: "SCENE_VOCAB_GAP",
    tags: ["toeic_scene", "scene_vocabulary", "v2", `v2-${group.code.toLowerCase()}`, slug(lesson.context)]
  };
}

function createCollocationQuestion({ lesson, item, questionNumber, fileQuestionIndex, group, kind }) {
  const isReview = kind === "rv";
  const pattern = questionNumber % 5;
  const type = isReview ? "review_question" : pattern === 2 ? "collocation" : pattern === 3 ? "part5_sentence_completion" : "part6_context_choice";
  const correctAnswer = answerFor(fileQuestionIndex, group.offset);
  const options = arrangeOptions(item.phrase, wrongCollocations(item.phrase, questionNumber + fileQuestionIndex + group.offset), correctAnswer);
  const lead = createCollocationLead(lesson, pattern);

  return {
    question_id: questionId("V3", group.code, lesson.lesson_number, kind, questionNumber),
    lesson_id: lesson.lesson_id,
    stage: "V3",
    type,
    skill: "collocation",
    subskill: "verb_noun_collocation",
    grammar_link_id: type === "part6_context_choice" ? "PART6_CONTEXT_COLLOCATION" : "COLLOCATION_VERB_NOUN",
    question_text: `${lead} (${lesson.lesson_id}-${String(questionNumber).padStart(2, "0")})`,
    options,
    correct_answer: correctAnswer,
    explanation_zh: `"${item.phrase}" 是此情境中較自然的 TOEIC 搭配；其他選項是常見動詞搭配干擾。`,
    target_item_id: item.item_id,
    distractor_type: "wrong_verb_collocation",
    difficulty: isReview || type === "part6_context_choice" ? 3 : 2,
    estimated_time_seconds: type === "part6_context_choice" ? 45 : 15,
    default_error_code: "COLLOCATION_PREP",
    tags: ["toeic_part6", "collocation", "v3", `v3-${group.code.toLowerCase()}`, slug(lesson.context)]
  };
}

function buildSceneContent() {
  const lessons = [];
  const items = [];
  const files = Object.fromEntries(V2_FILES.map((fileName) => [fileName, []]));

  SCENE_GROUPS.forEach((group, groupIndex) => {
    group.lessons.forEach(([title, rawItems], lessonIndex) => {
      const number = 71 + groupIndex * 10 + lessonIndex;
      const id = lessonId("V2", group.code, number);
      const lessonItems = rawItems.map(([term, chinese]) => {
        const item = sceneItem(id, term, chinese, group.context, group.code);
        item.term = term;
        return item;
      });
      const lesson = {
        lesson_id: id,
        stage: "V2",
        stage_name: "TOEIC Scene Vocabulary",
        lesson_number: number,
        title,
        estimated_minutes: 45,
        lesson_type: "scene_vocabulary",
        target_items: lessonItems.map((item) => item.base_word),
        question_ids: [],
        review_question_ids: [],
        mastery_threshold: 0.8,
        seal_threshold: 0.85,
        grammar_link_id: "SCENE_VOCAB_CONTEXT",
        status: "not_started"
      };
      lesson.context = group.context;

      for (let i = 1; i <= 20; i += 1) {
        const item = lessonItems[(i - 1) % lessonItems.length];
        const question = createSceneQuestion({
          lesson,
          item,
          choices: lessonItems.map((entry) => ({ term: entry.base_word })),
          questionNumber: i,
          fileQuestionIndex: files[group.file].length,
          group,
          kind: "q"
        });
        files[group.file].push(question);
        lesson.question_ids.push(question.question_id);
      }

      for (let i = 21; i <= 24; i += 1) {
        const item = lessonItems[(i - 21) % lessonItems.length];
        const question = createSceneQuestion({
          lesson,
          item,
          choices: lessonItems.map((entry) => ({ term: entry.base_word })),
          questionNumber: i,
          fileQuestionIndex: files[group.file].length,
          group,
          kind: "rv"
        });
        files[group.file].push(question);
        lesson.review_question_ids.push(question.question_id);
      }

      lessonItems.forEach((item) => { delete item.term; });
      delete lesson.context;
      lessons.push(lesson);
      items.push(...lessonItems);
    });
  });

  return { lessons, items, files };
}

function buildCollocationContent() {
  const lessons = [];
  const items = [];
  const files = Object.fromEntries(V3_FILES.map((fileName) => [fileName, []]));

  COLLOCATION_GROUPS.forEach((group, groupIndex) => {
    group.lessons.forEach(([title, phrases], lessonIndex) => {
      const number = 121 + groupIndex * 10 + lessonIndex;
      const id = lessonId("V3", group.code, number);
      const lessonItems = phrases.map((phrase) => {
        const item = collocationItem(id, phrase, group.context, group.code);
        item.phrase = phrase;
        return item;
      });
      const lesson = {
        lesson_id: id,
        stage: "V3",
        stage_name: "Collocation",
        lesson_number: number,
        title,
        estimated_minutes: 45,
        lesson_type: "collocation",
        target_items: lessonItems.map((item) => item.base_word),
        question_ids: [],
        review_question_ids: [],
        mastery_threshold: 0.8,
        seal_threshold: 0.85,
        grammar_link_id: "COLLOCATION_VERB_NOUN",
        status: "not_started"
      };
      lesson.context = group.context;

      for (let i = 1; i <= 20; i += 1) {
        const item = lessonItems[(i - 1) % lessonItems.length];
        const question = createCollocationQuestion({
          lesson,
          item,
          questionNumber: i,
          fileQuestionIndex: files[group.file].length,
          group,
          kind: "q"
        });
        files[group.file].push(question);
        lesson.question_ids.push(question.question_id);
      }

      for (let i = 21; i <= 24; i += 1) {
        const item = lessonItems[(i - 21) % lessonItems.length];
        const question = createCollocationQuestion({
          lesson,
          item,
          questionNumber: i,
          fileQuestionIndex: files[group.file].length,
          group,
          kind: "rv"
        });
        files[group.file].push(question);
        lesson.review_question_ids.push(question.question_id);
      }

      lessonItems.forEach((item) => { delete item.phrase; });
      delete lesson.context;
      lessons.push(lesson);
      items.push(...lessonItems);
    });
  });

  return { lessons, items, files };
}

function updateGrammarLinks() {
  const links = readJSON(grammarLinksPath);
  links.SCENE_VOCAB_CONTEXT = {
    title: "TOEIC scene vocabulary context",
    title_zh: "TOEIC 情境詞彙",
    rule_zh: "依辦公室、人事、物流、財務、服務等情境辨認常見 TOEIC 詞彙。",
    example: "shipment / warehouse / invoice / applicant"
  };
  links.COLLOCATION_VERB_NOUN = {
    title: "Verb-noun collocation",
    title_zh: "動詞 + 名詞固定搭配",
    rule_zh: "TOEIC 常測自然搭配，例如 make arrangements、submit a report、meet a deadline。",
    example: "make arrangements ✓ | do arrangements ✗"
  };
  links.PART6_CONTEXT_COLLOCATION = {
    title: "Part 6 context collocation",
    title_zh: "Part 6 上下文搭配",
    rule_zh: "依段落語意與商務情境選出自然搭配，重點是語境連貫與固定用法。",
    example: "Please submit a report before Friday."
  };
  writeJSON(grammarLinksPath, links);
}

function expandV2V3Content() {
  const curriculum = readJSON(curriculumPath);
  const vocabItems = readJSON(vocabItemsPath);
  const v2 = buildSceneContent();
  const v3 = buildCollocationContent();
  const nextLessons = [
    ...(curriculum.lessons || []).filter((lesson) => lesson.stage !== "V2" && lesson.stage !== "V3"),
    ...v2.lessons,
    ...v3.lessons
  ].sort((a, b) => Number(a.lesson_number || 0) - Number(b.lesson_number || 0));
  const nextItems = [
    ...vocabItems.filter((item) => item.stage !== "V2" && item.stage !== "V3"),
    ...v2.items,
    ...v3.items
  ].sort((a, b) => String(a.item_id).localeCompare(String(b.item_id)));

  curriculum.seed_version = SEED_VERSION;
  curriculum.generated_at = "2026-05-14T10:30:00+08:00";
  curriculum.stages = (curriculum.stages || []).map((stage) => {
    if (stage.stage === "V2") return { ...stage, total_lessons: 50, status: "available" };
    if (stage.stage === "V3") return { ...stage, total_lessons: 60, status: "available" };
    return stage;
  });
  curriculum.lessons = nextLessons;
  curriculum.question_files = [
    "questions_v0.json",
    "questions_v1a.json",
    "questions_v1b.json",
    "questions_v1c.json",
    "questions_v1d.json",
    "questions_v1e.json",
    "questions_v1f.json",
    ...V2_FILES,
    ...V3_FILES
  ];

  writeJSON(curriculumPath, curriculum);
  writeJSON(vocabItemsPath, nextItems);
  Object.entries({ ...v2.files, ...v3.files }).forEach(([fileName, questions]) => {
    writeJSON(path.join(vocabDir, fileName), questions);
  });
  updateGrammarLinks();

  const totalNewQuestions = Object.values({ ...v2.files, ...v3.files }).reduce((sum, questions) => sum + questions.length, 0);
  console.log("Expanded V2/V3 content.");
  console.log(`- V2 lessons: ${v2.lessons.length}`);
  console.log(`- V2 questions: ${Object.values(v2.files).reduce((sum, questions) => sum + questions.length, 0)}`);
  console.log(`- V3 lessons: ${v3.lessons.length}`);
  console.log(`- V3 questions: ${Object.values(v3.files).reduce((sum, questions) => sum + questions.length, 0)}`);
  console.log(`- new questions total: ${totalNewQuestions}`);
  console.log(`- vocab items total: ${nextItems.length}`);
}

if (require.main === module) {
  expandV2V3Content();
}

module.exports = { expandV2V3Content };
