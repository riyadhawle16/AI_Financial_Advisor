import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, r2_score
import joblib

# Load dataset
df = pd.read_csv("financial_data.csv")

# Features and target
X = df[["income", "expenses", "savings", "debt"]]
y = df["financial_score"]

# Split data
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# Train model
model = RandomForestRegressor(n_estimators=100, random_state=42, n_jobs=-1)
model.fit(X_train, y_train)

# Evaluate
y_pred = model.predict(X_test)
mae = mean_absolute_error(y_test, y_pred)
r2 = r2_score(y_test, y_pred)
print(f"Model trained — MAE: {mae:.2f}, R²: {r2:.4f}")

# Save model to both locations
joblib.dump(model, "model.pkl")
joblib.dump(model, "../backend/model.pkl")
print("Model saved to ml_models/model.pkl and backend/model.pkl")
