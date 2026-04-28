EXPENSE_RATIO_THRESHOLD = 0.7
SAVINGS_RATIO_THRESHOLD = 0.2
GOOD_SAVINGS_THRESHOLD = 0.3


def generate_explanation(data, score: float) -> list[str]:
    """
    Returns human-readable strings explaining the financial score.
    Always returns at least one explanation so the UI always has content.
    """
    if data.income == 0:
        return ["Income is zero — please enter a valid income to get a score explanation."]

    explanations = []

    expense_ratio = data.expenses / data.income
    savings_ratio = data.savings / data.income

    # Expense ratio explanation
    if expense_ratio >= EXPENSE_RATIO_THRESHOLD:
        x = round(expense_ratio * 100)
        explanations.append(f"Your expenses are {x}% of your income — this is above the recommended 70% threshold.")
    else:
        x = round(expense_ratio * 100)
        explanations.append(f"Your expenses are {x}% of your income — within a healthy range.")

    # Savings ratio explanation
    if savings_ratio < SAVINGS_RATIO_THRESHOLD:
        s = round(savings_ratio * 100)
        explanations.append(f"Your savings rate is {s}% — below the recommended 20% minimum.")
    elif savings_ratio >= GOOD_SAVINGS_THRESHOLD:
        s = round(savings_ratio * 100)
        explanations.append(f"Your savings rate is {s}% — excellent! You are saving well above the 20% benchmark.")
    else:
        s = round(savings_ratio * 100)
        explanations.append(f"Your savings rate is {s}% — meets the 20% minimum. Aim for 30%+ for stronger growth.")

    # Debt explanation
    if data.debt > 0:
        explanations.append(f"You have ₹{data.debt:,.0f} in debt — this reduces your financial score. Prioritize clearing high-interest debt.")
    else:
        explanations.append("You have no debt — this positively impacts your financial score.")

    # Score summary
    if score >= 70:
        explanations.append(f"Overall score of {score}/100 reflects strong financial discipline.")
    elif score >= 40:
        explanations.append(f"Overall score of {score}/100 indicates moderate financial health with room to improve.")
    else:
        explanations.append(f"Overall score of {score}/100 signals financial stress — focus on reducing expenses and debt first.")

    return explanations
