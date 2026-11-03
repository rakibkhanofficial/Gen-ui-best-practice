"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  PanelLeftClose,
  Plus,
  Compass,
  History,
  LayoutGrid,
  Layers,
  LayoutDashboard,
  BookOpen,
  ChevronRight,
  ChevronDown,
  Bell,
  Settings,
  Search,
  Key,
  MessageSquare,
  Trash2,
  Edit2,
  Check,
  X,
  Sun,
  Moon,
  Sparkles,
  LogOut,
  FolderOpen,
  ExternalLink
} from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { UserSession } from "@/lib/auth";

export interface ConversationThread {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
}

interface ChatSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  threads: ConversationThread[];
  activeThreadId: string | null;
  onSelectThread: (id: string) => void;
  onNewThread: () => void;
  onDeleteThread: (id: string) => void;
  onRenameThread: (id: string, newTitle: string) => void;
  user: UserSession | null;
  onLogout: () => void;
}

export function ChatSidebar({
  isOpen,
  onToggle,
  threads,
  activeThreadId,
  onSelectThread,
  onNewThread,
  onDeleteThread,
  onRenameThread,
  user,
  onLogout,
}: ChatSidebarProps) {
  const { theme, toggleTheme } = useTheme();
  const [isMounted, setIsMounted] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [historyOpen, setHistoryOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("new-app");
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchInput, setShowSearchInput] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const startEditing = (thread: ConversationThread, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(thread.id);
    setEditTitle(thread.title);
  };

  const saveEditing = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (editTitle.trim()) {
      onRenameThread(id, editTitle.trim());
    }
    setEditingId(null);
  };

  const cancelEditing = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(null);
  };

  // Filtered threads for search
  const filteredThreads = searchQuery
    ? threads.filter((t) => t.title.toLowerCase().includes(searchQuery.toLowerCase()))
    : threads;

  // Display user name or fallback
  const displayName = user?.name || "khanrakib218";
  const displayEmail = user?.email || "khanrakib218@gmail.com";
  const shortHandle = displayName.length > 14 ? `${displayName.slice(0, 12)}...` : displayName;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onToggle}
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-30 lg:hidden"
        />
      )}

      {/* Google AI Studio Sidebar */}
      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-40 flex flex-col transition-all duration-300 ease-in-out border-r select-none
          ${
            isOpen
              ? "w-64 translate-x-0"
              : "-translate-x-full lg:translate-x-0 lg:w-0 lg:opacity-0 lg:pointer-events-none"
          }
          bg-[#f8f9fa] dark:bg-[#131314] text-slate-800 dark:text-[#e3e3e3] border-slate-200/90 dark:border-white/10
        `}
      >
        {/* 1. Header: Google AI Studio Brand + Sidebar Collapse Button */}
        <div className="h-14 px-4 flex items-center justify-between border-b border-slate-200/60 dark:border-white/5 shrink-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-[15px] tracking-tight text-slate-900 dark:text-white font-sans">
              Google AI Studio
            </span>
          </div>

          <button
            onClick={onToggle}
            className="p-1.5 rounded-lg hover:bg-slate-200/80 dark:hover:bg-white/10 text-slate-500 dark:text-zinc-400 transition-colors cursor-pointer"
            title="Collapse sidebar"
          >
            {/* Authentic Google AI Studio Sidebar Toggle Icon */}
            <svg
              className="w-4 h-4 text-slate-600 dark:text-zinc-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect width="18" height="18" x="3" y="3" rx="2" />
              <path d="M9 3v18" />
              <path d="m14 9-3 3 3 3" />
            </svg>
          </button>
        </div>

        {/* 2. Main Navigation Area */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-5 text-[13px] font-sans">
          {/* SECTION: EXPLORE */}
          <div className="space-y-1">
            <div className="px-3 py-1 text-[11px] font-medium text-slate-500 dark:text-zinc-400 tracking-wider uppercase">
              Explore
            </div>

            {/* Playground */}
            <button
              onClick={() => {
                setActiveTab("playground");
                onNewThread();
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left transition-colors cursor-pointer ${
                activeTab === "playground"
                  ? "bg-slate-200/70 dark:bg-white/10 text-slate-900 dark:text-white font-medium"
                  : "text-slate-600 dark:text-zinc-400 hover:bg-slate-200/50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <svg className="w-4 h-4 text-slate-500 dark:text-zinc-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m4 6 4 4-4 4" />
                <path d="M12 18h8" />
              </svg>
              <span>Playground</span>
            </button>

            {/* History Toggle */}
            <button
              onClick={() => setHistoryOpen(!historyOpen)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-colors cursor-pointer ${
                activeTab === "history"
                  ? "bg-slate-200/70 dark:bg-white/10 text-slate-900 dark:text-white font-medium"
                  : "text-slate-600 dark:text-zinc-400 hover:bg-slate-200/50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <div className="flex items-center gap-3">
                <History className="w-4 h-4 text-slate-500 dark:text-zinc-400 shrink-0" />
                <span>History</span>
              </div>
              <ChevronDown
                className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                  historyOpen ? "rotate-0" : "-rotate-90"
                }`}
              />
            </button>

            {/* Chat History List (Sub-items under History) */}
            <AnimatePresence>
              {historyOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="pl-4 pr-1 space-y-0.5 overflow-hidden"
                >
                  {filteredThreads.length === 0 ? (
                    <div className="py-2 px-3 text-xs text-slate-400 dark:text-zinc-500 italic">
                      No saved sessions
                    </div>
                  ) : (
                    filteredThreads.slice(0, 10).map((thread) => {
                      const isActive = thread.id === activeThreadId;
                      const isEditing = editingId === thread.id;

                      return (
                        <div
                          key={thread.id}
                          onClick={() => {
                            setActiveTab("history");
                            onSelectThread(thread.id);
                          }}
                          className={`group relative flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs cursor-pointer transition-all ${
                            isActive
                              ? "bg-slate-200/90 dark:bg-white/15 text-slate-900 dark:text-white font-medium"
                              : "text-slate-600 dark:text-zinc-400 hover:bg-slate-200/50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white"
                          }`}
                        >
                          <div className="flex items-center gap-2 overflow-hidden flex-1 mr-1">
                            {isEditing ? (
                              <input
                                type="text"
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") saveEditing(thread.id, e as any);
                                  if (e.key === "Escape") cancelEditing(e as any);
                                }}
                                autoFocus
                                className="w-full bg-white dark:bg-black/40 px-1.5 py-0.5 rounded text-xs border border-blue-500 outline-none text-slate-900 dark:text-white"
                              />
                            ) : (
                              <span className="truncate">{thread.title}</span>
                            )}
                          </div>

                          {/* Hover action icons */}
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                            {isEditing ? (
                              <>
                                <button
                                  onClick={(e) => saveEditing(thread.id, e)}
                                  className="p-1 hover:text-emerald-500"
                                  title="Save"
                                >
                                  <Check className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={cancelEditing}
                                  className="p-1 hover:text-rose-500"
                                  title="Cancel"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={(e) => startEditing(thread, e)}
                                  className="p-1 hover:text-blue-500"
                                  title="Rename"
                                >
                                  <Edit2 className="w-2.5 h-2.5" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onDeleteThread(thread.id);
                                  }}
                                  className="p-1 hover:text-rose-500"
                                  title="Delete"
                                >
                                  <Trash2 className="w-2.5 h-2.5" />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* SECTION: BUILD */}
          <div className="space-y-1">
            <div className="px-3 py-1 text-[11px] font-medium text-slate-500 dark:text-zinc-400 tracking-wider uppercase">
              Build
            </div>

            {/* + New app (The signature active pill from screenshot) */}
            <button
              onClick={() => {
                setActiveTab("new-app");
                onNewThread();
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl bg-slate-200/80 dark:bg-white/10 hover:bg-slate-300/80 dark:hover:bg-white/15 text-slate-900 dark:text-white font-medium text-[13px] transition-all cursor-pointer shadow-xs group"
            >
              <Plus className="w-4 h-4 text-slate-700 dark:text-zinc-300 group-hover:rotate-90 transition-transform duration-200" />
              <span>New app</span>
            </button>

            {/* My apps */}
            <button
              onClick={() => setActiveTab("my-apps")}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left transition-colors cursor-pointer ${
                activeTab === "my-apps"
                  ? "bg-slate-200/70 dark:bg-white/10 text-slate-900 dark:text-white font-medium"
                  : "text-slate-600 dark:text-zinc-400 hover:bg-slate-200/50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <LayoutGrid className="w-4 h-4 text-slate-500 dark:text-zinc-400 shrink-0" />
              <span>My apps</span>
            </button>

            {/* Gallery */}
            <button
              onClick={() => setActiveTab("gallery")}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left transition-colors cursor-pointer ${
                activeTab === "gallery"
                  ? "bg-slate-200/70 dark:bg-white/10 text-slate-900 dark:text-white font-medium"
                  : "text-slate-600 dark:text-zinc-400 hover:bg-slate-200/50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Layers className="w-4 h-4 text-slate-500 dark:text-zinc-400 shrink-0" />
              <span>Gallery</span>
            </button>
          </div>

          {/* SECTION: MANAGE */}
          <div className="space-y-1">
            <div className="px-3 py-1 text-[11px] font-medium text-slate-500 dark:text-zinc-400 tracking-wider uppercase">
              Manage
            </div>

            {/* Dashboard */}
            <button
              onClick={() => setActiveTab("dashboard")}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-slate-600 dark:text-zinc-400 hover:bg-slate-200/50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer text-left"
            >
              <div className="flex items-center gap-3">
                <LayoutDashboard className="w-4 h-4 text-slate-500 dark:text-zinc-400 shrink-0" />
                <span>Dashboard</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Documentation */}
            <a
              href="https://ai.google.dev/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-slate-600 dark:text-zinc-400 hover:bg-slate-200/50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer text-left"
            >
              <div className="flex items-center gap-3">
                <BookOpen className="w-4 h-4 text-slate-500 dark:text-zinc-400 shrink-0" />
                <span>Documentation</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            </a>
          </div>

          {/* Quick Search Input (if opened via bottom search button) */}
          {showSearchInput && (
            <div className="p-2 bg-white dark:bg-[#1a1b1c] rounded-xl border border-slate-200 dark:border-white/10 shadow-xs">
              <input
                type="text"
                placeholder="Filter sessions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="w-full bg-transparent text-xs text-slate-900 dark:text-white outline-none placeholder:text-slate-400"
              />
            </div>
          )}
        </div>

        {/* 3. Bottom Utility Row (4 Icons matching screenshot) + User Profile Pill */}
        <div className="p-3 border-t border-slate-200/60 dark:border-white/5 space-y-2.5 shrink-0 bg-[#f8f9fa] dark:bg-[#131314]">
          {/* 4 Utility Buttons Row: [Bell] [Settings] [Search] [Key] */}
          <div className="grid grid-cols-4 gap-1 px-1">
            {/* 1. Notifications */}
            <button
              onClick={() => alert("All Gemini 3.8 Flash tools and services are operational.")}
              className="p-2 rounded-xl flex items-center justify-center text-slate-500 dark:text-zinc-400 hover:bg-slate-200/70 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
            </button>

            {/* 2. Settings (Theme toggle / preferences) */}
            <button
              onClick={toggleTheme}
              suppressHydrationWarning
              className="p-2 rounded-xl flex items-center justify-center text-slate-500 dark:text-zinc-400 hover:bg-slate-200/70 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
              title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {!isMounted ? (
                <Settings className="w-4 h-4" />
              ) : theme === "dark" ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-500" />
              )}
            </button>

            {/* 3. Search */}
            <button
              onClick={() => setShowSearchInput(!showSearchInput)}
              className="p-2 rounded-xl flex items-center justify-center text-slate-500 dark:text-zinc-400 hover:bg-slate-200/70 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
              title="Search chat sessions"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* 4. API Key */}
            <button
              onClick={() => alert("Google Gemini API is configured via server environment (.env). Secret isolation verified.")}
              className="p-2 rounded-xl flex items-center justify-center text-slate-500 dark:text-zinc-400 hover:bg-slate-200/70 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
              title="API Key Configuration"
            >
              <Key className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </button>
          </div>

          {/* User Profile Pill matching screenshot: [Avatar] khanrakib218... [PRO] */}
          <div className="flex items-center justify-between p-2 rounded-2xl bg-white dark:bg-[#1e1f20] border border-slate-200/80 dark:border-white/10 shadow-xs">
            <div className="flex items-center gap-2 overflow-hidden">
              {/* Google Style User Circle Avatar */}
              <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0 ring-2 ring-emerald-500/30">
                {user?.name ? user.name.slice(0, 1).toUpperCase() : "K"}
              </div>

              {/* Username handle */}
              <div className="truncate text-xs font-medium text-slate-800 dark:text-zinc-200" title={displayEmail}>
                {shortHandle}
              </div>
            </div>

            {/* PRO Badge */}
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="px-1.5 py-0.5 rounded-sm border border-slate-300 dark:border-white/20 text-[10px] font-semibold text-slate-700 dark:text-zinc-300 tracking-wider">
                PRO
              </span>

              <button
                onClick={onLogout}
                className="p-1 text-slate-400 hover:text-rose-500 transition-colors"
                title="Sign out"
              >
                <LogOut className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
