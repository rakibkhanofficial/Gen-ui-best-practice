"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Navigation,
  Car,
  Train,
  Plane,
  Footprints,
  Clock,
  Sparkles,
  ChevronRight,
  ChevronDown,
  Leaf,
  DollarSign,
  ExternalLink,
  Compass,
  Map as MapIcon,
} from "lucide-react";

interface RouteWaypoint {
  name: string;
  distance_from_start_km: number;
  note?: string;
}

interface TravelModeOption {
  mode: "driving" | "transit" | "flying" | "walking";
  duration_text: string;
  distance_km: number;
  distance_miles: number;
  estimated_cost?: string;
  carbon_kg?: number;
  is_recommended: boolean;
}

interface NavigationStep {
  step_number: number;
  instruction: string;
  distance: string;
  duration: string;
}

interface RouteDistanceData {
  origin?: string;
  destination?: string;
  recommended_mode?: string;
  options?: TravelModeOption[];
  waypoints?: RouteWaypoint[];
  steps?: NavigationStep[];
  map_summary?: string;
  osm_embed_url?: string;
  osm_directions_url?: string;
  google_maps_directions_url?: string;
  origin_coords?: number[];
  destination_coords?: number[];
  route_summary_notes?: string;
}

interface RouteDistanceProps {
  data?: RouteDistanceData;
  status?: "inProgress" | "executing" | "complete";
}

export function RouteDistanceCard({ data, status = "complete" }: RouteDistanceProps) {
  const [selectedMode, setSelectedMode] = useState<string>("driving");
  const [showSteps, setShowSteps] = useState(true);

  if (status === "inProgress" || !data?.origin) {
    return (
      <div className="w-full max-w-2xl p-6 rounded-2xl glass-panel animate-pulse border border-slate-700/60 my-3">
        <div className="h-6 w-48 bg-slate-700 rounded-md mb-4" />
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="h-16 bg-slate-800 rounded-xl" />
          <div className="h-16 bg-slate-800 rounded-xl" />
          <div className="h-16 bg-slate-800 rounded-xl" />
        </div>
        <div className="h-44 bg-slate-800/80 rounded-xl" />
      </div>
    );
  }

  const activeOption =
    data.options?.find((o) => o.mode === selectedMode) || data.options?.[0];

  const getModeIcon = (mode: string) => {
    switch (mode) {
      case "driving":
        return <Car className="w-4 h-4" />;
      case "transit":
        return <Train className="w-4 h-4" />;
      case "flying":
        return <Plane className="w-4 h-4" />;
      case "walking":
        return <Footprints className="w-4 h-4" />;
      default:
        return <Navigation className="w-4 h-4" />;
    }
  };

  // Derive clean short labels for origin and destination
  const originShort = data.origin ? data.origin.split(",")[0].trim() : "Origin";
  const destShort = data.destination
    ? data.destination.split("(")[0].split(",")[0].trim()
    : "Destination";
  const areaText = data.origin?.includes(",")
    ? data.origin.split(",").slice(1).join(",").trim()
    : "";

  // Derive OSM embed URL fallback if not provided
  const embedUrl =
    data.osm_embed_url ||
    "https://www.openstreetmap.org/export/embed.html?bbox=90.38%2C23.77%2C90.43%2C23.86&layer=mapnik&marker=23.8510%2C90.4074";

  const osmDirections =
    data.osm_directions_url ||
    "https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=23.7785%2C90.4007%3B23.8510%2C90.4074";

  const gmapsDirections =
    data.google_maps_directions_url ||
    `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(data.origin)}&destination=${encodeURIComponent(data.destination || "")}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.99 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="w-full max-w-3xl my-3 rounded-2xl bg-white dark:bg-[#1e1f20] p-4 sm:p-5 border border-slate-200/90 dark:border-white/10 shadow-md text-slate-800 dark:text-zinc-100 overflow-hidden"
    >
      {/* Properly Organized Top Header */}
      <div className="pb-4 border-b border-slate-200/80 dark:border-white/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Left: Icon & Route Info */}
          <div className="flex items-start sm:items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/50 border border-teal-200/60 dark:border-teal-800/40 flex items-center justify-center text-teal-600 dark:text-teal-400 shrink-0 shadow-2xs">
              <Navigation className="w-5 h-5" />
            </div>

            <div className="min-w-0 flex-1">
              {/* Header Title with Engine Pill */}
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                  Route & Turn-by-Turn Navigation
                </h3>
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-teal-50 dark:bg-teal-950/70 text-teal-700 dark:text-teal-300 border border-teal-200/80 dark:border-teal-800/40">
                  OpenStreetMap &bull; OSRM
                </span>
              </div>

              {/* Clean Origin -> Destination Subtitle */}
              <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-zinc-300 mt-1 flex-wrap">
                <span className="font-semibold text-slate-900 dark:text-white">
                  {originShort}
                </span>
                <span className="text-teal-500 font-bold">&rarr;</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {destShort}
                </span>
                {areaText && (
                  <span className="text-[11px] text-slate-400 dark:text-zinc-500">
                    ({areaText})
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right: Map Navigation Actions */}
          <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
            <a
              href={osmDirections}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
              title="Open turn-by-turn route in OpenStreetMap"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>OpenStreetMap</span>
              <ExternalLink className="w-3 h-3 opacity-80" />
            </a>

            <a
              href={gmapsDirections}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-white/5 hover:bg-slate-200/80 dark:hover:bg-white/10 text-slate-700 dark:text-zinc-200 text-xs font-medium border border-slate-200/80 dark:border-white/10 transition-colors cursor-pointer"
              title="Open directions in Google Maps"
            >
              <MapIcon className="w-3.5 h-3.5 text-blue-500" />
              <span>Google Maps</span>
              <ExternalLink className="w-3 h-3 opacity-70" />
            </a>
          </div>
        </div>
      </div>

      {/* Embedded OpenStreetMap Live View */}
      <div className="my-4 rounded-xl overflow-hidden border border-slate-200 dark:border-white/10 relative aspect-[16/8] sm:aspect-[21/9] bg-slate-950 shadow-inner">
        <iframe
          src={embedUrl}
          title="OpenStreetMap Route"
          className="w-full h-full border-0"
          loading="lazy"
        />
        {/* Floating Route Badge */}
        <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-lg bg-black/80 backdrop-blur-xs text-white text-xs font-medium border border-white/15 flex items-center gap-2 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
          <span>{originShort} &rarr; {destShort}</span>
        </div>
      </div>

      {/* Travel Modes Selector */}
      <div className="grid grid-cols-3 gap-2.5 my-3">
        {(data.options || []).map((opt) => {
          const isSelected = selectedMode === opt.mode;
          return (
            <button
              key={opt.mode}
              onClick={() => setSelectedMode(opt.mode)}
              className={`p-3 rounded-xl border text-left transition-all relative cursor-pointer ${
                isSelected
                  ? "bg-teal-50 dark:bg-teal-950/40 border-teal-500 ring-1 ring-teal-500/20 text-slate-900 dark:text-white shadow-xs"
                  : "bg-slate-50/70 dark:bg-white/[0.02] border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/15 text-slate-700 dark:text-zinc-300"
              }`}
            >
              {opt.is_recommended && (
                <span className="absolute -top-2 right-2 text-[9px] bg-teal-600 text-white font-bold px-2 py-0.5 rounded-full uppercase shadow-2xs">
                  Fastest
                </span>
              )}
              <div className="flex items-center gap-1.5 mb-1 text-xs capitalize font-semibold">
                {getModeIcon(opt.mode)}
                <span>{opt.mode}</span>
              </div>
              <div className="text-sm sm:text-base font-bold text-slate-900 dark:text-white font-mono">
                {opt.duration_text}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-zinc-400">
                {opt.distance_km} km ({opt.distance_miles} mi)
              </div>
            </button>
          );
        })}
      </div>

      {/* Route Waypoints Corridor */}
      {data.waypoints && data.waypoints.length > 0 && (
        <div className="p-3.5 bg-slate-50/80 dark:bg-black/30 rounded-xl border border-slate-200 dark:border-white/10 my-3">
          <div className="flex items-center justify-between mb-3 text-xs">
            <span className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
              Key Transit Corridors & Waypoints
            </span>
            {activeOption?.estimated_cost && (
              <span className="text-[11px] font-mono text-emerald-700 dark:text-emerald-400 font-semibold">
                Est: {activeOption.estimated_cost}
              </span>
            )}
          </div>

          <div className="relative pl-5 space-y-3 before:absolute before:left-2 before:top-1.5 before:bottom-1.5 before:w-0.5 before:bg-teal-500/30">
            {data.waypoints.map((wp, idx) => (
              <div key={idx} className="relative flex items-start justify-between gap-2 text-xs">
                <div className="absolute -left-5 top-1 w-2 h-2 rounded-full bg-teal-500 border border-white dark:border-[#1e1f20]" />
                <div>
                  <span className="font-bold text-slate-900 dark:text-white block">{wp.name}</span>
                  {wp.note && (
                    <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">{wp.note}</span>
                  )}
                </div>
                <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-mono shrink-0">
                  {wp.distance_from_start_km} km
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Turn-by-Turn Navigation Steps */}
      {data.steps && data.steps.length > 0 && (
        <div className="mt-2">
          <button
            onClick={() => setShowSteps(!showSteps)}
            className="w-full py-2 px-3 rounded-lg bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-xs font-semibold text-slate-700 dark:text-zinc-300 flex items-center justify-between transition-colors cursor-pointer border border-slate-200/80 dark:border-white/5"
          >
            <span className="flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-teal-600" />
              <span>Turn-by-turn Navigation Directions ({data.steps.length} Steps)</span>
            </span>
            {showSteps ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          </button>

          <AnimatePresence>
            {showSteps && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden mt-2 space-y-1.5 p-3 bg-slate-50/60 dark:bg-white/[0.01] rounded-xl border border-slate-200/80 dark:border-white/5 text-xs"
              >
                {data.steps.map((st) => (
                  <div
                    key={st.step_number}
                    className="flex items-start justify-between py-1.5 border-b border-slate-100 dark:border-white/5 last:border-0 gap-2"
                  >
                    <div className="flex items-start gap-2 min-w-0">
                      <span className="w-4 h-4 rounded-full bg-teal-600/10 text-teal-700 dark:text-teal-300 text-[10px] flex items-center justify-center font-bold shrink-0 mt-0.5">
                        {st.step_number}
                      </span>
                      <span className="text-slate-700 dark:text-zinc-200 leading-snug">
                        {st.instruction}
                      </span>
                    </div>
                    <span className="text-slate-400 font-mono text-[10px] shrink-0">
                      {st.distance} ({st.duration})
                    </span>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}
