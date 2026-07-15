"""
Database configuration.
- Local dev: SQLite (zero setup, DATABASE_URL=sqlite:///./financeai.db)
- Production: PostgreSQL (set DATABASE_URL=postgresql://user:pass@host/db)
Same SQLAlchemy code works for both — only the connection string changes.
"""
import os
from pathlib import Path
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from dotenv import load_dotenv

_env_path = Path(__file__).resolve().parent / ".env"
load_dotenv(dotenv_path=_env_path, override=True)

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./financeai.db")

# SQLite needs check_same_thread=False; PostgreSQL does not need it
_is_sqlite = DATABASE_URL.startswith("sqlite")
connect_args = {"check_same_thread": False} if _is_sqlite else {}

# PostgreSQL connection pool settings (ignored for SQLite)
engine_kwargs = dict(connect_args=connect_args)
if not _is_sqlite:
    engine_kwargs.update(
        pool_size=10,
        max_overflow=20,
        pool_pre_ping=True,   # test connections before using them
        pool_recycle=3600,    # recycle connections every hour
    )

engine = create_engine(DATABASE_URL, **engine_kwargs)

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
    """
    Create all tables that don't exist yet.
    Safe to call multiple times — only creates missing tables.
    Import ALL models here so SQLAlchemy registers them with Base.
    """
    # Must import every model before create_all so metadata is populated
    from models.user_model import User                          # noqa: F401
    from models.financial_analysis_model import FinancialAnalysis  # noqa: F401
    from models.chat_model import ChatMessage                   # noqa: F401
    from models.financial_twin_model import FinancialTwinRun    # noqa: F401
    from models.goal_model import Goal                          # noqa: F401
    from models.portfolio_model import Portfolio                 # noqa: F401
    from models.report_model import Report                       # noqa: F401
    from models.roadmap_model import Roadmap                     # noqa: F401

    Base.metadata.create_all(bind=engine)
