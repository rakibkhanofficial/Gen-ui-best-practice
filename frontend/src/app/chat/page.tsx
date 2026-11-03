"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  CloudSun,
  BarChart3,
  Kanban,
  Laptop,
  Navigation,
  ShieldAlert,
  Play,
  Paperclip,
  Send,
  FileSpreadsheet,
  Download,
  Terminal,
  Brain,
  RotateCcw,
  CheckCircle2,
  Cpu,
  Layers,
  User,
  Bot,
  Code2,
  Briefcase
} from "lucide-react";

import { getGuestUser, UserSession } from "@/lib/auth";
import { ChatHeader } from "@/components/layout/ChatHeader";
import { WeatherCard } from "@/components/gen-ui/WeatherCard";
import { SalesDashboard } from "@/components/gen-ui/SalesDashboard";
import { PlanningBoard } from "@/components/gen-ui/PlanningBoard";
import { ProductCatalogCard } from "@/components/gen-ui/ProductCatalogCard";
import { RouteDistanceCard } from "@/components/gen-ui/RouteDistanceCard";
import { HITLApprovalCard } from "@/components/gen-ui/HITLApprovalCard";
import { CodeStudioCard } from "@/components/gen-ui/CodeStudioCard";
import { JobBoardCard } from "@/components/gen-ui/JobBoardCard";
import { StreamingMessage } from "@/components/chat/StreamingMessage";
import { AgentReasoningStage, AgentStage } from "@/components/chat/AgentReasoningStage";
import { FileUploadZone } from "@/components/chat/FileUploadZone";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

interface MessageItem {
  id: string;
  role: "user" | "assistant";
  content: string;
  stage?: AgentStage;
  stageDetail?: string;
  genui?: {
    tool: string;
    data: any;
  };
  attachment?: {
    filename: string;
    filePath: string;
  };
  timestamp: string;
}

export default function ChatPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserSession | null>(null);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [currentStage, setCurrentStage] = useState<AgentStage>("Idle");
  const [stageDetail, setStageDetail] = useState("");
  const [activeLog, setActiveLog] = useState<string[]>([]);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Check guest session on load
  useEffect(() => {
    const session = getGuestUser();
    if (!session) {
      router.replace("/login");
    } else {
      setUser(session);
      addLog(`Authenticated as ${session.name} (${session.role})`);
      addLog("Initialized Gemini 3.8 Flash & Google Antigravity Agent Engine");

      // Initial welcome message
      setMessages([
        {
          id: "welcome-1",
          role: "assistant",
          content: (
            "### 👋 Welcome to Generative UI Studio\n\n" +
            "Powered by **Gemini 3.8 Flash**, **Google Antigravity SDK**, and **Streamdown**.\n\n" +
            "Here you can test real-time **SSE streaming**, upload your own **Excel sales data**, or click any **Demo Preset** above to experience dynamic Generative UI."
          ),
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
    }
  }, [router]);

  // Auto scroll chat
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, currentStage, stageDetail]);

  const addLog = (msg: string) => {
    setActiveLog((prev) => [
      `[${new Date().toLocaleTimeString()}] ${msg}`,
      ...prev.slice(0, 20),
    ]);
  };

  const executeSSEStream = async (promptText: string, attachmentPath?: string, filename?: string) => {
    if (isStreaming || (!promptText.trim() && !attachmentPath)) return;

    const userMsgId = `usr-${Date.now()}`;
    const assistantMsgId = `ast-${Date.now()}`;

    // Append User Message
    const userMessage: MessageItem = {
      id: userMsgId,
      role: "user",
      content: promptText || `Uploaded file: ${filename}`,
      attachment: attachmentPath ? { filename: filename || "dataset", filePath: attachmentPath } : undefined,
      timestamp: new Date().toLocaleTimeString(),
    };

    // Prepare Placeholder Assistant Message
    const assistantMessage: MessageItem = {
      id: assistantMsgId,
      role: "assistant",
      content: "",
      stage: "Thinking",
      stageDetail: "Evaluating prompt and model reasoning...",
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages((prev) => [...prev, userMessage, assistantMessage]);
    setInput("");
    setIsStreaming(true);
    setCurrentStage("Thinking");
    setStageDetail("Evaluating prompt and model reasoning with Gemini 3.8 Flash...");
    addLog(`User prompt dispatched: "${promptText}"`);

    try {
      const response = await fetch(`${BACKEND_URL}/api/chat/stream`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: promptText || "Analyze this uploaded dataset",
          attachment_path: attachmentPath,
          history: messages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error(`SSE stream failed with status ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.replace("data: ", "").trim();
          if (!jsonStr) continue;

          try {
            const parsed = JSON.parse(jsonStr);

            if (parsed.event === "status") {
              setCurrentStage(parsed.stage);
              setStageDetail(parsed.detail || "");
              addLog(`Agent Stage: [${parsed.stage}] - ${parsed.detail}`);

              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantMsgId
                    ? { ...m, stage: parsed.stage, stageDetail: parsed.detail }
                    : m
                )
              );
            } else if (parsed.event === "delta") {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantMsgId
                    ? { ...m, content: m.content + parsed.text }
                    : m
                )
              );
            } else if (parsed.event === "genui") {
              addLog(`GenUI Component Emitted: ${parsed.tool}`);
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantMsgId
                    ? { ...m, genui: { tool: parsed.tool, data: parsed.data } }
                    : m
                )
              );
            } else if (parsed.event === "done") {
              setCurrentStage("Completed");
              setStageDetail("Streaming completed");
              addLog("SSE stream closed successfully");
            }
          } catch (e) {
            console.error("SSE parse error:", e);
          }
        }
      }
    } catch (err: any) {
      console.error("Stream error:", err);
      addLog(`Stream error: ${err.message}`);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMsgId
            ? { ...m, content: m.content + `\n\n*(Error connecting to agent stream: ${err.message})*` }
            : m
        )
      );
    } finally {
      setIsStreaming(false);
      setTimeout(() => {
        setCurrentStage("Idle");
        setStageDetail("");
      }, 1500);
    }
  };

  const handleFileUpload = (fileData: { filename: string; filePath: string; isExcel: boolean; preview?: any }) => {
    addLog(`Uploaded file: ${fileData.filename} (${fileData.isExcel ? "Excel" : "Media"})`);
    executeSSEStream(
      `Please analyze my uploaded spreadsheet "${fileData.filename}" and generate the sales dashboard.`,
      fileData.filePath,
      fileData.filename
    );
  };

  const triggerPreset = (promptText: string) => {
    executeSSEStream(promptText);
  };

  const renderGenUIComponent = (tool: string, data: any) => {
    switch (tool) {
      case "get_weather_data":
        return <WeatherCard data={data} status="complete" />;
      case "get_sales_analytics":
        return <SalesDashboard data={data} status="complete" />;
      case "generate_planning_board":
        return <PlanningBoard data={data} status="complete" />;
      case "search_product_catalog":
        return <ProductCatalogCard data={data} status="complete" />;
      case "calculate_route_distance":
        return <RouteDistanceCard data={data} status="complete" />;
      case "generate_code_snippet":
        return <CodeStudioCard data={data} status="complete" />;
      case "search_jobs":
        return <JobBoardCard data={data} status="complete" />;
      case "request_sensitive_action":
        return (
          <HITLApprovalCard
            data={data}
            status="complete"
            onDecision={async (actionId, decision) => {
              addLog(`Human Decision: [${decision.toUpperCase()}] on ${actionId}`);
              await fetch(`${BACKEND_URL}/api/actions/approve`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action_id: actionId, decision }),
              });
            }}
          />
        );
      default:
        return null;
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 text-xs">
        Checking session credentials...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col text-slate-100">
      {/* Header */}
      <ChatHeader user={user} />

      {/* Showcase Presets Quick-Bar */}
      <div className="bg-slate-900/60 border-b border-slate-800/80 px-6 py-2.5 flex items-center gap-2 overflow-x-auto">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1 mr-1">
          <Play className="w-3 h-3 text-sky-400" /> Presets:
        </span>

        <button
          onClick={() => triggerPreset("What is the weather in Tokyo?")}
          className="shrink-0 flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-xs text-slate-200 transition-colors"
        >
          <CloudSun className="w-3.5 h-3.5 text-amber-400" />
          <span>🌤️ Tokyo Weather</span>
        </button>

        <button
          onClick={() => triggerPreset("Show sales analytics for Q3 and compare with target")}
          className="shrink-0 flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-xs text-slate-200 transition-colors"
        >
          <BarChart3 className="w-3.5 h-3.5 text-indigo-400" />
          <span>📊 Q3 Zen Sales &amp; Table</span>
        </button>

        <button
          onClick={() => setShowUploadModal(true)}
          className="shrink-0 flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-950/70 hover:bg-emerald-900/80 border border-emerald-800 text-xs text-emerald-300 font-medium transition-colors"
        >
          <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
          <span>📁 Upload Excel Sales Data</span>
        </button>

        <button
          onClick={() => triggerPreset("Plan architecture roadmap for our GenUI deployment")}
          className="shrink-0 flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-xs text-slate-200 transition-colors"
        >
          <Kanban className="w-3.5 h-3.5 text-amber-400" />
          <span>📝 Miro Sticky Board</span>
        </button>

        <button
          onClick={() => triggerPreset("Compare MacBook Pro M4 Max vs ThinkPad P1 AI Studio")}
          className="shrink-0 flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-xs text-slate-200 transition-colors"
        >
          <Laptop className="w-3.5 h-3.5 text-purple-400" />
          <span>💻 Tech Specs Matrix</span>
        </button>

        <button
          onClick={() => triggerPreset("What is the driving distance from San Francisco to Lake Tahoe?")}
          className="shrink-0 flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-xs text-slate-200 transition-colors"
        >
          <Navigation className="w-3.5 h-3.5 text-teal-400" />
          <span>🗺️ SF to Tahoe Route</span>
        </button>

        <button
          onClick={() => triggerPreset("Show production TypeScript and Python code for FastAPI SSE Streaming")}
          className="shrink-0 flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-950/70 hover:bg-blue-900/80 border border-blue-800 text-xs text-blue-300 transition-colors"
        >
          <Code2 className="w-3.5 h-3.5 text-blue-400" />
          <span>💻 Code Studio (SSE Stream)</span>
        </button>

        <button
          onClick={() => triggerPreset("Search Frontend Next.js and AI Engineer jobs in Dhaka on BDJobs and LinkedIn")}
          className="shrink-0 flex items-center gap-1.5 px-3 py-1 rounded-lg bg-cyan-950/70 hover:bg-cyan-900/80 border border-cyan-800 text-xs text-cyan-300 transition-colors"
        >
          <Briefcase className="w-3.5 h-3.5 text-cyan-400" />
          <span>💼 BDJobs &amp; LinkedIn Search</span>
        </button>

        <button
          onClick={() => triggerPreset("Request refund of $1,250 for order ORD-8921 due to billing error")}
          className="shrink-0 flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-950/60 hover:bg-amber-900/60 border border-amber-800/80 text-xs text-amber-300 transition-colors"
        >
          <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
          <span>🛡️ HITL Refund Approval</span>
        </button>
      </div>

      {/* Main Workspace Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left / Center: Interactive Chat Stream */}
        <div className="flex-1 flex flex-col justify-between p-4 max-w-4xl mx-auto w-full h-[calc(100vh-130px)]">
          {/* Scrollable Messages Area */}
          <div ref={chatScrollRef} className="flex-1 overflow-y-auto space-y-4 pr-2">
            {messages.map((msg) => (
              <div key={msg.id} className="flex flex-col space-y-2">
                <div
                  className={`flex gap-3 ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {msg.role === "assistant" && (
                    <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white shrink-0 mt-1 shadow-sm">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed ${
                      msg.role === "user"
                        ? "bg-blue-600 text-white shadow-md self-end"
                        : "bg-slate-900 border border-slate-800/80 text-slate-200 shadow-xl"
                    }`}
                  >
                    {msg.attachment && (
                      <div className="mb-2.5 p-2 rounded-lg bg-blue-700/80 border border-blue-500/50 flex items-center gap-2 text-[11px] font-medium">
                        <FileSpreadsheet className="w-4 h-4 text-emerald-300" />
                        <span>Attached: {msg.attachment.filename}</span>
                      </div>
                    )}

                    {msg.role === "assistant" ? (
                      <div>
                        {/* Live Agent Reasoning Stage */}
                        {msg.stage && msg.stage !== "Completed" && (
                          <AgentReasoningStage
                            stage={msg.stage}
                            detail={msg.stageDetail}
                          />
                        )}

                        {/* Streamdown Markdown Renderer */}
                        <StreamingMessage content={msg.content} />

                        {/* Generative UI Component Mount */}
                        {msg.genui && (
                          <div className="mt-3 pt-2 border-t border-slate-800">
                            {renderGenUIComponent(msg.genui.tool, msg.genui.data)}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span>{msg.content}</span>
                    )}

                    <div className="text-[10px] opacity-40 mt-1.5 text-right font-mono">
                      {msg.timestamp}
                    </div>
                  </div>

                  {msg.role === "user" && (
                    <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 shrink-0 mt-1">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Active Streaming Stage indicator */}
            {isStreaming && currentStage !== "Idle" && currentStage !== "Completed" && (
              <div className="max-w-md">
                <AgentReasoningStage stage={currentStage} detail={stageDetail} />
              </div>
            )}
          </div>

          {/* Chat Input & File Upload Bar */}
          <div className="pt-3 border-t border-slate-800 relative">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                executeSSEStream(input);
              }}
              className="flex items-center gap-2 bg-slate-900/90 border border-slate-700/80 rounded-2xl p-2 shadow-2xl focus-within:border-blue-500 transition-colors"
            >
              <button
                type="button"
                onClick={() => setShowUploadModal(!showUploadModal)}
                title="Upload Excel or Image"
                className="p-2 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded-xl transition-colors"
              >
                <Paperclip className="w-4 h-4" />
              </button>

              <input
                type="text"
                placeholder="Ask about weather, sales data, plan a roadmap, or upload Excel..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isStreaming}
                className="flex-1 bg-transparent border-0 text-xs text-white placeholder-slate-400 focus:outline-none px-2"
              />

              <button
                type="submit"
                disabled={isStreaming || !input.trim()}
                className="p-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 text-white rounded-xl shadow-md transition-all disabled:opacity-40"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

        {/* Right Sidebar: Real-time Agent Telemetry & Reasoning Bus */}
        <aside className="hidden xl:flex w-80 flex-col bg-slate-950 border-l border-slate-800 p-4 overflow-y-auto">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-300 pb-3 border-b border-slate-800">
            <Terminal className="w-4 h-4 text-sky-400" />
            <span>Agent Telemetry &amp; Protocol Bus</span>
          </div>

          {/* Connected Agent info card */}
          <div className="my-3 p-3 bg-slate-900/80 rounded-xl border border-slate-800 text-[11px] space-y-1.5">
            <div className="flex justify-between text-slate-400">
              <span>Model:</span>
              <span className="text-emerald-400 font-bold font-mono">gemini-3.8-flash</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Markdown:</span>
              <span className="text-white font-mono">streamdown (Vercel)</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Transport:</span>
              <span className="text-sky-400 font-mono">Server-Sent Events (SSE)</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Excel Engine:</span>
              <span className="text-indigo-400">pandas + openpyxl</span>
            </div>
          </div>

          {/* Active Reasoning Stage Card */}
          <div className="my-2">
            <div className="text-[10px] uppercase font-bold text-slate-500 mb-1.5 tracking-wider">
              Active Agent Stage
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-200">{currentStage}</span>
              <span className={`w-2 h-2 rounded-full ${isStreaming ? "bg-amber-400 animate-ping" : "bg-emerald-400"}`} />
            </div>
          </div>

          {/* Live Activity Stream */}
          <div className="flex-1 flex flex-col mt-2">
            <div className="text-[10px] uppercase font-bold text-slate-500 mb-2 tracking-wider">
              Live Protocol Event Log
            </div>
            <div className="flex-1 bg-slate-900/40 rounded-xl p-2.5 border border-slate-800/80 font-mono text-[10px] space-y-1.5 text-slate-400 overflow-y-auto max-h-[360px]">
              {activeLog.map((log, i) => (
                <div
                  key={i}
                  className="leading-tight py-0.5 border-b border-slate-800/40 last:border-0"
                >
                  {log}
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>

      {/* Excel & File Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg">
            <FileUploadZone
              onFileUploaded={handleFileUpload}
              onClose={() => setShowUploadModal(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
