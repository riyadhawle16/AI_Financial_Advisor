"""
FinancialAnalysis — stores every /analyze call result per user.
Financial profile + score + all AI-generated outputs.
"""
from datetime import datetime
from sqlalchemy import Column, Integer, Float, String, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from database import Base


class FinancialAnalysis(Base):
    __tablename__ = "financial_analyses"

    id         = Column(Integer, primary_key=True, index=True)
    user_id    = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    # Input profile
    income         = Column(Float, nullable=False)
    expenses       = Column(Float, nullable=False)
    savings        = Column(Float, nullable=False)
    debt           = Column(Float, nullable=False)
    risk_tolerance = Column(String(10), nullable=False)

    # ML output
    financial_score = Column(Float, nullable=False)

    # AI outputs — stored as JSON arrays/objects
    recommendations      = Column(JSON, default=list)
    insights             = Column(JSON, default=list)
    personalized_insights = Column(JSON, default=list)
    explanation          = Column(JSON, default=list)
    coach_summary        = Column(String(2000), default="")
    journey              = Column(JSON, default=dict)
    shap                 = Column(JSON, default=dict)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    user     = relationship("User", back_populates="analyses")
    roadmaps = relationship("Roadmap", back_populates="analysis", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<FinancialAnalysis id={self.id} user={self.user_id} score={self.financial_score}>"
