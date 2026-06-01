"""
AI Chatbot Service — powered by Groq (llama-3.3-70b-versatile)
Falls back gracefully to rule-based chatbot if Groq is unavailable.
"""

import os
import logging
from pathlib import Path
from dotenv import load_dotenv

logger = logging.getLogger(__name__)

# Load .env from backend/ regardless of where uvicorn is launched from
_env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(dotenv_path=_env_path, override=True)

_api_key = os.getenv("GROQ_API_KEY")

# ── Financial Advisor system prompt ──────────────────────────────────────────
SYSTEM_PROMPT = """You are FinanceAI Copilot, a friendly and knowledgeable AI Financial Advisor.

Your personality:
- Warm, encouraging, and easy to understand — especially for college students and young adults
- Use simple language; explain financial terms when you use them
- Be concise but complete — give actionable advice, not vague suggestions
- Always be honest about risk and uncertainty

Your expertise covers:
- Budgeting and expense management
- Emergency funds and savings strategies
- SIP (Systematic Investment Plans) and mutual funds
- Stocks, index funds, ETFs
- Debt repayment strategies (avalanche, snowball)
- Tax saving (80C, ELSS, NPS, PPF)
- Retirement planning
- Goal-based investing
- Portfolio allocation by risk profile

Rules:
- ONLY answer finance-related questions
- If asked about non-financial topics (sports, entertainment, politics, etc.), politely decline:
  "I'm specialized in personal finance and can't help with that. Ask me anything about money, investing, or budgeting!"
- Never guarantee specific returns
- Keep responses under 300 words unless a detailed plan is explicitly requested
"""

# ── Initialize Groq client ────────────────────────────────────────────────────
_groq_client = None
_groq_available = False
_groq_init_error = None
_model = "llama-3.3-70b-versatile"

if _api_key and _api_key not in ("YOUR_REAL_GROQ_API_KEY_HERE", ""):
    try:
        from groq import Groq
        _groq_client = Groq(api_key=_api_key)
        # Quick connectivity probe
        _probe = _groq_client.chat.completions.create(
            model=_model,
            messages=[{"role": "user", "content": "Reply with the single word: ready"}],
            max_tokens=5,
        )
        if _probe.choices[0].message.content:
            _groq_available = True
            logger.info("Groq initialized successfully. Model: %s", _model)
    except Exception as e:
        _groq_init_error = str(e)
        logger.warning("Groq initialization failed: %s", _groq_init_error)
else:
    _groq_init_error = (
        "GROQ_API_KEY is missing or placeholder. "
        "Get a free key at https://console.groq.com and set it in backend/.env"
    )
    logger.warning(_groq_init_error)


def is_gemini_available() -> bool:
    """Returns True if the AI backend (Groq) is ready."""
    return _groq_available


def get_gemini_init_error() -> str | None:
    """Returns the init error message if Groq failed to start."""
    return _groq_init_error


def get_gemini_response(prompt: str) -> str:
    """
    Send a prompt to Groq and return the response text.
    Raises RuntimeError if Groq is not available.
    """
    if not _groq_available or _groq_client is None:
        raise RuntimeError(
            f"Groq is not available. {_groq_init_error or 'Unknown error.'}"
        )

    response = _groq_client.chat.completions.create(
        model=_model,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": prompt},
        ],
        temperature=0.7,
        max_tokens=600,
    )
    return response.choices[0].message.content


def build_chat_prompt(
    message: str,
    financial_score: float | None = None,
    risk_tolerance: str | None = None,
    insights: list[str] | None = None,
    recommendations: list[str] | None = None,
    roadmap: list | None = None,
) -> str:
    """Build a context-rich prompt for the financial copilot."""
    context_parts = []

    if financial_score is not None:
        level = "strong" if financial_score >= 70 else "moderate" if financial_score >= 40 else "needs improvement"
        context_parts.append(f"- Financial Health Score: {financial_score}/100 ({level})")

    if risk_tolerance:
        context_parts.append(f"- Risk Tolerance: {risk_tolerance.capitalize()}")

    if insights:
        context_parts.append("- Key Insights: " + "; ".join(insights[:3]))

    if recommendations:
        context_parts.append("- Recommendations: " + "; ".join(recommendations[:3]))

    if roadmap:
        try:
            steps = (
                [str(r.get("step", r)) for r in roadmap[:3]]
                if isinstance(roadmap[0], dict)
                else [str(r) for r in roadmap[:3]]
            )
            context_parts.append("- Roadmap: " + "; ".join(steps))
        except Exception:
            pass

    context_block = ""
    if context_parts:
        context_block = "User's Financial Context:\n" + "\n".join(context_parts) + "\n\n"

    return f"{context_block}User Question: {message}"
