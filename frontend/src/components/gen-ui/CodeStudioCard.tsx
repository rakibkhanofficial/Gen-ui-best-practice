"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Code2,
  Copy,
  Check,
  Download,
  Terminal,
  Play,
  FileCode,
  Sparkles,
  Layers,
  Cpu
} from "lucide-react";

interface CodeFile {
  filename: string;
  language: string;
  code: string;
  explanation: string;
  output_simulation?: string;
  complexity?: string;
}

interface CodeSnippetData {
  title?: string;
  description?: string;
  active_language?: string;
  execution_command?: string;
  files?: CodeFile[];
}

interface CodeStudioCardProps {
  data?: CodeSnippetData;
  status?: "inProgress" | "executing" | "complete";
}

export function CodeStudioCard({ data, status = "complete" }: CodeStudioCardProps) {
  const [activeFileIndex, setActiveFileIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<"code" | "console">("code");
  const [copied, setCopied] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [consoleOutput, setConsoleOutput] = useState<string | null>(null);

  if (status === "inProgress" || !data?.files || data.files.length === 0) {
    return (
      <div className="w-full max-w-3xl p-6 rounded-2xl glass-panel animate-pulse border border-slate-700/60 my-3">
        <div className="h-6 w-48 bg-slate-700 rounded-md mb-4" />
        <div className="h-10 bg-slate-800 rounded-xl mb-3" />
        <div className="h-64 bg-slate-800/80 rounded-xl" />
      </div>
    );
  }

  const currentFile = data.files[activeFileIndex] || data.files[0];

  const handleCopy = () => {
    navigator.clipboard.writeText(currentFile.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([currentFile.code], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = currentFile.filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleRunSimulation = () => {
    setIsRunning(true);
    setActiveTab("console");
    setConsoleOutput("Compiling and spawning worker process...");
    setTimeout(() => {
      setConsoleOutput(currentFile.output_simulation || "Process completed with exit code 0.");
      setIsRunning(false);
    }, 600);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="w-full max-w-3xl my-4 rounded-2xl glass-panel-elevated p-6 border border-slate-700/60 shadow-2xl relative overflow-hidden text-slate-100"
    >
      {/* Background ambient glow */}
      <div className="absolute top-0 right-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between pb-4 border-b border-slate-700/60 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <Code2 className="w-5 h-5 text-blue-400" />
              {data.title || "Interactive Code Studio"}
            </h3>
            <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full bg-blue-950/80 text-blue-300 border border-blue-800 font-medium">
              <Sparkles className="w-3 h-3" /> GenUI Code
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">{data.description}</p>
        </div>

        {/* Complexity & Command Badge */}
        {currentFile.complexity && (
          <div className="flex items-center gap-2 text-xs bg-slate-900/90 px-3 py-1 rounded-xl border border-slate-700">
            <span className="text-slate-400 font-mono text-[11px]">Complexity:</span>
            <span className="text-emerald-400 font-mono font-semibold text-[11px]">
              {currentFile.complexity}
            </span>
          </div>
        )}
      </div>

      {/* File Tabs & Actions Bar */}
      <div className="flex flex-wrap items-center justify-between mt-4 pb-2 border-b border-slate-800/80 gap-2">
        {/* Multi-file Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {data.files.map((file, idx) => (
            <button
              key={idx}
              onClick={() => {
                setActiveFileIndex(idx);
                setActiveTab("code");
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                activeFileIndex === idx
                  ? "bg-slate-800 text-sky-300 font-bold border border-slate-700"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60"
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              {file.filename}
            </button>
          ))}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Code vs Console View */}
          <div className="flex items-center bg-slate-900 p-0.5 rounded-lg border border-slate-800 text-[11px]">
            <button
              onClick={() => setActiveTab("code")}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                activeTab === "code" ? "bg-blue-600 text-white font-semibold" : "text-slate-400"
              }`}
            >
              Source
            </button>
            <button
              onClick={() => setActiveTab("console")}
              className={`px-2.5 py-1 rounded-md transition-colors flex items-center gap-1 ${
                activeTab === "console" ? "bg-blue-600 text-white font-semibold" : "text-slate-400"
              }`}
            >
              <Terminal className="w-3 h-3" /> Console
            </button>
          </div>

          <button
            onClick={handleRunSimulation}
            disabled={isRunning}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors shadow-sm disabled:opacity-50"
          >
            <Play className="w-3 h-3 fill-current" />
            {isRunning ? "Running..." : "Simulate Run"}
          </button>

          <button
            onClick={handleCopy}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
            title="Copy Code"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={handleDownload}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
            title="Download File"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Code or Console Viewer */}
      {activeTab === "code" ? (
        <div className="my-3 rounded-xl bg-slate-950 border border-slate-800/80 overflow-hidden">
          <div className="max-h-[360px] overflow-y-auto p-4 font-mono text-xs text-slate-200 leading-relaxed">
            <pre className="whitespace-pre">
              {currentFile.code.split("\n").map((line, i) => (
                <div key={i} className="table-row">
                  <span className="table-cell pr-4 text-slate-400 select-none text-right font-mono text-[11px] w-8">
                    {i + 1}
                  </span>
                  <span className="table-cell">{line}</span>
                </div>
              ))}
            </pre>
          </div>
        </div>
      ) : (
        /* Console Terminal Tab */
        <div className="my-3 rounded-xl bg-slate-950 border border-slate-800/80 p-4 font-mono text-xs text-emerald-400 leading-relaxed min-h-[220px]">
          <div className="flex items-center gap-1.5 text-slate-500 border-b border-slate-900 pb-2 mb-2 text-[11px]">
            <Terminal className="w-3.5 h-3.5 text-emerald-400" />
            <span>Terminal Output Simulator &bull; Exit 0</span>
          </div>
          <pre className="whitespace-pre-wrap text-slate-300 font-mono text-[11px]">
            {consoleOutput || currentFile.output_simulation || "Click 'Simulate Run' to execute code."}
          </pre>
        </div>
      )}

      {/* Code Explanation Footer */}
      <div className="p-3 bg-slate-900/70 rounded-xl border border-slate-800 text-xs text-slate-300">
        <span className="font-semibold text-white block mb-0.5">Architecture Insight:</span>
        <p className="text-[11px] text-slate-400 leading-relaxed">{currentFile.explanation}</p>
      </div>
    </motion.div>
  );
}
