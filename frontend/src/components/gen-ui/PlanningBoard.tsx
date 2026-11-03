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
  CheckCircle,
  MoreHorizontal
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
}

interface PlanningBoardProps {
  data?: PlanningBoardData;
  status?: "inProgress" | "executing" | "complete";
}

const COLOR_CLASSES: Record<string, { bg: string; text: string; border: string }> = {
  yellow: { bg: "bg-amber-100", text: "text-amber-950", border: "border-amber-300" },
  blue: { bg: "bg-sky-100", text: "text-sky-950", border: "border-sky-300" },
  green: { bg: "bg-emerald-100", text: "text-emerald-950", border: "border-emerald-300" },
  pink: { bg: "bg-pink-100", text: "text-pink-950", border: "border-pink-300" },
  purple: { bg: "bg-purple-100", text: "text-purple-950", border: "border-purple-300" },
  orange: { bg: "bg-orange-100", text: "text-orange-950", border: "border-orange-300" },
};

export function PlanningBoard({ data, status = "complete" }: PlanningBoardProps) {
  const [columns, setColumns] = useState<BoardColumn[]>(data?.columns || []);
  const [newNoteText, setNewNoteText] = useState("");
  const [targetCol, setTargetCol] = useState<string>("col-backlog");

  // Keep state synced with props if updated
  React.useEffect(() => {
    if (data?.columns) {
      setColumns(data.columns);
    }
  }, [data]);

  if (status === "inProgress" || !data?.title) {
    return (
      <div className="w-full max-w-4xl p-6 rounded-2xl glass-panel animate-pulse border border-slate-700/60 my-3">
        <div className="h-7 w-64 bg-slate-700 rounded-md mb-4" />
        <div className="grid grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-64 bg-slate-800 rounded-xl" />
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

      // Trigger celebration if moved to Done
      if (targetColId === "col-done") {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.8 },
        });
      }
    }
  };

  const handleAddNote = () => {
    if (!newNoteText.trim()) return;
    const colors: StickyNote["color"][] = ["yellow", "blue", "green", "pink", "purple", "orange"];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    const newNote: StickyNote = {
      id: `note-${Date.now().toString(36)}`,
      title: newNoteText,
      content: "Created interactively on Generative UI canvas.",
      color: randomColor,
      tags: ["GenUI", "Dynamic"],
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
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="w-full max-w-4xl my-4 rounded-2xl glass-panel-elevated p-6 border border-slate-700/60 shadow-2xl relative overflow-hidden text-slate-100"
    >
      {/* Background ambient radial */}
      <div className="absolute -top-24 -left-24 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between pb-4 border-b border-slate-700/60 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <Kanban className="w-5 h-5 text-amber-400" />
              {data.title}
            </h3>
            <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full bg-amber-950/80 text-amber-300 border border-amber-800 font-medium">
              <Sparkles className="w-3 h-3" /> Miro Canvas
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">{data.description}</p>
        </div>

        {/* Quick Add Sticky Note Bar */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Add a new idea..."
            value={newNoteText}
            onChange={(e) => setNewNoteText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddNote()}
            className="px-3 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-amber-400 w-44"
          />
          <button
            onClick={handleAddNote}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" /> Stick
          </button>
        </div>
      </div>

      {/* Columns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 my-5">
        {columns.map((col, colIdx) => (
          <div
            key={col.id}
            className="flex flex-col bg-slate-900/50 rounded-xl p-3 border border-slate-800/80 min-h-[340px]"
          >
            {/* Column Header */}
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: col.color_accent }}
                />
                <span className="text-xs font-bold text-slate-200">{col.title}</span>
              </div>
              <span className="text-[11px] px-1.5 py-0.5 rounded-full bg-slate-800 text-slate-400 font-semibold">
                {col.notes.length}
              </span>
            </div>

            {/* Sticky Notes Container */}
            <div className="flex-1 space-y-3 overflow-y-auto max-h-[380px] pr-1">
              <AnimatePresence>
                {col.notes.map((note) => {
                  const style = COLOR_CLASSES[note.color] || COLOR_CLASSES.yellow;
                  return (
                    <motion.div
                      key={note.id}
                      layout
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className={`p-3.5 rounded-xl ${style.bg} ${style.text} ${style.border} border shadow-md relative hover:shadow-lg transition-all group`}
                    >
                      <div className="font-bold text-xs leading-snug mb-1">
                        {note.title}
                      </div>
                      <p className="text-[11px] opacity-80 leading-relaxed mb-2.5">
                        {note.content}
                      </p>

                      {/* Tags & Assignee */}
                      <div className="flex flex-wrap items-center gap-1 mb-2">
                        {note.tags.map((t, idx) => (
                          <span
                            key={idx}
                            className="text-[9px] px-1.5 py-0.5 rounded bg-black/10 font-medium"
                          >
                            #{t}
                          </span>
                        ))}
                        {note.assignee && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-black/10 font-medium flex items-center gap-0.5">
                            <User className="w-2.5 h-2.5" /> {note.assignee}
                          </span>
                        )}
                      </div>

                      {/* Interactive Controls on Note */}
                      <div className="flex items-center justify-between pt-1 border-t border-black/10 text-[11px]">
                        <button
                          onClick={() => handleVote(col.id, note.id)}
                          className="flex items-center gap-1 font-semibold hover:opacity-75 transition-opacity"
                        >
                          <ThumbsUp className="w-3 h-3" /> {note.votes}
                        </button>

                        <div className="flex items-center gap-1">
                          {colIdx > 0 && (
                            <button
                              onClick={() => handleMoveNote(col.id, note.id, "prev")}
                              className="text-[10px] px-1.5 py-0.5 rounded bg-black/10 hover:bg-black/20 font-semibold"
                              title="Move Left"
                            >
                              ←
                            </button>
                          )}
                          {colIdx < columns.length - 1 && (
                            <button
                              onClick={() => handleMoveNote(col.id, note.id, "next")}
                              className="text-[10px] px-1.5 py-0.5 rounded bg-black/10 hover:bg-black/20 font-semibold"
                              title="Move Right"
                            >
                              →
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {col.notes.length === 0 && (
                <div className="h-28 border border-dashed border-slate-800 rounded-xl flex items-center justify-center text-xs text-slate-400">
                  Drop notes here
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
