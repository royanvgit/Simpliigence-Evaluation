/* =====================================================================
   Online Technical Evaluation – application logic
   ===================================================================== */
(function () {
  "use strict";

  const $ = (sel) => document.querySelector(sel);
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const state = {
    paperId: null, paper: null, lang: null,
    candidate: { name: "", email: "" },
    mcqs: [],          // [{bankIndex, q, options[{text, origIndex}], answerPos}]
    coding: [],        // [{key, ...CODING_POOL[key]}]
    answers: {},       // mcq position -> chosen option position
    code: {},          // coding position -> source
    startedAt: null, timerId: null, result: null, pdfBlob: null, pdfBase64: null
  };

  /* ------------------------------------------------ deterministic shuffle */
  function mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function shuffled(arr, rnd) { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1));[a[i], a[j]] = [a[j], a[i]]; } return a; }

  function buildPaper(paperId) {
    const paper = PAPERS[paperId]; if (!paper) return false;
    state.paperId = paperId; state.paper = paper; state.lang = paper.lang;
    const bank = MCQ_BANK[paper.lang];
    const rnd = mulberry32(paper.seed || 1);
    let order = bank.map((_, i) => i);
    if (paper.shuffle) order = shuffled(order, rnd);
    state.mcqs = order.slice(0, CONFIG.mcqCount).map(bi => {
      const item = bank[bi];
      let opts = item.options.map((text, origIndex) => ({ text, origIndex }));
      if (paper.shuffle) opts = shuffled(opts, rnd);
      return { bankIndex: bi, q: item.q, why: item.why, options: opts, answerPos: opts.findIndex(o => o.origIndex === item.answer) };
    });
    state.coding = paper.coding.slice(0, CONFIG.codingCount).map(key => Object.assign({ key }, CODING_POOL[key]));
    return true;
  }

  /* ------------------------------------------------ screens */
  function show(id) { document.querySelectorAll(".screen").forEach(s => s.hidden = true); $(id).hidden = false; window.scrollTo(0, 0); }

  function renderLanding() {
    const params = new URLSearchParams(location.search);
    const paperId = (params.get("paper") || "").toLowerCase();
    if (params.get("organizer") === "1") { renderOrganizerHome(); return; }
    if (paperId && PAPERS[paperId]) {
      buildPaper(paperId);
      $("#start-paper-label").textContent = state.paper.label;
      $("#start-meta").textContent = `${CONFIG.mcqCount} multiple-choice questions (${CONFIG.mcqCount * CONFIG.marks.mcq} marks) + ${CONFIG.codingCount} programming questions in ${LANG_META[state.lang].name} (${CONFIG.codingCount * CONFIG.marks.coding} marks). Total ${totalMarks()} marks · Time limit ${CONFIG.timeLimitMinutes} minutes · Pass mark ${CONFIG.passPercentage}%`;
      show("#screen-start");
    } else {
      const list = $("#paper-list"); list.innerHTML = "";
      Object.entries(PAPERS).forEach(([id, p]) => {
        const url = location.origin + location.pathname + "?paper=" + id;
        const row = document.createElement("div"); row.className = "paper-row";
        row.innerHTML = `<div><strong>${esc(p.label)}</strong><div class="muted small">${esc(url)}</div></div>
          <div class="row-actions"><a class="btn btn-secondary" href="?paper=${id}">Open</a><button class="btn btn-ghost" data-copy="${esc(url)}">Copy link</button></div>`;
        list.appendChild(row);
      });
      list.addEventListener("click", e => { const b = e.target.closest("[data-copy]"); if (b) { navigator.clipboard?.writeText(b.dataset.copy); b.textContent = "Copied!"; setTimeout(() => b.textContent = "Copy link", 1500); } });
      show("#screen-landing");
    }
  }

  const totalMarks = () => CONFIG.mcqCount * CONFIG.marks.mcq + CONFIG.codingCount * CONFIG.marks.coding;
  const fmtDur = (ms) => { const t = Math.max(0, Math.round(ms / 1000)); const m = Math.floor(t / 60), sec = t % 60; return `${m} min ${sec.toString().padStart(2, "0")} sec`; };

  /* ------------------------------------------------ start */
  $("#start-form").addEventListener("submit", e => {
    e.preventDefault();
    state.candidate.name = $("#cand-name").value.trim();
    state.candidate.email = $("#cand-email").value.trim();
    state.candidate.batch = ($("#cand-batch") ? $("#cand-batch").value.trim() : "");
    if (!state.candidate.name) return;
    state.startedAt = Date.now();
    renderMcq(); startTimer(); startProctoring();
    window.onbeforeunload = () => "Your test is in progress. Leaving will lose your answers.";
  });

  /* ------------------------------------------------ proctoring */
  const proctor = { active: false, violations: [], warned: false, handlers: [] };
  function startProctoring() {
    const P = CONFIG.proctoring || {}; if (!P.enabled) return;
    proctor.active = true;
    const on = (target, ev, fn, opts) => { target.addEventListener(ev, fn, opts); proctor.handlers.push([target, ev, fn, opts]); };
    if (P.fullscreen && document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(() => { });
      on(document, "fullscreenchange", () => { if (proctor.active && !document.fullscreenElement) violation("Left fullscreen mode"); });
    }
    on(document, "visibilitychange", () => { if (document.hidden) violation("Switched to another tab or minimised the window"); });
    on(window, "blur", () => { setTimeout(() => { if (proctor.active && !document.hasFocus() && !document.hidden) violation("Switched to another window or application"); }, 150); });
    if (P.blockCopyPaste) {
      ["copy", "cut", "paste"].forEach(ev => on(document, ev, e => { if (e.target.closest && e.target.closest("#screen-mcq, #screen-code")) { e.preventDefault(); flash(`${ev[0].toUpperCase() + ev.slice(1)} is disabled during the test.`); } }));
      on(document, "contextmenu", e => { if (e.target.closest && e.target.closest("#screen-mcq, #screen-code")) e.preventDefault(); });
    }
  }
  function stopProctoring() {
    proctor.active = false;
    proctor.handlers.forEach(([t, ev, fn, o]) => t.removeEventListener(ev, fn, o)); proctor.handlers = [];
    if (document.fullscreenElement && document.exitFullscreen) document.exitFullscreen().catch(() => { });
  }
  function ask(msg) { proctor.mutedUntil = Date.now() + 1500; const r = confirm(msg); proctor.mutedUntil = Date.now() + 1500; return r; }
  function violation(reason) {
    if (!proctor.active || proctor.warned || Date.now() < (proctor.mutedUntil || 0)) return;
    const P = CONFIG.proctoring;
    proctor.violations.push({ at: new Date().toISOString(), reason });
    const n = proctor.violations.length;
    if (n >= P.maxViolations) { proctor.active = false; collectCode(); alert(`You left the test ${n} times. The test is now being submitted automatically.`); submitTest(false, "auto-submitted after " + n + " focus violations"); return; }
    proctor.warned = true;
    showOverlay(`<h2>Warning ${n} of ${P.maxViolations - 1}</h2><p>${esc(reason)}.</p><p>Leaving the test page is not allowed. After <strong>${P.maxViolations}</strong> violations the test will be submitted automatically.</p><button class="btn btn-primary" id="overlay-ok">Return to test</button>`);
    $("#overlay-ok").onclick = () => { hideOverlay(); proctor.warned = false; if (P.fullscreen && !document.fullscreenElement && document.documentElement.requestFullscreen) document.documentElement.requestFullscreen().catch(() => { }); };
  }
  function showOverlay(html) { let o = $("#proctor-overlay"); if (!o) { o = document.createElement("div"); o.id = "proctor-overlay"; document.body.appendChild(o); } o.innerHTML = `<div class="card narrow center">${html}</div>`; o.hidden = false; }
  function hideOverlay() { const o = $("#proctor-overlay"); if (o) o.hidden = true; }
  function flash(msg) { let f = $("#flash"); if (!f) { f = document.createElement("div"); f.id = "flash"; document.body.appendChild(f); } f.textContent = msg; f.hidden = false; clearTimeout(f._t); f._t = setTimeout(() => f.hidden = true, 2000); }

  /* ------------------------------------------------ timer */
  function startTimer() {
    const end = state.startedAt + CONFIG.timeLimitMinutes * 60000;
    const tick = () => {
      const left = Math.max(0, end - Date.now());
      const m = Math.floor(left / 60000), s = Math.floor(left % 60000 / 1000);
      document.querySelectorAll(".timer").forEach(el => { el.textContent = `${m}:${s.toString().padStart(2, "0")}`; el.classList.toggle("warn", left < 5 * 60000); });
      if (left <= 0) { clearInterval(state.timerId); collectCode(); submitTest(true); }
    };
    tick(); state.timerId = setInterval(tick, 1000);
  }

  /* ------------------------------------------------ MCQ section */
  function renderMcq() {
    $("#mcq-title").textContent = `${state.paper.label} · Part 1: Multiple Choice`;
    const wrap = $("#mcq-questions"); wrap.innerHTML = "";
    state.mcqs.forEach((m, i) => {
      const card = document.createElement("div"); card.className = "card q-card";
      card.innerHTML = `<div class="q-head"><span class="q-num">Q${i + 1}</span><span class="q-marks">${CONFIG.marks.mcq} marks</span></div>
        <pre class="q-text">${esc(m.q)}</pre>
        <div class="options">${m.options.map((o, oi) => `<label class="opt"><input type="radio" name="mcq${i}" value="${oi}"><span class="opt-letter">${"ABCD"[oi]}</span><span>${esc(o.text)}</span></label>`).join("")}</div>`;
      wrap.appendChild(card);
    });
    wrap.addEventListener("change", e => { if (e.target.type === "radio") { state.answers[+e.target.name.slice(3)] = +e.target.value; updateMcqProgress(); } });
    updateMcqProgress(); show("#screen-mcq");
  }
  function updateMcqProgress() { $("#mcq-progress").textContent = `${Object.keys(state.answers).length} / ${state.mcqs.length} answered`; }

  $("#to-coding").addEventListener("click", () => {
    const left = state.mcqs.length - Object.keys(state.answers).length;
    if (left > 0 && !ask(`${left} question(s) are unanswered. Continue to the programming section anyway? You cannot come back to Part 1.`)) return;
    renderCoding();
  });

  /* ------------------------------------------------ Coding section */
  function renderCoding() {
    const L = LANG_META[state.lang];
    $("#code-title").textContent = `${state.paper.label} · Part 2: Programming in ${L.name}`;
    $("#code-lang-note").textContent = `Write every solution in ${L.name}. Programs must read from standard input and print to standard output exactly as described. Your code will be compiled/run in ${L.name} and evaluated against hidden test cases – code in any other language will not score.`;
    const wrap = $("#code-questions"); wrap.innerHTML = "";
    state.coding.forEach((c, i) => {
      const card = document.createElement("div"); card.className = "card q-card";
      card.innerHTML = `<div class="q-head"><span class="q-num">P${i + 1} · ${esc(c.title)}</span><span class="q-marks">${CONFIG.marks.coding} marks</span></div>
        <pre class="q-text">${esc(c.text)}</pre>
        <div class="sample"><div><strong>Sample input</strong><pre>${esc(c.sample.input)}</pre></div><div><strong>Expected output</strong><pre>${esc(c.sample.output)}</pre></div></div>
        <label class="code-label">Your ${esc(L.name)} code (.${L.ext})</label>
        <textarea class="code-editor" data-idx="${i}" spellcheck="false"></textarea>`;
      wrap.appendChild(card);
    });
    wrap.querySelectorAll(".code-editor").forEach(t => t.addEventListener("keydown", e => {
      if (e.key === "Tab") { e.preventDefault(); const s = t.selectionStart, en = t.selectionEnd; t.value = t.value.slice(0, s) + "    " + t.value.slice(en); t.selectionStart = t.selectionEnd = s + 4; }
    }));
    show("#screen-code");
  }
  function starter(lang) {
    return { c: "#include <stdio.h>\nint main(void) {\n    /* your code */\n    return 0;\n}", cpp: "#include <iostream>\nusing namespace std;\nint main() {\n    // your code\n    return 0;\n}", python: "# your code\nn = int(input())\n", java: "import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // your code\n    }\n}" }[lang];
  }
  function collectCode() { document.querySelectorAll(".code-editor").forEach(t => state.code[+t.dataset.idx] = t.value); }

  $("#submit-test").addEventListener("click", () => {
    collectCode();
    const blank = state.coding.filter((_, i) => !(state.code[i] || "").trim()).length;
    if (!ask(`Submit the test now?${blank ? ` (${blank} programming question(s) are blank.)` : ""} This cannot be undone.`)) return;
    submitTest(false);
  });

  /* ------------------------------------------------ Grading */
  async function submitTest(auto, reason) {
    if (state.submitting) return; state.submitting = true;
    clearInterval(state.timerId); window.onbeforeunload = null; stopProctoring(); hideOverlay();
    document.querySelectorAll(".timer").forEach(el => el.textContent = "");
    show("#screen-grading");
    const log = (msg) => { $("#grading-log").textContent += msg + "\n"; };
    log(auto ? "Time is up – submitting automatically." : reason ? "Submitting (" + reason + ")…" : "Submitting…");

    const result = { candidate: state.candidate, paperId: state.paperId, paper: state.paper.label, lang: LANG_META[state.lang].name,
      startedAt: new Date(state.startedAt).toISOString(), submittedAt: new Date().toISOString(), mcq: [], coding: [],
      timeTakenMs: Date.now() - state.startedAt, timeTaken: fmtDur(Date.now() - state.startedAt), timeLimit: CONFIG.timeLimitMinutes + " min",
      submitReason: auto ? "time expired" : (reason || "submitted by candidate"), violations: proctor.violations.slice() };

    // MCQ
    state.mcqs.forEach((m, i) => {
      const chosen = state.answers[i]; const correct = chosen === m.answerPos;
      result.mcq.push({ n: i + 1, q: m.q, chosen: chosen == null ? null : "ABCD"[chosen] + ". " + m.options[chosen].text, correct: "ABCD"[m.answerPos] + ". " + m.options[m.answerPos].text, marks: correct ? CONFIG.marks.mcq : 0, max: CONFIG.marks.mcq, why: m.why });
    });
    log(`Part 1 evaluated: ${result.mcq.reduce((s, x) => s + x.marks, 0)} / ${CONFIG.mcqCount * CONFIG.marks.mcq}`);

    // Coding
    for (let i = 0; i < state.coding.length; i++) {
      const q = state.coding[i]; const code = (state.code[i] || "");
      log(`Evaluating P${i + 1} (${q.title}) in ${LANG_META[state.lang].name}…`);
      const g = await gradeCode(code, q, state.lang, log);
      result.coding.push(Object.assign({ n: i + 1, key: q.key, title: q.title, code, max: CONFIG.marks.coding, modelAnswer: q.modelAnswer, expectedSample: q.sample.output }, g));
      log(`  → ${g.marks} / ${CONFIG.marks.coding}  (${g.note})`);
    }

    result.mcqTotal = result.mcq.reduce((s, x) => s + x.marks, 0);
    result.codingTotal = result.coding.reduce((s, x) => s + x.marks, 0);
    result.total = result.mcqTotal + result.codingTotal;
    result.maxTotal = totalMarks();
    result.percentage = Math.round(result.total / result.maxTotal * 1000) / 10;
    result.pass = result.percentage >= CONFIG.passPercentage;
    state.result = result;
    try { localStorage.setItem("eval-result-" + Date.now(), JSON.stringify(result)); } catch (e) { }

    log("Generating PDF report…");
    try { makePdf(result); log("PDF ready."); } catch (e) { log("PDF generation failed: " + e.message); }

    log(`Sending result to ${CONFIG.organizerEmail}…`);
    const mail = await sendEmail(result);
    log(mail.ok ? "Email sent." : "Email not sent: " + mail.error);
    result.emailStatus = mail.ok ? "sent" : "failed: " + mail.error;

    setTimeout(() => { $("#done-name").textContent = state.candidate.name; $("#done-email").textContent = mail.ok ? `Your responses have been evaluated and the result has been sent to ${CONFIG.organizerName}.` : `Your responses have been recorded. (Automatic email could not be sent – the organizer can download the report from this screen.)`; show("#screen-done"); }, 800);
  }

  /* ---- language sanity: was the code written in the test's language? */
  function languageFit(code, lang) {
    const c = code;
    const sig = {
      c: [/#include\s*<stdio\.h>/, /\bprintf\s*\(/, /\bscanf\s*\(/, /\bint\s+main\s*\(/],
      cpp: [/#include\s*<iostream>/, /\bstd::|using\s+namespace\s+std/, /\bcout\s*<</, /\bcin\s*>>/, /\bint\s+main\s*\(/],
      python: [/\bprint\s*\(/, /\binput\s*\(/, /\bdef\s+\w+\s*\(/, /:\s*$/m, /\bimport\s+\w+/],
      java: [/\bpublic\s+static\s+void\s+main/, /System\.out\.print/, /\bclass\s+\w+/, /\bScanner\b/, /import\s+java\./]
    };
    const hits = (l) => sig[l].filter(r => r.test(c)).length;
    const mine = hits(lang);
    const others = Object.keys(sig).filter(l => l !== lang).map(l => ({ l, h: hits(l) })).sort((a, b) => b.h - a.h)[0];
    // C and C++ overlap heavily – be lenient between them; otherwise flag clearly foreign code
    const family = { c: "cpp", cpp: "c" };
    if (others.h > mine && others.l !== family[lang] && mine === 0) return { ok: false, detected: LANG_META[others.l].name };
    return { ok: true };
  }

  async function gradeCode(code, q, lang, log) {
    if (!code.trim()) return { marks: 0, passed: 0, total: q.tests.length, note: "No answer submitted", method: "none" };
    const fit = languageFit(code, lang);
    if (!fit.ok) return { marks: 1, passed: 0, total: q.tests.length, note: `Code appears to be ${fit.detected}, not ${LANG_META[lang].name} – minimum mark awarded`, method: "language-check" };

    // 1) execute against hidden tests
    let passed = 0, ran = 0, compileError = null;
    for (const t of q.tests) {
      const r = await runCode(code, lang, t.input);
      if (r.unavailable) break;
      ran++;
      if (r.compileError) { compileError = r.compileError; break; }
      if (outputsMatch(r.stdout, t.output, q.compare)) passed++;
      await new Promise(res => setTimeout(res, CONFIG.piston.delayMs));
    }
    if (compileError) {
      const rb = rubricScore(code, q, lang);
      return { marks: Math.min(2, Math.max(1, rb.marks - 2)), passed: 0, total: q.tests.length, note: "Does not compile/run: " + compileError.split("\n")[0].slice(0, 120), method: "execution" };
    }
    if (ran === q.tests.length) {
      const ratio = passed / q.tests.length;
      let marks = ratio === 1 ? 5 : Math.max(1, Math.round(ratio * 5));
      if (marks === 5 && ratio < 1) marks = 4;
      return { marks, passed, total: q.tests.length, note: `${passed} of ${q.tests.length} hidden test cases passed`, method: "execution" };
    }
    // 2) fallback rubric
    log("  (code-execution service unreachable – using rubric evaluation)");
    const rb = rubricScore(code, q, lang);
    return { marks: rb.marks, passed: null, total: q.tests.length, note: "Rubric evaluation (execution unavailable): " + rb.note, method: "rubric" };
  }

  async function runCode(code, lang, stdin) {
    const L = LANG_META[lang];
    try {
      const ctrl = new AbortController(); const to = setTimeout(() => ctrl.abort(), 20000);
      const res = await fetch(CONFIG.piston.url, { method: "POST", headers: { "Content-Type": "application/json" }, signal: ctrl.signal,
        body: JSON.stringify({ language: L.piston, version: L.version, files: [{ name: (lang === "java" ? "Main" : "main") + "." + L.ext, content: code }], stdin, compile_timeout: 10000, run_timeout: 5000 }) });
      clearTimeout(to);
      if (res.status === 429) { await new Promise(r => setTimeout(r, 1500)); return runCode(code, lang, stdin); }
      if (!res.ok) return { unavailable: true };
      const j = await res.json();
      if (j.compile && j.compile.code !== 0) return { compileError: j.compile.stderr || j.compile.output || "compile error" };
      if (j.run && j.run.code !== 0 && !(j.run.stdout || "").trim()) return { compileError: (j.run.stderr || "runtime error").trim() };
      return { stdout: j.run ? j.run.stdout : "" };
    } catch (e) { return { unavailable: true }; }
  }

  function outputsMatch(actual, expected, mode) {
    const norm = s => String(s ?? "").replace(/\r\n/g, "\n").split("\n").map(l => l.replace(/\s+$/, "")).join("\n").replace(/\n+$/, "");
    if (mode === "lines") return norm(actual) === norm(expected);
    const tok = s => norm(s).toLowerCase().replace(/\s+/g, " ").trim();
    return tok(actual) === tok(expected);
  }

  function rubricScore(code, q, lang) {
    let score = 1; const notes = [];
    const fit = { c: [/#include/, /main\s*\(/, /printf|puts|putchar/, /scanf|getchar|fgets/], cpp: [/#include/, /main\s*\(/, /cout|printf/, /cin|getline|scanf/], python: [/print\s*\(/, /input\s*\(|sys\.stdin/, /for |while /, /def |if /], java: [/class /, /static void main/, /System\.out/, /Scanner|BufferedReader/] }[lang];
    const fitHits = fit.filter(r => r.test(code)).length;
    if (fitHits >= 3) { score++; notes.push("valid " + LANG_META[lang].name + " structure"); }
    const kw = q.rubric.filter(k => code.includes(k)).length;
    if (kw >= Math.min(2, q.rubric.length)) { score++; notes.push("expected constructs present"); }
    const lit = q.tests.map(t => t.output.split("\n")[0].trim()).filter(x => /[A-Za-z]/.test(x));
    if (lit.length > 0 && lit.some(l => code.includes(l))) { score++; notes.push("expected output literals present"); }
    if (code.split("\n").filter(l => l.trim()).length >= 8 && /(for|while)/.test(code)) { score++; notes.push("complete program with loops"); }
    return { marks: Math.min(5, score), note: notes.join(", ") || "attempted" };
  }

  /* ------------------------------------------------ PDF */
  function makePdf(r) {
    const doc = new MiniPDF({ margin: 40 });
    const GREEN = [0.1, 0.5, 0.25], RED = [0.75, 0.15, 0.1], AMBER = [0.7, 0.45, 0], GREY = [0.4, 0.42, 0.46];
    const text = (t, size, style, color) => doc.text(t, size, style, color);
    const mono = (t, size, max) => doc.mono(t, size, max);

    text(`${CONFIG.organizerName} - Technical Evaluation Result`, 18, "bold"); doc.gap(4);
    text(`Candidate: ${r.candidate.name}   ${r.candidate.email ? "(" + r.candidate.email + ")" : ""}`, 11);
    text(`Batch / Class: ${r.candidate.batch || "-"}`, 11);
    text(`Paper: ${r.paper}   Language: ${r.lang}`, 11);
    text(`Started: ${new Date(r.startedAt).toLocaleString()}`, 11);
    text(`Submitted: ${new Date(r.submittedAt).toLocaleString()}`, 11);
    text(`Time used: ${r.timeTaken || "-"}  (limit ${r.timeLimit || "-"})`, 11); doc.gap(4);
    doc.rule();
    text("SUMMARY", 13, "bold");
    text(`Multiple choice: ${r.mcqTotal} / ${CONFIG.mcqCount * CONFIG.marks.mcq}`, 11);
    text(`Programming:     ${r.codingTotal} / ${CONFIG.codingCount * CONFIG.marks.coding}`, 11);
    text(`TOTAL:           ${r.total} / ${r.maxTotal}   =   ${r.percentage}%`, 12, "bold");
    text(`Result: ${r.pass ? "PASS" : "FAIL"}  (pass mark ${CONFIG.passPercentage}%)`, 12, "bold", r.pass ? GREEN : RED);
    text(`Submission: ${r.submitReason || "submitted by candidate"}`, 10, "normal", GREY);
    const V = r.violations || [];
    text(`Focus violations (tab/window switching): ${V.length}`, 10, V.length ? "bold" : "normal", V.length ? RED : GREY);
    V.forEach(v => text(`  - ${new Date(v.at).toLocaleTimeString()}  ${v.reason}`, 9, "normal", GREY));
    doc.gap(10);

    text(`PART 1 - MULTIPLE CHOICE (${CONFIG.marks.mcq} marks each)`, 13, "bold"); doc.gap(2);
    r.mcq.forEach(m => {
      doc.ensure(60);
      text(`Q${m.n}. ${m.q.split("\n")[0]}`, 10, "bold");
      if (m.q.includes("\n")) mono(m.q.split("\n").slice(1).join("\n"), 8);
      text(`Candidate's answer: ${m.chosen || "(not answered)"}`, 10, "normal", m.marks ? GREEN : RED);
      text(`Correct answer: ${m.correct}`, 10);
      text(`Marks: ${m.marks} / ${m.max}   - ${m.why}`, 9, "italic", GREY); doc.gap(4);
    });
    doc.gap(6); text(`PART 2 - PROGRAMMING IN ${r.lang.toUpperCase()} (${CONFIG.marks.coding} marks each)`, 13, "bold"); doc.gap(2);
    r.coding.forEach(c => {
      doc.ensure(80);
      text(`P${c.n}. ${c.title}`, 11, "bold");
      text(`Marks: ${c.marks} / ${c.max}   - ${c.note}`, 10, "normal", c.marks >= 4 ? GREEN : c.marks >= 2 ? AMBER : RED);
      text(`Correct approach: ${c.modelAnswer}`, 9, "italic", GREY);
      text("Expected output for the sample input:", 9, "bold"); mono(c.expectedSample, 8, 12);
      text("Candidate's code:", 9, "bold"); mono(c.code.trim() || "(blank)", 8, 45); doc.gap(6);
    });
    state.pdfBlob = doc.blob();
    state.pdfBase64 = doc.base64();
    state.pdfName = `Result_${r.candidate.name.replace(/[^\w]+/g, "_")}_${r.paperId}.pdf`;
  }
  function downloadPdf() { if (!state.pdfBlob) return; const a = document.createElement("a"); a.href = URL.createObjectURL(state.pdfBlob); a.download = state.pdfName; a.click(); }

  /* ------------------------------------------------ Email */
  async function sendEmail(r) {
    const E = CONFIG.emailjs;
    if (!E.enabled || !window.emailjs || !E.publicKey || E.publicKey.startsWith("YOUR_")) return { ok: false, error: "EmailJS not configured (see js/config.js)" };
    try {
      emailjs.init({ publicKey: E.publicKey });
      const rows = r.mcq.map(m => `Q${m.n}: ${m.marks}/${m.max}  (chosen: ${m.chosen || "-"} | correct: ${m.correct})`).join("\n") + "\n" +
        r.coding.map(c => `P${c.n} ${c.title}: ${c.marks}/${c.max}  (${c.note})`).join("\n");
      const summary = [
        `Candidate: ${r.candidate.name}`,
        `Email: ${r.candidate.email || "-"}`,
        `Batch / Class: ${r.candidate.batch || "-"}`,
        `Paper: ${r.paper}    Language: ${r.lang}`,
        `Started: ${new Date(r.startedAt).toLocaleString()}`,
        `Submitted: ${new Date(r.submittedAt).toLocaleString()}`,
        `Time used: ${r.timeTaken} (limit ${r.timeLimit})`,
        "",
        `Multiple choice: ${r.mcqTotal}/${CONFIG.mcqCount * CONFIG.marks.mcq}`,
        `Programming:     ${r.codingTotal}/${CONFIG.codingCount * CONFIG.marks.coding}`,
        `TOTAL SCORE:     ${r.total}/${r.maxTotal}  =  ${r.percentage}%`,
        `RESULT: ${r.pass ? "PASS" : "FAIL"}  (pass mark ${CONFIG.passPercentage}%)`,
        "",
        `Submission: ${r.submitReason || ""}`,
        `Focus violations: ${(r.violations || []).length}`,
        "",
        "Per-question breakdown:"
      ].join("\n");
      const params = {
        to_email: CONFIG.organizerEmail, candidate_name: r.candidate.name, candidate_email: r.candidate.email || "-",
        candidate_batch: r.candidate.batch || "-", batch: r.candidate.batch || "-",
        time_taken: r.timeTaken, time_limit: r.timeLimit, started_at: new Date(r.startedAt).toLocaleString(),
        score: `${r.total}/${r.maxTotal}`, name: r.candidate.name, email: r.candidate.email || "-",
        message: summary + "\n" + rows,
        paper: r.paper, language: r.lang, submitted_at: new Date(r.submittedAt).toLocaleString(),
        mcq_total: `${r.mcqTotal}/${CONFIG.mcqCount * CONFIG.marks.mcq}`, coding_total: `${r.codingTotal}/${CONFIG.codingCount * CONFIG.marks.coding}`,
        total: `${r.total}/${r.maxTotal}`, percentage: r.percentage + "%", status: r.pass ? "PASS" : "FAIL",
        breakdown: rows + `\n\nSubmission: ${r.submitReason || ""}\nFocus violations: ${(r.violations || []).length}`,
        pdf_name: state.pdfName
      };
      if (E.attachPdf && state.pdfBase64) params.pdf_base64 = "data:application/pdf;base64," + state.pdfBase64;
      await emailjs.send(E.serviceId, E.templateId, params);
      return { ok: true };
    } catch (e) { return { ok: false, error: (e && (e.text || e.message)) || String(e) }; }
  }

  /* ------------------------------------------------ Organizer views */
  $("#btn-organizer").addEventListener("click", () => {
    const pass = prompt("Organizer passcode:"); if (pass !== CONFIG.organizerPasscode) { if (pass !== null) alert("Incorrect passcode."); return; }
    renderResult(state.result); show("#screen-result");
  });
  $("#btn-download-pdf").addEventListener("click", downloadPdf);
  $("#btn-resend").addEventListener("click", async () => { $("#btn-resend").disabled = true; const m = await sendEmail(state.result); alert(m.ok ? "Email sent to " + CONFIG.organizerEmail : "Email failed: " + m.error); $("#btn-resend").disabled = false; });
  $("#btn-print").addEventListener("click", () => window.print());

  function renderResult(r) {
    const w = $("#result-body");
    w.innerHTML = `
      <div class="summary ${r.pass ? "pass" : "fail"}">
        <div><div class="big">${r.total} <span class="muted">/ ${r.maxTotal}</span></div><div>${r.percentage}% · <strong>${r.pass ? "PASS" : "FAIL"}</strong> (pass mark ${CONFIG.passPercentage}%)</div></div>
        <div class="small"><div><strong>${esc(r.candidate.name)}</strong> ${esc(r.candidate.email || "")}</div><div>Batch / Class: <strong>${esc(r.candidate.batch || "-")}</strong></div><div>${esc(r.paper)} · ${esc(r.lang)}</div><div>Submitted ${new Date(r.submittedAt).toLocaleString()}</div><div>Time used: ${esc(r.timeTaken || "-")} (limit ${esc(r.timeLimit || "-")})</div><div>MCQ ${r.mcqTotal}/${CONFIG.mcqCount * CONFIG.marks.mcq} · Programming ${r.codingTotal}/${CONFIG.codingCount * CONFIG.marks.coding}</div><div>Email: ${esc(r.emailStatus || "")}</div><div>Submission: ${esc(r.submitReason || "")}</div><div class="${(r.violations||[]).length ? "viol" : ""}">Focus violations: ${(r.violations||[]).length}${(r.violations||[]).length ? " – " + r.violations.map(v => new Date(v.at).toLocaleTimeString() + " " + v.reason).join("; ") : ""}</div></div>
      </div>
      <h3>Part 1 – Multiple choice</h3>
      <table class="res-table"><thead><tr><th>#</th><th>Question</th><th>Candidate's answer</th><th>Correct answer</th><th>Marks</th></tr></thead><tbody>
      ${r.mcq.map(m => `<tr class="${m.marks ? "ok" : "bad"}"><td>Q${m.n}</td><td><pre>${esc(m.q)}</pre></td><td>${esc(m.chosen || "—")}</td><td>${esc(m.correct)}<div class="muted small">${esc(m.why)}</div></td><td>${m.marks}/${m.max}</td></tr>`).join("")}
      </tbody></table>
      <h3>Part 2 – Programming in ${esc(r.lang)}</h3>
      ${r.coding.map(c => `<div class="card res-code ${c.marks >= 4 ? "ok" : c.marks >= 2 ? "mid" : "bad"}"><div class="q-head"><strong>P${c.n}. ${esc(c.title)}</strong><span class="q-marks">${c.marks}/${c.max}</span></div>
        <div class="small">${esc(c.note)}</div><div class="small muted"><strong>Correct approach:</strong> ${esc(c.modelAnswer)}</div>
        <details><summary>Candidate's code</summary><pre class="codeblock">${esc(c.code.trim() || "(blank)")}</pre></details>
        <details><summary>Expected output (sample)</summary><pre class="codeblock">${esc(c.expectedSample)}</pre></details></div>`).join("")}`;
  }

  function renderOrganizerHome() {
    const pass = prompt("Organizer passcode:"); if (pass !== CONFIG.organizerPasscode) { location.search = ""; return; }
    const keys = Object.keys(localStorage).filter(k => k.startsWith("eval-result-")).sort().reverse();
    const list = $("#stored-list"); list.innerHTML = keys.length ? "" : "<p class='muted'>No results stored on this device yet.</p>";
    keys.forEach(k => { const r = JSON.parse(localStorage.getItem(k)); const row = document.createElement("div"); row.className = "paper-row";
      row.innerHTML = `<div><strong>${esc(r.candidate.name)}</strong> · ${esc(r.paper)} · ${r.total}/${r.maxTotal} (${r.percentage}%) <span class="${r.pass ? "tag-pass" : "tag-fail"}">${r.pass ? "PASS" : "FAIL"}</span><div class="muted small">${new Date(r.submittedAt).toLocaleString()}</div></div><div class="row-actions"><button class="btn btn-secondary" data-k="${k}">View</button></div>`;
      row.querySelector("button").onclick = () => { state.result = r; state.paperId = r.paperId; try { makePdf(r); } catch (e) { } renderResult(r); show("#screen-result"); };
      list.appendChild(row); });
    show("#screen-organizer");
  }

  renderLanding();
})();
