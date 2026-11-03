"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Sprout,
  CheckCircle2,
  Phone,
  ExternalLink,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Tractor,
  Layers,
  Leaf,
  Info,
  Package,
} from "lucide-react";

export interface AgriProductItem {
  id: string;
  name: string;
  category: string;
  manufacturer: string;
  image_url: string;
  pack_size: string;
  price_bdt: number;
  target_crops: string[];
  active_ingredient?: string;
  key_benefits: string[];
  application_rate: string;
  in_stock: boolean;
  ecom_link: string;
  dealer_contact: string;
}

export interface AgriProductSearchData {
  query: string;
  category: string;
  total_results: number;
  products: AgriProductItem[];
  seasonal_advice?: string;
}

interface AgriProductCardProps {
  data?: AgriProductSearchData;
}

/**
 * Resilient Product Image with SVG Illustration Fallback.
 * Guarantees zero broken image icons on CDN delays.
 */
function AgriImageWithFallback({
  src,
  name,
  category,
}: {
  src: string;
  name: string;
  category: string;
}) {
  const [hasError, setHasError] = useState(false);
  const isMachinery = category.toLowerCase().includes("machin") || category.toLowerCase().includes("tractor");
  const isFertilizer = category.toLowerCase().includes("fertiliz") || category.toLowerCase().includes("bonemil");

  if (hasError || !src) {
    return (
      <div className="relative aspect-[16/9] w-full bg-gradient-to-br from-emerald-900 via-slate-900 to-teal-950 flex flex-col items-center justify-center p-4 text-center select-none overflow-hidden">
        <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300 mb-2 shadow-inner">
          {isMachinery ? (
            <Tractor className="w-6 h-6 text-amber-300" />
          ) : isFertilizer ? (
            <Package className="w-6 h-6 text-emerald-300" />
          ) : (
            <Sprout className="w-6 h-6 text-emerald-300" />
          )}
        </div>
        <span className="text-xs font-bold text-white line-clamp-1">{name}</span>
        <span className="text-[10px] text-emerald-400/90 font-mono mt-0.5">{category}</span>
      </div>
    );
  }

  return (
    <div className="relative aspect-[16/9] w-full bg-slate-950 overflow-hidden">
      <img
        src={src}
        alt={name}
        onError={() => setHasError(true)}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
    </div>
  );
}

export function AgriProductCard({ data }: AgriProductCardProps) {
  const [inquiredId, setInquiredId] = useState<string | null>(null);

  if (!data?.products || data.products.length === 0) {
    return (
      <div className="w-full max-w-3xl p-5 rounded-2xl bg-white dark:bg-[#1e1f20] border border-slate-200 dark:border-white/10 text-slate-500 text-xs">
        No agricultural products found.
      </div>
    );
  }

  const { query, category, products, seasonal_advice } = data;

  const handleInquire = (id: string) => {
    setInquiredId(id);
    setTimeout(() => setInquiredId(null), 3000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-3xl my-3 rounded-2xl bg-white dark:bg-[#1e1f20] border border-slate-200 dark:border-white/10 shadow-md text-slate-800 dark:text-slate-100 overflow-hidden"
    >
      {/* Header Banner */}
      <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-white/10 bg-gradient-to-r from-emerald-600/10 via-amber-500/5 to-transparent dark:from-emerald-950/30">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-emerald-600/30">
              <Sprout className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                  ACI Agribusiness & Aronno Store
                </h3>
                <a
                  href="https://aciaronno.com/collections/all"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 uppercase flex items-center gap-1 hover:underline"
                >
                  <span>aciaronno.com</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>
              <p className="text-xs text-slate-600 dark:text-zinc-400 mt-0.5">
                Plant Growth Regulators &bull; Crop Care & Pesticides &bull; Bio-Fertilizers &bull; High Yield Seeds &bull; ACI Motors
              </p>
            </div>
          </div>

          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 shrink-0 self-start sm:self-center">
            {products.length} Official Products
          </span>
        </div>

        {/* Seasonal Advisory Banner */}
        {seasonal_advice && (
          <div className="mt-3.5 p-3 rounded-xl bg-emerald-50/90 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-800/40 flex items-start gap-2.5 text-xs text-emerald-900 dark:text-emerald-200">
            <Leaf className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed text-[11px] font-medium">{seasonal_advice}</p>
          </div>
        )}
      </div>

      {/* Product Cards Grid */}
      <div className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
        {products.map((item) => {
          const isInquired = inquiredId === item.id;
          const isMachinery = item.category.toLowerCase().includes("machin") || item.category.toLowerCase().includes("tractor");

          return (
            <motion.div
              key={item.id}
              whileHover={{ y: -2 }}
              className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/60 dark:bg-white/[0.02] hover:border-emerald-500/50 dark:hover:border-emerald-500/30 transition-all flex flex-col justify-between overflow-hidden shadow-2xs group"
            >
              <div>
                {/* Product Image Header with Tag */}
                <div className="relative">
                  <AgriImageWithFallback
                    src={item.image_url}
                    name={item.name}
                    category={item.category}
                  />

                  {/* Category Pill */}
                  <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-black/75 backdrop-blur-xs text-[10px] font-semibold text-white border border-white/15 flex items-center gap-1">
                    {isMachinery ? (
                      <Tractor className="w-3 h-3 text-amber-400" />
                    ) : (
                      <Leaf className="w-3 h-3 text-emerald-400" />
                    )}
                    <span>{item.category}</span>
                  </div>

                  {/* Pack Size Pill */}
                  <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md bg-emerald-600/90 text-white text-[10px] font-mono font-bold shadow-xs">
                    {item.pack_size}
                  </div>

                  {/* Price Tag in Bottom Image Banner */}
                  <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-white">
                    <span className="text-[11px] text-zinc-300 font-medium truncate">
                      {item.manufacturer}
                    </span>
                    <span className="text-base font-bold font-mono text-emerald-400">
                      ৳{item.price_bdt.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Details Section */}
                <div className="p-3.5 space-y-2.5">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-snug line-clamp-1">
                    {item.name}
                  </h4>

                  {item.active_ingredient && (
                    <div className="text-[11px] text-slate-500 dark:text-zinc-400 font-mono line-clamp-1">
                      Formula: {item.active_ingredient}
                    </div>
                  )}

                  {/* Target Crops */}
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold mb-1">
                      Target Crops & Scope:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {item.target_crops.slice(0, 4).map((crop, cIdx) => (
                        <span
                          key={cIdx}
                          className="text-[10px] px-1.5 py-0.2 rounded bg-slate-200/80 dark:bg-white/10 text-slate-700 dark:text-zinc-300 font-medium"
                        >
                          {crop}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Key Benefits */}
                  <ul className="text-xs text-slate-600 dark:text-zinc-300 space-y-1 pt-1">
                    {item.key_benefits.slice(0, 2).map((benefit, bIdx) => (
                      <li key={bIdx} className="flex items-start gap-1.5 text-[11px] leading-tight">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Application Dosage */}
                  <div className="p-2 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-800/30 text-[11px] text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="line-clamp-1">{item.application_rate}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-3 bg-slate-100/60 dark:bg-white/[0.01] border-t border-slate-200/80 dark:border-white/5 flex items-center justify-between gap-2">
                <a
                  href={item.ecom_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors cursor-pointer shadow-xs"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Buy on Aronno</span>
                  <ExternalLink className="w-3 h-3 ml-0.5 opacity-80" />
                </a>

                <button
                  onClick={() => handleInquire(item.id)}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors cursor-pointer shrink-0 ${
                    isInquired
                      ? "bg-emerald-100 dark:bg-emerald-950 border-emerald-400 text-emerald-800 dark:text-emerald-200"
                      : "border-slate-300 dark:border-white/10 hover:bg-slate-200/80 dark:hover:bg-white/10 text-slate-700 dark:text-zinc-200"
                  }`}
                  title={item.dealer_contact}
                >
                  {isInquired ? (
                    <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
                      <CheckCircle2 className="w-3 h-3" /> Dealer: 16500
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <Phone className="w-3 h-3 text-slate-400" />
                      <span>Contact</span>
                    </span>
                  )}
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
