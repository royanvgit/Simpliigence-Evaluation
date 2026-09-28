/* =====================================================================
   ORGANIZER CONFIGURATION  –  edit this file only
   ===================================================================== */
const CONFIG = {
  organizerName: "Simpliigence",
  organizerEmail: "vinod@simpliigence.com",   // result PDF is sent here

  // Organizer passcode to open the on-screen results after a candidate submits
  // (change this before sharing the link!)
  organizerPasscode: "simpli2026",

  passPercentage: 80,          // pass mark in %
  timeLimitMinutes: 60,        // total time per test (MCQ + coding)

  // ---- Proctoring: detect tab/window switching during the test ----
  proctoring: {
    enabled: true,
    maxViolations: 3,       // auto-submit when the candidate leaves the test this many times
    fullscreen: true,       // run the test in fullscreen; leaving fullscreen counts as a violation
    blockCopyPaste: true    // disable copy / cut / paste / right-click during the test
  },

  marks: { mcq: 2, coding: 5 }, // per question
  mcqCount: 25, codingCount: 4, // 25 x 2 = 50, 4 x 5 = 20 -> total 70

  // ---- Random MCQ set per candidate ----
  // Each candidate gets a different random set of MCQs drawn from the pool in
  // questions.js, with this many questions from each difficulty level
  // (should add up to mcqCount). Question order and options are shuffled too.
  //   core = primary language concepts + data structures (10 questions)
  randomMcqPerCandidate: true,
  mcqMix: { core: 10, easy: 3, medium: 7, hard: 5 },

  // ---- EmailJS (https://www.emailjs.com – free plan: 200 emails/month) ----
  // 1. Create an account, add an Email Service (e.g. Gmail) -> copy its Service ID
  // 2. Create an Email Template (see README.md for the template body) -> copy Template ID
  // 3. Account -> API keys -> copy Public Key
  emailjs: {
    enabled: true,
    publicKey:  "2P-n5WgpeOAt3jGCw",
    serviceId:  "service_geq1mcj",
    templateId: "template_uezb0nf",
    attachPdf:  false           // EmailJS free plan does not support attachments; the full breakdown is in the email body
  },

  // Code execution service (free, public). Leave as is.
  piston: { url: "https://emkc.org/api/v2/piston/execute", delayMs: 300 }
};
