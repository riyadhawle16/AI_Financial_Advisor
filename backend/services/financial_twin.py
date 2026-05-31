"""
Financial Twin / What-If Sandbox
Computes baseline + scenario projections for side-by-side comparison.
"""
from __future__ import annotations
import math


# ── helpers ──────────────────────────────────────────────────────────────────

def _sip_fv(monthly: float, years: int, annual_rate: float) -> float:
    """Standard SIP future-value formula."""
    if monthly <= 0:
        return 0.0
    if annual_rate <= 0:
        return round(monthly * years * 12, 2)
    r = annual_rate / 100 / 12
    n = years * 12
    return round(monthly * (((1 + r) ** n - 1) / r), 2)


def _inflation_adjusted(nominal: float, years: int, inflation_pct: float) -> float:
    """Real value after inflation erosion."""
    if inflation_pct <= 0:
        return round(nominal, 2)
    return round(nominal / ((1 + inflation_pct / 100) ** years), 2)


def _monthly_surplus(income: float, expenses: float) -> float:
    return max(income - expenses, 0.0)


def _score_estimate(income: float, expenses: float, savings: float, debt: float) -> float:
    """Lightweight score proxy matching the training formula."""
    if income <= 0:
        return 0.0
    savings_score = (savings / income) * 100
    expense_ratio = expenses / income
    expense_score = max(0.0, (1 - expense_ratio) * 100)
    debt_ratio = debt / income
    debt_score = max(0.0, 100 - debt_ratio * 50)
    raw = savings_score * 0.4 + expense_score * 0.35 + debt_score * 0.25
    return round(max(0.0, min(100.0, raw)), 1)


def _timeline_series(monthly: float, annual_rate: float, checkpoints: list[int]) -> list[float]:
    return [_sip_fv(monthly, y, annual_rate) for y in checkpoints]


# ── main function ─────────────────────────────────────────────────────────────

CHECKPOINTS = [1, 5, 10, 20]   # years for timeline slider


def compute_financial_twin(
    income: float,
    expenses: float,
    savings: float,
    debt: float,
    risk_appetite: str,
    sip_amount: float,
    scenario_type: str,          # "expense_reduction" | "sip_growth" | "inflation_stress"
    scenario_parameters: dict,
    annual_return: float = 12.0,
) -> dict:

    surplus = _monthly_surplus(income, expenses)
    baseline_score = _score_estimate(income, expenses, savings, debt)

    # ── SCENARIO 1: Expense Reduction ────────────────────────────────────────
    if scenario_type == "expense_reduction":
        reductions = scenario_parameters.get("reductions", [5, 10, 15, 20])
        years = int(scenario_parameters.get("years", 5))

        baseline_surplus = surplus
        baseline_6m = round(surplus * 6, 2)
        baseline_5y = _sip_fv(surplus, 5, annual_return)
        baseline_proj = {
            "label": "Current",
            "reduction_pct": 0,
            "new_expenses": round(expenses, 2),
            "monthly_surplus": round(baseline_surplus, 2),
            "savings_6m": baseline_6m,
            "savings_5y": baseline_5y,
            "score_estimate": baseline_score,
            "timeline": _timeline_series(baseline_surplus, annual_return, CHECKPOINTS),
        }

        scenarios = []
        for pct in reductions:
            new_exp = expenses * (1 - pct / 100)
            new_surplus = _monthly_surplus(income, new_exp)
            freed = new_surplus - baseline_surplus
            new_sav = savings + freed
            new_score = _score_estimate(income, new_exp, new_sav, debt)
            scenarios.append({
                "label": f"-{pct}% Expenses",
                "reduction_pct": pct,
                "new_expenses": round(new_exp, 2),
                "monthly_surplus": round(new_surplus, 2),
                "savings_6m": round(new_surplus * 6, 2),
                "savings_5y": _sip_fv(new_surplus, 5, annual_return),
                "score_estimate": new_score,
                "timeline": _timeline_series(new_surplus, annual_return, CHECKPOINTS),
            })

        # best = highest score
        best = max(scenarios, key=lambda s: s["score_estimate"])
        recommendation = (
            f"Reducing expenses by {best['reduction_pct']}% gives the strongest outcome. "
            f"Your monthly surplus rises to ₹{best['monthly_surplus']:,.0f}, "
            f"projected 5-year corpus: ₹{best['savings_5y']:,.0f}, "
            f"estimated score: {best['score_estimate']}."
        )

        return {
            "scenario_type": "expense_reduction",
            "baseline": baseline_proj,
            "scenarios": scenarios,
            "checkpoints": CHECKPOINTS,
            "recommended_scenario": best["label"],
            "recommendation_text": recommendation,
        }

    # ── SCENARIO 2: SIP Growth ───────────────────────────────────────────────
    elif scenario_type == "sip_growth":
        sip_options = scenario_parameters.get(
            "sip_options",
            [sip_amount, sip_amount * 2, sip_amount * 3]
        )
        years = int(scenario_parameters.get("years", 10))
        labels = scenario_parameters.get(
            "labels",
            ["Current SIP", "2× SIP", "3× SIP"]
        )

        projections = []
        for i, sip in enumerate(sip_options):
            label = labels[i] if i < len(labels) else f"SIP ₹{sip:,.0f}"
            fv = _sip_fv(sip, years, annual_return)
            projections.append({
                "label": label,
                "sip_amount": round(sip, 2),
                "future_value": fv,
                "total_invested": round(sip * years * 12, 2),
                "wealth_gain": round(fv - sip * years * 12, 2),
                "timeline": _timeline_series(sip, annual_return, CHECKPOINTS),
            })

        best = max(projections, key=lambda p: p["future_value"])
        baseline_proj = projections[0]
        recommendation = (
            f"Increasing SIP to ₹{best['sip_amount']:,.0f}/month ({best['label']}) "
            f"grows your corpus to ₹{best['future_value']:,.0f} over {years} years — "
            f"a wealth gain of ₹{best['wealth_gain']:,.0f} vs ₹{baseline_proj['wealth_gain']:,.0f} at current SIP."
        )

        return {
            "scenario_type": "sip_growth",
            "projections": projections,
            "checkpoints": CHECKPOINTS,
            "years": years,
            "annual_return": annual_return,
            "recommended_scenario": best["label"],
            "recommendation_text": recommendation,
        }

    # ── SCENARIO 3: Inflation Stress ─────────────────────────────────────────
    elif scenario_type == "inflation_stress":
        inflation_rates = scenario_parameters.get("inflation_rates", [4, 6, 8])
        years = int(scenario_parameters.get("years", 10))
        nominal_fv = _sip_fv(sip_amount, years, annual_return)

        results = []
        for inf in inflation_rates:
            real_fv = _inflation_adjusted(nominal_fv, years, inf)
            purchasing_power_loss = round(nominal_fv - real_fv, 2)
            results.append({
                "label": f"{inf}% Inflation",
                "inflation_rate": inf,
                "nominal_future_value": nominal_fv,
                "real_future_value": real_fv,
                "purchasing_power_loss": purchasing_power_loss,
                "loss_pct": round((purchasing_power_loss / nominal_fv) * 100, 1) if nominal_fv > 0 else 0,
                "timeline": [
                    _inflation_adjusted(_sip_fv(sip_amount, y, annual_return), y, inf)
                    for y in CHECKPOINTS
                ],
            })

        worst = max(results, key=lambda r: r["loss_pct"])
        recommendation = (
            f"At {worst['inflation_rate']}% inflation, your ₹{nominal_fv:,.0f} corpus loses "
            f"₹{worst['purchasing_power_loss']:,.0f} in real purchasing power over {years} years. "
            f"Consider inflation-beating instruments (equity, index funds) to protect wealth."
        )

        return {
            "scenario_type": "inflation_stress",
            "sip_amount": sip_amount,
            "years": years,
            "annual_return": annual_return,
            "nominal_future_value": nominal_fv,
            "results": results,
            "checkpoints": CHECKPOINTS,
            "recommended_scenario": f"Hedge against {worst['inflation_rate']}% inflation",
            "recommendation_text": recommendation,
        }

    # ── SCENARIO 4: Salary Growth ────────────────────────────────────────────
    elif scenario_type == "salary_growth":
        growth_rates = scenario_parameters.get("growth_rates", [5, 10, 15, 20])
        years = int(scenario_parameters.get("years", 5))

        baseline_surplus = surplus
        baseline_proj = {
            "label": "Current Salary",
            "growth_pct": 0,
            "new_income": round(income, 2),
            "monthly_surplus": round(baseline_surplus, 2),
            "savings_5y": _sip_fv(baseline_surplus, years, annual_return),
            "score_estimate": baseline_score,
            "timeline": _timeline_series(baseline_surplus, annual_return, CHECKPOINTS),
        }

        scenarios = []
        for pct in growth_rates:
            new_income = income * (1 + pct / 100)
            new_surplus = _monthly_surplus(new_income, expenses)
            new_sav = savings + (new_surplus - baseline_surplus)
            new_score = _score_estimate(new_income, expenses, new_sav, debt)
            scenarios.append({
                "label": f"+{pct}% Salary",
                "growth_pct": pct,
                "new_income": round(new_income, 2),
                "monthly_surplus": round(new_surplus, 2),
                "savings_5y": _sip_fv(new_surplus, years, annual_return),
                "score_estimate": new_score,
                "timeline": _timeline_series(new_surplus, annual_return, CHECKPOINTS),
            })

        best = max(scenarios, key=lambda s: s["score_estimate"])
        recommendation = (
            f"A {best['growth_pct']}% salary increase raises your monthly surplus to "
            f"₹{best['monthly_surplus']:,.0f} and projected {years}-year corpus to "
            f"₹{best['savings_5y']:,.0f}. Focus on upskilling to achieve this growth."
        )
        return {
            "scenario_type": "salary_growth",
            "baseline": baseline_proj,
            "scenarios": scenarios,
            "checkpoints": CHECKPOINTS,
            "recommended_scenario": best["label"],
            "recommendation_text": recommendation,
        }

    # ── SCENARIO 5: Job Loss ─────────────────────────────────────────────────
    elif scenario_type == "job_loss":
        loss_durations = scenario_parameters.get("loss_durations", [1, 3, 6])
        monthly_expenses_during_loss = scenario_parameters.get("monthly_expenses", expenses * 0.7)

        emergency_fund = savings
        results = []
        for months in loss_durations:
            total_cost = monthly_expenses_during_loss * months
            remaining_savings = max(savings - total_cost, 0)
            fund_covers = "Yes" if savings >= total_cost else "No"
            shortfall = max(total_cost - savings, 0)
            recovery_months = round(shortfall / max(surplus, 1)) if shortfall > 0 else 0
            new_score = _score_estimate(income, expenses, remaining_savings, debt)
            results.append({
                "label": f"{months}-Month Job Loss",
                "duration_months": months,
                "total_cost": round(total_cost, 2),
                "remaining_savings": round(remaining_savings, 2),
                "fund_covers": fund_covers,
                "shortfall": round(shortfall, 2),
                "recovery_months": recovery_months,
                "score_after": new_score,
            })

        recommended_fund = round(expenses * 6, 2)
        gap = max(recommended_fund - savings, 0)
        recommendation = (
            f"Your current savings of ₹{savings:,.0f} covers "
            f"{'all tested' if all(r['fund_covers'] == 'Yes' for r in results) else 'only short'} job loss scenarios. "
            f"Recommended emergency fund: ₹{recommended_fund:,.0f} (6 months expenses). "
            + (f"Build ₹{gap:,.0f} more to be fully protected." if gap > 0 else "You are well protected.")
        )
        return {
            "scenario_type": "job_loss",
            "current_savings": savings,
            "recommended_emergency_fund": recommended_fund,
            "results": results,
            "recommendation_text": recommendation,
        }

    # ── SCENARIO 6: Emergency Expense ────────────────────────────────────────
    elif scenario_type == "emergency_expense":
        amounts = scenario_parameters.get("amounts", [50000, 100000, 200000])
        labels = scenario_parameters.get("labels", ["Minor Emergency", "Major Emergency", "Critical Emergency"])

        results = []
        for i, amount in enumerate(amounts):
            label = labels[i] if i < len(labels) else f"₹{amount:,.0f} Emergency"
            remaining = max(savings - amount, 0)
            covered = savings >= amount
            shortfall = max(amount - savings, 0)
            months_to_recover = round(shortfall / max(surplus, 1)) if shortfall > 0 else 0
            new_score = _score_estimate(income, expenses, remaining, debt)
            results.append({
                "label": label,
                "emergency_amount": round(amount, 2),
                "savings_after": round(remaining, 2),
                "covered_by_savings": covered,
                "shortfall": round(shortfall, 2),
                "months_to_recover": months_to_recover,
                "score_after": new_score,
            })

        recommendation = (
            f"Your savings of ₹{savings:,.0f} can cover "
            f"{sum(1 for r in results if r['covered_by_savings'])} of {len(results)} emergency scenarios. "
            f"Build an emergency fund of at least ₹{max(amounts):,.0f} to be fully protected."
        )
        return {
            "scenario_type": "emergency_expense",
            "current_savings": savings,
            "results": results,
            "recommendation_text": recommendation,
        }

    else:
        return {"error": f"Unknown scenario_type: {scenario_type}"}
