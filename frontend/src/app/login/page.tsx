"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { motion } from "framer-motion";
import {
  Sparkles,
  UserCheck,
  ArrowRight,
  Shield,
  Cpu,
  Globe,
  Sun,
  Moon,
  LogIn,
  KeyRound,
  CheckCircle2
} from "lucide-react";
import { createGuestSession, getOrCreateGuestUser } from "@/lib/auth";
import { useTheme } from "@/components/theme-provider";

export default function LoginPage() {
  const router = useRouter();
  const { data: authSession, status } = useSession();
  const { theme, toggleTheme } = useTheme();
  const [isMounted, setIsMounted] = useState(false);
  const [guestName, setGuestName] = useState("");
  const [demoGoogleEmail, setDemoGoogleEmail] = useState("developer.google@example.com");
  const [showDemoGoogleInput, setShowDemoGoogleInput] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loginMethod, setLoginMethod] = useState<string | null>(null);

  useEffect(() => {
    setIsMounted(true);
    // If already logged in via NextAuth Google session, redirect to /chat
    if (status === "authenticated" && authSession?.user) {
      router.replace("/chat");
    }
  }, [status, authSession, router]);

  // 1. Google OAuth Sign-in Handler
  const handleGoogleSignIn = async () => {
    setLoading(true);
    setLoginMethod("google");
    try {
      // First attempt official Google provider
      const result = await signIn("google", { callbackUrl: "/chat", redirect: false });
      if (result?.error) {
        // If Google OAuth client credentials aren't set in .env, reveal one-click Google tester
        setShowDemoGoogleInput(true);
        setLoading(false);
        setLoginMethod(null);
      } else if (result?.url) {
        router.push(result.url);
      }
    } catch {
      setShowDemoGoogleInput(true);
      setLoading(false);
      setLoginMethod(null);
    }
  };

  // 2. Demo Google Provider Handler (Instant Verified Google Account with ID & Time)
  const handleDemoGoogleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setLoginMethod("google-demo");
    try {
      await signIn("google-demo", {
        email: demoGoogleEmail,
        name: demoGoogleEmail.split("@")[0].replace(".", " "),
        callbackUrl: "/chat",
        redirect: true,
      });
    } catch {
      setLoading(false);
    }
  };

  // 3. Guest User Login Handler (IP + Time based unique ID)
  const handleGuestLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setLoginMethod("guest");
    try {
      // Fetch server-detected client IP and timestamp
      const res = await fetch("/api/auth/guest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: guestName.trim() || "Guest Presenter" }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.user && typeof window !== "undefined") {
          localStorage.setItem("genui_guest_session", JSON.stringify(data.user));
        }
      } else {
        createGuestSession(guestName || "Guest Presenter");
      }
    } catch {
      createGuestSession(guestName || "Guest Presenter");
    }

    setTimeout(() => {
      router.push("/chat");
    }, 300);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#131314] flex flex-col justify-center items-center px-4 relative overflow-hidden text-slate-900 dark:text-slate-100 transition-colors">
      {/* Top right theme toggle */}
      <button
        onClick={toggleTheme}
        suppressHydrationWarning
        className="absolute top-4 right-4 p-2.5 rounded-full bg-white dark:bg-[#1e1f20] border border-slate-200 dark:border-white/10 text-slate-700 dark:text-[#c4c7c5] hover:shadow-md transition-all z-20 cursor-pointer"
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
            <span>User Isolated</span>
          </div>
        </div>

        {/* 1. Official NextAuth Google Login Button */}
        <div className="space-y-3 mb-5">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl bg-white hover:bg-slate-50 dark:bg-[#2a2b2d] dark:hover:bg-[#323437] text-slate-800 dark:text-white font-medium text-xs border border-slate-300 dark:border-white/10 shadow-xs transition-all cursor-pointer hover:border-slate-400 disabled:opacity-50"
          >
            {/* Google SVG Logo */}
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.04h3.88c2.27-2.09 3.665-5.17 3.665-9.14z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.04c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.13C3.26 21.36 7.33 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.28c-.24-.72-.38-1.49-.38-2.28s.14-1.56.38-2.28V6.59H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.41l4.03-3.13z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.59l4.03 3.13c.95-2.83 3.6-4.97 6.72-4.97z"
              />
            </svg>
            <span>
              {loading && loginMethod === "google"
                ? "Connecting to Google..."
                : "Sign in with Google"}
            </span>
          </button>

          {/* Quick Demo Google Account Option if OAuth credentials aren't deployed */}
          {showDemoGoogleInput && (
            <form onSubmit={handleDemoGoogleSignIn} className="p-3 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-900/50 text-left space-y-2">
              <div className="flex items-center gap-1.5 text-blue-700 dark:text-blue-300 text-xs font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>One-Click Google Provider Test</span>
              </div>
              <input
                type="email"
                value={demoGoogleEmail}
                onChange={(e) => setDemoGoogleEmail(e.target.value)}
                placeholder="Google Email"
                className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-black/40 border border-slate-300 dark:border-white/10 text-xs text-slate-800 dark:text-white outline-none focus:border-blue-500"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full py-1.5 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs cursor-pointer transition-colors"
              >
                Log In as {demoGoogleEmail.split("@")[0]}
              </button>
            </form>
          )}
        </div>

        {/* Divider */}
        <div className="relative flex items-center justify-center mb-5">
          <div className="border-t border-slate-200 dark:border-white/10 w-full" />
          <span className="bg-white dark:bg-[#1e1f20] px-2 text-[10px] uppercase font-bold text-slate-400 dark:text-zinc-500 shrink-0">
            Or Continue As Guest
          </span>
          <div className="border-t border-slate-200 dark:border-white/10 w-full" />
        </div>

        {/* Guest Access Form */}
        <form onSubmit={handleGuestLogin} className="space-y-4 text-left">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Presenter Name (IP &amp; Timestamp Bound)
            </label>
            <div className="relative">
              <input
                type="text"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="Guest Presenter"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-black/30 border border-slate-300 dark:border-white/10 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-[#9aa0a6] focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all"
              />
              <UserCheck className="absolute right-3.5 top-3 w-4 h-4 text-slate-400" />
            </div>
            <p className="text-[11px] text-slate-500 dark:text-[#9aa0a6] mt-1">
              Guest user receives a unique ID bound to IP + timestamp. Chat history remains isolated.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-slate-900 font-semibold text-sm shadow-md transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer disabled:opacity-50"
          >
            {loading && loginMethod === "guest" ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Initializing Guest Session...
              </span>
            ) : (
              <>
                <span>Enter as Guest</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-6 pt-5 border-t border-slate-200 dark:border-white/10 flex items-center justify-between text-[11px] text-slate-400 dark:text-[#9aa0a6]">
          <span className="flex items-center gap-1">
            <Shield className="w-3.5 h-3.5 text-emerald-500" /> NextAuth Provider
          </span>
          <span>User-Wise Isolated Sessions</span>
        </div>
      </motion.div>
    </div>
  );
}
