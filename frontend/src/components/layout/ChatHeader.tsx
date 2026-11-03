"use client";

import React, { useState, useEffect } from "react";
import { PanelLeft, Sun, Moon, Zap, Brain, Settings } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { UserSession } from "@/lib/auth";

interface ChatHeaderProps {
  user: UserSession | null;
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  syncStatus?: string | null;
  learnedCount?: number;
  onOpenSettings?: () => void;
}

export function ChatHeader({
  user,
  sidebarOpen,
  onToggleSidebar,
  syncStatus,
  learnedCount = 3,
  onOpenSettings,
}: ChatHeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <header className="h-14 px-4 border-b border-slate-200/60 dark:border-white/5 bg-white/90 dark:bg-[#131314]/90 backdrop-blur-md flex items-center justify-between sticky top-0 z-20 transition-colors select-none font-sans">
      {/* Left: Sidebar Toggle + Clean Model Status Badge */}
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

        <div className="flex items-center gap-2 px-1 py-1 text-xs">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          <span className="font-semibold text-slate-800 dark:text-white">
            Gen UI Best Practice
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-sm bg-blue-50 text-blue-600 dark:bg-white/10 dark:text-blue-300 font-mono">
            Copilot &amp; Antigravity
          </span>
        </div>
      </div>

      {/* Center: CopilotKit Capabilities Badges (Realtime Sync & Continual Learning) */}
      <div className="hidden md:flex items-center gap-2 text-[11px]">
        {/* Realtime Sync Badge */}
        <div
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-300 font-medium"
          title={syncStatus || "Real-time bidirectional state sync with CopilotKit Runtime"}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
          <Zap className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
          <span>Realtime Sync</span>
        </div>

        {/* Learning Memory Badge */}
        <div
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-900/50 text-indigo-700 dark:text-indigo-300 font-medium"
          title={`CopilotKit Learning Container active with ${learnedCount} learned behavioral skills`}
        >
          <Brain className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
          <span>Learning ({learnedCount} skills)</span>
        </div>
      </div>

      {/* Right: Theme Switcher & Settings matching Google AI Studio */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={toggleTheme}
          suppressHydrationWarning
          className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100 dark:hover:bg-white/10 text-slate-500 dark:text-zinc-400 transition-colors cursor-pointer"
          title={isMounted && theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {!isMounted ? (
            <div className="w-4 h-4 rounded-full bg-slate-300 dark:bg-zinc-700" />
          ) : theme === "dark" ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-indigo-500" />
          )}
        </button>

        {onOpenSettings && (
          <button
            onClick={onOpenSettings}
            className="w-8 h-8 rounded-full flex items-center justify-center border border-slate-200 dark:border-white/10 text-slate-500 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        )}
      </div>
    </header>
  );
}
