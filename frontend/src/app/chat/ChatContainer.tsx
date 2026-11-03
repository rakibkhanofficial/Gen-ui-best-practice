"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useCopilotReadable, useCopilotAction } from "@copilotkit/react-core";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Paperclip,
  ArrowUp,
  Square,
  FileSpreadsheet,
  FileText,
  Image as ImageIcon,
  UploadCloud,
  X,
  Copy,
  Check,
  ThumbsUp,
  ThumbsDown,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Plus,
  Loader2,
  FolderOpen
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
import { ImageAnalysisCard } from "@/components/gen-ui/ImageAnalysisCard";
import { DocumentAnalysisCard } from "@/components/gen-ui/DocumentAnalysisCard";
import { MeetingTimePicker } from "@/components/gen-ui/MeetingTimePicker";

export interface AttachmentInfo {
  filename: string;
  filePath: string;
  fileType: "image" | "document" | "spreadsheet" | "file";
  fileSize?: number;
  previewUrl?: string;
}

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
  attachment?: AttachmentInfo;
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
  const [currentAttachment, setCurrentAttachment] = useState<AttachmentInfo | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Drag and Drop & Native File Picker State
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);

  // CopilotKit Capabilities State
  const [syncStatus, setSyncStatus] = useState<string | null>("Realtime sync connected to Copilot Runtime");
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Continual Learning & Behavioral Memory Store
  const [learnedMemory, setLearnedMemory] = useState<{
    preferredDepartureCity: string;
    preferredCurrency: string;
    skillsLearned: string[];
    interactionCount: number;
  }>({
    preferredDepartureCity: "Dhaka (DAC)",
    preferredCurrency: "USD",
    skillsLearned: [
      "Generative UI Dynamic Mounting",
      "Human-in-the-Loop Safe Authorization",
      "Multi-turn Session URL Routing",
      "Multimodal File & Image Vision Parsing",
    ],
    interactionCount: 1,
  });

  const abortControllerRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const attachMenuRef = useRef<HTMLDivElement>(null);

  // 1. Resolve User Identity
  useEffect(() => {
    if (authStatus === "loading") return;

    if (authStatus === "authenticated" && authSession?.user) {
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
      loadUserLearnedMemory(googleUser.id);
    } else {
      getOrCreateGuestUser().then((guest) => {
        setUser(guest);
        loadUserSessions(guest.id);
        loadUserLearnedMemory(guest.id);
      });
    }
  }, [authStatus, authSession]);

  const loadUserSessions = (userId: string) => {
    try {
      const key = getUserSessionsKey(userId);
      const stored = localStorage.getItem(key);
      if (stored) {
        setSessions(JSON.parse(stored));
      } else {
        setSessions([]);
      }
    } catch {
      setSessions([]);
    }
  };

  const loadUserLearnedMemory = (userId: string) => {
    try {
      const stored = localStorage.getItem(`genui_learning_${userId}`);
      if (stored) {
        setLearnedMemory(JSON.parse(stored));
      }
    } catch {}
  };

  const recordLearnedSkill = useCallback((skillName: string) => {
    setLearnedMemory((prev) => {
      const updated = {
        ...prev,
        skillsLearned: Array.from(new Set([...prev.skillsLearned, skillName])),
        interactionCount: prev.interactionCount + 1,
      };
      if (user) {
        localStorage.setItem(`genui_learning_${user.id}`, JSON.stringify(updated));
      }
      return updated;
    });
  }, [user]);

  // 2. CopilotKit Learning Hook
  useCopilotReadable({
    description: "Active User Profile, Continual Learning Skills, and Workspace Context",
    value: {
      userId: user?.id,
      userName: user?.name,
      userRole: user?.role,
      activeChatId: activeSessionId,
      totalTurnsCount: messages.length,
      learnedMemory: learnedMemory,
    },
  });

  // 3. CopilotKit Realtime Sync Actions
  useCopilotAction({
    name: "syncFlightBooking",
    description: "Synchronize flight booking status in real-time with the flight card component",
    parameters: [
      { name: "flightId", type: "string", description: "Flight ID to book", required: true },
      { name: "passengerName", type: "string", description: "Passenger full name" },
    ],
    handler: async ({ flightId, passengerName }) => {
      setSyncStatus(`Flight ${flightId} booked for ${passengerName || user?.name || "Passenger"} (Realtime Synced)`);
      recordLearnedSkill(`Flight Reservation (${flightId})`);
      return { success: true, flightId, status: "Confirmed" };
    },
  });

  useCopilotAction({
    name: "syncPlanningBoardTask",
    description: "Move or update a sticky note task on the planning board in real-time",
    parameters: [
      { name: "noteId", type: "string", description: "Sticky note ID", required: true },
      { name: "columnId", type: "string", description: "Target column ID (col-todo, col-progress, col-done)", required: true },
    ],
    handler: async ({ noteId, columnId }) => {
      setSyncStatus(`Sprint task ${noteId} moved to ${columnId} in real-time`);
      recordLearnedSkill(`Sprint Planning (${noteId} -> ${columnId})`);
      return { success: true, noteId, columnId };
    },
  });

  useCopilotAction({
    name: "learnUserPreference",
    description: "Record a learned user preference or behavior in CopilotKit Learning memory",
    parameters: [
      { name: "skillName", type: "string", description: "Learned skill or behavior name", required: true },
    ],
    handler: async ({ skillName }) => {
      recordLearnedSkill(skillName);
      setSyncStatus(`Learned: "${skillName}" stored in Copilot memory`);
      return { success: true, skillName };
    },
  });

  useCopilotAction({
    name: "scheduleMeetingSlot",
    description: "Book or reschedule a calendar meeting slot with CopilotKit real-time sync",
    parameters: [
      { name: "slotId", type: "string", description: "Selected slot ID", required: true },
      { name: "date", type: "string", description: "Date of the meeting" },
      { name: "time", type: "string", description: "Time of the meeting" },
    ],
    handler: async ({ slotId, date, time }) => {
      setSyncStatus(`Meeting booked for ${date} at ${time} (Realtime Synced)`);
      recordLearnedSkill(`Calendar Booking (${date} ${time})`);
      return { success: true, slotId, date, time, status: "Confirmed" };
    },
  });

  // 4. CopilotKit Rich Threads Sync
  useEffect(() => {
    if (!activeSessionId) return;
    try {
      fetch("/api/copilotkit/threads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          threadId: activeSessionId,
          metadata: {
            title: sessions.find((s) => s.id === activeSessionId)?.title || "Active Thread",
            userId: user?.id,
            createdAt: Date.now(),
          },
        }),
      }).catch(() => {});
    } catch {}
  }, [activeSessionId, user, sessions]);

  // 5. Native File Upload Handler
  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();

      const isImg = file.type.startsWith("image/") || /\.(png|jpe?g|webp|gif|svg)$/i.test(file.name);
      let localPreviewUrl: string | undefined = undefined;
      if (isImg && typeof window !== "undefined") {
        localPreviewUrl = URL.createObjectURL(file);
      }

      const fileType = isImg
        ? "image"
        : /\.(xlsx|xls|csv)$/i.test(file.name)
        ? "spreadsheet"
        : /\.(pdf|docx?|txt|md)$/i.test(file.name)
        ? "document"
        : "file";

      const attachmentInfo: AttachmentInfo = {
        filename: data.filename || file.name,
        filePath: data.file_path || file.name,
        fileType: fileType,
        fileSize: data.file_size || file.size,
        previewUrl: localPreviewUrl || data.preview_url,
      };

      setCurrentAttachment(attachmentInfo);
      recordLearnedSkill(`Ingested ${fileType.toUpperCase()} (${file.name})`);
    } catch (err: any) {
      console.error("Upload error:", err);
    } finally {
      setIsUploading(false);
      setShowAttachMenu(false);
    }
  };

  // 6. Full Page Dropzone Listeners
  useEffect(() => {
    let dragCounter = 0;

    const handleDragEnter = (e: DragEvent) => {
      e.preventDefault();
      dragCounter++;
      if (e.dataTransfer?.items && e.dataTransfer.items.length > 0) {
        setIsDraggingOver(true);
      }
    };

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      dragCounter--;
      if (dragCounter <= 0) {
        setIsDraggingOver(false);
        dragCounter = 0;
      }
    };

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      if (e.dataTransfer) {
        e.dataTransfer.dropEffect = "copy";
      }
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      setIsDraggingOver(false);
      dragCounter = 0;

      if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
        const file = e.dataTransfer.files[0];
        handleFileUpload(file);
      }
    };

    window.addEventListener("dragenter", handleDragEnter);
    window.addEventListener("dragleave", handleDragLeave);
    window.addEventListener("dragover", handleDragOver);
    window.addEventListener("drop", handleDrop);

    return () => {
      window.removeEventListener("dragenter", handleDragEnter);
      window.removeEventListener("dragleave", handleDragLeave);
      window.removeEventListener("dragover", handleDragOver);
      window.removeEventListener("drop", handleDrop);
    };
  }, []);

  // Close attach menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (attachMenuRef.current && !attachMenuRef.current.contains(e.target as Node)) {
        setShowAttachMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 7. Voice Input (STT) Setup
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        setSpeechSupported(true);
        const recog = new SpeechRecognition();
        recog.continuous = true;
        recog.interimResults = true;
        recog.lang = "en-US";

        recog.onresult = (event: any) => {
          let transcript = "";
          for (let i = event.resultIndex; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript;
          }
          if (transcript.trim()) {
            setInput((prev) => (prev ? `${prev} ${transcript.trim()}` : transcript.trim()));
          }
        };

        recog.onerror = () => setIsListening(false);
        recog.onend = () => setIsListening(false);

        recognitionRef.current = recog;
      }
    }
  }, []);

  const toggleVoiceInput = () => {
    if (!speechSupported || !recognitionRef.current) {
      alert("Speech recognition is supported in Chrome, Edge, and Safari. Please verify microphone permissions.");
      return;
    }

    if (isListening) {
      try {
        recognitionRef.current.stop();
      } catch {}
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch {
        setIsListening(false);
      }
    }
  };

  // 8. Text-to-Speech (TTS) Readout
  const handleSpeakText = (id: string, text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    if (speakingId === id) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[*_#`\[\]]/g, "").trim();
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.onend = () => setSpeakingId(null);
    utterance.onerror = () => setSpeakingId(null);

    setSpeakingId(id);
    window.speechSynthesis.speak(utterance);
  };

  // 9. Load messages when initialChatId or user changes
  useEffect(() => {
    if (!user) return;

    if (initialChatId) {
      setActiveSessionId(initialChatId);
      setActiveChatCookie(initialChatId);

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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isStreaming]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        180
      )}px`;
    }
  }, [input]);

  const saveSessionMessages = (userId: string, sessionId: string, msgs: MessageItem[]) => {
    try {
      localStorage.setItem(
        getUserMessagesKey(userId, sessionId),
        JSON.stringify(msgs)
      );
    } catch {}
  };

  const saveSessionsList = (userId: string, list: ChatSession[]) => {
    try {
      localStorage.setItem(getUserSessionsKey(userId), JSON.stringify(list));
    } catch {}
  };

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

  const handleNewChat = () => {
    setActiveSessionId(null);
    setMessages([]);
    setInput("");
    setCurrentAttachment(null);
    router.push("/chat");
  };

  const deleteSession = (sessionId: string) => {
    if (!user) return;
    const filtered = sessions.filter((s) => s.id !== sessionId);
    setSessions(filtered);
    saveSessionsList(user.id, filtered);

    try {
      localStorage.removeItem(getUserMessagesKey(user.id, sessionId));
      fetch(`http://localhost:8000/api/chat/sessions/${sessionId}?user_id=${user.id}`, {
        method: "DELETE",
      }).catch(() => {});
    } catch {}

    if (activeSessionId === sessionId) {
      handleNewChat();
    }
  };

  const renameSession = (sessionId: string, newTitle: string) => {
    if (!user) return;
    const updated = sessions.map((s) =>
      s.id === sessionId ? { ...s, title: newTitle, updatedAt: Date.now() } : s
    );
    setSessions(updated);
    saveSessionsList(user.id, updated);
  };

  const handleLogout = () => {
    if (user?.role === "google") {
      signOut({ callbackUrl: "/login" });
    } else {
      clearGuestSession();
      router.replace("/login");
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleStopStream = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsStreaming(false);
  };

  // 10. Send message with immediate optimistic URL creation
  const handleSendMessage = async (textToSend?: string) => {
    const messageContent = (textToSend || input).trim();
    if (!messageContent && !currentAttachment) return;
    if (isStreaming) return;
    if (!user) return;

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    let currentSessionId = activeSessionId;

    if (!currentSessionId) {
      currentSessionId = generateChatId();
      setActiveSessionId(currentSessionId);
      setActiveChatCookie(currentSessionId);

      window.history.pushState(null, "", `/chat/${currentSessionId}`);

      const titleCandidate =
        messageContent.length > 34
          ? `${messageContent.slice(0, 32)}...`
          : messageContent || (currentAttachment ? `Attached: ${currentAttachment.filename}` : "New Chat");

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

    // 11. Create User Turn with Attachment Info
    const userTurnId = `conv_user_${Date.now()}`;
    const userMessage: MessageItem = {
      id: userTurnId,
      sessionId: currentSessionId,
      role: "user",
      content: messageContent,
      attachment: currentAttachment ? { ...currentAttachment } : undefined,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

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

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
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

        if (evt === "status" || evt === "stage" || parsed.stage) {
          if (parsed.stage) activeStage = parsed.stage as AgentStage;
          if (parsed.detail) activeStageDetail = parsed.detail;
          if (parsed.sources && Array.isArray(parsed.sources)) {
            activeSources = parsed.sources;
          }
        }

        if (evt === "delta" || evt === "text_delta" || parsed.text || parsed.delta) {
          const deltaText = parsed.text ?? parsed.delta ?? "";
          accumulatedContent += deltaText;
        }

        if (evt === "genui" || parsed.genui || parsed.tool) {
          latestGenUI = {
            tool: parsed.tool || parsed.genui?.tool,
            data: parsed.data || parsed.genui?.data,
          };
        }

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

  // 12. Component Registry (All GenUI components including image and document analysis)
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
      case "analyze_image":
        return <ImageAnalysisCard data={genui.data} />;
      case "analyze_document":
        return <DocumentAnalysisCard data={genui.data} />;
      case "schedule_meeting":
      case "pick_meeting_time":
        return <MeetingTimePicker data={genui.data} />;
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
    <div className="flex h-screen w-screen overflow-hidden bg-white dark:bg-[#131314] text-slate-800 dark:text-[#e3e3e3] font-sans antialiased relative">
      {/* 1. Left Sidebar */}
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
          syncStatus={syncStatus}
          learnedCount={learnedMemory.skillsLearned.length}
        />

        {/* Message Stream Scroll Area */}
        <div className="flex-1 overflow-y-auto px-4 md:px-6 lg:px-8 py-4 space-y-6">
          {messages.length === 0 ? (
            <GeminiEmptyState
              userName={user?.name || "Explorer"}
              input={input}
              setInput={setInput}
              onSendMessage={(prompt?: string) => handleSendMessage(prompt)}
              onOpenUpload={() => setShowAttachMenu(true)}
              onToggleVoice={toggleVoiceInput}
              isListening={isListening}
              onAttachImage={() => imageInputRef.current?.click()}
              onAttachDoc={() => docInputRef.current?.click()}
              currentAttachment={currentAttachment}
              onRemoveAttachment={() => setCurrentAttachment(null)}
              isUploading={isUploading}
              onBrowseGallery={() =>
                handleSendMessage("Show me interactive Gen UI showcases for flights, sales, kanban, and jobs")
              }
            />
          ) : (
            <div className="max-w-3xl mx-auto space-y-6 pb-28">
              {messages.map((msg) => (
                <div key={msg.id} className="space-y-3">
                  {msg.role === "user" ? (
                    /* User Turn */
                    <div className="flex justify-end">
                      <div className="max-w-[85%] md:max-w-[75%] rounded-2xl px-4 py-3 bg-[#f0f4f9] dark:bg-[#282a2c] text-slate-900 dark:text-white text-sm">
                        {/* Render Attached File if present */}
                        {msg.attachment && (
                          <div className="mb-2 p-2 rounded-xl bg-white/80 dark:bg-black/30 border border-slate-200/80 dark:border-white/10 flex items-center gap-2.5">
                            {msg.attachment.fileType === "image" && msg.attachment.previewUrl ? (
                              /* eslint-disable-next-line @next/next/no-img-element */
                              <img
                                src={msg.attachment.previewUrl}
                                alt={msg.attachment.filename}
                                className="w-12 h-12 object-cover rounded-lg border border-slate-200 dark:border-white/10 shrink-0"
                              />
                            ) : msg.attachment.fileType === "spreadsheet" ? (
                              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                                <FileSpreadsheet className="w-5 h-5" />
                              </div>
                            ) : (
                              <div className="w-9 h-9 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                                <FileText className="w-5 h-5" />
                              </div>
                            )}

                            <div className="truncate flex-1">
                              <span className="font-semibold text-xs text-slate-900 dark:text-white block truncate">
                                {msg.attachment.filename}
                              </span>
                              <span className="text-[10px] text-slate-500 dark:text-zinc-400 font-mono block">
                                {msg.attachment.fileSize
                                  ? `${Math.round(msg.attachment.fileSize / 1024)} KB`
                                  : msg.attachment.fileType.toUpperCase()}
                              </span>
                            </div>
                          </div>
                        )}
                        {msg.content && <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>}
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
                              onClick={() => handleSpeakText(msg.id, msg.content)}
                              className={`p-1 rounded transition-colors cursor-pointer ${
                                speakingId === msg.id
                                  ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-white/10"
                                  : "hover:bg-slate-100 dark:hover:bg-white/5"
                              }`}
                              title={speakingId === msg.id ? "Stop voice readout" : "Listen to response"}
                            >
                              {speakingId === msg.id ? (
                                <VolumeX className="w-3.5 h-3.5 animate-pulse text-blue-500" />
                              ) : (
                                <Volume2 className="w-3.5 h-3.5" />
                              )}
                            </button>

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

        {/* 3. Bottom Prompt Input Bar with Plus Attachment Button - Rendered only when messages exist */}
        {messages.length > 0 && (
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-white via-white/90 dark:from-[#131314] dark:via-[#131314]/90 to-transparent pointer-events-none">
            <div className="max-w-3xl mx-auto pointer-events-auto">
            {/* Active Attachment Pill above Input */}
            {currentAttachment && (
              <div className="flex items-center gap-2 mb-2 p-1.5 pr-2.5 rounded-2xl bg-white dark:bg-[#1e1f20] border border-slate-200 dark:border-white/10 w-fit text-xs text-slate-800 dark:text-zinc-200 shadow-sm animate-in fade-in slide-in-from-bottom-1">
                {currentAttachment.fileType === "image" && currentAttachment.previewUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={currentAttachment.previewUrl}
                    alt={currentAttachment.filename}
                    className="w-8 h-8 rounded-xl object-cover border border-slate-200 dark:border-white/10 shrink-0"
                  />
                ) : currentAttachment.fileType === "spreadsheet" ? (
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <FileSpreadsheet className="w-4 h-4" />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                )}

                <div className="truncate max-w-xs">
                  <span className="font-semibold text-xs block truncate">{currentAttachment.filename}</span>
                  <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-mono block">
                    {currentAttachment.fileSize
                      ? `${Math.round(currentAttachment.fileSize / 1024)} KB`
                      : currentAttachment.fileType.toUpperCase()}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setCurrentAttachment(null)}
                  className="p-1 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full cursor-pointer ml-1 text-slate-400 hover:text-slate-700 dark:hover:text-white"
                  title="Remove attachment"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Input Box with Plus (+) File Selector & Subtle Ambient Glow */}
            <div className="relative group">
              <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-amber-400/30 via-rose-400/25 to-blue-500/30 blur-xs opacity-0 group-focus-within:opacity-100 transition-opacity duration-200 pointer-events-none" />
              <div
                className={`relative rounded-2xl bg-white dark:bg-[#1e1f20] border transition-all ${
                  isListening
                    ? "border-rose-500/80 ring-2 ring-rose-500/20 shadow-md shadow-rose-500/10"
                    : "border-slate-200/90 dark:border-white/10 shadow-xs focus-within:border-blue-500/40"
                }`}
              >
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
                placeholder={
                  isListening
                    ? "Listening... speak now into your microphone"
                    : "Ask about flights, sales charts, jobs, weather, or drop any image / document..."
                }
                className="w-full resize-none bg-transparent px-4 py-3.5 pl-12 pr-28 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 outline-none leading-relaxed"
              />

              {/* Left: Plus (+) Button for Direct Native File & Gallery Picker */}
              <div ref={attachMenuRef} className="absolute left-2.5 bottom-2.5">
                <button
                  type="button"
                  onClick={() => setShowAttachMenu(!showAttachMenu)}
                  disabled={isUploading}
                  className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                    showAttachMenu
                      ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs"
                      : "text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-white/10"
                  }`}
                  title="Add files (Image Gallery or System File Manager)"
                >
                  {isUploading ? (
                    <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                  ) : (
                    <Plus className={`w-4 h-4 transition-transform duration-200 ${showAttachMenu ? "rotate-45" : ""}`} />
                  )}
                </button>

                {/* Floating Native Picker Selector Menu (Zero Drawer/Modal) */}
                <AnimatePresence>
                  {showAttachMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 6, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.96 }}
                      transition={{ duration: 0.15 }}
                      className="absolute bottom-10 left-0 z-40 w-60 p-1.5 rounded-2xl bg-white dark:bg-[#1e1f20] border border-slate-200/90 dark:border-white/10 shadow-xl space-y-1"
                    >
                      {/* Option 1: Image / Gallery (Native device photo picker) */}
                      <button
                        type="button"
                        onClick={() => {
                          imageInputRef.current?.click();
                          setShowAttachMenu(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-xs font-medium text-slate-700 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-white/5 cursor-pointer transition-colors"
                      >
                        <div className="w-7 h-7 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                          <ImageIcon className="w-4 h-4" />
                        </div>
                        <div className="truncate">
                          <span className="block font-semibold">Image &amp; Gallery</span>
                          <span className="block text-[10px] text-slate-400 dark:text-zinc-500 font-normal">
                            Photo gallery &bull; PNG, JPG, WEBP
                          </span>
                        </div>
                      </button>

                      {/* Option 2: System File Manager (Native OS file picker) */}
                      <button
                        type="button"
                        onClick={() => {
                          docInputRef.current?.click();
                          setShowAttachMenu(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-xs font-medium text-slate-700 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-white/5 cursor-pointer transition-colors"
                      >
                        <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                          <FolderOpen className="w-4 h-4" />
                        </div>
                        <div className="truncate">
                          <span className="block font-semibold">System File Manager</span>
                          <span className="block text-[10px] text-slate-400 dark:text-zinc-500 font-normal">
                            PDF, Word, Excel, CSV, TXT
                          </span>
                        </div>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Hidden Native File Inputs */}
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.[0]) handleFileUpload(e.target.files[0]);
                    e.target.value = "";
                  }}
                />
                <input
                  ref={docInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx,.xlsx,.xls,.csv,.txt,.md,.json"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.[0]) handleFileUpload(e.target.files[0]);
                    e.target.value = "";
                  }}
                />
              </div>

              {/* Right: Voice Input + Send Button */}
              <div className="absolute right-2.5 bottom-2 flex items-center gap-1.5">
                {/* Voice Input Microphone Button */}
                <button
                  type="button"
                  onClick={toggleVoiceInput}
                  className={`p-2 rounded-xl transition-all cursor-pointer ${
                    isListening
                      ? "bg-rose-500 text-white animate-pulse shadow-md shadow-rose-500/30"
                      : "text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-white/10"
                  }`}
                  title={isListening ? "Stop listening" : "Start voice input (Speech-to-Text)"}
                >
                  {isListening ? (
                    <MicOff className="w-4 h-4 text-white" />
                  ) : (
                    <Mic className="w-4 h-4" />
                  )}
                </button>

                {/* Send / Stop Streaming Button */}
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
            </div>

            {/* Bottom Disclaimer */}
            <p className="text-[11px] text-center text-slate-400 dark:text-zinc-500 mt-2 select-none">
              Full Page Drag &amp; Drop &bull; Native Gallery / File Manager &bull; Multimodal GenUI
            </p>
          </div>
        </div>
        )}
      </div>

      {/* 4. Full Page Drag and Drop Overlay */}
      <AnimatePresence>
        {isDraggingOver && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 backdrop-blur-md bg-blue-600/10 dark:bg-blue-900/25 border-4 border-dashed border-blue-500/70 flex flex-col items-center justify-center pointer-events-none p-6"
          >
            <motion.div
              initial={{ scale: 0.85, y: 12 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.85, y: 12 }}
              className="p-8 rounded-3xl bg-white/95 dark:bg-[#1e1f20]/95 border border-slate-200 dark:border-white/10 shadow-2xl flex flex-col items-center text-center max-w-sm"
            >
              <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/30 mb-4 animate-bounce">
                <UploadCloud className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Drop your file to analyze
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1.5 leading-relaxed">
                Release anywhere to attach Images (PNG, JPG), Documents (PDF, DOCX), or Spreadsheets (Excel, CSV).
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
