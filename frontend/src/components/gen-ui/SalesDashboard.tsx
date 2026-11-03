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
      <div className="w-full max-w-2xl p-6 rounded-2xl glass-panel animate-pulse border border-slate-700/60 my-3">
        <div className="flex justify-between items-center mb-6">
          <div className="h-7 w-48 bg-slate-700 rounded-md" />
          <div className="h-6 w-24 bg-slate-700 rounded-full" />
        </div>
        <div className="grid grid-cols-4 gap-3 mb-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-20 bg-slate-800 rounded-xl" />
          ))}
        </div>
        <div className="h-64 bg-slate-800/80 rounded-xl" />
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
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="w-full max-w-3xl my-4 rounded-2xl glass-panel-elevated p-6 border border-slate-700/60 shadow-2xl relative overflow-hidden text-slate-100"
    >
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between pb-5 border-b border-slate-700/60 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-indigo-400" />
              {data.title}
            </h3>
            <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full bg-indigo-950/80 text-indigo-300 border border-indigo-800 font-medium">
              <Sparkles className="w-3 h-3" /> Zen Analytics
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">{data.summary_insight}</p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center bg-slate-900/90 p-1 rounded-xl border border-slate-700">
          <button
            onClick={() => setActiveTab("charts")}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
              activeTab === "charts"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" /> Trend Visuals
          </button>
          <button
            onClick={() => setActiveTab("table")}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
              activeTab === "table"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
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
              className="p-3.5 bg-slate-900/70 hover:bg-slate-900 transition-colors rounded-xl border border-slate-800 flex flex-col justify-between"
            >
              <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                {kpi.label}
              </div>
              <div className="text-xl font-bold text-white mt-1">
                {kpi.value}
              </div>
              <div className="flex items-center gap-1 mt-2">
                <span
                  className={`inline-flex items-center text-xs font-semibold ${
                    isUp ? "text-emerald-400" : "text-rose-400"
                  }`}
                >
                  {isUp ? (
                    <TrendingUp className="w-3 h-3 mr-0.5" />
                  ) : (
                    <TrendingDown className="w-3 h-3 mr-0.5" />
                  )}
                  {kpi.change_pct > 0 ? `+${kpi.change_pct}%` : `${kpi.change_pct}%`}
                </span>
                <span className="text-[10px] text-slate-400 truncate">
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
          <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800">
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-semibold text-slate-300">
                Monthly Performance vs Target (USD)
              </span>
              <span className="text-[11px] text-slate-400">Quarterly Target: $1.8M</span>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.monthly_trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(val) => `$${val / 1000}k`} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      borderColor: "#334155",
                      borderRadius: "0.5rem",
                      color: "#fff",
                      fontSize: "12px",
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
          <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800">
            <div className="text-xs font-semibold text-slate-300 mb-2.5">
              Revenue by Product Category
            </div>
            <div className="space-y-2">
              {(data.category_breakdown || []).map((cat, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 w-36 truncate">{cat.category}</span>
                  <div className="flex-1 mx-3 h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-blue-400 rounded-full"
                      style={{ width: `${cat.share_pct}%` }}
                    />
                  </div>
                  <span className="font-semibold text-white w-20 text-right">
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
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Filter className="w-3.5 h-3.5" /> Filter Tier:
              {["All", "Enterprise", "Growth", "Starter"].map((tier) => (
                <button
                  key={tier}
                  onClick={() => setSelectedTier(tier)}
                  className={`px-2.5 py-0.5 rounded-md text-xs transition-colors ${
                    selectedTier === tier
                      ? "bg-indigo-600 text-white font-medium"
                      : "bg-slate-800 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {tier}
                </button>
              ))}
            </div>

            <button
              onClick={() => alert("Simulating export of ledger transactions...")}
              className="inline-flex items-center gap-1 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-2.5 py-1 rounded-md transition-colors"
            >
              <Download className="w-3.5 h-3.5" /> Export CSV
            </button>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/90 text-slate-400 border-b border-slate-800 uppercase text-[10px] tracking-wider">
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
              <tbody className="divide-y divide-slate-800/80 bg-slate-900/40">
                {filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="py-2.5 px-3 font-mono text-slate-400">{tx.id}</td>
                    <td className="py-2.5 px-3 font-semibold text-white">{tx.customer}</td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] bg-indigo-950 text-indigo-300 border border-indigo-800 font-medium">
                        {tx.tier}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-300">{tx.plan}</td>
                    <td className="py-2.5 px-3 font-bold text-white">
                      ${tx.amount.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3">
                      {tx.status === "Paid" ? (
                        <span className="inline-flex items-center gap-1 text-emerald-400 text-[11px] font-medium">
                          <CheckCircle2 className="w-3 h-3" /> Paid
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-amber-400 text-[11px] font-medium">
                          <Clock className="w-3 h-3" /> Pending
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-slate-400">{tx.date}</td>
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

