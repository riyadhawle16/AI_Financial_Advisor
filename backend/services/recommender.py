LIFESTYLE_INFLATION_INCOME_THRESHOLD = 50_000
LIFESTYLE_INFLATION_SAVINGS_RATIO    = 0.1
DEBT_PRIORITY_MULTIPLIER             = 3
CRITICAL_OVERSPEND_RATIO             = 0.9
STRONG_POSITION_SAVINGS_RATIO        = 0.3
STRONG_POSITION_SCORE_THRESHOLD      = 70


# ── Investment vehicles per risk tier ─────────────────────────────────────────
_INVEST_ADVICE = {
    "low": {
        "primary":   "Invest in Fixed Deposits, PPF, or government bonds for capital protection.",
        "sip":       "Start a debt mutual fund SIP — stable 6-8% returns with low volatility.",
        "emergency": "Keep 6 months of expenses in a liquid fund or high-yield savings account.",
        "growth":    "Allocate up to 10% in Sovereign Gold Bonds for inflation hedging.",
        "advanced":  "Max out Section 80C through PPF and NSC for tax-efficient safe returns.",
    },
    "medium": {
        "primary":   "Invest via SIP in large-cap or flexi-cap mutual funds for balanced 10-12% returns.",
        "sip":       "Start a monthly SIP of at least 20% of your surplus — time in market beats timing.",
        "emergency": "Keep 3-6 months of expenses in a liquid fund before increasing equity exposure.",
        "growth":    "Allocate 60% equity / 30% debt / 10% gold for diversified growth.",
        "advanced":  "Use ELSS mutual funds to save taxes under Section 80C while building equity wealth.",
    },
    "high": {
        "primary":   "Invest aggressively in small/mid-cap equity funds and index funds for 14-18% long-term returns.",
        "sip":       "Run a step-up SIP — increase your monthly SIP amount by 10% every year.",
        "emergency": "Maintain a 2-3 month liquid buffer only — deploy maximum surplus into growth assets.",
        "growth":    "Allocate 80% equity (including international funds) / 10% gold / 10% liquid.",
        "advanced":  "Explore sectoral/thematic funds and direct equity after building a core index fund base.",
    },
}


def generate_recommendations(data, score: float) -> list[str]:
    recs  = []
    risk  = data.risk_tolerance
    adv   = _INVEST_ADVICE[risk]
    ratio = data.expenses / data.income if data.income > 0 else 0

    # 1. Financial health assessment — based on score, NOT risk
    if score < 40:
        recs.append("High financial risk detected: reduce expenses and build an emergency fund before investing.")
    elif score < 70:
        recs.append("Moderate financial health: increase your savings rate by at least 5% of income this month.")
    else:
        recs.append("Strong financial position: you are ready to deploy capital into growth investments.")

    # 2. Primary investment recommendation — fully driven by risk tolerance
    recs.append(adv["primary"])

    # 3. SIP / savings action — risk-stratified
    if data.savings < data.income * 0.1:
        recs.append(f"Your savings are critically low. {adv['emergency']}")
    elif score >= 40:
        recs.append(adv["sip"])

    # 4. Expense / debt or advanced investment tip — context + risk
    if data.debt > data.income * DEBT_PRIORITY_MULTIPLIER:
        recs.append("Your debt exceeds 3× monthly income — prioritize debt reduction using the avalanche method before any new investments.")
    elif ratio > 0.7:
        recs.append("Expenses exceed 70% of income. Cut discretionary spending to free up investable surplus.")
    else:
        recs.append(adv["advanced"])

    return recs


def generate_insights(data, score: float) -> list[str]:
    insights = []
    risk     = data.risk_tolerance
    ratio    = data.expenses / data.income if data.income > 0 else 0

    if ratio > 0.7:
        insights.append("Overspending detected: your expenses exceed 70% of income.")

    if data.savings < data.income * 0.2:
        insights.append("Low savings rate: you are saving less than 20% of income.")

    if data.debt > 0:
        insights.append("Debt present: prioritize high-interest debt reduction before increasing investment exposure.")

    # Risk-stratified health insight
    if score < 40:
        insights.append(f"Financial health is low ({risk} risk profile): stabilize cash flow before any investment.")
    elif score < 70:
        if risk == "low":
            insights.append("Moderate health with low risk tolerance: focus on safe savings instruments and steady debt reduction.")
        elif risk == "medium":
            insights.append("Moderate health with balanced risk: start a SIP now and increase savings rate gradually.")
        else:
            insights.append("Moderate health but high risk tolerance: build an emergency fund first, then deploy aggressively into equity.")
    else:
        if risk == "low":
            insights.append("Strong financial health with conservative risk: maximize PPF, bonds, and tax-saving fixed deposits.")
        elif risk == "medium":
            insights.append("Strong financial health with balanced risk: diversify across equity and debt mutual funds.")
        else:
            insights.append("Strong financial health with high risk tolerance: deploy maximum surplus into equity, index funds, and sectoral bets.")

    return insights


def generate_personalized_insights(data, score: float) -> list[str]:
    insights = []
    risk     = data.risk_tolerance

    if data.income == 0:
        return insights

    if data.income > LIFESTYLE_INFLATION_INCOME_THRESHOLD and data.savings / data.income < LIFESTYLE_INFLATION_SAVINGS_RATIO:
        insights.append("Lifestyle inflation detected: high income but very low savings rate. Automate savings on salary day.")

    if data.debt > data.income * DEBT_PRIORITY_MULTIPLIER:
        insights.append("Debt reduction priority: use the avalanche method — pay minimums everywhere, then target highest-interest debt first.")

    if data.expenses / data.income >= CRITICAL_OVERSPEND_RATIO:
        insights.append("Critical overspending: 90%+ of income going to expenses leaves no room for wealth building.")

    if data.savings / data.income >= STRONG_POSITION_SAVINGS_RATIO and score >= STRONG_POSITION_SCORE_THRESHOLD:
        if risk == "low":
            insights.append("Strong position with conservative profile: consider laddering Fixed Deposits and maximizing PPF contribution.")
        elif risk == "medium":
            insights.append("Strong position with balanced risk: increase SIP amounts and review portfolio rebalancing annually.")
        else:
            insights.append("Strong position with high risk tolerance: consider direct equity and international fund exposure for accelerated wealth creation.")

    return insights
