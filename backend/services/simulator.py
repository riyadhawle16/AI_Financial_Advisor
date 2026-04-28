def calculate_future_value(
    monthly_investment: float, years: int, expected_return: float
) -> float:
    """
    Returns the future value of a monthly investment over a given number of years.
    Returns 0.0 when monthly_investment == 0.
    Returns simple total (no interest) when expected_return == 0.
    Otherwise applies the compound-interest future-value formula.
    """
    if monthly_investment == 0:
        return 0.0

    if expected_return == 0:
        return round(monthly_investment * years * 12, 2)

    r = expected_return / 100 / 12
    n = years * 12
    fv = monthly_investment * (((1 + r) ** n - 1) / r)
    return round(fv, 2)
