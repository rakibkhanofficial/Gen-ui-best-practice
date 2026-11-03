"use client";

import React from "react";
import { Streamdown } from "streamdown";

interface StreamingMessageProps {
  content: string;
}

export function StreamingMessage({ content }: StreamingMessageProps) {
  if (!content) return null;

  return (
    <div className="prose dark:prose-invert prose-xs max-w-none text-slate-800 dark:text-[#e3e3e3] leading-relaxed font-sans overflow-x-auto">
      <Streamdown
        components={{
          h3: ({ children }) => (
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-3 mb-1.5 flex items-center gap-1.5 border-b border-slate-200 dark:border-slate-800 pb-1">
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-100 mt-2 mb-1">
              {children}
            </h4>
          ),
          p: ({ children }) => (
            <p className="text-xs text-slate-700 dark:text-[#c4c7c5] my-1 leading-normal">
              {children}
            </p>
          ),
          ul: ({ children }) => (
            <ul className="list-disc list-inside space-y-1 my-2 text-xs text-slate-700 dark:text-[#c4c7c5]">
              {children}
            </ul>
          ),
          li: ({ children }) => (
            <li className="text-xs text-slate-700 dark:text-[#c4c7c5]">{children}</li>
          ),
          code: ({ children, className }) => {
            const isInline = !className;
            return isInline ? (
              <code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] font-mono text-blue-600 dark:text-sky-300">
                {children}
              </code>
            ) : (
              <code className={className}>{children}</code>
            );
          },
          pre: ({ children }) => (
            <pre className="p-3 my-2 rounded-xl bg-slate-900 text-slate-100 border border-slate-800 text-[11px] font-mono overflow-x-auto">
              {children}
            </pre>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-slate-900 dark:text-white">
              {children}
            </strong>
          ),
        }}
      >
        {content}
      </Streamdown>
    </div>
  );
}
