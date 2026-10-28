/* ===================== CONFIG — PLACEHOLDERS (Pau must approve accounts) =====================
 * WAITLIST_ENDPOINT: URL that receives a JSON POST per event (waitlist signup, A/B choice, test result).
 *   null  => nothing leaves the browser; data is only kept in localStorage (key "ccse_prep_log").
 *   Options (each needs an account/approval):
 *     - Google Apps Script web app writing to a Google Sheet (uses Pau's existing Google account; see /backend/apps_script.gs)
 *     - Formspree / Tally / Basin form endpoint (new account)
 * GOATCOUNTER_CODE: e.g. "ccseprep" for https://ccseprep.goatcounter.com (new GoatCounter account). null => off.
 * ============================================================================================ */
window.CCSE_CONFIG = {
  WAITLIST_ENDPOINT: "https://script.google.com/macros/s/AKfycbyUWtXzEAvb_j3hAjBdPMWtj4r6t-TgXuP098r_v3qW_FDqhu8uhshazp0vnXtJjpLm/exec",
  GOATCOUNTER_CODE: null,    // TODO(Pau): e.g. "ccseprep"
  FOUNDING_PRICE_EUR: 24
};
