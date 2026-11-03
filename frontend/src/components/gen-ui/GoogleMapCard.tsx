"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  MapPin,
  Navigation,
  ExternalLink,
  Phone,
  Clock,
  Star,
  Compass,
  Building,
  Share2,
  Check,
} from "lucide-react";

export interface MapPlaceItem {
  id: string;
  name: string;
  category: string;
  address: string;
  latitude: number;
  longitude: number;
  rating: number;
  review_count: number;
  open_now: boolean;
  opening_hours: string;
  phone: string;
  google_maps_url: string;
  embed_map_url: string;
  distance_km?: number;
  travel_time_min?: number;
}

export interface MapSearchData {
  query: string;
  location: string;
  places: MapPlaceItem[];
  active_place_index?: number;
}

interface GoogleMapCardProps {
  data?: MapSearchData;
}

export function GoogleMapCard({ data }: GoogleMapCardProps) {
  const [activeIdx, setActiveIdx] = useState(data?.active_place_index || 0);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!data?.places || data.places.length === 0) {
    return (
      <div className="w-full max-w-3xl p-5 rounded-2xl bg-white dark:bg-[#1e1f20] border border-slate-200 dark:border-white/10 text-slate-500 text-xs">
        No map locations found.
      </div>
    );
  }

  const { places, location, query } = data;
  const currentPlace = places[activeIdx] || places[0];

  const handleShare = () => {
    navigator.clipboard.writeText(currentPlace.google_maps_url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-3xl my-3 rounded-2xl bg-white dark:bg-[#1e1f20] border border-slate-200 dark:border-white/10 shadow-sm text-slate-800 dark:text-slate-100 overflow-hidden"
    >
      {/* Map Header */}
      <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-white/10 bg-slate-50/80 dark:bg-white/[0.02]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-rose-600/30">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                  Google Maps Explorer
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-semibold border border-rose-200 dark:border-rose-900">
                  LIVE INTERACTIVE
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5 line-clamp-1">
                {query} &bull; {location}
              </p>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2 self-end sm:self-center">
            <button
              onClick={handleShare}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-600 dark:text-zinc-300 text-xs transition-colors cursor-pointer flex items-center gap-1"
              title="Copy location link"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Share2 className="w-3.5 h-3.5" />}
              <span className="text-[11px] hidden sm:inline">{copiedLink ? "Copied" : "Share"}</span>
            </button>

            <a
              href={currentPlace.google_maps_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold transition-all shadow-xs"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Directions</span>
            </a>
          </div>
        </div>

        {/* Place Selection Tabs if Multiple Places */}
        {places.length > 1 && (
          <div className="flex items-center gap-2 overflow-x-auto mt-3.5 pt-3 border-t border-slate-200/70 dark:border-white/5">
            {places.map((place, idx) => (
              <button
                key={place.id}
                onClick={() => setActiveIdx(idx)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 cursor-pointer ${
                  activeIdx === idx
                    ? "bg-rose-600 text-white shadow-xs"
                    : "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-white/10"
                }`}
              >
                <Building className="w-3.5 h-3.5" />
                <span className="truncate max-w-[160px]">{place.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Embedded Google Map Iframe */}
      <div className="relative w-full h-[320px] sm:h-[380px] bg-slate-900 border-b border-slate-200 dark:border-white/10">
        <iframe
          src={currentPlace.embed_map_url}
          title={currentPlace.name}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          loading="lazy"
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
          className="w-full h-full"
        />

        {/* Overlay Floating Badge for Travel Time / Distance */}
        {currentPlace.distance_km && (
          <div className="absolute top-3 left-3 px-3 py-1.5 rounded-xl bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border border-slate-200 dark:border-white/10 shadow-lg text-xs flex items-center gap-2">
            <Navigation className="w-3.5 h-3.5 text-rose-600" />
            <span className="font-bold text-slate-900 dark:text-white font-mono">
              {currentPlace.distance_km} km
            </span>
            {currentPlace.travel_time_min && (
              <>
                <span className="text-slate-400">&bull;</span>
                <span className="text-slate-600 dark:text-zinc-300 font-medium">
                  ~{currentPlace.travel_time_min} mins drive
                </span>
              </>
            )}
          </div>
        )}
      </div>

      {/* Place Details Card Footer */}
      <div className="p-4 sm:p-5 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                {currentPlace.name}
              </h4>
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-zinc-300 border border-slate-200/80 dark:border-white/5 font-medium">
                {currentPlace.category}
              </span>
            </div>

            <p className="text-xs text-slate-600 dark:text-zinc-400 mt-1 flex items-start gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
              <span>{currentPlace.address}</span>
            </p>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800 text-xs font-bold">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{currentPlace.rating}</span>
              <span className="text-slate-400 font-normal">({currentPlace.review_count})</span>
            </div>

            <span className="text-xs px-2 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 font-medium">
              Open Now
            </span>
          </div>
        </div>

        {/* Operating Hours & Hotline */}
        <div className="pt-2 border-t border-slate-100 dark:border-white/5 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-500 dark:text-zinc-400 gap-2">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>{currentPlace.opening_hours}</span>
          </div>

          <div className="flex items-center gap-3">
            <a
              href={`tel:${currentPlace.phone}`}
              className="flex items-center gap-1 text-slate-700 dark:text-zinc-300 hover:text-rose-600 dark:hover:text-rose-400 font-mono transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-rose-500" />
              <span>{currentPlace.phone}</span>
            </a>

            <a
              href={currentPlace.google_maps_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-rose-600 dark:text-rose-400 hover:underline font-medium"
            >
              <span>Open in Maps App</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
