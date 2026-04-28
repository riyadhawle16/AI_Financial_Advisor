import joblib
import pandas as pd

model = joblib.load("model.pkl")

sample = pd.DataFrame([{
    "income": 50000,
    "expenses": 30000,
    "savings": 20000,
    "debt": 5000,
}])

prediction = model.predict(sample)

print("Predicted Financial Score:", prediction[0])
