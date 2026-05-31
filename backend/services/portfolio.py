"""AI Portfolio Generator — generates allocation based on age, risk, and score."""
from __future__ import annotations


PORTFOLIOS = {
    "low": {
        "allocations": [
            {"asset": "Debt Mutual Funds", "pct": 35, "color": "#3B82F6", "reason": "Stable returns with low risk"},
            {"asset": "Fixed Deposits",    "pct": 30, "color": "#06B6D4", "reason": "Capital protection with guaranteed returns"},
            {"asset": "PPF / NSC",         "pct": 20, "color": "#8B5CF6", "reason": "Tax-saving with government backing"},
            {"asset": "Gold / SGB",        "pct": 10, "color": "#F59E0B", "reason": "Inflation hedge and diversification"},
            {"asset": "Liquid Fund",       "pct": 5,  "color": "#10B981", "reason": "Emergency liquidity buffer"},
        ],
        "expected_return": "6-8%",
        "risk_label": "Conservative",
        "summary": "Capital preservation focused. Suitable for short-term goals and risk-averse investors.",
    },
    "medium": {
        "allocations": [
            {"asset": "Large-Cap Equity",  "pct": 30, "color": "#3B82F6", "reason": "Stable equity growth from blue-chip companies"},
            {"asset": "Flexi-Cap SIP",     "pct": 20, "color": "#06B6D4", "reason": "Diversified equity exposure across market caps"},
            {"asset": "Debt Mutual Funds", "pct": 25, "color": "#8B5CF6", "reason": "Balances portfolio volatility"},
            {"asset": "Gold / SGB",        "pct": 15, "color": "#F59E0B", "reason": "Hedge against market downturns"},
            {"asset": "Liquid Fund",       "pct": 10, "color": "#10B981", "reason": "Emergency and short-term needs"},
        ],
        "expected_return": "10-12%",
        "risk_label": "Balanced",
        "summary": "Balanced growth and stability. Ideal for 5-10 year investment horizons.",
    },
    "high": {
        "allocations": [
            {"asset": "Small/Mid-Cap Equity", "pct": 35, "color": "#3B82F6", "reason": "High growth potential over long term"},
            {"asset": "Index Funds (Nifty)",  "pct": 25, "color": "#06B6D4", "reason": "Low-cost market returns"},
            {"asset": "International Equity", "pct": 15, "color": "#8B5CF6", "reason": "Global diversification"},
            {"asset": "Sectoral Funds",       "pct": 15, "color": "#F59E0B", "reason": "Concentrated bets on high-growth sectors"},
            {"asset": "Cash / Liquid",        "pct": 10, "color": "#10B981", "reason": "Tactical rebalancing buffer"},
        ],
        "expected_return": "14-18%",
        "risk_label": "Aggressive",
        "summary": "Maximum growth focus. Suitable for 10+ year horizons with high volatility tolerance.",
    },
}


def generate_portfolio(age: int, risk_appetite: str, score: float) -> dict:
    # Adjust risk based on age (older = more conservative)
    effective_risk = risk_appetite
    if age > 50 and risk_appetite == "high":
        effective_risk = "medium"
    elif age > 60:
        effective_risk = "low"

    portfolio = PORTFOLIOS[effective_risk]

    # Score-based note
    if score < 40:
        note = "Build an emergency fund and clear high-interest debt before investing."
    elif score < 70:
        note = "Start with SIP investments while continuing to improve your savings rate."
    else:
        note = "You are ready for full portfolio deployment. Review and rebalance annually."

    return {
        "age": age,
        "risk_appetite": risk_appetite,
        "effective_risk": effective_risk,
        "score": score,
        "allocations": portfolio["allocations"],
        "expected_return": portfolio["expected_return"],
        "risk_label": portfolio["risk_label"],
        "summary": portfolio["summary"],
        "action_note": note,
    }
