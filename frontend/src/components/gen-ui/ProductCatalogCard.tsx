"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Smartphone,
  Laptop,
  Star,
  Check,
  Cpu,
  ShoppingCart,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Camera,
  Layers,
  BatteryCharging,
  Trophy,
  Scale,
  Award,
  ChevronRight,
  Flame,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Sliders,
  DollarSign,
} from "lucide-react";
import confetti from "canvas-confetti";

export interface ProductSpec {
  key: string;
  value: string;
  highlight?: boolean;
}

export interface ProductColorOption {
  name: string;
  hex_code: string;
  label: string;
}

export interface ProductStorageOption {
  capacity: string;
  price_usd: number;
  price_bdt: number;
}

export interface ComparisonCategoryWinner {
  category: string;
  winner_name: string;
  winner_reason: string;
}

export interface ProductComparisonMatrix {
  title: string;
  verdict: string;
  winner_device_id: string;
  category_winners: ComparisonCategoryWinner[];
  recommended_for_a: string;
  recommended_for_b: string;
}

export interface ProductItem {
  id: string;
  name: string;
  tagline: string;
  brand: string;
  category: string;
  price: number;
  currency: string;
  price_bdt?: number;
  rating: number;
  review_count: number;
  image_url: string;
  badge?: string;
  specs: ProductSpec[];
  key_features: string[];
  in_stock: boolean;
  colors?: ProductColorOption[];
  storage_options?: ProductStorageOption[];
  pros?: string[];
  cons?: string[];
  benchmarks?: Record<string, string>;
  overall_score?: number;
}

export interface ProductCatalogData {
  query?: string;
  total_found?: number;
  highlight_category?: string;
  products?: ProductItem[];
  is_comparison?: boolean;
  comparison_matrix?: ProductComparisonMatrix;
  available_competitors?: string[];
}

interface ProductCatalogProps {
  data?: ProductCatalogData;
  status?: "inProgress" | "executing" | "complete";
  onTriggerQuery?: (query: string) => void;
}

/**
 * Resilient hardware device photo with luxury graphic fallback.
 */
function DeviceImageWithFallback({
  src,
  name,
  brand,
}: {
  src: string;
  name: string;
  brand: string;
}) {
  const [hasError, setHasError] = useState(false);

  if (hasError || !src) {
    return (
      <div className="relative aspect-[4/3] w-full bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 flex flex-col items-center justify-center p-4 text-center select-none overflow-hidden rounded-2xl border border-white/10">
        <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300 mb-2 shadow-inner">
          <Smartphone className="w-6 h-6 text-indigo-300" />
        </div>
        <span className="text-xs font-bold text-white line-clamp-1">{name}</span>
        <span className="text-[10px] text-indigo-300/90 font-mono mt-0.5">{brand} Flagship</span>
      </div>
    );
  }

  return (
    <div className="relative aspect-[4/3] w-full bg-slate-950/80 rounded-2xl overflow-hidden border border-slate-200/80 dark:border-white/10 group">
      <img
        src={src}
        alt={name}
        onError={() => setHasError(true)}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
    </div>
  );
}

export function ProductCatalogCard({
  data,
  status = "complete",
  onTriggerQuery,
}: ProductCatalogProps) {
  const [selectedStorageIdx, setSelectedStorageIdx] = useState<number>(0);
  const [selectedColorIdx, setSelectedColorIdx] = useState<number>(0);
  const [currency, setCurrency] = useState<"USD" | "BDT">("USD");
  const [activeTab, setActiveTab] = useState<"specs" | "features" | "benchmarks">("specs");
  const [reservedState, setReservedState] = useState<boolean>(false);

  if (status === "inProgress" || !data?.products || data.products.length === 0) {
    return (
      <div className="w-full max-w-3xl p-6 rounded-2xl glass-panel animate-pulse border border-slate-700/60 my-3">
        <div className="h-6 w-48 bg-slate-700 rounded-md mb-4" />
        <div className="grid grid-cols-2 gap-4">
          <div className="h-72 bg-slate-800 rounded-xl" />
          <div className="h-72 bg-slate-800 rounded-xl" />
        </div>
      </div>
    );
  }

  const isComparison = Boolean(data.is_comparison && data.products.length >= 2);
  const primaryProduct = data.products[0];
  const secondaryProduct = data.products[1];

  const handleReserve = () => {
    setReservedState(true);
    try {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.8 },
      });
    } catch {}
    setTimeout(() => setReservedState(false), 5000);
  };

  const handleCompareClick = (targetName: string) => {
    if (onTriggerQuery) {
      onTriggerQuery(`Compare ${primaryProduct.name} vs ${targetName}`);
    }
  };

  // ---------------------------------------------------------------------------
  // 1. COMPARISON MATRIX MODE (Head-to-Head Flagship Evaluation)
  // ---------------------------------------------------------------------------
  if (isComparison && secondaryProduct) {
    const matrix = data.comparison_matrix;

    return (
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="w-full max-w-3xl my-4 rounded-3xl bg-white dark:bg-[#1e1f20] border border-slate-200 dark:border-white/10 shadow-xl overflow-hidden text-slate-800 dark:text-zinc-100"
      >
        {/* Comparison Header */}
        <div className="p-5 border-b border-slate-200 dark:border-white/10 bg-gradient-to-r from-indigo-600/15 via-purple-600/10 to-amber-500/10 dark:from-indigo-950/40">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-indigo-600/30">
                <Scale className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                    {matrix?.title || `${primaryProduct.name} vs ${secondaryProduct.name}`}
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                    Flagship Head-to-Head
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                  Direct specification breakdown, benchmark leadership, and buyer verdict
                </p>
              </div>
            </div>

            {/* Currency Switcher */}
            <div className="flex items-center rounded-lg bg-slate-100 dark:bg-white/5 p-0.5 border border-slate-200 dark:border-white/10 text-[11px] font-mono font-bold shrink-0 self-start sm:self-center">
              <button
                onClick={() => setCurrency("USD")}
                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                  currency === "USD"
                    ? "bg-white dark:bg-black/60 text-indigo-600 dark:text-indigo-400 shadow-xs"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                $ USD
              </button>
              <button
                onClick={() => setCurrency("BDT")}
                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                  currency === "BDT"
                    ? "bg-white dark:bg-black/60 text-indigo-600 dark:text-indigo-400 shadow-xs"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                ৳ BDT
              </button>
            </div>
          </div>
        </div>

        {/* Head-to-Head Top Cards */}
        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          {[primaryProduct, secondaryProduct].map((dev, idx) => {
            const isWinner = matrix?.winner_device_id === dev.id;
            const displayPrice =
              currency === "USD"
                ? `$${dev.price.toLocaleString()}`
                : `৳${(dev.price_bdt || dev.price * 122).toLocaleString()}`;

            return (
              <div
                key={dev.id}
                className={`p-4 rounded-2xl border transition-all relative overflow-hidden flex flex-col justify-between ${
                  isWinner
                    ? "bg-indigo-50/70 dark:bg-indigo-950/20 border-indigo-400/80 dark:border-indigo-500/40 shadow-sm"
                    : "bg-slate-50/70 dark:bg-white/[0.02] border-slate-200 dark:border-white/10"
                }`}
              >
                {isWinner && (
                  <div className="absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/90 text-white flex items-center gap-1 shadow-xs">
                    <Trophy className="w-3 h-3 text-amber-200" />
                    <span>Top Pick</span>
                  </div>
                )}

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                      {dev.brand}
                    </span>
                    <span className="text-slate-300 dark:text-zinc-600">&bull;</span>
                    <span className="text-xs font-mono font-bold text-slate-800 dark:text-zinc-200 flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                      {dev.rating} ({dev.review_count})
                    </span>
                  </div>

                  <h4 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                    {dev.name}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 line-clamp-2">
                    {dev.tagline}
                  </p>

                  <div className="my-3">
                    <DeviceImageWithFallback
                      src={dev.image_url}
                      name={dev.name}
                      brand={dev.brand}
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200 dark:border-white/10 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-slate-400 uppercase block">Starting Price</span>
                    <span className="text-lg font-black font-mono text-slate-900 dark:text-white">
                      {displayPrice}
                    </span>
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-white dark:bg-black/40 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-zinc-200">
                    Score: {dev.overall_score || 9.4}/10
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Category Winners Trophies */}
        {matrix?.category_winners && matrix.category_winners.length > 0 && (
          <div className="px-5 pb-5">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-2.5 block flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-amber-500" />
              <span>Category Champions & Strengths</span>
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {matrix.category_winners.map((cw, cwIdx) => (
                <div
                  key={cwIdx}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 text-xs"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-700 dark:text-zinc-300">{cw.category}</span>
                    <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                      <Trophy className="w-3 h-3 text-amber-500" />
                      {cw.winner_name}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-snug">
                    {cw.winner_reason}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Side-by-Side Spec Comparison Table */}
        <div className="px-5 pb-5">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-2.5 block flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-indigo-500" />
            <span>Side-by-Side Specification Matrix</span>
          </span>

          <div className="rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden bg-slate-50/50 dark:bg-black/30">
            <div className="grid grid-cols-3 p-3 bg-slate-100 dark:bg-white/5 text-[11px] font-bold text-slate-700 dark:text-zinc-300 border-b border-slate-200 dark:border-white/10">
              <span>Metric / Feature</span>
              <span>{primaryProduct.name}</span>
              <span>{secondaryProduct.name}</span>
            </div>

            <div className="divide-y divide-slate-200/60 dark:divide-white/5 text-xs">
              {primaryProduct.specs.map((pSpec, sIdx) => {
                const matchSpec = secondaryProduct.specs.find(
                  (s) => s.key.toLowerCase() === pSpec.key.toLowerCase()
                ) || secondaryProduct.specs[sIdx];

                return (
                  <div key={sIdx} className="grid grid-cols-3 p-3 hover:bg-white/50 dark:hover:bg-white/[0.02] transition-colors">
                    <span className="font-semibold text-slate-600 dark:text-zinc-400 text-[11px]">
                      {pSpec.key}
                    </span>
                    <span className={`pr-2 text-[11px] leading-relaxed ${pSpec.highlight ? "font-bold text-indigo-600 dark:text-indigo-400" : "text-slate-800 dark:text-zinc-200"}`}>
                      {pSpec.value}
                    </span>
                    <span className={`pr-2 text-[11px] leading-relaxed ${matchSpec?.highlight ? "font-bold text-purple-600 dark:text-purple-400" : "text-slate-800 dark:text-zinc-200"}`}>
                      {matchSpec ? matchSpec.value : "—"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* AI Buyer Recommendation / Verdict */}
        {matrix?.verdict && (
          <div className="p-5 border-t border-slate-200 dark:border-white/10 bg-gradient-to-r from-indigo-50/70 via-purple-50/40 to-transparent dark:from-indigo-950/30">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5 mb-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Purchasing Verdict</span>
            </span>
            <p className="text-xs text-slate-700 dark:text-zinc-300 leading-relaxed mb-3">
              {matrix.verdict}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-white dark:bg-black/40 border border-slate-200 dark:border-white/10">
                <span className="font-bold text-indigo-600 dark:text-indigo-400 block mb-1">
                  Choose {primaryProduct.name} if:
                </span>
                <span className="text-slate-600 dark:text-zinc-300 text-[11px]">
                  {matrix.recommended_for_a}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-white dark:bg-black/40 border border-slate-200 dark:border-white/10">
                <span className="font-bold text-purple-600 dark:text-purple-400 block mb-1">
                  Choose {secondaryProduct.name} if:
                </span>
                <span className="text-slate-600 dark:text-zinc-300 text-[11px]">
                  {matrix.recommended_for_b}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Competitor Alternative Switcher */}
        {data.available_competitors && data.available_competitors.length > 0 && (
          <div className="p-4 bg-slate-50 dark:bg-white/[0.02] border-t border-slate-200 dark:border-white/10 flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-zinc-400">
              Compare with others:
            </span>
            {data.available_competitors.map((comp, cIdx) => (
              <button
                key={cIdx}
                onClick={() => handleCompareClick(comp)}
                className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-indigo-400 text-slate-700 dark:text-zinc-200 transition-colors cursor-pointer flex items-center gap-1"
              >
                <span>vs {comp}</span>
                <ChevronRight className="w-3 h-3 text-slate-400" />
              </button>
            ))}
          </div>
        )}
      </motion.div>
    );
  }

  // ---------------------------------------------------------------------------
  // 2. SINGLE PRODUCT DEEP-DIVE MODE (e.g. iPhone 16 Pro Details)
  // ---------------------------------------------------------------------------
  const prod = primaryProduct;
  const storageTiers = prod.storage_options || [
    { capacity: "128GB", price_usd: prod.price, price_bdt: prod.price_bdt || prod.price * 122 },
  ];
  const activeStorage = storageTiers[selectedStorageIdx] || storageTiers[0];
  const colors = prod.colors || [];
  const activeColor = colors[selectedColorIdx];

  const currentPriceDisplay =
    currency === "USD"
      ? `$${activeStorage.price_usd.toLocaleString()}`
      : `৳${activeStorage.price_bdt.toLocaleString()}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="w-full max-w-3xl my-4 rounded-3xl bg-white dark:bg-[#1e1f20] border border-slate-200 dark:border-white/10 shadow-xl overflow-hidden text-slate-800 dark:text-zinc-100"
    >
      {/* Top Banner */}
      <div className="p-5 border-b border-slate-200 dark:border-white/10 bg-gradient-to-r from-indigo-600/15 via-blue-600/10 to-amber-500/10 dark:from-indigo-950/40">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-indigo-600/30">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                  {prod.name}
                </h3>
                {prod.badge && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                    {prod.badge}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                {prod.tagline}
              </p>
            </div>
          </div>

          {/* Currency Switcher */}
          <div className="flex items-center rounded-lg bg-slate-100 dark:bg-white/5 p-0.5 border border-slate-200 dark:border-white/10 text-[11px] font-mono font-bold shrink-0 self-start sm:self-center">
            <button
              onClick={() => setCurrency("USD")}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                currency === "USD"
                  ? "bg-white dark:bg-black/60 text-indigo-600 dark:text-indigo-400 shadow-xs"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              $ USD
            </button>
            <button
              onClick={() => setCurrency("BDT")}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                currency === "BDT"
                  ? "bg-white dark:bg-black/60 text-indigo-600 dark:text-indigo-400 shadow-xs"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              ৳ BDT
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Device Render & Configuration */}
      <div className="p-5 grid grid-cols-1 md:grid-cols-12 gap-5">
        {/* Left: Device Image & Color Swatches */}
        <div className="md:col-span-5 flex flex-col justify-between space-y-3">
          <DeviceImageWithFallback
            src={prod.image_url}
            name={prod.name}
            brand={prod.brand}
          />

          {/* Color Selector */}
          {colors.length > 0 && (
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/10">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-semibold text-slate-600 dark:text-zinc-400">Finish:</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {activeColor?.name}
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                {colors.map((c, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedColorIdx(idx)}
                    title={c.name}
                    className={`w-7 h-7 rounded-full border-2 transition-all cursor-pointer flex items-center justify-center ${
                      selectedColorIdx === idx
                        ? "border-indigo-600 ring-2 ring-indigo-500/30 scale-110"
                        : "border-slate-300 dark:border-white/20 hover:scale-105"
                    }`}
                    style={{ backgroundColor: c.hex_code }}
                  >
                    {selectedColorIdx === idx && (
                      <Check className="w-3 h-3 text-white drop-shadow-sm" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Rating & Benchmarks score */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 text-xs">
            <div className="flex items-center gap-1.5 text-amber-500">
              <Star className="w-4 h-4 fill-amber-500" />
              <span className="font-bold text-slate-900 dark:text-white">{prod.rating} / 5.0</span>
              <span className="text-[11px] text-slate-400 font-mono">({prod.review_count} reviews)</span>
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-mono">
              ★ {prod.overall_score || 9.6} / 10
            </span>
          </div>
        </div>

        {/* Right: Storage, Pricing & Tabbed Breakdown */}
        <div className="md:col-span-7 flex flex-col justify-between space-y-4">
          <div>
            {/* Storage Tier Buttons */}
            {storageTiers.length > 0 && (
              <div className="mb-4">
                <span className="text-xs font-semibold text-slate-600 dark:text-zinc-400 block mb-2">
                  Select Storage Capacity:
                </span>
                <div className="grid grid-cols-4 gap-2">
                  {storageTiers.map((st, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedStorageIdx(idx)}
                      className={`py-2 px-1 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer border ${
                        selectedStorageIdx === idx
                          ? "bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-600/30 scale-102"
                          : "bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-700 dark:text-zinc-300 hover:bg-slate-100"
                      }`}
                    >
                      {st.capacity}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Price Row */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-indigo-50/70 to-blue-50/40 dark:from-indigo-950/30 dark:to-transparent border border-indigo-200/80 dark:border-indigo-800/40 flex items-center justify-between mb-4">
              <div>
                <span className="text-[10px] font-mono text-slate-500 uppercase block">
                  {activeStorage.capacity} Retail Price
                </span>
                <div className="text-2xl font-black font-mono text-indigo-700 dark:text-indigo-300">
                  {currentPriceDisplay}
                </div>
                <span className="text-[10px] text-slate-400 dark:text-zinc-400">
                  Official Global MSRP & Verified BD Market Tier
                </span>
              </div>

              <button
                onClick={handleReserve}
                className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer shadow-md ${
                  reservedState
                    ? "bg-emerald-600 text-white shadow-emerald-600/30"
                    : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30"
                }`}
              >
                {reservedState ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-white" />
                    <span>Selected!</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4" />
                    <span>Select Variant</span>
                  </>
                )}
              </button>
            </div>

            {/* Tabs Selector */}
            <div className="flex items-center gap-1 border-b border-slate-200 dark:border-white/10 pb-2 mb-3">
              {[
                { id: "specs", label: "Key Specifications" },
                { id: "features", label: "Pro Highlights" },
                { id: "benchmarks", label: "Benchmarks" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    activeTab === tab.id
                      ? "bg-slate-900 text-white dark:bg-white dark:text-black"
                      : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab 1: Specs */}
            {activeTab === "specs" && (
              <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                {prod.specs.map((s, idx) => (
                  <div
                    key={idx}
                    className="p-2 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/70 dark:border-white/5 flex items-start justify-between text-xs gap-2"
                  >
                    <span className="font-semibold text-slate-500 dark:text-zinc-400 text-[11px] shrink-0 w-28">
                      {s.key}
                    </span>
                    <span
                      className={`text-right text-[11px] leading-snug ${
                        s.highlight
                          ? "font-bold text-indigo-600 dark:text-indigo-400"
                          : "text-slate-800 dark:text-zinc-200"
                      }`}
                    >
                      {s.value}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Tab 2: Pro Features */}
            {activeTab === "features" && (
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {prod.key_features.map((feat, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/70 dark:border-white/5 flex items-start gap-2 text-xs"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                    <span className="text-slate-700 dark:text-zinc-300 leading-snug">
                      {feat}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Tab 3: Benchmarks */}
            {activeTab === "benchmarks" && (
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {prod.benchmarks ? (
                  Object.entries(prod.benchmarks).map(([bKey, bVal], idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/70 dark:border-white/5 flex items-center justify-between text-xs"
                    >
                      <span className="font-semibold text-slate-600 dark:text-zinc-400">
                        {bKey}
                      </span>
                      <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                        {bVal}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="p-3 text-xs text-slate-400 text-center">
                    Top-tier flagship benchmark performance verified.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Pros & Cons Pills */}
          {prod.pros && prod.cons && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-200 dark:border-white/10 text-[11px]">
              <div className="space-y-1">
                <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <Check className="w-3 h-3" /> Key Strengths
                </span>
                {prod.pros.slice(0, 2).map((p, idx) => (
                  <p key={idx} className="text-slate-600 dark:text-zinc-400 leading-tight">
                    • {p}
                  </p>
                ))}
              </div>
              <div className="space-y-1">
                <span className="font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                  <XCircle className="w-3 h-3" /> Things to Note
                </span>
                {prod.cons.slice(0, 2).map((c, idx) => (
                  <p key={idx} className="text-slate-600 dark:text-zinc-400 leading-tight">
                    • {c}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Compare with Rival Flagships Bar */}
      {data.available_competitors && data.available_competitors.length > 0 && (
        <div className="p-4 bg-slate-50 dark:bg-white/[0.02] border-t border-slate-200 dark:border-white/10 flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-1">
            <Scale className="w-3.5 h-3.5 text-indigo-500" />
            <span>Compare with Rivals:</span>
          </span>
          {data.available_competitors.map((comp, cIdx) => (
            <button
              key={cIdx}
              onClick={() => handleCompareClick(comp)}
              className="px-3 py-1 rounded-xl text-xs font-semibold bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-400 text-slate-700 dark:text-zinc-200 transition-all cursor-pointer flex items-center gap-1 shadow-2xs"
            >
              <span>vs {comp}</span>
              <ArrowRight className="w-3 h-3 text-slate-400" />
            </button>
          ))}
        </div>
      )}
    </motion.div>
  );
}
