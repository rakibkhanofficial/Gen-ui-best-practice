"use client";

import React, { useState, useEffect } from "react";
import { PanelLeft, Sun, Moon } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { UserSession } from "@/lib/auth";

interface ChatHeaderProps {
  user: UserSession | null;
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
}

export function ChatHeader({
  user,
  sidebarOpen,
  onToggleSidebar,
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
            Copilot & Antigravity
          </span>
        </div>
      </div>

      {/* Right: Theme Switcher Only */}
      <div className="flex items-center">
        <button
          onClick={toggleTheme}
          suppressHydrationWarning
          className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-slate-100 dark:hover:bg-white/10 text-slate-500 dark:text-zinc-400 transition-colors cursor-pointer"
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
      </div>
    </header>
  );
}
