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
  RotateCw,
  ThumbsUp,
  ThumbsDown,
  Bot,
  User as UserIcon,
} from "lucide-react";

import { getGuestUser, clearGuestSession, UserSession } from "@/lib/auth";
import { ChatSidebar, ConversationThread } from "@/components/layout/ChatSidebar";
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
  id: string;
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

const STORAGE_THREADS_KEY = "gemini_chat_threads_v2";
const STORAGE_THREAD_PREFIX = "gemini_thread_v2_";

export default function ChatPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserSession | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [threads, setThreads] = useState<ConversationThread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
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

    // Load conversation threads from localStorage
    try {
      const stored = localStorage.getItem(STORAGE_THREADS_KEY);
      if (stored) {
        const parsed: ConversationThread[] = JSON.parse(stored);
        setThreads(parsed);
        if (parsed.length > 0) {
          selectThread(parsed[0].id);
          return;
        }
      }
    } catch {}

    // If no threads exist, create an initial default thread
    createNewThread();
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

  // Save current thread messages to localStorage
  const saveThreadMessages = (threadId: string, msgs: MessageItem[]) => {
    try {
      localStorage.setItem(
        `${STORAGE_THREAD_PREFIX}${threadId}`,
        JSON.stringify(msgs)
      );
    } catch {}
  };

  // Save threads list to localStorage
  const saveThreadsList = (list: ConversationThread[]) => {
    try {
      localStorage.setItem(STORAGE_THREADS_KEY, JSON.stringify(list));
    } catch {}
  };

  // Select an existing thread
  const selectThread = (id: string) => {
    setActiveThreadId(id);
    try {
      const stored = localStorage.getItem(`${STORAGE_THREAD_PREFIX}${id}`);
      if (stored) {
        setMessages(JSON.parse(stored));
      } else {
        setMessages([]);
      }
    } catch {
      setMessages([]);
    }
  };

  // Create a brand new thread
  const createNewThread = () => {
    const newId = `thread_${Date.now()}`;
    const newThread: ConversationThread = {
      id: newId,
      title: "New Chat",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const updatedList = [newThread, ...threads];
    setThreads(updatedList);
    saveThreadsList(updatedList);
    setActiveThreadId(newId);
    setMessages([]);
    saveThreadMessages(newId, []);
  };

  // Delete a thread
  const deleteThread = (id: string) => {
    const filtered = threads.filter((t) => t.id !== id);
    setThreads(filtered);
    saveThreadsList(filtered);
    try {
      localStorage.removeItem(`${STORAGE_THREAD_PREFIX}${id}`);
    } catch {}

    if (activeThreadId === id) {
      if (filtered.length > 0) {
        selectThread(filtered[0].id);
      } else {
        createNewThread();
      }
    }
  };

  // Rename a thread
  const renameThread = (id: string, newTitle: string) => {
    const updated = threads.map((t) =>
      t.id === id ? { ...t, title: newTitle, updatedAt: Date.now() } : t
    );
    setThreads(updated);
    saveThreadsList(updated);
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

  // Stream chat message to backend
  const handleSendMessage = async (textToSend?: string) => {
    const messageContent = (textToSend || input).trim();
    if (!messageContent && !currentAttachment) return;
    if (isStreaming) return;

    const currentThreadId = activeThreadId || `thread_${Date.now()}`;
    if (!activeThreadId) {
      setActiveThreadId(currentThreadId);
    }

    // Update thread title if it was "New Chat"
    const activeThread = threads.find((t) => t.id === currentThreadId);
    if (activeThread && activeThread.title === "New Chat" && messageContent) {
      const titleCandidate =
        messageContent.length > 30
          ? `${messageContent.slice(0, 28)}...`
          : messageContent;
      renameThread(currentThreadId, titleCandidate);
    }

    // Create User Message
    const userMsgId = `user_${Date.now()}`;
    const userMessage: MessageItem = {
      id: userMsgId,
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

    // Placeholder Assistant Message
    const assistantMsgId = `asst_${Date.now() + 1}`;
    const initialAssistantMessage: MessageItem = {
      id: assistantMsgId,
      role: "assistant",
      content: "",
      stage: "Thinking",
      stageDetail: "Gemini 3.8 Flash evaluating query & tools...",
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
      // Connect to Next.js API route proxy (same origin, no direct port 8000 calls)
      const response = await fetch("/api/chat/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: messageContent,
          attachment_path: attachmentToSubmit?.filePath,
          session_id: currentThreadId,
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
      let activeStageDetail = "Gemini 3.8 Flash evaluating query & tools...";
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
            if (msg.id === assistantMsgId) {
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
          saveThreadMessages(currentThreadId, updated);
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
          if (!block.trim()) continue;

          let eventType = "message";
          let dataStr = "";

          for (const line of block.split("\n")) {
            if (line.startsWith("event: ")) {
              eventType = line.slice(7).trim();
            } else if (line.startsWith("data: ")) {
              dataStr = line.slice(6).trim();
            }
          }

          if (!dataStr) continue;

          try {
            const parsed = JSON.parse(dataStr);
            processParsedEvent(parsed, eventType);
          } catch {
            // Ignore non-JSON chunks
          }
        }
      }

      // Process any trailing bytes remaining in buffer
      if (buffer.trim()) {
        let eventType = "message";
        let dataStr = "";
        for (const line of buffer.split("\n")) {
          if (line.startsWith("event: ")) {
            eventType = line.slice(7).trim();
          } else if (line.startsWith("data: ")) {
            dataStr = line.slice(6).trim();
          }
        }
        if (dataStr) {
          try {
            const parsed = JSON.parse(dataStr);
            processParsedEvent(parsed, eventType);
          } catch {}
        }
      }

      // Mark stage as completed upon stream termination
      setMessages((prev) => {
        const updated = prev.map((msg) => {
          if (msg.id === assistantMsgId) {
            return {
              ...msg,
              stage: "Completed" as AgentStage,
              sources: activeSources.length > 0 ? activeSources : msg.sources,
              genui: latestGenUI || msg.genui,
            };
          }
          return msg;
        });
        saveThreadMessages(currentThreadId, updated);
        return updated;
      });
    } catch (err: any) {
      if (err.name === "AbortError") {
        // User deliberately aborted stream
      } else {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMsgId
              ? {
                  ...msg,
                  content: `⚠️ Connection error: ${err.message}. Please verify the agent service is active.`,
                  stage: "Completed",
                }
              : msg
          )
        );
      }
    } finally {
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  };

  // Render appropriate Generative UI component based on tool call
  const renderGenUIComponent = (genui?: { tool: string; data: any }) => {
    if (!genui || !genui.tool) return null;

    const { tool, data } = genui;

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.98, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="mt-4"
      >
        {tool === "get_weather_data" && <WeatherCard data={data} />}
        {tool === "get_sales_analytics" && <SalesDashboard data={data} />}
        {tool === "generate_planning_board" && <PlanningBoard data={data} />}
        {tool === "search_product_catalog" && <ProductCatalogCard data={data} />}
        {tool === "calculate_route_distance" && <RouteDistanceCard data={data} />}
        {tool === "generate_code_snippet" && <CodeStudioCard data={data} />}
        {tool === "search_jobs" && <JobBoardCard data={data} />}
        {tool === "search_flights" && <FlightDetailsCard data={data} />}
        {tool === "convert_currency" && <CurrencyConverterCard data={data} />}
        {tool === "search_youtube_videos" && <YouTubeVideoCard data={data} />}
        {tool === "fetch_website_info" && <WebsiteLinkCard data={data} />}
        {(tool === "request_sensitive_action" ||
          tool === "execute_approved_action") && (
          <HITLApprovalCard
            data={data}
            onDecision={async (actionId, decision) => {
              console.log("HITL action decision:", actionId, decision);
            }}
          />
        )}
      </motion.div>
    );
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-white dark:bg-[#131314] text-slate-900 dark:text-[#e3e3e3] antialiased transition-colors">
      {/* Collapsible Left Sidebar (Gemini / ChatGPT Replica) */}
      <ChatSidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        threads={threads}
        activeThreadId={activeThreadId}
        onSelectThread={selectThread}
        onNewThread={createNewThread}
        onDeleteThread={deleteThread}
        onRenameThread={renameThread}
        user={user}
        onLogout={handleLogout}
      />

      {/* Main Chat Canvas Area */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden relative">
        {/* Top Header Bar */}
        <ChatHeader
          user={user}
          sidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          onOpenUpload={() => setShowUploadModal(true)}
        />

        {/* Message Viewport */}
        <main className="flex-1 overflow-y-auto px-4 py-6 scroll-smooth">
          {messages.length === 0 ? (
            <GeminiEmptyState
              userName={user?.name || "Presenter"}
              onSelectPrompt={(p) => handleSendMessage(p)}
            />
          ) : (
            <div className="w-full max-w-3xl sm:max-w-4xl mx-auto space-y-6 pb-24">
              {messages.map((msg) => (
                <div key={msg.id} className="w-full">
                  {msg.role === "user" ? (
                    /* User Message: Clean right-aligned bubble */
                    <div className="flex justify-end mb-4">
                      <div className="max-w-[85%] sm:max-w-[75%] rounded-3xl px-5 py-3.5 bg-slate-100 dark:bg-[#282a2c] text-slate-900 dark:text-[#e3e3e3] text-sm shadow-xs leading-relaxed">
                        {/* File Attachment Pill */}
                        {msg.attachment && (
                          <div className="flex items-center gap-2 mb-2 p-2 rounded-xl bg-white/70 dark:bg-black/30 border border-slate-200 dark:border-white/10 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                            <FileSpreadsheet className="w-4 h-4 shrink-0" />
                            <span className="truncate">{msg.attachment.filename}</span>
                          </div>
                        )}
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                        <div className="text-[10px] text-slate-400 dark:text-[#9aa0a6] text-right mt-1.5">
                          {msg.timestamp}
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Assistant Message: Clean Gemini layout */
                    <div className="flex items-start gap-3 sm:gap-4 my-4">
                      {/* Gemini Sparkle Avatar */}
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 via-indigo-500 to-rose-400 p-0.5 shrink-0 shadow-xs mt-1">
                        <div className="w-full h-full bg-white dark:bg-[#131314] rounded-full flex items-center justify-center">
                          <Sparkles className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                        </div>
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
                              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-700 dark:hover:text-white transition-colors"
                              title="Copy response"
                            >
                              {copiedId === msg.id ? (
                                <Check className="w-3.5 h-3.5 text-emerald-500" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                            <button
                              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-700 dark:hover:text-white transition-colors"
                              title="Good response"
                            >
                              <ThumbsUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-700 dark:hover:text-white transition-colors"
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

        {/* Floating Bottom Input Bar (Signature Gemini / ChatGPT Capsule) */}
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

            {/* Main Floating Capsule */}
            <div className="flex items-center gap-2 p-2 sm:p-2.5 rounded-3xl bg-slate-100 dark:bg-[#1e1f20] border border-slate-200 dark:border-[#333538] shadow-md focus-within:ring-2 focus-within:ring-blue-500/30 focus-within:border-blue-500 dark:focus-within:border-blue-400 transition-all">
              {/* Paperclip Button for Ingestion */}
              <button
                type="button"
                onClick={() => setShowUploadModal(true)}
                className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 dark:text-[#9aa0a6] hover:text-slate-900 dark:hover:text-white transition-colors"
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
                placeholder="Ask Gemini anything, request Miro plans, or analyze sales data..."
                className="flex-1 bg-transparent border-0 outline-none resize-none text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-[#9aa0a6] max-h-36 py-1 leading-normal"
              />

              {/* Action Button: Stop or Send */}
              {isStreaming ? (
                <button
                  type="button"
                  onClick={handleStopStream}
                  className="p-2 rounded-full bg-slate-800 text-white hover:bg-slate-900 dark:bg-white dark:text-black dark:hover:bg-slate-200 transition-all shadow-xs"
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
                      : "bg-slate-200 text-slate-400 dark:bg-white/10 dark:text-slate-600 cursor-not-allowed"
                  }`}
                  title="Send message"
                >
                  <ArrowUp className="w-4 h-4 stroke-[2.5]" />
                </button>
              )}
            </div>

            {/* Disclaimer Subtext */}
            <p className="text-[11px] text-center text-slate-400 dark:text-[#9aa0a6] mt-2">
              Gemini 3.8 Flash &bull; Google Antigravity SDK &bull; CopilotKit V2 &bull; Generative UI components mount dynamically.
            </p>
          </div>
        </div>

        {/* File Upload Modal */}
        {showUploadModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
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
