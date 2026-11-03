"use client";

import React, { useEffect, useRef } from "react";
import { Wrench, Check, ChevronDown, Loader2 } from "lucide-react";

export interface ToolReasoningProps {
  name: string;
  args?: Record<string, unknown> | unknown;
  status: "executing" | "inProgress" | "complete" | string;
}

function formatValue(value: unknown): string {
  if (Array.isArray(value)) return `[${value.length} items]`;
  if (typeof value === "object" && value !== null) {
    return `{${Object.keys(value as object).length} keys}`;
  }
  if (typeof value === "string") return `"${value}"`;
  return String(value);
}

/**
 * ToolReasoning
 *
 * Implements tool call reasoning view matching CopilotKit fullstack-agents-generative-ui-talk
 * reference pattern (apps/app/src/components/tool-rendering.tsx).
 */
export function ToolReasoning({ name, args, status }: ToolReasoningProps) {
  const entries = args && typeof args === "object" ? Object.entries(args) : [];
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const isRunning = status === "executing" || status === "inProgress";

  // Auto-open while executing, auto-close when complete
  useEffect(() => {
    if (!detailsRef.current) return;
    detailsRef.current.open = isRunning;
  }, [isRunning]);

  const statusIcon = isRunning ? (
    <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-500" />
  ) : (
    <Check className="h-3.5 w-3.5 text-emerald-500" />
  );

  return (
    <div className="my-1.5 font-sans">
      {entries.length > 0 ? (
        <details ref={detailsRef} open className="group">
          <summary className="flex items-center gap-2 cursor-pointer list-none text-xs text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors">
            {statusIcon}
            <Wrench className="h-3.5 w-3.5 text-slate-400 dark:text-zinc-500" />
            <span className="font-mono font-medium">{name}</span>
            <ChevronDown className="h-3.5 w-3.5 ml-auto transition-transform group-open:rotate-180" />
          </summary>
          <div className="ml-5 mt-1.5 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 px-3 py-2 space-y-1">
            {entries.map(([key, value]) => (
              <div
                key={key}
                className="flex gap-2 min-w-0 text-xs font-mono"
              >
                <span className="text-slate-500 dark:text-zinc-400 shrink-0">
                  {key}:
                </span>
                <span className="text-slate-800 dark:text-zinc-200 truncate">
                  {formatValue(value)}
                </span>
              </div>
            ))}
          </div>
        </details>
      ) : (
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-zinc-400">
          {statusIcon}
          <Wrench className="h-3.5 w-3.5 text-slate-400 dark:text-zinc-500" />
          <span className="font-mono font-medium">{name}</span>
        </div>
      )}
    </div>
  );
}
