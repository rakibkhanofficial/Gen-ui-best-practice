"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  HardDrive,
  ExternalLink,
  Download,
  Copy,
  Check,
  Search,
  FileText,
  Image as ImageIcon,
  FileSpreadsheet,
  FileCode,
  Sparkles,
  Server,
  Layers,
  Database,
  ArrowUpRight
} from "lucide-react";

export interface SiloStoredFile {
  object_name: string;
  filename: string;
  size_bytes?: number;
  size_kb?: number;
  size_formatted?: string;
  last_modified?: string;
  etag?: string;
  content_type?: string;
  file_type?: "image" | "document" | "spreadsheet" | "other" | string;
  minio_url?: string;
  s3_uri?: string;
  download_url?: string;
  proxy_url?: string;
}

export interface SiloStorageData {
  status?: string;
  storage_provider?: string;
  bucket?: string;
  endpoint?: string;
  console_url?: string;
  total_files?: number;
  total_size_formatted?: string;
  type_counts?: {
    images?: number;
    documents?: number;
    spreadsheets?: number;
    other?: number;
  };
  active_filter?: string;
  search_query?: string;
  files?: SiloStoredFile[];
  recommended_actions?: Array<{
    label: string;
    prompt?: string;
    url?: string;
  }>;
}

interface SiloStorageCardProps {
  data?: SiloStorageData;
  onTriggerQuery?: (query: string) => void;
}

export function SiloStorageCard({ data, onTriggerQuery }: SiloStorageCardProps) {
  const [activeTab, setActiveTab] = useState<"all" | "document" | "image" | "spreadsheet">("all");
  const [searchFilter, setSearchFilter] = useState<string>("");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!data) return null;

  const bucketName = data.bucket || "genui-uploads";
  const consoleUrl = data.console_url || "http://localhost:9001";
  const endpoint = data.endpoint || "http://localhost:9000";
  const allFiles = data.files || [];

  // Client-side filtering
  const filteredFiles = allFiles.filter((file) => {
    const matchesTab =
      activeTab === "all" ? true : file.file_type === activeTab;
    const matchesSearch =
      !searchFilter.trim() ||
      file.filename.toLowerCase().includes(searchFilter.toLowerCase()) ||
      (file.etag && file.etag.toLowerCase().includes(searchFilter.toLowerCase()));
    return matchesTab && matchesSearch;
  });

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const getFileIcon = (type?: string) => {
    switch (type) {
      case "image":
        return <ImageIcon className="w-4 h-4 text-purple-500" />;
      case "spreadsheet":
        return <FileSpreadsheet className="w-4 h-4 text-emerald-500" />;
      case "document":
        return <FileText className="w-4 h-4 text-blue-500" />;
      default:
        return <FileCode className="w-4 h-4 text-slate-400" />;
    }
  };

  const getBadgeClass = (type?: string) => {
    switch (type) {
      case "image":
        return "bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800";
      case "spreadsheet":
        return "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800";
      case "document":
        return "bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800";
      default:
        return "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-3xl bg-white dark:bg-[#1e1f20] border border-slate-200/80 dark:border-white/10 shadow-sm overflow-hidden font-sans select-none"
    >
      {/* 1. Header Bar */}
      <div className="px-5 py-4 border-b border-slate-200/70 dark:border-white/5 flex flex-wrap items-center justify-between gap-3 bg-slate-50/60 dark:bg-white/[0.02]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/20">
            <HardDrive className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-sm text-slate-900 dark:text-white">
                Silo MinIO Object Storage
              </h3>
              <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                S3 Live
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400 flex items-center gap-2 mt-0.5 font-mono">
              <span>bucket: <strong className="text-slate-700 dark:text-zinc-300">{bucketName}</strong></span>
              <span>&bull;</span>
              <span>endpoint: <strong className="text-slate-700 dark:text-zinc-300">{endpoint}</strong></span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={consoleUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-xs font-semibold text-slate-700 dark:text-zinc-200 transition-colors border border-slate-200/80 dark:border-white/5 cursor-pointer"
          >
            <span>MinIO Console</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-60" />
          </a>
        </div>
      </div>

      {/* 2. KPI Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-4 bg-slate-50/30 dark:bg-black/10 border-b border-slate-200/60 dark:border-white/5 text-xs">
        <div className="p-3 rounded-2xl bg-white dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/5">
          <span className="text-[10px] text-slate-400 dark:text-zinc-500 uppercase tracking-wider font-mono block">
            Stored Objects
          </span>
          <span className="text-lg font-bold text-slate-900 dark:text-white mt-0.5 block">
            {data.total_files ?? allFiles.length}
          </span>
        </div>

        <div className="p-3 rounded-2xl bg-white dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/5">
          <span className="text-[10px] text-slate-400 dark:text-zinc-500 uppercase tracking-wider font-mono block">
            Total Storage
          </span>
          <span className="text-lg font-bold text-slate-900 dark:text-white mt-0.5 block">
            {data.total_size_formatted || "0 KB"}
          </span>
        </div>

        <div className="p-3 rounded-2xl bg-white dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/5">
          <span className="text-[10px] text-slate-400 dark:text-zinc-500 uppercase tracking-wider font-mono block">
            Storage Engine
          </span>
          <span className="text-xs font-semibold text-slate-800 dark:text-zinc-200 mt-1 block font-mono truncate">
            pgsty/silo (S3)
          </span>
        </div>

        <div className="p-3 rounded-2xl bg-white dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/5">
          <span className="text-[10px] text-slate-400 dark:text-zinc-500 uppercase tracking-wider font-mono block">
            Bucket Policy
          </span>
          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-1 block font-mono">
            Public Direct Read
          </span>
        </div>
      </div>

      {/* 3. Filter Tabs & Search Bar */}
      <div className="p-4 border-b border-slate-200/60 dark:border-white/5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-white/5">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
              activeTab === "all"
                ? "bg-white dark:bg-[#2b2c2d] text-slate-900 dark:text-white shadow-xs"
                : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            All ({allFiles.length})
          </button>
          <button
            onClick={() => setActiveTab("document")}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
              activeTab === "document"
                ? "bg-white dark:bg-[#2b2c2d] text-slate-900 dark:text-white shadow-xs"
                : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Docs ({data.type_counts?.documents ?? allFiles.filter(f => f.file_type === "document").length})
          </button>
          <button
            onClick={() => setActiveTab("image")}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
              activeTab === "image"
                ? "bg-white dark:bg-[#2b2c2d] text-slate-900 dark:text-white shadow-xs"
                : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Images ({data.type_counts?.images ?? allFiles.filter(f => f.file_type === "image").length})
          </button>
          <button
            onClick={() => setActiveTab("spreadsheet")}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
              activeTab === "spreadsheet"
                ? "bg-white dark:bg-[#2b2c2d] text-slate-900 dark:text-white shadow-xs"
                : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Sheets ({data.type_counts?.spreadsheets ?? allFiles.filter(f => f.file_type === "spreadsheet").length})
          </button>
        </div>

        <div className="relative w-full sm:w-56">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search files or ETag..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-amber-500/50"
          />
        </div>
      </div>

      {/* 4. Files List */}
      <div className="p-4 space-y-2 max-h-80 overflow-y-auto">
        {filteredFiles.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-400 dark:text-zinc-500">
            <Layers className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="font-semibold text-slate-700 dark:text-zinc-300">No stored files found</p>
            <p className="text-[11px] mt-0.5">Upload any document, image, or spreadsheet to populate Silo MinIO storage.</p>
          </div>
        ) : (
          filteredFiles.map((file, idx) => {
            const downloadUrl = file.download_url || file.minio_url || `/api/files/${encodeURIComponent(file.filename)}`;
            const s3Uri = file.s3_uri || `s3://${bucketName}/${file.filename}`;

            return (
              <div
                key={idx}
                className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-slate-50/70 hover:bg-slate-100/70 dark:bg-white/[0.02] dark:hover:bg-white/[0.04] border border-slate-200/50 dark:border-white/5 transition-all"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-white dark:bg-white/5 border border-slate-200/60 dark:border-white/5 flex items-center justify-center shrink-0">
                    {getFileIcon(file.file_type)}
                  </div>
                  <div className="min-w-0 truncate">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-slate-900 dark:text-white truncate">
                        {file.filename}
                      </span>
                      <span
                        className={`text-[9px] uppercase font-mono px-1.5 py-0.2 rounded border font-bold ${getBadgeClass(
                          file.file_type
                        )}`}
                      >
                        {file.file_type || "file"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 dark:text-zinc-500 font-mono mt-0.5 truncate">
                      <span>{file.size_formatted || `${file.size_kb || 0} KB`}</span>
                      <span>&bull;</span>
                      <span className="truncate">{s3Uri}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => handleCopy(s3Uri, `s3-${idx}`)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-white/10 transition-colors"
                    title="Copy S3 URI"
                  >
                    {copiedKey === `s3-${idx}` ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>

                  <a
                    href={downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-slate-200/60 dark:hover:bg-white/10 transition-colors"
                    title="Open / Download from Silo"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </a>

                  {onTriggerQuery && (
                    <button
                      onClick={() => {
                        const promptText =
                          file.file_type === "image"
                            ? `Analyze visual elements of image ${file.filename}`
                            : file.file_type === "spreadsheet"
                            ? `Analyze sales spreadsheet ${file.filename}`
                            : `Analyze document ${file.filename}`;
                        onTriggerQuery(promptText);
                      }}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/20 text-[11px] font-semibold transition-colors cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Analyze</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 5. Recommended Actions Footer */}
      {data.recommended_actions && data.recommended_actions.length > 0 && (
        <div className="p-3.5 bg-slate-50/60 dark:bg-white/[0.02] border-t border-slate-200/60 dark:border-white/5 flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-mono uppercase text-slate-400 dark:text-zinc-500 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-500" /> Actions:
          </span>
          {data.recommended_actions.map((act, idx) => {
            if (act.url) {
              return (
                <a
                  key={idx}
                  href={act.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white dark:bg-white/5 text-xs text-slate-700 dark:text-zinc-300 border border-slate-200/70 dark:border-white/5 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                >
                  <span>{act.label}</span>
                  <ArrowUpRight className="w-3 h-3 opacity-60" />
                </a>
              );
            }
            return (
              <button
                key={idx}
                onClick={() => act.prompt && onTriggerQuery && onTriggerQuery(act.prompt)}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white dark:bg-white/5 text-xs text-slate-700 dark:text-zinc-300 border border-slate-200/70 dark:border-white/5 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
              >
                <span>{act.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
