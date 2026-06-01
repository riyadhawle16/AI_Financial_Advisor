from typing import Any, List, Literal, Optional

from pydantic import BaseModel, Field


class ChatInput(BaseModel):
    message: str = Field(..., min_length=1, max_length=2000)
    risk_tolerance: Literal["low", "medium", "high"]

    financial_score: Optional[float] = None
    insights: Optional[List[str]] = None
    recommendations: Optional[List[str]] = None
    roadmap: Optional[List[Any]] = None
