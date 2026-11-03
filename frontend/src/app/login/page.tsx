"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Sparkles,
  UserCheck,
  Bot,
  ArrowRight,
  Shield,
  Layers,
  Cpu,
  Globe,
  Sun,
  Moon
} from "lucide-react";
import { createGuestSession } from "@/lib/auth";
import { useTheme } from "@/components/theme-provider";

export default function LoginPage() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [isMounted, setIsMounted] = useState(false);
  const [guestName, setGuestName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleGuestLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    createGuestSession(guestName || "Guest Presenter");
    setTimeout(() => {
      router.push("/chat");
    }, 400);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#131314] flex flex-col justify-center items-center px-4 relative overflow-hidden text-slate-900 dark:text-slate-100 transition-colors">
      {/* Top right theme toggle */}
      <button
        onClick={toggleTheme}
        suppressHydrationWarning
        className="absolute top-4 right-4 p-2.5 rounded-full bg-white dark:bg-[#1e1f20] border border-slate-200 dark:border-white/10 text-slate-700 dark:text-[#c4c7c5] hover:shadow-md transition-all z-20"
        title="Toggle Light / Dark mode"
      >
        {!isMounted ? (
          <div className="w-4 h-4 rounded-full bg-slate-400/30" />
        ) : theme === "dark" ? (
          <Sun className="w-4 h-4 text-amber-400" />
        ) : (
          <Moon className="w-4 h-4 text-indigo-500" />
        )}
      </button>

      {/* Background ambient orbs */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="w-full max-w-md p-8 rounded-3xl bg-white dark:bg-[#1e1f20] border border-slate-200 dark:border-white/10 shadow-2xl relative z-10 text-center"
      >
        {/* App Logo / Icon */}
        <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-rose-400 p-0.5 flex items-center justify-center shadow-lg shadow-blue-500/20 mb-4">
          <div className="w-full h-full bg-white dark:bg-[#1e1f20] rounded-[14px] flex items-center justify-center">
            <Sparkles className="w-7 h-7 text-blue-500" />
          </div>
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mb-1">
          Gen UI Best Practice
        </h1>
        <p className="text-xs text-slate-500 dark:text-[#9aa0a6] mb-6">
          CopilotKit &amp; Google Antigravity SDK Interactive Studio
        </p>

        {/* Feature Badges */}
        <div className="grid grid-cols-3 gap-2 py-3 px-3 mb-6 bg-slate-50 dark:bg-black/30 rounded-xl border border-slate-200 dark:border-white/5 text-[11px] text-slate-600 dark:text-slate-300">
          <div className="flex flex-col items-center gap-1">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Generative UI</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Cpu className="w-4 h-4 text-blue-500" />
            <span>Antigravity Agent</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Globe className="w-4 h-4 text-emerald-500" />
            <span>Streamdown</span>
          </div>
        </div>

        {/* Guest Access Form */}
        <form onSubmit={handleGuestLogin} className="space-y-4 text-left">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Presenter Name (Guest Access)
            </label>
            <div className="relative">
              <input
                type="text"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="Enter your name or continue as Guest"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-black/30 border border-slate-300 dark:border-white/10 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-[#9aa0a6] focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all"
              />
              <UserCheck className="absolute right-3.5 top-3 w-4 h-4 text-slate-400" />
            </div>
            <p className="text-[11px] text-slate-500 dark:text-[#9aa0a6] mt-1">
              Guest access allows full exploration of all 8 Generative UI components.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-blue-500/25 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Entering Studio...
              </span>
            ) : (
              <>
                <span>Launch GenUI Studio</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-6 pt-5 border-t border-slate-200 dark:border-white/10 flex items-center justify-between text-[11px] text-slate-400 dark:text-[#9aa0a6]">
          <span className="flex items-center gap-1">
            <Shield className="w-3.5 h-3.5 text-emerald-500" /> NextAuth Session
          </span>
          <span>Google login enabled in next phase</span>
        </div>
      </motion.div>
    </div>
  );
}
