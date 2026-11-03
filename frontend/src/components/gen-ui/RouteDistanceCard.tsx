"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
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
  Leaf,
  DollarSign
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
}

interface RouteDistanceProps {
  data?: RouteDistanceData;
  status?: "inProgress" | "executing" | "complete";
}

export function RouteDistanceCard({ data, status = "complete" }: RouteDistanceProps) {
  const [selectedMode, setSelectedMode] = useState<string>("driving");
  const [showSteps, setShowSteps] = useState(false);

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

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="w-full max-w-2xl my-4 rounded-2xl glass-panel-elevated p-6 border border-slate-700/60 shadow-2xl relative overflow-hidden text-slate-100"
    >
      {/* Background glow */}
      <div className="absolute top-0 right-1/4 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between pb-4 border-b border-slate-700/60 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <Navigation className="w-5 h-5 text-teal-400" />
              Route & Distance Explorer
            </h3>
            <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full bg-teal-950/80 text-teal-300 border border-teal-800 font-medium">
              <Sparkles className="w-3 h-3" /> GenUI Geo
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">{data.map_summary}</p>
        </div>

        {/* Origin / Dest pill */}
        <div className="flex items-center gap-1 text-xs bg-slate-900/90 px-3 py-1.5 rounded-xl border border-slate-700">
          <span className="text-teal-400 font-semibold">{data.origin}</span>
          <ChevronRight className="w-3 h-3 text-slate-500" />
          <span className="text-white font-semibold">{data.destination}</span>
        </div>
      </div>

      {/* Travel Modes Selector */}
      <div className="grid grid-cols-3 gap-2.5 my-4">
        {(data.options || []).map((opt) => {
          const isSelected = selectedMode === opt.mode;
          return (
            <button
              key={opt.mode}
              onClick={() => setSelectedMode(opt.mode)}
              className={`p-3 rounded-xl border text-left transition-all relative ${
                isSelected
                  ? "bg-teal-950/70 border-teal-500 text-white shadow-md"
                  : "bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-300"
              }`}
            >
              {opt.is_recommended && (
                <span className="absolute -top-2 right-2 text-[9px] bg-teal-500 text-slate-950 font-bold px-1.5 py-0.2 rounded-full uppercase">
                  Fastest
                </span>
              )}
              <div className="flex items-center gap-1.5 mb-1 text-xs capitalize font-semibold">
                {getModeIcon(opt.mode)}
                <span>{opt.mode}</span>
              </div>
              <div className="text-base font-bold text-white">{opt.duration_text}</div>
              <div className="text-[11px] text-slate-400">
                {opt.distance_miles} miles ({opt.distance_km} km)
              </div>
            </button>
          );
        })}
      </div>

      {/* Mode Details / Visual Progress Waypoints */}
      {activeOption && (
        <div className="p-4 bg-slate-900/70 rounded-xl border border-slate-800 my-4">
          <div className="flex justify-between items-center mb-4 text-xs">
            <span className="font-semibold text-slate-300">
              Waypoints & Elevation Route
            </span>
            <div className="flex items-center gap-3 text-slate-400 text-[11px]">
              {activeOption.estimated_cost && (
                <span className="flex items-center gap-1 text-white">
                  <DollarSign className="w-3 h-3 text-emerald-400" />
                  {activeOption.estimated_cost}
                </span>
              )}
              {activeOption.carbon_kg && (
                <span className="flex items-center gap-1 text-teal-300">
                  <Leaf className="w-3 h-3 text-teal-400" />
                  ~{activeOption.carbon_kg} kg CO₂
                </span>
              )}
            </div>
          </div>

          {/* Visual Route Track */}
          <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-gradient-to-b before:from-teal-400 before:via-sky-400 before:to-emerald-400">
            {(data.waypoints || []).map((wp, idx) => (
              <div key={idx} className="relative flex items-start gap-2.5 text-xs">
                <div className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-teal-400 border-2 border-slate-900" />
                <div className="flex-1">
                  <span className="font-bold text-white">{wp.name}</span>
                  {wp.note && (
                    <span className="text-[11px] text-slate-400 block">{wp.note}</span>
                  )}
                </div>
                <span className="text-[10px] text-slate-500 font-mono">
                  {wp.distance_from_start_km} km
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Turn-by-Turn Collapsible */}
      {data.steps && data.steps.length > 0 && (
        <div className="mt-3">
          <button
            onClick={() => setShowSteps(!showSteps)}
            className="w-full py-2 px-3 bg-slate-900/90 hover:bg-slate-800 text-xs font-semibold text-slate-300 rounded-lg border border-slate-800 flex items-center justify-between transition-colors"
          >
            <span>Turn-by-turn Navigation Steps ({data.steps.length})</span>
            <span className="text-teal-400">{showSteps ? "Hide ▲" : "Show ▼"}</span>
          </button>

          {showSteps && (
            <div className="mt-2 space-y-1.5 p-3 bg-slate-950/70 rounded-lg border border-slate-800 text-xs">
              {data.steps.map((st) => (
                <div
                  key={st.step_number}
                  className="flex items-start justify-between py-1 border-b border-slate-900 last:border-0"
                >
                  <div className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-slate-800 text-slate-400 text-[10px] flex items-center justify-center font-bold">
                      {st.step_number}
                    </span>
                    <span className="text-slate-300">{st.instruction}</span>
                  </div>
                  <span className="text-slate-500 text-[11px] shrink-0 ml-2">
                    {st.distance}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}

