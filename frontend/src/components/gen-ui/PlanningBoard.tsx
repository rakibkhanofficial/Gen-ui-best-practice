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
  Maximize2,
  ThumbsUp,
  User,
  ArrowRight,
  Pencil,
  Eye,
  CheckCircle2,
  RotateCw,
  MoreHorizontal,
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
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);
  const moreMenuRef = useRef<HTMLDivElement>(null);

  // Dynamic layout metrics based on column count
  const colCount = Math.max(1, columns.length);
  const columnWidth = 280;
  const columnGap = 20;
  const boardWidth = colCount * columnWidth + (colCount - 1) * columnGap;

  // Auto-fit zoom calculation
  const fitToScreen = () => {
    if (!canvasRef.current) return;
    const containerWidth = canvasRef.current.clientWidth - 48; // padding buffer
    if (containerWidth > 0 && boardWidth > 0) {
      // Calculate scale so that ALL columns fit comfortably without horizontal scroll
      const idealScale = Math.min(100, Math.max(50, Math.floor((containerWidth / boardWidth) * 100)));
      setZoomLevel(idealScale);
    }
  };

  useEffect(() => {
    if (data?.columns && data.columns.length > 0) {
      setColumns(data.columns);
    }
  }, [data]);

  // Initial and responsive auto-fit
  useEffect(() => {
    const timer = setTimeout(fitToScreen, 150);
    window.addEventListener("resize", fitToScreen);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", fitToScreen);
    };
  }, [columns.length, boardWidth]);

  // Close more menu on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(e.target as Node)) {
        setShowMoreMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Live Canvas Drawing State
  const shouldAnimate = isLiveStreaming || Boolean(data?.is_live_generating);
  const [isDrawing, setIsDrawing] = useState<boolean>(shouldAnimate);
  const [drawnStages, setDrawnStages] = useState<number>(shouldAnimate ? 1 : 4);
  const [pencilCoord, setPencilCoord] = useState<{ x: number; y: number }>({ x: 200, y: 140 });

  const startLiveDrawing = () => {
    setIsDrawing(true);
    setDrawnStages(1);
    setPencilCoord({ x: 180, y: 140 });

    const timer1 = setTimeout(() => {
      setDrawnStages(2);
      setPencilCoord({ x: 180 + columnWidth + columnGap, y: 140 });
    }, 500);

    const timer2 = setTimeout(() => {
      setDrawnStages(3);
      setPencilCoord({ x: 180 + 2 * (columnWidth + columnGap), y: 140 });
    }, 1000);

    const timer3 = setTimeout(() => {
      setDrawnStages(4);
      setPencilCoord({ x: 180 + 3 * (columnWidth + columnGap), y: 140 });
    }, 1500);

    const timer4 = setTimeout(() => {
      setIsDrawing(false);
      confetti({
        particleCount: 30,
        spread: 55,
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
      particleCount: 15,
      spread: 40,
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
          particleCount: 35,
          spread: 55,
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

  // Copy MCP JSON
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
    setTimeout(() => {
      setCopiedMcp(false);
      setShowMoreMenu(false);
    }, 2000);
  };

  return (
    <div className="w-full my-3 rounded-2xl bg-white dark:bg-[#18191a] border border-slate-200/90 dark:border-white/10 shadow-sm relative overflow-hidden flex flex-col h-[500px] font-sans text-slate-800 dark:text-slate-100">
      {/* Dot Grid Background */}
      <div className="absolute inset-0 bg-[radial-gradient(#94a3b8_1px,transparent_1px)] dark:bg-[radial-gradient(#475569_1px,transparent_1px)] [background-size:20px_20px] opacity-30 pointer-events-none" />

      {/* 1. Streamlined, Clean Top Toolbar (Without Clutter) */}
      <div className="relative z-10 px-4 py-2 border-b border-slate-200/80 dark:border-white/10 flex items-center justify-between gap-3 shrink-0 bg-white/95 dark:bg-[#18191a]/95 backdrop-blur-xs">
        {/* Left: Clean Brand & Title */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/20">
            <Palette className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0">
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
              {data.title || "Excalidraw Plan"}
            </h3>
          </div>
        </div>

        {/* Right: Essential Controls (View Toggle, Zoom & Fit, Export) */}
        <div className="flex items-center gap-2 shrink-0">
          {/* View Toggle */}
          <div className="flex items-center p-0.5 rounded-lg bg-slate-100 dark:bg-white/10 text-[11px]">
            <button
              type="button"
              onClick={() => setActiveView("diagram")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                activeView === "diagram"
                  ? "bg-white dark:bg-white/20 text-slate-900 dark:text-white shadow-2xs"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Eye className="w-3 h-3 text-amber-500" />
              <span>Diagram</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveView("editor")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                activeView === "editor"
                  ? "bg-white dark:bg-white/20 text-slate-900 dark:text-white shadow-2xs"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
              title="Open embedded Excalidraw editor"
            >
              <Pencil className="w-3 h-3 text-sky-500" />
              <span>Web Editor</span>
            </button>
          </div>

          {/* Compact Zoom & Fit-to-Screen Controls */}
          {activeView === "diagram" && (
            <div className="flex items-center bg-slate-100 dark:bg-white/10 p-0.5 rounded-lg text-xs">
              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.max(50, z - 10))}
                className="p-1 rounded hover:bg-white dark:hover:bg-white/10 text-slate-600 dark:text-zinc-300 cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut className="w-3 h-3" />
              </button>

              <span className="text-[10px] font-mono px-1.5 font-bold text-slate-700 dark:text-zinc-200 min-w-[36px] text-center">
                {zoomLevel}%
              </span>

              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.min(140, z + 10))}
                className="p-1 rounded hover:bg-white dark:hover:bg-white/10 text-slate-600 dark:text-zinc-300 cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="w-3 h-3" />
              </button>

              {/* Fit-to-Screen Button */}
              <button
                type="button"
                onClick={fitToScreen}
                className="ml-0.5 px-1.5 py-0.5 rounded hover:bg-white dark:hover:bg-white/10 text-[10px] font-medium text-slate-600 dark:text-zinc-300 flex items-center gap-1 cursor-pointer border-l border-slate-200 dark:border-white/10"
                title="Fit all stages to screen"
              >
                <Maximize2 className="w-2.5 h-2.5 text-amber-500" />
                <span>Fit</span>
              </button>
            </div>
          )}

          {/* Export Button */}
          <button
            type="button"
            onClick={handleExportExcalidraw}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-[11px] font-semibold transition-colors cursor-pointer shadow-2xs"
            title="Download .excalidraw scene file"
          >
            <Download className="w-3 h-3" />
            <span className="hidden sm:inline">.excalidraw</span>
          </button>

          {/* Overflow Menu for Secondary Actions */}
          <div className="relative" ref={moreMenuRef}>
            <button
              type="button"
              onClick={() => setShowMoreMenu(!showMoreMenu)}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors cursor-pointer"
              title="More options"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>

            <AnimatePresence>
              {showMoreMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -4 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-1 w-44 rounded-xl bg-white dark:bg-[#202124] border border-slate-200 dark:border-white/10 shadow-lg py-1 z-30 text-xs"
                >
                  <button
                    type="button"
                    onClick={() => {
                      startLiveDrawing();
                      setShowMoreMenu(false);
                    }}
                    disabled={isDrawing}
                    className="w-full text-left px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-white/10 flex items-center gap-2 text-slate-700 dark:text-zinc-200 cursor-pointer disabled:opacity-50"
                  >
                    <RotateCw className="w-3.5 h-3.5 text-slate-400" />
                    <span>Replay Drawing</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleCopyMcpPayload}
                    className="w-full text-left px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-white/10 flex items-center gap-2 text-slate-700 dark:text-zinc-200 cursor-pointer"
                  >
                    {copiedMcp ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                    <span>{copiedMcp ? "Copied MCP JSON" : "Copy MCP JSON"}</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* 2. Main Canvas Body */}
      {activeView === "editor" ? (
        <div className="relative z-10 flex-1 w-full h-full bg-slate-50 dark:bg-[#121212] overflow-hidden">
          <iframe
            src="https://excalidraw.com"
            className="w-full h-full border-0"
            title="Excalidraw Live Canvas Editor"
            allow="clipboard-read; clipboard-write"
          />
        </div>
      ) : (
        <div
          ref={canvasRef}
          className="relative z-10 flex-1 w-full h-full overflow-auto p-5 select-none bg-slate-50/40 dark:bg-[#161718]"
        >
          {/* Scaled Board Canvas */}
          <div
            style={{
              transform: `scale(${zoomLevel / 100})`,
              transformOrigin: "top left",
              width: `${boardWidth}px`,
              minHeight: "380px",
            }}
            className="relative transition-transform duration-200"
          >
            {/* Live Drawing Pencil Head Tracking Cursor */}
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

            {/* Dynamic Columns Grid Matching Exact Column Count */}
            <div
              className="grid gap-5"
              style={{
                gridTemplateColumns: `repeat(${colCount}, ${columnWidth}px)`,
              }}
            >
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
                    className={`rounded-2xl border-2 ${theme.border} ${theme.bg} p-4 shadow-xs backdrop-blur-xs min-h-[360px] flex flex-col justify-between transition-colors duration-150 ${
                      !isVisible ? "filter blur-[0.5px] pointer-events-none" : ""
                    }`}
                    style={{
                      borderRadius: "16px",
                      boxShadow: "2px 2px 0px rgba(0,0,0,0.05)",
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

                      {/* Task Cards */}
                      <div className="space-y-3">
                        {col.notes.map((note) => (
                          <motion.div
                            key={note.id}
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 4 }}
                            transition={{ duration: 0.25 }}
                            className="p-3 rounded-xl bg-white dark:bg-[#202124] border border-slate-200/90 dark:border-white/10 shadow-2xs hover:border-slate-400 dark:hover:border-white/20 transition-colors duration-150"
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
                                    type="button"
                                    onClick={() => handleAdvanceCard(col.id, note.id)}
                                    className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-white/10 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                                    title="Advance to next phase"
                                  >
                                    <ArrowRight className="w-3 h-3" />
                                  </button>
                                )}
                                <button
                                  type="button"
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

                    {/* Stage Status Footnote */}
                    <div className="pt-3 mt-3 border-t border-black/5 dark:border-white/5 text-[10px] text-slate-400 dark:text-zinc-500 font-mono flex items-center justify-between">
                      <span>Phase {theme.step} verified</span>
                      <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Dynamically Positioned SVG Connectors */}
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
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#64748b" />
                </marker>
              </defs>

              {columns.slice(0, -1).map((_, i) => {
                const startX = (i + 1) * columnWidth + i * columnGap;
                const endX = startX + columnGap;
                const y = 180;
                const isArrowVisible = drawnStages >= i + 2;

                return (
                  <motion.path
                    key={i}
                    d={`M ${startX} ${y} L ${endX} ${y}`}
                    fill="none"
                    stroke="#64748b"
                    strokeWidth="2"
                    strokeDasharray="40"
                    initial={{ strokeDashoffset: 40, opacity: 0 }}
                    animate={{
                      strokeDashoffset: isArrowVisible ? 0 : 40,
                      opacity: isArrowVisible ? 1 : 0,
                    }}
                    transition={{ duration: 0.35 }}
                    markerEnd="url(#excalidraw-arrow)"
                  />
                );
              })}
            </svg>
          </div>
        </div>
      )}

      {/* 3. Clean Micro-Footer */}
      <div className="relative z-10 px-4 py-1.5 border-t border-slate-200/70 dark:border-white/5 bg-slate-50/90 dark:bg-[#18191a] shrink-0 flex items-center justify-between text-[11px] text-slate-500 dark:text-zinc-400">
        <div className="flex items-center gap-1.5 truncate">
          <Sparkles className="w-3 h-3 text-amber-500 shrink-0" />
          <span className="font-mono text-[10px] truncate">
            Excalidraw MCP &bull; {totalCards} architecture blocks
          </span>
        </div>

        <div className="flex items-center gap-2">
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
