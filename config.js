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
  mcqCount: 15, codingCount: 4, // 15 x 2 = 30, 4 x 5 = 20 -> total 50

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
