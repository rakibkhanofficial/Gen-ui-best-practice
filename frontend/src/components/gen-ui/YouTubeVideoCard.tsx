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

/**
 * Robust Video Thumbnail component with multi-level fallback,
 * skeleton loading, and polished badge overlays.
 */
function VideoThumbnail({
  video,
  onClick,
}: {
  video: YouTubeVideo;
  onClick: () => void;
}) {
  // Use canonical YouTube HD thumbnail, or provided URL
  const initialThumb =
    video.thumbnail_url || `https://i.ytimg.com/vi/${video.video_id}/maxresdefault.jpg`;

  const [imgSrc, setImgSrc] = useState<string>(initialThumb);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const thumb =
      video.thumbnail_url || `https://i.ytimg.com/vi/${video.video_id}/maxresdefault.jpg`;
    setImgSrc(thumb);
    setIsLoaded(false);
    setHasError(false);
  }, [video.video_id, video.thumbnail_url]);

  const handleImageError = () => {
    if (imgSrc.includes("maxresdefault")) {
      // Fallback 1: High Quality (480x360 - guaranteed to exist)
      setImgSrc(`https://i.ytimg.com/vi/${video.video_id}/hqdefault.jpg`);
    } else if (imgSrc.includes("hqdefault")) {
      // Fallback 2: Medium Quality (320x180)
      setImgSrc(`https://i.ytimg.com/vi/${video.video_id}/mqdefault.jpg`);
    } else if (imgSrc.includes("mqdefault")) {
      // Fallback 3: Legacy Google CDN
      setImgSrc(`https://img.youtube.com/vi/${video.video_id}/0.jpg`);
    } else {
      setHasError(true);
    }
  };

  return (
    <div
      onClick={onClick}
      className="relative aspect-video w-full overflow-hidden bg-slate-900 cursor-pointer group rounded-t-xl"
    >
      {/* Loading Skeleton Shimmer */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-slate-800 animate-pulse flex items-center justify-center">
          <Tv className="w-8 h-8 text-slate-700 animate-pulse" />
        </div>
      )}

      {/* Actual Thumbnail Image */}
      {!hasError ? (
        <img
          src={imgSrc}
          alt={video.title}
          onLoad={() => setIsLoaded(true)}
          onError={handleImageError}
          className={`w-full h-full object-cover group-hover:scale-105 transition-all duration-500 ease-out ${
            isLoaded ? "opacity-100" : "opacity-0"
          }`}
          loading="lazy"
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-slate-900 to-slate-800 flex flex-col items-center justify-center p-4 text-center">
          <Tv className="w-8 h-8 text-red-500 mb-2" />
          <span className="text-[11px] font-medium text-slate-300 line-clamp-1">{video.channel_name}</span>
        </div>
      )}

      {/* HD Badge top-right */}
      <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded-md bg-black/75 backdrop-blur-xs text-[9px] font-bold tracking-wider text-red-400 border border-white/10 uppercase shadow-xs">
        HD
      </div>

      {/* Duration Badge bottom-right */}
      <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/85 backdrop-blur-xs text-white text-[10px] font-mono font-medium flex items-center gap-1 shadow-sm">
        <Clock className="w-2.5 h-2.5 text-zinc-300" />
        <span>{video.duration}</span>
      </div>

      {/* Centered Play Button Overlay */}
      <div className="absolute inset-0 bg-black/25 group-hover:bg-black/50 transition-colors flex items-center justify-center">
        <div className="w-12 h-12 rounded-full bg-red-600/95 group-hover:bg-red-600 group-hover:scale-110 active:scale-95 transition-all text-white flex items-center justify-center shadow-xl shadow-red-600/30">
          <Play className="w-5 h-5 fill-white ml-0.5" />
        </div>
      </div>

      {/* YouTube red progress line on hover */}
      <div className="absolute bottom-0 left-0 w-0 group-hover:w-full h-0.5 bg-red-600 transition-all duration-300 ease-out" />
    </div>
  );
}

/**
 * Resilient Channel Avatar component with initial badge fallback.
 */
function ChannelAvatar({ avatar, name }: { avatar: string; name: string }) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [avatar]);

  if (hasError || !avatar) {
    const initial = name.trim().charAt(0).toUpperCase() || "Y";
    return (
      <div className="w-5 h-5 rounded-full bg-red-600/20 border border-red-500/30 text-red-500 text-[10px] font-bold flex items-center justify-center shrink-0">
        {initial}
      </div>
    );
  }

  return (
    <img
      src={avatar}
      alt={name}
      onError={() => setHasError(true)}
      className="w-5 h-5 rounded-full object-cover shrink-0"
    />
  );
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
        {/* Clean Header */}
        <div className="p-5 border-b border-slate-200/80 dark:border-white/10 bg-slate-50/50 dark:bg-black/20">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200/50 dark:border-red-900/40 flex items-center justify-center text-red-600 dark:text-red-400">
                <Tv className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-900 dark:text-white">
                  YouTube Video Suggestions
                </span>
                <span className="block text-[11px] text-slate-500 dark:text-zinc-400">
                  Streaming previews & modal player
                </span>
              </div>
            </div>
            <span className="text-[11px] px-2.5 py-1 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200/60 dark:border-white/5 text-slate-600 dark:text-zinc-400 font-medium">
              {videos.length} Videos
            </span>
          </div>
          <h3 className="text-sm font-semibold tracking-tight text-slate-800 dark:text-zinc-200 line-clamp-1 mt-1">
            {query}
          </h3>
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
                {/* Resilient Video Thumbnail with multi-tier fallback */}
                <VideoThumbnail
                  video={vid}
                  onClick={() => setActiveVideoId(vid.video_id)}
                />

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
                      <ChannelAvatar
                        avatar={vid.channel_avatar}
                        name={vid.channel_name}
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

                    <div className="flex items-center gap-1.5">
                      <a
                        href={`https://www.youtube.com/watch?v=${vid.video_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center p-1.5 rounded-lg bg-slate-200/80 dark:bg-white/10 hover:bg-red-600 hover:text-white text-slate-500 dark:text-zinc-400 text-[11px] transition-colors"
                        title="Watch directly on YouTube"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </a>

                      <button
                        onClick={() => setActiveVideoId(vid.video_id)}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-600 hover:bg-red-500 text-white font-medium text-[11px] transition-colors cursor-pointer shadow-xs"
                      >
                        <Play className="w-3 h-3 fill-white" />
                        <span>Play Video</span>
                      </button>
                    </div>
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
                        <ChannelAvatar
                          avatar={activeVideo.channel_avatar}
                          name={activeVideo.channel_name}
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
                      src={`https://www.youtube.com/embed/${activeVideo.video_id}?autoplay=1&rel=0`}
                      title={activeVideo.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
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
