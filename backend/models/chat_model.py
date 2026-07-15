"""
ChatMessage — stores every message in every chat conversation per user.
"""
from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from database import Base


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id      = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    # "user" | "bot"
    role    = Column(String(10), nullable=False)
    message = Column(Text, nullable=False)

    # Which AI engine replied (gemini | fallback)
    source  = Column(String(20), default="unknown")

    # Optional: link to the analysis context used for this chat
    analysis_id = Column(Integer, ForeignKey("financial_analyses.id", ondelete="SET NULL"), nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)

    # Relationships
    user = relationship("User", back_populates="chat_messages")

    def __repr__(self):
        return f"<ChatMessage id={self.id} user={self.user_id} role={self.role}>"
