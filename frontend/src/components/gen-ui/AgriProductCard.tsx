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
      className="w-full max-w-3xl my-3 rounded-2xl bg-white dark:bg-[#1e1f20] border border-slate-200 dark:border-white/10 shadow-sm text-slate-800 dark:text-slate-100 overflow-hidden"
    >
      {/* Header Banner */}
      <div className="p-5 border-b border-slate-200 dark:border-white/10 bg-gradient-to-r from-emerald-600/10 via-amber-500/5 to-transparent dark:from-emerald-950/30">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-emerald-600/30">
              <Sprout className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                  ACI Agribusiness Products & Solutions
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 uppercase">
                  Official Catalog
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-zinc-400 mt-0.5">
                Hybrid Seeds &bull; Crop Care & Protection &bull; Bio-Fertilizers &bull; ACI Motors Machinery
              </p>
            </div>
          </div>

          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-zinc-300 shrink-0">
            {products.length} Products
          </span>
        </div>

        {/* Seasonal Advisory */}
        {seasonal_advice && (
          <div className="mt-3.5 p-2.5 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-800/40 flex items-start gap-2 text-xs text-emerald-900 dark:text-emerald-200">
            <Leaf className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed text-[11px] font-medium">{seasonal_advice}</p>
          </div>
        )}
      </div>

      {/* Product Cards Grid */}
      <div className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
        {products.map((item) => {
          const isInquired = inquiredId === item.id;
          const isMachinery = item.category.toLowerCase().includes("machin");

          return (
            <motion.div
              key={item.id}
              whileHover={{ y: -2 }}
              className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02] hover:border-emerald-500/50 dark:hover:border-emerald-500/30 transition-all flex flex-col justify-between overflow-hidden shadow-2xs"
            >
              <div>
                {/* Product Image Header with Tag */}
                <div className="relative aspect-[16/9] w-full bg-slate-900 overflow-hidden">
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                  {/* Category Pill */}
                  <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-xs text-[10px] font-semibold text-white border border-white/15 flex items-center gap-1">
                    {isMachinery ? <Tractor className="w-3 h-3 text-amber-400" /> : <Leaf className="w-3 h-3 text-emerald-400" />}
                    <span>{item.category}</span>
                  </div>

                  {/* Pack Size Pill */}
                  <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md bg-emerald-600/90 text-white text-[10px] font-mono font-bold shadow-xs">
                    {item.pack_size}
                  </div>

                  {/* Price Tag in Bottom Image Banner */}
                  <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-white">
                    <span className="text-[11px] text-zinc-300 font-medium truncate">{item.manufacturer}</span>
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
                  <div className="flex flex-wrap gap-1">
                    {item.target_crops.map((crop, i) => (
                      <span
                        key={i}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-zinc-300 border border-slate-200/80 dark:border-white/5"
                      >
                        {crop}
                      </span>
                    ))}
                  </div>

                  {/* Key Benefits */}
                  <ul className="space-y-1 pt-1 text-[11px] text-slate-600 dark:text-zinc-400">
                    {item.key_benefits.slice(0, 2).map((benefit, i) => (
                      <li key={i} className="flex items-start gap-1.5 leading-tight">
                        <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Application Guideline */}
                  <div className="p-2 rounded-lg bg-slate-100 dark:bg-white/5 text-[10px] text-slate-600 dark:text-zinc-300 font-mono">
                    <span className="font-semibold text-slate-900 dark:text-white">Dosage: </span>
                    {item.application_rate}
                  </div>
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="p-3 bg-slate-100/60 dark:bg-white/[0.02] border-t border-slate-200/70 dark:border-white/5 flex items-center justify-between gap-2">
                <a
                  href={`tel:${item.dealer_contact.replace(/[^0-9+]/g, "") || "16500"}`}
                  className="flex items-center gap-1 text-[11px] text-slate-600 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                >
                  <Phone className="w-3 h-3 text-emerald-500" />
                  <span className="font-medium">Hotline 16500</span>
                </a>

                <div className="flex items-center gap-1.5">
                  <a
                    href={item.ecom_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-white/10 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-600 dark:text-zinc-300 text-xs transition-colors"
                    title="View on ACI Website"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  <button
                    onClick={() => handleInquire(item.id)}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer shadow-xs ${
                      isInquired
                        ? "bg-emerald-600 text-white"
                        : "bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-zinc-200"
                    }`}
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>{isInquired ? "Inquiry Sent!" : "Order / Buy"}</span>
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
