"""
User model — central table. All other tables FK back to this.
Passwords are NEVER stored in plain text — bcrypt only.
"""
from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.orm import relationship
from database import Base


class User(Base):
    __tablename__ = "users"

    id              = Column(Integer, primary_key=True, index=True)
    email           = Column(String(255), unique=True, index=True, nullable=False)
    name            = Column(String(100), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    is_active       = Column(Boolean, default=True, nullable=False)
    role            = Column(String(20), default="user", nullable=False)  # "user" or "admin"
    created_at      = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at      = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships — cascade delete removes child rows when user is deleted
    analyses      = relationship("FinancialAnalysis", back_populates="user", cascade="all, delete-orphan", order_by="desc(FinancialAnalysis.created_at)")
    chat_messages = relationship("ChatMessage",        back_populates="user", cascade="all, delete-orphan", order_by="desc(ChatMessage.created_at)")
    twin_runs     = relationship("FinancialTwinRun",   back_populates="user", cascade="all, delete-orphan", order_by="desc(FinancialTwinRun.created_at)")
    goals         = relationship("Goal",               back_populates="user", cascade="all, delete-orphan", order_by="desc(Goal.created_at)")
    portfolios    = relationship("Portfolio",          back_populates="user", cascade="all, delete-orphan", order_by="desc(Portfolio.created_at)")
    reports       = relationship("Report",             back_populates="user", cascade="all, delete-orphan", order_by="desc(Report.created_at)")
    roadmaps      = relationship("Roadmap",            back_populates="user", cascade="all, delete-orphan", order_by="desc(Roadmap.created_at)")

    def __repr__(self):
        return f"<User id={self.id} email={self.email}>"
