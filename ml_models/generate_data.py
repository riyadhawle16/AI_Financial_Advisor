import pandas as pd
import numpy as np
import random

num_samples = 10000
data = []

for _ in range(num_samples):
    income = np.random.randint(20000, 200000)
    expenses = np.random.randint(10000, int(income * 0.95))

    # savings is independently entered by user — can be 0 to (income-expenses)
    max_savings = income - expenses
    savings = np.random.randint(0, max(1, max_savings + 1))

    debt = np.random.randint(0, 100000)

    risk = random.choice(["low", "medium", "high"])
    goal = random.choice(["buy_house", "car", "retirement", "travel"])

    # Score components (each 0-100):
    # 1. Savings ratio (0-100): what % of income is saved
    savings_score = (savings / income) * 100

    # 2. Expense ratio penalty: higher expenses = lower score
    expense_ratio = expenses / income
    expense_score = max(0, (1 - expense_ratio) * 100)

    # 3. Debt penalty: debt relative to income
    debt_ratio = debt / income
    debt_score = max(0, 100 - debt_ratio * 50)

    # Weighted composite score (0-100)
    score = (savings_score * 0.4) + (expense_score * 0.35) + (debt_score * 0.25)
    score = round(max(0.0, min(100.0, score)), 2)

    data.append([income, expenses, savings, debt, risk, goal, score])

df = pd.DataFrame(data, columns=[
    "income", "expenses", "savings", "debt",
    "risk_tolerance", "goal", "financial_score"
])

df.to_csv("financial_data.csv", index=False)
print(f"Dataset generated: {len(df)} rows")
print(f"Score range: {df['financial_score'].min():.1f} – {df['financial_score'].max():.1f}")
print(f"Score mean:  {df['financial_score'].mean():.1f}")
print(f"Score std:   {df['financial_score'].std():.1f}")
