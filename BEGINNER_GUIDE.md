# 🌱 Beginner Guide — AI Resume Screener

This guide explains the whole project in simple language — no prior
experience assumed. Read it top to bottom, and you'll understand exactly
how everything works.

---

## 1. What does this app actually do?

Imagine you're a recruiter. You have:
- A candidate's **resume** (PDF)
- A **job description** for an open role

You want to know: *"Is this person a good fit?"*

This app automates that:
1. It reads the resume and pulls out the technical skills (like "Python", "React", "AWS").
2. It reads the job description and pulls out the skills it's asking for.
3. It compares the two lists.
4. It asks an AI to give a final verdict: **Qualified**, **Almost There**, or **Not Yet** — with reasons.

---

## 2. The Big Picture: Two Halves

Every file in this project belongs to one of two halves:

- **Backend** (`backend/` folder) — the "brain". Written in Python. It does
  all the heavy lifting: reading PDFs, talking to the AI, doing the math.
- **Frontend** (`frontend/` folder) — the "face". Written in React
  (JavaScript). It's what the user sees and clicks on in their browser.

They talk to each other over the internet using HTTP requests — the
frontend sends the resume + job description to the backend, and the
backend sends back a JSON object with the results.

```
 You (browser) ---> Frontend (React) ---> Backend (Flask) ---> OpenAI AI
                                                  |
                                                  v
                                           back to you!
```

---

## 3. Why does each backend file exist?

Think of the backend like an assembly line. Each file is one "station"
that does ONE job and passes the result to the next station.

- **`app.py`** — the "power switch". It starts the Flask server and wires
  everything together. This is the file you literally run.
- **`config.py`** — reads secret settings (like your OpenAI API key) from
  a `.env` file, so you never hardcode secrets into your code.
- **`routes.py`** — the "traffic controller". When a request comes in
  (e.g. "please analyze this resume"), this file decides what to do,
  in what order, and sends back the final answer.
- **`services/resume_parser.py`** — opens the PDF and pulls out the raw
  text (using a tool called PyMuPDF). Think of it like a "PDF-to-text photocopier".
- **`services/skill_extractor.py`** — sends text to OpenAI and asks
  "what technical skills are in here?" It gets back a clean list.
- **`services/skill_matcher.py`** — pure math/logic, NO AI involved. It
  just compares two lists of words and figures out what's the same and
  what's different.
- **`services/fit_verdict.py`** — sends the comparison results to OpenAI
  and asks "based on this, should we hire them?"
- **`services/prompts.py`** — a file that just stores the exact
  instructions ("prompts") we send to OpenAI, written out in English.
- **`services/utils.py`** — small helper tools used everywhere, like
  "make sure this text isn't empty" or "clean up the AI's messy response
  so we can read it as JSON".

---

## 4. Why does each frontend file exist?

- **`main.jsx`** — the very first file that runs. It tells React "put the
  app inside this HTML page".
- **`App.jsx`** — the "conductor". It decides: should we show the upload
  page, or the results page? It holds the main pieces of shared state.
- **`pages/Landing.jsx`** — the first screen you see: upload box, job
  description box, and the Analyze button.
- **`pages/Results.jsx`** — the screen you see after analysis: all the
  result cards (matched skills, missing skills, etc).
- **`components/`** — small, reusable LEGO bricks. For example,
  `SkillChip.jsx` is just one little colored pill/tag — it's reused for
  every single skill shown on screen, so we only write that styling once.
- **`hooks/useAnalyze.js`** — handles "what happens when you click
  Analyze": shows a loading spinner, calls the backend, and stores either
  the result or an error message.
- **`hooks/useDarkMode.js`** — remembers whether dark mode is on, and
  flips a CSS class on/off to switch themes.
- **`services/api.js`** — the ONLY file that knows how to talk to the
  backend over the internet. Every other file asks THIS file to fetch
  data, instead of doing it themselves. This keeps things organized.

---

## 5. How does data flow, step by step?

1. You open the app in your browser → `Landing.jsx` is shown.
2. You drag a PDF onto the upload box → `UploadCard.jsx` stores the file.
3. You paste a job description → `JDCard.jsx` stores the text.
4. You click **Analyze** → `useAnalyze.js` checks: is there a file? Is
   there text? If yes, it calls `api.js`.
5. `api.js` packages the file + text into a special format called
   `FormData` (used for sending files over the internet) and sends it to
   the backend's `/api/analyze` address.
6. The Flask backend (`routes.py`) receives it and runs through the
   pipeline:
   - `resume_parser.py` turns the PDF into plain text
   - `skill_extractor.py` asks OpenAI: "what skills are in this resume?"
   - `skill_extractor.py` asks OpenAI again: "what skills does this job need?"
   - `skill_matcher.py` compares the two lists (pure Python, no AI)
   - `fit_verdict.py` asks OpenAI: "based on this comparison, what's the verdict?"
7. All of this gets bundled into one JSON object and sent back to the browser.
8. `App.jsx` sees a result has arrived and switches from `Landing.jsx` to
   `Results.jsx`, which displays everything nicely.

---

## 6. How does the frontend talk to the backend?

They're two completely separate programs running on two different "ports"
(think of a port like a numbered door on your computer):
- Frontend runs on port `5173`
- Backend runs on port `5000`

The frontend uses a library called **axios** (wrapped inside `api.js`) to
send an HTTP request to `http://localhost:5000/api/analyze`. This is
exactly like typing a website address into your browser, except the code
does it automatically and reads back the answer instead of showing a web page.

**CORS** (Cross-Origin Resource Sharing) is a browser security rule that
normally blocks a website on one port from talking to a server on another
port. We explicitly allow it in `app.py` using `flask-cors`, but only for
addresses we trust (listed in `ALLOWED_ORIGINS`).

---

## 7. How is OpenAI (the AI) called?

In `skill_extractor.py` and `fit_verdict.py`, we use OpenAI's official
Python library (`openai`), calling its Responses API. The pattern is always:

1. Build a plain-English instruction (a "prompt") using a template from
   `prompts.py`, filling in the actual resume/JD text.
2. Send it to OpenAI and ask it to reply with ONLY JSON (no extra chatty text).
3. Read OpenAI's text reply and turn it from a JSON *string* into a real
   Python dictionary using `json.loads()` (handled safely in `utils.py`).

Think of it like texting a very smart assistant: "Here's some text, please
list only the technical skills you find, and reply in this exact format."

---

## 8. How does skill extraction work?

We literally cannot write code that "understands English" — but OpenAI
can! So instead of trying to write our own logic to detect skills, we
hand the text to OpenAI with very specific instructions (see
`SKILL_EXTRACTION_PROMPT` in `prompts.py`) and trust it to return a clean
list like:

```json
{ "skills": ["Python", "React", "Docker"] }
```

We do this once for the resume and once for the job description.

---

## 9. How does the verdict work?

Once we know the matched/missing skills and the match percentage
(calculated ourselves — see below), we send THAT information to OpenAI and
ask it to act like a hiring manager and decide:
- Is this candidate **Qualified**, **Almost There**, or **Not Yet**?
- Give exactly 3 reasons why.

If OpenAI's answer is ever broken or missing (e.g. a network hiccup), the
code has a "Plan B" (`_fallback_verdict` and `_fallback_reasons` in
`fit_verdict.py`) that computes a reasonable answer using simple math
instead, so the user never sees a broken result.

---

## 10. How is the percentage calculated?

This part uses **no AI at all** — just plain math, because math should
always be exact and predictable:

```
match_percentage = (number of matched skills / number of JD skills) × 100
```

Rounded to the nearest whole number. For example:
- Job needs 5 skills: React, Redux, TypeScript, Docker, AWS
- Resume has 3 of those: React, Redux, TypeScript
- 3 ÷ 5 × 100 = 60%

This happens in `skill_matcher.py` using Python **sets**, which are a data
structure perfect for quickly finding "what's the same" and "what's
different" between two lists.

---

## 11. Glossary (simple definitions)

- **API** — a way for two programs to talk to each other, usually by
  sending requests to a specific web address.
- **JSON** — a simple text format for storing data, like
  `{"name": "Alex", "age": 25}`. Both Python and JavaScript can read/write it easily.
- **Endpoint** — a specific address on the backend that does one thing,
  e.g. `/api/analyze`.
- **Component** (React) — a reusable piece of UI, like a button or a card.
- **Hook** (React) — a reusable piece of *logic* (not UI) that a component
  can use, like `useAnalyze`.
- **Prompt** — the instructions you send to an AI model.
- **Environment variable** — a secret setting (like an API key) stored
  outside your code, usually in a `.env` file, so it's never committed to GitHub.

---

## 12. What should I look at first if I want to understand the code?

Recommended reading order:
1. `backend/app.py` — see how the server starts
2. `backend/routes.py` — see the full pipeline in one place
3. `backend/services/skill_matcher.py` — simplest file, pure logic
4. `backend/services/skill_extractor.py` — see how AI is called
5. `frontend/src/App.jsx` — see how the two pages connect
6. `frontend/src/hooks/useAnalyze.js` — see how the frontend calls the backend
7. `frontend/src/pages/Results.jsx` — see how the final data is displayed

Once you've read those seven files, you understand the entire app.
