def calculate_future_value(
    monthly_investment: float, years: int, expected_return: float
) -> float:
    """
    SIP future-value using annuity-due formula:
    FV = P × [((1+r)^n - 1) / r] × (1+r)

    Where:
      P = monthly investment
      r = monthly rate = annual_rate / 12 / 100
      n = total months = years × 12

    Returns simple total when expected_return == 0.
    Returns 0.0 when monthly_investment == 0.
    """
    if monthly_investment <= 0:
        return 0.0
    if expected_return <= 0:
        return round(monthly_investment * years * 12, 2)

    r  = expected_return / 100 / 12
    n  = years * 12
    fv = monthly_investment * (((1 + r) ** n - 1) / r) * (1 + r)
    return round(fv, 2)
