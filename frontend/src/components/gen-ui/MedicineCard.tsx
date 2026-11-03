"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Pill,
  ShieldCheck,
  Building2,
  Check,
  ShoppingCart,
  AlertCircle,
  Sparkles,
  ArrowRightLeft,
  ChevronRight,
  Info,
} from "lucide-react";

export interface MedicineAlternative {
  brand_name: string;
  generic_name: string;
  manufacturer: string;
  strength: string;
  form: string;
  price_bdt: number;
  is_requested?: boolean;
  highlights?: string;
}

export interface MedicineItem {
  id: string;
  brand_name: string;
  generic_name: string;
  manufacturer: string;
  dosage_form: string;
  strength: string;
  pack_size: string;
  unit_price_bdt: number;
  strip_price_bdt: number;
  indications: string[];
  dosage_guide: string;
  safety_advice: string;
  pregnancy_category: string;
  alternatives: MedicineAlternative[];
  ecommerce_available?: boolean;
  in_stock?: boolean;
}

export interface MedicineSearchData {
  query: string;
  primary_medicine: MedicineItem;
  alternatives_count: number;
  generic_group: string;
  disclaimer?: string;
}

interface MedicineCardProps {
  data?: MedicineSearchData;
}

export function MedicineCard({ data }: MedicineCardProps) {
  const [selectedAlt, setSelectedAlt] = useState<MedicineAlternative | null>(null);
  const [cartAdded, setCartAdded] = useState(false);
  const [activeTab, setActiveTab] = useState<"details" | "alternatives">("alternatives");

  if (!data?.primary_medicine) {
    return (
      <div className="w-full max-w-3xl p-5 rounded-2xl bg-white dark:bg-[#1e1f20] border border-slate-200 dark:border-white/10 text-slate-500 text-xs">
        No medicine information available.
      </div>
    );
  }

  const { primary_medicine: med, generic_group, disclaimer } = data;

  const handleAddToCart = () => {
    setCartAdded(true);
    setTimeout(() => setCartAdded(false), 2500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-3xl my-3 rounded-2xl bg-white dark:bg-[#1e1f20] border border-slate-200 dark:border-white/10 shadow-sm text-slate-800 dark:text-slate-100 overflow-hidden"
    >
      {/* Top Banner / Pharma Header */}
      <div className="p-5 border-b border-slate-200 dark:border-white/10 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent dark:from-emerald-950/30">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-emerald-600/30">
              <Pill className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                  {med.brand_name}
                </h3>
                <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-300/60 dark:border-emerald-800/60">
                  {med.strength}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-zinc-300 border border-slate-200 dark:border-white/5">
                  {med.dosage_form}
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-zinc-400 font-medium mt-0.5 flex items-center gap-1.5">
                <span>Generic:</span>
                <strong className="text-slate-900 dark:text-zinc-200">{med.generic_name}</strong>
                <span>&bull;</span>
                <span className="text-emerald-700 dark:text-emerald-400">{med.manufacturer}</span>
              </p>
            </div>
          </div>

          {/* Pricing & Cart Action */}
          <div className="flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200 dark:border-white/10 shrink-0">
            <div>
              <span className="text-[11px] text-slate-500 dark:text-zinc-400 block sm:text-right">Unit Price</span>
              <div className="text-lg font-bold text-slate-900 dark:text-white font-mono">
                ৳{med.unit_price_bdt.toFixed(2)}{" "}
                <span className="text-xs font-normal text-slate-500">/ tab</span>
              </div>
            </div>

            <button
              onClick={handleAddToCart}
              className={`mt-1 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer shadow-xs ${
                cartAdded
                  ? "bg-emerald-600 text-white"
                  : "bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-zinc-200"
              }`}
            >
              {cartAdded ? (
                <>
                  <Check className="w-3.5 h-3.5 text-white" />
                  <span>Added to Cart</span>
                </>
              ) : (
                <>
                  <ShoppingCart className="w-3.5 h-3.5" />
                  <span>Order Now</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Navigation Tabs (Alternatives vs Clinical Guide) */}
        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-200/70 dark:border-white/5">
          <button
            onClick={() => setActiveTab("alternatives")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              activeTab === "alternatives"
                ? "bg-emerald-600 text-white shadow-xs"
                : "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-white/10"
            }`}
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            <span>Generic Alternatives ({med.alternatives.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("details")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              activeTab === "details"
                ? "bg-emerald-600 text-white shadow-xs"
                : "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-white/10"
            }`}
          >
            <Info className="w-3.5 h-3.5" />
            <span>Clinical Usage & Dosage</span>
          </button>
        </div>
      </div>

      {/* Main Tab Content */}
      <div className="p-4 sm:p-5">
        {activeTab === "alternatives" ? (
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider">
                  Verified Generic Substitutes ({med.generic_name})
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                  Exact same molecular formulation and therapeutic efficacy across certified pharmaceutical manufacturers.
                </p>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-zinc-400">
                100% Bio-Equivalent
              </span>
            </div>

            {/* Alternatives Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {med.alternatives.map((alt, idx) => {
                const isACI = alt.manufacturer.toLowerCase().includes("aci");
                const isSquare = alt.manufacturer.toLowerCase().includes("square");
                const isBeximco = alt.manufacturer.toLowerCase().includes("beximco");

                return (
                  <motion.div
                    key={idx}
                    whileHover={{ y: -2 }}
                    className={`p-3.5 rounded-xl border transition-all ${
                      isACI
                        ? "border-emerald-300 dark:border-emerald-800/80 bg-emerald-50/40 dark:bg-emerald-950/20 ring-1 ring-emerald-500/20"
                        : "border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02] hover:border-slate-300 dark:hover:border-white/20"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-sm font-bold text-slate-900 dark:text-white">
                            {alt.brand_name}
                          </span>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-200/80 dark:bg-white/10 text-slate-700 dark:text-zinc-300">
                            {alt.strength}
                          </span>
                          {isACI && (
                            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-emerald-600 text-white shadow-2xs">
                              ACI
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1 text-xs text-slate-600 dark:text-zinc-400 mt-1">
                          <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="font-medium truncate">{alt.manufacturer}</span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="text-xs font-mono font-bold text-slate-900 dark:text-white">
                          ৳{alt.price_bdt.toFixed(2)}
                        </div>
                        <span className="text-[10px] text-slate-500 block">/ unit</span>
                      </div>
                    </div>

                    {alt.highlights && (
                      <div className="mt-2 text-[11px] px-2 py-1 rounded-md bg-white dark:bg-black/30 border border-slate-200/60 dark:border-white/5 text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-emerald-500 shrink-0" />
                        <span className="truncate">{alt.highlights}</span>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        ) : (
          /* Clinical Details & Dosage */
          <div className="space-y-4 text-xs">
            {/* Indications */}
            <div>
              <span className="font-semibold text-slate-900 dark:text-white block mb-1.5">
                Primary Indications:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {med.indications.map((ind, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/40 font-medium"
                  >
                    {ind}
                  </span>
                ))}
              </div>
            </div>

            {/* Dosage Guide */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/5">
              <strong className="text-slate-900 dark:text-white block mb-1">Standard Adult Dosage:</strong>
              <p className="text-slate-600 dark:text-zinc-300 leading-relaxed">{med.dosage_guide}</p>
            </div>

            {/* Safety & Pregnancy */}
            <div className="p-3 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/30 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-amber-900 dark:text-amber-200 mb-0.5">
                  Clinical Safety & Pregnancy Category ({med.pregnancy_category})
                </div>
                <p className="text-amber-800/90 dark:text-amber-300/80 leading-relaxed">
                  {med.safety_advice}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Footer Disclaimer */}
        {disclaimer && (
          <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-white/5 flex items-center gap-1.5 text-[11px] text-slate-400 dark:text-zinc-500">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span>{disclaimer}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
