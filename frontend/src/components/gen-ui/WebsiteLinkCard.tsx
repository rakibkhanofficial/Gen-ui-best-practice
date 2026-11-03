"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Globe,
  ExternalLink,
  Copy,
  Check,
  ShieldCheck,
  Sparkles,
  Bookmark,
  Share2
} from "lucide-react";

export interface WebsiteLink {
  url: string;
  title: string;
  description: string;
  favicon_url: string;
  og_image?: string;
  domain: string;
  category: string;
  relevance_note: string;
}

export interface WebsiteLinkData {
  query?: string;
  total_results?: number;
  websites?: WebsiteLink[];
}

interface WebsiteLinkCardProps {
  data?: WebsiteLinkData;
}

export function WebsiteLinkCard({ data }: WebsiteLinkCardProps) {
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  if (!data || !data.websites || data.websites.length === 0) {
    return (
      <div className="p-5 rounded-2xl bg-white dark:bg-[#1e1f20] border border-slate-200 dark:border-white/10 text-slate-500 text-xs">
        No website metadata available.
      </div>
    );
  }

  const { query = "Recommended Resources", websites = [] } = data;

  const handleCopy = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="w-full rounded-2xl bg-white dark:bg-[#1e1f20] border border-slate-200 dark:border-white/10 shadow-lg overflow-hidden text-slate-800 dark:text-slate-100"
    >
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-700 text-white p-5">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-white/20 backdrop-blur-xs">
              <Globe className="w-4 h-4 text-white" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider text-purple-100">
              Verified Web Resources & Metadata
            </span>
          </div>
          <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-xs font-medium">
            {websites.length} Curated Sites
          </span>
        </div>
        <h3 className="text-lg font-bold tracking-tight text-white line-clamp-1">
          {query}
        </h3>
        <p className="text-xs text-purple-100/90 mt-0.5">
          Metadata, favicons, and verified secure links extracted for your query.
        </p>
      </div>

      {/* Website Cards List */}
      <div className="p-4 space-y-3.5">
        {websites.map((site, index) => {
          const isCopied = copiedUrl === site.url;

          return (
            <motion.div
              key={index}
              whileHover={{ y: -1 }}
              className="rounded-xl border border-slate-200 dark:border-white/10 hover:border-purple-300 dark:hover:border-purple-700 bg-slate-50/70 dark:bg-[#282a2c]/60 p-4 transition-all duration-200 shadow-xs"
            >
              <div className="flex flex-col sm:flex-row gap-4 items-start">
                {/* Favicon / Logo Container */}
                <div className="w-12 h-12 rounded-xl bg-white dark:bg-black/40 border border-slate-200 dark:border-white/10 flex items-center justify-center p-2 shrink-0 shadow-xs">
                  <img
                    src={site.favicon_url}
                    alt={site.domain}
                    className="w-7 h-7 object-contain"
                    onError={(e) => {
                      // Fallback to Globe icon if favicon fails to load
                      const target = e.target as HTMLElement;
                      target.style.display = "none";
                      const parent = target.parentElement;
                      if (parent && !parent.querySelector(".fallback-globe")) {
                        const icon = document.createElement("div");
                        icon.className = "fallback-globe text-purple-500 font-bold text-xs";
                        icon.innerText = site.domain.slice(0, 2).toUpperCase();
                        parent.appendChild(icon);
                      }
                    }}
                  />
                </div>

                {/* Site Metadata & Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                      {site.category}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400 dark:text-slate-400 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-500" />
                      {site.domain}
                    </span>
                  </div>

                  {/* Title & Link */}
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                    <a
                      href={site.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors inline-flex items-center gap-1.5"
                    >
                      <span>{site.title}</span>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400 inline" />
                    </a>
                  </h4>

                  {/* Description */}
                  <p className="text-xs text-slate-600 dark:text-[#c4c7c5] mt-1.5 leading-relaxed line-clamp-2">
                    {site.description}
                  </p>

                  {/* Relevance Note */}
                  {site.relevance_note && (
                    <div className="mt-2 text-[11px] text-purple-700 dark:text-purple-300/90 italic flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3 text-purple-500 shrink-0" />
                      <span>{site.relevance_note}</span>
                    </div>
                  )}

                  {/* OG Image Preview if present */}
                  {site.og_image && (
                    <div className="mt-3 rounded-lg overflow-hidden border border-slate-200 dark:border-white/10 max-h-36 bg-slate-900">
                      <img
                        src={site.og_image}
                        alt={site.title}
                        className="w-full h-full object-cover max-h-36"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = "none";
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Action Bar */}
              <div className="mt-3 pt-3 border-t border-slate-200 dark:border-white/5 flex items-center justify-between text-xs text-slate-500">
                <span className="text-[11px] font-mono truncate max-w-[200px] sm:max-w-xs text-slate-400">
                  {site.url}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopy(site.url)}
                    className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors cursor-pointer"
                    title="Copy URL"
                  >
                    {isCopied ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>

                  <a
                    href={site.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-[11px] font-medium inline-flex items-center gap-1 transition-colors"
                  >
                    <span>Visit Site</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

