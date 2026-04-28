from __future__ import annotations


def generate_reply(
    message: str,
    risk_tolerance: str,
    financial_score: float | None = None,
    insights: list[str] | None = None,
) -> str:
    msg = (message or "").strip().lower()
    score = financial_score
    risk = (risk_tolerance or "medium").lower()

    investment_hint = {
        "low": "Given your low risk appetite, stick to fixed deposits, PPF, or government bonds.",
        "medium": "Given your medium risk appetite, mutual funds via SIP are a solid choice.",
        "high": "Given your high risk appetite, consider stocks, index funds, or high-growth assets.",
    }.get(risk, "Diversify your investments based on your risk profile.")

    # --- WHEN TO START INVESTING ---
    if any(k in msg for k in ["when should i start", "when to start", "right time", "best time to invest", "start investing", "age to invest"]):
        return (
            "The best time to start investing is now — even small amounts matter. "
            "Compound interest works best over long periods. "
            "If you have high-interest debt, clear that first, then build a 3-month emergency fund, "
            "then start investing. " + investment_hint
        )

    # --- MINIMUM AMOUNT ---
    if any(k in msg for k in ["minimum", "minimum amount", "how much to invest", "how much should i invest", "least amount", "small amount", "start with"]):
        return (
            "You can start investing with as little as ₹500/month via SIP in mutual funds. "
            "There is no minimum for most index funds or ETFs. "
            "The key is consistency — invest regularly rather than waiting to invest a large amount. "
            + investment_hint
        )

    # --- WHERE TO INVEST ---
    if any(k in msg for k in ["where should i invest", "where to invest", "best investment", "investment options", "invest money", "invest in"]):
        if risk == "low":
            return (
                "For low risk: Fixed Deposits (FD), Public Provident Fund (PPF), "
                "National Savings Certificate (NSC), or debt mutual funds. "
                "These give stable 6-8% returns with capital protection."
            )
        elif risk == "high":
            return (
                "For high risk: Direct equity (stocks), small-cap mutual funds, "
                "index funds (Nifty 50), or REITs. "
                "These can give 12-18% long-term returns but have short-term volatility. "
                "Always diversify — don't put all money in one stock."
            )
        else:
            return (
                "For medium risk: SIP in diversified mutual funds (large-cap or flexi-cap), "
                "index funds, or balanced advantage funds. "
                "Target 10-12% annual returns over 5+ years. "
                "Start with a reputed fund house like Mirae, Parag Parikh, or HDFC."
            )

    # --- SIP / MUTUAL FUNDS ---
    if any(k in msg for k in ["sip", "mutual fund", "mf", "systematic investment"]):
        return (
            "SIP (Systematic Investment Plan) lets you invest a fixed amount monthly in mutual funds. "
            "Benefits: rupee cost averaging, no need to time the market, starts at ₹500/month. "
            "Recommended for beginners: Nifty 50 index fund or a large-cap fund. "
            "Stay invested for at least 5 years for best results."
        )

    # --- STOCKS / EQUITY ---
    if any(k in msg for k in ["stock", "equity", "share", "nifty", "sensex", "market"]):
        return (
            "Stock market investing requires research and patience. "
            "For beginners: start with index funds (Nifty 50 ETF) rather than individual stocks. "
            "Never invest money you need in the next 1-2 years. "
            "Rule of thumb: invest only what you can leave untouched for 5+ years. "
            + ("Your high risk tolerance suits equity investing." if risk == "high" else
               "Given your risk profile, limit direct stocks to 20-30% of your portfolio.")
        )

    # --- DEBT / LOAN / EMI ---
    if any(k in msg for k in ["debt", "loan", "emi", "credit card", "borrow", "repay", "pay off"]):
        score_line = f" Your financial score is {score}, which suggests debt is a concern." if score and score < 50 else ""
        return (
            "Debt management strategy: "
            "1) List all debts by interest rate. "
            "2) Pay minimum on all, then throw extra money at the highest-interest debt first (avalanche method). "
            "3) Avoid taking new loans while repaying existing ones. "
            "4) Credit card debt (18-36% interest) should be cleared before any investing." + score_line
        )

    # --- SAVINGS / EMERGENCY FUND ---
    if any(k in msg for k in ["saving", "savings", "save money", "emergency fund", "emergency", "corpus"]):
        return (
            "Savings strategy: "
            "1) Build an emergency fund of 3-6 months of expenses first. "
            "2) Keep emergency fund in a liquid instrument — savings account or liquid mutual fund. "
            "3) After that, use the 50/30/20 rule: 50% needs, 30% wants, 20% savings/investments. "
            "4) Automate savings — set up auto-transfer on salary day so you save before you spend."
        )

    # --- BUDGET / EXPENSES / OVERSPENDING ---
    if any(k in msg for k in ["budget", "budgeting", "expense", "expenses", "overspend", "spending", "cut cost", "reduce"]):
        return (
            "To control expenses: "
            "1) Track every expense for 2 weeks using any app or spreadsheet. "
            "2) Identify your top 3 spending categories. "
            "3) Set a monthly budget per category and stick to it. "
            "4) Cancel unused subscriptions. "
            "5) Cook at home more — food is usually the biggest discretionary expense. "
            + (f" Your current insights: {insights[0]}" if insights else "")
        )

    # --- FINANCIAL SCORE ---
    if any(k in msg for k in ["score", "financial score", "my score", "financial health", "health score"]):
        if score is not None:
            if score >= 70:
                return f"Your financial score is {score}/100 — that's strong! You're in good shape. Focus on growing your investments and diversifying your portfolio."
            elif score >= 40:
                return f"Your financial score is {score}/100 — moderate. You have room to improve. Focus on increasing your savings rate and reducing debt."
            else:
                return f"Your financial score is {score}/100 — this needs attention. Prioritize reducing expenses, clearing high-interest debt, and building an emergency fund before investing."
        return "Analyze your finances first using the Dashboard to get your financial score."

    # --- TAX ---
    if any(k in msg for k in ["tax", "tax saving", "80c", "elss", "nps", "ppf", "tax deduction"]):
        return (
            "Tax-saving investments under Section 80C (up to ₹1.5L deduction): "
            "ELSS mutual funds (3-year lock-in, best returns), PPF (15-year, safe), "
            "NPS (additional ₹50K under 80CCD), life insurance premiums. "
            "ELSS is recommended if you want tax saving + wealth creation."
        )

    # --- RETIREMENT ---
    if any(k in msg for k in ["retire", "retirement", "pension", "old age", "future"]):
        return (
            "For retirement planning: "
            "1) Start early — even ₹2000/month at 25 becomes ₹1Cr+ by 60 at 12% returns. "
            "2) Use NPS for tax benefits + retirement corpus. "
            "3) Increase SIP amount by 10% every year (step-up SIP). "
            "4) Target a corpus of 25x your annual expenses for financial independence."
        )

    # --- GOLD / REAL ESTATE ---
    if any(k in msg for k in ["gold", "real estate", "property", "land", "house", "sovereign gold"]):
        return (
            "Gold: Good as 5-10% of portfolio for diversification. "
            "Prefer Sovereign Gold Bonds (SGB) over physical gold — they pay 2.5% interest + price appreciation. "
            "Real estate: High entry cost, illiquid, but good long-term. "
            "REITs are a better alternative — invest in real estate with ₹300-500 and get rental income."
        )

    # --- GENERIC FALLBACK with context ---
    score_line = f"Your financial score is {score}/100." if score is not None else "You haven't analyzed your finances yet — try the Dashboard first."
    insight_line = f" Key insight: {insights[0]}." if insights else ""
    return (
        f"{score_line}{insight_line} "
        "I can help with: investing, SIP, mutual funds, debt repayment, budgeting, "
        "emergency funds, tax saving, retirement planning, or your financial score. "
        "What would you like to know more about?"
    )
