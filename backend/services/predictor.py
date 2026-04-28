import joblib
import pandas as pd
from pathlib import Path

MODEL_PATH = Path(__file__).resolve().parent.parent / "model.pkl"
model = joblib.load(MODEL_PATH)


def predict_financial_score(data) -> float:
    """
    Predict financial health score (0–100) from user input.
    Clamps output to valid range regardless of model output.
    """
    features = pd.DataFrame([{
        "income": data.income,
        "expenses": data.expenses,
        "savings": data.savings,
        "debt": data.debt,
    }])

    raw = model.predict(features)[0]
    # Clamp to 0–100 — model trained on clamped data but edge cases can still exceed
    score = max(0.0, min(100.0, float(raw)))
    return round(score, 2)
