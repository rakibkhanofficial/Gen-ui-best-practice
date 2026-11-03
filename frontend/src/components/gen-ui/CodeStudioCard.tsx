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
  Cpu,
  CheckCircle2
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

// Lightweight zero-dependency IDE Syntax Highlighter
function renderHighlightedLine(line: string, language: string) {
  if (!line) return <span>&nbsp;</span>;

  // 1. Comments
  if (line.trim().startsWith("//") || line.trim().startsWith("#") || line.trim().startsWith("/*") || line.trim().startsWith("*")) {
    return <span className="text-emerald-500/90 dark:text-emerald-400/80 italic">{line}</span>;
  }

  // Tokenize regex for keywords, types, strings, numbers, punctuation
  const tokenRegex = /(\/\/[^\n]*|#[^\n]*|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`|\b(?:import|export|from|default|const|let|var|function|class|return|async|await|if|else|try|catch|def|package|type|interface|new|public|private|yield|for|while|in|of)\b|\b(?:string|number|boolean|void|Promise|Dict|List|Any|Optional|BaseModel|FastAPI|Request|Response|NextRequest|int|float|str|bool)\b|\b(?:true|false|null|None|undefined|\d+)\b|[{}()[\].,;:+\-*/%=<>!&|])/g;

  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = tokenRegex.exec(line)) !== null) {
    if (match.index > lastIndex) {
      parts.push({
        text: line.substring(lastIndex, match.index),
        type: "plain",
      });
    }

    const token = match[0];
    let type = "plain";

    if (token.startsWith("//") || token.startsWith("#")) {
      type = "comment";
    } else if (token.startsWith('"') || token.startsWith("'") || token.startsWith("`")) {
      type = "string";
    } else if (/^(import|export|from|default|const|let|var|function|class|return|async|await|if|else|try|catch|def|package|type|interface|new|public|private|yield|for|while|in|of)$/.test(token)) {
      type = "keyword";
    } else if (/^(string|number|boolean|void|Promise|Dict|List|Any|Optional|BaseModel|FastAPI|Request|Response|NextRequest|int|float|str|bool)$/.test(token)) {
      type = "type";
    } else if (/^(true|false|null|None|undefined|\d+)$/.test(token)) {
      type = "constant";
    } else {
      type = "punctuation";
    }

    parts.push({ text: token, type });
    lastIndex = tokenRegex.lastIndex;
  }

  if (lastIndex < line.length) {
    parts.push({ text: line.substring(lastIndex), type: "plain" });
  }

  return (
    <span>
      {parts.map((p, i) => {
        switch (p.type) {
          case "comment":
            return <span key={i} className="text-emerald-500/90 dark:text-emerald-400/80 italic">{p.text}</span>;
          case "string":
            return <span key={i} className="text-amber-500 dark:text-amber-300">{p.text}</span>;
          case "keyword":
            return <span key={i} className="text-purple-600 dark:text-purple-400 font-bold">{p.text}</span>;
          case "type":
            return <span key={i} className="text-cyan-600 dark:text-cyan-400 font-semibold">{p.text}</span>;
          case "constant":
            return <span key={i} className="text-orange-600 dark:text-orange-400">{p.text}</span>;
          case "punctuation":
            return <span key={i} className="text-slate-500 dark:text-slate-400">{p.text}</span>;
          default:
            return <span key={i} className="text-slate-800 dark:text-slate-200">{p.text}</span>;
        }
      })}
    </span>
  );
}

export function CodeStudioCard({ data, status = "complete" }: CodeStudioCardProps) {
  const [activeFileIndex, setActiveFileIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<"code" | "console">("code");
  const [copied, setCopied] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [consoleOutput, setConsoleOutput] = useState<string | null>(null);

  if (status === "inProgress" || !data?.files || data.files.length === 0) {
    return (
      <div className="w-full max-w-3xl p-6 rounded-3xl bg-white dark:bg-[#1e1f20] animate-pulse border border-slate-200 dark:border-white/10 my-3">
        <div className="h-6 w-48 bg-slate-200 dark:bg-slate-700 rounded-md mb-4" />
        <div className="h-10 bg-slate-100 dark:bg-slate-800 rounded-xl mb-3" />
        <div className="h-64 bg-slate-100 dark:bg-slate-800 rounded-2xl" />
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
    setConsoleOutput(`$ ${data.execution_command || "npm run build && node dist/index.js"}\nCompiling worker process...`);
    setTimeout(() => {
      setConsoleOutput(
        (prev) => `${prev}\n\n[stdout]\n${currentFile.output_simulation || "Process completed with exit code 0."}\n\n✓ Worker finished in 48ms.`
      );
      setIsRunning(false);
    }, 600);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="w-full max-w-3xl my-4 rounded-3xl bg-white dark:bg-[#1a1b1c] p-6 border border-slate-200/90 dark:border-white/10 shadow-xl shadow-blue-500/5 relative overflow-hidden text-slate-800 dark:text-slate-100"
    >
      {/* Background ambient glow */}
      <div className="absolute top-0 right-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between pb-4 border-b border-slate-200/80 dark:border-white/10 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              <Code2 className="w-5 h-5 text-blue-500" />
              {data.title || "Interactive Code Studio"}
            </h3>
            <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 font-medium">
              <Sparkles className="w-3 h-3" /> IDE Studio
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{data.description}</p>
        </div>

        {/* Complexity badge */}
        {currentFile.complexity && (
          <div className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 font-mono font-medium border border-slate-200 dark:border-white/10">
            <Cpu className="w-3.5 h-3.5 text-blue-500" />
            <span>Complexity: {currentFile.complexity}</span>
          </div>
        )}
      </div>

      {/* VS Code File Tabs Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 mt-4 pb-2 border-b border-slate-200/80 dark:border-white/10">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {data.files.map((file, idx) => (
            <button
              key={idx}
              onClick={() => {
                setActiveFileIndex(idx);
                setActiveTab("code");
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-medium rounded-xl transition-all cursor-pointer ${
                activeFileIndex === idx
                  ? "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 shadow-2xs"
                  : "bg-slate-50 dark:bg-white/5 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 border border-slate-200/70 dark:border-white/5"
              }`}
            >
              <FileCode className="w-3.5 h-3.5 text-blue-500" />
              <span>{file.filename}</span>
            </button>
          ))}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5">
          {/* Source vs Console Toggle */}
          <div className="flex items-center bg-slate-100 dark:bg-white/10 p-0.5 rounded-xl border border-slate-200 dark:border-white/10 text-[11px]">
            <button
              onClick={() => setActiveTab("code")}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                activeTab === "code"
                  ? "bg-blue-600 text-white font-semibold shadow-xs"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              Source
            </button>
            <button
              onClick={() => setActiveTab("console")}
              className={`px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 cursor-pointer ${
                activeTab === "console"
                  ? "bg-blue-600 text-white font-semibold shadow-xs"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              <Terminal className="w-3 h-3" /> Console
            </button>
          </div>

          <button
            onClick={handleRunSimulation}
            disabled={isRunning}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition-colors shadow-xs cursor-pointer disabled:opacity-50"
          >
            <Play className="w-3 h-3 fill-current" />
            <span>{isRunning ? "Running..." : "Run"}</span>
          </button>

          <button
            onClick={handleCopy}
            className="p-1.5 rounded-xl bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10 transition-colors cursor-pointer"
            title="Copy Code"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={handleDownload}
            className="p-1.5 rounded-xl bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10 transition-colors cursor-pointer"
            title="Download File"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Code Editor Window with VS Code Colorful Highlighting */}
      {activeTab === "code" ? (
        <div className="my-3 rounded-2xl bg-slate-950 border border-slate-800 shadow-inner overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2 bg-slate-900/90 border-b border-slate-800 text-[11px] font-mono text-slate-400">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
              <span className="ml-2 text-slate-300 font-medium">{currentFile.filename}</span>
            </div>
            <span className="text-[10px] uppercase font-mono tracking-wider opacity-70">
              {currentFile.language}
            </span>
          </div>

          <div className="max-h-[380px] overflow-y-auto p-4 font-mono text-xs leading-relaxed">
            <div className="table w-full">
              {currentFile.code.split("\n").map((line, i) => (
                <div key={i} className="table-row hover:bg-white/5 transition-colors">
                  <span className="table-cell pr-4 text-slate-600 select-none text-right font-mono text-[11px] w-8">
                    {i + 1}
                  </span>
                  <span className="table-cell whitespace-pre">
                    {renderHighlightedLine(line, currentFile.language)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Console Output Simulator */
        <div className="my-3 rounded-2xl bg-black border border-slate-800 p-4 font-mono text-xs text-emerald-400 leading-relaxed min-h-[220px]">
          <div className="flex items-center gap-1.5 text-slate-500 text-[11px] pb-2 border-b border-slate-800 mb-3">
            <Terminal className="w-3.5 h-3.5 text-emerald-500" />
            <span>Interactive Terminal Simulation</span>
          </div>
          <pre className="whitespace-pre-wrap">
            {consoleOutput || `$ ${data.execution_command || "npm run build && node dist/index.js"}\nReady to simulate execution.`}
          </pre>
        </div>
      )}

      {/* Bottom Explanation Drawer */}
      <div className="mt-3 p-3.5 rounded-2xl bg-slate-50/80 dark:bg-white/5 border border-slate-200/80 dark:border-white/5">
        <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-1 flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-blue-500" />
          <span>Implementation Architecture Note</span>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          {currentFile.explanation}
        </p>
      </div>
    </motion.div>
  );
}
