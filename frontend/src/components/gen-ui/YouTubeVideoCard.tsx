"use client";

import React, { useState } from "react";
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
  Share2
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
              YouTube Video Suggestions & Player
            </span>
          </div>
          <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-xs font-medium">
            {videos.length} Suggestions
          </span>
        </div>
        <h3 className="text-lg font-bold tracking-tight text-white line-clamp-1">
          {query}
        </h3>
        <p className="text-xs text-red-100/90 mt-0.5">
          Click any video thumbnail below to preview and stream directly in the chat.
        </p>
      </div>

      {/* Active Embedded Player Modal / Inline Player */}
      <AnimatePresence>
        {activeVideo && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="p-4 bg-black/90 border-b border-white/10"
          >
            <div className="flex items-center justify-between pb-3 text-white">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-xs font-bold truncate">{activeVideo.title}</span>
              </div>
              <button
                onClick={() => setActiveVideoId(null)}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs transition-colors cursor-pointer"
                title="Close player"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 16:9 Embedded YouTube Iframe */}
            <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black shadow-2xl">
              <iframe
                src={`https://www.youtube.com/embed/${activeVideo.video_id}?autoplay=1&rel=0`}
                title={activeVideo.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="w-full h-full border-0"
              />
            </div>

            <div className="flex items-center justify-between mt-3 text-xs text-slate-300">
              <span className="truncate">{activeVideo.channel_name} &bull; {activeVideo.views}</span>
              <a
                href={`https://www.youtube.com/watch?v=${activeVideo.video_id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-red-400 hover:text-red-300 font-medium"
              >
                <span>Open on YouTube</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
                  ? "border-red-500 bg-red-50/20 dark:bg-red-950/20"
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
                  <div className="w-12 h-12 rounded-full bg-red-600/90 group-hover:bg-red-600 group-hover:scale-110 transition-all text-white flex items-center justify-center shadow-lg">
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

                  {vid.like_count && (
                    <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                      <ThumbsUp className="w-3 h-3" /> {vid.like_count}
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

