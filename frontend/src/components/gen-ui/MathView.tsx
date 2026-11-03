"use client";

import React, { useMemo } from "react";
import katex from "katex";

interface MathViewProps {
  math: string;
  displayMode?: boolean;
  className?: string;
}

/**
 * Robust KaTeX Math Renderer.
 * Safely converts LaTeX expressions into beautiful, responsive math notation.
 */
export function MathView({ math, displayMode = false, className = "" }: MathViewProps) {
  const renderedHtml = useMemo(() => {
    if (!math) return "";
    try {
      // Clean leading and trailing $ signs if user/model included them
      let clean = math.trim();
      if (clean.startsWith("$$") && clean.endsWith("$$")) {
        clean = clean.slice(2, -2).trim();
      } else if (clean.startsWith("$") && clean.endsWith("$")) {
        clean = clean.slice(1, -1).trim();
      } else if (clean.startsWith("\\[") && clean.endsWith("\\]")) {
        clean = clean.slice(2, -2).trim();
      } else if (clean.startsWith("\\(") && clean.endsWith("\\)")) {
        clean = clean.slice(2, -2).trim();
      }

      return katex.renderToString(clean, {
        displayMode: displayMode,
        throwOnError: false,
        strict: false,
      });
    } catch (err) {
      console.warn("KaTeX render error:", err);
      return math;
    }
  }, [math, displayMode]);

  return (
    <span
      className={`katex-math-wrapper ${className}`}
      dangerouslySetInnerHTML={{ __html: renderedHtml }}
    />
  );
}

