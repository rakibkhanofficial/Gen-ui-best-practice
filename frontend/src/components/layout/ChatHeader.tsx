"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bot,
  Sparkles,
  LogOut,
  Info,
  Server,
  Code2,
  X
} from "lucide-react";
import { UserSession, clearGuestSession } from "@/lib/auth";

interface ChatHeaderProps {
  user: UserSession | null;
}

export function ChatHeader({ user }: ChatHeaderProps) {
  const router = useRouter();
  const [showArchitectureModal, setShowArchitectureModal] = useState(false);

  const handleLogout = () => {
    clearGuestSession();
    router.push("/login");
  };

  return (
    <>
      <header className="h-16 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30">
        {/* App Title & Identity */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-400 p-0.5 flex items-center justify-center shadow-md shadow-blue-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Bot className="w-5 h-5 text-sky-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold text-white tracking-tight">
                Generative UI Studio
              </h1>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-950 text-blue-300 border border-blue-800 font-semibold flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" /> Next.js 16
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              <span>Google Antigravity SDK &bull; CopilotKit</span>
            </div>
          </div>
        </div>

        {/* Right actions: Backend status, Architecture Modal & User Session */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowArchitectureModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 hover:text-white transition-colors"
          >
            <Info className="w-3.5 h-3.5 text-sky-400" />
            <span>Architecture Guide</span>
          </button>

          <div className="hidden sm:flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-emerald-950/60 border border-emerald-800 text-emerald-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Agent Engine Online</span>
          </div>

          {/* User Profile Pill */}
          {user && (
            <div className="flex items-center gap-2 pl-3 border-l border-slate-800">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white shadow-sm">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="hidden md:block text-left">
                <span className="text-xs font-semibold text-slate-200 block leading-tight">
                  {user.name}
                </span>
                <span className="text-[10px] text-slate-400 block uppercase">
                  {user.role}
                </span>
              </div>
              <button
                onClick={handleLogout}
                title="End Guest Session"
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-900 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Architecture Modal */}
      {showArchitectureModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl relative text-slate-200">
            <button
              onClick={() => setShowArchitectureModal(false)}
              className="absolute top-4 right-4 p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-sky-400 font-bold text-base mb-2">
              <Code2 className="w-5 h-5" />
              How Generative UI Works Here
            </div>

            <div className="space-y-3 text-xs leading-relaxed text-slate-300 mt-4">
              <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800">
                <b className="text-white">1. Prompt to Tool Call:</b> The user asks for data (e.g. <i>&quot;Show sales analytics for Q3&quot;</i>). The LLM / Agent evaluates intent and issues a structured tool invocation with typed arguments.
              </div>
              <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800">
                <b className="text-white">2. Progressive Component Mount:</b> CopilotKit intercepts the action via <code>useCopilotAction</code>. While the backend tool executes, an <code>inProgress</code> skeleton hydrates inside the chat flow.
              </div>
              <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800">
                <b className="text-white">3. Rich Reactive React Component:</b> When the payload arrives, CopilotKit mounts the fully interactive component (Recharts graphs, Miro sticky notes, dynamic tables).
              </div>
              <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800">
                <b className="text-white">4. Human-in-the-Loop Interception:</b> For sensitive actions (e.g. <i>&quot;Refund $1,250 to customer&quot;</i>), the agent suspends execution and mounts the approval card with a 60s countdown timer and Approve/Reject buttons before proceeding!
              </div>
            </div>

            <div className="mt-5 text-right">
              <button
                onClick={() => setShowArchitectureModal(false)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

