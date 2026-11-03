"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Briefcase,
  MapPin,
  Building2,
  DollarSign,
  Sparkles,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  GraduationCap,
  CheckCircle2,
  Filter,
  Bookmark
} from "lucide-react";

interface JobListing {
  id: string;
  title: string;
  company: string;
  company_logo?: string;
  location: string;
  platform: "BDJobs" | "LinkedIn" | "RemoteGlobal";
  salary_range: string;
  work_type: "Remote" | "Hybrid" | "On-site";
  experience_level: "Junior" | "Mid-Level" | "Senior" | "Lead";
  tags: string[];
  posted_time: string;
  description: string;
  apply_url: string;
  match_score: number;
  interview_tips?: string[];
}

interface JobSearchData {
  query?: string;
  location?: string;
  total_jobs?: number;
  featured_platform?: string;
  jobs?: JobListing[];
}

interface JobBoardCardProps {
  data?: JobSearchData;
  status?: "inProgress" | "executing" | "complete";
}

export function JobBoardCard({ data, status = "complete" }: JobBoardCardProps) {
  const [selectedPlatform, setSelectedPlatform] = useState<string>("All");
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null);
  const [savedJobs, setSavedJobs] = useState<Record<string, boolean>>({});

  if (status === "inProgress" || !data?.jobs) {
    return (
      <div className="w-full max-w-3xl p-6 rounded-2xl glass-panel animate-pulse border border-slate-700/60 my-3">
        <div className="h-6 w-56 bg-slate-700 rounded-md mb-4" />
        <div className="space-y-3">
          <div className="h-28 bg-slate-800 rounded-xl" />
          <div className="h-28 bg-slate-800 rounded-xl" />
        </div>
      </div>
    );
  }

  const filteredJobs = data.jobs.filter((j) =>
    selectedPlatform === "All" ? true : j.platform === selectedPlatform
  );

  const toggleSaveJob = (id: string) => {
    setSavedJobs((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const getPlatformBadge = (platform: string) => {
    switch (platform) {
      case "BDJobs":
        return "bg-amber-950/80 text-amber-300 border-amber-700/80";
      case "LinkedIn":
        return "bg-blue-950/80 text-blue-300 border-blue-700/80";
      default:
        return "bg-purple-950/80 text-purple-300 border-purple-700/80";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="w-full max-w-3xl my-4 rounded-2xl glass-panel-elevated p-6 border border-slate-700/60 shadow-2xl relative overflow-hidden text-slate-100"
    >
      {/* Ambient background glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between pb-4 border-b border-slate-700/60 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-cyan-400" />
              BDJobs &amp; LinkedIn Career Hub
            </h3>
            <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-800 font-medium">
              <Sparkles className="w-3 h-3" /> GenUI Jobs
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Aggregated {data.total_jobs} active positions matching &quot;{data.query}&quot; in {data.location}
          </p>
        </div>

        {/* Platform Filters */}
        <div className="flex items-center bg-slate-900/90 p-1 rounded-xl border border-slate-700 gap-1 text-xs">
          {["All", "BDJobs", "LinkedIn"].map((plat) => (
            <button
              key={plat}
              onClick={() => setSelectedPlatform(plat)}
              className={`px-3 py-1 rounded-lg transition-colors font-medium ${
                selectedPlatform === plat
                  ? "bg-cyan-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {plat}
            </button>
          ))}
        </div>
      </div>

      {/* Jobs List */}
      <div className="space-y-3.5 my-4">
        {filteredJobs.map((job) => {
          const isExpanded = expandedJobId === job.id;
          const isSaved = savedJobs[job.id];

          return (
            <div
              key={job.id}
              className="bg-slate-900/70 hover:bg-slate-900/95 transition-all rounded-xl p-4 border border-slate-800 hover:border-slate-700/90 relative"
            >
              {/* Top Row: Title, Company, Platform & Match Score */}
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md border uppercase tracking-wider ${getPlatformBadge(
                        job.platform
                      )}`}
                    >
                      {job.platform}
                    </span>
                    <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700 font-medium">
                      {job.work_type}
                    </span>
                    <span className="text-[11px] text-slate-400">{job.posted_time}</span>
                  </div>

                  <h4 className="text-base font-bold text-white hover:text-cyan-300 transition-colors">
                    {job.title}
                  </h4>

                  <div className="flex items-center gap-2 text-xs text-slate-300 mt-1">
                    <span className="font-semibold text-slate-200 flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      {job.company}
                    </span>
                    <span className="text-slate-600">&bull;</span>
                    <span className="flex items-center gap-1 text-slate-400">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {job.location}
                    </span>
                  </div>
                </div>

                {/* Match Score & Bookmark */}
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <div className="text-sm font-extrabold text-emerald-400">
                      {job.match_score}%
                    </div>
                    <div className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold">
                      Profile Match
                    </div>
                  </div>

                  <button
                    onClick={() => toggleSaveJob(job.id)}
                    className={`p-2 rounded-lg border transition-colors ${
                      isSaved
                        ? "bg-cyan-950 text-cyan-300 border-cyan-700"
                        : "bg-slate-800/80 text-slate-400 hover:text-white border-slate-700"
                    }`}
                    title={isSaved ? "Saved" : "Save Job"}
                  >
                    <Bookmark className={`w-4 h-4 ${isSaved ? "fill-current" : ""}`} />
                  </button>
                </div>
              </div>

              {/* Salary & Brief description */}
              <div className="my-2.5 flex flex-wrap items-center justify-between text-xs pt-2 border-t border-slate-800/80 gap-2">
                <span className="font-bold text-emerald-300 font-mono text-sm">
                  {job.salary_range}
                </span>

                <div className="flex flex-wrap gap-1">
                  {job.tags.slice(0, 4).map((tag, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <p className="text-xs text-slate-400 leading-snug line-clamp-2 mt-1">
                {job.description}
              </p>

              {/* Collapsible Interview Preparation Tips Drawer */}
              {job.interview_tips && (
                <div className="mt-3">
                  <button
                    onClick={() => setExpandedJobId(isExpanded ? null : job.id)}
                    className="flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 font-medium py-1 transition-colors"
                  >
                    <GraduationCap className="w-3.5 h-3.5" />
                    <span>AI Interview Preparation Tips ({job.interview_tips.length})</span>
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-2 p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-xs space-y-1.5"
                      >
                        <span className="text-[11px] font-bold text-slate-300 block mb-1">
                          Tailored Strategy from Gemini 3.8 Flash:
                        </span>
                        {job.interview_tips.map((tip, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-slate-300 text-[11px]">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                            <span>{tip}</span>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Action Apply Button */}
              <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-end">
                <a
                  href={job.apply_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs transition-colors shadow-sm"
                >
                  <span>Apply on {job.platform}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
