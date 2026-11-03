"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain,
  Search,
  LineChart,
  CheckCircle2,
  Sparkles,
  Loader2,
  ExternalLink,
  Globe,
  Radio
} from "lucide-react";

export type AgentStage = "Idle" | "Thinking" | "Searching" | "Analysing" | "Completed";

export interface SearchSource {
  name: string;
  domain: string;
  favicon: string;
  url?: string;
  status?: string;
  query?: string;
}

interface AgentReasoningStageProps {
  stage: AgentStage;
  detail?: string;
  sources?: SearchSource[];
  durationMs?: number;
}

export function AgentReasoningStage({
  stage,
  detail,
  sources = [],
  durationMs,
}: AgentReasoningStageProps) {
  if (stage === "Idle" || !stage) return null;

  const getStageConfig = (s: AgentStage) => {
    switch (s) {
      case "Thinking":
        return {
          icon: <Brain className="w-3.5 h-3.5 text-amber-500 animate-pulse" />,
          bg: "bg-amber-50/90 text-amber-900 border-amber-200/80 dark:bg-amber-950/40 dark:border-amber-800/60 dark:text-amber-200",
          title: "Thinking & Evaluating Intent (Gemini 3.8 Flash)",
        };
      case "Searching":
        return {
          icon: <Search className="w-3.5 h-3.5 text-sky-500 animate-bounce" />,
          bg: "bg-sky-50/90 text-sky-900 border-sky-200/80 dark:bg-sky-950/40 dark:border-sky-800/60 dark:text-sky-200",
          title: "Searching Live Web Sources & Knowledge APIs",
        };
      case "Analysing":
        return {
          icon: <LineChart className="w-3.5 h-3.5 text-indigo-500" />,
          bg: "bg-indigo-50/90 text-indigo-900 border-indigo-200/80 dark:bg-indigo-950/40 dark:border-indigo-800/60 dark:text-indigo-200",
          title: "Synthesizing Source Data & Formatting GenUI",
        };
      case "Completed":
        return {
          icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />,
          bg: "bg-emerald-50/90 text-emerald-900 border-emerald-200/80 dark:bg-emerald-950/40 dark:border-emerald-800/60 dark:text-emerald-200",
          title: "Execution & Source Verification Completed",
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
  const isFinished = stage === "Completed";

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      className="my-2 space-y-2"
    >
      {/* Main Reasoning Status Pill */}
      <div
        className={`p-2.5 rounded-xl border text-xs flex items-center justify-between ${config.bg} shadow-xs backdrop-blur-xs transition-colors`}
      >
        <div className="flex items-center gap-2 min-w-0">
          <div className="p-1 rounded-lg bg-black/5 dark:bg-black/20 shrink-0">
            {config.icon}
          </div>
          <div className="min-w-0">
            <span className="font-semibold block leading-tight truncate">
              {config.title}
            </span>
            {detail && (
              <span className="text-[11px] opacity-80 block mt-0.5 truncate">
                {detail}
              </span>
            )}
          </div>
        </div>

        {!isFinished ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin opacity-70 shrink-0 ml-2" />
        ) : (
          <span className="text-[10px] font-mono opacity-80 shrink-0 ml-2 font-medium text-emerald-600 dark:text-emerald-400">
            verified
          </span>
        )}
      </div>

      {/* Sources Searched / Consulted Rail */}
      <AnimatePresence>
        {sources && sources.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="p-3 rounded-xl bg-slate-50/90 dark:bg-[#1a1b1c] border border-slate-200/80 dark:border-white/10 shadow-xs text-xs space-y-2"
          >
            <div className="flex items-center justify-between text-[11px] font-medium text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                {!isFinished ? (
                  <>
                    <Radio className="w-3 h-3 text-sky-500 animate-pulse" />
                    <span>Querying {sources.length} active source{sources.length > 1 ? "s" : ""}:</span>
                  </>
                ) : (
                  <>
                    <Globe className="w-3 h-3 text-emerald-500" />
                    <span>Validated against {sources.length} verified source{sources.length > 1 ? "s" : ""}:</span>
                  </>
                )}
              </span>
              <span className="text-[10px] uppercase font-mono tracking-wider opacity-70">
                {!isFinished ? "Live Index" : "Cited"}
              </span>
            </div>

            {/* Source Chips */}
            <div className="flex flex-wrap gap-2">
              {sources.map((src, idx) => (
                <a
                  key={idx}
                  href={src.url || `https://${src.domain}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#252628] border border-slate-200 dark:border-white/10 hover:border-blue-400 dark:hover:border-blue-500/50 hover:shadow-xs transition-all text-xs"
                >
                  {/* High-res Favicon Logo */}
                  <img
                    src={src.favicon}
                    alt={src.domain}
                    className="w-3.5 h-3.5 rounded-xs shrink-0 object-contain"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = "none";
                    }}
                  />
                  <span className="font-semibold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {src.name}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {src.domain}
                  </span>
                  <ExternalLink className="w-2.5 h-2.5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
