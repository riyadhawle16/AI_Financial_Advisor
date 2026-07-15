"""
Goal — stores every goal planner calculation per user.
"""
from datetime import datetime
from sqlalchemy import Column, Integer, Float, String, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from database import Base


class Goal(Base):
    __tablename__ = "goals"

    id      = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    # Input
    goal_name       = Column(String(200), nullable=False)
    target_amount   = Column(Float, nullable=False)
    years           = Column(Integer, nullable=False)
    annual_return   = Column(Float, nullable=False)
    current_savings = Column(Float, default=0.0)

    # Results
    required_monthly_sip        = Column(Float, nullable=False)
    required_annual_investment   = Column(Float, nullable=False)
    total_invested               = Column(Float, nullable=False)
    wealth_gain                  = Column(Float, nullable=False)
    timeline                     = Column(JSON, default=list)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)

    user = relationship("User", back_populates="goals")

    def __repr__(self):
        return f"<Goal id={self.id} user={self.user_id} goal='{self.goal_name}'>"
