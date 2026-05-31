"""SHAP Explainable AI — feature contribution analysis for financial score."""
from __future__ import annotations
import pandas as pd
from pathlib import Path

try:
    import shap
    SHAP_AVAILABLE = True
except ImportError:
    SHAP_AVAILABLE = False

try:
    import joblib
    MODEL_PATH = Path(__file__).resolve().parent.parent / "model.pkl"
    _model = joblib.load(MODEL_PATH)
except Exception:
    _model = None


FEATURE_LABELS = {
    "income":   "Income",
    "expenses": "Expenses",
    "savings":  "Savings",
    "debt":     "Debt",
}


def get_shap_values(data) -> dict:
    """
    Returns SHAP feature contributions for a single prediction.
    Falls back to rule-based approximation if SHAP is not installed.
    """
    features = {
        "income":   data.income,
        "expenses": data.expenses,
        "savings":  data.savings,
        "debt":     data.debt,
    }
    df = pd.DataFrame([features])

    if SHAP_AVAILABLE and _model is not None:
        try:
            explainer = shap.TreeExplainer(_model)
            shap_vals = explainer.shap_values(df)[0]
            contributions = [
                {
                    "feature": FEATURE_LABELS[col],
                    "value": round(float(shap_vals[i]), 3),
                    "raw_value": features[col],
                    "positive": float(shap_vals[i]) >= 0,
                }
                for i, col in enumerate(["income", "expenses", "savings", "debt"])
            ]
            contributions.sort(key=lambda x: abs(x["value"]), reverse=True)
            return {
                "method": "shap",
                "contributions": contributions,
                "base_value": round(float(explainer.expected_value), 2),
            }
        except Exception as e:
            pass  # fall through to rule-based

    # Rule-based fallback approximation
    income, expenses, savings, debt = data.income, data.expenses, data.savings, data.debt
    savings_contrib  = round((savings / income) * 40, 2) if income > 0 else 0
    expense_contrib  = round(-(expenses / income) * 35, 2) if income > 0 else 0
    debt_contrib     = round(-(debt / max(income, 1)) * 25, 2)
    income_contrib   = round((income / 100000) * 5, 2)

    contributions = [
        {"feature": "Savings",  "value": savings_contrib,  "raw_value": savings,  "positive": savings_contrib >= 0},
        {"feature": "Expenses", "value": expense_contrib,  "raw_value": expenses, "positive": expense_contrib >= 0},
        {"feature": "Debt",     "value": debt_contrib,     "raw_value": debt,     "positive": debt_contrib >= 0},
        {"feature": "Income",   "value": income_contrib,   "raw_value": income,   "positive": income_contrib >= 0},
    ]
    contributions.sort(key=lambda x: abs(x["value"]), reverse=True)
    return {
        "method": "rule_based",
        "contributions": contributions,
        "base_value": 42.0,
    }
