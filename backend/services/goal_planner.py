"""Goal Planner — calculates required SIP and corpus for financial goals."""
from __future__ import annotations
import math


def calculate_goal(
    goal_name: str,
    target_amount: float,
    years: int,
    annual_return: float,
    current_savings: float = 0.0,
) -> dict:
    r = annual_return / 100 / 12
    n = years * 12

    # Future value of current savings
    fv_current = current_savings * ((1 + r) ** n) if r > 0 else current_savings

    # Remaining amount needed
    remaining = max(target_amount - fv_current, 0)

    # Required monthly SIP
    if r > 0 and remaining > 0:
        required_sip = remaining * r / (((1 + r) ** n) - 1)
    elif remaining > 0:
        required_sip = remaining / n
    else:
        required_sip = 0.0

    # Total invested via SIP
    total_sip_invested = required_sip * n

    # Corpus breakdown
    corpus_from_sip = target_amount - fv_current if fv_current < target_amount else 0
    wealth_gain = max(target_amount - total_sip_invested - current_savings, 0)

    # Monthly timeline for chart (every 12 months)
    timeline = []
    for month in range(12, n + 1, 12):
        fv_sip = required_sip * (((1 + r) ** month - 1) / r) if r > 0 else required_sip * month
        fv_savings = current_savings * ((1 + r) ** month) if r > 0 else current_savings
        timeline.append({
            "year": month // 12,
            "corpus": round(fv_sip + fv_savings, 2),
        })

    return {
        "goal_name": goal_name,
        "target_amount": round(target_amount, 2),
        "years": years,
        "annual_return": annual_return,
        "required_monthly_sip": round(required_sip, 2),
        "required_annual_investment": round(required_sip * 12, 2),
        "total_invested": round(total_sip_invested + current_savings, 2),
        "projected_corpus": round(target_amount, 2),
        "wealth_gain": round(wealth_gain, 2),
        "timeline": timeline,
    }
