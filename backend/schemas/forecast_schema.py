from pydantic import BaseModel, Field


class ForecastInput(BaseModel):
    income: float = Field(..., ge=0)
    expenses: float = Field(..., ge=0)
    months: int = Field(6, ge=6, le=12)

