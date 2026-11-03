"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Check, Loader2, Sparkles, Wrench } from "lucide-react";

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
  durationMs?: number;
  modelName?: string;
}

/**
 * AgentReasoningStage
 *
 * Clean, minimal agent deliberation indicator with smooth transition animations.
 * Verified sources are rendered separately after Generative UI as reference citations.
 */
export function AgentReasoningStage({
  stage,
  detail,
  durationMs,
  modelName = "GenUI Agent",
}: AgentReasoningStageProps) {
  const [elapsedSeconds, setElapsedSeconds] = useState(1);
  const [isExpanded, setIsExpanded] = useState(false);
  const isFinished = stage === "Completed";

  useEffect(() => {
    if (isFinished) return;
    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isFinished]);

  if (stage === "Idle" || !stage) return null;

  const durationSeconds = durationMs
    ? (durationMs / 1000).toFixed(1)
    : elapsedSeconds;

  return (
    <motion.div
      initial={{ opacity: 0, y: 2 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -2 }}
      transition={{ duration: 0.15 }}
      className="my-1.5 select-none font-sans"
    >
      {!isFinished ? (
        // Active Running State: Clean inline status with smooth pulse
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-2 text-xs text-slate-500 dark:text-zinc-400 py-0.5"
        >
          <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-500 shrink-0" />
          <span className="font-medium text-slate-700 dark:text-zinc-300">
            {stage === "Thinking" ? "Thinking" : stage === "Searching" ? "Calling tool" : "Structuring UI"}
          </span>
          <span className="text-slate-300 dark:text-zinc-600">&bull;</span>
          <span className="tabular-nums text-slate-400 dark:text-zinc-500 font-mono text-[11px]">
            {elapsedSeconds}s
          </span>

          {detail && (
            <>
              <span className="text-slate-300 dark:text-zinc-600">&bull;</span>
              <span className="text-slate-600 dark:text-zinc-400 truncate max-w-sm sm:max-w-md font-mono text-[11px] bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded-md border border-slate-200/60 dark:border-white/5">
                {detail}
              </span>
            </>
          )}
        </motion.div>
      ) : (
        // Finished State: Minimal collapsible toggle
        <div>
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-700 dark:text-zinc-500 dark:hover:text-zinc-300 transition-colors cursor-pointer py-0.5"
            title="Toggle deliberation details"
          >
            <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span>Thought for {durationSeconds}s</span>
            <ChevronDown
              className={`w-3 h-3 text-slate-400 dark:text-zinc-500 transition-transform duration-200 ${
                isExpanded ? "rotate-180" : ""
              }`}
            />
          </button>

          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className="overflow-hidden"
              >
                <div className="mt-1.5 pl-3 border-l-2 border-slate-200 dark:border-zinc-800 space-y-1 text-[11px] text-slate-500 dark:text-zinc-400 font-mono py-1">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-blue-500" />
                    <span>Evaluated intent with {modelName}</span>
                  </div>
                  {detail && (
                    <div className="flex items-center gap-1.5">
                      <Wrench className="w-3 h-3 text-blue-500" />
                      <span>{detail}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3 h-3 text-emerald-500" />
                    <span>Generative UI synthesized &amp; validated</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}
