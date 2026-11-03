"use client";

import React from "react";
import { Sparkles, PanelLeft, Sun, Moon } from "lucide-react";

/**
 * ChatMessagesSkeleton
 *
 * Renders an elegant, modern shimmer skeleton simulating:
 * 1. An assistant turn with reasoning badge, Generative UI card, and markdown text lines
 * 2. A user turn with right-aligned message bubble
 * 3. A second assistant response
 */
export function ChatMessagesSkeleton() {
  return (
    <div className="w-full space-y-8 select-none py-2">
      {/* 1. Assistant Turn Skeleton */}
      <div className="flex items-start gap-3">
        {/* Sparkle Avatar Skeleton */}
        <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-white/10 flex items-center justify-center shrink-0 mt-0.5 animate-pulse text-slate-400 dark:text-zinc-600">
          <Sparkles className="w-3.5 h-3.5 opacity-60" />
        </div>

        <div className="flex-1 min-w-0 space-y-4">
          {/* Reasoning Badge Skeleton */}
          <div className="flex items-center gap-2">
            <div className="h-5 w-36 rounded-full bg-slate-200/80 dark:bg-white/10 animate-pulse" />
            <div className="h-4 w-16 rounded-md bg-slate-100 dark:bg-white/5 animate-pulse" />
          </div>

          {/* Generative UI Component Card Skeleton */}
          <div className="w-full rounded-2xl border border-slate-200/70 dark:border-white/10 bg-slate-50/70 dark:bg-[#1a1b1c] p-5 space-y-4 animate-pulse shadow-xs">
            {/* Card Header Skeleton */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/60 dark:border-white/5">
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-lg bg-slate-200 dark:bg-white/10" />
                <div className="h-4 w-44 rounded-md bg-slate-200 dark:bg-white/10" />
                <div className="h-4 w-20 rounded-full bg-slate-200/60 dark:bg-white/5" />
              </div>
              <div className="flex items-center gap-2">
                <div className="h-6 w-16 rounded-lg bg-slate-200/80 dark:bg-white/10" />
                <div className="h-6 w-20 rounded-lg bg-slate-200/80 dark:bg-white/10" />
              </div>
            </div>

            {/* Card Content Skeleton: Architecture Diagram / Grid preview */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-2">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="h-36 rounded-xl bg-slate-200/50 dark:bg-white/5 border border-slate-200/60 dark:border-white/5 p-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="h-3 w-16 rounded bg-slate-300/70 dark:bg-white/10" />
                    <div className="h-3 w-full rounded bg-slate-200 dark:bg-white/5" />
                    <div className="h-3 w-4/5 rounded bg-slate-200 dark:bg-white/5" />
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-black/5 dark:border-white/5">
                    <div className="h-2.5 w-10 rounded bg-slate-200 dark:bg-white/5" />
                    <div className="h-3.5 w-6 rounded-full bg-slate-200 dark:bg-white/10" />
                  </div>
                </div>
              ))}
            </div>

            {/* Card Footer Skeleton */}
            <div className="pt-2 border-t border-slate-200/50 dark:border-white/5 flex items-center justify-between">
              <div className="h-3 w-56 rounded bg-slate-200/70 dark:bg-white/10" />
              <div className="h-3 w-28 rounded bg-slate-200/70 dark:bg-white/10" />
            </div>
          </div>

          {/* Markdown Text Lines Skeleton */}
          <div className="space-y-2 pt-1 max-w-2xl">
            <div className="h-3.5 w-full rounded bg-slate-200/80 dark:bg-white/10 animate-pulse" />
            <div className="h-3.5 w-11/12 rounded bg-slate-200/80 dark:bg-white/10 animate-pulse" />
            <div className="h-3.5 w-3/4 rounded bg-slate-200/70 dark:bg-white/5 animate-pulse" />
          </div>
        </div>
      </div>

      {/* 2. User Turn Skeleton */}
      <div className="flex justify-end">
        <div className="w-64 sm:w-80 h-11 rounded-2xl bg-slate-200/70 dark:bg-[#282a2c] animate-pulse" />
      </div>

      {/* 3. Second Assistant Turn Skeleton */}
      <div className="flex items-start gap-3">
        <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-white/10 flex items-center justify-center shrink-0 mt-0.5 animate-pulse text-slate-400 dark:text-zinc-600">
          <Sparkles className="w-3.5 h-3.5 opacity-60" />
        </div>

        <div className="flex-1 min-w-0 space-y-2.5 pt-1 max-w-xl">
          <div className="h-3.5 w-full rounded bg-slate-200/80 dark:bg-white/10 animate-pulse" />
          <div className="h-3.5 w-4/5 rounded bg-slate-200/80 dark:bg-white/10 animate-pulse" />
          <div className="h-3.5 w-1/2 rounded bg-slate-200/60 dark:bg-white/5 animate-pulse" />
        </div>
      </div>
    </div>
  );
}

/**
 * FullPageChatSkeleton
 *
 * Full-page Suspense fallback matching the exact App Router layout
 * (sidebar + top header + message stream skeleton + bottom bar).
 */
export function FullPageChatSkeleton() {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-white dark:bg-[#131314] text-slate-800 dark:text-[#e3e3e3] font-sans antialiased">
      {/* 1. Left Sidebar Skeleton (Desktop) */}
      <aside className="hidden md:flex w-64 h-full border-r border-slate-200/80 dark:border-white/5 bg-[#f8fafc]/90 dark:bg-[#1e1f20]/90 flex-col shrink-0 p-3 justify-between animate-pulse">
        <div className="space-y-4">
          {/* Logo / New Chat Button */}
          <div className="h-10 w-full rounded-xl bg-slate-200 dark:bg-white/10" />
          {/* Filter Input */}
          <div className="h-8 w-full rounded-lg bg-slate-200/60 dark:bg-white/5" />
          {/* Session List Skeleton */}
          <div className="space-y-2 pt-2">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-9 w-full rounded-xl bg-slate-200/50 dark:bg-white/5"
              />
            ))}
          </div>
        </div>

        {/* User Card Skeleton */}
        <div className="h-12 w-full rounded-xl bg-slate-200/70 dark:bg-white/10" />
      </aside>

      {/* 2. Main Chat Area Skeleton */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Top Header Skeleton */}
        <header className="h-14 px-4 border-b border-slate-200/60 dark:border-white/5 bg-white/90 dark:bg-[#131314]/90 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <div className="h-4 w-36 rounded bg-slate-200 dark:bg-white/10 animate-pulse" />
          </div>
          <div className="flex items-center gap-2">
            <div className="h-6 w-24 rounded-full bg-slate-200/80 dark:bg-white/10 animate-pulse" />
            <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-white/10 animate-pulse" />
          </div>
        </header>

        {/* Message Area Skeleton */}
        <div className="flex-1 overflow-y-auto px-4 md:px-6 lg:px-8 py-4">
          <div className="max-w-3xl mx-auto space-y-6 pb-28">
            <ChatMessagesSkeleton />
          </div>
        </div>

        {/* Bottom Input Bar Skeleton */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-white via-white/95 to-transparent dark:from-[#131314] dark:via-[#131314]/95 dark:to-transparent pt-6 pb-4 px-4">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-2xl bg-slate-100 dark:bg-[#1e1f20] border border-slate-200/80 dark:border-white/10 animate-pulse">
              <div className="w-7 h-7 rounded-lg bg-slate-200 dark:bg-white/10" />
              <div className="flex-1 h-5 rounded bg-slate-200/60 dark:bg-white/5" />
              <div className="w-7 h-7 rounded-lg bg-slate-200 dark:bg-white/10" />
              <div className="w-7 h-7 rounded-lg bg-slate-900/20 dark:bg-white/20" />
            </div>
            <div className="h-3 w-48 rounded bg-slate-200/40 dark:bg-white/5 mx-auto mt-2" />
          </div>
        </div>
      </div>
    </div>
  );
}
