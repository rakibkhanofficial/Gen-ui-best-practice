"use client";

import React, { useState } from "react";
import Link from "next/link";
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
  Layers,
  RotateCw,
} from "lucide-react";
import { UserSession } from "@/lib/auth";
import { SidebarSessionsSkeleton } from "@/components/chat/ChatSessionSkeleton";

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
  isLoadingSessions?: boolean;
  onRefreshSessions?: () => void;
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
  isLoadingSessions = false,
  onRefreshSessions,
}: ChatSidebarProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

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

  const displayName = user?.name || "Developer";
  const userInitial = displayName.charAt(0).toUpperCase();

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onToggle}
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-30 lg:hidden"
        />
      )}

      {/* Clean Minimal Sidebar with Glitch-Free Fixed Inner Container */}
      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-40 flex flex-col transition-all duration-300 ease-in-out select-none overflow-hidden
          ${
            isOpen
              ? "w-64 translate-x-0 opacity-100 border-r border-slate-200/90 dark:border-white/10"
              : "w-0 -translate-x-full lg:translate-x-0 lg:w-0 lg:opacity-0 lg:pointer-events-none border-r-0"
          }
          bg-[#f8f9fa] dark:bg-[#131314] text-slate-800 dark:text-[#e3e3e3]
        `}
      >
        {/* Fixed Width Inner Wrapper to Prevent Text Squishing / Layout Glitches during Collapse */}
        <div className="w-64 h-full flex flex-col shrink-0">
          {/* 1. Project Brand Header */}
          <div className="h-14 px-3.5 flex items-center justify-between border-b border-slate-200/70 dark:border-white/5 shrink-0">
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="w-7 h-7 rounded-lg bg-blue-500/10 dark:bg-white/10 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                <Layers className="w-4 h-4" />
              </div>
              <div className="truncate">
                <span className="font-semibold text-sm tracking-tight text-slate-900 dark:text-white block truncate">
                  Gen UI Best Practice
                </span>
                <span className="block text-[10px] text-slate-400 dark:text-zinc-500 font-mono truncate">
                  Copilot &amp; Antigravity
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0 ml-1">
              {onRefreshSessions && (
                <button
                  onClick={onRefreshSessions}
                  disabled={isLoadingSessions}
                  className="p-1.5 rounded-lg hover:bg-slate-200/70 dark:hover:bg-white/10 text-slate-500 dark:text-zinc-400 transition-colors cursor-pointer"
                  title="Refresh chat history"
                >
                  <RotateCw
                    className={`w-3.5 h-3.5 ${
                      isLoadingSessions ? "animate-spin text-blue-500" : ""
                    }`}
                  />
                </button>
              )}
              <button
                onClick={onToggle}
                className="p-1.5 rounded-lg hover:bg-slate-200/70 dark:hover:bg-white/10 text-slate-500 dark:text-zinc-400 transition-colors cursor-pointer"
                title="Collapse sidebar"
              >
                <PanelLeftClose className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 2. Primary Action: + New Chat */}
          <div className="p-3 pb-2 space-y-2 shrink-0">
            <Link
              href="/chat"
              onClick={onNewSession}
              className="w-full flex items-center justify-center gap-2 py-2 px-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-slate-900 font-medium text-xs shadow-xs transition-all cursor-pointer group"
            >
              <Plus className="w-3.5 h-3.5 group-hover:rotate-90 transition-transform duration-200" />
              <span>New Chat</span>
            </Link>

            {/* Quick Filter / Search */}
            {sessions.length > 3 && (
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#1a1b1c] border border-slate-200/80 dark:border-white/5 text-xs">
                <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Filter sessions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent text-slate-900 dark:text-white outline-none placeholder:text-slate-400 text-xs"
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
          </div>

          {/* 3. Sessions List (Chronological Groups or Shimmer Skeleton) */}
          <div className="flex-1 overflow-y-auto px-2 py-2 space-y-3 text-xs font-sans">
            {isLoadingSessions ? (
              <SidebarSessionsSkeleton />
            ) : filteredSessions.length === 0 ? (
              <div className="text-center py-8 text-slate-400 dark:text-zinc-500">
                <MessageSquare className="w-5 h-5 mx-auto mb-1.5 opacity-40" />
                <p className="text-xs">No chat sessions yet</p>
                <p className="text-[11px] mt-0.5 opacity-70">
                  Start a conversation to create one
                </p>
              </div>
            ) : (
              Object.entries(groups).map(([groupTitle, groupSessions]) => {
                if (groupSessions.length === 0) return null;
                return (
                  <div key={groupTitle} className="space-y-0.5">
                    <div className="px-2.5 py-1 text-[10px] font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
                      {groupTitle}
                    </div>
                    {groupSessions.map((session) => {
                      const isActive = session.id === activeSessionId;
                      const isEditing = editingId === session.id;

                      return (
                        <div
                          key={session.id}
                          onClick={() => onSelectSession(session.id)}
                          className={`group relative flex items-center justify-between px-2.5 py-2 rounded-xl cursor-pointer transition-all ${
                            isActive
                              ? "bg-slate-200/80 dark:bg-white/10 text-slate-900 dark:text-white font-medium shadow-2xs"
                              : "text-slate-600 dark:text-zinc-400 hover:bg-slate-200/50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white"
                          }`}
                        >
                          <div className="flex items-center gap-2 overflow-hidden flex-1 mr-1">
                            <MessageSquare
                              className={`w-3.5 h-3.5 shrink-0 ${
                                isActive
                                  ? "text-blue-600 dark:text-blue-400"
                                  : "opacity-60"
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
                                  if (e.key === "Escape") cancelEditing(e as any);
                                }}
                                autoFocus
                                className="w-full bg-white dark:bg-black/50 px-1.5 py-0.5 rounded text-xs border border-blue-500 outline-none text-slate-900 dark:text-white"
                              />
                            ) : (
                              <div className="truncate flex-1">
                                <span className="truncate block text-xs">
                                  {session.title}
                                </span>
                                {session.turnsCount && session.turnsCount > 1 && (
                                  <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-mono block">
                                    {session.turnsCount} turns
                                  </span>
                                )}
                              </div>
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
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={cancelEditing}
                                  className="p-1 hover:text-rose-500 cursor-pointer"
                                  title="Cancel"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={(e) => startEditing(session, e)}
                                  className="p-1 hover:text-blue-500 cursor-pointer"
                                  title="Rename session"
                                >
                                  <Edit2 className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onDeleteSession(session.id);
                                  }}
                                  className="p-1 hover:text-rose-500 cursor-pointer"
                                  title="Delete session"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })
            )}
          </div>

          {/* 4. Footer: User Account */}
          <div className="p-3 border-t border-slate-200/70 dark:border-white/5 shrink-0 bg-[#f8f9fa] dark:bg-[#131314]">
            {!user ? (
              <div className="flex items-center justify-between px-2.5 py-2 rounded-xl bg-slate-200/40 dark:bg-white/5 border border-transparent animate-pulse">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-slate-300/80 dark:bg-white/10" />
                  <div className="h-3 w-20 rounded bg-slate-300/80 dark:bg-white/10" />
                </div>
                <div className="h-4 w-12 rounded bg-slate-300/60 dark:bg-white/10" />
              </div>
            ) : (
              <div className="flex items-center justify-between px-2.5 py-2 rounded-xl bg-white dark:bg-[#1a1b1c] border border-slate-200/70 dark:border-white/5 shadow-2xs">
                <div className="flex items-center gap-2 overflow-hidden">
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-medium flex items-center justify-center text-[11px] shrink-0">
                    {userInitial}
                  </div>
                  <div className="truncate text-xs font-normal text-slate-800 dark:text-zinc-200">
                    {displayName}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-[10px] font-semibold tracking-wider px-1.5 py-0.5 rounded bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-zinc-400 font-mono">
                    {user?.role === "google" ? "PRO" : "GUEST"}
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
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
