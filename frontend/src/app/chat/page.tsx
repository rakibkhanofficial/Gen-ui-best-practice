"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Paperclip,
  ArrowUp,
  Square,
  FileSpreadsheet,
  X,
  Copy,
  Check,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";

import { getGuestUser, clearGuestSession, UserSession } from "@/lib/auth";
import { ChatSidebar, ChatSession } from "@/components/layout/ChatSidebar";
import { ChatHeader } from "@/components/layout/ChatHeader";
import { GeminiEmptyState } from "@/components/chat/GeminiEmptyState";
import { StreamingMessage } from "@/components/chat/StreamingMessage";
import { AgentReasoningStage, AgentStage, SearchSource } from "@/components/chat/AgentReasoningStage";
import { FileUploadZone } from "@/components/chat/FileUploadZone";

// Generative UI Showcase Components
import { WeatherCard } from "@/components/gen-ui/WeatherCard";
import { SalesDashboard } from "@/components/gen-ui/SalesDashboard";
import { PlanningBoard } from "@/components/gen-ui/PlanningBoard";
import { ProductCatalogCard } from "@/components/gen-ui/ProductCatalogCard";
import { RouteDistanceCard } from "@/components/gen-ui/RouteDistanceCard";
import { HITLApprovalCard } from "@/components/gen-ui/HITLApprovalCard";
import { CodeStudioCard } from "@/components/gen-ui/CodeStudioCard";
import { JobBoardCard } from "@/components/gen-ui/JobBoardCard";
import { FlightDetailsCard } from "@/components/gen-ui/FlightDetailsCard";
import { CurrencyConverterCard } from "@/components/gen-ui/CurrencyConverterCard";
import { YouTubeVideoCard } from "@/components/gen-ui/YouTubeVideoCard";
import { WebsiteLinkCard } from "@/components/gen-ui/WebsiteLinkCard";

export interface MessageItem {
  id: string; // The conversation turn id (e.g. conv_user_..., conv_asst_...)
  sessionId?: string; // The chat session id
  role: "user" | "assistant";
  content: string;
  stage?: AgentStage;
  stageDetail?: string;
  sources?: SearchSource[];
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

const STORAGE_SESSIONS_KEY = "genui_chat_sessions_v3";
const STORAGE_SESSION_MSGS_PREFIX = "genui_session_msgs_v3_";

export default function ChatPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserSession | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [currentAttachment, setCurrentAttachment] = useState<{
    filename: string;
    filePath: string;
    preview?: any;
  } | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom of conversation
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isStreaming]);

  // Check guest authentication session on load
  useEffect(() => {
    const session = getGuestUser();
    if (!session) {
      router.replace("/login");
      return;
    }
    setUser(session);

    // Load chat sessions from localStorage
    try {
      const stored = localStorage.getItem(STORAGE_SESSIONS_KEY);
      if (stored) {
        const parsed: ChatSession[] = JSON.parse(stored);
        setSessions(parsed);
      }
    } catch {}
  }, [router]);

  // Adjust textarea height dynamically
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        180
      )}px`;
    }
  }, [input]);

  // Save session messages to localStorage
  const saveSessionMessages = (sessionId: string, msgs: MessageItem[]) => {
    try {
      localStorage.setItem(
        `${STORAGE_SESSION_MSGS_PREFIX}${sessionId}`,
        JSON.stringify(msgs)
      );
    } catch {}
  };

  // Save sessions list to localStorage
  const saveSessionsList = (list: ChatSession[]) => {
    try {
      localStorage.setItem(STORAGE_SESSIONS_KEY, JSON.stringify(list));
    } catch {}
  };

  // Select an existing session and load its turns
  const selectSession = (sessionId: string) => {
    setActiveSessionId(sessionId);
    try {
      const stored = localStorage.getItem(`${STORAGE_SESSION_MSGS_PREFIX}${sessionId}`);
      if (stored) {
        setMessages(JSON.parse(stored));
      } else {
        setMessages([]);
      }
    } catch {
      setMessages([]);
    }
  };

  // Start a fresh, clean chat session
  const handleNewChat = () => {
    setActiveSessionId(null);
    setMessages([]);
    setInput("");
    setCurrentAttachment(null);
  };

  // Delete a session and clean up its stored turns
  const deleteSession = (sessionId: string) => {
    const filtered = sessions.filter((s) => s.id !== sessionId);
    setSessions(filtered);
    saveSessionsList(filtered);
    try {
      localStorage.removeItem(`${STORAGE_SESSION_MSGS_PREFIX}${sessionId}`);
    } catch {}

    if (activeSessionId === sessionId) {
      handleNewChat();
    }
  };

  // Rename a session
  const renameSession = (sessionId: string, newTitle: string) => {
    const updated = sessions.map((s) =>
      s.id === sessionId ? { ...s, title: newTitle, updatedAt: Date.now() } : s
    );
    setSessions(updated);
    saveSessionsList(updated);
  };

  // Handle user logout
  const handleLogout = () => {
    clearGuestSession();
    router.replace("/login");
  };

  // Handle copy text
  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Abort running stream
  const handleStopStream = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsStreaming(false);
  };

  // Stream chat message to backend (Creates a new session if needed, attaches turn id)
  const handleSendMessage = async (textToSend?: string) => {
    const messageContent = (textToSend || input).trim();
    if (!messageContent && !currentAttachment) return;
    if (isStreaming) return;

    // 1. Session ID Management: If on new chat, create a brand new session; otherwise, continue existing session
    let currentSessionId = activeSessionId;
    if (!currentSessionId) {
      currentSessionId = `session_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      setActiveSessionId(currentSessionId);

      const titleCandidate =
        messageContent.length > 34
          ? `${messageContent.slice(0, 32)}...`
          : messageContent;

      const newSession: ChatSession = {
        id: currentSessionId,
        title: titleCandidate,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        turnsCount: 1,
      };

      const updatedSessions = [newSession, ...sessions];
      setSessions(updatedSessions);
      saveSessionsList(updatedSessions);
    } else {
      // Continuing existing session: update timestamp and turns count
      const updatedSessions = sessions.map((s) =>
        s.id === currentSessionId
          ? {
              ...s,
              updatedAt: Date.now(),
              turnsCount: (s.turnsCount || 1) + 1,
            }
          : s
      );
      setSessions(updatedSessions);
      saveSessionsList(updatedSessions);
    }

    // 2. Create User Conversation Turn
    const userTurnId = `conv_user_${Date.now()}`;
    const userMessage: MessageItem = {
      id: userTurnId,
      sessionId: currentSessionId,
      role: "user",
      content: messageContent,
      attachment: currentAttachment
        ? {
            filename: currentAttachment.filename,
            filePath: currentAttachment.filePath,
          }
        : undefined,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    // 3. Create Placeholder Assistant Conversation Turn
    const asstTurnId = `conv_asst_${Date.now() + 1}`;
    const initialAssistantMessage: MessageItem = {
      id: asstTurnId,
      sessionId: currentSessionId,
      role: "assistant",
      content: "",
      stage: "Thinking",
      stageDetail: "Illuminating intent & evaluating tools with Gemini 3.8 Flash...",
      sources: [],
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    const newMessages = [...messages, userMessage, initialAssistantMessage];
    setMessages(newMessages);
    setInput("");
    const attachmentToSubmit = currentAttachment;
    setCurrentAttachment(null);
    setIsStreaming(true);

    // Prepare abort controller
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      // Connect to Next.js API route proxy (same origin, passing session_id and conversation_id)
      const response = await fetch("/api/chat/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: messageContent,
          attachment_path: attachmentToSubmit?.filePath,
          session_id: currentSessionId,
          conversation_id: userTurnId,
        }),
        signal: controller.signal,
      });

      if (!response.ok || !response.body) {
        throw new Error(`SSE stream failed with HTTP ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let accumulatedContent = "";
      let latestGenUI: any = null;
      let activeStage: AgentStage = "Thinking";
      let activeStageDetail = "Illuminating intent & evaluating tools with Gemini 3.8 Flash...";
      let activeSources: SearchSource[] = [];

      const processParsedEvent = (parsed: any, eventType: string) => {
        const evt = (parsed.event || eventType || "").toLowerCase();

        // 1. Stage / Status updates
        if (evt === "status" || evt === "stage" || parsed.stage) {
          if (parsed.stage) activeStage = parsed.stage as AgentStage;
          if (parsed.detail) activeStageDetail = parsed.detail;
          if (parsed.sources && Array.isArray(parsed.sources)) {
            activeSources = parsed.sources;
          }
        }

        // 2. Delta / Text updates
        if (evt === "delta" || evt === "text_delta" || parsed.text || parsed.delta) {
          const deltaText = parsed.text ?? parsed.delta ?? "";
          accumulatedContent += deltaText;
        }

        // 3. GenUI / Tool Call component instantiation
        if (evt === "genui" || evt === "tool_call" || (parsed.tool && parsed.data)) {
          latestGenUI = {
            tool: parsed.tool,
            data: parsed.data,
          };
          if (parsed.stage) {
            activeStage = parsed.stage as AgentStage;
          }
          if (parsed.sources && Array.isArray(parsed.sources)) {
            activeSources = parsed.sources;
          }
        }

        // 4. Stream completion
        if (
          evt === "done" ||
          evt === "complete" ||
          parsed.stage === "Completed" ||
          parsed.status === "completed"
        ) {
          activeStage = "Completed";
        }

        // Update assistant message state
        setMessages((prev) => {
          const updated = prev.map((msg) => {
            if (msg.id === asstTurnId) {
              return {
                ...msg,
                content: accumulatedContent,
                stage: activeStage,
                stageDetail: activeStageDetail,
                sources: activeSources.length > 0 ? activeSources : msg.sources,
                genui: latestGenUI || msg.genui,
              };
            }
            return msg;
          });
          saveSessionMessages(currentSessionId!, updated);
          return updated;
        });
      };

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const blocks = buffer.split("\n\n");
        buffer = blocks.pop() || "";

        for (const block of blocks) {
          const trimmed = block.trim();
          if (!trimmed) continue;

          let eventType = "message";
          let dataLines: string[] = [];

          for (const line of trimmed.split("\n")) {
            if (line.startsWith("event:")) {
              eventType = line.slice(6).trim();
            } else if (line.startsWith("data:")) {
              dataLines.push(line.slice(5).trim());
            }
          }

          const rawData = dataLines.join("\n");
          if (!rawData) continue;

          try {
            const parsed = JSON.parse(rawData);
            processParsedEvent(parsed, eventType);
          } catch {
            if (rawData.trim() && rawData !== "[DONE]") {
              processParsedEvent({ delta: rawData }, "delta");
            }
          }
        }
      }
    } catch (err: any) {
      if (err.name !== "AbortError") {
        console.error("SSE stream reading failed:", err);
        setMessages((prev) => {
          const updated = prev.map((msg) =>
            msg.id === asstTurnId
              ? {
                  ...msg,
                  content:
                    msg.content ||
                    "I encountered an issue connecting to the Gemini 3.8 Flash backend. Please verify that the server is running on port 8000.",
                  stage: "Completed" as AgentStage,
                }
              : msg
          );
          saveSessionMessages(currentSessionId!, updated);
          return updated;
        });
      }
    } finally {
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  };

  // Dynamically render GenUI component matching backend tool output
  const renderGenUIComponent = (genui?: { tool: string; data: any }) => {
    if (!genui || !genui.data) return null;

    switch (genui.tool) {
      case "get_weather_forecast":
        return <WeatherCard data={genui.data} />;
      case "get_sales_metrics":
      case "parse_sales_excel":
        return <SalesDashboard data={genui.data} />;
      case "generate_planning_board":
        return <PlanningBoard data={genui.data} />;
      case "search_product_catalog":
        return <ProductCatalogCard data={genui.data} />;
      case "calculate_route_distance":
        return <RouteDistanceCard data={genui.data} />;
      case "request_sensitive_action":
        return <HITLApprovalCard data={genui.data} />;
      case "generate_code_snippet":
        return <CodeStudioCard data={genui.data} />;
      case "search_jobs":
        return <JobBoardCard data={genui.data} />;
      case "search_flights":
        return <FlightDetailsCard data={genui.data} />;
      case "convert_currency":
        return <CurrencyConverterCard data={genui.data} />;
      case "search_youtube_videos":
        return <YouTubeVideoCard data={genui.data} />;
      case "fetch_website_info":
        return <WebsiteLinkCard data={genui.data} />;
      default:
        return (
          <div className="p-4 my-2 rounded-xl bg-slate-50 dark:bg-[#1e1f20] border border-slate-200 dark:border-white/10 text-xs">
            <span className="font-semibold text-blue-500">Tool Executed:</span> {genui.tool}
            <pre className="mt-2 text-[11px] overflow-x-auto text-slate-600 dark:text-zinc-400">
              {JSON.stringify(genui.data, null, 2)}
            </pre>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen w-full bg-white dark:bg-[#131314] text-slate-900 dark:text-[#e3e3e3] overflow-hidden antialiased font-sans">
      {/* Sidebar (Clean Sessions List & Management) */}
      <ChatSidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={selectSession}
        onNewSession={handleNewChat}
        onDeleteSession={deleteSession}
        onRenameSession={renameSession}
        user={user}
        onLogout={handleLogout}
      />

      {/* Main Canvas Area */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden relative">
        {/* Top Header */}
        <ChatHeader
          user={user}
          sidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />

        {/* Message Viewport */}
        <main className="flex-1 overflow-y-auto px-4 py-6 scroll-smooth">
          {messages.length === 0 ? (
            <GeminiEmptyState
              userName={user?.name || "Presenter"}
              onSelectPrompt={(p) => handleSendMessage(p)}
              onOpenUpload={() => setShowUploadModal(true)}
            />
          ) : (
            <div className="w-full max-w-3xl sm:max-w-4xl mx-auto space-y-6 pb-24">
              {messages.map((msg) => (
                <div key={msg.id} className="w-full">
                  {msg.role === "user" ? (
                    /* User Turn: Clean right-aligned bubble */
                    <div className="flex justify-end mb-4">
                      <div className="max-w-[85%] sm:max-w-[75%] rounded-3xl px-5 py-3.5 bg-slate-100 dark:bg-[#282a2c] text-slate-900 dark:text-[#e3e3e3] text-sm shadow-xs leading-relaxed">
                        {/* File Attachment Pill */}
                        {msg.attachment && (
                          <div className="flex items-center gap-2 mb-2 p-2 rounded-xl bg-white/80 dark:bg-black/30 border border-slate-200 dark:border-white/10 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                            <FileSpreadsheet className="w-4 h-4 shrink-0" />
                            <span className="truncate">{msg.attachment.filename}</span>
                          </div>
                        )}
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                        <div className="text-[10px] text-slate-400 dark:text-[#9aa0a6] text-right mt-1.5 font-mono">
                          {msg.timestamp}
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Assistant Turn: Clean Gemini layout */
                    <div className="flex items-start gap-3 sm:gap-4 my-4">
                      {/* Gemini Sparkle Avatar */}
                      <div className="w-8 h-8 rounded-full bg-blue-500/10 dark:bg-white/10 border border-blue-500/20 dark:border-white/10 flex items-center justify-center shrink-0 mt-1">
                        <Sparkles className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                      </div>

                      <div className="flex-1 min-w-0">
                        {/* Agent Reasoning Badge & Live Source Rail */}
                        {msg.stage && (
                          <AgentReasoningStage
                            stage={msg.stage}
                            detail={msg.stageDetail}
                            sources={msg.sources}
                          />
                        )}

                        {/* Streaming Text Content */}
                        {msg.content ? (
                          <div className="streamdown-content text-sm text-slate-800 dark:text-[#e3e3e3] leading-relaxed">
                            <StreamingMessage content={msg.content} />
                          </div>
                        ) : (
                          !msg.stage && isStreaming && (
                            <div className="flex items-center gap-1.5 text-xs text-slate-400 py-2">
                              <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
                              <span>Gemini 3.8 Flash is generating response...</span>
                            </div>
                          )
                        )}

                        {/* Mounted Generative UI Component */}
                        {renderGenUIComponent(msg.genui)}

                        {/* Bottom Action Bar */}
                        {msg.content && !isStreaming && (
                          <div className="flex items-center gap-2 mt-3 pt-1 text-slate-400">
                            <button
                              onClick={() => handleCopy(msg.id, msg.content)}
                              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-700 dark:hover:text-white transition-colors cursor-pointer"
                              title="Copy response"
                            >
                              {copiedId === msg.id ? (
                                <Check className="w-3.5 h-3.5 text-emerald-500" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                            <button
                              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-700 dark:hover:text-white transition-colors cursor-pointer"
                              title="Good response"
                            >
                              <ThumbsUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-700 dark:hover:text-white transition-colors cursor-pointer"
                              title="Bad response"
                            >
                              <ThumbsDown className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </main>

        {/* Floating Bottom Input Bar: Active when conversation is in progress */}
        {messages.length > 0 && (
          <div className="sticky bottom-0 left-0 right-0 px-4 pb-4 pt-2 bg-gradient-to-t from-white via-white/95 to-transparent dark:from-[#131314] dark:via-[#131314]/95 dark:to-transparent z-10 transition-colors">
            <div className="w-full max-w-3xl sm:max-w-4xl mx-auto">
              {/* File Attachment Chip */}
              {currentAttachment && (
                <div className="mb-2 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-[#1e1f20] border border-slate-300 dark:border-white/10 text-xs w-fit shadow-xs">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
                  <span className="font-medium text-slate-800 dark:text-slate-200">
                    {currentAttachment.filename}
                  </span>
                  <button
                    onClick={() => setCurrentAttachment(null)}
                    className="p-0.5 rounded-full hover:bg-slate-200 dark:hover:bg-white/10 text-slate-400"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}

              {/* Input Capsule */}
              <div className="flex items-center gap-2 p-2 sm:p-2.5 rounded-3xl bg-white dark:bg-[#1e1f20] border border-slate-200/90 dark:border-white/10 shadow-lg shadow-blue-500/5 focus-within:ring-2 focus-within:ring-blue-500/30 focus-within:border-blue-500 dark:focus-within:border-blue-400 transition-all">
                {/* Paperclip Button for Ingestion */}
                <button
                  type="button"
                  onClick={() => setShowUploadModal(true)}
                  className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 text-slate-500 dark:text-[#9aa0a6] hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                  title="Attach Excel spreadsheet (.xlsx, .csv) or image"
                >
                  <Paperclip className="w-4 h-4" />
                </button>

                {/* Textarea */}
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  rows={1}
                  placeholder="Ask a follow up question in this session..."
                  className="flex-1 bg-transparent border-0 outline-none resize-none text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-[#9aa0a6] max-h-36 py-1 leading-normal"
                />

                {/* Action Button: Stop or Send */}
                {isStreaming ? (
                  <button
                    type="button"
                    onClick={handleStopStream}
                    className="p-2 rounded-full bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-black dark:hover:bg-slate-200 transition-all shadow-xs cursor-pointer"
                    title="Stop generating"
                  >
                    <Square className="w-4 h-4 fill-current" />
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={!input.trim() && !currentAttachment}
                    onClick={() => handleSendMessage()}
                    className={`p-2 rounded-full transition-all shadow-xs ${
                      input.trim() || currentAttachment
                        ? "bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-black dark:hover:bg-slate-200 cursor-pointer"
                        : "bg-slate-100 text-slate-400 dark:bg-white/10 dark:text-slate-600 cursor-not-allowed"
                    }`}
                    title="Send message"
                  >
                    <ArrowUp className="w-4 h-4 stroke-[2.5]" />
                  </button>
                )}
              </div>

              {/* Disclaimer Subtext */}
              <p className="text-[11px] text-center text-slate-400 dark:text-zinc-500 mt-2">
                Gemini 3.8 Flash &bull; Google Antigravity SDK &bull; CopilotKit V2 &bull; Session: {activeSessionId}
              </p>
            </div>
          </div>
        )}

        {/* File Upload Modal */}
        {showUploadModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-lg">
              <FileUploadZone
                onFileUploaded={(data) => {
                  setCurrentAttachment({
                    filename: data.filename,
                    filePath: data.filePath,
                    preview: data.preview,
                  });
                  setShowUploadModal(false);
                }}
                onClose={() => setShowUploadModal(false)}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
