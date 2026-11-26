"""
seed_productivity_telemetry.py
Seeds workstation agent device bindings, daily behavioral telemetry logs, and
financial loss impact projections for Employee Productivity Intelligence.
"""

import json
import logging
import os
import random
from datetime import datetime, date, timedelta
import psycopg2
from psycopg2.extras import execute_values, Json

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("seed_productivity")

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgrespassword@localhost:5432/genui_db")

SCHEMA_SQL = """
-- 1. Workstation Endpoint Agent Bindings
CREATE TABLE IF NOT EXISTS workstation_agents (
    id SERIAL PRIMARY KEY,
    employee_id INT NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    agent_uuid VARCHAR(64) UNIQUE NOT NULL,
    hostname VARCHAR(128) NOT NULL,
    os_platform VARCHAR(64) NOT NULL,
    client_version VARCHAR(32) NOT NULL,
    agent_type VARCHAR(32) NOT NULL DEFAULT 'Unified Desktop Daemon',
    last_heartbeat TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    connection_status VARCHAR(32) NOT NULL DEFAULT 'online', -- online, idle, offline
    api_key_prefix VARCHAR(16) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Daily Productivity & Telemetry Logs
CREATE TABLE IF NOT EXISTS employee_daily_productivity (
    id SERIAL PRIMARY KEY,
    employee_id INT NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    work_date DATE NOT NULL,
    total_tracked_hours NUMERIC(4,2) NOT NULL,
    productive_hours NUMERIC(4,2) NOT NULL,
    idle_hours NUMERIC(4,2) NOT NULL,
    fakibaji_hours NUMERIC(4,2) NOT NULL,       -- slacking, fake mouse wiggling, ghost browsing
    learning_hours NUMERIC(4,2) NOT NULL,       -- documentation, Coursera, research, upskilling
    entertainment_hours NUMERIC(4,2) NOT NULL,  -- YouTube gaming, Netflix, social media
    offline_hours NUMERIC(4,2) NOT NULL,        -- sleep/screen lock during scheduled shift
    productivity_score INT NOT NULL,            -- 0 to 100
    mouse_wiggler_detected BOOLEAN NOT NULL DEFAULT FALSE,
    wiggler_event_count INT NOT NULL DEFAULT 0,
    keystrokes_total INT NOT NULL DEFAULT 0,
    hourly_timeline JSONB NOT NULL DEFAULT '[]'::jsonb,
    top_applications JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_emp_date UNIQUE (employee_id, work_date)
);

-- 3. Monthly Financial Loss & Productivity Aggregates
CREATE TABLE IF NOT EXISTS employee_productivity_summary (
    id SERIAL PRIMARY KEY,
    employee_id INT NOT NULL UNIQUE REFERENCES employees(id) ON DELETE CASCADE,
    avg_productivity_score NUMERIC(5,2) NOT NULL,
    total_productive_hrs_30d NUMERIC(6,2) NOT NULL,
    total_fakibaji_hrs_30d NUMERIC(6,2) NOT NULL,
    total_learning_hrs_30d NUMERIC(6,2) NOT NULL,
    total_idle_hrs_30d NUMERIC(6,2) NOT NULL,
    total_entertainment_hrs_30d NUMERIC(6,2) NOT NULL,
    hourly_rate_usd NUMERIC(8,2) NOT NULL,
    monthly_wasted_payroll_usd NUMERIC(10,2) NOT NULL,
    annual_projected_loss_usd NUMERIC(10,2) NOT NULL,
    risk_level VARCHAR(32) NOT NULL,             -- Low, Moderate, High, Critical
    primary_anomaly VARCHAR(255) NOT NULL,
    recommended_action VARCHAR(255) NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_daily_prod_emp_date ON employee_daily_productivity(employee_id, work_date);
CREATE INDEX IF NOT EXISTS idx_prod_summary_risk ON employee_productivity_summary(risk_level);
"""

# Archetypes for the 10 employees to create rich, distinct, realistic behavioral patterns
EMPLOYEE_ARCHETYPES = {
    "EMP-1001": {  # Ayesha Rahman (Lead AI Architect)
        "hostname": "macbook-m3max-ayesha.corp",
        "os": "macOS 14.5 (Sonoma)",
        "score_base": 91,
        "productive_ratio": 0.82,
        "learning_ratio": 0.12,
        "idle_ratio": 0.04,
        "entertainment_ratio": 0.02,
        "fakibaji_ratio": 0.00,
        "wiggler": False,
        "anomaly": "Optimal High Focus — Balanced deep architecture & technical research",
        "action": "Eligible for Engineering Leadership Excellence Bonus",
        "apps": [
            {"name": "VS Code / Cursor", "category": "Productive", "icon": "Code", "hours": 3.8},
            {"name": "Claude / Gemini Research", "category": "Learning", "icon": "Sparkles", "hours": 1.4},
            {"name": "GitHub PR Reviews", "category": "Productive", "icon": "GitPullRequest", "hours": 1.5},
            {"name": "Slack & Zoom Huddles", "category": "Productive", "icon": "MessageSquare", "hours": 1.2},
            {"name": "Spotify (Audio Focus)", "category": "Entertainment", "icon": "Headphones", "hours": 0.3}
        ]
    },
    "EMP-1002": {  # Nusrat Jahan (Principal Staff Engineer)
        "hostname": "thinkpad-p1-nusrat.corp",
        "os": "Ubuntu 24.04 LTS",
        "score_base": 95,
        "productive_ratio": 0.88,
        "learning_ratio": 0.08,
        "idle_ratio": 0.03,
        "entertainment_ratio": 0.01,
        "fakibaji_ratio": 0.00,
        "wiggler": False,
        "anomaly": "Top Tier Velocity — Zero detected slacking across 30-day tracking",
        "action": "Retain & Benchmark as Organization Role Model",
        "apps": [
            {"name": "Neovim / GoLand", "category": "Productive", "icon": "Terminal", "hours": 4.5},
            {"name": "Kubernetes & ArgoCD", "category": "Productive", "icon": "Server", "hours": 2.2},
            {"name": "arXiv Distributed Systems", "category": "Learning", "icon": "BookOpen", "hours": 0.9},
            {"name": "Linear / Jira", "category": "Productive", "icon": "CheckSquare", "hours": 0.5}
        ]
    },
    "EMP-1003": {  # Tanvir Hasan (Senior Full-Stack Engineer) - High Upskilling Hero
        "hostname": "macbook-air-m2-tanvir.local",
        "os": "macOS 14.4",
        "score_base": 84,
        "productive_ratio": 0.68,
        "learning_ratio": 0.22,  # exceptional self-learning
        "idle_ratio": 0.05,
        "entertainment_ratio": 0.04,
        "fakibaji_ratio": 0.01,
        "wiggler": False,
        "anomaly": "High Self-Upskilling — 2.2h/day on Coursera, Next.js 15 & PyTorch",
        "action": "Sponsor Advanced Certification & Promote to Tech Lead",
        "apps": [
            {"name": "VS Code & Chrome DevTools", "category": "Productive", "icon": "Code", "hours": 4.2},
            {"name": "Coursera & DeepLearning.AI", "category": "Learning", "icon": "GraduationCap", "hours": 1.8},
            {"name": "MDN & React Docs", "category": "Learning", "icon": "BookOpen", "hours": 0.6},
            {"name": "YouTube Tech Talks", "category": "Entertainment", "icon": "Video", "hours": 0.5},
            {"name": "Slack Standups", "category": "Productive", "icon": "MessageSquare", "hours": 0.8}
        ]
    },
    "EMP-1004": {  # Sadia Islam (Director of Product & UX)
        "hostname": "macbook-pro-m3-sadia.corp",
        "os": "macOS 14.5",
        "score_base": 88,
        "productive_ratio": 0.78,
        "learning_ratio": 0.10,
        "idle_ratio": 0.07,
        "entertainment_ratio": 0.04,
        "fakibaji_ratio": 0.01,
        "wiggler": False,
        "anomaly": "High Cross-Team Collaboration — Frequent multi-device meetings",
        "action": "Optimize Meeting Cadence to reduce meeting fatigue",
        "apps": [
            {"name": "Figma & FigJam", "category": "Productive", "icon": "PenTool", "hours": 3.6},
            {"name": "Notion Product Specs", "category": "Productive", "icon": "FileText", "hours": 2.1},
            {"name": "Zoom Executive Sync", "category": "Productive", "icon": "Video", "hours": 1.5},
            {"name": "Nielsen Norman Group UX", "category": "Learning", "icon": "BookOpen", "hours": 0.8}
        ]
    },
    "EMP-1005": {  # Zubair Ahmed (Senior UI/UX Designer) - High Idle / Sleep
        "hostname": "imac-24-zubair.local",
        "os": "macOS 14.2",
        "score_base": 61,
        "productive_ratio": 0.52,
        "learning_ratio": 0.06,
        "idle_ratio": 0.24,  # High Idle / Sleep during shift
        "entertainment_ratio": 0.12,
        "fakibaji_ratio": 0.06,
        "wiggler": False,
        "anomaly": "Excessive Idle Time — 2.4h/day screen lock / AFK during core shift",
        "action": "Schedule 1-on-1 Performance Check-in & Align Core Sprint Hours",
        "apps": [
            {"name": "Figma Desktop", "category": "Productive", "icon": "PenTool", "hours": 3.2},
            {"name": "Screen Saver / Idle AFK", "category": "Idle", "icon": "Moon", "hours": 2.3},
            {"name": "YouTube Music & Vlogs", "category": "Entertainment", "icon": "Youtube", "hours": 1.2},
            {"name": "Behance & Dribbble", "category": "Learning", "icon": "Eye", "hours": 0.6},
            {"name": "Discord Non-Work Chats", "category": "Fakibaji", "icon": "MessageCircle", "hours": 0.6}
        ]
    },
    "EMP-1006": {  # Kazi Mahfuzur Rahman (VP of Global Enterprise Sales)
        "hostname": "dell-xps-15-mahfuz.corp",
        "os": "Windows 11 Enterprise",
        "score_base": 79,
        "productive_ratio": 0.70,
        "learning_ratio": 0.05,
        "idle_ratio": 0.16,  # travel/client lunch
        "entertainment_ratio": 0.07,
        "fakibaji_ratio": 0.02,
        "wiggler": False,
        "anomaly": "External Client Travel — Frequent off-device enterprise calls",
        "action": "Reconcile CRM Mobile App Logs with Workstation Telemetry",
        "apps": [
            {"name": "Salesforce CRM & Gong", "category": "Productive", "icon": "BarChart2", "hours": 3.5},
            {"name": "Microsoft Teams & Outlook", "category": "Productive", "icon": "Mail", "hours": 2.5},
            {"name": "LinkedIn Sales Navigator", "category": "Productive", "icon": "Users", "hours": 0.8},
            {"name": "Bloomberg & Financial News", "category": "Entertainment", "icon": "Globe", "hours": 0.6}
        ]
    },
    "EMP-1007": {  # Farhana Chowdhury (Lead HR Operations)
        "hostname": "macbook-air-m3-farhana.corp",
        "os": "macOS 14.5",
        "score_base": 86,
        "productive_ratio": 0.77,
        "learning_ratio": 0.09,
        "idle_ratio": 0.08,
        "entertainment_ratio": 0.05,
        "fakibaji_ratio": 0.01,
        "wiggler": False,
        "anomaly": "High Compliance Punctuality — Stable operational workload",
        "action": "Steady Contributor — Maintain Current Workload",
        "apps": [
            {"name": "BambooHR & Workday", "category": "Productive", "icon": "Users", "hours": 3.8},
            {"name": "Google Sheets (Payroll Audit)", "category": "Productive", "icon": "Table", "hours": 2.2},
            {"name": "SHRM Labor Law Webinars", "category": "Learning", "icon": "Shield", "hours": 0.7},
            {"name": "Gmail & Calendar", "category": "Productive", "icon": "Calendar", "hours": 0.8}
        ]
    },
    "EMP-1008": {  # Rafiqul Alam (Senior Financial Controller) - CRITICAL FAKIBAJI / WIGGLER
        "hostname": "thinkpad-x1-rafiqul.corp",
        "os": "Windows 11 Enterprise",
        "score_base": 46,
        "productive_ratio": 0.38,
        "learning_ratio": 0.03,
        "idle_ratio": 0.12,
        "entertainment_ratio": 0.22,
        "fakibaji_ratio": 0.25,  # Blatant Fakibaji + Synthetic Wiggler!
        "wiggler": True,
        "anomaly": "CRITICAL ANOMALY: Hardware Mouse Jiggler detected on USB Port 2 (14:10–16:40)",
        "action": "Immediate Formal HR Audit & Potential Disciplinary Review",
        "apps": [
            {"name": "USB Synthetic Mouse Wiggler", "category": "Fakibaji", "icon": "AlertTriangle", "hours": 2.4},
            {"name": "Netflix & Twitch Gaming", "category": "Entertainment", "icon": "Tv", "hours": 1.8},
            {"name": "Robinhood / Binance Crypto", "category": "Entertainment", "icon": "TrendingUp", "hours": 1.1},
            {"name": "SAP ERP Finance", "category": "Productive", "icon": "Database", "hours": 2.2},
            {"name": "Excel (Ledger Audit)", "category": "Productive", "icon": "FileSpreadsheet", "hours": 0.9}
        ]
    },
    "EMP-1009": {  # Sabrina Haque (Senior Growth Marketing Manager)
        "hostname": "macbook-pro-14-sabrina.local",
        "os": "macOS 14.3",
        "score_base": 76,
        "productive_ratio": 0.65,
        "learning_ratio": 0.11,
        "idle_ratio": 0.09,
        "entertainment_ratio": 0.12,
        "fakibaji_ratio": 0.03,
        "wiggler": False,
        "anomaly": "Social Media Heavy — High overlap between campaign research and personal browsing",
        "action": "Separate Corporate Enterprise Social accounts from personal browsers",
        "apps": [
            {"name": "Meta Ads & Google Ads", "category": "Productive", "icon": "TrendingUp", "hours": 3.0},
            {"name": "HubSpot & Google Analytics", "category": "Productive", "icon": "PieChart", "hours": 1.8},
            {"name": "Instagram & TikTok Creator Hub", "category": "Entertainment", "icon": "Share2", "hours": 1.6},
            {"name": "Reforge Growth Marketing", "category": "Learning", "icon": "Zap", "hours": 0.9}
        ]
    },
    "EMP-1010": {  # Asif Karim (DevOps & Cloud Security Architect)
        "hostname": "arch-linux-asif.corp",
        "os": "Arch Linux (Kernel 6.9)",
        "score_base": 92,
        "productive_ratio": 0.84,
        "learning_ratio": 0.09,
        "idle_ratio": 0.04,
        "entertainment_ratio": 0.03,
        "fakibaji_ratio": 0.00,
        "wiggler": False,
        "anomaly": "High Technical Rigor — High nocturnal terminal activity and zero avoidance",
        "action": "Ensure Mandatory Rest Windows to prevent nocturnal burnout",
        "apps": [
            {"name": "Kitty Terminal / Tmux / Zsh", "category": "Productive", "icon": "Terminal", "hours": 4.6},
            {"name": "AWS CloudWatch & Grafana", "category": "Productive", "icon": "Activity", "hours": 2.1},
            {"name": "Cloud Native Security Docs", "category": "Learning", "icon": "ShieldCheck", "hours": 0.8},
            {"name": "HackerNews & Tech Feeds", "category": "Learning", "icon": "Rss", "hours": 0.5}
        ]
    }
}


def generate_hourly_timeline(archetype: dict) -> list:
    """Generates an 8-hour shift timeline (09:00 to 17:00) with minute allocations."""
    slots = [
        "09:00 - 10:00",
        "10:00 - 11:00",
        "11:00 - 12:00",
        "12:00 - 13:00",
        "13:00 - 14:00",
        "14:00 - 15:00",
        "15:00 - 16:00",
        "16:00 - 17:00",
    ]

    p_rat = archetype["productive_ratio"]
    f_rat = archetype["fakibaji_ratio"]
    l_rat = archetype["learning_ratio"]
    i_rat = archetype["idle_ratio"]
    e_rat = archetype["entertainment_ratio"]

    timeline = []
    for idx, slot in enumerate(slots):
        # 12:00 - 13:00 is lunch / personal break
        if idx == 3:
            slot_prod = round(60 * 0.15)
            slot_idle = round(60 * 0.50)
            slot_ent = round(60 * 0.35)
            slot_fak = 0
            slot_learn = 0
        elif archetype.get("wiggler") and idx in [5, 6]:  # Afternoon wiggler hours (14:00 - 16:00)
            slot_fak = round(60 * 0.70)
            slot_ent = round(60 * 0.20)
            slot_prod = round(60 * 0.10)
            slot_idle = 0
            slot_learn = 0
        else:
            slot_prod = max(5, int(60 * p_rat + random.uniform(-4, 4)))
            slot_learn = max(0, int(60 * l_rat + random.uniform(-2, 2)))
            slot_ent = max(0, int(60 * e_rat + random.uniform(-2, 2)))
            slot_fak = max(0, int(60 * f_rat + random.uniform(-2, 2)))
            rem = 60 - (slot_prod + slot_learn + slot_ent + slot_fak)
            slot_idle = max(0, rem)

        tot = slot_prod + slot_learn + slot_ent + slot_fak + slot_idle
        if tot != 60 and tot > 0:
            slot_prod += (60 - tot)

        timeline.append({
            "slot": slot,
            "productive_mins": max(0, slot_prod),
            "learning_mins": max(0, slot_learn),
            "entertainment_mins": max(0, slot_ent),
            "fakibaji_mins": max(0, slot_fak),
            "idle_mins": max(0, slot_idle),
        })

    return timeline


def run_seed():
    logger.info("Connecting to PostgreSQL to seed Workstation Productivity Telemetry...")
    conn = psycopg2.connect(DATABASE_URL)
    cur = conn.cursor()

    try:
        # Create Tables & Indices
        cur.execute(SCHEMA_SQL)
        conn.commit()
        logger.info("Productivity Telemetry schema verified.")

        # Fetch all seeded employees
        cur.execute("SELECT id, staff_id, name, designation, salary_usd FROM employees ORDER BY id;")
        employees = cur.fetchall()

        if not employees:
            logger.error("No employees found in 'employees' table. Please run seed_hris.py first.")
            return

        logger.info(f"Found {len(employees)} employees. Generating workstation telemetry...")

        # 1. Clean old telemetry records for clean re-seed
        cur.execute("TRUNCATE TABLE employee_productivity_summary, employee_daily_productivity, workstation_agents CASCADE;")
        conn.commit()

        # 2. Seed Workstation Agents
        agent_records = []
        for emp_id, staff_id, name, designation, salary_usd in employees:
            arch = EMPLOYEE_ARCHETYPES.get(staff_id, {
                "hostname": f"workstation-{staff_id.lower()}.corp",
                "os": "macOS 14.5",
                "score_base": 80,
                "productive_ratio": 0.75,
                "learning_ratio": 0.10,
                "idle_ratio": 0.08,
                "entertainment_ratio": 0.05,
                "fakibaji_ratio": 0.02,
                "wiggler": False,
                "anomaly": "Standard Corporate Activity",
                "action": "Regular Quarterly Review",
                "apps": []
            })

            agent_uuid = f"agt-pulse-{staff_id.lower()}-{random.randint(1000, 9999)}"
            api_prefix = f"ak_live_{random.randint(100000, 999999)}"
            status = "online" if staff_id != "EMP-1005" else "idle"
            heartbeat_ago = timedelta(seconds=random.randint(5, 120))
            heartbeat = datetime.now() - heartbeat_ago

            agent_records.append((
                emp_id,
                agent_uuid,
                arch["hostname"],
                arch["os"],
                "v2.4.1",
                "Unified Desktop Daemon",
                heartbeat,
                status,
                api_prefix
            ))

        agent_insert_sql = """
            INSERT INTO workstation_agents 
            (employee_id, agent_uuid, hostname, os_platform, client_version, agent_type, last_heartbeat, connection_status, api_key_prefix)
            VALUES %s;
        """
        execute_values(cur, agent_insert_sql, agent_records)
        conn.commit()
        logger.info(f"Seeded {len(agent_records)} Workstation Agent bindings.")

        # 3. Seed Daily Telemetry Logs (Past 14 Workdays)
        today = date(2026, 11, 26)
        work_days = []
        curr = today - timedelta(days=20)
        while curr <= today:
            # Exclude weekends (Saturday = 5, Sunday = 6 in python weekday where Monday=0)
            if curr.weekday() < 5:
                work_days.append(curr)
            curr += timedelta(days=1)

        daily_records = []
        summary_records = []

        for emp_id, staff_id, name, designation, salary_usd in employees:
            arch = EMPLOYEE_ARCHETYPES.get(staff_id, EMPLOYEE_ARCHETYPES["EMP-1001"])
            hourly_rate = round(float(salary_usd) / 2080.0, 2)  # standard 2080 annual work hours

            tot_prod_hrs = 0.0
            tot_fak_hrs = 0.0
            tot_learn_hrs = 0.0
            tot_idle_hrs = 0.0
            tot_ent_hrs = 0.0
            scores = []

            for d in work_days:
                total_hrs = 8.0
                p_hrs = round(total_hrs * arch["productive_ratio"] + random.uniform(-0.3, 0.3), 2)
                l_hrs = round(total_hrs * arch["learning_ratio"] + random.uniform(-0.15, 0.15), 2)
                f_hrs = round(total_hrs * arch["fakibaji_ratio"] + random.uniform(-0.1, 0.2) if arch["fakibaji_ratio"] > 0 else 0.0, 2)
                e_hrs = round(total_hrs * arch["entertainment_ratio"] + random.uniform(-0.15, 0.15), 2)
                i_hrs = max(0.2, round(total_hrs - (p_hrs + l_hrs + f_hrs + e_hrs), 2))
                offline_hrs = 0.0

                wiggler_detected = arch.get("wiggler", False)
                wiggler_events = random.randint(3, 8) if wiggler_detected else 0

                # Score calculation
                score = int(arch["score_base"] + random.randint(-3, 3))
                score = max(20, min(100, score))
                scores.append(score)

                tot_prod_hrs += p_hrs
                tot_fak_hrs += f_hrs
                tot_learn_hrs += l_hrs
                tot_idle_hrs += i_hrs
                tot_ent_hrs += e_hrs

                keystrokes = int(p_hrs * random.randint(1800, 3200)) if not wiggler_detected else int(p_hrs * 1200 + 4500)
                timeline = generate_hourly_timeline(arch)
                top_apps = arch.get("apps", [])

                daily_records.append((
                    emp_id,
                    d,
                    total_hrs,
                    p_hrs,
                    i_hrs,
                    f_hrs,
                    l_hrs,
                    e_hrs,
                    offline_hrs,
                    score,
                    wiggler_detected,
                    wiggler_events,
                    keystrokes,
                    Json(timeline),
                    Json(top_apps)
                ))

            # Monthly summary aggregation (scaled to standard 21.6 monthly workdays)
            scale = 21.6 / len(work_days)
            m_prod = round(tot_prod_hrs * scale, 1)
            m_fak = round(tot_fak_hrs * scale, 1)
            m_learn = round(tot_learn_hrs * scale, 1)
            m_idle = round(tot_idle_hrs * scale, 1)
            m_ent = round(tot_ent_hrs * scale, 1)

            # Unproductive / Wasted hours = Fakibaji + Entertainment + (excess idle beyond standard 1.2h/day break)
            excess_idle = max(0.0, m_idle - (1.2 * 21.6))
            wasted_hours = m_fak + m_ent + excess_idle
            monthly_loss = round(wasted_hours * hourly_rate, 2)
            annual_loss = round(monthly_loss * 12, 2)
            avg_score = round(sum(scores) / len(scores), 1)

            if avg_score >= 88:
                risk = "Low"
            elif avg_score >= 75:
                risk = "Moderate"
            elif avg_score >= 60:
                risk = "High"
            else:
                risk = "Critical"

            summary_records.append((
                emp_id,
                avg_score,
                m_prod,
                m_fak,
                m_learn,
                m_idle,
                m_ent,
                hourly_rate,
                monthly_loss,
                annual_loss,
                risk,
                arch["anomaly"],
                arch["action"]
            ))

        daily_insert_sql = """
            INSERT INTO employee_daily_productivity
            (employee_id, work_date, total_tracked_hours, productive_hours, idle_hours, fakibaji_hours,
             learning_hours, entertainment_hours, offline_hours, productivity_score, mouse_wiggler_detected,
             wiggler_event_count, keystrokes_total, hourly_timeline, top_applications)
            VALUES %s;
        """
        execute_values(cur, daily_insert_sql, daily_records)
        conn.commit()
        logger.info(f"Seeded {len(daily_records)} Daily Telemetry rows ({len(work_days)} workdays across {len(employees)} employees).")

        summary_insert_sql = """
            INSERT INTO employee_productivity_summary
            (employee_id, avg_productivity_score, total_productive_hrs_30d, total_fakibaji_hrs_30d,
             total_learning_hrs_30d, total_idle_hrs_30d, total_entertainment_hrs_30d, hourly_rate_usd,
             monthly_wasted_payroll_usd, annual_projected_loss_usd, risk_level, primary_anomaly, recommended_action)
            VALUES %s;
        """
        execute_values(cur, summary_insert_sql, summary_records)
        conn.commit()
        logger.info(f"Seeded {len(summary_records)} Monthly Productivity & Financial Loss summaries.")

        print("=== WORKSTATION PRODUCTIVITY TELEMETRY SEED COMPLETED SUCCESSFULLY ===")

    except Exception as e:
        conn.rollback()
        logger.error(f"Seeding failed: {e}", exc_info=True)
        raise
    finally:
        cur.close()
        conn.close()


if __name__ == "__main__":
    run_seed()
