"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock,
  CheckCircle2,
  TrendingUp,
  Star,
  ChevronDown,
  ChevronUp,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  BarChart3,
  PieChart as PieIcon,
  Calendar,
  Award,
  Users
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

export interface YoYMetric {
  val_2025: string;
  val_2026: string;
  delta: string;
  improved: boolean;
}

export interface YoYMetrics {
  attendance_rate?: YoYMetric;
  punctuality_score?: YoYMetric;
  late_days?: YoYMetric;
  overtime_hours?: YoYMetric;
  performance_rating?: YoYMetric;
  kpi_score?: YoYMetric;
  salary_usd?: YoYMetric;
}

export interface HrisYoYData {
  mode?: "yoy_comparison" | "roster_audit";
  title?: string;
  department?: string;
  time_period?: string;
  employee?: {
    staff_id: string;
    name: string;
    designation: string;
    department: string;
    business_unit: string;
    job_type: string;
    joining_date: string;
    email: string;
    phone: string;
    location: string;
    avatar: string;
    salary_2026: string;
    salary_2025: string;
    supervisor: string;
    status: string;
  };
  yoy_metrics?: YoYMetrics;
  comparison_chart?: Array<{
    metric: string;
    y2025: number;
    y2026: number;
  }>;
  talent_9box?: {
    category: string;
    performance_rating: string;
    reliability_score: string;
    box_position: { x: number; y: number };
    action_recommendation: string;
  };
  burnout_flight_risk?: {
    index_score: number;
    level: string;
    factors: Array<{
      label: string;
      value: string;
      status: string;
      desc: string;
    }>;
    burnout_advisory: string;
  };
  human_capital_roi?: {
    value_score: number;
    multiplier: string;
    initiatives_delivered: number;
    replacement_hiring_lag: string;
    retention_tier: string;
  };
  time_allocation_pie?: Array<{
    name: string;
    value: number;
    fill: string;
  }>;
  monthly_trajectory_line?: Array<{
    month: string;
    attendance: number;
    punctuality: number;
    overtime: number;
  }>;
  competency_benchmark_bar?: Array<{
    skill: string;
    employee: number;
    dept_median: number;
  }>;
  biometric_discipline?: {
    avg_arrival_2025: string;
    avg_arrival_2026: string;
    improvement: string;
    remote_vpn_days?: number;
  };
  reviews_progression?: {
    review_2025?: {
      period: string;
      rating: number;
      status: string;
      notes: string;
      competencies?: Record<string, number>;
    };
    review_2026?: {
      period: string;
      rating: number;
      status: string;
      notes: string;
      promotion_eligible?: boolean;
      competencies?: Record<string, number>;
    };
  };
  recent_punches?: Array<{
    date: string;
    day: string;
    first_punch: string;
    last_punch: string;
    total_hours: string;
    overtime: string;
    status: string;
    type: string;
  }>;
  query_telemetry?: {
    database?: string;
    executed_sql?: string;
    query_strategy?: string;
    execution_time_ms?: number;
    status?: string;
  };
  // Roster audit fallback fields
  employees?: any[];
  summary_kpis?: any;
  departments_list?: string[];
  insights?: string;
}

interface HrisAttendanceCardProps {
  data?: HrisYoYData;
  onTriggerQuery?: (query: string) => void;
}

export function HrisAttendanceCard({ data, onTriggerQuery }: HrisAttendanceCardProps) {
  if (!data) return null;

  const [activeChart, setActiveChart] = useState<"yoy" | "trajectory" | "allocation">("yoy");
  const [showDetails, setShowDetails] = useState(false);

  const isYoYMode = data.mode === "yoy_comparison" && !!data.employee;
  const emp = data.employee;
  const yoy = data.yoy_metrics;
  const telemetry = data.query_telemetry;
  const yoyBarData = data.comparison_chart || [];
  const monthlyLine = data.monthly_trajectory_line || [];
  const timeAllocationPie = data.time_allocation_pie || [];

  // =========================================================================
  // VIEW A: CLEAN & MINIMAL YOY COMPARISON (SENIOR HR EXECUTIVE VIEW)
  // =========================================================================
  if (isYoYMode && emp && yoy) {
    const rev25 = data.reviews_progression?.review_2025;
    const rev26 = data.reviews_progression?.review_2026;

    return (
      <div className="w-full my-3 rounded-2xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900/90 shadow-xs overflow-hidden text-slate-900 dark:text-zinc-100 font-sans transition-all">
        {/* 1. Header: Clean Profile & Key Status */}
        <div className="p-4 sm:p-5 flex items-center justify-between gap-3 border-b border-slate-100 dark:border-zinc-800/80">
          <div className="flex items-center gap-3 min-w-0">
            <img
              src={emp.avatar}
              alt={emp.name}
              className="w-11 h-11 rounded-xl object-cover ring-1 ring-slate-200 dark:ring-zinc-700 flex-shrink-0"
            />
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-semibold text-slate-900 dark:text-zinc-100 truncate tracking-tight">
                  {emp.name}
                </h3>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-medium bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400">
                  {emp.staff_id}
                </span>
                {data.talent_9box && (
                  <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200/60 dark:border-purple-800/40">
                    <Star className="w-2.5 h-2.5 fill-purple-500 text-purple-500" />
                    <span>{data.talent_9box.category.split("/")[0].trim()}</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5 truncate">
                {emp.designation} &bull; {emp.department} &bull; {emp.job_type}
              </p>
            </div>
          </div>

          <div className="text-right flex-shrink-0">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">Period</span>
            <span className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
              2025 vs 2026
            </span>
          </div>
        </div>

        {/* 2. Executive Takeaway Highlight */}
        {data.insights && (
          <div className="mx-4 sm:mx-5 mt-4 px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200/60 dark:border-zinc-800 text-xs text-slate-700 dark:text-zinc-300 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              {data.insights}
            </p>
          </div>
        )}

        {/* 3. The 3 Core High-Impact Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 sm:p-5">
          {/* Card 1: Attendance Rate */}
          {yoy.attendance_rate && (
            <div className="p-3.5 rounded-xl border border-slate-200/70 dark:border-zinc-800 bg-slate-50/40 dark:bg-zinc-800/30">
              <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 block">
                Attendance Rate
              </span>
              <div className="flex items-baseline justify-between mt-1.5">
                <span className="text-2xl font-bold font-mono tracking-tight text-slate-900 dark:text-zinc-100">
                  {yoy.attendance_rate.val_2026}
                </span>
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  <span>{yoy.attendance_rate.delta}</span>
                </span>
              </div>
              <span className="text-[11px] text-slate-400 dark:text-zinc-500 mt-1 block">
                was {yoy.attendance_rate.val_2025} in 2025
              </span>
            </div>
          )}

          {/* Card 2: Late Arrivals */}
          {yoy.late_days && (
            <div className="p-3.5 rounded-xl border border-slate-200/70 dark:border-zinc-800 bg-slate-50/40 dark:bg-zinc-800/30">
              <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 block">
                Late Check-ins
              </span>
              <div className="flex items-baseline justify-between mt-1.5">
                <span className="text-2xl font-bold font-mono tracking-tight text-slate-900 dark:text-zinc-100">
                  {yoy.late_days.val_2026}
                </span>
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                  <ArrowDownRight className="w-3.5 h-3.5" />
                  <span>{yoy.late_days.delta.split(" ")[0]}</span>
                </span>
              </div>
              <span className="text-[11px] text-slate-400 dark:text-zinc-500 mt-1 block">
                down from {yoy.late_days.val_2025}
              </span>
            </div>
          )}

          {/* Card 3: Executive Rating & Value */}
          {yoy.performance_rating && (
            <div className="p-3.5 rounded-xl border border-slate-200/70 dark:border-zinc-800 bg-slate-50/40 dark:bg-zinc-800/30">
              <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 block">
                Performance & Output
              </span>
              <div className="flex items-baseline justify-between mt-1.5">
                <span className="text-2xl font-bold font-mono tracking-tight text-slate-900 dark:text-zinc-100">
                  {yoy.performance_rating.val_2026}
                </span>
                <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-0.5">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  <span>{yoy.performance_rating.delta}</span>
                </span>
              </div>
              <span className="text-[11px] text-slate-400 dark:text-zinc-500 mt-1 block">
                {data.human_capital_roi ? data.human_capital_roi.multiplier.split(" ")[0] + " Enterprise Output" : "Top Tier Review"}
              </span>
            </div>
          )}
        </div>

        {/* 4. Primary Chart Section: Clean, Minimal, Directly Visible */}
        <div className="px-4 sm:px-5 pb-5">
          <div className="p-4 rounded-xl border border-slate-200/70 dark:border-zinc-800 bg-slate-50/20 dark:bg-zinc-850/40 space-y-3">
            {/* Minimal Segmented Control */}
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="text-xs font-medium text-slate-700 dark:text-zinc-300">
                Visual Analytics
              </span>
              <div className="flex items-center gap-1 p-0.5 rounded-lg bg-slate-100 dark:bg-zinc-800 text-[11px] font-medium">
                <button
                  onClick={() => setActiveChart("yoy")}
                  className={`px-2.5 py-1 rounded-md transition ${activeChart === "yoy" ? "bg-white dark:bg-zinc-700 text-blue-600 dark:text-blue-400 shadow-2xs font-semibold" : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200"}`}
                >
                  YoY Comparison
                </button>
                <button
                  onClick={() => setActiveChart("trajectory")}
                  className={`px-2.5 py-1 rounded-md transition ${activeChart === "trajectory" ? "bg-white dark:bg-zinc-700 text-blue-600 dark:text-blue-400 shadow-2xs font-semibold" : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200"}`}
                >
                  12-Month Trajectory
                </button>
                <button
                  onClick={() => setActiveChart("allocation")}
                  className={`px-2.5 py-1 rounded-md transition ${activeChart === "allocation" ? "bg-white dark:bg-zinc-700 text-blue-600 dark:text-blue-400 shadow-2xs font-semibold" : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200"}`}
                >
                  Time Allocation
                </button>
              </div>
            </div>

            {/* Chart 1: YoY Comparison Bars */}
            {activeChart === "yoy" && yoyBarData.length > 0 && (
              <div className="h-52 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={yoyBarData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.12} vertical={false} />
                    <XAxis dataKey="metric" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
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
                    <Bar dataKey="y2025" name="2025 Baseline" fill="#94a3b8" radius={[4, 4, 0, 0]} barSize={20} />
                    <Bar dataKey="y2026" name="2026 Current" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Chart 2: 12-Month Trajectory Line */}
            {activeChart === "trajectory" && monthlyLine.length > 0 && (
              <div className="h-52 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyLine} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.12} vertical={false} />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
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
                    <Line type="monotone" dataKey="attendance" name="Attendance %" stroke="#3b82f6" strokeWidth={2} dot={{ r: 2.5 }} />
                    <Line type="monotone" dataKey="punctuality" name="Punctuality %" stroke="#10b981" strokeWidth={2} dot={{ r: 2.5 }} />
                    <Line type="monotone" dataKey="overtime" name="Overtime (h)" stroke="#8b5cf6" strokeWidth={1.8} strokeDasharray="3 3" dot={{ r: 2.5 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Chart 3: Time Allocation Donut */}
            {activeChart === "allocation" && timeAllocationPie.length > 0 && (
              <div className="h-52 w-full pt-2 flex items-center justify-around">
                <div className="h-full w-1/2">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={timeAllocationPie}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={70}
                        paddingAngle={3}
                      >
                        {timeAllocationPie.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#18181b",
                          borderColor: "rgba(255,255,255,0.08)",
                          borderRadius: "8px",
                          color: "#fff",
                          fontSize: "12px",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-1.5 text-xs w-1/2 pl-2">
                  {timeAllocationPie.map((slice) => (
                    <div key={slice.name} className="flex items-center justify-between text-slate-600 dark:text-zinc-400">
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: slice.fill }} />
                        <span className="truncate">{slice.name}</span>
                      </div>
                      <span className="font-mono font-medium text-slate-900 dark:text-zinc-200 ml-2">{slice.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 5. Progressive Disclosure Accordion: Details on Demand */}
        <div className="border-t border-slate-100 dark:border-zinc-800">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="w-full py-2.5 px-4 sm:px-5 text-xs font-medium text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 flex items-center justify-between transition hover:bg-slate-50/50 dark:hover:bg-zinc-800/30"
          >
            <span>{showDetails ? "Hide Biometric Swipes & Reviews" : "Show Biometric Swipes & Reviews"}</span>
            {showDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          <AnimatePresence>
            {showDetails && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden px-4 sm:px-5 pb-4 space-y-3"
              >
                {/* Compact Recent Punches (Last 5 days) */}
                {data.recent_punches && data.recent_punches.length > 0 && (
                  <div className="space-y-1 text-xs">
                    <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block mb-1">
                      Recent Biometric Swipes (Last 5 Shifts)
                    </span>
                    {data.recent_punches.slice(0, 5).map((punch, idx) => (
                      <div
                        key={idx}
                        className="py-1.5 px-2.5 rounded-lg border border-slate-200/50 dark:border-zinc-800/80 bg-slate-50/50 dark:bg-zinc-800/20 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-slate-400 w-10 font-medium">{punch.day}</span>
                          <span className="font-mono text-slate-700 dark:text-zinc-300">
                            {punch.first_punch} &rarr; {punch.last_punch}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-mono text-slate-500">{punch.total_hours}</span>
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
                            {punch.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Supervisor Notes */}
                {rev26 && (
                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-zinc-800/40 border border-slate-200/50 dark:border-zinc-800 text-xs">
                    <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider block mb-0.5">
                      Executive Review Notes &bull; 2026-Q4
                    </span>
                    <p className="text-slate-600 dark:text-zinc-300 italic">
                      &ldquo;{rev26.notes}&rdquo;
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 6. Subtle Footer */}
        {telemetry && (
          <div className="px-4 py-2 bg-slate-50/50 dark:bg-zinc-900/40 border-t border-slate-100 dark:border-zinc-800/60 flex items-center justify-between text-[10px] font-mono text-slate-400 dark:text-zinc-500">
            <span>PostgreSQL 16 &bull; {telemetry.execution_time_ms}ms query</span>
            <span>Supervisor Clearance Level-3</span>
          </div>
        )}
      </div>
    );
  }

  // =========================================================================
  // VIEW B: CLEAN ROSTER AUDIT (When broad query is requested)
  // =========================================================================
  const employeesList = data.employees || [];
  return (
    <div className="w-full my-3 rounded-2xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900/90 shadow-xs overflow-hidden text-slate-900 dark:text-zinc-100 font-sans transition-all">
      <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-zinc-800/80 flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-zinc-100">
            {data.title || "HRIS Attendance Roster"}
          </h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            Click any employee to view their full Year-over-Year comparison
          </p>
        </div>
        {telemetry && (
          <span className="font-mono text-[11px] text-slate-400">
            {telemetry.execution_time_ms}ms
          </span>
        )}
      </div>

      <div className="divide-y divide-slate-100 dark:divide-zinc-800/80">
        {employeesList.slice(0, 6).map((e: any) => (
          <div
            key={e.staff_id}
            onClick={() => onTriggerQuery?.(`Compare ${e.name} (${e.staff_id}) with last year`)}
            className="p-3 sm:px-5 flex items-center justify-between gap-3 hover:bg-slate-50/60 dark:hover:bg-zinc-800/40 cursor-pointer transition"
          >
            <div className="flex items-center gap-3 min-w-0">
              <img
                src={e.avatar_url || e.avatar}
                alt={e.name}
                className="w-9 h-9 rounded-lg object-cover ring-1 ring-slate-200 dark:ring-zinc-700 flex-shrink-0"
              />
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs sm:text-sm font-medium text-slate-900 dark:text-zinc-100 truncate">
                    {e.name}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {e.staff_id}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400 truncate">
                  {e.designation} &bull; {e.department}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-right flex-shrink-0">
              <div>
                <span className="text-[10px] text-slate-400 block">Attendance</span>
                <span className="text-xs font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                  {e.attendance_rate || e.present_pct || "95.0%"}
                </span>
              </div>
              <div className="hidden sm:block">
                <span className="text-[10px] text-slate-400 block">Rating</span>
                <span className="text-xs font-mono font-medium text-slate-700 dark:text-zinc-300">
                  ⭐ {e.performance_rating || "4.8"}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
