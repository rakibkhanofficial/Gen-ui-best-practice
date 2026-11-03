"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Layers,
  Sparkles,
  ArrowRight,
  Code2,
  Cpu,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Zap,
  Plane,
  BarChart3,
  Kanban,
  Briefcase,
  Terminal,
  Sun,
  Moon,
  ExternalLink,
  ChevronRight,
  Workflow,
  MousePointerClick,
  RefreshCw,
  Lock
} from "lucide-react";
import { useTheme } from "@/components/theme-provider";

// GenUI Showcase Components for Interactive Landing Preview
import { FlightDetailsCard } from "@/components/gen-ui/FlightDetailsCard";
import { SalesDashboard } from "@/components/gen-ui/SalesDashboard";
import { PlanningBoard } from "@/components/gen-ui/PlanningBoard";
import { JobBoardCard } from "@/components/gen-ui/JobBoardCard";
import { CodeStudioCard } from "@/components/gen-ui/CodeStudioCard";
import { WeatherCard } from "@/components/gen-ui/WeatherCard";

export default function LandingPage() {
  const { theme, toggleTheme } = useTheme();
  const [isMounted, setIsMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<"flight" | "sales" | "planning" | "job" | "code">("flight");

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Demo sample data for live interactive preview on landing page
  const sampleFlight = {
    origin: "Dhaka",
    origin_code: "DAC",
    destination: "Tokyo",
    destination_code: "NRT",
    departure_date: "Nov 15, 2026",
    passengers: 1,
    cabin_class: "Economy",
    flights: [
      {
        id: "fl-01",
        price: 495,
        currency: "USD",
        trip_type: "One Way",
        outbound: {
          airline: "Biman Bangladesh Airlines",
          airline_logo: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=120&q=80",
          flight_number: "BG-376",
          departure_airport: "Hazrat Shahjalal Int'l (DAC)",
          departure_code: "DAC",
          departure_time: "23:45",
          arrival_airport: "Narita International (NRT)",
          arrival_code: "NRT",
          arrival_time: "08:50 +1",
          duration: "6h 05m",
          aircraft: "Boeing 787-9 Dreamliner",
          cabin_class: "Economy",
          stops: 0,
        },
        baggage: "2 × 23kg checked bags included",
        refundable: true,
        score: 96,
        badge: "Direct Flight",
      },
      {
        id: "fl-02",
        price: 420,
        currency: "USD",
        trip_type: "One Way",
        outbound: {
          airline: "Singapore Airlines",
          airline_logo: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=120&q=80",
          flight_number: "SQ-449",
          departure_airport: "Hazrat Shahjalal Int'l (DAC)",
          departure_code: "DAC",
          departure_time: "23:55",
          arrival_airport: "Narita International (NRT)",
          arrival_code: "NRT",
          arrival_time: "14:20 +1",
          duration: "11h 25m",
          aircraft: "Airbus A350-900",
          cabin_class: "Economy",
          stops: 1,
          stop_cities: ["Singapore Changi (SIN) - 1h 40m layover"],
        },
        baggage: "30kg checked baggage included",
        refundable: true,
        score: 92,
        badge: "Best Value",
      },
    ],
  };

  const sampleSales = {
    title: "Q3 Global Enterprise Revenue Analytics",
    quarter: "Q3 2026",
    year: 2026,
    currency: "USD",
    kpis: [
      { label: "Total Revenue", value: "$1,245,000", change_pct: 18.5, trend: "up" as const, period: "vs Q2" },
      { label: "Active Deals", value: "142", change_pct: 12.0, trend: "up" as const, period: "Quarterly" },
      { label: "Avg Deal Size", value: "$8,767", change_pct: 5.4, trend: "up" as const, period: "Per Client" },
      { label: "Retention Rate", value: "98.2%", change_pct: 1.1, trend: "up" as const, period: "Net ARR" }
    ],
    monthly_trend: [
      { month: "Jul", revenue: 380000, target: 350000, orders: 42, expenses: 140000 },
      { month: "Aug", revenue: 415000, target: 390000, orders: 48, expenses: 155000 },
      { month: "Sep", revenue: 450000, target: 420000, orders: 52, expenses: 168000 }
    ],
    category_breakdown: [
      { category: "Enterprise Cloud", revenue: 580000, share_pct: 46.6 },
      { category: "Generative UI Engine", revenue: 395000, share_pct: 31.7 },
      { category: "Support & SLA", revenue: 270000, share_pct: 21.7 }
    ],
    recent_transactions: [
      { id: "TX-901", customer: "Google DeepMind", tier: "Enterprise" as const, plan: "Custom Platform SLA", amount: 185000, status: "Paid" as const, date: "2026-09-28" },
      { id: "TX-902", customer: "Vercel Enterprise", tier: "Growth" as const, plan: "Next.js Edge Fleet", amount: 120000, status: "Paid" as const, date: "2026-09-25" },
      { id: "TX-903", customer: "Brain Station 23", tier: "Growth" as const, plan: "AI Agent Cluster", amount: 95000, status: "Pending" as const, date: "2026-09-22" }
    ],
    summary_insight: "Q3 revenue surpassed targets by 18.5%, driven by demand for interactive Generative UI engines."
  };

  const samplePlanning = {
    board_id: "plan-roadmap-2026",
    title: "Generative UI Release Roadmap (CopilotKit & Antigravity)",
    description: "Interactive planning board with drag-drop cards and voting system.",
    last_updated: "Today at 12:45 PM",
    columns: [
      {
        id: "col-todo",
        title: "Sprint Backlog",
        color_accent: "bg-amber-500",
        notes: [
          { id: "note-1", title: "HITL Biometrics", content: "Implement biometric Human-in-the-Loop hardware token approval gate", color: "orange" as const, tags: ["Security", "HITL"], votes: 4, column_id: "col-todo", assignee: "Security" },
          { id: "note-2", title: "PPR Buffer Tune", content: "Optimize SSE buffer threshold for Next.js 16 Partial Prerendering (PPR)", color: "pink" as const, tags: ["Performance"], votes: 6, column_id: "col-todo", assignee: "Frontend" },
        ],
      },
      {
        id: "col-progress",
        title: "In Progress",
        color_accent: "bg-blue-500",
        notes: [
          { id: "note-3", title: "Runtime Dispatch", content: "Integrate CopilotKit V2 Runtime with FastAPI agentic dispatch pipeline", color: "yellow" as const, tags: ["Backend", "CopilotKit"], votes: 9, column_id: "col-progress", assignee: "Backend" },
          { id: "note-4", title: "IDE Syntax Coloring", content: "Add multi-language colorful token highlighter to CodeStudioCard", color: "blue" as const, tags: ["UI/UX"], votes: 5, column_id: "col-progress", assignee: "UX Team" },
        ],
      },
      {
        id: "col-done",
        title: "Shipped & Verified",
        color_accent: "bg-emerald-500",
        notes: [
          { id: "note-5", title: "Multi-turn Sessions", content: "Multi-turn session architecture with session_id & conversation_id tracking", color: "green" as const, tags: ["Architecture"], votes: 12, column_id: "col-done", assignee: "Core Team" },
          { id: "note-6", title: "Dual Theme Polish", content: "Google Flights, Weather, and Sales Dashboard GenUI dual-theme styling", color: "purple" as const, tags: ["Design"], votes: 8, column_id: "col-done", assignee: "Design" },
        ],
      },
    ],
  };

  const sampleJobs = {
    query: "Senior Full Stack Engineer",
    location: "Dhaka, Bangladesh",
    total_jobs: 2,
    featured_platform: "BDJobs & LinkedIn",
    jobs: [
      {
        id: "job-01",
        title: "Senior Full-Stack AI Engineer (Next.js & Python)",
        company: "Brain Station 23",
        company_logo: "https://images.unsplash.com/photo-1549923746-c502d488b3ea?auto=format&fit=crop&w=120&q=80",
        location: "Gulshan-1, Dhaka (Hybrid)",
        platform: "BDJobs" as const,
        salary_range: "৳160,000 - ৳240,000 / month",
        work_type: "Hybrid" as const,
        experience_level: "Senior" as const,
        tags: ["Next.js 16", "Python", "FastAPI", "Generative UI"],
        posted_time: "2 days ago",
        description: "Leading development of enterprise Generative UI and Copilot agent workflows for global clients.",
        apply_url: "https://jobs.bdjobs.com",
        match_score: 98,
        interview_tips: [
          "Expect practical questions on Next.js 16 Server Components.",
          "Review Server-Sent Events (SSE) state synchronization."
        ]
      },
      {
        id: "job-02",
        title: "Lead Frontend Architect (React, TypeScript & Tailwind)",
        company: "Therap (BD) Ltd.",
        company_logo: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=120&q=80",
        location: "Banasree, Dhaka (On-site)",
        platform: "LinkedIn" as const,
        salary_range: "৳200,000 - ৳280,000 / month",
        work_type: "On-site" as const,
        experience_level: "Lead" as const,
        tags: ["TypeScript", "React 19", "Design Systems"],
        posted_time: "Just now",
        description: "Architect scalable health record interfaces used by thousands of US state healthcare agencies.",
        apply_url: "https://www.linkedin.com/jobs",
        match_score: 94,
        interview_tips: [
          "Demonstrate experience with accessible enterprise design systems."
        ]
      }
    ]
  };

  const sampleCode = {
    title: "Async SSE Streaming & Generative UI Tool Execution",
    description: "Async generator implementation for streaming honest reasoning stages and typed GenUI JSON payloads.",
    active_language: "Python",
    execution_command: "python agent_streamer.py --mode production",
    files: [
      {
        filename: "agent_streamer.py",
        language: "python",
        code: `import asyncio
import json
from typing import AsyncGenerator

async def stream_genui_events(prompt: str) -> AsyncGenerator[str, None]:
    # 1. Deliberation stage
    yield f"event: status\\ndata: {json.dumps({'stage': 'Thinking'})}\\n\\n"
    await asyncio.sleep(1.2)
    
    # 2. Tool execution payload
    tool_data = {"city": "Tokyo", "temp_c": 17.5, "condition": "Partly Cloudy"}
    yield f"event: genui\\ndata: {json.dumps({'tool': 'get_weather_data', 'data': tool_data})}\\n\\n"
    
    # 3. Streamdown text tokens
    yield f"event: delta\\ndata: {json.dumps({'text': 'Weather mounted successfully.'})}\\n\\n"`,
        explanation: "Async generator implementation for streaming honest reasoning stages and typed GenUI JSON payloads.",
        output_simulation: "✓ Connected to SSE Stream. Status: 200 OK. GenUI component hydrated.",
        complexity: "O(1) Memory Streaming"
      }
    ]
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#131314] text-slate-900 dark:text-zinc-100 font-sans selection:bg-blue-500/20 antialiased">
      {/* 1. Header Navigation */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 dark:bg-[#131314]/80 border-b border-slate-200/80 dark:border-white/10 select-none">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Brand */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-base tracking-tight text-slate-900 dark:text-white">
                Gen UI Best Practice
              </span>
              <span className="ml-2 text-[10px] font-mono px-1.5 py-0.5 rounded-sm bg-blue-50 dark:bg-white/10 text-blue-600 dark:text-blue-300 font-semibold">
                v2.0
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-600 dark:text-zinc-400">
            <a href="#why-genui" className="hover:text-blue-600 dark:hover:text-white transition-colors">
              Why Gen UI?
            </a>
            <a href="#architecture" className="hover:text-blue-600 dark:hover:text-white transition-colors">
              Architecture &amp; Steps
            </a>
            <a href="#showcase" className="hover:text-blue-600 dark:hover:text-white transition-colors">
              Interactive Showcase
            </a>
            <a href="#stack" className="hover:text-blue-600 dark:hover:text-white transition-colors">
              Tech Stack
            </a>
          </nav>

          {/* Actions: Theme Switcher + Launch Studio */}
          <div className="flex items-center gap-2.5">
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

            <Link
              href="/chat"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-slate-900 text-xs font-semibold shadow-xs transition-all cursor-pointer"
            >
              <span>Launch Studio</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="pt-16 pb-12 sm:pt-24 sm:pb-16 px-4 sm:px-6 max-w-5xl mx-auto text-center select-none">
        {/* Eyebrow Pill */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900/50 text-xs text-blue-700 dark:text-blue-300 font-medium mb-6 shadow-2xs"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Production Generative UI Architecture with CopilotKit &amp; Google Antigravity SDK</span>
        </motion.div>

        {/* Hero Title */}
        <motion.h1
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight max-w-4xl mx-auto"
        >
          The Modern Standard for Generative UI
        </motion.h1>

        {/* Hero Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="text-base sm:text-lg text-slate-600 dark:text-zinc-400 mt-5 max-w-2xl mx-auto leading-relaxed"
        >
          Move beyond passive markdown text walls. Enable AI agents to stream, orchestrate, and mount interactive, stateful React components with bidirectional state loops in real time.
        </motion.p>

        {/* Primary CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="flex flex-wrap items-center justify-center gap-3 mt-8"
        >
          <Link
            href="/chat"
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm shadow-md shadow-blue-500/20 transition-all cursor-pointer group"
          >
            <span>Open Gen UI Studio</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>

          <a
            href="#architecture"
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/15 text-slate-800 dark:text-zinc-200 font-medium text-sm transition-all cursor-pointer"
          >
            <span>Implementation Guide</span>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </a>
        </motion.div>

        {/* Key Metrics / Highlights */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-12 pt-8 border-t border-slate-200/70 dark:border-white/5 text-left"
        >
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/5">
            <div className="text-xl font-bold text-slate-900 dark:text-white">10+</div>
            <div className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">Custom GenUI Tools</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/5">
            <div className="text-xl font-bold text-slate-900 dark:text-white">100%</div>
            <div className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">Type-Safe JSON Schemas</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/5">
            <div className="text-xl font-bold text-slate-900 dark:text-white">HITL</div>
            <div className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">Human-in-the-Loop Safe</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/5">
            <div className="text-xl font-bold text-slate-900 dark:text-white">0ms</div>
            <div className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">Layout Shift Transitions</div>
          </div>
        </motion.div>
      </section>

      {/* 3. Interactive Component Showcase (Tabbed Live Sandbox) */}
      <section id="showcase" className="py-12 px-4 sm:px-6 max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400 font-mono">
            Live Component Sandbox
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-1">
            Experience Generative UI in Action
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-1.5 max-w-xl mx-auto">
            Interact with live production components directly. Switch tabs to see how our agent orchestrates different domains.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 max-w-fit mx-auto mb-6">
          <button
            onClick={() => setActiveTab("flight")}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "flight"
                ? "bg-white dark:bg-[#1e1f20] text-blue-600 dark:text-white shadow-xs"
                : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Plane className="w-3.5 h-3.5" />
            <span>Flight Booking</span>
          </button>

          <button
            onClick={() => setActiveTab("sales")}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "sales"
                ? "bg-white dark:bg-[#1e1f20] text-blue-600 dark:text-white shadow-xs"
                : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Sales Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab("planning")}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "planning"
                ? "bg-white dark:bg-[#1e1f20] text-blue-600 dark:text-white shadow-xs"
                : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Kanban className="w-3.5 h-3.5" />
            <span>Excalidraw Plan</span>
          </button>

          <button
            onClick={() => setActiveTab("job")}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "job"
                ? "bg-white dark:bg-[#1e1f20] text-blue-600 dark:text-white shadow-xs"
                : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Job Career Hub</span>
          </button>

          <button
            onClick={() => setActiveTab("code")}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "code"
                ? "bg-white dark:bg-[#1e1f20] text-blue-600 dark:text-white shadow-xs"
                : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Code Studio</span>
          </button>
        </div>

        {/* Live Mounted Component Container */}
        <div className="flex justify-center">
          <AnimatePresence mode="wait">
            {activeTab === "flight" && (
              <motion.div
                key="flight"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="w-full max-w-3xl"
              >
                <FlightDetailsCard data={sampleFlight} />
              </motion.div>
            )}

            {activeTab === "sales" && (
              <motion.div
                key="sales"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="w-full max-w-3xl"
              >
                <SalesDashboard data={sampleSales} />
              </motion.div>
            )}

            {activeTab === "planning" && (
              <motion.div
                key="planning"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="w-full max-w-4xl"
              >
                <PlanningBoard data={samplePlanning} />
              </motion.div>
            )}

            {activeTab === "job" && (
              <motion.div
                key="job"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="w-full max-w-3xl"
              >
                <JobBoardCard data={sampleJobs} />
              </motion.div>
            )}

            {activeTab === "code" && (
              <motion.div
                key="code"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="w-full max-w-3xl"
              >
                <CodeStudioCard data={sampleCode} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* 4. Section: Why Generative UI Works (The Core Problem & Solution) */}
      <section id="why-genui" className="py-16 px-4 sm:px-6 max-w-5xl mx-auto border-t border-slate-200/70 dark:border-white/5">
        <div className="text-center mb-12">
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400 font-mono">
            The Fundamental Paradigm Shift
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
            Why Traditional Chatbots Fail &amp; Why Gen UI Works
          </h2>
          <p className="text-sm text-slate-500 dark:text-zinc-400 mt-2 max-w-2xl mx-auto">
            LLMs are extraordinary at reasoning, but plain text output is fundamentally ill-suited for structured workflows, bookings, transactions, and state management.
          </p>
        </div>

        {/* Side-by-Side Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Traditional Chatbots */}
          <div className="p-6 rounded-3xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/70 dark:border-rose-900/40">
            <div className="flex items-center gap-2 mb-4 text-rose-600 dark:text-rose-400 font-semibold text-sm">
              <XCircle className="w-5 h-5" />
              <span>Traditional Chatbots (The Text Wall Problem)</span>
            </div>
            <ul className="space-y-3.5 text-xs text-slate-700 dark:text-zinc-300">
              <li className="flex items-start gap-2">
                <span className="text-rose-500 font-bold">•</span>
                <span><strong>Passive Markdown:</strong> Long unformatted bullet lists that force the user to read 500 words just to check flight times or compare products.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-500 font-bold">•</span>
                <span><strong>Zero Interactivity:</strong> Users cannot filter by platform, toggle units (°C/°F), zoom into diagrams, or drag tasks between sprint swimlanes.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-500 font-bold">•</span>
                <span><strong>Dangerous Blind Execution:</strong> High-risk mutations (refunds, database migrations) happen without visual preview or explicit human approval.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-500 font-bold">•</span>
                <span><strong>No Two-Way State Loop:</strong> When a user makes a selection in the response, the agent cannot receive that state update cleanly.</span>
              </li>
            </ul>
          </div>

          {/* Generative UI Standard */}
          <div className="p-6 rounded-3xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/70 dark:border-blue-900/40">
            <div className="flex items-center gap-2 mb-4 text-blue-600 dark:text-blue-400 font-semibold text-sm">
              <CheckCircle2 className="w-5 h-5" />
              <span>Gen UI Best Practice (Copilot &amp; Antigravity)</span>
            </div>
            <ul className="space-y-3.5 text-xs text-slate-700 dark:text-zinc-300">
              <li className="flex items-start gap-2">
                <span className="text-blue-500 font-bold">•</span>
                <span><strong>Dynamic React Mounts:</strong> Structured JSON tool outputs automatically mount rich, responsive, accessible Client Components.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 font-bold">•</span>
                <span><strong>Full User Interactivity:</strong> Interactive sliders, date pickers, ticket selectors, and Recharts analytics dashboards right in the conversation.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 font-bold">•</span>
                <span><strong>Human-in-the-Loop Safeguards:</strong> High-risk operations present an interactive authorization card with diffs and timeout countdowns.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 font-bold">•</span>
                <span><strong>Bidirectional State Loop:</strong> Client interactions trigger actions back to the agent backend to maintain synchronized context.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* 5. Section: Step-by-Step Architecture Guide */}
      <section id="architecture" className="py-16 px-4 sm:px-6 max-w-5xl mx-auto border-t border-slate-200/70 dark:border-white/5">
        <div className="text-center mb-12">
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400 font-mono">
            How It Works Under the Hood
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
            Step-by-Step Implementation Architecture
          </h2>
          <p className="text-sm text-slate-500 dark:text-zinc-400 mt-2 max-w-2xl mx-auto">
            From the initial user prompt to the hydrated interactive React component — a robust, type-safe pipeline.
          </p>
        </div>

        {/* 4 Steps Journey */}
        <div className="space-y-6">
          {/* Step 1 */}
          <div className="p-6 rounded-3xl bg-slate-50 dark:bg-white/5 border border-slate-200/70 dark:border-white/5 flex flex-col md:flex-row gap-5 items-start">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white font-extrabold flex items-center justify-center shrink-0 text-sm shadow-xs">
              01
            </div>
            <div className="flex-1">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Prompt Ingestion &amp; Intent Recognition</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
                  Antigravity Orchestrator
                </span>
              </h3>
              <p className="text-xs text-slate-600 dark:text-zinc-400 mt-1.5 leading-relaxed">
                When the user enters a prompt (e.g. <em>&quot;Find flights from Dhaka to Tokyo&quot;</em>), the Google Antigravity Agent extracts parameters using strict Pydantic schemas. It matches tools from the <code className="text-blue-500 font-mono">TOOL_REGISTRY</code> without relying on fragile string matching.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="p-6 rounded-3xl bg-slate-50 dark:bg-white/5 border border-slate-200/70 dark:border-white/5 flex flex-col md:flex-row gap-5 items-start">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white font-extrabold flex items-center justify-center shrink-0 text-sm shadow-xs">
              02
            </div>
            <div className="flex-1">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Honest Agent Deliberation &amp; SSE Stream</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300">
                  FastAPI Async SSE
                </span>
              </h3>
              <p className="text-xs text-slate-600 dark:text-zinc-400 mt-1.5 leading-relaxed">
                The backend initiates a Server-Sent Events (SSE) stream over <code className="text-indigo-500 font-mono">/api/chat/stream</code>. It streams realistic reasoning stages: <strong>Thinking</strong> &rarr; <strong>Searching (with real logos)</strong> &rarr; <strong>Analysing</strong> with smooth human-perceptible pacing before emitting the final data payload.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="p-6 rounded-3xl bg-slate-50 dark:bg-white/5 border border-slate-200/70 dark:border-white/5 flex flex-col md:flex-row gap-5 items-start">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white font-extrabold flex items-center justify-center shrink-0 text-sm shadow-xs">
              03
            </div>
            <div className="flex-1">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Dynamic Client Component Hydration</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300">
                  Next.js 16 + React 19
                </span>
              </h3>
              <p className="text-xs text-slate-600 dark:text-zinc-400 mt-1.5 leading-relaxed">
                The frontend receives the <code className="text-emerald-500 font-mono">event: genui</code> block and dispatches to the component registry. The component is instantiated with complete type safety, dual-theme dark/light contrast, and Framer Motion micro-animations with zero layout shifts.
              </p>
            </div>
          </div>

          {/* Step 4 */}
          <div className="p-6 rounded-3xl bg-slate-50 dark:bg-white/5 border border-slate-200/70 dark:border-white/5 flex flex-col md:flex-row gap-5 items-start">
            <div className="w-10 h-10 rounded-2xl bg-amber-600 text-white font-extrabold flex items-center justify-center shrink-0 text-sm shadow-xs">
              04
            </div>
            <div className="flex-1">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Bidirectional State &amp; Human-in-the-Loop</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300">
                  CopilotKit V2 Runtime
                </span>
              </h3>
              <p className="text-xs text-slate-600 dark:text-zinc-400 mt-1.5 leading-relaxed">
                When the user acts (e.g. books a flight, approves a refund, or votes on a sprint sticky note), the component dispatches back to <code className="text-amber-500 font-mono">/api/actions/approve</code>. The agent updates its session memory and can continue the multi-turn workflow seamlessly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Section: Tech Stack */}
      <section id="stack" className="py-16 px-4 sm:px-6 max-w-5xl mx-auto border-t border-slate-200/70 dark:border-white/5">
        <div className="text-center mb-10">
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400 font-mono">
            Modern Developer Stack
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-1">
            Built on Industry-Leading Standards
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-center">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/70 dark:border-white/5">
            <div className="text-sm font-bold text-slate-900 dark:text-white">Next.js 16</div>
            <div className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">App Router &amp; PPR</div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/70 dark:border-white/5">
            <div className="text-sm font-bold text-slate-900 dark:text-white">React 19</div>
            <div className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">Compiler &amp; Actions</div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/70 dark:border-white/5">
            <div className="text-sm font-bold text-slate-900 dark:text-white">CopilotKit V2</div>
            <div className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">Generative UI Engine</div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/70 dark:border-white/5">
            <div className="text-sm font-bold text-slate-900 dark:text-white">Antigravity SDK</div>
            <div className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">Agent Orchestrator</div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/70 dark:border-white/5">
            <div className="text-sm font-bold text-slate-900 dark:text-white">FastAPI</div>
            <div className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">Async SSE Engine</div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/70 dark:border-white/5">
            <div className="text-sm font-bold text-slate-900 dark:text-white">Tailwind v4</div>
            <div className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">CSS Styling</div>
          </div>
        </div>
      </section>

      {/* 7. Bottom CTA Banner */}
      <section className="py-16 px-4 sm:px-6 max-w-4xl mx-auto text-center">
        <div className="p-8 sm:p-12 rounded-3xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xl">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Ready to experience Gen UI Best Practice?
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 dark:text-slate-600 mt-2 max-w-lg mx-auto">
            Try multi-turn conversational sessions with dynamic airline schedules, analytics charts, code execution, and interactive Excalidraw architecture plans.
          </p>
          <div className="mt-6">
            <Link
              href="/chat"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-md transition-all cursor-pointer"
            >
              <span>Launch Gen UI Studio</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 8. Footer */}
      <footer className="py-8 px-4 border-t border-slate-200/80 dark:border-white/5 text-center text-xs text-slate-400 select-none">
        <p>Gen UI Best Practice &bull; Powered by CopilotKit &amp; Google Antigravity SDK &bull; Open Source Architecture</p>
      </footer>
    </div>
  );
}
