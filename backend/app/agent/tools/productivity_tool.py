"""
productivity_tool.py
Workstation Endpoint Telemetry, Employee Productivity Analytics & Payroll Loss Predictor.
Analyzes background desktop daemon / browser extension signals:
- Productive focus hours vs Idle / AFK
- Fakibaji / Slacking / Synthetic Mouse Wiggler detection
- Upskilling / Research / Learning hours
- Entertainment / Personal social media hours
- Sleep / Screen lock during work shift
- Predicts direct payroll leakage & financial loss from unproductive hours
"""

import json
import logging
import os
import re
from datetime import datetime
from typing import Any, Dict, List, Optional
import psycopg2
from psycopg2.extras import RealDictCursor

logger = logging.getLogger("genui.tools.productivity")

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgrespassword@localhost:5432/genui_db")


def get_db_connection():
    return psycopg2.connect(DATABASE_URL, cursor_factory=RealDictCursor)


def query_employee_productivity(
    query: Optional[str] = None,
    staff_id: Optional[str] = None,
    department: Optional[str] = None,
    filter_type: Optional[str] = None,
    mode: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Analyzes workstation background telemetry, employee productivity, slacking/fakibaji detection,
    learning hours, and predicts financial payroll loss.
    """
    q_str = (query or "").lower().strip()

    # 1. Determine staff_id from query if not explicitly passed
    detected_staff_id = staff_id
    if not detected_staff_id:
        m = re.search(r"\b(emp-\d{4})\b", q_str)
        if m:
            detected_staff_id = m.group(1).upper()
        else:
            # Check for common employee first names
            name_mappings = {
                "ayesha": "EMP-1001",
                "nusrat": "EMP-1002",
                "tanvir": "EMP-1003",
                "sadia": "EMP-1004",
                "zubair": "EMP-1005",
                "mahfuz": "EMP-1006",
                "kazi": "EMP-1006",
                "farhana": "EMP-1007",
                "rafiqul": "EMP-1008",
                "sabrina": "EMP-1009",
                "asif": "EMP-1010",
            }
            for name_token, s_id in name_mappings.items():
                if name_token in q_str:
                    detected_staff_id = s_id
                    break

    # 2. Determine visual UI mode
    effective_mode = mode
    if not effective_mode:
        if detected_staff_id:
            effective_mode = "employee_deep_dive"
        elif any(w in q_str for w in ["loss", "cost", "payroll waste", "money loss", "predict loss", "financial loss", "leakage"]):
            effective_mode = "loss_prediction"
        elif any(w in q_str for w in ["deep dive", "workstation", "his screen", "what he doing", "idle time", "sleep", "pc"]):
            # If asking deep dive without specifying an employee, default to highest-risk employee (EMP-1008 Rafiqul Alam)
            detected_staff_id = "EMP-1008"
            effective_mode = "employee_deep_dive"
        else:
            effective_mode = "department_loss_overview"

    conn = get_db_connection()
    cur = conn.cursor()

    try:
        if effective_mode == "employee_deep_dive" and detected_staff_id:
            return _get_employee_deep_dive(cur, detected_staff_id)
        elif effective_mode == "loss_prediction":
            return _get_loss_prediction_overview(cur, q_str)
        else:
            return _get_department_productivity_overview(cur, filter_type or "all", q_str)
    except Exception as e:
        logger.error(f"Error querying productivity telemetry: {e}", exc_info=True)
        return {
            "mode": "department_loss_overview",
            "error": str(e),
            "summary": "Productivity telemetry system error.",
            "employees": []
        }
    finally:
        cur.close()
        conn.close()


def _get_employee_deep_dive(cur, staff_id: str) -> Dict[str, Any]:
    """Returns granular workstation telemetry for a single employee."""
    sql = """
        SELECT 
            e.id, e.staff_id, e.name, e.designation, e.business_unit, e.salary_usd, e.avatar_url,
            a.agent_uuid, a.hostname, a.os_platform, a.client_version, a.last_heartbeat, a.connection_status, a.api_key_prefix,
            s.avg_productivity_score, s.total_productive_hrs_30d, s.total_fakibaji_hrs_30d,
            s.total_learning_hrs_30d, s.total_idle_hrs_30d, s.total_entertainment_hrs_30d,
            s.hourly_rate_usd, s.monthly_wasted_payroll_usd, s.annual_projected_loss_usd,
            s.risk_level, s.primary_anomaly, s.recommended_action
        FROM employees e
        JOIN workstation_agents a ON a.employee_id = e.id
        JOIN employee_productivity_summary s ON s.employee_id = e.id
        WHERE e.staff_id = %s;
    """
    cur.execute(sql, (staff_id,))
    emp = cur.fetchone()

    if not emp:
        return {
            "mode": "employee_deep_dive",
            "error": f"Employee {staff_id} not found in workstation registry.",
            "staff_id": staff_id
        }

    # Fetch latest daily timeline and top applications
    cur.execute("""
        SELECT work_date, total_tracked_hours, productive_hours, idle_hours, fakibaji_hours,
               learning_hours, entertainment_hours, mouse_wiggler_detected, wiggler_event_count,
               keystrokes_total, hourly_timeline, top_applications
        FROM employee_daily_productivity
        WHERE employee_id = %s
        ORDER BY work_date DESC
        LIMIT 1;
    """, (emp["id"],))
    latest_day = cur.fetchone()

    # Time allocation donut data
    total_tracked = float(emp["total_productive_hrs_30d"] + emp["total_fakibaji_hrs_30d"] + emp["total_learning_hrs_30d"] + emp["total_idle_hrs_30d"] + emp["total_entertainment_hrs_30d"])
    if total_tracked == 0:
        total_tracked = 160.0

    distribution = [
        {"name": "Productive Work", "hours": float(emp["total_productive_hrs_30d"]), "pct": round(float(emp["total_productive_hrs_30d"]) / total_tracked * 100, 1), "color": "#10B981"},
        {"name": "Skill Learning", "hours": float(emp["total_learning_hrs_30d"]), "pct": round(float(emp["total_learning_hrs_30d"]) / total_tracked * 100, 1), "color": "#3B82F6"},
        {"name": "Idle / AFK", "hours": float(emp["total_idle_hrs_30d"]), "pct": round(float(emp["total_idle_hrs_30d"]) / total_tracked * 100, 1), "color": "#F59E0B"},
        {"name": "Entertainment", "hours": float(emp["total_entertainment_hrs_30d"]), "pct": round(float(emp["total_entertainment_hrs_30d"]) / total_tracked * 100, 1), "color": "#8B5CF6"},
        {"name": "Fakibaji / Slacking", "hours": float(emp["total_fakibaji_hrs_30d"]), "pct": round(float(emp["total_fakibaji_hrs_30d"]) / total_tracked * 100, 1), "color": "#EF4444"},
    ]

    hourly_timeline = latest_day["hourly_timeline"] if latest_day and latest_day.get("hourly_timeline") else []
    top_apps = latest_day["top_applications"] if latest_day and latest_day.get("top_applications") else []

    # Format heartbeat
    heartbeat_dt = emp["last_heartbeat"]
    heartbeat_str = heartbeat_dt.strftime("%H:%M:%S UTC") if heartbeat_dt else "2 mins ago"

    return {
        "mode": "employee_deep_dive",
        "employee": {
            "id": emp["id"],
            "staff_id": emp["staff_id"],
            "name": emp["name"],
            "designation": emp["designation"],
            "department": emp["business_unit"],
            "salary_usd": f"${float(emp['salary_usd']):,.2f}",
            "hourly_rate": f"${float(emp['hourly_rate_usd']):,.2f}/hr",
            "avatar_url": emp["avatar_url"],
            "productivity_score": int(emp["avg_productivity_score"]),
            "risk_level": emp["risk_level"],
            "primary_anomaly": emp["primary_anomaly"],
            "recommended_action": emp["recommended_action"]
        },
        "workstation": {
            "agent_uuid": emp["agent_uuid"],
            "hostname": emp["hostname"],
            "os": emp["os_platform"],
            "version": emp["client_version"],
            "status": emp["connection_status"],
            "last_heartbeat": heartbeat_str,
            "api_key_prefix": emp["api_key_prefix"] + "••••••••"
        },
        "financial_loss": {
            "hourly_rate": f"${float(emp['hourly_rate_usd']):.2f}",
            "wasted_hours_30d": f"{float(emp['total_fakibaji_hrs_30d']) + float(emp['total_entertainment_hrs_30d']):.1f} hrs",
            "monthly_payroll_loss": f"${float(emp['monthly_wasted_payroll_usd']):,.2f}",
            "annual_projected_loss": f"${float(emp['annual_projected_loss_usd']):,.2f}",
            "net_roi_percent": f"{max(0, int(emp['avg_productivity_score']))}%"
        },
        "distribution": distribution,
        "hourly_timeline": hourly_timeline,
        "top_applications": top_apps,
        "wiggler_detected": latest_day.get("mouse_wiggler_detected", False) if latest_day else False,
        "wiggler_events": latest_day.get("wiggler_event_count", 0) if latest_day else 0,
        "summary": f"Workstation Telemetry Deep-Dive for {emp['name']} ({emp['staff_id']}): {emp['avg_productivity_score']}% Productivity Score, {emp['risk_level']} Risk Profile."
    }


def _get_loss_prediction_overview(cur, query_str: str) -> Dict[str, Any]:
    """Focuses on the financial loss forecast, payroll leakage, and department rankings."""
    sql = """
        SELECT 
            e.id, e.staff_id, e.name, e.designation, e.business_unit, e.salary_usd,
            s.avg_productivity_score, s.hourly_rate_usd, s.monthly_wasted_payroll_usd,
            s.annual_projected_loss_usd, s.total_fakibaji_hrs_30d, s.total_entertainment_hrs_30d,
            s.total_idle_hrs_30d, s.risk_level, s.primary_anomaly, s.recommended_action
        FROM employees e
        JOIN employee_productivity_summary s ON s.employee_id = e.id
        ORDER BY s.monthly_wasted_payroll_usd DESC;
    """
    cur.execute(sql)
    rows = cur.fetchall()

    total_monthly_loss = sum(float(r["monthly_wasted_payroll_usd"]) for r in rows)
    total_annual_loss = sum(float(r["annual_projected_loss_usd"]) for r in rows)
    total_payroll = sum(float(r["salary_usd"]) / 12.0 for r in rows)
    payroll_leakage_pct = round((total_monthly_loss / total_payroll) * 100, 1) if total_payroll > 0 else 0.0

    # Department aggregation of financial loss
    dept_map = {}
    for r in rows:
        bu = r["business_unit"]
        if bu not in dept_map:
            dept_map[bu] = {"name": bu, "monthly_loss": 0.0, "productive_score_sum": 0.0, "count": 0}
        dept_map[bu]["monthly_loss"] += float(r["monthly_wasted_payroll_usd"])
        dept_map[bu]["productive_score_sum"] += float(r["avg_productivity_score"])
        dept_map[bu]["count"] += 1

    dept_loss_chart = [
        {
            "department": k,
            "monthly_loss": round(v["monthly_loss"], 2),
            "avg_score": round(v["productive_score_sum"] / v["count"], 1)
        }
        for k, v in dept_map.items()
    ]
    dept_loss_chart.sort(key=lambda x: x["monthly_loss"], reverse=True)

    top_loss_employees = [
        {
            "staff_id": r["staff_id"],
            "name": r["name"],
            "designation": r["designation"],
            "department": r["business_unit"],
            "monthly_loss": f"${float(r['monthly_wasted_payroll_usd']):,.2f}",
            "annual_loss": f"${float(r['annual_projected_loss_usd']):,.2f}",
            "hourly_rate": f"${float(r['hourly_rate_usd']):,.2f}/hr",
            "slacking_hours": f"{float(r['total_fakibaji_hrs_30d']) + float(r['total_entertainment_hrs_30d']):.1f}h",
            "risk_level": r["risk_level"],
            "primary_anomaly": r["primary_anomaly"],
            "recommended_action": r["recommended_action"]
        }
        for r in rows[:6]
    ]

    return {
        "mode": "loss_prediction",
        "kpis": {
            "total_monthly_payroll_loss": f"${total_monthly_loss:,.2f}",
            "total_annual_projected_loss": f"${total_annual_loss:,.2f}",
            "payroll_leakage_pct": f"{payroll_leakage_pct}%",
            "high_risk_headcount": sum(1 for r in rows if r["risk_level"] in ["High", "Critical"]),
            "monitored_workstations": len(rows)
        },
        "dept_loss_chart": dept_loss_chart,
        "top_loss_employees": top_loss_employees,
        "summary": f"Payroll Leakage Predictor: ${total_monthly_loss:,.2f}/month wasted across {len(rows)} monitored endpoints ({payroll_leakage_pct}% of total payroll)."
    }


def _get_department_productivity_overview(cur, filter_type: str, query_str: str) -> Dict[str, Any]:
    """Default executive view: company-wide workstation telemetry leaderboard and metrics."""
    sql = """
        SELECT 
            e.id, e.staff_id, e.name, e.designation, e.business_unit, e.salary_usd, e.avatar_url,
            a.agent_uuid, a.hostname, a.os_platform, a.client_version, a.connection_status,
            s.avg_productivity_score, s.total_productive_hrs_30d, s.total_fakibaji_hrs_30d,
            s.total_learning_hrs_30d, s.total_idle_hrs_30d, s.total_entertainment_hrs_30d,
            s.hourly_rate_usd, s.monthly_wasted_payroll_usd, s.annual_projected_loss_usd,
            s.risk_level, s.primary_anomaly, s.recommended_action
        FROM employees e
        JOIN workstation_agents a ON a.employee_id = e.id
        JOIN employee_productivity_summary s ON s.employee_id = e.id
        ORDER BY s.avg_productivity_score DESC;
    """
    cur.execute(sql)
    rows = cur.fetchall()

    total_emps = len(rows)
    avg_score = round(sum(float(r["avg_productivity_score"]) for r in rows) / total_emps, 1) if total_emps > 0 else 0.0
    total_monthly_loss = sum(float(r["monthly_wasted_payroll_usd"]) for r in rows)
    total_prod_hrs = sum(float(r["total_productive_hrs_30d"]) for r in rows)
    total_fak_hrs = sum(float(r["total_fakibaji_hrs_30d"]) for r in rows)
    total_learn_hrs = sum(float(r["total_learning_hrs_30d"]) for r in rows)
    total_idle_hrs = sum(float(r["total_idle_hrs_30d"]) for r in rows)
    total_ent_hrs = sum(float(r["total_entertainment_hrs_30d"]) for r in rows)
    grand_total_hrs = total_prod_hrs + total_fak_hrs + total_learn_hrs + total_idle_hrs + total_ent_hrs

    activity_distribution = [
        {"name": "Productive Work", "hours": round(total_prod_hrs, 1), "pct": round(total_prod_hrs / grand_total_hrs * 100, 1), "color": "#10B981"},
        {"name": "Upskilling & Learning", "hours": round(total_learn_hrs, 1), "pct": round(total_learn_hrs / grand_total_hrs * 100, 1), "color": "#3B82F6"},
        {"name": "Idle / Away", "hours": round(total_idle_hrs, 1), "pct": round(total_idle_hrs / grand_total_hrs * 100, 1), "color": "#F59E0B"},
        {"name": "Entertainment / Social", "hours": round(total_ent_hrs, 1), "pct": round(total_ent_hrs / grand_total_hrs * 100, 1), "color": "#8B5CF6"},
        {"name": "Fakibaji / Slacking", "hours": round(total_fak_hrs, 1), "pct": round(total_fak_hrs / grand_total_hrs * 100, 1), "color": "#EF4444"},
    ]

    # Department Score vs Loss Chart
    dept_agg = {}
    for r in rows:
        bu = r["business_unit"]
        if bu not in dept_agg:
            dept_agg[bu] = {"name": bu, "score_sum": 0.0, "loss_sum": 0.0, "count": 0}
        dept_agg[bu]["score_sum"] += float(r["avg_productivity_score"])
        dept_agg[bu]["loss_sum"] += float(r["monthly_wasted_payroll_usd"])
        dept_agg[bu]["count"] += 1

    dept_chart = [
        {
            "department": k,
            "avg_score": round(v["score_sum"] / v["count"], 1),
            "monthly_loss": round(v["loss_sum"], 2)
        }
        for k, v in dept_agg.items()
    ]
    dept_chart.sort(key=lambda x: x["avg_score"], reverse=True)

    # Filter rows based on filter_type
    filtered_rows = rows
    if filter_type == "critical_fakibaji":
        filtered_rows = [r for r in rows if r["risk_level"] in ["Critical", "High"]]
    elif filter_type == "high_upskilling":
        filtered_rows = [r for r in rows if float(r["total_learning_hrs_30d"]) >= 20.0]
    elif filter_type == "top_performers":
        filtered_rows = [r for r in rows if float(r["avg_productivity_score"]) >= 88.0]

    employee_list = [
        {
            "id": r["id"],
            "staff_id": r["staff_id"],
            "name": r["name"],
            "designation": r["designation"],
            "department": r["business_unit"],
            "score": int(r["avg_productivity_score"]),
            "productive_hrs": f"{float(r['total_productive_hrs_30d']):.1f}h",
            "slacking_hrs": f"{float(r['total_fakibaji_hrs_30d']) + float(r['total_entertainment_hrs_30d']):.1f}h",
            "learning_hrs": f"{float(r['total_learning_hrs_30d']):.1f}h",
            "idle_hrs": f"{float(r['total_idle_hrs_30d']):.1f}h",
            "monthly_loss": f"${float(r['monthly_wasted_payroll_usd']):,.2f}",
            "risk_level": r["risk_level"],
            "telemetry_status": r["connection_status"],
            "primary_anomaly": r["primary_anomaly"],
            "recommended_action": r["recommended_action"]
        }
        for r in filtered_rows
    ]

    return {
        "mode": "department_loss_overview",
        "filter": filter_type,
        "kpis": {
            "monitored_workstations": total_emps,
            "avg_productivity_score": f"{avg_score}%",
            "monthly_payroll_loss": f"${total_monthly_loss:,.2f}",
            "slacking_rate": f"{round(total_fak_hrs / grand_total_hrs * 100, 1)}%",
            "learning_rate": f"{round(total_learn_hrs / grand_total_hrs * 100, 1)}%"
        },
        "activity_distribution": activity_distribution,
        "department_chart": dept_chart,
        "employees": employee_list,
        "summary": f"Workstation Telemetry Overview: {total_emps} monitored endpoints, {avg_score}% average score, ${total_monthly_loss:,.2f}/mo payroll loss."
    }
