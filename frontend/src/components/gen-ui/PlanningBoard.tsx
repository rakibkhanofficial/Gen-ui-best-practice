"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Kanban,
  Plus,
  ThumbsUp,
  Sparkles,
  User,
  ArrowRight,
  ArrowLeft,
  X,
  Layers,
  CheckCircle2,
  ListFilter,
  Palette
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
}

export interface PlanningBoardProps {
  data?: PlanningBoardData;
  status?: "inProgress" | "executing" | "complete";
}

const ACCENT_STYLES: Record<
  string,
  {
    borderLeft: string;
    bgBadge: string;
    textBadge: string;
    dotBg: string;
  }
> = {
  yellow: {
    borderLeft: "border-l-amber-400 dark:border-l-amber-500",
    bgBadge: "bg-amber-100/80 dark:bg-amber-950/60",
    textBadge: "text-amber-800 dark:text-amber-300",
    dotBg: "bg-amber-400",
  },
  blue: {
    borderLeft: "border-l-sky-500 dark:border-l-sky-400",
    bgBadge: "bg-sky-100/80 dark:bg-sky-950/60",
    textBadge: "text-sky-800 dark:text-sky-300",
    dotBg: "bg-sky-500",
  },
  green: {
    borderLeft: "border-l-emerald-500 dark:border-l-emerald-400",
    bgBadge: "bg-emerald-100/80 dark:bg-emerald-950/60",
    textBadge: "text-emerald-800 dark:text-emerald-300",
    dotBg: "bg-emerald-500",
  },
  pink: {
    borderLeft: "border-l-rose-400 dark:border-l-rose-500",
    bgBadge: "bg-rose-100/80 dark:bg-rose-950/60",
    textBadge: "text-rose-800 dark:text-rose-300",
    dotBg: "bg-rose-400",
  },
  purple: {
    borderLeft: "border-l-purple-500 dark:border-l-purple-400",
    bgBadge: "bg-purple-100/80 dark:bg-purple-950/60",
    textBadge: "text-purple-800 dark:text-purple-300",
    dotBg: "bg-purple-500",
  },
  orange: {
    borderLeft: "border-l-orange-500 dark:border-l-orange-400",
    bgBadge: "bg-orange-100/80 dark:bg-orange-950/60",
    textBadge: "text-orange-800 dark:text-orange-300",
    dotBg: "bg-orange-500",
  },
};

export function PlanningBoard({ data, status = "complete" }: PlanningBoardProps) {
  const [columns, setColumns] = useState<BoardColumn[]>(data?.columns || []);
  const [activeLaneFilter, setActiveLaneFilter] = useState<string>("all");
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [newNoteTitle, setNewNoteTitle] = useState("");
  const [selectedColor, setSelectedColor] = useState<StickyNote["color"]>("yellow");
  const [targetCol, setTargetCol] = useState<string>("");
  const [canvasMode, setCanvasMode] = useState<"board" | "canvas">("board");

  useEffect(() => {
    if (data?.columns && data.columns.length > 0) {
      setColumns(data.columns);
      if (!targetCol && data.columns[0]?.id) {
        setTargetCol(data.columns[0].id);
      }
    }
    if (data?.initial_mode) {
      setCanvasMode(data.initial_mode);
    }
  }, [data]);

  const totalNotes = columns.reduce((acc, col) => acc + (col.notes?.length || 0), 0);

  if (status === "inProgress" || !data?.title) {
    return (
      <div className="w-full my-3 h-[420px] rounded-2xl bg-white dark:bg-[#1a1b1c] border border-slate-200 dark:border-white/10 p-5 flex flex-col gap-3 animate-pulse">
        <div className="h-6 w-48 bg-slate-200 dark:bg-white/10 rounded-md" />
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-full bg-slate-100 dark:bg-white/5 rounded-xl" />
          ))}
        </div>
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
      particleCount: 22,
      spread: 45,
      origin: { y: 0.7 },
      colors: ["#f59e0b", "#3b82f6", "#10b981", "#8b5cf6"],
    });
  };

  const handleDeleteNote = (colId: string, noteId: string) => {
    setColumns((prev) =>
      prev.map((col) =>
        col.id === colId
          ? { ...col, notes: col.notes.filter((n) => n.id !== noteId) }
          : col
      )
    );
  };

  const handleMoveNote = (fromColId: string, noteId: string, direction: "next" | "prev") => {
    const colOrder = columns.map((c) => c.id);
    const currentIndex = colOrder.indexOf(fromColId);
    const targetIndex = direction === "next" ? currentIndex + 1 : currentIndex - 1;

    if (targetIndex < 0 || targetIndex >= colOrder.length) return;
    const targetColId = colOrder[targetIndex];

    let noteToMove: StickyNote | undefined;
    const nextColumns = columns.map((col) => {
      if (col.id === fromColId) {
        const remaining = col.notes.filter((n) => {
          if (n.id === noteId) {
            noteToMove = { ...n, column_id: targetColId };
            return false;
          }
          return true;
        });
        return { ...col, notes: remaining };
      }
      return col;
    });

    if (noteToMove) {
      const finalColumns = nextColumns.map((col) => {
        if (col.id === targetColId) {
          return { ...col, notes: [...col.notes, noteToMove!] };
        }
        return col;
      });
      setColumns(finalColumns);

      // Celebration when moved to final lane
      if (targetColId === columns[columns.length - 1].id) {
        confetti({
          particleCount: 50,
          spread: 70,
          origin: { y: 0.75 },
        });
      }
    }
  };

  const handleAddNote = () => {
    if (!newNoteTitle.trim()) return;
    const targetId = targetCol || columns[0]?.id || "col-backlog";

    const newNote: StickyNote = {
      id: `note-${Date.now().toString(36)}`,
      title: newNoteTitle.trim(),
      content: "Created via interactive GenUI Miro canvas.",
      color: selectedColor,
      tags: ["SprintTask", "GenUI"],
      votes: 1,
      assignee: "You",
      column_id: targetId,
    };

    setColumns((prev) =>
      prev.map((c) => (c.id === targetId ? { ...c, notes: [...c.notes, newNote] } : c))
    );
    setNewNoteTitle("");
    setIsAddingNote(false);
  };

  const handleAISort = () => {
    setColumns((prev) =>
      prev.map((col) => ({
        ...col,
        notes: [...col.notes].sort((a, b) => b.votes - a.votes),
      }))
    );
    confetti({
      particleCount: 30,
      spread: 60,
      origin: { y: 0.65 },
    });
  };

  const handleAddSpike = () => {
    const target = columns[0]?.id || "col-backlog";
    const spikeNote: StickyNote = {
      id: `spike-${Date.now().toString(36)}`,
      title: "Spike: Zero-Latency SSE Buffering",
      content: "Benchmarking CopilotKit streaming response chunking against network jitter.",
      color: "purple",
      tags: ["Spike", "Telemetry"],
      votes: 5,
      assignee: "Lead AI",
      column_id: target,
    };
    setColumns((prev) =>
      prev.map((c) => (c.id === target ? { ...c, notes: [spikeNote, ...c.notes] } : c))
    );
  };

  // Filter columns if user selected a single lane view
  const visibleColumns =
    activeLaneFilter === "all"
      ? columns
      : columns.filter((c) => c.id === activeLaneFilter);

  return (
    <div className="w-full my-3 rounded-2xl bg-white dark:bg-[#1a1b1c] border border-slate-200/90 dark:border-white/10 shadow-xs relative overflow-hidden flex flex-col h-[460px] sm:h-[480px] text-slate-800 dark:text-slate-100 font-sans">
      {/* Miro / FigJam Dot Grid Pattern Canvas */}
      <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] dark:bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px] opacity-45 pointer-events-none" />

      {/* 1. Header Bar */}
      <div className="relative z-10 px-4 py-2.5 border-b border-slate-200/80 dark:border-white/10 flex items-center justify-between gap-3 shrink-0 bg-white/80 dark:bg-[#1a1b1c]/90 backdrop-blur-xs">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/20">
            <Kanban className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                {data.title || "Sprint Canvas"}
              </h3>
              <span className="shrink-0 text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-zinc-300 border border-slate-200/80 dark:border-white/5 font-mono">
                {totalNotes} notes
              </span>
            </div>
          </div>
        </div>

        {/* View Mode & AI Tools */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Mode Switcher */}
          <div className="flex items-center p-0.5 rounded-lg bg-slate-100 dark:bg-white/10 text-[11px]">
            <button
              onClick={() => setCanvasMode("board")}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                canvasMode === "board"
                  ? "bg-white dark:bg-white/20 text-slate-900 dark:text-white shadow-2xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Lanes
            </button>
            <button
              onClick={() => setCanvasMode("canvas")}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                canvasMode === "canvas"
                  ? "bg-white dark:bg-white/20 text-slate-900 dark:text-white shadow-2xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
              title="Open Excalidraw collaborative MCP canvas"
            >
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span className="hidden sm:inline">Excalidraw</span>
            </button>
          </div>

          {canvasMode === "board" && (
            <>
              {/* AI Auto-Sort */}
              <button
                onClick={handleAISort}
                className="hidden sm:flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium rounded-lg bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-700 dark:text-zinc-300 border border-slate-200/70 dark:border-white/10 transition-colors cursor-pointer"
                title="Sort cards by highest votes"
              >
                <Sparkles className="w-3 h-3 text-amber-500" />
                <span>AI Prioritize</span>
              </button>

              {/* Add Note Button */}
              <button
                onClick={() => setIsAddingNote(!isAddingNote)}
                className={`flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-colors cursor-pointer ${
                  isAddingNote
                    ? "bg-slate-200 dark:bg-white/20 text-slate-900 dark:text-white"
                    : "bg-amber-500 hover:bg-amber-600 text-white shadow-2xs"
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Note</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* 2. Interactive Lane Filter Chips (Fast Navigation) */}
      {canvasMode === "board" && (
        <div className="relative z-10 px-4 py-1.5 border-b border-slate-100 dark:border-white/5 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0 bg-slate-50/70 dark:bg-white/5 text-[11px]">
          <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-zinc-500 mr-1 flex items-center gap-1">
            <ListFilter className="w-3 h-3" /> Filter:
          </span>
          <button
            onClick={() => setActiveLaneFilter("all")}
            className={`px-2 py-0.5 rounded-md font-medium transition-colors cursor-pointer ${
              activeLaneFilter === "all"
                ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                : "bg-white dark:bg-white/10 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            All Lanes ({totalNotes})
          </button>

          {columns.map((col) => (
            <button
              key={col.id}
              onClick={() => setActiveLaneFilter(col.id)}
              className={`px-2 py-0.5 rounded-md font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeLaneFilter === col.id
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                  : "bg-white dark:bg-white/10 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: col.color_accent }}
              />
              <span className="truncate max-w-[120px]">{col.title}</span>
              <span className="opacity-60 text-[10px]">({col.notes.length})</span>
            </button>
          ))}
        </div>
      )}

      {/* 3. Collapsible Add Note Drawer */}
      <AnimatePresence>
        {isAddingNote && canvasMode === "board" && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="relative z-20 overflow-hidden border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#202124] px-4 py-2.5 shrink-0"
          >
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="text"
                value={newNoteTitle}
                onChange={(e) => setNewNoteTitle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddNote()}
                placeholder="What task needs to be captured?"
                autoFocus
                className="flex-1 min-w-[200px] text-xs px-3 py-1.5 rounded-lg bg-white dark:bg-[#2a2b2e] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-1 focus:ring-amber-500"
              />

              {/* Color Swatch */}
              <div className="flex items-center gap-1">
                {(["yellow", "blue", "green", "pink", "purple", "orange"] as StickyNote["color"][]).map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setSelectedColor(c)}
                    className={`w-4 h-4 rounded-full border transition-transform ${
                      selectedColor === c ? "scale-125 ring-2 ring-amber-500" : "opacity-60 hover:opacity-100"
                    }`}
                    style={{
                      backgroundColor:
                        c === "yellow" ? "#f59e0b" :
                        c === "blue" ? "#38bdf8" :
                        c === "green" ? "#34d399" :
                        c === "pink" ? "#fb7185" :
                        c === "purple" ? "#c084fc" : "#fb923c"
                    }}
                  />
                ))}
              </div>

              {/* Lane Selector */}
              <select
                value={targetCol}
                onChange={(e) => setTargetCol(e.target.value)}
                className="text-xs px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#2a2b2e] border border-slate-200 dark:border-white/10 text-slate-700 dark:text-zinc-300 font-medium focus:outline-hidden"
              >
                {columns.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>

              <div className="flex items-center gap-1">
                <button
                  onClick={handleAddNote}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-500 hover:bg-amber-600 text-white transition-colors cursor-pointer"
                >
                  Add Card
                </button>
                <button
                  onClick={() => setIsAddingNote(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 rounded-lg"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4. Canvas View vs Swimlanes View */}
      {canvasMode === "canvas" ? (
        <div className="relative z-10 flex-1 w-full h-full bg-slate-50 dark:bg-[#121212] overflow-hidden">
          <iframe
            src="https://excalidraw.com"
            className="w-full h-full border-0"
            title="Excalidraw Live Collaborative Canvas MCP App"
            allow="clipboard-read; clipboard-write"
          />
        </div>
      ) : (
        /* Swimlanes Container: Horizontal scroll with fixed contained height */
        <div className="relative z-10 flex-1 overflow-x-auto overflow-y-hidden p-3 flex gap-3 scroll-smooth no-scrollbar">
          {visibleColumns.map((col, colIdx) => (
            <div
              key={col.id}
              className="w-64 sm:w-72 shrink-0 flex flex-col rounded-xl bg-slate-50/90 dark:bg-[#212224] border border-slate-200/80 dark:border-white/5 p-2.5 h-full"
            >
              {/* Lane Header */}
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200/70 dark:border-white/5 shrink-0">
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: col.color_accent }}
                  />
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 truncate">
                    {col.title}
                  </h4>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-md bg-white dark:bg-white/10 text-slate-600 dark:text-zinc-400 font-medium">
                    {col.notes.length}
                  </span>
                  <button
                    onClick={() => {
                      setTargetCol(col.id);
                      setIsAddingNote(true);
                    }}
                    className="p-0.5 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
                    title={`Add card to ${col.title}`}
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Cards List: Clean internal scroll inside lane */}
              <div className="flex-1 overflow-y-auto space-y-2 pr-1 no-scrollbar">
                <AnimatePresence>
                  {col.notes.map((note) => {
                    const style = ACCENT_STYLES[note.color] || ACCENT_STYLES.yellow;

                    return (
                      <motion.div
                        key={note.id}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        whileHover={{ y: -1 }}
                        className={`relative p-2.5 rounded-xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#28292c] shadow-2xs group flex flex-col justify-between border-l-4 ${style.borderLeft}`}
                      >
                        {/* Delete note button on hover */}
                        <button
                          onClick={() => handleDeleteNote(col.id, note.id)}
                          className="absolute top-1.5 right-1.5 p-1 rounded-md opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-500 transition-opacity"
                          title="Delete note"
                        >
                          <X className="w-3 h-3" />
                        </button>

                        <div>
                          <h5 className="text-xs font-semibold text-slate-900 dark:text-white leading-snug pr-4">
                            {note.title}
                          </h5>
                          {note.content && (
                            <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                              {note.content}
                            </p>
                          )}
                        </div>

                        {/* Tags & Assignee */}
                        <div className="mt-2 pt-1.5 border-t border-slate-100 dark:border-white/5 flex flex-wrap items-center justify-between gap-1 text-[10px]">
                          <div className="flex flex-wrap gap-1">
                            {(note.tags || []).slice(0, 2).map((t, idx) => (
                              <span
                                key={idx}
                                className={`px-1.5 py-0.2 rounded-md font-mono ${style.bgBadge} ${style.textBadge}`}
                              >
                                #{t}
                              </span>
                            ))}
                          </div>

                          {note.assignee && (
                            <span className="flex items-center gap-1 text-slate-500 dark:text-zinc-400 font-medium">
                              <User className="w-2.5 h-2.5" />
                              <span className="truncate max-w-[80px]">{note.assignee}</span>
                            </span>
                          )}
                        </div>

                        {/* Action Row: Move & Vote */}
                        <div className="mt-1.5 pt-1 flex items-center justify-between text-xs">
                          {/* Lane Shift Buttons */}
                          <div className="flex items-center gap-0.5">
                            {colIdx > 0 && (
                              <button
                                onClick={() => handleMoveNote(col.id, note.id, "prev")}
                                className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
                                title="Move to previous column"
                              >
                                <ArrowLeft className="w-3 h-3" />
                              </button>
                            )}
                            {colIdx < columns.length - 1 && (
                              <button
                                onClick={() => handleMoveNote(col.id, note.id, "next")}
                                className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
                                title="Advance to next column"
                              >
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            )}
                          </div>

                          {/* Upvote button */}
                          <button
                            onClick={() => handleVote(col.id, note.id)}
                            className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-white/10 hover:bg-amber-500/10 hover:text-amber-600 dark:hover:text-amber-400 transition-colors text-[10px] font-semibold text-slate-600 dark:text-zinc-300 cursor-pointer"
                          >
                            <ThumbsUp className="w-2.5 h-2.5" />
                            <span>{note.votes}</span>
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>

                {col.notes.length === 0 && (
                  <div className="h-24 flex flex-col items-center justify-center text-center p-3 rounded-lg border border-dashed border-slate-200 dark:border-white/10 text-slate-400 dark:text-zinc-500 text-[11px]">
                    <span>No cards yet</span>
                    <button
                      onClick={() => {
                        setTargetCol(col.id);
                        setIsAddingNote(true);
                      }}
                      className="text-amber-500 hover:underline mt-1 font-medium"
                    >
                      + Add first card
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 5. Minimal GenUI Assist Micro-Footer */}
      <div className="relative z-10 px-4 py-1.5 border-t border-slate-200/70 dark:border-white/5 bg-slate-50/80 dark:bg-[#1a1b1c] shrink-0 flex items-center justify-between text-[10px] text-slate-400 dark:text-zinc-500">
        <span className="flex items-center gap-1 truncate">
          <Sparkles className="w-3 h-3 text-amber-500 shrink-0" />
          <span>Interactive Generative UI: Tap arrows (&larr; &rarr;) to move tasks across sprint stages</span>
        </span>
        <button
          onClick={handleAddSpike}
          className="shrink-0 text-amber-600 dark:text-amber-400 hover:underline font-medium cursor-pointer"
        >
          + Add AI Spike
        </button>
      </div>
    </div>
  );
}
