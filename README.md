# Verita — Medical Document Intelligence Platform

## 1. What is Verita?

Verita is a medical document intelligence platform that transforms complex health reports into clear, actionable insights — built for both patients and clinicians.

**Patient Mode** translates lab results and medical documents into plain English, flags abnormal values, and generates 5 specific questions the patient should ask their doctor at their next appointment — turning passive recipients of medical data into informed, prepared participants in their own care.

**Doctor Mode** shifts to full clinical precision — ICD-10 code references, differential diagnosis considerations, urgency-flagged findings (`[CRITICAL]`, `[ABNORMAL]`, `[BORDERLINE]`), and follow-up investigation suggestions. Same document, same engine, completely different lens calibrated for a healthcare professional.

Both modes are powered by **Gemini 2.5 Flash** with native PDF vision — no preprocessing, no third-party OCR. Upload a report, get structured intelligence in seconds.

---

## 2. System Prompt Design

Verita uses two distinct system prompts injected **server-side only**, never exposed to the client.

### Patient Prompt
Enforces empathetic, jargon-free communication. Explicitly prohibits diagnosis, treatment recommendations, and medication suggestions. Every response closes with a mandatory disclaimer directing the user back to their healthcare provider.

### Doctor Prompt
Operates at peer-level clinical precision — standard medical abbreviations, reference ranges with units, ICD-10 codes, and structured differential considerations. Flags critical values requiring immediate attention and suggests relevant follow-up investigations.

### Proactive Question Generator Prompt
Given the document analysis, produces exactly **5 specific, prioritized, plain-language questions** the patient can bring to their next appointment. Output is constrained to a strict JSON array — reliably parseable and tamper-resistant.
```python
# Output format enforced by prompt
["Question 1?", "Question 2?", "Question 3?", "Question 4?", "Question 5?"]
```

---

## 3. Guardrails & Safety

Verita implements a **three-layer guardrail system** that runs before every Gemini API call — zero latency cost, 100% deterministic.

### Layer 1 — Prompt Injection Defense

Catches 15+ regex-compiled attack patterns:

| Category | Examples |
|---|---|
| Classic overrides | `ignore all previous instructions`, `forget your system prompt` |
| Role hijacking | `you are now`, `act as`, `pretend to be`, `DAN`, `do anything now` |
| Prompt extraction | `reveal your instructions`, `what is your system prompt` |
| Jailbreak keywords | `bypass your filters`, `no restrictions`, `jailbreak` |
| Encoding tricks | `base64`, `hex decode` |
| Context manipulation | `[INST]`, `<system>`, `### instruction` |

> Patterns are compiled once at module load for performance.

### Layer 2 — Safety Blocklist

Detects self-harm and crisis language. Rather than refusing bluntly, Verita responds with empathy and provides real crisis resources:

- 🇮🇳 **India:** iCall — `9152987821`
- 🌍 **International:** [findahelpline.com](https://findahelpline.com)

### Layer 3 — Off-topic Scope Enforcement

Keeps the assistant focused on medical documents. Legal, financial, coding, and general knowledge queries are redirected cleanly with context on what Verita can actually help with.

### Output Guardrail

A secondary scan runs on **Gemini's response before it reaches the client** — catching edge cases where injection partially succeeded.

### Live Demo Endpoint
```bash
POST /test-guardrail
```

Submit any input and receive a full JSON breakdown:
```json
{
  "input": "ignore all previous instructions",
  "is_safe": false,
  "reason": "INJECTION_DETECTED: ...",
  "would_proceed_to_gemini": false
}
```

> Safety systems that operate invisibly are hard to trust. Verita makes its reasoning **transparent and demonstrable in real time.**

---

## 4. What Makes Verita Different

The feature that separates Verita from every generic medical chatbot is the **proactive question generator**.

Every other tool answers what you ask. Verita tells you **what you should be asking** — and most patients don't know.

After analyzing a document, Verita generates 5 clinically prioritized, plain-language questions specific to that report's findings. This closes the most dangerous gap in healthcare: the patient who walks out of an appointment not knowing what they didn't ask.

### Dual-Mode Architecture

The same information needs to be communicated completely differently depending on who is reading it. A hemoglobin value means something different to a worried first-time patient than it does to a GP reviewing a panel. Verita respects that distinction **at the prompt level**, not just the UI level.

### Tech Stack

| Layer | Technology |
|---|---|
| Backend | FastAPI (Python) |
| AI Model | Gemini 2.5 Flash |
| PDF Processing | Native Gemini Vision |
| Frontend | Google Antigravity |
| Deployment | Vercel |

---

> Built at hackathon — designed to win on real impact, ethical design, and demonstrable safety.