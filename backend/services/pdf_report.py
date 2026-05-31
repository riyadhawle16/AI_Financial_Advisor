"""
PDF Report Generator — FinanceAI Financial Health Report
Generates a comprehensive, professionally formatted PDF using ReportLab.
"""
from __future__ import annotations
import io
from datetime import datetime

try:
    from reportlab.lib.pagesizes import A4
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.units import cm
    from reportlab.lib import colors
    from reportlab.platypus import (
        SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
        HRFlowable, PageBreak, KeepTogether
    )
    REPORTLAB_AVAILABLE = True
except ImportError:
    REPORTLAB_AVAILABLE = False

# ── Color palette ─────────────────────────────────────────────────────────────
BLUE   = "#3B82F6"
CYAN   = "#06B6D4"
GREEN  = "#10B981"
AMBER  = "#F59E0B"
RED    = "#EF4444"
PURPLE = "#8B5CF6"
DARK   = "#0F172A"
LIGHT  = "#F8FAFC"
MUTED  = "#64748B"
BORDER = "#E2E8F0"
BG     = "#F1F5F9"


def _c(hex_str: str):
    return colors.HexColor(hex_str)


def _score_color(score: float):
    if score >= 70:
        return _c(GREEN)
    elif score >= 40:
        return _c(AMBER)
    return _c(RED)


def _score_status(score: float) -> str:
    if score >= 70:
        return "Strong"
    elif score >= 40:
        return "Moderate"
    return "Needs Attention"


def _fmt_inr(value) -> str:
    try:
        v = float(value)
        if v >= 1e5:
            return f"Rs {v/1e5:.2f}L"
        return f"Rs {v:,.0f}"
    except Exception:
        return str(value)


def _wrap_cell(text: str, bold: bool = False, color: str = DARK, size: int = 9) -> Paragraph:
    """Wrap a cell value in a Paragraph so ReportLab word-wraps it."""
    style = ParagraphStyle(
        "cell",
        fontName="Helvetica-Bold" if bold else "Helvetica",
        fontSize=size,
        textColor=_c(color),
        leading=size + 4,
        wordWrap="CJK",
    )
    return Paragraph(str(text), style)


def _wrap_table(data: list, col_widths: list, header_color: str = BLUE) -> Table:
    """Build a table where every cell is a word-wrapping Paragraph."""
    wrapped = []
    for row_idx, row in enumerate(data):
        new_row = []
        for cell in row:
            if row_idx == 0:
                new_row.append(_wrap_cell(str(cell), bold=True, color="#FFFFFF", size=9))
            else:
                new_row.append(_wrap_cell(str(cell), bold=False, color=DARK, size=9))
        wrapped.append(new_row)

    t = Table(wrapped, colWidths=col_widths, repeatRows=1)
    t.setStyle(TableStyle([
        ("BACKGROUND",    (0, 0), (-1, 0), _c(header_color)),
        ("ALIGN",         (0, 0), (-1, -1), "LEFT"),
        ("VALIGN",        (0, 0), (-1, -1), "TOP"),
        ("ROWBACKGROUNDS",(0, 1), (-1, -1), [_c(BG), colors.white]),
        ("GRID",          (0, 0), (-1, -1), 0.4, _c(BORDER)),
        ("TOPPADDING",    (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ("LEFTPADDING",   (0, 0), (-1, -1), 8),
        ("RIGHTPADDING",  (0, 0), (-1, -1), 6),
    ]))
    return t


def _section_table(data: list, col_widths: list, header_color: str = BLUE) -> Table:
    return _wrap_table(data, col_widths, header_color)


def generate_pdf_report(report_data: dict) -> bytes:
    if not REPORTLAB_AVAILABLE:
        raise RuntimeError("ReportLab is not installed. Run: pip install reportlab")

    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer, pagesize=A4,
        rightMargin=1.8 * cm, leftMargin=1.8 * cm,
        topMargin=1.8 * cm, bottomMargin=1.8 * cm,
        title="FinanceAI Financial Health Report",
    )

    styles = getSampleStyleSheet()

    # Custom styles
    cover_title = ParagraphStyle("CoverTitle", parent=styles["Title"],
        fontSize=26, textColor=_c(BLUE), spaceAfter=6, fontName="Helvetica-Bold", alignment=1)
    cover_sub = ParagraphStyle("CoverSub", parent=styles["Normal"],
        fontSize=13, textColor=_c(MUTED), spaceAfter=4, alignment=1)
    cover_date = ParagraphStyle("CoverDate", parent=styles["Normal"],
        fontSize=10, textColor=_c(MUTED), spaceAfter=20, alignment=1)
    h1 = ParagraphStyle("H1", parent=styles["Heading1"],
        fontSize=16, textColor=_c(BLUE), spaceBefore=18, spaceAfter=6,
        fontName="Helvetica-Bold", borderPad=4)
    h2 = ParagraphStyle("H2", parent=styles["Heading2"],
        fontSize=12, textColor=_c(DARK), spaceBefore=12, spaceAfter=4,
        fontName="Helvetica-Bold")
    body = ParagraphStyle("Body", parent=styles["Normal"],
        fontSize=9.5, textColor=_c(DARK), leading=15, spaceAfter=4)
    bullet = ParagraphStyle("Bullet", parent=styles["Normal"],
        fontSize=9.5, textColor=_c(DARK), leftIndent=14, leading=15, spaceAfter=3)
    footer_style = ParagraphStyle("Footer", parent=styles["Normal"],
        fontSize=7.5, textColor=_c(MUTED), alignment=1)

    story = []

    # ── Extract data ──────────────────────────────────────────────────────────
    score               = float(report_data.get("financial_score", 0))
    profile             = report_data.get("profile", {})
    coach               = report_data.get("coach_summary", "")
    recommendations     = report_data.get("recommendations", [])
    explanation         = report_data.get("explanation", [])
    insights            = report_data.get("insights", [])
    personalized        = report_data.get("personalized_insights", [])
    roadmap             = report_data.get("roadmap", [])
    portfolio           = report_data.get("portfolio", {})
    forecast            = report_data.get("forecast", [])
    shap                = report_data.get("shap", {})
    sc                  = _score_color(score)
    status              = _score_status(score)
    now                 = datetime.now().strftime("%B %d, %Y  |  %I:%M %p")

    # ── COVER PAGE ────────────────────────────────────────────────────────────
    story.append(Spacer(1, 2 * cm))
    story.append(Paragraph("FinanceAI", cover_title))
    story.append(Paragraph("Financial Health Report", cover_sub))
    story.append(Paragraph(f"Generated on {now}", cover_date))
    story.append(HRFlowable(width="100%", thickness=2, color=_c(BLUE), spaceAfter=16))

    # Score badge on cover
    cover_score_data = [
        ["Financial Health Score", "Status", "Risk Profile"],
        [_wrap_cell(f"{score}/100", bold=True, color=GREEN if score >= 70 else (AMBER if score >= 40 else RED), size=20),
         _wrap_cell(status, bold=True, color=DARK, size=13),
         _wrap_cell(profile.get("risk_tolerance", "—").title(), bold=False, color=DARK, size=13)],
    ]
    ct = Table(cover_score_data, colWidths=[6 * cm, 5 * cm, 5 * cm])
    ct.setStyle(TableStyle([
        ("BACKGROUND",    (0, 0), (-1, 0), _c(BLUE)),
        ("ALIGN",         (0, 0), (-1, -1), "CENTER"),
        ("VALIGN",        (0, 0), (-1, -1), "MIDDLE"),
        ("ROWBACKGROUNDS",(0, 1), (-1, -1), [_c(BG)]),
        ("GRID",          (0, 0), (-1, -1), 0.5, _c(BORDER)),
        ("TOPPADDING",    (0, 0), (-1, -1), 10),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
        ("LEFTPADDING",   (0, 0), (-1, -1), 8),
        ("RIGHTPADDING",  (0, 0), (-1, -1), 8),
    ]))
    story.append(ct)
    story.append(PageBreak())

    # ── SECTION 1: FINANCIAL SUMMARY ─────────────────────────────────────────
    story.append(Paragraph("1. Financial Summary", h1))
    story.append(HRFlowable(width="100%", thickness=0.5, color=_c(BLUE), spaceAfter=8))

    # Financial breakdown table
    story.append(Paragraph("Financial Breakdown", h2))
    income   = profile.get("income", 0)
    expenses = profile.get("expenses", 0)
    savings  = profile.get("savings", 0)
    debt     = profile.get("debt", 0)
    exp_ratio = round((expenses / income * 100), 1) if income > 0 else 0
    sav_ratio = round((savings / income * 100), 1) if income > 0 else 0

    breakdown_data = [
        ["Metric", "Amount", "Ratio / Notes"],
        ["Monthly Income",   _fmt_inr(income),   "100% — Base"],
        ["Monthly Expenses", _fmt_inr(expenses),  f"{exp_ratio}% of income"],
        ["Monthly Savings",  _fmt_inr(savings),   f"{sav_ratio}% of income"],
        ["Total Debt",       _fmt_inr(debt),       "Outstanding liability"],
        ["Monthly Surplus",  _fmt_inr(max(income - expenses, 0)), "Available for investment"],
    ]
    story.append(_section_table(breakdown_data, [6 * cm, 4.5 * cm, 5.5 * cm]))
    story.append(Spacer(1, 10))

    # AI Coach summary
    if coach:
        story.append(Paragraph("AI Financial Coach Assessment", h2))
        story.append(Paragraph(coach, body))
        story.append(Spacer(1, 8))

    # ── SECTION 2: AI INSIGHTS ────────────────────────────────────────────────
    story.append(Paragraph("2. AI Insights & Analysis", h1))
    story.append(HRFlowable(width="100%", thickness=0.5, color=_c(BLUE), spaceAfter=8))

    if explanation:
        story.append(Paragraph("Why This Score?", h2))
        for item in explanation:
            story.append(Paragraph(f"• {item}", bullet))
        story.append(Spacer(1, 6))

    if insights:
        story.append(Paragraph("Smart Insights", h2))
        for item in insights:
            story.append(Paragraph(f"• {item}", bullet))
        story.append(Spacer(1, 6))

    if personalized:
        story.append(Paragraph("Personalized Insights", h2))
        for item in personalized:
            story.append(Paragraph(f"• {item}", bullet))
        story.append(Spacer(1, 6))

    # SHAP feature contributions
    if shap and shap.get("contributions"):
        story.append(Paragraph("Explainable AI — Feature Contributions", h2))
        story.append(Paragraph(
            "The following shows how each financial factor contributed to your score:",
            body
        ))
        shap_data = [["Factor", "Contribution", "Impact"]]
        for c in shap["contributions"]:
            val = c.get("value", 0)
            impact = "Positive" if c.get("positive") else "Negative"
            shap_data.append([c["feature"], f"{'+' if val >= 0 else ''}{val:.2f} pts", impact])
        story.append(_wrap_table(shap_data, [5 * cm, 4 * cm, 7 * cm], header_color=PURPLE))
        story.append(Spacer(1, 8))

    # ── SECTION 3: RECOMMENDATIONS ───────────────────────────────────────────
    if recommendations:
        story.append(Paragraph("3. AI Recommendations", h1))
        story.append(HRFlowable(width="100%", thickness=0.5, color=_c(BLUE), spaceAfter=8))
        rec_data = [["#", "Recommendation"]]
        for i, rec in enumerate(recommendations, 1):
            rec_data.append([str(i), rec])
        story.append(_wrap_table(rec_data, [1.2 * cm, 14.8 * cm]))
        story.append(Spacer(1, 10))

    # ── SECTION 4: FUTURE FORECAST ────────────────────────────────────────────
    if forecast:
        story.append(Paragraph("4. Future Savings Forecast", h1))
        story.append(HRFlowable(width="100%", thickness=0.5, color=_c(BLUE), spaceAfter=8))
        story.append(Paragraph(
            "6-month projected savings based on your current income, expenses, and savings rate:",
            body
        ))
        fc_data = [["Month", "Projected Savings", "Growth vs Month 1"]]
        base = forecast[0] if forecast else 0
        for i, val in enumerate(forecast, 1):
            growth = f"+{((val - base) / base * 100):.1f}%" if base > 0 and i > 1 else "—"
            fc_data.append([f"Month {i}", _fmt_inr(val), growth])
        fct = Table(fc_data, colWidths=[4 * cm, 5 * cm, 7 * cm])
        fct.setStyle(TableStyle([
            ("BACKGROUND",    (0, 0), (-1, 0), _c(CYAN)),
            ("TEXTCOLOR",     (0, 0), (-1, 0), colors.white),
            ("FONTNAME",      (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTSIZE",      (0, 0), (-1, -1), 9),
            ("ALIGN",         (0, 0), (-1, -1), "LEFT"),
            ("ROWBACKGROUNDS",(0, 1), (-1, -1), [_c(BG), colors.white]),
            ("GRID",          (0, 0), (-1, -1), 0.4, _c(BORDER)),
            ("TOPPADDING",    (0, 0), (-1, -1), 5),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
            ("LEFTPADDING",   (0, 0), (-1, -1), 8),
        ]))
        story.append(fct)
        story.append(Spacer(1, 10))

    # ── SECTION 5: PORTFOLIO ALLOCATION ──────────────────────────────────────
    if portfolio and portfolio.get("allocations"):
        story.append(Paragraph("5. Recommended Portfolio Allocation", h1))
        story.append(HRFlowable(width="100%", thickness=0.5, color=_c(BLUE), spaceAfter=8))
        story.append(Paragraph(portfolio.get("summary", ""), body))
        story.append(Paragraph(
            f"Risk Profile: {portfolio.get('risk_label', '')}  |  "
            f"Expected Return: {portfolio.get('expected_return', '')} p.a.",
            body
        ))
        story.append(Spacer(1, 6))
        alloc_data = [["Asset Class", "Allocation", "Rationale"]]
        for a in portfolio["allocations"]:
            alloc_data.append([a["asset"], f"{a['pct']}%", a["reason"]])
        story.append(_section_table(alloc_data, [5 * cm, 2.5 * cm, 8.5 * cm]))
        if portfolio.get("action_note"):
            story.append(Spacer(1, 6))
            story.append(Paragraph(f"Action: {portfolio['action_note']}", body))
        story.append(Spacer(1, 10))

    # ── SECTION 6: FINANCIAL HEALTH ROADMAP ──────────────────────────────────
    if roadmap:
        story.append(Paragraph("6. Financial Health Roadmap", h1))
        story.append(HRFlowable(width="100%", thickness=0.5, color=_c(BLUE), spaceAfter=8))
        story.append(Paragraph(
            f"Your current score is {score}/100. Here are your milestones to reach the next levels:",
            body
        ))
        story.append(Spacer(1, 6))
        for milestone in roadmap:
            story.append(Paragraph(
                f"Target Score: {milestone['target_score']}  (+{milestone['gap']:.0f} points needed)",
                h2
            ))
            for step in milestone.get("steps", []):
                story.append(Paragraph(f"  ✓  {step}", bullet))
        story.append(Spacer(1, 10))

    # ── SECTION 7: PERSONALIZED ACTION PLAN ──────────────────────────────────
    story.append(Paragraph("7. Personalized Action Plan", h1))
    story.append(HRFlowable(width="100%", thickness=0.5, color=_c(BLUE), spaceAfter=8))

    surplus = max(income - expenses, 0)
    sip_30d = round(surplus * 0.3)
    sip_90d = round(surplus * 0.5)
    sip_6m  = round(surplus * 0.7)
    sip_1y  = round(surplus * 0.9)

    action_data = [
        ["Timeframe", "Action Items"],
        ["Next 30 Days",
         f"Track all expenses daily. Build emergency fund. Start SIP of {_fmt_inr(sip_30d)}/month."],
        ["Next 90 Days",
         f"Increase SIP to {_fmt_inr(sip_90d)}/month. Review and cut 2 non-essential expenses. "
         + ("Clear smallest debt first." if debt > 0 else "Maintain zero-debt status.")],
        ["Next 6 Months",
         f"Target SIP of {_fmt_inr(sip_6m)}/month. Review portfolio allocation. "
         "Build 3-month emergency fund if not done."],
        ["Next 1 Year",
         f"Maximize SIP to {_fmt_inr(sip_1y)}/month. Review tax-saving investments (ELSS, PPF). "
         "Rebalance portfolio annually."],
    ]
    apt = Table(action_data, colWidths=[4 * cm, 12 * cm])
    apt.setStyle(TableStyle([
        ("BACKGROUND",    (0, 0), (-1, 0), _c(GREEN)),
        ("TEXTCOLOR",     (0, 0), (-1, 0), colors.white),
        ("FONTNAME",      (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE",      (0, 0), (-1, -1), 9),
        ("ALIGN",         (0, 0), (-1, -1), "LEFT"),
        ("VALIGN",        (0, 0), (-1, -1), "TOP"),
        ("ROWBACKGROUNDS",(0, 1), (-1, -1), [_c(BG), colors.white]),
        ("GRID",          (0, 0), (-1, -1), 0.4, _c(BORDER)),
        ("TOPPADDING",    (0, 0), (-1, -1), 7),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
        ("LEFTPADDING",   (0, 0), (-1, -1), 8),
        ("FONTNAME",      (0, 1), (0, -1), "Helvetica-Bold"),
        ("TEXTCOLOR",     (0, 1), (0, -1), _c(DARK)),
    ]))
    story.append(apt)
    story.append(Spacer(1, 20))

    # ── FOOTER ────────────────────────────────────────────────────────────────
    story.append(HRFlowable(width="100%", thickness=0.5, color=_c(MUTED), spaceAfter=6))
    story.append(Paragraph(
        "This report is generated by FinanceAI for educational purposes only and does not "
        "constitute professional financial advice. Consult a SEBI-registered financial advisor "
        "before making investment decisions.",
        footer_style
    ))

    doc.build(story)
    return buffer.getvalue()
