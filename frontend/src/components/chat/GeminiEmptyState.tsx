"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Sparkles,
  Plus,
  ArrowUp,
  Plane,
  BarChart3,
  Kanban,
  Briefcase,
  Code2,
  Sun,
  Coins,
  ShieldAlert
} from "lucide-react";

interface GeminiEmptyStateProps {
  userName?: string;
  onSelectPrompt: (prompt: string) => void;
  onOpenUpload?: () => void;
}

export function GeminiEmptyState({
  userName = "Presenter",
  onSelectPrompt,
  onOpenUpload,
}: GeminiEmptyStateProps) {
  const [promptInput, setPromptInput] = useState("");

  const suggestions = [
    {
      icon: Plane,
      label: "Flights to Tokyo",
      prompt: "Find flights from Dhaka to Tokyo with airlines and pricing",
    },
    {
      icon: BarChart3,
      label: "Q3 Sales Breakdown",
      prompt: "Show enterprise revenue breakdown for Q3 2026 with interactive charts",
    },
    {
      icon: Kanban,
      label: "Miro Sprint Board",
      prompt: "Generate a Miro-style sprint planning board for our GenUI release",
    },
    {
      icon: Briefcase,
      label: "BDJobs & LinkedIn",
      prompt: "Find Senior Full Stack Engineer jobs on BDJobs and LinkedIn",
    },
    {
      icon: Code2,
      label: "FastAPI SSE Code Studio",
      prompt: "Write a high-performance Python script for async SSE streaming with FastAPI",
    },
    {
      icon: Sun,
      label: "Tokyo Weather & Gear",
      prompt: "What is the weather in Tokyo today?",
    },
    {
      icon: Coins,
      label: "Currency Converter",
      prompt: "Convert 500 USD to BDT with exchange rate breakdown",
    },
    {
      icon: ShieldAlert,
      label: "HITL Refund Gatekeeper",
      prompt: "Request a refund authorization for customer order #99281",
    },
  ];

  const handleSend = () => {
    if (promptInput.trim()) {
      onSelectPrompt(promptInput.trim());
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-12 sm:py-20 flex flex-col items-center justify-center min-h-[75vh] select-none font-sans">
      {/* 1. Subtle Engine Badge */}
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 text-xs text-slate-600 dark:text-zinc-400 font-medium mb-5 shadow-2xs"
      >
        <Sparkles className="w-3.5 h-3.5 text-blue-500" />
        <span>Gen UI Best Practice &bull; CopilotKit &amp; Antigravity SDK</span>
      </motion.div>

      {/* 2. Headline & Subtitle */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.05 }}
        className="text-center mb-8 max-w-xl"
      >
        <h1 className="text-3xl sm:text-4xl font-normal text-slate-900 dark:text-white tracking-tight leading-tight">
          What would you like to explore?
        </h1>
        <p className="text-sm text-slate-500 dark:text-zinc-400 mt-2 leading-relaxed">
          Ask questions, generate dynamic UI components, analyze spreadsheets, or plan architecture.
        </p>
      </motion.div>

      {/* 3. Central Signature Prompt Box */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.1 }}
        className="w-full bg-white dark:bg-[#1e1f20] rounded-3xl border border-slate-200/90 dark:border-white/10 shadow-lg shadow-blue-500/5 p-4 relative transition-all focus-within:border-blue-500/70 dark:focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-500/20"
      >
        <textarea
          value={promptInput}
          onChange={(e) => setPromptInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          rows={3}
          placeholder="Ask about flights, weather, tech jobs, spreadsheets, or code..."
          className="w-full bg-transparent border-0 outline-none resize-none text-[15px] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 leading-relaxed font-sans"
        />

        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-white/5 mt-2">
          {/* File Attachment Button */}
          <button
            type="button"
            onClick={onOpenUpload}
            className="w-8 h-8 rounded-full border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
            title="Attach Excel spreadsheet (.xlsx, .csv) or image"
          >
            <Plus className="w-4 h-4" />
          </button>

          {/* Send Button */}
          <button
            type="button"
            disabled={!promptInput.trim()}
            onClick={handleSend}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium transition-all shadow-xs cursor-pointer ${
              promptInput.trim()
                ? "bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-slate-900 cursor-pointer"
                : "bg-slate-100 dark:bg-white/5 text-slate-400 dark:text-zinc-600 cursor-not-allowed"
            }`}
          >
            <span>Send</span>
            <ArrowUp className="w-3.5 h-3.5 stroke-[2.5]" />
          </button>
        </div>
      </motion.div>

      {/* 4. Quick Suggestion Chips */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.15 }}
        className="flex flex-wrap items-center justify-center gap-2 mt-4 max-w-2xl"
      >
        {suggestions.map((item, idx) => {
          const Icon = item.icon;
          return (
            <button
              key={idx}
              onClick={() => onSelectPrompt(item.prompt)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-[#1e1f20] hover:bg-slate-100 dark:hover:bg-[#282a2c] border border-slate-200/80 dark:border-white/10 text-xs font-medium text-slate-700 dark:text-zinc-300 transition-all shadow-xs hover:border-slate-300 dark:hover:border-white/20 cursor-pointer"
            >
              <Icon className="w-3.5 h-3.5 text-blue-500 shrink-0" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </motion.div>
    </div>
  );
}
