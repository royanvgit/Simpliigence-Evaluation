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

  marks: { mcq: 2, coding: 5 }, // per question
  mcqCount: 15, codingCount: 4, // 15 x 2 = 30, 4 x 5 = 20 -> total 50

  // ---- EmailJS (https://www.emailjs.com – free plan: 200 emails/month) ----
  // 1. Create an account, add an Email Service (e.g. Gmail) -> copy its Service ID
  // 2. Create an Email Template (see README.md for the template body) -> copy Template ID
  // 3. Account -> API keys -> copy Public Key
  emailjs: {
    enabled: true,
    publicKey:  "YOUR_EMAILJS_PUBLIC_KEY",
    serviceId:  "YOUR_EMAILJS_SERVICE_ID",
    templateId: "YOUR_EMAILJS_TEMPLATE_ID",
    attachPdf:  true            // set false if your EmailJS plan does not allow attachments
  },

  // Code execution service (free, public). Leave as is.
  piston: { url: "https://emkc.org/api/v2/piston/execute", delayMs: 300 }
};
