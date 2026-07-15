"""
FinancialTwinRun — stores every /financial-twin scenario run per user.
"""
from datetime import datetime
from sqlalchemy import Column, Integer, Float, String, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from database import Base


class FinancialTwinRun(Base):
    __tablename__ = "financial_twin_runs"

    id      = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    # Input parameters
    income        = Column(Float, nullable=False)
    expenses      = Column(Float, nullable=False)
    savings       = Column(Float, nullable=False)
    debt          = Column(Float, nullable=False)
    risk_appetite = Column(String(10), nullable=False)
    sip_amount    = Column(Float, nullable=False)
    annual_return = Column(Float, nullable=False)

    # Scenario
    scenario_type       = Column(String(50), nullable=False)
    scenario_parameters = Column(JSON, default=dict)

    # Full result JSON from compute_financial_twin
    result = Column(JSON, nullable=False)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)

    user = relationship("User", back_populates="twin_runs")

    def __repr__(self):
        return f"<FinancialTwinRun id={self.id} user={self.user_id} scenario={self.scenario_type}>"
