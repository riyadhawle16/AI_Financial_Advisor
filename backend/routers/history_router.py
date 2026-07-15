"""
History router — read-only endpoints for retrieving saved user data.
All routes require authentication.
GET /history/analyses
GET /history/analyses/{id}
DELETE /history/analyses/{id}
GET /history/chat
DELETE /history/chat
GET /history/twin-runs
DELETE /history/twin-runs/{id}
GET /history/goals
DELETE /history/goals/{id}
GET /history/portfolios
DELETE /history/portfolios/{id}
GET /history/reports
GET /history/reports/{id}/regenerate  ← re-downloads PDF
GET /history/roadmaps
GET /history/summary  ← counts of everything
"""
import io
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from database import get_db
from services.auth_service import get_current_user_from_db
from services.crud_service import (
    get_analyses, get_analysis_by_id, delete_analysis,
    get_chat_history, clear_chat_history,
    get_twin_runs, delete_twin_run,
    get_goals, delete_goal,
    get_portfolios, delete_portfolio,
    get_reports, get_report_by_id,
    get_roadmaps,
)
from services.pdf_report import generate_pdf_report

router = APIRouter(prefix="/history", tags=["History"])


# ── Analyses ──────────────────────────────────────────────────────────────────

@router.get("/analyses")
def list_analyses(
    limit:  int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    current_user = Depends(get_current_user_from_db),
    db: Session = Depends(get_db),
):
    rows = get_analyses(db, current_user.id, limit, offset)
    return {
        "total": len(rows),
        "items": [
            {
                "id": r.id,
                "financial_score": r.financial_score,
                "income": r.income,
                "expenses": r.expenses,
                "savings": r.savings,
                "debt": r.debt,
                "risk_tolerance": r.risk_tolerance,
                "coach_summary": r.coach_summary,
                "recommendations": r.recommendations,
                "insights": r.insights,
                "personalized_insights": r.personalized_insights,
                "explanation": r.explanation,
                "journey": r.journey,
                "shap": r.shap,
                "created_at": r.created_at.isoformat(),
            }
            for r in rows
        ],
    }


@router.get("/analyses/{analysis_id}")
def get_analysis(
    analysis_id: int,
    current_user = Depends(get_current_user_from_db),
    db: Session = Depends(get_db),
):
    row = get_analysis_by_id(db, current_user.id, analysis_id)
    if not row:
        raise HTTPException(status_code=404, detail="Analysis not found.")
    return {
        "id": row.id,
        "financial_score": row.financial_score,
        "income": row.income,
        "expenses": row.expenses,
        "savings": row.savings,
        "debt": row.debt,
        "risk_tolerance": row.risk_tolerance,
        "coach_summary": row.coach_summary,
        "recommendations": row.recommendations,
        "insights": row.insights,
        "personalized_insights": row.personalized_insights,
        "explanation": row.explanation,
        "journey": row.journey,
        "shap": row.shap,
        "roadmaps": [
            {"milestones": rm.milestones, "created_at": rm.created_at.isoformat()}
            for rm in row.roadmaps
        ],
        "created_at": row.created_at.isoformat(),
    }


@router.delete("/analyses/{analysis_id}")
def remove_analysis(
    analysis_id: int,
    current_user = Depends(get_current_user_from_db),
    db: Session = Depends(get_db),
):
    ok = delete_analysis(db, current_user.id, analysis_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Analysis not found.")
    return {"message": "Analysis deleted.", "success": True}


# ── Chat History ──────────────────────────────────────────────────────────────

@router.get("/chat")
def list_chat(
    limit:  int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    current_user = Depends(get_current_user_from_db),
    db: Session = Depends(get_db),
):
    rows = get_chat_history(db, current_user.id, limit, offset)
    # Return in chronological order (oldest first for chat display)
    items = [
        {
            "id": r.id,
            "role": r.role,
            "message": r.message,
            "source": r.source,
            "created_at": r.created_at.isoformat(),
        }
        for r in reversed(rows)
    ]
    return {"total": len(items), "items": items}


@router.delete("/chat")
def clear_chat(
    current_user = Depends(get_current_user_from_db),
    db: Session = Depends(get_db),
):
    deleted = clear_chat_history(db, current_user.id)
    return {"message": f"Cleared {deleted} messages.", "success": True}


# ── Financial Twin Runs ───────────────────────────────────────────────────────

@router.get("/twin-runs")
def list_twin_runs(
    limit:  int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    current_user = Depends(get_current_user_from_db),
    db: Session = Depends(get_db),
):
    rows = get_twin_runs(db, current_user.id, limit, offset)
    return {
        "total": len(rows),
        "items": [
            {
                "id": r.id,
                "scenario_type": r.scenario_type,
                "income": r.income,
                "expenses": r.expenses,
                "savings": r.savings,
                "debt": r.debt,
                "annual_return": r.annual_return,
                "result": r.result,
                "created_at": r.created_at.isoformat(),
            }
            for r in rows
        ],
    }


@router.delete("/twin-runs/{run_id}")
def remove_twin_run(
    run_id: int,
    current_user = Depends(get_current_user_from_db),
    db: Session = Depends(get_db),
):
    ok = delete_twin_run(db, current_user.id, run_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Twin run not found.")
    return {"message": "Twin run deleted.", "success": True}


# ── Goals ─────────────────────────────────────────────────────────────────────

@router.get("/goals")
def list_goals(
    limit:  int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    current_user = Depends(get_current_user_from_db),
    db: Session = Depends(get_db),
):
    rows = get_goals(db, current_user.id, limit, offset)
    return {
        "total": len(rows),
        "items": [
            {
                "id": r.id,
                "goal_name": r.goal_name,
                "target_amount": r.target_amount,
                "years": r.years,
                "annual_return": r.annual_return,
                "required_monthly_sip": r.required_monthly_sip,
                "total_invested": r.total_invested,
                "wealth_gain": r.wealth_gain,
                "created_at": r.created_at.isoformat(),
            }
            for r in rows
        ],
    }


@router.delete("/goals/{goal_id}")
def remove_goal(
    goal_id: int,
    current_user = Depends(get_current_user_from_db),
    db: Session = Depends(get_db),
):
    ok = delete_goal(db, current_user.id, goal_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Goal not found.")
    return {"message": "Goal deleted.", "success": True}


# ── Portfolios ────────────────────────────────────────────────────────────────

@router.get("/portfolios")
def list_portfolios(
    limit:  int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    current_user = Depends(get_current_user_from_db),
    db: Session = Depends(get_db),
):
    rows = get_portfolios(db, current_user.id, limit, offset)
    return {
        "total": len(rows),
        "items": [
            {
                "id": r.id,
                "age": r.age,
                "risk_appetite": r.risk_appetite,
                "financial_score": r.financial_score,
                "risk_label": r.risk_label,
                "expected_return": r.expected_return,
                "allocations": r.allocations,
                "summary": r.summary,
                "created_at": r.created_at.isoformat(),
            }
            for r in rows
        ],
    }


@router.delete("/portfolios/{portfolio_id}")
def remove_portfolio(
    portfolio_id: int,
    current_user = Depends(get_current_user_from_db),
    db: Session = Depends(get_db),
):
    ok = delete_portfolio(db, current_user.id, portfolio_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Portfolio not found.")
    return {"message": "Portfolio deleted.", "success": True}


# ── Reports ───────────────────────────────────────────────────────────────────

@router.get("/reports")
def list_reports(
    limit:  int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    current_user = Depends(get_current_user_from_db),
    db: Session = Depends(get_db),
):
    rows = get_reports(db, current_user.id, limit, offset)
    return {
        "total": len(rows),
        "items": [
            {
                "id": r.id,
                "financial_score": r.financial_score,
                "risk_tolerance": r.risk_tolerance,
                "filename": r.filename,
                "created_at": r.created_at.isoformat(),
            }
            for r in rows
        ],
    }


@router.get("/reports/{report_id}/regenerate")
def regenerate_report(
    report_id: int,
    current_user = Depends(get_current_user_from_db),
    db: Session = Depends(get_db),
):
    """Re-generate and download the PDF for a previously stored report."""
    row = get_report_by_id(db, current_user.id, report_id)
    if not row:
        raise HTTPException(status_code=404, detail="Report not found.")
    try:
        pdf_bytes = generate_pdf_report(row.report_payload)
        return StreamingResponse(
            io.BytesIO(pdf_bytes),
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename={row.filename}"},
        )
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── Roadmaps ──────────────────────────────────────────────────────────────────

@router.get("/roadmaps")
def list_roadmaps(
    limit:  int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    current_user = Depends(get_current_user_from_db),
    db: Session = Depends(get_db),
):
    rows = get_roadmaps(db, current_user.id, limit, offset)
    return {
        "total": len(rows),
        "items": [
            {
                "id": r.id,
                "analysis_id": r.analysis_id,
                "current_score": r.current_score,
                "milestones": r.milestones,
                "created_at": r.created_at.isoformat(),
            }
            for r in rows
        ],
    }


# ── Summary dashboard ─────────────────────────────────────────────────────────

@router.get("/summary")
def history_summary(
    current_user = Depends(get_current_user_from_db),
    db: Session = Depends(get_db),
):
    """Returns counts of all saved data for the current user."""
    from models.financial_analysis_model import FinancialAnalysis
    from models.chat_model                import ChatMessage
    from models.financial_twin_model      import FinancialTwinRun
    from models.goal_model                import Goal
    from models.portfolio_model           import Portfolio
    from models.report_model              import Report

    uid = current_user.id
    analyses_count  = db.query(FinancialAnalysis).filter(FinancialAnalysis.user_id == uid).count()
    chat_count      = db.query(ChatMessage).filter(ChatMessage.user_id == uid).count()
    twin_count      = db.query(FinancialTwinRun).filter(FinancialTwinRun.user_id == uid).count()
    goals_count     = db.query(Goal).filter(Goal.user_id == uid).count()
    portfolio_count = db.query(Portfolio).filter(Portfolio.user_id == uid).count()
    reports_count   = db.query(Report).filter(Report.user_id == uid).count()

    # Latest analysis score
    latest = (
        db.query(FinancialAnalysis)
        .filter(FinancialAnalysis.user_id == uid)
        .order_by(FinancialAnalysis.created_at.desc())
        .first()
    )

    return {
        "analyses":   analyses_count,
        "chat_messages": chat_count,
        "twin_runs":  twin_count,
        "goals":      goals_count,
        "portfolios": portfolio_count,
        "reports":    reports_count,
        "latest_score": latest.financial_score if latest else None,
        "latest_analysis_date": latest.created_at.isoformat() if latest else None,
    }
