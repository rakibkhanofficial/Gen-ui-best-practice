"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ExternalLink,
  ChevronDown,
  Phone,
  CheckCircle2,
  Sparkles,
  Info,
  ShieldCheck,
  Sprout,
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
 * Clean Product Image with seamless local fallback
 */
function ProductCanvas({
  src,
  name,
  packSize,
}: {
  src: string;
  name: string;
  packSize: string;
}) {
  const [hasError, setHasError] = useState(false);

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
    <div className="relative h-48 w-full bg-slate-50/80 dark:bg-white/[0.03] rounded-2xl flex items-center justify-center p-5 overflow-hidden border border-slate-100 dark:border-white/5 group-hover:bg-slate-100/70 dark:group-hover:bg-white/[0.05] transition-colors">
      <img
        src={activeSrc}
        alt={name}
        onError={() => setHasError(true)}
        className="max-h-full max-w-full object-contain filter drop-shadow-xs transition-transform duration-300 group-hover:scale-105"
        loading="lazy"
      />
      <div className="absolute top-3 right-3 px-2 py-0.5 rounded-md bg-white/90 dark:bg-zinc-800/90 backdrop-blur-xs text-[10px] font-mono font-semibold text-slate-700 dark:text-zinc-300 border border-slate-200/80 dark:border-white/10 shadow-2xs">
        {packSize}
      </div>
    </div>
  );
}

export function AgriProductCard({ data }: AgriProductCardProps) {
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!data?.products || data.products.length === 0) {
    return (
      <div className="w-full max-w-3xl p-5 rounded-2xl bg-white dark:bg-[#1e1f20] border border-slate-200 dark:border-white/10 text-slate-500 text-xs">
        No agricultural products available.
      </div>
    );
  }

  const { products, seasonal_advice } = data;

  // Extract clean unique categories for tabs
  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.category.includes("PGR") || p.category.includes("Growth")) set.add("PGR & Bio");
      else if (p.category.includes("Pesticide") || p.category.includes("Crop Care") || p.category.includes("Fungicide")) set.add("Crop Protection");
      else if (p.category.includes("Fertilizer")) set.add("Fertilizers");
      else set.add(p.category.split("&")[0].trim());
    });
    return ["All", ...Array.from(set)];
  }, [products]);

  // Filter products by selected tab
  const filteredProducts = useMemo(() => {
    if (activeCategory === "All") return products;
    return products.filter((p) => {
      const cat = p.category.toLowerCase();
      if (activeCategory === "PGR & Bio") return cat.includes("pgr") || cat.includes("growth") || cat.includes("bio");
      if (activeCategory === "Crop Protection") return cat.includes("pesticide") || cat.includes("crop care") || cat.includes("fungicide") || cat.includes("acaricide");
      if (activeCategory === "Fertilizers") return cat.includes("fertiliz") || cat.includes("bonemil");
      return p.category.includes(activeCategory);
    });
  }, [products, activeCategory]);

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const handleCopyHotline = (id: string) => {
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-3xl my-3 rounded-2xl bg-white dark:bg-[#1e1f20] border border-slate-200/90 dark:border-white/10 shadow-lg text-slate-800 dark:text-zinc-100 overflow-hidden"
    >
      {/* Sleek, Modern Brand Header */}
      <div className="p-5 border-b border-slate-200/80 dark:border-white/10 bg-slate-50/40 dark:bg-black/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Sprout className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                  ACI Agribusiness
                </h3>
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/40 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                  <span>Verified Catalog</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                Official Crop Care, Bio-Fertilizers & PGR Products
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            <a
              href="https://aciaronno.com/collections/all"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 border border-slate-200/80 dark:border-white/10 flex items-center gap-1.5 transition-colors shadow-2xs"
            >
              <span>Explore Store</span>
              <ExternalLink className="w-3 h-3 opacity-70" />
            </a>
          </div>
        </div>

        {/* Clean Category Filter Tabs */}
        <div className="flex items-center gap-1.5 mt-4 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all shrink-0 cursor-pointer ${
                  isActive
                    ? "bg-emerald-600 text-white shadow-xs font-semibold"
                    : "bg-white dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-600 dark:text-zinc-400 border border-slate-200/60 dark:border-white/5"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Product Cards Grid */}
      <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {filteredProducts.map((item) => {
          const isExpanded = expandedId === item.id;
          const isCopied = copiedId === item.id;
          const primaryBenefit = item.key_benefits?.[0] || "Certified high-performance formulation.";

          return (
            <motion.div
              key={item.id}
              layout
              className="rounded-2xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-[#202123] hover:border-emerald-500/40 dark:hover:border-emerald-500/30 transition-all flex flex-col justify-between p-4 shadow-xs group"
            >
              <div>
                {/* Product Canvas */}
                <ProductCanvas
                  src={item.image_url}
                  name={item.name}
                  packSize={item.pack_size}
                />

                {/* Info Hierarchy */}
                <div className="mt-3.5 space-y-1.5">
                  <div className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                    {item.manufacturer.split("(")[0].trim()}
                  </div>

                  <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                    {item.name}
                  </h4>

                  <p className="text-xs text-slate-600 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                    {primaryBenefit}
                  </p>
                </div>
              </div>

              {/* Price & Primary Action */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/5 space-y-2.5">
                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-medium block">Price</span>
                    <span className="text-lg font-bold font-mono text-slate-900 dark:text-white">
                      ৳{item.price_bdt.toLocaleString()}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleExpand(item.id)}
                    className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-zinc-200 flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <span>{isExpanded ? "Hide Specs" : "View Specs"}</span>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                  </button>
                </div>

                {/* Expandable Agronomic Specifications */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden space-y-2 pt-2 border-t border-slate-100 dark:border-white/5 text-[11px]"
                    >
                      {item.active_ingredient && (
                        <div>
                          <span className="text-slate-400 font-medium block">Active Ingredient:</span>
                          <span className="text-slate-800 dark:text-zinc-200 font-mono">
                            {item.active_ingredient}
                          </span>
                        </div>
                      )}

                      <div>
                        <span className="text-slate-400 font-medium block">Application Guide:</span>
                        <span className="text-slate-700 dark:text-zinc-300">
                          {item.application_rate}
                        </span>
                      </div>

                      {item.target_crops && item.target_crops.length > 0 && (
                        <div>
                          <span className="text-slate-400 font-medium block mb-1">Target Crops:</span>
                          <div className="flex flex-wrap gap-1">
                            {item.target_crops.slice(0, 4).map((crop, idx) => (
                              <span
                                key={idx}
                                className="px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-zinc-400 text-[10px]"
                              >
                                {crop}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 pt-1">
                  <a
                    href={item.ecom_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-98"
                  >
                    <span>Buy on Aronno</span>
                    <ExternalLink className="w-3 h-3 opacity-80" />
                  </a>

                  <button
                    type="button"
                    onClick={() => handleCopyHotline(item.id)}
                    className="p-2 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 text-slate-600 dark:text-zinc-300 transition-colors cursor-pointer text-xs"
                    title="Call ACI Agro Hotline 16500"
                  >
                    {isCopied ? (
                      <span className="flex items-center gap-1 font-bold text-emerald-600 text-[11px] px-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> 16500
                      </span>
                    ) : (
                      <Phone className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Advisory Footer */}
      {seasonal_advice && (
        <div className="p-3.5 mx-5 mb-5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-800/30 flex items-start gap-2.5 text-xs text-emerald-900 dark:text-emerald-300">
          <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <p className="text-[11px] leading-relaxed font-medium">{seasonal_advice}</p>
        </div>
      )}
    </motion.div>
  );
}
