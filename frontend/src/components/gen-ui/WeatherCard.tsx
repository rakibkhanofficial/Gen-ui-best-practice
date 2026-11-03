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
  Thermometer,
  Sparkles,
  Compass
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
      <div className="w-full max-w-xl p-5 rounded-3xl bg-white dark:bg-[#1e1f20] animate-pulse border border-slate-200 dark:border-white/10 my-3">
        <div className="flex justify-between items-center mb-4">
          <div className="h-6 w-36 bg-slate-200 dark:bg-slate-700 rounded-md" />
          <div className="h-6 w-16 bg-slate-200 dark:bg-slate-700 rounded-full" />
        </div>
        <div className="flex items-center space-x-4 mb-4">
          <div className="h-16 w-16 rounded-2xl bg-slate-200 dark:bg-slate-700" />
          <div className="space-y-2">
            <div className="h-8 w-24 bg-slate-200 dark:bg-slate-700 rounded-md" />
            <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded-md" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div className="h-14 bg-slate-100 dark:bg-slate-800 rounded-xl" />
          <div className="h-14 bg-slate-100 dark:bg-slate-800 rounded-xl" />
          <div className="h-14 bg-slate-100 dark:bg-slate-800 rounded-xl" />
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
      return <CloudRain className="w-10 h-10 text-sky-500 animate-bounce" />;
    if (c.includes("cloud") && (c.includes("partly") || c.includes("sun")))
      return <CloudSun className="w-10 h-10 text-amber-500" />;
    if (c.includes("cloud") || c.includes("overcast"))
      return <Cloud className="w-10 h-10 text-slate-400" />;
    return <Sun className="w-10 h-10 text-amber-500 animate-spin-slow" />;
  };

  const getSmallIcon = (cond?: string) => {
    const c = cond?.toLowerCase() || "";
    if (c.includes("rain")) return <CloudRain className="w-4 h-4 text-sky-500" />;
    if (c.includes("cloud") && (c.includes("partly") || c.includes("sun")))
      return <CloudSun className="w-4 h-4 text-amber-500" />;
    if (c.includes("cloud") || c.includes("overcast"))
      return <Cloud className="w-4 h-4 text-slate-400" />;
    return <Sun className="w-4 h-4 text-amber-500" />;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="w-full max-w-xl my-4 rounded-3xl bg-white dark:bg-[#1e1f20] p-6 border border-slate-200/90 dark:border-white/10 shadow-xl shadow-blue-500/5 relative overflow-hidden text-slate-800 dark:text-slate-100"
    >
      {/* Background ambient lighting */}
      <div className="absolute -top-16 -right-16 w-44 h-44 bg-blue-500/10 dark:bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-44 h-44 bg-amber-500/10 dark:bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200/80 dark:border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              {data.city}
            </h3>
            {data.country && (
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 font-medium">
                {data.country}
              </span>
            )}
            <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-medium">
              <Sparkles className="w-3 h-3" /> Live Weather
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{data.summary}</p>
        </div>

        {/* Temperature unit toggle */}
        <div className="flex items-center bg-slate-100 dark:bg-white/10 p-0.5 rounded-xl border border-slate-200 dark:border-white/10">
          <button
            onClick={() => setUnit("C")}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              unit === "C"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            °C
          </button>
          <button
            onClick={() => setUnit("F")}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              unit === "F"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            °F
          </button>
        </div>
      </div>

      {/* Main Temp & Condition */}
      <div className="flex items-center justify-between my-5">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-blue-50/70 dark:bg-white/5 rounded-2xl border border-blue-100 dark:border-white/10 shadow-xs">
            {getWeatherIcon(data.condition)}
          </div>
          <div>
            <div className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {temp}
            </div>
            <div className="text-sm font-medium text-slate-600 dark:text-slate-300 flex items-center gap-1.5 mt-0.5">
              <span>{data.condition}</span>
              <span className="text-slate-300 dark:text-slate-600">&bull;</span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Feels like {feelsLike}
              </span>
            </div>
          </div>
        </div>

        {/* Secondary metrics badge */}
        <div className="text-right">
          <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800/60 inline-flex items-center gap-1">
            <Eye className="w-3.5 h-3.5" /> {data.air_quality_label}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5">
            UV Index: <span className="text-amber-600 dark:text-amber-400 font-semibold">{data.uv_index}</span> (Moderate)
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-3 gap-2.5 my-4">
        <div className="p-3 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-200/80 dark:border-white/5 flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-400">
            <Droplets className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">Humidity</div>
            <div className="text-sm font-bold text-slate-900 dark:text-white">
              {data.humidity}%
            </div>
          </div>
        </div>

        <div className="p-3 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-200/80 dark:border-white/5 flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
            <Wind className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">Wind Speed</div>
            <div className="text-sm font-bold text-slate-900 dark:text-white">
              {data.wind_speed_kmh} km/h
            </div>
          </div>
        </div>

        <div className="p-3 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-200/80 dark:border-white/5 flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">Air Quality</div>
            <div className="text-sm font-bold text-slate-900 dark:text-white">
              {data.air_quality_index} AQI
            </div>
          </div>
        </div>
      </div>

      {/* 5-Day Forecast Carousel / Grid */}
      {data.forecast && data.forecast.length > 0 && (
        <div className="mt-5 pt-4 border-t border-slate-200/80 dark:border-white/10">
          <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2.5">
            5-Day Atmospheric Forecast
          </div>
          <div className="grid grid-cols-5 gap-2">
            {data.forecast.map((fc, idx) => {
              const high = unit === "C" ? `${fc.high_temp_c}°` : `${fc.high_temp_f}°`;
              const low = unit === "C" ? `${fc.low_temp_c}°` : `${fc.low_temp_f}°`;

              return (
                <div
                  key={idx}
                  className="p-2.5 rounded-2xl bg-slate-50/80 dark:bg-white/5 border border-slate-200/70 dark:border-white/5 flex flex-col items-center justify-between text-center hover:bg-slate-100/80 dark:hover:bg-white/10 transition-colors"
                >
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {fc.day}
                  </span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 mb-1">
                    {fc.date}
                  </span>

                  <div className="my-1.5">{getSmallIcon(fc.condition)}</div>

                  <div className="text-xs font-bold text-slate-900 dark:text-white mt-1">
                    {high}
                  </div>
                  <div className="text-[10px] text-slate-400 dark:text-slate-500">
                    {low}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </motion.div>
  );
}
