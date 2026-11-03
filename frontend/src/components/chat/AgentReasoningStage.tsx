"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  ExternalLink,
  Globe,
  Radio,
  Wrench,
  Check
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
  modelName?: string;
}

export function AgentReasoningStage({
  stage,
  detail,
  sources = [],
  durationMs,
  modelName = "GenUI Agent",
}: AgentReasoningStageProps) {
  const [elapsedSeconds, setElapsedSeconds] = useState(1);
  const [isExpanded, setIsExpanded] = useState(false);
  const isFinished = stage === "Completed";

  // Running elapsed countup timer (1s tick)
  useEffect(() => {
    if (isFinished) return;
    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isFinished]);

  if (stage === "Idle" || !stage) return null;

  // Authentic Gemini Thought Labels matching Google Gemini 3.8 Flash & Google AI Studio
  const getStageLabel = (s: AgentStage) => {
    switch (s) {
      case "Thinking":
        return "Illuminating";
      case "Searching":
        return "Searching sources & calling tools";
      case "Analysing":
        return "Synthesizing data & structuring GenUI";
      case "Completed":
        return "Thought process complete";
      default:
        return s;
    }
  };

  const stageLabel = getStageLabel(stage);
  const durationSeconds = durationMs ? (durationMs / 1000).toFixed(1) : elapsedSeconds;

  return (
    <motion.div
      initial={{ opacity: 0, y: 3 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -3 }}
      transition={{ duration: 0.2 }}
      className="my-2 select-none font-sans"
    >
      {/* Line 1: Gemini 3.8 Flash • Running for 13s / Thought for 4s */}
      <div className="flex items-center gap-1.5 text-[13px] text-slate-500 dark:text-zinc-400 font-normal leading-none">
        <span className="text-slate-700 dark:text-zinc-300 font-normal">
          {modelName}
        </span>
        <span className="text-slate-400 dark:text-zinc-500">&bull;</span>
        {!isFinished ? (
          <span className="text-slate-500 dark:text-zinc-400">
            Running for {elapsedSeconds}s
          </span>
        ) : (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="inline-flex items-center gap-1 text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-zinc-200 transition-colors cursor-pointer"
            title="Toggle thought details"
          >
            <span>Thought for {durationSeconds}s</span>
            <ChevronDown
              className={`w-3.5 h-3.5 text-slate-400 dark:text-zinc-500 transition-transform duration-200 ${
                isExpanded ? "rotate-180" : ""
              }`}
            />
          </button>
        )}
      </div>

      {/* Line 2: (✦ Illuminating (Authentic coral arc + Google blue 4-point star matching Google AI Studio) */}
      {!isFinished && (
        <motion.div
          initial={{ opacity: 0, y: 2 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-1.5 mt-1.5 text-sm text-slate-600 dark:text-zinc-400 font-normal"
        >
          {/* Authentic coral red left arc bracket '(' + Google blue 4-point star '✦' */}
          <div className="flex items-center gap-1 select-none">
            <span className="text-[#EA4335] dark:text-[#ff6b60] text-sm font-semibold leading-none">
              (
            </span>
            <svg
              className="w-3 h-3 text-[#1a73e8] dark:text-[#8ab4f8] fill-current animate-pulse"
              viewBox="0 0 24 24"
            >
              <path d="M12 0C12 6.627 6.627 12 0 12C6.627 12 12 17.373 12 24C12 17.373 17.373 12 24 12C17.373 12 12 6.627 12 0Z" />
            </svg>
          </div>

          <span className="text-slate-600 dark:text-zinc-400 tracking-tight">{stageLabel}</span>

          {detail && stage === "Searching" && (
            <span className="text-xs text-slate-400 dark:text-zinc-500 truncate max-w-sm hidden sm:inline">
              &mdash; {detail}
            </span>
          )}
        </motion.div>
      )}

      {/* Expandable Reasoning Details, Tool Calls & Verified Live Sources Rail */}
      <AnimatePresence>
        {(isExpanded || (!isFinished && sources.length > 0)) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-2.5 space-y-2 overflow-hidden"
          >
            {/* Tool Call or Reasoning Detail */}
            {detail && (
              <div className="flex items-start gap-2 text-xs text-slate-600 dark:text-zinc-300 bg-slate-50/80 dark:bg-[#18191a] p-2.5 rounded-xl border border-slate-200/60 dark:border-white/5 font-mono">
                <Wrench className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                <span className="break-all">{detail}</span>
              </div>
            )}

            {/* Verified Live Sources Rail with Real Favicons */}
            {sources.length > 0 && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-medium text-slate-500 dark:text-zinc-400">
                  <span className="flex items-center gap-1.5">
                    {!isFinished ? (
                      <>
                        <Radio className="w-3 h-3 text-sky-500 animate-pulse" />
                        <span>Searching {sources.length} active source{sources.length > 1 ? "s" : ""}:</span>
                      </>
                    ) : (
                      <>
                        <Globe className="w-3 h-3 text-emerald-500" />
                        <span>Referenced {sources.length} verified source{sources.length > 1 ? "s" : ""}:</span>
                      </>
                    )}
                  </span>
                  <span className="text-[10px] uppercase font-mono tracking-wider opacity-60">
                    {!isFinished ? "Live Index" : "Verified"}
                  </span>
                </div>

                {/* Source Badges */}
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  {sources.map((src, idx) => (
                    <a
                      key={idx}
                      href={src.url || `https://${src.domain}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white dark:bg-[#202124] border border-slate-200/80 dark:border-white/10 hover:border-blue-400 dark:hover:border-blue-500/50 hover:shadow-xs transition-all text-xs"
                    >
                      <img
                        src={src.favicon}
                        alt={src.domain}
                        className="w-3.5 h-3.5 rounded-xs shrink-0 object-contain"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = "none";
                        }}
                      />
                      <span className="font-medium text-slate-700 dark:text-zinc-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors text-[11px]">
                        {src.name}
                      </span>
                      <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-mono">
                        {src.domain}
                      </span>
                      <ExternalLink className="w-2.5 h-2.5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
