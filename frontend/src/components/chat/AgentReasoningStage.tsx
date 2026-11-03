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
          icon: <Brain className="w-3.5 h-3.5 text-amber-400 animate-pulse" />,
          bg: "bg-amber-950/40 border-amber-800/60 text-amber-200",
          title: "Thinking & Reasoning (Gemini 3.8 Flash)",
        };
      case "Searching":
        return {
          icon: <Search className="w-3.5 h-3.5 text-sky-400 animate-bounce" />,
          bg: "bg-sky-950/40 border-sky-800/60 text-sky-200",
          title: "Searching Knowledge & Tools",
        };
      case "Analysing":
        return {
          icon: <LineChart className="w-3.5 h-3.5 text-indigo-400" />,
          bg: "bg-indigo-950/40 border-indigo-800/60 text-indigo-200",
          title: "Analysing Data & Structuring GenUI",
        };
      case "Completed":
        return {
          icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />,
          bg: "bg-emerald-950/40 border-emerald-800/60 text-emerald-200",
          title: "Execution Completed",
        };
      default:
        return {
          icon: <Sparkles className="w-3.5 h-3.5 text-blue-400" />,
          bg: "bg-slate-900 border-slate-800 text-slate-300",
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
      className={`my-2 p-2.5 rounded-xl border text-xs flex items-center justify-between ${config.bg} shadow-sm backdrop-blur-sm`}
    >
      <div className="flex items-center gap-2">
        <div className="p-1 rounded-lg bg-black/20">{config.icon}</div>
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

