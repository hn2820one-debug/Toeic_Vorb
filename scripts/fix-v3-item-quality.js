/**
 * Rewrites V3 vocab_items chinese and example fields.
 * All 240 V3 items currently have:
 *   chinese: "固定搭配：[base_word]"   ← no actual meaning
 *   example: boilerplate template sentence
 *
 * This script replaces both with genuine content:
 *   chinese: concise meaning / usage note in Traditional Chinese
 *   example: natural TOEIC-style business sentence
 */

const fs = require("fs");
const path = require("path");

const filePath = path.resolve(__dirname, "../data/vocab/vocab_items.json");

// key = base_word (exact match), value = { chinese, example }
const BANK = {
  // ── V3-A: General Office Administration ──────────────────────────────
  "hold a meeting":          { chinese: "召開/舉行會議", example: "The department head will hold a meeting on Friday to discuss the quarterly targets." },
  "make arrangements":       { chinese: "做安排；籌備事宜", example: "Please make arrangements for the client visit scheduled for next Tuesday." },
  "meet a deadline":         { chinese: "在期限內完成；趕上截止日期", example: "The project team worked overtime to meet the deadline set by the client." },
  "submit a report":         { chinese: "提交報告", example: "All branch managers must submit a report by the end of the fiscal quarter." },

  "file a complaint":        { chinese: "提出/正式投訴", example: "The customer decided to file a complaint after the delivery arrived two weeks late." },
  "prepare an agenda":       { chinese: "準備/擬定議程", example: "Please prepare an agenda for tomorrow's board meeting and send it to all attendees." },
  "review a document":       { chinese: "審閱/核查文件", example: "The legal team will review a document before it is signed by both parties." },
  "take notes":              { chinese: "記筆記；做紀錄", example: "Could you take notes during the meeting and circulate them to the team afterward?" },

  "issue a memo":            { chinese: "發出/發佈備忘錄", example: "The HR director will issue a memo regarding the updated leave policy next week." },
  "make a request":          { chinese: "提出請求/申請", example: "Staff members can make a request for additional equipment through the online portal." },
  "schedule an appointment": { chinese: "安排/預約約會或會面", example: "Please schedule an appointment with the sales representative before visiting the showroom." },
  "update a record":         { chinese: "更新記錄/檔案", example: "The clerk was asked to update a record every time a new transaction was processed." },

  "approve a proposal":      { chinese: "批准/審批提案", example: "The board voted to approve a proposal to expand the company's distribution network." },
  "attend a seminar":        { chinese: "參加研討會/研習班", example: "All new employees are required to attend a seminar on workplace safety within their first month." },
  "give a presentation":     { chinese: "做/發表報告或演示", example: "She will give a presentation on the new marketing strategy at next week's conference." },
  "sign a contract":         { chinese: "簽署合約/合同", example: "Both parties agreed to sign a contract before the construction work begins." },

  "answer an inquiry":       { chinese: "回覆/答覆詢問", example: "Our customer service team is available to answer an inquiry within 24 business hours." },
  "attach a file":           { chinese: "附上/附加文件", example: "Please attach a file of the completed form before submitting your application online." },
  "confirm a reservation":   { chinese: "確認預訂/預約", example: "Call the hotel to confirm a reservation at least 48 hours before your arrival." },
  "forward an email":        { chinese: "轉發電郵", example: "Could you forward an email from the supplier to the procurement team right away?" },

  "complete a form":         { chinese: "填寫/完成表格", example: "Applicants must complete a form and submit it along with two reference letters." },
  "keep records":            { chinese: "保存/記錄資料", example: "The accounting department is required to keep records of all transactions for seven years." },
  "obtain approval":         { chinese: "取得/獲得批准", example: "You must obtain approval from your line manager before booking business travel." },
  "process paperwork":       { chinese: "處理書面文件/行政文件", example: "The administrative assistant helped new hires process paperwork during their first week." },

  "arrange seating":         { chinese: "安排座位", example: "The event coordinator will arrange seating for over 200 guests at the annual dinner." },
  "collect feedback":        { chinese: "收集意見/反饋", example: "After the training session, the facilitator asked participants to collect feedback forms." },
  "conduct a survey":        { chinese: "進行調查/問卷調查", example: "The marketing team plans to conduct a survey to measure customer satisfaction levels." },
  "reserve a venue":         { chinese: "預訂場地", example: "We need to reserve a venue for the product launch at least three months in advance." },

  "announce a policy":       { chinese: "公佈/宣布政策", example: "Management will announce a policy on remote working at the all-staff meeting." },
  "check availability":      { chinese: "查詢/確認是否有空或有存貨", example: "Please check availability before scheduling any meetings with external clients." },
  "follow procedures":       { chinese: "遵守/依照程序辦理", example: "All employees are expected to follow procedures when handling customer complaints." },
  "resolve an issue":        { chinese: "解決問題/爭議", example: "The technical team worked through the night to resolve an issue with the billing system." },

  "coordinate an event":     { chinese: "統籌/協調活動", example: "She was hired specifically to coordinate an event for the company's 20th anniversary." },
  "provide instructions":    { chinese: "提供指示/說明", example: "The supervisor will provide instructions for the new inventory tracking system." },
  "send a reminder":         { chinese: "發送提醒通知", example: "Please send a reminder to all participants one day before the deadline." },
  "verify details":          { chinese: "核實/確認資料", example: "The front desk staff must verify details before issuing a visitor pass." },

  "post a notice":           { chinese: "張貼/公告通知", example: "The property manager will post a notice about the scheduled elevator maintenance." },
  "print copies":            { chinese: "列印/打印副本", example: "Please print copies of the agenda for all twelve attendees before the meeting begins." },
  "set priorities":          { chinese: "設定優先順序", example: "The team leader asked everyone to set priorities for the upcoming project milestones." },
  "share minutes":           { chinese: "分發/傳閱會議記錄", example: "The secretary will share minutes from today's meeting by end of business tomorrow." },

  // ── V3-B: Logistics & Supply Chain ───────────────────────────────────
  "inspect goods":           { chinese: "檢查/驗收貨物", example: "The quality control officer will inspect goods before they leave the warehouse." },
  "place an order":          { chinese: "下訂單/訂購", example: "We need to place an order for office supplies before the end of this month." },
  "receive a package":       { chinese: "收取/接收包裹", example: "Someone must be available at the office to receive a package from the courier." },
  "track a shipment":        { chinese: "追蹤/查詢貨件狀態", example: "You can track a shipment using the reference number provided in the confirmation email." },

  "compare prices":          { chinese: "比較價格", example: "Before finalising the order, the purchasing team should compare prices from at least three suppliers." },
  "contact a supplier":      { chinese: "聯絡/聯繫供應商", example: "Please contact a supplier immediately if there is a shortage of raw materials." },
  "maintain inventory":      { chinese: "維持/管理庫存", example: "The warehouse team is responsible for ensuring they maintain inventory at the required levels." },
  "replenish stock":         { chinese: "補充/補貨庫存", example: "The store manager instructed the staff to replenish stock on the shelves every morning." },

  "arrange delivery":        { chinese: "安排/協調送貨", example: "Our logistics team can arrange delivery to any location within three business days." },
  "clear customs":           { chinese: "清關/辦理海關手續", example: "The importer hired a broker to clear customs on behalf of the company." },
  "cover shipping costs":    { chinese: "支付/負擔運費", example: "For orders over a certain amount, the supplier agrees to cover shipping costs." },
  "load cargo":              { chinese: "裝載貨物", example: "The crew began to load cargo onto the vessel early in the morning." },

  "confirm arrival":         { chinese: "確認抵達/到貨", example: "The receiving department must confirm arrival of all deliveries before signing the paperwork." },
  "dispatch a truck":        { chinese: "派遣/調度卡車", example: "The logistics manager will dispatch a truck to the distribution centre at dawn." },
  "reduce delays":           { chinese: "減少/縮短延誤", example: "The company invested in new software to reduce delays in the order fulfilment process." },
  "update tracking":         { chinese: "更新追蹤資訊", example: "Please update tracking on all outgoing orders so customers can monitor their shipments." },

  "assemble components":     { chinese: "組裝/安裝零件", example: "Workers on the production line assemble components according to the engineering drawings." },
  "detect defects":          { chinese: "檢測/發現瑕疵或缺陷", example: "The automated scanner is designed to detect defects in packaging before shipment." },
  "meet specifications":     { chinese: "符合/達到規格要求", example: "All manufactured parts must meet specifications outlined in the approved design document." },
  "operate machinery":       { chinese: "操作/使用機械設備", example: "Only certified technicians are permitted to operate machinery in the restricted zone." },

  "inspect equipment":       { chinese: "檢查/檢驗設備", example: "A qualified engineer is scheduled to inspect equipment at the plant next Monday." },
  "perform maintenance":     { chinese: "進行/執行維護保養", example: "The facilities team must perform maintenance on all HVAC units twice a year." },
  "replace parts":           { chinese: "更換零件/配件", example: "The technician was called in to replace parts that had worn out during heavy use." },
  "request repairs":         { chinese: "申請/要求維修", example: "Tenants should request repairs through the online portal for a faster response." },

  "handle returns":          { chinese: "處理退貨/退換", example: "Staff at the customer service desk are trained to handle returns efficiently and politely." },
  "issue refunds":           { chinese: "退款/發出退款", example: "The store policy states that the company will issue refunds within five business days." },
  "pack merchandise":        { chinese: "包裝/打包商品", example: "The team spent the afternoon to pack merchandise for the promotional gift campaign." },
  "print labels":            { chinese: "列印/打印標籤", example: "The warehouse system will automatically print labels for each outgoing order." },

  "check quantities":        { chinese: "核查/清點數量", example: "Before submitting the delivery note, the supervisor will check quantities against the purchase order." },
  "manage warehouses":       { chinese: "管理/營運倉庫", example: "The logistics director oversees the staff who manage warehouses across five regions." },
  "process invoices":        { chinese: "處理/核准發票", example: "The accounts payable team must process invoices within ten working days of receipt." },
  "store materials":         { chinese: "存放/儲存物料", example: "Please store materials in clearly labelled sections to maintain an organised warehouse." },

  "approve a purchase":      { chinese: "批准/核准採購", example: "The finance manager must approve a purchase over five hundred dollars before the order is placed." },
  "negotiate terms":         { chinese: "協商/談判條款", example: "Both sides met to negotiate terms of the new distribution agreement." },
  "renew a contract":        { chinese: "續簽/更新合約", example: "The company decided to renew a contract with its packaging supplier for another two years." },
  "request a quotation":     { chinese: "詢價/索取報價", example: "You can request a quotation from our sales team by filling in the online form." },

  "avoid delays":            { chinese: "避免/防止延誤", example: "Accurate forecasting helps the supply chain team avoid delays in product delivery." },
  "improve efficiency":      { chinese: "提高/改善效率", example: "The new software is expected to improve efficiency in the order processing department." },
  "monitor progress":        { chinese: "監察/追蹤進度", example: "The project manager uses a weekly dashboard to monitor progress on each milestone." },
  "reduce costs":            { chinese: "降低/減少成本", example: "The board asked the operations team to find ways to reduce costs without cutting staff." },

  // ── V3-C: Human Resources ────────────────────────────────────────────
  "apply for a position":    { chinese: "申請職位", example: "Interested candidates may apply for a position by submitting their resume before the closing date." },
  "check references":        { chinese: "查核/核實推薦人", example: "HR will check references provided by shortlisted candidates before making a final offer." },
  "schedule an interview":   { chinese: "安排/預約面試", example: "The recruitment team will schedule an interview with you within five working days." },
  "submit a resume":         { chinese: "提交/遞交履歷", example: "All applicants are required to submit a resume along with a cover letter." },

  "attend orientation":      { chinese: "參加入職培訓/迎新活動", example: "New employees must attend orientation on their first day to learn about company policies." },
  "complete probation":      { chinese: "完成試用期", example: "Staff receive a salary review after they complete probation at the end of the third month." },
  "conduct training":        { chinese: "進行/主持培訓", example: "The safety officer will conduct training for all new staff in the first week." },
  "receive benefits":        { chinese: "享有/獲得福利", example: "Full-time employees are eligible to receive benefits including health insurance and annual leave." },

  "approve overtime":        { chinese: "批准/審批加班", example: "Line managers must approve overtime before employees are permitted to work extra hours." },
  "calculate payroll":       { chinese: "計算薪資/工資", example: "The HR system automatically calculates payroll based on hours worked and applicable deductions." },
  "request leave":           { chinese: "申請休假", example: "Employees should request leave at least two weeks in advance using the HR portal." },
  "update attendance":       { chinese: "更新出勤記錄", example: "Supervisors are required to update attendance records at the end of each working day." },

  "accept resignation":      { chinese: "接受/批准辭職", example: "The HR director formally accept a resignation and arranged a handover schedule." },
  "evaluate performance":    { chinese: "評核/評估工作表現", example: "Managers evaluate performance of their team members every six months." },
  "offer a promotion":       { chinese: "提供/給予晉升機會", example: "The company decided to offer a promotion to the top-performing sales representative." },
  "transfer employees":      { chinese: "調配/調動員工", example: "Head office plans to transfer employees from the city branch to the new regional office." },

  "develop skills":          { chinese: "培養/發展技能", example: "The mentorship programme is designed to help junior staff develop skills in leadership." },
  "earn a certificate":      { chinese: "取得/獲得證書", example: "Participants who pass the assessment will earn a certificate recognised by the industry." },
  "enroll in a workshop":    { chinese: "報名/登記參加工作坊", example: "Staff are encouraged to enroll in a workshop on data analysis next quarter." },
  "provide instruction":     { chinese: "提供指導/教學", example: "The trainer will provide instruction on how to use the new inventory software." },

  "assist colleagues":       { chinese: "協助/幫助同事", example: "During the peak season, all staff are expected to assist colleagues in other departments." },
  "contact a supervisor":    { chinese: "聯絡/聯繫上司", example: "If you are unsure about the procedure, please contact a supervisor before proceeding." },
  "follow a dress code":     { chinese: "遵守服裝規定", example: "All employees who meet clients in person are required to follow a dress code." },
  "report an incident":      { chinese: "報告/匯報事故或事件", example: "Any workplace injury must be reported immediately; staff should report an incident to HR." },

  "expand a department":     { chinese: "擴大/擴充部門", example: "The company plans to expand a department to handle the growing volume of online orders." },
  "fill a vacancy":          { chinese: "填補/招聘空缺", example: "HR has been given approval to fill a vacancy in the customer support team." },
  "open a branch":           { chinese: "開設/設立分店或分公司", example: "The retailer announced plans to open a branch in three new cities by next year." },
  "screen candidates":       { chinese: "篩選/初步審核求職者", example: "The recruitment agency will screen candidates before forwarding shortlists to the client." },

  "assign workspace":        { chinese: "分配/指定工作空間", example: "The facilities manager will assign workspace to all new hires on their first day." },
  "distribute handbooks":    { chinese: "發放/分發員工手冊", example: "HR will distribute handbooks that outline company policies to all new employees." },
  "grant access":            { chinese: "授予/批准進入或使用權限", example: "IT will grant access to the internal system once the setup process is complete." },
  "issue a badge":           { chinese: "發放/核發識別證", example: "Security staff will issue a badge to each visitor upon arrival at reception." },

  "file tax forms":          { chinese: "申報/提交稅務表格", example: "The payroll team helps employees file tax forms correctly before the deadline." },
  "provide emergency contacts": { chinese: "提供緊急聯絡資料", example: "New staff are asked to provide emergency contacts to the HR department during onboarding." },
  "set up direct deposit":   { chinese: "設定薪資直接存入銀行", example: "Please set up direct deposit through the employee portal to receive your salary automatically." },
  "update personnel files":  { chinese: "更新/維護人事檔案", example: "HR is required to update personnel files whenever an employee changes their contact details." },

  "conduct an evacuation drill": { chinese: "進行疏散/消防演習", example: "The safety team will conduct an evacuation drill in all buildings on the first Tuesday of each month." },
  "identify hazards":        { chinese: "識別/找出危險因素", example: "The safety audit helps management identify hazards in the workplace before accidents occur." },
  "stock first aid kits":    { chinese: "補充/備置急救箱", example: "The facilities team is responsible to stock first aid kits in every department." },
  "submit incident reports": { chinese: "提交/呈報事故報告", example: "Workers are required to submit incident reports within 24 hours of any workplace accident." },

  // ── V3-D: Finance & Accounting ───────────────────────────────────────
  "earn a profit":           { chinese: "獲利/賺取利潤", example: "The company expects to earn a profit in the second half of the year after the restructure." },
  "increase revenue":        { chinese: "增加/提升收入或營業額", example: "The new pricing strategy is intended to increase revenue from the premium product line." },
  "prepare a budget":        { chinese: "編制/準備預算", example: "Each department must prepare a budget for the following year by the end of October." },
  "reduce expenses":         { chinese: "削減/降低開支", example: "Management introduced new guidelines to help all divisions reduce expenses without affecting quality." },

  "issue a receipt":         { chinese: "開具/發出收據", example: "The cashier will issue a receipt for every transaction made at the service counter." },
  "make a payment":          { chinese: "付款/進行付款", example: "Clients can make a payment online using a credit card or bank transfer." },
  "send an invoice":         { chinese: "發送/寄出發票", example: "The accounting team will send an invoice to the client within two days of project completion." },
  "settle a balance":        { chinese: "結清/還清餘額", example: "The company agreed to settle a balance on the outstanding account before the end of the month." },

  "make a deposit":          { chinese: "存款/繳付訂金", example: "A 30% deposit is required; clients must make a deposit to confirm their booking." },
  "record a transaction":    { chinese: "記錄/登記交易", example: "The accounting software automatically helps staff record a transaction when payment is received." },
  "review a statement":      { chinese: "核查/審閱對帳單或財務報表", example: "The auditor will review a statement prepared by the finance team every quarter." },
  "withdraw funds":          { chinese: "提款/提取資金", example: "Company directors must obtain board approval before they can withdraw funds from the reserve account." },

  "calculate taxes":         { chinese: "計算稅款", example: "The accounting software can calculate taxes owed based on the current year's income figures." },
  "claim a deduction":       { chinese: "申請/申報扣稅項目", example: "Employees who work from home may be able to claim a deduction for certain expenses." },
  "conduct an audit":        { chinese: "進行/執行審計", example: "An independent firm will conduct an audit of the company's financial records this quarter." },
  "update a ledger":         { chinese: "更新/記錄帳本", example: "The bookkeeper must update a ledger at the end of each business day." },

  "add a surcharge":         { chinese: "加收/附加費用或附加費", example: "The delivery company decided to add a surcharge for orders shipped to remote areas." },
  "offer a discount":        { chinese: "提供/給予折扣", example: "The store will offer a discount of 15% on selected items during the clearance sale." },
  "provide an estimate":     { chinese: "提供/給出估價或估算", example: "The contractor will provide an estimate for the renovation work by the end of the week." },

  "attract prospects":       { chinese: "吸引/開發潛在客戶", example: "The sales team launched a new campaign to attract prospects from the technology sector." },
  "renew subscriptions":     { chinese: "續訂/更新訂閱", example: "Clients are reminded by email to renew subscriptions 30 days before expiry." },
  "retain clients":          { chinese: "留住/維持客戶關係", example: "Providing excellent after-sales service is the best strategy to retain clients long-term." },

  "approve requisitions":    { chinese: "批准/審批採購申請", example: "The procurement manager must approve requisitions before any supplier is contacted." },
  "evaluate vendors":        { chinese: "評估/審核供應商", example: "The sourcing team will evaluate vendors based on price, quality, and delivery performance." },
  "manage procurement":      { chinese: "管理/統籌採購事務", example: "The new director was appointed specifically to manage procurement across all product lines." },
  "negotiate contracts":     { chinese: "談判/協商合約條款", example: "Legal and procurement staff work together to negotiate contracts with key suppliers." },

  "comply with regulations": { chinese: "遵守/符合法規", example: "All manufacturers must comply with regulations set by the national standards authority." },
  "obtain permits":          { chinese: "取得/申請許可證", example: "Construction cannot begin until the developer has obtain permits from the local authority." },
  "renew licenses":          { chinese: "更新/續期牌照或執照", example: "Businesses operating in this industry are required to renew licenses every two years." },
  "report violations":       { chinese: "舉報/通報違規行為", example: "Employees are encouraged to report violations of workplace safety rules to the compliance team." },

  "file a claim":            { chinese: "提出/申報索賠", example: "Policyholders must file a claim within 30 days of the incident to be eligible for compensation." },
  "pay premiums":            { chinese: "繳交/支付保費", example: "The company pay premiums on behalf of all full-time employees for health insurance coverage." },
  "provide coverage":        { chinese: "提供/給予保障或保險覆蓋", example: "The policy will provide coverage for accidental damage during the warranty period." },
  "review policyholders":    { chinese: "審查/覆核保單持有人資料", example: "The insurer will review policyholders' records annually to adjust renewal premiums." },

  "forecast demand":         { chinese: "預測/預估需求量", example: "The planning team uses sales data from the previous year to forecast demand for next quarter." },
  "manage a portfolio":      { chinese: "管理投資組合或產品組合", example: "The fund manager was hired to manage a portfolio of assets worth over fifty million dollars." },
  "notify shareholders":     { chinese: "通知/告知股東", example: "The company is required to notify shareholders of any major changes to its business strategy." },
  "pay dividends":           { chinese: "派發/支付股息", example: "The board decided to pay dividends to shareholders at the end of the financial year." },

  // ── V3-E: Service Industries ─────────────────────────────────────────
  "clean rooms":             { chinese: "清潔/打掃房間", example: "Housekeeping staff clean rooms between 9 a.m. and 3 p.m. while guests are out." },
  "greet guests":            { chinese: "迎接/招呼客人", example: "Front desk staff are trained to greet guests with a warm welcome upon arrival." },
  "process checkout":        { chinese: "辦理/處理退房手續", example: "Guests wishing to process checkout early should inform reception the evening before." },
  "take a reservation":      { chinese: "接受/記錄預訂", example: "The receptionist can take a reservation over the phone or through the hotel website." },

  "confirm catering":        { chinese: "確認餐飲/外賣服務安排", example: "Please confirm catering requirements at least 48 hours before the event begins." },
  "handle complaints":       { chinese: "處理/應對投訴", example: "The manager was called to handle complaints from several guests about the noise level." },
  "revise a menu":           { chinese: "修改/更新菜單", example: "The head chef will revise a menu for the upcoming season to include local ingredients." },
  "serve beverages":         { chinese: "供應/提供飲品", example: "Waitstaff are expected to serve beverages promptly once guests are seated at their tables." },

  "assist customers":        { chinese: "協助/服務顧客", example: "Floor staff are on hand to assist customers in finding the right product for their needs." },
  "display merchandise":     { chinese: "陳列/展示商品", example: "The visual merchandising team will display merchandise according to the new seasonal layout." },
  "process refunds":         { chinese: "辦理/處理退款", example: "The customer service counter is the only place where staff can process refunds in the store." },
  "scan items":              { chinese: "掃描/掃瞄商品條碼", example: "Cashiers are trained to scan items quickly to minimise waiting time at the checkout." },

  "answer complaints":       { chinese: "回覆/回應投訴", example: "The customer relations team is dedicated to answer complaints within one business day." },
  "contact representatives": { chinese: "聯絡/聯繫代表或客服人員", example: "If your issue is unresolved, you may contact representatives at our head office directly." },
  "follow up with clients":  { chinese: "跟進/聯絡客戶", example: "Sales staff are expected to follow up with clients within a week of sending a proposal." },
  "provide resolutions":     { chinese: "提供/給出解決方案", example: "Our support team is trained to provide resolutions that fully address the customer's concern." },

  "admit patients":          { chinese: "接收/讓病人入院", example: "The triage nurse assesses the condition of each person before deciding whether to admit patients." },
  "contact clinics":         { chinese: "聯絡/聯繫診所", example: "You can contact clinics directly through our referral service to book a specialist appointment." },
  "fill prescriptions":      { chinese: "配藥/執行處方", example: "Licensed pharmacists are the only staff authorised to fill prescriptions for patients." },
  "schedule appointments":   { chinese: "安排/預約看診或會面", example: "The clinic secretary will schedule appointments based on the doctor's available time slots." },

  "announce delays":         { chinese: "宣布/公告延誤", example: "Ground staff are required to announce delays over the public address system as soon as possible." },
  "board passengers":        { chinese: "讓乘客登機/上車", example: "Gate agents begin to board passengers with special needs or young children first." },
  "change gates":            { chinese: "更換登機閘口", example: "Passengers were informed that the airline would change gates due to a technical issue." },
  "check luggage":           { chinese: "託運/辦理行李", example: "Travellers with oversized bags must check luggage at the counter before passing security." },

  "announce closures":       { chinese: "宣布/通知關閉或停業", example: "The management team will announce closures of two underperforming locations at the press conference." },
  "begin renovations":       { chinese: "開始/啟動翻新裝修", example: "The hotel will begin renovations on the west wing starting next month." },
  "complete relocation":     { chinese: "完成遷移/搬遷", example: "The company expects to complete relocation to its new headquarters by the end of the year." },
  "restrict access":         { chinese: "限制/管制進出", example: "Security personnel were asked to restrict access to the server room to authorised staff only." },

  "back up files":           { chinese: "備份/存檔文件", example: "IT policy requires all staff to back up files to the cloud server at the end of each day." },
  "install updates":         { chinese: "安裝/更新軟件", example: "The IT department will install updates to the operating system on all workstations overnight." },
  "report outages":          { chinese: "報告/匯報系統中斷或停電", example: "Staff experiencing connectivity issues should report outages to the helpdesk immediately." },
  "reset passwords":         { chinese: "重設密碼", example: "Users can reset passwords by clicking the link sent to their registered email address." },

  "analyze feedback":        { chinese: "分析/研究反饋意見", example: "The marketing team meets monthly to analyze feedback from the post-purchase survey." },
  "collect samples":         { chinese: "收集/採集樣本", example: "The research team will collect samples from volunteers at three clinic locations." },
  "distribute brochures":    { chinese: "分發/派發宣傳冊", example: "Promoters were stationed outside the venue to distribute brochures to potential customers." },
  "launch a campaign":       { chinese: "發起/推出宣傳活動或廣告攻勢", example: "The agency was hired to launch a campaign targeting young professional consumers." },

  "adjust heating":          { chinese: "調整暖氣/調節室溫", example: "The building manager can adjust heating remotely using the new climate control system." },
  "improve ventilation":     { chinese: "改善/加強通風", example: "The health inspector recommended measures to improve ventilation in the production area." },
  "repair plumbing":         { chinese: "修理/維修水管或管道", example: "The maintenance team was called in to repair plumbing in the staff bathroom over the weekend." },
  "restore electricity":     { chinese: "恢復/恢復供電", example: "Technicians worked through the night to restore electricity to the affected neighbourhoods." },

  // ── V3-F: Corporate Operations ────────────────────────────────────────
  "protect data":            { chinese: "保護/保全數據資料", example: "All companies operating in this sector are legally required to protect data according to privacy laws." },
  "report a breach":         { chinese: "報告/通報數據洩露或安全漏洞", example: "Employees must report a breach to the IT security team within one hour of discovery." },
  "strengthen security":     { chinese: "加強/提升安全措施", example: "The company invested significantly to strengthen security at all data centres." },
  "update software":         { chinese: "更新/升級軟件", example: "Users are urged to update software regularly to protect against newly identified vulnerabilities." },

  "enter a market":          { chinese: "進入/打入市場", example: "The firm is developing a strategy to enter a market in Southeast Asia within two years." },
  "expand operations":       { chinese: "擴展/擴大業務運作", example: "Following a successful year, the board approved a plan to expand operations into three new regions." },
  "increase capacity":       { chinese: "增加/擴大產能或容量", example: "The factory will install new equipment to increase capacity by 40% before next year." },

  "improve service":         { chinese: "改善/提升服務質素", example: "The company conducted focus groups to identify areas where it could improve service for customers." },
  "monitor satisfaction":    { chinese: "監測/跟蹤客戶或員工滿意度", example: "The operations team uses regular surveys to monitor satisfaction among long-term clients." },
  "reduce waiting times":    { chinese: "縮短/減少等候時間", example: "The hospital implemented a triage system to reduce waiting times in the emergency department." },
  "train staff":             { chinese: "培訓/訓練員工", example: "The company allocates a fixed budget each year to train staff on new tools and processes." },

  "complete construction":   { chinese: "完成/竣工建設工程", example: "The developer expects to complete construction of the new office tower by mid-next year." },
  "inspect facilities":      { chinese: "檢查/視察設施", example: "The safety officer must inspect facilities at each location before they are open to the public." },
  "install equipment":       { chinese: "安裝/裝置設備", example: "A specialist contractor will install equipment in the new laboratory starting next Monday." },
  "reopen offices":          { chinese: "重新開放/恢復辦公室運作", example: "The company plans to reopen offices on a rotating schedule as restrictions are lifted." },

  "book accommodations":     { chinese: "預訂/安排住宿", example: "The travel coordinator will book accommodations for all staff attending the overseas conference." },
  "confirm itinerary":       { chinese: "確認行程", example: "Please confirm itinerary with the travel agent at least five days before your departure." },
  "organize transportation": { chinese: "安排/組織交通運輸", example: "The event team is responsible for organizing transportation for delegates from the airport." },
  "submit reimbursement":    { chinese: "提交/申請報銷", example: "Employees must submit reimbursement claims with original receipts within 30 days of the expense." },

  "announce changes":        { chinese: "宣布/公告變更或修改", example: "The CEO will announce changes to the company's structure at the all-hands meeting." },
  "clarify requirements":    { chinese: "澄清/說明要求或規定", example: "The project manager held a call to clarify requirements before the development team began work." },
  "enforce policies":        { chinese: "執行/實施政策規定", example: "Supervisors are responsible for ensuring all team members enforce policies in daily operations." },
  "revise guidelines":       { chinese: "修訂/更新指引或準則", example: "The compliance team will revise guidelines following the recent changes in legislation." },

  "compare bids":            { chinese: "比較/評估投標方案", example: "The procurement committee will compare bids from four shortlisted contractors next week." },
  "finalize agreements":     { chinese: "完成/敲定協議或合約", example: "Both legal teams are expected to finalize agreements before the end of the financial quarter." },
  "schedule delivery":       { chinese: "安排/確定送貨時間", example: "The vendor must schedule delivery at least 72 hours in advance to ensure staff availability." },
  "select vendors":          { chinese: "選擇/挑選供應商或承包商", example: "The committee will select vendors based on a combination of price, quality, and reliability." },

  "conduct onboarding":      { chinese: "進行/執行入職培訓", example: "HR will conduct onboarding for all new hires on the first Monday of each month." },
  "offer positions":         { chinese: "提供/給予職位或工作機會", example: "The company plans to offer positions in the new analytics team by the end of the quarter." },
  "review applications":     { chinese: "審閱/評審求職申請", example: "The hiring panel will review applications and contact shortlisted candidates within two weeks." },
  "shortlist candidates":    { chinese: "列入/篩選候選人短名單", example: "Recruitment will shortlist candidates who meet the minimum qualifications for the role." },

  "approve budgets":         { chinese: "批准/審批預算", example: "The finance committee meets quarterly to approve budgets for all major departments." },
  "forecast revenue":        { chinese: "預測/預估收入", example: "The sales director is asked to forecast revenue for the next fiscal year by November." },
  "prepare statements":      { chinese: "準備/編制財務報表", example: "The accounting team must prepare statements in accordance with international reporting standards." },
  "review expenses":         { chinese: "審查/核查支出費用", example: "The CFO will review expenses submitted by each business unit before approving the annual report." },

  "answer inquiries":        { chinese: "回覆/答覆查詢", example: "Our customer service team is available around the clock to answer inquiries from global clients." },
  "extend warranties":       { chinese: "延長保固/保修期", example: "Customers can pay a fee to extend warranties on purchased appliances by an additional year." },
  "replace products":        { chinese: "更換/替換產品", example: "If an item is defective on arrival, we will replace products free of charge within 14 days." },
  "resolve disputes":        { chinese: "解決/處理糾紛或爭議", example: "The legal team was brought in to resolve disputes between the company and a former supplier." },
};

// ── Apply to vocab_items.json ─────────────────────────────────────────

const items = JSON.parse(fs.readFileSync(filePath, "utf8"));
let updated_count = 0;
let not_found = [];

const updated = items.map((item) => {
  if (item.stage !== "V3") return item;
  const patch = BANK[item.base_word];
  if (!patch) {
    not_found.push(item.base_word);
    return item;
  }
  updated_count++;
  return { ...item, chinese: patch.chinese, example: patch.example };
});

fs.writeFileSync(filePath, JSON.stringify(updated, null, 2) + "\n", "utf8");
console.log(`V3 items updated: ${updated_count} / ${items.filter(i => i.stage === "V3").length}`);
if (not_found.length) console.log("No bank entry for:", not_found.join(", "));

// Spot-check
const spot = updated.filter(i => i.stage === "V3").slice(0, 5);
spot.forEach(i => {
  console.log(`\n  ${i.base_word}`);
  console.log(`    chinese: ${i.chinese}`);
  console.log(`    example: ${i.example}`);
});
