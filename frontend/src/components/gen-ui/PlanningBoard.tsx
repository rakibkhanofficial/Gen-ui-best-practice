"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Palette,
  Sparkles,
  Download,
  Copy,
  Check,
  ExternalLink,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  ThumbsUp,
  User,
  ArrowRight,
  Pencil,
  Eye,
  CheckCircle2,
  Play,
  RotateCw
} from "lucide-react";
import confetti from "canvas-confetti";

export interface StickyNote {
  id: string;
  title: string;
  content: string;
  color: "yellow" | "blue" | "green" | "pink" | "purple" | "orange";
  tags: string[];
  votes: number;
  assignee?: string;
  column_id: string;
}

export interface BoardColumn {
  id: string;
  title: string;
  color_accent: string;
  notes: StickyNote[];
}

export interface PlanningBoardData {
  board_id?: string;
  title?: string;
  description?: string;
  last_updated?: string;
  columns?: BoardColumn[];
  initial_mode?: "board" | "canvas";
  mcp_app_url?: string;
  mcp_server_id?: string;
  excalidraw_elements?: any[];
  is_live_generating?: boolean;
}

export interface PlanningBoardProps {
  data?: PlanningBoardData;
  status?: "inProgress" | "executing" | "complete";
  isLiveStreaming?: boolean;
}

const STAGE_THEMES = [
  {
    step: "01",
    label: "Discovery & Specs",
    border: "border-amber-400 dark:border-amber-500",
    bg: "bg-amber-50/90 dark:bg-amber-950/30",
    badge: "bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200",
    dot: "bg-amber-400",
    arrowColor: "#f59e0b",
  },
  {
    step: "02",
    label: "Active Development",
    border: "border-sky-400 dark:border-sky-500",
    bg: "bg-sky-50/90 dark:bg-sky-950/30",
    badge: "bg-sky-100 text-sky-800 dark:bg-sky-900/60 dark:text-sky-200",
    dot: "bg-sky-400",
    arrowColor: "#38bdf8",
  },
  {
    step: "03",
    label: "Review & Validation",
    border: "border-purple-400 dark:border-purple-500",
    bg: "bg-purple-50/90 dark:bg-purple-950/30",
    badge: "bg-purple-100 text-purple-800 dark:bg-purple-900/60 dark:text-purple-200",
    dot: "bg-purple-400",
    arrowColor: "#c084fc",
  },
  {
    step: "04",
    label: "Production Ready",
    border: "border-emerald-400 dark:border-emerald-500",
    bg: "bg-emerald-50/90 dark:bg-emerald-950/30",
    badge: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200",
    dot: "bg-emerald-400",
    arrowColor: "#34d399",
  },
];

export function PlanningBoard({
  data,
  status = "complete",
  isLiveStreaming = false,
}: PlanningBoardProps) {
  const [columns, setColumns] = useState<BoardColumn[]>(data?.columns || []);
  const [activeView, setActiveView] = useState<"diagram" | "editor">("diagram");
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [copiedMcp, setCopiedMcp] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);

  // Live Canvas Drawing State Machine (as in Claude Artifacts & Excalidraw Studio)
  const shouldAnimate = isLiveStreaming || Boolean(data?.is_live_generating);
  const [isDrawing, setIsDrawing] = useState<boolean>(shouldAnimate);
  const [drawnStages, setDrawnStages] = useState<number>(shouldAnimate ? 1 : 4);
  const [pencilCoord, setPencilCoord] = useState<{ x: number; y: number }>({ x: 200, y: 140 });

  useEffect(() => {
    if (data?.columns && data.columns.length > 0) {
      setColumns(data.columns);
    }
  }, [data]);

  // Progressive Live Canvas Drawing Routine
  const startLiveDrawing = () => {
    setIsDrawing(true);
    setDrawnStages(1);
    setPencilCoord({ x: 200, y: 140 });

    const timer1 = setTimeout(() => {
      setDrawnStages(2);
      setPencilCoord({ x: 490, y: 140 });
    }, 500);

    const timer2 = setTimeout(() => {
      setDrawnStages(3);
      setPencilCoord({ x: 780, y: 140 });
    }, 1000);

    const timer3 = setTimeout(() => {
      setDrawnStages(4);
      setPencilCoord({ x: 1070, y: 140 });
    }, 1500);

    const timer4 = setTimeout(() => {
      setIsDrawing(false);
      confetti({
        particleCount: 35,
        spread: 60,
        origin: { y: 0.7 },
        colors: ["#f59e0b", "#38bdf8", "#c084fc", "#34d399"],
      });
    }, 2000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  };

  useEffect(() => {
    if (shouldAnimate) {
      const cancel = startLiveDrawing();
      return cancel;
    }
  }, [shouldAnimate]);

  const mcpServerUrl = data?.mcp_app_url || "https://mcp.excalidraw.com";
  const mcpServerId = data?.mcp_server_id || "example_mcp_app";
  const totalCards = columns.reduce((acc, col) => acc + (col.notes?.length || 0), 0);

  if (status === "inProgress" || !data?.title) {
    return (
      <div className="w-full my-3 h-[460px] rounded-2xl bg-white dark:bg-[#18191a] border border-slate-200 dark:border-white/10 p-5 flex flex-col gap-3 animate-pulse">
        <div className="h-6 w-52 bg-slate-200 dark:bg-white/10 rounded-md" />
        <div className="flex-1 bg-slate-100 dark:bg-white/5 rounded-xl" />
      </div>
    );
  }

  const handleVote = (colId: string, noteId: string) => {
    setColumns((prev) =>
      prev.map((col) => {
        if (col.id !== colId) return col;
        return {
          ...col,
          notes: col.notes.map((n) =>
            n.id === noteId ? { ...n, votes: n.votes + 1 } : n
          ),
        };
      })
    );

    confetti({
      particleCount: 20,
      spread: 45,
      origin: { y: 0.7 },
      colors: ["#f59e0b", "#38bdf8", "#c084fc", "#34d399"],
    });
  };

  const handleAdvanceCard = (fromColId: string, noteId: string) => {
    const colOrder = columns.map((c) => c.id);
    const currIdx = colOrder.indexOf(fromColId);
    if (currIdx < 0 || currIdx >= colOrder.length - 1) return;
    const targetColId = colOrder[currIdx + 1];

    let movedNote: StickyNote | undefined;
    const updated = columns.map((col) => {
      if (col.id === fromColId) {
        return {
          ...col,
          notes: col.notes.filter((n) => {
            if (n.id === noteId) {
              movedNote = { ...n, column_id: targetColId };
              return false;
            }
            return true;
          }),
        };
      }
      return col;
    });

    if (movedNote) {
      setColumns(
        updated.map((col) =>
          col.id === targetColId
            ? { ...col, notes: [...col.notes, movedNote!] }
            : col
        )
      );

      if (targetColId === columns[columns.length - 1].id) {
        confetti({
          particleCount: 45,
          spread: 60,
          origin: { y: 0.75 },
        });
      }
    }
  };

  // Export Excalidraw Scene JSON file
  const handleExportExcalidraw = () => {
    const excalidrawScene = {
      type: "excalidraw",
      version: 2,
      source: mcpServerUrl,
      elements: data?.excalidraw_elements || [],
      appState: {
        viewBackgroundColor: "#ffffff",
        gridSize: 20,
      },
    };

    const blob = new Blob([JSON.stringify(excalidrawScene, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(data?.title || "excalidraw-plan").toLowerCase().replace(/[^a-z0-9]/g, "-")}.excalidraw`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Copy Model Context Protocol payload
  const handleCopyMcpPayload = () => {
    const mcpPayload = {
      jsonrpc: "2.0",
      method: "tools/call",
      params: {
        name: "create_view",
        serverId: mcpServerId,
        arguments: {
          title: data?.title || "Excalidraw Architecture Plan",
          elements: data?.excalidraw_elements || [],
        },
      },
    };

    navigator.clipboard.writeText(JSON.stringify(mcpPayload, null, 2));
    setCopiedMcp(true);
    setTimeout(() => setCopiedMcp(false), 2000);
  };

  return (
    <div className="w-full my-3 rounded-2xl bg-white dark:bg-[#18191a] border border-slate-200/90 dark:border-white/10 shadow-xs relative overflow-hidden flex flex-col h-[500px] font-sans text-slate-800 dark:text-slate-100">
      {/* Excalidraw Sketchy Dot Grid Background Canvas */}
      <div className="absolute inset-0 bg-[radial-gradient(#94a3b8_1px,transparent_1px)] dark:bg-[radial-gradient(#475569_1px,transparent_1px)] [background-size:20px_20px] opacity-40 pointer-events-none" />

      {/* 1. Sleek Header Bar */}
      <div className="relative z-10 px-4 py-2.5 border-b border-slate-200/80 dark:border-white/10 flex items-center justify-between gap-3 shrink-0 bg-white/90 dark:bg-[#18191a]/95 backdrop-blur-xs">
        {/* Left: Brand & Plan Title */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/20">
            <Palette className="w-4 h-4" />
          </div>
          <div className="flex items-center gap-2 min-w-0">
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
              {data.title || "Excalidraw Plan"}
            </h3>
            <span className="shrink-0 inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Excalidraw MCP
            </span>
          </div>
        </div>

        {/* Right: View Switcher, Live Replay & MCP Tools */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Replay Live Drawing Button */}
          {activeView === "diagram" && (
            <button
              onClick={startLiveDrawing}
              disabled={isDrawing}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer ${
                isDrawing
                  ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 animate-pulse"
                  : "bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/20 text-slate-700 dark:text-zinc-200"
              }`}
              title="Replay Claude-style progressive canvas drawing"
            >
              {isDrawing ? (
                <>
                  <Pencil className="w-3 h-3 text-amber-500 animate-bounce" />
                  <span>Drawing...</span>
                </>
              ) : (
                <>
                  <RotateCw className="w-3 h-3 text-slate-500" />
                  <span>Replay Draw</span>
                </>
              )}
            </button>
          )}

          {/* View Toggle: Diagram vs Live Web Editor */}
          <div className="flex items-center p-0.5 rounded-lg bg-slate-100 dark:bg-white/10 text-[11px]">
            <button
              onClick={() => setActiveView("diagram")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                activeView === "diagram"
                  ? "bg-white dark:bg-white/20 text-slate-900 dark:text-white shadow-2xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Eye className="w-3 h-3 text-amber-500" />
              <span>Diagram</span>
            </button>
            <button
              onClick={() => setActiveView("editor")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                activeView === "editor"
                  ? "bg-white dark:bg-white/20 text-slate-900 dark:text-white shadow-2xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
              title="Open embedded Excalidraw editor"
            >
              <Pencil className="w-3 h-3 text-sky-500" />
              <span>Excalidraw Web</span>
            </button>
          </div>

          {activeView === "diagram" && (
            /* Zoom Controls */
            <div className="flex items-center gap-0.5 bg-slate-100 dark:bg-white/10 p-0.5 rounded-lg text-xs">
              <button
                onClick={() => setZoomLevel((z) => Math.max(70, z - 10))}
                className="p-1 rounded hover:bg-white dark:hover:bg-white/10 text-slate-500 dark:text-zinc-400"
                title="Zoom out"
              >
                <ZoomOut className="w-3 h-3" />
              </button>
              <span className="text-[10px] font-mono px-1 font-semibold text-slate-500 dark:text-zinc-400">
                {zoomLevel}%
              </span>
              <button
                onClick={() => setZoomLevel((z) => Math.min(130, z + 10))}
                className="p-1 rounded hover:bg-white dark:hover:bg-white/10 text-slate-500 dark:text-zinc-400"
                title="Zoom in"
              >
                <ZoomIn className="w-3 h-3" />
              </button>
              <button
                onClick={() => setZoomLevel(100)}
                className="p-1 rounded hover:bg-white dark:hover:bg-white/10 text-slate-500 dark:text-zinc-400"
                title="Reset zoom"
              >
                <RotateCcw className="w-2.5 h-2.5" />
              </button>
            </div>
          )}

          {/* MCP Actions */}
          <div className="flex items-center gap-1">
            {/* Copy MCP JSON */}
            <button
              onClick={handleCopyMcpPayload}
              className="hidden sm:inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-200/80 dark:border-white/10 text-slate-700 dark:text-zinc-300 text-[11px] font-medium transition-colors cursor-pointer"
              title="Copy Model Context Protocol scene payload"
            >
              {copiedMcp ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
              <span>{copiedMcp ? "Copied" : "MCP JSON"}</span>
            </button>

            {/* Export .excalidraw */}
            <button
              onClick={handleExportExcalidraw}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-[11px] font-semibold transition-colors cursor-pointer shadow-2xs"
              title="Download native .excalidraw scene"
            >
              <Download className="w-3 h-3" />
              <span className="hidden sm:inline">.excalidraw</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Live Drawing HUD Banner */}
      <AnimatePresence>
        {isDrawing && activeView === "diagram" && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="relative z-20 bg-amber-500/10 dark:bg-amber-950/40 border-b border-amber-500/20 px-4 py-1.5 flex items-center justify-between text-xs text-amber-900 dark:text-amber-200 shrink-0"
          >
            <div className="flex items-center gap-2">
              <Pencil className="w-3.5 h-3.5 text-amber-500 animate-spin" />
              <span className="font-semibold text-[11px]">
                Streaming Canvas Drawing:
              </span>
              <span className="text-[11px] opacity-80">
                Drawing Phase {drawnStages} of 4 ({columns[drawnStages - 1]?.title || "Planning..."})
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] tabular-nums font-bold">
                {drawnStages * 25}%
              </span>
              <div className="w-24 h-1.5 rounded-full bg-amber-200 dark:bg-white/10 overflow-hidden">
                <motion.div
                  className="h-full bg-amber-500 rounded-full"
                  initial={{ width: "25%" }}
                  animate={{ width: `${drawnStages * 25}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. Main Canvas Body */}
      {activeView === "editor" ? (
        /* Full Embedded Excalidraw Web Canvas */
        <div className="relative z-10 flex-1 w-full h-full bg-slate-50 dark:bg-[#121212] overflow-hidden">
          <iframe
            src="https://excalidraw.com"
            className="w-full h-full border-0"
            title="Excalidraw Live Canvas Editor"
            allow="clipboard-read; clipboard-write"
          />
        </div>
      ) : (
        /* Clean Hand-Drawn Excalidraw Architecture Diagram */
        <div
          ref={canvasRef}
          className="relative z-10 flex-1 w-full h-full overflow-auto p-6 select-none bg-slate-50/50 dark:bg-[#161718]"
        >
          <div
            style={{
              transform: `scale(${zoomLevel / 100})`,
              transformOrigin: "top left",
              width: "1180px",
              minHeight: "380px",
            }}
            className="relative transition-transform duration-150"
          >
            {/* Live Drawing Pencil Head Tracking Cursor (Claude Canvas Drawing Effect) */}
            <AnimatePresence>
              {isDrawing && (
                <motion.div
                  animate={{
                    left: pencilCoord.x,
                    top: pencilCoord.y,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 180,
                    damping: 20,
                  }}
                  className="absolute z-30 pointer-events-none -ml-4 -mt-4 flex items-center gap-1.5"
                >
                  <div className="w-8 h-8 rounded-full bg-amber-500 text-white shadow-lg shadow-amber-500/40 flex items-center justify-center animate-bounce">
                    <Pencil className="w-4 h-4 fill-white" />
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-900 text-white shadow-md">
                    Drawing Phase 0{drawnStages}...
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Excalidraw Architectural Flow Stages with Progressive Reveal */}
            <div className="grid grid-cols-4 gap-6">
              {columns.map((col, idx) => {
                const theme = STAGE_THEMES[idx % STAGE_THEMES.length];
                const isVisible = idx < drawnStages;

                return (
                  <motion.div
                    key={col.id}
                    initial={{ opacity: 0, scale: 0.9, y: 12 }}
                    animate={{
                      opacity: isVisible ? 1 : 0.15,
                      scale: isVisible ? 1 : 0.96,
                      y: isVisible ? 0 : 8,
                    }}
                    transition={{
                      duration: 0.35,
                      ease: "easeOut",
                    }}
                    className={`rounded-2xl border-2 ${theme.border} ${theme.bg} p-4 shadow-sm backdrop-blur-xs min-h-[360px] flex flex-col justify-between transition-colors duration-150 ${
                      !isVisible ? "filter blur-[0.5px] pointer-events-none" : ""
                    }`}
                    style={{
                      borderRadius: "16px",
                      boxShadow: "3px 3px 0px rgba(0,0,0,0.06)",
                    }}
                  >
                    {/* Stage Header */}
                    <div>
                      <div className="flex items-center justify-between pb-2 mb-3 border-b border-black/5 dark:border-white/5">
                        <div className="flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full ${theme.dot}`} />
                          <span className="font-mono text-[10px] font-bold opacity-60">
                            PHASE {theme.step}
                          </span>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${theme.badge} font-mono`}>
                          {col.notes.length} tasks
                        </span>
                      </div>

                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-100 mb-3">
                        {col.title}
                      </h4>

                      {/* Excalidraw Hand-drawn Task Blocks */}
                      <div className="space-y-3">
                        {col.notes.map((note) => (
                          <motion.div
                            key={note.id}
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 4 }}
                            transition={{ duration: 0.25 }}
                            className="p-3 rounded-xl bg-white dark:bg-[#202124] border border-slate-200/90 dark:border-white/10 shadow-xs hover:border-slate-400 dark:hover:border-white/20 transition-colors duration-150"
                            style={{
                              boxShadow: "2px 2px 0px rgba(0,0,0,0.04)",
                            }}
                          >
                            <h5 className="text-xs font-bold text-slate-900 dark:text-white leading-snug">
                              {note.title}
                            </h5>
                            <p className="text-[11px] text-slate-600 dark:text-zinc-300 mt-1 leading-relaxed">
                              {note.content}
                            </p>

                            <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-[10px]">
                              <span className="text-slate-500 dark:text-zinc-400 flex items-center gap-1 font-medium">
                                <User className="w-2.5 h-2.5" />
                                {note.assignee || "Team"}
                              </span>

                              <div className="flex items-center gap-1">
                                {idx < columns.length - 1 && (
                                  <button
                                    onClick={() => handleAdvanceCard(col.id, note.id)}
                                    className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-white/10 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                                    title="Advance to next phase"
                                  >
                                    <ArrowRight className="w-3 h-3" />
                                  </button>
                                )}
                                <button
                                  onClick={() => handleVote(col.id, note.id)}
                                  className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-white/10 hover:bg-amber-500/10 hover:text-amber-600 dark:hover:text-amber-400 transition-colors font-semibold text-slate-700 dark:text-zinc-200 cursor-pointer"
                                >
                                  <ThumbsUp className="w-2.5 h-2.5" />
                                  <span>{note.votes}</span>
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    {/* Excalidraw Sketchy Footer Tip */}
                    <div className="pt-3 mt-3 border-t border-black/5 dark:border-white/5 text-[10px] text-slate-400 dark:text-zinc-500 font-mono flex items-center justify-between">
                      <span>Phase {theme.step} verified</span>
                      <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Hand-drawn Style SVG Flow Connectors with Dynamic Stroke Dash Drawing */}
            <svg
              className="absolute inset-0 pointer-events-none w-full h-full"
              style={{ overflow: "visible" }}
            >
              <defs>
                <marker
                  id="excalidraw-arrow"
                  viewBox="0 0 10 10"
                  refX="6"
                  refY="5"
                  markerWidth="7"
                  markerHeight="7"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#64748b" />
                </marker>
              </defs>

              {/* Connecting Stage 1 to Stage 2 */}
              <motion.path
                d="M 285 180 C 310 180, 310 180, 325 180"
                fill="none"
                stroke="#64748b"
                strokeWidth="2"
                strokeDasharray="100"
                initial={{ strokeDashoffset: 100, opacity: 0 }}
                animate={{
                  strokeDashoffset: drawnStages >= 2 ? 0 : 100,
                  opacity: drawnStages >= 2 ? 1 : 0,
                }}
                transition={{ duration: 0.45 }}
                markerEnd="url(#excalidraw-arrow)"
              />

              {/* Connecting Stage 2 to Stage 3 */}
              <motion.path
                d="M 580 180 C 605 180, 605 180, 620 180"
                fill="none"
                stroke="#64748b"
                strokeWidth="2"
                strokeDasharray="100"
                initial={{ strokeDashoffset: 100, opacity: 0 }}
                animate={{
                  strokeDashoffset: drawnStages >= 3 ? 0 : 100,
                  opacity: drawnStages >= 3 ? 1 : 0,
                }}
                transition={{ duration: 0.45 }}
                markerEnd="url(#excalidraw-arrow)"
              />

              {/* Connecting Stage 3 to Stage 4 */}
              <motion.path
                d="M 875 180 C 900 180, 900 180, 915 180"
                fill="none"
                stroke="#64748b"
                strokeWidth="2"
                strokeDasharray="100"
                initial={{ strokeDashoffset: 100, opacity: 0 }}
                animate={{
                  strokeDashoffset: drawnStages >= 4 ? 0 : 100,
                  opacity: drawnStages >= 4 ? 1 : 0,
                }}
                transition={{ duration: 0.45 }}
                markerEnd="url(#excalidraw-arrow)"
              />
            </svg>
          </div>
        </div>
      )}

      {/* 4. Clean MCP Micro-Footer */}
      <div className="relative z-10 px-4 py-1.5 border-t border-slate-200/70 dark:border-white/5 bg-slate-50/90 dark:bg-[#18191a] shrink-0 flex items-center justify-between text-[11px] text-slate-500 dark:text-zinc-400">
        <div className="flex items-center gap-1.5 truncate">
          <Sparkles className="w-3 h-3 text-amber-500 shrink-0" />
          <span className="font-mono text-[10px] truncate">
            MCP Server: <span className="text-slate-800 dark:text-zinc-200">{mcpServerUrl}</span> ({mcpServerId}) &bull; {totalCards} diagram blocks
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[10px] text-slate-400 dark:text-zinc-500 hidden sm:inline">
            Live Progressive SVG Canvas
          </span>
          <a
            href="https://excalidraw.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[10px] text-amber-600 dark:text-amber-400 hover:underline font-medium shrink-0"
          >
            <span>Open Web Canvas</span>
            <ExternalLink className="w-2.5 h-2.5" />
          </a>
        </div>
      </div>
    </div>
  );
}
