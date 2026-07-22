"""
FinanceAI Backend — main application entry point.
All financial endpoints auto-save results to the database when a
valid JWT is present. Unauthenticated calls still work (backward compat).
"""
import logging
import io
from typing import Optional

from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

from database import init_db, get_db, SessionLocal
from routers.auth_router    import router as auth_router
from routers.history_router import router as history_router
from routers.admin_router   import router as admin_router

from schemas.user_schema         import UserInput
from schemas.forecast_schema     import ForecastInput
from schemas.chat_schema         import ChatInput
from schemas.simulate_schema     import SimulateInput
from schemas.financial_twin_schema import FinancialTwinInput
from schemas.goal_schema         import GoalInput
from schemas.portfolio_schema    import PortfolioInput
from schemas.report_schema       import ReportRequest
from services.predictor          import predict_financial_score
from services.recommender        import generate_recommendations, generate_insights, generate_personalized_insights
from services.forecast           import forecast_savings
from services.chatbot            import generate_reply
from services.simulator          import calculate_future_value
from services.explainer          import generate_explanation
from services.financial_twin     import compute_financial_twin
from services.coach              import generate_coach_summary
from services.roadmap            import get_journey_level, generate_roadmap
from services.goal_planner       import calculate_goal
from services.portfolio          import generate_portfolio
from services.shap_explainer     import get_shap_values
from services.pdf_report         import generate_pdf_report
from services.gemini_service     import get_gemini_response, build_chat_prompt, is_gemini_available, get_gemini_init_error
from services.auth_service       import decode_token
from services.crud_service       import (
    save_analysis, save_chat_message, save_twin_run,
    save_goal, save_portfolio, save_report,
)

# ── App ───────────────────────────────────────────────────────────────────────
app = FastAPI(
    title="AI Financial Advisor API",
    description="Production-grade AI-powered financial decision platform",
    version="3.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(history_router)
app.include_router(admin_router)

@app.on_event("startup")
def startup_event():
    init_db()
    logger.info("All database tables initialized.")


# ── Helper: extract user_id from optional Bearer token ───────────────────────
_bearer = HTTPBearer(auto_error=False)

def _get_optional_user_id(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(_bearer),
) -> Optional[int]:
    """
    Returns user_id int if a valid JWT is present, else None.
    Never raises — financial endpoints still work without auth.
    """
    if not credentials:
        return None
    try:
        payload = decode_token(credentials.credentials)
        return int(payload["sub"])
    except Exception:
        return None


# ── Health ────────────────────────────────────────────────────────────────────
@app.get("/")
def home():
    return {"message": "FinanceAI API v3.0 is running"}


@app.get("/chat/status")
def chat_status():
    return {
        "gemini_available": is_gemini_available(),
        "gemini_error": get_gemini_init_error(),
        "active_engine": "groq" if is_gemini_available() else "rule-based fallback",
    }


# ── Analyze — auto-saves when user is authenticated ──────────────────────────
@app.post("/analyze")
def analyze_finance(
    data: UserInput,
    db: Session = Depends(get_db),
    user_id: Optional[int] = Depends(_get_optional_user_id),
):
    score                 = predict_financial_score(data)
    recommendations       = generate_recommendations(data, score)
    insights              = generate_insights(data, score)
    personalized_insights = generate_personalized_insights(data, score)
    explanation           = generate_explanation(data, score)
    coach_summary         = generate_coach_summary(data, score)
    journey               = get_journey_level(score)
    roadmap               = generate_roadmap(data, score)
    shap_data             = get_shap_values(data)

    result = {
        "financial_score":       score,
        "recommendations":       recommendations,
        "insights":              insights,
        "personalized_insights": personalized_insights,
        "explanation":           explanation,
        "coach_summary":         coach_summary,
        "journey":               journey,
        "roadmap":               roadmap,
        "shap":                  shap_data,
        "breakdown": {
            "income":   data.income,
            "expenses": data.expenses,
            "savings":  data.savings,
            "debt":     data.debt,
        },
    }

    # Auto-save when authenticated
    analysis_id = None
    if user_id:
        try:
            saved = save_analysis(db, user_id, data.model_dump(), result)
            analysis_id = saved.id
            logger.info("Analysis saved: id=%s user=%s score=%s", saved.id, user_id, score)
        except Exception as e:
            logger.warning("Failed to save analysis: %s", e)

    result["analysis_id"] = analysis_id
    return result


# ── Simulate ──────────────────────────────────────────────────────────────────
@app.post("/simulate")
def simulate(data: SimulateInput):
    result = calculate_future_value(data.monthly_investment, data.years, data.expected_return)
    return {"future_value": result}


# ── Forecast ──────────────────────────────────────────────────────────────────
@app.post("/forecast")
def forecast(data: ForecastInput):
    return {"forecast": forecast_savings(income=data.income, expenses=data.expenses, months=data.months)}


# ── Chat — saves both user message and bot reply ──────────────────────────────
@app.post("/chat")
def chat(
    data: ChatInput,
    db: Session = Depends(get_db),
    user_id: Optional[int] = Depends(_get_optional_user_id),
):
    prompt = build_chat_prompt(
        message=data.message,
        financial_score=data.financial_score,
        risk_tolerance=data.risk_tolerance,
        insights=data.insights,
        recommendations=data.recommendations,
        roadmap=data.roadmap,
    )

    reply = None
    source = "fallback"

    if is_gemini_available():
        try:
            reply  = get_gemini_response(prompt)
            source = "gemini"
        except Exception as e:
            logger.warning("Groq failed: %s", e)

    if reply is None:
        try:
            reply = generate_reply(
                message=data.message,
                risk_tolerance=data.risk_tolerance,
                financial_score=data.financial_score,
                insights=data.insights,
            )
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Chat failed: {e}")

    # Auto-save when authenticated
    if user_id:
        try:
            save_chat_message(db, user_id, "user", data.message, source="user")
            save_chat_message(db, user_id, "bot",  reply,        source=source)
        except Exception as e:
            logger.warning("Failed to save chat: %s", e)

    response = {"reply": reply, "source": source}
    if source == "fallback":
        response["note"] = "Using rule-based fallback. Set GROQ_API_KEY in backend/.env for AI responses."
    return response


# ── Financial Twin — auto-saves ───────────────────────────────────────────────
@app.post("/financial-twin")
def financial_twin(
    data: FinancialTwinInput,
    db: Session = Depends(get_db),
    user_id: Optional[int] = Depends(_get_optional_user_id),
):
    result = compute_financial_twin(
        income=data.income, expenses=data.expenses,
        savings=data.savings, debt=data.debt,
        risk_appetite=data.risk_appetite, sip_amount=data.sip_amount,
        scenario_type=data.scenario_type,
        scenario_parameters=data.scenario_parameters,
        annual_return=data.annual_return,
    )

    if user_id:
        try:
            save_twin_run(db, user_id, data.model_dump(), result)
        except Exception as e:
            logger.warning("Failed to save twin run: %s", e)

    return result


# ── Goal Planner — auto-saves ─────────────────────────────────────────────────
@app.post("/goal-planner")
def goal_planner(
    data: GoalInput,
    db: Session = Depends(get_db),
    user_id: Optional[int] = Depends(_get_optional_user_id),
):
    result = calculate_goal(
        goal_name=data.goal_name,
        target_amount=data.target_amount,
        years=data.years,
        annual_return=data.annual_return,
        current_savings=data.current_savings,
    )

    if user_id:
        try:
            save_goal(db, user_id, data.model_dump(), result)
        except Exception as e:
            logger.warning("Failed to save goal: %s", e)

    return result


# ── Portfolio — auto-saves ────────────────────────────────────────────────────
@app.post("/portfolio")
def portfolio(
    data: PortfolioInput,
    db: Session = Depends(get_db),
    user_id: Optional[int] = Depends(_get_optional_user_id),
):
    result = generate_portfolio(
        age=data.age,
        risk_appetite=data.risk_appetite,
        score=data.financial_score,
    )

    if user_id:
        try:
            save_portfolio(db, user_id, data.model_dump(), result)
        except Exception as e:
            logger.warning("Failed to save portfolio: %s", e)

    return result


# ── PDF Report — auto-saves metadata ─────────────────────────────────────────
@app.post("/report")
def download_report(
    data: ReportRequest,
    db: Session = Depends(get_db),
    user_id: Optional[int] = Depends(_get_optional_user_id),
):
    try:
        pdf_bytes = generate_pdf_report(data.model_dump())
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e))

    if user_id:
        try:
            save_report(db, user_id, data.model_dump())
        except Exception as e:
            logger.warning("Failed to save report: %s", e)

    return StreamingResponse(
        io.BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=FinanceAI_Report.pdf"},
    )
