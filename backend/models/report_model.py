"""
Report — stores metadata for every PDF report generated per user.
(PDF bytes are not stored in DB — just the record + analysis link.)
"""
from datetime import datetime
from sqlalchemy import Column, Integer, Float, String, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from database import Base


class Report(Base):
    __tablename__ = "reports"

    id      = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    # Link to the analysis this report was generated from
    analysis_id = Column(Integer, ForeignKey("financial_analyses.id", ondelete="SET NULL"), nullable=True)

    # Snapshot of key data at time of report generation
    financial_score  = Column(Float, nullable=False)
    risk_tolerance   = Column(String(10), nullable=True)
    filename         = Column(String(100), default="FinanceAI_Report.pdf")

    # Full report_data payload (so report can be regenerated)
    report_payload   = Column(JSON, nullable=False)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)

    user = relationship("User", back_populates="reports")

    def __repr__(self):
        return f"<Report id={self.id} user={self.user_id} score={self.financial_score}>"
