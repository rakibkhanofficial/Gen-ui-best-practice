"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Image as ImageIcon,
  Sparkles,
  Maximize2,
  Minimize2,
  Tag,
  Palette,
  Eye,
  Copy,
  Check,
  ExternalLink,
  Download
} from "lucide-react";

export interface ImageAnalysisData {
  filename: string;
  file_path: string;
  file_url: string;
  format: string;
  file_size_kb: number;
  dimensions: string;
  aspect_ratio: string;
  visual_summary: string;
  detected_labels: Array<{ label: string; confidence: number }>;
  dominant_colors: Array<{ name: string; hex: string }>;
  ocr_extracted_text?: string;
  processed_at?: string;
}

interface ImageAnalysisCardProps {
  data?: ImageAnalysisData;
}

export function ImageAnalysisCard({ data }: ImageAnalysisCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!data) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(data.visual_summary);
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
          <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
            <ImageIcon className="w-4 h-4" />
          </div>
          <div className="truncate">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-xs text-slate-900 dark:text-white truncate">
                {data.filename}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 font-bold">
                {data.format}
              </span>
            </div>
            <span className="text-[11px] text-slate-400 dark:text-zinc-500 block truncate">
              {data.dimensions} &bull; {data.file_size_kb} KB &bull; {data.aspect_ratio}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
            title={isExpanded ? "Collapse image preview" : "Expand image preview"}
          >
            {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={handleCopy}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
            title="Copy visual summary"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* 2. Visual Content & Analysis */}
      <div className="p-5 space-y-4">
        {/* Responsive Image Preview */}
        <div
          className={`relative rounded-2xl overflow-hidden bg-slate-900/5 dark:bg-black/30 border border-slate-200/60 dark:border-white/5 flex items-center justify-center transition-all duration-300 ${
            isExpanded ? "max-h-[500px]" : "max-h-64"
          }`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={data.file_url || "/placeholder-image.png"}
            alt={data.filename}
            className="w-full h-auto object-contain max-h-full"
            onError={(e) => {
              // Graceful fallback if image URL is local path
              (e.target as HTMLElement).style.display = "none";
            }}
          />
        </div>

        {/* Visual Summary */}
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/5">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 dark:text-zinc-200 mb-1.5">
            <Eye className="w-3.5 h-3.5 text-blue-500" />
            <span>Visual Understanding</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
            {data.visual_summary}
          </p>
        </div>

        {/* Labels & Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Detected Labels */}
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/5 space-y-2">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-700 dark:text-zinc-300">
              <Tag className="w-3 h-3 text-purple-500" />
              <span>Detected Attributes</span>
            </div>
            <div className="space-y-1.5">
              {data.detected_labels.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs">
                  <span className="text-slate-600 dark:text-zinc-400 text-[11px] truncate">
                    {item.label}
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 rounded-full bg-slate-200 dark:bg-zinc-800 overflow-hidden">
                      <div
                        className="h-full bg-purple-500 rounded-full"
                        style={{ width: `${Math.round(item.confidence * 100)}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-mono text-slate-500 dark:text-zinc-400">
                      {Math.round(item.confidence * 100)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Color Palette */}
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/5 space-y-2">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-700 dark:text-zinc-300">
              <Palette className="w-3 h-3 text-indigo-500" />
              <span>Dominant Color Palette</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {data.dominant_colors.map((color, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 p-1.5 rounded-xl bg-white dark:bg-black/20 border border-slate-200/50 dark:border-white/5"
                >
                  <div
                    className="w-4 h-4 rounded-full border border-black/10 dark:border-white/20 shrink-0 shadow-2xs"
                    style={{ backgroundColor: color.hex }}
                  />
                  <div className="truncate">
                    <span className="text-[10px] font-medium block truncate text-slate-800 dark:text-zinc-200">
                      {color.name}
                    </span>
                    <span className="text-[9px] font-mono text-slate-400 dark:text-zinc-500 block">
                      {color.hex}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

