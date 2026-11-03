"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, Sun, Moon } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { UserSession } from "@/lib/auth";

interface ChatHeaderProps {
  user: UserSession | null;
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  isChatDetails?: boolean;
}

export function ChatHeader({
  user,
  sidebarOpen,
  onToggleSidebar,
  isChatDetails = false,
}: ChatHeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <header className="h-14 px-3 sm:px-4 border-b border-slate-200/60 dark:border-white/5 bg-white/90 dark:bg-[#131314]/90 backdrop-blur-md flex items-center justify-between sticky top-0 z-20 transition-colors select-none font-sans">
      {/* Left: Burger Menu (for both collapse & expand) + Project Badge (Chat Details Only) */}
      <div className="flex items-center gap-2.5 min-w-0">
        {/* Burger Menu Button: 3 horizontal line icon for both collapse and expand with smooth click feel */}
        <button
          type="button"
          onClick={onToggleSidebar}
          className="p-2 rounded-xl text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 active:scale-95 transition-all duration-200 cursor-pointer flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30"
          title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
        >
          <Menu className="w-5 h-5 transition-transform duration-200 ease-out" />
        </button>

        {/* Project Branding: ONLY rendered when on chat details page, omitted on /chat or empty state */}
        <AnimatePresence>
          {isChatDetails && (
            <motion.div
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -6 }}
              transition={{ duration: 0.18 }}
              className="flex items-center gap-2 px-1 py-1 text-xs truncate"
            >
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shrink-0" />
              <span className="font-semibold text-slate-800 dark:text-white truncate">
                Gen UI Best Practice
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-sm bg-blue-50 text-blue-600 dark:bg-white/10 dark:text-blue-300 font-mono shrink-0">
                Copilot &amp; Antigravity
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Right: Theme Switcher with Smooth Rotation/Scale Transition */}
      <div className="flex items-center gap-2">
        <button
          onClick={toggleTheme}
          suppressHydrationWarning
          className="relative w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100 dark:hover:bg-white/10 text-slate-500 dark:text-zinc-400 transition-colors cursor-pointer overflow-hidden active:scale-95"
          title={isMounted && theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {!isMounted ? (
            <div className="w-4 h-4 rounded-full bg-slate-300 dark:bg-zinc-700" />
          ) : (
            <AnimatePresence mode="wait" initial={false}>
              {theme === "dark" ? (
                <motion.div
                  key="dark-sun"
                  initial={{ rotate: -90, scale: 0.5, opacity: 0 }}
                  animate={{ rotate: 0, scale: 1, opacity: 1 }}
                  exit={{ rotate: 90, scale: 0.5, opacity: 0 }}
                  transition={{ duration: 0.22, ease: "easeOut" }}
                  className="flex items-center justify-center"
                >
                  <Sun className="w-4 h-4 text-amber-400" />
                </motion.div>
              ) : (
                <motion.div
                  key="light-moon"
                  initial={{ rotate: 90, scale: 0.5, opacity: 0 }}
                  animate={{ rotate: 0, scale: 1, opacity: 1 }}
                  exit={{ rotate: -90, scale: 0.5, opacity: 0 }}
                  transition={{ duration: 0.22, ease: "easeOut" }}
                  className="flex items-center justify-center"
                >
                  <Moon className="w-4 h-4 text-indigo-500" />
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </button>
      </div>
    </header>
  );
}
