"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Monitor,
  ShieldAlert,
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  Clock,
  Sparkles,
  Zap,
  Coffee,
  BookOpen,
  Tv,
  Moon,
  Laptop,
  CheckCircle2,
  DollarSign,
  ArrowRight,
  ChevronRight,
  Filter,
  UserCheck,
  Shield,
  Activity,
  Terminal,
  Code,
  FileText,
  Search,
  ExternalLink,
  ChevronLeft
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine
} from "recharts";

interface ProductivityTelemetryCardProps {
  data: any;
  onSelectEmployee?: (staffId: string) => void;
}

export function ProductivityTelemetryCard({ data, onSelectEmployee }: ProductivityTelemetryCardProps) {
  // Allow interactive drilldown into an employee's deep-dive even if initially in overview/loss mode
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>("all");

  if (!data) return null;

  const initialMode = data.mode || "department_loss_overview";
  const currentMode = selectedStaffId ? "employee_deep_dive" : initialMode;

  // Find employee data if drilldown was clicked locally
  let activeEmpData = data;
  if (selectedStaffId && initialMode !== "employee_deep_dive") {
    const found = data.employees?.find((e: any) => e.staff_id === selectedStaffId) ||
                  data.top_loss_employees?.find((e: any) => e.staff_id === selectedStaffId);
    if (found) {
      activeEmpData = {
        mode: "employee_deep_dive",
        employee: {
          staff_id: found.staff_id,
          name: found.name,
          designation: found.designation,
          department: found.department,
          hourly_rate: found.hourly_rate || "$42.31/hr",
          salary_usd: found.monthly_loss ? "$88,000.00" : "$95,000.00",
          productivity_score: found.score || 65,
          risk_level: found.risk_level || "Moderate",
          primary_anomaly: found.primary_anomaly || "Standard activity telemetry",
          recommended_action: found.recommended_action || "Routine Quarterly Review",
        },
        workstation: {
          hostname: `workstation-${found.staff_id.toLowerCase()}.corp`,
          os: "macOS 14.5 / Windows 11",
          version: "v2.4.1",
          status: found.telemetry_status || "online",
          last_heartbeat: "Just now",
          api_key_prefix: "ak_live_79••••••••"
        },
        financial_loss: {
          hourly_rate: found.hourly_rate || "$42.31",
          wasted_hours_30d: found.slacking_hrs || "28.5 hrs",
          monthly_payroll_loss: found.monthly_loss || "$1,205.80",
          annual_projected_loss: `$${(parseFloat((found.monthly_loss || "$1200").replace(/[^0-9.]/g, '')) * 12).toLocaleString()}`,
          net_roi_percent: `${found.score || 75}%`
        },
        wiggler_detected: (found.primary_anomaly || "").toLowerCase().includes("wiggler"),
        distribution: data.activity_distribution || [
          { name: "Productive Work", hours: 110, pct: 68, color: "#10B981" },
          { name: "Skill Learning", hours: 22, pct: 14, color: "#3B82F6" },
          { name: "Idle / AFK", hours: 14, pct: 9, color: "#F59E0B" },
          { name: "Entertainment", hours: 10, pct: 6, color: "#8B5CF6" },
          { name: "Fakibaji / Slacking", hours: 5, pct: 3, color: "#EF4444" },
        ],
        hourly_timeline: [
          { slot: "09:00 - 10:00", productive_mins: 45, learning_mins: 10, entertainment_mins: 0, fakibaji_mins: 0, idle_mins: 5 },
          { slot: "10:00 - 11:00", productive_mins: 50, learning_mins: 5, entertainment_mins: 0, fakibaji_mins: 0, idle_mins: 5 },
          { slot: "11:00 - 12:00", productive_mins: 40, learning_mins: 15, entertainment_mins: 0, fakibaji_mins: 0, idle_mins: 5 },
          { slot: "12:00 - 13:00", productive_mins: 10, learning_mins: 0, entertainment_mins: 20, fakibaji_mins: 0, idle_mins: 30 },
          { slot: "13:00 - 14:00", productive_mins: 35, learning_mins: 15, entertainment_mins: 5, fakibaji_mins: 0, idle_mins: 5 },
          { slot: "14:00 - 15:00", productive_mins: 20, learning_mins: 0, entertainment_mins: 15, fakibaji_mins: (found.primary_anomaly || "").includes("wiggler") ? 25 : 0, idle_mins: 0 },
          { slot: "15:00 - 16:00", productive_mins: 15, learning_mins: 0, entertainment_mins: 20, fakibaji_mins: (found.primary_anomaly || "").includes("wiggler") ? 25 : 0, idle_mins: 0 },
          { slot: "16:00 - 17:00", productive_mins: 40, learning_mins: 10, entertainment_mins: 5, fakibaji_mins: 0, idle_mins: 5 },
        ],
        top_applications: [
          { name: "Productive Suite", category: "Productive", hours: 4.5, icon: "Code" },
          { name: "Upskilling Portal", category: "Learning", hours: 1.2, icon: "BookOpen" },
          { name: "Idle / Screen Lock", category: "Idle", hours: 1.1, icon: "Moon" },
          { name: "Entertainment / Media", category: "Entertainment", hours: 0.8, icon: "Tv" }
        ]
      };
    }
  }

  // =========================================================================
  // VIEW 1: SINGLE EMPLOYEE WORKSTATION TELEMETRY & FAKIBAJI DEEP-DIVE
  // =========================================================================
  if (currentMode === "employee_deep_dive") {
    const emp = activeEmpData.employee || {};
    const ws = activeEmpData.workstation || {};
    const fl = activeEmpData.financial_loss || {};
    const distribution = activeEmpData.distribution || [];
    const timeline = activeEmpData.hourly_timeline || [];
    const topApps = activeEmpData.top_applications || [];
    const isWiggler = activeEmpData.wiggler_detected;

    const riskColor =
      emp.risk_level === "Critical"
        ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30"
        : emp.risk_level === "High"
        ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30"
        : emp.risk_level === "Moderate"
        ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30"
        : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30";

    return (
      <div className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl overflow-hidden my-3">
        {/* Top Control Bar with Back button if drilled down */}
        <div className="bg-zinc-50 dark:bg-zinc-950/70 border-b border-zinc-200 dark:border-zinc-800 px-5 py-3.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            {selectedStaffId && (
              <button
                onClick={() => setSelectedStaffId(null)}
                className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg bg-zinc-200/70 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 transition-colors mr-1"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                Back to All Workstations
              </button>
            )}
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
              <Laptop className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800/50">
                  Workstation Endpoint Telemetry
                </span>
                <span className="flex items-center gap-1.5 text-xs text-zinc-500 font-mono">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  {ws.hostname || "endpoint.corp"}
                </span>
              </div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2 mt-0.5">
                {emp.name}
                <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-zinc-200/60 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                  {emp.staff_id}
                </span>
                <span className="text-xs font-normal text-zinc-500">
                  • {emp.designation} ({emp.department})
                </span>
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${riskColor}`}>
              {emp.risk_level} Risk Profile
            </span>
            <div className="hidden sm:flex items-center gap-1.5 text-xs font-mono text-zinc-400 bg-zinc-100 dark:bg-zinc-900 px-2.5 py-1 rounded-lg border border-zinc-200 dark:border-zinc-800">
              <Terminal className="w-3.5 h-3.5 text-zinc-500" />
              Pulse Daemon {ws.version}
            </div>
          </div>
        </div>

        {/* Forensic Hardware / Synthetic Wiggler Alert Banner */}
        {isWiggler && (
          <div className="mx-5 mt-4 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3">
            <div className="p-1.5 rounded-lg bg-rose-500 text-white shrink-0 mt-0.5">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div className="text-xs">
              <div className="font-bold text-rose-700 dark:text-rose-300">
                CRITICAL FORENSIC DETECTION: Hardware Synthetic Mouse Wiggler Active
              </div>
              <p className="text-rose-600/90 dark:text-rose-400/90 mt-0.5 leading-relaxed">
                Repetitive sinusoidal cursor micro-oscillations detected at exact 1000ms intervals with zero keyboard inputs during shift hours.
                Estimated artificial attendance recorded: <strong>2.4 hrs/day</strong>.
              </p>
            </div>
          </div>
        )}

        <div className="p-5 space-y-5">
          {/* Key Telemetry Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200/80 dark:border-zinc-800/80">
              <div className="flex items-center justify-between text-zinc-500 text-xs font-medium">
                <span>Productivity Score</span>
                <Activity className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-2xl font-black text-zinc-900 dark:text-zinc-50 mt-1">
                {emp.productivity_score}%
              </div>
              <div className="text-[11px] text-zinc-500 mt-0.5 font-medium">
                Effective Output Yield
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200/80 dark:border-zinc-800/80">
              <div className="flex items-center justify-between text-zinc-500 text-xs font-medium">
                <span>Monthly Wasted Payroll</span>
                <TrendingDown className="w-4 h-4 text-rose-500" />
              </div>
              <div className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">
                {fl.monthly_payroll_loss || "$0.00"}
              </div>
              <div className="text-[11px] text-zinc-500 mt-0.5 font-medium">
                {fl.wasted_hours_30d || "0 hrs"} slacking / fakibaji
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200/80 dark:border-zinc-800/80">
              <div className="flex items-center justify-between text-zinc-500 text-xs font-medium">
                <span>Annual Projected Loss</span>
                <DollarSign className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-2xl font-black text-zinc-900 dark:text-zinc-50 mt-1">
                {fl.annual_projected_loss || "$0.00"}
              </div>
              <div className="text-[11px] text-zinc-500 mt-0.5 font-medium">
                At {fl.hourly_rate}/hr salary rate
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200/80 dark:border-zinc-800/80">
              <div className="flex items-center justify-between text-zinc-500 text-xs font-medium">
                <span>Workstation Binding</span>
                <Monitor className="w-4 h-4 text-indigo-500" />
              </div>
              <div className="text-xs font-mono font-bold text-zinc-800 dark:text-zinc-200 mt-1 truncate">
                {ws.os || "macOS"}
              </div>
              <div className="text-[11px] text-zinc-500 mt-0.5 font-mono truncate">
                API: {ws.api_key_prefix}
              </div>
            </div>
          </div>

          {/* Visual Analytics Row: Hourly Shift Timeline & 30-Day Activity Donut */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Hourly Work Shift Timeline (Stacked Bar) */}
            <div className="lg:col-span-2 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200/80 dark:border-zinc-800/80">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                    Daily Shift Activity Breakdown (09:00 – 17:00)
                  </h4>
                  <p className="text-[11px] text-zinc-500">
                    Minutes per hour allocated across work, learning, media, and slacking
                  </p>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-medium text-zinc-500">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-emerald-500"></span> Work</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-blue-500"></span> Learn</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-amber-500"></span> Idle</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-purple-500"></span> Media</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-rose-500"></span> Fakibaji</span>
                </div>
              </div>

              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={timeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#88888820" vertical={false} />
                    <XAxis dataKey="slot" tick={{ fontSize: 10 }} interval={0} stroke="#888888" />
                    <YAxis tick={{ fontSize: 10 }} domain={[0, 60]} stroke="#888888" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(24, 24, 27, 0.95)",
                        borderColor: "#3f3f46",
                        borderRadius: "8px",
                        fontSize: "12px",
                        color: "#fff",
                      }}
                      formatter={(val: any, name: any) => [`${val} mins`, String(name || "").replace("_mins", "")]}
                    />
                    <Bar dataKey="productive_mins" name="Productive" stackId="a" fill="#10B981" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="learning_mins" name="Learning" stackId="a" fill="#3B82F6" />
                    <Bar dataKey="idle_mins" name="Idle / AFK" stackId="a" fill="#F59E0B" />
                    <Bar dataKey="entertainment_mins" name="Entertainment" stackId="a" fill="#8B5CF6" />
                    <Bar dataKey="fakibaji_mins" name="Fakibaji" stackId="a" fill="#EF4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Time Distribution Donut */}
            <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200/80 dark:border-zinc-800/80 flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                  30-Day Activity Split
                </h4>
                <p className="text-[11px] text-zinc-500">
                  Monthly time allocation distribution
                </p>
              </div>

              <div className="h-36 w-full my-auto">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={distribution}
                      dataKey="pct"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={36}
                      outerRadius={56}
                      paddingAngle={3}
                    >
                      {distribution.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(24, 24, 27, 0.95)",
                        borderColor: "#3f3f46",
                        borderRadius: "8px",
                        fontSize: "12px",
                        color: "#fff",
                      }}
                      formatter={(val: any, name: any) => [`${val}%`, String(name || "")]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-2 gap-1.5 pt-2 border-t border-zinc-200/70 dark:border-zinc-800/70">
                {distribution.slice(0, 4).map((d: any, idx: number) => (
                  <div key={idx} className="flex items-center gap-1.5 text-[11px]">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: d.color }}></span>
                    <span className="text-zinc-600 dark:text-zinc-400 truncate">{d.name}</span>
                    <span className="font-bold font-mono text-zinc-900 dark:text-zinc-200 ml-auto">{d.pct}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Top Applications & Behavioral Insights */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Top Apps List */}
            <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200/80 dark:border-zinc-800/80">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-3 flex items-center justify-between">
                <span>Top Active Applications & Windows</span>
                <span className="text-[10px] font-normal text-zinc-400">Past 8 Hours</span>
              </h4>
              <div className="space-y-2">
                {topApps.map((app: any, idx: number) => {
                  const badgeColor =
                    app.category === "Productive"
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                      : app.category === "Learning"
                      ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
                      : app.category === "Fakibaji"
                      ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
                      : "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20";

                  return (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/60 text-xs"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-6 h-6 rounded bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-600 dark:text-zinc-400 shrink-0">
                          {app.category === "Fakibaji" ? <AlertTriangle className="w-3.5 h-3.5 text-rose-500" /> : <Terminal className="w-3.5 h-3.5" />}
                        </div>
                        <span className="font-semibold text-zinc-800 dark:text-zinc-200 truncate">
                          {app.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`text-[10px] px-2 py-0.5 rounded border ${badgeColor}`}>
                          {app.category}
                        </span>
                        <span className="font-mono font-bold text-zinc-700 dark:text-zinc-300">
                          {app.hours}h
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Behavioral Anomaly & Action Recommendation */}
            <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200/80 dark:border-zinc-800/80 flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-2 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-indigo-500" />
                  Forensic Behavioral Assessment
                </h4>
                <div className="p-3 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/60 text-xs leading-relaxed text-zinc-700 dark:text-zinc-300">
                  <strong className="text-zinc-900 dark:text-zinc-100">Primary Observation:</strong>
                  <p className="mt-1 text-zinc-600 dark:text-zinc-400">
                    {emp.primary_anomaly || "Standard workstation telemetry profile."}
                  </p>
                </div>

                <div className="mt-3 p-3 rounded-lg bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-800/60 text-xs leading-relaxed">
                  <strong className="text-indigo-900 dark:text-indigo-200 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-indigo-500" /> Recommended Executive Action:
                  </strong>
                  <p className="mt-1 text-indigo-800 dark:text-indigo-300">
                    {emp.recommended_action || "Maintain regular quarterly performance reviews."}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-zinc-200/70 dark:border-zinc-800/70">
                <button className="flex-1 py-1.5 px-3 rounded-lg bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5" />
                  Log HR Incident Report
                </button>
                <button className="py-1.5 px-3 rounded-lg bg-zinc-200/70 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-semibold transition-colors">
                  Export Telemetry Log
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: PAYROLL LEAKAGE & FINANCIAL LOSS PREDICTOR (loss_prediction)
  // =========================================================================
  if (currentMode === "loss_prediction") {
    const kpis = data.kpis || {};
    const deptChart = data.dept_loss_chart || [];
    const topLossEmps = data.top_loss_employees || [];

    return (
      <div className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl overflow-hidden my-3">
        {/* Header */}
        <div className="bg-zinc-50 dark:bg-zinc-950/70 border-b border-zinc-200 dark:border-zinc-800 px-5 py-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded-full border border-rose-200 dark:border-rose-800/50">
                  Payroll Leakage & Financial Loss Predictor
                </span>
                <span className="text-xs text-zinc-500">
                  {kpis.monitored_workstations} Active Workstations Tracked
                </span>
              </div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 mt-0.5">
                Quantified Salary Waste from Unmonitored Slacking & Inactivity
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300">
            <AlertTriangle className="w-3.5 h-3.5" />
            {kpis.high_risk_headcount} Critical High-Risk Endpoints
          </div>
        </div>

        <div className="p-5 space-y-5">
          {/* Financial Loss Hero KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-4 rounded-xl bg-rose-500/5 dark:bg-rose-950/20 border border-rose-500/20">
              <div className="text-xs font-semibold text-rose-600 dark:text-rose-400">
                Monthly Lost Payroll
              </div>
              <div className="text-2xl font-black text-rose-700 dark:text-rose-300 mt-1">
                {kpis.total_monthly_payroll_loss || "$0.00"}
              </div>
              <div className="text-[11px] text-zinc-500 mt-0.5 font-medium">
                Wasted wages from avoidance/media
              </div>
            </div>

            <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200/80 dark:border-zinc-800/80">
              <div className="text-xs font-semibold text-zinc-500">
                Annualized Loss Runrate
              </div>
              <div className="text-2xl font-black text-zinc-900 dark:text-zinc-100 mt-1">
                {kpis.total_annual_projected_loss || "$0.00"}
              </div>
              <div className="text-[11px] text-zinc-500 mt-0.5 font-medium">
                Projected 12-month payroll leakage
              </div>
            </div>

            <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200/80 dark:border-zinc-800/80">
              <div className="text-xs font-semibold text-zinc-500">
                Payroll Leakage Ratio
              </div>
              <div className="text-2xl font-black text-zinc-900 dark:text-zinc-100 mt-1">
                {kpis.payroll_leakage_pct || "0%"}
              </div>
              <div className="text-[11px] text-zinc-500 mt-0.5 font-medium">
                Of gross organization payroll
              </div>
            </div>

            <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200/80 dark:border-zinc-800/80">
              <div className="text-xs font-semibold text-zinc-500">
                High-Risk Endpoints
              </div>
              <div className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">
                {kpis.high_risk_headcount} Workstations
              </div>
              <div className="text-[11px] text-zinc-500 mt-0.5 font-medium">
                Hardware wiggler / severe slacking
              </div>
            </div>
          </div>

          {/* Department Payroll Loss Bar Chart */}
          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200/80 dark:border-zinc-800/80">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                  Monthly Financial Loss by Department
                </h4>
                <p className="text-[11px] text-zinc-500">
                  Departments ranked by monetary salary burn from non-productive hours
                </p>
              </div>
            </div>

            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={deptChart} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#88888820" vertical={false} />
                  <XAxis dataKey="department" tick={{ fontSize: 10 }} stroke="#888888" />
                  <YAxis tick={{ fontSize: 10 }} stroke="#888888" tickFormatter={(v) => `$${v}`} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(24, 24, 27, 0.95)",
                      borderColor: "#3f3f46",
                      borderRadius: "8px",
                      fontSize: "12px",
                      color: "#fff",
                    }}
                    formatter={(val: any) => [`$${val.toLocaleString()}`, "Monthly Wasted Payroll"]}
                  />
                  <Bar dataKey="monthly_loss" name="Monthly Loss ($)" fill="#EF4444" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Loss Workstations Leaderboard */}
          <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden bg-white dark:bg-zinc-900">
            <div className="px-4 py-3 bg-zinc-50/80 dark:bg-zinc-950/60 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                Workstations with Highest Payroll Leakage
              </span>
              <span className="text-[11px] text-zinc-500">
                Click any employee to open forensic deep-dive
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-100/50 dark:bg-zinc-900/50 text-zinc-500 font-semibold border-b border-zinc-200 dark:border-zinc-800">
                  <tr>
                    <th className="py-2.5 px-4">Employee</th>
                    <th className="py-2.5 px-3">Hourly Rate</th>
                    <th className="py-2.5 px-3">Slacking Hours</th>
                    <th className="py-2.5 px-3">Monthly Loss</th>
                    <th className="py-2.5 px-3">Risk Level</th>
                    <th className="py-2.5 px-4">Primary Anomaly</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200/60 dark:divide-zinc-800/60">
                  {topLossEmps.map((emp: any, idx: number) => (
                    <tr
                      key={idx}
                      onClick={() => setSelectedStaffId(emp.staff_id)}
                      className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors cursor-pointer group"
                    >
                      <td className="py-3 px-4">
                        <div className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                          {emp.name}
                          <span className="text-[10px] font-mono font-normal text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">
                            {emp.staff_id}
                          </span>
                        </div>
                        <div className="text-[11px] text-zinc-500 truncate max-w-[180px]">
                          {emp.designation}
                        </div>
                      </td>
                      <td className="py-3 px-3 font-mono font-medium text-zinc-700 dark:text-zinc-300">
                        {emp.hourly_rate}
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-rose-600 dark:text-rose-400">
                        {emp.slacking_hours}
                      </td>
                      <td className="py-3 px-3 font-mono font-black text-rose-600 dark:text-rose-400">
                        {emp.monthly_loss}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            emp.risk_level === "Critical"
                              ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30"
                              : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30"
                          }`}
                        >
                          {emp.risk_level}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-zinc-600 dark:text-zinc-400 text-[11px] max-w-[220px] truncate">
                        {emp.primary_anomaly}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 group-hover:underline flex items-center justify-end gap-1">
                          Audit <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW 3: COMPANY-WIDE WORKSTATION TELEMETRY OVERVIEW (department_loss_overview)
  // =========================================================================
  const kpis = data.kpis || {};
  const distribution = data.activity_distribution || [];
  const deptChart = data.department_chart || [];
  const employees = data.employees || [];

  // Filter employees
  const filteredEmployees = employees.filter((emp: any) => {
    if (activeFilter === "critical") return emp.risk_level === "Critical" || emp.risk_level === "High";
    if (activeFilter === "learning") return parseFloat(emp.learning_hrs || "0") >= 20.0;
    if (activeFilter === "top") return emp.score >= 88;
    return true;
  });

  return (
    <div className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl overflow-hidden my-3">
      {/* Executive Header */}
      <div className="bg-zinc-50 dark:bg-zinc-950/70 border-b border-zinc-200 dark:border-zinc-800 px-5 py-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
            <Monitor className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800/50">
                Workstation Telemetry & Productivity Hub
              </span>
              <span className="flex items-center gap-1.5 text-xs text-zinc-500">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                {kpis.monitored_workstations} Desktop Daemons Active
              </span>
            </div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 mt-0.5">
              Live Endpoint Activity Signals, Upskilling Ratios & Avoidance Detection
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-medium text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 rounded-lg border border-zinc-200 dark:border-zinc-700">
            Heartbeat: 30s Poll
          </span>
        </div>
      </div>

      <div className="p-5 space-y-5">
        {/* Executive 5-KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200/80 dark:border-zinc-800/80">
            <div className="text-[11px] font-semibold text-zinc-500">Average Productivity</div>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
              {kpis.avg_productivity_score || "0%"}
            </div>
            <div className="text-[10px] text-zinc-500 mt-0.5 font-medium">Org-wide output score</div>
          </div>

          <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200/80 dark:border-zinc-800/80">
            <div className="text-[11px] font-semibold text-zinc-500">Monthly Lost Wages</div>
            <div className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">
              {kpis.monthly_payroll_loss || "$0.00"}
            </div>
            <div className="text-[10px] text-zinc-500 mt-0.5 font-medium">From slacking & avoidance</div>
          </div>

          <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200/80 dark:border-zinc-800/80">
            <div className="text-[11px] font-semibold text-zinc-500">Slacking / Fakibaji Rate</div>
            <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
              {kpis.slacking_rate || "0%"}
            </div>
            <div className="text-[10px] text-zinc-500 mt-0.5 font-medium">Total tracked hours</div>
          </div>

          <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200/80 dark:border-zinc-800/80">
            <div className="text-[11px] font-semibold text-zinc-500">Upskilling & Learning</div>
            <div className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">
              {kpis.learning_rate || "0%"}
            </div>
            <div className="text-[10px] text-zinc-500 mt-0.5 font-medium">Research, Coursera, Docs</div>
          </div>

          <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200/80 dark:border-zinc-800/80 col-span-2 sm:col-span-1">
            <div className="text-[11px] font-semibold text-zinc-500">Monitored PCs</div>
            <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
              {kpis.monitored_workstations} Endpoints
            </div>
            <div className="text-[10px] text-zinc-500 mt-0.5 font-medium">macOS, Linux, Windows</div>
          </div>
        </div>

        {/* Dual Chart Row: Overall Activity Split & Department Productivity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Time Allocation Donut */}
          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200/80 dark:border-zinc-800/80 flex flex-col justify-between">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                Organization Time Distribution
              </h4>
              <p className="text-[11px] text-zinc-500">
                Aggregated 30-day activity split across all 10 monitored workstations
              </p>
            </div>

            <div className="h-44 w-full my-auto">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={distribution}
                    dataKey="pct"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={42}
                    outerRadius={65}
                    paddingAngle={3}
                  >
                    {distribution.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(24, 24, 27, 0.95)",
                      borderColor: "#3f3f46",
                      borderRadius: "8px",
                      fontSize: "12px",
                      color: "#fff",
                    }}
                    formatter={(val: any, name: any) => [`${val}%`, String(name || "")]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-2 gap-1.5 pt-2 border-t border-zinc-200/70 dark:border-zinc-800/70">
              {distribution.map((d: any, idx: number) => (
                <div key={idx} className="flex items-center gap-1.5 text-[11px]">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: d.color }}></span>
                  <span className="text-zinc-600 dark:text-zinc-400 truncate">{d.name}</span>
                  <span className="font-bold font-mono text-zinc-900 dark:text-zinc-200 ml-auto">{d.pct}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Department Productivity Bar Chart */}
          <div className="lg:col-span-2 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200/80 dark:border-zinc-800/80">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                  Department Productivity Score & Payroll Loss
                </h4>
                <p className="text-[11px] text-zinc-500">
                  Comparing average productivity output (%) against monthly wasted salary ($)
                </p>
              </div>
            </div>

            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={deptChart} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#88888820" vertical={false} />
                  <XAxis dataKey="department" tick={{ fontSize: 10 }} stroke="#888888" />
                  <YAxis tick={{ fontSize: 10 }} domain={[0, 100]} stroke="#888888" tickFormatter={(v) => `${v}%`} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(24, 24, 27, 0.95)",
                      borderColor: "#3f3f46",
                      borderRadius: "8px",
                      fontSize: "12px",
                      color: "#fff",
                    }}
                    formatter={(val: any, name: any) => [
                      name === "avg_score" ? `${val}%` : `$${val.toLocaleString()}`,
                      name === "avg_score" ? "Productivity Score" : "Monthly Lost Wages"
                    ]}
                  />
                  <Bar dataKey="avg_score" name="avg_score" fill="#10B981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Filter Pills & Interactive Roster Table */}
        <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden bg-white dark:bg-zinc-900">
          <div className="px-4 py-3 bg-zinc-50/80 dark:bg-zinc-950/60 border-b border-zinc-200 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
              <button
                onClick={() => setActiveFilter("all")}
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                  activeFilter === "all"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                }`}
              >
                All Endpoints ({employees.length})
              </button>
              <button
                onClick={() => setActiveFilter("critical")}
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                  activeFilter === "critical"
                    ? "bg-rose-600 text-white shadow-sm"
                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                }`}
              >
                Critical Slacking / Wiggler
              </button>
              <button
                onClick={() => setActiveFilter("learning")}
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                  activeFilter === "learning"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                }`}
              >
                High Upskilling
              </button>
              <button
                onClick={() => setActiveFilter("top")}
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                  activeFilter === "top"
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                }`}
              >
                Top Performers
              </button>
            </div>

            <div className="text-[11px] text-zinc-500">
              Click row to inspect background telemetry
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-100/50 dark:bg-zinc-900/50 text-zinc-500 font-semibold border-b border-zinc-200 dark:border-zinc-800">
                <tr>
                  <th className="py-2.5 px-4">Employee</th>
                  <th className="py-2.5 px-3">Score</th>
                  <th className="py-2.5 px-3">Work hrs</th>
                  <th className="py-2.5 px-3">Slacking</th>
                  <th className="py-2.5 px-3">Upskilling</th>
                  <th className="py-2.5 px-3">Monthly Loss</th>
                  <th className="py-2.5 px-4">Observation / Anomaly</th>
                  <th className="py-2.5 px-3 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200/60 dark:divide-zinc-800/60">
                {filteredEmployees.map((emp: any, idx: number) => {
                  const scoreBadge =
                    emp.score >= 88
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                      : emp.score >= 75
                      ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30"
                      : emp.score >= 60
                      ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30"
                      : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30";

                  return (
                    <tr
                      key={idx}
                      onClick={() => setSelectedStaffId(emp.staff_id)}
                      className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors cursor-pointer group"
                    >
                      <td className="py-3 px-4">
                        <div className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                          {emp.name}
                          <span className="text-[10px] font-mono font-normal text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">
                            {emp.staff_id}
                          </span>
                        </div>
                        <div className="text-[11px] text-zinc-500 truncate max-w-[190px]">
                          {emp.designation}
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-full border ${scoreBadge}`}>
                          {emp.score}%
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono font-medium text-emerald-600 dark:text-emerald-400">
                        {emp.productive_hrs}
                      </td>
                      <td className="py-3 px-3 font-mono font-medium text-rose-600 dark:text-rose-400">
                        {emp.slacking_hrs}
                      </td>
                      <td className="py-3 px-3 font-mono font-medium text-blue-600 dark:text-blue-400">
                        {emp.learning_hrs}
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-zinc-800 dark:text-zinc-200">
                        {emp.monthly_loss}
                      </td>
                      <td className="py-3 px-4 text-zinc-600 dark:text-zinc-400 text-[11px] max-w-[240px] truncate">
                        {emp.primary_anomaly}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 group-hover:underline flex items-center justify-end gap-1">
                          Deep Dive <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
