"use client";

import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Code2,
  Eye,
  Copy,
  Check,
  Download,
  FileCode,
  WrapText,
  RotateCw,
  ExternalLink,
  Sparkles,
} from "lucide-react";

export interface CodeFile {
  filename: string;
  language: string;
  code: string;
  explanation?: string;
  output_simulation?: string;
  complexity?: string;
}

export interface CodeSnippetData {
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

/**
 * Checks whether a given file contains renderable web content
 * (HTML, SVG, canvas, or single-file web applications).
 */
function isFilePreviewable(file?: CodeFile): boolean {
  if (!file || !file.code) return false;
  const lang = (file.language || "").toLowerCase();
  const name = (file.filename || "").toLowerCase();
  const code = file.code.toLowerCase();

  return (
    lang === "html" ||
    lang === "svg" ||
    name.endsWith(".html") ||
    name.endsWith(".svg") ||
    code.includes("<!doctype html") ||
    code.includes("<html") ||
    code.includes("<svg") ||
    (code.includes("<div") && (code.includes("<style>") || code.includes("<script>")))
  );
}

/**
 * Lightweight, high-contrast IDE Syntax Highlighter for Python, TypeScript,
 * HTML, CSS, JavaScript, SQL, and Shell.
 */
function renderHighlightedLine(line: string, language: string) {
  if (!line) return <span>&nbsp;</span>;

  const lang = (language || "").toLowerCase();

  // 1. Comments
  const trimmed = line.trim();
  if (
    trimmed.startsWith("//") ||
    trimmed.startsWith("#") ||
    trimmed.startsWith("/*") ||
    trimmed.startsWith("*") ||
    trimmed.startsWith("--") ||
    trimmed.startsWith("<!--")
  ) {
    return <span className="text-slate-400 dark:text-zinc-500 italic">{line}</span>;
  }

  // HTML / SVG Tag Highlighting
  if (lang === "html" || lang === "svg" || lang === "xml") {
    const htmlRegex = /(<!--[\s\S]*?-->|<\/?[a-zA-Z0-9\-]+|[a-zA-Z\-]+(?==)|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|[<>/=])/g;
    const parts = [];
    let lastIdx = 0;
    let match;

    while ((match = htmlRegex.exec(line)) !== null) {
      if (match.index > lastIdx) {
        parts.push({ text: line.substring(lastIdx, match.index), type: "plain" });
      }
      const token = match[0];
      let type = "plain";
      if (token.startsWith("<!--")) {
        type = "comment";
      } else if (token.startsWith("<")) {
        type = "tag";
      } else if (token.startsWith('"') || token.startsWith("'")) {
        type = "string";
      } else if (token === "=" || token === ">" || token === "/") {
        type = "punctuation";
      } else {
        type = "attribute";
      }
      parts.push({ text: token, type });
      lastIdx = htmlRegex.lastIndex;
    }
    if (lastIdx < line.length) {
      parts.push({ text: line.substring(lastIdx), type: "plain" });
    }

    return (
      <span>
        {parts.map((p, i) => {
          switch (p.type) {
            case "tag":
              return <span key={i} className="text-rose-400 font-semibold">{p.text}</span>;
            case "attribute":
              return <span key={i} className="text-amber-300">{p.text}</span>;
            case "string":
              return <span key={i} className="text-emerald-300">{p.text}</span>;
            case "punctuation":
              return <span key={i} className="text-slate-400">{p.text}</span>;
            case "comment":
              return <span key={i} className="text-slate-500 italic">{p.text}</span>;
            default:
              return <span key={i} className="text-slate-200">{p.text}</span>;
          }
        })}
      </span>
    );
  }

  // General Programming Languages (Python, TypeScript, JavaScript, SQL, Bash)
  const tokenRegex =
    /(\/\/[^\n]*|#[^\n]*|--[^\n]*|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`|@[a-zA-Z_]\w*|\b(?:import|from|export|default|const|let|var|function|def|async|await|return|class|if|else|elif|for|while|try|except|finally|catch|raise|with|as|in|of|yield|lambda|pass|break|continue|new|type|interface|extends|implements|public|private|static|readonly|case|switch)\b|\b(?:True|False|None|true|false|null|undefined)\b|\b(?:str|int|float|bool|list|dict|set|tuple|Optional|List|Dict|Any|Union|BaseModel|FastAPI|Request|Response|StreamingResponse|Promise|HTMLElement|Record)\b|\b\d+(\.\d+)?\b|[{}()[\].,;:+\-*/%=<>!&|^~])/g;

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

    if (token.startsWith("//") || token.startsWith("#") || token.startsWith("--")) {
      type = "comment";
    } else if (token.startsWith('"') || token.startsWith("'") || token.startsWith("`")) {
      type = "string";
    } else if (token.startsWith("@")) {
      type = "decorator";
    } else if (
      /^(import|from|export|default|const|let|var|function|def|async|await|return|class|if|else|elif|for|while|try|except|finally|catch|raise|with|as|in|of|yield|lambda|pass|break|continue|new|type|interface|extends|implements|public|private|static|readonly|case|switch)$/.test(
        token
      )
    ) {
      type = "keyword";
    } else if (
      /^(str|int|float|bool|list|dict|set|tuple|Optional|List|Dict|Any|Union|BaseModel|FastAPI|Request|Response|StreamingResponse|Promise|HTMLElement|Record)$/.test(
        token
      )
    ) {
      type = "type";
    } else if (/^(True|False|None|true|false|null|undefined)$/.test(token)) {
      type = "constant";
    } else if (/^\d+(\.\d+)?$/.test(token)) {
      type = "number";
    } else if (/^[{}()[\].,;:+\-*/%=<>!&|^~]$/.test(token)) {
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
            return (
              <span key={i} className="text-slate-400 italic">
                {p.text}
              </span>
            );
          case "string":
            return (
              <span key={i} className="text-emerald-300">
                {p.text}
              </span>
            );
          case "decorator":
            return (
              <span key={i} className="text-amber-300 font-medium">
                {p.text}
              </span>
            );
          case "keyword":
            return (
              <span key={i} className="text-purple-400 font-semibold">
                {p.text}
              </span>
            );
          case "type":
            return (
              <span key={i} className="text-cyan-300 font-medium">
                {p.text}
              </span>
            );
          case "constant":
            return (
              <span key={i} className="text-orange-300 font-medium">
                {p.text}
              </span>
            );
          case "number":
            return (
              <span key={i} className="text-amber-400">
                {p.text}
              </span>
            );
          case "punctuation":
            return (
              <span key={i} className="text-slate-400">
                {p.text}
              </span>
            );
          default:
            return (
              <span key={i} className="text-slate-100">
                {p.text}
              </span>
            );
        }
      })}
    </span>
  );
}

export function CodeStudioCard({ data, status = "complete" }: CodeStudioCardProps) {
  const [activeFileIndex, setActiveFileIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [wrapLines, setWrapLines] = useState(false);
  const [viewMode, setViewMode] = useState<"code" | "preview">("code");
  const [previewKey, setPreviewKey] = useState(0);

  if (status === "inProgress" || !data?.files || data.files.length === 0) {
    return (
      <div className="w-full max-w-3xl p-4 rounded-2xl bg-white dark:bg-[#1e1f20] animate-pulse border border-slate-200 dark:border-white/10 my-3">
        <div className="h-9 w-48 bg-slate-200 dark:bg-slate-800 rounded-lg mb-3" />
        <div className="h-64 bg-slate-100 dark:bg-slate-800 rounded-xl" />
      </div>
    );
  }

  const currentFile = data.files[activeFileIndex] || data.files[0];
  const lineCount = currentFile.code.split("\n").length;
  const isPreviewable = isFilePreviewable(currentFile) || data.files.some(isFilePreviewable);

  // Construct comprehensive sandboxed HTML for live preview
  const previewHtml = useMemo(() => {
    const files = data?.files || [];
    // 1. If active file is an HTML document
    if (
      currentFile.code.includes("<html") ||
      currentFile.code.includes("<!DOCTYPE html") ||
      currentFile.code.includes("<!doctype html") ||
      currentFile.filename.endsWith(".html")
    ) {
      let html = currentFile.code;
      // Inject companion CSS if present in separate file
      const cssFile = files.find((f) => f.filename.endsWith(".css") || f.language === "css");
      if (cssFile && !html.includes(cssFile.code)) {
        html = html.replace("</head>", `<style>\n${cssFile.code}\n</style>\n</head>`);
      }
      // Inject companion JS if present in separate file
      const jsFile = files.find(
        (f) => (f.filename.endsWith(".js") || f.language === "javascript") && f.filename !== currentFile.filename
      );
      if (jsFile && !html.includes(jsFile.code)) {
        html = html.replace("</body>", `<script>\n${jsFile.code}\n</script>\n</body>`);
      }
      return html;
    }

    // 2. If active file is SVG
    if (currentFile.filename.endsWith(".svg") || currentFile.code.trim().startsWith("<svg")) {
      return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;display:flex;align-items:center;justify-content:center;min-height:100vh;background:#0d1117;">
  ${currentFile.code}
</body>
</html>`;
    }

    // 3. Fallback for interactive HTML/JS snippets
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="p-6 bg-slate-900 text-slate-100 font-sans min-h-screen flex items-center justify-center">
  ${currentFile.code}
</body>
</html>`;
  }, [currentFile, data.files]);

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

  const handleReloadPreview = () => {
    setPreviewKey((k) => k + 1);
  };

  const handleOpenInNewTab = () => {
    const blob = new Blob([previewHtml], { type: "text/html;charset=utf-8" });
    const blobUrl = URL.createObjectURL(blob);
    window.open(blobUrl, "_blank");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="w-full max-w-3xl my-3 rounded-2xl bg-white dark:bg-[#1e1f20] border border-slate-200 dark:border-white/10 shadow-sm text-slate-800 dark:text-slate-100 overflow-hidden"
    >
      {/* Sleek Top Navigation Bar: File Tabs + Artifact Toggle + Controls */}
      <div className="flex items-center justify-between px-3.5 py-2.5 bg-slate-50/80 dark:bg-white/[0.03] border-b border-slate-200 dark:border-white/10 gap-2">
        {/* Left: File Tabs and Optional Code/Preview Toggle */}
        <div className="flex items-center gap-2 overflow-x-auto min-w-0">
          {/* File Selection Tabs */}
          <div className="flex items-center gap-1.5 shrink-0">
            {data.files.map((file, idx) => {
              const isActive = activeFileIndex === idx;
              return (
                <button
                  key={idx}
                  onClick={() => {
                    setActiveFileIndex(idx);
                    if (isFilePreviewable(file)) {
                      // Keep mode or auto-select preview if requested
                    }
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-medium rounded-lg transition-all cursor-pointer ${
                    isActive
                      ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs"
                      : "bg-slate-200/70 dark:bg-white/5 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/10"
                  }`}
                >
                  <FileCode className="w-3.5 h-3.5 opacity-80" />
                  <span>{file.filename}</span>
                </button>
              );
            })}
          </div>

          {/* Interactive Live Artifact Preview Toggle (Rendered when file is previewable) */}
          {isPreviewable && (
            <div className="flex items-center p-0.5 rounded-lg bg-slate-200/80 dark:bg-white/10 border border-slate-300/60 dark:border-white/5 text-xs shrink-0">
              <button
                onClick={() => setViewMode("code")}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer ${
                  viewMode === "code"
                    ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                    : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>Code</span>
              </button>

              <button
                onClick={() => setViewMode("preview")}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer ${
                  viewMode === "preview"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Preview</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
              </button>
            </div>
          )}
        </div>

        {/* Right: Quick Action Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          {viewMode === "code" && (
            <>
              <span className="hidden sm:inline text-[11px] font-mono text-slate-400 dark:text-zinc-500 mr-1 select-none">
                {lineCount} lines
              </span>

              <button
                onClick={() => setWrapLines(!wrapLines)}
                className={`p-1.5 rounded-lg border text-xs font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                  wrapLines
                    ? "bg-blue-50 dark:bg-blue-950/60 border-blue-300 dark:border-blue-800 text-blue-600 dark:text-blue-300"
                    : "border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-white/10"
                }`}
                title="Toggle word wrap"
              >
                <WrapText className="w-3.5 h-3.5" />
                <span className="hidden sm:inline text-[11px]">Wrap</span>
              </button>
            </>
          )}

          {viewMode === "preview" && (
            <>
              <button
                onClick={handleReloadPreview}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-600 dark:text-zinc-300 text-xs transition-colors cursor-pointer flex items-center gap-1"
                title="Reload live preview"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline text-[11px]">Reload</span>
              </button>

              <button
                onClick={handleOpenInNewTab}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-600 dark:text-zinc-300 text-xs transition-colors cursor-pointer flex items-center gap-1"
                title="Open preview in new tab"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span className="hidden sm:inline text-[11px]">Pop out</span>
              </button>
            </>
          )}

          <button
            onClick={handleCopy}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-700 dark:text-zinc-200 text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
            title="Copy code"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold text-[11px]">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-500 dark:text-zinc-400" />
                <span className="text-[11px]">Copy</span>
              </>
            )}
          </button>

          <button
            onClick={handleDownload}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-600 dark:text-zinc-300 text-xs transition-colors cursor-pointer"
            title={`Download ${currentFile.filename}`}
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main View Area: Either Clean IDE Code Window or Live Interactive Preview Sandbox */}
      {viewMode === "code" ? (
        <div className="bg-[#0d1117] text-slate-100">
          {/* Editor Chrome Titlebar */}
          <div className="flex items-center justify-between px-4 py-2 bg-[#161b22] border-b border-slate-800 text-[11px] font-mono text-slate-400 select-none">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
              <span className="ml-2 text-slate-300 font-medium">{currentFile.filename}</span>
            </div>
            <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">
              {currentFile.language}
            </span>
          </div>

          {/* Code Content with Line Numbers */}
          <div className="max-h-[460px] overflow-y-auto overflow-x-auto p-4 font-mono text-[13px] leading-6">
            <div className="table w-full">
              {currentFile.code.split("\n").map((line, i) => (
                <div key={i} className="table-row hover:bg-white/[0.04] transition-colors">
                  <span className="table-cell pr-4 text-slate-500 select-none text-right font-mono text-xs w-10">
                    {i + 1}
                  </span>
                  <span className={`table-cell ${wrapLines ? "whitespace-pre-wrap break-all" : "whitespace-pre"}`}>
                    {renderHighlightedLine(line, currentFile.language)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Live Interactive Artifact Sandbox Mode */
        <div className="w-full bg-white dark:bg-slate-950 flex flex-col">
          <div className="flex items-center justify-between px-4 py-2 bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-xs">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="font-mono text-[11px] text-slate-700 dark:text-zinc-300 font-medium">
                Live Interactive Sandbox
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-mono">
                RUNNING
              </span>
            </div>
            <div className="text-[11px] text-slate-500 dark:text-zinc-400 font-mono">
              {currentFile.filename}
            </div>
          </div>

          {/* Sandboxed Iframe */}
          <div className="relative w-full h-[460px] bg-white">
            <iframe
              key={previewKey}
              srcDoc={previewHtml}
              sandbox="allow-scripts allow-modals allow-forms"
              className="w-full h-full border-0 bg-white"
              title="Interactive Artifact Sandbox"
            />
          </div>
        </div>
      )}
    </motion.div>
  );
}
