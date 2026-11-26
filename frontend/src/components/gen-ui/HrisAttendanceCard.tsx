"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Clock,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Award,
  TrendingUp,
  Search,
  Filter,
  ShieldCheck,
  Building,
  Briefcase,
  ChevronRight,
  Eye,
  CalendarDays,
  FileText,
  DollarSign,
  UserCheck,
  Star,
  Download,
  Send,
  MessageSquare,
  Sparkles,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Lock,
  Unlock,
  Check,
  Copy,
  BarChart3,
  GitCompare,
  Database,
  Terminal,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Minus
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
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
  clearance?: {
    required: boolean;
    role: string;
    granted: boolean;
    authorized_by: string;
    security_level: string;
    clearance_token: string;
    access_scope: string;
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

  const [showSqlDrawer, setShowSqlDrawer] = useState(false);
  const [showSalary, setShowSalary] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [copiedToken, setCopiedToken] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const isYoYMode = data.mode === "yoy_comparison" && !!data.employee;
  const emp = data.employee;
  const yoy = data.yoy_metrics;
  const chartData = data.comparison_chart || [];
  const telemetry = data.query_telemetry;

  const handleCopySql = () => {
    if (telemetry?.executed_sql) {
      navigator.clipboard.writeText(telemetry.executed_sql);
      setCopiedSql(true);
      setTimeout(() => setCopiedSql(false), 2000);
    }
  };

  const handleCopyToken = () => {
    if (data.clearance?.clearance_token) {
      navigator.clipboard.writeText(data.clearance.clearance_token);
      setCopiedToken(true);
      setTimeout(() => setCopiedToken(false), 2000);
    }
  };

  const handleAction = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 3500);
  };

  // =========================================================================
  // VIEW A: SPECIFIC EMPLOYEE DEEP QUERY & YoY COMPARISON (2025 vs 2026)
  // =========================================================================
  if (isYoYMode && emp && yoy) {
    const rev25 = data.reviews_progression?.review_2025;
    const rev26 = data.reviews_progression?.review_2026;

    return (
      <div className="w-full my-4 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#18181b] shadow-sm overflow-hidden text-slate-900 dark:text-zinc-100 font-sans transition-all">
        {/* Header: Employee Profile & Executive Clearance */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-white/10 bg-slate-50/60 dark:bg-zinc-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <img
              src={emp.avatar}
              alt={emp.name}
              className="w-12 h-12 rounded-xl object-cover ring-2 ring-blue-500/20 shadow-xs"
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                  {emp.name}
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                  {emp.staff_id}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-500/20">
                  YoY Comparison
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                {emp.designation} &bull; {emp.department} &bull; Supervisor: {emp.supervisor}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {telemetry && (
              <button
                onClick={() => setShowSqlDrawer(!showSqlDrawer)}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-700 text-xs font-mono text-slate-700 dark:text-zinc-300 transition flex items-center gap-1.5 shadow-xs"
              >
                <Terminal className="w-3.5 h-3.5 text-blue-500" />
                <span>SQL ({telemetry.execution_time_ms}ms)</span>
                {showSqlDrawer ? <ChevronUp className="w-3 h-3 text-slate-400" /> : <ChevronDown className="w-3 h-3 text-slate-400" />}
              </button>
            )}

            {data.clearance && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-emerald-500/20 bg-emerald-50/70 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 text-xs font-medium">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>HR Authorized</span>
              </div>
            )}
          </div>
        </div>

        {/* Collapsible SQL Inspector */}
        <AnimatePresence>
          {showSqlDrawer && telemetry && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-b border-slate-200 dark:border-white/10 bg-slate-900 text-zinc-200 p-4 font-mono text-xs overflow-hidden"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-zinc-400 text-[11px]">
                  <Database className="w-3.5 h-3.5 text-blue-400" />
                  <span>PostgreSQL 16 &bull; {telemetry.query_strategy} ({telemetry.execution_time_ms}ms)</span>
                </div>
                <button
                  onClick={handleCopySql}
                  className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[10px] flex items-center gap-1"
                >
                  {copiedSql ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedSql ? "Copied" : "Copy SQL"}</span>
                </button>
              </div>
              <pre className="p-3 rounded-lg bg-black/40 overflow-x-auto text-[11px] leading-relaxed text-blue-300">
                {telemetry.executed_sql}
              </pre>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Notice */}
        {actionNotice && (
          <div className="mx-4 sm:mx-5 mt-3 p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
            <span>{actionNotice}</span>
          </div>
        )}

        {/* 1. Core YoY Comparison Scorecard (2025 vs 2026) */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-white/5 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              Year-over-Year Comparative Scorecard (2025 vs 2026)
            </h4>
            <span className="text-[11px] text-slate-400 font-mono">
              Indexed DB Record &bull; November Baseline
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5">
            {/* Attendance Rate */}
            {yoy.attendance_rate && (
              <div className="p-3 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50/70 dark:bg-zinc-900/40">
                <span className="text-[10px] font-semibold text-slate-400 uppercase block">Attendance Rate</span>
                <div className="flex items-baseline justify-between mt-1">
                  <span className="text-sm font-bold font-mono text-slate-900 dark:text-white">
                    {yoy.attendance_rate.val_2026}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 line-through">
                    {yoy.attendance_rate.val_2025}
                  </span>
                </div>
                <div className={`text-[11px] font-semibold mt-1 flex items-center gap-0.5 ${yoy.attendance_rate.improved ? "text-emerald-600 dark:text-emerald-400" : "text-rose-500"}`}>
                  <ArrowUpRight className="w-3 h-3" />
                  <span>{yoy.attendance_rate.delta} YoY</span>
                </div>
              </div>
            )}

            {/* Punctuality Score */}
            {yoy.punctuality_score && (
              <div className="p-3 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50/70 dark:bg-zinc-900/40">
                <span className="text-[10px] font-semibold text-slate-400 uppercase block">Punctuality Score</span>
                <div className="flex items-baseline justify-between mt-1">
                  <span className="text-sm font-bold font-mono text-slate-900 dark:text-white">
                    {yoy.punctuality_score.val_2026}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 line-through">
                    {yoy.punctuality_score.val_2025}
                  </span>
                </div>
                <div className={`text-[11px] font-semibold mt-1 flex items-center gap-0.5 ${yoy.punctuality_score.improved ? "text-emerald-600 dark:text-emerald-400" : "text-rose-500"}`}>
                  <ArrowUpRight className="w-3 h-3" />
                  <span>{yoy.punctuality_score.delta}</span>
                </div>
              </div>
            )}

            {/* Late Days */}
            {yoy.late_days && (
              <div className="p-3 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50/70 dark:bg-zinc-900/40">
                <span className="text-[10px] font-semibold text-slate-400 uppercase block">Late Arrival Swipes</span>
                <div className="flex items-baseline justify-between mt-1">
                  <span className="text-sm font-bold font-mono text-slate-900 dark:text-white">
                    {yoy.late_days.val_2026}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 line-through">
                    {yoy.late_days.val_2025}
                  </span>
                </div>
                <div className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-0.5">
                  <ArrowDownRight className="w-3 h-3" />
                  <span>{yoy.late_days.delta}</span>
                </div>
              </div>
            )}

            {/* Overtime Hours */}
            {yoy.overtime_hours && (
              <div className="p-3 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50/70 dark:bg-zinc-900/40">
                <span className="text-[10px] font-semibold text-slate-400 uppercase block">Overtime Hours</span>
                <div className="flex items-baseline justify-between mt-1">
                  <span className="text-sm font-bold font-mono text-slate-900 dark:text-white">
                    {yoy.overtime_hours.val_2026}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 line-through">
                    {yoy.overtime_hours.val_2025}
                  </span>
                </div>
                <div className="text-[11px] font-semibold text-purple-600 dark:text-purple-400 mt-1 flex items-center gap-0.5">
                  <TrendingUp className="w-3 h-3" />
                  <span>{yoy.overtime_hours.delta}</span>
                </div>
              </div>
            )}

            {/* Performance Rating */}
            {yoy.performance_rating && (
              <div className="p-3 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50/70 dark:bg-zinc-900/40">
                <span className="text-[10px] font-semibold text-slate-400 uppercase block">Performance Rating</span>
                <div className="flex items-baseline justify-between mt-1">
                  <span className="text-sm font-bold font-mono text-amber-500">
                    ⭐ {yoy.performance_rating.val_2026}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 line-through">
                    {yoy.performance_rating.val_2025}
                  </span>
                </div>
                <div className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 mt-1 flex items-center gap-0.5">
                  <Award className="w-3 h-3" />
                  <span>{yoy.performance_rating.delta} Gain</span>
                </div>
              </div>
            )}

            {/* Salary Progression */}
            {yoy.salary_usd && (
              <div className="p-3 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50/70 dark:bg-zinc-900/40">
                <span className="text-[10px] font-semibold text-slate-400 uppercase block">Compensation</span>
                <div className="flex items-baseline justify-between mt-1">
                  <span className="text-sm font-bold font-mono text-emerald-600 dark:text-emerald-400">
                    {yoy.salary_usd.val_2026}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 line-through">
                    {yoy.salary_usd.val_2025}
                  </span>
                </div>
                <div className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 mt-1 truncate">
                  {yoy.salary_usd.delta}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 2. Visual Comparative Bar Chart (2025 vs 2026 Metrics) */}
        {chartData.length > 0 && (
          <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-white/5 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <BarChart3 className="w-4 h-4 text-blue-500" />
                  Year-over-Year Metric Comparison: 2025 Baseline vs 2026
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                  Side-by-side progression across attendance rate, punctuality, KPI delivery & overtime
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs font-mono">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded bg-slate-400" />
                  <span>2025</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded bg-blue-600" />
                  <span>2026</span>
                </div>
              </div>
            </div>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="metric" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#18181b",
                      borderColor: "rgba(255,255,255,0.1)",
                      borderRadius: "8px",
                      color: "#fff",
                      fontSize: "12px",
                    }}
                  />
                  <Bar dataKey="y2025" name="2025 Historical" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="y2026" name="2026 Current" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* 3. Biometric Discipline & Arrival Turnaround */}
        {data.biometric_discipline && (
          <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-white/5 bg-slate-50/30 dark:bg-zinc-900/20">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-2 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-blue-500" />
              Biometric Punch Turnaround & Arrival Discipline
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-white dark:bg-zinc-800 border border-slate-200 dark:border-white/5">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">2025 Avg Morning Check-in</span>
                <div className="text-base font-bold font-mono text-slate-500 mt-0.5">
                  {data.biometric_discipline.avg_arrival_2025}
                </div>
                <span className="text-[10px] text-amber-600 dark:text-amber-400">Regular morning delays</span>
              </div>

              <div className="p-3 rounded-lg bg-white dark:bg-zinc-800 border border-slate-200 dark:border-white/5">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">2026 Avg Morning Check-in</span>
                <div className="text-base font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">
                  {data.biometric_discipline.avg_arrival_2026}
                </div>
                <span className="text-[10px] text-emerald-600">On-time desk presence</span>
              </div>

              <div className="p-3 rounded-lg bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/40 flex flex-col justify-between">
                <span className="text-[10px] text-blue-600 dark:text-blue-300 uppercase font-semibold">HR Arrival Impact</span>
                <p className="text-xs font-semibold text-blue-900 dark:text-blue-100">
                  {data.biometric_discipline.improvement}
                </p>
                <span className="text-[10px] text-blue-500 font-mono">
                  Biometric Badge Swipe Verified
                </span>
              </div>
            </div>
          </div>
        )}

        {/* 4. Supervisor Review Progression Notes (2025 vs 2026) */}
        {rev25 && rev26 && (
          <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-white/5 space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-indigo-500" />
              Supervisor Evaluation & Trajectory Comparison
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/60 dark:bg-zinc-900/40">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-slate-700 dark:text-zinc-300">2025 Annual Review</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300">
                    ⭐ {rev25.rating} / 5.0
                  </span>
                </div>
                <p className="text-slate-600 dark:text-zinc-400 italic leading-relaxed">
                  &ldquo;{rev25.notes}&rdquo;
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-blue-200 dark:border-blue-900/50 bg-blue-50/40 dark:bg-blue-950/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-blue-900 dark:text-blue-200">2026 Executive Review</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-600 text-white font-bold">
                    ⭐ {rev26.rating} / 5.0
                  </span>
                </div>
                <p className="text-slate-700 dark:text-zinc-300 italic leading-relaxed">
                  &ldquo;{rev26.notes}&rdquo;
                </p>
                {rev26.promotion_eligible && (
                  <div className="mt-2 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Executive sign-off: Eligible for Senior Architect Promotion</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 5. Recent Biometric Swipes Log */}
        {data.recent_punches && data.recent_punches.length > 0 && (
          <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-white/5 space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              Recent Biometric Swipes Log (Sample Days)
            </h4>
            <div className="space-y-1.5">
              {data.recent_punches.slice(0, 5).map((punch, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-lg border border-slate-200 dark:border-white/5 bg-slate-50/40 dark:bg-zinc-900/30 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-slate-400 w-12">{punch.day}</span>
                    <span className="font-medium text-slate-800 dark:text-zinc-200">
                      {punch.first_punch} &rarr; {punch.last_punch}
                    </span>
                    <span className="text-[10px] text-slate-400 hidden sm:inline">
                      Duration: {punch.total_hours} &bull; Overtime: {punch.overtime}
                    </span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                    punch.status === "Present"
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      : "bg-amber-500/10 text-amber-600"
                  }`}>
                    {punch.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 6. Executive Action Footer */}
        <div className="p-4 bg-slate-50 dark:bg-zinc-900/60 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="text-[11px] text-slate-500">
            Supervisor Actions for {emp.name}:
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleAction(`Commendation recorded for ${emp.name} for +${yoy.attendance_rate?.delta} punctuality growth!`)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 font-medium transition"
            >
              Send Commendation
            </button>
            <button
              onClick={() => onTriggerQuery?.(`Schedule 1:1 review meeting with ${emp.name}`)}
              className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition shadow-xs"
            >
              Schedule 1:1 Review
            </button>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW B: CLEAN DEPARTMENT ROSTER AUDIT (When broad query is requested)
  // =========================================================================
  const employeesList = data.employees || [];
  return (
    <div className="w-full my-4 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#18181b] shadow-sm overflow-hidden text-slate-900 dark:text-zinc-100 font-sans transition-all">
      <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-zinc-900/40 flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            {data.title || "HRIS Attendance Roster Audit"}
          </h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            Tip: Ask for specific employee deep comparison with last year (e.g. &ldquo;Compare Ayesha Rahman with last year&rdquo;)
          </p>
        </div>
        {telemetry && (
          <span className="font-mono text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2.5 py-1 rounded-md border border-blue-200 dark:border-blue-900/40">
            {telemetry.execution_time_ms}ms &bull; PostgreSQL 16
          </span>
        )}
      </div>

      <div className="p-4 overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-700 dark:text-zinc-300">
          <thead className="bg-slate-50 dark:bg-zinc-800/60 border-b border-slate-200 dark:border-white/10 text-slate-500 uppercase text-[10px] font-semibold">
            <tr>
              <th className="py-2.5 px-3">Employee</th>
              <th className="py-2.5 px-3">Department</th>
              <th className="py-2.5 px-3 text-center">Attendance %</th>
              <th className="py-2.5 px-3 text-center">Late Days</th>
              <th className="py-2.5 px-3 text-center">Overtime (h)</th>
              <th className="py-2.5 px-3 text-center">Rating</th>
              <th className="py-2.5 px-3 text-right">YoY Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-white/5">
            {employeesList.map((e) => (
              <tr key={e.staff_id} className="hover:bg-slate-50 dark:hover:bg-zinc-800/40 transition">
                <td className="py-2.5 px-3">
                  <div className="flex items-center gap-2">
                    <img src={e.avatar} alt={e.name} className="w-7 h-7 rounded-full object-cover" />
                    <div>
                      <span className="font-semibold text-slate-900 dark:text-white">{e.name}</span>
                      <span className="text-[10px] font-mono text-slate-400 block">{e.staff_id}</span>
                    </div>
                  </div>
                </td>
                <td className="py-2.5 px-3">{e.department}</td>
                <td className="py-2.5 px-3 text-center font-mono font-bold">{e.attendance.attendance_rate}%</td>
                <td className="py-2.5 px-3 text-center font-mono">{e.attendance.late_days}</td>
                <td className="py-2.5 px-3 text-center font-mono">+{e.attendance.overtime_hours}h</td>
                <td className="py-2.5 px-3 text-center font-mono text-amber-500">⭐ {e.performance.rating}</td>
                <td className="py-2.5 px-3 text-right">
                  <button
                    onClick={() => onTriggerQuery?.(`Compare ${e.name} (${e.staff_id}) with last year`)}
                    className="px-2.5 py-1 rounded bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-950/40 dark:text-blue-300 text-[11px] font-medium"
                  >
                    Compare YoY &rarr;
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="p-3 bg-slate-50 dark:bg-zinc-900/60 border-t border-slate-100 dark:border-white/5 flex items-center gap-2 overflow-x-auto text-xs">
        <span className="text-slate-400 whitespace-nowrap">Deep YoY Queries:</span>
        {[
          "Compare Ayesha Rahman (EMP-1001) with last year",
          "Compare Nusrat Jahan with last year",
          "Compare Tanvir Hasan with last year",
        ].map((p) => (
          <button
            key={p}
            onClick={() => onTriggerQuery?.(p)}
            className="px-2.5 py-1 rounded-md bg-white dark:bg-zinc-800 border border-slate-200 dark:border-white/10 hover:border-blue-400 whitespace-nowrap text-slate-700 dark:text-zinc-300"
          >
            {p}
          </button>
        ))}
      </div>
    </div>
  );
}
