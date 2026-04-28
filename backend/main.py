from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

try:
    from .schemas.user_schema import UserInput
    from .schemas.forecast_schema import ForecastInput
    from .schemas.chat_schema import ChatInput
    from .schemas.simulate_schema import SimulateInput
    from .schemas.financial_twin_schema import FinancialTwinInput
    from .services.predictor import predict_financial_score
    from .services.recommender import (
        generate_recommendations,
        generate_insights,
        generate_personalized_insights,
    )
    from .services.forecast import forecast_savings
    from .services.chatbot import generate_reply
    from .services.simulator import calculate_future_value
    from .services.explainer import generate_explanation
    from .services.financial_twin import compute_financial_twin
except ImportError:
    from schemas.user_schema import UserInput
    from schemas.forecast_schema import ForecastInput
    from schemas.chat_schema import ChatInput
    from schemas.simulate_schema import SimulateInput
    from schemas.financial_twin_schema import FinancialTwinInput
    from services.predictor import predict_financial_score
    from services.recommender import (
        generate_recommendations,
        generate_insights,
        generate_personalized_insights,
    )
    from services.forecast import forecast_savings
    from services.chatbot import generate_reply
    from services.simulator import calculate_future_value
    from services.explainer import generate_explanation
    from services.financial_twin import compute_financial_twin

app = FastAPI(
    title="AI Financial Advisor API",
    description="Backend for AI-powered financial decision system",
    version="1.0"
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
    return {"message": "API is running successfully"}


@app.post("/analyze")
def analyze_finance(data: UserInput):
    score = predict_financial_score(data)
    recommendations = generate_recommendations(data, score)
    insights = generate_insights(data, score)
    personalized_insights = generate_personalized_insights(data, score)
    explanation = generate_explanation(data, score)
    return {
        "financial_score": score,
        "recommendations": recommendations,
        "insights": insights,
        "personalized_insights": personalized_insights,
        "explanation": explanation,
        "breakdown": {
            "income": data.income,
            "expenses": data.expenses,
            "savings": data.savings,
            "debt": data.debt,
        },
    }


@app.post("/simulate")
def simulate(data: SimulateInput):
    result = calculate_future_value(data.monthly_investment, data.years, data.expected_return)
    return {"future_value": result}


@app.post("/forecast")
def forecast(data: ForecastInput):
    forecast_vals = forecast_savings(
        income=data.income,
        expenses=data.expenses,
        months=data.months,
    )
    return {"forecast": forecast_vals}


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
    result = compute_financial_twin(
        income=data.income,
        expenses=data.expenses,
        savings=data.savings,
        debt=data.debt,
        risk_appetite=data.risk_appetite,
        sip_amount=data.sip_amount,
        scenario_type=data.scenario_type,
        scenario_parameters=data.scenario_parameters,
        annual_return=data.annual_return,
    )
    return result
