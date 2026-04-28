from typing import Literal
from pydantic import BaseModel, field_validator, model_validator


class UserInput(BaseModel):
    income: float
    expenses: float
    savings: float
    debt: float
    risk_tolerance: Literal["low", "medium", "high"]

    @field_validator("income")
    @classmethod
    def income_must_be_positive(cls, v: float) -> float:
        if v <= 0:
            raise ValueError("Income must be greater than 0.")
        return v

    @field_validator("expenses")
    @classmethod
    def expenses_must_be_positive(cls, v: float) -> float:
        if v <= 0:
            raise ValueError("Expenses must be greater than 0.")
        return v

    @field_validator("savings", "debt")
    @classmethod
    def must_be_non_negative(cls, v: float) -> float:
        if v < 0:
            raise ValueError("Value must be 0 or greater.")
        return v

    @model_validator(mode="after")
    def expenses_less_than_income(self) -> "UserInput":
        if self.expenses >= self.income:
            raise ValueError(
                f"Expenses (₹{self.expenses:,.0f}) must be less than Income (₹{self.income:,.0f})."
            )
        return self
