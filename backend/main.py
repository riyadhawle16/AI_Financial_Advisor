from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
import io

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

app = FastAPI(
    title="AI Financial Advisor API",
    description="Backend for AI-powered financial decision system",
    version="2.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def home():
    return {"message": "FinanceAI API v2.0 is running"}


# ── Core analyze endpoint (extended) ─────────────────────────────────────────
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


# ── Existing endpoints ────────────────────────────────────────────────────────
@app.post("/simulate")
def simulate(data: SimulateInput):
    result = calculate_future_value(data.monthly_investment, data.years, data.expected_return)
    return {"future_value": result}


@app.post("/forecast")
def forecast(data: ForecastInput):
    return {"forecast": forecast_savings(income=data.income, expenses=data.expenses, months=data.months)}


@app.post("/chat")
def chat(data: ChatInput):
    reply = generate_reply(
        message=data.message,
        risk_tolerance=data.risk_tolerance,
        financial_score=data.financial_score,
        insights=data.insights,
    )
    return {"reply": reply}


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


# ── New v2 endpoints ──────────────────────────────────────────────────────────
@app.post("/goal-planner")
def goal_planner(data: GoalInput):
    return calculate_goal(
        goal_name=data.goal_name,
        target_amount=data.target_amount,
        years=data.years,
        annual_return=data.annual_return,
        current_savings=data.current_savings,
    )


@app.post("/portfolio")
def portfolio(data: PortfolioInput):
    return generate_portfolio(
        age=data.age,
        risk_appetite=data.risk_appetite,
        score=data.financial_score,
    )


@app.post("/report")
def download_report(data: ReportRequest):
    try:
        pdf_bytes = generate_pdf_report(data.model_dump())
        return StreamingResponse(
            io.BytesIO(pdf_bytes),
            media_type="application/pdf",
            headers={"Content-Disposition": "attachment; filename=FinanceAI_Report.pdf"}
        )
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e))
