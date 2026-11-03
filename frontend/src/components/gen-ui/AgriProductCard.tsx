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
 * Clean, bright product image with smart local fallback.
 * Strictly avoids gloomy overlays or darkened AI-sloppy gradients.
 */
function ProductImage({
  src,
  name,
}: {
  src: string;
  name: string;
}) {
  const [hasError, setHasError] = useState(false);

  // Map product name to local verified image
  const nLower = name.toLowerCase();
  const fallbackLocal = nLower.includes("flora")
    ? "/images/agri/flora.jpg"
    : nLower.includes("mix")
    ? "/images/agri/acmix.jpg"
    : nLower.includes("acamite")
    ? "/images/agri/acamite.jpg"
    : nLower.includes("bonemil")
    ? "/images/agri/bonemil.jpg"
    : nLower.includes("trico")
    ? "/images/agri/trico.jpg"
    : nLower.includes("bioferti")
    ? "/images/agri/bioferti.jpg"
    : nLower.includes("aimcozim")
    ? "/images/agri/aimcozim.jpg"
    : "/images/agri/mustard.jpg";

  const activeSrc = hasError || !src ? fallbackLocal : src;

  return (
    <div className="relative h-44 w-full bg-slate-50 dark:bg-white/[0.02] rounded-xl flex items-center justify-center p-3 overflow-hidden border border-slate-100 dark:border-white/5 group">
      <img
        src={activeSrc}
        alt={name}
        onError={() => setHasError(true)}
        className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
        loading="lazy"
      />
    </div>
  );
}

export function AgriProductCard({ data }: AgriProductCardProps) {
  const [copiedContact, setCopiedContact] = useState<string | null>(null);

  if (!data?.products || data.products.length === 0) {
    return (
      <div className="w-full max-w-3xl p-5 rounded-2xl bg-white dark:bg-[#1e1f20] border border-slate-200 dark:border-white/10 text-slate-500 text-xs">
        No agricultural products found.
      </div>
    );
  }

  const { products, seasonal_advice } = data;

  const handleContact = (id: string) => {
    setCopiedContact(id);
    setTimeout(() => setCopiedContact(null), 3000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-3xl my-3 rounded-2xl bg-white dark:bg-[#1e1f20] border border-slate-200/90 dark:border-white/10 shadow-md text-slate-800 dark:text-slate-100 overflow-hidden"
    >
      {/* Clean Header */}
      <div className="p-4 sm:p-5 border-b border-slate-200/80 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
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
                  className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 uppercase flex items-center gap-1 hover:underline"
                >
                  <span>aciaronno.com</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                Authentic Crop Care, Plant Growth Regulators & Bio-Fertilizers
              </p>
            </div>
          </div>

          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 shrink-0 self-start sm:self-center">
            {products.length} Products Available
          </span>
        </div>

        {/* Seasonal Advisory Banner */}
        {seasonal_advice && (
          <div className="mt-3.5 p-3 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/20 border border-emerald-200/70 dark:border-emerald-800/40 flex items-start gap-2.5 text-xs text-emerald-900 dark:text-emerald-200">
            <Leaf className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed text-[11px] font-medium">{seasonal_advice}</p>
          </div>
        )}
      </div>

      {/* Product Cards Grid - Clean & Modern */}
      <div className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
        {products.map((item) => {
          const isCopied = copiedContact === item.id;

          return (
            <div
              key={item.id}
              className="rounded-xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-white/[0.02] hover:border-emerald-400/80 dark:hover:border-emerald-500/30 transition-all flex flex-col justify-between p-3.5 shadow-2xs"
            >
              <div>
                {/* Product Image Slot */}
                <div className="relative">
                  <ProductImage src={item.image_url} name={item.name} />

                  {/* Category Pill */}
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-white/95 dark:bg-black/85 backdrop-blur-xs text-[10px] font-semibold text-slate-700 dark:text-zinc-200 border border-slate-200/80 dark:border-white/10 shadow-2xs">
                    {item.category}
                  </div>

                  {/* Pack Size Pill */}
                  <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-emerald-600 text-white text-[10px] font-mono font-bold shadow-xs">
                    {item.pack_size}
                  </div>
                </div>

                {/* Details Section */}
                <div className="mt-3 space-y-2">
                  <span className="text-[10px] font-medium text-slate-400 dark:text-zinc-500 uppercase tracking-wider block">
                    {item.manufacturer}
                  </span>

                  <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                    {item.name}
                  </h4>

                  {item.active_ingredient && (
                    <div className="text-[11px] text-slate-600 dark:text-zinc-400 font-mono">
                      Active: <span className="text-slate-800 dark:text-zinc-200">{item.active_ingredient}</span>
                    </div>
                  )}

                  {/* Target Crops */}
                  {item.target_crops && item.target_crops.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-0.5">
                      {item.target_crops.slice(0, 4).map((crop, cIdx) => (
                        <span
                          key={cIdx}
                          className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-zinc-400 border border-slate-200/60 dark:border-white/5 font-medium"
                        >
                          {crop}
                        </span>
                      ))}
                    </div>
                  )}

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
                  <div className="p-2 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100/80 dark:border-emerald-800/30 text-[11px] text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="line-clamp-1">{item.application_rate}</span>
                  </div>
                </div>
              </div>

              {/* Price & Action Row */}
              <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between gap-2">
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">MRP Price</span>
                  <span className="text-base font-bold font-mono text-emerald-600 dark:text-emerald-400">
                    ৳{item.price_bdt.toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleContact(item.id)}
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 text-slate-600 dark:text-zinc-300 transition-colors cursor-pointer text-xs flex items-center gap-1"
                    title={item.dealer_contact}
                  >
                    {isCopied ? (
                      <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                        <CheckCircle2 className="w-3 h-3" /> 16500
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        <span className="text-[11px]">Hotline</span>
                      </span>
                    )}
                  </button>

                  <a
                    href={item.ecom_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors cursor-pointer shadow-xs"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>View on Aronno</span>
                    <ExternalLink className="w-3 h-3 ml-0.5 opacity-80" />
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
