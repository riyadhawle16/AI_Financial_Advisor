"""
Admin router — only accessible to users with role='admin'.
Endpoints:
  GET  /admin/users          — list all registered users
  GET  /admin/users/{id}     — get one user's full profile
  POST /admin/users/{id}/deactivate  — deactivate a user
  POST /admin/users/{id}/activate    — reactivate a user
  GET  /admin/stats          — platform-wide statistics
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from database import get_db
from services.auth_service import require_admin
from models.user_model import User
from models.financial_analysis_model import FinancialAnalysis
from models.chat_model import ChatMessage
from models.goal_model import Goal
from models.portfolio_model import Portfolio
from models.report_model import Report
from models.financial_twin_model import FinancialTwinRun

router = APIRouter(prefix="/admin", tags=["Admin"])


def _fmt_user(u) -> dict:
    return {
        "id":         u.id,
        "name":       u.name,
        "email":      u.email,
        "role":       u.role,
        "is_active":  u.is_active,
        "created_at": u.created_at.isoformat(),
    }


# ── GET /admin/users ──────────────────────────────────────────────────────────
@router.get("/users")
def list_all_users(
    admin=Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Returns all registered users. Admin only."""
    users = db.query(User).order_by(User.created_at.desc()).all()
    return {
        "total": len(users),
        "users": [_fmt_user(u) for u in users],
    }


# ── GET /admin/users/{id} ─────────────────────────────────────────────────────
@router.get("/users/{user_id}")
def get_user_detail(
    user_id: int,
    admin=Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Returns full profile + activity counts for one user."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    analyses_count  = db.query(FinancialAnalysis).filter_by(user_id=user_id).count()
    chat_count      = db.query(ChatMessage).filter_by(user_id=user_id).count()
    goals_count     = db.query(Goal).filter_by(user_id=user_id).count()
    portfolio_count = db.query(Portfolio).filter_by(user_id=user_id).count()

    latest = (
        db.query(FinancialAnalysis)
        .filter_by(user_id=user_id)
        .order_by(FinancialAnalysis.created_at.desc())
        .first()
    )

    return {
        **_fmt_user(user),
        "activity": {
            "analyses":   analyses_count,
            "chat_msgs":  chat_count,
            "goals":      goals_count,
            "portfolios": portfolio_count,
        },
        "latest_score": latest.financial_score if latest else None,
    }


# ── POST /admin/users/{id}/deactivate ─────────────────────────────────────────
@router.post("/users/{user_id}/deactivate")
def deactivate_user(
    user_id: int,
    admin=Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Deactivates a user — they cannot log in anymore."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    if user.role == "admin":
        raise HTTPException(status_code=400, detail="Cannot deactivate an admin account.")
    user.is_active = False
    db.commit()
    return {"message": f"User {user.email} deactivated.", "success": True}


# ── POST /admin/users/{id}/activate ──────────────────────────────────────────
@router.post("/users/{user_id}/activate")
def activate_user(
    user_id: int,
    admin=Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Reactivates a deactivated user."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    user.is_active = True
    db.commit()
    return {"message": f"User {user.email} activated.", "success": True}


# ── GET /admin/stats ──────────────────────────────────────────────────────────
@router.get("/stats")
def platform_stats(
    admin=Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Platform-wide statistics. Admin only."""
    total_users      = db.query(User).count()
    active_users     = db.query(User).filter_by(is_active=True).count()
    total_analyses   = db.query(FinancialAnalysis).count()
    total_chats      = db.query(ChatMessage).filter(ChatMessage.role == "user").count()
    total_goals      = db.query(Goal).count()
    total_portfolios = db.query(Portfolio).count()
    total_reports    = db.query(Report).count()
    total_twins      = db.query(FinancialTwinRun).count()

    avg_score = db.query(func.avg(FinancialAnalysis.financial_score)).scalar()

    return {
        "users": {
            "total":  total_users,
            "active": active_users,
        },
        "analyses":   total_analyses,
        "avg_score":  round(float(avg_score), 2) if avg_score else None,
        "chat_msgs":  total_chats,
        "goals":      total_goals,
        "portfolios": total_portfolios,
        "reports":    total_reports,
        "twin_runs":  total_twins,
    }
