# SchemeSaathi AI

**Your AI Guide to Government Benefits**

A demo citizen guide for discovering government schemes. The JSON dataset is the source of truth for scheme facts and eligibility. Google Gemini only explains or chats about a selected scheme record. It does not invent schemes or eligibility rules.

This is not official government advice. Confirm every detail on the official portal before applying.

## Stack

- Frontend: React, Vite, Tailwind CSS, React Router, Axios
- Backend: FastAPI, Python, Pydantic
- AI: Google Gemini API
- Data: JSON files in `backend/data/schemes`

## Run locally

### Quick Start (Both Frontend & Backend Together)

From the project root:

```bash
npm start
# or
npm run dev
```

This concurrently starts:
- **Backend (FastAPI)** at `http://127.0.0.1:8000`
- **Frontend (Vite / React)** at `http://localhost:5173`

---

### Running Separately

#### Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
python run.py
```

- API: http://127.0.0.1:8000
- Swagger: http://127.0.0.1:8000/docs

Set `GEMINI_API_KEY` in `backend/.env` for AI explanation and chat. Browse, search, eligibility, recommendations, documents, comparison, and notifications work without it.

#### Frontend

```bash
cd frontend
npm install
npm run dev
```

App: http://localhost:5173

Create a local account (stored in the browser only), then use the dashboard.

## Features

1. Scheme browsing
2. Scheme search
3. Eligibility checker
4. Personalized recommendations
5. AI scheme explanation
6. AI chat assistant
7. Document readiness checker
8. Scheme comparison
9. Personalized notifications
10. English + Telugu interface
