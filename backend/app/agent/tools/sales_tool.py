from typing import Dict, Any
from app.models.schemas import SalesAnalyticsData, SalesKPI, MonthlySalesPoint, TransactionRow


QUARTER_MONTHS = {
    "Q1": ["Jan", "Feb", "Mar"],
    "Q2": ["Apr", "May", "Jun"],
    "Q3": ["Jul", "Aug", "Sep"],
    "Q4": ["Oct", "Nov", "Dec"],
}


def get_sales_analytics(quarter: str = "Q3", year: int = 2026) -> Dict[str, Any]:
    """Generates rich sales metrics, quarterly revenue trends, category breakdowns, and transactions dynamically.
    
    Args:
        quarter: Financial quarter ('Q1', 'Q2', 'Q3', 'Q4').
        year: Fiscal year (e.g. 2026).
    """
    q = quarter.upper() if quarter and quarter.upper() in QUARTER_MONTHS else "Q3"
    months = QUARTER_MONTHS[q]

    quarter_factors = {
        "Q1": (1680000, 21.5, 42000, 79.4, [520000, 545000, 615000], [500000, 530000, 580000]),
        "Q2": (1840000, 24.2, 46500, 78.8, [580000, 610000, 650000], [550000, 590000, 630000]),
        "Q3": (1950000, 18.4, 48200, 78.2, [610000, 645000, 695000], [580000, 620000, 670000]),
        "Q4": (2240000, 29.8, 54000, 81.0, [690000, 740000, 810000], [660000, 710000, 780000]),
    }

    rev_total, growth, deal_size, margin, rev_months, target_months = quarter_factors[q]

    data = SalesAnalyticsData(
        title=f"Enterprise Revenue Performance - {q} {year}",
        quarter=q,
        year=year,
        currency="USD ($)",
        kpis=[
            SalesKPI(label="Total Revenue", value=f"${rev_total:,.0f}", change_pct=growth, trend="up", period="vs prior quarter"),
            SalesKPI(label="Net ARR", value=f"${rev_total * 4:,.0f}", change_pct=26.4, trend="up", period="YoY Growth"),
            SalesKPI(label="Average Deal Size", value=f"${deal_size:,.0f}", change_pct=8.5, trend="up", period="QoQ"),
            SalesKPI(label="Gross Margin", value=f"{margin}%", change_pct=1.4 if margin > 79 else -0.8, trend="up" if margin > 79 else "down", period="Target 80%"),
        ],
        monthly_trend=[
            MonthlySalesPoint(month=months[0], revenue=rev_months[0], target=target_months[0], orders=138, expenses=int(rev_months[0] * 0.24)),
            MonthlySalesPoint(month=months[1], revenue=rev_months[1], target=target_months[1], orders=154, expenses=int(rev_months[1] * 0.23)),
            MonthlySalesPoint(month=months[2], revenue=rev_months[2], target=target_months[2], orders=172, expenses=int(rev_months[2] * 0.22)),
        ],
        category_breakdown=[
            {"category": "Cloud Platform", "revenue": int(rev_total * 0.48), "share_pct": 48.0},
            {"category": "AI Inference API", "revenue": int(rev_total * 0.29), "share_pct": 29.0},
            {"category": "Enterprise Support", "revenue": int(rev_total * 0.14), "share_pct": 14.0},
            {"category": "Professional Services", "revenue": int(rev_total * 0.09), "share_pct": 9.0},
        ],
        recent_transactions=[
            TransactionRow(id=f"TX-{q}01", customer="Vertex Technologies", tier="Enterprise", plan="Enterprise Scale", amount=96000.0, status="Paid", date=f"{months[2]} 28, {year}"),
            TransactionRow(id=f"TX-{q}02", customer="Nova BioTech Labs", tier="Enterprise", plan="AI Dedicated Cluster", amount=54000.0, status="Paid", date=f"{months[2]} 24, {year}"),
            TransactionRow(id=f"TX-{q}03", customer="AeroDynamics Group", tier="Growth", plan="Platform Pro", amount=18500.0, status="Paid", date=f"{months[1]} 18, {year}"),
            TransactionRow(id=f"TX-{q}04", customer="FinPulse Systems", tier="Enterprise", plan="Multi-Region Cloud", amount=112000.0, status="Paid", date=f"{months[1]} 12, {year}"),
            TransactionRow(id=f"TX-{q}05", customer="Lumina Health", tier="Growth", plan="Compliance Add-on", amount=14200.0, status="Pending", date=f"{months[0]} 29, {year}"),
        ],
        summary_insight=f"{q} {year} revenue reached ${rev_total:,.0f} (+{growth}% QoQ), propelled by rapid enterprise adoption of AI Inference clusters and cloud platform expansion."
    )
    return data.model_dump()
