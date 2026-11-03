"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  PanelLeftClose,
  PanelLeft,
  Plus,
  MessageSquare,
  Trash2,
  Edit2,
  Check,
  X,
  Sun,
  Moon,
  Bot,
  Sparkles,
  LogOut,
  FolderOpen
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
  const { theme, toggleTheme, mounted } = useTheme();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");

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

  // Group threads by recency: Today, Yesterday, Previous 7 Days, Older
  const now = Date.now();
  const oneDay = 24 * 60 * 60 * 1000;
  const groups: { [key: string]: ConversationThread[] } = {
    Today: [],
    Yesterday: [],
    "Previous 7 Days": [],
    Older: [],
  };

  threads.forEach((t) => {
    const diff = now - t.updatedAt;
    if (diff < oneDay) {
      groups.Today.push(t);
    } else if (diff < 2 * oneDay) {
      groups.Yesterday.push(t);
    } else if (diff < 7 * oneDay) {
      groups["Previous 7 Days"].push(t);
    } else {
      groups.Older.push(t);
    }
  });

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onToggle}
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-30 lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-40 flex flex-col transition-all duration-300 ease-in-out border-r
          ${
            isOpen
              ? "w-68 translate-x-0"
              : "-translate-x-full lg:translate-x-0 lg:w-0 lg:opacity-0 lg:pointer-events-none"
          }
          bg-[#f0f4f9] dark:bg-[#1e1f20] text-slate-800 dark:text-[#e3e3e3] border-slate-200 dark:border-[#282a2c]
        `}
      >
        {/* Sidebar Header: App Brand + New Chat */}
        <div className="p-3 flex items-center justify-between gap-2 border-b border-slate-200/80 dark:border-white/5">
          <div className="flex items-center gap-2 pl-1">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-500 via-indigo-500 to-rose-400 p-0.5 flex items-center justify-center shadow-xs">
              <div className="w-full h-full bg-white dark:bg-[#1e1f20] rounded-[6px] flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-blue-500 dark:text-blue-400" />
              </div>
            </div>
            <div className="leading-none">
              <span className="font-semibold text-sm tracking-tight text-slate-900 dark:text-white">
                Gemini Studio
              </span>
              <span className="block text-[10px] text-slate-500 dark:text-[#9aa0a6] mt-0.5">
                Google GenUI
              </span>
            </div>
          </div>

          <button
            onClick={onToggle}
            className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 dark:text-[#9aa0a6] transition-colors"
            title="Collapse sidebar"
          >
            <PanelLeftClose className="w-4 h-4" />
          </button>
        </div>

        {/* New Chat Button */}
        <div className="p-3">
          <button
            onClick={onNewThread}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-slate-200/80 hover:bg-slate-300/80 dark:bg-[#282a2c] dark:hover:bg-[#333538] text-slate-900 dark:text-white text-sm font-medium transition-all shadow-xs group"
          >
            <Plus className="w-4 h-4 text-blue-600 dark:text-blue-400 group-hover:rotate-90 transition-transform duration-200" />
            <span>New chat</span>
          </button>
        </div>

        {/* Chat History List */}
        <div className="flex-1 overflow-y-auto px-2 space-y-4 py-2 text-xs">
          {threads.length === 0 ? (
            <div className="text-center py-8 text-slate-400 dark:text-[#9aa0a6]">
              <MessageSquare className="w-6 h-6 mx-auto mb-2 opacity-30" />
              <p>No chat history yet</p>
              <p className="text-[11px] mt-1 opacity-70">Start a conversation below</p>
            </div>
          ) : (
            Object.entries(groups).map(([groupTitle, groupThreads]) => {
              if (groupThreads.length === 0) return null;
              return (
                <div key={groupTitle} className="space-y-1">
                  <div className="px-3 py-1 text-[11px] font-semibold text-slate-500 dark:text-[#9aa0a6] uppercase tracking-wider">
                    {groupTitle}
                  </div>
                  {groupThreads.map((thread) => {
                    const isActive = thread.id === activeThreadId;
                    const isEditing = editingId === thread.id;

                    return (
                      <div
                        key={thread.id}
                        onClick={() => onSelectThread(thread.id)}
                        className={`group relative flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-all ${
                          isActive
                            ? "bg-slate-300/70 dark:bg-[#282a2c] text-blue-700 dark:text-white font-medium"
                            : "hover:bg-slate-200/60 dark:hover:bg-white/5 text-slate-700 dark:text-[#c4c7c5]"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 overflow-hidden flex-1 mr-1">
                          <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${isActive ? "text-blue-600 dark:text-blue-400" : "opacity-60"}`} />
                          
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
                              className="w-full bg-white dark:bg-black/40 px-2 py-0.5 rounded text-xs border border-blue-500 outline-none text-slate-900 dark:text-white"
                            />
                          ) : (
                            <span className="truncate text-xs">{thread.title}</span>
                          )}
                        </div>

                        {/* Action buttons on hover */}
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                          {isEditing ? (
                            <>
                              <button
                                onClick={(e) => saveEditing(thread.id, e)}
                                className="p-1 hover:text-emerald-500"
                                title="Save"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={cancelEditing}
                                className="p-1 hover:text-rose-500"
                                title="Cancel"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={(e) => startEditing(thread, e)}
                                className="p-1 hover:text-blue-500 dark:hover:text-blue-400"
                                title="Rename chat"
                              >
                                <Edit2 className="w-3 h-3" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onDeleteThread(thread.id);
                                }}
                                className="p-1 hover:text-rose-500"
                                title="Delete chat"
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

        {/* Sidebar Footer: Theme Toggle & User Account */}
        <div className="p-3 border-t border-slate-200/80 dark:border-white/5 space-y-2">
          {/* Theme Switcher Button */}
          <button
            onClick={toggleTheme}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-slate-200/60 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-xs text-slate-700 dark:text-[#c4c7c5] transition-colors"
          >
            <span className="flex items-center gap-2">
              {!mounted ? (
                <>
                  <div className="w-3.5 h-3.5 rounded-full bg-slate-400/30" />
                  <span>Theme</span>
                </>
              ) : theme === "dark" ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span>Light Mode</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Dark Mode</span>
                </>
              )}
            </span>
            <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-400 dark:text-[#9aa0a6]">
              {mounted ? theme : ""}
            </span>
          </button>

          {/* User Profile Bar */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-600 to-sky-400 text-white font-bold flex items-center justify-center text-xs shadow-xs">
                {user?.name ? user.name.slice(0, 2).toUpperCase() : "GP"}
              </div>
              <div className="truncate text-left leading-tight">
                <div className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                  {user?.name || "Guest Presenter"}
                </div>
                <div className="text-[10px] text-slate-500 dark:text-[#9aa0a6]">
                  Gemini 3.8 Flash
                </div>
              </div>
            </div>

            <button
              onClick={onLogout}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-slate-200/50 dark:hover:bg-white/10 transition-colors"
              title="Sign out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

