/**
 * DELE waitlist — Google Apps Script web app (uses Pau's existing Google account; no new account).
 * Writes to the Google Sheet "DELE waitlist":
 *   https://docs.google.com/spreadsheets/d/1KAlPK1eZDyqwXZAuflKR-FCsKd6NURudChEHOBrw7h0/edit
 * Tabs (headers already created):
 *   waitlist -> one row per sign-up (event "waitlist_signup")
 *   events   -> one row per "test_complete" / "ab_choice"
 * Deploy steps: see backend/DEPLOY_APPS_SCRIPT.md
 */
const SHEET_ID = "1KAlPK1eZDyqwXZAuflKR-FCsKd6NURudChEHOBrw7h0";
const WAITLIST_COLS = ["received_at","client_ts","email","language","country","dele_date","preorder_intent","price_eur","test_score","ab_choice","ui_lang","page","sid","source"];
const EVENT_COLS    = ["received_at","client_ts","event","score","total","pass","choice","order","ui_lang","page","sid"];
const ALLOWED_EVENTS = ["waitlist_signup","test_complete","ab_choice"];

function clean_(v) {
  if (v === undefined || v === null) return "";
  let s = String(v).slice(0, 200);
  if (/^[=+\-@]/.test(s)) s = "'" + s;   // block spreadsheet formula injection
  return s;
}

function doPost(e) {
  let d;
  try { d = JSON.parse((e && e.postData && e.postData.contents) || "{}"); }
  catch (err) { return ContentService.createTextOutput("bad json"); }
  if (ALLOWED_EVENTS.indexOf(d.event) < 0) return ContentService.createTextOutput("ignored");
  if (d.event === "waitlist_signup" && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(d.email || ""))) {
    return ContentService.createTextOutput("bad email");
  }
  d.received_at = new Date().toISOString();
  d.client_ts = d.ts;
  const isSignup = d.event === "waitlist_signup";
  const cols = isSignup ? WAITLIST_COLS : EVENT_COLS;
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const sh = ss.getSheetByName(isSignup ? "waitlist" : "events");
    sh.appendRow(cols.map(function (c) { return clean_(d[c]); }));
  } finally {
    lock.releaseLock();
  }
  return ContentService.createTextOutput("ok");
}

// Optional: open the /exec URL in a browser to check the deployment is live.
function doGet() {
  return ContentService.createTextOutput("DELE waitlist endpoint OK");
}
