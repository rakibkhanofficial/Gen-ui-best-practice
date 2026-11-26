import os
import sys
import json
import logging
from datetime import date, time, datetime, timedelta
import psycopg2
from psycopg2.extras import RealDictCursor

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("hris.seed")

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgrespassword@localhost:5432/genui_db")

SCHEMA_SQL = """
-- 1. Departments table
CREATE TABLE IF NOT EXISTS departments (
    id SERIAL PRIMARY KEY,
    code VARCHAR(10) UNIQUE NOT NULL,
    name VARCHAR(100) UNIQUE NOT NULL,
    head_of_department VARCHAR(100) NOT NULL,
    budget_yearly NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    office_location VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Employees table
CREATE TABLE IF NOT EXISTS employees (
    id SERIAL PRIMARY KEY,
    staff_id VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    designation VARCHAR(100) NOT NULL,
    department_id INT NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
    business_unit VARCHAR(100) NOT NULL,
    job_type VARCHAR(50) NOT NULL DEFAULT 'Full-time (Hybrid)',
    joining_date DATE NOT NULL,
    email VARCHAR(120) UNIQUE NOT NULL,
    phone VARCHAR(30) NOT NULL,
    location VARCHAR(100) NOT NULL,
    avatar_url TEXT NOT NULL,
    salary_usd NUMERIC(12, 2) NOT NULL,
    salary_bdt NUMERIC(14, 2) NOT NULL,
    salary_2025_usd NUMERIC(12, 2) DEFAULT 0.00,
    status VARCHAR(20) NOT NULL DEFAULT 'Active',
    supervisor_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Attendance & Biometric Punch Records table (multi-year)
CREATE TABLE IF NOT EXISTS attendance_records (
    id SERIAL PRIMARY KEY,
    employee_id INT NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    day_of_week VARCHAR(10) NOT NULL,
    first_punch TIME,
    last_punch TIME,
    total_hours NUMERIC(4, 2) NOT NULL DEFAULT 0.00,
    overtime_hours NUMERIC(4, 2) NOT NULL DEFAULT 0.00,
    status VARCHAR(30) NOT NULL, -- 'Present', 'Late', 'Absent', 'Remote', 'Sick Leave', 'Casual Leave'
    punch_type VARCHAR(30) NOT NULL DEFAULT 'On-site', -- 'On-site', 'Remote (VPN)', 'Leave'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT uq_employee_date UNIQUE (employee_id, date)
);

-- 4. Performance Reviews & Evaluation Scorecard table (multi-period)
CREATE TABLE IF NOT EXISTS performance_reviews (
    id SERIAL PRIMARY KEY,
    employee_id INT NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    review_period VARCHAR(30) NOT NULL, -- '2025-Annual', '2026-Q4'
    rating NUMERIC(3, 2) NOT NULL,
    kpi_score NUMERIC(5, 2) NOT NULL,
    projects_completed INT NOT NULL DEFAULT 0,
    review_status VARCHAR(50) NOT NULL,
    promotion_eligible BOOLEAN NOT NULL DEFAULT FALSE,
    supervisor_notes TEXT NOT NULL,
    competency_scores JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT uq_employee_review_period UNIQUE (employee_id, review_period)
);

-- Indexes for lightning fast relational analytics
CREATE INDEX IF NOT EXISTS idx_employees_dept ON employees(department_id);
CREATE INDEX IF NOT EXISTS idx_employees_staff_id ON employees(staff_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance_records(date);
CREATE INDEX IF NOT EXISTS idx_attendance_employee ON attendance_records(employee_id);
CREATE INDEX IF NOT EXISTS idx_attendance_status ON attendance_records(status);
CREATE INDEX IF NOT EXISTS idx_reviews_emp_period ON performance_reviews(employee_id, review_period);

-- Ensure columns exist
ALTER TABLE employees ADD COLUMN IF NOT EXISTS salary_2025_usd NUMERIC(12, 2) DEFAULT 0.00;
"""

DEPARTMENTS_SEED = [
    {"code": "ENG", "name": "Engineering", "head_of_department": "Tariqul Islam (CTO)", "budget_yearly": 1200000.00, "office_location": "Tower A, 8th Floor, Gulshan"},
    {"code": "DES", "name": "Product & Design", "head_of_department": "Fariha Anjum (VP Design)", "budget_yearly": 550000.00, "office_location": "Tower A, 6th Floor, Gulshan"},
    {"code": "SAL", "name": "Sales & Marketing", "head_of_department": "Marcus Vance (CMO)", "budget_yearly": 850000.00, "office_location": "Tower B, 4th Floor, Banani"},
    {"code": "HRO", "name": "HR & Operations", "head_of_department": "Sarah Chen (Chief People Officer)", "budget_yearly": 400000.00, "office_location": "Tower A, 5th Floor, Gulshan"},
    {"code": "FIN", "name": "Finance", "head_of_department": "David Sterling (CFO)", "budget_yearly": 600000.00, "office_location": "Tower B, 9th Floor, Banani"},
]

EMPLOYEES_SEED = [
    {
        "staff_id": "EMP-1001",
        "name": "Ayesha Rahman",
        "designation": "Lead AI & Systems Architect",
        "department_code": "ENG",
        "business_unit": "Cloud AI Solutions",
        "job_type": "Full-time (Hybrid)",
        "joining_date": date(2022, 2, 14),
        "email": "ayesha.rahman@enterprise.ai",
        "phone": "+880 1711-234567",
        "location": "Dhaka HQ / Gulshan",
        "avatar_url": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&q=80",
        "salary_usd": 125000.00,
        "salary_bdt": 240000.00,
        "salary_2025_usd": 105000.00,
        "supervisor_name": "Tariqul Islam (CTO)",
        # 2026 Performance
        "rating": 4.95,
        "kpi_score": 98.4,
        "projects_completed": 14,
        "review_status": "Exceeds Expectations",
        "promotion_eligible": True,
        "supervisor_notes": "Ayesha delivered exceptional technical leadership in 2026. Spearheaded GenUI and Antigravity orchestrator with 99.9% uptime.",
        "competencies": {"Technical Innovation": 99, "Punctuality & Reliability": 100, "Team Mentorship": 96, "Delivery Speed": 98},
        "attendance_profile_2026": {"present": 20, "late": 1, "absent": 0, "remote": 8, "base_in": "08:50", "base_out": "18:15", "avg_ot": 0.85},
        # 2025 Historical Baseline
        "rating_2025": 4.70,
        "kpi_score_2025": 93.2,
        "projects_2025": 10,
        "review_status_2025": "Exceeds Expectations",
        "supervisor_notes_2025": "Strong performance in 2025 as Senior Architect. Commendable delivery, occasional morning traffic delay.",
        "competencies_2025": {"Technical Innovation": 92, "Punctuality & Reliability": 88, "Team Mentorship": 89, "Delivery Speed": 91},
        "attendance_profile_2025": {"present": 18, "late": 4, "absent": 2, "remote": 5, "base_in": "09:12", "base_out": "17:45", "avg_ot": 0.35}
    },
    {
        "staff_id": "EMP-1002",
        "name": "Nusrat Jahan",
        "designation": "Principal Staff Engineer",
        "department_code": "ENG",
        "business_unit": "Core Infrastructure",
        "job_type": "Full-time (Hybrid)",
        "joining_date": date(2021, 6, 1),
        "email": "nusrat.jahan@enterprise.ai",
        "phone": "+880 1712-345678",
        "location": "Dhaka HQ / Gulshan",
        "avatar_url": "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=256&q=80",
        "salary_usd": 138000.00,
        "salary_bdt": 265000.00,
        "salary_2025_usd": 122000.00,
        "supervisor_name": "Tariqul Islam (CTO)",
        "rating": 4.98,
        "kpi_score": 99.2,
        "projects_completed": 16,
        "review_status": "Exceeds Expectations",
        "promotion_eligible": True,
        "supervisor_notes": "Flawless zero late punches for consecutive quarters in 2026. Stellar distributed database delivery.",
        "competencies": {"Distributed Systems": 100, "Punctuality & Reliability": 100, "Incident Resolution": 98, "Leadership": 97},
        "attendance_profile_2026": {"present": 20, "late": 0, "absent": 0, "remote": 6, "base_in": "08:45", "base_out": "18:25", "avg_ot": 1.1},
        # 2025 Baseline
        "rating_2025": 4.88,
        "kpi_score_2025": 97.0,
        "projects_2025": 13,
        "review_status_2025": "Exceeds Expectations",
        "supervisor_notes_2025": "Solid zero-absence cadence in 2025. Consistent morning arrival.",
        "competencies_2025": {"Distributed Systems": 96, "Punctuality & Reliability": 98, "Incident Resolution": 95, "Leadership": 93},
        "attendance_profile_2025": {"present": 20, "late": 1, "absent": 0, "remote": 4, "base_in": "08:48", "base_out": "18:10", "avg_ot": 0.8}
    },
    {
        "staff_id": "EMP-1003",
        "name": "Tanvir Hasan",
        "designation": "Senior Full-Stack Engineer",
        "department_code": "ENG",
        "business_unit": "Frontend & Edge Runtime",
        "job_type": "Full-time (On-site)",
        "joining_date": date(2023, 3, 15),
        "email": "tanvir.hasan@enterprise.ai",
        "phone": "+880 1713-456789",
        "location": "Dhaka HQ / Gulshan",
        "avatar_url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80",
        "salary_usd": 92000.00,
        "salary_bdt": 175000.00,
        "salary_2025_usd": 80000.00,
        "supervisor_name": "Ayesha Rahman (Lead Architect)",
        "rating": 4.70,
        "kpi_score": 93.0,
        "projects_completed": 11,
        "review_status": "Exceeds Expectations",
        "promotion_eligible": False,
        "supervisor_notes": "Significant overtime logged in 2026. Solved difficult Turbopack Next.js 16 and Recharts integration.",
        "competencies": {"Frontend Engineering": 96, "Punctuality & Reliability": 92, "Overtime Commitment": 99, "Problem Solving": 94},
        "attendance_profile_2026": {"present": 19, "late": 2, "absent": 1, "remote": 3, "base_in": "08:58", "base_out": "19:30", "avg_ot": 1.6},
        # 2025 Baseline
        "rating_2025": 4.35,
        "kpi_score_2025": 87.5,
        "projects_2025": 7,
        "review_status_2025": "Achieved Goals",
        "supervisor_notes_2025": "Good frontend contributions, but frequent late morning check-ins in 2025.",
        "competencies_2025": {"Frontend Engineering": 88, "Punctuality & Reliability": 79, "Overtime Commitment": 85, "Problem Solving": 84},
        "attendance_profile_2025": {"present": 17, "late": 5, "absent": 3, "remote": 2, "base_in": "09:25", "base_out": "18:05", "avg_ot": 0.5}
    },
    {
        "staff_id": "EMP-1004",
        "name": "Sadia Islam",
        "designation": "Director of Product & UX",
        "department_code": "DES",
        "business_unit": "Enterprise Experience",
        "job_type": "Full-time (Hybrid)",
        "joining_date": date(2020, 9, 10),
        "email": "sadia.islam@enterprise.ai",
        "phone": "+880 1714-567890",
        "location": "Dhaka HQ / Gulshan",
        "avatar_url": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80",
        "salary_usd": 115000.00,
        "salary_bdt": 220000.00,
        "salary_2025_usd": 102000.00,
        "supervisor_name": "Fariha Anjum (VP Design)",
        "rating": 4.88,
        "kpi_score": 96.5,
        "projects_completed": 12,
        "review_status": "Exceeds Expectations",
        "promotion_eligible": True,
        "supervisor_notes": "Established the corporate Design System with high fidelity in 2026. Consistent hybrid punch discipline.",
        "competencies": {"Design Strategy": 98, "Punctuality & Reliability": 96, "Cross-Team Alignment": 97, "User Centricity": 99},
        "attendance_profile_2026": {"present": 19, "late": 1, "absent": 1, "remote": 8, "base_in": "08:52", "base_out": "17:55", "avg_ot": 0.4},
        # 2025 Baseline
        "rating_2025": 4.75,
        "kpi_score_2025": 94.0,
        "projects_2025": 9,
        "review_status_2025": "Exceeds Expectations",
        "supervisor_notes_2025": "Strong product leadership throughout 2025.",
        "competencies_2025": {"Design Strategy": 94, "Punctuality & Reliability": 92, "Cross-Team Alignment": 93, "User Centricity": 95},
        "attendance_profile_2025": {"present": 19, "late": 2, "absent": 1, "remote": 6, "base_in": "09:02", "base_out": "17:40", "avg_ot": 0.3}
    },
    {
        "staff_id": "EMP-1005",
        "name": "Zubair Ahmed",
        "designation": "Senior UI/UX Interaction Designer",
        "department_code": "DES",
        "business_unit": "Design Systems",
        "job_type": "Full-time (Hybrid)",
        "joining_date": date(2023, 8, 1),
        "email": "zubair.ahmed@enterprise.ai",
        "phone": "+880 1715-678901",
        "location": "Dhaka HQ / Gulshan",
        "avatar_url": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80",
        "salary_usd": 78000.00,
        "salary_bdt": 145000.00,
        "salary_2025_usd": 72000.00,
        "supervisor_name": "Sadia Islam (Director UX)",
        "rating": 4.25,
        "kpi_score": 84.0,
        "projects_completed": 7,
        "review_status": "Achieved Goals",
        "promotion_eligible": False,
        "supervisor_notes": "Creative design, but punctuality dropped in 2026. Needs closer adherence to 09:00 AM punch standard.",
        "competencies": {"Visual Design": 91, "Punctuality & Reliability": 76, "Motion Prototyping": 89, "Sprint Velocity": 82},
        "attendance_profile_2026": {"present": 18, "late": 4, "absent": 2, "remote": 5, "base_in": "09:20", "base_out": "17:40", "avg_ot": 0.1},
        # 2025 Baseline
        "rating_2025": 4.40,
        "kpi_score_2025": 88.0,
        "projects_2025": 8,
        "review_status_2025": "Achieved Goals",
        "supervisor_notes_2025": "Good on-boarding year in 2025.",
        "competencies_2025": {"Visual Design": 88, "Punctuality & Reliability": 84, "Motion Prototyping": 86, "Sprint Velocity": 85},
        "attendance_profile_2025": {"present": 19, "late": 2, "absent": 1, "remote": 4, "base_in": "09:05", "base_out": "17:50", "avg_ot": 0.2}
    }
]

def generate_daily_punches(emp_id: int, profile: dict, start_date: date, end_date: date):
    records = []
    current = start_date
    working_days = []
    while current <= end_date:
        if current.weekday() not in [4, 5]: # Friday, Saturday weekend
            working_days.append(current)
        current += timedelta(days=1)

    total_days = len(working_days)
    absent_count = profile.get("absent", 0)
    late_count = profile.get("late", 0)
    remote_count = profile.get("remote", 0)

    absent_indices = set(range(min(absent_count, total_days)))
    late_indices = set(range(absent_count, min(absent_count + late_count, total_days)))
    remote_indices = set(range(absent_count + late_count, min(absent_count + late_count + remote_count, total_days)))

    for idx, d in enumerate(working_days):
        day_str = d.strftime("%a")
        if idx in absent_indices:
            records.append((emp_id, d, day_str, None, None, 0.00, 0.00, "Absent", "Leave"))
        elif idx in late_indices:
            minutes_late = 12 + (idx * 4) % 22
            first_p = time(9, minutes_late, 0)
            last_p = time(18, 15 + (idx * 3) % 20, 0)
            hours = 8.5
            ot = max(0.0, round(hours - 8.0, 2))
            records.append((emp_id, d, day_str, first_p, last_p, hours, ot, "Late", "On-site"))
        elif idx in remote_indices:
            first_p = time(8, 50, 0)
            last_p = time(18, 5, 0)
            hours = 8.8
            ot = 0.8
            records.append((emp_id, d, day_str, first_p, last_p, hours, ot, "Present", "Remote (VPN)"))
        else:
            mins = (idx * 3) % 15
            first_p = time(8, 42 + mins, 0)
            last_p = time(18, 10 + (idx * 4) % 30, 0)
            hours = round(9.0 + (idx % 3) * 0.3, 2)
            ot = round(max(0.0, hours - 8.0), 2)
            records.append((emp_id, d, day_str, first_p, last_p, hours, ot, "Present", "On-site"))

    return records


def run_seed():
    logger.info("Connecting to PostgreSQL to seed multi-year HRIS schema...")
    conn = psycopg2.connect(DATABASE_URL)
    cur = conn.cursor()

    try:
        cur.execute(SCHEMA_SQL)
        conn.commit()

        # Seed Departments
        dept_id_map = {}
        for d in DEPARTMENTS_SEED:
            cur.execute("""
                INSERT INTO departments (code, name, head_of_department, budget_yearly, office_location)
                VALUES (%s, %s, %s, %s, %s)
                ON CONFLICT (code) DO UPDATE SET
                    name = EXCLUDED.name,
                    head_of_department = EXCLUDED.head_of_department,
                    budget_yearly = EXCLUDED.budget_yearly,
                    office_location = EXCLUDED.office_location
                RETURNING id, code;
            """, (d["code"], d["name"], d["head_of_department"], d["budget_yearly"], d["office_location"]))
            row = cur.fetchone()
            dept_id_map[row[1]] = row[0]
        conn.commit()

        # Seed Employees & Multi-Year Reviews
        emp_id_map = {}
        for emp in EMPLOYEES_SEED:
            dept_id = dept_id_map[emp["department_code"]]
            cur.execute("""
                INSERT INTO employees (
                    staff_id, name, designation, department_id, business_unit,
                    job_type, joining_date, email, phone, location,
                    avatar_url, salary_usd, salary_bdt, salary_2025_usd, status, supervisor_name
                ) VALUES (
                    %s, %s, %s, %s, %s,
                    %s, %s, %s, %s, %s,
                    %s, %s, %s, %s, %s, %s
                )
                ON CONFLICT (staff_id) DO UPDATE SET
                    name = EXCLUDED.name,
                    designation = EXCLUDED.designation,
                    department_id = EXCLUDED.department_id,
                    business_unit = EXCLUDED.business_unit,
                    salary_usd = EXCLUDED.salary_usd,
                    salary_bdt = EXCLUDED.salary_bdt,
                    salary_2025_usd = EXCLUDED.salary_2025_usd,
                    supervisor_name = EXCLUDED.supervisor_name
                RETURNING id, staff_id;
            """, (
                emp["staff_id"], emp["name"], emp["designation"], dept_id, emp["business_unit"],
                emp["job_type"], emp["joining_date"], emp["email"], emp["phone"], emp["location"],
                emp["avatar_url"], emp["salary_usd"], emp["salary_bdt"], emp.get("salary_2025_usd", emp["salary_usd"] * 0.85),
                "Active", emp["supervisor_name"]
            ))
            emp_id, staff_id = cur.fetchone()
            emp_id_map[staff_id] = (emp_id, emp)

            # 2026 Review
            cur.execute("""
                INSERT INTO performance_reviews (
                    employee_id, review_period, rating, kpi_score, projects_completed,
                    review_status, promotion_eligible, supervisor_notes, competency_scores
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (employee_id, review_period) DO UPDATE SET
                    rating = EXCLUDED.rating,
                    kpi_score = EXCLUDED.kpi_score,
                    projects_completed = EXCLUDED.projects_completed,
                    review_status = EXCLUDED.review_status,
                    promotion_eligible = EXCLUDED.promotion_eligible,
                    supervisor_notes = EXCLUDED.supervisor_notes,
                    competency_scores = EXCLUDED.competency_scores;
            """, (
                emp_id, "2026-Q4", emp["rating"], emp["kpi_score"], emp["projects_completed"],
                emp["review_status"], emp["promotion_eligible"], emp["supervisor_notes"],
                json.dumps(emp["competencies"])
            ))

            # 2025 Historical Review
            cur.execute("""
                INSERT INTO performance_reviews (
                    employee_id, review_period, rating, kpi_score, projects_completed,
                    review_status, promotion_eligible, supervisor_notes, competency_scores
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (employee_id, review_period) DO UPDATE SET
                    rating = EXCLUDED.rating,
                    kpi_score = EXCLUDED.kpi_score,
                    projects_completed = EXCLUDED.projects_completed,
                    review_status = EXCLUDED.review_status,
                    promotion_eligible = EXCLUDED.promotion_eligible,
                    supervisor_notes = EXCLUDED.supervisor_notes,
                    competency_scores = EXCLUDED.competency_scores;
            """, (
                emp_id, "2025-Annual", emp["rating_2025"], emp["kpi_score_2025"], emp["projects_2025"],
                emp["review_status_2025"], False, emp["supervisor_notes_2025"],
                json.dumps(emp["competencies_2025"])
            ))

        conn.commit()

        # Seed Attendance for BOTH 2025 (Nov 1-26, 2025) and 2026 (Nov 1-26, 2026)
        total_attendance = 0
        for staff_id, (emp_id, emp_data) in emp_id_map.items():
            # 2025 Swipes
            punches_2025 = generate_daily_punches(
                emp_id, emp_data["attendance_profile_2025"], date(2025, 11, 1), date(2025, 11, 26)
            )
            for p in punches_2025:
                cur.execute("""
                    INSERT INTO attendance_records (
                        employee_id, date, day_of_week, first_punch, last_punch,
                        total_hours, overtime_hours, status, punch_type
                    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                    ON CONFLICT (employee_id, date) DO UPDATE SET
                        first_punch = EXCLUDED.first_punch,
                        last_punch = EXCLUDED.last_punch,
                        total_hours = EXCLUDED.total_hours,
                        overtime_hours = EXCLUDED.overtime_hours,
                        status = EXCLUDED.status,
                        punch_type = EXCLUDED.punch_type;
                """, p)
                total_attendance += 1

            # 2026 Swipes
            punches_2026 = generate_daily_punches(
                emp_id, emp_data["attendance_profile_2026"], date(2026, 11, 1), date(2026, 11, 26)
            )
            for p in punches_2026:
                cur.execute("""
                    INSERT INTO attendance_records (
                        employee_id, date, day_of_week, first_punch, last_punch,
                        total_hours, overtime_hours, status, punch_type
                    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                    ON CONFLICT (employee_id, date) DO UPDATE SET
                        first_punch = EXCLUDED.first_punch,
                        last_punch = EXCLUDED.last_punch,
                        total_hours = EXCLUDED.total_hours,
                        overtime_hours = EXCLUDED.overtime_hours,
                        status = EXCLUDED.status,
                        punch_type = EXCLUDED.punch_type;
                """, p)
                total_attendance += 1

        conn.commit()
        logger.info(f"Seeded {total_attendance} multi-year punch swipes across 2025 and 2026.")
        print(f"=== SEED COMPLETE: 2025 & 2026 MULTI-YEAR DATA SEEDED ({total_attendance} swipes) ===")

    except Exception as e:
        conn.rollback()
        logger.error(f"Error seeding database: {e}")
        raise
    finally:
        cur.close()
        conn.close()

if __name__ == "__main__":
    run_seed()
