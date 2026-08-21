from __future__ import annotations

CHECKPOINTS = [1, 5, 10, 20]


def _sip_fv(monthly: float, years: int, annual_rate: float) -> float:
    """
    SIP future-value (annuity-due): P × [((1+r)^n - 1) / r] × (1+r)
    Payments at start of each period — gives slightly higher corpus than
    annuity-immediate, matching standard Indian SIP calculators.
    """
    if monthly <= 0 or years <= 0:
        return 0.0
    if annual_rate <= 0:
        return round(monthly * years * 12, 2)
    r = annual_rate / 100 / 12
    n = years * 12
    fv = monthly * (((1 + r) ** n - 1) / r) * (1 + r)
    return round(fv, 2)


def _sip_fv_with_corpus(monthly: float, years: int, annual_rate: float, initial_corpus: float = 0.0) -> float:
    """SIP FV + growth of any existing savings corpus at the same rate."""
    sip_component = _sip_fv(monthly, years, annual_rate)
    if initial_corpus > 0 and annual_rate > 0:
        r_annual = annual_rate / 100
        corpus_growth = round(initial_corpus * ((1 + r_annual) ** years), 2)
    else:
        corpus_growth = round(initial_corpus, 2)
    return round(sip_component + corpus_growth, 2)


def _inflation_adjusted(nominal: float, years: int, inflation_pct: float) -> float:
    """Real purchasing-power value: Nominal / (1 + inflation)^years"""
    if inflation_pct <= 0:
        return round(nominal, 2)
    return round(nominal / ((1 + inflation_pct / 100) ** years), 2)


def _future_expenses(monthly_expense: float, years: int, inflation_pct: float) -> float:
    """What today's monthly expense will cost in `years` at given inflation."""
    return round(monthly_expense * ((1 + inflation_pct / 100) ** years), 2)


def _monthly_surplus(income: float, expenses: float) -> float:
    return max(income - expenses, 0.0)


def _score_estimate(income: float, expenses: float, savings: float, debt: float) -> float:
    if income <= 0:
        return 0.0
    savings_score = (savings / income) * 100
    expense_score = max(0.0, (1 - expenses / income) * 100)
    debt_score    = max(0.0, 100 - (debt / income) * 50)
    raw = savings_score * 0.4 + expense_score * 0.35 + debt_score * 0.25
    return round(max(0.0, min(100.0, raw)), 1)


def _timeline(monthly: float, annual_rate: float, initial_corpus: float = 0.0) -> list[float]:
    return [_sip_fv_with_corpus(monthly, y, annual_rate, initial_corpus) for y in CHECKPOINTS]


def _risk_return_adjustment(annual_return: float, risk_appetite: str) -> float:
    """
    Adjust expected return based on risk appetite.
    Conservative investors tend toward lower-risk instruments with lower returns.
    Aggressive investors accept higher volatility for higher expected returns.
    """
    adjustments = {"low": -2.0, "medium": 0.0, "high": +2.0}
    adj = adjustments.get(risk_appetite, 0.0)
    return max(1.0, annual_return + adj)


def compute_financial_twin(
    income: float,
    expenses: float,
    savings: float,
    debt: float,
    risk_appetite: str,
    sip_amount: float,
    scenario_type: str,
    scenario_parameters: dict,
    annual_return: float = 12.0,
) -> dict:

    surplus        = _monthly_surplus(income, expenses)
    baseline_score = _score_estimate(income, expenses, savings, debt)

    # Adjust return rate by risk appetite for investment projections
    adj_return = _risk_return_adjustment(annual_return, risk_appetite)

    # ── SCENARIO 1: Expense Reduction ─────────────────────────────────────────
    if scenario_type == "expense_reduction":
        reductions = scenario_parameters.get("reductions", [5, 10, 15, 20])
        years      = int(scenario_parameters.get("years", 5))

        baseline_surplus = surplus
        baseline_proj = {
            "label":           "Current",
            "reduction_pct":   0,
            "new_expenses":    round(expenses, 2),
            "monthly_surplus": round(baseline_surplus, 2),
            "savings_6m":      round(baseline_surplus * 6, 2),
            f"savings_{years}y": _sip_fv_with_corpus(baseline_surplus, years, adj_return, savings),
            "score_estimate":  baseline_score,
            "timeline":        _timeline(baseline_surplus, adj_return, savings),
        }

        scenarios = []
        for pct in reductions:
            new_exp     = expenses * (1 - pct / 100)
            new_surplus = _monthly_surplus(income, new_exp)
            new_sav     = savings + (new_surplus - baseline_surplus)
            new_score   = _score_estimate(income, new_exp, new_sav, debt)
            scenarios.append({
                "label":           f"-{pct}% Expenses",
                "reduction_pct":   pct,
                "new_expenses":    round(new_exp, 2),
                "monthly_surplus": round(new_surplus, 2),
                "savings_6m":      round(new_surplus * 6, 2),
                f"savings_{years}y": _sip_fv_with_corpus(new_surplus, years, adj_return, new_sav),
                "score_estimate":  new_score,
                "timeline":        _timeline(new_surplus, adj_return, new_sav),
            })

        best = max(scenarios, key=lambda s: s["score_estimate"])
        return {
            "scenario_type":       "expense_reduction",
            "baseline":            baseline_proj,
            "scenarios":           scenarios,
            "checkpoints":         CHECKPOINTS,
            "years":               years,
            "risk_appetite":       risk_appetite,
            "adjusted_return":     adj_return,
            "recommended_scenario": best["label"],
            "recommendation_text": (
                f"Reducing expenses by {best['reduction_pct']}% gives the strongest outcome "
                f"({risk_appetite} risk profile, {adj_return}% effective return). "
                f"Monthly surplus rises to ₹{best['monthly_surplus']:,.0f}. "
                f"Projected {years}-year corpus: ₹{best.get(f'savings_{years}y', 0):,.0f}."
            ),
        }

    # ── SCENARIO 2: SIP Growth ─────────────────────────────────────────────────
    elif scenario_type == "sip_growth":
        base_sip    = sip_amount
        sip_options = scenario_parameters.get("sip_options", [base_sip, base_sip * 2, base_sip * 3])
        years       = int(scenario_parameters.get("years", 10))
        labels      = scenario_parameters.get("labels", [f"₹{s:,.0f}/mo" for s in sip_options])

        # Use risk-adjusted return so changing risk changes projected corpus
        effective_return = adj_return

        projections = []
        for i, sip in enumerate(sip_options):
            lbl           = labels[i] if i < len(labels) else f"SIP ₹{sip:,.0f}"
            fv            = _sip_fv_with_corpus(sip, years, effective_return, savings)
            total_invested = round(sip * years * 12, 2)
            projections.append({
                "label":         lbl,
                "sip_amount":    round(sip, 2),
                "future_value":  fv,
                "total_invested": total_invested,
                "wealth_gain":   round(fv - total_invested - savings, 2),
                "timeline":      _timeline(sip, effective_return, savings),
            })

        best = max(projections, key=lambda p: p["future_value"])
        return {
            "scenario_type":       "sip_growth",
            "projections":         projections,
            "checkpoints":         CHECKPOINTS,
            "years":               years,
            "annual_return":       annual_return,
            "adjusted_return":     effective_return,
            "risk_appetite":       risk_appetite,
            "recommended_scenario": best["label"],
            "recommendation_text": (
                f"With {risk_appetite} risk profile ({effective_return}% effective return), "
                f"investing ₹{best['sip_amount']:,.0f}/month grows your corpus to "
                f"₹{best['future_value']:,.0f} over {years} years "
                f"(including ₹{savings:,.0f} existing savings)."
            ),
        }

    # ── SCENARIO 3: Inflation Stress ──────────────────────────────────────────
    elif scenario_type == "inflation_stress":
        inflation_rates = scenario_parameters.get("inflation_rates", [4, 6, 8])
        years           = int(scenario_parameters.get("years", 10))
        nominal_fv      = _sip_fv_with_corpus(sip_amount, years, annual_return, savings)

        results = []
        for inf in inflation_rates:
            real_fv                = _inflation_adjusted(nominal_fv, years, inf)
            purchasing_power_loss  = round(nominal_fv - real_fv, 2)
            # Future expense burden: what today's monthly expense costs at this inflation
            future_monthly_expense = _future_expenses(expenses, years, inf)
            results.append({
                "label":                 f"{inf}% Inflation",
                "inflation_rate":        inf,
                "nominal_future_value":  nominal_fv,
                "real_future_value":     real_fv,
                "purchasing_power_loss": purchasing_power_loss,
                "loss_pct":              round((purchasing_power_loss / nominal_fv) * 100, 1) if nominal_fv > 0 else 0,
                "future_monthly_expense": future_monthly_expense,
                "timeline": [
                    _inflation_adjusted(_sip_fv_with_corpus(sip_amount, y, annual_return, savings), y, inf)
                    for y in CHECKPOINTS
                ],
            })

        worst = max(results, key=lambda r: r["loss_pct"])
        return {
            "scenario_type":       "inflation_stress",
            "sip_amount":          sip_amount,
            "years":               years,
            "annual_return":       annual_return,
            "nominal_future_value": nominal_fv,
            "results":             results,
            "checkpoints":         CHECKPOINTS,
            "recommended_scenario": f"Hedge against {worst['inflation_rate']}% inflation",
            "recommendation_text": (
                f"At {worst['inflation_rate']}% inflation over {years} years, your corpus loses "
                f"₹{worst['purchasing_power_loss']:,.0f} ({worst['loss_pct']}%) in real value. "
                f"Your monthly expenses will rise from ₹{expenses:,.0f} to "
                f"₹{worst['future_monthly_expense']:,.0f}. "
                f"Use equity-heavy investments to beat inflation."
            ),
        }

    # ── SCENARIO 4: Salary Growth ──────────────────────────────────────────────
    elif scenario_type == "salary_growth":
        growth_rates    = scenario_parameters.get("growth_rates", [5, 10, 15, 20])
        years           = int(scenario_parameters.get("years", 5))
        baseline_surplus = surplus

        baseline_proj = {
            "label":           "Current Salary",
            "growth_pct":      0,
            "new_income":      round(income, 2),
            "monthly_surplus": round(baseline_surplus, 2),
            f"savings_{years}y": _sip_fv_with_corpus(baseline_surplus, years, adj_return, savings),
            "score_estimate":  baseline_score,
            "timeline":        _timeline(baseline_surplus, adj_return, savings),
        }

        scenarios = []
        for pct in growth_rates:
            new_income  = income * (1 + pct / 100)
            new_surplus = _monthly_surplus(new_income, expenses)
            new_sav     = savings + (new_surplus - baseline_surplus)
            new_score   = _score_estimate(new_income, expenses, new_sav, debt)
            scenarios.append({
                "label":           f"+{pct}% Salary",
                "growth_pct":      pct,
                "new_income":      round(new_income, 2),
                "monthly_surplus": round(new_surplus, 2),
                f"savings_{years}y": _sip_fv_with_corpus(new_surplus, years, adj_return, new_sav),
                "score_estimate":  new_score,
                "timeline":        _timeline(new_surplus, adj_return, new_sav),
            })

        best = max(scenarios, key=lambda s: s["score_estimate"])
        return {
            "scenario_type":       "salary_growth",
            "baseline":            baseline_proj,
            "scenarios":           scenarios,
            "checkpoints":         CHECKPOINTS,
            "recommended_scenario": best["label"],
            "recommendation_text": (
                f"A {best['growth_pct']}% salary increase raises surplus to "
                f"₹{best['monthly_surplus']:,.0f}/month. "
                f"Projected {years}-year corpus: ₹{best.get(f'savings_{years}y', 0):,.0f} "
                f"({risk_appetite} risk, {adj_return}% return)."
            ),
        }

    # ── SCENARIO 5: Job Loss ───────────────────────────────────────────────────
    elif scenario_type == "job_loss":
        loss_durations = scenario_parameters.get("loss_durations", [1, 3, 6])
        # During job loss, assume 70% of normal expenses (no commute, less spending)
        monthly_expenses_during_loss = scenario_parameters.get("monthly_expenses", round(expenses * 0.7, 2))

        results = []
        for months in loss_durations:
            total_cost        = round(monthly_expenses_during_loss * months, 2)
            remaining_savings = max(savings - total_cost, 0)
            fund_covers       = "Yes" if savings >= total_cost else "No"
            shortfall         = max(total_cost - savings, 0)
            recovery_months   = round(shortfall / max(surplus, 1)) if shortfall > 0 else 0
            # Score impact: income temporarily zero during job loss period
            new_score = _score_estimate(income, expenses, remaining_savings, debt)
            results.append({
                "label":              f"{months}-Month Job Loss",
                "duration_months":    months,
                "total_cost":         total_cost,
                "monthly_cost":       monthly_expenses_during_loss,
                "remaining_savings":  remaining_savings,
                "fund_covers":        fund_covers,
                "shortfall":          round(shortfall, 2),
                "recovery_months":    recovery_months,
                "score_after":        new_score,
            })

        recommended_fund = round(expenses * 6, 2)
        gap              = max(recommended_fund - savings, 0)
        return {
            "scenario_type":            "job_loss",
            "current_savings":          savings,
            "recommended_emergency_fund": recommended_fund,
            "results":                  results,
            "recommendation_text": (
                f"With ₹{savings:,.0f} savings, you can cover "
                f"{'all tested' if all(r['fund_covers'] == 'Yes' for r in results) else 'only short'} "
                f"job loss scenarios (estimated ₹{monthly_expenses_during_loss:,.0f}/month during loss). "
                f"Target emergency fund: ₹{recommended_fund:,.0f} (6× monthly expenses)."
                + (f" Build ₹{gap:,.0f} more." if gap > 0 else " You are well protected.")
            ),
        }

    # ── SCENARIO 6: Emergency Expense ─────────────────────────────────────────
    elif scenario_type == "emergency_expense":
        amounts = scenario_parameters.get("amounts", [50000, 100000, 200000])
        labels  = scenario_parameters.get("labels", ["Minor (₹50K)", "Major (₹1L)", "Critical (₹2L)"])

        results = []
        for i, amount in enumerate(amounts):
            lbl              = labels[i] if i < len(labels) else f"₹{amount:,.0f} Emergency"
            remaining        = max(savings - amount, 0)
            covered          = savings >= amount
            shortfall        = max(amount - savings, 0)
            months_to_recover = round(shortfall / max(surplus, 1)) if shortfall > 0 else 0
            new_score        = _score_estimate(income, expenses, remaining, debt)
            results.append({
                "label":              lbl,
                "emergency_amount":   round(amount, 2),
                "savings_after":      round(remaining, 2),
                "covered_by_savings": covered,
                "shortfall":          round(shortfall, 2),
                "months_to_recover":  months_to_recover,
                "score_after":        new_score,
            })

        return {
            "scenario_type":    "emergency_expense",
            "current_savings":  savings,
            "results":          results,
            "recommendation_text": (
                f"Your savings of ₹{savings:,.0f} cover "
                f"{sum(1 for r in results if r['covered_by_savings'])} of {len(results)} scenarios. "
                f"Build an emergency fund of ₹{max(amounts):,.0f} for full protection."
            ),
        }

    return {"error": f"Unknown scenario_type: {scenario_type}"}
