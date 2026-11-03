"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sun,
  CloudRain,
  Cloud,
  CloudSun,
  Wind,
  Droplets,
  Eye,
  ShieldAlert,
  Thermometer,
  Sparkles,
} from "lucide-react";

interface ForecastDay {
  day: string;
  date: string;
  condition: string;
  high_temp_c: number;
  low_temp_c: number;
  high_temp_f: number;
  low_temp_f: number;
  precipitation_prob: number;
  icon: string;
}

interface WeatherData {
  city?: string;
  country?: string;
  condition?: string;
  temp_c?: number;
  temp_f?: number;
  feels_like_c?: number;
  feels_like_f?: number;
  humidity?: number;
  wind_speed_kmh?: number;
  air_quality_index?: number;
  air_quality_label?: string;
  uv_index?: number;
  summary?: string;
  forecast?: ForecastDay[];
}

interface WeatherCardProps {
  data?: WeatherData;
  status?: "inProgress" | "executing" | "complete";
}

export function WeatherCard({ data, status = "complete" }: WeatherCardProps) {
  const [unit, setUnit] = useState<"C" | "F">("C");

  if (status === "inProgress" || !data?.city) {
    return (
      <div className="w-full max-w-lg p-5 rounded-2xl glass-panel animate-pulse border border-slate-700/60 my-3">
        <div className="flex justify-between items-center mb-4">
          <div className="h-6 w-36 bg-slate-700 rounded-md" />
          <div className="h-6 w-16 bg-slate-700 rounded-full" />
        </div>
        <div className="flex items-center space-x-4 mb-4">
          <div className="h-16 w-16 rounded-full bg-slate-700" />
          <div className="space-y-2">
            <div className="h-8 w-24 bg-slate-700 rounded-md" />
            <div className="h-4 w-32 bg-slate-700 rounded-md" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div className="h-14 bg-slate-800 rounded-lg" />
          <div className="h-14 bg-slate-800 rounded-lg" />
          <div className="h-14 bg-slate-800 rounded-lg" />
        </div>
      </div>
    );
  }

  const temp = unit === "C" ? `${data.temp_c}°C` : `${data.temp_f}°F`;
  const feelsLike =
    unit === "C" ? `${data.feels_like_c}°C` : `${data.feels_like_f}°F`;

  const getWeatherIcon = (cond?: string) => {
    const c = cond?.toLowerCase() || "";
    if (c.includes("rain"))
      return <CloudRain className="w-10 h-10 text-cyan-400 animate-bounce" />;
    if (c.includes("cloud") && c.includes("partly"))
      return <CloudSun className="w-10 h-10 text-amber-300" />;
    if (c.includes("cloud") || c.includes("overcast"))
      return <Cloud className="w-10 h-10 text-slate-300" />;
    return <Sun className="w-10 h-10 text-yellow-400 animate-spin-slow" />;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="w-full max-w-xl my-4 rounded-2xl glass-panel-elevated p-6 border border-slate-700/60 shadow-2xl relative overflow-hidden text-slate-100"
    >
      {/* Background ambient lighting */}
      <div className="absolute -top-16 -right-16 w-44 h-44 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-44 h-44 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-700/50">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-bold tracking-tight text-white">
              {data.city}
            </h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300">
              {data.country}
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-800">
              <Sparkles className="w-3 h-3" /> Live GenUI
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">{data.summary}</p>
        </div>

        {/* Temperature unit toggle */}
        <div className="flex items-center bg-slate-900/80 p-0.5 rounded-lg border border-slate-700">
          <button
            onClick={() => setUnit("C")}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
              unit === "C"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            °C
          </button>
          <button
            onClick={() => setUnit("F")}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
              unit === "F"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            °F
          </button>
        </div>
      </div>

      {/* Main Temp & Condition */}
      <div className="flex items-center justify-between my-5">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700/60 shadow-inner">
            {getWeatherIcon(data.condition)}
          </div>
          <div>
            <div className="text-4xl font-extrabold tracking-tight text-white">
              {temp}
            </div>
            <div className="text-sm font-medium text-slate-300 flex items-center gap-1">
              <span>{data.condition}</span>
              <span className="text-slate-500">•</span>
              <span className="text-xs text-slate-400">Feels like {feelsLike}</span>
            </div>
          </div>
        </div>

        {/* Secondary metrics badge */}
        <div className="text-right">
          <div className="text-xs font-semibold text-emerald-400 bg-emerald-950/40 px-2.5 py-1 rounded-md border border-emerald-800/60 inline-flex items-center gap-1">
            <Eye className="w-3.5 h-3.5" /> {data.air_quality_label}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            UV Index: <span className="text-amber-400 font-semibold">{data.uv_index}</span> (Moderate)
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-3 gap-2.5 my-4">
        <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 flex items-center gap-2.5">
          <Droplets className="w-4 h-4 text-cyan-400" />
          <div>
            <div className="text-[11px] text-slate-400">Humidity</div>
            <div className="text-sm font-bold text-white">{data.humidity}%</div>
          </div>
        </div>
        <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 flex items-center gap-2.5">
          <Wind className="w-4 h-4 text-sky-400" />
          <div>
            <div className="text-[11px] text-slate-400">Wind</div>
            <div className="text-sm font-bold text-white">{data.wind_speed_kmh} km/h</div>
          </div>
        </div>
        <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 flex items-center gap-2.5">
          <Thermometer className="w-4 h-4 text-amber-400" />
          <div>
            <div className="text-[11px] text-slate-400">Air Quality</div>
            <div className="text-sm font-bold text-emerald-400">{data.air_quality_index} AQI</div>
          </div>
        </div>
      </div>

      {/* 5-Day Forecast Grid */}
      {data.forecast && data.forecast.length > 0 && (
        <div className="mt-4 pt-3 border-t border-slate-800">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
            5-Day Micro-Forecast
          </div>
          <div className="grid grid-cols-5 gap-2">
            {data.forecast.map((f, idx) => {
              const high = unit === "C" ? `${Math.round(f.high_temp_c)}°` : `${Math.round(f.high_temp_f)}°`;
              const low = unit === "C" ? `${Math.round(f.low_temp_c)}°` : `${Math.round(f.low_temp_f)}°`;
              return (
                <div
                  key={idx}
                  className="p-2.5 bg-slate-900/40 hover:bg-slate-800/60 transition-colors rounded-xl border border-slate-800/80 text-center flex flex-col items-center justify-between"
                >
                  <span className="text-xs font-semibold text-slate-300">{f.day}</span>
                  <div className="my-1.5">{getWeatherIcon(f.condition)}</div>
                  <div className="text-xs font-bold text-white">{high}</div>
                  <div className="text-[11px] text-slate-400">{low}</div>
                  {f.precipitation_prob > 0 && (
                    <span className="text-[10px] text-cyan-400 mt-1">
                      {f.precipitation_prob}%
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </motion.div>
  );
}

