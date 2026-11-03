"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  X,
  ExternalLink,
  Eye,
  Clock,
  ThumbsUp,
  Tv,
  Sparkles,
  Volume2
} from "lucide-react";

export interface YouTubeVideo {
  id: string;
  video_id: string;
  title: string;
  channel_name: string;
  channel_avatar: string;
  thumbnail_url: string;
  duration: string;
  views: string;
  published: string;
  description: string;
  tags?: string[];
  like_count?: string;
}

export interface YouTubeSearchData {
  query?: string;
  total_results?: number;
  videos?: YouTubeVideo[];
}

interface YouTubeVideoCardProps {
  data?: YouTubeSearchData;
}

export function YouTubeVideoCard({ data }: YouTubeVideoCardProps) {
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Keyboard Escape listener & body scroll lock while modal is open
  useEffect(() => {
    if (!activeVideoId) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActiveVideoId(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [activeVideoId]);

  if (!data || !data.videos || data.videos.length === 0) {
    return (
      <div className="p-5 rounded-2xl bg-white dark:bg-[#1e1f20] border border-slate-200 dark:border-white/10 text-slate-500 text-xs">
        No YouTube videos found.
      </div>
    );
  }

  const { query = "Recommended Videos", videos = [] } = data;
  const activeVideo = videos.find((v) => v.video_id === activeVideoId);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="w-full rounded-2xl bg-white dark:bg-[#1e1f20] border border-slate-200 dark:border-white/10 shadow-lg overflow-hidden text-slate-800 dark:text-slate-100"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 text-white p-5">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-white/20 backdrop-blur-xs">
                <Tv className="w-4 h-4 text-white" />
              </div>
              <span className="text-xs font-semibold uppercase tracking-wider text-red-100">
                YouTube Video Suggestions
              </span>
            </div>
            <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-xs font-medium">
              {videos.length} Videos Available
            </span>
          </div>
          <h3 className="text-lg font-bold tracking-tight text-white line-clamp-1">
            {query}
          </h3>
          <p className="text-xs text-red-100/90 mt-0.5">
            Click any video thumbnail or &quot;Play Video&quot; to open the interactive theater modal.
          </p>
        </div>

        {/* Video Grid */}
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {videos.map((vid) => {
            const isPlaying = activeVideoId === vid.video_id;

            return (
              <motion.div
                key={vid.id}
                whileHover={{ y: -2 }}
                className={`rounded-xl border transition-all duration-200 overflow-hidden flex flex-col justify-between ${
                  isPlaying
                    ? "border-red-500 ring-2 ring-red-500/20 bg-red-50/20 dark:bg-red-950/20"
                    : "border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/20 bg-slate-50/60 dark:bg-[#282a2c]/60"
                }`}
              >
                {/* Thumbnail with overlay play button */}
                <div
                  onClick={() => setActiveVideoId(vid.video_id)}
                  className="relative aspect-video w-full overflow-hidden bg-slate-900 cursor-pointer group"
                >
                  <img
                    src={vid.thumbnail_url}
                    alt={vid.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />

                  {/* Duration Badge */}
                  <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-xs text-white text-[10px] font-mono font-medium flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5" />
                    <span>{vid.duration}</span>
                  </div>

                  {/* Centered Play Button Overlay */}
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-colors flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-red-600/95 group-hover:bg-red-600 group-hover:scale-110 transition-all text-white flex items-center justify-center shadow-lg">
                      <Play className="w-5 h-5 fill-white ml-0.5" />
                    </div>
                  </div>
                </div>

                {/* Video Info */}
                <div className="p-3.5 flex-1 flex flex-col justify-between">
                  <div>
                    <h4
                      onClick={() => setActiveVideoId(vid.video_id)}
                      className="text-xs font-bold text-slate-900 dark:text-white line-clamp-2 leading-snug cursor-pointer hover:text-red-500 transition-colors"
                    >
                      {vid.title}
                    </h4>

                    <div className="flex items-center gap-2 mt-2">
                      <img
                        src={vid.channel_avatar}
                        alt={vid.channel_name}
                        className="w-5 h-5 rounded-full object-cover shrink-0"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = "none";
                        }}
                      />
                      <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300 truncate">
                        {vid.channel_name}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-500 dark:text-[#9aa0a6] mt-1.5 line-clamp-2 leading-relaxed">
                      {vid.description}
                    </p>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-200 dark:border-white/5 flex items-center justify-between text-[10px] text-slate-400">
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" /> {vid.views}
                      </span>
                      <span>&bull;</span>
                      <span>{vid.published}</span>
                    </div>

                    <button
                      onClick={() => setActiveVideoId(vid.video_id)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-600 hover:bg-red-500 text-white font-medium text-[11px] transition-colors cursor-pointer shadow-xs"
                    >
                      <Play className="w-3 h-3 fill-white" />
                      <span>Play Video</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Modern High-Fidelity Video Modal Portal */}
      {isMounted &&
        createPortal(
          <AnimatePresence>
            {activeVideo && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => setActiveVideoId(null)}
                className="fixed inset-0 z-[9999] bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
              >
                {/* Modal Dialog Card */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 15 }}
                  transition={{ type: "spring", damping: 25, stiffness: 300 }}
                  onClick={(e) => e.stopPropagation()}
                  className="relative w-full max-w-4xl bg-slate-950 border border-white/10 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto"
                >
                  {/* Modal Header */}
                  <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 bg-slate-900/90 border-b border-white/10 text-white">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-600/30 border border-red-500/40 text-[11px] font-semibold text-red-300">
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                        <span>Theater Mode</span>
                      </div>

                      <div className="flex items-center gap-2 min-w-0">
                        <img
                          src={activeVideo.channel_avatar}
                          alt={activeVideo.channel_name}
                          className="w-5 h-5 rounded-full object-cover shrink-0"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = "none";
                          }}
                        />
                        <span className="text-xs font-medium text-slate-300 truncate">
                          {activeVideo.channel_name}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href={`https://www.youtube.com/watch?v=${activeVideo.video_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition-colors"
                      >
                        <span>Open on YouTube</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>

                      <button
                        onClick={() => setActiveVideoId(null)}
                        className="p-1.5 sm:px-2.5 sm:py-1 rounded-lg bg-white/10 hover:bg-red-600 hover:text-white text-slate-300 text-xs transition-colors cursor-pointer flex items-center gap-1"
                        title="Close modal (Esc)"
                      >
                        <X className="w-4 h-4" />
                        <span className="hidden sm:inline text-[10px] font-mono text-slate-400 group-hover:text-white">Esc</span>
                      </button>
                    </div>
                  </div>

                  {/* 16:9 YouTube Embedded Iframe */}
                  <div className="relative w-full aspect-video bg-black shadow-inner">
                    <iframe
                      src={`https://www.youtube-nocookie.com/embed/${activeVideo.video_id}?autoplay=1&enablejsapi=1&rel=0&modestbranding=1`}
                      title={activeVideo.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      referrerPolicy="strict-origin-when-cross-origin"
                      allowFullScreen
                      className="w-full h-full border-0"
                    />
                  </div>

                  {/* Modal Footer / Metadata */}
                  <div className="p-4 sm:p-5 bg-gradient-to-b from-slate-950 to-slate-900 border-t border-white/5 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <h3 className="text-sm sm:text-base font-bold text-white line-clamp-1 leading-snug">
                        {activeVideo.title}
                      </h3>

                      <div className="flex items-center gap-2 text-xs text-slate-400 shrink-0">
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/5 border border-white/5">
                          <Eye className="w-3 h-3 text-slate-400" />
                          <span>{activeVideo.views}</span>
                        </span>

                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/5 border border-white/5">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{activeVideo.duration}</span>
                        </span>

                        {activeVideo.like_count && (
                          <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/5 border border-white/5 text-slate-300">
                            <ThumbsUp className="w-3 h-3 text-red-400" />
                            <span>{activeVideo.like_count}</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Tags */}
                    {activeVideo.tags && activeVideo.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {activeVideo.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-red-950/40 text-red-300 border border-red-800/40"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Description */}
                    <p className="text-xs text-slate-300/90 leading-relaxed line-clamp-2 sm:line-clamp-3">
                      {activeVideo.description}
                    </p>

                    {/* Mobile Only: Watch on YouTube link */}
                    <div className="sm:hidden pt-1">
                      <a
                        href={`https://www.youtube.com/watch?v=${activeVideo.video_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-1.5 w-full py-2 rounded-xl bg-red-600/30 hover:bg-red-600/50 text-red-300 border border-red-500/40 text-xs font-medium"
                      >
                        <span>Watch on YouTube</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </>
  );
}