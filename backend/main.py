import os
import json
import base64
from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import google.generativeai as genai

from prompts import PATIENT_SYSTEM_PROMPT, DOCTOR_SYSTEM_PROMPT, PROACTIVE_QUESTIONS_PROMPT
from guardrails import check_guardrails, check_response_guardrail

app = FastAPI(title="Verita API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

genai.configure(api_key=os.environ.get("GEMINI_API_KEY"))
model = genai.GenerativeModel("gemini-2.5-flash")

class ChatRequest(BaseModel):
    message: str
    mode: str = "patient"
    history: list[dict] = []

class AnalyzeRequest(BaseModel):
    pdf_base64: str
    filename: str
    mode: str = "patient"

@app.get("/")
def root():
    return {"status": "Verita API running", "version": "1.0.0"}

@app.post("/chat")
async def chat(req: ChatRequest):
    is_safe, reason = check_guardrails(req.message)
    if not is_safe:
        return {"response": reason, "guardrail_triggered": True, "mode": req.mode}

    system_prompt = PATIENT_SYSTEM_PROMPT if req.mode == "patient" else DOCTOR_SYSTEM_PROMPT

    chat_session = model.start_chat(
        history=[
            {"role": "user", "parts": [system_prompt]},
            {"role": "model", "parts": ["Understood. I am Verita, ready to assist."]},
            *req.history
        ]
    )

    response = chat_session.send_message(req.message)
    response_text = response.text

    is_clean, clean_response = check_response_guardrail(response_text)
    if not is_clean:
        return {"response": clean_response, "guardrail_triggered": True, "mode": req.mode}

    return {"response": response_text, "guardrail_triggered": False, "mode": req.mode}

@app.post("/analyze")
async def analyze(req: AnalyzeRequest):
    is_safe, reason = check_guardrails(req.filename)
    if not is_safe:
        return {"error": reason, "guardrail_triggered": True}

    system_prompt = PATIENT_SYSTEM_PROMPT if req.mode == "patient" else DOCTOR_SYSTEM_PROMPT

    analysis_prompt = f"""{system_prompt}

Analyze the attached medical document. Structure your response as:

## Summary
Brief overview of what this document contains.

## Key Values
List all measurable values found, with their results and normal ranges.
Mark each as [NORMAL], [BORDERLINE], [ABNORMAL], or [CRITICAL].

## What This Means
Plain-language explanation (patient mode) OR clinical interpretation (doctor mode).

## Recommended Next Steps
What the patient/clinician should do next.
"""

    try:
        pdf_data = base64.b64decode(req.pdf_base64)
        response = model.generate_content([
            {"mime_type": "application/pdf", "data": pdf_data},
            analysis_prompt
        ])
        analysis_text = response.text

        is_clean, clean_response = check_response_guardrail(analysis_text)
        analysis_text = clean_response if is_clean else "Unable to process this document. Please try again."

        questions = []
        try:
            q_response = model.generate_content(
                f"{PROACTIVE_QUESTIONS_PROMPT}\n\nDocument analysis:\n{analysis_text}"
            )
            raw = q_response.text.strip()
            if raw.startswith("```"):
                raw = raw.split("```")[1]
                if raw.startswith("json"):
                    raw = raw[4:]
            questions = json.loads(raw)
        except Exception:
            questions = [
                "What do my abnormal values mean for my overall health?",
                "Do I need any follow-up tests based on these results?",
                "Should I change my diet or lifestyle based on these findings?",
                "Are any of these values urgent enough to act on immediately?",
                "When should I come back for another test?"
            ]

        return {"analysis": analysis_text, "questions": questions, "mode": req.mode, "guardrail_triggered": False}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@app.post("/test-guardrail")
async def test_guardrail(req: ChatRequest):
    is_safe, reason = check_guardrails(req.message)
    return {
        "input": req.message,
        "is_safe": is_safe,
        "reason": reason if not is_safe else "No guardrail triggered",
        "would_proceed_to_gemini": is_safe
    }