# 🎤 Interview Guide — AI Resume Screener

This document prepares you to confidently explain every part of this project
in a technical interview, including likely follow-up questions.

---

## 1. Elevator Pitch (30 seconds)

> "I built a full-stack AI application that compares a candidate's resume
> against a job description. It extracts technical skills from both using
> OpenAI, computes a skill-gap and match percentage, and then asks
> OpenAI a second time to produce a hiring verdict with three reasons. The
> backend is Flask with a clean service-layer architecture, and the frontend
> is React with Tailwind, including dark mode, PDF export, and drag-and-drop
> upload."

---

## 2. Project Architecture (deep dive)

The app follows a **three-tier architecture**:

1. **Presentation layer (frontend)** — React components that are "dumb":
   they receive data/handlers as props and render UI. All state logic lives
   in custom hooks (`useAnalyze`, `useDarkMode`).
2. **API layer (backend routes)** — `routes.py` is a **Flask Blueprint**
   that only orchestrates: validate input → call services in order → return
   JSON. It has zero business logic itself.
3. **Service layer (backend services/)** — each file does exactly one job
   (Single Responsibility Principle):
   - `resume_parser.py` — PDF bytes → plain text
   - `skill_extractor.py` — text → list of skills (calls OpenAI)
   - `skill_matcher.py` — two skill lists → matched/missing/percentage (pure logic, no AI)
   - `fit_verdict.py` — skills + match data → verdict + reasons (calls OpenAI)
   - `prompts.py` — all prompt templates, centralized for easy tuning
   - `utils.py` — shared helpers: JSON extraction, validation, custom `AppError`

**Why split it this way?** It makes the pipeline testable in isolation —
you could unit test `skill_matcher.py` with zero network calls, since it's
pure Python logic with no AI dependency.

---

## 3. Explaining Every Folder & File

### `backend/`
| File | Purpose |
|---|---|
| `app.py` | Application factory (`create_app()`), registers CORS, the blueprint, and centralized error handlers |
| `config.py` | Reads all environment variables ONCE into a single `Config` object |
| `routes.py` | Defines `/api/health`, `/api/analyze`, `/api/history` |
| `services/*.py` | Business logic, one responsibility per file (see above) |

### `frontend/src/`
| Folder | Purpose |
|---|---|
| `pages/` | Top-level views: `Landing.jsx` (upload + JD form) and `Results.jsx` (dashboard) |
| `components/` | Reusable, mostly-presentational pieces (chips, cards, navbar, loader) |
| `hooks/` | Encapsulated state logic (`useAnalyze` = the analysis request state machine; `useDarkMode` = theme toggle) |
| `services/api.js` | The ONLY file that knows about axios/HTTP — every component calls functions from here, never `fetch` directly |

---

## 4. How AI Is Used (be ready to explain in detail)

The app calls OpenAI **twice** per analysis:

**Call 1 — Skill Extraction** (`skill_extractor.py`, run twice: once for the
resume, once for the JD)
- Prompt instructs OpenAI to extract ONLY concrete technical skills
- Requests strict JSON output: `{"skills": [...]}`
- Uses the Responses API's `text={"format": {"type": "json_object"}}` option to further constrain output
- `temperature=0.1` — low temperature for consistent, deterministic extraction

**Call 2 — Verdict Generation** (`fit_verdict.py`)
- Receives the *already-computed* matched/missing skills and percentage
  (computed in Python, not by the AI — see below)
- Asks OpenAI to reason like "a senior technical hiring manager"
- Requests exactly 3 reasons and one of 3 fixed verdict labels
- `temperature=0.3` — slightly higher, since this is more of a reasoning/writing task

**Why is matching done in Python and not by the AI?**
This is an important design decision to be ready to defend:
> "Percentage calculation needs to be deterministic and auditable — if a
> recruiter asks 'why is this 60% and not 65%?', I need a reproducible
> formula, not a black-box LLM guess. So I let the AI do what it's good at
> (understanding unstructured text into structured skills) and let plain
> Python do what it's good at (exact set comparison and math)."

---

## 5. Why OpenAI?

- Native JSON-mode output via the Responses API reduces parsing errors
- Widely used and well-documented, with a mature, actively maintained official `openai` Python SDK
- Fast, cost-effective models like `gpt-4o-mini` are well-suited to a synchronous request/response UX
- Configurable via `OPENAI_MODEL`, so upgrading to a stronger model later is a one-line env var change

*(If asked "why not Gemini/Claude?" — be honest: "OpenAI was specified in
the assignment brief; the architecture is provider-agnostic since all
prompt/response handling is isolated in two files, so swapping providers
would only mean changing `skill_extractor.py` and `fit_verdict.py`.")*

---

## 6. Why Flask?

- Lightweight, minimal boilerplate — appropriate for a focused API with
  ~3 endpoints
- Blueprints give clean route organization without needing a framework
  like Django
- Easy to deploy anywhere (Render, Railway, a plain VM) via `gunicorn`
- Familiar synchronous request model fits this use case (one request →
  two sequential AI calls → one response); no need for async complexity here

---

## 7. Why React (+ Vite + Tailwind)?

- **React**: component reusability (5+ result cards share the same chip/card patterns)
- **Vite**: near-instant dev server startup and HMR vs. older tooling like CRA
- **Tailwind**: utility classes let you build a polished, consistent design
  system (spacing, color, dark mode) without writing/maintaining separate CSS files
- **Custom hooks** (`useAnalyze`) separate "what happens" (business/async logic)
  from "how it looks" (JSX), which makes components easier to test and reason about

---

## 8. Error Handling Strategy

- A custom `AppError` exception (`utils.py`) carries an HTTP status code
- Every service raises `AppError` with a specific, user-friendly message
  for each failure mode (empty file, invalid PDF, empty JD, OpenAI failure,
  malformed AI JSON, oversized upload)
- `app.py` registers a single `@errorhandler(AppError)` that converts any
  `AppError` into a consistent `{"error": "..."}` JSON response
- Generic 404/405/500/413 handlers ensure even *unexpected* errors never
  leak a raw Python traceback to the frontend
- On the frontend, `api.js` has a `toFriendlyError()` function that
  normalizes axios errors (timeout, network-down, backend error) into a
  single readable message shown in the UI

---

## 9. Common Interview Questions & Answers

**Q: How is the match percentage calculated?**
> A: `matched skills ÷ total JD skills × 100`, rounded to the nearest
> integer. If the JD has zero detected skills, it defaults to 0% rather
> than dividing by zero.

**Q: What happens if the AI returns malformed JSON?**
> A: `extract_json_block()` in `utils.py` tries to strip markdown code
> fences and isolate the outermost `{...}` block before parsing. If it
> still can't parse valid JSON, it raises an `AppError` with a 502 status
> and a friendly message — the app never crashes silently.

**Q: What if OpenAI's verdict/reasons are missing or invalid?**
> A: `fit_verdict.py` has deterministic **fallback logic** —
> `_fallback_verdict()` picks a verdict purely from the match percentage,
> and `_fallback_reasons()` builds reasons from the matched/missing skill
> lists. The user always gets a complete, sensible result even if the AI
> response is imperfect.

**Q: How do you prevent huge PDFs or JD text from blowing up token usage / cost?**
> A: Two guards: (1) `MAX_CONTENT_LENGTH` on the Flask app rejects files
> over 5MB at the request level, and (2) `skill_extractor.py` truncates
> extracted text to 12,000 characters before sending it to OpenAI.

**Q: Is this stateless? How does history work?**
> A: The `/api/analyze` endpoint itself is stateless. History is a small
> in-memory `deque(maxlen=5)` on the server for demo purposes — it resets
> on server restart. In a real production system I'd replace this with a
> database table keyed by user/session ID.

**Q: How would you scale this?**
> A: Move history to a real database (Postgres/Redis), add authentication,
> queue long-running OpenAI calls (e.g. Celery) if traffic grows, add
> caching for repeated resume/JD pairs, and add rate limiting per user/IP.

**Q: How is CORS handled?**
> A: `flask-cors` is configured with an explicit whitelist read from the
> `ALLOWED_ORIGINS` environment variable rather than allowing `*`, which
> keeps the API from being called by arbitrary websites in production.

**Q: Walk me through what happens when I click "Analyze".**
> A: `Landing.jsx` calls `onAnalyze` → `useAnalyze.runAnalysis()` validates
> the file/JD client-side → calls `analyzeResume()` in `api.js` → POSTs
> `multipart/form-data` to `/api/analyze` → Flask validates again
> server-side → `resume_parser` extracts text → `skill_extractor` is
> called twice (resume, JD) → `skill_matcher` computes overlap → `fit_verdict`
> generates the verdict → JSON is returned → `App.jsx` swaps to the
> `Results` page.

**Q: Why validate input on both frontend AND backend?**
> A: Frontend validation gives instant UX feedback without a network
> round-trip. Backend validation is the actual security/correctness
> boundary — the frontend can always be bypassed (e.g. via `curl`), so the
> API must never trust client-side checks alone.

### Possible Follow-Up Questions

- "How would you test this?" → pytest for services (mock the OpenAI
  client), React Testing Library for components, Cypress/Playwright for
  end-to-end.
- "How would you add authentication?" → JWT or session-based auth on
  Flask, protect `/api/analyze` and `/api/history` with a `@login_required`
  decorator, and scope history queries per user.
- "How would you avoid prompt injection from a malicious resume/JD?" →
  Treat all extracted text as untrusted data inside the prompt, never as
  instructions; the prompt template explicitly frames the block as "TEXT
  TO ANALYZE" wrapped in triple quotes, and skills are validated to be
  a list of strings before use.
- "What's the time complexity of the matching logic?" → O(n + m) using
  Python sets, where n and m are the number of resume/JD skills.
