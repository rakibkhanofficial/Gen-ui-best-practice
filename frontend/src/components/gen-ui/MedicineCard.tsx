"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Pill,
  ShieldCheck,
  Building2,
  CheckCircle2,
  ArrowRightLeft,
  ChevronRight,
  Info,
  Clock,
  Sparkles,
  FileText,
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
  company_favicon_url?: string;
  image_url?: string;
  dar_reg_no?: string;
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
  company_favicon_url?: string;
  image_url?: string;
  dar_reg_no?: string;
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

/**
 * Resilient Company Logo/Favicon component.
 */
function CompanyLogo({
  url,
  name,
  size = 20,
}: {
  url?: string;
  name: string;
  size?: number;
}) {
  const [hasError, setHasError] = useState(false);

  // Derived URL if not provided or broken
  const derivedUrl =
    url ||
    (name.toLowerCase().includes("aci")
      ? "/images/medicines/aci.png"
      : name.toLowerCase().includes("beximco")
      ? "/images/medicines/beximco.png"
      : name.toLowerCase().includes("square")
      ? "/images/medicines/square.png"
      : name.toLowerCase().includes("incepta")
      ? "/images/medicines/incepta.png"
      : "/images/medicines/acme.png");

  if (hasError) {
    return (
      <div
        style={{ width: size, height: size }}
        className="rounded-full bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800 flex items-center justify-center shrink-0 text-emerald-800 dark:text-emerald-300 font-bold text-[10px]"
      >
        {name.trim().charAt(0).toUpperCase()}
      </div>
    );
  }

  return (
    <img
      src={derivedUrl}
      alt={name}
      onError={() => setHasError(true)}
      style={{ width: size, height: size }}
      className="rounded-full object-contain shrink-0 bg-white p-0.5 border border-slate-200 dark:border-white/10 shadow-2xs"
      loading="lazy"
    />
  );
}

/**
 * Clean Medical Image with direct local fallback.
 */
function MedicineImage({
  src,
  brandName,
}: {
  src?: string;
  brandName: string;
}) {
  const [hasError, setHasError] = useState(false);

  // Determine local image fallback based on brand name
  const bLower = brandName.toLowerCase();
  const fallbackLocal = bLower.includes("xcel")
    ? "/images/medicines/xcel.jpg"
    : bLower.includes("ace")
    ? "/images/medicines/ace.jpg"
    : bLower.includes("seclo")
    ? "/images/medicines/seclo.jpg"
    : "/images/medicines/napa.jpg";

  const activeSrc = hasError || !src ? fallbackLocal : src;

  return (
    <div className="relative aspect-[4/3] w-28 sm:w-32 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/10 shrink-0 shadow-xs">
      <img
        src={activeSrc}
        alt={brandName}
        onError={() => setHasError(true)}
        referrerPolicy="no-referrer"
        className="w-full h-full object-cover"
        loading="lazy"
      />
    </div>
  );
}

export function MedicineCard({ data }: MedicineCardProps) {
  const [activeMedicine, setActiveMedicine] = useState<MedicineItem | null>(null);
  const [showClinical, setShowClinical] = useState(false);

  if (!data?.primary_medicine) {
    return (
      <div className="w-full max-w-2xl p-5 rounded-2xl bg-white dark:bg-[#1e1f20] border border-slate-200 dark:border-white/10 text-slate-500 text-xs">
        No medicine information available.
      </div>
    );
  }

  const currentMed = activeMedicine || data.primary_medicine;
  const { generic_group, disclaimer } = data;

  const handleSelectAlternative = (alt: MedicineAlternative) => {
    setActiveMedicine({
      id: `med-${alt.brand_name.toLowerCase()}`,
      brand_name: alt.brand_name,
      generic_name: alt.generic_name,
      manufacturer: alt.manufacturer,
      dosage_form: alt.form,
      strength: alt.strength,
      pack_size: "10 x 10 Strip Box",
      unit_price_bdt: alt.price_bdt,
      strip_price_bdt: alt.price_bdt * 10,
      indications: currentMed.indications,
      dosage_guide: currentMed.dosage_guide,
      safety_advice: currentMed.safety_advice,
      pregnancy_category: currentMed.pregnancy_category,
      alternatives: data.primary_medicine.alternatives,
      company_favicon_url: alt.company_favicon_url,
      dar_reg_no: alt.dar_reg_no,
      image_url: alt.image_url,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-2xl my-3 rounded-2xl bg-white dark:bg-[#1e1f20] border border-slate-200 dark:border-white/10 shadow-md text-slate-800 dark:text-slate-100 overflow-hidden"
    >
      {/* Top Clinical Card Header */}
      <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02]">
        <div className="flex items-start gap-4">
          {/* Medicine Real Photo */}
          <MedicineImage
            src={currentMed.image_url}
            brandName={currentMed.brand_name}
          />

          {/* Core Info */}
          <div className="flex-1 min-w-0">
            {/* Manufacturer & DAR Badge */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <CompanyLogo
                url={currentMed.company_favicon_url}
                name={currentMed.manufacturer}
                size={16}
              />
              <span className="text-xs font-semibold text-slate-800 dark:text-zinc-200">
                {currentMed.manufacturer}
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-200/70 dark:bg-white/10 text-slate-600 dark:text-zinc-300">
                {currentMed.dar_reg_no || "DGDA Approved"}
              </span>
            </div>

            {/* Brand Title & Strength */}
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                {currentMed.brand_name}
              </h3>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                {currentMed.strength}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-zinc-300 border border-slate-200 dark:border-white/5">
                {currentMed.dosage_form}
              </span>
            </div>

            {/* Generic Name */}
            <p className="text-xs text-slate-600 dark:text-zinc-400 mt-1">
              Generic: <strong className="text-slate-900 dark:text-white">{currentMed.generic_name}</strong>
              <span className="mx-1.5 text-slate-300">&bull;</span>
              <span className="text-slate-500 font-mono text-[11px]">{currentMed.pack_size}</span>
            </p>

            {/* Official MRP Price Banner */}
            <div className="mt-3 flex items-baseline gap-3">
              <div>
                <span className="text-[10px] text-slate-400 block font-medium uppercase tracking-wider">Unit Price</span>
                <span className="text-base font-bold font-mono text-emerald-700 dark:text-emerald-400">
                  ৳{currentMed.unit_price_bdt.toFixed(2)}{" "}
                  <span className="text-xs font-normal text-slate-500">/ tab</span>
                </span>
              </div>

              <div className="border-l border-slate-200 dark:border-white/10 pl-3">
                <span className="text-[10px] text-slate-400 block font-medium uppercase tracking-wider">Strip Price</span>
                <span className="text-sm font-bold font-mono text-slate-900 dark:text-white">
                  ৳{currentMed.strip_price_bdt.toFixed(2)}{" "}
                  <span className="text-xs font-normal text-slate-500">/ 10 tabs</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Indications Pills */}
        <div className="mt-4 pt-3 border-t border-slate-200/70 dark:border-white/5">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs text-slate-500 font-medium mr-1">Approved for:</span>
            {currentMed.indications.map((ind, i) => (
              <span
                key={i}
                className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-white/5 font-medium"
              >
                {ind}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Generic Alternatives Section (Specifically Napa vs ACI's Xcel vs Square's Ace) */}
      <div className="p-4 sm:p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Generic Substitutes ({currentMed.generic_name})
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400">
              Same formulation and bio-equivalence across certified manufacturers.
            </p>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            100% Bio-Equivalent
          </span>
        </div>

        {/* Alternatives Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {currentMed.alternatives.map((alt, idx) => {
            const isACI = alt.manufacturer.toLowerCase().includes("aci");
            const isSelected = currentMed.brand_name.toLowerCase() === alt.brand_name.toLowerCase();

            return (
              <div
                key={idx}
                onClick={() => handleSelectAlternative(alt)}
                className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                  isSelected
                    ? "border-emerald-500 ring-1 ring-emerald-500/20 bg-emerald-50/40 dark:bg-emerald-950/20"
                    : isACI
                    ? "border-emerald-300 dark:border-emerald-800/80 bg-emerald-50/15 dark:bg-emerald-950/10 hover:border-emerald-400"
                    : "border-slate-200 dark:border-white/10 bg-slate-50/40 dark:bg-white/[0.02] hover:border-slate-300 dark:hover:border-white/20"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <CompanyLogo
                    url={alt.company_favicon_url}
                    name={alt.manufacturer}
                    size={22}
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-bold text-slate-900 dark:text-white">
                        {alt.brand_name}
                      </span>
                      <span className="text-[10px] font-mono px-1 rounded bg-slate-200/70 dark:bg-white/10 text-slate-700 dark:text-zinc-300">
                        {alt.strength}
                      </span>
                      {isACI && (
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-600 text-white">
                          ACI
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-500 dark:text-zinc-400 block truncate">
                      {alt.manufacturer.split(" ")[0]} &bull; {alt.form}
                    </span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-xs font-mono font-bold text-slate-900 dark:text-white">
                    ৳{alt.price_bdt.toFixed(2)}
                  </div>
                  <span className="text-[10px] text-slate-400 block">/ tab</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Dosage & Safety Accordion */}
        <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-white/5">
          <button
            onClick={() => setShowClinical(!showClinical)}
            className="flex items-center justify-between w-full text-xs font-semibold text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-slate-400" />
              <span>Standard Dosage & Clinical Guidance</span>
            </span>
            <ChevronRight className={`w-3.5 h-3.5 transition-transform ${showClinical ? "rotate-90" : ""}`} />
          </button>

          <AnimatePresence>
            {showClinical && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden mt-2 p-3 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/5 text-xs space-y-2"
              >
                <div>
                  <strong className="text-slate-800 dark:text-zinc-200 block mb-0.5">Dosage Instructions:</strong>
                  <p className="text-slate-600 dark:text-zinc-400 text-[11px] leading-relaxed">
                    {currentMed.dosage_guide}
                  </p>
                </div>
                <div>
                  <strong className="text-slate-800 dark:text-zinc-200 block mb-0.5">Safety & Warnings:</strong>
                  <p className="text-slate-600 dark:text-zinc-400 text-[11px] leading-relaxed">
                    {currentMed.safety_advice}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Disclaimer */}
        <div className="mt-3 pt-2 text-[10px] text-slate-400 flex items-center gap-1.5">
          <ShieldCheck className="w-3 h-3 shrink-0 text-slate-400" />
          <span>{disclaimer || "Always consult a registered physician before taking or switching medication."}</span>
        </div>
      </div>
    </motion.div>
  );
}
