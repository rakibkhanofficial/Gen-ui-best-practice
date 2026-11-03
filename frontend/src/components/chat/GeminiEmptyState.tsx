"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Sparkles,
  BarChart3,
  Kanban,
  Sun,
  Code2,
  Briefcase,
  ShieldAlert,
  ArrowUpRight,
  Plane,
  Coins,
  Tv,
  Globe
} from "lucide-react";

interface GeminiEmptyStateProps {
  userName?: string;
  onSelectPrompt: (prompt: string) => void;
}

export function GeminiEmptyState({
  userName = "Presenter",
  onSelectPrompt,
}: GeminiEmptyStateProps) {
  const suggestions = [
    {
      title: "Analyze Q3 Sales Spreadsheet",
      desc: "Interactive revenue breakdown with charts & transaction ledger",
      icon: BarChart3,
      iconColor: "text-blue-500",
      prompt: "Show me the Q3 sales performance and revenue breakdown",
    },
    {
      title: "Miro-Style Sprint Planning",
      desc: "Collaborative sticky notes with voting & release confetti",
      icon: Kanban,
      iconColor: "text-amber-500",
      prompt: "Generate a Miro-style sprint planning board for our GenUI release",
    },
    {
      title: "Tokyo Weather & Gear Guide",
      desc: "Real-time conditions, humidity, and packing recommendations",
      icon: Sun,
      iconColor: "text-orange-500",
      prompt: "What is the weather in Tokyo today?",
    },
    {
      title: "BDJobs & LinkedIn Career Hub",
      desc: "Search live tech positions with salary range & interview tips",
      icon: Briefcase,
      iconColor: "text-emerald-500",
      prompt: "Find Senior Full Stack Engineer jobs on BDJobs and LinkedIn",
    },
    {
      title: "Developer Code Studio",
      desc: "Multi-file Python & TypeScript runner with console execution",
      icon: Code2,
      iconColor: "text-indigo-500",
      prompt: "Write a high-performance Python script for async SSE streaming with FastAPI",
    },
    {
      title: "Human-in-the-Loop Refund Gate",
      desc: "Test sensitive action approval with 60-second safety countdown",
      icon: ShieldAlert,
      iconColor: "text-rose-500",
      prompt: "Request a refund authorization for customer order #99281",
    },
    {
      title: "Flight Search & Schedules",
      desc: "Compare airline prices, layovers, and booking details",
      icon: Plane,
      iconColor: "text-sky-500",
      prompt: "Find flights from Dhaka to Tokyo with airlines and pricing",
    },
    {
      title: "Live Currency Converter",
      desc: "Real-time forex exchange rates with interactive swap",
      icon: Coins,
      iconColor: "text-teal-500",
      prompt: "Convert 500 USD to BDT with exchange rate breakdown",
    },
    {
      title: "YouTube Video Suggestion & Player",
      desc: "Watch and preview streaming tutorials inline in chat",
      icon: Tv,
      iconColor: "text-red-500",
      prompt: "Suggest YouTube tutorials for building with Next.js 16 and Gemini",
    },
    {
      title: "Verified Web Resource Cards",
      desc: "Curated websites with favicon metadata and preview cards",
      icon: Globe,
      iconColor: "text-purple-500",
      prompt: "Suggest authoritative websites and documentation for modern AI development",
    },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 sm:py-12 flex flex-col items-center justify-center min-h-[60vh]">
      {/* Gemini Headline */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full text-left mb-8 sm:mb-12"
      >
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-blue-500 via-indigo-500 to-rose-400 p-0.5 flex items-center justify-center">
            <div className="w-full h-full bg-white dark:bg-[#131314] rounded-full flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-blue-500" />
            </div>
          </div>
          <span className="text-xs font-semibold tracking-wider uppercase text-blue-600 dark:text-blue-400">
            Gemini 3.8 Flash &bull; Google Antigravity
          </span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-medium tracking-tight bg-gradient-to-r from-blue-600 via-indigo-600 to-rose-500 dark:from-blue-400 dark:via-indigo-300 dark:to-rose-300 bg-clip-text text-transparent pb-1">
          Hello, {userName}
        </h1>
        <p className="text-2xl sm:text-3xl font-light text-slate-500 dark:text-[#9aa0a6] mt-1">
          What can I help you design or analyze today?
        </p>
      </motion.div>

      {/* Suggestion Cards Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 w-full"
      >
        {suggestions.map((item, idx) => {
          const Icon = item.icon;
          return (
            <button
              key={idx}
              onClick={() => onSelectPrompt(item.prompt)}
              className="group text-left p-4 rounded-2xl bg-[#f0f4f9] hover:bg-[#e9eef6] dark:bg-[#1e1f20] dark:hover:bg-[#282a2c] border border-slate-200/80 dark:border-white/5 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 flex flex-col justify-between min-h-[120px] cursor-pointer"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className={`p-2 rounded-xl bg-white dark:bg-black/30 shadow-xs ${item.iconColor}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                </div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white leading-snug">
                  {item.title}
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-[#9aa0a6] mt-2 line-clamp-2 leading-relaxed">
                {item.desc}
              </p>
            </button>
          );
        })}
      </motion.div>
    </div>
  );
}

