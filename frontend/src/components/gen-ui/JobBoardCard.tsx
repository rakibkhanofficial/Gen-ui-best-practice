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
  Bookmark,
} from "lucide-react";

export interface JobListing {
  id: string;
  title: string;
  company: string;
  company_logo?: string;
  company_domain?: string;
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

export interface JobSearchData {
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

/**
 * Resilient, Authentic Company Favicon / Logo Component
 * Guarantees crisp company branding without generic stock photos.
 */
function CompanyLogo({
  name,
  logoUrl,
  domain,
}: {
  name: string;
  logoUrl?: string;
  domain?: string;
}) {
  const [hasError, setHasError] = useState(false);

  // 1. Check local verified high-definition company assets
  const nLower = name.toLowerCase();
  const localLogo =
    nLower.includes("brain station") || nLower.includes("brainstation")
      ? "/images/companies/brainstation.png"
      : nLower.includes("therap")
      ? "/images/companies/therap.png"
      : nLower.includes("vercel")
      ? "/images/companies/vercel.png"
      : nLower.includes("bkash")
      ? "/images/companies/bkash.png"
      : nLower.includes("pathao")
      ? "/images/companies/pathao.png"
      : nLower.includes("chaldal")
      ? "/images/companies/chaldal.png"
      : nLower.includes("shopup")
      ? "/images/companies/shopup.png"
      : nLower.includes("google")
      ? "/images/companies/google.png"
      : nLower.includes("microsoft")
      ? "/images/companies/microsoft.png"
      : nLower.includes("meta")
      ? "/images/companies/meta.png"
      : nLower.includes("optimizely")
      ? "/images/companies/optimizely.png"
      : nLower.includes("selise")
      ? "/images/companies/selise.png"
      : nLower.includes("enosis")
      ? "/images/companies/enosis.png"
      : nLower.includes("tigerit")
      ? "/images/companies/tigerit.png"
      : nLower.includes("beximco")
      ? "/images/companies/beximco.png"
      : nLower.includes("square")
      ? "/images/companies/square.png"
      : nLower.includes("aci")
      ? "/images/companies/aci.png"
      : nLower.includes("bashundhara")
      ? "/images/companies/bashundhara.png"
      : nLower.includes("walton")
      ? "/images/companies/walton.png"
      : nLower.includes("pran")
      ? "/images/companies/pran.png"
      : nLower.includes("akij")
      ? "/images/companies/akij.png"
      : nLower.includes("brac")
      ? "/images/companies/brac.png"
      : nLower.includes("grameenphone") || nLower.includes(" gp") || nLower === "gp"
      ? "/images/companies/grameenphone.png"
      : nLower.includes("summit")
      ? "/images/companies/summit.png"
      : nLower.includes("city group") || nLower.includes("citygroup")
      ? "/images/companies/citygroup.png"
      : nLower.includes("jamuna")
      ? "/images/companies/jamuna.png"
      : nLower.includes("navana")
      ? "/images/companies/navana.png"
      : nLower.includes("anwar")
      ? "/images/companies/anwar.png"
      : nLower.includes("apex")
      ? "/images/companies/apex.png"
      : nLower.includes("dbl")
      ? "/images/companies/dbl.png"
      : nLower.includes("incepta")
      ? "/images/companies/incepta.png"
      : nLower.includes("acme")
      ? "/images/companies/acme.png"
      : nLower.includes("mgi") || nLower.includes("meghna group")
      ? "/images/companies/mgi.png"
      : null;

  // 2. Resolve domain for Google S2 Favicon service
  const cleanFirstWord = nLower.split(" ")[0].replace(/[^a-z0-9]/g, "");
  const derivedDomain =
    domain ||
    (nLower.includes("brain")
      ? "brainstation-23.com"
      : nLower.includes("therap")
      ? "therapservices.net"
      : nLower.includes("vercel")
      ? "vercel.com"
      : nLower.includes("bkash")
      ? "bkash.com"
      : nLower.includes("pathao")
      ? "pathao.com"
      : nLower.includes("chaldal")
      ? "chaldal.com"
      : nLower.includes("beximco")
      ? "beximco.com"
      : nLower.includes("square")
      ? "squarepharma.com.bd"
      : nLower.includes("aci")
      ? "aci-bd.com"
      : nLower.includes("bashundhara")
      ? "bashundharagroup.com"
      : nLower.includes("walton")
      ? "waltonbd.com"
      : nLower.includes("pran")
      ? "pranrflgroup.com"
      : nLower.includes("akij")
      ? "akij.net"
      : nLower.includes("brac")
      ? "brac.net"
      : nLower.includes("grameenphone")
      ? "grameenphone.com"
      : nLower.includes("summit")
      ? "summitpowerinternational.com"
      : nLower.includes("citygroup") || nLower.includes("city group")
      ? "citygroup.com.bd"
      : `${cleanFirstWord}.com`);

  const s2FaviconUrl = `https://www.google.com/s2/favicons?domain=${derivedDomain}&sz=128`;

  // Filter out any unsplash stock photos
  const isStockPhoto = logoUrl && (logoUrl.includes("unsplash.com") || logoUrl.includes("images.unsplash"));
  const activeSrc = localLogo || (!isStockPhoto && logoUrl ? logoUrl : s2FaviconUrl);

  if (hasError) {
    const initials = name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

    return (
      <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200/60 dark:border-blue-800/40 flex items-center justify-center text-blue-700 dark:text-blue-300 font-bold text-xs shrink-0 shadow-2xs">
        {initials || "JB"}
      </div>
    );
  }

  return (
    <div className="w-12 h-12 rounded-xl bg-white dark:bg-white/95 border border-slate-200/80 dark:border-white/10 flex items-center justify-center p-2 shrink-0 shadow-2xs overflow-hidden">
      <img
        src={activeSrc}
        alt={name}
        onError={() => setHasError(true)}
        className="max-h-full max-w-full object-contain"
        loading="lazy"
      />
    </div>
  );
}

export function JobBoardCard({ data, status = "complete" }: JobBoardCardProps) {
  const [selectedPlatform, setSelectedPlatform] = useState<string>("All");
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null);
  const [savedJobs, setSavedJobs] = useState<Record<string, boolean>>({});

  if (status === "inProgress" || !data?.jobs) {
    return (
      <div className="w-full max-w-3xl p-6 rounded-2xl bg-white dark:bg-[#1e1f20] animate-pulse border border-slate-200 dark:border-white/10 my-3">
        <div className="h-6 w-56 bg-slate-200 dark:bg-slate-700 rounded-md mb-4" />
        <div className="space-y-3">
          <div className="h-28 bg-slate-100 dark:bg-slate-800 rounded-2xl" />
          <div className="h-28 bg-slate-100 dark:bg-slate-800 rounded-2xl" />
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
        return "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/60";
      case "LinkedIn":
        return "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800/60";
      default:
        return "bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800/60";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="w-full max-w-3xl my-4 rounded-2xl bg-white dark:bg-[#1e1f20] p-5 sm:p-6 border border-slate-200/90 dark:border-white/10 shadow-lg relative overflow-hidden text-slate-800 dark:text-slate-100"
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between pb-4 border-b border-slate-200/80 dark:border-white/10 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/50 flex items-center justify-center shrink-0">
              <Briefcase className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                {data.query || "Tech Career Opportunities"}
              </h3>
            </div>
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full bg-cyan-50 dark:bg-cyan-950/80 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800 font-medium ml-1">
              <Sparkles className="w-3 h-3" /> Live Career Match
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Aggregated from {data.featured_platform || "BDJobs & LinkedIn"} for {data.location || "Dhaka, Bangladesh"}
          </p>
        </div>

        {/* Platform filter pills */}
        <div className="flex items-center bg-slate-100 dark:bg-white/10 p-1 rounded-xl border border-slate-200 dark:border-white/10 text-xs">
          {["All", "BDJobs", "LinkedIn"].map((platform) => (
            <button
              key={platform}
              type="button"
              onClick={() => setSelectedPlatform(platform)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                selectedPlatform === platform
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              {platform}
            </button>
          ))}
        </div>
      </div>

      {/* Job Listings List */}
      <div className="space-y-3.5 my-4">
        {filteredJobs.map((job) => {
          const isExpanded = expandedJobId === job.id;
          const isSaved = savedJobs[job.id];

          return (
            <motion.div
              key={job.id}
              layout
              className={`rounded-2xl border transition-all duration-200 p-4 ${
                isExpanded
                  ? "border-blue-500/60 ring-2 ring-blue-500/10 bg-slate-50/90 dark:bg-white/5"
                  : "border-slate-200/80 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/20 bg-slate-50/60 dark:bg-[#252628]/60"
              }`}
            >
              {/* Top Row: Company Logo, Info & Action Buttons */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start space-x-3.5 min-w-0">
                  <CompanyLogo
                    name={job.company}
                    logoUrl={job.company_logo}
                    domain={job.company_domain}
                  />

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 truncate">
                        {job.company}
                      </span>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${getPlatformBadge(job.platform)}`}>
                        {job.platform}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-tight mt-0.5">
                      {job.title}
                    </h4>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {job.location}
                      </span>
                      <span>&bull;</span>
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400 font-mono">
                        {job.salary_range}
                      </span>
                      <span>&bull;</span>
                      <span>{job.experience_level}</span>
                    </div>
                  </div>
                </div>

                {/* Right badges & buttons */}
                <div className="flex items-center space-x-2 shrink-0">
                  <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-mono font-semibold px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                    {job.match_score}% Match
                  </span>

                  <button
                    type="button"
                    onClick={() => toggleSaveJob(job.id)}
                    className={`p-1.5 rounded-xl border transition-colors cursor-pointer ${
                      isSaved
                        ? "bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 border-blue-300 dark:border-blue-700"
                        : "bg-white dark:bg-white/10 text-slate-400 hover:text-slate-700 dark:hover:text-white border-slate-200 dark:border-white/10"
                    }`}
                    title={isSaved ? "Saved" : "Save Job"}
                  >
                    <Bookmark className="w-3.5 h-3.5 fill-current" />
                  </button>

                  <a
                    href={job.apply_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                  >
                    <span>Apply</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              {/* Tags row */}
              <div className="flex flex-wrap items-center gap-1.5 mt-3 pt-2.5 border-t border-slate-200/80 dark:border-white/5">
                {job.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="text-[11px] px-2 py-0.5 rounded-lg bg-white dark:bg-white/10 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10 font-mono"
                  >
                    {tag}
                  </span>
                ))}

                <button
                  type="button"
                  onClick={() => setExpandedJobId(isExpanded ? null : job.id)}
                  className="ml-auto flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                >
                  <span>{isExpanded ? "Hide Details" : "Interview Prep & Role"}</span>
                  {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Expandable Description & Interview Prep Drawer */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25 }}
                    className="mt-3 pt-3 border-t border-slate-200/80 dark:border-white/10 space-y-3"
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                        Role Overview
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                        {job.description}
                      </p>
                    </div>

                    {job.interview_tips && job.interview_tips.length > 0 && (
                      <div className="p-3 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/70 dark:border-blue-900/50">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-blue-800 dark:text-blue-300 mb-1.5">
                          <GraduationCap className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          <span>AI Agent Interview & Technical Prep Tips</span>
                        </div>
                        <ul className="space-y-1">
                          {job.interview_tips.map((tip, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
                              <CheckCircle2 className="w-3 h-3 text-blue-500 shrink-0 mt-0.5" />
                              <span>{tip}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
