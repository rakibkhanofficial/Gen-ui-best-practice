"use client";

import React from "react";
import { Streamdown } from "streamdown";

interface StreamingMessageProps {
  content: string;
}

export function StreamingMessage({ content }: StreamingMessageProps) {
  if (!content) return null;

  return (
    <div className="prose prose-invert prose-xs max-w-none text-slate-200 leading-relaxed font-sans overflow-x-auto">
      <Streamdown
        components={{
          h3: ({ children }) => (
            <h3 className="text-sm font-bold text-white mt-3 mb-1.5 flex items-center gap-1.5 border-b border-slate-800 pb-1">
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-xs font-semibold text-slate-100 mt-2 mb-1">
              {children}
            </h4>
          ),
          p: ({ children }) => (
            <p className="text-xs text-slate-300 my-1 leading-normal">
              {children}
            </p>
          ),
          ul: ({ children }) => (
            <ul className="list-disc list-inside space-y-1 my-2 text-xs text-slate-300">
              {children}
            </ul>
          ),
          li: ({ children }) => (
            <li className="text-xs text-slate-300">{children}</li>
          ),
          code: ({ children, className }) => {
            const isInline = !className;
            return isInline ? (
              <code className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-[11px] font-mono text-sky-300">
                {children}
              </code>
            ) : (
              <code className={className}>{children}</code>
            );
          },
          pre: ({ children }) => (
            <pre className="p-3 my-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 overflow-x-auto font-mono">
              {children}
            </pre>
          ),
        }}
      >
        {content}
      </Streamdown>
    </div>
  );
}

