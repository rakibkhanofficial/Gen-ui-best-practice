import os
import sys
import logging
from datetime import date, timedelta
import random
import psycopg2
from psycopg2.extras import RealDictCursor

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("pos.seed")

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgrespassword@localhost:5432/genui_db")

SCHEMA_SQL = """
-- 1. POS Product Categories
CREATE TABLE IF NOT EXISTS pos_categories (
    id SERIAL PRIMARY KEY,
    code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    color VARCHAR(30) DEFAULT '#3b82f6',
    target_turnover_days INT DEFAULT 30,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Inventory Items with Reorder & Stockout Analytics
CREATE TABLE IF NOT EXISTS pos_inventory_items (
    id SERIAL PRIMARY KEY,
    sku VARCHAR(50) UNIQUE NOT NULL,
    barcode VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(150) NOT NULL,
    category_id INT NOT NULL REFERENCES pos_categories(id) ON DELETE CASCADE,
    unit VARCHAR(20) DEFAULT 'pcs',
    cost_price NUMERIC(10, 2) NOT NULL,
    selling_price NUMERIC(10, 2) NOT NULL,
    margin_pct NUMERIC(5, 2) NOT NULL,
    current_stock INT NOT NULL,
    min_safety_stock INT NOT NULL,
    reorder_point INT NOT NULL,
    reorder_quantity_eoq INT NOT NULL,
    lead_time_days INT NOT NULL DEFAULT 3,
    daily_velocity NUMERIC(8, 2) NOT NULL DEFAULT 1.0,
    stockout_risk_level VARCHAR(20) NOT NULL DEFAULT 'HEALTHY',
    days_of_inventory_left NUMERIC(8, 1) NOT NULL,
    supplier_name VARCHAR(100) NOT NULL,
    supplier_lead_time_rating NUMERIC(3, 1) DEFAULT 4.8,
    seasonal_factor NUMERIC(4, 2) DEFAULT 1.0,
    sales_trend_30d VARCHAR(30) DEFAULT 'Steady',
    abc_class VARCHAR(5) DEFAULT 'B',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Historical Daily POS Sales & Velocity Tracking
CREATE TABLE IF NOT EXISTS pos_sales_history (
    id SERIAL PRIMARY KEY,
    item_id INT NOT NULL REFERENCES pos_inventory_items(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    units_sold INT NOT NULL,
    revenue NUMERIC(12, 2) NOT NULL,
    profit NUMERIC(12, 2) NOT NULL,
    peak_hour_units INT DEFAULT 0,
    UNIQUE(item_id, date)
);
"""

CATEGORIES_SEED = [
    {"code": "ELEC", "name": "Electronics & Smart Tech", "color": "#3b82f6", "turnover": 25},
    {"code": "FMCG", "name": "FMCG & Cold Beverages", "color": "#10b981", "turnover": 10},
    {"code": "PHARM", "name": "Health & OTC Pharmacy", "color": "#8b5cf6", "turnover": 20},
    {"code": "FASH", "name": "Apparel & Seasonal Wear", "color": "#f59e0b", "turnover": 45},
    {"code": "HARD", "name": "Hardware & Power Tools", "color": "#6366f1", "turnover": 35},
]

ITEMS_SEED = [
    # 1. Critical Stockout (Urgent restock needed <3 days)
    {
        "sku": "SKU-ELEC-881",
        "barcode": "890123456001",
        "name": "UltraFast GaN 65W Dual-Port Charger",
        "cat_code": "ELEC",
        "unit": "pcs",
        "cost": 14.50,
        "price": 28.99,
        "stock": 12,
        "min_safety": 25,
        "reorder_point": 35,
        "eoq": 80,
        "lead_time": 3,
        "velocity": 4.8,
        "risk": "CRITICAL",
        "days_left": 2.5,
        "supplier": "Anker Tech Logistics",
        "rating": 4.9,
        "seasonal": 1.25,
        "trend": "Surging",
        "abc": "A"
    },
    {
        "sku": "SKU-FMCG-204",
        "barcode": "890123456002",
        "name": "Pure Arabica Nitro Cold Brew 250ml",
        "cat_code": "FMCG",
        "unit": "can",
        "cost": 1.65,
        "price": 3.99,
        "stock": 18,
        "min_safety": 40,
        "reorder_point": 65,
        "eoq": 150,
        "lead_time": 2,
        "velocity": 12.0,
        "risk": "CRITICAL",
        "days_left": 1.5,
        "supplier": "JavaCraft Beverage Dist.",
        "rating": 4.7,
        "seasonal": 1.40,
        "trend": "Surging",
        "abc": "A"
    },
    {
        "sku": "SKU-PHARM-109",
        "barcode": "890123456003",
        "name": "Digital Non-Contact Infrared Thermometer",
        "cat_code": "PHARM",
        "unit": "pcs",
        "cost": 12.00,
        "price": 24.50,
        "stock": 8,
        "min_safety": 15,
        "reorder_point": 22,
        "eoq": 45,
        "lead_time": 4,
        "velocity": 3.6,
        "risk": "CRITICAL",
        "days_left": 2.2,
        "supplier": "MediCare Global Supply",
        "rating": 4.8,
        "seasonal": 1.55,
        "trend": "Surging",
        "abc": "B"
    },
    # 2. Warning Restock (Runout in 4-8 days, order this week)
    {
        "sku": "SKU-ELEC-442",
        "barcode": "890123456004",
        "name": "Noise-Cancelling Wireless Earbuds Pro",
        "cat_code": "ELEC",
        "unit": "pcs",
        "cost": 32.00,
        "price": 69.99,
        "stock": 26,
        "min_safety": 20,
        "reorder_point": 35,
        "eoq": 60,
        "lead_time": 5,
        "velocity": 3.2,
        "risk": "WARNING",
        "days_left": 8.1,
        "supplier": "AcousticWave Electronics",
        "rating": 4.6,
        "seasonal": 1.20,
        "trend": "Steady",
        "abc": "A"
    },
    {
        "sku": "SKU-FASH-310",
        "barcode": "890123456005",
        "name": "Merino Wool Thermal Winter Pullover",
        "cat_code": "FASH",
        "unit": "pcs",
        "cost": 24.00,
        "price": 54.00,
        "stock": 35,
        "min_safety": 30,
        "reorder_point": 50,
        "eoq": 80,
        "lead_time": 6,
        "velocity": 5.1,
        "risk": "WARNING",
        "days_left": 6.9,
        "supplier": "Nordic Apparel Mill",
        "rating": 4.5,
        "seasonal": 1.65,
        "trend": "Surging",
        "abc": "B"
    },
    {
        "sku": "SKU-HARD-301",
        "barcode": "890123456006",
        "name": "Precision Magnetic Screwdriver 64-in-1 Set",
        "cat_code": "HARD",
        "unit": "set",
        "cost": 11.50,
        "price": 22.99,
        "stock": 22,
        "min_safety": 20,
        "reorder_point": 30,
        "eoq": 50,
        "lead_time": 4,
        "velocity": 2.9,
        "risk": "WARNING",
        "days_left": 7.6,
        "supplier": "Apex Toolworks Corp",
        "rating": 4.7,
        "seasonal": 1.05,
        "trend": "Steady",
        "abc": "B"
    },
    # 3. Healthy Velocity Drivers & Margin Stars (Class A)
    {
        "sku": "SKU-ELEC-990",
        "barcode": "890123456007",
        "name": "Curved OLED 4K 165Hz Monitor 27-inch",
        "cat_code": "ELEC",
        "unit": "pcs",
        "cost": 260.00,
        "price": 449.00,
        "stock": 42,
        "min_safety": 15,
        "reorder_point": 25,
        "eoq": 30,
        "lead_time": 7,
        "velocity": 2.1,
        "risk": "HEALTHY",
        "days_left": 20.0,
        "supplier": "Samsung Display Partner",
        "rating": 4.9,
        "seasonal": 1.15,
        "trend": "Steady",
        "abc": "A"
    },
    {
        "sku": "SKU-FMCG-512",
        "barcode": "890123456008",
        "name": "Electrolyte Recovery Sparkling Tonic 330ml",
        "cat_code": "FMCG",
        "unit": "can",
        "cost": 0.85,
        "price": 2.49,
        "stock": 140,
        "min_safety": 50,
        "reorder_point": 80,
        "eoq": 200,
        "lead_time": 2,
        "velocity": 8.5,
        "risk": "HEALTHY",
        "days_left": 16.5,
        "supplier": "Revive Beverage Group",
        "rating": 4.8,
        "seasonal": 1.30,
        "trend": "Steady",
        "abc": "B"
    },
    {
        "sku": "SKU-PHARM-220",
        "barcode": "890123456009",
        "name": "Vitamin C 1000mg + Zinc Effervescent (20s)",
        "cat_code": "PHARM",
        "unit": "tube",
        "cost": 3.20,
        "price": 7.99,
        "stock": 85,
        "min_safety": 35,
        "reorder_point": 55,
        "eoq": 120,
        "lead_time": 3,
        "velocity": 4.2,
        "risk": "HEALTHY",
        "days_left": 20.2,
        "supplier": "Bayer Healthcare Dist.",
        "rating": 4.9,
        "seasonal": 1.45,
        "trend": "Steady",
        "abc": "B"
    },
    {
        "sku": "SKU-HARD-505",
        "barcode": "890123456010",
        "name": "Brushless Cordless Impact Drill 20V Max",
        "cat_code": "HARD",
        "unit": "kit",
        "cost": 65.00,
        "price": 129.99,
        "stock": 38,
        "min_safety": 15,
        "reorder_point": 25,
        "eoq": 40,
        "lead_time": 5,
        "velocity": 2.3,
        "risk": "HEALTHY",
        "days_left": 16.5,
        "supplier": "DeWalt Authorized Agency",
        "rating": 4.9,
        "seasonal": 1.10,
        "trend": "Steady",
        "abc": "A"
    },
    # 4. Overstocked / Slow Moving (Capital Tied Up)
    {
        "sku": "SKU-FASH-102",
        "barcode": "890123456011",
        "name": "Summer Linen Short Sleeve Resort Shirt",
        "cat_code": "FASH",
        "unit": "pcs",
        "cost": 18.00,
        "price": 39.99,
        "stock": 165,
        "min_safety": 20,
        "reorder_point": 35,
        "eoq": 50,
        "lead_time": 7,
        "velocity": 0.8,
        "risk": "OVERSTOCKED",
        "days_left": 206.2,
        "supplier": "Coastal Cotton Mills",
        "rating": 4.3,
        "seasonal": 0.45,
        "trend": "Declining",
        "abc": "C"
    },
    {
        "sku": "SKU-ELEC-118",
        "barcode": "890123456012",
        "name": "Micro-USB Braided Cable 1m (Legacy)",
        "cat_code": "ELEC",
        "unit": "pcs",
        "cost": 1.20,
        "price": 4.99,
        "stock": 210,
        "min_safety": 25,
        "reorder_point": 40,
        "eoq": 100,
        "lead_time": 4,
        "velocity": 1.1,
        "risk": "OVERSTOCKED",
        "days_left": 190.9,
        "supplier": "Shenzhen Cable Tech",
        "rating": 4.1,
        "seasonal": 0.80,
        "trend": "Declining",
        "abc": "C"
    }
]

def run_seed():
    logger.info("Connecting to PostgreSQL to seed POS & Inventory schema...")
    conn = psycopg2.connect(DATABASE_URL)
    cur = conn.cursor()

    try:
        # Create Tables
        cur.execute(SCHEMA_SQL)
        conn.commit()

        # Seed Categories
        cat_id_map = {}
        for c in CATEGORIES_SEED:
            cur.execute("""
                INSERT INTO pos_categories (code, name, color, target_turnover_days)
                VALUES (%s, %s, %s, %s)
                ON CONFLICT (code) DO UPDATE SET
                    name = EXCLUDED.name,
                    color = EXCLUDED.color,
                    target_turnover_days = EXCLUDED.target_turnover_days
                RETURNING id, code;
            """, (c["code"], c["name"], c["color"], c["turnover"]))
            row = cur.fetchone()
            cat_id_map[row[1]] = row[0]
        conn.commit()

        # Seed Inventory Items
        today = date.today()
        seeded_items = 0
        total_sales_records = 0

        for item in ITEMS_SEED:
            cat_id = cat_id_map[item["cat_code"]]
            margin = round(((item["price"] - item["cost"]) / item["price"]) * 100, 2)
            
            cur.execute("""
                INSERT INTO pos_inventory_items (
                    sku, barcode, name, category_id, unit,
                    cost_price, selling_price, margin_pct,
                    current_stock, min_safety_stock, reorder_point, reorder_quantity_eoq,
                    lead_time_days, daily_velocity, stockout_risk_level, days_of_inventory_left,
                    supplier_name, supplier_lead_time_rating, seasonal_factor, sales_trend_30d, abc_class
                ) VALUES (
                    %s, %s, %s, %s, %s,
                    %s, %s, %s,
                    %s, %s, %s, %s,
                    %s, %s, %s, %s,
                    %s, %s, %s, %s, %s
                )
                ON CONFLICT (sku) DO UPDATE SET
                    current_stock = EXCLUDED.current_stock,
                    cost_price = EXCLUDED.cost_price,
                    selling_price = EXCLUDED.selling_price,
                    daily_velocity = EXCLUDED.daily_velocity,
                    stockout_risk_level = EXCLUDED.stockout_risk_level,
                    days_of_inventory_left = EXCLUDED.days_of_inventory_left,
                    reorder_point = EXCLUDED.reorder_point,
                    reorder_quantity_eoq = EXCLUDED.reorder_quantity_eoq
                RETURNING id, sku;
            """, (
                item["sku"], item["barcode"], item["name"], cat_id, item["unit"],
                item["cost"], item["price"], margin,
                item["stock"], item["min_safety"], item["reorder_point"], item["eoq"],
                item["lead_time"], item["velocity"], item["risk"], item["days_left"],
                item["supplier"], item["rating"], item["seasonal"], item["trend"], item["abc"]
            ))
            row = cur.fetchone()
            item_id = row[0]
            seeded_items += 1

            # Seed 30 Days of Historical Daily Sales for this Item
            base_vel = item["velocity"]
            for d_offset in range(30, 0, -1):
                sale_date = today - timedelta(days=d_offset)
                # Weekend multiplier (Fri, Sat, Sun)
                is_weekend = sale_date.weekday() in (4, 5, 6)
                multiplier = 1.35 if is_weekend else 1.0
                # Random daily fluctuation around velocity
                jitter = random.uniform(0.85, 1.25)
                units = max(1, int(round(base_vel * multiplier * jitter)))
                revenue = round(units * item["price"], 2)
                profit = round(units * (item["price"] - item["cost"]), 2)
                peak_units = int(round(units * 0.45)) # 45% during peak hours (17:00-21:00)

                cur.execute("""
                    INSERT INTO pos_sales_history (
                        item_id, date, units_sold, revenue, profit, peak_hour_units
                    ) VALUES (%s, %s, %s, %s, %s, %s)
                    ON CONFLICT (item_id, date) DO UPDATE SET
                        units_sold = EXCLUDED.units_sold,
                        revenue = EXCLUDED.revenue,
                        profit = EXCLUDED.profit,
                        peak_hour_units = EXCLUDED.peak_hour_units;
                """, (item_id, sale_date, units, revenue, profit, peak_units))
                total_sales_records += 1

        conn.commit()
        logger.info(f"Seeded {seeded_items} inventory products and {total_sales_records} daily POS sales records.")
        print(f"=== POS INVENTORY SEED COMPLETE: {seeded_items} SKUs, {total_sales_records} sales records seeded ===")

    except Exception as e:
        conn.rollback()
        logger.error(f"Error seeding POS inventory: {e}")
        raise
    finally:
        cur.close()
        conn.close()

if __name__ == "__main__":
    run_seed()
