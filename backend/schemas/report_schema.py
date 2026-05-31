from typing import Any, Dict, List, Optional
from pydantic import BaseModel


class ReportRequest(BaseModel):
    financial_score: float
    profile: Dict[str, Any] = {}
    coach_summary: Optional[str] = ""
    recommendations: Optional[List[str]] = []
    explanation: Optional[List[str]] = []
    insights: Optional[List[str]] = []
    personalized_insights: Optional[List[str]] = []
    roadmap: Optional[List[Dict[str, Any]]] = []
    portfolio: Optional[Dict[str, Any]] = {}
    forecast: Optional[List[float]] = []
    shap: Optional[Dict[str, Any]] = {}
