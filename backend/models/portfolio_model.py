"""
Portfolio — stores every portfolio generation result per user.
"""
from datetime import datetime
from sqlalchemy import Column, Integer, Float, String, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from database import Base


class Portfolio(Base):
    __tablename__ = "portfolios"

    id      = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    # Input
    age             = Column(Integer, nullable=False)
    risk_appetite   = Column(String(10), nullable=False)
    financial_score = Column(Float, nullable=False)

    # Results
    risk_label       = Column(String(50), nullable=True)
    expected_return  = Column(String(20), nullable=True)
    allocations      = Column(JSON, default=list)
    summary          = Column(String(1000), default="")
    action_note      = Column(String(500), default="")

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)

    user = relationship("User", back_populates="portfolios")

    def __repr__(self):
        return f"<Portfolio id={self.id} user={self.user_id} risk={self.risk_appetite}>"
