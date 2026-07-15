"""
CRUD service layer — all database read/write operations.
Each function takes a SQLAlchemy Session and returns ORM objects.
"""
from __future__ import annotations
from sqlalchemy.orm import Session
from sqlalchemy import desc

from models.financial_analysis_model import FinancialAnalysis
from models.chat_model                import ChatMessage
from models.financial_twin_model      import FinancialTwinRun
from models.goal_model                import Goal
from models.portfolio_model           import Portfolio
from models.report_model              import Report
from models.roadmap_model             import Roadmap


# ── Financial Analyses ────────────────────────────────────────────────────────

def save_analysis(db: Session, user_id: int, input_data: dict, result: dict) -> FinancialAnalysis:
    """Persist a /analyze result and its roadmap in one transaction."""
    analysis = FinancialAnalysis(
        user_id              = user_id,
        income               = input_data["income"],
        expenses             = input_data["expenses"],
        savings              = input_data["savings"],
        debt                 = input_data["debt"],
        risk_tolerance       = input_data["risk_tolerance"],
        financial_score      = result["financial_score"],
        recommendations      = result.get("recommendations", []),
        insights             = result.get("insights", []),
        personalized_insights = result.get("personalized_insights", []),
        explanation          = result.get("explanation", []),
        coach_summary        = result.get("coach_summary", ""),
        journey              = result.get("journey") or {},
        shap                 = result.get("shap") or {},
    )
    db.add(analysis)
    db.flush()  # get analysis.id without committing

    # Save roadmap linked to this analysis
    roadmap_data = result.get("roadmap", [])
    if roadmap_data:
        roadmap = Roadmap(
            user_id     = user_id,
            analysis_id = analysis.id,
            current_score = result["financial_score"],
            milestones  = roadmap_data,
        )
        db.add(roadmap)

    db.commit()
    db.refresh(analysis)
    return analysis


def get_analyses(db: Session, user_id: int, limit: int = 20, offset: int = 0) -> list[FinancialAnalysis]:
    return (
        db.query(FinancialAnalysis)
        .filter(FinancialAnalysis.user_id == user_id)
        .order_by(desc(FinancialAnalysis.created_at))
        .offset(offset)
        .limit(limit)
        .all()
    )


def get_analysis_by_id(db: Session, user_id: int, analysis_id: int) -> FinancialAnalysis | None:
    return (
        db.query(FinancialAnalysis)
        .filter(FinancialAnalysis.id == analysis_id, FinancialAnalysis.user_id == user_id)
        .first()
    )


def delete_analysis(db: Session, user_id: int, analysis_id: int) -> bool:
    obj = get_analysis_by_id(db, user_id, analysis_id)
    if not obj:
        return False
    db.delete(obj)
    db.commit()
    return True


# ── Chat Messages ─────────────────────────────────────────────────────────────

def save_chat_message(
    db: Session, user_id: int, role: str, message: str,
    source: str = "unknown", analysis_id: int | None = None
) -> ChatMessage:
    msg = ChatMessage(
        user_id     = user_id,
        role        = role,
        message     = message,
        source      = source,
        analysis_id = analysis_id,
    )
    db.add(msg)
    db.commit()
    db.refresh(msg)
    return msg


def get_chat_history(db: Session, user_id: int, limit: int = 50, offset: int = 0) -> list[ChatMessage]:
    return (
        db.query(ChatMessage)
        .filter(ChatMessage.user_id == user_id)
        .order_by(desc(ChatMessage.created_at))
        .offset(offset)
        .limit(limit)
        .all()
    )


def clear_chat_history(db: Session, user_id: int) -> int:
    deleted = db.query(ChatMessage).filter(ChatMessage.user_id == user_id).delete()
    db.commit()
    return deleted


# ── Financial Twin Runs ───────────────────────────────────────────────────────

def save_twin_run(db: Session, user_id: int, input_data: dict, result: dict) -> FinancialTwinRun:
    run = FinancialTwinRun(
        user_id             = user_id,
        income              = input_data["income"],
        expenses            = input_data["expenses"],
        savings             = input_data["savings"],
        debt                = input_data["debt"],
        risk_appetite       = input_data.get("risk_appetite", "medium"),
        sip_amount          = input_data.get("sip_amount", 0),
        annual_return       = input_data.get("annual_return", 12),
        scenario_type       = input_data["scenario_type"],
        scenario_parameters = input_data.get("scenario_parameters", {}),
        result              = result,
    )
    db.add(run)
    db.commit()
    db.refresh(run)
    return run


def get_twin_runs(db: Session, user_id: int, limit: int = 20, offset: int = 0) -> list[FinancialTwinRun]:
    return (
        db.query(FinancialTwinRun)
        .filter(FinancialTwinRun.user_id == user_id)
        .order_by(desc(FinancialTwinRun.created_at))
        .offset(offset)
        .limit(limit)
        .all()
    )


def delete_twin_run(db: Session, user_id: int, run_id: int) -> bool:
    obj = db.query(FinancialTwinRun).filter(
        FinancialTwinRun.id == run_id, FinancialTwinRun.user_id == user_id
    ).first()
    if not obj:
        return False
    db.delete(obj)
    db.commit()
    return True


# ── Goals ─────────────────────────────────────────────────────────────────────

def save_goal(db: Session, user_id: int, input_data: dict, result: dict) -> Goal:
    goal = Goal(
        user_id                  = user_id,
        goal_name                = result.get("goal_name", input_data.get("goal_name", "")),
        target_amount            = result.get("target_amount", input_data.get("target_amount", 0)),
        years                    = result.get("years", input_data.get("years", 0)),
        annual_return            = result.get("annual_return", input_data.get("annual_return", 12)),
        current_savings          = input_data.get("current_savings", 0),
        required_monthly_sip     = result.get("required_monthly_sip", 0),
        required_annual_investment = result.get("required_annual_investment", 0),
        total_invested           = result.get("total_invested", 0),
        wealth_gain              = result.get("wealth_gain", 0),
        timeline                 = result.get("timeline", []),
    )
    db.add(goal)
    db.commit()
    db.refresh(goal)
    return goal


def get_goals(db: Session, user_id: int, limit: int = 20, offset: int = 0) -> list[Goal]:
    return (
        db.query(Goal)
        .filter(Goal.user_id == user_id)
        .order_by(desc(Goal.created_at))
        .offset(offset)
        .limit(limit)
        .all()
    )


def delete_goal(db: Session, user_id: int, goal_id: int) -> bool:
    obj = db.query(Goal).filter(Goal.id == goal_id, Goal.user_id == user_id).first()
    if not obj:
        return False
    db.delete(obj)
    db.commit()
    return True


# ── Portfolios ────────────────────────────────────────────────────────────────

def save_portfolio(db: Session, user_id: int, input_data: dict, result: dict) -> Portfolio:
    portfolio = Portfolio(
        user_id         = user_id,
        age             = input_data.get("age", 0),
        risk_appetite   = input_data.get("risk_appetite", "medium"),
        financial_score = input_data.get("financial_score", 0),
        risk_label      = result.get("risk_label", ""),
        expected_return = result.get("expected_return", ""),
        allocations     = result.get("allocations", []),
        summary         = result.get("summary", ""),
        action_note     = result.get("action_note", ""),
    )
    db.add(portfolio)
    db.commit()
    db.refresh(portfolio)
    return portfolio


def get_portfolios(db: Session, user_id: int, limit: int = 20, offset: int = 0) -> list[Portfolio]:
    return (
        db.query(Portfolio)
        .filter(Portfolio.user_id == user_id)
        .order_by(desc(Portfolio.created_at))
        .offset(offset)
        .limit(limit)
        .all()
    )


def delete_portfolio(db: Session, user_id: int, portfolio_id: int) -> bool:
    obj = db.query(Portfolio).filter(Portfolio.id == portfolio_id, Portfolio.user_id == user_id).first()
    if not obj:
        return False
    db.delete(obj)
    db.commit()
    return True


# ── Reports ───────────────────────────────────────────────────────────────────

def save_report(db: Session, user_id: int, report_data: dict, analysis_id: int | None = None) -> Report:
    report = Report(
        user_id        = user_id,
        analysis_id    = analysis_id,
        financial_score = float(report_data.get("financial_score", 0)),
        risk_tolerance = report_data.get("profile", {}).get("risk_tolerance", ""),
        report_payload = report_data,
    )
    db.add(report)
    db.commit()
    db.refresh(report)
    return report


def get_reports(db: Session, user_id: int, limit: int = 20, offset: int = 0) -> list[Report]:
    return (
        db.query(Report)
        .filter(Report.user_id == user_id)
        .order_by(desc(Report.created_at))
        .offset(offset)
        .limit(limit)
        .all()
    )


def get_report_by_id(db: Session, user_id: int, report_id: int) -> Report | None:
    return db.query(Report).filter(Report.id == report_id, Report.user_id == user_id).first()


# ── Roadmaps ──────────────────────────────────────────────────────────────────

def get_roadmaps(db: Session, user_id: int, limit: int = 20, offset: int = 0) -> list[Roadmap]:
    return (
        db.query(Roadmap)
        .filter(Roadmap.user_id == user_id)
        .order_by(desc(Roadmap.created_at))
        .offset(offset)
        .limit(limit)
        .all()
    )
