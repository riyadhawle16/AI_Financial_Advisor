"""Financial Journey Level + Roadmap milestones."""
from __future__ import annotations


JOURNEY_LEVELS = [
    {"min": 0,  "max": 30,  "level": "Financial Beginner",  "icon": "🌱", "color": "#EF4444"},
    {"min": 31, "max": 60,  "level": "Growing Investor",    "icon": "📈", "color": "#F59E0B"},
    {"min": 61, "max": 80,  "level": "Wealth Builder",      "icon": "💎", "color": "#3B82F6"},
    {"min": 81, "max": 100, "level": "Financial Freedom",   "icon": "🏆", "color": "#10B981"},
]


def get_journey_level(score: float) -> dict:
    for lvl in JOURNEY_LEVELS:
        if lvl["min"] <= score <= lvl["max"]:
            return {
                "level": lvl["level"],
                "icon": lvl["icon"],
                "color": lvl["color"],
                "score": score,
                "all_levels": [l["level"] for l in JOURNEY_LEVELS],
                "current_index": JOURNEY_LEVELS.index(lvl),
                "progress_pct": round((score / 100) * 100, 1),
            }
    return get_journey_level(min(max(score, 0), 100))


def generate_roadmap(data, score: float) -> list[dict]:
    """Generate milestone steps to reach the next score thresholds."""
    income, expenses, savings, debt = data.income, data.expenses, data.savings, data.debt
    milestones = []

    # Milestone targets
    targets = [t for t in [30, 50, 60, 70, 80, 90] if t > score][:3]

    for target in targets:
        gap = target - score
        steps = []

        if debt > 0:
            debt_reduction = round(debt * (gap / 100) * 2)
            steps.append(f"Reduce debt by ₹{debt_reduction:,.0f}")

        savings_increase = round(income * 0.05)
        steps.append(f"Increase monthly savings by ₹{savings_increase:,.0f}")

        if expenses / income > 0.6:
            expense_cut = round(expenses * 0.05)
            steps.append(f"Cut monthly expenses by ₹{expense_cut:,.0f}")

        if target >= 70:
            sip = round(income * 0.1)
            steps.append(f"Start SIP of ₹{sip:,.0f}/month in mutual funds")

        milestones.append({
            "target_score": target,
            "current_score": round(score, 1),
            "gap": round(gap, 1),
            "steps": steps[:3],
        })

    return milestones
