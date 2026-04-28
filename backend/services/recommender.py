LIFESTYLE_INFLATION_INCOME_THRESHOLD = 50_000
LIFESTYLE_INFLATION_SAVINGS_RATIO = 0.1
DEBT_PRIORITY_MULTIPLIER = 3
CRITICAL_OVERSPEND_RATIO = 0.9
STRONG_POSITION_SAVINGS_RATIO = 0.3
STRONG_POSITION_SCORE_THRESHOLD = 70


def generate_recommendations(data, score):

    recommendations = []

    # Financial health advice
    if score < 40:
        recommendations.append("You are at high financial risk. Reduce expenses immediately.")
    elif score < 70:
        recommendations.append("You have moderate financial health. Increase savings rate.")
    else:
        recommendations.append("You are financially stable. Focus on growing investments.")

    # Risk-based investment advice
    if data.risk_tolerance == "low":
        recommendations.append("Invest in fixed deposits or bonds.")
    elif data.risk_tolerance == "medium":
        recommendations.append("Invest in mutual funds (SIP recommended).")
    elif data.risk_tolerance == "high":
        recommendations.append("Consider stocks or high-growth assets.")

    # Smart insight
    if data.expenses > data.income * 0.7:
        recommendations.append("Your expenses exceed 70% of income. Optimize spending.")

    return recommendations


def generate_insights(data, score):
    """
    Lightweight, explainable rules-based insights.
    Keeps outputs stable and debuggable for a product demo.
    """
    insights = []

    # Differentiator rules requested
    if data.expenses > data.income * 0.7:
        insights.append("Overspending detected: your expenses are over 70% of income.")

    if data.savings < data.income * 0.2:
        insights.append("Low savings rate: your savings are under 20% of income.")

    # Extra helpful signals
    if data.debt > 0:
        insights.append("Debt present: prioritize high-interest debt reduction and build an emergency fund.")

    if score < 40:
        insights.append("Financial health is low: focus on expense control and building liquidity first.")
    elif score < 70:
        insights.append("Financial health is moderate: increase savings rate and invest gradually based on risk.")
    else:
        insights.append("Financial health is strong: consider diversified growth investments for long-term goals.")

    return insights


def generate_personalized_insights(data, score: float) -> list[str]:
    """
    Generate personalized financial insights based on user data and health score.
    Returns a list of insight strings (may be empty).
    """
    insights = []

    if data.income == 0:
        return insights

    # Lifestyle inflation: earning well but saving very little
    if data.income > LIFESTYLE_INFLATION_INCOME_THRESHOLD and data.savings / data.income < LIFESTYLE_INFLATION_SAVINGS_RATIO:
        insights.append("Lifestyle inflation detected: you are earning well but saving very little")

    # Debt reduction priority: debt exceeds 3x income
    if data.debt > data.income * DEBT_PRIORITY_MULTIPLIER:
        insights.append("Debt reduction priority: focus on reducing debt before investing")

    # Critical overspending: expenses >= 90% of income
    if data.expenses / data.income >= CRITICAL_OVERSPEND_RATIO:
        insights.append("Critical overspending: expenses are consuming 90% or more of income")

    # Strong financial position: savings >= 30% of income and score >= 70
    if data.savings / data.income >= STRONG_POSITION_SAVINGS_RATIO and score >= STRONG_POSITION_SCORE_THRESHOLD:
        insights.append("Strong financial position: consider diversified long-term investments")

    return insights
