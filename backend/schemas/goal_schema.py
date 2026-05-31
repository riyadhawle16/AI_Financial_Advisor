from pydantic import BaseModel, Field


class GoalInput(BaseModel):
    goal_name: str = Field(..., min_length=1, max_length=100)
    target_amount: float = Field(..., gt=0)
    years: int = Field(..., ge=1, le=40)
    annual_return: float = Field(12.0, gt=0)
    current_savings: float = Field(0.0, ge=0)
