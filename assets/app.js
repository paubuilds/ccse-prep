(function () {
  "use strict";
  var I = window.I18N, Q = window.CCSE_QUESTIONS, E = window.CCSE_EXPL, C = window.CCSE_CONFIG || {};
  var LANGS = ["es", "en", "fr", "ar", "ur"];
  var LOG_KEY = "ccse_prep_log", LANG_KEY = "ccse_prep_lang";
  var COUNTRIES = ["MA","PK","IN","SN","GM","ML","NG","GH","DZ","BD","CN","PH","UA","RO","GN","CM","MR","EG","SY"];
  var TASK_NAMES = {1:"Gobierno, legislación y participación ciudadana",2:"Derechos y deberes fundamentales",3:"Organización territorial de España. Geografía física y política",4:"Cultura e historia de España",5:"Sociedad española"};

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]; }); }
  function fmt(s, o) { return s.replace(/\{(\w+)\}/g, function (_, k) { return o[k]; }); }

  var sid = (function () { try { var s = sessionStorage.getItem("ccse_sid"); if (!s) { s = Math.random().toString(36).slice(2, 10); sessionStorage.setItem("ccse_sid", s); } return s; } catch (e) { return "nosession"; } })();

  /* ---------------- language ---------------- */
  function pickLang() {
    var p = new URLSearchParams(location.search).get("lang");
    if (LANGS.indexOf(p) > -1) return p;
    try { var s = localStorage.getItem(LANG_KEY); if (LANGS.indexOf(s) > -1) return s; } catch (e) {}
    var nav = (navigator.language || "").slice(0, 2);
    if (["ar", "ur", "fr"].indexOf(nav) > -1) return nav;
    return document.documentElement.getAttribute("data-default-lang") || "es";
  }
  var lang = pickLang();
  function t(k) { return (I[lang] && I[lang][k]) || I.es[k] || k; }

  function setLang(l, user) {
    lang = l;
    if (user) { try { localStorage.setItem(LANG_KEY, l); } catch (e) {} track("lang_" + l, {}); }
    var h = document.documentElement;
    h.lang = l; h.dir = I[l].dir;
    $$("[data-i18n]").forEach(function (el) { el.textContent = t(el.getAttribute("data-i18n")); });
    $$(".lang-switch button").forEach(function (b) { b.setAttribute("aria-pressed", b.dataset.lang === l ? "true" : "false"); });
    fillSelects();
    render();
  }

  /* ---------------- tracking / storage ---------------- */
  function store(rec) {
    try { var a = JSON.parse(localStorage.getItem(LOG_KEY) || "[]"); a.push(rec); localStorage.setItem(LOG_KEY, JSON.stringify(a)); } catch (e) {}
  }
  function send(rec) {
    if (!C.WAITLIST_ENDPOINT) return Promise.resolve("no-endpoint");
    // text/plain avoids a CORS preflight (works with Google Apps Script web apps)
    return fetch(C.WAITLIST_ENDPOINT, { method: "POST", mode: "no-cors", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify(rec) })
      .then(function () { return "sent"; }).catch(function () { return "failed"; });
  }
  function track(event, data) {
    var rec = Object.assign({ event: event, ts: new Date().toISOString(), sid: sid, ui_lang: lang, page: location.pathname }, data || {});
    store(rec);
    if (["test_complete", "ab_choice", "waitlist_signup"].indexOf(event) > -1) send(rec);
    try { if (window.goatcounter && window.goatcounter.count) window.goatcounter.count({ path: "event/" + event + (data && data.choice ? "/" + data.choice : ""), title: event, event: true }); } catch (e) {}
    return rec;
  }
  window.ccsePrepLog = function () { try { return JSON.parse(localStorage.getItem(LOG_KEY) || "[]"); } catch (e) { return []; } };

  if (C.GOATCOUNTER_CODE) {
    var g = document.createElement("script");
    g.async = true; g.src = "https://gc.zgo.at/count.js";
    g.setAttribute("data-goatcounter", "https://" + C.GOATCOUNTER_CODE + ".goatcounter.com/count");
    document.head.appendChild(g);
  }

  /* ---------------- quiz ---------------- */
  var st = { phase: "intro", i: 0, ans: {}, abDone: false, abOrder: Math.random() < 0.5 ? ["native", "spanish"] : ["spanish", "native"] };
  var box;

  function optLabel(q, k) { return q.o[k]; }

  function render() {
    if (!box) return;
    if (st.phase === "intro") {
      box.innerHTML = '<p class="muted">' + esc(t("test_intro")) + '</p><button class="btn primary" id="startBtn">' + esc(t("start")) + "</button>";
      $("#startBtn").onclick = function () { st.phase = "q"; st.i = 0; st.ans = {}; track("test_start", {}); render(); focusQ(); };
      return;
    }
    if (st.phase === "q") return renderQ();
    renderResult();
  }

  function renderQ() {
    var q = Q[st.i], chosen = st.ans[q.id], done = chosen !== undefined, total = Q.length;
    var h = '<div class="progress" role="progressbar" aria-valuemin="0" aria-valuemax="' + total + '" aria-valuenow="' + (st.i + 1) + '"><span style="width:' + ((st.i + (done ? 1 : 0)) / total * 100) + '%"></span></div>';
    h += '<p class="qmeta">' + esc(fmt(t("q_of"), { n: st.i + 1, t: total })) + ' · ' + esc(t("task")) + " " + q.t + '<span class="taskname" lang="es" dir="ltr"> — ' + esc(TASK_NAMES[q.t]) + '</span></p>';
    h += '<h3 class="qtext" lang="es" dir="ltr" tabindex="-1" id="qtext">' + esc(q.q) + "</h3>";
    h += '<div class="opts" role="group" aria-labelledby="qtext" lang="es" dir="ltr">';
    Object.keys(q.o).forEach(function (k) {
      var cls = "opt";
      if (done) { if (k === q.a) cls += " ok"; else if (k === chosen) cls += " bad"; }
      h += '<button class="' + cls + '" data-k="' + k + '"' + (done ? " disabled" : "") + '><span class="letter">' + k + ")</span> " + esc(optLabel(q, k)) + "</button>";
    });
    h += "</div>";
    if (done) {
      var ok = chosen === q.a, ex = E[q.id];
      h += '<div class="feedback ' + (ok ? "ok" : "bad") + '" role="status">';
      h += "<strong>" + esc(ok ? t("right") : t("wrong")) + "</strong>";
      if (!ok) h += ' <span>' + esc(t("correct_is")) + ' <b lang="es" dir="ltr">' + q.a + ") " + esc(q.o[q.a]) + "</b></span>";
      h += '<p class="expl"><b>' + esc(t("expl_label")) + '</b> <small>' + esc(t("expl_note")) + "</small><br>" + esc(ex.e[lang] || ex.e.es) + "</p>";
      if (lang !== "es" && ex.v && ex.v.length) {
        h += '<div class="vocab"><b>' + esc(t("vocab_label")) + "</b><ul>";
        ex.v.forEach(function (v) { h += '<li><span lang="es" dir="ltr">' + esc(v[0]) + "</span> → <span>" + esc(v[1][lang]) + "</span></li>"; });
        h += "</ul></div>";
      }
      h += "</div>";
      var last = st.i === total - 1;
      h += '<button class="btn primary" id="nextBtn">' + esc(last ? t("see_result") : t("next")) + "</button>";
    }
    box.innerHTML = h;
    $$(".opt", box).forEach(function (b) {
      b.onclick = function () { st.ans[q.id] = b.dataset.k; track("answer", { qid: q.id, ok: b.dataset.k === q.a }); renderQ(); var f = $(".feedback", box); if (f) f.scrollIntoView({ block: "nearest", behavior: "smooth" }); };
    });
    var nb = $("#nextBtn");
    if (nb) nb.onclick = function () {
      if (st.i < total - 1) { st.i++; renderQ(); focusQ(); }
      else { st.phase = "result"; var s = score(); track("test_complete", { score: s, total: total, pass: s >= 15 }); renderResult(); box.scrollIntoView({ block: "start" }); }
    };
  }
  function focusQ() { var el = $("#qtext"); if (el) { el.focus({ preventScroll: true }); box.scrollIntoView({ block: "start", behavior: "smooth" }); } }
  function score() { return Q.filter(function (q) { return st.ans[q.id] === q.a; }).length; }

  function renderResult() {
    var s = score(), pass = s >= 15;
    var h = '<div class="result ' + (pass ? "pass" : "fail") + '"><p class="big" id="scoreVal">' + s + " / " + Q.length + "</p><p>" + esc(fmt(t(pass ? "res_pass" : "res_fail"), { s: s })) + "</p></div>";
    var wrong = Q.filter(function (q) { return st.ans[q.id] !== q.a; });
    if (wrong.length) {
      h += "<details class=\"review\"><summary>" + esc(t("review")) + " (" + wrong.length + ")</summary><ol>";
      wrong.forEach(function (q) { h += '<li lang="es" dir="ltr"><span>' + esc(q.q) + "</span><br><b>" + q.a + ") " + esc(q.o[q.a]) + "</b></li>"; });
      h += "</ol></details>";
    }
    h += '<div class="ab" id="ab"><p class="abq">' + esc(t("ab_q")) + "</p>";
    if (st.abDone) h += '<p class="thanks" role="status">' + esc(t("ab_thanks")) + "</p>";
    else st.abOrder.forEach(function (c) { h += '<button class="btn ab-btn" data-choice="' + c + '">' + esc(t(c === "native" ? "ab_a" : "ab_b")) + "</button>"; });
    h += "</div>";
    h += '<div class="dele-cta" id="deleCta"><h3>' + esc(t("res_cta_t")) + "</h3><p>" + esc(t("res_cta_d")) + '</p><a class="btn primary" id="deleCtaBtn" href="#waitlist">' + esc(t("cta_wait")) + "</a></div>";
    h += '<div class="row"><button class="btn" id="retryBtn">' + esc(t("retry")) + "</button></div>";
    box.innerHTML = h;
    $$(".ab-btn", box).forEach(function (b) {
      b.onclick = function () {
        st.abDone = true; st.abChoice = b.dataset.choice;
        track("ab_choice", { choice: b.dataset.choice, order: st.abOrder.join(">"), score: s });
        renderResult();
      };
    });
    $("#deleCtaBtn").onclick = function () { st.fromCta = true; track("result_cta_click", { score: s }); setTimeout(function () { var e = $("#f-email"); if (e) e.focus({ preventScroll: true }); }, 400); };
    $("#retryBtn").onclick = function () { st.phase = "q"; st.i = 0; st.ans = {}; st.abDone = false; track("test_start", { retry: true }); render(); focusQ(); };
  }

  /* ---------------- waitlist form ---------------- */
  function fillSelects() {
    var cs = $("#f-country"), ds = $("#f-date"), ls = $("#f-lang");
    if (!cs) return;
    var keepC = cs.value, keepD = ds.value, keepL = ls.value;
    var dn = null; try { dn = new Intl.DisplayNames([lang, "en"], { type: "region" }); } catch (e) {}
    var opts = COUNTRIES.map(function (c) { return [c, dn ? dn.of(c) : c]; });
    try { opts.sort(function (a, b) { return a[1].localeCompare(b[1], lang); }); } catch (e) {}
    cs.innerHTML = '<option value="">' + esc(t("choose")) + "</option>" + opts.map(function (o) { return '<option value="' + o[0] + '">' + esc(o[1]) + "</option>"; }).join("") + '<option value="OTHER">' + esc(t("f_other")) + "</option>";
    cs.value = keepC;
    var h = '<option value="">' + esc(t("choose")) + '</option><option value="none">' + esc(t("f_date_none")) + "</option>";
    var d = new Date(); d.setDate(1);
    var mf; try { mf = new Intl.DateTimeFormat(lang === "ar" ? "ar-u-nu-latn" : lang, { month: "long", year: "numeric" }); } catch (e) { mf = { format: function (x) { return x.toISOString().slice(0, 7); } }; }
    for (var i = 0; i < 12; i++) { var m = new Date(d.getFullYear(), d.getMonth() + i, 1); var v = m.getFullYear() + "-" + ("0" + (m.getMonth() + 1)).slice(-2); h += '<option value="' + v + '">' + esc(mf.format(m)) + "</option>"; }
    h += '<option value="later">' + esc(t("f_date_later")) + "</option>";
    ds.innerHTML = h; ds.value = keepD;
    ls.innerHTML = LANGS.map(function (l) { return '<option value="' + l + '">' + esc(I[l].name) + "</option>"; }).join("") + '<option value="ary">' + esc(t("darija")) + '</option><option value="other">' + esc(t("f_other")) + "</option>";
    ls.value = keepL || lang;
  }

  function initForm() {
    var f = $("#waitForm"); if (!f) return;
    f.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var msg = $("#formMsg"), email = $("#f-email").value.trim();
      msg.className = "formmsg";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) { msg.textContent = t("f_err_email"); msg.classList.add("err"); $("#f-email").focus(); return; }
      if (!$("#f-consent").checked) { msg.textContent = t("f_err_consent"); msg.classList.add("err"); return; }
      if ($("#f-hp").value) return; // honeypot
      var rec = track("waitlist_signup", {
        email: email, language: $("#f-lang").value, country: $("#f-country").value, dele_date: $("#f-date").value,
        preorder_intent: $("#f-pre").checked, price_eur: C.FOUNDING_PRICE_EUR || 24, source: st.fromCta ? "result_cta" : "page",
        test_score: st.phase === "result" ? score() : null, ab_choice: st.abChoice || null
      });
      f.reset(); fillSelects();
      msg.textContent = t("f_ok"); msg.classList.add("ok");
      return rec;
    });
  }

  /* ---------------- boot ---------------- */
  document.addEventListener("DOMContentLoaded", function () {
    box = $("#quiz");
    $$(".lang-switch button").forEach(function (b) { b.onclick = function () { setLang(b.dataset.lang, true); }; });
    initForm();
    setLang(lang, false);
    track("pageview", { ref: document.referrer || null });
  });
})();
