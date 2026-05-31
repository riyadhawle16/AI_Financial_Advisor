from typing import Literal
from pydantic import BaseModel, Field


class PortfolioInput(BaseModel):
    age: int = Field(..., ge=18, le=80)
    risk_appetite: Literal["low", "medium", "high"]
    financial_score: float = Field(..., ge=0, le=100)
