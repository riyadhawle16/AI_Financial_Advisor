from pydantic import BaseModel, Field


class SimulateInput(BaseModel):
    monthly_investment: float = Field(..., ge=0)
    years: int = Field(..., ge=1)
    expected_return: float = Field(..., gt=0)
