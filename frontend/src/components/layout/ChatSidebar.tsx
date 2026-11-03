"use client";

import React, { useState } from "react";
import {
  Plus,
  MessageSquare,
  Search,
  Trash2,
  Edit2,
  Check,
  X,
  LogOut,
  PanelLeftClose,
  SlidersHorizontal,
  Clock,
  LayoutGrid,
  Sparkles,
  ChevronRight,
  Bell,
  Settings,
  Command,
  ExternalLink,
  ChevronDown
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { UserSession } from "@/lib/auth";

export interface ChatSession {
  id: string; // The session_id
  title: string;
  createdAt: number;
  updatedAt: number;
  turnsCount?: number;
  userId?: string;
  userType?: "guest" | "google";
}

interface ChatSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  sessions: ChatSession[];
  activeSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewSession: () => void;
  onDeleteSession: (id: string) => void;
  onRenameSession: (id: string, newTitle: string) => void;
  user: UserSession | null;
  onLogout: () => void;
}

export function ChatSidebar({
  isOpen,
  onToggle,
  sessions,
  activeSessionId,
  onSelectSession,
  onNewSession,
  onDeleteSession,
  onRenameSession,
  user,
  onLogout,
}: ChatSidebarProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showHistory, setShowHistory] = useState(true);
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [activeTab, setActiveTab] = useState<"new_app" | "playground" | "history" | "my_apps" | "gallery">("new_app");

  // Modals for Google AI Studio bottom icons
  const [activeModal, setActiveModal] = useState<"notifications" | "settings" | "shortcuts" | null>(null);

  const startEditing = (session: ChatSession, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(session.id);
    setEditTitle(session.title);
  };

  const saveEditing = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (editTitle.trim()) {
      onRenameSession(id, editTitle.trim());
    }
    setEditingId(null);
  };

  const cancelEditing = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(null);
  };

  // Filter sessions by search query
  const filteredSessions = searchQuery.trim()
    ? sessions.filter((s) =>
        s.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : sessions;

  // Group sessions by recency
  const now = Date.now();
  const oneDay = 24 * 60 * 60 * 1000;
  const groups: { [key: string]: ChatSession[] } = {
    Today: [],
    Yesterday: [],
    "Previous 7 Days": [],
    Older: [],
  };

  filteredSessions.forEach((s) => {
    const diff = now - s.updatedAt;
    if (diff < oneDay) {
      groups.Today.push(s);
    } else if (diff < 2 * oneDay) {
      groups.Yesterday.push(s);
    } else if (diff < 7 * oneDay) {
      groups["Previous 7 Days"].push(s);
    } else {
      groups.Older.push(s);
    }
  });

  // Authentic display name & handle matching Image 2 ("khanrakib218... PRO")
  const userHandle = user?.email
    ? user.email.length > 15
      ? `${user.email.slice(0, 13)}...`
      : user.email
    : user?.name
    ? user.name.toLowerCase().replace(/\s+/g, "")
    : "khanrakib218...";

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onToggle}
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-30 lg:hidden"
        />
      )}

      {/* Clean Minimal Sidebar matching Google AI Studio Image 2 */}
      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-40 flex flex-col transition-all duration-300 ease-in-out select-none overflow-hidden
          ${
            isOpen
              ? "w-64 translate-x-0 opacity-100 border-r border-slate-200/80 dark:border-white/10"
              : "w-0 -translate-x-full lg:translate-x-0 lg:w-0 lg:opacity-0 lg:pointer-events-none border-r-0"
          }
          bg-[#f8f9fa] dark:bg-[#131314] text-slate-800 dark:text-[#e3e3e3]
        `}
      >
        {/* Fixed Width Inner Wrapper to Prevent Text Squishing / Layout Glitches during Collapse */}
        <div className="w-64 h-full flex flex-col shrink-0">
          {/* 1. Google AI Studio Brand Header */}
          <div className="h-14 px-4 flex items-center justify-between border-b border-slate-200/60 dark:border-white/5 shrink-0">
            <div className="flex items-center gap-2.5 overflow-hidden">
              {/* 4-point Gemini Sparkle Logo */}
              <div className="w-6 h-6 flex items-center justify-center shrink-0">
                <svg
                  className="w-5 h-5 text-[#1a73e8] dark:text-[#8ab4f8] fill-current"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 0C12 6.627 6.627 12 0 12C6.627 12 12 17.373 12 24C12 17.373 17.373 12 24 12C17.373 12 12 6.627 12 0Z" />
                </svg>
              </div>
              <span className="font-medium text-sm tracking-tight text-slate-900 dark:text-white truncate">
                Google AI Studio
              </span>
            </div>

            <button
              onClick={onToggle}
              className="p-1.5 rounded-lg hover:bg-slate-200/70 dark:hover:bg-white/10 text-slate-500 dark:text-zinc-400 transition-colors cursor-pointer shrink-0"
              title="Collapse sidebar"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          </div>

          {/* 2. Navigation Sections */}
          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-5 text-xs font-sans">
            {/* EXPLORE Section */}
            <div className="space-y-1">
              <div className="px-2.5 py-1 text-[10px] font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
                Explore
              </div>

              <button
                onClick={() => {
                  setActiveTab("playground");
                  onNewSession();
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left font-normal transition-colors cursor-pointer ${
                  activeTab === "playground"
                    ? "bg-slate-200/70 dark:bg-white/10 text-slate-900 dark:text-white font-medium"
                    : "text-slate-700 dark:text-zinc-300 hover:bg-slate-200/50 dark:hover:bg-white/5"
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500 dark:text-zinc-400 shrink-0" />
                <span>Playground</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab("history");
                  setShowHistory(!showHistory);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left font-normal transition-colors cursor-pointer ${
                  activeTab === "history"
                    ? "bg-slate-200/70 dark:bg-white/10 text-slate-900 dark:text-white font-medium"
                    : "text-slate-700 dark:text-zinc-300 hover:bg-slate-200/50 dark:hover:bg-white/5"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Clock className="w-3.5 h-3.5 text-slate-500 dark:text-zinc-400 shrink-0" />
                  <span>History</span>
                </div>
                {sessions.length > 0 && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-zinc-400 font-mono">
                    {sessions.length}
                  </span>
                )}
              </button>
            </div>

            {/* BUILD Section with Google AI Studio Active Pill */}
            <div className="space-y-1">
              <div className="px-2.5 py-1 text-[10px] font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
                Build
              </div>

              {/* + New App (Active pill button matching Image 2) */}
              <button
                onClick={() => {
                  setActiveTab("new_app");
                  onNewSession();
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-full bg-slate-200/90 dark:bg-white/10 text-slate-900 dark:text-white font-medium text-xs transition-all cursor-pointer shadow-2xs hover:bg-slate-300/80 dark:hover:bg-white/15"
              >
                <Plus className="w-3.5 h-3.5 shrink-0 stroke-[2.2]" />
                <span>New app</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab("my_apps");
                  setShowHistory(true);
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left font-normal transition-colors cursor-pointer ${
                  activeTab === "my_apps"
                    ? "bg-slate-200/70 dark:bg-white/10 text-slate-900 dark:text-white font-medium"
                    : "text-slate-700 dark:text-zinc-300 hover:bg-slate-200/50 dark:hover:bg-white/5"
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5 text-slate-500 dark:text-zinc-400 shrink-0" />
                <span>My apps</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab("gallery");
                  onNewSession();
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left font-normal transition-colors cursor-pointer ${
                  activeTab === "gallery"
                    ? "bg-slate-200/70 dark:bg-white/10 text-slate-900 dark:text-white font-medium"
                    : "text-slate-700 dark:text-zinc-300 hover:bg-slate-200/50 dark:hover:bg-white/5"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                <span>Gallery</span>
              </button>
            </div>

            {/* Sessions History List inside History / My apps */}
            {showHistory && sessions.length > 0 && (
              <div className="pt-1 border-t border-slate-200/60 dark:border-white/5 space-y-3">
                {/* Search Bar */}
                {showSearchInput && (
                  <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#1a1b1c] border border-slate-200/80 dark:border-white/10 text-xs">
                    <Search className="w-3 h-3 text-slate-400 shrink-0" />
                    <input
                      type="text"
                      placeholder="Filter sessions..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-transparent text-slate-900 dark:text-white outline-none placeholder:text-slate-400 text-xs"
                      autoFocus
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery("")}
                        className="p-0.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                )}

                {Object.entries(groups).map(([groupTitle, groupSessions]) => {
                  if (groupSessions.length === 0) return null;
                  return (
                    <div key={groupTitle} className="space-y-0.5">
                      <div className="px-2 py-0.5 text-[9px] font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
                        {groupTitle}
                      </div>
                      {groupSessions.map((session) => {
                        const isActive = session.id === activeSessionId;
                        const isEditing = editingId === session.id;

                        return (
                          <div
                            key={session.id}
                            onClick={() => onSelectSession(session.id)}
                            className={`group relative flex items-center justify-between px-2.5 py-1.5 rounded-lg cursor-pointer transition-all ${
                              isActive
                                ? "bg-slate-200/80 dark:bg-white/10 text-slate-900 dark:text-white font-medium"
                                : "text-slate-600 dark:text-zinc-400 hover:bg-slate-200/40 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white"
                            }`}
                          >
                            <div className="flex items-center gap-2 overflow-hidden flex-1 mr-1">
                              <MessageSquare
                                className={`w-3 h-3 shrink-0 ${
                                  isActive
                                    ? "text-blue-600 dark:text-blue-400"
                                    : "opacity-50"
                                }`}
                              />

                              {isEditing ? (
                                <input
                                  type="text"
                                  value={editTitle}
                                  onChange={(e) => setEditTitle(e.target.value)}
                                  onClick={(e) => e.stopPropagation()}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter")
                                      saveEditing(session.id, e as any);
                                    if (e.key === "Escape")
                                      cancelEditing(e as any);
                                  }}
                                  autoFocus
                                  className="w-full bg-white dark:bg-black/50 px-1 py-0.5 rounded text-xs border border-blue-500 outline-none text-slate-900 dark:text-white"
                                />
                              ) : (
                                <span className="truncate block text-xs">
                                  {session.title}
                                </span>
                              )}
                            </div>

                            {/* Action buttons on hover */}
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                              {isEditing ? (
                                <>
                                  <button
                                    onClick={(e) => saveEditing(session.id, e)}
                                    className="p-1 hover:text-emerald-500 cursor-pointer"
                                    title="Save"
                                  >
                                    <Check className="w-3 h-3" />
                                  </button>
                                  <button
                                    onClick={cancelEditing}
                                    className="p-1 hover:text-rose-500 cursor-pointer"
                                    title="Cancel"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    onClick={(e) => startEditing(session, e)}
                                    className="p-1 hover:text-blue-500 cursor-pointer"
                                    title="Rename"
                                  >
                                    <Edit2 className="w-2.5 h-2.5" />
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onDeleteSession(session.id);
                                    }}
                                    className="p-1 hover:text-rose-500 cursor-pointer"
                                    title="Delete"
                                  >
                                    <Trash2 className="w-2.5 h-2.5" />
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            )}

            {/* MANAGE Section matching Image 2 */}
            <div className="space-y-1 pt-1 border-t border-slate-200/60 dark:border-white/5">
              <div className="px-2.5 py-1 text-[10px] font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
                Manage
              </div>

              <a
                href="#dashboard"
                onClick={(e) => {
                  e.preventDefault();
                  setActiveModal("settings");
                }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-slate-700 dark:text-zinc-300 hover:bg-slate-200/50 dark:hover:bg-white/5 transition-colors cursor-pointer"
              >
                <span>Dashboard</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500" />
              </a>

              <a
                href="https://copilotkit.ai"
                target="_blank"
                rel="noreferrer"
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-slate-700 dark:text-zinc-300 hover:bg-slate-200/50 dark:hover:bg-white/5 transition-colors cursor-pointer"
              >
                <span>Documentation</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500" />
              </a>
            </div>
          </div>

          {/* 3. Bottom 4 Icons Row matching Image 2 (Bell, Settings, Search, Shortcuts) */}
          <div className="px-3 py-2 border-t border-slate-200/60 dark:border-white/5 shrink-0 flex items-center justify-between text-slate-500 dark:text-zinc-400">
            <button
              onClick={() => setActiveModal(activeModal === "notifications" ? null : "notifications")}
              className="p-1.5 rounded-lg hover:bg-slate-200/70 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer relative"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 absolute top-1 right-1" />
            </button>

            <button
              onClick={() => setActiveModal(activeModal === "settings" ? null : "settings")}
              className="p-1.5 rounded-lg hover:bg-slate-200/70 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
              title="Settings"
            >
              <Settings className="w-4 h-4" />
            </button>

            <button
              onClick={() => setShowSearchInput(!showSearchInput)}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                showSearchInput
                  ? "bg-slate-200 dark:bg-white/10 text-slate-900 dark:text-white"
                  : "hover:bg-slate-200/70 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white"
              }`}
              title="Search Sessions"
            >
              <Search className="w-4 h-4" />
            </button>

            <button
              onClick={() => setActiveModal(activeModal === "shortcuts" ? null : "shortcuts")}
              className="p-1.5 rounded-lg hover:bg-slate-200/70 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
              title="Keyboard Shortcuts"
            >
              <Command className="w-4 h-4" />
            </button>
          </div>

          {/* 4. User Profile Card matching Image 2 ("khanrakib218... PRO") */}
          <div className="p-3 pt-1 border-t border-slate-200/60 dark:border-white/5 shrink-0 bg-[#f8f9fa] dark:bg-[#131314]">
            <div className="flex items-center justify-between px-2.5 py-2 rounded-xl bg-white dark:bg-[#1a1b1c] border border-slate-200/70 dark:border-white/5 shadow-2xs">
              <div className="flex items-center gap-2 overflow-hidden">
                {/* Circular Avatar with authentic Google green styling */}
                <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-medium flex items-center justify-center text-[11px] shrink-0 border border-emerald-500/30">
                  {userHandle.charAt(0).toUpperCase()}
                </div>
                <div className="truncate text-xs font-normal text-slate-800 dark:text-zinc-200">
                  {userHandle}
                </div>
              </div>

              {/* PRO Badge Pill matching Image 2 */}
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-[10px] font-semibold tracking-wider px-1.5 py-0.5 rounded bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-zinc-300">
                  PRO
                </span>
                <button
                  onClick={onLogout}
                  className="p-1 text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                  title="Sign out"
                >
                  <LogOut className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Floating Modals for Notifications / Settings / Shortcuts */}
      <AnimatePresence>
        {activeModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4"
            onClick={() => setActiveModal(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm rounded-2xl bg-white dark:bg-[#1e1f20] border border-slate-200 dark:border-white/10 p-5 shadow-2xl font-sans"
            >
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100 dark:border-white/5">
                <h3 className="font-semibold text-sm text-slate-900 dark:text-white capitalize">
                  {activeModal}
                </h3>
                <button
                  onClick={() => setActiveModal(null)}
                  className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {activeModal === "notifications" && (
                <div className="space-y-2 text-xs text-slate-600 dark:text-zinc-300">
                  <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/40">
                    <p className="font-semibold text-blue-700 dark:text-blue-300">
                      Gemini 4 Argon &amp; Antigravity Online
                    </p>
                    <p className="text-[11px] mt-0.5 text-blue-600 dark:text-blue-400">
                      CopilotKit Runtime connected with full-page Drag &amp; Drop dropzone and Multimodal tool calling.
                    </p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                    <p className="font-semibold">All 14 GenUI Tools Active</p>
                    <p className="text-[11px] mt-0.5 text-slate-500">
                      Flights, sales, weather, code studio, documents, and interactive canvases are ready.
                    </p>
                  </div>
                </div>
              )}

              {activeModal === "settings" && (
                <div className="space-y-3 text-xs text-slate-700 dark:text-zinc-300">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      DEFAULT MODEL
                    </label>
                    <div className="p-2 rounded-xl bg-slate-100 dark:bg-white/5 font-mono text-[11px]">
                      gemini-3.8-flash (Argon Engine)
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      SYNC ARCHITECTURE
                    </label>
                    <div className="p-2 rounded-xl bg-slate-100 dark:bg-white/5 text-[11px]">
                      Bidirectional CopilotKit SSE + Antigravity Multi-turn Agent
                    </div>
                  </div>
                </div>
              )}

              {activeModal === "shortcuts" && (
                <div className="space-y-2 text-xs text-slate-700 dark:text-zinc-300">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-white/5">
                    <span>New Chat / App</span>
                    <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-white/10 font-mono text-[10px]">
                      ⌘ K
                    </kbd>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-white/5">
                    <span>Send Message</span>
                    <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-white/10 font-mono text-[10px]">
                      Enter
                    </kbd>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-white/5">
                    <span>Multi-line Input</span>
                    <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-white/10 font-mono text-[10px]">
                      Shift + Enter
                    </kbd>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
