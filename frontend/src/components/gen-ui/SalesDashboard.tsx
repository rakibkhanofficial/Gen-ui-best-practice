"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ArrowUpRight,
  Filter,
  Download,
  CheckCircle2,
  Clock,
  Sparkles,
  BarChart3,
  Layers,
  Table as TableIcon
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";

interface SalesKPI {
  label: string;
  value: string;
  change_pct: number;
  trend: "up" | "down" | "neutral";
  period: string;
}

interface MonthlySalesPoint {
  month: string;
  revenue: number;
  target: number;
  orders: number;
  expenses: number;
}

interface TransactionRow {
  id: string;
  customer: string;
  tier: "Enterprise" | "Growth" | "Starter";
  plan: string;
  amount: number;
  status: "Paid" | "Pending" | "Failed";
  date: string;
}

interface SalesAnalyticsData {
  title?: string;
  quarter?: string;
  year?: number;
  currency?: string;
  kpis?: SalesKPI[];
  monthly_trend?: MonthlySalesPoint[];
  category_breakdown?: Array<{ category: string; revenue: number; share_pct: number }>;
  recent_transactions?: TransactionRow[];
  summary_insight?: string;
}

interface SalesDashboardProps {
  data?: SalesAnalyticsData;
  status?: "inProgress" | "executing" | "complete";
}

export function SalesDashboard({ data, status = "complete" }: SalesDashboardProps) {
  const [activeTab, setActiveTab] = useState<"charts" | "table">("charts");
  const [selectedTier, setSelectedTier] = useState<string>("All");

  if (status === "inProgress" || !data?.title) {
    return (
      <div className="w-full max-w-3xl p-6 rounded-3xl bg-white dark:bg-[#1e1f20] animate-pulse border border-slate-200 dark:border-white/10 my-3">
        <div className="flex justify-between items-center mb-6">
          <div className="h-7 w-48 bg-slate-200 dark:bg-slate-700 rounded-md" />
          <div className="h-6 w-24 bg-slate-200 dark:bg-slate-700 rounded-full" />
        </div>
        <div className="grid grid-cols-4 gap-3 mb-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-20 bg-slate-100 dark:bg-slate-800 rounded-2xl" />
          ))}
        </div>
        <div className="h-64 bg-slate-100 dark:bg-slate-800 rounded-2xl" />
      </div>
    );
  }

  const filteredTransactions = (data.recent_transactions || []).filter((tx) =>
    selectedTier === "All" ? true : tx.tier === selectedTier
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="w-full max-w-3xl my-4 rounded-3xl bg-white dark:bg-[#1e1f20] p-6 border border-slate-200/90 dark:border-white/10 shadow-xl shadow-indigo-500/5 relative overflow-hidden text-slate-800 dark:text-slate-100"
    >
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between pb-5 border-b border-slate-200/80 dark:border-white/10 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-indigo-500" />
              {data.title}
            </h3>
            <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 font-medium">
              <Sparkles className="w-3 h-3" /> Zen Analytics
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{data.summary_insight}</p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center bg-slate-100 dark:bg-white/10 p-1 rounded-xl border border-slate-200 dark:border-white/10">
          <button
            onClick={() => setActiveTab("charts")}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              activeTab === "charts"
                ? "bg-indigo-600 text-white shadow-xs"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" /> Trend Visuals
          </button>
          <button
            onClick={() => setActiveTab("table")}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              activeTab === "table"
                ? "bg-indigo-600 text-white shadow-xs"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            <TableIcon className="w-3.5 h-3.5" /> Ledger ({filteredTransactions.length})
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 my-5">
        {(data.kpis || []).map((kpi, idx) => {
          const isUp = kpi.trend === "up";
          return (
            <div
              key={idx}
              className="p-3.5 bg-slate-50/80 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors rounded-2xl border border-slate-200/80 dark:border-white/5 flex flex-col justify-between"
            >
              <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                {kpi.label}
              </div>
              <div className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
                {kpi.value}
              </div>
              <div className="flex items-center gap-1 mt-2">
                <span
                  className={`inline-flex items-center text-xs font-semibold ${
                    isUp ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                  }`}
                >
                  {isUp ? (
                    <TrendingUp className="w-3 h-3 mr-0.5" />
                  ) : (
                    <TrendingDown className="w-3 h-3 mr-0.5" />
                  )}
                  {kpi.change_pct > 0 ? `+${kpi.change_pct}%` : `${kpi.change_pct}%`}
                </span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 truncate">
                  {kpi.period}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Content: Chart or Table */}
      {activeTab === "charts" ? (
        <div className="space-y-4">
          <div className="p-4 bg-slate-50/70 dark:bg-white/5 rounded-2xl border border-slate-200/80 dark:border-white/5">
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Monthly Performance vs Target (USD)
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">Quarterly Target: $1.8M</span>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.monthly_trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" opacity={0.4} />
                  <XAxis dataKey="month" stroke="#64748b" fontSize={12} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickFormatter={(val) => `$${val / 1000}k`} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      borderColor: "#334155",
                      borderRadius: "0.75rem",
                      color: "#fff",
                      fontSize: "12px",
                      boxShadow: "0 10px 25px -5px rgba(0,0,0,0.3)",
                    }}
                    formatter={(val: any) => [`$${val?.toLocaleString()}`, ""]}
                  />
                  <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }} />
                  <Bar dataKey="revenue" name="Achieved Revenue" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="target" name="Target Goal" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expenses" name="OpEx" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Category breakdown bar */}
          <div className="p-4 bg-slate-50/70 dark:bg-white/5 rounded-2xl border border-slate-200/80 dark:border-white/5">
            <div className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2.5">
              Revenue by Product Category
            </div>
            <div className="space-y-2">
              {(data.category_breakdown || []).map((cat, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <span className="text-slate-700 dark:text-slate-300 w-36 truncate font-medium">{cat.category}</span>
                  <div className="flex-1 mx-3 h-2 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full"
                      style={{ width: `${cat.share_pct}%` }}
                    />
                  </div>
                  <span className="font-bold text-slate-900 dark:text-white w-24 text-right">
                    ${(cat.revenue / 1000).toFixed(0)}k ({cat.share_pct}%)
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Ledger View */
        <div className="space-y-3">
          {/* Filter Bar */}
          <div className="flex items-center justify-between py-1">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
              <Filter className="w-3.5 h-3.5" /> Filter Tier:
              {["All", "Enterprise", "Growth", "Starter"].map((tier) => (
                <button
                  key={tier}
                  onClick={() => setSelectedTier(tier)}
                  className={`px-2.5 py-0.5 rounded-lg text-xs transition-colors cursor-pointer ${
                    selectedTier === tier
                      ? "bg-indigo-600 text-white font-semibold shadow-xs"
                      : "bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  {tier}
                </button>
              ))}
            </div>

            <button
              onClick={() => alert("Simulating export of ledger transactions to CSV...")}
              className="inline-flex items-center gap-1 text-xs text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 px-3 py-1.5 rounded-xl transition-colors cursor-pointer font-medium"
            >
              <Download className="w-3.5 h-3.5" /> Export CSV
            </button>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-white/10">
            <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
              <thead className="bg-slate-100/90 dark:bg-white/5 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-white/10 uppercase text-[10px] tracking-wider font-semibold">
                <tr>
                  <th className="py-2.5 px-3">Transaction</th>
                  <th className="py-2.5 px-3">Customer</th>
                  <th className="py-2.5 px-3">Tier</th>
                  <th className="py-2.5 px-3">Plan</th>
                  <th className="py-2.5 px-3">Amount</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5 bg-white dark:bg-transparent">
                {filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                    <td className="py-2.5 px-3 font-mono text-slate-400 dark:text-slate-500">{tx.id}</td>
                    <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">{tx.customer}</td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 font-semibold">
                        {tx.tier}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300 font-medium">{tx.plan}</td>
                    <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white font-mono">
                      ${tx.amount.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3">
                      {tx.status === "Paid" ? (
                        <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-[11px] font-semibold">
                          <CheckCircle2 className="w-3 h-3" /> Paid
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 text-[11px] font-semibold">
                          <Clock className="w-3 h-3" /> Pending
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-slate-500 dark:text-slate-400">{tx.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </motion.div>
  );
}
