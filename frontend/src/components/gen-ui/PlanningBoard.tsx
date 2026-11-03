"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Kanban,
  Plus,
  ThumbsUp,
  Sparkles,
  Tag,
  User,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  X,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Move
} from "lucide-react";
import confetti from "canvas-confetti";

interface StickyNote {
  id: string;
  title: string;
  content: string;
  color: "yellow" | "blue" | "green" | "pink" | "purple" | "orange";
  tags: string[];
  votes: number;
  assignee?: string;
  column_id: string;
}

interface BoardColumn {
  id: string;
  title: string;
  color_accent: string;
  notes: StickyNote[];
}

interface PlanningBoardData {
  board_id?: string;
  title?: string;
  description?: string;
  last_updated?: string;
  columns?: BoardColumn[];
  initial_mode?: "board" | "canvas";
  mcp_app_url?: string;
}

interface PlanningBoardProps {
  data?: PlanningBoardData;
  status?: "inProgress" | "executing" | "complete";
}

const COLOR_CLASSES: Record<string, { bg: string; text: string; border: string; badge: string }> = {
  yellow: {
    bg: "bg-amber-50 dark:bg-amber-950/40",
    text: "text-amber-950 dark:text-amber-100",
    border: "border-amber-200 dark:border-amber-800/60",
    badge: "bg-amber-200/60 dark:bg-amber-800/50 text-amber-900 dark:text-amber-200"
  },
  blue: {
    bg: "bg-sky-50 dark:bg-sky-950/40",
    text: "text-sky-950 dark:text-sky-100",
    border: "border-sky-200 dark:border-sky-800/60",
    badge: "bg-sky-200/60 dark:bg-sky-800/50 text-sky-900 dark:text-sky-200"
  },
  green: {
    bg: "bg-emerald-50 dark:bg-emerald-950/40",
    text: "text-emerald-950 dark:text-emerald-100",
    border: "border-emerald-200 dark:border-emerald-800/60",
    badge: "bg-emerald-200/60 dark:bg-emerald-800/50 text-emerald-900 dark:text-emerald-200"
  },
  pink: {
    bg: "bg-rose-50 dark:bg-rose-950/40",
    text: "text-rose-950 dark:text-rose-100",
    border: "border-rose-200 dark:border-rose-800/60",
    badge: "bg-rose-200/60 dark:bg-rose-800/50 text-rose-900 dark:text-rose-200"
  },
  purple: {
    bg: "bg-purple-50 dark:bg-purple-950/40",
    text: "text-purple-950 dark:text-purple-100",
    border: "border-purple-200 dark:border-purple-800/60",
    badge: "bg-purple-200/60 dark:bg-purple-800/50 text-purple-900 dark:text-purple-200"
  },
  orange: {
    bg: "bg-orange-50 dark:bg-orange-950/40",
    text: "text-orange-950 dark:text-orange-100",
    border: "border-orange-200 dark:border-orange-800/60",
    badge: "bg-orange-200/60 dark:bg-orange-800/50 text-orange-900 dark:text-orange-200"
  },
};

export function PlanningBoard({ data, status = "complete" }: PlanningBoardProps) {
  const [columns, setColumns] = useState<BoardColumn[]>(data?.columns || []);
  const [newNoteText, setNewNoteText] = useState("");
  const [selectedColor, setSelectedColor] = useState<StickyNote["color"]>("yellow");
  const [targetCol, setTargetCol] = useState<string>("col-backlog");
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [canvasMode, setCanvasMode] = useState<"board" | "canvas">("board");

  React.useEffect(() => {
    if (data?.columns) {
      setColumns(data.columns);
      if (data.columns[0]?.id) {
        setTargetCol(data.columns[0].id);
      }
    }
    if (data?.initial_mode) {
      setCanvasMode(data.initial_mode);
    }
  }, [data]);

  if (status === "inProgress" || !data?.title) {
    return (
      <div className="w-full max-w-4xl p-6 rounded-3xl bg-white dark:bg-[#1e1f20] animate-pulse border border-slate-200 dark:border-white/10 my-3">
        <div className="h-7 w-64 bg-slate-200 dark:bg-slate-700 rounded-md mb-4" />
        <div className="grid grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-64 bg-slate-100 dark:bg-slate-800 rounded-2xl" />
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
      particleCount: 20,
      spread: 45,
      origin: { y: 0.7 },
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
    if (!newNoteText.trim()) return;

    const newNote: StickyNote = {
      id: `note-${Date.now().toString(36)}`,
      title: newNoteText,
      content: "Created live on collaborative Miro canvas.",
      color: selectedColor,
      tags: ["Canvas", "LiveGenUI"],
      votes: 1,
      assignee: "You",
      column_id: targetCol,
    };

    setColumns((prev) =>
      prev.map((c) => (c.id === targetCol ? { ...c, notes: [...c.notes, newNote] } : c))
    );
    setNewNoteText("");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="w-full max-w-4xl my-4 rounded-3xl bg-white dark:bg-[#1a1b1c] p-6 border border-slate-200/90 dark:border-white/10 shadow-xl shadow-amber-500/5 relative overflow-hidden text-slate-800 dark:text-slate-100"
    >
      {/* Miro / Excalidraw Dot Grid Pattern Canvas */}
      <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1.5px,transparent_1.5px)] dark:bg-[radial-gradient(#334155_1.5px,transparent_1.5px)] [background-size:20px_20px] opacity-70 pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 flex flex-wrap items-center justify-between pb-4 border-b border-slate-200/80 dark:border-white/10 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              <Kanban className="w-5 h-5 text-amber-500" />
              {data.title}
            </h3>
            <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 font-medium">
              <Sparkles className="w-3 h-3" /> Miro & Excalidraw Canvas
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{data.description}</p>
        </div>

        {/* Canvas Toolbar & Mode Toggle */}
        <div className="flex items-center gap-2">
          {/* Mode Switcher: Sprint Board vs Excalidraw Live Canvas */}
          <div className="flex items-center p-0.5 rounded-xl bg-slate-100 dark:bg-white/10 text-xs">
            <button
              onClick={() => setCanvasMode("board")}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                canvasMode === "board"
                  ? "bg-white dark:bg-white/20 text-slate-900 dark:text-white shadow-2xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Sprint Board
            </button>
            <button
              onClick={() => setCanvasMode("canvas")}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                canvasMode === "canvas"
                  ? "bg-white dark:bg-white/20 text-slate-900 dark:text-white shadow-2xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Excalidraw MCP Canvas</span>
            </button>
          </div>

          {/* Canvas Zoom Toolbar */}
          {canvasMode === "board" && (
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-white/10 p-1 rounded-xl border border-slate-200 dark:border-white/10 text-xs">
              <button
                onClick={() => setZoomLevel((z) => Math.max(75, z - 10))}
                className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 transition-colors"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="px-2 font-mono text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                {zoomLevel}%
              </span>
              <button
                onClick={() => setZoomLevel((z) => Math.min(125, z + 10))}
                className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 transition-colors"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {canvasMode === "canvas" ? (
        /* Live Excalidraw MCP Canvas Mode */
        <div className="relative z-10 w-full h-[520px] rounded-2xl overflow-hidden border border-slate-200/90 dark:border-white/10 my-4 shadow-inner bg-slate-50 dark:bg-[#121212]">
          <iframe
            src="https://excalidraw.com"
            className="w-full h-full border-0"
            title="Excalidraw Live Collaborative Canvas MCP App"
            allow="clipboard-read; clipboard-write"
          />
        </div>
      ) : (
        <>
          {/* Quick Add Sticky Note Bar */}
      <div className="relative z-10 flex flex-wrap items-center gap-2 my-4 p-3 rounded-2xl bg-slate-50/90 dark:bg-white/5 border border-slate-200/80 dark:border-white/10">
        <input
          type="text"
          value={newNoteText}
          onChange={(e) => setNewNoteText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAddNote()}
          placeholder="Type sticky note idea and press Enter..."
          className="flex-1 min-w-[200px] text-xs px-3.5 py-2 rounded-xl bg-white dark:bg-[#252628] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-amber-500/50"
        />

        {/* Sticky Color Picker */}
        <div className="flex items-center gap-1">
          {(["yellow", "blue", "green", "pink", "purple", "orange"] as StickyNote["color"][]).map((c) => (
            <button
              key={c}
              onClick={() => setSelectedColor(c)}
              className={`w-5 h-5 rounded-full border transition-transform ${
                selectedColor === c ? "scale-125 ring-2 ring-amber-500/80" : "opacity-70 hover:opacity-100"
              }`}
              style={{
                backgroundColor:
                  c === "yellow" ? "#fef08a" :
                  c === "blue" ? "#bae6fd" :
                  c === "green" ? "#bbf7d0" :
                  c === "pink" ? "#fecdd3" :
                  c === "purple" ? "#e9d5ff" : "#fed7aa"
              }}
            />
          ))}
        </div>

        {/* Column Select */}
        <select
          value={targetCol}
          onChange={(e) => setTargetCol(e.target.value)}
          className="text-xs px-2.5 py-2 rounded-xl bg-white dark:bg-[#252628] border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 font-medium focus:outline-hidden"
        >
          {columns.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </select>

        <button
          onClick={handleAddNote}
          className="flex items-center gap-1 px-3 py-2 text-xs font-semibold rounded-xl bg-amber-500 hover:bg-amber-600 text-white shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Note</span>
        </button>
      </div>

      {/* Swimlane Columns Canvas Grid */}
      <div
        style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: "top left" }}
        className="relative z-10 grid grid-cols-1 md:grid-cols-4 gap-4 transition-transform duration-200"
      >
        {columns.map((col, colIdx) => (
          <div
            key={col.id}
            className="flex flex-col rounded-2xl bg-slate-100/70 dark:bg-white/5 border border-slate-200/70 dark:border-white/5 p-3 min-h-[320px]"
          >
            {/* Column Header */}
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200/80 dark:border-white/10">
              <div className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: col.color_accent }}
                />
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {col.title}
                </h4>
              </div>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-white dark:bg-white/10 text-slate-600 dark:text-slate-400 font-medium shadow-2xs">
                {col.notes.length}
              </span>
            </div>

            {/* Sticky Notes Container */}
            <div className="space-y-2.5 flex-1">
              <AnimatePresence>
                {col.notes.map((note) => {
                  const style = COLOR_CLASSES[note.color] || COLOR_CLASSES.yellow;

                  return (
                    <motion.div
                      key={note.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      whileHover={{ y: -2 }}
                      className={`relative p-3.5 rounded-2xl border shadow-xs ${style.bg} ${style.border} ${style.text} flex flex-col justify-between group transition-all`}
                    >
                      {/* Delete note button */}
                      <button
                        onClick={() => handleDeleteNote(col.id, note.id)}
                        className="absolute top-2 right-2 p-1 rounded-md opacity-0 group-hover:opacity-80 hover:opacity-100 text-slate-400 hover:text-rose-600 transition-opacity"
                        title="Delete note"
                      >
                        <X className="w-3 h-3" />
                      </button>

                      <div>
                        <h5 className="text-xs font-bold leading-snug pr-4">
                          {note.title}
                        </h5>
                        <p className="text-[11px] opacity-80 mt-1 leading-relaxed">
                          {note.content}
                        </p>
                      </div>

                      {/* Tags & Assignee */}
                      <div className="mt-2.5 pt-2 border-t border-black/5 dark:border-white/5 flex flex-wrap items-center justify-between gap-1 text-[10px]">
                        <div className="flex flex-wrap gap-1">
                          {(note.tags || []).map((t, idx) => (
                            <span key={idx} className={`px-1.5 py-0.5 rounded-md font-mono ${style.badge}`}>
                              #{t}
                            </span>
                          ))}
                        </div>

                        {note.assignee && (
                          <span className="flex items-center gap-1 opacity-80 font-medium">
                            <User className="w-2.5 h-2.5" />
                            {note.assignee}
                          </span>
                        )}
                      </div>

                      {/* Action Row: Move & Vote */}
                      <div className="mt-2 pt-1 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1">
                          {colIdx > 0 && (
                            <button
                              onClick={() => handleMoveNote(col.id, note.id, "prev")}
                              className="p-1 rounded-md hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                              title="Move to previous column"
                            >
                              <ArrowLeft className="w-3 h-3" />
                            </button>
                          )}
                          {colIdx < columns.length - 1 && (
                            <button
                              onClick={() => handleMoveNote(col.id, note.id, "next")}
                              className="p-1 rounded-md hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                              title="Move to next column"
                            >
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          )}
                        </div>

                        <button
                          onClick={() => handleVote(col.id, note.id)}
                          className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/70 dark:bg-black/20 hover:scale-105 transition-transform text-[11px] font-semibold cursor-pointer shadow-2xs"
                        >
                          <ThumbsUp className="w-2.5 h-2.5" />
                          <span>{note.votes}</span>
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        ))}
      </div>
      </>
      )}
    </motion.div>
  );
}
