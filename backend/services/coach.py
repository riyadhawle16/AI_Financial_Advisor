"""AI Coach Summary — generates a concise 3-4 line financial coaching summary."""
from __future__ import annotations


def generate_coach_summary(data, score: float) -> str:
    income, expenses, savings, debt = data.income, data.expenses, data.savings, data.debt
    risk = data.risk_tolerance
    savings_ratio = savings / income if income > 0 else 0
    expense_ratio = expenses / income if income > 0 else 0

    lines = []

    # Line 1: savings assessment
    if savings_ratio >= 0.3:
        lines.append(f"Your savings rate of {round(savings_ratio*100)}% is excellent — you are building wealth effectively.")
    elif savings_ratio >= 0.2:
        lines.append(f"Your savings rate of {round(savings_ratio*100)}% meets the minimum benchmark. Aim for 30%+ to accelerate wealth creation.")
    else:
        lines.append(f"Your savings rate of {round(savings_ratio*100)}% is below the recommended 20%. Reducing discretionary expenses will significantly improve your score.")

    # Line 2: expense / debt assessment
    if debt > income * 2:
        lines.append(f"Your debt of ₹{debt:,.0f} is significantly impacting your financial score. Prioritize debt reduction before increasing investment exposure.")
    elif expense_ratio > 0.75:
        lines.append(f"Expenses consuming {round(expense_ratio*100)}% of income leaves limited room for savings and investment. Focus on cutting non-essential spending.")
    else:
        lines.append("Your expense-to-income ratio is manageable. Maintaining this discipline will support long-term financial growth.")

    # Line 3: investment guidance
    risk_advice = {
        "low":    "Conservative instruments like PPF, FD, and debt mutual funds align with your risk profile.",
        "medium": "Balanced SIP investments in large-cap and flexi-cap mutual funds suit your moderate risk appetite.",
        "high":   "Your high risk tolerance opens opportunities in equity, index funds, and growth-oriented assets.",
    }.get(risk, "Diversify investments based on your risk profile.")
    lines.append(risk_advice)

    # Line 4: score-based action
    if score >= 70:
        lines.append(f"With a score of {score}/100, you are in a strong position — focus on growing and diversifying your portfolio.")
    elif score >= 40:
        lines.append(f"Your score of {score}/100 shows moderate health. Consistent savings increases and debt reduction will push you into the wealth-building zone.")
    else:
        lines.append(f"A score of {score}/100 requires immediate attention. Build an emergency fund, cut high-interest debt, and stabilize cash flow before investing.")

    return " ".join(lines)
