"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Plus,
  Mic,
  MicOff,
  ArrowUp,
  Image as ImageIcon,
  FolderOpen,
  FileSpreadsheet,
  FileText,
  X,
  Loader2,
  Plane,
  BarChart3,
  Kanban,
  Briefcase,
  Code2,
  Sun,
  FileSearch,
  Calendar,
} from "lucide-react";

export interface AttachmentInfo {
  filename: string;
  filePath: string;
  fileType: "image" | "document" | "spreadsheet" | "pdf" | "file";
  fileSize?: number;
  previewUrl?: string;
  minioUrl?: string;
}

interface GeminiEmptyStateProps {
  userName?: string;
  input: string;
  setInput: (value: string) => void;
  onSendMessage: (overridePrompt?: string) => void;
  onOpenUpload?: () => void;
  onToggleVoice?: () => void;
  isListening?: boolean;
  isTranscribingAudio?: boolean;
  onAttachImage?: () => void;
  onAttachDoc?: () => void;
  onFileSelected?: (file: File) => void;
  currentAttachment?: AttachmentInfo | null;
  onRemoveAttachment?: () => void;
  isUploading?: boolean;
  onBrowseGallery?: () => void;
}

export function GeminiEmptyState({
  userName = "Developer",
  input,
  setInput,
  onSendMessage,
  onOpenUpload,
  onToggleVoice,
  isListening = false,
  isTranscribingAudio = false,
  onAttachImage,
  onAttachDoc,
  onFileSelected,
  currentAttachment,
  onRemoveAttachment,
  isUploading = false,
  onBrowseGallery,
}: GeminiEmptyStateProps) {
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const localImageInputRef = useRef<HTMLInputElement>(null);
  const localDocInputRef = useRef<HTMLInputElement>(null);
  const attachMenuRef = useRef<HTMLDivElement>(null);

  // Close attach menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (attachMenuRef.current && !attachMenuRef.current.contains(e.target as Node)) {
        setShowAttachMenu(false);
      }
    };
    if (showAttachMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showAttachMenu]);

  // Real, dynamic GenUI capabilities of our project
  const suggestions = [
    {
      icon: Plane,
      label: "Flights to Tokyo",
      prompt: "Find flights from Dhaka to Tokyo with airlines and pricing",
    },
    {
      icon: BarChart3,
      label: "Q3 Sales Analytics",
      prompt: "Show enterprise revenue breakdown for Q3 2026 with interactive charts",
    },
    {
      icon: Kanban,
      label: "Excalidraw Plan",
      prompt: "Generate an Excalidraw architecture and sprint plan for our GenUI release",
    },
    {
      icon: Briefcase,
      label: "BDJobs & LinkedIn",
      prompt: "Find Senior Full Stack Engineer jobs on BDJobs and LinkedIn",
    },
    {
      icon: Code2,
      label: "FastAPI Code Studio",
      prompt: "Write a high-performance Python script for async SSE streaming with FastAPI",
    },
    {
      icon: Calendar,
      label: "Schedule Review",
      prompt: "Schedule a 30-minute GenUI architecture review meeting with the team",
    },
    {
      icon: Sun,
      label: "Tokyo Weather",
      prompt: "What is the weather in Tokyo today?",
    },
    {
      icon: FileSearch,
      label: "Analyze Spreadsheet / Doc",
      prompt: "Analyze our quarterly enterprise financial report and extract key metrics",
    },
  ];

  const handleSend = () => {
    if (input.trim() || currentAttachment) {
      onSendMessage();
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-10 sm:py-16 flex flex-col items-center justify-center min-h-[75vh] select-none font-sans">
      {/* 1. Project Engine Badge */}
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 text-xs text-slate-700 dark:text-zinc-300 font-medium mb-5 shadow-2xs"
      >
        <Sparkles className="w-3.5 h-3.5 text-blue-500" />
        <span>Gen UI Best Practice &bull; CopilotKit &amp; Antigravity SDK</span>
      </motion.div>

      {/* 2. Hero Headline & Subtitle */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.05 }}
        className="text-center mb-7 max-w-xl"
      >
        <h1 className="text-3xl sm:text-4xl font-normal text-slate-900 dark:text-white tracking-tight leading-tight">
          What would you like to explore?
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-2 leading-relaxed">
          Ask questions, generate dynamic UI components, analyze documents, or plan architecture.
        </p>
      </motion.div>

      {/* 3. Single Clean Prompt Container */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.1 }}
        className="w-full relative group"
      >
        {/* Subtle Ambient Focus Ring */}
        <div
          className={`absolute -inset-[1px] rounded-3xl bg-gradient-to-r from-blue-500/20 via-indigo-500/20 to-sky-500/20 blur-xs transition-opacity duration-200 pointer-events-none ${
            isListening
              ? "opacity-100 ring-2 ring-rose-500/30"
              : "opacity-0 group-hover:opacity-60 group-focus-within:opacity-100"
          }`}
        />

        <div className="relative w-full bg-white dark:bg-[#1e1f20] rounded-3xl border border-slate-200/90 dark:border-white/10 p-4 shadow-lg shadow-blue-500/5 transition-colors duration-200">
          {/* Active Attached File Pill inside Prompt Box */}
          {currentAttachment && (
            <div className="flex items-center gap-2 mb-3 p-1.5 pr-2.5 rounded-2xl bg-slate-100/80 dark:bg-white/5 border border-slate-200/90 dark:border-white/10 w-fit text-xs text-slate-800 dark:text-zinc-200 shadow-2xs animate-in fade-in slide-in-from-bottom-1">
              {currentAttachment.fileType === "image" && currentAttachment.previewUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={currentAttachment.previewUrl}
                  alt={currentAttachment.filename}
                  className="w-7 h-7 rounded-lg object-cover border border-slate-200 dark:border-white/10 shrink-0"
                />
              ) : currentAttachment.fileType === "pdf" ? (
                <div className="relative w-7 h-7 rounded-lg bg-gradient-to-br from-rose-500 to-red-600 text-white flex items-center justify-center shrink-0 shadow-xs ring-1 ring-black/5 dark:ring-white/10">
                  <FileText className="w-3.5 h-3.5" />
                  <span className="absolute -bottom-1 -right-1 text-[7px] font-black uppercase tracking-tighter px-0.5 rounded-xs bg-rose-950 text-rose-200 border border-rose-400/40">
                    PDF
                  </span>
                </div>
              ) : currentAttachment.fileType === "spreadsheet" ? (
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                </div>
              ) : (
                <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                  <FileText className="w-3.5 h-3.5" />
                </div>
              )}

              <div className="truncate max-w-xs">
                <span className="font-semibold text-xs block truncate">{currentAttachment.filename}</span>
                <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-mono block">
                  {currentAttachment.fileType === "pdf" ? (
                    <span className="text-rose-600 dark:text-rose-400 font-medium">
                      PDF Document &bull; {currentAttachment.fileSize ? `${Math.round(currentAttachment.fileSize / 1024)} KB` : "READY"}
                    </span>
                  ) : currentAttachment.fileSize ? (
                    `${Math.round(currentAttachment.fileSize / 1024)} KB`
                  ) : (
                    currentAttachment.fileType.toUpperCase()
                  )}
                </span>
              </div>

              {onRemoveAttachment && (
                <button
                  type="button"
                  onClick={onRemoveAttachment}
                  className="p-1 hover:bg-slate-200/70 dark:hover:bg-white/10 rounded-full cursor-pointer ml-1 text-slate-400 hover:text-slate-700 dark:hover:text-white"
                  title="Remove attachment"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          )}

          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            rows={3}
            placeholder={
              isListening
                ? "Listening... speak now into your microphone"
                : "Ask about flights, sales charts, Excalidraw diagrams, tech jobs, code, or drop files..."
            }
            className="w-full bg-transparent border-0 outline-none resize-none text-[15px] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 leading-relaxed font-sans"
          />

          {/* Bottom Bar inside prompt box */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-white/5 mt-2">
            {/* Left: Plus (+) Button for Native File Attachment */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowAttachMenu(!showAttachMenu)}
                disabled={isUploading}
                className="w-8 h-8 rounded-full border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
                title="Add files (Image Gallery or System File Manager)"
              >
                {isUploading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                ) : (
                  <Plus
                    className={`w-4 h-4 transition-transform duration-200 ${
                      showAttachMenu ? "rotate-45" : ""
                    }`}
                  />
                )}
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
                          Photo gallery &bull; PNG, JPG, WEBP
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

            {/* Right: Voice Input + Send Button */}
            <div className="flex items-center gap-2">
              {/* Microphone Voice Button */}
              <button
                type="button"
                onClick={onToggleVoice}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
                  isListening
                    ? "bg-rose-500 text-white animate-pulse shadow-md shadow-rose-500/30"
                    : "text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5"
                }`}
                title={
                  isTranscribingAudio
                    ? "Transcribing audio via CopilotKit Gemini Voice..."
                    : isListening
                    ? "Stop voice listening"
                    : "Start voice input (Speech-to-Text)"
                }
              >
                {isTranscribingAudio ? (
                  <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                ) : isListening ? (
                  <MicOff className="w-4 h-4 text-white" />
                ) : (
                  <Mic className="w-4 h-4" />
                )}
              </button>

              {/* Send Button */}
              <button
                type="button"
                disabled={!input.trim() && !currentAttachment}
                onClick={handleSend}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium transition-colors duration-150 shadow-xs cursor-pointer ${
                  input.trim() || currentAttachment
                    ? "bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-slate-900 cursor-pointer"
                    : "bg-slate-100 dark:bg-white/5 text-slate-400 dark:text-zinc-600 cursor-not-allowed"
                }`}
              >
                <span>Send</span>
                <ArrowUp className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 4. Quick Suggestion Pills */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.15 }}
        className="flex flex-wrap items-center justify-center gap-2 mt-5 max-w-2xl"
      >
        {suggestions.map((item, idx) => {
          const Icon = item.icon;
          return (
            <button
              key={idx}
              onClick={() => onSendMessage(item.prompt)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-[#1e1f20] hover:bg-slate-100 dark:hover:bg-[#282a2c] border border-slate-200/80 dark:border-white/10 text-xs font-medium text-slate-700 dark:text-zinc-300 transition-colors duration-150 shadow-xs hover:border-slate-300 dark:hover:border-white/20 cursor-pointer"
            >
              <Icon className="w-3.5 h-3.5 text-blue-500 shrink-0" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </motion.div>
    </div>
  );
}
