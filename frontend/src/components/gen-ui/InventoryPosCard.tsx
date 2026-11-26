"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Boxes,
  Clock,
  TrendingUp,
  AlertTriangle,
  Star,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Sparkles,
  BarChart3,
  Calendar,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Send,
  Zap
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from "recharts";

export interface InventoryPosData {
  mode?: "timing_forecast" | "reorder_plan" | "top_products" | "sku_deep_dive" | "overview";
  title?: string;
  store_location?: string;
  insight?: string;
  telemetry?: {
    engine: string;
    execution_ms: number;
    timestamp?: string;
  };

  // Mode 1: Timing Forecast
  peak_summary?: {
    daily_prime_window: string;
    prime_volume_share: string;
    weekend_multiplier: string;
    best_dispatch_window: string;
  };
  hourly_curve?: Array<{
    hour: string;
    volume_pct: number;
    units: number;
    phase: string;
  }>;
  day_of_week_curve?: Array<{
    day: string;
    units: number;
    revenue: number;
  }>;
  product_slots?: Array<{
    product: string;
    peak_window: string;
    multiplier: string;
    day: string;
    urgency: string;
  }>;

  // Mode 2: Reorder Plan & Overview
  kpis?: {
    total_skus: number;
    critical_reorders: number;
    warning_reorders: number;
    overstocked_skus: number;
    inventory_cost_value: string;
    inventory_retail_value?: string;
    daily_sales_runrate: string;
    avg_margin: string;
    pending_reorder_budget: string;
  };
  items?: Array<{
    sku: string;
    barcode: string;
    name: string;
    category: string;
    category_color: string;
    unit: string;
    current_stock: number;
    min_safety_stock: number;
    reorder_point: number;
    recommended_reorder_qty: number;
    cost_price: string;
    selling_price: string;
    margin_pct: string;
    daily_velocity: number;
    days_left: number;
    stockout_date_str: string;
    urgency: "CRITICAL" | "WARNING" | "HEALTHY" | "OVERSTOCKED";
    estimated_reorder_cost: string;
    supplier: string;
    lead_time_days: number;
    trend: string;
    abc_class: string;
    timing_note?: string;
  }>;
  stockout_bars?: Array<{
    name: string;
    current: number;
    safety: number;
    reorder_qty: number;
    days_left: number;
  }>;
  category_pie?: Array<{
    name: string;
    value: number;
    fill: string;
  }>;

  // Mode 3: Top Products & ABC Pareto
  summary?: {
    class_a_revenue_share: string;
    avg_margin_stars: string;
    top_driver: string;
    top_monthly_revenue: string;
  };
  products?: Array<{
    sku: string;
    name: string;
    category: string;
    category_color: string;
    current_stock: number;
    selling_price: string;
    margin_pct: string;
    monthly_revenue: string;
    monthly_profit: string;
    monthly_units: number;
    daily_velocity: number;
    abc_class: string;
    trend: string;
  }>;
  revenue_chart?: Array<{
    name: string;
    revenue: number;
    profit: number;
  }>;

  // Mode 4: SKU Deep Dive
  item?: {
    sku: string;
    barcode: string;
    name: string;
    category: string;
    category_color: string;
    unit: string;
    cost_price: string;
    selling_price: string;
    margin_pct: string;
    current_stock: number;
    min_safety_stock: number;
    reorder_point: number;
    recommended_reorder_qty: number;
    daily_velocity: number;
    days_left: number;
    stockout_date_str: string;
    urgency: "CRITICAL" | "WARNING" | "HEALTHY" | "OVERSTOCKED";
    estimated_reorder_cost: string;
    supplier: string;
    lead_time_days: number;
    trend: string;
    abc_class: string;
  };
  sales_history_30d?: Array<{
    date: string;
    units: number;
    revenue: number;
    peak_units: number;
  }>;
  depletion_curve?: Array<{
    day: string;
    stock: number;
    safety: number;
  }>;
  reorder_advice?: string;
}

interface InventoryPosCardProps {
  data?: InventoryPosData;
  onTriggerQuery?: (query: string) => void;
}

export function InventoryPosCard({ data, onTriggerQuery }: InventoryPosCardProps) {
  if (!data) return null;

  const mode = data.mode || "reorder_plan";
  const telemetry = data.telemetry;

  // =========================================================================
  // VIEW 1: TIMING & DEMAND PEAK FORECAST (When/Peak Hours/Weekend Surges)
  // =========================================================================
  if (mode === "timing_forecast") {
    const peak = data.peak_summary;
    const hourly = data.hourly_curve || [];
    const dow = data.day_of_week_curve || [];
    const slots = data.product_slots || [];
    const [timingSubTab, setTimingSubTab] = useState<"hourly" | "dow">("hourly");

    return (
      <div className="w-full my-3 rounded-2xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900/90 shadow-xs overflow-hidden text-slate-900 dark:text-zinc-100 font-sans transition-all">
        {/* Header */}
        <div className="p-4 sm:p-5 flex items-center justify-between gap-3 border-b border-slate-100 dark:border-zinc-800/80">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200/60 dark:border-purple-800/40 flex items-center justify-center flex-shrink-0 text-purple-600 dark:text-purple-400">
              <Clock className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-semibold text-slate-900 dark:text-zinc-100 truncate tracking-tight">
                {data.title || "POS Demand Timing & Peak Volume Predictor"}
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5 truncate">
                {data.store_location || "Central POS Hub #01"} &bull; Temporal Sales Aggregations
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300">
            Timing Intelligence
          </span>
        </div>

        {/* Peak Timing Highlights Strip */}
        {peak && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 sm:p-5 border-b border-slate-100 dark:border-zinc-800/60 bg-slate-50/40 dark:bg-zinc-850/30">
            <div className="p-3 rounded-xl border border-slate-200/70 dark:border-zinc-800 bg-white dark:bg-zinc-800/60">
              <span className="text-[10px] uppercase font-semibold text-slate-400 block">Daily Prime Window</span>
              <div className="text-xl font-bold font-mono text-purple-600 dark:text-purple-400 mt-1">
                {peak.daily_prime_window}
              </div>
              <span className="text-[11px] text-slate-500 mt-0.5 block">{peak.prime_volume_share}</span>
            </div>

            <div className="p-3 rounded-xl border border-slate-200/70 dark:border-zinc-800 bg-white dark:bg-zinc-800/60">
              <span className="text-[10px] uppercase font-semibold text-slate-400 block">Weekend Surge Index</span>
              <div className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
                {peak.weekend_multiplier.split(" ")[0]}
              </div>
              <span className="text-[11px] text-slate-500 mt-0.5 block">Friday through Sunday</span>
            </div>

            <div className="p-3 rounded-xl border border-slate-200/70 dark:border-zinc-800 bg-white dark:bg-zinc-800/60">
              <span className="text-[10px] uppercase font-semibold text-slate-400 block">Dispatch Recommendation</span>
              <div className="text-sm font-bold text-slate-800 dark:text-zinc-200 mt-1">
                Before 14:00 PO Send
              </div>
              <span className="text-[11px] text-slate-500 mt-0.5 block">Guarantees Evening Stock Buffer</span>
            </div>
          </div>
        )}

        {/* Chart: Hourly vs Day-of-Week */}
        <div className="p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-700 dark:text-zinc-300">
              Sales Volume Velocity Curve
            </span>
            <div className="flex items-center gap-1 p-0.5 rounded-lg bg-slate-100 dark:bg-zinc-800 text-[11px] font-medium">
              <button
                onClick={() => setTimingSubTab("hourly")}
                className={`px-2.5 py-1 rounded-md transition ${timingSubTab === "hourly" ? "bg-white dark:bg-zinc-700 text-purple-600 dark:text-purple-400 shadow-2xs font-semibold" : "text-slate-600 dark:text-zinc-400"}`}
              >
                Intra-Day Curve (09:00 - 21:30)
              </button>
              <button
                onClick={() => setTimingSubTab("dow")}
                className={`px-2.5 py-1 rounded-md transition ${timingSubTab === "dow" ? "bg-white dark:bg-zinc-700 text-purple-600 dark:text-purple-400 shadow-2xs font-semibold" : "text-slate-600 dark:text-zinc-400"}`}
              >
                Day-of-Week (Mon - Sun)
              </button>
            </div>
          </div>

          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              {timingSubTab === "hourly" ? (
                <LineChart data={hourly} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.12} vertical={false} />
                  <XAxis dataKey="hour" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#18181b",
                      borderColor: "rgba(255,255,255,0.08)",
                      borderRadius: "8px",
                      color: "#fff",
                      fontSize: "12px",
                    }}
                  />
                  <Line type="monotone" dataKey="units" name="Hourly POS Units" stroke="#8b5cf6" strokeWidth={2.5} dot={{ r: 3 }} />
                </LineChart>
              ) : (
                <BarChart data={dow} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.12} vertical={false} />
                  <XAxis dataKey="day" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#18181b",
                      borderColor: "rgba(255,255,255,0.08)",
                      borderRadius: "8px",
                      color: "#fff",
                      fontSize: "12px",
                    }}
                  />
                  <Bar dataKey="units" name="Avg Daily Units" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={22} />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* Product Time Slots Matrix */}
        <div className="border-t border-slate-100 dark:border-zinc-800 p-4 sm:p-5 space-y-2">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
            Product Demand Slots & Peak Windows
          </span>
          <div className="space-y-1.5 text-xs">
            {slots.map((s, idx) => (
              <div
                key={idx}
                onClick={() => onTriggerQuery?.(`Analyze demand velocity and stock reorder for ${s.product}`)}
                className="p-2.5 rounded-lg border border-slate-200/60 dark:border-zinc-800 bg-slate-50/40 dark:bg-zinc-800/30 flex items-center justify-between gap-3 hover:bg-slate-100/60 cursor-pointer transition"
              >
                <div>
                  <span className="font-semibold text-slate-800 dark:text-zinc-200">{s.product}</span>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Peak: {s.peak_window} &bull; {s.day}
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-purple-600 dark:text-purple-400 block">{s.multiplier}</span>
                  <span className="text-[10px] text-slate-400">{s.urgency}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {telemetry && (
          <div className="px-4 py-2 bg-slate-50/50 dark:bg-zinc-900/40 border-t border-slate-100 dark:border-zinc-800/60 flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span>{telemetry.engine} &bull; {telemetry.execution_ms}ms</span>
            <span>Mode: Demand Timing Intelligence</span>
          </div>
        )}
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: TOP PRODUCTS & PARETO ABC STARS (Importance & Margin Contribution)
  // =========================================================================
  if (mode === "top_products") {
    const summary = data.summary;
    const prods = data.products || [];
    const revChart = data.revenue_chart || [];

    return (
      <div className="w-full my-3 rounded-2xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900/90 shadow-xs overflow-hidden text-slate-900 dark:text-zinc-100 font-sans transition-all">
        {/* Header */}
        <div className="p-4 sm:p-5 flex items-center justify-between gap-3 border-b border-slate-100 dark:border-zinc-800/80">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-800/40 flex items-center justify-center flex-shrink-0 text-amber-600 dark:text-amber-400">
              <Star className="w-5 h-5 fill-amber-500" />
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-semibold text-slate-900 dark:text-zinc-100 truncate tracking-tight">
                {data.title || "Top Velocity & Margin Drivers (ABC Pareto)"}
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5 truncate">
                {data.store_location || "Central POS Hub #01"} &bull; Ranked by 30-Day POS Revenue & Profit
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
            Class A Dominance
          </span>
        </div>

        {/* 3 Summary Cards */}
        {summary && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 sm:p-5 border-b border-slate-100 dark:border-zinc-800/60 bg-slate-50/40 dark:bg-zinc-850/30">
            <div className="p-3 rounded-xl border border-slate-200/70 dark:border-zinc-800 bg-white dark:bg-zinc-800/60">
              <span className="text-[10px] uppercase font-semibold text-slate-400 block">Top Revenue Share</span>
              <div className="text-xl font-bold font-mono text-amber-600 dark:text-amber-400 mt-1">
                74.8%
              </div>
              <span className="text-[11px] text-slate-500 mt-0.5 block">Driven by 4 Class-A SKUs</span>
            </div>

            <div className="p-3 rounded-xl border border-slate-200/70 dark:border-zinc-800 bg-white dark:bg-zinc-800/60">
              <span className="text-[10px] uppercase font-semibold text-slate-400 block">#1 Revenue Champion</span>
              <div className="text-sm font-bold text-slate-900 dark:text-zinc-100 mt-1 truncate">
                {summary.top_driver}
              </div>
              <span className="text-[11px] font-mono text-emerald-600 font-semibold mt-0.5 block">
                {summary.top_monthly_revenue}/mo
              </span>
            </div>

            <div className="p-3 rounded-xl border border-slate-200/70 dark:border-zinc-800 bg-white dark:bg-zinc-800/60">
              <span className="text-[10px] uppercase font-semibold text-slate-400 block">Average Gross Margin</span>
              <div className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
                {summary.avg_margin_stars}
              </div>
              <span className="text-[11px] text-slate-500 mt-0.5 block">High Profit Retention</span>
            </div>
          </div>
        )}

        {/* Revenue & Profit Contribution Bar Chart */}
        {revChart.length > 0 && (
          <div className="p-4 sm:p-5 space-y-2 border-b border-slate-100 dark:border-zinc-800">
            <span className="text-xs font-medium text-slate-700 dark:text-zinc-300 block">
              30-Day Revenue vs Gross Profit by Product
            </span>
            <div className="h-48 w-full pt-1">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revChart} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.12} vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#18181b",
                      borderColor: "rgba(255,255,255,0.08)",
                      borderRadius: "8px",
                      color: "#fff",
                      fontSize: "12px",
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "4px" }} />
                  <Bar dataKey="revenue" name="30d Revenue ($)" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={18} />
                  <Bar dataKey="profit" name="30d Gross Profit ($)" fill="#10b981" radius={[4, 4, 0, 0]} barSize={18} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Top Product Leaderboard Table */}
        <div className="divide-y divide-slate-100 dark:divide-zinc-800/80">
          {prods.slice(0, 5).map((p, idx) => (
            <div
              key={p.sku}
              onClick={() => onTriggerQuery?.(`Analyze demand velocity and stock reorder for ${p.name} (${p.sku})`)}
              className="p-3 sm:px-5 flex items-center justify-between gap-3 hover:bg-slate-50/60 dark:hover:bg-zinc-800/40 cursor-pointer transition text-xs"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 flex items-center justify-center font-mono font-bold text-[10px] flex-shrink-0">
                  {idx + 1}
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900 dark:text-zinc-100 truncate">
                      {p.name}
                    </span>
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-bold font-mono bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
                      Class {p.abc_class}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5 truncate">
                    {p.category} &bull; Margin: {p.margin_pct} &bull; Stock: {p.current_stock} pcs
                  </p>
                </div>
              </div>

              <div className="text-right flex-shrink-0">
                <span className="font-mono font-bold text-slate-900 dark:text-zinc-100 block">
                  {p.monthly_revenue}
                </span>
                <span className="text-[10px] font-mono text-emerald-600">
                  {p.monthly_profit} Profit
                </span>
              </div>
            </div>
          ))}
        </div>

        {telemetry && (
          <div className="px-4 py-2 bg-slate-50/50 dark:bg-zinc-900/40 border-t border-slate-100 dark:border-zinc-800/60 flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span>{telemetry.engine} &bull; {telemetry.execution_ms}ms</span>
            <span>Pareto Class-A Stars</span>
          </div>
        )}
      </div>
    );
  }

  // =========================================================================
  // VIEW 3: SINGLE SKU DEEP DIVE (Product Velocity & Burn Rate Spotlight)
  // =========================================================================
  if (mode === "sku_deep_dive" && data.item) {
    const item = data.item;
    const history = data.sales_history_30d || [];
    const depletion = data.depletion_curve || [];
    const [skuChartTab, setSkuChartTab] = useState<"depletion" | "history">("depletion");

    return (
      <div className="w-full my-3 rounded-2xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900/90 shadow-xs overflow-hidden text-slate-900 dark:text-zinc-100 font-sans transition-all">
        {/* Product Hero Header */}
        <div className="p-4 sm:p-5 flex items-center justify-between gap-3 border-b border-slate-100 dark:border-zinc-800/80">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-medium bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
                {item.sku}
              </span>
              <h3 className="text-base font-semibold text-slate-900 dark:text-zinc-100 truncate tracking-tight">
                {item.name}
              </h3>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                item.urgency === "CRITICAL"
                  ? "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300"
                  : item.urgency === "WARNING"
                  ? "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300"
                  : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
              }`}>
                {item.urgency === "CRITICAL" ? "Stockout in " + item.days_left + " Days" : item.urgency}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
              {item.category} &bull; Barcode: {item.barcode} &bull; Supplier: {item.supplier} ({item.lead_time_days}d lead time)
            </p>
          </div>

          <div className="text-right flex-shrink-0">
            <span className="text-[10px] font-mono uppercase text-slate-400 block">Stock Level</span>
            <span className="text-lg font-bold font-mono text-rose-600 dark:text-rose-400">
              {item.current_stock} {item.unit}
            </span>
          </div>
        </div>

        {/* 3 Metric Cards for this Product */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 sm:p-5 border-b border-slate-100 dark:border-zinc-800/60 bg-slate-50/40 dark:bg-zinc-850/30">
          <div className="p-3 rounded-xl border border-slate-200/70 dark:border-zinc-800 bg-white dark:bg-zinc-800/60">
            <span className="text-[10px] uppercase font-semibold text-slate-400 block">Daily Velocity Burn</span>
            <div className="text-xl font-bold font-mono text-slate-900 dark:text-zinc-100 mt-1">
              {item.daily_velocity} {item.unit} / day
            </div>
            <span className="text-[11px] text-slate-500 mt-0.5 block">{item.trend} Sales Demand</span>
          </div>

          <div className="p-3 rounded-xl border border-slate-200/70 dark:border-zinc-800 bg-white dark:bg-zinc-800/60">
            <span className="text-[10px] uppercase font-semibold text-slate-400 block">Unit Economics</span>
            <div className="text-xl font-bold font-mono text-slate-900 dark:text-zinc-100 mt-1">
              {item.selling_price}
            </div>
            <span className="text-[11px] text-emerald-600 font-semibold mt-0.5 block">
              {item.margin_pct} Gross Margin (Cost: {item.cost_price})
            </span>
          </div>

          <div className="p-3 rounded-xl border border-slate-200/70 dark:border-zinc-800 bg-white dark:bg-zinc-800/60">
            <span className="text-[10px] uppercase font-semibold text-slate-400 block">Recommended Replenishment</span>
            <div className="text-xl font-bold font-mono text-blue-600 dark:text-blue-400 mt-1">
              +{item.recommended_reorder_qty} {item.unit}
            </div>
            <span className="text-[11px] text-slate-500 mt-0.5 block">PO Cost: {item.estimated_reorder_cost}</span>
          </div>
        </div>

        {/* Interactive Charts: Depletion Curve vs 14-Day Sales History */}
        <div className="p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-700 dark:text-zinc-300">
              Runway Depletion & Demand Velocity
            </span>
            <div className="flex items-center gap-1 p-0.5 rounded-lg bg-slate-100 dark:bg-zinc-800 text-[11px] font-medium">
              <button
                onClick={() => setSkuChartTab("depletion")}
                className={`px-2.5 py-1 rounded-md transition ${skuChartTab === "depletion" ? "bg-white dark:bg-zinc-700 text-blue-600 dark:text-blue-400 shadow-2xs font-semibold" : "text-slate-600 dark:text-zinc-400"}`}
              >
                7-Day Stock Depletion Forecast
              </button>
              <button
                onClick={() => setSkuChartTab("history")}
                className={`px-2.5 py-1 rounded-md transition ${skuChartTab === "history" ? "bg-white dark:bg-zinc-700 text-blue-600 dark:text-blue-400 shadow-2xs font-semibold" : "text-slate-600 dark:text-zinc-400"}`}
              >
                14-Day Sales History
              </button>
            </div>
          </div>

          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              {skuChartTab === "depletion" ? (
                <LineChart data={depletion} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.12} vertical={false} />
                  <XAxis dataKey="day" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#18181b",
                      borderColor: "rgba(255,255,255,0.08)",
                      borderRadius: "8px",
                      color: "#fff",
                      fontSize: "12px",
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "4px" }} />
                  <Line type="monotone" dataKey="stock" name="Projected Stock" stroke="#f43f5e" strokeWidth={2.5} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="safety" name="Safety Threshold" stroke="#94a3b8" strokeDasharray="3 3" strokeWidth={1.5} dot={false} />
                </LineChart>
              ) : (
                <BarChart data={history} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.12} vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#18181b",
                      borderColor: "rgba(255,255,255,0.08)",
                      borderRadius: "8px",
                      color: "#fff",
                      fontSize: "12px",
                    }}
                  />
                  <Bar dataKey="units" name="Daily Units Sold" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={16} />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* Reorder Action Callout */}
        {data.reorder_advice && (
          <div className="mx-4 sm:mx-5 mb-4 p-3 rounded-xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200/50 dark:border-blue-900/30 text-xs text-blue-900 dark:text-blue-200 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-500 flex-shrink-0" />
            <p className="leading-relaxed">
              {data.reorder_advice}
            </p>
          </div>
        )}

        {telemetry && (
          <div className="px-4 py-2 bg-slate-50/50 dark:bg-zinc-900/40 border-t border-slate-100 dark:border-zinc-800/60 flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span>{telemetry.engine} &bull; {telemetry.execution_ms}ms</span>
            <span>SKU Deep Dive Active</span>
          </div>
        )}
      </div>
    );
  }

  // =========================================================================
  // VIEW 4: DEFAULT PREDICTIVE REPLENISHMENT PLAN & RUNWAY DASHBOARD
  // =========================================================================
  const kpis = data.kpis;
  const items = data.items || [];
  const stockoutBars = data.stockout_bars || [];
  const [filterPill, setFilterPill] = useState<"all" | "critical" | "warning">("all");

  const displayItems = items.filter((i) => {
    if (filterPill === "critical") return i.urgency === "CRITICAL";
    if (filterPill === "warning") return i.urgency === "WARNING";
    return true;
  });

  return (
    <div className="w-full my-3 rounded-2xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900/90 shadow-xs overflow-hidden text-slate-900 dark:text-zinc-100 font-sans transition-all">
      {/* Header */}
      <div className="p-4 sm:p-5 flex items-center justify-between gap-3 border-b border-slate-100 dark:border-zinc-800/80">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-800/40 flex items-center justify-center flex-shrink-0 text-blue-600 dark:text-blue-400">
            <Boxes className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h3 className="text-base font-semibold text-slate-900 dark:text-zinc-100 truncate tracking-tight">
              {data.title || "Predictive Replenishment & Stockout Runway"}
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5 truncate">
              {data.store_location || "Central POS Hub #01"} &bull; Relational PostgreSQL 16 Inventory Ledger
            </p>
          </div>
        </div>
        <span className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
          {kpis?.total_skus || items.length} Active SKUs
        </span>
      </div>

      {/* Top 3 KPI Cards */}
      {kpis && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 sm:p-5 border-b border-slate-100 dark:border-zinc-800/60 bg-slate-50/40 dark:bg-zinc-850/30">
          <div className="p-3 rounded-xl border border-slate-200/70 dark:border-zinc-800 bg-white dark:bg-zinc-800/60">
            <span className="text-[10px] uppercase font-semibold text-slate-400 block">Urgent Restock Risk</span>
            <div className="text-2xl font-bold font-mono text-rose-600 dark:text-rose-400 mt-1">
              {kpis.critical_reorders} SKUs Critical
            </div>
            <span className="text-[11px] text-slate-500 mt-0.5 block">Runout in &lt;3 Days</span>
          </div>

          <div className="p-3 rounded-xl border border-slate-200/70 dark:border-zinc-800 bg-white dark:bg-zinc-800/60">
            <span className="text-[10px] uppercase font-semibold text-slate-400 block">Pending Reorder Budget</span>
            <div className="text-2xl font-bold font-mono text-blue-600 dark:text-blue-400 mt-1">
              {kpis.pending_reorder_budget}
            </div>
            <span className="text-[11px] text-slate-500 mt-0.5 block">EOQ Supplier Orders</span>
          </div>

          <div className="p-3 rounded-xl border border-slate-200/70 dark:border-zinc-800 bg-white dark:bg-zinc-800/60">
            <span className="text-[10px] uppercase font-semibold text-slate-400 block">Daily POS Sales Runrate</span>
            <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
              {kpis.daily_sales_runrate}
            </div>
            <span className="text-[11px] text-slate-500 mt-0.5 block">Avg Margin: {kpis.avg_margin}</span>
          </div>
        </div>
      )}

      {/* Stockout Runway Comparison Bar Chart */}
      {stockoutBars.length > 0 && (
        <div className="p-4 sm:p-5 space-y-2 border-b border-slate-100 dark:border-zinc-800">
          <span className="text-xs font-medium text-slate-700 dark:text-zinc-300 block">
            Days Until Stockout (Compared Against Safety Buffer)
          </span>
          <div className="h-48 w-full pt-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stockoutBars} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.12} vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#18181b",
                    borderColor: "rgba(255,255,255,0.08)",
                    borderRadius: "8px",
                    color: "#fff",
                    fontSize: "12px",
                  }}
                />
                <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "4px" }} />
                <Bar dataKey="current" name="Current Stock" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={18} />
                <Bar dataKey="days_left" name="Days Runway Left" fill="#f43f5e" radius={[4, 4, 0, 0]} barSize={18} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Reorder Table */}
      <div className="p-4 sm:p-5 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs">
            <button
              onClick={() => setFilterPill("all")}
              className={`px-2.5 py-1 rounded-md transition ${filterPill === "all" ? "bg-slate-200 dark:bg-zinc-700 font-semibold" : "text-slate-500"}`}
            >
              All SKUs ({items.length})
            </button>
            <button
              onClick={() => setFilterPill("critical")}
              className={`px-2.5 py-1 rounded-md transition ${filterPill === "critical" ? "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 font-semibold" : "text-slate-500"}`}
            >
              Critical ({items.filter(i => i.urgency === "CRITICAL").length})
            </button>
            <button
              onClick={() => setFilterPill("warning")}
              className={`px-2.5 py-1 rounded-md transition ${filterPill === "warning" ? "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 font-semibold" : "text-slate-500"}`}
            >
              Warning ({items.filter(i => i.urgency === "WARNING").length})
            </button>
          </div>
          <span className="text-[11px] text-slate-400">Click SKU for deep dive</span>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-zinc-800/80">
          {displayItems.slice(0, 5).map((item) => (
            <div
              key={item.sku}
              onClick={() => onTriggerQuery?.(`Analyze demand velocity and stock reorder for ${item.name} (${item.sku})`)}
              className="py-2.5 flex items-center justify-between gap-3 hover:bg-slate-50/60 dark:hover:bg-zinc-800/40 cursor-pointer transition text-xs"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-900 dark:text-zinc-100 truncate">
                    {item.name}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {item.sku}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5 truncate">
                  Supplier: {item.supplier} ({item.lead_time_days}d lead time) &bull; Velocity: {item.daily_velocity} {item.unit}/day
                </div>
              </div>

              <div className="text-right flex-shrink-0">
                <span className={`font-mono font-bold block ${
                  item.urgency === "CRITICAL" ? "text-rose-600 dark:text-rose-400" : "text-amber-600"
                }`}>
                  {item.current_stock} {item.unit} ({item.days_left}d left)
                </span>
                <span className="text-[10px] font-mono text-blue-600">
                  Order +{item.recommended_reorder_qty} ({item.estimated_reorder_cost})
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {telemetry && (
        <div className="px-4 py-2 bg-slate-50/50 dark:bg-zinc-900/40 border-t border-slate-100 dark:border-zinc-800/60 flex items-center justify-between text-[10px] font-mono text-slate-400">
          <span>{telemetry.engine} &bull; {telemetry.execution_ms}ms</span>
          <span>Predictive Replenishment Active</span>
        </div>
      )}
    </div>
  );
}
