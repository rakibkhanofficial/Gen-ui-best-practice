"use client";

import React, { useState } from "react";
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
  Globe
} from "lucide-react";
import { createGuestSession } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [guestName, setGuestName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGuestLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    createGuestSession(guestName || "Guest Presenter");
    setTimeout(() => {
      router.push("/chat");
    }, 400);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 relative overflow-hidden text-slate-100">
      {/* Background ambient orbs */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-sky-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Main Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="w-full max-w-md p-8 rounded-3xl glass-panel-elevated border border-slate-800 shadow-2xl relative z-10 text-center"
      >
        {/* App Logo / Icon */}
        <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-400 p-0.5 flex items-center justify-center shadow-lg shadow-blue-500/25 mb-4">
          <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
            <Bot className="w-7 h-7 text-sky-400" />
          </div>
        </div>

        <h1 className="text-2xl font-black tracking-tight text-white mb-1">
          Generative UI Studio
        </h1>
        <p className="text-xs text-slate-400 mb-6">
          Google Antigravity SDK & CopilotKit Showcase Platform
        </p>

        {/* Feature Badges */}
        <div className="grid grid-cols-3 gap-2 py-3 px-3 mb-6 bg-slate-900/60 rounded-xl border border-slate-800 text-[11px] text-slate-300">
          <div className="flex flex-col items-center gap-1">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Generative UI</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Cpu className="w-4 h-4 text-sky-400" />
            <span>Agent Engine</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span>HITL Safety</span>
          </div>
        </div>

        {/* Guest Login Form */}
        <form onSubmit={handleGuestLogin} className="space-y-4 text-left">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Presenter or Guest Name
            </label>
            <input
              type="text"
              placeholder="e.g. Rakib Khan (Leave empty for Guest)"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 transition-all transform active:scale-[0.99] disabled:opacity-50"
          >
            <UserCheck className="w-4 h-4" />
            {loading ? "Initializing Workspace..." : "Continue as Guest"}
            <ArrowRight className="w-3.5 h-3.5 ml-auto" />
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-800" />
          </div>
          <span className="relative px-3 bg-slate-900/90 text-[10px] uppercase tracking-wider text-slate-500 rounded-full font-medium">
            Future Auth Integration
          </span>
        </div>

        {/* Google OAuth (Disabled for now as requested) */}
        <button
          disabled
          className="w-full py-2.5 px-4 rounded-xl bg-slate-900/40 border border-slate-800/80 text-slate-500 text-xs font-medium flex items-center justify-center gap-2 cursor-not-allowed opacity-60"
        >
          <Globe className="w-4 h-4 text-slate-500" />
          Sign in with Google
          <span className="text-[9px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded ml-auto">
            NextAuth (Phase 2)
          </span>
        </button>

        <p className="text-[11px] text-slate-500 mt-6">
          Ready for department presentation &amp; live architectural walkthrough.
        </p>
      </motion.div>
    </div>
  );
}
