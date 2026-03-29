import os
import json
import base64
from dotenv import load_dotenv
load_dotenv()  # ADD THIS LINE - must be before genai.configure

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import google.generativeai as genai

from prompts import PATIENT_SYSTEM_PROMPT, DOCTOR_SYSTEM_PROMPT, PROACTIVE_QUESTIONS_PROMPT
from guardrails import check_guardrails, check_response_guardrail

app = FastAPI(title="Verita API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

genai.configure(api_key=os.environ.get("GEMINI_API_KEY"))
model = genai.GenerativeModel("gemini-2.5-flash")

# ── Request models ────────────────────────────────────────────────────────────
class ChatRequest(BaseModel):
    message: str
    mode: str = "patient"           # "patient" | "doctor"
    history: list[dict] = []        # [{role, parts}]

class AnalyzeRequest(BaseModel):
    pdf_base64: str
    filename: str
    mode: str = "patient"


# ── Health check ──────────────────────────────────────────────────────────────
@app.get("/")
def root():
    return {"status": "Verita API running", "version": "1.0.0"}


# ── Chat endpoint ─────────────────────────────────────────────────────────────
@app.post("/api/chat")
async def chat(req: ChatRequest):
    # 1. Guardrail check BEFORE hitting Gemini
    is_safe, reason = check_guardrails(req.message)
    if not is_safe:
        return {
            "response": reason,
            "guardrail_triggered": True,
            "mode": req.mode
        }

    # 2. Pick system prompt based on mode
    system_prompt = PATIENT_SYSTEM_PROMPT if req.mode == "patient" else DOCTOR_SYSTEM_PROMPT

    # 3. Build chat with system prompt injected as first turn
    chat_session = model.start_chat(
        history=[
            {"role": "user", "parts": [system_prompt]},
            {"role": "model", "parts": ["Understood. I am Verita, ready to assist."]},
            *req.history
        ]
    )

    # 4. Send message
    response = chat_session.send_message(req.message)
    response_text = response.text

    # 5. Output guardrail — scan response before returning
    is_clean, clean_response = check_response_guardrail(response_text)
    if not is_clean:
        return {
            "response": clean_response,
            "guardrail_triggered": True,
            "mode": req.mode
        }

    return {
        "response": response_text,
        "guardrail_triggered": False,
        "mode": req.mode
    }


# ── Document analysis endpoint ────────────────────────────────────────────────
@app.post("/api/analyze")
async def analyze(req: AnalyzeRequest):
    # 1. Guardrail on filename (basic sanity)
    is_safe, reason = check_guardrails(req.filename)
    if not is_safe:
        return {"error": reason, "guardrail_triggered": True}

    # 2. Decode PDF and send to Gemini vision
    system_prompt = PATIENT_SYSTEM_PROMPT if req.mode == "patient" else DOCTOR_SYSTEM_PROMPT

    analysis_prompt = f"""{system_prompt}

CRITICAL INSTRUCTION FIRST:
Analyze the attached document to verify it is a legitimate medical document (e.g., lab report, blood test, clinical note). If the document appears to be a generic form of identification (ID card, driver's license, passport, utility bill) and is NOT a medical test or report, you MUST output EXACTLY the following sentence and nothing else:
"⚠️ This is not a recognized medical document. Please upload a valid medical report or test result."

If it IS a valid medical document, structure your response exactly as:

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

        # 3. Output guardrail
        is_clean, clean_response = check_response_guardrail(analysis_text)
        analysis_text = clean_response if is_clean else (
            "Unable to process this document. Please try again."
        )

        # 4. Generate proactive doctor questions
        questions = []
        try:
            q_response = model.generate_content(
                f"{PROACTIVE_QUESTIONS_PROMPT}\n\nDocument analysis:\n{analysis_text}"
            )
            raw = q_response.text.strip()
            # Strip markdown code fences if present
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

        return {
            "analysis": analysis_text,
            "questions": questions,
            "mode": req.mode,
            "guardrail_triggered": False
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")


# ── Guardrail demo endpoint (for judges) ──────────────────────────────────────
@app.post("/test-guardrail")
async def test_guardrail(req: ChatRequest):
    """
    Transparent endpoint to demonstrate guardrails working.
    Returns the guardrail decision + reason without hitting Gemini.
    """
    is_safe, reason = check_guardrails(req.message)
    return {
        "input": req.message,
        "is_safe": is_safe,
        "reason": reason if not is_safe else "No guardrail triggered",
        "would_proceed_to_gemini": is_safe
    }
