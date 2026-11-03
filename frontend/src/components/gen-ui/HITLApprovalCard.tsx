"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle,
  ArrowRight,
  Sparkles,
  Lock,
  UserCheck
} from "lucide-react";
import confetti from "canvas-confetti";

interface ResourceImpact {
  resource_type: string;
  resource_name: string;
  action: "create" | "update" | "delete" | "refund" | "deploy";
  current_state?: string;
  proposed_state?: string;
}

interface HITLActionData {
  action_id?: string;
  action_type?: string;
  title?: string;
  description?: string;
  risk_level?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  timeout_seconds?: number;
  impacts?: ResourceImpact[];
  status?: "pending_approval" | "approved" | "rejected" | "executed" | "expired";
  created_at?: string;
  requested_by?: string;
}

interface HITLApprovalCardProps {
  data?: HITLActionData;
  status?: "inProgress" | "executing" | "complete";
  onDecision?: (actionId: string, decision: "approve" | "reject") => Promise<void> | void;
}

export function HITLApprovalCard({
  data,
  status = "complete",
  onDecision
}: HITLApprovalCardProps) {
  const [currentStatus, setCurrentStatus] = useState<string>(data?.status || "pending_approval");
  const [timeLeft, setTimeLeft] = useState<number>(data?.timeout_seconds || 60);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (data?.status) {
      setCurrentStatus(data.status);
    }
  }, [data?.status]);

  // Countdown timer effect
  useEffect(() => {
    if (currentStatus !== "pending_approval") return;
    if (timeLeft <= 0) {
      setCurrentStatus("expired");
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, currentStatus]);

  if (status === "inProgress" || !data?.title) {
    return (
      <div className="w-full max-w-xl p-6 rounded-2xl glass-panel animate-pulse border border-slate-700/60 my-3">
        <div className="h-6 w-48 bg-slate-700 rounded-md mb-4" />
        <div className="h-16 bg-slate-800 rounded-xl mb-3" />
        <div className="h-10 bg-slate-800 rounded-lg" />
      </div>
    );
  }

  const handleDecision = async (decision: "approve" | "reject") => {
    setIsSubmitting(true);
    try {
      if (onDecision && data?.action_id) {
        await onDecision(data.action_id, decision);
      } else {
        // Fallback backend call via same-origin route proxy
        await fetch("/api/actions/approve", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action_id: data?.action_id, decision }),
        });
      }

      const nextStatus = decision === "approve" ? "executed" : "rejected";
      setCurrentStatus(nextStatus);

      if (decision === "approve") {
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.75 },
        });
      }
    } catch (err) {
      console.error("Decision error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRiskBadge = (level?: string) => {
    switch (level) {
      case "CRITICAL":
        return "bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800";
      case "HIGH":
        return "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800";
      case "MEDIUM":
        return "bg-yellow-50 dark:bg-yellow-950/60 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800";
      default:
        return "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="w-full max-w-xl my-4 rounded-3xl bg-white dark:bg-[#1e1f20] p-6 border border-slate-200/90 dark:border-white/10 shadow-xl shadow-amber-500/5 relative overflow-hidden text-slate-800 dark:text-zinc-100"
    >
      {/* Background glow warning */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between pb-4 border-b border-slate-200/80 dark:border-white/10 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              Human-in-the-Loop Gatekeeper
            </h3>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full border font-bold uppercase ${getRiskBadge(
                data.risk_level
              )}`}
            >
              Risk: {data.risk_level}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">{data.description}</p>
        </div>

        {/* Action ID */}
        <span className="font-mono text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-[#202124] border border-slate-200 dark:border-white/10 text-slate-600 dark:text-zinc-400 shadow-2xs">
          {data.action_id}
        </span>
      </div>

      {/* Target & Impact Diff */}
      <div className="my-4 space-y-2.5">
        <div className="text-xs font-semibold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
          <Lock className="w-3.5 h-3.5 text-amber-500" />
          Proposed System Mutations:
        </div>

        {(data.impacts || []).map((imp, idx) => (
          <div
            key={idx}
            className="p-3 bg-slate-50/80 dark:bg-black/30 rounded-2xl border border-slate-200/80 dark:border-white/5 text-xs"
          >
            <div className="flex justify-between items-center mb-1.5 font-semibold">
              <span className="text-slate-900 dark:text-white">{imp.resource_name}</span>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-md bg-slate-200/80 dark:bg-white/10 text-slate-700 dark:text-zinc-300">
                {imp.action}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-slate-200/60 dark:border-white/5">
              <div>
                <span className="text-slate-400 dark:text-zinc-500 block text-[10px]">Current:</span>
                <span className="text-slate-600 dark:text-zinc-400 font-mono">{imp.current_state}</span>
              </div>
              <div>
                <span className="text-amber-600 dark:text-amber-400 block text-[10px]">Proposed:</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-mono font-semibold">
                  {imp.proposed_state}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Status or Interactive Buttons */}
      {currentStatus === "pending_approval" ? (
        <div className="mt-5 pt-3 border-t border-slate-200/80 dark:border-white/10">
          <div className="flex items-center justify-between mb-3 text-xs text-slate-500 dark:text-zinc-400">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              Authorization timeout in: <b className="text-slate-900 dark:text-white">{timeLeft}s</b>
            </span>
            <span className="text-[11px] text-slate-400 dark:text-zinc-500">
              Execution suspended awaiting review
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full h-1.5 bg-slate-100 dark:bg-zinc-800 rounded-full mb-4 overflow-hidden">
            <div
              className="h-full bg-amber-500 transition-all duration-1000 ease-linear rounded-full"
              style={{ width: `${(timeLeft / (data.timeout_seconds || 60)) * 100}%` }}
            />
          </div>

          {/* Decision Buttons */}
          <div className="flex items-center gap-3">
            <button
              disabled={isSubmitting}
              onClick={() => handleDecision("approve")}
              className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-xs transition-all disabled:opacity-50 cursor-pointer"
            >
              <UserCheck className="w-4 h-4" />
              {isSubmitting ? "Processing..." : "Approve & Execute Action"}
            </button>
            <button
              disabled={isSubmitting}
              onClick={() => handleDecision("reject")}
              className="py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-white/10 hover:bg-rose-50 dark:hover:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-slate-200 dark:border-white/10 hover:border-rose-300 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer"
            >
              <XCircle className="w-4 h-4" />
              Reject & Abort
            </button>
          </div>
        </div>
      ) : currentStatus === "executed" || currentStatus === "approved" ? (
        <div className="mt-4 p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-2xl flex items-center justify-between text-xs text-emerald-800 dark:text-emerald-200">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span className="font-semibold">
              Action Authorized & Executed by Human Operator
            </span>
          </div>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">
            Audit ID: {data.action_id}
          </span>
        </div>
      ) : currentStatus === "rejected" ? (
        <div className="mt-4 p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 rounded-2xl flex items-center justify-between text-xs text-rose-800 dark:text-rose-200">
          <div className="flex items-center gap-2">
            <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
            <span className="font-semibold">
              Action Rejected by Human Operator. No changes applied.
            </span>
          </div>
          <span className="text-[10px] text-rose-600 dark:text-rose-400 font-mono">Aborted</span>
        </div>
      ) : (
        <div className="mt-4 p-3.5 bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/10 rounded-2xl text-xs text-slate-500 dark:text-zinc-400 text-center">
          Authorization window timed out (Expired). Please re-request action.
        </div>
      )}
    </motion.div>
  );
}

