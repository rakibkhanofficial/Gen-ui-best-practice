"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
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

import {
  UserSession,
  generateChatId,
  getUserSessionsKey,
  getUserMessagesKey,
  setActiveChatCookie,
  getGuestUser,
  getOrCreateGuestUser,
  clearGuestSession,
} from "@/lib/auth";

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
  sessionId?: string; // The chat session id (e.g. egr67e8vbtyw3e)
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

interface ChatContainerProps {
  initialChatId?: string;
}

export function ChatContainer({ initialChatId }: ChatContainerProps) {
  const router = useRouter();
  const { data: authSession, status: authStatus } = useSession();

  const [user, setUser] = useState<UserSession | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(initialChatId || null);
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

  // 1. Resolve User Identity (NextAuth Google Provider OR IP+Time Guest Identity)
  useEffect(() => {
    if (authStatus === "loading") return;

    if (authStatus === "authenticated" && authSession?.user) {
      // User is logged in via NextAuth Google provider
      const email = authSession.user.email || "user";
      const emailSlug = email.replace(/[^a-zA-Z0-9]/g, "_");
      const userId = (authSession.user as any).id || `usr_google_${emailSlug}_${Date.now()}`;

      const googleUser: UserSession = {
        id: userId,
        name: authSession.user.name || "Google User",
        email: email,
        role: "google",
        avatar: authSession.user.image || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(email)}`,
        createdAt: new Date().toISOString(),
      };
      setUser(googleUser);
      loadUserSessions(googleUser.id);
    } else {
      // User is in Guest Mode: Retrieve or initialize IP-bound unique guest identity
      getOrCreateGuestUser().then((guest) => {
        setUser(guest);
        loadUserSessions(guest.id);
      });
    }
  }, [authStatus, authSession]);

  // Load user-wise sessions from localStorage
  const loadUserSessions = (userId: string) => {
    try {
      const key = getUserSessionsKey(userId);
      const stored = localStorage.getItem(key);
      if (stored) {
        const parsed: ChatSession[] = JSON.parse(stored);
        setSessions(parsed);
      } else {
        setSessions([]);
      }
    } catch {
      setSessions([]);
    }
  };

  // 2. Load conversation messages when activeSessionId or user changes
  useEffect(() => {
    if (!user) return;

    if (initialChatId) {
      setActiveSessionId(initialChatId);
      setActiveChatCookie(initialChatId);

      // Load specific messages for this user + session
      const msgsKey = getUserMessagesKey(user.id, initialChatId);
      try {
        const stored = localStorage.getItem(msgsKey);
        if (stored) {
          setMessages(JSON.parse(stored));
        } else {
          setMessages([]);
        }
      } catch {
        setMessages([]);
      }
    } else if (!activeSessionId) {
      setMessages([]);
    }
  }, [initialChatId, user]);

  // Auto-scroll to bottom of conversation
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isStreaming]);

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

  // Save session messages to localStorage (User-Wise)
  const saveSessionMessages = (userId: string, sessionId: string, msgs: MessageItem[]) => {
    try {
      localStorage.setItem(
        getUserMessagesKey(userId, sessionId),
        JSON.stringify(msgs)
      );
    } catch {}
  };

  // Save sessions list to localStorage (User-Wise)
  const saveSessionsList = (userId: string, list: ChatSession[]) => {
    try {
      localStorage.setItem(getUserSessionsKey(userId), JSON.stringify(list));
    } catch {}
  };

  // Select an existing session and load its turns, updating URL
  const selectSession = (sessionId: string) => {
    setActiveSessionId(sessionId);
    setActiveChatCookie(sessionId);
    router.push(`/chat/${sessionId}`);

    if (user) {
      try {
        const stored = localStorage.getItem(getUserMessagesKey(user.id, sessionId));
        if (stored) {
          setMessages(JSON.parse(stored));
        } else {
          setMessages([]);
        }
      } catch {
        setMessages([]);
      }
    }
  };

  // Start a fresh, clean chat session
  const handleNewChat = () => {
    setActiveSessionId(null);
    setMessages([]);
    setInput("");
    setCurrentAttachment(null);
    router.push("/chat");
  };

  // Delete a session and clean up its stored turns
  const deleteSession = (sessionId: string) => {
    if (!user) return;
    const filtered = sessions.filter((s) => s.id !== sessionId);
    setSessions(filtered);
    saveSessionsList(user.id, filtered);

    try {
      localStorage.removeItem(getUserMessagesKey(user.id, sessionId));
      // Notify backend optimistically
      fetch(`http://localhost:8000/api/chat/sessions/${sessionId}?user_id=${user.id}`, {
        method: "DELETE",
      }).catch(() => {});
    } catch {}

    if (activeSessionId === sessionId) {
      handleNewChat();
    }
  };

  // Rename a session
  const renameSession = (sessionId: string, newTitle: string) => {
    if (!user) return;
    const updated = sessions.map((s) =>
      s.id === sessionId ? { ...s, title: newTitle, updatedAt: Date.now() } : s
    );
    setSessions(updated);
    saveSessionsList(user.id, updated);
  };

  // Handle user logout
  const handleLogout = () => {
    if (user?.role === "google") {
      signOut({ callbackUrl: "/login" });
    } else {
      clearGuestSession();
      router.replace("/login");
    }
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

  // Stream chat message to backend with Immediate Optimistic URL creation
  const handleSendMessage = async (textToSend?: string) => {
    const messageContent = (textToSend || input).trim();
    if (!messageContent && !currentAttachment) return;
    if (isStreaming) return;
    if (!user) return;

    // 1. Immediate Optimistic URL & Chat ID Generation
    let currentSessionId = activeSessionId;
    let isBrandNewSession = false;

    if (!currentSessionId) {
      // Generate clean 14-character alphanumeric chat ID (e.g., "egr67e8vbtyw3e")
      currentSessionId = generateChatId();
      isBrandNewSession = true;
      setActiveSessionId(currentSessionId);
      setActiveChatCookie(currentSessionId);

      // Optimistically update the browser address bar immediately without reloading!
      window.history.pushState(null, "", `/chat/${currentSessionId}`);

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
        userId: user.id,
        userType: user.role,
      };

      const updatedSessions = [newSession, ...sessions.filter((s) => s.id !== currentSessionId)];
      setSessions(updatedSessions);
      saveSessionsList(user.id, updatedSessions);
    } else {
      // Continuing existing session
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
      saveSessionsList(user.id, updatedSessions);
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
      stageDetail: "Illuminating intent & evaluating tools with Antigravity Agent...",
      sources: [],
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    const newMessages = [...messages, userMessage, initialAssistantMessage];
    setMessages(newMessages);
    saveSessionMessages(user.id, currentSessionId, newMessages);

    setInput("");
    const attachmentToSubmit = currentAttachment;
    setCurrentAttachment(null);
    setIsStreaming(true);

    // Prepare abort controller
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      // Connect to Next.js API route proxy (forwarding user_id, session_id, conversation_id)
      const response = await fetch("/api/chat/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: messageContent,
          attachment_path: attachmentToSubmit?.filePath,
          session_id: currentSessionId,
          conversation_id: userTurnId,
          user_id: user.id,
          user_type: user.role,
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
      let activeStageDetail = "Illuminating intent & evaluating tools with Antigravity Agent...";
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

        // 3. Generative UI Events
        if (evt === "genui" || parsed.genui || parsed.tool) {
          latestGenUI = {
            tool: parsed.tool || parsed.genui?.tool,
            data: parsed.data || parsed.genui?.data,
          };
        }

        // 4. Update the state item in real time
        setMessages((prev) => {
          const updated = prev.map((msg) =>
            msg.id === asstTurnId
              ? {
                  ...msg,
                  content: accumulatedContent,
                  stage: activeStage,
                  stageDetail: activeStageDetail,
                  sources: activeSources,
                  genui: latestGenUI || msg.genui,
                }
              : msg
          );
          if (user) {
            saveSessionMessages(user.id, currentSessionId!, updated);
          }
          return updated;
        });
      };

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";

        for (const block of lines) {
          if (!block.trim()) continue;

          let eventType = "message";
          let dataStr = "";

          const subLines = block.split("\n");
          for (const line of subLines) {
            if (line.startsWith("event:")) {
              eventType = line.replace("event:", "").trim();
            } else if (line.startsWith("data:")) {
              dataStr += line.replace("data:", "").trim();
            }
          }

          if (dataStr) {
            try {
              const parsed = JSON.parse(dataStr);
              processParsedEvent(parsed, eventType);
            } catch {
              processParsedEvent({ text: dataStr }, eventType);
            }
          }
        }
      }

      // Mark stage as completed after stream finishes
      setMessages((prev) => {
        const updated = prev.map((msg) =>
          msg.id === asstTurnId
            ? {
                ...msg,
                stage: "Completed" as AgentStage,
                stageDetail: "Thought process complete",
              }
            : msg
        );
        if (user) {
          saveSessionMessages(user.id, currentSessionId!, updated);
        }
        return updated;
      });
    } catch (err: any) {
      if (err.name === "AbortError") {
        setMessages((prev) => {
          const updated = prev.map((msg) =>
            msg.id === asstTurnId
              ? {
                  ...msg,
                  content: msg.content + "\n\n*(Stream paused by user)*",
                  stage: "Completed" as AgentStage,
                }
              : msg
          );
          if (user) {
            saveSessionMessages(user.id, currentSessionId!, updated);
          }
          return updated;
        });
      } else {
        setMessages((prev) => {
          const updated = prev.map((msg) =>
            msg.id === asstTurnId
              ? {
                  ...msg,
                  content:
                    msg.content ||
                    "I encountered an issue connecting to the Gen UI backend. Please verify that the server is running on port 8000.",
                  stage: "Completed" as AgentStage,
                }
              : msg
          );
          if (user) {
            saveSessionMessages(user.id, currentSessionId!, updated);
          }
          return updated;
        });
      }
    } finally {
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  };

  // Render GenUI component based on tool name
  const renderGenUIComponent = (genui: { tool: string; data: any }) => {
    switch (genui.tool) {
      case "get_weather_data":
        return <WeatherCard data={genui.data} />;
      case "get_sales_analytics":
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
          <div className="p-4 rounded-xl bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-white/10 text-xs">
            <span className="font-mono text-blue-500 font-bold block mb-1">
              [Tool: {genui.tool}]
            </span>
            <pre className="overflow-x-auto text-[11px] p-2 bg-black/5 dark:bg-black/30 rounded">
              {JSON.stringify(genui.data, null, 2)}
            </pre>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-white dark:bg-[#131314] text-slate-800 dark:text-[#e3e3e3] font-sans antialiased">
      {/* 1. Left Sidebar with Chronological History and User Info */}
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

      {/* 2. Main Chat Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Top Header */}
        <ChatHeader
          user={user}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          sidebarOpen={sidebarOpen}
        />

        {/* Message Stream Scroll Area */}
        <div className="flex-1 overflow-y-auto px-4 md:px-6 lg:px-8 py-4 space-y-6">
          {messages.length === 0 ? (
            <GeminiEmptyState
              userName={user?.name || "Explorer"}
              onSelectPrompt={(prompt: string) => handleSendMessage(prompt)}
              onOpenUpload={() => setShowUploadModal(true)}
            />
          ) : (
            <div className="max-w-3xl mx-auto space-y-6 pb-28">
              {messages.map((msg) => (
                <div key={msg.id} className="space-y-3">
                  {msg.role === "user" ? (
                    /* User Turn */
                    <div className="flex justify-end">
                      <div className="max-w-[85%] md:max-w-[75%] rounded-2xl px-4 py-3 bg-[#f0f4f9] dark:bg-[#282a2c] text-slate-900 dark:text-white text-sm">
                        {msg.attachment && (
                          <div className="flex items-center gap-2 p-2 mb-2 rounded-lg bg-white/70 dark:bg-black/20 border border-slate-200 dark:border-white/5 text-xs text-blue-600 dark:text-blue-400 font-medium">
                            <FileSpreadsheet className="w-4 h-4 shrink-0" />
                            <span className="truncate">{msg.attachment.filename}</span>
                          </div>
                        )}
                        <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                      </div>
                    </div>
                  ) : (
                    /* Assistant Turn */
                    <div className="flex items-start gap-3">
                      <div className="w-7 h-7 rounded-full bg-blue-500/10 dark:bg-white/10 flex items-center justify-center shrink-0 mt-0.5 text-blue-600 dark:text-blue-400">
                        <Sparkles className="w-4 h-4" />
                      </div>

                      <div className="flex-1 min-w-0 space-y-3">
                        {/* 1. Reasoning Stage */}
                        {msg.stage && (
                          <AgentReasoningStage
                            stage={msg.stage}
                            detail={msg.stageDetail}
                            sources={msg.sources}
                          />
                        )}

                        {/* 2. Generative UI Component */}
                        {msg.genui && (
                          <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            className="my-3"
                          >
                            {renderGenUIComponent(msg.genui)}
                          </motion.div>
                        )}

                        {/* 3. Text Body */}
                        {msg.content && (
                          <div className="prose prose-slate dark:prose-invert max-w-none text-sm leading-relaxed">
                            <StreamingMessage content={msg.content} />
                          </div>
                        )}

                        {/* Message Action Footer */}
                        {msg.content && !isStreaming && (
                          <div className="flex items-center gap-1.5 pt-1 text-slate-400 dark:text-zinc-500">
                            <button
                              onClick={() => handleCopy(msg.id, msg.content)}
                              className="p-1 rounded hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
                              title="Copy response"
                            >
                              {copiedId === msg.id ? (
                                <Check className="w-3.5 h-3.5 text-emerald-500" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                            <button
                              className="p-1 rounded hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
                              title="Good response"
                            >
                              <ThumbsUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              className="p-1 rounded hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
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
        </div>

        {/* 3. Bottom Prompt Input Bar */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-white via-white/90 dark:from-[#131314] dark:via-[#131314]/90 to-transparent pointer-events-none">
          <div className="max-w-3xl mx-auto pointer-events-auto">
            {/* Active Attachment Pill */}
            {currentAttachment && (
              <div className="flex items-center gap-2 mb-2 p-2 rounded-xl bg-blue-50 dark:bg-white/5 border border-blue-200 dark:border-white/10 w-fit text-xs text-blue-700 dark:text-blue-300">
                <FileSpreadsheet className="w-4 h-4 shrink-0" />
                <span className="font-medium truncate max-w-xs">{currentAttachment.filename}</span>
                <button
                  onClick={() => setCurrentAttachment(null)}
                  className="p-0.5 hover:bg-blue-200/50 dark:hover:bg-white/10 rounded-full cursor-pointer ml-1"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}

            {/* Input Form Box */}
            <div className="relative rounded-2xl bg-[#f0f4f9] dark:bg-[#1e1f20] border border-slate-200/80 dark:border-white/10 shadow-xs focus-within:border-blue-500/50 transition-all">
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
                placeholder="Ask about flights, sales charts, jobs, weather, or Miro plans..."
                className="w-full resize-none bg-transparent px-4 py-3.5 pr-24 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 outline-none leading-relaxed"
              />

              {/* Action Buttons in Input Box */}
              <div className="absolute right-2.5 bottom-2 flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(true)}
                  className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-white/10 transition-colors cursor-pointer"
                  title="Upload Excel or CSV"
                >
                  <Paperclip className="w-4 h-4" />
                </button>

                {isStreaming ? (
                  <button
                    type="button"
                    onClick={handleStopStream}
                    className="p-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white transition-all shadow-xs cursor-pointer"
                    title="Stop generation"
                  >
                    <Square className="w-4 h-4 fill-white" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleSendMessage()}
                    disabled={!input.trim() && !currentAttachment}
                    className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-slate-900 transition-all shadow-xs cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Send message"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Bottom Disclaimer */}
            <p className="text-[11px] text-center text-slate-400 dark:text-zinc-500 mt-2 select-none">
              Gen UI Best Practice &bull; CopilotKit V2 &amp; Antigravity SDK &bull; User Isolated Sessions
            </p>
          </div>
        </div>
      </div>

      {/* File Upload Modal */}
      {showUploadModal && (
        <FileUploadZone
          onClose={() => setShowUploadModal(false)}
          onFileUploaded={(fileData) => {
            setCurrentAttachment(fileData);
            setShowUploadModal(false);
          }}
        />
      )}
    </div>
  );
}
