from typing import Any, Dict, Literal
from pydantic import BaseModel, Field


class FinancialTwinInput(BaseModel):
    income: float = Field(..., ge=0)
    expenses: float = Field(..., ge=0)
    savings: float = Field(..., ge=0)
    debt: float = Field(..., ge=0)
    risk_appetite: Literal["low", "medium", "high"] = "medium"
    sip_amount: float = Field(5000.0, ge=0)
    scenario_type: Literal[
        "expense_reduction",
        "sip_growth",
        "inflation_stress",
        "salary_growth",
        "job_loss",
        "emergency_expense",
    ]
    scenario_parameters: Dict[str, Any] = Field(default_factory=dict)
    annual_return: float = Field(12.0, gt=0)
