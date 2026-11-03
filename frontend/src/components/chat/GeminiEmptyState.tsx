"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Plus,
  Mic,
  ChevronDown,
  ArrowRight,
  Image as ImageIcon,
  FolderOpen,
} from "lucide-react";

interface GeminiEmptyStateProps {
  userName?: string;
  onSelectPrompt: (prompt: string) => void;
  onOpenUpload?: () => void;
  onToggleVoice?: () => void;
  isListening?: boolean;
  onAttachImage?: () => void;
  onAttachDoc?: () => void;
  onBrowseGallery?: () => void;
}

export function GeminiEmptyState({
  userName = "Developer",
  onSelectPrompt,
  onOpenUpload,
  onToggleVoice,
  isListening = false,
  onAttachImage,
  onAttachDoc,
  onBrowseGallery,
}: GeminiEmptyStateProps) {
  const [promptInput, setPromptInput] = useState("");
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [showModeMenu, setShowModeMenu] = useState(false);
  const [selectedMode, setSelectedMode] = useState("Default mode");

  // Suggestion Pills matching Google AI Studio Image 2
  const suggestions = [
    {
      icon: "🚗",
      label: "Create a game",
      prompt: "Create an interactive game component with animations and score tracking",
    },
    {
      icon: "⚡",
      label: "Three.js 3D scenes",
      prompt: "Build an interactive Three.js 3D scene preview with lighting and orbit controls",
    },
    {
      icon: "🧪",
      label: "Add Bioscience Skills",
      prompt: "Analyze bioscience protein data and molecular structure with AlphaFold visualization",
    },
    {
      icon: "🤖",
      label: "Build an Android app",
      prompt: "Design an Android native interface with Jetpack Compose preview",
    },
    {
      icon: "☁️",
      label: "Build a fullstack app >",
      prompt: "Build a fullstack real-time data dashboard with SSE streaming and interactive charts",
    },
  ];

  const handleSend = () => {
    if (promptInput.trim()) {
      onSelectPrompt(promptInput.trim());
    } else {
      // If prompt is empty and user clicks "I'm feeling lucky", pick a dynamic creative prompt!
      const randomPrompt = suggestions[Math.floor(Math.random() * suggestions.length)].prompt;
      onSelectPrompt(randomPrompt);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 sm:py-14 flex flex-col items-center justify-center min-h-[78vh] select-none font-sans">
      {/* 1. Introducing Pill Badge */}
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100/90 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 text-xs text-slate-700 dark:text-zinc-300 font-medium mb-6 shadow-2xs hover:bg-slate-200/60 dark:hover:bg-white/10 transition-colors cursor-pointer"
        onClick={() => onSelectPrompt("What is new in Gemini 4 Argon and Gen UI Architecture?")}
      >
        <span className="w-5 h-5 rounded-full bg-[#1a73e8] text-white text-[11px] font-bold flex items-center justify-center shrink-0 shadow-xs">
          4
        </span>
        <span>Introducing Gemini 4 Argon</span>
      </motion.div>

      {/* 2. Hero Headline matching Google AI Studio */}
      <motion.h1
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.05 }}
        className="text-3xl sm:text-4xl md:text-[42px] font-normal text-slate-900 dark:text-white tracking-tight leading-tight text-center mb-8"
      >
        Build your ideas with Gemini
      </motion.h1>

      {/* 3. Signature Ambient Rainbow Glowing Prompt Container */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.1 }}
        className="w-full max-w-2xl relative group"
      >
        {/* Soft Multi-color Ambient Border Glow (Coral/Peach top-left to Sky Blue bottom-right) */}
        <div className="absolute -inset-[1.5px] rounded-3xl bg-gradient-to-br from-amber-400/40 via-rose-400/35 to-blue-500/45 blur-[1.5px] opacity-80 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none" />

        <div className="relative w-full bg-white dark:bg-[#1e1f20] rounded-[23px] border border-slate-200/70 dark:border-white/10 p-4 shadow-lg shadow-blue-500/5 transition-all">
          <textarea
            value={promptInput}
            onChange={(e) => setPromptInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            rows={3}
            placeholder="Describe an app and let Gemini do the rest"
            className="w-full bg-transparent border-0 outline-none resize-none text-[15px] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 leading-relaxed font-sans"
          />

          {/* Bottom Bar inside the prompt box */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-white/5 mt-2">
            {/* Left: Plus (+) Button for Native File & Photo Attachment */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowAttachMenu(!showAttachMenu)}
                className="w-8 h-8 rounded-full border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
                title="Add files (Image Gallery or System File Manager)"
              >
                <Plus
                  className={`w-4 h-4 transition-transform duration-200 ${
                    showAttachMenu ? "rotate-45" : ""
                  }`}
                />
              </button>

              {/* Native Selector Dropdown */}
              <AnimatePresence>
                {showAttachMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute bottom-11 left-0 z-40 w-60 p-1.5 rounded-2xl bg-white dark:bg-[#1e1f20] border border-slate-200/90 dark:border-white/10 shadow-xl space-y-1"
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setShowAttachMenu(false);
                        onAttachImage ? onAttachImage() : onOpenUpload?.();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-xs font-medium text-slate-700 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-white/5 cursor-pointer transition-colors"
                    >
                      <div className="w-7 h-7 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                        <ImageIcon className="w-4 h-4" />
                      </div>
                      <div className="truncate">
                        <span className="block font-semibold">Image &amp; Gallery</span>
                        <span className="block text-[10px] text-slate-400 dark:text-zinc-500 font-normal">
                          Photo gallery &bull; PNG, JPG
                        </span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setShowAttachMenu(false);
                        onAttachDoc ? onAttachDoc() : onOpenUpload?.();
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
            </div>

            {/* Right: Default mode ⌵, Mic, I'm feeling lucky */}
            <div className="flex items-center gap-2">
              {/* Mode Selector Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowModeMenu(!showModeMenu)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border border-slate-200 dark:border-white/10 text-slate-600 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <span>{selectedMode}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                <AnimatePresence>
                  {showModeMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 4, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 4, scale: 0.95 }}
                      transition={{ duration: 0.12 }}
                      className="absolute right-0 bottom-10 z-40 w-44 p-1.5 rounded-xl bg-white dark:bg-[#1e1f20] border border-slate-200/90 dark:border-white/10 shadow-xl text-xs space-y-0.5"
                    >
                      {["Default mode", "Fast mode", "Creative mode"].map((m) => (
                        <button
                          key={m}
                          onClick={() => {
                            setSelectedMode(m);
                            setShowModeMenu(false);
                          }}
                          className={`w-full text-left px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
                            selectedMode === m
                              ? "bg-blue-50 dark:bg-white/10 text-blue-600 dark:text-blue-400 font-semibold"
                              : "text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-white/5"
                          }`}
                        >
                          {m}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Microphone Voice Button */}
              <button
                type="button"
                onClick={onToggleVoice}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
                  isListening
                    ? "bg-rose-500 text-white animate-pulse"
                    : "text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5"
                }`}
                title="Voice Input (Speech-to-Text)"
              >
                <Mic className="w-4 h-4" />
              </button>

              {/* I'm feeling lucky Button */}
              <button
                type="button"
                onClick={handleSend}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium bg-slate-100 dark:bg-white/5 hover:bg-slate-200/80 dark:hover:bg-white/10 text-slate-800 dark:text-zinc-200 border border-slate-200/70 dark:border-white/10 transition-all cursor-pointer shadow-2xs active:scale-98"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#1a73e8]" />
                <span>I&apos;m feeling lucky</span>
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 4. Quick Suggestion Pills below prompt box */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.15 }}
        className="flex flex-wrap items-center justify-center gap-2 mt-5 max-w-3xl"
      >
        {suggestions.map((item, idx) => (
          <button
            key={idx}
            onClick={() => onSelectPrompt(item.prompt)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-[#1e1f20] hover:bg-slate-100/80 dark:hover:bg-[#282a2c] border border-slate-200/80 dark:border-white/10 text-xs font-normal text-slate-700 dark:text-zinc-300 transition-all shadow-xs hover:border-slate-300 dark:hover:border-white/20 cursor-pointer"
          >
            <span className="text-sm shrink-0">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </motion.div>

      {/* 5. Bottom Gallery Card matching Google AI Studio */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.2 }}
        className="w-full max-w-2xl mt-12 p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-[#1e1f20] border border-slate-200/70 dark:border-white/10 flex items-center justify-between shadow-xs"
      >
        <span className="text-xs sm:text-sm font-normal text-slate-800 dark:text-zinc-200">
          Explore apps built with Gemini 4 Argon
        </span>
        <button
          onClick={onBrowseGallery ? onBrowseGallery : () => onSelectPrompt("Show me interactive Gen UI showcases for flights, sales, kanban, and jobs")}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/15 text-slate-800 dark:text-zinc-200 transition-colors cursor-pointer"
        >
          <span>Browse the app gallery</span>
          <ArrowRight className="w-3.5 h-3.5 text-slate-500 dark:text-zinc-400" />
        </button>
      </motion.div>
    </div>
  );
}
