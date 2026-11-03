"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  PanelLeft,
  Sun,
  Moon,
  Info,
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
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [isMounted, setIsMounted] = useState(false);
  const [showArchModal, setShowArchModal] = useState(false);
  const [showModelMenu, setShowModelMenu] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <>
      <header className="h-14 px-4 border-b border-slate-200/80 dark:border-[#282a2c] bg-white/80 dark:bg-[#131314]/80 backdrop-blur-md flex items-center justify-between sticky top-0 z-20 transition-colors">
        {/* Left: Sidebar Toggle + Model Pill */}
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-slate-600 dark:text-[#c4c7c5] transition-colors"
            title={sidebarOpen ? "Collapse sidebar" : "Open sidebar"}
          >
            <PanelLeft className="w-4 h-4" />
          </button>

          {/* Model Selector Pill */}
          <div className="relative">
            <button
              onClick={() => setShowModelMenu(!showModelMenu)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 text-slate-800 dark:text-[#e3e3e3] font-medium text-xs transition-colors"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-semibold">Gemini 3.8 Flash</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-sm bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 font-normal">
                GenUI
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Model Dropdown */}
            {showModelMenu && (
              <div
                onClick={() => setShowModelMenu(false)}
                className="absolute top-full left-0 mt-1 w-64 p-2 bg-white dark:bg-[#1e1f20] border border-slate-200 dark:border-white/10 rounded-xl shadow-xl z-50 text-xs"
              >
                <div className="p-2 rounded-lg bg-blue-50 dark:bg-white/5 border border-blue-200/50 dark:border-white/10">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-900 dark:text-white">Gemini 3.8 Flash</span>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">Active</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-[#9aa0a6] mt-1">
                    Google DeepMind latest multimodal agent model with native tool execution and SSE streaming.
                  </p>
                </div>

                <div className="p-2 mt-1 rounded-lg opacity-60">
                  <div className="font-semibold text-slate-700 dark:text-slate-300">Google Antigravity SDK</div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Agentic orchestration bus connecting frontend GenUI mounts with backend Python tools.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Quick Actions */}
        <div className="flex items-center gap-1.5">
          {/* Upload Spreadsheet shortcut */}
          <button
            onClick={onOpenUpload}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-[#c4c7c5] text-xs font-medium transition-colors"
            title="Upload Excel (.xlsx, .csv) or Image"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500" />
            <span className="hidden sm:inline">Upload Excel</span>
          </button>

          {/* Architecture Modal Button */}
          <button
            onClick={() => setShowArchModal(true)}
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 text-slate-600 dark:text-[#c4c7c5] transition-colors"
            title="System Architecture & Documentation"
          >
            <Info className="w-4 h-4 text-blue-500" />
          </button>

          {/* Theme Switcher Button */}
          <button
            onClick={toggleTheme}
            suppressHydrationWarning
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 text-slate-600 dark:text-[#c4c7c5] transition-colors"
            title="Toggle theme"
          >
            {!isMounted ? (
              <div className="w-4 h-4 rounded-full bg-slate-400/30" />
            ) : theme === "dark" ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-500" />
            )}
          </button>
        </div>
      </header>

      {/* Architecture & Documentation Modal */}
      {showArchModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1e1f20] border border-slate-200 dark:border-white/10 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative max-h-[85vh] overflow-y-auto">
            <button
              onClick={() => setShowArchModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-slate-500"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  Generative UI Studio Architecture
                </h3>
                <p className="text-xs text-slate-500 dark:text-[#9aa0a6]">
                  Production Agentic Implementation &bull; Google Antigravity &bull; Gemini 3.8 Flash
                </p>
              </div>
            </div>

            <div className="space-y-4 text-xs text-slate-600 dark:text-[#c4c7c5]">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/5 space-y-2">
                <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                  Real SSE Streaming & Agent Reasoning Protocol
                </div>
                <p>
                  Every request flows through FastAPI backend at <code className="text-blue-500">/api/chat/stream</code>. The agent reports honest reasoning stages: <code className="text-blue-400">Thinking</code> &rarr; <code className="text-amber-400">Searching</code> &rarr; <code className="text-purple-400">Analysing</code> &rarr; <code className="text-emerald-400">Completed</code>, streaming markdown via Vercel Streamdown.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/5 space-y-2">
                <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <Code2 className="w-3.5 h-3.5 text-indigo-500" />
                  CopilotKit V2 Runtime Integration
                </div>
                <p>
                  Zero deprecated APIs: Utilizes <code className="text-indigo-400">@copilotkit/runtime/v2</code> with <code className="text-indigo-400">BuiltInAgent</code> and official fetch handlers at <code className="text-indigo-400">/api/copilotkit</code> and <code className="text-indigo-400">/api/copilotkit/info</code>.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/5 space-y-2">
                <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <Cpu className="w-3.5 h-3.5 text-emerald-500" />
                  Active Generative UI Component Registry
                </div>
                <ul className="list-disc list-inside space-y-1 text-slate-500 dark:text-[#9aa0a6]">
                  <li><b>WeatherCard</b>: Dynamic forecast & conditions with C/F toggles.</li>
                  <li><b>SalesDashboard</b>: Recharts revenue trends & interactive ledger.</li>
                  <li><b>PlanningBoard</b>: Miro-style Kanban with voting & confetti.</li>
                  <li><b>ProductCatalogCard</b>: Feature comparison matrix for tech hardware.</li>
                  <li><b>RouteDistanceCard</b>: Multi-modal driving, transit & walking calculator.</li>
                  <li><b>HITLApprovalCard</b>: Human-in-the-Loop safety gate with 60s countdown.</li>
                  <li><b>CodeStudioCard</b>: Multi-file Python/TS workspace with simulated execution.</li>
                  <li><b>JobBoardCard</b>: BDJobs & LinkedIn listings with salary analysis.</li>
                </ul>
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setShowArchModal(false)}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs transition-colors"
              >
                Close Architecture Guide
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
