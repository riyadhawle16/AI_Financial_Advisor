"""
Database configuration — SQLite via SQLAlchemy.
Auto-creates financeai.db on first run.
"""
import os
from pathlib import Path
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from dotenv import load_dotenv

_env_path = Path(__file__).resolve().parent / ".env"
load_dotenv(dotenv_path=_env_path, override=True)

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./financeai.db")

# connect_args required only for SQLite (thread safety)
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(DATABASE_URL, connect_args=connect_args)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """FastAPI dependency — yields a DB session, always closes it."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Create all tables. Called once at app startup."""
    # Import all models so SQLAlchemy knows about them before create_all
    from models.user_model import User  # noqa: F401
    Base.metadata.create_all(bind=engine)
