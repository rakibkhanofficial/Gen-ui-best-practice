"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Newspaper,
  Flame,
  TrendingUp,
  Clock,
  Bookmark,
  Share2,
  ExternalLink,
  Sparkles,
  CheckCircle2,
  Volume2,
  VolumeX,
  ChevronDown,
  ChevronUp,
  Tag,
  Radio,
  Globe,
  Building2,
  Cpu,
  Rocket,
  ShieldCheck,
  Check,
} from "lucide-react";
import confetti from "canvas-confetti";

export interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  content_snippet: string;
  source_name: string;
  source_url: string;
  source_icon?: string;
  author?: string;
  published_at: string;
  category: string;
  image_url: string;
  read_time_minutes: number;
  key_takeaways: string[];
  sentiment: string;
  sentiment_label?: string;
  tags: string[];
}

export interface NewsSearchData {
  query?: string;
  category?: string;
  total_results?: number;
  breaking_alert?: string;
  featured_article?: NewsArticle;
  articles?: NewsArticle[];
  trending_topics?: string[];
  suggested_followups?: string[];
  last_updated?: string;
}

interface NewsCardProps {
  data?: NewsSearchData;
  status?: "inProgress" | "executing" | "complete";
  onTriggerQuery?: (query: string) => void;
}

/**
 * Editorial Image with resilient fallback for broken or slow CDN URLs.
 */
function EditorialImage({
  src,
  alt,
  category,
}: {
  src: string;
  alt: string;
  category: string;
}) {
  const [hasError, setHasError] = useState(false);

  if (hasError || !src) {
    return (
      <div className="relative aspect-[16/9] w-full bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 flex flex-col items-center justify-center p-4 text-center select-none overflow-hidden rounded-xl border border-white/10">
        <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300 mb-2">
          <Newspaper className="w-5 h-5 text-indigo-300" />
        </div>
        <span className="text-xs font-semibold text-white/90 line-clamp-1">{alt}</span>
        <span className="text-[10px] text-indigo-300/80 font-mono mt-0.5">{category}</span>
      </div>
    );
  }

  return (
    <div className="relative aspect-[16/9] w-full bg-slate-950 rounded-xl overflow-hidden border border-slate-200/80 dark:border-white/10 group">
      <img
        src={src}
        alt={alt}
        onError={() => setHasError(true)}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
    </div>
  );
}

export function NewsCard({ data, status = "complete", onTriggerQuery }: NewsCardProps) {
  const query = data?.query || "Top News & Editorial Wire";
  const featured = data?.featured_article;
  const articles = data?.articles || [];
  const trendingTopics = data?.trending_topics || [];
  const suggestedFollowups = data?.suggested_followups || [];
  const breakingAlert = data?.breaking_alert;
  const lastUpdated = data?.last_updated || "Just now";

  // Category filter state
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
  const [expandedArticleIds, setExpandedArticleIds] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [readingId, setReadingId] = useState<string | null>(null);

  // Available categories
  const categories = ["All", "Technology & AI", "Business & Markets", "Science & Space", "Bangladesh"];

  // Filtered articles
  const filteredArticles = articles.filter((art) => {
    if (activeCategory === "All") return true;
    return art.category.toLowerCase().includes(activeCategory.toLowerCase());
  });

  // Toggle bookmark
  const toggleBookmark = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setBookmarkedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Toggle expanded details
  const toggleExpand = (id: string) => {
    setExpandedArticleIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Share / Copy headline
  const handleShare = (article: NewsArticle, e: React.MouseEvent) => {
    e.stopPropagation();
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(`${article.title} — via ${article.source_name} (${article.source_url})`);
      setCopiedId(article.id);
      setTimeout(() => setCopiedId(null), 2000);
      try {
        confetti({
          particleCount: 25,
          spread: 45,
          origin: { y: 0.8 },
        });
      } catch {
        // Confetti optional
      }
    }
  };

  // Text-to-speech audio reader
  const handleToggleSpeech = (article: NewsArticle, e: React.MouseEvent) => {
    e.stopPropagation();
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    if (readingId === article.id) {
      window.speechSynthesis.cancel();
      setReadingId(null);
    } else {
      window.speechSynthesis.cancel();
      const textToRead = `${article.title}. Reported by ${article.source_name}. ${article.summary}`;
      const utterance = new SpeechSynthesisUtterance(textToRead);
      utterance.rate = 1.0;
      utterance.onend = () => setReadingId(null);
      utterance.onerror = () => setReadingId(null);
      setReadingId(article.id);
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto my-3 select-none">
      <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-gradient-to-b from-white via-slate-50/50 to-white dark:from-slate-900 dark:via-slate-900/90 dark:to-slate-950 p-4 sm:p-6 shadow-xl backdrop-blur-xl relative overflow-hidden transition-all duration-300">
        {/* Glow backdrop accent */}
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-rose-500/10 dark:bg-rose-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-blue-500/10 dark:bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* 1. Header Bar: Live Wire Telemetry */}
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 pb-3.5 border-b border-slate-200/80 dark:border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-600 to-amber-500 flex items-center justify-center text-white shadow-md shadow-rose-500/20">
              <Newspaper className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white tracking-tight">
                  Editorial News Wire
                </h3>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400 border border-rose-500/30 animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                  LIVE WIRE
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                Verified reporting for: <span className="font-medium text-slate-800 dark:text-slate-200">"{query}"</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-mono">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>Updated {lastUpdated}</span>
          </div>
        </div>

        {/* 2. Breaking Alert Ticker Banner */}
        {breakingAlert && (
          <div className="relative z-10 mt-3 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-rose-500/10 via-amber-500/10 to-rose-500/10 border border-rose-500/20 flex items-center gap-2.5 text-xs text-slate-800 dark:text-slate-200">
            <span className="px-1.5 py-0.5 rounded bg-rose-600 text-white font-bold text-[10px] tracking-wider uppercase shrink-0">
              ALERT
            </span>
            <p className="font-medium line-clamp-1 flex-1">{breakingAlert}</p>
            <Radio className="w-3.5 h-3.5 text-rose-500 shrink-0 animate-ping" />
          </div>
        )}

        {/* 3. Category Filter Tabs */}
        <div className="relative z-10 flex items-center gap-1.5 mt-4 overflow-x-auto pb-1 no-scrollbar">
          {categories.map((cat) => {
            const isSelected = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-white/5 dark:text-slate-400 dark:hover:bg-white/10"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* 4. Featured Hero Article (Top Lead Story) */}
        {featured && (
          <div className="relative z-10 mt-4 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-white/10 p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
              {/* Thumbnail with Source Tag */}
              <div className="md:col-span-5 relative">
                <EditorialImage src={featured.image_url} alt={featured.title} category={featured.category} />
                <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md text-white text-[11px] font-semibold border border-white/15">
                  <span>{featured.source_icon || "📰"}</span>
                  <span>{featured.source_name}</span>
                </div>
              </div>

              {/* Editorial Content */}
              <div className="md:col-span-7 flex flex-col justify-between h-full">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30">
                      {featured.category}
                    </span>
                    {featured.sentiment_label && (
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30 flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        {featured.sentiment_label}
                      </span>
                    )}
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono ml-auto">
                      {featured.published_at} • {featured.read_time_minutes} min read
                    </span>
                  </div>

                  <h4 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-snug tracking-tight mb-2 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                    {featured.title}
                  </h4>

                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed mb-3">
                    {featured.summary}
                  </p>

                  {/* Key Takeaways Highlights */}
                  {featured.key_takeaways && featured.key_takeaways.length > 0 && (
                    <div className="mb-4 p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/5 space-y-1.5">
                      <div className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
                        <Sparkles className="w-3 h-3 text-amber-500" />
                        Key Takeaways
                      </div>
                      {featured.key_takeaways.map((takeaway, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300">
                          <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                          <span className="leading-snug">{takeaway}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Card Footer Actions */}
                <div className="pt-2 border-t border-slate-100 dark:border-white/10 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    {/* Read Aloud Button */}
                    <button
                      onClick={(e) => handleToggleSpeech(featured, e)}
                      title={readingId === featured.id ? "Stop voice reader" : "Read story summary aloud"}
                      className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 transition-colors cursor-pointer ${
                        readingId === featured.id
                          ? "bg-rose-500 text-white border-rose-600"
                          : "border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10"
                      }`}
                    >
                      {readingId === featured.id ? (
                        <>
                          <VolumeX className="w-3.5 h-3.5 animate-pulse" />
                          <span className="text-[11px] font-medium">Stop Audio</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3.5 h-3.5" />
                          <span className="text-[11px] font-medium">Listen</span>
                        </>
                      )}
                    </button>

                    {/* Bookmark Button */}
                    <button
                      onClick={(e) => toggleBookmark(featured.id, e)}
                      title="Save article to reading list"
                      className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                        bookmarkedIds.has(featured.id)
                          ? "bg-amber-500 text-white border-amber-600"
                          : "border-slate-200 dark:border-white/10 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10"
                      }`}
                    >
                      <Bookmark className="w-3.5 h-3.5" />
                    </button>

                    {/* Share Button */}
                    <button
                      onClick={(e) => handleShare(featured, e)}
                      title="Copy story headline and link"
                      className="p-1.5 rounded-lg border border-slate-200 dark:border-white/10 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer flex items-center gap-1"
                    >
                      {copiedId === featured.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">Copied</span>
                        </>
                      ) : (
                        <Share2 className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>

                  {/* External Source Link */}
                  <a
                    href={featured.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    <span>Read on {featured.source_name}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 5. Secondary Stories Grid */}
        {filteredArticles.length > 0 && (
          <div className="relative z-10 mt-5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-rose-500" />
              Related Wire Reporting & Analysis ({filteredArticles.length})
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {filteredArticles.map((art) => {
                const isExpanded = expandedArticleIds.has(art.id);
                return (
                  <div
                    key={art.id}
                    className="rounded-xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-slate-900/80 p-3.5 hover:border-slate-300 dark:hover:border-white/20 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-300">
                          {art.category}
                        </span>
                        <div className="flex items-center gap-1 text-[11px] text-slate-400 font-mono">
                          <span>{art.published_at}</span>
                          <span>•</span>
                          <span>{art.read_time_minutes}m read</span>
                        </div>
                      </div>

                      <h5 className="text-sm font-bold text-slate-900 dark:text-white leading-snug mb-1.5 line-clamp-2">
                        {art.title}
                      </h5>

                      <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 mb-2 leading-relaxed">
                        {art.summary}
                      </p>

                      {/* Expandable Key Details */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-2 pt-2 border-t border-slate-100 dark:border-white/5 space-y-2 overflow-hidden"
                          >
                            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed italic">
                              "{art.content_snippet}"
                            </p>
                            {art.key_takeaways && art.key_takeaways.length > 0 && (
                              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-white/5 space-y-1">
                                {art.key_takeaways.map((takeaway, tidx) => (
                                  <div key={tidx} className="flex items-start gap-1.5 text-[11px] text-slate-600 dark:text-slate-300">
                                    <Check className="w-3 h-3 text-indigo-500 shrink-0 mt-0.5" />
                                    <span>{takeaway}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Bottom Metadata & Actions */}
                    <div className="pt-2 mt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 font-medium">
                        <span>{art.source_icon || "📰"}</span>
                        <span>{art.source_name}</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => toggleExpand(art.id)}
                          className="px-2 py-1 rounded text-[11px] font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 flex items-center gap-1 cursor-pointer"
                        >
                          {isExpanded ? (
                            <>
                              <span>Collapse</span>
                              <ChevronUp className="w-3 h-3" />
                            </>
                          ) : (
                            <>
                              <span>Takeaways</span>
                              <ChevronDown className="w-3 h-3" />
                            </>
                          )}
                        </button>

                        <button
                          onClick={(e) => toggleBookmark(art.id, e)}
                          className={`p-1 rounded transition-colors cursor-pointer ${
                            bookmarkedIds.has(art.id)
                              ? "text-amber-500"
                              : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                          }`}
                        >
                          <Bookmark className="w-3.5 h-3.5" />
                        </button>

                        <a
                          href={art.source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1 rounded text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 6. Trending Topics & Hashtags */}
        {trendingTopics.length > 0 && (
          <div className="relative z-10 mt-5 pt-3.5 border-t border-slate-200/80 dark:border-white/10">
            <div className="flex items-center gap-2 mb-2 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
              <Tag className="w-3.5 h-3.5 text-indigo-500" />
              <span>Trending Topics on the Wire</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {trendingTopics.map((topic, i) => (
                <button
                  key={i}
                  onClick={() => onTriggerQuery?.(`Tell me about latest news on ${topic.replace("#", "")}`)}
                  className="px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-300 dark:hover:bg-indigo-500/20 border border-indigo-200/60 dark:border-indigo-500/20 transition-all cursor-pointer"
                >
                  {topic}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 7. Suggested Editorial Follow-ups (1-Click Chat Inquiries) */}
        {suggestedFollowups.length > 0 && (
          <div className="relative z-10 mt-4 pt-3 border-t border-slate-200/60 dark:border-white/5">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
              Deep-Dive Inquiries
            </span>
            <div className="flex flex-wrap gap-2">
              {suggestedFollowups.map((followup, idx) => (
                <button
                  key={idx}
                  onClick={() => onTriggerQuery?.(followup)}
                  className="px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-white/5 dark:hover:bg-white/10 dark:text-slate-200 border border-slate-200/60 dark:border-white/10 transition-all flex items-center gap-1.5 cursor-pointer text-left"
                >
                  <Sparkles className="w-3 h-3 text-indigo-500 shrink-0" />
                  <span>{followup}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default NewsCard;

