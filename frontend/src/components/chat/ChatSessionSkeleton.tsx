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
 * SidebarSessionsSkeleton
 *
 * Polished shimmer skeleton for the sidebar conversation history list.
 * Displayed when session history is being fetched from the API or during page reloads.
 */
export function SidebarSessionsSkeleton() {
  return (
    <div className="space-y-4 py-1 select-none animate-pulse font-sans">
      {/* Group 1: Today Shimmer */}
      <div className="space-y-1">
        <div className="flex items-center justify-between px-2.5 py-1">
          <div className="h-2.5 w-12 rounded bg-slate-200/90 dark:bg-white/10" />
          <div className="h-2 w-4 rounded bg-slate-200/50 dark:bg-white/5" />
        </div>
        <div className="space-y-1">
          {[
            { titleW: "w-4/5", subW: "w-20" },
            { titleW: "w-3/4", subW: "w-16" },
            { titleW: "w-5/6", subW: "w-24" },
          ].map((item, idx) => (
            <div
              key={`skeleton-today-${idx}`}
              className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl bg-slate-200/40 dark:bg-white/5 border border-transparent"
            >
              <div className="w-3.5 h-3.5 rounded-sm bg-slate-300/80 dark:bg-white/10 shrink-0" />
              <div className="flex-1 min-w-0 space-y-1.5">
                <div className={`h-3 ${item.titleW} rounded bg-slate-300/80 dark:bg-white/15`} />
                <div className={`h-2 ${item.subW} rounded bg-slate-200/60 dark:bg-white/5`} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Group 2: Previous 7 Days Shimmer */}
      <div className="space-y-1 pt-1">
        <div className="flex items-center justify-between px-2.5 py-1">
          <div className="h-2.5 w-20 rounded bg-slate-200/90 dark:bg-white/10" />
          <div className="h-2 w-4 rounded bg-slate-200/50 dark:bg-white/5" />
        </div>
        <div className="space-y-1">
          {[
            { titleW: "w-3/4", subW: "w-16" },
            { titleW: "w-2/3", subW: "w-14" },
            { titleW: "w-4/5", subW: "w-12" },
          ].map((item, idx) => (
            <div
              key={`skeleton-prev-${idx}`}
              className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl bg-slate-200/40 dark:bg-white/5 border border-transparent"
            >
              <div className="w-3.5 h-3.5 rounded-sm bg-slate-300/80 dark:bg-white/10 shrink-0" />
              <div className="flex-1 min-w-0 space-y-1.5">
                <div className={`h-3 ${item.titleW} rounded bg-slate-300/80 dark:bg-white/15`} />
                <div className={`h-2 ${item.subW} rounded bg-slate-200/60 dark:bg-white/5`} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * GeminiEmptyStateSkeleton
 *
 * Specific skeleton matching the empty state / new chat screen (/chat):
 * 1. Engine project badge
 * 2. Hero headline & subhead
 * 3. Centered prompt input box with file attach + voice + send action placeholders
 * 4. Quick recommendation suggestion pills grid below
 */
export function GeminiEmptyStateSkeleton() {
  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-10 sm:py-16 flex flex-col items-center justify-center min-h-[75vh] select-none font-sans animate-pulse">
      {/* 1. Project Engine Badge Placeholder */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 mb-6 shadow-2xs">
        <div className="w-3.5 h-3.5 rounded-full bg-blue-500/40" />
        <div className="h-3 w-56 rounded bg-slate-200/80 dark:bg-white/10" />
      </div>

      {/* 2. Hero Headline & Subtitle Placeholders */}
      <div className="text-center mb-8 flex flex-col items-center space-y-2.5 w-full max-w-xl">
        <div className="h-9 w-72 sm:w-96 rounded-2xl bg-slate-200/90 dark:bg-white/15" />
        <div className="h-4 w-60 sm:w-80 rounded-lg bg-slate-200/60 dark:bg-white/10" />
      </div>

      {/* 3. Centered Clean Prompt Container Placeholder */}
      <div className="w-full relative">
        <div className="w-full bg-white dark:bg-[#1e1f20] rounded-3xl border border-slate-200/90 dark:border-white/10 p-4 shadow-lg shadow-blue-500/5">
          {/* Textarea area lines */}
          <div className="space-y-2.5 pt-1 pb-5">
            <div className="h-4 w-3/4 rounded bg-slate-200/70 dark:bg-white/10" />
            <div className="h-4 w-1/2 rounded bg-slate-200/50 dark:bg-white/5" />
          </div>

          {/* Prompt Box Action Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-white/5">
            {/* Left buttons (Gallery / File Manager) */}
            <div className="flex items-center gap-1.5">
              <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/5" />
              <div className="h-7 w-20 rounded-full bg-slate-100 dark:bg-white/5" />
            </div>

            {/* Right buttons (Mic + Send button) */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/5" />
              <div className="h-8 w-18 rounded-full bg-slate-200/80 dark:bg-white/15" />
            </div>
          </div>
        </div>
      </div>

      {/* 4. Quick Suggestion Pills Grid Placeholders */}
      <div className="flex flex-wrap items-center justify-center gap-2 mt-6 max-w-2xl w-full">
        {[
          "w-36",
          "w-44",
          "w-32",
          "w-40",
          "w-38",
          "w-34",
        ].map((w, idx) => (
          <div
            key={idx}
            className={`h-8 ${w} rounded-full bg-white dark:bg-[#1e1f20] border border-slate-200/80 dark:border-white/10 shadow-2xs flex items-center gap-2 px-3`}
          >
            <div className="w-3.5 h-3.5 rounded-full bg-slate-200 dark:bg-white/10 shrink-0" />
            <div className="h-2.5 flex-1 rounded bg-slate-200/70 dark:bg-white/10" />
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * ChatHeaderSkeleton
 *
 * Shimmer header matching ChatHeader:
 * - On /chat (empty state): ONLY burger menu button skeleton + theme switcher skeleton (no project badge).
 * - On /chat/[chatId] (chat details): Burger menu + "Gen UI Best Practice Copilot & Antigravity" badge + theme switcher.
 */
export function ChatHeaderSkeleton({ isChatDetails = false }: { isChatDetails?: boolean }) {
  return (
    <header className="h-14 px-3 sm:px-4 border-b border-slate-200/60 dark:border-white/5 bg-white/90 dark:bg-[#131314]/90 backdrop-blur-md flex items-center justify-between shrink-0 select-none font-sans">
      <div className="flex items-center gap-2.5 min-w-0">
        {/* Burger Menu Button Skeleton */}
        <div className="w-8 h-8 rounded-xl bg-slate-200/80 dark:bg-white/10 animate-pulse shrink-0" />

        {/* Project Branding Skeleton: ONLY shown when isChatDetails is true */}
        {isChatDetails && (
          <div className="flex items-center gap-2 px-1">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shrink-0" />
            <div className="h-3.5 w-32 rounded bg-slate-200 dark:bg-white/10 animate-pulse" />
            <div className="h-4 w-24 rounded bg-slate-100 dark:bg-white/5 animate-pulse" />
          </div>
        )}
      </div>

      {/* Right: Theme Switcher Button Skeleton */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-slate-200/80 dark:bg-white/10 animate-pulse" />
      </div>
    </header>
  );
}

/**
 * FullPageEmptyChatSkeleton
 *
 * Full-page Suspense fallback specifically for the empty state / new chat page (/chat).
 * Renders the sidebar + header (without project badge) + centered GeminiEmptyStateSkeleton (no bottom bar).
 */
export function FullPageEmptyChatSkeleton() {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-white dark:bg-[#131314] text-slate-800 dark:text-[#e3e3e3] font-sans antialiased">
      {/* 1. Left Sidebar Skeleton (Desktop) */}
      <aside className="hidden md:flex w-64 h-full border-r border-slate-200/80 dark:border-white/5 bg-[#f8f9fa] dark:bg-[#131314] flex-col shrink-0 p-3 justify-between animate-pulse">
        <div className="space-y-4">
          {/* Sidebar Brand Header Skeleton */}
          <div className="h-10 flex items-center gap-2 px-1 pb-2 border-b border-slate-200/60 dark:border-white/5">
            <div className="w-7 h-7 rounded-lg bg-slate-200 dark:bg-white/10 shrink-0" />
            <div className="space-y-1 flex-1">
              <div className="h-3 w-28 rounded bg-slate-200 dark:bg-white/10" />
              <div className="h-2 w-20 rounded bg-slate-200/60 dark:bg-white/5" />
            </div>
          </div>

          {/* New Chat Button Skeleton */}
          <div className="h-10 w-full rounded-xl bg-slate-200 dark:bg-white/10" />
          {/* Filter Input */}
          <div className="h-8 w-full rounded-lg bg-slate-200/60 dark:bg-white/5" />
          {/* Session List Skeleton */}
          <div className="pt-2">
            <SidebarSessionsSkeleton />
          </div>
        </div>

        {/* User Card Skeleton */}
        <div className="h-12 w-full rounded-xl bg-slate-200/70 dark:bg-white/10" />
      </aside>

      {/* 2. Main Chat Area Skeleton */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Top Header Skeleton: isChatDetails=false ensures no project badge is shown */}
        <ChatHeaderSkeleton isChatDetails={false} />

        {/* Empty State Centered Area */}
        <div className="flex-1 overflow-y-auto px-4 md:px-6 lg:px-8 py-4 flex items-center justify-center">
          <GeminiEmptyStateSkeleton />
        </div>
      </div>
    </div>
  );
}

/**
 * FullPageChatSkeleton
 *
 * Full-page Suspense fallback matching the exact App Router layout for conversation sessions (/chat/[chatId])
 * (sidebar + top header with project badge + message stream skeleton + bottom bar).
 */
export function FullPageChatSkeleton() {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-white dark:bg-[#131314] text-slate-800 dark:text-[#e3e3e3] font-sans antialiased">
      {/* 1. Left Sidebar Skeleton (Desktop) */}
      <aside className="hidden md:flex w-64 h-full border-r border-slate-200/80 dark:border-white/5 bg-[#f8f9fa] dark:bg-[#131314] flex-col shrink-0 p-3 justify-between animate-pulse">
        <div className="space-y-4">
          {/* Sidebar Brand Header Skeleton */}
          <div className="h-10 flex items-center gap-2 px-1 pb-2 border-b border-slate-200/60 dark:border-white/5">
            <div className="w-7 h-7 rounded-lg bg-slate-200 dark:bg-white/10 shrink-0" />
            <div className="space-y-1 flex-1">
              <div className="h-3 w-28 rounded bg-slate-200 dark:bg-white/10" />
              <div className="h-2 w-20 rounded bg-slate-200/60 dark:bg-white/5" />
            </div>
          </div>

          {/* New Chat Button Skeleton */}
          <div className="h-10 w-full rounded-xl bg-slate-200 dark:bg-white/10" />
          {/* Filter Input */}
          <div className="h-8 w-full rounded-lg bg-slate-200/60 dark:bg-white/5" />
          {/* Session List Skeleton */}
          <div className="pt-2">
            <SidebarSessionsSkeleton />
          </div>
        </div>

        {/* User Card Skeleton */}
        <div className="h-12 w-full rounded-xl bg-slate-200/70 dark:bg-white/10" />
      </aside>

      {/* 2. Main Chat Area Skeleton */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Top Header Skeleton: isChatDetails=true shows project badge skeleton */}
        <ChatHeaderSkeleton isChatDetails={true} />

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

