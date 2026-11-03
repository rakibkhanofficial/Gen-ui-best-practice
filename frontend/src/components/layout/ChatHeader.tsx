"use client";

import React, { useState, useEffect } from "react";
import {
  PanelLeft,
  Sun,
  Moon,
  Settings,
  ChevronDown,
  FileSpreadsheet,
  CheckCircle2,
  X,
  Code2,
  Cpu,
  Bot
} from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { UserSession } from "@/lib/auth";

interface ChatHeaderProps {
  user: UserSession | null;
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  onOpenUpload: () => void;
}

export function ChatHeader({
  user,
  sidebarOpen,
  onToggleSidebar,
  onOpenUpload,
}: ChatHeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const [isMounted, setIsMounted] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showModelMenu, setShowModelMenu] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <>
      {/* Google AI Studio Top Header Bar */}
      <header className="h-14 px-4 border-b border-slate-200/60 dark:border-white/5 bg-white/90 dark:bg-[#131314]/90 backdrop-blur-md flex items-center justify-between sticky top-0 z-20 transition-colors select-none">
        {/* Left: Sidebar Toggle + Clean Model Status Pill */}
        <div className="flex items-center gap-2">
          {!sidebarOpen && (
            <button
              onClick={onToggleSidebar}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-slate-500 dark:text-zinc-400 transition-colors cursor-pointer"
              title="Open sidebar"
            >
              <PanelLeft className="w-4 h-4" />
            </button>
          )}

          {/* Model Status Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowModelMenu(!showModelMenu)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 text-slate-700 dark:text-zinc-300 font-medium text-xs transition-colors cursor-pointer"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-semibold text-slate-900 dark:text-white">Gemini 3.8 Flash</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-sm bg-blue-50 text-blue-600 dark:bg-white/10 dark:text-blue-300 font-mono">
                GenUI
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Model Dropdown */}
            {showModelMenu && (
              <div
                onClick={() => setShowModelMenu(false)}
                className="absolute top-full left-0 mt-1 w-68 p-2 bg-white dark:bg-[#1e1f20] border border-slate-200 dark:border-white/10 rounded-2xl shadow-xl z-50 text-xs"
              >
                <div className="p-2.5 rounded-xl bg-blue-50/70 dark:bg-white/5 border border-blue-200/50 dark:border-white/10">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-900 dark:text-white">Gemini 3.8 Flash</span>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">Active</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1 leading-relaxed">
                    Google DeepMind latest multimodal agent model with native tool execution and SSE streaming.
                  </p>
                </div>

                <div className="p-2.5 mt-1 rounded-xl opacity-70">
                  <div className="font-semibold text-slate-700 dark:text-zinc-300">Google Antigravity SDK</div>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5 leading-relaxed">
                    Agentic orchestration bus connecting frontend GenUI mounts with backend Python tools.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Upload Shortcut + Theme Switcher + Gear Settings Button (Matching screenshot) */}
        <div className="flex items-center gap-1.5">
          {/* Upload Excel shortcut */}
          <button
            onClick={onOpenUpload}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 text-slate-600 dark:text-zinc-400 text-xs font-medium transition-colors cursor-pointer"
            title="Attach Excel (.xlsx, .csv) or Image"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500" />
            <span className="hidden sm:inline">Attach Data</span>
          </button>

          {/* Theme Switcher Button */}
          <button
            onClick={toggleTheme}
            suppressHydrationWarning
            className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-slate-100 dark:hover:bg-white/10 text-slate-500 dark:text-zinc-400 transition-colors cursor-pointer"
            title="Toggle theme"
          >
            {!isMounted ? (
              <div className="w-4 h-4 rounded-full bg-slate-300 dark:bg-zinc-700" />
            ) : theme === "dark" ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-500" />
            )}
          </button>

          {/* Settings / Gear Button matching screenshot top right */}
          <button
            onClick={() => setShowSettingsModal(true)}
            className="w-9 h-9 rounded-full border border-slate-200/80 dark:border-white/10 flex items-center justify-center text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-all shadow-2xs cursor-pointer"
            title="Studio Settings & Architecture"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Settings & Architecture Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1e1f20] border border-slate-200/90 dark:border-white/10 rounded-3xl max-w-2xl w-full p-6 shadow-2xl relative max-h-[85vh] overflow-y-auto">
            <button
              onClick={() => setShowSettingsModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 text-slate-500 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white text-base">
                  Google AI Studio & Antigravity Architecture
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  Gemini 3.8 Flash &bull; Google Antigravity SDK &bull; Generative UI V2
                </p>
              </div>
            </div>

            <div className="space-y-4 text-xs text-slate-700 dark:text-zinc-300">
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-black/30 border border-slate-200/80 dark:border-white/5 space-y-2">
                <span className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  Key Architectural Principles
                </span>
                <p className="leading-relaxed text-slate-600 dark:text-zinc-400">
                  Every request flows through the FastAPI backend at <code className="text-blue-500 font-mono">/api/chat/stream</code>. The agent reports honest reasoning stages: <code className="text-blue-500">Thinking</code> &rarr; <code className="text-sky-500">Searching</code> &rarr; <code className="text-indigo-500">Analysing</code> &rarr; <code className="text-emerald-500">Completed</code>, streaming markdown and structured GenUI components.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-black/20 border border-slate-200/70 dark:border-white/5">
                  <div className="font-medium text-slate-900 dark:text-white flex items-center gap-1.5 mb-1">
                    <Code2 className="w-3.5 h-3.5 text-blue-500" />
                    Frontend Stack
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-normal">
                    Next.js 16 App Router, React 19, Tailwind CSS v4, Framer Motion, and Lucide icons.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-black/20 border border-slate-200/70 dark:border-white/5">
                  <div className="font-medium text-slate-900 dark:text-white flex items-center gap-1.5 mb-1">
                    <Cpu className="w-3.5 h-3.5 text-indigo-500" />
                    Backend Stack
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-normal">
                    FastAPI, Uvicorn, Python 3.12, Google GenAI SDK, and Pydantic v2 schemas.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
