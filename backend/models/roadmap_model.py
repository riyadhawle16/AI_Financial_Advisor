"""
Roadmap — stores the roadmap milestones generated for each financial analysis.
"""
from datetime import datetime
from sqlalchemy import Column, Integer, Float, String, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from database import Base


class Roadmap(Base):
    __tablename__ = "roadmaps"

    id          = Column(Integer, primary_key=True, index=True)
    user_id     = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    analysis_id = Column(Integer, ForeignKey("financial_analyses.id", ondelete="CASCADE"), nullable=False, index=True)

    # Current score at time of roadmap generation
    current_score = Column(Float, nullable=False)

    # Full roadmap milestones list as JSON
    milestones = Column(JSON, nullable=False)  # list of {target_score, gap, steps}

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    user     = relationship("User", back_populates="roadmaps")
    analysis = relationship("FinancialAnalysis", back_populates="roadmaps")

    def __repr__(self):
        return f"<Roadmap id={self.id} user={self.user_id} score={self.current_score}>"
