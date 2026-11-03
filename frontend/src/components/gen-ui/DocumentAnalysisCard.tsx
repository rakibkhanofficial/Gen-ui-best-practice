"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  CheckCircle2,
  BookOpen,
  Download,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Tag,
  Sparkles
} from "lucide-react";

export interface DocumentAnalysisData {
  filename: string;
  file_path: string;
  file_type: string;
  file_size_kb: number;
  page_count: number;
  word_count: number;
  summary: string;
  key_takeaways: string[];
  topics: string[];
  preview_text: string;
  download_url?: string;
  processed_at?: string;
}

interface DocumentAnalysisCardProps {
  data?: DocumentAnalysisData;
}

export function DocumentAnalysisCard({ data }: DocumentAnalysisCardProps) {
  const [showFullText, setShowFullText] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!data) return null;

  const handleCopySummary = () => {
    navigator.clipboard.writeText(data.summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-3xl bg-white dark:bg-[#1e1f20] border border-slate-200/80 dark:border-white/10 shadow-sm overflow-hidden select-none font-sans"
    >
      {/* 1. Header Bar */}
      <div className="px-5 py-3.5 border-b border-slate-200/70 dark:border-white/5 flex items-center justify-between bg-slate-50/60 dark:bg-white/[0.02]">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <FileText className="w-4 h-4" />
          </div>
          <div className="truncate">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-xs text-slate-900 dark:text-white truncate">
                {data.filename}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-bold">
                {data.file_type}
              </span>
            </div>
            <span className="text-[11px] text-slate-400 dark:text-zinc-500 block truncate">
              {data.word_count.toLocaleString()} words &bull; ~{data.page_count} {data.page_count === 1 ? "page" : "pages"} &bull; {data.file_size_kb} KB
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={handleCopySummary}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
            title="Copy summary"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
          {data.download_url && (
            <a
              href={data.download_url}
              download
              className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
              title="Download file"
            >
              <Download className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </div>

      {/* 2. Body Details */}
      <div className="p-5 space-y-4">
        {/* Executive Summary */}
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/5">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 dark:text-zinc-200 mb-1.5">
            <BookOpen className="w-3.5 h-3.5 text-blue-500" />
            <span>Executive Overview</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
            {data.summary}
          </p>
        </div>

        {/* Key Takeaways */}
        {data.key_takeaways && data.key_takeaways.length > 0 && (
          <div className="space-y-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400 font-mono">
              Key Findings &amp; Insights
            </span>
            <div className="space-y-1.5">
              {data.key_takeaways.map((point, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2 p-2.5 rounded-xl bg-slate-50/70 dark:bg-white/[0.02] border border-slate-200/50 dark:border-white/5 text-xs text-slate-700 dark:text-zinc-300"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{point}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Extracted Preview Text Snippet */}
        {data.preview_text && (
          <div className="rounded-2xl border border-slate-200/60 dark:border-white/5 overflow-hidden bg-slate-900/[0.02] dark:bg-black/20">
            <button
              onClick={() => setShowFullText(!showFullText)}
              className="w-full px-4 py-2 flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-zinc-300 bg-slate-100/50 dark:bg-white/[0.04] cursor-pointer"
            >
              <span>Extracted Text Preview</span>
              {showFullText ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
            <div className={`p-4 text-xs font-mono text-slate-600 dark:text-zinc-400 whitespace-pre-wrap leading-relaxed ${showFullText ? "" : "max-h-24 overflow-hidden relative"}`}>
              {data.preview_text}
              {!showFullText && (
                <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-slate-50 dark:from-[#1e1f20] to-transparent pointer-events-none" />
              )}
            </div>
          </div>
        )}

        {/* Topics Pills */}
        {data.topics && data.topics.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            {data.topics.map((t, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-white/5 text-[10px] text-slate-600 dark:text-zinc-400 font-medium"
              >
                <Tag className="w-2.5 h-2.5 opacity-60" />
                {t}
              </span>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

