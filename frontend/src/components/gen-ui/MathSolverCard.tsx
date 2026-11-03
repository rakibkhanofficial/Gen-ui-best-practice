"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Calculator,
  CheckCircle2,
  Copy,
  Check,
  Sparkles,
  Layers,
  Lightbulb,
  Sigma,
} from "lucide-react";
import { MathView } from "./MathView";

export interface MathStep {
  step_number: number;
  title: string;
  explanation: string;
  latex_expression: string;
}

export interface MathSolverData {
  problem_title: string;
  problem_type: string;
  input_expression: string;
  latex_input: string;
  solution_latex: string;
  solution_summary: string;
  steps: MathStep[];
  graph_coordinates?: Array<{ x: number; y: number }>;
  formula_identity?: string;
  practical_application?: string;
}

interface MathSolverCardProps {
  data?: MathSolverData;
}

export function MathSolverCard({ data }: MathSolverCardProps) {
  const [copied, setCopied] = useState(false);

  if (!data?.solution_summary) {
    return (
      <div className="w-full max-w-3xl p-5 rounded-2xl bg-white dark:bg-[#1e1f20] border border-slate-200 dark:border-white/10 text-slate-500 text-xs">
        No mathematical solution available.
      </div>
    );
  }

  const {
    problem_title,
    problem_type,
    input_expression,
    latex_input,
    solution_latex,
    solution_summary,
    steps,
    formula_identity,
    practical_application,
    graph_coordinates,
  } = data;

  const handleCopy = () => {
    navigator.clipboard.writeText(`${problem_title}\nProblem: ${input_expression}\nSolution: ${solution_summary}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-3xl my-3 rounded-2xl bg-white dark:bg-[#1e1f20] border border-slate-200 dark:border-white/10 shadow-sm text-slate-800 dark:text-slate-100 overflow-hidden"
    >
      {/* Header Banner */}
      <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-white/10 bg-gradient-to-r from-purple-600/10 via-indigo-500/5 to-transparent dark:from-purple-950/30">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-purple-600/30">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                  {problem_title}
                </h3>
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-950/70 text-purple-800 dark:text-purple-300 border border-purple-300 dark:border-purple-800 uppercase">
                  {problem_type}
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  KaTeX Rendered
                </span>
              </div>

              {/* Rendered Equation Input */}
              <div className="mt-1 flex items-center gap-2 text-sm text-slate-700 dark:text-zinc-200">
                <span className="text-xs text-slate-400 font-sans">Input:</span>
                <MathView math={latex_input || input_expression} displayMode={false} className="text-base font-semibold" />
              </div>
            </div>
          </div>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-xs font-medium transition-colors cursor-pointer self-end sm:self-center shadow-2xs"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold text-[11px]">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-[11px]">Copy Result</span>
              </>
            )}
          </button>
        </div>

        {/* Final Solution Callout Box with KaTeX Render */}
        <div className="mt-4 p-4 rounded-xl bg-purple-600/10 dark:bg-purple-950/40 border border-purple-500/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              Verified Mathematical Solution
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-purple-200/60 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300">
              Q.E.D.
            </span>
          </div>

          {/* Large Rendered KaTeX Solution */}
          <div className="my-2 p-3 rounded-lg bg-white/80 dark:bg-black/40 border border-purple-300/40 dark:border-purple-800/40 overflow-x-auto text-purple-950 dark:text-purple-100 flex items-center justify-center">
            <MathView math={solution_latex || solution_summary} displayMode={true} className="text-lg sm:text-xl font-bold" />
          </div>

          <p className="text-xs text-purple-900/80 dark:text-purple-200/80 mt-2 leading-relaxed">
            {solution_summary}
          </p>
        </div>
      </div>

      {/* Step-by-Step Derivation with KaTeX */}
      <div className="p-4 sm:p-5 space-y-4">
        <div>
          <h4 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-purple-500" />
            <span>Step-by-Step Mathematical Derivation</span>
          </h4>

          <div className="space-y-2.5">
            {steps.map((st) => (
              <div
                key={st.step_number}
                className="p-3.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/60 dark:bg-white/[0.02]"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 text-xs font-bold font-mono flex items-center justify-center shrink-0">
                      {st.step_number}
                    </span>
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {st.title}
                    </span>
                  </div>

                  <span className="text-[10px] font-mono text-slate-400 uppercase">
                    Step {st.step_number}
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-zinc-300 mt-2 leading-relaxed">
                  {st.explanation}
                </p>

                {/* Formula Step Rendered with KaTeX */}
                {st.latex_expression && (
                  <div className="mt-2.5 px-3 py-2 rounded-lg bg-white dark:bg-black/40 border border-slate-200/70 dark:border-white/5 overflow-x-auto text-purple-700 dark:text-purple-300 flex items-center justify-start">
                    <MathView math={st.latex_expression} displayMode={false} className="text-xs sm:text-sm" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Core Formula Identity Theorem */}
        {formula_identity && (
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/5 flex items-start gap-2.5 text-xs">
            <Sigma className="w-4 h-4 text-purple-500 shrink-0 mt-0.5" />
            <div className="min-w-0 flex-1">
              <span className="font-semibold text-slate-900 dark:text-white block mb-1">
                Core Theorem / Identity Applied:
              </span>
              <div className="p-2 rounded-lg bg-white dark:bg-black/30 border border-slate-200/70 dark:border-white/5 overflow-x-auto text-purple-700 dark:text-purple-300">
                <MathView math={formula_identity} displayMode={false} className="text-xs sm:text-sm" />
              </div>
            </div>
          </div>
        )}

        {/* Real-World Practical Application */}
        {practical_application && (
          <div className="p-3 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/30 flex items-start gap-2 text-xs text-amber-900 dark:text-amber-200">
            <Lightbulb className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold block mb-0.5">Real-World Application:</span>
              <p className="text-amber-800/90 dark:text-amber-300/80 leading-relaxed text-[11px]">
                {practical_application}
              </p>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
