"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Sparkles,
  Plus,
  Mic,
  ChevronDown,
  ArrowRight,
  ExternalLink,
  Check
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
  const [selectedMode, setSelectedMode] = useState("Default mode");
  const [modeOpen, setModeOpen] = useState(false);

  // Suggestions matching the screenshot + GenUI tool capabilities
  const suggestions = [
    {
      emoji: "🎮",
      label: "Create a game",
      prompt: "Create an interactive browser game with HTML5 Canvas and dynamic score physics",
    },
    {
      emoji: "⚡",
      label: "Three.js 3D scenes",
      prompt: "Build an interactive 3D biomolecular structure viewer with Mol* and Three.js",
    },
    {
      emoji: "🧬",
      label: "Add Bioscience Skills",
      prompt: "Analyze genetic variant effects and predict AlphaFold protein structures",
    },
    {
      emoji: "🤖",
      label: "Build an Android app",
      prompt: "Plan an Android Jetpack Compose app architecture with Kotlin coroutines",
    },
    {
      emoji: "✈️",
      label: "Find flights to Tokyo",
      prompt: "Find flights from Dhaka to Tokyo with airlines and pricing",
    },
    {
      emoji: "📊",
      label: "Sales dashboard",
      prompt: "Show enterprise revenue breakdown for Q3 2026 with interactive charts",
    },
    {
      emoji: "💼",
      label: "BDJobs & LinkedIn jobs",
      prompt: "Find Senior Full Stack Engineer jobs on BDJobs and LinkedIn",
    },
    {
      emoji: "📋",
      label: "Miro sprint plan",
      prompt: "Generate a Miro-style sprint planning board for our GenUI release",
    },
    {
      emoji: "💻",
      label: "IDE Code Studio",
      prompt: "Write a high-performance Python script for async SSE streaming with FastAPI",
    },
  ];

  const modes = [
    "Default mode",
    "Agentic GenUI",
    "Code Studio",
    "Data Analyst",
  ];

  const handleSend = () => {
    if (promptInput.trim()) {
      onSelectPrompt(promptInput.trim());
    } else {
      // Lucky pick from suggestions
      const lucky = suggestions[Math.floor(Math.random() * suggestions.length)];
      onSelectPrompt(lucky.prompt);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 sm:py-16 flex flex-col items-center justify-center min-h-[75vh]">
      {/* 1. Top Announcement Pill (Matching screenshot: [4] Introducing Gemini 4 Argon) */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white dark:bg-[#1e1f20] border border-slate-200/90 dark:border-white/10 text-xs text-slate-700 dark:text-zinc-300 font-medium mb-6 shadow-xs"
      >
        <span className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold">
          4
        </span>
        <span>Introducing Gemini 4 Argon & Google Antigravity SDK</span>
      </motion.div>

      {/* 2. Hero Headline (Matching screenshot: Build your ideas with Gemini) */}
      <motion.h1
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.05 }}
        className="text-3xl sm:text-4xl md:text-5xl font-normal text-slate-800 dark:text-white tracking-tight text-center mb-8 font-sans"
      >
        Build your ideas with Gemini
      </motion.h1>

      {/* 3. Center Signature Google AI Studio Prompt Box (Matching screenshot) */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="w-full max-w-2xl bg-white dark:bg-[#1e1f20] rounded-3xl border border-slate-200/90 dark:border-white/10 shadow-lg shadow-blue-500/5 p-4 sm:p-5 relative transition-all focus-within:border-blue-500/80 dark:focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-500/20"
      >
        {/* Multiline Textarea */}
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
          placeholder="Describe an app and let Gemini do the rest"
          className="w-full bg-transparent border-0 outline-none resize-none text-[15px] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 leading-relaxed font-sans"
        />

        {/* Bottom row inside prompt box matching screenshot */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-white/5 mt-2">
          {/* Left: (+) Plus attachment button */}
          <button
            type="button"
            onClick={onOpenUpload}
            className="w-8 h-8 rounded-full border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
            title="Attach Excel spreadsheet (.xlsx, .csv) or image"
          >
            <Plus className="w-4 h-4" />
          </button>

          {/* Right: Mode dropdown + Mic + Action button */}
          <div className="flex items-center gap-2">
            {/* Mode dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setModeOpen(!modeOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100/80 dark:bg-white/5 hover:bg-slate-200/80 dark:hover:bg-white/10 text-xs font-medium text-slate-700 dark:text-zinc-300 transition-colors cursor-pointer"
              >
                <span>{selectedMode}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {modeOpen && (
                <div
                  onClick={() => setModeOpen(false)}
                  className="absolute bottom-full right-0 mb-1.5 w-44 p-1 bg-white dark:bg-[#1a1b1c] border border-slate-200 dark:border-white/10 rounded-xl shadow-xl z-50 text-xs"
                >
                  {modes.map((m) => (
                    <button
                      key={m}
                      onClick={() => setSelectedMode(m)}
                      className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-left transition-colors cursor-pointer ${
                        selectedMode === m
                          ? "bg-blue-50 dark:bg-white/10 text-blue-600 dark:text-white font-medium"
                          : "text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-white/5"
                      }`}
                    >
                      <span>{m}</span>
                      {selectedMode === m && <Check className="w-3.5 h-3.5" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Mic button */}
            <button
              type="button"
              className="p-2 rounded-full text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
              title="Voice input"
            >
              <Mic className="w-4 h-4" />
            </button>

            {/* Action button: I'm feeling lucky or Generate */}
            <button
              type="button"
              onClick={handleSend}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/15 text-slate-800 dark:text-zinc-200 text-xs font-medium transition-all shadow-xs cursor-pointer group"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-500 fill-blue-500/20 group-hover:rotate-12 transition-transform" />
              <span>{promptInput.trim() ? "Generate" : "I'm feeling lucky"}</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* 4. Quick Suggestion Pills (Matching screenshot) */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
        className="flex flex-wrap items-center justify-center gap-2 mt-4 max-w-3xl"
      >
        {suggestions.map((item, idx) => (
          <button
            key={idx}
            onClick={() => onSelectPrompt(item.prompt)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white dark:bg-[#1e1f20] hover:bg-slate-100 dark:hover:bg-[#282a2c] border border-slate-200/80 dark:border-white/10 text-xs font-medium text-slate-700 dark:text-zinc-300 transition-all shadow-xs hover:border-slate-300 dark:hover:border-white/20 cursor-pointer"
          >
            <span>{item.emoji}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </motion.div>

      {/* 5. Bottom Showcase Card (Matching screenshot: Explore apps built with Gemini 4 Argon) */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="w-full max-w-2xl mt-12 p-4 rounded-2xl bg-white dark:bg-[#1e1f20] border border-slate-200/80 dark:border-white/10 shadow-xs flex items-center justify-between"
      >
        <span className="text-sm font-medium text-slate-800 dark:text-zinc-200 font-sans">
          Explore apps built with Gemini 4 Argon
        </span>
        <button
          onClick={() => onSelectPrompt("Showcase the Generative UI components and tools built with Gemini 3.8 Flash")}
          className="flex items-center gap-1 text-xs font-medium text-slate-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
        >
          <span>Browse the app gallery</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </motion.div>
    </div>
  );
}
