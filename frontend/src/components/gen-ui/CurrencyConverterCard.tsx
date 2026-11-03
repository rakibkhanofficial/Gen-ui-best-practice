"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowUpDown,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Coins,
  Clock,
  Sparkles,
  Info
} from "lucide-react";

export interface CurrencyConversion {
  from_currency: string;
  from_amount: number;
  to_currency: string;
  to_amount: number;
  rate: number;
  inverse_rate: number;
  last_updated: string;
}

export interface CurrencyRate {
  code: string;
  name: string;
  flag_emoji: string;
  rate_to_usd: number;
  rate_from_usd: number;
  change_24h: number;
  trend: "up" | "down" | "neutral";
}

export interface CurrencyConverterData {
  conversion?: CurrencyConversion;
  popular_rates?: CurrencyRate[];
  historical_note?: string;
}

interface CurrencyConverterCardProps {
  data?: CurrencyConverterData;
}

export function CurrencyConverterCard({ data }: CurrencyConverterCardProps) {
  const initialConversion = data?.conversion || {
    from_currency: "USD",
    from_amount: 100,
    to_currency: "BDT",
    to_amount: 12150,
    rate: 121.5,
    inverse_rate: 0.00823,
    last_updated: "Nov 3, 2026 — 10:00 UTC",
  };

  const [fromCurrency, setFromCurrency] = useState(initialConversion.from_currency);
  const [toCurrency, setToCurrency] = useState(initialConversion.to_currency);
  const [amount, setAmount] = useState<number>(initialConversion.from_amount);
  const [rate, setRate] = useState<number>(initialConversion.rate);

  // Dynamic calculation based on current input and rate
  const calculatedAmount = (amount * rate).toFixed(2);
  const inverseRate = rate > 0 ? (1 / rate).toFixed(5) : "0";

  const handleSwap = () => {
    const nextFrom = toCurrency;
    const nextTo = fromCurrency;
    const nextRate = rate > 0 ? 1 / rate : 1;
    setFromCurrency(nextFrom);
    setToCurrency(nextTo);
    setRate(nextRate);
  };

  const popularRates = data?.popular_rates || [];
  const historicalNote =
    data?.historical_note ||
    "Exchange rates fluctuate continuously based on macroeconomic indicators, interest rates, and trade balances.";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="w-full rounded-2xl bg-white dark:bg-[#1e1f20] border border-slate-200 dark:border-white/10 shadow-lg overflow-hidden text-slate-800 dark:text-slate-100"
    >
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 text-white p-5">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-white/20 backdrop-blur-xs">
              <Coins className="w-4 h-4 text-white" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-100">
              Interactive Currency Exchange
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-100 bg-black/20 backdrop-blur-xs px-2.5 py-1 rounded-full">
            <Clock className="w-3 h-3" />
            <span>{initialConversion.last_updated}</span>
          </div>
        </div>

        {/* Big Conversion Display */}
        <div className="mt-3">
          <div className="text-xs text-emerald-200 font-medium mb-1">
            {amount} {fromCurrency} =
          </div>
          <div className="text-3xl sm:text-4xl font-bold tracking-tight text-white flex items-baseline gap-2">
            <span>{Number(calculatedAmount).toLocaleString()}</span>
            <span className="text-lg font-semibold text-emerald-200">{toCurrency}</span>
          </div>
          <div className="mt-2 text-xs text-emerald-100/90 flex flex-wrap items-center gap-3">
            <span>1 {fromCurrency} = {rate.toFixed(4)} {toCurrency}</span>
            <span className="text-white/40">&bull;</span>
            <span>1 {toCurrency} = {inverseRate} {fromCurrency}</span>
          </div>
        </div>
      </div>

      {/* Interactive Converter Section */}
      <div className="p-5 border-b border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-black/10">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Amount input */}
          <div className="w-full sm:flex-1">
            <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
              Amount
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                step="any"
                value={amount}
                onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#282a2c] border border-slate-200 dark:border-white/10 text-sm font-semibold text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-slate-400">
                {fromCurrency}
              </span>
            </div>
          </div>

          {/* Swap Button */}
          <button
            onClick={handleSwap}
            className="p-2.5 rounded-xl bg-white dark:bg-[#282a2c] border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:text-emerald-500 hover:border-emerald-500 shadow-xs transition-all active:scale-95 cursor-pointer mt-0 sm:mt-5"
            title="Swap currencies"
          >
            <ArrowUpDown className="w-4 h-4" />
          </button>

          {/* Converted Output Box */}
          <div className="w-full sm:flex-1">
            <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
              Converted Total
            </label>
            <div className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-black/30 border border-slate-200 dark:border-white/5 text-sm font-semibold text-emerald-600 dark:text-emerald-400 flex items-center justify-between">
              <span>{Number(calculatedAmount).toLocaleString()}</span>
              <span className="text-xs font-mono text-slate-500 dark:text-slate-400 font-bold">
                {toCurrency}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Popular Rates Grid */}
      {popularRates.length > 0 && (
        <div className="p-5">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>Popular Global Benchmarks</span>
              <span className="text-[10px] text-slate-400 font-normal">(vs USD)</span>
            </h4>
            <span className="text-[10px] text-slate-400">24h Change</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {popularRates.map((curr) => {
              const isUp = curr.trend === "up";
              const isDown = curr.trend === "down";

              return (
                <div
                  key={curr.code}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-[#282a2c]/60 border border-slate-200 dark:border-white/5 flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-base" role="img" aria-label={curr.name}>
                      {curr.flag_emoji}
                    </span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 font-mono">
                      {curr.code}
                    </span>
                  </div>

                  <div className="mt-2">
                    <div className="text-sm font-bold text-slate-900 dark:text-white">
                      {curr.rate_to_usd > 100
                        ? curr.rate_to_usd.toFixed(1)
                        : curr.rate_to_usd.toFixed(2)}
                    </div>
                    <div className="flex items-center gap-1 text-[10px] mt-0.5">
                      {isUp && <TrendingUp className="w-3 h-3 text-emerald-500" />}
                      {isDown && <TrendingDown className="w-3 h-3 text-rose-500" />}
                      <span
                        className={
                          isUp
                            ? "text-emerald-600 dark:text-emerald-400 font-semibold"
                            : isDown
                            ? "text-rose-600 dark:text-rose-400 font-semibold"
                            : "text-slate-400"
                        }
                      >
                        {curr.change_24h > 0 ? `+${curr.change_24h}%` : `${curr.change_24h}%`}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Historical Note */}
          <div className="mt-4 p-3 rounded-xl bg-slate-100/70 dark:bg-black/20 border border-slate-200 dark:border-white/5 flex items-start gap-2.5 text-xs text-slate-500 dark:text-slate-400">
            <Info className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
            <p className="leading-relaxed text-[11px]">{historicalNote}</p>
          </div>
        </div>
      )}
    </motion.div>
  );
}

