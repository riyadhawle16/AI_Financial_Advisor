import logging
import io
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

try:
    from .schemas.user_schema import UserInput
    from .schemas.forecast_schema import ForecastInput
    from .schemas.chat_schema import ChatInput
    from .schemas.simulate_schema import SimulateInput
    from .schemas.financial_twin_schema import FinancialTwinInput
    from .schemas.goal_schema import GoalInput
    from .schemas.portfolio_schema import PortfolioInput
    from .schemas.report_schema import ReportRequest
    from .services.predictor import predict_financial_score
    from .services.recommender import generate_recommendations, generate_insights, generate_personalized_insights
    from .services.forecast import forecast_savings
    from .services.chatbot import generate_reply
    from .services.simulator import calculate_future_value
    from .services.explainer import generate_explanation
    from .services.financial_twin import compute_financial_twin
    from .services.coach import generate_coach_summary
    from .services.roadmap import get_journey_level, generate_roadmap
    from .services.goal_planner import calculate_goal
    from .services.portfolio import generate_portfolio
    from .services.shap_explainer import get_shap_values
    from .services.pdf_report import generate_pdf_report
    from .services.gemini_service import (
        get_gemini_response,
        build_chat_prompt,
        is_gemini_available,
        get_gemini_init_error,
    )

except ImportError:
    from schemas.user_schema import UserInput
    from schemas.forecast_schema import ForecastInput
    from schemas.chat_schema import ChatInput
    from schemas.simulate_schema import SimulateInput
    from schemas.financial_twin_schema import FinancialTwinInput
    from schemas.goal_schema import GoalInput
    from schemas.portfolio_schema import PortfolioInput
    from schemas.report_schema import ReportRequest
    from services.predictor import predict_financial_score
    from services.recommender import generate_recommendations, generate_insights, generate_personalized_insights
    from services.forecast import forecast_savings
    from services.chatbot import generate_reply
    from services.simulator import calculate_future_value
    from services.explainer import generate_explanation
    from services.financial_twin import compute_financial_twin
    from services.coach import generate_coach_summary
    from services.roadmap import get_journey_level, generate_roadmap
    from services.goal_planner import calculate_goal
    from services.portfolio import generate_portfolio
    from services.shap_explainer import get_shap_values
    from services.pdf_report import generate_pdf_report
    from services.gemini_service import (
        get_gemini_response,
        build_chat_prompt,
        is_gemini_available,
        get_gemini_init_error,
    )

app = FastAPI(
    title="AI Financial Advisor API",
    description="Backend for AI-powered financial decision system",
    version="2.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Health / root ─────────────────────────────────────────────────────────────
@app.get("/")
def home():
    return {"message": "FinanceAI API v2.0 is running"}


@app.get("/chat/status")
def chat_status():
    """Diagnostic endpoint — shows whether Gemini is active."""
    return {
        "gemini_available": is_gemini_available(),
        "gemini_error": get_gemini_init_error(),
        "active_engine": "gemini" if is_gemini_available() else "rule-based fallback",
    }


# ── Core analyze endpoint ─────────────────────────────────────────────────────
@app.post("/analyze")
def analyze_finance(data: UserInput):
    score = predict_financial_score(data)
    recommendations = generate_recommendations(data, score)
    insights = generate_insights(data, score)
    personalized_insights = generate_personalized_insights(data, score)
    explanation = generate_explanation(data, score)
    coach_summary = generate_coach_summary(data, score)
    journey = get_journey_level(score)
    roadmap = generate_roadmap(data, score)
    shap_data = get_shap_values(data)
    return {
        "financial_score": score,
        "recommendations": recommendations,
        "insights": insights,
        "personalized_insights": personalized_insights,
        "explanation": explanation,
        "coach_summary": coach_summary,
        "journey": journey,
        "roadmap": roadmap,
        "shap": shap_data,
        "breakdown": {
            "income": data.income,
            "expenses": data.expenses,
            "savings": data.savings,
            "debt": data.debt,
        },
    }


# ── Simulate / Forecast ───────────────────────────────────────────────────────
@app.post("/simulate")
def simulate(data: SimulateInput):
    result = calculate_future_value(data.monthly_investment, data.years, data.expected_return)
    return {"future_value": result}


@app.post("/forecast")
def forecast(data: ForecastInput):
    return {"forecast": forecast_savings(income=data.income, expenses=data.expenses, months=data.months)}


# ── Chat (Gemini primary, rule-based fallback) ────────────────────────────────
@app.post("/chat")
def chat(data: ChatInput):
    # Build context-rich prompt
    prompt = build_chat_prompt(
        message=data.message,
        financial_score=data.financial_score,
        risk_tolerance=data.risk_tolerance,
        insights=data.insights,
        recommendations=data.recommendations,
        roadmap=data.roadmap,
    )

    # ── Primary: Gemini ───────────────────────────────────────────────────────
    if is_gemini_available():
        try:
            reply = get_gemini_response(prompt)
            logger.info("Chat served by Gemini.")
            return {"reply": reply, "source": "gemini"}
        except Exception as gemini_error:
            logger.warning("Gemini call failed at runtime: %s", gemini_error)
            # fall through to rule-based fallback
    else:
        logger.info(
            "Gemini unavailable (%s). Using rule-based fallback.",
            get_gemini_init_error(),
        )

    # ── Fallback: rule-based chatbot ──────────────────────────────────────────
    try:
        reply = generate_reply(
            message=data.message,
            risk_tolerance=data.risk_tolerance,
            financial_score=data.financial_score,
            insights=data.insights,
        )
        return {
            "reply": reply,
            "source": "fallback",
            "note": (
                "Gemini is not available. "
                "Set a valid GEMINI_API_KEY in backend/.env to enable AI responses. "
                "Get one free at https://aistudio.google.com/app/apikey"
            ),
        }
    except Exception as fallback_error:
        raise HTTPException(
            status_code=500,
            detail=f"Both Gemini and fallback chatbot failed. Error: {fallback_error}",
        )


# ── Financial Twin ────────────────────────────────────────────────────────────
@app.post("/financial-twin")
def financial_twin(data: FinancialTwinInput):
    return compute_financial_twin(
        income=data.income, expenses=data.expenses,
        savings=data.savings, debt=data.debt,
        risk_appetite=data.risk_appetite, sip_amount=data.sip_amount,
        scenario_type=data.scenario_type,
        scenario_parameters=data.scenario_parameters,
        annual_return=data.annual_return,
    )


# ── Goal Planner ──────────────────────────────────────────────────────────────
@app.post("/goal-planner")
def goal_planner(data: GoalInput):
    return calculate_goal(
        goal_name=data.goal_name,
        target_amount=data.target_amount,
        years=data.years,
        annual_return=data.annual_return,
        current_savings=data.current_savings,
    )


# ── Portfolio ─────────────────────────────────────────────────────────────────
@app.post("/portfolio")
def portfolio(data: PortfolioInput):
    return generate_portfolio(
        age=data.age,
        risk_appetite=data.risk_appetite,
        score=data.financial_score,
    )


# ── PDF Report ────────────────────────────────────────────────────────────────
@app.post("/report")
def download_report(data: ReportRequest):
    try:
        pdf_bytes = generate_pdf_report(data.model_dump())
        return StreamingResponse(
            io.BytesIO(pdf_bytes),
            media_type="application/pdf",
            headers={"Content-Disposition": "attachment; filename=FinanceAI_Report.pdf"},
        )
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e))
