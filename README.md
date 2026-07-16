# 🎯 AI Resume Screener

An end-to-end AI application that compares a candidate's **resume** against a
**job description**, highlights the **skill gap**, and produces an AI-generated
**hiring verdict** with supporting reasons.

Built to satisfy two combined take-home assignments:

1. **Skill Gap Checker** — matched skills, missing skills, match percentage.
2. **Fit Verdict Generator** — AI verdict (`Qualified` / `Almost There` / `Not Yet`) with exactly three reasons.

---

## ✨ Features

- 📄 Upload a resume as PDF (drag-and-drop or click-to-browse)
- 📝 Paste any job description
- 🤖 AI-powered skill extraction using **OpenAI**
- ✅ Matched skills, ❌ missing skills, and an animated match-percentage ring
- 🧭 AI hiring verdict with three plain-English reasons
- 🌗 Dark mode toggle
- 📋 Copy result to clipboard
- ⬇️ Download result as a PDF
- 🕐 History of your last 5 analyses (in-session)
- 🛡️ Robust error handling for bad files, empty input, AI/network failures

---

## 🏗️ Architecture

```
                       ┌─────────────────────┐
                       │   React Frontend     │
                       │  (Vite + Tailwind)   │
                       └──────────┬───────────┘
                                  │ multipart/form-data (POST /api/analyze)
                                  ▼
                       ┌─────────────────────┐
                       │   Flask Backend      │
                       │  routes.py (API)     │
                       └──────────┬───────────┘
                                  │
             ┌────────────────────┼─────────────────────┐
             ▼                    ▼                      ▼
   resume_parser.py      skill_extractor.py      skill_matcher.py
   (PyMuPDF: PDF→text)   (OpenAI: text→skills)   (pure Python compare)
                                  │
                                  ▼
                          fit_verdict.py
                     (OpenAI: skills→verdict+reasons)
                                  │
                                  ▼
                     JSON response → rendered in React
```

**Design principle:** each service module does exactly one job. `routes.py`
only orchestrates the pipeline; it contains no business logic itself.

---

## 📁 Folder Structure

```
resume-screener/
├── README.md                  <- you are here
├── INTERVIEW_GUIDE.md          <- interview prep: architecture Q&A
├── BEGINNER_GUIDE.md            <- beginner-friendly walkthrough
│
├── backend/
│   ├── app.py                  <- Flask app factory + error handlers
│   ├── config.py                <- centralized environment config
│   ├── routes.py                 <- API endpoints (Blueprint)
│   ├── requirements.txt
│   ├── .env.example
│   └── services/
│       ├── resume_parser.py     <- PDF -> text (PyMuPDF)
│       ├── skill_extractor.py   <- OpenAI call: text -> skills
│       ├── skill_matcher.py     <- pure logic: compare skill lists
│       ├── fit_verdict.py         <- OpenAI call: skills -> verdict
│       ├── prompts.py             <- all OpenAI prompts, centralized
│       └── utils.py                <- JSON parsing, validation helpers
│
└── frontend/
    ├── index.html
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    ├── .env.example
    └── src/
        ├── App.jsx
        ├── main.jsx
        ├── index.css
        ├── pages/
        │   ├── Landing.jsx        <- upload + JD + analyze button
        │   └── Results.jsx         <- results dashboard
        ├── components/            <- 11 reusable UI components
        ├── hooks/
        │   ├── useAnalyze.js       <- analysis request state machine
        │   └── useDarkMode.js
        └── services/
            └── api.js               <- axios wrapper for backend calls
```

---

## 🚀 Installation

### Prerequisites

- Python 3.10+
- Node.js 18+
- An [OpenAI API key](https://platform.openai.com/api-keys)

### 1. Clone / unzip the project

```bash
cd resume-screener
```

### 2. Backend setup

```bash
cd backend

# Create and activate a virtual environment
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env
# Open .env and paste your OPENAI_API_KEY

# Run the server
python app.py
```

The backend runs at `http://localhost:5000`.

### 3. Frontend setup

Open a **new terminal**:

```bash
cd frontend

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# VITE_API_BASE_URL defaults to http://localhost:5000/api

# Run the dev server
npm run dev
```

The frontend runs at `http://localhost:5173`.

### 4. Use the app

Open `http://localhost:5173`, upload a PDF resume, paste a job description,
and click **Analyze**.

---

## 🔑 OpenAI API Setup

1. Go to [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Sign in to your OpenAI account and click **Create new secret key**
3. Copy the key into `backend/.env` as `OPENAI_API_KEY`
4. (Optional) Change `OPENAI_MODEL` in `.env` to any available OpenAI model (e.g. `gpt-4o-mini`, `gpt-4o`)

---

## 🖼️ Screenshots

> _Add your own screenshots here after running the app locally._

| Landing Page | Results Page |
|---|---|
| `screenshots/Screenshot 2026-07-16 180439.png` | `screenshots/Screenshot 2026-07-16 180148.png` |

---

## ☁️ Deployment

### Backend → Render

1. Push the `backend/` folder to a GitHub repo
2. Create a new **Web Service** on [Render](https://render.com)
3. Build command: `pip install -r requirements.txt`
4. Start command: `gunicorn app:app`
5. Add environment variables (`OPENAI_API_KEY`, `ALLOWED_ORIGINS`, etc.) in the Render dashboard

### Frontend → Vercel

1. Push the `frontend/` folder to a GitHub repo
2. Import the project into [Vercel](https://vercel.com)
3. Framework preset: **Vite**
4. Add environment variable `VITE_API_BASE_URL` pointing to your deployed Render backend URL (e.g. `https://your-app.onrender.com/api`)

---

## 🔮 Future Improvements

- Persist history in a real database (PostgreSQL) instead of in-memory
- User accounts + saved analysis history across sessions
- Support DOCX resumes in addition to PDF
- Batch-screen multiple resumes against one job description
- Weighted skill scoring (core skills vs. nice-to-have skills)
- Add automated tests (pytest for backend, Vitest/RTL for frontend)
- Rate limiting on the `/api/analyze` endpoint

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Backend | Python, Flask, Flask-CORS |
| PDF Parsing | PyMuPDF (fitz) |
| AI | OpenAI API (`openai` SDK) |
| Frontend | React + Vite |
| Styling | Tailwind CSS |
| Icons | Lucide React |
| PDF Export | jsPDF |
| Deployment | Render (backend), Vercel (frontend) |

---

## 📄 License

This project was built as a take-home assignment submission and is free to
use for learning and interview purposes.
