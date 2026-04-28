# AI Financial Advisor 💰

An AI-powered personal financial advisor web application that analyzes your financial data and provides intelligent, personalized recommendations.

## Features

- **Financial Health Score** — ML model (Random Forest) predicts your score (0–100) based on income, expenses, savings, and debt
- **Explainable AI** — Explains exactly why you received your score
- **Smart Insights** — Rule-based engine detects overspending, low savings, lifestyle inflation
- **Personalized Recommendations** — Tailored advice based on your risk tolerance
- **6-Month Savings Forecast** — Predicts future savings trend with charts
- **Investment Simulator** — Compound interest calculator for SIP planning
- **Financial Twin Scenario Lab** — Test multiple financial futures side-by-side (expense reduction, SIP growth, inflation stress)
- **AI Chat Advisor** — Keyword-based financial chatbot for investing, budgeting, debt, and tax queries

## Tech Stack

| Layer | Technology |
|---|---|
| ML Model | scikit-learn (RandomForestRegressor) |
| Backend | FastAPI + Uvicorn |
| Data Validation | Pydantic |
| Frontend | React 19 + Vite |
| Styling | Tailwind CSS |
| Charts | Chart.js + react-chartjs-2 |
| HTTP | Axios |

## Model Accuracy

- **R² Score: 99.29%**
- **MAE: 1.06** (average error of 1 point on 0–100 scale)
- Trained on 10,000 synthetic financial profiles

## Project Structure

```
ai-financial-advisor/
├── backend/
│   ├── main.py              # FastAPI routes
│   ├── services/            # ML, recommendations, chatbot, simulator
│   └── schemas/             # Pydantic input models
├── frontend/
│   └── src/
│       ├── components/      # React UI components
│       └── services/api.js  # Axios API calls
├── ml_models/
│   ├── generate_data.py     # Synthetic dataset generation
│   └── train_model.py       # Model training
├── start-backend.cmd
└── start-frontend.cmd
```

## Setup & Run

### Prerequisites
- Python 3.9+
- Node.js 18+

### Backend
```bash
pip install fastapi uvicorn pandas numpy scikit-learn joblib pydantic
python -m uvicorn backend.main:app --reload --host 127.0.0.1 --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173**

### Train Model (if model.pkl is missing)
```bash
cd ml_models
python generate_data.py
python train_model.py
```

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | Health check |
| POST | `/analyze` | Financial score + recommendations |
| POST | `/forecast` | 6-month savings forecast |
| POST | `/simulate` | SIP compound interest calculator |
| POST | `/chat` | AI chatbot response |
| POST | `/financial-twin` | Scenario lab analysis |

## No External APIs

This project runs entirely offline. No OpenAI, no paid services — all AI logic is built from scratch.
