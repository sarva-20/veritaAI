# Verita AI

Verita AI is an intelligent medical document analysis and diagnostic assistant. Built with a modern Light Neumorphic UI, it helps both patients and doctors leverage the power of Google's Gemini LLM to interpret complex health reports, lab results, and blood work.

## Structure

This is a monorepo consisting of a FastAPI Python backend and a React/Vite frontend. 

```
veritaAI/
├── backend/    # FastAPI, Gemini AI integrations, and Guardrails logic.
└── frontend/   # React + Vite application, featuring a Neumorphic Soft UI design.
```

## Features

- **Dual Modes (Patient & Doctor):** Switch between plain-English, empathetic explanations for patients, or clinical ICD-10 precision for doctors.
- **AI Document Analysis:** Upload any medical PDF document and the platform will automatically extract critical data, tag abnormal values, and suggest proactive doctor follow-up questions.
- **Robust Guardrails:** Three-layer security protocol that strictly blocks self-harm, off-topic requests (legal, financial, coding), and dangerous prompt-injection attacks before they reach the LLM.
- **Modern Medical UI:** A mobile-first, reactive Glassmorphism/Neumorphic interface prioritizing smooth multi-page routing and animated gradients.

---

## Local Development Setup

You will need two separate terminal windows to run both the backend API and the frontend client simultaneously.

### 1. Backend Integration (FastAPI)
By default, the backend runs on `http://localhost:8000`. Set up your environment variables first.

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# Make sure your .env file is populated with: GEMINI_API_KEY=your_key
uvicorn main:app --port 8000 --reload
```

### 2. Frontend Integration (React + Vite)
By default, the Vite server will run on `http://localhost:5173` and target the backend on port `8000`.

```bash
cd frontend
npm install
npm run dev
```

---

## Vercel Deployment Instructions

To successfully deploy this monorepo to Vercel, you should deploy the `frontend` folder as your main application directory.

### Frontend Deployment
1. Connect your GitHub repository to Vercel.
2. In the Vercel project settings, explicitly set the **Root Directory** to `frontend`.
3. Set the build command to `npm run build` and output directory to `dist`.
4. Ensure your environment variables are set in the Vercel dashboard.

*(Note: API backend deployment generally requires a platform suited for Python/FastAPI, such as Render, Railway, or standardizing Vercel Serverless functions.)*
