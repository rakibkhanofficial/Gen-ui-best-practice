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
        return "bg-rose-950 text-rose-300 border-rose-700";
      case "HIGH":
        return "bg-amber-950 text-amber-300 border-amber-700";
      case "MEDIUM":
        return "bg-yellow-950 text-yellow-300 border-yellow-700";
      default:
        return "bg-blue-950 text-blue-300 border-blue-700";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="w-full max-w-xl my-4 rounded-2xl glass-panel-elevated p-6 border border-slate-700/60 shadow-2xl relative overflow-hidden text-slate-100"
    >
      {/* Background glow warning */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between pb-4 border-b border-slate-700/60 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-400" />
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
          <p className="text-xs text-slate-400 mt-1">{data.description}</p>
        </div>

        {/* Action ID */}
        <span className="font-mono text-[11px] px-2 py-1 rounded bg-slate-900 border border-slate-800 text-slate-400">
          {data.action_id}
        </span>
      </div>

      {/* Target & Impact Diff */}
      <div className="my-4 space-y-2.5">
        <div className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
          <Lock className="w-3.5 h-3.5 text-amber-400" />
          Proposed System Mutations:
        </div>

        {(data.impacts || []).map((imp, idx) => (
          <div
            key={idx}
            className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 text-xs"
          >
            <div className="flex justify-between items-center mb-1.5 font-semibold">
              <span className="text-white">{imp.resource_name}</span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                {imp.action}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-slate-800/80">
              <div>
                <span className="text-slate-400 block text-[10px]">Current:</span>
                <span className="text-slate-300 font-mono">{imp.current_state}</span>
              </div>
              <div>
                <span className="text-amber-400 block text-[10px]">Proposed:</span>
                <span className="text-emerald-300 font-mono font-semibold">
                  {imp.proposed_state}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Status or Interactive Buttons */}
      {currentStatus === "pending_approval" ? (
        <div className="mt-5 pt-3 border-t border-slate-800">
          <div className="flex items-center justify-between mb-3 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              Authorization timeout in: <b className="text-white">{timeLeft}s</b>
            </span>
            <span className="text-[11px] text-slate-400">
              Agent execution suspended awaiting human review
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full h-1.5 bg-slate-800 rounded-full mb-4 overflow-hidden">
            <div
              className="h-full bg-amber-400 transition-all duration-1000 ease-linear rounded-full"
              style={{ width: `${(timeLeft / (data.timeout_seconds || 60)) * 100}%` }}
            />
          </div>

          {/* Decision Buttons */}
          <div className="flex items-center gap-3">
            <button
              disabled={isSubmitting}
              onClick={() => handleDecision("approve")}
              className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg transition-all disabled:opacity-50"
            >
              <UserCheck className="w-4 h-4" />
              {isSubmitting ? "Processing..." : "Approve & Execute Action"}
            </button>
            <button
              disabled={isSubmitting}
              onClick={() => handleDecision("reject")}
              className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-rose-950/80 text-rose-300 border border-slate-700 hover:border-rose-800 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
            >
              <XCircle className="w-4 h-4" />
              Reject & Abort
            </button>
          </div>
        </div>
      ) : currentStatus === "executed" || currentStatus === "approved" ? (
        <div className="mt-4 p-3.5 bg-emerald-950/50 border border-emerald-700/60 rounded-xl flex items-center justify-between text-xs text-emerald-200">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold">
              Action Authorized & Executed by Human Operator
            </span>
          </div>
          <span className="text-[10px] text-emerald-400 font-mono">
            Audit Log ID: {data.action_id}
          </span>
        </div>
      ) : currentStatus === "rejected" ? (
        <div className="mt-4 p-3.5 bg-rose-950/50 border border-rose-700/60 rounded-xl flex items-center justify-between text-xs text-rose-200">
          <div className="flex items-center gap-2">
            <XCircle className="w-4 h-4 text-rose-400" />
            <span className="font-semibold">
              Action Rejected by Human Operator. No changes applied.
            </span>
          </div>
          <span className="text-[10px] text-rose-400 font-mono">Aborted</span>
        </div>
      ) : (
        <div className="mt-4 p-3.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-400 text-center">
          Authorization window timed out (Expired). Please re-request action.
        </div>
      )}
    </motion.div>
  );
}

