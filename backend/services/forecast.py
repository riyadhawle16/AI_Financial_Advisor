import math


def forecast_savings(income: float, expenses: float, months: int) -> list[float]:
    """
    Simple explainable forecast (no heavy dependencies).
    We forecast savings trend using a growth rate derived from savings ratio.
    """
    monthly_savings = max(income - expenses, 0.0)

    # Savings ratio drives growth rate so results feel personalized.
    savings_ratio = (income - expenses) / income if income > 0 else 0.0

    if savings_ratio < 0.2:
        growth_rate = 0.01
    elif savings_ratio < 0.4:
        growth_rate = 0.03
    elif savings_ratio < 0.6:
        growth_rate = 0.05
    else:
        growth_rate = 0.07

    forecast = []
    for i in range(1, months + 1):
        predicted = monthly_savings * ((1 + growth_rate) ** i)
        # Prevent negative/inf due to bad inputs.
        predicted = max(0.0, float(predicted))
        # Round to whole currency units for nicer display.
        forecast.append(round(predicted, 2))

    return forecast

