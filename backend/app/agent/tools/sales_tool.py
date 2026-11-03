from typing import Dict, Any
from app.models.schemas import SalesAnalyticsData, SalesKPI, MonthlySalesPoint, TransactionRow


def get_sales_analytics(quarter: str = "Q3", year: int = 2026) -> Dict[str, Any]:
    """Generates rich sales metrics, quarterly revenue trends, category breakdowns, and transactions.
    
    Args:
        quarter: Financial quarter ('Q1', 'Q2', 'Q3', 'Q4').
        year: Fiscal year (e.g. 2026).
    """
    data = SalesAnalyticsData(
        title=f"Enterprise Revenue Performance - {quarter} {year}",
        quarter=quarter,
        year=year,
        currency="USD ($)",
        kpis=[
            SalesKPI(label="Total Revenue", value="$1,842,500", change_pct=18.4, trend="up", period="vs prior quarter"),
            SalesKPI(label="Net ARR", value="$7,380,000", change_pct=24.1, trend="up", period="YoY Growth"),
            SalesKPI(label="Average Deal Size", value="$48,200", change_pct=8.5, trend="up", period="QoQ"),
            SalesKPI(label="Gross Margin", value="78.2%", change_pct=-1.2, trend="down", period="Target 80%"),
        ],
        monthly_trend=[
            MonthlySalesPoint(month="Jul", revenue=580000, target=520000, orders=142, expenses=140000),
            MonthlySalesPoint(month="Aug", revenue=615000, target=560000, orders=158, expenses=148000),
            MonthlySalesPoint(month="Sep", revenue=647500, target=600000, orders=174, expenses=152000),
        ],
        category_breakdown=[
            {"category": "Cloud Platform", "revenue": 890000, "share_pct": 48.3},
            {"category": "AI Inference API", "revenue": 520000, "share_pct": 28.2},
            {"category": "Enterprise Support", "revenue": 260000, "share_pct": 14.1},
            {"category": "Professional Services", "revenue": 172500, "share_pct": 9.4},
        ],
        recent_transactions=[
            TransactionRow(id="TX-8041", customer="Vertex Technologies", tier="Enterprise", plan="Enterprise Scale", amount=96000.0, status="Paid", date="Sep 28, 2026"),
            TransactionRow(id="TX-8042", customer="Nova BioTech Labs", tier="Enterprise", plan="AI Dedicated Cluster", amount=54000.0, status="Paid", date="Sep 26, 2026"),
            TransactionRow(id="TX-8043", customer="AeroDynamics Group", tier="Growth", plan="Platform Pro", amount=18500.0, status="Paid", date="Sep 24, 2026"),
            TransactionRow(id="TX-8044", customer="FinPulse Systems", tier="Enterprise", plan="Multi-Region Cloud", amount=112000.0, status="Paid", date="Sep 21, 2026"),
            TransactionRow(id="TX-8045", customer="Lumina Health", tier="Growth", plan="Compliance Add-on", amount=14200.0, status="Pending", date="Sep 19, 2026"),
        ],
        summary_insight="Q3 revenue surpassed guidance by 11.2%, propelled by exponential adoption of AI Inference APIs (+43% QoQ). Enterprise retention remained stellar at 116% NRR."
    )
    return data.model_dump()

