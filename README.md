# Online Technical Evaluation (C · C++ · Python · Java)

A self-contained, static website (no server, no build step, no framework) that runs an online technical test and emails the result PDF to the organizer. Host it for free on GitHub Pages and send candidates a link.

## What the candidate gets

* **8 question papers** – Paper A and Paper B (jumbled) for each of C, C++, Python and Java.
* **Part 1:** 15 multiple-choice questions on the core concepts of that language, 2 marks each = **30 marks**.
* **Part 2:** 4 programming questions (taken from the Technical Interview Questionnaire), to be written **in the paper's language**, 5 marks each = **20 marks**.
* **Total 50 marks. Pass mark 80 %.** Time limit 60 minutes (configurable).

## How marking works

| Part | Method |
|---|---|
| MCQ | Auto-marked, 2 marks per correct answer. |
| Programming | The candidate's code is compiled and run **in the paper's language** (C / C++ / Python / Java) against hidden test cases using the free public [Piston](https://github.com/engineer-man/piston) code-execution service. Marks = share of test cases passed, scaled 1–5 (all passed = 5, attempted but nothing passed = 1, blank = 0, code written in a different language = 1). If the execution service cannot be reached, a language-specific rubric check is used instead (structure, required constructs, expected output text) so the test can always be graded. |

After submission the site:

1. Builds a **PDF report** with every question, the candidate's answer, the correct answer, marks per question, total out of 50, percentage and PASS/FAIL.
2. **Emails** the report to the organizer (`vinod@simpliigence.com`) via EmailJS.
3. Shows the candidate a "submitted" screen only. The organizer can open the full result on that screen with the **organizer passcode** (or from `index.html?organizer=1` on the same device), download the PDF, print it or re-send the email.

---

## Setup (about 5 minutes)

### 1. Put the site on GitHub Pages

1. Sign in to GitHub → **New repository** → name it e.g. `technical-evaluation`, set **Public**, click **Create repository**.
2. On the new repo page click **uploading an existing file**, drag in **everything inside this folder** (`index.html`, `README.md`, `LICENSE`, the `css` and `js` folders) and click **Commit changes**.
   (Or with git: `git clone <repo-url>`, copy the files in, `git add . && git commit -m "Evaluation site" && git push`.)
3. Repo → **Settings** → **Pages** → under *Build and deployment* choose **Source: Deploy from a branch**, Branch **main**, folder **/ (root)** → **Save**.
4. After ~1 minute the site is live at `https://<your-username>.github.io/technical-evaluation/`.

Open that URL: it lists the 8 papers with a **Copy link** button for each. The candidate link looks like:

```
https://<your-username>.github.io/technical-evaluation/?paper=python-a
```

Paper ids: `c-a`, `c-b`, `cpp-a`, `cpp-b`, `python-a`, `python-b`, `java-a`, `java-b`.

### 2. Set the organizer passcode

Edit `js/config.js` → `organizerPasscode`. Change it from the default before sharing links.

### 3. Enable automatic email (EmailJS – free, 200 emails/month)

1. Create a free account at <https://www.emailjs.com>.
2. **Email Services → Add New Service** → choose Gmail (or any provider) and connect the mailbox that should *send* the results → copy the **Service ID**.
3. **Email Templates → Create New Template**. Fill in:
   * **To Email:** `{{to_email}}`
   * **Subject:** `Evaluation result: {{candidate_name}} – {{paper}} – {{status}} ({{percentage}})`
   * **Content** (switch the editor to plain text or paste into the body):

     ```
     Candidate: {{candidate_name}} ({{candidate_email}})
     Paper: {{paper}}   Language: {{language}}
     Submitted: {{submitted_at}}

     Multiple choice: {{mcq_total}}
     Programming:     {{coding_total}}
     TOTAL:           {{total}}  =  {{percentage}}   →  {{status}}

     Per-question breakdown:
     {{breakdown}}

     The full report with correct answers is attached ({{pdf_name}}).
     ```
   * **Attachments** tab → **Add Attachment** → type **Variable Attachment**, Parameter name `pdf_base64`, Filename `{{pdf_name}}`, Content type `application/pdf`.
     (If your plan does not allow attachments, skip this and set `attachPdf: false` in `js/config.js`; the email body still contains the full breakdown and the organizer can download the PDF from the result screen.)
   * Save → copy the **Template ID**.
4. **Account → General → API Keys** → copy the **Public Key**.
5. Edit `js/config.js` and paste the three values:

   ```js
   emailjs: { enabled: true, publicKey: "xxxx", serviceId: "service_xxxx", templateId: "template_xxxx", attachPdf: true }
   ```
6. Commit the change (GitHub Pages redeploys automatically). Run one paper yourself to confirm the email arrives.

### 4. Optional tweaks (all in `js/config.js`)

`passPercentage`, `timeLimitMinutes`, `organizerEmail`, marks per question. Questions live in `js/questions.js` (`MCQ_BANK`, `CODING_POOL`, `PAPERS`).

---

## Files

```
index.html        page structure (single page app)
css/style.css     styling (responsive, printable)
js/config.js      organizer settings – the only file you need to edit
js/questions.js   MCQ banks (15 × 4 languages), coding pool with hidden tests, 8 paper definitions
js/app.js         test flow, timer, grading, PDF, email, organizer view
js/minipdf.js     tiny built-in PDF writer (no external library)
```

## Notes

* Everything runs in the candidate's browser; results are also kept in that browser's local storage so the organizer can reopen them from the same device.
* This project is released to the public domain (see `LICENSE`). The only third-party pieces are the EmailJS browser SDK (loaded from its CDN, BSD-3-Clause) and the public Piston execution API.
* For fair testing, ask candidates to use a normal desktop browser and not to refresh the page during the test.
