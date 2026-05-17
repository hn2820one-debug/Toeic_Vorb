// Rewrites V2 question stems that embed the word definition as a parenthetical clue.
// Replaces them with real TOEIC-style context sentences.
// Preserves all other fields (options, correct_answer, explanation_zh, etc.)
// Run: node scripts/rewrite-v2-definitions.js

const fs = require("fs");
const path = require("path");

const vocabDir = path.resolve(__dirname, "..", "data", "vocab");
const V2_FILES = ["questions_v2a.json","questions_v2b.json","questions_v2c.json","questions_v2d.json","questions_v2e.json"];

// ── Detection helpers ─────────────────────────────────────────────────────────

const DEF_PATTERNS = [
  /,\s+the [a-z][^,]{5,50},/i,
  /,\s+which (means?|refers? to)[^,]{3,}/i,
  /[㐀-鿿]{2,}/,
];

function hasDefinitionInStem(text) {
  return DEF_PATTERNS.some((re) => re.test(String(text || "")));
}

function getDocType(text, type) {
  if (type === "review_question") return "review";
  const t = String(text || "");
  if (t.startsWith("Notice:")) return "notice";
  if (t.startsWith("Conversation:")) return "conversation";
  if (t.startsWith("Memo:")) return "memo";
  if (t.startsWith("Announcement:")) return "announcement";
  return null; // Email or unknown → skip
}

function extractTrailingId(text) {
  const m = String(text || "").match(/\([^)]*-\d{2,}\w*\)\s*$/);
  return m ? " " + m[0].trim() : "";
}

// ── SENTENCE_BANK keyed by item_id ────────────────────────────────────────────
// Each entry: { notice, conversation, memo, announcement, review }
// Every sentence must contain exactly one "______" blank.

const BANK = {
  // ── V2-A-71 ──
  item_v2_v2_a_71_extension: {
    notice: "Please use ______ 2045 to reach the facilities management team directly.",
    conversation: "I'll transfer your call to the HR department — what ______ should I dial?",
    memo: "Staff can contact the payroll team at internal ______ 218 during business hours.",
    announcement: "The IT support ______ number has been updated to 5500 starting Monday.",
    review: "Each department's ______ number is listed in the internal company directory.",
  },
  item_v2_v2_a_71_photocopier: {
    notice: "The ______ on the third floor is currently out of service until further notice.",
    conversation: "Is the ______ near the break room available, or is it still jammed?",
    memo: "Large batch print jobs should be sent to the ______ in Room 202.",
    announcement: "A new high-speed ______ has been installed in the main print room on Floor 4.",
    review: "Please clear any remaining documents from the ______ tray after use.",
  },
  item_v2_v2_a_71_stationery: {
    notice: "All ______ requests must be submitted via the online form by Thursday.",
    conversation: "Could you check whether we have enough ______ for the new team members?",
    memo: "The supply room has been restocked with ______, including notepads and pens.",
    announcement: "Beginning next month, all ______ orders will be placed through the new vendor.",
    review: "Departments should consolidate their ______ needs into a single monthly order.",
  },
  item_v2_v2_a_71_workstation: {
    notice: "Please ensure your ______ is locked and the screen is off before leaving.",
    conversation: "The new hire starts Monday — has her ______ been set up yet?",
    memo: "IT will run security checks on every ______ in the office this Friday afternoon.",
    announcement: "Staff assigned to temporary ______ units should report any technical issues to IT.",
    review: "Each employee is responsible for keeping their ______ clean and properly maintained.",
  },
  // ── V2-A-72 ──
  item_v2_v2_a_72_agenda: {
    notice: "A copy of the meeting ______ will be distributed one hour before the session.",
    conversation: "Has the ______ for Thursday's board meeting been finalized yet?",
    memo: "Please review the attached ______ and confirm your availability by end of day.",
    announcement: "The updated conference ______ is now available on the company intranet.",
    review: "Items not on the ______ will be deferred to the next scheduled meeting.",
  },
  item_v2_v2_a_72_attendee: {
    notice: "Each ______ is required to sign in at the registration desk upon arrival.",
    conversation: "How many ______ are we expecting at the product launch event?",
    memo: "The seminar is limited to 30 ______ — please register your name by Friday.",
    announcement: "All ______ are asked to remain seated until the session officially ends.",
    review: "An evaluation form will be sent to each ______ after the workshop concludes.",
  },
  item_v2_v2_a_72_minutes: {
    notice: "The ______ from last week's meeting are available on the shared drive.",
    conversation: "Could you send me the ______ from yesterday's budget review meeting?",
    memo: "Please ensure the ______ are circulated to all participants within 24 hours.",
    announcement: "Meeting ______ will be posted to the team portal within two business days.",
    review: "The secretary is responsible for preparing and distributing the ______ after each session.",
  },
  item_v2_v2_a_72_venue: {
    notice: "The training session ______ has been changed to Conference Room B on the fourth floor.",
    conversation: "Have we confirmed the ______ for the annual staff dinner yet?",
    memo: "Please book a suitable ______ for the client presentation scheduled for next Tuesday.",
    announcement: "Due to renovations, the event ______ has been relocated to the adjacent building.",
    review: "All participants should arrive at the ______ at least 15 minutes before the session begins.",
  },
  // ── V2-A-73 ──
  item_v2_v2_a_73_appointment: {
    notice: "Please cancel or reschedule your ______ at least 24 hours in advance.",
    conversation: "I'd like to make an ______ with the department head for next Wednesday.",
    memo: "Your ______ with the client has been confirmed for 2:00 p.m. on Thursday.",
    announcement: "The registration desk will accept walk-in ______ requests from 9 a.m. to noon.",
    review: "Staff must confirm their ______ by phone or email at least one day in advance.",
  },
  item_v2_v2_a_73_availability: {
    notice: "Please update your calendar to reflect your current ______ for next week.",
    conversation: "Before we schedule the meeting, could you check everyone's ______?",
    memo: "The project team's ______ during the holiday week has been noted for planning purposes.",
    announcement: "Limited ______ remains for Friday's advanced training session — register now.",
    review: "Please confirm your ______ for the client call before the coordinator sends an invite.",
  },
  item_v2_v2_a_73_deadline: {
    notice: "All applications must be submitted before the ______ of 5:00 p.m. on Friday.",
    conversation: "The client moved the project ______ up by two weeks — can we still meet it?",
    memo: "Please note that the report ______ has been extended to next Monday at noon.",
    announcement: "The registration ______ for the annual conference is this coming Thursday.",
    review: "Late submissions after the ______ will not be considered for this round.",
  },
  item_v2_v2_a_73_itinerary: {
    notice: "A copy of your travel ______ has been sent to your company email address.",
    conversation: "Can you send me the final ______ for the Tokyo business trip?",
    memo: "The attached ______ outlines all flight, hotel, and meeting details for the conference.",
    announcement: "Changes to the event ______ will be posted on the conference website.",
    review: "Review your ______ carefully and contact the travel desk if any adjustments are needed.",
  },
  // ── V2-A-74 ──
  item_v2_v2_a_74_attachment: {
    notice: "Please open the ______ for the latest project guidelines before starting.",
    conversation: "I sent you an email with an ______ — could you check if you received it?",
    memo: "The signed contract is included as an ______ to this email for your records.",
    announcement: "Reference documents are available as an ______ in the follow-up email.",
    review: "If the ______ fails to open, please contact the IT helpdesk for assistance.",
  },
  item_v2_v2_a_74_directory: {
    notice: "The updated staff ______ is available on the company intranet under Resources.",
    conversation: "Do you have the office ______ handy? I need the HR manager's extension.",
    memo: "Please verify that your contact details are correct in the employee ______.",
    announcement: "The new vendor ______ listing approved suppliers will be shared by end of week.",
    review: "Refer to the branch ______ for contact information for all regional offices.",
  },
  item_v2_v2_a_74_invoice: {
    notice: "All ______ must be approved by the department head before submission to finance.",
    conversation: "The client is asking why the ______ amount differs from the original quote.",
    memo: "Please process the attached ______ for payment within 30 days of receipt.",
    announcement: "From next month, all ______ submissions must include the project reference number.",
    review: "Finance will not process any ______ that is missing a valid purchase order number.",
  },
  item_v2_v2_a_74_memo: {
    notice: "A ______ regarding the new office hours policy has been distributed to all staff.",
    conversation: "Did you get the ______ about the changes to the expense submission process?",
    memo: "Please circulate this ______ to your team and confirm receipt by Wednesday.",
    announcement: "An internal ______ will be issued to all departments following the board meeting.",
    review: "The policy changes are outlined in the ______ sent by the operations director last week.",
  },
  // ── V2-A-75 ──
  item_v2_v2_a_75_correspondence: {
    notice: "All external ______ must be copied to the department head for record-keeping.",
    conversation: "Please keep a copy of all ______ with the client on file for reference.",
    memo: "A record of all vendor ______ should be stored in the shared project folder.",
    announcement: "Any formal ______ regarding the contract must go through the legal department.",
    review: "Staff should respond to client ______ within two business days.",
  },
  item_v2_v2_a_75_inquiry: {
    notice: "Direct all product ______ to the customer service team at ext. 400.",
    conversation: "We received an ______ from a potential client interested in our services.",
    memo: "Please follow up on the ______ from PTA Ltd. and provide a quote by Thursday.",
    announcement: "For media ______, please contact the public relations department directly.",
    review: "All ______ about the job posting should be directed to the HR department.",
  },
  item_v2_v2_a_75_notification: {
    notice: "You will receive a ______ by email once your application has been reviewed.",
    conversation: "Did you get the system ______ about the scheduled maintenance tonight?",
    memo: "A ______ will be sent to all affected staff at least 48 hours before changes take effect.",
    announcement: "An official ______ regarding parking arrangements will be issued next week.",
    review: "Please ensure that all team members receive the ______ before the end of the day.",
  },
  item_v2_v2_a_75_recipient: {
    notice: "Please verify the ______ address before sending any sensitive documents.",
    conversation: "Who is the intended ______ for this package? The label is unclear.",
    memo: "Each ______ of this circular is asked to confirm receipt by replying to this email.",
    announcement: "The ______ of this year's employee excellence award will be announced at the ceremony.",
    review: "The email was delivered to the wrong ______ due to a typo in the address.",
  },
  // ── V2-A-76 ──
  item_v2_v2_a_76_cafeteria: {
    notice: "The ______ on the second floor will be closed for maintenance on Wednesday.",
    conversation: "Should we grab lunch in the ______, or would you prefer to go out?",
    memo: "Meal vouchers for the staff ______ will be distributed at the end of this week.",
    announcement: "The ______ will offer extended hours during the annual conference.",
    review: "Hot meals in the ______ are available from 11:30 a.m. to 2:00 p.m. on weekdays.",
  },
  item_v2_v2_a_76_elevator: {
    notice: "The east ______ will be out of service from Monday through Wednesday for repairs.",
    conversation: "Take the ______ to the 12th floor — the meeting room is on the left.",
    memo: "Staff are reminded not to use the ______ during fire drills or evacuations.",
    announcement: "The ______ inspection has been rescheduled to next Thursday morning.",
    review: "Visitors should use the main ______ near reception to access the upper floors.",
  },
  item_v2_v2_a_76_lobby: {
    notice: "All visitors must check in at the security desk in the main ______.",
    conversation: "I'll meet you in the ______ downstairs at 3 o'clock.",
    memo: "Delivery personnel should wait in the ground-floor ______ until escorted to the relevant floor.",
    announcement: "The company's annual exhibit will be displayed in the main ______ throughout June.",
    review: "Please ensure guests are met in the ______ and issued a visitor badge before proceeding.",
  },
  item_v2_v2_a_76_parking: {
    notice: "The underground ______ lot will be closed for repaving next Monday.",
    conversation: "Is there visitor ______ available near the main entrance?",
    memo: "Staff applying for a ______ permit should submit the form to the facilities office.",
    announcement: "Designated ______ spaces for company vehicles are marked on Level B2.",
    review: "Employees without a registered ______ permit should use the nearby public lot.",
  },
  // ── V2-A-77 ──
  item_v2_v2_a_77_approval: {
    notice: "All travel expenses over $200 require manager ______ before reimbursement.",
    conversation: "Has the budget plan received ______ from the finance department yet?",
    memo: "The project cannot proceed until we receive written ______ from the director.",
    announcement: "Final ______ for the new office layout has been granted by senior management.",
    review: "Purchases above the department threshold must have prior ______ from a senior manager.",
  },
  item_v2_v2_a_77_authorization: {
    notice: "Staff require written ______ before accessing restricted storage areas.",
    conversation: "Do I need ______ from the compliance team before sharing this report?",
    memo: "Provide written ______ from your department head when submitting this request.",
    announcement: "System ______ for the new software will be issued to team leaders by Friday.",
    review: "Employees must carry their ______ letter when entering the server room.",
  },
  item_v2_v2_a_77_request_form: {
    notice: "Please complete the ______ in full and submit it to the HR office by noon.",
    conversation: "Where can I download the ______ for office equipment repairs?",
    memo: "Attach the signed ______ to your email when contacting the facilities team.",
    announcement: "The updated leave ______ is now available on the employee self-service portal.",
    review: "All supply orders must be accompanied by an approved ______.",
  },
  item_v2_v2_a_77_submission: {
    notice: "The ______ portal will close at midnight on the application deadline.",
    conversation: "When is the final ______ date for the quarterly sales report?",
    memo: "Late ______ will not be accepted after the official closing time.",
    announcement: "Online ______ of conference abstracts is now open until the end of the month.",
    review: "Confirm your ______ by checking the confirmation email sent to your registered address.",
  },
  // ── V2-A-78 ──
  item_v2_v2_a_78_banquet: {
    notice: "Tickets for the annual staff ______ are available at the front desk.",
    conversation: "The client dinner has been moved to the ______ hall on the ground floor.",
    memo: "Menu choices for the charity ______ must be selected by this Friday.",
    announcement: "The awards ______ will be held at the Grand Hotel on December 5th.",
    review: "All ______ arrangements including seating and catering have been confirmed.",
  },
  item_v2_v2_a_78_booth: {
    notice: "Each exhibitor will be assigned a ______ location prior to the event setup.",
    conversation: "Our company ______ at the trade fair is in Hall B, near the main entrance.",
    memo: "Staff working at the exhibition ______ should arrive by 8 a.m. to assist with setup.",
    announcement: "Visitors can collect promotional materials at our ______ throughout the two-day event.",
    review: "Assemble the display materials at your designated ______ before the doors open.",
  },
  item_v2_v2_a_78_registration: {
    notice: "Online ______ for the training session closes on Thursday at 5 p.m.",
    conversation: "Have you completed your event ______ for the regional conference?",
    memo: "Please forward this link to team members who wish to submit their ______.",
    announcement: "Walk-in ______ will be accepted at the venue on the day of the event.",
    review: "Provide your ______ number at the check-in desk to collect your name badge.",
  },
  item_v2_v2_a_78_seminar: {
    notice: "A professional development ______ on project management will be held next Friday.",
    conversation: "Are you planning to attend the marketing ______ at headquarters next month?",
    memo: "Employees are encouraged to attend the compliance ______ scheduled for Tuesday.",
    announcement: "The free online ______ on data security is open to all staff members.",
    review: "Participants who complete the ______ will receive a certificate of attendance.",
  },
  // ── V2-A-79 ──
  item_v2_v2_a_79_baggage: {
    notice: "Passengers are advised to attach a name tag to every piece of checked ______.",
    conversation: "My ______ claim took over 40 minutes — the airport was very busy.",
    memo: "The airline allows two pieces of checked ______ per business-class traveler.",
    announcement: "Please report any lost or damaged ______ to the airline counter immediately.",
    review: "Checked ______ allowances are outlined in your travel policy document.",
  },
  item_v2_v2_a_79_confirmation: {
    notice: "A booking ______ will be sent to your email address within 24 hours.",
    conversation: "I haven't received a ______ for my hotel reservation — could you check?",
    memo: "Please keep a copy of your flight ______ for expense reimbursement purposes.",
    announcement: "Order ______ emails will be sent automatically once payment is processed.",
    review: "Present your registration ______ at the venue entrance to collect your badge.",
  },
  item_v2_v2_a_79_departure: {
    notice: "Please arrive at the boarding gate at least 30 minutes before your ______ time.",
    conversation: "What is our ______ time from the hotel on the final day of the conference?",
    memo: "Staff should arrange airport transportation at least two hours before scheduled ______.",
    announcement: "The ______ lounge on Level 3 is exclusively for business-class passengers.",
    review: "The bus for the ______ terminal will leave the hotel at 6:00 a.m. sharp.",
  },
  item_v2_v2_a_79_reservation: {
    notice: "All hotel ______ must be made through the corporate travel desk.",
    conversation: "Can you check whether a ______ has been made for four people at the restaurant?",
    memo: "Submit your travel ______ details to the finance team at least one week in advance.",
    announcement: "For dinner ______ at the venue, please contact the hotel concierge directly.",
    review: "Changes to your ______ must be requested at least 48 hours before arrival.",
  },
  // ── V2-A-80 ──
  item_v2_v2_a_80_compliance: {
    notice: "All staff must complete the annual ______ training by the end of this quarter.",
    conversation: "We need to check our procedures for ______ with the new data protection rules.",
    memo: "The legal team will review the contract for ______ with local labor regulations.",
    announcement: "A ______ audit will be conducted across all departments in October.",
    review: "Employees found in violation of ______ standards may face disciplinary action.",
  },
  item_v2_v2_a_80_guideline: {
    notice: "Please follow the updated safety ______ when working in the server room.",
    conversation: "Has the HR team issued a ______ on the new remote work arrangements?",
    memo: "The attached ______ explains the correct procedure for submitting expense claims.",
    announcement: "New design ______ for all external communications will take effect next month.",
    review: "Refer to the departmental ______ before submitting your quarterly progress report.",
  },
  item_v2_v2_a_80_policy: {
    notice: "A revised expense reimbursement ______ will take effect on the first of next month.",
    conversation: "What is the company's ______ on using personal devices for work purposes?",
    memo: "Please ensure that all team members are aware of the updated leave ______.",
    announcement: "The new remote work ______ has been approved by the board of directors.",
    review: "Any exception to standard ______ must be approved in writing by a senior manager.",
  },
  item_v2_v2_a_80_requirement: {
    notice: "Meeting the minimum documentation ______ is mandatory for all grant applications.",
    conversation: "Are there any special language ______ for the position you are hiring for?",
    memo: "Review the technical ______ carefully before submitting your system upgrade proposal.",
    announcement: "All new vendors must fulfill the company's insurance ______ before signing.",
    review: "Failure to meet the certification ______ will result in the application being rejected.",
  },
  // ── V2-B-81 ──
  item_v2_v2_b_81_carrier: {
    notice: "Please confirm the name of the approved ______ before booking any freight services.",
    conversation: "Which ______ did we use for the last international delivery? Was it reliable?",
    memo: "All outbound parcels must be processed through our contracted ______.",
    announcement: "Our logistics ______ partner has been updated — please refer to the new vendor list.",
    review: "Contact the ______ directly if the package has not arrived within the estimated window.",
  },
  item_v2_v2_b_81_shipment: {
    notice: "Your ______ is scheduled to arrive at the distribution center on Thursday.",
    conversation: "Can you check on the status of the ______ we sent to the Osaka branch?",
    memo: "All international ______ must include a commercial invoice and customs declaration.",
    announcement: "The delayed ______ from the supplier is now expected by end of next week.",
    review: "Track the status of each ______ using the reference number provided at dispatch.",
  },
  item_v2_v2_b_81_tracking_number: {
    notice: "Please provide your ______ to the customer service team to locate your parcel.",
    conversation: "I'll email you the ______ as soon as the courier confirms pickup.",
    memo: "Record the ______ in the shipping log for every outgoing parcel.",
    announcement: "Customers will receive a ______ by SMS once their order has been dispatched.",
    review: "If the ______ is invalid, contact the logistics department for a corrected reference.",
  },
  item_v2_v2_b_81_warehouse: {
    notice: "All incoming goods must be inspected before being stored in the ______.",
    conversation: "Has the new inventory arrived at the ______? We need it before Friday.",
    memo: "The ______ will be closed for the annual stocktake from Friday to Sunday.",
    announcement: "Effective next month, all bulk orders will be fulfilled from the new regional ______.",
    review: "Staff working in the ______ are required to wear appropriate safety gear at all times.",
  },
  // ── V2-B-82 ──
  item_v2_v2_b_82_inventory: {
    notice: "The monthly ______ count is scheduled for the last Friday of this month.",
    conversation: "Can you check the ______ system to see how many units we have left?",
    memo: "All discrepancies found during the ______ check must be reported to the operations manager.",
    announcement: "A full ______ audit will be conducted at the end of the fiscal quarter.",
    review: "Accurate ______ records are essential for preventing shortages and overstock situations.",
  },
  item_v2_v2_b_82_reorder: {
    notice: "The system will automatically trigger a ______ when stock falls below the minimum level.",
    conversation: "We need to ______ the blue folders — we're almost out of them.",
    memo: "Please submit a ______ request for any items that have reached their threshold level.",
    announcement: "The ______ process for standard supplies has been simplified using the new portal.",
    review: "Review the current stock levels and initiate a ______ for any items below safety stock.",
  },
  item_v2_v2_b_82_stock: {
    notice: "Several items are currently out of ______ due to increased seasonal demand.",
    conversation: "Do we have enough ______ to fulfill the orders coming in this week?",
    memo: "The warehouse team has confirmed that ______ levels are sufficient for the next two weeks.",
    announcement: "A limited edition product will be available while ______ lasts at all branches.",
    review: "Check the ______ status on the inventory portal before confirming any customer orders.",
  },
  item_v2_v2_b_82_supplier: {
    notice: "All new ______ applications must be reviewed by the procurement department.",
    conversation: "Which ______ did we use for the last batch of packaging materials?",
    memo: "Please send the updated specifications to the ______ before the production run begins.",
    announcement: "A new preferred ______ for office equipment has been approved by management.",
    review: "Contact your assigned ______ directly if delivery schedules change unexpectedly.",
  },
  // ── V2-B-83 ──
  item_v2_v2_b_83_clearance: {
    notice: "Goods cannot be released until full ______ from the border authority is received.",
    conversation: "The shipment is held up waiting for ______ — it could take two more days.",
    memo: "Ensure all required documents are attached to avoid delays at ______.",
    announcement: "A certificate of origin is required for ______ of all agricultural products.",
    review: "The shipment was held at the port pending ______ by the local trade authority.",
  },
  item_v2_v2_b_83_customs: {
    notice: "All imported goods must clear ______ before being transferred to the warehouse.",
    conversation: "Our shipment is stuck at ______ — the inspector requested additional paperwork.",
    memo: "Submit the commercial invoice and packing list to ______ at least 48 hours before arrival.",
    announcement: "New ______ regulations on electronic goods take effect at the start of next month.",
    review: "Failure to declare items correctly at ______ can result in significant fines.",
  },
  item_v2_v2_b_83_delivery: {
    notice: "The expected ______ date for your order is Thursday between 9 a.m. and 5 p.m.",
    conversation: "Is the ______ from our supplier confirmed for tomorrow morning?",
    memo: "Please sign the ______ receipt and forward a copy to the purchasing team.",
    announcement: "Same-day ______ is available for orders placed before noon on weekdays.",
    review: "Contact the logistics team immediately if the ______ does not arrive as scheduled.",
  },
  item_v2_v2_b_83_freight: {
    notice: "All international shipments are subject to a ______ charge based on weight and distance.",
    conversation: "What is the estimated ______ cost to ship this order to the Singapore branch?",
    memo: "The ______ invoice from the carrier is attached and requires your approval.",
    announcement: "Air ______ rates have increased — consider sea shipping for non-urgent consignments.",
    review: "The ______ cost is calculated based on actual weight or dimensional weight, whichever is higher.",
  },
  // ── V2-B-84 ──
  item_v2_v2_b_84_label: {
    notice: "Ensure that the shipping ______ is clearly printed and securely attached to each box.",
    conversation: "The barcode on the ______ is damaged — can you issue a replacement?",
    memo: "All hazardous materials must have an approved warning ______ applied before shipping.",
    announcement: "New product ______ designs will be introduced in the next packaging update.",
    review: "Scan the ______ on each item before placing it in the outgoing shipment area.",
  },
  item_v2_v2_b_84_package: {
    notice: "All employees are reminded not to accept suspicious ______ from unknown senders.",
    conversation: "The ______ I ordered has arrived but the box is damaged — what should I do?",
    memo: "Please ensure every ______ is properly sealed and labeled before handover to the courier.",
    announcement: "Customers may track their ______ online using the tracking number in their confirmation email.",
    review: "If a ______ is missing from a delivery, notify the logistics team within 24 hours.",
  },
  item_v2_v2_b_84_packing_slip: {
    notice: "Include a ______ with every outgoing order to help the recipient verify contents.",
    conversation: "The ______ shows three items, but only two were delivered — there may be an error.",
    memo: "Attach the printed ______ to the inside of the carton lid before sealing.",
    announcement: "All ______ must now include the purchase order number for faster processing.",
    review: "Compare the ______ against the physical contents before signing the delivery receipt.",
  },
  item_v2_v2_b_84_receipt: {
    notice: "Retain your payment ______ as proof of purchase for warranty purposes.",
    conversation: "Can you email me the ______ for the office supplies I ordered last week?",
    memo: "Submit original ______ for all business expenses over $50 when filing your claim.",
    announcement: "Electronic ______ will now be issued for all in-store purchases at our branches.",
    review: "Keep a copy of the delivery ______ on file until the order has been fully processed.",
  },
  // ── V2-B-85 ──
  item_v2_v2_b_85_assembly_line: {
    notice: "The ______ will be shut down for maintenance during the third shift on Friday.",
    conversation: "How many units per hour can the ______ produce at full capacity?",
    memo: "Retooling the ______ for the new product model will take approximately three days.",
    announcement: "A new automated ______ has been installed to improve output and reduce errors.",
    review: "Workers on the ______ must wear protective gloves and safety glasses at all times.",
  },
  item_v2_v2_b_85_component: {
    notice: "Inspect each ______ for damage before it is used in the manufacturing process.",
    conversation: "A key ______ for the motor is on backorder — this could delay our schedule.",
    memo: "The quality team will test each ______ before it reaches the assembly stage.",
    announcement: "A supplier recall affects one ______ in the current production batch.",
    review: "Every ______ must meet the minimum quality standard before being approved for use.",
  },
  item_v2_v2_b_85_defect: {
    notice: "Any product with a visible ______ must be set aside for quality inspection.",
    conversation: "The customer returned the unit claiming there was a manufacturing ______ in the casing.",
    memo: "Report any ______ found during inspection immediately to the quality assurance team.",
    announcement: "The ______ rate in last month's batch was below the target threshold of 0.5%.",
    review: "All items flagged with a ______ will be quarantined until the issue is investigated.",
  },
  item_v2_v2_b_85_production: {
    notice: "The ______ schedule for this month has been revised due to supply delays.",
    conversation: "When will the factory return to full ______ after the maintenance shutdown?",
    memo: "The ______ team has requested additional staff to meet the increased order volume.",
    announcement: "Monthly ______ targets will be shared with all shift supervisors by Monday.",
    review: "Delays in raw material delivery have affected this week's ______ output.",
  },
  // ── V2-B-86 ──
  item_v2_v2_b_86_equipment: {
    notice: "All staff must complete a safety briefing before operating heavy ______.",
    conversation: "The testing ______ needs to be calibrated before we start the quality check.",
    memo: "Faulty ______ should be reported to the maintenance team and taken out of service.",
    announcement: "New laboratory ______ will be delivered and installed during the upcoming holiday period.",
    review: "Staff must sign the usage log when borrowing shared ______ from the storage room.",
  },
  item_v2_v2_b_86_inspection: {
    notice: "A fire safety ______ will be carried out in all offices on the 14th of this month.",
    conversation: "Did the vehicle pass its annual ______ at the service center?",
    memo: "Prepare all documentation for the scheduled compliance ______ next Tuesday.",
    announcement: "The building's electrical ______ has been cleared — all systems are operating normally.",
    review: "Ensure that all safety records are up to date before the regulatory ______.",
  },
  item_v2_v2_b_86_repair_request: {
    notice: "Submit a ______ for any faulty equipment using the online maintenance portal.",
    conversation: "I filed a ______ for the broken air conditioning unit — any update on the fix?",
    memo: "All ______ submissions must include the asset number and a description of the fault.",
    announcement: "Pending ______ items will be reviewed at the weekly facilities meeting.",
    review: "Log a ______ immediately if any office equipment stops functioning correctly.",
  },
  item_v2_v2_b_86_technician: {
    notice: "A qualified ______ will be on site to install the new server equipment on Thursday.",
    conversation: "The ______ said the printer needs a part replacement — it won't be ready until Monday.",
    memo: "A certified ______ will inspect all HVAC units in the building next week.",
    announcement: "A service ______ from our equipment provider will conduct a routine check on Friday.",
    review: "Contact the on-call ______ if any production machinery requires urgent attention.",
  },
  // ── V2-B-87 ──
  item_v2_v2_b_87_accommodation: {
    notice: "Please book your ______ through the corporate travel portal to qualify for the company rate.",
    conversation: "Has the ______ for the visiting delegates been arranged at a nearby hotel?",
    memo: "Receipts for ______ expenses must be submitted within 10 days of returning from travel.",
    announcement: "Preferred ______ partners have been updated — please refer to the new approved hotel list.",
    review: "Staff on extended business trips may claim ______ expenses up to the daily limit.",
  },
  item_v2_v2_b_87_boarding_pass: {
    notice: "Print or download your ______ at least two hours before the scheduled departure.",
    conversation: "Could you check in online and send me the ______ as soon as it is available?",
    memo: "Attach a copy of your ______ to your travel expense claim for verification purposes.",
    announcement: "Mobile ______ scanning is now available at all international departure gates.",
    review: "Present your ______ and passport at the gate counter before boarding the aircraft.",
  },
  item_v2_v2_b_87_reimbursement: {
    notice: "Submit all expense receipts within 30 days to qualify for ______.",
    conversation: "When will I receive ______ for the hotel expenses I paid out of pocket?",
    memo: "The updated ______ policy allows meals up to $60 per day during business travel.",
    announcement: "Travel ______ requests can now be submitted through the new HR self-service portal.",
    review: "Claims without supporting receipts will not be eligible for ______.",
  },
  item_v2_v2_b_87_travel_allowance: {
    notice: "Staff traveling to overseas branches will receive a daily ______ to cover meals and incidentals.",
    conversation: "What is the current ______ for business trips to Europe?",
    memo: "The quarterly ______ rates have been updated to reflect current market costs.",
    announcement: "Revised ______ rates for domestic and international travel take effect next month.",
    review: "The ______ is a fixed daily amount and does not require receipts to be submitted.",
  },
  // ── V2-B-88 ──
  item_v2_v2_b_88_contract: {
    notice: "All vendor agreements must be reviewed by the legal team before the ______ is signed.",
    conversation: "Has the supplier returned the signed ______ yet? We need it before we can proceed.",
    memo: "A copy of the signed ______ has been filed in the shared legal documents folder.",
    announcement: "The ______ with our new software provider was finalized and signed this morning.",
    review: "Ensure you fully understand the termination clause before signing any service ______.",
  },
  item_v2_v2_b_88_delivery_date: {
    notice: "The confirmed ______ for this order is the 20th — please plan accordingly.",
    conversation: "Can we negotiate an earlier ______ with the supplier? We need the parts by next week.",
    memo: "The vendor has confirmed a revised ______ of the 18th due to production delays.",
    announcement: "Customers will be notified by email if the expected ______ changes for any reason.",
    review: "Always confirm the ______ in writing before processing a purchase order.",
  },
  item_v2_v2_b_88_purchase_order: {
    notice: "All orders above $500 must be accompanied by an approved ______.",
    conversation: "Can you generate a ______ for the new office chairs we discussed?",
    memo: "The ______ has been approved — please forward it to the supplier to confirm the order.",
    announcement: "From next quarter, all ______ requests must be submitted through the new ERP system.",
    review: "Do not proceed with any order until the ______ has been approved by the finance team.",
  },
  item_v2_v2_b_88_quotation: {
    notice: "Please request a formal ______ from at least three vendors before selecting a supplier.",
    conversation: "The ______ from the new vendor is lower — should we switch for the next order?",
    memo: "A ______ for the IT upgrade has been received and is currently under review.",
    announcement: "Submit your ______ for the upcoming tender by the closing date of the 25th.",
    review: "Compare each ______ carefully for hidden fees before making a final recommendation.",
  },
  // ── V2-B-89 ──
  item_v2_v2_b_89_bill_of_lading: {
    notice: "The ______ must accompany all shipments and be signed by the carrier upon pickup.",
    conversation: "Could you send the ______ for the last shipment? The customs office is asking for it.",
    memo: "Retain the original ______ until the shipment has been confirmed as received.",
    announcement: "All international freight must include a complete and accurate ______ to avoid customs delays.",
    review: "The ______ serves as a contract between the shipper and the carrier for the goods transported.",
  },
  item_v2_v2_b_89_cargo: {
    notice: "All ______ must be declared and documented before being loaded onto the vessel.",
    conversation: "Is the ______ from the Shanghai factory ready for dispatch this week?",
    memo: "The ______ hold was full, so the remaining goods are rescheduled for the next vessel.",
    announcement: "Temperature-sensitive ______ must be labeled and stored in the refrigerated section.",
    review: "Unaccompanied ______ will be held at the port until clearance documents are submitted.",
  },
  item_v2_v2_b_89_delay: {
    notice: "A shipping ______ due to weather conditions has pushed the arrival back by three days.",
    conversation: "There's a ______ at customs — the package won't arrive until the end of the week.",
    memo: "The project is facing a potential ______ if the components are not received by Friday.",
    announcement: "Passengers are advised that the flight is experiencing a two-hour ______.",
    review: "Notify the client immediately if there is any ______ to the agreed delivery schedule.",
  },
  item_v2_v2_b_89_destination: {
    notice: "Check the ______ address on every package before handing it to the courier.",
    conversation: "What is the final ______ for this shipment — Singapore or the regional hub?",
    memo: "All packages should be clearly labeled with both the origin and ______ details.",
    announcement: "Goods shipped to the wrong ______ will be returned at the sender's expense.",
    review: "The route planner will calculate the most efficient path to each ______ automatically.",
  },
  // ── V2-B-90 ──
  item_v2_v2_b_90_refund: {
    notice: "A full ______ will be issued within 7 business days of receiving the returned item.",
    conversation: "The customer is asking for a ______ because the product arrived damaged.",
    memo: "Partial ______ requests must be reviewed and approved by the customer service manager.",
    announcement: "______ requests must be submitted within 30 days of the original purchase date.",
    review: "Ensure the original receipt is included with the returned item to process the ______.",
  },
  item_v2_v2_b_90_replacement: {
    notice: "A free ______ will be shipped within 48 hours if the item is found to be defective.",
    conversation: "The unit is faulty — should we send a ______ or offer a refund instead?",
    memo: "The approved ______ for the discontinued model is listed on the product page.",
    announcement: "We apologize for the inconvenience and will arrange a ______ at no additional cost.",
    review: "Complete the return form and include the defective item before a ______ can be dispatched.",
  },
  item_v2_v2_b_90_return_authorization: {
    notice: "You must obtain a ______ number before sending any goods back to the supplier.",
    conversation: "I need to send this back — can you issue a ______ for the damaged unit?",
    memo: "The ______ process has been updated — please refer to the new policy on the intranet.",
    announcement: "All returns must include a valid ______ number printed on the outer packaging.",
    review: "Contact the customer service team to request a ______ for any defective or incorrect item.",
  },
  item_v2_v2_b_90_warranty: {
    notice: "This product is covered by a two-year ______ against manufacturing defects.",
    conversation: "Is the laptop still under ______, or do we need to pay for the repair?",
    memo: "The ______ period for all equipment purchased this quarter expires in March of next year.",
    announcement: "Extended ______ packages are available for purchase at the time of your order.",
    review: "Keep your proof of purchase safe, as it is required for all ______ claims.",
  },
  // ── V2-C-91 ──
  item_v2_v2_c_91_applicant: {
    notice: "Each ______ must submit a completed application form by the posted deadline.",
    conversation: "We've received over 80 ______ for the open position — it will take time to review them.",
    memo: "Shortlisted ______ will be contacted by phone for an initial interview.",
    announcement: "Qualified ______ are encouraged to apply before the closing date of the 31st.",
    review: "Every ______ is required to provide two professional references at the time of application.",
  },
  item_v2_v2_c_91_recruitment: {
    notice: "The ______ campaign for seasonal staff will begin at the start of next month.",
    conversation: "Our ______ team is currently running interviews for the finance manager role.",
    memo: "The ______ process for the new regional branch will be handled by an external agency.",
    announcement: "The company's ______ drive for graduate positions will be launched in September.",
    review: "All ______ activities must comply with the company's equal opportunity employment policy.",
  },
  item_v2_v2_c_91_reference: {
    notice: "Please provide the contact details of two professional ______ when submitting your application.",
    conversation: "I'd like to use you as a ______ for the position I'm applying for — is that all right?",
    memo: "HR will contact each ______ by phone to complete a background verification.",
    announcement: "Applications without a ______ from a current or previous employer may not be considered.",
    review: "A strong ______ from a senior manager significantly improves your application.",
  },
  item_v2_v2_c_91_resume: {
    notice: "Please submit your ______ and cover letter via the online application portal.",
    conversation: "Could you update your ______ before we forward it to the hiring manager?",
    memo: "All candidates are required to attach a current ______ to their application form.",
    announcement: "Drop-in ______ review sessions are available at the career center every Tuesday.",
    review: "Your ______ should be no longer than two pages and tailored to the position applied for.",
  },
  // ── V2-C-92 ──
  item_v2_v2_c_92_interview: {
    notice: "Your ______ is scheduled for Thursday at 10:00 a.m. in Conference Room A.",
    conversation: "How did the ______ go? Do you think you made a good impression?",
    memo: "Candidates selected for the second round ______ will be notified by email.",
    announcement: "A panel ______ will be conducted for all final candidates on the 18th.",
    review: "Prepare specific examples for the behavioral questions during your ______.",
  },
  item_v2_v2_c_92_orientation: {
    notice: "The new employee ______ program will begin at 9:00 a.m. on Monday morning.",
    conversation: "The ______ for new staff covers everything from IT access to company procedures.",
    memo: "Please ensure all new hires attend the ______ session on their first day of employment.",
    announcement: "The online ______ modules have been updated and are now available on the training portal.",
    review: "New staff who miss the scheduled ______ must complete the online self-paced version.",
  },
  item_v2_v2_c_92_position: {
    notice: "Applications are now open for the senior project manager ______ in the operations division.",
    conversation: "Is the analyst ______ full-time, or will it start as a contract role?",
    memo: "The ______ has been reclassified as a Grade 4 role following the HR review.",
    announcement: "We are pleased to announce that the open ______ has been filled internally.",
    review: "A detailed job description for each ______ is available on the careers page.",
  },
  item_v2_v2_c_92_probation: {
    notice: "New employees are subject to a three-month ______ period before confirmation.",
    conversation: "She's still in her ______ period — a formal review will take place next month.",
    memo: "Performance during the ______ period will be assessed against the agreed key objectives.",
    announcement: "Staff who successfully complete their ______ will be offered a permanent contract.",
    review: "Any conduct issues during the ______ period must be documented and reported to HR.",
  },
  // ── V2-C-93 ──
  item_v2_v2_c_93_benefits: {
    notice: "A summary of your employment ______ package is available in the staff handbook.",
    conversation: "Does the company offer health insurance as part of the ______ package?",
    memo: "The revised ______ plan for next year will be communicated to all staff by October.",
    announcement: "Updates to the company ______ scheme will take effect at the start of the new fiscal year.",
    review: "New employees will be enrolled in the standard ______ program from their first working day.",
  },
  item_v2_v2_c_93_overtime: {
    notice: "All ______ must be pre-approved by your line manager before working additional hours.",
    conversation: "I've been working ______ every day this week — the deadline is really tight.",
    memo: "Employees who work approved ______ will receive payment at 1.5 times their base hourly rate.",
    announcement: "The ______ log for last month has been reviewed and discrepancies corrected.",
    review: "Submit your ______ claim form to HR within five business days of the additional hours worked.",
  },
  item_v2_v2_c_93_payroll: {
    notice: "Please verify your bank details with HR to ensure accurate ______ deposits.",
    conversation: "There was an error in this month's ______ — my tax deduction seems too high.",
    memo: "All timesheet submissions for the current month must reach ______ by Thursday noon.",
    announcement: "The ______ system will be undergoing maintenance on Saturday from 8 p.m. to midnight.",
    review: "Contact the HR department immediately if you notice any discrepancy in your ______ statement.",
  },
  item_v2_v2_c_93_vacation_leave: {
    notice: "Submit your ______ application at least two weeks before your intended start date.",
    conversation: "I've accumulated 12 days of ______ — I'd like to take a week off in August.",
    memo: "Requests for ______ during the peak period must be submitted for manager approval.",
    announcement: "Unused ______ for this fiscal year may not be carried over after December 31st.",
    review: "Employees are entitled to 14 days of paid ______ per year under the standard contract.",
  },
  // ── V2-C-94 ──
  item_v2_v2_c_94_appraisal: {
    notice: "Annual performance ______ reviews will be conducted during the month of November.",
    conversation: "My ______ meeting with the department head is tomorrow morning.",
    memo: "Managers must complete all staff ______ forms and submit them by the due date.",
    announcement: "The mid-year ______ process will begin next week — please prepare your self-assessment.",
    review: "Your ______ score will influence eligibility for a salary increase and promotion.",
  },
  item_v2_v2_c_94_promotion: {
    notice: "Employees eligible for ______ will be notified by HR following the annual review.",
    conversation: "I heard that three members of our team are being considered for ______.",
    memo: "Any ______ recommendation must be supported by documented performance records.",
    announcement: "We are pleased to announce the ______ of Ms. Lin to the role of Senior Manager.",
    review: "The committee will review all ______ nominations at the end of the quarterly cycle.",
  },
  item_v2_v2_c_94_resignation: {
    notice: "Staff intending to leave must submit a written ______ letter to their direct manager.",
    conversation: "Did you hear that the marketing director handed in her ______ last Friday?",
    memo: "Upon ______, the employee is required to complete a formal handover process.",
    announcement: "Following the team manager's ______, the department will be led by the deputy temporarily.",
    review: "A copy of the ______ letter should be forwarded to HR for recording purposes.",
  },
  item_v2_v2_c_94_transfer: {
    notice: "The approved ______ to the Singapore office will take effect on the first of next month.",
    conversation: "I've applied for an internal ______ to the product development team.",
    memo: "The inter-departmental ______ must be approved by both current and receiving managers.",
    announcement: "Two senior staff members have accepted ______ to the newly established Asia Pacific hub.",
    review: "All personal belongings and access credentials must be updated upon completing the ______.",
  },
  // ── V2-C-95 ──
  item_v2_v2_c_95_certificate: {
    notice: "A completion ______ will be awarded to all participants who pass the final assessment.",
    conversation: "I need to renew my safety ______ before I can work on site.",
    memo: "Please submit a copy of your professional ______ to HR for inclusion in your personnel file.",
    announcement: "Participants who complete the course will receive a recognized industry ______.",
    review: "Display your ______ in your workspace as confirmation of your completed training.",
  },
  item_v2_v2_c_95_enrollment: {
    notice: "Online ______ for the upcoming leadership program closes this Friday.",
    conversation: "Is ______ for the Excel training course still open? I'd like to sign up.",
    memo: "Please confirm your ______ in the mandatory compliance training before the deadline.",
    announcement: "Early ______ is recommended as class sizes are limited to 15 participants.",
    review: "You will receive a confirmation email within 24 hours of completing your ______.",
  },
  item_v2_v2_c_95_instructor: {
    notice: "The ______ for the afternoon session has been changed — please check the updated schedule.",
    conversation: "The ______ was excellent — the course was well-structured and very practical.",
    memo: "Each workshop ______ should submit course materials to HR at least one week in advance.",
    announcement: "A guest ______ from the finance sector will lead Tuesday's investment seminar.",
    review: "Participants are encouraged to ask the ______ any questions at the end of each module.",
  },
  item_v2_v2_c_95_workshop: {
    notice: "The communication skills ______ will be held in Room 3B on the 22nd from 9 a.m. to 1 p.m.",
    conversation: "Did you attend the project management ______ last Thursday? It was very helpful.",
    memo: "Sign up for the upcoming Excel ______ via the training portal before Friday.",
    announcement: "A free stress management ______ is available to all staff on a first-come basis.",
    review: "Employees who complete the ______ will receive two hours of professional development credit.",
  },
  // ── V2-C-96 ──
  item_v2_v2_c_96_attendance: {
    notice: "Please swipe your access card at the entrance to record your ______ each day.",
    conversation: "Three people missed the meeting — we'll note their ______ as absent.",
    memo: "The ______ record for last month has been reviewed and sent to payroll for processing.",
    announcement: "All staff are reminded that ______ at the quarterly review meeting is mandatory.",
    review: "Repeated unexplained absences may affect your ______ record and performance review.",
  },
  item_v2_v2_c_96_colleague: {
    notice: "Please direct any staffing concerns to your manager rather than your ______ directly.",
    conversation: "My ______ from the accounts team offered to cover my shift while I'm away.",
    memo: "Thank your ______ in writing if they contributed significantly to a team project.",
    announcement: "A farewell event for our departing ______ will be held in the break room on Friday.",
    review: "If a ______ is struggling with workload, speak to your supervisor for support options.",
  },
  item_v2_v2_c_96_dress_code: {
    notice: "A reminder that business casual ______ applies on all days except formal client meeting days.",
    conversation: "What is the ______ for the conference tomorrow — formal or smart casual?",
    memo: "The updated ______ policy is now available in the employee handbook on the intranet.",
    announcement: "Staff attending the client dinner are required to follow formal ______ guidelines.",
    review: "Any questions about appropriate attire should be directed to HR using the published ______ guide.",
  },
  item_v2_v2_c_96_supervisor: {
    notice: "All leave requests must be submitted and approved by your direct ______ in advance.",
    conversation: "My ______ asked me to prepare a summary report by Thursday afternoon.",
    memo: "Please copy your ______ on all communications related to the ongoing client project.",
    announcement: "Staff with performance concerns should schedule a meeting with their ______ promptly.",
    review: "Report any workplace safety issues to your ______ or the facilities management team.",
  },
  // ── V2-C-97 ──
  item_v2_v2_c_97_branch: {
    notice: "The Taipei ______ will relocate to its new address on the first of next month.",
    conversation: "Which ______ will you be based at after the transfer — Hong Kong or Singapore?",
    memo: "Please coordinate with the regional ______ manager before finalizing delivery arrangements.",
    announcement: "A new ______ is opening in the southern district to serve the growing customer base.",
    review: "Staff at each ______ are required to submit monthly performance reports to head office.",
  },
  item_v2_v2_c_97_candidate: {
    notice: "All shortlisted ______ will be contacted within five business days for an interview.",
    conversation: "We have three strong ______ for the senior analyst role — the final decision is tough.",
    memo: "Please ensure each ______ receives a confirmation email after their interview is scheduled.",
    announcement: "The successful ______ will be selected based on technical skills and cultural fit.",
    review: "Each ______ must complete a written test before advancing to the panel interview stage.",
  },
  item_v2_v2_c_97_department: {
    notice: "The new budget allocation for each ______ will be communicated next week.",
    conversation: "Which ______ is responsible for handling overseas client accounts?",
    memo: "A meeting with all ______ heads has been scheduled for Monday at 9 a.m.",
    announcement: "The IT ______ will be implementing system upgrades over the coming weekend.",
    review: "Check with your ______ manager before committing to any additional project responsibilities.",
  },
  item_v2_v2_c_97_vacancy: {
    notice: "A ______ for a project coordinator has been posted on the company intranet.",
    conversation: "Is there still a ______ in the finance team, or has it been filled?",
    memo: "Report any ______ in your team to HR as soon as it is anticipated.",
    announcement: "Two ______ positions for senior engineers have been advertised on our careers page.",
    review: "Applicants can apply for any current ______ through the online HR portal.",
  },
  // ── V2-C-98 ──
  item_v2_v2_c_98_access_card: {
    notice: "Your ______ must be returned to HR on your last working day.",
    conversation: "I forgot my ______ at home — how do I get into the building?",
    memo: "Replacement ______ requests should be submitted to the facilities team with a valid reason.",
    announcement: "All ______ will need to be reprogrammed following the system upgrade next weekend.",
    review: "Do not lend your ______ to anyone — each one is registered to an individual employee.",
  },
  item_v2_v2_c_98_badge: {
    notice: "All staff must wear their ID ______ visibly while on company premises.",
    conversation: "I've misplaced my security ______ — should I report it to reception immediately?",
    memo: "Temporary visitor ______ must be collected from reception and returned upon departure.",
    announcement: "New employee photo ______ will be issued during the first week of onboarding.",
    review: "Wearing your ______ ensures that security personnel can quickly identify authorized staff.",
  },
  item_v2_v2_c_98_handbook: {
    notice: "Please read the employee ______ carefully before your first day of work.",
    conversation: "Is the information about the expense policy in the staff ______?",
    memo: "The updated ______ has been uploaded to the intranet — all staff must acknowledge receipt.",
    announcement: "A revised employee ______ will be distributed at the all-staff briefing next Monday.",
    review: "The ______ outlines all company policies, procedures, and employee responsibilities.",
  },
  item_v2_v2_c_98_workspace: {
    notice: "Staff are responsible for keeping their ______ clean and organized at all times.",
    conversation: "The shared ______ on the third floor is available for project teams during busy periods.",
    memo: "Hot-desking ______ must be booked in advance through the facilities management system.",
    announcement: "The new open-plan ______ design will be introduced on Floor 7 starting next quarter.",
    review: "Employees should not leave personal items in shared ______ areas at the end of the day.",
  },
  // ── V2-C-99 ──
  item_v2_v2_c_99_direct_deposit: {
    notice: "Please verify your bank account number on file to ensure accurate ______ payments.",
    conversation: "Has my ______ been set up yet? I haven't seen my salary in my account.",
    memo: "All employees must enroll in ______ to receive their monthly salary electronically.",
    announcement: "The company will process all salaries through ______ starting from next month.",
    review: "To update your ______ details, submit the bank account change form to the HR department.",
  },
  item_v2_v2_c_99_emergency_contact: {
    notice: "Please ensure that your ______ information in HR's system is current and accurate.",
    conversation: "HR is asking all staff to update their ______ details in the employee portal.",
    memo: "Verify and update your ______ record annually or whenever there is a change.",
    announcement: "All new staff must submit their ______ information as part of their onboarding documents.",
    review: "An accurate ______ record ensures that the right person is notified in an emergency.",
  },
  item_v2_v2_c_99_personnel_file: {
    notice: "Your ______ will be maintained by HR throughout your employment and for seven years after.",
    conversation: "Is my training certificate included in my ______? I may need it for a reference.",
    memo: "Please forward any certifications or updated qualifications for inclusion in your ______.",
    announcement: "Employees may request to review their own ______ with 48 hours' written notice.",
    review: "Ensure all performance appraisal records are accurately documented in the employee's ______.",
  },
  item_v2_v2_c_99_tax_form: {
    notice: "Please complete and submit your annual ______ to the finance department by March 31st.",
    conversation: "Where do I get the ______ for the new employees who started this month?",
    memo: "All staff must review and sign their updated ______ before the end of this fiscal quarter.",
    announcement: "New ______ templates for the upcoming fiscal year are now available on the HR portal.",
    review: "Contact the payroll team if you have questions about completing your ______.",
  },
  // ── V2-C-100 ──
  item_v2_v2_c_100_evacuation: {
    notice: "An ______ drill will be conducted at 10:00 a.m. on Thursday — proceed to your assigned exit.",
    conversation: "During the ______, all staff should leave immediately and not use the elevators.",
    memo: "Review the ______ route map posted beside each emergency exit in your work area.",
    announcement: "A mandatory fire ______ exercise will take place across all floors on Friday morning.",
    review: "All staff must be familiar with the nearest ______ route from their workspace.",
  },
  item_v2_v2_c_100_first_aid_kit: {
    notice: "A ______ is mounted on the wall near the main entrance of each floor.",
    conversation: "Where is the nearest ______ in this office? One of my team members cut their hand.",
    memo: "Check the contents of each ______ monthly and restock any missing or expired items.",
    announcement: "Newly installed ______ stations are located in the kitchen, print room, and gym.",
    review: "Report to the trained first aider and locate the ______ in the event of a minor injury.",
  },
  item_v2_v2_c_100_hazard: {
    notice: "Report any workplace ______ to the safety officer immediately using the online form.",
    conversation: "There's a wet floor near the break room entrance — it's a serious slip ______.",
    memo: "All identified ______ must be logged in the safety management system within 24 hours.",
    announcement: "A ______ assessment will be carried out in the production area next Wednesday.",
    review: "Employees who identify a ______ on site should place a warning sign and report it promptly.",
  },
  item_v2_v2_c_100_incident_report: {
    notice: "Submit an ______ within 24 hours of any workplace accident, no matter how minor.",
    conversation: "I slipped in the corridor — do I need to fill out an ______?",
    memo: "All supervisors must ensure that the ______ is completed accurately and submitted to HR.",
    announcement: "The updated ______ form is now available in both digital and printed formats.",
    review: "An accurate ______ helps identify patterns and prevent future workplace accidents.",
  },
  // ── V2-D-101 ──
  item_v2_v2_d_101_budget: {
    notice: "Each department must submit its annual ______ proposal by the end of this month.",
    conversation: "We're running over ______ on the project — we need to cut some costs.",
    memo: "The revised ______ for Q3 has been approved and will take effect from Monday.",
    announcement: "The finance team will present the new ______ framework at the all-staff meeting.",
    review: "Ensure all planned expenditures are aligned with the approved departmental ______.",
  },
  item_v2_v2_d_101_expense: {
    notice: "Claim all travel ______ within 30 days of the trip using the online portal.",
    conversation: "Can I put the client lunch on my company card as a business ______?",
    memo: "All ______ above $200 require a receipt and prior manager approval.",
    announcement: "The ______ claim form has been updated — please use the latest version from the portal.",
    review: "Keep all receipts for any business ______ you incur while representing the company.",
  },
  item_v2_v2_d_101_profit: {
    notice: "The company's quarterly ______ will be announced in the earnings report next Friday.",
    conversation: "Despite higher sales, our net ______ has declined due to rising material costs.",
    memo: "The product line is not generating sufficient ______ and may be discontinued.",
    announcement: "We are pleased to report that ______ for the fiscal year exceeded the original target.",
    review: "The finance team analyzes ______ margins quarterly to evaluate the performance of each division.",
  },
  item_v2_v2_d_101_revenue: {
    notice: "Monthly ______ figures will be presented at next Tuesday's management meeting.",
    conversation: "The new product line has already increased our ______ by 15% this quarter.",
    memo: "Please ensure that all ______ has been correctly recorded in the accounting system.",
    announcement: "Annual ______ for the company grew by 22% compared to the previous fiscal year.",
    review: "Accurate ______ reporting is critical for evaluating business performance and planning.",
  },
  // ── V2-D-102 ──
  item_v2_v2_d_102_balance: {
    notice: "Check your account ______ before making any large purchases this month.",
    conversation: "My expense report shows a positive ______ from last quarter — can I roll it over?",
    memo: "A statement showing the current ______ on each vendor account will be sent to finance.",
    announcement: "Employees may check their leave ______ at any time through the HR portal.",
    review: "Ensure the invoice ______ is settled before the end of the billing period to avoid penalties.",
  },
  item_v2_v2_d_102_billing_address: {
    notice: "Please confirm that the ______ on file matches your registered company address.",
    conversation: "The invoice was rejected because the ______ didn't match what was on record.",
    memo: "Notify the finance team immediately if your company's ______ has changed.",
    announcement: "Ensure the correct ______ is used for all vendor and client invoices.",
    review: "An incorrect ______ can delay invoice processing and payment by several weeks.",
  },
  item_v2_v2_d_102_due_date: {
    notice: "All invoices must be settled by the ______ to avoid late payment charges.",
    conversation: "What is the ______ for this month's supplier payments?",
    memo: "Send reminders to all vendors whose invoices are approaching their ______.",
    announcement: "A grace period of five business days is allowed after the official ______.",
    review: "Review the invoice carefully to confirm the ______ before scheduling payment.",
  },
  item_v2_v2_d_102_payment: {
    notice: "All outstanding ______ must be cleared before the end of the financial quarter.",
    conversation: "The vendor is asking about the status of their ______ — it's already overdue.",
    memo: "Confirm with finance that the ______ has been processed and a receipt issued.",
    announcement: "Online ______ options are now available for all invoices through the vendor portal.",
    review: "Notify the accounts team if a ______ fails to appear in the system within three business days.",
  },
  // ── V2-D-103 ──
  item_v2_v2_d_103_deposit: {
    notice: "A security ______ equivalent to two months' rent is required before the lease begins.",
    conversation: "I need to make a ______ into the corporate account to cover next week's expenses.",
    memo: "Confirm the ______ has been credited before releasing the goods to the customer.",
    announcement: "A refundable ______ is required when booking the conference room for external events.",
    review: "The ______ was credited to the account within two business days of the transfer.",
  },
  item_v2_v2_d_103_statement: {
    notice: "Your monthly account ______ is available for download through the online banking portal.",
    conversation: "Can you email me the ______ for the project expense account so I can reconcile it?",
    memo: "Attach the bank ______ to your expense report as supporting documentation.",
    announcement: "Year-end financial ______ for all cost centers will be issued by January 15th.",
    review: "Review your ______ carefully each month to identify any unauthorized transactions.",
  },
  item_v2_v2_d_103_transaction: {
    notice: "Each ______ must be recorded in the accounting system within 24 hours of completion.",
    conversation: "The suspicious ______ on the company card needs to be investigated immediately.",
    memo: "All ______ above $1,000 require a countersignature from the finance director.",
    announcement: "Online ______ processing times have been reduced from 3 days to 1 day.",
    review: "Print a copy of the ______ confirmation for the file before the end of the business day.",
  },
  item_v2_v2_d_103_withdrawal: {
    notice: "A ______ of funds for travel must be approved by the department head in advance.",
    conversation: "The petty cash ______ last Tuesday exceeds the approved monthly limit.",
    memo: "All ______ from the company account must be supported by a valid purchase order.",
    announcement: "ATM ______ limits have been adjusted for all corporate cards effective next week.",
    review: "Submit a ______ request form to the finance team with all supporting documentation.",
  },
  // ── V2-D-104 ──
  item_v2_v2_d_104_audit: {
    notice: "An external financial ______ will be conducted during the second week of November.",
    conversation: "Is the accounting team ready for the upcoming compliance ______?",
    memo: "All transaction records must be organized and ready before the ______ team arrives.",
    announcement: "The internal ______ has identified areas for improvement in the expense approval process.",
    review: "Keep all financial records for at least seven years in case of a future ______.",
  },
  item_v2_v2_d_104_deduction: {
    notice: "Check your payslip carefully to confirm the correct ______ has been applied.",
    conversation: "There was an extra ______ from my salary this month — what was it for?",
    memo: "Each eligible business expense should be listed separately as a ______ in the tax filing.",
    announcement: "New tax ______ categories have been introduced for remote working costs.",
    review: "Employees can claim a ______ for approved professional development expenses.",
  },
  item_v2_v2_d_104_ledger: {
    notice: "All entries in the accounts ______ must be reviewed before the period closes.",
    conversation: "I need to cross-check the figures with the general ______ — could you pull it up?",
    memo: "The finance team will reconcile the ______ at the end of each month to ensure accuracy.",
    announcement: "The new accounting software automates ______ entries for recurring transactions.",
    review: "All financial activity should be accurately reflected in the general ______ in real time.",
  },
  item_v2_v2_d_104_tax: {
    notice: "All businesses must file their annual ______ return by March 31st.",
    conversation: "We need to review our expenses carefully before our ______ filing deadline.",
    memo: "The finance team will calculate the corporate ______ liability at the end of the fiscal year.",
    announcement: "New ______ regulations affecting overseas income have been published by the authorities.",
    review: "Consult with the external accountant to ensure full compliance with ______ obligations.",
  },
  // ── V2-D-105 ──
  item_v2_v2_d_105_discount: {
    notice: "A 10% ______ is available for orders placed before the end of this month.",
    conversation: "Can we negotiate a volume ______ if we commit to a three-year contract?",
    memo: "The approved vendor ______ schedule is attached for reference when processing orders.",
    announcement: "Members receive an exclusive 15% ______ on all purchases at the company store.",
    review: "Apply the correct ______ code at checkout to ensure the promotion price is honored.",
  },
  item_v2_v2_d_105_estimate: {
    notice: "Request a written ______ from all suppliers before approving any expenditure over $500.",
    conversation: "The ______ for the renovation came in much higher than we expected.",
    memo: "Please prepare a cost ______ for the new product launch campaign and share it by Friday.",
    announcement: "An independent ______ of the project cost has been commissioned by management.",
    review: "Compare the final invoice to the original ______ to verify that no additional charges were added.",
  },
  item_v2_v2_d_105_rate: {
    notice: "The current exchange ______ will be used for all foreign currency expense reimbursements.",
    conversation: "What is the daily billing ______ for the consultant's services?",
    memo: "The revised service ______ schedule has been sent to all accounts for approval.",
    announcement: "Standard overtime ______ is 1.5 times the regular hourly salary for weekday hours.",
    review: "Review the agreed ______ before approving any additional work beyond the original scope.",
  },
  item_v2_v2_d_105_surcharge: {
    notice: "A fuel ______ will be added to all delivery orders until further notice.",
    conversation: "There's an unexpected ______ on the invoice — what is it for?",
    memo: "International wire transfers attract a flat ______ of $25 per transaction.",
    announcement: "A credit card ______ of 2% applies to all online payment transactions.",
    review: "Notify the accounts team of any ______ that was not agreed upon in the original contract.",
  },
  // ── V2-D-106 ──
  item_v2_v2_d_106_client: {
    notice: "All ______ meetings must be logged in the CRM system within 24 hours of the visit.",
    conversation: "Our key ______ in Tokyo has requested a product demo for next week.",
    memo: "Please send a thank-you note to the ______ following the successful contract signing.",
    announcement: "A ______ appreciation event will be held at headquarters on the last Friday of this month.",
    review: "Maintain regular communication with each ______ to strengthen the business relationship.",
  },
  item_v2_v2_d_106_prospect: {
    notice: "Follow up with every qualified ______ within two business days of the initial inquiry.",
    conversation: "We have a promising new ______ in the healthcare sector — should we schedule a meeting?",
    memo: "Add the new ______ details to the CRM immediately after the first point of contact.",
    announcement: "The sales team has identified 15 high-value ______ contacts from last week's conference.",
    review: "Convert each ______ into a confirmed client by providing tailored proposals.",
  },
  item_v2_v2_d_106_renewal: {
    notice: "Your annual software license is due for ______ at the end of this month.",
    conversation: "The client has confirmed their contract ______ — good news for the team.",
    memo: "Send ______ reminders to clients at least 30 days before their subscription expires.",
    announcement: "Membership ______ for the trade association must be completed before the April deadline.",
    review: "Track upcoming contract ______ dates in the CRM to avoid gaps in service coverage.",
  },
  item_v2_v2_d_106_subscription: {
    notice: "Your annual ______ to the industry database expires at the end of this quarter.",
    conversation: "Should we upgrade our ______ plan to access the premium analytics features?",
    memo: "Please review all active ______ services and cancel those that are no longer required.",
    announcement: "The company's ______ to the market research platform has been renewed for another year.",
    review: "A list of all active ______ and their renewal dates is maintained by the IT department.",
  },
  // ── V2-D-107 ──
  item_v2_v2_d_107_bid: {
    notice: "All qualified suppliers are invited to submit a ______ by the closing date of the 20th.",
    conversation: "We submitted a competitive ______ for the government contract — fingers crossed.",
    memo: "Evaluate each ______ carefully against the technical and financial criteria before recommending.",
    announcement: "A public ______ will be opened for the construction of the new warehouse facility.",
    review: "The winning ______ will be selected based on price, quality, and delivery timeline.",
  },
  item_v2_v2_d_107_procurement: {
    notice: "All ______ requests above $1,000 must be forwarded to the purchasing team for processing.",
    conversation: "Who handles ______ for office supplies — is it facilities or the admin team?",
    memo: "The new ______ policy requires competitive quotes for any purchase exceeding $500.",
    announcement: "The ______ department has negotiated improved rates with all major suppliers.",
    review: "Centralized ______ ensures that the company benefits from bulk discounts across all departments.",
  },
  item_v2_v2_d_107_requisition: {
    notice: "Submit a ______ form to the purchasing team for any equipment not available in stock.",
    conversation: "I've sent the ______ for the new laptops — hopefully it will be approved today.",
    memo: "All ______ requests must include a cost estimate and be approved by the department head.",
    announcement: "The online ______ system has been upgraded to include real-time approval tracking.",
    review: "A ______ must be raised before any non-standard purchase is authorized by the finance team.",
  },
  item_v2_v2_d_107_vendor: {
    notice: "All new ______ relationships must be registered with the procurement department first.",
    conversation: "Which ______ do we use for catering services at our corporate events?",
    memo: "Please assess the performance of each ______ quarterly and flag any service issues.",
    announcement: "A preferred ______ list for all IT services has been approved and is now in effect.",
    review: "A ______ evaluation form must be completed within 30 days of receiving the first delivery.",
  },
  // ── V2-D-108 ──
  item_v2_v2_d_108_license: {
    notice: "All staff driving company vehicles must hold a valid driver's ______ on file.",
    conversation: "Does our new business activity require a separate operating ______?",
    memo: "Renew the software ______ before the end of this quarter to avoid a service interruption.",
    announcement: "A trade ______ is required before we can legally operate in the new market.",
    review: "Keep all business ______ documents in a secure file and renew them before their expiry date.",
  },
  item_v2_v2_d_108_permit: {
    notice: "A construction ______ must be obtained before any building work can begin.",
    conversation: "We need a ______ from the city council before we can set up an outdoor display.",
    memo: "Check whether a ______ is required for the planned renovation before hiring a contractor.",
    announcement: "A temporary operating ______ has been approved for the pop-up retail space downtown.",
    review: "Operating without the required ______ can result in significant fines and business closure.",
  },
  item_v2_v2_d_108_regulation: {
    notice: "All operations must comply with local safety ______ and industry standards.",
    conversation: "The new import ______ means we need additional documentation for our shipments.",
    memo: "Refer to the updated data protection ______ before sharing customer information externally.",
    announcement: "Changes to the environmental ______ affecting our industry take effect in July.",
    review: "Stay updated on changes to industry ______ to ensure full compliance at all times.",
  },
  item_v2_v2_d_108_violation: {
    notice: "Any ______ of the company's code of conduct will result in disciplinary action.",
    conversation: "The safety inspector issued a warning for a ______ found during the factory audit.",
    memo: "Report any suspected ______ of data privacy rules to the compliance team immediately.",
    announcement: "All ______ of the new parking policy will be documented and actioned accordingly.",
    review: "A ______ of import regulations was identified and the shipment was temporarily detained.",
  },
  // ── V2-D-109 ──
  item_v2_v2_d_109_claim: {
    notice: "All insurance ______ must be submitted with supporting documentation within 60 days.",
    conversation: "The travel insurance ______ for my lost luggage was approved last week.",
    memo: "Please complete the expense ______ form and attach all receipts before submitting.",
    announcement: "A ______ assessment team will visit the site on Tuesday to inspect the damage.",
    review: "Keep all receipts and photographs to support your insurance ______ in case of loss.",
  },
  item_v2_v2_d_109_coverage: {
    notice: "Your health plan ______ includes dental and vision care from the start of next month.",
    conversation: "Does our liability policy have ______ for overseas business activities?",
    memo: "Review your insurance ______ annually to ensure it meets current business needs.",
    announcement: "Extended medical ______ for overseas assignments will be provided by the HR department.",
    review: "Confirm the scope of your travel insurance ______ before departing on any business trip.",
  },
  item_v2_v2_d_109_policyholder: {
    notice: "As the ______, you are required to notify the insurer of any change in risk within 30 days.",
    conversation: "The ______ must sign the renewal form before the policy can be extended.",
    memo: "Each ______ will receive a printed summary of their updated policy terms by post.",
    announcement: "All ______ must review and acknowledge the revised terms and conditions this month.",
    review: "The ______ is responsible for ensuring that the information on the policy is accurate and current.",
  },
  item_v2_v2_d_109_premium: {
    notice: "Your annual insurance ______ is due for payment on the first of next month.",
    conversation: "The ______ for our group health plan has increased by 8% this year.",
    memo: "Review whether the insurance ______ justifies the level of cover for the coming year.",
    announcement: "Staff enrolled in the group plan will receive a 5% reduction in their monthly ______.",
    review: "Pay the ______ on time to avoid a lapse in coverage or a penalty charge.",
  },
  // ── V2-D-110 ──
  item_v2_v2_d_110_dividend: {
    notice: "An annual ______ of $1.20 per share will be distributed to eligible shareholders.",
    conversation: "When is the next ______ payment — are the details in the investor report?",
    memo: "The board has approved a special ______ to be paid at the end of Q4.",
    announcement: "The company will issue a ______ to all registered holders of record as of November 1st.",
    review: "The ______ payout ratio reflects the portion of earnings distributed to shareholders.",
  },
  item_v2_v2_d_110_forecast: {
    notice: "The annual revenue ______ has been revised upward following a strong third quarter.",
    conversation: "The ______ for next year looks cautiously optimistic — growth is expected to slow.",
    memo: "Please submit your department's expense ______ for the upcoming fiscal year by Friday.",
    announcement: "The updated sales ______ will be presented at the board meeting on the 18th.",
    review: "The finance team uses historical data and market trends to build the annual ______.",
  },
  item_v2_v2_d_110_portfolio: {
    notice: "Each fund manager is responsible for reviewing their client ______ on a monthly basis.",
    conversation: "My investment ______ has been underperforming — I need to rebalance it.",
    memo: "The new product ______ includes both established items and three newly launched lines.",
    announcement: "The company's service ______ has expanded to include IT consulting from next quarter.",
    review: "Diversify your ______ across multiple asset classes to reduce exposure to market risk.",
  },
  item_v2_v2_d_110_shareholder: {
    notice: "All registered ______ are invited to attend the annual general meeting on the 15th.",
    conversation: "The board needs to approve the plan before presenting it to the ______.",
    memo: "A ______ report will be distributed at the start of the fourth quarter.",
    announcement: "The company will hold a ______ briefing to discuss the proposed merger.",
    review: "Each ______ is entitled to one vote per share held at the time of the record date.",
  },
  // ── V2-E-111 ──
  item_v2_v2_e_111_checkout: {
    notice: "Standard ______ time is 11:00 a.m. — late requests must be approved in advance.",
    conversation: "I'd like to extend my stay — can I arrange late ______ at the front desk?",
    memo: "Guests should settle all outstanding charges at the front desk before ______.",
    announcement: "Express ______ is available using the self-service kiosk in the main lobby.",
    review: "Present your room key at reception to complete the ______ process before departure.",
  },
  item_v2_v2_e_111_front_desk: {
    notice: "All visitor inquiries should be directed to the hotel ______ upon arrival.",
    conversation: "Can you call the ______ and ask about late checkout? My flight is at 9 p.m.",
    memo: "The ______ is staffed 24 hours a day and can assist with any guest requests.",
    announcement: "Complimentary airport shuttle bookings can be made through the ______ until 6 p.m.",
    review: "Report any issues with your room directly to the ______ for immediate assistance.",
  },
  item_v2_v2_e_111_guest_room: {
    notice: "Your ______ will be ready by 3:00 p.m. — early check-in is subject to availability.",
    conversation: "Could you upgrade my ______ to a suite? I'll be here for a five-night stay.",
    memo: "All ______ amenities are replenished daily as part of the standard housekeeping service.",
    announcement: "Due to renovations, ______ on floors 4 and 5 will not be available this weekend.",
    review: "If anything in your ______ requires attention, contact the front desk for prompt service.",
  },
  item_v2_v2_e_111_housekeeping: {
    notice: "Please place the 'Do Not Disturb' sign on the door if you do not require ______ service.",
    conversation: "Could you call ______ to bring extra towels to Room 412?",
    memo: "The ______ team will service rooms between 9 a.m. and 3 p.m. on a daily basis.",
    announcement: "Guests requiring evening ______ service should notify the front desk by 5 p.m.",
    review: "The ______ team maintains all common areas, corridors, and guest rooms to the highest standard.",
  },
  // ── V2-E-112 ──
  item_v2_v2_e_112_beverage: {
    notice: "Complimentary ______ will be served during the morning break starting at 10:30 a.m.",
    conversation: "Would you like a hot or cold ______ while you wait for your meeting to begin?",
    memo: "Ensure a selection of hot and cold ______ is available throughout the all-day conference.",
    announcement: "A ______ station with coffee, tea, and water has been set up in the main foyer.",
    review: "The ______ package for the event includes soft drinks, juice, and bottled water.",
  },
  item_v2_v2_e_112_catering: {
    notice: "The ______ for the annual banquet has been arranged with a local five-star provider.",
    conversation: "Who is handling the ______ for the client dinner on Thursday evening?",
    memo: "Submit the final headcount to the ______ company at least 48 hours before the event.",
    announcement: "On-site ______ services will be available throughout the two-day conference.",
    review: "The ______ order must be confirmed two weeks in advance to ensure sufficient preparation time.",
  },
  item_v2_v2_e_112_menu: {
    notice: "The updated lunch ______ for this week is posted on the cafeteria notice board.",
    conversation: "Have you seen the special event ______? It looks like a great selection of dishes.",
    memo: "Please review the conference ______ options and submit your meal preference by Wednesday.",
    announcement: "A new seasonal ______ has been introduced at all company restaurant locations.",
    review: "All dietary requirements must be indicated when submitting your meal choice from the ______.",
  },
  item_v2_v2_e_112_reservation_desk: {
    notice: "Please contact the ______ to book a table for any team dinner with more than six people.",
    conversation: "I tried calling the ______ but no one answered — could you try again?",
    memo: "Conference room bookings are handled through the ______ on Level 1.",
    announcement: "The hotel ______ is open from 7 a.m. to 10 p.m. for restaurant and function bookings.",
    review: "Confirm the booking directly with the ______ at least 24 hours before the scheduled time.",
  },
  // ── V2-E-113 ──
  item_v2_v2_e_113_aisle: {
    notice: "Please keep the store ______ clear at all times to ensure safe passage for shoppers.",
    conversation: "Excuse me, could you tell me which ______ the stationery section is on?",
    memo: "Stock rotation along each ______ should be completed before the store opens each morning.",
    announcement: "New product signage has been added to each ______ to help customers find items easily.",
    review: "The center ______ display has been redesigned to feature the latest seasonal promotion.",
  },
  item_v2_v2_e_113_cashier: {
    notice: "Please proceed to any available ______ station to complete your purchase.",
    conversation: "The ______ at the express lane said my loyalty points have been applied.",
    memo: "All ______ staff must complete their end-of-day till reconciliation before leaving.",
    announcement: "A self-service ______ has been installed near the exit for small purchases.",
    review: "If you notice an error in your change, please speak directly to the ______ on duty.",
  },
  item_v2_v2_e_113_exchange_policy: {
    notice: "Our ______ allows you to swap any item within 14 days with the original receipt.",
    conversation: "What is the store's ______ for items bought on sale — can they be returned?",
    memo: "Staff should explain the full ______ to any customer wishing to swap or return goods.",
    announcement: "The revised ______ now extends the exchange window to 30 days for all purchases.",
    review: "Refer to the ______ card included in the packaging before requesting a product swap.",
  },
  item_v2_v2_e_113_merchandise: {
    notice: "New ______ for the spring collection will arrive and be shelved by the weekend.",
    conversation: "We need to reorganize the ______ display before the weekend promotion begins.",
    memo: "All damaged ______ should be removed from the sales floor and documented immediately.",
    announcement: "The promotional ______ for the anniversary sale has been discounted by up to 40%.",
    review: "Count and verify all incoming ______ against the delivery note before shelving.",
  },
  // ── V2-E-114 ──
  item_v2_v2_e_114_complaint: {
    notice: "All customer ______ must be logged in the system within one business day of receipt.",
    conversation: "We received a ______ from a client about a late delivery — who should handle it?",
    memo: "Escalate any ______ that cannot be resolved at the first contact level within 24 hours.",
    announcement: "New procedures for handling ______ will be covered in the training session on Monday.",
    review: "Acknowledge every customer ______ within two hours and provide an expected resolution time.",
  },
  item_v2_v2_e_114_follow_up: {
    notice: "A ______ call will be made within 48 hours to confirm that the issue has been resolved.",
    conversation: "Please do a ______ with the client to make sure they are satisfied with the outcome.",
    memo: "Log all ______ actions taken after a customer complaint in the CRM under case notes.",
    announcement: "All open service tickets require a ______ before they can be marked as closed.",
    review: "Schedule a ______ meeting with the client one week after delivering the solution.",
  },
  item_v2_v2_e_114_representative: {
    notice: "A customer service ______ will contact you within 24 hours to resolve your inquiry.",
    conversation: "Can you transfer me to a ______ who handles billing issues?",
    memo: "Each ______ is responsible for managing a defined portfolio of client accounts.",
    announcement: "A company ______ will be on hand at the trade fair booth to answer product questions.",
    review: "The sales ______ should provide a written summary of the meeting outcome to the client.",
  },
  item_v2_v2_e_114_resolution: {
    notice: "We aim to provide a full ______ to all complaints within five business days.",
    conversation: "What is the proposed ______ for the client's delivery issue?",
    memo: "Document the agreed ______ in the CRM and share a copy with the customer.",
    announcement: "Customer satisfaction scores improve significantly when a clear ______ is offered promptly.",
    review: "Once a ______ is confirmed, send a summary to the client and close the support ticket.",
  },
  // ── V2-E-115 ──
  item_v2_v2_e_115_appointment_reminder: {
    notice: "An ______ will be sent to your email address 24 hours before your scheduled visit.",
    conversation: "Did you receive an ______ for your check-up next Thursday?",
    memo: "The system will automatically send an ______ by SMS to all patients 48 hours in advance.",
    announcement: "Please confirm receipt of your ______ by calling the front desk if you cannot attend.",
    review: "The ______ includes date, time, and location details to help you prepare for your visit.",
  },
  item_v2_v2_e_115_clinic: {
    notice: "The on-site medical ______ is open Monday to Friday from 9 a.m. to 5 p.m.",
    conversation: "Should I visit the company ______ or go to the hospital for this kind of checkup?",
    memo: "The occupational health ______ will offer flu vaccinations to all staff throughout November.",
    announcement: "The corporate wellness ______ is now accepting bookings for annual health screenings.",
    review: "The ______ provides basic medical services and can refer employees to specialists as needed.",
  },
  item_v2_v2_e_115_patient: {
    notice: "Each ______ must present a valid ID upon arrival at the medical facility.",
    conversation: "The doctor said the ______ in Room 3 is ready for discharge this afternoon.",
    memo: "All ______ records are strictly confidential and may only be accessed by authorized personnel.",
    announcement: "The pharmacy's waiting area is available for all ______ while prescriptions are prepared.",
    review: "A ______ who misses their appointment without notice may be charged a cancellation fee.",
  },
  item_v2_v2_e_115_prescription: {
    notice: "Present your ______ at the pharmacy counter along with your insurance card.",
    conversation: "The doctor gave me a ______ for antibiotics — where is the nearest pharmacy?",
    memo: "All ______ medications are available at the company pharmacy on the ground floor.",
    announcement: "Repeat ______ requests can now be submitted online through the patient portal.",
    review: "Always check the dosage instructions on your ______ carefully before taking any medication.",
  },
  // ── V2-E-116 ──
  item_v2_v2_e_116_boarding: {
    notice: "______ for this flight will begin 30 minutes before the scheduled departure time.",
    conversation: "When does ______ start? I don't want to miss the announcement.",
    memo: "Ensure all travelers have their ______ passes ready before approaching the gate.",
    announcement: "Priority ______ is available for passengers requiring special assistance.",
    review: "Late ______ may result in your seat being released to a standby passenger.",
  },
  item_v2_v2_e_116_flight_delay: {
    notice: "Passengers are advised of a ______ due to adverse weather — updated times to follow.",
    conversation: "There's a ______ of over two hours — the airline will provide a meal voucher.",
    memo: "In the event of a ______, contact the travel desk immediately to discuss alternative options.",
    announcement: "We apologize for the ______ — our team is working to minimize the inconvenience.",
    review: "Passengers affected by a ______ of more than three hours may be eligible for compensation.",
  },
  item_v2_v2_e_116_gate: {
    notice: "Proceed to ______ 14 immediately — the flight is now boarding.",
    conversation: "I can't find ______ C7 — the airport layout is confusing with so many terminals.",
    memo: "Confirm your departure ______ on the arrivals/departures board before heading to security.",
    announcement: "The departure ______ for this flight has been changed from 22 to 35 — please proceed.",
    review: "Be at your departure ______ at least 20 minutes before boarding is scheduled to begin.",
  },
  item_v2_v2_e_116_luggage: {
    notice: "Each passenger is allowed one carry-on bag plus one piece of checked ______.",
    conversation: "My ______ hasn't arrived on the belt yet — should I report it to the airline desk?",
    memo: "Keep your ______ tag number to help the airline trace any missing or delayed bags.",
    announcement: "Passengers with oversized ______ should proceed to the special handling counter.",
    review: "Label all pieces of ______ clearly with your name, contact number, and destination.",
  },
  // ── V2-E-117 ──
  item_v2_v2_e_117_access_restriction: {
    notice: "An ______ is currently in place on the server room — a manager's badge is required.",
    conversation: "Why is there an ______ on the fourth floor corridor?",
    memo: "The ______ on the back entrance will be lifted once the security upgrade is complete.",
    announcement: "An ______ applies to the underground parking level during the maintenance period.",
    review: "Staff must comply with any ______ until the area has been cleared for normal use.",
  },
  item_v2_v2_e_117_closure: {
    notice: "The north entrance will undergo ______ for maintenance from Monday to Wednesday.",
    conversation: "I heard there's a road ______ near the office — should we find an alternate route?",
    memo: "A temporary ______ of the print room has been arranged while repairs are carried out.",
    announcement: "Due to the storm warning, the head office will be operating under partial ______ tomorrow.",
    review: "All clients have been notified in advance of the scheduled branch ______.",
  },
  item_v2_v2_e_117_relocation: {
    notice: "The HR department will complete its ______ to the third floor during the weekend.",
    conversation: "Have you received confirmation of the date for the office ______?",
    memo: "Staff whose desks are affected by the ______ will be notified of their new seating assignments.",
    announcement: "The company's head office ______ to the new building will take place over this weekend.",
    review: "Prepare your workstation for the ______ by boxing personal items by Friday afternoon.",
  },
  item_v2_v2_e_117_renovation: {
    notice: "The cafeteria will be closed during ______ and is expected to reopen in three weeks.",
    conversation: "When is the office ______ scheduled to start? The dust and noise might be disruptive.",
    memo: "The ______ to the reception area will enhance the visitor experience upon arrival.",
    announcement: "The building ______ project is on schedule for completion by the end of the quarter.",
    review: "Staff near the ______ zone should use the alternative entrance on the east side.",
  },
  // ── V2-E-118 ──
  item_v2_v2_e_118_backup: {
    notice: "Please ensure all important documents have an up-to-date ______ stored on the shared drive.",
    conversation: "The computer crashed without warning — did you have a recent ______ of the project files?",
    memo: "The IT team performs a full system ______ every Friday night between 11 p.m. and 2 a.m.",
    announcement: "A power ______ system has been installed to protect critical servers from unplanned shutdowns.",
    review: "Set your files to ______ automatically to the cloud to prevent data loss in case of a failure.",
  },
  item_v2_v2_e_118_outage: {
    notice: "A system ______ is expected this Saturday from 2 a.m. to 6 a.m. for maintenance.",
    conversation: "The website ______ last night affected hundreds of customers — when was it restored?",
    memo: "In the event of a network ______, staff should work offline and save files locally.",
    announcement: "The server ______ has been resolved — all systems are fully operational again.",
    review: "Report any unplanned service ______ to the IT helpdesk immediately for investigation.",
  },
  item_v2_v2_e_118_password: {
    notice: "All staff are required to reset their ______ every 90 days to maintain account security.",
    conversation: "I forgot my ______ — can the IT team help me reset it before my morning meeting?",
    memo: "Do not share your system ______ with colleagues under any circumstances.",
    announcement: "A new ______ policy requiring a minimum of 12 characters will take effect next Monday.",
    review: "Choose a strong ______ that combines uppercase letters, numbers, and special characters.",
  },
  item_v2_v2_e_118_update: {
    notice: "A security ______ for all office computers will be installed automatically tonight.",
    conversation: "Has the software ______ been applied to your laptop? IT released it this morning.",
    memo: "Run the latest system ______ before the scheduled audit to ensure software compliance.",
    announcement: "An important firmware ______ is required for all barcode scanners in the warehouse.",
    review: "Enable automatic ______ on all devices to protect against security vulnerabilities.",
  },
  // ── V2-E-119 ──
  item_v2_v2_e_119_brochure: {
    notice: "Updated product ______ are available at the reception desk for all visitors.",
    conversation: "Can you send me the digital version of the latest company ______?",
    memo: "Please review the draft ______ and provide edits to the marketing team by Thursday.",
    announcement: "New promotional ______ featuring the full product line will be distributed next week.",
    review: "Include the product ______ when mailing information packages to prospective clients.",
  },
  item_v2_v2_e_119_campaign: {
    notice: "The spring sales ______ will launch on March 1st with special offers across all product lines.",
    conversation: "The marketing ______ for the new product was a great success — sales exceeded targets.",
    memo: "All advertising materials for the ______ must be reviewed by the legal team before launch.",
    announcement: "The employee engagement ______ is designed to improve morale and team participation.",
    review: "Analyze the results of the previous ______ before planning the next marketing initiative.",
  },
  item_v2_v2_e_119_feedback: {
    notice: "Please complete the session evaluation form to provide ______ on today's training.",
    conversation: "I'd appreciate your ______ on the presentation — what did you think of the content?",
    memo: "Collect ______ from all attendees after the conference and summarize findings within one week.",
    announcement: "A short ______ survey will be sent to all participants at the end of the program.",
    review: "Act on customer ______ promptly to demonstrate your commitment to continuous improvement.",
  },
  item_v2_v2_e_119_sample: {
    notice: "Free product ______ will be available at the trade fair booth throughout both days.",
    conversation: "Could you send a ______ of the new packaging design to the client for approval?",
    memo: "Please send a ______ of the product to the quality lab for testing before the launch.",
    announcement: "Complimentary ______ of the new line will be distributed to stores before the official release.",
    review: "Request a ______ from the supplier before committing to a bulk order of any new material.",
  },
  // ── V2-E-120 ──
  item_v2_v2_e_120_electricity: {
    notice: "The ______ supply to the east wing will be interrupted for maintenance on Thursday.",
    conversation: "The ______ in the production area went out suddenly — what happened?",
    memo: "Monitor monthly ______ consumption data and report any unusual spikes to facilities.",
    announcement: "A temporary generator has been installed to maintain ______ supply during the planned shutdown.",
    review: "Turn off all unnecessary lights and equipment to reduce ______ consumption after hours.",
  },
  item_v2_v2_e_120_heating: {
    notice: "The building ______ system will be switched to winter mode from the first of October.",
    conversation: "The ______ in the conference room isn't working — it's very cold in there.",
    memo: "Facilities management has completed the annual servicing of the ______ units on all floors.",
    announcement: "The ______ in the lobby will be adjusted to maintain a comfortable temperature for visitors.",
    review: "Report any issues with the ______ system to the facilities team, especially during cold months.",
  },
  item_v2_v2_e_120_plumbing: {
    notice: "The ______ in the ground-floor restrooms will be repaired during the weekend.",
    conversation: "There's a water leak in the kitchen — do we have a ______ contractor on call?",
    memo: "The ______ contractor will conduct a routine inspection of all facilities on Tuesday.",
    announcement: "A ______ issue on Floor 2 has been resolved — facilities are back to normal operation.",
    review: "Any ______ problem such as a blocked drain or leaking pipe must be reported to facilities.",
  },
  item_v2_v2_e_120_ventilation: {
    notice: "The air ______ system will be cleaned and serviced next Monday — windows may be opened.",
    conversation: "The ______ in the server room isn't working properly — can IT check it?",
    memo: "Proper ______ in the office is important for staff comfort and air quality.",
    announcement: "Upgraded ______ filters have been installed to improve indoor air quality throughout the building.",
    review: "Report any ______ issues or unusual odors to the facilities team for immediate inspection.",
  },
};

// ── Prefix templates for non-review types ────────────────────────────────────
const DOC_PREFIX = {
  notice: "Notice: ",
  conversation: "Conversation: ",
  memo: "Memo: ",
  announcement: "Announcement: ",
  review: "",
};

// ── Main rewrite logic ────────────────────────────────────────────────────────

function rewriteQuestion(q) {
  const text = String(q.question_text || "");
  if (!hasDefinitionInStem(text)) return q; // already clean

  const docType = getDocType(text, q.type);
  if (!docType) return q; // Email or unknown

  const sentences = BANK[q.target_item_id];
  if (!sentences || !sentences[docType]) {
    return q; // no bank entry — leave unchanged
  }

  const trailingId = extractTrailingId(text);
  const prefix = DOC_PREFIX[docType] || "";
  const newText = prefix + sentences[docType] + trailingId;

  return { ...q, question_text: newText };
}

function processFile(fileName) {
  const filePath = path.join(vocabDir, fileName);
  const questions = JSON.parse(fs.readFileSync(filePath, "utf8"));

  let changed = 0;
  let skippedNoBank = 0;

  const updated = questions.map((q) => {
    const text = String(q.question_text || "");
    if (!hasDefinitionInStem(text)) return q;

    const docType = getDocType(text, q.type);
    if (!docType) return q;

    if (!BANK[q.target_item_id] || !BANK[q.target_item_id][docType]) {
      skippedNoBank++;
      return q;
    }

    const rewritten = rewriteQuestion(q);
    if (rewritten.question_text !== q.question_text) changed++;
    return rewritten;
  });

  fs.writeFileSync(filePath, JSON.stringify(updated, null, 2), "utf8");
  console.log(`  ${fileName}: ${changed} rewritten, ${skippedNoBank} skipped (no bank entry)`);
  return changed;
}

// ── Run ───────────────────────────────────────────────────────────────────────

console.log("Rewriting V2 definition-in-stem questions...\n");
let total = 0;
V2_FILES.forEach((f) => { total += processFile(f); });
console.log(`\nTotal rewritten: ${total}`);
console.log("Done. Remember to bump SEED_VERSION in vocab-db.js after verifying.");
