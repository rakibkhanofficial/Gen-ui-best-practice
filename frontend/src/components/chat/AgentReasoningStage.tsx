"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Brain,
  Search,
  LineChart,
  CheckCircle2,
  Sparkles,
  Loader2,
} from "lucide-react";

export type AgentStage = "Idle" | "Thinking" | "Searching" | "Analysing" | "Completed";

interface AgentReasoningStageProps {
  stage: AgentStage;
  detail?: string;
  durationMs?: number;
}

export function AgentReasoningStage({
  stage,
  detail,
  durationMs,
}: AgentReasoningStageProps) {
  if (stage === "Idle" || !stage) return null;

  const getStageConfig = (s: AgentStage) => {
    switch (s) {
      case "Thinking":
        return {
          icon: <Brain className="w-3.5 h-3.5 text-amber-500 animate-pulse" />,
          bg: "bg-amber-50/90 text-amber-900 border-amber-200/80 dark:bg-amber-950/40 dark:border-amber-800/60 dark:text-amber-200",
          title: "Thinking & Reasoning (Gemini 3.8 Flash)",
        };
      case "Searching":
        return {
          icon: <Search className="w-3.5 h-3.5 text-sky-500 animate-bounce" />,
          bg: "bg-sky-50/90 text-sky-900 border-sky-200/80 dark:bg-sky-950/40 dark:border-sky-800/60 dark:text-sky-200",
          title: "Searching Knowledge & Tools",
        };
      case "Analysing":
        return {
          icon: <LineChart className="w-3.5 h-3.5 text-indigo-500" />,
          bg: "bg-indigo-50/90 text-indigo-900 border-indigo-200/80 dark:bg-indigo-950/40 dark:border-indigo-800/60 dark:text-indigo-200",
          title: "Analysing Data & Structuring GenUI",
        };
      case "Completed":
        return {
          icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />,
          bg: "bg-emerald-50/90 text-emerald-900 border-emerald-200/80 dark:bg-emerald-950/40 dark:border-emerald-800/60 dark:text-emerald-200",
          title: "Execution Completed",
        };
      default:
        return {
          icon: <Sparkles className="w-3.5 h-3.5 text-blue-500" />,
          bg: "bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300",
          title: stage,
        };
    }
  };

  const config = getStageConfig(stage);

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      className={`my-2 p-2.5 rounded-xl border text-xs flex items-center justify-between ${config.bg} shadow-xs backdrop-blur-xs`}
    >
      <div className="flex items-center gap-2">
        <div className="p-1 rounded-lg bg-black/5 dark:bg-black/20">{config.icon}</div>
        <div>
          <span className="font-semibold block leading-tight">{config.title}</span>
          {detail && (
            <span className="text-[11px] opacity-80 block mt-0.5">{detail}</span>
          )}
        </div>
      </div>

      {stage !== "Completed" ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin opacity-70" />
      ) : (
        <span className="text-[10px] font-mono opacity-70">ready</span>
      )}
    </motion.div>
  );
}
